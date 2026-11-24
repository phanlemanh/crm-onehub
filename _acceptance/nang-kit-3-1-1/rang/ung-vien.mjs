import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, matchesGlob } from "node:path";

function boNhay(v) {
	const t = v.trim();
	if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
	if (t.startsWith('"') && t.endsWith('"')) return JSON.parse(t);
	return t;
}

export function docEvals(van) {
	const ra = [];
	let cur = null;
	let lui = 0;
	let ds = false;
	for (const dong of van.split("\n")) {
		const id = /^(\s*)- id:\s*(\S+)\s*$/.exec(dong);
		if (id) {
			lui = id[1].length + 2;
			cur = { id: boNhay(id[2]), paths: [] };
			ra.push(cur);
			ds = false;
			continue;
		}
		if (!cur || !dong.trim()) continue;
		const vao = dong.length - dong.trimStart().length;
		if (vao < lui) {
			cur = null;
			continue;
		}
		if (ds && vao >= lui && /^\s*- /.test(dong)) {
			cur.paths.push(boNhay(dong.replace(/^\s*- /, "")));
			continue;
		}
		if (vao !== lui) continue;
		const k = /^\s*([a-z_]+):\s*(.*)$/.exec(dong);
		if (!k) continue;
		ds = false;
		if (k[1] === "paths") {
			const v = k[2].trim();
			if (!v) ds = true;
			else cur.paths = v.replace(/^\[|\]$/g, "").split(",").map(boNhay).filter(Boolean);
		} else if (["executor", "status", "cmd", "expected_exit"].includes(k[1])) cur[k[1]] = boNhay(k[2].replace(/\s+#.*$/, ""));
	}
	return ra;
}

export function giaiLenh(config, cmd) {
	const m = /^config:executors\.([\w-]+)\.([\w-]+)$/.exec(cmd ?? "");
	if (!m) return cmd;
	const dong = config.split("\n");
	const dau = dong.findIndex((d) => d === `  ${m[1]}:`);
	if (dau < 0) return null;
	for (let i = dau + 1; i < dong.length && !/^ {0,2}\S/.test(dong[i]); i++) {
		const k = new RegExp(`^ {4}${m[2]}:\\s*(.*)$`).exec(dong[i]);
		if (k) return boNhay(k[1]);
	}
	return null;
}

export function ungVien(goc, doi, slug) {
	const xet = doi.filter((t) => !t.startsWith(`_acceptance/${slug}/`) && !/^_acceptance\/[^/]+\/(run-log\.jsonl|evidence-report\.md)$/.test(t));
	const config = readFileSync(join(goc, "_acceptance", "config.yaml"), "utf8");
	const ra = [];
	for (const s of readdirSync(join(goc, "_acceptance")).sort()) {
		const c = join(goc, "_acceptance", s, "contract.md");
		const e = join(goc, "_acceptance", s, "evals.yaml");
		if (s === slug || !existsSync(c) || !existsSync(e)) continue;
		const st = /^status:\s*(\S+)/m.exec(readFileSync(c, "utf8"))?.[1];
		if (!["signed-off", "machine-cleared"].includes(st)) continue;
		for (const v of docEvals(readFileSync(e, "utf8"))) {
			if (!["test", "script"].includes(v.executor) || String(v.status ?? "").includes("not-run")) continue;
			const khop = xet.filter((t) => v.paths.some((g) => matchesGlob(t, g)));
			if (!khop.length) continue;
			ra.push({ ho_so: s, eval: v.id, lenh: giaiLenh(config, v.cmd), mong: v.expected_exit ? String(v.expected_exit).replace(/^\[|\]$/g, "").split(",").map(Number) : [0] });
		}
	}
	return { ungVien: ra };
}
