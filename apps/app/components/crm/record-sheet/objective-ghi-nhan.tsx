"use client";

import Close from "@carbon/icons-react/es/Close";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Trophy from "@carbon/icons-react/es/Trophy";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
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
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	TokenField,
	TokenFieldAction,
	TokenFieldItem,
} from "@crm/ui/components/token-field";
import { OKR_CANH_KR } from "@crm/validation/okr-canh-kr";
import { luc } from "@/app/(app)/[slug]/okr/bang-vet";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import type { RouterOutputs } from "@/lib/trpc/types";
import { dien, dienNode } from "./plan-copy";

type DongTraoDoi = RouterOutputs["okr"]["comments"]["dong"][number];
export type GhiNhanHien = Extract<DongTraoDoi, { loai: "ghi-nhan" }>;

export type NguoiChon = {
	value: string;
	label: string;
	hint?: string;
	keywords?: string[];
};

export function ChipKr({ ten }: { ten: string }) {
	return (
		<div className="flex min-w-0 basis-full">
			<Badge
				className="max-w-full"
				data-chip-kr
				translate="no"
				variant="outline"
			>
				<span className="truncate">{ten}</span>
			</Badge>
		</div>
	);
}

export function DongGhiNhan({
	ghiNhan: g,
	onGo,
}: {
	ghiNhan: GhiNhanHien;
	onGo: () => void;
}) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale).ghiNhan;
	return (
		<Item data-ghi-nhan={g.id} role="listitem" size="sm" variant="muted">
			<ItemMedia variant="icon">
				<Icon icon={Trophy} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<span>
						{dienNode(m.tieuDe, {
							gui: (
								<span data-ten-nguoi translate="no">
									{g.nguoiGui.name}
								</span>
							),
							nhan: (
								<span data-ten-nguoi translate="no">
									{g.nguoiNhan.map((n) => n.name).join(", ")}
								</span>
							),
						})}
					</span>
				</ItemTitle>
				<ItemDescription>{luc(g.createdAt, locale)}</ItemDescription>
			</ItemContent>
			{g.goDuoc ? (
				<ItemActions>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={dien(m.thaoTac, { ten: g.nguoiGui.name })}
								data-nut="thao-tac-ghi-nhan"
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={onGo} variant="destructive">
								{m.go}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ItemActions>
			) : null}
			{g.keyResultTitle ? <ChipKr ten={g.keyResultTitle} /> : null}
			<p
				className="basis-full whitespace-pre-wrap break-words text-sm"
				data-loi-ghi-nhan
				translate="no"
			>
				{g.loiNhan}
			</p>
		</Item>
	);
}

export function TruongNguoiNhan({
	id,
	thanhVien,
	dangTai,
	khoa,
	value,
	onChange,
}: {
	id: string;
	thanhVien: NguoiChon[];
	dangTai: boolean;
	khoa: boolean;
	value: string[];
	onChange: (ds: string[]) => void;
}) {
	const t = okrCanhKrMessages(useLocale());
	const m = t.ghiNhan;
	const tenCua = (ma: string) =>
		thanhVien.find((u) => u.value === ma)?.label ?? ma;
	const qua = value.length > OKR_CANH_KR.nguoiNhan.max;

	return (
		<Field data-invalid={qua ? true : undefined} data-truong-nguoi-nhan>
			<FieldLabel htmlFor={id}>{m.nguoiNhan}</FieldLabel>
			<Combobox
				aria-invalid={qua ? true : undefined}
				data-o-nguoi-nhan
				disabled={dangTai || khoa}
				empty={t.nhap.khongAi}
				id={id}
				onValueChange={(ma) => onChange([...value, ma])}
				options={thanhVien.filter((u) => !value.includes(u.value))}
				placeholder={dangTai ? t.nhap.dangTaiNguoi : m.chonNguoi}
				searchPlaceholder={t.nhap.timNguoi}
				translate="no"
				value=""
			/>
			{value.length > 0 ? (
				<TokenField aria-label={m.nguoiNhan} data-nguoi-nhan>
					{value.map((ma) => (
						<TokenFieldItem data-token-nguoi-nhan={ma} key={ma} translate="no">
							<span className="truncate px-1">{tenCua(ma)}</span>
							<TokenFieldAction
								aria-label={dien(m.boNguoi, { ten: tenCua(ma) })}
								disabled={khoa}
								onClick={() => onChange(value.filter((x) => x !== ma))}
							>
								<Icon icon={Close} />
							</TokenFieldAction>
						</TokenFieldItem>
					))}
				</TokenField>
			) : null}
			{qua ? (
				<FieldError>{dien(m.toiDaNguoi, OKR_CANH_KR.nguoiNhan)}</FieldError>
			) : (
				<FieldDescription>
					{dien(m.soNguoi, OKR_CANH_KR.nguoiNhan)}
				</FieldDescription>
			)}
		</Field>
	);
}
