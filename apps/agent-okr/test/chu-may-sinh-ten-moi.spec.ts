import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { boDoanMa, dongLoiTenCu, soatTenCu } from "@crm/validation/ten-cu-okr";
import type { docOkr as docOkrTheoQuyen } from "../agent/lib/hoi-doc";
import { LOI_DAN_SOAN } from "../agent/lib/loi-dan-soan";
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

const CAU_DAN =
	"Never write `căn chỉnh` or `hỏi ý` to the person: the screen says «Góp vào» and «Lấy ý kiến».";
const LOI_DAN = [
	{
		tep: "apps/agent-okr/agent/lib/loi-dan-soan.ts",
		van: LOI_DAN_SOAN,
		tenMa: ["ungVienCanChinh"],
	},
	{
		tep: "apps/agent/agent/subagents/tro_ly_okr/instructions.md",
		van: readFileSync(
			join(
				import.meta.dir,
				"../../agent/agent/subagents/tro_ly_okr/instructions.md",
			),
			"utf8",
		),
		tenMa: ["dichCanChinh", "can-chinh"],
	},
] as const;

describe("cmst-loi-dan", () => {
	for (const ld of LOI_DAN) {
		test(`loi dan ${ld.tep} dung ten moi`, () => {
			const loi = soatTenCu([
				{ nguon: ld.tep, khoa: "van", chu: boDoanMa(ld.van) },
			]).map(dongLoiTenCu);
			const dongChu = ld.van
				.split("\n")
				.find((d) => d.includes("Use these words"));
			if (!dongChu?.includes("Góp vào"))
				loi.push(`cmst: loi dan ${ld.tep} thieu Gop vao`);
			if (!ld.van.includes(CAU_DAN))
				loi.push(`cmst: loi dan ${ld.tep} thieu cau dan`);
			for (const ma of ld.tenMa)
				if (!ld.van.includes(`\`${ma}\``))
					loi.push(`cmst: loi dan mat ten ma ${ma}`);
			expect(loi).toEqual([]);
		});
	}

	test("doi chung: cau dan viet chu cu ngoai dau ma bi bat", () => {
		const ngoai = CAU_DAN.replaceAll("`", "«");
		const soat = (chu: string) =>
			soatTenCu([{ nguon: "gia", khoa: "cau", chu: boDoanMa(chu) }]);
		expect(soat(ngoai).length).toBe(2);
		expect(soat(CAU_DAN)).toEqual([]);
	});
});
