import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {

    const user = await this.findByEmail(createUserDto.email);
    if (user) {
      throw new BadRequestException(`User with email ${createUserDto.email} already exists`);
    }
    const newUser = new this.userModel(createUserDto);

    return await newUser.save();
  }

  async signUp(createUserDto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(createUserDto);

    return await user.save();
  }

  async findAll(): Promise<UserDocument[]> {

    return await this.userModel.find();
  }

  async findOne(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id #${userId} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });

    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {

    const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
    if (!updatedUser) {
      throw new NotFoundException(`User with id #${userId} not found`);
    }

    return updatedUser;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken });
  }

  async removeRefreshToken(userId: string): Promise<void> {
    const removedToken = await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    if (!removedToken) {
      throw new NotFoundException(`User with id #${userId}, we couldnt remove your token, please try again later`);
    }
  }

  async softDelete(id: string): Promise<void> {

    await this.userModel.findByIdAndUpdate(id, { isDeleted: true });
  }

  async hardDelete(id: string): Promise<void> {

    await this.userModel.findByIdAndRemove(id);
  }

}
