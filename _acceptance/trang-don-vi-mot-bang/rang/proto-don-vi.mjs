#!/usr/bin/env bun
/**
 * E13 (AC-11): bản mẫu /proto/trang-don-vi-mot-bang có đúng một state cho mỗi
 * dòng ST-dvb-* của bảng trạng thái trong thiết kế, mỗi state dựng ra một cây
 * DOM khác nhau (bằng chính hàm của sổ bản mẫu — nhóm `dvb-proto` của
 * apps/app/test/proto-don-vi.dom.tsx), và sổ bản mẫu xanh.
 *
 * Khuôn: _acceptance/dieu-huong-khu-muc-tieu/rang/proto-khu.mjs. Danh sách id rút
 * LÚC CHẠY từ khối UX-STATE-TABLE; đường dẫn suy từ vị trí script. Chiều đỏ
 * (DVB_PHA=thieu-state) do rang/hai-chieu.mjs dựng trên bản sao (Task 9).
 * Mã thoát: 0 đúng · 1 sai · 2 không đo được.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "trang-don-vi-mot-bang";
const THIET_KE = join(
	GOC,
	"docs/superpowers/specs/2026-10-15-trang-don-vi-mot-bang-design.md",
);

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function idTuBang(chu) {
	const a = chu.indexOf("<!-- <<<UX-STATE-TABLE -->");
	const b = chu.indexOf("<!-- UX-STATE-TABLE>>> -->");
	if (a < 0 || b < a) khongDo("thiet ke khong co khoi UX-STATE-TABLE");
	return [...chu.slice(a, b).matchAll(/^\| (ST-dvb-[a-z0-9-]+) \|/gm)].map(
		(m) => m[1],
	);
}

const { PROTO_CATALOG } = await import(
	join(GOC, "apps/app/app/proto/catalog.ts")
);
const muc = PROTO_CATALOG.find((m) => m.slug === SLUG);
if (!muc) khongDo(`PROTO_CATALOG khong co muc ${SLUG}`);
const trongSo = muc.states.map((s) => s.id);
const soGhep = readFileSync(
	join(GOC, "apps/app/app/proto/registry.ts"),
	"utf8",
);
if (!soGhep.includes(`"${SLUG}": TrangDonViMotBangMau`))
	khongDo(`registry.ts khong ghep ${SLUG} voi TrangDonViMotBangMau`);
const bang = idTuBang(readFileSync(THIET_KE, "utf8"));
if (bang.length === 0) khongDo("bang trang thai khong co dong ST-dvb-* nao");

let sai = 0;
for (const id of bang)
	if (!trongSo.includes(id)) {
		sai += 1;
		console.log(`SAI AC-11: thieu ${id} trong PROTO_CATALOG`);
	}
for (const id of trongSo)
	if (!bang.includes(id)) {
		sai += 1;
		console.log(`SAI AC-11: thua ${id} trong PROTO_CATALOG`);
	}
const khop = bang.filter((id) => trongSo.includes(id)).length;

const dom = spawnSync(
	"bun",
	[
		"test",
		"--timeout",
		"60000",
		"--preload",
		"../../packages/ui/test/setup-dom.ts",
		"./test/proto-don-vi.dom.tsx",
		"-t",
		"dvb-proto",
	],
	{
		cwd: join(GOC, "apps/app"),
		encoding: "utf8",
		env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
		maxBuffer: 64 * 1024 * 1024,
	},
);
const dongDom = /PROTO-DOM: (\d+)\/(\d+) DOM khac nhau[^\n]*/.exec(
	`${dom.stdout}${dom.stderr}`,
);
if (!dongDom)
	khongDo(`nhom dvb-proto khong in dong PROTO-DOM (ma ${dom.status})`);
const soKhac = Number(dongDom[1]);
console.log(dongDom[0]);
if (dom.status !== 0 || soKhac !== trongSo.length) {
	sai += 1;
	console.log(
		`SAI AC-11: ${soKhac}/${trongSo.length} state dung ra DOM khac nhau (ma ${dom.status})`,
	);
}

const so = spawnSync("bun", ["test", "test/proto-catalog.spec.ts"], {
	cwd: join(GOC, "apps/app"),
	encoding: "utf8",
});
const pass = /(\d+) pass/.exec(`${so.stdout}${so.stderr}`)?.[1] ?? "0";
if (so.status === 0 && Number(pass) > 0)
	console.log(`proto-catalog.spec.ts xanh (${pass} pass)`);
else {
	sai += 1;
	console.log(`SAI AC-11: test/proto-catalog.spec.ts ma ${so.status}`);
}

console.log(
	`PROTO: ${khop}/${bang.length} state khop bang, ${soKhac} DOM khac nhau`,
);
console.log(sai === 0 ? "KET LUAN: dat" : `KET LUAN: ${sai} cho sai`);
process.exit(sai === 0 ? 0 : 1);
