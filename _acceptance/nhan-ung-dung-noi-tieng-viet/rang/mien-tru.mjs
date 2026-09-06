import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(RANG, "../../..");

function docJson(duong, vi) {
	if (!existsSync(duong)) {
		console.log(`KHONG DO DUOC: thieu ${vi} tai ${duong}`);
		process.exit(2);
	}
	return JSON.parse(readFileSync(duong, "utf8"));
}

const danhSach = docJson(join(RANG, "danh-sach-chan.json"), "ban khai chan do");

const KHO = readdirSync(`${GOC}/apps/app/lib/messages`)
	.filter((t) => t.endsWith(".ts"))
	.map((t) => t.replace(/\.ts$/, ""))
	.sort();

if (KHO.length === 0) {
	console.log(
		"KHONG DO DUOC: khong thay kho chuoi nao trong apps/app/lib/messages — tap rong khong bao gio la dat",
	);
	process.exit(2);
}

function duongKhoa() {
	const kichBan = `
const ra = {};
${KHO.map((k, i) => `import * as ns${i} from "${GOC}/apps/app/lib/messages/${k}";`).join("\n")}
const kho = ${JSON.stringify(KHO)};
const lay = [${KHO.map((_, i) => `Object.values(ns${i}).find((v) => v instanceof Function)`).join(", ")}];
function phang(o, tien = "") {
  return Object.entries(o).flatMap(([k, v]) =>
    v instanceof Function || !(v instanceof Object)
      ? [tien + k]
      : phang(v, tien + k + "."),
  );
}
for (let i = 0; i < kho.length; i += 1) ra[kho[i]] = phang(lay[i]("vi"));
console.log(JSON.stringify(ra));
`;
	let raw;
	try {
		raw = execFileSync("bun", ["-e", kichBan], { encoding: "utf8", cwd: GOC });
	} catch (loi) {
		console.log(
			`KHONG DO DUOC: khong nap duoc kho chuoi de doi chieu — ${String(loi.stderr ?? loi.message).slice(0, 300)}`,
		);
		process.exit(2);
	}
	const map = JSON.parse(raw.trim().split("\n").pop());
	const tatCa = [];
	for (const k of KHO) for (const d of map[k]) tatCa.push({ kho: k, duong: d });
	return tatCa;
}

const khoa = duongKhoa();
if (khoa.length === 0) {
	console.log("KHONG DO DUOC: kho chuoi khong tra ve khoa nao — tap so rong");
	process.exit(2);
}

const haiDoan = (d) => d.split(".").slice(-2).join(".");

const banKhai = [];

banKhai.push({
	ten: "danh-sach-chan.json",
	dong: danhSach.mienTru.map((m) => m.ten),
	song: (ten) => existsSync(join(RANG, ten)) || existsSync(join(GOC, ten)),
});

const guard = join(GOC, "apps/app/test/messages-guard.spec.ts");
const khoiKhongDau = readFileSync(guard, "utf8").match(
	/const KHONG_DAU = new Set\(\[([\s\S]*?)\]\);/,
);
if (!khoiKhongDau) {
	console.log("KHONG DO DUOC: khong tim thay khoi KHONG_DAU trong messages-guard.spec.ts");
	process.exit(2);
}
banKhai.push({
	ten: "messages-guard.spec.ts:KHONG_DAU",
	dong: [...khoiKhongDau[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]),
	song: (muc) => khoa.some((k) => k.duong === muc || haiDoan(k.duong) === muc),
});

const sot = join(RANG, "dot-bien-sot.txt");
banKhai.push({
	ten: "dot-bien-sot.txt",
	dong: readFileSync(sot, "utf8")
		.split("\n")
		.map((d) => d.replace(/\s+#.*$/, "").trim())
		.filter((d) => d !== "" && !d.startsWith("#")),
	song: (muc) => {
		const doan = muc.split(".");
		const kho = doan[0];
		const duong = doan.slice(1).join(".");
		return khoa.some((k) => k.kho === kho && k.duong === duong);
	},
});

if (process.env.DONG_GIA) {
	banKhai.push({
		ten: "dong-gia-de-thu-banh-coc",
		dong: [process.env.DONG_GIA],
		song: () => false,
	});
}

let chet = 0;
let tong = 0;
for (const bk of banKhai) {
	const chetCuaNo = bk.dong.filter((d) => !bk.song(d));
	tong += bk.dong.length;
	for (const d of chetCuaNo) console.log(`   DONG MIEN TRU CHET: ${bk.ten}:${d}`);
	console.log(
		`   ${bk.ten.padEnd(38)} ${String(bk.dong.length).padStart(4)} dong, chet ${chetCuaNo.length}`,
	);
	chet += chetCuaNo.length;
}

if (tong === 0) {
	console.log("KHONG DO DUOC: khong doc duoc dong mien tru nao — tap so rong");
	process.exit(2);
}

console.log(`-- doi chieu tren ${khoa.length} duong khoa that`);
console.log(`ket qua: dong mien tru chet=${chet}/${tong}`);
process.exit(chet > 0 ? 1 : 0);
