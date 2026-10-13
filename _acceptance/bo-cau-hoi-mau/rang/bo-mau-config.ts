import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dir, "..", "..", "..");
const HO_SO = join(GOC, "_acceptance", "bo-cau-hoi-mau");
const TRO_LY_DOC_KHO = join(GOC, "_acceptance", "tro-ly-doc-kho");

export const BO_MAU = {
	duong: {
		goc: GOC,
		hoSo: HO_SO,
		bo: join(HO_SO, "bo-mau.json"),
		trangMau: join(TRO_LY_DOC_KHO, "bo-do", "trang-mau"),
		evidence: join(HO_SO, "evidence"),
		chayGoc: join(GOC, ".acceptance-runs", "bo-cau-hoi-mau"),
		cham: join(TRO_LY_DOC_KHO, "rang", "cham-bo-do.ts"),
		troLy: join(GOC, "apps", "agent", "agent"),
	},
	nhanBo: "mau",
	moDauNguon: "Bộ mẫu giả",
	maCau: /^m\d{2}$/,
	maCauBo: "*bo*",
	tongCau: 50,
	ganTrangS6: 4,
	thanhPhan: {
		"S1/chuan": 15,
		"S2/chuan": 5,
		"S3/chuan": 8,
		"S6/chuan": 8,
		"S7/khong-dau": 2,
		"S7/viet-tat": 2,
		"S7/sai-chinh-ta": 2,
		"S7/tron-anh": 2,
		"S7/tin-zalo": 2,
		"ngoai-kho/chuan": 4,
	},
	nhomCuaTang: {
		S1: { nhom: "co-trang" },
		S2: { nhom: "co-trang", kho: "hai-trang" },
		S3: { nhom: "co-trang", kho: "nguong-ngoai-le" },
		S6: { nhom: "khong-co" },
		S7: { nhom: "khong-dau" },
		"ngoai-kho": { nhom: "khong-phai-quy-dinh" },
	},
	tangCoTrang: ["S1", "S2", "S3", "S7"],
	tangGocBienThe: ["S1", "S3"],
	nhomToiThieuS2: 2,
	mauRiengTu: {
		"dien-thoai": /(?:\+84|\b0)[\s.]?\d{2,3}[\s.]?\d{3}[\s.]?\d{3,4}\b/u,
		email: /[\w.+-]+@[\w-]+\.[\w.]+/u,
		"so-hop-dong": /(?:\bHĐ\s*(?:số\s*)?|hợp đồng\s+số\s*)[\w/-]*\d/iu,
	},
	bangChung: {
		baoCao: "do-bo-mau.md",
		tungCau: "cham-tung-cau.jsonl",
		traLoi: "cham-bo-do-mau.md",
		mocBang: { mo: "<!-- bang-do -->", dong: "<!-- /bang-do -->" },
	},
	bien: {
		lenhCham: "BCM_LENH_CHAM",
		evidence: "BCM_EVIDENCE",
		bo: "BCM_BO",
		chay: "BCM_CHAY",
		chamGiaCa: "CHAM_GIA_CA",
		chamGiaDir: "CHAM_GIA_DIR",
	},
} as const;
