const GIAY_MS = 1000;

export const PHA_THU = Object.freeze({
	goc: "7cf69d6a049cccfce3f0f16324a3d9112d834551",
	rang: "_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs",
	evalsCu: "_acceptance/o-soan-va-ly-do-loi/evals.yaml",
	dispatch: "apps/agent/agent/lib/custom-agent-dispatch.ts",
	congKhai: "apps/app/public",
	chayRieng: ".acceptance-runs/thuoc-o-soan-don-dep",
	bangChungThat: "_acceptance/thuoc-o-soan-don-dep/evidence",
	bangChungCu: "_acceptance/o-soan-va-ly-do-loi/evidence",
	nhanhChinh: "origin/onehub",
	nguoi: "dev@localhost",
	tieuDe: "o-soan do",
	dauMoc: ["canh-cay-", "o-soan-canh-"],
	cheDoThat: { E1: "con-tro", E2: "go-chu", E8: "chup" },
	lenhTienDe: "bun scripts/lan-do/tien-de.mjs",
	tienToNguoi: "NGUOI=${NGUOI:-dev@localhost} ",
	sanSang: "PHA-THU SAN SANG",
	han: {
		luotMs: 60 * GIAY_MS,
		sanSangMs: 45 * GIAY_MS,
		thieuNguoiMs: 30 * GIAY_MS,
		thatMs: 600 * GIAY_MS,
		choChromeMs: 1 * GIAY_MS,
	},
});
