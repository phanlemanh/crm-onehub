import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chayRang, daiCuaVong, GOC, git, KIEM_KE } from "./dai.mjs";

const KHUON = {
	"gop-vao": /căn chỉnh/i,
	"lay-y-kien": /hỏi ý/i,
	cap: /cấp OneHub/,
	goc: /\btenGoc\b/,
};
const VUNG = ["apps/api/src", "apps/agent/agent", "apps/agent-okr/agent", "packages/validation/src", "packages/db/src"];
const CON_LAI = { ...KHUON, goc: /OKR\.tenGoc|TRO_LY_OKR_HOI\.tenGoc|tenGoc: "OneHub"/ };
const TEP_LOI_DAN = ["apps/agent/agent/subagents/tro_ly_okr/instructions.md", "apps/agent-okr/agent/lib/loi-dan-soan.ts"];
const boDoanMa = (t, d) => (TEP_LOI_DAN.includes(t) ? d.replace(/\\?`[^`\\]*\\?`/g, "") : d);
const khoaMuc = (m) => `${m.tep}:${m.dong}:${m.khai_niem}`;

chayRang(() => {
	const kk = JSON.parse(readFileSync(join(GOC, KIEM_KE), "utf8"));
	const loi = [];
	const tep = [...new Set(kk.muc.map((m) => m.tep))];
	const quet = [];
	const vung = git("ls-tree", "-r", "--name-only", kk.moc, "--", ...VUNG).split("\n").filter(Boolean);
	for (const t of new Set([...vung, ...tep])) {
		const kn = Object.entries(KHUON).filter(([k]) => k !== "goc" || tep.includes(t));
		for (const [i, d] of git("show", `${kk.moc}:${t}`).split("\n").entries())
			for (const [k, re] of kn) if (re.test(d)) quet.push({ tep: t, dong: i + 1, khai_niem: k });
	}
	const daKe = new Set(kk.muc.map(khoaMuc));
	const daQuet = new Set(quet.map(khoaMuc));
	for (const m of quet) if (!daKe.has(khoaMuc(m))) loi.push(`kiem-ke sot ${m.tep}:${m.dong} ${m.khai_niem}`);
	for (const m of kk.muc) if (!daQuet.has(khoaMuc(m))) loi.push(`kiem-ke thua ${m.tep}:${m.dong} ${m.khai_niem}`);

	const giu = new Set(kk.muc.filter((m) => m.xu_ly === "giu").map((m) => `${m.tep}\0${m.cu}`));
	for (const t of tep) {
		const kn = [...new Set(kk.muc.filter((m) => m.tep === t && m.xu_ly === "doi").map((m) => m.khai_niem))];
		for (const [i, d] of readFileSync(join(GOC, t), "utf8").split("\n").entries()) {
			if (giu.has(`${t}\0${d.trim()}`)) continue;
			for (const k of kn) if (CON_LAI[k].test(boDoanMa(t, d))) loi.push(`con chu cu ${t}:${i + 1} ${k}`);
		}
	}

	const dai = daiCuaVong();
	const commit = git("rev-list", "--reverse", `${dai.tu}..${dai.den}`).split("\n").filter(Boolean);
	const viTri = commit.indexOf(dai.commitKiemKe);
	if (viTri < 0) loi.push("kiem-ke viet sau khi sua: commit them kiem-ke khong o trong dai");
	for (const [i, c] of commit.entries()) {
		const doi = git("diff", "--name-only", `${c}^1`, c).split("\n");
		if (i < viTri && doi.some((t) => /^(apps|packages)\//.test(t))) loi.push(`kiem-ke viet sau khi sua: ${c.slice(0, 9)}`);
		if (i > viTri && doi.includes(KIEM_KE)) loi.push(`kiem-ke viet sau khi sua: ${c.slice(0, 9)} doi kiem-ke.json`);
	}

	if (loi.length) {
		console.log(loi.join("\n"));
		return 1;
	}
	console.log(`kiem-ke: ${kk.muc.length} muc o ${tep.length} tep (quet ${VUNG.length} vung), khop moc ${kk.moc}, khong con chu cu (dai ${dai.kieu} ${dai.soCommit} commit)`);
	return 0;
});
