"use client";

import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import { StatGroup } from "@crm/ui/components/dashboard";
import { useGiuNoiDung } from "@crm/ui/components/giu-thay-doi";
import { Icon } from "@crm/ui/components/icon";
import { Progress } from "@crm/ui/components/progress";
import { StatCard } from "@crm/ui/components/stat-card";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetProse,
	DetailSheetSection,
} from "@/components/detail-sheet";
import {
	dinhDangSo,
	tienDo,
	tienDoKyVong,
} from "../lich-su-moi-lan-cap-nhat/tinh";
import { type KrNgan, NGUOI } from "./du-lieu";
import { KhoiCapNhat } from "./khoi-cap-nhat";
import { MucLichSu } from "./lich-su";
import { giaTriMoiNhat, type Nhap, soXemTruoc } from "./tinh";

export type Quyen = "ghi" | "ghi-ho" | "chi-doc";

export type CheDo = "hom-nay" | "trong-ngan";

const CHU = {
	hienTai: "Hiện tại",
	tienDo: "Tiến độ",
	chiTiet: "Chi tiết",
	phuTrach: "Phụ trách",
	han: "Hạn",
	donVi: "Đơn vị",
	viec: "Việc và bằng chứng",
	viecMoTa: "Hai việc đang mở, một việc xong tuần này.",
	capNhat: "Cập nhật",
	truoc: "KR trước",
	ke: "KR kế",
	theoBang: "theo thứ tự bảng",
	chiDoc:
		"Bạn chỉ xem được KR này — người phụ trách và trưởng đơn vị mới cập nhật được.",
} as const;

function tienDoNgan(kr: KrNgan): number {
	if (kr.kieu === "moc") return giaTriMoiNhat(kr) >= 1 ? 100 : 0;
	return tienDo(kr);
}

function OSo({ kr }: { kr: KrNgan }) {
	const hienTai = dinhDangSo(kr, giaTriMoiNhat(kr));
	const phanTram = tienDoNgan(kr);
	return (
		<>
			<DetailSheetSection data-hien-tai={hienTai} data-muc-ngan="so">
				<StatGroup>
					<StatCard
						description={
							kr.kieu === "moc" ? undefined : `Đích ${dinhDangSo(kr, kr.dich)}`
						}
						label={CHU.hienTai}
						value={hienTai}
					/>
					<StatCard
						description={`Kỳ vọng ${tienDoKyVong()}%`}
						label={CHU.tienDo}
						value={`${phanTram}%`}
					/>
				</StatGroup>
			</DetailSheetSection>
			<DetailSheetSection data-muc-ngan="tien-do">
				<Progress
					expected={tienDoKyVong()}
					label={CHU.tienDo}
					value={phanTram}
					variant="neutral"
				/>
			</DetailSheetSection>
		</>
	);
}

export type TrangThaiNgan = {
	cheDo: CheDo;
	quyen: Quyen;
	ds: readonly KrNgan[];
	viTri: number;
	nhap: Nhap;
	moKhoi: boolean;
	loi: boolean;
	tieuDiem: boolean;
	theoBang: boolean;
	lanVuaGui: string | null;
};

export type HanhDongNgan = {
	onDoiViTri: (viTri: number) => void;
	onNhap: (nhap: Nhap) => void;
	onMoKhoi: (mo: boolean) => void;
	onGui: () => void;
	onMoHopCu: () => void;
};

function DauNgan({
	t,
	h,
	hoiGiuNgay,
}: {
	t: TrangThaiNgan;
	h: HanhDongNgan;
	hoiGiuNgay: boolean;
}) {
	const g = useGiuNoiDung();
	const kr = t.ds[t.viTri];
	const doi = (v: number) => {
		const tiep = () => h.onDoiViTri(v);
		if (g?.coThayDoi) g.hoiRoi(tiep);
		else tiep();
	};
	useMountEffect(() => {
		if (hoiGiuNgay) g?.hoiRoi(() => h.onDoiViTri(t.viTri + 1));
	});
	if (!kr) return null;
	return (
		<DetailSheetHeader
			actions={
				<>
					<Button
						aria-label={CHU.truoc}
						disabled={t.viTri === 0}
						onClick={() => doi(t.viTri - 1)}
						size="icon-sm"
						variant="ghost"
					>
						<Icon icon={ChevronLeft} />
					</Button>
					<Button
						aria-label={CHU.ke}
						data-nut="kr-ke"
						disabled={t.viTri === t.ds.length - 1}
						onClick={() => doi(t.viTri + 1)}
						size="icon-sm"
						variant="ghost"
					>
						<Icon icon={ChevronRight} />
					</Button>
					{t.cheDo === "hom-nay" && t.quyen !== "chi-doc" ? (
						<Button data-nut="cap-nhat-ngan-kr" onClick={h.onMoHopCu} size="sm">
							{CHU.capNhat}
						</Button>
					) : null}
				</>
			}
			description={
				<>
					<span translate="no">{kr.mucTieu}</span> · Phụ trách{" "}
					<span translate="no">{kr.chuTen}</span>
				</>
			}
			note={
				<>
					<span
						className="text-muted-foreground tabular-nums"
						data-dem-kr={`${t.viTri + 1}/${t.ds.length}`}
					>
						{t.viTri + 1}/{t.ds.length}
						{t.theoBang ? ` · ${CHU.theoBang}` : null}
					</span>
					{t.quyen === "chi-doc" ? (
						<span className="text-muted-foreground" data-chi-doc>
							{CHU.chiDoc}
						</span>
					) : null}
				</>
			}
			title={<span translate="no">{kr.tieuDe}</span>}
		/>
	);
}

function ThanNgan({ t, h }: { t: TrangThaiNgan; h: HanhDongNgan }) {
	const kr = t.ds[t.viTri];
	if (!kr) return null;
	const coKhoi = t.cheDo === "trong-ngan" && t.quyen !== "chi-doc";
	return (
		<DetailSheetBody>
			<OSo kr={kr} />
			{coKhoi ? (
				<KhoiCapNhat
					ghiHo={t.quyen === "ghi-ho" ? kr.chuTen : null}
					key={kr.id}
					kr={kr}
					loi={t.loi}
					mo={t.moKhoi}
					nhap={t.nhap}
					onGui={h.onGui}
					onMo={h.onMoKhoi}
					onNhap={h.onNhap}
					tieuDiem={t.tieuDiem}
				/>
			) : null}
			<MucLichSu
				kr={kr}
				lanVuaGui={t.lanVuaGui}
				xemTruoc={coKhoi && t.moKhoi ? soXemTruoc(kr, t.nhap) : null}
			/>
			<DetailSheetSection data-muc-ngan="viec" title={CHU.viec}>
				<DetailSheetProse>{CHU.viecMoTa}</DetailSheetProse>
			</DetailSheetSection>
			<DetailSheetSection data-muc-ngan="chi-tiet" title={CHU.chiTiet}>
				<DetailSheetProperties columns={1}>
					<DetailSheetProperty label={CHU.phuTrach}>
						<span translate="no">{kr.chuTen}</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={CHU.donVi}>
						<span translate="no">{NGUOI.donVi}</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={CHU.han}>{kr.han}</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

export function NganKr({
	t,
	h,
	mo,
	onMo,
	hoiGiuNgay,
}: {
	t: TrangThaiNgan;
	h: HanhDongNgan;
	mo: boolean;
	onMo: (mo: boolean) => void;
	hoiGiuNgay: boolean;
}) {
	return (
		<DetailSheet
			data-kr-sheet={t.ds[t.viTri]?.id}
			data-loi-vao={t.theoBang ? "hop-tuan" : "ngan"}
			onOpenChange={onMo}
			open={mo}
			size="md"
		>
			<DauNgan h={h} hoiGiuNgay={hoiGiuNgay} t={t} />
			<ThanNgan h={h} t={t} />
		</DetailSheet>
	);
}
