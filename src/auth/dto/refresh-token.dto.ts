import { IsJWT, IsNotEmpty, IsString } from "class-validator";

export class RefrehTokenDto {
    @IsString()
    @IsNotEmpty()
    @IsJWT()
    readonly refreshToken: string;
}