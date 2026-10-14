import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
	chmodSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	bocPhanHoiKeoVe,
	type KeoVeOutput,
	keoVeOutput,
	TIN_HIEU,
	tepTuBanGhi,
	vietTep,
} from "../../../packages/validation/src/tin-hieu.ts";
import { docTinHieu } from "../../tin-hieu.mjs";
import { chayLich, LICH } from "../lich.ts";

const KHOA = "crm_khoaLichThu0123456789abcdefghij";
const NOW = new Date("2026-10-14T21:00:00.000Z");
const tam: string[] = [];
afterAll(() => {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
});

function thuMuc(ten: string): string {
	const d = mkdtempSync(path.join(tmpdir(), `tvk-${ten}-`));
	tam.push(d);
	return d;
}

function g(cwd: string, ...thamSo: string[]): string {
	const r = spawnSync("git", thamSo, {
		cwd,
		encoding: "utf8",
		env: {
			...process.env,
			GIT_AUTHOR_NAME: "thu",
			GIT_AUTHOR_EMAIL: "thu@thu.test",
			GIT_COMMITTER_NAME: "thu",
			GIT_COMMITTER_EMAIL: "thu@thu.test",
		},
	});
	if (r.status !== 0) throw new Error(`git ${thamSo.join(" ")}: ${r.stderr}`);
	return r.stdout.trim();
}

type Kho = { origin: string; seed: string; goc: string };

function dungKho(): Kho {
	const origin = thuMuc("origin");
	g(origin, "init", "--quiet", "--bare", "-b", LICH.nhanhChinh);
	const seed = thuMuc("seed");
	g(seed, "clone", "--quiet", origin, ".");
	g(seed, "switch", "--quiet", "-c", LICH.nhanhChinh);
	writeFileSync(path.join(seed, "README.md"), "kho thu\n");
	g(seed, "add", ".");
	g(seed, "commit", "--quiet", "-m", "goc");
	g(seed, "push", "--quiet", "origin", LICH.nhanhChinh);
	const goc = thuMuc("goc");
	g(goc, "clone", "--quiet", origin, ".");
	return { origin, seed, goc };
}

function sha(kho: Kho, ref: string): string | null {
	const r = spawnSync("git", ["rev-parse", "--verify", "--quiet", ref], {
		cwd: kho.origin,
		encoding: "utf8",
	});
	return r.status === 0 ? r.stdout.trim() : null;
}

function tepTren(kho: Kho, ref: string): string[] {
	const r = spawnSync(
		"git",
		["ls-tree", "-r", "--name-only", ref, "--", TIN_HIEU.thuMucNguon],
		{ cwd: kho.origin, encoding: "utf8" },
	);
	return r.status === 0 ? r.stdout.split("\n").filter(Boolean).sort() : [];
}

const TIN = (so: number): KeoVeOutput["tep"][number] => ({
	id: `crm-${so}`,
	tep: tepTuBanGhi({
		tieuDe: `gap ${so}`,
		muonLam: `muon ${so}`,
		daXayRa: `gap ${so}`,
		man: "/okr",
		guiLuc: new Date(NOW.getTime() - so * 3_600_000),
	}),
	phongBan: null,
	keoVeLuc: NOW.toISOString(),
});

type MayChu = { url: string; dat: (so: number[]) => void; dung: () => void };

function mayChu(maLoi?: number): MayChu {
	let ds: KeoVeOutput["tep"] = [];
	const sv = Bun.serve({
		port: 0,
		fetch: (req) => {
			if (req.headers.get("x-api-key") !== KHOA)
				return new Response("{}", { status: 401 });
			if (maLoi) return new Response("{}", { status: maLoi });
			const than = bocPhanHoiKeoVe(ds, NOW.toISOString());
			return Response.json(keoVeOutput.parse(JSON.parse(JSON.stringify(than))));
		},
	});
	return {
		url: `http://localhost:${sv.port}`,
		dat: (so) => {
			ds = so.map(TIN);
		},
		dung: () => sv.stop(true),
	};
}

type Gh = {
	bin: string;
	nhatKy: () => string[];
	danhSach: (json: string) => void;
	loiTao: (chu: string) => void;
};

function ghGia(): Gh {
	const d = thuMuc("gh");
	const log = path.join(d, "log");
	const ds = path.join(d, "ds.json");
	const loi = path.join(d, "loi");
	writeFileSync(ds, "[]");
	const bin = path.join(d, "gh");
	writeFileSync(
		bin,
		`#!/usr/bin/env bash\nprintf '%s\\n' "$*" >> "${log}"\nif [ "$1 $2" = "pr list" ]; then cat "${ds}"; exit 0; fi\nif [ "$1 $2" = "pr create" ]; then if [ -s "${loi}" ]; then cat "${loi}" >&2; exit 1; fi; echo https://github.com/thu/thu/pull/7; exit 0; fi\nexit 0\n`,
	);
	chmodSync(bin, 0o755);
	return {
		bin,
		nhatKy: () =>
			existsSync(log)
				? readFileSync(log, "utf8").split("\n").filter(Boolean)
				: [],
		danhSach: (json) => writeFileSync(ds, json),
		loiTao: (chu) => writeFileSync(loi, chu),
	};
}

const chay = (
	kho: Kho,
	sv: { url: string },
	gh: Gh,
	env?: Record<string, string | undefined>,
) =>
	chayLich({
		goc: kho.goc,
		env: env ?? { CRM_API_URL: sv.url, CRM_KHOA_KEO_TIN_HIEU: KHOA },
		gh: gh.bin,
		now: NOW,
	});

function docKit(kho: Kho, ref: string): { loi: number; so: number } {
	const d = thuMuc("doc");
	spawnSync("bash", [
		"-c",
		`git -C "${kho.origin}" archive "${ref}" | tar -x -C "${d}"`,
	]);
	const kq = docTinHieu(d, [TIN_HIEU.thuMucNguon]);
	return { loi: kq.loi.length, so: kq.tinHieu.length };
}

const HC = `refs/heads/${LICH.nhanhHangCho}`;
const CHINH = `refs/heads/${LICH.nhanhChinh}`;

describe("tvk-nhanh", () => {
	test("tvk-nhanh: 6 dong — dung tren dinh chinh, khong day khi khong moi, khong roi tep chua gop", async () => {
		const kho = dungKho();
		const sv = mayChu();
		const gh = ghGia();
		const truocCua = (): string[] => {
			const chinh = new Set(tepTren(kho, CHINH));
			return tepTren(kho, HC).filter((t) => !chinh.has(t));
		};
		const khongRoi = (truoc: string[]) => {
			const sau = new Set(tepTren(kho, HC));
			const chinh = new Set(tepTren(kho, CHINH));
			expect(
				truoc.filter((t) => !sau.has(t) && !chinh.has(t)),
				"nhanh hang cho lam roi tep chua gop",
			).toEqual([]);
		};

		sv.dat([1, 2]);
		expect((await chay(kho, sv, gh)).ma).toBe(0);
		expect(g(kho.origin, "rev-parse", `${HC}~1`)).toBe(sha(kho, CHINH) ?? "");
		expect(
			g(kho.origin, "diff", "--name-only", CHINH, HC).split("\n").sort(),
		).toEqual(["tin-hieu/crm/crm-1.json", "tin-hieu/crm/crm-2.json"]);
		expect(docKit(kho, HC)).toEqual({ loi: 0, so: 2 });

		let truoc = truocCua();
		const sha1 = sha(kho, HC);
		expect((await chay(kho, sv, gh)).ma).toBe(0);
		expect(sha(kho, HC), "luot day khi khong co gi moi").toBe(sha1);
		khongRoi(truoc);

		truoc = truocCua();
		sv.dat([1, 2, 3]);
		expect((await chay(kho, sv, gh)).ma).toBe(0);
		khongRoi(truoc);
		expect(
			g(kho.origin, "rev-parse", `${HC}~1`),
			"nhanh hang cho khong dung lai tren nhanh chinh",
		).toBe(sha(kho, CHINH) ?? "");
		expect(tepTren(kho, HC)).toEqual([
			"tin-hieu/crm/crm-1.json",
			"tin-hieu/crm/crm-2.json",
			"tin-hieu/crm/crm-3.json",
		]);
		khongRoi(truoc);

		g(kho.seed, "fetch", "--quiet", "origin");
		g(kho.seed, "merge", "--quiet", "--ff-only", `origin/${LICH.nhanhHangCho}`);
		g(kho.seed, "push", "--quiet", "origin", LICH.nhanhChinh);
		const sha3 = sha(kho, HC);
		truoc = truocCua();
		expect((await chay(kho, sv, gh)).ma).toBe(0);
		expect(sha(kho, HC), "luot day khi khong co gi moi").toBe(sha3);
		khongRoi(truoc);

		writeFileSync(path.join(kho.seed, "README.md"), "kho thu doi\n");
		g(kho.seed, "commit", "--quiet", "-am", "doi khac");
		g(kho.seed, "push", "--quiet", "origin", LICH.nhanhChinh);
		sv.dat([1, 2, 3, 4]);
		truoc = truocCua();
		expect((await chay(kho, sv, gh)).ma).toBe(0);
		expect(
			g(kho.origin, "rev-parse", `${HC}~1`),
			"nhanh hang cho khong dung lai tren nhanh chinh",
		).toBe(sha(kho, CHINH) ?? "");
		expect(g(kho.origin, "diff", "--name-only", CHINH, HC)).toBe(
			"tin-hieu/crm/crm-4.json",
		);
		expect(docKit(kho, HC)).toEqual({ loi: 0, so: 4 });
		khongRoi(truoc);
		sv.dung();
	}, 60_000);
});

describe("tvk-pr", () => {
	let kho: Kho;
	let sv: MayChu;
	let gh: Gh;
	beforeEach(() => {
		kho = dungKho();
		sv = mayChu();
		sv.dat([1]);
		gh = ghGia();
	});
	const soTao = () =>
		gh.nhatKy().filter((d) => d.startsWith("pr create")).length;

	test("tvk-pr: o1 chua co PR thi mo dung mot PR", async () => {
		expect((await chay(kho, sv, gh)).ma).toBe(0);
		expect(soTao()).toBe(1);
		const tao = gh.nhatKy().find((d) => d.startsWith("pr create")) ?? "";
		expect(tao).toContain(`--base ${LICH.nhanhChinh}`);
		expect(tao).toContain(`--head ${LICH.nhanhHangCho}`);
		expect(tao).toContain("Tín hiệu kéo về");
		sv.dung();
	});

	test("tvk-pr: o2 da co PR mo thi khong mo them", async () => {
		gh.danhSach('[{"number":7}]');
		expect((await chay(kho, sv, gh)).ma).toBe(0);
		expect(soTao(), "mo PR thu hai").toBe(0);
		sv.dung();
	});

	test("tvk-pr: o3 kho cam mo PR thi luot do, nhanh van day", async () => {
		gh.loiTao(
			"pull request create failed: GraphQL: GitHub Actions is not permitted to create or approve pull requests (createPullRequest)",
		);
		const kq = await chay(kho, sv, gh);
		expect(kq.ma, "kho cam mo PR ma luot van xanh").not.toBe(0);
		expect(kq.dong).toContain(LICH.thongDiep.camMoPr);
		expect(sha(kho, HC)).not.toBeNull();
		sv.dung();
	});

	test("tvk-pr: o4 cay trung khong day ma chua co PR thi van mo PR", async () => {
		gh.loiTao(
			"pull request create failed: GitHub Actions is not permitted to create or approve pull requests",
		);
		await chay(kho, sv, gh);
		const shaTruoc = sha(kho, HC);
		gh.loiTao("");
		const kq = await chay(kho, sv, gh);
		expect(kq.ma).toBe(0);
		expect(sha(kho, HC)).toBe(shaTruoc);
		expect(soTao(), "nhanh hang cho co tep ma khong PR").toBe(2);
		sv.dung();
	});

	test("tvk-pr: o5 PR truoc da dong khong gop thi mo PR moi", async () => {
		gh.danhSach('[{"number":7}]');
		await chay(kho, sv, gh);
		gh.danhSach("[]");
		expect((await chay(kho, sv, gh)).ma).toBe(0);
		expect(soTao(), "nhanh hang cho co tep ma khong PR").toBe(1);
		sv.dung();
	});

	test("tvk-pr: o6 khong lenh nao gop PR", async () => {
		await chay(kho, sv, gh);
		gh.danhSach('[{"number":7}]');
		await chay(kho, sv, gh);
		for (const d of gh.nhatKy()) {
			expect(d.includes("pr merge")).toBe(false);
			expect(d.includes("--auto")).toBe(false);
		}
		sv.dung();
	});
});

describe("tvk-hong", () => {
	const ca: {
		ten: string;
		env: (url: string) => Record<string, string | undefined>;
		maLoi?: number;
		chuanBi?: (kho: Kho) => void;
		goiTen: string;
	}[] = [
		{
			ten: "thieu khoa",
			env: (url) => ({ CRM_API_URL: url }),
			goiTen: "CRM_KHOA_KEO_TIN_HIEU",
		},
		{
			ten: "CRM tra 500",
			env: (url) => ({ CRM_API_URL: url, CRM_KHOA_KEO_TIN_HIEU: KHOA }),
			maLoi: 500,
			goiTen: "500",
		},
		{
			ten: "CRM khong nghe",
			env: () => ({
				CRM_API_URL: "http://127.0.0.1:9",
				CRM_KHOA_KEO_TIN_HIEU: KHOA,
			}),
			goiTen: "không tới được",
		},
		{
			ten: "tep lech byte",
			env: (url) => ({ CRM_API_URL: url, CRM_KHOA_KEO_TIN_HIEU: KHOA }),
			chuanBi: (kho) => {
				const d = path.join(kho.seed, TIN_HIEU.thuMucNguon);
				mkdirSync(d, { recursive: true });
				writeFileSync(
					path.join(d, "crm-1.json"),
					`${vietTep(TIN(1).tep).trim()} \n`,
				);
				g(kho.seed, "add", ".");
				g(kho.seed, "commit", "--quiet", "-m", "tep lech");
				g(kho.seed, "push", "--quiet", "origin", LICH.nhanhChinh);
			},
			goiTen: "crm-1.json",
		},
	];
	for (const c of ca) {
		test(`tvk-hong: ${c.ten} thi luot do, khong day, khong goi gh`, async () => {
			const kho = dungKho();
			c.chuanBi?.(kho);
			const sv = mayChu(c.maLoi);
			sv.dat([1]);
			const gh = ghGia();
			const kq = await chay(kho, sv, gh, c.env(sv.url));
			sv.dung();
			expect(kq.ma).not.toBe(0);
			expect(kq.dong.join("\n")).toContain(c.goiTen);
			expect(sha(kho, HC), "luot hong van day nhanh").toBeNull();
			expect(gh.nhatKy()).toEqual([]);
		});
	}
});
