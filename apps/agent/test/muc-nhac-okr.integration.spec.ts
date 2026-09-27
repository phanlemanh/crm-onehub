import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { type MucNhac, parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { TIEU_DE } from "../agent/lib/tin-nhac";
import {
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	slackGia,
} from "./support/nhac-gieo";
import {
	hangCua,
	lucVN,
	NGAY_NHAC,
	ngayCach,
	PHUT_SAU,
} from "./support/nhac-gui-gieo";
import {
	batBot,
	binhLuan,
	donOkr,
	GIO_MS,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	guiCapNhat,
	noiZalo,
	tatBot,
	theoDoi,
	vet,
	voiToken,
} from "./support/okr-gieo";
import { zaloGia } from "./support/zalo-gia";

const CHO_CA_MS = 60_000;

const APP_URL = "https://crm.test";

const goc = lucVN(NGAY_NHAC, PHUT_SAU);

const KHOA_VIET_TAY = {
	"okr-cap-nhat": ["krIds", "loai"],
	"okr-kr-im": ["keyResultId", "loai"],
	"okr-duoc-giao": ["keyResultId", "loai", "objectiveId"],
	"okr-nhac-ten": ["commentId", "loai"],
	"okr-theo-doi": ["loai", "objectiveId"],
} as const;

type LoaiOkr = keyof typeof KHOA_VIET_TAY;

const LOAI = Object.keys(KHOA_VIET_TAY) as LoaiOkr[];

type Gieo = { id: string; ma: Record<LoaiOkr, MucNhac> };

async function gieoNamLoai(ten: string, chay: string): Promise<Gieo> {
	const P = await gieoNguoi(ten);
	const khac = await gieoNguoi(`${ten}-khac`);
	const truoc = new Date(goc.getTime() - 2 * GIO_MS);
	const o1 = await gieoMucTieu({
		cycleId: chay,
		chu: P.id,
		congBo: ngayCach(goc, -20),
	});
	const k1 = await gieoKr({
		objectiveId: o1,
		chu: P.id,
		khoa: ngayCach(goc, -20),
	});
	const o2 = await gieoMucTieu({ cycleId: chay, chu: khac.id, congBo: truoc });
	const k2 = await gieoKr({ objectiveId: o2, chu: P.id, khoa: truoc });
	await vet({
		action: "sua-kr",
		nguoiLam: khac.id,
		objectiveId: o2,
		keyResultId: k2,
		truoc: { ownerUserId: khac.id },
		sau: { ownerUserId: P.id },
		luc: truoc,
	});
	const c = await binhLuan({
		objectiveId: o2,
		tacGia: khac.id,
		nhacTen: [P.id],
		luc: truoc,
	});
	const o3 = await gieoMucTieu({
		cycleId: chay,
		chu: khac.id,
		congBo: ngayCach(goc, -20),
	});
	const k3 = await gieoKr({
		objectiveId: o3,
		chu: khac.id,
		khoa: ngayCach(goc, -20),
	});
	await theoDoi(o3, P.id, ngayCach(goc, -3));
	await guiCapNhat(k3, khac.id, truoc);
	return {
		id: P.id,
		ma: {
			"okr-cap-nhat": { loai: "okr-cap-nhat", krIds: [k1] },
			"okr-kr-im": { loai: "okr-kr-im", keyResultId: k1 },
			"okr-duoc-giao": {
				loai: "okr-duoc-giao",
				objectiveId: o2,
				keyResultId: k2,
			},
			"okr-nhac-ten": { loai: "okr-nhac-ten", commentId: c },
			"okr-theo-doi": { loai: "okr-theo-doi", objectiveId: o3 },
		},
	};
}

function dongDuoi(text: string, tieuDe: string): string[] {
	const dong = text.split("\n");
	const dau = dong.indexOf(tieuDe);
	if (dau < 0) return [];
	const sau = dong.slice(dau + 1);
	const het = sau.indexOf("");
	return het < 0 ? sau : sau.slice(0, het);
}

beforeEach(async () => {
	await donOkr();
	await moXuong();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donOkr();
	await tatBot();
});

describe("vet-khuon", () => {
	test(
		"vet-khuon: dong vet hong khuon lam lenLichNhac bi tu choi neu ma dong, khong ai co hang nhac ngay do",
		async () => {
			const chay = await gieoChuKy("dang-chay", 1);
			const X = await gieoNguoi("Xuan");
			const Z = await gieoNguoi("Zet");
			const khac = await gieoNguoi("Khac");
			const truoc = new Date(goc.getTime() - 2 * GIO_MS);
			const o = await gieoMucTieu({
				cycleId: chay,
				chu: khac.id,
				congBo: ngayCach(goc, -20),
			});
			await gieoKr({ objectiveId: o, chu: Z.id, khoa: ngayCach(goc, -20) });
			const k = await gieoKr({ objectiveId: o, chu: X.id, khoa: truoc });
			await db.okrTrail.create({
				data: {
					at: truoc,
					actorUserId: khac.id,
					action: "sua-kr",
					objectiveId: o,
					keyResultId: k,
					before: { ownerUserId: khac.id },
					after: { ownerUserId: 123 },
				},
			});
			const dong = await db.okrTrail.findFirstOrThrow({
				where: { keyResultId: k, action: "sua-kr" },
			});
			setSystemTime(goc);
			const loi = await lenLichNhac(goc).then(
				() => "",
				(e: Error) => e.message,
			);
			const soHang = await db.agentTask.count({
				where: {
					kind: "nhac-ke-hoach",
					subject: {
						in: [`user:${X.id}:${NGAY_NHAC}`, `user:${Z.id}:${NGAY_NHAC}`],
					},
				},
			});
			if (!loi.includes(`Vết OKR ${dong.id}`) || soHang > 0) {
				throw new Error(
					`vet-khuon: loi bi bat (loi «${loi}», so hang ${soHang})`,
				);
			}
			expect({ loi: loi.includes("không đọc được"), soHang }).toEqual({
				loi: true,
				soHang: 0,
			});
		},
		CHO_CA_MS,
	);
});

describe("du-duong", () => {
	test(
		"du-duong: nam loai muc OKR di tron duong — ma trong hang theo bang khoa viet tay, tin Slack va tin Zalo moi loai mot dong duoi tieu de",
		async () => {
			const chay = await gieoChuKy("dang-chay", 1);
			const Z = await gieoNamLoai("Zung", chay);
			const S = await gieoNamLoai("Son", chay);
			const chuSlack = await gieoNguoi("Chu Slack", false);
			await noiSlack(chuSlack.id);
			await khopSlack(S.id, "USON");
			await noiZalo(Z.id, "ZZUNG");
			await batBot();

			setSystemTime(goc);
			await lenLichNhac(goc);

			const bang: Record<string, string> = {};
			const mong: Record<string, string> = {};
			for (const [ten, g] of [
				["Z", Z],
				["S", S],
			] as const) {
				const muc = parseNhacPayload((await hangCua(g.id)).payload).muc;
				for (const loai of LOAI) {
					const cua = muc.filter((m) => m.loai === loai);
					bang[`${ten} ${loai} muc`] = JSON.stringify(
						cua.map((m) => ({ khoa: Object.keys(m).sort(), gia: m })),
					);
					mong[`${ten} ${loai} muc`] = JSON.stringify([
						{ khoa: [...KHOA_VIET_TAY[loai]], gia: g.ma[loai] },
					]);
				}
			}

			const z = zaloGia();
			const s = slackGia();
			for (const g of [Z, S]) {
				setSystemTime(goc);
				await voiToken(async () =>
					chayNhac(await hangCua(g.id), {
						fetcher: s.fetcher,
						zaloFetcher: z.fetcher,
						appUrl: APP_URL,
					}),
				).catch((e: Error) => {
					throw new Error(`du-duong: ${e.message}`);
				});
			}
			const tinZalo = z.guiToi("ZZUNG")[0]?.body.text ?? "";
			const tinSlack =
				s.goi.find((g) => g.url.endsWith("chat.postMessage"))?.body.text ?? "";
			for (const loai of LOAI) {
				bang[`zalo ${loai}`] = String(dongDuoi(tinZalo, TIEU_DE[loai]).length);
				bang[`slack ${loai}`] = String(
					dongDuoi(tinSlack, `*${TIEU_DE[loai]}*`).length,
				);
				mong[`zalo ${loai}`] = "1";
				mong[`slack ${loai}`] = "1";
			}
			if (JSON.stringify(bang) !== JSON.stringify(mong)) {
				const lech = Object.keys(mong).filter(
					(k) => JSON.stringify(bang[k]) !== JSON.stringify(mong[k]),
				);
				throw new Error(`du-duong: ${lech.join(", ")}`);
			}
			expect(bang).toEqual(mong);
		},
		CHO_CA_MS,
	);
});
