# Smoke-test container for @cycleplatform/internal-api-client.
#
# Verifies two things without a live Cycle platform:
#   1. The package builds, installs, and imports cleanly.
#   2. The client speaks HTTP over a Unix socket correctly, by hitting a
#      mock server bound to a socket inside this container.
#
# Build from the repo root (NOT from test/), so the context includes
# package.json, src/, and the api-spec submodule:
#   docker build -f test/Dockerfile -t internal-api-client-test .
# Run:
#   docker run --rm internal-api-client-test

FROM node:25-bookworm-slim

WORKDIR /app

# Install deps first for layer caching. Use --ignore-scripts so the package's
# `prepare` hook (vite build) does NOT run here -- at this point only
# package.json is present, so a build would fail. The real build runs below,
# after the full source (including src/ and the api-spec submodule) is copied.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Bring in the rest of the source, including the api-spec submodule contents
# and the test harness.
COPY . .

# Generate types from the spec and build the library.
RUN npm run build:lib

# Run the socket smoke test against the freshly built dist.
CMD ["node", "test/smoke.mjs"]