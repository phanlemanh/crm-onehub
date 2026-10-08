"use client";

import { Button } from "@crm/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import {
	KaraProposal,
	KaraProposalGroup,
} from "@crm/ui/components/kara/proposal";
import type {
	ProposedChangeAction,
	ProposedChangeDecision,
} from "@crm/ui/components/proposed-change";
import { docSoOkr } from "@crm/validation/okr-kr";
import { type ReactNode, useState } from "react";
import type { okrMessages } from "@/lib/messages/okr";
import type { OkrSoanMessages } from "@/lib/messages/okr-soan";
import type { CuocDangSoan } from "./dung-cuoc-soan";
import type {
	DongCanChinh,
	DongKr,
	DongMucTieu,
	DongSoan,
	KhoiNhap,
} from "./kieu";
import { canSo, laDuSo, soCua } from "./luat-ban-nhap";
import { khoaKr, khoaMucTieu } from "./moc-nop";

type Cach = "nhan" | "sua" | "bac";

export type NguCanhThe = {
	s: CuocDangSoan;
	mOkr: ReturnType<typeof okrMessages>;
	khoa: boolean;
	loi: Readonly<Record<string, ReactNode>>;
	quyet: (d: DongSoan, cach: Cach, giaTriCuoi?: string) => void;
	nhom: (mt: DongMucTieu, kem: readonly DongKr[]) => void;
	hoan: (d: DongSoan, keo: readonly DongSoan[]) => void;
	hoi: (d: DongSoan) => void;
	veMoc: () => void;
	chiCho: boolean;
	soDinhDang: (so: number) => string;
};

const KET_THEO_TRANG_THAI = {
	cho: null,
	nhan: "accepted",
	sua: "accepted",
	"da-sua-theo": "accepted",
	bac: "dismissed",
	"het-han": "skipped",
	"bo-qua": "skipped",
	"bi-loai": "skipped",
} as const satisfies Record<
	DongSoan["trangThai"],
	ProposedChangeDecision | null
>;

const HOAN_DUOC: ReadonlySet<DongSoan["trangThai"]> = new Set([
	"nhan",
	"sua",
	"bac",
]);

const laCho = (d: DongSoan): boolean => d.trangThai === "cho";

export const khoaHang = (d: DongSoan): string =>
	d.loai === "muc-tieu-moi"
		? khoaMucTieu(d.khoa)
		: d.loai === "kr-moi"
			? khoaKr(d.chaKhoa, d.khoa)
			: d.khoaDong;

function giaTriCua(d: DongMucTieu | DongKr): string {
	return d.giaTriCuoi ?? d.ten;
}

function dangQuyet(n: NguCanhThe, d: DongSoan): boolean {
	return n.s.quyet.isPending && n.s.quyet.variables?.deXuatId === d.id;
}

function nutHoi(n: NguCanhThe, m: OkrSoanMessages, d: DongSoan) {
	return {
		id: "hoi",
		label: m.dong.hoiKara,
		tone: "quiet" as const,
		onClick: () => n.hoi(d),
	};
}

function nutBa(
	n: NguCanhThe,
	m: OkrSoanMessages,
	d: DongSoan,
	them: string,
	moSua: (() => void) | null,
): ProposedChangeAction[] {
	return [
		{
			id: "nhan",
			label: them,
			tone: "primary",
			disabled: n.s.quyet.isPending,
			onClick: () => n.quyet(d, "nhan"),
		},
		...(moSua
			? [
					{
						id: "sua",
						label: m.banNhap.nut.sua,
						tone: "secondary" as const,
						onClick: moSua,
					},
				]
			: []),
		{
			id: "bac",
			label: m.dong.boQua,
			tone: "quiet",
			disabled: n.s.quyet.isPending,
			onClick: () => n.quyet(d, "bac"),
		},
		nutHoi(n, m, d),
	];
}

function useSuaDong(
	n: NguCanhThe,
	m: OkrSoanMessages,
	d: DongMucTieu | DongKr,
	them: string,
) {
	const [dangSua, setDangSua] = useState(false);
	const [chu, setChu] = useState(giaTriCua(d));
	const huy = () => {
		setDangSua(false);
		setChu(giaTriCua(d));
	};
	const nutQuyet: ProposedChangeAction[] = dangSua
		? [
				{
					id: "nhan-ban-sua",
					label: m.dong.themBanSua,
					tone: "primary",
					disabled: chu.trim() === "" || n.s.quyet.isPending,
					onClick: () => {
						n.quyet(d, "sua", chu.trim());
						setDangSua(false);
					},
				},
				{
					id: "huy",
					label: m.banNhap.nut.huy,
					tone: "secondary",
					onClick: huy,
				},
			]
		: nutBa(n, m, d, them, () => {
				setChu(giaTriCua(d));
				setDangSua(true);
			});
	return {
		actions: n.khoa ? [] : nutQuyet,
		editing:
			dangSua && !n.khoa
				? { value: chu, onChange: setChu, onCancel: huy }
				: undefined,
	};
}

function nhanDong(
	n: NguCanhThe,
	m: OkrSoanMessages,
	d: DongSoan,
): ReactNode | undefined {
	const nhan = n.s.nhan.get(d.khoaDong);
	if (!nhan || nhan === "da-bo") return undefined;
	return (
		<Button
			variant="ghost"
			size="xs"
			type="button"
			data-nhan-dong={nhan}
			onClick={(e) => {
				e.stopPropagation();
				n.veMoc();
			}}
		>
			{m.banNhap.nhan[nhan]}
		</Button>
	);
}

function ketCua(
	n: NguCanhThe,
	m: OkrSoanMessages,
	d: DongSoan,
	nhan: string,
	giaTri: string,
	keo: readonly DongSoan[] = [],
	soAn = 0,
):
	| { decision: ProposedChangeDecision; text: ReactNode; onUndo?: () => void }
	| undefined {
	const ket = KET_THEO_TRANG_THAI[d.trangThai];
	if (!ket) return undefined;
	const daBo = n.s.nhan.get(d.khoaDong) === "da-bo";
	const hoanDuoc = !n.khoa && !daBo && HOAN_DUOC.has(d.trangThai);
	return {
		decision: ket,
		text: (
			<>
				{ket === "accepted" ? m.dong.daThem : m.dong.daBoQua} {nhan} ·{" "}
				<span translate="no">{giaTri}</span>
				{hoanDuoc && keo.length > 0 ? m.dong.kemKr(String(keo.length)) : null}
				{d.trangThai === "bac" && soAn > 0
					? ` · ${m.banNhap.bacCon(String(soAn))}`
					: null}
				{daBo ? (
					<>
						{" · "}
						<span data-nhan="da-bo">{m.banNhap.nhan["da-bo"]}</span>
					</>
				) : null}
			</>
		),
		onUndo: hoanDuoc ? () => n.hoan(d, keo) : undefined,
	};
}

function OSo({
	id,
	nhan,
	donVi,
	giaTri,
	loi,
	doi,
}: {
	id: string;
	nhan: string;
	donVi: string;
	giaTri: string;
	loi: boolean;
	doi: (moi: string) => void;
}) {
	return (
		<Field data-invalid={loi || undefined}>
			<FieldLabel htmlFor={id}>{nhan}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					id={id}
					inputMode="decimal"
					autoComplete="off"
					value={giaTri}
					onChange={(e) => doi(e.currentTarget.value)}
					aria-invalid={loi || undefined}
					translate="no"
				/>
				{donVi ? (
					<InputGroupAddon align="inline-end">
						<InputGroupText translate="no">{donVi}</InputGroupText>
					</InputGroupAddon>
				) : null}
			</InputGroup>
		</Field>
	);
}

function OSoKr({
	n,
	m,
	kr,
}: {
	n: NguCanhThe;
	m: OkrSoanMessages;
	kr: DongKr;
}) {
	if (!canSo(kr))
		return (
			<FieldDescription data-o-so={kr.id}>{m.banNhap.moc}</FieldDescription>
		);
	const so = soCua(kr, n.s.so);
	const thieu = n.s.thieu.includes(kr.id);
	return (
		<fieldset
			disabled={n.khoa}
			className="m-0 grid min-w-0 grid-cols-2 gap-3 border-0 p-0"
			data-o-so={kr.id}
		>
			<OSo
				id={`khoi-${kr.id}`}
				nhan={m.banNhap.khoiDiem}
				donVi={kr.donVi}
				giaTri={so.khoiDiem}
				loi={thieu && docSoOkr(so.khoiDiem) === null}
				doi={(khoiDiem) => n.s.datSo(kr, { ...so, khoiDiem })}
			/>
			<OSo
				id={`dich-${kr.id}`}
				nhan={m.banNhap.dich}
				donVi={kr.donVi}
				giaTri={so.dich}
				loi={thieu && docSoOkr(so.dich) === null}
				doi={(dich) => n.s.datSo(kr, { ...so, dich })}
			/>
		</fieldset>
	);
}

function moTaKr(n: NguCanhThe, m: OkrSoanMessages, kr: DongKr): string {
	return [
		n.mOkr.kieu[kr.kieu],
		kr.donVi ? m.banNhap.doBang(kr.donVi) : null,
		kr.khoiDiemGoiY === null
			? null
			: m.banNhap.goiYKhoiDiem(n.soDinhDang(kr.khoiDiemGoiY)),
	]
		.filter((x) => x !== null)
		.join(" · ");
}

function DongMucTieuNhap({
	n,
	m,
	d,
	nhan,
	keo,
	soCon,
}: {
	n: NguCanhThe;
	m: OkrSoanMessages;
	d: DongMucTieu;
	nhan: string;
	keo: readonly DongSoan[];
	soCon: number;
}) {
	const sua = useSuaDong(n, m, d, m.dong.themMucTieu);
	return (
		<KaraProposal
			kind="compact"
			data-dong={d.id}
			data-khoa-dong={khoaHang(d)}
			data-loai-dong="muc-tieu"
			data-the-cho={laCho(d) ? "" : undefined}
			highlighted={n.s.dongNoi === khoaHang(d)}
			label={nhan}
			tag={nhanDong(n, m, d)}
			before={n.s.truocTen.get(d.khoaDong)}
			value={<span translate="no">{giaTriCua(d)}</span>}
			rationale={
				<>
					<span className="block">{m.banNhap.viSaoLucNay(d.viSaoLucNay)}</span>
					<span className="block">{d.viSao}</span>
				</>
			}
			decided={ketCua(n, m, d, nhan, giaTriCua(d), keo, soCon)}
			pending={dangQuyet(n, d)}
			error={n.loi[d.id]}
			actions={sua.actions}
			editing={sua.editing}
		/>
	);
}

function DongKrNhap({
	n,
	m,
	kr,
}: {
	n: NguCanhThe;
	m: OkrSoanMessages;
	kr: DongKr;
}) {
	const sua = useSuaDong(n, m, kr, m.dong.themKr);
	const ket = ketCua(n, m, kr, m.banNhap.kr, giaTriCua(kr));
	const oSo = <OSoKr n={n} m={m} kr={kr} />;
	return (
		<div className="flex min-w-0 flex-col gap-2" data-the-kr={kr.id}>
			<KaraProposal
				kind="compact"
				data-dong={kr.id}
				data-khoa-dong={khoaHang(kr)}
				data-loai-dong="kr"
				data-the-cho={laCho(kr) ? "" : undefined}
				highlighted={n.s.dongNoi === khoaHang(kr)}
				label={m.banNhap.kr}
				tag={nhanDong(n, m, kr)}
				before={n.s.truocTen.get(kr.khoaDong)}
				value={<span translate="no">{giaTriCua(kr)}</span>}
				rationale={
					<>
						<span className="block">{moTaKr(n, m, kr)}</span>
						<span className="block">{kr.viSao}</span>
					</>
				}
				fields={ket ? undefined : oSo}
				decided={ket}
				pending={dangQuyet(n, kr)}
				error={n.loi[kr.id]}
				actions={sua.actions}
				editing={sua.editing}
			/>
			{ket && ket.decision === "accepted" ? oSo : null}
		</div>
	);
}

function DongCanChinhNhap({
	n,
	m,
	d,
}: {
	n: NguCanhThe;
	m: OkrSoanMessages;
	d: DongCanChinh;
}) {
	const giaTri = m.banNhap.canChinh(d.tenDich);
	return (
		<KaraProposal
			kind="compact"
			data-dong={d.id}
			data-khoa-dong={khoaHang(d)}
			data-loai-dong="can-chinh"
			data-the-cho={laCho(d) ? "" : undefined}
			highlighted={n.s.dongNoi === khoaHang(d)}
			label={m.banNhap.canChinhNhan}
			tag={nhanDong(n, m, d)}
			value={giaTri}
			rationale={d.viSao}
			decided={ketCua(n, m, d, m.banNhap.canChinhNhan, giaTri)}
			pending={dangQuyet(n, d)}
			error={n.loi[d.id]}
			actions={n.khoa ? [] : nutBa(n, m, d, m.dong.themCanChinh, null)}
		/>
	);
}

export function NhomMucTieu({
	n,
	m,
	khoi,
	stt,
}: {
	n: NguCanhThe;
	m: OkrSoanMessages;
	khoi: KhoiNhap;
	stt: number;
}) {
	const mt = khoi.mucTieu;
	const bac = mt.trangThai === "bac";
	const con: DongSoan[] = [...khoi.kr, ...khoi.canChinh];
	const ganNhom = khoi.kr.filter((kr) => laCho(kr) && laDuSo(kr, n.s.so));
	const conThat = con.filter((d) => n.s.nhan.get(d.khoaDong) !== "da-bo");
	const keo = conThat.filter((d) => HOAN_DUOC.has(d.trangThai));
	const nhomDaNhan = n.s.nhomDaNhan.get(mt.id);
	const trongNhom = new Set(nhomDaNhan ? [mt.id, ...nhomDaNhan] : []);
	const nhan = `${m.banNhap.mucTieu(String(stt))} · ${m.banNhap.loai[mt.loaiMucTieu]}`;
	const hien = (d: DongSoan) => !trongNhom.has(d.id) && (!n.chiCho || laCho(d));
	return (
		<KaraProposalGroup
			entries={[mt, ...(bac ? [] : con)].map((d) => ({
				id: d.id,
				status: laCho(d) ? "pending" : "decided",
				batchable:
					d.id === mt.id
						? ganNhom.length > 0
						: ganNhom.some((kr) => kr.id === d.id),
			}))}
			scope={nhan}
			reason={mt.viSaoLucNay || mt.viSao}
			batch={
				laCho(mt) && !n.khoa
					? {
							label: m.dong.themNhom(String(ganNhom.length)),
							onAccept: () => n.nhom(mt, ganNhom),
						}
					: undefined
			}
			batchDecided={
				nhomDaNhan && !laCho(mt)
					? {
							text: m.dong.daThemNhom(String(stt), String(nhomDaNhan.length)),
							onUndo: n.khoa ? undefined : () => n.hoan(mt, keo),
						}
					: undefined
			}
		>
			{hien(mt) ? (
				<DongMucTieuNhap
					n={n}
					m={m}
					d={mt}
					nhan={nhan}
					keo={keo}
					soCon={conThat.length}
				/>
			) : null}
			{bac
				? null
				: khoi.kr
						.filter(hien)
						.map((kr) => <DongKrNhap key={khoaHang(kr)} n={n} m={m} kr={kr} />)}
			{bac
				? null
				: khoi.canChinh
						.filter(hien)
						.map((d) => (
							<DongCanChinhNhap key={khoaHang(d)} n={n} m={m} d={d} />
						))}
		</KaraProposalGroup>
	);
}
