import { spawnSync } from "node:child_process";
import { GOC_KHO, ma, moMayChu, than, thoat } from "./may-chu.mjs";

const loi = [];
const doi = (d, c) => {
	if (!d) loi.push(c);
};

const dung = spawnSync("bunx", ["turbo", "run", "build", "--filter=app", "--force"], {
	cwd: GOC_KHO,
	env: { ...process.env, PROTO_ROUTE: undefined },
	encoding: "utf8",
});

const raDung = `${dung.stdout ?? ""}${dung.stderr ?? ""}`;

if (/Another next build process is already running/i.test(raDung))
	thoat(2, 'da co mot lenh dung Next chay san — Next khoa theo THU MUC. Dung no roi chay lai: pkill -f "next (dev|build)"');

if (dung.status !== 0)
	thoat(1, `ban dung that bai (ma ${dung.status})\n${raDung.slice(-2000)}`);

doi(!/error|Error:/i.test(raDung), "buoc dung phat sinh loi");

const tat = await moMayChu({ co: undefined, san: "start" });
for (const d of ["/proto", "/proto/duong-proto"]) {
	const m = await ma(tat.goc, d);
	doi(m === 404, `ban dung + co TAT: ${d} tra ${m}, cho 404`);
}
const t = await than(tat.goc, "/proto");
for (const ro of ["Bản mẫu giao diện", "Đối tác", "data-proto-slug"])
	doi(!t.includes(ro), `ban dung + co TAT: noi dung proto RO ra HTML — thay "${ro}"`);
tat.dong();

const bat = await moMayChu({ co: "1", san: "start" });
doi((await ma(bat.goc, "/proto/duong-proto")) === 200, "ban dung + co BAT: /proto/duong-proto khong tra 200");
doi((await ma(bat.goc, "/proto/khong-ton-tai")) === 404, "ban dung + co BAT: slug la khong tra 404");
bat.dong();

if (loi.length === 0) {
	console.log("OK ban-dung: cap hai chieu tren CUNG mot cay dung");
	process.exit(0);
}
for (const c of loi) console.error(`  - ${c}`);
thoat(1, `ban-dung: ${loi.length} dieu khong dat`);
