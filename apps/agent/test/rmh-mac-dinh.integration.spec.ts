import { afterAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "@crm/db";
import { readAgentModel, writeAgentModel } from "@crm/db/settings";
import { z } from "zod";
import { modelChoLuot } from "../agent/lib/model";
import { datNguonDanhMuc, docDanhMucTuMang } from "../agent/lib/model-danh-muc";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = join(DAY, "..", "..", "..");

const anhChup = z
	.object({
		entry: z.object({ id: z.string(), context_window: z.number() }),
	})
	.parse(
		JSON.parse(
			readFileSync(
				join(
					GOC,
					"_acceptance",
					"re-mo-hinh-mac-dinh",
					"evidence",
					"gateway-gemini-3-8-flash-2026-10-15.json",
				),
				"utf8",
			),
		),
	).entry;

const danhMucTho = JSON.parse(
	readFileSync(join(DAY, "fixtures", "gateway-models-2026-10-05.json"), "utf8"),
);
const maTrongDanhMuc = z
	.object({ data: z.array(z.object({ id: z.string() })) })
	.parse(danhMucTho)
	.data.map((m) => m.id);

const MA_DA_CHON =
	maTrongDanhMuc.find(
		(id) => id !== anhChup.id && !id.startsWith("zai/") && id.includes("/"),
	) ?? "";
const MA_DA_GO = "khong-con/model-da-go";

async function voiDanhMuc<T>(lam: () => Promise<T>): Promise<T> {
	const layVe = (async () =>
		Response.json(danhMucTho)) as unknown as typeof fetch;
	const hoanLai = datNguonDanhMuc(() => docDanhMucTuMang(layVe));
	try {
		return await lam();
	} finally {
		hoanLai();
	}
}

afterAll(async () => {
	await writeAgentModel(db, null);
});

type Ca = {
	ten: string;
	luu: { id: string; contextWindowTokens: number } | null;
	mong: string;
	macDinh: boolean;
};

const BANG: readonly Ca[] = [
	{ ten: "(a) chưa chọn model", luu: null, mong: anhChup.id, macDinh: true },
	{
		ten: "(b) đã chọn một mã có trên Gateway",
		luu: { id: MA_DA_CHON, contextWindowTokens: 200_000 },
		mong: MA_DA_CHON,
		macDinh: false,
	},
	{
		ten: "(c) đã chọn một mã không còn trên Gateway",
		luu: { id: MA_DA_GO, contextWindowTokens: 200_000 },
		mong: anhChup.id,
		macDinh: false,
	},
];

describe("rmh-mac-dinh", () => {
	test("rmh-mac-dinh: bảng ba ca viết trước, mã đã chọn có thật trong danh mục", () => {
		expect(BANG).toHaveLength(3);
		expect(maTrongDanhMuc).toContain(MA_DA_CHON);
		expect(maTrongDanhMuc).toContain(anhChup.id);
		expect(maTrongDanhMuc).not.toContain(MA_DA_GO);
	});

	for (const ca of BANG) {
		test(`rmh-mac-dinh: ${ca.ten}`, async () => {
			await writeAgentModel(db, ca.luu);
			const caiDat = await readAgentModel(db);
			const luot = await voiDanhMuc(() => modelChoLuot());
			expect({ ca: ca.ten, luot: luot.id }).toEqual({
				ca: ca.ten,
				luot: ca.mong,
			});
			expect({ ca: ca.ten, macDinh: caiDat.isDefault }).toEqual({
				ca: ca.ten,
				macDinh: ca.macDinh,
			});
			if (ca.luu === null) {
				expect(caiDat).toEqual({
					id: anhChup.id,
					contextWindowTokens: anhChup.context_window,
					isDefault: true,
				});
			}
		});
	}
});
