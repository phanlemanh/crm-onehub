import { afterEach, describe, expect, mock, test } from "bun:test";
import { useState } from "react";
import { undoFactDecisionInput } from "../../api/src/contacts/contacts.contracts";
import {
	bam,
	cho,
	dat,
	dongHet,
	goiCua,
	mo,
	nut,
	nutCo,
	trangThai,
} from "./khung-gop-y";

mock.module("@/components/crm/agent-panel", () => ({ AgentPanel: () => null }));
mock.module("@/components/crm/timeline/timeline", () => ({
	Timeline: () => null,
}));
mock.module("@/components/crm/website-activity", () => ({
	WebsiteActivity: () => null,
}));

const { FactSuggestion } = await import("@/components/crm/facts");
const { ContactSheet } = await import(
	"@/components/crm/record-sheet/contact-sheet"
);
const { DetailSheet } = await import("@/components/detail-sheet");

type ContactFact = import("@/lib/contact-facts").ContactFact;
type FactReceipt = import("@/lib/contact-facts").FactReceipt;
type FactTruoc = import("@/lib/contact-facts").FactTruoc;

const fact = (id: string, field: string, value: string): ContactFact => ({
	id,
	field,
	value,
	score: 0.9,
	band: "VERIFIED",
	evidence: [{ kind: "profile", detail: "Hồ sơ LinkedIn ghi chức danh này" }],
	method: "agent",
	sourceUrl: null,
	status: "PROPOSED",
	observedAt: "2026-09-18T03:00:00.000Z",
});

const TITLE = fact("f-title", "title", "Giám đốc kinh doanh");
const GITHUB = fact("f-gh", "githubUrl", "https://github.com/ha");

function datLai() {
	trangThai.daGoi = [];
	dat("contacts.decideFact", (vao) => ({
		contactId: "ct-1",
		field: "title",
		applied: vao?.decision === "accept",
	}));
	dat("contacts.undoFactDecision", () => ({
		contactId: "ct-1",
		field: "title",
	}));
}

function GiuBienNhan({
	f,
	current,
	truoc,
}: {
	f: ContactFact;
	current: string | null;
	truoc: FactTruoc;
}) {
	const [receipt, setReceipt] = useState<FactReceipt | undefined>();
	return (
		<FactSuggestion
			fact={f}
			contactId="ct-1"
			current={current}
			truoc={truoc}
			receipt={receipt}
			onReceipt={setReceipt}
		/>
	);
}

const goc = () =>
	document.querySelector<HTMLElement>('[data-slot="proposed-change"]');

const nutChinh = () =>
	document.querySelectorAll<HTMLButtonElement>(
		'[data-slot="proposed-change"] button[data-variant="default"]',
	);

function caNhan(facts: ContactFact[]) {
	return {
		id: "ct-1",
		firstName: "Hà",
		lastName: "Nguyễn",
		email: null,
		phone: null,
		title: "Trưởng phòng",
		linkedinUrl: null,
		twitterUrl: null,
		githubUrl: null,
		imageUrl: null,
		enrichmentStatus: "COMPLETE",
		enrichmentError: null,
		owner: null,
		company: null,
		fields: [],
		queued: false,
		createdAt: "2026-09-01T00:00:00.000Z",
		archivedAt: null,
		brief: null,
		facts,
		relationship: {
			emails: 0,
			threads: 0,
			lastReplyAt: null,
			meetings: 0,
			nextMeeting: null,
			colleagues: [],
		},
		isPrimaryContact: false,
		deals: [],
	};
}

afterEach(dongHet);

describe("kara-ban-ghi-de-xuat", () => {
	test("de-xuat-cho: neo tại chỗ, nút đúng hậu quả, nhãn Kara một lần mỗi nhóm", async () => {
		const ca = [
			{ current: null, nhan: "Thêm vào hồ sơ" },
			{ current: "Trưởng phòng", nhan: "Thay giá trị hiện có" },
		] as const;
		expect(ca.length).toBe(2);
		for (const o of ca) {
			datLai();
			await mo(
				<GiuBienNhan
					f={TITLE}
					current={o.current}
					truoc={{ value: o.current }}
				/>,
			);
			await cho(() => goc() !== null, "de xuat");
			if (goc()?.getAttribute("data-density") !== "inline")
				throw new Error("de-xuat: con khung the");
			expect(nutChinh().length).toBe(1);
			expect(nutChinh()[0]?.textContent?.trim()).toBe(o.nhan);
			expect(nutCo("Bỏ qua")?.getAttribute("data-variant")).not.toBe("default");
			expect(nutCo("Nhận")).toBeNull();
			await dongHet();
		}

		datLai();
		dat("contacts.byId", () => caNhan([TITLE, GITHUB]));
		dat("users.list", () => []);
		dat("onboarding.listTemplates", () => []);
		await mo(
			<DetailSheet open onOpenChange={() => {}}>
				<ContactSheet contactId="ct-1" />
			</DetailSheet>,
			{ searchParams: "?record=contact:ct-1" },
		);
		await cho(() => nutCo("Thay giá trị hiện có") !== null, "ngan ca nhan");
		const nhan = document.querySelectorAll('[data-slot="kara-label"]');
		if (nhan.length !== 1) throw new Error("de-xuat: nhan lap 2 lan");
		expect(nhan[0]?.textContent).toContain("Kara · 2 đề xuất");
		expect(nutCo("Vì sao?", nhan[0] as ParentNode)).not.toBeNull();
	});

	test("nhan-hoan-tac: nhận thu thành biên nhận, Hoàn tác gửi đúng giá trị cũ", async () => {
		const ca = [
			{ current: "Trưởng phòng", truoc: { value: "Trưởng phòng" } },
			{ current: null, truoc: { value: null } },
		] as const;
		for (const o of ca) {
			datLai();
			await mo(<GiuBienNhan f={TITLE} current={o.current} truoc={o.truoc} />);
			await cho(() => nutChinh().length === 1, "nut chinh");
			await bam(nutChinh()[0] as HTMLButtonElement);
			await cho(() => nutCo("Hoàn tác") !== null, "bien nhan");
			expect(goiCua("contacts.decideFact").length).toBe(1);
			expect(document.body.textContent).toContain("Đã thêm theo Kara");

			await bam(nut("Hoàn tác"));
			await cho(() => nutChinh().length === 1, "de xuat hien lai");
			const goi = goiCua("contacts.undoFactDecision");
			expect(goi.length).toBe(1);
			const vao = undoFactDecisionInput.parse(goi[0]?.dauVao);
			if (JSON.stringify(vao.truoc) !== JSON.stringify(o.truoc))
				throw new Error("nhan: truoc sai gia tri");
			expect(vao).toEqual({ factId: TITLE.id, truoc: o.truoc });
			expect(document.activeElement).toBe(nutChinh()[0] ?? null);
			await dongHet();
		}
	});

	test("bo-qua: bỏ qua thu thành biên nhận, Hoàn tác gọi đúng một lần", async () => {
		datLai();
		await mo(
			<GiuBienNhan
				f={TITLE}
				current="Trưởng phòng"
				truoc={{ value: "Trưởng phòng" }}
			/>,
		);
		await cho(() => nutCo("Bỏ qua") !== null, "nut bo qua");
		await bam(nut("Bỏ qua"));
		await cho(() => nutCo("Hoàn tác") !== null, "bien nhan bo qua");
		expect(document.body.textContent).toContain("Đã bỏ qua");
		const quyet = goiCua("contacts.decideFact");
		expect(quyet.map((g) => g.dauVao)).toEqual([
			{ factId: TITLE.id, decision: "dismiss" },
		]);
		await bam(nut("Hoàn tác"));
		await cho(() => nutCo("Bỏ qua") !== null, "de xuat chờ lai");
		expect(goiCua("contacts.undoFactDecision").length).toBe(1);
	});

	test("hoan-tac-loi: trường đã đổi thì biên nhận nói rõ, không còn Hoàn tác", async () => {
		datLai();
		dat("contacts.undoFactDecision", () => {
			throw new Error("The field changed after the suggestion was accepted.");
		});
		await mo(
			<GiuBienNhan
				f={TITLE}
				current="Trưởng phòng"
				truoc={{ value: "Trưởng phòng" }}
			/>,
		);
		await cho(() => nutChinh().length === 1, "nut chinh");
		await bam(nutChinh()[0] as HTMLButtonElement);
		await cho(() => nutCo("Hoàn tác") !== null, "bien nhan");
		await bam(nut("Hoàn tác"));
		await cho(
			() =>
				(document.body.textContent ?? "").includes(
					"Trường này đã đổi sau khi nhận — không hoàn tác được",
				),
			"dong loi",
		);
		if (nutCo("Hoàn tác")) throw new Error("hoan-tac-loi: con nut");
		expect(document.body.textContent).not.toContain("The field changed");
	});
});
