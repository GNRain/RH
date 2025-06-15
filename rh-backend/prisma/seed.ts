// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const roundsOfHashing = 10;

async function main() {
  const adminCin = '11111111';
  const adminUserExists = await prisma.user.findUnique({
    where: { cin: adminCin },
  });

  if (!adminUserExists) {
    const hashedPassword = await bcrypt.hash('Ghaithnaoueli199', roundsOfHashing);
    const adminUser = await prisma.user.create({
      data: {
        name: 'Ghaith',
        familyName: 'Naouali',
        cin: adminCin,
        position: 'Head of HR',
        department: 'HR',
        password: hashedPassword,
        email: 'ghaith.naoueli@gmail.com',
        phoneNumber: '93038322',
      },
    });
    console.log(`✅ Created RH Admin user: ${adminUser.name} ${adminUser.familyName}`);
  } else {
    // If user exists, ensure they have the HR department
    await prisma.user.update({
        where: { cin: adminCin },
        data: { department: 'HR' }
    });
    console.log('ℹ️ RH Admin user already exists. Ensured HR department is set.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });