const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export const TEST_DATABASE = {
	suffix: "_test",
	run: {
		maxAgeMs: 6 * HOUR_MS,
		commentPrefix: "crm test run",
	},
} as const;

export function databaseName(url: string): string {
	try {
		return new URL(url).pathname.replace(/^\//, "");
	} catch {
		return url;
	}
}

export function runIdSlug(runId: string): string {
	return runId.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function mintRunId(): string {
	const time = Date.now().toString(36);
	const noise = Math.floor(Math.random() * 36 ** 4)
		.toString(36)
		.padStart(4, "0");

	return `${time}${noise}`;
}

export function runScopedName(name: string, runId: string | undefined): string {
	if (!runId) return name;

	if (!name.endsWith(TEST_DATABASE.suffix)) {
		throw new Error(
			`A test database must end in ${TEST_DATABASE.suffix} before a run id can be put in front of it. It names "${name}".`,
		);
	}

	const slug = runIdSlug(runId);

	if (!slug) {
		throw new Error(
			`TEST_RUN_ID "${runId}" has no letter or digit left after slugging, so it cannot name a database of its own.`,
		);
	}

	const scopedSuffix = `_${slug}${TEST_DATABASE.suffix}`;
	if (name.endsWith(scopedSuffix)) return name;

	const stem = name.slice(0, -TEST_DATABASE.suffix.length);

	return `${stem}${scopedSuffix}`;
}

export function runScopedUrl(url: string, runId: string | undefined): string {
	if (!runId) return url;

	const parsed = new URL(url);
	parsed.pathname = `/${runScopedName(databaseName(url), runId)}`;

	return parsed.toString();
}
