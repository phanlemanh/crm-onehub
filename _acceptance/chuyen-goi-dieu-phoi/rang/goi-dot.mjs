import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cloneDocLap, git, GOC, Ket, MB, moiTruongSach, thuMucTam } from "./chung.mjs";
import { giaiGoi, napGoi } from "./goi.mjs";

const KHOA = "docs/plan/dot-{ten}";
const ket = new Ket();
const goi = giaiGoi();
const { docKhoaGoiDot } = await napGoi(goi, "scripts/goi-dot.mjs");
const { MUC } = await napGoi(goi, "scripts/chan-doan.mjs");

ket.kiem(docKhoaGoiDot(GOC) === KHOA, `khoa ${KHOA}`, `docKhoaGoiDot tra ${JSON.stringify(docKhoaGoiDot(GOC))}`);

const diff = git(GOC, "diff", "-U0", MB, "--", "_acceptance/config.yaml").split("\n");
const tru = diff.filter((d) => d.startsWith("-") && !d.startsWith("---"));
const cong = diff.filter((d) => d.startsWith("+") && !d.startsWith("+++"));
ket.kiem(tru.length === 0 && cong.length > 0, `chi-them config.yaml (+${cong.length})`, `${tru.length} dong bi xoa hay sua: ${tru.slice(0, 3).join(" | ")}`);

const home = thuMucTam("goi-dot-home");
function chanDoan(goc) {
	const r = spawnSync("node", [join(goi.goc, "scripts", "dieu-phoi.mjs"), "chan-doan", "--mo", "r2", "--json"], {
		cwd: goc,
		encoding: "utf8",
		env: moiTruongSach({ HOME: home }),
	});
	if (r.status !== 0) return { loi: `ma ${r.status}: ${r.stderr.trim()}` };
	return { ds: JSON.parse(r.stdout) };
}

function do_(goc) {
	const r = chanDoan(goc);
	if (r.loi) return [`DO chan-doan ${r.loi}`];
	const doDs = [];
	const theo = new Map(r.ds.map((m) => [m.muc, m]));
	if (JSON.stringify(r.ds.map((m) => m.muc)) !== JSON.stringify(MUC)) doDs.push(`DO muc lech ${JSON.stringify(r.ds.map((m) => m.muc))}`);
	if (theo.get("co-dot")?.trang_thai !== "thieu") doDs.push(`DO co-dot ${theo.get("co-dot")?.trang_thai}`);
	const gd = theo.get("goi-dot");
	if (gd?.trang_thai !== "du" || !String(gd.viec).endsWith("docs/plan/dot-r2")) doDs.push(`DO goi-dot ${gd?.trang_thai} ${gd?.viec ?? ""}`);
	for (const m of r.ds) if (!["co-dot", "goi-dot"].includes(m.muc) && m.trang_thai !== "khong-ap") doDs.push(`DO ${m.muc} ${m.trang_thai}`);
	return doDs;
}

const head = git(GOC, "rev-parse", "HEAD").trim();
const ban = cloneDocLap(head, "goi-dot");
try {
	const that = do_(ban.goc);
	ket.kiem(that.length === 0, "chan-doan --mo r2: chi thieu co-dot", that.join(" | "));
	const p = join(ban.goc, "_acceptance", "config.yaml");
	const goc0 = readFileSync(p, "utf8");
	const thu = (sua) => {
		writeFileSync(p, sua(goc0));
		try {
			return do_(ban.goc);
		} finally {
			writeFileSync(p, goc0);
		}
	};
	ket.bat("bo-khoa", thu((t) => t.replace(/^dieu_phoi:\n {2}goi_dot: .*\n/m, "")), "DO goi-dot thieu");
	ket.bat("tro-sai", thu((t) => t.replace(/^( {2}goi_dot: ).*$/m, "$1docs/plan/khong-co-{ten}")), "DO goi-dot thieu");
} finally {
	ban.don();
	rmSync(home, { recursive: true, force: true });
}
ket.ket();
