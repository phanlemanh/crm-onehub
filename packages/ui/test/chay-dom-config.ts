const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

export const CHAY_DOM = {
	tep: {
		thuMuc: "test",
		duoi: ".dom.tsx",
		tranMs: MINUTE_MS,
		maQuaGio: 124,
	},
	tongKet: {
		soTepChamNhat: 5,
	},
	hienThi: {
		msMoiGiay: SECOND_MS,
		soLe: 1,
	},
} as const;
