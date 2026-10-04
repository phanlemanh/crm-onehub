import { afterEach, describe, expect, test } from "bun:test";
import userEvent from "@testing-library/user-event";
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

afterEach(dongHet);

function hangNut(o: ParentNode): { chu: string; kieu: string | null }[] {
	return [...o.querySelectorAll<HTMLButtonElement>("button")].map((b) => ({
		chu: b.textContent?.trim() ?? "",
		kieu: b.getAttribute("data-variant"),
	}));
}

const FACT: ContactFact = {
	id: "fact-1",
	field: "jobTitle",
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

async function moThongTin(): Promise<void> {
	datMacDinh([]);
	dat("contacts.decideFact", (vao) => ({
		applied: vao?.decision === "accept",
	}));
	await mo(<FactSuggestion fact={FACT} contactId="ct-1" />);
	await cho(
		() => document.querySelector('[data-slot="proposed-change"]') !== null,
		"the thong tin",
	);
}

async function caThongTin() {
	await moThongTin();
	const t = document.querySelector<HTMLElement>(
		'[data-slot="proposed-change"]',
	);
	if (!t) throw new Error("khong thay the thong tin");
	expect(t.getAttribute("data-kind")).toBe("compact");
	expect(hangNut(t)).toEqual([
		{ chu: "Nhận", kieu: "default" },
		{ chu: "Bác", kieu: "ghost" },
	]);
}

describe("the-gop-y-okr — gợi ý thông tin của Cá nhân", () => {
	test("thong-tin: thẻ gọn, Nhận chính, Bác mờ, mỗi nút gọi decideFact đúng một lần", async () => {
		await caThongTin();
		const u = userEvent.setup({ document, pointerEventsCheck: 0 });
		await u.click(nut("Nhận"));
		await cho(() => goiCua("contacts.decideFact").length === 1, "goi nhan");
		await cho(() => !nut("Bác").disabled, "het cho");
		await u.click(nut("Bác"));
		await cho(() => goiCua("contacts.decideFact").length === 2, "goi bac");
		const quyet = goiCua("contacts.decideFact").map((g) =>
			factDecisionInput.parse(g.dauVao),
		);
		if (quyet[0]?.decision !== "accept" || quyet[1]?.decision !== "dismiss")
			throw new Error("decideFact sai quyet");
		expect(quyet).toEqual([
			{ factId: FACT.id, decision: "accept" },
			{ factId: FACT.id, decision: "dismiss" },
		]);
		expect(() =>
			factDecisionInput.parse({ factId: FACT.id, decision: "maybe" }),
		).toThrow();
	});

	test("thong-tin: decideFact lỗi thì hai nút bấm lại được", async () => {
		datMacDinh([]);
		dat("contacts.decideFact", () => {
			throw new Error("Không ghi được");
		});
		await mo(<FactSuggestion fact={FACT} contactId="ct-1" />);
		await cho(() => nutCo("Nhận") !== null, "the thong tin");
		await bam(nut("Nhận"));
		await cho(() => goiCua("contacts.decideFact").length === 1, "da goi");
		await cho(() => !nut("Nhận").disabled, "nut mo lai");
		expect(nut("Bác").disabled).toBe(false);
	});
});
