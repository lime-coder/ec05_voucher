import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching accounts...');
  const accounts = await prisma.taiKhoan.findMany();
  
  let updatedCount = 0;
  for (const acc of accounts) {
    // bcrypt hashes are 60 characters long
    if (acc.MatKhau && acc.MatKhau.length < 60) {
      console.log(`Hashing password for user: ${acc.TenDangNhap}`);
      const hashedPassword = await bcrypt.hash(acc.MatKhau, 10);
      await prisma.taiKhoan.update({
        where: { IDTaiKhoan: acc.IDTaiKhoan },
        data: { MatKhau: hashedPassword }
      });
      updatedCount++;
    }
  }
  
  console.log(`Successfully updated ${updatedCount} passwords.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
