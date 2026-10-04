import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { db } from "@crm/db";
import {
	dungTraLoiZalo,
	dungTuChoi,
	parseGanNhat,
	parseTraLoi,
	TAI_LIEU_HOI,
} from "@crm/validation/tai-lieu-hoi";
import { zaloEvents } from "../agent/channels/zalo";
import hookDong from "../agent/hooks/dong-tro-ly-kho";
import { ngayVnTuIso } from "../agent/lib/tai-lieu-hoi-zalo";
import { ZALO } from "../agent/lib/zalo-config";
import { locTraLoi } from "../agent/lib/zalo-loc";
import loiDan from "../agent/subagents/tro_ly_kho/instructions";
import nopTraLoi from "../agent/subagents/tro_ly_kho/tools/nop_tra_loi";
import readPage from "../agent/subagents/tro_ly_kho/tools/read_page";
import LOI from "./fixtures/loi-gateway.json";
import {
	type CtxCon,
	ctxConCua,
	donTroLyKho,
	gieoNguoi,
	goiCongCu,
	type KetQuaConEve,
	ketQuaConEve,
	ma,
	type Nguoi,
	trangDaDuyet,
} from "./support/tro-ly-kho-gia";
import { zaloMayChu } from "./support/zalo-may-chu";

const TOKEN = "tlk-zalo-token";
const GOC = "GOC-VIET-ABC";

let mayChu: ReturnType<typeof zaloMayChu> | null = null;
const envCu = {
	url: process.env.ZALO_API_URL,
	token: process.env.ZALO_BOT_TOKEN,
};
let quanTri: Nguoi;
let nguoi: Nguoi;
let trang: { slug: string; trangId: string };

beforeAll(async () => {
	quanTri = await gieoNguoi("owner");
	nguoi = await gieoNguoi("member");
	trang = await trangDaDuyet(
		quanTri,
		`Quy định công tác phí ${ma("ct")}`,
		"## Mức\n\nCông tác phí mỗi ngày là 300.000 đồng.",
	);
});

afterEach(() => {
	mayChu?.dung();
	mayChu = null;
	process.env.ZALO_API_URL = envCu.url;
	process.env.ZALO_BOT_TOKEN = envCu.token;
});

afterAll(async () => {
	await db.zaloHoi.deleteMany({ where: { crmUserId: nguoi.id } });
	await donTroLyKho();
});

function moMayChu() {
	mayChu = zaloMayChu();
	process.env.ZALO_API_URL = mayChu.url;
	process.env.ZALO_BOT_TOKEN = TOKEN;
}

function guiToi(chatId: string): string[] {
	return (mayChu?.goi ?? [])
		.filter((g) => g.method === "sendMessage" && g.body.chat_id === chatId)
		.map((g) => g.body.text ?? "");
}

async function cauZalo(): Promise<{
	zaloHoiId: string;
	chatId: string;
	goc: string;
}> {
	const chatId = ma("chat");
	const goc = ma("ses-zalo");
	const h = await db.zaloHoi.create({
		data: {
			messageId: ma("msg"),
			crmUserId: nguoi.id,
			zaloChatId: chatId,
			sessionId: goc,
			ketQua: "dang-hoi",
		},
	});
	return { zaloHoiId: h.id, chatId, goc };
}

function ctxGoc(c: { zaloHoiId: string; chatId: string; goc: string }) {
	const thuocTinh = {
		purpose: ZALO.hoi.purpose,
		hoiId: c.zaloHoiId,
		zaloChatId: c.chatId,
		userId: nguoi.id,
	};
	return {
		session: {
			id: c.goc,
			auth: {
				current: { attributes: thuocTinh },
				initiator: { attributes: thuocTinh },
			},
		},
	};
}

type DuLieuTin = { message?: string; finishReason?: string };
type KenhGia = { continuationToken: string; setContinuationToken: () => void };
type NguCanhGoc = ReturnType<typeof ctxGoc>;
type XuLyKenh = (d: DuLieuTin, kenh: KenhGia, ctx: NguCanhGoc) => Promise<void>;
type BatDau = (e: { type: "session.started" }, c: CtxCon) => Promise<void>;
type SuKienKetQua = {
	type: "action.result";
	data: {
		result: {
			kind: string;
			subagentName: string;
			isError?: boolean;
			output: KetQuaConEve["output"];
		};
	};
};
function xuLyKetQuaCua<T>(): T {
	const xuLy = hookDong.events?.["action.result"];
	if (!xuLy) throw new Error("hook dong-tro-ly-kho thieu action.result");
	return xuLy as unknown as T;
}

type XuLyKetQua = (e: SuKienKetQua, c: NguCanhGoc) => Promise<void>;

async function suKien(
	ten: string,
	data: DuLieuTin,
	c: { zaloHoiId: string; chatId: string; goc: string },
) {
	const xuLy = (zaloEvents as unknown as Record<string, XuLyKenh>)[ten];
	if (!xuLy) throw new Error(`thieu su kien ${ten}`);
	await xuLy(
		data,
		{
			continuationToken: `zalo:chat:${c.chatId}:${nguoi.id}:x`,
			setContinuationToken: () => {},
		},
		ctxGoc(c),
	);
}

async function moTroLy(goc: string) {
	const con = ctxConCua(goc);
	await (loiDan as unknown as { events: { "session.started": BatDau } }).events[
		"session.started"
	]({ type: "session.started" }, con);
	return con;
}

describe("tlk-zalo", () => {
	test("tlk-zalo: cau quy dinh di qua tro_ly_kho, gui ban da kiem; cau khong co trang tu choi; cau thoa thuan giu nguyen", async () => {
		moMayChu();
		const c1 = await cauZalo();
		const con = await moTroLy(c1.goc);
		expect(
			await db.taiLieuHoi.count({ where: { zaloHoiId: c1.zaloHoiId } }),
			"hang co truoc buoc model dau",
		).toBe(1);
		await moTroLy(c1.goc);
		expect(
			await db.taiLieuHoi.count({ where: { zaloHoiId: c1.zaloHoiId } }),
			"goi hai lan van mot hang",
		).toBe(1);
		const doc = await goiCongCu<{ phienBan: number }>(
			readPage,
			{ slug: trang.slug },
			con,
		);
		if (!doc.ok) throw new Error(doc.loi);
		const nop = await goiCongCu(
			nopTraLoi,
			{
				loai: "tra-loi",
				cau: [
					{
						chu: "Công tác phí là 300.000 đồng mỗi ngày.",
						trich: [
							{
								slug: trang.slug,
								phienBan: doc.ra.phienBan,
								doan: "Công tác phí mỗi ngày là 300.000 đồng.",
							},
						],
					},
				],
			},
			con,
		);
		expect(nop.ok).toBe(true);
		await suKien(
			"message.completed",
			{ message: GOC, finishReason: "stop" },
			c1,
		);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { zaloHoiId: c1.zaloHoiId },
		});
		const mong = locTraLoi(
			dungTraLoiZalo(parseTraLoi(hang.traLoi), ngayVnTuIso),
		);
		const gui = guiToi(c1.chatId);
		expect(gui).toEqual(mong);
		expect(gui.join("\n").includes(GOC), "tlk-zalo: GOC-VIET-ABC lot ra").toBe(
			false,
		);
		expect(gui.join("\n")).toContain("phiên bản");

		const c2 = await cauZalo();
		const con2 = await moTroLy(c2.goc);
		await goiCongCu(
			nopTraLoi,
			{ loai: "khong-biet", cauHoi: "Thử việc có hoa hồng không?" },
			con2,
		);
		await suKien(
			"message.completed",
			{ message: GOC, finishReason: "stop" },
			c2,
		);
		const h2 = await db.taiLieuHoi.findUniqueOrThrow({
			where: { zaloHoiId: c2.zaloHoiId },
		});
		expect(guiToi(c2.chatId).join("\n")).toBe(
			locTraLoi(dungTuChoi(parseGanNhat(h2.ganNhat ?? []))).join("\n"),
		);
		expect(guiToi(c2.chatId).join("\n").startsWith(TAI_LIEU_HOI.tuChoi)).toBe(
			true,
		);

		const c3 = await cauZalo();
		await suKien(
			"message.completed",
			{
				message: "Thoả thuận đang ở giai đoạn chào giá.",
				finishReason: "stop",
			},
			c3,
		);
		expect(guiToi(c3.chatId)).toEqual([
			"Thoả thuận đang ở giai đoạn chào giá.",
		]);
		expect(
			await db.taiLieuHoi.count({ where: { zaloHoiId: c3.zaloHoiId } }),
		).toBe(0);

		expect(
			await db.zaloHoi.count({
				where: {
					crmUserId: nguoi.id,
					id: { in: [c1.zaloHoiId, c2.zaloHoiId, c3.zaloHoiId] },
				},
			}),
		).toBe(3);
		expect(
			await db.taiLieuHoi.count({
				where: { nguoiHoiId: nguoi.id, kenh: "CRM" },
			}),
		).toBe(0);

		const ngoai = await goiCongCu(readPage, { slug: trang.slug }, ctxGoc(c3));
		expect(ngoai.ok, "tlk-zalo: read_page chay ngoai tro_ly_kho").toBe(false);
	});

	test("tlk-zalo: 402 o buoc model dau cua tro_ly_kho tren Zalo, dung mot hang LOI het-tran, tin gui la cau het han muc", async () => {
		moMayChu();
		for (const duong of ["message.completed", "turn.failed"] as const) {
			const c = await cauZalo();
			await moTroLy(c.goc);
			await xuLyKetQuaCua<XuLyKetQua>()(
				{
					type: "action.result",
					data: {
						result: ketQuaConEve(c.zaloHoiId, LOI.hetTinDung),
					},
				},
				ctxGoc(c),
			);
			const hang = await db.taiLieuHoi.findMany({
				where: { zaloHoiId: c.zaloHoiId },
			});
			expect(hang.map((h) => `${h.trangThai} ${h.lyDo}`)).toEqual([
				"LOI het-tran",
			]);
			await suKien(
				duong,
				duong === "message.completed"
					? { message: "Xin lỗi.", finishReason: "stop" }
					: {},
				c,
			);
			expect(guiToi(c.chatId), `tlk-zalo: ${duong}`).toEqual([
				TAI_LIEU_HOI.hetTran,
			]);
		}
	});

	test("tlk-zalo: phien con xong ma chua nop tren Zalo, hang dong LOI loi-model, tin gui la cau chua tra loi", async () => {
		moMayChu();
		const c = await cauZalo();
		await moTroLy(c.goc);
		const hangDau = await db.taiLieuHoi.findUniqueOrThrow({
			where: { zaloHoiId: c.zaloHoiId },
		});
		await xuLyKetQuaCua<XuLyKetQua>()(
			{
				type: "action.result",
				data: { result: ketQuaConEve(hangDau.id) },
			},
			ctxGoc(c),
		);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { zaloHoiId: c.zaloHoiId },
		});
		expect(`tlk-zalo: xong chua nop: ${hang.trangThai} ${hang.lyDo}`).toBe(
			"tlk-zalo: xong chua nop: LOI loi-model",
		);
		await suKien(
			"message.completed",
			{ message: GOC, finishReason: "stop" },
			c,
		);
		expect(guiToi(c.chatId)).toEqual([TAI_LIEU_HOI.chuaTraLoi]);
	});
});
