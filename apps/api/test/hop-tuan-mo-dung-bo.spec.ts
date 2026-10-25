import { describe, expect, test } from "bun:test";
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
import { orgTreeOutput } from "../src/to-chuc/to-chuc.contracts";
import {
	bpMoi,
	datViTri,
	doc,
	dungSan,
	goi,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
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
