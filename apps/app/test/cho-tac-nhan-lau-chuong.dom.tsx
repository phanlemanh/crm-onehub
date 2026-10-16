import { afterEach, describe, expect, test } from "bun:test";
import { parseNoiDungThongBao } from "@crm/validation/thong-bao";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DanhSachNhomThongBao } from "@/components/thong-bao/dong-thong-bao";
import { thongBaoMessages } from "@/lib/messages/thong-bao";
import { cauThongBao } from "@/lib/thong-bao/cau";
import { dongTuRa } from "@/lib/thong-bao/dong";
import MAU_NOI_DUNG from "../../agent/test/fixtures/cho-tac-nhan-lau-noi-dung.json";

const SLUG = "onehub";
const HOI_THOAI = "hoi-thoai-chuong";
const LUOT = "luot-chuong";
const LOAI = [
	"tac-nhan-xong",
	"tac-nhan-can-tra-loi",
	"tac-nhan-hong",
] as const;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
});

function noiDung(loai: (typeof LOAI)[number], ten?: string) {
	const mau = {
		...MAU_NOI_DUNG[loai],
		conversationId: HOI_THOAI,
		luotId: LUOT,
	};
	if (ten !== undefined) mau.ten = ten;
	return parseNoiDungThongBao(mau);
}

function ve(locale: "vi" | "en", ten?: string): HTMLElement {
	const now = new Date("2026-10-16T03:00:00.000Z");
	const dong = LOAI.map((loai, i) =>
		dongTuRa(
			{
				id: `tb-${i}`,
				noiDung: noiDung(loai, ten),
				duongDan: `/chat/${HOI_THOAI}`,
				taoLuc: now,
				daDoc: false,
			},
			{ locale, slug: SLUG, now },
			"gio",
		),
	);
	khung = document.createElement("div");
	document.body.append(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<DanhSachNhomThongBao
				nhom={[{ nhan: "Hôm nay", dong }]}
				nhanChuaDoc="chua doc"
				onMo={() => {}}
			/>,
		),
	);
	return khung;
}

describe("cho-tac-nhan-lau-chuong", () => {
	test("dong-chuong: moi loai mot cau rieng, ten khong dich, ve dung cuoc tro chuyen", () => {
		for (const locale of ["vi", "en"] as const) {
			const k = ve(locale);
			const muc = [...k.querySelectorAll("a")];
			expect(muc.length, `ba dong chuong ${locale}`).toBe(3);
			const cau = new Set<string>();
			LOAI.forEach((loai, i) => {
				const a = muc[i];
				const kyVong = cauThongBao(locale, noiDung(loai));
				expect(a?.textContent, `cau thong bao ${loai} ${locale}`).toContain(
					kyVong,
				);
				expect(kyVong, `cau thong bao ${loai} ${locale}`).not.toMatch(
					/\{\w+\}|undefined/,
				);
				cau.add(kyVong);
				const cauEl = a?.querySelector('[data-slot="cau-thong-bao"]');
				expect(
					cauEl?.textContent,
					`cau mot khoi, khong vo thanh nhieu o ${loai} ${locale}`,
				).toBe(kyVong);
				expect(
					cauEl?.parentElement?.childElementCount,
					`cau mot khoi, khong vo thanh nhieu o ${loai} ${locale}`,
				).toBe(1);
				const khong = a?.querySelector('[translate="no"]');
				expect(khong?.textContent, `ten khong dich ${loai} ${locale}`).toBe(
					MAU_NOI_DUNG[loai].ten,
				);
				expect(a?.getAttribute("href"), `duong dan ${loai}`).toBe(
					`/${SLUG}/chat/${HOI_THOAI}`,
				);
			});
			expect(cau.size, `ba cau khac nhau ${locale}`).toBe(3);
			act(() => root?.unmount());
			k.remove();
			root = null;
		}
	});

	test("dong-chuong: ten rong thi dung chu thay theo ngon ngu, khong o trong", () => {
		for (const locale of ["vi", "en"] as const) {
			const k = ve(locale, "   ");
			const chu = k.textContent ?? "";
			expect(chu, `ten rong ${locale}`).toContain(
				thongBaoMessages(locale).chuong.tacNhanKhongTen,
			);
			expect(chu, `ten rong ${locale}`).not.toContain("«»");
			expect(
				k.querySelector('[translate="no"]'),
				`ten rong khong co vung khong dich ${locale}`,
			).toBeNull();
			act(() => root?.unmount());
			k.remove();
			root = null;
		}
	});
	test("dong-chuong: ten trung chu cua cau mau van nam trong vung khong dich", () => {
		for (const locale of ["vi", "en"] as const) {
			for (const ten of ["Kara", "building", "it", "Kara cần"]) {
				const k = ve(locale, ten);
				for (const a of k.querySelectorAll("a")) {
					const khong = a.querySelector('[translate="no"]');
					expect(khong?.textContent, `ten ${ten} ${locale}`).toBe(ten);
					expect(
						khong?.previousSibling?.textContent ?? "",
						`vung khong dich ngay sau « ${ten} ${locale}`,
					).toEndWith("«");
					expect(
						khong?.nextSibling?.textContent ?? "",
						`vung khong dich ngay truoc » ${ten} ${locale}`,
					).toStartWith("»");
				}
				act(() => root?.unmount());
				k.remove();
				root = null;
			}
		}
	});
});
