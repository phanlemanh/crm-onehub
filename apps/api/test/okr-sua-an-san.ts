import { beforeAll } from "bun:test";
import { db } from "@crm/db";
import { QUAN_HE_GIU_CHU_KY } from "@crm/db/okr-chu-ky-hien";
import { ngayVN } from "@crm/db/onboarding-nhac";
import type { LoaiChuKy, PhaChuKy } from "@crm/validation/okr-chu-ky";
import { OKR_HOI_Y } from "@crm/validation/okr-hoi-y";
import { MOC_SAU_KHOA_CHU_KY, type MocSauKhoa } from "../src/okr/dong-ho";
import {
	CAU_HOI_MAC_DINH,
	LOI_MO_MAC_DINH,
	SO_LIEU_MAC_DINH,
	sauGio,
} from "./okr-hoi-y-san";
import { gieoMucTieuCongBo, keoDaiPhien, sangPha } from "./okr-khep-san";
import {
	CHUONG_TRINH_RONG,
	dangChay,
	dungSan,
	goi,
	ma,
	ok,
	phien,
	taoNam,
	taoQuy,
} from "./okr-san";

export type QuanHeGiu = (typeof QUAN_HE_GIU_CHU_KY)[number];

export const LY_DO_AN = "Tạo nhầm ngày, giữ lại để tra vết cũ";
const NAM_DAU = 2040;
const CHO_KHOA_MS = 10_000;
const NHIP_CHO_MS = 20;

type Chot = {
	buoc: string;
	id: string;
	toi: () => void;
	cho: Promise<void>;
};

let chot: Chot | null = null;
let thaChot: () => void = () => {};

const moc: MocSauKhoa = async (buoc, id) => {
	const c = chot;
	if (c === null || c.buoc !== buoc || c.id !== id) return;
	chot = null;
	c.toi();
	await c.cho;
};

export function chan(buoc: "khoa" | "ghi", id: string): Promise<void> {
	let toi: () => void = () => {};
	const daToi = new Promise<void>((r) => {
		toi = r;
	});
	const cho = new Promise<void>((r) => {
		thaChot = r;
	});
	chot = { buoc, id, toi, cho };
	return daToi;
}

export function tha(): void {
	chot = null;
	thaChot();
}

export async function choBenKiaDoiKhoa(
	benKia: Promise<unknown>,
	bang: "okrCycle" | "okrObjective" = "okrCycle",
	soCho = 1,
): Promise<boolean> {
	let xong = false;
	const danhDau = () => {
		xong = true;
	};
	benKia.then(danhDau, danhDau);
	const tu = Date.now();
	while (!xong && Date.now() - tu < CHO_KHOA_MS) {
		const [dong] = await db.$queryRaw<{ n: number }[]>`
			SELECT count(*)::int AS n FROM pg_stat_activity
			WHERE datname = current_database() AND wait_event_type = 'Lock'
				AND query ILIKE ${`%"${bang}"%`}`;
		if ((dong?.n ?? 0) >= soCho) return true;
		await Bun.sleep(NHIP_CHO_MS);
	}
	if (!xong) throw new Error("bên thứ hai không đứng chờ khoá hàng chu kỳ");
	return false;
}

export function giuHangChuKy(id: string) {
	let bao: () => void = () => {};
	let tha: () => void = () => {};
	const daGiu = new Promise<void>((r) => {
		bao = r;
	});
	const cho = new Promise<void>((r) => {
		tha = r;
	});
	const xong = db.$transaction(
		async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${id} FOR UPDATE`;
			bao();
			await cho;
		},
		{ timeout: CHO_KHOA_MS * 2 },
	);
	return { daGiu, tha, xong };
}

export function dungSanSuaAn(): void {
	dungSan((b) => b.overrideProvider(MOC_SAU_KHOA_CHU_KY).useValue(moc));
	beforeAll(async () => {
		ok(
			await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }),
			"cau hinh chuong trinh",
		);
		await keoDaiPhien();
	});
}

let namKe = NAM_DAU;
export const namMoi = (): number => {
	namKe += 1;
	return namKe;
};

const QUY_THU = [
	["01-01", "03-31"],
	["04-01", "06-30"],
	["07-01", "09-30"],
	["10-01", "12-31"],
] as const;

async function namCua(id: string): Promise<number> {
	const c = await db.okrCycle.findUniqueOrThrow({ where: { id } });
	return Number(ngayVN(c.startsOn).slice(0, 4));
}

export async function datPha(id: string, pha: PhaChuKy): Promise<void> {
	if (pha === "lap-ke-hoach") return;
	await dangChay(id);
	if (pha === "dang-chay") return;
	ok(await sangPha(id, "cham-diem"), `sang cham diem ${id}`);
	if (pha === "da-dong") ok(await sangPha(id, "da-dong"), `dong ${id}`);
}

export async function gieoTrong(
	kind: LoaiChuKy,
	pha: PhaChuKy,
	cha?: string,
): Promise<string> {
	let id: string;
	if (kind === "nam") id = await taoNam(`trong-${pha}`, namMoi());
	else {
		const nam = cha ?? (await taoNam("trong-cha", namMoi()));
		const y = await namCua(nam);
		const soQuy = await db.okrCycle.count({ where: { parentId: nam } });
		const [tu, den] = QUY_THU[soQuy] ?? QUY_THU[0];
		id = await taoQuy(`trong-${pha}`, nam, `${y}-${tu}`, `${y}-${den}`);
	}
	await datPha(id, pha);
	return id;
}

export async function gieoCoMucTieu(cycleId: string): Promise<string> {
	return ok<{ id: string }>(
		await goi("okr.createObjective", {
			cycleId,
			unit: { level: "onehub" },
			title: ma("muc tieu sua an"),
			kind: "cam-ket",
			ownerUserId: phien.quan.nguoi,
			participantIds: [],
			whyNow: "",
		}),
		`tao muc tieu trong ${cycleId}`,
	).id;
}

export async function an(id: string, lyDo = LY_DO_AN): Promise<void> {
	ok(await goi("okr.anChuKy", { id, lyDo }), `an ${id}`);
}

let kho: string | null = null;
async function doiSangKho(cycleId: string): Promise<void> {
	kho ??= await taoNam("kho", NAM_DAU);
	await db.okrObjective.updateMany({
		where: { cycleId },
		data: { cycleId: kho },
	});
}

export const gieoTheoQuanHe = {
	objectives: async (cycleId) => {
		const id = await gieoCoMucTieu(cycleId);
		ok(await goi("okr.dropObjective", { id }), "bo muc tieu");
	},
	children: async (cycleId) => {
		const quy = await gieoTrong("quy", "lap-ke-hoach", cycleId);
		await gieoCoMucTieu(quy);
		await an(quy);
	},
	cuaSoRa: async (cycleId) => {
		await dangChay(cycleId);
		const y = await namCua(cycleId);
		ok(
			await goi("okr.moRa", {
				cycleId,
				tuNgay: `${y}-02-01`,
				denNgay: `${y}-02-07`,
			}),
			"mo ra",
		);
	},
	diemKr: async (cycleId) => {
		await dangChay(cycleId);
		await gieoMucTieuCongBo(cycleId, [{}]);
		ok(await sangPha(cycleId, "cham-diem"), "sang cham diem");
		await doiSangKho(cycleId);
	},
	mangSangToi: async (cycleId) => {
		const c = await db.okrCycle.findUniqueOrThrow({ where: { id: cycleId } });
		const nguon = await taoNam("nguon-mang-sang", (await namCua(cycleId)) - 1);
		await dangChay(nguon);
		const { objectiveId } = await gieoMucTieuCongBo(nguon, [{}]);
		ok(await sangPha(nguon, "cham-diem"), "nguon sang cham diem");
		ok(await goi("okr.mangSang", { objectiveId }), "mang sang");
		const dong = await db.okrMangSang.findFirstOrThrow({
			where: { tuObjectiveId: objectiveId },
		});
		if (dong.sangCycleId !== c.id)
			throw new Error(
				`mang sang toi ${dong.sangCycleId}, khong toi ${c.id} — chu ky ke sai`,
			);
		await doiSangKho(cycleId);
	},
	hoiY: async (cycleId) => {
		ok(
			await goi("okr.moHoiY", {
				cycleId,
				cauHoi: CAU_HOI_MAC_DINH,
				loiMo: LOI_MO_MAC_DINH,
				soLieu: SO_LIEU_MAC_DINH,
				hanLuc: sauGio(new Date(), OKR_HOI_Y.hanGio.min * 2).toISOString(),
				nguoiChonUserId: phien.quan.nguoi,
			}),
			"mo hoi y",
		);
	},
} satisfies Record<QuanHeGiu, (cycleId: string) => Promise<void>>;

export async function demQuanHe(
	id: string,
): Promise<{ [K in QuanHeGiu]: number }> {
	const [objectives, children, cuaSoRa, diemKr, mangSangToi, hoiY] =
		await Promise.all([
			db.okrObjective.count({ where: { cycleId: id } }),
			db.okrCycle.count({ where: { parentId: id } }),
			db.okrCuaSoRa.count({ where: { cycleId: id } }),
			db.okrDiemKr.count({ where: { cycleId: id } }),
			db.okrMangSang.count({ where: { sangCycleId: id } }),
			db.okrHoiY.count({ where: { cycleId: id } }),
		]);
	return { objectives, children, cuaSoRa, diemKr, mangSangToi, hoiY };
}
