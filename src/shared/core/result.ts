/**
 * Result Pattern for better error handling
 * Follows SOLID principles (Single Responsibility)
 * Generic Result<T, E> where T is the success value and E is the error type
 */

export class Result<T, E extends Error = Error> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly error?: E;
  private readonly value?: T;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this.value = value;
    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this.value as T;
  }

  public getError(): E {
    return this.error as E;
  }

  public getErrorMessage(): string {
    return this.error?.message ?? 'Unknown error';
  }

  public static ok<U>(value?: U): Result<U, never> {
    return new Result(true, undefined as never, value);
  }

  public static fail<U, E extends Error = Error>(error: E): Result<U, E> {
    return new Result<U, E>(false, error);
  }

  public static combine(results: Result<any, any>[]): Result<any, any> {
    for (const result of results) {
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok();
  }
}
