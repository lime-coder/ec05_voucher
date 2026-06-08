import prisma from './config/db';

async function main() {
  const result = await prisma.$queryRaw`
    SELECT obj.name AS constraint_name,
           def.definition AS constraint_definition
    FROM sys.check_constraints def
    JOIN sys.objects obj ON obj.object_id = def.object_id
    WHERE obj.name = 'CK_TrangThaiTaiKhoan'
  `;
  console.log(result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
