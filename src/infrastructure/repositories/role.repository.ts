import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IRoleRepository } from '@domain/role/role.repository.interface';
import { RoleEntity } from '@domain/role/role.entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) return null;

    return RoleEntity.reconstitute({
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    if (!role) return null;

    return RoleEntity.reconstitute({
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });

    return roles.map((role) =>
      RoleEntity.reconstitute({
        id: role.id,
        name: role.name,
        description: role.description ?? undefined,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      }),
    );
  }

  async save(role: RoleEntity): Promise<RoleEntity> {
    const created = await this.prisma.role.create({
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
    });

    return RoleEntity.reconstitute({
      id: created.id,
      name: created.name,
      description: created.description ?? undefined,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(role: RoleEntity): Promise<RoleEntity> {
    const updated = await this.prisma.role.update({
      where: { id: role.id },
      data: {
        name: role.name,
        description: role.description,
        updatedAt: new Date(),
      },
    });

    return RoleEntity.reconstitute({
      id: updated.id,
      name: updated.name,
      description: updated.description ?? undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }
}
