import { execFileSync, spawn } from "node:child_process";
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
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RANG = "_acceptance/lich-su-moi-lan-cap-nhat/rang";
const LENH =
	'bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/lich-su-moi-lan-cap-nhat/rang/man.mjs"';
const TEN_CAY_SAO = "lsml-sao";

const VET = {
	"gom-tuan": {
		tep: "apps/app/components/crm/record-sheet/lich-su-kr.tsx",
		cu: "\tconst lan = [...d.lan].reverse();\n",
		moi: "\tconst lan = [...d.lan]\n\t\t.reverse()\n\t\t.filter((p, i, ds) => ds.findIndex((x) => x.tuan === p.tuan) === i);\n",
		ghim: /SAI AC-6: DONG \+2 \S+/,
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
	const tam = mkdtempSync(join(tmpdir(), `lsml-${ten}-`));
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
	mkdirSync(join(sao, RANG), { recursive: true });
	for (const tep of readdirSync(join(GOC, RANG)))
		writeFileSync(join(sao, RANG, tep), readFileSync(join(GOC, RANG, tep)));
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
		"BANG_CHUNG",
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

async function chayChieuDo(ten) {
	const v = VET[ten];
	if (!v) {
		console.log(
			`KET LUAN chieu do ${ten}: KHONG DO DUOC — chi co ${Object.keys(VET).join(", ")}`,
		);
		return 2;
	}
	console.log(`== chieu do ${ten}: ${v.tep}`);
	const s = dungSao(ten);
	try {
		const duong = join(s.sao, v.tep);
		const truoc = readFileSync(duong, "utf8");
		if (truoc.split(v.cu).length - 1 !== 1) {
			console.log(
				`KET LUAN chieu do ${ten}: KHONG DO DUOC — vet khong cam duoc vao ${v.tep}`,
			);
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

const i = process.argv.indexOf("--vet");
process.exit(await chayChieuDo(i === -1 ? "gom-tuan" : process.argv[i + 1]));
