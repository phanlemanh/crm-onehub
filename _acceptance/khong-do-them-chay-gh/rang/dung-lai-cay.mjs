import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bat, GOC, Ket, khongDoDuoc, moiTruongSach } from "./nen.mjs";

const BAO_DAM = {
	B1: "cay mat giua lan va phan loai",
	B2: "lan de cay ban o tep khac giua hai sha",
	B3: "lan de cay ban o tep giong nhau giua hai sha",
	B4: "lenh git loi -> ly_do",
};
const DUNG_LAI = [
	"\t} catch {\n\t\treturn dungCay({ git, goc, cay, sha, chay });\n\t}",
	"\t} catch (e) {\n\t\tthrow e;\n\t}",
];
const FORCE_CHECKOUT = [
	'git("-C", cay, "checkout", "--detach", "--force", "-q", sha);',
	'git("-C", cay, "checkout", "--detach", "-q", sha);',
];
const FORCE_WORKTREE = [
	'git("worktree", "add", "--detach", "--force", "-q", cay, sha);',
	'git("worktree", "add", "--detach", "-q", cay, sha);',
];
const DONG_LOI = [
	"ly_do: `git fetch ${ref} loi: ${dongLoi(e)}`,",
	'ly_do: `git fetch ${ref} loi: ${String(e.message).split("\\n")[0]}`,',
];
const MANH = [
	{ ten: "doi-chung-guong", thay: [], fail: null },
	{ ten: "a-bo-dung-lai", thay: [DUNG_LAI], fail: "B1" },
	{ ten: "c-bo-force-worktree", thay: [FORCE_WORKTREE], fail: "B1" },
	{
		ten: "e-bo-dung-lai-va-force-checkout",
		thay: [DUNG_LAI, FORCE_CHECKOUT],
		fail: "B2",
	},
	{ ten: "b-bo-force-checkout", thay: [FORCE_CHECKOUT], fail: "B3" },
	{ ten: "d-bo-dong-loi", thay: [DONG_LOI], fail: "B4" },
];
const ket = new Ket();

function chayBon(goc) {
	const mau = Object.values(BAO_DAM).flatMap((t) => [
		"--test-name-pattern",
		t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
	]);
	const r = spawnSync(
		"node",
		[
			"--test",
			"--test-reporter=tap",
			...mau,
			join(goc, "scripts", "kiem-cheo", "test", "dem.test.mjs"),
		],
		{
			cwd: goc,
			encoding: "utf8",
			env: moiTruongSach(),
			maxBuffer: 64 * 1024 * 1024,
		},
	);
	const chu = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	const so = (ten) =>
		Number(new RegExp(`^# ${ten} (\\d+)$`, "m").exec(chu)?.[1] ?? Number.NaN);
	const notOk = chu.split("\n").filter((d) => /^\s*not ok \d+ - /.test(d));
	return { ma: r.status, pass: so("pass"), fail: so("fail"), notOk };
}

const lanh = chayBon(GOC);
ket.kiem(
	lanh.pass === 4 && lanh.fail === 0,
	`ban lanh: pass ${lanh.pass}, fail ${lanh.fail}`,
	`ma ${lanh.ma}, not ok: ${lanh.notOk.join(" | ")}`,
);

const nguon = readFileSync(
	join(GOC, "scripts", "kiem-cheo", "dem.mjs"),
	"utf8",
);
const coBat = new Set();
for (const m of MANH) {
	const tam = mkdtempSync(join(realpathSync(tmpdir()), `f26-guong-${m.ten}-`));
	try {
		cpSync(
			join(GOC, "scripts", "kiem-cheo"),
			join(tam, "scripts", "kiem-cheo"),
			{ recursive: true },
		);
		cpSync(join(GOC, "lib"), join(tam, "lib"), { recursive: true });
		cpSync(
			join(GOC, "scripts", "resolve-plugin.mjs"),
			join(tam, "scripts", "resolve-plugin.mjs"),
		);
		let chu = nguon;
		for (const [cu, moi] of m.thay) {
			if (!chu.includes(cu))
				khongDoDuoc(
					`${m.ten}: khong tim thay «${cu.split("\n")[0].trim()}» trong dem.mjs`,
				);
			chu = chu.replace(cu, moi);
		}
		writeFileSync(join(tam, "scripts", "kiem-cheo", "dem.mjs"), chu);
		const r = chayBon(tam);
		if (m.fail === null) {
			ket.kiem(
				r.pass === 4 && r.fail === 0,
				`doi-chung-duong ban guong khong doi: pass ${r.pass}, fail ${r.fail}`,
				`ma ${r.ma}, not ok: ${r.notOk.join(" | ")}`,
			);
			if (r.pass !== 4 || r.fail !== 0)
				khongDoDuoc(
					"ban guong khong doi khong xanh — guong thieu tep, phep pha khong do duoc",
				);
			continue;
		}
		const trung = r.notOk.some((d) => d.includes(BAO_DAM[m.fail]));
		if (trung) coBat.add(m.fail);
		bat(
			ket,
			m.ten,
			trung,
			`${m.fail} khong fail; not ok: ${r.notOk.join(" | ") || "khong"}`,
		);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}
for (const b of Object.keys(BAO_DAM))
	ket.kiem(
		coBat.has(b),
		`bao dam ${b} co chieu do`,
		`bao dam ${b} khong co chieu do`,
	);
ket.ket();
