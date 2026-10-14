import { describe, expect, test } from "bun:test";

process.env.DATABASE_URL = "postgresql://khong-ai:khong@127.0.0.1:1/khong_co_kho";

const { TRO_LY_OKR_HOI, TRO_LY_OKR_SOAN } = await import("../agent/lib/config");
const CONG_CU = {
	tim_okr: (await import("../agent/tools/tim_okr")).default,
	doc_okr: (await import("../agent/tools/doc_okr")).default,
	nop_tra_loi: (await import("../agent/tools/nop_tra_loi")).default,
	nop_ban_nhap: (await import("../agent/tools/nop_ban_nhap")).default,
} as const;

type Ten = keyof typeof CONG_CU;
type CongCu = { execute: (input: unknown, ctx: unknown) => Promise<unknown> };

const DAU_VAO: Record<Ten, unknown> = {
	tim_okr: {},
	doc_okr: { loai: "objective", id: "mt-1" },
	nop_tra_loi: { loai: "khong-biet", cauHoi: "KR nào trượt?" },
	nop_ban_nhap: { mucTieu: [] },
};

const PURPOSE = [
	{ ten: "okr-soan", attrs: { purpose: "okr-soan", cuocSoanId: "cuoc-soan-1", vai: "member" } },
	{ ten: "okr-hoi", attrs: { purpose: "okr-hoi", cuocHoiId: "cuoc-hoi-1", vai: "member" } },
	{ ten: "la", attrs: { purpose: "zalo", vai: "member" } },
] as const;

const DUNG: Record<string, readonly Ten[]> = {
	"okr-soan": ["nop_ban_nhap"],
	"okr-hoi": ["tim_okr", "doc_okr", "nop_tra_loi"],
	la: [],
};

const ctx = (attributes: Record<string, string>) => ({
	session: {
		id: "phien-purpose",
		auth: {
			initiator: {
				authenticator: "crm-okr-cua",
				principalId: "nguoi-1",
				principalType: "user",
				attributes,
			},
			current: null,
		},
	},
});

const hangTuChoi = (ten: Ten): unknown =>
	ten === "nop_ban_nhap"
		? expect.objectContaining({ ketQua: "tu-choi", lyDo: TRO_LY_OKR_SOAN.tuChoi.saiMucDich })
		: { ok: false, reason: TRO_LY_OKR_HOI.tuChoi.saiMucDich };

describe("hdo purpose", () => {
	let so = 0;
	for (const p of PURPOSE) {
		for (const ten of Object.keys(CONG_CU) as Ten[]) {
			const dung = DUNG[p.ten]?.includes(ten) ?? false;
			test(`${p.ten} x ${ten}: ${dung ? "qua cong purpose" : "tu choi, khong cham kho"}`, async () => {
				const cong = CONG_CU[ten] as unknown as CongCu;
				let ra: unknown;
				let chamKho = false;
				try {
					ra = await cong.execute(DAU_VAO[ten], ctx(p.attrs));
				} catch {
					chamKho = true;
				}
				if (dung) {
					expect(chamKho ? null : ra).not.toEqual(hangTuChoi(ten));
				} else {
					expect(chamKho).toBe(false);
					expect(ra).toEqual(hangTuChoi(ten));
				}
				so++;
			});
		}
	}
	test("ma tran 12 o", () => {
		expect(so).toBe(12);
	});
});
