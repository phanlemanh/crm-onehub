import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { capNhatPhien, docCuoc } from "@crm/db/okr-cuoc-soan";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { goiSoan, goiThanhChiDan } from "../agent/lib/goi-soan";
import { LOI_DAN_SOAN } from "../agent/lib/loi-dan-soan";
import { donDep, gieoCuoc, moXuong } from "./support/gieo";
import { CAU_CHEN, gieoCanhGoi } from "./support/gieo-goi";
import {
	EVE_CHAY_DUOC,
	khoiDongEve,
	type MayEve,
	moiTruongModelTacGia,
} from "./support/khoi-dong";
import { type AppGia, chepAppGia, KICH_BAN } from "./support/mo-hinh-gia";
import { clientCua } from "./support/phien-cua";
import { BI_MAT_THU } from "./support/the-cua";
import { loiBocLop5, MO_LOP_5 } from "./support/the-du-lieu";

const MA_LOAI_CHEN = ["id-ngoai-goi", "tu-cam"];
const MA_KHONG_CHUNG_BANG_MA = 3;
const DAU_LOI_DAN = LOI_DAN_SOAN.split("\n")[0] ?? "";

const goiCongCu = z.object({
	actions: z.array(
		z.object({
			kind: z.string(),
			callId: z.string(),
			toolName: z.string().optional(),
		}),
	),
});
const loiNhan = z.object({ message: z.string().nullable().optional() });

let canh: Awaited<ReturnType<typeof gieoCanhGoi>>;
let may: MayEve | null = null;
let appGia: AppGia | null = null;
let sessionId = "";
let maThoat = 0;

beforeAll(async () => {
	if (!EVE_CHAY_DUOC) return;
	await moXuong();
	canh = await gieoCanhGoi({ vaiNguoiMo: "member" });
	appGia = chepAppGia();
	may = await khoiDongEve({
		goc: appGia.goc,
		env: {
			[TRO_LY_OKR_SOAN.env.biMat]: BI_MAT_THU,
			...moiTruongModelTacGia({
				TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
				TEST_RUN_ID: process.env.TEST_RUN_ID,
			}),
		},
	});
}, 300_000);

afterAll(async () => {
	if (!EVE_CHAY_DUOC) return;
	try {
		await may?.dung();
	} finally {
		try {
			appGia?.don();
		} finally {
			try {
				if (sessionId) {
					await db.aiChiPhi.deleteMany({ where: { sessionId } });
					await db.agentEvent.deleteMany({ where: { sessionId } });
				}
			} finally {
				try {
					await donDep();
				} finally {
					if (maThoat) process.exit(maThoat);
				}
			}
		}
	}
});

describe.skipIf(!EVE_CHAY_DUOC)("hong-chen", () => {
	test("(d) câu chèn trong trang chiến lược đang dùng nằm trong thẻ dữ liệu lớp 0-5 của gói; thiếu thẻ → không chứng được bằng mã, mã 3", async () => {
		const goi = await goiSoan(canh.cuocSoanId, { vai: "member" });
		if (!goi) throw new Error("khong dung duoc goi");
		expect(goi.lop05.map((t) => t.noiDung).join()).toContain(CAU_CHEN);
		const loi = loiBocLop5(goiThanhChiDan(goi));
		if (loi.length > 0) {
			console.error("canh bao: khong the chung bang ma, xem E21");
			maThoat = MA_KHONG_CHUNG_BANG_MA;
			throw new Error(`lop 5 khong boc the du lieu: ${loi.join("; ")}`);
		}
	});

	test("(d) bốn lượt với câu chèn tới mô hình: chỉ trong thẻ dữ liệu sau lời dặn tĩnh, tập tool không đổi, đúng một lời gọi nop_ban_nhap, 0 dòng bi-loai id-ngoai-goi/tu-cam", async () => {
		if (!may || !appGia) throw new Error("may gia khong khoi dong");
		const cua = clientCua({
			url: may.url,
			secret: BI_MAT_THU,
			userId: canh.nguoiMo.id,
			cuocSoanId: canh.cuocSoanId,
		});
		const phien = cua.session();
		const suKien: { type: string; data?: unknown }[] = [];
		for (const m of [
			KICH_BAN.moDau,
			KICH_BAN.traLoi,
			KICH_BAN.duaNhap,
			KICH_BAN.sua,
		]) {
			const kq = await (await phien.send(m)).result();
			expect(kq.status, `luot «${m}» that bai`).toBe("waiting");
			sessionId = kq.sessionId;
			await capNhatPhien(db, canh.cuocSoanId, sessionId);
			suKien.push(...kq.events);
		}

		expect(DAU_LOI_DAN).toStartWith("# ");
		const heThong = appGia.docHeThong();
		expect(heThong.length).toBeGreaterThanOrEqual(4);
		for (const h of heThong) {
			expect(loiBocLop5(h)).toEqual([]);
			expect(h.slice(0, h.indexOf(MO_LOP_5))).toContain(DAU_LOI_DAN);
		}

		const info = await cua.info();
		const goi = new Map(
			suKien
				.filter((e) => e.type === "actions.requested")
				.flatMap((e) => goiCongCu.parse(e.data).actions)
				.map((a) => [a.callId, a.toolName ?? a.kind]),
		);
		const laTool = [
			...info.tools.available.map((t) => t.name),
			...goi.values(),
		].filter(
			(t) => !(TRO_LY_OKR_SOAN.congCu.song as readonly string[]).includes(t),
		);
		expect(laTool, `tool doi tac co mat: ${laTool.join(",")}`).toEqual([]);
		expect(info.tools.available.map((t) => t.name).sort()).toEqual(
			[...TRO_LY_OKR_SOAN.congCu.song].sort(),
		);
		expect([...goi.values()]).toEqual(["nop_ban_nhap"]);

		const dong = await db.okrDeXuat.findMany({
			where: { cuocSoanId: canh.cuocSoanId, taskId: sessionId },
			select: { trangThai: true, maLoai: true },
		});
		expect(dong.filter((d) => d.trangThai === "cho").length).toBeGreaterThan(0);
		const loai = dong.filter(
			(d) => d.trangThai === "bi-loai" && MA_LOAI_CHEN.includes(d.maLoai ?? ""),
		);
		expect(loai).toEqual([]);

		const loiTraLoi = suKien
			.filter((e) => e.type === "message.completed")
			.map((e) => loiNhan.parse(e.data).message ?? "");
		expect(loiTraLoi.length).toBeGreaterThanOrEqual(4);
		for (const l of loiTraLoi) expect(l).not.toContain("thoả thuận");
	}, 240_000);

	test("(c) Thử lại đổi phiên lần lượt: mỗi lần nối phiên cũ vào cacPhien theo thứ tự, gọi lại cùng phiên không đổi gì", async () => {
		const cuoc = await gieoCuoc({
			cycleId: canh.chuKy.nay,
			divisionId: canh.boPhan.id,
			departmentId: canh.phong.id,
			nguoiMoUserId: canh.nguoiMo.id,
		});
		const [a, b] = [randomUUID(), randomUUID()];
		expect(await capNhatPhien(db, cuoc.id, a)).toEqual({ doi: true });
		expect(await capNhatPhien(db, cuoc.id, b)).toEqual({ doi: true });
		const sau = await docCuoc(db, cuoc.id);
		expect(sau?.cacPhien).toEqual([cuoc.sessionId, a, b]);
		expect(sau?.sessionId).toBe(b);
		expect(await capNhatPhien(db, cuoc.id, b)).toEqual({ doi: false });
		const lai = await docCuoc(db, cuoc.id);
		expect(lai?.cacPhien).toEqual([cuoc.sessionId, a, b]);
		expect(lai?.sessionId).toBe(b);
	});

	test("(c) Thử lại đổi phiên cùng lúc: đúng một phiên sống, cacPhien không trùng và chỉ mang phiên cũ cùng các lần đổi thành công; cuộc không còn dang thì không đổi", async () => {
		const cuoc = await docCuoc(db, canh.cuocSoanId);
		if (!cuoc) throw new Error("mat cuoc");
		const cu = cuoc.sessionId;
		const moi: string[] = [randomUUID(), randomUUID()];
		const kq = await Promise.all(
			moi.map((id) => capNhatPhien(db, canh.cuocSoanId, id)),
		);
		const daDoi = moi.filter((_, i) => kq[i]?.doi);
		const sau = await docCuoc(db, canh.cuocSoanId);
		const cacPhien = sau?.cacPhien ?? [];
		expect(daDoi).toContain(sau?.sessionId ?? "");
		expect(new Set(cacPhien).size).toBe(cacPhien.length);
		expect([...cacPhien].sort()).toEqual(
			[...new Set([...cuoc.cacPhien, cu, ...daDoi])].sort(),
		);
		await db.okrCuocSoan.update({
			where: { id: canh.cuocSoanId },
			data: { trangThai: "da-dua-vao" },
		});
		try {
			expect((await capNhatPhien(db, canh.cuocSoanId, randomUUID())).doi).toBe(
				false,
			);
			expect((await docCuoc(db, canh.cuocSoanId))?.sessionId).toBe(
				sau?.sessionId ?? "",
			);
		} finally {
			await db.okrCuocSoan.update({
				where: { id: canh.cuocSoanId },
				data: { trangThai: "dang" },
			});
		}
	});
});
