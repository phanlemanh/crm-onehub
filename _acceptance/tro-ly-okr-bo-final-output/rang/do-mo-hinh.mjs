import { spawn, spawnSync } from "node:child_process";
import {
	appendFileSync,
	closeSync,
	mkdirSync,
	openSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(RANG, "../../..");
const TRACES = join(GOC, "apps/agent/.eve/traces/v1");
const RA_E22 = join(GOC, ".acceptance-runs/tro-ly-okr-de-xuat/e22");
const RA = join(GOC, ".acceptance-runs/tro-ly-okr-bo-final-output");
const NHAT_KY = join(RA, "do-mo-hinh.log");
const LUOT = `${process.pid}-${new Date().toISOString()}`;
mkdirSync(RA, { recursive: true });
writeFileSync(NHAT_KY, "");

const DO = {
	subagent: "tro_ly_okr",
	nDauToiThieuE22: 18,
	nDauToiThieuE17: 1,
	chuRong: "empty model response",
	lenh: {
		e22: ["bun", ["_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs"]],
		e17: [
			"bun",
			[
				"_acceptance/tro-ly-okr-tom-tat/rang/eval-tom-tat.mjs",
				"--tran-usd",
				"1",
			],
		],
	},
	lechMtimeMs: 60_000,
	choTest: { yenMs: 120_000, nhipMs: 15_000, toiDaMs: 45 * 60_000 },
	mauTest: /(^|\s|\/)(bun|turbo)(\s+run)?\s+test(\s|$)/,
};

const thamSo = process.argv.slice(2);
const chiTuKiem = thamSo.includes("--chi-tu-kiem");
const demTest = thamSo.includes("--dem-test");
const iMau = thamSo.indexOf("--mau");
const MAU =
	iMau >= 0 ? resolve(thamSo[iMau + 1] ?? "") : join(RANG, "mau-0710");

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
			if (tuMs !== null && statSync(duong).mtimeMs < tuMs - DO.lechMtimeMs)
				continue;
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
		if (
			step &&
			Number(step.a["agent.step.index"]) === 0 &&
			Number(step.a["agent.step.attempt"]) === 0
		)
			kq.n_dau += 1;
		if (s.a["ai.response.finish_reason"] === "length") kq.het_tran += 1;
		for (const t of goiTool(s))
			if (t.toolName === "final_output") kq.final_output += 1;
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

function ghi(dong) {
	console.log(dong);
	appendFileSync(NHAT_KY, `${dong}\n`);
}

let conDangChay = null;

function ketThuc(ma) {
	ghi(`KET THUC ma ${ma} · luot ${LUOT}`);
	process.exit(ma);
}

for (const [tin, so] of [
	["SIGTERM", 15],
	["SIGINT", 2],
	["SIGHUP", 1],
]) {
	process.on(tin, () => {
		conDangChay?.kill(tin);
		ghi(`bi ngat ${tin}`);
		ketThuc(128 + so);
	});
}

function cwdCua(pid) {
	const r = spawnSync("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"], {
		encoding: "utf8",
	});
	const dong = (r.stdout ?? "").split("\n").find((d) => d.startsWith("n"));
	return dong ? dong.slice(1) : "";
}

function testDangChay() {
	const r = spawnSync("ps", ["-axo", "pid=,command="], { encoding: "utf8" });
	return (r.stdout ?? "")
		.split("\n")
		.map((d) => d.trim().match(/^(\d+)\s+(.*)$/))
		.filter((m) => m && Number(m[1]) !== process.pid && DO.mauTest.test(m[2]))
		.filter((m) => cwdCua(m[1]).startsWith(GOC)).length;
}

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

async function choBoTestYen() {
	const batDau = Date.now();
	let yenTu = null;
	while (Date.now() - batDau < DO.choTest.toiDaMs) {
		const n = testDangChay();
		if (n > 0) {
			yenTu = null;
			ghi(`cho bo test cua cay xong: ${n} tien trinh dang chay`);
		} else {
			yenTu ??= Date.now();
			if (Date.now() - yenTu >= DO.choTest.yenMs) {
				ghi(
					`bo test yen ${Math.round(DO.choTest.yenMs / 1000)} giay, bat dau do`,
				);
				return;
			}
		}
		await ngu(DO.choTest.nhipMs);
	}
	ghi(
		`het ${Math.round(DO.choTest.toiDaMs / 60_000)} phut cho bo test, van do`,
	);
}

const NS_MOI_MS = 1_000_000n;
const bayGioNs = () => BigInt(Date.now()) * NS_MOI_MS;

function tuKiem() {
	const loi = [];
	const dem = demCuaSo(
		join(MAU, "traces"),
		0n,
		BigInt(Number.MAX_SAFE_INTEGER) * NS_MOI_MS,
	);
	const rong = demLog([join(MAU, "eve.log")]);
	if (dem.het_tran < 1) loi.push("het_tran");
	if (dem.final_output < 1) loi.push("final_output");
	if (dem.output_schema < 1) loi.push("output_schema");
	if (rong < 1) loi.push("empty_log");
	ghi(
		`[tu-kiem] n_dau ${dem.n_dau} · het-tran ${dem.het_tran} · final_output ${dem.final_output} · outputSchema ${dem.output_schema} · empty-log ${rong}`,
	);
	for (const o of loi) ghi(`tu kiem khong bat duoc ${o}`);
	return loi.length === 0;
}

async function chay(ten) {
	const [lenh, args] = DO.lenh[ten];
	const tuMs = Date.now();
	const tuNs = bayGioNs();
	ghi(
		`[${ten}] bat dau ${new Date(tuMs).toISOString()}: ${lenh} ${args.join(" ")}`,
	);
	const fd = openSync(NHAT_KY, "a");
	const ma = await new Promise((xong) => {
		conDangChay = spawn(lenh, args, { cwd: GOC, stdio: ["ignore", fd, fd] });
		conDangChay.on("exit", (m) => xong(m ?? 1));
		conDangChay.on("error", () => xong(1));
	});
	conDangChay = null;
	closeSync(fd);
	const denNs = bayGioNs();
	ghi(
		`[${ten}] xong sau ${Math.round((Date.now() - tuMs) / 1000)} giay, ma ${ma}`,
	);
	return { ma, tuMs, tuNs, denNs };
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

async function phanMoHinh(ten, nToiThieu, coLog) {
	const r = await chay(ten);
	const dem = demCuaSo(TRACES, r.tuNs, r.denNs, r.tuMs);
	const rong = coLog ? demLog(logE22(r.tuMs)) : 0;
	const loi = [];
	if (dem.n_dau < nToiThieu) loi.push(`mau qua nho: ${dem.n_dau}`);
	if (dem.final_output) loi.push(`final_output: ${dem.final_output}`);
	if (dem.output_schema) loi.push(`outputSchema: ${dem.output_schema}`);
	ghi(
		`[${ten}] ma ${r.ma} · n_dau ${dem.n_dau} · het-tran ${dem.het_tran} · final_output ${dem.final_output} · outputSchema ${dem.output_schema}${coLog ? ` · empty-log ${rong}` : ""} → ${loi.length ? `DO ${loi.join("; ")}` : "dat"}`,
	);
	return loi.length === 0;
}

ghi(`nhat ky: ${NHAT_KY} · luot ${LUOT}`);
try {
	if (!tuKiem()) ketThuc(3);
	if (chiTuKiem) ketThuc(0);
	if (demTest) {
		ghi(`test dang chay trong cay: ${testDangChay()}`);
		ketThuc(0);
	}
} catch (loi) {
	ghi(`loi thuoc: ${loi instanceof Error ? loi.message : String(loi)}`);
	ketThuc(1);
}

try {
	await choBoTestYen();
	const ket = [
		await phanMoHinh("e22", DO.nDauToiThieuE22, true),
		await phanMoHinh("e17", DO.nDauToiThieuE17, false),
	];
	ketThuc(ket.every(Boolean) ? 0 : 1);
} catch (loi) {
	ghi(`loi thuoc: ${loi instanceof Error ? loi.message : String(loi)}`);
	ketThuc(1);
}
