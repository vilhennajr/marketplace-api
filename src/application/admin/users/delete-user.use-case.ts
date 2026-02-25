import { IUserRepository } from '@domain/user/user.repository.interface';
import { Result } from '@shared/core/result';
import { DomainError } from '@shared/core/domain-error';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<Result<void, DomainError>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.fail({
        name: 'EntityNotFoundError',
        message: `User with id ${userId} not found`,
      });
    }

    await this.userRepository.delete(userId);

    return Result.ok(undefined);
  }
}
