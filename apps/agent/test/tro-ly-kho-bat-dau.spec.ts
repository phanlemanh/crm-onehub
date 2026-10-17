import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import loiDan from "../agent/subagents/tro_ly_kho/instructions";
import {
	type CtxBatDauEve,
	ctxBatDauThat,
	donTroLyKho,
	gieoNguoi,
	ma,
} from "./support/tro-ly-kho-gia";

type BatDau = (
	e: { type: "session.started" },
	c: CtxBatDauEve,
) => Promise<{ markdown?: string } | null>;

const batDau = (loiDan as unknown as { events: { "session.started": BatDau } })
	.events["session.started"];

afterAll(donTroLyKho);

describe("tlk-bat-dau", () => {
	test("tlk-bat-dau: ngu canh session.started dung hinh eve that khong co parent", () => {
		const ctx = ctxBatDauThat("wrun_goc");
		expect("parent" in ctx.session).toBe(false);
		expect(ctx.channel.continuationToken).toStartWith("subagent:wrun_goc:");
	});

	test("tlk-bat-dau: cau Zalo mo hang TaiLieuHoi kenh ZALO va chi dan mang ma cau", async () => {
		const nguoi = await gieoNguoi("member");
		const goc = ma("ses-zalo");
		const zalo = await db.zaloHoi.create({
			data: {
				messageId: ma("msg"),
				crmUserId: nguoi.id,
				zaloChatId: ma("chat"),
				sessionId: goc,
				ketQua: "dang-hoi",
			},
		});

		const ra = await batDau({ type: "session.started" }, ctxBatDauThat(goc));

		const hang = await db.taiLieuHoi.findUnique({
			where: { zaloHoiId: zalo.id },
			select: { id: true, kenh: true, phienId: true, trangThai: true },
		});
		expect(hang).toMatchObject({
			kenh: "ZALO",
			phienId: goc,
			trangThai: "DANG_HOI",
		});
		expect(ra?.markdown ?? "").toContain(`Question id: ${hang?.id}`);
	});

	test("tlk-bat-dau: cau CRM tim dung hang theo phien goc", async () => {
		const nguoi = await gieoNguoi("member");
		const goc = ma("ses-kho");
		const hang = await db.taiLieuHoi.create({
			data: {
				nguoiHoiId: nguoi.id,
				kenh: "CRM",
				cauHoi: "Câu hỏi thử?",
				phienId: goc,
			},
		});

		const ra = await batDau({ type: "session.started" }, ctxBatDauThat(goc));

		expect(ra?.markdown ?? "").toContain(`Question id: ${hang.id}`);
	});

	test("tlk-bat-dau: phien goc khong phai cau kho thi tu choi", async () => {
		const ctx = {
			...ctxBatDauThat("x"),
			channel: { kind: "zalo", continuationToken: `zalo:${ma("chat")}` },
		};
		const ra = await batDau({ type: "session.started" }, ctx);
		expect(ra?.markdown).toBe(TAI_LIEU_AGENT.hoi.dungLai.chiDan);
	});
});
