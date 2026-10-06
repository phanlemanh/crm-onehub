import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(RANG, "../../..");
const TRACES = join(GOC, "apps/agent/.eve/traces/v1");
const RA_E22 = join(GOC, ".acceptance-runs/tro-ly-okr-de-xuat/e22");

const DO = {
	subagent: "tro_ly_okr",
	nDauToiThieuE22: 18,
	nDauToiThieuE17: 1,
	chuRong: "empty model response",
	lenh: {
		e22: ["bun", ["_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs"]],
		e17: ["bun", ["_acceptance/tro-ly-okr-tom-tat/rang/eval-tom-tat.mjs", "--tran-usd", "1"]],
		e24: ["bun", ["_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs", "--lan", "20"]],
	},
	boDemMB: 512,
	lechMtimeMs: 60_000,
};

const thamSo = process.argv.slice(2);
const chiTuKiem = thamSo.includes("--chi-tu-kiem");
const iMau = thamSo.indexOf("--mau");
const MAU = iMau >= 0 ? resolve(thamSo[iMau + 1] ?? "") : join(RANG, "mau-0710");

function giaTri(v) {
	if (!v) return null;
	const [k] = Object.keys(v);
	return k ? v[k] : null;
}

function docSpans(thuMuc, tuMs) {
	const spans = new Map();
	let ds = [];
	try {
		ds = readdirSync(thuMuc);
	} catch {
		return spans;
	}
	for (const vet of ds) {
		const seg = join(thuMuc, vet, "segments");
		let tep = [];
		try {
			tep = readdirSync(seg).filter((t) => t.endsWith(".json"));
		} catch {
			continue;
		}
		for (const t of tep) {
			const duong = join(seg, t);
			if (tuMs !== null && statSync(duong).mtimeMs < tuMs - DO.lechMtimeMs) continue;
			const j = JSON.parse(readFileSync(duong, "utf8"));
			for (const rs of j.resourceSpans ?? [])
				for (const ss of rs.scopeSpans ?? [])
					for (const s of ss.spans ?? []) {
						const a = {};
						for (const x of s.attributes ?? []) a[x.key] = giaTri(x.value);
						spans.set(s.spanId, { ...s, a });
					}
		}
	}
	return spans;
}

function toTien(spans, s, ten) {
	let cur = s;
	while (cur) {
		if (cur.name === ten) return cur;
		cur = spans.get(cur.parentSpanId);
	}
	return null;
}

function goiTool(s) {
	try {
		return JSON.parse(s.a["ai.response.tool_calls"] ?? "[]");
	} catch {
		return [];
	}
}

export function demCuaSo(thuMuc, tuNs, denNs, tuMs = null) {
	const spans = docSpans(thuMuc, tuMs);
	const kq = { n_dau: 0, het_tran: 0, final_output: 0, output_schema: 0 };
	for (const s of spans.values()) {
		if (s.name !== "ai.streamText.doStream") continue;
		const bd = BigInt(s.startTimeUnixNano);
		if (bd < tuNs || bd > denNs) continue;
		for (const t of goiTool(s))
			if (t.toolName === DO.subagent && t.input && "outputSchema" in t.input)
				kq.output_schema += 1;
		const turn = toTien(spans, s, "agent.turn");
		if (turn?.a["agent.subagent.name"] !== DO.subagent) continue;
		const step = toTien(spans, s, "agent.step");
		if (step && Number(step.a["agent.step.index"]) === 0 && Number(step.a["agent.step.attempt"]) === 0)
			kq.n_dau += 1;
		if (s.a["ai.response.finish_reason"] === "length") kq.het_tran += 1;
		for (const t of goiTool(s)) if (t.toolName === "final_output") kq.final_output += 1;
	}
	return kq;
}

export function demLog(tep) {
	let n = 0;
	for (const t of tep) {
		let chu = "";
		try {
			chu = readFileSync(t, "utf8");
		} catch {
			continue;
		}
		n += chu.split("\n").filter((d) => d.includes(DO.chuRong)).length;
	}
	return n;
}

export function docLuotHong(chu) {
	const m = [...chu.matchAll(/(\d+) luot hong/g)].at(-1);
	return m ? Number(m[1]) : null;
}

const NS_MOI_MS = 1_000_000n;
const bayGioNs = () => BigInt(Date.now()) * NS_MOI_MS;

function tuKiem() {
	const loi = [];
	const dem = demCuaSo(join(MAU, "traces"), 0n, BigInt(Number.MAX_SAFE_INTEGER) * NS_MOI_MS);
	const rong = demLog([join(MAU, "eve.log")]);
	let hong = null;
	try {
		hong = docLuotHong(readFileSync(join(MAU, "do-tre-mot-luot-hong.log"), "utf8"));
	} catch {}
	if (dem.het_tran < 1) loi.push("het_tran");
	if (dem.final_output < 1) loi.push("final_output");
	if (dem.output_schema < 1) loi.push("output_schema");
	if (rong < 1) loi.push("empty_log");
	if (hong !== 1) loi.push("luot_hong");
	console.log(
		`[tu-kiem] n_dau ${dem.n_dau} · het-tran ${dem.het_tran} · final_output ${dem.final_output} · outputSchema ${dem.output_schema} · empty-log ${rong} · luot-hong ${hong}`,
	);
	for (const o of loi) console.log(`tu kiem khong bat duoc ${o}`);
	return loi.length === 0;
}

function chay(ten) {
	const [lenh, args] = DO.lenh[ten];
	const tuMs = Date.now();
	const tuNs = bayGioNs();
	const r = spawnSync(lenh, args, {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: DO.boDemMB * 1024 * 1024,
		stdio: ["ignore", "pipe", "pipe"],
	});
	const denNs = bayGioNs();
	process.stdout.write(r.stdout ?? "");
	process.stderr.write(r.stderr ?? "");
	return { ma: r.status ?? 1, tuMs, tuNs, denNs, ra: r.stdout ?? "" };
}

function logE22(tuMs) {
	let ds = [];
	try {
		ds = readdirSync(RA_E22);
	} catch {
		return [];
	}
	return ds
		.filter((t) => /^eve(-lap-\d+)?\.log$/.test(t))
		.map((t) => join(RA_E22, t))
		.filter((t) => statSync(t).mtimeMs >= tuMs);
}

function phanMoHinh(ten, nToiThieu, coLog) {
	const r = chay(ten);
	const dem = demCuaSo(TRACES, r.tuNs, r.denNs, r.tuMs);
	const rong = coLog ? demLog(logE22(r.tuMs)) : 0;
	const loi = [];
	if (r.ma !== 0) loi.push(`lenh ${ten} thoat ${r.ma}`);
	if (dem.n_dau < nToiThieu) loi.push(`mau qua nho: ${dem.n_dau}`);
	if (dem.het_tran) loi.push(`het-tran: ${dem.het_tran}`);
	if (dem.final_output) loi.push(`final_output: ${dem.final_output}`);
	if (dem.output_schema) loi.push(`outputSchema: ${dem.output_schema}`);
	if (rong) loi.push(`empty-log: ${rong}`);
	console.log(
		`[${ten}] ma ${r.ma} · n_dau ${dem.n_dau} · het-tran ${dem.het_tran} · final_output ${dem.final_output} · outputSchema ${dem.output_schema}${coLog ? ` · empty-log ${rong}` : ""} → ${loi.length ? `DO ${loi.join("; ")}` : "dat"}`,
	);
	return { ma: r.ma, dat: loi.length === 0 };
}

function phanDoTre() {
	console.log(`[e24] tai may truoc khi do: ${loadavg().map((x) => x.toFixed(2)).join(" ")}`);
	const r = chay("e24");
	const hong = docLuotHong(r.ra);
	const loi = [];
	if (r.ma !== 0) loi.push(`do-tre thoat ${r.ma}`);
	if (hong === null) loi.push("khong doc duoc so luot hong");
	else if (hong > 0) loi.push(`co luot hong: ${hong}`);
	console.log(`[e24] ma ${r.ma} · luot hong ${hong} → ${loi.length ? `DO ${loi.join("; ")}` : "dat"}`);
	return { ma: r.ma, dat: loi.length === 0 };
}

if (!tuKiem()) process.exit(3);
if (chiTuKiem) process.exit(0);

const ket = [
	phanMoHinh("e22", DO.nDauToiThieuE22, true),
	phanMoHinh("e17", DO.nDauToiThieuE17, false),
	phanDoTre(),
];
const maLenh = ket.find((k) => k.ma !== 0)?.ma;
if (ket.every((k) => k.dat)) process.exit(0);
process.exit(maLenh ?? 1);
