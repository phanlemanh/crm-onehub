import { appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { db, Prisma } from "@crm/db";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import type { CaGopY } from "@crm/validation/okr-ca-gop-y";
import { defineEval } from "eve/evals";
import { equals, satisfies } from "eve/evals/expect";
import { nguonKhoaMoHinh } from "../../agent/lib/mo-hinh-khoa";
import { TRO_LY_OKR } from "../../agent/lib/okr/config";
import { docBoCaGopY, THU_MUC_CA_MAU, thuMucBoCa } from "./ca-gop-y";
import {
	COT_DONG_TONG_KET,
	dongTongKet,
	TIEU_CHI_JUDGE,
} from "./tong-ket-gop-y";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

const GOP_Y_EVAL = {
	khoDo: /\/crm_[a-z0-9_]+_do(\?|$)/,
	mienMau: "@mau.onehub.test",
	tienToMau: "mau-okr-",
	cho: { phienMs: 3 * MINUTE_MS, nhipMs: 250 },
	timeoutMs: 5 * MINUTE_MS,
	ky: {
		startsOn: "2026-07-01T00:00:00Z",
		endsOn: "2026-12-31T00:00:00Z",
		updateWeekday: 1,
	},
	capTren: { "phong-ban": "bo-phan", "bo-phan": "onehub" },
	tieuChi: TIEU_CHI_JUDGE,
	nhanTruong: {
		title: "tên Mục tiêu",
		whyNow: "vì sao lúc này",
		"kr.title": "tên KR",
	},
	caMauTuGoc: ["evals/okr/ca-gop-y/mau", "apps/agent/evals/okr/ca-gop-y/mau"],
	env: TRO_LY_OKR.danhGia.env,
} as const;

type Bo = CaGopY["bo"];

function thuMucCaMau(): string {
	const thu = [
		THU_MUC_CA_MAU,
		...GOP_Y_EVAL.caMauTuGoc.map((d) => join(process.cwd(), d)),
	];
	const co = thu.find((d) => existsSync(d));
	if (!co) throw new Error(`khong thay thu muc ca mau: ${thu.join(", ")}`);
	return co;
}

function boCa(): CaGopY[] {
	const them = process.env[GOP_Y_EVAL.env.thuMucThem]?.trim();
	return [
		...docBoCaGopY(
			thuMucBoCa(process.env, GOP_Y_EVAL.env.thuMucCa, thuMucCaMau),
		),
		...(them ? docBoCaGopY(them) : []),
	];
}

function tranUsd(): number {
	const so = Number(process.env[GOP_Y_EVAL.env.tranUsd]);
	return Number.isFinite(so) && so > 0 ? so : TRO_LY_OKR.danhGia.tranUsdMacDinh;
}

async function chiDaTieu(): Promise<number> {
	const tong = await db.aiChiPhi.aggregate({ _sum: { costUsd: true } });
	return tong._sum.costUsd?.toNumber() ?? 0;
}

async function nguoiMau() {
	const ds = await db.user.findMany({
		where: { email: { endsWith: GOP_Y_EVAL.mienMau } },
		orderBy: { id: "asc" },
		select: { id: true },
	});
	if (ds.length === 0)
		throw new Error("chua nap bo OKR mau: khong co nguoi @mau.onehub.test");
	return ds.map((d) => d.id);
}

let cauHinhDaDat: Promise<void> | null = null;

function datCauHinh(nguoiTao: string): Promise<void> {
	cauHinhDaDat ??= (async () => {
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
				aiDeXuatPhamVi: "toan-cong-ty",
				aiDeXuatDonVi: [],
				aiTomTatPhamVi: "tat",
				aiTomTatDonVi: [],
				aiTranThangUsd: new Prisma.Decimal(tranUsd()),
				createdById: nguoiTao,
			},
		});
	})();
	return cauHinhDaDat;
}

async function donViCua(ca: CaGopY) {
	const khop = { name: ca.donVi.ten, archivedAt: null };
	const mau = { id: { startsWith: GOP_Y_EVAL.tienToMau }, archivedAt: null };
	if (ca.donVi.cap === "bo-phan") {
		const bp =
			(await db.division.findFirst({ where: khop })) ??
			(await db.division.findFirst({
				where: mau,
				orderBy: { position: "asc" },
			}));
		if (!bp) throw new Error("bo OKR mau khong co bo phan nao");
		return { divisionId: bp.id, departmentId: null, truong: bp.headUserId };
	}
	const pb =
		(await db.department.findFirst({ where: khop })) ??
		(await db.department.findFirst({
			where: mau,
			orderBy: { position: "asc" },
		}));
	if (!pb) throw new Error("bo OKR mau khong co phong ban nao");
	return {
		divisionId: pb.divisionId,
		departmentId: pb.id,
		truong: pb.headUserId,
	};
}

type KrCa = CaGopY["krs"][number];

function hangKr(krs: readonly KrCa[], chu: string) {
	return krs.map((k, i) => ({
		title: k.title,
		kind: k.kind,
		ownerUserId: chu,
		startValue: new Prisma.Decimal(k.startValue),
		targetValue: new Prisma.Decimal(k.targetValue),
		currentValue: new Prisma.Decimal(k.startValue),
		unit: k.unit,
		position: i,
	}));
}

async function gieo(ca: CaGopY, stt: number) {
	const nguoi = await nguoiMau();
	await datCauHinh(nguoi[0] ?? "");
	const dv = await donViCua(ca);
	const chu = dv.truong ?? nguoi[0] ?? "";
	const ky = await db.okrCycle.create({
		data: {
			kind: "quy",
			name: `Quý đo ${ca.id} ${crypto.randomUUID().slice(0, 8)}`,
			startsOn: new Date(GOP_Y_EVAL.ky.startsOn),
			endsOn: new Date(GOP_Y_EVAL.ky.endsOn),
			phase: "dang-chay",
			updateWeekday: GOP_Y_EVAL.ky.updateWeekday,
		},
	});
	let capTrenKr: string[] = [];
	if (ca.capTren) {
		const cap =
			GOP_Y_EVAL.capTren[ca.donVi.cap as keyof typeof GOP_Y_EVAL.capTren];
		await db.okrObjective.create({
			data: {
				cycleId: ky.id,
				level: cap ?? "onehub",
				divisionId: cap === "bo-phan" ? dv.divisionId : null,
				ownerUserId: chu,
				kind: ca.capTren.mucTieu.kind,
				status: "cong-bo",
				title: ca.capTren.mucTieu.title,
				whyNow: ca.capTren.mucTieu.whyNow,
				keyResults: { create: hangKr(ca.capTren.krs, chu) },
			},
		});
		capTrenKr = ca.capTren.krs.map((k) => k.title);
	}
	const mt = await db.okrObjective.create({
		data: {
			cycleId: ky.id,
			level: ca.donVi.cap,
			divisionId: ca.donVi.cap === "bo-phan" ? dv.divisionId : null,
			departmentId: ca.donVi.cap === "phong-ban" ? dv.departmentId : null,
			ownerUserId: chu,
			kind: ca.mucTieu.kind,
			status: "cong-bo",
			title: ca.mucTieu.title,
			whyNow: ca.mucTieu.whyNow,
			keyResults: { create: hangKr(ca.krs, chu) },
		},
		select: { id: true, keyResults: { select: { id: true, title: true } } },
	});
	return {
		objectiveId: mt.id,
		krs: mt.keyResults,
		capTrenKr,
		nguoiYeuCau: nguoi[stt % nguoi.length] ?? chu,
	};
}

async function cho<T>(
	doc: () => Promise<T | null>,
	signal: AbortSignal,
): Promise<T | null> {
	const het = Date.now() + GOP_Y_EVAL.cho.phienMs;
	while (Date.now() < het && !signal.aborted) {
		const v = await doc();
		if (v) return v;
		await new Promise((r) => setTimeout(r, GOP_Y_EVAL.cho.nhipMs));
	}
	return null;
}

const NHAN_TRUONG = new Map<string, string>(
	Object.entries(GOP_Y_EVAL.nhanTruong),
);

type DongJudge = {
	truong: string | null;
	truoc: string | null;
	maVanDe: string | null;
	lyDo: string;
};

function tieuChiJudge(ca: CaGopY, d: DongJudge): string {
	const truong = NHAN_TRUONG.get(d.truong ?? "") ?? d.truong ?? "";
	return [
		`Trợ lý OKR đề xuất viết lại ${truong} của một OKR. Bài nộp là câu đề xuất thay cho câu gốc.`,
		`Nội dung OKR gốc — Mục tiêu: «${ca.mucTieu.title}»; vì sao lúc này: «${ca.mucTieu.whyNow}»; KR: ${ca.krs.map((k) => `«${k.title}»`).join(", ")}.`,
		`Câu gốc (${truong}): «${d.truoc ?? ""}».`,
		`Vấn đề Trợ lý nêu${d.maVanDe ? ` (${d.maVanDe})` : ""}: ${d.lyDo}`,
		"Ngôn ngữ chiếm đa số tính trên toàn bộ nội dung OKR gốc ở trên.",
		`Bài nộp đạt khi đúng cả ba ý: ${GOP_Y_EVAL.tieuChi.join(" ")}`,
	].join("\n");
}

function motCa(ca: CaGopY, stt: number) {
	return defineEval({
		description: `Trợ lý OKR góp ý — ca ${ca.id} (${ca.bo}, ${ca.ngonNgu}): ${ca.ghiChu}`,
		tags: ["okr", "gop-y", ca.bo, ca.id],
		timeoutMs: GOP_Y_EVAL.timeoutMs,
		judge: {
			model: TRO_LY_OKR.judge.model,
			modelOptions: TRO_LY_OKR.judge.modelOptions,
		},
		async test(t) {
			const url = process.env.DATABASE_URL ?? "";
			const secret = process.env.AGENT_BRIDGE_SECRET?.trim();
			if (!GOP_Y_EVAL.khoDo.test(url) || !secret) {
				t.skip(
					"Chỉ chạy trên kho đo dùng-một-lần (crm_<cây>_do) có AGENT_BRIDGE_SECRET.",
				);
				return;
			}
			if ((await nguonKhoaMoHinh()) === null) {
				t.skip("thieu khoa mo hinh");
				return;
			}
			const chi = await chiDaTieu();
			if (chi >= tranUsd()) {
				t.skip(`tran usd ${tranUsd()} da cham: so chi phi ${chi.toFixed(6)}`);
				return;
			}

			const g = await gieo(ca, stt);
			const xep = await xepViecTroLy(db, {
				viec: "de-xuat",
				objectiveId: g.objectiveId,
				keyResultId: null,
				nguoiYeuCau: g.nguoiYeuCau,
				nac: "bat",
				now: new Date(),
			});
			await t.require(xep.bat, equals(true));
			if (!xep.bat) return;

			const r = await t.target.fetch("/internal/crm/dispatch", {
				method: "POST",
				headers: { authorization: `Bearer ${secret}` },
			});
			await t.require(r.status, equals(202));

			const hang = await cho(async () => {
				const h = await db.agentTask.findUnique({ where: { id: xep.taskId } });
				return h?.finishedAt ? h : null;
			}, t.signal);
			const dong = await db.okrDeXuat.findMany({
				where: { taskId: xep.taskId },
				orderBy: [{ createdAt: "asc" }, { id: "asc" }],
				select: COT_DONG_TONG_KET,
			});
			const tep = process.env[GOP_Y_EVAL.env.tongKet];
			if (tep) {
				appendFileSync(
					tep,
					dongTongKet({
						ca,
						objectiveId: g.objectiveId,
						krs: g.krs,
						capTrenKr: g.capTrenKr,
						taskId: xep.taskId,
						outcome: hang?.outcome ?? null,
						dong,
					}),
				);
			}
			t.log(JSON.stringify(dong));

			t.check(
				hang?.outcome ?? "",
				satisfies<string>(
					(o: string) => o.startsWith("da-nop"),
					"viec dong bang da-nop",
				),
			);

			if (ca.bo !== "viet-lai") return;
			for (const d of dong) {
				if (d.loai !== "viet-lai" || d.trangThai !== "cho") continue;
				t.judge.autoevals
					.closedQA(tieuChiJudge(ca, d), { on: d.sau ?? "" })
					.label(`${ca.id} ${d.id}`)
					.atLeast(TRO_LY_OKR.judge.nguong);
			}
		},
	});
}

export function evalCuaBo(bo: Bo) {
	return boCa()
		.map((ca, stt) => ({ ca, stt }))
		.filter(({ ca }) => ca.bo === bo)
		.map(({ ca, stt }) => motCa(ca, stt));
}

export default evalCuaBo("viet-lai");
