import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const GOC = join(THU_MUC, "..", "..", "..");
const TEP_SQL = join(THU_MUC, "ty-le-gioi-han-duyet.sql");
const TEP_MO_COI = join(THU_MUC, "okr-mo-coi.sql");
const THAM_SO = "okr.chu_ky";
const MONG = {
	gioiHan: 2,
	congBo: 10,
	guiDuyet: 8,
	capXuLy: 6,
	trungViGioCho: 35,
	xuLyTrong5Ngay: 5,
	tatTrongHaiTuan: 1,
};
const MONG_SAU_CONG_BO_THANG = { ...MONG, congBo: 11 };
const COT = Object.keys(MONG);
const GIO_MS = 60 * 60 * 1000;
const NGAY_GIO = 24;
const LUI_NGAY = 40;
const LICH_DUYET = {
	A1: [
		["gui-duyet", 1],
		["duyet", 11],
	],
	A2: [
		["gui-duyet", 2],
		["duyet", 32],
	],
	A3: [
		["gui-duyet", 3],
		["duyet", 63],
	],
	A4: [
		["gui-duyet", 241],
		["duyet", 391],
	],
	A5: [
		["gui-duyet", 4],
		["tra-lai", 24],
		["gui-duyet", 30],
		["duyet", 70],
	],
	A6: [
		["gui-duyet", 5],
		["rut-duyet", 10],
	],
	A7: [["gui-duyet", 242]],
};
const LICH_O = [
	[true, 0],
	[false, 5 * NGAY_GIO],
	[true, 10 * NGAY_GIO],
	[false, 30 * NGAY_GIO],
];
const HANH_DONG_DUYET = ["gui-duyet", "duyet", "tra-lai", "rut-duyet"];
const LY_DO_TRA_LAI = "Thiếu số khởi điểm cho KR thứ nhất";
const GHIM_NHAP = "gioiHan: nhận 3, mong 2";
const GHIM_CHI_DOC = "câu SQL không chỉ SELECT hay SET";
const MO_DAU_DUOC = new Set(["SELECT", "WITH", "SET"]);
const SET_DUOC = /^SET\s+(LOCAL\s+)?okr\.\w+\s*(=|TO)\s*'[^']*'$/i;
const CAM_GHI =
	/\b(INSERT|UPDATE|DELETE|MERGE|UPSERT|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|CALL|LOCK|VACUUM|COMMENT|REFRESH|RESET|DO|EXECUTE|PREPARE|LISTEN|NOTIFY|SET_CONFIG)\b/i;
const LOC_NHAP = {
	tu: /(cong_bo AS \([\s\S]*?)WHERE m\.status = 'cong-bo'/,
	sang: "$1WHERE m.status IN ('cong-bo', 'nhap')",
};

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
	const ra = [];
	let dau = 0;
	for (let i = 0; i < tran.length; i += 1)
		if (tran[i] === ";") {
			ra.push({
				tran: tran.slice(dau, i).trim(),
				goc: goc.slice(dau, i).trim(),
			});
			dau = i + 1;
		}
	ra.push({ tran: tran.slice(dau).trim(), goc: goc.slice(dau).trim() });
	return ra.filter((c) => c.tran !== "");
}

function kiemChiDoc(sql) {
	const hong = [];
	const cau = tachCau(sql);
	if (cau.length === 0) hong.push(`${GHIM_CHI_DOC}: tệp trống`);
	for (const [i, c] of cau.entries()) {
		const dau = c.tran.match(/^\w+/)?.[0]?.toUpperCase() ?? "(trống)";
		if (!MO_DAU_DUOC.has(dau))
			hong.push(`${GHIM_CHI_DOC}: câu ${i + 1} mở đầu bằng ${dau}`);
		if (dau === "SET" && !SET_DUOC.test(c.goc))
			hong.push(`${GHIM_CHI_DOC}: câu ${i + 1} SET ngoài tham số okr.*`);
		const cam = dau === "SET" ? null : c.tran.match(CAM_GHI);
		if (cam)
			hong.push(
				`${GHIM_CHI_DOC}: câu ${i + 1} có từ khoá ${cam[1].toUpperCase()}`,
			);
	}
	const chon = cau.filter((c) => /^(SELECT|WITH)\b/i.test(c.tran));
	if (chon.length !== 1)
		hong.push(`${GHIM_CHI_DOC}: cần đúng một câu SELECT, thấy ${chon.length}`);
	return hong;
}

const chieuDo = process.argv.includes("--chieu-do");
const sql = readFileSync(TEP_SQL, "utf8");
const sqlMoCoi = readFileSync(TEP_MO_COI, "utf8");
const chiDoc = kiemChiDoc(sql);
if (chiDoc.length > 0) thoat(1, chiDoc.map((h) => `HONG ${h}`).join("\n"));
console.log(
	`ty-le-gioi-han-duyet.sql chi SELECT/SET: dat (${tachCau(sql).length} cau, ${sql.split("\n").length} dong)`,
);
const banSao = {
	nhap: sql.replace(LOC_NHAP.tu, LOC_NHAP.sang),
	ghi: `${sql.trimEnd()}\nUPDATE "okrObjective" SET "hienThi" = 'cong-khai';\n`,
};
for (const [ten, s] of Object.entries(banSao))
	if (s === sql)
		thoat(
			2,
			`KHONG DO DUOC: khong dung duoc ban sao ${ten} — cau SQL da doi hinh`,
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
const { parseOkrVet } = await import(join(GOC, "packages/db/src/okr-vet.ts"));
const { gieoThanhVien, mintPhien } = await import(
	join(GOC, "apps/api/test/phien-thu.ts")
);

const TIEN_TO = `gd-${Date.now().toString(36)}`;
let dem = 0;
const ma = (phan) => {
	dem += 1;
	return `${TIEN_TO}-${phan}-${dem}`;
};

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

const ngayVN = (d) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
const HOM_NAY = ngayVN(new Date());
const NAM = Number(HOM_NAY.slice(0, 4));
const QUY = Math.ceil(Number(HOM_NAY.slice(5, 7)) / 3);
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

async function tienDe() {
	const [pb, bp, ky, cauHinh] = await Promise.all([
		db.department.count(),
		db.division.count(),
		db.okrCycle.count(),
		db.okrTrail.count({ where: { action: "cau-hinh" } }),
	]);
	if (pb + bp + ky + cauHinh > 0)
		thoat(
			2,
			`KHONG DO DUOC: kho do khong sach — ${pb} phong ban, ${bp} bo phan, ${ky} chu ky, ${cauHinh} vet cau-hinh co san; tatTrongHaiTuan doc vet cau-hinh toan kho nen can kho chi co fixture`,
		);
}

async function gieo() {
	const qt = ma("qt");
	const t = ma("t");
	await gieoThanhVien(qt, "admin");
	await gieoThanhVien(t, "member");
	const c = (await mintPhien(qt)).cookie;
	const ct = (await mintPhien(t)).cookie;

	const B = (await goi(c, "org.createDivision", { name: ma("B") })).id;
	await goi(c, "org.setHead", { kind: "division", id: B, userId: qt });
	const D = (
		await goi(c, "org.createDepartment", { name: ma("D"), divisionId: B })
	).id;
	await goi(c, "org.setPlacement", {
		userId: t,
		primaryDepartmentId: D,
		secondaryDepartmentIds: [],
		managerUserId: null,
	});
	await goi(c, "org.setHead", { kind: "department", id: D, userId: t });

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

	const mucTieu = async () => {
		const { id } = await goi(c, "okr.createObjective", {
			cycleId: C,
			unit: { level: "phong-ban", departmentId: D },
			title: ma("muc-tieu"),
			kind: "cam-ket",
			ownerUserId: t,
			participantIds: [],
			whyNow: "",
		});
		await goi(c, "okr.createKeyResult", {
			objectiveId: id,
			title: ma("kr"),
			kind: "tang-toi",
			ownerUserId: t,
			startValue: 0,
			targetValue: 10,
			currentValue: 0,
			unit: "",
			dueOn: null,
			weight: 1,
		});
		return id;
	};
	const gioiHan = (objectiveId) =>
		goi(c, "okr.datHienThi", {
			objectiveId,
			hienThi: "gioi-han",
			nguoiXem: [],
		});
	const o = (bat) => goi(c, "okr.setProgram", { duyetCongBo: bat });

	const P = [];
	for (let i = 0; i < 5; i += 1) P.push(await mucTieu());
	await gioiHan(P[0]);
	await gioiHan(P[1]);
	for (const id of P) await goi(c, "okr.publishObjective", { id });
	const N1 = await mucTieu();
	await gioiHan(N1);
	const A = {};
	for (const k of Object.keys(LICH_DUYET)) A[k] = await mucTieu();

	await o(true);
	for (const k of Object.keys(LICH_DUYET))
		await goi(ct, "okr.guiDuyet", { id: A[k] });
	for (const k of ["A1", "A2", "A3", "A4"])
		await goi(c, "okr.duyetMucTieu", { id: A[k] });
	await goi(c, "okr.traLaiMucTieu", {
		objectiveId: A.A5,
		lyDo: LY_DO_TRA_LAI,
	});
	await goi(ct, "okr.guiDuyet", { id: A.A5 });
	await goi(c, "okr.duyetMucTieu", { id: A.A5 });
	await goi(ct, "okr.rutDuyet", { id: A.A6 });
	await o(false);
	await o(true);
	await o(false);

	console.log(
		`gieo: chu ky C ${C} (${ngay(NAM, QUY * 3 - 2, 1)}..${ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3))}), phong ${D} (truong ${t}, nguoi duyet ${qt}); 5 cong bo thang (2 gioi han) · N1 nhap gioi han ${N1} · A1..A7 qua guiDuyet/duyetMucTieu/traLaiMucTieu/rutDuyet · setProgram bat, tat, bat, tat`,
	);
	return { C, A, ct };
}

async function datMoc(A) {
	const T0 = Math.floor((Date.now() - LUI_NGAY * NGAY_GIO * GIO_MS) / GIO_MS);
	const luc = (gio) => new Date((T0 + gio) * GIO_MS);
	for (const [k, lich] of Object.entries(LICH_DUYET)) {
		const dong = await db.okrTrail.findMany({
			where: { objectiveId: A[k], action: { in: HANH_DONG_DUYET } },
			orderBy: [{ at: "asc" }, { id: "asc" }],
			select: { id: true, action: true },
		});
		const thay = dong.map((d) => d.action).join(",");
		const mong = lich.map(([h]) => h).join(",");
		if (thay !== mong)
			thoat(
				2,
				`KHONG DO DUOC: vet duyet cua ${k} la «${thay}», lich viet truoc «${mong}»`,
			);
		for (const [i, d] of dong.entries())
			await db.okrTrail.update({
				where: { id: d.id },
				data: { at: luc(lich[i][1]) },
			});
	}
	const cauHinh = await db.okrTrail.findMany({
		where: { action: "cau-hinh" },
		orderBy: [{ at: "asc" }, { id: "asc" }],
		select: { id: true, before: true, after: true },
	});
	const doi = cauHinh
		.map((r) => ({
			id: r.id,
			truoc: parseOkrVet(r.before)?.duyetCongBo,
			sau: parseOkrVet(r.after)?.duyetCongBo,
		}))
		.filter(
			(r) =>
				typeof r.truoc === "boolean" &&
				typeof r.sau === "boolean" &&
				r.truoc !== r.sau,
		);
	const thayO = doi.map((r) => r.sau).join(",");
	const mongO = LICH_O.map(([b]) => b).join(",");
	if (thayO !== mongO)
		thoat(
			2,
			`KHONG DO DUOC: vet cau-hinh doi duyetCongBo la «${thayO}», lich viet truoc «${mongO}»`,
		);
	for (const [i, r] of doi.entries())
		await db.okrTrail.update({
			where: { id: r.id },
			data: { at: luc(LICH_O[i][1]) },
		});
	console.log(
		`moc dong ho viet truoc (gio tu T0 = ${luc(0).toISOString()}): ${Object.entries(
			LICH_DUYET,
		)
			.map(([k, l]) => `${k} ${l.map(([h, g]) => `${h}@${g}`).join(" ")}`)
			.join(" · ")} · o duyet ${LICH_O.map(([b, g]) => `${b ? "bat" : "tat"}@${g}`).join(" ")}`,
	);
}

async function chay(cau, cycleId) {
	const chon = tachCau(cau).filter((c) => /^(SELECT|WITH)\b/i.test(c.tran));
	const [ra] = await db.$transaction(async (tx) => {
		await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
		await tx.$executeRawUnsafe(
			`SELECT set_config('${THAM_SO}', $1, true)`,
			cycleId,
		);
		return tx.$queryRawUnsafe(chon[0].goc);
	});
	return ra;
}

async function chayMoCoi() {
	return db.$transaction(async (tx) => {
		await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
		return tx.$queryRawUnsafe(sqlMoCoi);
	});
}

function kiem(ra, mong) {
	const hong = [];
	for (const cot of COT)
		if (ra[cot] !== mong[cot])
			hong.push(`${cot}: nhận ${ra[cot] ?? "(không có)"}, mong ${mong[cot]}`);
	for (const cot of Object.keys(ra))
		if (!COT.includes(cot)) hong.push(`cột lạ ${cot}`);
	return hong;
}

const inRa = (nhan, ra) =>
	console.log(`${nhan}: ${COT.map((c) => `${c} ${ra[c]}`).join(" · ")}`);

try {
	await tienDe();
	const { C, A, ct } = await gieo();
	await datMoc(A);
	console.log(
		`psql: SET ${THAM_SO} = '<cycleId>'; \\i ty-le-gioi-han-duyet.sql — lan do nay: ${THAM_SO} = '${C}'`,
	);
	inRa("mong", MONG);
	const goc = await chay(sql, C);
	inRa("ty-le-gioi-han-duyet.sql", goc);
	if (!chieuDo) {
		const hong = kiem(goc, MONG).map((h) => `lan doc 1 ${h}`);
		const moCoi = await chayMoCoi();
		console.log(
			`okr-mo-coi.sql tren cung kho: ${moCoi.length} dong (mong 0)${moCoi.length > 0 ? ` ${JSON.stringify(moCoi)}` : ""}`,
		);
		if (moCoi.length !== 0) hong.push(`lop mo coi: nhận ${moCoi.length}, mong 0`);
		await goi(ct, "okr.publishObjective", { id: A.A7 });
		console.log(
			"o duyet dang tat: truong cong bo thang A7 tu cho duyet (vet cong-bo tuChoDuyet — dong cap, khong tinh la duyet)",
		);
		const sau = await chay(sql, C);
		inRa("lan doc 2", sau);
		for (const h of kiem(sau, MONG_SAU_CONG_BO_THANG))
			hong.push(`lan doc 2 ${h}`);
		for (const h of hong) console.log(`HONG ${h}`);
		console.log(`toEqual: ${hong.length === 0 ? "dat" : "HONG"}`);
		process.exitCode = hong.length === 0 ? 0 : 1;
	} else {
		let bat = 0;
		const ra = await chay(banSao.nhap, C);
		inRa("ban sao dem ca nhap", ra);
		const hongNhap = kiem(ra, MONG);
		for (const h of hongNhap) console.log(`  HONG ${h}`);
		const batNhap = hongNhap.includes(GHIM_NHAP);
		if (batNhap) bat += 1;
		console.log(`  ${batNhap ? "bat" : "LOT"}: ${GHIM_NHAP}`);
		const hongGhi = kiemChiDoc(banSao.ghi);
		for (const h of hongGhi) console.log(`  HONG ${h}`);
		const tuChoi = hongGhi.some((h) => h.startsWith(GHIM_CHI_DOC));
		if (tuChoi) bat += 1;
		console.log(
			`  ${tuChoi ? "bat" : "LOT"}: ban sao them UPDATE — ${GHIM_CHI_DOC}`,
		);
		console.log(`chieu do: ${bat}/2 ban sao bi bat`);
		process.exitCode = bat === 2 ? 1 : 0;
	}
	console.log("kho do bo khi phien dong — khong don tay");
} finally {
	await db.$disconnect();
}
