"use client";

import DocumentIcon from "@carbon/icons-react/es/Document";
import { Button } from "@crm/ui/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crm/ui/components/command";
import { Icon } from "@crm/ui/components/icon";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { TAI_LIEU } from "@crm/validation/tai-lieu";
import { nutLienKetTrang } from "@crm/validation/tai-lieu-markdown";
import type { Editor } from "@tiptap/react";
import { useRef, useState } from "react";

export type TrangGoiY = { slug: string; ten: string; duong: string };

export type TimTrang = (q: string) => Promise<readonly TrangGoiY[]>;

export type NhanLienKetTrang = {
	nut: string;
	tim: string;
	goThem: string;
	khongCo: string;
	loiTim: string;
};

export function ganLienKetTrang(editor: Editor | null, trang: TrangGoiY): void {
	if (!editor) return;
	const c = editor.chain().focus();
	if (editor.state.selection.empty && !editor.isActive("link")) {
		c.insertContent(nutLienKetTrang(trang.ten, trang.duong)).run();
		return;
	}
	c.extendMarkRange("link").setLink({ href: trang.duong }).run();
}

export function NutLienKetTrang({
	editor,
	timTrang,
	nhan,
	tabIndex,
	khoa,
}: {
	editor: Editor | null;
	timTrang: TimTrang;
	nhan: NhanLienKetTrang;
	tabIndex: number;
	khoa: boolean;
}) {
	const [mo, setMo] = useState(false);
	const [q, setQ] = useState("");
	const [ds, setDs] = useState<readonly TrangGoiY[]>([]);
	const [loi, setLoi] = useState(false);
	const moiNhat = useRef("");

	const go = (chu: string) => {
		setQ(chu);
		setLoi(false);
		moiNhat.current = chu;
		if (chu.trim().length < TAI_LIEU.tim.toiThieu) {
			setDs([]);
			return;
		}
		void timTrang(chu).then(
			(ra) => {
				if (moiNhat.current === chu) setDs(ra);
			},
			() => {
				if (moiNhat.current !== chu) return;
				setDs([]);
				setLoi(true);
			},
		);
	};

	const doiMo = (m: boolean) => {
		setMo(m);
		if (!m) go("");
	};

	return (
		<Popover onOpenChange={doiMo} open={mo}>
			<PopoverTrigger asChild>
				<Button
					aria-label={nhan.nut}
					data-nut="lienKetTrang"
					disabled={khoa}
					size="icon-sm"
					tabIndex={tabIndex}
					title={nhan.nut}
					variant="ghost"
				>
					<Icon icon={DocumentIcon} />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				onCloseAutoFocus={(e) => {
					e.preventDefault();
					editor?.commands.focus();
				}}
			>
				<Command shouldFilter={false}>
					<CommandInput
						aria-label={nhan.tim}
						onValueChange={go}
						placeholder={nhan.tim}
						value={q}
					/>
					<CommandList>
						<CommandEmpty>
							{q.trim().length < TAI_LIEU.tim.toiThieu
								? nhan.goThem
								: loi
									? nhan.loiTim
									: nhan.khongCo}
						</CommandEmpty>
						{ds.length > 0 ? (
							<CommandGroup>
								{ds.map((t) => (
									<CommandItem
										data-goi-y-trang={t.slug}
										key={t.slug}
										onSelect={() => {
											doiMo(false);
											ganLienKetTrang(editor, t);
										}}
										value={t.slug}
									>
										<span className="truncate" translate="no">
											{t.ten}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						) : null}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
