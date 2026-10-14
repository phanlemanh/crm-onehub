import { laLienKetHttp, lienKetAnToan } from "@crm/ui/lib/lien-ket-an-toan";

const BO_HAN = new Set([
	"style",
	"script",
	"meta",
	"link",
	"title",
	"xml",
	"img",
	"picture",
	"svg",
	"video",
	"audio",
	"object",
	"embed",
	"iframe",
	"canvas",
	"colgroup",
	"col",
	"template",
	"noscript",
]);

const DOI_TEN = new Map([
	["b", "strong"],
	["i", "em"],
	["h1", "h2"],
	["h4", "h3"],
	["h5", "h3"],
	["h6", "h3"],
]);

const GIU = new Set([
	"p",
	"br",
	"h2",
	"h3",
	"ul",
	"ol",
	"li",
	"table",
	"thead",
	"tbody",
	"tr",
	"th",
	"td",
	"strong",
	"em",
	"a",
]);

const DANH_SACH = new Set(["UL", "OL"]);

const DAM = /(^|;)\s*font-weight\s*:\s*(bold(er)?|[6-9]\d\d)\b/i;
const THUONG = /(^|;)\s*font-weight\s*:\s*(normal|[1-5]\d\d)\b/i;
const NGHIENG = /(^|;)\s*font-style\s*:\s*italic\b/i;
const MUC_WORD = /mso-list\s*:\s*l(\d+)\s+level(\d+)/i;
const DAU_WORD = /mso-list\s*:\s*ignore/i;
const DAU_SO = /^\s*(\d+|[a-z]{1,3})[.)]/i;
const TRANG = /^\s*$/;
const KHOI_CHU = "p, h2, h3, li, td, th";
const THE_KHOI = new Set(["P", "H2", "H3", "UL", "OL", "TABLE"]);
const KIEU_TIEU_DE_2 = /(heading\s*1\b|heading1\b|^msotitle$)/i;
const KIEU_TIEU_DE_3 = /(heading|^msosubtitle$)/i;

function kieu(el: Element): string {
	return el.getAttribute("style") ?? "";
}

function goBoc(el: Element): void {
	el.replaceWith(...Array.from(el.childNodes));
}

function doiThe(el: Element, ten: string): Element {
	const moi = el.ownerDocument.createElement(ten);
	moi.append(...Array.from(el.childNodes));
	el.replaceWith(moi);
	return moi;
}

function boRac(goc: Element): void {
	const duyet = goc.ownerDocument.createTreeWalker(
		goc,
		NodeFilter.SHOW_COMMENT,
	);
	const chuThich: Node[] = [];
	for (let n = duyet.nextNode(); n; n = duyet.nextNode()) chuThich.push(n);
	for (const n of chuThich) n.parentNode?.removeChild(n);
	for (const el of Array.from(goc.querySelectorAll("*"))) {
		const ten = el.tagName.toLowerCase();
		if (BO_HAN.has(ten) || ten.includes(":")) el.remove();
	}
}

function boBocGoogleDocs(goc: Element): void {
	for (const b of Array.from(goc.querySelectorAll("b"))) {
		const id = b.getAttribute("id") ?? "";
		if (id.startsWith("docs-internal-guid") || THUONG.test(kieu(b))) {
			goBoc(b);
		}
	}
}

function boc(el: Element, ten: string): void {
	const vo = el.ownerDocument.createElement(ten);
	vo.append(...Array.from(el.childNodes));
	el.append(vo);
}

function kieuThanhThe(goc: Element): void {
	for (const el of Array.from(goc.querySelectorAll("span, font"))) {
		const s = kieu(el);
		if (DAM.test(s)) boc(el, "strong");
		if (NGHIENG.test(s)) boc(el, "em");
	}
}

type MucWord = { p: Element; ds: string; cap: number };

function mucWord(p: Element): MucWord | null {
	const khop = MUC_WORD.exec(kieu(p));
	if (!khop?.[1] || !khop[2]) return null;
	return { p, ds: khop[1], cap: Number(khop[2]) };
}

function danhSachWord(goc: Element): void {
	const muc = Array.from(goc.querySelectorAll("p"))
		.map(mucWord)
		.filter((m): m is MucWord => m !== null);
	const noiTiep = muc.map((m, i) => {
		const truoc = muc[i - 1];
		return (
			truoc !== undefined &&
			m.p.previousElementSibling === truoc.p &&
			m.ds === truoc.ds
		);
	});
	const tai = goc.ownerDocument;
	let ngan: { cap: number; ds: Element }[] = [];
	muc.forEach(({ p, cap }, i) => {
		const dau = Array.from(p.querySelectorAll("[style]")).find((el) =>
			DAU_WORD.test(kieu(el)),
		);
		const the = DAU_SO.test(dau?.textContent ?? "") ? "OL" : "UL";
		dau?.remove();
		if (!noiTiep[i]) ngan = [];
		while (ngan.length > 0 && (ngan.at(-1)?.cap ?? 0) > cap) ngan.pop();
		let dinh = ngan.at(-1);
		if (dinh && dinh.cap === cap && dinh.ds.tagName !== the) {
			ngan.pop();
			const moi = tai.createElement(the);
			dinh.ds.after(moi);
			dinh = { cap, ds: moi };
			ngan.push(dinh);
		}
		if (!dinh || dinh.cap < cap) {
			const ds = tai.createElement(the);
			const cha = dinh?.ds.lastElementChild;
			if (cha) cha.append(ds);
			else p.before(ds);
			dinh = { cap, ds };
			ngan.push(dinh);
		}
		const li = tai.createElement("li");
		dinh.ds.append(li);
		li.append(p);
	});
}

function dauBangLaTieuDe(goc: Element): void {
	for (const bang of Array.from(goc.querySelectorAll("table"))) {
		if (bang.querySelector("th")) continue;
		const dau = bang.querySelector("tr");
		for (const o of Array.from(dau?.children ?? [])) {
			if (o.tagName === "TD") doiThe(o, "th");
		}
	}
}

function longDanhSach(goc: Element): void {
	for (const ds of Array.from(goc.querySelectorAll("ul, ol"))) {
		const cha = ds.parentElement;
		if (!cha || !DANH_SACH.has(cha.tagName)) continue;
		const truoc = ds.previousElementSibling;
		if (truoc?.tagName === "LI") truoc.append(ds);
		else {
			const li = ds.ownerDocument.createElement("li");
			ds.replaceWith(li);
			li.append(ds);
		}
	}
}

type DemDan = { boHttp: number };

function lamSach(el: Element, dem: DemDan): void {
	for (const con of Array.from(el.children)) lamSach(con, dem);
	if (el.tagName === "BODY") return;
	const goc = el.tagName.toLowerCase();
	const ten = DOI_TEN.get(goc) ?? goc;
	const hienTai = ten === goc ? el : doiThe(el, ten);
	if (!GIU.has(ten)) {
		goBoc(hienTai);
		return;
	}
	const href = ten === "a" ? hienTai.getAttribute("href")?.trim() : undefined;
	for (const thuocTinh of Array.from(hienTai.attributes)) {
		hienTai.removeAttribute(thuocTinh.name);
	}
	if (ten !== "a") return;
	if (href && lienKetAnToan(href)) {
		hienTai.setAttribute("href", href);
		return;
	}
	if (href && laLienKetHttp(href)) dem.boHttp += 1;
	goBoc(hienTai);
}

function boDoanRong(goc: Element): void {
	for (const con of Array.from(goc.children)) {
		if (con.tagName === "BR") con.remove();
	}
	for (const p of Array.from(goc.querySelectorAll("p, h2, h3"))) {
		if (p.closest("td, th, li")) continue;
		if (TRANG.test(p.textContent ?? "")) p.remove();
	}
}

function tieuDeKieuWord(goc: Element): void {
	for (const p of Array.from(goc.querySelectorAll("p[class]"))) {
		const lop = p.getAttribute("class") ?? "";
		if (KIEU_TIEU_DE_2.test(lop)) doiThe(p, "h2");
		else if (KIEU_TIEU_DE_3.test(lop)) doiThe(p, "h3");
	}
}

function gomChuTran(goc: Element): void {
	let nhom: ChildNode[] = [];
	const dong = (): void => {
		if (nhom.some((n) => !TRANG.test(n.textContent ?? ""))) {
			const p = goc.ownerDocument.createElement("p");
			nhom[0]?.before(p);
			p.append(...nhom);
		} else for (const n of nhom) n.remove();
		nhom = [];
	};
	for (const n of Array.from(goc.childNodes)) {
		if (n instanceof Element && THE_KHOI.has(n.tagName)) dong();
		else nhom.push(n);
	}
	dong();
}

function boDinhDangTieuDe(goc: Element): void {
	for (const el of Array.from(
		goc.querySelectorAll("h2 strong, h3 strong, h2 em, h3 em"),
	)) {
		goBoc(el);
	}
}

function nutChu(khoi: Element): Text[] {
	const duyet = khoi.ownerDocument.createTreeWalker(khoi, NodeFilter.SHOW_TEXT);
	const ra: Text[] = [];
	for (let n = duyet.nextNode(); n; n = duyet.nextNode()) {
		if (n instanceof Text) ra.push(n);
	}
	return ra;
}

function gonKhoangTrang(goc: Element): void {
	for (const t of nutChu(goc)) {
		t.data = t.data.replace(/\u00a0/g, " ").replace(/ {2,}/g, " ");
	}
	for (const khoi of Array.from(goc.querySelectorAll(KHOI_CHU))) {
		const chu = nutChu(khoi);
		const dau = chu[0];
		const cuoi = chu.at(-1);
		if (dau) dau.data = dau.data.replace(/^\s+/, "");
		if (cuoi) cuoi.data = cuoi.data.replace(/\s+$/, "");
	}
}

export type KetDan = { html: string; boHttp: number };

export function locDanDem(html: string): KetDan {
	const dem: DemDan = { boHttp: 0 };
	const tai = new DOMParser().parseFromString(html, "text/html");
	const goc = tai.body;
	boRac(tai.documentElement);
	danhSachWord(goc);
	for (const el of Array.from(goc.querySelectorAll("[style]"))) {
		if (DAU_WORD.test(kieu(el))) el.remove();
	}
	boBocGoogleDocs(goc);
	tieuDeKieuWord(goc);
	kieuThanhThe(goc);
	longDanhSach(goc);
	dauBangLaTieuDe(goc);
	lamSach(goc, dem);
	boDinhDangTieuDe(goc);
	boDoanRong(goc);
	gomChuTran(goc);
	gonKhoangTrang(goc);
	return { html: goc.innerHTML, boHttp: dem.boHttp };
}

export function locDan(html: string): string {
	return locDanDem(html).html;
}
