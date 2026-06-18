# Cycle Internal API Client - NodeJS

A Cycle API client for the internal API located within every container running on the Cycle platform.

This client communicates over the Unix socket mounted at `/var/run/cycle/api/api.sock` inside every Cycle container instance. It is intended to run inside a container on the Cycle platform and is not usable from a browser.

_This is an auto-generated API client based on the [OpenAPI Spec for Cycle](https://github.com/cycleplatform/api-spec). Please do not open any PRs for the generated code under /src/generated. If you have any questions on what changes are made in the latest version, please refer to the spec above._

## Basics

This client utilizes [openapi-typescript](https://github.com/drwpow/openapi-typescript) to generate the type definitions for our client. The client itself is a pre-built [openapi-fetch](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-fetch) client for convenience.

Every request should be typesafe, and only endpoints described in the spec will be valid in Typescript as the first parameter to `GET`, `POST`, `PATCH`, or `DELETE`.

## Usage

### Installation

```bash
npm i @cycleplatform/internal-api-client
```

### Making a Request

The internal API authenticates using the token provided to the instance through the `CYCLE_API_TOKEN` environment variable. Pass it to `getClient` along with an optional socket path.

```ts
import { getClient } from "@cycleplatform/internal-api-client";

const client = getClient({
    token: process.env.CYCLE_API_TOKEN,
});

const resp = await client.GET("/v1/container/instances", {
    params: {
        query: {
            // ...
        },
    },
});

console.log(resp.data, resp.error);
```

By default the client connects to the socket at `/var/run/cycle/api/api.sock`. You can override this with the `socketPath` option:

```ts
const client = getInternalClient({
    token: process.env.CYCLE_API_TOKEN,
    socketPath: "/custom/path/api.sock",
});
```

## Development

### Cloning submodules

`git submodule update --recursive --remote`

### Building

To build a local copy of this client, run `npm run build:lib` to create a `./dist` folder with the necessary files.

### Testing

`npm run test:ts && npm run test`
