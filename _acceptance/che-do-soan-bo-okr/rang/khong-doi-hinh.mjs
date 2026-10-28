import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const require = createRequire(import.meta.url);
const { parseEvals } = require(join(GOC, "lib", "eval-yaml.cjs"));
const { resolveConfigKey } = require(join(GOC, "lib", "evidence-core.cjs"));

const HO_SO_NAY = "che-do-soan-bo-okr";
const DANH_SACH = [
	"gop-y-dung-cho",
	"kara-gop-y-luot-2",
	"gan-tay-va-kara-co-ly-do",
	"nen-kara",
	"muc-tieu-va-kr",
	"okr-to-chuc-va",
	"soan-okr-cung-tro-ly",
	"soan-okr-song-lai",
	"soan-okr-trong-khung",
	"khung-soan-chan-lien-ket",
	"mot-nut-tao-muc-tieu",
	"trang-bo-okr",
	"dieu-huong-khu-muc-tieu",
	"khung-okr-truoc-r1",
	"okr-soat-anh-luot-3",
	"trang-don-vi-mot-bang",
	"quyet-gop-y-noi-dung-ly-do",
];
const MAU =
	/data-vung-kara|VungKara|DeXuatNeo|data-de-xuat-neo|data-nhom-soan|NutSoan|Soạn cùng Kara|Thêm mục tiêu|data-cau-rong-bo/;
const NHANH_GOC = "origin/onehub";
const CHU_KHO = "Phan Le Manh";
const CON_TRO = `${HO_SO_NAY}#AC-7`;
const CON_TRO_RIENG = {
	"mot-nut-tao-muc-tieu#E13": `${HO_SO_NAY}#AC-1`,
};
const MNT = "apps/app/test/mot-nut-tao-muc-tieu.dom.tsx";
const LOP_DUOC_PHEP = [
	{
		lop: 1,
		ten: "quyet-gop-y-noi-dung-ly-do: xoa tron tep chi co ba ca k3c",
		tep: "apps/app/test/gop-y-dung-cho-k3c.dom.tsx",
		kieu: "xoa-ca",
		ca: [
			"k3c",
			"k3c-vi 9 ma: cau tieng Viet cua tung ma duoi dung gop y",
			"k3c-en 9 ma: cau tieng Anh cua tung ma, khong chu Viet",
			"k3c-san-sang ba ca: ma cua tap khong doc lai san sang; chua san sang va 5xx giu cau thu lai",
		],
		evals: [
			"quyet-gop-y-noi-dung-ly-do#E3",
			"quyet-gop-y-noi-dung-ly-do#E4",
			"quyet-gop-y-noi-dung-ly-do#E5",
		],
	},
	{
		lop: 1,
		ten: "gan-tay-va-kara-co-ly-do: xoa ca l4-de-xuat",
		tep: "apps/app/test/gan-ly-do.dom.tsx",
		kieu: "xoa-ca",
		ca: [
			"l4-de-xuat",
			"l4-de-xuat: đề xuất căn chỉnh hiện mức tin, vì sao, căn cứ và ba nút",
			"l4-de-xuat: Sửa lý do mở hộp thoại điền sẵn chữ Kara, gửi troLyQuyet cách sua",
		],
		evals: ["gan-tay-va-kara-co-ly-do#E10"],
	},
	{
		lop: 1,
		ten: "gan-tay-va-kara-co-ly-do: ten nhap chi ca l4-de-xuat dung",
		tep: "apps/app/test/gan-ly-do.dom.tsx",
		kieu: "xoa",
		dong: ["D_CAN,", "deXuat,", "dong,", "dungSheetCoGopY,", "m,"],
	},
	{
		lop: 2,
		ten: "gan-tay-va-kara-co-ly-do: go muc dot bien (h) va l4_de_xuat",
		tep: "_acceptance/gan-tay-va-kara-co-ly-do/rang/dot-bien.mjs",
		kieu: "xoa",
		dong: [
			'const NHOM = "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx";',
			'"l4_de_xuat",',
			"NHOM,",
			"{",
			'ten: "(h) bo dong can cu cua de xuat",',
			"tep: NHOM,",
			'cam: thay("{d.canCu ? (", "{false && d.canCu ? ("),',
			'lenh: lenhCua("l4_de_xuat"),',
			'ghim: "thieu dong can cu",',
			"},",
		],
	},
	{
		lop: 3,
		ten: "okr-to-chuc-va E12: du lieu mau soGopYCho 1 de chip hien",
		tep: "apps/app/test/okr-to-chuc-va.dom.tsx",
		kieu: "doi",
		bo: ['const MT = mucTieu("mt-kara", { canEdit: true });'],
		them: ['const MT = mucTieu("mt-kara", { canEdit: true, soGopYCho: 1 });'],
	},
	{
		lop: 3,
		ten: "okr-to-chuc-va E12: du lieu mau chu ky va quyen sua bo de chip hien (V1-60)",
		tep: "apps/app/test/okr-to-chuc-va.dom.tsx",
		kieu: "doi",
		bo: [],
		them: [
			'dat("okr.cycles", () => ({',
			'cycles: [{ id: MT.cycleId, kind: "quy", phase: "dang-chay" }],',
			"}));",
			'dat("okr.danhSach", () => ({ canEdit: true }));',
		],
	},
	{
		lop: 1,
		ten: "mot-nut-tao-muc-tieu: xoa ba ca mnt-soan goi soanMo",
		tep: MNT,
		kieu: "xoa-ca",
		ca: [
			"mnt-soan",
			"mnt-soan: chon dong — mo cuoc moi goi soanMo mot lan, tiep cuoc khong goi, dong khoa khong goi",
			"mnt-soan: bam dong Soan hai lan khi dang cho chi goi soanMo mot lan",
			"mnt-soan: phan hoi soanMo — con cuoc thi mo cuoc do, tu choi thi doc lai san sang, loi thi bam lai duoc",
		],
		evals: ["mot-nut-tao-muc-tieu#E13"],
	},
	{
		lop: 4,
		ten: "mot-nut-tao-muc-tieu: dong nhap chi ba ca mnt-soan dung",
		tep: MNT,
		kieu: "xoa",
		dong: [
			'const { dauThangSau, homNayVn } = await import("@/lib/okr-chu-ky-nhan");',
		],
	},
	{
		lop: 4,
		ten: "mot-nut-tao-muc-tieu E4: lat khang dinh dau Kara cua dong soan (d-20261025T092700Z-27)",
		tep: MNT,
		kieu: "doi",
		bo: [
			'q("[data-slot=kara-mark]", dong("soan") ?? document) !== null,',
			'"mnt-hop: dong soan thieu dau Kara",',
		],
		them: [
			'q("[data-slot=kara-mark]", dong("soan") ?? document) === null,',
			'"mnt-hop: dong soan con dau Kara",',
		],
	},
	{
		lop: 4,
		ten: "mot-nut-tao-muc-tieu E15: doi chung duong dong soan mo che do Soan",
		tep: MNT,
		kieu: "doi",
		bo: ['await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");'],
		them: [
			'const sanSoan = await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");',
		],
	},
	{
		lop: 4,
		ten: "mot-nut-tao-muc-tieu E15: doi chung duong dong soan mo che do Soan",
		tep: MNT,
		kieu: "doi",
		bo: [
			'soLanGoi("okr.soanMo") === 1,',
			'"mnt-khoa: doi chung bo dem ghi khong thay soanMo khi co quyen",',
		],
		them: [
			'(sanSoan.url().get("record") ?? "").startsWith("soan-bo:"),',
			`\`mnt-khoa: doi chung dong soan khong mo che do Soan khi co quyen ($\{sanSoan.url().get("record")})\`,`,
		],
	},
	{
		lop: 1,
		ten: "gop-y-dung-cho: xoa tron ca vung Kara da go (gop-y-dung-cho-khung.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-khung.tsx",
		kieu: "xoa-ca",
		ca: [
			"CONFLICT doc lai danh sach, loi khac hien dung cho",
			"Esc trong o sua khong dong khung va tra focus ve Sua",
			"Tab tu Vi sao di qua moi nut de xuat theo thu tu nhin thay",
			"Vi sao mo ly do va gio doc; viet lai co del/ins va dung ba nut; cau hoi co loi di",
			"bay trang thai cua nhom Kara trong khung chi tiet",
			"bien nhan da quyet trong phien khong lam lech so dem",
			"bo qua sau loai, bien nhan noi dung, khong hoan tac, nhan giam",
			"bo-qua",
			"dang gui thi moi de xuat khac khoa, xong thi mo",
			"dong-bo",
			"focus-khung",
			"khoa-gui",
			"lam moi danh sach dung mot lan khi so chip lech so dong cho",
			"neo",
			"nhan, sua roi nhan, hoan tac va dau theo Kara",
			"nhan-hoan-tac",
			"sau loai gop y nam dung cho, inline, khong the hay canh bao",
		],
		evals: [
			"gop-y-dung-cho#E5",
			"gop-y-dung-cho#E8",
			"gop-y-dung-cho#E11",
			"gop-y-dung-cho#E13",
			"gop-y-dung-cho#E14",
			"gop-y-dung-cho#E16",
			"gop-y-dung-cho#E17",
		],
	},
	{
		lop: 1,
		ten: "gop-y-dung-cho: thu ten nhap chi ca da xoa dung (gop-y-dung-cho-khung.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-khung.tsx",
		kieu: "nhap",
	},
	{
		lop: 1,
		ten: "gop-y-dung-cho: xoa tron ca vung Kara da go (gop-y-dung-cho-ra-soat.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-ra-soat.tsx",
		kieu: "xoa-ca",
		ca: [
			"Kara doc xong trong khung thi chip danh sach va so cua Muc tieu lam moi theo so moi",
			"co neoGopY thi cuon toi vung Kara khi vung da hien roi xoa co; mo kieu khac khong cuon",
			"doc qua han thi Thu lai mo duoc va nho lai Kara",
			"dong-bo",
			"focus-khung",
			"mo khung khi chip danh sach con dem cu thi danh sach doc lai va chip ve so khung hien (AC-3)",
			"muc tieu cho duyet: gop y van hien nhung nut quyet khoa co ly do, khong nut nho; muc tieu da bo khong co vung Kara",
			"neo",
			"quyet de xuat dau nhom giu cho va focus o Hoan tac sau khi danh sach doc lai",
			"quyet het roi nho Kara doc lai thi hien dang doc va bao loi khi lan doc lai hong",
			"trang-thai-kara",
		],
		evals: [
			"gop-y-dung-cho#E5",
			"gop-y-dung-cho#E8",
			"gop-y-dung-cho#E11",
			"gop-y-dung-cho#E13",
			"gop-y-dung-cho#E14",
			"gop-y-dung-cho#E16",
			"gop-y-dung-cho#E17",
		],
	},
	{
		lop: 1,
		ten: "gop-y-dung-cho: thu ten nhap chi ca da xoa dung (gop-y-dung-cho-ra-soat.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-ra-soat.tsx",
		kieu: "nhap",
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: xoa tron ca vung Kara da go (gop-y-dung-cho-luot-2-khung.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-luot-2-khung.tsx",
		kieu: "xoa-ca",
		ca: [
			"k3-khung vung la DetailSheetSection nhu vung ben canh, mot tia sang, ba KaraProposal, Kara ban thi nut quyet khoa",
			"k3-nho-loi",
			"k3-nho-loi Nho Kara bi tu choi hay loi thi vung hien KaraState loi voi cau san pham va Thu lai",
			"k3-qua-han",
			"k3-qua-han doc xong muon: qua tran van hoi lai cham, Kara doc xong thi bo loi va hien gop y",
			"k3-qua-han khung mo luc Kara dang doc va khong bam Nho: duoi tran con dang doc, qua tran sang loi co Thu lai",
			"k3-tai-loi",
			"k3-tai-loi giu gop y khi hoi lai loi: da co danh sach thi lan hoi lai hong khong xoa gop y",
			"k3-tai-loi vung con, KaraState loi voi cau tai loi, Thu lai chi tai lai danh sach",
			"k3-tat",
			"k3-tat 3 ly do x 2 trang thai vung: KaraState off noi ly do, khong Thu lai xam, nut tro toi cau ly do",
			"k3-tat thu lai khi chua biet san sang: doc san sang loi thi Thu lai doc lai san sang, khong im lang",
		],
		evals: [
			"kara-gop-y-luot-2#E1",
			"kara-gop-y-luot-2#E2",
			"kara-gop-y-luot-2#E3",
			"kara-gop-y-luot-2#E4",
			"kara-gop-y-luot-2#E5",
			"kara-gop-y-luot-2#E6",
			"kara-gop-y-luot-2#E7",
			"kara-gop-y-luot-2#E8",
			"kara-gop-y-luot-2#E9",
			"kara-gop-y-luot-2#E10b",
			"kara-gop-y-luot-2#E13",
			"kara-gop-y-luot-2#E14",
		],
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: thu ten nhap chi ca da xoa dung (gop-y-dung-cho-luot-2-khung.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-luot-2-khung.tsx",
		kieu: "nhap",
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: xoa tron ca vung Kara da go (gop-y-dung-cho-luot-2-dan.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-luot-2-dan.tsx",
		kieu: "xoa-ca",
		ca: [
			"k3-neo-kr id la: khong co gop y cua KR do thi cuon toi vung Kara, bo ca hai khoa, khong lam noi dong nao",
			"k3-neo-kr khung mo tu URL neo KR: focus va lam noi gop y dau tien cua dung KR",
			"k3-nhieu-kr",
			"k3-nhieu-kr nguoi sua duoc hai KR, khong sua duoc Muc tieu: nut Nho hien, Nho gui ca Muc tieu khong kem keyResultId",
		],
		evals: [
			"kara-gop-y-luot-2#E1",
			"kara-gop-y-luot-2#E2",
			"kara-gop-y-luot-2#E3",
			"kara-gop-y-luot-2#E4",
			"kara-gop-y-luot-2#E5",
			"kara-gop-y-luot-2#E6",
			"kara-gop-y-luot-2#E7",
			"kara-gop-y-luot-2#E8",
			"kara-gop-y-luot-2#E9",
			"kara-gop-y-luot-2#E10b",
			"kara-gop-y-luot-2#E13",
			"kara-gop-y-luot-2#E14",
		],
		phu: ["const cuonGoc = HTMLElement.prototype.scrollIntoView;"],
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: thu ten nhap chi ca da xoa dung (gop-y-dung-cho-luot-2-dan.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-luot-2-dan.tsx",
		kieu: "nhap",
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: xoa tron ca vung Kara da go (gop-y-dung-cho-luot-2-dong.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-luot-2-dong.tsx",
		kieu: "xoa-ca",
		ca: [
			"k3-can-chinh",
			"k3-can-chinh Hoan tac loi thi cau loi duoi bien nhan, bien nhan con",
			"k3-can-chinh nhan -> lam moi -> Hoan tac: go dung lien ket vua tao, khong bao gio go lien ket co tu truoc",
			"k3-chip",
			"k3-chip nho Kara roi dong khung khi Kara con doc: chip danh sach va Cua toi doi so moi khong tai lai trang",
			"k3-hai-hoan",
			"k3-hai-hoan hoan tac KR1 roi KR2 truoc khi lan dau xong: moi KR ve dung luc lan cua no xong, loi nam duoi dung KR",
			"k3-loi-dong",
			"k3-loi-dong 4 hanh dong x 4 loai loi: cau san pham duoi gop y, khong ma tho",
		],
		evals: [
			"kara-gop-y-luot-2#E1",
			"kara-gop-y-luot-2#E2",
			"kara-gop-y-luot-2#E3",
			"kara-gop-y-luot-2#E4",
			"kara-gop-y-luot-2#E5",
			"kara-gop-y-luot-2#E6",
			"kara-gop-y-luot-2#E7",
			"kara-gop-y-luot-2#E8",
			"kara-gop-y-luot-2#E9",
			"kara-gop-y-luot-2#E10b",
			"kara-gop-y-luot-2#E13",
			"kara-gop-y-luot-2#E14",
		],
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: thu ten nhap chi ca da xoa dung (gop-y-dung-cho-luot-2-dong.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-luot-2-dong.tsx",
		kieu: "nhap",
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: xoa tron ca vung Kara da go (gop-y-dung-cho-luot-2-ngay-gio.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-luot-2-ngay-gio.tsx",
		kieu: "xoa-ca",
		ca: [
			"k3-ngay-gio",
			"k3-ngay-gio bay be mat x hai tieng cung mot khuon ngay gio, gio Viet Nam",
		],
		evals: [
			"kara-gop-y-luot-2#E1",
			"kara-gop-y-luot-2#E2",
			"kara-gop-y-luot-2#E3",
			"kara-gop-y-luot-2#E4",
			"kara-gop-y-luot-2#E5",
			"kara-gop-y-luot-2#E6",
			"kara-gop-y-luot-2#E7",
			"kara-gop-y-luot-2#E8",
			"kara-gop-y-luot-2#E9",
			"kara-gop-y-luot-2#E10b",
			"kara-gop-y-luot-2#E13",
			"kara-gop-y-luot-2#E14",
		],
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: thu ten nhap chi ca da xoa dung (gop-y-dung-cho-luot-2-ngay-gio.tsx)",
		tep: "apps/app/test/gop-y-dung-cho-luot-2-ngay-gio.tsx",
		kieu: "nhap",
	},
	{
		lop: 1,
		ten: "kara-gop-y-luot-2: bo nhap hai tep chi con ca da xoa",
		tep: "apps/app/test/gop-y-dung-cho-luot-2.dom.tsx",
		kieu: "xoa",
		dong: [
			'await import("./gop-y-dung-cho-luot-2-dong");',
			'await import("./gop-y-dung-cho-luot-2-ngay-gio");',
		],
	},
	{
		lop: 2,
		ten: "kara-gop-y-luot-2: CHAN chi con k3_nhieu_kr (cac khoa khac da nghi)",
		tep: "_acceptance/kara-gop-y-luot-2/rang/dot-bien.mjs",
		kieu: "doi",
		bo: [
			'"k3_khung", "k3_tai_loi", "k3_nho_loi", "k3_qua_han", "k3_tat", "k3_loi_dong",',
			'"k3_can_chinh", "k3_hai_hoan", "k3_chip", "k3_nhieu_kr", "k3_nhieu_kr_ui", "k3_neo_kr",',
		],
		them: ['"k3_nhieu_kr",'],
	},
	{
		lop: 2,
		ten: "kara-gop-y-luot-2: go muc dot bien (a)-(e), (g), (h) chi eval da nghi bat duoc",
		tep: "_acceptance/kara-gop-y-luot-2/rang/dot-bien.mjs",
		kieu: "xoa",
		dau: [
			'const OKR = "apps/app/app/(app)/[slug]/okr";',
			"const noi = (...buoc) =>",
			'{ ten: "(a) ',
			'{ ten: "(b) ',
			'{ ten: "(c) ',
			'{ ten: "(d) ',
			'{ ten: "(e) ',
			'{ ten: "(g) ',
			'{ ten: "(h) ',
		],
	},
];
const TEN_CA = /\b(?:describe|test)\(\s*(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g;
const TRANG_THAI_DA_KY = new Set(["signed-off", "machine-cleared"]);
const EXECUTOR_MAY = new Set(["test", "script"]);
const NGUONG_TEP_CHUNG = 5;
const THUOC_THEO_VONG = {
	"trang-bo-okr#E15":
		"thuoc theo vong trang-bo-okr (AC-11): soat diff merge-base..HEAD cua nhanh dang chay roi chay lai lop cua VK3, phan 1/3 — tron lop do 5 gio 28",
	"trang-bo-okr#E17":
		"thuoc theo vong trang-bo-okr (AC-11): chay lai lop cua VK3, phan 2/3",
	"trang-bo-okr#E18":
		"thuoc theo vong trang-bo-okr (AC-11): chay lai lop cua VK3, phan 3/3",
	"muc-tieu-va-kr#E14":
		"thuoc chay thuoc: rang/ho-so-cham.mjs tu chay eval cua 14 ho so khac theo diff merge-base cua nhanh dang chay",
	"dieu-huong-khu-muc-tieu#E11":
		"thuoc theo vong dieu-huong-khu-muc-tieu (AC-9): rut tep kiem tu diff merge-base cua nhanh dang chay, tiem throw vao tep kiem tai cho",
	"trang-don-vi-mot-bang#E12":
		"thuoc theo vong trang-don-vi-mot-bang: rut tep kiem tu diff merge-base cua nhanh dang chay roi chay eval cua ho so khac",
};
const DONG_YAML_NGHI = /^ {4}(?:status: not-run|superseded_by: \S+)$/;
const DONG_YAML_TRO_CU = /^ {4}superseded_by: \S+$/;
const DONG_YAML_TRO_MOI = `    superseded_by: ${HO_SO_NAY}#AC-7`;
const DUOI_MA = /\.(?:mjs|cjs|js|ts|tsx|sh)$/;
const TEP_TRONG_LENH = /[\w@./()[\]-]+\.(?:tsx|ts|mjs|cjs|js|sh)\b/g;
const NHAP_TUONG_DOI = /(?:from\s+|import\(\s*)["'](\.{1,2}\/[^"']+)["']/g;
const GOC_TEP = [
	"",
	"apps/app",
	"apps/api",
	"apps/agent",
	"apps/agent-okr",
	"packages/ui",
	"packages/validation",
	"packages/db",
];
const LA_BAI = /(^|\/)test\//;
const CHO_CHUOI = "«S»";
const PHUT_MS = 60_000;
const TRAN_LENH_MS = 40 * PHUT_MS;
const MA_DO = 1;
const MA_KHONG_DO = 2;
const ANH_XA = join(HERE, "anh-xa-nghi.json");
const CHIEU_DO_HO_SO = "gop-y-dung-cho";
const CHIEU_DO_LOT = "mot-nut-tao-muc-tieu";

const git = (args, cwd = GOC) =>
	execFileSync("git", args, {
		cwd,
		encoding: "utf8",
		maxBuffer: 64 << 20,
	}).trim();

const laTep = (p) => existsSync(p) && statSync(p).isFile();

function trangThai(slug, cwd) {
	const hd = join(cwd, "_acceptance", slug, "contract.md");
	if (!existsSync(hd)) return null;
	return /^status:\s*(\S+)/m.exec(readFileSync(hd, "utf8"))?.[1] ?? null;
}

function hoSoDaKy(cwd) {
	return readdirSync(join(cwd, "_acceptance"), { withFileTypes: true })
		.filter((d) => d.isDirectory() && d.name !== HO_SO_NAY)
		.map((d) => d.name)
		.filter(
			(slug) =>
				TRANG_THAI_DA_KY.has(trangThai(slug, cwd) ?? "") &&
				existsSync(join(cwd, "_acceptance", slug, "evals.yaml")),
		)
		.sort();
}

const docEvals = (tho) =>
	parseEvals(tho, [
		"executor",
		"cmd",
		"status",
		"expected_exit",
		"superseded_by",
	]);

function evalsCua(slug, cwd) {
	return docEvals(
		readFileSync(join(cwd, "_acceptance", slug, "evals.yaml"), "utf8"),
	);
}

const chu = (v) => String(v ?? "").trim();
const nghi = (e) => chu(e.status) === "not-run";

function giaiLenh(cauHinh, e, ten) {
	const cmd = chu(e.cmd);
	if (!cmd.startsWith("config:")) return cmd;
	const ref = cmd.slice("config:".length);
	const lenh = chu(resolveConfigKey(cauHinh, ref));
	if (lenh === "" && EXECUTOR_MAY.has(chu(e.executor)) && !nghi(e))
		throw new Error(`khong giai duoc ${ten} (${ref})`);
	return lenh;
}

function nguonCay(cwd) {
	return {
		co: (t) => laTep(join(cwd, t)),
		doc: (t) => readFileSync(join(cwd, t), "utf8"),
		trong: (thuMuc) =>
			existsSync(join(cwd, thuMuc))
				? readdirSync(join(cwd, thuMuc), { recursive: true }).map((f) =>
						join(thuMuc, String(f)),
					)
				: [],
	};
}

function nguonGoc(coSo, cwd) {
	const tat = git(["ls-tree", "-r", "--name-only", coSo], cwd).split("\n");
	const co = new Set(tat);
	return {
		co: (t) => co.has(t),
		doc: (t) => git(["show", `${coSo}:${t}`], cwd),
		trong: (thuMuc) => tat.filter((t) => t.startsWith(`${thuMuc}/`)),
	};
}

function tepCuaLenh(lenh, nguon) {
	const tep = new Set();
	for (const m of lenh.matchAll(TEP_TRONG_LENH)) {
		const t = m[0].replace(/^\.\//, "");
		const ung = GOC_TEP.map((g) => join(g, t)).find((x) => nguon.co(x));
		if (!ung) continue;
		if (LA_BAI.test(ung)) tep.add(ung);
	}
	return tep;
}

function bongNhap(tep, nguon) {
	const hang = [...tep];
	while (hang.length > 0) {
		const t = hang.pop();
		for (const m of nguon.doc(t).matchAll(NHAP_TUONG_DOI)) {
			const goc = join(dirname(t), m[1]);
			const ung = [goc, `${goc}.ts`, `${goc}.tsx`, `${goc}.mjs`].find((x) =>
				nguon.co(x),
			);
			if (!ung || !LA_BAI.test(ung) || tep.has(ung)) continue;
			tep.add(ung);
			hang.push(ung);
		}
	}
	return tep;
}

function tepRang(slug, nguon) {
	return nguon
		.trong(`_acceptance/${slug}/rang`)
		.filter((f) => DUOI_MA.test(f) && nguon.co(f));
}

function tepThuoc(slug, nguon, { caNghi }) {
	const cauHinh = nguon.doc("_acceptance/config.yaml");
	const duong = `_acceptance/${slug}/evals.yaml`;
	if (!nguon.co(duong)) return tepRang(slug, nguon);
	const bai = new Set();
	for (const e of docEvals(nguon.doc(duong))) {
		if (!caNghi && nghi(e)) continue;
		if (chu(e.cmd) === "") continue;
		for (const t of tepCuaLenh(giaiLenh(cauHinh, e, `${slug}#${e.id}`), nguon))
			bai.add(t);
	}
	return [...new Set([...tepRang(slug, nguon), ...bongNhap(bai, nguon)])];
}

function buocQuet(cwd, danhSach) {
	const nguon = nguonCay(cwd);
	const khop = hoSoDaKy(cwd).filter((slug) =>
		tepThuoc(slug, nguon, { caNghi: false }).some((t) =>
			MAU.test(nguon.doc(t)),
		),
	);
	const lot = khop.filter((s) => !danhSach.includes(s));
	const sai = lot.map((s) => `SAI AC-11: lot ${s}`);
	if (sai.length === 0)
		console.log(
			`QUET ${khop.length} khop, deu trong DANH SACH ${danhSach.length}: ${khop.join(", ")}`,
		);
	return sai;
}

function docAnhXa(cwd) {
	const tep = join(cwd, relative(GOC, ANH_XA));
	if (!existsSync(tep)) return [];
	const bang = JSON.parse(readFileSync(tep, "utf8"));
	if (!Array.isArray(bang)) throw new Error("anh-xa-nghi.json khong phai mang");
	return bang;
}

function evalsTaiGoc(slug, coSo, cwd) {
	const r = spawnSync(
		"git",
		["show", `${coSo}:_acceptance/${slug}/evals.yaml`],
		{ cwd, encoding: "utf8", maxBuffer: 64 << 20 },
	);
	return r.status === 0 ? docEvals(r.stdout) : [];
}

function nghiTrongVong(cwd, coSo) {
	const ra = new Map();
	for (const slug of DANH_SACH) {
		const goc = new Map(
			evalsTaiGoc(slug, coSo, cwd).map((e) => [chu(e.id), e]),
		);
		for (const e of evalsCua(slug, cwd)) {
			const truoc = goc.get(chu(e.id));
			if (nghi(e) && !(truoc && nghi(truoc))) ra.set(`${slug}#${e.id}`, e);
		}
	}
	return ra;
}

function buocNghi(cwd, coSo) {
	const sai = [];
	const bang = docAnhXa(cwd);
	const idMoi = new Set(evalsCua(HO_SO_NAY, cwd).map((e) => chu(e.id)));
	const nghiMoi = nghiTrongVong(cwd, coSo);
	for (const [ten, e] of nghiMoi) {
		const sb = chu(e.superseded_by);
		const dung = CON_TRO_RIENG[ten] ?? CON_TRO;
		if (sb === "") sai.push(`SAI AC-11: ${ten} nghi khong co chu`);
		else if (sb !== dung)
			sai.push(`SAI AC-11: ${ten} nghi tro ${sb}, khong phai ${dung}`);
		const dong = bang.filter((d) => d?.cu === ten);
		if (dong.length === 0)
			sai.push(`SAI AC-11: ${ten} nghi khong co trong anh-xa-nghi.json`);
		for (const d of dong)
			if (!idMoi.has(chu(d.moi)))
				sai.push(
					`SAI AC-11: ${ten} anh xa tro ${d.moi} khong co o ${HO_SO_NAY}`,
				);
	}
	for (const d of bang)
		if (!nghiMoi.has(d?.cu)) sai.push(`SAI AC-11: anh xa thua ${d?.cu}`);
	console.log(
		`eval nghi trong vong: ${nghiMoi.size} (${[...nghiMoi.keys()].join(", ")})`,
	);
	return sai;
}

function hetChuoi(ma, i, nhay) {
	for (let j = i + 1; j < ma.length; j += 1) {
		if (ma[j] === "\\") j += 1;
		else if (ma[j] === nhay) return j;
		else if (ma[j] === "\n") return -1;
	}
	return -1;
}

function hetNgoac(ma, i) {
	let sau = 1;
	for (let j = i; j < ma.length; j += 1) {
		const c = ma[j];
		if (c === "'" || c === '"') {
			const het = hetChuoi(ma, j, c);
			if (het < 0) return -1;
			j = het;
		} else if (c === "`") {
			const mau = docMau(ma, j);
			if (!mau) return -1;
			j = mau.het;
		} else if (c === "{") sau += 1;
		else if (c === "}") {
			sau -= 1;
			if (sau === 0) return j;
		}
	}
	return -1;
}

function docMau(ma, i) {
	const bieuThuc = [];
	for (let j = i + 1; j < ma.length; j += 1) {
		if (ma[j] === "\\") j += 1;
		else if (ma[j] === "`") return { het: j, bieuThuc };
		else if (ma[j] === "$" && ma[j + 1] === "{") {
			const dong = hetNgoac(ma, j + 2);
			if (dong < 0) return null;
			bieuThuc.push(chuanHoa(ma.slice(j + 2, dong)));
			j = dong;
		}
	}
	return null;
}

function chuanHoa(ma) {
	let ra = "";
	for (let i = 0; i < ma.length; i += 1) {
		const c = ma[i];
		if (c === "'" || c === '"') {
			const het = hetChuoi(ma, i, c);
			if (het >= 0) {
				ra += CHO_CHUOI;
				i = het;
				continue;
			}
		} else if (c === "`") {
			const mau = docMau(ma, i);
			if (mau) {
				ra += `${CHO_CHUOI}(${mau.bieuThuc.join(",")})`;
				i = mau.het;
				continue;
			}
		}
		ra += c;
	}
	return ra.replace(/\s+/g, "").replace(/,(?=[)\]}])/g, "");
}

function khoiDiff(diff) {
	return diff
		.split(/\n(?=@@)/)
		.filter((k) => k.startsWith("@@"))
		.map((k) => {
			const [dau, ...than] = k.split("\n");
			const so = dau.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
			const bo = than.filter((d) => d.startsWith("-")).map((d) => d.slice(1));
			const them = than.filter((d) => d.startsWith("+")).map((d) => d.slice(1));
			const dong = so ? (so[3] === "0" ? so[1] : so[2]) : "?";
			const mau = (them[0] ?? bo[0] ?? "").trim().slice(0, 80);
			return { dong: Number(dong), mau, bo, them };
		});
}

function coDongFix(slug, tep, coSo, cwd) {
	const duong = `_acceptance/${slug}/decisions.jsonl`;
	const L = join(cwd, duong);
	if (!existsSync(L)) return false;
	const goc = spawnSync("git", ["show", `${coSo}:${duong}`], {
		cwd,
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
	const cu = new Set(goc.status === 0 ? goc.stdout.split("\n") : []);
	return readFileSync(L, "utf8")
		.split("\n")
		.filter((d) => d !== "" && !cu.has(d))
		.some((d) => {
			try {
				const o = JSON.parse(d);
				return (
					o.type === "fix" &&
					o.decided_by === CHU_KHO &&
					String(o.decision).includes(tep)
				);
			} catch {
				return false;
			}
		});
}

const gon = (ds) => ds.map((d) => d.trim()).filter((d) => d !== "");
const trungKhop = (a, b) =>
	a.length === b.length && a.every((x, i) => x === b[i]);

function khoiDoiChuoi(tep, k) {
	if (tep.endsWith("evals.yaml"))
		return (
			(k.bo.length === 0 && k.them.every((d) => DONG_YAML_NGHI.test(d))) ||
			(k.bo.length === k.them.length &&
				k.bo.every((d) => DONG_YAML_TRO_CU.test(d)) &&
				k.them.every((d) => d === DONG_YAML_TRO_MOI))
		);
	if (gon(k.bo).length === 0 && gon(k.them).length === 0) return true;
	if (k.bo.length === 0 || k.them.length === 0) return false;
	return chuanHoa(k.bo.join("\n")) === chuanHoa(k.them.join("\n"));
}

const DONG_NHAP =
	/^(?:import\b|\}? ?from\b|\} from\b|[\w$]+,?$|const \{[^}]*\} = await import\(|\);?$|["'][^"']+["']\s*\)?;?$)/;

function tenNhap(ds) {
	const chuoi = ds.join("\n");
	const mo = [...chuoi.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
	const ten = chuoi
		.replace(/["'][^"']*["']/g, "")
		.match(/[\w$]+/g)
		?.filter((t) => !["import", "from", "type", "const", "await"].includes(t));
	return { mo: new Set(mo), ten: new Set(ten ?? []) };
}

function laThuNhap(k) {
	const bo = gon(k.bo);
	const them = gon(k.them);
	if (bo.length === 0 || ![...bo, ...them].every((d) => DONG_NHAP.test(d)))
		return false;
	const truoc = tenNhap(bo);
	const sau = tenNhap(them);
	return (
		[...sau.ten].every((t) => truoc.ten.has(t)) &&
		[...sau.mo].every((t) => truoc.mo.has(t))
	);
}

function lopCuaKhoi(tep, k, nghiMoi) {
	const bo = gon(k.bo);
	const them = gon(k.them);
	return (
		LOP_DUOC_PHEP.filter((l) => l.tep === tep).find((l) => {
			if (l.kieu === "doi")
				return trungKhop(bo, l.bo) && trungKhop(them, l.them);
			if (l.kieu === "nhap") return laThuNhap(k);
			if (them.length > 0 || bo.length === 0) return false;
			if (l.kieu === "xoa")
				return bo.every((d) =>
					l.dong ? l.dong.includes(d) : l.dau.some((x) => d.startsWith(x)),
				);
			const ca = [...k.bo.join("\n").matchAll(TEN_CA)].map((m) => m[2]);
			const khai =
				ca.length === 0 && (l.phu ?? []).some((x) => bo[0].startsWith(x));
			return (
				(khai || (ca.length > 0 && ca.every((c) => l.ca.includes(c)))) &&
				l.evals.every((e) => nghiMoi.has(e))
			);
		}) ?? null
	);
}

function soatMotTep(tep, cacHoSo, soHoSoDung, coSo, cwd, nghiMoi) {
	const diff = git(["diff", "-U0", coSo, "--", tep], cwd);
	if (diff === "") return [];
	const khoi = khoiDiff(diff);
	if (
		soHoSoDung >= NGUONG_TEP_CHUNG &&
		khoi.every((k) => k.bo.length === 0) &&
		!tep.startsWith("_acceptance/")
	) {
		for (const k of khoi) console.log(`THEM DANG KY ${tep}:${k.dong} ${k.mau}`);
		return [];
	}
	const sai = [];
	for (const k of khoi) {
		if (khoiDoiChuoi(tep, k)) continue;
		const lop = lopCuaKhoi(tep, k, nghiMoi);
		if (lop)
			console.log(
				`DOI THUOC ${tep}:${k.dong} thuoc lop ${lop.lop} «${lop.ten}»`,
			);
		else
			sai.push(
				`SAI AC-11: ${cacHoSo.join(",")}#${tep}:${k.dong} doi logic — ${k.mau}`,
			);
	}
	for (const slug of cacHoSo)
		if (!coDongFix(slug, tep.endsWith("evals.yaml") ? "" : tep, coSo, cwd))
			sai.push(`SAI AC-11: ${slug}#${tep} thieu dong so fix decided_by`);
	if (sai.length === 0)
		console.log(
			`DOI THUOC ${tep}: ${khoi.length} khoi deu doi chuoi hay thuoc lop da ke, so ${cacHoSo.join(",")} co dong fix`,
		);
	return sai;
}

function buocDoiThuoc(cwd, coSo) {
	const cauHinh = readFileSync(join(cwd, "_acceptance", "config.yaml"), "utf8");
	const cay = nguonCay(cwd);
	const goc = nguonGoc(coSo, cwd);
	const nghiMoi = nghiTrongVong(cwd, coSo);
	const doi = new Set(
		git(["diff", "--name-only", coSo], cwd).split("\n").filter(Boolean),
	);
	const dungBoi = new Map();
	for (const slug of hoSoDaKy(cwd))
		for (const e of evalsCua(slug, cwd)) {
			if (chu(e.cmd) === "") continue;
			for (const t of tepCuaLenh(giaiLenh(cauHinh, e, `${slug}#${e.id}`), cay))
				dungBoi.set(t, new Set([...(dungBoi.get(t) ?? []), slug]));
		}
	const cuaHoSo = new Map();
	for (const slug of DANH_SACH)
		for (const t of [
			...tepThuoc(slug, cay, { caNghi: true }),
			...tepThuoc(slug, goc, { caNghi: true }),
			`_acceptance/${slug}/evals.yaml`,
		])
			cuaHoSo.set(t, [...new Set([...(cuaHoSo.get(t) ?? []), slug])]);
	return [...cuaHoSo]
		.filter(([t]) => doi.has(t))
		.flatMap(([t, cacHoSo]) =>
			soatMotTep(t, cacHoSo, dungBoi.get(t)?.size ?? 0, coSo, cwd, nghiMoi),
		);
}

function evalMay(cauHinh) {
	return DANH_SACH.flatMap((slug) =>
		evalsCua(slug, GOC).flatMap((e) => {
			if (!EXECUTOR_MAY.has(chu(e.executor)) || nghi(e)) return [];
			const ten = `${slug}#${e.id}`;
			const lenh = giaiLenh(cauHinh, e, ten);
			const kyVong = Number(chu(e.expected_exit) || "0");
			if (!Number.isInteger(kyVong))
				throw new Error(`expected_exit khong phai so nguyen o ${ten}`);
			const evalRieng = /\bEVAL=/.test(lenh) ? chu(e.id) : null;
			return [
				{
					ten,
					slug,
					lenh,
					kyVong,
					evalRieng,
					khoa: evalRieng ? `${lenh}\u0000EVAL=${evalRieng}` : lenh,
				},
			];
		}),
	);
}

const tepBanHoSo = (cwd) =>
	git(
		[
			"status",
			"--porcelain",
			"--",
			...DANH_SACH.map((s) => `_acceptance/${s}`),
		],
		cwd,
	)
		.split("\n")
		.filter(Boolean)
		.map((d) => ({ ma: d.slice(0, 2), tep: d.slice(3) }));

function traLai(cwd, truoc) {
	const daBan = new Set(truoc.map((d) => d.tep));
	for (const { ma, tep } of tepBanHoSo(cwd)) {
		if (daBan.has(tep)) continue;
		if (ma === "??") rmSync(join(cwd, tep), { recursive: true, force: true });
		else git(["checkout", "--", tep], cwd);
		console.log(`TRA LAI ${tep} (lenh do ghi vao ho so da ky)`);
	}
}

function chayMotLan(muc, cwd) {
	const truoc = tepBanHoSo(cwd);
	const r = spawnSync("bash", ["-c", muc.lenh], {
		cwd,
		stdio: ["ignore", "ignore", "ignore"],
		timeout: TRAN_LENH_MS,
		killSignal: "SIGKILL",
		env: muc.evalRieng ? { ...process.env, EVAL: muc.evalRieng } : process.env,
	});
	traLai(cwd, truoc);
	return r.error ? MA_KHONG_DO : (r.status ?? MA_KHONG_DO);
}

function chay(muc, cwd, daChay) {
	if (daChay.has(muc.khoa)) return daChay.get(muc.khoa);
	let ma = chayMotLan(muc, cwd);
	if (ma === MA_KHONG_DO) {
		console.log(`THU LAI ${muc.ten}: lan dau ma ${MA_KHONG_DO}`);
		ma = chayMotLan(muc, cwd);
	}
	daChay.set(muc.khoa, ma);
	return ma;
}

function dungCay(dich) {
	const tam = mkdtempSync(join(tmpdir(), "vk10-khong-doi-"));
	const cay = join(tam, "crm");
	git(["worktree", "add", "--detach", "--quiet", cay, dich]);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(env, join(cay, ".env"));
	for (const [buoc, thuMuc] of [
		[["install", "--frozen-lockfile", "--silent"], cay],
		[["run", "db:generate"], join(cay, "packages", "db")],
	]) {
		const r = spawnSync("bun", buoc, { cwd: thuMuc, stdio: "ignore" });
		if (r.status !== 0)
			throw new Error(`khong dung duoc cay nen: bun ${buoc.join(" ")}`);
	}
	return { tam, cay };
}

function donCay({ tam, cay }) {
	spawnSync("git", ["worktree", "remove", "--force", cay], { cwd: GOC });
	rmSync(tam, { recursive: true, force: true });
	spawnSync("git", ["worktree", "prune"], { cwd: GOC });
}

function buocChay(chi) {
	const cauHinh = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const tatCa = evalMay(cauHinh);
	const sai = [];
	for (const m of tatCa.filter((x) => THUOC_THEO_VONG[x.ten]))
		console.log(`THUOC THEO VONG ${m.ten}: ${THUOC_THEO_VONG[m.ten]}`);
	const muc = tatCa.filter(
		(x) => !THUOC_THEO_VONG[x.ten] && (!chi || chi.has(x.ten)),
	);
	console.log(
		`chay ${muc.length} eval qua ${new Set(muc.map((m) => m.khoa)).size} lenh rieng`,
	);
	const daChayCay = new Map();
	const hong = [];
	for (const m of muc) {
		const ma = chay(m, GOC, daChayCay);
		if (ma === m.kyVong) console.log(`HO SO ${m.ten}: cay ${ma}`);
		else hong.push({ ...m, ma });
	}
	if (hong.length === 0) return sai;
	const nen = dungCay(NHANH_GOC);
	try {
		const daChayNen = new Map();
		for (const m of hong) {
			const maNen = chay(m, nen.cay, daChayNen);
			if (maNen === m.kyVong)
				sai.push(`SAI AC-11: ${m.ten} cay ${m.ma} · nen ${maNen}`);
			else console.log(`DO SAN TREN NEN ${m.ten}: cay ${m.ma} · nen ${maNen}`);
		}
	} finally {
		donCay(nen);
	}
	return sai;
}

function inTheoHoSo(sai) {
	for (const slug of DANH_SACH) {
		const cua = sai.filter((s) =>
			new RegExp(`^SAI AC-11: (?:[\\w,-]*,)?${slug}[#,]`).test(s),
		);
		if (cua.length === 0) console.log(`GIU ${slug}`);
	}
	for (const s of sai) console.log(s);
}

function chieuDoNghi() {
	const tam = mkdtempSync(join(tmpdir(), "vk10-khong-doi-do-"));
	const sao = join(tam, "crm");
	try {
		git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
		const tep = join(sao, "_acceptance", CHIEU_DO_HO_SO, "evals.yaml");
		const tho = readFileSync(tep, "utf8");
		const muc = evalsCua(CHIEU_DO_HO_SO, sao).find(
			(e) => !nghi(e) && EXECUTOR_MAY.has(chu(e.executor)),
		);
		if (!muc)
			throw new Error(`chieu do: ${CHIEU_DO_HO_SO} khong con eval chay`);
		const dau = `  - id: ${muc.id}\n`;
		if (!tho.includes(dau))
			throw new Error(`chieu do: khong thay ${dau.trim()}`);
		writeFileSync(tep, tho.replace(dau, `${dau}    status: not-run\n`));
		const coSo = git(["merge-base", "HEAD", NHANH_GOC], sao);
		const ghim = `SAI AC-11: ${CHIEU_DO_HO_SO}#${muc.id} nghi khong co chu`;
		const sai = buocNghi(sao, coSo);
		for (const s of sai) console.log(s);
		const bat = sai.includes(ghim);
		console.log(
			`CHIEU DO nghi: ${bat ? "bat duoc" : "KHONG bat duoc"} «${ghim}»`,
		);
		return bat;
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", sao], { cwd: GOC });
		rmSync(tam, { recursive: true, force: true });
		spawnSync("git", ["worktree", "prune"], { cwd: GOC });
	}
}

function chieuDoLot() {
	const ghim = `SAI AC-11: lot ${CHIEU_DO_LOT}`;
	const sai = buocQuet(
		GOC,
		DANH_SACH.filter((s) => s !== CHIEU_DO_LOT),
	);
	for (const s of sai) console.log(s);
	const bat = sai.includes(ghim);
	console.log(`CHIEU DO lot: ${bat ? "bat duoc" : "KHONG bat duoc"} «${ghim}»`);
	return bat;
}

function chinh() {
	if (process.argv.includes("--chieu-do")) {
		const nghiBat = chieuDoNghi();
		const lotBat = chieuDoLot();
		console.log(
			`KET LUAN chieu do: ${nghiBat && lotBat ? "ca hai bat duoc" : "CO CHIEU KHONG BAT"}`,
		);
		return nghiBat && lotBat ? MA_DO : 0;
	}
	const coSo = git(["merge-base", "HEAD", NHANH_GOC]);
	console.log(`nen ${coSo.slice(0, 9)} (${NHANH_GOC})`);
	const sai = [
		...buocQuet(GOC, DANH_SACH),
		...buocNghi(GOC, coSo),
		...buocDoiThuoc(GOC, coSo),
	];
	if (!process.argv.includes("--chi-quet")) {
		const viTri = process.argv.indexOf("--chi");
		const chi =
			viTri < 0
				? null
				: new Set((process.argv[viTri + 1] ?? "").split(",").filter(Boolean));
		sai.push(...buocChay(chi));
	}
	inTheoHoSo(sai);
	console.log(
		`KET LUAN khong-doi-hinh: ${sai.length === 0 ? "dat" : `${sai.length} SAI`}`,
	);
	return sai.length === 0 ? 0 : MA_DO;
}

try {
	process.exit(chinh());
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
