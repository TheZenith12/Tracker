import { IsString, IsNumber, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @IsString()
  categoryId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsNumber()
  @Min(2020)
  year: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  limit: number;
}
