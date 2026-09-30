import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import type {
	AlignmentTreeOutput,
	MucMoCoi,
	NutCanChinh,
} from "../src/okr/okr.contracts";
import type { DanhSachOutput } from "../src/okr/okr-xem.contracts";
import { type DauVaoHopLe, goiTrpc } from "./ma-tran-thu";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ketThucMau,
	mt,
	nguoi,
	ok,
	phienMau,
	type TraLoi,
} from "./tro-ly-okr-san";

const KY = idMau("chu-ky", "quy4");
const PHAP_CHE = idMau("pb", "phap-che");
const G = mt("q4-phap-che-3");
const G0 = `${idMau("mt", "u8d-g0")}`;
const LOC_RONG = { phuTrach: [], loai: [], trangThai: [], tuTin: [] };

const NGUOI = {
	v: "tran-quoc-bao",
	chu: "an-khanh-linh",
	n: "nguyen-thi-lan",
	qt: "le-hai-dang",
	them: "pham-thu-trang",
	roiKr: "lu-quoc-viet",
} as const;

type Muc = { id: string; hienThi?: string; soNguoiXem?: number };

let app: NestExpressApplication;
const phien: Record<string, string> = {};

async function hoi(
	ten: string,
	vao: DauVaoHopLe,
	cookie: string,
): Promise<TraLoi> {
	const res = await goiTrpc(app, ten, "query", vao, { cookie });
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

function phangCay(nut: NutCanChinh[]): Muc[] {
	return nut.flatMap((n) =>
		n.loai === "muc-tieu"
			? [
					{ id: n.objectiveId, hienThi: n.hienThi, soNguoiXem: n.soNguoiXem },
					...phangCay(n.children),
				]
			: phangCay(n.children),
	);
}

async function docDanhSach(thuTuc: string, ai: string): Promise<Muc[]> {
	const c = phien[ai] ?? "";
	if (thuTuc === "okr.mine")
		return ok<{ objectives: Muc[] }>(
			await hoi(thuTuc, { cycleId: KY }, c),
			thuTuc,
		).objectives;
	if (thuTuc === "okr.byUnit")
		return ok<{ objectives: Muc[] }>(
			await hoi(thuTuc, { cycleId: KY, unit: { loai: "pb", id: PHAP_CHE } }, c),
			thuTuc,
		).objectives;
	if (thuTuc === "okr.danhSach")
		return ok<DanhSachOutput>(
			await hoi(
				thuTuc,
				{ cycleId: KY, unit: { loai: "pb", id: PHAP_CHE }, loc: LOC_RONG },
				c,
			),
			thuTuc,
		).rows;
	if (thuTuc === "okr.alignmentTree") {
		const cay = ok<AlignmentTreeOutput>(
			await hoi(thuTuc, { cycleId: KY }, c),
			thuTuc,
		);
		return phangCay([...cay.roots, ...cay.chuaCanChinh]);
	}
	return ok<MucMoCoi[]>(await hoi(thuTuc, { cycleId: KY }, c), thuTuc).map(
		(m) => ({
			id: m.objectiveId,
			hienThi: m.hienThi,
			soNguoiXem: m.soNguoiXem,
		}),
	);
}

const MA_TRAN: readonly { thuTuc: string; ai: string; kyVong: number }[] = [
	{ thuTuc: "okr.mine", ai: "v", kyVong: 0 },
	{ thuTuc: "okr.mine", ai: "chu", kyVong: 2 },
	{ thuTuc: "okr.mine", ai: "n", kyVong: 0 },
	{ thuTuc: "okr.byUnit", ai: "v", kyVong: 1 },
	{ thuTuc: "okr.byUnit", ai: "chu", kyVong: 1 },
	{ thuTuc: "okr.byUnit", ai: "n", kyVong: 0 },
	{ thuTuc: "okr.danhSach", ai: "v", kyVong: 1 },
	{ thuTuc: "okr.danhSach", ai: "chu", kyVong: 1 },
	{ thuTuc: "okr.danhSach", ai: "n", kyVong: 0 },
	{ thuTuc: "okr.alignmentTree", ai: "v", kyVong: 1 },
	{ thuTuc: "okr.alignmentTree", ai: "chu", kyVong: 1 },
	{ thuTuc: "okr.alignmentTree", ai: "n", kyVong: 0 },
	{ thuTuc: "okr.moCoi", ai: "qt", kyVong: 1 },
];

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	for (const [khoa, ma] of Object.entries(NGUOI))
		phien[khoa] = await phienMau(ma);
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("danh-sach", () => {
	beforeAll(async () => {
		const g = await db.okrObjective.findUniqueOrThrow({
			where: { id: G },
			select: { publishedAt: true },
		});
		await db.okrNguoiXem.create({
			data: {
				objectiveId: G,
				userId: nguoi(NGUOI.them),
				createdById: nguoi(NGUOI.chu),
			},
		});
		await db.okrObjective.create({
			data: {
				id: G0,
				cycleId: KY,
				level: "onehub",
				ownerUserId: nguoi(NGUOI.chu),
				kind: "cam-ket",
				status: "cong-bo",
				hienThi: "gioi-han",
				title: "Mục tiêu công ty giới hạn của bài u8d",
				publishedAt: g.publishedAt,
				nguoiXem: {
					create: {
						userId: nguoi(NGUOI.v),
						createdById: nguoi(NGUOI.chu),
					},
				},
			},
		});
		await db.member.deleteMany({ where: { userId: nguoi(NGUOI.roiKr) } });
	}, CHO_DB);

	test(
		"ma trận 13 ô: số mục giới hạn đúng bảng viết trước, cờ khớp bảng, soNguoiXem khớp số hàng",
		async () => {
			const gioiHan = new Set(
				(
					await db.okrObjective.findMany({
						where: { hienThi: "gioi-han" },
						select: { id: true },
					})
				).map((r) => r.id),
			);
			const soHang = await db.okrNguoiXem.count({ where: { objectiveId: G } });
			expect(soHang).toBe(2);
			const ra: string[] = [];
			for (const o of MA_TRAN) {
				const muc = await docDanhSach(o.thuTuc, o.ai);
				const thieuCo = muc.filter((m) => m.hienThi === undefined);
				const coGioiHan = muc.filter((m) => m.hienThi === "gioi-han");
				const nen = muc.filter((m) => gioiHan.has(m.id));
				const soG = muc.find((m) => m.id === G)?.soNguoiXem;
				ra.push(
					`${o.thuTuc} ${o.ai}: gioi-han ${coGioiHan.length} ky vong ${o.kyVong}; thieu co ${thieuCo.length}; lech ${
						coGioiHan
							.map((m) => m.id)
							.sort()
							.join(",") ===
						nen
							.map((m) => m.id)
							.sort()
							.join(",")
							? 0
							: 1
					}${soG === undefined ? "" : `; soNguoiXem G ${soG}`}`,
				);
			}
			expect(ra).toEqual(
				MA_TRAN.map((o) => {
					const coG =
						o.kyVong > 0 &&
						!["okr.alignmentTree"].includes(o.thuTuc) &&
						!(o.thuTuc === "okr.mine" && o.ai !== "chu");
					return `${o.thuTuc} ${o.ai}: gioi-han ${o.kyVong} ky vong ${o.kyVong}; thieu co 0; lech 0${coG ? "; soNguoiXem G 2" : ""}`;
				}),
			);
		},
		CHO_DB,
	);
});
