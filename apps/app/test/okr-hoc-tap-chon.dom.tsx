import { describe, expect, test } from "bun:test";
import { LOAI_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { okrMessages } from "@/lib/messages/okr";
import {
	bamChuot,
	cho,
	dung,
	HopThoaiMucTieu,
	mtSheet,
	qs,
	qsa,
} from "./khung-gop-y-dung-cho";

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

describe("chon-loai", () => {
	test("vi: hop chon Loai co ba lua chon Cam ket, Tham vong, Hoc tap", async () => {
		await dung(
			<HopThoaiMucTieu
				dong={() => {}}
				yeuCau={{ loai: "sua", mucTieu: mtSheet() }}
			/>,
		);
		await cho(() => qs("[data-hop-thoai-muc-tieu]") !== null, "hop mo");
		const trigger = qsa("[role=combobox]").find((e) => e.id.endsWith("-loai"));
		if (!trigger) throw new Error("khong thay o chon Loai");
		await bamChuot(trigger);
		await cho(() => qsa("[role=option]").length > 0, "danh sach loai mo");
		const ds = new Set(
			qsa("[role=option]").map((e) => e.textContent?.trim() ?? ""),
		);
		ghim(ds.has("Học tập"), "hop chon loai thieu Hoc tap");
		expect(ds).toEqual(new Set(["Cam kết", "Tham vọng", "Học tập"]));
	});

	test("en: nguon nhan cua hop chon dung ba nhan tieng Anh", () => {
		const en = okrMessages("en").loai;
		expect(new Set(LOAI_MUC_TIEU.map((l) => en[l]))).toEqual(
			new Set(["Committed", "Aspirational", "Learning"]),
		);
	});
});
