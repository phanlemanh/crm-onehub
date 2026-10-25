"use client";

import { Button } from "@crm/ui/components/button";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { useState } from "react";
import { DauBang, PhanConLai } from "./bang";
import type { KrHop } from "./du-lieu";
import { DongLyDo, TienDoKr } from "./o-dong";
import { ghiChuMoiNhat, tenMucTieu } from "./tinh";

const XEP_THEO_HOM_NAY =
	"Xếp theo: tự tin tụt, rồi KR im lâu nhất, rồi ghi chú mới. Mỗi dòng là một KR.";

const COT_HOM_NAY: SimpleTableColumn[] = [
	{ id: "kr", header: "KR và vì sao đáng bàn" },
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-[26%]",
		className: "hidden md:table-cell",
	},
	{
		id: "ghi-chu",
		header: "Ghi chú mới nhất",
		width: "w-[30%]",
		className: "hidden lg:table-cell",
	},
];

function BangHomNayKr({
	ds,
	onMoKr,
}: {
	ds: KrHop[];
	onMoKr: (krId: string) => void;
}) {
	return (
		<SimpleTable columns={COT_HOM_NAY} surface="page">
			{ds.map((kr) => {
				const lan = ghiChuMoiNhat(kr);
				return (
					<SimpleTableRow data-kr-hop={kr.id} key={kr.id}>
						<SimpleTableCell className="py-3 align-top whitespace-normal">
							<span className="flex flex-col items-start gap-1.5">
								<Button
									data-mo-kr={kr.id}
									onClick={() => onMoKr(kr.id)}
									size="xs-wrap"
									variant="link"
								>
									<span translate="no">{kr.tieuDe}</span>
								</Button>
								<span className="text-muted-foreground text-xs">
									<span translate="no">{tenMucTieu(kr)}</span> · Phụ trách{" "}
									<span translate="no">{kr.chuTen}</span>
								</span>
								<DongLyDo kr={kr} />
								<span className="md:hidden">
									<TienDoKr kr={kr} />
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell className="hidden py-3 align-top md:table-cell">
							<TienDoKr kr={kr} />
						</SimpleTableCell>
						<SimpleTableCell className="hidden py-3 align-top text-sm whitespace-normal lg:table-cell">
							{lan ? (
								<span translate="no">«{lan.ghiChu}»</span>
							) : (
								<span className="text-muted-foreground">—</span>
							)}
						</SimpleTableCell>
					</SimpleTableRow>
				);
			})}
		</SimpleTable>
	);
}

export function BangHomNay({
	dangBan,
	conLai,
	onMoKr,
}: {
	dangBan: KrHop[];
	conLai: KrHop[];
	onMoKr: (krId: string) => void;
}) {
	const [mo, setMo] = useState(false);
	return (
		<section
			aria-labelledby="dang-ban"
			className="flex flex-col gap-4"
			data-bang-hop="hom-nay"
		>
			<p className="text-muted-foreground text-xs" data-ghi-chu-mau="">
				Hôm nay (onehub 49843223e): dưới 1024 px cột ghi chú biến mất, không có
				mức đổi, dòng không có nút Cập nhật, và ‹ › trong chi tiết KR chỉ đi
				trong cùng một mục tiêu.
			</p>
			<DauBang
				dangBan={dangBan.length}
				tong={[...dangBan, ...conLai]}
				xepTheo={XEP_THEO_HOM_NAY}
			/>
			<BangHomNayKr ds={dangBan} onMoKr={onMoKr} />
			<PhanConLai mo={mo} onDoi={setMo} so={conLai.length}>
				<BangHomNayKr ds={conLai} onMoKr={onMoKr} />
			</PhanConLai>
		</section>
	);
}
