import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	bam,
	batDongHoGia,
	CUOC,
	cho,
	chu,
	daDung,
	daGui,
	datAgent,
	datLai,
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
	chu('[data-luot="loi"] [data-slot="alert-title"]') === m.hoiThoai.loi;

describe("hong — tac nhan chet giua chung", () => {
	test("(a) phiên đã kết thúc mà cuộc còn đang soạn: báo lỗi và có Thử lại", async () => {
		datThread({
			status: "ended",
			session: { sessionId: "phien-1", streamIndex: 3 },
			events: [TIN_CU] as never,
		});
		await moMan();
		expect(coLoi()).toBe(true);
		expect(chu('[data-luot="loi"] [data-slot="alert-description"]')).toBe(
			m.hoiThoai.loiMoTaKhac,
		);
		expect(q('[data-nut="thu-lai"]')).not.toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
	});

	test("(a) tác nhân chết 5 giây sau khi bắt đầu lượt: báo lỗi và có Thử lại", async () => {
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		batDongHoGia();
		await datAgent({ status: "streaming", events: [{ type: "turn.started" }] });
		await troi(5_000);
		expect(coLoi()).toBe(false);
		await datAgent({ status: "error", error: new Error("session ended") });
		expect(coLoi()).toBe(true);
		expect(q('[data-nut="thu-lai"]')).not.toBeNull();
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
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
		expect(q('[data-nut="thu-lai"]')).not.toBeNull();
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
		expect(chu('[data-luot="loi"] [data-slot="alert-description"]')).toBe(
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
		await datAgent({ status: "streaming", events: [{ type: "turn.started" }] });
		await troi(SOAN_UI.hanKhongSuKienMs + 100);
		expect(coLoi()).toBe(true);
		await bam(q('[data-nut="thu-lai"]'));
		expect(daDung).toBe(1);
		expect(daGui).toEqual(["Giữ khách là chính", "Giữ khách là chính"]);
		expect(coLoi()).toBe(false);
		await troi(SOAN_UI.hanKhongSuKienMs - 1_000);
		expect(coLoi()).toBe(false);
		await troi(1_100);
		expect(coLoi()).toBe(true);
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
		await bam(q('[data-nut="thu-lai"]'));
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
		await bam(q('[data-nut="thu-lai"]'));
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
	const chiBao = () =>
		q('[role="status"][aria-live="polite"][aria-busy="true"]')?.textContent ??
		null;

	test("mở lại khi Trợ lý đang trả lời: hiện «đang soạn», ô soạn khoá, không gợi ý", async () => {
		dangChay();
		await datAgent({ data: { messages: [noiTroLy("a0", MO_DAU)] } });
		await moMan();
		expect(chiBao()).toContain(m.hoiThoai.dangSoan);
		expect(oSoan().disabled).toBe(true);
		expect(q('[data-o-soan="khoa"]')).not.toBeNull();
		expect(chu("[data-o-soan-ghi]")).toBe(m.hoiThoai.khoaKhiSoan);
		expect(q("[data-goi-y]")).toBeNull();
		expect((q('[data-nut="dua-vao"]') as HTMLButtonElement).disabled).toBe(
			true,
		);
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
		expect(chiBao()).toBeNull();
		expect(oSoan().disabled).toBe(false);
		expect(chu("[data-o-soan-ghi]")).toBe(m.hoiThoai.phim);
	});

	test("lượt đang chạy xong ở lần hỏi lại: ô soạn mở, bảng đọc lại", async () => {
		batDongHoGia();
		dangChay();
		await moMan();
		expect(oSoan().disabled).toBe(true);
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
		await cho(() => oSoan()?.disabled === false, "o soan mo lai");
		expect(chiBao()).toBeNull();
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
		expect(q('[data-nut="thu-lai"]')).not.toBeNull();
	});
});
