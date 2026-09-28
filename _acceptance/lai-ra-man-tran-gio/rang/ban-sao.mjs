import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { LUOT } from "../../chan-lai-component-ra-man/rang/luot-chay.mjs";
import { CAU_HINH } from "./cau-hinh.mjs";
import { doiThamSoBa } from "./cay.mjs";

export const GOC = join(import.meta.dirname, "..", "..", "..");
const UI = join(GOC, "packages", "ui");
const THU_MUC_TEST = join(UI, "test");

export class MocVang extends Error {}

export function docSpec() {
	return readFileSync(join(GOC, CAU_HINH.spec), "utf8");
}

export function thayDungSoLan(src, cu, moi, n) {
	const manh = src.split(cu);
	if (manh.length - 1 !== n)
		throw new MocVang(
			`moc ${JSON.stringify(cu)} xuat hien ${manh.length - 1} lan, can ${n}`,
		);
	return manh.join(moi);
}

export function doiDich(src, thuMuc) {
	return thayDungSoLan(
		src,
		"LUOT_CHAY.duongLuot(ten)",
		`join(${JSON.stringify(thuMuc)}, ten)`,
		1,
	);
}

export function epTranCa(src, tenCa, ms) {
	const ra = doiThamSoBa(src, tenCa, String(ms));
	if (ra === null)
		throw new MocVang(`tham so tran cua ca "${tenCa}" khong tim thay`);
	return ra;
}

function docJunit(xml) {
	const ra = new Map();
	for (const m of xml.matchAll(
		/<testcase name="([^"]*)"[^>]*?(?:\/>|>([\s\S]*?)<\/testcase>)/g,
	)) {
		const loai = /<failure type="([^"]*)"/.exec(m[2] ?? "")?.[1] ?? null;
		const coLoi = /<(failure|error)\b/.test(m[2] ?? "");
		ra.set(m[1], { xanh: !coLoi, loai });
	}
	return ra;
}

export function chayBanSao(src, nhan, thuMuc) {
	mkdirSync(thuMuc, { recursive: true });
	const ten = `lai-ra-man.${nhan}-${process.pid}.tsx`;
	const tep = join(THU_MUC_TEST, ten);
	const xml = join(thuMuc, "ket-qua.xml");
	rmSync(xml, { force: true });
	writeFileSync(tep, src);
	try {
		const kq = spawnSync(
			"bun",
			[
				"test",
				"--preload",
				"./test/setup-dom.ts",
				"--reporter=junit",
				`--reporter-outfile=${xml}`,
				`./test/${ten}`,
			],
			{ cwd: UI, encoding: "utf8", timeout: CAU_HINH.tranLuotMs },
		);
		if (!existsSync(xml))
			throw new MocVang(
				`luot ${nhan} khong ghi junit (ma ${kq.status}): ${String(kq.stderr).slice(-400)}`,
			);
		return docJunit(readFileSync(xml, "utf8"));
	} finally {
		rmSync(tep, { force: true });
	}
}

export function ketCa(kq, tenCa) {
	const k = kq.get(tenCa);
	if (!k) throw new MocVang(`ca "${tenCa}" khong co trong junit`);
	return k;
}

export function chup() {
	const tep = readdirSync(THU_MUC_TEST, { recursive: true }).map(String).sort();
	const sha = {};
	for (const t of CAU_HINH.taoPhamHoSoKy) {
		const p = join(LUOT, t);
		sha[t] = existsSync(p)
			? createHash("sha256").update(readFileSync(p)).digest("hex")
			: "vang";
	}
	return { tep, sha };
}

export function soChup(truoc, sau) {
	const loi = [];
	const them = sau.tep.filter((t) => !truoc.tep.includes(t));
	const mat = truoc.tep.filter((t) => !sau.tep.includes(t));
	if (them.length > 0)
		loi.push(
			`KHONG DO DUOC: tep thua trong packages/ui/test: ${them.join(", ")}`,
		);
	if (mat.length > 0)
		loi.push(
			`KHONG DO DUOC: tep mat trong packages/ui/test: ${mat.join(", ")}`,
		);
	for (const t of Object.keys(truoc.sha))
		if (truoc.sha[t] !== sau.sha[t])
			loi.push(`KHONG DO DUOC: tao pham ho so da ky bi ghi: ${t}`);
	return loi;
}

export function ketThuc(ma, dong) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}
