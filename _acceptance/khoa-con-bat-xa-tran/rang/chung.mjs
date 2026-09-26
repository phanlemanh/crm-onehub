import { spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SLUG = "khoa-con-bat-xa-tran";
export const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const API = join(GOC, "apps/api");
export const THU_MUC_TEST = join(API, "test");
export const SPEC = join(THU_MUC_TEST, "go-la-cat-quyen.spec.ts");
export const CHO_CHAY = join(GOC, ".acceptance-runs", SLUG);
export const KHOA_ENV_CI = [
	"ALLOWED_SIGN_IN",
	"GOOGLE_CLIENT_ID",
	"GOOGLE_CLIENT_SECRET",
	"API_URL",
	"APP_URL",
];
const DB_CHUNG = "crm_test";
const CHO_KHOA_MS = 30 * 60_000;
const NHIP_KHOA_MS = 500;

export function hong(ma, dong) {
	console.error(`${SLUG}: ${dong}`);
	process.exit(ma);
}

export function dbCuaLuot() {
	const url = process.env.TEST_DATABASE_URL;
	if (!url)
		hong(2, 'TEST_DATABASE_URL vang — chay qua `bun run test -- "..."`');
	const ten = new URL(url).pathname.replace(/^\//, "");
	if (ten === DB_CHUNG || !ten.endsWith("_test")) {
		hong(2, `co so du lieu ${ten} khong phai co so du lieu rieng cua luot`);
	}
	console.log(`co so du lieu cua luot: ${ten}`);
	return ten;
}

function conSong(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

export async function giuKhoa() {
	const khoa = join(CHO_CHAY, "lan.khoa");
	mkdirSync(CHO_CHAY, { recursive: true });
	const batDau = Date.now();
	for (;;) {
		try {
			mkdirSync(khoa);
			writeFileSync(join(khoa, "pid"), String(process.pid));
			break;
		} catch {
			const pid = Number(readFileSync(join(khoa, "pid"), "utf8").trim() || 0);
			if (pid && !conSong(pid)) {
				rmSync(khoa, { recursive: true, force: true });
				console.log(`don khoa sot cua tien trinh ${pid}`);
				continue;
			}
			if (Date.now() - batDau > CHO_KHOA_MS) {
				hong(
					2,
					`cho khoa ${khoa} qua ${CHO_KHOA_MS / 60_000} phut (pid ${pid})`,
				);
			}
			await Bun.sleep(NHIP_KHOA_MS);
		}
	}
	const nha = () => {
		const pid = Number(
			existsSync(join(khoa, "pid"))
				? readFileSync(join(khoa, "pid"), "utf8").trim()
				: 0,
		);
		if (pid === process.pid) rmSync(khoa, { recursive: true, force: true });
	};
	process.on("exit", nha);
	for (const tin of ["SIGINT", "SIGTERM"]) {
		process.on(tin, () => {
			nha();
			process.exit(130);
		});
	}
}

export function envCi() {
	const yml = readFileSync(join(GOC, ".github/workflows/ci.yml"), "utf8");
	const env = {};
	for (const khoa of KHOA_ENV_CI) {
		const m = yml.match(new RegExp(`^\\s+${khoa}:\\s*(\\S.*)$`, "m"));
		if (!m) hong(2, `ci.yml khong khai ${khoa}`);
		env[khoa] = m[1].trim();
	}
	return env;
}

export function banSaoCuaSha(sha) {
	const ra = spawnSync(
		"git",
		["show", `${sha}:apps/api/test/go-la-cat-quyen.spec.ts`],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (ra.status !== 0) hong(2, `git show ${sha} loi: ${ra.stderr.trim()}`);
	return ra.stdout;
}

const banSaoDaDung = [];

process.on("exit", () => {
	for (const d of banSaoDaDung) rmSync(d, { recursive: true, force: true });
});

export function dungBanSao(noiDung, ten) {
	const thuMuc = join(CHO_CHAY, `sao-${process.pid}-${ten}`);
	rmSync(thuMuc, { recursive: true, force: true });
	mkdirSync(thuMuc, { recursive: true });
	banSaoDaDung.push(thuMuc);
	symlinkSync(join(API, "node_modules"), join(thuMuc, "node_modules"));
	const viet = noiDung
		.replace(
			/from "(\.{1,2}\/[^"]+)"/g,
			(_, rel) => `from ${JSON.stringify(normalize(join(THU_MUC_TEST, rel)))}`,
		)
		.replaceAll("import.meta.dir", JSON.stringify(THU_MUC_TEST));
	const tep = join(thuMuc, "go-la-cat-quyen.spec.ts");
	writeFileSync(tep, viet);
	return tep;
}

export function chayBunTest(tep, thamSo) {
	return new Promise((xong) => {
		const con = spawn(
			"bun",
			["test", "--preload", "./test/setup.ts", ...thamSo, tep],
			{
				cwd: API,
				env: { ...process.env, ...envCi(), CRM_TELEMETRY_DISABLED: "1" },
				stdio: ["ignore", "pipe", "pipe"],
			},
		);
		let ra = "";
		con.stdout.on("data", (b) => {
			ra += b;
		});
		con.stderr.on("data", (b) => {
			ra += b;
		});
		con.on("close", (ma) => xong({ ma: ma ?? 1, ra }));
	});
}

function boQuaChuoi(src, i) {
	const q = src[i];
	let j = i + 1;
	while (j < src.length && src[j] !== q) {
		if (src[j] === "\\") j += 1;
		j += 1;
	}
	return j + 1;
}

function boQuaMau(src, i) {
	let j = i + 1;
	while (j < src.length && src[j] !== "`") {
		if (src[j] === "\\") {
			j += 2;
			continue;
		}
		if (src[j] === "$" && src[j + 1] === "{") {
			j = quetNgoac(src, j + 1, "{", "}").ket + 1;
			continue;
		}
		j += 1;
	}
	return j + 1;
}

function quetNgoac(src, mo, kyMo, kyDong) {
	const doiSo = [];
	let sau = 0;
	let dauDoiSo = mo + 1;
	let i = mo;
	while (i < src.length) {
		const c = src[i];
		if (c === '"' || c === "'") {
			i = boQuaChuoi(src, i);
			continue;
		}
		if (c === "`") {
			i = boQuaMau(src, i);
			continue;
		}
		if (c === "(" || c === "[" || c === "{") sau += 1;
		if (c === ")" || c === "]" || c === "}") {
			sau -= 1;
			if (sau === 0) {
				if (c !== kyDong) hong(2, `ngoac lech o vi tri ${i}`);
				const cuoi = src.slice(dauDoiSo, i).trim();
				if (cuoi) doiSo.push(cuoi);
				return { ket: i, doiSo };
			}
		}
		if (c === "," && sau === 1 && kyMo === "(") {
			doiSo.push(src.slice(dauDoiSo, i).trim());
			dauDoiSo = i + 1;
		}
		i += 1;
	}
	hong(2, `khong dong ngoac mo o vi tri ${mo}`);
}

export function quetLoiGoi(src, tenHam) {
	const re = new RegExp(`(^|[^\\w.])${tenHam}\\(`, "g");
	const ra = [];
	for (const m of src.matchAll(re)) {
		const mo = m.index + m[0].length - 1;
		const { ket, doiSo } = quetNgoac(src, mo, "(", ")");
		ra.push({ dau: mo, ket, doiSo });
	}
	return ra;
}

export function loiGoiTest(src) {
	return quetLoiGoi(src, "test").map((g) => {
		const ten = JSON.parse(g.doiSo[0] ?? '""').split(":")[0];
		return { ...g, ten };
	});
}

export function apDotBien(noiDung, dotBien) {
	const so = noiDung.split(dotBien.tim).length - 1;
	if (so !== 1) {
		hong(
			2,
			`dot bien ${dotBien.ten}: chuoi dich xuat hien ${so} lan, can dung 1`,
		);
	}
	return noiDung.replace(dotBien.tim, dotBien.thay);
}

const MA_MAU = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

export function khopLoi(ra, thongDiep) {
	return ra
		.replace(MA_MAU, "")
		.split("\n")
		.some((dong) => dong.trimEnd() === `error: ${thongDiep}`);
}
