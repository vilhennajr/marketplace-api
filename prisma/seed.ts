import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Company manager',
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { name: 'member' },
    update: {},
    create: {
      name: 'member',
      description: 'Company member',
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'customer' },
    update: {},
    create: {
      name: 'customer',
      description: 'Customer user',
    },
  });

  console.log('✅ Roles created');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: {},
    create: {
      email: 'admin@marketplace.com',
      password: hashedPassword,
      name: 'Admin User',
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created (admin@marketplace.com / admin123)');

  // Create Categories
  const categories = [
    { name: 'Eletrônicos', slug: 'eletronicos', description: 'Produtos eletrônicos' },
    { name: 'Alimentos', slug: 'alimentos', description: 'Produtos alimentícios' },
    { name: 'Vestuário', slug: 'vestuario', description: 'Roupas e acessórios' },
    { name: 'Artesanato', slug: 'artesanato', description: 'Produtos artesanais' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
  }

  console.log('✅ Categories created');

  // Create Companies
  const company1 = await prisma.company.upsert({
    where: { slug: 'tech-solutions' },
    update: {},
    create: {
      name: 'Tech Solutions',
      slug: 'tech-solutions',
      description: 'Empresa de tecnologia e eletrônicos',
      email: 'contato@techsolutions.com',
      phone: '11 99999-9999',
      isActive: true,
    },
  });

  const company2 = await prisma.company.upsert({
    where: { slug: 'organic-foods' },
    update: {},
    create: {
      name: 'Organic Foods',
      slug: 'organic-foods',
      description: 'Alimentos orgânicos e naturais',
      email: 'contato@organicfoods.com',
      phone: '11 88888-8888',
      isActive: true,
    },
  });

  console.log('✅ Companies created');

  // Create Products
  const products = [
    {
      name: 'Notebook Dell Inspiron',
      slug: 'notebook-dell-inspiron',
      description: 'Notebook Dell com processador i5, 8GB RAM, 256GB SSD',
      price: 3499.90,
      stock: 10,
      categoryId: createdCategories[0].id,
      companyId: company1.id,
      isActive: true,
    },
    {
      name: 'Mouse Logitech MX Master',
      slug: 'mouse-logitech-mx-master',
      description: 'Mouse ergonômico sem fio',
      price: 449.90,
      stock: 25,
      categoryId: createdCategories[0].id,
      companyId: company1.id,
      isActive: true,
    },
    {
      name: 'Arroz Integral Orgânico 1kg',
      slug: 'arroz-integral-organico-1kg',
      description: 'Arroz integral orgânico sem agrotóxicos',
      price: 15.90,
      stock: 100,
      categoryId: createdCategories[1].id,
      companyId: company2.id,
      isActive: true,
    },
    {
      name: 'Mel Orgânico 500g',
      slug: 'mel-organico-500g',
      description: 'Mel puro de abelhas orgânicas',
      price: 35.90,
      stock: 50,
      categoryId: createdCategories[1].id,
      companyId: company2.id,
      isActive: true,
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }

  console.log('✅ Products created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
