import { afterEach, describe, expect, test } from "bun:test";
import { troLyTomTatPhanHoiInput } from "@crm/validation/okr-tom-tat";
import {
	bam,
	cho,
	dat,
	datMacDinh,
	dongHet,
	goiCua,
	mo,
	nhip,
} from "./khung-gop-y";

const { ProposedChange } = await import("@crm/ui/components/proposed-change");
const { KhoiTomTat } = await import("@/app/(app)/[slug]/okr/khoi-tom-tat");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { messages } = await import("@crm/ui/lib/messages");

afterEach(dongHet);

function kiemThe(goc: Element | null, ten: string): void {
	if (!goc) throw new Error(`khong thay ${ten}`);
	const laThe =
		goc.getAttribute("data-density") === "card" &&
		goc.classList.contains("group/alert") &&
		!goc.classList.contains("group/item");
	if (!laThe) throw new Error(`${ten} doi sang inline`);
}

describe("man-cu", () => {
	test("man-cu: đối chứng — bộ chọn nhận bản thẻ và bắt bản liền dòng", async () => {
		const deXuat = (density: "card" | "inline") => (
			<ProposedChange
				density={density}
				kind="compact"
				value="Giám đốc kinh doanh"
				actions={[
					{ id: "nhan", label: "Nhận", tone: "primary", onClick: () => {} },
				]}
			/>
		);
		datMacDinh([]);
		await mo(deXuat("card"));
		kiemThe(
			document.querySelector('[data-slot="proposed-change"]'),
			"doi chung",
		);
		await dongHet();
		await mo(deXuat("inline"));
		expect(() =>
			kiemThe(
				document.querySelector('[data-slot="proposed-change"]'),
				"doi chung",
			),
		).toThrow("doi chung doi sang inline");
	});
});

const t = okrToanCanhMessages("vi").tomTat;
const phanHoi = messages("vi").aiFeedback;
const CHU_NUT_TRUOC_LUOT = ["Hữu ích", "Không hữu ích"];

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

async function choDen(xong: () => boolean, thongDiep: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(thongDiep);
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
		await cho(
			() => document.querySelector("[data-phan-hoi]") !== null,
			"vung phan hoi",
		);
		const v = vung();
		expect(v.querySelector('[data-slot="ai-feedback"]')).not.toBeNull();
		expect(v.querySelectorAll('[data-slot="toggle-group"]').length).toBe(1);
		expect(v.querySelectorAll('[role="status"]').length).toBe(1);
		expect(
			v.querySelector('[data-slot="toggle-group"]')?.getAttribute("aria-label"),
		).toBe(t.phanHoiNhom);
		expect(
			[...v.querySelectorAll('[data-slot="toggle-group-item"]')].map((b) =>
				b.textContent?.trim(),
			),
		).toEqual(CHU_NUT_TRUOC_LUOT);
		await bam(nutPhanHoi(phanHoi.useful));
		await cho(() => goiCua("okr.troLyTomTatPhanHoi").length === 1, "da gui");
		troLyTomTatPhanHoiInput.parse(goiCua("okr.troLyTomTatPhanHoi")[0]?.dauVao);
		await cho(
			() => vung().getAttribute("data-phan-hoi") === "huu-ich",
			"da chon",
		);
		await choDen(
			() => vung().querySelector('[role="status"]')?.textContent === t.daGhi,
			"chu cam on doi",
		);
	});

	test("tom-tat: gửi lỗi thì lựa chọn lùi về trước", async () => {
		datTomTat();
		dat("okr.troLyTomTatPhanHoi", () => {
			throw new Error("hong");
		});
		await mo(<KhoiTomTat cycleId="q4" departmentId="pb-1" />);
		await cho(
			() => document.querySelector("[data-phan-hoi]") !== null,
			"vung phan hoi",
		);
		await bam(nutPhanHoi(phanHoi.notUseful));
		await cho(() => goiCua("okr.troLyTomTatPhanHoi").length === 1, "da gui");
		await choDen(
			() =>
				vung().getAttribute("data-phan-hoi") === "" &&
				nutPhanHoi(phanHoi.notUseful).getAttribute("data-state") !== "on",
			"khong lui khi loi",
		);
	});
});
