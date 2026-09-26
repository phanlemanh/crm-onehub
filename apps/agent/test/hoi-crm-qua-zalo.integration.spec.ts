import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { thanhVienPrincipal } from "../agent/lib/thanh-vien-principal";
import { ZALO } from "../agent/lib/zalo-config";
import taskInstructions from "../agent/instructions/task";
import { boThanhVien, donHoi, gieoVai } from "./support/hoi-gieo";
import { donDep, moXuong } from "./support/nhac-gieo";

const GOC_AGENT = resolve(import.meta.dir, "..");

beforeAll(async () => {
	await moXuong();
});

beforeEach(async () => {
	await donHoi();
});

afterAll(async () => {
	await donHoi();
	await donDep();
});

describe("tu-choi-vai", () => {
	test("tu-choi-vai: thanhVienPrincipal cho vai kinh doanh, null cho okr va nguoi mat member", async () => {
		const A = await gieoVai("An", "member");
		const Q = await gieoVai("Quan", "admin");
		const B = await gieoVai("Binh", "okr");
		const C = await gieoVai("Cuong", "member");
		await boThanhVien(C.id);

		expect(await thanhVienPrincipal(A.id, "zalo")).toEqual({
			authenticator: "zalo",
			principalId: A.id,
			principalType: "user",
		});
		expect((await thanhVienPrincipal(Q.id, "zalo"))?.principalId).toBe(Q.id);
		expect(await thanhVienPrincipal(B.id, "zalo")).toBeNull();
		expect(await thanhVienPrincipal(C.id, "zalo")).toBeNull();
	});

	test("tu-choi-vai: cau noi web va kenh Zalo goi cung mot ham cong vai", () => {
		const eve = readFileSync(resolve(GOC_AGENT, "agent/channels/eve.ts"), "utf8");
		expect(eve).toContain("thanhVienPrincipal(");
		expect(eve).not.toContain("laVaiChiOkr");
	});
});

type PhienGia = {
	session: {
		id: string;
		auth: {
			current: { attributes: Record<string, string> } | null;
			initiator: null;
		};
	};
};

function phienGia(purpose: string): PhienGia {
	return {
		session: {
			id: "ses-chi-dan",
			auth: { current: { attributes: { purpose } }, initiator: null },
		},
	};
}

async function chiDanCua(
	suKien: "session.started" | "turn.started",
	purpose: string,
): Promise<string> {
	const moc = taskInstructions.events[suKien] as unknown as (
		e: unknown,
		c: PhienGia,
	) => Promise<{ markdown?: string } | null> | { markdown?: string } | null;
	const ra = await moc({}, phienGia(purpose));
	return ra?.markdown ?? "";
}

const CUM_CHI_DAN = [
	"tiếng Việt",
	"không bảng",
	"chỉ đọc",
	"số điện thoại",
	"email",
	"nguyên văn",
	"AppSetting",
	"không có câu trả lời",
];

const CAU_MOI = [
	ZALO.loi.hoiKhongQuyen,
	ZALO.loi.hetTranPhut,
	ZALO.loi.hetTranNgay(ZALO.hoi.tran.ngay),
	ZALO.loi.hetTranThang,
	ZALO.loi.dangTraLoi,
	ZALO.loi.tacTuLoi,
	ZALO.loi.daMoi,
];

describe("chi-dan", () => {
	test("chi-dan: phien zalo nhan chi dan du tam cum, duoi tran ky tu", async () => {
		for (const suKien of ["session.started", "turn.started"] as const) {
			const md = await chiDanCua(suKien, ZALO.hoi.purpose);
			let daKiem = 0;
			for (const cum of CUM_CHI_DAN) {
				expect(md, `${suKien} thieu cum ${cum}`).toContain(cum);
				daKiem += 1;
			}
			expect(daKiem).toBe(CUM_CHI_DAN.length);
			expect(md.length).toBeLessThan(ZALO.tranKyTu);
			expect(md).not.toContain("structured deal list");
		}
	});

	test("chi-dan: phien builder khong nhan chi dan zalo", async () => {
		const md = await chiDanCua("turn.started", "builder");
		expect(md).not.toContain("AppSetting");
		expect(md.length).toBeGreaterThan(0);
	});

	test("chi-dan: bay cau moi mot dong, co dau, dung tu dien", () => {
		expect(CAU_MOI.length).toBe(7);
		for (const cau of CAU_MOI) {
			expect(cau).not.toContain("\n");
			expect(cau.length).toBeLessThan(ZALO.tranKyTu);
			expect(cau).toMatch(/[ăâđêôơưáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/iu);
			expect(cau.toLowerCase()).not.toContain("trợ lý");
			expect(cau.toLowerCase()).not.toContain("thông báo");
		}
	});
});
