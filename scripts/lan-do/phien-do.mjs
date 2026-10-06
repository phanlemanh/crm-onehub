#!/usr/bin/env bun
import { spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	openSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { connect, createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	createMeasureDatabase,
	currentTree,
	dropMeasureDatabase,
	holdMeasureLock,
	MeasureDatabaseError,
	markWorkspaceOnboarded,
	serverUrl,
} from "../../packages/db/scripts/measure-db.ts";
import {
	measureDatabaseName,
	treeSlug,
} from "../../packages/db/src/measure-database.ts";
import { PHIEN_DO } from "./cau-hinh.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CANH_CAY = join(
	GOC,
	"_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs",
);
const MA_NGAT = { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 };

class KhongDo extends Error {}
class BiNgat extends Error {}

function noi(cau) {
	console.error(`phien-do: ${cau}`);
}

function tenKho(url) {
	try {
		return new URL(url).pathname.replace(/^\//, "");
	} catch {
		return null;
	}
}

const i = process.argv.indexOf("--chay");
if (i === -1 || !process.argv[i + 1]) {
	noi('thiếu --chay "<lệnh>" — không có gì để chạy');
	process.exit(2);
}
const lenh = process.argv[i + 1];

function chayThang(moiTruong) {
	return new Promise((xong) => {
		const con = spawn("bash", ["-c", lenh], {
			cwd: GOC,
			stdio: "inherit",
			env: moiTruong,
		});
		trangThai.lenhCon = con;
		con.on("error", (loi) => {
			noi(`không chạy được lệnh: ${loi.message}`);
			xong(2);
		});
		con.on("exit", (ma, tin) => xong(ma ?? MA_NGAT[tin] ?? 2));
	});
}

const trangThai = {
	ngat: null,
	lenhCon: null,
	nhaKhoa: null,
	kho: null,
	may: [],
	tepGhi: null,
};

for (const tin of Object.keys(MA_NGAT)) {
	process.on(tin, () => {
		if (trangThai.ngat) return;
		trangThai.ngat = tin;
		noi(`nhận ${tin} — dừng lệnh và dọn`);
		trangThai.lenhCon?.kill(tin);
	});
}

function kiemNgat() {
	if (trangThai.ngat) throw new BiNgat(trangThai.ngat);
}

if (
	process.env.PHIEN_DO &&
	tenKho(process.env.DATABASE_URL ?? "") === process.env.PHIEN_DO
) {
	process.exit(await chayThang(process.env));
}

function batDauCua(pid) {
	const ra = spawnSync("ps", ["-o", "lstart=", "-p", String(pid)], {
		encoding: "utf8",
	});
	return ra.status === 0 ? ra.stdout.trim() : null;
}

function nhomConSong(pgid) {
	try {
		process.kill(-pgid, 0);
		return true;
	} catch {
		return false;
	}
}

async function giet(nhom) {
	for (const { pgid } of nhom) {
		try {
			process.kill(-pgid, "SIGTERM");
		} catch {}
	}
	const han = Date.now() + PHIEN_DO.cho.donMs;
	while (Date.now() < han && nhom.some(({ pgid }) => nhomConSong(pgid))) {
		await new Promise((xong) => setTimeout(xong, PHIEN_DO.cho.nhipMs));
	}
	for (const { pgid } of nhom) {
		if (!nhomConSong(pgid)) continue;
		try {
			process.kill(-pgid, "SIGKILL");
		} catch {}
	}
	return nhom.filter(({ pgid }) => nhomConSong(pgid));
}

async function donLuotBiGiet(tepGhi) {
	if (!existsSync(tepGhi)) return;
	let cu;
	try {
		cu = JSON.parse(readFileSync(tepGhi, "utf8"));
	} catch {
		rmSync(tepGhi, { force: true });
		return;
	}
	const cuaTa = (cu.nhom ?? []).filter(({ pgid, batDau }) => {
		if (!nhomConSong(pgid)) return false;
		const nay = batDauCua(pgid);
		return nay === null || nay === batDau;
	});
	if (cuaTa.length > 0) {
		noi(
			`lượt trước (pid ${cu.pid}) chết không dọn — tắt ${cuaTa.length} máy chủ mồ côi của nó`,
		);
		const con = await giet(cuaTa);
		if (con.length > 0)
			throw new KhongDo(
				`không tắt được máy chủ mồ côi nhóm ${con.map((n) => n.pgid).join(", ")}`,
			);
	}
	rmSync(tepGhi, { force: true });
}

function congBan(cong) {
	return new Promise((xong) => {
		const may = createServer();
		may.once("error", () => xong(true));
		may.listen({ port: cong, exclusive: true }, () =>
			may.close(() => xong(false)),
		);
	});
}

function coAiNghe(cong, host) {
	return new Promise((xong) => {
		const s = connect({ port: cong, host });
		s.setTimeout(PHIEN_DO.cho.nhipMs);
		s.once("connect", () => {
			s.destroy();
			xong(true);
		});
		s.once("timeout", () => {
			s.destroy();
			xong(false);
		});
		s.once("error", () => xong(false));
	});
}

async function congTuDo(boQua) {
	const { tu, den } = PHIEN_DO.cong;
	const rong = den - tu + 1;
	const dau = Math.floor(Math.random() * rong);
	for (let k = 0; k < rong; k += 1) {
		const cong = tu + ((dau + k) % rong);
		if (boQua.includes(cong)) continue;
		if (await congBan(cong)) continue;
		if (await coAiNghe(cong, "127.0.0.1")) continue;
		if (await coAiNghe(cong, "::1")) continue;
		return cong;
	}
	throw new KhongDo(`không còn cổng tự do trong ${tu}–${den}`);
}

function ghiLai() {
	writeFileSync(
		trangThai.tepGhi,
		`${JSON.stringify(
			{
				pid: process.pid,
				kho: trangThai.kho,
				nhom: trangThai.may.map(({ ten, pgid, batDau }) => ({
					ten,
					pgid,
					batDau,
				})),
			},
			null,
			2,
		)}\n`,
	);
}

function khoi(ten, lenhMay, thamSo, noiChay, moiTruong, thuMuc) {
	const nhatKy = join(thuMuc, `${ten}.log`);
	const fd = openSync(nhatKy, "w");
	const con = spawn(lenhMay, thamSo, {
		cwd: noiChay,
		env: moiTruong,
		detached: true,
		stdio: ["ignore", fd, fd],
	});
	const may = { ten, con, pgid: con.pid, batDau: batDauCua(con.pid), nhatKy };
	trangThai.may.push(may);
	ghiLai();
	return may;
}

function duoiNhatKy(may) {
	try {
		return readFileSync(may.nhatKy, "utf8")
			.trim()
			.split("\n")
			.slice(-8)
			.join("\n    ");
	} catch {
		return "(không đọc được nhật ký)";
	}
}

async function choSan(may, url, hanMs, chiNhan200) {
	const han = Date.now() + hanMs;
	while (Date.now() < han) {
		kiemNgat();
		if (may.con.exitCode !== null || may.con.signalCode !== null)
			throw new KhongDo(
				`máy chủ ${may.ten} thoát trước khi sẵn sàng (${may.con.exitCode ?? may.con.signalCode}):\n    ${duoiNhatKy(may)}`,
			);
		try {
			const tra = await fetch(url, {
				redirect: "manual",
				signal: AbortSignal.timeout(PHIEN_DO.cho.hoiMs),
			});
			if (!chiNhan200 || tra.status === 200) return;
		} catch {}
		await new Promise((xong) => setTimeout(xong, PHIEN_DO.cho.nhipMs));
	}
	throw new KhongDo(
		`máy chủ ${may.ten} không sẵn sàng ở ${url} sau ${Math.round(hanMs / 1000)} s:\n    ${duoiNhatKy(may)}`,
	);
}

async function dung(base) {
	const cay = currentTree(GOC);
	const ten = measureDatabaseName(cay);
	const thuMuc = join(GOC, PHIEN_DO.ghi, ten);
	mkdirSync(thuMuc, { recursive: true });
	trangThai.tepGhi = join(thuMuc, "phien.json");

	trangThai.nhaKhoa = await holdMeasureLock(base, ten, {
		waitMs: PHIEN_DO.cho.khoaMs,
		pollMs: PHIEN_DO.cho.nhipMs,
		onWait: () => noi(`chờ phiên khác của cây này (${ten}) dọn xong`),
	});
	kiemNgat();
	await donLuotBiGiet(trangThai.tepGhi);
	kiemNgat();

	const url = await createMeasureDatabase({
		base,
		tree: cay,
		log: (dong) => console.error(dong),
	});
	trangThai.kho = ten;
	kiemNgat();

	const congApp = await congTuDo([]);
	const congApi = await congTuDo([congApp]);
	const app = `http://localhost:${congApp}`;
	const api = `http://localhost:${congApi}`;
	const tepCuaChan = process.env.PHIEN_DO_CUA_CHAN ?? null;
	const congCua = tepCuaChan ? await congTuDo([congApp, congApi]) : null;
	const cua = congCua ? `http://localhost:${congCua}` : null;
	const moiTruong = {
		...process.env,
		DATABASE_URL: url,
		APP_URL: app,
		API_URL: api,
		PHIEN_DO: ten,
		...(cua ? { CUA_CHAN_URL: cua } : {}),
	};
	noi(`kho ${ten} · app ${app} · api ${api}${cua ? ` · cua chan ${cua}` : ""}`);

	const mayApi = khoi(
		"api",
		"bun",
		["--watch", "src/main.ts"],
		join(GOC, "apps/api"),
		{ ...moiTruong, PORT: String(congApi) },
		thuMuc,
	);
	const mayCua = cua
		? khoi(
				"cua-chan",
				"bun",
				[join(GOC, tepCuaChan)],
				GOC,
				{ ...moiTruong, CUA_CHAN_PORT: String(congCua), CUA_CHAN_NANG: api },
				thuMuc,
			)
		: null;
	const apiCuaApp = cua ?? api;
	const mayApp = khoi(
		"app",
		"bun",
		["run", "dev"],
		join(GOC, "apps/app"),
		{
			...moiTruong,
			PORT: String(congApp),
			API_URL: apiCuaApp,
			NEXT_PUBLIC_API_URL: apiCuaApp,
			PROTO_DIST_DIR: `${PHIEN_DO.khoApp}-${treeSlug(cay)}`,
		},
		thuMuc,
	);

	await choSan(mayApi, `${api}/health`, PHIEN_DO.cho.apiMs, true);
	if (mayCua)
		await choSan(
			mayCua,
			`${cua}/__cua-chan/trang-thai`,
			PHIEN_DO.cho.apiMs,
			true,
		);
	await choSan(mayApp, app, PHIEN_DO.cho.appMs, false);

	process.env.APP_URL = app;
	const { canhCay } = await import(CANH_CAY);
	const cayDung = await canhCay();
	if (cayDung.ket !== "dung-cay")
		throw new KhongDo(`cảnh cây: ${cayDung.dong.join("\n    ")}`);
	kiemNgat();

	const nguoi = process.env.NGUOI ?? PHIEN_DO.nguoi;
	const phien = spawnSync("bun", ["run", "dev:session", nguoi], {
		cwd: join(GOC, "apps/api"),
		env: moiTruong,
		encoding: "utf8",
	});
	if (phien.status !== 0)
		throw new KhongDo(
			`dev:session ${nguoi} thoát ${phien.status}: ${(phien.stderr ?? "").trim().split("\n").slice(-3).join(" | ")}`,
		);
	if (!(await markWorkspaceOnboarded(url)))
		throw new KhongDo(
			`kho ${ten} không có hàng workspace sau dev:session ${nguoi} — không đặt được mốc onboarding`,
		);
	kiemNgat();

	return moiTruong;
}

async function don(base) {
	let hong = false;
	if (trangThai.lenhCon && trangThai.lenhCon.exitCode === null) {
		trangThai.lenhCon.kill("SIGTERM");
	}
	if (trangThai.may.length > 0) {
		const con = await giet(trangThai.may);
		if (con.length > 0) {
			noi(`DỌN HỎNG — máy chủ ${con.map((m) => m.ten).join(", ")} vẫn còn`);
			hong = true;
		}
	}
	if (trangThai.kho) {
		try {
			await dropMeasureDatabase(base, trangThai.kho);
		} catch (loi) {
			noi(`DỌN HỎNG — không xoá được kho ${trangThai.kho}: ${loi.message}`);
			hong = true;
		}
	}
	if (!hong && trangThai.tepGhi) rmSync(trangThai.tepGhi, { force: true });
	if (trangThai.nhaKhoa) await trangThai.nhaKhoa();
	return hong;
}

let base;
try {
	base = serverUrl();
} catch (loi) {
	noi(`KHONG DO DUOC: ${loi.message}`);
	process.exit(2);
}

let ma = 2;
try {
	const moiTruong = await dung(base);
	ma = await chayThang(moiTruong);
} catch (loi) {
	if (loi instanceof BiNgat) {
		ma = MA_NGAT[loi.message] ?? 2;
	} else if (loi instanceof KhongDo || loi instanceof MeasureDatabaseError) {
		noi(`KHONG DO DUOC: ${loi.message}`);
		ma = 2;
	} else {
		noi(`KHONG DO DUOC: ${loi?.stack ?? loi}`);
		ma = 2;
	}
} finally {
	const hong = await don(base);
	if (trangThai.ngat) ma = MA_NGAT[trangThai.ngat];
	else if (hong && ma === 0) ma = 2;
	noi(`xong — mã ${ma}`);
}
process.exit(ma);
