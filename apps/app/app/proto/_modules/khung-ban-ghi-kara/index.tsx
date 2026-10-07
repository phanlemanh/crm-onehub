"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import LogoLinkedin from "@carbon/icons-react/es/LogoLinkedin";
import {
	Attachment,
	AttachmentContent,
	AttachmentGroup,
	AttachmentMedia,
	AttachmentTitle,
} from "@crm/ui/components/attachment";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { KaraLabel, KaraMark } from "@crm/ui/components/kara";
import { KaraComposer } from "@crm/ui/components/kara/composer";
import { KaraProposal } from "@crm/ui/components/kara/proposal";
import { KaraRetry, KaraState } from "@crm/ui/components/kara/state";
import { KaraSteps } from "@crm/ui/components/kara/steps";
import { KaraTurn } from "@crm/ui/components/kara/transcript";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { CHU, NGUOI } from "./du-lieu";

type Tab = "tong-quan" | "thoa-thuan" | "hoat-dong" | "kara";

function tabTheoState(state: string): Tab {
	if (state === "ST-them-nhanh-hoi") return "thoa-thuan";
	if (
		state.startsWith("ST-de-xuat") ||
		state === "ST-khung-loi" ||
		state === "ST-tra-cuu-dang-chay"
	)
		return "tong-quan";
	return "kara";
}

function TabKara({ state }: { state: string }) {
	if (state === "ST-kara-dang-mo") {
		return (
			<div className="flex flex-1 items-center justify-center p-5">
				<KaraState kind="working" label={CHU.dangMo} delayMs={0} />
			</div>
		);
	}

	const coLoi = [
		"ST-kara-dang-lam",
		"ST-kara-tra-loi",
		"ST-kara-loi",
		"ST-kara-ban",
		"ST-kara-ket-thuc",
	].includes(state);
	const lyDoKhoa =
		state === "ST-kara-ban"
			? CHU.ban
			: state === "ST-kara-ket-thuc"
				? CHU.ketThuc
				: undefined;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
				{state === "ST-kara-rong" ? (
					<Empty>
						<EmptyHeader>
							<KaraMark />
							<EmptyTitle>{CHU.rongTieuDe}</EmptyTitle>
							<EmptyDescription>{CHU.rongMoTa}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : null}

				{coLoi ? (
					<>
						<KaraTurn from="user">{CHU.cauHoi}</KaraTurn>
						<KaraSteps
							steps={
								state === "ST-kara-dang-lam"
									? CHU.buoc
									: CHU.buoc.map((b) => ({ ...b, state: "done" as const }))
							}
						/>
						<AttachmentGroup>
							<Attachment size="xs" state="done">
								<AttachmentMedia variant="icon">
									<Icon icon={LogoLinkedin} />
								</AttachmentMedia>
								<AttachmentContent>
									<AttachmentTitle>{CHU.nguon}</AttachmentTitle>
								</AttachmentContent>
							</Attachment>
						</AttachmentGroup>
						{state === "ST-kara-dang-lam" || state === "ST-kara-loi" ? null : (
							<KaraTurn from="kara">{CHU.traLoi}</KaraTurn>
						)}
					</>
				) : null}

				{state === "ST-kara-loi" ? (
					<KaraState
						kind="error"
						what={CHU.chuaTraLoi}
						description={CHU.loiMoTa}
						onRetry={() => {}}
					/>
				) : null}

				{state === "ST-kara-chua-bat" ? (
					<KaraState kind="unconfigured" description={CHU.chuaBatMoTa} />
				) : null}
			</div>

			<div className="flex flex-col gap-2 border-t px-5 py-3">
				{state === "ST-kara-ket-thuc" ? (
					<div>
						<Button variant="outline" size="sm">
							{CHU.batDauMoi}
						</Button>
					</div>
				) : null}
				<KaraComposer
					onSubmit={() => {}}
					status={state === "ST-kara-dang-lam" ? "busy" : "ready"}
					placeholder={CHU.choNhap}
					label={CHU.choNhap}
					suggestions={state === "ST-kara-rong" ? CHU.goiY : undefined}
					suggestionsLabel={CHU.nhanGoiY}
					onSuggestion={() => {}}
					lockedReason={
						state === "ST-kara-chua-bat" ? CHU.chuaBatMoTa : lyDoKhoa
					}
				/>
			</div>
		</div>
	);
}

function DeXuat({ state }: { state: string }) {
	const [daQuyet, datDaQuyet] = useState<"nhan" | "bo" | "loi" | null>(
		state === "ST-de-xuat-da-nhan"
			? "nhan"
			: state === "ST-de-xuat-da-bo"
				? "bo"
				: state === "ST-de-xuat-hoan-tac-loi"
					? "loi"
					: null,
	);

	if (daQuyet === "loi") {
		return (
			<p className="text-destructive text-xs" role="status">
				{CHU.hoanTacLoi}
			</p>
		);
	}

	return (
		<KaraProposal
			density="inline"
			kind="compact"
			value={<span translate="no">{CHU.deXuatGiaTri}</span>}
			rationale={CHU.deXuatLyDo}
			decided={
				daQuyet === "nhan"
					? {
							decision: "accepted",
							text: CHU.daThem,
							onUndo: () => datDaQuyet(null),
						}
					: daQuyet === "bo"
						? {
								decision: "dismissed",
								text: CHU.daBo,
								onUndo: () => datDaQuyet(null),
							}
						: undefined
			}
			actions={[
				{
					id: "thay",
					label: CHU.thayGiaTri,
					tone: "primary",
					onClick: () => datDaQuyet("nhan"),
				},
				{
					id: "bo",
					label: CHU.boQua,
					tone: "quiet",
					onClick: () => datDaQuyet("bo"),
				},
			]}
		/>
	);
}

function TongQuan({ state }: { state: string }) {
	if (state === "ST-khung-loi") {
		return (
			<div className="flex flex-1 items-center justify-center p-5">
				<Empty border="solid" size="compact">
					<EmptyHeader>
						<EmptyTitle>{CHU.khungLoiTieuDe}</EmptyTitle>
						<EmptyDescription>{CHU.khungLoiMoTa}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<KaraRetry onClick={() => {}} />
					</EmptyContent>
				</Empty>
			</div>
		);
	}

	const coDeXuat = state.startsWith("ST-de-xuat");

	return (
		<DetailSheetBody>
			<DetailSheetSection
				title={CHU.chiTiet}
				action={
					coDeXuat ? (
						<KaraLabel
							scope={CHU.nhanKara(1)}
							reason={CHU.viSao}
							readAt={CHU.docLuc}
						/>
					) : undefined
				}
			>
				<DetailSheetProperties>
					<DetailSheetProperty label={CHU.email}>
						<span translate="no">{NGUOI.email}</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={CHU.chucDanh}>
						<div className="flex flex-col gap-2">
							<span translate="no">{NGUOI.chucDanh}</span>
							{coDeXuat ? <DeXuat state={state} /> : null}
						</div>
					</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

function ThemNhanh({ state }: { state: string }) {
	return (
		<div className="flex flex-col gap-3 px-5 py-4">
			<Field>
				<FieldLabel htmlFor="kbk-ho-ten">{CHU.hoTen}</FieldLabel>
				<Input id="kbk-ho-ten" defaultValue={CHU.daGo} translate="no" />
			</Field>
			<div className="flex gap-2">
				<Button size="sm">{CHU.luu}</Button>
				<Button size="sm" variant="ghost">
					{CHU.huy}
				</Button>
			</div>
			<ConfirmDialog
				open={state === "ST-them-nhanh-hoi"}
				onOpenChange={() => {}}
				tieuDe={CHU.boTieuDe}
				than={CHU.boMoTa}
				nut={CHU.boDi}
				thoi={CHU.tiepTuc}
				pending={false}
				tone="destructive"
				onConfirm={() => {}}
			/>
		</div>
	);
}

export function KhungBanGhiKaraMau({ state }: { state: string }) {
	const [tab, datTab] = useState<Tab>(tabTheoState(state));
	const dangTraCuu = state === "ST-tra-cuu-dang-chay";

	return (
		<LocaleProvider locale="vi">
			<DetailSheet open onOpenChange={() => {}}>
				<DetailSheetHeader
					title={<span translate="no">{NGUOI.ten}</span>}
					description={<span translate="no">{NGUOI.congTy}</span>}
					actions={
						<Button variant="outline" size="sm" disabled={dangTraCuu}>
							{dangTraCuu ? null : (
								<Icon data-icon="inline-start" icon={AiGenerate} />
							)}
							{dangTraCuu ? CHU.dangTraCuu : CHU.traCuu}
						</Button>
					}
				/>
				<DetailSheetTabs
					value={tab}
					onValueChange={(v) => datTab(v as Tab)}
					tabs={[
						{
							value: "tong-quan",
							label: CHU.tabTongQuan,
							content: <TongQuan state={state} />,
						},
						{
							value: "thoa-thuan",
							label: CHU.tabThoaThuan,
							content: <ThemNhanh state={state} />,
						},
						{ value: "hoat-dong", label: CHU.tabHoatDong, content: null },
						{
							value: "kara",
							label: CHU.tabKara,
							content: <TabKara state={state} />,
							keepMounted: true,
						},
					]}
				/>
			</DetailSheet>
		</LocaleProvider>
	);
}
