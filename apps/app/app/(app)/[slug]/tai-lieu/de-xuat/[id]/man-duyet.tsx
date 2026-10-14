"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { DiffTrang } from "@crm/ui/components/diff-trang";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { MarkdownReader } from "@crm/ui/components/markdown-reader";
import { Textarea } from "@crm/ui/components/textarea";
import {
	chuanNfc,
	TAI_LIEU,
	type TrangThaiDeXuat,
} from "@crm/validation/tai-lieu";
import {
	diffHash,
	type KhoiDoi,
	type SoDoi,
} from "@crm/validation/tai-lieu-diff";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { duongSuaTuDeXuat, duongTrang, ngayTaiLieu } from "@/lib/tai-lieu-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { type BanMay, BanMayDuyet } from "./ban-may";

export type DeXuatDuyet = {
	id: string;
	slug: string;
	ten: string;
	taoBoi: string;
	taoLuc: string;
	trangThai: TrangThaiDeXuat;
	lyDo: string | null;
	cu: boolean;
	duyetDuoc: boolean;
	khoi: KhoiDoi[];
	dai: SoDoi[];
	may?: BanMay;
	chienLuoc?: { soKyTu: number; tranKyTu: number; canhBaoTuCam: string[] };
	tuPhienBanSo?: number | null;
};

type LoiMay = {
	message: string;
	data?: { code?: string; httpStatus?: number } | null;
};

export function ManDuyet({ deXuat }: { deXuat: DeXuatDuyet }) {
	const locale = useLocale();
	const t = taiLieuMessages(locale);
	const m = t.duyet;
	const mm = t.duyetMay;
	const soVi = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");
	const chienLuoc = deXuat.chienLuoc;
	const quaTran =
		chienLuoc !== undefined && chienLuoc.soKyTu > chienLuoc.tranKyTu;
	const tuCam = chienLuoc?.canhBaoTuCam ?? [];
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const ma = useId();
	const idLyDo = `${ma}-ly-do`;
	const idLoiLyDo = `${ma}-loi-ly-do`;
	const idKhoaDuyet = `${ma}-khoa-duyet`;
	const oLyDo = useRef<HTMLTextAreaElement>(null);
	const [lyDo, setLyDo] = useState("");
	const [loiLyDo, setLoiLyDo] = useState<string | null>(null);
	const [thongBao, setThongBao] = useState<string | null>(null);
	const [dangTinh, setDangTinh] = useState(false);
	const [daDoc, setDaDoc] = useState(false);
	const [daTick, setDaTick] = useState<ReadonlySet<number>>(() => new Set());
	const may = deXuat.may;
	const chuaTickHet = may !== undefined && daTick.size < may.dong.length;
	const doiTick = (dong: number, tick: boolean) =>
		setDaTick((cu) => {
			const moi = new Set(cu);
			if (tick) moi.add(dong);
			else moi.delete(dong);
			return moi;
		});

	const baoLoi = async (e: LoiMay) => {
		if (e.data?.code === "CONFLICT") {
			setThongBao(m.daDoi);
			await cache.taiLieu(deXuat.slug);
			router.refresh();
			return;
		}
		setThongBao(
			dien(m.loi, {
				loi:
					e.data?.httpStatus !== undefined && e.data.httpStatus < 500
						? e.message
						: m.mayChu,
			}),
		);
	};

	const duyet = useMutation(
		trpc.taiLieu.approve.mutationOptions({
			onSuccess: async (r) => {
				await cache.taiLieu(r.slug);
				router.push(url(duongTrang(r.slug)));
			},
			onError: baoLoi,
		}),
	);
	const traLai = useMutation(
		trpc.taiLieu.reject.mutationOptions({
			onSuccess: async () => {
				await cache.taiLieu(deXuat.slug);
				router.refresh();
			},
			onError: baoLoi,
		}),
	);
	const dangLam = dangTinh || duyet.isPending || traLai.isPending;
	const choDuyet = deXuat.trangThai === "CHO_DUYET";
	const coQuyetDinh =
		deXuat.duyetDuoc && (choDuyet || deXuat.cu) && (!may || daDoc);
	const hienKhoaDuyet = chuaTickHet && choDuyet && !deXuat.cu;

	const bamDuyet = async () => {
		if (quaTran || dangLam || deXuat.cu || chuaTickHet) return;
		setThongBao(null);
		setDangTinh(true);
		const hash = await diffHash(deXuat.khoi);
		setDangTinh(false);
		duyet.mutate(
			may
				? { id: deXuat.id, diffHash: hash, daDoiChieu: daTick.size }
				: { id: deXuat.id, diffHash: hash },
		);
	};

	const bamTraLai = () => {
		if (dangLam) return;
		setThongBao(null);
		const sach = chuanNfc(lyDo).trim();
		const loi =
			sach.length < TAI_LIEU.lyDo.min
				? m.lyDoTrong
				: sach.length > TAI_LIEU.lyDo.max
					? dien(m.lyDoDai, { max: TAI_LIEU.lyDo.max })
					: null;
		setLoiLyDo(loi);
		if (loi) {
			oLyDo.current?.focus();
			return;
		}
		traLai.mutate({ id: deXuat.id, lyDo: sach });
	};

	const diff = (
		<DiffTrang
			dai={deXuat.dai}
			khoi={deXuat.khoi}
			nhanBo={m.nhanBo}
			nhanDaiSo={m.nhanDaiSo}
			nhanThem={m.nhanThem}
		/>
	);

	return (
		<>
			<PageShellHeader
				breadcrumb={
					<div>
						<Button asChild size="sm" variant="ghost">
							<Link href={url(duongTrang(deXuat.slug))}>
								<Icon icon={ArrowLeft} />
								{m.veTrang}
							</Link>
						</Button>
					</div>
				}
			>
				<PageShellHeading>
					<PageShellTitle translate="no">{deXuat.ten}</PageShellTitle>
					<PageShellDescription>
						{m.tieuDe} · <span translate="no">{deXuat.taoBoi}</span> ·{" "}
						<span data-ngay-gui="">{ngayTaiLieu(deXuat.taoLuc, locale)}</span>
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<section
					className={
						may
							? "flex min-w-0 flex-col gap-5"
							: "flex min-w-0 max-w-3xl flex-col gap-5"
					}
					data-de-xuat={deXuat.id}
				>
					{deXuat.tuPhienBanSo ? (
						<div>
							<Badge data-quay-lai={deXuat.tuPhienBanSo} variant="secondary">
								{dien(taiLieuLichSuMessages(locale).luuTru.duyet.quayLai, {
									so: deXuat.tuPhienBanSo,
								})}
							</Badge>
						</div>
					) : null}
					{deXuat.cu ? (
						<Alert data-de-xuat-cu="" role="note" variant="warning">
							<Icon icon={WarningAlt} />
							<AlertTitle>{m.cuTieuDe}</AlertTitle>
							<AlertDescription>
								<span translate="no">
									{dien(m.cuThan, { ai: deXuat.taoBoi })}
								</span>
							</AlertDescription>
						</Alert>
					) : null}
					{deXuat.trangThai === "TRA_LAI" ? (
						<Alert data-da-tra-lai="" role="status">
							<AlertTitle>{m.traLaiTieuDe}</AlertTitle>
							<AlertDescription>
								<span translate="no">
									{dien(m.traLaiThan, { lyDo: deXuat.lyDo ?? "" })}
								</span>
							</AlertDescription>
						</Alert>
					) : null}
					{deXuat.trangThai === "DA_DUYET" ? (
						<Alert data-da-duyet="" role="status">
							<AlertTitle>{m.daDuyet}</AlertTitle>
						</Alert>
					) : null}
					{quaTran && chienLuoc ? (
						<Alert data-qua-tran="" role="alert" variant="destructive">
							<Icon icon={WarningAlt} />
							<AlertTitle>
								{dien(m.chienLuoc.quaTran, {
									tran: soVi.format(chienLuoc.tranKyTu),
									so: soVi.format(chienLuoc.soKyTu),
								})}
							</AlertTitle>
						</Alert>
					) : null}
					{tuCam.length > 0 ? (
						<Alert data-canh-bao-tu-cam="" role="note" variant="warning">
							<Icon icon={WarningAlt} />
							<AlertTitle>
								{dien(m.chienLuoc.canhBao, { tu: tuCam.join(", ") })}
							</AlertTitle>
						</Alert>
					) : null}
					{may ? (
						<BanMayDuyet
							banTrinhBay={
								<div translate="no">
									<MarkdownReader
										calloutLabels={t.doc.ghiChu}
										missingLabel={t.doc.chuaCoTrang}
										sourceBackLabel={t.doc.veChoTrich}
										sourcesLabel={t.doc.nguon}
									>
										{may.noiDung}
									</MarkdownReader>
								</div>
							}
							daDoc={daDoc}
							docXong={() => setDaDoc(true)}
							may={may}
							tick={{ daTick, doi: doiTick }}
						/>
					) : (
						diff
					)}
					{may?.coBanGoc && daDoc ? (
						<Card data-so-voi-ban="">
							<CardHeader>
								<CardTitle>
									{deXuat.cu ? mm.soVoiBanGocMay : mm.soVoiBan}
								</CardTitle>
								{deXuat.cu ? (
									<CardDescription>{mm.banDangDungDaDoi}</CardDescription>
								) : null}
							</CardHeader>
							<CardContent>{diff}</CardContent>
						</Card>
					) : null}
					<div aria-live="polite">
						{thongBao ? (
							<Alert data-thong-bao="" role="status">
								<AlertDescription>{thongBao}</AlertDescription>
							</Alert>
						) : null}
					</div>
					{coQuyetDinh ? (
						<div className="flex max-w-3xl flex-col gap-3" data-quyet-dinh="">
							<Field data-invalid={loiLyDo ? true : undefined}>
								<FieldLabel htmlFor={idLyDo}>{m.lyDo}</FieldLabel>
								<Textarea
									aria-describedby={loiLyDo ? idLoiLyDo : undefined}
									aria-invalid={loiLyDo ? true : undefined}
									disabled={!choDuyet}
									id={idLyDo}
									onChange={(e) => {
										setLyDo(e.target.value);
										if (loiLyDo) setLoiLyDo(null);
									}}
									ref={oLyDo}
									translate="no"
									value={lyDo}
								/>
								{loiLyDo ? (
									<FieldError id={idLoiLyDo}>{loiLyDo}</FieldError>
								) : null}
							</Field>
							<div className="flex flex-wrap items-center gap-2">
								{quaTran ? null : (
									<Button
										aria-describedby={hienKhoaDuyet ? idKhoaDuyet : undefined}
										data-nut-duyet=""
										disabled={deXuat.cu || !choDuyet || dangLam || chuaTickHet}
										onClick={bamDuyet}
										variant={may ? "outline" : "default"}
									>
										{duyet.isPending || dangTinh ? m.dangDuyet : m.duyet}
									</Button>
								)}
								<Button
									data-nut-tra-lai=""
									disabled={!choDuyet || dangLam}
									onClick={bamTraLai}
									variant="outline"
								>
									{traLai.isPending ? m.dangTraLai : m.traLai}
								</Button>
								{may && choDuyet && !deXuat.cu ? (
									<Button asChild data-nut-sua-ban="" variant="outline">
										<Link href={url(duongSuaTuDeXuat(deXuat.slug, deXuat.id))}>
											{mm.suaBanNay}
										</Link>
									</Button>
								) : null}
							</div>
							{hienKhoaDuyet ? (
								<FieldDescription data-khoa-duyet="" id={idKhoaDuyet}>
									{mm.khoaDuyet}
								</FieldDescription>
							) : null}
						</div>
					) : null}
				</section>
			</PageShellContent>
		</>
	);
}
