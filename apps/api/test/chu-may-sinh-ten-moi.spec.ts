import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSoLieuHoiY } from "@crm/validation/okr-hoi-y";
import {
	dongLoiTenCu,
	type MucChu,
	soatTenCu,
} from "@crm/validation/ten-cu-okr";
import { z } from "zod";
import { OKR } from "../src/okr/okr-config";

const GOC = join(import.meta.dir, "..", "..", "..");
const NGUON = "thongDiep";
const THAM_SO_MAU: readonly unknown[] = [2, "X", ["X"], { ten: "X" }];

const kiemKe = z.object({
	moc: z.string(),
	muc: z.array(
		z.object({
			tep: z.string(),
			dong: z.number(),
			khai_niem: z.enum(["gop-vao", "lay-y-kien", "cap", "goc"]),
			cu: z.string(),
			xu_ly: z.enum(["doi", "giu"]),
		}),
	),
});

const BANG_GOP_VAO = {
	krDangLaDich:
		"KR này đang có mục tiêu góp vào — gỡ chỗ góp vào trước khi xoá.",
	"hienThi.conCanChinh":
		"Mục tiêu còn 2 chỗ góp vào — gỡ hết, cả chỗ nó góp vào lẫn mục tiêu góp vào nó, rồi mới đặt mức giới hạn.",
	"canChinh.cungCap": "Chỉ góp vào được mục tiêu hoặc KR ở cấp cao hơn.",
	"canChinh.chinhNo": "Mục tiêu không góp vào chính nó được.",
	"canChinh.chuaCongBo": "Chỗ góp vào phải đã công bố.",
	"canChinh.khongCo": "Không có chỗ góp vào nào mang mã 2.",
	"canChinh.gioiHanKhongCanChinh":
		"Mục tiêu ở mức giới hạn không góp vào mục tiêu khác được, cũng không nhận mục tiêu nào góp vào.",
} satisfies Record<string, string>;

const LAN_LAY_Y_KIEN = [
	"hoiY.chiQuanTri",
	"hoiY.nguoiChonDaGop",
	"hoiY.daCoHoiY",
	"hoiY.chiKhiDangMo",
	"hoiY.daCongBo",
	"hoiY.khongCoHoiY",
	"hoiY.hetHan",
	"hoiY.nguoiChonKhongGop",
	"hoiY.chiNguoiChon",
	"hoiY.chuaHetHan",
	"hoiY.yKhacHoiY",
	"hoiY.congBoChuaHetHan",
	"hoiY.conHoiYChuaCongBo",
	"hoiY.chuaCongBo",
	"xoa.lyDo.muc-tieu.chuDeHoiY",
];

const ONEHUB_RIENG = /\bOneHub\b(?! Center)/;

type CauMau = (...a: never[]) => string;
type La = string | CauMau | { readonly [k: string]: La };
const chuoi = z.string();

function goiMau(f: CauMau, khoa: string): string {
	const goi = f as (...a: unknown[]) => string;
	for (const mau of THAM_SO_MAU) {
		try {
			return chuoi.parse(goi(...Array.from({ length: f.length }, () => mau)));
		} catch {}
	}
	throw new Error(`cmst: khong goi duoc cau ${khoa} voi tham so mau`);
}

function laThongDiep(goc: La, tien = ""): MucChu[] {
	if (goc instanceof Function)
		return [{ nguon: NGUON, khoa: tien, chu: goiMau(goc, tien) }];
	const la = chuoi.safeParse(goc);
	if (la.success) return [{ nguon: NGUON, khoa: tien, chu: la.data }];
	return Object.entries(goc).flatMap(([k, v]) =>
		laThongDiep(v, tien ? `${tien}.${k}` : k),
	);
}

const LA = laThongDiep(OKR.thongDiep);
const chuCua = (khoa: string) => {
	const la = LA.find((m) => m.khoa === khoa);
	if (!la) throw new Error(`cmst: khong co khoa ${khoa}`);
	return la.chu;
};

const docKiemKe = () =>
	kiemKe.parse(
		JSON.parse(
			readFileSync(
				join(GOC, "_acceptance/chu-may-sinh-ten-moi/kiem-ke.json"),
				"utf8",
			),
		),
	);

describe("cmst-gop-vao", () => {
	test("khong cau bao loi nao con «căn chỉnh»", () => {
		const loi = soatTenCu(LA)
			.filter((l) => l.cum === "căn chỉnh")
			.map((l) => `cmst: ${l.khoa} con can chinh`);
		expect(loi).toEqual([]);
	});

	test("bay cau kiem ke doc dung bang thay chu", () => {
		const sai = Object.entries(BANG_GOP_VAO).flatMap(([khoa, mong]) => {
			const co = chuCua(khoa);
			return co === mong ? [] : [`cmst: ${khoa} ${co}`];
		});
		expect(sai).toEqual([]);
	});

	test("loi khong co dich cua okr.service noi cho gop vao", () => {
		const nguon = readFileSync(
			join(GOC, "apps/api/src/okr/okr.service.ts"),
			"utf8",
		);
		expect(
			nguon.includes("Căn chỉnh ${") || !nguon.includes("Chỗ góp vào ${")
				? ["cmst: okr.service loi khong co dich"]
				: [],
		).toEqual([]);
	});

	test("bo duyet di du la va bat duoc la gia", () => {
		const soDongCauHinh = docKiemKe().muc.filter(
			(m) =>
				m.tep === "apps/api/src/okr/okr-config.ts" && m.khai_niem !== "goc",
		).length;
		expect(
			LA.length >= soDongCauHinh
				? []
				: [`cmst: duyet sot la ${LA.length} < ${soDongCauHinh}`],
		).toEqual([]);
		const gia = {
			...OKR.thongDiep,
			canChinh: { ...OKR.thongDiep.canChinh, chinhNo: () => "Không Căn chỉnh" },
		};
		expect(
			soatTenCu(laThongDiep(gia))
				.filter((l) => l.khoa === "canChinh.chinhNo")
				.map(dongLoiTenCu),
		).toEqual(["thongDiep#canChinh.chinhNo: căn chỉnh"]);
	});
});

describe("cmst-lay-y-kien", () => {
	test("khong cau nao cua lay y kien con «hỏi ý»", () => {
		const nhom = LA.filter(
			(m) => m.khoa.startsWith("hoiY.") || m.khoa.includes("chuDeHoiY"),
		);
		expect(nhom.length).toBeGreaterThan(LAN_LAY_Y_KIEN.length);
		const loi = soatTenCu(nhom)
			.filter((l) => l.cum === "hỏi ý")
			.map((l) => `cmst: ${l.khoa} con hoi y`);
		expect(loi).toEqual([]);
	});

	test("cau noi ve ca lan dung «lần lấy ý kiến»", () => {
		const thieu = LAN_LAY_Y_KIEN.filter(
			(k) => !chuCua(k).toLocaleLowerCase("vi").includes("lần lấy ý kiến"),
		).map((k) => `cmst: ${k} thieu lan lay y kien`);
		expect(thieu).toEqual([]);
	});

	test("loi doc con so cua goi validation noi lan lay y kien", () => {
		let thongDiep = "";
		try {
			parseSoLieuHoiY({ hong: true, soLieu: 1 });
		} catch (e) {
			thongDiep = e instanceof Error ? e.message : String(e);
		}
		expect(
			thongDiep.includes("lần lấy ý kiến") && !/hỏi ý/i.test(thongDiep)
				? []
				: [`cmst: validation ${thongDiep}`],
		).toEqual([]);
	});

	test("bo duyet bat duoc la gia va ma hoiY giu nguyen", () => {
		const gia = {
			...OKR.thongDiep,
			hoiY: { ...OKR.thongDiep.hoiY, daCongBo: "Lần Hỏi ý này đã công bố." },
		};
		expect(
			soatTenCu(laThongDiep(gia))
				.filter((l) => l.khoa === "hoiY.daCongBo")
				.map(dongLoiTenCu),
		).toEqual(["thongDiep#hoiY.daCongBo: hỏi ý"]);
		const router = readFileSync(
			join(GOC, "apps/api/src/okr/okr.router.ts"),
			"utf8",
		);
		expect(router.includes("moHoiY(")).toBe(true);
		expect(router.includes('"/okr/hoi-y"')).toBe(true);
	});
});

describe("cmst-cap", () => {
	test("cap cua don vi goc la «cấp Công ty»", () => {
		const cap: [string, string][] = [
			["hoiY.congBoVuotTran", OKR.thongDiep.hoiY.congBoVuotTran(5, 6)],
			["duyet.khongCanDuyet", OKR.thongDiep.duyet.khongCanDuyet],
		];
		const sai = cap
			.filter(([, chu]) => !chu.includes("cấp Công ty"))
			.map(([k]) => `cmst: cap ${k}`);
		expect(sai).toEqual([]);
	});

	test("khong cau nao con OneHub dung rieng", () => {
		expect(
			LA.filter((m) => ONEHUB_RIENG.test(m.chu)).map(
				(m) => `cmst: ${m.khoa} con OneHub`,
			),
		).toEqual([]);
		expect(ONEHUB_RIENG.test("Thành viên của OneHub Center")).toBe(false);
		expect(ONEHUB_RIENG.test("mục tiêu cấp OneHub")).toBe(true);
	});
});
