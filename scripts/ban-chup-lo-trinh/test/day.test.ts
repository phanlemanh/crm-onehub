import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import {
	BAN_CHUP_LO_TRINH,
	banChupRa,
	banChupVao,
	type KetQuaBanChup,
} from "../../../packages/validation/src/ban-chup-lo-trinh.ts";
import { DUONG_DAY, day, TIEU_DE_GHI_CHU } from "../day.ts";

const GOC = path.resolve(import.meta.dir, "..", "..", "..");
const SHA = spawnSync("git", ["rev-parse", "HEAD"], {
	cwd: GOC,
	encoding: "utf8",
}).stdout.trim();
const COMMIT_LUC = spawnSync("git", ["log", "-1", "--format=%cI", SHA], {
	cwd: GOC,
	encoding: "utf8",
}).stdout.trim();
const KHOA = "crm_khoa_thu";
const URL_API = "http://crm.thu";
const ENV = { CRM_API_URL: URL_API, CRM_KHOA_DAY_LO_TRINH: KHOA };

type Workflow = {
	on: {
		push: { branches: string[]; paths: string[] };
		workflow_dispatch?: null;
	};
	concurrency: { group: string; "cancel-in-progress": boolean };
	jobs: Record<
		string,
		{ if: string; steps: { run?: string; env?: Record<string, string> }[] }
	>;
};

type Goi = { url: string; khoa: string | null; than: unknown };

function mayChu(tra: (g: Goi) => Response | Promise<Response>) {
	const goi: Goi[] = [];
	const f = async (url: string | URL | Request, init?: RequestInit) => {
		const headers = new Headers(init?.headers);
		const g = {
			url: String(url),
			khoa: headers.get("x-api-key"),
			than: JSON.parse(String(init?.body)),
		};
		goi.push(g);
		return tra(g);
	};
	return { goi, fetch: f };
}

const traKetQua = (ketQua: KetQuaBanChup) => () =>
	Response.json(banChupRa.parse({ ketQua }));

async function chay(o: {
	env?: Record<string, string | undefined>;
	fetch: (url: string | URL | Request, init?: RequestInit) => Promise<Response>;
	goc?: string;
}) {
	const ra: string[] = [];
	const loi: string[] = [];
	const ma = await day({
		goc: o.goc ?? GOC,
		env: o.env ?? ENV,
		fetch: o.fetch,
		sha: SHA,
		commitLuc: COMMIT_LUC,
		in: (d) => ra.push(d),
		loi: (d) => loi.push(d),
	});
	return { ma, ra, loi };
}

const ghiChu = (ra: string[]) =>
	ra.filter((d) => d.startsWith(`::notice title=${TIEU_DE_GHI_CHU}::`));

describe("day", () => {
	test("than gui dung khuon, dung sha, gio commit, khoa va khoi that", async () => {
		const may = mayChu(traKetQua("nhan"));
		const { ma, ra } = await chay({ fetch: may.fetch });
		expect(ma).toBe(0);
		expect(may.goi.length).toBe(1);
		const [g] = may.goi;
		expect(g?.url).toBe(new URL(DUONG_DAY, URL_API).toString());
		expect(g?.khoa).toBe(KHOA);
		const than = banChupVao.parse(g?.than);
		expect(than.nguon).toBe(BAN_CHUP_LO_TRINH.nguonCrm);
		expect(than.sha).toBe(SHA);
		expect(than.commitLuc).toBe(COMMIT_LUC);
		const khoi = docDuLieu(
			readFileSync(path.join(GOC, "LO-TRINH.html"), "utf8"),
		);
		expect(than.duLieu).toEqual(JSON.parse(JSON.stringify(khoi.duLieu)));
		expect(ghiChu(ra)).toEqual([`::notice title=${TIEU_DE_GHI_CHU}::nhan`]);
	});

	for (const ketQua of BAN_CHUP_LO_TRINH.ketQua)
		test(`ket qua ${ketQua}: ma 0, dung mot ghi chu`, async () => {
			const { ma, ra } = await chay({ fetch: mayChu(traKetQua(ketQua)).fetch });
			expect(ma).toBe(0);
			expect(ghiChu(ra)).toEqual([
				`::notice title=${TIEU_DE_GHI_CHU}::${ketQua}`,
			]);
		});

	test("workflow: day khi nhanh chinh doi lo trinh, khong huy luot dang chay", () => {
		const wf: Workflow = Bun.YAML.parse(
			readFileSync(
				path.join(GOC, ".github", "workflows", "ban-chup-lo-trinh.yml"),
				"utf8",
			),
		) as Workflow;
		expect("workflow_dispatch" in wf.on).toBe(true);
		expect(wf.on.push.branches).toEqual(["onehub"]);
		expect(wf.on.push.paths).toContain("LO-TRINH.html");
		expect(
			wf.concurrency["cancel-in-progress"]
				? "huy luot dang chay lam mat thu tu"
				: "giu thu tu",
		).toBe("giu thu tu");
		const job = Object.values(wf.jobs)[0];
		expect(job?.if).toContain("phanlemanh/crm-onehub");
		const buoc = job?.steps.find((s) =>
			s.run?.includes("scripts/ban-chup-lo-trinh/day.ts"),
		);
		expect(buoc?.env?.CRM_API_URL).toContain("secrets.CRM_API_URL");
		expect(buoc?.env?.CRM_KHOA_DAY_LO_TRINH).toContain(
			"secrets.CRM_KHOA_DAY_LO_TRINH",
		);
	});
});

describe("ma-thoat", () => {
	const khongKetNoi = async (): Promise<Response> => {
		throw new TypeError("fetch failed");
	};
	const ca: [
		string,
		() => Promise<{ ma: number; loi: string[]; soGoi: number }>,
		number,
	][] = [
		[
			"a may chu tra 400",
			async () => {
				const may = mayChu(() =>
					Response.json(
						{
							message: "Input validation failed",
							code: "BAD_REQUEST",
							issues: [{ path: ["duLieu", "lo_trinh"], message: "Required" }],
						},
						{ status: 400 },
					),
				);
				const kq = await chay({ fetch: may.fetch });
				return { ...kq, soGoi: may.goi.length };
			},
			1,
		],
		[
			"b may chu 500",
			async () => {
				const may = mayChu(() => new Response("loi", { status: 500 }));
				const kq = await chay({ fetch: may.fetch });
				return { ...kq, soGoi: may.goi.length };
			},
			1,
		],
		[
			"c khong ket noi duoc",
			async () => ({ ...(await chay({ fetch: khongKetNoi })), soGoi: 1 }),
			1,
		],
		[
			"d tep khong co khoi",
			async () => {
				const goc = mkdtempSync(path.join(tmpdir(), "ldbc-day-"));
				writeFileSync(path.join(goc, "LO-TRINH.html"), "<html></html>");
				const may = mayChu(traKetQua("nhan"));
				const kq = await chay({ fetch: may.fetch, goc });
				return { ...kq, soGoi: may.goi.length };
			},
			1,
		],
		[
			"e may chu nhan",
			async () => {
				const may = mayChu(traKetQua("nhan"));
				const kq = await chay({ fetch: may.fetch });
				return { ...kq, soGoi: may.goi.length };
			},
			0,
		],
	];

	for (const [ten, chayCa, kyVong] of ca)
		test(ten, async () => {
			const kq = await chayCa();
			expect(`${ten}: ma ${kq.ma}`).toBe(`${ten}: ma ${kyVong}`);
			if (kyVong === 1) expect(kq.loi.length).toBeGreaterThan(0);
			if (ten.startsWith("a"))
				expect(kq.loi.join("\n")).toContain("duLieu.lo_trinh");
			if (ten.startsWith("d")) expect(kq.soGoi).toBe(0);
		});
});

describe("chua-cai", () => {
	const ca: [string, Record<string, string | undefined>][] = [
		["thieu khoa", { CRM_API_URL: URL_API }],
		["thieu dia chi", { CRM_KHOA_DAY_LO_TRINH: KHOA }],
		["thieu ca hai", {}],
	];
	for (const [ten, env] of ca)
		test(`${ten}: ma 0, ghi chu chua-cai, khong goi mang`, async () => {
			const may = mayChu(traKetQua("nhan"));
			const { ma, ra } = await chay({ fetch: may.fetch, env });
			expect(`${ten}: ma ${ma}`).toBe(`${ten}: ma 0`);
			expect(ghiChu(ra)).toEqual([
				`::notice title=${TIEU_DE_GHI_CHU}::chua-cai`,
			]);
			expect(may.goi.length).toBe(0);
		});
});

describe("chay-that", () => {
	test("khoi chinh cua day.ts gui sha va gio commit cua HEAD that", async () => {
		const nhan: unknown[] = [];
		const mayThat = Bun.serve({
			port: 0,
			fetch: async (req) => {
				nhan.push(await req.json());
				return Response.json(banChupRa.parse({ ketQua: "nhan" }));
			},
		});
		try {
			const tien = Bun.spawn(["bun", "scripts/ban-chup-lo-trinh/day.ts"], {
				cwd: GOC,
				env: {
					...process.env,
					CRM_API_URL: `http://127.0.0.1:${mayThat.port}`,
					CRM_KHOA_DAY_LO_TRINH: KHOA,
				},
				stdout: "pipe",
				stderr: "pipe",
			});
			const ma = await tien.exited;
			const ra = await new Response(tien.stdout).text();
			expect(ma, await new Response(tien.stderr).text()).toBe(0);
			expect(ra).toContain(`::notice title=${TIEU_DE_GHI_CHU}::nhan`);
			expect(nhan.length).toBe(1);
			const than = banChupVao.parse(nhan[0]);
			const head = spawnSync(
				"git",
				["show", "-s", "--format=%H%n%cI", "HEAD"],
				{
					cwd: GOC,
					encoding: "utf8",
				},
			)
				.stdout.trim()
				.split("\n");
			expect(than.sha, "ban chup khong mang sha cua HEAD").toBe(head[0] ?? "");
			expect(than.commitLuc, "gio commit khong phai cua HEAD").toBe(
				head[1] ?? "",
			);
		} finally {
			mayThat.stop(true);
		}
	});
});
