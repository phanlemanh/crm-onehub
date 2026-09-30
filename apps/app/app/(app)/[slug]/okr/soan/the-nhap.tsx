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
import { canSo, daNhan, docSo, soCua } from "./luat-ban-nhap";

type Quyet = "nhan" | "sua" | "bac";

export type NguCanhThe = {
	s: CuocDangSoan;
	m: OkrSoanMessages;
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

function useSuaDong(n: NguCanhThe, d: DongMucTieu | DongKr) {
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
					label: n.m.banNhap.nut.nhanBanSua,
					tone: "primary",
					disabled: chu.trim() === "",
					onClick: () => {
						n.quyet(d, "sua", chu.trim());
						setDangSua(false);
					},
				},
				{
					id: "huy",
					label: n.m.banNhap.nut.huy,
					tone: "secondary",
					onClick: huy,
				},
			]
		: nutBa(n, d, () => {
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
	d: DongSoan,
	moSua: (() => void) | null,
): ProposedChangeAction[] {
	return [
		{
			id: "nhan",
			label: n.m.banNhap.nut.nhan,
			tone: "primary",
			onClick: () => n.quyet(d, "nhan"),
		},
		...(moSua
			? [
					{
						id: "sua",
						label: n.m.banNhap.nut.sua,
						tone: "secondary" as const,
						onClick: moSua,
					},
				]
			: []),
		{
			id: "bac",
			label: n.m.banNhap.nut.bac,
			tone: "quiet",
			onClick: () => n.quyet(d, "bac"),
		},
	];
}

function ketCua(
	n: NguCanhThe,
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
				{n.m.banNhap.daQuyet(nhan, giaTri, n.m.banNhap.ket[ket])}
				{them}
				{daBo ? (
					<>
						{" "}
						<Badge variant="outline" data-nhan="da-bo">
							{n.m.banNhap.nhan["da-bo"]}
						</Badge>
					</>
				) : null}
			</>
		),
	};
}

function tagCua(n: NguCanhThe, d: DongSoan): string | undefined {
	const nhan = n.s.nhan.get(d.khoaDong);
	return nhan && nhan !== "da-bo" ? n.m.banNhap.nhan[nhan] : undefined;
}

function dangQuyet(n: NguCanhThe, d: DongSoan): boolean {
	return n.s.quyet.isPending && n.s.quyet.variables?.deXuatId === d.id;
}

export function TheMucTieu({
	n,
	khoi,
	stt,
}: {
	n: NguCanhThe;
	khoi: KhoiNhap;
	stt: number;
}) {
	const d = khoi.mucTieu;
	const sua = useSuaDong(n, d);
	const nhan = `${n.m.banNhap.mucTieu(String(stt))} · ${n.m.banNhap.loai[d.loaiMucTieu]}`;
	const soCon = khoi.kr.length + khoi.canChinh.length;
	const ket = ketCua(
		n,
		d,
		nhan,
		giaTriCua(d),
		d.trangThai === "bac" && soCon > 0
			? ` · ${n.m.banNhap.bacCon(String(soCon))}`
			: undefined,
	);
	return (
		<ProposedChange
			kind="compact"
			data-dong={d.id}
			data-loai-dong="muc-tieu"
			data-the-cho={ket ? undefined : ""}
			label={nhan}
			tag={tagCua(n, d)}
			value={giaTriCua(d)}
			rationale={
				<>
					<span className="block">
						{n.m.banNhap.viSaoLucNay(d.viSaoLucNay)}
					</span>
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

function OSoKr({ n, kr }: { n: NguCanhThe; kr: DongKr }) {
	if (!canSo(kr)) {
		return (
			<FieldDescription data-o-so={kr.id}>{n.m.banNhap.moc}</FieldDescription>
		);
	}
	const so = soCua(kr, n.s.so);
	const thieu = n.s.thieu.includes(kr.id);
	return (
		<div className="grid grid-cols-2 gap-3" data-o-so={kr.id}>
			<OSo
				id={`khoi-${kr.id}`}
				nhan={n.m.banNhap.khoiDiem}
				donVi={kr.donVi}
				giaTri={so.khoiDiem}
				loi={thieu && docSo(so.khoiDiem) === null}
				khoa={n.khoa}
				doi={(khoiDiem) => n.s.datSo(kr.id, { ...so, khoiDiem })}
			/>
			<OSo
				id={`dich-${kr.id}`}
				nhan={n.m.banNhap.dich}
				donVi={kr.donVi}
				giaTri={so.dich}
				loi={thieu && docSo(so.dich) === null}
				khoa={n.khoa}
				doi={(dich) => n.s.datSo(kr.id, { ...so, dich })}
			/>
		</div>
	);
}

function moTaKr(n: NguCanhThe, kr: DongKr): string {
	return [
		n.mOkr.kieu[kr.kieu],
		kr.donVi ? n.m.banNhap.doBang(kr.donVi) : null,
		kr.khoiDiemGoiY === null
			? null
			: n.m.banNhap.goiYKhoiDiem(n.soDinhDang(kr.khoiDiemGoiY)),
	]
		.filter((x) => x !== null)
		.join(" · ");
}

export function TheKr({ n, kr }: { n: NguCanhThe; kr: DongKr }) {
	const sua = useSuaDong(n, kr);
	const ket = ketCua(n, kr, n.m.banNhap.kr, giaTriCua(kr));
	const oSo = <OSoKr n={n} kr={kr} />;
	return (
		<fieldset
			className="flex min-w-0 flex-col gap-2"
			aria-label={giaTriCua(kr)}
			data-the-kr={kr.id}
		>
			<ProposedChange
				kind="compact"
				data-dong={kr.id}
				data-loai-dong="kr"
				data-the-cho={ket ? undefined : ""}
				label={n.m.banNhap.kr}
				tag={tagCua(n, kr)}
				value={giaTriCua(kr)}
				rationale={
					<>
						<span className="block">{moTaKr(n, kr)}</span>
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

export function TheCanChinh({ n, d }: { n: NguCanhThe; d: DongCanChinh }) {
	const giaTri = n.m.banNhap.canChinh(d.tenDich);
	const ket = ketCua(n, d, n.m.banNhap.canChinhNhan, giaTri);
	return (
		<ProposedChange
			kind="compact"
			data-dong={d.id}
			data-loai-dong="can-chinh"
			data-the-cho={ket ? undefined : ""}
			label={n.m.banNhap.canChinhNhan}
			tag={tagCua(n, d)}
			value={giaTri}
			rationale={d.viSao}
			decided={ket}
			pending={dangQuyet(n, d)}
			error={n.loi[d.id]}
			actions={n.khoa ? [] : nutBa(n, d, null)}
		/>
	);
}
