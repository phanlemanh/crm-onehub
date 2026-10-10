"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { ItemGroup } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
} from "@/components/detail-sheet";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { DongLienQuan } from "./dong-lien-quan";
import { OMoc } from "./o-moc";
import { OTrangThai } from "./o-trang-thai";
import type { Viec } from "./viec";

export function HoSoViec({
	viec,
	khoa,
	moViec,
	dong,
}: {
	viec: Viec[];
	khoa: string | null;
	moViec: (khoa: string) => void;
	dong: () => void;
}) {
	const m = loTrinhMessages(useLocale());
	const v = viec.find((x) => x.khoa === khoa);
	const cungLo = v ? viec.filter((x) => x.loTep === v.loTep) : [];
	const theoMa = new Map(cungLo.map((x) => [x.ma, x]));
	const canTruoc = v
		? v.dung_tren
				.map((ma) => theoMa.get(ma))
				.filter((x): x is Viec => x !== undefined)
		: [];
	const dangCho = v ? cungLo.filter((x) => x.dung_tren.includes(v.ma)) : [];
	return (
		<DetailSheet
			data-lo-trinh-chi-tiet-viec={v?.ma}
			onOpenChange={(mo) => (mo ? null : dong())}
			open={v !== undefined}
		>
			{v ? (
				<>
					<DetailSheetHeader
						description={
							<span translate="no">
								{v.ma} · {v.loTen}
								{v.nhom ? ` · ${v.nhom}` : ""}
							</span>
						}
						title={<span translate="no">{v.cau_giao}</span>}
					/>
					<DetailSheetStats>
						<DetailSheetStat label={m.hoSo.trangThai}>
							<OTrangThai v={v} />
						</DetailSheetStat>
						<DetailSheetStat label={m.hoSo.moc}>
							{v.moc ? (
								<span className="flex flex-col gap-0.5">
									<OMoc v={v} />
									<span
										className="font-normal text-muted-foreground text-xs"
										translate="no"
									>
										{v.moc.ten}
									</span>
								</span>
							) : (
								<span className="font-normal text-muted-foreground">
									{m.loc.chuaHenMoc}
								</span>
							)}
						</DetailSheetStat>
						<DetailSheetStat label={m.hoSo.loTrinh}>
							<span translate="no">{v.loTen}</span>
						</DetailSheetStat>
						<DetailSheetStat label={m.hoSo.nhom}>
							<span translate="no">{v.nhom || m.loc.khongNhom}</span>
						</DetailSheetStat>
					</DetailSheetStats>
					<DetailSheetBody>
						{v.theo_loi || v.co.length ? (
							<DetailSheetSection>
								{v.theo_loi ? (
									<Alert data-lo-trinh-theo-loi>
										<AlertDescription>{m.hoSo.theoLoi}</AlertDescription>
									</Alert>
								) : null}
								{v.co.length ? (
									<Alert data-lo-trinh-lech variant="warning">
										<AlertTitle>{m.hoSo.lech}</AlertTitle>
										<AlertDescription translate="no">
											{v.co.join(" · ")}
										</AlertDescription>
									</Alert>
								) : null}
							</DetailSheetSection>
						) : null}
						{v.bat_khi || v.vi_sao ? (
							<DetailSheetSection title={m.hoSo.chiTiet}>
								<DetailSheetProperties columns={1}>
									{v.bat_khi ? (
										<DetailSheetProperty label={m.hoSo.thanhCongKhi}>
											<span translate="no">{v.bat_khi}</span>
										</DetailSheetProperty>
									) : null}
									{v.vi_sao ? (
										<DetailSheetProperty label={m.hoSo.viSao}>
											<span translate="no">{v.vi_sao}</span>
										</DetailSheetProperty>
									) : null}
								</DetailSheetProperties>
							</DetailSheetSection>
						) : null}
						{canTruoc.length ? (
							<DetailSheetSection title={m.hoSo.canXongTruoc}>
								<ItemGroup data-lo-trinh-can-truoc>
									{canTruoc.map((x) => (
										<DongLienQuan key={x.khoa} moViec={moViec} x={x} />
									))}
								</ItemGroup>
							</DetailSheetSection>
						) : null}
						{dangCho.length ? (
							<DetailSheetSection title={m.hoSo.dangCho}>
								<ItemGroup data-lo-trinh-dang-cho>
									{dangCho.map((x) => (
										<DongLienQuan key={x.khoa} moViec={moViec} x={x} />
									))}
								</ItemGroup>
							</DetailSheetSection>
						) : null}
					</DetailSheetBody>
				</>
			) : null}
		</DetailSheet>
	);
}
