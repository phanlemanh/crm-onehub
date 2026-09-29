import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const GOC = join(THU_MUC, "..", "..", "..");
const TEP_SQL = join(THU_MUC, "ty-le-canh-kr.sql");
const THAM_SO = "okr.chu_ky";
const MONG = {
	mucTieu: 10,
	coViecHaySangKien: 5,
	mocXong: 5,
	mocCoBangChung: 3,
	phongBanCoGhiNhan: 3,
	phongBanTong: 10,
	ghiNhanTong: 7,
	mucTieuPhongBan: 8,
	tuMauPhongBan: 2,
	viecXong: 4,
	viecTong: 7,
	sangKienKeHoach: 1,
	sangKienTong: 2,
};
const COT = Object.keys(MONG);
const GHIM_NHAP = "coViecHaySangKien: nhận 6, mong 5";
const GHIM_TU_MAU = "tuMauPhongBan: nhận 4, mong 2";
const GHIM_CHI_DOC = "câu SQL không chỉ SELECT hay SET";
const MO_DAU_DUOC = new Set(["SELECT", "WITH", "SET"]);
const SET_DUOC = /^SET\s+(LOCAL\s+)?okr\.\w+\s*(=|TO)\s*'[^']*'$/i;
const CAM_GHI =
	/\b(INSERT|UPDATE|DELETE|MERGE|UPSERT|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|CALL|LOCK|VACUUM|COMMENT|REFRESH|RESET|DO|EXECUTE|PREPARE|LISTEN|NOTIFY|SET_CONFIG)\b/i;
const LOC_NHAP = {
	tu: /(muc_tieu AS \([\s\S]*?)AND o\.status = 'cong-bo'/,
	sang: "$1AND o.status IN ('cong-bo', 'nhap')",
};
const LOC_TU_MAU = {
	tu: /(tu_mau AS \([\s\S]*?)\s+AND o\.status = 'cong-bo'\s+AND o\.level = 'phong-ban'/,
	sang: "$1",
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
const chiDoc = kiemChiDoc(sql);
if (chiDoc.length > 0) thoat(1, chiDoc.map((h) => `HONG ${h}`).join("\n"));
console.log(
	`ty-le-canh-kr.sql chi SELECT/SET: dat (${tachCau(sql).length} cau, ${sql.split("\n").length} dong)`,
);
const banSao = {
	nhap: sql.replace(LOC_NHAP.tu, LOC_NHAP.sang),
	tuMau: sql.replace(LOC_TU_MAU.tu, LOC_TU_MAU.sang),
	ghi: `${sql.trimEnd()}\nUPDATE "okrViecKr" SET "xongLuc" = now();\n`,
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
const { gieoThanhVien, mintPhien } = await import(
	join(GOC, "apps/api/test/phien-thu.ts")
);

const TIEN_TO = `tl-${Date.now().toString(36)}`;
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
	const [pb, bp, ky] = await Promise.all([
		db.department.count(),
		db.division.count(),
		db.okrCycle.count(),
	]);
	if (pb + bp + ky > 0)
		thoat(
			2,
			`KHONG DO DUOC: kho do khong sach — ${pb} phong ban, ${bp} bo phan, ${ky} chu ky co san; phongBanTong va chu ky can kho chi co fixture`,
		);
}

async function gieo() {
	const qt = ma("qt");
	const y = ma("y");
	const z = ma("z");
	await gieoThanhVien(qt, "admin");
	await gieoThanhVien(y, "member");
	await gieoThanhVien(z, "member");
	const c = (await mintPhien(qt)).cookie;

	const B = (await goi(c, "org.createDivision", { name: ma("B") })).id;
	await goi(c, "org.setHead", { kind: "division", id: B, userId: qt });
	const D = [];
	for (let i = 1; i <= 11; i += 1)
		D.push(
			(
				await goi(c, "org.createDepartment", {
					name: ma(`D${i}`),
					divisionId: B,
				})
			).id,
		);
	await goi(c, "org.archiveDepartment", { id: D[10] });

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

	const mucTieu = async (unit) =>
		(
			await goi(c, "okr.createObjective", {
				cycleId: C,
				unit,
				title: ma("muc-tieu"),
				kind: "cam-ket",
				ownerUserId: qt,
				participantIds: [],
				whyNow: "",
			})
		).id;
	const kr = async (objectiveId, loai, xong = false) =>
		(
			await goi(c, "okr.createKeyResult", {
				objectiveId,
				title: ma("kr"),
				kind: loai,
				ownerUserId: qt,
				startValue: 0,
				targetValue: loai === "moc" ? 1 : 10,
				currentValue: xong ? 1 : 0,
				unit: "",
				dueOn: null,
				weight: 1,
			})
		).id;
	const bangChung = (keyResultId) =>
		goi(c, "okr.themBangChung", {
			keyResultId,
			url: `https://drive.google.com/${ma("bc")}`,
			ghiChu: "",
		});
	const viec = async (keyResultId, xong) => {
		const { id } = await goi(c, "okr.themViec", {
			keyResultId,
			tieuDe: ma("viec"),
			nguoiLamUserId: y,
			hanNgay: null,
		});
		if (xong) await goi(c, "okr.danhDauViec", { id, xong: true });
	};
	const pb = (i) => ({ level: "phong-ban", departmentId: D[i - 1] });
	const congBo = (id) => goi(c, "okr.publishObjective", { id });

	const O = {};
	for (const i of [1, 2, 3, 4, 5, 6]) O[i] = await mucTieu(pb(i));
	O[10] = await mucTieu({ level: "onehub" });
	const K = {};
	for (const i of [1, 2, 3, 4, 5, 10]) K[i] = await kr(O[i], "tang-toi");
	const M = {
		1: await kr(O[6], "moc", true),
		2: await kr(O[6], "moc", true),
		3: await kr(O[6], "moc", true),
		4: await kr(O[1], "moc", true),
		5: await kr(O[2], "moc", true),
		6: await kr(O[2], "moc", true),
		7: await kr(O[3], "moc", true),
	};
	for (const m of [1, 2, 3, 6, 7]) await bangChung(M[m]);

	const tpb = await goi(c, "okr.luuMau", {
		id: null,
		ten: ma("mau-pb"),
		cap: "phong-ban",
		donViIds: [D[6], D[7], D[9]],
		noiDung: {
			cauMucTieu: "Mục tiêu phòng ban từ mẫu",
			loai: "cam-ket",
			krs: [
				{
					title: "KR mẫu phòng ban",
					kind: "tang-toi",
					unit: "",
					startValue: null,
					targetValue: null,
				},
			],
		},
	});
	const tbp = await goi(c, "okr.luuMau", {
		id: null,
		ten: ma("mau-bp"),
		cap: "bo-phan",
		donViIds: [],
		noiDung: {
			cauMucTieu: "Mục tiêu bộ phận từ mẫu",
			loai: "cam-ket",
			krs: [
				{
					title: "KR mẫu bộ phận",
					kind: "tang-toi",
					unit: "",
					startValue: null,
					targetValue: null,
				},
			],
		},
	});
	const tuMau = async (mauId, unit) =>
		(
			await goi(c, "okr.taoTuMau", {
				mauId,
				cycleId: C,
				unit,
				ownerUserId: qt,
				krs: [{ startValue: 0, targetValue: 10, ownerUserId: qt }],
			})
		).id;
	O[7] = await tuMau(tpb.id, pb(7));
	O[8] = await tuMau(tpb.id, pb(8));
	O[9] = await tuMau(tbp.id, { level: "bo-phan", divisionId: B });
	const N2 = await tuMau(tpb.id, pb(10));
	const N1 = await mucTieu(pb(9));
	const KN1 = await kr(N1, "tang-toi");

	for (let i = 1; i <= 10; i += 1) await congBo(O[i]);

	await viec(K[1], true);
	await viec(K[1], false);
	await viec(K[2], true);
	await viec(K[2], false);
	await viec(K[3], true);
	await viec(K[3], false);
	await viec(K[4], true);
	await viec(KN1, false);

	const view = await goi(c, "savedViews.create", {
		entity: "CONTACT",
		name: ma("goc-nhin"),
		shared: false,
		filters: { q: "", sort: "", dir: "asc", archived: false, filters: {} },
	});
	const cd = await goi(c, "campaigns.create", {
		name: ma("chien-dich"),
		savedViewId: view.id,
		ownerId: qt,
	});
	await goi(c, "okr.ganSangKien", {
		keyResultId: K[1],
		loai: "chien-dich",
		banGhiId: cd.id,
	});
	const cty = await goi(c, "companies.create", { name: ma("cong-ty") });
	const khuon = await goi(c, "onboarding.createTemplate", {
		name: ma("khuon"),
		partnerType: null,
		steps: [
			{ label: "Gọi chào", departmentId: D[0], position: 0, offsetDays: 0 },
		],
	});
	const kh = await goi(c, "onboarding.createFromTemplate", {
		companyId: cty.id,
		templateId: khuon.id,
		startedAt: HOM_NAY,
		ownerId: qt,
	});
	await goi(c, "okr.ganSangKien", {
		keyResultId: K[5],
		loai: "ke-hoach",
		banGhiId: kh.id,
	});

	const phien = await goi(c, "okr.moCapNhat", { entry: "sheet" });
	await goi(c, "okr.guiCapNhat", {
		sessionId: phien.sessionId,
		items: [M[6], M[7]].map((keyResultId) => ({
			keyResultId,
			value: 0,
			confidence: "vua",
			note: "",
		})),
	});

	const gn = (objectiveId, nguoiNhan) =>
		goi(c, "okr.guiGhiNhan", {
			objectiveId,
			keyResultId: null,
			nguoiNhan,
			loiNhan: `Cảm ơn ${ma("gn")}`,
		});
	for (const [o, n] of [
		[O[1], [y]],
		[O[1], [z]],
		[O[1], [y, z]],
		[O[2], [y]],
		[O[2], [z]],
		[O[6], [y]],
		[O[6], [y, z]],
	])
		await gn(o, n);

	console.log(
		`gieo: chu ky C ${C} (${ngay(NAM, QUY * 3 - 2, 1)}..${ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3))}), 11 phong ban (1 luu tru), 10 muc tieu cong bo + nhap N1 ${N1} (co viec) + nhap tu mau N2 ${N2}`,
	);
	return C;
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

async function motBanSao(C, ten, cau, ghim) {
	const ra = await chay(cau, C);
	inRa(`ban sao ${ten}`, ra);
	const hong = kiem(ra, MONG);
	for (const h of hong) console.log(`  HONG ${h}`);
	const bat = hong.includes(ghim);
	console.log(`  ${bat ? "bat" : "LOT"}: ${ghim}`);
	return bat;
}

try {
	await tienDe();
	const C = await gieo();
	console.log(
		`psql: SET ${THAM_SO} = '<cycleId>'; \\i ty-le-canh-kr.sql — lan do nay: ${THAM_SO} = '${C}'`,
	);
	inRa("mong", MONG);
	const goc = await chay(sql, C);
	inRa("ty-le-canh-kr.sql", goc);
	if (!chieuDo) {
		const hong = kiem(goc, MONG);
		for (const h of hong) console.log(`HONG ${h}`);
		console.log(`toEqual: ${hong.length === 0 ? "dat" : "HONG"}`);
		process.exitCode = hong.length === 0 ? 0 : 1;
	} else {
		let bat = 0;
		if (await motBanSao(C, "tinh ca muc tieu nhap", banSao.nhap, GHIM_NHAP))
			bat += 1;
		if (
			await motBanSao(
				C,
				"tinh tuMau moi cap va ca nhap",
				banSao.tuMau,
				GHIM_TU_MAU,
			)
		)
			bat += 1;
		const hongGhi = kiemChiDoc(banSao.ghi);
		for (const h of hongGhi) console.log(`  HONG ${h}`);
		const tuChoi = hongGhi.some((h) => h.startsWith(GHIM_CHI_DOC));
		if (tuChoi) bat += 1;
		console.log(
			`  ${tuChoi ? "bat" : "LOT"}: ban sao them UPDATE — ${GHIM_CHI_DOC}`,
		);
		console.log(`chieu do: ${bat}/3 ban sao bi bat`);
		process.exitCode = bat === 3 ? 1 : 0;
	}
	console.log("kho do bo khi phien dong — khong don tay");
} finally {
	await db.$disconnect();
}
