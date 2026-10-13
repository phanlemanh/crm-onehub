"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
import { useLocale } from "@crm/ui/components/locale-provider";
import { VIEC } from "@crm/validation/viec";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { InlineTextArea, InlineTextCell } from "@/components/crm/inline-field";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import {
	lyDoLoi,
	RecordSheetFrame,
} from "@/components/crm/record-sheet/record-parts";
import {
	useRecordSheetView,
	useRecordStack,
} from "@/components/crm/record-sheet/record-stack";
import {
	DetailSheetBody,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { type ViecMessages, viecMessages } from "@/lib/messages/viec";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { LichSuViec } from "./lich-su-viec";
import {
	HanViec,
	type TrangThaiViec,
	TrangThaiViecNhan,
} from "./trang-thai-viec";

function ganCua(b: {
	loai: "company" | "contact" | "deal" | "plan";
	id: string;
}) {
	switch (b.loai) {
		case "company":
			return { companyId: b.id };
		case "contact":
			return { contactId: b.id };
		case "deal":
			return { dealId: b.id };
		case "plan":
			return { planId: b.id };
	}
}

const THU_TU_NUT = {
	CHUA_LAM: ["DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"],
	DANG_LAM: ["CHO_DANH_GIA", "XONG", "HUY"],
	CHO_DANH_GIA: ["XONG", "DANG_LAM", "HUY"],
	XONG: ["DANG_LAM"],
	HUY: ["CHUA_LAM"],
} as const satisfies Record<TrangThaiViec, readonly TrangThaiViec[]>;

function nhanNut(
	m: ViecMessages,
	nguon: TrangThaiViec,
	den: TrangThaiViec,
): string {
	if (den === "HUY") return m.nut.huy;
	if (den === "XONG") return m.nut.xong;
	if (den === "CHO_DANH_GIA") return m.nut.guiDanhGia;
	if (den === "CHUA_LAM") return m.nut.moLai;
	return nguon === "CHUA_LAM" ? m.nut.batDau : m.nut.lamLai;
}

export function KhungViec({ viecId }: { viecId: string }) {
	const m = viecMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { close } = useRecordStack();
	const { tab, setTab } = useRecordSheetView("chi-tiet");
	const [hoiXoa, setHoiXoa] = useState(false);
	const q = useQuery(trpc.viec.get.queryOptions({ id: viecId }));
	const dsNguoi = useQuery(trpc.onboarding.nguoiNhanViec.queryOptions());
	const xong = {
		onSuccess: () => void cache.viec(),
		onError: (e: { message: string }) => {
			toast.error(e.message);
			void cache.viec();
		},
	};
	const doi = useMutation(trpc.viec.doiTrangThai.mutationOptions(xong));
	const sua = useMutation(trpc.viec.sua.mutationOptions(xong));
	const doiNguoi = useMutation(
		trpc.viec.doiNguoiThucHien.mutationOptions(xong),
	);
	const go = useMutation(trpc.viec.go.mutationOptions(xong));
	const theo = useMutation(trpc.viec.theoDoi.mutationOptions(xong));
	const boTheo = useMutation(trpc.viec.boTheoDoi.mutationOptions(xong));
	const xoa = useMutation(
		trpc.viec.xoa.mutationOptions({
			onSuccess: async () => {
				setHoiXoa(false);
				close();
				await cache.viec();
			},
			onError: (e) => toast.error(e.message),
		}),
	);
	const v = q.data;
	const daKhep = v?.trangThai === "XONG" || v?.trangThai === "HUY";
	const nut = v
		? THU_TU_NUT[v.trangThai].filter((d) => v.quyen.trangThai.includes(d))
		: [];
	const suaDuoc = v ? v.quyen.sua && !daKhep : false;

	const chiTiet = v ? (
		<DetailSheetBody>
			<DetailSheetSection>
				<DetailSheetProperties>
					{suaDuoc ? (
						<DetailSheetProperty label={m.khung.tieuDe} wide>
							<InlineTextCell
								label={m.khung.tieuDe}
								maxLength={VIEC.tieuDeToiDa}
								onSave={(chu) => {
									if (chu !== "") sua.mutate({ id: v.id, tieuDe: chu });
								}}
								saving={sua.isPending && sua.variables?.tieuDe !== undefined}
								value={v.tieuDe}
							/>
						</DetailSheetProperty>
					) : null}
					<DetailSheetProperty label={m.cot.trangThai}>
						<span data-trang-thai-viec="">
							<TrangThaiViecNhan trangThai={v.trangThai} />
						</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.han}>
						{suaDuoc ? (
							<DatePicker
								onChange={(han) =>
									sua.mutate({ id: v.id, hanNgay: han === "" ? null : han })
								}
								placeholder={m.oSoan.chonHan}
								value={v.hanNgay}
							/>
						) : (
							<HanViec viec={v} />
						)}
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.nguoiGiao}>
						<span translate="no">{v.nguoiGiao.name}</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.nguoiThucHien}>
						{v.quyen.doiNguoi && !daKhep ? (
							<Combobox
								aria-label={m.khung.nguoiThucHien}
								empty={m.oSoan.khongAi}
								onValueChange={(id) =>
									doiNguoi.mutate({ id: v.id, nguoiThucHienId: id })
								}
								options={(dsNguoi.data ?? []).map((u) => ({
									value: u.id,
									label: u.name,
								}))}
								searchPlaceholder={m.oSoan.timNguoi}
								selectedOption={{
									value: v.nguoiThucHien.id,
									label: v.nguoiThucHien.name,
								}}
								translate="no"
								value={v.nguoiThucHien.id}
							/>
						) : (
							<span translate="no">{v.nguoiThucHien.name}</span>
						)}
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.nguoiTheoDoi}>
						<span translate="no">
							{v.nguoiTheoDoi.map((n) => n.name).join(", ") ||
								m.oSoan.khongTheoDoi}
						</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={m.khung.ganVoi}>
						{v.banGhi.length === 0 ? (
							<span className="text-muted-foreground">{m.khung.rieng}</span>
						) : (
							<span className="flex flex-col gap-1">
								{v.banGhi.map((b) => (
									<span
										className="flex items-center gap-2"
										key={`${b.loai}:${b.id}`}
									>
										<RecordLink id={b.id} kind={b.loai}>
											<span translate="no">{b.ten}</span>
										</RecordLink>
										{v.quyen.gan && !daKhep ? (
											<Button
												disabled={go.isPending}
												onClick={() => go.mutate({ id: v.id, ...ganCua(b) })}
												size="xs"
												variant="ghost"
											>
												{m.nut.go}
											</Button>
										) : null}
									</span>
								))}
							</span>
						)}
					</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>
			<DetailSheetSection title={m.khung.moTa}>
				{suaDuoc ? (
					<InlineTextArea
						label={m.khung.moTa}
						maxLength={VIEC.moTaToiDa}
						onSave={(chu) =>
							sua.mutate({ id: v.id, moTa: chu === "" ? null : chu })
						}
						placeholder={m.khung.nhapMoTa}
						saving={sua.isPending && sua.variables?.moTa !== undefined}
						value={v.moTa}
					/>
				) : (
					<p className="whitespace-pre-wrap text-sm" translate="no">
						{v.moTa ?? m.khung.khongMoTa}
					</p>
				)}
			</DetailSheetSection>
			{nut.length === 0 && !daKhep ? (
				<DetailSheetSection>
					<p className="text-muted-foreground text-sm" data-chi-xem="">
						{v.trangThai === "CHO_DANH_GIA" && v.quyen.sua
							? m.khung.choNguoiGiao
							: m.khung.chiXem}
					</p>
				</DetailSheetSection>
			) : null}
		</DetailSheetBody>
	) : null;

	return (
		<>
			<RecordSheetFrame
				actions={
					v ? (
						<span className="flex flex-wrap items-center gap-2">
							<span className="flex flex-wrap gap-2" data-nut-trang-thai="">
								{nut.map((den) => (
									<Button
										disabled={doi.isPending}
										key={den}
										onClick={() => doi.mutate({ id: v.id, den })}
										size="sm"
										variant={den === "XONG" ? "default" : "outline"}
									>
										{nhanNut(m, v.trangThai, den)}
									</Button>
								))}
							</span>
							<Button
								disabled={theo.isPending || boTheo.isPending}
								onClick={() =>
									v.quyen.dangTheoDoi
										? boTheo.mutate(
												{ id: v.id },
												{
													onSuccess: () => {
														if (v.banGhi.length === 0 && !v.quyen.sua) close();
													},
												},
											)
										: theo.mutate({ id: v.id })
								}
								size="sm"
								variant="ghost"
							>
								{v.quyen.dangTheoDoi ? m.khung.boTheoDoi : m.khung.tuTheoDoi}
							</Button>
							{v.quyen.xoa ? (
								<Button
									onClick={() => setHoiXoa(true)}
									size="sm"
									variant="outline"
								>
									{m.nut.xoa}
								</Button>
							) : null}
						</span>
					) : null
				}
				description={
					v ? (
						<span translate="no">{v.banGhi[0]?.ten ?? m.khung.rieng}</span>
					) : undefined
				}
				error={q.error?.message ?? null}
				loading={q.isPending}
				lyDo={lyDoLoi(q.error)}
				note={
					daKhep && v ? (
						<Badge variant="secondary">
							{v.trangThai === "XONG" ? m.khung.daXong : m.khung.daHuy}
						</Badge>
					) : null
				}
				onRetry={() => void q.refetch()}
				onTabChange={setTab}
				tab={tab}
				tabs={
					v
						? [
								{
									value: "chi-tiet",
									label: m.khung.tabChiTiet,
									content: chiTiet,
								},
								{
									value: "lich-su",
									label: m.khung.tabLichSu,
									content: <LichSuViec viecId={viecId} />,
								},
							]
						: []
				}
				title={v ? <span translate="no">{v.tieuDe}</span> : m.khoi.tieuDe}
			/>
			<ConfirmDialog
				nut={m.xoa.nut}
				onConfirm={() => {
					if (v && !xoa.isPending) xoa.mutate({ id: v.id });
				}}
				onOpenChange={(mo) => {
					if (!mo && !xoa.isPending) setHoiXoa(false);
				}}
				open={hoiXoa}
				pending={xoa.isPending}
				than={m.xoa.than}
				thoi={m.xoa.thoi}
				tieuDe={m.xoa.tieuDe}
			/>
		</>
	);
}
