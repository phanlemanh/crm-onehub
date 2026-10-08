import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { KaraProposalGroup } from "../src/components/kara/proposal";
import { LocaleProvider } from "../src/components/locale-provider";

const dangMo: { o: HTMLElement; root: Root }[] = [];

async function mo(man: ReactElement): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	await act(async () => {
		root.render(<LocaleProvider locale="vi">{man}</LocaleProvider>);
	});
	dangMo.push({ o, root });
}

afterEach(async () => {
	for (const { o, root } of dangMo.splice(0)) {
		await act(async () => root.unmount());
		o.remove();
	}
});

function Nhom({ loi }: { loi?: string }) {
	return (
		<KaraProposalGroup
			entries={[{ id: "mt", status: "decided", batchable: false }]}
			reason="vì sao"
			scope="Mục tiêu 1"
			batchDecided={{ text: "Đã thêm nhóm", onUndo: () => {}, error: loi }}
		>
			<div />
		</KaraProposalGroup>
	);
}

describe("kara-proposal-group-loi", () => {
	test("lỗi của biên nhận nhóm vẽ bằng FieldError ngay sau biên nhận, trong nhóm", async () => {
		await mo(<Nhom loi="Dòng này thuộc bản nháp cũ" />);
		const nhom = document.querySelector("[data-slot=kara-proposal-group]");
		const loi = nhom?.querySelector("[data-slot=field-error]") ?? null;
		expect(loi === null ? "thieu field-error trong nhom" : "co").toBe("co");
		expect(loi?.textContent ?? "").toBe("Dòng này thuộc bản nháp cũ");
		expect(loi?.getAttribute("data-loi") ?? "").toBe("nhom");
		const truoc = loi?.previousElementSibling?.getAttribute("data-slot") ?? "";
		expect(truoc).toBe("proposed-change-receipt");
	});

	test("không có lỗi thì không có FieldError (đối chứng)", async () => {
		await mo(<Nhom />);
		const nhom = document.querySelector("[data-slot=kara-proposal-group]");
		expect(nhom === null).toBe(false);
		expect(nhom?.querySelector("[data-slot=field-error]") === null).toBe(true);
		expect(
			nhom?.querySelector("[data-slot=proposed-change-receipt]") === null,
		).toBe(false);
	});
});
