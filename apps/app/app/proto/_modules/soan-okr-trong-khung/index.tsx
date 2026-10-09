"use client";

import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import { KaraMark } from "@crm/ui/components/kara";
import { KaraArtifact } from "@crm/ui/components/kara/artifact";
import { KaraComposer } from "@crm/ui/components/kara/composer";
import {
	KaraDock,
	KaraDockBody,
	KaraDockFooter,
	KaraDockHeader,
} from "@crm/ui/components/kara/dock";
import {
	KaraProposal,
	KaraProposalGroup,
} from "@crm/ui/components/kara/proposal";
import { KaraState } from "@crm/ui/components/kara/state";
import {
	KaraCheckpoint,
	KaraSystemLine,
	KaraTranscript,
	KaraTurn,
} from "@crm/ui/components/kara/transcript";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useState } from "react";
import { DetailSheet, DetailSheetHeader } from "@/components/detail-sheet";
import {
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	type DongMau,
	SOAN_MAU as M,
	NHOM_MAU,
	type NhomMau,
} from "../soan-okr-trang-rieng/du-lieu";

type Quyet = "cho" | "nhan" | "bo";

type Hinh = {
	hoiThoai:
		| "chao"
		| "mo-dau"
		| "mot-moc"
		| "hai-moc"
		| "loi"
		| "het-luot"
		| "dang-mo";
	banNhap:
		| "dang-mo"
		| "dang-soan-dau"
		| "co-nhap"
		| "da-quyet"
		| "con-thieu"
		| "da-dua-vao"
		| "khong-mo";
	ban?: boolean;
	chip?: boolean;
	noi?: string;
	hep?: boolean;
	chiKara?: boolean;
	hoiDong?: boolean;
	loiKhung?: "khong-mo" | "chua-cau-hinh";
};

const HINH = {
	"ST-khung-dang-mo": {
		hoiThoai: "dang-mo",
		banNhap: "dang-mo",
		chiKara: true,
	},
	"ST-khung-hep-rong": { hoiThoai: "chao", banNhap: "dang-mo", chiKara: true },
	"ST-khung-dang-soan-dau": {
		hoiThoai: "mo-dau",
		banNhap: "dang-soan-dau",
		chiKara: true,
		ban: true,
	},
	"ST-khung-rong": { hoiThoai: "mot-moc", banNhap: "co-nhap" },
	"ST-khung-rong-dang-soan": {
		hoiThoai: "hai-moc",
		banNhap: "co-nhap",
		ban: true,
	},
	"ST-khung-hoi-dong": {
		hoiThoai: "hai-moc",
		banNhap: "co-nhap",
		ban: true,
		hoiDong: true,
	},
	"ST-khung-khong-mo": {
		hoiThoai: "dang-mo",
		banNhap: "khong-mo",
		chiKara: true,
		loiKhung: "khong-mo",
	},
	"ST-khung-chua-cau-hinh": {
		hoiThoai: "dang-mo",
		banNhap: "dang-mo",
		chiKara: true,
		loiKhung: "chua-cau-hinh",
	},
	"ST-khung-da-dua-vao": { hoiThoai: "hai-moc", banNhap: "da-dua-vao" },
	"ST-khung-dien-thoai": { hoiThoai: "hai-moc", banNhap: "co-nhap", hep: true },
} satisfies Record<string, Hinh>;

function laHinh(s: string): s is keyof typeof HINH {
	return s in HINH;
}

function HoiThoai({ h }: { h: Hinh }) {
	if (h.hoiThoai === "chao") {
		return (
			<KaraTranscript>
				<KaraTurn from="kara">{CHU.chao}</KaraTurn>
			</KaraTranscript>
		);
	}
	if (h.hoiThoai === "dang-mo") {
		return <KaraState kind="working" label={M.dangMo} delayMs={0} />;
	}
	if (h.hoiThoai === "mo-dau") {
		return (
			<KaraTranscript>
				<KaraTurn from="kara">
					<KaraState kind="working" label={M.dangDoc} delayMs={0} />
				</KaraTurn>
			</KaraTranscript>
		);
	}
	const hai = h.hoiThoai !== "mot-moc";
	return (
		<KaraTranscript>
			<KaraTurn from="user">{M.nguoiHoi}</KaraTurn>
			<KaraTurn from="kara">{M.karaTraLoi}</KaraTurn>
			<KaraCheckpoint summary={M.mocDau} onSelect={() => {}} />
			{hai ? (
				<>
					<KaraSystemLine>{M.heThong}</KaraSystemLine>
					<KaraTurn from="user">{M.nguoiHoi2}</KaraTurn>
					<KaraTurn from="kara">{M.karaTraLoi2}</KaraTurn>
					<KaraCheckpoint summary={M.mocDoi} onSelect={() => {}} />
				</>
			) : null}
			{h.hoiThoai === "loi" ? (
				<KaraState
					kind="error"
					what={M.traLoi}
					description={M.traLoiMoTa}
					onRetry={() => {}}
				/>
			) : null}
			{h.banNhap === "da-quyet" ? (
				<KaraSystemLine>{M.seGui}</KaraSystemLine>
			) : null}
		</KaraTranscript>
	);
}

function OSoan({ h }: { h: Hinh }) {
	const hetLuot = h.hoiThoai === "het-luot";
	return (
		<div className="flex flex-col gap-2">
			<KaraComposer
				onSubmit={() => {}}
				onStop={() => {}}
				status={h.ban ? "busy" : "ready"}
				label={M.nhanO}
				placeholder={M.goiYGo}
				context={h.chip ? { label: M.nguCanh, onRemove: () => {} } : undefined}
				suggestions={h.ban || hetLuot ? undefined : M.goiY}
				suggestionsLabel={M.nhanGoiY}
				onSuggestion={() => {}}
				lockedReason={hetLuot ? M.hetLuot : undefined}
			/>
			{hetLuot ? (
				<Button variant="outline" size="sm" className="w-fit">
					{M.moCuocMoi}
				</Button>
			) : null}
		</div>
	);
}

function OSo({
	id,
	nhan,
	donVi,
	giaTri,
}: {
	id: string;
	nhan: string;
	donVi: string;
	giaTri: string;
}) {
	const [chu, datChu] = useState(giaTri);
	return (
		<Field data-invalid={chu === "" || undefined}>
			<FieldLabel htmlFor={id}>{nhan}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					id={id}
					inputMode="decimal"
					autoComplete="off"
					value={chu}
					onChange={(e) => datChu(e.currentTarget.value)}
					translate="no"
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupText translate="no">{donVi}</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</Field>
	);
}

function OSoDong({ d }: { d: DongMau }) {
	if (d.loai === "kr-moc") return <FieldDescription>{M.moc}</FieldDescription>;
	if (!d.so) return null;
	return (
		<div className="grid grid-cols-2 gap-3">
			<OSo
				id={`khoi-${d.id}`}
				nhan={M.khoiDiem}
				donVi={d.donVi ?? ""}
				giaTri={d.so.khoiDiem}
			/>
			<OSo
				id={`dich-${d.id}`}
				nhan={M.dich}
				donVi={d.donVi ?? ""}
				giaTri={d.so.dich}
			/>
		</div>
	);
}

const NHAN_DONG = {
	"vua-them": M.vuaThem,
	"vua-sua": M.vuaSua,
	"vua-chuyen": M.vuaChuyen,
} as const;

const NUT_THEM = {
	kr: "Thêm KR",
	"kr-moc": "Thêm KR",
	"can-chinh": "Thêm căn chỉnh",
} as const;

const NHAN_LOAI = {
	kr: "KR",
	"kr-moc": "KR mốc",
	"can-chinh": "Căn chỉnh",
} as const;

function nut(
	them: string,
	coSua: boolean,
	doi: (q: Quyet) => void,
): {
	id: string;
	label: string;
	tone: "primary" | "secondary" | "quiet";
	onClick: () => void;
}[] {
	return [
		{ id: "nhan", label: them, tone: "primary", onClick: () => doi("nhan") },
		...(coSua
			? [
					{
						id: "sua",
						label: M.sua,
						tone: "secondary" as const,
						onClick: () => {},
					},
				]
			: []),
		{ id: "bo", label: M.boQua, tone: "quiet", onClick: () => doi("bo") },
		{ id: "hoi", label: M.hoiKara, tone: "quiet", onClick: () => {} },
	];
}

function daQuyet(q: Quyet, nhan: string, ten: string, hoan: () => void) {
	if (q === "cho") return undefined;
	return {
		decision: q === "nhan" ? ("accepted" as const) : ("skipped" as const),
		text: `${q === "nhan" ? "Đã thêm" : "Đã bỏ qua"} ${nhan} · ${ten}`,
		onUndo: hoan,
	};
}

function DongKr({
	d,
	q,
	doi,
	khoa,
}: {
	d: DongMau;
	q: Quyet;
	doi: (q: Quyet) => void;
	khoa: boolean;
}) {
	const nhan = NHAN_LOAI[d.loai];
	const coSo = d.loai !== "can-chinh";
	return (
		<div className="flex flex-col gap-2" data-the-kr={d.id}>
			<KaraProposal
				kind="compact"
				data-dong={d.id}
				label={nhan}
				tag={d.nhan ? NHAN_DONG[d.nhan] : undefined}
				value={<span translate="no">{d.ten}</span>}
				before={d.truoc}
				rationale={d.viSao}
				fields={coSo && q === "cho" ? <OSoDong d={d} /> : undefined}
				decided={daQuyet(q, nhan, d.ten, () => doi("cho"))}
				actions={khoa ? [] : nut(NUT_THEM[d.loai], coSo, doi)}
			/>
			{coSo && q === "nhan" ? <OSoDong d={d} /> : null}
		</div>
	);
}

function duSo(d: DongMau): boolean {
	return (
		d.loai === "kr-moc" ||
		(d.so !== undefined && d.so.khoiDiem !== "" && d.so.dich !== "")
	);
}

function Nhom({
	n,
	batDau,
	khoa,
	noi,
}: {
	n: NhomMau;
	batDau: Quyet;
	khoa: boolean;
	noi: boolean;
}) {
	const [q, datQ] = useState<Record<string, Quyet>>(() =>
		Object.fromEntries(
			[n.id, ...n.dong.map((d) => d.id)].map((id) => [id, batDau]),
		),
	);
	const [nhom, datNhom] = useState<string[] | null>(null);
	const doi = (id: string) => (moi: Quyet) =>
		datQ((cu) => ({ ...cu, [id]: moi }));
	const nhanMt = `Mục tiêu ${n.stt} · ${n.loai}`;
	const ganNhom = n.dong
		.filter((d) => d.loai !== "can-chinh" && duSo(d))
		.map((d) => d.id);
	return (
		<KaraProposalGroup
			entries={[n.id, ...n.dong.map((d) => d.id)].map((id) => ({
				id,
				status: q[id] === "cho" ? "pending" : "decided",
				batchable: id === n.id || ganNhom.includes(id),
			}))}
			scope={nhanMt}
			reason={n.viSao}
			batch={
				q[n.id] === "cho" && !khoa
					? {
							label: M.themNhom(ganNhom.length),
							onAccept: () => {
								const ids = [n.id, ...ganNhom];
								datQ((cu) => ({
									...cu,
									...Object.fromEntries(ids.map((i) => [i, "nhan"])),
								}));
								datNhom(ids);
							},
						}
					: undefined
			}
			batchDecided={
				nhom
					? {
							text: M.daThemNhom(nhom.length - 1),
							onUndo: () => {
								datQ((cu) => ({
									...cu,
									...Object.fromEntries(nhom.map((i) => [i, "cho"])),
								}));
								datNhom(null);
							},
						}
					: undefined
			}
		>
			<div data-noi={noi ? "" : undefined}>
				<KaraProposal
					kind="compact"
					data-dong={n.id}
					label={nhanMt}
					tag={n.nhan ? NHAN_DONG[n.nhan] : undefined}
					before={n.truoc}
					value={<span translate="no">{n.ten}</span>}
					decided={daQuyet(q[n.id] ?? "cho", nhanMt, n.ten, () =>
						doi(n.id)("cho"),
					)}
					actions={khoa ? [] : nut("Thêm Mục tiêu", true, doi(n.id))}
				/>
			</div>
			{q[n.id] === "bo"
				? null
				: n.dong.map((d) => (
						<DongKr
							key={d.id}
							d={d}
							q={q[d.id] ?? "cho"}
							doi={doi(d.id)}
							khoa={khoa}
						/>
					))}
		</KaraProposalGroup>
	);
}

function ChanBanNhap({ h }: { h: Hinh }) {
	if (h.banNhap === "da-dua-vao") return null;
	const thieu = h.banNhap === "con-thieu";
	return (
		<div className="flex flex-col gap-2">
			{thieu ? (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-muted-foreground">{M.conThieu}:</span>
					<Button variant="link" size="sm" className="px-0">
						{M.conThieuMuc}
					</Button>
				</div>
			) : (
				<FieldDescription>{M.duaVaoMoTa}</FieldDescription>
			)}
			<Button className="w-fit" disabled={thieu || h.ban}>
				{thieu ? M.duaVaoKhoa : M.duaVao}
			</Button>
		</div>
	);
}

function ThanBanNhap({ h }: { h: Hinh }) {
	switch (h.banNhap) {
		case "dang-mo":
			return <KaraState kind="working" label={M.dangMo} delayMs={0} />;
		case "dang-soan-dau":
			return <KaraState kind="working" label={M.dangSoanDau} delayMs={0} />;
		case "khong-mo":
			return (
				<KaraState
					kind="error"
					what={M.khongMo}
					description={M.khongMoMoTa}
					onRetry={() => {}}
				/>
			);
		default: {
			const batDau: Quyet = h.banNhap === "co-nhap" ? "cho" : "nhan";
			const xong = h.banNhap === "da-dua-vao";
			return (
				<div className="flex flex-col gap-6">
					{xong ? (
						<KaraState kind="empty" title={M.daTao} description={M.daTaoMoTa} />
					) : null}
					{NHOM_MAU.map((n) => (
						<Nhom
							key={`${h.banNhap}-${n.id}`}
							n={n}
							batDau={batDau}
							khoa={xong}
							noi={h.noi === n.id}
						/>
					))}
				</div>
			);
		}
	}
}

const CHO_HOI_MS = 600;

const CHU = {
	chao: "Nói điều bạn đã biết về phòng này, mục tiêu của quý và điều đang vướng. Tôi soạn bản nháp đầu, bạn quyết từng dòng.",
	nen: "Theo đơn vị",
	nenMoTa: "Mục tiêu và KR của từng phòng trong chu kỳ đang chọn.",
	hoiTieuDe: "Kara đang soạn. Đóng khung?",
	hoiThan:
		"Lượt này vẫn chạy khi bạn đóng. Mở lại cuộc soạn để xem bản nháp mới.",
	hoiDong: "Đóng",
	hoiO: "Ở lại",
	chuaCauHinh: "Kara chưa được bật cho không gian làm việc này.",
} as const;

function CotKara({ h, motMinh }: { h: Hinh; motMinh?: boolean }) {
	return (
		<KaraDock
			side={motMinh ? "fill" : "rail"}
			alone={motMinh}
			aria-label={M.tabTroChuyen}
			data-o="hoi-thoai"
		>
			<KaraDockHeader>
				<KaraMark scope={M.luot} />
				{h.ban ? <KaraState kind="working" label={M.dangSoan} /> : null}
			</KaraDockHeader>
			<KaraDockBody scroll={false}>
				<HoiThoai h={h} />
			</KaraDockBody>
			<KaraDockFooter>
				<OSoan h={h} />
			</KaraDockFooter>
		</KaraDock>
	);
}

function OBanNhap({ h, trongTab }: { h: Hinh; trongTab?: boolean }) {
	const coNhap = !["dang-mo", "khong-mo"].includes(h.banNhap);
	return (
		<KaraDock
			side="fill"
			alone={trongTab}
			aria-label={M.banNhap}
			data-o="ban-nhap"
		>
			<KaraArtifact
				variant="docked"
				title={M.banNhap}
				meta={coNhap ? M.meta : undefined}
				actions={
					coNhap ? (
						<Button variant="ghost" size="sm" type="button">
							{M.chiDongCho}
						</Button>
					) : undefined
				}
				footer={
					coNhap && h.banNhap !== "da-dua-vao" ? (
						<ChanBanNhap h={h} />
					) : undefined
				}
				busy={h.ban ? { label: M.dangSoan, reasonShown: true } : null}
			>
				<ThanBanNhap h={h} />
			</KaraArtifact>
		</KaraDock>
	);
}

function HaiTab({ h }: { h: Hinh }) {
	return (
		<KaraDock side="fill" alone>
			<Tabs
				defaultValue="ban-nhap"
				className="flex min-h-0 flex-1 flex-col gap-0"
			>
				<TabsList
					variant="line"
					className="w-full shrink-0 justify-start border-b px-4"
				>
					<TabsTrigger value="tro-chuyen">{M.tabTroChuyen}</TabsTrigger>
					<TabsTrigger value="ban-nhap">{M.tabBanNhap}</TabsTrigger>
				</TabsList>
				<TabsContent
					value="tro-chuyen"
					className="flex min-h-0 flex-1 flex-col"
				>
					<CotKara h={h} motMinh />
				</TabsContent>
				<TabsContent value="ban-nhap" className="flex min-h-0 flex-1 flex-col">
					<OBanNhap h={h} trongTab />
				</TabsContent>
			</Tabs>
		</KaraDock>
	);
}

function ThanKhung({ h }: { h: Hinh }) {
	if (h.loiKhung === "khong-mo")
		return (
			<div className="p-4">
				<KaraState
					kind="error"
					what={M.khongMo}
					description={M.khongMoMoTa}
					onRetry={() => {}}
				/>
			</div>
		);
	if (h.loiKhung === "chua-cau-hinh")
		return (
			<div className="p-4">
				<KaraState kind="unconfigured" description={CHU.chuaCauHinh} />
			</div>
		);
	if (h.chiKara) return <CotKara h={h} />;
	if (h.hep) return <HaiTab h={h} />;
	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col lg:hidden">
				<HaiTab h={h} />
			</div>
			<div className="hidden min-h-0 flex-1 lg:flex">
				<OBanNhap h={h} />
				<CotKara h={h} />
			</div>
		</>
	);
}

export function SoanOkrTrongKhungMau({ state }: { state: string }) {
	const h: Hinh = HINH[laHinh(state) ? state : "ST-khung-rong"];
	const [hoi, datHoi] = useState(false);
	useMountEffect(() => {
		if (!h.hoiDong) return;
		const hen = setTimeout(() => datHoi(true), CHO_HOI_MS);
		return () => clearTimeout(hen);
	});
	return (
		<div data-soan-khung={state}>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{CHU.nen}</PageShellTitle>
					<PageShellDescription>{CHU.nenMoTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<DetailSheet open onOpenChange={() => {}} size="kara">
				<DetailSheetHeader
					title={M.tieuDe}
					description={
						<>
							<span translate="no">{M.donVi}</span> · {M.chuKy}
						</>
					}
				/>
				<div className="flex min-h-0 flex-1 flex-col">
					<ThanKhung h={h} />
				</div>
			</DetailSheet>
			<ConfirmDialog
				tieuDe={CHU.hoiTieuDe}
				than={CHU.hoiThan}
				nut={CHU.hoiDong}
				thoi={CHU.hoiO}
				open={hoi}
				onOpenChange={datHoi}
				onConfirm={() => datHoi(false)}
				pending={false}
			/>
		</div>
	);
}
