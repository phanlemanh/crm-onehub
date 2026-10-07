"use client";

import { MessageResponse } from "@crm/ui/components/ai-elements/message";
import {
	Suggestion,
	Suggestions,
} from "@crm/ui/components/ai-elements/suggestion";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { KaraComposer } from "@crm/ui/components/kara/composer";
import { KaraRetry, KaraState } from "@crm/ui/components/kara/state";
import { type KaraStep, KaraSteps } from "@crm/ui/components/kara/steps";
import {
	KaraCheckpoint,
	KaraSystemLine,
	KaraTranscript,
	KaraTurn,
} from "@crm/ui/components/kara/transcript";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import type { TranscriptItem, TranscriptMessage } from "@/lib/agent-transcript";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { useTRPC } from "@/lib/trpc/client";
import { SOAN_UI } from "./cau-hinh";
import { type CuocDangSoan, donViCua } from "./dung-cuoc-soan";
import {
	docKhoi,
	dongKhoi,
	type KhoiNguCanh,
	type QuyetBang,
} from "./khoi-ngu-canh";
import type { CuocSoan } from "./kieu";
import type { LyDoHong } from "./loi-cua";
import type { MocNop, TomTatMoc } from "./moc-nop";
import { tachLuotTroLy } from "./tach-cau-hoi";

type LyDoSoan = keyof OkrSoanMessages["lyDo"];

export function chuQuyet(m: OkrSoanMessages, ds: readonly QuyetBang[]): string {
	return ds
		.map((q) => m.heThong.cach[q.cach](m.heThong.loai[q.loai], q.chu))
		.join(" · ");
}

export function chuMoc(m: OkrSoanMessages, tom: TomTatMoc): string {
	if (!tom.docDuoc) return m.moc.khongDoc;
	if (tom.dau) return m.moc.dau(String(tom.mucTieu), String(tom.kr));
	const phan = [
		tom.themMucTieu > 0 ? m.moc.themMucTieu(String(tom.themMucTieu)) : null,
		tom.themKr > 0 ? m.moc.themKr(String(tom.themKr)) : null,
		tom.sua > 0 ? m.moc.sua(String(tom.sua)) : null,
		tom.chuyen > 0 ? m.moc.chuyen(String(tom.chuyen)) : null,
		tom.bo > 0 ? m.moc.bo(String(tom.bo)) : null,
	].filter((x) => x !== null);
	return phan.length > 0 ? phan.join(" · ") : m.moc.khongDoi;
}

function LuotKara({
	chu,
	goiY,
	gui,
	m,
}: {
	chu: string;
	goiY: boolean;
	gui: (chu: string) => void;
	m: OkrSoanMessages;
}) {
	const { loiDan, cauHoi } = tachLuotTroLy(chu);
	return (
		<KaraTurn from="kara">
			<div className="flex flex-col gap-2" data-luot="tro-ly">
				{loiDan ? <MessageResponse>{loiDan}</MessageResponse> : null}
				{cauHoi.map((c) => (
					<div className="flex flex-col gap-2" key={c.hoi} data-cau-hoi>
						<p>{c.hoi}</p>
						{goiY && c.goiY.length > 0 ? (
							<Suggestions aria-label={m.hoiThoai.goiY(c.hoi)}>
								{c.goiY.map((g) => (
									<Suggestion key={g} suggestion={g} onClick={gui} data-goi-y />
								))}
							</Suggestions>
						) : null}
					</div>
				))}
			</div>
		</KaraTurn>
	);
}

function LuotNguoi({
	khoi,
	nguoi,
	m,
}: {
	khoi: KhoiNguCanh | null;
	nguoi: string;
	m: OkrSoanMessages;
}) {
	return (
		<>
			{khoi && khoi.quyet.length > 0 ? (
				<KaraSystemLine>{chuQuyet(m, khoi.quyet)}</KaraSystemLine>
			) : null}
			<KaraTurn from="user">
				{khoi?.dong ? (
					<>
						<Badge variant="secondary" data-chip-dong>
							{m.dong.nguCanh(m.heThong.loai[khoi.dong.loai], khoi.dong.chu)}
						</Badge>{" "}
					</>
				) : null}
				{nguoi}
			</KaraTurn>
		</>
	);
}

function tenBuoc(m: OkrSoanMessages, tool: string): string {
	const b = m.buoc;
	return Object.hasOwn(b, tool) ? b[tool as keyof typeof b] : b.khac;
}

function buocCua(
	m: OkrSoanMessages,
	items: readonly TranscriptItem[],
): KaraStep[] {
	return items.flatMap((i): KaraStep[] =>
		i.kind === "did" && i.tool !== SOAN_UI.congCuNop
			? [
					{
						id: i.id,
						label: tenBuoc(m, i.tool),
						state: i.pending ? "running" : i.failed ? "error" : "done",
					},
				]
			: [],
	);
}

function TinNhan({
	tin,
	mocs,
	goiY,
	s,
	m,
	moMoc,
}: {
	tin: TranscriptMessage;
	mocs: ReadonlyMap<string, MocNop>;
	goiY: boolean;
	s: CuocDangSoan;
	m: OkrSoanMessages;
	moMoc: (moc: MocNop) => void;
}) {
	const mui = useMessages();
	const buoc = tin.mine ? [] : buocCua(m, tin.items);
	const ra: ReactNode[] = [];
	if (buoc.length > 0)
		ra.push(
			<div key={`${tin.id}-buoc`} data-luot="buoc" className="ps-10">
				<KaraSteps steps={buoc} />
			</div>,
		);
	for (const item of tin.items) {
		if (item.kind === "said") {
			if (item.mine) {
				if (item.text === SOAN_UI.luotMoDau) continue;
				const { khoi, nguoi } = docKhoi(item.text);
				ra.push(<LuotNguoi key={item.id} khoi={khoi} nguoi={nguoi} m={m} />);
			} else {
				ra.push(
					<LuotKara
						key={item.id}
						chu={item.text}
						goiY={goiY}
						gui={s.gui}
						m={m}
					/>,
				);
			}
			continue;
		}
		const moc = item.kind === "did" ? mocs.get(item.id) : undefined;
		if (!moc) continue;
		const tom = moc.tom;
		ra.push(
			<KaraCheckpoint
				key={item.id}
				summary={chuMoc(m, tom)}
				label={
					!tom.docDuoc
						? m.moc.khongDoc
						: tom.dau
							? mui.karaKhung.mocDau(chuMoc(m, tom))
							: undefined
				}
				onSelect={() => moMoc(moc)}
			/>,
		);
	}
	return <>{ra}</>;
}

function cauLyDoHong(m: OkrSoanMessages, lyDo: LyDoHong | null): string {
	if (!lyDo || lyDo.ma === "dung-giua-chung") return m.hoiThoai.loiMoTaKhac;
	if (lyDo.ma === "qua-45s") return m.hoiThoai.loiMoTa;
	return m.hoiThoai.lyDoHong[lyDo.ma];
}

function LuotLoi({
	s,
	m,
	loiMo,
}: {
	s: CuocDangSoan;
	m: OkrSoanMessages;
	loiMo: LyDoSoan | null;
}) {
	return (
		<Empty
			border="solid"
			size="compact"
			data-kara-state="error"
			data-luot="loi"
		>
			<EmptyHeader>
				<EmptyTitle>{m.hoiThoai.loi}</EmptyTitle>
				<EmptyDescription>
					<span aria-live="polite" className="flex flex-col gap-1">
						<span>
							{loiMo
								? m.lyDo[loiMo]
								: s.chuaGuiLai
									? m.hoiThoai.chuaGuiLai
									: cauLyDoHong(m, s.lyDoHong)}
						</span>
						{s.lyDoHong?.daHoan ? <span>{m.hoiThoai.khongTinh}</span> : null}
						{s.lanThu > 0 ? (
							<span>{m.hoiThoai.daThuLai(String(s.lanThu))}</span>
						) : null}
					</span>
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<KaraRetry
					onClick={s.thuLai}
					disabled={s.dangThu || s.moLai.isPending}
				/>
			</EmptyContent>
		</Empty>
	);
}

function lyDoKhoa(
	s: CuocDangSoan,
	cuoc: CuocSoan,
	m: OkrSoanMessages,
): string | undefined {
	if (!s.khoaSoan || s.dangTraLoi) return undefined;
	if (s.cuocDong) return m.hoiThoai.cuocDongMoTa;
	if (s.hetLuot) return m.hoiThoai.hetLuot(String(cuoc.tranLuot));
	if (s.lyDoLuot) return m.lyDoLuot[s.lyDoLuot];
	if (s.chuaCauHinh) return m.nut.chuaCauHinh;
	if (s.hong || s.dangThu) return m.hoiThoai.loi;
	return m.hoiThoai.khoaKhiSoan;
}

function OSoan({
	s,
	cuoc,
	m,
	moCuoc,
}: {
	s: CuocDangSoan;
	cuoc: CuocSoan;
	m: OkrSoanMessages;
	moCuoc: (cuocSoanId: string) => void;
}) {
	const trpc = useTRPC();
	const moMoi = useMutation(
		trpc.okr.soanMo.mutationOptions({
			onSuccess: (kq) => {
				if (kq.ok) moCuoc(kq.cuoc.id);
			},
		}),
	);
	const tuChoiMo = moMoi.data?.ok === false ? moMoi.data.lyDo : null;
	const ngu = s.hoiVeDong;
	return (
		<div
			className="flex flex-col gap-2"
			data-o-soan={s.khoaSoan ? "khoa" : "mo"}
		>
			<KaraComposer
				onSubmit={s.gui}
				onStop={s.dung}
				status={s.dangTraLoi ? "busy" : "ready"}
				label={m.hoiThoai.nhan}
				placeholder={m.hoiThoai.placeholder}
				context={
					ngu
						? {
								label: m.dong.nguCanh(
									m.heThong.loai[dongKhoi(ngu).loai],
									dongKhoi(ngu).chu,
								),
								onRemove: () => s.datHoiVeDong(null),
							}
						: undefined
				}
				lockedReason={lyDoKhoa(s, cuoc, m)}
				value={s.chu}
				onValueChange={s.doiChu}
			/>
			{s.hetLuot && cuoc.trangThai === "dang" ? (
				<Button
					size="sm"
					variant="outline"
					className="w-fit"
					data-nut="mo-cuoc-moi"
					disabled={moMoi.isPending}
					onClick={() =>
						moMoi.mutate({ ...donViCua(cuoc), boCuocDangId: cuoc.id })
					}
				>
					{m.hoiThoai.moCuocMoi}
				</Button>
			) : null}
			{tuChoiMo ? (
				<p className="text-muted-foreground text-sm" data-loi="mo-cuoc-moi">
					{m.lyDo[tuChoiMo]}
				</p>
			) : null}
		</div>
	);
}

export function HoiThoaiSoan({
	s,
	cuoc,
	thieuBoiCanh,
	lyDo,
	quanTri,
	moCuoc,
	moMoc,
}: {
	s: CuocDangSoan;
	cuoc: CuocSoan;
	thieuBoiCanh: boolean;
	lyDo: LyDoSoan | null;
	quanTri: boolean;
	moCuoc: (cuocSoanId: string) => void;
	moMoc: (moc: MocNop) => void;
}) {
	const m = okrSoanMessages(useLocale());
	const { slug } = useParams<{ slug: string }>();
	const tuKara = s.transcript.filter((t) => !t.mine);
	const cuoiKara = tuKara.at(-1)?.id ?? null;
	const loiMo = s.moLai.data?.ok === false ? s.moLai.data.lyDo : null;
	const mocs = new Map(s.mocs.map((x) => [x.itemId, x] as const));
	const rong = s.transcript.length === 0 && !s.dangTraLoi;
	return (
		<>
			{thieuBoiCanh ? (
				<Alert variant="warning" role="note" data-dai="thieu-boi-canh">
					<AlertTitle>{m.hoiThoai.thieuBoiCanh}</AlertTitle>
					<AlertDescription>{m.hoiThoai.thieuBoiCanhMoTa}</AlertDescription>
					{quanTri ? (
						<AlertAction>
							<Button asChild size="sm" variant="outline">
								<Link href={`/${slug}/tai-lieu`}>{m.hoiThoai.toiKho}</Link>
							</Button>
						</AlertAction>
					) : null}
				</Alert>
			) : null}
			{lyDo ? (
				<Alert variant="warning" role="note" data-dai="ly-do">
					<AlertTitle>{m.lyDo[lyDo]}</AlertTitle>
				</Alert>
			) : null}
			{s.cuocDong ? (
				<Alert role="note" data-dai="cuoc-dong">
					<AlertTitle>{m.hoiThoai.cuocDong}</AlertTitle>
					<AlertDescription>{m.hoiThoai.cuocDongMoTa}</AlertDescription>
				</Alert>
			) : null}
			<KaraTranscript
				empty={
					rong && cuoc.soLuot > 0
						? {
								title: m.hoiThoai.khongDocLai,
								description: m.hoiThoai.khongDocLaiMoTa,
							}
						: rong
							? { description: m.hoiThoai.moDau }
							: undefined
				}
			>
				{s.transcript.map((tin) => (
					<TinNhan
						key={tin.id}
						tin={tin}
						mocs={mocs}
						goiY={tin.id === cuoiKara && !s.khoaSoan}
						s={s}
						m={m}
						moMoc={moMoc}
					/>
				))}
				{s.dangTraLoi ? (
					<KaraTurn from="kara">
						<KaraState
							kind="working"
							label={cuoiKara ? m.hoiThoai.dangSoan : m.hoiThoai.moDau}
						/>
					</KaraTurn>
				) : null}
				{s.hong || s.dangThu ? <LuotLoi s={s} m={m} loiMo={loiMo} /> : null}
				{s.lyDoLuot ? (
					<div data-tu-choi={s.lyDoLuot}>
						<KaraState kind="off" reason={m.lyDoLuot[s.lyDoLuot]} />
					</div>
				) : null}
				{s.chuaCauHinh ? (
					<div data-tu-choi="chua-cau-hinh">
						<KaraState kind="off" reason={m.nut.chuaCauHinh} />
					</div>
				) : null}
				{s.quyetBang.length > 0 ? (
					<KaraSystemLine>
						{m.heThong.seGui(chuQuyet(m, s.quyetBang))}
					</KaraSystemLine>
				) : null}
			</KaraTranscript>
			<OSoan s={s} cuoc={cuoc} m={m} moCuoc={moCuoc} />
		</>
	);
}
