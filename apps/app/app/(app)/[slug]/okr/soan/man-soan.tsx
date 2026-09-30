"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetRailHeader,
	SheetRailTitle,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import type { Thread } from "@/lib/agent-session";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { BangNhap, ChanDuaVao } from "./bang-nhap";
import { SOAN_UI } from "./cau-hinh";
import { type CuocDangSoan, useCuocSoan, useLuongCuoc } from "./dung-cuoc-soan";
import { useKhoHep } from "./dung-kho-hep";
import { HoiThoaiSoan } from "./hoi-thoai-soan";
import type { CuocSoan, DongSoan } from "./kieu";
import { demDong } from "./luat-ban-nhap";

type LyDoSoan = keyof OkrSoanMessages["lyDo"];

function CanhLuot({ xong }: { xong: () => void }) {
	useMountEffect(() => xong);
	return null;
}

function HenGio({ ms, het }: { ms: number; het: () => void }) {
	useMountEffect(() => {
		const hen = setTimeout(het, ms);
		return () => clearTimeout(hen);
	});
	return null;
}

function CotBanNhap({
	s,
	cuoc,
	m,
	tieuDe,
}: {
	s: CuocDangSoan;
	cuoc: CuocSoan;
	m: OkrSoanMessages;
	tieuDe: boolean;
}) {
	return (
		<section
			aria-label={m.man.banNhap}
			className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
			data-cot="ban-nhap"
		>
			{tieuDe ? (
				<SheetRailHeader>
					<SheetRailTitle>{m.man.banNhap}</SheetRailTitle>
					<Badge variant="outline">
						{m.man.soDong(String(demDong(s.cay)))}
					</Badge>
				</SheetRailHeader>
			) : null}
			<BangNhap s={s} cuoc={cuoc} />
		</section>
	);
}

function Than({
	cuoc,
	dong,
	thread,
	thieuBoiCanh,
	lyDo,
	quanTri,
	hep,
	moCuoc,
}: {
	cuoc: CuocSoan;
	dong: readonly DongSoan[];
	thread: Thread | undefined;
	thieuBoiCanh: boolean;
	lyDo: LyDoSoan | null;
	quanTri: boolean;
	hep: boolean;
	moCuoc: (cuocSoanId: string) => void;
}) {
	const m = okrSoanMessages(useLocale());
	const s = useCuocSoan({ cuoc, dong, thread });
	const hoiThoai = (
		<section
			aria-label={m.hoiThoai.nhan}
			className="flex min-h-0 flex-1 flex-col gap-3"
			data-cot="hoi-thoai"
		>
			<HoiThoaiSoan
				s={s}
				cuoc={cuoc}
				thieuBoiCanh={thieuBoiCanh}
				lyDo={lyDo}
				quanTri={quanTri}
				moCuoc={moCuoc}
			/>
		</section>
	);
	return (
		<>
			{s.busy ? <CanhLuot xong={s.docLai} /> : null}
			{s.busy ? (
				<HenGio
					key={s.soSuKien}
					ms={SOAN_UI.hanKhongSuKienMs}
					het={s.baoHetGio}
				/>
			) : null}
			{hep ? (
				<SheetBody cuonRieng>
					<Tabs defaultValue="tro-chuyen" data-khong="hep">
						<TabsList aria-label={m.man.tabs} className="w-full">
							<TabsTrigger value="tro-chuyen">{m.man.tabTroChuyen}</TabsTrigger>
							<TabsTrigger value="ban-nhap">
								{m.man.tabBanNhap(String(demDong(s.cay)))}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="tro-chuyen" className="flex min-h-0 flex-col">
							{hoiThoai}
						</TabsContent>
						<TabsContent value="ban-nhap" className="flex min-h-0 flex-col">
							<CotBanNhap s={s} cuoc={cuoc} m={m} tieuDe={false} />
						</TabsContent>
					</Tabs>
				</SheetBody>
			) : (
				<SheetBody split cuonRieng data-khong="rong">
					{hoiThoai}
					<CotBanNhap s={s} cuoc={cuoc} m={m} tieuDe />
				</SheetBody>
			)}
			{cuoc.trangThai === "dang" ? (
				<SheetFooter>
					<ChanDuaVao s={s} cuoc={cuoc} />
				</SheetFooter>
			) : null}
		</>
	);
}

function KhongMo({ m, thuLai }: { m: OkrSoanMessages; thuLai: () => void }) {
	return (
		<SheetBody>
			<Alert role="alert" data-man-loi>
				<AlertTitle>{m.man.khongMo}</AlertTitle>
				<AlertDescription>{m.man.khongMoMoTa}</AlertDescription>
				<AlertAction>
					<Button size="sm" variant="outline" onClick={thuLai}>
						{m.man.thuLai}
					</Button>
				</AlertAction>
			</Alert>
		</SheetBody>
	);
}

export function ManSoan({
	cuocSoanId,
	dong,
	quanTri,
	moCuoc,
}: {
	cuocSoanId: string;
	dong: () => void;
	quanTri: boolean;
	moCuoc: (cuocSoanId: string) => void;
}) {
	const m = okrSoanMessages(useLocale());
	const { danhSach, thread } = useLuongCuoc(cuocSoanId);
	const hep = useKhoHep(SOAN_UI.khoHep);
	const du = danhSach.data;
	const dangMo = danhSach.isPending || thread.isLoading;
	return (
		<Sheet
			open
			onOpenChange={(mo) => {
				if (!mo) dong();
			}}
			tuNhanThayDoi={false}
		>
			<SheetContent
				side="right"
				size="assist"
				data-man-soan={du?.cuoc.trangThai ?? (dangMo ? "dang-mo" : "loi")}
			>
				<SheetHeader>
					<SheetTitle size="lg">{m.man.tieuDe}</SheetTitle>
					<SheetDescription>
						{du ? (
							<>
								<span translate="no">{du.cuoc.tenDonVi}</span> ·{" "}
								{du.cuoc.tenChuKy} ·{" "}
								<span className="tabular-nums">
									{m.man.luot(String(du.cuoc.soLuot), String(du.cuoc.tranLuot))}
								</span>
							</>
						) : dangMo ? (
							m.man.dangMo
						) : (
							m.man.khongMo
						)}
					</SheetDescription>
				</SheetHeader>
				{dangMo ? (
					<SheetBody role="status" aria-busy="true" data-man-dang-mo>
						<Spinner />
					</SheetBody>
				) : du ? (
					<Than
						key={du.cuoc.sessionId}
						cuoc={du.cuoc}
						dong={du.dong}
						thread={thread.data}
						thieuBoiCanh={du.thieuBoiCanh}
						lyDo={du.lyDo}
						quanTri={quanTri}
						hep={hep}
						moCuoc={moCuoc}
					/>
				) : (
					<KhongMo m={m} thuLai={() => void danhSach.refetch()} />
				)}
			</SheetContent>
		</Sheet>
	);
}
