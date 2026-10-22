import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { LO_TRINH } from "../../../apps/app/lib/lo-trinh/cau-hinh.ts";
import { tinHieuMessages } from "../../../apps/app/lib/messages/tin-hieu.ts";
import { dongTuRa } from "../../../apps/app/lib/thong-bao/dong.ts";
import { dungKhoiMau } from "../../../apps/app/test/support/khoi-tin-hieu-mau.ts";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { THONG_BAO } from "../../../packages/validation/src/thong-bao.ts";
import { idTep } from "../../../packages/validation/src/tin-hieu.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	CHROME,
	datTrinhDuyet,
	goiApiTao,
	khongDo,
	NGUOI,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA = (() => {
	const dat =
		process.env.BANG_CHUNG ?? "_acceptance/trang-thai-tin-hieu-song/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const RUN = Date.now().toString(36);
const TIEU = `TTTS-${RUN} Không lọc được danh sách tín hiệu theo phòng ban khi mở trên điện thoại ở khổ hẹp`;
const TEN_NHOM = `TTTS-NHOM-${RUN}`;
const DO = {
	choMs: 120_000,
	nhipDoiMs: 10_000,
	bienMs: 30_000,
	o: [
		["1280", "vi"],
		["1280", "en"],
		["375", "vi"],
		["375", "en"],
	],
};
const MA_TRAN = [
	"truoc-cua-toi",
	"truoc-tat-ca",
	"chuong-trong-mot-nhip",
	"trang-trong-mot-nhip",
	...DO.o.flatMap(([k, l]) => [`chuong-${k}-${l}`, `bam-${k}-${l}`]),
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { user: null };

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${ma}: ${nhan}`);
	if (!dat) sai += 1;
}

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();

function cookieCua(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const c = ra.trim().split("\n").pop().trim();
	const i = c.indexOf("=");
	return { ten: c.slice(0, i), gia: c.slice(i + 1) };
}

async function goi(cookie, duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await khongDo(`KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

async function nguoiGui() {
	const email = `ttts-${RUN}@thu.test`;
	const u = await db.user.create({
		data: {
			id: `ttts-${RUN}`,
			email,
			name: "Người gửi đo",
			emailVerified: true,
		},
		select: { id: true },
	});
	tao.user = u.id;
	await db.member.create({
		data: {
			id: `member-ttts-${RUN}`,
			organizationId: WORKSPACE_ID,
			userId: u.id,
			role: "member",
			createdAt: new Date(),
		},
	});
	return cookieCua(email);
}

async function day(khoa, duLieu, sha) {
	const res = await fetch(
		`${process.env.API_URL ?? "http://localhost:3001"}/rest/lo-trinh/ban-chup`,
		{
			method: "POST",
			headers: { "content-type": "application/json", "x-api-key": khoa },
			body: JSON.stringify({
				nguon: LO_TRINH.nguonCrm,
				sha,
				commitLuc: new Date().toISOString(),
				duLieu,
				canhBao: [],
			}),
		},
	);
	const than = await res.json().catch(() => null);
	if (!res.ok || than?.ketQua !== "nhan")
		await khongDo(
			`KHONG DO DUOC: day ban chup tra ${res.status}: ${JSON.stringify(than)}`,
		);
}

async function trang(cookie, kho, lang) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: lang, domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: Number(kho),
		height: kho === "375" ? 812 : 900,
	});
	return { ctx, p };
}

async function mo(p, url) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: DO.choMs });
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: DO.choMs })
		.catch(() => {});
}

const chuDong = (p, sel) =>
	p.evaluate((s) => {
		const e = document.querySelector(s);
		const hang = e?.closest("tr,[data-slot=item],li") ?? e?.parentElement;
		return hang?.textContent ?? "";
	}, sel);

async function choChu(p, url, sel, chu, tranMs) {
	const batDau = Date.now();
	for (;;) {
		await mo(p, url);
		if ((await chuDong(p, sel)).includes(chu)) return Date.now() - batDau;
		if (Date.now() - batDau > tranMs) return null;
		await ngu(DO.nhipDoiMs);
	}
}

async function chay() {
	if (!isMeasureDatabase(tenKho))
		await khongDo(
			`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
		);
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") await khongDo(...cay.dong);
	mkdirSync(RA, { recursive: true });
	const quanTri = await db.user.findUniqueOrThrow({
		where: { email: NGUOI },
		select: { id: true },
	});
	await db.member.upsert({
		where: {
			organizationId_userId: {
				organizationId: WORKSPACE_ID,
				userId: quanTri.id,
			},
		},
		create: {
			id: `member-${quanTri.id}`,
			organizationId: WORKSPACE_ID,
			userId: quanTri.id,
			role: "admin",
			createdAt: new Date(),
		},
		update: { role: "admin" },
	});
	const qt = phien();
	const slug = await suySlug(qt);
	const gui = await nguoiGui();
	const tin = await goi(gui, "tinHieu.gui", {
		muonLam: TIEU,
		daXayRa: "Bảng tràn ngang",
		man: "/tin-hieu",
	});
	const so = (await db.tinHieu.findUniqueOrThrow({ where: { id: tin.id } })).so;
	const ma = idTep(so);
	const tieuDe = (await db.tinHieu.findUniqueOrThrow({ where: { id: tin.id } }))
		.tieuDe;
	await goi(qt, "tinHieu.keoVe", {});
	const khoa = (
		await goi(qt, "apiKeys.create", {
			name: `ttts ${RUN}`,
			expiresInDays: 1,
			loai: "day-lo-trinh",
		})
	).key;
	await db.banChupLoTrinh.deleteMany({ where: { nguon: LO_TRINH.nguonCrm } });

	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	datTrinhDuyet(trinhDuyet);
	const SEL_CUA_TOI = `[data-tin-hieu="${ma}"]`;
	const SEL_TAT_CA = `[data-tin-hieu-tat-ca="${ma}"]`;
	const URL_CUA_TOI = `${APP}/${slug}/tin-hieu`;
	const URL_TAT_CA = `${APP}/${slug}/tin-hieu/tat-ca`;
	const mVi = tinHieuMessages("vi");

	await day(khoa, dungKhoiMau({ tinHieu: [{ ma }] }), "1".repeat(40));
	const a = await trang(gui, "1280", "vi");
	const b = await trang(qt, "1280", "vi");
	await mo(a.p, URL_CUA_TOI);
	await mo(b.p, URL_TAT_CA);
	const truocA = await chuDong(a.p, SEL_CUA_TOI);
	const truocB = await chuDong(b.p, SEL_TAT_CA);
	kiem(
		"truoc-cua-toi",
		`dong ${ma} mang «${mVi.nhan.choGom}» (${truocA.includes(mVi.nhan.choGom)})`,
		truocA.includes(mVi.nhan.choGom),
	);
	kiem(
		"truoc-tat-ca",
		`dong ${ma} mang «${mVi.nhan.choGom}» (${truocB.includes(mVi.nhan.choGom)})`,
		truocB.includes(mVi.nhan.choGom),
	);

	const c = await trang(gui, "1280", "vi");
	await mo(c.p, URL_CUA_TOI);
	await day(
		khoa,
		dungKhoiMau({
			tinHieu: [{ ma }],
			nhom: [{ ma: "g1", ten: TEN_NHOM, tinHieu: [ma] }],
		}),
		"2".repeat(40),
	);
	const batDau = Date.now();
	const tranChuong = THONG_BAO.hoiLaiMs + DO.bienMs;
	const thay = await c.p
		.waitForSelector("[data-slot=so-chua-doc]", { timeout: tranChuong })
		.then(() => true)
		.catch(() => false);
	const choChuong = Date.now() - batDau;
	kiem(
		"chuong-trong-mot-nhip",
		thay
			? `so chua doc hien sau ${Math.round(choChuong / 1000)} giay khong tai lai (tran ${tranChuong / 1000})`
			: "doi cho khong len chuong",
		thay && choChuong <= tranChuong,
	);
	await c.ctx.close();
	const tranTrang = LO_TRINH.nhipLamMoiMs + DO.bienMs;
	const choA = await choChu(
		a.p,
		URL_CUA_TOI,
		SEL_CUA_TOI,
		mVi.nhan.daVaoNhom,
		tranTrang,
	);
	const choB = await choChu(
		b.p,
		URL_TAT_CA,
		SEL_TAT_CA,
		mVi.nhan.daVaoNhom,
		tranTrang,
	);
	kiem(
		"trang-trong-mot-nhip",
		choA !== null && choB !== null
			? `nhan moi hien o hai trang sau ${Math.round(Math.max(choA, choB) / 1000)} giay (tran ${tranTrang / 1000})`
			: "trang tin hieu giu ban chup cu",
		choA !== null && choB !== null,
	);
	await a.p.screenshot({ path: join(RA, "E7-cua-toi-1280-vi.png") });
	await b.p.screenshot({ path: join(RA, "E7-tat-ca-1280-vi.png") });
	await a.ctx.close();
	await b.ctx.close();

	const tb = await db.thongBao.findFirst({
		where: { nguoiNhanId: tao.user, khoa: { startsWith: "tin-hieu-doi-cho:" } },
	});
	if (!tb) await khongDo("KHONG DO DUOC: khong co hang thong bao doi cho");
	for (const [kho, lang] of DO.o) {
		const m = tinHieuMessages(lang);
		const kyVong = dongTuRa(
			{
				id: tb.id,
				noiDung: tb.noiDung,
				duongDan: tb.duongDan,
				taoLuc: tb.taoLuc,
				daDoc: false,
			},
			{ locale: lang, slug, now: new Date() },
			"gio",
		);
		const { ctx, p } = await trang(gui, kho, lang);
		try {
			await mo(p, `${APP}/${slug}/tin-hieu`);
			await p.click("[data-slot=chuong-thong-bao]");
			await p.waitForSelector("[data-slot=danh-sach-thong-bao]", {
				timeout: DO.choMs,
			});
			const doc = await p.evaluate((tieu) => {
				const muc = [
					...document.querySelectorAll("[data-slot=danh-sach-thong-bao] a"),
				].find((x) => (x.textContent ?? "").includes(tieu));
				return {
					chu:
						muc?.querySelector("[data-slot=item-title]")?.textContent ??
						muc?.textContent ??
						"",
					khongDich: muc?.querySelector("[translate=no]")?.textContent ?? "",
					cuon:
						document.documentElement.scrollWidth <=
						document.documentElement.clientWidth,
				};
			}, tieuDe);
			kiem(
				`chuong-${kho}-${lang}`,
				`«${doc.chu}» == «${kyVong.cau}», tieu de khong dich (${doc.khongDich === tieuDe}), khong cuon ngang (${doc.cuon})`,
				doc.chu.trim() === kyVong.cau && doc.khongDich === tieuDe && doc.cuon,
			);
			await p.screenshot({ path: join(RA, `E7-chuong-${kho}-${lang}.png`) });
			const link = await p.evaluateHandle(
				(tieu) =>
					[
						...document.querySelectorAll("[data-slot=danh-sach-thong-bao] a"),
					].find((x) => (x.textContent ?? "").includes(tieu)),
				tieuDe,
			);
			const box = await link.asElement()?.boundingBox();
			if (box)
				await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
			await p
				.waitForFunction(() => location.pathname.endsWith("/tin-hieu"), {
					timeout: DO.choMs,
				})
				.catch(() => {});
			await p
				.waitForSelector(SEL_CUA_TOI, { timeout: DO.choMs })
				.catch(() => {});
			const sau = await chuDong(p, SEL_CUA_TOI);
			const url = new URL(p.url()).pathname;
			kiem(
				`bam-${kho}-${lang}`,
				`toi ${url}, dong ${ma} mang «${m.nhan.daVaoNhom}» (${sau.includes(m.nhan.daVaoNhom)}) va ten nhom (${sau.includes(TEN_NHOM)})`,
				url.endsWith("/tin-hieu") &&
					sau.includes(m.nhan.daVaoNhom) &&
					sau.includes(TEN_NHOM),
			);
			await p.screenshot({ path: join(RA, `E7-bam-${kho}-${lang}.png`) });
		} finally {
			await ctx.close();
		}
	}
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((x) => !daPhat.has(x));
	if (thieu.length > 0) {
		dong.push(`SAI ma tran thieu dong: ${thieu.join(", ")}`);
		sai += 1;
	}
	ma = sai > 0 ? 1 : 0;
} catch (e) {
	dong.push(`KHONG DO DUOC: ${e?.stack ?? e}`);
	ma = 2;
} finally {
	await trinhDuyet?.close().catch(() => {});
	await db.banChupLoTrinh
		.deleteMany({ where: { nguon: LO_TRINH.nguonCrm } })
		.catch(() => {});
	if (tao.user) {
		await db.thongBao
			.deleteMany({ where: { nguoiNhanId: tao.user } })
			.catch(() => {});
		await db.session
			.deleteMany({ where: { userId: tao.user } })
			.catch(() => {});
		await db.member.deleteMany({ where: { userId: tao.user } }).catch(() => {});
	}
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
