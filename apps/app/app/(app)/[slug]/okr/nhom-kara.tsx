"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import { Button } from "@crm/ui/components/button";
import { Field, FieldDescription } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
} from "@crm/ui/components/item";
import { KaraLabel, KaraMark } from "@crm/ui/components/kara";
import { KaraProposal } from "@crm/ui/components/kara/proposal";
import { KaraState } from "@crm/ui/components/kara/state";
import { useLocale } from "@crm/ui/components/locale-provider";
import type {
	ProposedChangeAction,
	ProposedChangeDecided,
	ProposedChangeKind,
} from "@crm/ui/components/proposed-change";
import type { Locale } from "@crm/ui/lib/locale";
import { type ReactNode, useId, useState } from "react";
import {
	type OkrGopYMessages,
	okrGopYMessages,
} from "@/lib/messages/okr-gop-y";
import { dauThangSau, homNayVn, OKR_CHU_KY } from "@/lib/okr-chu-ky-nhan";
import type { CachQuyet, GopYMucTieu, KetDong, LyDoTat } from "./gop-y-kara";
import type { DongHien } from "./the-gop-y-props";

export type LoiDiKr =
	| { loai: "kr-moi" }
	| { loai: "sua-kr"; keyResultId: string }
	| { loai: "sua-muc-tieu" };

const DINH_DANG_GIO = { vi: "vi-VN", en: "en-US" } satisfies Record<
	Locale,
	string
>;

function gioDoc(luc: string, locale: Locale): string {
	return new Intl.DateTimeFormat(DINH_DANG_GIO[locale], {
		hour: "2-digit",
		minute: "2-digit",
		day: "2-digit",
		month: "2-digit",
		timeZone: OKR_CHU_KY.muiGio,
	}).format(new Date(luc));
}

function tomTatCua(d: DongHien, m: OkrGopYMessages): string {
	const ma = d.maVanDe;
	if (ma && ma in m.tomTat) return m.tomTat[ma as keyof typeof m.tomTat];
	return d.lyDo;
}

function chuBienNhan(
	d: DongHien,
	k: KetDong,
	m: OkrGopYMessages,
): ProposedChangeDecided["text"] {
	if (k.ket === "skipped") {
		if (d.loai === "viet-lai")
			return d.truong === "whyNow"
				? m.bienNhan.boQuaCau(d.sau ?? "")
				: m.bienNhan.boQuaTen(d.sau ?? "");
		if (d.loai === "can-chinh")
			return m.bienNhan.boQuaCanChinh(d.tenDich ?? "");
		return m.bienNhan.boQuaHoi(tomTatCua(d, m));
	}
	if (k.daHoanTac) {
		if (d.loai === "can-chinh")
			return m.bienNhan.hoanTacCanChinh(d.tenDich ?? "");
		if (d.truong === "whyNow") return m.bienNhan.hoanTacViSao;
		if (d.truong === "title") return m.bienNhan.hoanTacMucTieu(d.truoc ?? "");
		return m.bienNhan.hoanTacKr(d.truoc ?? "");
	}
	if (d.loai === "can-chinh") return m.bienNhan.daCanChinh;
	if (d.truong === "title") return m.bienNhan.daDoiTenMucTieu;
	if (d.truong === "whyNow") return m.bienNhan.daThayViSao;
	return m.bienNhan.daDoiTenKr;
}

function nutChinhVietLai(d: DongHien, m: OkrGopYMessages): string {
	if (d.truong === "title") return m.de.doiTenMucTieu;
	if (d.truong === "whyNow") return m.de.thayViSao;
	return m.de.doiTenKr;
}

type LoiDiCauHoi = { nhan: string; di: LoiDiKr };

function loiDiCuaCauHoi(d: DongHien, m: OkrGopYMessages): LoiDiCauHoi {
	if (d.maVanDe === "thieu-doi-trong")
		return { nhan: m.de.themDoiTrong, di: { loai: "kr-moi" } };
	if (d.keyResultId)
		return {
			nhan: m.de.suaKrNay,
			di: { loai: "sua-kr", keyResultId: d.keyResultId },
		};
	return { nhan: m.de.suaMucTieu, di: { loai: "sua-muc-tieu" } };
}

export function DeXuatNeo({
	d,
	gopY,
	moKr,
}: {
	d: DongHien;
	gopY: GopYMucTieu;
	moKr: (di: LoiDiKr) => void;
}) {
	const m = okrGopYMessages(useLocale());
	const [sua, setSua] = useState<string | null>(null);
	const k = gopY.ketCua(d.id);
	const khoa =
		!gopY.ghiDuoc || (gopY.dangQuyet !== null && gopY.dangQuyet !== d.id);
	const quyet = (cach: CachQuyet, giaTri?: string) => {
		setSua(null);
		gopY.quyet(d, cach, giaTri);
	};
	const decided: ProposedChangeDecided | undefined = k
		? {
				decision: k.ket,
				text: chuBienNhan(d, k, m),
				onUndo: gopY.coHoanTac(d) ? () => void gopY.hoanTac(d) : undefined,
			}
		: undefined;
	const boQua: ProposedChangeAction = {
		id: "bo-qua",
		label: m.de.boQua,
		tone: "quiet",
		onClick: () => quyet(d.loai === "hoi" ? "bo-qua" : "bac"),
	};
	let kind: ProposedChangeKind = "rewrite";
	let value: ReactNode = d.sau ?? "";
	let rationale: ReactNode = d.lyDo;
	let actions: ProposedChangeAction[];
	if (d.loai === "hoi") {
		const loi = loiDiCuaCauHoi(d, m);
		kind = "question";
		value = d.sau ?? d.lyDo;
		rationale = d.sau ? d.lyDo : undefined;
		actions = [
			{
				id: "loi-di",
				label: loi.nhan,
				tone: "secondary",
				onClick: () => moKr(loi.di),
			},
			boQua,
		];
	} else if (d.loai === "can-chinh") {
		kind = "compact";
		value = m.dong.gopVao(d.tenDich ?? "");
		actions = [
			{
				id: "can-chinh",
				label: m.dong.canChinh,
				tone: "primary",
				onClick: () => quyet("nhan"),
			},
			boQua,
		];
	} else if (sua !== null) {
		actions = [
			{
				id: "nhan-ban-sua",
				label: nutChinhVietLai(d, m),
				tone: "primary",
				disabled: sua.trim() === "",
				onClick: () => quyet("sua", sua.trim()),
			},
			{
				id: "huy",
				label: m.de.huy,
				tone: "quiet",
				onClick: () => setSua(null),
			},
		];
	} else {
		actions = [
			{
				id: "nhan",
				label: nutChinhVietLai(d, m),
				tone: "primary",
				onClick: () => quyet("nhan"),
			},
			{
				id: "sua",
				label: m.de.sua,
				tone: "secondary",
				onClick: () => setSua(d.sau ?? ""),
			},
			boQua,
		];
	}
	return (
		<KaraProposal
			actions={actions.map((a) => ({ ...a, disabled: khoa || a.disabled }))}
			before={d.loai === "viet-lai" ? (d.truoc ?? "") : undefined}
			data-gop-y={d.id}
			data-highlighted={gopY.noi === d.id ? "true" : undefined}
			data-kara-proposal-kr={d.keyResultId ?? undefined}
			data-trang-thai={gopY.trangThai(d.id)}
			decided={decided}
			editing={
				sua === null
					? undefined
					: { value: sua, onChange: setSua, onCancel: () => setSua(null) }
			}
			error={gopY.loiDong[d.id]}
			highlighted={gopY.noi === d.id}
			kind={kind}
			lockedReason={gopY.ghiDuoc ? undefined : m.de.khoaSua}
			media={false}
			pending={gopY.dangQuyet === d.id}
			rationale={rationale}
			tabIndex={-1}
			value={value}
		/>
	);
}

function NutNhoKara({ gopY, nhan }: { gopY: GopYMucTieu; nhan: string }) {
	const m = okrGopYMessages(useLocale());
	const id = useId();
	const nut = gopY.nut;
	if (nut.loai === "an") return null;
	const khoa = nut.loai === "khoa";
	const moTa = khoa
		? nut.vi === "het-luot"
			? m.vung.hetLuot
			: m.vung.tamNghi(dauThangSau(homNayVn(new Date())))
		: undefined;
	const button = (
		<Button
			aria-describedby={moTa ? id : undefined}
			data-nut="nho-kara"
			disabled={khoa || gopY.dangGui}
			onClick={gopY.nho}
			size="sm"
			type="button"
			variant="outline"
		>
			<Icon data-icon="inline-start" icon={AiGenerate} />
			{nhan}
		</Button>
	);
	if (!moTa) return button;
	return (
		<Field data-disabled data-nut-kara={khoa ? nut.vi : undefined}>
			<div>{button}</div>
			<FieldDescription id={id}>{moTa}</FieldDescription>
		</Field>
	);
}

function cauTat(vi: LyDoTat, m: OkrGopYMessages): string {
	switch (vi) {
		case "het-luot":
			return m.vung.hetLuot;
		case "tam-nghi":
			return m.vung.tamNghi(dauThangSau(homNayVn(new Date())));
		case "chua-bat":
			return m.vung.chuaBat;
		case "tam-tat":
			return m.vung.tamTat;
	}
}

function KhoiTat({ vi, nhan }: { vi: LyDoTat; nhan: string }) {
	const m = okrGopYMessages(useLocale());
	const id = useId();
	return (
		<KaraState
			kind="off"
			describedBy={id}
			reason={cauTat(vi, m)}
			action={
				<div>
					<Button
						aria-describedby={id}
						data-nut="nho-kara"
						disabled
						size="sm"
						type="button"
						variant="outline"
					>
						<Icon data-icon="inline-start" icon={AiGenerate} />
						{nhan}
					</Button>
				</div>
			}
		/>
	);
}

function KhoiLoiKara({ gopY, moTa }: { gopY: GopYMucTieu; moTa: string }) {
	const m = okrGopYMessages(useLocale());
	if (gopY.tat !== null) return <KhoiTat nhan={m.vung.docLai} vi={gopY.tat} />;
	return (
		<KaraState
			kind="error"
			what={m.vung.viecDoc}
			description={moTa}
			onRetry={gopY.thuLai}
		/>
	);
}

function SauKhiQuyetHet({ gopY }: { gopY: GopYMucTieu }) {
	const m = okrGopYMessages(useLocale());
	if (gopY.docLai === "dang-doc")
		return <KaraState kind="working" label={m.vung.dangDoc} />;
	if (gopY.docLai === "nho-loi")
		return (
			<KhoiLoiKara gopY={gopY} moTa={m.vung.nhoLoi[gopY.loiNho ?? "khac"]} />
		);
	if (gopY.docLai === "loi")
		return <KhoiLoiKara gopY={gopY} moTa={m.vung.loiMoTa} />;
	return (
		<div>
			<NutNhoKara gopY={gopY} nhan={m.vung.docLai} />
		</div>
	);
}

export function VungKara({
	gopY,
	soKr,
	moKr,
}: {
	gopY: GopYMucTieu;
	soKr: number;
	moKr: (di: LoiDiKr) => void;
}) {
	const locale = useLocale();
	const m = okrGopYMessages(locale);
	const docLuc = gopY.docLuc ? gioDoc(gopY.docLuc, locale) : undefined;
	switch (gopY.noiDung) {
		case "tat":
			return null;
		case "dang-doc":
			return (
				<div data-nhom-kara="dang-doc">
					<KaraState kind="working" label={m.vung.dangDoc} />
				</div>
			);
		case "chua-goi":
			return (
				<Item data-nhom-kara="chua-goi" size="sm" variant="outline">
					<ItemContent>
						<KaraMark />
						<ItemDescription>{m.vung.moTaChuaGoi}</ItemDescription>
					</ItemContent>
					<ItemActions>
						<NutNhoKara gopY={gopY} nhan={m.vung.nho} />
					</ItemActions>
				</Item>
			);
		case "rong":
			return (
				<div data-nhom-kara="rong">
					<KaraState
						kind="empty"
						title={m.vung.rong}
						description={m.vung.rongMoTa(docLuc ?? "")}
						action={
							gopY.tat !== null ? (
								<KhoiTat nhan={m.vung.docLai} vi={gopY.tat} />
							) : (
								<NutNhoKara gopY={gopY} nhan={m.vung.docLai} />
							)
						}
					/>
				</div>
			);
		case "loi":
			return (
				<div data-nhom-kara="loi">
					<KhoiLoiKara gopY={gopY} moTa={m.vung.loiMoTa} />
				</div>
			);
		case "nho-loi":
			return (
				<div data-nhom-kara="nho-loi">
					<KhoiLoiKara
						gopY={gopY}
						moTa={m.vung.nhoLoi[gopY.loiNho ?? "khac"]}
					/>
				</div>
			);
		case "tai-loi":
			return (
				<div data-nhom-kara="tai-loi">
					<KaraState
						kind="error"
						what={m.vung.viecTai}
						description={m.vung.taiLoiMoTa}
						onRetry={gopY.taiLai}
					/>
				</div>
			);
		case "co-gop-y":
			return (
				<div className="flex flex-col gap-1" data-nhom-kara="co-gop-y">
					<KaraLabel
						readAt={docLuc}
						reason={m.vung.lyDo(String(soKr))}
						scope={
							gopY.conCho > 0
								? m.vung.soCho(String(gopY.conCho))
								: m.vung.daXemHet
						}
					/>
					{gopY.nhom.capBo.map((d) => (
						<DeXuatNeo d={d} gopY={gopY} key={d.id} moKr={moKr} />
					))}
					{gopY.conCho === 0 ? <SauKhiQuyetHet gopY={gopY} /> : null}
				</div>
			);
	}
}
