import type {
  Lobby,
  LobbyId,
  LobbyName,
} from "App/Game/Yahtzee/Lobby";
import type {
  GameActions,
} from "App/Game/Yahtzee/Game";

type Maybe<T> = T | null | undefined;

export type LobbyInfo = ReturnType<Lobby["serialize"]>;
export type PlayerInfo = LobbyInfo["clients"][0];

export type ServerToClientEvents = {
  "lobby:update": (lobby: Maybe<LobbyInfo>) => void;
  "lobby:list": (lobbies: LobbyInfo[]) => void;
  "game:over": (winner: PlayerInfo) => void;
};

type WithPrefix<TKey, TPrefix extends string> =
  TKey extends string
    ? `${ TPrefix }${ TKey }`
    : never
  ;

type WithoutPrefix<TPrefixedKey, TPrefix extends string> =
  TPrefixedKey extends WithPrefix<infer TKey, TPrefix>
    ? TKey
    : ""
  ;

export type ClientToServerEvents =
  {
    "lobby:create": (name: LobbyName) => void;
    "lobby:join": (data: { id: LobbyId } | { name: LobbyName }) => void;
    "lobby:leave": () => void;
    "lobby:list": () => void;
    "lobby:info": () => void;
    "lobby:ai-player:add": () => void;
    "lobby:ai-player:remove": (playerId: string) => void;
    "game:start": () => void;
  }
  & {
  [K in WithPrefix<keyof GameActions, "game:do:">]: (...args: GameActions[WithoutPrefix<K, "game:do:">]) => void;
}
  ;

export type InterServerEvents = never;

export type SocketData = {
  lobby: Lobby | null;
};
