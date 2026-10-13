import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseEnv } from "@crm/env";
import { hostCua, laKhoCucBo, loiKhoXa } from "../src/kho-cuc-bo";

const command = process.argv[2] ?? "this command";
const resolved = resolveDatabaseUrl();

if (!resolved) {
	console.error(
		`\n  ${command} needs DATABASE_URL, and nothing set it.` +
			"\n  Copy .env.example to .env at the repo root.\n",
	);
	process.exit(1);
}

const host = hostCua(resolved.url);

if (laKhoCucBo(resolved.url)) process.exit(0);

if (process.env.ALLOW_REMOTE_DB === "1") {
	console.warn(`\n  ⚠ ${command} is running against ${host} — not local.\n`);
	process.exit(0);
}

console.error(loiKhoXa(command, resolved.url, resolved.from));

process.exit(1);

function resolveDatabaseUrl(): { url: string; from: string } | null {
	const root = workspaceRoot();

	if (root) {
		for (const file of [".env.local", ".env"]) {
			const path = join(root, file);
			try {
				const url = parseEnv(readFileSync(path, "utf8")).DATABASE_URL;
				if (url) return { url, from: file };
			} catch {}
		}
	}

	const fromEnvironment = process.env.DATABASE_URL;
	return fromEnvironment
		? { url: fromEnvironment, from: "the environment" }
		: null;
}

function workspaceRoot(): string | null {
	let directory = process.cwd();

	while (true) {
		try {
			const manifest = JSON.parse(
				readFileSync(join(directory, "package.json"), "utf8"),
			) as { workspaces?: unknown };
			if (manifest.workspaces) return directory;
		} catch {}

		const parent = dirname(directory);
		if (parent === directory) return null;
		directory = parent;
	}
}
