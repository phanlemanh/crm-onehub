import type { Locale } from "@crm/ui/lib/locale";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";

export type MucDuongDan = { nhan: string; href: string | null };

const TRANG_CON =
	/^\/([^/]+)\/settings\/connections\/(google|microsoft|slack|zalo|intake)(\/people)?\/?$/;

export function duongCaiDat(
	pathname: string,
	locale: Locale,
): MucDuongDan[] | null {
	const khop = TRANG_CON.exec(pathname);
	if (!khop) return null;

	const [, slug, loai, nguoi] = khop;
	if (nguoi && loai !== "slack") return null;

	const t = ketNoiMessages(locale);
	const goc = `/${slug}/settings/connections`;
	const ten = {
		google: t.ten.google,
		microsoft: t.ten.microsoft,
		slack: t.ten.slack,
		zalo: t.ten.zalo,
		intake: t.tiepNhan.tieuDe,
	}[loai as "google" | "microsoft" | "slack" | "zalo" | "intake"];

	const dau: MucDuongDan = { nhan: t.danhSach.tieuDe, href: goc };

	return nguoi
		? [
				dau,
				{ nhan: ten, href: `${goc}/slack` },
				{ nhan: t.nguoi.nhan, href: null },
			]
		: [dau, { nhan: ten, href: null }];
}
