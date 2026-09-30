import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { moCuoc } from "@crm/db/okr-cuoc-soan";
import { PHIEN_CHO_EVE } from "@crm/validation/okr-cuoc-soan";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";
import { boCa, donViCua } from "./ca";
import { biMat } from "./phien";
import { mintOkr, yeuSach } from "./the";

const DG = TRO_LY_OKR_SOAN.danhGia;

if (!DG.khoDo.test(process.env.DATABASE_URL ?? "")) {
	console.error("the-bo-chay: chi chay tren kho do crm_<cay>_do");
	process.exit(2);
}
const [ca] = boCa();
if (!ca) throw new Error("bo ca soan rong");
const dv = await donViCua(ca);
const cuoc = await moCuoc(db, {
	cycleId: DG.chuKyNam,
	level: dv.level,
	divisionId: dv.divisionId,
	departmentId: dv.departmentId,
	nguoiMoUserId: dv.nguoiMo,
	sessionId: `${PHIEN_CHO_EVE}${randomUUID()}`,
	nac: "bat",
});
const bayGio = Math.floor(Date.now() / 1000);
console.log(
	await mintOkr(
		yeuSach({
			sub: dv.nguoiMo,
			cuocSoanId: cuoc.id,
			exp: bayGio + DG.hanTheGiay,
		}),
		biMat(),
	),
);
await db.$disconnect();
