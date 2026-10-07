import { execFileSync, spawn } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
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
const HO_SO = "don-okr-nhap-sai";
const BANG_CHUNG =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "evidence");
const MOI_EVAL = ["E12", "E13", "E20", "E21"];
const LENH_DO =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/don-okr-nhap-sai/rang/man-don-okr.mjs"';
const ANH_MONG = [
	"E12-danh-sach",
	"E12-da-bo-mo",
	"E12-menu-nhap-sach",
	"E12-hoi-xoa",
	"E12-sau-xoa",
	"E12-ngan-da-bo",
	"E12-sau-dung-lai",
	"E12-danh-sach-390",
	"E12-da-bo-mo-390",
	"E12-cua-toi",
];

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
const laMa = [...CHON].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0) {
	console.log(
		`KHONG DO DUOC: ma khong thuoc thuoc nay: ${laMa.join(", ")}. Ma nhan duoc: ${MOI_EVAL.join(", ")}.`,
	);
	process.exit(2);
}
const chon = (e) => CHON.size === 0 || CHON.has(e);

const OKR_MAN = "apps/app/app/(app)/[slug]/okr";
const VET = {
	E13: {
		tep: "apps/app/components/crm/record-sheet/objective-sheet.tsx",
		mo: "ban sao nut Dung lai goi dropObjective",
		cam: (s) =>
			s.replace(
				"trpc.okr.dungLaiMucTieu.mutationOptions({",
				"trpc.okr.dropObjective.mutationOptions({",
			),
		ghim: /dung lai: M3 doc duoc status «[^»]*», droppedAt [^,]+, vet dung-lai 0/,
	},
	E20: {
		tep: `${OKR_MAN}/theo-don-vi/theo-don-vi.tsx`,
		mo: "ban sao trang Theo don vi dem dong gap bang rows thay vi daBo",
		cam: (s) => s.replace(/(<NhomDaBo[^>]*?)ds=\{daBo\}/s, "$1ds={objectives}"),
		ghim: /so trong dong gap \d+ khac so muc tieu da bo doc DB \d+/,
	},
	E21: {
		tep: `${OKR_MAN}/cua-toi.tsx`,
		mo: "ban sao Cua toi bo dong gap khoi trang",
		cam: (s) => s.replaceAll("{nhomDaBo}", ""),
		ghim: /cua-toi thieu dong gap/,
	},
};

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
	const tam = mkdtempSync(join(tmpdir(), "don-okr-chieu-do-"));
	const sao = join(tam, "crm");
	let con = null;
	const ngat = () => con?.kill("SIGINT");
	process.on("SIGINT", ngat);
	process.on("SIGTERM", ngat);
	try {
		execFileSync(
			"git",
			["worktree", "add", "--detach", "--quiet", sao, "HEAD"],
			{
				cwd: GOC,
				stdio: "inherit",
			},
		);
		const env = join(GOC, ".env");
		if (existsSync(env)) symlinkSync(readlinkOr(env), join(sao, ".env"));
		execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
			cwd: sao,
			stdio: "inherit",
		});
		execFileSync("bun", ["run", "db:generate"], {
			cwd: join(sao, "packages", "db"),
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
				cau: `vet khong cam duoc vao ${v.tep}`,
			};
		writeFileSync(tep, sau);
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
		moiTruong.EVAL = e;
		moiTruong.PHIEN_DO_TEN_CAY = "don-okr-chieu-do";
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
		const ghim = ra.match(v.ghim)?.[0] ?? null;
		if (ma === 2)
			return {
				e,
				ket: "KHONG DO DUOC",
				cau: "ban sao thoat ma 2, khong ket luan duoc",
			};
		if (ma === 1 && ghim)
			return { e, ket: "DO DUNG GHIM", cau: `ma 1, in «${ghim}»` };
		return {
			e,
			ket: "LOT",
			cau: `ma ${ma}, ${ghim ? `co «${ghim}»` : `khong thay cau ghim ${v.ghim}`}`,
		};
	} finally {
		process.off("SIGINT", ngat);
		process.off("SIGTERM", ngat);
		donBanSao(tam, sao);
	}
}

if (process.argv.includes("--chieu-do")) {
	const danhSach = (CHON.size === 0 ? MOI_EVAL : [...CHON]).filter(
		(e) => e in VET,
	);
	const ket = [];
	for (const e of danhSach) ket.push(await motChieuDo(e));
	console.log("\nchieu do — tong ket:");
	for (const k of ket) console.log(`  ${k.e}: ${k.ket} — ${k.cau}`);
	if (ket.some((k) => k.ket === "KHONG DO DUOC")) process.exit(2);
	process.exit(ket.every((k) => k.ket === "DO DUNG GHIM") ? 0 : 1);
}

const { default: puppeteer } = await import("puppeteer-core");
const { db } = await import("../../../packages/db/src/index.ts");
const { isOnboarded, markOnboarded, WORKSPACE_ID } = await import(
	"../../../packages/db/src/workspace.ts"
);
const { okrMessages } = await import("../../../apps/app/lib/messages/okr.ts");
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const {
	API,
	APP,
	CHO_TAI,
	CHROME,
	chiaCookie,
	datTrinhDuyet,
	ket,
	khongDo,
	suySlug,
} = await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");

const DO = { rong: 1440, hep: 390, cao: 900, choMs: 30_000, choHydrateMs: 800 };
const MA = `d${Date.now().toString(36).slice(-6)}`;
const LOI_BO_QUA = /Download the React DevTools/;
const M = okrMessages("vi");
const S = M.sheet;

mkdirSync(BANG_CHUNG, { recursive: true });
for (const f of readdirSync(BANG_CHUNG))
	if (f.startsWith("E12-") && f.endsWith(".png")) rmSync(join(BANG_CHUNG, f));

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const chuKySan = await db.okrCycle.count();
if (chuKySan > 0)
	await khongDo(
		`KHONG DO DUOC: tien de thieu — kho da co ${chuKySan} chu ky OKR ngoai fixture.`,
	);

const ngayVN = (d) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
const HOM_NAY = ngayVN(new Date());
const NAM = Number(HOM_NAY.slice(0, 4));
const QUY = Math.floor((Number(HOM_NAY.slice(5, 7)) - 1) / 3) + 1;
const thang = (m) => String(m).padStart(2, "0");
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

const NGUOI = {
	admin: { email: `a${MA}@thu.test`, vai: "admin", ten: "Nguyễn Minh An" },
	truong: { email: `t${MA}@thu.test`, vai: "member", ten: "Trần Thu Hà" },
	chu: { email: `c${MA}@thu.test`, vai: "member", ten: "Lê Minh Quân" },
};
const TEN = {
	P: `Chăm sóc khách hàng ${MA}`,
	nam: `Năm ${NAM} ${MA}`,
	quy: `Quý ${QUY}/${NAM} ${MA}`,
	M1: "Rút thời gian phản hồi phiếu hỗ trợ (nhập sai)",
	M2: "Giữ chân khách hàng doanh nghiệp",
	M3: "Giữ chân khách hàng doanh nghiệp (bản trùng)",
	M4: "Mở kênh hỗ trợ qua Zalo",
};

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

const khoaThanhVien = (userId) => ({
	organizationId_userId: { organizationId: WORKSPACE_ID, userId },
});

async function datNguoi(email, vai, ten) {
	const nguoi = await db.user.update({
		where: { email },
		data: { name: ten },
		select: { id: true },
	});
	await db.member.upsert({
		where: khoaThanhVien(nguoi.id),
		create: {
			id: `member-${nguoi.id}`,
			organizationId: WORKSPACE_ID,
			userId: nguoi.id,
			role: vai,
			createdAt: new Date(),
		},
		update: { role: vai },
	});
	await db.session.updateMany({
		where: { userId: nguoi.id },
		data: { activeOrganizationId: WORKSPACE_ID },
	});
	return nguoi.id;
}

const mu = (c) => ({ Cookie: `${c.ten}=${c.gia}; lang=vi` });

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

const cookie = {};
const id = {};
const G = { ky: [], pb: [], mt: [] };
const K = {};
let khang = 0;
const hong = [];
const anh = [];
const loiConsole = [];
let slug = "";
let trinhDuyet = null;
const cho = (ms) => new Promise((r) => setTimeout(r, ms));
const kiem = (e, nhan, dat) => {
	if (!chon(e)) return dat;
	khang += 1;
	if (!dat) hong.push(`${e} ${nhan}`);
	return dat;
};

async function taoMt(cookieTao, chuId, title, congBo, bo) {
	const r = await lam(cookieTao, "okr.createObjective", {
		cycleId: K.quy,
		unit: { level: "phong-ban", departmentId: K.P },
		title,
		kind: "cam-ket",
		ownerUserId: chuId,
		participantIds: [],
		whyNow: "",
	});
	G.mt.push(r.id);
	await lam(cookieTao, "okr.createKeyResult", {
		objectiveId: r.id,
		title: `KR của ${title}`,
		kind: "tang-toi",
		ownerUserId: chuId,
		startValue: 0,
		targetValue: 100,
		currentValue: 0,
		unit: "",
		dueOn: null,
		weight: 1,
	});
	if (congBo) await lam(cookieTao, "okr.publishObjective", { id: r.id });
	if (bo) await lam(cookieTao, "okr.dropObjective", { id: r.id });
	return r.id;
}

async function gieo() {
	await lam(cookie.admin, "okr.setProgram", { duyetCongBo: false });
	const pb = await lam(cookie.admin, "org.createDepartment", {
		name: TEN.P,
		divisionId: null,
	});
	G.pb.push(pb.id);
	K.P = pb.id;
	for (const ai of ["truong", "chu"])
		await lam(cookie.admin, "org.setPlacement", {
			userId: id[ai],
			primaryDepartmentId: K.P,
			secondaryDepartmentIds: [],
			managerUserId: null,
		});
	await lam(cookie.admin, "org.setHead", {
		kind: "department",
		id: K.P,
		userId: id.truong,
	});
	const nam = await lam(cookie.admin, "okr.createCycle", {
		kind: "nam",
		name: TEN.nam,
		parentId: null,
		startsOn: `${NAM}-01-01`,
		endsOn: `${NAM}-12-31`,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(nam.id);
	const quy = await lam(cookie.admin, "okr.createCycle", {
		kind: "quy",
		name: TEN.quy,
		parentId: nam.id,
		startsOn: `${NAM}-${thang(QUY * 3 - 2)}-01`,
		endsOn: `${NAM}-${thang(QUY * 3)}-${cuoiThang(NAM, QUY * 3)}`,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(quy.id);
	K.quy = quy.id;
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: K.quy,
		phase: "dang-chay",
	});
	K.M1 = await taoMt(cookie.truong, id.truong, TEN.M1, false, false);
	K.M2 = await taoMt(cookie.truong, id.truong, TEN.M2, true, false);
	K.M3 = await taoMt(cookie.truong, id.truong, TEN.M3, false, true);
	K.M4 = await taoMt(cookie.truong, id.chu, TEN.M4, true, true);
	console.log(
		`  gieo: P ${K.P}, quy ${K.quy}, M1 ${K.M1}, M2 ${K.M2}, M3 ${K.M3}, M4 ${K.M4}`,
	);
}

async function donDep() {
	const kr = (
		await db.okrKeyResult.findMany({
			where: { objectiveId: { in: G.mt } },
			select: { id: true },
		})
	).map((r) => r.id);
	const nguoi = Object.values(id);
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ cycleId: { in: G.ky } },
				{ objectiveId: { in: G.mt } },
				{ actorUserId: { in: nguoi } },
			],
		},
	});
	await db.okrViecKr.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrNguonKr.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrFollow.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrKeyResult.deleteMany({ where: { id: { in: kr } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: G.mt } } });
	await db.okrCycle.deleteMany({ where: { id: { in: G.ky }, kind: "quy" } });
	await db.okrCycle.deleteMany({ where: { id: { in: G.ky } } });
	await db.orgPlacement.deleteMany({
		where: {
			OR: [{ userId: { in: nguoi } }, { primaryDepartmentId: { in: G.pb } }],
		},
	});
	await db.department.updateMany({
		where: { id: { in: G.pb } },
		data: { headUserId: null },
	});
	await db.department.deleteMany({ where: { id: { in: G.pb } } });
	await db.session.deleteMany({ where: { userId: { in: nguoi } } });
	await db.member.deleteMany({ where: { userId: { in: nguoi } } });
	await db.user.deleteMany({ where: { id: { in: nguoi } } });
}

async function moTrang(c, rong, duong) {
	const trang = await trinhDuyet.newPage();
	trang.on("pageerror", (e) =>
		loiConsole.push(`${duong}: pageerror ${String(e).slice(0, 200)}`),
	);
	trang.on("console", (m) => {
		if (m.type() !== "error") return;
		const t = m.text();
		if (LOI_BO_QUA.test(t)) return;
		if (process.env.CHIEU_DO && /status of 4\d\d/.test(t)) return;
		loiConsole.push(`${duong}: console.error ${t.slice(0, 200)}`);
	});
	await trang.evaluateOnNewDocument(() => {
		window.__hien = (e) =>
			e.checkVisibility() ||
			(getComputedStyle(e).display === "contents" &&
				(e.parentElement?.checkVisibility() ?? false));
		window.__tim = (s) =>
			[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
	});
	await trang.setViewport({ width: rong, height: DO.cao });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: c.ten, value: c.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await trang.goto(`${APP}/${slug}${duong}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: DO.choMs })
		.catch(() => null);
	await cho(DO.choHydrateMs);
	await goDevtools(trang);
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

const thayNgay = (trang, fn, ...doiSo) =>
	trang
		.waitForFunction(fn, { timeout: DO.choMs, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);

async function bam(trang, sel, chu = null) {
	await trang.bringToFront();
	const tay = await trang.evaluateHandle(
		(s, c) =>
			window
				.__tim(s)
				.find(
					(e) => c === null || e.innerText.replace(/\s+/g, " ").trim() === c,
				) ?? null,
		sel,
		chu,
	);
	const el = tay.asElement();
	if (!el) {
		hong.push(`khong thay ${sel}${chu ? ` «${chu}»` : ""} de bam`);
		return false;
	}
	await el.click().catch(() => el.evaluate((e) => e.click()));
	return true;
}

async function chup(trang, ten) {
	await goDevtools(trang);
	const rong = await trang.evaluate(() => [
		document.documentElement.scrollWidth,
		window.innerWidth,
	]);
	kiem(
		"E12",
		`${ten}: tran ngang scrollWidth ${rong[0]} > innerWidth ${rong[1]}`,
		rong[0] <= rong[1],
	);
	await cho(300);
	await trang.screenshot({ path: join(BANG_CHUNG, `${ten}.png`) });
	anh.push(ten);
}

const anhDanhSach = (t) =>
	t.evaluate(() => {
		const hang = window.__tim("[data-hang-muc-tieu]");
		const nhom = window.__tim("[data-nhom-da-bo]")[0] ?? null;
		const nut = nhom?.querySelector("button") ?? null;
		return {
			chinh: hang
				.filter((h) => h.closest("[data-nhom-da-bo]") === null)
				.map((h) => ({
					id: h.getAttribute("data-hang-muc-tieu"),
					daBo: h.hasAttribute("data-da-bo"),
				})),
			daBo: hang
				.filter((h) => h.closest("[data-nhom-da-bo]") !== null)
				.map((h) => ({
					id: h.getAttribute("data-hang-muc-tieu"),
					daBo: h.hasAttribute("data-da-bo"),
					tienDo: h.querySelectorAll("[role='progressbar']").length,
					chu: h.innerText,
				})),
			chuNhom: nut?.innerText.replace(/\s+/g, " ").trim() ?? null,
			moNhom: nut?.getAttribute("aria-expanded") ?? null,
		};
	});

const demTrongNhom = (chu) =>
	Number(chu?.match(/\((\d+)\)/)?.[1] ?? Number.NaN);

const daBoCuaDonVi = () =>
	db.okrObjective.count({
		where: { cycleId: K.quy, departmentId: K.P, status: "da-bo" },
	});

const coToast = (t, chu) =>
	thayNgay(
		t,
		(c) =>
			[...document.querySelectorAll("[data-sonner-toast]")].some((e) =>
				e.innerText.includes(c),
			),
		chu,
	);

const duongDonVi = () => `/okr/theo-don-vi?donOkr=pb:${K.P}&kyOkr=${K.quy}`;

async function buocDanhSach() {
	const t = await moTrang(cookie.truong, DO.rong, duongDonVi());
	await thayNgay(t, () => window.__tim("[data-nhom-da-bo]").length > 0);
	const a = await anhDanhSach(t);
	const dbBo = await daBoCuaDonVi();
	kiem(
		"E12",
		`danh sach: chinh M1, M2 khong dong da bo; dong gap «Da bo (2)» dong (thay ${JSON.stringify(a)})`,
		JSON.stringify(a.chinh.map((h) => h.id).sort()) ===
			JSON.stringify([K.M1, K.M2].sort()) &&
			a.chinh.every((h) => !h.daBo) &&
			a.chuNhom === M.khoiMucTieu.nhomDaBo(2) &&
			a.moNhom === "false" &&
			a.daBo.length === 0,
	);
	kiem(
		"E20",
		`so trong dong gap ${demTrongNhom(a.chuNhom)} khac so muc tieu da bo doc DB ${dbBo}`,
		demTrongNhom(a.chuNhom) === dbBo,
	);
	const dauThe = await t.evaluate(() => document.body.innerText);
	kiem(
		"E20",
		`dau the dem 2 muc tieu dang dung (${M.demDonVi(2, 2)})`,
		dauThe.includes(M.demDonVi(2, 2)),
	);
	await chup(t, "E12-danh-sach");
	await bam(t, "[data-nhom-da-bo] button");
	await thayNgay(
		t,
		() => window.__tim("[data-nhom-da-bo] [data-hang-muc-tieu]").length === 2,
	);
	const mo = await anhDanhSach(t);
	kiem(
		"E12",
		`mo dong gap: M3, M4 co dau da bo, chu «Da bo», khong thanh tien do (thay ${JSON.stringify(mo.daBo.map(({ chu, ...r }) => r))})`,
		mo.moNhom === "true" &&
			JSON.stringify(mo.daBo.map((h) => h.id).sort()) ===
				JSON.stringify([K.M3, K.M4].sort()) &&
			mo.daBo.every(
				(h) => h.daBo && h.tienDo === 0 && h.chu.includes(M.trangThai["da-bo"]),
			),
	);
	await chup(t, "E12-da-bo-mo");
	await t.close();
}

async function moNgan(t, mt) {
	await bam(t, `[data-mo-muc-tieu='${mt}']`);
	return thayNgay(
		t,
		() => window.__tim("[data-okr-sheet] [role='tab']").length > 0,
	);
}

async function mucMenu(t) {
	await bam(t, `button[aria-label='${S.menu}']`);
	await thayNgay(t, () => window.__tim("[role='menuitem']").length > 0);
	return t.evaluate(() =>
		window.__tim("[role='menuitem']").map((e) => e.innerText.trim()),
	);
}

async function buocXoa() {
	const t = await moTrang(cookie.truong, DO.rong, duongDonVi());
	await thayNgay(
		t,
		(m) => window.__tim(`[data-mo-muc-tieu='${m}']`).length > 0,
		K.M1,
	);
	kiem("E12", "mo ngan M1", await moNgan(t, K.M1));
	const muc = await mucMenu(t);
	kiem(
		"E12",
		`menu nhap sach co «${S.xoa}», khong «${S.bo}» (thay ${JSON.stringify(muc)})`,
		muc.includes(S.xoa) && !muc.includes(S.bo),
	);
	await chup(t, "E12-menu-nhap-sach");
	await bam(t, "[role='menuitem']", S.xoa);
	await thayNgay(t, () => window.__tim("[role='alertdialog']").length > 0);
	const hop = await t.evaluate(() => {
		const h = window.__tim("[role='alertdialog']")[0];
		return {
			chu: h?.innerText ?? "",
			ten: h?.querySelector("[translate='no']")?.innerText ?? null,
			nutHuy: [...(h?.querySelectorAll("button") ?? [])].map((b) =>
				b.innerText.trim(),
			),
		};
	});
	kiem(
		"E12",
		`hop hoi lai: tieu de, ten (translate=no), so KR, nut «${S.hoiXoa.action}» (thay ${JSON.stringify(hop)})`,
		hop.chu.includes(S.hoiXoa.title) &&
			hop.ten === TEN.M1 &&
			hop.chu.includes(S.hoiXoa.body(1)) &&
			hop.nutHuy.includes(S.hoiXoa.action),
	);
	await chup(t, "E12-hoi-xoa");
	await bam(t, "[role='alertdialog'] button", S.hoiXoa.action);
	const toast = await coToast(t, S.daXoa);
	const dong = await thayNgay(
		t,
		() => window.__tim("[data-okr-sheet]").length === 0,
	);
	const conDong = await thayNgay(
		t,
		(m) => window.__tim(`[data-hang-muc-tieu='${m}']`).length === 0,
		K.M1,
	);
	kiem(
		"E12",
		`sau xoa: toast «${S.daXoa}» ${toast}, ngan dong ${dong}, M1 roi danh sach ${conDong}`,
		toast && dong && conDong,
	);
	await chup(t, "E12-sau-xoa");
	const conM1 = await db.okrObjective.count({ where: { id: K.M1 } });
	const vetXoa = await db.okrTrail.count({
		where: { objectiveId: K.M1, action: "xoa-muc-tieu" },
	});
	console.log(`  E13 DB sau xoa: M1 con ${conM1}, vet xoa-muc-tieu ${vetXoa}`);
	kiem(
		"E13",
		`xoa: M1 con ${conM1} (mong 0), vet xoa-muc-tieu ${vetXoa} (mong 1)`,
		conM1 === 0 && vetXoa === 1,
	);
	await t.close();
}

async function buocDungLai() {
	const t = await moTrang(cookie.truong, DO.rong, duongDonVi());
	await thayNgay(t, () => window.__tim("[data-nhom-da-bo]").length > 0);
	await bam(t, "[data-nhom-da-bo] button");
	await thayNgay(
		t,
		(m) => window.__tim(`[data-mo-muc-tieu='${m}']`).length > 0,
		K.M3,
	);
	kiem("E12", "mo ngan M3", await moNgan(t, K.M3));
	const coNut = await thayNgay(
		t,
		() => window.__tim("[data-nut='dung-lai']").length > 0,
	);
	const muc = await mucMenu(t);
	kiem(
		"E12",
		`ngan da bo: nut «${S.dungLai}» ${coNut}, menu co «${S.xoa}» (thay ${JSON.stringify(muc)})`,
		coNut && muc.includes(S.xoa),
	);
	await chup(t, "E12-ngan-da-bo");
	await t.keyboard.press("Escape");
	await thayNgay(t, () => window.__tim("[role='menuitem']").length === 0);
	await bam(t, "[data-nut='dung-lai']");
	const toast = await coToast(t, S.daDungLai.congBo);
	kiem("E12", `toast dung lai «${S.daDungLai.congBo}»: ${toast}`, toast);
	const m3 = await db.okrObjective.findUnique({
		where: { id: K.M3 },
		select: { status: true, droppedAt: true },
	});
	const vet = await db.okrTrail.count({
		where: { objectiveId: K.M3, action: "dung-lai" },
	});
	console.log(
		`  E13 DB sau dung lai: M3 ${JSON.stringify(m3)}, vet dung-lai ${vet}`,
	);
	kiem(
		"E13",
		`dung lai: M3 doc duoc status «${m3?.status}», droppedAt ${m3?.droppedAt ? "khac null" : "null"}, vet dung-lai ${vet}`,
		m3?.status === "nhap" && m3.droppedAt === null && vet === 1,
	);
	await t.keyboard.press("Escape");
	await thayNgay(t, () => window.__tim("[data-okr-sheet]").length === 0);
	await t.goto(`${APP}/${slug}${duongDonVi()}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	await t
		.waitForNetworkIdle({ idleTime: 500, timeout: DO.choMs })
		.catch(() => null);
	await thayNgay(t, () => window.__tim("[data-nhom-da-bo]").length > 0);
	const a = await anhDanhSach(t);
	const dbBo = await daBoCuaDonVi();
	kiem(
		"E12",
		`sau dung lai: M3 ve danh sach chinh, dong gap «${M.khoiMucTieu.nhomDaBo(1)}» (thay ${JSON.stringify(a)})`,
		a.chinh.some((h) => h.id === K.M3 && !h.daBo) &&
			a.chuNhom === M.khoiMucTieu.nhomDaBo(1),
	);
	kiem(
		"E20",
		`so trong dong gap ${demTrongNhom(a.chuNhom)} khac so muc tieu da bo doc DB ${dbBo}`,
		demTrongNhom(a.chuNhom) === dbBo,
	);
	await chup(t, "E12-sau-dung-lai");
	await t.close();
}

async function buocHep() {
	const t = await moTrang(cookie.truong, DO.hep, duongDonVi());
	await thayNgay(t, () => window.__tim("[data-nhom-da-bo]").length > 0);
	await chup(t, "E12-danh-sach-390");
	await bam(t, "[data-nhom-da-bo] button");
	await thayNgay(
		t,
		() => window.__tim("[data-nhom-da-bo] [data-hang-muc-tieu]").length > 0,
	);
	await chup(t, "E12-da-bo-mo-390");
	await t.close();
}

async function buocCuaToi() {
	const t = await moTrang(cookie.chu, DO.rong, `/okr?kyOkr=${K.quy}`);
	const coNhom = await thayNgay(
		t,
		() => window.__tim("[data-nhom-da-bo]").length > 0,
	);
	const a = await anhDanhSach(t);
	const dbBo = await db.okrObjective.count({
		where: {
			cycleId: K.quy,
			status: "da-bo",
			OR: [
				{ ownerUserId: id.chu },
				{ personUserId: id.chu },
				{ participants: { some: { userId: id.chu } } },
				{ keyResults: { some: { ownerUserId: id.chu } } },
				{ followers: { some: { userId: id.chu } } },
			],
		},
	});
	if (!coNhom) kiem("E21", "cua-toi thieu dong gap", false);
	else
		kiem(
			"E21",
			`cua-toi: so trong dong gap ${demTrongNhom(a.chuNhom)} khac so da bo cua nguoi do doc DB ${dbBo}; chinh khong co da bo (thay ${JSON.stringify(a.chinh)})`,
			demTrongNhom(a.chuNhom) === dbBo &&
				a.moNhom === "false" &&
				a.chinh.every((h) => !h.daBo),
		);
	await chup(t, "E12-cua-toi");
	await t.close();
}

trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);

let metaCu = null;
let doiMeta = false;
let ma = 0;
const bat = Date.now();
try {
	for (const k of Object.keys(NGUOI)) {
		const n = NGUOI[k];
		cookie[k] = phienCua(n.email);
		id[k] = await datNguoi(n.email, n.vai, n.ten);
	}
	const org = await db.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { metadata: true },
	});
	if (!org) throw new Error("kho chua co hang workspace sau dev:session");
	if (!isOnboarded(org.metadata)) {
		metaCu = org.metadata;
		doiMeta = true;
		await db.organization.update({
			where: { id: WORKSPACE_ID },
			data: { metadata: markOnboarded(org.metadata, new Date()) },
		});
	}
	slug = await suySlug(cookie.admin);
	await gieo();
	for (const [ten, buoc] of [
		["danh sach", buocDanhSach],
		["xoa", buocXoa],
		["dung lai", buocDungLai],
		["kho hep", buocHep],
		["cua toi", buocCuaToi],
	]) {
		const b = Date.now();
		await buoc().catch((e) =>
			hong.push(`${ten}: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  ${ten}: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	const coAnh = readdirSync(BANG_CHUNG)
		.filter((f) => f.startsWith("E12-") && f.endsWith(".png"))
		.map((f) => f.slice(0, -4))
		.sort();
	const mong = [...ANH_MONG].sort();
	kiem(
		"E12",
		`tap anh E12: thieu ${JSON.stringify(mong.filter((x) => !coAnh.includes(x)))}, thua ${JSON.stringify(coAnh.filter((x) => !mong.includes(x)))}`,
		JSON.stringify(coAnh) === JSON.stringify(mong),
	);
	kiem(
		"E12",
		`khong loi console (${loiConsole.length}): ${loiConsole.slice(0, 6).join(" || ")}`,
		loiConsole.length === 0,
	);
} catch (e) {
	hong.push(`tien de: nem ${String(e).slice(0, 400)}`);
} finally {
	await donDep().catch((e) => hong.push(`don dep: ${String(e).slice(0, 300)}`));
	if (doiMeta)
		await db.organization
			.update({ where: { id: WORKSPACE_ID }, data: { metadata: metaCu } })
			.catch((e) => hong.push(`tra onboard: ${String(e).slice(0, 200)}`));
	console.log(
		`man-don-okr: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh (${anh.join(", ")}), ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	console.log(`  anh o ${relative(GOC, BANG_CHUNG)}/`);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
}
await ket(ma);
