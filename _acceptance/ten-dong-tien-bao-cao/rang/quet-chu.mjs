import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.QUET_GOC ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const KY_MONG = 18;
const SAN_TEP = 100;
const MOC_HOP_DONG_CU = "f87ca17f";
const CU = "_acceptance/tien-te-chua-tai-khong-doan/contract.md";
const HOP_DONG = "_acceptance/ten-dong-tien-bao-cao/contract.md";
const CAM = ["đồng tiền mặc định", "default currency"];
const PHAI_CO = ["đồng tiền báo cáo", "reporting currency"];
const TEP_TEN = [
	"apps/app/lib/messages/settings.ts",
	"apps/app/lib/messages/record-sheet.ts",
	"apps/app/lib/messages/deals.ts",
];
const BO = new Set(["node_modules", ".next", "test", ".turbo", "generated"]);

const nfc = (s) => s.normalize("NFC");
const doc = (duong) => nfc(readFileSync(join(GOC, duong), "utf8"));

let khang = 0;
const lech = [];

function di(thuMuc, ra) {
	for (const ten of readdirSync(thuMuc)) {
		if (BO.has(ten)) continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) di(duong, ra);
		else if (/\.(ts|tsx)$/.test(ten)) ra.push(duong);
	}
	return ra;
}

const tep = [
	...di(join(GOC, "apps/app"), []),
	...di(join(GOC, "packages/ui/src"), []),
];
if (tep.length < SAN_TEP) {
	console.log(
		`KHONG DO DUOC: chi quet duoc ${tep.length} tep, san la ${SAN_TEP}`,
	);
	process.exit(2);
}
for (const cum of CAM) {
	khang += 1;
	const trung = tep.filter((t) =>
		nfc(readFileSync(t, "utf8")).toLowerCase().includes(cum),
	);
	for (const t of trung) lech.push(`${relative(GOC, t)}: con «${cum}»`);
}
for (const t of TEP_TEN) {
	const noi = doc(t).toLowerCase();
	for (const cum of PHAI_CO) {
		khang += 1;
		if (!noi.includes(cum)) lech.push(`${t}: thieu «${cum}»`);
	}
}

const tuDien = doc("CONTEXT.md").split("\n");
const dau = tuDien.findIndex((d) => d.startsWith("**Đồng tiền báo cáo**:"));
khang += 1;
if (dau < 0) {
	lech.push("CONTEXT.md: khong co muc Đồng tiền báo cáo");
} else {
	const sau = tuDien.slice(dau + 1).findIndex((d) => /^\*\*[^*]+\*\*:/.test(d));
	const muc = tuDien.slice(dau, sau < 0 ? undefined : dau + 1 + sau).join("\n");
	khang += 1;
	if (tuDien[dau].replace("**Đồng tiền báo cáo**:", "").trim().length < 20) {
		lech.push("CONTEXT.md: muc thieu cau dinh nghia");
	}
	khang += 1;
	if (!muc.includes("Cài đặt") || !muc.includes("Tiền tệ")) {
		lech.push("CONTEXT.md: muc thieu «Cài đặt»/«Tiền tệ»");
	}
	khang += 1;
	const tranh =
		muc
			.split("\n")
			.find((d) => d.startsWith("_Avoid_"))
			?.toLowerCase() ?? "";
	if (!CAM.every((c) => tranh.includes(c))) {
		lech.push("CONTEXT.md: dong _Avoid_ thieu cum can tranh");
	}
}
if (dau < 0) khang += 3;

const dongAc1 =
	doc(HOP_DONG)
		.split("\n")
		.find((d) => d.startsWith("- AC-1:")) ?? "";
const cauVi = [...dongAc1.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const cauEn = [...dongAc1.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const bonCau = [
	["vi/dang-tai", cauVi[0]],
	["vi/loi", cauVi[1]],
	["en/dang-tai", cauEn[0]],
	["en/loi", cauEn[1]],
];
const deals = doc("apps/app/lib/messages/deals.ts");
for (const [nhan, cau] of bonCau) {
	khang += 1;
	if (!cau) lech.push(`AC-1 ${nhan}: khong rut duoc cau tu hop dong`);
	else if (!deals.includes(`"${cau}"`)) {
		lech.push(`AC-1 ${nhan}: khong co nguyen van trong deals.ts`);
	}
}

const phan = (van, ten) => {
	const d = van.split("\n");
	const i = d.findIndex((x) => x.trim() === `## ${ten}`);
	if (i < 0) return null;
	const j = d.slice(i + 1).findIndex((x) => x.startsWith("## "));
	return d.slice(i, j < 0 ? undefined : i + 1 + j).join("\n");
};
const cuNay = doc(CU);
let cuMoc = "";
try {
	cuMoc = nfc(
		execFileSync("git", ["-C", GOC, "show", `${MOC_HOP_DONG_CU}:${CU}`], {
			encoding: "utf8",
		}),
	);
} catch {
	console.log(`KHONG DO DUOC: khong doc duoc ${CU} o ${MOC_HOP_DONG_CU}`);
	process.exit(2);
}
khang += 1;
if (phan(cuNay, "Criteria") !== phan(cuMoc, "Criteria")) {
	lech.push("tien-te-chua-tai-khong-doan: Criteria da doi");
}
khang += 1;
if (!(phan(cuNay, "Notes") ?? "").includes("ten-dong-tien-bao-cao")) {
	lech.push("tien-te-chua-tai-khong-doan: Notes khong tro sang day");
}

console.log(
	`quet-chu: ${tep.length} tep, ${khang}/${KY_MONG} khang dinh, ${lech.length} lech`,
);
if (khang !== KY_MONG) {
	console.log(`KHONG DO DUOC: ma tran lech ban khai — ${khang} != ${KY_MONG}`);
	process.exit(2);
}
for (const l of lech) console.log(`LECH ${l}`);
process.exit(lech.length === 0 ? 0 : 1);
