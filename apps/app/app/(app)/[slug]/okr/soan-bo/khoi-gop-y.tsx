"use client";

import { Button } from "@crm/ui/components/button";
import { KaraMark } from "@crm/ui/components/kara";
import {
	type KaraProposalEntry,
	KaraProposalGroup,
} from "@crm/ui/components/kara/proposal";
import { KaraState } from "@crm/ui/components/kara/state";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatNgayGio } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import {
	type ReactNode,
	useEffect,
	useEffectEvent,
	useId,
	useRef,
	useState,
} from "react";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { dauThangSau, homNayVn, OKR_CHU_KY } from "@/lib/okr-chu-ky-nhan";
import {
	type GopYMucTieu,
	type LoaiLoiNho,
	type LyDoTat,
	type NoiDungKara,
	useGopYMucTieu,
} from "../gop-y-kara";
import { DeXuatNeo, type LoiDiKr } from "../nhom-kara";
import type { DongHien } from "../the-gop-y-props";
import { usePhuThuocSoan } from "./phu-thuoc";
import type { ChuTheoKara, DocLaiKara } from "./theo-kara";
import type { MucTieuSoan } from "./use-bo-soan";

type TomTat = {
	thamGia: boolean;
	noiDung: NoiDungKara;
	tat: LyDoTat | null;
	nhoDuoc: boolean;
	ban: boolean;
	loiNho: LoaiLoiNho | null;
	docLuc: string | null;
	the: KaraProposalEntry[];
};

type Lenh = { nho: number; thuLai: number };

type DoiTheoKara = { id: string; chu: ChuTheoKara };

export type KhungGopY = { khoi: ReactNode; nut: ReactNode; karaTat: boolean };

const NOI_DUNG_LOI: ReadonlySet<NoiDungKara> = new Set([
	"loi",
	"nho-loi",
	"tai-loi",
]);

function dongCua(gopY: GopYMucTieu): DongHien[] {
	const { capBo, viSao, theoKr } = gopY.nhom;
	return [...capBo, ...viSao, ...[...theoKr.values()].flat()];
}

function tomTatCua(
	gopY: GopYMucTieu,
	thamGia: boolean,
	dong: readonly DongHien[],
): TomTat {
	const coThe = gopY.noiDung === "co-gop-y";
	return {
		thamGia,
		noiDung: gopY.noiDung,
		tat: gopY.tat,
		nhoDuoc: gopY.nut.loai === "mo",
		ban: gopY.ban !== null,
		loiNho: gopY.loiNho,
		docLuc: gopY.docLuc,
		the: coThe
			? dong.map((d) => ({
					id: d.id,
					status: gopY.ketCua(d.id) ? "decided" : "pending",
					batchable: false,
				}))
			: [],
	};
}

function doiTheoKaraCua(
	gopY: GopYMucTieu,
	dong: readonly DongHien[],
): DoiTheoKara[] {
	return dong.flatMap((d) => {
		const k = gopY.ketCua(d.id);
		if (k?.ket !== "accepted" || d.loai !== "viet-lai") return [];
		const id =
			d.truong === "kr.title"
				? d.keyResultId
				: d.truong === "title"
					? d.objectiveId
					: null;
		if (id === null || d.truong === null) return [];
		const chu: ChuTheoKara = k.daHoanTac
			? { truong: d.truong, giaTri: d.truoc ?? "", dau: false }
			: { truong: d.truong, giaTri: k.giaTri ?? d.sau ?? "", dau: true };
		return [{ id, chu }];
	});
}

function useTheoLenh(lenh: number, lam: () => void): void {
	const daLam = useRef(lenh);
	const lamNay = useEffectEvent(lam);
	useEffect(() => {
		if (lenh === daLam.current) return;
		daLam.current = lenh;
		lamNay();
	}, [lenh]);
}

function GopYMucTieuSoan({
	mt,
	lenh,
	bao,
	docLai,
	moKr,
}: {
	mt: MucTieuSoan;
	lenh: Lenh;
	bao: (id: string, t: TomTat) => void;
	docLai: DocLaiKara;
	moKr: (objectiveId: string, di: LoiDiKr) => void;
}) {
	const phuThuoc = usePhuThuocSoan();
	const ghiDuoc = mt.status === "nhap" || mt.status === "cong-bo";
	const gopY = useGopYMucTieu({
		objectiveId: mt.id,
		soGopYCho: mt.soGopYCho,
		canEdit: mt.canEdit,
		krSuaDuoc: [],
		ghiDuoc,
	});
	const dong = dongCua(gopY);
	const tomTat = tomTatCua(gopY, ghiDuoc && mt.canEdit, dong);
	const doi = doiTheoKaraCua(gopY, dong);
	const daBao = useRef("");
	const daDoc = useRef("[]");
	useEffect(() => {
		const khoa = JSON.stringify(tomTat);
		if (khoa === daBao.current) return;
		daBao.current = khoa;
		bao(mt.id, tomTat);
	});
	useEffect(() => {
		const khoa = JSON.stringify(doi);
		if (khoa === daDoc.current) return;
		daDoc.current = khoa;
		if (!phuThuoc.docLaiSauNhan) return;
		for (const x of doi) docLai(x.id, x.chu);
	});

	useTheoLenh(lenh.nho, gopY.nho);
	useTheoLenh(lenh.thuLai, () => {
		if (NOI_DUNG_LOI.has(gopY.noiDung)) gopY.thuLai();
	});

	if (gopY.noiDung !== "co-gop-y") return null;
	return dong.map((d) => (
		<DeXuatNeo
			d={d}
			density="card"
			gopY={gopY}
			key={d.id}
			moKr={(di) => moKr(mt.id, di)}
		/>
	));
}

function cauTat(vi: LyDoTat, locale: Locale): string {
	const g = okrGopYMessages(locale).vung;
	switch (vi) {
		case "het-luot":
			return g.hetLuot;
		case "tam-nghi":
			return g.tamNghi(dauThangSau(homNayVn(new Date())));
		case "chua-bat":
			return okrSoanBoMessages(locale).gopY.tat;
		case "tam-tat":
			return g.tamTat;
	}
}

function NutDocBo({
	nhan,
	khoa,
	moTa,
	onClick,
}: {
	nhan: string;
	khoa: boolean;
	moTa?: string;
	onClick: () => void;
}) {
	return (
		<Button
			aria-describedby={moTa}
			data-nut="nho-kara-doc"
			disabled={khoa}
			onClick={onClick}
			size="sm"
			type="button"
			variant="outline"
		>
			{nhan}
		</Button>
	);
}

function KhoiTat({ vi, nhan }: { vi: LyDoTat; nhan: string }) {
	const locale = useLocale();
	const id = useId();
	if (vi === "chua-bat" || vi === "tam-tat")
		return <KaraState kind="unconfigured" description={cauTat(vi, locale)} />;
	return (
		<KaraState
			kind="off"
			describedBy={id}
			reason={cauTat(vi, locale)}
			action={
				<div>
					<NutDocBo nhan={nhan} khoa moTa={id} onClick={() => {}} />
				</div>
			}
		/>
	);
}

type TongHop = {
	coThe: boolean;
	the: KaraProposalEntry[];
	ban: boolean;
	tat: LyDoTat | null;
	loi: TomTat | null;
	rong: boolean;
	nhoDuoc: boolean;
	daDoc: boolean;
	docLuc: string | null;
};

function tongHop(
	tomTat: ReadonlyMap<string, TomTat>,
	mucTieu: readonly MucTieuSoan[],
): TongHop {
	const cac = mucTieu.flatMap((mt) => {
		const t = tomTat.get(mt.id);
		return t?.thamGia ? [t] : [];
	});
	const the = cac.flatMap((t) => t.the);
	const ban = cac.some((t) => t.ban);
	const tat =
		cac.length > 0 && cac.every((t) => t.tat !== null)
			? (cac[0]?.tat ?? null)
			: null;
	const docLuc =
		cac
			.flatMap((t) => (t.docLuc ? [t.docLuc] : []))
			.sort()
			.at(-1) ?? null;
	return {
		coThe: the.length > 0,
		the,
		ban,
		tat,
		loi: cac.find((t) => NOI_DUNG_LOI.has(t.noiDung)) ?? null,
		rong: cac.length > 0 && cac.every((t) => t.noiDung === "rong"),
		nhoDuoc: !ban && cac.some((t) => t.nhoDuoc),
		daDoc: cac.some((t) => t.noiDung !== "chua-goi" && t.noiDung !== "tat"),
		docLuc,
	};
}

function TrangThaiKhoi({
	th,
	nhan,
	thuLai,
}: {
	th: TongHop;
	nhan: string;
	thuLai: () => void;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	const g = okrGopYMessages(locale).vung;
	if (th.ban) return <KaraState kind="working" label={m.gopY.dangDoc} />;
	if (th.tat !== null) return <KhoiTat vi={th.tat} nhan={nhan} />;
	if (th.coThe) return null;
	if (th.loi !== null)
		return (
			<KaraState
				kind="error"
				what={m.gopY.viecDoc}
				description={
					th.loi.noiDung === "nho-loi"
						? g.nhoLoi[th.loi.loiNho ?? "khac"]
						: g.loiMoTa
				}
				onRetry={thuLai}
			/>
		);
	if (th.rong)
		return (
			<KaraState
				kind="empty"
				title={m.gopY.khongCo}
				description={m.gopY.khongCoMoTa}
			/>
		);
	return <p className="text-muted-foreground text-sm">{m.gopY.chuaDoc}</p>;
}

export function KhoiGopY({
	mucTieu,
	cauNoi,
	docLai,
	moKr,
	children,
}: {
	mucTieu: MucTieuSoan[];
	cauNoi: boolean;
	docLai: DocLaiKara;
	moKr: (objectiveId: string, di: LoiDiKr) => void;
	children: (khung: KhungGopY) => ReactNode;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	const [tomTat, datTomTat] = useState<ReadonlyMap<string, TomTat>>(
		() => new Map(),
	);
	const [lenh, datLenh] = useState<Lenh>({ nho: 0, thuLai: 0 });
	if (!cauNoi)
		return children({
			khoi: (
				<section className="flex flex-col gap-3" data-khoi="gop-y-kara">
					<KaraState kind="unconfigured" description={m.gopY.tat} />
				</section>
			),
			nut: null,
			karaTat: true,
		});
	const th = tongHop(tomTat, mucTieu);
	const nhan = th.daDoc ? m.gopY.docLai : m.gopY.nhoDoc;
	const bao = (id: string, t: TomTat) =>
		datTomTat((cu) => new Map(cu).set(id, t));
	const readAt = th.docLuc
		? formatNgayGio(th.docLuc, locale, {
				timeZone: OKR_CHU_KY.muiGio,
				phan: "ngay-gio",
			})
		: undefined;
	const khoi = (
		<section className="flex flex-col gap-3" data-khoi="gop-y-kara">
			{th.coThe ? null : <KaraMark scope={m.gopY.nhom} />}
			<TrangThaiKhoi
				th={th}
				nhan={nhan}
				thuLai={() => datLenh((l) => ({ ...l, thuLai: l.thuLai + 1 }))}
			/>
			<div hidden={!th.coThe}>
				<KaraProposalGroup
					entries={th.the}
					reason={m.gopY.viSao(String(mucTieu.length))}
					readAt={readAt}
				>
					{mucTieu.map((mt) => (
						<GopYMucTieuSoan
							bao={bao}
							docLai={docLai}
							key={mt.id}
							lenh={lenh}
							moKr={moKr}
							mt={mt}
						/>
					))}
				</KaraProposalGroup>
			</div>
		</section>
	);
	const boTrong = mucTieu.length === 0;
	const nut =
		boTrong || th.nhoDuoc ? (
			<NutDocBo
				nhan={nhan}
				khoa={false}
				onClick={() => datLenh((l) => ({ ...l, nho: l.nho + 1 }))}
			/>
		) : null;
	return children({ khoi, nut, karaTat: th.tat !== null });
}
