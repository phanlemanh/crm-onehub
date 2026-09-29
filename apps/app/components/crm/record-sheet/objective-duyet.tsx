"use client";

import Task from "@carbon/icons-react/es/Task";
import Time from "@carbon/icons-react/es/Time";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { OKR_HIEN_THI, traLaiInput } from "@crm/validation/okr-hien-thi";
import { useMutation } from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import { okrGioiHanMessages } from "@/lib/messages/okr-gioi-han";
import { OKR_CHU_KY } from "@/lib/okr-chu-ky-nhan";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { dien, dienNode } from "./plan-copy";

type NguoiTen = { name: string };

export type DuyetMucTieu = {
	id: string;
	title: string;
	choDuyet: {
		nguoiGui: NguoiTen | null;
		guiLuc: string | null;
		nguoiDuyet: { ten: string } | "quan-tri";
	} | null;
	traLaiGanNhat: {
		lyDo: string;
		nguoi: NguoiTen | null;
		luc: string;
	} | null;
	quyen: { guiDuyet: boolean; duyet: boolean; rutDuyet: boolean };
};

const NGAY_THANG = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "2-digit",
	timeZone: OKR_CHU_KY.muiGio,
});

function ngayThang(iso: string): string {
	const phan = NGAY_THANG.formatToParts(new Date(iso));
	const lay = (loai: Intl.DateTimeFormatPartTypes) =>
		phan.find((p) => p.type === loai)?.value ?? "";
	return `${lay("day")}/${lay("month")}`;
}

function Ten({ children }: { children: string }) {
	return <span translate="no">{children}</span>;
}

function useGhiDuyet(objectiveId: string, xong: string, sau: () => void) {
	const cache = useCrmCache();
	return {
		onSuccess: () => {
			toast.success(xong);
			sau();
			void cache.okr(objectiveId);
		},
		onError: (e: { message: string }) => {
			sau();
			toast.error(e.message);
		},
	};
}

function NutDai({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
			{children}
		</div>
	);
}

export function NutGuiDuyet({ objectiveId }: { objectiveId: string }) {
	const m = okrGioiHanMessages(useLocale()).duyet;
	const trpc = useTRPC();
	const [hoi, setHoi] = useState(false);
	const gui = useMutation(
		trpc.okr.guiDuyet.mutationOptions(
			useGhiDuyet(objectiveId, m.daGui, () => setHoi(false)),
		),
	);
	return (
		<>
			<Button
				data-nut="gui-duyet"
				disabled={gui.isPending}
				onClick={() => setHoi(true)}
				size="sm"
			>
				{m.guiDuyet}
			</Button>
			<ConfirmDialog
				tone="default"
				nut={m.hoiGui.nut}
				thoi={m.hoiGui.thoi}
				tieuDe={m.hoiGui.tieuDe}
				than={m.hoiGui.than}
				open={hoi}
				pending={gui.isPending}
				onOpenChange={(mo) => {
					if (!mo && !gui.isPending) setHoi(false);
				}}
				onConfirm={() => {
					if (!gui.isPending) gui.mutate({ id: objectiveId });
				}}
			/>
		</>
	);
}

function HopRutLai({
	objectiveId,
	dong,
}: {
	objectiveId: string;
	dong: () => void;
}) {
	const m = okrGioiHanMessages(useLocale()).duyet;
	const trpc = useTRPC();
	const rut = useMutation(
		trpc.okr.rutDuyet.mutationOptions(useGhiDuyet(objectiveId, m.daRut, dong)),
	);
	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !rut.isPending) dong();
			}}
		>
			<DialogContent data-hop="rut-lai">
				<DialogHeader>
					<DialogTitle>{m.hopRut.tieuDe}</DialogTitle>
					<DialogDescription>{m.hopRut.moTa}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={rut.isPending}>
							{m.hopRut.huy}
						</Button>
					</DialogClose>
					<Button
						data-nut="xac-nhan-rut-lai"
						disabled={rut.isPending}
						onClick={() => rut.mutate({ id: objectiveId })}
					>
						{rut.isPending ? <Spinner /> : null}
						{m.hopRut.nut}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function HopTraLai({
	objectiveId,
	title,
	dong,
}: {
	objectiveId: string;
	title: string;
	dong: () => void;
}) {
	const m = okrGioiHanMessages(useLocale()).duyet;
	const trpc = useTRPC();
	const ma = useId();
	const [lyDo, setLyDo] = useState("");
	const traLai = useMutation(
		trpc.okr.traLaiMucTieu.mutationOptions(
			useGhiDuyet(objectiveId, m.daTraLai, dong),
		),
	);
	const du = traLaiInput.shape.lyDo.safeParse(lyDo).success;
	const { toiThieu, toiDa } = OKR_HIEN_THI.lyDoTraLai;
	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !traLai.isPending) dong();
			}}
			coThayDoi={lyDo.trim() !== ""}
		>
			<DialogContent data-hop="tra-lai">
				<DialogHeader>
					<DialogTitle>{m.hopTraLai.tieuDe}</DialogTitle>
					<DialogDescription>
						{dienNode(m.hopTraLai.moTa, { ten: <Ten>{title}</Ten> })}
					</DialogDescription>
				</DialogHeader>
				<Field>
					<FieldLabel htmlFor={`${ma}-ly-do`}>{m.hopTraLai.nhan}</FieldLabel>
					<Textarea
						aria-describedby={`${ma}-dem`}
						id={`${ma}-ly-do`}
						maxLength={toiDa}
						onChange={(e) => setLyDo(e.target.value)}
						placeholder={m.hopTraLai.goiY}
						translate="no"
						value={lyDo}
					/>
					<FieldDescription id={`${ma}-dem`}>
						{dien(m.hopTraLai.dem, {
							n: lyDo.trim().length,
							max: toiDa,
							min: toiThieu,
						})}
					</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={traLai.isPending}>
							{m.hopTraLai.huy}
						</Button>
					</DialogClose>
					<Button
						data-nut="xac-nhan-tra-lai"
						disabled={traLai.isPending || !du}
						onClick={() => traLai.mutate({ objectiveId, lyDo })}
					>
						{traLai.isPending ? <Spinner /> : null}
						{m.hopTraLai.nut}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DaiChoDuyet({ mucTieu }: { mucTieu: DuyetMucTieu }) {
	const m = okrGioiHanMessages(useLocale()).duyet;
	const [rut, setRut] = useState(false);
	const cho = mucTieu.choDuyet;
	if (!cho) return null;
	return (
		<Alert data-dai="cho-nguoi-gui">
			<Icon icon={Time} />
			<AlertTitle>
				{cho.nguoiDuyet === "quan-tri"
					? m.choQuanTri
					: dienNode(m.choNguoi, { nguoi: <Ten>{cho.nguoiDuyet.ten}</Ten> })}
				{cho.guiLuc
					? ` · ${dien(m.guiLuc, { ngay: ngayThang(cho.guiLuc) })}`
					: null}
			</AlertTitle>
			<AlertDescription>
				<p id={`khoa-sua-${mucTieu.id}`}>{m.khoaSua}</p>
				{mucTieu.quyen.rutDuyet ? (
					<NutDai>
						<Button
							aria-haspopup="dialog"
							data-nut="rut-lai"
							onClick={() => setRut(true)}
							size="sm"
							variant="outline"
						>
							{m.rutLai}
						</Button>
					</NutDai>
				) : null}
			</AlertDescription>
			{rut ? (
				<HopRutLai objectiveId={mucTieu.id} dong={() => setRut(false)} />
			) : null}
		</Alert>
	);
}

function DaiChoNguoiDuyet({ mucTieu }: { mucTieu: DuyetMucTieu }) {
	const m = okrGioiHanMessages(useLocale()).duyet;
	const trpc = useTRPC();
	const [traLai, setTraLai] = useState(false);
	const duyet = useMutation(
		trpc.okr.duyetMucTieu.mutationOptions(
			useGhiDuyet(mucTieu.id, m.daDuyet, () => {}),
		),
	);
	const cho = mucTieu.choDuyet;
	if (!cho) return null;
	return (
		<Alert data-dai="cho-nguoi-duyet">
			<Icon icon={Task} />
			<AlertTitle>
				{cho.nguoiGui
					? dienNode(m.nguoiGui, { nguoi: <Ten>{cho.nguoiGui.name}</Ten> })
					: m.nguoiGuiKhongTen}
				{cho.guiLuc ? ` · ${ngayThang(cho.guiLuc)}` : null}
			</AlertTitle>
			<AlertDescription>
				<p>{m.duyetMoTa}</p>
				<NutDai>
					<Button
						data-nut="duyet"
						disabled={duyet.isPending}
						onClick={() => duyet.mutate({ id: mucTieu.id })}
						size="sm"
					>
						{duyet.isPending ? <Spinner /> : null}
						{m.duyetCongBo}
					</Button>
					<Button
						aria-haspopup="dialog"
						data-nut="tra-lai"
						disabled={duyet.isPending}
						onClick={() => setTraLai(true)}
						size="sm"
						variant="outline"
					>
						{m.traLai}
					</Button>
				</NutDai>
			</AlertDescription>
			{traLai ? (
				<HopTraLai
					objectiveId={mucTieu.id}
					title={mucTieu.title}
					dong={() => setTraLai(false)}
				/>
			) : null}
		</Alert>
	);
}

function DaiBiTraLai({ mucTieu }: { mucTieu: DuyetMucTieu }) {
	const m = okrGioiHanMessages(useLocale()).duyet;
	const tra = mucTieu.traLaiGanNhat;
	if (!tra) return null;
	return (
		<Alert data-dai="bi-tra-lai" variant="warning">
			<Icon icon={WarningAlt} />
			<AlertTitle>
				{tra.nguoi
					? dienNode(m.biTraLai, { nguoi: <Ten>{tra.nguoi.name}</Ten> })
					: m.biTraLaiKhongTen}
				{` · ${ngayThang(tra.luc)}`}
			</AlertTitle>
			<AlertDescription>
				<p translate="no" data-ly-do-tra-lai>
					{tra.lyDo}
				</p>
				{mucTieu.quyen.guiDuyet ? (
					<NutDai>
						<NutGuiDuyet objectiveId={mucTieu.id} />
					</NutDai>
				) : null}
			</AlertDescription>
		</Alert>
	);
}

export function coDaiDuyet(mucTieu: DuyetMucTieu): boolean {
	return mucTieu.choDuyet !== null || mucTieu.traLaiGanNhat !== null;
}

export function DaiDuyet({ mucTieu }: { mucTieu: DuyetMucTieu }) {
	if (mucTieu.choDuyet)
		return mucTieu.quyen.duyet ? (
			<DaiChoNguoiDuyet mucTieu={mucTieu} />
		) : (
			<DaiChoDuyet mucTieu={mucTieu} />
		);
	if (mucTieu.traLaiGanNhat) return <DaiBiTraLai mucTieu={mucTieu} />;
	return null;
}
