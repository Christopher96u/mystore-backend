import { IsString } from "class-validator";

export class RemoveCartItemDto {

    @IsString()
    readonly cartItemId: string;
}