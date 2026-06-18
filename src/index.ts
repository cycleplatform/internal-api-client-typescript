import createClient from "openapi-fetch";
import { Agent, fetch as undiciFetch } from "undici";
import type { components, operations, paths } from "./generated/types";

export type { components, operations, paths };

export function getClient({
    token = process.env.CYCLE_API_TOKEN,
    socketPath = "/var/run/cycle/api/api.sock",
}: {
    token?: string;
    socketPath?: string;
} = {}) {
    if (!token) {
        throw new Error(
            "CYCLE_API_TOKEN is not set. The internal API requires a token from the instance environment.",
        );
    }

    const agent = new Agent({
        connect: {
            socketPath,
        },
    });

    const socketFetch: typeof fetch = (input, init) => {
        return undiciFetch(input as any, {
            ...(init as any),
            dispatcher: agent,
        }) as unknown as Promise<Response>;
    };

    // baseUrl host is arbitrary. The dispatcher routes to the socket,
    // not DNS. It just needs to be a valid absolute URL so paths resolve.
    const client = createClient<paths>({
        baseUrl: "http://localhost",
        fetch: socketFetch,
        headers: {
            "X-CYCLE-TOKEN": token,
        },
    });

    return client;
}
