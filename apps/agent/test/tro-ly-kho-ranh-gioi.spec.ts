import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as gateway from "@ai-sdk/gateway";
import { db } from "@crm/db";
import { MockLanguageModelV4 } from "ai/test";
import ts from "typescript";
import { MOT_TRIEU, TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import { modelTaiLieu, nhanKhoaTaiLieu } from "../agent/lib/tai-lieu-model";
import troLyKho from "../agent/subagents/tro_ly_kho/agent";
import hookSo from "../agent/subagents/tro_ly_kho/hooks/so-chi-phi";
import {
	donTroLyKho,
	gieoNguoi,
	moHoiCrm,
	type Nguoi,
} from "./support/tro-ly-kho-gia";

const THU_MUC = join(import.meta.dir, "..", "agent", "subagents", "tro_ly_kho");
const THU_MUC_MAY_SOAN = join(
	import.meta.dir,
	"..",
	"agent",
	"subagents",
	"may_soan",
);
const TOOL_SONG = ["nop_tra_loi", "read_page", "search_pages"] as const;
const IMPORT_CAM = [/app-?setting/i, /model-theo-vai/i, /modelTheoVai/];
const BIEN = TAI_LIEU_AGENT.hoi.bienKhoaRieng;
const MOC = "NOIDUNG-TRANG-MOC";

type PhanLoai = { song: string[]; tat: string[] };

async function phanLoai(thuMuc: string): Promise<PhanLoai> {
	const song: string[] = [];
	const tat: string[] = [];
	for (const f of readdirSync(join(thuMuc, "tools"))
		.filter((t) => t.endsWith(".ts"))
		.sort()) {
		const mod = await import(join(thuMuc, "tools", f));
		const ten = f.replace(/\.ts$/, "");
		if (mod.default.kind === "eve:disabled-tool") tat.push(ten);
		else song.push(ten);
	}
	return { song, tat };
}

function loiTap(tap: PhanLoai, tatPhaiCo: readonly string[]): string[] {
	const loi: string[] = [];
	for (const t of tap.song)
		if (!(TOOL_SONG as readonly string[]).includes(t))
			loi.push(`tlk-ranh-gioi: tool la ${t}`);
	for (const t of TOOL_SONG)
		if (!tap.song.includes(t)) loi.push(`tlk-ranh-gioi: thieu tool ${t}`);
	for (const t of tatPhaiCo)
		if (!tap.tat.includes(t))
			loi.push(`tlk-ranh-gioi: tool dung san chua tat ${t}`);
	return loi;
}

let quanTri: Nguoi;

beforeAll(async () => {
	quanTri = await gieoNguoi("owner");
});

afterAll(async () => {
	await donTroLyKho();
});

describe("tlk-ranh-gioi", () => {
	test("tlk-ranh-gioi: dung ba tool song, moi tool dung san ma may soan tat thi tro ly kho cung tat", async () => {
		const tap = await phanLoai(THU_MUC);
		const tatCuaMaySoan = (await phanLoai(THU_MUC_MAY_SOAN)).tat;
		expect(tatCuaMaySoan.length).toBeGreaterThan(0);
		expect(tap.song).toEqual([...TOOL_SONG]);
		expect(loiTap(tap, tatCuaMaySoan)).toEqual([]);
		expect(
			loiTap(
				{
					song: [...tap.song, "web_fetch"],
					tat: tap.tat.filter((t) => t !== "web_fetch"),
				},
				tatCuaMaySoan,
			),
		).toContain("tlk-ranh-gioi: tool la web_fetch");
	});

	test("tlk-ranh-gioi: sandbox deny-all o ca ba backend, agent.ts khong doc AppSetting", () => {
		const s = readFileSync(join(THU_MUC, "sandbox/sandbox.ts"), "utf8");
		expect(s.match(/networkPolicy: "deny-all"/g)?.length).toBe(3);
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
	});

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

	test("tlk-ranh-gioi: ket qua tra agent goc chi la ma hang va ket qua, khong chu trang", () => {
		const khuon = troLyKho.outputSchema as unknown as {
			safeParse: (v: unknown) => { success: boolean };
		};
		expect(
			khuon.safeParse({ hoiId: "cmup14vbv000as4tylgu149qg", ketQua: "TRA_LOI" })
				.success,
		).toBe(true);
		expect(
			khuon.safeParse({ hoiId: `${MOC} Tầng 2 hưởng 1,2%.`, ketQua: "TRA_LOI" })
				.success,
			"tlk-ranh-gioi: chu trang toi agent goc",
		).toBe(false);
		expect(
			khuon.safeParse({
				hoiId: "cmup14vbv000as4tylgu149qg",
				ketQua: "TRA_LOI",
				traLoi: MOC,
			}).success,
		).toBe(false);
	});

	test("tlk-ranh-gioi: moi buoc model cong token, chi phi vao hang va ghi so chi phi tai-lieu.tro-ly", async () => {
		const { hoiId, ctx } = await moHoiCrm(quanTri);
		type XuLy = (e: unknown, c: unknown) => Promise<void>;
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
