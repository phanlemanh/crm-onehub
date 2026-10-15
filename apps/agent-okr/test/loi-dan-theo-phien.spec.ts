import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import loiDanHoi from "../agent/instructions/dan-hoi";
import loiDanSoan from "../agent/instructions/dan-soan";
import { TRO_LY_OKR_HOI } from "../agent/lib/config";
import { LOI_DAN_SOAN } from "../agent/lib/loi-dan-soan";

type NguCanhBatDau = {
	session: {
		id: string;
		auth: {
			initiator: {
				principalId: string;
				attributes: Record<string, string>;
			};
			current: null;
		};
	};
};

type ChayPhien = (
	event: { type: "session.started" },
	ctx: NguCanhBatDau,
) => Promise<{ markdown?: string } | null> | { markdown?: string } | null;

type LoiDanDong = typeof loiDanHoi;

const chay = (mod: LoiDanDong, purpose: string, vai = "member") => {
	const ham = (mod as unknown as { events: { "session.started": ChayPhien } })
		.events["session.started"];
	return ham(
		{ type: "session.started" },
		{
			session: {
				id: "phien-loi-dan",
				auth: {
					initiator: {
						principalId: "nguoi-1",
						attributes:
							purpose === "okr-soan"
								? { purpose, cuocSoanId: "cuoc-1", vai }
								: { purpose, cuocHoiId: "cuoc-1", vai },
					},
					current: null,
				},
			},
		},
	);
};

const MOC_SOAN = LOI_DAN_SOAN.split("\n")[0] ?? "";

describe("hdo loi dan theo phien", () => {
	test("khong con loi dan tinh nap cho moi phien", () => {
		expect(
			existsSync(join(import.meta.dir, "..", "agent", "instructions.md")),
		).toBe(false);
		expect(MOC_SOAN.length).toBeGreaterThan(10);
	});

	test("okr-soan nap loi dan soan, khong nap loi dan hoi", async () => {
		expect((await chay(loiDanSoan, "okr-soan"))?.markdown).toBe(LOI_DAN_SOAN);
		expect(await chay(loiDanHoi, "okr-soan")).toBeNull();
	});

	test("okr-hoi nap loi dan hoi, khong chu nao cua loi dan soan", async () => {
		expect(await chay(loiDanSoan, "okr-hoi")).toBeNull();
		const hoi = (await chay(loiDanHoi, "okr-hoi"))?.markdown ?? "";
		expect(hoi).toContain("nop_tra_loi");
		expect(hoi).not.toContain(MOC_SOAN);
		expect(hoi).not.toContain("nop_ban_nhap");
	});

	test("okr-hoi: vai vao duoc CRM thi chi duong sang Kara cua CRM; vai chi OKR thi khong", async () => {
		for (const vai of ["owner", "admin", "member"]) {
			const hoi = (await chay(loiDanHoi, "okr-hoi", vai))?.markdown ?? "";
			expect(hoi, vai).toContain(TRO_LY_OKR_HOI.chiDuong.coCrm);
			expect(hoi, vai).not.toContain(TRO_LY_OKR_HOI.chiDuong.chiOkr);
		}
		const okr = (await chay(loiDanHoi, "okr-hoi", "okr"))?.markdown ?? "";
		expect(okr).toContain(TRO_LY_OKR_HOI.chiDuong.chiOkr);
		expect(okr).not.toContain(TRO_LY_OKR_HOI.chiDuong.coCrm);
	});
});
