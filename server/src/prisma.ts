console.log('DEBUG: prisma.ts loading');
import { PrismaClient } from '@prisma/client';

console.log('DEBUG: initializing PrismaClient');
export const prisma = new PrismaClient();
console.log('DEBUG: PrismaClient initialized');
