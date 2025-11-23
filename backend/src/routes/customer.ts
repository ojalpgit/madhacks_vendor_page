import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest, requireRole } from '../utils/auth';
import { btcToSbtc, sbtcToBtc, formatBtc, formatSbtc } from '../utils/constants';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(requireRole('CUSTOMER'));

// Get balance
router.get('/balance', async (req: AuthRequest, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.userId! },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      btc: parseFloat(formatBtc(wallet.btcBalance)),
      sbtc: parseFloat(formatSbtc(wallet.sbtcBalance)),
      btcFormatted: formatBtc(wallet.btcBalance),
      sbtcFormatted: formatSbtc(wallet.sbtcBalance),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add funds with dummy card
const addFundsSchema = z.object({
  cardNumber: z.string().min(13).max(19),
  amount: z.number().positive(),
  cardHolderName: z.string().min(1),
  expiryDate: z.string(),
  cvv: z.string().min(3).max(4),
});

router.post('/add-funds-card', async (req: AuthRequest, res) => {
  try {
    const { cardNumber, amount } = addFundsSchema.parse(req.body);

    // Dummy card logic: card starting with 4242 = success
    if (!cardNumber.startsWith('4242')) {
      return res.status(400).json({ error: 'Payment failed. Please use a card starting with 4242 for demo.' });
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.userId! },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Add funds (convert USD amount to BTC - dummy conversion)
    // For demo: $100 = 0.002 BTC (simplified)
    const btcAmount = amount * 0.00002; // Dummy conversion rate
    const sbtcAmount = btcToSbtc(btcAmount);

    // Update wallet
    const updatedWallet = await prisma.wallet.update({
      where: { userId: req.userId! },
      data: {
        btcBalance: {
          increment: btcAmount,
        },
        sbtcBalance: {
          increment: sbtcAmount,
        },
      },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        senderId: req.userId!,
        receiverId: req.userId!,
        amountBtc: btcAmount,
        amountSbtc: sbtcAmount,
        type: 'ADD_FUNDS',
        status: 'COMPLETED',
        description: `Added funds via card: $${amount}`,
      },
    });

    res.json({
      success: true,
      balance: {
        btc: parseFloat(formatBtc(updatedWallet.btcBalance)),
        sbtc: parseFloat(formatSbtc(updatedWallet.sbtcBalance)),
        btcFormatted: formatBtc(updatedWallet.btcBalance),
        sbtcFormatted: formatSbtc(updatedWallet.sbtcBalance),
      },
      added: {
        btc: btcAmount,
        sbtc: sbtcAmount,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Pay vendor (from QR code)
const paySchema = z.object({
  vendorId: z.string().uuid(),
  cartItems: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    priceBtc: z.number().positive(),
    priceSbtc: z.number().positive(),
  })),
  totalBTC: z.number().positive(),
  totalSbtc: z.number().positive(),
  orderId: z.string().optional(),
});

router.post('/pay', async (req: AuthRequest, res) => {
  try {
    const paymentData = paySchema.parse(req.body);
    const { vendorId, cartItems, totalBTC, totalSbtc, orderId } = paymentData;

    // Get customer wallet
    const customerWallet = await prisma.wallet.findUnique({
      where: { userId: req.userId! },
    });

    if (!customerWallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Check balance
    if (customerWallet.btcBalance < totalBTC) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get vendor wallet
    const vendorWallet = await prisma.wallet.findUnique({
      where: { userId: vendorId },
    });

    if (!vendorWallet) {
      return res.status(404).json({ error: 'Vendor wallet not found' });
    }

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from customer
      const updatedCustomerWallet = await tx.wallet.update({
        where: { userId: req.userId! },
        data: {
          btcBalance: {
            decrement: totalBTC,
          },
          sbtcBalance: {
            decrement: totalSbtc,
          },
        },
      });

      // Add to vendor
      const updatedVendorWallet = await tx.wallet.update({
        where: { userId: vendorId },
        data: {
          btcBalance: {
            increment: totalBTC,
          },
          sbtcBalance: {
            increment: totalSbtc,
          },
        },
      });

      // Create or update order
      let order;
      if (orderId) {
        order = await tx.order.update({
          where: { id: orderId },
          data: {
            customerId: req.userId!,
            status: 'completed',
          },
          include: {
            items: true,
          },
        });
      } else {
        // Create new order
        order = await tx.order.create({
          data: {
            vendorId,
            customerId: req.userId!,
            totalBtc: totalBTC,
            totalSbtc: totalSbtc,
            status: 'completed',
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                priceBtc: item.priceBtc,
                priceSbtc: item.priceSbtc,
              })),
            },
          },
          include: {
            items: true,
          },
        });
      }

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          senderId: req.userId!,
          receiverId: vendorId,
          amountBtc: totalBTC,
          amountSbtc: totalSbtc,
          type: 'PAYMENT',
          status: 'COMPLETED',
          orderId: order.id,
          description: `Payment to vendor`,
        },
      });

      return { order, transaction, updatedCustomerWallet };
    });

    res.json({
      success: true,
      order: result.order,
      transaction: result.transaction,
      newBalance: {
        btc: parseFloat(formatBtc(result.updatedCustomerWallet.btcBalance)),
        sbtc: parseFloat(formatSbtc(result.updatedCustomerWallet.sbtcBalance)),
        btcFormatted: formatBtc(result.updatedCustomerWallet.btcBalance),
        sbtcFormatted: formatSbtc(result.updatedCustomerWallet.sbtcBalance),
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
router.get('/transactions', async (req: AuthRequest, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: req.userId! },
          { receiverId: req.userId! },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

