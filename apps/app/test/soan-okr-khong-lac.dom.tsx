import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act } from "react";
import {
	useRecordSheetView,
	useRecordStack,
} from "@/components/crm/record-sheet/record-stack";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import {
	bam,
	CUOC,
	cho,
	datDanhSach,
	datLai,
	dat,
	dinhVi,
	don,
	go,
	goiCua,
	kr,
	m,
	mo,
	moTrang,
	mt,
	nhip,
	TrangSoan,
	urlDoi,
} from "./khung-soan-okr";

const q = (s: string) => document.querySelector(s);
const qa = (s: string) => [...document.querySelectorAll(s)];

function beRong(rong: number): () => void {
	const goc = window.matchMedia;
	const gia = (truyVan: string) => {
		const tran = /max-width:\s*(\d+)px/.exec(truyVan);
		return {
			matches: tran ? rong <= Number(tran[1]) : false,
			media: truyVan,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		};
	};
	Object.defineProperty(window, "matchMedia", {
		value: gia,
		writable: true,
		configurable: true,
	});
	return () =>
		Object.defineProperty(window, "matchMedia", {
			value: goc,
			writable: true,
			configurable: true,
		});
}

async function nhanTab(o: Element | undefined): Promise<void> {
	if (!o) throw new Error("khong thay tab");
	await act(async () => {
		o.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
	});
	await nhip(3);
}

function NganThu() {
	const ngan = useRecordStack();
	const xem = useRecordSheetView("details");
	return (
		<div data-ngan-thu>
			<button
				type="button"
				data-thu="mo"
				onClick={() => ngan.open({ kind: "contact", id: "c1" })}
			/>
			<button
				type="button"
				data-thu="tab-ngan"
				onClick={() => xem.setTab("activity")}
			/>
			<button type="button" data-thu="dong" onClick={() => ngan.close()} />
			<output data-thu="tab-dang">{ngan.top ? xem.tab : ""}</output>
		</div>
	);
}

async function moTrangVaNgan(): Promise<void> {
	dinhVi.duong = `/ws/okr/soan/${CUOC.id}`;
	dat("okr.access", () => ({
		canManageProgram: false,
		headOf: { divisions: [], departments: [] },
	}));
	await mo(
		<>
			<TrangSoan cuocSoanId={CUOC.id} cauNoi />
			<NganThu />
		</>,
	);
	await cho(
		() =>
			q("[data-trang-soan]:not([data-trang-soan='dang-mo'])") !== null,
		"trang soan mo xong",
	);
}

const tabBanNhapChon = () =>
	qa('[role="tab"]')[1]?.getAttribute("aria-selected") ?? "vang";
const locBat = () =>
	q("[data-nut=loc-cho]")?.getAttribute("aria-pressed") === "true"
		? "on"
		: "off";
const tabNgan = () => q("[data-thu=tab-dang]")?.textContent ?? "";
const thamSoCuoi = () => new URLSearchParams(urlDoi.at(-1) ?? "");

beforeEach(datLai);
afterEach(don);

describe("k2b-tab", () => {
	test("khổ hẹp: mở rồi đóng một bản ghi bên cạnh không đổi tab Bản nháp, bộ lọc, hay tab của ngăn", async () => {
		const tra = beRong(390);
		try {
			datDanhSach({ dong: [mt("1", "Giữ khách lớn miền Bắc")] });
			await moTrangVaNgan();
			await nhanTab(qa('[role="tab"]')[1]);
			await bam(q("[data-nut=loc-cho]"));
			expect(`buoc 1: ${tabBanNhapChon()} ${locBat()}`).toBe(
				"buoc 1: true on",
			);

			await bam(q("[data-thu=mo]"));
			await bam(q("[data-thu=tab-ngan]"));
			await nhip(3);
			expect(
				tabBanNhapChon() === "true"
					? "giu"
					: "tab soan doi sang tro-chuyen o buoc 2",
			).toBe("giu");
			expect(
				`buoc 2: ${tabBanNhapChon()} ${locBat()} ${tabNgan()}`,
			).toBe("buoc 2: true on activity");
			expect(thamSoCuoi().get(SEARCH_PARAM.record.tab)).toBe("activity");
			expect(thamSoCuoi().get(SEARCH_PARAM.okr.tabSoan)).toBe("ban-nhap");

			await bam(q("[data-thu=dong]"));
			await nhip(3);
			expect(`buoc 3: ${tabBanNhapChon()} ${locBat()}`).toBe(
				"buoc 3: true on",
			);
			expect(thamSoCuoi().get(SEARCH_PARAM.okr.tabSoan)).toBe("ban-nhap");
			expect(thamSoCuoi().get(SEARCH_PARAM.okr.locSoan)).toBe("cho");
		} finally {
			tra();
		}
	});
});

const nutHoanTac = (goc: Element | null) =>
	[...(goc?.querySelectorAll<HTMLButtonElement>("button") ?? [])].find(
		(b) => b.textContent?.trim() === "Hoàn tác",
	) ?? null;
const oNhap = (id: string) =>
	document.getElementById(id) as HTMLInputElement | null;
const nhomEl = () => q('[data-slot="kara-proposal-group"]');
const loiNhom = () =>
	nhomEl()?.querySelector("[data-loi=nhom]")?.textContent ?? null;

describe("k2b-nhom-loi", () => {
	const NHOM = [
		mt("1", "Giữ khách lớn miền Bắc"),
		kr("11", "1", "Khách lớn ký lại hợp đồng"),
		kr("13", "1", "Rà soát tuyến trước hạn", "cho", "moc"),
	];
	const DA_NHAN = NHOM.map((d) => ({ ...d, trangThai: "nhan" as const }));

	async function nhanCaNhom(): Promise<void> {
		datDanhSach({ dong: NHOM });
		await moTrang();
		await go(oNhap("dich-11"), "10");
		datDanhSach({ dong: DA_NHAN });
		await bam(q('[data-slot="kara-batch"]'));
		await nhip(10);
	}

	const CA = [
		{ ten: "conflict-dang", trangThai: "dang", loi: "conflict", chu: () => m.loiQuyet.dongCu },
		{ ten: "conflict-dong", trangThai: "da-dua-vao", loi: "conflict", chu: () => m.loiQuyet.cuocKhongDang },
		{ ten: "mang", trangThai: "dang", loi: "mang", chu: () => m.loiQuyet.mang },
	] as const;

	for (const ca of CA) {
		test(`hoàn tác cả nhóm bị từ chối (${ca.ten}): câu lỗi dưới biên nhận nhóm, biên nhận còn, bấm lại được`, async () => {
			await nhanCaNhom();
			dat("okr.soanQuyet", () => {
				throw ca.loi === "conflict"
					? Object.assign(new Error("Conflict"), { data: { code: "CONFLICT" } })
					: new Error("Failed to fetch");
			});
			datDanhSach({ dong: DA_NHAN, cuoc: { ...CUOC, trangThai: ca.trangThai } });
			await bam(nutHoanTac(nhomEl()));
			await nhip(10);
			expect(loiNhom() === null ? "khong thay loi duoi bien nhan nhom" : "co").toBe("co");
			expect(loiNhom()).toBe(ca.chu());
			const bienNhan = nhomEl()?.querySelector("[data-slot=proposed-change-receipt]") ?? null;
			expect(bienNhan === null ? "mat bien nhan" : "con").toBe("con");
			const nut = nutHoanTac(nhomEl());
			expect(ca.trangThai === "dang" ? (nut?.disabled ?? true) : nut === null).toBe(
				ca.trangThai !== "dang",
			);
		});
	}

	test("thử lại thành công: câu lỗi biến mất và nhóm về chờ", async () => {
		await nhanCaNhom();
		dat("okr.soanQuyet", () => {
			throw Object.assign(new Error("Conflict"), { data: { code: "CONFLICT" } });
		});
		await bam(nutHoanTac(nhomEl()));
		await nhip(10);
		expect(loiNhom()).toBe(m.loiQuyet.dongCu);
		dat("okr.soanQuyet", () => ({ ok: true }));
		datDanhSach({ dong: NHOM });
		await bam(nutHoanTac(nhomEl()));
		await nhip(10);
		expect(loiNhom()).toBe(null);
		expect(goiCua("okr.soanQuyet").at(-1)?.dauVao).toEqual({ deXuatId: "1", quyet: "hoan" });
		expect(q('[data-slot="kara-batch"]') === null ? "khong ve cho" : "ve cho").toBe("ve cho");
	});
});
