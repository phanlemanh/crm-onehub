"use client";

import { FieldDescription } from "@crm/ui/components/field";
import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import {
	KaraDock,
	KaraDockBody,
	KaraDockFooter,
} from "@crm/ui/components/kara/dock";
import { VatPhamDock } from "@crm/ui/components/kara/vat-pham";
import { useLocale } from "@crm/ui/components/locale-provider";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { Separator } from "@crm/ui/components/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRecordStack } from "@/components/crm/record-sheet/record-stack";
import { DetailSheetHeader } from "@/components/detail-sheet";
import { crmMessages } from "@/lib/messages/crm";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import type { LoiDiKr } from "../nhom-kara";
import { useKhoHep } from "../soan/dung-kho-hep";
import { BAN_NHAP_DAU, type BanNhap, boChuDaGo, themKr } from "./ban-nhap";
import { SOAN_BO } from "./cau-hinh";
import { CongBo } from "./cong-bo";
import type { DichDenDong } from "./den-dong";
import { type DenDong, KhoiChatLuong } from "./khoi-chat-luong";
import { KhoiGopY } from "./khoi-gop-y";
import { usePhuThuocSoan } from "./phu-thuoc";
import {
	mucCongBoCua,
	type NoiDungCham,
	noiDungCham,
	type SoanTaiLieu,
	TaiLieuBo,
} from "./tai-lieu-bo";
import { type DocLaiKara, ghiTheoKara, type TheoKara } from "./theo-kara";
import { type BoSoan, type MucTieuSoan, useBoSoan } from "./use-bo-soan";
import { loaiLoiLuu, useLuuDong } from "./use-luu-dong";

type Chu = ReturnType<typeof okrSoanBoMessages>;
type BoXong = Extract<BoSoan, { trang: "xong" }>;

type ChatLuong = { noiDung: NoiDungCham; den: (dich: DichDenDong) => void };

type GopYCot = {
	mucTieu: MucTieuSoan[];
	docLai: DocLaiKara;
	moKr: (objectiveId: string, di: LoiDiKr) => void;
};

const THE = ["bo", "cot"] as const;
type The = (typeof THE)[number];
const laThe = (v: string): v is The => (THE as readonly string[]).includes(v);

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
	gopY,
	truocDenDong,
}: {
	m: Chu;
	cauNoi: boolean;
	motMinh: boolean;
	chatLuong: ChatLuong;
	gopY: GopYCot;
	truocDenDong: () => void;
}) {
	const phuThuoc = usePhuThuocSoan();
	return (
		<KhoiGopY
			mucTieu={gopY.mucTieu}
			cauNoi={cauNoi}
			docLai={gopY.docLai}
			moKr={(id, di) => {
				truocDenDong();
				gopY.moKr(id, di);
			}}
		>
			{({ khoi, nut, karaTat }) => (
				<KaraDock
					side={motMinh ? "fill" : "rail"}
					alone={motMinh}
					aria-label={m.theSoan.cotBen}
					data-o="cot-ben"
				>
					<KaraDockBody>
						<div className="flex flex-col gap-5">
							{karaTat && phuThuoc.chatLuongKhiKaraTat === "an" ? null : (
								<>
									<KhoiChatLuong
										bo={chatLuong.noiDung.bo}
										denDong={denDongCua(chatLuong, truocDenDong)}
									/>
									<Separator />
								</>
							)}
							{khoi}
						</div>
					</KaraDockBody>
					{nut ? <KaraDockFooter divided>{nut}</KaraDockFooter> : null}
				</KaraDock>
			)}
		</KhoiGopY>
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
	const { close } = useRecordStack();
	return (
		<KaraDock
			side="fill"
			alone={alone}
			aria-label={m.theSoan.bo}
			data-o="tai-lieu"
		>
			<VatPhamDock
				title={<span translate="no">{bo.ten}</span>}
				footer={
					bo.quyen.loai === "soan" ? (
						<CongBo mucTieu={mucCongBoCua(bo, soan)} veTheoDoi={close} />
					) : undefined
				}
			>
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
	gopY,
}: {
	bo: BoXong;
	m: Chu;
	cauNoi: boolean;
	soan: SoanTaiLieu;
	chatLuong: ChatLuong;
	gopY: GopYCot;
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
				<TabsContent
					value="cot"
					forceMount
					className="flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
				>
					<CotBen
						m={m}
						cauNoi={cauNoi}
						motMinh
						chatLuong={chatLuong}
						gopY={gopY}
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
	gopY,
}: {
	bo: BoSoan;
	m: Chu;
	cauNoi: boolean;
	hep: boolean;
	soan: SoanTaiLieu;
	den: (dich: DichDenDong) => void;
	gopY: Omit<GopYCot, "mucTieu">;
}) {
	const phuThuoc = usePhuThuocSoan();
	if (bo.trang === "dang-tai")
		return (
			<KaraDock side="fill" alone aria-label={m.theSoan.bo} data-o="tai-lieu">
				<KaraDockBody>
					<KhungXuong hinh="danh-sach" />
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
	const gopYCot: GopYCot = { ...gopY, mucTieu: bo.mucTieu };
	if (hep)
		return (
			<HaiThe
				bo={bo}
				m={m}
				cauNoi={cauNoi}
				soan={soan}
				chatLuong={chatLuong}
				gopY={gopYCot}
			/>
		);
	return (
		<div className="flex min-h-0 flex-1" data-khung="rong">
			<OTaiLieu bo={bo} m={m} alone={false} soan={soan} />
			<CotBen
				m={m}
				cauNoi={cauNoi}
				motMinh={false}
				chatLuong={chatLuong}
				gopY={gopYCot}
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
	const [theoKara, datTheoKara] = useState<TheoKara>({});
	const luuDong = useLuuDong((loi) =>
		loaiLoiLuu(loi) === "so"
			? crmMessages(locale).truongKieu.tuChoi.so
			: m.taiLieu.loiLuu,
	);
	const soan: SoanTaiLieu = {
		banNhap,
		datBanNhap,
		luuDong,
		theoKara,
		cauNoi,
	};
	const hienDau = bo.trang !== "dang-tai" || phuThuoc.tieuDeKhiTai;
	const soanDuoc = bo.trang === "xong" && bo.quyen.loai === "soan";
	const goc = useRef<HTMLDivElement>(null);
	const den = (dich: DichDenDong) => {
		if (goc.current) phuThuoc.oDenDong(goc.current, dich)?.focus();
	};
	const docLai: DocLaiKara = (id, chu) => {
		datTheoKara((cu) => ghiTheoKara(cu, id, chu));
		datBanNhap((bn) => boChuDaGo(bn, id, chu.truong));
	};
	const moKr = (objectiveId: string, di: LoiDiKr) => {
		const nhap =
			bo.trang === "xong" &&
			bo.mucTieu.some((mt) => mt.id === objectiveId && mt.status === "nhap");
		if (di.loai === "kr-moi" && nhap) {
			datBanNhap((bn) => themKr(bn, objectiveId));
			return;
		}
		den(
			di.loai === "sua-kr"
				? { dong: `[data-dong-kr="${di.keyResultId}"]`, truong: "title" }
				: { dong: `[data-dong-mt="${objectiveId}"]`, truong: "title" },
		);
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
					gopY={{ docLai, moKr }}
				/>
			</div>
		</>
	);
}
