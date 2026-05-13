import { IsString, IsOptional, MinLength } from 'class-validator';
export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;
}
