import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { parseNoiDungThongBao } from "@crm/validation/thong-bao";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import {
	donDep,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	slackGia,
	TIEN_TO,
} from "./support/nhac-gieo";
import {
	hangCua,
	lucVN,
	NGAY_NHAC,
	ngayCach,
	PHUT_SAU,
} from "./support/nhac-gui-gieo";
import {
	batBot,
	donOkr,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	noiZalo,
	tatBot,
	voiToken,
} from "./support/okr-gieo";
import { zaloGia } from "./support/zalo-gia";

const APP_URL = "https://crm.test";

function kiem(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function slug(): Promise<string> {
	const x = await db.organization.findUniqueOrThrow({
		where: { id: WORKSPACE_ID },
		select: { slug: true },
	});
	return x.slug ?? "";
}

async function donThem(): Promise<void> {
	await db.thongBao.deleteMany({
		where: { nguoiNhanId: { startsWith: TIEN_TO } },
	});
	await db.account.deleteMany({ where: { providerId: "slack" } });
}

async function dongThongBao(userId: string) {
	const hang = await db.thongBao.findMany({ where: { nguoiNhanId: userId } });
	return hang.filter(
		(h) => parseNoiDungThongBao(h.noiDung).loai === "okr-cap-nhat",
	);
}

beforeEach(async () => {
	await donOkr();
	await donDep();
	await donThem();
	await moXuong();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donThem();
	await donOkr();
	await donDep();
	await tatBot();
});

describe("ctlk-nhac-dong", () => {
	test("ctlk-nhac-dong: A mot KR toi /okr/kr/<id>, B ba KR toi /okr, Zalo Slack va hop thong bao cung dich, khong tu=", async () => {
		const goc = lucVN(NGAY_NHAC, PHUT_SAU);
		const A = await gieoNguoi("An");
		const B = await gieoNguoi("Binh");
		await batBot();
		await noiZalo(A.id, "ZA");
		await noiSlack(B.id);
		await khopSlack(B.id, "U-CTLK-B");

		const ky = await gieoChuKy("dang-chay", 1);
		const oA = await gieoMucTieu({
			cycleId: ky,
			chu: A.id,
			congBo: ngayCach(goc, -20),
		});
		const krA = await gieoKr({
			objectiveId: oA,
			chu: A.id,
			khoa: ngayCach(goc, -20),
		});
		const oB = await gieoMucTieu({
			cycleId: ky,
			chu: B.id,
			congBo: ngayCach(goc, -20),
		});
		for (const viTri of [0, 1, 2])
			await gieoKr({
				objectiveId: oB,
				chu: B.id,
				khoa: ngayCach(goc, -20),
				viTri,
			});

		setSystemTime(goc);
		await lenLichNhac(goc);
		const z = zaloGia();
		const s = slackGia();
		for (const nguoi of [A, B])
			await voiToken(async () =>
				chayNhac(await hangCua(nguoi.id), {
					fetcher: s.fetcher,
					zaloFetcher: z.fetcher,
					appUrl: APP_URL,
				}),
			);
		const xuong = await slug();

		const tbA = await dongThongBao(A.id);
		const tbB = await dongThongBao(B.id);
		expect(tbA.length, "A nhan dung 1 dong thong bao cap nhat").toBe(1);
		expect(tbA[0]?.duongDan).toBe(`/okr/kr/${krA}`);
		kiem(
			tbB[0]?.duongDan === "/okr",
			`ctlk-nhac-dong: dong thong bao cua B mang ${tbB[0]?.duongDan ?? "(khong co)"}, mong /okr`,
		);
		kiem(
			!(tbB[0]?.duongDan ?? "").includes("tu="),
			"ctlk-nhac-dong: dong thong bao cua B mang tu=nhac",
		);

		const tinA = z.guiToi("ZA");
		expect(tinA.length, "A nhan dung 1 tin Zalo").toBe(1);
		const chuA = tinA[0]?.body.text ?? "";
		expect(chuA).toContain(`${APP_URL}/${xuong}/okr/kr/${krA}`);
		expect(chuA).not.toContain("tu=");

		const tinB = s.goi
			.map((g) => g.body.text ?? "")
			.filter((t) => t.includes("KR chờ cập nhật"));
		expect(tinB.length, "B nhan dung 1 tin Slack co muc cap nhat").toBe(1);
		const chuB = tinB[0] ?? "";
		expect(chuB).toContain(`<${APP_URL}/${xuong}/okr|mở Của tôi>`);
		expect(chuB).not.toContain("tu=");
		expect(chuB).not.toContain(`${APP_URL}/${xuong}/okr/kr/`);
	});
});
