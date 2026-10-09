import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

export const GOC = resolve(import.meta.dirname, "..", "..", "..");
export const THUOC = resolve(GOC, "_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs");
export const DONG_SO = [
	"luot ci.yml",
	"vao mau",
	"khong gan duoc",
	"base khac",
	"dang chay",
	"luot xanh",
	"khong mang hinh ma tran",
	"dung vi tran",
	"bi de",
	"dung tay",
	"dung khi chua chay",
];

export function tachDong(stdout) {
	const ra = new Map();
	for (const d of stdout.split("\n")) {
		const m = /^([a-z][a-z .]*): (.*)$/.exec(d);
		if (m) ra.set(m[1], m[2]);
	}
	return ra;
}

export function chayThuoc(runtime, thamSo, { tep = THUOC, env = process.env } = {}) {
	const r = spawnSync(runtime, [tep, ...thamSo], {
		cwd: GOC,
		encoding: "utf8",
		env,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", dong: tachDong(r.stdout ?? "") };
}

export function bang(v) {
	const f = (thuc) => thuc === String(v);
	Object.defineProperty(f, "name", { value: String(v) });
	return f;
}

export function soSanh(dong, mong) {
	const lech = [];
	for (const [k, dieuKien] of Object.entries(mong)) {
		const thuc = dong.get(k);
		if (!dieuKien(thuc)) lech.push(`${k}: thuoc in «${thuc}», mong «${dieuKien.name}»`);
	}
	return lech;
}

export function soHaiRuntime(a, b, khoa = DONG_SO) {
	return khoa.filter((k) => a.dong.get(k) !== b.dong.get(k)).map((k) => `${k}: node «${a.dong.get(k)}» bun «${b.dong.get(k)}»`);
}

export function tuKiemSoSanh(dong, mong, khoa) {
	const hong = new Map(dong);
	hong.set(khoa, `${dong.get(khoa)}9`);
	const lech = soSanh(hong, mong);
	if (!lech.some((l) => l.startsWith(`${khoa}:`))) {
		console.error(`thuoc so sanh hong: doi dong «${khoa}» ma khong bat`);
		process.exit(1);
	}
}

export function ketThuc(ten, loi) {
	if (loi.length > 0) {
		console.error(`${ten}: DO\n${loi.map((l) => `  - ${l}`).join("\n")}`);
		process.exit(1);
	}
	console.log(`${ten}: XANH`);
}
