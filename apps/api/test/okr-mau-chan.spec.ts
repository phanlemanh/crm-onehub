import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import {
	type KetQuaChan,
	kiemDuocNap,
	type MoiTruongNap,
} from "../scripts/okr-mau/chan";

const GOC_API = join(import.meta.dir, "..");
const GOC_KHO = join(GOC_API, "..", "..");
const url = (may: string) => `postgresql://u:p@${may}:5432/crm`;

type Ca = {
	ten: string;
	env: MoiTruongNap & { ALLOW_REMOTE_DB?: string };
	ky: { cho: boolean; lyDo?: string };
};

const NGOAI = [
	"ep-x.us-east-1.aws.neon.tech",
	"db.example.com",
	"10.0.0.5",
	"203.0.113.9",
	"[2001:db8::1]",
];
const CUC_BO = ["localhost", "127.0.0.1", "[::1]"];

const BANG: Ca[] = [
	...NGOAI.flatMap((may) => [
		{
			ten: `ngoài ${may}`,
			env: { DATABASE_URL: url(may) },
			ky: { cho: false, lyDo: "may-chu" },
		},
		{
			ten: `ngoài ${may} + ALLOW_REMOTE_DB`,
			env: { DATABASE_URL: url(may), ALLOW_REMOTE_DB: "1" },
			ky: { cho: false, lyDo: "may-chu" },
		},
	]),
	...CUC_BO.map((may) => ({
		ten: `cục bộ ${may}`,
		env: { DATABASE_URL: url(may) },
		ky: { cho: true },
	})),
	{
		ten: "cục bộ + NODE_ENV production",
		env: { DATABASE_URL: url("localhost"), NODE_ENV: "production" },
		ky: { cho: false, lyDo: "moi-truong" },
	},
	{
		ten: "cục bộ + VERCEL_ENV production",
		env: { DATABASE_URL: url("localhost"), VERCEL_ENV: "production" },
		ky: { cho: false, lyDo: "moi-truong" },
	},
	{
		ten: "cục bộ + VERCEL_ENV preview",
		env: { DATABASE_URL: url("localhost"), VERCEL_ENV: "preview" },
		ky: { cho: false, lyDo: "moi-truong" },
	},
	{
		ten: "cục bộ + VERCEL_ENV preview + ALLOW_REMOTE_DB",
		env: {
			DATABASE_URL: url("localhost"),
			VERCEL_ENV: "preview",
			ALLOW_REMOTE_DB: "1",
		},
		ky: { cho: false, lyDo: "moi-truong" },
	},
	{
		ten: "cục bộ + VERCEL_ENV development",
		env: { DATABASE_URL: url("localhost"), VERCEL_ENV: "development" },
		ky: { cho: true },
	},
	{
		ten: "cục bộ + VERCEL_ENV rỗng",
		env: { DATABASE_URL: url("localhost"), VERCEL_ENV: "" },
		ky: { cho: true },
	},
	{
		ten: "thử nghiệm đọc TEST_DATABASE_URL",
		env: {
			NODE_ENV: "test",
			DATABASE_URL: url("localhost"),
			TEST_DATABASE_URL: url("db.example.com"),
		},
		ky: { cho: false, lyDo: "may-chu" },
	},
	{ ten: "thiếu URL", env: {}, ky: { cho: false, lyDo: "thieu-url" } },
];

function sai(kiem: (env: Ca["env"]) => KetQuaChan): string[] {
	return BANG.filter((ca) => {
		const r = kiem(ca.env);
		return r.cho !== ca.ky.cho || (!r.cho && r.lyDo !== ca.ky.lyDo);
	}).map((ca) => ca.ten);
}

function chay(args: string[], env: Record<string, string>) {
	const moi: NodeJS.ProcessEnv = { ...process.env };
	for (const k of [
		"DATABASE_URL",
		"TEST_DATABASE_URL",
		"NODE_ENV",
		"VERCEL_ENV",
	])
		delete moi[k];
	Object.assign(moi, env);
	const batDau = Date.now();
	const r = spawnSync("bun", ["scripts/okr-mau.ts", ...args], {
		cwd: GOC_API,
		env: moi,
		encoding: "utf8",
		timeout: 30_000,
	});
	return { ma: r.status, loi: r.stderr, ms: Date.now() - batDau };
}

describe("chan-production", () => {
	test("bảng ca viết trước: chỉ máy cục bộ ngoài môi trường production/bản xem trước mới qua", () => {
		expect(sai(kiemDuocNap)).toEqual([]);
	});

	test("chiều đỏ: bản chặn biết nghe ALLOW_REMOTE_DB thì bảng gọi tên đúng các ca", () => {
		const banPha = (env: Ca["env"]): KetQuaChan =>
			env.ALLOW_REMOTE_DB === "1"
				? { cho: true, mayChu: "vuot" }
				: kiemDuocNap(env);
		expect(sai(banPha)).toEqual([
			...NGOAI.map((may) => `ngoài ${may} + ALLOW_REMOTE_DB`),
			"cục bộ + VERCEL_ENV preview + ALLOW_REMOTE_DB",
		]);
	});

	test("lệnh với cơ sở dữ liệu Neon giả: thoát 2 ngay, nêu máy chủ, không thử kết nối", () => {
		for (const args of [[], [OKR_MAU.co.xoa]]) {
			const r = chay(args, {
				DATABASE_URL: "postgresql://u:p@ep-khong-ton-tai.invalid/db",
				ALLOW_REMOTE_DB: "1",
			});
			expect(r.ma, r.loi).toBe(OKR_MAU.ma.chan);
			expect(r.ms).toBeLessThan(5_000);
			expect(r.loi).toContain("ep-khong-ton-tai.invalid");
			expect(r.loi).toContain("không phải máy cục bộ");
			expect(r.loi).not.toMatch(/ECONNREFUSED|ENOTFOUND|P1001/);
		}
	});

	test("đối chứng: máy cục bộ với VERCEL_ENV=development qua bước chặn (dừng ở tham số sai, không ghi)", () => {
		const r = chay([OKR_MAU.co.moc, "mai"], {
			DATABASE_URL: "postgresql://u:p@localhost:1/khong-co",
			VERCEL_ENV: "development",
		});
		expect(r.ma, r.loi).toBe(OKR_MAU.ma.sai);
		expect(r.loi).toContain(OKR_MAU.co.moc);
	});

	test("lệnh kiểm chặn trước khi nạp bất cứ module cơ sở dữ liệu nào", () => {
		const tx = new Bun.Transpiler({ loader: "ts" });
		const nguon = readFileSync(join(GOC_API, "scripts/okr-mau.ts"), "utf8");
		const tinh = tx
			.scan(nguon)
			.imports.filter((i) => i.kind === "import-statement")
			.map((i) => i.path);
		expect(tinh).toEqual([
			"@crm/env/load",
			"./okr-mau/cau-hinh",
			"./okr-mau/chan",
		]);
		for (const tep of ["cau-hinh.ts", "chan.ts"]) {
			const nhap = tx
				.scan(readFileSync(join(GOC_API, "scripts/okr-mau", tep), "utf8"))
				.imports.map((i) => i.path);
			expect(
				nhap.filter(
					(p) =>
						p.startsWith("@crm/db") || p.includes("nap") || p.includes("lenh"),
				),
				tep,
			).toEqual([]);
		}
		const chan = nguon.indexOf("kiemDuocNap(process.env)");
		const dong = nguon.indexOf('await import("./okr-mau/lenh")');
		expect(chan).toBeGreaterThan(-1);
		expect(dong).toBeGreaterThan(chan);
	});
});

describe("tai-lieu", () => {
	const setup = readFileSync(join(GOC_KHO, "docs/setup.md"), "utf8");
	const muc = setup.slice(setup.indexOf("## Bộ OKR mẫu"));
	const phan = muc.slice(
		0,
		muc.indexOf("\n## ", 4) === -1 ? undefined : muc.indexOf("\n## ", 4),
	);

	test("mục «Bộ OKR mẫu» nêu mọi cờ, mọi mã thoát, lệnh và chỗ đặt ca thật", () => {
		expect(setup.includes("## Bộ OKR mẫu")).toBe(true);
		for (const co of Object.values(OKR_MAU.co)) expect(phan, co).toContain(co);
		for (const [ten, ma] of Object.entries(OKR_MAU.ma))
			expect(phan, `mã thoát ${ma} (${ten})`).toContain(`mã thoát ${ma}`);
		for (const chu of [
			OKR_MAU.lenh,
			"do:man --chay",
			"dev:session",
			"ca-gop-y/that",
		])
			expect(phan, chu).toContain(chu);
		expect(readFileSync(join(GOC_KHO, "CONTEXT.md"), "utf8")).toMatch(
			/^\*\*Bộ OKR mẫu\*\*:/m,
		);
	});

	test("chiều đỏ: bản sao tài liệu thiếu mã thoát 5 bị gọi tên", () => {
		const thieu = phan.replaceAll("mã thoát 5", "mã thoát");
		const loi = Object.entries(OKR_MAU.ma)
			.filter(([, ma]) => !thieu.includes(`mã thoát ${ma}`))
			.map(([, ma]) => `mã thoát ${ma}`);
		expect(loi).toEqual(["mã thoát 5"]);
	});
});
