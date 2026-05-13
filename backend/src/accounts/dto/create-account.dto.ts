import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { AccountType, Currency } from '@prisma/client';

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType = AccountType.CASH;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency = Currency.MNT;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
