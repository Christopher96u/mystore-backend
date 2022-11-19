import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    async paginate(options: IPaginationOptions): Promise<Pagination<Category>> {
        return paginate<Category>(this.categoryRepository, options);
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            throw new NotFoundException(`Category with id #${id} not found`);
        }
        return category;
    }
    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = await this.categoryRepository.findOneBy({ name: createCategoryDto.name });
        if (category) {
            throw new BadRequestException(`Category with name ${createCategoryDto.name} already exists`);
        }
        const newCategory = this.categoryRepository.create(createCategoryDto);

        return this.categoryRepository.save(newCategory);
    }
    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const currentCategory = await this.categoryRepository.findOneBy({ id });
        this.categoryRepository.merge(currentCategory, updateCategoryDto);

        return this.categoryRepository.save(currentCategory);
    }

    async remove(id: number): Promise<DeleteResult> {
        await this.findOne(id);

        return this.categoryRepository.delete(id);
    }
}