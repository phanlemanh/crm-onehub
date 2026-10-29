import { describe, expect, setSystemTime, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	boHopTuan,
	type CayChonBo,
	type NguonBoHop,
	type QuyenChonBo,
} from "@crm/validation/okr-bo-hop-tuan";
import type { DonChonOkr } from "@crm/validation/okr-tham-so";
import { okrAccessOutput } from "../src/okr/okr.contracts";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import {
	type HopTuanOutput,
	hopTuanOutput,
	type ToanCanhOutput,
	toanCanhOutput,
} from "../src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../src/to-chuc/to-chuc.contracts";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
	doc,
	dungSan,
	goi,
	goiQuery,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	truongMoi,
	ungDung,
} from "./okr-san";

dungSan();

const MA_TRAN_MS = 120_000;

const nhanDon = new Map<string, string>();

const nhan = (d: DonChonOkr) =>
	d.loai === "goc" ? "goc" : `${d.loai}:${nhanDon.get(d.id) ?? d.id}`;

const cookieCua = new Map<string, string>();

async function cookie(userId: string): Promise<string> {
	const co = cookieCua.get(userId);
	if (co !== undefined) return co;
	const moi = await phienCua(userId);
	cookieCua.set(userId, moi);
	return moi;
}

async function xem(
	userId: string,
): Promise<{ access: QuyenChonBo; cay: CayChonBo }> {
	const c = await cookie(userId);
	const access = okrAccessOutput.parse(await doc("okr.access", c));
	const cay = orgTreeOutput.parse(await doc("org.tree", c));
	return { access, cay };
}

function loiCua(
	ca: string,
	ten: string,
	kq: { don: DonChonOkr; nguon: NguonBoHop },
	mong: string,
	nguon: NguonBoHop,
): string {
	if (nhan(kq.don) !== mong)
		return `${ca}: ${ten} ra ${nhan(kq.don)}, can ${mong}`;
	if (kq.nguon !== nguon)
		return `${ca}: ${ten} nguon ${kq.nguon}, can ${nguon}`;
	return "";
}

async function doiVai(userId: string, role: WorkspaceRole) {
	const m = await db.member.findFirstOrThrow({
		where: { userId, organizationId: WORKSPACE_ID },
		select: { id: true },
	});
	ok(
		await goi("workspace.setMemberRole", { memberId: m.id, role }, "chu"),
		`doi vai ${role}`,
	);
}

async function truong(
	kind: "division" | "department",
	id: string,
	userId: string,
) {
	ok(await goi("org.setHead", { kind, id, userId }), `truong ${kind}`);
}

async function pb(nhanPb: string, divisionId: string | null) {
	const id = await pbMoi(`htmb ${nhanPb}`, divisionId);
	nhanDon.set(id, nhanPb);
	return id;
}

async function bp(nhanBp: string) {
	const id = await bpMoi(`htmb ${nhanBp}`);
	nhanDon.set(id, nhanBp);
	return id;
}

describe("htmb-bo", () => {
	test(
		"htmb-bo: ma tran 8 nguoi xem chon dung bo",
		async () => {
			let dem = 0;
			const o = async (
				ten: string,
				userId: string,
				mong: string,
				nguon: NguonBoHop,
			) => {
				const { access, cay } = await xem(userId);
				const kq = boHopTuan({ access, cay, userId });
				expect(loiCua("htmb-bo", ten, kq, mong, nguon)).toBe("");
			};
			const oDem = async (
				ten: string,
				userId: string,
				mong: string,
				nguon: NguonBoHop,
			) => {
				await o(ten, userId, mong, nguon);
				dem += 1;
			};

			const B = await bp("B");
			const C = await bp("C");
			const P2 = await pb("P2", B);
			const P3 = await pb("P3", C);
			const P1 = await pb("P1", C);
			const P4 = await pb("P4", null);
			ok(
				await goi("org.moveDepartment", { id: P1, divisionId: C, index: 0 }),
				"P1 dau C",
			);

			const u1 = await nguoiMoi("htmb-truong-bp");
			await truong("division", B, u1);
			await oDem("truong-bo-phan", u1, "bp:B", "dan");

			const u2 = await nguoiMoi("htmb-dan-bp-pb");
			ok(await datViTri(u2, P2), "xep u2");
			await truong("department", P2, u2);
			await truong("division", B, u2);
			await oDem("dan-bo-phan-va-phong", u2, "bp:B", "dan");

			const u3 = await nguoiMoi("htmb-dan-hai-phong");
			ok(await datViTri(u3, P3, [P1]), "xep u3");
			await truong("department", P1, u3);
			await truong("department", P3, u3);
			const { cay: cay3 } = await xem(u3);
			const pbC =
				cay3.divisions.find((d) => d.id === C)?.departments.map((d) => d.id) ??
				[];
			expect(`P3<P1 theo id: ${P3 < P1}`).toBe("P3<P1 theo id: true");
			expect(
				`P1 truoc P3 trong cay: ${pbC.indexOf(P1) < pbC.indexOf(P3)}`,
			).toBe("P1 truoc P3 trong cay: true");
			await oDem("dan-hai-phong", u3, "pb:P1", "dan");

			const u4 = await nguoiMoi("htmb-quan-tri");
			await doiVai(u4, "admin");
			ok(await datViTri(u4, P2), "xep u4");
			await oDem("quan-tri-khong-dan", u4, "goc", "quan-tri");

			const u5 = await nguoiMoi("htmb-quan-tri-truong");
			await doiVai(u5, "admin");
			ok(await datViTri(u5, P2, [P1]), "xep u5");
			await truong("department", P1, u5);
			await oDem("quan-tri-kiem-truong", u5, "pb:P1", "dan");

			const u6 = await nguoiMoi("htmb-thanh-vien-p2");
			ok(await datViTri(u6, P2), "xep u6");
			await oDem("phong-ban-chinh", u6, "pb:P2", "phong-ban-chinh");

			const u7 = await nguoiMoi("htmb-khong-pb");
			await oDem("khong-phong-ban", u7, "goc", "goc");

			const u8 = await nguoiMoi("htmb-truong-p4");
			ok(await datViTri(u8, P4), "xep u8");
			await truong("department", P4, u8);
			await o("truong-p4-truoc-chuyen", u8, "pb:P4", "dan");
			ok(
				await goi("org.addPeople", { departmentId: P2, userIds: [u8] }),
				"chuyen u8 sang P2",
			);
			await oDem("truong-cu-chuyen-phong", u8, "pb:P2", "phong-ban-chinh");

			expect(dem).toBe(8);
		},
		MA_TRAN_MS,
	);
});

describe("htmb-bien-bo", () => {
	test(
		"htmb-bien-bo: don vi da luu tru khong thanh bo",
		async () => {
			let dem = 0;

			const P5 = await pb("P5", null);
			const u9 = await nguoiMoi("htmb-dan-luu-tru");
			ok(await datViTri(u9, null, [P5]), "xep u9");
			await truong("department", P5, u9);
			const truoc = await xem(u9);
			expect(
				loiCua(
					"htmb-bien-bo",
					"dan-truoc-luu-tru",
					boHopTuan({ ...truoc, userId: u9 }),
					"pb:P5",
					"dan",
				),
			).toBe("");
			ok(await goi("org.archiveDepartment", { id: P5 }), "luu tru P5");
			const sau = await xem(u9);
			expect(
				loiCua(
					"htmb-bien-bo",
					"dan-don-vi-luu-tru",
					boHopTuan({ access: truoc.access, cay: sau.cay, userId: u9 }),
					"goc",
					"goc",
				),
			).toBe("");
			dem += 1;

			const P6 = await pb("P6", null);
			const u10 = await nguoiMoi("htmb-chinh-luu-tru");
			ok(await datViTri(u10, P6), "xep u10");
			const truocChinh = await xem(u10);
			expect(
				loiCua(
					"htmb-bien-bo",
					"chinh-truoc-luu-tru",
					boHopTuan({ ...truocChinh, userId: u10 }),
					"pb:P6",
					"phong-ban-chinh",
				),
			).toBe("");
			ok(await datViTri(u10, null), "u10 roi P6");
			ok(await goi("org.archiveDepartment", { id: P6 }), "luu tru P6");
			const sauChinh = await xem(u10);
			const dongCu = truocChinh.cay.people.find((n) => n.id === u10);
			expect(`dong cu chinh P6: ${dongCu?.primaryDepartmentId === P6}`).toBe(
				"dong cu chinh P6: true",
			);
			const cayLech: CayChonBo = {
				...sauChinh.cay,
				people: sauChinh.cay.people.map((n) =>
					n.id === u10 && dongCu ? dongCu : n,
				),
			};
			expect(
				loiCua(
					"htmb-bien-bo",
					"chinh-da-luu-tru",
					boHopTuan({ access: sauChinh.access, cay: cayLech, userId: u10 }),
					"goc",
					"goc",
				),
			).toBe("");
			dem += 1;

			expect(dem).toBe(2);
		},
		MA_TRAN_MS,
	);
});

const NGAY_MS = 24 * 60 * 60 * 1000;
const GIO_GIEO = new Date("2026-10-05T03:00:00.000Z");
const GIO_DO = new Date("2026-10-21T05:00:00.000Z");
const GIO_TUAN_TRUOC = new Date(GIO_DO.getTime() - 7 * NGAY_MS);
const TEP_TOAN_CANH = join(import.meta.dir, "fixtures", "htmb-toan-canh.json");

type HienThi = "cong-khai" | "gioi-han";

const taoMucTieu = async (
	cycleId: string,
	unit: Json,
	ownerUserId: string,
	ai: AiHoacCookie,
	hienThi: HienThi,
) =>
	ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit,
				title: ma("htmb muc tieu"),
				kind: "cam-ket",
				ownerUserId,
				participantIds: [],
				whyNow: "",
				hienThi,
			},
			ai,
		),
		"tao muc tieu",
	).id;

const taoKr = async (
	objectiveId: string,
	ownerUserId: string,
	ai: AiHoacCookie,
) =>
	ok<{ id: string }>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma("htmb kr"),
				kind: "tang-toi",
				ownerUserId,
				startValue: 10,
				targetValue: 50,
				currentValue: 20,
				unit: "khách",
				dueOn: null,
				weight: 1,
			},
			ai,
		),
		"tao kr",
	).id;

async function mucTieuCoKr(
	cycleId: string,
	unit: Json,
	truongDv: { nguoi: string; cookie: string },
	soKr: number,
	hienThi: HienThi = "cong-khai",
	nguoiXem: string[] = [],
): Promise<{ id: string; kr: string[] }> {
	const id = await taoMucTieu(
		cycleId,
		unit,
		truongDv.nguoi,
		truongDv.cookie,
		hienThi,
	);
	if (hienThi === "gioi-han")
		ok(
			await goi(
				"okr.datHienThi",
				{ objectiveId: id, hienThi, nguoiXem },
				truongDv.cookie,
			),
			"dat gioi han",
		);
	const kr: string[] = [];
	for (let i = 0; i < soKr; i += 1)
		kr.push(await taoKr(id, truongDv.nguoi, truongDv.cookie));
	ok(
		await goi("okr.publishObjective", { id }, truongDv.cookie),
		"cong bo muc tieu",
	);
	return { id, kr };
}

async function capNhatLuc(userId: string, keyResultId: string, luc: Date) {
	setSystemTime(luc);
	const svc = ungDung().get(OkrCapNhatService);
	const { sessionId } = await svc.moCapNhat(userId, { entry: "tab" }, luc);
	await svc.guiCapNhat(
		userId,
		{
			sessionId,
			items: [{ keyResultId, value: 30, confidence: "cao", note: "" }],
		},
		luc,
	);
}

async function demSqlBoPhan(
	cycleId: string,
	divisionId: string,
	luc: Date,
): Promise<{ soKr: number; daCapNhat: number }> {
	const [kr] = await db.$queryRaw<{ n: number }[]>`
		SELECT count(*)::int AS n
		FROM "okrKeyResult" k
		JOIN "okrObjective" o ON o.id = k."objectiveId"
		WHERE o."cycleId" = ${cycleId}
			AND o.status = 'cong-bo'
			AND o."hienThi" = 'cong-khai'
			AND (
				(o.level = 'bo-phan' AND o."divisionId" = ${divisionId})
				OR (o.level = 'phong-ban' AND o."departmentId" IN (
					SELECT d.id FROM department d WHERE d."divisionId" = ${divisionId}
				))
			)`;
	const [lan] = await db.$queryRaw<{ n: number }[]>`
		SELECT count(DISTINCT c."keyResultId")::int AS n
		FROM "okrCheckIn" c
		JOIN "okrCheckInSession" s ON s.id = c."sessionId"
		JOIN "okrKeyResult" k ON k.id = c."keyResultId"
		JOIN "okrObjective" o ON o.id = k."objectiveId"
		WHERE o."cycleId" = ${cycleId}
			AND o.status = 'cong-bo'
			AND o."hienThi" = 'cong-khai'
			AND (
				(o.level = 'bo-phan' AND o."divisionId" = ${divisionId})
				OR (o.level = 'phong-ban' AND o."departmentId" IN (
					SELECT d.id FROM department d WHERE d."divisionId" = ${divisionId}
				))
			)
			AND date_trunc('week', (s."submittedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh')
				= date_trunc('week', (${luc.toISOString()}::timestamptz) AT TIME ZONE 'Asia/Ho_Chi_Minh')`;
	return { soKr: kr?.n ?? -1, daCapNhat: lan?.n ?? -1 };
}

function latToanCanh(
	tc: ToanCanhOutput,
	khoaNhan: ReadonlyMap<string, string>,
): ToanCanhOutput {
	const tenNhan = new Map<string, string>();
	const hang = tc.hang.flatMap((h) => {
		if (h.key === "goc") return [h];
		const nhanK = khoaNhan.get(h.key);
		if (nhanK === undefined) return [];
		const ten = nhanK.slice(nhanK.indexOf(":") + 1);
		tenNhan.set(h.ten, ten);
		return [{ ...h, key: nhanK, ten }];
	});
	const donViChuaDat = tc.tongQuan.donViChuaDat.flatMap((t) => {
		const ten = tenNhan.get(t);
		return ten === undefined ? [] : [ten];
	});
	return {
		...tc,
		tongQuan: {
			...tc.tongQuan,
			tongDonVi: tc.tongQuan.donViCongBo + donViChuaDat.length,
			donViChuaDat,
		},
		hang,
	};
}

const donCua = (khoa: string): Json => {
	if (khoa === "goc") return { loai: "goc" };
	const [loai, id] = khoa.split(":");
	return { loai: loai ?? "", id: id ?? "" };
};

describe("htmb-toan-canh", () => {
	test(
		"htmb-toan-canh: toanCanh va hopTuan cung dem, bo rong tuanDau false",
		async () => {
			ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
			const quy = await kyDangChay("htmb-tc");
			const B = await bpMoi("htmb-tc B");
			const P = await pbMoi("htmb-tc P", B);
			const X = await pbMoi("htmb-tc X", null);
			const Q = await pbMoi("htmb-tc Q", null);
			const khoaNhan = new Map([
				[`bp:${B}`, "bp:B"],
				[`pb:${P}`, "pb:P"],
				[`pb:${X}`, "pb:X"],
				[`pb:${Q}`, "pb:Q"],
			]);
			const nhanCua = (khoa: string) => khoaNhan.get(khoa) ?? khoa;
			const truongP = await truongMoi("department", P, "htmb-tc-p");
			const truongX = await truongMoi("department", X, "htmb-tc-x");
			const truongQ = await truongMoi("department", Q, "htmb-tc-q");
			const xemQ = await nguoiMoi("htmb-tc-xem-q");
			const cookieXemQ = await phienCua(xemQ);
			const toanCanh = async (ai: AiHoacCookie) =>
				toanCanhOutput.parse(await doc("okr.toanCanh", ai, { cycleId: quy }));
			const hopTuan = async (
				ai: AiHoacCookie,
				khoa: string,
			): Promise<HopTuanOutput> =>
				hopTuanOutput.parse(
					await doc("okr.hopTuan", ai, { cycleId: quy, unit: donCua(khoa) }),
				);

			const loi: string[] = [];
			let dem = 0;
			try {
				setSystemTime(GIO_GIEO);
				const mtP = await mucTieuCoKr(
					quy,
					{ level: "phong-ban", departmentId: P },
					truongP,
					3,
				);
				await mucTieuCoKr(
					quy,
					{ level: "phong-ban", departmentId: X },
					truongX,
					1,
				);
				const mtQ = await mucTieuCoKr(
					quy,
					{ level: "phong-ban", departmentId: Q },
					truongQ,
					3,
					"gioi-han",
					[xemQ],
				);
				const [krTuanNay, krTuanTruoc] = mtP.kr;
				expect(`P co ${mtP.kr.length} KR`).toBe("P co 3 KR");
				await capNhatLuc(truongP.nguoi, krTuanTruoc ?? "", GIO_TUAN_TRUOC);
				await capNhatLuc(truongP.nguoi, krTuanNay ?? "", GIO_DO);
				setSystemTime(GIO_DO);

				const goc = await hopTuan("thuong", "goc");
				if (goc.tongKr !== 0)
					loi.push(`htmb-toan-canh: goc rong tongKr ${goc.tongKr}`);
				if (goc.tuanDau) loi.push("htmb-toan-canh: goc rong tuanDau true");

				const tc = await toanCanh("thuong");
				const hangQ = tc.hang.find((h) => h.key === `pb:${Q}`);
				if (hangQ !== undefined && hangQ.soKr !== 0)
					loi.push(`htmb-toan-canh: pb:Q lo muc tieu han che (${hangQ.soKr})`);

				const hangB = tc.hang.find((h) => h.key === `bp:${B}`);
				const soB = { soKr: hangB?.soKr, daCapNhat: hangB?.daCapNhat };
				const sql = await demSqlBoPhan(quy, B, GIO_DO);
				if (soB.soKr !== 3 || soB.daCapNhat !== 1)
					loi.push(
						`htmb-toan-canh: bp:B soKr ${soB.soKr} daCapNhat ${soB.daCapNhat}, can 3 va 1`,
					);
				if (sql.soKr !== soB.soKr || sql.daCapNhat !== soB.daCapNhat)
					loi.push(
						`htmb-toan-canh: bp:B toanCanh ${JSON.stringify(soB)}, SQL ${JSON.stringify(sql)}`,
					);

				const htB = await hopTuan("thuong", `bp:${B}`);
				dem += 1;
				if (htB.tongKr !== 0 || htB.daCapNhat !== 0)
					loi.push(
						`htmb-toan-canh: bp:B hopTuan gom phong ban con (tongKr ${htB.tongKr}, daCapNhat ${htB.daCapNhat})`,
					);
				for (const khoa of [`pb:${P}`, `pb:${X}`]) {
					const h = tc.hang.find((x) => x.key === khoa);
					const ht = await hopTuan("thuong", khoa);
					dem += 1;
					if (h === undefined) {
						loi.push(`htmb-toan-canh: ${nhanCua(khoa)} vang trong toanCanh`);
						continue;
					}
					if (ht.tongKr !== h.soKr)
						loi.push(
							`htmb-toan-canh: ${nhanCua(khoa)} liet ${h.soKr}, hopTuan ${ht.tongKr}`,
						);
					if (ht.daCapNhat !== h.daCapNhat)
						loi.push(
							`htmb-toan-canh: ${nhanCua(khoa)} daCapNhat ${h.daCapNhat}, hopTuan ${ht.daCapNhat}`,
						);
				}
				const coKr = tc.hang
					.filter((h) => h.soKr > 0)
					.map((h) => nhanCua(h.key))
					.sort()
					.join(",");
				if (coKr !== "bp:B,pb:P,pb:X")
					loi.push(
						`htmb-toan-canh: khoa co soKr > 0 la ${coKr}, can bp:B,pb:P,pb:X`,
					);

				const lat = latToanCanh(tc, khoaNhan);
				if (process.env.HTMB_GHI === "1")
					writeFileSync(TEP_TOAN_CANH, `${JSON.stringify(lat, null, "\t")}\n`);
				const daGhi = existsSync(TEP_TOAN_CANH)
					? JSON.stringify(
							toanCanhOutput.parse(
								JSON.parse(readFileSync(TEP_TOAN_CANH, "utf8")),
							),
						)
					: "";
				if (daGhi !== JSON.stringify(lat))
					loi.push("htmb-toan-canh: fixture lech dau ra that");

				const tcXemQ = await toanCanh(cookieXemQ);
				const htXemQ = await hopTuan(cookieXemQ, `pb:${Q}`);
				const moXemQ = await goiQuery("okr.objective", cookieXemQ, {
					id: mtQ.id,
				});
				console.log(
					`htmb-toan-canh: nguoi trong danh sach xem Q, pb:Q soKr ${tcXemQ.hang.find((h) => h.key === `pb:${Q}`)?.soKr ?? "vang"}, hopTuan(pb:Q) ${htXemQ.tongKr}, mo muc tieu HTTP ${moXemQ.status}`,
				);

				ok(
					await goi(
						"okr.datHienThi",
						{ objectiveId: mtQ.id, hienThi: "cong-khai", nguoiXem: [] },
						truongQ.cookie,
					),
					"Q cong khai",
				);
				const tcMo = await toanCanh("thuong");
				const htMo = await hopTuan("thuong", `pb:${Q}`);
				const soQMo = tcMo.hang.find((h) => h.key === `pb:${Q}`)?.soKr;
				if (soQMo !== 3 || htMo.tongKr !== 3)
					loi.push(
						`htmb-toan-canh: doi chung Q cong khai soKr ${soQMo ?? "vang"}, hopTuan ${htMo.tongKr}, can 3`,
					);
			} finally {
				setSystemTime();
			}
			expect(loi.join("\n")).toBe("");
			expect(dem).toBe(3);
		},
		MA_TRAN_MS,
	);
});
