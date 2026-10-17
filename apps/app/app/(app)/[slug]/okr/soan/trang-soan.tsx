"use client";

import {
	useChanLienKetTrongHop,
	useKhaiThayDoi,
} from "@crm/ui/components/giu-thay-doi";
import { KaraState } from "@crm/ui/components/kara/state";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useRecordStack } from "@/components/crm/record-sheet/record-stack";
import { DetailSheetHeader } from "@/components/detail-sheet";
import type { Thread } from "@/lib/agent-session";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { useTRPC } from "@/lib/trpc/client";
import { BanNhap } from "./bang-nhap";
import { SOAN_UI } from "./cau-hinh";
import { focusOSoan, sauMotNhip } from "./cuon";
import {
	type NhapCuoc,
	useCuocSoan,
	useLuongCuoc,
	useNhapCuoc,
	usePhienCuoc,
} from "./dung-cuoc-soan";
import { useKhoHep } from "./dung-kho-hep";
import { HoiThoaiSoan } from "./hoi-thoai-soan";
import { KhungSoan, useTabSoan } from "./khung-soan";
import type { CuocSoan, DongSoan } from "./kieu";
import { demDong } from "./luat-ban-nhap";

type LyDoSoan = keyof OkrSoanMessages["lyDo"];

function CanhLuot({ batDau, xong }: { batDau: () => void; xong: () => void }) {
	useMountEffect(() => {
		batDau();
		return xong;
	});
	return null;
}

function HenGio({ ms, het }: { ms: number; het: () => void }) {
	useMountEffect(() => {
		const hen = setTimeout(het, ms);
		return () => clearTimeout(hen);
	});
	return null;
}

function GiuKhiSoan({
	dangSoan,
	m,
}: {
	dangSoan: boolean;
	m: OkrSoanMessages;
}) {
	const loiHoi = useMemo(
		() => ({
			tieuDe: m.trang.hoiDong.tieuDe,
			than: m.trang.hoiDong.than,
			nut: m.trang.hoiDong.nut,
			thoi: m.trang.hoiDong.thoi,
		}),
		[m],
	);
	const khai = useKhaiThayDoi(loiHoi);
	useEffect(() => {
		khai(dangSoan);
		if (!dangSoan) return;
		const hoi = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", hoi);
		return () => window.removeEventListener("beforeunload", hoi);
	}, [khai, dangSoan]);
	return null;
}

function ChanLienKetKhung() {
	const router = useRouter();
	const di = useCallback((href: string) => router.push(href), [router]);
	useChanLienKetTrongHop(di);
	return null;
}

function DauKhungSoan({
	cuoc,
	m,
}: {
	cuoc: CuocSoan | null;
	m: OkrSoanMessages;
}) {
	return (
		<DetailSheetHeader
			title={m.trang.tieuDe}
			description={
				cuoc ? (
					<span data-dau-soan>
						<span translate="no">{cuoc.tenDonVi}</span> · {cuoc.tenChuKy}
					</span>
				) : undefined
			}
		/>
	);
}

function Than({
	cuoc,
	thread,
	nhap,
	napLai,
	thieuBoiCanh,
	lyDo,
	quanTri,
	hep,
	moCuoc,
}: {
	cuoc: CuocSoan;
	thread: Thread | undefined;
	nhap: NhapCuoc;
	napLai: () => void;
	thieuBoiCanh: boolean;
	lyDo: LyDoSoan | null;
	quanTri: boolean;
	hep: boolean;
	moCuoc: (cuocSoanId: string) => void;
}) {
	const m = okrSoanMessages(useLocale());
	const s = useCuocSoan({ cuoc, thread, nhap, napLai });
	const [, datTab] = useTabSoan();
	return (
		<>
			<GiuKhiSoan dangSoan={s.dangTraLoi} m={m} />
			{s.dangTraLoi ? <CanhLuot batDau={s.luotBatDau} xong={s.docLai} /> : null}
			{s.dangTraLoi ? (
				<HenGio key={s.moc} ms={SOAN_UI.hanKhongSuKienMs} het={s.baoHetGio} />
			) : null}
			<KhungSoan
				hep={hep}
				soDong={demDong(s.cay)}
				hoiThoai={
					<HoiThoaiSoan
						s={s}
						cuoc={cuoc}
						thieuBoiCanh={thieuBoiCanh}
						lyDo={lyDo}
						quanTri={quanTri}
						moCuoc={moCuoc}
						moMoc={(moc) => {
							void datTab("ban-nhap");
							s.cuonToiDong(moc.tom.docDuoc ? (moc.tom.dongDoi[0] ?? "") : "");
						}}
					/>
				}
				banNhap={
					<BanNhap
						s={s}
						cuoc={cuoc}
						hoi={(d) => {
							s.datHoiVeDong(d);
							void datTab("tro-chuyen");
							sauMotNhip(focusOSoan);
						}}
						veMoc={() => {
							void datTab("tro-chuyen");
							s.cuonToiMocCuoi();
						}}
					/>
				}
			/>
		</>
	);
}

function ThanCuoc({
	cuoc,
	dong,
	...con
}: {
	cuoc: CuocSoan;
	dong: readonly DongSoan[];
	thieuBoiCanh: boolean;
	lyDo: LyDoSoan | null;
	quanTri: boolean;
	hep: boolean;
	moCuoc: (cuocSoanId: string) => void;
}) {
	const m = okrSoanMessages(useLocale());
	const nhap = useNhapCuoc(dong, cuoc.id);
	const phien = usePhienCuoc(cuoc);
	if (phien.thread.isLoading || phien.choNguoiXem)
		return <KaraState kind="working" label={m.man.dangMo} delayMs={0} />;
	return (
		<Than
			key={phien.khoa}
			cuoc={cuoc}
			thread={phien.thread.data}
			nhap={nhap}
			napLai={phien.napLai}
			{...con}
		/>
	);
}

export function CuocSoanTrongKhung({
	cuocSoanId,
	cauNoi,
}: {
	cuocSoanId: string;
	cauNoi: boolean;
}) {
	const m = okrSoanMessages(useLocale());
	const trpc = useTRPC();
	const access = useQuery(trpc.okr.access.queryOptions());
	const quanTri = access.data?.canManageProgram === true;
	const danhSach = useLuongCuoc(cuocSoanId);
	const hep = useKhoHep(SOAN_UI.khoHep);
	const { thayDinh } = useRecordStack();
	const du = danhSach.data;
	const dangMo = danhSach.isPending;
	return (
		<>
			<ChanLienKetKhung />
			<DauKhungSoan cuoc={du?.cuoc ?? null} m={m} />
			<div
				className="flex min-h-0 flex-1 flex-col"
				data-trang-soan={du?.cuoc.trangThai ?? (dangMo ? "dang-mo" : "loi")}
			>
				{dangMo ? (
					<KaraState kind="working" label={m.man.dangMo} delayMs={0} />
				) : !cauNoi ? (
					<KaraState kind="unconfigured" description={m.trang.chuaCauHinh} />
				) : du ? (
					<ThanCuoc
						key={du.cuoc.id}
						cuoc={du.cuoc}
						dong={du.dong}
						thieuBoiCanh={du.thieuBoiCanh}
						lyDo={du.lyDo}
						quanTri={quanTri}
						hep={hep}
						moCuoc={(id) => thayDinh({ kind: "soan", id })}
					/>
				) : (
					<KaraState
						kind="error"
						what={m.trang.khongMo}
						description={m.trang.khongMoMoTa}
						onRetry={() => void danhSach.refetch()}
					/>
				)}
			</div>
		</>
	);
}
