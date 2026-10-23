"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Field, FieldLabel } from "@crm/ui/components/field";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Switch } from "@crm/ui/components/switch";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { thongBaoMessages } from "@/lib/messages/thong-bao";
import { useTRPC } from "@/lib/trpc/client";

export type MucLoai = "can-lam" | "de-biet";

export type DongCaiDat = {
	loai: string;
	ten: string;
	muc: MucLoai;
	dayRa: boolean;
};

type ChuCaiDat = ReturnType<typeof thongBaoMessages>["caiDat"];

function congTacCua({
	ten,
	dayRa,
	khoa,
	nhanChuong,
	nhanKenh,
	onDoi,
}: {
	ten: string;
	dayRa: boolean;
	khoa: boolean;
	nhanChuong: string;
	nhanKenh: string;
	onDoi: (v: boolean) => void;
}) {
	return {
		chuong: (
			<Switch aria-label={nhanChuong} checked data-cong-tac="chuong" disabled />
		),
		kenh: (
			<Switch
				aria-label={nhanKenh}
				checked={dayRa}
				data-cong-tac="kenh"
				data-loai={ten}
				disabled={khoa}
				onCheckedChange={onDoi}
			/>
		),
	};
}

export function BangLoaiThongBao({
	dong,
	tenKenh,
	khoaKenh,
	t,
	onDoi,
}: {
	dong: DongCaiDat[];
	tenKenh: string;
	khoaKenh: (loai: string) => boolean;
	t: ChuCaiDat;
	onDoi: (loai: string, dayRa: boolean) => void;
}) {
	const nhom: { muc: MucLoai; ten: string; moTa: string }[] = [
		{ muc: "can-lam", ten: t.canLam, moTa: t.canLamMoTa },
		{ muc: "de-biet", ten: t.deBiet, moTa: t.deBietMoTa },
	];
	return (
		<div className="flex flex-col gap-4">
			{nhom.map((n) => {
				const cua = dong.filter((d) => d.muc === n.muc);
				const congTac = (d: DongCaiDat) =>
					congTacCua({
						ten: d.loai,
						dayRa: d.dayRa,
						khoa: khoaKenh(d.loai),
						nhanChuong: dien(t.chuongLuonBat, { loai: d.ten }),
						nhanKenh: dien(t.congTacKenh, { loai: d.ten, kenh: tenKenh }),
						onDoi: (v) => onDoi(d.loai, v),
					});
				return (
					<Card key={n.muc} data-muc={n.muc}>
						<CardHeader>
							<CardTitle>{n.ten}</CardTitle>
							<CardDescription>{n.moTa}</CardDescription>
						</CardHeader>
						<div className="hidden md:block" data-bang-loai="">
							<SimpleTable
								columns={[
									{ id: "loai", header: t.cotLoai },
									{ id: "chuong", header: t.cotChuong, align: "center" },
									{ id: "kenh", header: tenKenh, align: "center" },
								]}
								surface="page"
							>
								{cua.map((d) => {
									const c = congTac(d);
									return (
										<SimpleTableRow key={d.loai} data-dong-loai={d.loai}>
											<SimpleTableCell>{d.ten}</SimpleTableCell>
											<SimpleTableCell align="center">
												{c.chuong}
											</SimpleTableCell>
											<SimpleTableCell align="center">{c.kenh}</SimpleTableCell>
										</SimpleTableRow>
									);
								})}
							</SimpleTable>
						</div>
						<div className="md:hidden" data-the-loai="">
							<ItemGroup>
								{cua.map((d) => {
									const c = congTac(d);
									return (
										<Item
											key={d.loai}
											variant="outline"
											data-dong-loai={d.loai}
										>
											<ItemContent>
												<ItemTitle>{d.ten}</ItemTitle>
											</ItemContent>
											<ItemActions>
												<div className="flex flex-col gap-2">
													<Field orientation="horizontal">
														<FieldLabel>{t.cotChuong}</FieldLabel>
														{c.chuong}
													</Field>
													<Field orientation="horizontal">
														<FieldLabel>{tenKenh}</FieldLabel>
														{c.kenh}
													</Field>
												</div>
											</ItemActions>
										</Item>
									);
								})}
							</ItemGroup>
						</div>
					</Card>
				);
			})}
		</div>
	);
}

export function KhoiLoaiThongBao() {
	const t = thongBaoMessages(useLocale());
	const m = t.caiDat;
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [dangLuu, setDangLuu] = useState<Record<string, boolean>>({});
	const caiDat = useQuery(trpc.thongBao.caiDat.queryOptions());
	const luu = useMutation(
		trpc.thongBao.luuCaiDat.mutationOptions({
			onMutate: (v) => setDangLuu((cu) => ({ ...cu, [v.loai]: v.dayRa })),
			onSuccess: (kq) => {
				queryClient.setQueryData(trpc.thongBao.caiDat.queryKey(), (cu) =>
					cu
						? {
								...cu,
								loai: cu.loai.map((l) => (l.loai === kq.loai ? kq : l)),
							}
						: cu,
				);
				toast.success(m.daLuu);
			},
			onError: () => toast.error(m.luuLoi),
			onSettled: (_kq, _loi, v) =>
				setDangLuu((cu) => {
					const { [v.loai]: _bo, ...con } = cu;
					return con;
				}),
		}),
	);

	if (caiDat.isPending) return <KhungXuong hinh="the" />;
	if (caiDat.isError || !caiDat.data) {
		return (
			<VungTaiLoi
				tieuDe={m.taiLoiTieuDe}
				moTa={m.taiLoiMoTa}
				onThuLai={() => void caiDat.refetch()}
				dangTai={caiDat.isFetching}
				data-trang-thai="ST-cai-dat-loi"
			/>
		);
	}

	const du = caiDat.data;
	const tenKenh =
		du.kenh === "zalo" ? "Zalo" : du.kenh === "slack" ? "Slack" : m.khongKenh;
	const lyDo =
		du.kenh !== null
			? null
			: du.lyDo === "zalo-tat"
				? m.lyDoZaloTat
				: m.lyDoChuaNoi;
	const dong: DongCaiDat[] = du.loai.map((l) => ({
		loai: l.loai,
		ten: t.tenLoai[l.loai],
		muc: l.muc,
		dayRa: dangLuu[l.loai] ?? l.dayRa,
	}));

	return (
		<div
			className="flex flex-col gap-3"
			data-trang-thai={
				du.kenh === null ? "ST-cai-dat-khong-kenh" : "ST-cai-dat-mac-dinh"
			}
		>
			<p className="text-muted-foreground text-sm">
				{dien(m.moTa, { kenh: tenKenh })}
			</p>
			{lyDo ? (
				<p className="text-sm" data-ly-do-khoa="">
					{lyDo}
				</p>
			) : null}
			<BangLoaiThongBao
				dong={dong}
				khoaKenh={(loai) => du.kenh === null || loai in dangLuu}
				onDoi={(loai, dayRa) => {
					const l = du.loai.find((x) => x.loai === loai);
					if (l) luu.mutate({ loai: l.loai, dayRa });
				}}
				t={m}
				tenKenh={tenKenh}
			/>
		</div>
	);
}
