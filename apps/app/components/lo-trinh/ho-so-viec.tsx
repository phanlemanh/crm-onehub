"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Card, CardContent } from "@crm/ui/components/card";
import { ItemGroup } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import type { ReactNode } from "react";
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
	const o: { nhan: string; gt: ReactNode }[] = v
		? [
				{ nhan: m.hoSo.trangThai, gt: <OTrangThai v={v} /> },
				{
					nhan: m.hoSo.moc,
					gt: v.moc ? (
						<span className="flex flex-col gap-0.5">
							<OMoc v={v} />
							<span className="text-muted-foreground text-xs" translate="no">
								{v.moc.ten}
							</span>
						</span>
					) : (
						<span className="text-muted-foreground">{m.loc.chuaHenMoc}</span>
					),
				},
				{ nhan: m.hoSo.loTrinh, gt: <span translate="no">{v.loTen}</span> },
				{
					nhan: m.hoSo.nhom,
					gt: <span translate="no">{v.nhom || m.loc.khongNhom}</span>,
				},
			]
		: [];
	return (
		<Sheet onOpenChange={(mo) => (mo ? null : dong())} open={v !== undefined}>
			<SheetContent data-lo-trinh-chi-tiet-viec={v?.ma} size="lg">
				{v ? (
					<>
						<SheetHeader>
							<SheetTitle translate="no">{v.cau_giao}</SheetTitle>
							<SheetDescription translate="no">
								{v.ma} · {v.loTen}
								{v.nhom ? ` · ${v.nhom}` : ""}
							</SheetDescription>
						</SheetHeader>
						<SheetBody className="flex flex-col gap-6 text-sm">
							<Card>
								<CardContent>
									<dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
										{o.map((x) => (
											<div className="flex flex-col gap-1" key={x.nhan}>
												<dt className="text-muted-foreground text-xs">
													{x.nhan}
												</dt>
												<dd>{x.gt}</dd>
											</div>
										))}
									</dl>
								</CardContent>
							</Card>
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
							{v.bat_khi || v.vi_sao ? (
								<div className="flex flex-col gap-3">
									<SectionHeading level={4}>{m.hoSo.chiTiet}</SectionHeading>
									<dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-2">
										{v.bat_khi ? (
											<>
												<dt className="text-muted-foreground">
													{m.hoSo.thanhCongKhi}
												</dt>
												<dd translate="no">{v.bat_khi}</dd>
											</>
										) : null}
										{v.vi_sao ? (
											<>
												<dt className="text-muted-foreground">
													{m.hoSo.viSao}
												</dt>
												<dd translate="no">{v.vi_sao}</dd>
											</>
										) : null}
									</dl>
								</div>
							) : null}
							{canTruoc.length ? (
								<div className="flex flex-col gap-2" data-lo-trinh-can-truoc>
									<SectionHeading level={4}>
										{m.hoSo.canXongTruoc}
									</SectionHeading>
									<ItemGroup>
										{canTruoc.map((x) => (
											<DongLienQuan key={x.khoa} moViec={moViec} x={x} />
										))}
									</ItemGroup>
								</div>
							) : null}
							{dangCho.length ? (
								<div className="flex flex-col gap-2" data-lo-trinh-dang-cho>
									<SectionHeading level={4}>{m.hoSo.dangCho}</SectionHeading>
									<ItemGroup>
										{dangCho.map((x) => (
											<DongLienQuan key={x.khoa} moViec={moViec} x={x} />
										))}
									</ItemGroup>
								</div>
							) : null}
						</SheetBody>
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
