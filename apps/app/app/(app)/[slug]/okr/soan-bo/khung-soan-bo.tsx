"use client";

import { FieldDescription } from "@crm/ui/components/field";
import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { KaraMark } from "@crm/ui/components/kara";
import { KaraDock, KaraDockBody } from "@crm/ui/components/kara/dock";
import { KaraState } from "@crm/ui/components/kara/state";
import { VatPhamDock } from "@crm/ui/components/kara/vat-pham";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Separator } from "@crm/ui/components/separator";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { DetailSheetHeader } from "@/components/detail-sheet";
import { crmMessages } from "@/lib/messages/crm";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { useKhoHep } from "../soan/dung-kho-hep";
import { BAN_NHAP_DAU, type BanNhap } from "./ban-nhap";
import { SOAN_BO } from "./cau-hinh";
import type { DichDenDong } from "./den-dong";
import { type DenDong, KhoiChatLuong } from "./khoi-chat-luong";
import { usePhuThuocSoan } from "./phu-thuoc";
import {
	type NoiDungCham,
	noiDungCham,
	type SoanTaiLieu,
	TaiLieuBo,
} from "./tai-lieu-bo";
import { type BoSoan, useBoSoan } from "./use-bo-soan";
import { loaiLoiLuu, useLuuDong } from "./use-luu-dong";

type Chu = ReturnType<typeof okrSoanBoMessages>;
type BoXong = Extract<BoSoan, { trang: "xong" }>;

type ChatLuong = { noiDung: NoiDungCham; den: (dich: DichDenDong) => void };

const THE = ["bo", "cot"] as const;
type The = (typeof THE)[number];
const laThe = (v: string): v is The => (THE as readonly string[]).includes(v);

function KhungXuong() {
	return (
		<div className="flex flex-col gap-6" data-cho-tai="">
			{SOAN_BO.dongCho.map((id) => (
				<div key={id} className="flex flex-col gap-3">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-7 w-2/3" />
					<div className="flex flex-col gap-2 border-l pl-4">
						<Skeleton className="h-6 w-1/2" />
						<Skeleton className="h-8 w-64" />
					</div>
				</div>
			))}
		</div>
	);
}

function denDongCua({ noiDung, den }: ChatLuong, truoc: () => void): DenDong {
	return (mucTieu, kr, truong) => {
		const viTri = noiDung.viTri[mucTieu];
		const dong = kr === null ? viTri?.mt : viTri?.kr[kr];
		if (dong === undefined) return;
		truoc();
		den({ dong, truong });
	};
}

function CotBen({
	m,
	cauNoi,
	motMinh,
	chatLuong,
	truocDenDong,
}: {
	m: Chu;
	cauNoi: boolean;
	motMinh: boolean;
	chatLuong: ChatLuong;
	truocDenDong: () => void;
}) {
	return (
		<KaraDock
			side={motMinh ? "fill" : "rail"}
			alone={motMinh}
			aria-label={m.theSoan.cotBen}
			data-o="cot-ben"
		>
			<KaraDockBody>
				<div className="flex flex-col gap-5">
					<KhoiChatLuong
						bo={chatLuong.noiDung.bo}
						denDong={denDongCua(chatLuong, truocDenDong)}
					/>
					<Separator />
					<section className="flex flex-col gap-3" data-khoi="gop-y-kara">
						{cauNoi ? (
							<>
								<KaraMark />
								<p className="text-muted-foreground text-sm">
									{m.gopY.chuaDoc}
								</p>
							</>
						) : (
							<KaraState kind="unconfigured" description={m.gopY.tat} />
						)}
					</section>
				</div>
			</KaraDockBody>
		</KaraDock>
	);
}

function OTaiLieu({
	bo,
	m,
	alone,
	soan,
}: {
	bo: BoXong;
	m: Chu;
	alone: boolean;
	soan: SoanTaiLieu;
}) {
	return (
		<KaraDock
			side="fill"
			alone={alone}
			aria-label={m.theSoan.bo}
			data-o="tai-lieu"
		>
			<VatPhamDock title={<span translate="no">{bo.ten}</span>}>
				<div className="flex flex-col gap-6">
					{bo.quyen.loai === "chi-xem" ? (
						<FieldDescription data-ly-do-chi-xem={bo.quyen.lyDo}>
							{m.chiXem[bo.quyen.lyDo]}
						</FieldDescription>
					) : null}
					<TaiLieuBo bo={bo} soan={soan} />
				</div>
			</VatPhamDock>
		</KaraDock>
	);
}

function HaiThe({
	bo,
	m,
	cauNoi,
	soan,
	chatLuong,
}: {
	bo: BoXong;
	m: Chu;
	cauNoi: boolean;
	soan: SoanTaiLieu;
	chatLuong: ChatLuong;
}) {
	const [the, datThe] = useState<The>("bo");
	return (
		<KaraDock side="fill" alone data-khung="hep">
			<Tabs
				value={the}
				onValueChange={(v) => {
					if (laThe(v)) datThe(v);
				}}
				className="flex min-h-0 flex-1 flex-col gap-0"
			>
				<TabsList
					variant="line"
					className="w-full shrink-0 justify-start border-b px-4"
				>
					<TabsTrigger value="bo">{m.theSoan.bo}</TabsTrigger>
					<TabsTrigger value="cot">{m.theSoan.cotBen}</TabsTrigger>
				</TabsList>
				<TabsContent value="bo" className="flex min-h-0 flex-1 flex-col">
					<OTaiLieu bo={bo} m={m} alone soan={soan} />
				</TabsContent>
				<TabsContent value="cot" className="flex min-h-0 flex-1 flex-col">
					<CotBen
						m={m}
						cauNoi={cauNoi}
						motMinh
						chatLuong={chatLuong}
						truocDenDong={() => flushSync(() => datThe("bo"))}
					/>
				</TabsContent>
			</Tabs>
		</KaraDock>
	);
}

function ThanKhung({
	bo,
	m,
	cauNoi,
	hep,
	soan,
	den,
}: {
	bo: BoSoan;
	m: Chu;
	cauNoi: boolean;
	hep: boolean;
	soan: SoanTaiLieu;
	den: (dich: DichDenDong) => void;
}) {
	const phuThuoc = usePhuThuocSoan();
	if (bo.trang === "dang-tai")
		return (
			<KaraDock side="fill" alone aria-label={m.theSoan.bo} data-o="tai-lieu">
				<KaraDockBody>
					<KhungXuong />
				</KaraDockBody>
			</KaraDock>
		);
	if (bo.trang === "loi")
		return (
			<KaraDock side="fill" alone aria-label={m.theSoan.bo} data-o="tai-lieu">
				<KaraDockBody>
					<VungTaiLoi
						tieuDe={m.taiLoi.tieuDe}
						moTa={m.taiLoi.moTa}
						onThuLai={bo.thuLai}
					/>
				</KaraDockBody>
			</KaraDock>
		);
	if (bo.quyen.loai === "chi-xem")
		return <OTaiLieu bo={bo} m={m} alone soan={soan} />;
	const chatLuong: ChatLuong = {
		noiDung: noiDungCham(bo, soan, phuThuoc.suyKieu),
		den,
	};
	if (hep)
		return (
			<HaiThe bo={bo} m={m} cauNoi={cauNoi} soan={soan} chatLuong={chatLuong} />
		);
	return (
		<div className="flex min-h-0 flex-1" data-khung="rong">
			<OTaiLieu bo={bo} m={m} alone={false} soan={soan} />
			<CotBen
				m={m}
				cauNoi={cauNoi}
				motMinh={false}
				chatLuong={chatLuong}
				truocDenDong={() => {}}
			/>
		</div>
	);
}

function HoiKhiDong({ chuaLuu }: { chuaLuu: boolean }) {
	const m = okrSoanBoMessages(useLocale());
	const loiHoi = useMemo(
		() => ({
			tieuDe: m.hoiDong.tieuDe,
			than: m.hoiDong.than,
			nut: m.hoiDong.bo,
			thoi: m.hoiDong.oLai,
		}),
		[m],
	);
	const khai = useKhaiThayDoi(loiHoi);
	useEffect(() => {
		khai(chuaLuu);
	}, [khai, chuaLuu]);
	return null;
}

export function KhungSoanBo({
	khoaBo,
	cauNoi,
}: {
	khoaBo: string;
	cauNoi: boolean;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	const phuThuoc = usePhuThuocSoan();
	const bo = useBoSoan(khoaBo);
	const hep = useKhoHep(SOAN_BO.truyVanHep);
	const [banNhap, datBanNhap] = useState<BanNhap>(BAN_NHAP_DAU);
	const luuDong = useLuuDong((loi) =>
		loaiLoiLuu(loi) === "so"
			? crmMessages(locale).truongKieu.tuChoi.so
			: m.taiLieu.loiLuu,
	);
	const soan: SoanTaiLieu = { banNhap, datBanNhap, luuDong };
	const hienDau = bo.trang !== "dang-tai" || phuThuoc.tieuDeKhiTai;
	const soanDuoc = bo.trang === "xong" && bo.quyen.loai === "soan";
	const goc = useRef<HTMLDivElement>(null);
	const den = (dich: DichDenDong) => {
		if (goc.current) phuThuoc.oDenDong(goc.current, dich)?.focus();
	};
	return (
		<>
			<HoiKhiDong
				chuaLuu={soanDuoc && phuThuoc.hoiKhiDongChuaLuu && luuDong.coChuaLuu}
			/>
			<DetailSheetHeader
				title={hienDau ? m.dauKhung.tieuDe : null}
				description={
					hienDau && bo.ten ? (
						<span data-ten-bo="" translate="no">
							{bo.ten}
						</span>
					) : undefined
				}
			/>
			<div
				ref={goc}
				className="flex min-h-0 flex-1 flex-col"
				data-khung-soan-bo={bo.trang}
			>
				<ThanKhung
					bo={bo}
					m={m}
					cauNoi={cauNoi}
					hep={hep}
					soan={soan}
					den={den}
				/>
			</div>
		</>
	);
}
