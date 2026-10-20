#!/usr/bin/env node
/**
 * AC-6 (hồ sơ khung-cho-don-vi-mot-hinh): trang nào đang dùng khung chờ hình `bang` vẫn dùng `bang`, và hình
 * `bang-hai-dong` chỉ ở trang Theo đơn vị.
 *
 *   node _acceptance/khung-cho-don-vi-mot-hinh/rang/trang-khac.mjs [--pha-thu]
 *
 * Đọc mọi .tsx dưới apps/app/app/(app) bằng bộ phân tích TypeScript, gom các phần tử JSX `KhungXuong` theo
 * chuỗi của thuộc tính `hinh` và thư mục chứa tệp. `bang-hai-dong` phải có ở okr/theo-don-vi và không ở đâu khác. Danh sách trang dùng `bang` đo trên origin/onehub b32a1495f trước vòng.
 * --pha-thu: chép cây apps/app/app sang thư mục tạm, đổi `hinh="bang"` của deals/page.tsx thành `bang-hai-dong`,
 * đếm lại trên bản sao → phải đỏ với «SAI AC-6: deals dung bang-hai-dong»; cây thật phải xanh.
 * Mã thoát: 0 đạt · 1 có dòng SAI · 2 không đo được.
 */
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = join(GOC, "apps", "app", "app");
const NHOM = "(app)";
const TRANG_BANG = [
	"[slug]/settings/api-keys",
	"[slug]/settings/sso",
	"[slug]/settings/members",
	"[slug]/tai-lieu",
	"[slug]/contacts",
	"[slug]/deals",
	"[slug]/campaigns",
	"[slug]/companies",
	"[slug]/onboarding",
];
const TRANG_HAI_DONG = "[slug]/okr/theo-don-vi";

function demHinh(goc) {
	const thuMuc = join(goc, NHOM);
	const ra = new Map();
	for (const ten of readdirSync(thuMuc, { recursive: true })) {
		if (!ten.endsWith(".tsx")) continue;
		const duong = join(thuMuc, ten);
		const nguon = ts.createSourceFile(duong, readFileSync(duong, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
		const trang = relative(thuMuc, dirname(duong)).split(sep).join("/");
		const di = (n) => {
			if ((ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) && n.tagName.getText(nguon) === "KhungXuong") {
				for (const thuocTinh of n.attributes.properties) {
					if (!ts.isJsxAttribute(thuocTinh) || thuocTinh.name.getText(nguon) !== "hinh") continue;
					const gt = thuocTinh.initializer;
					const hinh = gt && ts.isStringLiteral(gt) ? gt.text : "?";
					const tap = ra.get(hinh) ?? new Set();
					tap.add(trang);
					ra.set(hinh, tap);
				}
			}
			ts.forEachChild(n, di);
		};
		di(nguon);
	}
	return ra;
}

function cham(goc) {
	const dem = demHinh(goc);
	const bang = dem.get("bang") ?? new Set();
	const haiDong = dem.get("bang-hai-dong") ?? new Set();
	const sai = [];
	for (const trang of TRANG_BANG) if (!bang.has(trang)) sai.push(`SAI AC-6: ${trang.split("/").at(-1)} khong con dung bang`);
	for (const trang of haiDong) if (trang !== TRANG_HAI_DONG) sai.push(`SAI AC-6: ${trang.split("/").at(-1)} dung bang-hai-dong`);
	if (!haiDong.has(TRANG_HAI_DONG)) sai.push("SAI AC-6: theo-don-vi khong dung bang-hai-dong");
	const dong = `AC-6: ${bang.size} trang dung bang · bang-hai-dong ${haiDong.size === 0 ? "khong o dau" : `o ${[...haiDong].join(", ")}`}`;
	return { dong, sai, bang: bang.size };
}

function inKetQua(kq) {
	console.log(kq.dong);
	for (const s of kq.sai) console.log(s);
}

let that;
try {
	that = cham(APP);
} catch (e) {
	console.log(`KHONG DO DUOC: ${e instanceof Error ? e.message : String(e)}`);
	process.exit(2);
}
inKetQua(that);
if (that.bang === 0) {
	console.log("KHONG DO DUOC: khong thay trang nao dung KhungXuong");
	process.exit(2);
}

if (process.argv.includes("--pha-thu")) {
	const tam = mkdtempSync(join(tmpdir(), "kcd-trang-khac-"));
	try {
		cpSync(join(APP, NHOM), join(tam, NHOM), { recursive: true });
		const deals = join(tam, NHOM, "[slug]", "deals", "page.tsx");
		const cu = readFileSync(deals, "utf8");
		const moi = cu.replace('<KhungXuong hinh="bang" />', '<KhungXuong hinh="bang-hai-dong" />');
		if (moi === cu) {
			console.log("KHONG DO DUOC: pha-thu khong thay doan can thay trong deals/page.tsx");
			process.exit(2);
		}
		writeFileSync(deals, moi);
		const sao = cham(tam);
		console.log("-- ban sao (pha-thu):");
		inKetQua(sao);
		const doDung = sao.sai.includes("SAI AC-6: deals dung bang-hai-dong");
		const xanhDung = that.sai.length === 0;
		console.log(doDung && xanhDung ? "HAI CHIEU DUNG" : `HAI CHIEU SAI: that ${xanhDung ? "xanh" : "do"} · ban sao ${doDung ? "do dung thong diep" : "khong do dung thong diep"}`);
		process.exit(doDung && xanhDung ? 0 : 1);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

process.exit(that.sai.length === 0 ? 0 : 1);
