import { IRoleRepository } from '@domain/role/role.repository.interface';
import { RoleEntity } from '@domain/role/role.entity';
import { Result } from '@shared/core/result';
import { DomainError } from '@shared/core/domain-error';

interface CreateRoleRequest {
  name: string;
  description?: string;
}

export class CreateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(request: CreateRoleRequest): Promise<Result<RoleEntity, DomainError>> {
    const { name, description } = request;

    const existingRole = await this.roleRepository.findByName(name);
    if (existingRole) {
      return Result.fail({
        name: 'EntityAlreadyExistsError',
        message: `Role with name ${name} already exists`,
      });
    }

    const role = RoleEntity.create({
      name,
      description,
    });

    await this.roleRepository.save(role);

    return Result.ok(role);
  }
}
