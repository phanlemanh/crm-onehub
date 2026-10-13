import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CHE_DO = process.argv[2];
const MAU =
	"Trợ lý|trợ lý|Máy soạn|máy soạn|Máy góp ý|máy góp ý|Máy tóm tắt|máy tóm tắt|Máy ghi số|Máy chạy ở chế độ ẩn|Máy đang soạn|máy không đọc|Tác nhân nghiên cứu|tác nhân|Tác nhân|[Aa]ssistant|[Cc]omposer|[Yy]our agents?";
const DUOI = /\.(spec\.ts|dom\.tsx|test\.ts|spec\.tsx)$/;

const NHOM = {
	"--app": ["apps/app/test"],
	"--may": [
		"apps/agent/test",
		"apps/api/test",
		"packages/validation/test",
		"packages/ui/test",
	],
};

if (!NHOM[CHE_DO]) {
	process.stderr.write("dung: bai-cu.mjs --app|--may\n");
	process.exit(2);
}

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
const goc = git("merge-base", "HEAD", "origin/onehub");

function baiCu(thuMuc) {
	const ra = spawnSync(
		"git",
		["-C", GOC, "grep", "-l", "-E", MAU, goc, "--", thuMuc],
		{
			encoding: "utf8",
		},
	);
	return ra.stdout
		.split("\n")
		.map((d) => d.replace(`${goc}:`, ""))
		.filter((t) => DUOI.test(t) && git("ls-files", t) === t);
}

const chay = (lenh, cwd) =>
	spawnSync("bash", ["-c", lenh], { cwd, stdio: "inherit" }).status;

let hong = 0;
let dem = 0;
for (const thuMuc of NHOM[CHE_DO]) {
	const ds = baiCu(thuMuc);
	if (
		thuMuc === "apps/app/test" &&
		!ds.includes("apps/app/test/messages-guard.spec.ts")
	)
		ds.push("apps/app/test/messages-guard.spec.ts");
	if (ds.length === 0) continue;
	const goi = thuMuc.split("/").slice(0, 2).join("/");
	const tep = ds.map((t) => `./${relative(goi, t)}`);
	dem += ds.length;
	if (CHE_DO === "--app") {
		for (const t of tep) {
			const preload = t.endsWith(".tsx")
				? "--preload ../../packages/ui/test/setup-dom.ts "
				: "";
			const ma = chay(
				`TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ${preload}${t}`,
				join(GOC, goi),
			);
			if (ma !== 0) {
				hong += 1;
				process.stderr.write(`bai-cu: do ${goi}/${t}\n`);
			}
		}
	} else {
		const ma = chay(
			`bun run test -- "cd ${goi} && bun test ${tep.join(" ")}"`,
			GOC,
		);
		if (ma !== 0) {
			hong += 1;
			process.stderr.write(`bai-cu: do nhom ${goi}\n`);
		}
	}
}
process.stdout.write(`bai-cu ${CHE_DO}: ${dem} bai, ${hong} cho do\n`);
process.exit(hong === 0 ? 0 : 1);
