import { PrismaClient } from '@prisma/client';

// Initialize the Prisma Client
// This single instance will be imported by all services to query the database
const prisma = new PrismaClient();

export default prisma;
