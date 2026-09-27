import type { AnyExtension, JSONContent } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import { MarkdownManager } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { chuanNfc } from "./tai-lieu";

export const CAP_TIEU_DE = [2, 3] as const;

export const PHAN_MO_RONG: AnyExtension[] = [
	StarterKit.configure({
		codeBlock: false,
		code: false,
		blockquote: false,
		horizontalRule: false,
		strike: false,
		underline: false,
		link: false,
		heading: { levels: [...CAP_TIEU_DE] },
	}),
	TableKit,
	Link.configure({ openOnClick: false }),
];

const LOAI_DANH_SACH = new Set(["bulletList", "orderedList"]);

let boQuanLy: MarkdownManager | null = null;

function quanLy(): MarkdownManager {
	boQuanLy ??= new MarkdownManager({ extensions: PHAN_MO_RONG });
	return boQuanLy;
}

function capHopLe(cap: unknown): number {
	const n = typeof cap === "number" ? cap : CAP_TIEU_DE[0];
	return Math.min(Math.max(n, CAP_TIEU_DE[0]), CAP_TIEU_DE[1]);
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
			ra[ra.length - 1] = {
				...truoc,
				content: [...(truoc.content ?? []), ...(nut.content ?? [])],
			};
			continue;
		}
		ra.push(nut);
	}
	return ra;
}

function lamGon(nut: JSONContent): JSONContent {
	const ra: JSONContent =
		nut.type === "heading"
			? { ...nut, attrs: { ...nut.attrs, level: capHopLe(nut.attrs?.level) } }
			: { ...nut };
	if (nut.content) ra.content = gopDanhSach(nut.content.map(lamGon));
	return ra;
}

export function nap(md: string): JSONContent {
	return lamGon(quanLy().parse(md));
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
	const href = mark?.attrs?.href;
	return typeof href === "string" ? href : null;
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
