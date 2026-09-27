import { type AnyExtension, type JSONContent, Node } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import { OrderedList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { MarkdownManager } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { z } from "zod";
import { chuanNfc, TAI_LIEU } from "./tai-lieu";

export const CAP_TIEU_DE = [2, 3] as const;

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
	TableKit,
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
