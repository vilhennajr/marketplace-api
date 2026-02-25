/**
 * Domain Errors
 * Erros específicos do domínio, não acoplados a framework
 */

export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Email '${email}' is invalid`);
  }
}

export class InvalidPriceError extends DomainError {
  constructor(price: number) {
    super(`Price '${price}' must be greater than or equal to 0`);
  }
}

export class InvalidStockError extends DomainError {
  constructor(stock: number) {
    super(`Stock '${stock}' must be greater than or equal to 0`);
  }
}

export class InsufficientStockError extends DomainError {
  constructor(requested: number, available: number) {
    super(`Insufficient stock. Requested: ${requested}, Available: ${available}`);
  }
}

export class InvalidSlugError extends DomainError {
  constructor(slug: string) {
    super(`Slug '${slug}' is invalid. Must be lowercase and use hyphens`);
  }
}

export class InvalidNameError extends DomainError {
  constructor(name: string) {
    super(`Name '${name}' is invalid. Must be at least 3 characters`);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id '${id}' not found`);
  }
}

export class EntityAlreadyExistsError extends DomainError {
  constructor(entityName: string, field: string, value: string) {
    super(`${entityName} with ${field} '${value}' already exists`);
  }
}

export class InvalidQuantityError extends DomainError {
  constructor(quantity: number) {
    super(`Quantity '${quantity}' must be greater than 0`);
  }
}
