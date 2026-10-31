import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
	dungSan,
	goi,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	truongMoi,
} from "./okr-san";

const CHO_MS = 60_000;
const LOI_VAO_MOI = ["sheet", "hop-tuan", "bang-don-vi", "muc-tieu"] as const;
const BANG_CHUNG = "https://example.test/hop-dong-ky";

dungSan();

async function taoKr(
	tien: string,
	kind: "tang-toi" | "moc",
): Promise<{ k: string; cookie: AiHoacCookie }> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const quy = await kyDangChay(tien);
	const bp = await bpMoi(`${tien}-b`);
	const pb = await pbMoi(`${tien}-p`, bp);
	const tp = await truongMoi("department", pb, `${tien}-tp`);
	const chu = await nguoiMoi(`${tien}-chu`);
	ok(await datViTri(chu, pb), "xep chu kr");
	const objectiveId = ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId: quy,
				unit: { level: "phong-ban", departmentId: pb },
				title: ma("muc tieu"),
				kind: "cam-ket",
				ownerUserId: tp.nguoi,
				participantIds: [],
				whyNow: "",
			},
			tp.cookie,
		),
		"tao muc tieu",
	).id;
	const k = ok<{ id: string }>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma("kr"),
				kind,
				ownerUserId: chu,
				startValue: 0,
				targetValue: kind === "moc" ? 1 : 24,
				currentValue: 0,
				unit: kind === "moc" ? "" : "đại lý",
				dueOn: null,
				weight: 1,
			},
			tp.cookie,
		),
		"tao kr",
	).id;
	ok(
		await goi("okr.publishObjective", { id: objectiveId }, tp.cookie),
		"cong bo",
	);
	return { k, cookie: await phienCua(chu) };
}

const demLan = (keyResultId: string) =>
	db.okrCheckIn.count({ where: { keyResultId } });

describe("cnk-api", () => {
	test(
		"cnk-api: moi loi vao mo phien dung entry va gui them dung mot lan; KR moc luu bang chung; loi vao la bi tu choi",
		async () => {
			const loi: string[] = [];
			let dem = 0;
			const { k, cookie } = await taoKr("cnk", "tang-toi");
			for (const [i, entry] of LOI_VAO_MOI.entries()) {
				const mo = await goi("okr.moCapNhat", { entry }, cookie);
				if (mo.status !== 200) {
					loi.push(`cnk-api: ${entry} bi tu choi (${mo.status})`);
					continue;
				}
				const { sessionId } = ok<{ sessionId: string }>(mo, `mo ${entry}`);
				const phien = await db.okrCheckInSession.findUnique({
					where: { id: sessionId },
					select: { entry: true },
				});
				const truoc = await demLan(k);
				const giaTri = 10 + i;
				const ghiChu = `lan ${entry}`;
				ok(
					await goi(
						"okr.guiCapNhat",
						{
							sessionId,
							items: [
								{
									keyResultId: k,
									value: giaTri,
									confidence: "cao",
									note: ghiChu,
								},
							],
						},
						cookie,
					),
					`gui ${entry}`,
				);
				const moi = await db.okrCheckIn.findMany({
					where: { keyResultId: k, sessionId },
					select: { value: true, confidence: true, note: true },
				});
				const sau = await demLan(k);
				const dung =
					phien?.entry === entry &&
					sau === truoc + 1 &&
					moi.length === 1 &&
					Number(moi[0]?.value) === giaTri &&
					moi[0]?.confidence === "cao" &&
					moi[0]?.note === ghiChu;
				if (!dung)
					loi.push(
						`cnk-api: ${entry} phien ${phien?.entry} so lan ${truoc}->${sau} ghi ${JSON.stringify(moi)}`,
					);
				else dem += 1;
			}

			const moc = await taoKr("cnk-moc", "moc");
			const { sessionId } = ok<{ sessionId: string }>(
				await goi("okr.moCapNhat", { entry: "sheet" }, moc.cookie),
				"mo moc",
			);
			ok(
				await goi(
					"okr.guiCapNhat",
					{
						sessionId,
						items: [
							{
								keyResultId: moc.k,
								value: 1,
								confidence: "cao",
								note: "",
								bangChung: { url: BANG_CHUNG, ghiChu: "" },
							},
						],
					},
					moc.cookie,
				),
				"gui moc",
			);
			const lanMoc = await db.okrCheckIn.findMany({
				where: { keyResultId: moc.k, sessionId },
				select: { value: true },
			});
			const bc = await db.okrBangChung.findMany({
				where: { keyResultId: moc.k },
				select: { url: true },
			});
			if (
				lanMoc.length !== 1 ||
				Number(lanMoc[0]?.value) !== 1 ||
				!bc.some((b) => b.url === BANG_CHUNG)
			)
				loi.push(
					`cnk-api: moc luu ${JSON.stringify(lanMoc)} bang chung ${JSON.stringify(bc)}`,
				);
			else dem += 1;

			const la = await goi("okr.moCapNhat", { entry: "khong-co" }, cookie);
			if (la.status !== 400)
				loi.push(`cnk-api: entry khong-co tra ${la.status} can 400`);
			else dem += 1;

			console.log(`cnk-api: ${dem}/6`);
			expect(loi.join("\n")).toBe("");
			expect(dem).toBe(6);
		},
		CHO_MS,
	);
});
