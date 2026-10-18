"use client";

import Maximize from "@carbon/icons-react/es/Maximize";
import Minimize from "@carbon/icons-react/es/Minimize";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import { Button } from "@crm/ui/components/button";
import {
	FlowMap,
	FlowMapCard,
	type FlowMapEdge,
	FlowMapNode,
	type Node,
	type NodeProps,
} from "@crm/ui/components/flow-map";
import { Icon } from "@crm/ui/components/icon";
import { Progress } from "@crm/ui/components/progress";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import Link from "next/link";
import { CAY_DON_VI, type DonViMau } from "../ban-mau-okr/du-lieu";
import {
	DON_VI_TOI_DAN,
	duong,
	HANG_DON_VI,
	type HangDonVi,
	STATE,
} from "./du-lieu";

type DuLieuThe = { hang: HangDonVi; dangChon: boolean };

type NutThe = Node<DuLieuThe, "don-vi">;

function TheDonVi({ data }: NodeProps<NutThe>) {
	return (
		<FlowMapNode>
			<FlowMapCard active={data.dangChon}>
				<span className="truncate font-medium">{data.hang.ten}</span>
				<span className="text-muted-foreground text-xs">
					{data.hang.soMucTieu === 0
						? "Chưa đặt OKR"
						: `${data.hang.soMucTieu} mục tiêu · ${data.hang.tienDo}%`}
				</span>
				<Progress value={data.hang.tienDo} />
			</FlowMapCard>
		</FlowMapNode>
	);
}

const KIEU_NUT = { "don-vi": TheDonVi };

function dayCua(d: DonViMau): FlowMapEdge[] {
	return d.con.flatMap((c) => [
		{
			id: `${d.id}->${c.id}`,
			source: d.id,
			target: c.id,
			data: { kind: "lien" as const },
		},
		...dayCua(c),
	]);
}

const NUT: NutThe[] = HANG_DON_VI.map((h) => ({
	id: h.id,
	type: "don-vi",
	position: { x: 0, y: 0 },
	width: 200,
	height: 92,
	data: { hang: h, dangChon: h.id === DON_VI_TOI_DAN },
}));

const DAY: FlowMapEdge[] = dayCua(CAY_DON_VI);

export function KhungToanVung({ toanMan }: { toanMan: boolean }) {
	return (
		<div className="flex min-h-0 flex-1 flex-col" data-khung-toan-vung>
			<div className="flex flex-wrap items-center gap-3 border-b px-4 py-2">
				<div className="flex min-w-0 flex-col">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href={duong(STATE.sucKhoe)}>Cả công ty</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Sơ đồ góp vào</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
				<div className="ml-auto flex flex-wrap items-center gap-2">
					<ToggleGroup
						aria-label="Lọc sơ đồ"
						defaultValue="moi"
						size="sm"
						spacing={0}
						type="single"
						variant="outline"
					>
						<ToggleGroupItem value="moi">Mọi đơn vị</ToggleGroupItem>
						<ToggleGroupItem value="chu-y">Cần chú ý</ToggleGroupItem>
					</ToggleGroup>
					<Button asChild size="sm" variant="outline">
						<Link href={duong(toanMan ? STATE.soDo : STATE.toanMan)}>
							<Icon
								data-icon="inline-start"
								icon={toanMan ? Minimize : Maximize}
							/>
							{toanMan ? "Thoát toàn màn hình" : "Toàn màn hình"}
						</Link>
					</Button>
				</div>
			</div>
			<div className="min-h-0 flex-1" data-vung-so-do>
				<FlowMap
					edges={DAY}
					label="Sơ đồ góp vào cả công ty"
					nodeTypes={KIEU_NUT}
					nodes={NUT}
				/>
			</div>
		</div>
	);
}

export function SoDoNho() {
	const giu = new Set(["onehub", "vanhanh", "cskh"]);
	return (
		<div className="h-80 rounded-lg border" data-so-do-nho>
			<FlowMap
				centerId={DON_VI_TOI_DAN}
				edges={DAY.filter((d) => giu.has(d.source) && giu.has(d.target))}
				label="Chăm sóc khách hàng góp vào đâu"
				nodeTypes={KIEU_NUT}
				nodes={NUT.filter((n) => giu.has(n.id))}
			/>
		</div>
	);
}
