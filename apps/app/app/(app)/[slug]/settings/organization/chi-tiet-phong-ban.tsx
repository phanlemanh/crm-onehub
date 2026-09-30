"use client";

import Add from "@carbon/icons-react/es/Add";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import {
	DongNguoi,
	DongOkrMo,
	MenuDong,
	TieuDeChiTiet,
	TieuDeMuc,
} from "./chi-tiet-chung";
import type { BoPhanDuLieu, CayDuLieu, HanhDong, PhongBanDuLieu } from "./kieu";
import { OTruong } from "./o-truong";

export function ChiTietPhongBan({
	cay,
	pb,
	bp,
	hd,
	anTieuDe = false,
}: {
	cay: CayDuLieu;
	pb: PhongBanDuLieu;
	bp: BoPhanDuLieu | null;
	hd: HanhDong;
	anTieuDe?: boolean;
}) {
	const t = toChucMessages(useLocale());
	const m = t.chiTiet;
	const nguoi = [...new Map(pb.people.map((n) => [n.id, n])).values()];
	const trong = pb.people.length === 0;
	const quanLy = new Map(cay.people.map((p) => [p.id, p.manager?.name]));
	const nutThem = (chinh: boolean) => (
		<Button
			variant={chinh ? "default" : "outline"}
			size={chinh ? "default" : "sm"}
			disabled={!hd.sua}
			aria-haspopup="dialog"
			onClick={() => hd.moThem(pb)}
		>
			<Icon icon={Add} data-icon="inline-start" />
			{m.themNguoi}
		</Button>
	);

	return (
		<section
			className="flex flex-col gap-5 p-4"
			data-chi-tiet="phong-ban"
			data-phong-ban={pb.id}
		>
			<TieuDeChiTiet
				an={anTieuDe}
				duong={bp?.name ?? t.chuaXep}
				ten={pb.name}
				menu={
					<MenuDong
						ten={pb.name}
						sua={hd.sua}
						muc={[
							{
								nhan: t.doiTen,
								lam: () =>
									hd.moDonVi({
										loai: "doi-ten",
										don: "phong-ban",
										id: pb.id,
										name: pb.name,
										moTa: pb.moTa,
									}),
							},
							{
								nhan: t.chuyen,
								lam: () =>
									hd.moDonVi({
										loai: "chuyen",
										id: pb.id,
										name: pb.name,
										divisionId: pb.divisionId,
									}),
							},
							{
								nhan: t.luuTru,
								lam: () =>
									hd.hoiLuuTru({
										loai: "phong-ban",
										id: pb.id,
										name: pb.name,
									}),
							},
						]}
					/>
				}
			/>
			<DongOkrMo
				level="phong-ban"
				okrMo={pb.okrMo}
				sua={hd.sua}
				moChuyen={() => hd.moChuyenOkr({ level: "phong-ban", id: pb.id })}
			/>
			<OTruong
				kind="department"
				donVi={pb}
				nhan={t.truongPhongBan}
				moTa={m.chonTrongPhongBan}
				truong={pb.head}
				ungVien={nguoi}
				sua={hd.sua}
			/>
			<div className="flex flex-col gap-2">
				<TieuDeMuc chu={dien(m.nguoi, { n: nguoi.length })}>
					{trong ? null : nutThem(false)}
				</TieuDeMuc>
				{trong ? (
					<Empty data-trang-thai="ST-tochuc-phongban-trong">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={UserMultiple} />
							</EmptyMedia>
							<EmptyTitle>{m.pbTrong.title}</EmptyTitle>
							<EmptyDescription>{m.pbTrong.body}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>{nutThem(true)}</EmptyContent>
					</Empty>
				) : (
					<ul className="divide-y rounded-lg border">
						{pb.people.map((n) => (
							<DongNguoi
								key={`${n.id}-${n.primary}`}
								nguoi={n}
								nhan={
									pb.head?.id === n.id
										? t.truongPhongBan
										: n.primary
											? null
											: t.phu
								}
								phu={(() => {
									const ten = quanLy.get(n.id);
									return ten ? dien(m.quanLy, { ten }) : null;
								})()}
								cuoi={
									<Button
										variant="ghost"
										size="xs"
										disabled={!hd.sua}
										aria-haspopup="dialog"
										aria-label={dien(m.viTriCua, { ten: n.name })}
										data-nguoi={n.id}
										onClick={() => hd.moNguoi(n.id)}
									>
										{m.viTriNgan}
									</Button>
								}
							/>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}
