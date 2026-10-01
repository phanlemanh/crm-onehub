import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as gateway from "@ai-sdk/gateway";
import { db } from "@crm/db";
import { MockLanguageModelV4 } from "ai/test";
import ts from "typescript";
import { MOT_TRIEU, TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import {
	type ModelMaySoan,
	modelTaiLieu,
	nhanKhoaTaiLieu,
} from "../agent/lib/tai-lieu-model";
import troLyKho from "../agent/subagents/tro_ly_kho/agent";
import hookSo from "../agent/subagents/tro_ly_kho/hooks/so-chi-phi";
import nopTraLoi from "../agent/subagents/tro_ly_kho/tools/nop_tra_loi";
import readPage from "../agent/subagents/tro_ly_kho/tools/read_page";
import searchPages from "../agent/subagents/tro_ly_kho/tools/search_pages";
import LOI from "./fixtures/loi-gateway.json";
import {
	banDungCon,
	danhMucDungSan,
	TRAN_BIEN_DICH_MS,
} from "./support/eve-ban-dung";
import {
	type CtxCon,
	donTroLyKho,
	gieoNguoi,
	goiCongCu,
	ketQuaConEve,
	ma,
	moHoiCrm,
	type Nguoi,
	trangDaDuyet,
} from "./support/tro-ly-kho-gia";

const THU_MUC = join(import.meta.dir, "..", "agent", "subagents", "tro_ly_kho");
const TOOL_SONG = ["nop_tra_loi", "read_page", "search_pages"] as const;
const IMPORT_CAM = [/app-?setting/i, /model-theo-vai/i, /modelTheoVai/];
const BIEN = TAI_LIEU_AGENT.hoi.bienKhoaRieng;

type KetQuaThu = { hoiId: string; ketQua: string; traLoi?: string };
type KhuonRa = { safeParse: (v: KetQuaThu) => { success: boolean } };
type SuKienBuoc = {
	type: "step.completed";
	meta: { id: string; at: string };
	data: { usage: { inputTokens: number; outputTokens: number } };
};
type XuLy = (e: SuKienBuoc, c: CtxCon) => Promise<void>;
const MOC = "NOIDUNG-TRANG-MOC";

function chuaTat(
	danhMuc: readonly string[],
	daTat: readonly string[],
	coSkill: boolean,
): string[] {
	return danhMuc
		.filter((t) => !daTat.includes(t) && !(t === "load_skill" && !coSkill))
		.map((t) => `tlk-ranh-gioi: tool dung san chua tat ${t}`);
}

type ChinhSach =
	| Record<"docker" | "microsandbox" | "vercel", string>
	| {
			loi: string;
	  };

function goiHam(n: ts.Node | undefined, ten: string): ts.CallExpression | null {
	if (!n || !ts.isCallExpression(n)) return null;
	return ts.isIdentifier(n.expression) && n.expression.text === ten ? n : null;
}

function chinhSachMang(nguon: string): ChinhSach {
	const sf = ts.createSourceFile(
		"sandbox.ts",
		nguon,
		ts.ScriptTarget.Latest,
		true,
	);
	const lenh = sf.statements.filter((x) => !ts.isImportDeclaration(x));
	const xuat = lenh[0];
	if (lenh.length !== 1 || !xuat || !ts.isExportAssignment(xuat))
		return { loi: "tlk-ranh-gioi: sandbox co cau lenh la" };
	const doi = goiHam(xuat.expression, "defineSandbox")?.arguments[0];
	if (!doi || !ts.isObjectLiteralExpression(doi) || doi.properties.length !== 1)
		return { loi: "tlk-ranh-gioi: defineSandbox la" };
	const backend = doi.properties[0];
	if (!backend || !ts.isPropertyAssignment(backend))
		return { loi: "tlk-ranh-gioi: backend la" };
	const cauHinh = goiHam(backend.initializer, "defaultBackend")?.arguments[0];
	if (!cauHinh || !ts.isObjectLiteralExpression(cauHinh))
		return { loi: "tlk-ranh-gioi: defaultBackend la" };
	const ra: Record<string, string> = {};
	for (const p of cauHinh.properties) {
		if (
			!ts.isPropertyAssignment(p) ||
			!ts.isObjectLiteralExpression(p.initializer)
		)
			return { loi: "tlk-ranh-gioi: backend co trai hay gia tri la" };
		const mang = p.initializer.properties.find(
			(x) => ts.isPropertyAssignment(x) && x.name.getText() === "networkPolicy",
		);
		if (
			!mang ||
			!ts.isPropertyAssignment(mang) ||
			!ts.isStringLiteral(mang.initializer) ||
			p.initializer.properties.length !== 1
		)
			return {
				loi: `tlk-ranh-gioi: ${p.name.getText()} khong ro networkPolicy`,
			};
		ra[p.name.getText()] = mang.initializer.text;
	}
	return ra as ChinhSach;
}

let quanTri: Nguoi;

beforeAll(async () => {
	quanTri = await gieoNguoi("owner");
});

afterAll(async () => {
	await donTroLyKho();
});

describe("tlk-ranh-gioi", () => {
	test(
		"tlk-ranh-gioi: ban dung eve co dung ba tool song, moi tool dung san cua eve deu tat",
		async () => {
			const con = await banDungCon("tro_ly_kho");
			expect(con.agent.tools.map((t) => t.name).sort()).toEqual([...TOOL_SONG]);
			const danhMuc = await danhMucDungSan();
			expect(danhMuc.length).toBeGreaterThan(5);
			const coSkill = con.agent.skills.length > 0;
			expect(
				chuaTat(danhMuc, con.agent.disabledFrameworkTools, coSkill),
			).toEqual([]);
			expect(
				chuaTat(
					danhMuc,
					con.agent.disabledFrameworkTools.filter((t) => t !== "web_fetch"),
					coSkill,
				),
			).toEqual(["tlk-ranh-gioi: tool dung san chua tat web_fetch"]);
			expect(chuaTat(["load_skill"], [], true)).toEqual([
				"tlk-ranh-gioi: tool dung san chua tat load_skill",
			]);
		},
		TRAN_BIEN_DICH_MS,
	);

	test(
		"tlk-ranh-gioi: sandbox eve nap la tep nay, ca ba backend deny-all; agent.ts khong doc AppSetting",
		async () => {
			const con = await banDungCon("tro_ly_kho");
			const sb = con.agent.sandbox;
			if (!sb) throw new Error("tlk-ranh-gioi: ban dung khong co sandbox");
			const nguonSb = readFileSync(
				join(con.agent.agentRoot, sb.logicalPath),
				"utf8",
			);
			expect(createHash("sha256").update(nguonSb).digest("hex")).toBe(
				sb.sourceHash,
			);
			expect(chinhSachMang(nguonSb)).toEqual({
				docker: "deny-all",
				microsandbox: "deny-all",
				vercel: "deny-all",
			});
			expect(
				chinhSachMang(
					nguonSb.replace(
						'docker: { networkPolicy: "deny-all" }',
						'docker: { networkPolicy: "allow-all" }',
					),
				).docker,
			).toBe("allow-all");
			expect(
				chinhSachMang(`const x = { networkPolicy: "deny-all" };\n${nguonSb}`),
			).toEqual({ loi: "tlk-ranh-gioi: sandbox co cau lenh la" });
			const nguon = ts.createSourceFile(
				"agent.ts",
				readFileSync(join(THU_MUC, "agent.ts"), "utf8"),
				ts.ScriptTarget.Latest,
				true,
			);
			const imports: string[] = [];
			nguon.forEachChild((n) => {
				if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier))
					imports.push(n.moduleSpecifier.text);
			});
			expect(imports.filter((i) => IMPORT_CAM.some((r) => r.test(i)))).toEqual(
				[],
			);
			expect((troLyKho.model as unknown as { fallback: string }).fallback).toBe(
				TAI_LIEU_AGENT.hoi.maModel,
			);
		},
		TRAN_BIEN_DICH_MS,
	);

	test("tlk-ranh-gioi: moi loi goi mang ZDR voi khoa rieng va khoa chung, nhan khoa dung", async () => {
		const loi: string[] = [];
		for (const [ten, env] of [
			["rieng", { [BIEN]: "khoa-gia-tlk" }],
			["chung", {}],
		] as const) {
			const daGoi: Parameters<MockLanguageModelV4["doGenerate"]>[0][] = [];
			const gia = new MockLanguageModelV4({
				doGenerate: async (vao) => {
					daGoi.push(vao);
					return {} as never;
				},
			});
			const spy = spyOn(gateway, "createGateway");
			const tao = ((cauHinh?: { apiKey?: string }) => {
				spy(cauHinh as never);
				return () => gia;
			}) as unknown as typeof gateway.createGateway;
			const { model } = modelTaiLieu("hoi", env, tao);
			await (model as unknown as MockLanguageModelV4).doGenerate({
				prompt: [],
			});
			const khoaDaDung = spy.mock.calls.some(
				([c]) =>
					(c as { apiKey?: string } | undefined)?.apiKey === "khoa-gia-tlk",
			);
			spy.mockRestore();
			if (daGoi[0]?.providerOptions?.gateway?.zeroDataRetention !== true)
				loi.push(`tlk-ranh-gioi: loi goi 1 thieu ZDR ${ten}`);
			if ((ten === "rieng") !== khoaDaDung)
				loi.push(`tlk-ranh-gioi: khoa sai ${ten}`);
			if (nhanKhoaTaiLieu("hoi", env) !== ten)
				loi.push(`tlk-ranh-gioi: nhan khoa sai ${ten}`);
		}
		expect(loi).toEqual([]);
	});

	test("tlk-ranh-gioi: bo chon model step.started cua tro_ly_kho gui ZDR va khoa dung o moi loi goi", async () => {
		type BoChon = { events: { "step.started": () => ModelMaySoan } };
		const chon = (troLyKho.model as unknown as BoChon).events["step.started"];
		const goc = {
			rieng: process.env[BIEN],
			chung: process.env.AI_GATEWAY_API_KEY,
		};
		const fetchGoc = globalThis.fetch;
		const loi: string[] = [];
		try {
			for (const [ten, khoa] of [
				["rieng", "khoa-gia-tlk"],
				["chung", "khoa-chung-gia"],
			] as const) {
				if (ten === "rieng") process.env[BIEN] = khoa;
				else delete process.env[BIEN];
				process.env.AI_GATEWAY_API_KEY = "khoa-chung-gia";
				const yeuCau: { than: string; khoa: string }[] = [];
				globalThis.fetch = (async (
					_url: string | URL | Request,
					init?: RequestInit,
				) => {
					yeuCau.push({
						than: String(init?.body ?? ""),
						khoa: new Headers(init?.headers).get("authorization") ?? "",
					});
					return new Response("{}", { status: 500 });
				}) as typeof fetch;
				const { model } = chon();
				for (let lan = 0; lan < 2; lan += 1)
					await (model as unknown as MockLanguageModelV4)
						.doGenerate({
							prompt: [
								{ role: "user", content: [{ type: "text", text: "câu thử" }] },
							],
						})
						.catch(() => null);
				if (yeuCau.length < 2)
					loi.push(`tlk-ranh-gioi: bo chon khong goi gateway ${ten}`);
				for (const [i, y] of yeuCau.entries()) {
					const than = JSON.parse(y.than) as {
						providerOptions?: { gateway?: { zeroDataRetention?: boolean } };
					};
					if (than.providerOptions?.gateway?.zeroDataRetention !== true)
						loi.push(
							`tlk-ranh-gioi: bo chon gui loi goi ${i + 1} thieu ZDR ${ten}`,
						);
					if (!y.khoa.includes(khoa))
						loi.push(`tlk-ranh-gioi: bo chon gui khoa sai ${ten}`);
				}
			}
		} finally {
			globalThis.fetch = fetchGoc;
			if (goc.rieng === undefined) delete process.env[BIEN];
			else process.env[BIEN] = goc.rieng;
			if (goc.chung === undefined) delete process.env.AI_GATEWAY_API_KEY;
			else process.env.AI_GATEWAY_API_KEY = goc.chung;
		}
		expect(loi).toEqual([]);
	});

	test("tlk-ranh-gioi: ket qua tra agent goc chi la ma hang va ket qua, khong chu trang", async () => {
		const trang = await trangDaDuyet(
			quanTri,
			`Trang mốc ${ma("moc")}`,
			`## Mức\n\n${MOC} Tầng 2 hưởng 1,2%.`,
		);
		const { hoiId, ctx } = await moHoiCrm(quanTri, "Tầng 2 hưởng bao nhiêu?");
		const tim = await goiCongCu(searchPages, { query: "tầng" }, ctx);
		const doc = await goiCongCu<{ noiDung: string; phienBan: number }>(
			readPage,
			{ slug: trang.slug },
			ctx,
		);
		if (!doc.ok) throw new Error(doc.loi);
		expect(doc.ra.noiDung).toContain(MOC);
		const nop = await goiCongCu<{ hoiId: string; ketQua: string }>(
			nopTraLoi,
			{
				loai: "tra-loi",
				cauHoi: "Tầng 2 hưởng bao nhiêu?",
				cau: [
					{
						chu: "Tầng 2 hưởng 1,2%.",
						trich: [
							{
								slug: trang.slug,
								phienBan: doc.ra.phienBan,
								doan: `${MOC} Tầng 2 hưởng 1,2%.`,
							},
						],
					},
				],
			},
			ctx,
		);
		if (!nop.ok) throw new Error(nop.loi);
		const khuon = troLyKho.outputSchema as unknown as KhuonRa;
		const daThay = [
			JSON.stringify(tim),
			JSON.stringify(doc),
			JSON.stringify(nop),
		];
		expect(daThay.some((x) => x.includes(MOC))).toBe(true);
		const dungHang = { hoiId: nop.ra.hoiId, ketQua: nop.ra.ketQua };
		const ungVien: KetQuaThu[] = [
			dungHang,
			{ ...dungHang, hoiId: doc.ra.noiDung },
			{ ...dungHang, ketQua: MOC },
			{ ...dungHang, traLoi: doc.ra.noiDung },
			...daThay.map((x) => ({ ...dungHang, traLoi: x })),
		];
		const qua = ungVien.filter((u) => khuon.safeParse(u).success);
		expect(qua, "tlk-ranh-gioi: chu trang toi agent goc").toEqual([dungHang]);
		expect(hoiId).toBe(dungHang.hoiId);
		const toiGoc = [
			ketQuaConEve(dungHang.hoiId),
			...Object.values(LOI).map((l) => ketQuaConEve(dungHang.hoiId, l)),
		].map((r) => JSON.stringify(r));
		expect(toiGoc.filter((r) => r.includes(MOC))).toEqual([]);
	});

	test("tlk-ranh-gioi: moi buoc model cong token, chi phi vao hang va ghi so chi phi tai-lieu.tro-ly", async () => {
		const { hoiId, ctx } = await moHoiCrm(quanTri);
		const xuLy = hookSo.events?.["step.completed"] as unknown as XuLy;
		for (const [i, u] of [
			[1, { inputTokens: 1000, outputTokens: 300 }],
			[2, { inputTokens: 200, outputTokens: 40 }],
		] as const) {
			await xuLy(
				{
					type: "step.completed",
					meta: { id: `buoc-tlk-${hoiId}-${i}`, at: new Date().toISOString() },
					data: { usage: u },
				},
				ctx,
			);
		}
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: hoiId },
		});
		const gia = TAI_LIEU_AGENT.bangGia[TAI_LIEU_AGENT.hoi.maModel];
		expect(hang.tokenVao).toBe(1200);
		expect(hang.tokenRa).toBe(340);
		expect(hang.chiPhiUsd).toBeCloseTo(
			(1200 * gia.vaoMoiTrieu + 340 * gia.raMoiTrieu) / MOT_TRIEU,
			9,
		);
		expect(hang.nhanKhoa).toBe(nhanKhoaTaiLieu("hoi"));
		const so = await db.aiChiPhi.findMany({
			where: { sessionId: ctx.session.id },
		});
		expect(so.length).toBe(2);
		expect(so.every((s) => s.tinhNang === "tai-lieu.tro-ly")).toBe(true);
	});
});
