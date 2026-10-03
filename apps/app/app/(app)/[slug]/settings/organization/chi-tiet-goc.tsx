"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import { TieuDeChiTiet, TieuDeMuc } from "./chi-tiet-chung";
import { DanhSachKeo } from "./danh-sach-keo";
import type { CayDuLieu, HanhDong } from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

export function ChiTietGoc({
	cay,
	tenGoc,
	hd,
	anTieuDe = false,
}: {
	cay: CayDuLieu;
	tenGoc: string;
	hd: HanhDong;
	anTieuDe?: boolean;
}) {
	const t = toChucMessages(useLocale());
	const m = t.chiTiet;
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const sap = useMutation(trpc.org.reorderDivisions.mutationOptions());

	return (
		<section className="flex flex-col gap-5 p-4" data-chi-tiet="goc">
			<TieuDeChiTiet ten={tenGoc} an={anTieuDe} />
			<div className="flex flex-col gap-2">
				<TieuDeMuc chu={dien(m.boPhan, { n: cay.divisions.length })}>
					<Button
						variant="outline"
						size="sm"
						disabled={!hd.sua}
						aria-haspopup="dialog"
						onClick={() => hd.moDonVi({ loai: "tao-bo-phan" })}
					>
						<Icon icon={Add} data-icon="inline-start" />
						{t.themBoPhan}
					</Button>
				</TieuDeMuc>
				{cay.divisions.length === 0 ? (
					<p className="text-muted-foreground text-sm">{m.gocTrong}</p>
				) : (
					<>
						<DanhSachKeo
							loai="bo-phan"
							menu={(x) => [
								{
									nhan: t.doiTen,
									lam: () =>
										hd.moDonVi({
											loai: "doi-ten",
											don: "bo-phan",
											id: x.id,
											name: x.name,
											moTa: x.moTa,
										}),
								},
								{
									nhan: t.luuTru,
									lam: () =>
										hd.hoiLuuTru({ loai: "bo-phan", id: x.id, name: x.name }),
								},
							]}
							muc={cay.divisions.map((bp) => ({
								id: bp.id,
								name: bp.name,
								moTa: bp.moTa,
								phu: dien(t.soPhongBan, { n: bp.departments.length }),
							}))}
							sua={hd.sua}
							dangGhi={sap.isPending}
							ghi={(ids, _id, xong) =>
								sap.mutate(
									{ ids },
									{
										onSuccess: async () => {
											toast.success(m.daSap);
											await lamMoi();
											xong();
										},
										onError: (e) => {
											xong();
											toast.error(e.message);
										},
									},
								)
							}
						/>
						<p className="text-muted-foreground text-xs">{m.keo}</p>
					</>
				)}
			</div>
			{cay.chuaXep.length > 0 ? (
				<div className="flex flex-col gap-2" data-nhom="chua-xep">
					<TieuDeMuc chu={dien(m.chuaXep, { n: cay.chuaXep.length })} />
					<ul className="divide-y rounded-lg border">
						{cay.chuaXep.map((pb) => (
							<li
								key={pb.id}
								className="flex items-center justify-between gap-2 px-3 py-2"
								data-phong-ban={pb.id}
							>
								<span className="truncate text-sm" translate="no" data-ten>
									{pb.name}
								</span>
								<Button
									variant="outline"
									size="sm"
									disabled={!hd.sua || cay.divisions.length === 0}
									aria-haspopup="dialog"
									onClick={() =>
										hd.moDonVi({
											loai: "chuyen",
											id: pb.id,
											name: pb.name,
											divisionId: null,
										})
									}
								>
									{m.ganVaoBoPhan}
								</Button>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</section>
	);
}
