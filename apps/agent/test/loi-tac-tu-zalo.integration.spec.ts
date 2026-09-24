import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	spyOn,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { guiThuPhanHoi } from "@crm/validation/zalo-cau-noi";
import { zaloToken } from "../agent/lib/zalo-api";
import { guiThu } from "../agent/lib/zalo-bot-xuong";
import {
	donDep,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	slackGia,
} from "./support/nhac-gieo";

type CaSlack = {
	ten: string;
	fetcher: typeof fetch;
	guiDuoc: boolean;
	soDongLoi: number;
};

const slackTuChoi = (async () =>
	Response.json({ ok: false, error: "channel_not_found" })) as typeof fetch;

const slackDutMang = (async () => {
	throw new TypeError("fetch failed");
}) as typeof fetch;

const CA: CaSlack[] = [
	{
		ten: "a slack tu choi",
		fetcher: slackTuChoi,
		guiDuoc: false,
		soDongLoi: 1,
	},
	{
		ten: "b slack dut mang",
		fetcher: slackDutMang,
		guiDuoc: false,
		soDongLoi: 1,
	},
	{
		ten: "c slack ok",
		fetcher: slackGia().fetcher,
		guiDuoc: true,
		soDongLoi: 0,
	},
];

const donSau: string[] = [];

beforeAll(async () => {
	await moXuong();
});

afterEach(async () => {
	for (const id of donSau.splice(0)) {
		await db.slackMemberMatch.deleteMany({ where: { crmUserId: id } });
		await db.account.deleteMany({ where: { userId: id } });
	}
	await donDep();
});

afterAll(async () => {
	await donDep();
});

describe("gui-thu-slack-hong", () => {
	test("gui-thu-slack-hong: Slack hong -> guiDuoc false, khong nem; Slack ok -> guiDuoc true", async () => {
		const V = await gieoNguoi("Vinh Slack Hong");
		donSau.push(V.id);
		await noiSlack(V.id);
		await khopSlack(V.id, "SVH");
		const kenh = await kenhSeDungCua(db, V.id, {
			coToken: (await zaloToken()) !== null,
		});
		expect(kenh.kenh, "V chi khop Slack").toBe("slack");
		let soO = 0;
		for (const ca of CA) {
			const loiGhi = spyOn(console, "error").mockImplementation(() => {});
			try {
				const ket = await guiThu(V.id, { slackFetcher: ca.fetcher }).then(
					(r) => guiThuPhanHoi.parse(r),
					(loi: unknown) => ({
						nem: loi instanceof Error ? loi.message : String(loi),
					}),
				);
				expect(
					ket,
					`${ca.ten}: slack hong -> guiDuoc false, khong nem`,
				).toEqual({
					kenh: "slack",
					lech: kenh.lech,
					guiDuoc: ca.guiDuoc,
				});
				const dong = loiGhi.mock.calls
					.map((c) => String(c[0]))
					.filter((d) => d.startsWith("[zalo] slack hong:"));
				expect(dong.length, `${ca.ten}: so dong log slack hong`).toBe(
					ca.soDongLoi,
				);
			} finally {
				loiGhi.mockRestore();
			}
			soO += 1;
		}
		expect(soO, "du ba o").toBe(CA.length);
	});
});
