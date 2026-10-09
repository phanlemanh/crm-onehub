import { execFileSync } from "node:child_process";
import { bang, chayThuoc, GOC, ketThuc, soHaiRuntime, tuKiemSoSanh } from "./chung.mjs";

const KHO = "phanlemanh/crm-onehub";
const NHANH = "onehub";
const LAN_THU = 3;
const NGAY_MS = 24 * 3600 * 1000;

const sh = (lenh, thamSo) => execFileSync(lenh, thamSo, { encoding: "utf8", cwd: GOC, maxBuffer: 64 * 1024 * 1024 }).trim();
const gh = (...t) => JSON.parse(sh("gh", t));
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");

const mocTu = iso(Date.parse(sh("git", ["log", "-1", "--first-parent", "--format=%cI", `origin/${NHANH}`, "--", ".github/workflows/ci.yml"])));
const mocDen = iso(Date.parse(mocTu) + 7 * NGAY_MS);

function demDocLap() {
	const nhanhPr = new Set(
		gh("pr", "list", "-R", KHO, "--base", NHANH, "--state", "all", "--limit", "500", "--json", "headRefName,state")
			.filter((p) => p.state !== "CLOSED")
			.map((p) => p.headRefName),
	);
	const runs = gh(
		"run", "list", "-R", KHO, "--workflow", "ci.yml", "--event", "pull_request",
		"--created", `${mocTu}..${mocDen}`, "--limit", "1000",
		"--json", "databaseId,headBranch,status,attempt",
	).filter((r) => nhanhPr.has(r.headBranch));
	let xanh = 0;
	let tran = 0;
	for (const r of runs) {
		for (let a = 1; a <= r.attempt; a += 1) {
			const jobs = gh("run", "view", String(r.databaseId), "-R", KHO, "--attempt", String(a), "--json", "jobs").jobs;
			if (a === r.attempt && r.status === "completed" && jobs.some((j) => j.name === "ci-ok" && j.conclusion === "success")) xanh += 1;
			for (const j of jobs.filter((x) => x.conclusion === "cancelled" && x.startedAt && !x.startedAt.startsWith("0001"))) {
				const cau = gh("api", `repos/${KHO}/check-runs/${j.databaseId}/annotations`).map((x) => x.message);
				if (cau.some((c) => /exceeded the maximum execution time/.test(c))) tran += 1;
			}
		}
	}
	return { luot: runs.length, xanh, tran };
}

function motLuot() {
	const node = chayThuoc("node", ["--nhanh", NHANH]);
	const doc = demDocLap();
	const bun = chayThuoc("bun", ["--nhanh", NHANH]);
	return { node, doc, bun };
}

function kiem({ node, doc, bun }) {
	const loi = [];
	const dongCuaSo = Date.parse(mocDen) <= Date.now();
	for (const [rt, r] of [["node", node], ["bun", bun]]) {
		const cs = r.dong.get("cua so") ?? "";
		if (!cs.startsWith(`${mocTu} -> ${mocDen}`)) loi.push(`[${rt}] cua so «${cs}», mong bat dau ${mocTu} (git log) va ket thuc ${mocDen}`);
		const kl = r.dong.get("ket luan") ?? "";
		if (!dongCuaSo) {
			if (r.ma !== 3) loi.push(`[${rt}] cua so chua dong ma ma ${r.ma}, mong 3`);
			if (!kl.includes("cua so chua dong")) loi.push(`[${rt}] ket luan «${kl}», mong noi cua so chua dong`);
			if (/SONG|CHET/.test(r.stdout)) loi.push(`[${rt}] cua so chua dong ma in SONG/CHET`);
		} else {
			const x = Number(r.dong.get("luot xanh"));
			const mongMa = x >= 10 ? 0 : 3;
			if (r.ma !== mongMa) loi.push(`[${rt}] ${x} luot xanh, ma ${r.ma}, mong ${mongMa}`);
			if (x >= 10 && !/^(SONG|CHET|giua hai nguong)$/.test(kl)) loi.push(`[${rt}] ket luan «${kl}» voi ${x} luot xanh`);
		}
	}
	for (const l of soHaiRuntime(node, bun)) loi.push(`node khac bun — ${l}`);
	if (Number(node.dong.get("luot xanh")) !== doc.xanh) loi.push(`luot xanh: thuoc ${node.dong.get("luot xanh")}, dem doc lap ${doc.xanh}`);
	if (Number(node.dong.get("dung vi tran")) !== doc.tran) loi.push(`dung vi tran: thuoc ${node.dong.get("dung vi tran")}, dem doc lap ${doc.tran}`);
	if (Number(node.dong.get("vao mau")) !== doc.luot) loi.push(`vao mau: thuoc ${node.dong.get("vao mau")}, dem doc lap ${doc.luot}`);
	return loi;
}

let loi = [];
for (let lan = 1; lan <= LAN_THU; lan += 1) {
	const kq = motLuot();
	loi = kiem(kq);
	tuKiemSoSanh(kq.node.dong, { "luot xanh": bang(kq.doc.xanh) }, "luot xanh");
	console.log(
		`lan ${lan}: cua so ${kq.node.dong.get("cua so")}; thuoc vao mau=${kq.node.dong.get("vao mau")} xanh=${kq.node.dong.get("luot xanh")} tran=${kq.node.dong.get("dung vi tran")}; doc lap luot=${kq.doc.luot} xanh=${kq.doc.xanh} tran=${kq.doc.tran}`,
	);
	if (loi.length === 0) break;
	if (lan < LAN_THU) console.log(`  lech (co the do luot moi chen giua hai lan doc), doc lai: ${loi.join("; ")}`);
}
ketThuc("mac-dinh", loi);
