import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { User } from 'src/users/entities/user.entity';
import { CartStatus } from './interfaces/cart-status.enum';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { CartItem } from './entities/cart-item.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CartsService {
    private TAX_RATE: number;

    constructor(@InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
        @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly productsService: ProductsService,
        private configService: ConfigService

    ) {
        this.TAX_RATE = this.configService.get<number>('TAX_RATE');
    }

    async findCartById(cartId: number): Promise<Cart | undefined> {
        //TODO: Probably cartStatus as optional parameter if we'll need this method for other statuses
        const cart = this.cartRepository.findOne({ where: { id: cartId, status: CartStatus.CREATED }, relations: ['cartItems'] });
        if (!cart) {
            throw new NotFoundException(`Cart with id #${cartId} not found`);
        }
        return cart;
    }

    async findCartByUserId(userId: number): Promise<Cart | undefined> {
        //TODO: Probably cartStatus as optional parameter if we'll need this method for other statuses
        const cart = this.cartRepository.findOne({ where: { user: { id: userId }, status: CartStatus.CREATED }, relations: ['cartItems'] });
        if (!cart) {
            throw new NotFoundException(`Cart with userId #${userId} not found`);
        }
        return cart;
    }
    validateProduct(product: Product, createCartItemDto: CreateCartItemDto) {
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

    calculatePriceWithTax(createCartItemDto: CreateCartItemDto, product: Product) {
        // We calculate the subTotalPrice/totalPrice to use it in the cart and cartItem
        const subTotalPrice = (createCartItemDto.quantity * product.price) - ((createCartItemDto.quantity * product.price * product.discountRate) / 100);
        const totalTax = subTotalPrice * this.TAX_RATE;
        const totalPrice = subTotalPrice + totalTax;

        return {
            subTotalPrice,
            totalTax,
            totalPrice
        }
    }

    async createCartAndAddItem(createCartItemDto: CreateCartItemDto, userId: number, product: Product): Promise<Cart> {
        // First case: cart doesn't exist in the db, so we create it
        // Adding subtotalPrice and totalPrice to the cart as zero, because we'll calculate it later
        const cart = this.cartRepository.create({
            userId,
            subTotalPrice: 0,
            totalPrice: 0,
        });
        //We save the cart to get the cartId, and then update the subTotalPrice and totalPrice from the cart
        const createdCart = await this.cartRepository.save(cart);
        // We update the cart with the subTotalPrice and totalPrice
        const { subTotalPrice, totalTax, totalPrice } = this.calculatePriceWithTax(createCartItemDto, product);
        createdCart.subTotalPrice = subTotalPrice;
        createdCart.totalTax = totalTax;
        createdCart.totalPrice = totalPrice;
        // We save the cart again with the updated fields
        this.cartRepository.save(createdCart);
        // After creating the cart, we create the cartItem to link it with the cart
        const newCartItem = this.cartItemRepository.create({
            productId: product.id,
            cartId: createdCart.id,
            quantity: createCartItemDto.quantity,
            price: product.price,
            discountRate: product.discountRate,
            subTotalPrice
        });
        await this.cartItemRepository.save(newCartItem);

        return await this.findCartById(createdCart.id);
    }

    async updateCartAndCartItem(createCartItemDto: CreateCartItemDto, cart: Cart, product: Product): Promise<Cart> {
        //Case: CartItem already exists in the cart, so we update the quantity, check the stock, and update the price if it changed
        //We just need the calculation of the subTotalPrice from the item because, there are more than one cartItem in the cart, so we need to recalculate the subTotalPrice/totalPrice
        const { subTotalPrice } = this.calculatePriceWithTax(createCartItemDto, product);
        const cartItem = await this.cartItemRepository.findOne({ where: { cartId: cart.id, productId: product.id } });
        cartItem.quantity = createCartItemDto.quantity;
        cartItem.price = product.price;
        cartItem.discountRate = product.discountRate;
        cartItem.subTotalPrice = subTotalPrice;
        // We save the cartItem again with the updated fields
        await this.cartItemRepository.save(cartItem);
        // We recalculate the subTotalPrice/totalPrice to use it in the cart, but this time we get the cartItems from the db
        const cartItemsDB = await this.cartItemRepository.find({ where: { cartId: cart.id } });
        const subTotalPriceCart = cartItemsDB.reduce((acc, cartItem) => acc + cartItem.subTotalPrice, 0);
        const totalTax = subTotalPriceCart * this.TAX_RATE;
        const totalPrice = subTotalPriceCart + totalTax;
        // We update the cart with the subTotalPrice and totalPrice
        cart.subTotalPrice = subTotalPriceCart;
        cart.totalTax = totalTax;
        cart.totalPrice = totalPrice;
        // We save the cart again with the updated fields
        await this.cartRepository.save(cart);
        return await this.findCartById(cart.id);
    }

    async updateCartAndAddCartItem(createCartItemDto: CreateCartItemDto, cart: Cart, product: Product): Promise<Cart> {
        //Case:  CartItem doesn't exist in the cart, so we create it
        // We update the cart with the subTotalPrice and totalPrice
        const { subTotalPrice, totalTax, totalPrice } = this.calculatePriceWithTax(createCartItemDto, product);
        cart.subTotalPrice = cart.subTotalPrice + subTotalPrice;
        cart.totalTax = cart.totalTax + totalTax;
        cart.totalPrice = cart.totalPrice + totalPrice;
        // We save the cart again with the updated fields
        await this.cartRepository.save(cart);
        // After updating the cart, we create the cartItem to link it with the cart
        const newCartItem = this.cartItemRepository.create({
            productId: product.id,
            cartId: cart.id,
            quantity: createCartItemDto.quantity,
            price: product.price,
            discountRate: product.discountRate,
            subTotalPrice
        });
        await this.cartItemRepository.save(newCartItem);
        return await this.findCartById(cart.id);
    }

    async addItem(createCartItemDto: CreateCartItemDto, userId: number): Promise<Cart> {
        // Get the product from the db to check if it's available, stock, price changes, etc
        const product = await this.productsService.findOne(createCartItemDto.productId);
        let cart = await this.findCartByUserId(userId);
        // Validate the product
        this.validateProduct(product, createCartItemDto);
        if (!cart) {
            // First case: cart doesn't exist in the db, so we create it
            return await this.createCartAndAddItem(createCartItemDto, userId, product);
        }
        else {
            //Second case: cart already exists in the db
            const cartItems = cart.cartItems;
            const cartItemExists = cartItems.some(cartItem => cartItem.productId === createCartItemDto.productId);
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

    async removeItem(cartItemId: number, userId: number): Promise<Cart> {
        const cartItem = await this.cartItemRepository.findOne({ where: { id: cartItemId } });
        if (!cartItem) {
            throw new NotFoundException(`Cart Item with id ${cartItemId} not found`);
        }
        const cart = await this.findCartByUserId(userId);
        if (!cart) {
            throw new NotFoundException(`Cart not found`);
        }
        // We update the cart with the subTotalPrice and totalPrice
        cart.subTotalPrice = cart.subTotalPrice - cartItem.subTotalPrice;
        cart.totalTax = cart.totalTax - (cartItem.subTotalPrice * this.TAX_RATE);
        cart.totalPrice = cart.totalPrice - (cartItem.subTotalPrice + (cartItem.subTotalPrice * this.TAX_RATE));
        // We save the cart again with the updated fields
        await this.cartRepository.save(cart);
        await this.cartItemRepository.delete(cartItemId);
        return await this.findCartById(cart.id);
    }
}
