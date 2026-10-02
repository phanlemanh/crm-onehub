import { afterEach, describe, test } from "bun:test";
import {
	bam,
	cho,
	D_TEN,
	dat,
	datMacDinh,
	dongCua,
	dongHet,
	hopMucTieu,
	MT,
	mo,
	nut,
	nutCo,
} from "./khung-gop-y";

const { HopThoaiMucTieu } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-muc-tieu"
);
const { FactSuggestion } = await import("@/components/crm/facts");
const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");
type ContactFact = import("@/lib/contact-facts").ContactFact;

const g = okrGopYMessages("vi");

afterEach(dongHet);

const FACT: ContactFact = {
	id: "fact-1",
	field: "jobTitle",
	value: "Giám đốc kinh doanh miền Bắc",
	score: 0.62,
	band: "POSSIBLE",
	evidence: [{ kind: "profile", detail: "Hồ sơ LinkedIn ghi chức danh này" }],
	method: "agent",
	sourceUrl: null,
	status: "PROPOSED",
	observedAt: "2026-09-20T03:00:00.000Z",
};

function kiemThe(goc: Element | null, ten: string): void {
	if (!goc) throw new Error(`khong thay ${ten}`);
	const laThe =
		goc.getAttribute("data-density") === "card" &&
		goc.classList.contains("group/alert") &&
		!goc.classList.contains("group/item");
	if (!laThe) throw new Error(`${ten} doi sang inline`);
}

describe("man-cu", () => {
	test("man-cu: cột góp ý OKR vẫn là thẻ", async () => {
		datMacDinh([D_TEN]);
		await mo(
			<HopThoaiMucTieu yeuCau={{ loai: "sua", mucTieu: MT }} dong={() => {}} />,
		);
		await cho(() => hopMucTieu() !== null, "hop Muc tieu mo");
		await cho(() => nutCo(g.nut.nho) !== null, "nut nho gop y");
		await bam(nut(g.nut.nho));
		await cho(() => dongCua(D_TEN.id) !== null, "the viet lai");
		const the = dongCua(D_TEN.id);
		kiemThe(
			the?.closest('[data-slot="proposed-change"]') ?? null,
			"the gop y",
		);
	});

	test("man-cu: thông tin liên hệ vẫn là thẻ", async () => {
		datMacDinh([]);
		dat("contacts.decideFact", () => ({ applied: true }));
		await mo(<FactSuggestion fact={FACT} contactId="ct-1" />);
		await cho(
			() => document.querySelector('[data-slot="proposed-change"]') !== null,
			"the thong tin",
		);
		kiemThe(document.querySelector('[data-slot="proposed-change"]'), "facts");
	});
});
