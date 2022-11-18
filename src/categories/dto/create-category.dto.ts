import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(255)
    readonly description: string;

}