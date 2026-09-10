import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	readlinkSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RANG = dirname(fileURLToPath(import.meta.url));
export const GOC = resolve(RANG, "..", "..", "..");

export const DUONG_DISPATCH = "apps/agent/agent/lib/custom-agent-dispatch.ts";
export const DUONG_SPEC = "apps/agent/test/quyen-luot.spec.ts";

const git = (args, cwd = GOC, them) => {
	const chon = { cwd, encoding: "utf8" };
	if (them) chon.env = { ...process.env, ...them };
	return execFileSync("git", args, chon).trim();
};

const GIT_RIENG = resolve(
	GOC,
	execFileSync("git", ["rev-parse", "--git-dir"], {
		cwd: GOC,
		encoding: "utf8",
	}).trim(),
);

const GIT_CHUNG = resolve(
	GOC,
	execFileSync("git", ["rev-parse", "--git-common-dir"], {
		cwd: GOC,
		encoding: "utf8",
	}).trim(),
);
const KHOA = join(GIT_CHUNG, "dq-cay-sao.khoa");

function giuKhoa(viec) {
	const han = Date.now() + 120_000;
	for (;;) {
		try {
			mkdirSync(KHOA);
			break;
		} catch (loi) {
			if (loi.code !== "EEXIST") throw loi;
			if (Date.now() > han) {
				rmSync(KHOA, { recursive: true, force: true });
				continue;
			}
			execFileSync("sleep", ["0.2"]);
		}
	}
	try {
		return viec();
	} finally {
		rmSync(KHOA, { recursive: true, force: true });
	}
}

export const MA_VI_PHAM = 2;
export const MA_GIAN_HONG = 3;

export class RangLoi extends Error {
	constructor(chu, ma = MA_VI_PHAM) {
		super(chu);
		this.name = "RangLoi";
		this.ma = ma;
	}
}

export function hong(chu, ma = MA_VI_PHAM) {
	throw new RangLoi(chu, ma);
}

export function hongGian(chu) {
	throw new RangLoi(`GIAN DO HONG — ${chu}`, MA_GIAN_HONG);
}

export function chayRang(fn) {
	try {
		fn();
	} catch (loi) {
		if (loi instanceof RangLoi) {
			process.stderr.write(`${loi.message}\n`);
			process.exitCode = loi.ma;
			return;
		}
		process.stderr.write(
			`GIAN DO HONG — ngoai le chua bat trong rang:\n${loi && loi.stack ? loi.stack : String(loi)}\n`,
		);
		process.exitCode = MA_GIAN_HONG;
	}
}

function trangThaiDangXet() {
	const chiMuc = join(
		process.env.TMPDIR ?? "/tmp",
		`dq-chi-muc-${process.pid}-${Math.random().toString(36).slice(2, 8)}`,
	);
	const goc = join(GIT_RIENG, "index");
	if (existsSync(goc)) cpSync(goc, chiMuc);
	try {
		const tam = git(["stash", "create"], GOC, { GIT_INDEX_FILE: chiMuc });
		return tam || git(["rev-parse", "HEAD"]);
	} finally {
		rmSync(chiMuc, { force: true });
	}
}

function cacNodeModules() {
	const ra = [];
	if (existsSync(join(GOC, "node_modules"))) ra.push("node_modules");
	for (const nhom of ["apps", "packages"]) {
		const goc = join(GOC, nhom);
		if (!existsSync(goc)) continue;
		for (const muc of readdirSync(goc, { withFileTypes: true })) {
			if (!muc.isDirectory()) continue;
			const duong = `${nhom}/${muc.name}/node_modules`;
			if (existsSync(join(GOC, duong))) ra.push(duong);
		}
	}
	return ra;
}

function cacSinhRa() {
	const ra = [];
	for (const nhom of ["apps", "packages"]) {
		const goc = join(GOC, nhom);
		if (!existsSync(goc)) continue;
		for (const muc of readdirSync(goc, { withFileTypes: true })) {
			if (!muc.isDirectory()) continue;
			const duong = `${nhom}/${muc.name}/src/generated`;
			if (existsSync(join(GOC, duong))) ra.push(duong);
		}
	}
	return ra;
}

function noiNodeModules(sao, duong) {
	const nguon = join(GOC, duong);
	const dich = join(sao, duong);
	if (existsSync(dich)) return;
	const scope = join(nguon, "@crm");
	if (!existsSync(scope)) {
		mkdirSync(dirname(dich), { recursive: true });
		symlinkSync(nguon, dich);
		return;
	}
	mkdirSync(dich, { recursive: true });
	for (const ten of readdirSync(nguon)) {
		if (ten === "@crm") continue;
		symlinkSync(join(nguon, ten), join(dich, ten));
	}
	const dichScope = join(dich, "@crm");
	mkdirSync(dichScope, { recursive: true });
	for (const goi of readdirSync(scope)) {
		const dinh = resolve(scope, readlinkSync(join(scope, goi)));
		if (!dinh.startsWith(`${GOC}/`)) {
			symlinkSync(dinh, join(dichScope, goi));
			continue;
		}
		symlinkSync(join(sao, relative(GOC, dinh)), join(dichScope, goi));
	}
}

export function dungCaySao() {
	const sha = trangThaiDangXet();
	const sao = join(
		process.env.TMPDIR ?? "/tmp",
		`dq-sao-${process.pid}-${Math.random().toString(36).slice(2, 8)}`,
	);
	rmSync(sao, { recursive: true, force: true });
	giuKhoa(() => git(["worktree", "add", "--detach", "--quiet", sao, sha]));

	const chuaTheoDoi = git(["ls-files", "--others", "--exclude-standard"])
		.split("\n")
		.filter(Boolean);
	for (const duong of chuaTheoDoi) {
		const dich = join(sao, duong);
		mkdirSync(dirname(dich), { recursive: true });
		cpSync(join(GOC, duong), dich, { recursive: true });
	}

	for (const duong of cacNodeModules()) noiNodeModules(sao, duong);

	for (const ten of [...cacSinhRa(), ".env"]) {
		const nguon = join(GOC, ten);
		if (!existsSync(nguon) || existsSync(join(sao, ten))) continue;
		mkdirSync(dirname(join(sao, ten)), { recursive: true });
		symlinkSync(nguon, join(sao, ten));
	}

	const don = () =>
		giuKhoa(() => {
			try {
				git(["worktree", "remove", "--force", sao]);
			} catch {
				rmSync(sao, { recursive: true, force: true });
			}
		});
	return { sao, sha, don };
}

export function voiCaySao(fn) {
	const cay = dungCaySao();
	const bo = () => {
		cay.don();
		process.exit(130);
	};
	const tin = ["SIGINT", "SIGTERM", "SIGHUP"];
	for (const t of tin) process.on(t, bo);
	try {
		return fn(cay);
	} finally {
		for (const t of tin) process.off(t, bo);
		cay.don();
	}
}

export function assertDanhTinh(sao) {
	const nguon = readFileSync(join(sao, DUONG_DISPATCH), "utf8");
	const thieu = [];
	if (/\bbuilderCommandType\b/.test(nguon)) {
		thieu.push("builderCommandType con ton tai");
	}
	if (!/\bbuilderSessionAuthFromRow\b/.test(nguon)) {
		thieu.push("builderSessionAuthFromRow chua co");
	}
	const khoiThamSo = nguon.match(
		/export function builderSessionAttributes\(input:\s*\{([\s\S]*?)\}\s*\)/,
	);
	if (!khoiThamSo) {
		thieu.push("khong doc duoc tham so cua builderSessionAttributes");
	} else if (/\bmessage\s*:/.test(khoiThamSo[1])) {
		thieu.push("builderSessionAttributes con tham so message");
	}
	if (thieu.length > 0) {
		hongGian(
			`cay sao khong chua ma dang xet: ${thieu.join(" · ")}\n  cay sao: ${sao}`,
		);
	}
}

export function chay(cwd, argv, env = {}) {
	const r = spawnSync(argv[0], argv.slice(1), {
		cwd,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
		env: { ...process.env, ...env },
	});
	const chu = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	if (r.error) {
		hongGian(`khong chay duoc ${argv.join(" ")}: ${r.error.message}`);
	}
	if (r.signal) {
		hongGian(`${argv.join(" ")} bi tin hieu ${r.signal} ngat`);
	}
	if (r.status === null) {
		hongGian(`${argv.join(" ")} khong tra ma thoat`);
	}
	return { ma: r.status, chu };
}

export function coCo(ten) {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : process.argv[i + 1];
}
