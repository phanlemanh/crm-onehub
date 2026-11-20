#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const SLUG = "sua-bom-gio-test-api";
const NEN = "74a29a68d28df9a8a08daf9a5e94b8dab364dd96";
const NHANH_CHINH = "origin/onehub";
const TEP_KIEM = [
	"apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts",
	"apps/api/test/gop-y-dung-cho.spec.ts",
];
const CHO_PHEP = [
	...TEP_KIEM.map((t) => new RegExp(`^${t.replace(/[.]/g, "\\.")}$`)),
	new RegExp(`^_acceptance/${SLUG}/`),
	/^_acceptance\/config\.yaml$/,
	/^docs\/superpowers\//,
	/^PRODUCT-MAP\.md$/,
	/^LO-TRINH\.html$/,
];
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
			`PHAM VI DO: ${ngoai.length} tep ngoai hai tep kiem va ho so: ${ngoai.join(", ")}`,
		);
		return 1;
	}
	console.log(
		"PHAM VI XANH: moi tep vong doi nam trong hai tep kiem, ho so, tai lieu hoac ban do",
	);
	return 0;
}

function khongHa(argv) {
	const gia = mot(argv, "--patch");
	const patch = gia
		? readFileSync(resolve(gia), "utf8")
		: git(["diff", "--unified=0", NEN, "HEAD", "--", ...TEP_KIEM]);
	const cacDong = patch.split("\n");
	const bot = cacDong.filter((d) => d.startsWith("-") && !d.startsWith("---"));
	const them = cacDong.filter((d) => d.startsWith("+") && !d.startsWith("+++"));
	const ha = them.filter((d) => HA_THUOC.test(d));
	console.log(`khong-ha: ${them.length} dong them · ${bot.length} dong bot`);
	if (them.length === 0) {
		console.log("KHONG HA DO: hai tep kiem khong doi — chua co ban sua de do");
		return 1;
	}
	if (bot.length > 0 || ha.length > 0) {
		console.log(
			`KHONG HA DO: hai tep kiem bot ${bot.length} dong, them ${ha.length} dong ha thuoc (skip/todo/only)`,
		);
		for (const d of [...bot, ...ha].slice(0, 10)) console.log(`  ${d}`);
		return 1;
	}
	console.log(
		"KHONG HA XANH: hai tep kiem chi them dong, khong bot khang dinh nao, khong skip/todo/only",
	);
	return 0;
}

const argv = process.argv.slice(2);
process.exit(argv.includes("--khong-ha") ? khongHa(argv) : phamVi(argv));
