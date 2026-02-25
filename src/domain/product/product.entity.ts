import { Money } from '../shared/value-objects/money.vo';
import { Slug } from '../shared/value-objects/slug.vo';
import { Quantity } from '../shared/value-objects/quantity.vo';
import { Result } from '../../shared/core/result';
import { InsufficientStockError, InvalidPriceError } from '../../shared/core/domain-error';

export interface ProductProps {
  id: string;
  name: string;
  slug: Slug;
  description?: string;
  price: Money;
  stock: Quantity;
  images: string[];
  categoryId?: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class ProductEntity {
  private constructor(private props: ProductProps) {}

  static create(
    props: Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'price' | 'stock'> & {
      slugText: string;
      priceAmount: number;
      stockAmount: number;
    },
  ): Result<ProductEntity, Error> {
    const slugOrError = Slug.create(props.slugText);
    if (slugOrError.isFailure) {
      return Result.fail(slugOrError.getError());
    }

    const priceOrError = Money.create(props.priceAmount);
    if (priceOrError.isFailure) {
      return Result.fail(priceOrError.getError());
    }

    const stockOrError = Quantity.create(props.stockAmount);
    if (stockOrError.isFailure) {
      return Result.fail(stockOrError.getError());
    }

    const product = new ProductEntity({
      id: crypto.randomUUID(),
      name: props.name,
      slug: slugOrError.getValue(),
      description: props.description,
      price: priceOrError.getValue(),
      stock: stockOrError.getValue(),
      images: props.images,
      categoryId: props.categoryId,
      companyId: props.companyId,
      isActive: props.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: props.deletedAt,
    });

    return Result.ok(product);
  }

  static reconstitute(props: ProductProps): ProductEntity {
    return new ProductEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get slugValue(): string {
    return this.props.slug.getValue();
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get price(): Money {
    return this.props.price;
  }

  get priceValue(): number {
    return this.props.price.amount;
  }

  get stock(): Quantity {
    return this.props.stock;
  }

  get stockValue(): number {
    return this.props.stock.getValue();
  }

  get images(): string[] {
    return this.props.images;
  }

  get categoryId(): string | undefined {
    return this.props.categoryId;
  }

  get companyId(): string {
    return this.props.companyId;
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

  hasStock(quantity: number): boolean {
    const quantityOrError = Quantity.create(quantity);
    if (quantityOrError.isFailure) {
      return false;
    }
    return this.props.stock.getValue() >= quantityOrError.getValue().getValue();
  }

  decreaseStock(quantity: number): Result<void, Error> {
    const quantityOrError = Quantity.create(quantity);
    if (quantityOrError.isFailure) {
      return Result.fail(quantityOrError.getError());
    }

    const newStockOrError = this.props.stock.subtract(quantityOrError.getValue());
    if (newStockOrError.isFailure) {
      return Result.fail(newStockOrError.getError());
    }

    this.props.stock = newStockOrError.getValue();
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  increaseStock(quantity: number): Result<void, Error> {
    const quantityOrError = Quantity.create(quantity);
    if (quantityOrError.isFailure) {
      return Result.fail(quantityOrError.getError());
    }

    const newStockOrError = this.props.stock.add(quantityOrError.getValue());
    if (newStockOrError.isFailure) {
      return Result.fail(newStockOrError.getError());
    }

    this.props.stock = newStockOrError.getValue();
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  updatePrice(price: number): Result<void, Error> {
    const priceOrError = Money.create(price);
    if (priceOrError.isFailure) {
      return Result.fail(priceOrError.getError());
    }

    this.props.price = priceOrError.getValue();
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  update(data: Partial<Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt'>>): void {
    Object.assign(this.props, data);
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

  toJSON(): ProductProps {
    return { ...this.props };
  }
}
