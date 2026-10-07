"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { Field, FieldDescription, FieldError } from "@crm/ui/components/field";
import { KaraArtifact } from "@crm/ui/components/kara/artifact";
import { KaraState } from "@crm/ui/components/kara/state";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { type ReactNode, useId, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { SOAN_UI } from "./cau-hinh";
import { type CuocDangSoan, donViCua } from "./dung-cuoc-soan";
import { dongKhoi, type QuyetBang } from "./khoi-ngu-canh";
import type { CuocSoan, DongKr, DongSoan } from "./kieu";
import { loiQuyetTu } from "./loi-cua";
import { canSo, demDong, duongTheoDonVi, soCua } from "./luat-ban-nhap";
import { khoaHang, type NguCanhThe, NhomMucTieu } from "./the-nhap";
import { docSoOkr } from "@crm/validation/okr-kr";

const LOC = ["cho"] as const;

export function daDuaVao(s: CuocDangSoan, cuoc: CuocSoan): boolean {
	return s.duaVao.data?.ok === true || cuoc.trangThai === "da-dua-vao";
}

const quyetCua = (
	d: DongSoan,
	cach: QuyetBang["cach"],
	chu = dongKhoi(d).chu,
): QuyetBang => ({ cach, loai: dongKhoi(d).loai, chu, khoaDong: d.khoaDong });

function useNguCanhThe(
	s: CuocDangSoan,
	cuoc: CuocSoan,
	chiCho: boolean,
	hoi: (d: DongSoan) => void,
	veMoc: () => void,
): NguCanhThe {
	const locale = useLocale();
	const m = okrSoanMessages(locale);
	const [loiGoc, setLoi] = useState<
		Readonly<Record<string, string | "xung-dot" | undefined>>
	>({});
	const datLoi = (id: string, chu: string | "xung-dot" | undefined) =>
		setLoi((cu) => ({ ...cu, [id]: chu }));
	const loi: Record<string, ReactNode> = Object.fromEntries(
		Object.entries(loiGoc).map(([id, v]) => [
			id,
			v === "xung-dot" ? (
				<span data-loi-quyet="xung-dot">
					{cuoc.trangThai === "dang"
						? m.loiQuyet.dongCu
						: m.loiQuyet.cuocKhongDang}
				</span>
			) : (
				v
			),
		]),
	);
	const ghi = (
		d: DongSoan,
		vao: {
			deXuatId: string;
			quyet: "nhan" | "sua" | "bac" | "hoan";
			giaTriCuoi?: string;
			kem?: string[];
		},
		khiXong: () => void,
	) => {
		if (s.quyet.isPending) return;
		datLoi(d.id, undefined);
		s.quyet.mutate(vao, {
			onSuccess: (kq) => {
				if (kq.ok) khiXong();
				else datLoi(d.id, m.lyDoQuyet[kq.lyDo]);
			},
			onError: (e) =>
				datLoi(
					d.id,
					loiQuyetTu(e).kieu === "xung-dot" ? "xung-dot" : m.loiQuyet.mang,
				),
		});
	};
	const so = new Intl.NumberFormat(locale);
	return {
		s,
		mOkr: okrMessages(locale),
		khoa: cuoc.trangThai !== "dang" || daDuaVao(s, cuoc),
		loi,
		chiCho,
		hoi,
		veMoc,
		quyet: (d, cach, giaTriCuoi) =>
			ghi(d, { deXuatId: d.id, quyet: cach, giaTriCuoi }, () =>
				s.themQuyetBang([quyetCua(d, cach, giaTriCuoi)]),
			),
		nhom: (mt, kem) =>
			ghi(
				mt,
				{ deXuatId: mt.id, quyet: "nhan", kem: kem.map((k) => k.id) },
				() => {
					s.ghiNhom(
						mt.id,
						kem.map((k) => k.id),
					);
					s.themQuyetBang([mt, ...kem].map((d) => quyetCua(d, "nhan")));
				},
			),
		hoan: (d, keo) =>
			ghi(d, { deXuatId: d.id, quyet: "hoan" }, () => {
				if (d.loai === "muc-tieu-moi") s.ghiNhom(d.id, null);
				s.themQuyetBang([d, ...keo].map((x) => quyetCua(x, "hoan")));
			}),
		soDinhDang: (x) => so.format(x),
	};
}

function DaDuaVao({
	s,
	cuoc,
	m,
}: {
	s: CuocDangSoan;
	cuoc: CuocSoan;
	m: OkrSoanMessages;
}) {
	const { slug } = useParams<{ slug: string }>();
	const kq = s.duaVao.data?.ok === true ? s.duaVao.data : null;
	const soMucTieu = kq ? kq.soMucTieu : s.dem.soMucTieu;
	const soKr = kq ? kq.soKr : s.dem.soKr;
	return (
		<Alert role="status" data-da-dua-vao>
			<AlertTitle>{m.banNhap.daTao(String(soMucTieu))}</AlertTitle>
			<AlertDescription>{m.banNhap.daTaoMoTa(String(soKr))}</AlertDescription>
			<AlertAction placement="below">
				<Button asChild size="sm" variant="outline">
					<Link
						href={duongTheoDonVi(slug, donViCua(cuoc))}
						data-nut="xem-theo-don-vi"
					>
						{m.banNhap.xemTheoDonVi}
					</Link>
				</Button>
			</AlertAction>
		</Alert>
	);
}

function gioNop(locale: string, at: number | null): string | null {
	if (at === null) return null;
	return new Intl.DateTimeFormat(locale, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(at);
}

export function BanNhap({
	s,
	cuoc,
	hoi,
	veMoc,
}: {
	s: CuocDangSoan;
	cuoc: CuocSoan;
	hoi: (d: DongSoan) => void;
	veMoc: () => void;
}) {
	const locale = useLocale();
	const m = okrSoanMessages(locale);
	const mui = useMessages();
	const [loc, datLoc] = useQueryState(
		SOAN_UI.thamSo.loc,
		parseAsStringLiteral(LOC),
	);
	const n = useNguCanhThe(s, cuoc, loc === "cho", hoi, veMoc);
	const xong = daDuaVao(s, cuoc);
	const soDong = demDong(s.cay);
	const gio = gioNop(locale, s.gioNopCuoi);
	const coNhap = s.cay.length > 0;
	return (
		<KaraArtifact
			title={m.dong.tieuDe}
			meta={
				coNhap
					? gio
						? m.dong.meta(String(soDong), gio)
						: m.man.soDong(String(soDong))
					: undefined
			}
			actions={
				coNhap && !xong ? (
					<Button
						variant="ghost"
						size="sm"
						type="button"
						aria-pressed={loc === "cho"}
						data-nut="loc-cho"
						onClick={() => void datLoc(loc === "cho" ? null : "cho")}
					>
						{loc === "cho" ? m.dong.moiDong : m.dong.chiDongCho}
					</Button>
				) : undefined
			}
			footer={
				cuoc.trangThai === "dang" && !xong && coNhap ? (
					<ChanDuaVao s={s} cuoc={cuoc} />
				) : undefined
			}
			busy={
				s.dangTraLoi
					? { label: mui.karaKhung.dangSoanKhoa, reasonShown: true }
					: null
			}
		>
			<div
				className="flex flex-col gap-6"
				data-ban-nhap={coNhap ? "co" : "rong"}
			>
				{xong ? <DaDuaVao s={s} cuoc={cuoc} m={m} /> : null}
				{!coNhap && !xong ? (
					s.dangTraLoi ? (
						<KaraState kind="working" label={m.dong.dangSoanDau} delayMs={0} />
					) : (
						<KaraState
							kind="empty"
							title={m.banNhap.rong}
							description={m.banNhap.rongMoTa}
						/>
					)
				) : null}
				{s.cay.map((khoi, i) => (
					<NhomMucTieu
						key={khoaHang(khoi.mucTieu)}
						n={n}
						m={m}
						khoi={khoi}
						stt={i + 1}
					/>
				))}
			</div>
		</KaraArtifact>
	);
}

function oTrongDau(kr: DongKr, s: CuocDangSoan): string {
	const so = soCua(kr, s.so);
	return docSoOkr(so.khoiDiem) === null ? `khoi-${kr.id}` : `dich-${kr.id}`;
}

export function ChanDuaVao({ s, cuoc }: { s: CuocDangSoan; cuoc: CuocSoan }) {
	const m = okrSoanMessages(useLocale());
	const mui = useMessages();
	const idLyDo = useId();
	const [hoi, setHoi] = useState(false);
	const { soMucTieu, soKr } = s.dem;
	const tuChoi = s.duaVao.data?.ok === false ? s.duaVao.data : null;
	const loi = tuChoi
		? (tuChoi.chiTiet ?? m.banNhap.loiDuaVao[tuChoi.lyDo])
		: s.duaVao.error?.message;
	const thieuKr = s.cay
		.flatMap((k) => k.kr)
		.filter((kr) => s.thieu.includes(kr.id) && canSo(kr));
	const khoa =
		soMucTieu === 0 || s.thieu.length > 0 || s.duaVao.isPending || s.dangTraLoi;
	return (
		<Field data-chan="dua-vao">
			{thieuKr.length > 0 ? (
				<FieldDescription data-thieu-dich>
					{m.banNhap.thieuDich(String(thieuKr.length))}
				</FieldDescription>
			) : null}
			{thieuKr.length > 0 ? (
				<div className="flex flex-wrap items-center gap-2" data-con-thieu>
					<FieldDescription>{m.dong.conThieu}:</FieldDescription>
					{thieuKr.map((kr) => (
						<Button
							key={kr.id}
							variant="link"
							size="sm"
							type="button"
							data-thieu={kr.id}
							onClick={() => {
								const o = document.getElementById(oTrongDau(kr, s));
								o?.scrollIntoView({ block: "center" });
								o?.focus();
							}}
						>
							<span translate="no">{kr.giaTriCuoi ?? kr.ten}</span>
						</Button>
					))}
				</div>
			) : null}
			<Button
				data-nut="dua-vao"
				aria-haspopup="dialog"
				aria-describedby={s.dangTraLoi ? idLyDo : undefined}
				disabled={khoa}
				onClick={() => setHoi(true)}
			>
				{m.banNhap.duaVao(String(soMucTieu), String(soKr))}
			</Button>
			{s.dangTraLoi ? (
				<span id={idLyDo} className="sr-only">
					{mui.karaKhung.dangSoanKhoa}
				</span>
			) : null}
			{loi ? (
				<FieldError data-loi="dua-vao">{loi}</FieldError>
			) : soMucTieu === 0 ? (
				<FieldDescription>{m.banNhap.chuaNhan}</FieldDescription>
			) : thieuKr.length === 0 ? (
				<FieldDescription>
					{m.banNhap.duaVaoMoTa(cuoc.tenDonVi, cuoc.tenChuKy)}
				</FieldDescription>
			) : null}
			<ConfirmDialog
				open={hoi}
				onOpenChange={setHoi}
				tone="default"
				tieuDe={m.banNhap.xacNhan.tieuDe}
				than={m.banNhap.xacNhan.than(
					String(soMucTieu),
					String(soKr),
					cuoc.tenDonVi,
					cuoc.tenChuKy,
				)}
				nut={m.banNhap.xacNhan.nut}
				thoi={m.banNhap.xacNhan.thoi}
				pending={s.duaVao.isPending}
				onConfirm={() => {
					s.guiDuaVao();
					setHoi(false);
				}}
			/>
		</Field>
	);
}
