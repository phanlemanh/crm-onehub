"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { ItemGroup } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatDay } from "@crm/ui/lib/format";
import { useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { DongLienQuan } from "./dong-lien-quan";
import { ODuKien, OUocLuong } from "./o-du-kien";
import { ChuConNgay } from "./o-moc";
import { ChamTrangThai, coTrangThaiPhu } from "./o-trang-thai";
import { SoLieuLamViec } from "./so-lieu-lam-viec";
import { TomTatHoSo } from "./tom-tat-ho-so";
import type { Viec } from "./viec";

const THE_TONG_QUAN = "tong-quan";
const THE_SO_LIEU = "so-lieu";

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
	const locale = useLocale();
	const m = loTrinhMessages(locale);
	const v = viec.find((x) => x.khoa === khoa);
	const cungLo = v ? viec.filter((x) => x.loTep === v.loTep) : [];
	const theoMa = new Map(cungLo.map((x) => [x.ma, x]));
	const canTruoc = v
		? v.dung_tren
				.map((ma) => theoMa.get(ma))
				.filter((x): x is Viec => x !== undefined)
		: [];
	const dangCho = v ? cungLo.filter((x) => x.dung_tren.includes(v.ma)) : [];
	const phu = v ? coTrangThaiPhu(m, v) : false;
	const [chon, setChon] = useState<{ khoa: string | null; the: string }>({
		khoa: null,
		the: THE_TONG_QUAN,
	});
	const chuKho = v?.tom_tat?.chu_kho ?? null;
	const the =
		chon.khoa === khoa && (chon.the !== THE_SO_LIEU || chuKho)
			? chon.the
			: THE_TONG_QUAN;
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
							<ChamTrangThai v={v} />
						</DetailSheetStat>
						<DetailSheetStat label={m.hoSo.moc}>
							{v.moc ? (
								<span className="flex items-center gap-2">
									<span className="tabular-nums">
										{formatDay(v.moc.ngay, locale)}
									</span>
									<ChuConNgay v={v} />
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
					<DetailSheetTabs
						onValueChange={(moi) => setChon({ khoa, the: moi })}
						tabs={[
							{
								value: THE_TONG_QUAN,
								label: m.hoSo.tongQuan,
								content: (
									<DetailSheetBody>
										{v.theo_loi || v.co.length ? (
											<DetailSheetSection>
												{v.theo_loi ? (
													<Alert data-lo-trinh-theo-loi>
														<AlertDescription>
															{m.hoSo.theoLoi}
														</AlertDescription>
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
										<TomTatHoSo moiNguoi={v.tom_tat?.moi_nguoi ?? null} />
										{phu || v.moc || v.bat_khi || v.vi_sao || v.duKien ? (
											<DetailSheetSection
												data-lo-trinh-chi-tiet=""
												title={m.hoSo.chiTiet}
											>
												<DetailSheetProperties columns={1}>
													{phu ? (
														<DetailSheetProperty label={m.hoSo.keHoachGhi}>
															<span data-lo-trinh-trang-thai-phu translate="no">
																{v.trang_thai}
															</span>
														</DetailSheetProperty>
													) : null}
													{v.moc ? (
														<DetailSheetProperty label={m.hoSo.moc}>
															<span translate="no">{v.moc.ten}</span>
														</DetailSheetProperty>
													) : null}
													{v.duKien ? (
														<DetailSheetProperty label={m.duKien.nhan}>
															<ODuKien duKien={v.duKien} gon={false} />
														</DetailSheetProperty>
													) : null}
													{v.nhom_trang_thai !== "da-giao" && v.gio_may ? (
														<DetailSheetProperty label={m.duKien.uocLuong}>
															<OUocLuong gioMay={v.gio_may} />
														</DetailSheetProperty>
													) : null}
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
								),
							},
							...(chuKho
								? [
										{
											value: THE_SO_LIEU,
											label: m.hoSo.theSoLieu,
											content: (
												<DetailSheetBody>
													<SoLieuLamViec chuKho={chuKho} />
												</DetailSheetBody>
											),
										} satisfies DetailSheetTab,
									]
								: []),
						]}
						value={the}
					/>
				</>
			) : null}
		</DetailSheet>
	);
}
