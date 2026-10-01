import { defineEval } from "eve/evals";
import { equals, satisfies } from "eve/evals/expect";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";
import { boCa, type CaSoan, donViCua } from "./ca";
import { JUDGE_ZDR } from "./judge";
import {
	chiPhiCuoc,
	chuKyDo,
	datCauHinhSoan,
	KICH_BAN,
	lyDoBoQua,
	moCuocVaPhien,
} from "./phien";
import { loiChiPhi, phanVi, type TachLuot, tachLuot } from "./tinh";
import { CHOT_DO_TRE, ghiTongKet } from "./tong-ket";

const DT = TRO_LY_OKR_SOAN.danhGia.doTre;
const DG = TRO_LY_OKR_SOAN.danhGia;
const LUOT = [
	KICH_BAN.moDau,
	KICH_BAN.traLoi,
	KICH_BAN.duaNhap,
	KICH_BAN.suaDoTre,
];

const daDo: { cuoc: number; ms: number[]; usd: number }[] = [];

function motCuoc(ca: CaSoan, stt: number) {
	return defineEval({
		description: `Độ trễ và chi phí soạn — cuộc ${stt + 1}/${DT.soCuoc} (${ca.id})`,
		tags: ["okr", "soan", "do-tre", ca.id],
		timeoutMs: DG.timeoutMs,
		judge: JUDGE_ZDR,
		async test(t) {
			const boQua = await lyDoBoQua();
			if (boQua) t.skip(boQua);
			const dv = await donViCua(ca);
			await datCauHinhSoan(dv.nguoiMo);
			const mo = await moCuocVaPhien({
				cycleId: await chuKyDo(),
				level: dv.level,
				divisionId: dv.divisionId,
				departmentId: dv.departmentId,
				nguoiMoUserId: dv.nguoiMo,
			});
			const ms: number[] = [];
			const tach: TachLuot[] = [];
			for (const m of LUOT.slice(0, DT.luotMoiCuoc)) {
				const l = await mo.luot(m);
				await t.require(l.kq.status, equals("waiting"));
				ms.push(l.ms);
				tach.push(tachLuot(l.kq.events));
			}
			const { usd, dong } = await chiPhiCuoc(mo.cuoc.id);
			t.check(loiChiPhi(dong), equals([])).label("costUsd moi buoc > 0");
			t.check(
				dong.length,
				satisfies<number>((n) => n > 0, "cuoc co dong AiChiPhi"),
			);
			daDo.push({ cuoc: stt, ms, usd });
			t.log(
				JSON.stringify({
					cuoc: stt + 1,
					ca: ca.id,
					ms: ms.map(Math.round),
					tach,
					usd,
				}),
			);
			ghiTongKet({ loai: "do-tre", ca: ca.id, cuoc: stt + 1, ms, tach, usd });
			t.check(
				usd,
				satisfies<number>((u) => u > 0 && u <= DT.usdMoiCuoc, CHOT_DO_TRE.usd),
			);
			if (stt !== DT.soCuoc - 1) return;
			const tatCa = daDo.flatMap((d) => d.ms);
			const p50 = phanVi(tatCa, DT.phanVi.p50);
			const p90 = phanVi(tatCa, DT.phanVi.p90);
			t.log(
				JSON.stringify({
					soCuoc: daDo.length,
					soLuot: tatCa.length,
					p50Ms: p50,
					p90Ms: p90,
					usdMax: Math.max(...daDo.map((d) => d.usd)),
				}),
			);
			t.check(daDo.length, equals(DT.soCuoc)).label("du cuoc da do");
			t.check(
				p50 ?? Number.POSITIVE_INFINITY,
				satisfies<number>((v) => v <= DT.p50Ms, CHOT_DO_TRE.p50),
			);
			t.check(
				p90 ?? Number.POSITIVE_INFINITY,
				satisfies<number>((v) => v <= DT.p90Ms, CHOT_DO_TRE.p90),
			);
		},
	});
}

function danhSach(): { ca: CaSoan; stt: number }[] {
	const ca = boCa();
	return Array.from({ length: DT.soCuoc }, (_, stt) => stt).flatMap((stt) => {
		const c = ca[stt % ca.length];
		return c ? [{ ca: c, stt }] : [];
	});
}

export default danhSach().map(({ ca, stt }) => motCuoc(ca, stt));
