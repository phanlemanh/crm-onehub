import { db } from "@crm/db";
import { chupKrCrm } from "@crm/db/okr-chi-so";
import { KY_CON_HIEN } from "@crm/db/okr-chu-ky-hien";
import { OKR_SO } from "@crm/db/okr-so-config";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { PHA_GHI_DUOC } from "@crm/validation/okr-chu-ky";
import { kieuKr } from "@crm/validation/okr-kr";
import {
	type LyDoDocSheet,
	type OkrNguonDong,
	parseOkrNguon,
} from "@crm/validation/okr-nguon";
import { settledWithin } from "./deadline";
import {
	cauHinhSheets,
	docOSheet,
	hopKieuKq,
	soHopLeKq,
	tenLoi,
} from "./okr-sheets";

export type DocO = (
	sheetId: string,
	o: string,
) => Promise<{ giaTri: number } | { loi: LyDoDocSheet }>;

export type KetQuaChup = { ghi: number; boQua: number; conLai: number };

const NGUON_CHUP = ["crm", "bang-tinh"] as const;

const docTat: DocO = async () => ({ loi: "tat" });

export function docOSheetThat(): DocO {
	return cauHinhSheets() ? docOSheet(globalThis.fetch) : docTat;
}

function homQuaVN(now: Date): string {
	const d = new Date(`${ngayVN(now)}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() - 1);
	return d.toISOString().slice(0, 10);
}

async function docCoTran(
	docO: DocO,
	sheetId: string,
	o: string,
): Promise<{ giaTri: number } | { loi: LyDoDocSheet }> {
	try {
		const kq = await settledWithin(docO(sheetId, o), OKR_SO.sheets.tranMs);
		return kq.settled ? kq.value : { loi: "google-loi" };
	} catch {
		return { loi: "google-loi" };
	}
}

type KrCan = {
	id: string;
	source: string;
	nguonMay: { thuLuc: Date | null } | null;
};

function dangCho(kr: KrCan, now: Date): boolean {
	const thuLuc = kr.nguonMay?.thuLuc;
	if (!thuLuc) return false;
	return now.getTime() - thuLuc.getTime() < OKR_SO.sheets.thuLaiMs;
}

async function ghiBangTinh(
	kr: KrCan,
	nguon: OkrNguonDong,
	ngayDb: Date,
	giaTri: number,
	now: Date,
): Promise<number> {
	return db.$transaction(async (tx) => {
		await tx.okrNguonKr.update({
			where: { keyResultId: kr.id },
			data: { docLuc: now, docGiaTri: giaTri, docLoi: null, thuLuc: null },
		});
		const { count } = await tx.okrSoChup.createMany({
			data: [
				{
					keyResultId: kr.id,
					ngay: ngayDb,
					giaTri,
					nguon: nguon.loai,
					chiSo: nguon.chiSo,
					phamVi: nguon.phamVi ?? undefined,
					bac: nguon.bac,
				},
			],
			skipDuplicates: true,
		});
		if (count > 0 && kr.source === nguon.loai) {
			const sauHon = await tx.okrSoChup.count({
				where: { keyResultId: kr.id, nguon: nguon.loai, ngay: { gt: ngayDb } },
			});
			if (sauHon === 0) {
				await tx.okrKeyResult.update({
					where: { id: kr.id },
					data: { currentValue: giaTri },
				});
			}
		}
		return count;
	});
}

export async function chupSoOkr(
	now = new Date(),
	phuThuoc: { docO?: DocO; dongHo?: () => number } = {},
): Promise<KetQuaChup> {
	const dongHo = phuThuoc.dongHo ?? (() => performance.now());
	const batDau = dongHo();
	const ngay = homQuaVN(now);
	const ngayDb = new Date(`${ngay}T00:00:00Z`);
	const can = await db.okrKeyResult.findMany({
		where: {
			nguonMay: { loai: { in: [...NGUON_CHUP] } },
			objective: {
				status: "cong-bo",
				cycle: {
					phase: { in: [...PHA_GHI_DUOC] },
					startsOn: { lte: ngayDb },
					endsOn: { gte: ngayDb },
					...KY_CON_HIEN,
				},
			},
			soChup: { none: { ngay: ngayDb, nguon: { in: [...NGUON_CHUP] } } },
		},
		select: { id: true, source: true, kind: true, nguonMay: true },
		orderBy: { id: "asc" },
		take: OKR_SO.chup.toiDaMoiNhip,
	});
	if (can.length === 0) return { ghi: 0, boQua: 0, conLai: 0 };
	const docO = phuThuoc.docO ?? docOSheetThat();
	let ghi = 0;
	let boQua = 0;
	let loi = 0;
	let loiDoc = 0;
	let lanDoc = 0;
	for (const kr of can) {
		try {
			const nguon = parseOkrNguon(kr.nguonMay);
			if (nguon.loai === "crm") {
				const r = await chupKrCrm(db, kr.id, ngay, parseOkrNguon);
				ghi += r.ghi;
				continue;
			}
			if (dangCho(kr, now)) {
				boQua += 1;
				continue;
			}
			if (!nguon.sheetId || !nguon.sheetO) {
				await db.okrNguonKr.update({
					where: { keyResultId: kr.id },
					data: { docLoi: "khong-thay", thuLuc: now },
				});
				loiDoc += 1;
				boQua += 1;
				continue;
			}
			if (
				lanDoc >= OKR_SO.sheets.toiDaMoiNhip ||
				dongHo() - batDau + OKR_SO.sheets.tranMs > OKR_SO.chup.hanNhipMs
			) {
				boQua += 1;
				continue;
			}
			lanDoc += 1;
			const doc = hopKieuKq(
				soHopLeKq(await docCoTran(docO, nguon.sheetId, nguon.sheetO)),
				kieuKr.parse(kr.kind),
			);
			if ("loi" in doc) {
				await db.okrNguonKr.update({
					where: { keyResultId: kr.id },
					data: { docLoi: doc.loi, thuLuc: now },
				});
				loiDoc += 1;
				boQua += 1;
				continue;
			}
			ghi += await ghiBangTinh(kr, nguon, ngayDb, doc.giaTri, now);
		} catch (e) {
			loi += 1;
			boQua += 1;
			console.error(
				`[okr-chup] KR ${kr.id} không chụp được: ${tenLoi(e instanceof Error ? e : null)}`,
			);
		}
	}
	if (ghi > 0 || loi > 0 || loiDoc > 0) {
		console.log(
			`[okr-chup] ngày ${ngay}: ${can.length} KR, ghi ${ghi}, bỏ qua ${boQua}, lỗi ${loi}, đọc bảng tính ${lanDoc}, đọc lỗi ${loiDoc}`,
		);
	}
	return {
		ghi,
		boQua,
		conLai: can.length === OKR_SO.chup.toiDaMoiNhip ? 1 : 0,
	};
}
