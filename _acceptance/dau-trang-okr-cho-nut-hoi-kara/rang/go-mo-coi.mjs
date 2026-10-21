import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const MA_DO = 1;
const MA_KHONG_DO = 2;
const KHUNG = "apps/app/app/(app)/[slug]/okr";
const TEP_CU = [
	`${KHUNG}/dau-trang-okr-cho.tsx`,
	"apps/app/test/dau-trang-okr-cho.dom.tsx",
];
const DUOC_DOI = [`${KHUNG}/dau-trang-okr.tsx`, `${KHUNG}/hanh-dong-khu.tsx`];
const NHAP = /["'](?:\.\/|[^"']*okr\/)dau-trang-okr-cho["']/;
const KHOA_DTO = /^\s+(dto_[a-z_]+):/gm;
const NEN = "origin/onehub";
const SLUG = "dau-trang-okr-cho-nut-hoi-kara";

function git(goc, args) {
	const r = spawnSync("git", args, { cwd: goc, encoding: "utf8" });
	if (r.status !== 0)
		throw new KhongDo(`git ${args.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout.trim();
}

function mocGop(goc) {
	const r = spawnSync(
		"git",
		[
			"log",
			"--first-parent",
			"--merges",
			"--format=%H",
			NEN,
			"--",
			`_acceptance/${SLUG}/evidence-report.md`,
		],
		{ cwd: goc, encoding: "utf8" },
	);
	const m =
		r.status === 0
			? r.stdout.trim().split("\n").filter(Boolean).at(-1)
			: undefined;
	if (!m) return null;
	const laTo = spawnSync("git", ["merge-base", "--is-ancestor", m, "HEAD"], {
		cwd: goc,
	});
	return laTo.status === 0 ? m : null;
}

function dong(chu) {
	return chu.split("\n").filter(Boolean);
}

function soat(goc) {
	const tepTheoDoi = new Set(dong(git(goc, ["ls-files", "--", "apps/app"])));
	const conTep = TEP_CU.filter((t) => tepTheoDoi.has(t));
	const conNhap = [...tepTheoDoi]
		.filter((t) => /\.(tsx?|mjs|js)$/.test(t) && !TEP_CU.includes(t))
		.filter((t) => NHAP.test(readFileSync(join(goc, t), "utf8")));
	const cauHinh = readFileSync(join(goc, "_acceptance/config.yaml"), "utf8");
	const conKhoa = [...cauHinh.matchAll(KHOA_DTO)].map((m) => m[1]);
	const m = mocGop(goc);
	const doi = m
		? [
				...new Set([
					...dong(
						git(goc, ["diff", "--name-only", `${m}^1`, m, "--", "apps/app"]),
					),
					...dong(
						git(goc, [
							"log",
							"--no-merges",
							"--format=",
							"--name-only",
							`--grep=${SLUG}`,
							`${m}..HEAD`,
							"--",
							"apps/app",
						]),
					),
				]),
			]
		: dong(
				git(goc, [
					"diff",
					"--name-only",
					`${git(goc, ["merge-base", "HEAD", NEN])}..HEAD`,
					"--",
					"apps/app",
				]),
			);
	const doiNgoai = doi.filter((t) => !DUOC_DOI.includes(t));
	return { conTep, conNhap, conKhoa, doi, doiNgoai };
}

function inKet(kq) {
	for (const t of kq.conTep) console.log(`CON_TEP ${t}`);
	for (const t of kq.conNhap) console.log(`CON_NHAP ${t}`);
	for (const k of kq.conKhoa) console.log(`CON_KHOA ${k}`);
	for (const t of kq.doiNgoai) console.log(`DOI_NGOAI ${t}`);
	const sach =
		kq.conTep.length +
			kq.conNhap.length +
			kq.conKhoa.length +
			kq.doiNgoai.length ===
		0;
	if (sach)
		console.log(
			`mo-coi: 0 tep cu · 0 nhap · 0 khoa dto · ma doi ${kq.doi.length} tep`,
		);
	return sach;
}

function commitTam(dich, tep, thongDiep) {
	git(dich, ["add", "--", tep]);
	git(dich, [
		"-c",
		"user.name=kiem-do-do",
		"-c",
		"user.email=kiem@do.do",
		"commit",
		"-q",
		"--no-verify",
		"-m",
		thongDiep,
	]);
}

const CA_DO = [
	{
		ten: "tao lai tep cu",
		nhan: "CON_TEP",
		lam: (dich) => writeFileSync(join(dich, TEP_CU[0]), ""),
		commit: TEP_CU[0],
	},
	{
		ten: "them dong nhap",
		nhan: "CON_NHAP",
		lam: (dich) =>
			thayMotLan(
				dich,
				`${KHUNG}/dau-trang-okr.tsx`,
				'import { donDich } from "./don-dich";\n',
				'import { donDich } from "./don-dich";\nimport { DauTrangOkrCho } from "./dau-trang-okr-cho";\n',
			),
		commit: `${KHUNG}/dau-trang-okr.tsx`,
	},
	{
		ten: "sua tep khac",
		nhan: "DOI_NGOAI",
		lam: (dich) =>
			writeFileSync(join(dich, `${KHUNG}/luoi-dau-trang.tsx`), "\n", {
				flag: "a",
			}),
		commit: `${KHUNG}/luoi-dau-trang.tsx`,
	},
];

function tuKiem() {
	let truot = 0;
	for (const ca of CA_DO) {
		const dich = dungBanSao(`nm5-mo-coi-${CA_DO.indexOf(ca)}`);
		try {
			ca.lam(dich);
			commitTam(dich, ca.commit, `test(${SLUG}): chieu do ${ca.ten}`);
			const kq = soat(dich);
			const bat = inKet(kq) === false;
			const dungNhan =
				[kq.conTep, kq.conNhap, kq.conKhoa, kq.doiNgoai][
					["CON_TEP", "CON_NHAP", "CON_KHOA", "DOI_NGOAI"].indexOf(ca.nhan)
				].length > 0;
			console.log(`tu-kiem ${ca.ten}: ${bat && dungNhan ? "bat" : "TRUOT"}`);
			if (!(bat && dungNhan)) truot += 1;
		} finally {
			goBanSao(dich);
		}
	}
	return truot === 0 ? 0 : MA_DO;
}

try {
	if (process.argv.includes("--tu-kiem")) process.exit(tuKiem());
	process.exit(inKet(soat(GOC)) ? 0 : MA_DO);
} catch (e) {
	if (!(e instanceof KhongDo)) throw e;
	console.log(`KHONG DO DUOC: ${e.message}`);
	process.exit(MA_KHONG_DO);
}
