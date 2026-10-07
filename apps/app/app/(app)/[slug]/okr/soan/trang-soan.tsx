"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { KaraState } from "@crm/ui/components/kara/state";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import type { Thread } from "@/lib/agent-session";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { useTRPC } from "@/lib/trpc/client";
import { BangNhap, ChanDuaVao } from "./bang-nhap";
import { SOAN_UI } from "./cau-hinh";
import {
	donViCua,
	type NhapCuoc,
	useCuocSoan,
	useLuongCuoc,
	useNhapCuoc,
	usePhienCuoc,
} from "./dung-cuoc-soan";
import { useKhoHep } from "./dung-kho-hep";
import { HoiThoaiSoan } from "./hoi-thoai-soan";
import { KhungSoan } from "./khung-soan";
import type { CuocSoan, DongSoan } from "./kieu";
import { demDong, duongTheoDonVi, duongTrangSoan } from "./luat-ban-nhap";

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

function DauTrangSoan({
	cuoc,
	m,
}: {
	cuoc: CuocSoan | null;
	m: OkrSoanMessages;
}) {
	const { slug } = useParams<{ slug: string }>();
	const ve = cuoc
		? duongTheoDonVi(slug, donViCua(cuoc))
		: `/${slug}/okr/theo-don-vi`;
	return (
		<PageShellHeader
			breadcrumb={
				<div>
					<Button asChild size="sm" variant="ghost">
						<Link href={ve} data-nut="ve-theo-don-vi">
							<Icon icon={ArrowLeft} />
							{m.trang.veTheoDonVi}
						</Link>
					</Button>
				</div>
			}
		>
			<PageShellHeading>
				<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
				{cuoc ? (
					<PageShellDescription data-dau-soan>
						<span translate="no">{cuoc.tenDonVi}</span> · {cuoc.tenChuKy} ·{" "}
						<span className="tabular-nums">
							{m.man.luot(String(cuoc.soLuot), String(cuoc.tranLuot))}
						</span>
					</PageShellDescription>
				) : null}
			</PageShellHeading>
		</PageShellHeader>
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
	return (
		<>
			{s.dangTraLoi ? <CanhLuot batDau={s.luotBatDau} xong={s.docLai} /> : null}
			{s.dangTraLoi ? (
				<HenGio key={s.moc} ms={SOAN_UI.hanKhongSuKienMs} het={s.baoHetGio} />
			) : null}
			<KhungSoan
				hep={hep}
				soDong={demDong(s.cay)}
				hoiThoai={
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
				}
				banNhap={
					<section
						aria-label={m.man.banNhap}
						className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
						data-cot="ban-nhap"
					>
						<BangNhap s={s} cuoc={cuoc} />
						{cuoc.trangThai === "dang" ? (
							<ChanDuaVao s={s} cuoc={cuoc} />
						) : null}
					</section>
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
	if (phien.thread.isLoading)
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

export function TrangSoan({
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
	const router = useRouter();
	const { slug } = useParams<{ slug: string }>();
	const du = danhSach.data;
	const dangMo = danhSach.isPending;
	return (
		<div
			className="flex min-h-0 flex-1 flex-col gap-4"
			data-trang-soan={du?.cuoc.trangThai ?? (dangMo ? "dang-mo" : "loi")}
		>
			<DauTrangSoan cuoc={du?.cuoc ?? null} m={m} />
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
					moCuoc={(id) => router.push(duongTrangSoan(slug, id))}
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
	);
}
