"use client";

import { AiFeedback } from "@crm/ui/components/ai-feedback";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { KaraLabel } from "@crm/ui/components/kara";
import {
	ProposedChange,
	type ProposedChangeAction,
	type ProposedChangeDecided,
	type ProposedChangeProps,
} from "@crm/ui/components/proposed-change";
import { type ReactNode, useState } from "react";
import { DE_XUAT, KR, MUC_TIEU, STATE, TOM_TAT } from "./du-lieu";

const KHONG_LAM = () => {};

function nutDeXuat(chinh: string, khoa = false): ProposedChangeAction[] {
	return [
		{
			id: "nhan",
			label: chinh,
			tone: "primary",
			onClick: KHONG_LAM,
			disabled: khoa,
		},
		{ id: "sua", label: DE_XUAT.sua, tone: "secondary", onClick: KHONG_LAM },
		{ id: "bo-qua", label: DE_XUAT.boQua, tone: "quiet", onClick: KHONG_LAM },
	];
}

function DongKr({ kr }: { kr: (typeof KR)[number] }) {
	return (
		<Item size="sm" data-kr={kr.id}>
			<ItemContent>
				<ItemTitle translate="no">{kr.ten}</ItemTitle>
			</ItemContent>
			<ItemActions>
				<ItemDescription>{kr.tienDo}</ItemDescription>
			</ItemActions>
		</Item>
	);
}

function KhungMucTieu({
	duoiKr2,
	nhan,
}: {
	duoiKr2?: ReactNode;
	nhan?: ReactNode;
}) {
	return (
		<Card data-muc-tieu="mt-1">
			<CardHeader>
				<CardTitle translate="no">{MUC_TIEU.ten}</CardTitle>
				{nhan}
			</CardHeader>
			<CardContent>
				{KR.map((kr) => (
					<div key={kr.id}>
						<DongKr kr={kr} />
						{kr.id === "kr-2" ? duoiKr2 : null}
					</div>
				))}
			</CardContent>
		</Card>
	);
}

function NhanKara() {
	return (
		<KaraLabel
			scope="OKR"
			text="2 góp ý"
			reason={MUC_TIEU.viSao}
			readAt={MUC_TIEU.docLuc}
		/>
	);
}

function DeXuatNeo(them: Partial<ProposedChangeProps>) {
	return (
		<ProposedChange
			kind="rewrite"
			label={DE_XUAT.nhan}
			before={DE_XUAT.truoc}
			value={DE_XUAT.sau}
			rationale={DE_XUAT.lyDo}
			actions={nutDeXuat(DE_XUAT.nhan, Boolean(them.lockedReason))}
			{...them}
		/>
	);
}

function DeXuatDangSua() {
	const [chu, setChu] = useState<string>(DE_XUAT.sau);
	return (
		<DeXuatNeo
			editing={{ value: chu, onChange: setChu, onCancel: KHONG_LAM }}
			actions={[
				{
					id: "nhan-ban-sua",
					label: DE_XUAT.nhanBanSua,
					tone: "primary",
					onClick: KHONG_LAM,
				},
				{
					id: "huy-sua",
					label: DE_XUAT.huy,
					tone: "quiet",
					onClick: KHONG_LAM,
				},
			]}
		/>
	);
}

function DeXuatCoBienNhan() {
	const [daQuyet, setDaQuyet] = useState<ProposedChangeDecided | undefined>({
		decision: "accepted",
		text: DE_XUAT.daNhan,
	});
	if (!daQuyet) {
		return (
			<DeXuatNeo
				actions={[
					{
						id: "nhan",
						label: DE_XUAT.nhan,
						tone: "primary",
						onClick: () =>
							setDaQuyet({ decision: "accepted", text: DE_XUAT.daNhan }),
					},
					{
						id: "bo-qua",
						label: DE_XUAT.boQua,
						tone: "quiet",
						onClick: KHONG_LAM,
					},
				]}
			/>
		);
	}
	return (
		<DeXuatNeo decided={{ ...daQuyet, onUndo: () => setDaQuyet(undefined) }} />
	);
}

function DeXuatThe() {
	return (
		<div className="flex flex-col gap-3">
			<ProposedChange
				density="card"
				kind="compact"
				label={DE_XUAT.theNhan}
				value={DE_XUAT.theSau}
				rationale={DE_XUAT.theLyDo}
				actions={nutDeXuat(DE_XUAT.theNhan)}
			/>
			<ProposedChange
				density="card"
				kind="rewrite"
				value={DE_XUAT.sau}
				decided={{
					decision: "accepted",
					text: DE_XUAT.daNhan,
					onUndo: KHONG_LAM,
				}}
				actions={[]}
			/>
		</div>
	);
}

function PhanHoi() {
	const [chon, setChon] = useState<boolean | null>(true);
	return (
		<Card>
			<CardHeader>
				<CardTitle>{TOM_TAT.tieuDe}</CardTitle>
				<NhanKara />
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<p className="text-sm" translate="no">
					{TOM_TAT.cau}
				</p>
				<AiFeedback
					value={chon}
					onChange={setChon}
					label={TOM_TAT.nhom}
					thanks={TOM_TAT.camOn}
				/>
			</CardContent>
		</Card>
	);
}

function NoiDung({ state }: { state: string }) {
	if (state === STATE.nhan) return <KhungMucTieu nhan={<NhanKara />} />;
	if (state === STATE.inlineCho)
		return <KhungMucTieu nhan={<NhanKara />} duoiKr2={<DeXuatNeo />} />;
	if (state === STATE.inlineKhoa)
		return (
			<KhungMucTieu
				nhan={<NhanKara />}
				duoiKr2={<DeXuatNeo lockedReason={DE_XUAT.khoa} />}
			/>
		);
	if (state === STATE.inlineLoi)
		return (
			<KhungMucTieu
				nhan={<NhanKara />}
				duoiKr2={<DeXuatNeo error={DE_XUAT.loi} />}
			/>
		);
	if (state === STATE.inlineSua)
		return <KhungMucTieu nhan={<NhanKara />} duoiKr2={<DeXuatDangSua />} />;
	if (state === STATE.bienNhan)
		return (
			<KhungMucTieu
				nhan={<NhanKara />}
				duoiKr2={
					<>
						<DeXuatCoBienNhan />
						<DeXuatNeo
							decided={{ decision: "dismissed", text: DE_XUAT.daBoQua }}
						/>
					</>
				}
			/>
		);
	if (state === STATE.the)
		return (
			<div className="grid gap-4 md:grid-cols-[1fr_20rem]">
				<KhungMucTieu />
				<Card>
					<CardHeader>
						<NhanKara />
					</CardHeader>
					<CardContent>
						<DeXuatThe />
					</CardContent>
				</Card>
			</div>
		);
	if (state === STATE.phanHoi) return <PhanHoi />;
	return null;
}

export function NenKaraMau({ state }: { state: string }) {
	return (
		<main
			key={state}
			data-state={state}
			className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4"
		>
			<NoiDung state={state} />
		</main>
	);
}
