import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db, type TrangThaiViec } from "@crm/db";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
import { doiTrangThai, taoViec } from "@crm/db/viec-ghi";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import {
	chayNhac,
	chuDeNhac,
	LOAI_VIEC_NHAC,
	lenLichNhac,
} from "../agent/lib/nhac-ke-hoach";
import { BuocDoi, cauTraLoi, xongTheoTinNhac } from "../agent/lib/tra-loi-nhac";
import { ZALO } from "../agent/lib/zalo-config";
import {
	DAY_MS,
	donDep,
	gieoKeHoach,
	gieoNguoi,
	khopSlack,
	ma,
	moXuong,
	noiSlack,
	slackGia,
	TIEN_TO,
} from "./support/nhac-gieo";
import { hangCua } from "./support/nhac-gui-gieo";
import {
	batBot,
	donOkr,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	noiZalo,
	tatBot,
} from "./support/okr-gieo";
import { APP_URL, voiToken } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const NOW = new Date("2026-10-14T09:00:00+07:00");
const TUAN_TRUOC = new Date("2026-10-05T10:00:00+07:00");
const han = (ngay: string) => new Date(`${ngay}T00:00:00.000Z`);

async function donViec() {
	await db.viec.deleteMany({ where: { taoBoiId: { startsWith: TIEN_TO } } });
}

beforeEach(async () => {
	await donViec();
	await donOkr();
	await moXuong();
	setSystemTime(NOW);
});

afterEach(() => setSystemTime());

afterAll(async () => {
	await donViec();
	await donOkr();
	await donDep();
	await tatBot();
});

async function thoaThuan(ten: string, chuId: string) {
	const congTy = await db.company.create({
		data: { name: `${ma()} ${ten} Cty` },
	});
	return db.deal.create({
		data: { name: `${ten} ${ma()}`, companyId: congTy.id, ownerId: chuId },
	});
}

function viec(input: {
	giao: string;
	lam: string;
	tieuDe: string;
	hanNgay?: Date | null;
	dealId?: string;
}) {
	return db.$transaction((tx) =>
		taoViec(tx, {
			nguoiId: input.giao,
			nguoiThucHienId: input.lam,
			tieuDe: input.tieuDe,
			hanNgay: input.hanNgay ?? null,
			gan: input.dealId ? [{ loai: "deal", id: input.dealId }] : [],
			nguon: "web",
			now: NOW,
		}),
	);
}

function doi(viecId: string, nguoiId: string, den: TrangThaiViec) {
	return db.$transaction((tx) =>
		doiTrangThai(tx, { viecId, nguoiId, den, nguon: "web", now: NOW }),
	);
}

async function dungNguoi(ten: string, tenNguoi: string) {
	const n = await gieoNguoi(tenNguoi);
	const khac = await gieoNguoi(`${tenNguoi} khac`);
	const deal = await thoaThuan(`VC Deal ${ten}`, khac.id);
	await viec({
		giao: khac.id,
		lam: n.id,
		tieuDe: `${ten} qua han`,
		hanNgay: han("2026-10-12"),
		dealId: deal.id,
	});
	await viec({
		giao: khac.id,
		lam: n.id,
		tieuDe: `${ten} sap han`,
		hanNgay: han("2026-10-16"),
		dealId: deal.id,
	});
	const cho = await viec({
		giao: n.id,
		lam: khac.id,
		tieuDe: `${ten} cho danh gia`,
		dealId: deal.id,
	});
	await doi(cho.id, khac.id, "CHO_DANH_GIA");
	const chay = await gieoChuKy("dang-chay", 1);
	const mucTieu = await gieoMucTieu({
		cycleId: chay,
		chu: n.id,
		congBo: TUAN_TRUOC,
	});
	await gieoKr({
		objectiveId: mucTieu,
		chu: n.id,
		tieuDe: `KR VC ${ten}`,
		khoa: TUAN_TRUOC,
	});
	const congTy = await db.company.findUniqueOrThrow({
		where: { id: deal.companyId },
	});
	return { nguoi: n, tenDoiTac: [deal.name, congTy.name] };
}

describe("vc-nhac-vai-okr", () => {
	test("vc-nhac-vai-okr: bộ gom của vai okr không có loại việc ở cả hai cửa sổ, vẫn có việc OKR; member đủ ba loại", async () => {
		const okr = await dungNguoi("vc-nhac-okr", "Người OKR Nhắc");
		const thuong = await dungNguoi("vc-nhac-member", "vc-nhac-member");
		await db.member.updateMany({
			where: { userId: okr.nguoi.id },
			data: { role: "okr" },
		});
		for (const cuaSo of ["buoi-sang", "truc-tiep"] as const) {
			const kq = await viecCanNhac(db, { now: NOW, cuaSo });
			const cuaOkr = kq.get(okr.nguoi.id) ?? [];
			if (cuaOkr.some((v) => v.loai.startsWith("viec-"))) {
				throw new Error(`vc: bo gom co viec doi tac cho vai okr ${cuaSo}`);
			}
			if (!cuaOkr.some((v) => v.loai === "okr-cap-nhat"))
				throw new Error(`vc: bo gom mat viec okr ${cuaSo}`);
			const loai = (kq.get(thuong.nguoi.id) ?? []).map((v) => v.loai);
			for (const l of ["viec-qua-han", "viec-sap-han", "viec-cho-danh-gia"]) {
				if (!loai.includes(l)) throw new Error(`vc: doi chung thieu ${l}`);
			}
		}
	});

	test.each([
		["zalo", "vc-nhac-okr-zalo"],
		["slack", "vc-nhac-okr-slack"],
	] as const)(
		"vc-nhac-vai-okr: tin %s tới vai okr không mang tên đối tác, daGui không có dòng việc",
		async (kenh, ten) => {
			const okr = await dungNguoi(ten, `Người OKR ${kenh}`);
			await db.member.updateMany({
				where: { userId: okr.nguoi.id },
				data: { role: "okr" },
			});
			const z = zaloGia();
			const s = slackGia();
			if (kenh === "zalo") {
				await noiZalo(okr.nguoi.id, `Z-${okr.nguoi.id}`);
				await batBot();
			} else {
				await noiSlack(okr.nguoi.id);
				await khopSlack(okr.nguoi.id, `S-${okr.nguoi.id}`);
				await db.notificationPreference.create({
					data: { userId: okr.nguoi.id, channel: "SLACK" },
				});
			}
			await lenLichNhac(NOW);
			const hang = await hangCua(okr.nguoi.id);
			await voiToken(() =>
				chayNhac(hang, {
					fetcher: s.fetcher,
					zaloFetcher: z.fetcher,
					appUrl: APP_URL,
				}),
			);
			const tin =
				kenh === "zalo"
					? z.guiToi(`Z-${okr.nguoi.id}`).map((g) => g.body.text ?? "")
					: s.goi
							.filter((g) => g.url.endsWith("chat.postMessage"))
							.map((g) => g.body.text ?? "");
			const ganTen = await db.viecGan.findMany({
				where: {
					viec: {
						OR: [
							{ nguoiThucHienId: okr.nguoi.id },
							{ nguoiGiaoId: okr.nguoi.id },
						],
					},
				},
				select: {
					deal: { select: { name: true, company: { select: { name: true } } } },
				},
			});
			const tenDoiTac = ganTen.flatMap((g) =>
				g.deal ? [g.deal.name, g.deal.company.name] : [],
			);
			if (
				tin.length !== 1 ||
				tenDoiTac.some((t) => (tin[0] ?? "").includes(t))
			) {
				throw new Error(`vc: tin ${kenh} mang ten doi tac`);
			}
			const sau = await db.agentTask.findUniqueOrThrow({
				where: { id: hang.id },
			});
			if (
				(parseNhacPayload(sau.payload).daGui ?? []).some((m) =>
					m.loai.startsWith("viec-"),
				)
			) {
				throw new Error("vc: daGui co dong viec");
			}
		},
	);

	test("vc-nhac-vai-okr: đối chứng — tin Zalo của member có ba dòng việc và tên thoả thuận của họ", async () => {
		const thuong = await dungNguoi("vc-nhac-member-tin", "vc-nhac-member-tin");
		const z = zaloGia();
		await noiZalo(thuong.nguoi.id, `Z-${thuong.nguoi.id}`);
		await batBot();
		await lenLichNhac(NOW);
		const hang = await hangCua(thuong.nguoi.id);
		await voiToken(() =>
			chayNhac(hang, { zaloFetcher: z.fetcher, appUrl: APP_URL }),
		);
		const than =
			z.guiToi(`Z-${thuong.nguoi.id}`).map((g) => g.body.text ?? "")[0] ?? "";
		const daGui =
			parseNhacPayload(
				(await db.agentTask.findUniqueOrThrow({ where: { id: hang.id } }))
					.payload,
			).daGui ?? [];
		for (const l of ["viec-qua-han", "viec-sap-han", "viec-cho-danh-gia"]) {
			if (!daGui.some((m) => m.loai === l))
				throw new Error(`vc: doi chung thieu ${l}`);
		}
		if (!thuong.tenDoiTac.some((t) => than.includes(t)))
			throw new Error("vc: doi chung thieu ten thoa thuan");
	});

	test("vc-nhac-vai-okr: nguồn việc của bộ gom lọc bằng docDuocDoiTac của @crm/db/vai-doi-tac, không so chuỗi okr", () => {
		const nguon = readFileSync(
			join(
				import.meta.dir,
				"..",
				"..",
				"..",
				"packages",
				"db",
				"src",
				"onboarding-nhac.ts",
			),
			"utf8",
		);
		const dung =
			nguon.includes('import { docDuocDoiTac } from "./vai-doi-tac";') &&
			nguon.includes("guiViec(v, tapDoiTac, chon.now)") &&
			!/["']okr["']\s*[!=]==|[!=]==\s*["']okr["']/.test(nguon);
		if (!dung) throw new Error("vc: nhac viec khong dung luat vai cua DA0a");
	});
});

async function dungE9() {
	const b = await gieoNguoi("vc-nhac-b");
	const a = await gieoNguoi("vc-nhac-a");
	const d = await gieoNguoi("vc-nhac-d");
	const x = await gieoNguoi("vc-nhac-x");
	const deal = await thoaThuan("VC Nhac Deal", x.id);
	await db.deal.update({
		where: { id: deal.id },
		data: { name: "VC Nhac Deal" },
	});
	const quaHan = await viec({
		giao: x.id,
		lam: b.id,
		tieuDe: "VC việc quá hạn",
		hanNgay: han("2026-10-13"),
		dealId: deal.id,
	});
	const sapHan = await viec({
		giao: x.id,
		lam: b.id,
		tieuDe: "VC việc sắp hạn",
		hanNgay: han("2026-10-16"),
		dealId: deal.id,
	});
	const cho = await viec({
		giao: a.id,
		lam: b.id,
		tieuDe: "VC việc chờ đánh giá",
		dealId: deal.id,
	});
	await doi(cho.id, b.id, "CHO_DANH_GIA");
	for (const t of ["d qua han", "d sap han"]) {
		const v = await viec({
			giao: x.id,
			lam: d.id,
			tieuDe: `VC ${t}`,
			hanNgay: han("2026-10-13"),
			dealId: deal.id,
		});
		await doi(v.id, d.id, "XONG");
	}
	const choD = await viec({
		giao: d.id,
		lam: b.id,
		tieuDe: "VC d cho",
		dealId: deal.id,
	});
	await doi(choD.id, b.id, "CHO_DANH_GIA");
	await doi(choD.id, d.id, "XONG");
	await gieoKeHoach({
		camTrich: x.id,
		batDau: new Date(NOW.getTime() - 10 * DAY_MS),
		buoc: [
			{
				nhan: "VC buoc",
				han: new Date(NOW.getTime() + 2 * DAY_MS),
				giao: b.id,
			},
		],
	});
	return { a, b, d, x, quaHan, sapHan, cho };
}

describe("vc-nhac", () => {
	test("vc-nhac: bộ gom đúng người đúng loại; Zalo cho B có hai việc và tên thoả thuận; Slack cho A có việc chờ đánh giá; một loại hỏng không làm đổ cả lô", async () => {
		const f = await dungE9();
		const kq = await viecCanNhac(db, { now: NOW, cuaSo: "buoi-sang" });
		const loai = (id: string) => (kq.get(id) ?? []).map((v) => v.loai);
		for (const [n, id, l] of [
			["b", f.b.id, "viec-qua-han"],
			["b", f.b.id, "viec-sap-han"],
			["a", f.a.id, "viec-cho-danh-gia"],
		] as const) {
			if (!loai(id).includes(l)) throw new Error(`vc: bo gom sai ${n} ${l}`);
		}
		if (loai(f.d.id).some((l) => l.startsWith("viec-")))
			throw new Error("vc: bo gom sai d viec-");
		const z = zaloGia();
		const s = slackGia();
		await noiZalo(f.b.id, `Z-${f.b.id}`);
		await batBot();
		await noiSlack(f.a.id);
		await khopSlack(f.a.id, `S-${f.a.id}`);
		await db.notificationPreference.create({
			data: { userId: f.a.id, channel: "SLACK" },
		});
		await lenLichNhac(NOW);
		for (const id of [f.b.id, f.a.id]) {
			const h = await hangCua(id);
			await voiToken(() =>
				chayNhac(h, {
					fetcher: s.fetcher,
					zaloFetcher: z.fetcher,
					appUrl: APP_URL,
				}),
			);
		}
		const tinB = z.guiToi(`Z-${f.b.id}`).map((g) => g.body.text ?? "");
		if (
			tinB.length !== 1 ||
			!["VC việc quá hạn", "VC việc sắp hạn", "VC Nhac Deal"].every((c) =>
				(tinB[0] ?? "").includes(c),
			)
		) {
			throw new Error("vc: tin zalo thieu dong viec");
		}
		const tinA = s.goi
			.filter((g) => g.url.endsWith("chat.postMessage"))
			.map((g) => g.body.text ?? "");
		if (!tinA.some((t) => t.includes("VC việc chờ đánh giá")))
			throw new Error("vc: tin slack thieu viec cho danh gia");
	});

	test("vc-nhac: cách ly — một mục loại lạ trong bộ gom của A không chặn hàng nhắc của B", async () => {
		const f = await dungE9();
		await db.agentTask.deleteMany({ where: { kind: LOAI_VIEC_NHAC } });
		const gomHong: typeof viecCanNhac = async (dbx, chon) => {
			const kq = await viecCanNhac(dbx, chon);
			const cuaA = kq.get(f.a.id) ?? [];
			kq.set(f.a.id, [
				...cuaA,
				{ loai: "loai-la", viecId: "x" } as unknown as (typeof cuaA)[number],
			]);
			return kq;
		};
		await lenLichNhac(NOW, gomHong);
		const soB = await db.agentTask.count({
			where: {
				kind: LOAI_VIEC_NHAC,
				subject: { startsWith: `user:${f.b.id}:` },
			},
		});
		if (soB !== 1) throw new Error("vc: mot loai hong lam do ca lo");
	});
});

describe("vc-xong-n", () => {
	test("vc-xong-n: B đóng việc quá hạn qua Zalo, A đóng việc chờ đánh giá; người giao cầm tin chuyển tiếp bị từ chối; trả lần hai báo đã xong; dòng bước vẫn xong", async () => {
		const f = await dungE9();
		const z = zaloGia();
		for (const id of [f.b.id, f.a.id]) await noiZalo(id, `Z-${id}`);
		await batBot();
		await lenLichNhac(NOW);
		for (const id of [f.b.id, f.a.id]) {
			const h = await hangCua(id);
			await voiToken(() =>
				chayNhac(h, { zaloFetcher: z.fetcher, appUrl: APP_URL }),
			);
		}
		const daGui = async (id: string) =>
			parseNhacPayload((await hangCua(id)).payload).daGui ?? [];
		const viTri = async (id: string, loai: string) =>
			(await daGui(id)).findIndex((m) => m.loai === loai) + 1;
		const tra = (userId: string, so: number) =>
			db.$transaction((tx) =>
				xongTheoTinNhac(tx, {
					userId,
					so: [so],
					now: NOW,
					lienKet: () => null,
				}),
			);
		const vetZalo = (viecId: string) =>
			db.viecVet.count({
				where: { viecId, nguon: "zalo", loai: "doi-trang-thai" },
			});

		const r1 = await tra(f.b.id, await viTri(f.b.id, "viec-qua-han"));
		const v1 = await db.viec.findUniqueOrThrow({ where: { id: f.quaHan.id } });
		if (
			v1.trangThai !== "XONG" ||
			(await vetZalo(f.quaHan.id)) !== 1 ||
			r1.loai !== "xong" ||
			!r1.vua.some((m) => m.nhan === "VC việc quá hạn")
		) {
			throw new Error("vc: xong n khong dong viec");
		}
		await tra(f.a.id, await viTri(f.a.id, "viec-cho-danh-gia"));
		if (
			(await db.viec.findUniqueOrThrow({ where: { id: f.cho.id } }))
				.trangThai !== "XONG"
		) {
			throw new Error("vc: xong n nguoi giao hong");
		}
		const muc = await daGui(f.b.id);
		await db.agentTask.deleteMany({
			where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(f.x.id, NOW) },
		});
		await db.agentTask.create({
			data: {
				kind: LOAI_VIEC_NHAC,
				reason: "thu",
				subject: chuDeNhac(f.x.id, NOW),
				dueAt: NOW,
				priority: 0,
				payload: { muc, daGui: muc, kenh: "zalo" },
			},
		});
		const vetTruoc = await db.viecVet.count({ where: { viecId: f.sapHan.id } });
		const rLa = await tra(f.x.id, await viTri(f.b.id, "viec-sap-han"));
		if (
			(await db.viec.findUniqueOrThrow({ where: { id: f.sapHan.id } }))
				.trangThai !== "CHUA_LAM" ||
			(await db.viecVet.count({ where: { viecId: f.sapHan.id } })) !==
				vetTruoc ||
			rLa.loai === "xong"
		) {
			throw new Error("vc: xong n nguoi la lot");
		}
		const vetLai = await vetZalo(f.quaHan.id);
		const r2 = await tra(f.b.id, await viTri(f.b.id, "viec-qua-han"));
		if (
			r2.loai !== "xong" ||
			r2.vua.length !== 0 ||
			r2.truoc.length !== 1 ||
			(await vetZalo(f.quaHan.id)) !== vetLai
		) {
			throw new Error("vc: xong n ghi hai lan");
		}
		const rBuoc = await tra(f.b.id, await viTri(f.b.id, "buoc-sap-han"));
		expect(rBuoc.loai).toBe("xong");
	});
	test("vc-xong-n: việc đã sang Chờ đánh giá hoặc đã huỷ sau khi tin gửi — trả lời riêng, không ghi gì, cả tin bị giữ", async () => {
		const f = await dungE9();
		const z = zaloGia();
		await noiZalo(f.b.id, `Z-${f.b.id}`);
		await batBot();
		await lenLichNhac(NOW);
		const h = await hangCua(f.b.id);
		await voiToken(() =>
			chayNhac(h, { zaloFetcher: z.fetcher, appUrl: APP_URL }),
		);
		const daGui = parseNhacPayload((await hangCua(f.b.id)).payload).daGui ?? [];
		const viTri = (loai: string) => daGui.findIndex((m) => m.loai === loai) + 1;
		const tra = (so: number[]) =>
			db.$transaction((tx) =>
				xongTheoTinNhac(tx, {
					userId: f.b.id,
					so,
					now: NOW,
					lienKet: () => null,
				}),
			);
		const soQuaHan = viTri("viec-qua-han");
		const soSapHan = viTri("viec-sap-han");
		await doi(f.quaHan.id, f.b.id, "CHO_DANH_GIA");
		await doi(f.sapHan.id, f.x.id, "HUY");
		const vet = async (id: string) =>
			db.viecVet.count({ where: { viecId: id } });
		const vetQuaHan = await vet(f.quaHan.id);
		const vetSapHan = await vet(f.sapHan.id);

		const cho = await tra([soQuaHan]);
		expect(cho).toEqual({
			loai: "viec-khong-dong-duoc",
			muc: [{ so: soQuaHan, lyDo: "cho-danh-gia" }],
		});
		expect(cauTraLoi(cho)).toBe(
			`${ZALO.loi.viecChoDanhGia(soQuaHan)} ${ZALO.loi.chuaDanhDau}`,
		);
		expect(cauTraLoi(cho)).not.toContain("người khác");

		const huy = await tra([soSapHan]);
		expect(huy).toEqual({
			loai: "viec-khong-dong-duoc",
			muc: [{ so: soSapHan, lyDo: "da-huy" }],
		});
		expect(cauTraLoi(huy)).toBe(
			`${ZALO.loi.viecDaHuy(soSapHan)} ${ZALO.loi.chuaDanhDau}`,
		);
		expect(cauTraLoi(huy)).not.toContain("từ trước");

		const buoc = viTri("buoc-sap-han");
		const ca = await tra([soQuaHan, soSapHan, buoc]);
		expect(ca.loai).toBe("viec-khong-dong-duoc");
		const trangThai = async (id: string) =>
			(await db.viec.findUniqueOrThrow({ where: { id } })).trangThai;
		expect(await trangThai(f.quaHan.id)).toBe("CHO_DANH_GIA");
		expect(await trangThai(f.sapHan.id)).toBe("HUY");
		expect(await vet(f.quaHan.id)).toBe(vetQuaHan);
		expect(await vet(f.sapHan.id)).toBe(vetSapHan);
		const dongBuoc = await db.onboardingStep.count({
			where: { completedAt: { not: null }, assigneeId: f.b.id },
		});
		expect(dongBuoc).toBe(0);
	});
	test("vc-xong-n: việc đổi trạng thái giữa lúc đọc và lúc ghi — người nhắn vẫn nhận lời trả, cả tin được hoàn lại", async () => {
		const f = await dungE9();
		const z = zaloGia();
		await noiZalo(f.b.id, `Z-${f.b.id}`);
		await batBot();
		await lenLichNhac(NOW);
		const h = await hangCua(f.b.id);
		await voiToken(() =>
			chayNhac(h, { zaloFetcher: z.fetcher, appUrl: APP_URL }),
		);
		const daGui = parseNhacPayload((await hangCua(f.b.id)).payload).daGui ?? [];
		const soQuaHan = daGui.findIndex((m) => m.loai === "viec-qua-han") + 1;
		const soSapHan = daGui.findIndex((m) => m.loai === "viec-sap-han") + 1;
		await doi(f.sapHan.id, f.x.id, "HUY");
		const mu = <T extends object>(goc: T, ghi: Record<string, unknown>): T =>
			new Proxy(goc, {
				get(t, k) {
					const v = Reflect.get(t, k);
					if (typeof k === "string" && k in ghi) return ghi[k];
					return typeof v === "function" ? v.bind(t) : v;
				},
			});
		const loi = await db
			.$transaction(async (tx) => {
				const viecMu = mu(tx.viec, {
					findMany: async (a: Parameters<typeof tx.viec.findMany>[0]) =>
						(await tx.viec.findMany(a)).map((r) => ({
							...r,
							trangThai: "DANG_LAM" as const,
						})),
				});
				const txMu = mu(tx, { viec: viecMu });
				return xongTheoTinNhac(txMu, {
					userId: f.b.id,
					so: [soQuaHan, soSapHan],
					now: NOW,
					lienKet: () => null,
				});
			})
			.then(
				() => null,
				(e: unknown) => e,
			);
		expect(loi).toBeInstanceOf(BuocDoi);
		const muc = (loi as BuocDoi).muc;
		expect(muc).toEqual([{ so: soSapHan, lyDo: "viec-doi-trang-thai" }]);
		expect(cauTraLoi({ loai: "buoc-doi", muc })).toBe(
			`${ZALO.loi.buocDoi(soSapHan, "viec-doi-trang-thai")} ${ZALO.loi.chuaDanhDau}`,
		);
		const trangThai = async (id: string) =>
			(await db.viec.findUniqueOrThrow({ where: { id } })).trangThai;
		expect(await trangThai(f.quaHan.id)).toBe("CHUA_LAM");
		expect(await trangThai(f.sapHan.id)).toBe("HUY");
	});
});
