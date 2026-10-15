import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { ghiPhienEve } from "@crm/db/okr-cuoc-hoi";
import { OKR_HOI_TRAN } from "@crm/validation/okr-tra-loi";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { HoiService } from "../src/okr/hoi.service";

const T = `hluot${(process.env.TEST_RUN_ID ?? "x").slice(0, 8)}`;
const A = `${T}-a`;
const B = `${T}-b`;
const MOC = new Date("2026-10-14T09:00:00+07:00");
const hoi = new HoiService(db);

async function don() {
	await db.okrLuotHoi.deleteMany({ where: { userId: { startsWith: T } } });
	await db.okrCuocHoi.deleteMany({
		where: { nguoiHoiUserId: { startsWith: T } },
	});
	await db.aiChiPhi.deleteMany({ where: { tinhNang: OKR_HOI_TRAN.tinhNang } });
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: T } } });
}

type NguCanhChiPhi = {
	session: {
		id: string;
		auth: {
			initiator: {
				principalId: string;
				principalType: "user";
				attributes: Record<string, string>;
			};
			current: null;
		};
	};
	channel: { kind: "eve" };
};
type BuocChiPhi = {
	type: "step.completed";
	data: {
		usage: { inputTokens: number; outputTokens: number; costUsd: number };
	};
	meta: { id: string; at: string };
};
const DUONG_HOOK = "../../agent-okr/agent/hooks/chi-phi.ts";
const hookChiPhi = (await import(DUONG_HOOK)).default as {
	events: {
		"step.completed": (e: BuocChiPhi, c: NguCanhChiPhi) => Promise<void>;
	};
};

async function ghiBuoc(id: string, at: Date, usd: number) {
	await hookChiPhi.events["step.completed"](
		{
			type: "step.completed",
			data: { usage: { inputTokens: 1000, outputTokens: 100, costUsd: usd } },
			meta: { id: `${T}-${id}`, at: at.toISOString() },
		},
		{
			session: {
				id: `${T}-phien`,
				auth: {
					initiator: {
						principalId: B,
						principalType: "user",
						attributes: {
							purpose: "okr-hoi",
							cuocHoiId: `${T}-cuoc`,
							vai: "member",
						},
					},
					current: null,
				},
			},
			channel: { kind: "eve" },
		},
	);
	const hang = await db.aiChiPhi.findUniqueOrThrow({
		where: { id: `${T}-${id}` },
		select: { tinhNang: true, at: true },
	});
	expect(hang).toEqual({ tinhNang: OKR_HOI_TRAN.tinhNang, at });
}

beforeAll(async () => {
	setSystemTime(MOC);
	await don();
});

afterAll(async () => {
	await don();
	setSystemTime();
});

describe("hdo tran luot", () => {
	test("40 cau trong ngay qua, cau 41 het-luot-ngay, ngay moi qua lai", async () => {
		setSystemTime(MOC);
		const { cuocHoiId } = await hoi.mo(A);
		let qua = 0;
		for (let i = 0; i < OKR_HOI_TRAN.cauMoiNgay; i++) {
			const kq = await hoi.tangLuot(A, cuocHoiId);
			if (kq.ok) qua++;
		}
		expect(qua).toBe(OKR_HOI_TRAN.cauMoiNgay);
		expect(await hoi.tangLuot(A, cuocHoiId)).toEqual({
			ok: false,
			lyDo: "het-luot-ngay",
		});
		setSystemTime(new Date("2026-10-15T07:05:00+07:00"));
		expect(await hoi.tangLuot(A, cuocHoiId)).toEqual({ ok: true });
		setSystemTime(MOC);
	});

	test("cuoc hoi cua nguoi khac bi chan", async () => {
		const { cuocHoiId } = await hoi.mo(A);
		await expect(hoi.tangLuot(B, cuocHoiId)).rejects.toBeInstanceOf(
			ForbiddenException,
		);
	});

	test("cham tran thang thi het-tran-thang; thang truoc khong tinh", async () => {
		setSystemTime(MOC);
		await db.aiChiPhi.deleteMany({
			where: { tinhNang: OKR_HOI_TRAN.tinhNang },
		});
		await ghiBuoc(
			"thang-truoc",
			new Date("2026-09-30T12:00:00+07:00"),
			OKR_HOI_TRAN.usdMoiThang * 3,
		);
		const { cuocHoiId } = await hoi.mo(B);
		expect(await hoi.tangLuot(B, cuocHoiId)).toEqual({ ok: true });
		await ghiBuoc("thang-nay", MOC, OKR_HOI_TRAN.usdMoiThang);
		expect(await hoi.tangLuot(B, cuocHoiId)).toEqual({
			ok: false,
			lyDo: "het-tran-thang",
		});
	});

	test("phien: cuoc moi chua co phien; sau khi eve gan phien thi tra phien do; cuoc nguoi khac bi chan", async () => {
		const { cuocHoiId } = await hoi.mo(A);
		expect(await hoi.phien(A, { cuocHoiId })).toEqual({ phien: null });
		await ghiPhienEve(db, cuocHoiId, `${T}-eve-1`);
		expect(await hoi.phien(A, { cuocHoiId })).toEqual({
			phien: `${T}-eve-1`,
		});
		expect(hoi.phien(B, { cuocHoiId })).rejects.toBeInstanceOf(
			NotFoundException,
		);
	});

	test("phan-hoi: ghi mot hang moi cau tra loi, bam lai thi doi; cuoc nguoi khac bi chan", async () => {
		const { cuocHoiId } = await hoi.mo(A);
		await hoi.phanHoi(A, { cuocHoiId, maTraLoi: "tra-loi-1", huuIch: true });
		await hoi.phanHoi(A, { cuocHoiId, maTraLoi: "tra-loi-1", huuIch: false });
		const hang = await db.okrHoiPhanHoi.findMany({ where: { cuocHoiId } });
		expect(hang.map((h) => [h.maTraLoi, h.huuIch])).toEqual([
			["tra-loi-1", false],
		]);
		await expect(
			hoi.phanHoi(B, { cuocHoiId, maTraLoi: "tra-loi-1", huuIch: true }),
		).rejects.toBeInstanceOf(ForbiddenException);
	});
});
