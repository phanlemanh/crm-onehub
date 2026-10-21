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
	"man-bo-okr.mjs",
	"man-bo-okr-du-lieu.mjs",
	"man-bo-okr-do.mjs",
	"man-bo-okr-chieu-do.mjs",
].map((t) => join(HERE, t));
const LENH =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"';
const TEN_CAY_SAO = "tbo-sao";
const KHU = "apps/app/app/(app)/[slug]/okr/theo-don-vi";
const TEP = {
	trang: `${KHU}/page.tsx`,
	danhSach: `${KHU}/danh-sach-bo.tsx`,
	theCon: `${KHU}/the-con.tsx`,
	viec: `${KHU}/viec-cua-bo.tsx`,
};

const VET = {
	"bo-danh-sach": {
		eval: "E2",
		tep: TEP.trang,
		cu: "\tconst laDanhSach =\n\t\tthamSo[SEARCH_PARAM.okr.don] === null &&\n\t\tthamSo[SEARCH_PARAM.okr.xem] === null;",
		moi: "\tconst laDanhSach = false;",
		ghim: /SAI AC-1: DANH SACH/,
	},
	"loc-khong-url": {
		eval: "E4",
		tep: TEP.danhSach,
		cu: 'import { useQueryState } from "nuqs";',
		moi: [
			'import { useQueryState as useQueryStateUrl } from "nuqs";',
			'import { useState } from "react";',
			"function useQueryState(khoa, parser) {",
			"\tconst url = useQueryStateUrl(khoa, parser);",
			'\tconst [tam, datTam] = useState("tat-ca");',
			'\treturn khoa === SEARCH_PARAM.okr.phamViBo ? [tam, (v) => datTam(v ?? "tat-ca")] : url;',
			"}",
		].join("\n"),
		ghim: /SAI AC-2: LOC \S+: tai lai mat/,
	},
	"rong-khong-cau": {
		eval: "E4",
		tep: TEP.danhSach,
		cu: "{boLoc.length === 0 ? (",
		moi: "{false ? (",
		ghim: /SAI AC-2: LOC rong/,
	},
	"bo-goc-trong-url": {
		eval: "E5",
		tep: TEP.danhSach,
		cu: "const q = new URLSearchParams({ [SEARCH_PARAM.okr.don]: don });",
		moi: 'const q = new URLSearchParams(don === "goc" ? {} : { [SEARCH_PARAM.okr.don]: don });',
		ghim: /SAI AC-3: MO BO goc/,
	},
	"the-bo-ky": {
		eval: "E7",
		tep: TEP.theCon,
		cu: "if (ky) q.set(SEARCH_PARAM.okr.ky, ky);",
		moi: "",
		ghim: /SAI AC-5: THE \S+: ky mat/,
	},
	"viec-phang": {
		eval: "E9",
		tep: TEP.viec,
		cu: "{ds.data.nhom.map((n) => (",
		moi: '{[{ kr: { id: "", ten: "", mucTieu: { id: "", ten: "" } }, viec: ds.data.nhom.flatMap((x) => x.viec) }].map((n) => (',
		ghim: /SAI AC-6: VIEC .+: nhom/,
	},
	"cu-xem-ve-danh-sach": {
		eval: "E10",
		tep: TEP.trang,
		cu: "\t\tthamSo[SEARCH_PARAM.okr.don] === null &&\n\t\tthamSo[SEARCH_PARAM.okr.xem] === null;",
		moi: "\t\tthamSo[SEARCH_PARAM.okr.don] === null;",
		ghim: /SAI AC-7: CU xem-khong-don/,
	},
	"bang-o-hep": {
		eval: "E12",
		tep: TEP.danhSach,
		cu: '<div className="hidden md:block" data-bang-bo="">',
		moi: '<div className="block" data-bang-bo="">',
		ghim: /SAI AC-8: HEP danh-sach/,
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
	const tam = mkdtempSync(join(tmpdir(), `tbo-${ten}-`));
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
