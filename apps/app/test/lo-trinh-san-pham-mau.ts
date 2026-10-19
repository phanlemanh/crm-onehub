import { readFileSync } from "node:fs";
import path from "node:path";
import type { HangBanChupLuu } from "@crm/validation/ban-chup-lo-trinh";
import {
	type LoTrinhDuLieu,
	phanTichLoTrinh,
} from "@crm/validation/lo-trinh-du-lieu";
import { docDuLieu } from "@/lib/lo-trinh/doc-du-lieu.js";
import type { SanPhamTrang } from "@/lib/lo-trinh/san-pham";

export const GOC = path.join(import.meta.dir, "..", "..", "..");
export const HTML_KIT = readFileSync(
	path.join(GOC, "apps/agent/test/mau/lo-trinh-kit.html"),
	"utf8",
);
export const SHA_KIT = "c".repeat(40);
export const LAY_LUC = "2026-10-20T01:05:00Z";

export const SP_KIT: SanPhamTrang = {
	ma: "kit",
	ten: "Kit nghiệm thu",
	kho: "phanlemanh/acceptance-gate-kit",
	nhanh: "main",
	trangThaiLay: "da-lay",
	nguonDoi: false,
};

export function hangCua(html = HTML_KIT, layLuc = LAY_LUC): HangBanChupLuu {
	const { duLieu, canhBao } = docDuLieu(html);
	return {
		sha: SHA_KIT,
		commitLuc: new Date("2026-10-19T10:00:00Z"),
		layLuc: new Date(layLuc),
		duLieu: JSON.parse(JSON.stringify(duLieu)),
		canhBao,
	};
}

const KHOI =
	/(<script type="application\/json" id="lo-trinh-du-lieu">)([\s\S]*?)(<\/script>)/;

export function khoiKit(): {
	json: LoTrinhDuLieu;
	ghep: (chu: string) => string;
} {
	const m = KHOI.exec(HTML_KIT);
	if (!m) throw new Error("mau kit khong co khoi");
	const kq = phanTichLoTrinh(docDuLieu(HTML_KIT).duLieu);
	if (!kq.ok) throw new Error(`mau kit khong qua khuon: ${kq.duongKhoa}`);
	return {
		json: kq.duLieu,
		ghep: (chu) => HTML_KIT.replace(m[0], `${m[1]}${chu}${m[3]}`),
	};
}

export function khongMoHinh(o: LoTrinhDuLieu) {
	return {
		...o,
		lo_trinh: o.lo_trinh.map(({ chua_hen_moc: _a, ...t }) => ({
			...t,
			hang: t.hang.map(({ ten_hien_thi: _b, ...h }) => h),
			moc: t.moc.map(({ hien: _c, viec_hien: _d, con_lai: _e, ...m }) => m),
		})),
	};
}

export function banMot(o: LoTrinhDuLieu) {
	return {
		...o,
		phien_ban: 1,
		lo_trinh: o.lo_trinh.map((t) => ({
			...t,
			hang: t.hang.map(({ tom_tat: _t, ...h }) => h),
		})),
	};
}
