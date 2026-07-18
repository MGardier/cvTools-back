import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserRepository } from './user.repository';
import { IUpdateUser, IFindOneByOauthId, ICreateUser } from './types';
import { UserHomeResponseDto } from './dto/response/user-home-response.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(
    data: ICreateUser,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    return await this.userRepository.create(data, tx);
  }

  async update(id: number, data: IUpdateUser): Promise<User> {
    return await this.userRepository.update(id, data);
  }

  // =============================================================================
  //                               FIND
  // =============================================================================

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

  async findActiveAdmin(): Promise<User | null> {
    return await this.userRepository.findActiveAdmin();
  }

  // =============================================================================
  //                               HOME
  // =============================================================================

  // TODO: rewire counts and recent items on ms-applications once the
  // matching message patterns are implemented (application domain delegated);
  // the authenticated userId will be needed again at that point.
  async getHomeData(): Promise<UserHomeResponseDto> {
    return await Promise.resolve({
      applicationCounts: {
        inProgress: 0,
        toApply: 0,
        interview: 0,
        finished: 0,
      },
      todoCounts: {
        toMake: 0,
        inProgress: 0,
      },
      recentApplications: [],
      recentTodos: [],
    });
  }
}
