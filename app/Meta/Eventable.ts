export abstract class Eventable<EventMap extends Record<string, (...args: any[]) => any>> {
  private handlers: Map<keyof EventMap, EventMap[keyof EventMap]>;

  protected constructor() {
    this.handlers = new Map();
  }

  public on<Event extends keyof EventMap>(event: Event, handler: EventMap[Event]): this {
    this.handlers.set(event, handler);

    return this;
  }

  protected async publish<Event extends keyof EventMap, Handler extends EventMap[Event]>(event: Event, ...args: Parameters<Handler>) {
    if (this.handlers.has(event)) {
      await (this.handlers.get(event) as Handler)(...args);
    }
  }
}
