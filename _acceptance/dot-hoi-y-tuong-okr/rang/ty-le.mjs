import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const THU_MUC = dirname(TEP_NAY);
const GOC = join(THU_MUC, "..", "..", "..");
const THU_MUC_API = join(GOC, "apps", "api");
const TEP_SQL = join(THU_MUC, "ty-le-hoi-y.sql");
const THAM_SO = { hoiY: "okr.hoi_y", hoiYTruoc: "okr.hoi_y_truoc" };
const MONG = {
	thanhVien: 20,
	gop: 15,
	hieu7: 9,
	doi: 1,
	them: 1,
	gopTruoc: 9,
	gopLai: 8,
	soY: 30,
	soYLa: 1,
	chuDeChon: 3,
	chuDeDeSau: 1,
	chuDeDaCo: 1,
	chuDeKhongLam: 1,
	soDongY: 12,
};
const COT = Object.keys(MONG);
const GHIM_NGUOI_CHON = "thanhVien: nhận 21, mong 20";
const GHIM_BIEN_DONG = "hieu7: nhận 10, mong 9";
const GHIM_DA_ROI = "gopTruoc: nhận 10, mong 9";
const GHIM_CHI_DOC = "câu SQL không chỉ SELECT hay SET";
const MO_DAU_DUOC = new Set(["SELECT", "WITH", "SET"]);
const SET_DUOC = /^SET\s+(LOCAL\s+)?okr\.\w+\s*(=|TO)\s*'[^']*'$/i;
const CAM_GHI =
	/\b(INSERT|UPDATE|DELETE|MERGE|UPSERT|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|CALL|LOCK|VACUUM|COMMENT|REFRESH|RESET|DO|EXECUTE|PREPARE|LISTEN|NOTIFY|SET_CONFIG)\b/i;
const CAM = {
	nguoiChon: {
		tu: /(thanh_vien AS \([\s\S]*?)\s+WHERE m\."userId" <> l\.nguoi_chon/,
		sang: "$1",
	},
	bienDong: {
		tu: "AND u.luc < l.cong_bo_luc + interval '7 days'",
		sang: "AND u.luc <= l.cong_bo_luc + interval '7 days'",
	},
	daRoi: {
		tu: /(gop_truoc AS \([\s\S]*?)\s+JOIN thanh_vien v ON v\.user_id = y\."tacGiaUserId"/,
		sang: "$1",
	},
};

const MOC_GIO = new Date("2026-11-02T03:00:00.000Z");
const GIO_MS = 60 * 60 * 1000;
const NGAY_MS = 24 * GIO_MS;
const GIEO = {
	thanhVien: MONG.thanhVien,
	coSanToiDa: 4,
	h1: { moSauGio: 0, hanSauMoGio: 48, gopSauMoGio: 1 },
	h2: {
		moSauGio: 72,
		hanSauMoGio: 48,
		niemPhongSauMoGio: 0.5,
		gopSauMoGio: 2,
		dongYSauMoGio: 30,
		gomSauHanGio: 1,
		ketLuanSauHanGio: 2,
		congBoSauHanGio: 3,
	},
	soGopH2: 15,
	soYMoiNguoi: 2,
	soDongY: 12,
	chiaChuDe: [6, 6, 6, 6, 5],
	hieu: {
		trongCua: 8,
		sauCuaMs: 7 * NGAY_MS,
		truMs: 1000,
		muonMs: 8 * NGAY_MS,
	},
	chuongTrinh: {
		objectiveCap: 50,
		krCap: 50,
		capMode: "canh-bao",
		scoreScale: "0-100",
		weightsOn: false,
		personalOn: true,
	},
};
const BAN_TRUOC = [
	"Đưa giao hàng lạnh thành mảng có lãi ở cả hai miền",
	"Mở thêm hai kho trung chuyển ở miền Trung",
	"Rút thời gian giao chặng cuối xuống dưới một ngày",
	"Giữ tỉ lệ khách quay lại trên bảy mươi phần trăm",
];
const LY_DO = "Chủ đề này có nhiều người nêu nhất và làm được ngay trong kỳ.";

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
	for (const ten of Object.values(THAM_SO))
		if (!sql.includes(`current_setting('${ten}'`))
			hong.push(`câu SQL không đọc tham số ${ten}`);
	return hong;
}

if (realpathSync(process.cwd()) !== realpathSync(THU_MUC_API)) {
	const con = spawnSync("bun", [TEP_NAY, ...process.argv.slice(2)], {
		cwd: THU_MUC_API,
		env: process.env,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	const loc = (s) =>
		(s ?? "")
			.split("\n")
			.filter((d) => !d.includes("[Nest]"))
			.join("\n");
	process.stdout.write(loc(con.stdout));
	process.stderr.write(loc(con.stderr));
	process.exit(con.status ?? 2);
}

const chieuDo = process.argv.includes("--chieu-do");
const sql = readFileSync(TEP_SQL, "utf8");
const chiDoc = kiemChiDoc(sql);
if (chiDoc.length > 0) thoat(1, chiDoc.map((h) => `HONG ${h}`).join("\n"));
console.log(
	`ty-le-hoi-y.sql chi SELECT/SET: dat (${tachCau(sql).length} cau, ${sql.split("\n").length} dong)`,
);
const banSao = {
	nguoiChon: sql.replace(CAM.nguoiChon.tu, CAM.nguoiChon.sang),
	bienDong: sql.replace(CAM.bienDong.tu, CAM.bienDong.sang),
	daRoi: sql.replace(CAM.daRoi.tu, CAM.daRoi.sang),
	ghi: `${sql.trimEnd()}\nUPDATE "okrHoiYHieu" SET luc = now();\n`,
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
if (kho === null || !isMeasureDatabase(kho) || process.env.PHIEN_DO !== kho)
	thoat(
		2,
		`KHONG DO DUOC: cần một phiên đo (kho _do và PHIEN_DO của chính phiên) — kho "${kho}", PHIEN_DO "${process.env.PHIEN_DO ?? ""}". Chạy qua scripts/lan-do/tien-de.mjs`,
	);
console.log(`kho: ${kho} · API dựng trong tiến trình với đồng hồ tiêm`);

const yeu = createRequire(join(THU_MUC_API, "package.json"));
const { Test } = yeu("@nestjs/testing");
const request = yeu("supertest");
const { db } = await import(join(GOC, "packages/db/src/client.ts"));
const { gieoThanhVien, mintPhien } = await import(
	join(THU_MUC_API, "test/phien-thu.ts")
);
const { DONG_HO_HOI_Y } = await import(join(THU_MUC_API, "src/okr/dong-ho.ts"));
const { AppModule } = await import(join(THU_MUC_API, "src/app.module.ts"));

let bayGio = MOC_GIO;
const datGio = (d) => {
	bayGio = d;
};
const sau = (tu, ms) => new Date(tu.getTime() + ms);
const sauGio = (tu, gio) => sau(tu, gio * GIO_MS);

const TIEN_TO = `tlhy-${Date.now().toString(36)}`;
let dem = 0;
const ma = (phan) => {
	dem += 1;
	return `${TIEN_TO}-${phan}-${dem}`;
};

let app = null;

async function goi(cookie, thuTuc, vao) {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(vao));
	if (res.status !== 200)
		throw new Error(
			`KHONG DO DUOC: ${thuTuc} trả HTTP ${res.status} ${res.body?.error?.message ?? ""} (đồng hồ tiêm ${bayGio.toISOString()})`,
		);
	return res.body?.result?.data;
}

async function tienDe() {
	const coSan = (
		await db.member.findMany({ distinct: ["userId"], select: { userId: true } })
	).length;
	const canGieo = GIEO.thanhVien - coSan;
	if (coSan > GIEO.coSanToiDa)
		thoat(
			2,
			`KHONG DO DUOC: kho do co san ${coSan} thanh vien (toi da ${GIEO.coSanToiDa}) — mau so ${GIEO.thanhVien} can kho gan sach`,
		);
	const ky = await db.okrHoiY.count();
	if (ky > 0)
		thoat(
			2,
			`KHONG DO DUOC: kho do da co ${ky} lan hoi y truoc khi gieo — can kho sach`,
		);
	return { coSan, canGieo };
}

async function nguoi(ten, vai) {
	const id = ma(ten);
	await gieoThanhVien(id, vai);
	return { id, cookie: (await mintPhien(id)).cookie };
}

async function gieo({ coSan, canGieo }) {
	const P = await nguoi("P", "admin");
	const R = await nguoi("R", "member");
	const M = [];
	for (let i = 0; i < canGieo; i += 1) M.push(await nguoi(`M${i}`, "member"));
	console.log(
		`gieo nguoi: ${coSan} thanh vien co san + ${canGieo} thanh vien moi + nguoi chon P + R (roi truoc H2)`,
	);
	await goi(P.cookie, "okr.setProgram", GIEO.chuongTrinh);

	const namKe = MOC_GIO.getUTCFullYear() + 1;
	const nam = (
		await goi(P.cookie, "okr.createCycle", {
			kind: "nam",
			name: ma("nam"),
			parentId: null,
			startsOn: `${namKe}-01-01`,
			endsOn: `${namKe}-12-31`,
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		})
	).id;
	const quy = (
		await goi(P.cookie, "okr.createCycle", {
			kind: "quy",
			name: ma("quy"),
			parentId: nam,
			startsOn: `${namKe}-01-01`,
			endsOn: `${namKe}-03-31`,
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		})
	).id;

	const moLan = async (cycleId, moLuc, hanGio) => {
		datGio(moLuc);
		return (
			await goi(P.cookie, "okr.moHoiY", {
				cycleId,
				cauHoi: `Nếu là CEO, mục tiêu nào quan trọng cho kỳ ${cycleId.slice(-6)}?`,
				loiMo: "Mỗi người góp tối đa ba ý.",
				soLieu: [{ nhan: "Doanh thu năm", giaTri: "186 tỷ", ghiChu: "" }],
				hanLuc: sauGio(moLuc, hanGio).toISOString(),
				nguoiChonUserId: P.id,
			})
		).id;
	};
	const gopY = (n, hoiYId, noiDung) =>
		goi(n.cookie, "okr.gopY", { hoiYId, noiDung, viSao: "", doBangGi: "" });

	const moH1 = sauGio(MOC_GIO, GIEO.h1.moSauGio);
	const H1 = await moLan(quy, moH1, GIEO.h1.hanSauMoGio);
	const gopH1 = [...M.slice(0, 8), M[GIEO.soGopH2], R];
	for (const [i, n] of gopH1.entries()) {
		datGio(sauGio(moH1, GIEO.h1.gopSauMoGio + i));
		await gopY(n, H1, `Ý quý số ${i + 1} của lần hỏi ý trước`);
	}

	const memberR = await db.member.findFirstOrThrow({
		where: { userId: R.id },
		select: { id: true },
	});
	await goi(P.cookie, "workspace.removeMember", { memberId: memberR.id });

	const moH2 = sauGio(MOC_GIO, GIEO.h2.moSauGio);
	const H2 = await moLan(nam, moH2, GIEO.h2.hanSauMoGio);
	datGio(sauGio(moH2, GIEO.h2.niemPhongSauMoGio));
	await goi(P.cookie, "okr.niemPhong", { hoiYId: H2, cau: BAN_TRUOC });
	const gopH2 = M.slice(0, GIEO.soGopH2);
	const y = [];
	let buoc = 0;
	for (const [i, n] of gopH2.entries())
		for (let k = 0; k < GIEO.soYMoiNguoi; k += 1) {
			datGio(sauGio(moH2, GIEO.h2.gopSauMoGio + buoc / 2));
			buoc += 1;
			y.push({
				tacGia: i,
				id: (await gopY(n, H2, `Ý năm số ${i + 1}.${k + 1} cho lần này`)).id,
			});
		}
	for (let i = 0; i < GIEO.soDongY; i += 1) {
		datGio(sauGio(moH2, GIEO.h2.dongYSauMoGio + i / 4));
		const cua = y.find((x) => x.tacGia === (i + 1) % GIEO.soGopH2);
		await goi(M[i].cookie, "okr.dongY", { yId: cua.id, bat: true });
	}

	const hanH2 = sauGio(moH2, GIEO.h2.hanSauMoGio);
	datGio(sauGio(hanH2, GIEO.h2.gomSauHanGio));
	const chuDe = [];
	let dau = 0;
	for (const [i, so] of GIEO.chiaChuDe.entries()) {
		const id = (
			await goi(P.cookie, "okr.taoChuDe", {
				hoiYId: H2,
				ten: `Chủ đề ${String.fromCharCode(65 + i)}`,
			})
		).id;
		await goi(P.cookie, "okr.ganY", {
			yIds: y.slice(dau, dau + so).map((x) => x.id),
			chuDeId: id,
		});
		chuDe.push(id);
		dau += so;
	}
	await goi(P.cookie, "okr.ganY", { yIds: [y[dau].id], yLa: true });
	const yLa = await db.okrChuDe.findFirstOrThrow({
		where: { hoiYId: H2, loai: "y-la" },
		select: { id: true },
	});

	datGio(sauGio(hanH2, GIEO.h2.ketLuanSauHanGio));
	const ketLuan = (chuDeId, ketLuan, cauMucTieu, noiBanTruoc) =>
		goi(P.cookie, "okr.ketLuanChuDe", {
			chuDeId,
			ketLuan,
			lyDo: LY_DO,
			cauMucTieu,
			noiBanTruoc,
		});
	await ketLuan(chuDe[0], "chon", BAN_TRUOC[0], "cau-1");
	await ketLuan(
		chuDe[1],
		"chon",
		"Rút thời gian giao chặng cuối xuống dưới mười hai giờ",
		"cau-3",
	);
	await ketLuan(chuDe[2], "chon", "Mở tuyến giao lạnh cho khách dược", "moi");
	await ketLuan(chuDe[3], "de-sau", "", null);
	await ketLuan(chuDe[4], "da-co", "", null);
	await ketLuan(yLa.id, "khong-lam", "", null);

	const congBoLuc = sauGio(hanH2, GIEO.h2.congBoSauHanGio);
	datGio(congBoLuc);
	await goi(P.cookie, "okr.congBo", { hoiYId: H2 });
	const lucHieu = [
		...Array.from({ length: GIEO.hieu.trongCua }, (_, i) =>
			sauGio(congBoLuc, i + 1),
		),
		sau(congBoLuc, GIEO.hieu.sauCuaMs - GIEO.hieu.truMs),
		sau(congBoLuc, GIEO.hieu.sauCuaMs),
		sau(congBoLuc, GIEO.hieu.muonMs),
	];
	for (const [i, luc] of lucHieu.entries()) {
		datGio(luc);
		await goi(M[i].cookie, "okr.hieuViSao", { hoiYId: H2 });
	}
	console.log(
		`gieo: H1 ${H1} (quy ${quy}, 10 nguoi gop gom R), R roi, H2 ${H2} (nam ${nam}, ${gopH2.length} nguoi gop, ${y.length} y, ${GIEO.soDongY} dong y, 4 cau viet truoc, 3 chon, 1 de-sau, 1 da-co, 1 y la khong-lam), cong bo ${congBoLuc.toISOString()}, hieu: 8 trong cua + 1 luc 7x24h-1s + 1 dung 7x24h + 1 sau 8 ngay`,
	);
	return { H1, H2 };
}

async function chay(cau, H) {
	const chon = tachCau(cau).filter((c) => /^(SELECT|WITH)\b/i.test(c.tran));
	const [ra] = await db.$transaction(async (tx) => {
		await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
		await tx.$executeRawUnsafe(
			`SELECT set_config('${THAM_SO.hoiY}', $1, true)`,
			H.H2,
		);
		await tx.$executeRawUnsafe(
			`SELECT set_config('${THAM_SO.hoiYTruoc}', $1, true)`,
			H.H1,
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

async function motBanSao(H, ten, cau, ghim) {
	const ra = await chay(cau, H);
	inRa(`  ban sao ${ten}`, ra);
	const hong = kiem(ra, MONG);
	for (const h of hong) console.log(`    HONG ${h}`);
	const bat = hong.includes(ghim);
	console.log(
		`    ${bat ? "bat — ban sao nay exit 1" : "LOT — ban sao nay exit 0"}: ${ghim}`,
	);
	return bat;
}

try {
	const ct = await tienDe();
	const modul = await Test.createTestingModule({ imports: [AppModule] })
		.overrideProvider(DONG_HO_HOI_Y)
		.useValue(() => new Date(bayGio.getTime()))
		.compile();
	app = modul.createNestApplication({ bodyParser: false, logger: false });
	await app.init();
	const H = await gieo(ct);
	console.log(
		`psql: SET ${THAM_SO.hoiY} = '<H2>'; SET ${THAM_SO.hoiYTruoc} = '<H1>'; \\i ty-le-hoi-y.sql — lan do nay: ${THAM_SO.hoiY} = '${H.H2}', ${THAM_SO.hoiYTruoc} = '${H.H1}'`,
	);
	inRa("mong", MONG);
	const goc = await chay(sql, H);
	inRa("ty-le-hoi-y.sql", goc);
	if (!chieuDo) {
		const hong = kiem(goc, MONG);
		for (const h of hong) console.log(`HONG ${h}`);
		console.log(`toEqual: ${hong.length === 0 ? "dat" : "HONG"}`);
		process.exitCode = hong.length === 0 ? 0 : 1;
	} else {
		let bat = 0;
		if (
			await motBanSao(
				H,
				"dem nguoi chon vao thanhVien",
				banSao.nguoiChon,
				GHIM_NGUOI_CHON,
			)
		)
			bat += 1;
		if (
			await motBanSao(
				H,
				"dem hieu voi bien dong 7 x 24 gio",
				banSao.bienDong,
				GHIM_BIEN_DONG,
			)
		)
			bat += 1;
		if (
			await motBanSao(
				H,
				"khong loc nguoi da roi o gopTruoc",
				banSao.daRoi,
				GHIM_DA_ROI,
			)
		)
			bat += 1;
		const hongGhi = kiemChiDoc(banSao.ghi);
		for (const h of hongGhi) console.log(`    HONG ${h}`);
		const tuChoi = hongGhi.some((h) => h.startsWith(GHIM_CHI_DOC));
		if (tuChoi) bat += 1;
		console.log(
			`  ban sao them UPDATE — ${tuChoi ? "bat, script tu choi truoc khi chay" : "LOT"}: ${GHIM_CHI_DOC}`,
		);
		console.log(`chieu do: ${bat}/4 ban sao bi bat`);
		process.exitCode = bat === 4 ? 1 : 0;
	}
	console.log("kho do bo khi phien dong — khong don tay");
} catch (e) {
	const cau = String(e?.message ?? e);
	console.log(cau.startsWith("KHONG DO DUOC") ? cau : `KHONG DO DUOC: ${cau}`);
	process.exitCode = 2;
} finally {
	await app?.close().catch(() => {});
	await db.$disconnect();
}
process.exit(process.exitCode ?? 0);
