import { BadRequestException, Injectable } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { User } from 'src/users/entities/user.entity';
import { CartStatus } from './interfaces/cart-status.enum';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartsService {
    constructor(@InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly productsService: ProductsService,

    ) { }
    async add(createCartItemDto: CreateCartItemDto, userId: number): Promise<Cart> {
        const product = await this.productsService.findOne(createCartItemDto.productId);
        let cart = await this.cartRepository.findOne({
            where: { user: { id: userId }, status: CartStatus.CREATED },
            relations: ['cartItems']
        });
        console.log('cart from db', cart);

        if (!cart) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            cart = this.cartRepository.create({
                user,
                cartItems: [],
                subTotalPrice: 0,
                totalPrice: 0,
            });
            // await this.cartRepository.save(cart);
        }

        const cartItemExists = cart.cartItems.find(cartItem => cartItem.id === product.id);
        if (cartItemExists) {
            console.log(`The product with id #${product.id} already exists in the cart`);
            if (createCartItemDto.quantity < cartItemExists.quantity) {
                cartItemExists.quantity -= createCartItemDto.quantity;
            } else {
                cartItemExists.quantity = createCartItemDto.quantity;
            }
            if (cartItemExists.price !== product.price) {
                console.log(`The price of product with id #${product.id} has changed`);
                cartItemExists.price = product.price;
            }
            if (cartItemExists.discountRate !== product.discountRate) {
                console.log(`The discount rate of product with id #${product.id} has changed`);
                cartItemExists.discountRate = product.discountRate;
            }
            cartItemExists.subTotalPrice = (cartItemExists.quantity * cartItemExists.price) - ((cartItemExists.quantity * cartItemExists.price * cartItemExists.discountRate) / 100);
        } else {
            console.log(`The product with id #${product.id} does not exist in the cart`);
            const newCartItem = new CartItem();
            newCartItem.product = product;
            newCartItem.quantity = createCartItemDto.quantity;
            newCartItem.price = product.price;
            newCartItem.discountRate = product.discountRate;
            newCartItem.subTotalPrice = (newCartItem.quantity * newCartItem.price) - ((newCartItem.quantity * newCartItem.price * newCartItem.discountRate) / 100);
            cart.cartItems.push(newCartItem);
        }
        console.log('cart to save', cart);
        this.cartRepository.merge(cart, cart);

        return this.cartRepository.save(cart);
    }

    async findOne(userId: number): Promise<Cart> {
        const cart = await this.cartRepository.findOne({ where: { user: { id: userId } } });
        if (!cart) {
            throw new BadRequestException(`User with id #${userId} has no cart`);
        }
        return cart;
    }
}
