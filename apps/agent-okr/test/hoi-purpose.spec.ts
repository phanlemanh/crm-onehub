import { describe, expect, test } from "bun:test";
import type { BanNhap } from "@crm/validation/okr-cuoc-soan";
import type { NopTraLoiInput } from "@crm/validation/okr-tra-loi";
import type { docOkr as docOkrTheoQuyen, LocTim } from "../agent/lib/hoi-doc";
import type { NguCanhPhien } from "../agent/lib/phien";

process.env.DATABASE_URL =
	"postgresql://khong-ai:khong@127.0.0.1:1/khong_co_kho";

const { TRO_LY_OKR_HOI, TRO_LY_OKR_SOAN } = await import("../agent/lib/config");
const timOkr = (await import("../agent/tools/tim_okr")).default;
const docOkr = (await import("../agent/tools/doc_okr")).default;
const nopTraLoi = (await import("../agent/tools/nop_tra_loi")).default;
const nopBanNhap = (await import("../agent/tools/nop_ban_nhap")).default;

type GoiCongCu<DauVao> = {
	execute: (input: DauVao, ctx: NguCanhPhien) => Promise<unknown>;
};

const CONG_CU = {
	tim_okr: (c: NguCanhPhien) =>
		(timOkr as unknown as GoiCongCu<LocTim>).execute({}, c),
	doc_okr: (c: NguCanhPhien) =>
		(
			docOkr as unknown as GoiCongCu<Parameters<typeof docOkrTheoQuyen>[1]>
		).execute({ loai: "objective", id: "mt-1" }, c),
	nop_tra_loi: (c: NguCanhPhien) =>
		(nopTraLoi as unknown as GoiCongCu<NopTraLoiInput>).execute(
			{ loai: "khong-biet", cauHoi: "KR nào trượt?" },
			c,
		),
	nop_ban_nhap: (c: NguCanhPhien) =>
		(nopBanNhap as unknown as GoiCongCu<BanNhap>).execute({ mucTieu: [] }, c),
} as const;

type Ten = keyof typeof CONG_CU;

const PURPOSE = [
	{
		ten: "okr-soan",
		attrs: { purpose: "okr-soan", cuocSoanId: "cuoc-soan-1", vai: "member" },
	},
	{
		ten: "okr-hoi",
		attrs: { purpose: "okr-hoi", cuocHoiId: "cuoc-hoi-1", vai: "member" },
	},
	{ ten: "la", attrs: { purpose: "zalo", vai: "member" } },
] as const;

const DUNG = {
	"okr-soan": ["nop_ban_nhap"],
	"okr-hoi": ["tim_okr", "doc_okr", "nop_tra_loi"],
	la: [],
} as const;

const ctx = (attributes: Record<string, string>): NguCanhPhien => ({
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
		? expect.objectContaining({
				ketQua: "tu-choi",
				lyDo: TRO_LY_OKR_SOAN.tuChoi.saiMucDich,
			})
		: { ok: false, reason: TRO_LY_OKR_HOI.tuChoi.saiMucDich };

describe("hdo purpose", () => {
	let so = 0;
	for (const p of PURPOSE) {
		for (const ten of Object.keys(CONG_CU) as Ten[]) {
			const dung = DUNG[p.ten].some((t) => t === ten);
			test(`${p.ten} x ${ten}: ${dung ? "qua cong purpose" : "tu choi, khong cham kho"}`, async () => {
				let ra: unknown;
				let chamKho = false;
				try {
					ra = await CONG_CU[ten](ctx(p.attrs));
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
