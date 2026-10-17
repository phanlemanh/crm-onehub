#!/usr/bin/env bun
/**
 * Hai chiều cho một nhóm đo của hồ sơ trang-don-vi-mot-bang (DH2).
 *
 *   bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs <nhom> [--trinh-duyet]
 *
 * Khuôn: _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs.
 * 1. Đối chứng dương: chạy lệnh của nhóm trên vật lành (cây thật) → phải thoát 0.
 * 2. Với từng đột biến của nhóm (bảng DOT_BIEN, khoá = tên DVB_PHA của evals.yaml):
 *    thay ĐÚNG các đoạn `cu` → `moi` trong tệp vật của MỘT WORKTREE TẠM (HEAD +
 *    thay đổi chưa commit của cây thật; node_modules trỏ về cây thật, riêng liên
 *    kết `@crm/*` của workspace dựng lại trỏ vào gói của chính worktree tạm), chạy
 *    lệnh ở đó → phải thoát ≠ 0 VÀ đầu ra khớp mẫu thông điệp ghim (CHIEU DO).
 *    Cây thật không bao giờ bị ghi: băm mọi tệp bị đột biến trước và sau phải bằng.
 * Đột biến trình duyệt (`trinhDuyet`, nhóm dvb-man — mỗi lượt dựng một phiên đo qua
 * scripts/lan-do/tien-de.mjs; worktree tạm cài node_modules riêng vì Turbopack
 * không nhận liên kết ra ngoài gốc) chỉ chạy khi có `--trinh-duyet`; vắng cờ → «BO QUA
 * (trinh duyet)». Đột biến `chuaCo` (vật đo chưa có) → «CHUA CO», không tính đỏ.
 * Đoạn cần thay vắng (không đúng một lần) → mã 2 «KHONG DO DUOC».
 * Mã thoát: 0 hai chiều đúng · 1 có chiều sai · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	lstatSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	readlinkSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "_acceptance/trang-don-vi-mot-bang";
const TRINH_DUYET = process.argv.includes("--trinh-duyet");

const DOT_BIEN = {
	"dvb-chon-don-vi": [
		{
			ten: "bo-go-dau",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi.ts",
					cu: '\t\t.normalize("NFD")\n\t\t.replace(/\\p{M}/gu, "")\n',
					moi: "",
				},
			],
			ghim: /dvb-chon-don-vi: "phong ke toan" ra rong, mong \{Phòng Kế toán\}/,
		},
		{
			ten: "cay-cu",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx",
					cu: "\t\t\tchon={\n\t\t\t\t<ChonDonVi\n\t\t\t\t\tcay={cay.data}\n\t\t\t\t\tchonDon={chonDon}\n\t\t\t\t\tdem={dem.data}\n\t\t\t\t\tdon={don}\n\t\t\t\t\ttenGoc={tenGoc}\n\t\t\t\t/>\n\t\t\t}\n",
					// biome-ignore lint/suspicious/noTemplateCurlyInString: mã nguồn của đột biến, không phải chuỗi mẫu
					moi: '\t\t\tchon={\n\t\t\t\t<>\n\t\t\t\t\t<ul data-cay-gia="">\n\t\t\t\t\t\t{["goc", ...cay.data.divisions.flatMap((bp) => [`bp:${bp.id}`, ...bp.departments.map((pb) => `pb:${pb.id}`)]), ...cay.data.chuaXep.map((pb) => `pb:${pb.id}`)].map((k) => (\n\t\t\t\t\t\t\t<li data-nut-cay={k} key={k}>{k}</li>\n\t\t\t\t\t\t))}\n\t\t\t\t\t</ul>\n\t\t\t\t<ChonDonVi\n\t\t\t\t\tcay={cay.data}\n\t\t\t\t\tchonDon={chonDon}\n\t\t\t\t\tdem={dem.data}\n\t\t\t\t\tdon={don}\n\t\t\t\t\ttenGoc={tenGoc}\n\t\t\t\t/>\n\t\t\t\t</>\n\t\t\t}\n',
				},
			],
			ghim: /dvb-chon-don-vi: con \d+ nut cay \[data-nut-cay\], mong 0/,
		},
	],
	"dvb-dong-mo": [
		{
			ten: "mo-san",
			thay: [
				{
					tep: "packages/ui/src/components/data-table.tsx",
					cu: "const isOpen = canExpand && expanded.has(id);",
					moi: "const isOpen = canExpand;",
				},
			],
			ghim: /dvb-dong-mo: mac dinh 3 dong KR, mong 0/,
		},
	],
	"dvb-hang-cong-cu": [
		{
			ten: "cach-xem-trong-loc",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx",
					cu: "\t\t<div className={LOP_KHOI} data-hang-cong-cu-don-vi>\n\t\t\t{chon}\n\t\t\t<ViewSwitch",
					moi: '\t\t<>\n\t\t<div className={LOP_KHOI} data-hang-cong-cu-don-vi>\n\t\t\t{chon}\n\t\t</div>\n\t\t<div className="hidden flex-col gap-2 sm:flex">\n\t\t\t<ViewSwitch',
				},
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx",
					cu: "\t\t\t\tvalue={xem}\n\t\t\t/>\n\t\t</div>\n\t);",
					moi: "\t\t\t\tvalue={xem}\n\t\t\t/>\n\t\t</div>\n\t\t</>\n\t);",
				},
			],
			ghim: /dvb-hang-cong-cu: danh-sach: \[data-view-switch\] khong nam trong \[data-hang-cong-cu-don-vi\]/,
		},
	],
	"dvb-loc-nhanh": [
		{
			ten: "chua-gop-tinh-cong-ty",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi.ts",
					cu: '\treturn mt.level !== "onehub" && mt.alignments.length === 0;',
					moi: "\treturn mt.alignments.length === 0;",
				},
			],
			ghim: /dvb-loc-nhanh: muc tieu cong ty nam trong Chưa góp vào đâu/,
		},
		{
			ten: "tat-ca-cong-o",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx",
					cu: "\t\t\t\t\tallCount: rows.length,\n",
					moi: "",
				},
			],
			ghim: /dvb-loc-nhanh: nhan Tất cả dem \d+, so dong \d+/,
		},
	],
	"dvb-sap-xep": [
		{
			ten: "sap-chu",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi.ts",
					cu: '\t"tinh-trang": (mt: MucTieu) => BAC_TINH_TRANG[tinhTrangMucTieu(mt)],',
					moi: '\t"tinh-trang": (mt: MucTieu) =>\n\t\tObject.keys(BAC_TINH_TRANG).sort().indexOf(tinhTrangMucTieu(mt)),',
				},
			],
			ghim: /dvb-sap-xep: tinh-trang tang: mong truot dau, nhan cham-nhip/,
		},
	],
	"dvb-chan-bang": [
		{
			ten: "con-sai-cap",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi.ts",
					cu: '\t\t\t\t...cay.divisions.map((bp) => thanh("bp", bp)),',
					moi: '\t\t\t\t...cay.divisions.flatMap((bp) => [\n\t\t\t\t\tthanh("bp", bp),\n\t\t\t\t\t...bp.departments.map((pb) => thanh("pb", pb)),\n\t\t\t\t]),',
				},
			],
			ghim: /dvb-chan-bang: goc: con co P1, mong chi bo phan va chua xep/,
		},
	],
	"dvb-trang-thai": [
		{
			ten: "loi-che-hang",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx",
					cu: "\t\t\t<KhungCachXem hang={hang}>\n\t\t\t\t<Loi thuLai={thuLai} />\n\t\t\t</KhungCachXem>",
					moi: "\t\t\t<Loi thuLai={thuLai} />",
				},
			],
			ghim: /dvb-trang-thai: loi-danh-sach: khong co \[data-chon-don-vi\]/,
		},
	],
	"dvb-giu-xem": [
		{
			ten: "bo-xem",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/thanh-tab.tsx",
					cu: "\tif (xem) giu.set(SEARCH_PARAM.okr.xem, xem);",
					moi: "",
				},
			],
			ghim: /dvb-giu-xem: lien ket cua-toi thieu xemOkr=hop-tuan/,
		},
		{
			ten: "bo-notes-dh1",
			thay: [
				{
					tep: "_acceptance/dieu-huong-khu-muc-tieu/contract.md",
					cu: "- AC-6 nới thêm `xemOkr` trên liên kết thẻ — xem trang-don-vi-mot-bang AC-13 (DH2 thi công phần cách xem DH1 giao lại).\n",
					moi: "",
				},
			],
			ghim: /dvb-giu-xem: hop dong DH1 thieu dong Notes tro AC-13/,
		},
	],
	"dvb-dong-mo-ui": [
		{
			ten: "mui-ten-tran",
			thay: [
				{
					tep: "packages/ui/src/components/data-table.tsx",
					cu: "\t\t\t\t\t\t\t\t\t\t\t\t<ExpandRowButton\n\t\t\t\t\t\t\t\t\t\t\t\t\tlabel={\n\t\t\t\t\t\t\t\t\t\t\t\t\t\texpandable?.rowLabel?.(row) ??\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tmsg.table.rowFallback\n\t\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\t\topen={isOpen}\n\t\t\t\t\t\t\t\t\t\t\t\t\trowId={id}\n\t\t\t\t\t\t\t\t\t\t\t\t\tonToggle={handleClick}\n\t\t\t\t\t\t\t\t\t\t\t\t/>\n",
					moi: "\t\t\t\t\t\t\t\t\t\t\t\t<ChevronRight size={12} />\n",
				},
			],
			ghim: /data-table-mo-rong: dong r1 khong co button\[aria-expanded\] trong o mui ten/,
		},
	],
	"dvb-ho-so-da-ky": [
		{
			ten: "ho-so",
			thay: [
				{
					tep: "apps/app/test/okr-theo-don-vi.dom.tsx",
					cu: 'describe("khung-xuong", () => {',
					moi: 'expect(false).toBe(true);\n\ndescribe("khung-xuong", () => {',
				},
			],
			ghim: /SAI AC-10: \S+ E\w+: ma 1 \(ky vong 0\)/,
		},
		{
			ten: "xoa-ca",
			thay: [
				{
					tep: "apps/app/test/okr-theo-don-vi.dom.tsx",
					cu: '\ttest("theo-don-vi-chua-chu-ky: khong co chu ky, quan tri co lien ket Cai dat, nguoi khac khong", async () => {\n\t\tcycles = { cycles: [], currentId: null };\n\t\tquanTri = true;\n\t\tconst qt = await mo();\n\t\tconst oQt = qt.o.querySelector(\'[data-trang-thai="ST-donvi-chuakychay"]\');\n\t\tconst lienKetQt = oQt?.querySelector("a")?.getAttribute("href");\n\t\tquanTri = false;\n\t\tconst tv = await mo();\n\t\tconst oTv = tv.o.querySelector(\'[data-trang-thai="ST-donvi-chuakychay"]\');\n\t\texpect({\n\t\t\tquanTri: [oQt !== null, lienKetQt],\n\t\t\tthanhVien: [oTv !== null, oTv?.querySelector("a") ?? null],\n\t\t\tcay: tv.o.querySelectorAll("[data-nut-cay]").length,\n\t\t}).toEqual({\n\t\t\tquanTri: [true, "/ws/settings/okr"],\n\t\t\tthanhVien: [true, null],\n\t\t\tcay: 0,\n\t\t});\n\t});\n\n',
					moi: "",
				},
			],
			ghim: /SAI AC-10: \S+ xoa \d+ dong kiem ngoai dau cu/,
		},
	],
	"dvb-proto": [
		{
			ten: "thieu-state",
			thay: [
				{
					tep: "apps/app/app/proto/catalog.ts",
					cu: '\t\t\t{ id: "ST-dvb-loi", nhan: "Lỗi tải" },\n',
					moi: "",
				},
			],
			ghim: /SAI AC-11: thieu ST-dvb-loi trong PROTO_CATALOG/,
		},
	],
	"dvb-ghim-nam": [
		{
			ten: "ghim-cu",
			thay: [],
			ghim: /SAI AC-14: \S+ ghim tren \S+ chua co trang moi/,
			chuaCo: true,
		},
	],
	"dvb-man": [
		{
			ten: "the-don-vi",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx",
					cu: "\t\t\t\t<BangDonVi\n",
					moi: '\t\t\t\t<div className="h-24 rounded-lg border" data-don-vi="the-gia" />\n\t\t\t\t<BangDonVi\n',
				},
			],
			ghim: /SAI AC-2: khoang lech ([6-9]\d|\d{3,})px/,
			trinhDuyet: true,
			evalId: "E2",
		},
		{
			ten: "cach-xem-trong-loc",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx",
					cu: "\t\t<div className={LOP_KHOI} data-hang-cong-cu-don-vi>\n\t\t\t{chon}\n\t\t\t<ViewSwitch",
					moi: '\t\t<>\n\t\t<div className={LOP_KHOI} data-hang-cong-cu-don-vi>\n\t\t\t{chon}\n\t\t</div>\n\t\t<div className="hidden flex-col gap-2 sm:flex">\n\t\t\t<ViewSwitch',
				},
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx",
					cu: "\t\t\t\tvalue={xem}\n\t\t\t/>\n\t\t</div>\n\t);",
					moi: "\t\t\t\tvalue={xem}\n\t\t\t/>\n\t\t</div>\n\t\t</>\n\t);",
				},
			],
			ghim: /SAI AC-4: danh-sach 390 — cach xem bi giau sau Lọc/,
			trinhDuyet: true,
			evalId: "E3",
		},
		{
			ten: "cay-cu",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx",
					cu: "\t\t\tchon={\n\t\t\t\t<ChonDonVi\n\t\t\t\t\tcay={cay.data}\n\t\t\t\t\tchonDon={chonDon}\n\t\t\t\t\tdem={dem.data}\n\t\t\t\t\tdon={don}\n\t\t\t\t\ttenGoc={tenGoc}\n\t\t\t\t/>\n\t\t\t}\n",
					// biome-ignore lint/suspicious/noTemplateCurlyInString: mã nguồn của đột biến, không phải chuỗi mẫu
					moi: '\t\t\tchon={\n\t\t\t\t<>\n\t\t\t\t\t<ul data-cay-gia="">\n\t\t\t\t\t\t{["goc", ...cay.data.divisions.flatMap((bp) => [`bp:${bp.id}`, ...bp.departments.map((pb) => `pb:${pb.id}`)]), ...cay.data.chuaXep.map((pb) => `pb:${pb.id}`)].map((k) => (\n\t\t\t\t\t\t\t<li data-nut-cay={k} key={k}>{k}</li>\n\t\t\t\t\t\t))}\n\t\t\t\t\t</ul>\n\t\t\t\t<ChonDonVi\n\t\t\t\t\tcay={cay.data}\n\t\t\t\t\tchonDon={chonDon}\n\t\t\t\t\tdem={dem.data}\n\t\t\t\t\tdon={don}\n\t\t\t\t\ttenGoc={tenGoc}\n\t\t\t\t/>\n\t\t\t\t</>\n\t\t\t}\n',
				},
			],
			ghim: /SAI AC-8: cay toi da \d+ dong luc dang tai/,
			trinhDuyet: true,
			evalId: "E4",
		},
		{
			ten: "chon-khong-doi",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/chon-don-vi.tsx",
					cu: "\t\t\t\tif (d) chonDon(d);\n",
					moi: "",
				},
			],
			ghim: /SAI AC-1: URL khong doi sau khi chon/,
			trinhDuyet: true,
			evalId: "E5",
		},
		{
			ten: "khoa-dem-sai",
			thay: [
				{
					tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/don-vi-con.tsx",
					cu: "(dem[c.khoa] ?? 0)",
					moi: '(dem[c.khoa.split(":")[1] ?? ""] ?? 0)',
				},
			],
			ghim: /SAI AC-7: o .+? hien Chưa đặt OKR, kho do \d+/,
			trinhDuyet: true,
			evalId: "E17",
		},
	],
};

const domNhom = (nhom) =>
	`cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 60000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t ${nhom}`;
const MAN = `bun scripts/lan-do/tien-de.mjs --chay "bun ${HO_SO}/rang/man-don-vi.mjs"`;

/** Lệnh của nhóm (chạy từ gốc cây, cây thật hoặc worktree tạm). */
const LENH = {
	"dvb-chon-don-vi": () => domNhom("dvb-chon-don-vi"),
	"dvb-dong-mo": () => domNhom("dvb-dong-mo"),
	"dvb-hang-cong-cu": () => domNhom("dvb-hang-cong-cu"),
	"dvb-loc-nhanh": () => domNhom("dvb-loc-nhanh"),
	"dvb-sap-xep": () => domNhom("dvb-sap-xep"),
	"dvb-chan-bang": () => domNhom("dvb-chan-bang"),
	"dvb-trang-thai": () => domNhom("dvb-trang-thai"),
	"dvb-giu-xem": () => domNhom("dvb-giu-xem"),
	"dvb-dong-mo-ui": () =>
		"cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-mo-rong.spec.tsx",
	// Hai vế XOA/SKIP đếm trên mọi tệp; bộ lệnh thu về các lệnh chạm tệp bị phá.
	"dvb-ho-so-da-ky": () =>
		`DVB_LOC_TEP=okr-theo-don-vi.dom.tsx bun ${HO_SO}/rang/ho-so-da-ky.mjs`,
	"dvb-proto": () => `bun ${HO_SO}/rang/proto-don-vi.mjs`,
	"dvb-ghim-nam": () => `bun ${HO_SO}/rang/ghim-nam.mjs`,
	"dvb-man": (db) => `EVAL=${db.evalId} ${MAN}`,
};

function khongDoDuoc(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

// Bảng phải phủ MỌI tên DVB_PHA khai trong evals.yaml của hồ sơ.
const khai = new Set(
	[
		...readFileSync(join(GOC, HO_SO, "evals.yaml"), "utf8").matchAll(
			/DVB_PHA=([a-z0-9-]+)/g,
		),
	].map((x) => x[1]),
);
const coBang = new Set(
	Object.values(DOT_BIEN).flatMap((ds) => ds.map((d) => d.ten)),
);
const thieuBang = [...khai].filter((t) => !coBang.has(t));
if (thieuBang.length > 0)
	khongDoDuoc(
		`bang DOT_BIEN thieu ${thieuBang.join(", ")} (khai trong evals.yaml)`,
	);

const nhom = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!nhom || !(nhom in DOT_BIEN))
	khongDoDuoc(
		`nhom «${nhom ?? ""}» khong co trong bang — ${Object.keys(DOT_BIEN).join(", ")}`,
	);

const dsNhom = DOT_BIEN[nhom];
const chay = dsNhom.filter((d) => !d.chuaCo && (!d.trinhDuyet || TRINH_DUYET));
for (const d of dsNhom) {
	if (d.chuaCo)
		console.log(`CHUA CO ${nhom} ${d.ten}: vat do chua co — khong tinh do`);
	else if (d.trinhDuyet && !TRINH_DUYET)
		console.log(
			`BO QUA (trinh duyet) ${nhom} ${d.ten} — chay voi --trinh-duyet`,
		);
}
if (chay.length === 0) {
	console.log(`KET LUAN ${nhom}: khong dot bien nao chay trong luot nay`);
	process.exit(0);
}

function chayLenh(goc, lenh) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: goc,
		encoding: "utf8",
		env: { ...process.env, TZ: "Asia/Ho_Chi_Minh", DVB_PHA: "" },
		maxBuffer: 256 * 1024 * 1024,
		timeout: 30 * 60 * 1000,
	});
	return { ma: r.status ?? 2, chu: `${r.stdout}${r.stderr}` };
}

const bam = (s) => createHash("sha256").update(s).digest("hex");
const git = (cwd, ...a) =>
	execFileSync("git", a, {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});

const tepDot = [...new Set(chay.flatMap((d) => d.thay.map((t) => t.tep)))];
const bamTruoc = new Map(
	tepDot.map((t) => [t, bam(readFileSync(join(GOC, t), "utf8"))]),
);

// Đối chứng dương: mỗi lệnh khác nhau của nhóm trên vật lành phải thoát 0.
const lenhLanh = [...new Set(chay.map((d) => LENH[nhom](d)))];
for (const lenh of lenhLanh) {
	const lanh = chayLenh(GOC, lenh);
	if (lanh.ma !== 0) {
		console.log(lanh.chu.split("\n").slice(-30).join("\n"));
		console.log(
			`SAI ${nhom}: doi chung duong do tren vat lanh (ma ${lanh.ma}) — ${lenh}`,
		);
		process.exit(1);
	}
	console.log(`DUNG ${nhom} doi chung: vat lanh ma 0 — ${lenh}`);
}

/** node_modules của worktree tạm: trỏ về cây thật, trừ liên kết workspace `@crm`. */
function noiNodeModules(sao) {
	const ds = git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter(
			(d) =>
				/(^|\/)node_modules\/$/.test(d) &&
				!d.slice(0, -1).includes("node_modules/"),
		)
		.map((d) => d.slice(0, -1));
	for (const nm of ds) {
		const that = join(GOC, nm);
		const dich = join(sao, nm);
		if (existsSync(dich)) continue;
		const crm = join(that, "@crm");
		if (!existsSync(crm)) {
			symlinkSync(that, dich);
			continue;
		}
		mkdirSync(dich, { recursive: true });
		for (const e of readdirSync(that)) {
			if (e === "@crm") continue;
			symlinkSync(join(that, e), join(dich, e));
		}
		mkdirSync(join(dich, "@crm"));
		for (const g of readdirSync(crm)) {
			const nguon = join(crm, g);
			// Liên kết tương đối (workspace) dựng lại nguyên văn → trỏ vào gói của worktree tạm.
			const dichLk = lstatSync(nguon).isSymbolicLink()
				? readlinkSync(nguon)
				: nguon;
			symlinkSync(dichLk, join(dich, "@crm", g));
		}
	}
	if (!existsSync(join(sao, "apps/app/node_modules")))
		throw new Error("worktree tam thieu apps/app/node_modules");
	// Bài DOM đọc mã sinh (Prisma client …, bị gitignore) của cây thật — chỉ đọc.
	for (const d of git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter((d) => d === ".env" || /(^|\/)src\/generated\/$/.test(d))
		.map((d) => d.replace(/\/$/, ""))) {
		if (!existsSync(join(sao, d))) symlinkSync(join(GOC, d), join(sao, d));
	}
}

/**
 * node_modules thật cho phiên đo trình duyệt: Turbopack từ chối node_modules là
 * liên kết ra ngoài gốc dự án («points out of the filesystem root»), nên worktree
 * tạm cài riêng từ bộ đệm của bun (khoá cứng, vài giây); .env trỏ về cây thật,
 * Prisma client do postinstall sinh trong chính worktree tạm.
 */
function caiNodeModules(sao) {
	if (existsSync(join(GOC, ".env")) && !existsSync(join(sao, ".env")))
		symlinkSync(join(GOC, ".env"), join(sao, ".env"));
	const r = spawnSync("bun", ["install", "--frozen-lockfile"], {
		cwd: sao,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	if (r.status !== 0)
		throw new Error(
			`bun install trong worktree tam thoat ${r.status}: ${`${r.stdout}${r.stderr}`.trim().split("\n").slice(-3).join(" | ")}`,
		);
}

const tam = mkdtempSync(join(tmpdir(), "dvb-hai-chieu-"));
const sao = join(tam, "crm");
let sai = 0;
let khongDo = null;
function don() {
	try {
		git(GOC, "worktree", "remove", "--force", sao);
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		git(GOC, "worktree", "prune");
	} catch {}
}
for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"])
	process.on(tin, () => {
		don();
		process.exit(128 + { SIGINT: 2, SIGTERM: 15, SIGHUP: 1 }[tin]);
	});
try {
	git(GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD");
	const va = git(GOC, "diff", "HEAD", "--binary");
	if (va.trim()) {
		const tepVa = join(tam, "chua-commit.patch");
		writeFileSync(tepVa, va);
		git(sao, "apply", "--whitespace=nowarn", tepVa);
	}
	if (chay.some((d) => d.trinhDuyet)) caiNodeModules(sao);
	else noiNodeModules(sao);
	for (const db of chay) {
		const goc = new Map();
		for (const t of db.thay) {
			const tep = join(sao, t.tep);
			const chu = goc.get(tep) ?? readFileSync(tep, "utf8");
			goc.set(tep, goc.get(tep) ?? chu);
			const hienTai = readFileSync(tep, "utf8");
			const soLan = hienTai.split(t.cu).length - 1;
			if (soLan !== 1) {
				khongDo = `dot bien ${db.ten} — doan can thay xuat hien ${soLan} lan trong ${t.tep}`;
				break;
			}
			writeFileSync(tep, hienTai.replace(t.cu, t.moi));
		}
		if (khongDo) break;
		const batDau = Date.now();
		const r = chayLenh(sao, LENH[nhom](db));
		for (const [tep, chu] of goc) writeFileSync(tep, chu);
		const giay = Math.round((Date.now() - batDau) / 1000);
		const khop = db.ghim.exec(r.chu)?.[0];
		if (r.ma !== 0 && khop)
			console.log(
				`DUNG ${nhom} chieu do ${db.ten}: ma ${r.ma}, «${khop}» (${giay}s)`,
			);
		else {
			sai += 1;
			console.log(
				r.chu
					.split("\n")
					.filter((l) => /dvb-|SAI|KHONG|error/.test(l))
					.slice(0, 20)
					.join("\n"),
			);
			console.log(
				`SAI ${nhom} chieu do ${db.ten}: ma ${r.ma}, THIEU thong diep khop ${db.ghim} (${giay}s)`,
			);
		}
	}
} catch (e) {
	khongDo = `worktree tam: ${String(e).slice(0, 300)}`;
} finally {
	don();
}
for (const t of tepDot)
	if (bam(readFileSync(join(GOC, t), "utf8")) !== bamTruoc.get(t))
		khongDo = `cay that bi ghi: ${t} doi bam trong luot — phep do khong duoc ghi vao cay`;
if (khongDo) khongDoDuoc(khongDo);
console.log(
	sai === 0
		? `KET LUAN ${nhom}: hai chieu dung (${chay.length} dot bien, worktree tam)`
		: `KET LUAN ${nhom}: ${sai} chieu do sai`,
);
process.exit(sai === 0 ? 0 : 1);
