import { execFileSync, spawn } from "node:child_process";
import {
	mkdtempSync,
	openSync,
	readFileSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

export const GOC_THAT = resolve(HERE, "../../..");
export const CONG_SAO = Number(process.env.CONG_SAO ?? 3200);

const CHO_MAY_CHU_GIAY = 180;

const MUON_NODE_MODULES = [
	"",
	"apps/agent/",
	"apps/api/",
	"apps/app/",
	"packages/auth/",
	"packages/db/",
	"packages/env/",
	"packages/telemetry/",
	"packages/ui/",
	"packages/validation/",
];

async function song(url, giay) {
	const han = Date.now() + giay * 1000;
	while (Date.now() < han) {
		try {
			const r = await fetch(url, { redirect: "manual" });
			if (r.status > 0) return true;
		} catch {}
		await new Promise((r) => setTimeout(r, 500));
	}
	return false;
}

export async function dungBanSao({ sua, khongDungMayChu = false }) {
	const hom = mkdtempSync(join(tmpdir(), "ban-sao-"));
	const goc = join(hom, "crm");
	execFileSync("git", ["worktree", "add", "--detach", goc, "HEAD"], {
		cwd: GOC_THAT,
		stdio: "pipe",
	});

	let may = null;

	const don = async () => {
		if (may && may.exitCode === null) {
			may.kill("SIGTERM");
			await new Promise((r) => setTimeout(r, 800));
			if (may.exitCode === null) may.kill("SIGKILL");
		}
		try {
			execFileSync("git", ["worktree", "remove", "--force", goc], {
				cwd: GOC_THAT,
				stdio: "pipe",
			});
		} catch {}
		rmSync(hom, { recursive: true, force: true });
	};

	try {
		symlinkSync(`${GOC_THAT}/.env`, `${goc}/.env`);
		execFileSync(
			"cp",
			[
				"-Rc",
				`${GOC_THAT}/packages/db/src/generated`,
				`${goc}/packages/db/src/generated`,
			],
			{ stdio: "pipe" },
		);
		for (const d of MUON_NODE_MODULES) {
			execFileSync(
				"cp",
				["-Rc", `${GOC_THAT}/${d}node_modules`, `${goc}/${d}node_modules`],
				{ stdio: "pipe" },
			);
		}
		await sua(goc);

		if (khongDungMayChu) return { goc, cong: CONG_SAO, app: null, don };

		const log = openSync(join(hom, "may-chu.log"), "a");
		may = spawn("bun", ["run", "dev", "--port", String(CONG_SAO)], {
			cwd: join(goc, "apps/app"),
			stdio: ["ignore", log, log],
		});

		const app = `http://localhost:${CONG_SAO}`;
		if (!(await song(`${app}/sign-in`, CHO_MAY_CHU_GIAY))) {
			let vi_sao = "";
			try {
				vi_sao = readFileSync(join(hom, "may-chu.log"), "utf8")
					.trim()
					.split("\n")
					.slice(-12)
					.join("\n");
			} catch {}
			throw new Error(
				`ban sao khong tra loi o ${app} sau ${CHO_MAY_CHU_GIAY} giay.\n${vi_sao}`,
			);
		}

		return { goc, cong: CONG_SAO, app, don };
	} catch (loi) {
		await don();
		throw loi;
	}
}
