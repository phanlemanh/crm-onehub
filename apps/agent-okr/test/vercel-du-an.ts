import { readFileSync } from "node:fs";
import { join } from "node:path";
import { minimatch } from "minimatch";
import { z } from "zod";

export const GOC_KHO = join(import.meta.dir, "..", "..", "..");

export const DU_AN = [
	{ ten: "crm-onehub-app", tep: "apps/app/vercel.json" },
	{ ten: "crm-onehub-api", tep: "vercel.json" },
	{ ten: "crm-onehub-agent", tep: "apps/agent/vercel.json" },
	{ ten: "agent-okr", tep: "apps/agent-okr/vercel.json" },
] as const;

export const NHANH = [
	"feat/a",
	"fix/a",
	"docs/a",
	"chore/a",
	"claude/a",
	"proto/a",
	"test/a",
	"ci/a",
	"ops/a",
	"thu/a",
	"tam/a",
	"dependabot/npm_and_yarn/a",
	"main",
	"release",
	"test-lane-per-run",
	"onehub-thu",
	"onehub/con",
	"sao-luu/onehub",
] as const;

export const cauHinhVercel = z
	.object({
		$schema: z.string(),
		git: z
			.object({
				deploymentEnabled: z.record(z.string(), z.boolean()),
			})
			.strict(),
	})
	.strict();

export type LuatTrienKhai = z.infer<typeof cauHinhVercel>;

export function docTho(tep: string): unknown {
	return JSON.parse(readFileSync(join(GOC_KHO, tep), "utf8"));
}

export function duocTrienKhai(
	cauHinh: { git: { deploymentEnabled: Record<string, boolean> } },
	nhanh: string,
): boolean {
	const khop = Object.entries(cauHinh.git.deploymentEnabled).filter(([mau]) =>
		minimatch(nhanh, mau),
	);
	if (khop.length === 0) return true;
	return khop.some(([, bat]) => bat);
}
