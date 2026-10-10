import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { z } = createRequire(path.join(ROOT, "packages/validation/package.json"))("zod");
const GOC_QUET = ["apps/api/src", "apps/app/app", "apps/app/lib", "packages/validation/src"];
const KHAI = "packages/validation/src/okr-tro-ly.ts";
const MIEN = ["apps/api/src/okr/tro-ly.service.ts", "apps/app/lib/messages/okr-gop-y.ts"];
const KHOA = "satisfies Record<LyDoKhongQuyet";

const argv = process.argv.slice(2);
const banSao = argv[argv.indexOf("--ban-sao") + 1];
const them = argv.includes("--ban-sao") && banSao === "them-tap";
const ngoaiBang = argv.includes("--ban-sao") && banSao === "ngoai-bang";

function* tep(goc) {
	for (const muc of fs.readdirSync(goc, { withFileTypes: true })) {
		const p = path.join(goc, muc.name);
		if (muc.isDirectory()) {
			if (muc.name !== "node_modules") yield* tep(p);
		} else if (/\.(ts|tsx)$/.test(muc.name)) yield p;
	}
}

const { LY_DO_KHONG_QUYET } = await import(path.join(ROOT, KHAI));
const loi = [];
const mot = (cau) => loi.push(cau);

const danhSach = [];
for (const g of GOC_QUET) {
	const ds = [...tep(path.join(ROOT, g))];
	if (ds.length === 0) mot(`goc rong: ${g}`);
	danhSach.push(...ds);
}
if (them) danhSach.push(path.join(ROOT, "apps/app/lib/__ban-sao-them-tap__.ts"));

function khoiKhoa(noi) {
	const dong = noi.split("\n");
	const ra = [];
	for (let i = 0; i < dong.length; i++) {
		const vt = dong[i].indexOf(KHOA);
		if (vt < 0) continue;
		let sau = 0;
		let j = i;
		for (; j >= 0; j--) {
			const doan = j === i ? dong[j].slice(0, vt) : dong[j];
			sau += (doan.match(/\}/g) ?? []).length - (doan.match(/\{/g) ?? []).length;
			if (sau <= 0 && j < i) break;
		}
		ra.push([j, i]);
	}
	return ra;
}

const choKhai = new Set();
for (const p of danhSach) {
	const rel = path.relative(ROOT, p);
	const noi = them && rel.endsWith("__ban-sao-them-tap__.ts")
		? `export const X = ["${LY_DO_KHONG_QUYET[0]}"] as const;`
		: ngoaiBang && rel === MIEN[0]
			? `${fs.readFileSync(p, "utf8")}\nexport const lech = () => "${LY_DO_KHONG_QUYET.at(-1)}";\n`
			: fs.readFileSync(p, "utf8");
	const co = LY_DO_KHONG_QUYET.filter((ma) => noi.includes(`"${ma}"`));
	if (co.length === 0) continue;
	if (rel === KHAI) {
		choKhai.add(rel);
		continue;
	}
	if (MIEN.includes(rel)) {
		const khoi = khoiKhoa(noi);
		if (khoi.length === 0) mot(`mien ma khong khoa: ${rel}`);
		noi.split("\n").forEach((d, i) => {
			if (!LY_DO_KHONG_QUYET.some((ma) => d.includes(`"${ma}"`))) return;
			if (!khoi.some(([a, b]) => i >= a && i <= b)) mot(`ma ngoai bang: ${rel}:${i + 1}`);
		});
		continue;
	}
	mot(`ma khai them: ${rel}`);
}

const { CAU_CUA_LY_DO_KHONG_QUYET } = await import(path.join(ROOT, "apps/api/src/okr/tro-ly.service.ts"));
for (const ma of LY_DO_KHONG_QUYET) {
	const cau = z.array(z.unknown()).min(1).safeParse(CAU_CUA_LY_DO_KHONG_QUYET[ma]);
	if (!cau.success) mot(`thieu anh xa: ${ma}`);
	else if (!z.array(z.string()).safeParse(cau.data).success) mot(`hang khong phai chuoi: ${ma}`);
}

const { okrGopYMessages } = await import(path.join(ROOT, "apps/app/lib/messages/okr-gop-y.ts"));
for (const locale of ["vi", "en"]) {
	const khoa = Object.keys(okrGopYMessages(locale).loiQuyet ?? {}).sort();
	if (JSON.stringify(khoa) !== JSON.stringify([...LY_DO_KHONG_QUYET].sort()))
		mot(`ban do ${locale} lech tap: ${khoa.join(",")}`);
}

if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log(`mot-nguon: ${LY_DO_KHONG_QUYET.length} ma, ${choKhai.size} cho khai, anh xa du, hai ban do du`);
