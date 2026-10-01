"use client";

import {
	Conversation,
	ConversationContent,
} from "@crm/ui/components/ai-elements/conversation";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputProvider,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
	usePromptInputController,
} from "@crm/ui/components/ai-elements/prompt-input";
import {
	Suggestion,
	Suggestions,
} from "@crm/ui/components/ai-elements/suggestion";
import { Alert, AlertAction, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { TAI_LIEU_HOI } from "@crm/validation/tai-lieu-hoi";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { useTRPC } from "@/lib/trpc/client";
import { type LuotHoi, LuotHoiKho, useKetQuaHoi } from "./hoi-tra-loi";

const MA_TRAN = 429;
const MA_LOI_MAY_CHU = 500;

export function HoiKho() {
	return (
		<PromptInputProvider>
			<NoiDungHoi />
		</PromptInputProvider>
	);
}

function NoiDungHoi() {
	const m = taiLieuMessages(useLocale()).hoi;
	const trpc = useTRPC();
	const ban = usePromptInputController();
	const oNhap = useRef<HTMLTextAreaElement>(null);
	const [luot, setLuot] = useState<LuotHoi[]>([]);
	const hoi = useMutation(trpc.hoiKho.hoi.mutationOptions());
	const cuoi = luot.at(-1) ?? null;
	const kq = useKetQuaHoi(cuoi?.hoiId ?? null);
	const trangThaiCuoi = kq.data?.trangThai;
	const dangDoc =
		cuoi !== null &&
		!kq.isError &&
		(trangThaiCuoi ?? "DANG_HOI") === "DANG_HOI";

	useEffect(() => {
		if (trangThaiCuoi && trangThaiCuoi !== "DANG_HOI") oNhap.current?.focus();
	}, [trangThaiCuoi]);

	const loi = hoi.isPending ? null : hoi.error;
	const tran = loi?.data?.httpStatus === MA_TRAN ? loi.message : null;
	const loiGui =
		loi && tran === null
			? dien(m.chuaGui, {
					loi:
						loi.data?.httpStatus !== undefined &&
						loi.data.httpStatus < MA_LOI_MAY_CHU
							? loi.message
							: m.mayChu,
				})
			: null;
	const choGui = hoi.isPending || dangDoc;
	const khoa = tran !== null;
	const duDai =
		ban.textInput.value.trim().length >= TAI_LIEU_HOI.cauHoi.toiThieu;

	const gui = async (cau: string): Promise<void> => {
		const sach = cau.trim();
		if (sach.length < TAI_LIEU_HOI.cauHoi.toiThieu || choGui || khoa) {
			throw new Error(m.chuaGui);
		}
		const { hoiId } = await hoi.mutateAsync({ cauHoi: sach });
		setLuot((ds) => [...ds, { hoiId, cauHoi: sach }]);
	};

	const guiRoiXoa = (cau: string) => {
		gui(cau).then(ban.textInput.clear, () => undefined);
	};

	const hoiGoiY = (cau: string) => {
		ban.textInput.setInput(cau);
		guiRoiXoa(cau);
	};

	return (
		<div className="flex flex-col gap-4" data-hoi-kho="">
			{luot.length === 0 ? (
				<div className="flex flex-col gap-3">
					<p className="text-muted-foreground text-sm">
						{m.moDau} {m.gioiThieu}
					</p>
					<Suggestions data-goi-y="" xuongDong>
						{m.goiY.map((cau) => (
							<Suggestion
								disabled={choGui || khoa}
								key={cau}
								onClick={hoiGoiY}
								suggestion={cau}
							/>
						))}
					</Suggestions>
				</div>
			) : null}
			<Conversation aria-live="polite">
				<ConversationContent>
					{luot.map((l) => (
						<LuotHoiKho
							hoiLai={(cau) => gui(cau).catch(() => undefined)}
							key={l.hoiId}
							luot={l}
						/>
					))}
				</ConversationContent>
			</Conversation>
			{tran ? (
				<Alert data-tran="">
					<AlertDescription>{tran}</AlertDescription>
				</Alert>
			) : null}
			{loiGui ? (
				<Alert data-loi-gui="" variant="destructive">
					<AlertDescription>{loiGui}</AlertDescription>
					<AlertAction>
						<Button
							onClick={() => guiRoiXoa(ban.textInput.value)}
							size="sm"
							variant="outline"
						>
							{m.thuLai}
						</Button>
					</AlertAction>
				</Alert>
			) : null}
			<PromptInput onSubmit={({ text }) => gui(text)}>
				<PromptInputBody>
					<PromptInputTextarea
						aria-label={m.nhan}
						disabled={khoa}
						maxLength={TAI_LIEU_HOI.cauHoi.toiDa}
						placeholder={m.oNhap}
						ref={oNhap}
						translate="no"
					/>
				</PromptInputBody>
				<PromptInputFooter>
					<PromptInputTools />
					<PromptInputSubmit disabled={khoa || choGui || !duDai} />
				</PromptInputFooter>
			</PromptInput>
		</div>
	);
}
