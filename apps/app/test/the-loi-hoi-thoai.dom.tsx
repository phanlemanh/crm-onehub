import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import suKien from "../../api/test/fixtures/loi-hoi-thoai-events.json";

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { BuilderFailureCard } = await import(
	"@/components/agent-builder/builder-failure-card"
);
const { latestTurnFailure } = await import("@/lib/agent-transcript");
const { troChuyenMessages } = await import(
	"@/lib/messages/agent-builder-tro-chuyen"
);

type Loi = NonNullable<ReturnType<typeof latestTurnFailure>>;

const MA = "TOOL_EXECUTION_FAILED";
const LOI_THO = "search_crm: query too short";
const CAU = {
	"rate-limit": "choPhut",
	restricted: "canTra",
	credits: "hetTien",
	unknown: "chung",
} as const;

let goc: Root | null = null;
let khung: HTMLDivElement | null = null;

afterEach(() => {
	act(() => goc?.unmount());
	khung?.remove();
	goc = null;
	khung = null;
});

function ve(locale: "vi" | "en", loi: Loi): HTMLDivElement {
	const o = document.createElement("div");
	document.body.append(o);
	const r = createRoot(o);
	khung = o;
	goc = r;
	act(() =>
		r.render(
			<LocaleProvider locale={locale}>
				<BuilderFailureCard
					failure={loi}
					creatingAgent={false}
					retrying={false}
					onRetry={() => {}}
				/>
			</LocaleProvider>,
		),
	);
	return o;
}

describe("the-loi-theo-kind", () => {
	for (const locale of ["vi", "en"] as const) {
		for (const kind of [
			"rate-limit",
			"restricted",
			"credits",
			"unknown",
		] as const) {
			test(`${locale} ${kind}`, () => {
				const t = troChuyenMessages(locale);
				const the = ve(locale, { code: MA, kind });
				const chu = the.textContent ?? "";

				expect(chu, "the loi hien ma loi").toContain(`${t.loi.maLoi}: ${MA}`);
				const ma = [...the.querySelectorAll("[translate='no']")].find(
					(el) => el.textContent === MA,
				);
				expect(ma, "ma loi mang translate=no").toBeDefined();
				expect(chu).toContain(t.loi[CAU[kind]]);
				expect(chu).toContain(t.dung.thuLai);
				expect(chu).not.toContain(LOI_THO);
			});
		}
	}
});

describe("the-loi-tu-su-kien", () => {
	test("ma loi di tu su kien toi the", () => {
		const loi = latestTurnFailure(suKien);
		expect(loi).not.toBeNull();
		if (!loi) return;

		const the = ve("vi", loi);

		expect(the.textContent, "ma loi di tu su kien toi the").toContain(
			`Mã lỗi: ${MA}`,
		);
	});
});
