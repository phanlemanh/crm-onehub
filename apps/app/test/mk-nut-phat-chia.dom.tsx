import { describe, expect, it, mock } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";

type ChiaDaPhat = { url: string; expiresAt: string };

type ChonPhatChia = {
	onSuccess?: (data: ChiaDaPhat) => void;
	onError?: (error: { message: string }) => void;
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		workspace: {
			issuePasswordLink: {
				mutationOptions: (chon: ChonPhatChia) => ({
					...chon,
					mutationFn: async (): Promise<ChiaDaPhat> => ({
						expiresAt: "",
						url: "",
					}),
				}),
			},
		},
	}),
}));

const { PhatChiaButton } = await import(
	"@/app/(app)/[slug]/settings/members/phat-chia-button"
);
const { thanhVienMessages } = await import(
	"@/lib/messages/settings-thanh-vien"
);

const t = thanhVienMessages("vi");

function dungNut(coQuyen: boolean): HTMLButtonElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	act(() => {
		root.render(
			h(
				QueryClientProvider,
				{ client: new QueryClient() },
				h(PhatChiaButton, {
					coQuyen,
					email: "priya@trycomp.ai",
					t,
					ten: "Priya",
				}),
			),
		);
	});
	const nut = o.querySelector("button");
	if (!nut) {
		root.unmount();
		o.remove();
		throw new Error("khong dung ra nut nao");
	}
	const ban = nut.cloneNode(true) as HTMLButtonElement;
	act(() => {
		root.unmount();
	});
	o.remove();
	return ban;
}

describe("quyen-hai-ve-tren-man", () => {
	it("thanh vien thuong: nut phat lien ket tat, va co ly do doc duoc", () => {
		const nut = dungNut(false);

		expect(nut.hasAttribute("disabled")).toBe(true);
		expect(nut.getAttribute("title")).toBe(t.phatChia.canQuyen);
	});

	it("quan tri: nut phat lien ket bam duoc, khong gan ly do chan", () => {
		const nut = dungNut(true);

		expect(nut.hasAttribute("disabled")).toBe(false);
		expect(nut.getAttribute("title")).toBeNull();
	});

	it("nhan nut la chu tieng Viet cua kho, khong phai chuoi tu duc", () => {
		const nut = dungNut(true);

		expect(nut.textContent).toBe(t.phatChia.nut);
	});
});
