"use client";

import { KaraMark } from "@crm/ui/components/kara";
import { KaraComposer } from "@crm/ui/components/kara/composer";
import {
	KaraDock,
	KaraDockBody,
	KaraDockFooter,
	KaraDockHeader,
} from "@crm/ui/components/kara/dock";
import { KaraRetry, KaraState } from "@crm/ui/components/kara/state";
import { KaraTranscript, KaraTurn } from "@crm/ui/components/kara/transcript";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	type CauTraLoiDung,
	ketQuaNopTraLoi,
	type LY_DO_LUOT_HOI,
} from "@crm/validation/okr-tra-loi";
import type { EveMessage } from "eve/react";
import { type OkrHoiMessages, okrHoiMessages } from "@/lib/messages/okr-hoi";
import { TheTraLoi } from "./the-tra-loi";

export type LyDoKhoaHoi = (typeof LY_DO_LUOT_HOI)[number];
export type TrichMo = { kind: "objective" | "kr"; id: string };

export type KhungHoiProps = {
	messages: readonly EveMessage[];
	dangChay: boolean;
	loi: boolean;
	lyDoKhoa: LyDoKhoaHoi | null;
	daPhanHoi: Readonly<Record<string, boolean>>;
	onGui: (cauHoi: string) => void;
	onThuLai: (cauHoi: string) => void;
	onMoTrich: (trich: TrichMo) => void;
	onPhanHoi: (maTraLoi: string, huuIch: boolean) => void;
};

type LuotHoi = {
	id: string;
	cauHoi: string;
	traLoi: { ma: string; noiDung: CauTraLoiDung } | null;
	coKara: boolean;
};

const TEN_NOP = "nop_tra_loi";

function traLoiCua(
	message: EveMessage,
): { ma: string; noiDung: CauTraLoiDung } | null {
	let ra: { ma: string; noiDung: CauTraLoiDung } | null = null;
	for (const part of message.parts) {
		if (part.type !== "dynamic-tool" || part.toolName !== TEN_NOP) continue;
		if (part.state !== "output-available") continue;
		const kq = ketQuaNopTraLoi.safeParse(part.output);
		if (kq.success && kq.data.ok)
			ra = { ma: part.toolCallId, noiDung: kq.data.traLoi };
	}
	return ra;
}

function chuNguoi(message: EveMessage): string {
	return message.parts
		.flatMap((p) => (p.type === "text" ? [p.text.trim()] : []))
		.filter(Boolean)
		.join("\n");
}

export function chiaLuot(messages: readonly EveMessage[]): LuotHoi[] {
	const luot: LuotHoi[] = [];
	for (const message of messages) {
		if (message.role === "user") {
			luot.push({
				id: message.id,
				cauHoi: chuNguoi(message),
				traLoi: null,
				coKara: false,
			});
			continue;
		}
		const cuoi = luot.at(-1);
		if (!cuoi) continue;
		cuoi.coKara = true;
		cuoi.traLoi = traLoiCua(message) ?? cuoi.traLoi;
	}
	return luot;
}

function LuotKara({
	luot,
	laCuoi,
	props,
	m,
}: {
	luot: LuotHoi;
	laCuoi: boolean;
	props: KhungHoiProps;
	m: OkrHoiMessages;
}) {
	if (luot.traLoi) {
		const ma = luot.traLoi.ma;
		return (
			<TheTraLoi
				traLoi={luot.traLoi.noiDung}
				m={m}
				phanHoi={props.daPhanHoi[ma] ?? null}
				onPhanHoi={(huuIch) => props.onPhanHoi(ma, huuIch)}
				onMoTrich={props.onMoTrich}
			/>
		);
	}
	if (laCuoi && props.dangChay)
		return (
			<KaraTurn from="kara">
				<KaraState kind="working" label={m.dangDoc} delayMs={0} />
			</KaraTurn>
		);
	if (!luot.coKara && !props.loi) return null;
	return (
		<KaraTurn from="kara">
			<KaraState
				kind="error"
				what={m.loi.viec}
				onRetry={() => props.onThuLai(luot.cauHoi)}
			/>
			{laCuoi ? null : (
				<KaraRetry onClick={() => props.onThuLai(luot.cauHoi)} />
			)}
		</KaraTurn>
	);
}

export function KhungHoi(props: KhungHoiProps) {
	const m = okrHoiMessages(useLocale());
	const luot = chiaLuot(props.messages);
	const rong = luot.length === 0 && !props.dangChay;
	return (
		<KaraDock
			side="fill"
			alone
			aria-label={m.khung.tieuDe}
			data-khung="hoi-okr"
		>
			<KaraDockHeader>
				<KaraMark scope={<span>{m.khung.pham}</span>} />
			</KaraDockHeader>
			<KaraDockBody scroll={false}>
				<KaraTranscript
					empty={
						rong
							? { title: m.trong.tieuDe, description: m.trong.moTa }
							: undefined
					}
				>
					{luot.map((l, i) => (
						<div key={l.id} className="flex flex-col gap-3">
							<KaraTurn from="user">
								<span translate="no">{l.cauHoi}</span>
							</KaraTurn>
							<LuotKara
								luot={l}
								laCuoi={i === luot.length - 1}
								props={props}
								m={m}
							/>
						</div>
					))}
				</KaraTranscript>
			</KaraDockBody>
			<KaraDockFooter>
				<KaraComposer
					onSubmit={props.onGui}
					status={props.dangChay ? "busy" : "ready"}
					label={m.oGo.nhan}
					placeholder={m.oGo.goi}
					suggestions={rong ? m.trong.goiY : undefined}
					suggestionsLabel={m.trong.goiYNhan}
					onSuggestion={props.onGui}
					lockedReason={props.lyDoKhoa ? m.khoa[props.lyDoKhoa] : undefined}
				/>
			</KaraDockFooter>
		</KaraDock>
	);
}
