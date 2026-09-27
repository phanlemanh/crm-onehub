import { ZALO } from "./zalo-config";

const PHAN_CACH = String.raw`[\s.\-]{0,3}`;
const SO_DIEN_THOAI = new RegExp(
	[
		String.raw`\(?(?:\+|00)\d{1,3}\)?${PHAN_CACH}(?:\(0\)${PHAN_CACH})?(?:\d${PHAN_CACH}){7,11}\d`,
		String.raw`\(?0\d{1,4}\)?${PHAN_CACH}(?:\d${PHAN_CACH}){5,9}\d`,
		String.raw`84\d{9}`,
	]
		.map((mau) => `(?<![\\d+])${mau}(?!\\d)`)
		.join("|"),
	"gu",
);
const SO_TIEN =
	/(?<![\d+])(?<!(?:\+|00)\d{1,3}[\s.-]?)(?<!\(\+?\d{1,3}\)[\s.-]?)[1-9]\d{0,2}([.,])\d{3}(?:\1\d{3})+(?!\d)/gu;
const CHU_SO = /\d/gu;
const THU = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gu;
const DONG_KE_BANG = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$/u;
const DONG_BANG = /^\s*\|(.*)\|\s*$/u;
const RANH_CAU = /(?<=[.!?…])\s+/u;

function laSoDienThoai(khop: string): boolean {
	const so = khop.match(CHU_SO)?.length ?? 0;
	return so >= ZALO.hoi.soChuSo.min && so <= ZALO.hoi.soChuSo.max;
}

function cheSo(text: string): string {
	return text.replace(SO_DIEN_THOAI, (khop) =>
		laSoDienThoai(khop) ? ZALO.hoi.an : khop,
	);
}

function che(text: string): string {
	let ra = "";
	let tu = 0;
	for (const khop of text.matchAll(SO_TIEN)) {
		ra += cheSo(text.slice(tu, khop.index)) + khop[0];
		tu = khop.index + khop[0].length;
	}
	return (ra + cheSo(text.slice(tu))).replace(THU, ZALO.hoi.an);
}

function boBang(text: string): string {
	return text
		.split("\n")
		.filter((dong) => !DONG_KE_BANG.test(dong))
		.map((dong) => {
			const khop = DONG_BANG.exec(dong);
			if (!khop?.[1]) return dong;
			return khop[1]
				.split("|")
				.map((o) => o.trim())
				.join(" · ");
		})
		.join("\n");
}

type Manh = { chu: string; noi: string };

function tachCung(chu: string, tran: number): string[] {
	const ra: string[] = [];
	for (let i = 0; i < chu.length; i += tran) ra.push(chu.slice(i, i + tran));
	return ra;
}

function tachDoan(doan: string, tran: number): Manh[] {
	if (doan.length <= tran) return [{ chu: doan, noi: "\n\n" }];
	return doan.split("\n").flatMap((dong, i) => {
		const noi = i === 0 ? "\n\n" : "\n";
		if (dong.length <= tran) return [{ chu: dong, noi }];
		return dong.split(RANH_CAU).flatMap((cau, j) => {
			const noiCau = j === 0 ? noi : " ";
			return tachCung(cau, tran).map((phan, k) => ({
				chu: phan,
				noi: k === 0 ? noiCau : "",
			}));
		});
	});
}

function gom(manh: Manh[], tran: number): string[] {
	const phan: string[] = [];
	let dang = "";
	for (const m of manh) {
		const them = dang === "" ? m.chu : `${dang}${m.noi}${m.chu}`;
		if (them.length <= tran) {
			dang = them;
			continue;
		}
		if (dang !== "") phan.push(dang);
		dang = m.chu;
	}
	if (dang !== "") phan.push(dang);
	return phan;
}

export function locTraLoi(text: string): string[] {
	const sach = boBang(che(text)).trim();
	const tran = ZALO.tranKyTu - ZALO.hoi.luoc.length;
	const manh = sach.split(/\n{2,}/u).flatMap((doan) => tachDoan(doan, tran));
	const phan = gom(manh, tran);
	if (phan.length <= ZALO.hoi.toiDaTin) return phan;
	const giu = phan.slice(0, ZALO.hoi.toiDaTin);
	return giu.map((p, i) => (i === giu.length - 1 ? `${p}${ZALO.hoi.luoc}` : p));
}
