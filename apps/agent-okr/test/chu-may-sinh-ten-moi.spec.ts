import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { docOkr as docOkrTheoQuyen } from "../agent/lib/hoi-doc";
import type { NguCanhPhien } from "../agent/lib/phien";
import docOkr from "../agent/tools/doc_okr";
import { boMau } from "./support/bo-mau";
import { moXuong } from "./support/gieo";

const { idMau, lamSachOkr, napMau, xoaBoOkrMau } = await boMau();

const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");
const NGUOI = idMau("nguoi", "le-hai-dang");
const LUOT = [
	{ ten: "Kho Thử Nghiệm", mong: "Kho Thử Nghiệm" },
	{ ten: "   ", mong: "Công ty" },
] as const;

type KetQua = { ok: boolean; mucTieu?: { donVi?: string }; reason?: string };
type CongCu<DauVao> = {
	execute: (input: DauVao, ctx: NguCanhPhien) => Promise<KetQua>;
};
const doc = docOkr as unknown as CongCu<Parameters<typeof docOkrTheoQuyen>[1]>;

const phien = (userId: string): NguCanhPhien => ({
	session: {
		id: `cmst-${userId}`,
		auth: {
			initiator: {
				authenticator: "crm-okr-cua",
				principalId: userId,
				principalType: "user",
				attributes: {
					purpose: "okr-hoi",
					cuocHoiId: `cuoc-${userId}`,
					vai: "member",
				},
			},
			current: null,
		},
	},
});

let tenCu = "";
let mucTieuGoc = "";

beforeAll(async () => {
	setSystemTime();
	await moXuong();
	await lamSachOkr();
	await xoaBoOkrMau(db);
	await napMau(MOC_MAU);
	setSystemTime(MOC_MAU);
	const ws = await db.organization.findUniqueOrThrow({
		where: { id: WORKSPACE_ID },
		select: { name: true },
	});
	tenCu = ws.name;
	const goc = await db.okrObjective.findFirstOrThrow({
		where: { level: "onehub", status: "cong-bo" },
		orderBy: { id: "asc" },
		select: { id: true },
	});
	mucTieuGoc = goc.id;
}, 120_000);

afterAll(async () => {
	setSystemTime();
	await db.organization.update({
		where: { id: WORKSPACE_ID },
		data: { name: tenCu },
	});
	await xoaBoOkrMau(db);
}, 120_000);

describe("cmst-goc-hoi", () => {
	for (const luot of LUOT) {
		test(`doc_okr tra ten don vi goc theo khong gian lam viec «${luot.ten}»`, async () => {
			await db.organization.update({
				where: { id: WORKSPACE_ID },
				data: { name: luot.ten },
			});
			const kq = await doc.execute(
				{ loai: "objective", id: mucTieuGoc },
				phien(NGUOI),
			);
			expect(kq.ok).toBe(true);
			const donVi = kq.mucTieu?.donVi ?? "";
			expect(
				donVi === luot.mong ? [] : [`cmst: goc hoi-doc ${luot.ten} ${donVi}`],
			).toEqual([]);
		});
	}
});
