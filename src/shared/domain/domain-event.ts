/**
 * Domain Events (DDD Pattern)
 * Follows Open/Closed Principle (SOLID)
 */

export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): string;
}

export abstract class DomainEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor() {
    this.dateTimeOccurred = new Date();
  }

  abstract getAggregateId(): string;
}
