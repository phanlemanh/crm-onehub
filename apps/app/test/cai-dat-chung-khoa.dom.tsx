import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	agentModelOutput,
	archiveRetentionOutput,
	modelCatalogOutput,
	researchKeyOutput,
} from "../../api/src/settings/settings.contracts";

const MODEL = {
	id: "ccq/model-a",
	name: "Model A",
	provider: "ccq",
	contextWindowTokens: 200_000,
	pricing: null,
};

let coQuyen = false;

function quaJson<T>(giaTri: T): unknown {
	return JSON.parse(JSON.stringify(giaTri));
}

function thuTuc(ten: string, doc: () => unknown) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({
			queryKey: [ten, coQuyen],
			queryFn: async () => doc(),
		}),
		mutationOptions: () => ({
			mutationKey: [ten],
			mutationFn: async () => ({}),
		}),
	};
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		settings: {
			researchKey: thuTuc("settings.researchKey", () =>
				quaJson(
					researchKeyOutput.parse({
						configured: true,
						hint: "••••0001",
						canManage: coQuyen,
					}),
				),
			),
			agentModel: thuTuc("settings.agentModel", () =>
				quaJson(
					agentModelOutput.parse({
						selectedId: MODEL.id,
						effectiveId: MODEL.id,
						defaultId: MODEL.id,
						effective: MODEL,
						selectedMissing: false,
						updatedAt: null,
						canManage: coQuyen,
					}),
				),
			),
			modelCatalog: thuTuc("settings.modelCatalog", () =>
				quaJson(modelCatalogOutput.parse({ models: [MODEL], available: true })),
			),
			archiveRetention: thuTuc("settings.archiveRetention", () =>
				quaJson(archiveRetentionOutput.parse({ days: 42, canManage: coQuyen })),
			),
			setResearchKey: thuTuc("settings.setResearchKey", khongDoc),
			setAgentModel: thuTuc("settings.setAgentModel", khongDoc),
			setArchiveRetention: thuTuc("settings.setArchiveRetention", khongDoc),
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ settings: async () => {} }),
}));

const { ResearchKey } = await import(
	"@/app/(app)/[slug]/settings/research-key"
);
const { ArchiveRetention } = await import(
	"@/app/(app)/[slug]/settings/archive-retention"
);
const { AgentModel } = await import("@/app/(app)/[slug]/settings/agent-model");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { settingsMessages } = await import("@/lib/messages/settings");

const t = settingsMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

afterEach(() => {
	for (const { o, root } of dangMo) {
		act(() => root.unmount());
		o.remove();
	}
	dangMo = [];
});

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function mo(man: ReactElement): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">{man}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	dangMo.push({ o, root });
	return o;
}

type Control = { ten: string; tim: (the: HTMLElement) => HTMLElement | null };

type DoiChung = {
	o: (the: HTMLElement) => HTMLInputElement | null;
	go: string;
	nut: string;
};

async function go(o: HTMLInputElement, giaTri: string): Promise<void> {
	const datGia = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		datGia?.call(o, giaTri);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

type Card = {
	ten: string;
	man: () => ReactElement;
	lyDo: string;
	daTai: (the: HTMLElement) => boolean;
	giaTri: (the: HTMLElement) => string;
	mongGiaTri: string;
	controls: Control[];
	moKhiCoQuyen: string[];
	doiChung: DoiChung | null;
};

const nutTheoChu = (the: HTMLElement, chu: string) =>
	[...the.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	) ?? null;

const BA_CARD: readonly Card[] = [
	{
		ten: "khoa",
		man: () => <ResearchKey />,
		lyDo: t.nghienCuu.khongDuQuyen,
		daTai: (the) => the.querySelector("input[type=password]") !== null,
		giaTri: (the) =>
			`${the.textContent?.includes(t.nghienCuu.daCam)} ${the.querySelector<HTMLInputElement>("input[type=password]")?.placeholder}`,
		mongGiaTri: "true ••••0001",
		controls: [
			{
				ten: "o khoa",
				tim: (the) => the.querySelector("input[type=password]"),
			},
			{
				ten: "nut thay khoa",
				tim: (the) => nutTheoChu(the, t.nghienCuu.thayKhoa),
			},
		],
		moKhiCoQuyen: ["o khoa"],
		doiChung: {
			o: (the) => the.querySelector("input[type=password]"),
			go: "ccq-khoa-moi-12345",
			nut: "nut thay khoa",
		},
	},
	{
		ten: "luu tru",
		man: () => <ArchiveRetention />,
		lyDo: t.luuTru.khongDuQuyen,
		daTai: (the) => the.querySelector("input[inputmode=numeric]") !== null,
		giaTri: (the) =>
			the.querySelector<HTMLInputElement>("input[inputmode=numeric]")?.value ??
			"",
		mongGiaTri: "42",
		controls: [
			{
				ten: "o so ngay",
				tim: (the) => the.querySelector("input[inputmode=numeric]"),
			},
			{ ten: "nut luu", tim: (the) => nutTheoChu(the, t.luuTru.luu) },
		],
		moKhiCoQuyen: ["o so ngay"],
		doiChung: {
			o: (the) => the.querySelector("input[inputmode=numeric]"),
			go: "43",
			nut: "nut luu",
		},
	},
	{
		ten: "model",
		man: () => <AgentModel />,
		lyDo: t.model.khongDuQuyen,
		daTai: (the) => the.querySelector("[role=combobox]") !== null,
		giaTri: (the) => the.querySelector("[role=combobox]")?.textContent ?? "",
		mongGiaTri: MODEL.name,
		controls: [
			{ ten: "nut chon", tim: (the) => the.querySelector("[role=combobox]") },
		],
		moKhiCoQuyen: ["nut chon"],
		doiChung: null,
	},
];

const HAI_VAI = [false, true] as const;

describe("ccq-man-khoa", () => {
	let soCa = 0;

	for (const card of BA_CARD) {
		for (const vai of HAI_VAI) {
			test(`ccq-man-khoa: ${card.ten} ${vai ? "quan tri" : "thanh vien"}`, async () => {
				coQuyen = vai;
				const o = await mo(card.man());
				await cho(() => card.daTai(o), `${card.ten} da tai`);
				if (card.ten === "model") {
					await cho(
						() =>
							(o.querySelector("[role=combobox]") as HTMLButtonElement | null)
								?.textContent === MODEL.name,
						"model co ten",
					);
				}
				const the = o.querySelector<HTMLElement>("[data-slot=card]");
				expect(`${card.ten}: co the card ${the !== null}`).toBe(
					`${card.ten}: co the card true`,
				);
				if (!the) return;

				expect(`${card.ten}: gia tri ${card.giaTri(the)}`).toBe(
					`${card.ten}: gia tri ${card.mongGiaTri}`,
				);

				if (!vai) {
					for (const control of card.controls) {
						const el = control.tim(the) as
							| (HTMLElement & { disabled?: boolean })
							| null;
						expect(`${card.ten}: ${control.ten} disabled ${el?.disabled}`).toBe(
							`${card.ten}: ${control.ten} disabled true`,
						);
						const id = el?.getAttribute("aria-describedby") ?? "";
						const moTa = id ? document.getElementById(id) : null;
						expect(
							`${card.ten}: ${control.ten} mo ta ton tai ${moTa !== null}`,
						).toBe(`${card.ten}: ${control.ten} mo ta ton tai true`);
						expect(
							`${card.ten}: ${control.ten} mo ta trong card ${moTa !== null && the.contains(moTa)}`,
						).toBe(`${card.ten}: ${control.ten} mo ta trong card true`);
						expect(
							`${card.ten}: ${control.ten} ly do ${moTa?.textContent}`,
						).toBe(`${card.ten}: ${control.ten} ly do ${card.lyDo}`);
					}
				} else {
					expect(
						`${card.ten}: co cau khong du quyen ${the.textContent?.includes(card.lyDo)}`,
					).toBe(`${card.ten}: co cau khong du quyen false`);
					for (const control of card.controls) {
						if (!card.moKhiCoQuyen.includes(control.ten)) continue;
						const el = control.tim(the) as
							| (HTMLElement & { disabled?: boolean })
							| null;
						expect(`${card.ten}: ${control.ten} disabled ${el?.disabled}`).toBe(
							`${card.ten}: ${control.ten} disabled false`,
						);
					}
					if (card.doiChung) {
						const o = card.doiChung.o(the);
						expect(`${card.ten}: co o de go ${o !== null}`).toBe(
							`${card.ten}: co o de go true`,
						);
						if (o) await go(o, card.doiChung.go);
						const nut = card.controls
							.find((c) => c.ten === card.doiChung?.nut)
							?.tim(the) as HTMLButtonElement | null | undefined;
						expect(
							`${card.ten}: ${card.doiChung.nut} bat sau khi go ${nut?.disabled === false}`,
						).toBe(`${card.ten}: ${card.doiChung.nut} bat sau khi go true`);
					}
				}
				soCa += 1;
			});
		}
	}

	test("ccq-man-khoa: dem ca", () => {
		expect(`so ca ${soCa}`).toBe(`so ca ${BA_CARD.length * HAI_VAI.length}`);
	});
});
