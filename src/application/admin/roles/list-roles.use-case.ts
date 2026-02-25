import { IRoleRepository } from '@domain/role/role.repository.interface';

export class ListRolesUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute() {
    const roles = await this.roleRepository.findAll();
    return roles.map((role) => role.toJSON());
  }
}
