"use client";

import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import { useId } from "react";
import type { KhoaApiMessages } from "@/lib/messages/settings-khoa-api";
import { type LoaiKhoa, LoaiKhoaField } from "./loai-khoa";

const FORM = "create-api-key";

export const HAN_KHOA = ["30", "90", "365", "never"] as const;

export type HanKhoa = (typeof HAN_KHOA)[number];

function laHanKhoa(v: string): v is HanKhoa {
	return (HAN_KHOA as readonly string[]).includes(v);
}

function nhanHan(t: KhoaApiMessages, han: HanKhoa): string {
	if (han === "30") return t.tao.han30;
	if (han === "90") return t.tao.han90;
	if (han === "365") return t.tao.han365;
	return t.tao.khongHetHan;
}

export type ToTaoKhoaProps = {
	t: KhoaApiMessages;
	laQuanTri: boolean;
	ten: string;
	onTen: (ten: string) => void;
	loai: LoaiKhoa;
	onLoai: (loai: LoaiKhoa) => void;
	han: HanKhoa;
	onHan: (han: HanKhoa) => void;
	dangTao: boolean;
	onTao: () => void;
};

export function ToTaoKhoa({
	t,
	laQuanTri,
	ten,
	onTen,
	loai,
	onLoai,
	han,
	onHan,
	dangTao,
	onTao,
}: ToTaoKhoaProps) {
	const tenId = useId();
	const hanId = useId();

	return (
		<SheetContent side="right">
			<SheetHeader>
				<SheetTitle>{t.tao.tieuDe}</SheetTitle>
				<SheetDescription>
					{laQuanTri ? t.tao.moTaQuanTri : t.tao.moTa}
				</SheetDescription>
			</SheetHeader>

			<form
				id={FORM}
				className="flex-1 overflow-y-auto px-4"
				onSubmit={(event) => {
					event.preventDefault();
					onTao();
				}}
			>
				<FieldGroup>
					{laQuanTri ? (
						<LoaiKhoaField
							t={t}
							value={loai}
							onValueChange={onLoai}
							disabled={dangTao}
						/>
					) : null}

					<Field>
						<FieldLabel htmlFor={tenId}>{t.tao.ten}</FieldLabel>
						<Input
							id={tenId}
							value={ten}
							onChange={(event) => onTen(event.target.value)}
							placeholder={t.tao.tenGoiY}
							maxLength={64}
							autoComplete="off"
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck={false}
							translate="no"
							required
						/>
						<FieldDescription>{t.tao.tenMoTa}</FieldDescription>
					</Field>

					<Field>
						<FieldLabel htmlFor={hanId}>{t.tao.hetHan}</FieldLabel>
						<Select
							value={han}
							onValueChange={(value) => {
								if (laHanKhoa(value)) onHan(value);
							}}
						>
							<SelectTrigger id={hanId} className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{HAN_KHOA.map((value) => (
									<SelectItem key={value} value={value}>
										{nhanHan(t, value)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</FieldGroup>
			</form>

			<SheetFooter>
				<SheetClose asChild>
					<Button variant="outline">{t.tao.huy}</Button>
				</SheetClose>
				<Button type="submit" form={FORM} disabled={!ten.trim() || dangTao}>
					{dangTao ? <Spinner /> : null}
					{t.tao.taoKhoa}
				</Button>
			</SheetFooter>
		</SheetContent>
	);
}
