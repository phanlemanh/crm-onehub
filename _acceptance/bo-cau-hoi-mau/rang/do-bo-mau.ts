import { spawn, spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { docTungCau } from "../../tro-ly-doc-kho/rang/quyet-do";
import {
	bam,
	ghiBaoCao,
	kiemBangChung,
	phanBang,
	soMa,
	tinhBang,
} from "./bang-do";
import { BO_MAU } from "./bo-mau-config";
import { khuonBoMau } from "./khuon";
import { docTrangMau, kiemBo } from "./kiem-bo";

const GOC = BO_MAU.duong.goc;
const { baoCao, tungCau, traLoi } = BO_MAU.bangChung;
const env = (ten: string) => process.env[ten]?.trim() || undefined;
const tepBo = resolve(env(BO_MAU.bien.bo) ?? BO_MAU.duong.bo);
const thuMucEvidence = resolve(
	env(BO_MAU.bien.evidence) ?? BO_MAU.duong.evidence,
);
const thuMucChay = resolve(env(BO_MAU.bien.chay) ?? BO_MAU.duong.chayGoc);
const lenhCham =
	env(BO_MAU.bien.lenhCham) ?? `bun ${JSON.stringify(BO_MAU.duong.cham)}`;

function khongDo(cau: string): never {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

const docNeuCo = (tep: string) =>
	existsSync(tep) ? readFileSync(tep, "utf8") : null;

function bamTroLy(): string {
	const r = spawnSync(
		"git",
		[
			"-C",
			GOC,
			"ls-files",
			"-co",
			"--exclude-standard",
			"--",
			relative(GOC, BO_MAU.duong.troLy),
		],
		{ encoding: "utf8" },
	);
	if (r.status !== 0) return "khong-tinh-duoc";
	const h = r.stdout
		.split("\n")
		.filter(Boolean)
		.sort()
		.map((f) => {
			const tep = join(GOC, f);
			return `${f}\n${existsSync(tep) ? bam(readFileSync(tep, "utf8")) : "-"}`;
		})
		.join("\n");
	return bam(h);
}

function inKetKiem(
	bc: string | null,
	jsonl: string | null,
	nhan: string,
): number {
	const boTho = readFileSync(tepBo, "utf8");
	const k = kiemBangChung(boTho, bc, jsonl);
	if (!k.ok) {
		console.log(`LECH (${nhan}): ${k.loi}`);
		return 1;
	}
	console.log(`khop (${nhan})`);
	console.log(`bam bo-mau: ${bam(boTho)}`);
	console.log(`luot 1: ${k.soLuot.mot} ma`);
	console.log(`luot 2: ${k.soLuot.hai} ma`);
	console.log(`ma thoat cham-bo-do: ${k.maCham}`);
	console.log(phanBang(k.bang));
	return 0;
}

async function chayCham(): Promise<{ ma: number | null; ra: string }> {
	mkdirSync(thuMucChay, { recursive: true });
	const con = spawn("sh", ["-c", `${lenhCham} --bo ${JSON.stringify(tepBo)}`], {
		cwd: GOC,
		env: { ...process.env, BANG_CHUNG: thuMucChay },
		stdio: ["ignore", "pipe", "inherit"],
	});
	let ra = "";
	con.stdout.on("data", (b: Buffer) => {
		ra += b.toString();
		process.stdout.write(b);
	});
	const ma = await new Promise<number | null>((ok) => con.on("close", ok));
	return { ma, ra };
}

function tongCuaCham(md: string | null): string[] {
	if (!md) return [];
	const i = md.indexOf("## Tổng");
	if (i < 0) return [];
	const sau = md.slice(i + "## Tổng".length);
	const het = sau.indexOf("\n## ");
	return (het < 0 ? sau : sau.slice(0, het))
		.split("\n")
		.filter((d) => d.startsWith("- "))
		.map((d) => d.slice(2));
}

async function do_(): Promise<number> {
	const boTho = readFileSync(tepBo, "utf8");
	const viPham = kiemBo(boTho, docTrangMau(BO_MAU.duong.trangMau));
	if (viPham.length > 0)
		khongDo(`bo con ${viPham.length} vi pham — chay kiem-bo.ts truoc`);
	const bo = khuonBoMau.parse(JSON.parse(boTho));
	const bamTl = bamTroLy();
	const { ma, ra } = await chayCham();
	const dongLuot = [...ra.matchAll(/^thu muc luot: (.+)$/gm)]
		.at(-1)?.[1]
		?.trim();
	if (ma !== 0 && ma !== 1 && ma !== 2)
		khongDo(`cham-bo-do thoat ${ma ?? "do tin hieu"}`);
	if (!dongLuot)
		khongDo(
			`cham-bo-do thoat ${ma}, khong thay dong 'thu muc luot' trong dau ra`,
		);
	const luotCham = resolve(GOC, dongLuot);
	const jsonl = docNeuCo(join(luotCham, "luot-1", tungCau));
	if (jsonl === null) khongDo(`khong co ${join(luotCham, "luot-1", tungCau)}`);
	const dong = docTungCau(jsonl);
	const so = soMa(bo, dong);
	const hong = [
		...so.thieu.map((x) => `thieu ${x}`),
		...so.trung.map((x) => `trung ${x}`),
		...so.la.map((x) => `ma la ${x}`),
	];
	if (hong.length > 0) khongDo(`tap ma lech: ${hong.join("; ")}`);
	const mdCham = docNeuCo(join(luotCham, "cham-bo-do.md"));
	const md = ghiBaoCao({
		bam: bam(boTho),
		bamTroLy: bamTl,
		maCham: ma,
		luot: relative(GOC, luotCham),
		tong: tongCuaCham(mdCham),
		bang: tinhBang(bo, dong),
		soLuot: {
			mot: dong.filter((d) => d.luot === 1).length,
			hai: dong.filter((d) => d.luot === 2).length,
		},
	});
	const ra2 = join(
		thuMucChay,
		`${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}`,
	);
	mkdirSync(ra2, { recursive: true });
	writeFileSync(join(ra2, baoCao), md);
	writeFileSync(join(ra2, tungCau), jsonl);
	if (mdCham !== null) writeFileSync(join(ra2, traLoi), mdCham);
	console.log(md);
	console.log(
		`ghi bang: bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --ghi ${relative(GOC, ra2)}`,
	);
	return 0;
}

function ghi(thuMuc: string): number {
	const nguon = resolve(GOC, thuMuc);
	const ma = inKetKiem(
		docNeuCo(join(nguon, baoCao)),
		docNeuCo(join(nguon, tungCau)),
		relative(GOC, nguon),
	);
	if (ma !== 0) return ma;
	mkdirSync(thuMucEvidence, { recursive: true });
	for (const t of [baoCao, tungCau, traLoi])
		if (existsSync(join(nguon, t)))
			copyFileSync(join(nguon, t), join(thuMucEvidence, t));
	console.log(
		`da chep vao ${relative(GOC, thuMucEvidence)}; commit de lenh kiem dung duoc`,
	);
	return 0;
}

const doiSo = process.argv.slice(2);
if (doiSo.includes("--do")) process.exit(await do_());
const iGhi = doiSo.indexOf("--ghi");
if (iGhi >= 0) {
	const t = doiSo[iGhi + 1];
	if (!t) khongDo("--ghi can thu muc luot");
	process.exit(ghi(t));
}
process.exit(
	inKetKiem(
		docNeuCo(join(thuMucEvidence, baoCao)),
		docNeuCo(join(thuMucEvidence, tungCau)),
		relative(GOC, thuMucEvidence),
	),
);
