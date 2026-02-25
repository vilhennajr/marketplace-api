import { CartEntity } from './cart.entity';

export interface ICartRepository {
  findById(id: string): Promise<CartEntity | null>;
  findByUserId(userId: string): Promise<CartEntity | null>;
  findBySessionId(sessionId: string): Promise<CartEntity | null>;
  save(cart: CartEntity): Promise<CartEntity>;
  update(cart: CartEntity): Promise<CartEntity>;
  delete(id: string): Promise<void>;
}
