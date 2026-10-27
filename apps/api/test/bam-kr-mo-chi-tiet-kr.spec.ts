import { describe, expect, test } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import {
	type CayCanChinhOutput,
	cayCanChinhOutput,
	type NutCayDayDu,
} from "../src/okr/okr-xem.contracts";
import {
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	kyDangChay,
	ok,
	phien,
} from "./okr-san";

dungSan();

const CHO_MS = 60_000;
const TEP_FIXTURE = join(
	import.meta.dir,
	"../../app/test/fixtures/bkr-cay.json",
);
const TEN_O = "BKR · mục tiêu O";
const KR_MA_TRAN = [
	{ nhan: "K1", ten: "BKR · kết quả K1", hienTai: 20 },
	{ nhan: "K2", ten: "BKR · kết quả K2", hienTai: 35 },
] as const;

type Tra = { id: string };

async function gieo(): Promise<{ cycleId: string; objectiveId: string }> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const cycleId = await kyDangChay("bkr-cay");
	const objectiveId = ok<Tra>(
		await goi("okr.createObjective", {
			cycleId,
			unit: { level: "onehub" },
			title: TEN_O,
			kind: "cam-ket",
			ownerUserId: phien.quan.nguoi,
			participantIds: [],
			whyNow: "",
		}),
		"tao muc tieu",
	).id;
	for (const k of KR_MA_TRAN)
		ok(
			await goi("okr.createKeyResult", {
				objectiveId,
				title: k.ten,
				kind: "tang-toi",
				ownerUserId: phien.quan.nguoi,
				startValue: 10,
				targetValue: 50,
				currentValue: k.hienTai,
				unit: "khách",
				dueOn: null,
				weight: 1,
			}),
			`tao ${k.nhan}`,
		);
	ok(await goi("okr.publishObjective", { id: objectiveId }), "cong bo");
	return { cycleId, objectiveId };
}

async function docCay(cycleId: string): Promise<CayCanChinhOutput> {
	return cayCanChinhOutput.parse(
		await doc<unknown>("okr.cayCanChinh", "quan", { cycleId }),
	);
}

function moiNut(cay: CayCanChinhOutput): NutCayDayDu[] {
	const ra: NutCayDayDu[] = [];
	const di = (ds: NutCayDayDu[]) => {
		for (const n of ds) {
			ra.push(n);
			di(n.children);
		}
	};
	di([...cay.roots, ...cay.chuaCanChinh]);
	return ra;
}

function chuanHoa(
	cay: CayCanChinhOutput,
	nhan: ReadonlyMap<string, string>,
): CayCanChinhOutput {
	const doi = (id: string) => nhan.get(id) ?? `la:${id}`;
	const nut = (n: NutCayDayDu): NutCayDayDu => ({
		...n,
		id: doi(n.id),
		objectiveId: doi(n.objectiveId),
		expected: null,
		children: n.children.map(nut),
	});
	return cayCanChinhOutput.parse({
		roots: cay.roots.map(nut),
		chuaCanChinh: cay.chuaCanChinh.map(nut),
		canh: cay.canh.map((k) => ({ ...k, tu: doi(k.tu), den: doi(k.den) })),
	});
}

function soFixture(ra: string): void {
	if (process.env.BKR_GHI === "1") {
		writeFileSync(TEP_FIXTURE, ra);
		return;
	}
	const daCo = readFileSync(TEP_FIXTURE, "utf8");
	const khop = "bkr-cay-api: fixture khop dau ra that";
	expect(daCo === ra ? khop : "bkr-cay-api: fixture lech dau ra that").toBe(
		khop,
	);
}

describe("bkr-cay-api", () => {
	test(
		"bkr-cay-api: moi nut kr cua cay can chinh mang id ban ghi OkrKeyResult, fixture khop dau ra that",
		async () => {
			const { cycleId, objectiveId } = await gieo();
			const banGhi = await db.okrKeyResult.findMany({
				where: { objectiveId },
				select: { id: true, title: true },
			});
			const cay = await docCay(cycleId);
			const tatCa = moiNut(cay);
			const nutKr = tatCa.filter((n) => n.loai === "kr");
			let dem = 0;
			const nhan = new Map<string, string>([[objectiveId, "O"]]);
			for (const k of KR_MA_TRAN) {
				const bg = banGhi.find((b) => b.title === k.ten);
				expect(`${k.nhan} co ban ghi: ${Boolean(bg)}`).toBe(
					`${k.nhan} co ban ghi: true`,
				);
				const can = bg?.id ?? "";
				nhan.set(can, k.nhan);
				const thay = nutKr
					.filter((n) => n.title === k.ten)
					.map((n) => n.id)
					.join(",");
				expect(`bkr-cay-api: nut kr ${k.nhan} id ${thay}, can ${can}`).toBe(
					`bkr-cay-api: nut kr ${k.nhan} id ${can}, can ${can}`,
				);
				const dung = nutKr.filter(
					(n) => n.id === can && n.objectiveId === objectiveId,
				);
				expect(
					`bkr-cay-api: nut kr ${k.nhan} khop id va objectiveId: ${dung.length}`,
				).toBe(`bkr-cay-api: nut kr ${k.nhan} khop id va objectiveId: 1`);
				dem += 1;
			}
			expect(dem).toBe(2);
			const nutO = tatCa.filter(
				(n) => n.loai === "muc-tieu" && n.objectiveId === objectiveId,
			);
			expect(
				`bkr-cay-api: nut muc-tieu mang objectiveId O: ${nutO.length}`,
			).toBe("bkr-cay-api: nut muc-tieu mang objectiveId O: 1");
			const ra = `${JSON.stringify(chuanHoa(cay, nhan), null, "\t")}\n`;
			soFixture(ra);
		},
		CHO_MS,
	);
});
