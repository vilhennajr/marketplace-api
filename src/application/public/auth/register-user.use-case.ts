import { IUserRepository } from '@domain/user/user.repository.interface';
import { UserEntity } from '@domain/user/user.entity';
import { Result } from '@shared/core/result';
import { DomainError } from '@shared/core/domain-error';
import { HashService } from '@infrastructure/security/hash.service';

interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: HashService,
  ) {}

  async execute(request: RegisterUserRequest): Promise<Result<UserEntity, DomainError>> {
    const { email, name, password } = request;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return Result.fail({
        name: 'EntityAlreadyExistsError',
        message: `User with email ${email} already exists`,
      });
    }

    const hashedPassword = await this.hashService.hash(password);

    const userResult = UserEntity.create({
      emailAddress: email,
      name,
      password: hashedPassword,
      isActive: true,
    });

    if (userResult.isFailure) {
      return Result.fail({
        name: 'ValidationError',
        message: userResult.getError().message,
      });
    }

    const user = userResult.getValue();

    await this.userRepository.save(user);

    return Result.ok(user);
  }
}
