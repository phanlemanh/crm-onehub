import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc";
import { parseNoiDungTomTat } from "@crm/validation/okr-tom-tat";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR_XEM } from "../src/okr/okr-xem.config";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	ok,
	tienDongHo,
} from "./tro-ly-okr-san";
import {
	cauLanh,
	cookieCua,
	donTomTat,
	ghiBan,
	goiCua,
	goiQua,
	HAI_DUONG,
	KY,
	LUC,
	motNguonMoiKr,
	nguoiNgoai,
	PHONG_UNG_VIEN,
	pb,
	phongCoNguon,
	QUAN_TRI,
	SAU,
	TUAN,
	thanhVienCua,
	truongCua,
	viecGieo,
} from "./tro-ly-okr-tom-tat-san";

type Dong = {
	departmentId: string;
	nac: string;
	trangThai: string;
	tomTatId: string | null;
	soCau: number;
	soCauBo: number;
	huuIch: number;
	khongHuuIch: number;
	cau: CauDong[];
	bo: (CauDong & { maBo: string })[];
};
type NguonDong =
	| { id: string; mat: false; ngay: string; krTen: string }
	| { id: string; mat: true };
type CauDong = { vanBan: string; nguon: NguonDong[] };

const NGAY_VN = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Ho_Chi_Minh",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

async function cauTuKho(
	departmentId: string,
): Promise<{ cau: CauDong[]; bo: (CauDong & { maBo: string })[] }> {
	const ban = await db.okrTomTat.findFirst({
		where: {
			cycleId: KY,
			departmentId,
			tuan: new Date(`${TUAN}T00:00:00.000Z`),
		},
	});
	if (!ban) return { cau: [], bo: [] };
	const noiDung = parseNoiDungTomTat(ban.cau);
	const ids = [...noiDung.cau, ...noiDung.bo].flatMap((c) => c.nguon);
	const lan = await db.okrCheckIn.findMany({
		where: { id: { in: ids } },
		include: { session: true, keyResult: true },
	});
	const giai = (id: string): NguonDong => {
		const l = lan.find((x) => x.id === id);
		return l
			? {
					id,
					mat: false,
					ngay: NGAY_VN.format(l.session.submittedAt ?? l.createdAt),
					krTen: l.keyResult.title,
				}
			: { id, mat: true };
	};
	return {
		cau: noiDung.cau.map((c) => ({
			vanBan: c.vanBan,
			nguon: c.nguon.map(giai),
		})),
		bo: noiDung.bo.map((c) => ({
			vanBan: c.vanBan,
			nguon: c.nguon.map(giai),
			maBo: c.maBo,
		})),
	};
}
type BangQuanTri = { tuan: string | null; phong: Dong[] };

let app: NestExpressApplication;
type PhongQuanTri = { b: string; c: string; a: string; k: string; r: string };
type VaiBiChan = {
	"thanh-vien": string;
	"truong-phong": string;
	"vai-okr": string;
};
let phong: PhongQuanTri;
let vai: VaiBiChan;

const hangTuDong = (d: Dong) =>
	`${d.departmentId}: ${d.nac} ${d.trangThai} ${d.tomTatId ?? "-"} cau ${d.soCau} bo ${d.soCauBo} huu-ich ${d.huuIch}/${d.khongHuuIch} bo-ma ${d.bo.map((b) => b.maBo).join(",")}`;

async function dongTuKho(departmentId: string): Promise<string> {
	const ban = await db.okrTomTat.findFirst({
		where: {
			cycleId: KY,
			departmentId,
			tuan: new Date(`${TUAN}T00:00:00.000Z`),
		},
	});
	if (ban) {
		const noiDung = parseNoiDungTomTat(ban.cau);
		const [huuIch, khong] = await Promise.all([
			db.okrTomTatPhanHoi.count({ where: { tomTatId: ban.id, huuIch: true } }),
			db.okrTomTatPhanHoi.count({
				where: { tomTatId: ban.id, huuIch: false },
			}),
		]);
		return `${departmentId}: ${noiDung.nac} ${ban.trangThai} ${ban.id} cau ${noiDung.cau.length} bo ${ban.soCauBo} huu-ich ${huuIch}/${khong} bo-ma ${noiDung.bo.map((b) => b.maBo).join(",")}`;
	}
	const viec = await db.agentTask.findMany({
		where: { kind: "okr-tom-tat-tuan" },
		select: { payload: true, finishedAt: true },
	});
	const cua = viec.find((v) => {
		const p = okrTroLyViec.parse(v.payload);
		return p.viec === "tom-tat-tuan" && p.departmentId === departmentId;
	});
	if (!cua) return `${departmentId}: khong co viec`;
	const p = okrTroLyViec.parse(cua.payload);
	const nac = p.viec === "tom-tat-tuan" ? p.nac : "";
	const trangThai = cua.finishedAt ? "khong-lam-duoc" : "dang-soan";
	return `${departmentId}: ${nac} ${trangThai} - cau 0 bo 0 huu-ich 0/0 bo-ma `;
}

beforeAll(async () => {
	await batDauMau();
	await donTomTat();
	app = await dungUngDung();
	const coNguon = (await phongCoNguon(1)).map((p) => p.ma);
	const [b, c, a] = coNguon;
	const conLai = PHONG_UNG_VIEN.filter((m) => ![b, c, a].includes(m));
	const [k, r] = conLai;
	if (!b || !c || !a || !k || !r)
		throw new Error(`bo mau thieu phong: ${coNguon.length}/${conLai.length}`);
	phong = { b, c, a, k, r };
	const tv = thanhVienCua(b)[0];
	if (!tv) throw new Error(`phong ${b} khong co thanh vien`);
	vai = {
		"thanh-vien": tv,
		"truong-phong": truongCua(b),
		"vai-okr": nguoiNgoai(Object.values(phong), "okr"),
	};
	datDongHo(new Date(LUC.getTime() - 10 * MINUTE_MS));
	await ghiCauHinh(app, await cookieCua(QUAN_TRI), {
		aiOn: true,
		aiTomTatPhamVi: "danh-sach",
		aiTomTatDonVi: [pb(b), pb(c), pb(k), pb(r)],
		aiTomTatAnPhamVi: "danh-sach",
		aiTomTatAnDonVi: [pb(a)],
	});
	datDongHo(SAU(MINUTE_MS));
	const nguon = async (ma: string) => {
		const goi = await goiCua(pb(ma));
		const ds = goi ? motNguonMoiKr(goi) : [];
		if (!ds[0]) throw new Error(`phong ${ma} khong co nguon`);
		return ds.map((n) => n.id);
	};
	const [b0, b1] = await nguon(b);
	const [c0] = await nguon(c);
	const [a0] = await nguon(a);
	if (!b0 || !c0 || !a0) throw new Error("thieu nguon");
	const ghi = [
		await ghiBan({
			ma: "qt-b",
			departmentId: pb(b),
			nac: "bat",
			cau: [cauLanh(0, b0), cauLanh(1, b1 ?? b0)],
		}),
		await ghiBan({
			ma: "qt-c",
			departmentId: pb(c),
			nac: "bat",
			cau: [
				cauLanh(0, c0),
				{ vanBan: "Chỉ số của phòng đạt mức 987654.", nguon: [c0] },
				{ vanBan: "Phòng có thêm cập nhật ngoài gói.", nguon: ["khong-co"] },
			],
		}),
		await ghiBan({
			ma: "qt-a",
			departmentId: pb(a),
			nac: "an",
			cau: [cauLanh(0, a0)],
		}),
	];
	expect(ghi.map((g) => g.trangThai)).toEqual(["hien", "can-xem", "hien"]);
	await viecGieo({
		ma: "qt-k",
		departmentId: pb(k),
		trangThai: "xong",
		outcome: "khong-lam-duoc",
	});
	await viecGieo({ ma: "qt-r", departmentId: pb(r), trangThai: "chay" });
	datDongHo(SAU(20 * MINUTE_MS));
	const idB = ghi[0]?.id ?? "";
	for (const [ma, huuIch] of [
		[vai["thanh-vien"], true],
		[vai["truong-phong"], true],
		[QUAN_TRI, false],
	] as const) {
		ok(
			await goiQua(
				app,
				"phanHoi",
				"trpc",
				{ tomTatId: idB, huuIch },
				await cookieCua(ma),
			),
			`phan hoi ${ma}`,
		);
		tienDongHo(MINUTE_MS);
	}
}, CHO_DB);

afterAll(async () => {
	await donTomTat();
	await ketThucMau(app);
}, CHO_DB);

describe("quan-tri", () => {
	test(
		"quan-tri-thay: quản trị nhận mọi phòng có việc tuần đó với nấc, trạng thái, số câu, câu bỏ, hữu ích/không bằng đếm thẳng từ kho, qua tRPC và REST",
		async () => {
			const muon = await Promise.all(
				Object.values(phong).map((m) => dongTuKho(pb(m))),
			);
			for (const duong of HAI_DUONG) {
				const bang = ok<BangQuanTri>(
					await goiQua(
						app,
						"quanTri",
						duong,
						{ cycleId: KY },
						await cookieCua(QUAN_TRI),
					),
					`quan tri ${duong}`,
				);
				expect(bang.tuan).toBe(TUAN);
				expect(
					bang.phong.map(hangTuDong).sort(),
					`bang quan tri ${duong}`,
				).toEqual([...muon].sort());
				const theo = new Map(bang.phong.map((d) => [d.departmentId, d]));
				expect({
					b: theo.get(pb(phong.b))?.cau.length,
					c: theo.get(pb(phong.c))?.bo.map((x) => x.maBo),
				}).toEqual({ b: 2, c: ["so-lech", "nguon-ngoai-goi"] });
				for (const m of Object.values(phong)) {
					const d = theo.get(pb(m));
					expect(
						{ cau: d?.cau, bo: d?.bo },
						`nguon quan tri ${duong} ${m}`,
					).toEqual(await cauTuKho(pb(m)));
				}
				const nguonC = theo
					.get(pb(phong.c))
					?.bo.flatMap((x) => x.nguon.map((n) => `${x.maBo}:${n.mat}`));
				expect(nguonC).toEqual(["so-lech:false", "nguon-ngoai-goi:true"]);
			}
			expect(muon.map((m) => m.split(" ")[2])).toEqual([
				"hien",
				"can-xem",
				"hien",
				"khong-lam-duoc",
				"dang-soan",
			]);
		},
		CHO_DB,
	);

	test(
		"quan-tri-chan: thành viên, trưởng phòng, vai okr → 403 có tên qua tRPC và REST",
		async () => {
			const lot: string[] = [];
			const thuc: string[] = [];
			for (const [ten, ma] of Object.entries(vai))
				for (const duong of HAI_DUONG) {
					const tra = await goiQua(
						app,
						"quanTri",
						duong,
						{ cycleId: KY },
						await cookieCua(ma),
					);
					if (tra.status !== 403) lot.push(`quan tri lot: ${ten}`);
					thuc.push(`${ten} ${duong}: ${tra.status} ${tra.loi}`);
				}
			expect(lot.length > 0 ? [...new Set(lot)].join("; ") : "khong lot").toBe(
				"khong lot",
			);
			expect(thuc).toEqual(
				Object.keys(vai).flatMap((ten) =>
					HAI_DUONG.map(
						(duong) => `${ten} ${duong}: 403 ${OKR_XEM.thongDiep.chiQuanTri}`,
					),
				),
			);
		},
		CHO_DB,
	);
});
