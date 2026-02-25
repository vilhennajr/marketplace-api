import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IUserRepository } from '@domain/user/user.repository.interface';
import { UserEntity } from '@domain/user/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: params.isActive,
        deletedAt: null,
        ...(params.search && {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
          ],
        }),
      },
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => UserMapper.toDomain(user));
  }

  async count(params: { isActive?: boolean; search?: string }): Promise<number> {
    return this.prisma.user.count({
      where: {
        isActive: params.isActive,
        deletedAt: null,
        ...(params.search && {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
          ],
        }),
      },
    });
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const userData = UserMapper.toPersistence(user);
    const created = await this.prisma.user.create({
      data: userData,
    });

    return UserMapper.toDomain(created);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const userData = UserMapper.toPersistence(user);
    const updated = await this.prisma.user.update({
      where: { id: userData.id },
      data: userData,
    });

    return UserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
