"use client";

import {
	InlineCitationQuote,
	InlineCitationSource,
} from "@crm/ui/components/ai-elements/inline-citation";
import {
	Message,
	MessageActions,
	MessageContent,
} from "@crm/ui/components/ai-elements/message";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ThinkingIndicator } from "@crm/ui/components/thinking-indicator";
import type { Locale } from "@crm/ui/lib/locale";
import {
	type CauDaKiem,
	cauLoiHoi,
	dongQuaHan,
	type GanNhat,
	TAI_LIEU_HOI,
	type TraLoiDaKiem,
} from "@crm/validation/tai-lieu-hoi";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { type TaiLieuMessages, taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongTrang, ngayTaiLieu, TAI_LIEU_MAN } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { HopBaoSai } from "./hop-bao-sai";

export type LuotHoi = { hoiId: string; cauHoi: string };

export function useKetQuaHoi(hoiId: string | null) {
	const trpc = useTRPC();
	return useQuery({
		...trpc.hoiKho.ketQua.queryOptions({ hoiId: hoiId ?? "" }),
		enabled: hoiId !== null,
		refetchInterval: (q) =>
			q.state.data?.trangThai === "DANG_HOI"
				? TAI_LIEU_MAN.hoi.thamDoMs
				: false,
	});
}

export function LuotHoiKho({
	luot,
	hoiLai,
}: {
	luot: LuotHoi;
	hoiLai: (cauHoi: string) => void;
}) {
	const locale = useLocale();
	const m = taiLieuMessages(locale);
	const kq = useKetQuaHoi(luot.hoiId);

	return (
		<>
			<Message from="user">
				<MessageContent translate="no">{luot.cauHoi}</MessageContent>
			</Message>
			<Message data-ket-qua-hoi={kq.data?.trangThai ?? "tai"} from="assistant">
				{kq.isError ? (
					<MessageContent>
						<p>{m.hoi.loiKetQua}</p>
						<MessageActions>
							<Button onClick={() => kq.refetch()} size="sm" variant="outline">
								{m.hoi.thuLai}
							</Button>
						</MessageActions>
					</MessageContent>
				) : !kq.data || kq.data.trangThai === "DANG_HOI" ? (
					<ThinkingIndicator label={m.hoi.dangDoc} />
				) : kq.data.trangThai === "TRA_LOI" ? (
					<TraLoi locale={locale} luot={luot} m={m} traLoi={kq.data.traLoi} />
				) : kq.data.trangThai === "TU_CHOI" ? (
					<TuChoi ganNhat={kq.data.ganNhat} m={m} />
				) : (
					<MessageContent>
						<p>{cauLoiHoi(kq.data.lyDo)}</p>
						<MessageActions>
							<Button
								onClick={() => hoiLai(luot.cauHoi)}
								size="sm"
								variant="outline"
							>
								{m.hoi.hoiLai}
							</Button>
						</MessageActions>
					</MessageContent>
				)}
			</Message>
		</>
	);
}

function TraLoi({
	traLoi,
	luot,
	m,
	locale,
}: {
	traLoi: TraLoiDaKiem;
	luot: LuotHoi;
	m: TaiLieuMessages;
	locale: Locale;
}) {
	const ngay = (iso: string) => ngayTaiLieu(iso, locale);
	const quaHan = dongQuaHan(traLoi, ngay);

	return (
		<MessageContent>
			<p className="text-muted-foreground text-xs" data-nhan-tra-loi="">
				{m.hoi.nhanTraLoi}
			</p>
			{quaHan.length > 0 ? (
				<Alert data-qua-han="" variant="warning">
					{quaHan.map((dong) => (
						<AlertDescription key={dong}>{dong}</AlertDescription>
					))}
				</Alert>
			) : null}
			{traLoi.cau.map((cau) => (
				<Y cau={cau} key={cau.chu} m={m} ngay={ngay} />
			))}
			<MessageActions>
				<HopBaoSai cauHoi={luot.cauHoi} hoiId={luot.hoiId} />
			</MessageActions>
		</MessageContent>
	);
}

function Y({
	cau,
	m,
	ngay,
}: {
	cau: CauDaKiem;
	m: TaiLieuMessages;
	ngay: (iso: string) => string;
}) {
	const url = useWorkspaceUrl();
	return (
		<div className="flex flex-col gap-2" data-y-tra-loi="">
			<p className="whitespace-pre-line" data-chu-y="">
				{cau.chu}
			</p>
			{cau.trich.map((t) => (
				<InlineCitationSource key={`${t.slug}-${t.doan}`}>
					<p className="flex flex-wrap gap-x-2 text-muted-foreground text-xs">
						<Link
							className="font-medium text-foreground"
							href={url(duongTrang(t.slug))}
							translate="no"
						>
							{t.ten}
						</Link>
						<span>{dien(m.hoi.phienBan, { so: t.phienBan })}</span>
						<span>{dien(m.hoi.duyet, { ngay: ngay(t.duyetLuc) })}</span>
					</p>
					<InlineCitationQuote translate="no">«{t.doan}»</InlineCitationQuote>
				</InlineCitationSource>
			))}
		</div>
	);
}

function TuChoi({ ganNhat, m }: { ganNhat: GanNhat; m: TaiLieuMessages }) {
	const url = useWorkspaceUrl();
	return (
		<MessageContent data-tu-choi="">
			<p>{TAI_LIEU_HOI.tuChoi}</p>
			{ganNhat.length > 0 ? (
				<p className="flex flex-wrap gap-x-2 text-sm">
					<span className="text-muted-foreground">{m.hoi.ganNhat}</span>
					{ganNhat.map((g) => (
						<Link href={url(duongTrang(g.slug))} key={g.slug} translate="no">
							{g.ten}
						</Link>
					))}
				</p>
			) : null}
			<p className="text-muted-foreground text-xs">{m.hoi.vaoHang}</p>
		</MessageContent>
	);
}
