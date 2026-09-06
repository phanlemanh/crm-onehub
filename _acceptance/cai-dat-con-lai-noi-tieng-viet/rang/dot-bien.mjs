import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chayDotBien } from "../../man-cai-dat-noi-tieng-viet/rang/dot-bien-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DOT_MOT = join(HERE, "../../man-cai-dat-noi-tieng-viet/rang");
const KHAI = join(HERE, "lat-cai-dat-2.json");
const BANG = JSON.parse(readFileSync(`${HERE}/toast-cua-lat.json`, "utf8"));
const LAT = "apps/app/app/(app)/[slug]/settings";

const CHAN = [
	{ ten: "moi-chuoi", lenh: [join(DOT_MOT, "moi-chuoi.mjs"), "--lat", KHAI] },
	{
		ten: "chu-cung-jsx",
		lenh: [join(DOT_MOT, "chu-cung-lat.mjs"), "--lat", KHAI],
	},
	{
		ten: "toast",
		lenh: [
			join(DOT_MOT, "chu-ngoai-jsx.mjs"),
			"--chan",
			"toast",
			"--lat",
			KHAI,
		],
	},
	{
		ten: "tieu-de",
		lenh: [
			join(DOT_MOT, "chu-ngoai-jsx.mjs"),
			"--chan",
			"tieu-de",
			"--lat",
			KHAI,
		],
	},
	{
		ten: "khong-du-quyen",
		lenh: [
			join(DOT_MOT, "chu-ngoai-jsx.mjs"),
			"--chan",
			"khong-du-quyen",
			"--lat",
			KHAI,
		],
	},
	{
		ten: "doan-ma-chep",
		lenh: [join(HERE, "man-that.mjs"), "doan-ma-chep"],
	},
];

const VET = [
	{
		ten: "chu trong JSX",
		file: `${LAT}/connections/intake/page.tsx`,
		cam: (s) =>
			s.replace(
				"{t.tiepNhan.moTa}",
				'{"This connection is not available yet."}',
			),
		chan: ["moi-chuoi", "chu-cung-jsx", "toast", "tieu-de", "khong-du-quyen"],
	},
	{
		ten: "o tieu de tab",
		file: `${LAT}/api-keys/page.tsx`,
		cam: (s) =>
			s.replace(
				"khoaApiMessages(await getLocale()).trang.tieuDeTab",
				'"API keys"',
			),
		chan: ["moi-chuoi", "chu-cung-jsx", "toast", "tieu-de", "khong-du-quyen"],
	},
	{
		ten: "thuoc tinh khong ky thuat",
		file: `${LAT}/members/members-table.tsx`,
		cam: (s) =>
			s.replace(
				"placeholder={t.bang.tim}",
				'placeholder="Search by name or email…"',
			),
		chan: ["moi-chuoi", "chu-cung-jsx", "toast", "tieu-de", "khong-du-quyen"],
	},
	{
		ten: "tu don viet thuong trong JSX",
		file: `${LAT}/tracking/tracking-script.tsx`,
		cam: (s) => s.replace("{t.doanMa.chep}", '{"copy"}'),
		chan: ["moi-chuoi", "chu-cung-jsx", "toast", "tieu-de", "khong-du-quyen"],
	},
	{
		ten: "mang lua chon mang chu tieng Anh",
		file: `${LAT}/api-keys/create-api-key-sheet.tsx`,
		cam: (s) =>
			s.replace(
				'"use client";',
				'"use client";\n\nconst CHON = [{ name: "Ninety days after close", value: "90" }];',
			),
		chan: ["moi-chuoi", "chu-cung-jsx", "toast", "tieu-de", "khong-du-quyen"],
	},
	{
		ten: "xoa han cau khong du quyen",
		file: `${LAT}/connections/slack/page.tsx`,
		cam: (s) =>
			s.replace(
				"{status.canManage ? t.slack.moTaQuanTri : t.slack.moTaThuong}",
				"{t.slack.moTaQuanTri}",
			),
		chan: ["moi-chuoi", "chu-cung-jsx", "toast", "tieu-de", "khong-du-quyen"],
	},
	{
		ten: "toast giu khoa nhung them chuoi Anh trong cung loi goi",
		file: BANG.loi_goi[0].file,
		cam: (s) =>
			s.replace(
				`toast.success(t.${BANG.loi_goi[0].khoa});`,
				`toast.success(t.${BANG.loi_goi[0].khoa}, { description: "Removed from the list." });`,
			),
		chan: ["moi-chuoi", "chu-cung-jsx", "toast", "tieu-de", "khong-du-quyen"],
	},
	...BANG.loi_goi.slice(0, 2).map((l) => ({
		ten: `toast doi khoa ${l.khoa}`,
		file: l.file,
		cam: (s) => s.replace(`t.${l.khoa}`, '"Saved for good."'),
		chan: ["moi-chuoi", "chu-cung-jsx", "toast", "tieu-de", "khong-du-quyen"],
	})),
	{
		ten: "sua ten thuoc tinh trong trackingSnippet cua packages/db (WRITER that)",
		file: "packages/db/src/tracking.ts",
		cam: (s) =>
			s.replace('data-site="${siteId}"', 'data-sit="${siteId}"'),
		chan: ["doan-ma-chep"],
		cho_ms: 12000,
	},
	{
		ten: "sua mot ky tu trong template dung chung cua the script",
		file: `${LAT}/tracking/tracking-script.tsx`,
		cam: (s) =>
			s.replace(
				'const SITE_ATTRIBUTE = "data-site";',
				'const SITE_ATTRIBUTE = "data-sit";',
			),
		chan: ["doan-ma-chep"],
		cho_ms: 12000,
	},
];

await chayDotBien({ HERE, CHAN, VET });
