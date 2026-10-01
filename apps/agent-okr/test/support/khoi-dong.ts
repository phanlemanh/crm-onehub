import { type ChildProcess, spawn } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { type AddressInfo, createServer } from "node:net";
import { join } from "node:path";
import {
	databaseName,
	runScopedUrl,
	TEST_DATABASE,
} from "@crm/db/test-database";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

export const APP = join(import.meta.dir, "..", "..");
export const KHOI_DONG = {
	choMs: 2 * MINUTE_MS,
	nhipMs: 300,
	hoiMs: 2 * SECOND_MS,
	dungMs: 5 * SECOND_MS,
	trung: {
		dau: "A dev server is already running for this eve agent.",
		thuMuc: [".scratch", "eve-tach"],
		boQua: ["node_modules", ".eve", ".output", ".turbo", "test", ".scratch"],
		trangThai: [".eve", "dev-server-state.v1.json"],
		choTrangThaiMs: 10 * SECOND_MS,
	},
	congBan: { dau: "EADDRINUSE", soLanThu: 3 },
	khoa: {
		ten: "khoa-khoi-dong",
		tep: "pid",
		choMs: 3 * MINUTE_MS,
		nhipMs: 500,
	},
} as const;
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

function songCon(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function khoaCu(khoa: string): boolean {
	try {
		const tuoi = Date.now() - statSync(khoa).mtimeMs;
		if (tuoi > KHOI_DONG.khoa.choMs) return true;
		const tep = join(khoa, KHOI_DONG.khoa.tep);
		if (!existsSync(tep)) return tuoi > KHOI_DONG.khoa.nhipMs;
		const pid = Number(readFileSync(tep, "utf8"));
		return !Number.isInteger(pid) || !songCon(pid);
	} catch {
		return false;
	}
}

async function giuKhoa(goc: string): Promise<() => void> {
	const eve = join(goc, ".eve");
	const khoa = join(eve, KHOI_DONG.khoa.ten);
	mkdirSync(eve, { recursive: true });
	const het = Date.now() + KHOI_DONG.khoa.choMs;
	while (Date.now() < het) {
		try {
			mkdirSync(khoa);
			writeFileSync(join(khoa, KHOI_DONG.khoa.tep), String(process.pid));
			return () => rmSync(khoa, { recursive: true, force: true });
		} catch {
			if (khoaCu(khoa)) rmSync(khoa, { recursive: true, force: true });
			else await Bun.sleep(KHOI_DONG.khoa.nhipMs);
		}
	}
	throw new Error(
		`khoa khoi dong eve van bi giu sau ${KHOI_DONG.khoa.choMs} ms: ${khoa}`,
	);
}

function banTach(goc: string) {
	const tach = join(goc, ...KHOI_DONG.trung.thuMuc, crypto.randomUUID());
	mkdirSync(tach, { recursive: true });
	const boQua: readonly string[] = KHOI_DONG.trung.boQua;
	for (const ten of readdirSync(goc))
		if (!boQua.includes(ten))
			cpSync(join(goc, ten), join(tach, ten), { recursive: true });
	return {
		goc: tach,
		don: () => rmSync(tach, { recursive: true, force: true }),
	};
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
	const traKhoa = await giuKhoa(goc);
	let lan: Exclude<LanKhoiDong, { kieu: "cong-ban" }>;
	try {
		lan = await moEveDoiCong(EVE, goc, v);
	} finally {
		traKhoa();
	}
	if (lan.kieu === "song") return lan.may;
	const tach = banTach(goc);
	try {
		const lanTach = await moEveDoiCong(EVE, tach.goc, v);
		if (lanTach.kieu === "trung")
			throw new Error(
				`eve van bao trung o ban tach ${tach.goc}:\n${lanTach.log}`,
			);
		const may = lanTach.may;
		may.log.unshift(
			`tach sang ${tach.goc} vi ${goc} da co eve dev:\n${lan.log}`,
		);
		return {
			...may,
			dung: async () => {
				await may.dung();
				tach.don();
			},
		};
	} catch (loi) {
		tach.don();
		throw loi;
	}
}
