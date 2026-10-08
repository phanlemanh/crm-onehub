import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { KARA_TRE_MS } from "@crm/ui/components/kara/state";
import type { MessageStreamEvent } from "eve/client";
import { act } from "react";
import {
	bam,
	batDongHoGia,
	CUOC,
	cho,
	chu,
	daDung,
	daGui,
	daPhanLoai,
	daTaiLuong,
	datAgent,
	datLai,
	datLuong,
	datThread,
	don,
	go,
	goiCua,
	MO_DAU,
	m,
	moMan,
	noiTroLy,
	q,
	SOAN_UI,
	soLanMoAgent,
	troi,
} from "./khung-soan-okr";

beforeEach(datLai);
afterEach(don);

const TIN_CU = {
	type: "message.completed",
	meta: { at: "2026-12-01T03:00:00.000Z" },
};

const coLoi = () =>
	chu('[data-luot="loi"] [data-slot="empty-title"]') === m.hoiThoai.loi;

const CHET_SAU_MS = 5_000;
const LUOT = "luot-1";
const CHET_IM_PHAI_BAO_LOI =
	"tac nhan chet im sau 5 giay: qua 45 giay khong su kien, man phai bao Tro ly OKR chua tra loi duoc va co Thu lai";
const CHET_IM_KHONG_CO_KET_THUC =
	"luong cua tac nhan chet im khong co su kien ket thuc nen classify phai van doc la working";

const luc = (batDau: number, sau: number, so: number) => ({
	at: new Date(batDau + sau).toISOString(),
	id: `su-kien-${so}`,
});

function luongDangChay(batDau: number): MessageStreamEvent[] {
	return [
		{ type: "session.started", data: {}, meta: luc(batDau, 0, 1) },
		{
			type: "message.received",
			data: { message: MO_DAU, sequence: 1, turnId: LUOT },
			meta: luc(batDau, 0, 2),
		},
		{
			type: "turn.started",
			data: { sequence: 2, turnId: LUOT },
			meta: luc(batDau, 0, 3),
		},
		{
			type: "step.started",
			data: { sequence: 3, stepIndex: 0, turnId: LUOT },
			meta: luc(batDau, 0, 4),
		},
	];
}

function luongToiLucChetIm(batDau: number): MessageStreamEvent[] {
	return [
		...luongDangChay(batDau),
		{
			type: "message.appended",
			data: {
				messageDelta: "Kỳ trước",
				messageSoFar: "Kỳ trước",
				sequence: 4,
				stepIndex: 0,
				turnId: LUOT,
			},
			meta: luc(batDau, 2_000, 5),
		},
		{
			type: "message.appended",
			data: {
				messageDelta: " phòng đạt",
				messageSoFar: "Kỳ trước phòng đạt",
				sequence: 5,
				stepIndex: 0,
				turnId: LUOT,
			},
			meta: luc(batDau, CHET_SAU_MS, 6),
		},
	];
}

const phienKhongTiepNoi = (events: MessageStreamEvent[]) => ({
	session: { sessionId: CUOC.sessionId, streamIndex: events.length },
	events,
});

const KET_THUC = new Set([
	"session.completed",
	"session.failed",
	"turn.completed",
	"turn.failed",
	"step.failed",
]);

describe("hong — tac nhan chet giua chung", () => {
	test("phiên eve đã kết thúc mà cuộc còn đang soạn: báo lỗi và có Thử lại", async () => {
		datThread({
			status: "ended",
			session: { sessionId: CUOC.sessionId, streamIndex: 1 },
			events: [TIN_CU] as never,
		});
		await moMan();
		expect(coLoi()).toBe(true);
		expect(chu('[data-luot="loi"] [data-slot="empty-description"]')).toBe(
			m.hoiThoai.loiMoTaKhac,
		);
		expect(q('[data-luot="loi"] [data-slot="kara-retry"]')).not.toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
	});

	test("(a) tác nhân chết im sau 5 giây, không sự kiện kết thúc: 44 giây sau sự kiện cuối chưa báo, quá 45 giây thì báo lỗi và có Thử lại", async () => {
		batDongHoGia();
		const batDau = Date.now();
		datLuong(phienKhongTiepNoi(luongDangChay(batDau)));
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		await troi(CHET_SAU_MS);
		const luongChet = luongToiLucChetIm(batDau);
		datLuong(phienKhongTiepNoi(luongChet));
		await troi(SOAN_UI.hoiLuongMs + 200);
		expect(luongChet.filter((e) => KET_THUC.has(e.type))).toEqual([]);
		expect(daTaiLuong.length).toBeGreaterThan(1);
		expect(
			daPhanLoai.every((t) => t === "working"),
			CHET_IM_KHONG_CO_KET_THUC,
		).toBe(true);
		expect(
			q('[data-kara-turn="kara"] [data-kara-state="working"]'),
		).not.toBeNull();
		expect(coLoi()).toBe(false);
		await troi(SOAN_UI.hanKhongSuKienMs - SOAN_UI.hoiLuongMs - 1_200);
		expect(coLoi()).toBe(false);
		await troi(SOAN_UI.hoiLuongMs + 1_300);
		expect(daPhanLoai.at(-1), CHET_IM_KHONG_CO_KET_THUC).toBe("working");
		expect(coLoi(), CHET_IM_PHAI_BAO_LOI).toBe(true);
		expect(chu('[data-luot="loi"] [data-slot="empty-description"]')).toBe(
			m.hoiThoai.loiMoTa,
		);
		expect(
			q('[data-luot="loi"] [data-slot="kara-retry"]'),
			CHET_IM_PHAI_BAO_LOI,
		).not.toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
	});

	test("(a) mở lại màn sau khi tác nhân đã chết im: quá 45 giây không sự kiện thì báo lỗi và có Thử lại", async () => {
		batDongHoGia();
		const batDau = Date.now() - CHET_SAU_MS;
		datLuong(phienKhongTiepNoi(luongToiLucChetIm(batDau)));
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		expect(daPhanLoai.at(-1), CHET_IM_KHONG_CO_KET_THUC).toBe("working");
		await troi(SOAN_UI.hanKhongSuKienMs - 1_000);
		expect(coLoi()).toBe(false);
		await troi(1_100);
		expect(coLoi(), CHET_IM_PHAI_BAO_LOI).toBe(true);
		expect(
			q('[data-luot="loi"] [data-slot="kara-retry"]'),
			CHET_IM_PHAI_BAO_LOI,
		).not.toBeNull();
	});

	test("(a) phiên còn sống: không báo lỗi", async () => {
		datThread({
			status: "ready",
			session: {
				sessionId: "phien-1",
				streamIndex: 3,
				continuationToken: "eve:song",
			},
			events: [TIN_CU] as never,
		});
		await moMan();
		expect(coLoi()).toBe(false);
		expect(q('[data-o-soan="mo"]')).not.toBeNull();
	});
});

describe("hong — 45 giay khong su kien", () => {
	test("(b) không sự kiện nào: 44 giây chưa báo, quá 45 giây thì báo", async () => {
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		batDongHoGia();
		await datAgent({ status: "streaming", events: [{ type: "turn.started" }] });
		await troi(44_000);
		expect(coLoi()).toBe(false);
		await troi(SOAN_UI.hanKhongSuKienMs - 44_000 + 1);
		expect(coLoi()).toBe(true);
		expect(q('[data-luot="loi"] [data-slot="kara-retry"]')).not.toBeNull();
	});

	test("(b) đúng mốc 45 giây mới báo, sự kiện mới dời mốc", async () => {
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		batDongHoGia();
		await datAgent({ status: "streaming", events: [{ type: "turn.started" }] });
		await troi(30_000);
		await datAgent({
			events: [{ type: "turn.started" }, { type: "message.delta" }],
		});
		await troi(44_000);
		expect(coLoi()).toBe(false);
		await troi(SOAN_UI.hanKhongSuKienMs - 44_000 + 100);
		expect(coLoi()).toBe(true);
		expect(chu('[data-luot="loi"] [data-slot="empty-description"]')).toBe(
			m.hoiThoai.loiMoTa,
		);
	});

	test("(b) lượt xong trước mốc: không báo", async () => {
		await moMan();
		batDongHoGia();
		await datAgent({ status: "streaming", events: [{ type: "turn.started" }] });
		await troi(20_000);
		await datAgent({ status: "ready" });
		await troi(60_000);
		expect(coLoi()).toBe(false);
	});
});

describe("hong — Thu lai roi van im", () => {
	test("Thử lại mà eve vẫn không có sự kiện: hẹn giờ lại và báo lại, không quay mãi", async () => {
		const { tuyChonAgent } = await import("./khung-soan-okr");
		const fetchCu = globalThis.fetch;
		const daHuyLuot: string[] = [];
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			daHuyLuot.push(String(input));
			return Response.json(
				{ ok: true, sessionId: "phien-1", status: "accepted" },
				{ status: 202 },
			);
		}) as typeof fetch;
		const suKien = [
			{
				type: "message.received" as const,
				meta: { id: "e1", at: "2026-10-01T00:00:01.000Z" },
				data: { message: "Giữ khách là chính", sequence: 1, turnId: "luot-9" },
			},
			{
				type: "turn.started" as const,
				meta: { id: "e2", at: "2026-10-01T00:00:02.000Z" },
				data: { sequence: 2, turnId: "luot-9" },
			},
		];
		try {
			await datAgent({
				data: { messages: [noiTroLy("a0", MO_DAU)] },
				session: {
					sessionId: "phien-1",
					continuationToken: "eve:live",
					streamIndex: 2,
				},
			});
			await moMan();
			await go(q("[data-o-soan] textarea"), "Giữ khách là chính");
			await bam(q('[data-o-soan] button[type="submit"]'));
			batDongHoGia();
			await datAgent({ status: "streaming", events: suKien });
			await troi(SOAN_UI.hanKhongSuKienMs + 100);
			expect(coLoi()).toBe(true);
			await bam(q('[data-luot="loi"] [data-slot="kara-retry"]'));
			await troi(20);
			expect(daDung).toBe(0);
			expect(daHuyLuot.filter((u) => u.endsWith("/cancel"))).toHaveLength(1);
			expect(daGui).toEqual(["Giữ khách là chính"]);
			const khep = {
				status: "ready",
				error: undefined,
				events: [
					...suKien,
					{
						type: "turn.cancelled" as const,
						meta: { id: "e3", at: "2026-10-01T00:00:03.000Z" },
						data: { sequence: 3, turnId: "luot-9" },
					},
					{
						type: "session.waiting" as const,
						meta: { id: "e4", at: "2026-10-01T00:00:04.000Z" },
						data: { continuationToken: "eve:moi", wait: "next-user-message" },
					},
				],
				data: { messages: [] },
				session: {
					sessionId: "phien-1",
					continuationToken: "eve:moi",
					streamIndex: 4,
				},
			} as Parameters<
				NonNullable<(typeof tuyChonAgent)[number]["onFinish"]>
			>[0];
			await act(async () => {
				tuyChonAgent.at(-1)?.onFinish?.(khep);
			});
			await troi(50);
			expect(daGui).toEqual(["Giữ khách là chính", "Giữ khách là chính"]);
			expect(goiCua("okr.soanMo")).toHaveLength(0);
			expect(coLoi()).toBe(false);
			await troi(SOAN_UI.hanKhongSuKienMs - 1_000);
			expect(coLoi()).toBe(false);
			await troi(1_100);
			expect(coLoi()).toBe(true);
		} finally {
			globalThis.fetch = fetchCu;
		}
	});
});

describe("hong — Thu lai", () => {
	test("(c) còn continuationToken: gửi lại tin cuối, không mở phiên mới", async () => {
		await datAgent({
			data: { messages: [noiTroLy("a0", MO_DAU)] },
			session: {
				sessionId: "phien-1",
				continuationToken: "eve:live",
				streamIndex: 2,
			},
		});
		await moMan();
		await go(q("[data-o-soan] textarea"), "Giữ khách là chính");
		await bam(q('[data-o-soan] button[type="submit"]'));
		expect(daGui).toEqual(["Giữ khách là chính"]);
		await datAgent({ status: "error", error: new Error("dut mang") });
		await bam(q('[data-luot="loi"] [data-slot="kara-retry"]'));
		expect(daGui).toEqual(["Giữ khách là chính", "Giữ khách là chính"]);
		expect(goiCua("okr.soanMo")).toHaveLength(0);
		expect(daDung).toBe(0);
	});

	test("(c) hết continuationToken: mở lại phiên qua soanMo rồi đọc lại bảng", async () => {
		datThread({
			status: "ended",
			session: { sessionId: "phien-1", streamIndex: 3 },
			events: [TIN_CU] as never,
		});
		await moMan();
		const truoc = goiCua("okr.soanDanhSach").length;
		await bam(q('[data-luot="loi"] [data-slot="kara-retry"]'));
		await cho(() => goiCua("okr.soanMo").length === 1, "goi soanMo");
		expect(goiCua("okr.soanMo")[0]?.dauVao).toEqual({
			cycleId: CUOC.cycleId,
			level: CUOC.level,
			divisionId: CUOC.divisionId,
			departmentId: CUOC.departmentId,
			thuLaiCuocId: CUOC.id,
		});
		await cho(
			() => goiCua("okr.soanDanhSach").length === truoc + 1,
			"doc lai bang",
		);
		expect(daGui).toEqual([]);
	});
});

describe("hong — luong nap len dang chay", () => {
	const LUOT_CHAY = [
		{ type: "message.received", meta: { at: "2026-12-01T03:00:00.000Z" } },
		{ type: "turn.started", meta: { at: "2026-12-01T03:00:01.000Z" } },
	];
	const dangChay = () =>
		datThread({
			status: "working",
			session: { sessionId: "phien-1", streamIndex: 2 },
			events: LUOT_CHAY as never,
		});
	const oSoan = () => q("[data-o-soan] textarea") as HTMLTextAreaElement;
	const nutDung = () =>
		q('[data-slot="kara-composer"] button[aria-label="Dừng"]');
	const nutGui = () =>
		q('[data-slot="kara-composer"] button[aria-label="Gửi"]');
	const coChiBao = () =>
		q('[data-kara-turn="kara"] [data-kara-state="working"]') !== null;
	const chiBao = async () => {
		if (!coChiBao()) return null;
		await act(async () => {
			await new Promise((r) => setTimeout(r, KARA_TRE_MS + 50));
		});
		return q('[data-kara-turn="kara"] [data-kara-state="working"]')
			?.textContent;
	};

	test("mở lại khi Trợ lý đang trả lời: hiện «đang soạn», ô soạn khoá, không gợi ý", async () => {
		dangChay();
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		expect(await chiBao()).toContain(m.hoiThoai.dangSoan);
		expect(nutDung()).not.toBeNull();
		expect(nutGui()).toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
		expect(q("[data-goi-y]")).toBeNull();
		const duaVao = q('[data-nut="dua-vao"]') as HTMLButtonElement | null;
		expect(duaVao === null || duaVao.disabled).toBe(true);
	});

	test("mở lại khi lượt đã xong: không chỉ báo, ô soạn mở", async () => {
		datThread({
			status: "ready",
			session: {
				sessionId: "phien-1",
				streamIndex: 3,
				continuationToken: "eve:song",
			},
			events: [...LUOT_CHAY, { ...TIN_CU, type: "session.waiting" }] as never,
		});
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		expect(await chiBao()).toBeNull();
		expect(oSoan().disabled).toBe(false);
		expect(nutGui()).not.toBeNull();
	});

	test("lượt đang chạy xong ở lần hỏi lại: ô soạn mở, bảng đọc lại", async () => {
		batDongHoGia();
		dangChay();
		await moMan();
		expect(nutDung()).not.toBeNull();
		const doc = goiCua("okr.soanDanhSach").length;
		const moTruoc = soLanMoAgent;
		datThread({
			status: "ready",
			session: {
				sessionId: "phien-1",
				streamIndex: 3,
				continuationToken: "eve:song",
			},
			events: [...LUOT_CHAY, { ...TIN_CU, type: "session.waiting" }] as never,
		});
		await troi(SOAN_UI.hoiLuongMs + 200);
		await cho(() => nutGui() !== null, "o soan mo lai");
		expect(coChiBao()).toBe(false);
		expect(goiCua("okr.soanDanhSach").length).toBeGreaterThan(doc);
		expect(soLanMoAgent).toBe(moTruoc + 1);
	});

	test("lượt đang chạy mà 45 giây không có sự kiện: báo lỗi, có Thử lại", async () => {
		batDongHoGia();
		dangChay();
		await moMan();
		await troi(SOAN_UI.hanKhongSuKienMs - 1_000);
		expect(coLoi()).toBe(false);
		await troi(1_100);
		expect(coLoi()).toBe(true);
		expect(q('[data-luot="loi"] [data-slot="kara-retry"]')).not.toBeNull();
	});
});
