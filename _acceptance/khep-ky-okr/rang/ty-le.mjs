import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const GOC = join(THU_MUC, "..", "..", "..");
const TEP_SQL = join(THU_MUC, "khep-ky.sql");
const MONG_C1 = {
	pha: "da-dong",
	mucTieu: 10,
	krCoDiem: 30,
	krTong: 30,
	coHocDuoc: 8,
	mangSang: 3,
	khacGoiY: 6,
	chamDon: 1,
};
const MONG_C2 = {
	pha: "cham-diem",
	mucTieu: 4,
	krCoDiem: 5,
	krTong: 12,
	coHocDuoc: 0,
	mangSang: 0,
	khacGoiY: 0,
	chamDon: 0,
};
const COT = Object.keys(MONG_C1);
const PHUT_DO = 0.25;
const CHO_MS = 20_000;
const KY = {
	nam: { tu: "2026-01-01", den: "2026-12-31" },
	c2: { tu: "2026-07-06", den: "2026-07-19" },
	c1: { tu: "2026-08-03", den: "2026-08-16" },
	c3: { tu: "2026-08-17", den: "2026-08-30" },
};
const LY_DO = "đã bàn lại với trưởng đơn vị";
const GHIM_BO = "mucTieu: nhận 11, mong 10";
const GHIM_CHI_DOC = "câu SQL không chỉ SELECT";
const LOC_CONG_BO = /AND o\.status = 'cong-bo'/;
const CAM_GHI =
	/\b(INSERT|UPDATE|DELETE|MERGE|UPSERT|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|CALL|LOCK|VACUUM|COMMENT|REFRESH|SET|RESET|DO)\b/i;

function thoat(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

function kiemChiDoc(sql) {
	const tran = sql.replace(/'(?:[^']|'')*'/g, "''").replace(/--[^\n]*/g, "");
	const hong = [];
	const dau = tran.trim().match(/^\w+/)?.[0]?.toUpperCase();
	if (dau !== "WITH" && dau !== "SELECT")
		hong.push(`${GHIM_CHI_DOC}: mở đầu bằng ${dau ?? "(trống)"}`);
	const cam = tran.match(CAM_GHI);
	if (cam) hong.push(`${GHIM_CHI_DOC}: có từ khoá ${cam[1].toUpperCase()}`);
	if (/;\s*\S/.test(tran)) hong.push(`${GHIM_CHI_DOC}: nhiều hơn một câu`);
	return hong;
}

const chieuDo = process.argv.includes("--chieu-do");
const sql = readFileSync(TEP_SQL, "utf8");
const chiDoc = kiemChiDoc(sql);
if (chiDoc.length > 0) thoat(1, chiDoc.map((h) => `HONG ${h}`).join("\n"));
console.log(`khep-ky.sql chi SELECT: dat (${sql.split("\n").length} dong)`);
const banSao = {
	demCaBo: sql.replace(LOC_CONG_BO, "AND o.status IN ('cong-bo', 'da-bo')"),
	ghi: `${sql.trimEnd()}\nUPDATE "okrDiemKr" SET diem = 1;\n`,
};
if (banSao.demCaBo === sql)
	thoat(
		2,
		"KHONG DO DUOC: không dựng được bản sao đếm cả mục tiêu đã bỏ — câu SQL đã đổi hình",
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
const { OKR_KHEP } = await import(
	join(GOC, "packages/validation/src/okr-khep.ts")
);

const TIEN_TO = `kk-${Date.now().toString(36)}`;
let dem = 0;
const ma = (phan) => {
	dem += 1;
	return `${TIEN_TO}-${phan}-${dem}`;
};
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

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
	const qt = ma("qt");
	const y = ma("y");
	const z = ma("z");
	await gieoThanhVien(qt, "admin");
	await gieoThanhVien(y, "member");
	await gieoThanhVien(z, "member");
	const cookie = {
		qt: (await mintPhien(qt)).cookie,
		y: (await mintPhien(y)).cookie,
		z: (await mintPhien(z)).cookie,
	};
	const bp = await db.division.create({
		data: { name: ma("B"), position: 0, headUserId: qt },
	});
	const phong = async (ten) =>
		(
			await db.department.create({
				data: { name: ma(ten), position: 0, divisionId: bp.id },
			})
		).id;
	const U1 = await phong("U1");
	const U2 = await phong("U2");
	await db.orgPlacement.create({
		data: { userId: qt, primaryDepartmentId: U1 },
	});
	for (const u of [y, z])
		await db.orgPlacement.create({
			data: { userId: u, primaryDepartmentId: U2 },
		});

	const chuKy = async (kind, parentId, k) =>
		(
			await goi(cookie.qt, "okr.createCycle", {
				kind,
				name: ma(kind),
				parentId,
				startsOn: k.tu,
				endsOn: k.den,
				breakStartsOn: null,
				breakEndsOn: null,
				updateWeekday: 1,
			})
		).id;
	const nam = await chuKy("nam", null, KY.nam);
	const C2 = await chuKy("quy", nam, KY.c2);
	const C1 = await chuKy("quy", nam, KY.c1);
	const C3 = await chuKy("quy", nam, KY.c3);
	const pha = (id, phase) => goi(cookie.qt, "okr.setCyclePhase", { id, phase });

	let soKr = 0;
	const mucTieu = async (cycleId, departmentId, chuKr) => {
		const { id } = await goi(cookie.qt, "okr.createObjective", {
			cycleId,
			unit: { level: "phong-ban", departmentId },
			title: ma("muc-tieu"),
			kind: "cam-ket",
			ownerUserId: qt,
			participantIds: [],
			whyNow: "",
		});
		const krs = [];
		for (const ownerUserId of chuKr) {
			soKr += 1;
			const kr = await goi(cookie.qt, "okr.createKeyResult", {
				objectiveId: id,
				title: ma("kr"),
				kind: "tang-toi",
				ownerUserId,
				startValue: 0,
				targetValue: 10,
				currentValue: (soKr * 3) % 11,
				unit: "",
				dueOn: null,
				weight: 1,
			});
			krs.push({ id: kr.id, ownerUserId });
		}
		await goi(cookie.qt, "okr.publishObjective", { id });
		return { id, krs };
	};

	const bo = await mucTieu(C1, U2, [y]);
	await goi(cookie.qt, "okr.dropObjective", { id: bo.id });
	const mt1 = [];
	for (let i = 0; i < 5; i += 1) mt1.push(await mucTieu(C1, U1, [qt, qt, qt]));
	const mt2 = [];
	for (let i = 0; i < 5; i += 1) mt2.push(await mucTieu(C1, U2, [y, y, z]));
	const mtC2 = [];
	for (let i = 0; i < 4; i += 1) mtC2.push(await mucTieu(C2, U1, [qt, qt, qt]));
	const c1 = [...mt1, ...mt2];
	console.log(
		`gieo: C1 ${c1.length} muc tieu cong bo + 1 da bo, C2 ${mtC2.length} muc tieu, U1 ${U1}, U2 ${U2}`,
	);

	await pha(C1, "dang-chay");
	for (const m of c1.slice(0, 5))
		await goi(cookie.qt, "okr.ghiDieuHocDuoc", {
			objectiveId: m.id,
			noiDung: `Điều học được ${m.id}`,
		});
	await pha(C1, "cham-diem");
	await pha(C2, "dang-chay");
	await pha(C2, "cham-diem");

	const goiY = new Map(
		(
			await db.okrDiemKr.findMany({
				where: { cycleId: { in: [C1, C2] } },
				select: { keyResultId: true, diemGoiY: true },
			})
		).map((d) => [d.keyResultId, Number(d.diemGoiY)]),
	);
	const khac = (g) => Math.round((g >= 0.5 ? g - 0.2 : g + 0.2) * 10) / 10;
	const cham = (ck, kr, lech) => {
		const g = goiY.get(kr.id);
		if (g === undefined)
			thoat(2, `KHONG DO DUOC: KR ${kr.id} không có dòng okrDiemKr`);
		return goi(
			ck,
			"okr.chamKr",
			lech
				? { keyResultId: kr.id, diem: khac(g), lyDo: LY_DO }
				: {
						keyResultId: kr.id,
						diem: g,
					},
		);
	};

	const krU1 = mt1.flatMap((m) => m.krs);
	const batDau = Date.now();
	for (const [i, kr] of krU1.entries()) await cham(cookie.qt, kr, i % 5 === 0);
	const dotU1 = Date.now() - batDau;
	console.log(
		`U1: ${krU1.length} lan chamKr boi qt trong ${dotU1} ms (nguong do ${PHUT_DO} phut = ${PHUT_DO * 60_000} ms)`,
	);
	if (dotU1 >= PHUT_DO * 60_000)
		thoat(
			2,
			`KHONG DO DUOC: dot cham U1 dai ${dotU1} ms, vuot nguong do ${PHUT_DO} phut — may cham qua`,
		);

	const krU2 = mt2.flatMap((m) => m.krs);
	const krY = krU2.filter((k) => k.ownerUserId === y);
	const krZ = krU2.filter((k) => k.ownerUserId === z);
	for (const [i, kr] of krY.entries()) await cham(cookie.y, kr, i % 5 === 0);
	const krC2 = mtC2.flatMap((m) => m.krs);
	for (const kr of krC2.slice(0, 3)) await cham(cookie.qt, kr, false);
	console.log(
		`U2 luot 1: ${krY.length} lan chamKr boi y; C2: 3 lan boi qt; doi ${CHO_MS} ms`,
	);
	await ngu(CHO_MS);
	for (const [i, kr] of krZ.entries()) await cham(cookie.z, kr, i === 0);
	for (const kr of krC2.slice(3, 5)) await cham(cookie.qt, kr, false);
	console.log(`U2 luot 2: ${krZ.length} lan chamKr boi z; C2: 2 lan boi qt`);

	for (const m of c1.slice(5, 8))
		await goi(cookie.qt, "okr.ghiDieuHocDuoc", {
			objectiveId: m.id,
			noiDung: `Điều học được ${m.id}`,
		});
	await goi(cookie.qt, "okr.ghiDieuHocDuoc", {
		objectiveId: c1[8].id,
		noiDung: "   ",
	});
	for (const m of [c1[0], c1[5], c1[9]]) {
		const ra = await goi(cookie.qt, "okr.mangSang", { objectiveId: m.id });
		if (ra.cycleId !== C3)
			thoat(
				2,
				`KHONG DO DUOC: mangSang ${m.id} sang ${ra.cycleId}, không phải C3 ${C3} — kho đo có chu kỳ lạ chen giữa`,
			);
	}
	await pha(C1, "da-dong");

	const dong = await db.okrDiemKr.findMany({
		where: { cycleId: { in: [C1, C2] }, diem: { not: null } },
		select: {
			cycleId: true,
			chamBoiUserId: true,
			chamLuc: true,
			keyResult: { select: { objective: { select: { departmentId: true } } } },
		},
	});
	const nhom = new Map();
	for (const d of dong) {
		const k = `${d.cycleId === C1 ? "C1" : "C2"} ${d.keyResult.objective.departmentId === U1 ? "U1" : "U2"}`;
		const n = nhom.get(k) ?? { nguoi: new Set(), luc: [] };
		n.nguoi.add(d.chamBoiUserId);
		n.luc.push(d.chamLuc.getTime());
		nhom.set(k, n);
	}
	for (const [k, n] of [...nhom].sort())
		console.log(
			`chamLuc ${k}: ${n.luc.length} dong, ${n.nguoi.size} nguoi, trai ${Math.max(...n.luc) - Math.min(...n.luc)} ms`,
		);
	return { C1, C2 };
}

async function chay(cau, cycleId, phut) {
	const [ra] = await db.$transaction(async (tx) => {
		await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
		await tx.$executeRawUnsafe(
			"SELECT set_config('okr.cycle_id', $1, true)",
			cycleId,
		);
		await tx.$executeRawUnsafe(
			"SELECT set_config('okr.phut', $1, true)",
			String(phut),
		);
		return tx.$queryRawUnsafe(cau);
	});
	return ra;
}

function kiem(ra, mong) {
	const hong = [];
	for (const cot of COT)
		if (ra[cot] !== mong[cot])
			hong.push(`${cot}: nhận ${ra[cot] ?? "(không có)"}, mong ${mong[cot]}`);
	return hong;
}

const inRa = (nhan, ra) =>
	console.log(`${nhan}: ${COT.map((c) => `${c} ${ra[c]}`).join(" · ")}`);

try {
	const { C1, C2 } = await gieo();
	console.log(
		`psql: SET okr.cycle_id = '<cycleId>'; SET okr.phut = '${OKR_KHEP.chamDon.phut}'; \\i khep-ky.sql — lan do nay dung okr.phut = '${PHUT_DO}'`,
	);
	if (!chieuDo) {
		const hong = [];
		inRa("mong C1", MONG_C1);
		const r1 = await chay(sql, C1, PHUT_DO);
		inRa(`khep-ky.sql C1 ${C1}`, r1);
		hong.push(...kiem(r1, MONG_C1).map((h) => `C1 ${h}`));
		inRa("mong C2", MONG_C2);
		const r2 = await chay(sql, C2, PHUT_DO);
		inRa(`khep-ky.sql C2 ${C2}`, r2);
		hong.push(...kiem(r2, MONG_C2).map((h) => `C2 ${h}`));
		const r2Dai = await chay(sql, C2, OKR_KHEP.chamDon.phut);
		console.log(
			`doi chung C2 voi okr.phut = ${OKR_KHEP.chamDon.phut}: chamDon ${r2Dai.chamDon} (mong 1 — mot nguoi, trai ${CHO_MS} ms)`,
		);
		if (r2Dai.chamDon !== 1)
			hong.push(
				`C2 doi chung chamDon: nhận ${r2Dai.chamDon}, mong 1 — vế thời gian không cắn`,
			);
		for (const h of hong) console.log(`HONG ${h}`);
		process.exitCode = hong.length === 0 ? 0 : 1;
	} else {
		let bat = 0;
		const goc = await chay(sql, C1, PHUT_DO);
		inRa("khep-ky.sql C1", goc);
		const ra = await chay(banSao.demCaBo, C1, PHUT_DO);
		inRa("ban sao dem ca muc tieu da bo C1", ra);
		const hong = kiem(ra, MONG_C1);
		for (const h of hong) console.log(`  HONG ${h}`);
		const dung = hong.includes(GHIM_BO);
		if (dung) bat += 1;
		console.log(`  ${dung ? "bat" : "LOT"}: ${GHIM_BO}`);
		const hongGhi = kiemChiDoc(banSao.ghi);
		for (const h of hongGhi) console.log(`  HONG ${h}`);
		const dungGhi = hongGhi.some((h) => h.startsWith(GHIM_CHI_DOC));
		if (dungGhi) bat += 1;
		console.log(
			`  ${dungGhi ? "bat" : "LOT"}: ban sao them UPDATE — ${GHIM_CHI_DOC}`,
		);
		console.log(`chieu do: ${bat}/2 ban sao bi bat`);
		process.exitCode = bat === 2 ? 1 : 0;
	}
	console.log("kho do bo khi phien dong — khong don tay");
} finally {
	await db.$disconnect();
}
