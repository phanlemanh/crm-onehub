"use client";

import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
} from "@crm/ui/components/area-sidebar";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@crm/ui/components/input-group";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Skeleton } from "@crm/ui/components/skeleton";
import { TablePagination } from "@crm/ui/components/table-pagination";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useState } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	CO_TRANG,
	DONG_TIN,
	type DongTin,
	khopPhamVi,
	type PhamVi,
	TOI,
	TONG_THAT,
} from "./du-lieu";

type Hinh = "co" | "rong" | "dang-tai" | "loi";

const CANH = {
	"ST-cng-tat-ca": { pham: "tat-ca", hinh: "co", traLoi: null },
	"ST-cng-toi-dan": { pham: "toi-dan", hinh: "co", traLoi: null },
	"ST-cng-theo-doi": { pham: "theo-doi", hinh: "co", traLoi: null },
	"ST-cng-tra-loi": { pham: "tat-ca", hinh: "co", traLoi: "kr-2-t0" },
	"ST-cng-rong-loc": { pham: "theo-doi", hinh: "rong", traLoi: null },
	"ST-cng-rong": { pham: "tat-ca", hinh: "rong", traLoi: null },
	"ST-cng-dang-tai": { pham: "tat-ca", hinh: "dang-tai", traLoi: null },
	"ST-cng-loi": { pham: "tat-ca", hinh: "loi", traLoi: null },
} satisfies Record<string, { pham: PhamVi; hinh: Hinh; traLoi: string | null }>;

type TenState = keyof typeof CANH;

const laState = (s: string): s is TenState => Object.hasOwn(CANH, s);

const NHAN_PHAM = {
	"tat-ca": "Tất cả",
	"toi-dan": "Tôi dẫn",
	"theo-doi": "Đang theo dõi",
} satisfies Record<PhamVi, string>;

const NHOM = [
	{ khoa: "dau", nhan: undefined, muc: ["Của tôi", "Cập nhật gần đây"] },
	{ khoa: "okr", nhan: "OKR", muc: ["Bộ OKR", "Lấy ý kiến"] },
	{ khoa: "bao-cao", nhan: "Báo cáo", muc: ["Sức khoẻ", "Mọi KR", "Sơ đồ"] },
];

function ThanhBen() {
	return (
		<AreaSidebar
			header={
				<Select defaultValue="q4">
					<SelectTrigger aria-label="Chu kỳ" size="sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent align="start">
						<SelectItem value="q4">Quý 4 · 2026</SelectItem>
						<SelectItem value="q3">Quý 3 · 2026</SelectItem>
					</SelectContent>
				</Select>
			}
			label="Mục tiêu"
		>
			{NHOM.map((n) => (
				<AreaSidebarGroup key={n.khoa} label={n.nhan}>
					{n.muc.map((m) => (
						<AreaSidebarItem active={m === "Cập nhật gần đây"} key={m}>
							{m}
						</AreaSidebarItem>
					))}
				</AreaSidebarGroup>
			))}
		</AreaSidebar>
	);
}

function TraLoi({ dong, mo }: { dong: DongTin; mo: boolean }) {
	const [dangMo, setDangMo] = useState(mo);
	const [noiDung, setNoiDung] = useState(
		mo ? "Em gửi thêm số khách gói nhỏ theo tháng." : "",
	);
	return (
		<ItemFooter className="basis-full flex-col items-stretch gap-2">
			{dong.traLoi.map((t) => (
				<div className="flex gap-2" data-tra-loi={t.id} key={t.id}>
					<PersonAvatar name={t.nguoi} size="sm" />
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="text-muted-foreground text-xs">
							<span className="font-medium text-foreground" translate="no">
								{t.nguoi}
							</span>{" "}
							· {t.luc}
						</span>
						<p className="text-sm" translate="no">
							{t.than}
						</p>
					</div>
				</div>
			))}
			{dangMo ? (
				<InputGroup data-o-tra-loi>
					<InputGroupTextarea
						aria-label={`Trả lời lần cập nhật của ${dong.nguoi}`}
						autoFocus={!mo}
						onChange={(e) => setNoiDung(e.target.value)}
						placeholder="Trả lời…"
						rows={2}
						value={noiDung}
					/>
					<InputGroupAddon align="block-end">
						<InputGroupButton
							onClick={() => {
								setDangMo(false);
								setNoiDung("");
							}}
							size="xs"
							variant="ghost"
						>
							Huỷ
						</InputGroupButton>
						<InputGroupButton
							className="ml-auto"
							disabled={noiDung.trim() === ""}
							size="xs"
							variant="default"
						>
							Gửi
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			) : (
				<div>
					<Button
						data-mo-tra-loi
						onClick={() => setDangMo(true)}
						size="sm"
						variant="ghost"
					>
						Trả lời
					</Button>
				</div>
			)}
		</ItemFooter>
	);
}

function Dong({ dong, moTraLoi }: { dong: DongTin; moTraLoi: boolean }) {
	return (
		<Item data-dong-tin={dong.id} variant="outline">
			<ItemMedia>
				<PersonAvatar name={dong.nguoi} />
			</ItemMedia>
			<ItemContent className="min-w-0">
				<ItemDescription>
					<span className="font-medium text-foreground" translate="no">
						{dong.nguoi}
					</span>
					{dong.thayCho ? (
						<>
							{" "}
							thay cho <span translate="no">{dong.thayCho}</span>
						</>
					) : null}{" "}
					· {dong.luc}
				</ItemDescription>
				<ItemTitle>
					<button
						className="text-left hover:underline"
						data-mo-kr={dong.krId}
						type="button"
					>
						<span translate="no">{dong.kr}</span>
					</button>
				</ItemTitle>
				<ItemDescription translate="no">
					{dong.mucTieu} · {dong.bo.ten}
				</ItemDescription>
				<div className="flex flex-wrap items-center gap-3 pt-1">
					<span className="font-medium text-sm tabular-nums">
						{dong.giaTri}
					</span>
					<ConfidenceIndicator level={dong.tuTin} size="sm" />
				</div>
				{dong.ghiChu ? (
					<p className="pt-1 text-sm" translate="no">
						{dong.ghiChu}
					</p>
				) : null}
				{dong.moiNhat ? null : (
					<p className="pt-1 text-muted-foreground text-xs">
						Có lần cập nhật mới hơn — trả lời ở đó.
					</p>
				)}
			</ItemContent>
			{dong.moiNhat ? <TraLoi dong={dong} mo={moTraLoi} /> : null}
		</Item>
	);
}

function NoiDung({ state }: { state: TenState }) {
	const canh = CANH[state];
	const [pham, setPham] = useState<PhamVi>(canh.pham);
	const [trang, setTrang] = useState(1);
	const dem = {
		"tat-ca": TONG_THAT["tat-ca"],
		"toi-dan": TONG_THAT["toi-dan"],
		"theo-doi": canh.hinh === "rong" ? 0 : TONG_THAT["theo-doi"],
	};
	if (canh.hinh === "rong" && canh.pham === "tat-ca") dem["tat-ca"] = 0;
	const dong = DONG_TIN.filter((d) => khopPhamVi(d, pham)).slice(0, CO_TRANG);
	const hangCongCu = (
		<div className="max-w-full overflow-x-auto" data-loc-pham-vi>
			<ToggleGroup
				aria-label="Lọc theo phạm vi"
				onValueChange={(v) => {
					if (v === "tat-ca" || v === "toi-dan" || v === "theo-doi") setPham(v);
				}}
				size="sm"
				type="single"
				value={pham}
				variant="outline"
			>
				{(["tat-ca", "toi-dan", "theo-doi"] as const).map((p) => (
					<ToggleGroupItem count={dem[p]} key={p} value={p}>
						{NHAN_PHAM[p]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
	let than = (
		<>
			<ItemGroup className="gap-3" data-dong-tin-ds>
				{dong.map((d) => (
					<Dong dong={d} key={d.id} moTraLoi={canh.traLoi === d.id} />
				))}
			</ItemGroup>
			<TablePagination
				onPageChange={setTrang}
				page={trang}
				pageSize={CO_TRANG}
				total={TONG_THAT[pham]}
				totalPages={Math.ceil(TONG_THAT[pham] / CO_TRANG)}
			/>
		</>
	);
	if (canh.hinh === "dang-tai")
		than = (
			<div className="flex flex-col gap-3" data-trang-thai="ST-cng-cho">
				{[0, 1, 2, 3].map((i) => (
					<Skeleton className="h-28 w-full" key={i} />
				))}
			</div>
		);
	if (canh.hinh === "loi")
		than = (
			<VungTaiLoi
				moTa="Máy chủ không trả lời. Dữ liệu của bạn không mất."
				onThuLai={() => {}}
				tieuDe="Chưa tải được các lần cập nhật"
			/>
		);
	if (canh.hinh === "rong" && pham === "theo-doi")
		than = (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Chưa có lần cập nhật nào ở «Đang theo dõi»</EmptyTitle>
					<EmptyDescription>
						Theo dõi một mục tiêu ở bộ OKR khác để thấy các lần cập nhật của bộ
						đó ở đây.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={() => setPham("tat-ca")} size="sm" variant="outline">
						Xem tất cả
					</Button>
				</EmptyContent>
			</Empty>
		);
	if (canh.hinh === "rong" && canh.pham === "tat-ca")
		than = (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Chu kỳ này chưa có lần cập nhật nào</EmptyTitle>
					<EmptyDescription>
						Khi người phụ trách cập nhật một KR, lần cập nhật hiện ở đây, mới
						nhất trước.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Cập nhật gần đây</PageShellTitle>
					<PageShellDescription>
						Mọi lần cập nhật KR trong chu kỳ, mới nhất trước — đọc trước buổi
						họp tuần và trả lời ngay dưới lần cập nhật.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<div className="flex min-w-0 flex-col gap-4">
					{canh.hinh === "loi" || canh.hinh === "dang-tai" ? null : hangCongCu}
					{than}
				</div>
			</PageShellContent>
		</PageShell>
	);
}

export function CapNhatGanDayMau({ state }: { state: string }) {
	const s = laState(state) ? state : "ST-cng-tat-ca";
	return (
		<LocaleProvider locale="vi">
			<div
				className="ml-[calc(50%-50vw)] flex min-h-[48rem] w-screen flex-col border-y bg-background md:flex-row"
				data-nguoi-xem={TOI.id}
			>
				<ThanhBen />
				<div className="flex min-w-0 flex-1 flex-col p-4 md:p-6">
					<NoiDung key={s} state={s} />
				</div>
			</div>
		</LocaleProvider>
	);
}
