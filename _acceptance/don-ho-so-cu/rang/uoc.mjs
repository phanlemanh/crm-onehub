import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GOC } from "./chung.mjs";

export const UOC = {
	phutSuite: 35,
	phutEval: 1.5,
	evalDai: {
		"chuyen-goi-dieu-phoi/E10": 80,
		"giam-phut-ci-nhap-t1/E14": 45,
	},
};

export function tranLan() {
	const m = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8").match(/^\s*repin_budget_min:\s*(\d+)/m);
	if (!m) throw new Error("config thieu feature_loop.repin_budget_min");
	return Number(m[1]);
}

export function uocHoSo(slug, evals) {
	return evals.reduce((t, e) => t + (UOC.evalDai[`${slug}/${e.id}`] ?? UOC.phutEval), 0);
}
