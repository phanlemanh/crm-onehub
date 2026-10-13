import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { git, GOC, Ket, khongDoDuoc, NEO, thuMucTam } from "./chung.mjs";
import { giaiGoi } from "./goi.mjs";

const NGOAI_LE = { "lich.mjs": ["PHIEN_XEP_CUOI"] };
const TAI_LIEU = [
	["README.md", "README.md"],
	["mau/LUAT.md", "scripts/mau/LUAT.md"],
];
const ket = new Ket();
const goi = giaiGoi();

function tenExport(tep) {
	const ma = `const m = await import(${JSON.stringify(pathToFileURL(tep).href)}); process.stdout.write(JSON.stringify(Object.keys(m).sort()));`;
	const r = spawnSync("node", ["--input-type=module", "-e", ma], {
		encoding: "utf8",
		timeout: 30_000,
		stdio: ["ignore", "pipe", "pipe"],
	});
	if (r.status !== 0) return { loi: (r.stderr || `ma ${r.status}`).trim().split("\n").slice(-1)[0] };
	return { ten: JSON.parse(r.stdout) };
}

const tam = thuMucTam("mo-dun");
try {
	const ds = git(GOC, "ls-tree", "--name-only", NEO.truoc, "scripts/dieu-phoi/")
		.split("\n")
		.filter((t) => /^scripts\/dieu-phoi\/[^/]+\.mjs$/.test(t))
		.map((t) => t.slice("scripts/dieu-phoi/".length));
	if (ds.length === 0) khongDoDuoc("merge-base khong co mo-dun nao duoi scripts/dieu-phoi");
	const tar = execFileSync("git", ["-C", GOC, "archive", NEO.truoc, "scripts/dieu-phoi"], { maxBuffer: 64 * 1024 * 1024 });
	execFileSync("tar", ["-x", "-C", tam], { input: tar });
	const cu = new Map(ds.map((t) => [t, tenExport(join(tam, "scripts/dieu-phoi", t))]));
	for (const [t, r] of cu) if (r.loi) khongDoDuoc(`khong nap duoc mo-dun cu ${t}: ${r.loi}`);

	const do_ = (gocGoi) => {
		const doDs = [];
		const thieu = {};
		for (const t of ds) {
			const p = join(gocGoi, "scripts", t);
			if (!existsSync(p)) {
				doDs.push(`DO vang ${t}`);
				continue;
			}
			const r = tenExport(p);
			if (r.loi) {
				doDs.push(`DO khong-nap ${t}: ${r.loi}`);
				continue;
			}
			const moi = new Set(r.ten);
			const mat = cu.get(t).ten.filter((x) => !moi.has(x));
			if (mat.length) thieu[t] = mat;
		}
		const tepLech = [...new Set([...Object.keys(thieu), ...Object.keys(NGOAI_LE)])].filter(
			(t) => JSON.stringify(thieu[t] ?? []) !== JSON.stringify(NGOAI_LE[t] ?? []),
		);
		for (const t of tepLech) doDs.push(`DO ngoai-le-lech ${t}: thieu ${JSON.stringify(thieu[t] ?? [])}, khai ${JSON.stringify(NGOAI_LE[t] ?? [])}`);
		for (const [cuTep, goiTep] of TAI_LIEU) {
			if (!existsSync(join(tam, "scripts/dieu-phoi", cuTep))) khongDoDuoc(`bo cu khong co ${cuTep} o merge-base`);
			const p = join(gocGoi, goiTep);
			if (!existsSync(p) || readFileSync(p, "utf8").trim() === "") doDs.push(`DO vang tai-lieu ${goiTep}`);
		}
		return { doDs, thieu };
	};

	const that = do_(goi.goc);
	for (const t of ds) {
		const mat = that.thieu[t];
		console.log(mat ? `thieu ${t}: ${mat.join(",")}` : `dat ${t}: ${cu.get(t).ten.length} ten`);
	}
	console.log(`neo: ${NEO.nhan}`);
	ket.kiem(that.doDs.length === 0, `${ds.length} mo-dun cu co trong goi, ngoai le dung ${JSON.stringify(NGOAI_LE)}, tai lieu ${TAI_LIEU.map(([, g]) => g).join(", ")} co trong goi`, that.doDs.join(" | "));

	const banSao = (ten, sua) => {
		const d = join(thuMucTam(`mo-dun-${ten}`), "goi");
		cpSync(goi.goc, d, { recursive: true });
		sua(d);
		try {
			return do_(d).doDs;
		} finally {
			rmSync(join(d, ".."), { recursive: true, force: true });
		}
	};
	ket.bat(
		"bo-export-bang",
		banSao("bang", (d) => {
			const p = join(d, "scripts", "bang.mjs");
			writeFileSync(p, readFileSync(p, "utf8").replace(/^export (function|const|async function) /m, "$1 "));
		}),
		"DO ngoai-le-lech bang.mjs",
	);
	ket.bat(
		"them-phien-xep-cuoi",
		banSao("lich", (d) => {
			const p = join(d, "scripts", "lich.mjs");
			writeFileSync(p, `${readFileSync(p, "utf8")}\nexport const PHIEN_XEP_CUOI = new Set(["kiem-cheo"]);\n`);
		}),
		"DO ngoai-le-lech lich.mjs",
	);
	ket.bat("xoa-readme", banSao("readme", (d) => rmSync(join(d, "README.md"))), "DO vang tai-lieu README.md");
	ket.bat(
		"xoa-suc-khoe",
		banSao("suc-khoe", (d) => rmSync(join(d, "scripts", "suc-khoe.mjs"))),
		"DO vang suc-khoe.mjs",
	);
} finally {
	rmSync(tam, { recursive: true, force: true });
}
ket.ket();
