import { execFileSync, spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	openSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { createServer as netCreateServer } from "node:net";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);

export function congTrong() {
	const may = netCreateServer();
	may.listen(0, "127.0.0.1");
	const cong = may.address().port;
	may.close();
	return cong;
}

export const CONG_SAO = Number(process.env.CONG_SAO ?? 0) || congTrong();
export const CONG_API_SAO =
	Number(process.env.CONG_API_SAO ?? 0) || congTrong();
export const APP_SAO = `http://localhost:${CONG_SAO}`;
export const API_SAO = `http://localhost:${CONG_API_SAO}`;
export const CHO_HMR = Number(process.env.CHO_HMR ?? 6000);
export const CHO_MAY_CHU = Number(process.env.CHO_MAY_CHU ?? 120000);

import { CHAN_UI, chanHoSo, DOT_BIEN } from "./bang-dot-bien.mjs";

export function cho(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

export const TIEN_TO_SAO = ".pha-thu-khai-tieng-";

export function kiemDuongSao(sao) {
	const duong = resolve(sao);
	const ten = basename(duong);
	const tuChoi = (vi_sao) => {
		console.log(
			`[xoa-tu-choi] ${duong}\n` +
				`   ${vi_sao}\n` +
				"   rmSync de quy tren mot duong lay thang tu bien moi truong, khong kiem gi,\n" +
				"   la mot lenh xoa sach thu muc dang cho mot cu go nham CAY_SAO.",
		);
		process.exit(2);
	};
	if (!ten.startsWith(TIEN_TO_SAO)) {
		tuChoi(`Ten thu muc khong mang tien to ${JSON.stringify(TIEN_TO_SAO)}.`);
	}
	if (duong === GOC || `${GOC}/`.startsWith(`${duong}/`)) {
		tuChoi("Duong nay BANG hoac CHUA goc kho dang xet.");
	}
	if (existsSync(duong)) {
		const ra = execFileSync(
			"git",
			["-C", GOC, "worktree", "list", "--porcelain"],
			{
				encoding: "utf8",
			},
		);
		const la = ra
			.split("\n")
			.filter((d) => d.startsWith("worktree "))
			.map((d) => resolve(d.slice("worktree ".length)));
		if (!la.includes(duong)) {
			tuChoi(
				"Duong nay TON TAI nhung khong phai worktree do script nay dang ky.\n" +
					"   No la mot thu muc that cua ai do, khong phai ban sao dung mot lan.",
			);
		}
	}
	return duong;
}

export function dungCaySao() {
	const sao =
		process.env.CAY_SAO ?? join(GOC, "..", `${TIEN_TO_SAO}${process.pid}`);
	kiemDuongSao(sao);
	if (process.env.CHI_KIEM_DUONG === "1") {
		console.log(`[chi-kiem-duong] duong ${sao} di qua duoc phep kiem.`);
		process.exit(0);
	}
	if (existsSync(sao)) rmSync(sao, { recursive: true, force: true });
	execFileSync(
		"git",
		["-C", GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD"],
		{
			encoding: "utf8",
		},
	);
	symlinkSync(join(GOC, ".env"), join(sao, ".env"));

	const canNhan = ["node_modules"];
	for (const g of ["apps", "packages"]) {
		for (const t of readdirSync(join(GOC, g), { withFileTypes: true })) {
			if (t.isDirectory() && existsSync(join(GOC, g, t.name, "node_modules"))) {
				canNhan.push(join(g, t.name, "node_modules"));
			}
		}
	}
	for (const them of ["packages/db/src/generated", "apps/app/.next/types"]) {
		if (existsSync(join(GOC, them))) canNhan.push(them);
	}
	for (const ten of canNhan) {
		const dich = join(sao, ten);
		if (existsSync(dich)) rmSync(dich, { recursive: true, force: true });
		execFileSync("mkdir", ["-p", dirname(dich)], { encoding: "utf8" });
		execFileSync("cp", ["-c", "-R", join(GOC, ten), dich], {
			encoding: "utf8",
		});
	}
	console.log(
		`   nhan ban ${canNhan.length} thu muc bang clonefile — node_modules cua goc va tung goi,\n` +
			"   cong packages/db/src/generated (client Prisma bi gitignore nen worktree khong mang theo).\n" +
			"   Khong dung symlink: Turbopack tu choi symlink tro ra ngoai goc du an.",
	);
	return sao;
}

export function donCaySao(sao) {
	kiemDuongSao(sao);
	try {
		execFileSync("git", ["-C", GOC, "worktree", "remove", "--force", sao], {
			encoding: "utf8",
		});
	} catch {
		rmSync(sao, { recursive: true, force: true });
	}
	try {
		execFileSync("git", ["-C", GOC, "worktree", "prune"], { encoding: "utf8" });
	} catch {}
}

export async function song(url) {
	try {
		await fetch(url, { method: "HEAD" });
		return true;
	} catch {
		return false;
	}
}

export async function dungMayChu(sao) {
	const moi_truong = {
		...process.env,
		NEXT_PUBLIC_API_URL: API_SAO,
		API_URL: API_SAO,
	};
	const api = spawn("bun", ["run", "dev"], {
		cwd: join(sao, "apps/api"),
		env: { ...moi_truong, PORT: String(CONG_API_SAO) },
		stdio: [
			"ignore",
			openSync(join(sao, "api-sao.log"), "w"),
			openSync(join(sao, "api-sao.log"), "a"),
		],
		detached: false,
	});
	const app = spawn("bun", ["run", "dev"], {
		cwd: join(sao, "apps/app"),
		env: { ...moi_truong, PORT: String(CONG_SAO) },
		stdio: [
			"ignore",
			openSync(join(sao, "app-sao.log"), "w"),
			openSync(join(sao, "app-sao.log"), "a"),
		],
		detached: false,
	});

	const han = Date.now() + CHO_MAY_CHU;
	while (Date.now() < han) {
		if ((await song(APP_SAO)) && (await song(API_SAO))) {
			return { api, app };
		}
		await cho(2000);
	}
	api.kill();
	app.kill();
	const log = (t) => {
		try {
			return readFileSync(join(sao, t), "utf8")
				.split("\n")
				.slice(-12)
				.join("\n");
		} catch {
			return "(khong doc duoc)";
		}
	};
	throw new Error(
		`KHONG DUNG DUOC MAY CHU cho ban sao sau ${CHO_MAY_CHU / 1000} giay (${APP_SAO} · ${API_SAO})\n` +
			`--- api-sao.log ---\n${log("api-sao.log")}\n--- app-sao.log ---\n${log("app-sao.log")}`,
	);
}

export function chay({ lenh, doi_so, duoi }, sao, moi_truong = {}) {
	const r = spawnSync(lenh, doi_so, {
		cwd: duoi ? join(sao, duoi) : sao,
		encoding: "utf8",
		env: { ...process.env, APP_URL: APP_SAO, API_URL: API_SAO, ...moi_truong },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
