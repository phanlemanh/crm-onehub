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
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const THUOC = ["man-gui.mjs", "man-gui-chieu-do.mjs"].map((t) => join(HERE, t));
const LENH =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs"';
const NHANH_GOC = "origin/onehub";
const BAM = "packages/ui/src/components/hang-hanh-dong-bam-day.tsx";
const CSS = "packages/ui/src/styles/globals.css";
const GOP = "apps/app/app/(app)/[slug]/okr/hoi-y/khoi-gop.tsx";

const VET = {
	"bo-bam": {
		eval: "E1",
		tep: BAM,
		cu: "max-md:sticky max-md:bottom-0 ",
		moi: "",
		ghim: /SAI AC-1: GUI 390 day \d+px/,
	},
	"bam-co-dinh": {
		eval: "E2",
		tep: BAM,
		cu: "max-md:sticky max-md:bottom-0",
		moi: "max-md:fixed max-md:inset-x-0 max-md:bottom-0",
		ghim: /SAI AC-2: .*hang che o/,
	},
	"bo-le": {
		eval: "E3",
		tep: BAM,
		cu: "vungCuon(hang)?.scrollBy({ top: thua });",
		moi: "",
		ghim: /SAI AC-3: TIEU DIEM \S+/,
	},
	"le-o": {
		eval: "E4B",
		tep: GOP,
		cu: 'khoiY.current?.scrollIntoView({ block: "nearest" });',
		moi: "",
		ghim: /SAI AC-4: GUI SAI \d+ da-cuon: .*day loi/,
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
	const tam = mkdtempSync(join(tmpdir(), `gdl-${ten}-`));
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
	for (const t of THUOC) {
		const dich = join(sao, relative(GOC, t));
		mkdirSync(dirname(dich), { recursive: true });
		writeFileSync(dich, readFileSync(t));
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

function chayTrongSao(sao, them) {
	const env = { ...process.env, ...them };
	for (const k of [
		"DATABASE_URL",
		"APP_URL",
		"API_URL",
		"PHIEN_DO",
		"NEXT_PUBLIC_API_URL",
	])
		delete env[k];
	env.PHIEN_DO_TEN_CAY = "gdl-sao";
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

export async function chayChieuDo(ten) {
	const v = VET[ten];
	if (!v) {
		console.log(
			`KHONG DO DUOC: chieu do «${ten ?? ""}» khong co — ${Object.keys(VET).join(", ")}`,
		);
		return 2;
	}
	console.log(`== chieu do ${ten}: ${v.tep}`);
	const s = dungSao(ten);
	try {
		const duong = join(s.sao, v.tep);
		const truoc = readFileSync(duong, "utf8");
		if (truoc.split(v.cu).length - 1 !== 1) {
			console.log(`chieu do: vet khong cam duoc vao ${v.tep}`);
			return 2;
		}
		writeFileSync(duong, truoc.replace(v.cu, v.moi));
		const { ma, ra } = await chayTrongSao(s.sao, { EVAL: v.eval });
		const ghim = ra.match(v.ghim)?.[0] ?? null;
		if (ma === 1 && ghim) {
			console.log(`chieu do: DO DUNG GHIM: ma 1, in «${ghim}»`);
			return 0;
		}
		console.log(
			`chieu do: LOT — ma ${ma}, ${ghim ? `co «${ghim}»` : `khong thay ${v.ghim}`}`,
		);
		return 1;
	} finally {
		donSao(s);
	}
}

export async function doGoc() {
	const s = dungSao("goc");
	try {
		const goc = git(["rev-parse", NHANH_GOC]);
		git(["checkout", goc, "--", "apps", "packages"], s.sao);
		const { ma, ra } = await chayTrongSao(s.sao, { GDL_GOC: "1" });
		const m = ra.match(/GOC MAY TINH: dinh Gui (-?\d+)px/);
		console.log(
			`goc ${goc.slice(0, 9)}: ma ${ma}${m ? ` · dinh Gui ${m[1]}px` : ""}`,
		);
		return ma === 0 && m ? Number(m[1]) : null;
	} finally {
		donSao(s);
	}
}
