import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { ghiKetQuaHoi } from "@crm/db/tai-lieu-hoi";
import {
	dungTraLoiZalo,
	dungTuChoi,
	parseGanNhat,
	parseTraLoi,
	TAI_LIEU_HOI,
} from "@crm/validation/tai-lieu-hoi";
import { AgentTriggerService } from "../../api/src/agent/agent-trigger.service";
import { TaiLieuHoiService } from "../../api/src/tai-lieu/tai-lieu-hoi.service";
import { TaiLieuTimService } from "../../api/src/tai-lieu/tai-lieu-tim.service";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import { ngayVnTuIso } from "../agent/lib/tai-lieu-hoi-zalo";
import nopTraLoi from "../agent/subagents/tro_ly_kho/tools/nop_tra_loi";
import searchPages from "../agent/subagents/tro_ly_kho/tools/search_pages";
import {
	ctxConCua,
	deXuatMoi,
	donTroLyKho,
	duyetDeXuat,
	gieoNguoi,
	goiCongCu,
	ma,
	moHoiCrm,
	type Nguoi,
	taiLieu,
	trangDaDuyet,
	type VaoCongCu,
} from "./support/tro-ly-kho-gia";

const BANG = "| Tầng 2 | 2 – 10 tỷ | 1,2% |";
const NOI_DUNG = [
	"## Mức hoa hồng theo tầng",
	"",
	"| Tầng | Giá trị | Hoa hồng |",
	"| --- | --- | --- |",
	BANG,
	"",
	"Chi vào ngày 15 của tháng kế tiếp.",
].join("\n");

let quanTri: Nguoi;
let hoaHong: { slug: string; trangId: string };

beforeAll(async () => {
	quanTri = await gieoNguoi("owner");
	hoaHong = await trangDaDuyet(
		quanTri,
		`Chính sách hoa hồng ${ma("hh")}`,
		NOI_DUNG,
	);
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donTroLyKho();
});

async function phienBanCua(slug: string): Promise<number> {
	const t = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: { banDangDung: { select: { so: true } } },
	});
	return t.banDangDung?.so ?? -1;
}

function ban(chu: string, doan: string, slug: string, phienBan: number) {
	return { loai: "tra-loi", cau: [{ chu, trich: [{ slug, phienBan, doan }] }] };
}

describe("tlk-kiem", () => {
	test("tlk-kiem: tang hai — a nhan, b bac, d bac tren ban de xuat that, j bac khi ban moi duoc duyet", async () => {
		const so = await phienBanCua(hoaHong.slug);
		const a = await moHoiCrm(quanTri);
		const ra = await goiCongCu(
			nopTraLoi,
			ban("Tầng 2 hưởng 1,2%.", BANG, hoaHong.slug, so),
			a.ctx,
		);
		expect(ra.ok, "tlk-kiem: ca a bi bac").toBe(true);
		const hangA = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: a.hoiId },
		});
		expect(hangA.trangThai).toBe("TRA_LOI");
		expect(parseTraLoi(hangA.traLoi).cau[0]?.trich[0]?.doan).toBe(BANG);

		const b = await moHoiCrm(quanTri);
		const rb = await goiCongCu(
			nopTraLoi,
			ban(
				"Tầng 2 hưởng 1,5%.",
				"| Tầng 2 | 2 – 10 tỷ | 1,5% |",
				hoaHong.slug,
				so,
			),
			b.ctx,
		);
		expect(rb.ok).toBe(false);
		if (!rb.ok) expect(rb.loi).toContain("1,5%");
		expect(
			(await db.taiLieuHoi.findUniqueOrThrow({ where: { id: b.hoiId } }))
				.trangThai,
		).toBe("DANG_HOI");

		const doanCho = "Tầng đặc biệt hưởng 2,5% từ quý sau.";
		await deXuatMoi(quanTri, hoaHong.slug, `${NOI_DUNG}\n\n${doanCho}`);
		const d = await moHoiCrm(quanTri);
		const rd = await goiCongCu(
			nopTraLoi,
			ban("Tầng đặc biệt hưởng 2,5%.", doanCho, hoaHong.slug, so),
			d.ctx,
		);
		expect(rd.ok, "tlk-kiem: ca d duoc nhan").toBe(false);
		if (!rd.ok) expect(rd.loi).toContain("trich-khong-co");
		expect(
			(await db.taiLieuHoi.findUniqueOrThrow({ where: { id: d.hoiId } }))
				.trangThai,
		).toBe("DANG_HOI");

		const j = await moHoiCrm(quanTri);
		const moi = await deXuatMoi(
			quanTri,
			hoaHong.slug,
			`${NOI_DUNG}\n\nThêm một dòng mới.`,
		);
		await duyetDeXuat(quanTri, moi);
		const rj = await goiCongCu(
			nopTraLoi,
			ban("Tầng 2 hưởng 1,2%.", BANG, hoaHong.slug, so),
			j.ctx,
		);
		expect(rj.ok).toBe(false);
		if (!rj.ok) expect(rj.loi).toContain("phien-ban-cu");
		expect(
			(await db.taiLieuHoi.findUniqueOrThrow({ where: { id: j.hoiId } }))
				.trangThai,
		).toBe("DANG_HOI");
	});

	test("tlk-kiem: nop sau khi hang da dong thi nem, hang giu LOI", async () => {
		const so = await phienBanCua(hoaHong.slug);
		const h = await moHoiCrm(quanTri);
		await ghiKetQuaHoi(
			db,
			h.hoiId,
			{ trangThai: "LOI", lyDo: "qua-han" },
			new Date(),
		);
		const r = await goiCongCu(
			nopTraLoi,
			ban("Tầng 2 hưởng 1,2%.", BANG, hoaHong.slug, so),
			h.ctx,
		);
		expect(r.ok).toBe(false);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: h.hoiId },
		});
		expect(hang.trangThai).toBe("LOI");
	});

	test("tlk-kiem: hai hang cung phien goc, nop vao hang dang hoi moi nhat, hang cu giu nguyen", async () => {
		const so = await phienBanCua(hoaHong.slug);
		const phienGoc = ma("ses-zalo-goc");
		const cu = await db.taiLieuHoi.create({
			data: {
				nguoiHoiId: quanTri.id,
				kenh: "ZALO",
				phienId: phienGoc,
				trangThai: "TRA_LOI",
				traLoi: parseTraLoi({
					cau: [
						{
							chu: "Cũ.",
							trich: [
								{
									slug: hoaHong.slug,
									ten: "x",
									phienBan: so,
									duyetLuc: new Date().toISOString(),
									doan: BANG,
								},
							],
						},
					],
					quaHan: [],
				}),
				hoiLuc: new Date(Date.now() - 60_000),
			},
		});
		const moi = await db.taiLieuHoi.create({
			data: { nguoiHoiId: quanTri.id, kenh: "ZALO", phienId: phienGoc },
		});
		const r = await goiCongCu(
			nopTraLoi,
			ban("Tầng 2 hưởng 1,2%.", BANG, hoaHong.slug, so),
			ctxConCua(phienGoc),
		);
		expect(r.ok).toBe(true);
		const [hCu, hMoi] = await Promise.all([
			db.taiLieuHoi.findUniqueOrThrow({ where: { id: cu.id } }),
			db.taiLieuHoi.findUniqueOrThrow({ where: { id: moi.id } }),
		]);
		expect(hCu.traLoi).toEqual(cu.traLoi);
		expect(hMoi.trangThai).toBe("TRA_LOI");
	});
});

describe("tlk-kiem-chu-thuong", () => {
	test("tlk-kiem-chu-thuong: cau rong bi bac, hang van dang hoi va doc lai duoc", async () => {
		const { hoiId, ctx } = await moHoiCrm(quanTri);
		const nop = await goiCongCu(
			nopTraLoi,
			{
				loai: "tra-loi",
				cau: [
					{
						chu: "   ",
						trich: [{ slug: hoaHong.slug, phienBan: 1, doan: BANG }],
					},
				],
			},
			ctx,
		);
		expect(nop.ok, "tlk-kiem-chu-thuong: cau rong duoc nhan").toBe(false);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: hoiId },
		});
		expect(hang.trangThai).toBe("DANG_HOI");
	});

	test("tlk-kiem-chu-thuong: trang co ky hieu, doan luu va doc lai la chu thuong", async () => {
		const kyHieu = await trangDaDuyet(
			quanTri,
			`Phí dịch vụ ${ma("kh")}`,
			"## Mức\n\nDoanh số > 100 triệu & phí A_B được **miễn**.",
		);
		const { hoiId, ctx } = await moHoiCrm(quanTri);
		const nop = await goiCongCu(
			nopTraLoi,
			{
				loai: "tra-loi",
				cau: [
					{
						chu: "Doanh số trên 100 triệu được miễn phí.",
						trich: [
							{
								slug: kyHieu.slug,
								phienBan: 1,
								doan: "Doanh số > 100 triệu & phí A_B được miễn.",
							},
						],
					},
				],
			},
			ctx,
		);
		if (!nop.ok) throw new Error(`tlk-kiem-chu-thuong: bac ${nop.loi}`);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: hoiId },
		});
		expect(hang.trangThai).toBe("TRA_LOI");
		expect(parseTraLoi(hang.traLoi).cau[0]?.trich[0]?.doan).toBe(
			"Doanh số > 100 triệu & phí A_B được miễn.",
		);
	});
});

describe("tlk-tu-choi", () => {
	test("tlk-tu-choi: ba ca, cau dung bang hang, khong chu model, giu chu cau hoi", async () => {
		const MOC = "MODEL-VIET-XYZ";

		const i = await moHoiCrm(quanTri, "Câu không có trang?");
		const ri = await goiCongCu(
			nopTraLoi,
			{ loai: "khong-biet", cauHoi: MOC },
			i.ctx,
		);
		expect(ri.ok).toBe(true);
		const hi = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: i.hoiId },
		});
		expect(hi.trangThai).toBe("TU_CHOI");
		expect(hi.lyDo).toBe("khong-co-trang");
		expect(parseGanNhat(hi.ganNhat ?? [])).toEqual([]);
		expect(hi.cauHoi).toBe("Câu không có trang?");
		expect(dungTuChoi(parseGanNhat(hi.ganNhat ?? []))).toBe(
			TAI_LIEU_HOI.tuChoi,
		);

		const ii = await moHoiCrm(quanTri, "Câu có trang gần?");
		const tim = await goiCongCu<{ rows: { slug: string }[] }>(
			searchPages,
			{ query: "hoa hong" },
			ii.ctx,
		);
		expect(tim.ok).toBe(true);
		await goiCongCu(nopTraLoi, { loai: "khong-biet", cauHoi: MOC }, ii.ctx);
		const hii = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: ii.hoiId },
		});
		expect(hii.trangThai).toBe("TU_CHOI");
		const gan = parseGanNhat(hii.ganNhat ?? []);
		expect(gan.length).toBeGreaterThan(0);
		expect(gan.length).toBeLessThanOrEqual(TAI_LIEU_HOI.ganNhatToiDa);
		expect(gan.map((g) => g.slug)).toContain(hoaHong.slug);
		expect(dungTuChoi(gan).startsWith(TAI_LIEU_HOI.tuChoi)).toBe(true);
		expect(hii.cauHoi, "tlk-tu-choi: mat chu cau hoi").toBe(
			"Câu có trang gần?",
		);

		const so = await phienBanCua(hoaHong.slug);
		const iii = await moHoiCrm(quanTri, "Câu bị bác mãi?");
		let cuoi = "";
		for (let k = 0; k < TAI_LIEU_AGENT.hoi.tranBac; k += 1) {
			const r = await goiCongCu(
				nopTraLoi,
				ban(`${MOC} 9,9%.`, BANG, hoaHong.slug, so),
				iii.ctx,
			);
			if (!r.ok) cuoi = r.loi;
		}
		const hiii = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: iii.hoiId },
		});
		expect(hiii.trangThai).toBe("TU_CHOI");
		expect(hiii.lyDo).toBe("trich-truot");
		expect(cuoi).toContain("dừng");
		expect(hiii.cauHoi).toBe("Câu bị bác mãi?");
		const sau = await goiCongCu(
			nopTraLoi,
			ban("Tầng 2 hưởng 1,2%.", BANG, hoaHong.slug, so),
			iii.ctx,
		);
		expect(sau.ok).toBe(false);

		const api = new TaiLieuHoiService(db, new AgentTriggerService(db));
		const nhan = async (hoiId: string) =>
			JSON.stringify(await api.ketQua(quanTri, hoiId));
		const lot = [];
		for (const [ten, hoiId] of [
			["i", i.hoiId],
			["ii", ii.hoiId],
			["iii", iii.hoiId],
		]) {
			if ((await nhan(hoiId)).includes(MOC)) lot.push(ten);
		}
		expect(lot, "tlk-tu-choi: MODEL-VIET-XYZ lot ra").toEqual([]);

		const doiChung = await moHoiCrm(quanTri, "Đối chứng chữ model?");
		const rdc = await goiCongCu(
			nopTraLoi,
			ban(`${MOC} Tầng 2 hưởng 1,2%.`, BANG, hoaHong.slug, so),
			doiChung.ctx,
		);
		expect(rdc.ok).toBe(true);
		expect(
			(await nhan(doiChung.hoiId)).includes(MOC),
			"tlk-tu-choi: doi chung khong thay chu model",
		).toBe(true);
	});

	test("tlk-tu-choi: cau Zalo bi tu choi luu chu cau hoi tro ly nop", async () => {
		const phienGoc = ma("ses-zalo");
		const hang = await db.taiLieuHoi.create({
			data: { nguoiHoiId: quanTri.id, kenh: "ZALO", phienId: phienGoc },
		});
		await goiCongCu(
			nopTraLoi,
			{ loai: "khong-biet", cauHoi: "Thử việc có hoa hồng không?" },
			ctxConCua(phienGoc),
		);
		const h = await db.taiLieuHoi.findUniqueOrThrow({ where: { id: hang.id } });
		expect(h.trangThai).toBe("TU_CHOI");
		expect(h.cauHoi).toBe("Thử việc có hoa hồng không?");
	});

	test("tlk-tu-choi: cau Zalo dong trich-truot giu chu cau hoi; khuon nop doi cauHoi o ca hai loai", async () => {
		const khuon = nopTraLoi.inputSchema as unknown as {
			safeParse: (v: VaoCongCu) => { success: boolean };
		};
		const cau = [
			{
				chu: "Tầng 9 hưởng 9%.",
				trich: [{ slug: hoaHong.slug, phienBan: 1, doan: BANG }],
			},
		];
		expect(
			khuon.safeParse({ loai: "tra-loi", cau }).success,
			"tlk-tu-choi: tra-loi thieu cauHoi van qua khuon",
		).toBe(false);
		expect(
			khuon.safeParse({ loai: "khong-biet" }).success,
			"tlk-tu-choi: khong-biet thieu cauHoi van qua khuon",
		).toBe(false);
		const phienGoc = ma("ses-zalo");
		const hang = await db.taiLieuHoi.create({
			data: { nguoiHoiId: quanTri.id, kenh: "ZALO", phienId: phienGoc },
		});
		const cauHoi = "Tầng 9 hưởng bao nhiêu phần trăm?";
		for (let k = 0; k < TAI_LIEU_AGENT.hoi.tranBac; k += 1) {
			const vao = { loai: "tra-loi", cauHoi, cau };
			expect(khuon.safeParse(vao).success).toBe(true);
			await goiCongCu(nopTraLoi, vao, ctxConCua(phienGoc));
		}
		const h = await db.taiLieuHoi.findUniqueOrThrow({ where: { id: hang.id } });
		expect(`${h.trangThai} ${h.lyDo}`).toBe("TU_CHOI trich-truot");
		expect(h.cauHoi, "tlk-tu-choi: cau Zalo trich-truot mat chu").toBe(cauHoi);
	});
});

describe("tlk-qua-han", () => {
	test("tlk-qua-han: dung mot canh bao cho trang 14/10 luc 00:30 VN ngay 15/10", async () => {
		setSystemTime(new Date("2026-10-14T17:30:00.000Z"));
		const chu = await gieoNguoi("member");
		const trang = [];
		for (const [i, den] of [
			"2026-10-14",
			"2026-10-15",
			"2026-10-16",
			null,
		].entries()) {
			const t = await trangDaDuyet(
				quanTri,
				`Quá hạn ${i} ${ma("qh")}`,
				`## Q\n\nĐiều khoản số ${i} của trang.`,
				chu,
			);
			await taiLieu().datXacMinh(quanTri, { slug: t.slug, den });
			trang.push({ ...t, i });
		}
		const h = await moHoiCrm(quanTri);
		const cau = await Promise.all(
			trang.map(async (t) => ({
				chu: `Có điều khoản ${t.i}.`,
				trich: [
					{
						slug: t.slug,
						phienBan: await phienBanCua(t.slug),
						doan: `Điều khoản số ${t.i} của trang.`,
					},
				],
			})),
		);
		const r = await goiCongCu(nopTraLoi, { loai: "tra-loi", cau }, h.ctx);
		if (!r.ok) throw new Error(`tlk-qua-han: bi bac ${r.loi}`);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: h.hoiId },
		});
		const quaHan = parseTraLoi(hang.traLoi).quaHan;
		expect(
			quaHan.map((q) => q.slug),
			"tlk-qua-han: thieu canh bao trang 14/10",
		).toEqual([trang[0]?.slug ?? ""]);
		const nguoiChu = await db.user.findUniqueOrThrow({
			where: { id: chu.id },
			select: { name: true },
		});
		expect(quaHan[0]?.chuTrang).toBe(nguoiChu.name);

		const cuaToi = new Set(trang.map((t) => t.slug));
		const sk = await new TaiLieuTimService(
			db,
			new TaiLieuHoiService(db, new AgentTriggerService(db)),
		).sucKhoe(quanTri);
		const tuSucKhoe = sk.quaHan.rows
			.map((r) => r.slug)
			.filter((slug) => cuaToi.has(slug))
			.sort();
		expect(
			`tlk-qua-han: suc khoe ${tuSucKhoe.join(",")}`,
			"tlk-qua-han: canh bao lech danh sach Qua han xac minh",
		).toBe(
			`tlk-qua-han: suc khoe ${quaHan
				.map((q) => q.slug)
				.sort()
				.join(",")}`,
		);
		const tin = dungTraLoiZalo(parseTraLoi(hang.traLoi), ngayVnTuIso);
		expect(
			tin,
			"tlk-qua-han: dong canh bao khong co ngay 14/10/2026",
		).toContain("quá hạn xác minh từ 14/10/2026");
	});
});
