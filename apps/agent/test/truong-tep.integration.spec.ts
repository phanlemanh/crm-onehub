import { afterAll, beforeAll, describe, test } from "bun:test";
import { db } from "@crm/db";
import type { FieldEntity } from "@crm/db/enums";
import { FIELD_FILE_COPY } from "@crm/db/fields";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { z } from "zod";
import { thanhVienPrincipal } from "../agent/lib/thanh-vien-principal";
import setFieldValue from "../agent/tools/set_field_value";
import { trongNguCanhEve } from "./support/eve-ngu-canh";
import { moXuong } from "./support/nhac-gieo";

const MOC = `ttpk${Date.now().toString(36)}`;
const ketQua = z
	.object({ written: z.boolean(), reason: z.string().optional() })
	.loose();

let fieldId = "";
let khoa = "";
let lienHe = "";
let tepId = "";
let nguoiThu = "";

function phai(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function goi(value: string | null) {
	const principal = await thanhVienPrincipal(nguoiThu, "crm-app");
	if (!principal) throw new Error("ttp kara: fixture thanh vien");
	const ctx = {
		session: {
			id: `${MOC}-ses`,
			auth: {
				current: { ...principal, attributes: { purpose: "research" } },
				initiator: null,
			},
		},
	};
	const execute = setFieldValue.execute as unknown as (
		input: { entity: FieldEntity; recordId: string; key: string; value: string | null },
		ctx: unknown,
	) => Promise<unknown>;
	return trongNguCanhEve(async () =>
		ketQua.parse(
			await execute({ entity: "CONTACT", recordId: lienHe, key: khoa, value }, ctx),
		),
	);
}

beforeAll(async () => {
	await moXuong();
	khoa = `${MOC}_tep`;
	const f = await db.fieldDefinition.create({
		data: {
			entity: "CONTACT",
			key: khoa,
			label: `Ttp kara ${MOC}`,
			type: "FILE",
			agentFilled: true,
			position: 9_995,
		},
	});
	fieldId = f.id;
	const c = await db.contact.create({
		data: { firstName: `${MOC} lien he` },
		select: { id: true },
	});
	lienHe = c.id;
	const tep = await db.fieldFile.create({
		data: {
			fieldId,
			contactId: lienHe,
			tenTep: "goc.pdf",
			kieu: "pdf",
			kichThuoc: 10,
			sha256: `${MOC}sha`,
			blobPathname: `truong-tep/${MOC}`,
		},
	});
	tepId = tep.id;
	nguoiThu = `${MOC}-u`;
	await db.user.create({
		data: { id: nguoiThu, name: nguoiThu, email: `${nguoiThu}@thu.test` },
	});
	await db.member.create({
		data: {
			id: `${nguoiThu}-mem`,
			organizationId: WORKSPACE_ID,
			userId: nguoiThu,
			role: "member",
			createdAt: new Date(),
		},
	});
});

afterAll(async () => {
	await db.fieldDefinition.deleteMany({ where: { id: fieldId } });
	await db.contact.deleteMany({ where: { id: lienHe } });
	await db.member.deleteMany({ where: { userId: nguoiThu } });
	await db.user.deleteMany({ where: { id: nguoiThu } });
});

describe("ttp-kara", () => {
	test("ttp-kara: set_field_value lên trường Tệp bị từ chối, ô không đổi", async () => {
		let so = 0;
		for (const gia of ["https://x.test/a.pdf", null]) {
			const kq = await goi(gia);
			phai(kq.written === false, `ttp ghi chu: kara ${gia} nhan`);
			phai(
				(kq.reason ?? "").includes(FIELD_FILE_COPY.chiNhanTep),
				`ttp ghi chu: kara ${gia} nhan`,
			);
			const fv = await db.fieldValue.count({ where: { fieldId } });
			phai(fv === 0, `ttp ghi chu: kara ${gia} fieldValue`);
			const tep = await db.fieldFile.findMany({ where: { fieldId } });
			phai(tep.map((t) => t.id).join() === tepId, `ttp ghi chu: kara ${gia} tep doi`);
			so += 1;
		}
		phai(so === 2, `ttp ghi chu: thieu o ${so}`);
	});
});
