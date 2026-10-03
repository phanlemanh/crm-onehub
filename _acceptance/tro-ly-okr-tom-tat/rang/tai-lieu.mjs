import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const TAI_LIEU = {
	tep: {
		api: join(GOC, "docs", "api.md"),
		agent: join(GOC, "docs", "agent.md"),
	},
	co: { goc: "--goc", onehub: "--onehub", release: "--release" },
	refMacDinh: { onehub: "origin/onehub", release: "origin/release" },
	hopNhat: "e5c369cc6d770afec9141d53770ac57f38bfdbe5",
	muc: {
		choRe: "## Chỗ rẽ: Trợ lý OKR (lượt 9c)",
		okr: "## OKR",
	},
	thuTuc: ["troLyTomTat", "troLyTomTatPhanHoi", "troLyTomTatQuanTri"],
	hamLich: ["chayXepTomTat", "damBaoLichTomTat"],
};

class KhongDo extends Error {}

function giaTriCo(ten) {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? "");
}

function doc(tep) {
	return readFileSync(tep, "utf8");
}

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function coRef(ten) {
	try {
		git("rev-parse", "--verify", "--quiet", `${ten}^{commit}`);
		return true;
	} catch {
		return false;
	}
}

function mucH2(noiDung, tieuDe) {
	const dong = noiDung.split("\n");
	const batDau = dong.findIndex((d) => d.startsWith(tieuDe));
	if (batDau === -1) return null;
	const sau = dong.slice(batDau + 1).findIndex((d) => /^## /.test(d));
	const ket = sau === -1 ? dong.length : batDau + 1 + sau;
	return dong.slice(batDau, ket).join("\n");
}

const coTu = (chu, tu) => new RegExp(`\\b${tu}\\b`).test(chu);

function tapTepHang() {
	const onehub = giaTriCo(TAI_LIEU.co.onehub) ?? TAI_LIEU.refMacDinh.onehub;
	const release = giaTriCo(TAI_LIEU.co.release) ?? TAI_LIEU.refMacDinh.release;
	const thieu = [onehub, release].filter((r) => !coRef(r));
	if (thieu.length > 0)
		throw new KhongDo(`tai lieu: thieu ref ${thieu.join(", ")}`);
	const gocKhai = giaTriCo(TAI_LIEU.co.goc);
	const neo =
		gocKhai === null && coRef(TAI_LIEU.hopNhat) ? TAI_LIEU.hopNhat : null;
	const goc =
		gocKhai ?? (neo ? `${neo}^1` : git("merge-base", onehub, "HEAD").trim());
	if (!coRef(goc)) throw new KhongDo(`tai lieu: thieu ref goc ${goc}`);
	const dinh = neo ?? "HEAD";
	const doi = git("diff", "--name-only", goc, dinh).split("\n").filter(Boolean);
	const coORelease = new Set(
		git("ls-tree", "-r", "--name-only", release).split("\n").filter(Boolean),
	);
	return {
		goc,
		dinh,
		release,
		tap: new Set(doi.filter((t) => coORelease.has(t))),
	};
}

function kiemChoRe(agentMd) {
	const doan = mucH2(agentMd, TAI_LIEU.muc.choRe);
	const diff = tapTepHang();
	const tapDiff = [...diff.tap].sort();
	console.log(
		`tai-lieu: diff ${diff.goc.replace(/^([0-9a-f]{12})[0-9a-f]*/, "$1")}..${diff.dinh.slice(0, 12)} giao ${diff.release}: ${tapDiff.length} tep — ${tapDiff.join(", ")}`,
	);
	if (doan === null) {
		console.log(`tai-lieu: docs/agent.md chua co muc «${TAI_LIEU.muc.choRe}»`);
		return [
			`docs/agent.md thieu muc «${TAI_LIEU.muc.choRe}»`,
			...tapDiff.map((t) => `cho re thieu: ${t}`),
		];
	}
	const tapDoc = new Set([...doan.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]));
	console.log(
		`tai-lieu: muc cho re 9c liet ke ${tapDoc.size} tep — ${[...tapDoc].sort().join(", ")}`,
	);
	return [
		...tapDiff.filter((t) => !tapDoc.has(t)).map((t) => `cho re thieu: ${t}`),
		...[...tapDoc]
			.filter((t) => !diff.tap.has(t))
			.sort()
			.map((t) => `cho re thua: ${t}`),
	];
}

function kiemApiMd() {
	const okr = mucH2(doc(TAI_LIEU.tep.api), TAI_LIEU.muc.okr);
	if (okr === null) return ["docs/api.md thieu muc «## OKR»"];
	return TAI_LIEU.thuTuc
		.filter((ten) => !coTu(okr, ten))
		.map((ten) => `docs/api.md §OKR thieu thu tuc: ${ten}`);
}

function kiemHamLich(agentMd) {
	return TAI_LIEU.hamLich
		.filter((ten) => !coTu(agentMd, ten))
		.map((ten) => `docs/agent.md thieu ham lich: ${ten}`);
}

function main() {
	const agentMd = doc(TAI_LIEU.tep.agent);
	let loi;
	try {
		loi = [...kiemChoRe(agentMd), ...kiemApiMd(), ...kiemHamLich(agentMd)];
	} catch (e) {
		const cau = String(e?.message ?? e).split("\n")[0];
		console.error(e instanceof KhongDo ? cau : `tai lieu: git loi: ${cau}`);
		return 2;
	}
	if (loi.length > 0) {
		for (const dong of loi) console.error(dong);
		return 1;
	}
	console.log(
		`tai-lieu: muc cho re 9c, docs/api.md §OKR (${TAI_LIEU.thuTuc.length} thu tuc), docs/agent.md (${TAI_LIEU.hamLich.join(", ")}) deu du.`,
	);
	return 0;
}

process.exit(main());
