import { nopDeXuatVao } from "../../../apps/agent/agent/lib/okr/nop-de-xuat.ts";
import {
	completeTask,
	noteSession,
} from "../../../apps/agent/agent/lib/tasks.ts";
import { VIEC_OKR } from "../../../packages/db/src/agent-tasks.ts";
import { db } from "../../../packages/db/src/index.ts";
import { xepViecTroLy } from "../../../packages/db/src/okr-tro-ly.ts";
import { idMau, trpc } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

export const SAN = {
	nguoi: { quanTri: "le-hai-dang", truong: "nguyen-thi-lan" },
	ma: {
		a: "q4-kd-bac-1",
		kr1: "q4-kd-bac-1-k1",
		kr3: "q4-kd-bac-1-k3",
		b: "q4-kd-bac-2",
		phongBan: "kd-bac",
	},
	batKara: {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiDeXuatDonVi: [],
		aiDeXuatAnPhamVi: "tat",
		aiDeXuatAnDonVi: [],
	},
	cau: {
		doiTrong: {
			sau: "Ba KR cùng đẩy số hợp đồng lên — điều gì không được xấu đi khi chạy theo số?",
			lyDo: "Bộ KR chỉ đẩy một chiều; chưa có KR giữ chất lượng đơn hàng.",
		},
		kr1: {
			hauTo: " trong quý",
			lyDo: "Tên KR chưa nói mốc thời gian của kết quả.",
		},
		kr3: {
			sau: "Tỷ lệ này tăng thì đối tác nhận được gì?",
			lyDo: "KR đang đo một bước bán hàng, chưa nói kết quả cho đối tác.",
		},
	},
	tienToPhien: "gop-y-dung-cho-san-",
};

function nguCanhCon(phienGoc) {
	return {
		agent: { name: "tro_ly_okr" },
		channel: {
			kind: "subagent",
			continuationToken: `subagent:${phienGoc}:goi-tro-ly`,
		},
		session: {
			id: `${phienGoc}-con`,
			parent: { sessionId: phienGoc, rootSessionId: phienGoc },
		},
	};
}

async function nop(objectiveId, nguoiYeuCau, dong) {
	const xep = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId,
		keyResultId: null,
		nguoiYeuCau,
		nac: "bat",
	});
	if (!xep.bat) throw new Error(`xep viec ${objectiveId}: ${xep.lyDo}`);
	if (xep.dungLai) throw new Error(`xep viec ${objectiveId} dung lai viec cu`);
	await db.agentTask.update({
		where: { id: xep.taskId },
		data: {
			attempts: { increment: 1 },
			startedAt: new Date(),
			leasedUntil: new Date(Date.now() + VIEC_OKR.leaseMs),
		},
	});
	const phienGoc = `${SAN.tienToPhien}${xep.taskId}`;
	await noteSession(xep.taskId, phienGoc);
	const kq = await nopDeXuatVao({ dong }, nguCanhCon(phienGoc));
	if (!(await completeTask(xep.taskId, "da-nop")))
		throw new Error(`viec ${xep.taskId} da dong truoc khi nop xong`);
	const hang = await db.okrDeXuat.findMany({
		where: { taskId: xep.taskId },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: { id: true, trangThai: true, maLoai: true, loai: true },
	});
	const loai = hang.filter((h) => h.trangThai !== "cho");
	if (loai.length > 0 || hang.length !== dong.length)
		throw new Error(
			`nop ${objectiveId}: ${hang.length}/${dong.length} dong, bi loai ${loai.map((h) => h.maLoai).join(", ")} (${kq.ketQua})`,
		);
	return { taskId: xep.taskId, ids: hang.map((h) => h.id) };
}

export async function gieoGopY({ api, quanTri, truong }) {
	await trpc(api, quanTri).lam("okr.setProgram", SAN.batKara);
	const a = idMau("mt", SAN.ma.a);
	const b = idMau("mt", SAN.ma.b);
	const kr1 = idMau("kr", SAN.ma.kr1);
	const kr3 = idMau("kr", SAN.ma.kr3);
	const truongId = idMau("nguoi", SAN.nguoi.truong);
	const mt = await db.okrObjective.findUniqueOrThrow({
		where: { id: a },
		select: { keyResults: { select: { id: true, title: true } } },
	});
	const tenKr1 = mt.keyResults.find((k) => k.id === kr1)?.title;
	if (!tenKr1) throw new Error(`khong thay ${kr1} trong ${a}`);
	const rong = {
		keyResultId: null,
		truong: null,
		truoc: null,
		sau: null,
		maVanDe: null,
		targetObjectiveId: null,
		targetKeyResultId: null,
	};
	const gieoA = await nop(a, truongId, [
		{
			...rong,
			loai: "hoi",
			objectiveId: a,
			maVanDe: "thieu-doi-trong",
			sau: SAN.cau.doiTrong.sau,
			lyDo: SAN.cau.doiTrong.lyDo,
		},
		{
			...rong,
			loai: "viet-lai",
			objectiveId: a,
			keyResultId: kr1,
			truong: "kr.title",
			truoc: tenKr1,
			sau: `${tenKr1}${SAN.cau.kr1.hauTo}`,
			lyDo: SAN.cau.kr1.lyDo,
		},
		{
			...rong,
			loai: "hoi",
			objectiveId: a,
			keyResultId: kr3,
			maVanDe: "kr-la-viec",
			sau: SAN.cau.kr3.sau,
			lyDo: SAN.cau.kr3.lyDo,
		},
	]);
	const gieoB = await nop(b, truongId, []);
	const [doiTrong, vietLaiKr1, hoiKr3] = gieoA.ids;
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
	};
}

export async function datLaiGopY(gieo, { api, truong }) {
	await db.okrDeXuat.updateMany({
		where: { taskId: gieo.taskA },
		data: {
			trangThai: "cho",
			quyetLuc: null,
			nguoiQuyet: null,
			giaTriCuoi: null,
		},
	});
	const kr = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: gieo.kr1 },
		select: { title: true },
	});
	if (kr.title !== gieo.tenKr1)
		await trpc(api, truong).lam("okr.updateKeyResult", {
			id: gieo.kr1,
			title: gieo.tenKr1,
		});
}

export async function dongKho() {
	await db.$disconnect();
}
