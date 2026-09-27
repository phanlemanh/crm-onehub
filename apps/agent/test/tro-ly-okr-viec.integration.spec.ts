import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { VIEC_OKR } from "@crm/db/agent-tasks";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import { crmEvents, taskToken } from "../agent/channels/crm";
import hook from "../agent/hooks/okr-uy-quyen";
import { beginResearch, taskAuth } from "../agent/lib/dispatch";
import { reconcileStaleTasks } from "../agent/lib/stale-tasks";
import type { LeasedTask } from "../agent/lib/tasks";
import type {
	XuLyKetQuaHanhDong,
	XuLySuKienKenh,
	XuLySuKienPhien,
} from "./support/eve-kieu";
import { trongNguCanhEve } from "./support/eve-ngu-canh";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";

const DONG_HO = new Date("2031-06-10T03:00:00Z");
let mucTieu: string[] = [];
const khoaCu = process.env.AI_GATEWAY_API_KEY;

async function hangMoi(i: number): Promise<LeasedTask> {
	const xep = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId: mucTieu[i] ?? "",
		keyResultId: null,
		nguoiYeuCau: "mn3-nguoi-yeu-cau",
		now: new Date(),
	});
	if (!xep.xep) throw new Error(`khong xep duoc: ${xep.lyDo}`);
	const hang = await db.agentTask.update({
		where: { id: xep.taskId },
		data: {
			attempts: 1,
			startedAt: new Date(),
			leasedUntil: new Date(Date.now() + 30 * 60_000),
		},
	});
	return { ...hang, payload: hang.payload };
}

async function ketQua(id: string) {
	return db.agentTask.findUniqueOrThrow({
		where: { id },
		select: {
			finishedAt: true,
			outcome: true,
			sessionId: true,
			attempts: true,
			leasedUntil: true,
		},
	});
}

function ctxOkr(taskId: string) {
	return {
		agent: { name: "crm" },
		channel: { kind: "crm", continuationToken: taskToken(taskId) },
		session: {
			id: `ses-${taskId}`,
			auth: {
				current: {
					attributes: { purpose: "okr", okrTaskId: taskId, okrViec: "de-xuat" },
				},
				initiator: null,
			},
		},
	};
}

beforeAll(async () => {
	setSystemTime(DONG_HO);
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	await moXuong();
	const chu = await gieoNguoi("Người gieo việc OKR");
	const ck = await gieoChuKy("dang-chay");
	mucTieu = await Promise.all(
		[0, 1, 2, 3, 4, 5].map(() =>
			gieoMucTieu({ cycleId: ck, chu: chu.id, congBo: new Date() }),
		),
	);
}, 30_000);

afterAll(async () => {
	setSystemTime();
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("tran-khong", () => {
	test("hàng có sẵn khi trần hạ về 0 thì đóng, không gửi; trần 9 thì gửi đúng một lần", async () => {
		await gieoCauHinhAi(new Date(Date.now() - 60_000), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 9,
		});
		const hang = await hangMoi(0);
		await gieoCauHinhAi(new Date(Date.now() - 30_000), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 0,
		});
		let gui = 0;
		await beginResearch(hang, async () => {
			gui += 1;
			return { id: "ses-khong-duoc-mo" };
		});
		const r = await ketQua(hang.id);
		if (gui !== 0) throw new Error("mo phien khi het tran");
		expect([r.outcome, r.sessionId, r.finishedAt !== null]).toEqual([
			"khong-chay:het-tran-thang",
			null,
			true,
		]);

		await gieoCauHinhAi(new Date(Date.now() - 10_000), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 9,
		});
		const hang2 = await hangMoi(1);
		const thuocTinh: ReturnType<typeof taskAuth>["attributes"][] = [];
		await beginResearch(hang2, async (t) => {
			gui += 1;
			thuocTinh.push(taskAuth(t).attributes);
			return { id: `ses-${t.id}` };
		});
		expect(gui).toBe(1);
		expect(thuocTinh[0]).toMatchObject({ purpose: "okr", okrTaskId: hang2.id });
		const r2 = await ketQua(hang2.id);
		expect(r2.finishedAt).toBeNull();
		expect(
			r2.leasedUntil && r2.leasedUntil.getTime() - Date.now(),
		).toBeLessThanOrEqual(VIEC_OKR.leaseMs);
	}, 30_000);
});

describe("dong-viec", () => {
	test("ba đường hỏng đều đóng có mã, không bao giờ ran, không chạy lại", async () => {
		await gieoCauHinhAi(new Date(Date.now() - 5_000), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 9,
		});

		const a = await hangMoi(2);
		await trongNguCanhEve(async () => {
			const moc = hook.events["action.result"] as unknown as XuLyKetQuaHanhDong;
			await moc(
				{
					type: "action.result",
					data: {
						result: {
							kind: "subagent-result",
							subagentName: "tro_ly_okr",
							callId: "c1",
							isError: true,
							output: {
								code: "SUBAGENT_EXECUTION_FAILED",
								message:
									"The agent could not produce a result matching the requested schema.",
							},
						},
					},
				},
				ctxOkr(a.id),
			);
		});
		const cham = crmEvents["session.completed"] as unknown as XuLySuKienKenh;
		await cham({}, { continuationToken: taskToken(a.id) });
		const ra = await ketQua(a.id);
		expect(ra.outcome).toBe("hong:SUBAGENT_EXECUTION_FAILED");

		const b = await hangMoi(3);
		const hong = crmEvents["turn.failed"] as unknown as XuLySuKienKenh;
		const t0 = Date.now();
		await hong(
			{ code: "MODEL_ERROR", message: "boom" },
			{ continuationToken: taskToken(b.id) },
		);
		const rb = await ketQua(b.id);
		expect([rb.outcome, rb.finishedAt !== null]).toEqual([
			"hong:turn-failed",
			true,
		]);
		expect(Date.now() - t0).toBeLessThan(5_000);

		const c = await hangMoi(4);
		await db.agentTask.update({
			where: { id: c.id },
			data: { leasedUntil: new Date(Date.now() - 31_000) },
		});
		await reconcileStaleTasks();
		const rc = await ketQua(c.id);
		if (rc.finishedAt === null) throw new Error("viec okr chay lai");
		expect([rc.outcome, rc.attempts]).toEqual(["hong:het-lease", 1]);

		for (const r of [ra, rb, rc]) expect(r.outcome).not.toBe("ran");
	}, 30_000);

	test("gia-han: sự kiện của phiên còn sống làm lease lùi thêm, dọn việc treo không đụng", async () => {
		const d = await hangMoi(5);
		await db.agentTask.update({
			where: { id: d.id },
			data: { leasedUntil: new Date(Date.now() + 1_000) },
		});
		await trongNguCanhEve(async () => {
			const moi = hook.events["*"] as unknown as XuLySuKienPhien;
			await moi({ type: "step.completed", data: {} }, ctxOkr(d.id));
		});
		const rd = await ketQua(d.id);
		expect(
			rd.leasedUntil && rd.leasedUntil.getTime() - Date.now(),
		).toBeGreaterThan(20_000);
		await reconcileStaleTasks();
		expect((await ketQua(d.id)).finishedAt).toBeNull();
	}, 30_000);
});
