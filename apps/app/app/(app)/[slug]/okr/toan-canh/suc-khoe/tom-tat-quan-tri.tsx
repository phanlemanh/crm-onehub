"use client";

import Renew from "@carbon/icons-react/es/Renew";
import Warning from "@carbon/icons-react/es/Warning";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import {
	type OkrToanCanhMessages,
	okrToanCanhMessages,
} from "@/lib/messages/okr-toan-canh";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type QuanTri = RouterOutputs["okr"]["troLyTomTatQuanTri"];
type DongQuanTri = QuanTri["phong"][number];
type CauNgan = DongQuanTri["cau"][number];
type NhanTrangThai = keyof OkrToanCanhMessages["quanTri"]["trangThai"];

function ngayNgan(ngay: string): string {
	return `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
}

type HienTrangThai = { nhan: NhanTrangThai; tone: StatusTone };

function trangThaiCua(d: DongQuanTri): HienTrangThai {
	switch (d.trangThai) {
		case "hien":
			return d.nac === "bat"
				? { nhan: "daHien", tone: "success" }
				: { nhan: "quaKiemAn", tone: "info" };
		case "can-xem":
			return { nhan: "giuLai", tone: "warning" };
		case "khong-lam-duoc":
			return { nhan: "khongLamDuoc", tone: "error" };
		case "dang-soan":
			return { nhan: "dangSoan", tone: "neutral" };
		case "chua-cap-nhat":
			return { nhan: "chuaCapNhat", tone: "neutral" };
	}
}

function Nac({ nac }: { nac: DongQuanTri["nac"] }) {
	const m = okrToanCanhMessages(useLocale()).quanTri;
	return nac === "bat" ? (
		<Badge data-nac="bat" variant="secondary">
			{m.nac.bat}
		</Badge>
	) : (
		<Badge data-nac="an" variant="outline">
			{m.nac.an}
		</Badge>
	);
}

function TrangThai({ d }: { d: DongQuanTri }) {
	const m = okrToanCanhMessages(useLocale()).quanTri;
	const t = trangThaiCua(d);
	return (
		<StatusIndicator
			busy={d.trangThai === "dang-soan"}
			data-trang-thai-ban={t.nhan}
			label={m.trangThai[t.nhan]}
			size="sm"
			tone={t.tone}
		/>
	);
}

function So({ n, co }: { n: number; co: boolean }) {
	return co ? <span className="tabular-nums">{n}</span> : <EmptyCellValue />;
}

function DongBang({ d, mo }: { d: DongQuanTri; mo: (id: string) => void }) {
	const m = okrToanCanhMessages(useLocale()).quanTri;
	const coBan = d.tomTatId !== null;
	const moBan = () => {
		if (coBan) mo(d.departmentId);
	};
	return (
		<SimpleTableRow
			clickable={coBan}
			data-phong={d.departmentId}
			onClick={moBan}
		>
			<SimpleTableCell className="align-top whitespace-normal">
				{coBan ? (
					<Button
						data-mo-ban={d.departmentId}
						onClick={(event) => {
							event.stopPropagation();
							moBan();
						}}
						size="xs-wrap"
						variant="link"
					>
						<span translate="no">{d.ten}</span>
					</Button>
				) : (
					<span className="block text-sm" translate="no">
						{d.ten}
					</span>
				)}
				<span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden">
					<Nac nac={d.nac} />
					<TrangThai d={d} />
					{d.soCauBo > 0 ? (
						<span className="text-muted-foreground text-xs tabular-nums">
							{m.boNgan(String(d.soCauBo))}
						</span>
					) : null}
				</span>
			</SimpleTableCell>
			<SimpleTableCell className="hidden align-top md:table-cell">
				<Nac nac={d.nac} />
			</SimpleTableCell>
			<SimpleTableCell className="hidden align-top md:table-cell">
				<TrangThai d={d} />
			</SimpleTableCell>
			<SimpleTableCell className="align-top" data-cot="cau" numeric>
				<So co={coBan} n={d.soCau} />
			</SimpleTableCell>
			<SimpleTableCell
				className="hidden align-top md:table-cell"
				data-cot="bo"
				numeric
			>
				<So co={coBan} n={d.soCauBo} />
			</SimpleTableCell>
			<SimpleTableCell
				className="hidden align-top md:table-cell"
				data-cot="phan-hoi"
				numeric
			>
				{coBan ? (
					<span className="tabular-nums">
						{d.huuIch} / {d.khongHuuIch}
					</span>
				) : (
					<EmptyCellValue />
				)}
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

function DongNguon({ nguon }: { nguon: CauNgan["nguon"] }) {
	const mt = okrToanCanhMessages(useLocale());
	return (
		<ItemDescription data-nguon-cau unclamped>
			{mt.quanTri.nguon}{" "}
			{nguon.map((n, i) => (
				<span data-nguon={n.id} key={n.id}>
					{i > 0 ? "; " : null}
					{n.mat ? (
						mt.quanTri.nguonMat
					) : (
						<>
							{mt.tomTat.nhanTrichDan(ngayNgan(n.ngay))} ·{" "}
							<span translate="no">{n.krTen}</span>
						</>
					)}
				</span>
			))}
		</ItemDescription>
	);
}

function NganMotBan({
	d,
	tuan,
	dong,
}: {
	d: DongQuanTri | null;
	tuan: string | null;
	dong: () => void;
}) {
	const m = okrToanCanhMessages(useLocale()).quanTri;
	const idCon = useId();
	const idBo = useId();
	return (
		<Sheet
			onOpenChange={(mo) => {
				if (!mo) dong();
			}}
			open={d !== null}
		>
			<SheetContent
				data-ngan-ban={d?.departmentId ?? ""}
				data-trang-thai="ST-suckhoe-tomtat-ngan"
				side="right"
				size="md"
			>
				{d ? (
					<>
						<SheetHeader>
							<SheetTitle>
								<span translate="no">{d.ten}</span>
								{tuan ? ` · ${m.tuanNgan(ngayNgan(tuan))}` : null}
							</SheetTitle>
							<SheetDescription>
								{m.nac[d.nac]} · {m.trangThai[trangThaiCua(d).nhan]} —{" "}
								{m.boTrenTong(
									String(d.bo.length),
									String(d.bo.length + d.cau.length),
								)}
							</SheetDescription>
						</SheetHeader>
						<SheetBody>
							<div className="flex flex-col gap-5 pb-6">
								<section
									aria-labelledby={idCon}
									className="flex flex-col gap-3"
									data-cau-con
								>
									<h3 className="font-medium text-sm" id={idCon}>
										{m.cauCon(String(d.cau.length))}
									</h3>
									{d.cau.length === 0 ? (
										<p className="text-muted-foreground text-sm">
											{m.khongCau}
										</p>
									) : (
										<ItemGroup>
											{d.cau.map((c) => (
												<Item
													data-cau-con-dong
													key={c.vanBan}
													variant="outline"
												>
													<ItemContent>
														<p className="text-sm" translate="no">
															{c.vanBan}
														</p>
														<DongNguon nguon={c.nguon} />
													</ItemContent>
												</Item>
											))}
										</ItemGroup>
									)}
								</section>
								<section
									aria-labelledby={idBo}
									className="flex flex-col gap-3"
									data-cau-bo
								>
									<h3 className="font-medium text-sm" id={idBo}>
										{m.cauBo(String(d.bo.length))}
									</h3>
									{d.bo.length === 0 ? (
										<p className="text-muted-foreground text-sm">
											{m.khongCau}
										</p>
									) : (
										<ItemGroup>
											{d.bo.map((c) => (
												<Item
													data-ma-bo={c.maBo}
													key={`${c.maBo}:${c.vanBan}`}
													variant="outline"
												>
													<ItemContent>
														<ItemDescription translate="no" unclamped>
															<del>{c.vanBan}</del>
														</ItemDescription>
														<StatusIndicator
															data-nhan-ma-bo={c.maBo}
															label={m.maBo[c.maBo]}
															size="sm"
															tone="warning"
														/>
														<DongNguon nguon={c.nguon} />
													</ItemContent>
												</Item>
											))}
										</ItemGroup>
									)}
								</section>
							</div>
						</SheetBody>
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
}

export function TomTatQuanTri({ cycleId }: { cycleId: string }) {
	const mt = okrToanCanhMessages(useLocale());
	const m = mt.quanTri;
	const trpc = useTRPC();
	const [dangMo, setDangMo] = useState<string | null>(null);
	const qt = useQuery(trpc.okr.troLyTomTatQuanTri.queryOptions({ cycleId }));

	const cot: SimpleTableColumn[] = [
		{ id: "phong", header: m.cotPhong },
		{
			id: "nac",
			header: m.cotNac,
			width: "w-28",
			className: "hidden md:table-cell",
		},
		{
			id: "trang-thai",
			header: m.cotTrangThai,
			className: "hidden md:table-cell",
		},
		{ id: "cau", header: m.cotCau, width: "w-16", align: "right" },
		{
			id: "bo",
			header: m.cotBo,
			width: "w-24",
			align: "right",
			className: "hidden md:table-cell",
		},
		{
			id: "phan-hoi",
			header: m.cotPhanHoi,
			width: "w-32",
			align: "right",
			className: "hidden md:table-cell",
		},
	];

	let than: ReactNode;
	if (qt.isPending)
		than = (
			<CardContent
				aria-busy="true"
				data-trang-thai="ST-suckhoe-tomtat-dang-tai"
			>
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-2/3" />
			</CardContent>
		);
	else if (qt.isError)
		than = (
			<Alert data-trang-thai="ST-suckhoe-tomtat-loi">
				<Icon icon={Warning} />
				<AlertTitle>{m.loi}</AlertTitle>
				<AlertDescription>{mt.sucKhoe.loi}</AlertDescription>
				<AlertAction>
					<Button onClick={() => void qt.refetch()} size="xs" variant="outline">
						<Icon icon={Renew} data-icon="inline-start" />
						{mt.thuLai}
					</Button>
				</AlertAction>
			</Alert>
		);
	else if (qt.data.phong.length === 0)
		than = (
			<CardContent data-trang-thai="ST-suckhoe-tomtat-rong">
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{m.rong}</EmptyTitle>
						<EmptyDescription>{m.rongMoTa}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</CardContent>
		);
	else
		than = (
			<div data-trang-thai="ST-suckhoe-tomtat-co">
				<SimpleTable columns={cot} surface="page">
					{qt.data.phong.map((d) => (
						<DongBang d={d} key={d.departmentId} mo={setDangMo} />
					))}
				</SimpleTable>
			</div>
		);

	const tuan = qt.data?.tuan ?? null;
	const mo = qt.data?.phong.find((d) => d.departmentId === dangMo) ?? null;

	return (
		<Card data-khoi="tom-tat-quan-tri">
			<CardHeader>
				<CardTitle>{mt.tomTat.tieuDe}</CardTitle>
				<CardDescription>
					{tuan ? m.moTa(ngayNgan(tuan)) : m.moTaChuaCo}
				</CardDescription>
			</CardHeader>
			{than}
			<NganMotBan d={mo} dong={() => setDangMo(null)} tuan={tuan} />
		</Card>
	);
}
