import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import hookGoc from "../agent/hooks/okr-uy-quyen";
import { beginResearch, RESEARCH_LEASE_MS } from "../agent/lib/dispatch";
import { reconcileStaleTasks } from "../agent/lib/stale-tasks";
import { claimDue, retireExhausted } from "../agent/lib/tasks";
import type { XuLyKetQuaHanhDong } from "./support/eve-kieu";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";
import {
	dongDaNop,
	type NguCanhCon,
	nguCanhCon,
	nguCanhGoc,
} from "./support/tro-ly-phien-con";

const THU_MUC_HOOK = join(
	import.meta.dir,
	"../agent/subagents/tro_ly_okr/hooks",
);
const GIAY = 1_000;
const MOC = new Date("2033-05-01T03:00:00Z").getTime();
const SU_KIEN_CON = [
	"turn.started",
	"step.started",
	"actions.requested",
	"action.result",
	"step.completed",
	"message.completed",
] as const;
const khoaCu = process.env.AI_GATEWAY_API_KEY;

type SuKien = { type: string; data: Record<string, never> };
type XuLy = (e: SuKien, c: NguCanhCon) => unknown;

let nguoi = "";
let chuKy = "";
let hooks: Record<string, XuLy>[] = [];

async function napHook(): Promise<Record<string, XuLy>[]> {
	const ra: Record<string, XuLy>[] = [];
	for (const ten of readdirSync(THU_MUC_HOOK)
		.filter((t) => t.endsWith(".ts"))
		.sort()) {
		const mod = await import(join(THU_MUC_HOOK, ten));
		ra.push(mod.default.events as Record<string, XuLy>);
	}
	return ra;
}

async function phat(type: string, ctx: NguCanhCon): Promise<void> {
	const e: SuKien = { type, data: {} };
	for (const h of hooks) await h[type]?.(e, ctx);
	for (const h of hooks) await h["*"]?.(e, ctx);
}

async function donNhip(): Promise<void> {
	await reconcileStaleTasks();
	await retireExhausted();
}

async function hang(id: string) {
	return db.agentTask.findUniqueOrThrow({
		where: { id },
		select: { finishedAt: true, outcome: true, attempts: true },
	});
}

async function batDau(luc: number): Promise<{ id: string; phienGoc: string }> {
	setSystemTime(new Date(luc));
	const objectiveId = await gieoMucTieu({
		cycleId: chuKy,
		chu: nguoi,
		congBo: new Date(),
	});
	const xep = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId,
		keyResultId: null,
		nguoiYeuCau: nguoi,
		nac: "bat",
		now: new Date(),
	});
	if (!xep.bat) throw new Error(`khong xep duoc: ${xep.lyDo}`);
	const nhan = await claimDue(50, { only: ["okr-de-xuat"] }, RESEARCH_LEASE_MS);
	const task = nhan.find((t) => t.id === xep.taskId);
	if (!task) throw new Error("claimDue khong nhan viec");
	const phienGoc = `mn3-goc-${task.id}`;
	await beginResearch(task, async () => ({ id: phienGoc }));
	const sau = await db.agentTask.findUniqueOrThrow({ where: { id: task.id } });
	if (sau.sessionId !== phienGoc || sau.finishedAt) {
		throw new Error(`khong mo duoc viec: ${sau.outcome}`);
	}
	return { id: task.id, phienGoc };
}

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	await moXuong();
	nguoi = (await gieoNguoi("Người gieo giữ việc")).id;
	chuKy = await gieoChuKy("dang-chay");
	await gieoCauHinhAi(new Date(MOC - 60 * GIAY), {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
	hooks = await napHook();
}, 30_000);

afterEach(() => setSystemTime());

afterAll(async () => {
	setSystemTime();
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("tro-ly-okr-giu-viec", () => {
	test("giu-viec: phiên con phát sự kiện mỗi 10 giây trong 90 giây thì việc không đóng; tool nộp đóng da-nop, kết quả ở gốc giữ nguyên", async () => {
		const viec = await batDau(MOC);
		const con = nguCanhCon(viec.phienGoc);
		for (let giay = 10; giay <= 90; giay += 10) {
			setSystemTime(new Date(MOC + giay * GIAY));
			await phat(SU_KIEN_CON[(giay / 10) % SU_KIEN_CON.length] ?? "*", con);
			await donNhip();
			const r = await hang(viec.id);
			if (r.finishedAt) {
				throw new Error(
					`dong giua chung khi phien con chay: giay ${giay}, ${r.outcome}`,
				);
			}
		}
		await dongDaNop(viec.id);
		const moc = hookGoc.events[
			"action.result"
		] as unknown as XuLyKetQuaHanhDong;
		await moc(
			{
				type: "action.result",
				data: {
					result: {
						kind: "subagent-result",
						subagentName: "tro_ly_okr",
						callId: "goi-tro-ly",
						isError: false,
						output: "done",
					},
				},
			},
			nguCanhGoc(viec.id, viec.phienGoc) as never,
		);
		expect((await hang(viec.id)).outcome).toBe("da-nop");
	}, 60_000);

	test("giu-viec: phiên con im sau giây 5 thì dọn việc treo đóng het-lease ở nhịp đầu sau giây 35, trước giây 95", async () => {
		const moc = MOC + 10 * 60 * GIAY;
		const viec = await batDau(moc);
		setSystemTime(new Date(moc + 5 * GIAY));
		await phat("step.started", nguCanhCon(viec.phienGoc));
		let dongO: number | null = null;
		for (let giay = 10; giay <= 120 && dongO === null; giay += 10) {
			setSystemTime(new Date(moc + giay * GIAY));
			await donNhip();
			if ((await hang(viec.id)).finishedAt) dongO = giay;
		}
		const r = await hang(viec.id);
		expect([dongO, r.outcome, r.attempts]).toEqual([40, "hong:het-lease", 1]);
		if (dongO === null || dongO <= 35 || dongO >= 95) {
			throw new Error(`dong sai nhip: ${dongO}`);
		}
	}, 60_000);
});
