import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { GOC } from "./chung.mjs";

const { parseEvals } = createRequire(import.meta.url)(join(GOC, "lib", "eval-yaml.cjs"));

export const UOC = {
	phutSuite: 6,
	phutEval: 0.35,
	phutMan: 8,
	dauHieuMan: /tien-de|do:man|puppeteer|chrome/,
	evalDai: {
		"chuyen-goi-dieu-phoi/E10": 35,
	},
};

function lanRieng() {
	const theoLan = new Map();
	const dir = join(GOC, "_acceptance");
	for (const d of readdirSync(dir)) {
		const p = join(dir, d, "run-log.jsonl");
		if (!existsSync(p)) continue;
		for (const l of readFileSync(p, "utf8").split("\n")) {
			try {
				const j = JSON.parse(l);
				if (j.kind === "repin" && j.wall_s && j.run_id) {
					const cu = theoLan.get(j.run_id) ?? { wall: j.wall_s, slugs: new Set(), ts: j.ts };
					cu.slugs.add(d);
					theoLan.set(j.run_id, cu);
				}
			} catch {}
		}
	}
	const ra = new Map();
	for (const l of theoLan.values()) {
		if (l.slugs.size !== 1) continue;
		const [s] = l.slugs;
		const cu = ra.get(s);
		if (!cu || l.ts > cu.ts) ra.set(s, { phut: l.wall / 60, ts: l.ts });
	}
	return ra;
}

const RIENG = lanRieng();

const CFG = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");

export function tranLan() {
	const m = CFG.match(/^\s*repin_budget_min:\s*(\d+)/m);
	if (!m) throw new Error("config thieu feature_loop.repin_budget_min");
	return Number(m[1]);
}

function lenhCua(ref) {
	const khoa = ref.split(".").pop();
	const m = CFG.match(new RegExp(`^\\s+${khoa}:\\s*(.*)$`, "m"));
	return m ? m[1] : "";
}

export function uocHoSo(slug, evals) {
	const rieng = RIENG.get(slug);
	if (rieng) return Math.max(rieng.phut - UOC.phutSuite, UOC.phutEval);
	const p = join(GOC, "_acceptance", slug, "evals.yaml");
	const cmd = new Map(existsSync(p) ? parseEvals(readFileSync(p, "utf8"), ["cmd"]).map((e) => [e.id, e.cmd]) : []);
	return evals.reduce((t, e) => {
		const dai = UOC.evalDai[`${slug}/${e.id}`];
		if (dai) return t + dai;
		const c = cmd.get(e.id) ?? "";
		const lenh = c.startsWith("config:") ? lenhCua(c.slice(7)) : c;
		return t + (UOC.dauHieuMan.test(lenh) ? UOC.phutMan : UOC.phutEval);
	}, 0);
}
