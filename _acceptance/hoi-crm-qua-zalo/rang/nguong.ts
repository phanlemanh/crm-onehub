import { parseArgs } from "node:util";
import { db } from "../../../packages/db/src/index.ts";
import { dauNgayVN } from "../../../packages/db/src/onboarding-nhac.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import {
	type ZaloHoiKetQua,
	zaloHoiKetQua,
} from "../../../packages/validation/src/zalo-hoi.ts";

const NGAY_MS = 24 * 60 * 60 * 1000;
const PHAN_VI = { giua: 0.5, cao: 0.95 } as const;
const DA_MO: ZaloHoiKetQua[] = ["dang-hoi", "da-tra-loi", "gui-hong", "loi"];
const DA_TRA: ZaloHoiKetQua[] = ["da-tra-loi", "gui-hong"];
const TU_CHOI: ZaloHoiKetQua[] = [
	"tu-choi-vai",
	"tu-choi-tran-phut",
	"tu-choi-tran-ngay",
	"tu-choi-tran-thang",
];
const TIEN_TO_TU_CHOI = "tu-choi-";
const VAI_CHI_OKR = "okr";
const NGAY = /^\d{4}-\d{2}-\d{2}$/;

type Hang = {
	crmUserId: string;
	ketQua: ZaloHoiKetQua;
	doTreMs: number | null;
	tokenVao: number | null;
	tokenRa: number | null;
};

function dauNgay(ngay: string): Date {
	return dauNgayVN(new Date(`${ngay}T12:00:00+07:00`));
}

function phanVi(so: number[], p: number): number | null {
	if (so.length === 0) return null;
	const xep = [...so].sort((a, b) => a - b);
	const vi = p * (xep.length - 1);
	const duoi = Math.floor(vi);
	const a = xep[duoi] ?? 0;
	const b = xep[Math.ceil(vi)] ?? a;
	return a + (vi - duoi) * (b - a);
}

function giay(ms: number | null): string {
	return ms === null ? "khong-co" : String(Math.round(ms / 100) / 10);
}

async function nguoiKhongQuyen(ids: string[]): Promise<Set<string>> {
	const thanhVien = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID, userId: { in: ids } },
		select: { userId: true, role: true },
	});
	const conQuyen = new Set(
		thanhVien.filter((m) => m.role !== VAI_CHI_OKR).map((m) => m.userId),
	);
	return new Set(ids.filter((id) => !conQuyen.has(id)));
}

export async function doNguong(tu: string, den: string): Promise<string[]> {
	const tho = await db.zaloHoi.findMany({
		where: {
			hoiLuc: {
				gte: dauNgay(tu),
				lt: new Date(dauNgay(den).getTime() + NGAY_MS),
			},
		},
		select: {
			crmUserId: true,
			ketQua: true,
			doTreMs: true,
			tokenVao: true,
			tokenRa: true,
		},
	});
	const hang: Hang[] = tho.map((h) => ({
		...h,
		ketQua: zaloHoiKetQua.parse(h.ketQua),
	}));
	const cau = hang.filter((h) => h.ketQua !== "dang-ban");
	const daMo = cau.filter((h) => DA_MO.includes(h.ketQua));
	const nguoiMo = [...new Set(daMo.map((h) => h.crmUserId))];
	const khongQuyen = await nguoiKhongQuyen(nguoiMo);
	const tre = cau
		.filter((h) => DA_TRA.includes(h.ketQua) && h.doTreMs !== null)
		.map((h) => h.doTreMs ?? 0);
	const dem = (k: ZaloHoiKetQua) => cau.filter((h) => h.ketQua === k).length;
	const tuChoi = TU_CHOI.filter((k) => dem(k) > 0)
		.map((k) => `${k.slice(TIEN_TO_TU_CHOI.length)}=${dem(k)}`)
		.join(" ");
	const tong = (k: "tokenVao" | "tokenRa") =>
		cau.reduce((s, h) => s + (h[k] ?? 0), 0);
	return [
		`so_cau: ${cau.length}`,
		`so_nguoi: ${nguoiMo.length}`,
		`ti_le_tra_loi: ${dem("da-tra-loi")}/${cau.length}`,
		`gui_hong: ${dem("gui-hong")}`,
		`do_tre_p50_s: ${giay(phanVi(tre, PHAN_VI.giua))}`,
		`do_tre_p95_s: ${giay(phanVi(tre, PHAN_VI.cao))}`,
		`tu_choi: ${tuChoi || "khong"}`,
		`nguoi_khong_quyen: ${daMo.filter((h) => khongQuyen.has(h.crmUserId)).length}`,
		`token_vao: ${tong("tokenVao")}`,
		`token_ra: ${tong("tokenRa")}`,
	];
}

if (import.meta.main) {
	const { values } = parseArgs({
		options: { tu: { type: "string" }, den: { type: "string" } },
	});
	if (
		!values.tu ||
		!values.den ||
		!NGAY.test(values.tu) ||
		!NGAY.test(values.den)
	) {
		console.error("dung: bun nguong.ts --tu YYYY-MM-DD --den YYYY-MM-DD");
		process.exit(2);
	}
	try {
		for (const dong of await doNguong(values.tu, values.den)) {
			console.log(dong);
		}
	} finally {
		await db.$disconnect();
	}
}
