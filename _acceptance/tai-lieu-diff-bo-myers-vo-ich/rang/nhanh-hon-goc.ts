import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SLUG = "tai-lieu-diff-bo-myers-vo-ich";
const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SRC = join(GOC, "packages/validation/src");
const TEP = "packages/validation/src/tai-lieu-diff.ts";
const MOC = "cfac5bead7b65d8002b70eb8f11b0417f59ef91f";
const SO_LUOT = 10;
const TI_LE_TOI_DA = 0.75;
const BUOC_DONG_HO_MS = 60_000;
const DAI = 200_000;

type Mo = {
	soSanh: (a: string, b: string) => unknown;
	diffHash: (k: never) => Promise<string>;
};

function git(...doi: string[]): string {
	const r = spawnSync("git", doi, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.error(`khong co moc ${MOC.slice(0, 8)}: git ${doi.join(" ")}`);
		process.exit(2);
	}
	return r.stdout;
}

function vanBanDai(tu: string, doanSo: number): string {
	const cau: string[] = [];
	for (let i = 0; cau.join("\n\n").length < DAI; i += 1)
		cau.push(
			`${tu} ${i} ${"lorem ipsum dolor ".repeat((i % doanSo) + 3)}${tu} ${i}.`,
		);
	return cau.join("\n\n").slice(0, DAI);
}

async function napGoc(): Promise<Mo> {
	const tho = git("show", `${MOC}:${TEP}`);
	if (tho.includes("canDuoiSua")) {
		console.error("goc so da chua ban sua");
		process.exit(2);
	}
	const ma = tho
		.replace('from "./tai-lieu"', `from "${join(SRC, "tai-lieu.ts")}"`)
		.replace(
			'from "./tai-lieu-markdown"',
			`from "${join(SRC, "tai-lieu-markdown.ts")}"`,
		)
		.replace('from "diff"', `from "${Bun.resolveSync("diff", SRC)}"`);
	const noi = join(GOC, ".acceptance-runs", SLUG);
	mkdirSync(noi, { recursive: true });
	const duong = join(noi, `goc-${process.pid}.ts`);
	writeFileSync(duong, ma);
	try {
		return (await import(duong)) as Mo;
	} finally {
		rmSync(duong, { force: true });
	}
}

async function luot(
	mo: Mo,
	truoc: string,
	sau: string,
	i: number,
): Promise<number> {
	const bd = performance.now();
	const that = await mo.diffHash(mo.soSanh(truoc, sau) as never);
	const nowGoc = Date.now;
	let gia = nowGoc();
	Date.now = () => {
		gia += BUOC_DONG_HO_MS;
		return gia;
	};
	let giaHash: string;
	try {
		giaHash = await mo.diffHash(mo.soSanh(truoc, sau) as never);
	} finally {
		Date.now = nowGoc;
	}
	const ms = performance.now() - bd;
	if (giaHash !== that) {
		console.error(`tat-dinh lech hash o luot ${i}`);
		process.exit(1);
	}
	return ms;
}

const trungVi = (ds: number[]) => {
	const s = [...ds].sort((a, b) => a - b);
	return (s[(s.length - 1) >> 1]! + s[s.length >> 1]!) / 2;
};

async function do_(head: Mo, goc: Mo): Promise<number> {
	const truoc = vanBanDai("alpha", 7);
	const sau = vanBanDai("omega", 5);
	await luot(head, truoc, sau, 0);
	await luot(goc, truoc, sau, 0);
	const h: number[] = [];
	const g: number[] = [];
	for (let i = 1; i <= SO_LUOT; i += 1) {
		h.push(await luot(head, truoc, sau, i));
		g.push(await luot(goc, truoc, sau, i));
		console.log(
			`luot ${i}: head ${h.at(-1)!.toFixed(0)} goc ${g.at(-1)!.toFixed(0)}`,
		);
	}
	const tiLe = trungVi(h) / trungVi(g);
	console.log(
		`trung vi head ${trungVi(h).toFixed(0)} goc ${trungVi(g).toFixed(0)} ti le ${tiLe.toFixed(2)}`,
	);
	return tiLe;
}

const chieuDo = process.argv.includes("--chieu-do");
const goc = await napGoc();
const head = chieuDo
	? goc
	: ((await import(join(SRC, "tai-lieu-diff.ts"))) as Mo);
const tiLe = await do_(head, goc);
const nhanh = tiLe <= TI_LE_TOI_DA;
if (chieuDo) {
	if (nhanh) {
		console.error("chieu do: lot — goc do voi goc van qua nguong");
		process.exit(1);
	}
	console.error(`tat-dinh khong nhanh hon goc: ti le ${tiLe.toFixed(2)}`);
	console.log("chieu do: bat");
	process.exit(0);
}
if (!nhanh) {
	console.error(`tat-dinh khong nhanh hon goc: ti le ${tiLe.toFixed(2)}`);
	process.exit(1);
}
