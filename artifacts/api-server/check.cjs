const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  console.log('Services:', services.map(s => ({ id: s.id, name: s.name, spaId: s.spaId })));
  const products = await prisma.product.findMany();
  console.log('Products:', products.map(p => ({ id: p.id, name: p.name, spaId: p.spaId })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
