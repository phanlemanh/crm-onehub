import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import {
	khoaChanTuLuocDo,
	SO_KHOA_NGUOI,
	soKhoaLech,
} from "../scripts/okr-mau/so-khoa-nguoi";

const LUOC_DO = readFileSync(
	join(import.meta.dir, "../../../packages/db/prisma/schema.prisma"),
	"utf8",
);

const MODEL_MOI = `
model ThuMoi {
  id      String @id
  nguoiId String
  nguoi   User   @relation(fields: [nguoiId], references: [id])
}
`;

function doiTruongViec(luocDo: string, doi: (dong: string) => string): string {
	return luocDo.replace(
		/^(\s+taoBoi\s+User\s+@relation\("ViecTaoBoi".*)$/m,
		(dong) => doi(dong),
	);
}

function bangCuaModel(luocDo: string): Map<string, string> {
	const ra = new Map<string, string>();
	for (const [, model, than] of luocDo.matchAll(
		/^model (\w+) \{([\s\S]*?)^\}/gm,
	))
		ra.set(model, than.match(/@@map\("([^"]+)"\)/)?.[1] ?? model);
	return ra;
}

function cotCuaKhoa(luocDo: string, khoa: string): string {
	const [model, truong] = khoa.split(".");
	const than = luocDo.match(
		new RegExp(`^model ${model} \\{([\\s\\S]*?)^\\}`, "m"),
	)?.[1];
	if (!than) throw new Error(`khong thay model ${model}`);
	const cotQuanHe = than
		.match(new RegExp(`^\\s+${truong}\\s+User.*fields:\\s*\\[(\\w+)\\]`, "m"))
		?.at(1);
	if (!cotQuanHe) throw new Error(`khong thay fields cua ${khoa}`);
	return (
		than
			.match(new RegExp(`^\\s+${cotQuanHe}\\s+.*@map\\("([^"]+)"\\)`, "m"))
			?.at(1) ?? cotQuanHe
	);
}

describe("okx-luoi", () => {
	test("sổ khoá khớp hai chiều mọi khoá chặn tới User của lược đồ thật", () => {
		expect(soKhoaLech(LUOC_DO)).toEqual({ thieu: [], thua: [] });
	});

	test("chiều đỏ: model mới có khoá chặn tới User chưa khai → gọi tên ThuMoi.nguoi", () => {
		expect(soKhoaLech(`${LUOC_DO}\n${MODEL_MOI}`)).toEqual({
			thieu: ["ThuMoi.nguoi"],
			thua: [],
		});
	});

	test("chiều đỏ: dòng sổ trỏ trường đã xoá → thừa Viec.taoBoi", () => {
		const sao = doiTruongViec(LUOC_DO, () => "");
		expect(soKhoaLech(sao).thua).toContain("Viec.taoBoi");
	});

	test("chiều đỏ: khoá đổi sang Cascade thôi chặn → thừa Viec.taoBoi", () => {
		const sao = doiTruongViec(LUOC_DO, (d) =>
			d.replace("onDelete: Restrict", "onDelete: Cascade"),
		);
		expect(khoaChanTuLuocDo(sao)).not.toContain("Viec.taoBoi");
		expect(soKhoaLech(sao).thua).toContain("Viec.taoBoi");
	});

	test("okx-luoi catalog: mỗi khoá sổ đúng một ràng buộc chặn tới bảng user trong kho kiểm, và ngược lại", async () => {
		const rows = await db.$queryRaw<{ bang: string; cot: string }[]>`
			SELECT cl.relname AS bang, a.attname AS cot
			FROM pg_constraint con
			JOIN pg_class cl ON cl.oid = con.conrelid
			JOIN pg_class rf ON rf.oid = con.confrelid
			JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
			WHERE con.contype = 'f' AND rf.relname = 'user' AND con.confdeltype IN ('r', 'a')`;
		const catalog = rows.map((r) => `${r.bang}.${r.cot}`).sort();
		const bang = bangCuaModel(LUOC_DO);
		const tuSo = Object.keys(SO_KHOA_NGUOI)
			.map((k) => `${bang.get(k.split(".")[0])}.${cotCuaKhoa(LUOC_DO, k)}`)
			.sort();
		expect(tuSo).toEqual(catalog);
	});
});
