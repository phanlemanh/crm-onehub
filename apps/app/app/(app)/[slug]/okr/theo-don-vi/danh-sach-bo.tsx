"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { PHAM_VI_BO, type PhamViBo } from "@crm/validation/okr-tham-so";
import { skipToken, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useChuKy } from "../chon-chu-ky";
import { parseAsPhamViBo } from "../okr-search-params";
import { ChuaChuKy } from "../trang-thai-okr";
import { KhungDangTaiDonVi } from "./hang-cong-cu";
import { ViTriBo } from "./vi-tri-bo";

type HangBo = RouterOutputs["okr"]["danhSachBo"]["hang"][number];

const LOP_CAP = {
	goc: "",
	"bo-phan": "pl-4",
	"phong-ban": "pl-8",
} as const satisfies Record<HangBo["cap"], string>;

function hopLoc(h: HangBo, loc: PhamViBo) {
	if (loc === "toi-dan") return h.toiDan;
	if (loc === "theo-doi") return h.dangTheoDoi;
	return true;
}

export function DanhSachBo() {
	const m = okrVoKhuMessages(useLocale()).boOkr;
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const { cycles, currentId } = useChuKy();
	const [loc, datLoc] = useQueryState(
		SEARCH_PARAM.okr.phamViBo,
		parseAsPhamViBo,
	);
	const [ky] = useQueryState(SEARCH_PARAM.okr.ky);
	const access = useQuery(trpc.okr.access.queryOptions());
	const ds = useQuery(
		trpc.okr.danhSachBo.queryOptions(
			currentId === null ? skipToken : { cycleId: currentId },
		),
	);

	if (cycles.data?.cycles.length === 0 || (cycles.data && currentId === null))
		return <ChuaChuKy quanTri={access.data?.canManageProgram === true} />;
	if (cycles.isError || ds.isError)
		return (
			<VungTaiLoi
				data-trang-thai="ST-bo-okr-loi"
				dangTai={ds.isFetching}
				moTa={m.loi.moTa}
				onThuLai={() => {
					void cycles.refetch();
					void ds.refetch();
				}}
				tieuDe={m.loi.tieuDe}
			/>
		);
	if (!ds.data) return <KhungDangTaiDonVi />;

	const hang = ds.data.hang;
	const dem = {
		"tat-ca": hang.length,
		"toi-dan": hang.filter((h) => hopLoc(h, "toi-dan")).length,
		"theo-doi": hang.filter((h) => hopLoc(h, "theo-doi")).length,
	} satisfies Record<PhamViBo, number>;
	const boLoc = hang.filter((h) => hopLoc(h, loc));
	const href = (don: string) => {
		const q = new URLSearchParams({ [SEARCH_PARAM.okr.don]: don });
		if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
		return `${url("/okr/bo-okr")}?${q.toString()}`;
	};
	const veTatCa = () => void datLoc(null);

	return (
		<div className="flex min-w-0 flex-col gap-4" data-danh-sach-bo="">
			<ViTriBo ky={ky} />
			<div className="max-w-full overflow-x-auto" data-loc-bo="">
				<ToggleGroup
					aria-label={m.loc.nhan}
					onValueChange={(v) => {
						const moi = PHAM_VI_BO.find((p) => p === v);
						if (moi) void datLoc(moi === "tat-ca" ? null : moi);
					}}
					size="sm"
					type="single"
					value={loc}
					variant="outline"
				>
					{PHAM_VI_BO.map((p) => (
						<ToggleGroupItem count={dem[p]} data-pham-vi={p} key={p} value={p}>
							{m.loc[p]}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
			{boLoc.length === 0 ? (
				<Empty data-bo-rong-loc={loc}>
					<EmptyHeader>
						<EmptyTitle>{m.rongLoc.tieuDe(m.loc[loc])}</EmptyTitle>
						<EmptyDescription>{m.rongLoc.than}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button data-ve-tat-ca="" onClick={veTatCa} variant="outline">
							{m.rongLoc.nut}
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<>
					<div className="hidden md:block" data-bang-bo="">
						<SimpleTable
							columns={[
								{ id: "bo", header: m.cot.bo },
								{ id: "truong", header: m.cot.truong },
								{ id: "muc-tieu", header: m.cot.mucTieu, align: "right" },
								{ id: "tien-do", header: m.cot.tienDo, align: "right" },
								{ id: "tu-tin", header: m.cot.tuTinThap, align: "right" },
							]}
							surface="page"
						>
							{boLoc.map((h) => (
								<SimpleTableRow
									clickable
									data-bo={h.don}
									key={h.don}
									onClick={(e) => e.currentTarget.querySelector("a")?.click()}
								>
									<TableCell className={LOP_CAP[h.cap]}>
										<Link
											className="font-medium"
											href={href(h.don)}
											onClick={(e) => e.stopPropagation()}
											translate="no"
										>
											{h.ten}
										</Link>
									</TableCell>
									<TableCell translate="no">
										{h.truong?.name ?? <EmptyCellValue />}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{h.soMucTieu}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{h.tienDo === null ? <EmptyCellValue /> : `${h.tienDo}%`}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{h.tuTinThap}
									</TableCell>
								</SimpleTableRow>
							))}
						</SimpleTable>
					</div>
					<div className="md:hidden" data-the-bo="">
						<ItemGroup>
							{boLoc.map((h) => (
								<Item asChild key={h.don} variant="outline">
									<Link data-bo={h.don} href={href(h.don)}>
										<ItemContent>
											<ItemTitle translate="no">{h.ten}</ItemTitle>
											<ItemDescription>
												{h.truong ? (
													<span translate="no">{h.truong.name} · </span>
												) : null}
												{m.cot.mucTieu} {h.soMucTieu} · {m.cot.tienDo}{" "}
												{h.tienDo === null ? "—" : `${h.tienDo}%`}
											</ItemDescription>
										</ItemContent>
									</Link>
								</Item>
							))}
						</ItemGroup>
					</div>
				</>
			)}
		</div>
	);
}
