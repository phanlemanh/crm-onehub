"use client";

import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";

export const THU_CAP_NHAT = [1, 2, 3, 4, 5, 6, 7] as const;

export type GiaChuKy = {
	ten: string;
	batDau: string | null;
	ketThuc: string | null;
	nghiTu: string | null;
	nghiDen: string | null;
	thu: number;
};

export const GIA_TRONG: GiaChuKy = {
	ten: "",
	batDau: null,
	ketThuc: null,
	nghiTu: null,
	nghiDen: null,
	thu: 1,
};

const ngayHoacNull = (v: string) => (v === "" ? null : v);

export function OChuKy({
	ma,
	gia,
	doi,
	khoaNgoaiTen,
	goiYTen,
	truocTen,
	sauTen,
	moTaKhoa,
}: {
	ma: string;
	gia: GiaChuKy;
	doi: (sua: Partial<GiaChuKy>) => void;
	khoaNgoaiTen: boolean;
	goiYTen?: string;
	truocTen?: ReactNode;
	sauTen?: ReactNode;
	moTaKhoa?: string;
}) {
	const c = okrMessages(useLocale()).caiDat.mo;

	return (
		<FieldGroup>
			{truocTen}

			<Field>
				<FieldLabel htmlFor={`${ma}-ten`}>{c.ten}</FieldLabel>
				<Input
					id={`${ma}-ten`}
					value={gia.ten}
					maxLength={80}
					autoComplete="off"
					translate="no"
					placeholder={goiYTen}
					data-o-ten
					onChange={(event) => doi({ ten: event.target.value })}
				/>
			</Field>

			{sauTen}

			<div className="grid items-start gap-3 sm:grid-cols-2">
				<Field>
					<FieldLabel htmlFor={`${ma}-dau`}>{c.batDau}</FieldLabel>
					<DatePicker
						id={`${ma}-dau`}
						value={gia.batDau}
						disabled={khoaNgoaiTen}
						onChange={(v) => doi({ batDau: ngayHoacNull(v) })}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor={`${ma}-cuoi`}>{c.ketThuc}</FieldLabel>
					<DatePicker
						id={`${ma}-cuoi`}
						value={gia.ketThuc}
						disabled={khoaNgoaiTen}
						onChange={(v) => doi({ ketThuc: ngayHoacNull(v) })}
					/>
				</Field>
			</div>

			<FieldSet>
				<FieldLegend variant="label">{c.nghi}</FieldLegend>
				<FieldDescription>{c.nghiMoTa}</FieldDescription>
				<div className="grid items-start gap-3 sm:grid-cols-2">
					<Field>
						<FieldLabel htmlFor={`${ma}-nghi-tu`}>{c.nghiTu}</FieldLabel>
						<DatePicker
							id={`${ma}-nghi-tu`}
							value={gia.nghiTu}
							disabled={khoaNgoaiTen}
							onChange={(v) => doi({ nghiTu: ngayHoacNull(v) })}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={`${ma}-nghi-den`}>{c.nghiDen}</FieldLabel>
						<DatePicker
							id={`${ma}-nghi-den`}
							value={gia.nghiDen}
							disabled={khoaNgoaiTen}
							onChange={(v) => doi({ nghiDen: ngayHoacNull(v) })}
						/>
					</Field>
				</div>
				{!khoaNgoaiTen && (gia.nghiTu !== null || gia.nghiDen !== null) ? (
					<div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => doi({ nghiTu: null, nghiDen: null })}
						>
							{c.boNghi}
						</Button>
					</div>
				) : null}
			</FieldSet>

			<Field>
				<FieldLabel htmlFor={`${ma}-thu`}>{c.ngayCapNhat}</FieldLabel>
				<Select
					value={String(gia.thu)}
					disabled={khoaNgoaiTen}
					onValueChange={(v) => {
						const moi = THU_CAP_NHAT.find((t) => String(t) === v);
						if (moi) doi({ thu: moi });
					}}
				>
					<SelectTrigger
						id={`${ma}-thu`}
						className="w-full"
						aria-describedby={moTaKhoa ? `${ma}-khoa` : undefined}
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{THU_CAP_NHAT.map((t) => (
							<SelectItem key={t} value={String(t)}>
								{c.thu[t - 1]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{moTaKhoa ? (
					<FieldDescription id={`${ma}-khoa`} data-mo-ta-khoa>
						{moTaKhoa}
					</FieldDescription>
				) : null}
			</Field>
		</FieldGroup>
	);
}
