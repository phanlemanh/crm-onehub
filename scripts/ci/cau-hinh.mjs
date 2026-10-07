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
	gateShape: ".githooks/gate-shape.json",
	checker: "test",
	msMoiGiay: 1000,
	maKhongChay: 1,
	maSaiNhom: 2,
	maTinHieuGoc: 128,
	bienRiengMoiLuot: ["TEST_RUN_ID"],
};
