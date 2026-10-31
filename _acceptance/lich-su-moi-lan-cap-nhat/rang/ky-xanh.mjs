import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NHANH_GOC = "origin/onehub";
const NAM_TEP = [
	"okr-sheet.dom.tsx",
	"moi-kr-ca-cong-ty.dom.tsx",
	"hop-tuan-tren-bang.dom.tsx",
	"hop-cap-nhat-lan-truoc.dom.tsx",
	"cap-nhat-gan-day.dom.tsx",
	"ve-khung-muc-tieu-dung-kr.dom.tsx",
	"cap-nhat-trong-ngan-kr.dom.tsx",
];
const NGOAI_DANH_SACH = new Set([
	"ngan-kr-mot-cho.dom.tsx",
	"lich-su-moi-lan-cap-nhat.dom.tsx",
]);
const MAU_MOI = /okr\.dienBien|dienBienOutput/;
const TRAN_TEP_MS = 10 * 60_000;
const MA_DO = 1;
const MA_KHONG_DO = 2;

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function tapMoiDienBien() {
	const thu = join(GOC, "apps", "app", "test");
	return readdirSync(thu)
		.filter((f) => f.endsWith(".dom.tsx") && !NGOAI_DANH_SACH.has(f))
		.filter((f) => MAU_MOI.test(readFileSync(join(thu, f), "utf8")))
		.sort();
}

function chayTep(goc, tep) {
	const r = spawnSync(
		"bun",
		[
			"test",
			"--timeout",
			"20000",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			`./test/${tep}`,
		],
		{
			cwd: join(goc, "apps", "app"),
			encoding: "utf8",
			timeout: TRAN_TEP_MS,
			maxBuffer: 64 * 1024 * 1024,
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
		},
	);
	return r.status ?? MA_KHONG_DO;
}

function dungNen() {
	const tam = mkdtempSync(join(tmpdir(), "lsml-ky-xanh-"));
	const cay = join(tam, "crm");
	const coSo = git(["merge-base", "HEAD", NHANH_GOC]);
	git(["worktree", "add", "--detach", "--quiet", cay, coSo]);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(env, join(cay, ".env"));
	execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
		cwd: cay,
		stdio: "inherit",
	});
	execFileSync("bun", ["run", "db:generate"], {
		cwd: join(cay, "packages", "db"),
		stdio: "ignore",
	});
	return { tam, cay };
}

function donNen({ tam, cay }) {
	spawnSync("git", ["worktree", "remove", "--force", cay], { cwd: GOC });
	rmSync(tam, { recursive: true, force: true });
	spawnSync("git", ["worktree", "prune"], { cwd: GOC });
}

try {
	const tap = tapMoiDienBien();
	if (JSON.stringify(tap) !== JSON.stringify([...NAM_TEP].sort())) {
		console.log(
			`danh sach lech: grep ra ${tap.join(",")} · viet truoc ${NAM_TEP.join(",")}`,
		);
		process.exit(MA_KHONG_DO);
	}
	console.log(`DUNG doi chung danh sach: ${tap.length} tep khop grep`);
	const hong = [];
	let xanh = 0;
	for (const tep of NAM_TEP) {
		const ma = chayTep(GOC, tep);
		console.log(`TEP ${tep}: cay ${ma}`);
		if (ma === 0) xanh += 1;
		else hong.push(tep);
	}
	let sai = 0;
	if (hong.length > 0) {
		const nen = dungNen();
		try {
			for (const tep of hong) {
				const ma = chayTep(nen.cay, tep);
				if (ma === 0) {
					sai += 1;
					console.log(`SAI AC-10: KY DO ${tep} (cay do · nen 0)`);
				} else console.log(`DO SAN TREN NEN ${tep} (nen ${ma})`);
			}
		} finally {
			donNen(nen);
		}
	}
	console.log(`ky xanh: ${xanh}/${NAM_TEP.length}`);
	console.log(`KET LUAN ky-xanh: ${sai === 0 ? "dat" : `${sai} SAI`}`);
	process.exit(sai === 0 ? 0 : MA_DO);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	process.exit(MA_KHONG_DO);
}
