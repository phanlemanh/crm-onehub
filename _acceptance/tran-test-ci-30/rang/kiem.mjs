import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const SLUG = "tran-test-ci-30";
const WF = ".github/workflows/ci.yml";
const EVALS_CU = "_acceptance/giam-phut-ci-nhap-t1/evals.yaml";
const RANG_CU = "_acceptance/giam-phut-ci-nhap-t1/rang";
const KHOA = "jobs.test.timeout-minutes";
const CON_TRO = `${SLUG}#AC-2`;
const THE_THAY = "giam-phut-ci-nhap-t1/E3";
const O_DOI = "test.con-lai";
const LY_DOI = "khac ban ghim o timeout-minutes";
const CHAY = join(GOC, ".acceptance-runs", SLUG);

function git(...a) {
	const r = spawnSync("git", a, { cwd: GOC, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
	if (r.status !== 0) throw new Error(`git ${a.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

const docGoc = (duong) => readFileSync(join(GOC, duong), "utf8");
const docTai = (sha, duong) => git("show", `${sha}:${duong}`);
const tranTest = (chu) => Bun.YAML.parse(chu)?.jobs?.test?.["timeout-minutes"];

function timNen() {
	const dangSua = git("status", "--porcelain", "--", WF).trim() !== "";
	if (dangSua) return { doi: null, nen: git("rev-parse", "HEAD").trim() };
	for (const c of git("log", "--format=%H", "--", WF).trim().split("\n")) {
		const cha = git("rev-parse", `${c}^`).trim();
		if (tranTest(docTai(c, WF)) === 30 && tranTest(docTai(cha, WF)) === 20) return { doi: c, nen: cha };
	}
	console.log("sai khong tim thay commit doi tran job test tu 20 len 30 trong lich su ci.yml");
	process.exit(1);
}

function lech(a, b, duong = "") {
	if (Bun.deepEquals(a, b)) return [];
	const laVat = (x) => x !== null && x !== undefined && Object(x) === x;
	if (laVat(a) && laVat(b) && Array.isArray(a) === Array.isArray(b)) {
		const khoa = new Set([...Object.keys(a), ...Object.keys(b)]);
		return [...khoa].flatMap((k) => lech(a[k], b[k], duong ? `${duong}.${k}` : k));
	}
	return [duong];
}

function dongKhac(chuA, chuB) {
	const a = chuA.split("\n");
	const b = chuB.split("\n");
	if (a.length !== b.length) return { soDong: [a.length, b.length], khac: null };
	return { soDong: null, khac: a.flatMap((d, i) => (d === b[i] ? [] : [[i + 1, d, b[i]]])) };
}

function kiemMotKhoa(chuNen, chuDoi, chuCay) {
	const loi = [];
	const n = Bun.YAML.parse(chuNen);
	const m = Bun.YAML.parse(chuDoi);
	const l = lech(n, m);
	if (l.length !== 1 || l[0] !== KHOA) loi.push(`lech ${l.length ? l.join(", ") : "khong khoa nao"}, mong dung ${KHOA}`);
	if (n.jobs?.test?.["timeout-minutes"] !== 20) loi.push(`nen ${KHOA} = ${n.jobs?.test?.["timeout-minutes"]}, mong 20`);
	if (m.jobs?.test?.["timeout-minutes"] !== 30) loi.push(`doi ${KHOA} = ${m.jobs?.test?.["timeout-minutes"]}, mong 30`);
	const d = dongKhac(chuNen, chuDoi);
	if (d.soDong) loi.push(`so dong khac nhau ${d.soDong.join(" -> ")}`);
	else if (d.khac.length !== 1 || d.khac[0][1] !== "    timeout-minutes: 20" || d.khac[0][2] !== "    timeout-minutes: 30")
		loi.push(`dong khac: ${JSON.stringify(d.khac)}`);
	if (tranTest(chuCay) !== 30) loi.push(`cay ${KHOA} = ${tranTest(chuCay)}, mong 30`);
	return loi;
}

function bungNen(nen, ...duong) {
	const dich = join(CHAY, `nen-${nen.slice(0, 12)}`);
	rmSync(dich, { recursive: true, force: true });
	mkdirSync(dich, { recursive: true });
	const goi = spawnSync("sh", ["-c", `git archive ${nen} ${duong.join(" ")} | tar -x -C "${dich}"`], { cwd: GOC, encoding: "utf8" });
	if (goi.status !== 0) throw new Error(`git archive ${nen}: ${goi.stderr}`);
	return dich;
}

function chayHinh(goc) {
	const r = spawnSync("bun", [join(goc, RANG_CU, "hinh.mjs"), "ci"], {
		cwd: goc,
		encoding: "utf8",
		env: { ...process.env, GIT_DIR: git("rev-parse", "--path-format=absolute", "--git-common-dir").trim() },
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
}

function boc(ket) {
	const o = new Map();
	const bat = new Set();
	const hong = [];
	for (const d of ket.ra.split("\n")) {
		const dat = d.match(/^dat (\S+)$/);
		const sai = d.match(/^sai (\S+): (.*)$/);
		if (dat) o.set(dat[1], "dat");
		else if (sai) o.set(sai[1], sai[2]);
		else if (d.startsWith("BAT ")) bat.add(d.split(" — ")[0]);
		else if (d.startsWith("thuoc hong:")) hong.push(d);
	}
	return { ma: ket.ma, o, bat, hong };
}

function kiemE3(nen, cay) {
	const loi = [];
	const n = boc(nen);
	const c = boc(cay);
	if (n.ma !== 0) loi.push(`E3 cu tren nen thoat ${n.ma}, mong 0`);
	if (c.ma !== 1) loi.push(`E3 cu tren cay thoat ${c.ma}, mong 1`);
	if (n.o.size < 10) loi.push(`nen chi co ${n.o.size} o`);
	const tapN = [...n.o.keys()].sort().join(",");
	const tapC = [...c.o.keys()].sort().join(",");
	if (tapN !== tapC) loi.push(`thieu o: nen {${tapN}} cay {${tapC}}`);
	for (const [o, v] of n.o) if (v !== "dat") loi.push(`nen sai o ${o}: ${v}`);
	for (const [o, v] of c.o) {
		const mong = o === O_DOI ? LY_DOI : "dat";
		if (v !== mong) loi.push(`cay o ${o} = «${v}», mong «${mong}»`);
	}
	if ([...n.bat].sort().join("|") !== [...c.bat].sort().join("|")) loi.push(`ca dot bien bat khac nhau: nen ${n.bat.size}, cay ${c.bat.size}`);
	if (n.bat.size < 5) loi.push(`nen chi bat ${n.bat.size} ca dot bien`);
	if (n.hong.length + c.hong.length) loi.push(`co ca dot bien khong bat: ${[...n.hong, ...c.hong].join("; ")}`);
	return loi;
}

function kiemThayBoi(chuNen, chuMoi, chuThe) {
	const loi = [];
	const n = Bun.YAML.parse(chuNen);
	const m = Bun.YAML.parse(chuMoi);
	const e3n = n.evals.find((e) => e.id === "E3");
	const e3m = m.evals.find((e) => e.id === "E3");
	if (e3m?.status !== "not-run") loi.push(`E3 status = ${e3m?.status}, mong not-run`);
	if (e3m?.superseded_by !== CON_TRO) loi.push(`E3 superseded_by = ${e3m?.superseded_by}, mong ${CON_TRO}`);
	const { status: _s, superseded_by: _t, ...e3conLai } = e3m ?? {};
	if (!Bun.deepEquals(e3conLai, e3n)) loi.push(`E3 doi khoa khac: ${lech(e3n, e3conLai).join(", ")}`);
	const khacE3 = (y) => ({ ...y, evals: y.evals.filter((e) => e.id !== "E3") });
	const l = lech(khacE3(n), khacE3(m));
	if (l.length) loi.push(`doi ngoai E3: ${l.join(", ")}`);
	const a = chuNen.split("\n");
	const i = a.indexOf("    cmd: config:executors.script.gpct_hinh_ci");
	const mong = [...a.slice(0, i + 1), "    status: not-run", `    superseded_by: ${CON_TRO}`, ...a.slice(i + 1)].join("\n");
	if (i < 0 || mong !== chuMoi) loi.push(`chu tep khac dung hai dong them sau cmd cua E3: ${JSON.stringify(dongKhac(mong, chuMoi))}`);
	if (!chuThe.split(/[\s`|]+/).includes(THE_THAY)) loi.push(`ho so moi khong neu the ${THE_THAY} dung rieng`);
	return loi;
}

const BAO = [];
function caDo(ten, loi, mongChua) {
	const bat = loi.some((l) => l.includes(mongChua));
	console.log(bat ? `BAT ${ten} — ${loi.join("; ")}` : `thuoc hong: ${ten} khong bi bat (${loi.join("; ") || "khong loi"})`);
	if (!bat) BAO.push(ten);
}

function xong(loi, ten) {
	for (const l of loi) console.log(`sai ${l}`);
	if (loi.length === 0) console.log(`dat ${ten}`);
	const tong = loi.length + BAO.length;
	console.log(tong === 0 ? `KET ${ten}: dat, moi ca do bi bat` : `KET ${ten}: ${loi.length} sai, ${BAO.length} ca do khong bat`);
	process.exit(tong === 0 ? 0 : 1);
}

const che = process.argv[2];

if (che === "mot-khoa") {
	const { doi, nen } = timNen();
	const chuNen = docTai(nen, WF);
	const chuDoi = doi ? docTai(doi, WF) : docGoc(WF);
	const chuCay = docGoc(WF);
	console.log(`nen ${nen} · commit doi ${doi ?? "cay dang sua"}`);
	const dong = (chu, ten) => chu.split("\n").findIndex((d, i, ds) => /^ {4}timeout-minutes: \d+$/.test(d) && ds[i - 4]?.startsWith(`    name: ${ten}`));
	const doiDong = (chu, i, d) => chu.split("\n").map((x, j) => (j === i ? d : x)).join("\n");
	caDo("tran-check-cung-doi", kiemMotKhoa(chuNen, doiDong(chuDoi, dong(chuDoi, "check-types"), "    timeout-minutes: 30"), chuCay), "jobs.check.timeout-minutes");
	caDo("tran-test-25", kiemMotKhoa(chuNen, doiDong(chuDoi, dong(chuDoi, "test ("), "    timeout-minutes: 25"), chuCay), "mong 30");
	caDo("bo-o-api", kiemMotKhoa(chuNen, chuDoi.replace("          - ten: api\n            loc: --filter=api\n", ""), chuCay), "jobs.test.strategy");
	caDo("chua-doi", kiemMotKhoa(chuNen, chuNen, chuCay), "khong khoa nao");
	caDo("cay-ve-20", kiemMotKhoa(chuNen, chuDoi, chuNen), "cay jobs.test.timeout-minutes");
	xong(kiemMotKhoa(chuNen, chuDoi, chuCay), "mot-khoa");
} else if (che === "e3-cu") {
	const { nen } = timNen();
	const goNen = bungNen(nen, WF, ".github/workflows/acceptance.yml", RANG_CU);
	const kNen = chayHinh(goNen);
	const kCay = chayHinh(GOC);
	console.log(`nen ${nen}`);
	console.log(kNen.ra.trim().split("\n").map((d) => `  nen| ${d}`).join("\n"));
	console.log(kCay.ra.trim().split("\n").map((d) => `  cay| ${d}`).join("\n"));
	caDo("e3-sai-them", kiemE3(kNen, { ...kCay, ra: `${kCay.ra}\nsai check.if: dot bien` }), "cay o check.if");
	caDo("e3-cat-o", kiemE3(kNen, { ...kCay, ra: kCay.ra.replace(/^dat .*$/gm, "") }), "thieu o");
	caDo("e3-thuoc-hong", kiemE3(kNen, { ...kCay, ra: kCay.ra.replace(/^BAT (\S+).*$/m, "thuoc hong: $1 khong bi bat") }), "khong bat");
	caDo("e3-chua-doi", kiemE3(kNen, kNen), "tren cay thoat 0");
	rmSync(goNen, { recursive: true, force: true });
	xong(kiemE3(kNen, kCay), "e3-cu");
} else if (che === "thay-boi") {
	const { nen } = timNen();
	const chuNen = docTai(nen, EVALS_CU);
	const moi = docGoc(EVALS_CU);
	const the = `${docGoc(`_acceptance/${SLUG}/contract.md`)}\n${docGoc(`docs/superpowers/specs/2026-10-22-${SLUG}-design.md`)}`;
	caDo("tro-sai-ac", kiemThayBoi(chuNen, moi.replace(CON_TRO, `${SLUG}#AC-9`), the), "superseded_by");
	caDo("doi-them-e4", kiemThayBoi(chuNen, moi.replace("cmd: config:executors.script.gpct_ci_ok", "cmd: config:executors.script.khac"), the), "doi ngoai E3");
	caDo("bo-status", kiemThayBoi(chuNen, moi.replace(/^ {4}status: not-run\n(?= {4}superseded_by: tran-test-ci-30)/m, ""), the), "status");
	caDo("khong-nhan-the", kiemThayBoi(chuNen, moi, the.replaceAll(THE_THAY, "giam-phut/E3")), "khong neu the");
	xong(kiemThayBoi(chuNen, moi, the), "thay-boi");
} else {
	console.log("dung: bun kiem.mjs mot-khoa|e3-cu|thay-boi");
	process.exit(2);
}
