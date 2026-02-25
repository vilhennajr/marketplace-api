import { User as PrismaUser } from '@prisma/client';
import { UserEntity } from '@domain/user/user.entity';
import { Email } from '@domain/shared/value-objects/email.vo';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): UserEntity {
    const emailOrError = Email.create(prismaUser.email);
    if (emailOrError.isFailure) {
      throw new Error(`Invalid email in database: ${emailOrError.getErrorMessage()}`);
    }

    return UserEntity.reconstitute({
      id: prismaUser.id,
      email: emailOrError.getValue(),
      password: prismaUser.password,
      name: prismaUser.name,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt || undefined,
    });
  }


  static toPersistence(user: UserEntity) {
    return {
      id: user.id,
      email: user.emailValue, // Extract primitive from Value Object
      password: user.password,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
