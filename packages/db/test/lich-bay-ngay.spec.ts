import { afterAll, beforeAll, describe, test } from "bun:test";
import { db } from "../src/client";
import { docLichLam } from "../src/du-an";
import { SETTINGS_ID } from "../src/settings";

type Chup = { ngayNghiTuan: number[]; khongNghiTuan: boolean } | null;

type Dong = {
	hang: string;
	mang: number[] | null;
	khongNghi: boolean;
	ra: number[];
};

const BANG: Dong[] = [
	{ hang: "khong co hang", mang: null, khongNghi: false, ra: [6, 7] },
	{ hang: "rong, co false", mang: [], khongNghi: false, ra: [6, 7] },
	{ hang: "[7], co false", mang: [7], khongNghi: false, ra: [7] },
	{ hang: "[3,7], co false", mang: [3, 7], khongNghi: false, ra: [3, 7] },
	{ hang: "rong, co true", mang: [], khongNghi: true, ra: [] },
];

let chup: Chup = null;

function json<T>(x: T): string {
	return JSON.stringify(x);
}

async function datHang(mang: number[], khongNghi: boolean): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ngayNghiTuan: mang, khongNghiTuan: khongNghi },
		update: { ngayNghiTuan: mang, khongNghiTuan: khongNghi },
	});
}

async function traLai(): Promise<void> {
	if (chup === null) {
		await db.appSetting.deleteMany({ where: { id: SETTINGS_ID } });
		return;
	}
	await datHang(chup.ngayNghiTuan, chup.khongNghiTuan);
}

beforeAll(async () => {
	chup = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { ngayNghiTuan: true, khongNghiTuan: true },
	});
});

afterAll(async () => {
	await traLai();
	const sau = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { ngayNghiTuan: true, khongNghiTuan: true },
	});
	if (json(sau) !== json(chup)) {
		throw new Error(`vg: don lich de lai co ${json(sau)}`);
	}
});

describe("vg-lich-db", () => {
	test("vg-lich-db: cột khongNghiTuan là boolean, NOT NULL, mặc định false trong kho đã nâng", async () => {
		const cot = await db.$queryRaw<
			{ data_type: string; is_nullable: string; column_default: string }[]
		>`SELECT data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'appSetting' AND column_name = 'khongNghiTuan'`;
		const c = cot[0];
		if (
			cot.length !== 1 ||
			c?.data_type !== "boolean" ||
			c.is_nullable !== "NO" ||
			c.column_default !== "false"
		) {
			throw new Error(`vg: cot khong nghi sai ${json(cot)}`);
		}
	});

	test("vg-lich-db: bảng năm dòng đọc lịch viết sẵn", async () => {
		let daSo = 0;
		for (const d of BANG) {
			if (d.mang === null) {
				await db.appSetting.deleteMany({ where: { id: SETTINGS_ID } });
			} else {
				await datHang(d.mang, d.khongNghi);
			}
			const ra = [...(await docLichLam(db)).ngayNghiTuan];
			if (json(ra) !== json(d.ra)) {
				throw new Error(
					`vg: doc lich ${d.hang} ra ${json(ra)} ky vong ${json(d.ra)}`,
				);
			}
			daSo += 1;
		}
		if (daSo !== 5) throw new Error(`vg: bang doc thieu ${daSo}`);
		await traLai();
	});

	test("vg-lich-db: dữ liệu cũ ghi riêng cột mảng, không chạm cờ, đọc như hôm nay", async () => {
		await datHang([], false);
		const ra: number[][] = [];
		for (const mang of [[], [3, 7]]) {
			await db.appSetting.update({
				where: { id: SETTINGS_ID },
				data: { ngayNghiTuan: mang },
			});
			ra.push([...(await docLichLam(db)).ngayNghiTuan]);
		}
		if (
			json(ra) !==
			json([
				[6, 7],
				[3, 7],
			])
		) {
			throw new Error(`vg: du lieu cu doi ${json(ra)}`);
		}
		await traLai();
	});
});
