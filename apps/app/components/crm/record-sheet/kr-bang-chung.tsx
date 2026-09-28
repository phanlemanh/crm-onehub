"use client";

import Add from "@carbon/icons-react/es/Add";
import Attachment from "@carbon/icons-react/es/Attachment";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { formatDay } from "@crm/ui/lib/format";
import { bangChungVao } from "@crm/validation/okr-canh-kr";
import { useId, useState } from "react";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { homNayVn } from "@/lib/okr-chu-ky-nhan";
import type { CanhKr } from "./kr-viec";
import { dien } from "./plan-copy";

type BangChung = CanhKr["bangChung"][number];

export type BangChungVao = { url: string; ghiChu: string };

export function tenMien(url: string): string {
	try {
		return new URL(url).hostname || url;
	} catch {
		return url;
	}
}

export function loiDuongDan(url: string): boolean {
	return url.trim() !== "" && !bangChungVao.shape.url.safeParse(url).success;
}

function HopThoaiDinh({
	onDinh,
	dong,
}: {
	onDinh: (vao: BangChungVao) => Promise<void>;
	dong: () => void;
}) {
	const m = okrCanhKrMessages(useLocale()).bangChung;
	const ma = useId();
	const [url, setUrl] = useState("");
	const [ghiChu, setGhiChu] = useState("");
	const [dangDinh, setDangDinh] = useState(false);
	const [loiMayChu, setLoiMayChu] = useState<string | null>(null);
	const kq = bangChungVao.safeParse({ url, ghiChu });
	const saiUrl = loiDuongDan(url);
	const saiGhiChu = !bangChungVao.shape.ghiChu.safeParse(ghiChu).success;

	const dinh = async () => {
		if (!kq.success || dangDinh) return;
		setDangDinh(true);
		setLoiMayChu(null);
		try {
			await onDinh(kq.data);
			dong();
		} catch (loi) {
			setLoiMayChu(loi instanceof Error ? loi.message : String(loi));
		} finally {
			setDangDinh(false);
		}
	};

	return (
		<Dialog
			open
			coThayDoi={url !== "" || ghiChu !== ""}
			onOpenChange={(mo) => {
				if (!mo && !dangDinh) dong();
			}}
		>
			<DialogContent data-hop-dinh-bang-chung>
				<DialogHeader>
					<DialogTitle>{m.hop.tieuDe}</DialogTitle>
					<DialogDescription>{m.hop.moTa}</DialogDescription>
				</DialogHeader>
				<form
					id={`${ma}-form`}
					onSubmit={(e) => {
						e.preventDefault();
						void dinh();
					}}
				>
					<FieldGroup>
						<Field data-invalid={saiUrl || loiMayChu ? true : undefined}>
							<FieldLabel htmlFor={`${ma}-url`}>{m.hop.duongDan}</FieldLabel>
							<Input
								id={`${ma}-url`}
								name="duong-dan"
								type="url"
								inputMode="url"
								autoComplete="off"
								spellCheck={false}
								translate="no"
								placeholder="https://…"
								value={url}
								disabled={dangDinh}
								aria-invalid={saiUrl ? true : undefined}
								onChange={(e) => setUrl(e.target.value)}
							/>
							{saiUrl ? <FieldError>{m.loiDuongDan}</FieldError> : null}
							{loiMayChu ? <FieldError>{loiMayChu}</FieldError> : null}
						</Field>
						<Field data-invalid={saiGhiChu ? true : undefined}>
							<FieldLabel htmlFor={`${ma}-ghi-chu`}>{m.hop.ghiChu}</FieldLabel>
							<Textarea
								id={`${ma}-ghi-chu`}
								name="ghi-chu"
								translate="no"
								placeholder={m.hop.ghiChuGoiY}
								value={ghiChu}
								disabled={dangDinh}
								aria-invalid={saiGhiChu ? true : undefined}
								onChange={(e) => setGhiChu(e.target.value)}
							/>
							{saiGhiChu ? (
								<FieldError>{m.loiGhiChu}</FieldError>
							) : (
								<FieldDescription>{m.hop.toiDa}</FieldDescription>
							)}
						</Field>
					</FieldGroup>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={dangDinh}>
							{m.hop.huy}
						</Button>
					</DialogClose>
					<Button
						type="submit"
						form={`${ma}-form`}
						data-nut="dinh"
						disabled={!kq.success || dangDinh}
					>
						{dangDinh ? <Spinner data-icon="inline-start" /> : null}
						{m.hop.dinh}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DongBangChung({
	b,
	goDuoc,
	onGo,
}: {
	b: BangChung;
	goDuoc: boolean;
	onGo: () => void;
}) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale).bangChung;
	const mien = tenMien(b.url);
	return (
		<Item size="sm" variant="outline" data-bang-chung={b.id} role="listitem">
			<ItemMedia variant="icon">
				<Icon icon={Attachment} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<a
						className="underline-offset-4 hover:underline"
						href={b.url}
						rel="noopener noreferrer"
						target="_blank"
						translate="no"
						data-ten-mien={mien}
					>
						{mien}
					</a>
				</ItemTitle>
				<ItemDescription>
					{b.ghiChu ? (
						<>
							<span translate="no">{b.ghiChu}</span>
							{" · "}
						</>
					) : null}
					<span translate="no">{b.nguoiDinh.name}</span>
					{" · "}
					{formatDay(homNayVn(new Date(b.dinhLuc)), locale)}
				</ItemDescription>
			</ItemContent>
			{goDuoc ? (
				<ItemActions>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={dien(m.thaoTac, { ten: mien })}
								data-nut="thao-tac-bang-chung"
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								data-muc="go-bang-chung"
								variant="destructive"
								onSelect={onGo}
							>
								{m.go}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ItemActions>
			) : null}
		</Item>
	);
}

export function KrBangChung({
	canh,
	onDinh,
	onGo,
}: {
	canh: CanhKr;
	onDinh: (vao: BangChungVao) => Promise<void>;
	onGo: (id: string) => Promise<void>;
}) {
	const t = okrCanhKrMessages(useLocale());
	const m = t.bangChung;
	const [mo, setMo] = useState(false);
	const [hoiGo, setHoiGo] = useState<BangChung | null>(null);
	const [dangGo, setDangGo] = useState(false);
	const ghiDuoc = canh.quyen.suaDuoc && !canh.khoa;
	const dinhDuoc = ghiDuoc && canh.kr.xong;

	const nutDinh = ghiDuoc ? (
		<Button
			size="sm"
			variant="outline"
			data-nut="dinh-bang-chung"
			disabled={!dinhDuoc}
			onClick={() => setMo(true)}
		>
			<Icon icon={Add} data-icon="inline-start" />
			{m.dinh}
		</Button>
	) : undefined;

	const go = () => {
		if (!hoiGo || dangGo) return;
		setDangGo(true);
		onGo(hoiGo.id).then(
			() => {
				setDangGo(false);
				setHoiGo(null);
			},
			() => setDangGo(false),
		);
	};

	return (
		<div
			className="contents"
			data-trang-thai={
				canh.bangChung.length === 0 ? "ST-bangchung-rong" : "ST-bangchung-co"
			}
		>
			<DetailSheetBody>
				{canh.bangChung.length === 0 ? (
					<DetailSheetEmpty
						icon={Attachment}
						title={m.rong.tieuDe}
						description={canh.kr.xong ? m.rong.moTa : m.rong.moTaChuaXong}
						action={nutDinh}
					/>
				) : (
					<DetailSheetSection>
						<div className="flex flex-col gap-3">
							<ItemGroup>
								{canh.bangChung.map((b) => (
									<DongBangChung
										key={b.id}
										b={b}
										goDuoc={ghiDuoc}
										onGo={() => setHoiGo(b)}
									/>
								))}
							</ItemGroup>
							{nutDinh ? <div>{nutDinh}</div> : null}
						</div>
					</DetailSheetSection>
				)}
			</DetailSheetBody>
			{mo ? <HopThoaiDinh onDinh={onDinh} dong={() => setMo(false)} /> : null}
			<ConfirmDialog
				tone="destructive"
				tieuDe={dien(t.hoiGo.bangChung.tieuDe, {
					ten: hoiGo ? tenMien(hoiGo.url) : "",
				})}
				than={t.hoiGo.bangChung.than}
				nut={t.hoiGo.nut}
				thoi={t.hoiGo.thoi}
				open={hoiGo !== null}
				pending={dangGo}
				onOpenChange={(moHoi) => {
					if (!moHoi && !dangGo) setHoiGo(null);
				}}
				onConfirm={go}
			/>
		</div>
	);
}
