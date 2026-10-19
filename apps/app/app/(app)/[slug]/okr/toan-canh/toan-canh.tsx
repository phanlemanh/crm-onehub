"use client";

import ChartLine from "@carbon/icons-react/es/ChartLine";
import Download from "@carbon/icons-react/es/Download";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Heatmap } from "@crm/ui/components/heatmap";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { StatCard } from "@crm/ui/components/stat-card";
import { TableCell } from "@crm/ui/components/table";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { cn } from "@crm/ui/lib/utils";
import {
	skipToken,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useChuKy } from "../chon-chu-ky";
import { okrParsers, soDoParsers } from "../okr-search-params";
import { kyVongCo, ThanhTienDo } from "../tien-do-kr";
import { ChuaChuKy, DangTai } from "../trang-thai-okr";

type HangToanCanh = RouterOutputs["okr"]["toanCanh"]["hang"][number];

const SoDoDonVi = dynamic(() => import("./so-do-don-vi"), {
	ssr: false,
	loading: () => <DangTai />,
});

const nhanTuan = (tuan: string) => `${tuan.slice(8, 10)}/${tuan.slice(5, 7)}`;

function CauDangBan({ h }: { h: HangToanCanh }) {
	const mt = okrToanCanhMessages(useLocale());
	if (h.dangBan === null)
		return <span className="text-muted-foreground">—</span>;
	const n = String(h.dangBan.soKr);
	switch (h.dangBan.loai) {
		case "tut":
			return <span>{mt.toanCanh.banTut(n)}</span>;
		case "im":
			return <span>{mt.toanCanh.banIm(n)}</span>;
		case "ghi-chu":
			return <span>{mt.toanCanh.banGhiChu(n)}</span>;
	}
}

const SO_TEN_CHUA_DAT = 3;

export function LoiXem({
	cau,
	thuLai,
	trangThai,
}: {
	cau: string;
	thuLai: () => void;
	trangThai: string;
}) {
	const mt = okrToanCanhMessages(useLocale());
	return (
		<VungTaiLoi
			data-trang-thai={trangThai}
			moTa={cau}
			onThuLai={thuLai}
			tieuDe={mt.loiTieuDe}
		/>
	);
}

function DongDonVi({ h, toi }: { h: HangToanCanh; toi: string }) {
	return (
		<SimpleTableRow data-hang-toan-canh={h.key}>
			<TableCell className="px-3 py-2.5 whitespace-normal">
				<Link
					className={cn(
						"hover:underline",
						h.cap === "phong-ban"
							? "ps-4 text-muted-foreground"
							: "font-medium",
					)}
					href={toi}
					translate="no"
				>
					{h.ten}
				</Link>
			</TableCell>
			<TableCell className="px-3 py-2.5">
				{h.tienDo === null ? (
					<span className="text-muted-foreground">—</span>
				) : (
					<span className="flex items-center gap-3">
						<ThanhTienDo expected={h.kyVong} progress={h.tienDo} ten={h.ten} />
						<span className="w-9 shrink-0 text-right text-xs tabular-nums">
							{h.tienDo}%
						</span>
					</span>
				)}
			</TableCell>
			<TableCell
				className="hidden px-3 py-2.5 text-xs tabular-nums md:table-cell"
				data-tu-tin-hang
			>
				{h.soKr === 0 ? (
					<span className="text-muted-foreground">—</span>
				) : (
					`${h.tuTin.cao} · ${h.tuTin.vua} · ${h.tuTin.thap}`
				)}
			</TableCell>
			<TableCell
				className="hidden px-3 py-2.5 text-xs whitespace-normal lg:table-cell"
				data-dang-ban={h.dangBan?.loai ?? ""}
			>
				<CauDangBan h={h} />
			</TableCell>
			<TableCell className="hidden px-3 py-2.5 text-right tabular-nums sm:table-cell">
				{h.soMucTieu}
			</TableCell>
			<TableCell className="hidden px-3 py-2.5 text-right tabular-nums sm:table-cell">
				{h.soKr}
			</TableCell>
		</SimpleTableRow>
	);
}

function taiTep(tenTep: string, noiDung: string) {
	const url = URL.createObjectURL(
		new Blob([noiDung], { type: "text/csv;charset=utf-8" }),
	);
	const a = document.createElement("a");
	a.href = url;
	a.download = tenTep;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

function XuatKy({ cycleId }: { cycleId: string }) {
	const mk = okrKhepMessages(useLocale()).xuat;
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const xuat = useMutation({
		mutationFn: () =>
			queryClient.fetchQuery({
				...trpc.okr.xuatKy.queryOptions({ cycleId }),
				staleTime: 0,
			}),
		onSuccess: (tep) => taiTep(tep.tenTep, tep.noiDung),
		onError: (error) => toast.error(error.message),
	});
	return (
		<Card data-khoi="xuat-ky">
			<CardHeader>
				<CardTitle>{mk.tieuDe}</CardTitle>
				<CardDescription>{mk.moTa}</CardDescription>
				<CardAction>
					<Button
						size="sm"
						variant="outline"
						disabled={xuat.isPending}
						data-nut="xuat-ky"
						onClick={() => xuat.mutate()}
					>
						{xuat.isPending ? (
							<Spinner data-icon="inline-start" />
						) : (
							<Icon icon={Download} data-icon="inline-start" />
						)}
						{mk.nut}
					</Button>
				</CardAction>
			</CardHeader>
		</Card>
	);
}

export function ToanCanh() {
	const mt = okrToanCanhMessages(useLocale());
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const [thamSo] = useQueryStates(okrParsers);
	const [cachXem, datCachXem] = useQueryStates(soDoParsers);
	const xem = cachXem[SEARCH_PARAM.okr.xemToanCanh];
	const ky = thamSo[SEARCH_PARAM.okr.ky];
	const { cycles, currentId } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	const tc = useQuery(
		trpc.okr.toanCanh.queryOptions(
			currentId === null ? skipToken : { cycleId: currentId },
		),
	);
	const quanTri = access.data?.canManageProgram === true;
	const daDong =
		cycles.data?.cycles.find((c) => c.id === currentId)?.phase === "da-dong";
	const kem = (p: Record<string, string>) => {
		const q = new URLSearchParams(ky ? { ...p, [SEARCH_PARAM.okr.ky]: ky } : p);
		const s = q.toString();
		return s ? `?${s}` : "";
	};

	if (cycles.data?.cycles.length === 0 && !access.isPending)
		return <ChuaChuKy quanTri={quanTri} />;
	if (cycles.isError || tc.isError)
		return (
			<LoiXem
				cau={mt.toanCanh.loi}
				thuLai={() => {
					if (cycles.isError) void cycles.refetch();
					if (tc.isError) void tc.refetch();
				}}
				trangThai="ST-toancanh-loi"
			/>
		);
	if (cycles.isPending || access.isPending) return <DangTai />;
	if (currentId === null) return <ChuaChuKy quanTri={quanTri} />;
	if (tc.isPending) return <DangTai />;

	const { tongQuan, hang, tuan, tuanNay } = tc.data;
	const chuaDat = tongQuan.donViChuaDat;
	const tenChuaDat =
		chuaDat.length > SO_TEN_CHUA_DAT
			? `${chuaDat.slice(0, SO_TEN_CHUA_DAT).join(", ")}…`
			: chuaDat.join(", ");
	const tuanDau = hang.every((h) => h.soMucTieu === 0);
	const cot: SimpleTableColumn[] = [
		{ id: "don-vi", header: mt.toanCanh.cotDonVi },
		{ id: "tien-do", header: mt.toanCanh.cotTienDo, width: "w-[30%]" },
		{
			id: "tu-tin",
			header: mt.toanCanh.cotTuTin,
			className: "hidden md:table-cell",
		},
		{
			id: "dang-ban",
			header: mt.toanCanh.cotDangBan,
			className: "hidden lg:table-cell",
		},
		{
			id: "muc-tieu",
			header: mt.toanCanh.cotMucTieu,
			align: "right",
			className: "hidden sm:table-cell",
		},
		{
			id: "kr",
			header: mt.toanCanh.cotKr,
			align: "right",
			className: "hidden sm:table-cell",
		},
	];

	return (
		<div
			className="flex flex-col gap-6"
			data-trang-thai={tuanDau ? "ST-toancanh-tuandau" : "ST-toancanh-codulieu"}
		>
			{daDong && currentId !== null ? <XuatKy cycleId={currentId} /> : null}
			<StatGroup>
				<StatCard
					description={
						tongQuan.kyVong === null
							? mt.toanCanh.chuaCoVach
							: kyVongCo(tongQuan.kyVong) === null
								? mt.toanCanh.vuaCongBo
								: mt.toanCanh.leRa(String(tongQuan.kyVong))
					}
					label={mt.toanCanh.tienDoTB}
					value={tongQuan.tienDo === null ? "—" : `${tongQuan.tienDo}%`}
				/>
				<StatCard
					description={
						chuaDat.length === 0 ? (
							mt.toanCanh.tatCaDaDat
						) : (
							<span data-chua-dat>
								<span translate="no">{tenChuaDat}</span> {mt.toanCanh.chuaDat}
							</span>
						)
					}
					label={mt.toanCanh.donViCongBo}
					value={`${tongQuan.donViCongBo}/${tongQuan.tongDonVi}`}
				/>
				<StatCard
					description={mt.toanCanh.soTuanTruoc(String(tongQuan.daCapNhatTruoc))}
					label={mt.toanCanh.daCapNhat}
					value={`${tongQuan.daCapNhat}/${tongQuan.tongKr}`}
				/>
				<StatCard
					description={mt.toanCanh.soTuanTruoc(String(tongQuan.tuTinThapTruoc))}
					label={mt.toanCanh.tuTinThap}
					value={String(tongQuan.tuTinThap)}
				/>
			</StatGroup>
			{tuanDau ? (
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{mt.toanCanh.tuanDau}</EmptyTitle>
						<EmptyDescription>{mt.toanCanh.tuanDauMoTa}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>{mt.toanCanh.theoDonVi}</CardTitle>
						<CardDescription>{mt.toanCanh.theoDonViMoTa}</CardDescription>
						<CardAction className="flex flex-wrap items-center gap-2">
							<div data-cach-xem-toan-canh>
								<ViewSwitch
									items={[
										{ value: "bang", label: mt.soDo.bang },
										{ value: "so-do", label: mt.soDo.soDo },
									]}
									label={mt.soDo.cachXem}
									onValueChange={(v) => {
										if (v === "bang" || v === "so-do")
											void datCachXem({ [SEARCH_PARAM.okr.xemToanCanh]: v });
									}}
									value={xem}
								/>
							</div>
							{quanTri ? (
								<Button asChild size="sm" variant="outline">
									<Link
										data-nut="suc-khoe"
										href={`${url("/okr/toan-canh/suc-khoe")}${kem({})}`}
									>
										<Icon icon={ChartLine} data-icon="inline-start" />
										{mt.toanCanh.suKhoe}
									</Link>
								</Button>
							) : null}
						</CardAction>
					</CardHeader>
					{xem === "so-do" ? (
						<CardContent>
							<SoDoDonVi cycleId={currentId} />
						</CardContent>
					) : (
						<SimpleTable columns={cot} surface="page">
							{hang.map((h) => (
								<DongDonVi
									h={h}
									key={h.key}
									toi={`${url("/okr/theo-don-vi")}${kem(h.key === "goc" ? {} : { [SEARCH_PARAM.okr.don]: h.key })}`}
								/>
							))}
						</SimpleTable>
					)}
				</Card>
			)}
			{tuanDau ? null : (
				<Card data-khoi="heatmap">
					<CardHeader>
						<CardTitle>{mt.toanCanh.heatmap}</CardTitle>
						<CardDescription>{mt.toanCanh.heatmapMoTa}</CardDescription>
					</CardHeader>
					<Heatmap
						caption={mt.toanCanh.heatmap}
						columns={tuan.map((t) => ({
							id: t,
							label: nhanTuan(t),
							current: t === tuanNay,
						}))}
						rows={hang.map((h) => ({
							id: h.key,
							label: <span translate="no">{h.ten}</span>,
							indent: h.cap === "phong-ban",
						}))}
						values={hang.map((h) => h.theoTuan)}
					/>
				</Card>
			)}
		</div>
	);
}
