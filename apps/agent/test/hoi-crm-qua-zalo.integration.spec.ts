import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "@crm/db";
import { thanhVienPrincipal } from "../agent/lib/thanh-vien-principal";
import {
	dongHoi,
	dongHoiQuaHan,
	hoiTacTu,
	type KetHoi,
	type TinHoi,
} from "../agent/lib/zalo-hoi";
import { ZALO } from "../agent/lib/zalo-config";
import taskInstructions from "../agent/instructions/task";
import { boThanhVien, donHoi, gieoVai } from "./support/hoi-gieo";
import { donDep, moXuong } from "./support/nhac-gieo";
import { TOKEN } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

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

const GIAY_MS = 1_000;
const PHUT_MS = 60 * GIAY_MS;
let soTin = 0;

function tin(chatId: string): TinHoi {
	soTin += 1;
	return { messageId: `hcz-${Date.now()}-${soTin}`, chatId, text: "Thoả thuận nào sắp hạn?" };
}

async function hoi(chatId: string, userId: string, luc: Date): Promise<KetHoi> {
	return db.$transaction((tx) => hoiTacTu(tx, tin(chatId), userId, luc));
}

async function hoiRoiDong(chatId: string, userId: string, luc: Date, ket: "da-tra-loi" | "gui-hong" = "da-tra-loi") {
	const ra = await hoi(chatId, userId, luc);
	expect(ra.loai, `cau luc ${luc.toISOString()} mo phien`).toBe("hoi");
	if (ra.loai === "hoi") await dongHoi(ra.yeuCau.hoiId, { ketQua: ket, traLoiLuc: luc });
	return ra;
}

async function ketCuoi(userId: string): Promise<string | undefined> {
	const hang = await db.zaloHoi.findFirst({ where: { crmUserId: userId }, orderBy: [{ hoiLuc: "desc" }, { id: "desc" }] });
	return hang?.ketQua;
}

function vn(ngay: string, gio: string): Date {
	return new Date(`${ngay}T${gio}:00+07:00`);
}

describe("tu-choi-vai", () => {
	test("tu-choi-vai: hoiTacTu tu choi okr va nguoi mat member, ghi hang tu-choi-vai", async () => {
		const B = await gieoVai("Binh", "okr");
		const C = await gieoVai("Cuong", "member");
		await boThanhVien(C.id);
		for (const [nguoi, chat] of [[B, "ZB"], [C, "ZC"]] as const) {
			const ra = await hoi(chat, nguoi.id, vn("2026-10-15", "10:00"));
			expect(ra).toEqual({ loai: "tra-loi", text: ZALO.loi.hoiKhongQuyen });
			expect(await ketCuoi(nguoi.id)).toBe("tu-choi-vai");
		}
	});

	test("tu-choi-vai: vai kinh doanh mo phien dung principal va token", async () => {
		const A = await gieoVai("An", "member");
		const ra = await hoi("ZA", A.id, vn("2026-10-15", "10:00"));
		expect(ra.loai).toBe("hoi");
		if (ra.loai !== "hoi") return;
		expect(ra.yeuCau.auth).toEqual({
			authenticator: "zalo",
			principalType: "user",
			principalId: A.id,
			attributes: { purpose: "zalo", userId: A.id, zaloChatId: "ZA", hoiId: ra.yeuCau.hoiId },
		});
		expect(ra.yeuCau.continuationToken).toBe("chat:ZA");
		expect(await ketCuoi(A.id)).toBe("dang-hoi");
	});
});

describe("tran", () => {
	test("tran: (a) cau thu tu trong mot phut bi chan", async () => {
		const A = await gieoVai("An", "member");
		const goc = vn("2026-10-15", "09:00");
		for (let i = 0; i < ZALO.hoi.tran.phut; i += 1) {
			await hoiRoiDong("ZA", A.id, new Date(goc.getTime() + i * 10 * GIAY_MS));
		}
		const ra = await hoi("ZA", A.id, new Date(goc.getTime() + 40 * GIAY_MS));
		expect(ra).toEqual({ loai: "tra-loi", text: ZALO.loi.hetTranPhut });
		expect(await ketCuoi(A.id)).toBe("tu-choi-tran-phut");
	});

	test("tran: (b)(c) tran ngay theo gio xuong, hang tu choi, dang-ban, loi khong tinh", async () => {
		const A = await gieoVai("An", "member");
		const ngay = "2026-10-15";
		for (let i = 0; i < ZALO.hoi.tran.ngay - 1; i += 1) {
			await hoiRoiDong("ZA", A.id, new Date(vn(ngay, "08:00").getTime() + i * 2 * PHUT_MS));
		}
		const nhieu = ["tu-choi-tran-phut", "tu-choi-tran-phut", "dang-ban", "dang-ban", "loi", "loi"];
		await db.zaloHoi.createMany({
			data: nhieu.map((ketQua, i) => ({
				messageId: `hcz-nhieu-${Date.now()}-${i}`,
				crmUserId: A.id,
				zaloChatId: "ZA",
				hoiLuc: vn(ngay, "12:00"),
				ketQua,
			})),
		});
		await hoiRoiDong("ZA", A.id, vn(ngay, "15:00"), "gui-hong");
		const bi = await hoi("ZA", A.id, vn(ngay, "15:05"));
		expect(bi, "cau 21 bi chan theo ngay").toEqual({ loai: "tra-loi", text: ZALO.loi.hetTranNgay(ZALO.hoi.tran.ngay) });
		const truocNuaDem = await hoi("ZA", A.id, new Date("2026-10-15T16:59:00Z"));
		expect(truocNuaDem.loai, "23:59 gio VN van la ngay cu").toBe("tra-loi");
		const sauNuaDem = await hoi("ZA", A.id, new Date("2026-10-15T17:01:00Z"));
		expect(sauNuaDem.loai, "ngay xuong dem lai luc 00:00 gio VN").toBe("hoi");
	});

	test("tran: (d) tran thang ca xuong theo thang gio VN", async () => {
		const A = await gieoVai("An", "member");
		const D = await gieoVai("Dung", "member");
		const can = ZALO.hoi.tran.thang - 1;
		await db.zaloHoi.createMany({
			data: Array.from({ length: can }, (_, i) => ({
				messageId: `hcz-thang-${Date.now()}-${i}`,
				crmUserId: i % 2 === 0 ? A.id : D.id,
				zaloChatId: i % 2 === 0 ? "ZA" : "ZD",
				hoiLuc: new Date(vn("2026-10-01", "08:00").getTime() + i * PHUT_MS),
				ketQua: "da-tra-loi",
			})),
		});
		await hoiRoiDong("ZA", A.id, vn("2026-10-20", "10:00"));
		const bi = await hoi("ZA", A.id, vn("2026-10-20", "10:05"));
		expect(bi).toEqual({ loai: "tra-loi", text: ZALO.loi.hetTranThang });
		const cuoiThang = await hoi("ZA", A.id, new Date("2026-10-31T16:59:00Z"));
		expect(cuoiThang.loai, "23:59 ngay 31/10 gio VN van thang cu").toBe("tra-loi");
		const dauThang = await hoi("ZA", A.id, new Date("2026-10-31T17:01:00Z"));
		expect(dauThang.loai, "thang xuong dem lai luc 00:00 ngay 1 gio VN").toBe("hoi");
	});
});

describe("dang-ban", () => {
	test("dang-ban: con hang dang-hoi duoi han thi cau moi la dang-ban", async () => {
		const goc = vn("2026-10-15", "10:00");
		let daKiem = 0;
		for (const [ten, chat, truoc] of [["An", "ZA", 30 * GIAY_MS], ["Ba", "ZE", 3 * PHUT_MS]] as const) {
			const nguoi = await gieoVai(ten, "member");
			await hoi(chat, nguoi.id, new Date(goc.getTime() - truoc));
			const ra = await hoi(chat, nguoi.id, goc);
			expect(ra, `dang ban toi han: ${ten}`).toEqual({ loai: "tra-loi", text: ZALO.loi.dangTraLoi });
			expect(await ketCuoi(nguoi.id)).toBe("dang-ban");
			daKiem += 1;
		}
		expect(daKiem).toBe(2);
	});

	test("dang-ban: tick dong hang qua han, bao tacTuLoi mot lan, cau moi mo phien", async () => {
		const A = await gieoVai("An", "member");
		const goc = vn("2026-10-15", "10:00");
		const cu = await hoi("ZA", A.id, new Date(goc.getTime() - ZALO.hoi.hanTraLoiMs - GIAY_MS));
		expect(cu.loai).toBe("hoi");
		const zalo = zaloGia();
		const dong = await dongHoiQuaHan({ now: () => goc, fetcher: zalo.fetcher, token: TOKEN });
		expect(dong).toBeGreaterThanOrEqual(1);
		expect(zalo.guiToi("ZA").map((g) => g.body.text)).toEqual([ZALO.loi.tacTuLoi]);
		await dongHoiQuaHan({ now: () => goc, fetcher: zalo.fetcher, token: TOKEN });
		expect(zalo.guiToi("ZA").length, "tacTuLoi mot lan").toBe(1);
		if (cu.loai === "hoi") {
			const hang = await db.zaloHoi.findUniqueOrThrow({ where: { id: cu.yeuCau.hoiId } });
			expect(hang.ketQua).toBe("loi");
		}
		const moi = await hoi("ZA", A.id, goc);
		expect(moi.loai).toBe("hoi");
	});
});
