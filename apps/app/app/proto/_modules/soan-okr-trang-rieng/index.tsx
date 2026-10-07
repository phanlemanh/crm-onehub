"use client";

import { Button } from "@crm/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import { KaraArtifact } from "@crm/ui/components/kara/artifact";
import { KaraComposer } from "@crm/ui/components/kara/composer";
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
import { useState } from "react";
import {
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { type DongMau, NHOM_MAU, type NhomMau, SOAN_MAU as M } from "./du-lieu";

type Quyet = "cho" | "nhan" | "bo";

type Hinh = {
	hoiThoai: "mo-dau" | "mot-moc" | "hai-moc" | "loi" | "het-luot" | "dang-mo";
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
};

const HINH = {
	"ST-soan-dang-mo": { hoiThoai: "dang-mo", banNhap: "dang-mo" },
	"ST-soan-mo-dau": { hoiThoai: "mo-dau", banNhap: "dang-soan-dau", ban: true },
	"ST-soan-co-nhap": { hoiThoai: "mot-moc", banNhap: "co-nhap" },
	"ST-soan-dang-soan": { hoiThoai: "hai-moc", banNhap: "co-nhap", ban: true },
	"ST-soan-moc": { hoiThoai: "hai-moc", banNhap: "co-nhap", noi: "mt-1" },
	"ST-soan-da-quyet": { hoiThoai: "hai-moc", banNhap: "da-quyet" },
	"ST-soan-con-thieu": { hoiThoai: "hai-moc", banNhap: "con-thieu" },
	"ST-soan-hoi-dong": { hoiThoai: "hai-moc", banNhap: "co-nhap", chip: true },
	"ST-soan-loi": { hoiThoai: "loi", banNhap: "co-nhap" },
	"ST-soan-het-luot": { hoiThoai: "het-luot", banNhap: "con-thieu" },
	"ST-soan-da-dua-vao": { hoiThoai: "hai-moc", banNhap: "da-dua-vao" },
	"ST-soan-khong-mo": { hoiThoai: "dang-mo", banNhap: "khong-mo" },
	"ST-soan-hep": { hoiThoai: "hai-moc", banNhap: "co-nhap", hep: true },
} satisfies Record<string, Hinh>;

function laHinh(s: string): s is keyof typeof HINH {
	return s in HINH;
}

function DauTrang() {
	return (
		<PageShellHeader>
			<PageShellHeading>
				<Button asChild variant="link" size="sm" className="w-fit px-0">
					<a href="#theo-don-vi">{M.veTheoDonVi}</a>
				</Button>
				<PageShellTitle>{M.tieuDe}</PageShellTitle>
				<PageShellDescription>
					<span translate="no">{M.donVi}</span> · {M.chuKy} ·{" "}
					<span className="tabular-nums">{M.luot}</span>
				</PageShellDescription>
			</PageShellHeading>
		</PageShellHeader>
	);
}

function HoiThoai({ h }: { h: Hinh }) {
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
	return (
		<KaraProposal
			kind="compact"
			data-dong={d.id}
			label={nhan}
			tag={d.nhan ? NHAN_DONG[d.nhan] : undefined}
			value={<span translate="no">{d.ten}</span>}
			before={d.truoc}
			rationale={d.viSao}
			fields={
				d.loai === "can-chinh" || q === "bo" ? undefined : <OSoDong d={d} />
			}
			decided={daQuyet(q, nhan, d.ten, () => doi("cho"))}
			actions={khoa ? [] : nut(NUT_THEM[d.loai], d.loai !== "can-chinh", doi)}
		/>
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

function BanNhap({ h }: { h: Hinh }) {
	const coNhap = !["dang-mo", "khong-mo"].includes(h.banNhap);
	return (
		<KaraArtifact
			title={M.banNhap}
			meta={coNhap ? M.meta : undefined}
			actions={
				coNhap ? (
					<Button variant="ghost" size="sm" type="button">
						{M.chiDongCho}
					</Button>
				) : undefined
			}
			footer={coNhap ? <ChanBanNhap h={h} /> : undefined}
			busy={h.ban ? { label: M.dangSoan } : null}
		>
			<ThanBanNhap h={h} />
		</KaraArtifact>
	);
}

function CotHoiThoai({ h }: { h: Hinh }) {
	return (
		<section
			aria-label={M.tabTroChuyen}
			className="flex min-h-0 min-w-0 flex-col gap-3"
		>
			<HoiThoai h={h} />
			<OSoan h={h} />
		</section>
	);
}

function Than({ h }: { h: Hinh }) {
	if (h.hep) {
		return (
			<Tabs defaultValue="ban-nhap">
				<TabsList className="w-full">
					<TabsTrigger value="tro-chuyen">{M.tabTroChuyen}</TabsTrigger>
					<TabsTrigger value="ban-nhap">{M.tabBanNhap}</TabsTrigger>
				</TabsList>
				<TabsContent value="tro-chuyen">
					<CotHoiThoai h={h} />
				</TabsContent>
				<TabsContent value="ban-nhap">
					<BanNhap h={h} />
				</TabsContent>
			</Tabs>
		);
	}
	return (
		<div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-[380px_minmax(0,1fr)]">
			<CotHoiThoai h={h} />
			<BanNhap h={h} />
		</div>
	);
}

export function SoanOkrTrangRiengMau({ state }: { state: string }) {
	const h: Hinh = HINH[laHinh(state) ? state : "ST-soan-co-nhap"];
	return (
		<div
			className="flex h-dvh min-h-0 flex-col gap-4 p-4"
			data-soan-trang={state}
		>
			<DauTrang />
			<Than h={h} />
		</div>
	);
}
