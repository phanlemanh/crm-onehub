"use client";

import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import { StatGroup } from "@crm/ui/components/dashboard";
import { Icon } from "@crm/ui/components/icon";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { Progress } from "@crm/ui/components/progress";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useState } from "react";
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
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	DS_KR,
	KR_CUNG_NGAY,
	KR_DAI,
	KR_MOC,
	KR_RONG,
	KR_TANG_TOI,
	type KrMau,
	KY,
} from "./du-lieu";
import { LichSuMoiLan, LichSuTheoTuan } from "./lich-su";
import { dinhDangSo, lanGuiThu, moiNhat, tienDo, tienDoKyVong } from "./tinh";

const ST = {
	nhieuLan: "ST-lsk-nhieu-lan",
	cungNgay: "ST-lsk-cung-ngay",
	moc: "ST-lsk-moc",
	rong: "ST-lsk-rong",
	dangTai: "ST-lsk-dang-tai",
	loi: "ST-lsk-loi",
	dai: "ST-lsk-dai",
	homNay: "ST-lsk-hom-nay",
} as const;

const KR_THEO_STATE: Record<string, KrMau> = {
	[ST.cungNgay]: KR_CUNG_NGAY,
	[ST.moc]: KR_MOC,
	[ST.rong]: KR_RONG,
	[ST.dai]: KR_DAI,
};

type Tai = "xong" | "dang-tai" | "loi";

const CHU = {
	lichSu: "Lịch sử cập nhật",
	loi: "Không tải được diễn biến của KR này.",
	loiMoTa: "Máy chủ không trả lời trong 10 giây. Các mục khác vẫn dùng được.",
	hienTai: "Hiện tại",
	tienDo: "Tiến độ",
	chiTiet: "Chi tiết",
	phuTrach: "Phụ trách",
	han: "Hạn",
	viec: "Việc và bằng chứng",
	viecMoTa: "Hai việc đang mở, một việc xong tuần này.",
} as const;

function taiBanDau(state: string): Tai {
	if (state === ST.dangTai) return "dang-tai";
	if (state === ST.loi) return "loi";
	return "xong";
}

function OSo({ kr }: { kr: KrMau }) {
	const moi = moiNhat(kr);
	const hienTai =
		kr.kieu === "moc"
			? "Chưa xong"
			: moi?.giaTri == null
				? "—"
				: dinhDangSo(kr, moi.giaTri);
	return (
		<>
			<DetailSheetSection data-muc-ngan="so">
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
						value={`${tienDo(kr)}%`}
					/>
				</StatGroup>
			</DetailSheetSection>
			<DetailSheetSection data-muc-ngan="tien-do">
				<Progress
					expected={tienDoKyVong()}
					label={CHU.tienDo}
					value={tienDo(kr)}
					variant="neutral"
				/>
			</DetailSheetSection>
		</>
	);
}

function MucLichSu({
	kr,
	tai,
	homNay,
	onThuLai,
}: {
	kr: KrMau;
	tai: Tai;
	homNay: boolean;
	onThuLai: () => void;
}) {
	return (
		<DetailSheetSection data-muc-ngan="lich-su" title={CHU.lichSu}>
			{tai === "dang-tai" ? (
				<Skeleton className="h-40 w-full" />
			) : tai === "loi" ? (
				<VungTaiLoi moTa={CHU.loiMoTa} onThuLai={onThuLai} tieuDe={CHU.loi} />
			) : homNay ? (
				<LichSuTheoTuan kr={kr} />
			) : (
				<LichSuMoiLan kr={kr} />
			)}
		</DetailSheetSection>
	);
}

function HanhDong({
	viTri,
	onDoi,
	onCapNhat,
}: {
	viTri: number;
	onDoi: (viTri: number) => void;
	onCapNhat: () => void;
}) {
	return (
		<>
			<Button
				aria-label="KR trước"
				disabled={viTri === 0}
				onClick={() => onDoi(viTri - 1)}
				size="icon-sm"
				variant="ghost"
			>
				<Icon icon={ChevronLeft} />
			</Button>
			<Button
				aria-label="KR kế"
				disabled={viTri === DS_KR.length - 1}
				onClick={() => onDoi(viTri + 1)}
				size="icon-sm"
				variant="ghost"
			>
				<Icon icon={ChevronRight} />
			</Button>
			<Button data-nut="cap-nhat-ngan-kr" onClick={onCapNhat} size="sm">
				Cập nhật
			</Button>
		</>
	);
}

function NoiDung({ state }: { state: string }) {
	const homNay = state === ST.homNay;
	const [ds, setDs] = useState<readonly KrMau[]>(DS_KR);
	const [viTri, setViTri] = useState(() =>
		DS_KR.indexOf(KR_THEO_STATE[state] ?? KR_TANG_TOI),
	);
	const [tai, setTai] = useState<Tai>(() => taiBanDau(state));
	const [mo, setMo] = useState(true);
	const [soLanThu, setSoLanThu] = useState(0);
	const kr = ds[viTri] ?? KR_TANG_TOI;

	const guiThu = () => {
		const lan = lanGuiThu(kr, soLanThu);
		setDs((cu) =>
			cu.map((k) => (k.id === kr.id ? { ...k, lan: [...k.lan, lan] } : k)),
		);
		setSoLanThu((n) => n + 1);
	};

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Mục tiêu</PageShellTitle>
					<PageShellDescription>
						{homNay
							? "Hôm nay — Lịch sử gom theo tuần, để so với đề xuất."
							: `Mục tiêu và KR của Phòng Kinh doanh phía Nam, ${KY.ten}.`}
					</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Button onClick={() => setMo(true)} size="sm" variant="outline">
						Mở chi tiết KR
					</Button>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<DetailSheetProse>
					Bấm «Cập nhật» trong ngăn để gửi thử một lần mới: Lịch sử thêm một
					dòng ở đầu và biểu đồ thêm một điểm.
				</DetailSheetProse>
			</PageShellContent>
			<DetailSheet
				data-kr-sheet={kr.id}
				data-kieu-kr={kr.kieu}
				onOpenChange={setMo}
				open={mo}
			>
				<DetailSheetHeader
					actions={
						<HanhDong
							onCapNhat={guiThu}
							onDoi={(v) => {
								setViTri(v);
								setTai("xong");
							}}
							viTri={viTri}
						/>
					}
					description={
						<>
							<span translate="no">{kr.mucTieu}</span> · Phụ trách{" "}
							<span translate="no">{kr.chuTen}</span>
						</>
					}
					title={<span translate="no">{kr.tieuDe}</span>}
				/>
				<DetailSheetBody>
					<OSo kr={kr} />
					<MucLichSu
						homNay={homNay}
						kr={kr}
						onThuLai={() => setTai("xong")}
						tai={tai}
					/>
					<DetailSheetSection data-muc-ngan="viec" title={CHU.viec}>
						<DetailSheetProse>{CHU.viecMoTa}</DetailSheetProse>
					</DetailSheetSection>
					<DetailSheetSection data-muc-ngan="chi-tiet" title={CHU.chiTiet}>
						<DetailSheetProperties columns={1}>
							<DetailSheetProperty label={CHU.phuTrach}>
								<span translate="no">{kr.chuTen}</span>
							</DetailSheetProperty>
							<DetailSheetProperty label={CHU.han}>
								{kr.han}
							</DetailSheetProperty>
						</DetailSheetProperties>
					</DetailSheetSection>
				</DetailSheetBody>
			</DetailSheet>
		</PageShell>
	);
}

export function LichSuMoiLanCapNhatMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<NoiDung key={state} state={state} />
		</LocaleProvider>
	);
}
