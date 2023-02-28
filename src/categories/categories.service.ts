import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { DeleteResult, ObjectID } from 'typeorm';

import { Category, CategoryDocument } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name)
        private readonly categoryModel: Model<CategoryDocument>,
    ) { }

    async findAll(): Promise<CategoryDocument[]> {
        //TODO: Add support to filter by isDeleted, isActive
        return await this.categoryModel.find({ isDeleted: { $eq: false } });
    }

    paginate(): void {
        console.log('paginate feature');
    }

    async findOne(id: string): Promise<CategoryDocument> {
        const category = await this.categoryModel.findOne({
            _id: id,
            isDeleted: { $ne: true }
        });
        if (!category) {
            throw new NotFoundException(`Category with id #${id} not found`);
        }
        return category;
    }
    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
        const category = await this.categoryModel.findOne({ name: createCategoryDto.name, isDeleted: { $ne: true } });
        if (category) {
            throw new BadRequestException(`Category with name ${createCategoryDto.name} already exists`);
        }
        const newCategory = new this.categoryModel(createCategoryDto);

        return await newCategory.save();
    }
    async update(categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
        const category = await this.categoryModel.findById(categoryId);

        if (!category) {
            throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }

        if (category.isDeleted) {
            throw new BadRequestException(`Category with ID ${categoryId} is deleted`);
        }

        if (!category.isActive) {
            throw new BadRequestException(`Category with ID ${categoryId} is inactive`);
        }

        const updatedCategory = await this.categoryModel.findByIdAndUpdate(categoryId, updateCategoryDto, { new: true });
        if (!updatedCategory) {
            throw new NotFoundException(`Category with id #${categoryId} not found`);
        }

        return updatedCategory;
    }

    async softDelete(id: string): Promise<void> {

        await this.categoryModel.findByIdAndUpdate(id, { isDeleted: true });
    }

    async hardDelete(id: string): Promise<void> {
        await this.categoryModel.findByIdAndRemove(id);
    }
}