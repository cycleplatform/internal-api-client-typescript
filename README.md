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

const client = getClient();

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
const client = getClient({
    token: process.env.CYCLE_API_TOKEN,
    socketPath: "/custom/path/api.sock",
});
```

### Streaming Notifications

Beyond REST requests, the internal API exposes a **notification pipeline**: a one-way streaming WebSocket over the same Unix socket that pushes real-time notifications as things happen on the hub. Each message identifies a single event: its `topic`, the `object` it concerns, and a `context` of related resource IDs. Use the REST client to fetch fuller detail when a notification warrants it.

It authenticates with the `CYCLE_API_TOKEN` environment variable by default, just like `getClient`.

```ts
import { NotificationSocket } from "@cycleplatform/internal-api-client";

const socket = new NotificationSocket();

socket.on("open", () => console.log("OPEN"));
socket.on("notification", (n) => console.log("NOTIFICATION:", n));
socket.on("error", (err) => console.error("ERROR:", err.message));
socket.on("close", (code, reason) => console.log("CLOSE:", code, reason));

socket.connect();
```

Attach your listeners _before_ calling `connect()`. `NotificationSocket` is a Node `EventEmitter`, and an emitted `error` with no listener attached will throw.

A received notification looks like this:

```json
{
    "topic": "environment.deployments.reconfigured",
    "object": { "id": "68518ade194b15be6bfd0a1e" },
    "context": {
        "label": null,
        "hub_id": "5a14ddd8b6393d0001976f44",
        "account_id": null,
        "environments": [
            "68518ade194b15be6bfd0a1e",
            "6813cd199cb8434cb64067c9"
        ],
        "dns_zones": null,
        "clusters": ["production"],
        "containers": null,
        "virtual_machines": null
    }
}
```

Call `socket.close()` to disconnect and stop reconnecting. The `socket.connected` getter reports whether the underlying socket is currently open.

If you just want to connect with the defaults, `connectNotifications(options)` constructs and connects in a single call, returning the socket:

```ts
import { connectNotifications } from "@cycleplatform/internal-api-client";

const socket = connectNotifications();
socket.on("notification", (n) => console.log(n));
```

### Reading Environment Metadata

Cycle mounts a metadata file inside every instance describing its environment: the environment ID, deployment tags, private network, and active services. `getEnvironmentMetadata()` reads and parses that file for you.

It returns a `Result` (`{ data, error }`) so check `error` before using `data`:

```ts
import { getEnvironmentMetadata } from "@cycleplatform/internal-api-client";

const { data, error } = await getEnvironmentMetadata();
if (error) {
    console.error("failed to read environment metadata:", error.message);
} else {
    console.log(data.id, data.services);
}
```

See [Environment Metadata File](https://cycle.io/docs/platform/container-environment-variables#environment-metadata-file) for the full field reference.

## Development

### Cloning submodules

`git submodule update --recursive --remote`

### Building

To build a local copy of this client, run `npm run build:lib` to create a `./dist` folder with the necessary files.

### Testing

`npm run test:ts && npm run test`
