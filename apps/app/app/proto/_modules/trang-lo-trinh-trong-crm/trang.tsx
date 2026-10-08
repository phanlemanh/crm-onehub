"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { Progress } from "@crm/ui/components/progress";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import type { DauVao, DuLieu, LoTrinh, Moc, NhomTrangThai } from "./du-lieu";

const TONE = {
	"da-giao": "success",
	"dang-lam": "info",
	"chua-bat-dau": "neutral",
	khac: "warning",
} as const satisfies Record<NhomTrangThai, StatusTone>;

const NHAN_TIEN_DO = [
	["da_giao", "Đã giao"],
	["dang_lam", "Đang làm"],
	["chua_bat_dau", "Chưa bắt đầu"],
	["khac", "Khác"],
] as const;

const TAT_CA = "__tat-ca";
const KHONG_NHOM = "__khong-nhom";

function mocQuaConViec(moc: Moc, homNay: string) {
	return (
		/^\d{4}-\d{2}-\d{2}$/.test(moc.ngay) &&
		moc.ngay < homNay &&
		moc.con_viec === true
	);
}

function viecTre(loTrinh: LoTrinh, homNay: string) {
	const theoMa = new Map(loTrinh.hang.map((h) => [h.ma, h]));
	const ra: string[] = [];
	for (const m of loTrinh.moc) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(m.ngay) || !(m.ngay < homNay)) continue;
		for (const ma of m.hang) {
			const h = theoMa.get(ma);
			if (h && h.nhom_trang_thai !== "da-giao" && !ra.includes(ma)) ra.push(ma);
		}
	}
	return ra;
}

const dinhNgay = new Intl.DateTimeFormat("vi-VN", {
	day: "numeric",
	month: "numeric",
	year: "numeric",
});

function ngayDep(ngay: string) {
	const [y, m, d] = ngay.split("-").map(Number);
	if (!y || !m || !d) return ngay;
	return dinhNgay.format(new Date(y, m - 1, d));
}

function mocCuaViec(loTrinh: LoTrinh) {
	const ra = new Map<string, Moc>();
	for (const m of loTrinh.moc)
		for (const ma of m.hang) if (!ra.has(ma)) ra.set(ma, m);
	return ra;
}

function DauTrang() {
	return (
		<div className="flex flex-col gap-1">
			<h1 className="font-heading font-semibold text-xl">Lộ trình</h1>
			<p className="text-muted-foreground text-sm">
				Việc đội sản phẩm đang làm cho CRM và mốc của từng việc. Trang này chỉ
				để xem — muốn đổi kế hoạch, hãy báo đội sản phẩm.
			</p>
		</div>
	);
}

function ChiTietDoi({ chu }: { chu: string }) {
	return (
		<Collapsible data-lo-trinh-chi-tiet>
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					Chi tiết cho đội sản phẩm
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<p className="px-3 py-2 text-muted-foreground text-xs" translate="no">
					{chu}
				</p>
			</CollapsibleContent>
		</Collapsible>
	);
}

function KhungTrong({
	ca,
	tieuDe,
	moTa,
	cauMay,
}: {
	ca: string;
	tieuDe: string;
	moTa: string;
	cauMay?: string;
}) {
	return (
		<Empty border="solid" data-lo-trinh-trang={ca}>
			<EmptyHeader>
				<EmptyTitle>{tieuDe}</EmptyTitle>
				<EmptyDescription>{moTa}</EmptyDescription>
			</EmptyHeader>
			{cauMay ? <ChiTietDoi chu={cauMay} /> : null}
		</Empty>
	);
}

function TienDo({ loTrinh }: { loTrinh: LoTrinh }) {
	const { tien_do: t } = loTrinh;
	return (
		<div className="flex flex-col gap-3">
			<Progress
				label="Đã giao"
				value={t.tong ? (t.da_giao / t.tong) * 100 : 0}
				valueText={`${t.da_giao}/${t.tong}`}
			/>
			<dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{NHAN_TIEN_DO.map(([khoa, nhan]) => (
					<div className="flex flex-col gap-0.5" key={khoa}>
						<dt className="text-muted-foreground text-xs">{nhan}</dt>
						<dd
							className="font-medium text-lg tabular-nums"
							data-tien-do={khoa}
						>
							{t[khoa]}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}

function DanhSachViec({
	loTrinh,
	nhom,
	homNay,
}: {
	loTrinh: LoTrinh;
	nhom: string;
	homNay: string | null;
}) {
	const theoMoc = mocCuaViec(loTrinh);
	const viec = loTrinh.hang.filter((h) =>
		nhom === TAT_CA
			? true
			: nhom === KHONG_NHOM
				? h.nhom === ""
				: h.nhom === nhom,
	);
	return (
		<ItemGroup className="gap-2">
			{viec.map((h) => {
				const moc = theoMoc.get(h.ma);
				const tre = homNay !== null && viecTre(loTrinh, homNay).includes(h.ma);
				return (
					<Item data-viec-ma={h.ma} key={h.ma} variant="outline">
						<ItemContent>
							<ItemTitle className="font-normal" translate="no">
								{h.cau_giao}
							</ItemTitle>
							<ItemDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
								<StatusIndicator
									label={<span translate="no">{h.trang_thai}</span>}
									size="sm"
									tone={TONE[h.nhom_trang_thai]}
								/>
								<Badge translate="no" variant="mono">
									{h.ma}
								</Badge>
								{h.nhom ? <span translate="no">{h.nhom}</span> : null}
								{moc ? (
									<span data-lo-trinh-moc-viec={moc.ngay}>
										Mốc {ngayDep(moc.ngay)}
										{tre ? " · trễ" : ""}
									</span>
								) : null}
							</ItemDescription>
							{h.co.length ? (
								<ul className="flex flex-col gap-0.5 text-warning text-xs">
									{h.co.map((c) => (
										<li key={c} translate="no">
											{c}
										</li>
									))}
								</ul>
							) : null}
						</ItemContent>
					</Item>
				);
			})}
		</ItemGroup>
	);
}

function BoLoc({
	loTrinh,
	nhom,
	doiNhom,
}: {
	loTrinh: LoTrinh;
	nhom: string;
	doiNhom: (n: string) => void;
}) {
	const dem = new Map<string, number>();
	for (const h of loTrinh.hang) dem.set(h.nhom, (dem.get(h.nhom) ?? 0) + 1);
	const coTen = [...dem.keys()].filter((k) => k !== "");
	if (coTen.length < 2 && !dem.has("")) return null;
	return (
		<ToggleGroup
			aria-label="Lọc theo nhóm"
			className="flex-wrap"
			onValueChange={(v) => doiNhom(v || TAT_CA)}
			size="sm"
			spacing={1}
			type="single"
			value={nhom}
			variant="outline"
		>
			<ToggleGroupItem value={TAT_CA}>
				Tất cả <span className="tabular-nums">{loTrinh.hang.length}</span>
			</ToggleGroupItem>
			{coTen.map((k) => (
				<ToggleGroupItem key={k} value={k}>
					<span translate="no">{k}</span>
					<span className="tabular-nums">{dem.get(k)}</span>
				</ToggleGroupItem>
			))}
			{dem.has("") && coTen.length ? (
				<ToggleGroupItem value={KHONG_NHOM}>
					Không nhóm <span className="tabular-nums">{dem.get("")}</span>
				</ToggleGroupItem>
			) : null}
		</ToggleGroup>
	);
}

function DanhSachMoc({
	loTrinh,
	homNay,
}: {
	loTrinh: LoTrinh;
	homNay: string | null;
}) {
	if (!loTrinh.moc.length) return null;
	return (
		<div className="flex flex-col gap-2">
			<SectionHeading>Mốc</SectionHeading>
			<ItemGroup className="gap-1">
				{loTrinh.moc.map((m) => {
					const qua = homNay !== null && mocQuaConViec(m, homNay);
					return (
						<Item
							data-lo-trinh-moc={m.ngay}
							key={`${m.ngay}-${m.ten}`}
							size="xs"
						>
							<ItemContent>
								<ItemTitle className="font-normal" translate="no">
									{m.ten}
								</ItemTitle>
								{m.hang.length ? (
									<ItemDescription translate="no">
										{m.hang.join(" · ")}
									</ItemDescription>
								) : null}
							</ItemContent>
							<ItemActions className="flex flex-col items-end gap-1">
								<span className="text-sm tabular-nums">{ngayDep(m.ngay)}</span>
								{qua ? (
									<StatusIndicator
										label="Đã qua — còn việc chưa giao"
										size="sm"
										tone="warning"
									/>
								) : null}
							</ItemActions>
						</Item>
					);
				})}
			</ItemGroup>
		</div>
	);
}

function MucGap({
	tieuDe,
	dong,
	ca,
}: {
	tieuDe: string;
	dong: { khoa: string; ma: string | null; chu: string }[];
	ca: string;
}) {
	if (!dong.length) return null;
	return (
		<Collapsible data-lo-trinh-gap={ca}>
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					{tieuDe} ({dong.length})
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ul className="flex flex-col gap-1 px-3 py-2 text-sm">
					{dong.map((d) => (
						<li className="flex gap-2" key={d.khoa}>
							{d.ma ? (
								<Badge translate="no" variant="mono">
									{d.ma}
								</Badge>
							) : null}
							<span translate="no">{d.chu}</span>
						</li>
					))}
				</ul>
			</CollapsibleContent>
		</Collapsible>
	);
}

function TheLoTrinh({
	loTrinh,
	homNay,
	nhomBanDau,
}: {
	loTrinh: LoTrinh;
	homNay: string | null;
	nhomBanDau: string;
}) {
	const [nhom, doiNhom] = useState(nhomBanDau);
	if (loTrinh.loi) {
		return (
			<Alert data-lo-trinh-trang="lo-loi" variant="destructive">
				<AlertTitle>Không đọc được lộ trình này</AlertTitle>
				<AlertDescription>
					Đội sản phẩm cần sửa kế hoạch của lộ trình này. Các lộ trình khác vẫn
					xem được.
				</AlertDescription>
				<ChiTietDoi chu={loTrinh.loi} />
			</Alert>
		);
	}
	const tre = homNay === null ? [] : viecTre(loTrinh, homNay);
	return (
		<div className="flex flex-col gap-6">
			<TienDo loTrinh={loTrinh} />
			{loTrinh.hang_ke ? (
				<div className="flex flex-col gap-2" data-viec-ke={loTrinh.hang_ke.ma}>
					<SectionHeading>Việc kế tiếp</SectionHeading>
					<Item variant="muted">
						<ItemContent>
							<ItemTitle className="font-normal" translate="no">
								{loTrinh.hang_ke.cau_giao}
							</ItemTitle>
							<ItemDescription>
								<Badge translate="no" variant="mono">
									{loTrinh.hang_ke.ma}
								</Badge>
							</ItemDescription>
						</ItemContent>
					</Item>
				</div>
			) : null}
			{tre.length ? (
				<Alert data-lo-trinh-tre variant="warning">
					<AlertTitle>{tre.length} việc đã qua mốc mà chưa giao</AlertTitle>
					<AlertDescription translate="no">{tre.join(" · ")}</AlertDescription>
				</Alert>
			) : null}
			<div className="flex flex-col gap-3">
				<SectionHeading>Việc</SectionHeading>
				<BoLoc doiNhom={doiNhom} loTrinh={loTrinh} nhom={nhom} />
				<DanhSachViec homNay={homNay} loTrinh={loTrinh} nhom={nhom} />
			</div>
			<DanhSachMoc homNay={homNay} loTrinh={loTrinh} />
			<div className="flex flex-col items-start gap-1">
				<MucGap
					ca="can-sua"
					dong={loTrinh.can_sua.map((c, i) => ({
						khoa: `${i}`,
						ma: c.ma,
						chu: c.chu,
					}))}
					tieuDe="Chỗ cần sửa trong kế hoạch"
				/>
				<MucGap
					ca="da-bac"
					dong={loTrinh.da_bac.map((b) => ({
						khoa: b.ma,
						ma: b.ma,
						chu: b.ly_do,
					}))}
					tieuDe="Việc đã bác"
				/>
			</div>
		</div>
	);
}

function CoDuLieu({
	duLieu,
	canhBao,
	homNay,
	nhomBanDau,
}: {
	duLieu: DuLieu;
	canhBao: string[];
	homNay: string | null;
	nhomBanDau: string;
}) {
	const dau = duLieu.lo_trinh[0]?.tep ?? "";
	return (
		<div className="flex flex-col gap-4">
			{canhBao.length ? (
				<Alert data-lo-trinh-canh-bao variant="warning">
					<AlertTitle>Trang có thể thiếu một phần</AlertTitle>
					<AlertDescription>
						Dữ liệu lộ trình mới hơn trang này; phần trang hiểu được vẫn đúng.
					</AlertDescription>
					<ChiTietDoi chu={canhBao.join(" · ")} />
				</Alert>
			) : null}
			<Tabs defaultValue={dau}>
				<TabsList>
					{duLieu.lo_trinh.map((lo) => (
						<TabsTrigger data-lo-trinh-the={lo.tep} key={lo.tep} value={lo.tep}>
							<span translate="no">{lo.ten ?? lo.tep}</span>
						</TabsTrigger>
					))}
				</TabsList>
				{duLieu.lo_trinh.map((lo) => (
					<TabsContent className="pt-4" key={lo.tep} value={lo.tep}>
						<TheLoTrinh homNay={homNay} loTrinh={lo} nhomBanDau={nhomBanDau} />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}

export function TrangLoTrinh({
	dauVao,
	homNay,
	nhomBanDau = TAT_CA,
}: {
	dauVao: DauVao;
	homNay: string | null;
	nhomBanDau?: string;
}) {
	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
			<DauTrang />
			{dauVao.kieu === "dang-tai" ? (
				<div className="flex flex-col gap-3" data-lo-trinh-trang="dang-tai">
					<Skeleton className="h-8 w-72" />
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			) : dauVao.kieu === "tep-vang" ? (
				<KhungTrong
					ca="tep-vang"
					moTa="Bản CRM đang chạy không mang theo lộ trình. Hãy báo đội sản phẩm."
					tieuDe="Chưa xem được lộ trình"
				/>
			) : dauVao.kieu === "chua-co-khoi" ? (
				<KhungTrong
					ca="chua-co-khoi"
					cauMay={dauVao.canhBao.join(" · ")}
					moTa="Lộ trình chưa được xuất cho trang này. Đội sản phẩm sẽ bật khi cập nhật công cụ."
					tieuDe="Lộ trình chưa có ở đây"
				/>
			) : dauVao.kieu === "khoi-hong" ? (
				<KhungTrong
					ca="khoi-hong"
					cauMay={dauVao.canhBao.join(" · ")}
					moTa="Dữ liệu lộ trình bị hỏng nên trang không hiện, để khỏi hiện sai. Hãy báo đội sản phẩm."
					tieuDe="Không đọc được lộ trình"
				/>
			) : (
				<CoDuLieu
					canhBao={dauVao.canhBao}
					duLieu={dauVao.duLieu}
					homNay={homNay}
					nhomBanDau={nhomBanDau}
				/>
			)}
		</div>
	);
}
