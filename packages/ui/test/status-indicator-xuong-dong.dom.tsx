import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { StatusIndicator as ChamTrangThai } from "../src/components/status-indicator";

const TEP = resolve(
	import.meta.dir,
	"..",
	"src",
	"components",
	"status-indicator.tsx",
);
const THU_DO = resolve(import.meta.dir, "..", "node_modules", ".bch-do");
const NHAN = "Decision maker bought-in";

let goc: Root | null = null;
let khung: HTMLElement | null = null;

function don() {
	act(() => goc?.unmount());
	khung?.remove();
	goc = null;
	khung = null;
}

afterEach(don);

async function lopNhan(
	SI: typeof ChamTrangThai,
	wrapLabel: boolean | undefined,
): Promise<string[]> {
	khung = document.createElement("div");
	document.body.append(khung);
	goc = createRoot(khung);
	await act(async () => {
		goc?.render(<SI tone="info" label={NHAN} wrapLabel={wrapLabel} />);
	});
	const el = khung.querySelector('[data-slot="status-indicator-label"]');
	if (!el) throw new Error("bch-nhan: khong thay nhan");
	if (el.textContent !== NHAN) throw new Error("bch-nhan: nhan sai chu");
	const lop = el.className.split(/\s+/);
	don();
	return lop;
}

async function kiemNhan(SI: typeof ChamTrangThai): Promise<void> {
	if (!(await lopNhan(SI, undefined)).includes("truncate"))
		throw new Error("bch-nhan: mac dinh khong con cat");
	const bienThe = await lopNhan(SI, true);
	if (bienThe.includes("truncate") || !bienThe.includes("wrap-anywhere"))
		throw new Error("bch-nhan: bien the van cat");
}

describe("bch-nhan", () => {
	test("mac dinh cat tren mot dong, bien the xuong dong", async () => {
		const { StatusIndicator } = await import(
			"../src/components/status-indicator"
		);
		await kiemNhan(StatusIndicator);
	});

	test("chieu do: ban sao doi mac dinh sang xuong dong thi do dung ghim", async () => {
		mkdirSync(THU_DO, { recursive: true });
		const ban = join(THU_DO, `status-indicator-${Date.now()}.tsx`);
		const nguon = readFileSync(TEP, "utf8");
		const doi = nguon.replace("wrapLabel = false", "wrapLabel = true");
		expect(doi).not.toBe(nguon);
		writeFileSync(ban, doi);
		try {
			const { StatusIndicator } = await import(ban);
			await expect(kiemNhan(StatusIndicator)).rejects.toThrow(
				"bch-nhan: mac dinh khong con cat",
			);
		} finally {
			rmSync(ban, { force: true });
		}
	});
});
