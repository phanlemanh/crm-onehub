"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import {
	DongOkrMo,
	MenuDong,
	TieuDeChiTiet,
	TieuDeMuc,
} from "./chi-tiet-chung";
import { DanhSachKeo } from "./danh-sach-keo";
import {
	type BoPhanDuLieu,
	type CayDuLieu,
	type HanhDong,
	moiPhongBan,
} from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";
import { OTruong } from "./o-truong";

export function ChiTietBoPhan({
	cay,
	bp,
	tenGoc,
	hd,
	anTieuDe = false,
}: {
	cay: CayDuLieu;
	bp: BoPhanDuLieu;
	tenGoc: string;
	hd: HanhDong;
	anTieuDe?: boolean;
}) {
	const t = toChucMessages(useLocale());
	const m = t.chiTiet;
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const doi = useMutation(trpc.org.moveDepartment.mutationOptions());
	const tenPb = new Map(moiPhongBan(cay).map((p) => [p.id, p.name]));

	return (
		<section
			className="flex flex-col gap-5 p-4"
			data-chi-tiet="bo-phan"
			data-bo-phan={bp.id}
		>
			<TieuDeChiTiet
				an={anTieuDe}
				duong={tenGoc}
				ten={bp.name}
				menu={
					<MenuDong
						ten={bp.name}
						sua={hd.sua}
						muc={[
							{
								nhan: t.doiTen,
								lam: () =>
									hd.moDonVi({
										loai: "doi-ten",
										don: "bo-phan",
										id: bp.id,
										name: bp.name,
										moTa: bp.moTa,
									}),
							},
							{
								nhan: t.luuTru,
								lam: () =>
									hd.hoiLuuTru({
										loai: "bo-phan",
										id: bp.id,
										name: bp.name,
									}),
							},
						]}
					/>
				}
			/>
			<DongOkrMo
				level="bo-phan"
				okrMo={bp.okrMo}
				sua={hd.sua}
				moChuyen={() => hd.moChuyenOkr({ level: "bo-phan", id: bp.id })}
			/>
			<OTruong
				kind="division"
				donVi={bp}
				nhan={t.truongBoPhan}
				moTa={m.chonBatKy}
				truong={bp.head}
				ungVien={cay.people.map((n) => ({
					id: n.id,
					name: n.name,
					hint:
						(n.primaryDepartmentId && tenPb.get(n.primaryDepartmentId)) ||
						t.them.chuaCo,
				}))}
				sua={hd.sua}
			/>
			<div className="flex flex-col gap-2">
				<TieuDeMuc chu={dien(m.phongBan, { n: bp.departments.length })}>
					<Button
						variant="outline"
						size="sm"
						disabled={!hd.sua}
						aria-haspopup="dialog"
						onClick={() => hd.moGan(bp)}
					>
						{m.ganCoSan}
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={!hd.sua}
						aria-haspopup="dialog"
						onClick={() =>
							hd.moDonVi({
								loai: "tao-phong-ban",
								divisionId: bp.id,
								name: bp.name,
							})
						}
					>
						<Icon icon={Add} data-icon="inline-start" />
						{m.phongBanMoi}
					</Button>
				</TieuDeMuc>
				{bp.departments.length === 0 ? (
					<p className="text-muted-foreground text-sm">{m.bpTrong}</p>
				) : (
					<>
						<DanhSachKeo
							loai="phong-ban"
							menu={(x) => [
								{
									nhan: t.doiTen,
									lam: () =>
										hd.moDonVi({
											loai: "doi-ten",
											don: "phong-ban",
											id: x.id,
											name: x.name,
											moTa: x.moTa,
										}),
								},
								{
									nhan: t.chuyen,
									lam: () =>
										hd.moDonVi({
											loai: "chuyen",
											id: x.id,
											name: x.name,
											divisionId: bp.id,
										}),
								},
								{
									nhan: t.luuTru,
									lam: () =>
										hd.hoiLuuTru({
											loai: "phong-ban",
											id: x.id,
											name: x.name,
										}),
								},
							]}
							muc={bp.departments.map((pb) => ({
								id: pb.id,
								name: pb.name,
								moTa: pb.moTa,
								phu: pb.head
									? dien(t.soNguoi, { n: pb.people.length })
									: t.chuaCoTruong,
							}))}
							sua={hd.sua}
							ghi={({ id, index }) =>
								doi
									.mutateAsync({ id, divisionId: bp.id, index })
									.then(() => lamMoi())
							}
						/>
					</>
				)}
			</div>
		</section>
	);
}
