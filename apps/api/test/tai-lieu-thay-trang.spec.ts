import { beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { PATHNAME_NGUON } from "@crm/db/blob-nguon";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import type { DangCho } from "@crm/validation/tai-lieu";
import {
	TRANG_THAI_NGUON,
	type TrangThaiNguon,
} from "@crm/validation/tai-lieu-nguon";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import { docxNho } from "./tai-lieu-nguon-mau";
import {
	AI,
	type Ai,
	dungSan,
	duyet,
	goi,
	hoi,
	ma,
	ok,
	phien,
	TAI_LIEU_SAN,
	type TraLoi,
	taoTrang,
	traLai,
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

const MONG = {
	owner: CA_SAU,
	admin: CA_SAU,
	chu: CA_SAU,
	tao: CA_SAU,
	khac: CHI_DA_DUYET,
	okr: CHI_DA_DUYET,
} satisfies Record<Ai, readonly TrangThaiThu[]>;

const mongThay = (ai: Ai, tt: TrangThaiThu): boolean =>
	MONG[ai].some((x) => x === tt);

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
		await db.taiLieuDeXuat.count({
			where: { trang: { slug: hang.trang.slug } },
		}),
	).toBe(0);
	return { slug: hang.trang.slug, nguonId };
}

const SLUG = {} as Record<TrangThaiThu, string>;

type NguonCho = { id: string; tenTep: string; lyDo: string | null };
type TrangDoc = {
	choLanDau: { dangCho: DangCho; nguon: NguonCho | null } | null;
};

let demNguon = 0;
async function themNguon(
	trangId: string,
	trangThai: TrangThaiNguon,
	lyDo: string | null = null,
	taiBoi: Ai = "tao",
): Promise<string> {
	demNguon += 1;
	const { id } = await db.taiLieuNguon.create({
		data: {
			sha256: randomUUID().replaceAll("-", "").padEnd(64, "0"),
			tenTep: `them-${demNguon}.docx`,
			kieu: "docx",
			kichThuoc: 1,
			blobPathname: PATHNAME_NGUON(randomUUID()),
			taiBoiId: phien[taiBoi].nguoi,
			trangId,
			trangThai,
			lyDo,
			taiLuc: new Date(Date.now() + demNguon * 1000),
		},
		select: { id: true },
	});
	return id;
}

async function idCua(slug: string): Promise<string> {
	return (
		await db.taiLieuTrang.findUniqueOrThrow({
			where: { slug },
			select: { id: true },
		})
	).id;
}

async function choCua(slug: string): Promise<TrangDoc["choLanDau"]> {
	return ok<TrangDoc>(await hoi("taiLieu.get", { slug }, "chu"), `get ${slug}`)
		.choLanDau;
}

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
}, TAI_LIEU_SAN.hookMs);

describe("thay-trang", () => {
	test("ma-tran: moi nguoi mo duoc dung nhung trang danh sach cho thay, khong trang nao khac", async () => {
		let dem = 0;
		for (const ai of AI) {
			const quaList = await slugThayQuaList(ai);
			for (const tt of TRANG_THAI_THU) {
				const slug = SLUG[tt];
				const mong = mongThay(ai, tt);
				const get = await hoi("taiLieu.get", { slug }, ai);
				const nhac = await hoi("taiLieu.nhacToi", { slug }, ai);
				const thay = {
					list: quaList.has(slug),
					get: get.status === 200,
					nhacToi: nhac.status === 200,
				} satisfies Record<(typeof DIEM_VAO)[number], boolean>;
				if (thay.list !== thay.get)
					throw new Error(`lech list/get: ${ai} ${tt}`);
				if (thay.list !== thay.nhacToi)
					throw new Error(`lech list/nhacToi: ${ai} ${tt}`);
				for (const diem of DIEM_VAO) {
					if (thay[diem] !== mong) {
						throw new Error(
							`lech ${diem}: ${ai} ${tt} — mong ${mong ? "thay" : "khong thay"}, ${diem} ${thay[diem] ? "thay" : "khong thay"}`,
						);
					}
					dem += 1;
				}
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
		let oCoNguon = 0;
		for (const ai of AI) {
			const { rows } = ok<{ rows: { id: string }[] }>(
				await hoi("taiLieuNguon.list", undefined, ai),
				`nguon ${ai}`,
			);
			const idThay = new Set(rows.map((r) => r.id));
			for (const tt of TRANG_THAI_THU) {
				const get = await hoi("taiLieu.get", { slug: SLUG[tt] }, ai);
				if (get.status !== 200) continue;
				const nguon = (get.data as TrangDoc).choLanDau?.nguon ?? null;
				if (!nguon) continue;
				oCoNguon += 1;
				if (!idThay.has(nguon.id))
					throw new Error(`nguon khong thay: ${ai} ${tt}`);
			}
		}
		expect(oCoNguon).toBeGreaterThan(0);

		const an = await trangTuNguon(ma("Nguon admin moi hon"), "LOI", LY_DO_LOI);
		const cuaAdmin = await themNguon(
			await idCua(an.slug),
			"CAN_GO_TAY",
			null,
			"admin",
		);
		const MONG_NGUON = {
			tao: null,
			chu: cuaAdmin,
			admin: cuaAdmin,
			owner: cuaAdmin,
		} satisfies Partial<Record<Ai, string | null>>;
		for (const [ai, mong] of Object.entries(MONG_NGUON) as [
			Ai,
			string | null,
		][]) {
			const doc = ok<TrangDoc>(
				await hoi("taiLieu.get", { slug: an.slug }, ai),
				`get nguon admin ${ai}`,
			);
			if (doc.choLanDau?.dangCho !== "go-tay")
				throw new Error(`dangCho sai: nguon-admin ${ai}`);
			const nhan = doc.choLanDau.nguon?.id ?? null;
			if (nhan !== mong)
				throw new Error(
					`nguon khong thay: ${ai} nguon-admin — mong ${mong ?? "null"}, nhan ${nhan ?? "null"}`,
				);
		}
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
			if (an.status !== 404 || an.loi !== TAI_LIEU_API.thongDiep.khongCo)
				throw new Error(`khong thay sai loi: ${thuTuc} — ${tomTat(an)}`);
			expect(
				(await hoi(thuTuc, { slug: SLUG["may-soan"] }, "chu")).status,
			).toBe(200);
		}
		expect((await slugThayQuaList("khac")).has(SLUG["may-soan"])).toBe(false);
	});

	test("dang-cho: trang chua co ban noi dung dang cho gi, theo thu tu uu tien", async () => {
		const NGUON_DON = {
			CHO_DOC: "may-soan",
			CHO_SOAN: "may-soan",
			DANG_SOAN: "may-soan",
			DA_SOAN: "chua-co-ban",
			CAN_GO_TAY: "go-tay",
			LOI: "loi",
		} satisfies Record<TrangThaiNguon, DangCho>;
		const o: Record<string, { slug: string; mong: DangCho; nguonId?: string }> =
			{};
		for (const tt of TRANG_THAI_NGUON) {
			const r = await trangTuNguon(
				ma(`Don ${tt}`),
				tt,
				tt === "LOI" ? LY_DO_LOI : null,
			);
			o[`don-${tt}`] = {
				slug: r.slug,
				mong: NGUON_DON[tt],
				nguonId: r.nguonId,
			};
		}
		o["con-ban-cho"] = { slug: SLUG["cho-duyet"], mong: "duyet" };
		o["tra-lai-khong-nguon"] = { slug: SLUG["tra-lai"], mong: "tra-lai" };
		const trong = await db.taiLieuTrang.create({
			data: {
				slug: ma("khong-nguon-khong-ban"),
				ten: ma("Khong nguon khong ban"),
				loai: "quy-dinh",
				chuTrangId: phien.chu.nguoi,
				taoBoiId: phien.tao.nguoi,
			},
			select: { slug: true },
		});
		o["khong-nguon-khong-ban"] = { slug: trong.slug, mong: "chua-co-ban" };
		const ghep = async (
			ten: string,
			traLaiTruoc: boolean,
			tt: TrangThaiNguon,
			mong: DangCho,
		) => {
			const t = await taoTrang(ma(ten), "Bản đầu.\n", "tao", "chu");
			if (traLaiTruoc) await traLai(t.deXuatId, "chu");
			const nguonId = await themNguon(
				t.trangId,
				tt,
				tt === "LOI" ? LY_DO_LOI : null,
			);
			o[ten] = { slug: t.slug, mong, nguonId };
		};
		await ghep("cho-duyet-va-dang-soan", false, "DANG_SOAN", "duyet");
		await ghep("tra-lai-roi-soan-lai", true, "DANG_SOAN", "may-soan");
		await ghep("tra-lai-roi-loi", true, "LOI", "loi");
		await ghep("tra-lai-nguon-da-soan", true, "DA_SOAN", "tra-lai");
		const hai = await trangTuNguon(ma("Hai nguon"), "LOI", LY_DO_LOI);
		o["hai-nguon"] = {
			slug: hai.slug,
			mong: "go-tay",
			nguonId: await themNguon(await idCua(hai.slug), "CAN_GO_TAY"),
		};
		let dem = 0;
		for (const [ten, ca] of Object.entries(o)) {
			const cho = await choCua(ca.slug);
			if (cho?.dangCho !== ca.mong)
				throw new Error(
					`dangCho sai: ${ten} — mong ${ca.mong}, nhan ${cho?.dangCho ?? "null"}`,
				);
			if (ca.nguonId && cho.nguon?.id !== ca.nguonId)
				throw new Error(`nguon sai: ${ten}`);
			if (!ca.nguonId && ten !== "con-ban-cho" && cho.nguon !== null)
				throw new Error(`nguon thua: ${ten}`);
			dem += 1;
		}
		expect((await choCua(o["don-LOI"]?.slug ?? ""))?.nguon?.lyDo).toBe(
			LY_DO_LOI,
		);
		expect(await choCua(SLUG["da-duyet"])).toBeNull();
		expect(dem).toBe(TRANG_THAI_NGUON.length + 8);
	});

	test("viet-tay: chu trang va nguoi tao gui ban dau cho trang chua co ban", async () => {
		const goTay = await trangTuNguon(ma("Viet tay go tay"), "CAN_GO_TAY");
		const tl = await taoTrang(
			ma("Viet tay tra lai"),
			"Bản đầu.\n",
			"tao",
			"chu",
		);
		await traLai(tl.deXuatId, "chu");
		const CA: [Ai, string][] = [
			["chu", goTay.slug],
			["tao", tl.slug],
		];
		for (const [ai, slug] of CA) {
			const khac = await goi(
				"taiLieu.propose",
				{ slug, noiDung: "Người ngoài viết.\n" },
				"khac",
			);
			if (khac.status !== 404 || khac.loi !== TAI_LIEU_API.thongDiep.khongCo)
				throw new Error(`viet tay lot nguoi ngoai: ${slug} — ${khac.status}`);
			const r = await goi(
				"taiLieu.propose",
				{ slug, noiDung: `Bản viết tay của ${ai}.\n` },
				ai,
			);
			if (r.status !== 200)
				throw new Error(
					`viet tay bi chan: ${ai} ${slug} — ${r.status} ${r.loi}`,
				);
			const { deXuatId } = r.data as { deXuatId: string };
			const hang = await db.taiLieuDeXuat.findUniqueOrThrow({
				where: { id: deXuatId },
				select: { banGocId: true, trangThai: true },
			});
			expect(hang).toEqual({ banGocId: null, trangThai: "CHO_DUYET" });
			expect((await choCua(slug))?.dangCho).toBe("duyet");
		}
	});
});
