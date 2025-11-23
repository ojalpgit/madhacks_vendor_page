import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../utils/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware
router.use(authMiddleware);

// List all users (for admin/debugging)
router.get('/list-users', async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        wallet: {
          select: {
            btcBalance: true,
            sbtcBalance: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

