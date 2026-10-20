export const PHONG = [
	{ khoa: "kd", ten: "Đo TH5 Kinh doanh" },
	{ khoa: "ns", ten: "Đo TH5 Nhân sự" },
];

export const NGUOI = [
	{ khoa: "lan", ten: "Đo TH5 Nguyễn Thị Lan", phong: "kd" },
	{ khoa: "minh", ten: "Đo TH5 Trần Văn Minh", phong: "ns" },
	{ khoa: "ha", ten: "Đo TH5 Lê Thu Hà", phong: null },
];

export const TIN_HIEU = [
	{
		khoa: "Y",
		nguoi: "lan",
		tieuDe: "Đo TH5: ô ngày nghỉ không nhận ngày lễ",
		muonLam: "Ghi ngày nghỉ",
		keoVeSau: true,
	},
	{
		khoa: "X",
		nguoi: "lan",
		tieuDe: "Đo TH5: test test",
		muonLam: "Thử nút gửi",
	},
	{
		khoa: "G",
		nguoi: "minh",
		tieuDe: "Đo TH5: gửi nhầm",
		muonLam: "Thử",
	},
	{
		khoa: "H",
		nguoi: "minh",
		tieuDe: "Đo TH5: báo cáo tuần thiếu cột doanh số",
		muonLam: "Gửi báo cáo tuần",
	},
];

export const CHUOI_RIENG = [
	...TIN_HIEU.map((t) => t.tieuDe),
	...NGUOI.map((n) => n.ten),
];

export async function gieo({ db, toChuc, phien, app, ma: dau, quanTri }) {
	const tao = { phong: [], nguoi: [] };
	const idPhong = {};
	for (const [i, p] of PHONG.entries()) {
		const d = await db.department.create({
			data: { name: p.ten, position: 9850 + i },
			select: { id: true },
		});
		idPhong[p.khoa] = d.id;
		tao.phong.push(d.id);
	}
	const cookie = {};
	const idNguoi = {};
	for (const n of NGUOI) {
		const id = `gtr-do-${dau}-${n.khoa}`;
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
	const ma = {};
	const goi = async (c, thuTuc, vao) => {
		const r = await fetch(`${app}/api/trpc/${thuTuc}`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie: `${c.ten}=${c.gia}; lang=vi`,
			},
			body: JSON.stringify(vao),
		});
		if (r.status !== 200) throw new Error(`gieo: ${thuTuc} tra ${r.status}`);
		return (await r.json())?.result?.data;
	};
	for (const t of TIN_HIEU) {
		const d = await goi(cookie[t.nguoi], "tinHieu.gui", {
			muonLam: t.muonLam,
			daXayRa: t.tieuDe,
			man: "/okr",
		});
		ma[t.khoa] = { id: d.id, ma: d.ma };
		if (t.keoVeSau) await goi(quanTri, "tinHieu.keoVe", {});
	}
	return { tao, idPhong, idNguoi, cookie, ma, goi };
}

export async function don(db, tao) {
	if (tao.nguoi.length) {
		await db.tinHieuVet.deleteMany({
			where: { tinHieu: { nguoiGuiId: { in: tao.nguoi } } },
		});
		await db.tinHieu.deleteMany({ where: { nguoiGuiId: { in: tao.nguoi } } });
		await db.orgPlacement.deleteMany({ where: { userId: { in: tao.nguoi } } });
		await db.session.deleteMany({ where: { userId: { in: tao.nguoi } } });
		await db.member.deleteMany({ where: { userId: { in: tao.nguoi } } });
		await db.user.deleteMany({ where: { id: { in: tao.nguoi } } });
	}
	if (tao.phong.length)
		await db.department.deleteMany({ where: { id: { in: tao.phong } } });
}
