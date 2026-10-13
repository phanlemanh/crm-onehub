import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dongTungCau } from "../../tro-ly-doc-kho/rang/quyet-do";
import { BO_MAU } from "./bo-mau-config";
import { khuonBoMau } from "./khuon";

const CA = process.env[BO_MAU.bien.chamGiaCa] ?? "0";
const THU_MUC = process.env[BO_MAU.bien.chamGiaDir];
const i = process.argv.indexOf("--bo");
const tepBo = i >= 0 ? process.argv[i + 1] : undefined;
if (!THU_MUC || !tepBo) {
	console.log("KHONG DO DUOC: cham-gia can CHAM_GIA_DIR va --bo");
	process.exit(2);
}
if (CA === "2") {
	console.log("KHONG DO DUOC: cham-gia gia lap script cham khong do duoc");
	process.exit(2);
}

const bo = khuonBoMau.parse(JSON.parse(readFileSync(tepBo, "utf8")));
const ngoai = (nhom: string) => nhom === "khong-phai-quy-dinh";
const mot = bo.cau
	.filter((c) => !ngoai(c.nhom))
	.map((c) =>
		dongTungCau(
			{
				id: c.id,
				nhom: c.nhom,
				ketCuc:
					CA === "loi" && c.id === "m06"
						? "LOI"
						: c.nhom === "khong-co"
							? "TU_CHOI"
							: "TRA_LOI-du",
			},
			1,
		),
	);
const hai = bo.cau
	.filter((c) => !(CA === "thieu-zalo" && c.id === "m50"))
	.map((c) =>
		dongTungCau(
			{
				id: c.id,
				nhom: c.nhom,
				ketCuc: ngoai(c.nhom) ? "khong-hang" : "co-hang",
			},
			2,
			false,
			{ ketQua: "da-tra-loi", loi: null, coHang: !ngoai(c.nhom) },
		),
	);
const motCuoi =
	CA === "thieu"
		? mot.map((d) => (d.id === "m01" ? { ...d, id: "m02" } : d))
		: mot;

const luot = join(THU_MUC, "luot-1");
mkdirSync(luot, { recursive: true });
writeFileSync(
	join(luot, "cham-tung-cau.jsonl"),
	`${[...motCuoi, ...hai].map((d) => JSON.stringify(d)).join("\n")}\n`,
);
writeFileSync(
	join(THU_MUC, "cham-bo-do.md"),
	[
		"# Chấm bộ câu đo — giả",
		"",
		"## Tổng",
		"",
		"- dungTrang gia",
		"- chuyenQuyDinh gia",
		"",
		"## Lượt một",
		"",
	].join("\n"),
);
console.log(`thu muc luot: ${THU_MUC}`);
process.exit(CA === "1" ? 1 : CA === "loi" ? 2 : 0);
