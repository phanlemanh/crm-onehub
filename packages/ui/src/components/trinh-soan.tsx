"use client";

import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
	type NhanNutTrinhSoan,
	ThanhCongCuTrinhSoan,
} from "@crm/ui/components/trinh-soan-thanh-cong-cu";
import type {
	NhanLienKetTrang,
	TimTrang,
} from "@crm/ui/components/trinh-soan-lien-ket-trang";
import { locDanDem } from "@crm/ui/lib/dan-tu-van-phong";
import { lienKetAnToan } from "@crm/ui/lib/lien-ket-an-toan";
import { chuanNfc } from "@crm/validation/tai-lieu";
import {
	nap,
	PHAN_MO_RONG,
	tuanTuHoa,
} from "@crm/validation/tai-lieu-markdown";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

export type { NhanLienKetTrang, NhanNutTrinhSoan, TimTrang };

export type TrinhSoanProps = {
	giaTri: string;
	onDoi: (md: string) => void;
	nhan: string;
	goiY: string;
	nhanNut: NhanNutTrinhSoan;
	timTrang?: TimTrang;
	nhanLienKetTrang?: NhanLienKetTrang;
	id?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean;
};

const LOP_NOI_DUNG = [
	"min-h-72 rounded-md border border-input bg-background px-3 py-2 text-sm/7 outline-none transition-[color,box-shadow]",
	"focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
	"aria-invalid:border-destructive aria-invalid:ring-destructive/20",
	"[&>*+*]:mt-3 [&_p]:text-pretty",
	"[&_h2]:mt-6 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:tracking-tight [&_h2:first-child]:mt-0",
	"[&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-base [&_h3:first-child]:mt-0",
	"[&_ul]:list-disc [&_ol]:list-decimal [&_ul,&_ol]:space-y-1 [&_ul,&_ol]:pl-5 [&_li]:pl-1 [&_li]:marker:text-muted-foreground",
	"[&_strong]:font-semibold [&_a]:underline [&_a]:underline-offset-4",
	"[&_table]:w-full [&_table]:border-collapse [&_td,&_th]:border [&_td,&_th]:px-2 [&_td,&_th]:py-1 [&_td,&_th]:align-top [&_th]:bg-muted [&_th]:text-left [&_th]:font-medium",
	"[&_.selectedCell]:bg-muted",
	"[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-muted-foreground [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
].join(" ");

const PHAN_MO_RONG_SOAN = [
	...PHAN_MO_RONG.filter((phan) => phan.name !== "link"),
	Link.configure({
		openOnClick: false,
		isAllowedUri: (url: string) => lienKetAnToan(url),
	}),
];

const DOC_TRONG: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

function napVao(md: string): JSONContent {
	const doc = nap(md);
	return doc.content?.length ? doc : DOC_TRONG;
}

function boDuoiRong(doc: JSONContent): JSONContent {
	const con = [...(doc.content ?? [])];
	while (con.length > 0) {
		const cuoi = con.at(-1);
		if (cuoi?.type !== "paragraph" || cuoi.content?.length) break;
		con.pop();
	}
	return { ...doc, content: con };
}

function thuocTinh({
	nhan,
	goiY,
	id,
	"aria-describedby": moTa,
	"aria-invalid": loi,
}: TrinhSoanProps): Record<string, string> {
	const ra: Record<string, string> = {
		role: "textbox",
		"aria-multiline": "true",
		"aria-label": nhan,
		"aria-placeholder": goiY,
		translate: "no",
		class: LOP_NOI_DUNG,
	};
	if (id) ra.id = id;
	if (moTa) ra["aria-describedby"] = moTa;
	if (loi) ra["aria-invalid"] = "true";
	return ra;
}

export function TrinhSoan(props: TrinhSoanProps) {
	const { giaTri, onDoi, goiY, nhan, nhanNut } = props;
	const daPhat = useRef(giaTri);
	const [dauTien] = useState(() => napVao(giaTri));
	const [boHttp, setBoHttp] = useState(0);
	const chuLienKet = useMessages().lienKet;
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			...PHAN_MO_RONG_SOAN,
			Placeholder.configure({ placeholder: goiY }),
		],
		content: dauTien,
		editorProps: {
			attributes: thuocTinh(props),
			transformPastedHTML: (html) => {
				const ket = locDanDem(html);
				setBoHttp(ket.boHttp);
				return ket.html;
			},
		},
		onUpdate: ({ editor: e }) => {
			const md = chuanNfc(tuanTuHoa(boDuoiRong(e.getJSON())));
			daPhat.current = md;
			onDoi(md);
		},
	});

	useEffect(() => {
		if (!editor || giaTri === daPhat.current) return;
		daPhat.current = giaTri;
		editor.commands.setContent(napVao(giaTri), { emitUpdate: false });
	}, [editor, giaTri]);

	return (
		<div className="flex flex-col gap-2" data-trinh-soan="">
			<ThanhCongCuTrinhSoan
				editor={editor}
				key={editor ? "san" : "cho"}
				nhan={nhan}
				nhanLienKetTrang={props.nhanLienKetTrang}
				timTrang={props.timTrang}
				nhanChiHttps={chuLienKet.chiHttps}
				nhanNut={nhanNut}
			/>
			<EditorContent editor={editor} />
			{boHttp > 0 ? (
				<Alert data-bo-http="" variant="warning">
					<AlertDescription>
						{chuLienKet.daBoHttp(String(boHttp))}
					</AlertDescription>
				</Alert>
			) : null}
		</div>
	);
}
