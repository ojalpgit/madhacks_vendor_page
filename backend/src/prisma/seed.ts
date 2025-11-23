import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';
import { btcToSbtc } from '../utils/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample vendor
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
      create: {
        email: 'vendor@example.com',
        password: await hashPassword('password123'),
        name: 'Demo Vendor',
        role: 'VENDOR' as any,
      wallet: {
        create: {
          btcBalance: 0.5,
          sbtcBalance: btcToSbtc(0.5),
        },
      },
    },
  });

  // Create sample products for vendor
  const products = [
    {
      name: 'Blueberries',
      description: 'Fresh organic blueberries',
      priceBtc: 0.00015,
      priceSbtc: btcToSbtc(0.00015),
    },
    {
      name: 'Coffee',
      description: 'Premium roast coffee',
      priceBtc: 0.00008,
      priceSbtc: btcToSbtc(0.00008),
    },
    {
      name: 'Sandwich',
      description: 'Delicious sandwich',
      priceBtc: 0.00012,
      priceSbtc: btcToSbtc(0.00012),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        id: `${vendor.id}-${product.name}`,
      },
      update: {},
      create: {
        vendorId: vendor.id,
        ...product,
      },
    });
  }

  // Create a sample customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
      create: {
        email: 'customer@example.com',
        password: await hashPassword('password123'),
        name: 'Demo Customer',
        role: 'CUSTOMER' as any,
      wallet: {
        create: {
          btcBalance: 0.1,
          sbtcBalance: btcToSbtc(0.1),
        },
      },
    },
  });

  console.log('✅ Seeding completed!');
  console.log('📧 Vendor:', vendor.email, '| Password: password123');
  console.log('📧 Customer:', customer.email, '| Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

