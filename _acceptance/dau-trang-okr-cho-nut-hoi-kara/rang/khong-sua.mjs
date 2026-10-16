import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SLUG = "dau-trang-okr-cho-nut-hoi-kara";
const MA_DO = 1;
const MA_KHONG_DO = 2;
const TRAN_LENH_MS = 600_000;
const GIU = [
	"apps/app/test/okr-dau-trang-khu.dom.tsx",
	"apps/app/test/nut-hoi-kara-thay-khung.dom.tsx",
];
const KIEM = GIU.map(
	(tep) =>
		`cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./${tep.replace("apps/app/", "")}`,
);

function git(goc, args) {
	const r = spawnSync("git", args, { cwd: goc, encoding: "utf8" });
	if (r.status !== 0)
		throw new KhongDo(`git ${args.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout.trim();
}

function soCay(goc) {
	const commit = git(goc, [
		"log",
		"--first-parent",
		"--no-merges",
		"--format=%H",
		`--grep=${SLUG}`,
	])
		.split("\n")
		.filter(Boolean);
	if (commit.length === 0)
		throw new KhongDo(`khong thay commit nao mang ${SLUG} trong tieu de`);
	const cham = new Set();
	for (const c of commit) {
		for (const tep of git(goc, [
			"diff-tree",
			"--no-commit-id",
			"--name-only",
			"-r",
			c,
		]).split("\n")) {
			if (GIU.includes(tep)) cham.add(tep);
		}
	}
	return { soCommit: commit.length, cham: [...cham] };
}

function inKet({ soCommit, cham }) {
	if (cham.length === 0) {
		console.log(`khong-sua: ${soCommit} commit cua vong, 0 cham`);
		return true;
	}
	for (const tep of cham)
		console.log(`CHAM ${tep}`);
	return false;
}

function chieuDo() {
	const dich = dungBanSao("dto-khong-sua");
	try {
		writeFileSync(join(dich, GIU[1]), "\n", { flag: "a" });
		git(dich, ["add", GIU[1]]);
		git(dich, [
			"-c",
			"user.name=kiem-do-do",
			"-c",
			"user.email=kiem@do.do",
			"commit",
			"-q",
			"--no-verify",
			"-m",
			`test(${SLUG}): chieu do tam`,
		]);
		return inKet(soCay(dich)) ? 0 : MA_DO;
	} finally {
		goBanSao(dich);
	}
}

try {
	if (process.argv.includes("--kiem-do-do")) process.exit(chieuDo());
	if (!inKet(soCay(GOC))) process.exit(MA_DO);
	for (const lenh of KIEM) {
		const r = spawnSync("bash", ["-c", lenh], {
			cwd: GOC,
			encoding: "utf8",
			timeout: TRAN_LENH_MS,
		});
		process.stdout.write(`${r.stdout.slice(-400)}${r.stderr.slice(-1200)}`);
		if (r.status !== 0) {
			console.log(`khong-sua: lenh do (${r.status}): ${lenh}`);
			process.exit(MA_DO);
		}
	}
	console.log("khong-sua: dat");
} catch (e) {
	if (!(e instanceof KhongDo)) throw e;
	console.log(`KHONG DO DUOC: ${e.message}`);
	process.exit(MA_KHONG_DO);
}
