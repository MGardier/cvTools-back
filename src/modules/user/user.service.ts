import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRepository } from './user.repository';
import { IUpdateUser, IFindOneByOauthId, ICreateUser } from './types';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: ICreateUser): Promise<User> {
    return await this.userRepository.create(data);
  }

  async update(id: number, data: IUpdateUser): Promise<User> {
    return await this.userRepository.update(id, data);
  }

  /***************************************** FIND   ***************************************************************************************/

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOneById(id);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneByEmail(email);
  }

  async findOneByOauthId(data: IFindOneByOauthId): Promise<User | null> {
    return await this.userRepository.findOneByOauthId(data);
  }
}
