import { spawn } from "node:child_process";
import { basename, join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { GOC } from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";
import { chayChieuDo, VET } from "./man-soan-chieu-do.mjs";
import {
	e2,
	e4,
	e9,
	e11,
	e13,
	e16,
	e20,
	ketQua,
	moTrinhDuyet,
} from "./man-soan-do.mjs";
import {
	BANG_CHUNG,
	dungDuLieu,
	KARA_GIA,
	MOI_EVAL,
} from "./man-soan-du-lieu.mjs";

const LENH_TRONG_PHIEN =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/che-do-soan-bo-okr/rang/man-soan.mjs"';
const BIEN_PHIEN = [
	"DATABASE_URL",
	"APP_URL",
	"API_URL",
	"PHIEN_DO",
	"NEXT_PUBLIC_API_URL",
];

const chon = (process.env.EVAL ?? "")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean);

const chieuDo = chon.filter((e) => e.startsWith("chieu-do-"));
if (chieuDo.length > 0) {
	if (chieuDo.length !== 1 || chon.length !== 1) {
		console.log(
			`KHONG DO DUOC: EVAL chi nhan mot chieu do moi lan (${Object.keys(VET).join(", ")})`,
		);
		process.exit(2);
	}
	process.exit(await chayChieuDo(chieuDo[0]));
}

const CHON_EVAL = new Set(chon.map((e) => e.toUpperCase()));
const laMa = [...CHON_EVAL].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0) {
	console.log(
		`KHONG DO DUOC: EVAL ${laMa.join(", ")} khong thuoc thuoc nay (nhan ${MOI_EVAL.join(", ")}, ${Object.keys(VET).join(", ")})`,
	);
	process.exit(2);
}

const thieuKara = Object.keys(KARA_GIA).filter((k) => !process.env[k]);
if (thieuKara.length > 0) {
	console.log(
		`man-soan: phien do chua noi Kara (${thieuKara.join(", ")} rong) — chay lai trong mot phien do rieng co cau noi gia toi 127.0.0.1:9`,
	);
	const env = { ...process.env, ...KARA_GIA };
	for (const k of BIEN_PHIEN) delete env[k];
	env.PHIEN_DO_TEN_CAY = `${process.env.PHIEN_DO_TEN_CAY ?? basename(GOC)}-kara`;
	const con = spawn("bash", ["-c", LENH_TRONG_PHIEN], {
		cwd: GOC,
		env,
		stdio: "inherit",
	});
	for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"])
		process.on(tin, () => con.kill(tin));
	const ma = await new Promise((xong) => {
		con.on("error", () => xong(2));
		con.on("exit", (m) => xong(m ?? 2));
	});
	process.exit(ma);
}

const chay = (e) => CHON_EVAL.size === 0 || CHON_EVAL.has(e);

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
	`man-soan: ${CHON_EVAL.size === 0 ? "chay tron" : `chi ${[...CHON_EVAL].join(", ")}`} · an cong cu chi co o may chu dev truoc khi do: nut TanStack Query Devtools, chi bao Next.js`,
);
try {
	const n = await dungDuLieu();
	if (chay("E2")) await e2(n);
	if (chay("E4")) await e4(n);
	if (chay("E13")) await e13(n);
	if (chay("E16")) await e16(n);
	if (chay("E9")) await e9(n);
	if (chay("E11")) await e11(n);
	if (chay("E20")) await e20(n);
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
console.log(
	`anh: ${BANG_CHUNG} (${join(GOC, ".acceptance-runs/che-do-soan-bo-okr/html")})`,
);
const { dung, sai } = ketQua();
console.log(`KET LUAN vk10 man: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
