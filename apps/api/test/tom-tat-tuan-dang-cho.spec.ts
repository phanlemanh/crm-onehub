import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	gioXepCua,
	lanXepTomTatHomNay,
	lanXepTomTatKe,
	thuCapNhatCuaNgayXep,
} from "@crm/db/okr-tom-tat";

const VI_TRI = ["05:59-ngay-xep", "06:00-ngay-xep", "06:01-ngay-xep", "12:00-ngay-cap-nhat"] as const;

const MA_TRAN: readonly {
	thu: number;
	now: Record<(typeof VI_TRI)[number], string>;
	luc: Record<(typeof VI_TRI)[number], string>;
}[] = [
	{
		thu: 1,
		now: {
			"05:59-ngay-xep": "2026-10-19T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-19T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-19T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-19T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-19T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-26T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-26T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-19T23:00:00.000Z",
		},
	},
	{
		thu: 2,
		now: {
			"05:59-ngay-xep": "2026-10-20T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-20T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-20T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-20T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-20T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-27T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-27T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-20T23:00:00.000Z",
		},
	},
	{
		thu: 3,
		now: {
			"05:59-ngay-xep": "2026-10-21T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-21T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-21T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-21T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-21T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-28T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-28T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-21T23:00:00.000Z",
		},
	},
	{
		thu: 4,
		now: {
			"05:59-ngay-xep": "2026-10-22T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-22T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-22T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-22T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-22T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-29T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-29T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-22T23:00:00.000Z",
		},
	},
	{
		thu: 5,
		now: {
			"05:59-ngay-xep": "2026-10-23T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-23T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-23T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-23T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-23T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-30T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-30T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-23T23:00:00.000Z",
		},
	},
	{
		thu: 6,
		now: {
			"05:59-ngay-xep": "2026-10-24T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-24T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-24T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-24T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-24T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-31T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-31T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-24T23:00:00.000Z",
		},
	},
	{
		thu: 7,
		now: {
			"05:59-ngay-xep": "2026-10-25T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-25T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-25T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-25T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-25T23:00:00.000Z",
			"06:00-ngay-xep": "2026-11-01T23:00:00.000Z",
			"06:01-ngay-xep": "2026-11-01T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-25T23:00:00.000Z",
		},
	},
];

const NGAY_XEP_THEO_THU: readonly { ngayXep: string; thu: number }[] = [
	{ ngayXep: "2026-10-20T03:00:00.000Z", thu: 1 },
	{ ngayXep: "2026-10-21T03:00:00.000Z", thu: 2 },
	{ ngayXep: "2026-10-22T03:00:00.000Z", thu: 3 },
	{ ngayXep: "2026-10-23T03:00:00.000Z", thu: 4 },
	{ ngayXep: "2026-10-24T03:00:00.000Z", thu: 5 },
	{ ngayXep: "2026-10-25T03:00:00.000Z", thu: 6 },
	{ ngayXep: "2026-10-26T03:00:00.000Z", thu: 7 },
];

describe("ttdc-luat-gio", () => {
	test("ttdc-luat-gio: TZ dat tu ngoai co ap", () => {
		const tz = process.env.TZ;
		if (!tz) throw new Error("ttdc-luat-gio: TZ khong ap (chua dat TZ)");
		expect(
			Intl.DateTimeFormat().resolvedOptions().timeZone === tz
				? "ap"
				: "ttdc-luat-gio: TZ khong ap",
		).toBe("ap");
	});

	test("ttdc-luat-gio: ma tran 7 thu x 4 vi tri viet truoc", () => {
		const lech: string[] = [];
		let soAssert = 0;
		for (const dong of MA_TRAN)
			for (const vt of VI_TRI) {
				soAssert += 1;
				const thuc = lanXepTomTatKe(new Date(dong.now[vt]), dong.thu).toISOString();
				if (thuc !== dong.luc[vt])
					lech.push(`ttdc-luat-gio: lech o ${dong.thu}/${vt} (${thuc}, can ${dong.luc[vt]})`);
			}
		console.log(`ttdc-luat-gio: ${soAssert} o`);
		expect(soAssert).toBe(28);
		expect(lech).toEqual([]);
	});

	test("ttdc-luat-gio: thu cap nhat cua ngay xep la thu cua hom truoc", () => {
		const lech = NGAY_XEP_THEO_THU.flatMap((o) =>
			thuCapNhatCuaNgayXep(new Date(o.ngayXep)) === o.thu
				? []
				: [`ttdc-luat-gio: thu cap nhat lech o ${o.ngayXep}`],
		);
		expect(lech).toEqual([]);
		expect(gioXepCua(new Date("2026-10-20T03:00:00.000Z")).toISOString()).toBe(
			"2026-10-19T23:00:00.000Z",
		);
	});

	test("ttdc-luat-gio: lan xep hom nay chi o ngay xep cua chu ky va sau gio xep", () => {
		expect({
			dungNgay: lanXepTomTatHomNay(new Date("2026-10-19T23:05:00.000Z"), 1)?.toISOString() ?? null,
			truocGio: lanXepTomTatHomNay(new Date("2026-10-19T22:59:00.000Z"), 1),
			khacNgay: lanXepTomTatHomNay(new Date("2026-10-20T23:05:00.000Z"), 1),
		}).toEqual({
			dungNgay: "2026-10-19T23:00:00.000Z",
			truocGio: null,
			khacNgay: null,
		});
	});

	test("ttdc-luat-gio: tac tu dung chung luat gio xep", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../../agent/agent/lib/okr/lich-tom-tat.ts"),
			"utf8",
		);
		expect({
			khaiRieng: /function gioXepCua\b/.test(nguon),
			importChung: /import\s*\{[^}]*\bgioXepCua\b[^}]*\}\s*from\s*"@crm\/db\/okr-tom-tat"/.test(nguon),
		}).toEqual({ khaiRieng: false, importChung: true });
	});
});
