import { beforeAll, describe, expect, spyOn, test } from "bun:test";
import { createHash } from "node:crypto";
import { db } from "@crm/db";
import { soSanh } from "@crm/validation/tai-lieu-diff";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import {
	type Ai,
	deXuat,
	dungSan,
	duyet,
	goi,
	hoi,
	ma,
	ok,
	phien,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

const T = TAI_LIEU_API.thongDiep;

type Nguoi = { id: string; name: string };
type DongLichSu = {
	so: number;
	ten: string;
	duyetLuc: string;
	nguoiDuyet: Nguoi;
	nguoiDeXuat: Nguoi;
	dangDung: boolean;
};
type PhienBan = {
	so: number;
	ten: string;
	noiDung: string;
	duyetLuc: string;
	laBanDangDung: boolean;
	dangDung: { so: number; ten: string; noiDung: string };
};

const BAN = [
	"## Hoa hồng\n\nMức hoa hồng là 5% cho mọi hợp đồng.\n\nÁp dụng từ quý một.",
	"## Hoa hồng\n\nMức hoa hồng là 6% cho mọi hợp đồng.\n\nÁp dụng từ quý một.",
	"## Hoa hồng\n\nMức hoa hồng là 7% cho hợp đồng mới.\n\nThêm thưởng cuối năm.",
] as const;

const san = { p: "", q: "", s: "" };
const ten: Record<string, string> = {};

async function nguoi(ai: Ai): Promise<Nguoi> {
	const u = await db.user.findUniqueOrThrow({
		where: { id: phien[ai].nguoi },
		select: { id: true, name: true },
	});
	return u;
}

async function trangBaBan(): Promise<string> {
	const tenP = ma("Lich su P");
	const p = await taoTrang(tenP, BAN[0], "tao", "chu");
	await duyet(p.deXuatId, "chu");
	await duyet(await deXuat(p.slug, BAN[1], "khac"), "chu");
	await duyet(await deXuat(p.slug, BAN[2], "tao"), "chu");
	ten[p.slug] = tenP;
	return p.slug;
}

async function banCua(slug: string) {
	return db.taiLieuPhienBan.findMany({
		where: { trang: { slug } },
		orderBy: { so: "asc" },
	});
}

function bamBan(b: {
	so: number;
	ten: string;
	noiDung: string;
	duyetLuc: Date;
}): string {
	return createHash("sha256")
		.update(JSON.stringify([b.so, b.ten, b.noiDung, b.duyetLuc.toISOString()]))
		.digest("hex");
}

async function demDeXuatSuKien(slug: string) {
	const trang = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: { id: true },
	});
	const [deXuat, suKien] = await Promise.all([
		db.taiLieuDeXuat.count({ where: { trangId: trang.id } }),
		db.taiLieuSuKien.count({ where: { trangId: trang.id } }),
	]);
	return { deXuat, suKien };
}

beforeAll(async () => {
	san.p = await trangBaBan();
	const q = await taoTrang(
		ma("Lich su Q"),
		"## Q\n\nChưa duyệt.",
		"tao",
		"chu",
	);
	san.q = q.slug;
	const s = await taoTrang(ma("Lich su S"), BAN[0], "tao", "chu");
	await duyet(s.deXuatId, "chu");
	await duyet(await deXuat(s.slug, BAN[1], "tao"), "chu");
	const luuTru = ok<{ deXuatId: string }>(
		await goi(
			"taiLieu.deXuatLuuTru",
			{ slug: s.slug, lyDo: "Không còn dùng." },
			"tao",
		),
		"de xuat luu tru S",
	).deXuatId;
	await duyet(luuTru, "chu");
	san.s = s.slug;
}, 120_000);

describe("lslt-api", () => {
	test("lich-su: ba dong moi nhat truoc, dung mot ban dang dung, Q rong, nguoi khong thay NOT_FOUND", async () => {
		const [a, b, c] = await Promise.all([
			nguoi("tao"),
			nguoi("khac"),
			nguoi("chu"),
		]);
		const ban = await banCua(san.p);
		const mong = [
			{ so: 3, nguoiDeXuat: a, nguoiDuyet: c, dangDung: true },
			{ so: 2, nguoiDeXuat: b, nguoiDuyet: c, dangDung: false },
			{ so: 1, nguoiDeXuat: a, nguoiDuyet: c, dangDung: false },
		].map((m) => {
			const h = ban.find((x) => x.so === m.so);
			if (!h) throw new Error(`thieu ban ${m.so}`);
			return { ...m, ten: h.ten, duyetLuc: h.duyetLuc.toISOString() };
		});
		const rows = ok<DongLichSu[]>(
			await hoi("taiLieu.lichSu", { slug: san.p }, "khac"),
			"lich su P",
		);
		expect(rows).toEqual(mong);
		expect(rows.filter((r) => r.dangDung)).toHaveLength(1);

		expect(
			ok<DongLichSu[]>(
				await hoi("taiLieu.lichSu", { slug: san.q }, "chu"),
				"lich su Q",
			),
		).toEqual([]);

		const lichSuQ = await hoi("taiLieu.lichSu", { slug: san.q }, "khac");
		const getQ = await hoi("taiLieu.get", { slug: san.q }, "khac");
		expect([lichSuQ.status, lichSuQ.loi]).toEqual([404, T.khongCo]);
		expect([lichSuQ.status, lichSuQ.loi]).toEqual([getQ.status, getQ.loi]);
	});

	test("lich-su: chieu do — dang dung doc tu banDangDungId, khong suy tu so lon nhat", async () => {
		const ban = await banCua(san.p);
		const v2 = ban.find((b) => b.so === 2);
		const v3 = ban.find((b) => b.so === 3);
		if (!v2 || !v3) throw new Error("thieu ban 2 hay 3");
		await db.taiLieuTrang.update({
			where: { slug: san.p },
			data: { banDangDungId: v2.id },
		});
		try {
			const rows = ok<DongLichSu[]>(
				await hoi("taiLieu.lichSu", { slug: san.p }, "khac"),
				"lich su P do",
			);
			expect(rows.map((r) => [r.so, r.dangDung])).toEqual([
				[3, false],
				[2, true],
				[1, false],
			]);
		} finally {
			await db.taiLieuTrang.update({
				where: { slug: san.p },
				data: { banDangDungId: v3.id },
			});
		}
	});

	test("phien-ban: ban 1 kem ban dang dung de so, ban dang dung co co, so 9 va trang khong thay NOT_FOUND", async () => {
		const ban = await banCua(san.p);
		const [v1, , v3] = ban;
		if (!v1 || !v3) throw new Error("thieu ban");
		const mot = ok<PhienBan>(
			await hoi("taiLieu.phienBan", { slug: san.p, so: 1 }, "khac"),
			"phien ban 1",
		);
		expect({
			so: mot.so,
			ten: mot.ten,
			noiDung: mot.noiDung,
			duyetLuc: mot.duyetLuc,
			laBanDangDung: mot.laBanDangDung,
			dangDung: mot.dangDung.noiDung,
		}).toEqual({
			so: 1,
			ten: v1.ten,
			noiDung: v1.noiDung,
			duyetLuc: v1.duyetLuc.toISOString(),
			laBanDangDung: false,
			dangDung: v3.noiDung,
		});
		const doan = soSanh(mot.noiDung, mot.dangDung.noiDung).flatMap(
			(k) => k.doan,
		);
		expect(doan.some((d) => d.loai === "them")).toBe(true);
		expect(doan.some((d) => d.loai === "bo")).toBe(true);

		const ba = ok<PhienBan>(
			await hoi("taiLieu.phienBan", { slug: san.p, so: 3 }, "khac"),
			"phien ban 3",
		);
		expect(ba.laBanDangDung).toBe(true);

		for (const [slug, so, ai] of [
			[san.p, 9, "khac"],
			[san.q, 1, "chu"],
			[san.q, 1, "khac"],
		] as const) {
			const tra = await hoi("taiLieu.phienBan", { slug, so }, ai);
			expect(`${slug} ${so} ${ai}: ${tra.status} ${tra.loi}`).toBe(
				`${slug} ${so} ${ai}: 404 ${T.khongCo}`,
			);
		}
	});

	test("phien-ban: chieu do — so am, so khong nguyen bi khuon nhap tu choi truoc khi cham DB", async () => {
		const tim = spyOn(db.taiLieuTrang, "findFirst");
		try {
			for (const so of [-1, 1.5, 0]) {
				const tra = await hoi("taiLieu.phienBan", { slug: san.p, so }, "khac");
				expect(`${so}: ${tra.status}`).toBe(`${so}: 400`);
			}
			expect(tim).toHaveBeenCalledTimes(0);
		} finally {
			tim.mockRestore();
		}
	});

	test("quay-lai: mot de xuat tu ban 1, duyet thanh ban 4, ban cu khong doi", async () => {
		const truoc = await banCua(san.p);
		const bamTruoc = truoc.map(bamBan);
		const v1 = truoc[0];
		if (!v1) throw new Error("thieu ban 1");
		const dem = await demDeXuatSuKien(san.p);
		const { deXuatId } = ok<{ deXuatId: string }>(
			await goi("taiLieu.quayLai", { slug: san.p, so: 1 }, "tao"),
			"quay lai 1",
		);
		const trang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { slug: san.p },
			select: { banDangDungId: true },
		});
		const dx = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
		});
		expect({
			loai: dx.loai,
			ten: dx.ten.normalize("NFC"),
			noiDung: dx.noiDung.normalize("NFC"),
			banGocId: dx.banGocId,
			tuPhienBanSo: dx.tuPhienBanSo,
			trangThai: dx.trangThai,
		}).toEqual({
			loai: "NOI_DUNG",
			ten: v1.ten.normalize("NFC"),
			noiDung: v1.noiDung.normalize("NFC"),
			banGocId: trang.banDangDungId,
			tuPhienBanSo: 1,
			trangThai: "CHO_DUYET",
		});
		expect(await demDeXuatSuKien(san.p)).toEqual({
			deXuat: dem.deXuat + 1,
			suKien: dem.suKien + 1,
		});
		const suKien = await db.taiLieuSuKien.findFirstOrThrow({
			where: {
				loai: "DE_XUAT",
				chiTiet: { path: ["deXuatId"], equals: deXuatId },
			},
		});
		expect(suKien.aiId).toBe(phien.tao.nguoi);

		expect(await duyet(deXuatId, "chu")).toBe(4);
		const sau = await banCua(san.p);
		expect(sau.find((b) => b.so === 4)?.noiDung).toBe(v1.noiDung);
		expect(sau.filter((b) => b.so <= 3).map(bamBan)).toEqual(bamTruoc);
	});

	test("quay-lai: ma tran tu choi viet truoc, moi ca khong ghi hang nao", async () => {
		const BANG = [
			{
				ca: "ban dang dung",
				slug: () => san.p,
				so: 4,
				mong: `409 ${T.chuaDoi}`,
			},
			{
				ca: "trang da luu tru",
				slug: () => san.s,
				so: 1,
				mong: `400 ${T.daLuuTru}`,
			},
			{
				ca: "so khong co",
				slug: () => san.p,
				so: 42,
				mong: `404 ${T.khongCo}`,
			},
		] as const;
		expect(BANG).toHaveLength(3);
		for (const dong of BANG) {
			const truoc = await demDeXuatSuKien(dong.slug());
			const tra = await goi(
				"taiLieu.quayLai",
				{ slug: dong.slug(), so: dong.so },
				"tao",
			);
			expect(`${dong.ca}: ${tra.status} ${tra.loi}`).toBe(
				`${dong.ca}: ${dong.mong}`,
			);
			expect(await demDeXuatSuKien(dong.slug())).toEqual(truoc);
		}
	});
});
