#!/usr/bin/env bun
/**
 * Hai chiều cho một nhóm ca `dhk-*` của test/okr-dau-trang-khu.dom.tsx.
 *
 *   bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs <nhom>
 *
 * 1. Đối chứng dương: chạy nhóm trên vật lành → phải thoát 0.
 * 2. Với từng đột biến của nhóm (bảng DOT_BIEN): thay ĐÚNG một đoạn trong một tệp
 *    vật tại chỗ, chạy lại nhóm → phải thoát ≠ 0 VÀ đầu ra chứa thông điệp ghim;
 *    hoàn nguyên tệp trong `finally` (kể cả khi bị ngắt), rồi kiểm băm tệp bằng bản gốc.
 * Đoạn cần thay không có trong tệp → mã 2 «KHONG DO DUOC» (đột biến chết = phép đo mù).
 * Mã thoát: 0 hai chiều đúng · 1 có chiều sai · 2 không đo được.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = join(GOC, "apps", "app");
const OKR = "apps/app/app/(app)/[slug]/okr";

const DOT_BIEN = {
	"dhk-tieu-de": [
		{
			ten: "tieu-de-theo-the",
			tep: `${OKR}/thanh-tab.tsx`,
			cu: "tieuDe={tieuDeKhu(locale)}",
			moi: 'tieuDe={"OKR theo đơn vị"}',
			ghim: "dhk-tieu-de: h1 «OKR theo đơn vị» khac nhan thanh ben «Mục tiêu» o /okr/theo-don-vi vi",
		},
	],
	"dhk-hanh-dong": [
		{
			ten: "nut-giua-than",
			tep: `${OKR}/theo-don-vi/theo-don-vi.tsx`,
			cu: '<div className="flex flex-wrap items-center gap-2" data-hang-nut>',
			moi: '<div className="flex flex-wrap items-center gap-2" data-hang-nut><button data-nut="them-muc-tieu" type="button" />',
			ghim: "dhk-hanh-dong: theo-don-vi con nut them-muc-tieu trong than",
		},
		{
			ten: "hoi-kara-ngoai-hang",
			tep: `${OKR}/theo-don-vi/theo-don-vi.tsx`,
			cu: '<div className="flex flex-wrap items-center gap-2" data-hang-nut>',
			moi: '<div className="flex flex-wrap items-center gap-2" data-hang-nut>{/* NutHoiKara gia */}<span data-nut-hoi-kara="" />',
			ghim: "dhk-hanh-dong: co NutHoiKara nhung khong nam trong page-shell-actions",
		},
		{
			ten: "thua-cho-hoi-kara",
			tep: `${OKR}/hanh-dong-khu.tsx`,
			cu: "			<NutThem\n",
			moi: '			<span data-nut-gia="" />\n			<NutThem\n',
			ghim: "dhk-hanh-dong: theo-don-vi lap-ke-hoach co 5 phan tu, mong 4",
		},
	],
	"dhk-don-dich": [
		{
			ten: "dich-goc",
			tep: `${OKR}/don-dich.ts`,
			cu: '	if (tab === "theo-don-vi") return { don: donUrl ?? GOC, nguon: "chon" };',
			moi: '	return { don: GOC, nguon: "goc" };',
			ghim: "dhk-don-dich: khong donOkr + truong bo phan B1: mong bp:B1, nhan goc",
		},
		{
			ten: "xem-truoc",
			tep: `${OKR}/don-dich.ts`,
			cu: "	const bp = headOf?.divisions[0];",
			moi: '	if (donUrl) return { don: donUrl, nguon: "url" };\n	const bp = headOf?.divisions[0];',
			ghim: "dhk-don-dich: donOkr=pb:P9 + truong phong ban P2: mong pb:P2, nhan pb:P9",
		},
	],
	"dhk-menu-soan": [
		{
			ten: "nhap-sai-don",
			tep: `${OKR}/hanh-dong-khu.tsx`,
			cu: "toi(q.dich.don, SEARCH_PARAM.okr.nhap)",
			moi: 'toi({ loai: "goc" }, SEARCH_PARAM.okr.nhap)',
			ghim: "dhk-menu-soan: hop nhap mo cho goc, mong pb:P2",
		},
	],
	"dhk-khoa-ly-do": [
		{
			ten: "an-nut",
			tep: `${OKR}/hanh-dong-khu.tsx`,
			cu: "	if (!q.duoc)\n		return (\n			<Button\n				aria-describedby={ID_KHONG_THEM}",
			moi: "	if (!q.duoc) return null;\n	if (!q.duoc)\n		return (\n			<Button\n				aria-describedby={ID_KHONG_THEM}",
			ghim: "dhk-khoa-ly-do: nut them-muc-tieu vang khi canCreate=false (chon don vi, dang-chay)",
		},
	],
	"dhk-giu-don": [
		{
			ten: "bo-don",
			tep: `${OKR}/thanh-tab.tsx`,
			cu: "	if (don) giu.set(SEARCH_PARAM.okr.don, khoaDon(don));",
			moi: "",
			ghim: "dhk-giu-don: lien ket toan-canh thieu donOkr=pb:P2",
		},
	],
	"dhk-suc-khoe": [
		{
			ten: "breadcrumb-cu",
			tep: `${OKR}/toan-canh/suc-khoe/suc-khoe.tsx`,
			cu: "	if (don) giu.set(SEARCH_PARAM.okr.don, khoaDon(don));",
			moi: "",
			ghim: "dhk-suc-khoe: lien ket Toan canh thieu donOkr",
		},
	],
	"dhk-dang-tai": [
		{
			ten: "an-khi-loi",
			tep: `${OKR}/hanh-dong-khu.tsx`,
			cu: "	if (!q.duoc)\n		return (\n			<Button\n				aria-describedby={ID_KHONG_THEM}",
			moi: "	if (!q.duoc) return null;\n	if (!q.duoc)\n		return (\n			<Button\n				aria-describedby={ID_KHONG_THEM}",
			ghim: "dhk-dang-tai: nut them-muc-tieu vang khi quyen loi",
		},
	],
};

const nhom = process.argv[2];
if (!nhom || !(nhom in DOT_BIEN)) {
	console.log(`KHONG DO DUOC: nhom «${nhom ?? ""}» khong co trong bang — ${Object.keys(DOT_BIEN).join(", ")}`);
	process.exit(2);
}

function chayNhom() {
	const r = spawnSync(
		"bun",
		["test", "--timeout", "60000", "--preload", "../../packages/ui/test/setup-dom.ts", "./test/okr-dau-trang-khu.dom.tsx", "-t", nhom],
		{ cwd: APP, encoding: "utf8", env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" }, maxBuffer: 64 * 1024 * 1024 },
	);
	const chu = `${r.stdout}${r.stderr}`;
	const soPass = Number(/(\d+) pass/.exec(chu)?.[1] ?? 0);
	return { ma: r.status, chu, soPass };
}

const bam = (s) => createHash("sha256").update(s).digest("hex");
const daSua = new Map();
function hoanNguyen() {
	for (const [tep, goc] of daSua) writeFileSync(tep, goc);
	daSua.clear();
}
for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"])
	process.on(tin, () => {
		hoanNguyen();
		process.exit(128 + ({ SIGINT: 2, SIGTERM: 15, SIGHUP: 1 })[tin]);
	});

const lanh = chayNhom();
if (lanh.ma !== 0 || lanh.soPass === 0) {
	console.log(lanh.chu.split("\n").slice(-40).join("\n"));
	console.log(`SAI ${nhom}: doi chung duong do tren vat lanh (ma ${lanh.ma}, ${lanh.soPass} pass)`);
	process.exit(1);
}
console.log(`DUNG ${nhom} doi chung: vat lanh xanh (${lanh.soPass} pass)`);

let sai = 0;
for (const db of DOT_BIEN[nhom]) {
	const tep = join(GOC, db.tep);
	const goc = readFileSync(tep, "utf8");
	const soLan = goc.split(db.cu).length - 1;
	if (soLan !== 1) {
		console.log(`KHONG DO DUOC: dot bien ${db.ten} — doan can thay xuat hien ${soLan} lan trong ${db.tep}`);
		process.exit(2);
	}
	daSua.set(tep, goc);
	try {
		writeFileSync(tep, goc.replace(db.cu, db.moi));
		const r = chayNhom();
		const coGhim = r.chu.includes(db.ghim);
		if (r.ma !== 0 && coGhim) console.log(`DUNG ${nhom} chieu do ${db.ten}: ma ${r.ma}, «${db.ghim}»`);
		else {
			sai += 1;
			console.log(r.chu.split("\n").filter((l) => l.includes("dhk-")).slice(0, 20).join("\n"));
			console.log(`SAI ${nhom} chieu do ${db.ten}: ma ${r.ma}, ${coGhim ? "co" : "THIEU"} thong diep «${db.ghim}»`);
		}
	} finally {
		hoanNguyen();
	}
	if (bam(readFileSync(tep, "utf8")) !== bam(goc)) {
		console.log(`KHONG DO DUOC: hoan nguyen ${db.tep} that bai`);
		process.exit(2);
	}
}
console.log(sai === 0 ? `KET LUAN ${nhom}: hai chieu dung (${DOT_BIEN[nhom].length} dot bien)` : `KET LUAN ${nhom}: ${sai} chieu do sai`);
process.exit(sai === 0 ? 0 : 1);
