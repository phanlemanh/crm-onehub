import {
	type AnyExtension,
	type JSONContent,
	type MarkdownRendererHelpers,
	Node,
} from "@tiptap/core";
import Link from "@tiptap/extension-link";
import { OrderedList } from "@tiptap/extension-list";
import {
	renderTableToMarkdown,
	Table,
	TableKit,
} from "@tiptap/extension-table";
import { MarkdownManager } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { z } from "zod";
import { chuanNfc, slugTuDuongDan, TAI_LIEU } from "./tai-lieu";

export const CAP_TIEU_DE = [2, 3] as const;

function thoatOng(h: MarkdownRendererHelpers): MarkdownRendererHelpers {
	return {
		...h,
		renderChildren: (...thamSo: Parameters<typeof h.renderChildren>) =>
			h.renderChildren(...thamSo).replace(/\|/g, "\\|"),
	};
}

const BangThoatOng = Table.extend({
	renderMarkdown: (nut: JSONContent, h: MarkdownRendererHelpers) =>
		renderTableToMarkdown(nut, thoatOng(h)),
});

export const PHAN_MO_RONG: AnyExtension[] = [
	StarterKit.configure({
		codeBlock: false,
		code: false,
		blockquote: false,
		horizontalRule: false,
		strike: false,
		orderedList: false,
		underline: false,
		link: false,
		heading: { levels: [...CAP_TIEU_DE] },
	}),
	Node.create({ ...OrderedList.config, markdownTokenizer: undefined }),
	TableKit.configure({ table: false }),
	BangThoatOng,
	Link.configure({ openOnClick: false }),
];

const LOAI_DANH_SACH = new Set(["bulletList", "orderedList"]);

let boQuanLy: MarkdownManager | null = null;

function quanLy(): MarkdownManager {
	boQuanLy ??= new MarkdownManager({ extensions: PHAN_MO_RONG });
	return boQuanLy;
}

const thuocTinhTieuDe = z.object({ level: z.number().int() });
const thuocTinhLienKet = z.object({ href: z.string() });

function capHopLe(attrs: JSONContent["attrs"]): number {
	const { level } = thuocTinhTieuDe.parse(attrs);
	return Math.min(Math.max(level, CAP_TIEU_DE[0]), CAP_TIEU_DE[1]);
}

function gopDanhSach(con: JSONContent[]): JSONContent[] {
	const ra: JSONContent[] = [];
	for (const nut of con) {
		const truoc = ra.at(-1);
		if (
			truoc &&
			nut.type &&
			LOAI_DANH_SACH.has(nut.type) &&
			truoc.type === nut.type
		) {
			truoc.content = truoc.content ?? [];
			truoc.content.push(...(nut.content ?? []));
			continue;
		}
		ra.push(nut);
	}
	return ra;
}

function lamGon(nut: JSONContent): JSONContent {
	const ra: JSONContent =
		nut.type === "heading"
			? { ...nut, attrs: { ...nut.attrs, level: capHopLe(nut.attrs) } }
			: { ...nut };
	if (nut.content) ra.content = gopDanhSach(nut.content.map(lamGon));
	return ra;
}

const RAO = /^ {0,3}(`{3,}|~{3,})/;
const MUC = /^(?:[-+*]|\d{1,9}[.)])[ \t]/;

function catSauDongTrong(dong: string[], i: number): boolean {
	const sau = dong[i + 1];
	return (
		dong[i] === "" &&
		i > 0 &&
		dong[i - 1] !== "" &&
		sau !== undefined &&
		/^\S/.test(sau)
	);
}

function chiaKhoi(md: string): string[] {
	const dong = md.split("\n");
	const ra: string[] = [];
	let dau = 0;
	let dai = 0;
	let trongRao = false;
	let trongMuc = false;
	for (let i = 0; i < dong.length; i += 1) {
		const d = dong[i] as string;
		if (RAO.test(d)) trongRao = !trongRao;
		if (/^\S/.test(d)) trongMuc = MUC.test(d);
		dai += d.length + 1;
		if (trongRao || dai < TAI_LIEU.nap.coKhoi) continue;
		if (i > dau && catSauDongTrong(dong, i)) {
			ra.push(dong.slice(dau, i).join("\n"));
			dau = i + 1;
			dai = 0;
			continue;
		}
		const sau = dong[i + 1];
		if (trongMuc && d !== "" && sau !== undefined && MUC.test(sau)) {
			ra.push(dong.slice(dau, i + 1).join("\n"));
			dau = i + 1;
			dai = 0;
		}
	}
	ra.push(dong.slice(dau).join("\n"));
	return ra;
}

export function nap(md: string): JSONContent {
	const phan = chiaKhoi(md);
	const doc =
		phan.length === 1
			? quanLy().parse(md)
			: {
					type: "doc",
					content: phan.flatMap((p) => quanLy().parse(p).content ?? []),
				};
	return lamGon(doc);
}

export function tuanTuHoa(doc: JSONContent): string {
	return quanLy().serialize(lamGon(doc));
}

export function chuanHoa(md: string): string {
	return tuanTuHoa(nap(chuanNfc(md)));
}

export type LienKet = { den: string; vanBan: string };

function hrefCua(nut: JSONContent): string | null {
	const mark = nut.marks?.find((m) => m.type === "link");
	return mark ? thuocTinhLienKet.parse(mark.attrs).href : null;
}

function gomLienKet(nut: JSONContent, ra: LienKet[]): void {
	let dangMo: LienKet | null = null;
	for (const con of nut.content ?? []) {
		const den = con.type === "text" ? hrefCua(con) : null;
		if (den === null) {
			dangMo = null;
			if (con.content) gomLienKet(con, ra);
			continue;
		}
		if (dangMo && dangMo.den === den) {
			dangMo.vanBan += con.text ?? "";
			continue;
		}
		dangMo = { den, vanBan: con.text ?? "" };
		ra.push(dangMo);
	}
}

export function rutLienKet(md: string): LienKet[] {
	const ra: LienKet[] = [];
	gomLienKet(nap(chuanNfc(md)), ra);
	return ra;
}

const KHOI_CHU = new Set(["paragraph", "heading"]);

function chuCuaKhoi(nut: JSONContent): string {
	return (nut.content ?? [])
		.map((con) =>
			con.type === "text"
				? (con.text ?? "")
				: con.type === "hardBreak"
					? " "
					: chuCuaKhoi(con),
		)
		.join("");
}

function gomKhoi(nut: JSONContent, ra: JSONContent[]): void {
	if (nut.type && KHOI_CHU.has(nut.type)) {
		ra.push(nut);
		return;
	}
	for (const con of nut.content ?? []) gomKhoi(con, ra);
}

function khoiCua(md: string): JSONContent[] {
	const ra: JSONContent[] = [];
	gomKhoi(nap(chuanNfc(md)), ra);
	return ra;
}

export function chuThuong(md: string): string {
	return khoiCua(md)
		.map(chuCuaKhoi)
		.filter((dong) => dong.length > 0)
		.join("\n");
}

export type CauLienKet = { cau: string; vanBan: string; soLan: number };

function catQuanh(cau: string, vanBan: string): string {
	const kyTu = Array.from(cau);
	const tran = TAI_LIEU.tim.cauToiDa;
	if (kyTu.length <= tran) return cau;
	const viTri = Array.from(
		cau.slice(0, Math.max(0, cau.indexOf(vanBan))),
	).length;
	const dai = Array.from(vanBan).length;
	const ben = Math.max(0, Math.floor((tran - dai) / 2));
	let dau = Math.max(0, viTri - ben);
	let cuoi = Math.min(kyTu.length, dau + tran);
	dau = Math.max(0, cuoi - tran);
	while (dau > 0 && dau < viTri && kyTu[dau - 1] !== " ") dau += 1;
	while (cuoi < kyTu.length && cuoi > viTri + dai && kyTu[cuoi] !== " ")
		cuoi -= 1;
	return kyTu.slice(dau, cuoi).join("").trim();
}

export function cauChuaLienKet(md: string, denSlug: string): CauLienKet | null {
	let dau: CauLienKet | null = null;
	let soLan = 0;
	for (const khoi of khoiCua(md)) {
		const lienKet: LienKet[] = [];
		gomLienKet(khoi, lienKet);
		const trung = lienKet.filter((l) => slugTuDuongDan(l.den) === denSlug);
		soLan += trung.length;
		const dauTien = trung[0];
		if (!dau && dauTien) {
			dau = {
				cau: catQuanh(chuCuaKhoi(khoi), dauTien.vanBan),
				vanBan: dauTien.vanBan,
				soLan: 0,
			};
		}
	}
	return dau ? { ...dau, soLan } : null;
}

export function nutLienKetTrang(ten: string, duong: string): JSONContent {
	return {
		type: "text",
		text: chuanNfc(ten),
		marks: [{ type: "link", attrs: { href: duong } }],
	};
}
