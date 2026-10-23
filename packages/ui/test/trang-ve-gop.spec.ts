import { afterAll, describe, expect, test } from "bun:test";
import { spawn, spawnSync } from "node:child_process";
import {
	chmodSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	utimesSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const GOC_KHO = resolve(import.meta.dir, "..", "..", "..");
const NGUON = process.env.TRANG_VE_NGUON ?? GOC_KHO;
const TEP_CHEP = [
	".gitattributes",
	".githooks/post-merge",
	".githooks/pre-commit",
	"scripts/trang-ve-gop.mjs",
];
const LENH_TAY = "node scripts/product-map.mjs --root .";

const BO_VE_GIA = `import { appendFileSync, readdirSync, writeFileSync } from "node:fs";
if (process.env.SO_VE) appendFileSync(process.env.SO_VE, "ve\\n");
if (process.env.VE_HONG) process.exit(1);
const ho = readdirSync("_acceptance").filter((d) => !d.startsWith(".")).sort();
const ds = ho.length + "\\n" + ho.join("\\n") + "\\n";
writeFileSync("PRODUCT-MAP.md", ds);
writeFileSync("LO-TRINH.html", ds);
`;

const TAC_GIA = {
	GIT_AUTHOR_NAME: "t",
	GIT_AUTHOR_EMAIL: "t@t",
	GIT_COMMITTER_NAME: "t",
	GIT_COMMITTER_EMAIL: "t@t",
};

const tam: string[] = [];
const CAU_HINH_RONG = join(
	realpathSync(mkdtempSync(join(tmpdir(), "trang-ve-cau-hinh-"))),
	"gitconfig",
);
writeFileSync(CAU_HINH_RONG, "");
tam.push(dirname(CAU_HINH_RONG));
afterAll(() => {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
});

type Kho = { d: string; goc: string; soVe: string };
type Ket = { ma: number; ra: string; loi: string };

function envSach(them: Record<string, string> = {}): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {};
	for (const [k, v] of Object.entries(process.env)) {
		if (v === undefined || k.startsWith("GIT_") || k === "CRM_SKIP_HOOKS")
			continue;
		env[k] = v;
	}
	Object.assign(
		env,
		TAC_GIA,
		{ GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: CAU_HINH_RONG },
		them,
	);
	return env;
}

function chay(
	goc: string,
	a: string[],
	them: Record<string, string> = {},
): Ket {
	const r = spawnSync("git", a, {
		cwd: goc,
		env: envSach(them),
		encoding: "utf8",
	});
	return {
		ma: r.status ?? -1,
		ra: (r.stdout ?? "").trim(),
		loi: (r.stderr ?? "").trim(),
	};
}

function git(goc: string, ...a: string[]): string {
	const r = chay(goc, a);
	if (r.ma !== 0) throw new Error(`git ${a.join(" ")} ma ${r.ma}: ${r.loi}`);
	return r.ra;
}

function ghi(goc: string, duong: string, chu: string): void {
	mkdirSync(dirname(join(goc, duong)), { recursive: true });
	writeFileSync(join(goc, duong), chu);
}

function veTay(k: Kho): void {
	spawnSync("node", ["scripts/product-map.mjs"], {
		cwd: k.goc,
		env: envSach(),
	});
}

function commit(k: Kho, ...tep: [string, string][]): string {
	for (const [d, c] of tep) ghi(k.goc, d, c);
	veTay(k);
	git(k.goc, "add", "-A");
	git(k.goc, "commit", "-q", "-m", "c");
	return git(k.goc, "rev-parse", "HEAD");
}

function dungKho(): Kho {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "trang-ve-")));
	tam.push(d);
	const goc = join(d, "kho");
	for (const t of TEP_CHEP) {
		mkdirSync(dirname(join(goc, t)), { recursive: true });
		copyFileSync(join(NGUON, t), join(goc, t));
	}
	chmodSync(join(goc, ".githooks/post-merge"), 0o755);
	chmodSync(join(goc, ".githooks/pre-commit"), 0o755);
	ghi(goc, "scripts/product-map.mjs", BO_VE_GIA);
	ghi(goc, "_acceptance/a/contract.md", "a\n");
	ghi(goc, ".gitignore", "node_modules\n");
	git(d, "init", "-q", "--template=", "-b", "onehub", goc);
	const k = { d, goc, soVe: join(d, "so-ve") };
	veTay(k);
	git(goc, "add", "-A");
	git(goc, "commit", "-q", "-m", "goc");
	git(goc, "config", "core.hooksPath", ".githooks");
	return k;
}

function haiNhanh(k: Kho): void {
	git(k.goc, "checkout", "-q", "-b", "nhanh");
	commit(k, ["_acceptance/b/contract.md", "b\n"]);
	git(k.goc, "checkout", "-q", "onehub");
	commit(k, ["_acceptance/z/contract.md", "z\n"]);
	git(k.goc, "checkout", "-q", "nhanh");
}

function gop(k: Kho, them: Record<string, string> = {}, ...a: string[]): Ket {
	return chay(k.goc, ["merge", "--no-edit", ...a, "onehub"], {
		SO_VE: k.soVe,
		...them,
	});
}

function trangHead(k: Kho): string {
	return git(k.goc, "show", "HEAD:PRODUCT-MAP.md");
}

function soLanVe(k: Kho): number {
	return existsSync(k.soVe)
		? readFileSync(k.soVe, "utf8").trim().split("\n").filter(Boolean).length
		: 0;
}

function xungDot(k: Kho): string[] {
	return git(k.goc, "diff", "--name-only", "--diff-filter=U")
		.split("\n")
		.filter(Boolean);
}

describe("khai", () => {
	test("khai: trang mang merge=union dung bang tep bo ve dung lai", () => {
		const d = realpathSync(mkdtempSync(join(tmpdir(), "trang-ve-khai-")));
		tam.push(d);
		const cay = join(d, "cay");
		git(NGUON, "worktree", "add", "-q", "--detach", cay, "HEAD");
		try {
			copyFileSync(join(NGUON, ".gitattributes"), join(cay, ".gitattributes"));
			const trang = readFileSync(join(cay, ".gitattributes"), "utf8")
				.split("\n")
				.map((l) => /^(\S+)\s.*\bmerge=union\b/.exec(l)?.[1])
				.filter(Boolean) as string[];
			for (const t of trang) rmSync(join(cay, t));
			const r = spawnSync("node", ["scripts/product-map.mjs", "--root", "."], {
				cwd: cay,
				env: envSach(),
				encoding: "utf8",
			});
			expect(r.status).toBe(0);
			const dung = trang.filter((t) => existsSync(join(cay, t)));
			expect(dung.sort()).toEqual(["LO-TRINH.html", "PRODUCT-MAP.md"]);
			expect(trang.sort()).toEqual(["LO-TRINH.html", "PRODUCT-MAP.md"]);
			const doi = git(cay, "diff", "--name-only", "HEAD")
				.split("\n")
				.filter(Boolean)
				.filter((t) => !trang.includes(t) && t !== ".gitattributes");
			expect(doi).toEqual([]);
		} finally {
			git(NGUON, "worktree", "remove", "--force", cay);
		}
	}, 300_000);

	test("khai: khong can cau hinh git", () => {
		const k = dungKho();
		expect(chay(k.goc, ["config", "--get-regexp", "^merge\\."]).ra).toBe("");
		git(k.goc, "config", "core.hooksPath", "/dev/null");
		haiNhanh(k);
		expect(gop(k).ma).toBe(0);
		expect(xungDot(k)).toEqual([]);
	});

	test("khai: khong thuoc tinh thi xung dot", () => {
		const k = dungKho();
		git(k.goc, "rm", "-q", ".gitattributes");
		git(k.goc, "commit", "-q", "-m", "bo thuoc tinh");
		git(k.goc, "config", "core.hooksPath", "/dev/null");
		haiNhanh(k);
		expect(gop(k).ma).toBe(1);
		expect(xungDot(k)).toContain("PRODUCT-MAP.md");
	});
});

describe("gop-tu-dong", () => {
	test("gop-tu-dong (a): hai nhanh them hai ho so", () => {
		const k = dungKho();
		haiNhanh(k);
		const cha = [
			git(k.goc, "rev-parse", "nhanh"),
			git(k.goc, "rev-parse", "onehub"),
		];
		const r = gop(k);
		expect(r.ma).toBe(0);
		expect(trangHead(k)).toBe("3\na\nb\nz");
		expect(git(k.goc, "show", "HEAD:LO-TRINH.html")).toBe("3\na\nb\nz");
		expect(
			git(k.goc, "rev-list", "--parents", "-n", "1", "HEAD")
				.split(" ")
				.slice(1),
		).toEqual(cha);
		expect(git(k.goc, "status", "--porcelain")).toBe("");
	});

	test("gop-tu-dong (b): loi va tac gia giu nguyen", () => {
		const k = dungKho();
		haiNhanh(k);
		const r = chay(k.goc, ["merge", "-m", "gop thu", "onehub"], {
			GIT_AUTHOR_NAME: "x",
			GIT_AUTHOR_EMAIL: "x@x",
		});
		expect(r.ma).toBe(0);
		expect(git(k.goc, "log", "-1", "--format=%B")).toBe("gop thu");
		expect(git(k.goc, "log", "-1", "--format=%an <%ae>")).toBe("x <x@x>");
		expect(git(k.goc, "log", "-1", "--format=%cn <%ce>")).toBe("t <t@t>");
		expect(trangHead(k)).toBe("3\na\nb\nz");
	});

	test("gop-tu-dong (c): trang da khop thi khong viet lai", () => {
		const k = dungKho();
		git(k.goc, "checkout", "-q", "-b", "nhanh");
		commit(k, ["src.txt", "1\n"]);
		git(k.goc, "checkout", "-q", "onehub");
		commit(k, ["_acceptance/z/contract.md", "z\n"]);
		git(k.goc, "checkout", "-q", "nhanh");
		const r = gop(k);
		expect(r.ma).toBe(0);
		expect(r.loi).not.toContain("đã vẽ lại");
		expect(git(k.goc, "reflog", "-1", "--format=%gs")).toContain(
			"Merge made by",
		);
		expect(trangHead(k)).toBe("2\na\nz");
	});
});

describe("gop-xung-dot", () => {
	function xungDotSrc(k: Kho): void {
		git(k.goc, "checkout", "-q", "-b", "nhanh");
		commit(k, ["_acceptance/b/contract.md", "b\n"], ["src.txt", "1\n"]);
		git(k.goc, "checkout", "-q", "onehub");
		commit(k, ["_acceptance/z/contract.md", "z\n"], ["src.txt", "2\n"]);
		git(k.goc, "checkout", "-q", "nhanh");
	}

	test("gop-xung-dot (a): chi tep that xung dot, commit mang trang dung", () => {
		const k = dungKho();
		xungDotSrc(k);
		expect(gop(k).ma).toBe(1);
		expect(xungDot(k)).toEqual(["src.txt"]);
		ghi(k.goc, "src.txt", "3\n");
		git(k.goc, "add", "src.txt");
		const r = chay(k.goc, ["commit", "--no-edit"], { SO_VE: k.soVe });
		expect(r.ma).toBe(0);
		expect(trangHead(k)).toBe("3\na\nb\nz");
		expect(
			git(k.goc, "rev-list", "--parents", "-n", "1", "HEAD").split(" ").length,
		).toBe(3);
	});

	test("gop-xung-dot (b): merge --no-commit roi commit", () => {
		const k = dungKho();
		haiNhanh(k);
		expect(gop(k, {}, "--no-commit").ma).toBe(0);
		const r = chay(k.goc, ["commit", "-m", "x"], { SO_VE: k.soVe });
		expect(r.ma).toBe(0);
		expect(trangHead(k)).toBe("3\na\nb\nz");
	});

	test("gop-xung-dot (c): commit thuong khong goi bo ve", () => {
		const k = dungKho();
		ghi(k.goc, "src.txt", "1\n");
		git(k.goc, "add", "src.txt");
		const r = chay(k.goc, ["commit", "-q", "-m", "thuong"], { SO_VE: k.soVe });
		expect(r.ma).toBe(0);
		expect(soLanVe(k)).toBe(0);
		expect(`${r.ra}${r.loi}`).toBe("");
	});
});

describe("an-toan", () => {
	test("an-toan (a): ho so chua commit khong lot vao trang", () => {
		const k = dungKho();
		haiNhanh(k);
		ghi(k.goc, "_acceptance/c/contract.md", "c\n");
		expect(gop(k).ma).toBe(0);
		expect(trangHead(k)).toBe("3\na\nb\nz");
	});

	test("an-toan (b): bo ve hong khong chan gop", () => {
		const k = dungKho();
		haiNhanh(k);
		const truoc = git(k.goc, "rev-parse", "nhanh");
		const r = gop(k, { VE_HONG: "1" });
		expect(r.ma).toBe(0);
		const dong = r.loi
			.split("\n")
			.filter((d) => d.startsWith("trang-ve:") && d.includes(LENH_TAY));
		expect(dong.length).toBe(1);
		expect(git(k.goc, "rev-parse", "HEAD^1")).toBe(truoc);
		expect(git(k.goc, "reflog", "-1", "--format=%gs")).toContain(
			"Merge made by",
		);
	});

	test("an-toan (c): bo ve hong o duong pre-commit khong chan commit", () => {
		const k = dungKho();
		haiNhanh(k);
		expect(gop(k, {}, "--no-commit").ma).toBe(0);
		const r = chay(k.goc, ["commit", "-m", "x"], { VE_HONG: "1" });
		expect(r.ma).toBe(0);
	});

	test("an-toan (d): khong con worktree tam", () => {
		const k = dungKho();
		haiNhanh(k);
		gop(k);
		git(k.goc, "reset", "-q", "--hard", "HEAD^1");
		gop(k, { VE_HONG: "1" });
		const ds = git(k.goc, "worktree", "list", "--porcelain")
			.split("\n")
			.filter((l) => l.startsWith("worktree "));
		expect(ds).toEqual([`worktree ${k.goc}`]);
	});

	test("an-toan (e): gop tua nhanh khong ve, khong in", () => {
		const k = dungKho();
		git(k.goc, "checkout", "-q", "-b", "nhanh");
		git(k.goc, "checkout", "-q", "onehub");
		commit(k, ["_acceptance/z/contract.md", "z\n"]);
		git(k.goc, "checkout", "-q", "nhanh");
		const r = chay(k.goc, ["merge", "-q", "--no-edit", "onehub"], {
			SO_VE: k.soVe,
		});
		expect(r.ma).toBe(0);
		expect(soLanVe(k)).toBe(0);
		expect(`${r.ra}${r.loi}`).toBe("");
	});

	test("an-toan (f): hook cua cay chay du checkout chinh co hook cu", () => {
		const k = dungKho();
		const chinh = join(k.d, "chinh-githooks");
		mkdirSync(chinh);
		const hookCu = readFileSync(
			join(NGUON, ".githooks/post-merge"),
			"utf8",
		).replace('node "$CAY/scripts/trang-ve-gop.mjs" sau-gop', 'echo "hook cu"');
		expect(hookCu).toContain("hook cu");
		writeFileSync(join(chinh, "post-merge"), hookCu);
		chmodSync(join(chinh, "post-merge"), 0o755);
		git(k.goc, "config", "core.hooksPath", chinh);
		haiNhanh(k);
		const r = gop(k);
		expect(`${r.ra}${r.loi}`).not.toContain("hook cu");
		expect(trangHead(k)).toBe("3\na\nb\nz");
	});
	test("an-toan (g): hook toan cuc chan khong chen vao buoc ve", () => {
		const k = dungKho();
		const hookToanCuc = join(k.d, "hook-toan-cuc");
		mkdirSync(hookToanCuc);
		for (const h of ["post-checkout", "pre-commit", "post-merge"]) {
			writeFileSync(
				join(hookToanCuc, h),
				'#!/bin/sh\necho "hook toan cuc"\nexit 1\n',
			);
			chmodSync(join(hookToanCuc, h), 0o755);
		}
		const cauHinh = join(k.d, "gitconfig-toan-cuc");
		writeFileSync(cauHinh, `[core]\n\thooksPath = ${hookToanCuc}\n`);
		git(k.goc, "config", "core.hooksPath", "/dev/null");
		haiNhanh(k);
		git(k.goc, "config", "--unset", "core.hooksPath");
		const r = chay(
			k.goc,
			["-c", "core.hooksPath=.githooks", "merge", "--no-edit", "onehub"],
			{
				GIT_CONFIG_GLOBAL: cauHinh,
			},
		);
		expect(r.ma).toBe(0);
		expect(`${r.ra}${r.loi}`).not.toContain("hook toan cuc");
		expect(`${r.ra}${r.loi}`).not.toContain("không vẽ lại được");
		expect(trangHead(k)).toBe("3\na\nb\nz");
	});

	test("an-toan (h): khoa ve dang giu thi cho, khoa cu thi bo", async () => {
		const k = dungKho();
		haiNhanh(k);
		const khoa = join(k.goc, ".git", "crm-trang-ve.lock");
		mkdirSync(khoa);
		const con = spawn("git", ["merge", "--no-edit", "onehub"], {
			cwd: k.goc,
			env: envSach({ SO_VE: k.soVe }),
		});
		let loi = "";
		con.stderr.on("data", (b) => {
			loi += String(b);
		});
		const xong = new Promise<number>((ok) =>
			con.on("close", (ma) => ok(ma ?? -1)),
		);
		await new Promise((ok) => setTimeout(ok, 2500));
		expect(soLanVe(k)).toBe(0);
		rmSync(khoa, { recursive: true });
		expect(await xong).toBe(0);
		expect(loi).toContain("chờ một lần vẽ khác trên máy");
		expect(trangHead(k)).toBe("3\na\nb\nz");
		expect(existsSync(khoa)).toBe(false);

		const k2 = dungKho();
		haiNhanh(k2);
		const khoa2 = join(k2.goc, ".git", "crm-trang-ve.lock");
		mkdirSync(khoa2);
		const cu = new Date(Date.now() - 16 * 60 * 1000);
		utimesSync(khoa2, cu, cu);
		expect(gop(k2).ma).toBe(0);
		expect(trangHead(k2)).toBe("3\na\nb\nz");
		expect(existsSync(khoa2)).toBe(false);
	}, 60_000);
	test("an-toan (i): tua nhanh toi mot commit gop co san thi khong ve, khong viet lai", () => {
		const k = dungKho();
		git(k.goc, "checkout", "-q", "-b", "nhanh");
		git(k.goc, "checkout", "-q", "-b", "phu", "onehub");
		commit(k, ["_acceptance/y/contract.md", "y\n"]);
		git(k.goc, "checkout", "-q", "onehub");
		commit(k, ["_acceptance/z/contract.md", "z\n"]);
		chay(k.goc, [
			"-c",
			"core.hooksPath=/dev/null",
			"merge",
			"--no-edit",
			"phu",
		]);
		const m = git(k.goc, "rev-parse", "onehub");
		expect(git(k.goc, "show", "onehub:PRODUCT-MAP.md")).not.toBe("3\na\ny\nz");
		git(k.goc, "checkout", "-q", "nhanh");
		git(k.goc, "reset", "-q", "--hard", "onehub^1");
		const r = gop(k);
		expect(r.ma).toBe(0);
		expect(git(k.goc, "rev-parse", "HEAD")).toBe(m);
		expect(soLanVe(k)).toBe(0);
		expect(r.loi).not.toContain("trang-ve:");
	});
});
