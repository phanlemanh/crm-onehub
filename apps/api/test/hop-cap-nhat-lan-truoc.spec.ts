import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import { objectiveOutput } from "../src/okr/okr.contracts";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import { dienBienOutput } from "../src/okr/okr-xem.contracts";
import {
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
	doc,
	dungSan,
	goi,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	truongMoi,
	ungDung,
} from "./okr-san";

type LanTruoc = {
	luc: string;
	giaTri: number | null;
	tuTin: string | null;
};

type LanTruocKr = {
	lanTruocTuVet: (trail: Json, keyResultId: string) => LanTruoc | null;
	ghiChuLanTruoc: (diem: Json, luc: string) => string | null;
	tuanVN: (luc: string) => string;
};

const DUONG = `${import.meta.dir}/../../app/app/(app)/[slug]/okr/lan-truoc-kr.ts`;
const lanTruocKr: LanTruocKr = await import(DUONG);

const CHO_MS = 60_000;
const TUAN_TRUOC = new Date("2026-10-14T03:00:00Z");
const LECH_TOI_DA_MS = 5_000;

const BIEN_TUAN = [
	"2026-10-18T16:59:59Z",
	"2026-10-18T17:00:00Z",
	"2026-10-18T17:30:00Z",
	"2026-10-19T16:59:59Z",
	"2026-10-25T17:00:00Z",
	"2026-10-12T00:00:00Z",
] as const;

dungSan();

const moPhien = async (cookie: string) =>
	ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "sheet" }, cookie),
		"mo phien",
	).sessionId;

async function gui(
	cookie: string,
	items: {
		keyResultId: string;
		value: number;
		confidence: string;
		note: string;
	}[],
	nhan: string,
) {
	ok(
		await goi(
			"okr.guiCapNhat",
			{ sessionId: await moPhien(cookie), items },
			cookie,
		),
		nhan,
	);
}

async function docLanTruoc(
	objectiveId: string,
	keyResultId: string,
	cookie: string,
) {
	const mt = objectiveOutput.parse(
		await doc("okr.objective", cookie, { id: objectiveId }),
	);
	const db0 = dienBienOutput.parse(
		await doc("okr.dienBien", cookie, { keyResultId }),
	);
	const lan = lanTruocKr.lanTruocTuVet(mt.trail as Json, keyResultId);
	if (!lan) return null;
	return {
		...lan,
		ghiChu: lanTruocKr.ghiChuLanTruoc(db0.diem as Json, lan.luc),
	};
}

async function moiNhatTrongCsdl(keyResultId: string) {
	const r = await db.okrCheckIn.findFirst({
		where: { keyResultId },
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		select: {
			value: true,
			confidence: true,
			note: true,
			session: { select: { submittedAt: true } },
		},
	});
	if (!r?.session.submittedAt)
		throw new Error(`khong co lan cap nhat cua ${keyResultId}`);
	return {
		giaTri: r.value.toNumber(),
		tuTin: r.confidence,
		ghiChu: r.note.trim() === "" ? null : r.note,
		luc: r.session.submittedAt.getTime(),
	};
}

function soVoiCsdl(
	ten: string,
	lan: Awaited<ReturnType<typeof docLanTruoc>>,
	csdl: Awaited<ReturnType<typeof moiNhatTrongCsdl>>,
): string[] {
	if (!lan) return [`hct-moi-nhat: ${ten} khong co lan truoc`];
	const loi: string[] = [];
	if (lan.giaTri !== csdl.giaTri)
		loi.push(
			`hct-moi-nhat: ${ten} lech (gia tri ${lan.giaTri}, can ${csdl.giaTri})`,
		);
	if (lan.tuTin !== csdl.tuTin)
		loi.push(
			`hct-moi-nhat: ${ten} tu tin lech (${lan.tuTin}, can ${csdl.tuTin})`,
		);
	if (lan.ghiChu !== csdl.ghiChu)
		loi.push(
			`hct-moi-nhat: ${ten} ghi chu lech (${lan.ghiChu}, can ${csdl.ghiChu})`,
		);
	const lech = Math.abs(Date.parse(lan.luc) - csdl.luc);
	if (lech > LECH_TOI_DA_MS)
		loi.push(`hct-moi-nhat: ${ten} luc lech ${lech} ms`);
	return loi;
}

describe("hct-moi-nhat", () => {
	test(
		"hct-moi-nhat: khoi lan truoc la lan gui sau cung — ba lan cung tuan co ghi ho, KR moc, bien tuan VN khop may chu",
		async () => {
			ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
			const quy = await kyDangChay("hct");
			const bp = await bpMoi("hct-b");
			const pb = await pbMoi("hct-p", bp);
			const tp = await truongMoi("department", pb, "hct-tp");
			const chu = await nguoiMoi("hct-chu");
			ok(await datViTri(chu, pb), "xep chu kr");
			const cookieChu = await phienCua(chu);
			const objectiveId = ok<{ id: string }>(
				await goi(
					"okr.createObjective",
					{
						cycleId: quy,
						unit: { level: "phong-ban", departmentId: pb },
						title: ma("muc tieu"),
						kind: "cam-ket",
						ownerUserId: tp.nguoi,
						participantIds: [],
						whyNow: "",
					},
					tp.cookie,
				),
				"tao muc tieu",
			).id;
			const taoKr = async (kind: string, dich: number, unit: string) =>
				ok<{ id: string }>(
					await goi(
						"okr.createKeyResult",
						{
							objectiveId,
							title: ma(`kr ${kind}`),
							kind,
							ownerUserId: chu,
							startValue: 0,
							targetValue: dich,
							currentValue: 0,
							unit,
							dueOn: null,
							weight: 1,
						},
						tp.cookie,
					),
					`tao kr ${kind}`,
				).id;
			const k = await taoKr("tang-toi", 100, "khách");
			const m = await taoKr("moc", 1, "");
			const d = await taoKr("tang-toi", 100, "khách");
			ok(
				await goi("okr.publishObjective", { id: objectiveId }, tp.cookie),
				"cong bo",
			);

			const svc = ungDung().get(OkrCapNhatService);
			const { sessionId } = await svc.moCapNhat(
				chu,
				{ entry: "tab" },
				TUAN_TRUOC,
			);
			await svc.guiCapNhat(
				chu,
				{
					sessionId,
					items: [{ keyResultId: d, value: 20, confidence: "cao", note: "Cu" }],
				},
				TUAN_TRUOC,
			);
			await gui(
				cookieChu,
				[{ keyResultId: d, value: 30, confidence: "vua", note: "" }],
				"d tuan nay",
			);

			await gui(
				cookieChu,
				[
					{ keyResultId: k, value: 40, confidence: "cao", note: "A" },
					{ keyResultId: m, value: 0, confidence: "vua", note: "X" },
				],
				"lan 1",
			);
			await gui(
				cookieChu,
				[{ keyResultId: k, value: 50, confidence: "vua", note: "" }],
				"lan 2",
			);
			const doiChung = await docLanTruoc(objectiveId, k, cookieChu);
			const loiDoiChung =
				doiChung?.giaTri === 50 &&
				doiChung.tuTin === "vua" &&
				doiChung.ghiChu === null
					? []
					: [
							`hct-moi-nhat: doi chung K lech (${doiChung?.giaTri}, ${doiChung?.tuTin}, ${doiChung?.ghiChu})`,
						];

			await gui(
				tp.cookie,
				[{ keyResultId: k, value: 55, confidence: "thap", note: "C" }],
				"ghi ho",
			);
			await gui(
				cookieChu,
				[{ keyResultId: m, value: 1, confidence: "cao", note: "Y" }],
				"moc lan 2",
			);
			const ghiHo = await db.okrCheckIn.count({
				where: { keyResultId: k, onBehalf: true },
			});

			const loi = [
				...loiDoiChung,
				...soVoiCsdl(
					"K",
					await docLanTruoc(objectiveId, k, cookieChu),
					await moiNhatTrongCsdl(k),
				),
				...soVoiCsdl(
					"M",
					await docLanTruoc(objectiveId, m, cookieChu),
					await moiNhatTrongCsdl(m),
				),
				...soVoiCsdl(
					"D",
					await docLanTruoc(objectiveId, d, cookieChu),
					await moiNhatTrongCsdl(d),
				),
			];
			const bien = BIEN_TUAN.map((luc) => ({
				luc,
				ok: lanTruocKr.tuanVN(luc) === dauTuanVN(new Date(luc)),
			}));
			for (const o of bien)
				if (!o.ok)
					loi.push(`hct-moi-nhat: B mat ghi chu o bien tuan (${o.luc})`);
			expect({ loi, ghiHo, soO: bien.length }).toEqual({
				loi: [],
				ghiHo: 1,
				soO: BIEN_TUAN.length,
			});
		},
		CHO_MS,
	);
});
