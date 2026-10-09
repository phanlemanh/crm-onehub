import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";
import { nopDeXuatVao } from "../../../apps/agent/agent/lib/okr/nop-de-xuat.ts";
import { noteSession } from "../../../apps/agent/agent/lib/tasks.ts";
import { VIEC_OKR } from "../../../packages/db/src/agent-tasks.ts";
import { db } from "../../../packages/db/src/index.ts";
import { xepViecTroLy } from "../../../packages/db/src/okr-tro-ly.ts";
import { SAN } from "../../gop-y-dung-cho/rang/san-gop-y.mjs";
import { idMau, trpc } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const TIEN_TO_PHIEN = "kara-gop-y-luot-2-gieo-";

function nguCanhCon(phienGoc) {
	return {
		agent: { name: "tro_ly_okr" },
		channel: { kind: "subagent", continuationToken: `subagent:${phienGoc}:goi-tro-ly` },
		session: { id: `${phienGoc}-con`, parent: { sessionId: phienGoc, rootSessionId: phienGoc } },
	};
}

export async function nop(objectiveId, nguoiYeuCau, dong) {
	const xep = await xepViecTroLy(db, { viec: "de-xuat", objectiveId, keyResultId: null, nguoiYeuCau, nac: "bat" });
	if (!xep.bat) throw new Error(`xep viec ${objectiveId}: ${xep.lyDo}`);
	if (xep.dungLai) throw new Error(`xep viec ${objectiveId} dung lai viec cu`);
	await db.agentTask.update({
		where: { id: xep.taskId },
		data: { attempts: { increment: 1 }, startedAt: new Date(), leasedUntil: new Date(Date.now() + VIEC_OKR.leaseMs) },
	});
	const phienGoc = `${TIEN_TO_PHIEN}${xep.taskId}`;
	await noteSession(xep.taskId, phienGoc);
	const kq = await nopDeXuatVao({ dong }, nguCanhCon(phienGoc));
	if (kq.ketQua !== "da-ghi") throw new Error(`nop ${objectiveId}: ${kq.ketQua} — ${kq.lyDo}`);
	const viec = await db.agentTask.findUniqueOrThrow({ where: { id: xep.taskId }, select: { finishedAt: true, outcome: true } });
	if (viec.finishedAt === null || viec.outcome !== TRO_LY_OKR.ketThuc.daNop)
		throw new Error(`viec ${xep.taskId} khong dong bang ${TRO_LY_OKR.ketThuc.daNop} sau khi nop (${viec.outcome})`);
	const hang = await db.okrDeXuat.findMany({
		where: { taskId: xep.taskId },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: { id: true, trangThai: true, maLoai: true },
	});
	const loai = hang.filter((h) => h.trangThai !== "cho");
	if (loai.length > 0 || hang.length !== dong.length)
		throw new Error(`nop ${objectiveId}: ${hang.length}/${dong.length} dong, bi loai ${loai.map((h) => h.maLoai).join(", ")}`);
	return { taskId: xep.taskId, ids: hang.map((h) => h.id) };
}

export async function gieoGopY({ api, quanTri, themA = [] }) {
	await trpc(api, quanTri).lam("okr.setProgram", SAN.batKara);
	const a = idMau("mt", SAN.ma.a);
	const b = idMau("mt", SAN.ma.b);
	const kr1 = idMau("kr", SAN.ma.kr1);
	const kr3 = idMau("kr", SAN.ma.kr3);
	const truongId = idMau("nguoi", SAN.nguoi.truong);
	const mt = await db.okrObjective.findUniqueOrThrow({ where: { id: a }, select: { keyResults: { select: { id: true, title: true } } } });
	const tenKr1 = mt.keyResults.find((k) => k.id === kr1)?.title;
	if (!tenKr1) throw new Error(`khong thay ${kr1} trong ${a}`);
	const rong = { keyResultId: null, truong: null, truoc: null, sau: null, maVanDe: null, targetObjectiveId: null, targetKeyResultId: null };
	const gieoA = await nop(a, truongId, [
		{ ...rong, loai: "hoi", objectiveId: a, maVanDe: "thieu-doi-trong", sau: SAN.cau.doiTrong.sau, lyDo: SAN.cau.doiTrong.lyDo },
		{ ...rong, loai: "viet-lai", objectiveId: a, keyResultId: kr1, truong: "kr.title", truoc: tenKr1, sau: `${tenKr1}${SAN.cau.kr1.hauTo}`, lyDo: SAN.cau.kr1.lyDo },
		{ ...rong, loai: "hoi", objectiveId: a, keyResultId: kr3, maVanDe: "kr-la-viec", sau: SAN.cau.kr3.sau, lyDo: SAN.cau.kr3.lyDo },
		...themA.map((d) => ({ ...rong, ...d, objectiveId: a })),
	]);
	const gieoB = await nop(b, truongId, []);
	const [doiTrong, vietLaiKr1, hoiKr3, ...them] = gieoA.ids;
	return {
		a,
		b,
		kr1,
		kr3,
		tenKr1,
		phongBan: idMau("pb", SAN.ma.phongBan),
		taskA: gieoA.taskId,
		taskB: gieoB.taskId,
		dong: { doiTrong, vietLaiKr1, hoiKr3 },
		them,
	};
}
