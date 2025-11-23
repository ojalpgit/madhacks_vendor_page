import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { authMiddleware, AuthRequest, requireRole } from '../utils/auth';
import { btcToSbtc, formatBtc, formatSbtc } from '../utils/constants';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(requireRole('VENDOR'));

// Add product
const addProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceBtc: z.number().positive(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

router.post('/add-product', async (req: AuthRequest, res) => {
  try {
    const { name, description, priceBtc, imageUrl } = addProductSchema.parse(req.body);
    const priceSbtc = btcToSbtc(priceBtc);

    const product = await prisma.product.create({
      data: {
        vendorId: req.userId!,
        name,
        description: description || null,
        priceBtc,
        priceSbtc,
        imageUrl: imageUrl || null,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update product
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceBtc: z.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

router.put('/products/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = updateProductSchema.parse(req.body);

    // Check if product belongs to vendor
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.vendorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const dataToUpdate: any = { ...updateData };
    if (updateData.priceBtc !== undefined) {
      dataToUpdate.priceSbtc = btcToSbtc(updateData.priceBtc);
    }

    const product = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(product);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if product belongs to vendor
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.vendorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor products
router.get('/products', async (req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { vendorId: req.userId! },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create QR order
const createQROrderSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    priceBtc: z.number().positive(),
    priceSbtc: z.number().positive(),
  })),
});

router.post('/create-qr-order', async (req: AuthRequest, res) => {
  try {
    const { cartItems } = createQROrderSchema.parse(req.body);

    // Validate all products belong to vendor
    const productIds = cartItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        vendorId: req.userId!,
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products not found or not owned by vendor' });
    }

    // Calculate totals
    const totalBTC = cartItems.reduce((sum, item) => sum + item.priceBtc * item.quantity, 0);
    const totalSbtc = cartItems.reduce((sum, item) => sum + item.priceSbtc * item.quantity, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        vendorId: req.userId!,
        totalBtc: totalBTC,
        totalSbtc: totalSbtc,
        status: 'pending',
        qrCodeData: randomUUID(),
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
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create QR data JSON
    const qrData = {
      vendorId: req.userId!,
      orderId: order.id,
      cartItems: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceBtc: item.priceBtc,
        priceSbtc: item.priceSbtc,
      })),
      totalBTC: parseFloat(formatBtc(totalBTC)),
      totalSbtc: parseFloat(formatSbtc(totalSbtc)),
    };

    res.json({
      order,
      qrData,
      qrCodeData: JSON.stringify(qrData),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get vendor transactions
router.get('/transactions', async (req: AuthRequest, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        receiverId: req.userId!,
      },
      include: {
        sender: {
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
      take: 100,
    });

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor dashboard stats
router.get('/dashboard/stats', async (req: AuthRequest, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.userId! },
    });

    const totalTransactions = await prisma.transaction.count({
      where: {
        receiverId: req.userId!,
        status: 'COMPLETED',
      },
    });

    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        receiverId: req.userId!,
        status: 'COMPLETED',
        type: 'PAYMENT',
      },
      _sum: {
        amountBtc: true,
        amountSbtc: true,
      },
    });

    const totalProducts = await prisma.product.count({
      where: { vendorId: req.userId! },
    });

    res.json({
      wallet: wallet ? {
        btc: parseFloat(formatBtc(wallet.btcBalance)),
        sbtc: parseFloat(formatSbtc(wallet.sbtcBalance)),
        btcFormatted: formatBtc(wallet.btcBalance),
        sbtcFormatted: formatSbtc(wallet.sbtcBalance),
      } : null,
      totalTransactions,
      totalRevenue: {
        btc: totalRevenue._sum.amountBtc || 0,
        sbtc: totalRevenue._sum.amountSbtc || 0,
        btcFormatted: formatBtc(totalRevenue._sum.amountBtc || 0),
        sbtcFormatted: formatSbtc(totalRevenue._sum.amountSbtc || 0),
      },
      totalProducts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Charge card (dummy payment from vendor)
const chargeCardSchema = z.object({
  cardNumber: z.string().min(13).max(19),
  amount: z.number().positive(),
});

router.post('/charge-card', async (req: AuthRequest, res) => {
  try {
    const { cardNumber, amount } = chargeCardSchema.parse(req.body);

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
    const btcAmount = amount * 0.00002;
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
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;

