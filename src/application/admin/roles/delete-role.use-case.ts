import { IRoleRepository } from '@domain/role/role.repository.interface';
import { Result } from '@shared/core/result';
import { DomainError } from '@shared/core/domain-error';

export class DeleteRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(roleId: string): Promise<Result<void, DomainError>> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      return Result.fail({
        name: 'EntityNotFoundError',
        message: `Role with id ${roleId} not found`,
      });
    }

    // Check if it's a system role (admin, customer, etc.)
    const systemRoles = ['admin', 'customer', 'manager', 'member'];
    if (systemRoles.includes(role.name)) {
      return Result.fail({
        name: 'ValidationError',
        message: `Cannot delete system role: ${role.name}`,
      });
    }

    await this.roleRepository.delete(roleId);

    return Result.ok(undefined);
  }
}
