import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import tacNhan from "../agent/agent";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";

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
});
