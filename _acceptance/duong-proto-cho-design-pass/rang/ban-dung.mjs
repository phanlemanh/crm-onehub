import { spawnSync } from "node:child_process";
import { GOC_APP, ma, moMayChu, SLUG_HO_SO, than, thoat } from "./may-chu.mjs";

const KHO = ".next-proto-do";

const loi = [];
const doi = (d, c) => {
	if (!d) loi.push(c);
};

const moiTruong = { ...process.env, PROTO_DIST_DIR: KHO };
delete moiTruong.PROTO_ROUTE;

const dung = spawnSync("bunx", ["next", "build"], {
	cwd: GOC_APP,
	env: moiTruong,
	encoding: "utf8",
});

const raDung = `${dung.stdout ?? ""}${dung.stderr ?? ""}`;

if (/Another next build process is already running/i.test(raDung))
	thoat(2, `da co mot lenh dung Next chay san tren kho ${KHO} — chan ha tang, khong phai san pham fail`);

if (dung.status !== 0)
	thoat(1, `ban dung that bai (ma ${dung.status})\n${raDung.slice(-2000)}`);

doi(!/\berror\b/i.test(raDung), "buoc dung phat sinh loi");

const RO = [
	{ duong: "/proto", dau: "Bản mẫu giao diện" },
	{ duong: "/proto", dau: "data-proto-slug" },
	{ duong: `/proto/${SLUG_HO_SO}`, dau: "Đối tác" },
	{ duong: `/proto/${SLUG_HO_SO}`, dau: "data-proto-body" },
];

const tat = await moMayChu({ co: undefined, san: "start", kho: KHO });
for (const d of ["/proto", `/proto/${SLUG_HO_SO}`]) {
	const m = await ma(tat.goc, d);
	doi(m === 404, `ban dung + co TAT: ${d} tra ${m}, cho 404`);
}
for (const ro of RO) {
	const than_ = await than(tat.goc, ro.duong);
	doi(
		!than_.includes(ro.dau),
		`ban dung + co TAT: noi dung proto RO ra HTML tai ${ro.duong} — thay "${ro.dau}"`,
	);
}
tat.dong();

const bat = await moMayChu({ co: "1", san: "start", kho: KHO });
doi((await ma(bat.goc, `/proto/${SLUG_HO_SO}`)) === 200, "ban dung + co BAT: trang proto khong tra 200");
doi((await ma(bat.goc, "/proto/khong-ton-tai")) === 404, "ban dung + co BAT: slug la khong tra 404");

for (const ro of RO) {
	const than_ = await than(bat.goc, ro.duong);
	doi(
		than_.includes(ro.dau),
		`DOI CHUNG DUONG hong: co BAT ma van khong thay "${ro.dau}" tai ${ro.duong} — khang dinh chong-ro tuong ung dang dung mot cach vo nghia`,
	);
}
bat.dong();

if (loi.length === 0) {
	console.log(`OK ban-dung: cap hai chieu tren CUNG mot cay dung (${KHO})`);
	process.exit(0);
}
for (const c of loi) console.error(`  - ${c}`);
thoat(1, `ban-dung: ${loi.length} dieu khong dat`);
