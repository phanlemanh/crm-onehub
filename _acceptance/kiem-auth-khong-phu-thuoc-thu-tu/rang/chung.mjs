import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	cpSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
export const AUTH = join(ROOT, "packages/auth");
export const RA = join(
	ROOT,
	".acceptance-runs/kiem-auth-khong-phu-thuoc-thu-tu",
);

export const KAT = {
	goc: "b812b65a46131fa40fecd7cf9f4baaaf527b40c2",
	seed: { tran: 20, can: 2 },
	khoaCi: [
		"ALLOWED_SIGN_IN",
		"BETTER_AUTH_SECRET",
		"API_URL",
		"APP_URL",
		"GOOGLE_CLIENT_ID",
		"GOOGLE_CLIENT_SECRET",
	],
	tepDoiEnv: [
		"cau-tu-choi.spec.ts",
		"cong-vao.integration.spec.ts",
		"hosted-domain.spec.ts",
		"tu-choi-khong-de-lai-hang.integration.spec.ts",
	],
	tepChia: "chia-mat-khau.integration.spec.ts",
	tepMoi: "test/hd-cua-google.spec.ts",
	nhomGoogle: "cua-google-con-song",
	haiCa: [
		"nguoi trong danh sach duoc vao dang nhap that bang google thi tao duoc phien",
		"co ca hai cua thi van la mot hang nguoi dung, va phien vao duoc",
	],
	logHd: 'does not satisfy the configured "hd" option "example.com"',
	mocHd: "if (hostedDomain) google.hd = hostedDomain;",
	caOnemount: '(fail) hd cua google theo danh sach "onemount.com"',
	loiNap: "khong nap duoc auth voi danh sach",
	locHdLech: "hd lech",
	caHdLech:
		"(fail) cua-google-con-song > cua google tu choi token co hd lech voi hd da khoa, du nguoi trong danh sach",
};

export class Dung extends Error {
	constructor(ma, thongDiep) {
		super(thongDiep);
		this.ma = ma;
	}
}

export function dung(ma, thongDiep) {
	throw new Dung(ma, thongDiep);
}

export function git(thamSo) {
	return execFileSync("git", ["-C", ROOT, ...thamSo], {
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
}

export const GOC = git(["rev-parse", process.env.KAT_GOC ?? KAT.goc]).trim();

export function envCi() {
	const yml = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
	const env = {};
	for (const khoa of KAT.khoaCi) {
		const m = yml.match(new RegExp(`^\\s+${khoa}:\\s*(\\S+)\\s*$`, "m"));
		if (!m) dung(2, `TIEN DE: ci.yml khong con khoa ${khoa} trong khoi env`);
		env[khoa] = m[1];
	}
	return env;
}

export function saoChep(ban) {
	const sao = join(RA, `sao-${ban}-${randomBytes(4).toString("hex")}`);
	mkdirSync(sao, { recursive: true });
	symlinkSync(join(AUTH, "node_modules"), join(sao, "node_modules"));
	for (const muc of ["bunfig.toml", "package.json", "tsconfig.json", "src"])
		cpSync(join(AUTH, muc), join(sao, muc), { recursive: true });
	if (ban === "sua") {
		cpSync(join(AUTH, "test"), join(sao, "test"), { recursive: true });
		return sao;
	}
	for (const tep of git([
		"ls-tree",
		"-r",
		"--name-only",
		GOC,
		"packages/auth/test",
	])
		.trim()
		.split("\n")) {
		const dich = join(sao, tep.slice("packages/auth/".length));
		mkdirSync(dirname(dich), { recursive: true });
		writeFileSync(dich, git(["show", `${GOC}:${tep}`]));
	}
	return sao;
}

export function donSao(sao) {
	rmSync(sao, { recursive: true, force: true });
}

export function chayBun(noi, thamSo, envThem = {}) {
	const ket = spawnSync("bun", thamSo, {
		cwd: noi,
		env: { ...process.env, ...envCi(), ...envThem },
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
	return { ma: ket.status, ra: `${ket.stdout}${ket.stderr}` };
}

const XML = {
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&apos;": "'",
	"&amp;": "&",
};

function moXml(s) {
	return s.replace(/&(lt|gt|quot|apos|amp);/g, (m) => XML[m]);
}

function thuocTinh(chuoi, ten) {
	const m = chuoi.match(new RegExp(`\\b${ten}="([^"]*)"`));
	return m ? moXml(m[1]) : "";
}

export function junit(noi, thamSo, envThem = {}) {
	mkdirSync(RA, { recursive: true });
	const duong = join(RA, `junit-${randomBytes(4).toString("hex")}.xml`);
	const chay = chayBun(
		noi,
		["test", ...thamSo, "--reporter=junit", `--reporter-outfile=${duong}`],
		envThem,
	);
	const xml = readFileSync(duong, "utf8");
	const goc = xml.match(/<testsuites [^>]*>/)?.[0] ?? "";
	return {
		...chay,
		tong: Number(thuocTinh(goc, "tests")),
		hong: Number(thuocTinh(goc, "failures")),
		bo: Number(thuocTinh(goc, "skipped")),
		thuTu: [...xml.matchAll(/<testsuite name="test\/([^"]+)" file=/g)].map(
			(m) => m[1],
		),
		ca: [
			...xml.matchAll(/<testcase ([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g),
		].map((m) => ({
			ten: thuocTinh(m[1], "name"),
			nhom: thuocTinh(m[1], "classname"),
			tep: thuocTinh(m[1], "file"),
			hong: /<failure/.test(m[3] ?? ""),
			bo: /<skipped/.test(m[3] ?? ""),
		})),
	};
}

export function haiCaGoogle(ket) {
	return ket.ca.filter(
		(c) => c.nhom === KAT.nhomGoogle && KAT.haiCa.includes(c.ten),
	);
}
