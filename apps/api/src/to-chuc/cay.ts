import { KHONG_OKR, type OkrTheoDonVi } from "@crm/db/okr-don-vi";
import { quanLyTrucTiep } from "./quan-ly";
import type { NguoiOutput, TreeOutput } from "./to-chuc.contracts";
import { lyDoKhongXoaPhongBan } from "./xoa-phong-ban";

export type CayTho = {
	members: NguoiOutput[];
	divisions: {
		id: string;
		name: string;
		moTa: string;
		position: number;
		headUserId: string | null;
		archivedAt: Date | null;
		departmentCount: number;
	}[];
	departments: {
		id: string;
		name: string;
		moTa: string;
		position: number;
		divisionId: string | null;
		headUserId: string | null;
		archivedAt: Date | null;
		stepCount: number;
	}[];
	placements: {
		userId: string;
		primaryDepartmentId: string | null;
		managerUserId: string | null;
		chucDanh: string;
	}[];
	secondaries: { userId: string; departmentId: string }[];
	khuonCuaPhongBan: ReadonlyMap<string, readonly string[]>;
	okr: OkrTheoDonVi;
};

const theoTen = (a: NguoiOutput, b: NguoiOutput) =>
	a.name.localeCompare(b.name, "vi");

export function dungCay(tho: CayTho): TreeOutput {
	const okrPb = (id: string) => tho.okr.phongBan.get(id) ?? KHONG_OKR;
	const okrBp = (id: string) => tho.okr.boPhan.get(id) ?? KHONG_OKR;
	const nguoi = new Map(tho.members.map((m) => [m.id, m]));
	const hieuLuc = new Set(nguoi.keys());
	const pbSong = tho.departments.filter((d) => d.archivedAt === null);
	const bpSong = tho.divisions.filter((d) => d.archivedAt === null);
	const pbSongIds = new Set(pbSong.map((d) => d.id));
	const bpSongIds = new Set(bpSong.map((d) => d.id));

	const chinh = new Map(
		tho.placements
			.filter((p) => hieuLuc.has(p.userId) && p.primaryDepartmentId !== null)
			.map((p) => [p.userId, p.primaryDepartmentId as string]),
	);
	const phu = tho.secondaries.filter(
		(s) => hieuLuc.has(s.userId) && pbSongIds.has(s.departmentId),
	);
	const thuocPb = (userId: string, pbId: string) =>
		chinh.get(userId) === pbId ||
		phu.some((s) => s.userId === userId && s.departmentId === pbId);
	const truongHop = (pbId: string, headUserId: string | null) =>
		headUserId !== null && hieuLuc.has(headUserId) && thuocPb(headUserId, pbId);

	const truongPb = new Map(
		pbSong
			.filter((d) => truongHop(d.id, d.headUserId))
			.map((d) => [d.id, d.headUserId as string]),
	);
	const truongBp = new Map(
		bpSong
			.filter((d) => d.headUserId !== null && hieuLuc.has(d.headUserId))
			.map((d) => [d.id, d.headUserId as string]),
	);
	const ngCanh = {
		hieuLuc,
		chonTay: new Map(
			tho.placements
				.filter((p) => p.managerUserId !== null)
				.map((p) => [p.userId, p.managerUserId as string]),
		),
		phongBanChinh: new Map([...chinh].filter(([, pb]) => pbSongIds.has(pb))),
		truongPhongBan: truongPb,
		boPhanCuaPhongBan: new Map(
			pbSong
				.filter((d) => d.divisionId !== null && bpSongIds.has(d.divisionId))
				.map((d) => [d.id, d.divisionId as string]),
		),
		truongBoPhan: truongBp,
	};

	const nodePb = (d: CayTho["departments"][number]) => ({
		id: d.id,
		name: d.name,
		moTa: d.moTa,
		position: d.position,
		divisionId:
			d.divisionId !== null && bpSongIds.has(d.divisionId)
				? d.divisionId
				: null,
		head: nguoi.get(truongPb.get(d.id) ?? "") ?? null,
		stepCount: d.stepCount,
		okrMo: okrPb(d.id).mo,
		people: [
			...[...chinh]
				.filter(([, pb]) => pb === d.id)
				.flatMap(([u]) => {
					const n = nguoi.get(u);
					return n ? [{ ...n, primary: true }] : [];
				})
				.sort(theoTen),
			...phu
				.filter((s) => s.departmentId === d.id)
				.flatMap((s) => {
					const n = nguoi.get(s.userId);
					return n ? [{ ...n, primary: false }] : [];
				})
				.sort(theoTen),
		],
	});
	const theoViTri = <T extends { position: number; name: string }>(
		a: T,
		b: T,
	) => a.position - b.position || a.name.localeCompare(b.name, "vi");

	const divisions = [...bpSong].sort(theoViTri).map((b) => ({
		id: b.id,
		name: b.name,
		moTa: b.moTa,
		position: b.position,
		head: nguoi.get(truongBp.get(b.id) ?? "") ?? null,
		okrMo: okrBp(b.id).mo,
		departments: pbSong
			.filter((d) => d.divisionId === b.id)
			.sort(theoViTri)
			.map(nodePb),
	}));
	const chuaXep = pbSong
		.filter((d) => d.divisionId === null || !bpSongIds.has(d.divisionId))
		.sort(theoViTri)
		.map(nodePb);
	const coChinhSong = (u: string) => {
		const pb = chinh.get(u);
		return pb !== undefined && pbSongIds.has(pb);
	};
	const people = [...tho.members].sort(theoTen).map((m) => {
		const ql = quanLyTrucTiep(m.id, ngCanh);
		const vt = tho.placements.find((p) => p.userId === m.id);
		const tay = vt?.managerUserId ?? null;
		return {
			...m,
			primaryDepartmentId: coChinhSong(m.id)
				? (chinh.get(m.id) as string)
				: null,
			secondaryDepartmentIds: phu
				.filter((s) => s.userId === m.id)
				.map((s) => s.departmentId),
			managerOverrideId:
				tay !== null && hieuLuc.has(tay) && tay !== m.id ? tay : null,
			manager: ql.managerId === null ? null : (nguoi.get(ql.managerId) ?? null),
			managerSource: ql.source,
			chucDanh: vt?.chucDanh ?? "",
		};
	});
	const soChinh = new Map<string, number>();
	for (const p of tho.placements)
		if (p.primaryDepartmentId !== null)
			soChinh.set(
				p.primaryDepartmentId,
				(soChinh.get(p.primaryDepartmentId) ?? 0) + 1,
			);
	return {
		divisions,
		chuaXep,
		chuaCoPhongBan: [...tho.members]
			.filter((m) => !coChinhSong(m.id))
			.sort(theoTen),
		people,
		archived: {
			divisions: tho.divisions
				.filter((d) => d.archivedAt !== null)
				.map((d) => ({
					id: d.id,
					name: d.name,
					okrMo: okrBp(d.id).mo,
					purgeable: d.departmentCount === 0 && okrBp(d.id).lichSu === 0,
				})),
			departments: tho.departments
				.filter((d) => d.archivedAt !== null)
				.map((d) => ({
					id: d.id,
					name: d.name,
					okrMo: okrPb(d.id).mo,
					purgeable:
						lyDoKhongXoaPhongBan({
							archived: true,
							stepCount: d.stepCount,
							primaryCount: soChinh.get(d.id) ?? 0,
							khuon: tho.khuonCuaPhongBan.get(d.id) ?? [],
							okrLichSu: okrPb(d.id).lichSu,
						}) === null,
				})),
		},
		coverage: {
			members: tho.members.length,
			withPrimary: tho.members.filter((m) => coChinhSong(m.id)).length,
			departmentsWithoutHead: pbSong.filter((d) => !truongPb.has(d.id)).length,
		},
	};
}
