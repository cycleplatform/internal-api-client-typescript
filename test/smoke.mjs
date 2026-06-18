// Socket smoke test for @cycleplatform/internal-api-client.
//
// Spins up a throwaway HTTP server bound to a Unix socket, points the client
// at that socket, makes a request, and asserts the round trip works. This
// exercises the real undici dispatcher + socket-path plumbing without needing
// a live Cycle platform.
//
// Run: node test/smoke.mjs

import { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Import the built client from dist.
import { getClient } from "../dist/index.js";

const TOKEN = "test-token-123";

// Put the socket in a temp dir so we do not need /var/run permissions and so
// repeat runs do not collide on a stale socket file.
const sockDir = mkdtempSync(join(tmpdir(), "cycle-sock-"));
const socketPath = join(sockDir, "api.sock");

let failed = false;

function assert(condition, message) {
  if (condition) {
    console.log(`  ok: ${message}`);
  } else {
    failed = true;
    console.error(`  FAIL: ${message}`);
  }
}

// Mock internal API. Returns a canned environment payload and echoes back the
// auth header so we can assert the client sent it.
const server = http.createServer((req, res) => {
  if (req.url === "/v1/environment" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        receivedToken: req.headers["x-cycle-token"] ?? null,
        data: { id: "env-mock-0001" },
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { code: "not_found" } }));
});

async function main() {
  await new Promise((resolve) => server.listen(socketPath, resolve));
  console.log(`mock server listening on ${socketPath}`);

  const client = getClient({
    token: TOKEN,
    socketPath,
  });

  const resp = await client.GET("/v1/environment");

  assert(resp.error === undefined, "request completed without error");
  assert(resp.data !== undefined, "response carried a data payload");
  assert(
    resp.data?.receivedToken === TOKEN,
    "client sent X-CYCLE-TOKEN over the socket"
  );
  assert(
    resp.data?.data?.id === "env-mock-0001",
    "client parsed the JSON body from the socket"
  );
}

main()
  .catch((err) => {
    failed = true;
    console.error("smoke test threw:", err);
  })
  .finally(() => {
    server.close();
    rmSync(sockDir, { recursive: true, force: true });
    if (failed) {
      console.error("\nSMOKE TEST FAILED");
      process.exit(1);
    }
    console.log("\nSMOKE TEST PASSED");
    process.exit(0);
  });