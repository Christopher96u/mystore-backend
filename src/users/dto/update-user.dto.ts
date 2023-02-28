import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(40)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    name: string;
}
