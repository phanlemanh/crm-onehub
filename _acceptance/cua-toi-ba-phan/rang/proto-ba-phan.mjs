#!/usr/bin/env bun
/**
 * E14 (AC-12): bản mẫu /proto/cua-toi-ba-phan có đúng một state cho mỗi
 * dòng ST-ctbp-* của bảng trạng thái trong thiết kế (trừ hai dòng đo trên app thật),
 * dùng bốn thẻ của app (trừ state phương án câu hỏi ST-ctbp-hoi-*), và sổ bản mẫu xanh.
 *
 * Hai chiều trong cùng một lượt: (1) trên thiết kế thật → không thiếu, không thừa;
 * (2) trên BẢN SAO chữ thiết kế có thêm dòng ST-ctbp-gia → phải in
 * «thieu state: ST-ctbp-gia». Mã thoát: 0 hai chiều đúng · 1 sai · 2 không đo được.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "cua-toi-ba-phan";
const THIET_KE = join(
	GOC,
	"docs/superpowers/specs/2026-10-15-cua-toi-ba-phan-design.md",
);
const DO_TREN_APP = new Set(["ST-ctbp-dang-tai", "ST-ctbp-loi-phan"]);

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function idTuBang(chu) {
	const a = chu.indexOf("<!-- <<<UX-STATE-TABLE -->");
	const b = chu.indexOf("<!-- UX-STATE-TABLE>>> -->");
	if (a < 0 || b < a) khongDo("thiet ke khong co khoi UX-STATE-TABLE");
	return [...chu.slice(a, b).matchAll(/^\| (ST-ctbp-[a-z0-9-]+) \|/gm)].map(
		(m) => m[1],
	);
}

const { PROTO_CATALOG } = await import(
	join(GOC, "apps/app/app/proto/catalog.ts")
);
const { TAB } = await import(
	join(GOC, "apps/app/app/(app)/[slug]/okr/tab-okr.ts")
);
const { TAB_MAU } = await import(
	join(GOC, "apps/app/app/proto/_modules/cua-toi-ba-phan/du-lieu.ts")
);
const muc = PROTO_CATALOG.find((m) => m.slug === SLUG);
if (!muc) khongDo(`PROTO_CATALOG khong co muc ${SLUG}`);
const coTrongSo = new Set(
	muc.states.map((s) => s.id).filter((id) => !id.startsWith("ST-ctbp-hoi-")),
);

function soi(chuThietKe) {
	const can = idTuBang(chuThietKe).filter((id) => !DO_TREN_APP.has(id));
	if (can.length === 0) khongDo("bang trang thai khong co dong ST-ctbp-* nao");
	const loi = [];
	for (const id of can) if (!coTrongSo.has(id)) loi.push(`thieu state: ${id}`);
	for (const id of coTrongSo)
		if (!can.includes(id)) loi.push(`thua state: ${id}`);
	return { can, loi };
}

let sai = 0;
const that = soi(readFileSync(THIET_KE, "utf8"));
if (that.loi.length === 0)
	console.log(
		`DUNG AC-12: ${that.can.length}/${that.can.length} state cua bang co trong so ban mau, 0 thua`,
	);
else {
	sai += 1;
	for (const l of that.loi) console.log(`SAI AC-12: ${l}`);
}

const theApp = [...TAB].sort().join(",");
const theMau = TAB_MAU.map((t) => t.value).sort().join(",");
if (theApp === theMau)
	console.log(`DUNG AC-12: ban mau dung ${TAB.length} the cua app`);
else {
	sai += 1;
	console.log(`SAI AC-12: the ban mau [${theMau}] khac the app [${theApp}]`);
}

const goc = readFileSync(THIET_KE, "utf8");
const dau = "| ST-ctbp-can-cap-nhat |";
if (!goc.includes(dau))
	khongDo("khong tim thay dong ST-ctbp-can-cap-nhat de chen dong gia");
const dot = goc.replace(dau, `| ST-ctbp-gia | Gia | gia | gia |\n${dau}`);
const doRa = soi(dot);
if (doRa.loi.includes("thieu state: ST-ctbp-gia"))
	console.log(
		"DUNG AC-12 chieu do: ban sao thiet ke them ST-ctbp-gia -> 'thieu state: ST-ctbp-gia'",
	);
else {
	sai += 1;
	console.log(
		`SAI AC-12 chieu do: ban sao them ST-ctbp-gia ma bo do in [${doRa.loi.join("; ")}]`,
	);
}

const r = spawnSync("bun", ["test", "test/proto-catalog.spec.ts"], {
	cwd: join(GOC, "apps/app"),
	encoding: "utf8",
});
const pass = /(\d+) pass/.exec(`${r.stdout}${r.stderr}`)?.[1] ?? "0";
if (r.status === 0 && Number(pass) > 0)
	console.log(`DUNG AC-12: test/proto-catalog.spec.ts xanh (${pass} pass)`);
else {
	sai += 1;
	console.log(`SAI AC-12: test/proto-catalog.spec.ts ma ${r.status}`);
}
console.log(sai === 0 ? "KET LUAN: dat" : `KET LUAN: ${sai} cho sai`);
process.exit(sai === 0 ? 0 : 1);
