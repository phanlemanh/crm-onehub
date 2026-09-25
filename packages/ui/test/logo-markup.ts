import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Logo from "../src/components/logo";
import { MessageAvatar } from "../src/components/message";

export function markupAnhDaiDien(): string {
	return renderToStaticMarkup(
		createElement(
			MessageAvatar,
			{ square: true },
			createElement(Logo, { className: "size-5" }),
		),
	);
}
