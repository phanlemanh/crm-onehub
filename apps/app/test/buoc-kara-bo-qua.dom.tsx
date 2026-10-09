import { afterEach, describe, expect, test } from "bun:test";
import { messages } from "@crm/ui/lib/messages";
import type { EveMessage } from "eve/react";
import { act } from "react";
import { karaBanGhiMessages } from "@/lib/messages/kara-ban-ghi";
import { dongHet, mo } from "./khung-gop-y";

const { Turns } = await import("@/components/crm/agent-panel");
const { AgentToolStep } = await import(
	"@/components/agent-builder/agent-builder-chat"
);
const { toTranscript } = await import("@/lib/agent-transcript");

const VI = messages("vi").karaKhung;
const t = karaBanGhiMessages("vi");

const BO_QUA = {
	stored: false,
	skipped: true,
	imageUrl: "https://bo-qua.public.blob.vercel-storage.com/contacts/anh.jpg",
	reason: "They already have a photo.",
};
const HONG = {
	stored: false,
	imageUrl: null,
	reason: "The photo could not be fetched. The record is unchanged.",
};

const tool = (toolName: string, output: unknown, id: string) => ({
	type: "dynamic-tool",
	toolName,
	toolCallId: id,
	state: "output-available",
	input: {},
	output,
});

function luot(giua: unknown) {
	const [hang] = toTranscript([
		{
			id: "m1",
			role: "assistant",
			parts: [
				tool("read_crm_history", { applied: true }, "c1"),
				tool("fetch_contact_photo", giua, "c2"),
				tool("write_brief", { written: true }, "c3"),
			],
		} as unknown as EveMessage,
	]);
	if (!hang) throw new Error("toTranscript khong ra hang nao");
	return hang;
}

function cacBuoc(): string[] {
	return [...document.querySelectorAll("[data-trang-thai]")].map(
		(m) => m.getAttribute("data-trang-thai") ?? "",
	);
}

afterEach(dongHet);

describe("ngan", () => {
	test("ngan: bo-qua — buoc da bo qua, khoi dong, tieu de da lam", async () => {
		await mo(<Turns message={luot(BO_QUA)} skip={null} t={t} locale="vi" />);
		const goc = document.querySelector("[data-kara-steps]");
		const tieuDe = goc?.querySelector("button")?.textContent ?? "";
		expect(
			`${goc?.getAttribute("data-state")} | ${tieuDe.includes(VI.daLamBuoc("3"))}`,
		).toBe("closed | true");
		act(() => {
			(goc?.querySelector("button") as HTMLButtonElement | null)?.click();
		});
		expect(`ngan: ${cacBuoc().join(",")}`).toBe("ngan: xong,bo-qua,xong");
		const chu = goc?.textContent ?? "";
		expect(
			`${chu.includes(VI.buocBoQua)} ${chu.includes(VI.buocChuaLuu)}`,
		).toBe("true false");
	});
});

describe("ngan-hong", () => {
	test("ngan-hong: hong that van chua luu va tu mo", async () => {
		await mo(<Turns message={luot(HONG)} skip={null} t={t} locale="vi" />);
		const goc = document.querySelector("[data-kara-steps]");
		const tieuDe = goc?.querySelector("button")?.textContent ?? "";
		expect(
			`${goc?.getAttribute("data-state")} | ${cacBuoc().join(",")} | ${tieuDe.includes("Kara chưa lưu được")}`,
		).toBe("open | xong,chua-luu,xong | true");
	});
});

describe("khung-tao", () => {
	const muc = (output: unknown) => {
		const item = luot(output).items.find(
			(i) => i.kind === "did" && i.tool === "fetch_contact_photo",
		);
		if (!item || item.kind !== "did") throw new Error("khong thay muc anh");
		return item;
	};
	const canhBao = () => document.querySelector("svg.text-warning") !== null;

	test("khung-tao: canh bao bo qua — khong co icon canh bao", async () => {
		await mo(<AgentToolStep item={muc(BO_QUA)} />);
		expect(`khung-tao: canh bao bo qua ${canhBao()}`).toBe(
			"khung-tao: canh bao bo qua false",
		);
	});

	test("khung-tao: doi chung — hong that co icon canh bao", async () => {
		await mo(<AgentToolStep item={muc(HONG)} />);
		expect(canhBao()).toBe(true);
	});
});
