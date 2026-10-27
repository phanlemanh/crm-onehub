import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { chayChieuDo } from "./man-bo-okr-co-so-chieu-do.mjs";
import {
	e1,
	e6,
	e8,
	e11,
	ketQua,
	moTrinhDuyet,
} from "./man-bo-okr-co-so-do.mjs";
import {
	BANG_CHUNG,
	dungDuLieu,
	MOI_EVAL,
} from "./man-bo-okr-co-so-du-lieu.mjs";

const iChieu = process.argv.indexOf("--chieu-do");
if (iChieu >= 0) {
	const ma = await chayChieuDo(process.argv[iChieu + 1]);
	process.exit(ma);
}

const CHON_EVAL = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const laMa = [...CHON_EVAL].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0) {
	console.log(
		`KHONG DO DUOC: EVAL ${laMa.join(", ")} khong thuoc thuoc nay (nhan ${MOI_EVAL.join(", ")})`,
	);
	process.exit(2);
}
const chay = (...e) => CHON_EVAL.size === 0 || e.some((x) => CHON_EVAL.has(x));

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);
const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

await moTrinhDuyet();

console.log(
	`man-bo-okr-co-so: ${CHON_EVAL.size === 0 ? "chay tron" : `chi ${[...CHON_EVAL].join(", ")}`}`,
);
try {
	const n = await dungDuLieu();
	if (chay("E1")) await e1(n);
	if (chay("E6", "E8")) await e6(n);
	if (chay("E8")) await e8(n);
	if (chay("E11", "E12")) await e11(n);
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
console.log(`anh: ${BANG_CHUNG}`);
const { dung, sai } = ketQua();
console.log(`KET LUAN bco: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
