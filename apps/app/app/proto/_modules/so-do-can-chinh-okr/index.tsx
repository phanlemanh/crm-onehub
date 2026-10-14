"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { FlowMap } from "@crm/ui/components/flow-map";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import {
	canChuY,
	danhSachDonVi,
	soDoDonVi,
	soDoQuanhMucTieu,
	TAM,
} from "./du-lieu";
import { DUONG, KIEU_NUT } from "./the";

type Man =
	| { man: "don-vi"; moId: string | null; loc: "moi" | "chu-y" }
	| { man: "quanh" }
	| { man: "bang" }
	| { man: "dang-tai" }
	| { man: "loi" };

const MAN_THEO_STATE = {
	"ST-sodo-don-vi": { man: "don-vi", moId: null, loc: "moi" },
	"ST-sodo-mo-don-vi": { man: "don-vi", moId: "cskh", loc: "moi" },
	"ST-sodo-can-chu-y": { man: "don-vi", moId: null, loc: "chu-y" },
	"ST-sodo-quanh-muc-tieu": { man: "quanh" },
	"ST-sodo-bang": { man: "bang" },
	"ST-sodo-dang-tai": { man: "dang-tai" },
	"ST-sodo-loi": { man: "loi" },
} satisfies Record<string, Man>;

const CACH_XEM = [
	{ value: "bang", label: "Bảng" },
	{ value: "so-do", label: "Sơ đồ" },
];

const DONG = danhSachDonVi();
const SO_CAN_CHU_Y = DONG.filter((d) => canChuY(d.t)).length;

function DanhSachDonVi({ chiChuY }: { chiChuY: boolean }) {
	return (
		<div className="flex flex-col gap-2" data-so-do-danh-sach>
			{DONG.filter((d) => !chiChuY || canChuY(d.t)).map((d) => (
				<div
					data-cap={d.cap}
					key={d.id}
					style={{ paddingInlineStart: `${d.cap * 16}px` }}
				>
					<Item size="sm" variant="outline">
						<ItemContent>
							<ItemTitle translate="no">{d.ten}</ItemTitle>
							<ItemDescription>
								{d.t.mucTieu.length === 0
									? "Chưa đặt OKR"
									: `${d.t.mucTieu.length} mục tiêu · ${d.t.soKr} KR · ${d.t.tienDoTb}%`}
							</ItemDescription>
						</ItemContent>
						{canChuY(d.t) ? (
							<ItemActions>
								<StatusIndicator label="Cần chú ý" size="sm" tone="warning" />
							</ItemActions>
						) : null}
					</Item>
				</div>
			))}
		</div>
	);
}

function ChuGiai() {
	return (
		<p className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs md:flex">
			<span>Nét liền: đơn vị cấp trên</span>
			<span>Nét đứt: mục tiêu góp thẳng lên cấp cao hơn</span>
			<span>Bấm một thẻ để mở mục tiêu ngay trên sơ đồ</span>
		</p>
	);
}

function SoDoDonVi({
	moBanDau,
	loc,
}: {
	moBanDau: string | null;
	loc: "moi" | "chu-y";
}) {
	const [moId, setMoId] = useState(moBanDau);
	const [locHien, setLocHien] = useState(loc);
	const { nut, duong } = useMemo(() => soDoDonVi(moId), [moId]);
	const nutLoc = useMemo(
		() =>
			locHien === "chu-y"
				? nut.map((n) => ({
						...n,
						style: { opacity: n.data.canChuY ? 1 : 0.3 },
					}))
				: nut,
		[nut, locHien],
	);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<ToggleGroup
					aria-label="Lọc đơn vị"
					onValueChange={(v) => {
						if (v === "moi" || v === "chu-y") setLocHien(v);
					}}
					size="sm"
					type="single"
					value={locHien}
					variant="outline"
				>
					<ToggleGroupItem value="moi">
						Mọi đơn vị
						<span className="text-muted-foreground tabular-nums">
							{DONG.length}
						</span>
					</ToggleGroupItem>
					<ToggleGroupItem value="chu-y">
						Cần chú ý
						<span className="text-muted-foreground tabular-nums">
							{SO_CAN_CHU_Y}
						</span>
					</ToggleGroupItem>
				</ToggleGroup>
				<ChuGiai />
			</div>
			<div className="hidden h-[600px] md:block">
				<FlowMap
					edges={duong}
					label="Sơ đồ căn chỉnh theo đơn vị"
					nodeTypes={KIEU_NUT}
					nodes={nutLoc}
					onNodeClick={(id) => setMoId((cu) => (cu === id ? null : id))}
				/>
			</div>
			<div className="md:hidden">
				<DanhSachDonVi chiChuY={locHien === "chu-y"} />
			</div>
		</>
	);
}

function QuanhMucTieu() {
	const { nut, duong } = useMemo(() => soDoQuanhMucTieu(), []);
	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="min-w-0 text-sm">
					<span className="text-muted-foreground">Đang xem quanh: </span>
					<span className="font-medium">{TAM.ten}</span>
				</p>
				<Button asChild size="sm" variant="outline">
					<Link href={`${DUONG}?state=ST-sodo-don-vi`}>Về sơ đồ đơn vị</Link>
				</Button>
			</div>
			<p className="text-muted-foreground text-xs">
				Phía trên: những gì mục tiêu này góp vào. Phía dưới: KR của nó. Rê chuột
				lên một thẻ để làm nổi đường đi.
			</p>
			<div className="h-[600px]">
				<FlowMap
					edges={duong}
					focusId={TAM.id}
					label={`Sơ đồ quanh mục tiêu ${TAM.ten}`}
					nodeTypes={KIEU_NUT}
					nodes={nut}
				/>
			</div>
		</>
	);
}

function DangTaiSoDo() {
	return (
		<div
			aria-busy="true"
			aria-live="polite"
			className="flex h-[600px] flex-col items-center gap-16 rounded-lg border p-8"
		>
			<span className="sr-only">Đang tải sơ đồ…</span>
			<Skeleton className="h-28 w-64" />
			<div className="flex gap-10">
				<Skeleton className="h-28 w-64" />
				<Skeleton className="h-28 w-64" />
				<Skeleton className="h-28 w-64" />
			</div>
		</div>
	);
}

function NoiDung({ m }: { m: Man }) {
	const router = useRouter();
	switch (m.man) {
		case "don-vi":
			return <SoDoDonVi loc={m.loc} moBanDau={m.moId} />;
		case "quanh":
			return <QuanhMucTieu />;
		case "bang":
			return <DanhSachDonVi chiChuY={false} />;
		case "dang-tai":
			return <DangTaiSoDo />;
		case "loi":
			return (
				<VungTaiLoi
					moTa="Máy chủ không trả về cây căn chỉnh của Quý 4 · 2026. Dữ liệu OKR vẫn còn nguyên."
					onThuLai={() => router.push(`${DUONG}?state=ST-sodo-dang-tai`)}
					tieuDe="Không tải được sơ đồ"
				/>
			);
	}
}

export function SoDoCanChinhOkrMau({ state }: { state: string }) {
	const m: Man =
		state in MAN_THEO_STATE
			? MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE]
			: MAN_THEO_STATE["ST-sodo-don-vi"];
	const router = useRouter();
	const cachXem = m.man === "bang" ? "bang" : "so-do";

	return (
		<KhungUngDung key={state} trang="toan-canh" vai="day-du">
			<Card data-so-do-man={m.man}>
				<CardHeader>
					<CardTitle>Theo đơn vị</CardTitle>
					<CardDescription>
						Mỗi đơn vị một thẻ, nối theo cấp. Nét đứt là mục tiêu góp thẳng lên
						cấp cao hơn cấp trên của nó.
					</CardDescription>
					<CardAction>
						<ViewSwitch
							items={CACH_XEM}
							label="Cách xem"
							onValueChange={(v) =>
								router.push(
									`${DUONG}?state=${v === "bang" ? "ST-sodo-bang" : "ST-sodo-don-vi"}`,
								)
							}
							value={cachXem}
						/>
					</CardAction>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3">
						<NoiDung m={m} />
					</div>
				</CardContent>
			</Card>
		</KhungUngDung>
	);
}
