"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription, FieldError } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { type CuocDangSoan, donViCua } from "./dung-cuoc-soan";
import type { CuocSoan, DongSoan } from "./kieu";
import { duongTheoDonVi } from "./luat-ban-nhap";
import { type NguCanhThe, TheCanChinh, TheKr, TheMucTieu } from "./the-nhap";

export function daDuaVao(s: CuocDangSoan, cuoc: CuocSoan): boolean {
	return s.duaVao.data?.ok === true || cuoc.trangThai === "da-dua-vao";
}

function useNguCanhThe(s: CuocDangSoan, cuoc: CuocSoan): NguCanhThe {
	const locale = useLocale();
	const [loi, setLoi] = useState<Readonly<Record<string, string | undefined>>>(
		{},
	);
	const m = okrSoanMessages(locale);
	const datLoi = (id: string, chu: string | undefined) =>
		setLoi((cu) => ({ ...cu, [id]: chu }));
	const quyet: NguCanhThe["quyet"] = (d: DongSoan, cach, giaTriCuoi) => {
		datLoi(d.id, undefined);
		s.quyet.mutate(
			{ deXuatId: d.id, quyet: cach, giaTriCuoi },
			{
				onSuccess: (kq) => {
					if (!kq.ok) datLoi(d.id, kq.chiTiet ?? m.lyDoQuyet[kq.lyDo]);
				},
				onError: (e) => datLoi(d.id, e.message),
			},
		);
	};
	const so = new Intl.NumberFormat(locale);
	return {
		s,
		mOkr: okrMessages(locale),
		khoa: cuoc.trangThai !== "dang" || daDuaVao(s, cuoc),
		loi,
		quyet,
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

export function BangNhap({ s, cuoc }: { s: CuocDangSoan; cuoc: CuocSoan }) {
	const n = useNguCanhThe(s, cuoc);
	const m = okrSoanMessages(useLocale());
	const xong = daDuaVao(s, cuoc);
	if (s.cay.length === 0 && !xong) {
		return (
			<Empty data-ban-nhap="rong">
				<EmptyHeader>
					<EmptyTitle>{m.banNhap.rong}</EmptyTitle>
					<EmptyDescription>{m.banNhap.rongMoTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	return (
		<div className="flex flex-col gap-4" data-ban-nhap="co">
			{xong ? <DaDuaVao s={s} cuoc={cuoc} m={m} /> : null}
			{s.cay.map((khoi, i) => {
				const bac = khoi.mucTieu.trangThai === "bac";
				return (
					<section
						key={khoi.mucTieu.id}
						aria-label={m.banNhap.mucTieu(String(i + 1))}
						className="flex flex-col gap-2"
						data-khoi-muc-tieu={khoi.mucTieu.id}
					>
						<TheMucTieu n={n} m={m} khoi={khoi} stt={i + 1} />
						{bac ? null : (
							<div className="ms-4 flex flex-col gap-3 border-s ps-3">
								{khoi.kr.map((kr) => (
									<TheKr key={kr.id} n={n} m={m} kr={kr} />
								))}
								{khoi.canChinh.map((d) => (
									<TheCanChinh key={d.id} n={n} m={m} d={d} />
								))}
							</div>
						)}
					</section>
				);
			})}
		</div>
	);
}

export function ChanDuaVao({ s, cuoc }: { s: CuocDangSoan; cuoc: CuocSoan }) {
	const m = okrSoanMessages(useLocale());
	const [hoi, setHoi] = useState(false);
	if (cuoc.trangThai !== "dang" || daDuaVao(s, cuoc)) return null;
	const { soMucTieu, soKr } = s.dem;
	const tuChoi = s.duaVao.data?.ok === false ? s.duaVao.data : null;
	const loi = tuChoi
		? (tuChoi.chiTiet ?? m.banNhap.loiDuaVao[tuChoi.lyDo])
		: s.duaVao.error?.message;
	const khoa =
		soMucTieu === 0 || s.thieu.length > 0 || s.duaVao.isPending || s.dangTraLoi;
	return (
		<Field data-chan="dua-vao">
			<Button
				className="w-fit"
				data-nut="dua-vao"
				aria-haspopup="dialog"
				disabled={khoa}
				onClick={() => setHoi(true)}
			>
				{m.banNhap.duaVao(String(soMucTieu), String(soKr))}
			</Button>
			{loi ? (
				<FieldError data-loi="dua-vao">{loi}</FieldError>
			) : s.thieu.length > 0 ? (
				<FieldDescription data-thieu-dich>
					{m.banNhap.thieuDich(String(s.thieu.length))}
				</FieldDescription>
			) : soMucTieu === 0 ? (
				<FieldDescription>{m.banNhap.chuaNhan}</FieldDescription>
			) : (
				<FieldDescription>
					{m.banNhap.duaVaoMoTa(cuoc.tenDonVi, cuoc.tenChuKy)}
				</FieldDescription>
			)}
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
