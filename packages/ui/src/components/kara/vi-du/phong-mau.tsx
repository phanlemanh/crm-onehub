"use client";

import { Button } from "@crm/ui/components/button";
import { KaraArtifact } from "@crm/ui/components/kara/artifact";
import { KaraComposer } from "@crm/ui/components/kara/composer";
import {
	KaraProposal,
	KaraProposalGroup,
} from "@crm/ui/components/kara/proposal";
import { KaraState } from "@crm/ui/components/kara/state";
import { type KaraStep, KaraSteps } from "@crm/ui/components/kara/steps";
import {
	KaraCheckpoint,
	KaraSystemLine,
	KaraTranscript,
	KaraTurn,
} from "@crm/ui/components/kara/transcript";
import { type CSSProperties, type ReactNode, useState } from "react";
import { VI_DU } from "./du-lieu";

type TrangThaiDong = "cho" | "nhan" | "bo";

function buoc(trangThai: KaraStep["state"][]): KaraStep[] {
	return VI_DU.buoc.map((b, i) => ({ ...b, state: trangThai[i] ?? "done" }));
}

function HoiThoai({
	buocChay,
	rong = false,
	onRetry,
}: {
	buocChay?: KaraStep[];
	rong?: boolean;
	onRetry?: () => void;
}) {
	if (rong) return <KaraTranscript />;
	return (
		<KaraTranscript>
			<KaraTurn from="user">{VI_DU.nguoiHoi}</KaraTurn>
			<KaraTurn from="kara">
				<div className="flex flex-col gap-2">
					<KaraSteps
						steps={buocChay ?? buoc(["done", "done", "done"])}
						onRetry={onRetry}
					/>
					<p>{VI_DU.karaTraLoi}</p>
				</div>
			</KaraTurn>
			<KaraCheckpoint summary={VI_DU.moc} onSelect={() => {}} />
			<KaraSystemLine>{VI_DU.heThong}</KaraSystemLine>
		</KaraTranscript>
	);
}

function BanNhap({ nhanSan = false }: { nhanSan?: boolean }) {
	const [dong, datDong] = useState<Record<string, TrangThaiDong>>(() =>
		Object.fromEntries(
			VI_DU.deXuat.map((d) => [d.id, nhanSan && d.dongNhom ? "nhan" : "cho"]),
		),
	);
	const [nhom, datNhom] = useState<string[] | null>(
		nhanSan ? VI_DU.deXuat.filter((d) => d.dongNhom).map((d) => d.id) : null,
	);
	const doi = (id: string, t: TrangThaiDong) =>
		datDong((cu) => ({ ...cu, [id]: t }));
	return (
		<KaraProposalGroup
			entries={VI_DU.deXuat.map((d) => ({
				id: d.id,
				status: dong[d.id] === "cho" ? "pending" : "decided",
				batchable: d.dongNhom,
			}))}
			reason={VI_DU.viSao}
			batch={{
				label: VI_DU.nhanCaNhom,
				onAccept: (ids) => {
					datDong((cu) => ({
						...cu,
						...Object.fromEntries(ids.map((i) => [i, "nhan"])),
					}));
					datNhom(ids);
				},
			}}
			batchDecided={
				nhom
					? {
							text: VI_DU.nhanNhom(nhom.length),
							onUndo: () => {
								datDong((cu) => ({
									...cu,
									...Object.fromEntries(nhom.map((i) => [i, "cho"])),
								}));
								datNhom(null);
							},
						}
					: undefined
			}
		>
			<KaraProposal
				kind="rewrite"
				value={VI_DU.daQuyet.chu}
				actions={[]}
				decided={{
					decision: "accepted",
					text: VI_DU.daQuyet.chu,
					onUndo: () => {},
				}}
			/>
			{VI_DU.deXuat.map((d) =>
				nhom?.includes(d.id) ? null : (
					<KaraProposal
						key={d.id}
						kind="rewrite"
						label={d.nhan}
						before={d.truoc}
						value={d.sau}
						rationale={d.lyDo}
						decided={
							dong[d.id] === "cho"
								? undefined
								: {
										decision: dong[d.id] === "nhan" ? "accepted" : "skipped",
										text: `${d.nhan} · ${dong[d.id] === "nhan" ? d.nut : VI_DU.boQuaNut}`,
										onUndo: () => doi(d.id, "cho"),
									}
						}
						actions={[
							{
								id: "nhan",
								label: d.nut,
								tone: "primary",
								onClick: () => doi(d.id, "nhan"),
							},
							{
								id: "sua",
								label: VI_DU.suaNut,
								tone: "secondary",
								onClick: () => {},
							},
							{
								id: "bo",
								label: VI_DU.boQuaNut,
								tone: "quiet",
								onClick: () => doi(d.id, "bo"),
							},
						]}
					/>
				),
			)}
		</KaraProposalGroup>
	);
}

function ChanBanNhap() {
	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<Button variant="link" size="sm" type="button">
				{VI_DU.conThieu}
			</Button>
			<Button size="sm" type="button">
				{VI_DU.duaVao}
			</Button>
		</div>
	);
}

function Khung({
	trai,
	phai,
	pane,
}: {
	trai: ReactNode;
	phai: ReactNode;
	pane?: number;
}) {
	const cot: CSSProperties | undefined = pane
		? { gridTemplateColumns: `380px ${pane}px` }
		: undefined;
	return (
		<div
			data-phong-mau-khung=""
			style={cot}
			className="grid min-h-dvh grid-cols-1 gap-4 p-4 md:h-dvh md:grid-cols-[380px_minmax(0,1fr)]"
		>
			<div
				data-phong-mau-vung="hoi-thoai"
				className="flex min-h-0 min-w-0 flex-col gap-2"
			>
				{trai}
			</div>
			<div data-phong-mau-vung="ban-nhap" className="min-h-0 min-w-0">
				{phai}
			</div>
		</div>
	);
}

function OSoan({
	ban = false,
	khoa,
	chip = true,
}: {
	ban?: boolean;
	khoa?: ReactNode;
	chip?: boolean;
}) {
	return (
		<KaraComposer
			onSubmit={() => {}}
			onStop={() => {}}
			status={ban ? "busy" : "ready"}
			label={VI_DU.nhanO}
			placeholder={VI_DU.goiYGo}
			context={chip ? { label: VI_DU.nguCanh, onRemove: () => {} } : undefined}
			suggestions={ban || khoa ? undefined : VI_DU.goiY}
			suggestionsLabel={VI_DU.nhanGoiY}
			onSuggestion={() => {}}
			lockedReason={khoa}
		/>
	);
}

function BanNhapKhung({
	children,
	ban = false,
}: {
	children: ReactNode;
	ban?: boolean;
}) {
	return (
		<KaraArtifact
			title={VI_DU.tieuDe}
			meta={VI_DU.phamVi}
			actions={
				<Button variant="ghost" size="sm" type="button">
					{VI_DU.chiDongCho}
				</Button>
			}
			footer={<ChanBanNhap />}
			busy={ban ? { label: VI_DU.dangSoan } : null}
		>
			{children}
		</KaraArtifact>
	);
}

export type PhongMauTrangThai = {
	id: string;
	ve: (pane?: number) => ReactNode;
};

export const TRANG_THAI: readonly PhongMauTrangThai[] = [
	{
		id: "ST-phongmau-hoi-thoai",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai />
						<OSoan />
					</>
				}
				phai={
					<BanNhapKhung>
						<BanNhap />
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-hoi-thoai-rong",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai rong />
						<OSoan chip={false} />
					</>
				}
				phai={
					<BanNhapKhung>
						<KaraState
							kind="empty"
							title={VI_DU.khongThay}
							description={VI_DU.viSaoRong}
						/>
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-dang-soan",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai buocChay={buoc(["done", "running", "done"])} />
						<OSoan ban />
					</>
				}
				phai={
					<BanNhapKhung ban>
						<BanNhap />
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-ban-nhap",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai />
						<OSoan />
					</>
				}
				phai={
					<BanNhapKhung>
						<BanNhap />
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-nhan-nhom",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai />
						<OSoan />
					</>
				}
				phai={
					<BanNhapKhung>
						<BanNhap nhanSan />
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-buoc-loi",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai
							buocChay={buoc(["done", "done", "error"])}
							onRetry={() => {}}
						/>
						<OSoan />
					</>
				}
				phai={
					<BanNhapKhung>
						<BanNhap />
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-loi",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai />
						<OSoan />
					</>
				}
				phai={
					<BanNhapKhung>
						<KaraState
							kind="error"
							what={VI_DU.viecHong}
							description={VI_DU.moTaHong}
							onRetry={() => {}}
						/>
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-rong",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai />
						<OSoan />
					</>
				}
				phai={
					<BanNhapKhung>
						<KaraState
							kind="empty"
							title={VI_DU.khongThay}
							description={VI_DU.viSaoRong}
						/>
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-tat",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai />
						<OSoan khoa={VI_DU.hetLuot} chip={false} />
					</>
				}
				phai={
					<BanNhapKhung>
						<KaraState kind="off" reason={VI_DU.hetLuot} />
					</BanNhapKhung>
				}
			/>
		),
	},
	{
		id: "ST-phongmau-chua-cau-hinh",
		ve: (pane) => (
			<Khung
				pane={pane}
				trai={
					<>
						<HoiThoai rong />
						<OSoan khoa={VI_DU.aiBat} chip={false} />
					</>
				}
				phai={
					<BanNhapKhung>
						<KaraState kind="unconfigured" description={VI_DU.aiBat} />
					</BanNhapKhung>
				}
			/>
		),
	},
];

export function PhongMau({ state, pane }: { state: string; pane?: number }) {
	const muc = TRANG_THAI.find((t) => t.id === state) ?? TRANG_THAI[0];
	return <>{muc?.ve(pane)}</>;
}
