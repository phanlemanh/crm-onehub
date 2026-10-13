import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { sinhCaQuy4 } from "./okr-mau/ca-quy-4";
import { LoiBoMau, OKR_MAU } from "./okr-mau/cau-hinh";
import { docBoOkrMau } from "./okr-mau/khuon";

const Q = OKR_MAU.caQuy4;
const DIR = join(import.meta.dir, "okr-mau");

function giaTriCo(args: string[], co: string): string | undefined {
	const i = args.indexOf(co);
	return i === -1 ? undefined : args[i + 1];
}

function docThamSo(args: string[]) {
	const hopLe = Object.values(Q.co) as string[];
	const la = args.filter(
		(a, i) =>
			a.startsWith("--") &&
			!hopLe.includes(a) &&
			!hopLe.includes(args[i - 1] ?? ""),
	);
	if (la.length)
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Cờ không nhận ra: ${la.join(", ")}. Cờ hợp lệ: ${hopLe.join(", ")}.`,
		);
	for (const co of hopLe)
		if (args.includes(co) && !giaTriCo(args, co))
			throw new LoiBoMau(OKR_MAU.ma.sai, `${co} cần một đường dẫn.`);
	return {
		nhan: giaTriCo(args, Q.co.nhan) ?? join(DIR, Q.tepNhan),
		ra:
			giaTriCo(args, Q.co.ra) ??
			join(import.meta.dir, "..", "..", ...Q.thuMucRa),
	};
}

function docJson(tep: string, ten: string): string {
	try {
		return readFileSync(tep, "utf8");
	} catch (loi) {
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Không đọc được ${ten} ${tep}: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
}

function docNhanTho(tep: string): unknown {
	const chu = docJson(tep, "tệp nhãn");
	try {
		return JSON.parse(chu);
	} catch (loi) {
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Tệp nhãn ${tep} không phải JSON: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
}

function chay(args: string[]): number {
	const ts = docThamSo(args);
	const tepBo = join(DIR, Q.tepCongTy);
	let bo: ReturnType<typeof docBoOkrMau>;
	try {
		bo = docBoOkrMau(docJson(tepBo, "tệp bộ mẫu"));
	} catch (loi) {
		if (loi instanceof LoiBoMau) throw loi;
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Tệp bộ mẫu ${tepBo} sai:\n${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
	const ca = sinhCaQuy4(bo, docNhanTho(ts.nhan));
	mkdirSync(ts.ra, { recursive: true });
	const moi = new Set(ca.map((c) => `${c.id}.json`));
	for (const tep of readdirSync(ts.ra))
		if (tep.endsWith(".json") && !moi.has(tep)) rmSync(join(ts.ra, tep));
	for (const c of ca)
		writeFileSync(
			join(ts.ra, `${c.id}.json`),
			`${JSON.stringify(c, null, "\t")}\n`,
		);
	console.log(`okr:ca-quy-4: ${ca.length} ca → ${ts.ra}`);
	return 0;
}

try {
	process.exit(chay(process.argv.slice(2)));
} catch (loi) {
	if (loi instanceof LoiBoMau) {
		console.error(loi.message);
		process.exit(loi.ma);
	}
	console.error(loi instanceof Error ? (loi.stack ?? loi.message) : String(loi));
	process.exit(1);
}
