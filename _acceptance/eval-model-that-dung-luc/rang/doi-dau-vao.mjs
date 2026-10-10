import { spawnSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dungBanSao, goBanSao, KhongDo } from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const CHE_DO = process.argv.includes("--ghi-ban-ghi") ? "ghi-ban-ghi" : "doi-dau-vao";
const CHAM = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const BAN_GHI = "_acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md";
const TEP_DOI = "apps/agent/agent/agent.ts";

if (!process.env.AI_GATEWAY_API_KEY?.trim() && !process.env.KHO_TAI_LIEU_AI_GATEWAY_API_KEY?.trim()) {
	console.error("can khoa Gateway");
	process.exit(2);
}

function chay(goc, args) {
	const env = { ...process.env };
	delete env.E15_QUYET;
	const r = spawnSync("bun", [CHAM, ...args], { cwd: goc, encoding: "utf8", env });
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

function git(goc, args) {
	const r = spawnSync("git", args, { cwd: goc, encoding: "utf8" });
	if (r.status !== 0) throw new KhongDo(`git ${args.join(" ")}: ${r.stderr.trim()}`);
}

function bamCua(goc) {
	const r = chay(goc, ["--chi-quyet"]);
	const bam = r.ra.match(/bam dau vao ([0-9a-f]+); model (\S+) · (\S+)/);
	if (!bam) throw new KhongDo(`--chi-quyet khong in bam:\n${r.ra.slice(-800)}`);
	return { bam: bam[1], kho: bam[2], goc: bam[3], ra: r.ra };
}

async function banGhiDat(goc, b) {
	const { ghiBanGhi } = await import(join(goc, "_acceptance/tro-ly-doc-kho/rang/quyet-do.ts"));
	return ghiBanGhi({
		bam: b.bam,
		doLuc: new Date(),
		dat: true,
		modelIds: { kho: b.kho, goc: b.goc },
		than: "## Tổng\n\n- ban ghi dung cho phep do",
	});
}

function commitTrongBanSao(goc, thongDiep) {
	git(goc, ["-c", "user.email=do@may", "-c", "user.name=do", "add", BAN_GHI]);
	git(goc, ["-c", "user.email=do@may", "-c", "user.name=do", "commit", "-q", "--no-verify", "-m", thongDiep]);
}

async function main() {
	const goc = dungBanSao(CHE_DO);
	const tam = mkdtempSync(join(tmpdir(), "emtdl-"));
	try {
		const b = bamCua(goc);
		const md = await banGhiDat(goc, b);
		if (CHE_DO === "ghi-ban-ghi") {
			const tep = join(tam, "cham-bo-do.md");
			writeFileSync(tep, md);
			const g = chay(goc, ["--ghi-ban-ghi", tep]);
			if (g.ma !== 0) throw new Error(`--ghi-ban-ghi ma ${g.ma}:\n${g.ra.slice(-600)}`);
			if (readFileSync(join(goc, BAN_GHI), "utf8") !== md)
				throw new Error("--ghi-ban-ghi khong chep dung ban ghi");
			console.log(`GHI: ${BAN_GHI} mang ban ghi ${b.bam}`);
			commitTrongBanSao(goc, "ban ghi e15");
			const sau = bamCua(goc);
			if (sau.bam !== b.bam) throw new Error(`commit ban ghi lam bam doi: ${b.bam} -> ${sau.bam}`);
			if (!sau.ra.includes(`DUNG LAI ${b.bam}`))
				throw new Error(`sau khi commit khong dung lai:\n${sau.ra.slice(-600)}`);
			console.log(`HEAD: DUNG LAI ${b.bam}`);
			const { dongKetLuot } = await import(join(goc, "_acceptance/tro-ly-doc-kho/rang/quyet-do.ts"));
			const co = dongKetLuot(0, "/t/x.md");
			const khong = dongKetLuot(1, "/t/x.md");
			if (co.length !== 1 || !co[0].startsWith("GHI BAN GHI: bun _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts --ghi-ban-ghi") || khong.length !== 0)
				throw new Error("dong ket luot sai");
			console.log("KET LUOT: dat in GHI BAN GHI, khong dat khong in");
			return 0;
		}
		writeFileSync(join(goc, BAN_GHI), md);
		commitTrongBanSao(goc, "ban ghi e15");
		const truoc = bamCua(goc);
		if (!truoc.ra.includes(`DUNG LAI ${b.bam}`)) throw new Error(`ban ghi khop ma khong dung lai:\n${truoc.ra.slice(-600)}`);
		console.log(`TRUOC: DUNG LAI ${b.bam}`);
		appendFileSync(join(goc, TEP_DOI), "\n");
		const sau = bamCua(goc);
		if (!sau.ra.includes("DO MOI: bam doi")) throw new Error(`doi ${TEP_DOI} ma khong do moi:\n${sau.ra.slice(-600)}`);
		console.log(`SAU: DO MOI: bam doi (${b.bam} -> ${sau.bam})`);
		return 0;
	} finally {
		rmSync(tam, { recursive: true, force: true });
		goBanSao(goc);
	}
}

try {
	process.exit(await main());
} catch (loi) {
	console.error(loi.message);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
