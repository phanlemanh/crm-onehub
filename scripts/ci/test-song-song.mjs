import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CHAY_TEST, NHOM_TEST } from "./cau-hinh.mjs";

const GOC_KHO = resolve(import.meta.dirname, "..", "..");
const CO_RIENG = ["--test-run", "--goc", "--song-song"];

function docJson(duong) {
	return JSON.parse(readFileSync(duong, "utf8"));
}

export function goiCoTest(goc) {
	const goiGoc = docJson(join(goc, "package.json"));
	const mienTru = new Set(
		Object.keys(
			(docJson(join(goc, CHAY_TEST.gateShape)).checkers ?? []).find(
				(c) => c.id === CHAY_TEST.checker,
			)?.exempt ?? {},
		),
	);
	const ra = [];
	for (const mau of goiGoc.workspaces ?? []) {
		const thuMuc = join(goc, mau.replace(/\/\*$/, ""));
		if (!existsSync(thuMuc)) continue;
		for (const ten of readdirSync(thuMuc)) {
			const tep = join(thuMuc, ten, "package.json");
			if (!existsSync(tep)) continue;
			const goi = docJson(tep);
			if (goi.scripts?.test && !mienTru.has(goi.name)) ra.push(goi.name);
		}
	}
	return ra.sort();
}

export function dungNhom(goi, nhom) {
	const noi = new Map();
	const loi = [];
	for (const n of nhom) {
		for (const g of n.goi) {
			if (noi.has(g))
				loi.push(`goi ${g} nam o ca nhom ${noi.get(g)} va ${n.ten}`);
			else noi.set(g, n.ten);
			if (!goi.includes(g))
				loi.push(`nhom ${n.ten} nhac goi khong co test: ${g}`);
		}
	}
	for (const g of goi)
		if (!noi.has(g)) loi.push(`goi ${g} khong thuoc nhom nao`);
	return loi;
}

export function ketQua(ket) {
	const do_ = ket.filter((k) => k.ma !== 0);
	return {
		ma: do_.length === 0 ? 0 : 1,
		dong: do_.map((k) => `nhom ${k.ten} DO (ma ${k.ma})`),
	};
}

export function chuyenDoiSo(doiSo, testRun) {
	return doiSo.length > 0 ? [testRun, ...doiSo] : null;
}

export function tachCo(argv) {
	const co = {};
	const conLai = [];
	for (let i = 0; i < argv.length; i++) {
		if (CO_RIENG.includes(argv[i])) {
			co[argv[i].slice(2)] = argv[i + 1];
			i += 1;
		} else conLai.push(argv[i]);
	}
	return { co, conLai };
}

function moiTruongNhom() {
	const env = { ...process.env };
	for (const ten of CHAY_TEST.bienRiengMoiLuot) delete env[ten];
	return env;
}

function chayMotNhom(n, testRun, goc) {
	const bat = Date.now();
	return new Promise((xong) => {
		const ra = [];
		const con = spawn("bun", [testRun, ...n.goi.map((g) => `--filter=${g}`)], {
			cwd: goc,
			env: moiTruongNhom(),
		});
		con.stdout.on("data", (b) => ra.push(b));
		con.stderr.on("data", (b) => ra.push(b));
		const het = (ma, loiKhoi) => {
			const chu = Buffer.concat(ra).toString("utf8");
			const csdl = /\b(crm_\w+_test)\b/.exec(chu)?.[1] ?? "?";
			xong({
				ten: n.ten,
				ma,
				csdl,
				giay: (Date.now() - bat) / CHAY_TEST.msMoiGiay,
				chu: loiKhoi
					? `${chu}\nkhong khoi duoc nhom ${n.ten}: ${loiKhoi}\n`
					: chu,
			});
		};
		con.on("error", (e) => het(CHAY_TEST.maKhongChay, e.message));
		con.on("close", (ma, tin) =>
			het(ma ?? CHAY_TEST.maTinHieuGoc + (os.constants.signals[tin] ?? 0)),
		);
	});
}

export async function chayNhom(nhom, { testRun, goc, songSong }) {
	const hang = [...nhom];
	const ket = [];
	const lam = async () => {
		while (hang.length > 0) {
			const n = hang.shift();
			const k = await chayMotNhom(n, testRun, goc);
			const than = k.chu.endsWith("\n") ? k.chu : `${k.chu}\n`;
			await new Promise((xong) =>
				process.stdout.write(
					`\n===== nhom ${k.ten} =====\n${than}nhom ${k.ten}: ma ${k.ma} · CSDL ${k.csdl} · ${k.giay.toFixed(1)}s\n`,
					xong,
				),
			);
			ket.push(k);
		}
	};
	await Promise.all(
		Array.from({ length: Math.min(songSong, nhom.length) }, lam),
	);
	return ket;
}

function chuyenThang(lenh, goc) {
	return new Promise((xong) => {
		const con = spawn("bun", lenh, { cwd: goc, stdio: "inherit" });
		con.on("error", () => xong(CHAY_TEST.maKhongChay));
		con.on("close", (ma, tin) =>
			xong(ma ?? CHAY_TEST.maTinHieuGoc + (os.constants.signals[tin] ?? 0)),
		);
	});
}

export async function chinh(argv) {
	const { co, conLai } = tachCo(argv);
	const goc = co.goc ? resolve(co.goc) : GOC_KHO;
	const testRun = co["test-run"]
		? resolve(co["test-run"])
		: join(goc, CHAY_TEST.testRun);
	const thang = chuyenDoiSo(conLai, testRun);
	if (thang) return chuyenThang(thang, goc);
	const loi = dungNhom(goiCoTest(goc), NHOM_TEST);
	if (loi.length > 0) {
		for (const l of loi) console.error(`test-song-song: ${l}`);
		return CHAY_TEST.maSaiNhom;
	}
	const songSong =
		Number(co["song-song"]) ||
		Math.min(os.availableParallelism(), CHAY_TEST.tranSongSong);
	console.log(
		`test-song-song: ${NHOM_TEST.length} nhom, toi da ${songSong} nhom cung luc`,
	);
	const ket = await chayNhom(NHOM_TEST, { testRun, goc, songSong });
	const tong = ketQua(ket);
	for (const d of tong.dong) console.error(`test-song-song: ${d}`);
	return tong.ma;
}

if (
	process.argv[1] &&
	fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
	process.exitCode = await chinh(process.argv.slice(2));
}
