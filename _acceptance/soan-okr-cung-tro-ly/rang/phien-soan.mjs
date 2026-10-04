import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, openSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TRO_LY_OKR_SOAN } from "../../../apps/agent-okr/agent/lib/config.ts";
import {
	giuKhoaEve,
	traKhoaEve,
} from "../../../apps/agent-okr/test/support/khoi-dong.ts";
import {
	currentTree,
	treeSlug,
} from "../../../packages/db/src/measure-database.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";
import {
	congTuDo,
	duongPath,
	GOC,
	laKhoDo,
	tre,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

export const AGENT_OKR = join(GOC, "apps/agent-okr");
export const RA_SOAN = join(GOC, ".acceptance-runs/soan-okr-cung-tro-ly");

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

export const PHIEN_SOAN = {
	coTrongPhien: "SOAN_CO_TAC_TU",
	bienCong: "SOAN_CONG_TAC_TU",
	hauToCay: "soan",
	nodeToiThieu: 24,
	cho: {
		tacTuMs: 4 * PHUT_MS,
		nhipMs: 500,
		hoiMs: 5 * GIAY_MS,
		donMs: 10 * GIAY_MS,
	},
	maNgat: { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 },
};

export const coKhoaMoHinhSoan = () =>
	TRO_LY_OKR_SOAN.khoaMoHinh.some((k) => process.env[k]?.trim());

export const cauThieuKhoaSoan = () =>
	`thieu khoa mo hinh cho agent-okr (${TRO_LY_OKR_SOAN.khoaMoHinh.join(" hoac ")}) — ma 2, khong xanh`;

export const dauMocCay = () => treeSlug(currentTree(GOC));

export function nodeCuaPath(path) {
	const r = spawnSync("node", ["-v"], {
		env: { ...process.env, PATH: path },
		encoding: "utf8",
	});
	const ban = r.status === 0 ? r.stdout.trim() : null;
	const chinh = ban ? Number(/^v(\d+)\./.exec(ban)?.[1] ?? 0) : 0;
	return { ban, du: chinh >= PHIEN_SOAN.nodeToiThieu };
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
	const han = Date.now() + PHIEN_SOAN.cho.donMs;
	while (Date.now() < han && nhomSong(pgid)) await tre(PHIEN_SOAN.cho.nhipMs);
	if (nhomSong(pgid)) {
		try {
			process.kill(-pgid, "SIGKILL");
		} catch {}
	}
	return !nhomSong(pgid);
}

function duoiNhatKy(tep) {
	try {
		return readFileSync(tep, "utf8").trim().split("\n").slice(-8).join(" | ");
	} catch {
		return "(khong doc duoc nhat ky)";
	}
}

export async function batAgentOkr({ cong, thuMuc, env = process.env }) {
	if (!env[TRO_LY_OKR_SOAN.env.biMat]?.trim())
		throw new Error(
			`thieu ${TRO_LY_OKR_SOAN.env.biMat} de noi agent-okr — mo phien do qua chayTrongPhienSoan`,
		);
	const path = duongPath();
	const node = nodeCuaPath(path);
	console.log(`-- node: ${node.ban ?? "khong co"}`);
	if (!node.du)
		throw new Error(
			`agent-okr can node >= ${PHIEN_SOAN.nodeToiThieu} trong PATH, co ${node.ban ?? "khong co node"}`,
		);
	mkdirSync(thuMuc, { recursive: true });
	const nhatKy = join(thuMuc, "agent-okr.log");
	const fd = openSync(nhatKy, "w");
	await giuKhoaEve([AGENT_OKR]);
	const con = spawn(
		join(AGENT_OKR, "node_modules/.bin/eve"),
		["dev", "--no-ui", "--port", String(cong)],
		{
			cwd: AGENT_OKR,
			detached: true,
			stdio: ["ignore", fd, fd],
			env: {
				...env,
				NODE_ENV: "development",
				PATH: path,
				PORT: String(cong),
				CRM_TELEMETRY_DISABLED: "1",
			},
		},
	);
	const nghe = Object.entries(PHIEN_SOAN.maNgat).map(([tin, ma]) => {
		const khiNgat = () => {
			console.error(`-- nhan ${tin}: tat agent-okr nhom ${con.pid}`);
			void tatNhom(con.pid).finally(() => {
				traKhoaEve([AGENT_OKR]);
				process.exit(ma);
			});
		};
		process.once(tin, khiNgat);
		return [tin, khiNgat];
	});
	const dung = async () => {
		for (const [tin, khiNgat] of nghe) process.off(tin, khiNgat);
		try {
			return await tatNhom(con.pid);
		} finally {
			traKhoaEve([AGENT_OKR]);
		}
	};
	const url = `http://127.0.0.1:${cong}`;
	const can = dauMocCay();
	const han = Date.now() + PHIEN_SOAN.cho.tacTuMs;
	for (;;) {
		if (con.exitCode !== null || con.signalCode !== null) {
			await dung();
			throw new Error(
				`agent-okr thoat truoc khi san sang (${con.exitCode ?? con.signalCode}): ${duoiNhatKy(nhatKy)}`,
			);
		}
		try {
			const res = await fetch(`${url}/health`, {
				signal: AbortSignal.timeout(PHIEN_SOAN.cho.hoiMs),
			});
			if (res.ok) {
				const { cay } = await res.json();
				if (cay !== can) {
					await dung();
					return {
						url,
						nhatKy,
						pgid: con.pid,
						dung,
						cay: { ket: "khac-cay", co: cay, can },
					};
				}
				return {
					url,
					nhatKy,
					pgid: con.pid,
					dung,
					cay: { ket: "dung-cay", co: cay, can },
				};
			}
		} catch {}
		if (Date.now() > han) {
			await dung();
			throw new Error(
				`agent-okr khong san sang o ${url} sau ${PHIEN_SOAN.cho.tacTuMs / GIAY_MS} s: ${duoiNhatKy(nhatKy)}`,
			);
		}
		await tre(PHIEN_SOAN.cho.nhipMs);
	}
}

export function trongPhienSoan() {
	return (
		process.env[PHIEN_SOAN.coTrongPhien] === "1" &&
		laKhoDo() &&
		Boolean(process.env[TRO_LY_OKR_SOAN.env.biMat]?.trim()) &&
		Boolean(process.env[PHIEN_SOAN.bienCong])
	);
}

function tenCaySoan() {
	const top = spawnSync("git", ["rev-parse", "--show-toplevel"], {
		cwd: GOC,
		encoding: "utf8",
	});
	const ten = top.status === 0 ? top.stdout.trim().split("/").pop() : "crm";
	return `${ten}-${PHIEN_SOAN.hauToCay}`;
}

export async function chayTrongPhienSoan(lenh) {
	const cong = await congTuDo();
	const env = {
		...process.env,
		[TRO_LY_OKR_SOAN.env.biMat]: randomBytes(24).toString("hex"),
		[TRO_LY_OKR_SOAN.env.url]: `http://127.0.0.1:${cong}`,
		[PHIEN_SOAN.bienCong]: String(cong),
		[PHIEN_SOAN.coTrongPhien]: "1",
		[TRO_LY_OKR_SOAN.env.tenCay]: tenCaySoan(),
		NGUOI: process.env.NGUOI ?? PHIEN_DO.nguoi,
	};
	delete env.PHIEN_DO;
	delete env.APP_URL;
	delete env.API_URL;
	if (laKhoDo(env.DATABASE_URL ?? "")) {
		const u = new URL(env.DATABASE_URL);
		u.pathname = "/postgres";
		env.DATABASE_URL = u.toString();
	}
	console.log(
		`-- phien do co agent-okr: cay ${env[TRO_LY_OKR_SOAN.env.tenCay]} · agent-okr cong ${cong}`,
	);
	const con = spawn(
		"bun",
		[join(GOC, "scripts/lan-do/phien-do.mjs"), "--chay", lenh],
		{ cwd: GOC, stdio: "inherit", env },
	);
	for (const tin of Object.keys(PHIEN_SOAN.maNgat))
		process.on(tin, () => con.kill(tin));
	return new Promise((xong) => {
		con.on("error", () => xong(2));
		con.on("exit", (m, tin) => xong(m ?? PHIEN_SOAN.maNgat[tin] ?? 2));
	});
}
