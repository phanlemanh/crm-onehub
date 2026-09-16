import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

export const GOC_THAT = resolve(HERE, "../../..");
export const CONG_SAO = Number(process.env.CONG_SAO ?? 3200);

const CHO_MAY_CHU_GIAY = 120;

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
		symlinkSync(`${GOC_THAT}/node_modules`, `${goc}/node_modules`);
		await sua(goc);

		if (khongDungMayChu) return { goc, cong: CONG_SAO, app: null, don };

		may = spawn("bun", ["run", "dev", "--port", String(CONG_SAO)], {
			cwd: join(goc, "apps/app"),
			stdio: "ignore",
		});

		const app = `http://localhost:${CONG_SAO}`;
		if (!(await song(`${app}/sign-in`, CHO_MAY_CHU_GIAY))) {
			throw new Error(
				`ban sao khong tra loi o ${app} sau ${CHO_MAY_CHU_GIAY} giay`,
			);
		}

		return { goc, cong: CONG_SAO, app, don };
	} catch (loi) {
		await don();
		throw loi;
	}
}
