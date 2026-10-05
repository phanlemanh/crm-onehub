export const CAU_HINH = {
	tep: "apps/app/test/to-chuc-chi-tiet.dom.tsx",
	goiApp: "apps/app",
	preload: "../../packages/ui/test/setup-dom.ts",
	tz: "Asia/Ho_Chi_Minh",
	neo: "ee0cc227cf1926a5359e10fdce07ffdeec57c183",
	khoaUrl: "don",
	caDocUrl: [
		"chon-nut: bam tung loai nut thi khung, aria-current va dia chi trang dung nut do",
		"o-so-man: o thu nhat noi X/M va mo dung M - X nguoi chua co phong ban",
		"nhap-ba-buoc: buoc dan, xem truoc neu ten don vi moi, ket qua co nut Xem cay",
	],
	giaTriCho: {
		"chon-nut: bam tung loai nut thi khung, aria-current va dia chi trang dung nut do":
			"x.don",
		"o-so-man: o thu nhat noi X/M va mo dung M - X nguoi chua co phong ban":
			'"chua-co"',
		"nhap-ba-buoc: buoc dan, xem truoc neu ten don vi moi, ket qua co nut Xem cay":
			'"goc"',
	},
	giaTriCu: {
		"chon-nut: bam tung loai nut thi khung, aria-current va dia chi trang dung nut do":
			[
				'+   "bam goc: ?don=bp:bp-kd",',
				'+   "bam bp:bp-vh: ?don=goc",',
				'+   "bam pb:pb-kho: ?don=bp:bp-vh",',
				'+   "bam chua-co: ?don=pb:pb-kho",',
			],
		"o-so-man: o thu nhat noi X/M va mo dung M - X nguoi chua co phong ban": [
			'+   "don": null,',
		],
		"nhap-ba-buoc: buoc dan, xem truoc neu ten don vi moi, ket qua co nut Xem cay":
			['+   "don": "bp:bp-kd",'],
	},
	caMat:
		"chon-nut: dung tu ?loc=chua-truong thi cay chi con phong ban chua co truong",
	choCuBiBo: 'url.get("loc") === null',
	mocTre: "url = new URLSearchParams(e.searchParams);",
	treNhip: 3,
	lanLapLai: 20,
	raGoc: ".acceptance-runs/to-chuc-chi-tiet-cho-url",
	tranLuotMs: 10 * 60_000,
};
