"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
} from "@crm/ui/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@crm/ui/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@crm/ui/components/ai-elements/prompt-input";
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
import { Button } from "@crm/ui/components/button";
import { FieldDescription } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import Logo from "@crm/ui/components/logo";
import { Marker, MarkerContent, MarkerIcon } from "@crm/ui/components/marker";
import { MessageAvatar } from "@crm/ui/components/message";
import { Spinner } from "@crm/ui/components/spinner";
import { ThinkingIndicator } from "@crm/ui/components/thinking-indicator";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { TranscriptItem } from "@/lib/agent-transcript";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { useTRPC } from "@/lib/trpc/client";
import { SOAN_UI } from "./cau-hinh";
import { type CuocDangSoan, donViCua } from "./dung-cuoc-soan";
import type { CuocSoan } from "./kieu";
import type { LyDoHong } from "./loi-cua";
import { tachLuotTroLy } from "./tach-cau-hoi";

type LyDoSoan = keyof OkrSoanMessages["lyDo"];

function AvatarTroLy() {
	return (
		<MessageAvatar square>
			<Logo className="size-5" />
		</MessageAvatar>
	);
}

function LuotTroLy({
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
		<div className="flex min-w-0 gap-2" data-luot="tro-ly">
			<AvatarTroLy />
			<Message from="assistant" className="min-w-0">
				<MessageContent>
					{loiDan ? <MessageResponse>{loiDan}</MessageResponse> : null}
					{cauHoi.map((c) => (
						<div className="flex flex-col gap-2" key={c.hoi} data-cau-hoi>
							<p>{c.hoi}</p>
							{goiY && c.goiY.length > 0 ? (
								<Suggestions aria-label={m.hoiThoai.goiY(c.hoi)}>
									{c.goiY.map((g) => (
										<Suggestion
											key={g}
											suggestion={g}
											onClick={gui}
											data-goi-y
										/>
									))}
								</Suggestions>
							) : null}
						</div>
					))}
				</MessageContent>
			</Message>
		</div>
	);
}

function MucLuot({
	item,
	goiY,
	gui,
	m,
}: {
	item: TranscriptItem;
	goiY: boolean;
	gui: (chu: string) => void;
	m: OkrSoanMessages;
}) {
	if (item.kind === "said") {
		if (item.mine) {
			if (item.text === SOAN_UI.luotMoDau) return null;
			return (
				<Message from="user" className="min-w-0" data-luot="nguoi">
					<MessageContent className="text-pretty" translate="no">
						{item.text}
					</MessageContent>
				</Message>
			);
		}
		return <LuotTroLy chu={item.text} goiY={goiY} gui={gui} m={m} />;
	}
	if (item.kind !== "did" || item.tool !== SOAN_UI.congCuNop) return null;
	return (
		<Marker data-luot="nop">
			<MarkerIcon>
				{item.pending ? <Spinner /> : <Icon icon={Checkmark} />}
			</MarkerIcon>
			<MarkerContent>{m.hoiThoai.daNop}</MarkerContent>
		</Marker>
	);
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
		<Alert role="alert" data-luot="loi">
			<AlertTitle>{m.hoiThoai.loi}</AlertTitle>
			<AlertDescription>
				<div aria-live="polite">
					<p>{loiMo ? m.lyDo[loiMo] : cauLyDoHong(m, s.lyDoHong)}</p>
					{s.lyDoHong?.daHoan ? <p>{m.hoiThoai.khongTinh}</p> : null}
					{s.lanThu > 0 ? <p>{m.hoiThoai.daThuLai(String(s.lanThu))}</p> : null}
				</div>
			</AlertDescription>
			<AlertAction>
				<Button
					size="sm"
					variant="outline"
					data-nut="thu-lai"
					disabled={s.dangThu || s.moLai.isPending}
					onClick={s.thuLai}
				>
					{m.hoiThoai.thuLai}
				</Button>
			</AlertAction>
		</Alert>
	);
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
	const { chu, doiChu } = s;
	const moMoi = useMutation(
		trpc.okr.soanMo.mutationOptions({
			onSuccess: (kq) => {
				if (kq.ok) moCuoc(kq.cuoc.id);
			},
		}),
	);
	const ghi = s.hetLuot
		? m.hoiThoai.hetLuot(String(cuoc.tranLuot))
		: s.dangTraLoi
			? m.hoiThoai.khoaKhiSoan
			: m.hoiThoai.phim;
	const tuChoiMo = moMoi.data?.ok === false ? moMoi.data.lyDo : null;
	return (
		<div className="flex flex-col gap-2">
			<PromptInput
				onSubmit={() => {
					s.gui(chu);
					doiChu("");
				}}
				data-o-soan={s.khoaSoan ? "khoa" : "mo"}
			>
				<PromptInputBody>
					<PromptInputTextarea
						aria-label={m.hoiThoai.nhan}
						placeholder={m.hoiThoai.placeholder}
						value={chu}
						onChange={(e) => doiChu(e.currentTarget.value)}
						disabled={s.khoaSoan}
						translate="no"
					/>
				</PromptInputBody>
				<PromptInputFooter>
					<PromptInputTools />
					<PromptInputSubmit
						aria-label={m.hoiThoai.gui}
						disabled={s.khoaSoan || chu.trim() === ""}
					/>
				</PromptInputFooter>
			</PromptInput>
			{cuoc.trangThai === "dang" ? (
				<FieldDescription data-o-soan-ghi>{ghi}</FieldDescription>
			) : null}
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
				<FieldDescription data-loi="mo-cuoc-moi">
					{m.lyDo[tuChoiMo]}
				</FieldDescription>
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
}: {
	s: CuocDangSoan;
	cuoc: CuocSoan;
	thieuBoiCanh: boolean;
	lyDo: LyDoSoan | null;
	quanTri: boolean;
	moCuoc: (cuocSoanId: string) => void;
}) {
	const m = okrSoanMessages(useLocale());
	const { slug } = useParams<{ slug: string }>();
	const tuTroLy = s.transcript.filter((t) => !t.mine);
	const cuoiTroLy = tuTroLy.at(-1)?.id ?? null;
	const loiMo = s.moLai.data?.ok === false ? s.moLai.data.lyDo : null;
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
			<Conversation aria-label={m.hoiThoai.nhan}>
				<ConversationContent>
					{rong && cuoc.soLuot === 0 && !s.cuocDong ? (
						<ConversationEmptyState data-rong="mo-dau">
							<ThinkingIndicator label={m.hoiThoai.moDau} />
						</ConversationEmptyState>
					) : null}
					{rong && cuoc.soLuot > 0 && !s.cuocDong ? (
						<ConversationEmptyState
							title={m.hoiThoai.khongDocLai}
							description={m.hoiThoai.khongDocLaiMoTa}
						/>
					) : null}
					{s.transcript.map((tin) =>
						tin.items.map((item) => (
							<MucLuot
								key={item.id}
								item={item}
								goiY={tin.id === cuoiTroLy && !s.khoaSoan}
								gui={s.gui}
								m={m}
							/>
						)),
					)}
					{s.dangTraLoi ? (
						<div
							className="flex min-w-0 gap-2"
							role="status"
							aria-live="polite"
							aria-busy="true"
						>
							<AvatarTroLy />
							<ThinkingIndicator
								label={cuoiTroLy ? m.hoiThoai.dangSoan : m.hoiThoai.moDau}
							/>
						</div>
					) : null}
					{s.hong || s.dangThu ? <LuotLoi s={s} m={m} loiMo={loiMo} /> : null}
					{s.lyDoLuot ? (
						<Alert role="alert" data-tu-choi={s.lyDoLuot}>
							<AlertTitle>{m.lyDoLuot[s.lyDoLuot]}</AlertTitle>
						</Alert>
					) : null}
					{s.chuaCauHinh ? (
						<Alert role="alert" data-tu-choi="chua-cau-hinh">
							<AlertTitle>{m.nut.chuaCauHinh}</AlertTitle>
						</Alert>
					) : null}
				</ConversationContent>
			</Conversation>
			<OSoan s={s} cuoc={cuoc} m={m} moCuoc={moCuoc} />
		</>
	);
}
