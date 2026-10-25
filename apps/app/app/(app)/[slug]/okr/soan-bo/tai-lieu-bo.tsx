"use client";

import { Badge } from "@crm/ui/components/badge";
import { FieldDescription } from "@crm/ui/components/field";
import { InputGroup, InputGroupInput } from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Separator } from "@crm/ui/components/separator";
import { Textarea } from "@crm/ui/components/textarea";
import type { Locale } from "@crm/ui/lib/locale";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { hienSo } from "../hop-thoai-kr";
import { ChamTrangThai } from "../tien-do-kr";
import type { MucTieuSoan } from "./use-bo-soan";

type KrSoan = MucTieuSoan["keyResults"][number];

function chuSo(kr: KrSoan, so: number, locale: Locale): string {
	return kr.kind === "moc" ? "" : hienSo(so, locale);
}

function DongKrDoc({
	kr,
	khoa,
	locale,
}: {
	kr: KrSoan;
	khoa: boolean;
	locale: Locale;
}) {
	const m = okrMessages(locale).hopThoai;
	return (
		<li className="flex flex-col gap-2 border-l py-1 pl-4" data-dong-kr={kr.id}>
			<Textarea
				variant="tai-lieu"
				size="dong"
				rows={1}
				aria-label={m.tenKr}
				defaultValue={kr.title}
				disabled={khoa}
				translate="no"
			/>
			<div className="flex flex-wrap items-center gap-2" data-o-so={kr.id}>
				<InputGroup className="w-24">
					<InputGroupInput
						aria-label={m.khoiDiem}
						defaultValue={chuSo(kr, kr.startValue, locale)}
						inputMode="decimal"
						disabled={khoa}
					/>
				</InputGroup>
				<InputGroup className="w-24">
					<InputGroupInput
						aria-label={m.dich}
						defaultValue={chuSo(kr, kr.targetValue, locale)}
						inputMode="decimal"
						disabled={khoa}
					/>
				</InputGroup>
				<InputGroup className="w-28">
					<InputGroupInput
						aria-label={m.donViDo}
						defaultValue={kr.unit}
						disabled={khoa}
						translate="no"
					/>
				</InputGroup>
			</div>
		</li>
	);
}

function KhoiMucTieuDoc({
	mt,
	khoa,
	locale,
}: {
	mt: MucTieuSoan;
	khoa: boolean;
	locale: Locale;
}) {
	const m = okrMessages(locale);
	return (
		<section
			className="flex flex-col gap-3"
			data-dong-mt={mt.id}
			aria-label={mt.title}
		>
			<div className="flex flex-wrap items-center gap-2">
				<ChamTrangThai status={mt.status} />
				<Badge variant="outline">{m.loai[mt.kind]}</Badge>
			</div>
			<Textarea
				variant="tai-lieu"
				size="tieu-de"
				rows={1}
				aria-label={m.hopThoai.tenMucTieu}
				defaultValue={mt.title}
				disabled={khoa}
				translate="no"
			/>
			{mt.keyResults.length > 0 ? (
				<ol className="flex flex-col gap-2">
					{mt.keyResults.map((kr) => (
						<DongKrDoc key={kr.id} kr={kr} khoa={khoa} locale={locale} />
					))}
				</ol>
			) : null}
		</section>
	);
}

export function TaiLieuBo({
	mucTieu,
	chiXem,
}: {
	mucTieu: MucTieuSoan[];
	chiXem: boolean;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	return (
		<div className="flex flex-col gap-6" data-tai-lieu-bo="">
			{mucTieu.length === 0 && !chiXem ? (
				<FieldDescription>{m.taiLieu.boTrong}</FieldDescription>
			) : null}
			{mucTieu.map((mt, i) => (
				<div key={mt.id} className="flex flex-col gap-6">
					{i > 0 ? <Separator /> : null}
					<KhoiMucTieuDoc mt={mt} khoa={chiXem} locale={locale} />
				</div>
			))}
		</div>
	);
}
