"use client";

import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { SortableItem, SortableList } from "@crm/ui/components/sortable-list";
import { useMutation } from "@tanstack/react-query";
import { Fragment, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/(app)/[slug]/settings/members/confirm-dialog";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import type {
	BoPhanDuLieu,
	CayDuLieu,
	PhongBanDuLieu,
	YeuCauDonVi,
} from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

type Nguoi = { id: string; name: string; email: string };
type MucMenu = { nhan: string; lam: () => void };
type HoiLuuTru = { loai: "bo-phan" | "phong-ban"; id: string; name: string };

function khop(chu: string, tim: string): boolean {
	return chu
		.toLocaleLowerCase("vi")
		.includes(tim.trim().toLocaleLowerCase("vi"));
}

function MenuDonVi({ ten, muc }: { ten: string; muc: MucMenu[] }) {
	const m = toChucMessages(useLocale());
	const cuoi = muc.length - 1;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon-sm">
					<Icon icon={OverflowMenuHorizontal} />
					<span className="sr-only">{dien(m.menu, { ten })}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{muc.map((x, i) => (
					<Fragment key={x.nhan}>
						{i === cuoi ? <DropdownMenuSeparator /> : null}
						<DropdownMenuItem onSelect={x.lam}>{x.nhan}</DropdownMenuItem>
					</Fragment>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function NguoiTrongCay({
	nguoi,
	nhan,
	sua,
	moNguoi,
}: {
	nguoi: Nguoi;
	nhan: string | null;
	sua: boolean;
	moNguoi: (id: string) => void;
}) {
	const noiDung = (
		<>
			<PersonAvatar size="sm" name={nguoi.name} email={nguoi.email} />
			<span translate="no" data-ten>
				{nguoi.name}
			</span>
			{nhan ? <Badge variant="outline">{nhan}</Badge> : null}
		</>
	);
	if (!sua) {
		return (
			<span
				className="flex items-center gap-1 text-xs"
				data-nguoi-doc={nguoi.id}
			>
				{noiDung}
			</span>
		);
	}
	return (
		<Button
			variant="ghost"
			size="xs"
			aria-haspopup="dialog"
			data-nguoi={nguoi.id}
			onClick={() => moNguoi(nguoi.id)}
		>
			{noiDung}
		</Button>
	);
}

function NoiDungPhongBan({
	pb,
	sua,
	moNguoi,
	menu,
}: {
	pb: PhongBanDuLieu;
	sua: boolean;
	moNguoi: (id: string) => void;
	menu: MucMenu[];
}) {
	const m = toChucMessages(useLocale());
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-2 py-2">
			<span className="flex items-center justify-between gap-2 text-sm">
				<span className="min-w-0 truncate" translate="no" data-ten>
					{pb.name}
				</span>
				<span className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs tabular-nums">
					{dien(m.soNguoi, { n: pb.people.length })}
					{sua ? <MenuDonVi ten={pb.name} muc={menu} /> : null}
				</span>
			</span>
			<span className="flex flex-wrap items-center gap-1">
				{pb.head ? null : (
					<span className="text-muted-foreground text-xs">
						{m.chuaCoTruong}
					</span>
				)}
				{pb.people.map((n) => (
					<NguoiTrongCay
						key={`${n.id}-${n.primary}`}
						nguoi={n}
						sua={sua}
						moNguoi={moNguoi}
						nhan={
							pb.head?.id === n.id ? m.truongPhongBan : n.primary ? null : m.phu
						}
					/>
				))}
			</span>
		</div>
	);
}

export function CayToChuc({
	cay,
	sua,
	tim,
	moNguoi,
	moDonVi,
}: {
	cay: CayDuLieu;
	sua: boolean;
	tim: string;
	moNguoi: (id: string) => void;
	moDonVi: (y: YeuCauDonVi) => void;
}) {
	const m = toChucMessages(useLocale());
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const [hoi, setHoi] = useState<HoiLuuTru | null>(null);
	const [thuTuTam, setThuTuTam] = useState<Record<string, string[]>>({});
	const [dong, setDong] = useState<ReadonlySet<string>>(new Set());
	const dangHoanTac = useRef(false);

	const luuPb = useMutation(
		trpc.onboarding.archiveDepartment.mutationOptions(),
	);
	const luuBp = useMutation(trpc.org.archiveDivision.mutationOptions());
	const khoiPb = useMutation(
		trpc.onboarding.restoreDepartment.mutationOptions(),
	);
	const khoiBp = useMutation(trpc.org.restoreDivision.mutationOptions());
	const sapBp = useMutation(trpc.org.reorderDivisions.mutationOptions());
	const doiPb = useMutation(trpc.org.moveDepartment.mutationOptions());
	const dangLuu = luuPb.isPending || luuBp.isPending;
	const dangTim = tim.trim() !== "";

	const loi = (error: { message: string }) => toast.error(error.message);

	const hoanTac = (x: HoiLuuTru) => {
		if (dangHoanTac.current) return;
		dangHoanTac.current = true;
		const xong = {
			onSuccess: lamMoi,
			onError: loi,
			onSettled: () => {
				dangHoanTac.current = false;
			},
		};
		if (x.loai === "phong-ban") khoiPb.mutate({ id: x.id }, xong);
		else khoiBp.mutate({ id: x.id }, xong);
	};

	const xacNhanLuuTru = () => {
		const x = hoi;
		if (x === null || dangLuu) return;
		const sau = {
			onSuccess: async () => {
				setHoi(null);
				await lamMoi();
				toast(dien(m.daLuuTruTen, { ten: x.name }), {
					action: { label: m.hoanTac, onClick: () => hoanTac(x) },
				});
			},
			onError: (error: { message: string }) => {
				setHoi(null);
				loi(error);
			},
		};
		if (x.loai === "phong-ban") luuPb.mutate({ id: x.id }, sau);
		else luuBp.mutate({ id: x.id }, sau);
	};

	const sapBoPhan = (id: string, buoc: -1 | 1) => {
		const ids = cay.divisions.map((d) => d.id);
		const i = ids.indexOf(id);
		const j = i + buoc;
		if (i < 0 || j < 0 || j >= ids.length) return;
		[ids[i], ids[j]] = [ids[j] as string, ids[i] as string];
		sapBp.mutate({ ids }, { onSuccess: lamMoi, onError: loi });
	};

	const menuPhongBan = (pb: PhongBanDuLieu): MucMenu[] => [
		{
			nhan: m.doiTen,
			lam: () =>
				moDonVi({
					loai: "doi-ten",
					don: "phong-ban",
					id: pb.id,
					name: pb.name,
				}),
		},
		{
			nhan: m.datTruong,
			lam: () =>
				moDonVi({ loai: "truong", don: "phong-ban", id: pb.id, name: pb.name }),
		},
		{
			nhan: m.chuyen,
			lam: () =>
				moDonVi({
					loai: "chuyen",
					id: pb.id,
					name: pb.name,
					divisionId: pb.divisionId,
				}),
		},
		{
			nhan: m.luuTru,
			lam: () => setHoi({ loai: "phong-ban", id: pb.id, name: pb.name }),
		},
	];

	const menuBoPhan = (bp: BoPhanDuLieu, i: number): MucMenu[] => [
		{
			nhan: m.doiTen,
			lam: () =>
				moDonVi({ loai: "doi-ten", don: "bo-phan", id: bp.id, name: bp.name }),
		},
		{
			nhan: m.datTruong,
			lam: () =>
				moDonVi({ loai: "truong", don: "bo-phan", id: bp.id, name: bp.name }),
		},
		{
			nhan: m.themPhongBan,
			lam: () =>
				moDonVi({ loai: "tao-phong-ban", divisionId: bp.id, name: bp.name }),
		},
		...(i > 0 ? [{ nhan: m.lenTren, lam: () => sapBoPhan(bp.id, -1) }] : []),
		...(i < cay.divisions.length - 1
			? [{ nhan: m.xuongDuoi, lam: () => sapBoPhan(bp.id, 1) }]
			: []),
		{
			nhan: m.luuTru,
			lam: () => setHoi({ loai: "bo-phan", id: bp.id, name: bp.name }),
		},
	];

	const pbKhop = (pb: PhongBanDuLieu, tenBp: string) =>
		!dangTim ||
		khop(pb.name, tim) ||
		khop(tenBp, tim) ||
		pb.people.some((n) => khop(n.name, tim) || khop(n.email, tim));

	const danhSachPhongBan = (
		nhom: string,
		divisionId: string | null,
		tenBp: string,
		ds: PhongBanDuLieu[],
	) => {
		const theoId = new Map(ds.map((d) => [d.id, d]));
		const ids = (thuTuTam[nhom] ?? ds.map((d) => d.id)).filter(
			(id) => theoId.has(id) && pbKhop(theoId.get(id) as PhongBanDuLieu, tenBp),
		);
		return (
			<div className="flex flex-col divide-y ps-6">
				<SortableList
					ids={ids}
					onReorder={(moi) => {
						if (!sua || dangTim || doiPb.isPending) return;
						const id = [...moi].sort(
							(a, b) =>
								Math.abs(moi.indexOf(b) - ids.indexOf(b)) -
								Math.abs(moi.indexOf(a) - ids.indexOf(a)),
						)[0];
						if (id === undefined) return;
						setThuTuTam((t) => ({ ...t, [nhom]: moi }));
						doiPb.mutate(
							{ id, divisionId, index: moi.indexOf(id) },
							{
								onSuccess: async () => {
									await lamMoi();
									setThuTuTam((t) => {
										const { [nhom]: _, ...con } = t;
										return con;
									});
								},
								onError: (error) => {
									setThuTuTam((t) => {
										const { [nhom]: _, ...con } = t;
										return con;
									});
									loi(error);
								},
							},
						);
					}}
				>
					{ids.map((id) => {
						const pb = theoId.get(id) as PhongBanDuLieu;
						return (
							<SortableItem
								key={pb.id}
								id={pb.id}
								label={pb.name}
								disabled={!sua || dangTim || doiPb.isPending}
							>
								<div className="flex min-w-0 flex-1" data-phong-ban={pb.id}>
									<NoiDungPhongBan
										pb={pb}
										sua={sua}
										moNguoi={moNguoi}
										menu={menuPhongBan(pb)}
									/>
								</div>
							</SortableItem>
						);
					})}
				</SortableList>
			</div>
		);
	};

	const boPhanHien = cay.divisions.filter(
		(bp) =>
			!dangTim ||
			khop(bp.name, tim) ||
			bp.departments.some((pb) => pbKhop(pb, bp.name)),
	);
	const chuaXepHien = cay.chuaXep.filter((pb) => pbKhop(pb, ""));
	const chuaCoHien = cay.chuaCoPhongBan.filter(
		(n) => !dangTim || khop(n.name, tim) || khop(n.email, tim),
	);

	return (
		<>
			<ul
				className="flex flex-col gap-1 rounded-lg border p-2"
				aria-label={m.cay}
			>
				{boPhanHien.map((bp) => (
					<Collapsible
						key={bp.id}
						open={dangTim || !dong.has(bp.id)}
						onOpenChange={(mo) =>
							setDong((cu) => {
								const moi = new Set(cu);
								if (mo) moi.delete(bp.id);
								else moi.add(bp.id);
								return moi;
							})
						}
						asChild
					>
						<li data-bo-phan={bp.id}>
							<span className="flex items-center gap-1">
								<CollapsibleTrigger asChild>
									<Button
										variant="ghost"
										className="min-w-0 flex-1 justify-start"
									>
										<Icon
											icon={ChevronRight}
											className="transition-transform group-aria-expanded/button:rotate-90"
										/>
										<span
											className="min-w-0 flex-1 truncate text-start"
											translate="no"
											data-ten
										>
											{bp.name}
										</span>
										<span className="font-normal text-muted-foreground text-xs tabular-nums">
											{dien(m.soPhongBan, { n: bp.departments.length })}
										</span>
									</Button>
								</CollapsibleTrigger>
								{sua ? (
									<MenuDonVi
										ten={bp.name}
										muc={menuBoPhan(bp, cay.divisions.indexOf(bp))}
									/>
								) : null}
							</span>
							<span className="flex items-center gap-1 ps-8 pb-1 text-muted-foreground text-xs">
								{bp.head ? (
									<NguoiTrongCay
										nguoi={bp.head}
										sua={sua}
										moNguoi={moNguoi}
										nhan={m.truongBoPhan}
									/>
								) : (
									m.chuaCoTruongBoPhan
								)}
							</span>
							<CollapsibleContent>
								{danhSachPhongBan(bp.id, bp.id, bp.name, bp.departments)}
							</CollapsibleContent>
						</li>
					</Collapsible>
				))}
				{chuaXepHien.length > 0 ? (
					<li data-nhom="chua-xep" className="flex flex-col gap-1 pt-2">
						<span className="px-3 text-muted-foreground text-xs">
							{m.chuaXep}
						</span>
						{danhSachPhongBan("__chua-xep", null, "", chuaXepHien)}
					</li>
				) : null}
				{chuaCoHien.length > 0 ? (
					<li
						data-nhom="chua-co-phong-ban"
						className="flex flex-col gap-1 pt-2"
					>
						<span className="px-3 text-muted-foreground text-xs">
							{dien(m.chuaCoPhongBan, { n: cay.chuaCoPhongBan.length })}
						</span>
						<span className="flex flex-wrap gap-1 px-3 pb-2">
							{chuaCoHien.map((n) => (
								<NguoiTrongCay
									key={n.id}
									nguoi={n}
									sua={sua}
									moNguoi={moNguoi}
									nhan={null}
								/>
							))}
						</span>
					</li>
				) : null}
			</ul>

			<ConfirmDialog
				open={hoi !== null}
				onOpenChange={(mo) => {
					if (!mo && !dangLuu) setHoi(null);
				}}
				tieuDe={dien(m.xacNhanLuuTru.tieuDe, { ten: hoi?.name ?? "" })}
				than={m.xacNhanLuuTru.than}
				nut={m.luuTru}
				thoi={m.xacNhanLuuTru.giu}
				pending={dangLuu}
				onConfirm={xacNhanLuuTru}
			/>
		</>
	);
}
