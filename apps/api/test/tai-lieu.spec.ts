import { beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { parseSuKienChiTiet } from "@crm/validation/tai-lieu";
import { diffHash, soSanh } from "@crm/validation/tai-lieu-diff";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import { gieoThanhVien, mintPhien } from "./phien-thu";
import {
	type DeXuatDoc,
	demTaiLieu,
	deXuat,
	donTaiLieu,
	dungSan,
	duyet,
	goi,
	goiBang,
	hashCua,
	hoi,
	ma,
	ok,
	phien,
	taoTrang,
	traLai,
} from "./tai-lieu-san";

dungSan();

const T = TAI_LIEU_API.thongDiep;

type Get = {
	noiDung: string | null;
	coBanCho: boolean;
	phienBan: { so: number } | null;
};

const SLUG_TAO = [
	"quy-dinh-hoa-hong",
	"quy-dinh-hoa-hong-2",
	"quy-dinh-hoa-hong-3",
	"doi-tac-da-nang",
	"moi-2",
];

describe("tao-trang", () => {
	test("tao-trang: ma tran slug, tu choi ten sai khong ghi gi, noi dung luu NFC", async () => {
		await donTaiLieu({ slug: { in: SLUG_TAO } });
		const MA_TRAN = [
			["tao", "Quy định hoa hồng", "quy-dinh-hoa-hong"],
			["okr", "Đối tác Đà Nẵng", "doi-tac-da-nang"],
			["tao", "Quy định hoa hồng", "quy-dinh-hoa-hong-2"],
			["okr", "Quy định hoa hồng", "quy-dinh-hoa-hong-3"],
		] as const;
		for (const [ai, ten, mong] of MA_TRAN) {
			const tra = await goi(
				"taiLieu.create",
				{ ten, loai: "quy-dinh", noiDung: "Nội dung." },
				ai,
			);
			expect(`${ai} ${ten} -> ${ok<{ slug: string }>(tra, ten).slug}`).toBe(
				`${ai} ${ten} -> ${mong}`,
			);
		}
		const TU_CHOI = [
			["  ✨ !!! ", T.tenKhongChu],
			["   ", T.tenTrong],
			["a".repeat(161), T.tenDai(160)],
		] as const;
		for (const [ten, loi] of TU_CHOI) {
			const truoc = await demTaiLieu();
			const tra = await goi(
				"taiLieu.create",
				{ ten, loai: "quy-dinh", noiDung: "x" },
				"tao",
			);
			expect(`${ten.length}: ${tra.status} ${tra.loi}`).toBe(
				`${ten.length}: 400 ${loi}`,
			);
			expect(await demTaiLieu()).toEqual(truoc);
		}
		const dai = ok<{ slug: string }>(
			await goi(
				"taiLieu.create",
				{ ten: `Đ${"a".repeat(159)}`, loai: "bieu-mau", noiDung: "x" },
				"tao",
			),
			"ten 160",
		);
		expect(dai.slug).toBe(`d${"a".repeat(159)}`);
	});

	test("tao-trang: ten «Mới» khong trung route tinh, get bang slug tra ve duoc", async () => {
		await donTaiLieu({ slug: { in: SLUG_TAO } });
		const { slug } = ok<{ slug: string }>(
			await goi(
				"taiLieu.create",
				{ ten: "Mới", loai: "quy-dinh", noiDung: "Nội dung." },
				"tao",
			),
			"Mới",
		);
		if (slug === "moi") throw new Error("slug trung route: moi");
		expect(slug).toBe("moi-2");
		const g = ok<{ slug: string }>(
			await hoi("taiLieu.get", { slug }, "tao"),
			"get moi-2",
		);
		expect(g.slug).toBe("moi-2");
	});

	test("tao-trang: noi dung NFD luu thanh NFC, trang moi chua co ban dang dung va dung mot de xuat cho", async () => {
		const nfc = "## Hoà giải\n\nĐối tác được hoàn phí trong 48 giờ.";
		const nfd = nfc.normalize("NFD");
		expect(Buffer.from(nfd).equals(Buffer.from(nfc))).toBe(false);
		const { trangId } = await taoTrang("Hoà giải NFD", nfd);
		const trang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
			select: {
				banDangDungId: true,
				deXuat: { select: { trangThai: true, banGocId: true, noiDung: true } },
				suKien: { select: { loai: true } },
			},
		});
		expect(trang.banDangDungId).toBe(null);
		expect(trang.deXuat).toHaveLength(1);
		const [dx] = trang.deXuat;
		expect(dx?.trangThai).toBe("CHO_DUYET");
		expect(dx?.banGocId).toBe(null);
		expect(
			Buffer.from(dx?.noiDung ?? "").equals(Buffer.from(nfc)),
			"noi dung khong NFC",
		).toBe(true);
		expect(trang.suKien.map((s) => s.loai)).toEqual(["TAO"]);
	});

	test("tao-trang: chu trang phai la thanh vien, don vi phai ton tai", async () => {
		const truoc = await demTaiLieu();
		const chu = await goi(
			"taiLieu.create",
			{ ten: "Chủ lạ", loai: "quy-dinh", chuTrangId: "khong-co", noiDung: "x" },
			"tao",
		);
		expect(`${chu.status} ${chu.loi}`).toBe(`400 ${T.chuTrangKhongCo}`);
		const donVi = await goi(
			"taiLieu.create",
			{
				ten: "Đơn vị lạ",
				loai: "quy-dinh",
				departmentId: "khong-co",
				noiDung: "x",
			},
			"tao",
		);
		expect(`${donVi.status} ${donVi.loi}`).toBe(`400 ${T.donViKhongCo}`);
		expect(await demTaiLieu()).toEqual(truoc);
	});
});

describe("sua-trang", () => {
	test("sua-trang: de xuat sua co ban goc la ban dang dung; ban dang dung khong doi; chi nguoi thay de xuat thay co ban cho", async () => {
		const { slug, trangId, deXuatId } = await taoTrang(
			"Sửa trang thử",
			"Bản một.\n",
		);
		await duyet(deXuatId, "chu");
		const banMot = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
			select: { banDangDungId: true },
		});
		const moi = await deXuat(slug, "Bản hai.\n", "khac");
		const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: moi } });
		expect(dx.banGocId).toBe(banMot.banDangDungId);
		expect(dx.trangThai).toBe("CHO_DUYET");
		const sau = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
			select: { banDangDungId: true },
		});
		expect(sau.banDangDungId).toBe(banMot.banDangDungId);
		const MONG = [
			["okr", false],
			["tao", false],
			["khac", true],
			["chu", true],
			["admin", true],
		] as const;
		for (const [ai, coBanCho] of MONG) {
			const g = ok<Get>(await hoi("taiLieu.get", { slug }, ai), `get ${ai}`);
			expect(`${ai}: ${g.noiDung} ${g.phienBan?.so}`).toBe(`${ai}: Bản một. 1`);
			expect(`${ai} coBanCho=${g.coBanCho}`, "lo co ban cho").toBe(
				`${ai} coBanCho=${coBanCho}`,
			);
		}
	});

	test("sua-trang: trang khong ton tai va trang chua duyet cua nguoi khac tra cung mot NOT_FOUND", async () => {
		const khongCo = await goi(
			"taiLieu.propose",
			{ slug: "khong-co-trang-nay", noiDung: "x" },
			"khac",
		);
		const { slug } = await taoTrang("Trang chưa duyệt để đề xuất", "a\n");
		const chuaDuyet = await goi(
			"taiLieu.propose",
			{ slug, noiDung: "b" },
			"khac",
		);
		expect(khongCo.status).toBe(404);
		expect({ status: chuaDuyet.status, loi: chuaDuyet.loi }).toEqual({
			status: khongCo.status,
			loi: khongCo.loi,
		});
		expect(khongCo.loi).toBe(T.khongCo);
	});
});

describe("de-xuat-trung", () => {
	test("de-xuat-trung: noi dung trung ban goc sau chuan hoa bi tu choi, khac mot ky tu thi tao duoc", async () => {
		const goc = "## Mục\n\n- một\n- hai\n\nĐối tác hoà giải.\n";
		const { slug, trangId, deXuatId } = await taoTrang("Trùng bản gốc", goc);
		await duyet(deXuatId, "chu");
		const demDeXuat = () => db.taiLieuDeXuat.count({ where: { trangId } });
		const truoc = await demDeXuat();
		const trung = goc.normalize("NFD").replace(/^- /gm, "* ");
		expect(trung).not.toBe(goc);
		const tra = await goi("taiLieu.propose", { slug, noiDung: trung }, "khac");
		expect(`${tra.status} ${tra.loi}`, "de xuat trung ban goc duoc tao").toBe(
			`400 ${T.chuaDoi}`,
		);
		expect(await demDeXuat()).toBe(truoc);
		const khac = await goi(
			"taiLieu.propose",
			{ slug, noiDung: goc.replace("hai", "haj") },
			"khac",
		);
		ok(khac, "khac mot ky tu");
		expect(await demDeXuat()).toBe(truoc + 1);
		const doiTen = await goi(
			"taiLieu.propose",
			{ slug, ten: "Trùng bản gốc, tên mới", noiDung: goc },
			"khac",
		);
		ok(doiTen, "chi doi ten");
	});
});

async function soPhienBan(trangId: string): Promise<number> {
	return db.taiLieuPhienBan.count({ where: { trangId } });
}

async function trangDangDung(ten: string, noiDung: string) {
	const t = await taoTrang(ten, noiDung);
	await duyet(t.deXuatId, "chu");
	return t;
}

const THU_TUC_GHI = [
	"approve",
	"create",
	"datXacMinh",
	"propose",
	"reject",
	"xuLyBaoSai",
	"xuLyChuaTraLoi",
];

function thuTucTaiLieu(): { ten: string; loai: string }[] {
	const nguon = readFileSync(
		join(import.meta.dir, "..", "src", "generated", "server.ts"),
		"utf8",
	);
	const dau = nguon.indexOf("taiLieu: t.router({");
	expect(dau).toBeGreaterThan(-1);
	const khoi = nguon.slice(dau, nguon.indexOf("}),", dau));
	return [
		...khoi.matchAll(/(\w+): publicProcedure[\s\S]*?\.(query|mutation)\(/g),
	].map((m) => ({ ten: m[1] ?? "", loai: m[2] ?? "" }));
}

describe("duyet-tao-phien-ban", () => {
	test("duyet-tao-phien-ban: duyet tao phien ban bat bien, dat con tro, ghi su kien; lan hai so 2", async () => {
		const { slug, trangId, deXuatId } = await taoTrang(
			"Duyệt tạo phiên bản",
			"## Một\n\nBản đầu.",
		);
		const dx1 = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
		});
		expect(await duyet(deXuatId, "chu")).toBe(1);
		const v1 = await db.taiLieuPhienBan.findUniqueOrThrow({
			where: { trangId_so: { trangId, so: 1 } },
		});
		expect(Buffer.from(v1.noiDung).equals(Buffer.from(dx1.noiDung))).toBe(true);
		expect(v1.deXuatId).toBe(deXuatId);
		expect(v1.duyetBoiId).toBe(phien.chu.nguoi);
		const trang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
		});
		expect(trang.banDangDungId).toBe(v1.id);
		const sauDuyet = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
		});
		expect(sauDuyet.trangThai).toBe("DA_DUYET");
		const suKien = await db.taiLieuSuKien.findMany({
			where: { trangId, loai: "DUYET" },
		});
		expect(suKien).toHaveLength(1);
		expect(parseSuKienChiTiet(suKien[0]?.chiTiet)).toMatchObject({
			loai: "DUYET",
			deXuatId,
			phienBan: 1,
		});

		const hai = await deXuat(slug, "## Một\n\nBản hai.", "khac");
		expect(await duyet(hai, "chu")).toBe(2);
		const v1Sau = await db.taiLieuPhienBan.findUniqueOrThrow({
			where: { id: v1.id },
		});
		expect(Buffer.from(v1Sau.noiDung).equals(Buffer.from(v1.noiDung))).toBe(
			true,
		);
		expect(v1Sau.ten).toBe(v1.ten);
		for (const ai of ["khac", "okr"] as const) {
			const g = ok<Get>(await hoi("taiLieu.get", { slug }, ai), `get ${ai}`);
			expect(`${ai}: ${g.phienBan?.so} ${g.noiDung}`).toBe(
				`${ai}: 2 ## Một\n\nBản hai.`,
			);
		}
	});

	test("duyet-tao-phien-ban: chi create, propose, approve, reject ghi; khong duong sua hay go phien ban, su kien", () => {
		expect(
			thuTucTaiLieu()
				.filter((t) => t.loai === "mutation")
				.map((t) => t.ten)
				.sort(),
		).toEqual(THU_TUC_GHI);
		const nguon = readFileSync(
			join(import.meta.dir, "..", "src", "tai-lieu", "tai-lieu.service.ts"),
			"utf8",
		);
		expect(
			nguon.match(
				/taiLieu(PhienBan|SuKien)\.(update|updateMany|upsert|delete|deleteMany)\b|(UPDATE|DELETE FROM)\s+"taiLieu(PhienBan|SuKien)"/g,
			) ?? [],
			"duong sua hay go phien ban, su kien",
		).toEqual([]);
	});
});

describe("so-va-dat", () => {
	test("so-va-dat: duyet A lam B cu trong cung lan ghi; approve B tra CONFLICT", async () => {
		const { slug, trangId } = await trangDangDung("So và đặt a", "Gốc a.");
		const a = await deXuat(slug, "Bản A.", "khac");
		const b = await deXuat(slug, "Bản B.", "okr");
		const hashB = await hashCua(b, "chu");
		await duyet(a, "chu");
		const bSau = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: b } });
		expect(bSau.trangThai).toBe("CU");
		const truoc = await soPhienBan(trangId);
		const tra = await goi("taiLieu.approve", { id: b, diffHash: hashB }, "chu");
		expect(`${tra.status} ${tra.loi}`, "de xuat cu van duyet duoc").toBe(
			`409 ${T.cu}`,
		);
		expect(await soPhienBan(trangId)).toBe(truoc);
		const p = ok<DeXuatDoc>(
			await hoi("taiLieu.proposal", { id: b }, "okr"),
			"proposal b",
		);
		expect(p.cu).toBe(true);
	});

	test("so-va-dat: diffHash sai mot ky tu tra CONFLICT va khong ghi gi", async () => {
		const { slug, trangId } = await trangDangDung("So và đặt b", "Gốc b.");
		const c = await deXuat(slug, "Bản C.", "khac");
		const dung = await hashCua(c, "chu");
		const sai = `${dung.slice(0, -1)}${dung.endsWith("0") ? "1" : "0"}`;
		const truoc = await demTaiLieu();
		const tra = await goi("taiLieu.approve", { id: c, diffHash: sai }, "chu");
		expect(`${tra.status} ${tra.loi}`).toBe(`409 ${T.daDoi}`);
		expect(await demTaiLieu()).toEqual(truoc);
		const cSau = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: c } });
		expect(cSau.trangThai).toBe("CHO_DUYET");
		expect(await soPhienBan(trangId)).toBe(1);
	});

	test("so-va-dat: de xuat co ban goc khac ban dang dung bi coi la cu, approve danh dau CU", async () => {
		const { slug, trangId } = await trangDangDung("So và đặt c", "Gốc c.");
		const d = await deXuat(slug, "Bản D.", "khac");
		const hashD = await hashCua(d, "chu");
		const e = await deXuat(slug, "Bản E.", "okr");
		await duyet(e, "chu");
		await db.taiLieuDeXuat.update({
			where: { id: d },
			data: { trangThai: "CHO_DUYET", xuLyLuc: null },
		});
		const p = ok<DeXuatDoc>(
			await hoi("taiLieu.proposal", { id: d }, "chu"),
			"proposal d",
		);
		expect(p.trangThai).toBe("CHO_DUYET");
		expect(p.cu).toBe(true);
		const truoc = await soPhienBan(trangId);
		const tra = await goi("taiLieu.approve", { id: d, diffHash: hashD }, "chu");
		expect(`${tra.status} ${tra.loi}`, "de xuat cu van duyet duoc").toBe(
			`409 ${T.cu}`,
		);
		expect(await soPhienBan(trangId)).toBe(truoc);
		const dSau = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: d } });
		expect(dSau.trangThai).toBe("CU");
		const cu = await db.taiLieuSuKien.findMany({
			where: { trangId, loai: "CU" },
		});
		expect(
			cu.map((c) => {
				const chiTiet = parseSuKienChiTiet(c.chiTiet);
				return "deXuatId" in chiTiet ? chiTiet.deXuatId : null;
			}),
		).toContain(d);
	});

	test("so-va-dat: doi chung duong, hash dung va ban goc dung thi duyet duoc", async () => {
		const { slug, trangId } = await trangDangDung("So và đặt d", "Gốc d.");
		const f = await deXuat(slug, "Bản F.", "khac");
		expect(await duyet(f, "chu")).toBe(2);
		expect(await soPhienBan(trangId)).toBe(2);
	});
});

describe("tra-lai", () => {
	test("tra-lai: ly do rong va 501 ky tu bi tu choi; 500 ky tu tra lai duoc, nguoi tao doc duoc ly do", async () => {
		const { slug, trangId } = await trangDangDung("Trả lại thử", "Gốc.");
		const g = await deXuat(slug, "Bản G.", "khac");
		const truocTrang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
		});
		for (const lyDo of ["", "   ", "x".repeat(501)]) {
			const tra = await goi("taiLieu.reject", { id: g, lyDo }, "chu");
			expect(
				`${lyDo.length}: ${tra.status}`,
				"tra lai khong ly do duoc chap nhan",
			).toBe(`${lyDo.length}: 400`);
			const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: g } });
			expect(dx.trangThai).toBe("CHO_DUYET");
		}
		const lyDo = `Thiếu ${"x".repeat(494)}`;
		expect(lyDo.length).toBe(500);
		ok(await goi("taiLieu.reject", { id: g, lyDo }, "chu"), "tra lai 500");
		const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: g } });
		expect(dx.trangThai).toBe("TRA_LAI");
		expect(dx.lyDo).toBe(lyDo);
		const p = ok<DeXuatDoc>(
			await hoi("taiLieu.proposal", { id: g }, "khac"),
			"nguoi tao doc",
		);
		expect(p.lyDo).toBe(lyDo);
		const sauTrang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
		});
		expect(sauTrang.banDangDungId).toBe(truocTrang.banDangDungId);
		expect(await soPhienBan(trangId)).toBe(1);
		const lai = await goi(
			"taiLieu.approve",
			{ id: g, diffHash: "0".repeat(64) },
			"chu",
		);
		expect(`${lai.status} ${lai.loi}`).toBe(`409 ${T.daXuLy}`);
	});
});

describe("lien-ket-tim", () => {
	test("lien-ket-tim: lien ket thay tron luc duyet, cot tim bo dau, de xuat cho hay bi tra lai khong de lai gi", async () => {
		const dich1 = await trangDangDung("Liên kết đích một", "Đích một.");
		const dich2 = await trangDangDung("Liên kết đích hai", "Đích hai.");
		const noiDung = `Quy định hoa hồng: xem [đích một](/tai-lieu/${dich1.slug}) và [đích hai](/tai-lieu/${dich2.slug}), thêm [ngoài](https://vi.wikipedia.org/wiki/Hoa).`;
		const { slug, trangId, deXuatId } = await taoTrang(
			"Liên kết nguồn",
			noiDung,
		);
		const lienKet = () =>
			db.taiLieuLienKet.findMany({
				where: { tuTrangId: trangId },
				orderBy: { denSlug: "asc" },
				select: { denSlug: true, vanBan: true },
			});
		expect(await lienKet(), "lien ket tu de xuat chua duyet").toEqual([]);
		await duyet(deXuatId, "chu");
		expect(await lienKet()).toEqual(
			[
				{ denSlug: dich1.slug, vanBan: "đích một" },
				{ denSlug: dich2.slug, vanBan: "đích hai" },
			].sort((a, b) => a.denSlug.localeCompare(b.denSlug)),
		);
		const tim = await db.$queryRaw<{ id: string }[]>`
			SELECT id FROM "taiLieuTrang"
			WHERE "timKiem" @@ plainto_tsquery('simple', unaccent('hoa hong'))
		`;
		expect(tim.map((t) => t.id)).toContain(trangId);
		const conMot = `Chỉ còn [đích hai](/tai-lieu/${dich2.slug}).`;
		const biTraLai = await deXuat(
			slug,
			`${conMot} Và [lạ](/tai-lieu/trang-la-moi) nữa.`,
			"khac",
		);
		await traLai(biTraLai, "chu");
		const cho = await deXuat(slug, `${conMot} Đang chờ.`, "okr");
		expect(
			(await lienKet()).map((l) => l.denSlug),
			"lien ket tu de xuat chua duyet",
		).toEqual([dich1.slug, dich2.slug].sort());
		const timCho = await db.$queryRaw<{ id: string }[]>`
			SELECT id FROM "taiLieuTrang"
			WHERE id = ${trangId} AND "timKiem" @@ plainto_tsquery('simple', unaccent('dang cho'))
		`;
		expect(timCho, "tu tim kiem tu de xuat chua duyet").toEqual([]);
		await duyet(cho, "chu");
		expect(await lienKet()).toEqual([
			{ denSlug: dich2.slug, vanBan: "đích hai" },
		]);
		const timSau = await db.$queryRaw<{ id: string }[]>`
			SELECT id FROM "taiLieuTrang"
			WHERE id = ${trangId} AND "timKiem" @@ plainto_tsquery('simple', unaccent('dang cho'))
		`;
		expect(timSau).toHaveLength(1);
	});
});

const TRUOC_DIFF = `## Thời hạn chi trả

Hoa hồng được chi trả trong vòng 48 giờ kể từ khi ký.

Đối tác gửi chứng từ đầy đủ cho vận hành.

Mọi thắc mắc gửi về bộ phận vận hành.
`;

const SAU_DIFF = `## Thời hạn chi trả

Hoa hồng được chi trả trong vòng 24 giờ kể từ khi ký.

Mọi thắc mắc gửi về bộ phận vận hành.

Bản này áp dụng cho mọi đối tác.
`;

describe("diff-hash", () => {
	test("diff-hash: diffHash client tren cung hai ban === diffHash may chu tra qua proposal", async () => {
		const { slug } = await trangDangDung("Diff hash thử", TRUOC_DIFF);
		const id = await deXuat(slug, SAU_DIFF, "khac");
		const p = ok<DeXuatDoc>(
			await hoi("taiLieu.proposal", { id }, "chu"),
			"proposal",
		);
		const client = await diffHash(soSanh(TRUOC_DIFF, SAU_DIFF));
		expect(p.diffHash).toBe(client);
		expect(await diffHash(soSanh(p.banGoc, p.noiDung))).toBe(client);
		ok(
			await goi("taiLieu.approve", { id, diffHash: client }, "chu"),
			"duyet bang hash client",
		);
	});
});

describe("de-xuat-ngay", () => {
	test("de-xuat-ngay: proposal tra taoLuc la luc tao ban de xuat", async () => {
		const { deXuatId } = await taoTrang("Ngày gửi thử", "Nội dung.");
		const p = ok<{ taoLuc: string }>(
			await hoi("taiLieu.proposal", { id: deXuatId }, "chu"),
			"proposal",
		);
		const { createdAt } = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
			select: { createdAt: true },
		});
		expect(p.taoLuc, "proposal thieu ngay gui").toBe(createdAt.toISOString());
	});
});

describe("duyet-dong-thoi", () => {
	test("duyet-dong-thoi: hai nguoi duyet hai de xuat cung ban goc cung luc, dung mot thanh phien ban", async () => {
		for (let vong = 0; vong < 5; vong += 1) {
			const { slug, trangId } = await trangDangDung(
				`Duyệt đồng thời ${vong}`,
				"Gốc.",
			);
			const a = await deXuat(slug, `Bản A ${vong}.`, "khac");
			const b = await deXuat(slug, `Bản B ${vong}.`, "okr");
			const [hashA, hashB] = await Promise.all([
				hashCua(a, "chu"),
				hashCua(b, "admin"),
			]);
			const ket = await Promise.all([
				goi("taiLieu.approve", { id: a, diffHash: hashA }, "chu"),
				goi("taiLieu.approve", { id: b, diffHash: hashB }, "admin"),
			]);
			expect(ket.map((k) => k.status).sort(), JSON.stringify(ket)).toEqual([
				200, 409,
			]);
			const ban = await db.taiLieuPhienBan.findMany({
				where: { trangId },
				select: { so: true },
			});
			expect(ban.map((v) => v.so).sort()).toEqual([1, 2]);
			const trangThai = await db.taiLieuDeXuat.findMany({
				where: { id: { in: [a, b] } },
				select: { trangThai: true },
			});
			expect(trangThai.map((t) => t.trangThai).sort()).toEqual([
				"CU",
				"DA_DUYET",
			]);
		}
	});

	test("duyet-dong-thoi: trang chua tung duyet, hai ban dau duyet cung luc", async () => {
		const { slug, trangId, deXuatId } = await taoTrang(
			"Đồng thời lần đầu",
			"Bản một.",
		);
		const hai = await deXuat(slug, "Bản hai.", "chu");
		const [h1, h2] = await Promise.all([
			hashCua(deXuatId, "chu"),
			hashCua(hai, "owner"),
		]);
		const ket = await Promise.all([
			goi("taiLieu.approve", { id: deXuatId, diffHash: h1 }, "chu"),
			goi("taiLieu.approve", { id: hai, diffHash: h2 }, "owner"),
		]);
		expect(ket.map((k) => k.status).sort(), JSON.stringify(ket)).toEqual([
			200, 409,
		]);
		expect(await soPhienBan(trangId)).toBe(1);
	});
});

describe("chu-trang-roi-di", () => {
	test("chu-trang-roi-di: chu trang roi workspace, trang van doc duoc, quan tri van duyet, nguoi do khong duyet duoc", async () => {
		const chuDi = ma("chu-di");
		await gieoThanhVien(chuDi, "member");
		const cookieChuDi = (await mintPhien(chuDi)).cookie;
		const tao = ok<{ slug: string }>(
			await goi(
				"taiLieu.create",
				{
					ten: "Trang chủ rời đi",
					loai: "quy-trinh",
					chuTrangId: chuDi,
					noiDung: "Bản một.",
				},
				"tao",
			),
			"tao",
		);
		const dau = await db.taiLieuDeXuat.findFirstOrThrow({
			where: { trang: { slug: tao.slug } },
		});
		ok(
			await goiBang(cookieChuDi, "taiLieu.approve", {
				id: dau.id,
				diffHash: await diffHash(soSanh("", dau.noiDung)),
			}),
			"chu trang duyet khi con o",
		);
		const moi = await deXuat(tao.slug, "Bản hai.", "khac");
		await db.member.deleteMany({ where: { userId: chuDi } });
		for (const ai of ["khac", "okr", "admin"] as const) {
			const g = ok<Get>(
				await hoi("taiLieu.get", { slug: tao.slug }, ai),
				`get ${ai}`,
			);
			expect(`${ai}: ${g.noiDung}`).toBe(`${ai}: Bản một.`);
		}
		const hash = await hashCua(moi, "admin");
		const chuThu = await goiBang(cookieChuDi, "taiLieu.approve", {
			id: moi,
			diffHash: hash,
		});
		expect(chuThu.status).toBe(403);
		const conCho = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: moi },
		});
		expect(conCho.trangThai).toBe("CHO_DUYET");
		ok(
			await goi("taiLieu.approve", { id: moi, diffHash: hash }, "admin"),
			"quan tri duyet thay",
		);
		const g = ok<Get>(
			await hoi("taiLieu.get", { slug: tao.slug }, "khac"),
			"get sau",
		);
		expect(`${g.phienBan?.so} ${g.noiDung}`).toBe("2 Bản hai.");
	});
});

describe("de-xuat-phan-trang", () => {
	type HangDx = { id: string; trangThai: string };
	type Trang = { rows: HangDx[]; total: number; choToiDuyet: number };
	const choId: string[] = [];
	const xuLyId: string[] = [];

	async function trangDeXuat(nhom: "cho" | "da-xu-ly", page: number) {
		return ok<Trang>(
			await hoi("taiLieu.proposals", { nhom, page }, "chu"),
			`proposals ${nhom} ${page}`,
		);
	}

	beforeAll(async () => {
		await donTaiLieu({});
		const cho = await taoTrang("Phân trang chờ", "Gốc chờ.\n");
		await duyet(cho.deXuatId, "chu");
		for (let i = 0; i < 30; i += 1) {
			choId.push(await deXuat(cho.slug, `Bản chờ số ${i}.\n`));
		}
		const tra = await taoTrang("Phân trang trả lại", "Gốc trả lại.\n");
		await duyet(tra.deXuatId, "chu");
		for (let i = 0; i < 6; i += 1) {
			const id = await deXuat(tra.slug, `Bản trả lại số ${i}.\n`);
			await traLai(id, "chu");
			xuLyId.push(id);
		}
		const cu = await taoTrang("Phân trang cũ", "Gốc cũ.\n");
		await duyet(cu.deXuatId, "chu");
		const cungGoc: string[] = [];
		for (let i = 0; i < 5; i += 1) {
			cungGoc.push(await deXuat(cu.slug, `Bản cùng gốc số ${i}.\n`));
		}
		await duyet(cungGoc[0] as string, "chu");
		xuLyId.push(...cungGoc.slice(1));
	});

	test("de-xuat-phan-trang: 30 ban cho chia 25 va 5, ban cu nhat mo duoc", async () => {
		const mot = await trangDeXuat("cho", 1);
		const hai = await trangDeXuat("cho", 2);
		if (mot.rows.length > 0 && hai.rows[0]?.id === mot.rows[0]?.id) {
			throw new Error("phan-trang: trang 2 lap lai trang 1");
		}
		expect(mot.rows.length).toBe(25);
		expect(hai.rows.length).toBe(5);
		expect(mot.total).toBe(30);
		expect(mot.choToiDuyet).toBe(30);
		const tatCa = [...mot.rows, ...hai.rows];
		if (tatCa.some((r) => r.trangThai !== "CHO_DUYET")) {
			throw new Error("phan-trang: nhom cho co ban CU");
		}
		expect(tatCa.map((r) => r.id).sort()).toEqual([...choId].sort());
		const cuNhat = choId[0] as string;
		expect(hai.rows.map((r) => r.id)).toContain(cuNhat);
		ok(await hoi("taiLieu.proposal", { id: cuNhat }, "chu"), "mo ban cu nhat");
	});

	test("de-xuat-phan-trang: nhom da xu ly co dung 6 ban tra lai va 4 ban cu", async () => {
		const xuLy = await trangDeXuat("da-xu-ly", 1);
		expect(xuLy.total).toBe(10);
		expect(xuLy.rows.map((r) => r.id).sort()).toEqual([...xuLyId].sort());
		expect(xuLy.rows.map((r) => r.trangThai).sort()).toEqual([
			...Array(4).fill("CU"),
			...Array(6).fill("TRA_LAI"),
		]);
	});

	test("de-xuat-phan-trang: loc theo slug chi tra ban cua trang do", async () => {
		const cho = ok<Trang>(
			await hoi("taiLieu.proposals", { nhom: "cho", page: 1 }, "chu"),
			"cho",
		);
		const slugCua = await db.taiLieuDeXuat.findFirstOrThrow({
			where: { id: choId[0] },
			select: { trang: { select: { slug: true } } },
		});
		const motTrang = ok<Trang>(
			await hoi(
				"taiLieu.proposals",
				{ nhom: "cho", page: 2, slug: slugCua.trang.slug },
				"chu",
			),
			"theo slug",
		);
		expect(cho.total).toBe(30);
		expect(motTrang.total).toBe(30);
		const trangKhac = ok<Trang>(
			await hoi(
				"taiLieu.proposals",
				{ nhom: "cho", page: 1, slug: "khong-co-trang-nay" },
				"chu",
			),
			"slug khong co",
		);
		expect(trangKhac.total).toBe(0);
	});
});
