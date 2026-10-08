const MS_MOI_GIAY = 1000;

export const NHOM_TEST = [
	{ ten: "api", goi: ["api"] },
	{ ten: "app-ui", goi: ["app", "@crm/ui"] },
	{ ten: "agent-db", goi: ["agent", "@crm/auth", "@crm/db"] },
	{
		ten: "okr",
		goi: [
			"agent-okr",
			"@crm/env",
			"@crm/ai-okr",
			"@crm/telemetry",
			"@crm/validation",
		],
	},
];

export const CHAY_TEST = {
	tranSongSong: 4,
	testRun: "packages/db/scripts/test-run.ts",
	turbo: "node_modules/.bin/turbo",
	coChiNhom: "--only",
	gateShape: ".githooks/gate-shape.json",
	checker: "test",
	msMoiGiay: MS_MOI_GIAY,
	maKhongChay: 1,
	maSaiNhom: 2,
	maDungTruoc: 3,
	maTinHieuGoc: 128,
	bienRiengMoiLuot: ["TEST_RUN_ID"],
	tranMoiCaMs: 15 * MS_MOI_GIAY,
	tranMoiCa: {
		khoaScript: /^test(:|$)/,
		boQua: /--watch/,
		lenhChay: /\bbun test\b|chay-tung-tep-dom/,
	},
};
