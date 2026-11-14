import type { ProductInterface } from '@bank/models';
import { IsDateString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ProductDto implements ProductInterface {
  @IsNotEmpty()
  id!: string;

  @MinLength(6)
  @MaxLength(100)
  name!: string;

  @MinLength(10)
  @MaxLength(200)
  description!: string;

  @IsNotEmpty()
  logo!: string;

  @IsDateString()
  date_release!: string;

  @IsDateString()
  date_revision!: string;
}
