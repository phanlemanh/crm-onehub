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
import { FieldError } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { Separator } from "@crm/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { lienKetAnToan } from "@crm/ui/lib/lien-ket-an-toan";
import { TAI_LIEU } from "@crm/validation/tai-lieu";
import { type Editor, useEditorState } from "@tiptap/react";
import { type KeyboardEvent, useRef, useState } from "react";
import {
	type NhanLienKetTrang,
	NutLienKetTrang,
	type TimTrang,
} from "./trinh-soan-lien-ket-trang";

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

type NutThanh = NutTrinhSoan | "lienKetTrang";

type TrangThaiNut = Record<NutTrinhSoan, { bat: boolean; khoa: boolean }> & {
	href: string;
};

const CO_SCHEME = /^[a-z][a-z\d+.-]*:/i;

const PHIM_CHUYEN = new Set(["ArrowLeft", "ArrowRight", "Home", "End"]);

function chuanHref(chu: string): string {
	const s = chu.trim();
	if (s === "" || s.startsWith("/") || s.startsWith("#") || CO_SCHEME.test(s))
		return s;
	return `https://${s}`;
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

function ganLienKet(editor: Editor | null, href: string): void {
	if (!editor) return;
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
	timTrang,
	nhanLienKetTrang,
}: {
	editor: Editor | null;
	nhan: string;
	nhanNut: NhanNutTrinhSoan;
	timTrang?: TimTrang;
	nhanLienKetTrang?: NhanLienKetTrang;
}) {
	const trang =
		useEditorState({
			editor,
			selector: ({ editor: e }) => (e ? docTrangThai(e) : TRONG),
		}) ?? TRONG;
	const [dangChon, setDangChon] = useState<NutThanh>("tieuDe2");
	const [moLienKet, setMoLienKet] = useState(false);
	const [loiLienKet, setLoiLienKet] = useState(false);
	const chuLienKet = useMessages().lienKet;
	const khung = useRef<HTMLDivElement>(null);

	const coLienKetTrang = timTrang !== undefined && nhanLienKetTrang !== undefined;
	const day: readonly NutThanh[] = coLienKetTrang
		? [...NUT_TRINH_SOAN, "lienKetTrang"]
		: NUT_TRINH_SOAN;
	const khoaCua = (k: NutThanh) =>
		k === "lienKetTrang" ? editor === null : trang[k].khoa;
	const mo = day.filter((k) => !khoaCua(k));
	const hienHanh = mo.includes(dangChon) ? dangChon : mo[0];

	const nutCua = (el: EventTarget): NutThanh | undefined => {
		if (!(el instanceof HTMLElement)) return undefined;
		return day.find((k) => k === el.dataset.nut);
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

	const chiSo = (k: NutThanh) => (k === hienHanh ? 0 : -1);

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
			<Popover
				onOpenChange={(mo) => {
					setLoiLienKet(false);
					setMoLienKet(mo);
				}}
				open={moLienKet}
			>
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
						if (editor && !editor.isDestroyed) editor.commands.focus();
					}}
				>
					<Input
						aria-invalid={loiLienKet || undefined}
						aria-label={nhanNut.lienKet}
						autoComplete="url"
						defaultValue={trang.href}
						inputMode="url"
						onKeyDown={(e) => {
							if (e.key !== "Enter") return;
							e.preventDefault();
							const href = chuanHref(e.currentTarget.value);
							if (href !== "" && !lienKetAnToan(href)) {
								setLoiLienKet(true);
								return;
							}
							setLoiLienKet(false);
							setMoLienKet(false);
							ganLienKet(editor, href);
						}}
						placeholder="https://"
						translate="no"
						type="url"
					/>
					{loiLienKet ? (
						<FieldError data-loi-lien-ket="">{chuLienKet.chiHttps}</FieldError>
					) : null}
				</PopoverContent>
			</Popover>
			{coLienKetTrang ? (
				<NutLienKetTrang
					editor={editor}
					khoa={khoaCua("lienKetTrang")}
					nhan={nhanLienKetTrang}
					tabIndex={chiSo("lienKetTrang")}
					timTrang={timTrang}
				/>
			) : null}
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
