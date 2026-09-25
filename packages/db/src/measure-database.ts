import { createHash } from "node:crypto";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export const MEASURE_DATABASE = {
	prefix: "crm",
	suffix: "_do",
	templateMark: "_mau",
	maxNameLength: 63,
	hashLength: 6,
	maxAgeMs: 12 * HOUR_MS,
	commentPrefix: "crm phien do",
	treeVariable: "PHIEN_DO_TEN_CAY",
} as const;

export type MeasureComment =
	| { kind: "session"; createdAt: number }
	| {
			kind: "template";
			fingerprint: string;
			createdAt: number;
			usedAt: number;
	  };

export function treeSlug(tree: string): string {
	const slug = tree
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");

	if (!slug) {
		throw new Error(
			`The tree name "${tree}" has no letter or digit left after slugging, so it cannot name a measure database.`,
		);
	}

	return slug;
}

function fit(slug: string, tail: string): string {
	const stem = `${MEASURE_DATABASE.prefix}_${slug}`;
	const room = MEASURE_DATABASE.maxNameLength - tail.length;

	if (stem.length <= room) return `${stem}${tail}`;

	const hash = createHash("sha256")
		.update(slug)
		.digest("hex")
		.slice(0, MEASURE_DATABASE.hashLength);
	const kept = stem
		.slice(0, room - MEASURE_DATABASE.hashLength - 1)
		.replace(/_+$/, "");

	return `${kept}_${hash}${tail}`;
}

export function measureDatabaseName(tree: string): string {
	return fit(treeSlug(tree), MEASURE_DATABASE.suffix);
}

export function templateDatabaseName(tree: string): string {
	return fit(
		treeSlug(tree),
		`${MEASURE_DATABASE.templateMark}${MEASURE_DATABASE.suffix}`,
	);
}

export function isTemplateDatabase(name: string): boolean {
	return name.endsWith(
		`${MEASURE_DATABASE.templateMark}${MEASURE_DATABASE.suffix}`,
	);
}

export function isMeasureDatabase(name: string): boolean {
	return name.endsWith(MEASURE_DATABASE.suffix) && !isTemplateDatabase(name);
}

export function sessionComment(createdAt: number): string {
	return `${MEASURE_DATABASE.commentPrefix} session created ${new Date(createdAt).toISOString()}`;
}

export function templateComment(
	fingerprint: string,
	createdAt: number,
	usedAt: number,
): string {
	return `${MEASURE_DATABASE.commentPrefix} template ${fingerprint} created ${new Date(createdAt).toISOString()} used ${new Date(usedAt).toISOString()}`;
}

export function parseMeasureComment(
	text: string | null | undefined,
): MeasureComment | null {
	if (!text?.startsWith(`${MEASURE_DATABASE.commentPrefix} `)) return null;

	const rest = text.slice(MEASURE_DATABASE.commentPrefix.length + 1);
	const session = /^session created (\S+)$/.exec(rest);

	if (session) {
		const createdAt = Date.parse(session[1] ?? "");
		return Number.isNaN(createdAt) ? null : { kind: "session", createdAt };
	}

	const template = /^template (\S+) created (\S+) used (\S+)$/.exec(rest);
	if (!template) return null;

	const createdAt = Date.parse(template[2] ?? "");
	const usedAt = Date.parse(template[3] ?? "");
	if (Number.isNaN(createdAt) || Number.isNaN(usedAt)) return null;

	return {
		kind: "template",
		fingerprint: template[1] ?? "",
		createdAt,
		usedAt,
	};
}

export function lastTouched(comment: MeasureComment): number {
	return comment.kind === "template"
		? Math.max(comment.createdAt, comment.usedAt)
		: comment.createdAt;
}
