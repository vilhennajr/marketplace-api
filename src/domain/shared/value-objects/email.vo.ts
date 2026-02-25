/**
 * Email Value Object
 * Encapsula validação e comportamento de email
 * Seguindo DDD - Value Object pattern
 */

import { Result } from '@shared/core/result';
import { InvalidEmailError } from '@shared/core/domain-error';

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  static create(email: string): Result<Email, InvalidEmailError> {
    if (!Email.isValid(email)) {
      return Result.fail(new InvalidEmailError(email));
    }
    return Result.ok(new Email(email.toLowerCase().trim()));
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
