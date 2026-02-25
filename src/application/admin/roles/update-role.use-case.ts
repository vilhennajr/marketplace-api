import { IRoleRepository } from '@domain/role/role.repository.interface';
import { RoleEntity } from '@domain/role/role.entity';
import { Result } from '@shared/core/result';
import { DomainError } from '@shared/core/domain-error';

interface UpdateRoleRequest {
  id: string;
  name?: string;
  description?: string;
}

export class UpdateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(request: UpdateRoleRequest): Promise<Result<RoleEntity, DomainError>> {
    const { id, name, description } = request;

    const role = await this.roleRepository.findById(id);
    if (!role) {
      return Result.fail({
        name: 'EntityNotFoundError',
        message: `Role with id ${id} not found`,
      });
    }

    if (name && name !== role.name) {
      const existingRole = await this.roleRepository.findByName(name);
      if (existingRole) {
        return Result.fail({
          name: 'EntityAlreadyExistsError',
          message: `Role with name ${name} already exists`,
        });
      }
    }

    const updatedRole = RoleEntity.reconstitute({
      id: role.id,
      name: name ?? role.name,
      description: description ?? role.description,
      createdAt: role.createdAt,
      updatedAt: new Date(),
    });

    await this.roleRepository.update(updatedRole);

    return Result.ok(updatedRole);
  }
}
