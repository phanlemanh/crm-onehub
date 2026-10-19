import { afterEach, describe, mock, test } from "bun:test";
import { useQueryClient } from "@tanstack/react-query";
import { act } from "react";
import {
	viecChiTietOutput,
	viecVetOutput,
} from "../../api/src/viec/viec.contracts";
import { cho, dat, dongHet, mo, trangThai } from "./khung-gop-y";

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const qc = useQueryClient();
		return new Proxy(
			{},
			{
				get: () => async () => {
					await qc.invalidateQueries();
				},
			},
		);
	},
}));

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: "ready",
		error: undefined,
		data: { messages: [] },
		session: null,
		send: async () => {},
	}),
}));

const { DetailSheet } = await import("@/components/detail-sheet");
const { KhungViec } = await import("@/components/viec/khung-viec");
const { LichSuViec } = await import("@/components/viec/lich-su-viec");
const { viecMessages } = await import("@/lib/messages/viec");

const M = viecMessages("vi");
const RIENG = "Việc riêng";
const TEN_P = "vrc Dự án P";
const TEN_D = "vrc Thoả thuận D";
const NGUOI = { id: "u-b", name: "Bình", image: null };

type AiThay = "rieng" | "du-an" | "ban-ghi";

function banViec(aiThay: AiThay, id: string) {
	return viecChiTietOutput.parse({
		id,
		tieuDe: `vrc việc ${aiThay}`,
		trangThai: "CHUA_LAM",
		hanNgay: null,
		batDauNgay: null,
		duAn: aiThay === "du-an" ? { id: "p1", ten: TEN_P } : null,
		quaHan: false,
		nguoiGiao: NGUOI,
		nguoiThucHien: NGUOI,
		banGhi:
			aiThay === "ban-ghi" ? [{ loai: "deal", id: "d1", ten: TEN_D }] : [],
		moTa: null,
		nguoiTheoDoi: [],
		phaiCho: [],
		coLichSu: false,
		quyen: {
			trangThai: [],
			sua: true,
			doiNguoi: true,
			gan: true,
			theoDoiKhac: true,
			dangTheoDoi: false,
			xoa: false,
		},
		aiThay,
	});
}

function datChung() {
	dat("viec.con", () => ({ cha: null, con: [], conMo: 0, themDuoc: false }));
	dat("onboarding.nguoiNhanViec", () => []);
	dat("users.list", () => []);
	dat("duAn.list", () => [{ id: "p1", ten: TEN_P }]);
	dat("viec.lichSu", () => []);
}

async function moKhung(id: string) {
	await mo(
		<DetailSheet open onOpenChange={() => {}}>
			<KhungViec viecId={id} />
		</DetailSheet>,
		{ searchParams: `record=viec:${id}` },
	);
}

function oGanVoi(): string {
	const nhan = [...document.querySelectorAll("span")].find(
		(s) => s.textContent?.trim() === M.khung.ganVoi,
	);
	return nhan?.nextElementSibling?.textContent ?? "";
}

function moTa(): string {
	return (
		document.querySelector('[data-slot="sheet-description"]')?.textContent ?? ""
	);
}

afterEach(async () => {
	await dongHet();
	trangThai.daGoi.length = 0;
});

describe("vrc-khung-chu", () => {
	test("vrc-khung-chu: ba loại việc, khung nói đúng ai thấy", async () => {
		let daSo = 0;
		for (const aiThay of ["rieng", "du-an", "ban-ghi"] as const) {
			datChung();
			const ban = banViec(aiThay, `v-${aiThay}`);
			dat("viec.get", () => ban);
			await moKhung(ban.id);
			await cho(() => oGanVoi() !== "", `khung ${aiThay}`);
			const toanKhung = document.body.textContent ?? "";
			if (aiThay === "rieng") {
				if (
					!oGanVoi().includes(M.khung.rieng) ||
					!moTa().includes(M.khung.rieng)
				) {
					throw new Error("vrc: khung rieng mat chu");
				}
			} else if (aiThay === "du-an") {
				if (toanKhung.includes(RIENG)) {
					throw new Error("vrc: khung du-an hua rieng");
				}
				const chu = (M.khung as Record<string, string>).duAnChung;
				if (!chu || !oGanVoi().includes(chu) || !moTa().includes(TEN_P)) {
					throw new Error("vrc: khung du-an thieu chu");
				}
			} else if (toanKhung.includes(RIENG)) {
				throw new Error("vrc: khung ban-ghi hua rieng");
			}
			daSo++;
			await dongHet();
		}
		if (daSo !== 3) throw new Error(`vrc: khung thieu o ${daSo}`);
	});
});

async function bam(el: Element) {
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"]) {
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
		}
	});
}

describe("vrc-khung-doi", () => {
	test("vrc-khung-doi: chọn dự án trong khung, chữ đổi không phải mở lại khung", async () => {
		datChung();
		let daDoi = false;
		dat("viec.get", () =>
			daDoi ? banViec("du-an", "v-doi") : banViec("rieng", "v-doi"),
		);
		dat("viec.doiDuAn", () => {
			daDoi = true;
			return { ok: true };
		});
		await moKhung("v-doi");
		await cho(() => oGanVoi() !== "", "khung doi");
		if (!oGanVoi().includes(M.khung.rieng)) {
			throw new Error("vrc: khung doi doi chung");
		}
		const nut = document.querySelector(`[aria-label="${M.khung.duAn}"]`);
		if (!nut) throw new Error("vrc: khung doi thieu o du an");
		await bam(nut);
		await cho(
			() =>
				[...document.querySelectorAll('[role="option"]')].some(
					(o) => o.textContent?.trim() === TEN_P,
				),
			"o chon du an",
		);
		const chon = [...document.querySelectorAll('[role="option"]')].find(
			(o) => o.textContent?.trim() === TEN_P,
		);
		if (chon) await bam(chon);
		await cho(
			() =>
				[...document.querySelectorAll("button")].some(
					(b) => b.textContent?.trim() === M.khung.congKhaiNut,
				),
			"hoi cong khai",
		);
		const dongY = [...document.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === M.khung.congKhaiNut,
		);
		if (dongY) await bam(dongY);
		const chu = (M.khung as Record<string, string>).duAnChung;
		try {
			await cho(
				() => daDoi && chu !== undefined && oGanVoi().includes(chu),
				"khung doi chu",
			);
		} catch {
			throw new Error("vrc: khung khong doi sau doi du an");
		}
		const soLanGet = trangThai.daGoi.filter(
			(g) => g.duong === "viec.get",
		).length;
		if (soLanGet < 2) throw new Error("vrc: khung khong doc lai");
	});
});

describe("vrc-lich-su-khung", () => {
	test("vrc-lich-su-khung: dòng nhắc việc người xem không thấy ghi chữ che", async () => {
		const goc = {
			luc: "2026-10-19T09:00:00.000Z",
			nguon: "web",
			nguoi: { id: "u-a", name: "An" },
		};
		const DONG = [
			{
				id: "h1",
				loai: "them-phu-thuoc",
				vet: { loai: "them-phu-thuoc", truoc: null, sau: { viec: null } },
				che: true,
			},
			{
				id: "h2",
				loai: "go-phu-thuoc",
				vet: { loai: "go-phu-thuoc", truoc: { viec: null }, sau: null },
				che: true,
			},
			{
				id: "h3",
				loai: "doi-han",
				vet: {
					loai: "doi-han",
					truoc: { hanNgay: "2026-11-05" },
					sau: { hanNgay: "2026-11-09", boi: null },
				},
				che: true,
			},
			{
				id: "h4",
				loai: "them-viec-con",
				vet: { loai: "them-viec-con", truoc: null, sau: null },
				che: true,
			},
			{
				id: "h5",
				loai: "them-phu-thuoc",
				vet: {
					loai: "them-phu-thuoc",
					truoc: null,
					sau: { viec: { id: "v-thay", tieuDe: "vrc Việc thấy" } },
				},
				che: false,
			},
		] as const;
		let ban: unknown;
		try {
			ban = viecVetOutput.parse(
				DONG.map(({ che: _che, ...h }) => ({ ...goc, ...h })),
			);
		} catch (loi) {
			throw new Error(`vrc: lich su vo ${String(loi).slice(0, 200)}`);
		}
		dat("viec.lichSu", () => ban);
		try {
			await mo(<LichSuViec viecId="w" />);
			await cho(
				() =>
					document.querySelectorAll('[data-slot="item"]').length >= DONG.length,
				"lich su",
			);
		} catch (loi) {
			throw new Error(`vrc: lich su vo ${String(loi).slice(0, 200)}`);
		}
		const dong = [...document.querySelectorAll('[data-slot="item"]')].map(
			(d) => d.textContent ?? "",
		);
		const khuat = (M.lichSu as Record<string, unknown>).viecKhuat as
			| string
			| undefined;
		let daSo = 0;
		for (const [i, d] of DONG.entries()) {
			const chu = dong[i] ?? "";
			if (d.che) {
				if (!khuat || !chu.includes(khuat)) {
					throw new Error(`vrc: dong che thieu chu ${d.loai}`);
				}
			} else if (!chu.includes("vrc Việc thấy")) {
				throw new Error("vrc: dong thay mat ten");
			}
			daSo++;
		}
		if (daSo !== 5) throw new Error(`vrc: lich su thieu dong ${daSo}`);
	});
});
