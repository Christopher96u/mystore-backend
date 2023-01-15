import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findByEmail(createUserDto.email);
    if (user) {
      throw new BadRequestException(`User with email ${createUserDto.email} already exists`);
    }
    const newUser = this.userRepository.create(createUserDto);

    return this.userRepository.save(newUser);
  }

  findAll(): Promise<User[]> {

    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id #${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const currentUser = await this.findOne(id);
    this.userRepository.merge(currentUser, updateUserDto);

    return this.userRepository.save(currentUser);
  }

  async updateRefreshToken(id: number, refreshToken: string): Promise<void> {
    await this.userRepository.update(id, { refreshToken });
  }

  async removeRefreshToken(id: number): Promise<UpdateResult> {

    return await this.userRepository.update(id, { refreshToken: null });
  }

  async remove(id: number): Promise<DeleteResult> {
    await this.findOne(id);

    return this.userRepository.delete(id);
  }
}
