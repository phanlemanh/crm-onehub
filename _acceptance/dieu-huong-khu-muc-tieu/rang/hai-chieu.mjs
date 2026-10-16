#!/usr/bin/env bun
/**
 * Hai chiều cho một nhóm ca `dhk-*` của test/okr-dau-trang-khu.dom.tsx.
 *
 *   bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs <nhom>
 *
 * 1. Đối chứng dương: chạy nhóm trên vật lành (cây thật) → phải thoát 0.
 * 2. Với từng đột biến của nhóm (bảng DOT_BIEN): thay ĐÚNG một đoạn trong một tệp
 *    vật của MỘT WORKTREE TẠM (HEAD + thay đổi chưa commit của cây thật, node_modules
 *    trỏ về cây thật), chạy nhóm ở đó → phải thoát ≠ 0 VÀ đầu ra chứa thông điệp ghim.
 *    Cây thật không bao giờ bị ghi: lượt chấm chạy các lệnh song song, nên một đột
 *    biến tại chỗ lọt vào lượt vật-lành của nhóm khác (S4 vòng 1, 15/10). Băm mọi tệp
 *    bị đột biến trên cây thật trước và sau phải bằng nhau.
 * Đoạn cần thay không có trong tệp → mã 2 «KHONG DO DUOC» (đột biến chết = phép đo mù).
 * Mã thoát: 0 hai chiều đúng · 1 có chiều sai · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
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
			moi: '<div className="flex flex-wrap items-center gap-2" data-hang-nut><span data-nut="hoi-kara" />',
			ghim: "dhk-hanh-dong: co NutHoiKara nhung khong nam trong page-shell-actions",
		},
		{
			ten: "thua-cho-hoi-kara",
			tep: `${OKR}/hanh-dong-khu.tsx`,
			cu: "	const hoiKara = <NutHoiKara />;\n",
			moi: '	const hoiKara = <span data-nut-gia="" />;\n',
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
		{
			ten: "ky-hoi-y",
			tep: `${OKR}/hanh-dong-khu.tsx`,
			cu: "cycleId && cycleId !== kyChay ? cycleId : thamSo[SEARCH_PARAM.okr.ky];",
			moi: "thamSo[SEARCH_PARAM.okr.ky];",
			ghim: "dhk-don-dich: hoi-y gui sang Theo don vi ky «q4», quyen hoi ky «n27», mong kyOkr=n27",
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
	console.log(
		`KHONG DO DUOC: nhom «${nhom ?? ""}» khong co trong bang — ${Object.keys(DOT_BIEN).join(", ")}`,
	);
	process.exit(2);
}

function chayNhom(app) {
	const r = spawnSync(
		"bun",
		[
			"test",
			"--timeout",
			"60000",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			"./test/okr-dau-trang-khu.dom.tsx",
			"-t",
			nhom,
		],
		{
			cwd: app,
			encoding: "utf8",
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
			maxBuffer: 64 * 1024 * 1024,
		},
	);
	const chu = `${r.stdout}${r.stderr}`;
	const soPass = Number(/(\d+) pass/.exec(chu)?.[1] ?? 0);
	return { ma: r.status, chu, soPass };
}

const bam = (s) => createHash("sha256").update(s).digest("hex");
const git = (cwd, ...a) =>
	execFileSync("git", a, {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});

const tepDot = [...new Set(DOT_BIEN[nhom].map((d) => d.tep))];
const bamTruoc = new Map(
	tepDot.map((t) => [t, bam(readFileSync(join(GOC, t), "utf8"))]),
);

const lanh = chayNhom(APP);
if (lanh.ma !== 0 || lanh.soPass === 0) {
	console.log(lanh.chu.split("\n").slice(-40).join("\n"));
	console.log(
		`SAI ${nhom}: doi chung duong do tren vat lanh (ma ${lanh.ma}, ${lanh.soPass} pass)`,
	);
	process.exit(1);
}
console.log(`DUNG ${nhom} doi chung: vat lanh xanh (${lanh.soPass} pass)`);

const tam = mkdtempSync(join(tmpdir(), "dhk-hai-chieu-"));
const sao = join(tam, "crm");
let sai = 0;
let khongDo = null;
function don() {
	try {
		git(GOC, "worktree", "remove", "--force", sao);
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		git(GOC, "worktree", "prune");
	} catch {}
}
for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"])
	process.on(tin, () => {
		don();
		process.exit(128 + { SIGINT: 2, SIGTERM: 15, SIGHUP: 1 }[tin]);
	});
try {
	git(GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD");
	const va = git(GOC, "diff", "HEAD", "--binary");
	if (va.trim()) {
		const tepVa = join(tam, "chua-commit.patch");
		writeFileSync(tepVa, va);
		git(sao, "apply", "--whitespace=nowarn", tepVa);
	}
	for (const nm of git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter(
			(d) =>
				/(^|\/)node_modules\/$/.test(d) &&
				!d.slice(0, -1).includes("node_modules/"),
		)) {
		const dich = join(sao, nm.slice(0, -1));
		if (!existsSync(dich)) symlinkSync(join(GOC, nm.slice(0, -1)), dich);
	}
	if (!existsSync(join(sao, "apps/app/node_modules")))
		throw new Error("worktree tam thieu apps/app/node_modules");
	for (const db of DOT_BIEN[nhom]) {
		const tep = join(sao, db.tep);
		const goc = readFileSync(tep, "utf8");
		const soLan = goc.split(db.cu).length - 1;
		if (soLan !== 1) {
			khongDo = `dot bien ${db.ten} — doan can thay xuat hien ${soLan} lan trong ${db.tep}`;
			break;
		}
		writeFileSync(tep, goc.replace(db.cu, db.moi));
		const r = chayNhom(join(sao, "apps", "app"));
		writeFileSync(tep, goc);
		const coGhim = r.chu.includes(db.ghim);
		if (r.ma !== 0 && coGhim)
			console.log(`DUNG ${nhom} chieu do ${db.ten}: ma ${r.ma}, «${db.ghim}»`);
		else {
			sai += 1;
			console.log(
				r.chu
					.split("\n")
					.filter((l) => l.includes("dhk-"))
					.slice(0, 20)
					.join("\n"),
			);
			console.log(
				`SAI ${nhom} chieu do ${db.ten}: ma ${r.ma}, ${coGhim ? "co" : "THIEU"} thong diep «${db.ghim}»`,
			);
		}
	}
} catch (e) {
	khongDo = `worktree tam: ${String(e).slice(0, 300)}`;
} finally {
	don();
}
for (const t of tepDot)
	if (bam(readFileSync(join(GOC, t), "utf8")) !== bamTruoc.get(t))
		khongDo = `cay that bi ghi: ${t} doi bam trong luot — phep do khong duoc ghi vao cay`;
if (khongDo) {
	console.log(`KHONG DO DUOC: ${khongDo}`);
	process.exit(2);
}
console.log(
	sai === 0
		? `KET LUAN ${nhom}: hai chieu dung (${DOT_BIEN[nhom].length} dot bien, worktree tam)`
		: `KET LUAN ${nhom}: ${sai} chieu do sai`,
);
process.exit(sai === 0 ? 0 : 1);
