import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import type { LuaChon } from "./truong-trang-moi";

type Toi = { id: string; name: string };

export type ChuTrangVaDonVi = { chuTrang: LuaChon[]; donVi: LuaChon[] };

export async function chuTrangVaDonVi(toi: Toi): Promise<ChuTrangVaDonVi> {
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [thanhVien, toChuc] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.thanhVien.queryOptions()).catch(() => []),
		queryClient.fetchQuery(trpc.org.tree.queryOptions()).catch(() => null),
	]);
	const chuTrang: LuaChon[] = [
		{ id: toi.id, ten: toi.name },
		...thanhVien
			.filter((u) => u.id !== toi.id)
			.map((u) => ({ id: u.id, ten: u.name })),
	];
	const donVi: LuaChon[] = toChuc
		? [
				...toChuc.divisions.flatMap((b) => b.departments),
				...toChuc.chuaXep,
			].map((d) => ({ id: d.id, ten: d.name }))
		: [];
	return { chuTrang, donVi };
}

export async function trangDangDung(): Promise<LuaChon[]> {
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const { rows } = await queryClient.fetchQuery(
		trpc.taiLieu.dangDung.queryOptions(),
	);
	return rows.map((t) => ({ id: t.slug, ten: t.ten }));
}
