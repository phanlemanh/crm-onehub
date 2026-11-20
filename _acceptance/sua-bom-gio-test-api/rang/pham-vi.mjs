#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const HO_SO = resolve(HERE, "..");
const SLUG = "sua-bom-gio-test-api";
const NEN = "74a29a68d28df9a8a08daf9a5e94b8dab364dd96";
const NHANH_CHINH = "origin/onehub";
const TEP_KIEM = [
	"apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts",
	"apps/api/test/gop-y-dung-cho.spec.ts",
	"apps/api/test/tro-ly-okr-san.ts",
	"apps/api/test/hop-tuan-mo-dung-bo.spec.ts",
	"apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts",
	"apps/api/test/cua-vao-va.spec.ts",
	"apps/api/test/okr-cay-ly-do.spec.ts",
	"apps/api/test/khoa-api-ghi-thua.spec.ts",
	"apps/api/test/go-thanh-vien.spec.ts",
	"apps/agent/test/tro-ly-okr-nop-tom-tat.integration.spec.ts",
	"apps/agent/test/tro-ly-okr-lich-tom-tat.integration.spec.ts",
	"apps/agent/test/tro-ly-okr-nhac-tom-tat.integration.spec.ts",
];
const TEP_SAN_PHAM = ["apps/api/src/okr/okr.service.ts"];
const SAP_CU = '{ createdAt: "asc" }]';
const SAP_MOI = '{ createdAt: "asc" }, { id: "asc" }]';
const CHO_PHEP = [
	...[...TEP_KIEM, ...TEP_SAN_PHAM].map(
		(t) => new RegExp(`^${t.replace(/[.]/g, "\\.")}$`),
	),
	new RegExp(`^_acceptance/${SLUG}/`),
	/^_acceptance\/config\.yaml$/,
	/^docs\/superpowers\//,
	/^PRODUCT-MAP\.md$/,
	/^LO-TRINH\.html$/,
];
const KHANG_DINH =
	/\bexpect\b|\.toBe\(|\.toEqual\(|throw new Error|loi\.push\(/;
const HA_THUOC = /\.(skip|todo|only|skipIf|if)\s*\(|\bxit\(|\bxdescribe\(/;

function git(args) {
	const r = spawnSync("git", ["-C", ROOT, ...args], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	if (r.status !== 0) {
		console.error(`pham-vi: git ${args.join(" ")} hong: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

const dong = (s) => s.split("\n").filter(Boolean);
const mot = (argv, co) => {
	const i = argv.indexOf(co);
	return i >= 0 ? argv[i + 1] : null;
};

function tepCuaVong() {
	const goc = git(["merge-base", "HEAD", NHANH_CHINH]).trim();
	const theoNhanh = dong(git(["diff", "--name-only", goc, "HEAD"]));
	const theoCommit = dong(
		git([
			"log",
			"--format=",
			"--name-only",
			"--no-merges",
			`--grep=(${SLUG})`,
			`${NEN}..HEAD`,
		]),
	);
	return [...new Set([...theoNhanh, ...theoCommit])].sort();
}

function phamVi(argv) {
	const gia = mot(argv, "--tep");
	const tep = gia ? gia.split(",").filter(Boolean) : tepCuaVong();
	const ngoai = tep.filter((t) => !CHO_PHEP.some((re) => re.test(t)));
	console.log(`pham-vi: ${tep.length} tep doi`);
	if (tep.length === 0) {
		console.log("PHAM VI DO: vong khong doi tep nao — thuoc khong co gi de do");
		return 1;
	}
	if (ngoai.length > 0) {
		console.log(
			`PHAM VI DO: ${ngoai.length} tep ngoai danh sach tep kiem va ho so: ${ngoai.join(", ")}`,
		);
		return 1;
	}
	const giaSp = mot(argv, "--patch-sp");
	if (giaSp && !existsSync(resolve(HO_SO, giaSp))) {
		console.error(`pham-vi: khong co mau va ${resolve(HO_SO, giaSp)}`);
		process.exit(2);
	}
	const vaSp = giaSp
		? readFileSync(resolve(HO_SO, giaSp), "utf8")
		: git(["diff", "--unified=0", NEN, "HEAD", "--", ...TEP_SAN_PHAM]);
	const dongSp = vaSp.split("\n");
	const botSp = dongSp.filter((d) => d.startsWith("-") && !d.startsWith("---"));
	const themSp = dongSp.filter(
		(d) => d.startsWith("+") && !d.startsWith("+++"),
	);
	if (botSp.length + themSp.length > 0) {
		const dungMotDong =
			botSp.length === 1 &&
			themSp.length === 1 &&
			themSp[0].slice(1) === botSp[0].slice(1).replace(SAP_CU, SAP_MOI) &&
			botSp[0].includes(SAP_CU);
		if (!dungMotDong) {
			console.log(
				`PHAM VI DO: tep san pham doi ngoai dong sap xep cua docMucTieu (${botSp.length} dong bot, ${themSp.length} dong them)`,
			);
			return 1;
		}
		console.log(
			"pham-vi: tep san pham doi dung mot dong sap xep (Hoi-2 loi a)",
		);
	}
	console.log(
		"PHAM VI XANH: moi tep vong doi nam trong danh sach tep kiem, ho so, tai lieu hoac ban do",
	);
	return 0;
}

function khongHa(argv) {
	const gia = mot(argv, "--patch");
	if (gia && !existsSync(resolve(HO_SO, gia))) {
		console.error(`pham-vi: khong co mau va ${resolve(HO_SO, gia)}`);
		process.exit(2);
	}
	const patch = gia
		? readFileSync(resolve(HO_SO, gia), "utf8")
		: git(["diff", "--unified=0", NEN, "HEAD", "--", ...TEP_KIEM]);
	const cacDong = patch.split("\n");
	const bot = cacDong.filter(
		(d) => d.startsWith("-") && !d.startsWith("---") && KHANG_DINH.test(d),
	);
	const them = cacDong.filter((d) => d.startsWith("+") && !d.startsWith("+++"));
	const ha = them.filter((d) => HA_THUOC.test(d));
	const giaMau = mot(argv, "--mau-doi");
	const mauDoi = giaMau
		? giaMau.split(",").filter(Boolean)
		: gia
			? []
			: dong(
					git([
						"diff",
						"--name-only",
						NEN,
						"HEAD",
						"--",
						":(glob)apps/**/fixtures/**",
					]),
				);
	console.log(
		`khong-ha: ${them.length} dong them · ${bot.length} dong bot khang dinh · ${mauDoi.length} tep mau doi`,
	);
	if (mauDoi.length > 0) {
		console.log(`KHONG HA DO: tep mau doi ${mauDoi.join(", ")}`);
		return 1;
	}
	if (them.length === 0) {
		console.log("KHONG HA DO: cac tep kiem khong doi — chua co ban sua de do");
		return 1;
	}
	if (bot.length > 0 || ha.length > 0) {
		console.log(
			`KHONG HA DO: cac tep kiem bot ${bot.length} dong khang dinh, them ${ha.length} dong ha thuoc (skip/todo/only)`,
		);
		for (const d of [...bot, ...ha].slice(0, 10)) console.log(`  ${d}`);
		return 1;
	}
	console.log(
		"KHONG HA XANH: cac tep kiem khong bot khang dinh nao, khong skip/todo/only, khong tep mau nao doi",
	);
	return 0;
}

const argv = process.argv.slice(2);
process.exit(argv.includes("--khong-ha") ? khongHa(argv) : phamVi(argv));
