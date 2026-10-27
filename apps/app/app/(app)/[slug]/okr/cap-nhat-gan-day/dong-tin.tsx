"use client";

import { Button } from "@crm/ui/components/button";
import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@crm/ui/components/input-group";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation } from "@tanstack/react-query";
import { type MouseEvent, useState } from "react";
import { okrCapNhatGanDayMessages } from "@/lib/messages/okr-cap-nhat-gan-day";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { luc } from "../bang-vet";
import { giaTri } from "../gia-tri-kr";

export type DongCapNhat = RouterOutputs["okr"]["capNhatGanDay"]["rows"][number];

const VUNG_KHONG_MO = "[data-khung-tra-loi], button, a, textarea";

function boQuaBam(e: MouseEvent<HTMLElement>): boolean {
	return (
		e.target instanceof Element && e.target.closest(VUNG_KHONG_MO) !== null
	);
}

function soCua(dong: DongCapNhat, locale: Locale): string {
	const kieu = { kind: dong.kr.kieu, unit: dong.kr.donVi };
	const hienTai = giaTri(kieu, dong.giaTri, locale);
	return dong.kr.kieu === "moc"
		? hienTai
		: `${hienTai} / ${giaTri(kieu, dong.kr.dich, locale)}`;
}

function TraLoi({ dong }: { dong: DongCapNhat }) {
	const locale = useLocale();
	const m = okrCapNhatGanDayMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const khaiThayDoi = useKhaiThayDoi();
	const gui = useMutation(trpc.okr.addComment.mutationOptions());
	const [mo, setMo] = useState(false);
	const [noiDung, setNoiDung] = useState("");
	const dong0 = () => {
		setMo(false);
		setNoiDung("");
		khaiThayDoi(false);
		gui.reset();
	};
	const loi =
		gui.error && !gui.isPending
			? m.chuaGui(
					gui.error.data?.httpStatus !== undefined &&
						gui.error.data.httpStatus < 500
						? gui.error.message
						: m.mayChu,
				)
			: null;
	const guiDi = () =>
		gui.mutate(
			{
				objectiveId: dong.mucTieu.id,
				keyResultId: dong.kr.id,
				body: noiDung.trim(),
				mentionUserIds: dong.mentionNguoiCapNhat
					? [dong.mentionNguoiCapNhat]
					: [],
			},
			{
				onSuccess: async () => {
					await cache.okr(dong.mucTieu.id, { settle: "record" });
					dong0();
				},
			},
		);
	return (
		<div className="flex flex-col gap-2 pt-2" data-khung-tra-loi="">
			{dong.traLoi.map((t) => (
				<div className="flex gap-2" data-tra-loi={t.id} key={t.id}>
					<PersonAvatar name={t.nguoi.name} size="sm" />
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="text-muted-foreground text-xs">
							<span className="font-medium text-foreground" translate="no">
								{t.nguoi.name}
							</span>{" "}
							· {luc(t.luc, locale)}
						</span>
						<p
							className="whitespace-pre-wrap break-words text-sm"
							translate="no"
						>
							{t.noiDung}
						</p>
					</div>
				</div>
			))}
			{mo ? (
				<div className="flex flex-col gap-1">
					<InputGroup data-o-tra-loi="">
						<InputGroupTextarea
							aria-label={m.oTraLoi(dong.nguoi.name)}
							autoFocus
							onChange={(e) => {
								setNoiDung(e.target.value);
								khaiThayDoi(e.target.value.trim() !== "");
							}}
							onKeyDown={(e) => {
								if (e.key === "Escape") dong0();
							}}
							placeholder={m.goiY}
							rows={2}
							value={noiDung}
						/>
						<InputGroupAddon align="block-end">
							<InputGroupButton onClick={dong0} size="xs" variant="ghost">
								{m.huy}
							</InputGroupButton>
							<InputGroupButton
								className="ml-auto"
								data-gui-tra-loi=""
								disabled={noiDung.trim() === "" || gui.isPending}
								onClick={guiDi}
								size="xs"
								variant="default"
							>
								{m.gui}
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
					{loi ? (
						<p
							className="text-destructive text-xs"
							data-loi-tra-loi=""
							role="alert"
						>
							{loi}
						</p>
					) : null}
				</div>
			) : (
				<div>
					<Button
						data-mo-tra-loi=""
						onClick={() => setMo(true)}
						size="sm"
						variant="ghost"
					>
						{m.traLoi}
					</Button>
				</div>
			)}
		</div>
	);
}

export function DongTin({
	dong,
	onMoKr,
}: {
	dong: DongCapNhat;
	onMoKr: (keyResultId: string) => void;
}) {
	const locale = useLocale();
	const m = okrCapNhatGanDayMessages(locale);
	return (
		<Item
			data-dong-tin={dong.checkInId}
			onClick={(e) => {
				if (!boQuaBam(e)) onMoKr(dong.kr.id);
			}}
			variant="outline"
		>
			<ItemMedia>
				<PersonAvatar name={dong.nguoi.name} />
			</ItemMedia>
			<ItemContent>
				<ItemDescription data-dong-nguoi="">
					<span className="font-medium text-foreground" translate="no">
						{dong.nguoi.name}
					</span>
					{dong.thayCho ? (
						<>
							{" "}
							<span translate="no">{m.thayCho(dong.thayCho.name)}</span>
						</>
					) : null}{" "}
					· <span data-dong-luc="">{luc(dong.luc, locale)}</span>
				</ItemDescription>
				<ItemTitle>
					<button
						className="whitespace-normal break-words text-left hover:underline"
						data-mo-kr={dong.kr.id}
						onClick={() => onMoKr(dong.kr.id)}
						type="button"
					>
						<span translate="no">{dong.kr.tieuDe}</span>
					</button>
				</ItemTitle>
				<ItemDescription data-dong-muc-tieu="" translate="no">
					{dong.mucTieu.tieuDe} · {dong.bo.ten}
				</ItemDescription>
				<div className="flex flex-wrap items-center gap-3 pt-1" data-dong-so="">
					<span className="font-medium text-sm tabular-nums">
						{soCua(dong, locale)}
					</span>
					<ConfidenceIndicator level={dong.tuTin} size="sm" />
				</div>
				{dong.ghiChu ? (
					<p
						className="whitespace-pre-wrap break-words pt-1 text-sm"
						data-dong-ghi-chu=""
						translate="no"
					>
						{dong.ghiChu}
					</p>
				) : null}
				{dong.moiNhat ? (
					<TraLoi dong={dong} />
				) : (
					<p className="pt-1 text-muted-foreground text-xs" data-co-moi-hon="">
						{m.coMoiHon}
					</p>
				)}
			</ItemContent>
		</Item>
	);
}
