/**
 * Money Value Object
 * Encapsula lógica monetária e validações
 * Seguindo DDD - Value Object pattern
 */

import { Result } from '@shared/core/result';
import { InvalidPriceError } from '@shared/core/domain-error';

export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  private constructor(amount: number, currency: string = 'BRL') {
    this._amount = amount;
    this._currency = currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  static create(amount: number, currency: string = 'BRL'): Result<Money, InvalidPriceError> {
    if (amount < 0) {
      return Result.fail(new InvalidPriceError(amount));
    }

    // Arredonda para 2 casas decimais
    const roundedAmount = Math.round(amount * 100) / 100;
    return Result.ok(new Money(roundedAmount, currency));
  }

  getValue(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Result<Money, Error> {
    if (this.currency !== other.currency) {
      return Result.fail(new Error('Cannot add money with different currencies'));
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Result<Money, Error> {
    if (this.currency !== other.currency) {
      return Result.fail(new Error('Cannot subtract money with different currencies'));
    }
    return Money.create(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Result<Money, InvalidPriceError> {
    return Money.create(this.amount * factor, this.currency);
  }

  greaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  greaterThanOrEqual(other: Money): boolean {
    return this.amount >= other.amount;
  }

  lessThan(other: Money): boolean {
    return this.amount < other.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
