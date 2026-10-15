export const PHONG = [
	{ khoa: "kd", ten: "Đo TH4 Kinh doanh" },
	{ khoa: "ns", ten: "Đo TH4 Nhân sự" },
];

export const NGUOI = [
	{ khoa: "lan", ten: "Đo TH4 Nguyễn Thị Lan", phong: "kd" },
	{ khoa: "minh", ten: "Đo TH4 Trần Văn Minh", phong: "ns" },
	{ khoa: "ha", ten: "Đo TH4 Lê Thu Hà", phong: null },
];

export const TIN_HIEU = [
	{
		nguoi: "lan",
		tieuDe: "Đo TH4: không lọc được thoả thuận theo người phụ trách",
		muonLam: "Xem thoả thuận của nhóm",
	},
	{
		nguoi: "lan",
		tieuDe: "Đo TH4: báo cáo tuần thiếu cột doanh số",
		muonLam: "Gửi báo cáo tuần",
	},
	{
		nguoi: "minh",
		tieuDe: "Đo TH4: ô ngày nghỉ không nhận ngày lễ",
		muonLam: "Ghi ngày nghỉ",
	},
	{
		nguoi: "ha",
		tieuDe: "Đo TH4: không đổi được ảnh đại diện",
		muonLam: "Cập nhật hồ sơ",
	},
];

export const CHUOI_RIENG = [
	...TIN_HIEU.map((t) => t.tieuDe),
	...NGUOI.map((n) => n.ten),
];

export async function gieo({ db, toChuc, phien, app, ma }) {
	const tao = { phong: [], nguoi: [] };
	const idPhong = {};
	for (const [i, p] of PHONG.entries()) {
		const d = await db.department.create({
			data: { name: p.ten, position: 9800 + i },
			select: { id: true },
		});
		idPhong[p.khoa] = d.id;
		tao.phong.push(d.id);
	}
	const cookie = {};
	const idNguoi = {};
	for (const n of NGUOI) {
		const id = `mth-do-${ma}-${n.khoa}`;
		const email = `${id}@thu.test`;
		await db.user.create({
			data: { id, email, name: n.ten, emailVerified: true },
		});
		await db.member.create({
			data: {
				id: `member-${id}`,
				organizationId: toChuc,
				userId: id,
				role: "member",
				createdAt: new Date(),
			},
		});
		if (n.phong)
			await db.orgPlacement.create({
				data: { userId: id, primaryDepartmentId: idPhong[n.phong] },
			});
		tao.nguoi.push(id);
		idNguoi[n.khoa] = id;
		cookie[n.khoa] = phien(email);
		await db.session.updateMany({
			where: { userId: id },
			data: { activeOrganizationId: toChuc },
		});
	}
	for (const t of TIN_HIEU) {
		const c = cookie[t.nguoi];
		const r = await fetch(`${app}/api/trpc/tinHieu.gui`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie: `${c.ten}=${c.gia}; lang=vi`,
			},
			body: JSON.stringify({
				muonLam: t.muonLam,
				daXayRa: t.tieuDe,
				man: "/okr",
			}),
		});
		if (r.status !== 200)
			throw new Error(`gieo: tinHieu.gui cua ${t.nguoi} tra ${r.status}`);
	}
	return { tao, idPhong, idNguoi, cookie };
}

export async function don(db, tao) {
	if (tao.nguoi.length) {
		await db.tinHieu.deleteMany({ where: { nguoiGuiId: { in: tao.nguoi } } });
		await db.orgPlacement.deleteMany({ where: { userId: { in: tao.nguoi } } });
		await db.session.deleteMany({ where: { userId: { in: tao.nguoi } } });
		await db.member.deleteMany({ where: { userId: { in: tao.nguoi } } });
		await db.user.deleteMany({ where: { id: { in: tao.nguoi } } });
	}
	if (tao.phong.length)
		await db.department.deleteMany({ where: { id: { in: tao.phong } } });
}
