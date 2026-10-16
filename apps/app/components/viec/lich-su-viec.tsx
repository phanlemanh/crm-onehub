"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { dateFormat, formatDay } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { VIEC } from "@crm/validation/viec";
import { useQuery } from "@tanstack/react-query";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { DetailSheetBody, DetailSheetSection } from "@/components/detail-sheet";
import { type ViecMessages, viecMessages } from "@/lib/messages/viec";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type DongVet = RouterOutputs["viec"]["lichSu"][number];

const LUC = {
	dateStyle: "short",
	timeStyle: "short",
	timeZone: VIEC.muiGio,
} as const;

function moTaVet(m: ViecMessages, vet: DongVet["vet"], locale: Locale): string {
	const l = m.lichSu.loai;
	switch (vet.loai) {
		case "tao":
			return l.tao;
		case "doi-trang-thai":
			return dien(l["doi-trang-thai"], { den: m.trangThai[vet.sau.trangThai] });
		case "doi-nguoi-thuc-hien":
			return dien(l["doi-nguoi-thuc-hien"], { ten: vet.sau.ten });
		case "doi-han":
			if (vet.sau.boi) {
				return dien(l["doi-han-tu-doi"], {
					truoc: vet.truoc.hanNgay
						? formatDay(vet.truoc.hanNgay, locale)
						: m.khongHan,
					sau: vet.sau.hanNgay
						? formatDay(vet.sau.hanNgay, locale)
						: m.khongHan,
					viec: vet.sau.boi.tieuDe,
				});
			}
			return dien(l["doi-han"], {
				han: vet.sau.hanNgay ? formatDay(vet.sau.hanNgay, locale) : m.khongHan,
			});
		case "doi-bat-dau":
			if (vet.sau.boi) {
				return dien(l["doi-bat-dau-tu-doi"], {
					truoc: vet.truoc.batDauNgay
						? formatDay(vet.truoc.batDauNgay, locale)
						: m.khongHan,
					sau: vet.sau.batDauNgay
						? formatDay(vet.sau.batDauNgay, locale)
						: m.khongHan,
					viec: vet.sau.boi.tieuDe,
				});
			}
			return dien(l["doi-bat-dau"], {
				ngay: vet.sau.batDauNgay
					? formatDay(vet.sau.batDauNgay, locale)
					: m.khongHan,
			});
		case "doi-du-an":
			return vet.sau
				? dien(l["vao-du-an"], { ten: vet.sau.ten })
				: dien(l["ra-du-an"], { ten: vet.truoc?.ten ?? "" });
		case "them-phu-thuoc":
			return dien(l["them-phu-thuoc"], { ten: vet.sau.viec.tieuDe });
		case "go-phu-thuoc":
			return dien(l["go-phu-thuoc"], { ten: vet.truoc.viec.tieuDe });
		case "doi-noi-dung":
			return l["doi-noi-dung"];
		case "gan":
			return dien(l.gan, { ten: vet.sau.ten });
		case "go":
			return dien(l.go, { ten: vet.truoc.ten });
		case "theo-doi":
			return dien(l["theo-doi"], { ten: vet.sau.ten });
		case "bo-theo-doi":
			return dien(l["bo-theo-doi"], { ten: vet.truoc.ten });
		case "chuyen-viec":
			return l["chuyen-viec"];
		case "go-do-ban-ghi-xoa":
			return dien(l["go-do-ban-ghi-xoa"], { ten: vet.sau.ten });
		case "them-viec-con":
			return dien(l["them-viec-con"], { ten: vet.sau.tieuDe });
	}
}

export function LichSuViec({ viecId }: { viecId: string }) {
	const locale = useLocale();
	const m = viecMessages(locale);
	const trpc = useTRPC();
	const q = useQuery(trpc.viec.lichSu.queryOptions({ id: viecId }));
	if (q.isPending) {
		return (
			<DetailSheetBody>
				<DetailSheetSection>
					<Skeleton className="h-10 w-full" />
				</DetailSheetSection>
			</DetailSheetBody>
		);
	}
	if (q.isError) {
		return (
			<DetailSheetBody>
				<VungTaiLoi
					dangTai={q.isFetching}
					moTa={m.loi.moTa}
					onThuLai={() => void q.refetch()}
					tieuDe={m.khung.loiLichSu}
				/>
			</DetailSheetBody>
		);
	}
	return (
		<DetailSheetBody>
			<DetailSheetSection>
				<ItemGroup data-lich-su-viec="">
					{q.data.map((d) => (
						<Item data-vet={d.loai} data-vet-id={d.id} key={d.id} size="sm">
							<ItemContent>
								<ItemTitle>
									<span>
										<span translate="no">
											{d.nguoi?.name ?? m.lichSu.heThong}
										</span>{" "}
										{moTaVet(m, d.vet, locale)}
									</span>
								</ItemTitle>
								<ItemDescription>
									{dateFormat(locale, LUC).format(new Date(d.luc))} ·{" "}
									{m.lichSu.nguon[d.nguon]}
								</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}
