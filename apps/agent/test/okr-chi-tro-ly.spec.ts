import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import { SESSION_PURPOSES } from "../agent/lib/session-purpose";
import chiTroLy from "../agent/tools/okr-chi-tro-ly";
import {
	type CongCuGia,
	type GiaiCongCu,
	phienAudit,
} from "./support/eve-kieu";

const THU_MUC = resolve(import.meta.dir, "../agent/tools");
const { tuTao, coSan, khongTinhLaCongCu, tuChoi } = TRO_LY_OKR.congCuChan;

function tenTep(): string[] {
	return readdirSync(THU_MUC)
		.filter((f) => f.endsWith(".ts"))
		.map((f) => f.replace(/\.ts$/, ""))
		.sort();
}

async function giai(
	purpose: string,
): Promise<Record<string, CongCuGia> | null> {
	const moc = chiTroLy.events["step.started"] as unknown as GiaiCongCu;
	return (await moc({}, phienAudit("ses-okr-chan", purpose))) ?? null;
}

describe("chan-cong-cu", () => {
	test("mọi tệp tool của gốc đều nằm trong danh sách chặn hoặc danh sách không-phải-tool", () => {
		const khai = [...tuTao, ...khongTinhLaCongCu];
		const la = tenTep().filter((t) => !khai.includes(t));
		expect(la, `tool moi chua chan trong phien okr: ${la.join(", ")}`).toEqual(
			[],
		);
		const thua = khai.filter((t) => !tenTep().includes(t));
		expect(thua, `ten khai khong con tep: ${thua.join(", ")}`).toEqual([]);
	});

	test("phiên okr nhận bản thay cho mọi tool tự viết và tool dựng sẵn, không có tro_ly_okr", async () => {
		const ban = await giai("okr");
		expect(Object.keys(ban ?? {}).sort()).toEqual([...tuTao, ...coSan].sort());
		expect(Object.keys(ban ?? {})).not.toContain("tro_ly_okr");
		for (const [ten, cong] of Object.entries(ban ?? {})) {
			expect(await cong.execute({}, {}), `ban thay ${ten} tu choi`).toEqual({
				ok: false,
				reason: tuChoi,
			});
		}
	});

	test("mọi mục đích khác okr không bị thay", async () => {
		for (const purpose of SESSION_PURPOSES.filter((p) => p !== "okr")) {
			expect(await giai(purpose), `phien ${purpose}`).toBeNull();
		}
	});
});
