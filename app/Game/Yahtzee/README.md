# Application

The game logic is split into distinct entities modeled as classes.

## `Die`

Models the dice used in the game.

It is mostly a data class with some minor convenience methods to keep state from leaking.

## `Cup`

Models handling the dice in the game.

It wraps relevant `Die` methods and keeps track of the dice in the cup.

## `ScoreSheet`

Handles keeping track of the scores for a `Cup`.

It is the analogue of the paper scoresheet provided with the real life game.

## `Scorer`

Calculates the scores for a `Cup`.

It models the actual rules of the game. Default implementations are provided for the scoring rules of the base game,
but can be extended with novel categories.

## `Player`

Models a player in the game.

Each player has a `Cup` and a `ScoreSheet`. Mostly a dumb data class, but can be extended to implement AI/Bot players.

## `Game`

Models the game/table being played.

It handles the interactions between the players and the game logic. Keeps track of player actions and turn count.

## `Lobby`

Helps handle a game lobby.

Lobbies are used to coordinate play before the actual game starts and abstracts the game itself from the clients.
