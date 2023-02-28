import { IsNumber, IsPositive } from "class-validator";

export class RemoveCartItemDto {

    @IsNumber()
    @IsPositive()
    readonly cartItemId: number;
}