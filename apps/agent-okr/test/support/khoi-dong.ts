import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	realpathSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { type AddressInfo, createServer } from "node:net";
import { basename, join } from "node:path";
import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc";
import {
	databaseName,
	runScopedUrl,
	TEST_DATABASE,
} from "@crm/db/test-database";
import { z } from "zod";

const SECOND_MS = MINUTE_MS / 60;

export const APP = join(import.meta.dir, "..", "..");
export const KHOI_DONG = {
	choMs: 2 * MINUTE_MS,
	nhipMs: 300,
	hoiMs: 2 * SECOND_MS,
	dungMs: 5 * SECOND_MS,
	trung: {
		dau: "A dev server is already running for this eve agent.",
		trangThai: [".eve", "dev-server-state.v1.json"],
		choTrangThaiMs: 10 * SECOND_MS,
	},
	congBan: { dau: "EADDRINUSE", soLanThu: 3 },
	moCoi: { dau: "/node_modules/.bin/eve dev" },
	sanSang: { choMs: 30 * SECOND_MS, nhipMs: 300 },
	khoa: {
		thuMuc: [APP, "..", "..", "node_modules", ".cache", "crm-eve-khoa"],
		tep: "chu.json",
		choMs: 5 * MINUTE_MS,
		nhipMs: 500,
		duoiTam: ".tam-",
		duoiCu: ".cu-",
	},
	nodeToiThieu: 24,
	bienBatBuoc: "CRM_EVE_BAT_BUOC",
} as const;

export function kiemNodeEve(phienBan: string, batBuoc: boolean): boolean {
	const du =
		Number(phienBan.match(/^v(\d+)/)?.[1] ?? 0) >= KHOI_DONG.nodeToiThieu;
	if (!du && batBuoc)
		throw new Error(
			`${KHOI_DONG.bienBatBuoc}=1 nhung eve can Node >= ${KHOI_DONG.nodeToiThieu}, may nay chay ${phienBan || "khong co node"}`,
		);
	return du;
}

const NODE_CUA_EVE =
	spawnSync("node", ["--version"], { encoding: "utf8" }).stdout?.trim() ?? "";

export const EVE_CHAY_DUOC = kiemNodeEve(
	NODE_CUA_EVE,
	process.env.CRM_EVE_BAT_BUOC === "1",
);
if (!EVE_CHAY_DUOC)
	console.warn(
		`bo qua bai can eve dev: eve can Node >= ${KHOI_DONG.nodeToiThieu}, may nay chay ${NODE_CUA_EVE || "khong co node"}`,
	);
const EVE = [
	join(APP, "node_modules", ".bin", "eve"),
	join(APP, "..", "..", "node_modules", ".bin", "eve"),
].find((d) => existsSync(d));

export function congTuDo(): Promise<number> {
	return new Promise((ok, loi) => {
		const s = createServer();
		s.once("error", loi);
		s.listen(0, "127.0.0.1", () => {
			const { port } = s.address() as AddressInfo;
			s.close(() => ok(port));
		});
	});
}

export type MoiTruongKhoThu = {
	readonly TEST_DATABASE_URL?: string;
	readonly TEST_RUN_ID?: string;
};

export const LOI_KHO_THU = {
	thieu: "thieu TEST_DATABASE_URL: eve con chi chay trong bun run test",
	khongDungMotLan: "kho thu khong phai kho dung mot lan",
} as const;

export function moiTruongModelTacGia(moiTruong: MoiTruongKhoThu) {
	const goc = moiTruong.TEST_DATABASE_URL?.trim();
	if (!goc) throw new Error(LOI_KHO_THU.thieu);
	const kho = runScopedUrl(goc, moiTruong.TEST_RUN_ID);
	if (!databaseName(kho).endsWith(TEST_DATABASE.suffix))
		throw new Error(`${LOI_KHO_THU.khongDungMotLan}: ${databaseName(kho)}`);
	return { NODE_ENV: "development", DATABASE_URL: kho };
}

export type MayEve = {
	url: string;
	cong: number;
	goc: string;
	tien: ChildProcess;
	log: string[];
	dung: () => Promise<void>;
};

type LanKhoiDong =
	| { kieu: "song"; may: MayEve }
	| { kieu: "trung"; log: string }
	| { kieu: "cong-ban"; log: string };

export type TuyChonKhoiDong = {
	goc?: string;
	env?: Record<string, string>;
	cong?: number;
};

const trangThaiEve = z.object({ url: z.string().url() });
const conKhoaEve = z.object({
	pid: z.number().int().positive(),
	batDau: z.string().min(1),
});
const chuKhoaEve = z.object({
	pid: z.number().int().positive(),
	tep: z.string(),
	ma: z.string().min(1).optional(),
	con: z.array(conKhoaEve).default([]),
});
type ChuKhoaEve = z.infer<typeof chuKhoaEve>;

export type DauKhoa = { ino: number; mtimeMs: number; ma: string | null };

export type TuyChonGhiKhoa = { giuaGhi?: () => void };

export type TuyChonGiuKhoa = TuyChonGhiKhoa & {
	choMs?: number;
	sauKhiXetCu?: () => Promise<void>;
};

const khoaDangGiu = new Map<string, { khoa: string; ma: string }>();
const gocDangChay = new Set<string>();

process.once("exit", () => {
	for (const that of [...khoaDangGiu.keys()]) goNeuCuaMinh(that);
});

const thatCua = (goc: string) => realpathSync(goc);

function duongKhoa(that: string): string {
	const bam = createHash("sha256").update(that).digest("hex").slice(0, 16);
	return join(...KHOI_DONG.khoa.thuMuc, bam);
}

export function duongKhoaEve(goc: string): string {
	return duongKhoa(thatCua(goc));
}

function ghiChu(khoa: string, chu: ChuKhoaEve, giuaGhi?: () => void): void {
	const tam = join(
		khoa,
		`${KHOI_DONG.khoa.tep}${KHOI_DONG.khoa.duoiTam}${randomUUID()}`,
	);
	writeFileSync(tam, JSON.stringify(chu));
	giuaGhi?.();
	renameSync(tam, join(khoa, KHOI_DONG.khoa.tep));
}

function songCon(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function chuKhoa(khoa: string): ChuKhoaEve | null {
	try {
		return chuKhoaEve.parse(
			JSON.parse(readFileSync(join(khoa, KHOI_DONG.khoa.tep), "utf8")),
		);
	} catch {
		return null;
	}
}

function docPs(pid: number, cot: "lstart=" | "command="): string | null {
	const r = spawnSync("ps", ["-o", cot, "-p", String(pid)], {
		encoding: "utf8",
	});
	return r.status === 0 ? r.stdout.trim() || null : null;
}

function cayCon(pid: number): number[] {
	const r = spawnSync("pgrep", ["-P", String(pid)], { encoding: "utf8" });
	const con = (r.stdout ?? "").split("\n").filter(Boolean).map(Number);
	return con.flatMap((c) => [c, ...cayCon(c)]);
}

function laEveDaGhi(c: z.infer<typeof conKhoaEve>): boolean {
	return (
		docPs(c.pid, "lstart=") === c.batDau &&
		(docPs(c.pid, "command=") ?? "").includes(KHOI_DONG.moCoi.dau)
	);
}

async function dungMoCoi(khoa: string): Promise<void> {
	const can = (chuKhoa(khoa)?.con ?? [])
		.filter(laEveDaGhi)
		.flatMap((c) => [c.pid, ...cayCon(c.pid)]);
	for (const pid of can) guiTinHieu(pid, "SIGTERM");
	const het = Date.now() + KHOI_DONG.dungMs;
	while (can.some(songCon) && Date.now() < het)
		await Bun.sleep(KHOI_DONG.nhipMs);
	for (const pid of can.filter(songCon)) guiTinHieu(pid, "SIGKILL");
}

function guiTinHieu(pid: number, tin: NodeJS.Signals): void {
	try {
		process.kill(pid, tin);
	} catch {}
}

export function ghiConVaoKhoa(
	goc: string,
	pid: number,
	tuyChon: TuyChonGhiKhoa = {},
): void {
	const giu = khoaDangGiu.get(thatCua(goc));
	if (!giu) throw new Error(`khong giu khoa cua ${goc}`);
	const chu = chuKhoa(giu.khoa);
	if (!chu) throw new Error(`khoa cua ${goc} khong doc duoc`);
	if (chu.ma !== giu.ma) throw new Error(`khoa cua ${goc} da doi chu`);
	const batDau = docPs(pid, "lstart=");
	if (!batDau) throw new Error(`khong doc duoc gio khoi dong cua pid ${pid}`);
	const moi: ChuKhoaEve = { ...chu, con: [...chu.con, { pid, batDau }] };
	ghiChu(giu.khoa, moi, tuyChon.giuaGhi);
}

export function dauKhoaEve(khoa: string): DauKhoa {
	const st = statSync(khoa);
	return { ino: st.ino, mtimeMs: st.mtimeMs, ma: chuKhoa(khoa)?.ma ?? null };
}

export function cungDau(a: DauKhoa, b: DauKhoa): boolean {
	return a.ino === b.ino && a.mtimeMs === b.mtimeMs && a.ma === b.ma;
}

function dauNeuCu(khoa: string): DauKhoa | null {
	try {
		const dau = dauKhoaEve(khoa);
		const chu = chuKhoa(khoa);
		const cu =
			chu !== null
				? !songCon(chu.pid)
				: Date.now() - dau.mtimeMs > KHOI_DONG.khoa.nhipMs;
		return cu ? dau : null;
	} catch {
		return null;
	}
}

export function xetKhoaCu(khoa: string): boolean {
	return dauNeuCu(khoa) !== null;
}

async function gianhKhoaCu(khoa: string, dau: DauKhoa): Promise<void> {
	const daGianh = `${khoa}${KHOI_DONG.khoa.duoiCu}${randomUUID()}`;
	try {
		renameSync(khoa, daGianh);
	} catch {
		return;
	}
	if (!cungDau(dau, dauKhoaEve(daGianh))) {
		renameSync(daGianh, khoa);
		return;
	}
	await dungMoCoi(daGianh);
	rmSync(daGianh, { recursive: true, force: true });
}

async function giuMot(that: string, tuyChon: TuyChonGiuKhoa): Promise<void> {
	const khoa = duongKhoa(that);
	mkdirSync(join(...KHOI_DONG.khoa.thuMuc), { recursive: true });
	const choMs = tuyChon.choMs ?? KHOI_DONG.khoa.choMs;
	const batDau = Date.now();
	while (Date.now() - batDau < choMs) {
		try {
			mkdirSync(khoa);
		} catch {
			const dau = dauNeuCu(khoa);
			if (dau) {
				if (tuyChon.sauKhiXetCu) await tuyChon.sauKhiXetCu();
				await gianhKhoaCu(khoa, dau);
			} else await Bun.sleep(KHOI_DONG.khoa.nhipMs);
			continue;
		}
		const ma = randomUUID();
		const chu: ChuKhoaEve = {
			pid: process.pid,
			tep: basename(process.argv[1] ?? "?"),
			ma,
			con: [],
		};
		ghiChu(khoa, chu, tuyChon.giuaGhi);
		khoaDangGiu.set(that, { khoa, ma });
		return;
	}
	const chu = chuKhoa(khoa);
	throw new Error(
		`goc ${that} van bi giu boi pid ${chu?.pid ?? "?"} (${chu?.tep ?? "?"}) sau ${Math.round((Date.now() - batDau) / 1000)} s cho`,
	);
}

function goNeuCuaMinh(that: string): void {
	const giu = khoaDangGiu.get(that);
	if (!giu) return;
	khoaDangGiu.delete(that);
	if (chuKhoa(giu.khoa)?.ma === giu.ma)
		rmSync(giu.khoa, { recursive: true, force: true });
}

export function traKhoaEve(cacGoc: readonly string[]): void {
	for (const that of new Set(cacGoc.map(thatCua))) goNeuCuaMinh(that);
}

export async function giuKhoaEve(
	cacGoc: readonly string[],
	tuyChon: TuyChonGiuKhoa = {},
): Promise<void> {
	const can = [...new Set(cacGoc.map(thatCua))]
		.filter((that) => !khoaDangGiu.has(that))
		.sort();
	const lon = [...khoaDangGiu.keys()].sort().at(-1);
	const truoc = can[0];
	if (lon !== undefined && truoc !== undefined && truoc < lon)
		throw new Error(
			`lay khoa eve sai thu tu: dang giu ${lon}, can ${truoc}; goi giuKhoaEve voi moi goc can dung truoc khi khoi dong`,
		);
	for (const that of can) await giuMot(that, tuyChon);
}

function pidNghe(url: string): string {
	const cong = new URL(url).port;
	const r = spawnSync("lsof", ["-nP", `-iTCP:${cong}`, "-sTCP:LISTEN", "-t"], {
		encoding: "utf8",
	});
	return r.stdout?.trim().split("\n")[0] || "?";
}

function loiEveNgoai(goc: string, log: string): Error {
	let url = "?";
	try {
		url = trangThaiEve.parse(
			JSON.parse(readFileSync(join(goc, ...KHOI_DONG.trung.trangThai), "utf8")),
		).url;
	} catch {}
	const pid = url === "?" ? "?" : pidNghe(url);
	return new Error(
		`goc ${goc} dang co eve dev khong phai cua bai thu (pid ${pid}, ${url}); dung no bang: kill ${pid} — roi chay lai.\n${log}`,
	);
}

async function hoi(url: string): Promise<boolean> {
	try {
		const r = await fetch(url, {
			signal: AbortSignal.timeout(KHOI_DONG.hoiMs),
		});
		return r.ok;
	} catch {
		return false;
	}
}

export type TranCho = { readonly choMs: number; readonly nhipMs: number };

export async function choRoute(
	url: string,
	tran: TranCho = KHOI_DONG.sanSang,
): Promise<number> {
	const het = Date.now() + tran.choMs;
	let cuoi = "khong ket noi";
	do {
		try {
			const r = await fetch(url, {
				signal: AbortSignal.timeout(KHOI_DONG.hoiMs),
			});
			if (r.status !== 503) return r.status;
			cuoi = "503";
		} catch {
			cuoi = "khong ket noi";
		}
		await Bun.sleep(tran.nhipMs);
	} while (Date.now() < het);
	throw new Error(`route ${url} chua san sang sau ${tran.choMs} ms: ${cuoi}`);
}

async function choGhiTrangThai(goc: string, cong: number): Promise<void> {
	const tep = join(goc, ...KHOI_DONG.trung.trangThai);
	const het = Date.now() + KHOI_DONG.trung.choTrangThaiMs;
	while (Date.now() < het) {
		try {
			if (readFileSync(tep, "utf8").includes(`:${cong}`)) return;
		} catch {}
		await Bun.sleep(KHOI_DONG.nhipMs);
	}
}

async function moEve(
	eve: string,
	goc: string,
	v: TuyChonKhoiDong,
): Promise<LanKhoiDong> {
	const cong = v.cong ?? (await congTuDo());
	const log: string[] = [];
	const tien = spawn(eve, ["dev", "--no-ui", "--port", String(cong)], {
		cwd: goc,
		stdio: ["ignore", "pipe", "pipe"],
		env: {
			...process.env,
			...v.env,
			PORT: String(cong),
			CRM_TELEMETRY_DISABLED: "1",
		},
	});
	tien.stdout?.on("data", (d) => log.push(String(d)));
	tien.stderr?.on("data", (d) => log.push(String(d)));
	if (tien.pid) ghiConVaoKhoa(goc, tien.pid);
	const url = `http://127.0.0.1:${cong}`;
	const dung = () =>
		new Promise<void>((ok) => {
			if (tien.exitCode !== null) return ok();
			tien.once("exit", () => ok());
			tien.kill("SIGTERM");
			setTimeout(() => tien.kill("SIGKILL"), KHOI_DONG.dungMs).unref();
		});
	const het = Date.now() + KHOI_DONG.choMs;
	while (Date.now() < het) {
		const chu = log.join("");
		if (tien.exitCode !== null) {
			if (chu.includes(KHOI_DONG.trung.dau)) return { kieu: "trung", log: chu };
			throw new Error(`eve thoat som (${tien.exitCode}):\n${chu}`);
		}
		if (chu.includes(KHOI_DONG.congBan.dau)) {
			await dung();
			if (v.cong === undefined) return { kieu: "cong-ban", log: chu };
			throw new Error(`eve khong nghe duoc cong ${cong}:\n${chu}`);
		}
		if (await hoi(`${url}/eve/v1/health`)) {
			await choGhiTrangThai(goc, cong);
			try {
				await choRoute(`${url}/health`);
			} catch (loi) {
				await dung();
				throw loi;
			}
			return { kieu: "song", may: { url, cong, goc, tien, log, dung } };
		}
		await Bun.sleep(KHOI_DONG.nhipMs);
	}
	await dung();
	throw new Error(
		`eve khong san sang sau ${KHOI_DONG.choMs} ms:\n${log.join("")}`,
	);
}

async function moEveDoiCong(
	eve: string,
	goc: string,
	v: TuyChonKhoiDong,
): Promise<Exclude<LanKhoiDong, { kieu: "cong-ban" }>> {
	let lan = await moEve(eve, goc, v);
	for (let i = 1; lan.kieu === "cong-ban"; i++) {
		if (i >= KHOI_DONG.congBan.soLanThu)
			throw new Error(
				`eve khong nghe duoc cong sau ${KHOI_DONG.congBan.soLanThu} lan:\n${lan.log}`,
			);
		lan = await moEve(eve, goc, v);
	}
	return lan;
}

export async function khoiDongEve(v: TuyChonKhoiDong = {}): Promise<MayEve> {
	if (!EVE) throw new Error("khong thay eve trong node_modules/.bin");
	const goc = v.goc ?? APP;
	const that = thatCua(goc);
	if (gocDangChay.has(that))
		throw new Error(
			`goc ${goc} dang co eve cua chinh tien trinh nay (pid ${process.pid}); dung may cu truoc khi khoi dong lai`,
		);
	const tuGiu = !khoaDangGiu.has(that);
	await giuKhoaEve([goc]);
	gocDangChay.add(that);
	const xong = () => {
		gocDangChay.delete(that);
		if (tuGiu) goNeuCuaMinh(that);
	};
	try {
		const lan = await moEveDoiCong(EVE, goc, v);
		if (lan.kieu === "trung") throw loiEveNgoai(goc, lan.log);
		const may = lan.may;
		return {
			...may,
			dung: async () => {
				try {
					await may.dung();
				} finally {
					xong();
				}
			},
		};
	} catch (loi) {
		xong();
		throw loi;
	}
}
