/**
 * Quantity Value Object
 * Garante que quantidades sejam sempre válidas
 * Seguindo DDD - Value Object pattern
 */

import { Result } from '@shared/core/result';
import { InvalidQuantityError, InvalidStockError } from '@shared/core/domain-error';

export class Quantity {
  private readonly value: number;

  private constructor(quantity: number) {
    this.value = quantity;
  }

  static create(quantity: number): Result<Quantity, InvalidQuantityError> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return Result.fail(new InvalidQuantityError(quantity));
    }
    return Result.ok(new Quantity(quantity));
  }

  static createStock(stock: number): Result<Quantity, InvalidStockError> {
    if (!Number.isInteger(stock) || stock < 0) {
      return Result.fail(new InvalidStockError(stock));
    }
    return Result.ok(new Quantity(stock));
  }

  getValue(): number {
    return this.value;
  }

  add(other: Quantity): Result<Quantity, Error> {
    const newValue = this.value + other.value;
    if (!Number.isInteger(newValue) || newValue < 0) {
      return Result.fail(new InvalidStockError(newValue));
    }
    return Result.ok(new Quantity(newValue));
  }

  subtract(other: Quantity): Result<Quantity, InvalidStockError> {
    const newValue = this.value - other.value;
    if (newValue < 0) {
      return Result.fail(new InvalidStockError(newValue));
    }
    return Result.ok(new Quantity(newValue));
  }

  greaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  greaterThanOrEqual(other: Quantity): boolean {
    return this.value >= other.value;
  }

  lessThan(other: Quantity): boolean {
    return this.value < other.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
