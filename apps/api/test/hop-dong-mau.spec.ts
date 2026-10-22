import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { boHopDongMau } from "@crm/validation/hop-dong-mau";
import ts from "typescript";
import { HOP_DONG_MAU } from "../scripts/hop-dong-mau/cau-hinh";
import { KHOA_TRUONG_HOP_DONG } from "../scripts/hop-dong-mau/nap";
import { companyListInput } from "../src/companies/companies.contracts";
import { CompaniesService } from "../src/companies/companies.service";
import { dealListInput } from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldFilesService } from "../src/fields/field-files.service";
import { FieldsService } from "../src/fields/fields.service";
import {
	chay,
	demMau,
	donHangCho,
	donMau,
	dungUngDung,
	dungWorkspace,
	HDM_SAN,
	idMau,
	khoGiaHttp,
	laKhoThu,
} from "./hop-dong-mau-san";

const GOC_API = join(import.meta.dir, "..");
const GOC_KHO = join(GOC_API, "..", "..");
const BO = boHopDongMau().tep;
const SO_THOA_THUAN = BO.length + 1;
const QUAN_TRI = "hdm-thu-quan-tri";

function sha(byte: Uint8Array): string {
	return createHash("sha256").update(byte).digest("hex");
}

async function quanTriThu(): Promise<string> {
	await db.user.upsert({
		where: { id: QUAN_TRI },
		create: {
			id: QUAN_TRI,
			name: QUAN_TRI,
			email: `${QUAN_TRI}@thu.test`,
			emailVerified: true,
		},
		update: {},
	});
	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId: QUAN_TRI },
		},
		create: {
			id: `member-${QUAN_TRI}`,
			organizationId: WORKSPACE_ID,
			userId: QUAN_TRI,
			role: "admin",
			createdAt: new Date(),
		},
		update: { role: "admin" },
	});
	return QUAN_TRI;
}

async function boQuanTriThu(): Promise<void> {
	await db.member.deleteMany({ where: { userId: QUAN_TRI } });
	await db.user.deleteMany({ where: { id: QUAN_TRI } });
}

beforeAll(async () => {
	await laKhoThu();
	await dungWorkspace();
	await donMau();
}, HDM_SAN.hookMs);

afterAll(async () => {
	await donMau();
	await boQuanTriThu();
}, HDM_SAN.hookMs);

describe("hdm-nap", () => {
	test(
		"hdm-nap: lần đầu tạo bản ghi, trường và gắn sáu tệp qua PUT lên URL đã ký",
		async () => {
			const kho = khoGiaHttp();
			try {
				const r = await chay(kho);
				if (r.ma !== 0)
					throw new Error(`hdm nap: ma ${r.ma} ${r.loi.join(" | ")}`);
				const app = await dungUngDung(kho);
				try {
					const congTy = await app
						.get(CompaniesService, { strict: false })
						.list(companyListInput.parse({ q: HOP_DONG_MAU.congTy }));
					if (congTy.total !== 1)
						throw new Error(`hdm nap: ban ghi congTy ${congTy.total}`);
					const ds = await app
						.get(DealsService, { strict: false })
						.list(dealListInput.parse({ q: "HĐ mẫu", pageSize: 50 }));
					if (ds.total !== SO_THOA_THUAN)
						throw new Error(`hdm nap: ban ghi thoaThuan ${ds.total}`);
					const truong = (
						await app.get(FieldsService, { strict: false }).list("DEAL", false)
					).find((f) => f.key === KHOA_TRUONG_HOP_DONG);
					if (
						!truong ||
						truong.type !== "FILE" ||
						truong.agentFilled !== false
					) {
						throw new Error("hdm nap: truong");
					}
					const theoTen = new Map(ds.rows.map((d) => [d.name, d.id]));
					const dealsSvc = app.get(DealsService, { strict: false });
					for (const t of BO) {
						const id = theoTen.get(t.thoaThuan) ?? "";
						const chiTiet = await dealsSvc.byId(id, {
							id: QUAN_TRI,
							role: "admin",
						});
						const tep = chiTiet.tepTheoTruong[KHOA_TRUONG_HOP_DONG] ?? [];
						if (tep.length !== 1 || tep[0]?.tenTep !== t.tenTep) {
							throw new Error(`hdm nap: ${t.ma} tep ${tep.length}`);
						}
						const hang = await db.fieldFile.findFirst({
							where: { dealId: id },
							select: { sha256: true },
						});
						if (hang?.sha256 !== t.sha256)
							throw new Error(`hdm nap: ${t.ma} sha`);
					}
					const khongTep = theoTen.get(HOP_DONG_MAU.thoaThuanKhongTep) ?? "";
					const soKhongTep = await db.fieldFile.count({
						where: { dealId: khongTep },
					});
					if (soKhongTep !== 0)
						throw new Error(`hdm nap: khong tep co ${soKhongTep}`);
					if (
						kho.daPut.size !== BO.length ||
						BO.some(
							(t) => ![...kho.daPut.values()].some((b) => sha(b) === t.sha256),
						)
					) {
						throw new Error(`hdm nap: blob ${kho.daPut.size}`);
					}
					if (kho.soPut() < BO.length)
						throw new Error("hdm nap: khong qua put");
					const chuaCo = await dealsSvc.list(
						dealListInput.parse({
							q: "HĐ mẫu",
							fields: { [KHOA_TRUONG_HOP_DONG]: ["none"] },
						}),
					);
					if (
						chuaCo.total !== 1 ||
						chuaCo.rows[0]?.name !== HOP_DONG_MAU.thoaThuanKhongTep
					) {
						throw new Error("hdm nap: loc chua co");
					}
				} finally {
					await app.close();
				}
				for (const t of BO) {
					if (!r.dong.some((d) => d.startsWith(`${t.ma} · `)))
						throw new Error(`hdm nap: in ${t.ma}`);
				}
			} finally {
				kho.dong();
				await donMau();
			}
		},
		HDM_SAN.baiMs,
	);
});

const CAM_GHI = new Set([
	"create",
	"createMany",
	"upsert",
	"update",
	"updateMany",
	"delete",
	"deleteMany",
]);
const BANG_CAM = new Set([
	"fieldFile",
	"blobChoXoa",
	"deal",
	"company",
	"fieldDefinition",
	"fieldValue",
]);
const BANG_NGUOI = new Set(["user", "member"]);
const SQL_THO = new Set([
	"$executeRaw",
	"$queryRaw",
	"$executeRawUnsafe",
	"$queryRawUnsafe",
]);
const HAM_NGUOI = "nguoiMau";

function hamBao(node: ts.Node): string | null {
	let n: ts.Node | undefined = node.parent;
	while (n) {
		if (ts.isFunctionDeclaration(n) && n.name) return n.name.text;
		n = n.parent;
	}
	return null;
}

function quetGhiThang(ten: string, nguon: string): string[] {
	const tep = ts.createSourceFile(ten, nguon, ts.ScriptTarget.Latest, true);
	const vi: string[] = [];
	const di = (node: ts.Node) => {
		if (ts.isCallExpression(node) || ts.isTaggedTemplateExpression(node)) {
			const goi = ts.isCallExpression(node) ? node.expression : node.tag;
			if (ts.isPropertyAccessExpression(goi)) {
				const ham = goi.name.text;
				const dong =
					tep.getLineAndCharacterOfPosition(node.getStart()).line + 1;
				if (SQL_THO.has(ham)) vi.push(`${ten}:${dong} ${ham}`);
				if (CAM_GHI.has(ham) && ts.isPropertyAccessExpression(goi.expression)) {
					const bang = goi.expression.name.text;
					if (BANG_CAM.has(bang)) vi.push(`${ten}:${dong} ${bang}.${ham}`);
					if (BANG_NGUOI.has(bang) && hamBao(node) !== HAM_NGUOI) {
						vi.push(`nguoi ngoai ham ${ten}:${dong}`);
					}
				}
			}
		}
		ts.forEachChild(node, di);
	};
	di(tep);
	return vi;
}

describe("hdm-khong-ghi-thang", () => {
	test("hdm-khong-ghi-thang: lệnh nạp không ghi thẳng bảng nào ngoài người mẫu", () => {
		const thuMuc = join(GOC_API, "scripts", "hop-dong-mau");
		const tep = [
			join(GOC_API, "scripts", "hop-dong-mau.ts"),
			...readdirSync(thuMuc)
				.filter((t) => t.endsWith(".ts"))
				.map((t) => join(thuMuc, t)),
		];
		if (tep.length <= 1)
			throw new Error("hdm khong ghi thang: khong quet tep nao");
		const vi = tep.flatMap((t) =>
			quetGhiThang(t.slice(GOC_API.length + 1), readFileSync(t, "utf8")),
		);
		if (vi.length > 0) throw new Error(`hdm khong ghi thang: ${vi.join("; ")}`);
	});

	test("hdm-khong-ghi-thang: đối chứng dương — một lời ghi thẳng viết tay bị bắt đúng một lần", () => {
		const vi = quetGhiThang(
			"tay.ts",
			"async function f(tx) { await tx.fieldFile.create({ data }); }",
		);
		if (vi.length !== 1) throw new Error("hdm khong ghi thang: thuoc mu");
		expect(vi[0]).toContain("fieldFile.create");
	});
});

async function anhChup(dealId: string, congTyId: string) {
	const app = await dungUngDung(khoGiaHttp());
	try {
		const deal = await app
			.get(DealsService, { strict: false })
			.byId(dealId, { id: QUAN_TRI, role: "admin" });
		const cty = await db.company.findUnique({
			where: { id: congTyId },
			select: { id: true, name: true, archivedAt: true },
		});
		return { ten: deal.name, tep: deal.tepTheoTruong, cty };
	} finally {
		await app.close();
	}
}

describe("hdm-chay-lai", () => {
	test(
		"hdm-chay-lai: chạy ba lần không nhân đôi, dữ liệu ngoài bộ mẫu không đổi",
		async () => {
			const kho = khoGiaHttp();
			const ngoai = { cty: "", deal: "" };
			try {
				const nguoi = await quanTriThu();
				const app = await dungUngDung(kho);
				try {
					await app.get(FieldsService, { strict: false }).create(nguoi, {
						entity: "DEAL",
						label: HOP_DONG_MAU.truong.nhan,
						type: "FILE",
						options: [],
						agentFilled: false,
						agentBrief: null,
						required: false,
						showOnSheet: true,
						showOnTable: true,
						showOnFilter: true,
					});
					ngoai.cty = (
						await app
							.get(CompaniesService, { strict: false })
							.create({ name: "hdm thu cong ty ngoai", ownerId: nguoi })
					).id;
					ngoai.deal = (
						await app.get(DealsService, { strict: false }).create({
							name: "hdm thu thoa thuan ngoai",
							companyId: ngoai.cty,
							ownerId: nguoi,
						})
					).id;
					const tepSvc = app.get(FieldFilesService, { strict: false });
					const ban = { id: nguoi, role: "admin" as const };
					const byte = new TextEncoder().encode(
						"%PDF-1.4\n% hdm ngoai\n%%EOF\n",
					);
					const o = {
						entity: "DEAL" as const,
						recordId: ngoai.deal,
						fieldKey: KHOA_TRUONG_HOP_DONG,
						tenTep: "ngoai.pdf",
					};
					const cho = await tepSvc.requestUpload(ban, {
						...o,
						kieu: "pdf",
						kichThuoc: byte.length,
					});
					await fetch(cho.url, { method: "PUT", body: byte });
					await tepSvc.complete(ban, {
						...o,
						pathname: cho.pathname,
						phieu: cho.phieu,
					});
				} finally {
					await app.close();
				}
				const truoc = await anhChup(ngoai.deal, ngoai.cty);
				for (let lan = 1; lan <= 3; lan += 1) {
					const r = await chay(kho);
					if (r.ma !== 0)
						throw new Error(
							`hdm chay lai: lan ${lan} ma ${r.ma} ${r.loi.join(" | ")}`,
						);
					const dem = await demMau();
					const mau = {
						congTy: dem.congTy,
						thoaThuan: dem.thoaThuan,
						truong: dem.truong,
						tep: dem.tep,
					};
					for (const [thu, n] of Object.entries(mau)) {
						const ky = {
							congTy: 1,
							thoaThuan: SO_THOA_THUAN,
							truong: 1,
							tep: BO.length,
						}[thu];
						if (n !== ky)
							throw new Error(`hdm chay lai: lan ${lan} ${thu} ${n}`);
					}
					if (lan > 1) {
						for (const t of BO) {
							const dong = r.dong.find((d) => d.startsWith(`${t.ma} · `)) ?? "";
							if (!dong.endsWith(HOP_DONG_MAU.trangThai.daCo)) {
								throw new Error(`hdm chay lai: lan ${lan} ${t.ma} ${dong}`);
							}
						}
					}
				}
				await donHangCho(kho);
				if (kho.daPut.size !== BO.length + 1)
					throw new Error(`hdm chay lai: blob ${kho.daPut.size}`);
				const sau = await anhChup(ngoai.deal, ngoai.cty);
				for (const k of Object.keys(truoc) as (keyof typeof truoc)[]) {
					if (JSON.stringify(sau[k]) !== JSON.stringify(truoc[k]))
						throw new Error(`hdm chay lai: ngoai doi ${k}`);
				}
			} finally {
				kho.dong();
				await db.agentTask.deleteMany({
					where: { OR: [{ dealId: ngoai.deal }, { companyId: ngoai.cty }] },
				});
				await db.fieldFile.deleteMany({ where: { dealId: ngoai.deal } });
				await db.deal.deleteMany({ where: { id: ngoai.deal } });
				await db.company.deleteMany({ where: { id: ngoai.cty } });
				await donMau();
			}
		},
		HDM_SAN.baiMs,
	);

	for (const ca of ["put-503", "truoc-complete"] as const) {
		test(
			`hdm-chay-lai: chạy dở (${ca}) rồi chạy lại vẫn đúng sáu tệp, không Blob mồ côi`,
			async () => {
				const kho = khoGiaHttp();
				try {
					let lanComplete = 0;
					if (ca === "put-503") kho.loiPutThu = 4;
					const r1 = await chay(kho, {
						suaUngDung:
							ca === "truoc-complete"
								? (app) => {
										const svc = app.get(FieldFilesService, { strict: false });
										const goc = svc.complete.bind(svc);
										svc.complete = async (...a: Parameters<typeof goc>) => {
											lanComplete += 1;
											if (lanComplete === 4)
												throw new Error("hdm thu: ngat truoc complete");
											return goc(...a);
										};
									}
								: undefined,
					});
					if (r1.ma === 0)
						throw new Error(`hdm chay lai: chay do ${ca} khong do`);
					kho.loiPutThu = null;
					const r2 = await chay(kho);
					if (r2.ma !== 0)
						throw new Error(`hdm chay lai: chay do ${ca} lan hai ma ${r2.ma}`);
					const ids = await idMau();
					for (const t of BO) {
						const deal = await db.deal.findFirst({
							where: { name: t.thoaThuan, id: { in: ids.thoaThuan } },
							select: { id: true },
						});
						const n = await db.fieldFile.count({
							where: { dealId: deal?.id ?? "" },
						});
						if (n !== 1)
							throw new Error(`hdm chay lai: chay do ${ca} ${t.ma} ${n}`);
					}
					await donHangCho(kho);
					if (kho.daPut.size !== BO.length)
						throw new Error(
							`hdm chay lai: chay do ${ca} blob ${kho.daPut.size}`,
						);
				} finally {
					kho.dong();
					await donMau();
				}
			},
			HDM_SAN.baiMs,
		);
	}
});

type CaChan = { ten: string; env: Record<string, string>; cho: boolean };

const NGOAI_MAY = [
	"ep-x.us-east-2.aws.neon.tech",
	"db.example.com",
	"[2001:db8::1]",
];
const url = (may: string, duoi = "") =>
	`postgresql://u:p@${may}:5432/crm${duoi}`;

const TU_CHOI: CaChan[] = [
	...NGOAI_MAY.map((may) => ({
		ten: `ngoai ${may}`,
		env: { DATABASE_URL: url(may) },
		cho: false,
	})),
	{
		ten: "localhost NODE_ENV production",
		env: { DATABASE_URL: url("localhost"), NODE_ENV: "production" },
		cho: false,
	},
	{
		ten: "localhost VERCEL_ENV production",
		env: { DATABASE_URL: url("localhost"), VERCEL_ENV: "production" },
		cho: false,
	},
	{
		ten: "localhost VERCEL_ENV preview",
		env: { DATABASE_URL: url("localhost"), VERCEL_ENV: "preview" },
		cho: false,
	},
	{
		ten: "localhost ?host= ngoai",
		env: { DATABASE_URL: url("localhost", "?host=db.example.com") },
		cho: false,
	},
	{
		ten: "localhost ?hostaddr= ngoai",
		env: { DATABASE_URL: url("localhost", "?hostaddr=10.0.0.5") },
		cho: false,
	},
	{ ten: "thieu URL", env: { DATABASE_URL: "" }, cho: false },
];

const BANG_CHAN: CaChan[] = [
	...TU_CHOI,
	...TU_CHOI.map((ca) => ({
		...ca,
		ten: `${ca.ten} + ALLOW_REMOTE_DB`,
		env: { ...ca.env, ALLOW_REMOTE_DB: "1" },
	})),
	...["localhost", "127.0.0.1", "[::1]"].map((may) => ({
		ten: `cuc bo ${may}`,
		env: { DATABASE_URL: `postgresql://u:p@${may}:1/khong-co` },
		cho: true,
	})),
	{
		ten: "VERCEL_ENV development",
		env: {
			DATABASE_URL: "postgresql://u:p@localhost:1/khong-co",
			VERCEL_ENV: "development",
		},
		cho: true,
	},
];

const SO_CA_CHAN = 22;

function chayCon(env: Record<string, string>, blob: string) {
	const moi: NodeJS.ProcessEnv = { ...process.env };
	for (const k of [
		"DATABASE_URL",
		"TEST_DATABASE_URL",
		"NODE_ENV",
		"VERCEL_ENV",
		"ALLOW_REMOTE_DB",
	])
		delete moi[k];
	Object.assign(moi, env, {
		VERCEL_BLOB_API_URL: blob,
		TEP_BAN_GHI_BLOB_TOKEN: "vercel_blob_rw_hdmthu_khoagia",
	});
	const batDau = Date.now();
	const r = spawnSync("bun", ["scripts/hop-dong-mau.ts"], {
		cwd: GOC_API,
		env: moi,
		encoding: "utf8",
		timeout: 60_000,
	});
	return { ma: r.status, loi: r.stderr ?? "", ms: Date.now() - batDau };
}

function dsNhapTinh(tep: string): string[] {
	const tx = new Bun.Transpiler({ loader: "ts" });
	return tx
		.scan(readFileSync(tep, "utf8"))
		.imports.filter((i) => i.kind === "import-statement")
		.map((i) => i.path);
}

function giaiGoi(duong: string): string | null {
	const m = duong.match(/^@crm\/([^/]+)(\/.*)?$/);
	if (!m) return null;
	const goc = join(GOC_KHO, "packages", m[1] ?? "");
	if (!existsSync(join(goc, "package.json"))) return null;
	const xuat = JSON.parse(readFileSync(join(goc, "package.json"), "utf8"))
		.exports as Record<string, string> | undefined;
	const dich = xuat?.[`.${m[2] ?? ""}`];
	return dich ? resolve(goc, dich) : null;
}

const CAM_NAP = [/^@crm\/db(\/|$)/, /^@prisma\/client/, /^@vercel\/blob/];

type KetQuaDoThi = { tep: number; cham: string | null };

function diDoThi(vao: string, gocApi: string): KetQuaDoThi {
	const da = new Set<string>();
	const hang = [vao];
	while (hang.length > 0) {
		const tep = hang.pop() ?? "";
		if (da.has(tep)) continue;
		da.add(tep);
		if (tep.startsWith(join(gocApi, "src") + "/"))
			return { tep: da.size, cham: tep };
		for (const p of dsNhapTinh(tep)) {
			if (CAM_NAP.some((re) => re.test(p))) return { tep: da.size, cham: p };
			let dich: string | null = null;
			if (p.startsWith(".")) {
				const co = resolve(dirname(tep), p);
				dich =
					[co, `${co}.ts`, join(co, "index.ts")].find(
						(d) => existsSync(d) && d.endsWith(".ts"),
					) ?? null;
			} else {
				dich = giaiGoi(p);
			}
			if (dich) hang.push(dich);
		}
	}
	return { tep: da.size, cham: null };
}

describe("hdm-chan", () => {
	test(
		"hdm-chan: bảng ca — từ chối trước khi chạm kho và kho tệp, máy cục bộ đi qua",
		async () => {
			let soYeuCau = 0;
			const may = Bun.serve({
				hostname: "127.0.0.1",
				port: 0,
				fetch() {
					soYeuCau += 1;
					return new Response("", { status: 400 });
				},
			});
			try {
				let o = 0;
				for (const ca of BANG_CHAN) {
					o += 1;
					const truoc = soYeuCau;
					const r = chayCon(ca.env, `http://127.0.0.1:${may.port}`);
					if (ca.cho) {
						if (
							r.ma === HOP_DONG_MAU.ma.chan ||
							r.loi.includes("Từ chối nạp")
						) {
							throw new Error(`hdm chan: ${ca.ten} bi chan`);
						}
						continue;
					}
					if (r.ma !== HOP_DONG_MAU.ma.chan)
						throw new Error(`hdm chan: ${ca.ten} ma ${r.ma} ${r.loi}`);
					if (!r.loi.startsWith(HOP_DONG_MAU.thongDiep.tienToChan))
						throw new Error(`hdm chan: ${ca.ten} cau`);
					if (/ECONNREFUSED|ENOTFOUND|P1001/.test(r.loi))
						throw new Error(`hdm chan: ${ca.ten} da ket noi`);
					if (soYeuCau !== truoc)
						throw new Error(`hdm chan: ${ca.ten} goi blob`);
					if (r.ms > 5_000) throw new Error(`hdm chan: ${ca.ten} cham`);
				}
				if (o !== SO_CA_CHAN) throw new Error(`hdm chan: thieu o ${o}`);
			} finally {
				may.stop(true);
			}
		},
		HDM_SAN.baiMs,
	);

	test("hdm-chan: chặn đứng trước phần nạp, đồ thị import tĩnh không chạm kho hay kho tệp", () => {
		const vao = join(GOC_API, "scripts", "hop-dong-mau.ts");
		const nguon = readFileSync(vao, "utf8");
		const chan = nguon.indexOf("kiemDuocNapHopDong(process.env)");
		const nap = nguon.indexOf('await import("./hop-dong-mau/lenh")');
		if (chan < 0 || nap < chan) throw new Error("hdm chan: chan sau nap");
		const kq = diDoThi(vao, GOC_API);
		if (kq.cham) throw new Error(`hdm chan: nap truoc chan ${kq.cham}`);
		if (kq.tep <= 1) throw new Error("hdm chan: do thi rong");
	});

	test("hdm-chan: đối chứng dương — đồ thị đi qua tệp trung gian tới @crm/db thì bị bắt", () => {
		const thuMuc = mkdtempSync(join(tmpdir(), "hdm-do-thi-"));
		try {
			writeFileSync(join(thuMuc, "vao.ts"), 'import "./giua";\n');
			writeFileSync(
				join(thuMuc, "giua.ts"),
				'import { db } from "@crm/db";\nexport const x = db;\n',
			);
			const kq = diDoThi(join(thuMuc, "vao.ts"), GOC_API);
			expect(kq.cham).toBe("@crm/db");
		} finally {
			rmSync(thuMuc, { recursive: true, force: true });
		}
	});
});

describe("hdm-thoat", () => {
	const truocBlob = (kho: ReturnType<typeof khoGiaHttp>) => kho.daPut.size;

	async function khongGhi(
		ca: string,
		kho: ReturnType<typeof khoGiaHttp> | null,
		truongTruoc: number,
	) {
		const d = await demMau();
		const dem: [string, number][] = [
			["company", d.congTy],
			["deal", d.thoaThuan],
			["field", d.truong - truongTruoc],
			["fieldFile", d.tep],
			["user", d.nguoi],
			["member", d.thanhVien],
			["blob", kho ? truocBlob(kho) : 0],
		];
		for (const [bang, n] of dem)
			if (n !== 0) throw new Error(`hdm thoat: ${ca} da ghi ${bang} ${n}`);
	}

	test(
		"hdm-thoat: kho tệp tắt — thiếu khoá hay chỉ khoảng trắng",
		async () => {
			const goc = process.env.TEP_BAN_GHI_BLOB_TOKEN;
			try {
				for (const gia of [undefined, "   "]) {
					if (gia === undefined) delete process.env.TEP_BAN_GHI_BLOB_TOKEN;
					else process.env.TEP_BAN_GHI_BLOB_TOKEN = gia;
					const r = await chay(undefined);
					if (r.ma !== HOP_DONG_MAU.ma.khoTat)
						throw new Error(`hdm thoat: khoTat ma ${r.ma}`);
					if (!r.loi.join(" ").includes("TEP_BAN_GHI_BLOB_TOKEN"))
						throw new Error("hdm thoat: khoTat cau");
					await khongGhi("khoTat", null, 0);
				}
			} finally {
				if (goc === undefined) delete process.env.TEP_BAN_GHI_BLOB_TOKEN;
				else process.env.TEP_BAN_GHI_BLOB_TOKEN = goc;
				await donMau();
			}
			const kho = khoGiaHttp();
			try {
				const r = await chay(kho);
				if (r.ma !== 0 || (await demMau()).tep !== BO.length)
					throw new Error("hdm thoat: doi chung khong ghi duoc");
			} finally {
				kho.dong();
				await donMau();
			}
		},
		HDM_SAN.baiMs,
	);

	test(
		"hdm-thoat: thiếu workspace",
		async () => {
			const kho = khoGiaHttp();
			const app = await dungUngDung(kho);
			class HoanTac extends Error {}
			try {
				await db
					.$transaction(
						async (tx) => {
							await tx.organization.delete({ where: { id: WORKSPACE_ID } });
							const r = await chay(kho, { db: tx, app });
							if (r.ma !== HOP_DONG_MAU.ma.sai)
								throw new Error(`hdm thoat: workspace ma ${r.ma}`);
							if (!r.loi.join(" ").includes("dev:session"))
								throw new Error("hdm thoat: workspace cau");
							const nguoi = await tx.user.count({
								where: { id: HOP_DONG_MAU.nguoi.id },
							});
							if (nguoi !== 0)
								throw new Error(`hdm thoat: workspace da ghi user ${nguoi}`);
							throw new HoanTac();
						},
						{ timeout: HDM_SAN.baiMs },
					)
					.catch((loi) => {
						if (!(loi instanceof HoanTac)) throw loi;
					});
				await khongGhi("workspace", kho, 0);
			} finally {
				await app.close();
				kho.dong();
				await donMau();
			}
		},
		HDM_SAN.baiMs,
	);

	test(
		"hdm-thoat: khoá trường đã dùng cho kiểu khác",
		async () => {
			const kho = khoGiaHttp();
			try {
				const nguoi = await quanTriThu();
				const app = await dungUngDung(kho);
				try {
					await app.get(FieldsService, { strict: false }).create(nguoi, {
						entity: "DEAL",
						label: HOP_DONG_MAU.truong.nhan,
						type: "TEXT",
						options: [],
						agentFilled: false,
						agentBrief: null,
						required: false,
						showOnSheet: true,
						showOnTable: false,
						showOnFilter: false,
					});
				} finally {
					await app.close();
				}
				const r = await chay(kho);
				if (r.ma !== HOP_DONG_MAU.ma.sai)
					throw new Error(`hdm thoat: truong ma ${r.ma}`);
				if (!r.loi.join(" ").includes(KHOA_TRUONG_HOP_DONG))
					throw new Error("hdm thoat: truong cau");
				await khongGhi("truong", kho, 1);
			} finally {
				kho.dong();
				await donMau();
			}
		},
		HDM_SAN.baiMs,
	);
});
