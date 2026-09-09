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

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

export class RangLoi extends Error {
	constructor(chu, ma = 2) {
		super(chu);
		this.name = "RangLoi";
		this.ma = ma;
	}
}

export function hong(chu, ma = 2) {
	throw new RangLoi(chu, ma);
}

export function chayRang(fn) {
	try {
		fn();
	} catch (loi) {
		if (loi instanceof RangLoi) {
			process.stderr.write(`${loi.message}\n`);
			process.exit(loi.ma);
		}
		throw loi;
	}
}

function trangThaiDangXet() {
	const tam = git(["stash", "create"]);
	return tam || git(["rev-parse", "HEAD"]);
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
	git(["worktree", "add", "--detach", "--quiet", sao, sha]);

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

	const don = () => {
		try {
			git(["worktree", "remove", "--force", sao]);
		} catch {
			rmSync(sao, { recursive: true, force: true });
		}
		try {
			git(["worktree", "prune"]);
		} catch {}
	};
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
		hong(
			`cay sao khong chua ma dang xet: ${thieu.join(" · ")}\n  cay sao: ${sao}`,
		);
	}
}

export function chay(cwd, argv, env = {}) {
	const r = spawnSync(argv[0], argv.slice(1), {
		cwd,
		encoding: "utf8",
		env: { ...process.env, ...env },
	});
	return { ma: r.status, chu: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

export function doiTep(duong, tim, thay) {
	const nguon = readFileSync(duong, "utf8");
	if (!nguon.includes(tim)) {
		hong(`khong tim thay moc de dot bien trong ${duong}:\n  ${tim}`);
	}
	return { nguon, moi: nguon.replace(tim, thay) };
}

export function coCo(ten) {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : process.argv[i + 1];
}
