import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DB_GOI = join(GOC, "packages/db");
const API_DIR = join(GOC, "apps/api");
const RANG_DIR = join(dirname(fileURLToPath(import.meta.url)));

const pg = createRequire(join(DB_GOI, "package.json"))("pg");

function urlGoc() {
	const dong = readFileSync(join(GOC, ".env"), "utf8")
		.split("\n")
		.find((d) => d.startsWith("DATABASE_URL="));
	const tho = (dong?.split("=").slice(1).join("=") ?? "").trim();
	return tho.replace(/^"|"$/g, "");
}

function urlTam(ten, goc) {
	const u = new URL(goc);
	u.pathname = `/${ten}`;
	return u.toString();
}

function chayMigrate(url) {
	return spawnSync("bunx", ["prisma", "migrate", "deploy"], {
		cwd: DB_GOI,
		env: { ...process.env, DATABASE_URL: url },
		encoding: "utf8",
	});
}

async function napModule() {
	if (process.env.NODE_ENV === "test") delete process.env.NODE_ENV;
	createRequire(join(API_DIR, "package.json"))("reflect-metadata");
	const { db } = await import(join(GOC, "packages/db/src/client.ts"));
	const { dauTuanVN } = await import(
		join(GOC, "packages/db/src/onboarding-nhac.ts")
	);
	const { gieoThanhVien, dungKho } = await import(
		join(GOC, "apps/api/test/phien-thu.ts")
	);
	const { nhacPayload } = await import(
		join(GOC, "packages/validation/src/nhac-ke-hoach.ts")
	);
	const { ToChucService } = await import(
		join(GOC, "apps/api/src/to-chuc/to-chuc.service.ts")
	);
	const { OkrAccessService } = await import(
		join(GOC, "apps/api/src/okr/okr-access.service.ts")
	);
	const { OkrService } = await import(
		join(GOC, "apps/api/src/okr/okr.service.ts")
	);
	const { OkrCapNhatService } = await import(
		join(GOC, "apps/api/src/okr/okr-cap-nhat.service.ts")
	);
	return {
		db,
		dauTuanVN,
		gieoThanhVien,
		dungKho,
		nhacPayload,
		ToChucService,
		OkrAccessService,
		OkrService,
		OkrCapNhatService,
	};
}

async function gieo(mods) {
	const {
		db,
		dauTuanVN,
		gieoThanhVien,
		dungKho,
		nhacPayload,
		ToChucService,
		OkrAccessService,
		OkrService,
		OkrCapNhatService,
	} = mods;
	const R = randomBytes(3).toString("hex");
	const id = (s) => `cnt${R}${s}`;

	await dungKho();
	const nguoiMoi = async (ten) => {
		const uid = id(ten);
		await gieoThanhVien(uid, "member");
		return uid;
	};

	const P1 = await nguoiMoi("-p1");
	const P2 = await nguoiMoi("-p2");
	const P3 = await nguoiMoi("-p3");
	const P4 = await nguoiMoi("-p4");
	const P5 = await nguoiMoi("-p5");
	const Q1 = await nguoiMoi("-q1");
	const Q2 = await nguoiMoi("-q2");
	const Q3 = await nguoiMoi("-q3");
	const Q4 = await nguoiMoi("-q4");
	const Q5 = await nguoiMoi("-q5");
	const NoiseChuKy = await nguoiMoi("-nc");
	const NoiseNhap = await nguoiMoi("-nd");
	const NoiseBo = await nguoiMoi("-nb");
	const B1 = await nguoiMoi("-b1");
	const B2 = await nguoiMoi("-b2");
	const B3 = await nguoiMoi("-b3");

	const deptP = await db.department.create({
		data: { id: id("-dept-p"), name: id("-Phong P"), position: 0 },
	});
	const deptQ = await db.department.create({
		data: { id: id("-dept-q"), name: id("-Phong Q"), position: 1 },
	});
	const divQ = await db.division.create({
		data: { id: id("-div-q"), name: id("-Bo phan Q"), position: 0 },
	});

	for (const [uid, phongBanId] of [
		[P1, deptP.id],
		[P2, deptP.id],
		[P3, deptP.id],
		[P4, deptP.id],
		[P5, deptP.id],
		[Q1, deptQ.id],
		[Q2, deptQ.id],
		[Q3, deptQ.id],
		[Q4, deptQ.id],
		[Q5, deptQ.id],
		[NoiseChuKy, deptP.id],
		[NoiseNhap, deptP.id],
		[NoiseBo, deptP.id],
	]) {
		await db.orgPlacement.create({
			data: { userId: uid, primaryDepartmentId: phongBanId },
		});
	}

	const cycleChay = await db.okrCycle.create({
		data: {
			id: id("-cycle-chay"),
			kind: "quy",
			name: id("-Quy dang chay"),
			startsOn: new Date("2026-01-01"),
			endsOn: new Date("2026-12-31"),
			phase: "dang-chay",
			updateWeekday: 1,
		},
	});
	const cycleKeHoach = await db.okrCycle.create({
		data: {
			id: id("-cycle-ke-hoach"),
			kind: "quy",
			name: id("-Quy lap ke hoach"),
			startsOn: new Date("2026-01-01"),
			endsOn: new Date("2026-12-31"),
			phase: "lap-ke-hoach",
			updateWeekday: 1,
		},
	});

	const tuan1 = dauTuanVN(new Date("2026-03-02T09:00:00+07:00"));
	const gioTuan1 = new Date(`${tuan1}T09:00:00+07:00`);
	const gioTuan2 = new Date(gioTuan1.getTime() + 7 * 86400000);
	const gioTuan3 = new Date(gioTuan1.getTime() + 14 * 86400000);
	const tuan2 = dauTuanVN(gioTuan2);
	const tuan3 = dauTuanVN(gioTuan3);
	const ngayCongBo = new Date(gioTuan1.getTime() - 7 * 86400000);

	const ngayBo = new Date(ngayCongBo.getTime() + 86400000);

	const mucTieuMoi = (
		ten,
		level,
		extra,
		cycleId,
		ownerUserId,
		trangThai,
		publishedAt,
		droppedAt,
	) =>
		db.okrObjective.create({
			data: {
				id: id(ten),
				cycleId,
				level,
				...extra,
				ownerUserId,
				kind: "cam-ket",
				status: trangThai ?? "cong-bo",
				publishedAt: publishedAt ?? null,
				droppedAt: droppedAt ?? null,
				title: id(ten),
			},
		});

	const objP = await mucTieuMoi(
		"-obj-p",
		"phong-ban",
		{ departmentId: deptP.id },
		cycleChay.id,
		P1,
		"cong-bo",
		ngayCongBo,
	);
	const objPCaNhan = await mucTieuMoi(
		"-obj-p-ca-nhan",
		"ca-nhan",
		{ personUserId: P5 },
		cycleChay.id,
		P5,
		"cong-bo",
		ngayCongBo,
	);
	const objQ = await mucTieuMoi(
		"-obj-q",
		"phong-ban",
		{ departmentId: deptQ.id },
		cycleChay.id,
		Q1,
		"cong-bo",
		ngayCongBo,
	);
	const objQBoPhan = await mucTieuMoi(
		"-obj-q-bo-phan",
		"bo-phan",
		{ divisionId: divQ.id },
		cycleChay.id,
		Q5,
		"cong-bo",
		ngayCongBo,
	);
	const objNhieuChuKy = await mucTieuMoi(
		"-obj-nhieu-chu-ky",
		"phong-ban",
		{ departmentId: deptP.id },
		cycleKeHoach.id,
		NoiseChuKy,
		"cong-bo",
		ngayCongBo,
	);
	const objNhieuNhap = await mucTieuMoi(
		"-obj-nhieu-nhap",
		"phong-ban",
		{ departmentId: deptP.id },
		cycleChay.id,
		NoiseNhap,
		"nhap",
		null,
	);
	const objNhieuBo = await mucTieuMoi(
		"-obj-nhieu-bo",
		"phong-ban",
		{ departmentId: deptP.id },
		cycleChay.id,
		NoiseBo,
		"da-bo",
		ngayCongBo,
		ngayBo,
	);
	const objB1 = await mucTieuMoi(
		"-obj-b1",
		"ca-nhan",
		{ personUserId: B1 },
		cycleChay.id,
		B1,
		"cong-bo",
		ngayCongBo,
	);
	const objB2 = await mucTieuMoi(
		"-obj-b2",
		"ca-nhan",
		{ personUserId: B2 },
		cycleChay.id,
		B2,
		"cong-bo",
		ngayCongBo,
	);
	const objB3 = await mucTieuMoi(
		"-obj-b3",
		"ca-nhan",
		{ personUserId: B3 },
		cycleChay.id,
		B3,
		"cong-bo",
		ngayCongBo,
	);

	const krMoi = (ten, objectiveId, ownerUserId) =>
		db.okrKeyResult.create({
			data: {
				id: id(ten),
				objectiveId,
				title: id(ten),
				kind: "tang-toi",
				ownerUserId,
				startValue: 0,
				targetValue: 100,
				currentValue: 0,
				unit: "%",
			},
		});

	const krP1 = await krMoi("-kr-p1", objP.id, P1);
	const krP2 = await krMoi("-kr-p2", objP.id, P2);
	const krP3 = await krMoi("-kr-p3", objP.id, P3);
	const krP4 = await krMoi("-kr-p4", objP.id, P4);
	const krP5 = await krMoi("-kr-p5", objPCaNhan.id, P5);
	const krQ1 = await krMoi("-kr-q1", objQ.id, Q1);
	const krQ2 = await krMoi("-kr-q2", objQ.id, Q2);
	const krQ3 = await krMoi("-kr-q3", objQ.id, Q3);
	const krQ4 = await krMoi("-kr-q4", objQ.id, Q4);
	const krQ5 = await krMoi("-kr-q5", objQBoPhan.id, Q5);
	await krMoi("-kr-nhieu-chu-ky", objNhieuChuKy.id, NoiseChuKy);
	await krMoi("-kr-nhieu-nhap", objNhieuNhap.id, NoiseNhap);
	await krMoi("-kr-nhieu-bo", objNhieuBo.id, NoiseBo);
	const krB1 = await krMoi("-kr-b1", objB1.id, B1);
	const krB2 = await krMoi("-kr-b2", objB2.id, B2);
	const krB3 = await krMoi("-kr-b3", objB3.id, B3);

	const toChuc = new ToChucService(db);
	const okrAccess = new OkrAccessService(db, toChuc);
	const okrService = new OkrService(db, okrAccess);
	const okrCapNhat = new OkrCapNhatService(db, okrAccess, okrService);

	let phut = 0;
	const tiepPhut = () => {
		phut += 1;
		return phut;
	};

	async function capNhat(ownerUserId, keyResultId, gioMo, giay) {
		const { sessionId } = await okrCapNhat.moCapNhat(
			ownerUserId,
			{ entry: "tab" },
			gioMo,
		);
		const gioGui = new Date(gioMo.getTime() + giay * 1000);
		await okrCapNhat.guiCapNhat(
			ownerUserId,
			{
				sessionId,
				items: [{ keyResultId, value: 10, confidence: "cao", note: "" }],
			},
			gioGui,
		);
	}

	const krCuaP = {
		[P1]: krP1.id,
		[P2]: krP2.id,
		[P3]: krP3.id,
		[P4]: krP4.id,
		[P5]: krP5.id,
	};
	const krCuaQ = {
		[Q1]: krQ1.id,
		[Q2]: krQ2.id,
		[Q3]: krQ3.id,
		[Q4]: krQ4.id,
		[Q5]: krQ5.id,
	};

	for (const uid of [P1, P2, P3, P4, P5]) {
		await capNhat(
			uid,
			krCuaP[uid],
			new Date(gioTuan1.getTime() + tiepPhut() * 60000),
			30,
		);
	}
	await capNhat(
		P1,
		krCuaP[P1],
		new Date(gioTuan1.getTime() + tiepPhut() * 60000),
		30,
	);
	for (const uid of [P1, P2, P3, P4]) {
		await capNhat(
			uid,
			krCuaP[uid],
			new Date(gioTuan2.getTime() + tiepPhut() * 60000),
			30,
		);
	}
	for (const uid of [P1, P2, P3, P4, P5]) {
		await capNhat(
			uid,
			krCuaP[uid],
			new Date(gioTuan3.getTime() + tiepPhut() * 60000),
			30,
		);
	}

	for (const uid of [Q1, Q2]) {
		await capNhat(
			uid,
			krCuaQ[uid],
			new Date(gioTuan1.getTime() + tiepPhut() * 60000),
			30,
		);
	}
	for (const uid of [Q1, Q2, Q3, Q4, Q5]) {
		await capNhat(
			uid,
			krCuaQ[uid],
			new Date(gioTuan2.getTime() + tiepPhut() * 60000),
			30,
		);
	}
	for (const uid of [Q1, Q2, Q3]) {
		await capNhat(
			uid,
			krCuaQ[uid],
			new Date(gioTuan3.getTime() + tiepPhut() * 60000),
			30,
		);
	}

	await capNhat(
		B1,
		krB1.id,
		new Date(gioTuan1.getTime() + tiepPhut() * 60000),
		20,
	);
	await capNhat(
		B2,
		krB2.id,
		new Date(gioTuan1.getTime() + tiepPhut() * 60000),
		20,
	);
	await capNhat(
		B3,
		krB3.id,
		new Date(gioTuan1.getTime() + tiepPhut() * 60000),
		20,
	);

	const gioGoc = new Date(gioTuan1.getTime() - 60 * 86400000);
	const giayDanhSach = [30, 45, 50, 70, 200];
	let phutGoc = 0;
	for (const giay of giayDanhSach) {
		await capNhat(
			P1,
			krP1.id,
			new Date(gioGoc.getTime() + phutGoc * 60000),
			giay,
		);
		phutGoc += 5;
	}
	await okrCapNhat.moCapNhat(
		P1,
		{ entry: "tab" },
		new Date(gioGoc.getTime() + phutGoc * 60000),
	);
	phutGoc += 5;
	const gioBatDau = gioGoc;
	const gioKetThuc = new Date(gioGoc.getTime() + phutGoc * 60000);

	await db.zaloLink.create({
		data: {
			crmUserId: B1,
			zaloUserId: id("-zalo-b1"),
			zaloDisplayName: "B1",
		},
	});
	await db.zaloLink.create({
		data: {
			crmUserId: B2,
			zaloUserId: id("-zalo-b2"),
			zaloDisplayName: "B2",
		},
	});

	await db.agentTask.create({
		data: {
			id: id("-task-b1"),
			kind: "nhac-ke-hoach",
			reason: "nhac buoi sang",
			subject: `user:${B1}:${tuan1}`,
			dueAt: gioTuan1,
			finishedAt: gioTuan1,
			outcome: "da-gui:1",
			payload: nhacPayload.parse({
				muc: [{ loai: "okr-cap-nhat", krIds: [krB1.id] }],
				daGui: [{ loai: "okr-cap-nhat", krIds: [krB1.id] }],
				kenh: "zalo",
				lechKenh: false,
			}),
		},
	});
	await db.agentTask.create({
		data: {
			id: id("-task-b2"),
			kind: "nhac-ke-hoach",
			reason: "nhac buoi sang",
			subject: `user:${B2}:${tuan1}`,
			dueAt: gioTuan1,
			finishedAt: gioTuan1,
			outcome: "khong-khop",
			payload: nhacPayload.parse({
				muc: [{ loai: "okr-cap-nhat", krIds: [krB2.id] }],
			}),
		},
	});

	return {
		phongBanP: deptP.id,
		phongBanQ: deptQ.id,
		tuan1,
		tuan2,
		tuan3,
		gioBatDau,
		gioKetThuc,
		ngayNhac: tuan1,
		b2: B2,
	};
}

async function chayVaKiemTraXanh(client, ctx) {
	const tyLeSql = readFileSync(
		join(RANG_DIR, "ty-le-cap-nhat-tuan.sql"),
		"utf8",
	);
	const trungViSql = readFileSync(join(RANG_DIR, "trung-vi-giay.sql"), "utf8");
	const kenhSql = readFileSync(
		join(RANG_DIR, "nguoi-noi-kenh-nhan-tin.sql"),
		"utf8",
	);

	const kyVong = {
		[ctx.tuan1]: { P: 5, Q: 2 },
		[ctx.tuan2]: { P: 4, Q: 5 },
		[ctx.tuan3]: { P: 5, Q: 3 },
	};

	const hong = [];
	for (const tuan of [ctx.tuan1, ctx.tuan2, ctx.tuan3]) {
		const res = await client.query(tyLeSql, [tuan]);
		const hang = {};
		for (const r of res.rows) {
			hang[r.phong_ban] = { mau: Number(r.mau_so), tu: Number(r.tu_so) };
		}
		const p = hang[ctx.phongBanP];
		const q = hang[ctx.phongBanQ];
		console.log(
			`ty-le tuan ${tuan}: P=${p?.tu}/${p?.mau} Q=${q?.tu}/${q?.mau}`,
		);
		if (!p || p.mau !== 5 || p.tu !== kyVong[tuan].P) {
			hong.push(
				`ty-le P tuan ${tuan}: ${JSON.stringify(p)} != mau 5 tu ${kyVong[tuan].P}`,
			);
		}
		if (!q || q.mau !== 5 || q.tu !== kyVong[tuan].Q) {
			hong.push(
				`ty-le Q tuan ${tuan}: ${JSON.stringify(q)} != mau 5 tu ${kyVong[tuan].Q}`,
			);
		}
	}

	const trungViRes = await client.query(trungViSql, [
		ctx.gioBatDau.toISOString(),
		ctx.gioKetThuc.toISOString(),
	]);
	const trungVi = Number(trungViRes.rows[0]?.trung_vi);
	console.log(`trung vi giay: ${trungVi}`);
	if (!Number.isFinite(trungVi) || Math.abs(trungVi - 50) > 1e-9) {
		hong.push(`trung-vi: ${trungVi} != 50`);
	}

	const kenhRes = await client.query(kenhSql, [ctx.ngayNhac]);
	const kenhIds = kenhRes.rows.map((r) => r.id).sort();
	console.log(
		`nguoi noi kenh chua nhan tin: ${kenhIds.join(", ") || "(rong)"}`,
	);
	if (kenhIds.length !== 1 || kenhIds[0] !== ctx.b2) {
		hong.push(`nguoi-noi-kenh: ${JSON.stringify(kenhIds)} != [${ctx.b2}]`);
	}

	return hong;
}

const SQL_DOT_BIEN_DEM_DONG = `SELECT
	COALESCE(op."primaryDepartmentId", 'chua-xep') AS phong_ban,
	COUNT(DISTINCT k.id) AS mau_so,
	COUNT(c.id) AS tu_so
FROM "okrKeyResult" k
JOIN "okrObjective" o ON o.id = k."objectiveId"
JOIN "okrCycle" cy ON cy.id = o."cycleId"
LEFT JOIN "orgPlacement" op ON op."userId" = k."ownerUserId"
LEFT JOIN "okrCheckIn" c ON c."keyResultId" = k.id AND c."weekStart" = $1::date
WHERE o.status = 'cong-bo'
	AND cy.phase = 'dang-chay'
	AND o."publishedAt" < ($1::date + INTERVAL '7 day')
GROUP BY 1
ORDER BY 1;
`;

const SQL_DOT_BIEN_BO_PHA = `SELECT
	COALESCE(op."primaryDepartmentId", 'chua-xep') AS phong_ban,
	COUNT(DISTINCT k.id) AS mau_so,
	COUNT(DISTINCT k.id) FILTER (
		WHERE EXISTS (
			SELECT 1 FROM "okrCheckIn" c
			WHERE c."keyResultId" = k.id AND c."weekStart" = $1::date
		)
	) AS tu_so
FROM "okrKeyResult" k
JOIN "okrObjective" o ON o.id = k."objectiveId"
JOIN "okrCycle" cy ON cy.id = o."cycleId"
LEFT JOIN "orgPlacement" op ON op."userId" = k."ownerUserId"
WHERE o.status = 'cong-bo'
	AND o."publishedAt" < ($1::date + INTERVAL '7 day')
GROUP BY 1
ORDER BY 1;
`;

const SQL_DOT_BIEN_BO_CONG_BO = `SELECT
	COALESCE(op."primaryDepartmentId", 'chua-xep') AS phong_ban,
	COUNT(DISTINCT k.id) AS mau_so,
	COUNT(DISTINCT k.id) FILTER (
		WHERE EXISTS (
			SELECT 1 FROM "okrCheckIn" c
			WHERE c."keyResultId" = k.id AND c."weekStart" = $1::date
		)
	) AS tu_so
FROM "okrKeyResult" k
JOIN "okrObjective" o ON o.id = k."objectiveId"
JOIN "okrCycle" cy ON cy.id = o."cycleId"
LEFT JOIN "orgPlacement" op ON op."userId" = k."ownerUserId"
WHERE cy.phase = 'dang-chay'
	AND o."publishedAt" < ($1::date + INTERVAL '7 day')
GROUP BY 1
ORDER BY 1;
`;

const SQL_DOT_BIEN_TRUNG_VI = `SELECT
	percentile_cont(0.5) WITHIN GROUP (ORDER BY COALESCE(seconds, 0)) AS trung_vi
FROM "okrCheckInSession"
WHERE "openedAt" >= $1::timestamptz
	AND "openedAt" < $2::timestamptz;
`;

const SQL_DOT_BIEN_KENH = `SELECT u.id
FROM "user" u
WHERE EXISTS (
	SELECT 1 FROM "okrKeyResult" k
	JOIN "okrObjective" o ON o.id = k."objectiveId"
	JOIN "okrCycle" cy ON cy.id = o."cycleId"
	WHERE k."ownerUserId" = u.id AND o.status = 'cong-bo' AND cy.phase = 'dang-chay'
)
AND NOT EXISTS (
	SELECT 1 FROM "agentTask" a
	WHERE a.kind = 'nhac-ke-hoach'
		AND a.subject = 'user:' || u.id || ':' || $1::text
		AND a.outcome LIKE 'da-gui%'
		AND a.payload -> 'daGui' @> '[{"loai":"okr-cap-nhat"}]'
)
ORDER BY u.id;
`;

async function chayChieuDo(client, ctx) {
	const tam = mkdtempSync(join(tmpdir(), "cnt-chieu-do-"));
	const dotBienDs = [
		{
			ten: "dem-dong-thay-kr-khac-nhau",
			noiDung: SQL_DOT_BIEN_DEM_DONG,
			nhan: "ty-le lech P tuan 1",
			kiemTra: async (sql) => {
				const res = await client.query(sql, [ctx.tuan1]);
				const p = res.rows.find((r) => r.phong_ban === ctx.phongBanP);
				return !p || Number(p.tu_so) !== 5;
			},
		},
		{
			ten: "bo-loc-pha-chu-ky",
			noiDung: SQL_DOT_BIEN_BO_PHA,
			nhan: "ty-le lech",
			kiemTra: async (sql) => {
				const res = await client.query(sql, [ctx.tuan1]);
				const p = res.rows.find((r) => r.phong_ban === ctx.phongBanP);
				return !p || Number(p.mau_so) !== 5;
			},
		},
		{
			ten: "bo-loc-cong-bo",
			noiDung: SQL_DOT_BIEN_BO_CONG_BO,
			nhan: "ty-le lech",
			kiemTra: async (sql) => {
				const res = await client.query(sql, [ctx.tuan1]);
				const p = res.rows.find((r) => r.phong_ban === ctx.phongBanP);
				return !p || Number(p.mau_so) !== 5;
			},
		},
		{
			ten: "trung-vi-tinh-ca-phien-chua-gui",
			noiDung: SQL_DOT_BIEN_TRUNG_VI,
			nhan: "trung-vi lech",
			kiemTra: async (sql) => {
				const res = await client.query(sql, [
					ctx.gioBatDau.toISOString(),
					ctx.gioKetThuc.toISOString(),
				]);
				const tv = Number(res.rows[0]?.trung_vi);
				return !Number.isFinite(tv) || Math.abs(tv - 50) > 1e-9;
			},
		},
		{
			ten: "dem-ca-nguoi-chua-noi-kenh",
			noiDung: SQL_DOT_BIEN_KENH,
			nhan: "nguoi-noi-kenh lech",
			kiemTra: async (sql) => {
				const res = await client.query(sql, [ctx.ngayNhac]);
				const ids = res.rows.map((r) => r.id).sort();
				return !(ids.length === 1 && ids[0] === ctx.b2);
			},
		},
	];

	let bat = 0;
	try {
		for (const d of dotBienDs) {
			const duong = join(tam, `${d.ten}.sql`);
			writeFileSync(duong, d.noiDung);
			const sql = readFileSync(duong, "utf8");
			const viPham = await d.kiemTra(sql);
			if (viPham) bat += 1;
			console.log(`${d.ten}: ${viPham ? d.nhan : "KHONG BAT"}`);
		}
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}

	return bat === dotBienDs.length ? 1 : 0;
}

async function main() {
	const chieuDo = process.argv.includes("--chieu-do");
	const goc = urlGoc();
	if (!goc) {
		console.log("KHONG DO DUOC: khong doc duoc DATABASE_URL o .env goc");
		process.exit(2);
	}
	const ten = `crm_cnt_${randomBytes(4).toString("hex")}`;
	const url = urlTam(ten, goc);

	const { withMaintenance, dropDatabase } = await import(
		join(DB_GOI, "scripts/test-db-admin.ts")
	);

	let maThoat = 0;
	try {
		try {
			await withMaintenance(goc, async (c) => {
				await dropDatabase(c, ten);
				await c.query(`CREATE DATABASE "${ten}"`);
			});
		} catch (e) {
			console.log(
				`KHONG DO DUOC: khong tao duoc co so du lieu tam: ${e?.message ?? e}`,
			);
			maThoat = 2;
		}

		if (maThoat === 0) {
			const rMig = chayMigrate(url);
			if (rMig.status !== 0) {
				console.log(
					`KHONG DO DUOC: migrate deploy hong\n${rMig.stdout}\n${rMig.stderr}`,
				);
				maThoat = 2;
			} else {
				process.env.DATABASE_URL = url;
				const mods = await napModule();
				const ctx = await gieo(mods);

				const client = new pg.Client({ connectionString: url });
				await client.connect();
				try {
					if (!chieuDo) {
						const hong = await chayVaKiemTraXanh(client, ctx);
						for (const h of hong) console.log(`HONG ${h}`);
						maThoat = hong.length === 0 ? 0 : 1;
					} else {
						maThoat = await chayChieuDo(client, ctx);
					}
				} finally {
					await client.end();
				}
			}
		}
	} finally {
		await withMaintenance(goc, (c) => dropDatabase(c, ten));
	}

	process.exit(maThoat);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
