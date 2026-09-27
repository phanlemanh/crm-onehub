import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const GOC = join(THU_MUC, "..", "..", "..");
const TEP_SQL = join(THU_MUC, "ty-le-kr-co-nguon.sql");
const MONG = { hieu_luc: "2/5", do_canh: "1/5", nhan_so_may: "3/4" };
const KY = { tu: "2026-07-01", den: "2026-09-30" };
const CHOT = ["2026-07-05", "2026-07-15", "2026-07-25"];
const NGAY_MS = 24 * 60 * 60 * 1000;
const CHI_SO = "thoa-thuan-chot-duoc";
const GHIM_GOP = "đo cạnh bị gộp";
const LOC_BO_PHAN =
	/\n\s*AND coalesce\(o\."divisionId", d\."divisionId", dp\."divisionId"\) = ANY \(t\.bo_phan\)/;
const HAI_COT_DAU =
	/\(SELECT count\(\*\) FILTER \(WHERE source = 'crm'\) FROM kr\) \|\| '\/' \|\| \(SELECT count\(\*\) FROM kr\) AS hieu_luc,\n\s*\(SELECT count\(\*\) FROM do_canh\) \|\| '\/' \|\| \(SELECT count\(\*\) FROM kr\) AS do_canh,/;

function thoat(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

const chieuDo = process.argv.includes("--chieu-do");
const sql = readFileSync(TEP_SQL, "utf8");
const banSao = {
	gop: sql.replace(
		HAI_COT_DAU,
		"(SELECT count(*) FILTER (WHERE source = 'crm' OR loai_may = 'crm') FROM kr) || '/' || (SELECT count(*) FROM kr) AS hieu_luc,",
	),
	boLoc: sql.replace(LOC_BO_PHAN, ""),
};
for (const [ten, chu] of Object.entries(banSao))
	if (chu === sql)
		thoat(
			2,
			`KHONG DO DUOC: không dựng được bản sao ${ten} — câu SQL đã đổi hình`,
		);

const { isMeasureDatabase } = await import(
	join(GOC, "packages/db/src/measure-database.ts")
);
const { tenDb } = await import(join(GOC, "scripts/lan-do/kho-nhap.mjs"));
const kho = tenDb(process.env.DATABASE_URL ?? "");
const api = process.env.API_URL;
if (
	kho === null ||
	!isMeasureDatabase(kho) ||
	process.env.PHIEN_DO !== kho ||
	!api
)
	thoat(
		2,
		`KHONG DO DUOC: cần một phiên đo (kho _do, PHIEN_DO và API_URL của chính phiên) — kho "${kho}", PHIEN_DO "${process.env.PHIEN_DO ?? ""}", API_URL "${api ?? ""}". Chạy qua scripts/lan-do/tien-de.mjs`,
	);
console.log(`kho: ${kho} · api: ${api}`);

const { db } = await import(join(GOC, "packages/db/src/client.ts"));
const { gieoThanhVien, mintPhien } = await import(
	join(GOC, "apps/api/test/phien-thu.ts")
);
const { chupSoOkr } = await import(
	join(GOC, "apps/agent/agent/lib/okr-chup.ts")
);

const TIEN_TO = `tl-${Date.now().toString(36)}`;
let dem = 0;
const ma = (phan) => {
	dem += 1;
	return `${TIEN_TO}-${phan}-${dem}`;
};
const vn = (ngay, gio = "10:00") => new Date(`${ngay}T${gio}:00+07:00`);

async function goi(cookie, thuTuc, vao) {
	const tra = await fetch(`${api}/api/trpc/${thuTuc}`, {
		method: "POST",
		headers: { cookie, "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	const than = await tra.json().catch(() => null);
	if (tra.status !== 200)
		thoat(
			2,
			`KHONG DO DUOC: ${thuTuc} trả HTTP ${tra.status} ${than?.error?.message ?? ""}`,
		);
	return than?.result?.data;
}

async function gieo() {
	const u = ma("u");
	await gieoThanhVien(u, "member");
	const { cookie } = await mintPhien(u);
	const boPhan = async (ten) =>
		(
			await db.division.create({
				data: { name: ma(ten), position: 0, headUserId: u },
			})
		).id;
	const B1 = await boPhan("B1");
	const B2 = await boPhan("B2");
	const B3 = await boPhan("B3");
	const phong = async (ten, divisionId) =>
		(
			await db.department.create({
				data: { name: ma(ten), position: 0, divisionId },
			})
		).id;
	const P1 = await phong("P1", B1);
	const P2 = await phong("P2", B2);
	const P3 = await phong("P3", B3);
	await db.orgPlacement.create({
		data: { userId: u, primaryDepartmentId: P1 },
	});
	const cty = await db.company.create({ data: { name: ma("cty") } });
	for (const ngay of CHOT)
		await db.deal.create({
			data: {
				name: ma("thoa-thuan"),
				companyId: cty.id,
				ownerId: u,
				stage: "CLOSED_WON",
				closedAt: vn(ngay),
				createdAt: vn(KY.tu),
			},
		});
	const ky = await db.okrCycle.create({
		data: {
			kind: "quy",
			name: ma("ky"),
			startsOn: new Date(`${KY.tu}T00:00:00Z`),
			endsOn: new Date(`${KY.den}T00:00:00Z`),
			phase: "dang-chay",
		},
	});
	const mucTieu = async (departmentId) =>
		(
			await db.okrObjective.create({
				data: {
					cycleId: ky.id,
					level: "phong-ban",
					departmentId,
					ownerUserId: u,
					kind: "cam-ket",
					status: "nhap",
					title: ma("muc-tieu"),
				},
			})
		).id;
	const kr = async (objectiveId) =>
		(
			await db.okrKeyResult.create({
				data: {
					objectiveId,
					title: ma("kr"),
					kind: "tang-toi",
					ownerUserId: u,
					startValue: 0,
					targetValue: 10,
					currentValue: 0,
					source: "tay",
				},
			})
		).id;
	const OA = await mucTieu(P1);
	const OB = await mucTieu(P2);
	const OC = await mucTieu(P1);
	const OD = await mucTieu(P3);
	const OE = await mucTieu(P1);
	const K = {
		crmB1: await kr(OA),
		tayB1: await kr(OA),
		crmB2: await kr(OB),
		tayB2: await kr(OB),
		doCanh: await kr(OC),
		crmB3: await kr(OD),
		crmNhap: await kr(OE),
	};
	const crm = (keyResultId, id) =>
		goi(cookie, "okr.datNguonKr", {
			keyResultId,
			loai: "crm",
			chiSo: CHI_SO,
			phamVi: { kieu: "phong-ban", id },
		});
	await crm(K.crmB1, P1);
	await crm(K.crmB2, P2);
	await crm(K.crmB3, P3);
	await crm(K.crmNhap, P1);
	for (const id of [OA, OB, OC, OD])
		await goi(cookie, "okr.publishObjective", { id });
	await crm(K.doCanh, P1);

	const chup = async (ngay) => {
		const luc = new Date(vn(ngay, "00:05").getTime() + NGAY_MS);
		const kq = await chupSoOkr(luc, { docO: async () => ({ loi: "tat" }) });
		const dong = await db.okrSoChup.findFirst({
			where: { keyResultId: K.doCanh, ngay: new Date(`${ngay}T00:00:00Z`) },
			select: { giaTri: true },
		});
		console.log(
			`chupSoOkr luc ${luc.toISOString()}: ghi ${kq.ghi} dong; KR do canh ngay ${ngay} = ${Number(dong?.giaTri ?? Number.NaN)}`,
		);
	};
	const capNhat = async (value) => {
		const { sessionId } = await goi(cookie, "okr.moCapNhat", { entry: "tab" });
		await goi(cookie, "okr.guiCapNhat", {
			sessionId,
			items: [{ keyResultId: K.doCanh, value, confidence: "vua", note: "" }],
		});
		console.log(`guiCapNhat KR do canh: ${value}`);
	};
	await chup("2026-07-10");
	await capNhat(1);
	await chup("2026-07-20");
	await capNhat(2);
	await capNhat(1);
	await chup("2026-08-01");
	await capNhat(3);

	const nguon = await db.okrKeyResult.findMany({
		where: { id: { in: Object.values(K) } },
		select: { id: true, source: true, nguonMay: { select: { loai: true } } },
	});
	for (const [ten, id] of Object.entries(K)) {
		const n = nguon.find((x) => x.id === id);
		console.log(
			`KR ${ten}: source ${n?.source}, nguon may ${n?.nguonMay?.loai ?? "-"}`,
		);
	}
	return { chuKy: ky.id, boPhan: [B1, B2] };
}

async function chay(cau, thamSo) {
	const [ra] = await db.$transaction(async (tx) => {
		await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
		await tx.$executeRawUnsafe(
			"SELECT set_config('okr.chu_ky', $1, true)",
			thamSo.chuKy,
		);
		await tx.$executeRawUnsafe(
			"SELECT set_config('okr.bo_phan', $1, true)",
			thamSo.boPhan.join(","),
		);
		return tx.$queryRawUnsafe(cau);
	});
	return ra;
}

const tu = (x) => Number(String(x ?? "").split("/")[0]);

function kiem(ra) {
	const hong = [];
	const gop = `${tu(MONG.hieu_luc) + tu(MONG.do_canh)}/${MONG.hieu_luc.split("/")[1]}`;
	if (!("do_canh" in ra) || ra.hieu_luc === gop)
		hong.push(
			`${GHIM_GOP}: hieu_luc ${ra.hieu_luc}, do_canh ${ra.do_canh ?? "(không còn cột)"}`,
		);
	for (const [cot, mong] of Object.entries(MONG))
		if (ra[cot] !== mong)
			hong.push(`${cot}: nhận ${ra[cot] ?? "(không có)"}, mong ${mong}`);
	return hong;
}

const inRa = (nhan, ra) =>
	console.log(
		`${nhan}: hieu_luc ${ra.hieu_luc} · do_canh ${ra.do_canh ?? "(không còn cột)"} · nhan_so_may ${ra.nhan_so_may}`,
	);

try {
	const thamSo = await gieo();
	console.log(
		`SET okr.chu_ky = '${thamSo.chuKy}'; SET okr.bo_phan = '${thamSo.boPhan.join(",")}'`,
	);
	inRa("mong", MONG);
	if (!chieuDo) {
		const ra = await chay(sql, thamSo);
		inRa("ty-le-kr-co-nguon.sql", ra);
		const hong = kiem(ra);
		for (const h of hong) console.log(`HONG ${h}`);
		process.exitCode = hong.length === 0 ? 0 : 1;
	} else {
		let bat = 0;
		for (const [ten, cau, ghim] of [
			["ban sao gop hai cot dau", banSao.gop, GHIM_GOP],
			["ban sao bo loc bo phan", banSao.boLoc, "hieu_luc: nhận 3/6, mong 2/5"],
		]) {
			const ra = await chay(cau, thamSo);
			inRa(ten, ra);
			const hong = kiem(ra);
			for (const h of hong) console.log(`  HONG ${h}`);
			const dung = hong.some((h) => h.startsWith(ghim));
			if (dung) bat += 1;
			console.log(`  ${dung ? "bat" : "LOT"}: ${ghim}`);
		}
		console.log(`chieu do: ${bat}/2 ban sao bi bat`);
		process.exitCode = bat === 2 ? 1 : 0;
	}
	console.log("kho do bo khi phien dong — khong don tay (okrSoChup chi them)");
} finally {
	await db.$disconnect();
}
