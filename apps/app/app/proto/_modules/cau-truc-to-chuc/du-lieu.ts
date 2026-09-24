export type NguoiMau = { id: string; ten: string; email: string };

export type PhongBanMau = {
	id: string;
	ten: string;
	soBuoc: number;
	truong: NguoiMau | null;
	thanhVien: NguoiMau[];
};

export type BoPhanMau = {
	id: string;
	ten: string;
	truong: NguoiMau | null;
	phongBan: PhongBanMau[];
};

const nguoi = (id: string, ten: string): NguoiMau => ({
	id,
	ten,
	email: `${id}@onehub.vn`,
});

const LAN = nguoi("lan", "Nguyễn Thị Lan");
const HUNG = nguoi("hung", "Trần Văn Hùng");
const MAI = nguoi("mai", "Lê Thanh Mai");
const DUC = nguoi("duc", "Phạm Minh Đức");
const THAO = nguoi("thao", "Võ Phương Thảo");
const KHOA = nguoi("khoa", "Đặng Anh Khoa");
const NGA = nguoi("nga", "Bùi Thu Nga");
const TUAN = nguoi("tuan", "Hoàng Quốc Tuấn");

export const PHONG_BAN_PHANG: readonly PhongBanMau[] = [
	{
		id: "kd1",
		ten: "Kinh doanh vùng 1",
		soBuoc: 6,
		truong: HUNG,
		thanhVien: [HUNG, MAI],
	},
	{
		id: "kd2",
		ten: "Kinh doanh vùng 2",
		soBuoc: 4,
		truong: DUC,
		thanhVien: [DUC],
	},
	{
		id: "cskh",
		ten: "Chăm sóc khách hàng",
		soBuoc: 5,
		truong: THAO,
		thanhVien: [THAO, NGA],
	},
	{ id: "kho", ten: "Kho vận", soBuoc: 2, truong: null, thanhVien: [TUAN] },
	{ id: "ketoan", ten: "Kế toán", soBuoc: 3, truong: KHOA, thanhVien: [KHOA] },
	{ id: "phapche", ten: "Pháp chế", soBuoc: 1, truong: null, thanhVien: [] },
];

const pb = (id: string): PhongBanMau => {
	const found = PHONG_BAN_PHANG.find((p) => p.id === id);
	if (!found) throw new Error(`thieu phong ban mau ${id}`);
	return found;
};

export const CAY_HAI_CAP: readonly BoPhanMau[] = [
	{
		id: "kinhdoanh",
		ten: "Kinh doanh",
		truong: LAN,
		phongBan: [pb("kd1"), pb("kd2")],
	},
	{
		id: "vanhanh",
		ten: "Vận hành",
		truong: null,
		phongBan: [pb("cskh"), pb("kho")],
	},
	{ id: "taichinh", ten: "Tài chính", truong: KHOA, phongBan: [pb("ketoan")] },
];

export const CHUA_XEP: readonly PhongBanMau[] = [pb("phapche")];
