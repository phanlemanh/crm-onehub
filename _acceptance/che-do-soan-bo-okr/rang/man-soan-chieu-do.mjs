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
import { KARA_GIA } from "./man-soan-du-lieu.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RANG = "_acceptance/che-do-soan-bo-okr/rang";
const CHEP = [
	"man-soan.mjs",
	"man-soan-du-lieu.mjs",
	"man-soan-do.mjs",
	"man-soan-chieu-do.mjs",
].map((t) => `${RANG}/${t}`);
const LENH = `bun scripts/lan-do/tien-de.mjs --chay "bun ${RANG}/man-soan.mjs"`;
const TEN_CAY_SAO = "vk10-sao";
const KHU = "apps/app/app/(app)/[slug]/okr";
const SOAN = `${KHU}/soan-bo`;

export const VET = {
	"chieu-do-mo": {
		eval: "E2",
		tep: `${SOAN}/use-bo-soan.ts`,
		cu: "? { cycleId: khoa.cycleId, unit: khoa.don, loc: LOC_TRONG }",
		moi: "? { cycleId: cycles.data?.currentId ?? khoa.cycleId, unit: khoa.don, loc: LOC_TRONG }",
		ghim: /SAI AC-1: MO/,
	},
	"chieu-do-viet": {
		eval: "E4",
		tep: `${SOAN}/use-ghi-ban-nhap.ts`,
		cu: ": taoKr.mutateAsync({",
		moi: ": new Promise(() => {}) ?? taoKr.mutateAsync({",
		ghim: /SAI AC-2: VIET/,
	},
	"chieu-do-hoan-tac": {
		eval: "E9",
		tep: `${KHU}/gop-y-kara.ts`,
		cu: "await suaKr.mutateAsync({ id: d.keyResultId, title: truoc });",
		moi: "void truoc;",
		ghim: /SAI AC-5: GOP Y/,
	},
	"chieu-do-bam": {
		eval: "E11",
		tep: `${SOAN}/cong-bo.tsx`,
		cu: "datBoTich(new Set());",
		moi: "datBoTich(new Set(ds.map((mt) => mt.id)));",
		ghim: /SAI AC-6: BAM \d+/,
	},
	"chieu-do-ngan": {
		eval: "E13",
		tep: "apps/app/components/crm/record-sheet/objective-sheet.tsx",
		cu: "<ChipKhung mt={mt} />",
		moi: '<ChipKhung mt={mt} />\n\t\t\t\t\t\t\t<section data-vung-kara="" />',
		ghim: /SAI AC-7: NGAN/,
	},
	"chieu-do-tran": {
		eval: "E16",
		tep: `${SOAN}/dong-kr.tsx`,
		cu: 'className="flex flex-wrap items-center gap-2">',
		moi: 'className="flex items-center gap-2 *:shrink-0">',
		ghim: /SAI AC-10: KHO 375/,
	},
	"chieu-do-xoa": {
		eval: "E20",
		tep: `${SOAN}/dong-muc-tieu.tsx`,
		cu: "\t\t\t\t\tdatHoi(false);\n\t\t\t\t\tonXoa();\n",
		moi: "\t\t\t\t\tdatHoi(false);\n",
		ghim: /SAI AC-3: XOA/,
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
	const tam = mkdtempSync(join(tmpdir(), `vk10-${ten}-`));
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

function chayTrongSao(sao, maEval) {
	const env = { ...process.env, ...KARA_GIA, EVAL: maEval };
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

export async function chayChieuDo(ten) {
	const v = VET[ten];
	if (!v) {
		console.log(
			`KHONG DO DUOC: chieu do «${ten ?? ""}» khong co — ${Object.keys(VET).join(", ")}`,
		);
		return 2;
	}
	console.log(`== ${ten} (${v.eval}): ${v.tep}`);
	const s = dungSao(ten);
	try {
		const duong = join(s.sao, v.tep);
		const truoc = readFileSync(duong, "utf8");
		if (truoc.split(v.cu).length - 1 !== 1) {
			console.log(
				`KET LUAN ${ten}: KHONG DO DUOC — vet khong cam duoc vao ${v.tep}`,
			);
			return 2;
		}
		writeFileSync(duong, truoc.replace(v.cu, v.moi));
		const { ma, ra } = await chayTrongSao(s.sao, v.eval);
		const ghim = ra.match(new RegExp(`${v.ghim.source}[^\\n]*`))?.[0] ?? null;
		if (ma === 1 && ghim) {
			console.log(`KET LUAN ${ten}: DO DUNG GHIM — ma 1, in «${ghim}»`);
			return 1;
		}
		console.log(
			`KET LUAN ${ten}: LOT — ma ${ma}, ${ghim ? `co «${ghim}»` : `khong thay ${v.ghim}`}`,
		);
		return ma === 0 ? 0 : 2;
	} finally {
		donSao(s);
	}
}
