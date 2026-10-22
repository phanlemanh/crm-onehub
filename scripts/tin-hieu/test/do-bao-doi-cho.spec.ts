import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ghiBanChupVaBaoTinHieu } from "../../../apps/api/src/lo-trinh/tin-hieu-doi-cho.ts";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import {
	type DauVaoKit,
	dungTepMau,
	GOC_KHO,
} from "../../../apps/app/test/support/khoi-tin-hieu-mau.ts";
import { db } from "../../../packages/db/src/client.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { idTep } from "../../../packages/validation/src/tin-hieu.ts";
import { doBaoDoiCho } from "../do-bao-doi-cho.ts";
import { BAO_DOI_CHO_DO, PHUT_MS } from "../gom-cau-hinh.ts";

const TIEN_TO = `tttsdo${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const GIO = 60 * PHUT_MS;
const TU = "2026-10-20";
const T = Date.parse("2026-10-20T03:00:00Z");
const CA = [
	"da-bao",
	"bi-the-cho",
	"tre",
	"thieu",
	"luu-tru",
	"khong-doi",
] as const;
type Ca = (typeof CA)[number];
const ma = {} as Record<Ca, string>;

function git(kho: string, thamSo: string[], luc?: number) {
	const r = spawnSync("git", ["-C", kho, ...thamSo], {
		encoding: "utf8",
		env: {
			...process.env,
			...(luc === undefined
				? {}
				: {
						GIT_AUTHOR_DATE: new Date(luc).toISOString(),
						GIT_COMMITTER_DATE: new Date(luc).toISOString(),
					}),
		},
	});
	if (r.status !== 0) throw new Error(`git ${thamSo.join(" ")}: ${r.stderr}`);
	return r.stdout.trim();
}

function trangThai(trongNhom: Ca[], them = false): DauVaoKit {
	return {
		tinHieu: CA.map((c) => ({ ma: ma[c] })),
		nhom: trongNhom.map((c, i) => ({
			ma: `g${i}`,
			ten: `Nhóm ${c}`,
			tinHieu: [ma[c]],
		})),
		hang: them
			? [
					{
						ma: "RX",
						cauGiao: "«Việc khác»",
						phu: [],
						trangThai: "chua-bat-dau",
					},
				]
			: [],
	};
}

type Buoc = { luc: number; nhom: Ca[]; them?: boolean; day: number | null };

const BUOC: Buoc[] = [
	{ luc: T - 24 * GIO, nhom: [], day: T - 24 * GIO + 5 * PHUT_MS },
	{ luc: T, nhom: ["da-bao", "luu-tru"], day: T + 5 * PHUT_MS },
	{ luc: T + GIO, nhom: ["da-bao", "luu-tru", "bi-the-cho"], day: null },
	{
		luc: T + 2 * GIO,
		nhom: ["da-bao", "luu-tru", "bi-the-cho"],
		them: true,
		day: T + 2 * GIO + 5 * PHUT_MS,
	},
	{
		luc: T + 3 * GIO,
		nhom: ["da-bao", "luu-tru", "bi-the-cho", "tre"],
		them: true,
		day: T + 3 * GIO + 26 * GIO,
	},
	{
		luc: T + 4 * GIO,
		nhom: ["da-bao", "luu-tru", "bi-the-cho", "tre", "thieu"],
		them: true,
		day: null,
	},
];

function dungKho(soBuoc: number): string {
	const kho = mkdtempSync(path.join(tmpdir(), "ttts-do-"));
	git(kho, ["init", "-q", "-b", BAO_DOI_CHO_DO.nhanh]);
	git(kho, ["config", "user.email", "do@crm.test"]);
	git(kho, ["config", "user.name", "do"]);
	for (const b of BUOC.slice(0, soBuoc)) {
		writeFileSync(
			path.join(kho, BAO_DOI_CHO_DO.tep),
			dungTepMau(trangThai(b.nhom, b.them)),
		);
		git(kho, ["add", "-A"]);
		git(kho, ["commit", "-qm", `buoc ${b.luc}`], b.luc);
	}
	return kho;
}

let KHO = "";

beforeAll(async () => {
	const now = new Date();
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: now },
		update: {},
	});
	for (const c of CA) {
		const id = `${TIEN_TO}-${c}`;
		await db.user.create({
			data: {
				id,
				name: id,
				email: `${id}@thu.test`,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
		});
		await db.member.create({
			data: {
				id: `member-${id}`,
				organizationId: WORKSPACE_ID,
				userId: id,
				role: "member",
				createdAt: now,
			},
		});
		const t = await db.tinHieu.create({
			data: {
				nguoiGuiId: id,
				muonLam: "muốn",
				daXayRa: `${TIEN_TO} ${c}`,
				tieuDe: `${TIEN_TO} ${c}`,
				man: "/tin-hieu",
				keoVeLuc: now,
				archivedAt: c === "luu-tru" ? now : null,
			},
		});
		ma[c] = idTep(t.so);
	}
	await db.banChupLoTrinh.deleteMany({ where: { nguon: "crm" } });
	KHO = dungKho(BUOC.length);
	const sha = git(KHO, [
		"log",
		"--reverse",
		"--format=%H",
		BAO_DOI_CHO_DO.nhanh,
	]).split("\n");
	for (const [i, b] of BUOC.entries()) {
		if (b.day === null) continue;
		const { duLieu } = docDuLieu(dungTepMau(trangThai(b.nhom, b.them)));
		if (!duLieu) throw new Error("khoi mau hong");
		await ghiBanChupVaBaoTinHieu(
			db,
			{
				nguon: "crm",
				sha: sha[i] ?? "",
				commitLuc: new Date(b.luc).toISOString(),
				duLieu,
				canhBao: [],
			},
			new Date(b.day),
		);
	}
}, 120_000);

afterAll(async () => {
	await db.banChupLoTrinh.deleteMany({ where: { nguon: "crm" } });
	await db.thongBao.deleteMany({
		where: { nguoiNhanId: { startsWith: TIEN_TO } },
	});
	await db.tinHieu.deleteMany({ where: { daXayRa: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
});

describe("ttts-do", () => {
	test("ttts-do: moi lan doi cho co nguoi nhan mot dong, co thieu va tre, ket luan theo nguong mot ngay", async () => {
		const kq = await doBaoDoiCho({
			db,
			kho: KHO,
			nhanh: BAO_DOI_CHO_DO.nhanh,
			tu: TU,
		});
		console.log(kq.chu);
		const dong = kq.chu.split("\n").filter((d) => !d.startsWith("KẾT LUẬN"));
		const dongCua = (c: Ca) => dong.filter((d) => d.startsWith(`${ma[c]} `));
		expect(dong.length).toBe(4);
		for (const c of ["da-bao", "bi-the-cho", "tre", "thieu"] as const)
			expect(dongCua(c).length, c).toBe(1);
		expect(dongCua("luu-tru").length).toBe(0);
		expect(dongCua("khong-doi").length).toBe(0);
		const commitLuc = git(KHO, [
			"log",
			"--reverse",
			"--format=%cI",
			BAO_DOI_CHO_DO.nhanh,
		])
			.split("\n")
			.map((x) => new Date(x).toISOString());
		const KY_VONG = {
			"da-bao": { buoc: 1, co: [] },
			"bi-the-cho": { buoc: 2, co: [] },
			tre: { buoc: 4, co: [BAO_DOI_CHO_DO.quaMotNgay] },
			thieu: { buoc: 5, co: [BAO_DOI_CHO_DO.thieu] },
		} as const;
		const THONG_DIEP = {
			"da-bao": "lan da bao sai cot",
			"bi-the-cho": "lan bi the cho tinh la thieu",
			tre: "tre qua mot ngay khong bi co",
			thieu: "lan thieu khong bi co",
		} as const;
		for (const c of ["da-bao", "bi-the-cho", "tre", "thieu"] as const) {
			const commit = commitLuc[KY_VONG[c].buoc] ?? "";
			const tb = await db.thongBao.findFirst({
				where: { nguoiNhanId: `${TIEN_TO}-${c}` },
				orderBy: { taoLuc: "asc" },
			});
			const tre = tb ? tb.taoLuc.getTime() - Date.parse(commit) : null;
			const kyVong = [
				ma[c],
				"nhom-chua-cat",
				`commit ${commit}`,
				`thông báo ${tb ? tb.taoLuc.toISOString() : "—"}`,
				`trễ ${tre === null ? "—" : `${Math.round(tre / PHUT_MS)} phút`}`,
				...KY_VONG[c].co,
			].join(" · ");
			expect(dongCua(c)[0], THONG_DIEP[c]).toBe(kyVong);
		}
		const bao = await db.thongBao.findFirst({
			where: { nguoiNhanId: `${TIEN_TO}-bi-the-cho` },
		});
		const shaBuoc3 = git(KHO, [
			"log",
			"--reverse",
			"--format=%H",
			BAO_DOI_CHO_DO.nhanh,
		]).split("\n")[3];
		expect(bao?.khoa, "lan bi the cho tinh la thieu").toBe(
			`${BAO_DOI_CHO_DO.loai}:${ma["bi-the-cho"]}:${shaBuoc3}`,
		);
		expect(kq.chu).toContain(`KẾT LUẬN: ${BAO_DOI_CHO_DO.khongDat}`);
		expect(kq.dat).toBe(false);
		const cli = spawnSync(
			"bun",
			[
				"scripts/tin-hieu/do-bao-doi-cho.ts",
				"--tu",
				TU,
				"--kho",
				KHO,
				"--nhanh",
				BAO_DOI_CHO_DO.nhanh,
			],
			{ cwd: GOC_KHO, encoding: "utf8", env: process.env },
		);
		expect(cli.status, cli.stderr).toBe(1);
	});

	test("ttts-do: chi co lan da bao va lan bi the cho thi dat", async () => {
		const kho = dungKho(4);
		const kq = await doBaoDoiCho({
			db,
			kho,
			nhanh: BAO_DOI_CHO_DO.nhanh,
			tu: TU,
		});
		console.log(kq.chu);
		expect(kq.chu, "lan bi the cho tinh la thieu").toContain(
			`KẾT LUẬN: ${BAO_DOI_CHO_DO.dat} — 2/2`,
		);
		expect(kq.dat).toBe(true);
		const cli = spawnSync(
			"bun",
			[
				"scripts/tin-hieu/do-bao-doi-cho.ts",
				"--tu",
				TU,
				"--kho",
				kho,
				"--nhanh",
				BAO_DOI_CHO_DO.nhanh,
			],
			{ cwd: GOC_KHO, encoding: "utf8", env: process.env },
		);
		expect(cli.status, cli.stderr).toBe(0);
	});
});
