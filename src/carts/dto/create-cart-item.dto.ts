import { IsNumber, IsPositive, IsString } from "class-validator";

export class CreateCartItemDto {

  @IsString()
  readonly productId: string;

  @IsNumber()
  @IsPositive()
  readonly quantity: number;

  @IsNumber()
  readonly price: number;

  @IsNumber()
  readonly discountRate: number;
}