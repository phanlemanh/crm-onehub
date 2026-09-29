import { beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import { docxNho } from "./tai-lieu-nguon-mau";
import {
	AI,
	type Ai,
	duyet,
	dungSan,
	goi,
	hoi,
	ma,
	ok,
	phien,
	taoTrang,
	traLai,
	type TraLoi,
} from "./tai-lieu-san";

const gia = khoNguonGia();
dungSan(gia);

const TRANG_THAI_THU = [
	"da-duyet",
	"cho-duyet",
	"may-soan",
	"go-tay",
	"loi",
	"tra-lai",
] as const;
type TrangThaiThu = (typeof TRANG_THAI_THU)[number];

const CA_SAU = TRANG_THAI_THU;
const CHI_DA_DUYET = ["da-duyet"] as const;

const MONG: Record<Ai, readonly TrangThaiThu[]> = {
	owner: CA_SAU,
	admin: CA_SAU,
	chu: CA_SAU,
	tao: CA_SAU,
	khac: CHI_DA_DUYET,
	okr: CHI_DA_DUYET,
};

const DIEM_VAO = ["list", "get", "nhacToi"] as const;
const LY_DO_LOI = "Máy soạn hết thời gian.";
const TU_TIM = `thaytrang${Date.now().toString(36)}`;

type Cho = { pathname: string; phieu: string };

async function trangTuNguon(
	ten: string,
	trangThai: string,
	lyDo: string | null = null,
): Promise<{ slug: string; nguonId: string }> {
	const tenTep = `${ten}.docx`;
	const byte = docxNho(`${ten} ${randomUUID()}`);
	const cho = ok<Cho>(
		await goi(
			"taiLieuNguon.xinCho",
			{ tenTep, kieu: "docx", kichThuoc: byte.length },
			"tao",
		),
		`xin cho ${ten}`,
	);
	gia.daPut.set(cho.pathname, byte);
	const { nguonId } = ok<{ nguonId: string }>(
		await goi(
			"taiLieuNguon.nhan",
			{
				pathname: cho.pathname,
				tenTep,
				phieu: cho.phieu,
				dich: {
					loai: "moi",
					ten,
					loaiTrang: "quy-dinh",
					chuTrangId: phien.chu.nguoi,
				},
			},
			"tao",
		),
		`nhan ${ten}`,
	);
	const hang = await db.taiLieuNguon.update({
		where: { id: nguonId },
		data: { trangThai, lyDo },
		select: { trang: { select: { slug: true, taoBoiId: true } } },
	});
	expect(hang.trang.taoBoiId).toBe(phien.tao.nguoi);
	expect(
		await db.taiLieuDeXuat.count({ where: { trang: { slug: hang.trang.slug } } }),
	).toBe(0);
	return { slug: hang.trang.slug, nguonId };
}

const SLUG = {} as Record<TrangThaiThu, string>;

async function slugThayQuaList(ai: Ai): Promise<Set<string>> {
	const cuaThu = new Set(Object.values(SLUG));
	const thay = new Set<string>();
	for (let page = 1; ; page += 1) {
		const { rows } = ok<{ rows: { slug: string }[] }>(
			await hoi("taiLieu.list", { page }, ai),
			`list ${ai} trang ${page}`,
		);
		for (const r of rows) if (cuaThu.has(r.slug)) thay.add(r.slug);
		if (rows.length === 0 || page > 200) break;
	}
	return thay;
}

beforeAll(async () => {
	const dd = await taoTrang(
		ma("Da duyet"),
		`Trang đã duyệt có từ ${TU_TIM}.\n`,
		"tao",
		"chu",
	);
	await duyet(dd.deXuatId, "chu");
	SLUG["da-duyet"] = dd.slug;
	SLUG["cho-duyet"] = (
		await taoTrang(ma("Cho duyet"), "Bản đầu chờ duyệt.\n", "tao", "chu")
	).slug;
	const tl = await taoTrang(ma("Tra lai"), "Bản đầu thiếu số.\n", "tao", "chu");
	await traLai(tl.deXuatId, "chu");
	SLUG["tra-lai"] = tl.slug;
	SLUG["may-soan"] = (await trangTuNguon(ma("May soan"), "DANG_SOAN")).slug;
	SLUG["go-tay"] = (await trangTuNguon(ma("Go tay"), "CAN_GO_TAY")).slug;
	SLUG.loi = (await trangTuNguon(ma("Loi soan"), "LOI", LY_DO_LOI)).slug;
});

describe("thay-trang", () => {
	test("ma-tran: moi nguoi mo duoc dung nhung trang danh sach cho thay, khong trang nao khac", async () => {
		let dem = 0;
		for (const ai of AI) {
			const quaList = await slugThayQuaList(ai);
			for (const tt of TRANG_THAI_THU) {
				const slug = SLUG[tt];
				const mong = MONG[ai].includes(tt);
				const get = await hoi("taiLieu.get", { slug }, ai);
				const nhac = await hoi("taiLieu.nhacToi", { slug }, ai);
				const thay: Record<(typeof DIEM_VAO)[number], boolean> = {
					list: quaList.has(slug),
					get: get.status === 200,
					nhacToi: nhac.status === 200,
				};
				for (const diem of DIEM_VAO) {
					if (thay[diem] !== mong) {
						throw new Error(
							`lech ${diem}: ${ai} ${tt} — mong ${mong ? "thay" : "khong thay"}, ${diem} ${thay[diem] ? "thay" : "khong thay"}`,
						);
					}
					dem += 1;
				}
				if (thay.list !== thay.get)
					throw new Error(`lech list/get: ${ai} ${tt}`);
				if (thay.list !== thay.nhacToi)
					throw new Error(`lech list/nhacToi: ${ai} ${tt}`);
			}
		}
		expect(dem).toBe(AI.length * TRANG_THAI_THU.length * DIEM_VAO.length);
		expect(dem).toBe(108);
	});

	test("diem-vao: dong nguon va ket qua tim cua moi nguoi deu mo duoc bang get cua chinh nguoi do", async () => {
		const cuaThu = new Map(Object.entries(SLUG).map(([tt, s]) => [s, tt]));
		let dongNguonTao = 0;
		for (const ai of AI) {
			const { rows } = ok<{ rows: { trang: { slug: string } }[] }>(
				await hoi("taiLieuNguon.list", undefined, ai),
				`nguon ${ai}`,
			);
			for (const r of rows) {
				const tt = cuaThu.get(r.trang.slug);
				if (!tt) continue;
				if (ai === "tao") dongNguonTao += 1;
				const get = await hoi("taiLieu.get", { slug: r.trang.slug }, ai);
				if (get.status !== 200)
					throw new Error(`dong nguon dan toi 404: ${ai} ${tt}`);
			}
			const tim = ok<{ rows: { slug: string }[] }>(
				await hoi("taiLieu.tim", { q: TU_TIM }, ai),
				`tim ${ai}`,
			);
			expect(tim.rows.map((r) => r.slug)).toContain(SLUG["da-duyet"]);
			for (const r of tim.rows) {
				const get = await hoi("taiLieu.get", { slug: r.slug }, ai);
				if (get.status !== 200)
					throw new Error(`ket qua tim dan toi 404: ${ai} ${r.slug}`);
			}
		}
		expect(dongNguonTao).toBeGreaterThanOrEqual(3);
	});

	test("khong-thay: trang khong duoc thay tra loi giong het slug khong co", async () => {
		const khongCo = ma("khong-co");
		const tomTat = (t: TraLoi) => `${t.status} ${t.loi}`;
		for (const thuTuc of ["taiLieu.get", "taiLieu.nhacToi"] as const) {
			const an = await hoi(thuTuc, { slug: SLUG["may-soan"] }, "khac");
			const vang = await hoi(thuTuc, { slug: khongCo }, "khac");
			if (tomTat(an) !== tomTat(vang))
				throw new Error(
					`khong thay khac khong ton tai: ${thuTuc} — ${tomTat(an)} / ${tomTat(vang)}`,
				);
			expect(an.status).toBe(404);
			expect(an.loi).toBe(TAI_LIEU_API.thongDiep.khongCo);
			expect((await hoi(thuTuc, { slug: SLUG["may-soan"] }, "chu")).status).toBe(
				200,
			);
		}
		expect((await slugThayQuaList("khac")).has(SLUG["may-soan"])).toBe(false);
	});
});
