import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from '../categories/categories.service';
import { DeleteResult, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly categoriesService: CategoriesService,
    ) { }
    findAll(): Promise<Product[]> {

        return this.productRepository.find({ relations: ['category'] });
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!product) {
            throw new NotFoundException(`Product with id #${id} not found`);
        }

        return product;
    }
    async create(createProductDto: CreateProductDto) {
        const category = await this.categoriesService.findOne(
            createProductDto.categoryId,
        );
        if (!category.isActive) {
            throw new BadRequestException(`Category ${category.name} is not active`);
        }
        const newProduct = this.productRepository.create(createProductDto);
        newProduct.category = category;

        return this.productRepository.save(newProduct);
    }
    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const storedProduct = await this.findOne(id);
        if (updateProductDto.categoryId && updateProductDto.categoryId !== storedProduct.category.id) {
            const category = await this.categoriesService.findOne(updateProductDto.categoryId);
            storedProduct.category = category;
        }
        this.productRepository.merge(storedProduct, updateProductDto);

        return this.productRepository.save(storedProduct);
    }
    async remove(id: number): Promise<DeleteResult> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new NotFoundException(`Product with id #${id} not found`);
        }

        return this.productRepository.delete(id);
    }
}