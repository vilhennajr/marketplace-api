/**
 * Slug Value Object
 * Follows DDD principles - ensures slug format
 */

import { ValueObject } from '@shared/core/value-object';
import { Result } from '@shared/core/result';

interface SlugProps {
  value: string;
}

export class Slug extends ValueObject<SlugProps> {
  private constructor(props: SlugProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, ''); // Trim - from end
  }

  public static create(slug: string): Result<Slug> {
    if (!slug || slug.trim().length === 0) {
      return Result.fail<Slug>(new Error('Slug is required'));
    }

    const slugified = this.slugify(slug);

    if (slugified.length < 3) {
      return Result.fail<Slug>(new Error('Slug must be at least 3 characters'));
    }

    if (slugified.length > 100) {
      return Result.fail<Slug>(new Error('Slug must be at most 100 characters'));
    }

    return Result.ok<Slug>(new Slug({ value: slugified }));
  }

  public static createFromText(text: string): Result<Slug> {
    return this.create(text);
  }
}
