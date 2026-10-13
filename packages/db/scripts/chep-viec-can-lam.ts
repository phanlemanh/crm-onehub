import "@crm/env/load";
import { parseArgs } from "node:util";
import { laKhoCucBo, loiKhoXa } from "../src/kho-cuc-bo";

const LENH = "viec:chep-cu";

const { values } = parseArgs({
	options: {
		chay: { type: "boolean", default: false },
		thu: { type: "boolean", default: false },
		dao: { type: "boolean", default: false },
		"ca-ban-da-doi": { type: "boolean", default: false },
		nguoi: { type: "string" },
		tu: { type: "string" },
	},
});

const url = process.env.DATABASE_URL ?? "";
const ghi = (values.chay && !values.thu) || values.dao;
if (ghi && !laKhoCucBo(url) && process.env.ALLOW_REMOTE_DB !== "1") {
	console.error(loiKhoXa(LENH, url, "DATABASE_URL"));
	process.exit(1);
}

const { db } = await import("../src/client");
const { LoiViec } = await import("../src/viec-ghi");
const { chepTatCa, daoTatCa, demViecCanLam } = await import("../src/viec-chep");

async function nguoiChayId(email: string | undefined): Promise<string | null> {
	if (!email) return null;
	const nguoi = await db.user.findFirst({
		where: { email: email.trim().toLowerCase() },
		select: { id: true },
	});
	return nguoi?.id ?? null;
}

function tu(giaTri: string | undefined): Date | undefined {
	if (giaTri === undefined) return undefined;
	const luc = new Date(giaTri);
	if (Number.isNaN(luc.getTime())) {
		console.error(`--tu không đọc được: ${giaTri}`);
		process.exit(1);
	}
	return luc;
}

try {
	const ketQua = values.dao
		? await daoTatCa(db, { caBanDaDoi: values["ca-ban-da-doi"] })
		: values.chay
			? await chepTatCa(db, {
					nguoiChayId: await nguoiChayId(values.nguoi),
					now: new Date(),
					thu: values.thu,
				})
			: await demViecCanLam(db, { tu: tu(values.tu) });
	console.log(JSON.stringify(ketQua, null, 2));
	process.exitCode = 0;
} catch (loi) {
	if (!(loi instanceof LoiViec)) throw loi;
	console.error(loi.message);
	process.exitCode = 1;
} finally {
	await db.$disconnect();
}
