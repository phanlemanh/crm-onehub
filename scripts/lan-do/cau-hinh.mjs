const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

export const PHIEN_DO = {
	nguoi: "manh.phan@onemount.com",
	cong: { tu: 4100, den: 4899 },
	cho: {
		khoaMs: 60 * PHUT_MS,
		apiMs: 2 * PHUT_MS,
		appMs: 3 * PHUT_MS,
		donMs: 10 * GIAY_MS,
		hoiMs: 5 * GIAY_MS,
		nhipMs: 500,
	},
	khoApp: ".next-phien-do",
	ghi: ".acceptance-runs/phien-do",
};

export const VAN_TAY_MODEL = {
	loiDo: "ok",
	toiDaToken: 1,
	choMoiModelMs: 20 * GIAY_MS,
	khongKhoa: "khong-khoa",
	tepKhoaGoi: "bun.lock",
};
