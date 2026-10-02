import { afterEach, describe, expect, test } from "bun:test";
import { troLyTomTatPhanHoiInput } from "@crm/validation/okr-tom-tat";
import {
	bam,
	cho,
	D_TEN,
	dat,
	datMacDinh,
	dongCua,
	dongHet,
	goiCua,
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
const { KhoiTomTat } = await import("@/app/(app)/[slug]/okr/khoi-tom-tat");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
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

const t = okrToanCanhMessages("vi").tomTat;

const NGUON = {
	id: "n-1",
	keyResultId: "kr-1",
	krTen: "Doanh thu hợp đồng mới",
	mucTieuId: "mt-1",
	mucTieuTen: "Tăng trưởng miền Bắc",
	ngay: "2026-10-12",
	giaTri: 6,
	donVi: "tỷ",
	tuTin: "vua",
	ghiChu: "",
} as const;

function datTomTat(): void {
	datMacDinh([]);
	dat("okr.troLyTomTat", () => ({
		ban: {
			id: "tt-1",
			tuan: "2026-10-12",
			soLanCapNhat: 3,
			cau: [{ vanBan: "Doanh thu đạt nửa đích.", nguon: [NGUON] }],
			phanHoiCuaToi: null,
		},
		dangSoan: false,
		chuaCapNhat: false,
	}));
	dat("okr.troLyTomTatPhanHoi", () => ({ ok: true }));
}

function vung(): HTMLElement {
	const v = document.querySelector<HTMLElement>("[data-phan-hoi]");
	if (!v) throw new Error("khong thay vung phan hoi");
	return v;
}

function nutPhanHoi(nhan: string): HTMLElement {
	const nut = [
		...vung().querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]'),
	].find((b) => b.textContent?.trim() === nhan);
	if (!nut) throw new Error(`khong thay nut ${nhan}`);
	return nut;
}

describe("tom-tat", () => {
	test("tom-tat: khối tóm tắt tuần dùng AiFeedback, giữ chữ, gửi đúng", async () => {
		datTomTat();
		await mo(<KhoiTomTat cycleId="q4" departmentId="pb-1" />);
		await cho(() => document.querySelector("[data-phan-hoi]") !== null, "vung phan hoi");
		const v = vung();
		expect(v.querySelector('[data-slot="ai-feedback"]')).not.toBeNull();
		expect(v.querySelectorAll('[data-slot="toggle-group"]').length).toBe(1);
		expect(v.querySelectorAll('[role="status"]').length).toBe(1);
		expect(v.querySelector('[data-slot="toggle-group"]')?.getAttribute("aria-label")).toBe(t.phanHoiNhom);
		expect(nutPhanHoi(t.huuIch)).toBeDefined();
		expect(nutPhanHoi(t.khongHuuIch)).toBeDefined();
		await bam(nutPhanHoi(t.huuIch));
		await cho(() => goiCua("okr.troLyTomTatPhanHoi").length === 1, "da gui");
		troLyTomTatPhanHoiInput.parse(goiCua("okr.troLyTomTatPhanHoi")[0]?.dauVao);
		await cho(() => vung().getAttribute("data-phan-hoi") === "huu-ich", "da chon");
		await cho(
			() => vung().querySelector('[role="status"]')?.textContent === t.daGhi,
			"chu cam on",
		);
		if (vung().querySelector('[role="status"]')?.textContent !== t.daGhi) {
			throw new Error("chu cam on doi");
		}
	});

	test("tom-tat: gửi lỗi thì lựa chọn lùi về trước", async () => {
		datTomTat();
		dat("okr.troLyTomTatPhanHoi", () => {
			throw new Error("hong");
		});
		await mo(<KhoiTomTat cycleId="q4" departmentId="pb-1" />);
		await cho(() => document.querySelector("[data-phan-hoi]") !== null, "vung phan hoi");
		await bam(nutPhanHoi(t.khongHuuIch));
		await cho(() => goiCua("okr.troLyTomTatPhanHoi").length === 1, "da gui");
		await cho(() => vung().getAttribute("data-phan-hoi") === "", "lui ve");
		if (nutPhanHoi(t.khongHuuIch).getAttribute("data-state") === "on") {
			throw new Error("khong lui khi loi");
		}
	});
});
