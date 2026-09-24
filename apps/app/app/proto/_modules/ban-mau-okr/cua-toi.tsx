"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Chat from "@carbon/icons-react/es/Chat";
import Edit from "@carbon/icons-react/es/Edit";
import Time from "@carbon/icons-react/es/Time";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { Icon } from "@crm/ui/components/icon";
import {
	type KrMau,
	KY,
	MUC_TIEU_CUA_TOI,
	type MucTieuMau,
	TOI,
	VIEC_CUA_TOI,
	type ViecMau,
} from "./du-lieu";
import {
	ChuThichVach,
	DangTai,
	giaTri,
	LoaiMucTieuNhan,
	Loi,
	TenNguoi,
	ThanhTienDo,
	TinhTrangKr,
	TuTin,
	tienDo,
} from "./phan-chung";

const ICON_VIEC = {
	"cap-nhat": Edit,
	"nhac-ten": Chat,
	im: Time,
} satisfies Record<ViecMau["loai"], CarbonIcon>;

function ViecCanLam() {
	return (
		<section aria-labelledby="viec-can-lam" className="flex flex-col gap-3">
			<h3 className="font-medium text-base tracking-tight" id="viec-can-lam">
				Việc cần làm
			</h3>
			<ul className="flex flex-col divide-y rounded-lg border">
				{VIEC_CUA_TOI.map((v) => (
					<li
						className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
						key={v.id}
					>
						<span className="flex min-w-0 flex-1 items-start gap-3">
							<Icon
								className="mt-0.5 shrink-0 text-muted-foreground"
								icon={ICON_VIEC[v.loai]}
							/>
							<span className="flex min-w-0 flex-col gap-0.5">
								<span className="font-medium text-sm">{v.cau}</span>
								<span className="text-muted-foreground text-xs">{v.phu}</span>
							</span>
						</span>
						{v.loai === "cap-nhat" ? (
							<Button className="sm:shrink-0" size="sm">
								Cập nhật tuần
								<Icon icon={ArrowRight} data-icon="inline-end" />
							</Button>
						) : (
							<Button className="sm:shrink-0" size="sm" variant="outline">
								Mở KR
							</Button>
						)}
					</li>
				))}
			</ul>
		</section>
	);
}

export function DongKr({
	kr,
	mucTieu,
	danhDauCuaToi = false,
}: {
	kr: KrMau;
	mucTieu: MucTieuMau;
	danhDauCuaToi?: boolean;
}) {
	const p = tienDo(kr);
	return (
		<li className="grid grid-cols-1 gap-x-6 gap-y-2 px-4 py-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
			<span className="flex min-w-0 flex-col gap-0.5">
				<span className="text-sm" translate="no">
					{kr.ten}
				</span>
				<span className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs">
					<TenNguoi avatar={false} ten={kr.phuTrach.ten} />
					{danhDauCuaToi && kr.phuTrach.id === TOI.id ? (
						<span>· bạn phụ trách</span>
					) : null}
					{kr.capNhatLuc ? (
						<span>· cập nhật {kr.capNhatLuc}</span>
					) : (
						<span>· chưa cập nhật</span>
					)}
				</span>
			</span>
			<span className="flex min-w-0 flex-col gap-1">
				<ThanhTienDo
					kyVong={kr.kieu === "moc" ? null : undefined}
					nhan={kr.ten}
					phanTram={p}
				/>
				<span className="flex items-baseline justify-between gap-2 text-xs">
					<span className="tabular-nums">{giaTri(kr)}</span>
					<span className="text-muted-foreground tabular-nums">
						{kr.kieu === "moc" ? "mốc" : `đích ${giaTri(kr, kr.dich)}`}
					</span>
				</span>
			</span>
			<TinhTrangKr
				laMoc={kr.kieu === "moc"}
				loai={mucTieu.loai}
				phanTram={p}
				size="sm"
			/>
			<TuTin muc={kr.tuTin} size="sm" />
		</li>
	);
}

export function KhoiMucTieu({
	mucTieu,
	danhDauCuaToi = false,
	hienDonVi = true,
}: {
	mucTieu: MucTieuMau;
	danhDauCuaToi?: boolean;
	hienDonVi?: boolean;
}) {
	return (
		<article
			className="flex flex-col rounded-lg border"
			data-muc-tieu={mucTieu.id}
		>
			<header className="flex flex-col gap-1.5 border-b px-4 py-3">
				<div className="flex flex-wrap items-start gap-x-3 gap-y-1">
					<h4 className="min-w-0 flex-1 font-medium text-sm" translate="no">
						{mucTieu.ten}
					</h4>
					<LoaiMucTieuNhan loai={mucTieu.loai} />
				</div>
				<p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
					{hienDonVi ? <span translate="no">{mucTieu.donVi}</span> : null}
					{hienDonVi ? <span aria-hidden="true">·</span> : null}
					<span>Phụ trách</span>
					<TenNguoi avatar={false} ten={mucTieu.phuTrach.ten} />
					{mucTieu.gopVao.length > 0 ? (
						<>
							<span aria-hidden="true">·</span>
							<span>
								Góp vào {mucTieu.gopVao.length} chỗ:{" "}
								<span translate="no">
									{mucTieu.gopVao
										.map((g) =>
											g.kr
												? `${g.donVi} › ${g.kr}`
												: `${g.donVi} › ${g.mucTieu}`,
										)
										.join(" · ")}
								</span>
							</span>
						</>
					) : null}
				</p>
			</header>
			<ul className="flex flex-col divide-y">
				{mucTieu.kr.map((k) => (
					<DongKr
						danhDauCuaToi={danhDauCuaToi}
						key={k.id}
						kr={k}
						mucTieu={mucTieu}
					/>
				))}
			</ul>
		</article>
	);
}

export function CuaToi({
	hinh,
}: {
	hinh: "co-du-lieu" | "dang-tai" | "rong" | "loi";
}) {
	if (hinh === "dang-tai") return <DangTai />;
	if (hinh === "loi")
		return (
			<Loi cau="Máy chủ không trả lời. Số của bạn vẫn nằm nguyên — thử lại sau ít phút." />
		);
	if (hinh === "rong") {
		return (
			<Empty className="rounded-lg border">
				<EmptyHeader>
					<EmptyTitle>Bạn chưa phụ trách KR nào trong {KY.ten}</EmptyTitle>
					<EmptyDescription>
						Khi trưởng phòng ban giao KR cho bạn, KR đó và việc cập nhật tuần
						hiện ở đây.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button size="sm" variant="outline">
						Xem OKR của Chăm sóc khách hàng
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<>
			<ViecCanLam />
			<section
				aria-labelledby="muc-tieu-cua-toi"
				className="flex flex-col gap-3"
			>
				<div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
					<h3
						className="font-medium text-base tracking-tight"
						id="muc-tieu-cua-toi"
					>
						Mục tiêu có KR của tôi
					</h3>
					<ChuThichVach />
				</div>
				{MUC_TIEU_CUA_TOI.map((mt) => (
					<KhoiMucTieu danhDauCuaToi key={mt.id} mucTieu={mt} />
				))}
			</section>
		</>
	);
}
