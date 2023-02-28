import { CreateCategoryDto } from './create-category.dto';
import { PickType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';
export class UpdateCategoryDto extends PickType(CreateCategoryDto, ['name', 'description', 'imageUrl']) {
    @IsBoolean()
    isActive: boolean;
}