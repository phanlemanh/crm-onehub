"use client";

import { Badge } from "@crm/ui/components/badge";
import { ItemDescription } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Timeline,
	TimelineContent,
	TimelineDate,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle,
} from "@crm/ui/components/reui/timeline";
import type { TrangThaiHoiY } from "@crm/validation/okr-hoi-y";
import { okrHoiYMessages } from "@/lib/messages/okr-hoi-y";
import { ChuNguoi, dien, ghep } from "./chu";
import { type HoiY, lucVN, soGioCon } from "./man-hoi-y";

const MOC = ["mo", "han", "gom", "cong-bo"] as const;
type Moc = (typeof MOC)[number];

const MOC_HIEN_TAI = {
	"dang-mo": "mo",
	"dang-gom": "gom",
	"da-cong-bo": "cong-bo",
} satisfies Record<TrangThaiHoiY, Moc>;

type TinhTrang = "qua" | "hien-tai" | "chua";

function tinhTrang(i: number, hienTai: number): TinhTrang {
	if (i < hienTai) return "qua";
	return i === hienTai ? "hien-tai" : "chua";
}

export function DaiMoc({ h, bayGio }: { h: HoiY; bayGio: number }) {
	const locale = useLocale();
	const m = okrHoiYMessages(locale).moc;
	const hienTai = MOC.indexOf(MOC_HIEN_TAI[h.trangThai]);
	const luc = {
		mo: h.hoiY.createdAt,
		han: h.hoiY.hanLuc,
		gom: h.hoiY.hanLuc,
		"cong-bo": h.hoiY.congBoLuc,
	} satisfies Record<Moc, string | null>;
	const gio = soGioCon(h.hoiY.hanLuc, bayGio);
	const dongPha =
		h.trangThai === "dang-mo"
			? gio > 0
				? dien(m.conGio, { n: gio })
				: m.duoiMotGio
			: h.trangThai === "dang-gom"
				? m.daHetHan
				: dien(m.congBoLuc, { luc: lucVN(h.hoiY.congBoLuc ?? "", locale) });

	return (
		<div
			className="flex flex-col gap-2"
			data-khoi="dai-moc"
			data-pha={h.trangThai}
		>
			<Timeline
				aria-label={m.nhan}
				orientation="horizontal"
				role="list"
				value={hienTai + 1}
			>
				{MOC.map((moc, i) => {
					const tt = tinhTrang(i, hienTai);
					const lucMoc = luc[moc];
					return (
						<TimelineItem
							aria-current={tt === "hien-tai" ? "step" : undefined}
							data-moc={moc}
							data-tinh-trang={tt}
							key={moc}
							role="listitem"
							step={i + 1}
						>
							<TimelineHeader>
								<TimelineSeparator />
								<TimelineDate dateTime={lucMoc ?? undefined}>
									{lucMoc ? lucVN(lucMoc, locale) : m.chuaDinh}
								</TimelineDate>
								<TimelineTitle>
									{m.ten[moc]}
									<span className="sr-only">, {m.tinhTrang[tt]}</span>
								</TimelineTitle>
								<TimelineIndicator />
							</TimelineHeader>
							{tt === "hien-tai" ? (
								<TimelineContent>
									<Badge variant="secondary">{m.bayGio}</Badge>
								</TimelineContent>
							) : null}
						</TimelineItem>
					);
				})}
			</Timeline>
			<ItemDescription data-dong-pha suppressHydrationWarning>
				{dongPha} ·{" "}
				{ghep(m.nguoiChon, { ten: <ChuNguoi>{h.nguoiChon.name}</ChuNguoi> })}
			</ItemDescription>
		</div>
	);
}
