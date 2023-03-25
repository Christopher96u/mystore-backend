import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cart, CartDocument } from './entities/cart.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CartStatus } from './interfaces/cart-status.enum';
import { Product, ProductDocument } from 'src/products/entities/product.entity';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from 'src/products/products.service';
import { CartItem, CartItemDocument } from './entities/cart-item.entity';

@Injectable()
export class CartsService {
    private TAX_RATE: number;

    constructor(

        @InjectModel(Cart.name)
        private readonly cartModel: Model<CartDocument>,
        @InjectModel(CartItem.name)
        private readonly cartItemModel: Model<CartItemDocument>,
        private readonly productsService: ProductsService,
        private configService: ConfigService

    ) {
        this.TAX_RATE = this.configService.get<number>('TAX_RATE');
    }

    async findCartById(cartId: number): Promise<CartDocument> {
        //TODO: Probably cartStatus as optional parameter if we'll need this method for other statuses
        const cart = this.cartModel.findOne({
            _id: cartId,
            status: CartStatus.CREATED,
            isDeleted: { $eq: false }
        }).populate('cartItems');
        if (!cart) {
            throw new NotFoundException(`Cart with id #${cartId} not found`);
        }
        return cart;
    }

    async getCurrentCartByUserId(userId: string): Promise<CartDocument> {
        return await this.cartModel.findOne({
            user: userId,
            status: CartStatus.CREATED,
            isDeleted: { $eq: false }
        }).populate('cartItems');
    }

    async getOrCreateCartByUserId(userId: string): Promise<Cart> {
        //Get the current cart of the user with status CREATED
        const cart = await this.cartModel.findOne({
            user: userId,
            status: CartStatus.CREATED,
            isDeleted: { $eq: false }
        });
        if (!cart) {
            const newCart = new this.cartModel({
                user: userId,
                subTotalPrice: 0,
                totalTax: 0,
                discountVoucher: 0,
                totalPrice: 0,
                status: CartStatus.CREATED
            });
            return await newCart.save();

        }
        return cart;
    }
    validateProduct(product: Product, createCartItemDto: CreateCartItemDto): void {
        // Check if the product is active
        if (!product.isActive) {
            throw new BadRequestException(`Product #${product.name} is not available, try another one`);
        }
        // Check if the product has stock
        if (product.stock <= createCartItemDto.quantity) {
            throw new BadRequestException(`Product #${product.name} doesn't have enough stock, try another one`);
        }
        // Check if the product changed its price
        if (product.price !== createCartItemDto.price) {
            //TODO: We should create a function to handle custom messages when the product price changes(increase/decrease), to show an alert to the user
            console.log('Product price changed');
        }
    }

    calculatePriceWithTax(createCartItemDto: CreateCartItemDto, product: ProductDocument) {
        // We calculate the subTotalPrice/totalPrice/totalTax to use it in the cart and cartItem
        const subTotalPrice = (createCartItemDto.quantity * product.price) - ((createCartItemDto.quantity * product.price * product.discountRate) / 100);
        const totalTax = subTotalPrice * this.TAX_RATE;
        const totalPrice = subTotalPrice + totalTax;

        return {
            subTotalPrice,
            totalTax,
            totalPrice
        }
    }

    async createCartAndAddItem(createCartItemDto: CreateCartItemDto, userId: string, product: ProductDocument): Promise<CartDocument> {
        // First case: cart doesn't exist in the db, so we create it
        // Adding subtotalPrice and totalPrice to the cart as zero, because we'll calculate it later
        const cart = new this.cartModel({
            userId,
            subTotalPrice: 0,
            totalPrice: 0,
        });
        //We save the cart to get the cartId, and then update the subTotalPrice and totalPrice from the cart
        const createdCart = await cart.save();
        // We update the cart with the subTotalPrice,totalTax and totalPrice
        const { subTotalPrice, totalTax, totalPrice } = this.calculatePriceWithTax(createCartItemDto, product);
        /* createdCart.subTotalPrice = subTotalPrice;
        createdCart.totalTax = totalTax;
        createdCart.totalPrice = totalPrice; */
        // We save the cart again with the updated fields
        await this.cartModel.updateOne({ _id: createdCart.id }, { $set: { subTotalPrice, totalTax, totalPrice } });
        // After creating the cart, we create the cartItem to link it with the cart
        const newCartItem = new this.cartItemModel({
            productId: product.id,
            cartId: createdCart.id,
            quantity: createCartItemDto.quantity,
            price: product.price,
            discountRate: product.discountRate,
            subTotalPrice
        });
        await newCartItem.save();

        return await this.findCartById(createdCart.id);
    }

    async updateCartAndCartItem(createCartItemDto: CreateCartItemDto, cart: CartDocument, product: ProductDocument): Promise<CartDocument> {
        //Case: CartItem already exists in the cart, so we update the quantity, check the stock, and update the price if it changed
        //We just need the calculation of the subTotalPrice from the item because, there are more than one cartItem in the cart, so we need to recalculate the subTotalPrice/totalPrice
        const { subTotalPrice } = this.calculatePriceWithTax(createCartItemDto, product);

        // Update the cartItem if it exists, or create a new one if it doesn't
        await this.cartItemModel.findOneAndUpdate(
            { cartId: cart.id, productId: product.id },
            {
                $set: {
                    quantity: createCartItemDto.quantity,
                    price: product.price,
                    discountRate: product.discountRate,
                    subTotalPrice
                }
            },
            { upsert: true }
        );

        // Recalculate subTotalPrice, totalTax and totalPrice
        const updatedCart = await this.findCartById(cart.id);
        const subTotalPriceCart = updatedCart.cartItems.reduce((acc, cartItem) => acc + cartItem.subTotalPrice, 0);
        const totalTax = subTotalPriceCart * this.TAX_RATE;
        const totalPrice = subTotalPriceCart + totalTax;
        await this.cartModel.updateOne({ _id: cart.id }, { $set: { subTotalPrice: subTotalPriceCart, totalTax, totalPrice } });


        return await this.findCartById(cart.id);
    }

    async updateCartAndAddCartItem(createCartItemDto: CreateCartItemDto, cart: CartDocument, product: ProductDocument): Promise<CartDocument> {
        //Case:  CartItem doesn't exist in the cart, so we create it
        // We update the cart with the subTotalPrice,totalTax and totalPrice + new prices from the product
        const productPrices = this.calculatePriceWithTax(createCartItemDto, product);
        const subTotalPrice = cart.subTotalPrice + productPrices.subTotalPrice;
        const totalTax = cart.totalTax + productPrices.totalTax;
        const totalPrice = cart.totalPrice + productPrices.totalPrice;
        // Initialize the cartItem to link it with the cart
        const newCartItem = new this.cartItemModel({
            cartId: cart.id,
            productId: product.id,
            quantity: createCartItemDto.quantity,
            price: product.price,
            discountRate: product.discountRate,
            subTotalPrice
        });
        // Using Promise.all to update the cart and create the cartItem at the same time
        await Promise.all([
            // Create the cartItem to link it with the cart
            this.cartModel.findOneAndUpdate({ _id: cart.id }, { subTotalPrice, totalTax, totalPrice, $push: { cartItems: newCartItem } }),
            // We save the cart again with the updated fields
            newCartItem.save()
        ]);
        return await this.findCartById(cart.id);
    }

    async addItem(createCartItemDto: CreateCartItemDto, userId: string): Promise<CartDocument> {

        // Get the product from the db to check if it's available, stock, price changes, etc
        const product = await this.productsService.findOne(createCartItemDto.productId);
        const cart = await this.getCurrentCartByUserId(userId);
        // Validate the product
        this.validateProduct(product, createCartItemDto);
        if (!cart) {
            // First case: cart doesn't exist in the db, so we create it
            return await this.createCartAndAddItem(createCartItemDto, userId, product);
        }
        else {
            //Second case: cart already exists in the db
            const cartItems = cart.cartItems;
            // Check if the cartItem already exists in the cart
            const cartItemExists = cartItems.some(cartItem => cartItem.productId.toString() === createCartItemDto.productId);
            if (cartItemExists) {
                //Case: CartItem already exists in the cart, so we update the quantity, check the stock, and update the price if it changed
                return await this.updateCartAndCartItem(createCartItemDto, cart, product);
            }
            else {
                //Case:  CartItem doesn't exist in the cart, so we create it
                return await this.updateCartAndAddCartItem(createCartItemDto, cart, product);
            }
        }
    }

    async removeItem(cartItemId: string, userId: string): Promise<CartDocument> {
        const cartItem = await this.cartItemModel.findOne({ _id: cartItemId });
        if (!cartItem) {
            throw new NotFoundException(`Cart Item with id ${cartItemId} not found`);
        }
        const cart = await this.getCurrentCartByUserId(userId);
        if (!cart) {
            throw new NotFoundException(`Cart not found`);
        }
        // Filter the ObjectId from the array
        cart.cartItems = cart.cartItems.filter((item) => item.toString() !== cartItemId);
        // Update the prices
        cart.subTotalPrice = cart.subTotalPrice - cartItem.subTotalPrice;
        cart.totalTax = cart.totalTax - (cartItem.subTotalPrice * this.TAX_RATE);
        cart.totalPrice = cart.totalPrice - (cartItem.subTotalPrice + (cartItem.subTotalPrice * this.TAX_RATE));
        // Store the changes in the database
        const updatedCart = await cart.save();
        await this.cartItemModel.findByIdAndRemove(cartItemId);
        return updatedCart;
    }
}
