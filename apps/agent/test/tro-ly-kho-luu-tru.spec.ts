import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TaiLieuLichSuService } from "../../api/src/tai-lieu/tai-lieu-lich-su.service";
import readPage from "../agent/subagents/tro_ly_kho/tools/read_page";
import searchPages from "../agent/subagents/tro_ly_kho/tools/search_pages";
import {
	donTroLyKho,
	duyetDeXuat,
	gieoNguoi,
	goiCongCu,
	ma,
	moHoiCrm,
	type Nguoi,
	trangDaDuyet,
} from "./support/tro-ly-kho-gia";

const TU = `tulapkholuutru${Date.now().toString(36)}`;
const S = { a: "", b: "" };
let quanTri: Nguoi;

const lichSu = () => new TaiLieuLichSuService(db);

async function viecTrang(loai: "luu-tru" | "khoi-phuc", slug: string) {
	const vao = { slug, lyDo: "Đo trợ lý kho." };
	const { deXuatId } =
		loai === "luu-tru"
			? await lichSu().deXuatLuuTru(quanTri, vao)
			: await lichSu().deXuatKhoiPhuc(quanTri, vao);
	await duyetDeXuat(quanTri, deXuatId);
}

async function timVaDoc() {
	const { ctx } = await moHoiCrm(quanTri);
	const tim = await goiCongCu<{ rows: { slug: string }[] }>(
		searchPages,
		{ query: TU },
		ctx,
	);
	if (!tim.ok) throw new Error(`tim: ${tim.loi}`);
	const doc = async (slug: string) => {
		const tra = await goiCongCu<{ loai: string; noiDung?: string }>(
			readPage,
			{ slug },
			ctx,
		);
		if (!tra.ok) throw new Error(`doc ${slug}: ${tra.loi}`);
		return tra.ra;
	};
	const cuaToi = new Set([S.a, S.b]);
	return {
		tim: tim.ra.rows
			.map((r) => r.slug)
			.filter((s) => cuaToi.has(s))
			.sort(),
		docB: await doc(S.b),
		khongCo: await doc(ma("khong-ton-tai")),
	};
}

beforeAll(async () => {
	quanTri = await gieoNguoi("owner");
	for (const k of ["a", "b"] as const)
		S[k] = (
			await trangDaDuyet(
				quanTri,
				`Trang kho ${k} ${ma(k)}`,
				`## ${k}\n\nTừ khoá ${TU} của trang ${k}.`,
			)
		).slug;
	await viecTrang("luu-tru", S.b);
});

afterAll(async () => {
	await donTroLyKho();
});

describe("tro-ly-kho-luu-tru", () => {
	test("tro-ly-kho-luu-tru: search_pages chi ra A, read_page(B) nhu slug khong co; khoi phuc thi ra lai", async () => {
		const sau = await timVaDoc();
		expect(sau.tim).toEqual([S.a]);
		expect(sau.docB).toEqual(sau.khongCo);
		expect(sau.docB).toEqual({ loai: "khong-co" });

		await viecTrang("khoi-phuc", S.b);

		const lai = await timVaDoc();
		expect(lai.tim).toEqual([S.a, S.b].sort());
		expect(lai.docB.loai).toBe("trang");
		expect(lai.docB.noiDung).toContain(TU);
	});
});
