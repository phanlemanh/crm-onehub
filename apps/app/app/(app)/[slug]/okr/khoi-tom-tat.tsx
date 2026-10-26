"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Renew from "@carbon/icons-react/es/Renew";
import {
	InlineCitation,
	InlineCitationCard,
	InlineCitationCardBody,
	InlineCitationCardTrigger,
	InlineCitationCarousel,
	InlineCitationCarouselContent,
	InlineCitationCarouselHeader,
	InlineCitationCarouselIndex,
	InlineCitationCarouselItem,
	InlineCitationCarouselNext,
	InlineCitationCarouselPrev,
	InlineCitationQuote,
	InlineCitationSource,
	InlineCitationText,
} from "@crm/ui/components/ai-elements/inline-citation";
import { AiFeedback } from "@crm/ui/components/ai-feedback";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { KaraState } from "@crm/ui/components/kara/state";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Skeleton } from "@crm/ui/components/skeleton";
import { OKR_TOM_TAT } from "@crm/validation/okr-tom-tat";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import { useMoDienBien } from "@/components/crm/record-sheet/dien-bien-kr";
import {
	type OkrToanCanhMessages,
	okrToanCanhMessages,
} from "@/lib/messages/okr-toan-canh";
import { homNayVn, ngayThangVn, OKR_CHU_KY } from "@/lib/okr-chu-ky-nhan";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { hienSo } from "./hop-thoai-kr";

type TomTat = RouterOutputs["okr"]["troLyTomTat"];
type BanTomTat = NonNullable<TomTat["ban"]>;
type CauHien = BanTomTat["cau"][number];
type NguonHien = CauHien["nguon"][number];
type ChoBan = NonNullable<TomTat["choBan"]>;

const PHAN_HOI = { huuIch: "huu-ich", khongHuuIch: "khong-huu-ich" } as const;

const TRAN_HEN_GIO_MS = 2_147_483_647;

const SO_THU = 7;

function ngayNgan(ngay: string): string {
	return `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
}

function ngayDu(ngay: string): string {
	return `${ngayNgan(ngay)}/${ngay.slice(0, 4)}`;
}

function nhipHoiLai(batDau: number, capNhatLuc: number): number | false {
	return capNhatLuc - batDau < OKR_TOM_TAT.tranChoMs
		? OKR_TOM_TAT.hoiLaiMs
		: false;
}

function henToiLuc(luc: string): number | false {
	const con = Date.parse(luc) - Date.now();
	return con > 0 && con <= TRAN_HEN_GIO_MS ? con : false;
}

function thuVn(luc: Date): number {
	const thu = new Date(`${homNayVn(luc)}T00:00:00Z`).getUTCDay();
	return ((thu + SO_THU - 1) % SO_THU) + 1;
}

function gioVn(luc: Date): string {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: OKR_CHU_KY.muiGio,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).format(luc);
}

function chuToiLuc(luc: string, m: OkrToanCanhMessages["tomTat"]): string {
	const d = new Date(luc);
	const thu = thuVn(d);
	const thuTruoc = ((thu + SO_THU - 2) % SO_THU) + 1;
	return m.choBanDau(
		gioVn(d),
		m.tenThu[thu - 1] ?? "",
		ngayThangVn(d),
		m.tenThu[thuTruoc - 1] ?? "",
	);
}

function DongCho({ cho }: { cho: ChoBan }) {
	const m = okrToanCanhMessages(useLocale()).tomTat;
	if (cho.kieu === "tam-dung")
		return (
			<CardContent data-trang-thai="ST-tomtat-tam-dung">
				<KaraState
					kind="off"
					reason={
						cho.lyDo === "het-tran-thang" && cho.moLai !== null
							? m.tamNghiDen(ngayNgan(cho.moLai))
							: m.chuaNoiMoHinh
					}
				/>
			</CardContent>
		);
	if (cho.kieu === "dang-xep")
		return (
			<CardContent data-trang-thai="ST-tomtat-dang-xep">
				<p className="text-muted-foreground text-sm" data-cho-ban>
					{m.dangXep}
				</p>
			</CardContent>
		);
	return (
		<CardContent data-trang-thai="ST-tomtat-cho-ban-dau">
			<p className="text-muted-foreground text-sm" data-cho-ban>
				{chuToiLuc(cho.luc, m)}
			</p>
		</CardContent>
	);
}

function TheNguon({ n }: { n: NguonHien }) {
	const locale = useLocale();
	const m = okrToanCanhMessages(locale).tomTat;
	const moDienBien = useMoDienBien();
	return (
		<div className="flex flex-col gap-3" data-nguon={n.id}>
			<InlineCitationSource
				description={n.mucTieuTen}
				title={n.krTen}
				translate="no"
			/>
			<dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-sm">
				<dt className="text-muted-foreground">{m.capNhat}</dt>
				<dd className="tabular-nums" data-ngay>
					{ngayDu(n.ngay)}
				</dd>
				<dt className="text-muted-foreground">{m.giaTri}</dt>
				<dd className="tabular-nums" data-gia-tri translate="no">
					{hienSo(n.giaTri, locale)} {n.donVi}
				</dd>
				<dt className="text-muted-foreground">{m.tuTin}</dt>
				<dd>
					<ConfidenceIndicator level={n.tuTin} size="sm" />
				</dd>
			</dl>
			{n.ghiChu ? (
				<figure className="flex flex-col gap-1">
					<figcaption className="text-muted-foreground text-sm">
						{m.ghiChu}
					</figcaption>
					<InlineCitationQuote data-ghi-chu translate="no">
						{n.ghiChu}
					</InlineCitationQuote>
				</figure>
			) : null}
			<Button
				className="self-start"
				data-xem-dien-bien={n.keyResultId}
				onClick={() => moDienBien(n.mucTieuId, n.keyResultId)}
				size="xs"
				variant="ghost"
			>
				{m.xemDienBien}
				<Icon icon={ArrowRight} data-icon="inline-end" />
			</Button>
		</div>
	);
}

function TrichDan({ cau, thuTu }: { cau: CauHien; thuTu: number }) {
	const m = okrToanCanhMessages(useLocale()).tomTat;
	const moiNhat = cau.nguon.reduce<NguonHien | null>(
		(tot, n) => (tot === null || n.ngay > tot.ngay ? n : tot),
		null,
	);
	if (moiNhat === null) return null;
	const ngay = ngayNgan(moiNhat.ngay);
	const nhan =
		cau.nguon.length > 1
			? m.nhanTrichDanThem(ngay, String(cau.nguon.length - 1))
			: m.nhanTrichDan(ngay);
	return (
		<InlineCitationCard>
			<InlineCitationCardTrigger data-trich-dan={thuTu} nhan={nhan} />
			<InlineCitationCardBody
				align="start"
				collisionPadding={16}
				data-the-trich-dan={thuTu}
			>
				<InlineCitationCarousel>
					{cau.nguon.length > 1 ? (
						<InlineCitationCarouselHeader>
							<InlineCitationCarouselPrev />
							<InlineCitationCarouselNext />
							<InlineCitationCarouselIndex data-chi-so />
						</InlineCitationCarouselHeader>
					) : null}
					<InlineCitationCarouselContent>
						{cau.nguon.map((n) => (
							<InlineCitationCarouselItem key={n.id}>
								<TheNguon n={n} />
							</InlineCitationCarouselItem>
						))}
					</InlineCitationCarouselContent>
				</InlineCitationCarousel>
			</InlineCitationCardBody>
		</InlineCitationCard>
	);
}

function PhanHoi({
	tomTatId,
	daChon,
}: {
	tomTatId: string;
	daChon: boolean | null;
}) {
	const m = okrToanCanhMessages(useLocale()).tomTat;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [chon, setChon] = useState<boolean | null>(daChon);
	const gui = useMutation(
		trpc.okr.troLyTomTatPhanHoi.mutationOptions({
			onSuccess: () => void cache.tomTat(),
		}),
	);
	const giaTri =
		chon === null ? "" : chon ? PHAN_HOI.huuIch : PHAN_HOI.khongHuuIch;
	const doi = (moi: boolean) => {
		const cu = chon;
		setChon(moi);
		gui.mutate(
			{ tomTatId, huuIch: moi },
			{
				onError: () => {
					setChon(cu);
					toast.error(m.phanHoiLoi);
				},
			},
		);
	};
	return (
		<div data-phan-hoi={giaTri}>
			<AiFeedback
				label={m.phanHoiNhom}
				onChange={doi}
				pending={gui.isPending}
				thanks={m.daGhi}
				value={chon}
			/>
		</div>
	);
}

function CoCau({ ban }: { ban: BanTomTat }) {
	const m = okrToanCanhMessages(useLocale()).tomTat;
	return (
		<CardContent
			data-trang-thai={
				ban.phanHoiCuaToi === null
					? "ST-tomtat-co-cau"
					: "ST-tomtat-da-phan-hoi"
			}
		>
			<p className="text-muted-foreground text-xs" data-dong-nguon>
				{m.dongNguon(String(ban.soLanCapNhat), ngayNgan(ban.tuan))}
			</p>
			<ol className="flex max-w-3xl flex-col gap-2.5 text-sm">
				{ban.cau.map((c, i) => (
					<li className="text-pretty" data-cau={i + 1} key={c.vanBan}>
						<InlineCitation>
							<InlineCitationText translate="no">{c.vanBan}</InlineCitationText>{" "}
							<TrichDan cau={c} thuTu={i + 1} />
						</InlineCitation>
					</li>
				))}
			</ol>
			<PhanHoi daChon={ban.phanHoiCuaToi} tomTatId={ban.id} />
		</CardContent>
	);
}

function KhoiRong({
	trangThai,
	tieuDe,
	moTa,
}: {
	trangThai: string;
	tieuDe: string;
	moTa: string;
}) {
	return (
		<CardContent data-trang-thai={trangThai}>
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{tieuDe}</EmptyTitle>
					<EmptyDescription>{moTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</CardContent>
	);
}

export function KhoiTomTat({
	cycleId,
	departmentId,
}: {
	cycleId: string;
	departmentId: string;
}) {
	const mt = okrToanCanhMessages(useLocale());
	const m = mt.tomTat;
	const trpc = useTRPC();
	const idTieuDe = useId();
	const [batDau, setBatDau] = useState<number | null>(null);
	const [batDauXep, setBatDauXep] = useState<number | null>(null);
	const tt = useQuery({
		...trpc.okr.troLyTomTat.queryOptions({ cycleId, departmentId }),
		retry: false,
		refetchInterval: (q) => {
			const d = q.state.data;
			if (d?.dangSoan === true)
				return nhipHoiLai(
					batDau ?? q.state.dataUpdatedAt,
					q.state.dataUpdatedAt,
				);
			if (d?.choBan?.kieu === "dang-xep")
				return nhipHoiLai(
					batDauXep ?? q.state.dataUpdatedAt,
					q.state.dataUpdatedAt,
				);
			if (d?.choBan?.kieu === "toi-luc") return henToiLuc(d.choBan.luc);
			return false;
		},
	});
	const dangSoan = tt.data?.dangSoan === true;
	if (batDau === null && dangSoan && tt.dataUpdatedAt > 0) {
		setBatDau(tt.dataUpdatedAt);
	}
	const dangXep = tt.data?.choBan?.kieu === "dang-xep";
	if (batDauXep === null && dangXep && tt.dataUpdatedAt > 0) {
		setBatDauXep(tt.dataUpdatedAt);
	}

	if (tt.isError)
		return (
			<section aria-label={m.tieuDe} data-trang-thai="ST-tomtat-loi">
				<KaraState
					kind="error"
					what={m.loiKara}
					description={m.loiMoTa}
					onRetry={() => void tt.refetch()}
				/>
			</section>
		);

	let noiDung: ReactNode;
	if (tt.isPending)
		noiDung = (
			<CardContent aria-busy="true" data-trang-thai="ST-tomtat-dang-tai">
				<span className="sr-only">{m.dangTai}</span>
				<Skeleton className="h-3 w-1/3" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-2/3" />
			</CardContent>
		);
	else if (dangSoan) {
		const quaHan =
			batDau !== null && tt.dataUpdatedAt - batDau >= OKR_TOM_TAT.tranChoMs;
		noiDung = (
			<CardContent aria-busy="true" data-trang-thai="ST-tomtat-dang-soan">
				<KaraState kind="working" label={m.dangSoan} delayMs={0} />
				<p className="text-muted-foreground text-xs">
					{quaHan ? m.quaHanMoTa : m.dangSoanMoTa}
				</p>
				{quaHan ? (
					<Button
						className="self-start"
						onClick={() => {
							setBatDau(Date.now());
							void tt.refetch();
						}}
						size="xs"
						variant="outline"
					>
						<Icon icon={Renew} data-icon="inline-start" />
						{m.taiLai}
					</Button>
				) : null}
			</CardContent>
		);
	} else if (tt.data.ban !== null && tt.data.ban.cau.length > 0)
		noiDung = <CoCau ban={tt.data.ban} />;
	else if (tt.data.ban !== null)
		noiDung = (
			<KhoiRong
				moTa={m.locHetMoTa}
				tieuDe={m.locHet}
				trangThai="ST-tomtat-loc-het"
			/>
		);
	else if (tt.data.chuaCapNhat)
		noiDung = (
			<KhoiRong
				moTa={m.chuaCapNhatMoTa}
				tieuDe={m.chuaCapNhat}
				trangThai="ST-tomtat-chua-cap-nhat"
			/>
		);
	else if (tt.data.choBan) noiDung = <DongCho cho={tt.data.choBan} />;
	else return null;

	return (
		<Card aria-labelledby={idTieuDe} data-khoi="tom-tat" role="region">
			<CardHeader>
				<CardTitle id={idTieuDe}>{m.tieuDe}</CardTitle>
			</CardHeader>
			{noiDung}
		</Card>
	);
}
