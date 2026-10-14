import { describe, expect, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { formatNgayGio } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { DongGioLay } from "@/components/lo-trinh/dong-gio-lay";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";

const LAY_LUC = "2026-10-14T08:02:00.000Z";
const NGUON = ["ban-chup", "ban-dung"] as const;
const NGON_NGU: Locale[] = ["vi", "en"];

function cay(locale: Locale, kieu: (typeof NGUON)[number]) {
	return (
		<LocaleProvider locale={locale}>
			<DongGioLay nguon={{ kieu, layLuc: LAY_LUC }} />
		</LocaleProvider>
	);
}

describe("dong-gio", () => {
	test("tien trinh chay o mui gio khac Viet Nam", () => {
		expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
			"America/New_York",
		);
	});

	for (const kieu of NGUON)
		for (const locale of NGON_NGU)
			test(`${kieu} x ${locale}: gio theo mui trinh duyet, nhan ban dung dung ngon ngu`, async () => {
				const m = loTrinhMessages(locale);
				const vung = document.createElement("div");
				document.body.append(vung);
				const goc = createRoot(vung);
				await act(async () => goc.render(cay(locale, kieu)));
				const dong = vung.querySelector("[data-slot=gio-lay-lo-trinh]");
				const gio = formatNgayGio(LAY_LUC, locale, {
					timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					phan: "ngay-gio",
				});
				expect(dong?.textContent ?? "").toContain(gio);
				expect(dong?.textContent ?? "").toContain(m.gioLay.capNhat(gio));
				expect((dong?.textContent ?? "").includes(m.gioLay.banDung)).toBe(
					kieu === "ban-dung",
				);
				await act(async () => goc.unmount());
				vung.remove();
			});

	test("may chu khong in gio nao", () => {
		for (const kieu of NGUON)
			for (const locale of NGON_NGU)
				expect(renderToString(cay(locale, kieu))).not.toContain(
					"gio-lay-lo-trinh",
				);
	});
});
