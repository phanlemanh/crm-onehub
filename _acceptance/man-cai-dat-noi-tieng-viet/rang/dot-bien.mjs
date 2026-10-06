import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chayDotBien } from "./dot-bien-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG = JSON.parse(readFileSync(`${HERE}/toast-cua-lat.json`, "utf8"));

const CHAN = [
	{ ten: "moi-chuoi", lenh: ["moi-chuoi.mjs"] },
	{ ten: "chu-cung-jsx", lenh: ["chu-cung-lat.mjs"] },
	{ ten: "toast", lenh: ["chu-ngoai-jsx.mjs", "--chan", "toast"] },
	{ ten: "tieu-de", lenh: ["chu-ngoai-jsx.mjs", "--chan", "tieu-de"] },
	{
		ten: "khong-du-quyen",
		lenh: ["chu-ngoai-jsx.mjs", "--chan", "khong-du-quyen"],
	},
];

const VET = [
	{
		ten: "chu trong JSX",
		file: "apps/app/app/(app)/[slug]/settings/workspace-form.tsx",
		cam: (s) => s.replace("{t.congTy.ten}", "Name"),
	},
	{
		ten: "o tieu de tab",
		file: "apps/app/app/(app)/[slug]/settings/page.tsx",
		cam: (s) =>
			s.replace(
				"settingsMessages(await getLocale()).tieuDeTab.chung",
				'"General"',
			),
	},
	{
		ten: "xoa han cau khong du quyen",
		file: "apps/app/app/(app)/[slug]/settings/workspace-form.tsx",
		cam: (s) =>
			s.replace(/\t*\{canRename \? null : \(\n(?:.|\n)*?\n\t*\)\}\n/, ""),
	},
	{
		ten: "mang lua chon mang chu tieng Anh",
		file: "apps/app/app/(app)/[slug]/settings/archive-retention.tsx",
		cam: (s) =>
			s.replace(
				"export function ArchiveRetention() {",
				'const CHON = [{ name: "Ninety days after close", value: "90" }];\n\nexport function ArchiveRetention() {',
			),
	},
	{
		ten: "nhan thanh ben doi sang chu viet thang",
		file: "apps/app/lib/cai-dat-dieu-huong.ts",
		cam: (s) =>
			s.replace(
				'{ khoa: "chung", href: GOC_CAI_DAT }',
				'{ khoa: "General", href: GOC_CAI_DAT }',
			),
	},
	{
		ten: "tu don viet thuong trong JSX",
		file: "apps/app/app/(app)/[slug]/settings/currencies/currency-settings.tsx",
		cam: (s) => s.replace("t.tienTe.donVi", '"unit"'),
	},
	{
		ten: "thuoc tinh khong ky thuat",
		file: "apps/app/app/(app)/[slug]/settings/agent-model.tsx",
		cam: (s) =>
			s.replace("placeholder={t.model.tim}", 'placeholder="Search models…"'),
	},
	{
		ten: "toast giu khoa nhung them chuoi Anh trong cung loi goi",
		file: "apps/app/app/(app)/[slug]/settings/currencies/currency-settings.tsx",
		cam: (s) =>
			s.replace(
				"toast.success(t.tienTe.daGo);",
				'toast.success(t.tienTe.daGo, { description: "Removed from the list." });',
			),
	},
	...BANG.loi_goi.slice(0, 3).map((l) => ({
		ten: `toast doc khoa ${l.khoa}`,
		file: l.file,
		cam: (s) => s.replace(`t.${l.khoa}`, '"Saved for good."'),
	})),
];

await chayDotBien({ HERE, CHAN, VET });
