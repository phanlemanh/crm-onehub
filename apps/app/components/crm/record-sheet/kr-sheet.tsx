"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { PickListDialog } from "@crm/ui/components/pick-list-dialog";
import { useSearchInput } from "@crm/ui/hooks/use-search-input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { CANH_KR } from "@/app/(app)/[slug]/okr/kieu";
import {
	DetailSheetHeader,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { type BangChungVao, KrBangChung } from "./kr-bang-chung";
import {
	type CanhKr,
	KrViecDanhSach,
	type LoaiSangKien,
	type TrangThaiCanh,
	type ViecVao,
} from "./kr-viec";
import { dien, dienNode } from "./plan-copy";
import { useRecordSheetView, useRecordStack } from "./record-stack";

const TAB = { viec: "viec", bangChung: "bang-chung" } as const;

export function KhungKr({
	duLieu,
	tab,
	onTab,
	onBack,
	viec,
	bangChung,
}: {
	duLieu: TrangThaiCanh;
	tab: string;
	onTab: (tab: string) => void;
	onBack?: () => void;
	viec: ReactNode;
	bangChung: ReactNode;
}) {
	const m = okrCanhKrMessages(useLocale()).khung;
	const canh = duLieu.loai === "xong" ? duLieu.canh : null;
	const tabs: DetailSheetTab[] = [
		{ value: TAB.viec, label: m.tabViec, content: viec },
		...(canh?.kr.kind === "moc"
			? [{ value: TAB.bangChung, label: m.tabBangChung, content: bangChung }]
			: []),
	];
	const dangMo = tabs.some((t) => t.value === tab) ? tab : TAB.viec;
	return (
		<div
			className="contents"
			data-kr-sheet={canh?.kr.id}
			data-kieu-kr={canh?.kr.kind}
		>
			<DetailSheetHeader
				title={canh ? <span translate="no">{canh.kr.title}</span> : m.tieuDeCho}
				description={
					canh
						? dienNode(m.phuTrach, {
								ten: <span translate="no">{canh.kr.ownerName}</span>,
							})
						: undefined
				}
				onBack={onBack}
			/>
			<DetailSheetTabs tabs={tabs} value={dangMo} onValueChange={onTab} />
		</div>
	);
}

function ChonSangKien({
	canh,
	loai,
	dong,
}: {
	canh: CanhKr;
	loai: LoaiSangKien;
	dong: () => void;
}) {
	const t = okrCanhKrMessages(useLocale()).chon;
	const m = t[loai];
	const trpc = useTRPC();
	const qc = useQueryClient();
	const cache = useCrmCache();
	const [tim, setTim] = useState("");
	const [, doiTim] = useSearchInput(tim, setTim);
	const [chon, setChon] = useState<string[]>([]);
	const [dangGan, setDangGan] = useState(false);
	const [loi, setLoi] = useState<string | null>(null);
	const keHoach = useQuery({
		...trpc.onboarding.listPlans.queryOptions({
			q: tim,
			pageSize: CANH_KR.soGoiY,
		}),
		enabled: loai === "ke-hoach",
		placeholderData: (truoc) => truoc,
	});
	const chienDich = useQuery({
		...trpc.campaigns.list.queryOptions(),
		enabled: loai === "chien-dich",
	});
	const gan = useMutation(trpc.okr.ganSangKien.mutationOptions());
	const daGan = new Set(
		canh.dong.flatMap((d) =>
			d.loai === loai && d.lienKet.coQuyen && d.lienKet.id !== null
				? [d.lienKet.id]
				: [],
		),
	);
	const muc = (
		loai === "ke-hoach"
			? (keHoach.data?.rows ?? []).map((p) => ({
					id: p.id,
					label: p.companyName,
				}))
			: (chienDich.data ?? []).map((c) => ({ id: c.id, label: c.name }))
	).filter((x) => !daGan.has(x.id));

	const xacNhan = async () => {
		if (dangGan || chon.length === 0) return;
		setDangGan(true);
		setLoi(null);
		const daXong: string[] = [];
		try {
			for (const banGhiId of chon) {
				await gan.mutateAsync({
					keyResultId: canh.kr.id,
					loai,
					banGhiId,
				});
				daXong.push(banGhiId);
			}
			toast.success(t.daGan);
			dong();
		} catch (e) {
			setChon(chon.filter((id) => !daXong.includes(id)));
			setLoi(e instanceof Error ? e.message : String(e));
		} finally {
			setDangGan(false);
			await Promise.all([
				qc.invalidateQueries({
					queryKey: trpc.okr.canhKr.queryKey({ keyResultId: canh.kr.id }),
				}),
				cache.okr(canh.kr.objectiveId, { settle: "record" }),
			]);
		}
	};

	return (
		<PickListDialog
			open
			onOpenChange={(mo) => {
				if (!mo && !dangGan) dong();
			}}
			title={m.tieuDe}
			description={m.moTa}
			searchPlaceholder={m.tim}
			items={muc}
			selected={chon}
			onSelectedChange={setChon}
			confirmLabel={(n) => (n > 0 ? dien(m.xacNhan, { n }) : t.gan)}
			cancelLabel={t.huy}
			emptyLabel={m.rong}
			onConfirm={() => void xacNhan()}
			pending={dangGan}
			error={loi}
			onSearchChange={loai === "ke-hoach" ? doiTim : undefined}
		/>
	);
}

function useGhiCanh(keyResultId: string, objectiveId: string | null) {
	const t = okrCanhKrMessages(useLocale()).bao;
	const trpc = useTRPC();
	const qc = useQueryClient();
	const cache = useCrmCache();
	const lamMoi = () =>
		Promise.all([
			qc.invalidateQueries({
				queryKey: trpc.okr.canhKr.queryKey({ keyResultId }),
			}),
			objectiveId
				? cache.okr(objectiveId, { settle: "record" })
				: Promise.resolve(),
		]).then(() => undefined);
	const baoLoi = (e: { message: string }) => toast.error(e.message);
	const them = useMutation(trpc.okr.themViec.mutationOptions());
	const sua = useMutation(trpc.okr.suaViec.mutationOptions());
	const danhDau = useMutation(
		trpc.okr.danhDauViec.mutationOptions({
			onSettled: () => void lamMoi(),
			onError: baoLoi,
		}),
	);
	const go = useMutation(trpc.okr.goViec.mutationOptions({ onError: baoLoi }));
	const dinh = useMutation(trpc.okr.themBangChung.mutationOptions());
	const goBangChung = useMutation(
		trpc.okr.goBangChung.mutationOptions({ onError: baoLoi }),
	);

	return {
		onThem: async (vao: ViecVao) => {
			await them.mutateAsync({ keyResultId, ...vao });
			toast.success(t.daThem);
			await lamMoi();
		},
		onSua: async (id: string, vao: ViecVao) => {
			await sua.mutateAsync({ id, ...vao });
			toast.success(t.daLuu);
			await lamMoi();
		},
		onDanhDau: (id: string, xong: boolean) => danhDau.mutate({ id, xong }),
		onGo: async (id: string) => {
			await go.mutateAsync({ id });
			toast.success(t.daGo);
			await lamMoi();
		},
		onDinh: async (vao: BangChungVao) => {
			await dinh.mutateAsync({ keyResultId, ...vao });
			toast.success(t.daDinh);
			await lamMoi();
		},
		onGoBangChung: async (id: string) => {
			await goBangChung.mutateAsync({ id });
			toast.success(t.daGo);
			await lamMoi();
		},
	};
}

export function KrSheet({ keyResultId }: { keyResultId: string }) {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const { stack, close, open, lotDuoi } = useRecordStack();
	const { tab, setTab } = useRecordSheetView(TAB.viec);
	const q = useQuery(trpc.okr.canhKr.queryOptions({ keyResultId }));
	const nguoi = useQuery(trpc.users.list.queryOptions());
	const toi = useQuery(trpc.users.me.queryOptions());
	const [gan, setGan] = useState<LoaiSangKien | null>(null);
	const objectiveId = q.data?.kr.objectiveId ?? null;
	const ghi = useGhiCanh(keyResultId, objectiveId);
	const duoiMotMinh = stack.length === 1;

	useEffect(() => {
		if (objectiveId && duoiMotMinh)
			lotDuoi({ kind: "objective", id: objectiveId });
	}, [objectiveId, duoiMotMinh, lotDuoi]);

	const duLieu: TrangThaiCanh = q.data
		? { loai: "xong", canh: q.data }
		: q.error
			? {
					loai: "loi",
					thongDiep: q.error.message,
					khongCo: q.error.data?.code === "NOT_FOUND",
				}
			: { loai: "dang-tai" };
	const coDuoi = stack.length > 1;

	return (
		<>
			<KhungKr
				duLieu={duLieu}
				tab={tab}
				onTab={setTab}
				onBack={coDuoi ? close : undefined}
				viec={
					<KrViecDanhSach
						duLieu={duLieu}
						nguoi={(nguoi.data ?? []).map((u) => ({
							value: u.id,
							label: u.name,
							hint: u.email,
						}))}
						nguoiDangTai={nguoi.isPending}
						nguoiMacDinh={toi.data?.id ?? ""}
						hanhDong={{
							onThem: ghi.onThem,
							onSua: ghi.onSua,
							onDanhDau: ghi.onDanhDau,
							onGo: ghi.onGo,
							onGan: setGan,
							onMo: (loai, id) => {
								if (loai === "ke-hoach") open({ kind: "plan", id });
								else router.push(workspaceUrl(`/campaigns/${id}`));
							},
							onThuLai: () => void q.refetch(),
							onVeMucTieu: coDuoi ? close : undefined,
						}}
					/>
				}
				bangChung={
					q.data ? (
						<KrBangChung
							canh={q.data}
							onDinh={ghi.onDinh}
							onGo={ghi.onGoBangChung}
						/>
					) : null
				}
			/>
			{gan && q.data?.quyen.ganDuoc ? (
				<ChonSangKien canh={q.data} loai={gan} dong={() => setGan(null)} />
			) : null}
		</>
	);
}
