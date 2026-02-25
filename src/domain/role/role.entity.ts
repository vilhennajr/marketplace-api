export interface RoleProps {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RoleEntity {
  private constructor(private props: RoleProps) {}

  static create(props: Omit<RoleProps, 'id' | 'createdAt' | 'updatedAt'>): RoleEntity {
    return new RoleEntity({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: RoleProps): RoleEntity {
    return new RoleEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateDescription(description: string): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  toJSON(): RoleProps {
    return { ...this.props };
  }
}
