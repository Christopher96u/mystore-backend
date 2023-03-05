import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
        private readonly categoriesService: CategoriesService,
    ) { }

    async findAll(): Promise<ProductDocument[]> {
        //TODO: Add support to optional filter by isDeleted, isActive, etc

        return await this.productModel.find({ isActive: { $eq: true }, isDeleted: { $eq: false } }).populate('category');
    }

    async search(term: string): Promise<ProductDocument[] | any> {

        console.log('term', term);
    }

    async findOne(id: string): Promise<ProductDocument> {

        const product = await this.productModel.findOne({
            _id: id,
            isActive: { $eq: true },
            isDeleted: { $eq: false }
        });
        if (!product) {
            throw new NotFoundException(`Product with id #${id} not found`);
        }
        return product;
    }
    async create(createProductDto: CreateProductDto): Promise<ProductDocument> {

        const categoryIsInactiveOrDeleted = await this.categoriesService.isInactiveOrDeleted(createProductDto.categoryId);
        if (categoryIsInactiveOrDeleted) {
            throw new BadRequestException(`Category with id #${createProductDto.categoryId} is inactive or deleted`);
        }
        const product = await this.productModel.findOne({ name: createProductDto.name });
        if (product) {
            throw new BadRequestException(`Product with name ${createProductDto.name} already exists`);
        }
        const newProduct = new this.productModel(createProductDto);

        return await newProduct.save();
    }
    async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
        const categoryIsInactiveOrDeleted = await this.categoriesService.isInactiveOrDeleted(updateProductDto.categoryId);
        if (categoryIsInactiveOrDeleted) {
            // Probably, remove this validation, because we should be able to update a product, and mark as optional the categoryId in the DTO
            throw new BadRequestException(`Category with id #${updateProductDto.categoryId} is inactive or deleted`);
        }
        const updatedProduct = await this.productModel.findOneAndUpdate({ _id: id }, { ...updateProductDto, category: updateProductDto.categoryId }, { new: true });
        if (!updatedProduct) {
            throw new NotFoundException(`Product with id #${id} not found`);
        }

        return updatedProduct;
    }

    async softDelete(id: string): Promise<void> {

        await this.productModel.findByIdAndUpdate(id, { isDeleted: true });
    }

    async hardDelete(id: string): Promise<void> {
        await this.productModel.findByIdAndRemove(id);
    }
}