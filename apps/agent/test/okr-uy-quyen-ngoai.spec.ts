import { describe, expect, test } from "bun:test";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import { SUBAGENT_TRO_LY_OKR } from "../agent/lib/okr/uy-quyen";
import {
	SESSION_PURPOSES,
	type SessionPurpose,
} from "../agent/lib/session-purpose";
import ngoai from "../agent/tools/tro-ly-okr-ngoai";
import {
	type CongCuGia,
	type GiaiCongCu,
	phienAudit,
} from "./support/eve-kieu";

async function giai(
	purpose: SessionPurpose,
): Promise<Record<string, CongCuGia> | null> {
	const moc = ngoai.events["step.started"] as unknown as GiaiCongCu;
	return (await moc({}, phienAudit(`ses-ngoai-${purpose}`, purpose))) ?? null;
}

describe("tro-ly-okr-ngoai", () => {
	test("ma trận viết trước: tám purpose, chỉ okr giữ subagent thật", async () => {
		let chay = 0;
		for (const purpose of SESSION_PURPOSES) {
			const congCu = await giai(purpose);
			chay++;
			if (purpose === "okr") {
				if (congCu !== null) throw new Error("phien okr bi de tro_ly_okr");
				continue;
			}
			const ten = Object.keys(congCu ?? {});
			if (ten.length !== 1 || ten[0] !== SUBAGENT_TRO_LY_OKR)
				throw new Error(`${purpose}: khong de tro_ly_okr`);
			const ket = (await congCu?.[SUBAGENT_TRO_LY_OKR]?.execute(
				{},
				phienAudit(`ses-ngoai-${purpose}`, purpose),
			)) as { ok: boolean; reason: string };
			expect(ket.ok).toBe(false);
			expect(ket.reason).toBe(TRO_LY_OKR.ngoaiPhien.lyDo);
		}
		expect(chay).toBe(8);
		expect(SESSION_PURPOSES.length).toBe(chay);
	});
});
