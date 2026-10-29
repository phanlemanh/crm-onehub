import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { e4, e6 } from "./do-man-dieu-huong.mjs";
import { PHA, tongKet } from "./do-man-lib.mjs";
import { taoNguCanh } from "./do-man-ngu-canh.mjs";
import {
	BANG_CHUNG,
	BANG_CHUNG_HO_SO,
	CHEP_ANH,
	e9e12,
	e10,
	e13,
	e14,
} from "./do-man-thanh-ben.mjs";

const MOI_PHA = ["", "rewrite", "chuoi", "lien-ket", "giu-o", "so", "ky"];
const MOI_EVAL = ["E4", "E6", "E9", "E10", "E12", "E13", "E14"];
const CHON = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);

if (!MOI_PHA.includes(PHA)) {
	console.log(
		`KHONG DO DUOC: VKM_PHA=${PHA} la; chi nhan ${MOI_PHA.filter(Boolean).join(", ")}`,
	);
	process.exit(2);
}
const laMa = [...CHON].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0) {
	console.log(
		`KHONG DO DUOC: EVAL ${laMa.join(", ")} khong thuoc ban do nay (nhan ${MOI_EVAL.join(", ")})`,
	);
	process.exit(2);
}
const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const KHONG_CHAY = new Set(
	createRequire(import.meta.url)(join(GOC, "lib", "eval-yaml.cjs"))
		.parseEvals(
			readFileSync(
				join(GOC, "_acceptance", "vo-khu-muc-tieu", "evals.yaml"),
				"utf8",
			),
			["status"],
		)
		.filter((e) => String(e.status ?? "").trim() === "not-run")
		.map((e) => e.id),
);
const DA_BAO = new Set();
const chayMot = (x) => {
	if (CHON.size > 0) return CHON.has(x);
	if (!KHONG_CHAY.has(x)) return true;
	if (!DA_BAO.has(x)) {
		DA_BAO.add(x);
		console.log(`BO QUA ${x}: khai not-run trong evals.yaml`);
	}
	return false;
};
const chay = (...e) => e.map(chayMot).some(Boolean);

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

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

console.log(
	`do-man VK2: ${CHON.size === 0 ? "chay tron" : `chi ${[...CHON].join(", ")}`}${PHA ? ` · pha-thu ${PHA}` : ""}`,
);

try {
	const n = await taoNguCanh({ canSoan: chay("E6", "E10") });
	if (chay("E4")) await e4(n);
	const ketQua = chay("E6", "E10") ? await e6(n) : new Map();
	if (chay("E10")) await e10(n, ketQua);
	if (chay("E13")) await e13(n);
	if (chay("E14")) await e14(n);
	if (chay("E9", "E12")) await e9e12(n, { e9: chay("E9"), e12: chay("E12") });
} catch (loi) {
	console.log(`KHONG DO DUOC: ban do vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}

console.log(
	CHEP_ANH
		? `anh: ${BANG_CHUNG_HO_SO}`
		: `anh: ${BANG_CHUNG} (khong chep sang ho so — dat VKM_CHEP_ANH=1 o buoc cua E9)`,
);
const { dung, sai } = tongKet();
console.log(`KET LUAN VK2: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
