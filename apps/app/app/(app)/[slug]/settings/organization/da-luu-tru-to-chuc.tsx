"use client";

import { ArchivedList } from "@crm/ui/components/archived-list";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { KetQuaKhoiPhuc } from "@crm/validation/to-chuc-luu-tru";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import { cauChanKhoiPhuc } from "./chan-khoi-phuc";
import type { CayDuLieu } from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

type Muc = {
	loai: "bo-phan" | "phong-ban";
	id: string;
	name: string;
	purgeable: boolean;
};

export function DaLuuTruToChuc({ cay, sua }: { cay: CayDuLieu; sua: boolean }) {
	const locale = useLocale();
	const m = toChucMessages(locale);
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const [hoiXoa, setHoiXoa] = useState<Muc | null>(null);

	const khoiBp = useMutation(trpc.org.restoreDivision.mutationOptions());
	const khoiPb = useMutation(trpc.org.restoreDepartment.mutationOptions());
	const xoaBp = useMutation(trpc.org.purgeDivision.mutationOptions());
	const xoaPb = useMutation(trpc.org.purgeDepartment.mutationOptions());

	const muc: Muc[] = [
		...cay.archived.divisions.map((d) => ({ loai: "bo-phan" as const, ...d })),
		...cay.archived.departments.map((d) => ({
			loai: "phong-ban" as const,
			...d,
		})),
	];
	const theoId = new Map(muc.map((x) => [x.id, x]));
	const dangKhoi = khoiBp.isPending || khoiPb.isPending;
	const dangXoa = xoaBp.isPending || xoaPb.isPending;
	const loi = (e: { message: string }) => toast.error(e.message);

	return (
		<>
			<ArchivedList
				label={m.daLuuTru}
				restoreLabel={m.khoiPhuc}
				purgeLabel={m.xoaHan}
				items={muc.map((x) => ({
					id: x.id,
					name: x.name,
					kind: x.loai === "bo-phan" ? m.boPhanLoai : m.phongBanLoai,
					purgeable: x.purgeable,
				}))}
				disabled={!sua}
				pending={dangKhoi || dangXoa}
				onRestore={(id) => {
					const x = theoId.get(id);
					if (!x || dangKhoi) return;
					const xong = {
						onSuccess: async (kq: KetQuaKhoiPhuc) => {
							if ("chan" in kq) {
								toast.error(cauChanKhoiPhuc(locale, kq.chan));
								return;
							}
							toast.success(dien(m.daKhoiPhucTen, { ten: x.name }));
							await lamMoi();
						},
						onError: loi,
					};
					if (x.loai === "bo-phan") khoiBp.mutate({ id: x.id }, xong);
					else khoiPb.mutate({ id: x.id }, xong);
				}}
				onPurge={(item) => {
					const x = theoId.get(item.id);
					if (x) setHoiXoa(x);
				}}
			/>
			<ConfirmDialog
				open={hoiXoa !== null}
				onOpenChange={(mo) => {
					if (!mo && !dangXoa) setHoiXoa(null);
				}}
				tieuDe={dien(m.xacNhanXoa.tieuDe, { ten: hoiXoa?.name ?? "" })}
				than={m.xacNhanXoa.than}
				nut={m.xoaHan}
				thoi={m.xacNhanXoa.giu}
				pending={dangXoa}
				onConfirm={() => {
					const x = hoiXoa;
					if (x === null || dangXoa) return;
					const sau = {
						onSuccess: async () => {
							setHoiXoa(null);
							toast.success(dien(m.daXoaTen, { ten: x.name }));
							await lamMoi();
						},
						onError: (e: { message: string }) => {
							setHoiXoa(null);
							loi(e);
						},
					};
					if (x.loai === "bo-phan") xoaBp.mutate({ id: x.id }, sau);
					else xoaPb.mutate({ id: x.id }, sau);
				}}
			/>
		</>
	);
}
