import { afterAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
	chmodSync,
	existsSync,
	lstatSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import { GOM } from "../gom-cau-hinh.ts";
import {
	chayGom,
	DANH_TINH,
	dangKhoa,
	gitCauHinh,
	lenhKit,
} from "../gom-lich.ts";
import {
	banTiem,
	type ClaudeGia,
	claudeGia,
	donTam,
	dungKhoGom,
	type GhGia,
	g,
	ghGia,
	giaiKit,
	type KhoGom,
	sha,
	TEP_LO_TRINH,
	thuMuc,
} from "./gom-kho-tam.ts";

const AG = giaiKit();
const LAU = 180_000;
const DE_XUAT = `refs/heads/${GOM.nhanhDeXuat}`;
afterAll(donTam);

type Chay = typeof chayGom;
type Env = Record<string, string | undefined>;

const ngauNhien = (dau: string): string =>
	`${dau}${crypto.randomUUID().replaceAll("-", "")}`;

function boBiMat() {
	return {
		khoa: ngauNhien("sk-ant-thu"),
		token: ngauNhien("ghpthu"),
		gh: ngauNhien("ghothu"),
		github: ngauNhien("ghsthu"),
		khac: ngauNhien("bimatthu"),
	};
}

function can(dung: boolean, thongDiep: string, loi: string[]): void {
	if (!dung) loi.push(thongDiep);
}

const bang = <T>(a: Iterable<T>, b: Iterable<T>): boolean => {
	const x = new Set(a);
	const y = new Set(b);
	return x.size === y.size && [...x].every((v) => y.has(v));
};

const lay = (a: string[], co: string): string | undefined => {
	const i = a.indexOf(co);
	return i < 0 ? undefined : a[i + 1];
};

const ngayViet = (): string =>
	new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

const banGomDinh = (): string => `tin-hieu/gom/${ngayViet()}.md`;

function chayVoi(
	fn: Chay,
	kho: KhoGom,
	cl: ClaudeGia,
	gh: GhGia,
	env: Env,
): ReturnType<Chay> {
	return fn({
		goc: kho.goc,
		env: { AG, HOME: thuMuc("nha"), ...env },
		gh: gh.bin,
		claude: cl.bin,
		now: new Date(),
	});
}

function refs(origin: string): Map<string, string> {
	const r = spawnSync(
		"git",
		["for-each-ref", "--format=%(refname) %(objectname)"],
		{ cwd: origin, encoding: "utf8" },
	);
	return new Map(
		(r.stdout ?? "")
			.split("\n")
			.filter(Boolean)
			.map((l) => l.split(" ") as [string, string]),
	);
}

const refsBang = (a: Map<string, string>, b: Map<string, string>): boolean =>
	bang(
		[...a].map(([k, v]) => `${k} ${v}`),
		[...b].map(([k, v]) => `${k} ${v}`),
	);

function refsKhac(truoc: Map<string, string>, sau: Map<string, string>) {
	const bo = (m: Map<string, string>) =>
		[...m].filter(([k]) => k !== DE_XUAT).map(([k, v]) => `${k} ${v}`);
	return bang(bo(truoc), bo(sau));
}

const taoSua = (gh: GhGia) =>
	gh
		.nhatKy()
		.filter((a) => a[0] === "pr" && (a[1] === "create" || a[1] === "edit"));

function tepMang(thuMucGoc: string[], giaTri: string): string[] {
	const ra: string[] = [];
	const di = (p: string): void => {
		const st = lstatSync(p);
		if (st.isSymbolicLink()) return;
		if (st.isDirectory()) {
			for (const c of readdirSync(p)) di(path.join(p, c));
			return;
		}
		if (readFileSync(p).includes(giaTri)) ra.push(p);
	};
	for (const d of thuMucGoc) if (existsSync(d)) di(d);
	return ra;
}

function capGit(e: Env): Map<string, string> {
	const m = new Map<string, string>();
	const n = Number(e.GIT_CONFIG_COUNT ?? 0);
	for (let i = 0; i < n; i++) {
		const k = e[`GIT_CONFIG_KEY_${i}`];
		const v = e[`GIT_CONFIG_VALUE_${i}`];
		if (k !== undefined && v !== undefined) m.set(k, v);
	}
	return m;
}

async function kiemMoiTruong(fn: Chay): Promise<string[]> {
	const loi: string[] = [];
	const b = boBiMat();
	const kho = dungKhoGom();
	const cl = claudeGia("dung");
	const gh = ghGia();
	const nguon: Env = {
		ANTHROPIC_API_KEY: b.khoa,
		TIN_HIEU_TOKEN: b.token,
		GH_TOKEN: b.gh,
		GITHUB_TOKEN: b.github,
		BI_MAT_KHAC: b.khac,
	};
	await chayVoi(fn, kho, cl, gh, nguon);
	const e = cl.env();
	const tron: Env = { ...process.env, AG, HOME: "x", ...nguon };
	const mong = new Set([
		...GOM.moHinh.moiTruong.filter((k) => tron[k] !== undefined),
		...Object.keys(GOM.moHinh.hangMoiTruong),
		...Object.keys(gitCauHinh(GOM.gitLenh)),
		...Object.keys(DANH_TINH),
		"AG",
		GOM.moHinh.bienBanGom,
	]);
	can(
		bang(Object.keys(e), mong),
		"1 tap khoa env cua phien lech danh sach cho phep",
		loi,
	);
	can(
		!Object.values(e).some((v) =>
			[b.token, b.gh, b.github, b.khac].some((s) => v.includes(s)),
		),
		"phiên gom thấy token ghi kho",
		loi,
	);
	can(e.ANTHROPIC_API_KEY === b.khoa, "3 phien thieu khoa mo hinh", loi);
	can(
		e.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB === "1",
		"4 thieu co go khoa khoi lenh con",
		loi,
	);
	const cap = capGit(e);
	can(
		cap.get("core.hooksPath") === "/dev/null" &&
			cap.get("core.fsmonitor") === "false" &&
			cap.get("safe.bareRepository") === "explicit" &&
			e.GIT_CONFIG_GLOBAL === "/dev/null" &&
			e.GIT_CONFIG_NOSYSTEM === "1",
		"5 cau hinh git muc lenh cua phien thieu",
		loi,
	);
	can(
		!Object.keys(e).some((k) => k.startsWith("GITHUB_")),
		"6 phien co bien GITHUB_",
		loi,
	);
	return loi;
}

describe("gcg-moi-truong", () => {
	test(
		"gcg-moi-truong: 6 dong — phien chi cam khoa mo hinh",
		async () => {
			expect(await kiemMoiTruong(chayGom)).toEqual([]);
		},
		LAU,
	);
	test(
		"gcg-moi-truong: chieu do — truyen nguyen env",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "const env: NodeJS.ProcessEnv = {};",
					thanh: "const env: NodeJS.ProcessEnv = { ...o.nguon };",
				},
			]);
			expect(await kiemMoiTruong(fn)).toContain("phiên gom thấy token ghi kho");
		},
		LAU,
	);
});

function kiemSkill(
	gocDoc: string,
	agLuot: string,
	allow: string[],
	banGom: string,
	loTrinh: string[],
): string[] {
	const loi: string[] = [];
	for (const s of ["gom-tin-hieu", "cat-luot"]) {
		const txt = readFileSync(
			path.join(gocDoc, "skills", s, "SKILL.md"),
			"utf8",
		);
		const dau = txt.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
		const at = dau
			.split("\n")
			.find((d) => d.startsWith("allowed-tools:"))
			?.slice("allowed-tools:".length);
		const ds = (at ?? "")
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);
		if (ds.some((d) => !allow.includes(d)))
			loi.push("skill tự cấp quyền ngoài danh sách");
		for (const dong of txt.split("\n")) {
			const k = dong.match(/node "\$AG\/scripts\/([\w.-]+)" (.+)$/);
			if (!k) continue;
			const thamSo = (k[2] ?? "").trim();
			const cacLenh = thamSo.includes("<tệp lộ trình>")
				? loTrinh.map((lt) =>
						thamSo
							.replace("<bản phạm vi>", banGom)
							.replace("<tệp lộ trình>", lt),
					)
				: [thamSo];
			for (const a of cacLenh)
				if (
					!allow.includes(
						`Bash(node ${path.join(agLuot, "scripts", k[1] ?? "")} ${a})`,
					)
				)
					loi.push("skill bảo chạy lệnh chưa được phép");
		}
	}
	return [...new Set(loi)];
}

async function kiemLoiGoi(fn: Chay): Promise<{
	loi: string[];
	allow: string[];
	banGom: string;
}> {
	const loi: string[] = [];
	const kho = dungKhoGom();
	const cl = claudeGia("dung");
	const gh = ghGia();
	await chayVoi(fn, kho, cl, gh, { ANTHROPIC_API_KEY: ngauNhien("sk-ant") });
	const av = cl.argv() ?? [];
	const cd = cl.caiDat();
	const banGom = cl.env()[GOM.moHinh.bienBanGom] ?? "";
	const allow = cd?.permissions.allow ?? [];
	can(
		lay(av, "--permission-mode") === "dontAsk",
		"1 khong o che do dontAsk",
		loi,
	);
	can(
		bang((lay(av, "--tools") ?? "").split(","), [
			"Read",
			"Glob",
			"Grep",
			"Edit",
			"Write",
			"Skill",
			"Bash",
		]),
		"2 tap cong cu sai",
		loi,
	);
	const cam = (lay(av, "--disallowedTools") ?? "").split(",");
	can(
		["WebFetch", "WebSearch", "mcp__*"].every((c) => cam.includes(c)) &&
			av.includes("--strict-mcp-config"),
		"3 cong cu mang hay MCP chua tat",
		loi,
	);
	can(
		lay(av, "--setting-sources") === "user" && lay(av, "--add-dir") === AG,
		"4 nguon cai dat hay thu muc them sai",
		loi,
	);
	const tep = lay(av, "--settings") ?? "";
	can(
		Boolean(tep) && !path.resolve(tep).startsWith(kho.goc + path.sep),
		"5 tep cai dat nam trong kho",
		loi,
	);
	const bash = allow
		.filter((a) => a.startsWith("Bash("))
		.map((a) => a.slice(5, -1));
	can(
		bang(bash, lenhKit(AG, banGom, [TEP_LO_TRINH])) &&
			bash.every((l) => l.startsWith(`node ${AG}/scripts/`)) &&
			!bash.some((l) => ["*", "$", "&&", ";", "|"].some((c) => l.includes(c))),
		"phiên gom chạy được lệnh tuỳ ý",
		loi,
	);
	can(
		bang(
			allow.filter((a) => a.startsWith("Edit(")),
			[`Edit(./${banGom})`, `Edit(./${TEP_LO_TRINH})`],
		),
		"7 luat sua sai",
		loi,
	);
	const deny = cd?.permissions.deny ?? [];
	can(
		[
			"Edit(**/.git/**)",
			"Edit(./.githooks/**)",
			"Edit(./.github/**)",
			"Read(//proc/**)",
		].every((d) => deny.includes(d)),
		"8 luat cam thieu",
		loi,
	);
	can(
		cd?.permissions.blockReadsOutsideWorkingDirectories === true &&
			cd?.disableAllHooks === true,
		"phiên gom chạy hook",
		loi,
	);
	const loiDan = lay(av, "-p") ?? "";
	can(
		bash.length > 0 &&
			bash.every((l) => loiDan.includes(l)) &&
			loiDan.includes(banGom) &&
			loiDan.includes(GOM.moHinh.duLieu),
		"10 loi dan thieu lenh, ban gom hay cau du lieu",
		loi,
	);
	can(
		bang(
			allow.filter((a) => a.startsWith("Skill")),
			GOM.moHinh.skill.map((s) => `Skill(${s})`),
		) &&
			bang(
				[...GOM.moHinh.skill],
				["acceptance-gate:gom-tin-hieu", "acceptance-gate:cat-luot"],
			),
		"11 luat skill sai",
		loi,
	);
	loi.push(...kiemSkill(AG, AG, allow, banGom, [TEP_LO_TRINH]));
	return { loi, allow, banGom };
}

function banSaoKit(sua: (ten: string, txt: string) => string): string {
	const d = thuMuc("kit");
	for (const s of ["gom-tin-hieu", "cat-luot"]) {
		mkdirSync(path.join(d, "skills", s), { recursive: true });
		const txt = readFileSync(path.join(AG, "skills", s, "SKILL.md"), "utf8");
		writeFileSync(path.join(d, "skills", s, "SKILL.md"), sua(s, txt));
	}
	return d;
}

describe("gcg-loi-goi", () => {
	test(
		"gcg-loi-goi: 13 dong — phien chi lam dung viec gom",
		async () => {
			expect((await kiemLoiGoi(chayGom)).loi).toEqual([]);
		},
		LAU,
	);
	test(
		"gcg-loi-goi: chieu do — lenh tuy y, hook, skill tu cap quyen, lenh chua phep",
		async () => {
			const fnLenh = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "...lenh.map((l) => `Bash(${l})`),",
					thanh: '...lenh.map((l) => `Bash(${l})`), "Bash(node:*)",',
				},
			]);
			expect((await kiemLoiGoi(fnLenh)).loi).toContain(
				"phiên gom chạy được lệnh tuỳ ý",
			);
			const fnHook = await banTiem([
				{ tep: "gom-lich.ts", tu: "\t\tdisableAllHooks: true,\n", thanh: "" },
			]);
			expect((await kiemLoiGoi(fnHook)).loi).toContain("phiên gom chạy hook");
			const { allow, banGom } = await kiemLoiGoi(chayGom);
			const tuCap = banSaoKit((s, txt) =>
				s === "gom-tin-hieu"
					? txt.replace(/^---\n/, "---\nallowed-tools: Bash(node:*)\n")
					: txt,
			);
			expect(kiemSkill(tuCap, AG, allow, banGom, [TEP_LO_TRINH])).toContain(
				"skill tự cấp quyền ngoài danh sách",
			);
			const lenhMoi = banSaoKit((s, txt) =>
				s === "gom-tin-hieu"
					? `${txt}\n\`\`\`bash\nAG="\${AG:-\${CLAUDE_PLUGIN_ROOT}}" && node "$AG/scripts/tin-hieu.mjs" --root . --moi\n\`\`\`\n`
					: txt,
			);
			expect(kiemSkill(lenhMoi, AG, allow, banGom, [TEP_LO_TRINH])).toContain(
				"skill bảo chạy lệnh chưa được phép",
			);
		},
		LAU,
	);
});

async function kiemChiViecGom(fn: Chay): Promise<string[]> {
	const loi: string[] = [];
	const khoa = ngauNhien("sk-ant");
	{
		const kho = dungKhoGom();
		const truoc = refs(kho.origin);
		const cl = claudeGia("chi-duoc-phep");
		const gh = ghGia();
		const kq = await chayVoi(fn, kho, cl, gh, { ANTHROPIC_API_KEY: khoa });
		if (kq.ma !== 0)
			loi.push("rang phu khong chay duoc khi phien khong co git");
		can(sha(kho, DE_XUAT) !== null, "1 khong co nhanh de xuat", loi);
		const moi = (
			sha(kho, DE_XUAT) === null
				? ""
				: g(kho.origin, [
						"diff",
						"--name-only",
						"--diff-filter=A",
						`refs/heads/${GOM.nhanhChinh}`,
						DE_XUAT,
						"--",
						"tin-hieu/gom",
					])
		)
			.split("\n")
			.filter((t) => t.endsWith(".md"));
		can(bang(moi, [banGomDinh()]), "1 ban gom khong o duong da dinh", loi);
		can(
			gh.nhatKy().filter((a) => a[1] === "create" && a.includes("--draft"))
				.length === 1,
			"1 khong dung mot PR nhap",
			loi,
		);
		can(refsKhac(truoc, refs(kho.origin)), "1 ref khac tren origin doi", loi);
		can(
			kq.dong.includes(`${GOM.thongDiep.biTuChoi} 0 lời gọi`),
			"3 thieu dong 0 loi goi bi tu choi",
			loi,
		);
	}
	{
		const kho = dungKhoGom();
		const truoc = refs(kho.origin);
		const kq = await chayVoi(fn, kho, claudeGia("khong-gom"), ghGia(), {
			ANTHROPIC_API_KEY: khoa,
		});
		can(kq.ma === 1, "2 khong gom ma khong 1", loi);
		can(
			kq.dong.includes(GOM.thongDiep.soBanGom),
			"2 thieu cau so ban gom",
			loi,
		);
		can(refsBang(refs(kho.origin), truoc), "2 ref tren origin doi", loi);
		can(
			!existsSync(path.join(kho.goc, banGomDinh())) &&
				!g(kho.goc, ["ls-files", "--", banGomDinh()]),
			"2 ban gom rong con trong cay",
			loi,
		);
	}
	{
		const kho = dungKhoGom();
		const kq = await chayVoi(fn, kho, claudeGia("tu-choi"), ghGia(), {
			ANTHROPIC_API_KEY: khoa,
		});
		can(
			kq.dong.includes(`${GOM.thongDiep.biTuChoi} 2 lời gọi: Bash, WebFetch`),
			"3 thieu dong 2 loi goi bi tu choi",
			loi,
		);
		can(
			!kq.dong.some((d) => d.includes("DOI-SO-MOI")),
			"3 in doi so loi goi bi tu choi",
			loi,
		);
	}
	return loi;
}

describe("gcg-chi-viec-gom", () => {
	test(
		"gcg-chi-viec-gom: ba ca — giao duoc khi chi lam viec duoc phep",
		async () => {
			expect(await kiemChiViecGom(chayGom)).toEqual([]);
		},
		LAU,
	);
	test(
		"gcg-chi-viec-gom: chieu do — khong dat ban gom vao index",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: '\tgitPhai("add", "--intent-to-add", "--", tepBanGomDinh);\n',
					thanh: "",
				},
			]);
			expect(await kiemChiViecGom(fn)).toContain(
				"rang phu khong chay duoc khi phien khong co git",
			);
		},
		LAU,
	);
});

async function kiemKhongTrenDia(fn: Chay): Promise<string[]> {
	const loi: string[] = [];
	const token = ngauNhien("ghpthu");
	const kho = dungKhoGom();
	const nha = thuMuc("nha");
	await fn({
		goc: kho.goc,
		env: {
			AG,
			HOME: nha,
			ANTHROPIC_API_KEY: ngauNhien("sk-ant"),
			TIN_HIEU_TOKEN: token,
		},
		gh: ghGia().bin,
		claude: claudeGia("dung").bin,
		now: new Date(),
	});
	for (const t of tepMang([kho.goc, nha], token))
		loi.push(`token nằm trên đĩa: ${path.relative(kho.goc, t)}`);
	return loi;
}

describe("gcg-khong-tren-dia", () => {
	test(
		"gcg-khong-tren-dia: sau luot khong tep nao mang token",
		async () => {
			expect(await kiemKhongTrenDia(chayGom)).toEqual([]);
		},
		LAU,
	);
	test(
		"gcg-khong-tren-dia: doi chung — phep quet thay token cai san",
		() => {
			const token = ngauNhien("ghpthu");
			const kho = dungKhoGom();
			writeFileSync(
				path.join(kho.goc, ".git", "config"),
				`${readFileSync(path.join(kho.goc, ".git", "config"), "utf8")}[http]\n\textraheader = ${token}\n`,
			);
			expect(tepMang([kho.goc], token)).toEqual([
				path.join(kho.goc, ".git", "config"),
			]);
		},
		LAU,
	);
	test(
		"gcg-khong-tren-dia: chieu do — luot ghi token vao cau hinh",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "\tconst fetch = chay(\n",
					thanh:
						'\tif (token) git("config", "http.extraheader", token);\n\tconst fetch = chay(\n',
				},
			]);
			expect(await kiemKhongTrenDia(fn)).toContain(
				"token nằm trên đĩa: .git/config",
			);
		},
		LAU,
	);
	test(
		"gcg-khong-tren-dia: chot truoc phien — token duoi thu muc nha",
		async () => {
			const token = ngauNhien("ghpthu");
			const nha = thuMuc("nha");
			const tep = path.join(
				nha,
				".claude",
				"plugins",
				"marketplaces",
				"kit",
				".git",
				"config",
			);
			mkdirSync(path.dirname(tep), { recursive: true });
			writeFileSync(tep, `[remote "origin"]\n\turl = https://x:${token}@h/\n`);
			const env = {
				AG,
				ANTHROPIC_API_KEY: ngauNhien("sk-ant"),
				TIN_HIEU_TOKEN: token,
			};
			const cl = claudeGia("dung");
			const kq = await chayGom({
				goc: dungKhoGom().goc,
				env: { ...env, HOME: nha },
				gh: ghGia().bin,
				claude: cl.bin,
				now: new Date(),
			});
			expect(kq.ma).toBe(1);
			expect(kq.dong[0]).toBe(GOM.thongDiep.tokenTrenDia);
			expect(kq.dong).toContain(tep);
			expect(cl.daGoi()).toBe(false);
			const cl2 = claudeGia("dung");
			await chayGom({
				goc: dungKhoGom().goc,
				env: { ...env, HOME: thuMuc("nha") },
				gh: ghGia().bin,
				claude: cl2.bin,
				now: new Date(),
			});
			expect(cl2.daGoi()).toBe(true);
		},
		LAU,
	);
});

type DongVo = {
	ten: string;
	co: boolean;
	hp: boolean;
	fm: boolean;
	args: string;
};

function voBoc(giaTri: string[]): { path: string; nhatKy: () => DongVo[] } {
	const d = thuMuc("vo");
	const log = path.join(d, "log");
	for (const ten of ["git", "node", "bun"]) {
		const that = spawnSync("which", [ten], { encoding: "utf8" }).stdout.trim();
		const mau = giaTri.map((v) => `*"${v}"*`).join("|");
		writeFileSync(
			path.join(d, ten),
			[
				"#!/bin/sh",
				"co=0",
				`case "$(env)" in ${mau}) co=1;; esac`,
				"hp=0; fm=0; i=0",
				'while [ "$i" -lt "${GIT_CONFIG_COUNT:-0}" ]; do',
				'  eval "k=\\${GIT_CONFIG_KEY_$i}"; eval "v=\\${GIT_CONFIG_VALUE_$i}"',
				'  [ "$k" = core.hooksPath ] && [ "$v" = /dev/null ] && hp=1',
				'  [ "$k" = core.fsmonitor ] && [ "$v" = false ] && fm=1',
				"  i=$((i+1))",
				"done",
				`printf '%s\\t%s\\t%s\\t%s\\t%s\\n' "${ten}" "$co" "$hp" "$fm" "$*" >> "${log}"`,
				`exec "${that}" "$@"`,
				"",
			].join("\n"),
		);
		chmodSync(path.join(d, ten), 0o755);
	}
	return {
		path: d,
		nhatKy: () =>
			existsSync(log)
				? readFileSync(log, "utf8")
						.split("\n")
						.filter(Boolean)
						.map((l) => {
							const [ten = "", co, hp, fm, ...con] = l.split("\t");
							return {
								ten,
								co: co === "1",
								hp: hp === "1",
								fm: fm === "1",
								args: con.join("\t"),
							};
						})
				: [],
	};
}

async function kiemToken(fn: Chay): Promise<string[]> {
	const loi: string[] = [];
	const token = ngauNhien("ghpthu");
	const dau = GOM.xacThuc.giaTri(token);
	const vo = voBoc([token, dau]);
	const kho = dungKhoGom();
	const cl = claudeGia("dung");
	const gh = ghGia();
	const kq = await chayVoi(fn, kho, cl, gh, {
		ANTHROPIC_API_KEY: ngauNhien("sk-ant"),
		TIN_HIEU_TOKEN: token,
		PATH: `${vo.path}:${process.env.PATH ?? ""}`,
	});
	can(kq.ma === 0, `0 luot khong ma 0: ${kq.dong.join(" | ")}`, loi);
	const nk = vo.nhatKy();
	const git = nk.filter((d) => d.ten === "git");
	const mang = git.filter(
		(d) => d.args.startsWith("fetch") || d.args.startsWith("push"),
	);
	can(
		mang.every((d) => d.co),
		"1 fetch hay push thieu token",
		loi,
	);
	const ghEnv = gh.nhatKyEnv();
	can(
		ghEnv.every((x) => x.GH_TOKEN === token),
		"2 gh thieu token",
		loi,
	);
	can(
		!Object.values(cl.env()).some((v) => v.includes(token) || v.includes(dau)),
		"3 phien nhan token",
		loi,
	);
	const node = nk.filter(
		(d) =>
			d.ten === "node" &&
			(d.args.startsWith(AG) || d.args.includes("scripts/product-map.mjs")),
	);
	can(
		node.every((d) => !d.co),
		"4 lenh kit hay ve trang nhan token",
		loi,
	);
	can(
		git.filter((d) => !mang.includes(d)).every((d) => !d.co),
		"token tới lệnh git cục bộ",
		loi,
	);
	can(
		mang.filter((d) => d.args.startsWith("fetch")).length >= 1 &&
			mang.filter((d) => d.args.startsWith("push")).length === 1 &&
			ghEnv.length >= 2 &&
			node.length >= 1,
		"6 ma tran rong",
		loi,
	);
	return loi;
}

describe("gcg-token", () => {
	test(
		"gcg-token: 6 dong — token chi toi fetch, push, gh",
		async () => {
			expect(await kiemToken(chayGom)).toEqual([]);
		},
		LAU,
	);
	test(
		"gcg-token: chieu do — token vao env chung cua git",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: 'const git = (...thamSo: string[]) => chay("git", thamSo, o.goc, envChay);',
					thanh:
						'const git = (...thamSo: string[]) => chay("git", thamSo, o.goc, envMang);',
				},
			]);
			expect(await kiemToken(fn)).toContain("token tới lệnh git cục bộ");
		},
		LAU,
	);
});

const TAN_CONG: [Parameters<typeof claudeGia>[0], string][] = [
	["git-fsmonitor", ".git/config"],
	["git-hook", ".git/hooks/pre-push"],
	["git-remote", ".git/config"],
	["git-ref", ".git/refs/heads/ngoai"],
	["git-info", ".git/info/attributes"],
];

async function kiemSieuDuLieu(
	fn: Chay,
	cheDo: Parameters<typeof claudeGia>[0],
	tep: string,
): Promise<string[]> {
	const loi: string[] = [];
	const kho = dungKhoGom();
	const hai = thuMuc("origin-hai");
	g(hai, ["init", "--quiet", "--bare"]);
	const cl = claudeGia(cheDo);
	cl.datMoi("origin-hai", hai);
	const gh = ghGia();
	const truoc = refs(kho.origin);
	const truocHai = refs(hai);
	const kq = await chayVoi(fn, kho, cl, gh, {
		ANTHROPIC_API_KEY: ngauNhien("sk-ant"),
	});
	if (sha(kho, DE_XUAT) !== null || existsSync(path.join(cl.thuMuc, "A")))
		loi.push("lượt chạy thứ phiên để lại");
	can(kq.ma === 1, `${cheDo} khong ma 1`, loi);
	can(
		kq.dong[0] === GOM.thongDiep.sieuDuLieu && kq.dong.includes(tep),
		`${cheDo} khong goi ten ${tep}`,
		loi,
	);
	can(taoSua(gh).length === 0, `${cheDo} dung toi PR`, loi);
	can(
		refsBang(refs(kho.origin), truoc) && refsBang(refs(hai), truocHai),
		`${cheDo} ref tren origin doi`,
		loi,
	);
	can(
		!existsSync(path.join(cl.thuMuc, "A")) &&
			!existsSync(path.join(cl.thuMuc, "B")),
		`${cheDo} lenh phien cai da chay`,
		loi,
	);
	return loi;
}

describe("gcg-sieu-du-lieu", () => {
	for (const [cheDo, tep] of TAN_CONG)
		test(
			`gcg-sieu-du-lieu: ${cheDo}`,
			async () => {
				expect(await kiemSieuDuLieu(chayGom, cheDo, tep)).toEqual([]);
			},
			LAU,
		);
	test(
		"gcg-sieu-du-lieu: moi lenh git tat hook va fsmonitor",
		async () => {
			const vo = voBoc([ngauNhien("khong-co")]);
			const kq = await chayVoi(
				chayGom,
				dungKhoGom(),
				claudeGia("dung"),
				ghGia(),
				{
					ANTHROPIC_API_KEY: ngauNhien("sk-ant"),
					PATH: `${vo.path}:${process.env.PATH ?? ""}`,
				},
			);
			expect(kq.ma).toBe(0);
			const git = vo.nhatKy().filter((d) => d.ten === "git");
			expect(git.length).toBeGreaterThan(5);
			expect(git.filter((d) => !d.hp || !d.fm).map((d) => d.args)).toEqual([]);
		},
		LAU,
	);
	test(
		"gcg-sieu-du-lieu: chieu do — bo kiem bam",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "\tif (lech.length) return do1([GOM.thongDiep.sieuDuLieu, ...lech]);\n",
					thanh: "",
				},
			]);
			expect(
				await kiemSieuDuLieu(fn, "git-hook", ".git/hooks/pre-push"),
			).toContain("lượt chạy thứ phiên để lại");
		},
		LAU,
	);
});

const LOT: Parameters<typeof claudeGia>[0][] = [
	"lot-ten-nhom",
	"lot-cau-giao-b64",
	"lot-ly-do",
	"lot-tep-b64",
];

async function kiemLotKhoa(
	fn: Chay,
	cheDo: Parameters<typeof claudeGia>[0],
): Promise<string[]> {
	const loi: string[] = [];
	const khoa = ngauNhien("sk-ant-thu");
	const token = ngauNhien("ghpthu");
	const kho = dungKhoGom();
	const cl = claudeGia(cheDo);
	cl.datMoi("token", token);
	const gh = ghGia();
	const kq = await chayVoi(fn, kho, cl, gh, {
		ANTHROPIC_API_KEY: khoa,
		TIN_HIEU_TOKEN: token,
	});
	if (kq.ma === 0) loi.push("khoá base64 lọt qua quét");
	can(
		kq.dong.includes(GOM.thongDiep.lotKhoa),
		`${cheDo} thieu cau lot khoa: ${kq.dong.join(" | ")}`,
		loi,
	);
	can(sha(kho, DE_XUAT) === null, `${cheDo} da day`, loi);
	can(taoSua(gh).length === 0, `${cheDo} dung toi PR`, loi);
	const ra = kq.dong.join("\n");
	can(
		![...dangKhoa(khoa), ...dangKhoa(token)].some((k) => ra.includes(k)),
		`${cheDo} in khoa ra nhat ky`,
		loi,
	);
	return loi;
}

describe("gcg-lot-khoa", () => {
	for (const cheDo of LOT)
		test(
			`gcg-lot-khoa: ${cheDo}`,
			async () => {
				expect(await kiemLotKhoa(chayGom, cheDo)).toEqual([]);
			},
			LAU,
		);
	test(
		"gcg-lot-khoa: doi chung — luot dung van giao",
		async () => {
			const kho = dungKhoGom();
			const kq = await chayVoi(chayGom, kho, claudeGia("dung"), ghGia(), {
				ANTHROPIC_API_KEY: ngauNhien("sk-ant-thu"),
				TIN_HIEU_TOKEN: ngauNhien("ghpthu"),
			});
			expect(kq.ma).toBe(0);
			expect(sha(kho, DE_XUAT)).not.toBeNull();
		},
		LAU,
	);
	test(
		"gcg-lot-khoa: chieu do — chi quet nguyen van",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "if (biMat.flatMap(dangKhoa).some((k) => sapDi.includes(k)))",
					thanh: "if (biMat.some((k) => sapDi.includes(k)))",
				},
			]);
			expect(await kiemLotKhoa(fn, "lot-cau-giao-b64")).toContain(
				"khoá base64 lọt qua quét",
			);
		},
		LAU,
	);
});
