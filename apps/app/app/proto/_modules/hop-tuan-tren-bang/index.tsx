"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
} from "@crm/ui/components/area-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import { Button } from "@crm/ui/components/button";
import { StatGroup } from "@crm/ui/components/dashboard";
import { Icon } from "@crm/ui/components/icon";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { StatCard } from "@crm/ui/components/stat-card";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { type ReactNode, useState } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { BangHop } from "./bang";
import {
	BO_OKR,
	CON_LAI,
	DANG_BAN,
	HOP,
	type KrHop,
	type LanCapNhat,
} from "./du-lieu";
import { BangHomNay } from "./hom-nay";
import { HopCapNhatKr } from "./hop";
import { NganKrHop, type ViTriNgan } from "./ngan";
import { daCapNhatTuan, themLan } from "./tinh";

const ST = {
	bang: "ST-ht2-bang",
	conLai: "ST-ht2-con-lai",
	hopCapNhat: "ST-ht2-hop-cap-nhat",
	nganKr: "ST-ht2-ngan-kr",
	homNay: "ST-ht2-hom-nay",
} as const;

const THU_TU = "theo thứ tự bảng";

const THU_TU_HOM_NAY = "trong cùng mục tiêu";

type MoNen =
	| { loai: "bang" }
	| { loai: "ngan"; viTri: number }
	| { loai: "ngan-hom-nay"; krId: string };

type Mo = MoNen | { loai: "hop"; krId: string; ve: MoNen };

type BoKr = { dangBan: KrHop[]; conLai: KrHop[] };

const BANG: MoNen = { loai: "bang" };

function moBanDau(state: string): Mo {
	if (state === ST.hopCapNhat) {
		const kr = DANG_BAN[HOP.dongMoSan] ?? DANG_BAN[0];
		return { loai: "hop", krId: kr?.id ?? "", ve: BANG };
	}
	if (state === ST.nganKr) {
		return { loai: "ngan", viTri: HOP.viTriNganMoSan };
	}
	return BANG;
}

function ThanhBen() {
	return (
		<AreaSidebar
			header={
				<Button className="justify-between" size="sm" variant="outline">
					{BO_OKR.chuKy}
					<Icon icon={ChevronDown} data-icon="inline-end" />
				</Button>
			}
			label="Mục tiêu"
		>
			<AreaSidebarGroup>
				<AreaSidebarItem>Của tôi</AreaSidebarItem>
			</AreaSidebarGroup>
			<AreaSidebarGroup label="OKR">
				<AreaSidebarItem active>Bộ OKR</AreaSidebarItem>
				<AreaSidebarItem disabled>Lấy ý kiến</AreaSidebarItem>
			</AreaSidebarGroup>
		</AreaSidebar>
	);
}

function HangSo({ bo }: { bo: BoKr }) {
	const tong = [...bo.dangBan, ...bo.conLai];
	const thap = tong.filter((kr) => kr.lan[0].tuTin === "thap").length;
	return (
		<StatGroup data-hang-so-hop="">
			<StatCard
				description={`Tuần ${BO_OKR.tuan}`}
				label="Đã cập nhật"
				value={`${daCapNhatTuan(tong)}/${tong.length}`}
			/>
			<StatCard
				description="KR cần bàn tuần này"
				label="Đáng bàn"
				value={String(bo.dangBan.length)}
			/>
			<StatCard
				description="theo lần cập nhật mới nhất"
				label="Tự tin thấp"
				value={String(thap)}
			/>
			<StatCard
				description={`Kết thúc ${BO_OKR.ketThuc}`}
				label="Ngày còn lại"
				value={BO_OKR.ngayConLai}
			/>
		</StatGroup>
	);
}

function Khung({
	moTa,
	bo,
	children,
}: {
	moTa: string;
	bo: BoKr;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-0 flex-col gap-4 md:flex-row">
			<ThanhBen />
			<div className="min-w-0 flex-1">
				<PageShell>
					<PageShellHeader>
						<PageShellHeading>
							<PageShellTitle>Mục tiêu</PageShellTitle>
							<PageShellDescription>{moTa}</PageShellDescription>
						</PageShellHeading>
					</PageShellHeader>
					<PageShellContent>
						<div className="flex flex-col gap-6">
							<div className="flex flex-col gap-3 pb-1">
								<Breadcrumb>
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink href="#">Bộ OKR</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											<BreadcrumbPage translate="no">
												{BO_OKR.donVi}
											</BreadcrumbPage>
										</BreadcrumbItem>
									</BreadcrumbList>
								</Breadcrumb>
								<Tabs value="hop-tuan">
									<TabsList aria-label="Phần của bộ OKR" variant="line">
										<TabsTrigger value="okr">OKR</TabsTrigger>
										<TabsTrigger aria-current="page" value="hop-tuan">
											Họp tuần
										</TabsTrigger>
										<TabsTrigger value="viec">Việc</TabsTrigger>
										<TabsTrigger value="so-do">Sơ đồ</TabsTrigger>
										<TabsTrigger value="cham-diem">Chấm điểm</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>
							<HangSo bo={bo} />
							{children}
						</div>
					</PageShellContent>
				</PageShell>
			</div>
		</div>
	);
}

function NganTheoMo({
	mo,
	bo,
	setMo,
}: {
	mo: MoNen;
	bo: BoKr;
	setMo: (mo: Mo) => void;
}) {
	if (mo.loai === "bang") return null;
	if (mo.loai === "ngan") {
		const ds = [...bo.dangBan, ...bo.conLai];
		const kr = ds[mo.viTri];
		if (!kr) return null;
		const viTri: ViTriNgan = {
			viTri: mo.viTri,
			tong: ds.length,
			thuTu: THU_TU,
		};
		return (
			<NganKrHop
				coMucDoi
				kr={kr}
				onCapNhat={() => setMo({ loai: "hop", krId: kr.id, ve: mo })}
				onDoiViTri={(v) => setMo({ ...mo, viTri: v })}
				onDong={() => setMo(BANG)}
				viTri={viTri}
			/>
		);
	}
	const tatCa = [...bo.dangBan, ...bo.conLai];
	const kr = tatCa.find((k) => k.id === mo.krId);
	if (!kr) return null;
	const cung = tatCa.filter((k) => k.mucTieuId === kr.mucTieuId);
	return (
		<NganKrHop
			coMucDoi={false}
			kr={kr}
			onCapNhat={() => setMo({ loai: "hop", krId: kr.id, ve: mo })}
			onDoiViTri={(v) =>
				setMo({ loai: "ngan-hom-nay", krId: cung[v]?.id ?? kr.id })
			}
			onDong={() => setMo(BANG)}
			viTri={{
				viTri: cung.indexOf(kr),
				tong: cung.length,
				thuTu: THU_TU_HOM_NAY,
			}}
		/>
	);
}

function NoiDung({ state }: { state: string }) {
	const homNay = state === ST.homNay;
	const [bo, setBo] = useState<BoKr>({ dangBan: DANG_BAN, conLai: CON_LAI });
	const [mo, setMo] = useState<Mo>(() => moBanDau(state));
	const [moConLai, setMoConLai] = useState(state === ST.conLai);
	const nen = mo.loai === "hop" ? mo.ve : mo;

	const gui = (krId: string, ve: MoNen, lan: LanCapNhat) => {
		setBo((cu) => ({
			dangBan: themLan(cu.dangBan, krId, lan),
			conLai: themLan(cu.conLai, krId, lan),
		}));
		setMo(ve);
	};

	const hopKr =
		mo.loai === "hop"
			? [...bo.dangBan, ...bo.conLai].find((k) => k.id === mo.krId)
			: undefined;

	return (
		<Khung
			bo={bo}
			moTa={
				homNay
					? "Hôm nay — bảng Họp tuần đang chạy, để so với đề xuất."
					: "Mục tiêu và KR của đơn vị trong chu kỳ đang xem."
			}
		>
			{homNay ? (
				<BangHomNay
					conLai={bo.conLai}
					dangBan={bo.dangBan}
					onMoKr={(krId) => setMo({ loai: "ngan-hom-nay", krId })}
				/>
			) : (
				<BangHop
					conLai={bo.conLai}
					dangBan={bo.dangBan}
					hanhDong={{
						onMoKr: (phan, viTri) =>
							setMo({
								loai: "ngan",
								viTri: phan === "dang-ban" ? viTri : bo.dangBan.length + viTri,
							}),
						onCapNhat: (krId) => setMo({ loai: "hop", krId, ve: BANG }),
					}}
					moConLai={moConLai}
					onDoiConLai={setMoConLai}
				/>
			)}
			<NganTheoMo bo={bo} mo={nen} setMo={setMo} />
			{mo.loai === "hop" && hopKr ? (
				<HopCapNhatKr
					key={hopKr.id}
					kr={hopKr}
					onDong={() => setMo(mo.ve)}
					onGui={(lan) => gui(hopKr.id, mo.ve, lan)}
				/>
			) : null}
		</Khung>
	);
}

export function HopTuanTrenBangMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<NoiDung key={state} state={state} />
		</LocaleProvider>
	);
}
