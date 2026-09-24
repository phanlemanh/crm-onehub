"use client";

import CheckmarkOutline from "@carbon/icons-react/es/CheckmarkOutline";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import { Spinner } from "@crm/ui/components/spinner";
import {
	IndicatorDot,
	StatusIndicator,
} from "@crm/ui/components/status-indicator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import {
	KR_CUA_TOI,
	type KrMau,
	KY,
	type MucTieuMau,
	type MucTuTin,
} from "./du-lieu";
import {
	DangTai,
	giaTri,
	Loi,
	NHAN_TU_TIN,
	so,
	TONE_TU_TIN,
} from "./phan-chung";

export type HinhCapNhat =
	| "dang-dien"
	| "so-khong-hop-le"
	| "dang-gui"
	| "loi-gui"
	| "da-gui"
	| "dang-tai"
	| "rong"
	| "loi";

type O = { giaTri: string; tuTin: MucTuTin | null; ghiChu: string };

const MUC: MucTuTin[] = ["cao", "vua", "thap"];

function oBanDau(hinh: HinhCapNhat) {
	const o = new Map<string, O>(
		KR_CUA_TOI.map(({ kr }) => [
			kr.id,
			{ giaTri: so(kr.hienTai), tuTin: null, ghiChu: "" },
		]),
	);
	const doi = (id: string, them: Partial<O>) => {
		const cu = o.get(id);
		if (cu) o.set(id, { ...cu, ...them });
	};
	if (hinh !== "rong") {
		doi("c1k1", {
			giaTri: "3",
			tuTin: "cao",
			ghiChu: "Ca tối đủ người cả tuần.",
		});
		doi("c1k2", { tuTin: "vua" });
	}
	if (hinh === "so-khong-hop-le") doi("c2k1", { giaTri: "ba", tuTin: "vua" });
	if (hinh === "dang-gui" || hinh === "loi-gui") {
		for (const [id, cu] of o) {
			if (cu.tuTin === null) doi(id, { tuTin: id === "c1k3" ? "thap" : "vua" });
		}
	}
	return o;
}

function ChonTuTin({
	value,
	onChange,
	khoa,
	truoc,
	id,
}: {
	value: MucTuTin | null;
	onChange: (v: MucTuTin) => void;
	khoa: boolean;
	truoc: MucTuTin;
	id: string;
}) {
	return (
		<Field>
			<FieldLabel id={`${id}-tu-tin`}>Mức tự tin</FieldLabel>
			<ToggleGroup
				aria-labelledby={`${id}-tu-tin`}
				className="w-full sm:w-fit"
				disabled={khoa}
				onValueChange={(v) => {
					if (v) onChange(v as MucTuTin);
				}}
				size="lg"
				spacing={0}
				type="single"
				value={value ?? ""}
				variant="outline"
			>
				{MUC.map((m) => (
					<ToggleGroupItem
						className="flex-1 gap-2 sm:flex-none"
						key={m}
						value={m}
					>
						<IndicatorDot aria-hidden="true" tone={TONE_TU_TIN[m]} />
						{NHAN_TU_TIN[m]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			<span className="text-muted-foreground text-xs">
				Tuần trước: {NHAN_TU_TIN[truoc].toLowerCase()}
			</span>
		</Field>
	);
}

function OGiaTri({
	kr,
	value,
	onChange,
	khoa,
	loi,
}: {
	kr: KrMau;
	value: string;
	onChange: (v: string) => void;
	khoa: boolean;
	loi: boolean;
}) {
	const id = `${kr.id}-gia-tri`;
	if (kr.kieu === "moc") {
		return (
			<Field>
				<FieldLabel id={id}>Mốc</FieldLabel>
				<ToggleGroup
					aria-labelledby={id}
					className="w-full sm:w-fit"
					disabled={khoa}
					onValueChange={(v) => {
						if (v) onChange(v);
					}}
					size="lg"
					spacing={0}
					type="single"
					value={value === "1" ? "1" : "0"}
					variant="outline"
				>
					<ToggleGroupItem className="flex-1 sm:flex-none" value="0">
						Chưa xong
					</ToggleGroupItem>
					<ToggleGroupItem className="flex-1 sm:flex-none" value="1">
						Xong
					</ToggleGroupItem>
				</ToggleGroup>
				<span className="text-muted-foreground text-xs">
					Tuần trước: chưa xong
				</span>
			</Field>
		);
	}

	const moi = Number(value.replace(",", "."));
	const doi = Number.isFinite(moi) && !loi ? moi - kr.hienTai : 0;

	return (
		<Field data-invalid={loi || undefined}>
			<FieldLabel htmlFor={id}>Giá trị</FieldLabel>
			<InputGroup>
				<InputGroupInput
					aria-invalid={loi || undefined}
					className="tabular-nums"
					disabled={khoa}
					id={id}
					inputMode="decimal"
					onChange={(e) => onChange(e.target.value)}
					value={value}
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupText>{kr.donVi}</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
			{loi ? (
				<FieldError>Nhập một số, ví dụ {so(3.5)}</FieldError>
			) : (
				<span className="text-muted-foreground text-xs tabular-nums">
					Tuần trước {giaTri(kr)} · đích {giaTri(kr, kr.dich)}
					{doi !== 0
						? ` · ${doi > 0 ? "+" : "−"}${so(Math.abs(doi))} so với tuần trước`
						: ""}
				</span>
			)}
		</Field>
	);
}

function DongCapNhat({
	kr,
	mucTieu,
	o,
	datO,
	khoa,
	loi,
}: {
	kr: KrMau;
	mucTieu: MucTieuMau;
	o: O;
	datO: (o: O) => void;
	khoa: boolean;
	loi: boolean;
}) {
	return (
		<li className="flex flex-col gap-3 px-4 py-4" data-kr={kr.id}>
			<div className="flex flex-col gap-0.5">
				<span className="font-medium text-sm" translate="no">
					{kr.ten}
				</span>
				<span className="text-muted-foreground text-xs" translate="no">
					{mucTieu.ten}
				</span>
			</div>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,12rem)_auto_minmax(0,1fr)] md:items-start md:gap-6">
				<OGiaTri
					khoa={khoa}
					kr={kr}
					loi={loi}
					onChange={(giaTri) => datO({ ...o, giaTri })}
					value={o.giaTri}
				/>
				<ChonTuTin
					id={kr.id}
					khoa={khoa}
					onChange={(tuTin) => datO({ ...o, tuTin })}
					truoc={kr.tuTin}
					value={o.tuTin}
				/>
				<Field>
					<FieldLabel htmlFor={`${kr.id}-ghi-chu`}>Ghi chú</FieldLabel>
					<Input
						disabled={khoa}
						id={`${kr.id}-ghi-chu`}
						maxLength={200}
						onChange={(e) => datO({ ...o, ghiChu: e.target.value })}
						placeholder="Một dòng: điều gì đổi, cần ai giúp"
						value={o.ghiChu}
					/>
				</Field>
			</div>
		</li>
	);
}

function DaGui() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1 rounded-lg border p-4">
				<StatusIndicator
					label={`Đã gửi ${KR_CUA_TOI.length} cập nhật lúc 08:42`}
					tone="success"
				/>
				<p className="text-muted-foreground text-xs">
					Mất 48 giây. Lần kế tiếp: Thứ Hai 07/12 — tin nhắc buổi sáng qua Zalo
					sẽ dẫn thẳng về đây.
				</p>
			</div>
			<ul className="flex flex-col divide-y rounded-lg border">
				{KR_CUA_TOI.map(({ kr }, i) => (
					<li
						className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
						key={kr.id}
					>
						<span className="min-w-0 flex-1 text-sm" translate="no">
							{kr.ten}
						</span>
						<span className="text-sm tabular-nums">
							{i === 0 ? `${so(3)} ${kr.donVi}` : giaTri(kr)}
						</span>
						<StatusIndicator
							label={`Tự tin ${NHAN_TU_TIN[i === 2 ? "thap" : i === 0 ? "cao" : "vua"].toLowerCase()}`}
							size="sm"
							tone={TONE_TU_TIN[i === 2 ? "thap" : i === 0 ? "cao" : "vua"]}
						/>
					</li>
				))}
			</ul>
			<div>
				<Button size="sm" variant="outline">
					Về Của tôi
				</Button>
			</div>
		</div>
	);
}

export function CapNhatTuan({ hinh }: { hinh: HinhCapNhat }) {
	const [o, setO] = useState(() => oBanDau(hinh));

	if (hinh === "dang-tai") return <DangTai />;
	if (hinh === "loi")
		return (
			<Loi cau="Không lấy được danh sách KR của bạn. Chưa có gì bị mất — thử lại sau ít phút." />
		);
	if (hinh === "da-gui") return <DaGui />;
	if (hinh === "rong") {
		return (
			<Empty className="rounded-lg border">
				<EmptyHeader>
					<Icon
						className="size-5 text-muted-foreground"
						icon={CheckmarkOutline}
					/>
					<EmptyTitle>Tuần này bạn không có KR nào cần cập nhật</EmptyTitle>
					<EmptyDescription>
						Bạn chưa phụ trách KR nào đang chạy trong {KY.ten}. Người tham gia
						một mục tiêu không phải cập nhật tuần.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button size="sm" variant="outline">
						Về Của tôi
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const dangGui = hinh === "dang-gui";
	const sanSang = KR_CUA_TOI.filter(
		({ kr }) => o.get(kr.id)?.tuTin !== null,
	).length;
	const coLoiSo = hinh === "so-khong-hop-le";

	return (
		<div className="flex flex-col gap-4">
			<p className="text-muted-foreground text-sm">
				{KR_CUA_TOI.length} KR bạn phụ trách · {KY.tuan} · hạn {KY.hanCapNhat}.
				Số đã điền sẵn từ tuần trước — chỉ sửa chỗ đã đổi, rồi chọn mức tự tin.
			</p>
			{hinh === "loi-gui" ? (
				<Alert variant="destructive">
					<Icon icon={WarningAlt} />
					<AlertTitle>Chưa gửi được</AlertTitle>
					<AlertDescription>
						Máy chủ không trả lời. Mọi ô bạn điền vẫn còn trên màn — bấm Gửi
						lại.
					</AlertDescription>
				</Alert>
			) : null}
			<ul className="flex flex-col divide-y rounded-lg border">
				{KR_CUA_TOI.map(({ kr, mucTieu }) => {
					const oKr = o.get(kr.id);
					if (!oKr) return null;
					return (
						<DongCapNhat
							datO={(moi) => setO((cu) => new Map(cu).set(kr.id, moi))}
							key={kr.id}
							khoa={dangGui}
							kr={kr}
							loi={coLoiSo && kr.id === "c2k1"}
							mucTieu={mucTieu}
							o={oKr}
						/>
					);
				})}
			</ul>
			<div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-background px-4 py-3 sm:flex-row sm:items-center md:mx-0 md:rounded-lg md:border">
				<span
					className="text-muted-foreground text-xs sm:flex-1"
					aria-live="polite"
				>
					{coLoiSo
						? "1 KR có số chưa hợp lệ — sửa rồi gửi."
						: sanSang === KR_CUA_TOI.length
							? `Đủ ${sanSang}/${KR_CUA_TOI.length} KR.`
							: `Đã chọn mức tự tin ${sanSang}/${KR_CUA_TOI.length} KR. KR chưa chọn sẽ chờ lần gửi sau.`}
				</span>
				<Button
					disabled={dangGui || sanSang === 0 || coLoiSo}
					className="w-full sm:w-auto"
				>
					{dangGui ? <Spinner data-icon="inline-start" /> : null}
					{dangGui
						? "Đang gửi…"
						: hinh === "loi-gui"
							? `Gửi lại ${sanSang} cập nhật`
							: `Gửi ${sanSang} cập nhật`}
				</Button>
			</div>
		</div>
	);
}
