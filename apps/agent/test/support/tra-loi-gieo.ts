import { setSystemTime } from "bun:test";
import { db } from "@crm/db";
import { NHAC } from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import { type NhacPayload, parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import {
	chayNhac,
	chuDeNhac,
	LOAI_VIEC_NHAC,
	lenLichNhac,
} from "../../agent/lib/nhac-ke-hoach";
import { nhanWebhook } from "../../agent/lib/zalo-webhook";
import {
	gieoKeHoach,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	slackGia,
	TIEN_TO,
} from "./nhac-gieo";
import { HAN_XA, HOM_QUA, MOT_NGAY, ngayCach } from "./nhac-gui-gieo";
import { zaloGia } from "./zalo-gia";
import { thanWebhook, yeuCauWebhook } from "./zalo-tin";

export const TOKEN = "1:abc";

export const DU_BIEN = { token: TOKEN, khoa: "khoa-webhook-du-dai" };

export const APP_URL = "https://crm.test";

export type Muc = NonNullable<NhacPayload["daGui"]>[number];

export async function donTraLoi(): Promise<void> {
	await db.activity.deleteMany({
		where: {
			OR: [
				{ plan: { company: { name: { startsWith: TIEN_TO } } } },
				{ createdById: { startsWith: TIEN_TO } },
			],
		},
	});
	await db.zaloUpdateSeen.deleteMany({});
	await db.zaloLinkAttempt.deleteMany({});
	await db.zaloLink.deleteMany({ where: { crmUserId: { startsWith: TIEN_TO } } });
	await db.zaloLinkCode.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.agentTask.deleteMany({ where: { kind: LOAI_VIEC_NHAC } });
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null, zaloPolledAt: null },
	});
}

export async function batBot(): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloBotName: "Bot OneHub" },
		update: { zaloBotName: "Bot OneHub" },
	});
}

export async function noiZalo(userId: string, zaloUserId: string): Promise<void> {
	await db.zaloLink.create({
		data: { crmUserId: userId, zaloUserId, zaloDisplayName: `Zalo ${zaloUserId}` },
	});
}

export function voiToken<T>(chay: () => Promise<T>): Promise<T> {
	const cu = process.env.ZALO_BOT_TOKEN;
	process.env.ZALO_BOT_TOKEN = TOKEN;
	return chay().finally(() => {
		if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
		else process.env.ZALO_BOT_TOKEN = cu;
	});
}

export type ChonGieo = {
	quaHan?: number;
	sapHan?: number;
	im?: boolean;
	moc?: boolean;
	tenDai?: boolean;
};

export async function gieoNhac(goc: Date, chon: ChonGieo, ten = "An") {
	await moXuong();
	const A = await gieoNguoi(ten);
	const O = await gieoNguoi(`${ten} Oanh`);
	const moi = ngayCach(goc, HOM_QUA);
	const dai = chon.tenDai ? " ".padEnd(180, "x") : "";
	for (let i = 0; i < (chon.quaHan ?? 0); i += 1) {
		await gieoKeHoach({
			camTrich: O.id,
			batDau: ngayCach(goc, -HAN_XA),
			imTu: moi,
			buoc: [
				{ nhan: `Tre ${i}${dai}`, giao: A.id, han: ngayCach(goc, HOM_QUA - i) },
			],
		});
	}
	for (let i = 0; i < (chon.sapHan ?? 0); i += 1) {
		await gieoKeHoach({
			camTrich: O.id,
			batDau: ngayCach(goc, -HAN_XA),
			imTu: moi,
			buoc: [{ nhan: `Sap ${i}`, giao: A.id, han: ngayCach(goc, MOT_NGAY) }],
		});
	}
	if (chon.im) {
		await gieoKeHoach({
			camTrich: A.id,
			batDau: ngayCach(goc, -HAN_XA),
			imTu: ngayCach(goc, -NHAC.imSauNgay),
			buoc: [{ nhan: "Xa im", giao: O.id, han: ngayCach(goc, HAN_XA) }],
		});
	}
	if (chon.moc) {
		await gieoKeHoach({
			camTrich: A.id,
			batDau: ngayCach(goc, 1 - NHAC.moc[0]),
			imTu: moi,
			buoc: [{ nhan: "Xa moc", giao: O.id, han: ngayCach(goc, HAN_XA) }],
		});
	}
	return { A, O };
}

export type KetGui = {
	daGui: Muc[];
	text: string;
	kenh: NhacPayload["kenh"];
	outcome: string | null;
};

export async function guiNhac(
	userId: string,
	luc: Date,
	chon: { appUrl?: string | null; slack?: boolean } = {},
): Promise<KetGui> {
	setSystemTime(luc);
	await lenLichNhac(luc);
	const hang = await hangHomNay(userId, luc);
	const z = zaloGia();
	const s = slackGia();
	if (chon.slack) {
		await noiSlack(userId);
		await khopSlack(userId, `U-${userId}`);
	}
	await voiToken(() =>
		chayNhac(hang, {
			zaloFetcher: z.fetcher,
			fetcher: s.fetcher,
			appUrl: chon.appUrl === undefined ? APP_URL : chon.appUrl,
		}),
	);
	const sau = await hangHomNay(userId, luc);
	const p = parseNhacPayload(sau.payload);
	const zalo = z.goi.find((g) => g.method === "sendMessage")?.body.text;
	const slack = s.goi.find((g) => g.body.text !== undefined)?.body.text;
	return {
		daGui: p.daGui ?? [],
		text: zalo ?? slack ?? "",
		kenh: p.kenh,
		outcome: sau.outcome,
	};
}

export async function hangHomNay(userId: string, luc: Date) {
	return db.agentTask.findFirstOrThrow({
		where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(userId, luc) },
	});
}

let demTin = 0;

export async function nhan(
	fromId: string,
	text: string,
	luc: Date,
	chon: { messageId?: string } = {},
) {
	demTin += 1;
	const z = zaloGia();
	const messageId = chon.messageId ?? `ttn-${Date.now().toString(36)}-${demTin}`;
	const than = JSON.stringify(
		thanWebhook({ messageId, fromId, ten: `Zalo ${fromId}`, text }),
	);
	setSystemTime(luc);
	const res = await nhanWebhook(yeuCauWebhook(than, DU_BIEN.khoa).request, {
		fetcher: z.fetcher,
		now: () => luc,
		env: DU_BIEN,
	});
	const tra = z.guiToi(fromId).map((g) => g.body.text ?? "");
	return { res, tra, messageId, than };
}

export function phanTu<T>(ds: T[], n: number): T {
	const gia = ds[n - 1];
	if (gia === undefined) throw new Error(`khong co muc ${n} trong ${ds.length} muc`);
	return gia;
}

export async function buocXongLuc(stepId: string): Promise<Date | null> {
	const b = await db.onboardingStep.findUnique({
		where: { id: stepId },
		select: { completedAt: true },
	});
	return b?.completedAt ?? null;
}

export async function vetXong(stepId: string) {
	return db.activity.findMany({
		where: { type: "PLAN_CHANGE", meta: { path: ["stepId"], equals: stepId } },
		orderBy: { createdAt: "asc" },
	});
}
