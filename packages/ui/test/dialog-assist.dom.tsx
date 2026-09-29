import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Dialog,
	DialogAssistBody,
	DialogContent,
	DialogTitle,
} from "../src/components/dialog";
import { LocaleProvider } from "../src/components/locale-provider";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
});

function dung(el: ReactElement) {
	const khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(<LocaleProvider locale="vi">{el}</LocaleProvider>));
}

async function cho() {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 20));
	});
}

function HopThu({ onDong }: { onDong: () => void }) {
	const [mo, setMo] = useState(true);
	return (
		<Dialog
			open={mo}
			onOpenChange={(v) => {
				if (!v) {
					onDong();
					setMo(false);
				}
			}}
		>
			<DialogContent size="assist">
				<DialogTitle>Hộp thử</DialogTitle>
				<DialogAssistBody split>
					<form data-khoi="form" />
					<section data-khoi="cot" />
				</DialogAssistBody>
			</DialogContent>
		</Dialog>
	);
}

describe("Dialog cỡ assist", () => {
	test("hộp mang data-size=assist và thân hai cột", async () => {
		dung(<HopThu onDong={() => {}} />);
		await cho();
		const hop = document.querySelector('[data-slot="dialog-content"]');
		expect(hop?.getAttribute("data-size")).toBe("assist");
		expect(hop?.className).toContain("lg:max-w-(--container-assist)");
		const than = document.querySelector('[data-slot="dialog-assist-body"]');
		expect(than?.getAttribute("data-split")).toBe("true");
		expect(than?.className).toContain(
			"lg:grid-cols-[minmax(0,1fr)_var(--container-assist-rail)]",
		);
	});
});
