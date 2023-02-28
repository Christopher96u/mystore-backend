import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from '../categories/categories.service';
import { DeleteResult, Like, ObjectID, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name)
        private readonly productRepository: Model<ProductDocument>,
    ) { }

    async findAll(): Promise<Product[]> {

        return await this.productRepository.find();
    }

    async search(term: string): Promise<Product[]> {

        return this.productRepository.find({
            relations: ['category'],
            where: { name: Like(`%${term}%`) }
        });
    }

    async findOne(id: ObjectID): Promise<Product | any> {
        /* const product = await this.productRepository.findOne({
            where: { _id: id },
            relations: ['category'],
        });
        if (!product) {
            throw new NotFoundException(`Product with id #${id} not found`);
        }
        if (!product.isActive) {
            throw new BadRequestException(`The product ${product.name} is not active`);
        } */

        return id;
    }
    async create(createProductDto: CreateProductDto, userId: ObjectID): Promise<Product | any> {
        return createProductDto;
        /* const category = await this.categoriesService.findOne(
            createProductDto.categoryId,
        );
        if (!category.isActive) {
            throw new BadRequestException(`Category ${category.name} is not active`);
        }
        const newProduct = this.productRepository.create(createProductDto);
        console.log('new product after create typeorm method', newProduct);
        newProduct.category = category;
        newProduct.userId = userId;

        return this.productRepository.save(newProduct); */
    }
    async update(id: ObjectID, updateProductDto: UpdateProductDto): Promise<Product | any> {
        return updateProductDto;
        /*  const storedProduct = await this.findOne(id);
         if (updateProductDto.categoryId && updateProductDto.categoryId !== storedProduct.category._id) {
             const category = await this.categoriesService.findOne(updateProductDto.categoryId);
             storedProduct.category = category;
         }
         this.productRepository.merge(storedProduct, updateProductDto);
 
         return this.productRepository.save(storedProduct); */
    }
    async remove(id: ObjectID): Promise<DeleteResult | any> {
        /* const product = await this.productRepository.findOneBy({ _id: id });
        if (!product) {
            throw new NotFoundException(`Product with id #${id} not found`);
        }

        return this.productRepository.delete(id); */
    }
}