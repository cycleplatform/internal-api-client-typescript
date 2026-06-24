import { readFile } from "node:fs/promises";
import type { components } from "./generated/types";
import { asError, type Result } from "./util/result";

export type EnvironmentMetadata = {
    id: string;
    deployments: {
        tags: components["schemas"]["EnvironmentDeploymentTags"];
    } | null;
    private_network: components["schemas"]["PrivateNetwork"];
    services: components["schemas"]["EnvironmentServices"];
};

const ENVIRONMENT_METADATA_PATH = "/var/run/cycle/metadata/environment.json";

/**
 * Reads the environment metadata file mounted inside this instance.
 *
 * See: https://cycle.io/docs/platform/container-environment-variables#environment-metadata-file
 */
export async function getEnvironmentMetadata(): Promise<
    Result<EnvironmentMetadata>
> {
    let raw: string;

    try {
        raw = await readFile(ENVIRONMENT_METADATA_PATH, "utf8");
    } catch (err) {
        return { data: null, error: asError(err) };
    }

    try {
        const metadata = JSON.parse(raw) as EnvironmentMetadata;
        return { data: metadata, error: null };
    } catch (err) {
        return { data: null, error: asError(err) };
    }
}
