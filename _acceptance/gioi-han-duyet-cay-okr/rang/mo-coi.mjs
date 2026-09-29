import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const GOC = join(THU_MUC, "..", "..", "..");
const TEP_SQL = join(THU_MUC, "okr-mo-coi.sql");
const COT = ["objectiveId", "lop"];
const LOP = [
	"don-vi-luu-tru",
	"khong-ai-sua",
	"phu-trach-roi",
	"kr-phu-trach-roi",
];
const MONG_LOP = {
	"don-vi-luu-tru": 1,
	"khong-ai-sua": 1,
	"kr-phu-trach-roi": 1,
};
const GHIM_CHI_DOC = "câu SQL không chỉ SELECT";
const CAM_GHI =
	/\b(INSERT|UPDATE|DELETE|MERGE|UPSERT|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|CALL|LOCK|VACUUM|COMMENT|REFRESH|RESET|DO|EXECUTE|PREPARE|LISTEN|NOTIFY|SET_CONFIG)\b/i;
const CAM_TUOI =
	/\b(now|current_date|current_timestamp|age|createdAt|updatedAt|removedAt|droppedAt)\b/i;
const BO_LUU_TRU = /\n\s+WHERE [bp]\."archivedAt" IS NULL/g;

function thoat(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

function tachCau(sql) {
	const goc = sql.replace(/--[^\n]*/g, (m) => " ".repeat(m.length));
	const tran = goc.replace(
		/'(?:[^']|'')*'/g,
		(m) => `'${"x".repeat(m.length - 2)}'`,
	);
	return tran
		.split(";")
		.map((c) => c.trim())
		.filter((c) => c !== "")
		.map((c) => ({ tran: c }));
}

function kiemCau(sql) {
	const hong = [];
	const cau = tachCau(sql);
	if (cau.length !== 1)
		hong.push(`${GHIM_CHI_DOC}: cần đúng một câu, thấy ${cau.length}`);
	for (const [i, c] of cau.entries()) {
		const dau = c.tran.match(/^\w+/)?.[0]?.toUpperCase() ?? "(trống)";
		if (dau !== "WITH" && dau !== "SELECT")
			hong.push(`${GHIM_CHI_DOC}: câu ${i + 1} mở đầu bằng ${dau}`);
		const cam = c.tran.match(CAM_GHI);
		if (cam)
			hong.push(
				`${GHIM_CHI_DOC}: câu ${i + 1} có từ khoá ${cam[1].toUpperCase()}`,
			);
		const tuoi = c.tran.match(CAM_TUOI);
		if (tuoi) hong.push(`câu có mốc thời gian để tính tuổi: ${tuoi[1]}`);
	}
	return hong;
}

const chieuDo = process.argv.includes("--chieu-do");
const sql = readFileSync(TEP_SQL, "utf8");
const hongCau = kiemCau(sql);
if (hongCau.length > 0) thoat(1, hongCau.map((h) => `HONG ${h}`).join("\n"));
console.log(
	`okr-mo-coi.sql: dat — mot cau WITH/SELECT, khong tu khoa ghi, khong moc thoi gian (${sql.split("\n").length} dong)`,
);
const banSaoBoLuuTru = sql.replace(BO_LUU_TRU, "");
if (banSaoBoLuuTru === sql || sql.match(BO_LUU_TRU)?.length !== 2)
	thoat(
		2,
		"KHONG DO DUOC: khong dung duoc ban sao bo dieu kien archivedAt — cau SQL da doi hinh",
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

const TIEN_TO = `mc-${Date.now().toString(36)}`;
let dem = 0;
const ma = (phan) => {
	dem += 1;
	return `${TIEN_TO}-${phan}-${dem}`;
};

async function traLoi(tra, thuTuc) {
	const than = await tra.json().catch(() => null);
	if (tra.status !== 200)
		thoat(
			2,
			`KHONG DO DUOC: ${thuTuc} trả HTTP ${tra.status} ${than?.error?.message ?? ""}`,
		);
	return than?.result?.data;
}

async function goi(cookie, thuTuc, vao) {
	const tra = await fetch(`${api}/api/trpc/${thuTuc}`, {
		method: "POST",
		headers: { cookie, "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	return traLoi(tra, thuTuc);
}

async function hoi(cookie, thuTuc, vao) {
	const tra = await fetch(
		`${api}/api/trpc/${thuTuc}?input=${encodeURIComponent(JSON.stringify(vao))}`,
		{ headers: { cookie } },
	);
	return traLoi(tra, thuTuc);
}

const ngayVN = (d) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
const HOM_NAY = ngayVN(new Date());
const NAM = Number(HOM_NAY.slice(0, 4));
const QUY = Math.ceil(Number(HOM_NAY.slice(5, 7)) / 3);
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

async function chay(cau) {
	return db.$transaction(async (tx) => {
		await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
		return tx.$queryRawUnsafe(cau);
	});
}

const capSql = (dong) => dong.map((d) => `${d.objectiveId} ${d.lop}`).sort();
const capApi = (ds) =>
	ds.flatMap((m) => m.lyDo.map((l) => `${m.objectiveId} ${l}`)).sort();
const demLop = (cap) =>
	Object.fromEntries(
		LOP.map((l) => [l, cap.filter((c) => c.endsWith(` ${l}`)).length]).filter(
			([, n]) => n > 0,
		),
	);

async function doc(c, nhan) {
	const [dong, ds] = await Promise.all([chay(sql), hoi(c, "okr.moCoi", {})]);
	const sqlCap = capSql(dong);
	const apiCap = capApi(ds);
	console.log(
		`${nhan}: sql ${sqlCap.length} dong ${JSON.stringify(demLop(sqlCap))} · api ${apiCap.length} cap ${JSON.stringify(demLop(apiCap))}`,
	);
	return { dong, sqlCap, apiCap };
}

async function gieo() {
	const qt = ma("qt");
	const hP2 = ma("hP2");
	const k5 = ma("k5");
	await gieoThanhVien(qt, "admin");
	await gieoThanhVien(hP2, "member");
	await gieoThanhVien(k5, "member");
	const c = (await mintPhien(qt)).cookie;

	const B0 = (await goi(c, "org.createDivision", { name: ma("B0") })).id;
	const B1 = (await goi(c, "org.createDivision", { name: ma("B1") })).id;
	for (const B of [B0, B1])
		await goi(c, "org.setHead", { kind: "division", id: B, userId: qt });
	const pb = async (ten, divisionId) =>
		(await goi(c, "org.createDepartment", { name: ma(ten), divisionId })).id;
	const P2 = await pb("P2", B1);
	const P3 = await pb("P3", B0);
	const P4 = await pb("P4", B0);
	const P5 = await pb("P5", B0);
	await goi(c, "org.setPlacement", {
		userId: hP2,
		primaryDepartmentId: P2,
		secondaryDepartmentIds: [],
		managerUserId: null,
	});
	await goi(c, "org.setHead", { kind: "department", id: P2, userId: hP2 });

	const nam = await goi(c, "okr.createCycle", {
		kind: "nam",
		name: ma("nam"),
		parentId: null,
		startsOn: ngay(NAM, 1, 1),
		endsOn: ngay(NAM, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	const C = (
		await goi(c, "okr.createCycle", {
			kind: "quy",
			name: ma("C"),
			parentId: nam.id,
			startsOn: ngay(NAM, QUY * 3 - 2, 1),
			endsOn: ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3)),
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		})
	).id;
	await goi(c, "okr.setCyclePhase", { id: C, phase: "dang-chay" });

	const mucTieu = async (departmentId, chuKr) => {
		const { id } = await goi(c, "okr.createObjective", {
			cycleId: C,
			unit: { level: "phong-ban", departmentId },
			title: ma("muc-tieu"),
			kind: "cam-ket",
			ownerUserId: qt,
			participantIds: [],
			whyNow: "",
		});
		for (const ownerUserId of chuKr)
			await goi(c, "okr.createKeyResult", {
				objectiveId: id,
				title: ma("kr"),
				kind: "tang-toi",
				ownerUserId,
				startValue: 0,
				targetValue: 10,
				currentValue: 0,
				unit: "",
				dueOn: null,
				weight: 1,
			});
		await goi(c, "okr.publishObjective", { id });
		return id;
	};
	const O2 = await mucTieu(P2, [qt]);
	const O3 = await mucTieu(P3, [qt]);
	const O5 = await mucTieu(P5, [qt, k5]);
	await mucTieu(P4, [qt]);
	console.log(
		`gieo: chu ky ${C}, B0 (P3, P4, P5) B1 (P2) co truong; O2 ${O2} · O3 ${O3} · O5 ${O5} (KR cua ${k5})`,
	);
	return { c, qt, hP2, k5, B1, P2, P3, P4, O2, O3, O5 };
}

async function tienDe(c) {
	const { sqlCap, apiCap } = await doc(c, "truoc khi gieo");
	if (sqlCap.length + apiCap.length > 0)
		thoat(
			2,
			`KHONG DO DUOC: kho do da co OKR mo coi truoc khi gieo — sql ${sqlCap.length}, api ${apiCap.length}`,
		);
}

async function lamHong(s) {
	await goi(s.c, "org.setHead", { kind: "department", id: s.P2, userId: null });
	await goi(s.c, "org.setHead", { kind: "division", id: s.B1, userId: null });
	const thanhVien = await db.member.findFirstOrThrow({
		where: { userId: s.k5 },
		select: { id: true },
	});
	await goi(s.c, "workspace.removeMember", { memberId: thanhVien.id });
	await db.department.update({
		where: { id: s.P3 },
		data: { archivedAt: new Date() },
	});
	console.log(
		"lam hong: bo truong P2 va B1 · go K5 khoi khong gian lam viec · ghi thang archivedAt cho P3",
	);
}

function kiemBaLop(s, r) {
	const hong = [];
	const mongCap = [
		`${s.O2} khong-ai-sua`,
		`${s.O3} don-vi-luu-tru`,
		`${s.O5} kr-phu-trach-roi`,
	].sort();
	if (JSON.stringify(r.sqlCap) !== JSON.stringify(r.apiCap))
		hong.push(
			`sql lech api: sql ${JSON.stringify(r.sqlCap)} · api ${JSON.stringify(r.apiCap)}`,
		);
	if (JSON.stringify(demLop(r.sqlCap)) !== JSON.stringify(MONG_LOP))
		hong.push(
			`dem theo lop: nhan ${JSON.stringify(demLop(r.sqlCap))}, mong ${JSON.stringify(MONG_LOP)}`,
		);
	if (JSON.stringify(r.apiCap) !== JSON.stringify(mongCap))
		hong.push(
			`api khac ba muc viet truoc: nhan ${JSON.stringify(r.apiCap)}, mong ${JSON.stringify(mongCap)}`,
		);
	const cot = [...new Set(r.dong.flatMap((d) => Object.keys(d)))].sort();
	if (JSON.stringify(cot) !== JSON.stringify([...COT].sort()))
		hong.push(`cot tra ve ${JSON.stringify(cot)}, mong ${JSON.stringify(COT)}`);
	return hong;
}

try {
	const phienDau = await (async () => {
		const tam = ma("xem");
		await gieoThanhVien(tam, "admin");
		return (await mintPhien(tam)).cookie;
	})();
	await tienDe(phienDau);
	const s = await gieo();
	const sach = await doc(s.c, "sau khi gieo");
	if (sach.sqlCap.length + sach.apiCap.length > 0)
		thoat(1, "HONG sau khi gieo da co muc mo coi — gieo sai");
	await lamHong(s);
	const r = await doc(s.c, "sau ba lop");
	if (!chieuDo) {
		const hong = kiemBaLop(s, r);
		await goi(s.c, "org.setHead", {
			kind: "department",
			id: s.P2,
			userId: s.hP2,
		});
		await goi(s.c, "okr.transferWork", { fromUserId: s.k5, toUserId: s.qt });
		await goi(s.c, "okr.chuyenDonVi", {
			objectiveIds: [s.O3],
			denDonVi: { level: "phong-ban", id: s.P4 },
		});
		const sau = await doc(s.c, "sau ba buoc sua");
		if (sau.sqlCap.length !== 0 || sau.apiCap.length !== 0)
			hong.push(
				`sau ba buoc sua: sql ${JSON.stringify(sau.sqlCap)} · api ${JSON.stringify(sau.apiCap)}`,
			);
		for (const h of hong) console.log(`HONG ${h}`);
		console.log(`toEqual: ${hong.length === 0 ? "dat" : "HONG"}`);
		process.exitCode = hong.length === 0 ? 0 : 1;
	} else {
		const saoCap = capSql(await chay(banSaoBoLuuTru));
		console.log(
			`ban sao bo archivedAt: sql ${saoCap.length} dong ${JSON.stringify(demLop(saoCap))}`,
		);
		const lech = JSON.stringify(saoCap) !== JSON.stringify(r.apiCap);
		if (lech)
			console.log(
				`  HONG ban sao lech api: sql ${JSON.stringify(saoCap)} · api ${JSON.stringify(r.apiCap)}`,
			);
		const dvLuuTru = demLop(saoCap)["don-vi-luu-tru"] ?? 0;
		const bat = lech && dvLuuTru === 0;
		console.log(
			`  ${bat ? "bat" : "LOT"}: ban sao bo dieu kien archivedAt — don-vi-luu-tru dem ${dvLuuTru}`,
		);
		process.exitCode = bat ? 1 : 0;
	}
	console.log("kho do bo khi phien dong — khong don tay");
} finally {
	await db.$disconnect();
}
