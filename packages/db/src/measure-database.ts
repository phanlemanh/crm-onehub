import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { basename } from "node:path";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export const MEASURE_DATABASE = {
	prefix: "crm",
	suffix: "_do",
	templateMark: "__mau",
	separator: "__",
	cleanTree: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
	maxNameLength: 63,
	hashLength: 6,
	maxAgeMs: 12 * HOUR_MS,
	commentPrefix: "crm phien do",
	buildingMark: "template-building",
	treeVariable: "PHIEN_DO_TEN_CAY",
} as const;

export type MeasureComment =
	| { kind: "session"; createdAt: number }
	| { kind: "building"; createdAt: number }
	| {
			kind: "template";
			fingerprint: string;
			createdAt: number;
			usedAt: number;
	  };

export class MeasureDatabaseError extends Error {}

export function currentTree(cwd = process.cwd()): string {
	const named = process.env[MEASURE_DATABASE.treeVariable]?.trim();
	if (named) return named;

	const top = spawnSync("git", ["rev-parse", "--show-toplevel"], {
		cwd,
		encoding: "utf8",
	});

	if (top.status !== 0) {
		throw new MeasureDatabaseError(
			`${cwd} is not inside a git checkout, so there is no tree to name a measure database after. Set ${MEASURE_DATABASE.treeVariable}.`,
		);
	}

	return basename(top.stdout.trim());
}

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

function hashOf(tree: string): string {
	return createHash("sha256")
		.update(tree)
		.digest("hex")
		.slice(0, MEASURE_DATABASE.hashLength);
}

function fit(tree: string, tail: string): string {
	const { prefix, separator, cleanTree, maxNameLength } = MEASURE_DATABASE;
	const slug = treeSlug(tree);
	const whole = cleanTree.test(tree)
		? `${prefix}_${slug}`
		: `${prefix}_${slug}${separator}${hashOf(tree)}`;
	const room = maxNameLength - tail.length;

	if (whole.length <= room) return `${whole}${tail}`;

	const hash = hashOf(tree);
	const kept = whole
		.slice(0, room - hash.length - separator.length)
		.replace(/_+$/, "");

	return `${kept}${separator}${hash}${tail}`;
}

export function measureDatabaseName(tree: string): string {
	return fit(tree, MEASURE_DATABASE.suffix);
}

export function templateDatabaseName(tree: string): string {
	return fit(
		tree,
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

export function templateBuildingComment(createdAt: number): string {
	return `${MEASURE_DATABASE.commentPrefix} ${MEASURE_DATABASE.buildingMark} created ${new Date(createdAt).toISOString()}`;
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

	const building = new RegExp(
		`^${MEASURE_DATABASE.buildingMark} created (\\S+)$`,
	).exec(rest);

	if (building) {
		const createdAt = Date.parse(building[1] ?? "");
		return Number.isNaN(createdAt) ? null : { kind: "building", createdAt };
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
