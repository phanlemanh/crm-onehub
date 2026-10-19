import { afterAll, beforeAll, describe, test } from "bun:test";
import { VIEC } from "@crm/validation/viec";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { donDuAn, duAnThu, ngayDb } from "./support/du-an-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	donViec,
	goi,
	type KetGoi,
	nguoi,
	taoThu,
	thoaThuan,
} from "./support/viec-gieo";

const MA_TEST_MS = 180_000;

type AiThay = "rieng" | "du-an" | "ban-ghi";
type Doc = "duoc" | "404" | "cam";

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donDuAn();
	await donViec();
	await donDep();
});

function json(x: unknown): string {
	return JSON.stringify(x);
}

function dau(nhan: string): string {
	return `vrc-dau-${nhan}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

async function ghi(ten: string, input: Record<string, unknown>, userId: string) {
	const r = await goi(app, ten, "mutation", input, userId);
	if (r.status !== 200) throw new Error(`vrc: ${ten} loi ${json(r)}`);
	return r.data;
}

async function doc(ten: string, input: Record<string, unknown>, userId: string) {
	const r = await goi(app, ten, "query", input, userId);
	if (r.status !== 200) throw new Error(`vrc: ${ten} loi ${json(r)}`);
	return r.data;
}

function getCua(id: string, userId: string): Promise<KetGoi> {
	return goi(app, "viec.get", "query", { id }, userId);
}

type DongLichSu = { loai: string; vet: Record<string, unknown> };

async function lichSuCua(id: string, userId: string): Promise<DongLichSu[]> {
	return (await doc("viec.lichSu", { id }, userId)) as DongLichSu[];
}

function coDau(x: unknown, dauV: string, maV: string): boolean {
	const s = json(x);
	return s.includes(dauV) || s.includes(maV);
}

async function haiViecCho(nhan: string) {
	const a = await nguoi(`vrc-${nhan}-a`);
	const b = await nguoi(`vrc-${nhan}-b`);
	const y = await nguoi(`vrc-${nhan}-y`);
	const x = await nguoi(`vrc-${nhan}-x`);
	const P = await duAnThu(a.id, `vrc ${nhan}`);
	const dauV = dau(nhan);
	const V = await taoThu({
		nguoiId: a.id,
		nguoiThucHienId: b.id,
		tieuDe: `V ${dauV}`,
		gan: [],
		duAnId: P.id,
		batDauNgay: ngayDb("2026-11-02"),
		hanNgay: ngayDb("2026-11-03"),
	});
	const W = await taoThu({
		nguoiId: a.id,
		nguoiThucHienId: y.id,
		tieuDe: `W vrc ${nhan}`,
		gan: [],
		duAnId: P.id,
		batDauNgay: ngayDb("2026-11-04"),
		hanNgay: ngayDb("2026-11-05"),
	});
	await ghi("duAn.phuThuocTao", { truocId: V.id, sauId: W.id }, a.id);
	return { a, b, y, x, P, V, W, dauV };
}

describe("vrc-ma-tran", () => {
	test(
		"vrc-ma-tran: 4 việc × 6 người = 24 ô; aiThay khớp đáp án và khớp việc người ngoài cuộc đọc được",
		async () => {
			const p = {
				"vrc-mt-a": await nguoi("vrc-mt-a"),
				"vrc-mt-b": await nguoi("vrc-mt-b"),
				"vrc-mt-w": await nguoi("vrc-mt-w"),
				"vrc-mt-x": await nguoi("vrc-mt-x"),
				"vrc-mt-q": await nguoi("vrc-mt-q", "admin"),
				"vrc-mt-o": await nguoi("vrc-mt-o", "okr"),
			};
			const a = p["vrc-mt-a"];
			const { dealId } = await thoaThuan(app, a.id, "vrc mt");
			const P = await duAnThu(a.id, "vrc mt");
			const chung = {
				nguoiId: a.id,
				nguoiThucHienId: p["vrc-mt-b"].id,
				nguoiTheoDoiIds: [p["vrc-mt-w"].id],
			};
			const deal = [{ loai: "deal" as const, id: dealId }];
			const viec = {
				V0: await taoThu({ ...chung, tieuDe: "vrc mt V0", gan: [] }),
				V1: await taoThu({
					...chung,
					tieuDe: "vrc mt V1",
					gan: [],
					duAnId: P.id,
				}),
				V2: await taoThu({ ...chung, tieuDe: "vrc mt V2", gan: deal }),
				V3: await taoThu({
					...chung,
					tieuDe: "vrc mt V3",
					gan: deal,
					duAnId: P.id,
				}),
			};
			const DAP_AN: {
				nguoi: keyof typeof p;
				viec: keyof typeof viec;
				doc: Doc;
				aiThay: AiThay | null;
			}[] = [
				{ nguoi: "vrc-mt-a", viec: "V0", doc: "duoc", aiThay: "rieng" },
				{ nguoi: "vrc-mt-a", viec: "V1", doc: "duoc", aiThay: "du-an" },
				{ nguoi: "vrc-mt-a", viec: "V2", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-a", viec: "V3", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-b", viec: "V0", doc: "duoc", aiThay: "rieng" },
				{ nguoi: "vrc-mt-b", viec: "V1", doc: "duoc", aiThay: "du-an" },
				{ nguoi: "vrc-mt-b", viec: "V2", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-b", viec: "V3", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-w", viec: "V0", doc: "duoc", aiThay: "rieng" },
				{ nguoi: "vrc-mt-w", viec: "V1", doc: "duoc", aiThay: "du-an" },
				{ nguoi: "vrc-mt-w", viec: "V2", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-w", viec: "V3", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-x", viec: "V0", doc: "404", aiThay: null },
				{ nguoi: "vrc-mt-x", viec: "V1", doc: "duoc", aiThay: "du-an" },
				{ nguoi: "vrc-mt-x", viec: "V2", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-x", viec: "V3", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-q", viec: "V0", doc: "404", aiThay: null },
				{ nguoi: "vrc-mt-q", viec: "V1", doc: "duoc", aiThay: "du-an" },
				{ nguoi: "vrc-mt-q", viec: "V2", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-q", viec: "V3", doc: "duoc", aiThay: "ban-ghi" },
				{ nguoi: "vrc-mt-o", viec: "V0", doc: "cam", aiThay: null },
				{ nguoi: "vrc-mt-o", viec: "V1", doc: "cam", aiThay: null },
				{ nguoi: "vrc-mt-o", viec: "V2", doc: "cam", aiThay: null },
				{ nguoi: "vrc-mt-o", viec: "V3", doc: "cam", aiThay: null },
			];
			let daSo = 0;
			for (const o of DAP_AN) {
				const id = viec[o.viec].id;
				const r = await getCua(id, p[o.nguoi].id);
				const aiThay = (r.data as { aiThay?: unknown } | undefined)?.aiThay;
				if (o.doc === "duoc") {
					if (r.status !== 200 || aiThay !== o.aiThay) {
						throw new Error(
							`vrc: o ${o.nguoi} ${o.viec} aiThay ${r.status === 200 ? String(aiThay) : json(r)}`,
						);
					}
				} else if (o.doc === "404") {
					if (r.status === 200 || r.message !== VIEC.thongDiep.khongCoViec(id)) {
						throw new Error(`vrc: o ${o.nguoi} ${o.viec} khong an`);
					}
				} else if (r.status === 200) {
					throw new Error(`vrc: o ${o.nguoi} ${o.viec} okr doc duoc`);
				}
				daSo++;
			}
			for (const ten of Object.keys(viec) as (keyof typeof viec)[]) {
				const cuaB = await getCua(viec[ten].id, p["vrc-mt-b"].id);
				const cuaX = await getCua(viec[ten].id, p["vrc-mt-x"].id);
				const rieng =
					(cuaB.data as { aiThay?: unknown } | undefined)?.aiThay === "rieng";
				if (rieng !== (cuaX.status === 404)) {
					throw new Error(`vrc: chu lech luat ${ten}`);
				}
			}
			if (daSo !== 24) throw new Error(`vrc: ma tran thieu o ${daSo}`);
		},
		MA_TEST_MS,
	);
});

describe("vrc-chuyen", () => {
	test(
		"vrc-chuyen: đưa việc riêng vào dự án rồi rút ra — aiThay và việc người ngoài cuộc đọc được đổi theo",
		async () => {
			const a = await nguoi("vrc-cv-a");
			const b = await nguoi("vrc-cv-b");
			const x = await nguoi("vrc-cv-x");
			const P = await duAnThu(a.id, "vrc cv");
			const V0 = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: "vrc cv V0",
				gan: [],
			});
			if ((await getCua(V0.id, x.id)).status !== 404) {
				throw new Error("vrc: fixture V0 khong rieng");
			}
			await ghi("viec.doiDuAn", { id: V0.id, duAnId: P.id }, a.id);
			const vao = await getCua(V0.id, a.id);
			const aiThayVao = (vao.data as { aiThay?: unknown } | undefined)?.aiThay;
			if (aiThayVao !== "du-an") {
				throw new Error(`vrc: vao du an aiThay ${String(aiThayVao)}`);
			}
			if ((await getCua(V0.id, x.id)).status !== 200) {
				throw new Error("vrc: vao du an x khong thay");
			}
			await ghi("viec.doiDuAn", { id: V0.id, duAnId: null }, a.id);
			const ra = await getCua(V0.id, a.id);
			const aiThayRa = (ra.data as { aiThay?: unknown } | undefined)?.aiThay;
			if (aiThayRa !== "rieng") {
				throw new Error(`vrc: ra du an aiThay ${String(aiThayRa)}`);
			}
			if ((await getCua(V0.id, x.id)).status === 200) {
				throw new Error("vrc: ra du an x van thay");
			}
		},
		MA_TEST_MS,
	);
});

describe("vrc-phu-thuoc", () => {
	test(
		"vrc-phu-thuoc: rút V khỏi dự án — lịch sử W che V với người ngoài cuộc, người trong cuộc vẫn thấy",
		async () => {
			const { a, b, x, V, W, dauV } = await haiViecCho("pt");
			if (!coDau(await lichSuCua(W.id, x.id), dauV, V.id)) {
				throw new Error("vrc: phu thuoc doi chung mat ten");
			}
			await ghi("viec.doiDuAn", { id: V.id, duAnId: null }, a.id);
			if ((await getCua(V.id, x.id)).status !== 404) {
				throw new Error("vrc: fixture V chua rieng");
			}
			const cuaX = await lichSuCua(W.id, x.id);
			for (const loai of ["them-phu-thuoc", "go-phu-thuoc"] as const) {
				const dong = cuaX.filter((h) => h.loai === loai);
				if (dong.length === 0) throw new Error(`vrc: thieu vet ${loai}`);
				for (const h of dong) {
					if (coDau(h, dauV, V.id)) throw new Error(`vrc: lich su lo V ${loai}`);
					const nhac =
						loai === "them-phu-thuoc"
							? (h.vet.sau as { viec: unknown }).viec
							: (h.vet.truoc as { viec: unknown }).viec;
					if (nhac !== null) throw new Error(`vrc: vet chua che ${loai}`);
				}
			}
			if (coDau(cuaX, dauV, V.id)) throw new Error("vrc: lich su lo V toan-bo");
			const cuaB = await lichSuCua(W.id, b.id);
			for (const loai of ["them-phu-thuoc", "go-phu-thuoc"] as const) {
				const dong = cuaB.filter((h) => h.loai === loai);
				if (dong.length === 0 || !dong.every((h) => json(h).includes(dauV))) {
					throw new Error(`vrc: nguoi trong cuoc mat ten ${loai}`);
				}
			}
		},
		MA_TEST_MS,
	);
});

describe("vrc-tu-doi", () => {
	test(
		"vrc-tu-doi: vết tự dời của W che việc gây dời khi việc đó thành riêng",
		async () => {
			const { a, b, x, V, W, dauV } = await haiViecCho("td");
			await ghi(
				"viec.doiLich",
				{ id: V.id, batDauNgay: "2026-11-02", hanNgay: "2026-11-05" },
				b.id,
			);
			const tuDoi = (ds: DongLichSu[]) =>
				ds.filter(
					(h) =>
						(h.loai === "doi-han" || h.loai === "doi-bat-dau") &&
						(h.vet.sau as { boi?: unknown }).boi !== undefined,
				);
			const truoc = tuDoi(await lichSuCua(W.id, b.id));
			if (
				!truoc.some(
					(h) => (h.vet.sau as { boi?: { id?: string } }).boi?.id === V.id,
				)
			) {
				throw new Error("vrc: fixture khong tu doi");
			}
			if (!coDau(await lichSuCua(W.id, x.id), dauV, V.id)) {
				throw new Error("vrc: tu doi doi chung mat ten");
			}
			await ghi("viec.doiDuAn", { id: V.id, duAnId: null }, a.id);
			const cuaX = await lichSuCua(W.id, x.id);
			if (coDau(cuaX, dauV, V.id)) throw new Error("vrc: tu doi lo V");
			for (const h of tuDoi(cuaX)) {
				if ((h.vet.sau as { boi?: unknown }).boi !== null) {
					throw new Error("vrc: boi chua che");
				}
			}
			for (const h of tuDoi(await lichSuCua(W.id, b.id))) {
				const boi = (h.vet.sau as { boi?: { tieuDe?: string } | null }).boi;
				if (!boi?.tieuDe?.includes(dauV)) {
					throw new Error("vrc: tu doi nguoi trong cuoc mat ten");
				}
			}
		},
		MA_TEST_MS,
	);
});

describe("vrc-viec-con", () => {
	test(
		"vrc-viec-con: người theo dõi việc cha riêng không thấy việc con họ không xem được; việc đã xoá che với mọi người",
		async () => {
			const a = await nguoi("vrc-vc-a");
			const b = await nguoi("vrc-vc-b");
			const w = await nguoi("vrc-vc-w");
			const c = await nguoi("vrc-vc-c");
			const P0 = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				nguoiTheoDoiIds: [w.id],
				tieuDe: "vrc vc P0",
				gan: [],
			});
			const dauK = dau("vc");
			const K = (await ghi(
				"viec.taoCon",
				{ chaId: P0.id, tieuDe: `K ${dauK}`, nguoiThucHienId: c.id },
				b.id,
			)) as { id: string };
			if ((await getCua(K.id, w.id)).status !== 404) {
				throw new Error("vrc: fixture K khong an voi w");
			}
			const cuaW = await lichSuCua(P0.id, w.id);
			const conW = cuaW.filter((h) => h.loai === "them-viec-con");
			if (conW.length !== 1) throw new Error("vrc: thieu vet them-viec-con");
			if (conW[0]?.vet.sau !== null) throw new Error("vrc: viec con chua che");
			if (coDau(cuaW, dauK, K.id)) throw new Error("vrc: viec con lo K");
			if (coDau((await getCua(P0.id, w.id)).data, dauK, K.id)) {
				throw new Error("vrc: khung P0 lo K");
			}
			if (!json(await lichSuCua(P0.id, b.id)).includes(dauK)) {
				throw new Error("vrc: viec con nguoi trong cuoc mat ten");
			}
			await ghi("viec.xoa", { id: K.id }, b.id);
			const cuaB = await lichSuCua(P0.id, b.id);
			const conB = cuaB.filter((h) => h.loai === "them-viec-con");
			if (conB.length !== 1) throw new Error("vrc: viec da xoa mat vet");
			if (conB[0]?.vet.sau !== null || coDau(cuaB, dauK, K.id)) {
				throw new Error("vrc: viec da xoa con ten");
			}
		},
		MA_TEST_MS,
	);
});

describe("vrc-man-du-an", () => {
	test(
		"vrc-man-du-an: rút V khỏi dự án — sáu câu đọc của màn dự án không còn V, số việc và khoảng ngày co lại",
		async () => {
			const a = await nguoi("vrc-md-a");
			const b = await nguoi("vrc-md-b");
			const x = await nguoi("vrc-md-x");
			const P = await duAnThu(a.id, "vrc md");
			const dauV = dau("md");
			const V = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `V ${dauV}`,
				gan: [],
				duAnId: P.id,
				batDauNgay: ngayDb("2026-11-02"),
				hanNgay: ngayDb("2026-11-06"),
			});
			await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: "vrc md U",
				gan: [],
				duAnId: P.id,
				batDauNgay: ngayDb("2026-11-03"),
				hanNgay: ngayDb("2026-11-04"),
			});
			const LIET = [
				["duAn.lich", { id: P.id }],
				["viec.cuaToi", { nhom: "giao-cho-toi", duAnId: P.id }],
				["viec.cuaToi", { nhom: "giao-cho-toi", tatCaDuAn: true }],
				["viec.bang", { nhom: "giao-cho-toi", duAnId: P.id }],
			] as const;
			const TONG = [
				["duAn.get", { id: P.id }],
				["duAn.list", { trangThai: "mo" }],
			] as const;
			type DongTong = {
				id: string;
				soViec: number;
				batDauSom: string | null;
				hanMuon: string | null;
			};
			const dongP = (ten: string, data: unknown): DongTong => {
				const d =
					ten === "duAn.list"
						? (data as DongTong[]).find((r) => r.id === P.id)
						: (data as DongTong);
				if (!d) throw new Error(`vrc: man du an loi ${ten} thieu P`);
				return d;
			};
			const nguoiXem = [
				["vrc-md-x", x.id],
				["vrc-md-a", a.id],
			] as const;
			let soTruoc = -1;
			for (const [ten, uid] of nguoiXem) {
				for (const [cau, input] of LIET) {
					if (!coDau(await doc(cau, input, uid), dauV, V.id)) {
						throw new Error(`vrc: man du an doi chung thieu V ${ten} ${cau}`);
					}
				}
				for (const [cau, input] of TONG) {
					const d = dongP(cau, await doc(cau, input, uid));
					if (d.batDauSom !== "2026-11-02" || d.hanMuon !== "2026-11-06") {
						throw new Error(`vrc: khoang ngay doi chung ${ten} ${cau} ${json(d)}`);
					}
					soTruoc = d.soViec;
				}
			}
			await ghi("viec.doiDuAn", { id: V.id, duAnId: null }, a.id);
			let daQuet = 0;
			let soSau = -1;
			for (const [ten, uid] of nguoiXem) {
				for (const [cau, input] of [...LIET, ...TONG]) {
					const r = await goi(app, cau, "query", input, uid);
					if (r.status !== 200) throw new Error(`vrc: man du an loi ${cau}`);
					if (coDau(r.data, dauV, V.id)) {
						throw new Error(`vrc: man du an lo V ${ten} ${cau}`);
					}
					if (cau === "duAn.get" || cau === "duAn.list") {
						const d = dongP(cau, r.data);
						if (d.batDauSom !== "2026-11-03" || d.hanMuon !== "2026-11-04") {
							throw new Error(`vrc: khoang ngay lo V ${ten} ${cau}`);
						}
						soSau = d.soViec;
					}
					daQuet++;
				}
			}
			if (soSau !== soTruoc - 1) {
				throw new Error(`vrc: so viec lech ${soTruoc} ${soSau}`);
			}
			if (daQuet !== 12) throw new Error(`vrc: man du an thieu cau ${daQuet}`);
		},
		MA_TEST_MS,
	);
});
