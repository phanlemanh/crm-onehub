import { execFileSync, spawn, spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const TEP_NAY = fileURLToPath(import.meta.url);
const HO_SO = "gioi-han-duyet-cay-okr";
const TAM =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "man");
const NHOM = { E15: "E15", E16: "E15", E18: "E18", E19: "E18" };
const MOI_EVAL = Object.keys(NHOM);
const LENH_DO =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs"';

const doiSoChi = () => {
	const i = process.argv.indexOf("--chi");
	return i === -1 ? "" : (process.argv[i + 1] ?? "");
};
const CHON = new Set(
	`${process.env.EVAL ?? ""},${doiSoChi()}`
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);

const VET = {
	E15: {
		eval: "E15",
		tep: "apps/api/src/okr/okr.service.ts",
		mo: "ban sao may chu okr.objective khong gan dieuKienXemMucTieu (ngu canh xem coi moi nguoi la quan tri) — mot ban sao lam E15 (man lo tieu de) va E16 (mang lo id/tieu de) cung do",
		cam: (s) =>
			s.replace(
				"\t\tconst nc = this.quyenOkr.nguCanhXem(q, userId);\n\t\tconst [mt] = await this.docMucTieu(this.db, { id }, userId, q, {",
				"\t\tconst nc = { ...this.quyenOkr.nguCanhXem(q, userId), quanTri: true };\n\t\tconst [mt] = await this.docMucTieu(this.db, { id }, userId, q, {",
			),
		ghim: [
			/E15 buoc-khong-thay: tieu de G tim thay tren trang/,
			/E16: nguoi khong xem duoc nhan [1-9]\d* phan hoi chua id\/tieu de G/,
		],
	},
	E18: {
		eval: "E18",
		tep: "apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx",
		mo: "ban sao hop luu tru khong doc okrMo",
		cam: (s) => s.replace("\tif (okrMo > 0)\n", "\tif (okrMo < 0)\n"),
		ghim: /E18 buoc-luu-tru-chan: nut luu tru bat/,
	},
	E19: {
		eval: "E18",
		tep: "apps/app/components/okr/hop-chuyen-okr.tsx",
		mo: "ban sao hop chuyen gui moi muc tieu bat ke o chon",
		cam: (s) =>
			s.replace(
				"\t\t\t\t\t\t\tobjectiveIds: chon,\n",
				"\t\t\t\t\t\t\tobjectiveIds: mucTieu.map((o) => o.id),\n",
			),
		ghim: /E19 so tap: muc tieu thua \S+/,
	},
};
const MOI_VET = Object.keys(VET);
const VET_HOA = new Map(MOI_VET.map((k) => [k.toUpperCase(), k]));
const laChieuDo = process.argv.includes("--chieu-do");
const laMa = [...CHON].filter((e) =>
	laChieuDo ? !VET_HOA.has(e) : !MOI_EVAL.includes(e),
);
if (laMa.length > 0) {
	console.log(
		`KHONG DO DUOC: ma khong thuoc thuoc nay: ${laMa.join(", ")}. Ma nhan duoc: ${(laChieuDo ? MOI_VET : MOI_EVAL).join(", ")}.`,
	);
	process.exit(2);
}
const chon = (nhom) =>
	CHON.size === 0 || [...CHON].some((e) => NHOM[e] === nhom);

function readlinkOr(p) {
	try {
		return execFileSync("readlink", [p], { encoding: "utf8" }).trim() || p;
	} catch {
		return p;
	}
}

function donBanSao(tam, sao) {
	try {
		execFileSync("git", ["worktree", "remove", "--force", sao], {
			cwd: GOC,
			stdio: "ignore",
		});
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		execFileSync("git", ["worktree", "prune"], { cwd: GOC, stdio: "ignore" });
	} catch {}
}

async function motChieuDo(e) {
	const v = VET[e];
	console.log(`\n== chieu do ${e}: ${v.mo}`);
	const tam = mkdtempSync(join(tmpdir(), "gioi-han-duyet-chieu-do-"));
	const sao = join(tam, "crm");
	let con = null;
	const ngat = () => {
		con?.kill("SIGINT");
	};
	process.on("SIGINT", ngat);
	process.on("SIGTERM", ngat);
	try {
		execFileSync(
			"git",
			["worktree", "add", "--detach", "--quiet", sao, "HEAD"],
			{ cwd: GOC, stdio: "inherit" },
		);
		const env = join(GOC, ".env");
		if (existsSync(env)) symlinkSync(readlinkOr(env), join(sao, ".env"));
		execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
			cwd: sao,
			stdio: "inherit",
		});
		const thuocSao = join(sao, relative(GOC, TEP_NAY));
		mkdirSync(dirname(thuocSao), { recursive: true });
		writeFileSync(thuocSao, readFileSync(TEP_NAY));
		const tep = join(sao, v.tep);
		const truoc = readFileSync(tep, "utf8");
		const sau = v.cam(truoc);
		if (sau === truoc)
			return {
				e,
				ket: "KHONG DO DUOC",
				cau: `vet khong cam duoc vao ${v.tep} — vet da lac hau`,
			};
		writeFileSync(tep, sau);
		const doi = execFileSync("git", ["-C", sao, "diff", "--stat"], {
			encoding: "utf8",
		}).trim();
		console.log(`   ban sao ${sao}\n   ${doi.split("\n").join("\n   ")}`);
		const moiTruong = { ...process.env };
		for (const k of [
			"DATABASE_URL",
			"APP_URL",
			"API_URL",
			"PHIEN_DO",
			"NEXT_PUBLIC_API_URL",
			"BANG_CHUNG",
		])
			delete moiTruong[k];
		moiTruong.EVAL = v.eval;
		moiTruong.PHIEN_DO_TEN_CAY = "gioi-han-duyet-chieu-do";
		moiTruong.CHIEU_DO = e;
		let ra = "";
		const ma = await new Promise((xong) => {
			con = spawn("bash", ["-c", LENH_DO], {
				cwd: sao,
				env: moiTruong,
				stdio: ["ignore", "pipe", "pipe"],
			});
			const ghi = (b) => {
				const s = b.toString();
				ra += s;
				process.stdout.write(s);
			};
			con.stdout.on("data", ghi);
			con.stderr.on("data", ghi);
			con.on("error", () => xong(2));
			con.on("exit", (m) => xong(m ?? 2));
		});
		const moiGhim = [v.ghim].flat().map((g) => ra.match(g)?.[0] ?? null);
		const ghim = moiGhim.every((g) => g !== null) ? moiGhim.join(" · ") : null;
		if (ma === 2)
			return {
				e,
				ket: "KHONG DO DUOC",
				cau: "ban sao thoat ma 2 (tien de thieu), khong ket luan duoc",
			};
		if (ma === 1 && ghim)
			return { e, ket: "DO DUNG GHIM", cau: `ma 1, in «${ghim}»` };
		return {
			e,
			ket: "LOT",
			cau: `ma ${ma}, ${ghim ? `co «${ghim}»` : `khong thay du cau ghim ${[v.ghim].flat().join(" + ")}`}`,
		};
	} finally {
		process.off("SIGINT", ngat);
		process.off("SIGTERM", ngat);
		donBanSao(tam, sao);
	}
}

async function chieuDo() {
	const danhSach =
		CHON.size === 0 ? MOI_VET : [...CHON].map((e) => VET_HOA.get(e));
	const ket = [];
	for (const e of danhSach) ket.push(await motChieuDo(e));
	console.log("\nchieu do — tong ket:");
	for (const k of ket) console.log(`  ${k.e}: ${k.ket} — ${k.cau}`);
	if (ket.some((k) => k.ket === "KHONG DO DUOC")) process.exit(2);
	process.exit(ket.every((k) => k.ket === "DO DUNG GHIM") ? 0 : 1);
}

if (laChieuDo) await chieuDo();

const { default: puppeteer } = await import("puppeteer-core");
const { chepSangBangChung } = await import("./noi-bang-chung.mjs");
const { db } = await import("../../../packages/db/src/index.ts");
const { okrGioiHanMessages } = await import(
	"../../../apps/app/lib/messages/okr-gioi-han.ts"
);
const { okrTaiCoCauMessages } = await import(
	"../../../apps/app/lib/messages/okr-tai-co-cau.ts"
);
const { okrMessages } = await import("../../../apps/app/lib/messages/okr.ts");
const { toChucMessages } = await import(
	"../../../apps/app/lib/messages/to-chuc.ts"
);
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const { APP, CHO_TAI, CHROME, chiaCookie, datTrinhDuyet, ket, khongDo } =
	await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");
const API = process.env.API_URL ?? "http://localhost:3001";

const DO = {
	rong: 1440,
	hep: 390,
	cao: 900,
	choMs: 30_000,
	choHydrateMs: 800,
	choKhongHienMs: 1500,
	choGhiMs: 1500,
	choMoHopMs: 10_000,
	lanMoHop: 3,
	lanDiChuyen: 60,
	soMucTieuChuyen: 4,
};
const MA = `g${Date.now().toString(36).slice(-6)}`;
const LOI_BO_QUA = /Download the React DevTools/;
const LOI_NGOAI = /Hydration failed[\s\S]*AppIconRailFallback/;
const LOI_MANG =
	/Failed to load resource|ERR_FAILED|TRPCClientError|status of (400|403|404|500)/i;
const CHU = okrGioiHanMessages("vi");
const CHU_TCC = okrTaiCoCauMessages("vi");
const CHU_OKR = okrMessages("vi");
const CHU_TC = toChucMessages("vi");
const TIEN_TO_MAU = "mau-okr-";
const MIEN_MAU = "mau.onehub.test";
const idMau = (loai, ma) => `${TIEN_TO_MAU}${loai}-${ma}`;
const dien = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const QUY4 = idMau("chu-ky", "quy4");
const PB = { bac: idMau("pb", "kd-bac"), nam: idMau("pb", "kd-nam") };
const MT_CAN_CHINH = idMau("mt", "q4-kd-bac-1");

const NGUOI = {
	quanTri: "le-hai-dang",
	truong: "nguyen-thi-lan",
	duyet: "tran-quoc-bao",
	ngoai: "vo-duc-anh",
};
const NGUOI_XEM = "do-minh-khoa";
const NGUOI_ROI = "la-hoang-phuc";

const TEN = {
	G: `Giữ chân đối tác chiến lược miền Bắc ${MA}`,
	kr: "Đối tác chiến lược gia hạn hợp đồng",
	them: (i) => `Mở kênh đối tác bán lẻ mới ${i} ${MA}`,
};
const LY_DO = {
	ngan: "Thiếu",
	du: `Chưa nêu số khởi điểm của KR, bổ sung rồi gửi lại ${MA}`,
};

console.log(
	CHON.size === 0
		? `man-gioi-han-duyet: chay tron (E15/E16, E18/E19); chay rieng: EVAL=E18 hoac --chi E15; chieu do: --chieu-do (ma: ${MOI_VET.join(", ")})`
		: `man-gioi-han-duyet: chi chay ${[...CHON].join(", ")}${process.env.CHIEU_DO ? ` (ban sao chieu do ${process.env.CHIEU_DO})` : ""}`,
);

rmSync(TAM, { recursive: true, force: true });
mkdirSync(TAM, { recursive: true });

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const { isMeasureDatabase } = await import(
	"../../../packages/db/src/measure-database.ts"
);
const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho) || process.env.PHIEN_DO !== tenKho)
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do cua chinh phien) — kho "${tenKho}", PHIEN_DO "${process.env.PHIEN_DO ?? ""}". Chay qua scripts/lan-do/tien-de.mjs`,
	);

const cookie = {};
const id = {};
const ten = {};
const K = {};

let khang = 0;
const hong = [];
const anh = [];
const mang = [];
const loiConsole = [];
const loiNgoai = [];
let nhom = "";
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
	return dat;
};
const cho = (ms) => new Promise((r) => setTimeout(r, ms));
let slug = "";
let trinhDuyet = null;
const ngu = new Map();

const phienCua = (email) =>
	chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], {
			cwd: join(GOC, "apps", "api"),
			encoding: "utf8",
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);

const chuoiCookie = (c) => `${c.ten}=${c.gia}; lang=vi`;
const mu = (c) => ({ Cookie: chuoiCookie(c) });

async function lam(c, duong, vao) {
	const res = await fetch(`${API}/api/trpc/${duong}`, {
		method: "POST",
		redirect: "manual",
		headers: { ...mu(c), "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

async function hoi(c, duong, vao) {
	const res = await fetch(
		`${API}/api/trpc/${duong}?input=${encodeURIComponent(JSON.stringify(vao))}`,
		{ redirect: "manual", headers: mu(c) },
	);
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

async function suySlugCua(c) {
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: mu(c) });
	const dich = res.headers.get("location") ?? "";
	const dau = new URL(dich || "/", APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	if (!dau || ["sign-in", "onboarding", "het-quyen"].includes(dau))
		await khongDo(
			`KHONG DO DUOC: ${APP}/ tro ve "${dich}" — khong suy duoc slug workspace`,
		);
	return dau;
}

async function napBoMau() {
	const truoc = await db.okrCycle.count();
	if (truoc > 0)
		await khongDo(
			`KHONG DO DUOC: kho do da co ${truoc} chu ky OKR truoc khi nap bo mau — can kho sach`,
		);
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	const dong = `${nap.stdout ?? ""}${nap.stderr ?? ""}`
		.trim()
		.split("\n")
		.at(-1);
	console.log(`  nap bo OKR mau: ma ${nap.status} — ${dong}`);
	if (nap.status !== 0)
		await khongDo(`KHONG DO DUOC: nap bo OKR mau thoat ${nap.status}: ${dong}`);
	const quy4 = await db.okrCycle.findUnique({
		where: { id: QUY4 },
		select: { phase: true },
	});
	if (quy4?.phase !== "dang-chay")
		await khongDo(
			`KHONG DO DUOC: bo mau khong co quy 4 dang chay (thay ${quy4?.phase ?? "khong co"})`,
		);
}

async function vaoNguoi() {
	for (const [k, ma] of Object.entries({
		...NGUOI,
		nguoiXem: NGUOI_XEM,
		roi: NGUOI_ROI,
	})) {
		const u = await db.user.findUnique({
			where: { email: `${ma}@${MIEN_MAU}` },
			select: { id: true, name: true },
		});
		if (!u)
			await khongDo(`KHONG DO DUOC: bo mau khong co nguoi ${ma}@${MIEN_MAU}`);
		id[k] = u.id;
		ten[k] = u.name;
		if (k in NGUOI) cookie[k] = phienCua(`${ma}@${MIEN_MAU}`);
	}
	const vai = await db.member.findMany({
		where: { userId: { in: Object.values(id) } },
		select: { userId: true, role: true },
	});
	const vaiCua = new Map(vai.map((v) => [v.userId, v.role]));
	console.log(
		`  nguoi mau: ${Object.keys(NGUOI)
			.map((k) => `${k}=${ten[k]} (${vaiCua.get(id[k])})`)
			.join(", ")}; nguoi xem ${ten.nguoiXem}; nguoi se roi ${ten.roi}`,
	);
	if (vaiCua.get(id.quanTri) !== "admin" || vaiCua.get(id.ngoai) !== "member")
		await khongDo(
			"KHONG DO DUOC: vai cua nguoi mau khong dung (can quanTri=admin, ngoai=member)",
		);
}

async function taoNhap(tieuDe) {
	const mt = await lam(cookie.truong, "okr.createObjective", {
		cycleId: QUY4,
		unit: { level: "phong-ban", departmentId: PB.bac },
		title: tieuDe,
		kind: "cam-ket",
		ownerUserId: id.truong,
		participantIds: [],
		whyNow: "",
	});
	await lam(cookie.truong, "okr.createKeyResult", {
		objectiveId: mt.id,
		title: TEN.kr,
		kind: "tang-toi",
		ownerUserId: id.truong,
		startValue: 0,
		targetValue: 20,
		currentValue: 0,
		unit: "",
		dueOn: null,
		weight: 1,
	});
	return mt.id;
}

const NHI_PHAN = new Set(["Font", "Image", "Media"]);

function mayGhi(tenMay) {
	return { ten: tenMay, phan: [], hong: 0, hongChu: 0, khongDoc: [], dang: 0 };
}

async function ghiMang(trang, may) {
	const cdp = await trang.createCDPSession();
	await cdp.send("Network.enable", {
		maxTotalBufferSize: 200_000_000,
		maxResourceBufferSize: 50_000_000,
	});
	const cuaCho = new Map();
	cdp.on("Network.responseReceived", (e) =>
		cuaCho.set(e.requestId, {
			url: e.response.url,
			loai: e.type,
			ma: e.response.status,
		}),
	);
	cdp.on("Network.loadingFinished", (e) => {
		const r = cuaCho.get(e.requestId);
		if (!r) return;
		may.dang += 1;
		cdp
			.send("Network.getResponseBody", { requestId: e.requestId })
			.then((b) => {
				may.phan.push({
					...r,
					than: b.base64Encoded
						? Buffer.from(b.body, "base64").toString("utf8")
						: b.body,
				});
			})
			.catch((loi) => {
				may.hong += 1;
				if (!NHI_PHAN.has(r.loai)) may.hongChu += 1;
				may.khongDoc.push(
					`${r.ma} ${r.loai} ${r.url.slice(0, 140)} (${String(loi?.message ?? loi).slice(0, 80)})`,
				);
			})
			.finally(() => {
				may.dang -= 1;
			});
	});
}

async function doiGhi(may) {
	await cho(DO.choGhiMs);
	for (let i = 0; i < 40 && may.dang > 0; i += 1) await cho(250);
}

async function nguCua(khoa) {
	const co = ngu.get(khoa);
	if (co) return co;
	const ctx = await trinhDuyet.createBrowserContext();
	const host = new URL(APP).hostname;
	await ctx.setCookie(
		{
			name: cookie[khoa].ten,
			value: cookie[khoa].gia,
			domain: host,
			path: "/",
		},
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	ngu.set(khoa, ctx);
	return ctx;
}

async function trangMoi(khoa, rong, tuy = {}) {
	const ctx = await nguCua(khoa);
	const trang = await ctx.newPage();
	const ghi = (d) => mang.push(`${new Date().toISOString()} ${khoa} ${d}`);
	const tenNhom = nhom;
	trang.on("pageerror", (e) => {
		ghi(`pageerror ${String(e).slice(0, 3000)}`);
		if (LOI_NGOAI.test(String(e))) {
			loiNgoai.push(`${tenNhom} ${khoa}: hydrat thanh bieu tuong`);
			return;
		}
		loiConsole.push(`${tenNhom} ${khoa}: pageerror ${String(e).slice(0, 200)}`);
	});
	trang.on("console", (m) => {
		if (m.type() !== "error") return;
		const t = m.text();
		ghi(`console.error ${t.slice(0, 300)}`);
		if (LOI_BO_QUA.test(t)) return;
		if (process.env.CHIEU_DO) return;
		if (trang.boQua?.test(t)) return;
		loiConsole.push(
			`${tenNhom} ${khoa} ${trang.url()}: console.error ${t.slice(0, 200)}`,
		);
	});
	trang.on("requestfailed", (r) =>
		ghi(`requestfailed ${r.url()} ${r.failure()?.errorText ?? ""}`),
	);
	trang.on("response", (r) => {
		if (r.status() >= 400)
			ghi(`${r.status()} ${r.request().method()} ${r.url()}`);
	});
	await trang.evaluateOnNewDocument(() => {
		window.__hien = (e) => {
			let x = e;
			while (x && getComputedStyle(x).display === "contents")
				x = x.parentElement;
			return x ? x.checkVisibility() : false;
		};
		window.__tim = (s) =>
			[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
	});
	await trang.setViewport({ width: rong, height: DO.cao });
	if (tuy.may) await ghiMang(trang, tuy.may);
	if (tuy.truocKhiMo) await tuy.truocKhiMo(trang);
	if (tuy.boQua) trang.boQua = tuy.boQua;
	return trang;
}

async function goDevtools(trang) {
	await trang
		.evaluate(() => {
			for (const e of document.querySelectorAll(
				"nextjs-portal, .tsqd-parent-container, .tsqd-open-btn-container",
			))
				e.remove();
		})
		.catch(() => null);
}

async function diToi(trang, url) {
	await trang.goto(url, { waitUntil: "load", timeout: CHO_TAI });
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: DO.choMs })
		.catch(() => null);
	await cho(DO.choHydrateMs);
	await goDevtools(trang);
}

async function moTrang(khoa, rong, duong, tuy = {}) {
	const trang = await trangMoi(khoa, rong, tuy);
	await diToi(trang, `${APP}/${slug}${duong}`);
	return trang;
}

const thayTrong = (trang, ms, fn, ...doiSo) =>
	trang
		.waitForFunction(fn, { timeout: ms, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);
const thayNgay = (trang, fn, ...doiSo) =>
	thayTrong(trang, DO.choMs, fn, ...doiSo);

async function doi(trang, nhan, fn, ...doiSo) {
	return kiem(
		`${nhan}: het ${DO.choMs}ms van chua thay`,
		await thayNgay(trang, fn, ...doiSo),
	);
}

const coMat = (trang, sel, nhan = `co ${sel}`) =>
	doi(trang, nhan, (s) => window.__tim(s).length > 0, sel);
const coSel = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s).length > 0, sel);
const chuSel = (trang, sel) =>
	trang.evaluate(
		(s) => window.__tim(s)[0]?.innerText?.replace(/\s+/g, " ").trim() ?? "",
		sel,
	);
const nutTat = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s)[0]?.disabled ?? null, sel);
const chuTrang = (trang) =>
	trang.evaluate(() => document.body.innerText.replace(/\s+/g, " "));

async function bamEl(tay, nhan) {
	const el = tay.asElement();
	if (!el) return kiem(`${nhom}: khong thay ${nhan} de bam`, false);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}

async function bamIm(trang, sel) {
	await trang.bringToFront();
	const el = (
		await trang.evaluateHandle((s) => window.__tim(s)[0] ?? null, sel)
	).asElement();
	if (!el) return false;
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}

async function bam(trang, sel) {
	await trang.bringToFront();
	return bamEl(
		await trang.evaluateHandle((s) => window.__tim(s)[0] ?? null, sel),
		sel,
	);
}

async function bamChu(trang, sel, chu) {
	await trang.bringToFront();
	return bamEl(
		await trang.evaluateHandle(
			(s, c) =>
				window
					.__tim(s)
					.find((e) => e.innerText.replace(/\s+/g, " ").trim() === c) ?? null,
			sel,
			chu,
		),
		`${sel} chu «${chu}»`,
	);
}

async function go(trang, sel, chu) {
	const tay = await trang.evaluateHandle(
		(s) => window.__tim(s)[0] ?? null,
		sel,
	);
	const el = tay.asElement();
	if (!el) return kiem(`${nhom}: khong thay o ${sel} de go`, false);
	await el.focus();
	await el.evaluate((e) => e.select?.());
	await trang.keyboard.press("Backspace");
	await el.type(chu);
	return true;
}

const HOP_MO = "[data-state='open'] [cmdk-input]";
const LUA_CHON_MO = "[data-state='open'] [role='option']";

const hopDangMo = (trang, triggerSel) =>
	trang.evaluate(
		(s) => window.__tim(s)[0]?.getAttribute("aria-expanded") === "true",
		triggerSel,
	);

async function moHopLyDo(trang, triggerSel) {
	if (
		!(await thayNgay(
			trang,
			(s) => window.__tim(s)[0]?.disabled === false,
			triggerSel,
		))
	)
		return `${triggerSel} van khoa sau ${DO.choMs}ms (danh sach chua tai)`;
	for (let lan = 0; lan < DO.lanMoHop; lan += 1) {
		if (
			!(await hopDangMo(trang, triggerSel)) &&
			!(await bamIm(trang, triggerSel))
		)
			return `khong thay ${triggerSel} de bam`;
		const mo = await thayTrong(
			trang,
			DO.choMoHopMs,
			(s, o) =>
				window.__tim(s)[0]?.getAttribute("aria-expanded") === "true" &&
				window.__tim(o).length > 0,
			triggerSel,
			HOP_MO,
		);
		if (mo) return null;
	}
	return `hop chon cua ${triggerSel} khong mo sau ${DO.lanMoHop} lan`;
}

async function goTim(trang, chu) {
	for (let lan = 0; lan < DO.lanMoHop; lan += 1) {
		const el = (
			await trang.evaluateHandle((s) => window.__tim(s)[0] ?? null, HOP_MO)
		).asElement();
		if (!el) return false;
		await el.evaluate((e) => {
			e.focus();
			e.select();
		});
		await trang.keyboard.press("Backspace");
		await el.type(chu, { delay: 20 });
		if (
			await thayTrong(
				trang,
				DO.choMoHopMs,
				(s, c) => document.querySelector(s)?.value === c,
				HOP_MO,
				chu,
			)
		)
			return true;
	}
	return false;
}

async function chonLyDo(trang, triggerSel, tenMuc, timChu = tenMuc) {
	let daGo = false;
	for (let lan = 0; lan < DO.lanMoHop && !daGo; lan += 1) {
		const loiMo = await moHopLyDo(trang, triggerSel);
		if (loiMo) return loiMo;
		daGo = await goTim(trang, timChu);
	}
	const coMuc = await thayNgay(
		trang,
		(s, c) =>
			window
				.__tim(s)
				.some((o) => o.innerText.replace(/\s+/g, " ").trim().startsWith(c)),
		LUA_CHON_MO,
		tenMuc,
	);
	if (coMuc)
		for (let i = 0; i < DO.lanDiChuyen; i += 1) {
			const { dangChon, tieuDiem } = await trang.evaluate(
				(s, o) => ({
					dangChon:
						window
							.__tim(`${s}[aria-selected='true']`)[0]
							?.innerText.replace(/\s+/g, " ")
							.trim() ?? null,
					tieuDiem: document.activeElement?.matches(o) === true,
				}),
				LUA_CHON_MO,
				HOP_MO,
			);
			if (!tieuDiem) break;
			if (dangChon?.startsWith(tenMuc)) {
				await trang.keyboard.press("Enter");
				return null;
			}
			await trang.keyboard.press("ArrowDown");
		}
	const thay = await trang.evaluate(
		(o, l) => ({
			o: document.querySelector(o)?.value ?? null,
			luaChon: window
				.__tim(l)
				.slice(0, 6)
				.map((x) => x.innerText.replace(/\s+/g, " ").trim()),
			rong: window.__tim("[cmdk-empty]").map((e) => e.innerText.trim()),
			tieuDiem: document.activeElement?.outerHTML.slice(0, 120) ?? null,
		}),
		HOP_MO,
		LUA_CHON_MO,
	);
	if (await hopDangMo(trang, triggerSel)) await trang.keyboard.press("Escape");
	return `khong ${coMuc ? "di toi" : "co"} lua chon «${tenMuc}» o ${triggerSel} (go «${timChu}» ${daGo ? "dung" : "lech"}; hop dang co ${JSON.stringify(thay)})`;
}

async function chonHop(trang, triggerSel, tenMuc, timChu = tenMuc) {
	const loi = await chonLyDo(trang, triggerSel, tenMuc, timChu);
	if (loi) return kiem(`${nhom}: ${loi}`, false);
	await cho(300);
	return true;
}

async function chup(trang, tenAnh) {
	await goDevtools(trang);
	const rong = await trang.evaluate(() => [
		document.documentElement.scrollWidth,
		window.innerWidth,
	]);
	kiem(
		`${tenAnh}: tran ngang scrollWidth ${rong[0]} > innerWidth ${rong[1]}`,
		rong[0] <= rong[1],
	);
	await cho(300);
	await trang.screenshot({ path: join(TAM, tenAnh) });
	anh.push(tenAnh);
}

async function cuonToi(trang, sel) {
	await trang.evaluate((s) => {
		window.__tim(s)[0]?.scrollIntoView({ block: "start" });
	}, sel);
	await cho(300);
}

async function kho(trang, rong) {
	await trang.setViewport({ width: rong, height: DO.cao });
	await cho(DO.choKhongHienMs);
}

const SHEET = (mt) => `[data-okr-sheet='${mt}']`;
const DAU_KHUNG = (mt, dk) =>
	`[data-okr-sheet='${mt}'][data-dau-khung='${dk}']`;
const NUT_MENU = (mt) =>
	`${SHEET(mt)} button[aria-label='${CHU_OKR.sheet.menu}']`;

async function coToast(trang, chu) {
	return thayNgay(
		trang,
		(c) =>
			[...document.querySelectorAll("[data-sonner-toast]")].some((e) =>
				e.innerText.includes(c),
			),
		chu,
	);
}

async function moSheet(trang, mt, nhan) {
	if (
		!(await coMat(
			trang,
			`[data-mo-muc-tieu='${mt}']`,
			`${nhan}: nut mo muc tieu ${mt}`,
		))
	)
		return false;
	await bam(trang, `[data-mo-muc-tieu='${mt}']`);
	return doi(
		trang,
		`${nhan}: khung muc tieu ${mt} tai xong`,
		(s) => window.__tim(`${s}[data-dau-khung]`).length > 0,
		SHEET(mt),
	);
}

async function moMucHienThi(trang, mt, nhan) {
	await bam(trang, NUT_MENU(mt));
	if (
		!(await doi(
			trang,
			`${nhan}: menu co muc «${CHU.menuMucHienThi}»`,
			() =>
				window.__tim("[role='menuitem'][data-muc='muc-hien-thi']").length > 0,
		))
	)
		return false;
	await bam(trang, "[role='menuitem'][data-muc='muc-hien-thi']");
	return coMat(
		trang,
		"[data-hop='muc-hien-thi']",
		`${nhan}: hop muc hien thi mo`,
	);
}

async function dongDb(mt) {
	return db.okrObjective.findUnique({
		where: { id: mt },
		select: {
			status: true,
			hienThi: true,
			departmentId: true,
			nguoiXem: { select: { userId: true } },
		},
	});
}

async function vetDb(mt, action) {
	return db.okrTrail.findMany({
		where: { objectiveId: mt, action },
		orderBy: [{ at: "asc" }, { id: "asc" }],
		select: { actorUserId: true, note: true, at: true },
	});
}

async function laTranslateNo(trang, sel, chu) {
	return trang.evaluate(
		(s, c) => {
			const el = window
				.__tim(s)
				.flatMap((x) => [x, ...x.querySelectorAll("*")])
				.find(
					(e) =>
						e.childElementCount === 0 &&
						e.innerText?.replace(/\s+/g, " ").trim() === c,
				);
			return el ? el.closest("[translate='no']") !== null : null;
		},
		sel,
		chu,
	);
}

const O_NGUOI_XEM = "[data-hop='muc-hien-thi'] [role='combobox']";
const TOKEN_NGUOI_XEM = "[data-hop='muc-hien-thi'] [data-nguoi-xem]";
const RADIO_GIOI_HAN =
	"[data-hop='muc-hien-thi'] [role='radio'][value='gioi-han']";

async function chonNguoiXem(t) {
	const coTen = () =>
		thayTrong(
			t,
			DO.choMoHopMs,
			(s, c) => (window.__tim(s)[0]?.innerText ?? "").includes(c),
			TOKEN_NGUOI_XEM,
			ten.nguoiXem,
		);
	let loi = null;
	for (let lan = 1; lan <= DO.lanMoHop; lan += 1) {
		loi = await chonLyDo(t, O_NGUOI_XEM, ten.nguoiXem, NGUOI_XEM);
		if (!loi && (await coTen())) return null;
		loi ??= `o nguoi xem khong co «${ten.nguoiXem}» sau khi chon (thay «${await chuSel(t, TOKEN_NGUOI_XEM)}»)`;
		console.log(`  ${nhom}: lan ${lan} chua chon duoc nguoi xem — ${loi}`);
		if (await coTen()) return null;
	}
	return loi;
}

async function tienDeGioiHan(t) {
	if (
		!(await thayNgay(
			t,
			(s) => window.__tim(s).length > 0,
			`[data-mo-muc-tieu='${K.G}']`,
		))
	)
		return `khong thay nut mo G sau ${DO.choMs}ms`;
	await bamIm(t, `[data-mo-muc-tieu='${K.G}']`);
	if (
		!(await thayNgay(
			t,
			(s) => window.__tim(`${s}[data-dau-khung]`).length > 0,
			SHEET(K.G),
		))
	)
		return `khung G khong tai xong sau ${DO.choMs}ms`;
	await bamIm(t, NUT_MENU(K.G));
	if (
		!(await thayNgay(
			t,
			() =>
				window.__tim("[role='menuitem'][data-muc='muc-hien-thi']").length > 0,
		))
	)
		return `menu khong co muc «${CHU.menuMucHienThi}»`;
	await bamIm(t, "[role='menuitem'][data-muc='muc-hien-thi']");
	if (
		!(await thayNgay(
			t,
			() => window.__tim("[data-hop='muc-hien-thi']").length > 0,
		))
	)
		return "hop muc hien thi khong mo";
	if (
		!(await thayNgay(
			t,
			() =>
				document.querySelector("[role='menu']") === null &&
				document.activeElement?.closest("[data-hop='muc-hien-thi']") != null,
		))
	)
		return `menu chua dong han hoac tieu diem chua vao hop muc hien thi sau ${DO.choMs}ms`;
	for (
		let lan = 0;
		lan < DO.lanMoHop && !(await coSel(t, O_NGUOI_XEM));
		lan += 1
	) {
		await bamIm(t, RADIO_GIOI_HAN);
		await thayTrong(
			t,
			DO.choMoHopMs,
			(s) => window.__tim(s).length > 0,
			O_NGUOI_XEM,
		);
	}
	if (!(await coSel(t, O_NGUOI_XEM)))
		return "o nguoi xem khong hien khi chon Gioi han";
	return chonNguoiXem(t);
}

async function buocGioiHan(t) {
	nhom = "E15 buoc-gioi-han";
	const tienDeHong = async (lyDo) => {
		khang += 1;
		hong.push(`${nhom}: TIEN DE HONG — ${lyDo}`);
		await t
			.screenshot({ path: join(TAM, "buoc-gioi-han-hong.png") })
			.then(() => anh.push("buoc-gioi-han-hong.png"))
			.catch(() => null);
		return false;
	};
	const loi = await tienDeGioiHan(t);
	if (loi) return tienDeHong(loi);
	const token = await chuSel(t, TOKEN_NGUOI_XEM);
	kiem(
		`${nhom}: o nguoi xem co «${ten.nguoiXem}» (thay «${token}»)`,
		token.includes(ten.nguoiXem),
	);
	const toast = coToast(t, CHU.hienThi.daLuu);
	await bamIm(t, "[data-nut='luu-muc-hien-thi']");
	const dong = await thayNgay(
		t,
		(s) =>
			window.__tim("[data-hop='muc-hien-thi']").length === 0 &&
			window.__tim(`${s} [data-nhan-gioi-han]`).length > 0,
		DAU_KHUNG(K.G, "gioi-han"),
	);
	if (!dong) {
		const loiHop = await chuSel(
			t,
			"[data-hop='muc-hien-thi'] [data-slot='field-error']",
		);
		return tienDeHong(
			`sau Luu ${DO.choMs}ms hop chua dong hoac dau khung chua co nhan «${CHU.nhan.gioiHan}» (loi tren hop «${loiHop}»)`,
		);
	}
	kiem(`${nhom}: toast «${CHU.hienThi.daLuu}»`, await toast);
	const nhan = await chuSel(t, `${SHEET(K.G)} [data-nhan-gioi-han]`);
	kiem(
		`${nhom}: nhan dau khung «${CHU.nhan.gioiHan}» (thay «${nhan}»)`,
		nhan === CHU.nhan.gioiHan,
	);
	await chup(t, "buoc-gioi-han.png");
	const d = await dongDb(K.G);
	const xem = d?.nguoiXem.map((x) => x.userId) ?? [];
	console.log(
		`  E16 sau Luu muc: G.hienThi ${d?.hienThi}, okrNguoiXem ${JSON.stringify(xem)}`,
	);
	const dat =
		d?.hienThi === "gioi-han" && xem.length === 1 && xem[0] === id.nguoiXem;
	const cau = `E16: sau Luu, G.hienThi «${d?.hienThi}» mong gioi-han va okrNguoiXem ${JSON.stringify(xem)} mong [${id.nguoiXem}]`;
	if (!dat) return tienDeHong(cau);
	return kiem(cau, true);
}

async function buocConCanChinh() {
	nhom = "E15 buoc-con-can-chinh";
	const t = await moTrang("truong", DO.rong, "/okr", {
		boQua: LOI_MANG,
	});
	if (!(await moSheet(t, MT_CAN_CHINH, nhom))) {
		await t.close();
		return;
	}
	if (await moMucHienThi(t, MT_CAN_CHINH, nhom)) {
		await bam(t, "[data-hop='muc-hien-thi'] [role='radio'][value='gioi-han']");
		await bam(t, "[data-nut='luu-muc-hien-thi']");
		await doi(
			t,
			`${nhom}: loi con can chinh sau khi bam Luu`,
			() =>
				window.__tim("[data-hop='muc-hien-thi'] [data-slot='field-error']")
					.length > 0,
		);
		const loi = await chuSel(
			t,
			"[data-hop='muc-hien-thi'] [data-slot='field-error']",
		);
		console.log(`  ${nhom}: loi «${loi}»`);
		kiem(
			`${nhom}: loi noi «con … can chinh» (thay «${loi}»)`,
			/còn \d+ căn chỉnh/.test(loi),
		);
		kiem(
			`${nhom}: nut Luu khoa sau loi`,
			(await nutTat(t, "[data-nut='luu-muc-hien-thi']")) === true,
		);
		await chup(t, "buoc-con-can-chinh.png");
		const d = await dongDb(MT_CAN_CHINH);
		kiem(
			`${nhom}: muc tieu con can chinh van cong-khai (thay ${d?.hienThi})`,
			d?.hienThi === "cong-khai",
		);
	}
	await t.close();
}

async function buocChoDuyet(t) {
	nhom = "E15 buoc-cho-duyet";
	await coMat(
		t,
		`${SHEET(K.G)} [data-nut='gui-duyet']`,
		`${nhom}: nut Gui duyet`,
	);
	await bam(t, `${SHEET(K.G)} [data-nut='gui-duyet']`);
	await doi(
		t,
		`${nhom}: hoi lai «${CHU.duyet.hoiGui.tieuDe}»`,
		(c) =>
			window.__tim("[role='alertdialog']").some((e) => e.innerText.includes(c)),
		CHU.duyet.hoiGui.tieuDe,
	);
	await bamChu(t, "[role='alertdialog'] button", CHU.duyet.hoiGui.nut);
	await doi(
		t,
		`${nhom}: dai cho nguoi gui`,
		(s) => window.__tim(`${s} [data-dai='cho-nguoi-gui']`).length > 0,
		DAU_KHUNG(K.G, "cho-nguoi-gui"),
	);
	const dai = await chuSel(t, `${SHEET(K.G)} [data-dai='cho-nguoi-gui']`);
	const mongDai = dien(CHU.duyet.choNguoi, { nguoi: ten.duyet });
	console.log(`  ${nhom}: dai «${dai.slice(0, 160)}»`);
	kiem(`${nhom}: dai co «${mongDai}» (thay «${dai}»)`, dai.includes(mongDai));
	kiem(
		`${nhom}: dai co nut «${CHU.duyet.rutLai}»`,
		await coSel(t, `${SHEET(K.G)} [data-nut='rut-lai']`),
	);
	kiem(
		`${nhom}: nut sua khoa — khong con «Thêm KR» va «Gửi duyệt»`,
		!(await coSel(t, `${SHEET(K.G)} [data-nut='them-kr']`)) &&
			!(await coSel(t, `${SHEET(K.G)} [data-nut='gui-duyet']`)),
	);
	await chup(t, "buoc-cho-duyet.png");
	await kho(t, DO.hep);
	await chup(t, "buoc-cho-duyet-390.png");
	await kho(t, DO.rong);
	const d = await dongDb(K.G);
	const gui = await vetDb(K.G, "gui-duyet");
	console.log(
		`  E16 sau Gui duyet: G.status ${d?.status}, vet gui-duyet ${gui.map((v) => v.actorUserId).join(",")}`,
	);
	kiem(
		`E16: sau Gui duyet G.status «${d?.status}» mong cho-duyet va dung mot vet gui-duyet cua T (thay ${gui.length}: ${gui.map((v) => v.actorUserId).join(",")})`,
		d?.status === "cho-duyet" &&
			gui.length === 1 &&
			gui[0].actorUserId === id.truong,
	);
}

async function buocNguoiDuyet() {
	nhom = "E15 buoc-nguoi-duyet";
	const h = await moTrang("duyet", DO.rong, "/okr");
	const muc = `[data-viec-okr='okr-cho-duyet']`;
	const mong = dien(CHU.viec.choDuyet, { ten: TEN.G });
	await doi(
		h,
		`${nhom}: viec OKR cua toi co «${mong}»`,
		(s, c) =>
			window.__tim(s).some((e) => e.innerText.replace(/\s+/g, " ").includes(c)),
		muc,
		mong,
	);
	await bam(h, `${muc} [data-mo-muc-tieu='${K.G}']`);
	await doi(
		h,
		`${nhom}: khung G co dai nguoi duyet`,
		(s) => window.__tim(`${s} [data-dai='cho-nguoi-duyet']`).length > 0,
		DAU_KHUNG(K.G, "cho-nguoi-duyet"),
	);
	const dai = await chuSel(h, `${SHEET(K.G)} [data-dai='cho-nguoi-duyet']`);
	const mongGui = dien(CHU.duyet.nguoiGui, { nguoi: ten.truong });
	kiem(`${nhom}: dai co «${mongGui}» (thay «${dai}»)`, dai.includes(mongGui));
	const duyet = await chuSel(h, `${SHEET(K.G)} [data-nut='duyet']`);
	const traLai = await chuSel(h, `${SHEET(K.G)} [data-nut='tra-lai']`);
	kiem(
		`${nhom}: nut «${CHU.duyet.duyetCongBo}» va «${CHU.duyet.traLai}» (thay «${duyet}», «${traLai}»)`,
		duyet === CHU.duyet.duyetCongBo && traLai === CHU.duyet.traLai,
	);
	await chup(h, "buoc-nguoi-duyet.png");
	await kho(h, DO.hep);
	await chup(h, "buoc-nguoi-duyet-390.png");
	await kho(h, DO.rong);

	nhom = "E15 buoc-tra-lai";
	await bam(h, `${SHEET(K.G)} [data-nut='tra-lai']`);
	await coMat(h, "[data-hop='tra-lai'] textarea", `${nhom}: hop tra lai`);
	await go(h, "[data-hop='tra-lai'] textarea", LY_DO.ngan);
	kiem(
		`${nhom}: go ${LY_DO.ngan.length} ky tu -> nut Tra lai khoa`,
		(await nutTat(h, "[data-nut='xac-nhan-tra-lai']")) === true,
	);
	await go(h, "[data-hop='tra-lai'] textarea", LY_DO.du);
	kiem(
		`${nhom}: go du ly do -> nut Tra lai bat`,
		(await nutTat(h, "[data-nut='xac-nhan-tra-lai']")) === false,
	);
	await bam(h, "[data-nut='xac-nhan-tra-lai']");
	await doi(
		h,
		`${nhom}: hop dong, khung G ve nhap`,
		(s) =>
			window.__tim("[data-hop='tra-lai']").length === 0 &&
			window.__tim(s).length > 0,
		`${SHEET(K.G)}[data-trang-thai]`,
	);
	await cho(DO.choGhiMs);
	await h.close();
	const d = await dongDb(K.G);
	const tra = await vetDb(K.G, "tra-lai");
	console.log(
		`  E16 sau Tra lai: G.status ${d?.status}, vet tra-lai ${JSON.stringify(tra.map((v) => v.note))}`,
	);
	kiem(
		`E16: sau Tra lai G.status «${d?.status}» mong nhap va dung mot vet tra-lai co note «${LY_DO.du}» (thay ${JSON.stringify(tra.map((v) => v.note))})`,
		d?.status === "nhap" && tra.length === 1 && tra[0].note === LY_DO.du,
	);
}

async function buocBiTraLai() {
	nhom = "E15 buoc-bi-tra-lai";
	const t = await moTrang("truong", DO.rong, "/okr");
	if (!(await moSheet(t, K.G, nhom))) {
		await t.close();
		return;
	}
	await doi(
		t,
		`${nhom}: dai bi tra lai`,
		(s) => window.__tim(`${s} [data-dai='bi-tra-lai']`).length > 0,
		DAU_KHUNG(K.G, "bi-tra-lai"),
	);
	const dai = await chuSel(t, `${SHEET(K.G)} [data-dai='bi-tra-lai']`);
	const mongNguoi = dien(CHU.duyet.biTraLai, { nguoi: ten.duyet });
	kiem(
		`${nhom}: dai co «${mongNguoi}» va ly do da go (thay «${dai}»)`,
		dai.includes(mongNguoi) && dai.includes(LY_DO.du),
	);
	const lyDoNo = await t.evaluate(
		(s) =>
			window.__tim(`${s} [data-ly-do-tra-lai]`)[0]?.getAttribute("translate") ??
			null,
		SHEET(K.G),
	);
	kiem(
		`${nhom}: ly do tra lai mang translate=no (thay ${lyDoNo})`,
		lyDoNo === "no",
	);
	const tieuDeNo = await laTranslateNo(t, SHEET(K.G), TEN.G);
	kiem(
		`${nhom}: tieu de G mang translate=no (thay ${tieuDeNo})`,
		tieuDeNo === true,
	);
	await chup(t, "buoc-bi-tra-lai.png");
	await t.close();
}

const VONG_LAI = (mt) => [
	`objective:${mt}`,
	`objective%3A${mt}`,
	`objective%253A${mt}`,
];

function boVongLai(than) {
	let s = than;
	for (const v of VONG_LAI(K.G)) s = s.split(v).join("");
	return s;
}

function soiMay(may) {
	const lo = may.phan.filter((p) => {
		const s = boVongLai(p.than);
		return s.includes(K.G) || s.includes(TEN.G);
	});
	return {
		tong: may.phan.length,
		trpc: may.phan.filter((p) => p.url.includes("/api/trpc/")).length,
		lo,
	};
}

async function buocKhongThay() {
	nhom = "E15 buoc-khong-thay";
	const truoc = await dongDb(K.G);
	const gioiHan = truoc?.hienThi === "gioi-han";
	kiem(
		`${nhom}: G dang gioi-han truoc khi nguoi ngoai mo (thay ${truoc?.hienThi}) — lo chi tinh khi G that su gioi han`,
		gioiHan,
	);
	const may = mayGhi("ngoai");
	const n = await moTrang("ngoai", DO.rong, `/okr?record=objective:${K.G}`, {
		may,
		boQua: LOI_MANG,
	});
	const thay = await thayNgay(
		n,
		(s) =>
			window.__tim(`${s} [data-khung-khong-thay]`).length > 0 ||
			window.__tim(`${s}[data-dau-khung]`).length > 0,
		SHEET(K.G),
	);
	const khung = await chuSel(n, `${SHEET(K.G)} [data-khung-khong-thay]`);
	kiem(
		`${nhom}: khung doc «${CHU.khongThay.tieuDe}» (thay «${khung.slice(0, 120)}», mo ${thay})`,
		khung.includes(CHU.khongThay.tieuDe),
	);
	const trang1 = await chuTrang(n);
	if (gioiHan && trang1.includes(TEN.G))
		console.log(
			`  E15 buoc-khong-thay: tieu de G tim thay tren trang (${n.url()})`,
		);
	kiem(`${nhom}: toan trang khong chua tieu de G`, !trang1.includes(TEN.G));
	await chup(n, "buoc-khong-thay.png");
	await diToi(
		n,
		`${APP}/${slug}/okr/theo-don-vi?donOkr=pb:${PB.bac}&kyOkr=${QUY4}`,
	);
	await doi(
		n,
		`${nhom}: Theo don vi phong KD Bac co muc tieu (doi chung duong)`,
		() => window.__tim("[data-mo-muc-tieu]").length > 0,
	);
	const dong = await n.evaluate(() =>
		window
			.__tim("[data-mo-muc-tieu]")
			.map((e) => e.getAttribute("data-mo-muc-tieu")),
	);
	console.log(
		`  ${nhom}: Theo don vi KD Bac cho nguoi ngoai: ${dong.length} dong ${JSON.stringify(dong)}`,
	);
	kiem(
		`${nhom}: Theo don vi khong co dong G (thay ${JSON.stringify(dong)})`,
		!dong.includes(K.G) && dong.includes(MT_CAN_CHINH),
	);
	const trang2 = await chuTrang(n);
	if (gioiHan && trang2.includes(TEN.G))
		console.log(
			`  E15 buoc-khong-thay: tieu de G tim thay tren trang (${n.url()})`,
		);
	kiem(`${nhom}: Theo don vi khong chua tieu de G`, !trang2.includes(TEN.G));
	await chup(n, "buoc-khong-thay-theo-don-vi.png");
	await doiGhi(may);
	await n.close();
	return { may, gioiHan };
}

const LOI_CHAN = (path) => ({
	error: {
		message: "chan boi thuoc man-gioi-han-duyet",
		code: -32603,
		data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500, path },
	},
});

const thuTucCua = (u) => {
	const url = new URL(u);
	const duoi = url.pathname.split("/api/trpc/")[1];
	if (duoi === undefined) return [];
	return decodeURIComponent(duoi)
		.split(",")
		.map((t) => t.trim());
};

async function buocTrangThaiLoi() {
	nhom = "E15 trang-thai-loi";
	const chan = { dang: true, lan: 0 };
	const c = cookie.truong;
	const t = await moTrang("truong", DO.rong, "/okr", {
		boQua: LOI_MANG,
		truocKhiMo: async (p) => {
			await p.setRequestInterception(true);
			p.on("request", async (r) => {
				const thuTuc = thuTucCua(r.url());
				if (!chan.dang || !thuTuc.includes("okr.objective")) {
					await r.continue();
					return;
				}
				chan.lan += 1;
				if (thuTuc.length === 1) {
					await r.respond({
						status: 500,
						contentType: "application/json",
						body: JSON.stringify([LOI_CHAN("okr.objective")]),
					});
					return;
				}
				const that = await fetch(r.url(), {
					method: r.method(),
					headers: {
						Cookie: chuoiCookie(c),
						"content-type": "application/json",
					},
					body: r.postData(),
				});
				const ds = JSON.parse(await that.text());
				await r.respond({
					status: 207,
					contentType: "application/json",
					body: JSON.stringify(
						thuTuc.map((x, i) =>
							x === "okr.objective" ? LOI_CHAN("okr.objective") : ds[i],
						),
					),
				});
			});
		},
	});
	await coMat(t, `[data-mo-muc-tieu='${K.G}']`, `${nhom}: nut mo G`);
	await bam(t, `[data-mo-muc-tieu='${K.G}']`);
	await doi(
		t,
		`${nhom}: chan okr.objective -> Empty loi co «${CHU.loiTai.thuLai}»`,
		(s) => window.__tim(`${s} [data-khung-loi]`).length > 0,
		SHEET(K.G),
	);
	const loi = await chuSel(t, `${SHEET(K.G)} [data-khung-loi]`);
	kiem(
		`${nhom}: Empty loi «${CHU.loiTai.tieuDe}» + «${CHU.loiTai.thuLai}» (thay «${loi}», chan ${chan.lan} lan)`,
		loi.includes(CHU.loiTai.tieuDe) && loi.includes(CHU.loiTai.thuLai),
	);
	await chup(t, "trang-thai-loi.png");
	chan.dang = false;
	await bamChu(t, `${SHEET(K.G)} [data-khung-loi] button`, CHU.loiTai.thuLai);
	await doi(
		t,
		`${nhom}: bo chan, bam Thu lai -> khung G tai duoc`,
		(s) => window.__tim(`${s}[data-dau-khung]`).length > 0,
		SHEET(K.G),
	);
	await t.close();
}

async function nhomE15() {
	nhom = "E15/E16";
	await lam(cookie.quanTri, "okr.setProgram", { duyetCongBo: true });
	K.G = await taoNhap(TEN.G);
	console.log(
		`  gieo E15: bat o duyet qua okr.setProgram (quan tri); nhap G ${K.G} «${TEN.G}» cua ${ten.truong} o KD Bac, 1 KR`,
	);
	const mayT = mayGhi("truong");
	const t = await moTrang("truong", DO.rong, "/okr", { may: mayT });
	const tienDe = await buocGioiHan(t);
	if (tienDe) await buocChoDuyet(t);
	await doiGhi(mayT);
	await t.close();
	await buocConCanChinh();
	if (!tienDe) {
		for (const b of [
			"E15 buoc-cho-duyet",
			"E15 buoc-nguoi-duyet",
			"E15 buoc-tra-lai",
			"E15 buoc-bi-tra-lai",
			"E15 buoc-khong-thay",
			"E16 bo ghi CDP nguoi khong xem duoc",
		])
			console.log(`  ${b}: bo qua vi tien de hong`);
		await buocTrangThaiLoi();
		return;
	}
	await buocNguoiDuyet();
	await buocBiTraLai();
	const { may: mayN, gioiHan } = await buocKhongThay();
	await buocTrangThaiLoi();

	const sN = soiMay(mayN);
	const sT = soiMay(mayT);
	console.log(
		`  E16 bo ghi CDP nguoi khong xem duoc: ${sN.tong} phan hoi da soi (${sN.trpc} tRPC), ${sN.lo.length} phan hoi chua id/tieu de G (khong doc duoc ${mayN.hong}, trong do ${mayN.hongChu} phan hoi chu; khong tinh chuoi dia chi «objective:<id>» ma chinh nguoi do go vao)`,
	);
	console.log(
		`  E16 doi chung duong truong T: ${sT.tong} phan hoi da soi, ${sT.lo.length} phan hoi chua id/tieu de G`,
	);
	for (const k of mayN.khongDoc)
		console.log(`  E16 phan hoi khong doc duoc: ${k}`);
	if (mayN.hongChu > 0)
		console.log(
			`  E16: khong doc duoc ${mayN.hongChu} phan hoi chu — dem lo khong tin duoc`,
		);
	kiem(
		`E16: phan hoi chu (khong tinh ${[...NHI_PHAN].join("/")}) khong doc duoc ${mayN.hongChu} (mong 0)`,
		mayN.hongChu === 0,
	);
	if (gioiHan && sN.lo.length > 0) {
		console.log(
			`  E16: nguoi khong xem duoc nhan ${sN.lo.length} phan hoi chua id/tieu de G`,
		);
		for (const p of sN.lo.slice(0, 3)) {
			const i = [TEN.G, K.G]
				.map((x) => p.than.indexOf(x))
				.filter((x) => x >= 0)
				.sort((a, b) => a - b)[0];
			console.log(
				`  E16 phan hoi lo: ${p.url.slice(0, 160)} …${p.than.slice(Math.max(0, i - 80), i + 120)}…`,
			);
		}
	}
	kiem(
		`E16: bo ghi nguoi khong xem duoc co phan hoi tRPC (${sN.trpc})`,
		sN.tong > 0 && sN.trpc > 0,
	);
	kiem(
		`E16: nguoi khong xem duoc nhan ${sN.lo.length} phan hoi chua id/tieu de G (mong 0)`,
		sN.lo.length === 0,
	);
	kiem(
		`E16: doi chung duong — phien truong T co >= 1 phan hoi chua id G (thay ${sT.lo.length})`,
		sT.lo.length >= 1,
	);
}

async function buocChuongTrinh() {
	nhom = "E18 buoc-chuong-trinh";
	await lam(cookie.quanTri, "okr.setProgram", { duyetCongBo: false });
	const truoc = await hoi(cookie.quanTri, "okr.program", {});
	const a = await moTrang("quanTri", DO.rong, "/settings/okr");
	const sw = "[data-the='cau-hinh'] [data-cong-tac='duyet-cong-bo']";
	await doi(
		a,
		`${nhom}: cong tac «${CHU_TCC.chuongTrinh.duyetCongBo}» dang tat va bat duoc`,
		(s) =>
			window.__tim(s)[0]?.getAttribute("aria-checked") === "false" &&
			window.__tim(s)[0]?.disabled === false,
		sw,
	);
	const nhan = await a.evaluate((s) => {
		const e = window.__tim(s)[0];
		const f = e?.closest("[data-slot='field']");
		return f?.innerText?.replace(/\s+/g, " ").trim() ?? "";
	}, sw);
	kiem(
		`${nhom}: dong co «${CHU_TCC.chuongTrinh.duyetCongBo}» (thay «${nhan.slice(0, 80)}»)`,
		nhan.includes(CHU_TCC.chuongTrinh.duyetCongBo),
	);
	await bam(a, sw);
	await doi(
		a,
		`${nhom}: cong tac bat`,
		(s) => window.__tim(s)[0]?.getAttribute("aria-checked") === "true",
		sw,
	);
	await doi(
		a,
		`${nhom}: nut Luu bat`,
		() => window.__tim("[data-nut='luu-cau-hinh']")[0]?.disabled === false,
	);
	await bam(a, "[data-nut='luu-cau-hinh']");
	kiem(
		`${nhom}: co toast sau Luu`,
		await thayNgay(
			a,
			() => document.querySelectorAll("[data-sonner-toast]").length > 0,
		),
	);
	await cho(DO.choGhiMs);
	await chup(a, "buoc-chuong-trinh.png");
	await a.close();
	const sau = await hoi(cookie.quanTri, "okr.program", {});
	console.log(
		`  E19 program(): version ${truoc.version} -> ${sau.version}, duyetCongBo ${truoc.duyetCongBo} -> ${sau.duyetCongBo}`,
	);
	kiem(
		`E19: sau Luu program() version tang (${truoc.version} -> ${sau.version}) va duyetCongBo true (thay ${sau.duyetCongBo})`,
		sau.version > truoc.version && sau.duyetCongBo === true,
	);

	nhom = "E18 buoc-chuong-trinh-khoa";
	const m = await moTrang("ngoai", DO.rong, "/settings/okr");
	await coMat(m, sw, `${nhom}: cong tac hien`);
	const khoa = await m.evaluate((s) => {
		const e = window.__tim(s)[0];
		const lyDo = e?.getAttribute("aria-describedby") ?? "";
		const dong = lyDo
			? lyDo
					.split(/\s+/)
					.map((x) => document.getElementById(x))
					.filter(Boolean)
					.map((x) => x.innerText.replace(/\s+/g, " ").trim())
					.join(" ")
			: "";
		return { tat: e?.disabled ?? null, dong };
	}, sw);
	console.log(`  ${nhom}: ${JSON.stringify(khoa)}`);
	kiem(
		`${nhom}: cong tac khoa va co dong ly do (thay ${JSON.stringify(khoa)})`,
		khoa.tat === true && khoa.dong.length > 0,
	);
	await chup(m, "buoc-chuong-trinh-khoa.png");
	await m.close();
}

async function tapMo(pb) {
	const ds = await db.okrObjective.findMany({
		where: {
			departmentId: pb,
			status: { not: "da-bo" },
			cycle: { phase: { in: ["lap-ke-hoach", "dang-chay", "cham-diem"] } },
		},
		select: { id: true },
		orderBy: { createdAt: "asc" },
	});
	return ds.map((d) => d.id);
}

async function buocLuuTruVaChuyen() {
	nhom = "E18 buoc-luu-tru-chan";
	let mo = await tapMo(PB.bac);
	for (let i = mo.length; i < DO.soMucTieuChuyen; i += 1)
		K[`them${i}`] = await taoNhap(TEN.them(i));
	mo = await tapMo(PB.bac);
	if (mo.length !== DO.soMucTieuChuyen)
		return kiem(
			`${nhom}: phong KD Bac can ${DO.soMucTieuChuyen} muc tieu mo, thay ${mo.length}`,
			false,
		);
	const boChon = mo.at(-1);
	console.log(
		`  gieo E18: KD Bac co ${mo.length} muc tieu mo ${JSON.stringify(mo)}; se bo chon ${boChon}`,
	);
	const a = await moTrang(
		"quanTri",
		DO.rong,
		`/settings/organization?don=pb:${PB.bac}`,
	);
	const dongOkr = `[data-chi-tiet='phong-ban'][data-phong-ban='${PB.bac}'] [data-dong-okr-mo]`;
	await coMat(a, dongOkr, `${nhom}: dong OKR mo`);
	const chuDong = await chuSel(a, dongOkr);
	const mongDong = CHU_TCC.toChuc.okrMo(mo.length);
	kiem(
		`${nhom}: dong «${mongDong}» (thay «${chuDong}»)`,
		chuDong.includes(mongDong),
	);
	const tenMenu = dien(CHU_TC.menu, { ten: "" });
	await bamEl(
		await a.evaluateHandle(
			(s, m) =>
				window.__tim(`${s} button`).find((b) => b.textContent.includes(m)) ??
				null,
			`[data-chi-tiet='phong-ban'][data-phong-ban='${PB.bac}']`,
			tenMenu,
		),
		"menu phong ban",
	);
	await doi(
		a,
		`${nhom}: menu co «${CHU_TC.luuTru}»`,
		(c) =>
			window.__tim("[role='menuitem']").some((e) => e.innerText.trim() === c),
		CHU_TC.luuTru,
	);
	await bamChu(a, "[role='menuitem']", CHU_TC.luuTru);
	await doi(
		a,
		`${nhom}: hop luu tru mo`,
		() =>
			window.__tim("[data-hop='luu-tru-chan']").length > 0 ||
			window.__tim("[role='alertdialog']").length > 0,
	);
	await doi(
		a,
		`${nhom}: hop luu tru kiem xong dieu kien`,
		() =>
			window.__tim("[role='alertdialog']").length > 0 ||
			(window.__tim("[data-hop='luu-tru-chan']").length > 0 &&
				window.__tim("[data-dang-kiem-luu-tru]").length === 0),
	);
	const chan = await a.evaluate(() => {
		const hop = window.__tim("[data-hop='luu-tru-chan']")[0];
		const xacNhan = window.__tim("[role='alertdialog']")[0];
		const nutXn = xacNhan
			? [...xacNhan.querySelectorAll("button")].find(
					(b) => b.getAttribute("data-variant") === "default",
				)
			: null;
		return {
			hop: hop !== undefined,
			lyDo:
				hop?.querySelector("[data-ly-do-chan='okr']")?.innerText?.trim() ??
				null,
			khoa: hop?.querySelector("[data-nut='luu-tru-khoa']")?.disabled ?? null,
			chuyen: hop?.querySelector("[data-nut='chuyen-okr-tu-luu-tru']") !== null,
			nutXacNhanBat: nutXn ? !nutXn.disabled : false,
		};
	});
	console.log(`  ${nhom}: ${JSON.stringify(chan)}`);
	if (!chan.hop || chan.khoa !== true)
		console.log(
			`  E18 buoc-luu-tru-chan: nut luu tru bat (${chan.nutXacNhanBat ? "hop xac nhan co nut Luu tru bam duoc" : "khong co hop chan"})`,
		);
	const mongLyDo = CHU_TCC.toChuc.chan.lyDo["phong-ban"](mo.length);
	kiem(
		`${nhom}: hop noi ly do «${mongLyDo}», nut luu tru khoa, co «${CHU_TCC.toChuc.chuyenOkr}» (thay ${JSON.stringify(chan)})`,
		chan.hop && chan.lyDo === mongLyDo && chan.khoa === true && chan.chuyen,
	);
	await chup(a, "buoc-luu-tru-chan.png");

	nhom = "E18 buoc-chuyen";
	if (chan.hop && chan.chuyen)
		await bam(
			a,
			"[data-hop='luu-tru-chan'] [data-nut='chuyen-okr-tu-luu-tru']",
		);
	else {
		await a.keyboard.press("Escape");
		await cho(500);
		await bam(
			a,
			`[data-chi-tiet='phong-ban'][data-phong-ban='${PB.bac}'] [data-dong-okr-mo] [data-nut='chuyen-okr']`,
		);
	}
	await doi(
		a,
		`${nhom}: hop chuyen OKR liet ${mo.length} muc tieu`,
		(n) =>
			window.__tim("[data-hop='chuyen-okr'] [data-muc-tieu-chuyen]").length ===
			n,
		mo.length,
	);
	const liet = await a.evaluate(() =>
		window
			.__tim("[data-hop='chuyen-okr'] [data-muc-tieu-chuyen]")
			.map((e) => e.getAttribute("data-muc-tieu-chuyen"))
			.sort(),
	);
	kiem(
		`${nhom}: hop liet dung tap muc tieu mo (thay ${JSON.stringify(liet)})`,
		JSON.stringify(liet) === JSON.stringify([...mo].sort()),
	);
	const tenNam = await db.department.findUnique({
		where: { id: PB.nam },
		select: { name: true },
	});
	await chonHop(
		a,
		"[data-hop='chuyen-okr'] [role='combobox']",
		tenNam?.name ?? PB.nam,
	);
	await bam(
		a,
		`[data-hop='chuyen-okr'] [data-muc-tieu-chuyen='${boChon}'] [role='checkbox']`,
	);
	const mongNut = CHU_TCC.chuyen.nut(mo.length - 1);
	await doi(
		a,
		`${nhom}: nut «${mongNut}» bat`,
		(c) => {
			const b = window.__tim(
				"[data-hop='chuyen-okr'] [data-nut='chuyen-okr']",
			)[0];
			return b?.disabled === false && b.innerText.trim() === c;
		},
		mongNut,
	);
	await bam(a, "[data-hop='chuyen-okr'] [data-nut='chuyen-okr']");
	kiem(
		`${nhom}: toast «${CHU_TCC.chuyen.xong(mo.length - 1, tenNam?.name ?? "")}»`,
		await coToast(a, CHU_TCC.chuyen.xong(mo.length - 1, tenNam?.name ?? "")),
	);
	await doi(
		a,
		`${nhom}: hop dong, dong OKR cua KD Bac con 1`,
		(s) =>
			window.__tim("[data-hop='chuyen-okr']").length === 0 &&
			window.__tim(s)[0]?.getAttribute("data-dong-okr-mo") === "1",
		dongOkr,
	);
	const conLai = await chuSel(a, dongOkr);
	kiem(
		`${nhom}: dong «${CHU_TCC.toChuc.okrMo(1)}» (thay «${conLai}»)`,
		conLai.includes(CHU_TCC.toChuc.okrMo(1)),
	);
	await chup(a, "buoc-chuyen.png");
	await kho(a, DO.hep);
	await chup(a, "buoc-chuyen-390.png");
	await a.close();

	const daChon = mo.filter((x) => x !== boChon).sort();
	const sau = await db.okrObjective.findMany({
		where: { id: { in: mo } },
		select: { id: true, departmentId: true },
	});
	const sangNam = sau
		.filter((x) => x.departmentId === PB.nam)
		.map((x) => x.id)
		.sort();
	const thua = sangNam.filter((x) => !daChon.includes(x));
	const thieu = daChon.filter((x) => !sangNam.includes(x));
	for (const x of thua) console.log(`  E19 so tap: muc tieu thua ${x}`);
	for (const x of thieu) console.log(`  E19 so tap: muc tieu thieu ${x}`);
	kiem(
		`E19: dung ${daChon.length} muc tieu da chon sang KD Nam (thua ${JSON.stringify(thua)}, thieu ${JSON.stringify(thieu)})`,
		thua.length === 0 && thieu.length === 0,
	);
	const giu = sau.find((x) => x.id === boChon)?.departmentId;
	kiem(
		`E19: muc tieu bo chon ${boChon} giu KD Bac (thay ${giu})`,
		giu === PB.bac,
	);
	const vet = await db.okrTrail.findMany({
		where: { objectiveId: { in: mo }, action: "chuyen-don-vi" },
		select: { objectiveId: true },
	});
	const vetIds = vet.map((v) => v.objectiveId).sort();
	kiem(
		`E19: ${daChon.length} vet chuyen-don-vi dung muc tieu da chon (thay ${JSON.stringify(vetIds)})`,
		JSON.stringify(vetIds) === JSON.stringify(daChon),
	);
	const pb = await db.department.findUnique({
		where: { id: PB.bac },
		select: { archivedAt: true },
	});
	kiem(
		`E19: phong ban cu archivedAt van null (thay ${pb?.archivedAt})`,
		pb?.archivedAt === null,
	);
	console.log(
		`  E19: sang KD Nam ${JSON.stringify(sangNam)}, bo chon ${boChon} o ${giu}, vet chuyen-don-vi ${vetIds.length}`,
	);
}

async function buocMoCoi() {
	nhom = "E18 buoc-mo-coi";
	const a = await moTrang("quanTri", DO.rong, "/okr/toan-canh/suc-khoe");
	await doi(
		a,
		`${nhom}: khoi OKR mo coi rong «${CHU_TCC.moCoi.rong.tieuDe}»`,
		() =>
			window.__tim("[data-khoi-mo-coi][data-trang-thai='ST-mocoi-rong']")
				.length > 0,
	);
	const rong = await chuSel(a, "[data-khoi-mo-coi]");
	kiem(
		`${nhom}: khoi rong doc «${CHU_TCC.moCoi.rong.tieuDe}» (thay «${rong.slice(0, 120)}»)`,
		rong.includes(CHU_TCC.moCoi.rong.tieuDe),
	);
	await cuonToi(a, "[data-khoi-mo-coi]");
	await chup(a, "buoc-mo-coi-rong.png");
	const kr = await db.okrKeyResult.findMany({
		where: {
			ownerUserId: id.roi,
			objective: {
				status: { not: "da-bo" },
				cycle: { phase: { in: ["lap-ke-hoach", "dang-chay", "cham-diem"] } },
			},
		},
		select: { objectiveId: true },
	});
	const mtRoi = [...new Set(kr.map((k) => k.objectiveId))];
	if (mtRoi.length !== 1) {
		kiem(
			`${nhom}: ${ten.roi} can phu trach KR o dung 1 muc tieu mo, thay ${JSON.stringify(mtRoi)}`,
			false,
		);
		await a.close();
		return;
	}
	const tv = await db.member.findFirstOrThrow({
		where: { userId: id.roi },
		select: { id: true },
	});
	await lam(cookie.quanTri, "workspace.removeMember", { memberId: tv.id });
	console.log(
		`  ${nhom}: go ${ten.roi} (phu trach KR cua ${mtRoi[0]}) qua workspace.removeMember`,
	);
	await diToi(a, `${APP}/${slug}/okr/toan-canh/suc-khoe`);
	await doi(
		a,
		`${nhom}: khoi OKR mo coi co muc`,
		() => window.__tim("[data-khoi-mo-coi] [data-mo-coi]").length > 0,
	);
	const tren = await a.evaluate(() =>
		window.__tim("[data-khoi-mo-coi] [data-mo-coi]").map((e) => ({
			id: e.getAttribute("data-mo-coi"),
			lyDo: [...e.querySelectorAll("[data-ly-do]")].map((b) => ({
				ma: b.getAttribute("data-ly-do"),
				chu: b.innerText.trim(),
			})),
			hanhDong: [...e.querySelectorAll("[data-hanh-dong]")].map((b) => ({
				ma: b.getAttribute("data-hanh-dong"),
				chu: b.innerText.trim(),
			})),
		})),
	);
	console.log(`  ${nhom}: ${JSON.stringify(tren)}`);
	const muc = tren.find((x) => x.id === mtRoi[0]);
	kiem(
		`${nhom}: mot muc ${mtRoi[0]} nhan «${CHU_TCC.moCoi.lyDo["kr-phu-trach-roi"]}» va hanh dong «${CHU_TCC.moCoi.hanhDong.moMucTieu}» (thay ${JSON.stringify(tren)})`,
		tren.length === 1 &&
			muc !== undefined &&
			muc.lyDo.some(
				(l) =>
					l.ma === "kr-phu-trach-roi" &&
					l.chu === CHU_TCC.moCoi.lyDo["kr-phu-trach-roi"],
			) &&
			muc.hanhDong.some(
				(h) =>
					h.ma === "mo-muc-tieu" && h.chu === CHU_TCC.moCoi.hanhDong.moMucTieu,
			),
	);
	await cuonToi(a, "[data-khoi-mo-coi]");
	await chup(a, "buoc-mo-coi.png");
	await kho(a, DO.hep);
	await cuonToi(a, "[data-khoi-mo-coi]");
	await chup(a, "buoc-mo-coi-390.png");
	await a.close();
	const api = (await hoi(cookie.quanTri, "okr.moCoi", {}))
		.map((m) => m.objectiveId)
		.sort();
	const man = tren.map((x) => x.id).sort();
	console.log(
		`  E19 mo coi: man ${JSON.stringify(man)} · okr.moCoi ${JSON.stringify(api)}`,
	);
	kiem(
		`E19: khoi mo coi tren man liet dung tap objectiveId cua okr.moCoi (man ${JSON.stringify(man)}, api ${JSON.stringify(api)})`,
		JSON.stringify(man) === JSON.stringify(api),
	);
}

async function nhomE18() {
	nhom = "E18/E19";
	await buocChuongTrinh();
	await buocLuuTruVaChuyen();
	await buocMoCoi();
}

function chepBangChung() {
	if (process.env.CHIEU_DO || hong.length > 0 || anh.length === 0) {
		console.log(
			`  bang chung: ${anh.length} anh o ${relative(GOC, TAM)}/ · KHONG chep sang evidence/ (${process.env.CHIEU_DO ? "chieu do" : hong.length > 0 ? "lan chay co hong" : "khong co anh"})`,
		);
		return;
	}
	chepSangBangChung(
		anh.map((a) => join(TAM, a)),
		anh.map((a) => join("man", a)),
	);
}

trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);

let ma = 0;
const bat = Date.now();
try {
	await napBoMau();
	await vaoNguoi();
	slug = await suySlugCua(cookie.quanTri);
	for (const [nhomChay, fn] of [
		["E15", nhomE15],
		["E18", nhomE18],
	]) {
		if (!chon(nhomChay)) continue;
		const b = Date.now();
		await fn().catch((e) =>
			hong.push(`${nhomChay}: nem ${String(e?.stack ?? e).slice(0, 600)}`),
		);
		console.log(`  nhom ${nhomChay}: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	if (loiNgoai.length > 0)
		console.log(
			`  ngoai pham vi (khong tinh hong): ${loiNgoai.length} loi hydrat cua AppIconRailFallback — ${loiNgoai.join(" || ")}`,
		);
	kiem(
		`khong loi console (${loiConsole.length}): ${loiConsole.slice(0, 6).join(" || ")}`,
		loiConsole.length === 0,
	);
} catch (e) {
	hong.push(`tien de: nem ${String(e?.stack ?? e).slice(0, 600)}`);
} finally {
	writeFileSync(join(TAM, "man-gioi-han-duyet-network.txt"), mang.join("\n"));
	console.log(
		`man-gioi-han-duyet: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh (${anh.join(", ")}), ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	console.log(`  anh o ${relative(GOC, TAM)}/`);
	console.log("  kho do bo khi phien dong — khong don tay");
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
	chepBangChung();
}
await ket(ma);
