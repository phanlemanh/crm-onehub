import { describe, expect, setSystemTime, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import {
	type HopTuanOutput,
	hopTuanOutput,
} from "../src/okr/okr-xem.contracts";
import { OkrXemService } from "../src/okr/okr-xem.service";
import {
	type AiHoacCookie,
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	type Json,
	kyDangChay,
	ma,
	ok,
	pbMoi,
	truongMoi,
	ungDung,
} from "./okr-san";

dungSan();

const MA_TRAN_MS = 120_000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const GIO_GIEO = new Date("2026-09-21T03:00:00.000Z");
const GIO_DO = new Date("2026-10-21T05:00:00.000Z");
const truocDo = (ngay: number) => new Date(GIO_DO.getTime() - ngay * NGAY_MS);
const DAU_TUAN_DO = new Date("2026-10-19T03:00:00.000Z");

const TEP_KHOA_CU = join(import.meta.dir, "fixtures", "htb-khoa-cu.json");

const KHOA_CU = [
	"keyResultId",
	"objectiveId",
	"tieuDe",
	"mucTieu",
	"chuTen",
	"progress",
	"expected",
	"laMoc",
	"tuTin",
	"ghiChu",
	"lyDo",
	"checkInId",
	"camXuc",
];
const KHOA_MOI = ["ghiChuNgay", "donVi", "giaTriMoi", "mucDoi"];

type Lan = { luc: Date; giaTri: number; ghiChu?: string };
type Ca = { ten: string; kieu: "tang-toi" | "moc"; lan: Lan[] };

const CA: Ca[] = [
	{ ten: "chua-lan-nao", kieu: "tang-toi", lan: [] },
	{ ten: "mot-lan", kieu: "tang-toi", lan: [{ luc: GIO_DO, giaTri: 21 }] },
	{
		ten: "nhieu-tuan",
		kieu: "tang-toi",
		lan: [
			{ luc: truocDo(14), giaTri: 15 },
			{ luc: truocDo(7), giaTri: 18 },
			{ luc: GIO_DO, giaTri: 22, ghiChu: "tuan nay tang" },
		],
	},
	{
		ten: "hai-lan-cung-tuan",
		kieu: "tang-toi",
		lan: [
			{ luc: truocDo(7), giaTri: 30 },
			{ luc: DAU_TUAN_DO, giaTri: 27 },
			{ luc: GIO_DO, giaTri: 24 },
		],
	},
	{
		ten: "hai-lan-tuan-dau",
		kieu: "tang-toi",
		lan: [
			{ luc: DAU_TUAN_DO, giaTri: 12 },
			{ luc: GIO_DO, giaTri: 14 },
		],
	},
	{
		ten: "khong-doi",
		kieu: "tang-toi",
		lan: [
			{ luc: truocDo(7), giaTri: 20 },
			{ luc: GIO_DO, giaTri: 20 },
		],
	},
	{
		ten: "kr-moc",
		kieu: "moc",
		lan: [
			{ luc: truocDo(7), giaTri: 0 },
			{ luc: GIO_DO, giaTri: 1 },
		],
	},
	{
		ten: "chua-ghi-chu-bao-gio",
		kieu: "tang-toi",
		lan: [
			{ luc: truocDo(7), giaTri: 11 },
			{ luc: GIO_DO, giaTri: 13 },
		],
	},
	{
		ten: "ghi-chu-cu",
		kieu: "tang-toi",
		lan: [
			{ luc: truocDo(7), giaTri: 16, ghiChu: "ghi chu tuan truoc" },
			{ luc: GIO_DO, giaTri: 17 },
		],
	},
];

async function taoKr(
	objectiveId: string,
	ownerUserId: string,
	ai: AiHoacCookie,
	kieu: Ca["kieu"],
): Promise<string> {
	const so =
		kieu === "moc"
			? { startValue: 0, targetValue: 1, currentValue: 0, unit: "" }
			: { startValue: 10, targetValue: 50, currentValue: 10, unit: "đại lý" };
	return ok<{ id: string }>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma("htb kr"),
				kind: kieu,
				ownerUserId,
				dueOn: null,
				weight: 1,
				...so,
			},
			ai,
		),
		"tao kr",
	).id;
}

async function capNhat(
	userId: string,
	keyResultId: string,
	l: Lan,
): Promise<void> {
	setSystemTime(l.luc);
	const svc = ungDung().get(OkrCapNhatService);
	const { sessionId } = await svc.moCapNhat(userId, { entry: "tab" }, l.luc);
	await svc.guiCapNhat(
		userId,
		{
			sessionId,
			items: [
				{
					keyResultId,
					value: l.giaTri,
					confidence: "vua",
					note: l.ghiChu ?? "",
				},
			],
		},
		l.luc,
	);
}

type LanSql = { giaTri: number; ghiChu: string; ngay: string; tuan: string };

async function lanSql(keyResultId: string): Promise<LanSql[]> {
	return db.$queryRaw<LanSql[]>`
		SELECT c.value::float8 AS "giaTri", c.note AS "ghiChu",
			to_char(((coalesce(s."submittedAt", c."createdAt") AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, 'YYYY-MM-DD') AS ngay,
			to_char(date_trunc('week', (coalesce(s."submittedAt", c."createdAt") AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, 'YYYY-MM-DD') AS tuan
		FROM "okrCheckIn" c
		JOIN "okrCheckInSession" s ON s.id = c."sessionId"
		WHERE c."keyResultId" = ${keyResultId}
		ORDER BY coalesce(s."submittedAt", c."createdAt") ASC, c.id ASC`;
}

type Mong = {
	giaTriMoi: number | null;
	mucDoi: { tu: number; den: number; ngayTruoc: string } | null;
	ghiChu: string | null;
	ghiChuNgay: string | null;
};

function mongTuSql(lan: LanSql[]): Mong {
	const moi = lan.at(-1) ?? null;
	const ghi = [...lan].reverse().find((l) => l.ghiChu.trim() !== "") ?? null;
	let mucDoi: Mong["mucDoi"] = null;
	if (moi && lan.length >= 2) {
		const truocTuan = lan.filter((l) => l.tuan < moi.tuan);
		const so = truocTuan.at(-1) ?? lan[0];
		if (so) mucDoi = { tu: so.giaTri, den: moi.giaTri, ngayTruoc: so.ngay };
	}
	return {
		giaTriMoi: moi?.giaTri ?? null,
		mucDoi,
		ghiChu: ghi?.ghiChu ?? null,
		ghiChuNgay: ghi?.ngay ?? null,
	};
}

type Dong = HopTuanOutput["dangBan"][number];

function chupKhoaCu(
	ht: HopTuanOutput,
	tenCua: ReadonlyMap<string, string>,
): Json {
	const lat = (ds: Dong[]) =>
		ds.map((d) => ({
			ca: tenCua.get(d.keyResultId) ?? "?",
			progress: d.progress,
			expected: d.expected,
			laMoc: d.laMoc,
			tuTin: d.tuTin,
			ghiChu: d.ghiChu,
			lyDo: d.lyDo,
		}));
	return {
		tuan: ht.tuan,
		tuanDau: ht.tuanDau,
		daCapNhat: ht.daCapNhat,
		tongKr: ht.tongKr,
		dangBan: lat(ht.dangBan),
		conLai: lat(ht.conLai),
	};
}

function lechCa(
	ten: string,
	dong: Dong,
	khoaTho: string[],
	mong: Mong,
): string[] {
	const loi: string[] = [];
	const khoa = [...khoaTho].sort();
	const can = [...KHOA_CU, ...KHOA_MOI].sort();
	if (JSON.stringify(khoa) !== JSON.stringify(can))
		loi.push(`htb-muc-doi: ${ten} khoa ${khoa.join(",")}`);
	for (const k of ["giaTriMoi", "ghiChu", "ghiChuNgay"] as const)
		if (dong[k] !== mong[k])
			loi.push(`htb-muc-doi: ${ten} ${k}=${dong[k]} can ${mong[k]}`);
	if (JSON.stringify(dong.mucDoi) !== JSON.stringify(mong.mucDoi))
		loi.push(
			`htb-muc-doi: ${ten} tu=${dong.mucDoi?.tu ?? "null"} can ${mong.mucDoi?.tu ?? "null"} (${JSON.stringify(dong.mucDoi)} vs ${JSON.stringify(mong.mucDoi)})`,
		);
	return loi;
}

describe("htb-muc-doi", () => {
	test(
		"htb-muc-doi: chin ca lich su cap nhat",
		async () => {
			ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
			const loi: string[] = [];
			let dem = 0;
			try {
				setSystemTime(GIO_GIEO);
				const quy = await kyDangChay("htb-md");
				const P = await pbMoi("htb-md P", null);
				const truong = await truongMoi("department", P, "htb-md-p");
				const unit: Json = { level: "phong-ban", departmentId: P };
				const mt = ok<{ id: string }>(
					await goi(
						"okr.createObjective",
						{
							cycleId: quy,
							unit,
							title: ma("htb muc tieu"),
							kind: "cam-ket",
							ownerUserId: truong.nguoi,
							participantIds: [],
							whyNow: "",
							hienThi: "cong-khai",
						},
						truong.cookie,
					),
					"tao muc tieu",
				).id;
				const krCua = new Map<string, string>();
				for (const ca of CA)
					krCua.set(
						ca.ten,
						await taoKr(mt, truong.nguoi, truong.cookie, ca.kieu),
					);
				ok(
					await goi("okr.publishObjective", { id: mt }, truong.cookie),
					"cong bo",
				);
				for (const ca of CA)
					for (const l of ca.lan)
						await capNhat(truong.nguoi, krCua.get(ca.ten) ?? "", l);

				setSystemTime(GIO_DO);
				const tho = await ungDung()
					.get(OkrXemService)
					.hopTuan(
						truong.nguoi,
						{ cycleId: quy, unit: { loai: "pb", id: P } },
						GIO_DO,
					);
				const khoaThoCua = new Map(
					[...tho.dangBan, ...tho.conLai].map((d) => [
						d.keyResultId,
						Object.keys(d),
					]),
				);
				const ht = hopTuanOutput.parse(
					await doc("okr.hopTuan", "quan", {
						cycleId: quy,
						unit: { loai: "pb", id: P },
					}),
				);
				const tenCua = new Map(
					[...krCua].map(([ten, id]) => [id, ten] as const),
				);
				const chup = chupKhoaCu(ht, tenCua);
				if (process.env.HTB_GHI_KHOA_CU === "1")
					writeFileSync(TEP_KHOA_CU, `${JSON.stringify(chup, null, "\t")}\n`);
				if (!existsSync(TEP_KHOA_CU))
					loi.push("htb-muc-doi: thieu ban chup khoa cu");
				else if (
					JSON.stringify(chup) !==
					JSON.stringify(JSON.parse(readFileSync(TEP_KHOA_CU, "utf8")))
				)
					loi.push(
						`htb-muc-doi: khoa cu lech ban chup ${JSON.stringify(chup)}`,
					);
				const dong = new Map(
					[...ht.dangBan, ...ht.conLai].map((d) => [d.keyResultId, d]),
				);
				for (const ca of CA) {
					const id = krCua.get(ca.ten) ?? "";
					const d = dong.get(id);
					if (!d) {
						loi.push(`htb-muc-doi: ${ca.ten} khong co dong`);
						continue;
					}
					const lan = await lanSql(id);
					if (lan.length !== ca.lan.length)
						loi.push(
							`htb-muc-doi: ${ca.ten} SQL ${lan.length} lan, can ${ca.lan.length}`,
						);
					const mong = mongTuSql(lan);
					if (ca.ten === "hai-lan-cung-tuan") {
						const lienTruoc = lan.at(-2)?.giaTri;
						if (lienTruoc === mong.mucDoi?.tu)
							loi.push(
								"htb-muc-doi: doi chung hai-lan-cung-tuan lan lien truoc trung lan tuan truoc",
							);
					}
					if (ca.ten === "hai-lan-tuan-dau" && mong.mucDoi === null)
						loi.push("htb-muc-doi: doi chung hai-lan-tuan-dau mong null");
					const donVi = ca.kieu === "moc" ? "" : "đại lý";
					if (d.donVi !== donVi)
						loi.push(`htb-muc-doi: ${ca.ten} donVi=${d.donVi} can ${donVi}`);
					loi.push(...lechCa(ca.ten, d, khoaThoCua.get(id) ?? [], mong));
					dem += 1;
				}
			} finally {
				setSystemTime();
			}
			console.log(`htb-muc-doi: ${dem}/${CA.length}`);
			expect(loi.join("\n")).toBe("");
			expect(dem).toBe(9);
		},
		MA_TRAN_MS,
	);
});
