# Yahtzee (Jamb)

This is a simple application that allows you to play the game of Yahtzee.
Currently, the game supports multiplayer with optional AI players.


## Code structure overview

The application is built using TypeScript and the [Adonis](https://adonisjs.com/) framework
with [Socket.IO](https://socket.io/) for handling real-time gameplay.
[japa](https://japa.dev/) is used as the testing framework
with [Sinon.JS](https://sinonjs.org/) as the mocking library.
Most of the application specific code and documentation is
in the [`app/Game/Yahtzee`](./app/Game/Yahtzee) directory.
The socket server is in [`start/socket.ts`](./start/socket.ts).

Socket.IO is modelled using TypeScript so events sent to/from the server should be type-safe..


## Architecture

Most of the game logic is handled by entities modeled as classes.
Focus is put on event-oriented architecture because of the nature of the game.


## Running the application

There are two main ways to run the application:
1. Directly via yarn
2. Via Docker


### Run via Yarn

Steps:
1. `yarn install` - Install dependencies
2. `yarn build` - Build the application
3. 
    1. (Option 1) Copy `.env.example` to `build/.env` and change values to match your environment
    2. (Option 2) Set environment keys as defined in `.env.example`
4. `cd build` - Change to the build directory where the build artefacts are stored
5. `yarn install --production` - Install the dependencies for the production build
6. `node server.js` - Run the application


## Developing the application

Linting is done via [eslint](https://eslint.org/).
CI is done via GitHub Actions. A pre-commit hook should be registered upon installing the dependencies.

Steps to setup a development environment:
1. `yarn install` - Install dependencies
2. `yarn dev` - Run the dev server. Should include automatic reloading of the application (frontend + backend)
