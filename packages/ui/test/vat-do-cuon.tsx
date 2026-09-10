import {
	Conversation,
	ConversationContent,
} from "@crm/ui/components/ai-elements/conversation";
import {
	MessageScroller,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@crm/ui/components/message-scroller";
import { createElement as h, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

export type KieuVat = "conversation" | "message-scroller";

const CHU =
	"Khách hàng hỏi về hạn mức và phí trả trước; cần đối chiếu với hồ sơ môi giới đã nộp tuần trước rồi trả lời trong ngày.";

const SO_DOAN = 3;

const SO_NHAN = 6;

function than(khoa: string): ReactNode {
	return h(
		"div",
		{ className: "flex gap-3", "data-luot": "", key: khoa },
		h("div", { className: "size-8 shrink-0 rounded-md bg-muted" }),
		h(
			"div",
			{ className: "flex min-w-0 flex-1 flex-col gap-2" },
			...Array.from({ length: SO_DOAN }, (_, i) =>
				h(
					"p",
					{ className: "rounded-lg bg-muted p-3", key: `d${i}` },
					`${CHU} ${CHU}`,
				),
			),
			h(
				"div",
				{ className: "flex flex-wrap gap-1" },
				...Array.from({ length: SO_NHAN }, (_, i) =>
					h(
						"span",
						{
							className: "rounded-sm border px-1.5 py-0.5 text-xs",
							key: `n${i}`,
						},
						`nguồn-${i}`,
					),
				),
			),
		),
	);
}

function cayConversation(soLuot: number): ReactNode {
	return h(
		Conversation,
		null,
		h(
			ConversationContent,
			null,
			...Array.from({ length: soLuot }, (_, i) => than(`cv-${i}`)),
		),
	);
}

function cayMessageScroller(soLuot: number): ReactNode {
	return h(
		MessageScrollerProvider,
		null,
		h(
			MessageScroller,
			null,
			h(
				MessageScrollerViewport,
				null,
				h(
					MessageScrollerContent,
					null,
					...Array.from({ length: soLuot }, (_, i) =>
						h(
							MessageScrollerItem,
							{ key: `ms-${i}`, messageId: `ms-${i}` },
							than(`ms-than-${i}`),
						),
					),
				),
			),
		),
	);
}

function mauThat(kieu: KieuVat, soLuot: number): HTMLElement {
	const o = document.createElement("div");
	o.setAttribute("data-san-dung", kieu);
	o.style.position = "absolute";
	o.style.left = "-99999px";
	o.style.top = "0";
	o.style.width = "760px";
	o.style.height = "600px";
	document.body.appendChild(o);

	const root = createRoot(o);
	flushSync(() => {
		root.render(
			kieu === "conversation"
				? cayConversation(soLuot)
				: cayMessageScroller(soLuot),
		);
	});

	const goc = o.firstElementChild;
	if (!goc) {
		root.unmount();
		o.remove();
		throw new Error(`vat-do-cuon: ${kieu} khong dung ra phan tu nao`);
	}

	const ban = goc.cloneNode(true) as HTMLElement;
	root.unmount();
	o.remove();
	return ban;
}

declare global {
	interface Window {
		VAT_DO_CUON: { mauThat: typeof mauThat };
	}
}

window.VAT_DO_CUON = { mauThat };
