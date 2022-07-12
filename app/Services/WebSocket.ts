import {
  Server,
} from "socket.io";
import AdonisServer from "@ioc:Adonis/Core/Server";
import type {
  DefaultEventsMap,
  EventsMap,
} from "socket.io/dist/typed-events";

class Ws<ListenEvents extends EventsMap = DefaultEventsMap, EmitEvents extends EventsMap = ListenEvents, ServerSideEvents extends EventsMap = DefaultEventsMap, SocketData = any> {
  public socketIo: Server<ListenEvents, EmitEvents, ServerSideEvents, SocketData>;

  private booted = false;

  get io() {
    return this.socketIo;
  }

  public boot() {
    if (this.booted) {
      return this;
    }

    this.booted = false;
    this.socketIo = new Server(
      AdonisServer.instance,
      {
        cors: {
          origin: "*",
        },
      },
    );

    return this;
  }
}

const _server = new Ws();

export const SocketServer =
  <ListenEvents extends EventsMap = DefaultEventsMap,
    EmitEvents extends EventsMap = ListenEvents,
    ServerSideEvents extends EventsMap = DefaultEventsMap,
    SocketData = any>() =>
    _server as Ws<ListenEvents, EmitEvents, ServerSideEvents, SocketData>
;
