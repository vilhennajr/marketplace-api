/**
 * Slug Value Object
 * Garante que slugs sejam válidos e seguros para URLs
 * Seguindo DDD - Value Object pattern
 */

import { Result } from '@shared/core/result';
import { InvalidSlugError } from '@shared/core/domain-error';

export class Slug {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static create(text: string): Result<Slug, InvalidSlugError> {
    const slug = Slug.slugify(text);

    if (!Slug.isValid(slug)) {
      return Result.fail(new InvalidSlugError(slug));
    }

    return Result.ok(new Slug(slug));
  }

  static createFromSlug(slug: string): Result<Slug, InvalidSlugError> {
    if (!Slug.isValid(slug)) {
      return Result.fail(new InvalidSlugError(slug));
    }
    return Result.ok(new Slug(slug));
  }

  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/[\s_-]+/g, '-') // Substitui espaços por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens no início/fim
  }

  private static isValid(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 200;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
