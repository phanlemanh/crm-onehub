import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hoSo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const goc = resolve(hoSo, "../..");
const tuThu = process.argv.includes("--tu-thu");

const SOAN = "apps/app/app/(app)/[slug]/okr/soan";
const KHU_KHONG_SO = [`${SOAN}/`, "apps/app/components/crm/record-sheet/"];
const BE_NGANG_SO = /\b(?:w|min-w|max-w)-\[\d+px\]|width:\s*["']?\d+(?:px)?/;
const THAY_K2 = ["E1", "E1b", "E2", "E2b", "E3", "E14"];
const CON_TRO = /^soan-okr-trong-khung#AC-\d+$/;
const QUAN_HE_MUC = [
	{ ten: "Kara o cot phai", re: /Kara ở (?:\*\*)?cột phải/ },
	{ ten: "vat pham mo them ve ben trai", re: /mở\s+(?:\*\*)?thêm về bên trái/ },
	{ ten: "ap cho Soan OKR", re: /Đang áp:\s*Soạn OKR/ },
	{ ten: "khung deal o K5", re: /K5/ },
];

const git = (...thamSo) =>
	execFileSync("git", thamSo, { cwd: goc, encoding: "utf8", maxBuffer: 64e6 });
const doc = (duong) => readFileSync(join(goc, duong), "utf8");

// F8 neo (ve-sinh-do-san-onehub): diff cua vong (muc 1, muc 3, ranh gioi) rut tu cap gop PR #344 da dua vong len
// onehub (B = d089cb8da^1, D = d089cb8da), khong tu merge-base(HEAD, onehub) — sau khi gop,
// merge-base chua san vong nay (muc 3 do sai) va diff la tep cua vong khac (ranh gioi do sai).
const CAP = Object.freeze({
	goc: "d0ccad9845c112caec8d02e8a393d8c4eec616f6",
	dinh: "d089cb8da201cd652ad77e1cb4cf43eb07e2edc5",
});

function kiemCap(cap) {
	for (const sha of [cap.goc, cap.dinh])
		try {
			git("cat-file", "-e", `${sha}^{commit}`);
		} catch {
			console.log(`KHONG DO DUOC: khong giai duoc cap gop ${sha}`);
			process.exit(2);
		}
}

function globSangRe(mau) {
	let re = "";
	for (let i = 0; i < mau.length; i += 1) {
		const c = mau[i];
		if (c === "*" && mau[i + 1] === "*") {
			re += ".*";
			i += 1;
		} else if (c === "*") re += "[^/]*";
		else re += c.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
	}
	return new RegExp(`^${re}$`);
}

export function muc1(dongThem) {
	const sai = dongThem.filter(
		(d) =>
			KHU_KHONG_SO.some((k) => d.tep.startsWith(k)) && BE_NGANG_SO.test(d.chu),
	);
	return sai.length === 0
		? null
		: `muc 1: be ngang so o cho goi — ${sai.map((d) => `${d.tep}: ${d.chu.trim()}`).join(" | ")}`;
}

export function muc2({ sheet, dock, globals }) {
	if (!/\bkara:\s*"/.test(sheet))
		return "muc 2: sheet.tsx khong co bien the kara";
	if (!/rail:\s*"[^"]*--container-assist-rail/.test(dock))
		return "muc 2: cot kara khong lay --container-assist-rail";
	if (!/fill:\s*"[^"]*--container-assist\)/.test(dock))
		return "muc 2: ban nhap khong lay --container-assist";
	if (
		!/--container-assist-rail:\s*380px/.test(globals) ||
		!/--container-assist:\s*800px/.test(globals)
	)
		return "muc 2: globals.css khong con hai token 380px va 800px";
	return null;
}

export function muc3({ tepKaraMoi, nhapTuSoan }) {
	const dung = tepKaraMoi.filter((t) => nhapTuSoan.some((n) => n.includes(t)));
	return dung.length > 0
		? null
		: "muc 3: khong co tep moi trong packages/ui/src/components/kara/ duoc khu soan nhap";
}

export function muc4(nguonSoan) {
	const co = nguonSoan.filter((n) => n.chu.includes("ResizablePanelGroup"));
	return co.length === 0
		? null
		: `muc 4: con ResizablePanelGroup — ${co.map((n) => n.tep).join(", ")}`;
}

export function muc5(aiUx) {
	const dau = aiUx.search(/^##[^\n]*Kara ở đâu/m);
	if (dau < 0) return "muc 5: thieu luat kara o dau";
	const sau = aiUx.slice(dau + 3);
	const cuoi = sau.search(/^## /m);
	const than = cuoi < 0 ? sau : sau.slice(0, cuoi);
	const thieu = QUAN_HE_MUC.filter((q) => !q.re.test(than)).map((q) => q.ten);
	return thieu.length === 0
		? null
		: `muc 5: muc kara o dau thieu ${thieu.join(", ")}`;
}

export function muc6(evalsK2) {
	const loi = [];
	for (const e of evalsK2.evals) {
		const thay = THAY_K2.includes(e.id);
		if (
			thay &&
			(e.status !== "not-run" || !CON_TRO.test(e.superseded_by ?? ""))
		)
			loi.push(`${e.id} chua khai thay`);
		if (!thay && e.superseded_by) loi.push(`${e.id} khai thay ngoai bang`);
	}
	const thieu = THAY_K2.filter((id) => !evalsK2.evals.some((e) => e.id === id));
	if (thieu.length > 0) loi.push(`khong co ${thieu.join(", ")}`);
	return loi.length === 0 ? null : `muc 6: ${loi.join("; ")}`;
}

export function ranhGioi(tep, globs) {
	const re = globs.map(globSangRe);
	const ngoai = tep.filter((t) => !re.some((r) => r.test(t)));
	return ngoai.length === 0
		? null
		: `ranh gioi: ngoai ranh — ${ngoai.join(", ")}`;
}

function dongThemTuDiff(diff) {
	const ra = [];
	let tep = "";
	for (const dong of diff.split("\n")) {
		if (dong.startsWith("+++ b/")) tep = dong.slice(6);
		else if (
			dong.startsWith("+") &&
			!dong.startsWith("+++") &&
			tep.endsWith(".tsx")
		)
			ra.push({ tep, chu: dong.slice(1) });
	}
	return ra;
}

function docVatThat(cap = CAP) {
	kiemCap(cap);
	// F8 neo (ve-sinh-do-san-onehub): ba lan doc diff deu tren cap gop B..D.
	const cap2 = `${cap.goc}..${cap.dinh}`;
	const diff = git(
		"diff",
		"-U0",
		cap2,
		"--",
		...KHU_KHONG_SO.map((k) => `:(literal)${k}`),
	);
	const tepDiff = git("diff", "--name-only", cap2).split("\n").filter(Boolean);
	const tepMoi = git(
		"diff",
		"--name-only",
		"--diff-filter=A",
		cap2,
		"--",
		"packages/ui/src/components/kara/",
	)
		.split("\n")
		.filter((t) => t.endsWith(".tsx"))
		.map(
			(t) =>
				`@crm/ui/components/kara/${t
					.split("/")
					.pop()
					.replace(/\.tsx$/, "")}`,
		);
	const tepSoan = git("ls-files", "--", `:(literal)${SOAN}/`)
		.split("\n")
		.filter((t) => /\.tsx?$/.test(t));
	if (tepSoan.length === 0) throw new Error("khong doc duoc tep nao trong khu soan");
	const nguonSoan = tepSoan.map((t) => ({ tep: t, chu: doc(t) }));
	return {
		dongThem: dongThemTuDiff(diff),
		tepDiff,
		sheet: doc("packages/ui/src/components/sheet.tsx"),
		dock: doc("packages/ui/src/components/kara/dock.tsx"),
		globals: doc("packages/ui/src/styles/globals.css"),
		tepKaraMoi: tepMoi,
		nhapTuSoan: nguonSoan.map((n) => n.chu),
		nguonSoan,
		aiUx: doc("docs/ai-ux.md"),
		evalsK2: Bun.YAML.parse(doc("_acceptance/soan-okr-trang-rieng/evals.yaml")),
		globs: JSON.parse(readFileSync(join(hoSo, "rang/ranh-gioi.json"), "utf8"))
			.globs,
	};
}

function kiem(v) {
	return [
		muc1(v.dongThem),
		muc2(v),
		muc3(v),
		muc4(v.nguonSoan),
		muc5(v.aiUx),
		muc6(v.evalsK2),
		ranhGioi(v.tepDiff, v.globs),
	];
}

// F8 neo (ve-sinh-do-san-onehub): tu-thu khong sua cay lam viec — tep trong diff thi dung mot commit tam (cay D voi
// mot tep doi, cha B) bang chi muc tam; tep doc truc tiep (docs/ai-ux.md) thi doi trong bo nho.
function capBanSao(tep, doi) {
	const chiMuc = join(tmpdir(), `sk-luat-${process.pid}-${Date.now()}`);
	const env = { ...process.env, GIT_INDEX_FILE: chiMuc };
	const chay = (thamSo, them = {}) =>
		execFileSync("git", thamSo, { cwd: goc, encoding: "utf8", env, ...them }).trim();
	try {
		chay(["read-tree", CAP.dinh]);
		const blob = chay(["hash-object", "-w", "--stdin"], {
			input: doi(git("show", `${CAP.dinh}:${tep}`)),
		});
		chay(["update-index", "--cacheinfo", `100644,${blob},${tep}`]);
		const cay = chay(["write-tree"]);
		const dinh = chay(["commit-tree", cay, "-p", CAP.goc, "-m", "tu-thu luat.mjs"], {
			env: {
				...env,
				GIT_AUTHOR_NAME: "tu-thu",
				GIT_AUTHOR_EMAIL: "tu-thu@lan-do",
				GIT_COMMITTER_NAME: "tu-thu",
				GIT_COMMITTER_EMAIL: "tu-thu@lan-do",
			},
		});
		return { goc: CAP.goc, dinh };
	} finally {
		rmSync(chiMuc, { force: true });
	}
}

function suaTam(tep, doi, lam) {
	if (tep === "docs/ai-ux.md") {
		const v = docVatThat();
		v.aiUx = doi(v.aiUx);
		return lam(v);
	}
	return lam(docVatThat(capBanSao(tep, doi)));
}

if (tuThu) {
	const ca = [
		{
			ten: "be ngang so trong khu soan",
			tep: `${SOAN}/khung-soan.tsx`,
			doi: (cu) => `${cu}\nexport const PHA = <div className="w-[380px]" />;\n`,
			cho: "muc 1: be ngang so o cho goi",
		},
		{
			ten: "bo luat kara o dau",
			tep: "docs/ai-ux.md",
			doi: (cu) => cu.replace(/^##[^\n]*Kara ở đâu/m, "## 11. Khác"),
			cho: "muc 5: thieu luat kara o dau",
		},
		{
			ten: "doi Kara sang cot trai",
			tep: "docs/ai-ux.md",
			doi: (cu) => cu.replace("Kara ở **cột phải**", "Kara ở **cột trái**"),
			cho: "muc 5: muc kara o dau thieu Kara o cot phai",
		},
		{
			ten: "tep ngoai ranh",
			tep: "apps/api/src/okr/okr.router.ts",
			doi: (cu) => `${cu}\n`,
			cho: "ranh gioi: ngoai ranh",
		},
	];
	let sai = 0;
	for (const c of ca) {
		// F8 neo (ve-sinh-do-san-onehub): suaTam dung vat tren ban sao (commit tam / bo nho), khong ghi cay lam viec.
		const loi = suaTam(c.tep, c.doi, (v) => kiem(v).filter(Boolean));
		const dat = loi.some((l) => l.startsWith(c.cho));
		console.log(
			`tu-thu ${c.ten}: ${dat ? "do dung" : "KHONG DO"} — ${loi.join(" | ")}`,
		);
		if (!dat) sai += 1;
	}
	process.exit(sai === 0 ? 1 : 3);
}

const v = docVatThat();
const loi = kiem(v);
const ten = ["muc 1", "muc 2", "muc 3", "muc 4", "muc 5", "muc 6", "ranh gioi"];
for (const [i, l] of loi.entries()) console.log(l ?? `${ten[i]}: dat`);
process.exit(loi.some(Boolean) ? 1 : 0);
