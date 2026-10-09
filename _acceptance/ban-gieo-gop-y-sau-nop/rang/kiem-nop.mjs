import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const tep = resolve(
	GOC,
	process.env.BAN_GIEO ?? "_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs",
);
if (!existsSync(tep)) {
	console.log(`KHONG DO DUOC: khong co ban gieo ${tep}`);
	process.exit(2);
}
const { kiemNopXong } = await import(pathToFileURL(tep).href);
if (typeof kiemNopXong !== "function") {
	console.log("KHONG DO DUOC: ban gieo khong xuat kiemNopXong");
	process.exit(2);
}
const XONG = TRO_LY_OKR.ketThuc.daNop;
const luc = new Date("2026-10-09T15:00:00Z");
const CA = [
	{
		ten: "qua",
		kq: { ketQua: "da-ghi", lyDo: "" },
		viec: { id: "t1", finishedAt: luc, outcome: XONG },
		nem: null,
	},
	{
		ten: "tu-choi",
		kq: { ketQua: "tu-choi", lyDo: "task is not running" },
		viec: { id: "t2", finishedAt: luc, outcome: XONG },
		nem: ["tu-choi"],
	},
	{
		ten: "chua-dong",
		kq: { ketQua: "da-ghi", lyDo: "" },
		viec: { id: "t3", finishedAt: null, outcome: null },
		nem: ["khong dong bang da-nop"],
	},
	{
		ten: "loi",
		kq: { ketQua: "da-ghi", lyDo: "" },
		viec: { id: "t4", finishedAt: luc, outcome: "loi" },
		nem: ["khong dong bang da-nop", "(loi)"],
	},
];
let dung = 0;
for (const ca of CA) {
	let loi = null;
	try {
		kiemNopXong(ca.kq, ca.viec);
	} catch (e) {
		loi = e instanceof Error ? e.message : String(e);
	}
	if (ca.nem === null) {
		if (loi === null) dung++;
		else console.log(`ca ${ca.ten}: nem sai: ${loi}`);
		continue;
	}
	if (loi === null) console.log(`ca ${ca.ten}: khong nem`);
	else if (!ca.nem.every((m) => loi.includes(m)))
		console.log(`ca ${ca.ten}: nem sai: ${loi}`);
	else dung++;
}
if (CA.length !== 4) {
	console.log(`KHONG DO DUOC: ma tran ${CA.length} ca, mong 4`);
	process.exit(2);
}
console.log(`kiem-nop: ${dung}/${CA.length} ca dung`);
process.exit(dung === CA.length ? 0 : 1);
