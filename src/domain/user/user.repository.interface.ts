import { UserEntity } from './user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(params: { skip?: number; take?: number; isActive?: boolean; search?: string }): Promise<UserEntity[]>;
  count(params: { isActive?: boolean; search?: string }): Promise<number>;
  save(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
