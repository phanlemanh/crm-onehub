"use client";

import Archive from "@carbon/icons-react/es/Archive";
import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Textarea } from "@crm/ui/components/textarea";
import {
	chuanNfc,
	TAI_LIEU,
	type TrangThaiDeXuat,
} from "@crm/validation/tai-lieu";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
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
import { duongTrang, ngayTaiLieu } from "@/lib/tai-lieu-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

const MA_LOI_MAY_CHU = 500;

export type DeXuatViecTrang = {
	id: string;
	slug: string;
	ten: string;
	loai: "LUU_TRU" | "KHOI_PHUC";
	lyDoDeXuat: string;
	taoBoi: string;
	taoLuc: string;
	trangThai: TrangThaiDeXuat;
	lyDo: string | null;
	duyetDuoc: boolean;
	diffHash: string;
};

type LoiMay = { message: string; data?: { httpStatus?: number } | null };

export function ManDuyetViecTrang({ deXuat }: { deXuat: DeXuatViecTrang }) {
	const locale = useLocale();
	const m = taiLieuMessages(locale).duyet;
	const v = taiLieuLichSuMessages(locale).luuTru.duyet;
	const chu = v[deXuat.loai];
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const idLyDo = `${useId()}-ly-do`;
	const [lyDo, setLyDo] = useState("");
	const [loi, setLoi] = useState<string | null>(null);
	const baoLoi = (e: LoiMay) =>
		setLoi(
			dien(m.loi, {
				loi:
					e.data?.httpStatus !== undefined && e.data.httpStatus < MA_LOI_MAY_CHU
						? e.message
						: m.mayChu,
			}),
		);
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
	const choDuyet = deXuat.trangThai === "CHO_DUYET";
	const dangLam = duyet.isPending || traLai.isPending;
	const sach = chuanNfc(lyDo).trim();

	const bamTraLai = () => {
		if (dangLam) return;
		if (sach.length < TAI_LIEU.lyDo.min) return setLoi(m.lyDoTrong);
		if (sach.length > TAI_LIEU.lyDo.max)
			return setLoi(dien(m.lyDoDai, { max: TAI_LIEU.lyDo.max }));
		setLoi(null);
		traLai.mutate({ id: deXuat.id, lyDo: sach });
	};

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
						{chu.tieuDe} · <span translate="no">{deXuat.taoBoi}</span> ·{" "}
						{ngayTaiLieu(deXuat.taoLuc, locale)}
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<section
					className="flex min-w-0 max-w-3xl flex-col gap-5"
					data-de-xuat={deXuat.id}
					data-loai-de-xuat={deXuat.loai}
				>
					<Alert data-viec-trang={deXuat.loai}>
						<Icon icon={Archive} />
						<AlertTitle>{chu.tieuDe}</AlertTitle>
						<AlertDescription>
							<p translate="no">{dien(v.lyDo, { lyDo: deXuat.lyDoDeXuat })}</p>
						</AlertDescription>
					</Alert>
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
					{deXuat.duyetDuoc && choDuyet ? (
						<div className="flex flex-col gap-3" data-quyet-dinh="">
							<Field data-invalid={loi ? true : undefined}>
								<FieldLabel htmlFor={idLyDo}>{m.lyDo}</FieldLabel>
								<Textarea
									id={idLyDo}
									onChange={(e) => setLyDo(e.target.value)}
									translate="no"
									value={lyDo}
								/>
								{loi ? <FieldError data-thong-bao="">{loi}</FieldError> : null}
							</Field>
							<div className="flex flex-wrap items-center gap-2">
								<Button
									data-nut-duyet=""
									disabled={dangLam}
									onClick={() =>
										duyet.mutate({ id: deXuat.id, diffHash: deXuat.diffHash })
									}
								>
									{duyet.isPending ? chu.dangDuyet : chu.nut}
								</Button>
								<Button
									data-nut-tra-lai=""
									disabled={dangLam}
									onClick={bamTraLai}
									variant="outline"
								>
									{traLai.isPending ? m.dangTraLai : m.traLai}
								</Button>
							</div>
						</div>
					) : null}
				</section>
			</PageShellContent>
		</>
	);
}
