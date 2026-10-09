import { describe, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { KaraState } from "@crm/ui/components/kara/state";
import {
	chiTietTu,
	cho,
	D_CAN,
	D_DOI_TRONG,
	D_TEN,
	dsTroLy,
	dung,
	dungSheet,
	dungSheetCoGopY,
	kho,
	kiemCa,
	mtSheet,
	nhom,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";
import { demTiaSang, vungKara } from "./khung-gop-y-luot-2";

const MAU_KARA_STATE = join(
	import.meta.dir,
	"../../../_acceptance/kara-gop-y-luot-2/rang/kara-state-goc.json",
);

describe("k3-khung", () => {
	test("k3-khung ghim mac dinh: empty khong action va off khong describedBy giu nguyen DOM cua c1067c16", async () => {
		await dung(
			<div data-ghim="empty">
				<KaraState kind="empty" title="Tiêu đề" description="Mô tả" />
			</div>,
		);
		await dung(
			<div data-ghim="off">
				<KaraState
					kind="off"
					reason="Lý do"
					action={<button type="button">Nút</button>}
				/>
			</div>,
		);
		const thuc = {
			empty: qs("[data-ghim=empty]")?.innerHTML ?? "",
			off: qs("[data-ghim=off]")?.innerHTML ?? "",
		};
		if (!existsSync(MAU_KARA_STATE))
			throw new Error(
				`chua co mau kara-state-goc.json: ${JSON.stringify(thuc)}`,
			);
		const goc = JSON.parse(readFileSync(MAU_KARA_STATE, "utf8")) as Record<
			"empty" | "off",
			string
		>;
		kiemCa(
			thuc,
			goc,
			(k) => `kara-state ${k} doi DOM khi khong truyen prop moi`,
		);
	});

	test("k3-khung prop moi: empty co action ve trong EmptyContent, off co describedBy gan id cho cau ly do", async () => {
		await dung(
			<div data-ca="empty">
				<KaraState
					kind="empty"
					title="Tiêu đề"
					description="Mô tả"
					action={<button type="button">Đọc lại</button>}
				/>
			</div>,
		);
		await dung(
			<div data-ca="off">
				<KaraState kind="off" reason="Lý do" describedBy="ly-do-tat" />
			</div>,
		);
		kiemCa(
			{
				nutEmpty:
					qs("[data-ca=empty] [data-slot=empty-content] button")?.textContent ??
					null,
				idOff:
					qs("[data-ca=off] [data-slot=field-description]")?.getAttribute(
						"id",
					) ?? null,
			},
			{ nutEmpty: "Đọc lại", idOff: "ly-do-tat" },
			(k) => `kara-state prop moi sai: ${k}`,
		);
	});
	test("k3-khung vung la DetailSheetSection nhu vung ben canh, mot tia sang, ba KaraProposal, Kara ban thi nut quyet khoa", async () => {
		await dungSheetCoGopY([D_DOI_TRONG, D_CAN, D_TEN]);
		const vung = vungKara();
		if (!vung) throw new Error("khong co [data-vung-kara]");
		const khung = vung.closest("section");
		const benCanh = qs("[data-khu=vi-sao] section");
		const tia = demTiaSang(vung);
		if (tia !== 1) throw new Error(`tia sang trong vung: ${tia}, mong 1`);
		kiemCa(
			{
				coKhung: khung !== null,
				cungKhung: khung?.className === benCanh?.className,
				soDeXuat: qsa(
					"[data-slot=kara-khoa] > [data-slot=proposed-change]",
					vung,
				).length,
			},
			{ coKhung: true, cungKhung: true, soDeXuat: 3 },
			(k) => `vung kara sai: ${k}`,
		);
		await thaoHet();

		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 3 }));
		kho.troLy = () =>
			dsTroLy([D_DOI_TRONG, D_CAN, D_TEN], { dangSoan: true, maKetThuc: null });
		await dungSheet();
		await cho(
			() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
			"co gop y khi ban",
		);
		const nutQuyet = qsa("[data-hanh-dong]", vungKara() ?? document.body);
		const mo = nutQuyet.filter(
			(b) => !(b as HTMLButtonElement).disabled,
		).length;
		kiemCa(
			{ soNut: nutQuyet.length > 0, nutMo: mo },
			{ soNut: true, nutMo: 0 },
			(k) => `kara ban ma nut quyet khong khoa: ${k}`,
		);
	});
});
