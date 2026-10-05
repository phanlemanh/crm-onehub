import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { fieldKeyFromLabel } from "@crm/db/fields-shape";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { z } from "zod";
import { APP_AUTH } from "../agent/lib/app-auth";
import { createField } from "../agent/lib/fields";
import { FIELDS_AGENT } from "../agent/lib/fields-config";
import archiveField from "../agent/tools/archive_field";
import manageFields from "../agent/tools/manage_fields";
import { moXuong } from "./support/nhac-gieo";

const TIEN_TO = "r1e-";
const MOC = `r1e${Date.now().toString(36)}`;

type Vai = "owner" | "admin" | "member" | "okr" | "khong-thanh-vien";
type HanhDong = "create" | "update-brief" | "update-tay" | "archive";

const VAI: readonly Vai[] = [
	"owner",
	"admin",
	"member",
	"okr",
	"khong-thanh-vien",
];

let dem = 0;
const ma = (ten: string) => `${TIEN_TO}${MOC}-${ten}-${++dem}`;

type NguCanh = {
	session: {
		id: string;
		auth: {
			current: {
				authenticator: string;
				principalId: string;
				principalType: string;
				attributes: Record<string, string>;
			};
			initiator: null;
		};
	};
};

function ctxChat(userId: string, attributes: Record<string, string> = {}) {
	return {
		session: {
			id: ma("ses"),
			auth: {
				current: {
					authenticator: "crm-app",
					principalId: userId,
					principalType: "user",
					attributes,
				},
				initiator: null,
			},
		},
	} satisfies NguCanh;
}

function ctxNen() {
	return {
		session: {
			id: ma("ses"),
			auth: { current: { ...APP_AUTH, attributes: {} }, initiator: null },
		},
	} satisfies NguCanh;
}

async function gieoNguoi(vai: Vai | "khach"): Promise<string> {
	const id = ma(`u-${vai}`);
	await db.user.create({
		data: { id, name: id, email: `${id}@thu.test` },
	});
	if (vai !== "khong-thanh-vien") {
		await db.member.create({
			data: {
				id: `${id}-mem`,
				organizationId: WORKSPACE_ID,
				userId: id,
				role: vai,
				createdAt: new Date(),
			},
		});
	}
	return id;
}

async function gieoTruong(ten: string): Promise<string> {
	const nhan = `R1e ${MOC} ${ten} ${++dem}`;
	const tao = await createField({
		entity: "COMPANY",
		label: nhan,
		type: "TEXT",
	});
	if ("created" in tao) throw new Error(`gieo truong hong: ${tao.reason}`);
	return fieldKeyFromLabel(nhan);
}

async function docTruong(key: string) {
	return db.fieldDefinition.findUnique({
		where: { entity_key: { entity: "COMPANY", key } },
		select: { agentBrief: true, agentFilled: true, archivedAt: true },
	});
}

async function suKien(sessionId: string) {
	return db.agentEvent.findMany({
		where: { sessionId, type: FIELDS_AGENT.suKien },
		select: { data: true },
	});
}

const ketCongCu = z
	.object({
		created: z.boolean().optional(),
		updated: z.boolean().optional(),
		archived: z.boolean().optional(),
		reason: z.string().optional(),
	})
	.loose();

const suKienDayDu = z.object({
	hanhDong: z.string(),
	vai: z.string(),
	ketQua: z.string(),
	lyDo: z.string().optional(),
});

const duLieuSuKien = z.object({
	hanhDong: z.string(),
	vai: z.string(),
	ketQua: z.string(),
});

function docKet(k: z.infer<typeof ketCongCu>) {
	const tuChoi =
		k.reason !== undefined &&
		(k.created === false || k.updated === false || k.archived === false);
	return { tuChoi, reason: k.reason ?? null };
}

async function chay(hanhDong: HanhDong, ctx: NguCanh) {
	if (hanhDong === "create") {
		const nhan = `R1e ${MOC} tao ${++dem}`;
		const ra = await manageFields.execute(
			{ action: "create", entity: "COMPANY", label: nhan, type: "TEXT" },
			ctx as never,
		);
		const truong = await docTruong(fieldKeyFromLabel(nhan));
		return { ket: docKet(ketCongCu.parse(ra)), doi: truong !== null };
	}
	const key = await gieoTruong(hanhDong);
	const truoc = await docTruong(key);
	const ra =
		hanhDong === "archive"
			? await archiveField.execute({ entity: "COMPANY", key }, ctx as never)
			: await manageFields.execute(
					hanhDong === "update-brief"
						? {
								action: "update-brief",
								entity: "COMPANY",
								key,
								agentBrief: "moi",
							}
						: {
								action: "update-brief",
								entity: "COMPANY",
								key,
								agentFilled: false,
							},
					ctx as never,
				);
	const sau = await docTruong(key);
	const doi =
		sau?.agentBrief !== truoc?.agentBrief ||
		sau?.agentFilled !== truoc?.agentFilled ||
		(sau?.archivedAt ?? null) !== (truoc?.archivedAt ?? null);
	return { ket: docKet(ketCongCu.parse(ra)), doi };
}

async function kiemO(
	ten: string,
	hanhDong: HanhDong,
	ctx: NguCanh,
	duocLam: boolean,
	vaiSuKien: string,
): Promise<string[]> {
	const sai: string[] = [];
	const { ket, doi } = await chay(hanhDong, ctx);
	if (duocLam) {
		if (ket.tuChoi || !doi) sai.push(`ca-truong: ${ten} khong lam duoc`);
	} else {
		if (doi) sai.push(`ca-truong: ${ten}`);
		if (!ket.tuChoi || ket.reason !== FIELDS_AGENT.tuChoi) {
			sai.push(`ca-truong: ${ten} sai cau tu choi (${ket.reason})`);
		}
	}
	const hang = await suKien(ctx.session.id);
	const mong = {
		hanhDong: hanhDong === "update-tay" ? "update-brief" : hanhDong,
		vai: vaiSuKien,
		ketQua: duocLam ? "lam" : "tu-choi",
	};
	const khop = hang.filter((h) => {
		const d = duLieuSuKien.parse(h.data);
		return (
			d.hanhDong === mong.hanhDong &&
			d.vai === mong.vai &&
			d.ketQua === mong.ketQua
		);
	});
	if (hang.length !== 1 || khop.length !== 1) {
		sai.push(
			`ca-truong-su-kien: ${ten} co ${hang.length} hang, khop ${khop.length}`,
		);
	}
	return sai;
}

const nguoi = new Map<Vai, string>();

async function nguoiCua(vai: Vai): Promise<string> {
	const co = nguoi.get(vai);
	if (co) return co;
	const id = await gieoNguoi(vai);
	nguoi.set(vai, id);
	return id;
}

beforeAll(async () => {
	await moXuong();
});

afterAll(async () => {
	await db.agentEvent.deleteMany({
		where: { sessionId: { startsWith: `${TIEN_TO}${MOC}` } },
	});
	await db.fieldDefinition.deleteMany({
		where: { key: { startsWith: fieldKeyFromLabel(`R1e ${MOC}`) } },
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${TIEN_TO}${MOC}` } },
	});
	await db.user.deleteMany({
		where: { id: { startsWith: `${TIEN_TO}${MOC}` } },
	});
});

describe("ca-truong-tao", () => {
	test("ca-truong-tao: ma tran 5 vai x 3 hanh dong viet truoc, chi owner/admin doi duoc", async () => {
		const O = VAI.flatMap((vai) =>
			(["create", "update-brief", "update-tay"] as const).map((h) => ({
				vai,
				h,
			})),
		);
		expect(O.length).toBe(15);
		const sai: string[] = [];
		for (const { vai, h } of O) {
			const quyen = vai === "owner" || vai === "admin";
			const nhanDo =
				h === "create"
					? `${vai} doi duoc truong (create)`
					: `${vai} doi duoc truong (${h})`;
			sai.push(
				...(await kiemO(nhanDo, h, ctxChat(await nguoiCua(vai)), quyen, vai)),
			);
		}
		expect(sai).toEqual([]);
	});

	test("ca-truong-tao: vai la trong hang member bi coi la member va bi tu choi", async () => {
		const id = await gieoNguoi("khach");
		expect(
			await kiemO(
				"vai-la doi duoc truong (create)",
				"create",
				ctxChat(id),
				false,
				"member",
			),
		).toEqual([]);
	});
});

describe("ca-truong-luu-tru", () => {
	test("ca-truong-luu-tru: ma tran 5 vai, chi owner/admin luu tru duoc", async () => {
		expect(VAI.length).toBe(5);
		const sai: string[] = [];
		for (const vai of VAI) {
			const quyen = vai === "owner" || vai === "admin";
			sai.push(
				...(await kiemO(
					`${vai} luu tru duoc truong`,
					"archive",
					ctxChat(await nguoiCua(vai)),
					quyen,
					vai,
				)),
			);
		}
		expect(sai).toEqual([]);
	});

	test("ca-truong-luu-tru: van hoi duyet voi owner, tu choi khi chay nen", async () => {
		const duyet = archiveField.approval as unknown as (a: {
			session: NguCanh["session"];
		}) => unknown;
		expect(duyet({ session: ctxChat(await nguoiCua("owner")).session })).toBe(
			"user-approval",
		);
		expect(duyet({ session: ctxNen().session })).toMatchObject({
			type: "denied",
		});
	});
});

describe("ca-truong-phien-may", () => {
	test("ca-truong-phien-may: 2 khung x 3 viec viet truoc, deu bi tu choi", async () => {
		const owner = await nguoiCua("owner");
		const KHUNG = [
			() => ctxNen(),
			() => ctxChat(owner, { purpose: "team-agent" }),
		] as const;
		const VIEC = ["create", "update-brief", "archive"] as const;
		const O = KHUNG.flatMap((k) => VIEC.map((v) => ({ k, v })));
		expect(O.length).toBe(6);
		const sai: string[] = [];
		for (const { k, v } of O) {
			sai.push(
				...(await kiemO(
					`phien tu dong doi duoc truong (${v})`,
					v,
					k(),
					false,
					"tu-dong",
				)),
			);
		}
		expect(sai).toEqual([]);
	});
});

describe("ca-truong-su-kien", () => {
	test("ca-truong-su-kien: moi lan chay ghi dung mot hang dung vai va ket qua", async () => {
		const O = [
			{ vai: "owner", h: "create", quyen: true },
			{ vai: "member", h: "create", quyen: false },
			{ vai: "okr", h: "archive", quyen: false },
			{ vai: "khong-thanh-vien", h: "update-brief", quyen: false },
		] as const;
		expect(O.length).toBe(4);
		const sai: string[] = [];
		for (const { vai, h, quyen } of O) {
			sai.push(
				...(await kiemO(
					`su kien ${vai} ${h}`,
					h,
					ctxChat(await nguoiCua(vai)),
					quyen,
					vai,
				)),
			);
		}
		sai.push(
			...(await kiemO("su kien tu-dong", "create", ctxNen(), false, "tu-dong")),
		);
		expect(sai).toEqual([]);
	});
});

describe("ca-truong-su-kien", () => {
	test("ca-truong-su-kien: quan tri chay ma khong ghi duoc gi thi la tu-choi khong-ghi-duoc, khong phai lam", async () => {
		const admin = await nguoiCua("admin");
		const daCo = await gieoTruong("trung");
		const nhanTrung = (
			await db.fieldDefinition.findUniqueOrThrow({
				where: { entity_key: { entity: "COMPANY", key: daCo } },
				select: { label: true },
			})
		).label;
		const O = [
			{
				ten: "tao trung khoa",
				chay: (ctx: NguCanh) =>
					manageFields.execute(
						{
							action: "create",
							entity: "COMPANY",
							label: nhanTrung,
							type: "TEXT",
						},
						ctx as never,
					),
			},
			{
				ten: "tao thieu loai",
				chay: (ctx: NguCanh) =>
					manageFields.execute(
						{ action: "create", entity: "COMPANY", label: `R1e ${MOC} thieu` },
						ctx as never,
					),
			},
			{
				ten: "doi khong co khoa",
				chay: (ctx: NguCanh) =>
					manageFields.execute(
						{ action: "update-brief", entity: "COMPANY", agentBrief: "x" },
						ctx as never,
					),
			},
			{
				ten: "doi truong khong ton tai",
				chay: (ctx: NguCanh) =>
					manageFields.execute(
						{
							action: "update-brief",
							entity: "COMPANY",
							key: `${fieldKeyFromLabel(`R1e ${MOC}`)}_khong_co`,
							agentBrief: "x",
						},
						ctx as never,
					),
			},
			{
				ten: "luu tru truong khong ton tai",
				chay: (ctx: NguCanh) =>
					archiveField.execute(
						{
							entity: "COMPANY",
							key: `${fieldKeyFromLabel(`R1e ${MOC}`)}_khong_co`,
						},
						ctx as never,
					),
			},
		] as const;
		expect(O.length).toBe(5);
		const sai: string[] = [];
		for (const o of O) {
			const ctx = ctxChat(admin);
			await o.chay(ctx);
			const hang = (await suKien(ctx.session.id)).map((h) =>
				suKienDayDu.parse(h.data),
			);
			const dung =
				hang.length === 1 &&
				hang[0]?.ketQua === "tu-choi" &&
				hang[0]?.lyDo === "khong-ghi-duoc" &&
				hang[0]?.vai === "admin";
			if (!dung) {
				sai.push(
					`ca-truong-su-kien: ${o.ten} ghi ${JSON.stringify(hang)} thay vi mot hang tu-choi khong-ghi-duoc`,
				);
			}
		}
		expect(sai).toEqual([]);
	});
});
