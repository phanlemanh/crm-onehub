export const CAU_HINH = {
	spec: "packages/ui/test/lai-ra-man.spec.tsx",
	bangDo: "_acceptance/lai-ra-man-tran-gio/rang/bang-do-ci.json",
	neo: "c895e5bff88f9b1f6a13ffc5885c37fe0b6d7ec8",
	heSo: 4,
	soLuotToiThieu: 30,
	soCa: 3,
	tenCa: {
		lai: "lai tung component ra man, doc chu ban ve that su ve",
		mo: "mo tung nguyen ban cua bang gioi han vong truoc",
		chuoi: "chuoi da va den man bang tieng Viet, va so ca bang so dong da va",
	},
	tranEpMs: 300,
	lanDo: 3,
	tepDo: [
		"packages/ui/test/setup-dom.ts",
		"_acceptance/chan-lai-component-ra-man/rang/luot-chay.mjs",
		"_acceptance/chan-lai-component-ra-man/rang/moi-mac-dinh.mjs",
	],
	taoPhamHoSoKy: ["ve-that.json", "mo-nguyen-ban.json"],
	raGoc: ".acceptance-runs/lai-ra-man-tran-gio",
	tranLuotMs: 10 * 60_000,
};
