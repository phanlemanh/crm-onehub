import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TEP = ["apps/agent/test/slack-thieu-quyen-email.integration.spec.ts"];
const CA_GHIM = ["stqe-kenh", "stqe-tin-rieng"];
const MOC = "a62adb16";
const args = process.argv.slice(2);
const git = (...a) =>
	execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf8" });
const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : MOC;
const GHIM = args.includes("--ghim")
	? args[args.indexOf("--ghim") + 1]
	: "chat.postMessage=1";

const lenh = `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test ${TEP.map((t) => t.replace("apps/agent/", "")).join(" ")}`;

function chay(cwd) {
	const r = spawnSync("bun", ["run", "test", "--", lenh], {
		cwd,
		encoding: "utf8",
		env: process.env,
		maxBuffer: 256 * 1024 * 1024,
	});
	return { status: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function khoiDo(out, ca) {
	const dong = out.split("\n");
	const cuoi = dong.findIndex(
		(d) => d.trim().startsWith("(fail)") && d.includes(ca),
	);
	if (cuoi < 0) return null;
	let dau = cuoi - 1;
	while (dau >= 0 && !/^\((pass|fail|skip)\)/.test(dong[dau].trim())) dau--;
	return dong.slice(dau + 1, cuoi).join("\n");
}

const coNodeModules = [
	".",
	...["apps", "packages"].flatMap((d) =>
		readdirSync(join(ROOT, d)).map((x) => `${d}/${x}`),
	),
].filter((d) => existsSync(join(ROOT, d, "node_modules")));

const guong = mkdtempSync(join(tmpdir(), "slack-thieu-guong-"));
const loi = [];
try {
	git("worktree", "add", "--detach", guong, base);
	for (const t of TEP)
		writeFileSync(join(guong, t), readFileSync(join(ROOT, t)));
	for (const d of coNodeModules) {
		if (
			existsSync(join(guong, d)) &&
			!existsSync(join(guong, d, "node_modules"))
		) {
			symlinkSync(
				join(ROOT, d, "node_modules"),
				join(guong, d, "node_modules"),
			);
		}
	}
	mkdirSync(join(guong, "packages/db/src"), { recursive: true });
	if (!existsSync(join(guong, "packages/db/src/generated"))) {
		symlinkSync(
			join(ROOT, "packages/db/src/generated"),
			join(guong, "packages/db/src/generated"),
		);
	}
	if (!existsSync(join(guong, ".env"))) {
		symlinkSync(join(ROOT, ".env"), join(guong, ".env"));
	}

	const truoc = chay(guong);
	if (truoc.status === 0)
		loi.push("TRUOC VA KHONG DO: bo kiem xanh tren ma truoc va");
	for (const ca of CA_GHIM) {
		const khoi = khoiDo(truoc.out, ca);
		if (khoi === null) {
			loi.push(`TRUOC VA KHONG DO: ${ca}`);
		} else if (!khoi.includes(GHIM)) {
			loi.push(`TRUOC VA DO SAI LY DO: ${ca} khong thay ${GHIM}`);
		}
	}
	if (truoc.out.includes("Cannot find module")) {
		loi.push("TRUOC VA DO SAI LY DO: Cannot find module");
	}

	const sau = chay(ROOT);
	if (sau.status !== 0 || /\(fail\)/.test(sau.out)) loi.push("SAU VA CON DO");
	console.log(
		`truoc va (${base.slice(0, 8)}): exit ${truoc.status} · sau va: exit ${sau.status}`,
	);
} finally {
	try {
		git("worktree", "remove", "--force", guong);
	} catch {}
	rmSync(guong, { recursive: true, force: true });
}

if (loi.length) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log(`do-truoc-khi-va: do truoc va (${base}), xanh sau va`);
