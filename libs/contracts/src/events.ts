export interface OrderCreatedEvent {
  eventId: string;
  orderId: number;
  userId: number;
  total: string;
  occurredAt: string;
}