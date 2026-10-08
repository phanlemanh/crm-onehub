import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { NHOM_TEST } from "../../../scripts/ci/cau-hinh.mjs";
import { goiCoTest } from "../../../scripts/ci/test-song-song.mjs";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const RUNS = join(GOC, ".turbo", "runs");
const TRAN_MS = 45 * 60 * 1000;
const HE_SO_CHONG = 0.75;
const DONG_NHOM = /^nhom (\S+): ma (\d+) · CSDL (\S+) · ([\d.]+)s$/gm;

function tomTat() {
	return existsSync(RUNS)
		? readdirSync(RUNS).filter((t) => t.endsWith(".json"))
		: [];
}

function goiTrongTomTat(tep) {
	const s = JSON.parse(readFileSync(join(RUNS, tep), "utf8"));
	if (!/^turbo run test\b/.test(s.execution?.command ?? "")) return null;
	return (s.tasks ?? []).filter((t) => t.task === "test").map((t) => t.package);
}

function thieu(tepMoi, boTep) {
	const co = new Set(
		tepMoi.filter((t) => t !== boTep).flatMap((t) => goiTrongTomTat(t) ?? []),
	);
	return goiCoTest(GOC).filter((g) => !co.has(g));
}

function chinh() {
	const truoc = tomTat();
	const fileTruoc = join(os.tmpdir(), `ctd-truoc-${process.pid}.txt`);
	writeFileSync(fileTruoc, truoc.join("\n"));
	const bat = Date.now();
	const r = spawnSync("bun", ["run", "test"], {
		cwd: GOC,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 1 << 28,
		env: { ...process.env, TURBO_RUN_SUMMARY: "true" },
	});
	const tuong = (Date.now() - bat) / 1000;
	if (r.error) {
		console.log(
			`KHONG DO DUOC: bun run test khong chay xong: ${r.error.message}`,
		);
		process.exit(2);
	}
	const ra = `${r.stdout}\n${r.stderr}`;
	writeFileSync(
		join(GOC, ".acceptance-runs", "ci-test-duoi-tran-chay-that.log"),
		ra,
	);
	const nhom = [...ra.matchAll(DONG_NHOM)].map((m) => ({
		ten: m[1],
		ma: Number(m[2]),
		csdl: m[3],
		giay: Number(m[4]),
	}));
	const tong = nhom.reduce((s, n) => s + n.giay, 0);
	const loi = [];
	if (r.status !== 0) loi.push(`(a) bun run test thoat ${r.status}`);
	if (nhom.length !== NHOM_TEST.length || nhom.some((n) => n.ma !== 0))
		loi.push(
			`(b) dong ket qua nhom: ${nhom.map((n) => `${n.ten}=${n.ma}`).join(", ") || "khong co"}`,
		);
	if (new Set(nhom.map((n) => n.csdl)).size !== NHOM_TEST.length)
		loi.push("(b) bon CSDL khong khac nhau");
	if (!(tuong < HE_SO_CHONG * tong))
		loi.push(
			`(c) thoi gian tuong ${tuong.toFixed(0)}s khong < ${HE_SO_CHONG} × tong ${tong.toFixed(0)}s`,
		);
	const tepMoi = tomTat().filter((t) => !truoc.includes(t));
	const thieuThat = thieu(tepMoi, null);
	if (thieuThat.length > 0)
		loi.push(`(e) tom tat turbo thieu goi: ${thieuThat.join(", ")}`);
	const tepNhomDau = tepMoi.find((t) =>
		(goiTrongTomTat(t) ?? []).includes(NHOM_TEST[0].goi[0]),
	);
	const thieuDo = tepNhomDau ? thieu(tepMoi, tepNhomDau) : [];
	if (JSON.stringify(thieuDo) !== JSON.stringify([...NHOM_TEST[0].goi].sort()))
		loi.push(
			`(e) chieu do: bo tom tat nhom ${NHOM_TEST[0].ten} nhung phep dem bao thieu ${thieuDo.join(", ") || "khong gi"}`,
		);
	const vg = spawnSync(
		"bun",
		[join(GOC, "scripts", "verify-gate-shape.mjs"), "--runs-before", fileTruoc],
		{
			cwd: GOC,
			encoding: "utf8",
		},
	);
	const vgRa = `${vg.stdout}\n${vg.stderr}`;
	const vanDeTest = vgRa
		.split("\n")
		.filter((d) => /^\s+- /.test(d) && (/'test'/.test(d) || /#test\b/.test(d)));
	if (vanDeTest.length > 0)
		loi.push(
			`(d) verify-gate-shape: ${vanDeTest.map((d) => d.trim()).join(" | ")}`,
		);
	for (const n of nhom)
		console.log(`nhom ${n.ten}: ma ${n.ma} · ${n.csdl} · ${n.giay}s`);
	console.log(
		`tuong ${tuong.toFixed(0)}s · tong nhom ${tong.toFixed(0)}s · tom tat moi ${tepMoi.length}`,
	);
	if (loi.length > 0) {
		for (const l of loi) console.log(`DO ${l}`);
		process.exit(1);
	}
	console.log(
		"XANH: bon nhom song song, CSDL rieng, du goi trong tom tat, gate-shape khong van de o checker test",
	);
}

chinh();
