import { appendFileSync, writeFileSync } from "node:fs";
import { db, Prisma } from "@crm/db";
import { dungGoiTomTat, type GoiTomTat } from "@crm/db/okr-tom-tat";
import { MINUTE_MS, NGAY_MS, OKR_TOM_TAT } from "@crm/db/okr-tro-ly-danh-muc";
import { dauNgayVN, ngayVN } from "@crm/db/onboarding-nhac";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import { parseNoiDungTomTat } from "@crm/validation/okr-tom-tat";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import { defineEval } from "eve/evals";
import { satisfies } from "eve/evals/expect";
import { TRO_LY_OKR } from "../../agent/lib/okr/config";
import { chayXepTomTat } from "../../agent/lib/okr/lich-tom-tat";

const SECOND_MS = 1_000;
const GIO_MS = 60 * MINUTE_MS;

const TOM_TAT_EVAL = {
	khoDo: /\/crm_[a-z0-9_]+_do(\?|$)/,
	mienMau: "@mau.onehub.test",
	loaiXep: "okr-tom-tat-xep",
	loaiTomTat: "okr-tom-tat-tuan",
	cho: {
		phienMs: 20 * MINUTE_MS,
		nhipMs: 2 * SECOND_MS,
		goiLaiMs: 15 * SECOND_MS,
	},
	timeoutMs: 30 * MINUTE_MS,
	cauHinhTruocXepMs: GIO_MS,
	dongViecXepThua: "eval:dong-truoc-khi-tac-tu-nhan",
	nhanJudge: "tom-tat",
	tieuChi: [
		"Mỗi câu nói đúng điều các lần cập nhật nó dẫn cho thấy: số, chiều đi lên hay đi xuống, mức tự tin và ghi chú.",
		"Không câu nào đoán nguyên nhân mà ghi chú không nói, không nêu tên người.",
		"Câu viết bằng tiếng Việt, gọn, đọc được trong một cuộc họp tuần.",
	],
	env: TRO_LY_OKR.danhGia.env,
} as const;

function tranUsd(): number {
	const so = Number(process.env[TOM_TAT_EVAL.env.tranUsd]);
	return Number.isFinite(so) && so > 0 ? so : TRO_LY_OKR.danhGia.tranUsdMacDinh;
}

async function chiDaTieu(): Promise<number> {
	const tong = await db.aiChiPhi.aggregate({ _sum: { costUsd: true } });
	return tong._sum.costUsd?.toNumber() ?? 0;
}

async function nguoiMau(): Promise<string> {
	const dau = await db.user.findFirst({
		where: { email: { endsWith: TOM_TAT_EVAL.mienMau } },
		orderBy: { id: "asc" },
		select: { id: true },
	});
	if (!dau)
		throw new Error("chua nap bo OKR mau: khong co nguoi @mau.onehub.test");
	return dau.id;
}

async function lucXep(): Promise<Date> {
	const cuoi = await db.okrCheckIn.findFirst({
		orderBy: [{ weekStart: "desc" }, { createdAt: "desc" }],
		select: {
			weekStart: true,
			keyResult: {
				select: {
					objective: { select: { cycle: { select: { updateWeekday: true } } } },
				},
			},
		},
	});
	if (!cuoi) throw new Error("bo mau khong co lan cap nhat");
	const ngayCapNhat =
		cuoi.weekStart.getTime() +
		(cuoi.keyResult.objective.cycle.updateWeekday - 1) * NGAY_MS;
	return new Date(
		dauNgayVN(new Date(ngayCapNhat + NGAY_MS)).getTime() +
			OKR_TOM_TAT.gioXep.gio * GIO_MS +
			OKR_TOM_TAT.gioXep.phut * MINUTE_MS,
	);
}

async function batTomTat(nguoiTao: string, luc: Date): Promise<void> {
	const cuoi = await db.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
	});
	await db.okrProgramConfig.create({
		data: {
			version: (cuoi?.version ?? 0) + 1,
			objectiveCap: cuoi?.objectiveCap ?? 5,
			krCap: cuoi?.krCap ?? 5,
			capMode: cuoi?.capMode ?? "canh-bao",
			scoreScale: cuoi?.scoreScale ?? "0-1",
			weightsOn: cuoi?.weightsOn ?? false,
			personalOn: cuoi?.personalOn ?? false,
			aiOn: true,
			aiDeXuatPhamVi: "tat",
			aiDeXuatDonVi: [],
			aiTomTatPhamVi: "toan-cong-ty",
			aiTomTatDonVi: [],
			aiTranThangUsd: new Prisma.Decimal(tranUsd()),
			createdById: nguoiTao,
			createdAt: luc,
		},
	});
}

async function xepMotLan(luc: Date): Promise<string> {
	const xep = await db.agentTask.create({
		data: {
			kind: TOM_TAT_EVAL.loaiXep,
			reason: TOM_TAT_EVAL.loaiXep,
			subject: `${TOM_TAT_EVAL.loaiXep}:eval:${ngayVN(luc)}`,
			budget: 0,
			dueAt: new Date(Date.now() + NGAY_MS),
			createdAt: luc,
		},
		select: { id: true },
	});
	const ketQua = await chayXepTomTat(xep, luc);
	await db.agentTask.updateMany({
		where: { kind: TOM_TAT_EVAL.loaiXep, finishedAt: null },
		data: { finishedAt: new Date(), outcome: TOM_TAT_EVAL.dongViecXepThua },
	});
	return ketQua;
}

async function conViecMo(): Promise<number> {
	return db.agentTask.count({
		where: { kind: TOM_TAT_EVAL.loaiTomTat, finishedAt: null },
	});
}

async function xaHet(
	goi: () => Promise<number>,
	signal: AbortSignal,
): Promise<number> {
	const het = Date.now() + TOM_TAT_EVAL.cho.phienMs;
	let lanGoi = 0;
	while (Date.now() < het && !signal.aborted) {
		if (Date.now() >= lanGoi + TOM_TAT_EVAL.cho.goiLaiMs) {
			await goi();
			lanGoi = Date.now();
		}
		const mo = await conViecMo();
		if (mo === 0) return 0;
		await new Promise((r) => setTimeout(r, TOM_TAT_EVAL.cho.nhipMs));
	}
	return conViecMo();
}

type LanNguon = GoiTomTat["krs"][number]["lan"][number] & {
	kr: string;
	mucTieu: string;
};

function lanTheoId(goi: GoiTomTat | null): Map<string, LanNguon> {
	return new Map(
		(goi?.krs ?? []).flatMap((k) =>
			k.lan.map((l) => [l.id, { ...l, kr: k.ten, mucTieu: k.mucTieu }]),
		),
	);
}

function tieuChiJudge(
	phong: string,
	cau: { vanBan: string; nguon: string[] }[],
	lan: Map<string, LanNguon>,
): string {
	const nguon = [...new Set(cau.flatMap((c) => c.nguon))].flatMap((id) => {
		const l = lan.get(id);
		return l
			? [
					`- ${id}: KR «${l.kr}» (Mục tiêu «${l.mucTieu}»), ngày ${l.ngay}, giá trị ${l.giaTri}, lần trước ${l.truoc ?? "không có"}, mức tự tin ${l.tuTinTruoc ?? "không có"} → ${l.tuTin}, ghi chú «${l.ghiChu}»`,
				]
			: [];
	});
	return [
		`Trợ lý OKR tóm tắt một tuần Cập nhật tuần của phòng ${phong}. Bài nộp là các câu tóm tắt, mỗi dòng một câu, đã qua bộ kiểm số.`,
		`Các lần cập nhật được dẫn:\n${nguon.join("\n")}`,
		`Bài nộp đạt khi đúng cả ba ý: ${TOM_TAT_EVAL.tieuChi.join(" ")}`,
	].join("\n\n");
}

export default defineEval({
	description:
		"Trợ lý OKR tóm tắt tuần — mọi phòng ban của bộ OKR mẫu ở một mốc, model thật có ZDR; chốt bằng mã ở rang/eval-tom-tat.mjs, judge chỉ in điểm.",
	tags: ["okr", "tom-tat"],
	timeoutMs: TOM_TAT_EVAL.timeoutMs,
	judge: {
		model: TRO_LY_OKR.judge.model,
		modelOptions: TRO_LY_OKR.judge.modelOptions,
	},
	async test(t) {
		const url = process.env.DATABASE_URL ?? "";
		const secret = process.env.AGENT_BRIDGE_SECRET?.trim();
		if (!TOM_TAT_EVAL.khoDo.test(url) || !secret) {
			t.skip(
				"Chỉ chạy trên kho đo dùng-một-lần (crm_<cây>_do) có AGENT_BRIDGE_SECRET.",
			);
			return;
		}
		if (!TRO_LY_OKR.khoaMoHinh.some((k) => process.env[k]?.trim())) {
			t.skip("thieu khoa mo hinh");
			return;
		}
		const chi = await chiDaTieu();
		if (chi >= tranUsd()) {
			t.skip(`tran usd ${tranUsd()} da cham: so chi phi ${chi.toFixed(6)}`);
			return;
		}

		const tep = process.env[TOM_TAT_EVAL.env.tongKet];
		if (tep) writeFileSync(tep, "");
		const moc = await lucXep();
		await batTomTat(
			await nguoiMau(),
			new Date(moc.getTime() - TOM_TAT_EVAL.cauHinhTruocXepMs),
		);
		const xep = await xepMotLan(moc);
		t.log(`xep ${moc.toISOString()}: ${xep}`);
		t.check(
			xep,
			satisfies<string>((o: string) => o.startsWith("da-xep:"), "xep chay"),
		);

		const conMo = await xaHet(async () => {
			const r = await t.target.fetch("/internal/crm/dispatch", {
				method: "POST",
				headers: { authorization: `Bearer ${secret}` },
			});
			return r.status;
		}, t.signal);
		t.log(`viec tom tat con mo sau khi xa: ${conMo}`);

		const viec = await db.agentTask.findMany({
			where: { kind: TOM_TAT_EVAL.loaiTomTat },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			select: { id: true, payload: true, createdAt: true, outcome: true },
		});
		for (const v of viec) {
			const p = okrTroLyViec.parse(v.payload);
			if (p.viec !== "tom-tat-tuan") continue;
			const [phong, ban, goi] = await Promise.all([
				db.department.findUnique({
					where: { id: p.departmentId },
					select: { name: true },
				}),
				db.okrTomTat.findUnique({ where: { taskId: v.id } }),
				dungGoiTomTat(
					db,
					{
						cycleId: p.cycleId,
						departmentId: p.departmentId,
						tuan: p.tuan,
						moc: v.createdAt,
					},
					LUAT_TOM_TAT,
				),
			]);
			const noiDung = ban ? parseNoiDungTomTat(ban.cau) : null;
			const lan = lanTheoId(goi);
			const dong = {
				moc: moc.toISOString(),
				taskId: v.id,
				departmentId: p.departmentId,
				phong: phong?.name ?? p.departmentId,
				nac: p.nac,
				outcome: v.outcome,
				tomTatId: ban?.id ?? null,
				trangThai: ban?.trangThai ?? null,
				cau: noiDung?.cau ?? [],
				bo: noiDung?.bo ?? [],
				krTut: (goi?.krs ?? [])
					.filter((k) => k.lyDo.some((l) => l.loai === "tut"))
					.map((k) => k.id),
				krCuaNguon: Object.fromEntries(
					(goi?.nguon ?? []).map((n) => [n.id, n.keyResultId]),
				),
			};
			if (tep) appendFileSync(tep, `${JSON.stringify(dong)}\n`);
			t.log(JSON.stringify(dong));
			t.check(
				v.outcome ?? "",
				satisfies<string>(
					(o: string) => o.startsWith("da-nop"),
					`viec ${dong.phong} dong bang da-nop`,
				),
			);
			if (!noiDung || noiDung.cau.length === 0) continue;
			t.judge.autoevals
				.closedQA(tieuChiJudge(dong.phong, noiDung.cau, lan), {
					on: noiDung.cau.map((c) => c.vanBan).join("\n"),
				})
				.label(`${TOM_TAT_EVAL.nhanJudge} ${p.departmentId}`);
		}
	},
});
