"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrMessages } from "@/lib/messages/okr";
import { giaTri } from "./bang-kr";
import { ChipGopY, DIEM_CAM_GOP_Y } from "./chip-gop-y";
import type { MucTieu } from "./kieu";
import { NhomMucTieuGap } from "./nhom-da-bo";
import { NhanTinhTrang, ThanhTienDo } from "./tien-do-kr";

type Kr = MucTieu["keyResults"][number];

export type PhanBa = {
	kr: { kr: Kr; mucTieu: MucTieu }[];
	thamGia: MucTieu[];
};

/**
 * Chia mục tiêu của `okr.mine` cho phần 3: KR người xem phụ trách (cờ `laCuaToi` máy chủ
 * tính), và mục tiêu họ có mặt mà không phụ trách KR nào — để không mục tiêu nào rời Của tôi.
 */
export function chiaPhanBa(ds: readonly MucTieu[]): PhanBa {
	const kr = ds.flatMap((mucTieu) =>
		mucTieu.keyResults
			.filter((k) => k.laCuaToi)
			.map((k) => ({ kr: k, mucTieu })),
	);
	const coKr = new Set(kr.map((x) => x.mucTieu.id));
	return { kr, thamGia: ds.filter((mt) => !coKr.has(mt.id)) };
}

export function PhanKrPhuTrach({
	ds,
	tenKy,
	nhomSau,
}: {
	ds: readonly MucTieu[];
	tenKy: string;
	/** Hai nhóm «Đang theo dõi», «Đã bỏ» đứng ngay sau nhóm tham gia, trong phần này. */
	nhomSau?: React.ReactNode;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).baPhan;
	const openRecord = useOpenRecord();
	const { kr, thamGia } = chiaPhanBa(ds);
	const cot: SimpleTableColumn[] = [
		{ id: "kr", header: m.cotKr },
		{
			id: "tien-do",
			header: m.cotTienDo,
			width: "w-56",
			className: "hidden sm:table-cell",
		},
		{
			id: "tinh-trang",
			header: m.cotTinhTrang,
			width: "w-36",
			className: "hidden sm:table-cell",
		},
	];
	return (
		<section
			className="flex flex-col gap-3"
			data-phan="kr-phu-trach"
			data-trang-thai="ST-cuatoi-codulieu"
		>
			<SectionHeading level={2}>{m.phan3}</SectionHeading>
			{kr.length > 0 ? (
				<>
					<p className="text-muted-foreground text-sm">
						{m.krTrong(kr.length, tenKy)}
					</p>
					<SimpleTable columns={cot} surface="page">
						{kr.map(({ kr: k, mucTieu }, i) => (
							<SimpleTableRow data-kr={k.id} key={k.id}>
								<SimpleTableCell>
									<span className="flex flex-col items-start gap-0.5">
										<Button
											className="h-auto p-0 text-left"
											data-mo-muc-tieu={mucTieu.id}
											onClick={() =>
												openRecord({ kind: "objective", id: mucTieu.id })
											}
											variant="link"
										>
											<span translate="no">{k.title}</span>
										</Button>
										<span
											className="text-muted-foreground text-xs"
											translate="no"
										>
											{mucTieu.unitName} · {mucTieu.title}
										</span>
										{mucTieu.soGopYCho > 0 &&
										kr.findIndex((x) => x.mucTieu.id === mucTieu.id) === i ? (
											<ChipGopY mt={mucTieu} />
										) : null}
										<span className="flex items-center gap-3 pt-1 sm:hidden">
											<span className="text-xs tabular-nums">
												{giaTri(k, k.currentValue, locale)}
											</span>
											<NhanTinhTrang
												expected={mucTieu.expected}
												kind={mucTieu.kind}
												laMoc={k.kind === "moc"}
												progress={k.progress}
											/>
										</span>
									</span>
								</SimpleTableCell>
								<SimpleTableCell className="hidden sm:table-cell">
									<ThanhTienDo
										expected={mucTieu.expected}
										progress={k.progress}
										ten={k.title}
									/>
								</SimpleTableCell>
								<SimpleTableCell className="hidden sm:table-cell">
									<NhanTinhTrang
										expected={mucTieu.expected}
										kind={mucTieu.kind}
										laMoc={k.kind === "moc"}
										progress={k.progress}
									/>
								</SimpleTableCell>
							</SimpleTableRow>
						))}
					</SimpleTable>
				</>
			) : null}
			<NhomMucTieuGap
				danhDauCuaToi
				diemCam={DIEM_CAM_GOP_Y}
				ds={thamGia}
				moNhuBangChinh
				hienDonVi
				ma="tham-gia"
				nhan={`${m.thamGia} (${thamGia.length})`}
			/>
			{nhomSau}
		</section>
	);
}
