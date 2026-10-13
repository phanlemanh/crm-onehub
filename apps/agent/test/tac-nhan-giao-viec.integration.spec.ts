import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { ActivityType, db } from "@crm/db";
import * as nhacDb from "@crm/db/onboarding-nhac";
import { chepViecCanLam } from "@crm/db/viec-ghi";
import { parseAgentManifest } from "@crm/validation/agent-manifest";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { createRunActivity } from "../agent/lib/run-runtime";
import { donDep, gieoNguoi, ma, moXuong, TIEN_TO } from "./support/nhac-gieo";
import { hangCua } from "./support/nhac-gui-gieo";
import { batBot, noiZalo, tatBot } from "./support/okr-gieo";
import { APP_URL, voiToken } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const BAN_KHAI_CU = {
	triggers: [
		{
			type: "SCHEDULE",
			name: "Every hour",
			summary: "Run every hour",
			config: { nextRunAt: "2026-10-14T02:00:00.000Z", intervalMinutes: 60 },
		},
	],
	dataScope: { mode: "WORKSPACE", summary: "Mọi bản ghi", resources: [] },
	actions: [
		{
			type: "crm.activity.create",
			provider: "crm",
			summary: "Create CRM notes and tasks",
			activityTypes: ["NOTE", "TASK"],
		},
		{ type: "run.summary", provider: "crm", summary: "Summarize the run" },
	],
};

const NOW = new Date("2026-10-14T09:00:00+07:00");

let u = "";
let agentId = "";
let versionId = "";
let dealId = "";

function hong(dieu: boolean, thongDiep: string): void {
	if (!dieu) throw new Error(thongDiep);
}

async function taoLuot() {
	return db.agentRun.create({
		data: {
			agentId,
			versionId,
			triggerType: "MANUAL",
			status: "RUNNING",
			startedAt: new Date(),
			initiatedById: u,
			idempotencyKey: `cvc-run-${crypto.randomUUID()}`,
			correlationId: crypto.randomUUID(),
			events: { create: { sequence: 0, type: "run.queued", data: {} } },
		},
		select: { id: true },
	});
}

beforeAll(async () => {
	await moXuong();
	u = (await gieoNguoi("CVC Người khởi chạy")).id;
	const congTy = await db.company.create({ data: { name: `${ma()} CVC Cty` } });
	dealId = (
		await db.deal.create({
			data: { name: `${ma()} CVC Deal`, companyId: congTy.id, ownerId: u },
		})
	).id;
	agentId = (
		await db.agentDefinition.create({
			data: { name: `${TIEN_TO}cvc`, status: "LIVE", createdById: u },
			select: { id: true },
		})
	).id;
	versionId = (
		await db.agentVersion.create({
			data: {
				agentId,
				number: 1,
				status: "DEPLOYED",
				instructions: "Giao việc.",
				manifest: BAN_KHAI_CU,
				modelId: "test/model",
				sandboxPolicy: {},
				createdById: u,
				approvedAt: new Date(),
				deployedAt: new Date(),
			},
			select: { id: true },
		})
	).id;
});

afterEach(() => setSystemTime());

afterAll(async () => {
	await db.agentAction.deleteMany({ where: { agentId } });
	await db.agentRunEvent.deleteMany({ where: { run: { agentId } } });
	await db.agentRun.deleteMany({ where: { agentId } });
	await db.agentVersion.deleteMany({ where: { agentId } });
	await db.agentDefinition.deleteMany({ where: { id: agentId } });
	await db.viec.deleteMany({ where: { taoBoiId: { startsWith: TIEN_TO } } });
	await db.activity.deleteMany({
		where: { createdById: { startsWith: TIEN_TO } },
	});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await donDep();
	await tatBot();
});

describe("cvc-tac-nhan", () => {
	test("cvc-tac-nhan: lời gọi TASK giao một Việc cho người khởi chạy, không ghi việc cần làm", async () => {
		hong(
			parseAgentManifest(BAN_KHAI_CU).actions.length === 2,
			"cvc: ban khai cu khong doc duoc",
		);
		const luot = await taoLuot();
		const han = new Date("2026-10-20T00:00:00.000Z");
		const truocTask = await db.activity.count({
			where: { type: ActivityType.TASK },
		});
		const ket = await createRunActivity(luot.id, "call-1", {
			type: "TASK",
			targetKind: "deal",
			targetId: dealId,
			subject: "Gửi báo giá",
			dueAt: han.toISOString(),
		});
		hong(
			(await db.activity.count({ where: { type: ActivityType.TASK } })) ===
				truocTask,
			"cvc: tac nhan con ghi TASK",
		);
		const viec = await db.viec.findMany({
			where: { tieuDe: "Gửi báo giá", taoBoiId: u },
			include: { gan: true, vet: true },
		});
		hong(viec.length === 1, `cvc: tac nhan giao viec sai so ${viec.length}`);
		const v = viec[0];
		if (!v) throw new Error("cvc: tac nhan giao viec sai so 0");
		hong(
			v.nguoiGiaoId === u && v.nguoiThucHienId === u,
			"cvc: tac nhan giao viec sai nguoi",
		);
		hong(
			v.gan.length === 1 && v.gan[0]?.dealId === dealId,
			"cvc: tac nhan giao viec sai gan",
		);
		hong(
			v.hanNgay?.getTime() === han.getTime(),
			"cvc: tac nhan giao viec sai hanNgay",
		);
		hong(
			v.vet.length === 1 &&
				v.vet[0]?.loai === "tao" &&
				v.vet[0]?.nguon === "tac-nhan",
			"cvc: tac nhan giao viec sai vet",
		);
		const hanhDong = await db.agentAction.findUnique({
			where: { id: ket.actionId },
		});
		hong(
			hanhDong?.status === "SUCCEEDED" &&
				hanhDong.externalId === v.id &&
				ket.viecId === v.id,
			"cvc: so hanh dong sai",
		);

		const lai = await createRunActivity(luot.id, "call-1", {
			type: "TASK",
			targetKind: "deal",
			targetId: dealId,
			subject: "Gửi báo giá",
			dueAt: han.toISOString(),
		});
		hong(
			lai.replayed &&
				(await db.viec.count({
					where: { tieuDe: "Gửi báo giá", taoBoiId: u },
				})) === 1,
			"cvc: goi lai nhan ban",
		);

		await db.member.updateMany({ where: { userId: u }, data: { role: "okr" } });
		const soViec = await db.viec.count({ where: { taoBoiId: u } });
		const soXong = await db.agentAction.count({
			where: { agentId, status: "SUCCEEDED" },
		});
		let loi = "";
		try {
			await createRunActivity(luot.id, "call-2", {
				type: "TASK",
				targetKind: "deal",
				targetId: dealId,
				subject: "Việc cho vai okr",
			});
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		} finally {
			await db.member.updateMany({
				where: { userId: u },
				data: { role: "member" },
			});
		}
		hong(
			loi.includes("chỉ OKR") &&
				(await db.viec.count({ where: { taoBoiId: u } })) === soViec &&
				(await db.agentAction.count({
					where: { agentId, status: "SUCCEEDED" },
				})) === soXong,
			"cvc: tac nhan giao cho vai okr",
		);

		const note = await createRunActivity(luot.id, "call-3", {
			type: "NOTE",
			targetKind: "deal",
			targetId: dealId,
			subject: "Ghi chú của Tác nhân",
		});
		const hangNote = await db.activity.findMany({
			where: { id: note.activityId ?? "", type: ActivityType.NOTE },
		});
		expect(hangNote.length).toBe(1);
	});
});

describe("cvc-nhac", () => {
	test("cvc-nhac: bản chép quá hạn vào bộ gom và tin Zalo buổi sáng; việc cũ chưa chép thì không", async () => {
		setSystemTime(NOW);
		const a = await gieoNguoi("CVC Nhắc A");
		const congTy = await db.company.create({
			data: { name: `${ma()} CVC Nhắc Cty` },
		});
		const deal = await db.deal.create({
			data: {
				name: `CVC Nhắc Deal ${ma()}`,
				companyId: congTy.id,
				ownerId: a.id,
			},
		});
		const tao = (subject: string) =>
			db.activity.create({
				data: {
					type: ActivityType.TASK,
					subject,
					occurredAt: new Date(),
					dueAt: new Date("2026-10-12T00:00:00.000Z"),
					dealId: deal.id,
					companyId: congTy.id,
					createdById: a.id,
				},
				select: { id: true },
			});
		const goc = await tao("CVC việc cũ đã chép");
		await tao("CVC việc cũ chưa chép");
		const ban = await db.$transaction((tx) =>
			chepViecCanLam(tx, {
				activityId: goc.id,
				nguoiChay: { id: a.id, ten: a.name },
				now: NOW,
			}),
		);
		const banId = ban?.id ?? "";

		const kq = await nhacDb.viecCanNhac(db, { now: NOW, cuaSo: "buoi-sang" });
		const muc = kq.get(a.id) ?? [];
		const quaHan = muc.filter((m) => m.loai === "viec-qua-han");
		hong(
			quaHan.length === 1 && JSON.stringify(quaHan[0]).includes(banId),
			"cvc: nhac thieu ban chep",
		);
		hong(
			!JSON.stringify(muc).includes("CVC việc cũ chưa chép"),
			"cvc: nhac lay viec cu",
		);

		const z = zaloGia();
		await noiZalo(a.id, `Z-${a.id}`);
		await batBot();
		await lenLichNhac(NOW);
		const hang = await hangCua(a.id);
		await voiToken(() =>
			chayNhac(hang, { zaloFetcher: z.fetcher, appUrl: APP_URL }),
		);
		const tin = z.guiToi(`Z-${a.id}`).map((g) => g.body.text ?? "");
		hong(
			tin.length === 1 &&
				(tin[0] ?? "").includes("CVC việc cũ đã chép") &&
				(tin[0] ?? "").includes(deal.name),
			"cvc: nhac thieu ban chep",
		);
	});
});
