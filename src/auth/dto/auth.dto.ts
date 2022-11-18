import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(40)
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(30)
    readonly password: string;
}