import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	docGlobT1,
	quyetDinh,
	tachT1,
} from "../../../.github/scripts/phan-loai.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DINH = "1f6757ba03dd84779cf51d2755161b1e25fd4768";
const TU_NGAY = "2026-10-14T00:00:00+07:00";
const CA_523 = "1ddf125b3";
const DONG_523 =
	"pre-push: phần PR tự thêm (1 tệp; 23 tệp của onehub không tính) có tệp T1 mà mã đọc (LO-TRINH.html) — chạy đủ năm bước.";
const TIEU_DE = /^Merge (remote-tracking )?branch '(origin\/)?onehub'/;
const IT_NHAT = 400;
const KY_VONG = { cu: 6, moi: 38, n: 412 };
const SO_CA_PHA = 20;
const TEP = [
	"scripts/pre-push-t1.mjs",
	".github/scripts/phan-loai.mjs",
	"scripts/pre-merge-check.sh",
	"lib/workspace-record.cjs",
	"lib/evidence-core.cjs",
	"lib/eval-yaml.cjs",
	"_acceptance/config.yaml",
	".githooks/gate-shape.json",
];
const DONG_GIAO = "if (rieng.has(t)) tep.add(t);";
const SAP = /không phân loại được/;

function git(cwd, ...a) {
	const r = spawnSync("git", a, { cwd, encoding: "utf8", maxBuffer: 1 << 28 });
	return { ok: r.status === 0, ra: (r.stdout || "").trim() };
}

function gitPhai(cwd, ...a) {
	const r = git(cwd, ...a);
	if (!r.ok) throw new Error(`git ${a.join(" ")} hong`);
	return r.ra;
}

const ten = (cwd, a, b) =>
	gitPhai(cwd, "diff", "--name-only", "--no-renames", a, b)
		.split("\n")
		.filter(Boolean);

function dungKhoTam() {
	const d = mkdtempSync(join(tmpdir(), "lich-su-"));
	const kho = join(d, "kho");
	gitPhai(d, "clone", "-q", "--shared", "--no-checkout", GOC, kho);
	for (const t of TEP) {
		mkdirSync(dirname(join(kho, t)), { recursive: true });
		copyFileSync(join(GOC, t), join(kho, t));
	}
	return { d, kho };
}

function phanLoai(kho, m, p1, p2) {
	gitPhai(kho, "update-ref", "refs/remotes/origin/onehub", p2);
	const r = spawnSync(
		"node",
		["scripts/pre-push-t1.mjs", "--remote", "origin"],
		{
			cwd: kho,
			encoding: "utf8",
			input: `refs/heads/pr ${m} refs/heads/pr ${p1}\n`,
		},
	);
	return {
		ma: r.status,
		nhe: r.stdout.trim() !== "",
		sap: SAP.test(r.stderr),
		loi: r.stderr.trim(),
	};
}

const globs = docGlobT1(GOC);
const nhe = (tep) => {
	if (tep.length === 0) return false;
	const { t1, maDoc } = tachT1(globs, tep);
	return !quyetDinh({
		suKien: "pull_request",
		nhap: "false",
		tep,
		laT1: (t) => t1.has(t),
		laMaDoc: (t) => maDoc.has(t),
	}).nang;
};

function tinhTay(m, p1, p2) {
	const tang = ten(GOC, p1, m);
	const nen = gitPhai(GOC, "merge-base", m, p2);
	const truoc = gitPhai(GOC, "merge-base", nen, p1);
	const rieng = new Set([...ten(GOC, nen, m), ...ten(GOC, truoc, p1)]);
	const S = tang.filter((t) => rieng.has(t));
	return { cu: nhe(tang), moi: S.length === 0 ? tang.length > 0 : nhe(S) };
}

function danhSach() {
	return gitPhai(
		GOC,
		"log",
		"--merges",
		`--since=${TU_NGAY}`,
		"--format=%H %P %s",
		DINH,
	)
		.split("\n")
		.map((d) => {
			const [m, p1, p2, ...s] = d.split(" ");
			return { m, p1, p2, tieuDe: s.join(" ") };
		})
		.filter(
			(c) =>
				c.p2 &&
				TIEU_DE.test(c.tieuDe) &&
				git(GOC, "merge-base", "--is-ancestor", c.p2, DINH).ok,
		);
}

const loi = [];
const { d, kho } = dungKhoTam();
try {
	const m523 = gitPhai(GOC, "rev-parse", CA_523);
	const r523 = phanLoai(
		kho,
		m523,
		gitPhai(GOC, "rev-parse", `${m523}^1`),
		gitPhai(GOC, "rev-parse", `${m523}^2`),
	);
	if (r523.ma !== 0 || r523.nhe || r523.loi !== DONG_523)
		loi.push(`ca 523: ma ${r523.ma} nhe ${r523.nhe} «${r523.loi}»`);
	else console.log("dat ca-523");

	const ds = danhSach();
	if (ds.length < IT_NHAT)
		loi.push(`doi chung: chi co ${ds.length} lan gop (< ${IT_NHAT})`);
	let cu = 0;
	let moi = 0;
	const lechMoi = [];
	for (const c of ds) {
		const tay = tinhTay(c.m, c.p1, c.p2);
		const may = phanLoai(kho, c.m, c.p1, c.p2);
		if (may.sap) loi.push(`sap ${c.m.slice(0, 9)}: ${may.loi}`);
		else if (may.ma !== 0 || may.nhe !== tay.moi)
			loi.push(
				`lech ${c.m.slice(0, 9)}: bo phan loai ${may.nhe ? "nhe" : "nang"}, tinh tay ${tay.moi ? "nhe" : "nang"}`,
			);
		if (tay.cu && !tay.moi) loi.push(`nang len ${c.m.slice(0, 9)}`);
		if (tay.cu !== tay.moi) lechMoi.push(c);
		cu += tay.cu;
		moi += tay.moi;
	}
	console.log(
		`nhe theo luat cu: ${cu} / nhe theo luat moi: ${moi} / tren ${ds.length} lan gop`,
	);
	if (cu !== KY_VONG.cu || moi !== KY_VONG.moi || ds.length !== KY_VONG.n)
		loi.push(
			`so dem lech ky vong ${JSON.stringify(KY_VONG)}: cu ${cu}, moi ${moi}, n ${ds.length}`,
		);

	const p = join(kho, "scripts/pre-push-t1.mjs");
	const chu = readFileSync(p, "utf8");
	if (chu.split(DONG_GIAO).length !== 2)
		loi.push("thuoc hong: khong thay dung mot cho cay dot bien bo-giao");
	else {
		writeFileSync(p, chu.replace(DONG_GIAO, "tep.add(t);"));
		const bat = lechMoi
			.slice(0, SO_CA_PHA)
			.some(
				(c) =>
					phanLoai(kho, c.m, c.p1, c.p2).nhe !== tinhTay(c.m, c.p1, c.p2).moi,
			);
		if (bat)
			console.log("BAT bo-giao: phep doi chieu bao lech tren ban sao dot bien");
		else loi.push("thuoc hong: dot bien bo-giao khong lam lech lan gop nao");
	}
} finally {
	rmSync(d, { recursive: true, force: true });
}

if (loi.length) {
	for (const l of loi.slice(0, 30)) console.log(l);
	process.exit(1);
}
console.log("dat lich-su");
