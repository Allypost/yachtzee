export abstract class Eventable<EventMap extends Record<string, (...args: any[]) => any>> {
  private handlers: Map<keyof EventMap, EventMap[keyof EventMap][]>;

  protected constructor() {
    this.handlers = new Map();
  }

  public on<Event extends keyof EventMap>(event: Event, handler: EventMap[Event]): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }

    this.handlers.get(event)!.push(handler);

    return this;
  }

  protected async publish<Event extends keyof EventMap, Handler extends EventMap[Event]>(event: Event, ...args: Parameters<Handler>) {
    if (!this.handlers.has(event)) {
      return;
    }

    for (const handler of this.handlers.get(event)!) {
      await handler(...args);
    }
  }
}
