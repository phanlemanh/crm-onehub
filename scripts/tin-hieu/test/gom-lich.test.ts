import { afterAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GOM } from "../gom-cau-hinh.ts";
import { type chayGom as ChayGom, chayGom } from "../gom-lich.ts";
import { dauTap, docKhoiMay } from "../gom-than-pr.ts";
import {
	type ClaudeGia,
	claudeGia,
	commitNguoi,
	donTam,
	dungKhoGom,
	type GhGia,
	g,
	ghGia,
	giaiKit,
	KHOA_GIA,
	type KhoGom,
	sha,
	TEN_NHOM,
	TEP_LO_TRINH,
	themTinHieu,
	thuMuc,
} from "./gom-kho-tam.ts";

const AG = giaiKit();
const DE_XUAT = `refs/heads/${GOM.nhanhDeXuat}`;
const CHINH = `refs/heads/${GOM.nhanhChinh}`;
const LAU = 180_000;
afterAll(donTam);

type Chay = typeof ChayGom;

const chayVoi = (
	fn: Chay,
	kho: KhoGom,
	cl: ClaudeGia | string,
	gh: GhGia,
	o: { env?: Record<string, string | undefined>; tranMs?: number } = {},
) =>
	fn({
		goc: kho.goc,
		env: o.env ?? { AG, ANTHROPIC_API_KEY: KHOA_GIA },
		gh: gh.bin,
		claude: typeof cl === "string" ? cl : cl.bin,
		now: new Date(),
		...(o.tranMs ? { tranMs: o.tranMs } : {}),
	});

const GOC_TEST = path.resolve(import.meta.dir, "..");
const VALIDATION = path.resolve(
	GOC_TEST,
	"..",
	"..",
	"packages",
	"validation",
	"src",
	"tin-hieu-gom.ts",
);

type Tiem = {
	tep: "gom-lich.ts" | "gom-than-pr.ts";
	tu: string;
	thanh: string;
};

async function banTiem(sua: Tiem[]): Promise<Chay> {
	const d = thuMuc("tiem");
	for (const t of ["gom-lich.ts", "gom-than-pr.ts", "gom-cau-hinh.ts"]) {
		let s = readFileSync(path.join(GOC_TEST, t), "utf8").replaceAll(
			"../../packages/validation/src/tin-hieu-gom.ts",
			VALIDATION,
		);
		for (const x of sua.filter((y) => y.tep === t)) {
			const so = s.split(x.tu).length - 1;
			if (so !== 1)
				throw new Error(`nhát tiêm không khớp đúng một chỗ (${so}): ${x.tu}`);
			s = s.replace(x.tu, x.thanh);
		}
		writeFileSync(path.join(d, t), s);
	}
	const m = (await import(path.join(d, "gom-lich.ts"))) as {
		chayGom: Chay;
	};
	return m.chayGom;
}

function can(dung: boolean, thongDiep: string, loi: string[]): void {
	if (!dung) loi.push(thongDiep);
}

const tao = (gh: GhGia) =>
	gh.nhatKy().filter((a) => a[0] === "pr" && a[1] === "create");
const sua = (gh: GhGia) =>
	gh.nhatKy().filter((a) => a[0] === "pr" && a[1] === "edit");
const lay = (a: string[], co: string) => a[a.indexOf(co) + 1];

function banSaoNhanh(kho: KhoGom): string {
	const d = thuMuc("nhanh");
	g(d, ["clone", "--quiet", "-b", GOM.nhanhDeXuat, kho.origin, "."]);
	return d;
}

function kit(goc: string, ...thamSo: string[]) {
	return spawnSync(
		"node",
		[path.join(AG, "scripts", "tin-hieu.mjs"), "--root", goc, ...thamSo],
		{ cwd: goc, encoding: "utf8" },
	);
}

function gomThangVaoChinh(kho: KhoGom): void {
	const cl = claudeGia("dung");
	const r = spawnSync(cl.bin, [], {
		cwd: kho.seed,
		encoding: "utf8",
		env: {
			...process.env,
			AG,
			GIT_AUTHOR_NAME: "thu",
			GIT_AUTHOR_EMAIL: "thu@thu.test",
			GIT_COMMITTER_NAME: "thu",
			GIT_COMMITTER_EMAIL: "thu@thu.test",
		},
	});
	if (r.status !== 0) throw new Error(r.stderr);
	g(kho.seed, ["push", "--quiet", "origin", GOM.nhanhChinh]);
}

async function kiemKhongMoi(fn: Chay): Promise<string[]> {
	const loi: string[] = [];
	const kho = dungKhoGom();
	gomThangVaoChinh(kho);
	const cl = claudeGia("dung");
	const gh = ghGia();
	const kq = await chayVoi(fn, kho, cl, gh);
	can(kq.ma === 0, "luot khong moi khong ma 0", loi);
	can(!cl.daGoi(), "goi mo hinh khi khong co tin hieu moi", loi);
	can(
		kq.dong[0] === GOM.thongDiep.khongMoi,
		"dong in khong phai khongMoi",
		loi,
	);
	can(
		gh.nhatKy().every((a) => a[0] === "pr" && a[1] === "list"),
		"goi gh ngoai pr list",
		loi,
	);
	can(sha(kho, DE_XUAT) === null, "nhanh de xuat bi tao", loi);
	return loi;
}

describe("gtc-khong-moi", () => {
	test(
		"gtc-khong-moi: moi tin hieu da co cho thi khong goi mo hinh",
		async () => {
			expect(await kiemKhongMoi(chayGom)).toEqual([]);
		},
		LAU,
	);
	test(
		"gtc-khong-moi: doi chung duong — chua co ban gom thi mo hinh duoc goi",
		async () => {
			const kho = dungKhoGom();
			const cl = claudeGia("dung");
			await chayVoi(chayGom, kho, cl, ghGia());
			expect(cl.daGoi()).toBe(true);
		},
		LAU,
	);
	test(
		"gtc-khong-moi: chieu do — ban sao luon goi mo hinh",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "if (!ids.length) return { ma: 0, dong: [GOM.thongDiep.khongMoi] };",
					thanh: "",
				},
			]);
			expect(await kiemKhongMoi(fn)).toContain(
				"goi mo hinh khi khong co tin hieu moi",
			);
		},
		LAU,
	);
});

async function kiemDeXuat(fn: Chay): Promise<string[]> {
	const loi: string[] = [];
	const kho = dungKhoGom({ daGiao: true, tinHieu: [1, 2, 3, 4, 5] });
	const cl = claudeGia("dung");
	const gh = ghGia();
	const kq = await chayVoi(fn, kho, cl, gh);
	can(kq.ma === 0, `1 ma ${kq.ma}: ${kq.dong.join(" | ")}`, loi);
	if (kq.ma !== 0) return loi;
	const dinh = sha(kho, CHINH);
	can(sha(kho, DE_XUAT) !== null, "2 nhanh de xuat khong co", loi);
	can(
		g(kho.origin, ["merge-base", CHINH, DE_XUAT]) === dinh,
		"2 nhanh de xuat khong dung tren dinh nhanh chinh",
		loi,
	);
	const doi = g(kho.origin, ["diff", "--name-only", CHINH, DE_XUAT])
		.split("\n")
		.sort();
	const gomMoi = doi.filter((t) => t.startsWith("tin-hieu/gom/"));
	can(
		gomMoi.length === 1 &&
			doi.length === 3 &&
			doi.includes(TEP_LO_TRINH) &&
			doi.includes(GOM.vung.trang),
		`3 tep doi sai: ${doi.join(",")}`,
		loi,
	);
	const nhanh = banSaoNhanh(kho);
	can(kit(nhanh, "--rang").status === 0, "4 rang phu tren nhanh do", loi);
	const t = tao(gh);
	can(t.length === 1, "5 khong dung mot pr create", loi);
	const a = t[0] ?? [];
	can(a.includes("--draft"), "PR de xuat khong phai nhap", loi);
	can(
		lay(a, "--base") === GOM.nhanhChinh && lay(a, "--head") === GOM.nhanhDeXuat,
		"5 base/head sai",
		loi,
	);
	can(
		/^TH2 · chore\(gom-tin-hieu-tu-chay\): Đợt tín hiệu/.test(
			lay(a, "--title") ?? "",
		),
		"5 tieu de sai khuon",
		loi,
	);
	const than = lay(a, "--body") ?? "";
	const modKit = (await import(path.join(AG, "scripts", "tin-hieu.mjs"))) as {
		docBanGom: (s: string) => {
			nhom: { ma: string; ten: string; tinHieu: string[] }[];
			le: { id: string; lyDo: string }[];
		};
	};
	const bg = modKit.docBanGom(
		readFileSync(path.join(nhanh, gomMoi[0] ?? ""), "utf8"),
	);
	const lt = JSON.parse(
		readFileSync(path.join(nhanh, TEP_LO_TRINH), "utf8"),
	) as {
		hang: { phu?: string[]; cau_giao?: string; dot?: string }[];
	};
	for (const n of bg.nhom) {
		const hang = lt.hang.filter((h) => (h.phu ?? []).includes(n.ma));
		can(
			than.includes(`**${n.ten}** — ${n.tinHieu.length} tín hiệu`) &&
				hang.every((h) => than.includes(h.cau_giao ?? "")),
			`than PR thieu nhom ${n.ma}`,
			loi,
		);
	}
	can(bg.nhom.length === 2, "6 ban gom gia khong co hai nhom", loi);
	for (const l of bg.le)
		can(than.includes(l.lyDo), "6 than thieu ly do le", loi);
	for (const d of [GOM.than.sua, GOM.than.phuQuyet, GOM.than.gop])
		can(than.includes(d), "6 than thieu dong cach lam", loi);
	const ids = ["crm-1", "crm-2", "crm-3", "crm-4", "crm-5"];
	can(docKhoiMay(than).dau === dauTap(ids), "6 dau tap sai", loi);
	can(
		!gh.nhatKy().some((x) => x.includes("merge") || x.includes("ready")),
		"7 co loi goi gop hay san sang",
		loi,
	);
	const av = cl.argv() ?? [];
	can(
		av.includes("-p") &&
			lay(av, "--model") === GOM.moHinh.ten &&
			lay(av, "--max-turns") === String(GOM.moHinh.tranLuot) &&
			lay(av, "--allowedTools") === GOM.moHinh.congCu,
		"8 loi goi mo hinh sai co",
		loi,
	);
	const loiDan = lay(av, "-p") ?? "";
	can(
		loiDan.includes("acceptance-gate:gom-tin-hieu") &&
			loiDan.includes("acceptance-gate:cat-luot"),
		"8 loi dan thieu ten skill",
		loi,
	);
	const tieuDe1 = (
		JSON.parse(
			readFileSync(path.join(nhanh, "tin-hieu/crm/crm-1.json"), "utf8"),
		) as {
			noi_dung: { tieu_de: string };
		}
	).noi_dung.tieu_de;
	can(
		than.includes(tieuDe1) &&
			than.includes("«Quản trị nhập OKR từ bảng tính có đủ cột Loại mục tiêu»"),
		"9 than thieu tin hieu da phu kem viec da giao",
		loi,
	);
	can(!/crm-\d+/.test(than), "9 than lot ma tin hieu", loi);
	const truoc = readFileSync(path.join(nhanh, GOM.vung.trang), "utf8");
	spawnSync("node", ["scripts/product-map.mjs"], { cwd: nhanh });
	const sau = readFileSync(path.join(nhanh, GOM.vung.trang), "utf8");
	can(
		truoc === sau &&
			lt.hang.filter((h) => h.dot).every((h) => sau.includes(h.cau_giao ?? "")),
		"trang lo trinh khong ve lai",
		loi,
	);
	return loi;
}

describe("gtc-de-xuat", () => {
	test(
		"gtc-de-xuat: 10 dong — PR nhap dung khuon, khong gop",
		async () => {
			expect(await kiemDeXuat(chayGom)).toEqual([]);
		},
		LAU,
	);
	test(
		"gtc-de-xuat: chieu do — bo --draft",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: '"create",\n\t\t\t\t\t"--draft",',
					thanh: '"create",',
				},
			]);
			expect(await kiemDeXuat(fn)).toContain("PR de xuat khong phai nhap");
		},
		LAU,
	);
	test(
		"gtc-de-xuat: chieu do — than bo nhom thu hai",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-than-pr.ts",
					tu: "for (const n of o.banGom.nhom) {",
					thanh: "for (const n of o.banGom.nhom.slice(0, 1)) {",
				},
			]);
			expect(await kiemDeXuat(fn)).toContain("than PR thieu nhom G2");
		},
		LAU,
	);
	test(
		"gtc-de-xuat: chieu do — khong ve lai trang",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: 'const ve = chay("node", [...GOM.vung.veLai], o.goc, envChay);',
					thanh: 'const ve = { ma: 0, ra: "", loi: "" };',
				},
			]);
			expect(await kiemDeXuat(fn)).toContain("trang lo trinh khong ve lai");
		},
		LAU,
	);
});

async function kiemRangDo(
	fn: Chay,
	cheDo: Parameters<typeof claudeGia>[0],
	phaiCo: (dong: string) => boolean,
	ten: string,
	khongGiao = `${ten}: PR bi mo hay sua`,
): Promise<string[]> {
	const loi: string[] = [];
	const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4, 5] });
	const cl = claudeGia(cheDo);
	const gh = ghGia();
	const kq = await chayVoi(fn, kho, cl, gh);
	can(kq.ma === 1, `${ten}: khong ma 1`, loi);
	can(sha(kho, DE_XUAT) === null, khongGiao, loi);
	can(tao(gh).length === 0 && sua(gh).length === 0, khongGiao, loi);
	can(
		kq.dong.some(phaiCo),
		`${ten}: nhat ky khong goi ten loi — ${kq.dong.join(" | ")}`,
		loi,
	);
	return loi;
}

describe("gtc-rang-do", () => {
	const CA: [Parameters<typeof claudeGia>[0], (d: string) => boolean][] = [
		["bo-sot", (d) => d.includes("crm-1")],
		["hai-cho", (d) => d.includes("crm-1")],
		["lot-ma", (d) => d.includes("crm-1")],
		["hang-sai", (d) => d.includes("G2")],
		["khong-gom", (d) => d === GOM.thongDiep.soBanGom],
		["hai-gom", (d) => d === GOM.thongDiep.soBanGom],
	];
	for (const [cheDo, phaiCo] of CA)
		test(
			`gtc-rang-do: ${cheDo} -> do, khong giao`,
			async () => {
				expect(await kiemRangDo(chayGom, cheDo, phaiCo, cheDo)).toEqual([]);
			},
			LAU,
		);
	test(
		"gtc-rang-do: ca do goi dung lenh do",
		async () => {
			const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4, 5] });
			const kq = await chayVoi(chayGom, kho, claudeGia("lot-ma"), ghGia());
			expect(kq.dong[0]).toBe(GOM.thongDiep.cauDo);
			const kho2 = dungKhoGom({ tinHieu: [1, 2, 3, 4, 5] });
			const kq2 = await chayVoi(chayGom, kho2, claudeGia("bo-sot"), ghGia());
			expect(kq2.dong[0]).toBe(GOM.thongDiep.rangDo);
			const kho3 = dungKhoGom({ tinHieu: [1, 2, 3, 4, 5] });
			const kq3 = await chayVoi(chayGom, kho3, claudeGia("hang-sai"), ghGia());
			expect(kq3.dong[0]).toBe(GOM.thongDiep.catLuotDo);
		},
		LAU,
	);
	test(
		"gtc-rang-do: chieu do — bo buoc kiem cau",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "if (cau.ma !== 0)",
					thanh: "if (cau.ma !== 0 && false)",
				},
			]);
			expect(
				await kiemRangDo(
					fn,
					"lot-ma",
					(d) => d.includes("crm-1"),
					"lot-ma",
					"de xuat lot ma toi nguoi gui",
				),
			).toContain("de xuat lot ma toi nguoi gui");
		},
		LAU,
	);
});

async function kiemChamNgoai(
	fn: Chay,
	cheDo: Parameters<typeof claudeGia>[0],
	tep: string,
	khongGiao = `${cheDo}: nhanh de xuat bi day`,
): Promise<string[]> {
	const loi: string[] = [];
	const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4, 5] });
	const gh = ghGia();
	const kq = await chayVoi(fn, kho, claudeGia(cheDo), gh);
	can(kq.ma === 1, `${cheDo}: khong ma 1`, loi);
	can(
		kq.dong[0] === GOM.thongDiep.chamNgoai && kq.dong.includes(tep),
		`${cheDo}: khong goi ten ${tep} — ${kq.dong.join(" | ")}`,
		loi,
	);
	can(sha(kho, DE_XUAT) === null, khongGiao, loi);
	can(tao(gh).length === 0 && sua(gh).length === 0, khongGiao, loi);
	return loi;
}

describe("gtc-cham-ngoai", () => {
	const CA: [Parameters<typeof claudeGia>[0], string][] = [
		["ngoai-commit", "apps/app/package.json"],
		["ngoai-chua-theo-doi", "scripts/x.ts"],
		["xoa-tin-hieu", "tin-hieu/crm/crm-1.json"],
		["ngoai-config", "_acceptance/config.yaml"],
	];
	for (const [cheDo, tep] of CA)
		test(
			`gtc-cham-ngoai: ${cheDo}`,
			async () => {
				expect(await kiemChamNgoai(chayGom, cheDo, tep)).toEqual([]);
			},
			LAU,
		);
	test(
		"gtc-cham-ngoai: tep trong vung chua commit duoc commit not",
		async () => {
			const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4, 5] });
			const kq = await chayVoi(
				chayGom,
				kho,
				claudeGia("khong-commit"),
				ghGia(),
			);
			expect(kq.ma).toBe(0);
			expect(sha(kho, DE_XUAT)).not.toBeNull();
		},
		LAU,
	);
	test(
		"gtc-cham-ngoai: chieu do — chi kiem tep da commit",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "const ngoai = new Set(ban.filter((t) => !trongVung(t)));",
					thanh: "const ngoai = new Set<string>();",
				},
			]);
			const ghim = "tep chua commit ngoai vung lot qua";
			expect(
				await kiemChamNgoai(fn, "ngoai-chua-theo-doi", "scripts/x.ts", ghim),
			).toContain(ghim);
			expect(
				await kiemChamNgoai(
					fn,
					"ngoai-config",
					"_acceptance/config.yaml",
					ghim,
				),
			).toContain(ghim);
		},
		LAU,
	);
});

async function kiemNguoiSua(fn: Chay): Promise<string[]> {
	const loi: string[] = [];
	const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4] });
	const cl = claudeGia("dung");
	const gh = ghGia();
	await chayVoi(chayGom, kho, cl, gh);
	commitNguoi(kho);
	themTinHieu(kho, 6);
	const truoc = sha(kho, DE_XUAT);
	const soGoi = gh.nhatKy().length;
	cl.xoaVet();
	const kq = await chayVoi(fn, kho, cl, gh);
	can(kq.ma === 0, "ca 1 khong ma 0", loi);
	can(!cl.daGoi(), "luot may de len sua cua nguoi", loi);
	can(sha(kho, DE_XUAT) === truoc, "luot may de len sua cua nguoi", loi);
	const moi = gh.nhatKy().slice(soGoi);
	can(
		!moi.some((a) => a[1] === "edit" || a[1] === "create"),
		"luot may de len sua cua nguoi",
		loi,
	);
	can(kq.dong[0] === GOM.thongDiep.nguoiSua, "ca 1 dong in sai", loi);
	return loi;
}

describe("gtc-nguoi-sua", () => {
	test(
		"gtc-nguoi-sua: ca 1 — co commit cua nguoi thi khong dung",
		async () => {
			expect(await kiemNguoiSua(chayGom)).toEqual([]);
		},
		LAU,
	);
	test(
		"gtc-nguoi-sua: ca 2 — cung dau thi khong goi mo hinh",
		async () => {
			const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4] });
			const cl = claudeGia("dung");
			const gh = ghGia();
			await chayVoi(chayGom, kho, cl, gh);
			const truoc = sha(kho, DE_XUAT);
			cl.xoaVet();
			const kq = await chayVoi(chayGom, kho, cl, gh);
			expect(cl.daGoi()).toBe(false);
			expect(sha(kho, DE_XUAT)).toBe(truoc);
			expect(kq.dong[0]).toBe(GOM.thongDiep.cungDau);
		},
		LAU,
	);
	test(
		"gtc-nguoi-sua: ca 3 — tin hieu moi thi dung lai cung PR",
		async () => {
			const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4] });
			const cl = claudeGia("dung");
			const gh = ghGia();
			await chayVoi(chayGom, kho, cl, gh);
			const gio1 = docKhoiMay(gh.prs()[0]?.body ?? "").gio;
			themTinHieu(kho, 6);
			cl.xoaVet();
			const kq = await chayVoi(chayGom, kho, cl, gh);
			expect(kq.ma).toBe(0);
			expect(cl.daGoi()).toBe(true);
			expect(kit(banSaoNhanh(kho), "--rang").status).toBe(0);
			expect(g(kho.origin, ["merge-base", CHINH, DE_XUAT])).toBe(
				sha(kho, CHINH) ?? "",
			);
			expect(tao(gh).length).toBe(1);
			const s = sua(gh);
			expect(s.length).toBe(1);
			expect(s[0]?.[2]).toBe("1");
			const k = docKhoiMay(gh.prs()[0]?.body ?? "");
			expect(k.dau).toBe(dauTap(["crm-1", "crm-2", "crm-3", "crm-4", "crm-6"]));
			expect(k.gio["crm-1"]).toBe(gio1["crm-1"] ?? "");
			expect(Object.keys(k.gio).sort()).toEqual([
				"crm-1",
				"crm-2",
				"crm-3",
				"crm-4",
				"crm-6",
			]);
		},
		LAU,
	);
	test(
		"gtc-nguoi-sua: than sua tay mat khoi may thi coi nhu chua co dau",
		async () => {
			const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4] });
			const cl = claudeGia("dung");
			const gh = ghGia();
			await chayVoi(chayGom, kho, cl, gh);
			gh.datPr(gh.prs().map((p) => ({ ...p, body: "anh viet lai than" })));
			cl.xoaVet();
			const kq = await chayVoi(chayGom, kho, cl, gh);
			expect(kq.ma).toBe(0);
			expect(cl.daGoi()).toBe(true);
			expect(tao(gh).length).toBe(1);
		},
		LAU,
	);
	test(
		"gtc-nguoi-sua: gh tra JSON la thi do co ten",
		async () => {
			const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4] });
			const gh = ghGia();
			gh.loiDanhSach('{"khong":"phai mang"}');
			const kq = await chayVoi(chayGom, kho, claudeGia("dung"), gh);
			expect(kq.ma).toBe(1);
			expect(kq.dong[0]).toBe(GOM.thongDiep.danhSachLa);
			expect(tao(gh).length).toBe(0);
		},
		LAU,
	);
	test(
		"gtc-nguoi-sua: chieu do — bo kiem tac gia",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "if (tacGia.some((t) => t !== GOM.tacGia.thu))",
					thanh: 'if (tacGia.some((t) => t === "khong-ai"))',
				},
			]);
			expect(await kiemNguoiSua(fn)).toContain("luot may de len sua cua nguoi");
		},
		LAU,
	);
});

async function kiemPhuQuyet(
	fn: Chay,
	trangThai: "CLOSED" | "MERGED",
): Promise<{ loi: string[]; dong: string[] }> {
	const loi: string[] = [];
	const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4] });
	const cl = claudeGia("dung");
	const gh = ghGia();
	await chayVoi(chayGom, kho, cl, gh);
	gh.doiTrangThai(
		1,
		trangThai,
		trangThai === "MERGED" ? new Date().toISOString() : undefined,
	);
	cl.xoaVet();
	const kq = await chayVoi(fn, kho, cl, gh);
	can(kq.ma === 0, "ca 1 khong ma 0", loi);
	can(!cl.daGoi(), "de xuat bi phu quyet mo lai", loi);
	can(tao(gh).length === 1, "de xuat bi phu quyet mo lai", loi);
	can(kq.dong[0] === GOM.thongDiep.phuQuyet, "ca 1 dong in sai", loi);
	return { loi, dong: kq.dong };
}

describe("gtc-phu-quyet", () => {
	test(
		"gtc-phu-quyet: ca 1 — cung tap thi khong mo lai",
		async () => {
			expect((await kiemPhuQuyet(chayGom, "CLOSED")).loi).toEqual([]);
		},
		LAU,
	);
	test(
		"gtc-phu-quyet: ca 2 — tin hieu moi thi de xuat moi mang ten nhom cu",
		async () => {
			const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4] });
			const cl = claudeGia("dung");
			const gh = ghGia();
			await chayVoi(chayGom, kho, cl, gh);
			gh.doiTrangThai(1, "CLOSED");
			themTinHieu(kho, 6);
			cl.xoaVet();
			const kq = await chayVoi(chayGom, kho, cl, gh);
			expect(kq.ma).toBe(0);
			const loiDan = lay(cl.argv() ?? [], "-p") ?? "";
			for (const ten of [TEN_NHOM.G1]) expect(loiDan).toContain(`«${ten}»`);
			const t = tao(gh);
			expect(t.length).toBe(2);
			expect(t[1]).toContain("--draft");
			expect(kit(banSaoNhanh(kho), "--rang").status).toBe(0);
			expect(
				Object.keys(docKhoiMay(gh.prs()[1]?.body ?? "").gio).sort(),
			).toEqual(["crm-1", "crm-2", "crm-3", "crm-4", "crm-6"]);
		},
		LAU,
	);
	test(
		"gtc-phu-quyet: doi chung duong — PR da gop thi khong phai phu quyet",
		async () => {
			const { dong } = await kiemPhuQuyet(chayGom, "MERGED");
			expect(dong[0]).not.toBe(GOM.thongDiep.phuQuyet);
		},
		LAU,
	);
	test(
		"gtc-phu-quyet: chieu do — bo kiem PR da dong",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: 'if (cuoi && cuoi.state === "CLOSED" && !cuoi.mergedAt) {',
					thanh: "if (false) {",
				},
			]);
			expect((await kiemPhuQuyet(fn, "CLOSED")).loi).toContain(
				"de xuat bi phu quyet mo lai",
			);
		},
		LAU,
	);
});

async function kiemHong(fn: Chay): Promise<string[]> {
	const loi: string[] = [];
	const CA: {
		ten: string;
		cl: () => ClaudeGia | string;
		env?: Record<string, string | undefined>;
		tranMs?: number;
		dong: (d: string[]) => boolean;
	}[] = [
		{
			ten: "thieu khoa",
			cl: () => claudeGia("dung"),
			env: { AG },
			dong: (d) => d[0] === GOM.thongDiep.thieuKhoa,
		},
		{
			ten: "thieu lenh",
			cl: () => path.join(thuMuc("khong"), "claude"),
			dong: (d) => d[0] === GOM.thongDiep.thieuLenh,
		},
		{
			ten: "mo hinh hong",
			cl: () => claudeGia("thoat-1"),
			dong: (d) =>
				d[0] === GOM.thongDiep.moHinhHong &&
				d.some((x) => x.includes("loi mo hinh gia")),
		},
		{
			ten: "qua tran",
			cl: () => claudeGia("ngu"),
			tranMs: 1_000,
			dong: (d) => d[0] === GOM.thongDiep.quaTran,
		},
	];
	for (const ca of CA) {
		const kho = dungKhoGom({ tinHieu: [1, 2, 3, 4] });
		const gh = ghGia();
		const kq = await chayVoi(fn, kho, ca.cl(), gh, {
			...(ca.env ? { env: ca.env } : {}),
			...(ca.tranMs ? { tranMs: ca.tranMs } : {}),
		});
		can(kq.ma === 1, `${ca.ten}: khong ma 1`, loi);
		can(
			ca.dong(kq.dong),
			`${ca.ten}: thong diep sai — ${kq.dong.join(" | ")}`,
			loi,
		);
		can(sha(kho, DE_XUAT) === null, `${ca.ten}: nhanh bi day`, loi);
		can(
			tao(gh).length === 0 && sua(gh).length === 0,
			`${ca.ten}: PR bi mo`,
			loi,
		);
		can(
			!kq.dong.join("\n").includes(KHOA_GIA),
			"khoa mo hinh lot vao nhat ky",
			loi,
		);
	}
	return loi;
}

describe("gtc-hong", () => {
	test(
		"gtc-hong: 4 ca hong deu do, goi ten, khong lot khoa",
		async () => {
			expect(await kiemHong(chayGom)).toEqual([]);
		},
		LAU,
	);
	test(
		"gtc-hong: chieu do — ban sao in env khi mo hinh hong",
		async () => {
			const fn = await banTiem([
				{
					tep: "gom-lich.ts",
					tu: "return do1(\n\t\t\t[GOM.thongDiep.moHinhHong, dauDong(ph.loi || ph.ra)].filter(Boolean),\n\t\t);",
					thanh:
						"return { ma: 1, dong: [GOM.thongDiep.moHinhHong, dauDong(ph.loi || ph.ra), JSON.stringify(o.env)] };",
				},
			]);
			expect(await kiemHong(fn)).toContain("khoa mo hinh lot vao nhat ky");
		},
		LAU,
	);
});
