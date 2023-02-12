import { IsNumber, IsPositive } from "class-validator";

export class CreateCartItemDto {

  @IsNumber()
  readonly productId: number;

  @IsNumber()
  @IsPositive()
  readonly quantity: number;

  @IsNumber()
  readonly price: number;

  @IsNumber()
  readonly discountRate: number;
}