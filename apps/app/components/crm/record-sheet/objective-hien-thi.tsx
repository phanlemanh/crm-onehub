"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Close from "@carbon/icons-react/es/Close";
import Locked from "@carbon/icons-react/es/Locked";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { RadioGroup, RadioGroupItem } from "@crm/ui/components/radio-group";
import { Spinner } from "@crm/ui/components/spinner";
import {
	TokenFieldAction,
	TokenFieldItem,
} from "@crm/ui/components/token-field";
import {
	MUC_HIEN_THI,
	type MucHienThi,
	OKR_HIEN_THI,
} from "@crm/validation/okr-hien-thi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { okrGioiHanMessages } from "@/lib/messages/okr-gioi-han";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { dien, dienNode } from "./plan-copy";

export type NguoiXem = { id: string; name: string };

export type MucTieuHienThi = {
	id: string;
	title: string;
	hienThi: MucHienThi;
	nguoiXem: NguoiXem[];
	coCanChinh: boolean;
};

const khoaTap = (ids: string[]) => [...ids].sort().join("|");

export function HopMucHienThi({
	mucTieu,
	dong,
	moCanChinh,
}: {
	mucTieu: MucTieuHienThi;
	dong: () => void;
	moCanChinh: () => void;
}) {
	const m = okrGioiHanMessages(useLocale()).hienThi;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const sangCanChinh = useRef(false);
	const thanhVien = useQuery(trpc.okr.thanhVien.queryOptions());
	const [muc, setMuc] = useState<MucHienThi>(mucTieu.hienThi);
	const [nguoiXem, setNguoiXem] = useState<NguoiXem[]>(mucTieu.nguoiXem);
	const [loi, setLoi] = useState<{ cau: string; tuChoi: boolean } | null>(null);
	const luu = useMutation(
		trpc.okr.datHienThi.mutationOptions({
			onSuccess: (kq) => {
				toast.success(m.daLuu);
				void cache.okr(kq.id);
				dong();
			},
			onError: (e) =>
				setLoi({ cau: e.message, tuChoi: e.data?.code === "BAD_REQUEST" }),
		}),
	);

	const ids = nguoiXem.map((x) => x.id);
	const gui = muc === "gioi-han" ? ids : [];
	const coThayDoi =
		muc !== mucTieu.hienThi ||
		khoaTap(gui) !==
			khoaTap(
				mucTieu.hienThi === "gioi-han" ? mucTieu.nguoiXem.map((x) => x.id) : [],
			);
	const day = nguoiXem.length >= OKR_HIEN_THI.nguoiXemToiDa;
	const luaChon = (thanhVien.data ?? [])
		.filter((u) => !ids.includes(u.id))
		.map((u) => ({
			value: u.id,
			label: u.name,
			hint: u.email,
			keywords: [u.email],
		}));
	const doi = (sau: () => void) => {
		setLoi(null);
		sau();
	};
	const idLoi = `${ma}-loi`;

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (mo || luu.isPending) return;
				if (sangCanChinh.current) moCanChinh();
				else dong();
			}}
			coThayDoi={coThayDoi}
		>
			<DialogContent
				size="wide"
				data-hop="muc-hien-thi"
				onEscapeKeyDown={() => {
					sangCanChinh.current = false;
				}}
				onInteractOutside={() => {
					sangCanChinh.current = false;
				}}
			>
				<DialogHeader>
					<DialogTitle>{m.tieuDe}</DialogTitle>
					<DialogDescription>
						{dienNode(m.moTa, {
							ten: <span translate="no">{mucTieu.title}</span>,
						})}
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<FieldSet data-invalid={loi ? true : undefined}>
						<FieldLegend variant="label">{m.nhom}</FieldLegend>
						<RadioGroup
							value={muc}
							onValueChange={(v) => {
								const moi = MUC_HIEN_THI.find((x) => x === v);
								if (moi) doi(() => setMuc(moi));
							}}
						>
							<Field orientation="horizontal">
								<RadioGroupItem id={`${ma}-cong-khai`} value="cong-khai" />
								<FieldContent>
									<FieldLabel htmlFor={`${ma}-cong-khai`}>
										{m.congKhai}
									</FieldLabel>
									<FieldDescription>{m.congKhaiMoTa}</FieldDescription>
								</FieldContent>
							</Field>
							<Field orientation="horizontal">
								<RadioGroupItem
									aria-describedby={loi ? idLoi : undefined}
									aria-invalid={loi && muc === "gioi-han" ? true : undefined}
									id={`${ma}-gioi-han`}
									value="gioi-han"
								/>
								<FieldContent>
									<FieldLabel htmlFor={`${ma}-gioi-han`}>
										<Icon icon={Locked} />
										{m.gioiHan}
									</FieldLabel>
									<FieldDescription>{m.gioiHanMoTa}</FieldDescription>
								</FieldContent>
							</Field>
						</RadioGroup>
						{loi ? <FieldError id={idLoi}>{loi.cau}</FieldError> : null}
						{loi?.tuChoi && muc === "gioi-han" && mucTieu.coCanChinh ? (
							<div>
								<DialogClose asChild>
									<Button
										data-nut="mo-can-chinh"
										onClick={() => {
											sangCanChinh.current = true;
										}}
										size="sm"
										variant="outline"
									>
										{m.moCanChinh}
										<Icon icon={ArrowRight} data-icon="inline-end" />
									</Button>
								</DialogClose>
							</div>
						) : null}
					</FieldSet>
					{muc === "gioi-han" ? (
						<Field>
							<FieldLabel htmlFor={`${ma}-nguoi-xem`}>{m.nguoiXem}</FieldLabel>
							<Combobox
								id={`${ma}-nguoi-xem`}
								translate="no"
								disabled={thanhVien.isPending || day}
								options={luaChon}
								value=""
								onValueChange={(v) => {
									const u = thanhVien.data?.find((x) => x.id === v);
									if (u)
										doi(() =>
											setNguoiXem((ds) => [...ds, { id: u.id, name: u.name }]),
										);
								}}
								placeholder={thanhVien.isPending ? m.dangTai : m.themNguoi}
								searchPlaceholder={m.timNguoi}
								empty={m.khongAi}
							/>
							{nguoiXem.length > 0 ? (
								<div className="flex flex-wrap gap-1" data-nguoi-xem>
									{nguoiXem.map((x) => (
										<TokenFieldItem key={x.id}>
											<span className="truncate px-1" translate="no">
												{x.name}
											</span>
											<TokenFieldAction
												aria-label={dien(m.boNguoi, { ten: x.name })}
												onClick={() =>
													doi(() =>
														setNguoiXem((ds) =>
															ds.filter((d) => d.id !== x.id),
														),
													)
												}
											>
												<Icon icon={Close} />
											</TokenFieldAction>
										</TokenFieldItem>
									))}
								</div>
							) : null}
							<FieldDescription>
								{dien(m.dem, {
									n: nguoiXem.length,
									max: OKR_HIEN_THI.nguoiXemToiDa,
								})}
							</FieldDescription>
						</Field>
					) : null}
					<FieldDescription data-luon-thay>{m.luonThay}</FieldDescription>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button
							variant="outline"
							disabled={luu.isPending}
							onClick={() => {
								sangCanChinh.current = false;
							}}
						>
							{m.huy}
						</Button>
					</DialogClose>
					<Button
						data-nut="luu-muc-hien-thi"
						disabled={luu.isPending || !coThayDoi || loi?.tuChoi === true}
						onClick={() =>
							luu.mutate({
								objectiveId: mucTieu.id,
								hienThi: muc,
								nguoiXem: gui,
							})
						}
					>
						{luu.isPending ? <Spinner /> : null}
						{m.luu}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
