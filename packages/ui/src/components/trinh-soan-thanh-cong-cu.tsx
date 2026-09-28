"use client";

import Heading from "@carbon/icons-react/es/Heading";
import LinkIcon from "@carbon/icons-react/es/Link";
import ListBulleted from "@carbon/icons-react/es/ListBulleted";
import ListNumbered from "@carbon/icons-react/es/ListNumbered";
import Redo from "@carbon/icons-react/es/Redo";
import TableIcon from "@carbon/icons-react/es/Table";
import TextBold from "@carbon/icons-react/es/TextBold";
import TextItalic from "@carbon/icons-react/es/TextItalic";
import Undo from "@carbon/icons-react/es/Undo";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { Separator } from "@crm/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { TAI_LIEU } from "@crm/validation/tai-lieu";
import { type Editor, useEditorState } from "@tiptap/react";
import { type KeyboardEvent, useRef, useState } from "react";

export const NUT_TRINH_SOAN = [
	"tieuDe2",
	"tieuDe3",
	"dam",
	"nghieng",
	"danhSachSo",
	"danhSachCham",
	"bang",
	"lienKet",
	"hoanTac",
	"lamLai",
] as const;

export type NutTrinhSoan = (typeof NUT_TRINH_SOAN)[number];

export type NhanNutTrinhSoan = Record<NutTrinhSoan, string>;

type NutLenh = Exclude<NutTrinhSoan, "lienKet">;

type TrangThaiNut = Record<NutTrinhSoan, { bat: boolean; khoa: boolean }> & {
	href: string;
};

const CO_GIAO_THUC = /^(https?:\/\/|mailto:|\/(?!\/))/i;

const PHIM_CHUYEN = new Set(["ArrowLeft", "ArrowRight", "Home", "End"]);

function chuanHref(chu: string): string {
	const s = chu.trim();
	if (s === "") return "";
	return CO_GIAO_THUC.test(s) ? s : `https://${s}`;
}

function docTrangThai(editor: Editor): TrangThaiNut {
	const co = editor.can();
	return {
		tieuDe2: { bat: editor.isActive("heading", { level: 2 }), khoa: false },
		tieuDe3: { bat: editor.isActive("heading", { level: 3 }), khoa: false },
		dam: { bat: editor.isActive("bold"), khoa: false },
		nghieng: { bat: editor.isActive("italic"), khoa: false },
		danhSachSo: { bat: editor.isActive("orderedList"), khoa: false },
		danhSachCham: { bat: editor.isActive("bulletList"), khoa: false },
		bang: { bat: false, khoa: !co.insertTable() },
		lienKet: { bat: editor.isActive("link"), khoa: false },
		hoanTac: { bat: false, khoa: !co.undo() },
		lamLai: { bat: false, khoa: !co.redo() },
		href: String(editor.getAttributes("link").href ?? ""),
	};
}

const DONG = { bat: false, khoa: true };

const TRONG: TrangThaiNut = {
	tieuDe2: DONG,
	tieuDe3: DONG,
	dam: DONG,
	nghieng: DONG,
	danhSachSo: DONG,
	danhSachCham: DONG,
	bang: DONG,
	lienKet: DONG,
	hoanTac: DONG,
	lamLai: DONG,
	href: "",
};

function chay(editor: Editor | null, nut: NutLenh): void {
	if (!editor) return;
	const c = editor.chain().focus();
	const { hang, cot } = TAI_LIEU.soan.bangMoi;
	const lenh: Record<NutLenh, () => boolean> = {
		tieuDe2: () => c.toggleHeading({ level: 2 }).run(),
		tieuDe3: () => c.toggleHeading({ level: 3 }).run(),
		dam: () => c.toggleBold().run(),
		nghieng: () => c.toggleItalic().run(),
		danhSachSo: () => c.toggleOrderedList().run(),
		danhSachCham: () => c.toggleBulletList().run(),
		bang: () =>
			c.insertTable({ rows: hang, cols: cot, withHeaderRow: true }).run(),
		hoanTac: () => c.undo().run(),
		lamLai: () => c.redo().run(),
	};
	lenh[nut]();
}

function ganLienKet(editor: Editor | null, chu: string): void {
	if (!editor) return;
	const href = chuanHref(chu);
	const c = editor.chain().focus().extendMarkRange("link");
	if (href === "") {
		c.unsetLink().run();
		return;
	}
	if (editor.state.selection.empty && !editor.isActive("link")) {
		c.insertContent({
			type: "text",
			text: href,
			marks: [{ type: "link", attrs: { href } }],
		}).run();
		return;
	}
	c.setLink({ href }).run();
}

export function ThanhCongCuTrinhSoan({
	editor,
	nhan,
	nhanNut,
}: {
	editor: Editor | null;
	nhan: string;
	nhanNut: NhanNutTrinhSoan;
}) {
	const trang =
		useEditorState({
			editor,
			selector: ({ editor: e }) => (e ? docTrangThai(e) : TRONG),
		}) ?? TRONG;
	const [dangChon, setDangChon] = useState<NutTrinhSoan>("tieuDe2");
	const [moLienKet, setMoLienKet] = useState(false);
	const khung = useRef<HTMLDivElement>(null);

	const mo = NUT_TRINH_SOAN.filter((k) => !trang[k].khoa);
	const hienHanh = mo.includes(dangChon) ? dangChon : mo[0];

	const nutCua = (el: EventTarget): NutTrinhSoan | undefined => {
		if (!(el instanceof HTMLElement)) return undefined;
		return NUT_TRINH_SOAN.find((k) => k === el.dataset.nut);
	};

	const diChuyen = (e: KeyboardEvent<HTMLDivElement>) => {
		const tu = nutCua(e.target);
		if (!tu || !PHIM_CHUYEN.has(e.key) || mo.length === 0) return;
		e.preventDefault();
		const i = mo.indexOf(tu);
		const dich =
			e.key === "Home"
				? 0
				: e.key === "End"
					? mo.length - 1
					: (i + (e.key === "ArrowRight" ? 1 : -1) + mo.length) % mo.length;
		const toi = mo[dich];
		if (!toi) return;
		setDangChon(toi);
		khung.current?.querySelector<HTMLElement>(`[data-nut="${toi}"]`)?.focus();
	};

	const chiSo = (k: NutTrinhSoan) => (k === hienHanh ? 0 : -1);

	const nutTrang = (k: NutTrinhSoan) => ({
		"aria-label": nhanNut[k],
		title: nhanNut[k],
		"data-nut": k,
		disabled: trang[k].khoa,
		tabIndex: chiSo(k),
		onClick: k === "lienKet" ? undefined : () => chay(editor, k),
	});

	const tieuDe = trang.tieuDe2.bat
		? "tieuDe2"
		: trang.tieuDe3.bat
			? "tieuDe3"
			: "";
	const kieuChu = (["dam", "nghieng"] as const).filter((k) => trang[k].bat);
	const danhSach = trang.danhSachSo.bat
		? "danhSachSo"
		: trang.danhSachCham.bat
			? "danhSachCham"
			: "";

	return (
		<div
			aria-label={nhan}
			className="flex items-center gap-1 overflow-x-auto"
			data-thanh-cong-cu=""
			onFocus={(e) => {
				const k = nutCua(e.target);
				if (k) setDangChon(k);
			}}
			onKeyDown={diChuyen}
			ref={khung}
			role="toolbar"
		>
			<ToggleGroup
				rovingFocus={false}
				size="sm"
				spacing={1}
				type="single"
				value={tieuDe}
			>
				<ToggleGroupItem value="tieuDe2" {...nutTrang("tieuDe2")}>
					<Icon icon={Heading} />2
				</ToggleGroupItem>
				<ToggleGroupItem value="tieuDe3" {...nutTrang("tieuDe3")}>
					<Icon icon={Heading} />3
				</ToggleGroupItem>
			</ToggleGroup>
			<Separator orientation="vertical" />
			<ToggleGroup
				rovingFocus={false}
				size="sm"
				spacing={1}
				type="multiple"
				value={kieuChu}
			>
				<ToggleGroupItem value="dam" {...nutTrang("dam")}>
					<Icon icon={TextBold} />
				</ToggleGroupItem>
				<ToggleGroupItem value="nghieng" {...nutTrang("nghieng")}>
					<Icon icon={TextItalic} />
				</ToggleGroupItem>
			</ToggleGroup>
			<Separator orientation="vertical" />
			<ToggleGroup
				rovingFocus={false}
				size="sm"
				spacing={1}
				type="single"
				value={danhSach}
			>
				<ToggleGroupItem value="danhSachSo" {...nutTrang("danhSachSo")}>
					<Icon icon={ListNumbered} />
				</ToggleGroupItem>
				<ToggleGroupItem value="danhSachCham" {...nutTrang("danhSachCham")}>
					<Icon icon={ListBulleted} />
				</ToggleGroupItem>
			</ToggleGroup>
			<Separator orientation="vertical" />
			<Button size="icon-sm" variant="ghost" {...nutTrang("bang")}>
				<Icon icon={TableIcon} />
			</Button>
			<Popover onOpenChange={setMoLienKet} open={moLienKet}>
				<PopoverTrigger asChild>
					<Button
						aria-pressed={trang.lienKet.bat}
						size="icon-sm"
						variant="ghost"
						{...nutTrang("lienKet")}
					>
						<Icon icon={LinkIcon} />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					onCloseAutoFocus={(e) => {
						e.preventDefault();
						editor?.commands.focus();
					}}
				>
					<Input
						aria-label={nhanNut.lienKet}
						autoComplete="url"
						defaultValue={trang.href}
						inputMode="url"
						onKeyDown={(e) => {
							if (e.key !== "Enter") return;
							e.preventDefault();
							const chu = e.currentTarget.value;
							setMoLienKet(false);
							ganLienKet(editor, chu);
						}}
						placeholder="https://"
						translate="no"
						type="url"
					/>
				</PopoverContent>
			</Popover>
			<Separator orientation="vertical" />
			<Button size="icon-sm" variant="ghost" {...nutTrang("hoanTac")}>
				<Icon icon={Undo} />
			</Button>
			<Button size="icon-sm" variant="ghost" {...nutTrang("lamLai")}>
				<Icon icon={Redo} />
			</Button>
		</div>
	);
}
