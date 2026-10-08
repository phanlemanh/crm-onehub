import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db, type Prisma } from "@crm/db";
import { GIAI_DOAN, GIAI_DOAN_GOC, type LoaiGiaiDoan } from "@crm/db/giai-doan";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ActivitiesService } from "../src/activities/activities.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { GiaiDoanService } from "../src/giai-doan/giai-doan.service";
import { GIAI_DOAN_API } from "../src/giai-doan/giai-doan-config";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "giai-doan-spec";
const domain = `giai-doan-${suffix}.test`;
const userId = `user-gdtt-${suffix}`;
const tienTo = `gdtt-${suffix}`;

const agent = {
	withCrmEvents: withDiscardedCrmEvents,
} as unknown as AgentTriggerService;

const stamp = new ActivityStampService(db);
const deals = new DealsService(
	db,
	agent,
	stamp,
	new ConversionService(db),
	new FieldsService(db, { fieldBackfill: async () => undefined } as never),
);
const activities = new ActivitiesService(db, stamp);

type SuKien = {
	type: string;
	record: { id: string };
	data: { companyId?: string; from?: string | null; to?: string };
};
const phat: SuKien[] = [];
const agentDem = {
	withCrmEvents: async <T>(
		work: (
			tx: Prisma.TransactionClient,
			emit: (input: SuKien) => Promise<void>,
		) => Promise<T>,
	) => {
		const tam: SuKien[] = [];
		const kq = await db.$transaction((tx) =>
			work(tx, async (e) => {
				tam.push(e);
			}),
		);
		phat.push(...tam);
		return kq;
	},
} as unknown as AgentTriggerService;
const giaiDoan = new GiaiDoanService(
	db,
	agentDem,
	new DealsService(
		db,
		agentDem,
		stamp,
		new ConversionService(db),
		new FieldsService(db, { fieldBackfill: async () => undefined } as never),
	),
);

let companyId = "";
const moi = { OPEN: "", WON: "", LOST: "" } satisfies Record<
	LoaiGiaiDoan,
	string
>;

async function taoGiaiDoan(kind: LoaiGiaiDoan, ten: string, position = 50) {
	const g = await db.dealStage.create({
		data: {
			id: `${tienTo}-${ten}`,
			label: `${ten} ${suffix}`,
			kind,
			position,
		},
		select: { id: true },
	});
	return g.id;
}

async function taoThoaThuan(stage: string, ten = "Thoả thuận") {
	const d = await db.deal.create({
		data: { name: `${ten} ${suffix}`, companyId, ownerId: userId, stage },
		select: { id: true },
	});
	return d.id;
}

async function don() {
	await db.activity.deleteMany({ where: { company: { domain } } });
	await db.deal.deleteMany({ where: { company: { domain } } });
	await db.company.deleteMany({ where: { domain } });
	await db.dealStage.deleteMany({
		where: {
			OR: [{ id: { startsWith: tienTo } }, { label: { endsWith: suffix } }],
		},
	});
	await db.member.deleteMany({ where: { userId } });
	await db.user.deleteMany({ where: { id: userId } });
}

beforeAll(async () => {
	await don();
	await db.user.create({
		data: {
			id: userId,
			name: "Người thử",
			email: `${userId}@example.test`,
			emailVerified: true,
		},
	});
	await gieoThanhVien(userId, "owner");
	companyId = (
		await db.company.create({
			data: { name: `Công ty ${suffix}`, domain },
			select: { id: true },
		})
	).id;
	moi.OPEN = await taoGiaiDoan("OPEN", "mo");
	moi.WON = await taoGiaiDoan("WON", "chot");
	moi.LOST = await taoGiaiDoan("LOST", "thua");
});

afterAll(don);

async function doc(id: string) {
	return db.deal.findUniqueOrThrow({
		where: { id },
		select: { stage: true, closedAt: true, closedReason: true },
	});
}

describe("theo-loai", () => {
	it("chuyen vao tung loai hanh xu theo kind cua giai doan moi", async () => {
		const a = await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED);

		await deals.setStage({ id: a, stage: moi.WON }, userId);
		expect((await doc(a)).closedAt, "OPEN->WON moi: closedAt").not.toBeNull();

		await deals.setStage({ id: a, stage: moi.OPEN }, userId);
		const mo = await doc(a);
		expect([mo.closedAt, mo.closedReason], "WON moi->OPEN moi").toEqual([
			null,
			null,
		]);

		await expect(
			deals.setStage({ id: a, stage: moi.LOST }, userId),
			"LOST moi khong ly do duoc chap nhan",
		).rejects.toThrow("Say why");
		expect((await doc(a)).stage).toBe(moi.OPEN);

		await deals.setStage(
			{ id: a, stage: moi.LOST, closedReason: "Hết nhu cầu" },
			userId,
		);
		const thua = await doc(a);
		expect(thua.closedReason).toBe("Hết nhu cầu");
		expect(thua.closedAt).not.toBeNull();

		await deals.setStage({ id: a, stage: GIAI_DOAN_GOC.DEMO_BOOKED }, userId);
		const goc = await doc(a);
		expect([goc.closedAt, goc.closedReason], "LOST moi->OPEN goc").toEqual([
			null,
			null,
		]);
	});

	it("tao moi khong chon giai doan vao OPEN dau tien, ke ca sau khi sap lai", async () => {
		const dau = await db.dealStage.findFirstOrThrow({
			where: { kind: "OPEN", archivedAt: null },
			orderBy: { position: "asc" },
			select: { id: true, position: true },
		});
		const a = await deals.create({
			name: `Tạo mới ${suffix}`,
			companyId,
			ownerId: userId,
		});
		expect((await doc(a.id)).stage).toBe(dau.id);

		await db.dealStage.update({
			where: { id: moi.OPEN },
			data: { position: dau.position - 1 },
		});
		try {
			const b = await deals.create({
				name: `Tạo mới sau sắp ${suffix}`,
				companyId,
				ownerId: userId,
			});
			expect((await doc(b.id)).stage).toBe(moi.OPEN);
		} finally {
			await db.dealStage.update({
				where: { id: moi.OPEN },
				data: { position: 50 },
			});
		}
	});

	it("bulkSetStage vao LOST moi bat ly do", async () => {
		const ids = [
			await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Lô 1"),
			await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Lô 2"),
		];
		await expect(
			deals.bulkSetStage({ ids, stage: moi.LOST }, userId),
			"bulkSetStage LOST moi khong ly do duoc chap nhan",
		).rejects.toThrow("Say why");
		for (const id of ids) {
			expect((await doc(id)).stage).toBe(GIAI_DOAN_GOC.DEMO_BOOKED);
		}

		await deals.bulkSetStage(
			{ ids, stage: moi.LOST, closedReason: "Đổi hướng" },
			userId,
		);
		for (const id of ids) {
			const d = await doc(id);
			expect(d.closedAt).not.toBeNull();
			expect(d.closedReason).toBe("Đổi hướng");
		}
	});
});

describe("timeline-meta-hong", () => {
	it("meta null hoac sai hinh tra stageChange null, khong nem", async () => {
		const a = await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Meta hỏng");
		for (const meta of [null, { foo: 1 }]) {
			await db.activity.create({
				data: {
					type: "STAGE_CHANGE",
					subject: "Stage changed",
					companyId,
					dealId: a,
					createdById: userId,
					meta: meta ?? undefined,
				},
			});
		}
		const { entries } = await activities.timeline({
			dealId: a,
			limit: 10,
			filter: "all",
		} as never);
		expect(entries).toHaveLength(2);
		expect(entries.map((e) => e.stageChange)).toEqual([null, null]);
	});
});

async function songCuaLoai(kind: LoaiGiaiDoan) {
	return (
		await db.dealStage.findMany({
			where: { kind, archivedAt: null },
			orderBy: { position: "asc" },
			select: { id: true },
		})
	).map((g) => g.id);
}

async function boardCot() {
	const board = await deals.board({
		q: "",
		owner: [],
		closing: [],
		fields: {},
		dir: "asc",
	} as never);
	return board.columns.map((c) => c.stage);
}

async function loiCua(p: Promise<unknown>): Promise<string> {
	try {
		await p;
		return "";
	} catch (error) {
		return error instanceof Error ? error.message : String(error);
	}
}

describe("tao", () => {
	it("moi loai: giai doan moi dung cuoi, thanh cot board, nhan thoa thuan", async () => {
		for (const kind of ["OPEN", "WON", "LOST"] as const) {
			const { id } = await giaiDoan.create(userId, {
				label: `Tạo ${kind} ${suffix}`,
				kind,
			});
			const cua = await songCuaLoai(kind);
			expect(
				cua.at(-1),
				`${kind}: giai doan moi o vi tri ${cua.indexOf(id)} != cuoi`,
			).toBe(id);
			expect(
				(await giaiDoan.list(userId)).stages.some((g) => g.id === id),
			).toBe(true);
			expect(await boardCot()).toContain(id);
			const a = await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, `Tạo ${kind}`);
			await deals.setStage(
				{
					id: a,
					stage: id,
					closedReason: kind === "LOST" ? "Lý do" : undefined,
				},
				userId,
			);
			expect((await doc(a)).stage).toBe(id);
		}
	});
});

describe("doi-ten", () => {
	it("nhan moi o list, board va ca lich su ghi truoc khi doi", async () => {
		const { id } = await giaiDoan.create(userId, {
			label: `Cũ ${suffix}`,
			kind: "OPEN",
		});
		const a = await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Đổi tên");
		await deals.setStage({ id: a, stage: id }, userId);
		const moiTen = `Đã ký hợp đồng ${suffix}`;
		await giaiDoan.rename(userId, { id, label: moiTen });
		expect(
			(await giaiDoan.list(userId)).stages.find((g) => g.id === id)?.label,
		).toBe(moiTen);
		const { entries } = await activities.timeline({
			dealId: a,
			limit: 10,
			filter: "all",
		} as never);
		const nhan = entries.find((e) => e.stageChange?.to.id === id)?.stageChange
			?.to.label;
		expect(nhan, `timeline: to.label ${nhan} != ${moiTen}`).toBe(moiTen);
	});
});

describe("sap-xep", () => {
	it("dung va du thi doi thu tu; lech thi tu choi va khong doi", async () => {
		await giaiDoan.create(userId, { label: `Sắp A ${suffix}`, kind: "OPEN" });
		const cu = await songCuaLoai("OPEN");
		const dao = [...cu].reverse();
		await giaiDoan.reorder(userId, { kind: "OPEN", ids: dao });
		expect(await songCuaLoai("OPEN")).toEqual(dao);
		expect((await boardCot()).filter((id) => dao.includes(id))).toEqual(dao);
		await giaiDoan.reorder(userId, { kind: "OPEN", ids: cu });

		const won = await songCuaLoai("WON");
		const ca: [string, string[]][] = [
			["thieu mot id", cu.slice(1)],
			["thua mot id la", [...cu, "khong-co"]],
			["trung mot id", [...cu.slice(1), cu[1] as string]],
			["lan mot id WON", [...cu.slice(1), won[0] as string]],
		];
		let chay = 0;
		for (const [ten, ids] of ca) {
			const loi = await loiCua(giaiDoan.reorder(userId, { kind: "OPEN", ids }));
			expect(loi, `${ten}: reorder duoc chap nhan`).toBe(
				GIAI_DOAN_API.messages.danhSachLech,
			);
			expect(await songCuaLoai("OPEN")).toEqual(cu);
			chay += 1;
		}
		const loiKind = await loiCua(
			giaiDoan.reorder(userId, { kind: "WON", ids: cu }),
		);
		expect(loiKind, "kind WON voi id OPEN: reorder duoc chap nhan").toBe(
			GIAI_DOAN_API.messages.danhSachLech,
		);
		chay += 1;
		expect(chay).toBe(5);
	});
});

describe("xoa-trong", () => {
	it("an khoi list va board, chan tao/chuyen/chuyen lo, lich su giu nhan", async () => {
		const nhanG = `Trống ${suffix}`;
		const { id } = await giaiDoan.create(userId, {
			label: nhanG,
			kind: "OPEN",
		});
		const a = await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Từng ở G");
		await deals.setStage({ id: a, stage: id }, userId);
		await deals.setStage({ id: a, stage: GIAI_DOAN_GOC.DEMO_BOOKED }, userId);
		const truocXoa = await loiCua(deals.setStage({ id: a, stage: id }, userId));
		expect(truocXoa, "doi chung: truoc khi xoa setStage duoc").toBe("");
		await deals.setStage({ id: a, stage: GIAI_DOAN_GOC.DEMO_BOOKED }, userId);
		await giaiDoan.archive(userId, { id });

		expect((await giaiDoan.list(userId)).stages.some((g) => g.id === id)).toBe(
			false,
		);
		expect(await boardCot()).not.toContain(id);
		expect(
			await loiCua(
				deals.create({ name: "x", companyId, ownerId: userId, stage: id }),
			),
			"tao vao giai doan da xoa duoc chap nhan",
		).toBe(GIAI_DOAN_API.messages.khongCo);
		expect(
			await loiCua(deals.setStage({ id: a, stage: id }, userId)),
			"setStage vao giai doan da xoa duoc chap nhan",
		).toBe(GIAI_DOAN_API.messages.khongCo);
		const lo = [
			await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Lô G1"),
			await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Lô G2"),
		];
		expect(
			await loiCua(deals.bulkSetStage({ ids: lo, stage: id }, userId)),
			"bulkSetStage vao giai doan da xoa duoc chap nhan",
		).toBe(GIAI_DOAN_API.messages.khongCo);
		for (const d of lo) {
			expect((await doc(d)).stage).toBe(GIAI_DOAN_GOC.DEMO_BOOKED);
		}
		const { entries } = await activities.timeline({
			dealId: a,
			limit: 20,
			filter: "all",
		} as never);
		expect(
			entries.some(
				(e) =>
					e.stageChange?.from?.id === id && e.stageChange.from.label === nhanG,
			),
		).toBe(true);
	});
});

describe("xoa-chuyen", () => {
	it("dem gom luu tru; dich sai tu choi; dich dung chuyen nguyen tu co su kien", async () => {
		const S = (
			await giaiDoan.create(userId, { label: `Nguồn ${suffix}`, kind: "LOST" })
		).id;
		const T = (
			await giaiDoan.create(userId, {
				label: `Chỉ lưu trữ ${suffix}`,
				kind: "LOST",
			})
		).id;
		const D = (
			await giaiDoan.create(userId, { label: `Đích ${suffix}`, kind: "LOST" })
		).id;
		const ids: string[] = [];
		for (const [i, luuTru] of [false, false, true].entries()) {
			const d = await db.deal.create({
				data: {
					name: `S${i} ${suffix}`,
					companyId,
					ownerId: userId,
					stage: S,
					closedAt: new Date("2026-09-01T00:00:00Z"),
					closedReason: `Lý do ${i}`,
					archivedAt: luuTru ? new Date() : null,
				},
			});
			ids.push(d.id);
		}
		ids.sort();
		await db.deal.create({
			data: {
				name: `T ${suffix}`,
				companyId,
				ownerId: userId,
				stage: T,
				archivedAt: new Date(),
			},
		});
		const list = (await giaiDoan.list(userId)).stages;
		const demS = list.find((g) => g.id === S)?.dealCount;
		expect(demS, `S: count ${demS} != 3`).toBe(3);
		expect(list.find((g) => g.id === T)?.dealCount, "T: count").toBe(1);

		const chup = async () => ({
			deals: await db.deal.findMany({
				where: { id: { in: ids } },
				orderBy: { id: "asc" },
				select: { stage: true, closedAt: true, closedReason: true },
			}),
			act: await db.activity.count({ where: { dealId: { in: ids } } }),
			nguon: (await db.dealStage.findUniqueOrThrow({ where: { id: S } }))
				.archivedAt,
		});
		const truoc = await chup();
		const moTam = await songCuaLoai("OPEN");
		const daXoa = (
			await giaiDoan.create(userId, { label: `Đã xoá ${suffix}`, kind: "LOST" })
		).id;
		await giaiDoan.archive(userId, { id: daXoa });
		const ca: [string, string | undefined][] = [
			["khong moveTo", undefined],
			["moveTo loai OPEN", moTam[0]],
			["moveTo chinh no", S],
			["moveTo da xoa", daXoa],
		];
		for (const [ten, moveTo] of ca) {
			const loi = await loiCua(giaiDoan.archive(userId, { id: S, moveTo }));
			expect(loi, `${ten}: duoc chap nhan`).not.toBe("");
			expect(await chup(), `${ten}: du lieu doi`).toEqual(truoc);
		}

		const cuoi = ids.at(-1) as string;
		await db.$executeRawUnsafe(
			`CREATE OR REPLACE FUNCTION gdtt_loi() RETURNS trigger AS $$ BEGIN IF NEW.id = '${cuoi}' AND NEW.stage <> OLD.stage THEN RAISE EXCEPTION 'gdtt loi tiem'; END IF; RETURN NEW; END $$ LANGUAGE plpgsql`,
		);
		await db.$executeRawUnsafe(
			"CREATE TRIGGER gdtt_loi BEFORE UPDATE ON deal FOR EACH ROW EXECUTE FUNCTION gdtt_loi()",
		);
		const phatTruoc = phat.length;
		try {
			expect(
				await loiCua(giaiDoan.archive(userId, { id: S, moveTo: D })),
			).toContain("gdtt loi tiem");
		} finally {
			await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS gdtt_loi ON deal");
			await db.$executeRawUnsafe("DROP FUNCTION IF EXISTS gdtt_loi()");
		}
		const sau = await chup();
		const daDoi = sau.deals.filter((d) => d.stage === D).length;
		expect(sau, `nguyen tu: ${daDoi} thoa thuan da doi sau loi`).toEqual(truoc);
		expect(phat.length - phatTruoc, "nguyen tu: su kien").toBe(0);

		await giaiDoan.archive(userId, { id: S, moveTo: D });
		const xong = await chup();
		expect(xong.deals.map((d) => d.stage)).toEqual([D, D, D]);
		expect(xong.deals.map((d) => [d.closedAt, d.closedReason])).toEqual(
			truoc.deals.map((d) => [d.closedAt, d.closedReason]),
		);
		expect(xong.nguon).not.toBeNull();
		for (const id of ids) {
			const dong = await db.activity.findMany({
				where: { dealId: id, type: "STAGE_CHANGE" },
				select: { meta: true },
			});
			expect(dong).toEqual([{ meta: { from: S, to: D } }]);
		}
		const suKien = phat
			.slice(phatTruoc)
			.filter((e) => e.type === "deal.stage.changed");
		expect(suKien.length, `su kien ${suKien.length} != 3`).toBe(3);
		expect(
			suKien.map((e) => [e.record.id, e.data.from, e.data.to]).sort(),
		).toEqual(ids.map((id) => [id, S, D]).sort());
	});
});

describe("bat-bien", () => {
	it("tu choi dung ly do va khong doi gi; doi chung duong duoc nhan", async () => {
		const M = GIAI_DOAN_API.messages;
		const dem = async () => db.dealStage.count({ where: { archivedAt: null } });

		for (const kind of ["OPEN", "WON", "LOST"] as const) {
			const giu = (
				await giaiDoan.create(userId, {
					label: `Còn một ${kind} ${suffix}`,
					kind,
				})
			).id;
			const khac = (await songCuaLoai(kind)).filter((id) => id !== giu);
			await db.dealStage.updateMany({
				where: { id: { in: khac } },
				data: { archivedAt: new Date() },
			});
			try {
				const truoc = await dem();
				expect(
					await loiCua(giaiDoan.archive(userId, { id: giu })),
					`xoa ${kind} cuoi cung duoc chap nhan`,
				).toBe(M.cuoiCung);
				expect(await dem()).toBe(truoc);
			} finally {
				await db.dealStage.updateMany({
					where: { id: { in: khac } },
					data: { archivedAt: null },
				});
			}
			await giaiDoan.archive(userId, { id: giu });
		}

		const truoc = await dem();
		const ca: [string, string, string][] = [
			["nhan rong", "   ", ""],
			["nhan 41 ky tu", "a".repeat(41), ""],
			["nhan trung khac hoa thuong", "closed WON", M.trung],
			["nhan trung sau khi cat khoang trang", "  Closed won  ", M.trung],
		];
		for (const [ten, label, thongDiep] of ca) {
			const loi = await loiCua(
				giaiDoan.create(userId, { label, kind: "OPEN" }),
			);
			expect(loi, `${ten} duoc chap nhan`).not.toBe("");
			if (thongDiep) expect(loi, ten).toBe(thongDiep);
			expect(await dem()).toBe(truoc);
		}
		const bon = (
			await giaiDoan.create(userId, { label: "b".repeat(40), kind: "OPEN" })
		).id;

		const them: string[] = [bon];
		while ((await dem()) < 20) {
			them.push(
				(
					await giaiDoan.create(userId, {
						label: `Lấp ${them.length} ${suffix}`,
						kind: "OPEN",
					})
				).id,
			);
		}
		expect(await dem(), "them cai thu 20 duoc nhan").toBe(20);
		expect(
			await loiCua(
				giaiDoan.create(userId, { label: `Thứ 21 ${suffix}`, kind: "OPEN" }),
			),
		).toBe(M.tran);
		expect(await dem()).toBe(20);
		await db.dealStage.updateMany({
			where: { id: { in: them } },
			data: { archivedAt: new Date() },
		});

		const nguon = readFileSync(
			join(import.meta.dir, "..", "src", "generated", "server.ts"),
			"utf8",
		);
		const khoi =
			nguon
				.split("giaiDoan: t.router({")[1]
				?.split(/\n {2}\w+: t\.router\(/)[0] ?? "";
		const mutation = [
			...khoi.matchAll(
				/\n {4}(\w+): publicProcedure[\s\S]*?\.(mutation|query)\(/g,
			),
		]
			.filter((m) => m[2] === "mutation")
			.map((m) => m[1] as string)
			.filter((ten) => ten !== "create" && ten !== "reorder")
			.sort();
		expect(mutation, "danh sach mutation giaiDoan").toEqual([
			"archive",
			"rename",
			"restore",
		]);
		for (const ten of mutation) {
			const { id } = await giaiDoan.create(userId, {
				label: `Kind lạ ${ten} ${suffix}`,
				kind: "OPEN",
			});
			const input =
				ten === "rename" ? { id, label: `Kind lạ đổi ${suffix}` } : { id };
			if (ten === "rename") {
				await giaiDoan.rename(userId, { ...input, kind: "WON" } as never);
			} else if (ten === "restore") {
				await giaiDoan.archive(userId, { id });
				await giaiDoan.restore(userId, { ...input, kind: "WON" } as never);
			} else {
				await giaiDoan.archive(userId, { ...input, kind: "WON" } as never);
			}
			const kind = (await db.dealStage.findUniqueOrThrow({ where: { id } }))
				.kind;
			expect(kind, `${ten}: kind OPEN -> ${kind}`).toBe("OPEN");
		}
	});
});

describe("dong-thoi", () => {
	const ngu = (ms: number) => new Promise((r) => setTimeout(r, ms));

	it("hai lan tao dong thoi khong lot nhan trung khac hoa thuong", async () => {
		const ket = await Promise.allSettled([
			giaiDoan.create(userId, { label: `Đàm phán ${suffix}`, kind: "OPEN" }),
			giaiDoan.create(userId, { label: `đàm phán ${suffix}`, kind: "OPEN" }),
		]);
		const duoc = ket.filter((k) => k.status === "fulfilled").length;
		expect(duoc, `dong thoi: ${duoc} nhan trung duoc tao`).toBe(1);
	});

	it("hai lan tao dong thoi o 19 giai doan khong vuot tran", async () => {
		const dem = async () => db.dealStage.count({ where: { archivedAt: null } });
		const them: string[] = [];
		while ((await dem()) < 19) {
			them.push(
				(
					await giaiDoan.create(userId, {
						label: `Lấp đồng thời ${them.length} ${suffix}`,
						kind: "OPEN",
					})
				).id,
			);
		}
		try {
			await Promise.allSettled([
				giaiDoan.create(userId, { label: `Hai A ${suffix}`, kind: "OPEN" }),
				giaiDoan.create(userId, { label: `Hai B ${suffix}`, kind: "OPEN" }),
			]);
			const sau = await dem();
			expect(sau, `dong thoi: tran ${sau} > 20`).toBe(20);
		} finally {
			await db.dealStage.updateMany({
				where: { label: { endsWith: suffix }, archivedAt: null },
				data: { archivedAt: new Date() },
			});
		}
	});

	it("tao thoa thuan vao giai doan dang bi xoa bi tu choi sau khi xoa commit", async () => {
		const G = (
			await giaiDoan.create(userId, {
				label: `Đang xoá ${suffix}`,
				kind: "OPEN",
			})
		).id;
		const giu = db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "dealStage" WHERE id = ${G} FOR UPDATE`;
			await tx.dealStage.update({
				where: { id: G },
				data: { archivedAt: new Date() },
			});
			await ngu(400);
		});
		await ngu(100);
		const tao = loiCua(
			deals.create({
				name: `Đua ${suffix}`,
				companyId,
				ownerId: userId,
				stage: G,
			}),
		);
		await giu;
		expect(
			await tao,
			"dong thoi: thoa thuan roi vao giai doan vua bi xoa",
		).toBe(GIAI_DOAN_API.messages.khongCo);
	});

	it("xoa co chuyen chay voi thoi han rieng cua GIAI_DOAN_API", async () => {
		const tuyChon: { timeout?: number }[] = [];
		const agentBat = {
			withCrmEvents: async <T>(
				work: (
					tx: Prisma.TransactionClient,
					emit: () => Promise<void>,
				) => Promise<T>,
				opts?: { timeout?: number },
			) => {
				tuyChon.push(opts ?? {});
				return db.$transaction((tx) => work(tx, async () => undefined), opts);
			},
		} as unknown as AgentTriggerService;
		const rieng = new GiaiDoanService(db, agentBat, deals);
		const { id } = await giaiDoan.create(userId, {
			label: `Thời hạn ${suffix}`,
			kind: "OPEN",
		});
		await rieng.archive(userId, { id });
		expect(
			tuyChon[0]?.timeout,
			"xoa: transaction dung thoi han mac dinh 5s",
		).toBe(GIAI_DOAN_API.thoiHan.xoaMs);
	});
});

async function maLoi(p: Promise<unknown>): Promise<string> {
	try {
		await p;
		return "";
	} catch (error) {
		return error instanceof BadRequestException
			? "BAD_REQUEST"
			: error instanceof NotFoundException
				? "NOT_FOUND"
				: String(error);
	}
}

async function catTam(ten: string, kind: LoaiGiaiDoan = "OPEN") {
	const id = await taoGiaiDoan(kind, ten, 80);
	await giaiDoan.archive(userId, { id });
	return id;
}

async function archivedAtCua(id: string) {
	return (
		await db.dealStage.findUniqueOrThrow({
			where: { id },
			select: { archivedAt: true },
		})
	).archivedAt;
}

describe("khoi-phuc", () => {
	it("ve cuoi nhom, chan trung ten / du tran / chua cat / khong co; archived chi tra giai doan da cat", async () => {
		const M = GIAI_DOAN_API.messages;

		const a = await catTam("kp-mot");
		await giaiDoan.restore(userId, { id: a });
		const songMo = await db.dealStage.findMany({
			where: { kind: "OPEN", archivedAt: null },
			select: { id: true, position: true },
		});
		const viTriA = songMo.find((g) => g.id === a)?.position ?? -1;
		expect(
			{
				archivedAt: await archivedAtCua(a),
				cuoi: songMo.every((g) => g.id === a || g.position < viTriA),
			},
			"1 khoi phuc khong ve cuoi nhom",
		).toEqual({ archivedAt: null, cuoi: true });
		expect((await songCuaLoai("OPEN")).at(-1), "7 list sau restore").toBe(a);

		const b = await catTam("kp-trung");
		const tenB = (
			await db.dealStage.findUniqueOrThrow({
				where: { id: b },
				select: { label: true },
			})
		).label;
		const songTrung = await giaiDoan.create(userId, {
			label: `  ${tenB.toLocaleUpperCase("vi")}  `,
			kind: "LOST",
		});
		const ngayB = await archivedAtCua(b);
		expect(
			{
				ma: await maLoi(giaiDoan.restore(userId, { id: b })),
				loi: await loiCua(giaiDoan.restore(userId, { id: b })),
				archivedAt: await archivedAtCua(b),
			},
			"2 khoi phuc trung ten duoc chap nhan",
		).toEqual({ ma: "BAD_REQUEST", loi: M.trung, archivedAt: ngayB });
		await giaiDoan.archive(userId, { id: songTrung.id });

		const c = await catTam("kp-tran");
		const song = await db.dealStage.count({ where: { archivedAt: null } });
		const them: string[] = [];
		for (let i = song; i < GIAI_DOAN.tran.tong; i += 1) {
			them.push(await taoGiaiDoan("WON", `kp-day-${i}`, 90 + i));
		}
		try {
			expect(
				{
					ma: await maLoi(giaiDoan.restore(userId, { id: c })),
					loi: await loiCua(giaiDoan.restore(userId, { id: c })),
					song: await db.dealStage.count({ where: { archivedAt: null } }),
				},
				"3 khoi phuc khi du tran duoc chap nhan",
			).toEqual({
				ma: "BAD_REQUEST",
				loi: M.tran,
				song: GIAI_DOAN.tran.tong,
			});
		} finally {
			await db.dealStage.deleteMany({ where: { id: { in: them } } });
		}

		expect(
			{
				dangSong: await maLoi(giaiDoan.restore(userId, { id: a })),
				thongDiep: await loiCua(giaiDoan.restore(userId, { id: a })),
				khongCo: await maLoi(
					giaiDoan.restore(userId, { id: `${tienTo}-khong-co` }),
				),
			},
			"4-5 khoi phuc giai doan song / khong co",
		).toEqual({
			dangSong: "BAD_REQUEST",
			thongDiep: M.chuaLuuTru,
			khongCo: "NOT_FOUND",
		});

		const daCat = await giaiDoan.archived();
		const cuaToi = daCat.filter((g) => g.id.startsWith(tienTo));
		const ngay = cuaToi.map((g) => g.archivedAt);
		expect(
			{
				coA: daCat.some((g) => g.id === a),
				coB: cuaToi.some((g) => g.id === b),
				coC: cuaToi.some((g) => g.id === c),
				moiCatTruoc: [...ngay].sort().reverse(),
				khoa: daCat.map((g) => Object.keys(g).sort().join()),
				soSong: await db.dealStage.count({
					where: { id: { in: daCat.map((g) => g.id) }, archivedAt: null },
				}),
			},
			"6 archived sai",
		).toEqual({
			coA: false,
			coB: true,
			coC: true,
			moiCatTruoc: ngay,
			khoa: daCat.map(() => "archivedAt,id,kind,label"),
			soSong: 0,
		});

		const ngayDau = await archivedAtCua(c);
		await giaiDoan.restore(userId, { id: c });
		await new Promise((r) => setTimeout(r, 5));
		await giaiDoan.archive(userId, { id: c });
		const ngaySau = await archivedAtCua(c);
		expect(
			(ngaySau?.getTime() ?? 0) > (ngayDau?.getTime() ?? 0),
			"8 cat lai sau khi khoi phuc khong lay ngay moi",
		).toBe(true);
	});
});
