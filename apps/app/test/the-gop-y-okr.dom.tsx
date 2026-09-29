import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { factDecisionInput } from "../../api/src/contacts/contacts.contracts";
import type { DongHien } from "../../api/src/okr/okr.contracts";
import { troLyQuyetInput } from "../../api/src/okr/okr.contracts";
import {
	bam,
	cho,
	cot,
	D_CAN,
	D_HOI_KR,
	D_HOI_MT,
	D_KR,
	D_TEN,
	D_VI_SAO,
	dat,
	datMacDinh,
	dongCua,
	dongHet,
	go,
	goiCua,
	HAI,
	hopKr,
	hopMucTieu,
	KR_1,
	KR_2,
	MT,
	mo,
	nhip,
	nut,
	nutCo,
	phim,
	soHop,
} from "./khung-gop-y";

const { HopThoaiMucTieu } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-muc-tieu"
);
const { HopThoaiKr } = await import("@/app/(app)/[slug]/okr/hop-thoai-kr");
const { FactSuggestion } = await import("@/components/crm/facts");
const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");

const m = okrGopYMessages("vi");

afterEach(dongHet);

type MoHop = { dong: () => number };

async function moHopMucTieu(
	dong: readonly DongHien[],
	chon: { moKr?: (id: string) => void } = {},
): Promise<MoHop> {
	datMacDinh([...dong]);
	let soLanDong = 0;
	await mo(
		<HopThoaiMucTieu
			yeuCau={{ loai: "sua", mucTieu: MT }}
			dong={() => {
				soLanDong += 1;
			}}
			moKr={chon.moKr}
		/>,
	);
	await cho(() => hopMucTieu() !== null, "hop Muc tieu mo");
	return { dong: () => soLanDong };
}

async function moHopKr(dong: readonly DongHien[]): Promise<void> {
	datMacDinh([...dong]);
	await mo(
		<HopThoaiKr
			objectiveId={MT.id}
			mucTieu={MT}
			kr={KR_1}
			chuMacDinh={HAI.id}
			suaDuocCot
			dong={() => {}}
		/>,
	);
	await cho(() => hopKr() !== null, "hop KR mo");
}

async function nhoGopY(dauTien: string): Promise<void> {
	await cho(() => nutCo(m.nut.nho) !== null, "nut nho gop y");
	await bam(nut(m.nut.nho));
	await cho(() => dongCua(dauTien) !== null, `the ${dauTien}`);
}

function the(id: string): HTMLElement {
	const o = dongCua(id);
	if (!o) throw new Error(`khong thay the ${id}`);
	return o;
}

function nutChinh(o: ParentNode): HTMLButtonElement[] {
	return [
		...o.querySelectorAll<HTMLButtonElement>('button[data-variant="default"]'),
	];
}

function hangNut(o: ParentNode): { chu: string; kieu: string | null }[] {
	return [...o.querySelectorAll<HTMLButtonElement>("button")].map((b) => ({
		chu: b.textContent?.trim() ?? "",
		kieu: b.getAttribute("data-variant"),
	}));
}

function oSua(o: ParentNode): HTMLTextAreaElement | null {
	return o.querySelector<HTMLTextAreaElement>(
		'[data-slot="proposed-change-edit"]',
	);
}

function payloadQuyet(): ReturnType<typeof troLyQuyetInput.parse>[] {
	return goiCua("okr.troLyQuyet").map((g) => troLyQuyetInput.parse(g.dauVao));
}

const oTen = () =>
	hopMucTieu()?.querySelector<HTMLInputElement>('input[id$="-ten"]') ?? null;
const oViSao = () =>
	hopMucTieu()?.querySelector<HTMLTextAreaElement>('textarea[id$="-vi-sao"]') ??
	null;
const oTenKr = () =>
	hopKr()?.querySelector<HTMLInputElement>('input[id$="-ten"]') ?? null;

function kiemCoHop(hop: HTMLElement | null, ten: string): void {
	if (hop?.getAttribute("data-size") !== "assist") {
		throw new Error(`co hop ${ten}: ${hop?.getAttribute("data-size")}`);
	}
}

describe("the-gop-y-okr — cỡ hộp", () => {
	test("co-hop: cột đóng không mang assist; cột mở thì cả hai hộp mang assist và chứa cột", async () => {
		await moHopMucTieu([D_TEN]);
		expect(hopMucTieu()?.getAttribute("data-size")).not.toBe("assist");
		await nhoGopY(D_TEN.id);
		kiemCoHop(hopMucTieu(), "muc tieu");
		expect(hopMucTieu()?.contains(cot())).toBe(true);
		await dongHet();

		await moHopKr([D_KR]);
		expect(hopKr()?.getAttribute("data-size")).not.toBe("assist");
		await nhoGopY(D_KR.id);
		kiemCoHop(hopKr(), "kr");
		expect(hopKr()?.contains(cot())).toBe(true);
	});
});

describe("the-gop-y-okr — sửa rồi nhận", () => {
	test("sua-roi-nhan: Nhận bản đã sửa gửi đúng chữ đã gõ, một nút chính trong chế độ sửa", async () => {
		await moHopMucTieu([D_TEN, D_VI_SAO]);
		await nhoGopY(D_TEN.id);
		await bam(nut(m.dong.sua, the(D_TEN.id)));
		const o = oSua(the(D_TEN.id));
		expect(o).not.toBeNull();
		const chinh = nutChinh(the(D_TEN.id));
		expect(chinh.map((b) => b.textContent?.trim())).toEqual([
			m.dong.nhanBanSua,
		]);
		const chuMoi = "Mọi thoả thuận của miền Bắc nằm trong một CRM";
		await go(o, chuMoi);
		await bam(nut(m.dong.nhanBanSua, the(D_TEN.id)));
		await cho(() => goiCua("okr.troLyQuyet").length === 1, "goi quyet");
		expect(payloadQuyet()).toEqual([
			{ deXuatId: D_TEN.id, cach: "sua", giaTri: chuMoi },
		]);
	});

	test("sua-roi-nhan: Huỷ và Esc đưa thẻ về chờ, không gọi thủ tục, hộp vẫn mở", async () => {
		const hop = await moHopMucTieu([D_TEN, D_VI_SAO]);
		await nhoGopY(D_TEN.id);
		await bam(nut(m.dong.sua, the(D_VI_SAO.id)));
		await bam(nut(m.dong.huySua, the(D_VI_SAO.id)));
		expect(oSua(the(D_VI_SAO.id))).toBeNull();
		expect(nutCo(m.dong.nhan, the(D_VI_SAO.id))).not.toBeNull();

		await bam(nut(m.dong.sua, the(D_TEN.id)));
		await phim(oSua(the(D_TEN.id)), "Escape");
		if (hopMucTieu() === null || hop.dong() > 0) throw new Error("esc dong hop");
		expect(oSua(the(D_TEN.id))).toBeNull();
		expect(nutCo(m.dong.nhan, the(D_TEN.id))).not.toBeNull();
		expect(goiCua("okr.troLyQuyet")).toHaveLength(0);
	});
});

describe("the-gop-y-okr — mở KR từ câu hỏi", () => {
	test("mo-kr: câu hỏi gắn KR mở đúng hộp Sửa KR; câu hỏi cấp Mục tiêu chỉ có Bỏ qua", async () => {
		const { ObjectiveSheet } = await import(
			"@/components/crm/record-sheet/objective-sheet"
		);
		const { DetailSheet } = await import("@/components/detail-sheet");
		datMacDinh([D_HOI_KR, D_HOI_MT]);
		dat("okr.comments", () => ({ comments: [], dong: [] }));
		dat("okr.alignmentTargets", () => ({ targets: [] }));
		dat("okr.thanhVien", () => [HAI]);
		dat("workspace.get", () => ({ viewerRole: "member" }));
		await mo(
			<DetailSheet onOpenChange={() => {}} open>
				<ObjectiveSheet objectiveId={MT.id} />
			</DetailSheet>,
		);
		const u = userEvent.setup({ document, pointerEventsCheck: 0 });
		await cho(
			() => document.querySelector('button[aria-label="Thao tác với mục tiêu"]') !== null,
			"nut menu muc tieu",
		);
		const menu = document.querySelector<HTMLButtonElement>(
			'button[aria-label="Thao tác với mục tiêu"]',
		);
		if (!menu) throw new Error("khong thay menu");
		await u.click(menu);
		await nhip(5);
		const muc = [...document.querySelectorAll('[role="menuitem"]')].find(
			(o) => o.textContent?.trim() === "Sửa mục tiêu",
		);
		if (!muc) throw new Error("khong thay muc Sua");
		await u.click(muc);
		await cho(() => hopMucTieu() !== null, "hop muc tieu tu sheet");
		await nhoGopY(D_HOI_KR.id);

		expect(nutCo(m.dong.moKr, the(D_HOI_MT.id))).toBeNull();
		expect(nutCo(m.dong.boQua, the(D_HOI_MT.id))).not.toBeNull();

		await bam(nut(m.dong.moKr, the(D_HOI_KR.id)));
		await cho(() => hopKr() !== null, "hop kr mo");
		expect(hopMucTieu()).toBeNull();
		if (oTenKr()?.value !== KR_2.title) {
			throw new Error(`mo sai kr: ${oTenKr()?.value}`);
		}
	});

	test("mo-kr: khoá Mở KR này kèm lý do khi Mục tiêu còn sửa chưa lưu", async () => {
		let moi = "";
		await moHopMucTieu([D_HOI_KR], { moKr: (id) => (moi = id) });
		await nhoGopY(D_HOI_KR.id);
		await go(oTen(), "Tên mới chưa lưu");
		const b = nut(m.dong.moKr, the(D_HOI_KR.id));
		expect(b.disabled).toBe(true);
		const idLyDo = b.getAttribute("aria-describedby");
		expect(idLyDo ? document.getElementById(idLyDo)?.textContent : "").toBe(
			m.dong.khoaMoKr,
		);
		expect(moi).toBe("");
	});
});

describe("the-gop-y-okr — căn chỉnh", () => {
	test("can-chinh: một nút chính Căn chỉnh, Bác cuối hàng, quyết xong thu gọn như thẻ viết lại", async () => {
		await moHopMucTieu([D_TEN, D_CAN]);
		await nhoGopY(D_CAN.id);
		const chinh = nutChinh(the(D_CAN.id));
		if (chinh.length !== 1 || chinh[0]?.textContent?.trim() !== m.dong.canChinh)
			throw new Error("can chinh khong co nut Can chinh");
		expect(hangNut(the(D_CAN.id)).at(-1)).toEqual({
			chu: m.dong.bac,
			kieu: "ghost",
		});
		await bam(nut(m.dong.canChinh, the(D_CAN.id)));
		await cho(
			() => the(D_CAN.id).getAttribute("data-decided") === "accepted",
			"can chinh da quyet",
		);
		expect(payloadQuyet()).toEqual([{ deXuatId: D_CAN.id, cach: "nhan" }]);
		expect(the(D_CAN.id).textContent).toContain(m.dong.ket.accepted);

		await bam(nut(m.dong.nhan, the(D_TEN.id)));
		await cho(
			() => the(D_TEN.id).getAttribute("data-decided") === "accepted",
			"viet lai da quyet",
		);
		expect(the(D_CAN.id).getAttribute("data-slot")).toBe(
			the(D_TEN.id).getAttribute("data-slot"),
		);
		expect(the(D_CAN.id).querySelectorAll("button")).toHaveLength(0);
	});
});

type CachChi = "re" | "focus";

async function batChi(o: HTMLElement, cach: CachChi): Promise<void> {
	await act(async () => {
		if (cach === "re") {
			o.dispatchEvent(
				new PointerEvent("pointerover", { bubbles: true, relatedTarget: null }),
			);
		} else {
			o.focus();
		}
	});
	await nhip(2);
}

async function tatChi(o: HTMLElement, cach: CachChi): Promise<void> {
	await act(async () => {
		if (cach === "re") {
			o.dispatchEvent(
				new PointerEvent("pointerout", {
					bubbles: true,
					relatedTarget: document.body,
				}),
			);
		} else {
			o.blur();
		}
	});
	await nhip(2);
}

function oDuocChi(): Element[] {
	return [...document.querySelectorAll('[data-duoc-chi="true"]')];
}

describe("the-gop-y-okr — thẻ chỉ tới ô", () => {
	test("chi-o: ma trận trường × cách, rời thẻ tắt, câu hỏi và căn chỉnh không chỉ ô nào", async () => {
		let soKhang = 0;
		const kiem = (dung: boolean, ten: string) => {
			soKhang += 1;
			if (!dung) throw new Error(`chi sai o: ${ten}`);
		};
		const cach: CachChi[] = ["re", "focus"];
		await moHopMucTieu([D_TEN, D_VI_SAO, D_HOI_KR, D_CAN]);
		await nhoGopY(D_TEN.id);
		const MA_TRAN_MT = [
			{ dong: D_TEN, o: oTen, ten: "title" },
			{ dong: D_VI_SAO, o: oViSao, ten: "whyNow" },
		] as const;
		for (const hang of MA_TRAN_MT) {
			for (const c of cach) {
				await batChi(the(hang.dong.id), c);
				const chi = oDuocChi();
				kiem(chi.length === 1 && chi[0] === hang.o(), hang.ten);
				await tatChi(the(hang.dong.id), c);
				kiem(oDuocChi().length === 0, `${hang.ten} roi the`);
			}
		}
		for (const d of [D_HOI_KR, D_CAN]) {
			for (const c of cach) {
				await batChi(the(d.id), c);
				kiem(oDuocChi().length === 0, d.loai);
				await tatChi(the(d.id), c);
			}
		}
		await dongHet();
		await moHopKr([D_KR]);
		await nhoGopY(D_KR.id);
		for (const c of cach) {
			await batChi(the(D_KR.id), c);
			const chi = oDuocChi();
			kiem(chi.length === 1 && chi[0] === oTenKr(), "kr.title");
			await tatChi(the(D_KR.id), c);
			kiem(oDuocChi().length === 0, "kr.title roi the");
		}
		console.log(`chi-o: ${soKhang} khang dinh`);
		expect(soKhang).toBe(16);
	});
});

describe("the-gop-y-okr — phím trong cột", () => {
	test("phim: J/K chuyển thẻ, Enter nhận, E mở sửa; ngoài cột không làm gì", async () => {
		await moHopMucTieu([D_TEN, D_VI_SAO, D_CAN]);
		await nhoGopY(D_TEN.id);
		const dangFocus = () =>
			(document.activeElement as HTMLElement | null)?.getAttribute("data-dong");
		await act(async () => the(D_TEN.id).focus());
		await phim(document.activeElement, "j");
		expect(dangFocus()).toBe(D_VI_SAO.id);
		await phim(document.activeElement, "j");
		expect(dangFocus()).toBe(D_CAN.id);
		await phim(document.activeElement, "k");
		expect(dangFocus()).toBe(D_VI_SAO.id);
		await phim(document.activeElement, "Enter");
		await cho(() => goiCua("okr.troLyQuyet").length === 1, "enter nhan");
		expect(payloadQuyet()).toEqual([{ deXuatId: D_VI_SAO.id, cach: "nhan" }]);

		await act(async () => the(D_TEN.id).focus());
		await phim(document.activeElement, "e");
		const o = oSua(the(D_TEN.id));
		expect(o).not.toBeNull();
		await act(async () => o?.focus());
		await phim(o, "j");
		expect(document.activeElement).toBe(o);
		await phim(o, "Escape");
		expect(oSua(the(D_TEN.id))).toBeNull();

		const huy = nut("Huỷ", hopMucTieu() ?? document);
		await act(async () => huy.focus());
		for (const k of ["j", "k", "e"]) await phim(huy, k);
		if (document.activeElement !== huy) throw new Error("phim ngoai cot");

		const ten = oTen();
		await act(async () => ten?.focus());
		for (const k of ["j", "k", "Enter", "e"]) await phim(ten, k);
		if (goiCua("okr.troLyQuyet").length !== 1 || oSua(document) !== null)
			throw new Error("phim ngoai cot");
		expect(document.activeElement).toBe(ten);
	});
});

type TrangThaiThe = "cho" | "dang-sua" | "dang-gui" | "da-quyet" | "loi";
const TRANG_THAI_THE: TrangThaiThe[] = [
	"cho",
	"dang-sua",
	"dang-gui",
	"da-quyet",
	"loi",
];
type DichBam = { ten: string; lay: () => Element | null };

async function dungTrangThai(
	tt: TrangThaiThe,
): Promise<{ hop: MoHop; u: ReturnType<typeof userEvent.setup> }> {
	const hop = await moHopMucTieu([D_TEN, D_VI_SAO, D_HOI_MT]);
	if (tt === "dang-gui") dat("okr.troLyQuyet", () => new Promise(() => {}));
	if (tt === "loi")
		dat("okr.troLyQuyet", () => {
			throw new Error("Máy chủ từ chối đề xuất này");
		});
	await nhoGopY(D_TEN.id);
	const u = userEvent.setup({ document, pointerEventsCheck: 0 });
	if (tt === "dang-sua") await u.click(nut(m.dong.sua, the(D_TEN.id)));
	if (tt === "dang-gui" || tt === "da-quyet" || tt === "loi")
		await u.click(nut(m.dong.nhan, the(D_TEN.id)));
	await nhip(5);
	return { hop, u };
}

function dichCua(): DichBam[] {
	const khung = cot();
	if (!khung) throw new Error("khong thay cot");
	const nutCot = [...khung.querySelectorAll("button")].map(
		(b, i): DichBam => ({
			ten: `nut ${i} ${b.textContent?.trim() || b.getAttribute("aria-label")}`,
			lay: () => cot()?.querySelectorAll("button")[i] ?? null,
		}),
	);
	return [
		...nutCot,
		{
			ten: "chu cau moi",
			lay: () =>
				cot()?.querySelector('[data-the-cho] [data-slot="proposed-change-value"]') ??
				null,
		},
		{
			ten: "khoang trong giua hai nut",
			lay: () =>
				cot()?.querySelector('[data-the-cho] [data-slot="proposed-change-actions"]') ??
				null,
		},
		{ ten: "tieu de cot", lay: () => cot()?.querySelector("p") ?? null },
	];
}

describe("the-gop-y-okr — bấm trong cột không đóng hộp", () => {
	test("khong-dong: ma trận trạng thái thẻ × đích bấm, cộng đối chứng lớp phủ", async () => {
		console.log(
			"jsdom khong tai hien: buoc dau tren cot cua merge-base 2e328047, 5/5 lan bam Sua hop van mo (.acceptance-runs/the-gop-y-okr/E8-merge-base.txt); lop chot la E13",
		);
		let soCa = 0;
		for (const tt of TRANG_THAI_THE) {
			await dungTrangThai(tt);
			const dich = dichCua();
			await dongHet();
			for (const d of dich) {
				const { hop, u } = await dungTrangThai(tt);
				const o = d.lay();
				if (!o) {
					await dongHet();
					continue;
				}
				await u.click(o);
				await nhip(5);
				soCa += 1;
				if (hopMucTieu() === null || hop.dong() > 0 || soHop() !== 1) {
					const nhan = d.ten.includes(m.dong.sua) ? "Sua" : d.ten;
					throw new Error(`hop dong khi bam ${nhan} (${tt})`);
				}
				await dongHet();
			}
		}
		console.log(`khong-dong: ${soCa} ca`);
		expect(soCa).toBeGreaterThan(20);

		const hop = await moHopMucTieu([D_TEN]);
		const lop = document.querySelector('[data-slot="dialog-overlay"]');
		if (!lop) throw new Error("khong thay lop phu");
		await act(async () => {
			lop.dispatchEvent(
				new PointerEvent("pointerdown", {
					bubbles: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
			lop.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
			(lop as HTMLElement).click();
		});
		await nhip(5);
		expect(hop.dong()).toBe(1);
	}, 300_000);
});

const DUONG_THIET_KE =
	process.env.TGY_THIET_KE ??
	join(
		import.meta.dir,
		"..",
		"..",
		"..",
		"docs",
		"superpowers",
		"specs",
		"2026-09-29-the-gop-y-okr-design.md",
	);

function idBang(): string[] {
	const chu = readFileSync(DUONG_THIET_KE, "utf8");
	const dau = chu.indexOf("<<<UX-STATE-TABLE");
	const cuoi = chu.indexOf("UX-STATE-TABLE>>>");
	if (dau < 0 || cuoi < dau) throw new Error("khong thay bang UX-STATE-TABLE");
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-thegopy-[a-z0-9-]+)\s*\|/gm)]
		.map((k) => k[1] ?? "")
		.filter((id) => id !== "");
}

const GIAO_E1_E11 = ["ST-thegopy-hep"] as const;

async function caCho() {
	await moHopMucTieu([D_TEN]);
	await nhoGopY(D_TEN.id);
	const t = the(D_TEN.id);
	expect(t.querySelector('[data-slot="proposed-change-label"]')?.textContent).toBe(
		`${m.dong.loai["viet-lai"]} · ${m.dong.truong.title}`,
	);
	expect(t.querySelector("del")?.textContent).toBe(D_TEN.truoc);
	expect(t.querySelector("ins")?.textContent).toBe(D_TEN.sau);
	expect(hangNut(t)).toEqual([
		{ chu: m.dong.nhan, kieu: "default" },
		{ chu: m.dong.sua, kieu: "outline" },
		{ chu: m.dong.bac, kieu: "ghost" },
	]);
}

async function caSua() {
	await moHopMucTieu([D_TEN]);
	await nhoGopY(D_TEN.id);
	await bam(nut(m.dong.sua, the(D_TEN.id)));
	expect(document.activeElement).toBe(oSua(the(D_TEN.id)));
	expect(hangNut(the(D_TEN.id))).toEqual([
		{ chu: m.dong.nhanBanSua, kieu: "default" },
		{ chu: m.dong.huySua, kieu: "outline" },
	]);
}

async function caDangGui() {
	await moHopMucTieu([D_TEN]);
	dat("okr.troLyQuyet", () => new Promise(() => {}));
	await nhoGopY(D_TEN.id);
	await bam(nut(m.dong.nhan, the(D_TEN.id)));
	const t = the(D_TEN.id);
	expect(nutChinh(t)[0]?.querySelector('[data-slot="spinner"], svg')).not.toBeNull();
	expect([...t.querySelectorAll("button")].every((b) => b.disabled)).toBe(true);
}

async function caDaQuyet() {
	await moHopMucTieu([D_TEN, D_VI_SAO]);
	await nhoGopY(D_TEN.id);
	await bam(nut(m.dong.nhan, the(D_TEN.id)));
	await cho(() => the(D_TEN.id).hasAttribute("data-decided"), "da nhan");
	await bam(nut(m.dong.bac, the(D_VI_SAO.id)));
	await cho(() => the(D_VI_SAO.id).hasAttribute("data-decided"), "da bac");
	expect(the(D_TEN.id).textContent).toBe(
		`${m.dong.truong.title} — ${m.dong.ket.accepted}`,
	);
	expect(the(D_VI_SAO.id).textContent).toBe(
		`${m.dong.truong.whyNow} — ${m.dong.ket.dismissed}`,
	);
	expect(nutChinh(cot() ?? document)).toHaveLength(0);
}

async function caKhoaNhan() {
	await moHopMucTieu([D_TEN]);
	await nhoGopY(D_TEN.id);
	await go(oTen(), "Tên đang gõ dở");
	const b = nut(m.dong.nhan, the(D_TEN.id));
	expect(b.disabled).toBe(true);
	const id = b.getAttribute("aria-describedby");
	expect(id ? document.getElementById(id)?.textContent : "").toBe(
		m.dong.khoaODangSua,
	);
}

async function caLoiNhan() {
	await moHopMucTieu([D_TEN]);
	dat("okr.troLyQuyet", () => {
		throw new Error("Máy chủ từ chối đề xuất này");
	});
	await nhoGopY(D_TEN.id);
	await bam(nut(m.dong.nhan, the(D_TEN.id)));
	await cho(
		() => the(D_TEN.id).querySelector('[data-slot="field-error"]') !== null,
		"loi duoi the",
	);
	expect(the(D_TEN.id).textContent).toContain("Máy chủ từ chối đề xuất này");
	expect(nutCo(m.dong.nhan, the(D_TEN.id))?.disabled).toBe(false);
}

async function caHoiKr() {
	await moHopMucTieu([D_HOI_KR], { moKr: () => {} });
	await nhoGopY(D_HOI_KR.id);
	expect(hangNut(the(D_HOI_KR.id))).toEqual([
		{ chu: m.dong.moKr, kieu: "outline" },
		{ chu: m.dong.boQua, kieu: "ghost" },
	]);
}

async function caHoiMucTieu() {
	await moHopMucTieu([D_HOI_MT], { moKr: () => {} });
	await nhoGopY(D_HOI_MT.id);
	expect(hangNut(the(D_HOI_MT.id))).toEqual([
		{ chu: m.dong.boQua, kieu: "ghost" },
	]);
}

async function caCanChinh() {
	await moHopMucTieu([D_CAN]);
	await nhoGopY(D_CAN.id);
	const t = the(D_CAN.id);
	expect(t.textContent).toContain(m.dong.gopVao(D_CAN.tenDich ?? ""));
	expect(hangNut(t)).toEqual([
		{ chu: m.dong.canChinh, kieu: "default" },
		{ chu: m.dong.bac, kieu: "ghost" },
	]);
}

async function caChiO() {
	await moHopMucTieu([D_TEN]);
	await nhoGopY(D_TEN.id);
	await act(async () => the(D_TEN.id).focus());
	await nhip(2);
	expect(oTen()?.getAttribute("data-duoc-chi")).toBe("true");
}

async function caKr() {
	await moHopKr([D_KR, D_TEN]);
	await nhoGopY(D_KR.id);
	expect(dongCua(D_TEN.id)).toBeNull();
	expect(
		[...(cot()?.querySelectorAll('[data-slot="proposed-change"]') ?? [])].map(
			(o) => o.getAttribute("data-dong"),
		),
	).toEqual([D_KR.id]);
}

const FACT = {
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
} as const;

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
	const t = document.querySelector<HTMLElement>('[data-slot="proposed-change"]');
	if (!t) throw new Error("khong thay the thong tin");
	expect(t.getAttribute("data-kind")).toBe("compact");
	expect(hangNut(t)).toEqual([
		{ chu: "Nhận", kieu: "default" },
		{ chu: "Bác", kieu: "ghost" },
	]);
}

const CA_TRANG_THAI: Record<string, () => Promise<void>> = {
	"ST-thegopy-cho": caCho,
	"ST-thegopy-sua": caSua,
	"ST-thegopy-dang-gui": caDangGui,
	"ST-thegopy-da-quyet": caDaQuyet,
	"ST-thegopy-khoa-nhan": caKhoaNhan,
	"ST-thegopy-loi-nhan": caLoiNhan,
	"ST-thegopy-hoi-kr": caHoiKr,
	"ST-thegopy-hoi-muc-tieu": caHoiMucTieu,
	"ST-thegopy-can-chinh": caCanChinh,
	"ST-thegopy-chi-o": caChiO,
	"ST-thegopy-kr": caKr,
	"ST-thegopy-thong-tin": caThongTin,
};

function doiChieu(bang: readonly string[]): void {
	const giao = new Set<string>(GIAO_E1_E11);
	for (const id of bang) {
		if (!giao.has(id) && !(id in CA_TRANG_THAI))
			throw new Error(`thieu ca: ${id}`);
	}
	for (const id of Object.keys(CA_TRANG_THAI)) {
		if (!bang.includes(id)) throw new Error(`ca la: ${id}`);
	}
}

describe("the-gop-y-okr — bảng trạng thái", () => {
	test("trang-thai: mỗi dòng ST-thegopy-* của đặc tả có đúng một ca", async () => {
		const bang = idBang();
		expect(bang.length).toBeGreaterThan(10);
		doiChieu(bang);
		for (const id of bang) {
			if ((GIAO_E1_E11 as readonly string[]).includes(id)) {
				console.log(`giao E1/E11: ${id}`);
				continue;
			}
			if (id === "ST-thegopy-kr") console.log(`giao E1/E11: ${id} (be ngang)`);
			const ca = CA_TRANG_THAI[id];
			if (!ca) throw new Error(`thieu ca: ${id}`);
			await ca();
			await dongHet();
		}
	}, 120_000);

	test("trang-thai: thước bắt dòng bảng không có ca (chiều đỏ trên bảng thật cộng một dòng)", () => {
		expect(() => doiChieu([...idBang(), "ST-thegopy-gia"])).toThrow(
			"thieu ca: ST-thegopy-gia",
		);
	});
});

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

export {};
