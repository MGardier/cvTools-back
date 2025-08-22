import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { UserRepository } from './user.repository';
import { UpdateUserInterface } from './interfaces/update-user.interface';
import { SignUpInterface } from './interfaces/sign-up.interface';
import { FindOneByOauthIdInterface } from './interfaces/find-one-by-oauth-id.interface';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) { }

  async create(
    data: SignUpInterface,
    selectedColumn?: (keyof User)[]
  ): Promise<User> {
    return await this.userRepository.create(data, selectedColumn)
  }


  async update(
    id: number,
    data: UpdateUserInterface,
    selectedColumns?: (keyof User)[],
  ): Promise<Partial<User | null>> {
    return await this.userRepository.update(id, data, selectedColumns)
  }

  /***************************************** FIND   ***************************************************************************************/


  async findAll(selectedColumns?: (keyof User)[]): Promise<Partial<User[]>> {
    return await this.userRepository.findAll(selectedColumns);
  }

  async findOneById(
    id: number,
    selectedColumns?: (keyof User)[],
  ): Promise<Partial<User | null>> {
    return await this.userRepository.findOneById(id, selectedColumns)
  }

  async findOneByEmail(
    email: string,
    selectedColumns?: (keyof User)[],
  ): Promise<Partial<User | null>> {
    return await this.userRepository.findOneByEmail(email, selectedColumns)

  }

  async findOneByOauthId(data: FindOneByOauthIdInterface, selectedColumns?: (keyof User)[]): Promise<Partial<User | null>> {
    return await this.userRepository.findOneByOauthId(data, selectedColumns)
  }

}
