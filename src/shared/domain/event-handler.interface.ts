/**
 * Domain Event Handler interface
 * Follows Interface Segregation Principle (SOLID)
 */

import { IDomainEvent } from './domain-event';

export interface IEventHandler<T extends IDomainEvent> {
  handle(event: T): Promise<void>;
}
