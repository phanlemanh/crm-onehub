import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NGAN = "apps/app/components/crm/record-sheet";
const KHUON = "design/patterns/ngan-ban-ghi.md";
const LUAT = "tools/oxlint/onehub/rules/ngan-trong-khung.ts";
const CHEP = [".oxlintrc.json", "package.json", "tools/oxlint", "design/patterns", "packages/db/src/giai-doan.ts", NGAN];
const TEN_LUAT = "ngan-trong-khung";
const THAY_DIALOG = "khối soạn trong ngăn, ConfirmDialog hay PickListDialog";
const MA_TRAN = [
	["DetailSheetHeader", "RecordSheetFrame"],
	["Spinner", "ChoTaiNgan"],
	["VungTaiLoi", "KhungTaiLoi"],
	["Skeleton", "ChoTaiNgan"],
	["Sheet", "RecordSheetFrame"],
	["SheetContent", "RecordSheetFrame"],
	["Dialog", THAY_DIALOG],
	["DialogContent", THAY_DIALOG],
];
const GAN_TEN = ["ConfirmDialog", "PickListDialog", "DetailSheetSection", "SkeletonRow"];
const TEN_KHONG_TRONG_MA = [
	"DetailSheetHeader",
	"Spinner",
	"VungTaiLoi",
	"Skeleton",
	'Sheet"',
	'Dialog"',
	"RecordSheetFrame",
	"ChoTaiNgan",
	"KhungTaiLoi",
];

function dung(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

const lenhSlop = JSON.parse(readFileSync(join(GOC, "package.json"), "utf8")).scripts?.["lint:slop"];
if (!lenhSlop) dung(2, "KHONG DO DUOC: package.json khong co script lint:slop");

function chayLint(cay) {
	const r = spawnSync("bun", ["run", "lint:slop"], {
		cwd: cay,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	if (!/Finished in/.test(ra)) dung(2, `KHONG DO DUOC: lint:slop khong chay o ${cay} — ${ra.slice(0, 400)}`);
	const dong = ra.split("\n");
	const loi = [];
	dong.forEach((d, i) => {
		if (!d.includes(`onehub(${TEN_LUAT})`)) return;
		const vt = dong.slice(i + 1, i + 4).find((x) => x.includes(",-["));
		loi.push({ msg: d, vt: vt ? /,-\[(.*)\]/.exec(vt)?.[1] ?? "" : "" });
	});
	return { ma: r.status, loi };
}

function caySao(sua) {
	const tam = mkdtempSync(join(tmpdir(), "bk2-luat-"));
	for (const p of CHEP) cpSync(join(GOC, p), join(tam, p), { recursive: true });
	symlinkSync(join(GOC, "node_modules"), join(tam, "node_modules"));
	for (const [tep, doi] of Object.entries(sua)) {
		const d = join(tam, tep);
		mkdirSync(dirname(d), { recursive: true });
		let cu = "";
		try {
			cu = readFileSync(d, "utf8");
		} catch {}
		writeFileSync(d, doi instanceof Function ? doi(cu) : doi);
	}
	return tam;
}

function thay(nguon, cu, moi) {
	if (!nguon.includes(cu)) dung(2, `KHONG DO DUOC: fixture khong thay «${cu.slice(0, 60)}»`);
	return nguon.replace(cu, moi);
}

const tiem = (ten) => `import { ${ten} } from "@/x";\nexport const a = [${ten}];\n`;
const dauTiem = (ten) => (s) => `import { ${ten} } from "@/x";\n${s}`;

function voiCay(sua, lam) {
	const tam = caySao(sua);
	try {
		return lam(chayLint(tam));
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

let ok = true;
function ca(ten, dat, chiTiet) {
	console.log(`${dat ? "DAT" : "TRUOT"} ${ten}${dat ? "" : ` — ${chiTiet}`}`);
	ok = dat && ok;
}
const tom = (r) => `ma ${r.ma}; ${r.loi.length} dong: ${r.loi.map((l) => `${l.vt} ${l.msg.trim().slice(0, 120)}`).join(" | ")}`;

voiCay({ [`${NGAN}/deal-sheet.tsx`]: dauTiem("DetailSheetHeader") }, (r) => {
	const l = r.loi[0];
	ca(
		"do-header: deal-sheet nhap DetailSheetHeader thi do",
		r.ma !== 0 &&
			r.loi.length === 1 &&
			l.vt.startsWith(`${NGAN}/deal-sheet.tsx:1:`) &&
			l.msg.includes("DetailSheetHeader") &&
			l.msg.includes("RecordSheetFrame"),
		r.loi.length ? tom(r) : "khong co dong ngan-trong-khung",
	);
});

voiCay(
	{
		[`${NGAN}/deal-sheet.tsx`]: dauTiem("DetailSheetHeader"),
		".oxlintrc.json": (s) => thay(s, '"onehub/ngan-trong-khung": "error"', '"onehub/ngan-trong-khung": "off"'),
	},
	(r) => ca("tu-kiem: tat luat trong .oxlintrc thi khong con dong (thuoc phan biet duoc)", r.loi.length === 0, tom(r)),
);

for (const [ten, thayThe] of MA_TRAN) {
	voiCay({ [`${NGAN}/zz-tiem.tsx`]: tiem(ten) }, (r) =>
		ca(
			`ma-tran: ${ten}`,
			r.loi.length === 1 && r.loi[0].msg.includes(`«${ten}»`) && r.loi[0].msg.includes(thayThe),
			tom(r),
		),
	);
}

voiCay({ [`${NGAN}/zz-tiem.tsx`]: tiem(GAN_TEN.join(", ")) }, (r) =>
	ca(`gan-ten: ${GAN_TEN.join(", ")} im`, r.loi.length === 0, tom(r)),
);

voiCay(
	{
		[KHUON]: (s) =>
			thay(
				thay(s, "Skeleton, Sheet, Dialog]", "Skeleton, Sheet, Dialog, KhoiThu]"),
				"  Dialog: khối soạn",
				"  KhoiThu: ThayThu\n  Dialog: khối soạn",
			),
		[`${NGAN}/zz-tiem.tsx`]: tiem("KhoiThu"),
	},
	(r) =>
		ca(
			"khuon-them: them KhoiThu vao cam_ngoai_khuon thi KhoiThu do",
			r.loi.length === 1 && r.loi[0].msg.includes("«KhoiThu»") && r.loi[0].msg.includes("ThayThu"),
			tom(r),
		),
);

voiCay(
	{
		[KHUON]: (s) =>
			thay(thay(s, "DetailSheetHeader, Spinner, VungTaiLoi", "DetailSheetHeader, VungTaiLoi"), "  Spinner: ChoTaiNgan\n", ""),
		[`${NGAN}/deal-sheet.tsx`]: dauTiem("Spinner"),
	},
	(r) => ca("khuon-bot: bo Spinner thi Spinner im", r.loi.length === 0, tom(r)),
);

{
	const ma = readFileSync(join(GOC, LUAT), "utf8");
	const co = TEN_KHONG_TRONG_MA.filter((t) => ma.includes(t));
	ca("khong-danh-sach-trong-ma: tools/oxlint/onehub/rules/ngan-trong-khung.ts khong chua ten khoi nao", co.length === 0, `con: ${co.join(", ")}`);
}

voiCay({}, (r) =>
	ca(
		"khung-mien: record-parts.tsx im",
		!r.loi.some((l) => l.vt.includes("record-parts.tsx")),
		tom(r),
	),
);

voiCay(
	{
		[KHUON]: (s) => thay(s, `  nhap: ${NGAN}/record-parts.tsx`, `  nhap: ${NGAN}/deal-sheet.tsx`),
		[`${NGAN}/deal-sheet.tsx`]: dauTiem("DetailSheetHeader"),
	},
	(r) =>
		ca(
			"khung-doi: doi khuon.nhap sang deal-sheet thi record-parts do, deal-sheet nhap DetailSheetHeader im",
			r.loi.some((l) => l.vt.includes("record-parts.tsx") && l.msg.includes("DetailSheetHeader")) &&
				!r.loi.some((l) => l.vt.includes("deal-sheet.tsx")),
			tom(r),
		),
);

voiCay({ [`${NGAN}/kr-sheet.tsx`]: dauTiem("Spinner") }, (r) =>
	ca(
		"ngoai-le-dung-cap: kr-sheet nhap Skeleton im, nhap them Spinner thi Spinner do",
		r.loi.length === 1 && r.loi[0].msg.includes("«Spinner»") && r.loi[0].vt.includes("kr-sheet.tsx"),
		tom(r),
	),
);

voiCay(
	{
		[KHUON]: (s) =>
			thay(
				s,
				"ly_do: chờ tải của riêng mục «Sổ nguồn» khi quyền còn chưa biết, bên trong thân đã tải xong — không phải chờ tải của ngăn",
				"ly_do: ",
			),
	},
	(r) =>
		ca(
			"ngoai-le-thieu-ly-do: xoa ly_do dong kr-sheet thi Skeleton do",
			r.loi.length === 1 && r.loi[0].msg.includes("«Skeleton»") && r.loi[0].vt.includes("kr-sheet.tsx"),
			tom(r),
		),
);

for (const [ten, tep] of [
	["im: docs/", "docs/zz-tiem.tsx"],
	["im: _acceptance/", "_acceptance/zz-tiem/zz-tiem.tsx"],
	["im: apps/app/components/ngoai", "apps/app/components/zz-ngoai/zz-tiem.tsx"],
]) {
	voiCay({ [tep]: tiem("DetailSheetHeader") }, (r) => ca(ten, r.loi.length === 0, tom(r)));
}

{
	const r = chayLint(GOC);
	ca("cay-that: bun run lint:slop tren cay that khong dong ngan-trong-khung nao", r.loi.length === 0, tom(r));
}

if (!ok) process.exit(1);
console.log("DAT tat ca");
