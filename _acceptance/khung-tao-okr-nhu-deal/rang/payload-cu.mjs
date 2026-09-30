import { execFileSync, spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = join(GOC, "_acceptance/khung-tao-okr-nhu-deal/rang/payload-cu.json");
const TRO = "apps/app/test/khung-tao-okr-payload.tsx";
const NOI_KET = [".env"];

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
const vi = process.argv.indexOf("--goc");
const goc = git(
	"merge-base",
	"HEAD",
	vi === -1 ? "origin/onehub" : process.argv[vi + 1],
);

const tam = mkdtempSync(join(tmpdir(), "payload-cu-"));
const cay = join(tam, "cay");
git("worktree", "add", "--detach", cay, goc);
let ma = 1;
try {
	for (const n of NOI_KET)
		if (existsSync(join(GOC, n)) && !existsSync(join(cay, n)))
			symlinkSync(join(GOC, n), join(cay, n));
	const cai = spawnSync("bun", ["install", "--frozen-lockfile"], {
		cwd: cay,
		encoding: "utf8",
	});
	if (cai.status !== 0)
		throw new Error(`bun install that bai: ${cai.stderr.slice(-400)}`);
	const sinh = spawnSync("bun", ["run", "db:generate"], {
		cwd: join(cay, "packages/db"),
		encoding: "utf8",
	});
	if (sinh.status !== 0)
		throw new Error(`prisma generate that bai: ${sinh.stderr.slice(-400)}`);
	copyFileSync(join(GOC, TRO), join(cay, TRO));
	const tep = join(tam, "payload.json");
	writeFileSync(
		join(cay, "apps/app/test/zz-payload-cu.dom.tsx"),
		`import { test } from "bun:test";
import { writeFileSync } from "node:fs";
import { bonPayload } from "./khung-tao-okr-payload";
const { HopThoaiMucTieu } = await import("@/app/(app)/[slug]/okr/hop-thoai-muc-tieu");
const { HopThoaiKr } = await import("@/app/(app)/[slug]/okr/hop-thoai-kr");
test("payload-cu", async () => {
	writeFileSync(${JSON.stringify(tep)}, JSON.stringify(await bonPayload({ HopThoaiMucTieu, HopThoaiKr })));
}, 120000);
`,
	);
	const kq = spawnSync(
		"bun",
		[
			"test",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			"./test/zz-payload-cu.dom.tsx",
		],
		{
			cwd: join(cay, "apps/app"),
			encoding: "utf8",
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
		},
	);
	if (kq.status !== 0 || !existsSync(tep)) {
		console.log(`${kq.stdout}${kq.stderr}`.split("\n").slice(-30).join("\n"));
		console.log(`khong lay duoc payload tren ${goc}`);
	} else {
		const payload = JSON.parse(readFileSync(tep, "utf8"));
		writeFileSync(
			RA,
			`${JSON.stringify({ nguon: goc, payload }, null, "\t")}\n`,
		);
		console.log(
			`da ghi payload cua hop cu (${goc.slice(0, 8)}): ${Object.keys(payload).join(", ")}`,
		);
		ma = 0;
	}
} finally {
	git("worktree", "remove", "--force", cay);
	rmSync(tam, { recursive: true, force: true });
}
process.exit(ma);
