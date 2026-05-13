import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Default categories
  const defaultCategories = [
    { name: 'Хоол', nameEn: 'Food', icon: 'utensils', color: '#F97316', type: TransactionType.EXPENSE },
    { name: 'Тээвэр', nameEn: 'Transport', icon: 'car', color: '#3B82F6', type: TransactionType.EXPENSE },
    { name: 'Түрээс', nameEn: 'Rent', icon: 'home', color: '#8B5CF6', type: TransactionType.EXPENSE },
    { name: 'Эрүүл мэнд', nameEn: 'Health', icon: 'heart', color: '#EF4444', type: TransactionType.EXPENSE },
    { name: 'Боловсрол', nameEn: 'Education', icon: 'book', color: '#10B981', type: TransactionType.EXPENSE },
    { name: 'Зугаа цэнгэл', nameEn: 'Entertainment', icon: 'gamepad', color: '#F59E0B', type: TransactionType.EXPENSE },
    { name: 'Дэлгүүр', nameEn: 'Shopping', icon: 'shopping-bag', color: '#EC4899', type: TransactionType.EXPENSE },
    { name: 'Бусад зардал', nameEn: 'Other Expense', icon: 'more-horizontal', color: '#6B7280', type: TransactionType.EXPENSE },
    { name: 'Цалин', nameEn: 'Salary', icon: 'briefcase', color: '#10B981', type: TransactionType.INCOME },
    { name: 'Бизнес', nameEn: 'Business', icon: 'trending-up', color: '#3B82F6', type: TransactionType.INCOME },
    { name: 'Хөрөнгө оруулалт', nameEn: 'Investment', icon: 'bar-chart', color: '#8B5CF6', type: TransactionType.INCOME },
    { name: 'Бусад орлого', nameEn: 'Other Income', icon: 'plus-circle', color: '#6B7280', type: TransactionType.INCOME },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { id: cat.nameEn },
      update: {},
      create: { ...cat, isDefault: true },
    });
  }

  console.log('✅ Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
