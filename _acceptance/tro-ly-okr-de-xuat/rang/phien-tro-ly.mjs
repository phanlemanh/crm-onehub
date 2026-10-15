import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, openSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";
import { currentTree } from "../../../packages/db/src/measure-database.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
export const RA = join(GOC, ".acceptance-runs/tro-ly-okr-de-xuat");
export const AGENT = join(GOC, "apps/agent");
const API_DIR = join(GOC, "apps/api");
export const pg = createRequire(join(GOC, "packages/db/package.json"))("pg");

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

export const PHIEN_TRO_LY = {
	mienMau: "mau.onehub.test",
	tienToMau: "mau-okr-",
	gioVN: 7,
	hauToCay: "tro-ly",
	coTrongPhien: "TDX_CO_TAC_TU",
	bienCongTacTu: "TDX_CONG_TAC_TU",
	node24: [
		"/opt/homebrew/opt/node@24/bin",
		join(homedir(), ".local/share/fnm/node-versions/v24.15.0/installation/bin"),
	],
	cho: {
		tacTuMs: 4 * PHUT_MS,
		nhipMs: 500,
		hoiMs: 5 * GIAY_MS,
		donMs: 10 * GIAY_MS,
	},
	thongDiep: {
		thieuKhoa: "thieu khoa mo hinh",
		soDuCan: (so) =>
			`so du AI Gateway ${so} USD — nap tin dung truoc khi do (moi loi goi model se tra 402)`,
		soDuKhongDoc: (ly) => `khong doc duoc so du AI Gateway (${ly}) — van do`,
	},
	soDu: {
		url: "https://ai-gateway.vercel.sh/v1/credits",
		bienUrl: "TDX_URL_SO_DU",
		hoiMs: 10 * GIAY_MS,
	},
	maNgat: { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 },
};

export const tre = (ms) => new Promise((xong) => setTimeout(xong, ms));

export function coKhoaMoHinh() {
	return Object.values(TRO_LY_OKR.khoa).some((k) => process.env[k]?.trim());
}

export function cauThieuKhoa() {
	return `${PHIEN_TRO_LY.thongDiep.thieuKhoa} (${Object.values(TRO_LY_OKR.khoa).join(" hoac ")})`;
}

export function duongPath() {
	const node24 = PHIEN_TRO_LY.node24.find((d) => existsSync(d));
	return node24
		? `${node24}:${process.env.PATH ?? ""}`
		: (process.env.PATH ?? "");
}

export function thuMau(ma) {
	return `${ma}@${PHIEN_TRO_LY.mienMau}`;
}

export function idMau(loai, ma) {
	return `${PHIEN_TRO_LY.tienToMau}${loai}-${ma}`;
}

export function ngayVN(luc = new Date()) {
	return new Date(luc.getTime() + PHIEN_TRO_LY.gioVN * 60 * PHUT_MS)
		.toISOString()
		.slice(0, 10);
}

export function thangVN(luc = new Date()) {
	return ngayVN(luc).slice(0, 7);
}

export function laKhoDo(url = process.env.DATABASE_URL ?? "") {
	try {
		return /_do$/.test(new URL(url).pathname);
	} catch {
		return false;
	}
}

export function tenKhoTheoCay(ten, cay = currentTree(GOC)) {
	return `${cay}-${ten}`;
}

export async function soDuGateway(env = process.env, layFetch = fetch) {
	const khoa = Object.values(TRO_LY_OKR.khoa)
		.map((k) => env[k]?.trim())
		.find(Boolean);
	if (!khoa) return { khongDoc: "thieu khoa" };
	try {
		const url = env[PHIEN_TRO_LY.soDu.bienUrl]?.trim() || PHIEN_TRO_LY.soDu.url;
		const r = await layFetch(url, {
			headers: { authorization: `Bearer ${khoa}` },
			signal: AbortSignal.timeout(PHIEN_TRO_LY.soDu.hoiMs),
		});
		if (!r.ok) return { khongDoc: `HTTP ${r.status}` };
		const so = Number((await r.json())?.balance);
		return Number.isFinite(so) ? { soDu: so } : { khongDoc: "balance khong phai so" };
	} catch (loi) {
		return { khongDoc: loi?.message ?? String(loi) };
	}
}

export async function chanSoDu(env = process.env, layFetch = fetch) {
	const doc = await soDuGateway(env, layFetch);
	if ("khongDoc" in doc) {
		console.error(PHIEN_TRO_LY.thongDiep.soDuKhongDoc(doc.khongDoc));
		return null;
	}
	return doc.soDu <= 0 ? PHIEN_TRO_LY.thongDiep.soDuCan(doc.soDu) : null;
}

export function taoKho(ten) {
	const r = spawnSync("bun", ["run", "db:do", "--tao", "--ten", tenKhoTheoCay(ten)], {
		cwd: GOC,
		encoding: "utf8",
	});
	const url = `${r.stdout}`
		.trim()
		.split("\n")
		.map((d) => d.replace(/^.*?(postgres(?:ql)?:\/\/)/, "$1"))
		.findLast((d) => /^postgres(ql)?:\/\//.test(d));
	if (r.status !== 0 || !url) {
		throw new Error(
			`khong tao duoc kho do ${ten}: ${`${r.stderr}`.trim().split("\n").slice(-3).join(" | ")}`,
		);
	}
	return url;
}

export function xoaKho(ten) {
	const r = spawnSync("bun", ["run", "db:do", "--xoa", "--ten", tenKhoTheoCay(ten)], {
		cwd: GOC,
		encoding: "utf8",
	});
	return r.status === 0;
}

export function phienCookie(email, env = process.env) {
	const r = spawnSync("bun", ["run", "dev:session", email], {
		cwd: API_DIR,
		env,
		encoding: "utf8",
	});
	if (r.status !== 0) {
		throw new Error(
			`dev:session ${email} thoat ${r.status}: ${`${r.stderr}`.trim().split("\n").slice(-3).join(" | ")}`,
		);
	}
	const dong = `${r.stdout}`.trim().split("\n").pop()?.trim() ?? "";
	const dau = dong.indexOf("=");
	if (dau < 1) throw new Error(`dev:session ${email} khong in cookie`);
	return { ten: dong.slice(0, dau), gia: dong.slice(dau + 1) };
}

export function napBoMau(env = process.env, moc = ngayVN()) {
	const r = spawnSync("bun", ["run", "okr:mau", "--moc", moc], {
		cwd: API_DIR,
		env,
		encoding: "utf8",
	});
	const dong = (chu) => `${chu ?? ""}`.trim().split("\n").filter(Boolean);
	const ra = r.status === 0 ? dong(r.stdout) : dong(r.stderr);
	return { ma: r.status, moc, dong: ra.at(-1) ?? "" };
}

export function trpc(api, cookie) {
	const dau = { Cookie: `${cookie.ten}=${cookie.gia}; lang=vi` };
	async function doc(res, duong) {
		const chu = await res.text();
		if (!res.ok)
			throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
		return JSON.parse(chu).result.data;
	}
	return {
		hoi: async (duong, vao) => {
			const q =
				vao === undefined
					? ""
					: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
			const res = await fetch(`${api}/api/trpc/${duong}${q}`, {
				redirect: "manual",
				headers: dau,
			});
			return doc(res, duong);
		},
		lam: async (duong, vao) => {
			const res = await fetch(`${api}/api/trpc/${duong}`, {
				method: "POST",
				redirect: "manual",
				headers: { ...dau, "content-type": "application/json" },
				body: JSON.stringify(vao),
			});
			return doc(res, duong);
		},
	};
}

export function congTuDo() {
	return new Promise((xong, hong) => {
		const may = createServer();
		may.once("error", hong);
		may.listen({ port: 0, host: "127.0.0.1", exclusive: true }, () => {
			const cong = may.address().port;
			may.close(() => xong(cong));
		});
	});
}

function nhomSong(pgid) {
	try {
		process.kill(-pgid, 0);
		return true;
	} catch {
		return false;
	}
}

async function tatNhom(pgid) {
	try {
		process.kill(-pgid, "SIGTERM");
	} catch {}
	const han = Date.now() + PHIEN_TRO_LY.cho.donMs;
	while (Date.now() < han && nhomSong(pgid)) await tre(PHIEN_TRO_LY.cho.nhipMs);
	if (nhomSong(pgid)) {
		try {
			process.kill(-pgid, "SIGKILL");
		} catch {}
	}
	return !nhomSong(pgid);
}

function duoiNhatKy(tep) {
	try {
		return readFileSync(tep, "utf8")
			.trim()
			.split("\n")
			.slice(-8)
			.join("\n    ");
	} catch {
		return "(khong doc duoc nhat ky)";
	}
}

export async function batTacTu({ cong, thuMuc, env = process.env }) {
	const secret = env.AGENT_BRIDGE_SECRET?.trim();
	if (!secret) throw new Error("thieu AGENT_BRIDGE_SECRET de noi tac tu");
	mkdirSync(thuMuc, { recursive: true });
	const nhatKy = join(thuMuc, "tac-tu.log");
	const fd = openSync(nhatKy, "w");
	const con = spawn(
		join(AGENT, "node_modules/.bin/eve"),
		["dev", "--no-ui", "--port", String(cong)],
		{
			cwd: AGENT,
			detached: true,
			stdio: ["ignore", fd, fd],
			env: {
				...env,
				PATH: duongPath(),
				PORT: String(cong),
				CRM_TELEMETRY_DISABLED: "1",
				ZALO_BOT_TOKEN: "",
			},
		},
	);
	const nghe = Object.entries(PHIEN_TRO_LY.maNgat).map(([tin, ma]) => {
		const khiNgat = () => {
			console.error(`-- nhan ${tin}: tat tac tu nhom ${con.pid}`);
			void tatNhom(con.pid).finally(() => process.exit(ma));
		};
		process.once(tin, khiNgat);
		return [tin, khiNgat];
	});
	const dung = async () => {
		for (const [tin, khiNgat] of nghe) process.off(tin, khiNgat);
		return tatNhom(con.pid);
	};
	const url = `http://127.0.0.1:${cong}`;
	const han = Date.now() + PHIEN_TRO_LY.cho.tacTuMs;
	for (;;) {
		if (con.exitCode !== null || con.signalCode !== null) {
			await dung();
			throw new Error(
				`tac tu thoat truoc khi san sang (${con.exitCode ?? con.signalCode}):\n    ${duoiNhatKy(nhatKy)}`,
			);
		}
		try {
			await fetch(`${url}/internal/crm/dispatch-health`, {
				headers: { authorization: `Bearer ${secret}` },
				signal: AbortSignal.timeout(PHIEN_TRO_LY.cho.hoiMs),
			});
			break;
		} catch {}
		if (Date.now() > han) {
			await dung();
			throw new Error(
				`tac tu khong san sang o ${url} sau ${PHIEN_TRO_LY.cho.tacTuMs / 1000} s:\n    ${duoiNhatKy(nhatKy)}`,
			);
		}
		await tre(PHIEN_TRO_LY.cho.nhipMs);
	}
	return { url, nhatKy, pgid: con.pid, dung };
}

export function trongPhienCoTacTu() {
	return (
		process.env[PHIEN_TRO_LY.coTrongPhien] === "1" &&
		laKhoDo() &&
		Boolean(process.env.AGENT_BRIDGE_SECRET?.trim()) &&
		Boolean(process.env[PHIEN_TRO_LY.bienCongTacTu])
	);
}

function tenCay() {
	const top = spawnSync("git", ["rev-parse", "--show-toplevel"], {
		cwd: GOC,
		encoding: "utf8",
	});
	const ten = top.status === 0 ? top.stdout.trim().split("/").pop() : "crm";
	return `${ten}-${PHIEN_TRO_LY.hauToCay}`;
}

function urlKhoChung() {
	const cu = process.env.DATABASE_URL ?? "";
	if (!laKhoDo(cu)) return cu;
	const u = new URL(cu);
	u.pathname = "/postgres";
	return u.toString();
}

export async function chayTrongPhienCoTacTu(lenh) {
	const cong = await congTuDo();
	const env = {
		...process.env,
		DATABASE_URL: urlKhoChung(),
		AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
		AGENT_URL: `http://127.0.0.1:${cong}`,
		[PHIEN_TRO_LY.bienCongTacTu]: String(cong),
		[PHIEN_TRO_LY.coTrongPhien]: "1",
		PHIEN_DO_TEN_CAY: tenCay(),
		NGUOI: process.env.NGUOI ?? PHIEN_DO.nguoi,
	};
	delete env.PHIEN_DO;
	delete env.APP_URL;
	delete env.API_URL;
	console.log(
		`-- phien do co tac tu: cay ${env.PHIEN_DO_TEN_CAY} · tac tu cong ${cong}`,
	);
	const con = spawn(
		"bun",
		[join(GOC, "scripts/lan-do/phien-do.mjs"), "--chay", lenh],
		{ cwd: GOC, stdio: "inherit", env },
	);
	const ngat = PHIEN_TRO_LY.maNgat;
	for (const tin of Object.keys(ngat)) process.on(tin, () => con.kill(tin));
	return new Promise((xong) => {
		con.on("error", () => xong(2));
		con.on("exit", (m, tin) => xong(m ?? ngat[tin] ?? 2));
	});
}

export async function docSql(url, tep, thang) {
	const khach = new pg.Client({ connectionString: url });
	await khach.connect();
	try {
		await khach.query("SELECT set_config('okr.thang', $1, false)", [thang]);
		const { rows } = await khach.query(readFileSync(tep, "utf8"));
		return rows;
	} finally {
		await khach.end();
	}
}

export async function truyVan(url, cau, thamSo = []) {
	const khach = new pg.Client({ connectionString: url });
	await khach.connect();
	try {
		return (await khach.query(cau, thamSo)).rows;
	} finally {
		await khach.end();
	}
}
