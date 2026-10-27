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
const THUOC = [
	"man-bo-okr-co-so.mjs",
	"man-bo-okr-co-so-du-lieu.mjs",
	"man-bo-okr-co-so-do.mjs",
	"man-bo-okr-co-so-chieu-do.mjs",
].map((t) => join(HERE, t));
const LENH =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/bo-okr-co-so/rang/man-bo-okr-co-so.mjs"';
const TEN_CAY_SAO = "bco-sao";
const KHU = "apps/app/app/(app)/[slug]/okr/theo-don-vi";
const TEP = {
	hangSo: `${KHU}/hang-so-bo.tsx`,
	bang: `${KHU}/bang.tsx`,
	dataTable: "packages/ui/src/components/data-table.tsx",
};

const VET = {
	"khoa-goc": {
		eval: "E1",
		tep: TEP.hangSo,
		cu: "trpc.okr.soBo.queryOptions({ cycleId, unit })",
		moi: 'trpc.okr.soBo.queryOptions({ cycleId, unit: { loai: "goc" } })',
		ghim: /SAI AC-1 (bp|pb):\S+: /,
	},
	"khong-mo-san": {
		eval: "E6",
		tep: TEP.bang,
		cu: "\t\tmoSan: true,\n",
		moi: "",
		ghim: /SAI AC-4 mo-san/,
	},
	"mo-moi-dong": {
		eval: "E6",
		tep: TEP.bang,
		cu: "isExpandable: (mt) => mt.keyResults.length > 0 && !laDaBo(mt),",
		moi: "isExpandable: () => true,",
		ghim: /SAI AC-4 (da-bo|khong-kr)/,
	},
	"gap-trong-state": {
		eval: "E8",
		tep: TEP.dataTable,
		cu: 'const [gapIds, setGapIds] = useQueryState(\n\t\t"gap",\n\t\tparseAsArrayOf(parseAsString).withDefault([]),\n\t);',
		moi: "const [gapIds, setGapIds] = useState<string[] | null>([]);",
		ghim: /SAI AC-5 tai-lai/,
	},
	"nhan-cat": {
		eval: "E11",
		tep: TEP.hangSo,
		cu: "label={o.nhan}",
		moi: 'label={<span className="block w-10 truncate">{o.nhan}</span>}',
		ghim: /SAI AC-8 375: .*nhan cat/,
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
	const tam = mkdtempSync(join(tmpdir(), `bco-${ten}-`));
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
