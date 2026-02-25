import { Email } from '../shared/value-objects/email.vo';
import { Result } from '../../shared/core/result';

export interface UserProps {
  id: string;
  email: Email;
  password: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class UserEntity {
  private constructor(private props: UserProps) {}

  static create(
    props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt' | 'email'> & { emailAddress: string },
  ): Result<UserEntity, Error> {
    const emailOrError = Email.create(props.emailAddress);
    if (emailOrError.isFailure) {
      return Result.fail(emailOrError.getError());
    }

    const user = new UserEntity({
      id: crypto.randomUUID(),
      email: emailOrError.getValue(),
      password: props.password,
      name: props.name,
      isActive: props.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: props.deletedAt,
    });

    return Result.ok(user);
  }

  static reconstitute(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get emailValue(): string {
    return this.props.email.getValue();
  }

  get password(): string {
    return this.props.password;
  }

  get name(): string {
    return this.props.name;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updateEmail(email: string): Result<void, Error> {
    const emailOrError = Email.create(email);
    if (emailOrError.isFailure) {
      return Result.fail(emailOrError.getError());
    }

    this.props.email = emailOrError.getValue();
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  updatePassword(hashedPassword: string): void {
    this.props.password = hashedPassword;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  softDelete(): void {
    this.props.deletedAt = new Date();
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
