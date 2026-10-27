import { execFileSync, spawn } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const CHEP = [
	"_acceptance/hop-tuan-tren-bang/rang/man.mjs",
	"_acceptance/hop-tuan-tren-bang/rang/man-chieu-do.mjs",
	"_acceptance/hop-tuan-tren-bang/rang/man-lib.mjs",
];
const LENH =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hop-tuan-tren-bang/rang/man.mjs --phan gui"';
const TEN_CAY_SAO = "htb-sao";

const VET = {
	"roi-bang": {
		tep: "apps/app/app/(app)/[slug]/okr/nut-cap-nhat-dong.tsx",
		cu: "\t\t\t\tmo(mt, krMt);\n",
		moi: '\t\t\t\twindow.location.assign(window.location.pathname.replace(/\\/okr\\/.*$/, "/okr/theo-don-vi"));\n',
		ghim: /SAI AC-4: roi bang/,
	},
};

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function readlinkOr(p) {
	try {
		return execFileSync("readlink", [p], { encoding: "utf8" }).trim() || p;
	} catch {
		return p;
	}
}

function dungSao(ten) {
	const tam = mkdtempSync(join(tmpdir(), `htb-${ten}-`));
	const sao = join(tam, "crm");
	git(["worktree", "add", "--detach", "--quiet", sao, "HEAD"]);
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(readlinkOr(env), join(sao, ".env"));
	execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
		cwd: sao,
		stdio: "inherit",
	});
	execFileSync("bun", ["run", "db:generate"], {
		cwd: join(sao, "packages", "db"),
		stdio: "ignore",
	});
	for (const t of CHEP) {
		const dich = join(sao, t);
		mkdirSync(dirname(dich), { recursive: true });
		writeFileSync(dich, readFileSync(join(GOC, t)));
	}
	return { tam, sao };
}

function donSao({ tam, sao }) {
	try {
		execFileSync("git", ["worktree", "remove", "--force", sao], {
			cwd: GOC,
			stdio: "ignore",
		});
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		execFileSync("git", ["worktree", "prune"], { cwd: GOC, stdio: "ignore" });
	} catch {}
}

function chayTrongSao(sao) {
	const env = { ...process.env };
	for (const k of [
		"DATABASE_URL",
		"APP_URL",
		"API_URL",
		"PHIEN_DO",
		"NEXT_PUBLIC_API_URL",
	])
		delete env[k];
	env.PHIEN_DO_TEN_CAY = TEN_CAY_SAO;
	return new Promise((xong) => {
		let ra = "";
		const con = spawn("bash", ["-c", LENH], {
			cwd: sao,
			env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		const ghi = (b) => {
			const s = b.toString();
			ra += s;
			process.stdout.write(s);
		};
		con.stdout.on("data", ghi);
		con.stderr.on("data", ghi);
		con.on("error", () => xong({ ma: 2, ra }));
		con.on("exit", (m) => xong({ ma: m ?? 2, ra }));
	});
}

export async function chayChieuDo(loai) {
	const ten = loai ?? "roi-bang";
	const v = VET[ten];
	if (!v) {
		console.log(
			`KHONG DO DUOC: chieu do «${ten}» khong co — ${Object.keys(VET).join(", ")}`,
		);
		return 2;
	}
	console.log(`== chieu do ${ten}: ${v.tep}`);
	const s = dungSao(ten);
	try {
		const duong = join(s.sao, v.tep);
		const truoc = readFileSync(duong, "utf8");
		if (truoc.split(v.cu).length - 1 !== 1) {
			console.log(`KET LUAN chieu do ${ten}: vet khong cam duoc vao ${v.tep}`);
			return 2;
		}
		writeFileSync(duong, truoc.replace(v.cu, v.moi));
		const { ma, ra } = await chayTrongSao(s.sao);
		const ghim = ra.match(v.ghim)?.[0] ?? null;
		if (ma === 1 && ghim) {
			console.log(
				`KET LUAN chieu do ${ten}: DO DUNG GHIM — ma 1, in «${ghim}»`,
			);
			return 1;
		}
		console.log(
			`KET LUAN chieu do ${ten}: LOT — ma ${ma}, ${ghim ? `co «${ghim}»` : `khong thay ${v.ghim}`}`,
		);
		return ma === 0 ? 0 : 2;
	} finally {
		donSao(s);
	}
}
