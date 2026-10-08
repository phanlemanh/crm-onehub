import { afterEach, describe, expect, test } from "bun:test";
import { useState } from "react";
import { factDecisionInput } from "../../api/src/contacts/contacts.contracts";
import {
	bam,
	cho,
	dat,
	datMacDinh,
	dongHet,
	goiCua,
	mo,
	nut,
	nutCo,
} from "./khung-gop-y";

const { FactSuggestion } = await import("@/components/crm/facts");
type ContactFact = import("@/lib/contact-facts").ContactFact;
type FactReceipt = import("@/lib/contact-facts").FactReceipt;

afterEach(dongHet);

const FACT: ContactFact = {
	id: "fact-1",
	field: "title",
	value: "Giám đốc kinh doanh miền Bắc",
	score: 0.62,
	band: "POSSIBLE",
	evidence: [
		{ kind: "profile", detail: "Hồ sơ LinkedIn ghi chức danh này" },
		{ kind: "email", detail: "Chữ ký email tháng 9" },
	],
	method: "agent",
	sourceUrl: null,
	status: "PROPOSED",
	observedAt: "2026-09-20T03:00:00.000Z",
};

function TheThongTin() {
	const [receipt, setReceipt] = useState<FactReceipt | undefined>();
	return (
		<FactSuggestion
			fact={FACT}
			contactId="ct-1"
			current="Trưởng phòng"
			truoc={{ value: "Trưởng phòng" }}
			receipt={receipt}
			onReceipt={setReceipt}
		/>
	);
}

async function moThongTin(): Promise<HTMLElement> {
	await mo(<TheThongTin />);
	await cho(
		() => document.querySelector('[data-slot="proposed-change"]') !== null,
		"the thong tin",
	);
	const t = document.querySelector<HTMLElement>(
		'[data-slot="proposed-change"]',
	);
	if (!t) throw new Error("khong thay the thong tin");
	return t;
}

describe("the-gop-y-okr — gợi ý thông tin của Cá nhân", () => {
	test("thong-tin: neo tại chỗ, một nút chính đúng hậu quả, mỗi nút gọi decideFact đúng một lần", async () => {
		for (const [bamNut, quyet] of [
			["Thay giá trị hiện có", "accept"],
			["Bỏ qua", "dismiss"],
		] as const) {
			datMacDinh([]);
			dat("contacts.decideFact", (vao) => ({
				applied: vao?.decision === "accept",
			}));
			const t = await moThongTin();
			expect(t.getAttribute("data-density")).toBe("inline");
			const chinh = t.querySelectorAll('button[data-variant="default"]');
			expect([...chinh].map((b) => b.textContent?.trim())).toEqual([
				"Thay giá trị hiện có",
			]);
			expect(nutCo("Nhận")).toBeNull();
			await bam(nut(bamNut));
			await cho(() => goiCua("contacts.decideFact").length === 1, "goi");
			const vao = factDecisionInput.parse(
				goiCua("contacts.decideFact")[0]?.dauVao,
			);
			expect(vao).toEqual({ factId: FACT.id, decision: quyet });
			await dongHet();
		}
		expect(() =>
			factDecisionInput.parse({ factId: FACT.id, decision: "maybe" }),
		).toThrow();
	});

	test("thong-tin: decideFact lỗi thì hai nút bấm lại được", async () => {
		datMacDinh([]);
		dat("contacts.decideFact", () => {
			throw new Error("Không ghi được");
		});
		await moThongTin();
		await bam(nut("Thay giá trị hiện có"));
		await cho(() => goiCua("contacts.decideFact").length === 1, "da goi");
		await cho(() => !nut("Thay giá trị hiện có").disabled, "nut mo lai");
		expect(nut("Bỏ qua").disabled).toBe(false);
		expect(nutCo("Hoàn tác")).toBeNull();
	});
});
