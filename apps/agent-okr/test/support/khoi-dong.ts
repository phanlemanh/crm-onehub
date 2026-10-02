import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	realpathSync,
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
	khoa: {
		thuMuc: [APP, "..", "..", "node_modules", ".cache", "crm-eve-khoa"],
		tep: "chu.json",
		choMs: 5 * MINUTE_MS,
		nhipMs: 500,
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
const chuKhoaEve = z.object({
	pid: z.number().int().positive(),
	tep: z.string(),
});
type ChuKhoaEve = z.infer<typeof chuKhoaEve>;

const khoaDangGiu = new Map<string, string>();
const gocDangChay = new Set<string>();

process.once("exit", () => {
	for (const khoa of khoaDangGiu.values())
		rmSync(khoa, { recursive: true, force: true });
});

const thatCua = (goc: string) => realpathSync(goc);

function duongKhoa(that: string): string {
	const bam = createHash("sha256").update(that).digest("hex").slice(0, 16);
	return join(...KHOI_DONG.khoa.thuMuc, bam);
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

function khoaCu(khoa: string): boolean {
	try {
		const chu = chuKhoa(khoa);
		if (chu !== null) return !songCon(chu.pid);
		return Date.now() - statSync(khoa).mtimeMs > KHOI_DONG.khoa.nhipMs;
	} catch {
		return false;
	}
}

async function giuMot(that: string): Promise<void> {
	const khoa = duongKhoa(that);
	mkdirSync(join(...KHOI_DONG.khoa.thuMuc), { recursive: true });
	const batDau = Date.now();
	while (Date.now() - batDau < KHOI_DONG.khoa.choMs) {
		try {
			mkdirSync(khoa);
			const chu: ChuKhoaEve = {
				pid: process.pid,
				tep: basename(process.argv[1] ?? "?"),
			};
			writeFileSync(join(khoa, KHOI_DONG.khoa.tep), JSON.stringify(chu));
			khoaDangGiu.set(that, khoa);
			return;
		} catch {
			if (khoaCu(khoa)) rmSync(khoa, { recursive: true, force: true });
			else await Bun.sleep(KHOI_DONG.khoa.nhipMs);
		}
	}
	const chu = chuKhoa(khoa);
	throw new Error(
		`goc ${that} van bi giu boi pid ${chu?.pid ?? "?"} (${chu?.tep ?? "?"}) sau ${Math.round((Date.now() - batDau) / 1000)} s cho`,
	);
}

function traKhoa(that: string): void {
	const khoa = khoaDangGiu.get(that);
	if (!khoa) return;
	khoaDangGiu.delete(that);
	rmSync(khoa, { recursive: true, force: true });
}

export function traKhoaEve(cacGoc: readonly string[]): void {
	for (const that of new Set(cacGoc.map(thatCua))) traKhoa(that);
}

export async function giuKhoaEve(cacGoc: readonly string[]): Promise<void> {
	const can = [...new Set(cacGoc.map(thatCua))]
		.filter((that) => !khoaDangGiu.has(that))
		.sort();
	const lon = [...khoaDangGiu.keys()].sort().at(-1);
	const truoc = can[0];
	if (lon !== undefined && truoc !== undefined && truoc < lon)
		throw new Error(
			`lay khoa eve sai thu tu: dang giu ${lon}, can ${truoc}; goi giuKhoaEve voi moi goc can dung truoc khi khoi dong`,
		);
	for (const that of can) await giuMot(that);
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
		if (tuGiu) traKhoa(that);
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
