"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Switch } from "@crm/ui/components/switch";
import { TableCell } from "@crm/ui/components/table";
import {
	PageShell,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { DON_VI, DONG_LUOT, LUOT, type NacMau, SO_DO } from "./du-lieu";

export type HinhCaiDat =
	| "nac"
	| "nac-bat-toan"
	| "so-do-dang-tai"
	| "so-do-rong"
	| "so-do-co-so"
	| "so-do-ngan"
	| "so-do-loi";

const PHAM_VI: { id: NacMau; nhan: string }[] = [
	{ id: "tat", nhan: "Không đơn vị nào" },
	{ id: "toan-cong-ty", nhan: "Toàn công ty" },
	{ id: "danh-sach", nhan: "Chọn đơn vị" },
];

const CELL = "px-3 py-2.5 align-middle";

function DongNac({
	ma,
	nhan,
	phamVi,
	donVi,
	moTa,
	khoa,
}: {
	ma: string;
	nhan: string;
	phamVi: NacMau;
	donVi: string[];
	moTa: string;
	khoa?: string;
}) {
	const ten = DON_VI.filter((d) => donVi.includes(d.id));
	return (
		<Field data-nac={ma} data-disabled={khoa ? "" : undefined}>
			<FieldLabel htmlFor={`nac-${ma}`}>{nhan}</FieldLabel>
			<Select defaultValue={phamVi} disabled={Boolean(khoa)}>
				<SelectTrigger id={`nac-${ma}`} className="w-full sm:w-56">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{PHAM_VI.map((p) => (
						<SelectItem key={p.id} value={p.id}>
							{p.nhan}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{phamVi === "danh-sach" && !khoa ? (
				<div className="flex flex-wrap items-center gap-2">
					<ul className="flex flex-wrap gap-1.5" aria-label={nhan}>
						{ten.map((d) => (
							<li key={d.id}>
								<Badge variant="token" translate="no">
									{d.ten}
								</Badge>
							</li>
						))}
					</ul>
					<Button variant="outline" size="sm">
						Chọn đơn vị…
					</Button>
				</div>
			) : null}
			<FieldDescription>{khoa ?? moTa}</FieldDescription>
		</Field>
	);
}

function TheTroLyOkr({ batToan }: { batToan: boolean }) {
	return (
		<Card data-the="tro-ly-okr">
			<CardHeader>
				<CardTitle>Trợ lý OKR</CardTitle>
				<CardAction>
					<Button size="sm">Lưu</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<StatusIndicator size="sm" tone="success" label="Sẵn sàng" />
				<FieldGroup>
					<Field orientation="horizontal">
						<FieldContent>
							<FieldLabel htmlFor="tro-ly-bat">Bật Trợ lý OKR</FieldLabel>
							<FieldDescription>
								Nội dung OKR chỉ gửi tới nhà cung cấp mô hình cam kết không lưu
								dữ liệu.
							</FieldDescription>
						</FieldContent>
						<Switch id="tro-ly-bat" defaultChecked />
					</Field>
					<FieldSet>
						<FieldLegend>Góp ý khi bấm</FieldLegend>
						<DongNac
							ma="de-xuat-bat"
							nhan="Bật cho"
							phamVi={batToan ? "toan-cong-ty" : "danh-sach"}
							donVi={["onehub"]}
							moTa="Người sửa được Mục tiêu thấy nút «Nhờ Trợ lý OKR góp ý»."
						/>
						<DongNac
							ma="de-xuat-bong"
							nhan="Chạy bóng cho"
							phamVi="danh-sach"
							donVi={["kd-nam", "dieu-phoi"]}
							moTa="Máy góp ý khi Mục tiêu được lưu; chỉ quản trị thấy kết quả, ở thẻ bên dưới. Tính vào trần tháng."
							khoa={
								batToan
									? "Mọi đơn vị đã bật — không còn đơn vị nào để chạy bóng."
									: undefined
							}
						/>
					</FieldSet>
					<FieldSet>
						<FieldLegend>Tóm tắt tuần</FieldLegend>
						<DongNac
							ma="tom-tat-bat"
							nhan="Bật cho"
							phamVi="tat"
							donVi={[]}
							moTa="Mỗi phòng ban nhận một Tóm tắt tuần ở đầu Họp tuần."
						/>
						<DongNac
							ma="tom-tat-bong"
							nhan="Chạy bóng cho"
							phamVi="toan-cong-ty"
							donVi={[]}
							moTa="Máy tóm tắt sau ngày cập nhật; chỉ quản trị thấy."
						/>
					</FieldSet>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}

function BangSo() {
	const [bat, bong] = SO_DO;
	if (!bat || !bong) return null;
	const hang: { nhan: string; bat: string; bong: string }[] = [
		{ nhan: "Lượt", bat: String(bat.luot), bong: String(bong.luot) },
		{
			nhan: "Đề xuất đã hiện / sinh ra",
			bat: `${bat.daHien} / ${bat.sinhRa}`,
			bong: `0 / ${bong.sinhRa}`,
		},
		{ nhan: "Nhận", bat: `${bat.nhan}%`, bong: "—" },
		{ nhan: "Sửa rồi nhận", bat: `${bat.sua}%`, bong: "—" },
		{ nhan: "Bác", bat: `${bat.bac}%`, bong: "—" },
		{ nhan: "Bỏ qua câu hỏi", bat: `${bat.boQua}%`, bong: "—" },
		{ nhan: "Hoàn tác trong 7 ngày", bat: `${bat.hoanTac}%`, bong: "—" },
		{ nhan: "Độ trễ p50", bat: bat.p50, bong: bong.p50 },
		{ nhan: "Độ trễ p90", bat: bat.p90, bong: bong.p90 },
		{
			nhan: "Câu bị bộ kiểm loại",
			bat: `${bat.biLoai}%`,
			bong: `${bong.biLoai}%`,
		},
		{
			nhan: "Chi phí mỗi đề xuất được nhận",
			bat: bat.chiPhiMoiNhan,
			bong: "—",
		},
	];
	return (
		<SimpleTable
			surface="page"
			columns={[
				{ id: "so", header: "Số đo" },
				{ id: "bat", header: "Bật", width: "w-20", align: "right" },
				{ id: "bong", header: "Bóng", width: "w-20", align: "right" },
			]}
		>
			{hang.map((h) => (
				<SimpleTableRow key={h.nhan}>
					<TableCell className={CELL}>{h.nhan}</TableCell>
					<TableCell className={`${CELL} text-right tabular-nums`}>
						{h.bat}
					</TableCell>
					<TableCell className={`${CELL} text-right tabular-nums`}>
						{h.bong}
					</TableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function TheSoDo({ hinh }: { hinh: HinhCaiDat }) {
	const dau = (
		<CardHeader>
			<CardTitle>Góp ý của Trợ lý OKR — tháng này</CardTitle>
			<CardDescription>
				Số đo của nấc bật và nấc chạy bóng; bấm một lượt để xem từng dòng.
			</CardDescription>
		</CardHeader>
	);
	if (hinh === "so-do-dang-tai") {
		return (
			<Card aria-busy="true" data-the="so-do">
				{dau}
				<CardContent className="grid grid-cols-2 gap-2">
					{["a", "b", "c", "d"].map((k) => (
						<Skeleton key={k} className="h-16 w-full" />
					))}
				</CardContent>
			</Card>
		);
	}
	if (hinh === "so-do-rong" || hinh === "so-do-loi") {
		return (
			<Card data-the="so-do">
				{dau}
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyTitle>
								{hinh === "so-do-rong"
									? "Tháng này chưa có lượt góp ý nào"
									: "Không tải được số đo"}
							</EmptyTitle>
						</EmptyHeader>
						{hinh === "so-do-loi" ? (
							<EmptyContent>
								<Button size="sm" variant="outline">
									Thử lại
								</Button>
							</EmptyContent>
						) : null}
					</Empty>
				</CardContent>
			</Card>
		);
	}
	return (
		<Card data-the="so-do">
			{dau}
			<CardContent className="flex flex-col gap-6">
				<BangSo />
				<SimpleTable
					surface="page"
					columns={[
						{ id: "muc", header: "Mục tiêu" },
						{ id: "nac", header: "Nấc", width: "w-24" },
						{ id: "dong", header: "Dòng", width: "w-16", align: "right" },
						{ id: "tre", header: "Độ trễ", width: "w-20", align: "right" },
					]}
				>
					{LUOT.map((l) => (
						<SimpleTableRow key={l.id}>
							<TableCell className={CELL}>
								<span translate="no">{l.muc}</span>
								<span className="block text-muted-foreground" translate="no">
									{l.donVi}
								</span>
							</TableCell>
							<TableCell className={CELL}>{l.nac}</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{l.dong}
								{l.biLoai ? ` (+${l.biLoai} loại)` : ""}
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{l.doTre}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</CardContent>
		</Card>
	);
}

function NganLuot() {
	const l = LUOT[0];
	if (!l) return null;
	return (
		<Sheet open>
			<SheetContent size="md">
				<SheetHeader>
					<SheetTitle translate="no">{l.muc}</SheetTitle>
					<SheetDescription>
						{l.donVi} · {l.nac} · {l.doTre} · {l.tien}
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-3 px-4">
					{DONG_LUOT.map((d) => (
						<div key={d.sau} className="flex flex-col gap-1 border-b pb-3">
							<p className="text-muted-foreground">{d.loai}</p>
							{d.truoc ? (
								<p
									className="text-muted-foreground line-through"
									translate="no"
								>
									{d.truoc}
								</p>
							) : null}
							<p translate="no">{d.sau}</p>
							<StatusIndicator
								size="sm"
								tone={d.trangThai.startsWith("Bị loại") ? "warning" : "neutral"}
								label={d.trangThai}
							/>
						</div>
					))}
				</div>
			</SheetContent>
		</Sheet>
	);
}

export function CaiDatGopY({ hinh }: { hinh: HinhCaiDat }) {
	const laNac = hinh === "nac" || hinh === "nac-bat-toan";
	return (
		<PageShell>
			<div className="flex w-full max-w-(--container-page) flex-col gap-6">
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>Chương trình OKR</PageShellTitle>
						<PageShellDescription>
							Chu kỳ, luật chung và Trợ lý OKR của cả công ty.
						</PageShellDescription>
					</PageShellHeading>
				</PageShellHeader>
				{laNac ? <TheTroLyOkr batToan={hinh === "nac-bat-toan"} /> : null}
				{laNac ? null : <TheSoDo hinh={hinh} />}
				{hinh === "so-do-ngan" ? <NganLuot /> : null}
			</div>
		</PageShell>
	);
}
