import { describe, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { KaraState } from "@crm/ui/components/kara/state";
import { dung, kiemCa, qs } from "./khung-gop-y-dung-cho";

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
});
