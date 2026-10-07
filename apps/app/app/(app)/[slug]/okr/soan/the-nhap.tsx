"use client";

import { Badge } from "@crm/ui/components/badge";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import {
	ProposedChange,
	type ProposedChangeAction,
	type ProposedChangeDecision,
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
import { canSo, daNhan, soCua } from "./luat-ban-nhap";

type Quyet = "nhan" | "sua" | "bac";

export type NguCanhThe = {
	s: CuocDangSoan;
	mOkr: ReturnType<typeof okrMessages>;
	khoa: boolean;
	loi: Readonly<Record<string, string | undefined>>;
	quyet: (d: DongSoan, cach: Quyet, giaTriCuoi?: string) => void;
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

function giaTriCua(d: DongMucTieu | DongKr): string {
	return d.giaTriCuoi ?? d.ten;
}

function useSuaDong(
	n: NguCanhThe,
	m: OkrSoanMessages,
	d: DongMucTieu | DongKr,
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
					label: m.banNhap.nut.nhanBanSua,
					tone: "primary",
					disabled: chu.trim() === "",
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
		: nutBa(n, m, d, () => {
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

function nutBa(
	n: NguCanhThe,
	m: OkrSoanMessages,
	d: DongSoan,
	moSua: (() => void) | null,
): ProposedChangeAction[] {
	return [
		{
			id: "nhan",
			label: m.banNhap.nut.nhan,
			tone: "primary",
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
			label: m.banNhap.nut.bac,
			tone: "quiet",
			onClick: () => n.quyet(d, "bac"),
		},
	];
}

function ketCua(
	n: NguCanhThe,
	m: OkrSoanMessages,
	d: DongSoan,
	nhan: string,
	giaTri: string,
	them?: ReactNode,
): { decision: ProposedChangeDecision; text: ReactNode } | undefined {
	const ket = KET_THEO_TRANG_THAI[d.trangThai];
	if (!ket) return undefined;
	const daBo = n.s.nhan.get(d.khoaDong) === "da-bo";
	return {
		decision: ket,
		text: (
			<>
				{nhan} · <span translate="no">{giaTri}</span> — {m.banNhap.ket[ket]}
				{them}
				{daBo ? (
					<>
						{" "}
						<Badge variant="outline" data-nhan="da-bo">
							{m.banNhap.nhan["da-bo"]}
						</Badge>
					</>
				) : null}
			</>
		),
	};
}

function tagCua(
	n: NguCanhThe,
	m: OkrSoanMessages,
	d: DongSoan,
): string | undefined {
	const nhan = n.s.nhan.get(d.khoaDong);
	return nhan && nhan !== "da-bo" ? m.banNhap.nhan[nhan] : undefined;
}

function dangQuyet(n: NguCanhThe, d: DongSoan): boolean {
	return n.s.quyet.isPending && n.s.quyet.variables?.deXuatId === d.id;
}

export function TheMucTieu({
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
	const d = khoi.mucTieu;
	const sua = useSuaDong(n, m, d);
	const nhan = `${m.banNhap.mucTieu(String(stt))} · ${m.banNhap.loai[d.loaiMucTieu]}`;
	const soCon = khoi.kr.length + khoi.canChinh.length;
	const ket = ketCua(
		n,
		m,
		d,
		nhan,
		giaTriCua(d),
		d.trangThai === "bac" && soCon > 0
			? ` · ${m.banNhap.bacCon(String(soCon))}`
			: undefined,
	);
	return (
		<ProposedChange
			density="card"
			kind="compact"
			data-dong={d.id}
			data-loai-dong="muc-tieu"
			data-the-cho={ket ? undefined : ""}
			label={nhan}
			tag={tagCua(n, m, d)}
			value={giaTriCua(d)}
			rationale={
				<>
					<span className="block">{m.banNhap.viSaoLucNay(d.viSaoLucNay)}</span>
					<span className="block">{d.viSao}</span>
				</>
			}
			decided={ket}
			pending={dangQuyet(n, d)}
			error={n.loi[d.id]}
			actions={sua.actions}
			editing={sua.editing}
		/>
	);
}

function OSo({
	id,
	nhan,
	donVi,
	giaTri,
	loi,
	khoa,
	doi,
}: {
	id: string;
	nhan: string;
	donVi: string;
	giaTri: string;
	loi: boolean;
	khoa: boolean;
	doi: (moi: string) => void;
}) {
	return (
		<Field data-invalid={loi || undefined} data-disabled={khoa || undefined}>
			<FieldLabel htmlFor={id}>{nhan}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					id={id}
					inputMode="decimal"
					autoComplete="off"
					value={giaTri}
					onChange={(e) => doi(e.currentTarget.value)}
					aria-invalid={loi || undefined}
					disabled={khoa}
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
	if (!canSo(kr)) {
		return (
			<FieldDescription data-o-so={kr.id}>{m.banNhap.moc}</FieldDescription>
		);
	}
	const so = soCua(kr, n.s.so);
	const thieu = n.s.thieu.includes(kr.id);
	return (
		<div className="grid grid-cols-2 gap-3" data-o-so={kr.id}>
			<OSo
				id={`khoi-${kr.id}`}
				nhan={m.banNhap.khoiDiem}
				donVi={kr.donVi}
				giaTri={so.khoiDiem}
				loi={thieu && docSoOkr(so.khoiDiem) === null}
				khoa={n.khoa}
				doi={(khoiDiem) => n.s.datSo(kr, { ...so, khoiDiem })}
			/>
			<OSo
				id={`dich-${kr.id}`}
				nhan={m.banNhap.dich}
				donVi={kr.donVi}
				giaTri={so.dich}
				loi={thieu && docSoOkr(so.dich) === null}
				khoa={n.khoa}
				doi={(dich) => n.s.datSo(kr, { ...so, dich })}
			/>
		</div>
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

export function TheKr({
	n,
	m,
	kr,
}: {
	n: NguCanhThe;
	m: OkrSoanMessages;
	kr: DongKr;
}) {
	const sua = useSuaDong(n, m, kr);
	const ket = ketCua(n, m, kr, m.banNhap.kr, giaTriCua(kr));
	const oSo = <OSoKr n={n} m={m} kr={kr} />;
	return (
		<fieldset
			className="flex min-w-0 flex-col gap-2"
			aria-label={giaTriCua(kr)}
			data-the-kr={kr.id}
		>
			<ProposedChange
				density="card"
				kind="compact"
				data-dong={kr.id}
				data-loai-dong="kr"
				data-the-cho={ket ? undefined : ""}
				label={m.banNhap.kr}
				tag={tagCua(n, m, kr)}
				value={giaTriCua(kr)}
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
			{ket && daNhan(kr) ? oSo : null}
		</fieldset>
	);
}

export function TheCanChinh({
	n,
	m,
	d,
}: {
	n: NguCanhThe;
	m: OkrSoanMessages;
	d: DongCanChinh;
}) {
	const giaTri = m.banNhap.canChinh(d.tenDich);
	const ket = ketCua(n, m, d, m.banNhap.canChinhNhan, giaTri);
	return (
		<ProposedChange
			density="card"
			kind="compact"
			data-dong={d.id}
			data-loai-dong="can-chinh"
			data-the-cho={ket ? undefined : ""}
			label={m.banNhap.canChinhNhan}
			tag={tagCua(n, m, d)}
			value={giaTri}
			rationale={d.viSao}
			decided={ket}
			pending={dangQuyet(n, d)}
			error={n.loi[d.id]}
			actions={n.khoa ? [] : nutBa(n, m, d, null)}
		/>
	);
}
