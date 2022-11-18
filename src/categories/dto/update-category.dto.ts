import { CreateCategoryDto } from './create-category.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsBoolean()
    isActive: boolean;
}