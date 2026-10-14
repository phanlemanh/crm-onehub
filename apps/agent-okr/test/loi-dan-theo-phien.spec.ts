import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import loiDanHoi from "../agent/instructions/dan-hoi";
import loiDanSoan from "../agent/instructions/dan-soan";
import { LOI_DAN_SOAN } from "../agent/lib/loi-dan-soan";

type ChayPhien = (
	event: { type: "session.started" },
	ctx: unknown,
) => Promise<{ markdown?: string } | null> | { markdown?: string } | null;

const chay = (mod: unknown, purpose: string) => {
	const ham = (mod as { events: { "session.started": ChayPhien } }).events[
		"session.started"
	];
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
								? { purpose, cuocSoanId: "cuoc-1", vai: "member" }
								: { purpose, cuocHoiId: "cuoc-1", vai: "member" },
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
});
