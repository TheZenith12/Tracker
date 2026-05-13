import { IsString, IsEnum, IsNumber, IsPositive, IsOptional, IsDateString } from 'class-validator';
import { TransactionType, RecurringFrequency } from '@prisma/client';

export class CreateRecurringDto {
  @IsString()
  title: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  accountId: string;

  @IsEnum(RecurringFrequency)
  @IsOptional()
  frequency?: RecurringFrequency;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
