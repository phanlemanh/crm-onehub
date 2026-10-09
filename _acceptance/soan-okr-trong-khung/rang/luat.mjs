import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
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
const CHU_MUC = ["phải", "trái", "Soạn OKR", "K5"];

const git = (...thamSo) =>
	execFileSync("git", thamSo, { cwd: goc, encoding: "utf8", maxBuffer: 64e6 });
const doc = (duong) => readFileSync(join(goc, duong), "utf8");

function nenGoc() {
	for (const ref of ["origin/onehub", "onehub"]) {
		try {
			return git("merge-base", "HEAD", ref).trim();
		} catch {}
	}
	throw new Error("khong tim duoc merge-base voi onehub");
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
	const thieu = CHU_MUC.filter((c) => !than.includes(c));
	return thieu.length === 0
		? null
		: `muc 5: muc kara o dau thieu chu ${thieu.join(", ")}`;
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
		else if (dong.startsWith("+") && !dong.startsWith("+++"))
			ra.push({ tep, chu: dong.slice(1) });
	}
	return ra;
}

function docVatThat() {
	const nen = nenGoc();
	const diff = git(
		"diff",
		"-U0",
		nen,
		"--",
		...KHU_KHONG_SO.map((k) => `${k}*.tsx`),
		`${SOAN}/**/*.tsx`,
	);
	const tepDiff = git("diff", "--name-only", nen).split("\n").filter(Boolean);
	const tepMoi = git(
		"diff",
		"--name-only",
		"--diff-filter=A",
		nen,
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
	const tepSoan = git("ls-files", "--", `${SOAN}/`)
		.split("\n")
		.filter((t) => /\.tsx?$/.test(t));
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

const v = docVatThat();
if (tuThu) {
	const ca = [
		{
			ten: "be ngang so",
			doi: {
				...v,
				dongThem: [
					...v.dongThem,
					{ tep: `${SOAN}/khung-soan.tsx`, chu: '<div className="w-[380px]">' },
				],
			},
			cho: "muc 1: be ngang so o cho goi",
		},
		{
			ten: "bo luat kara o dau",
			doi: {
				...v,
				aiUx: v.aiUx.replace(/^##[^\n]*Kara ở đâu/m, "## 11. Khác"),
			},
			cho: "muc 5: thieu luat kara o dau",
		},
		{
			ten: "tep ngoai ranh",
			doi: { ...v, tepDiff: [...v.tepDiff, "apps/api/src/okr/okr.router.ts"] },
			cho: "ranh gioi: ngoai ranh",
		},
	];
	let sai = 0;
	for (const c of ca) {
		const loi = kiem(c.doi).filter(Boolean);
		const dat = loi.some((l) => l.startsWith(c.cho));
		console.log(
			`tu-thu ${c.ten}: ${dat ? "do dung" : "KHONG DO"} — ${loi.join(" | ")}`,
		);
		if (!dat) sai += 1;
	}
	process.exit(sai === 0 ? 1 : 3);
}

const loi = kiem(v);
const ten = ["muc 1", "muc 2", "muc 3", "muc 4", "muc 5", "muc 6", "ranh gioi"];
for (const [i, l] of loi.entries()) console.log(l ?? `${ten[i]}: dat`);
process.exit(loi.some(Boolean) ? 1 : 0);
