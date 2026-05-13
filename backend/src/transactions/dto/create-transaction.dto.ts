import { IsString, IsEnum, IsNumber, IsPositive, IsOptional, IsDateString } from 'class-validator';
import { TransactionType, Currency } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  fromAccountId: string;

  @IsString()
  @IsOptional()
  toAccountId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
