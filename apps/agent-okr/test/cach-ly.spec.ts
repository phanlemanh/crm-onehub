import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import tacNhan from "../agent/agent";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { type GoiSoan, goiThanhChiDan } from "../agent/lib/goi-soan";
import { CAU_CHEN, THE_CHEN } from "./support/gieo-goi";
import { loiBocLop5 } from "./support/the-du-lieu";

const GOC =
	process.env.THU_MUC_AGENT_OKR ?? join(import.meta.dir, "..", "agent");

function tepTs(thuMuc: string): string[] {
	const ra: string[] = [];
	for (const ten of readdirSync(thuMuc)) {
		const d = join(thuMuc, ten);
		if (statSync(d).isDirectory()) ra.push(...tepTs(d));
		else if (ten.endsWith(".ts")) ra.push(d);
	}
	return ra;
}

const DOC_AUTH_CURRENT =
	/\bauth\s*\??\.\s*current\b|\bauth\s*\??\.?\s*\[\s*["'`]current["'`]\s*\]/;
const DOC_AUTH_INITIATOR = /\bauth\s*\??\.\s*initiator\b/;
const THU_MUC_DOC_PHIEN = ["hooks", "instructions", "tools", "lib"];

const GOI_GIA: GoiSoan = {
	cuocSoanId: "gia",
	cuoc: {
		id: "gia",
		cycleId: "ky",
		level: "phong-ban",
		divisionId: "bp",
		departmentId: "pb",
		nguoiMoUserId: "nguoi",
		sessionId: "phien",
		cacPhien: ["phien"],
		nac: "bat",
		trangThai: "dang",
		soLuot: 0,
		streamIndex: 0,
		continuationToken: null,
		lanNopMoiNhat: null,
		daCat: null,
		duaVaoLuc: null,
		createdAt: new Date(0),
	},
	lop05: [
		{
			ten: "Chiến lược",
			xacMinhDen: null,
			noiDung: `Ưu tiên lấp đầy mùa thấp điểm. ${CAU_CHEN}. ${THE_CHEN}`,
		},
	],
	lop1: {
		donVi: { ten: "Phòng", cap: "phong-ban", moTa: "" },
		cha: null,
		truong: null,
		nguoiHoi: { vai: "member", chucDanh: "" },
	},
	lop2a: { capTren: [], ngangCap: [], ungVienCanChinh: [] },
	lop3: { chuKy: null, mucTieu: [], mangSang: [], tomGon: true },
	lop4: { chiSo: [] },
	cham: { thangCham: "0-1", objectiveCap: 5, krCap: 5, tuCam: [] },
	daCat: { buoc: [], truocToken: 0, sauToken: 0, chienLuocCatKyTu: 0 },
};

async function kiemTapTool(): Promise<string[]> {
	const loi: string[] = [];
	const song: string[] = [];
	const tat: string[] = [];
	for (const f of readdirSync(join(GOC, "tools")).filter((t) =>
		t.endsWith(".ts"),
	)) {
		const mod = await import(join(GOC, "tools", f));
		const ten = f.replace(/\.ts$/, "");
		if (mod.default.kind === "eve:disabled-tool") tat.push(ten);
		else {
			song.push(ten);
			const s = JSON.stringify(
				z.toJSONSchema(mod.default.inputSchema, { target: "draft-7" }),
			);
			if (s.includes("$ref")) loi.push(`$ref vong: ${ten}`);
			if (JSON.parse(s).type !== "object")
				loi.push(`goc khong phai object: ${ten}`);
		}
	}
	for (const t of song)
		if (!(TRO_LY_OKR_SOAN.congCu.song as readonly string[]).includes(t))
			loi.push(`tool doi tac co mat: ${t}`);
	for (const t of TRO_LY_OKR_SOAN.congCu.song)
		if (!song.includes(t)) loi.push(`thieu tool: ${t}`);
	for (const t of TRO_LY_OKR_SOAN.congCu.tat)
		if (!tat.includes(t)) loi.push(`tool dung san chua tat: ${t}`);
	return loi;
}

describe("cach-ly", () => {
	test(`tập tool đúng bằng {${TRO_LY_OKR_SOAN.congCu.song.join(", ")}}; ${TRO_LY_OKR_SOAN.congCu.tat.length} tool dựng sẵn tắt; khuôn không vòng $ref`, async () => {
		expect(await kiemTapTool()).toEqual([]);
	});

	test("model tĩnh (không defineDynamic), modelId đúng config, có limits ba số", () => {
		const d = tacNhan as unknown as {
			model: { modelId?: string; kind?: string };
			limits?: Record<string, number>;
		};
		expect(d.model?.kind).not.toBe("eve:dynamic");
		expect(d.model?.modelId).toBe(TRO_LY_OKR_SOAN.model);
		for (const k of [
			"maxInputTokensPerSession",
			"maxOutputTokensPerSession",
			"sessionTimeoutMs",
		])
			expect(Number.isFinite(d.limits?.[k]), `thieu limit: ${k}`).toBe(true);
	});

	test("sandbox deny-all ba backend", () => {
		const s = readFileSync(join(GOC, "sandbox", "sandbox.ts"), "utf8");
		expect(s.match(/networkPolicy: "deny-all"/g)?.length).toBe(3);
	});

	test("không tệp nào nhập từ apps/agent; chỉ ghi bốn bảng cho phép", () => {
		const loi: string[] = [];
		for (const t of tepTs(GOC)) {
			const s = readFileSync(t, "utf8");
			if (/from "(\.\.\/)+agent\/|@\/agent|apps\/agent\//.test(s))
				loi.push(`nhap cheo: ${relative(GOC, t)}`);
			for (const m of s.matchAll(
				/\bdb\.(\w+)\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\(/g,
			)) {
				if (
					!(TRO_LY_OKR_SOAN.bangGhiDuoc as readonly string[]).includes(
						m[1] ?? "",
					)
				)
					loi.push(`${relative(GOC, t)}: ${m[1]}.${m[2]}`);
			}
		}
		expect(loi).toEqual([]);
	});

	test("hook, tool, instructions và lib đọc auth.initiator, không đọc auth.current", () => {
		const loi: string[] = [];
		let docInitiator = 0;
		for (const thuMuc of THU_MUC_DOC_PHIEN)
			for (const t of tepTs(join(GOC, thuMuc))) {
				const s = readFileSync(t, "utf8");
				if (DOC_AUTH_CURRENT.test(s))
					loi.push(`${relative(GOC, t)} doc auth.current`);
				if (DOC_AUTH_INITIATOR.test(s)) docInitiator += 1;
			}
		expect(loi).toEqual([]);
		expect(docInitiator, "khong tep nao doc auth.initiator").toBeGreaterThan(0);
	});

	test("thẻ dữ liệu bọc lớp 0-5 trong goiThanhChiDan: câu chèn ở trong thẻ, thẻ chèn trong trang bị vô hiệu, số thẻ đóng bằng số lớp", () => {
		const chu = goiThanhChiDan(GOI_GIA);
		expect(loiBocLop5(chu)).toEqual([]);
		expect(chu).toContain(TRO_LY_OKR_SOAN.goi.theVoHieu);
	});
});
