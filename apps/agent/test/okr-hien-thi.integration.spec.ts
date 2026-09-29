import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import { beginResearch } from "../agent/lib/dispatch";
import * as doc from "../agent/lib/okr/doc";
import { dungGoiDeXuat } from "../agent/lib/okr/goi-ngu-canh";
import type { LeasedTask } from "../agent/lib/tasks";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";

const DONG_HO = new Date("2031-06-10T03:00:00Z");
const CHO_MS = 60_000;
const khoaCu = process.env.AI_GATEWAY_API_KEY;
let G = "";
let F = "";

async function hangMoi(): Promise<LeasedTask> {
	const xep = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId: G,
		keyResultId: null,
		nguoiYeuCau: F,
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
		select: { finishedAt: true, outcome: true, sessionId: true },
	});
}

async function datHienThi(hienThi: "cong-khai" | "gioi-han") {
	await db.okrObjective.update({ where: { id: G }, data: { hienThi } });
}

beforeAll(async () => {
	setSystemTime(DONG_HO);
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	await moXuong();
	const chu = await gieoNguoi("Chu muc tieu");
	F = (await gieoNguoi("Phi")).id;
	const ck = await gieoChuKy("dang-chay");
	G = await gieoMucTieu({ cycleId: ck, chu: chu.id, congBo: new Date() });
	await gieoCauHinhAi(new Date(Date.now() - 60_000), {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
}, 30_000);

afterAll(async () => {
	setSystemTime();
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("hien-thi", () => {
	test(
		"hien-thi: viec xep khi G cong khai, G doi gioi han truoc khi chay — docMucTieu 0 lan, viec ket thuc khong-xem-duoc, khong mo phien; dat lai cong khai thi doc G va gui",
		async () => {
			const hang = await hangMoi();
			await datHienThi("gioi-han");
			const espion = spyOn(doc, "docMucTieu");
			let gui = 0;
			await beginResearch(hang, async () => {
				gui += 1;
				return { id: "ses-khong-duoc-mo" };
			});
			const goiKhiGioiHan = await dungGoiDeXuat(G, F);
			const r = await ketQua(hang.id);
			expect({
				gui,
				goi: goiKhiGioiHan,
				docMucTieu: espion.mock.calls.length,
				outcome: r.outcome,
				sessionId: r.sessionId,
				daDong: r.finishedAt !== null,
			}).toEqual({
				gui: 0,
				goi: null,
				docMucTieu: 0,
				outcome: "khong-chay:khong-xem-duoc",
				sessionId: null,
				daDong: true,
			});

			await datHienThi("cong-khai");
			const hang2 = await hangMoi();
			await beginResearch(hang2, async (t) => {
				gui += 1;
				return { id: `ses-${t.id}` };
			});
			const goi = await dungGoiDeXuat(G, F);
			expect({
				gui,
				docMucTieu: espion.mock.calls.length,
				mucTieu: goi?.mucTieu.id,
			}).toEqual({ gui: 1, docMucTieu: 1, mucTieu: G });
			espion.mockRestore();
		},
		CHO_MS,
	);
});
