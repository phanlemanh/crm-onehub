import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { completeTask } from "../../agent/agent/lib/tasks";
import { idMau } from "../scripts/okr-mau/nap";
import type { SoDoNac, TroLySoDoOutput } from "../src/okr/okr.contracts";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoChiPhi,
	goi,
	goiRest,
	ketThucMau,
	kr,
	mt,
	nopThat,
	ok,
	phienGocCua,
	phienMau,
	TIEN_TO_TLO,
} from "./tro-ly-okr-san";

const THANG = "2026-11";
const RANG = join(
	import.meta.dir,
	"../../../_acceptance/tro-ly-okr-de-xuat/rang",
);
const GIAY = 1_000;
const GIO = 3_600 * GIAY;
const NGAY = 24 * GIO;
const T1 = new Date("2026-11-13T09:00:00+07:00").getTime();

const MT = mt("q4-kd-bac-1");
const MT2 = mt("q4-kd-bac-2");
const K1 = kr("q4-kd-bac-1-k1");
const K2 = kr("q4-kd-bac-1-k2");
const K3 = kr("q4-kd-bac-1-k3");

let app: NestExpressApplication;
let cTruong = "";
let cChamSoc = "";
let cQuanTri = "";
const viec = { b1: "", b2: "", b3: "", b5: "", a1: "", a2: "" };

type Hang = Record<string, number | string | null | Record<string, number>>;

const luc = (ms: number) => new Date(T1 + ms);

async function xep(
	objectiveId: string,
	keyResultId: string | null,
	ms: number,
) {
	datDongHo(luc(ms));
	const x = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId,
		keyResultId,
		nguoiYeuCau: `${TIEN_TO_TLO}gieo`,
		nac: "bat",
		now: luc(ms),
	});
	if (!x.bat || x.dungLai)
		throw new Error(`khong xep moi: ${JSON.stringify(x)}`);
	return x.taskId;
}

async function tieuDe(id: string) {
	return await db.okrObjective.findUniqueOrThrow({
		where: { id },
		select: { title: true, whyNow: true },
	});
}

async function tenKr(id: string) {
	return (
		await db.okrKeyResult.findUniqueOrThrow({
			where: { id },
			select: { title: true },
		})
	).title;
}

async function danhSach(ms: number) {
	datDongHo(luc(ms));
	ok(
		await goi(app, "okr.troLyDanhSach", "query", { objectiveId: MT }, cTruong),
		"danh sach",
	);
}

async function quyet(
	deXuatId: string,
	cach: "nhan" | "sua" | "bac" | "bo-qua",
	ms: number,
	giaTri?: string,
) {
	datDongHo(luc(ms));
	ok(
		await goi(
			app,
			"okr.troLyQuyet",
			"mutation",
			{ deXuatId, cach, giaTri },
			cTruong,
		),
		`quyet ${cach}`,
	);
}

async function sua(
	ten: "okr.updateObjective" | "okr.updateKeyResult",
	vao: { id: string; title: string },
	ms: number,
	c = cTruong,
) {
	datDongHo(luc(ms));
	ok(await goi(app, ten, "mutation", vao, c), ten);
}

async function idTheoThuTu(taskId: string) {
	return (
		await db.okrDeXuat.findMany({
			where: { taskId },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			select: { id: true },
		})
	).map((h) => h.id);
}

async function chaySql(ten: string): Promise<Hang[]> {
	const sql = readFileSync(join(RANG, ten), "utf8");
	return db.$transaction(async (tx) => {
		await tx.$executeRaw`SELECT set_config('okr.thang', ${THANG}, true)`;
		return tx.$queryRawUnsafe<Hang[]>(sql);
	});
}

async function soDoSql(): Promise<Record<"bat" | "an", Hang>> {
	const tep = [
		"ty-le-quyet.sql",
		"hoan-tac.sql",
		"do-tre.sql",
		"bi-loai.sql",
		"chi-phi-moi-nhan.sql",
	];
	const ket = { bat: {} as Hang, an: {} as Hang };
	for (const t of tep)
		for (const h of await chaySql(t)) {
			const nac = h.nac as "bat" | "an";
			ket[nac] = { ...ket[nac], ...h };
		}
	return ket;
}

const TRUONG_SQL: [keyof SoDoNac, string, string][] = [
	["soLuot", "so_luot", "so-luot"],
	["sinhRa", "sinh_ra", "sinh-ra"],
	["daHien", "da_hien", "da-hien"],
	["nhan", "nhan", "nhan"],
	["sua", "sua", "sua"],
	["bac", "bac", "bac"],
	["boQua", "bo_qua", "bo-qua"],
	["tyLeNhan", "ty_le_nhan", "ty-le-nhan"],
	["tyLeSua", "ty_le_sua", "ty-le-sua"],
	["tyLeBac", "ty_le_bac", "ty-le-bac"],
	["tyLeBoQua", "ty_le_bo_qua", "ty-le-bo-qua"],
	["tyLeDuocNhan", "ty_le_duoc_nhan", "ty-le-duoc-nhan"],
	["daNhan", "da_nhan", "da-nhan"],
	["hoanTac", "hoan_tac", "hoan-tac"],
	["tyLeHoanTac", "ty_le_hoan_tac", "ty-le-hoan-tac"],
	["soLuotDo", "so_luot_do", "so-luot-do"],
	["p50Ms", "p50_ms", "p50"],
	["p90Ms", "p90_ms", "p90"],
	["tongCau", "tong_cau", "tong-cau"],
	["biLoai", "bi_loai", "bi-loai"],
	["tyLeBiLoai", "ty_le_bi_loai", "ty-le-bi-loai"],
	["tienUsd", "tien_usd", "tien"],
	["chiPhiMoiNhanUsd", "chi_phi_moi_nhan_usd", "chi-phi-moi-nhan"],
	["chiPhiMoiLuotUsd", "chi_phi_moi_luot_usd", "chi-phi-moi-luot"],
];

function lechApiSql(api: TroLySoDoOutput, sql: Record<"bat" | "an", Hang>) {
	const lech: string[] = [];
	for (const nac of ["bat", "an"] as const) {
		for (const [k, cot, ten] of TRUONG_SQL)
			if (api[nac][k] !== sql[nac][cot])
				lech.push(
					`so do lech: ${ten} (${nac}: api ${JSON.stringify(api[nac][k])}, sql ${JSON.stringify(sql[nac][cot])})`,
				);
		const theoMa = Object.fromEntries(
			api[nac].theoMa.map((m) => [m.maLoai, m.so]),
		);
		if (JSON.stringify(theoMa) !== JSON.stringify(sql[nac].theo_ma))
			lech.push(`so do lech: theo-ma (${nac})`);
		if (sql[nac].so_nhan !== api[nac].daNhan)
			lech.push(`so do lech: so-nhan (${nac})`);
	}
	return lech;
}

const TAY_BAT: SoDoNac = {
	soLuot: 5,
	sinhRa: 9,
	daHien: 8,
	nhan: 3,
	sua: 1,
	bac: 1,
	boQua: 1,
	tyLeNhan: 0.375,
	tyLeSua: 0.125,
	tyLeBac: 0.125,
	tyLeBoQua: 0.125,
	tyLeDuocNhan: 0.5,
	daNhan: 4,
	hoanTac: 1,
	tyLeHoanTac: 0.25,
	soLuotDo: 4,
	p50Ms: 14_500,
	p90Ms: 27_000,
	tongCau: 10,
	biLoai: 1,
	tyLeBiLoai: 0.1,
	theoMa: [{ maLoai: "so-moi", so: 1 }],
	tienUsd: 0.05,
	chiPhiMoiNhanUsd: 0.0125,
	chiPhiMoiLuotUsd: 0.01,
};

const TAY_AN: SoDoNac = {
	soLuot: 2,
	sinhRa: 1,
	daHien: 0,
	nhan: 0,
	sua: 0,
	bac: 0,
	boQua: 0,
	tyLeNhan: null,
	tyLeSua: null,
	tyLeBac: null,
	tyLeBoQua: null,
	tyLeDuocNhan: null,
	daNhan: 0,
	hoanTac: 0,
	tyLeHoanTac: null,
	soLuotDo: 2,
	p50Ms: 9_000,
	p90Ms: 11_400,
	tongCau: 2,
	biLoai: 1,
	tyLeBiLoai: 0.5,
	theoMa: [{ maLoai: "so-moi", so: 1 }],
	tienUsd: 0.042,
	chiPhiMoiNhanUsd: null,
	chiPhiMoiLuotUsd: 0.021,
};

async function soDoApi(): Promise<TroLySoDoOutput> {
	return ok<TroLySoDoOutput>(
		await goi(app, "okr.troLySoDo", "query", { thang: THANG }, cQuanTri),
		"so do",
	);
}

async function dungThangBat() {
	const mt0 = await tieuDe(MT);
	const k2 = await tenKr(K2);
	viec.b1 = await xep(MT, null, 0);
	await nopThat(
		viec.b1,
		[
			dongMau({
				loai: "viet-lai",
				objectiveId: MT,
				truong: "title",
				truoc: mt0.title,
				sau: "Bán lẻ miền Bắc lớn đều qua từng tháng",
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: MT,
				keyResultId: K2,
				truong: "kr.title",
				truoc: k2,
				sau: `${k2}, rõ từng tuần`,
			}),
			dongMau({
				loai: "hoi",
				objectiveId: MT,
				maVanDe: "khong-do-duoc",
				lyDo: "Câu hỏi giúp làm rõ cách đo.",
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: MT,
				truong: "whyNow",
				truoc: mt0.whyNow,
				sau: `${mt0.whyNow} Đây là mùa đối tác cần kho nhất.`,
			}),
			dongMau({
				loai: "can-chinh",
				objectiveId: MT,
				targetObjectiveId: mt("n2"),
				lyDo: "Mục tiêu này góp vào giao đúng hẹn.",
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: MT,
				truong: "title",
				truoc: mt0.title,
				sau: `${mt0.title} đạt 99 hợp đồng`,
			}),
		],
		luc(4 * GIAY),
	);
	const [r1, r2, r3, r4, r5] = (await idTheoThuTu(viec.b1)) as string[];
	await danhSach(60 * GIAY);
	await quyet(r1 ?? "", "nhan", 120 * GIAY);
	await quyet(
		r2 ?? "",
		"sua",
		121 * GIAY,
		"Có 60 cuộc hẹn đầu tiên với đối tác mới",
	);
	await quyet(r3 ?? "", "bo-qua", 122 * GIAY);
	await quyet(r4 ?? "", "bac", 123 * GIAY);
	await quyet(r5 ?? "", "nhan", 124 * GIAY);
	await sua("okr.updateObjective", { id: MT, title: mt0.title }, NGAY);

	const t2 = NGAY + GIO;
	const k1 = await tenKr(K1);
	const k3 = await tenKr(K3);
	viec.b2 = await xep(MT, null, t2);
	await nopThat(
		viec.b2,
		[
			dongMau({
				loai: "viet-lai",
				objectiveId: MT,
				keyResultId: K1,
				truong: "kr.title",
				truoc: k1,
				sau: `${k1}, rõ từng tuần`,
			}),
			dongMau({
				loai: "hoi",
				objectiveId: MT,
				maVanDe: "trung-y",
				lyDo: "Câu hỏi giúp làm rõ cách đo.",
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: MT,
				keyResultId: K3,
				truong: "kr.title",
				truoc: k3,
				sau: `${k3}, rõ từng tuần`,
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: MT,
				truong: "title",
				truoc: mt0.title,
				sau: `${mt0.title}, dễ theo dõi hơn`,
			}),
		],
		luc(t2 + 9 * GIAY),
	);
	const [r7] = (await idTheoThuTu(viec.b2)) as string[];
	await sua(
		"okr.updateObjective",
		{ id: MT, title: `${mt0.title} mới` },
		t2 + 30 * GIAY,
	);
	await danhSach(t2 + 60 * GIAY);
	await quyet(r7 ?? "", "nhan", t2 + 120 * GIAY);
	await sua(
		"okr.updateKeyResult",
		{ id: K3, title: `${k3} mới` },
		t2 + 180 * GIAY,
	);
	await danhSach(t2 + 240 * GIAY);

	const t3 = 2 * NGAY;
	viec.b3 = await xep(MT2, null, t3);
	datDongHo(luc(t3 + 20 * GIAY));
	await completeTask(viec.b3, "khong-lam-duoc");
	await xep(MT2, kr("q4-kd-bac-2-k1"), t3 + GIO);
	viec.b5 = await xep(MT2, null, t3 + 2 * GIO);
	datDongHo(luc(t3 + 2 * GIO + 30 * GIAY));
	await completeTask(viec.b5, "hong:het-lease");
}

async function luotAnMoi(objectiveId: string) {
	const hang = await db.agentTask.findFirstOrThrow({
		where: {
			kind: "okr-de-xuat",
			AND: [
				{ payload: { path: ["objectiveId"], equals: objectiveId } },
				{ payload: { path: ["nac"], equals: "an" } },
			],
		},
		orderBy: { createdAt: "desc" },
		select: { id: true },
	});
	return hang.id;
}

async function dungThangAn() {
	const t4 = 3 * NGAY;
	const cs1 = idMau("mt", "q4-cham-soc-1");
	const cs2 = idMau("mt", "q4-cham-soc-2");
	await sua(
		"okr.updateObjective",
		{ id: cs1, title: "Đối tác chỉ kể vấn đề một lần thôi" },
		t4,
		cChamSoc,
	);
	viec.a1 = await luotAnMoi(cs1);
	const ten = (await tieuDe(cs1)).title;
	await nopThat(
		viec.a1,
		[
			dongMau({
				loai: "viet-lai",
				objectiveId: cs1,
				truong: "title",
				truoc: ten,
				sau: `${ten}, rõ từng tuần`,
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: cs1,
				truong: "title",
				truoc: ten,
				sau: `${ten}, đạt 99 lần`,
			}),
		],
		luc(t4 + 6 * GIAY),
	);
	await sua(
		"okr.updateObjective",
		{ id: cs2, title: "Khiếu nại được xử lý xong trong ngày" },
		t4 + GIO,
		cChamSoc,
	);
	viec.a2 = await luotAnMoi(cs2);
	await nopThat(viec.a2, [], luc(t4 + GIO + 12 * GIAY));
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cTruong = await phienMau("nguyen-thi-lan");
	cChamSoc = await phienMau("vu-thu-ha");
	cQuanTri = await phienMau("le-hai-dang");
	datDongHo(luc(-GIO));
	await ghiCauHinh(app, cQuanTri, {
		aiOn: true,
		aiDeXuatPhamVi: "danh-sach",
		aiDeXuatDonVi: [idMau("pb", "kd-bac")],
		aiDeXuatAnPhamVi: "toan-cong-ty",
		aiDeXuatAnDonVi: [],
	});
	const k2 = await tenKr(K2);
	await dungThangBat();
	await dungThangAn();
	await sua(
		"okr.updateKeyResult",
		{ id: K2, title: k2 },
		8 * NGAY + 121 * GIAY + GIO,
	);
	datDongHo(luc(10 * NGAY));
	for (const [id, taskId, usd] of [
		["b1", viec.b1, "0.01"],
		["b2", viec.b2, "0.02"],
		["b3", viec.b3, "0.005"],
		["b5", viec.b5, "0.015"],
	] as const)
		await gieoChiPhi({ id, taskId, usd });
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("so-do", () => {
	test(
		"chi phí mỗi đề xuất nhận của cột Bật không đổi khi thêm tiền chế độ ẩn",
		async () => {
			const truoc = await soDoApi();
			expect(truoc.bat.chiPhiMoiNhanUsd).toBe(TAY_BAT.chiPhiMoiNhanUsd);
			expect(truoc.an.tienUsd).toBe(0);
			await gieoChiPhi({ id: "a1", taskId: viec.a1, usd: "0.02" });
			await gieoChiPhi({
				id: "a1-con",
				taskId: null,
				usd: "0.01",
				sessionId: `${phienGocCua(viec.a1)}-con`,
				phienCha: phienGocCua(viec.a1),
			});
			await gieoChiPhi({ id: "a2", taskId: viec.a2, usd: "0.012" });
			const sau = await soDoApi();
			expect(sau.bat.chiPhiMoiNhanUsd).toBe(TAY_BAT.chiPhiMoiNhanUsd);
			expect(sau.an.chiPhiMoiLuotUsd).toBe(TAY_AN.chiPhiMoiLuotUsd);
		},
		CHO_DB,
	);

	test(
		"okr.troLySoDo bằng năm câu SQL từng số, tách nấc, và bằng số viết tay",
		async () => {
			const api = await soDoApi();
			const sql = await soDoSql();
			console.log("so-do api:", JSON.stringify(api));
			console.log("so-do sql:", JSON.stringify(sql));
			expect(sql.bat.da_hien, "mau so tinh dong chua hien").toBe(
				TAY_BAT.daHien,
			);
			expect(sql.bat.chi_phi_moi_nhan_usd, "chi phi an vao ty so").toBe(
				TAY_BAT.chiPhiMoiNhanUsd,
			);
			expect(lechApiSql(api, sql)).toEqual([]);
			expect({ bat: api.bat, an: api.an }).toEqual({
				bat: TAY_BAT,
				an: TAY_AN,
			});
			expect(sql.bat.ngay_cham_tran).toBeNull();
			expect(
				(
					await goiRest(
						app,
						"GET",
						"/okr/assistant/metrics",
						{ thang: THANG },
						cQuanTri,
					)
				).data,
			).toEqual(api);
		},
		CHO_DB,
	);

	test(
		"thành viên và vai okr gọi troLySoDo → 403",
		async () => {
			for (const ma of ["bui-quang-huy", "giang-hai-yen", "nguyen-thi-lan"]) {
				const c = await phienMau(ma);
				expect((await goi(app, "okr.troLySoDo", "query", {}, c)).status).toBe(
					403,
				);
				expect(
					(await goiRest(app, "GET", "/okr/assistant/metrics", {}, c)).status,
				).toBe(403);
			}
		},
		CHO_DB,
	);
});
