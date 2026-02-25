export interface CartItemProps {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CartItemEntity {
  private constructor(private props: CartItemProps) {}

  static create(props: Omit<CartItemProps, 'id' | 'createdAt' | 'updatedAt'>): CartItemEntity {
    return new CartItemEntity({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: CartItemProps): CartItemEntity {
    return new CartItemEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get price(): number {
    return this.props.price;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get subtotal(): number {
    return this.props.quantity * this.props.price;
  }

  updateQuantity(quantity: number): void {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    this.props.quantity = quantity;
    this.props.updatedAt = new Date();
  }

  increaseQuantity(amount: number = 1): void {
    this.props.quantity += amount;
    this.props.updatedAt = new Date();
  }

  decreaseQuantity(amount: number = 1): void {
    if (this.props.quantity - amount < 1) {
      throw new Error('Quantity cannot be less than 1');
    }
    this.props.quantity -= amount;
    this.props.updatedAt = new Date();
  }

  toJSON(): CartItemProps {
    return { ...this.props };
  }
}

export interface CartProps {
  id: string;
  userId?: string;
  sessionId?: string;
  status: string;
  items: CartItemEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export class CartEntity {
  private constructor(private props: CartProps) {}

  static create(props: Omit<CartProps, 'id' | 'createdAt' | 'updatedAt'>): CartEntity {
    return new CartEntity({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: CartProps): CartEntity {
    return new CartEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get sessionId(): string | undefined {
    return this.props.sessionId;
  }

  get status(): string {
    return this.props.status;
  }

  get items(): CartItemEntity[] {
    return this.props.items;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get total(): number {
    return this.props.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get itemCount(): number {
    return this.props.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  addItem(item: CartItemEntity): void {
    const existingItem = this.props.items.find((i) => i.productId === item.productId);

    if (existingItem) {
      existingItem.increaseQuantity(item.quantity);
    } else {
      this.props.items.push(item);
    }

    this.props.updatedAt = new Date();
  }

  removeItem(productId: string): void {
    this.props.items = this.props.items.filter((item) => item.productId !== productId);
    this.props.updatedAt = new Date();
  }

  updateItemQuantity(productId: string, quantity: number): void {
    const item = this.props.items.find((i) => i.productId === productId);

    if (!item) {
      throw new Error('Item not found in cart');
    }

    item.updateQuantity(quantity);
    this.props.updatedAt = new Date();
  }

  clear(): void {
    this.props.items = [];
    this.props.updatedAt = new Date();
  }

  checkout(): void {
    this.props.status = 'completed';
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      ...this.props,
      items: this.props.items.map((item) => item.toJSON()),
    };
  }
}
