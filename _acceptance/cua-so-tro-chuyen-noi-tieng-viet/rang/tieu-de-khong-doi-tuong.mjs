import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHAN = join(GOC, "_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs");
const GHIM = "chan tieu de khong co doi tuong o lat nay";
const LAT_NAY = join(HERE, "lat-cua-so.json");
const LAT_CO_DOI_TUONG = join(GOC, "_acceptance/agent-builder-noi-tieng-viet/rang/lat-agent-builder.json");

function chay(khai) {
	const r = spawnSync("node", [CHAN, "--lat", khai, "--chan", "tieu-de"], {
		cwd: GOC,
		encoding: "utf8",
		env: process.env,
	});
	return { ma: r.status, chu: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const rong = chay(LAT_NAY);
console.log(`luot A — lat nay (khong so huu page.tsx nao): ma thoat ${rong.ma}`);
if (rong.ma !== 2) {
	console.log(
		`DO: chan tieu de tra ma ${rong.ma} tren mot tap RONG. Tap quan sat rong ma van dat la dung lop loi kho nay da tra gia bon vong.`,
	);
	process.exit(1);
}
if (!rong.chu.includes(GHIM)) {
	console.log(
		`DO: chan tieu de thoat ma 2 nhung KHONG in thong diep ghim ${JSON.stringify(GHIM)} — ma 2 mot minh khong phan biet duoc "khong co doi tuong" voi "chan chet vi ly do khac".`,
	);
	process.exit(1);
}
console.log(`   thong diep ghim co mat: ${JSON.stringify(GHIM)}`);

const co = chay(LAT_CO_DOI_TUONG);
console.log(`luot B — doi chung duong tren ho so dot mot: ma thoat ${co.ma}`);
if (co.ma !== 0) {
	console.log(
		"KHONG DO DUOC: doi chung duong khong chay duoc — khong the ket luan luot A dung, vi mot chan chet vi ly do khac cung cho ma 2.",
	);
	console.log(co.chu.split("\n").slice(-3).join("\n"));
	process.exit(2);
}
const dem = co.chu.match(/ca (\d+) o nhan/);
if (dem === null || Number(dem[1]) === 0) {
	console.log("KHONG DO DUOC: doi chung duong khong in ra so o nhan lon hon 0.");
	process.exit(2);
}
console.log(`   doi chung duong dem duoc ${dem[1]} o tieu de that`);
console.log("XANH: chan tieu de tu khai KHONG CO DOI TUONG o lat nay, va van song — da chung bang mot lat co doi tuong that.");
process.exit(0);
