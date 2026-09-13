#!/usr/bin/env bun
/**
 * Quét hồ sơ bằng làn ghim lại — DỰNG LẠI KHO NHÁP TRƯỚC MỖI HỒ SƠ.
 *
 * Vì sao tồn tại: các eval dùng chung MỘT database và răng được phép ghi vào đó.
 * Vấp thật 13/09: răng của `tiep-thi-tuyen-doi-tac` để lại 15 hàng `campaign`
 * (seed.ts không hề tạo campaign), và bốn chuỗi trong đám đó —
 * "Bình Thạnh" · "Gò Vấp" · "Quận 2" · "Quận 7" — làm `nhan-ung-dung` đỏ ba eval
 * ở lượt quét SAU. Dựng lại kho rồi chạy lại: ba eval ấy xanh. Ba trong chín cái
 * «đỏ thật» là cặn của hồ sơ khác.
 *
 * Cặn không đi theo hồ sơ nào cả — nó đi theo THỨ TỰ CHẠY. Nên chỗ chữa không
 * phải từng răng, mà là ranh giới giữa hai hồ sơ.
 *
 *   bun scripts/lan-do/quet.mjs --slug <s> [--slug <s2> ...] [--ghi] [--tran-giay N]
 *   bun scripts/lan-do/quet.mjs --tat-ca [--ghi]
 *
 * Mặc định KHÔNG ghi (không truyền --write xuống làn). exit 0 = mọi hồ sơ xanh ·
 * 1 = có hồ sơ đỏ · 2 = nguồn/hạ tầng hỏng.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { batBuocKhoNhap, dungLaiKhoNhap } from "./kho-nhap.mjs";

const TOI = "quet";

function thoat(ma, cau) {
	console.error(`${TOI}: ${cau}`);
	process.exit(ma);
}

const argv = process.argv.slice(2);
const slugs = [];
let ghi = false;
let tranGiay = 900;
for (let i = 0; i < argv.length; i += 1) {
	if (argv[i] === "--slug") {
		slugs.push(argv[(i += 1)]);
	} else if (argv[i] === "--tat-ca") {
		for (const d of readdirSync("_acceptance", { withFileTypes: true }))
			if (
				d.isDirectory() &&
				existsSync(join("_acceptance", d.name, "evidence-report.md"))
			)
				slugs.push(d.name);
	} else if (argv[i] === "--ghi") {
		ghi = true;
	} else if (argv[i] === "--tran-giay") {
		tranGiay = Number(argv[(i += 1)]);
	} else {
		thoat(3, `cờ không nhận diện được: ${argv[i]}`);
	}
}
if (slugs.length === 0) thoat(3, "cần --slug <s> hoặc --tat-ca");

batBuocKhoNhap(TOI);

// Làn giải qua resolver của kit, KHÔNG ghim đường dẫn bản nào.
const goc = spawnSync(
	"node",
	[
		"scripts/resolve-plugin.mjs",
		"--plugin",
		"feature-loop",
		"--require",
		"scripts/repin-lane.mjs",
	],
	{ encoding: "utf8" },
);
if (goc.status !== 0)
	thoat(2, "không giải được feature-loop qua resolve-plugin.mjs");
const lan = join(goc.stdout.trim(), "scripts", "repin-lane.mjs");
if (!existsSync(lan)) thoat(2, `giải ra ${lan} nhưng tệp không có trên đĩa`);

const ket = [];
for (const s of slugs) {
	if (!dungLaiKhoNhap())
		thoat(2, `không dựng lại được kho nháp trước hồ sơ ${s}`);
	const t0 = Date.now();
	const ra = spawnSync(
		"node",
		[
			lan,
			"--root",
			".",
			"--allow-dirty",
			"--slug",
			s,
			...(ghi ? ["--write"] : []),
		],
		{ encoding: "utf8", timeout: tranGiay * 1000 },
	);
	const giay = Math.round((Date.now() - t0) / 1000);
	const ra_ = `${ra.stdout ?? ""}${ra.stderr ?? ""}`;
	const do_ = (ra_.match(/eval đỏ: ([^)]*)/)?.[1] ?? "")
		.replace(new RegExp(`${s}/`, "g"), "")
		.trim();
	const ma = ra.signal ? 124 : (ra.status ?? 2);
	ket.push({ s, ma, giay, do_ });
	console.log(`── ${s}  mã=${ma}  ${giay}s  ${do_ || "—"}`);
}

console.log("\nTỔNG KẾT (mỗi hồ sơ chạy trên kho nháp vừa dựng lại):");
for (const k of ket)
	console.log(
		`  ${k.ma === 0 ? "XANH" : "ĐỎ  "}  ${k.s.padEnd(36)} ${k.do_ || ""}`,
	);
process.exit(ket.some((k) => k.ma !== 0) ? 1 : 0);
