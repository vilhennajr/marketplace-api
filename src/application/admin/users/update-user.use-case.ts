import { IUserRepository } from '@domain/user/user.repository.interface';
import { UserEntity } from '@domain/user/user.entity';
import { Result } from '@shared/core/result';
import { DomainError } from '@shared/core/domain-error';
import { HashService } from '@infrastructure/security/hash.service';

interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export class UpdateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: HashService,
  ) {}

  async execute(request: UpdateUserRequest): Promise<Result<UserEntity, DomainError>> {
    const { id, name, email, password, isActive } = request;

    const user = await this.userRepository.findById(id);
    if (!user) {
      return Result.fail({
        name: 'EntityNotFoundError',
        message: `User with id ${id} not found`,
      });
    }

    if (email && email !== user.emailValue) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return Result.fail({
          name: 'EntityAlreadyExistsError',
          message: `User with email ${email} already exists`,
        });
      }
    }
    if (name) {
      user.updateName(name);
    }
    if (email) {
      const emailResult = user.updateEmail(email);
      if (emailResult.isFailure) {
        return Result.fail({
          name: 'ValidationError',
          message: emailResult.getError().message,
        });
      }
    }
    if (password) {
      const hashedPassword = await this.hashService.hash(password);
      user.updatePassword(hashedPassword);
    }
    if (isActive !== undefined) {
      if (isActive) {
        user.activate();
      } else {
        user.deactivate();
      }
    }

    await this.userRepository.save(user);

    return Result.ok(user);
  }
}
