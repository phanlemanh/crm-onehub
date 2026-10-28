import { execFileSync, spawn } from "node:child_process";
import {
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
const HO_SO = "hop-thoai-giu-cho-dang-nhap";
const BANG_CHUNG =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "evidence");
const LENH_DO = `bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, TEP_NAY)}"`;

const CAY_DO_HOP = {
	nhan: "ban sao dialog.tsx go bo giu o goc va phan noi dung",
	chiBuoc: "1",
	tep: "packages/ui/src/components/dialog.tsx",
	cam: (s) =>
		s
			.replace(
				"open={g.open}\n\t\t\t\tonOpenChange={g.onOpenChange}",
				"open={open}\n\t\t\t\tonOpenChange={onOpenChange}",
			)
			.replace("if (g?.coThayDoi) e.preventDefault();", ""),
	ghim: /buoc 1: hop dong sau khi bam ngoai/,
	conSot: "open={g.open}",
};

const CAY_DO_NGAN = {
	nhan: "ban sao detail-sheet.tsx bo cach tat tu nhan",
	chiBuoc: "7",
	tep: "apps/app/components/detail-sheet.tsx",
	cam: (s) => s.replace(" tuNhanThayDoi={false}", ""),
	ghim: /buoc 7: ngan khong dong sau khi o tu luu/,
	conSot: "tuNhanThayDoi={false}",
};

function readlinkOr(p) {
	try {
		return execFileSync("readlink", [p], { encoding: "utf8" }).trim() || p;
	} catch {
		return p;
	}
}

async function chieuDo(CAY_DO) {
	console.log(`== chieu do: ${CAY_DO.nhan}`);
	const tam = mkdtempSync(join(tmpdir(), "hg-chieu-do-"));
	const sao = join(tam, "crm");
	let con = null;
	const ngat = () => con?.kill("SIGINT");
	process.on("SIGINT", ngat);
	process.on("SIGTERM", ngat);
	let ket = { ma: 2, cau: "chua chay" };
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
		writeFileSync(join(sao, relative(GOC, TEP_NAY)), readFileSync(TEP_NAY));
		const tep = join(sao, CAY_DO.tep);
		const truoc = readFileSync(tep, "utf8");
		const sau = CAY_DO.cam(truoc);
		if (sau === truoc || sau.includes(CAY_DO.conSot)) {
			ket = { ma: 2, cau: `vet khong cam duoc vao ${CAY_DO.tep}` };
			return;
		}
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
		moiTruong.PHIEN_DO_TEN_CAY = "hg-chieu-do";
		moiTruong.CHI_BUOC = CAY_DO.chiBuoc;
		let ra = "";
		const ma = await new Promise((xong) => {
			con = spawn("bash", ["-c", LENH_DO], {
				cwd: sao,
				env: moiTruong,
				stdio: ["ignore", "pipe", "pipe"],
			});
			const ghi = (b) => {
				ra += b.toString();
				process.stdout.write(b);
			};
			con.stdout.on("data", ghi);
			con.stderr.on("data", ghi);
			con.on("error", () => xong(2));
			con.on("exit", (m) => xong(m ?? 2));
		});
		const ghim = ra.match(CAY_DO.ghim)?.[0] ?? null;
		if (ma === 2) ket = { ma: 2, cau: "ban sao thoat ma 2 (tien de thieu)" };
		else if (ma === 1 && ghim)
			ket = { ma: 0, cau: `DO DUNG GHIM: ma 1, in «${ghim}»` };
		else
			ket = {
				ma: 1,
				cau: `LOT: ma ${ma}, ${ghim ? "co ghim" : `khong thay ${CAY_DO.ghim}`}`,
			};
	} finally {
		process.off("SIGINT", ngat);
		process.off("SIGTERM", ngat);
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
		console.log(`chieu do: ${ket.cau}`);
		process.exit(ket.ma);
	}
}

if (process.argv.includes("--chieu-do-ngan")) await chieuDo(CAY_DO_NGAN);
if (process.argv.includes("--chieu-do")) await chieuDo(CAY_DO_HOP);

const { default: puppeteer } = await import("puppeteer-core");
const { db } = await import("../../../packages/db/src/index.ts");
const { WORKSPACE_ID } = await import("../../../packages/db/src/workspace.ts");
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const { API, APP, CHO_TAI, CHROME, chiaCookie, khongDo, suySlug } =
	await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");

const RONG = 1440;
const HEP = 390;
const CHO = 30_000;
const MA = `g${Date.now().toString(36).slice(-6)}`;
const CHI_BUOC = new Set(
	(process.env.CHI_BUOC ?? "").split(",").filter(Boolean),
);
const chay = (n) => CHI_BUOC.size === 0 || CHI_BUOC.has(String(n));
const LOI_BO_QUA = /Download the React DevTools/;

const CHU = {
	hoi: "Bỏ những gì vừa nhập?",
	tiepTuc: "Tiếp tục sửa",
	bo: "Bỏ",
	themKr: "Thêm KR",
	menuMucTieu: "Thao tác với mục tiêu",
	suaMucTieu: "Sửa mục tiêu",
	suaKr: "Sửa",
	traoDoi: "Trao đổi",
	thoaThuanMoi: "Thoả thuận mới",
	themBoPhan: "Thêm bộ phận",
	menuDonVi: "Thao tác với {ten}",
	chuyenDonVi: "Chuyển sang bộ phận khác",
	huy: "Huỷ",
	chucDanh: "Chức danh",
};

mkdirSync(BANG_CHUNG, { recursive: true });
const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const ngayVN = (d) =>
	new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
const HOM_NAY = ngayVN(new Date());
const NAM = Number(HOM_NAY.slice(0, 4));
const QUY = Math.ceil(Number(HOM_NAY.slice(5, 7)) / 3);
const pad = (n) => String(n).padStart(2, "0");
const ngay = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

const NGUOI = {
	admin: { email: `a${MA}@thu.test`, vai: "admin", ten: "Nguyễn Minh An" },
	truong: { email: `t${MA}@thu.test`, vai: "member", ten: "Phạm Thu Lan" },
};
const TEN = {
	P: `Phòng Kinh doanh ${MA}`,
	BP: `Khối Kinh doanh ${MA}`,
	A: "Mở rộng tệp khách hàng doanh nghiệp",
	Ka: "Hợp đồng mới với khách doanh nghiệp",
	B: "Phòng Kinh doanh chốt thêm hợp đồng quý này",
	Kb: "Hợp đồng chốt được trong quý",
	krGo: "Buổi gặp khách hàng mới",
	dealGo: "Hợp đồng kho lạnh Cần Thơ",
	traoDoiGo: "Tuần này chốt thêm hai hợp đồng ở Hải Phòng",
	lienHe: `Lan ${MA}`,
	chucDanh: "Trưởng phòng mua hàng",
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

async function datNguoi(email, vai, ten) {
	const n = await db.user.update({
		where: { email },
		data: { name: ten },
		select: { id: true },
	});
	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId: n.id },
		},
		create: {
			id: `member-${n.id}`,
			organizationId: WORKSPACE_ID,
			userId: n.id,
			role: vai,
			createdAt: new Date(),
		},
		update: { role: vai },
	});
	await db.session.updateMany({
		where: { userId: n.id },
		data: { activeOrganizationId: WORKSPACE_ID },
	});
	return n.id;
}

const mu = (c) => ({ Cookie: `${c.ten}=${c.gia}; lang=vi` });
async function lam(c, duong, vao) {
	const r = await fetch(`${API}/api/trpc/${duong}`, {
		method: "POST",
		headers: { ...mu(c), "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	const t = await r.text();
	if (!r.ok) throw new Error(`${duong} tra ${r.status}: ${t.slice(0, 300)}`);
	return JSON.parse(t).result.data;
}

const cookie = {};
const id = {};
const K = {};

async function gieo() {
	const a = cookie.admin;
	const c = cookie.truong;
	await lam(a, "org.createDivision", { name: TEN.BP });
	const pb = await lam(a, "org.createDepartment", {
		name: TEN.P,
		divisionId: null,
	});
	K.P = pb.id;
	await lam(a, "org.setPlacement", {
		userId: id.truong,
		primaryDepartmentId: K.P,
		secondaryDepartmentIds: [],
		managerUserId: null,
	});
	await lam(a, "org.setHead", {
		kind: "department",
		id: K.P,
		userId: id.truong,
	});
	const nam = await lam(a, "okr.createCycle", {
		kind: "nam",
		name: `Năm ${NAM} ${MA}`,
		parentId: null,
		startsOn: ngay(NAM, 1, 1),
		endsOn: ngay(NAM, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	const quy = await lam(a, "okr.createCycle", {
		kind: "quy",
		name: `Quý ${QUY}/${NAM} ${MA}`,
		parentId: nam.id,
		startsOn: ngay(NAM, QUY * 3 - 2, 1),
		endsOn: ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3)),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	await lam(a, "okr.setCyclePhase", { id: quy.id, phase: "dang-chay" });
	const donVi = { level: "phong-ban", departmentId: K.P };
	const taoMt = (title) =>
		lam(c, "okr.createObjective", {
			cycleId: quy.id,
			unit: donVi,
			title,
			kind: "cam-ket",
			ownerUserId: id.truong,
			participantIds: [],
			whyNow: "",
		});
	const taoKr = (objectiveId, title) =>
		lam(c, "okr.createKeyResult", {
			objectiveId,
			title,
			kind: "tang-toi",
			ownerUserId: id.truong,
			startValue: 0,
			targetValue: 10,
			currentValue: 0,
			unit: "hợp đồng",
			dueOn: null,
			weight: 1,
		});
	K.A = (await taoMt(TEN.A)).id;
	K.Ka = (await taoKr(K.A, TEN.Ka)).id;
	K.B = (await taoMt(TEN.B)).id;
	K.Kb = (await taoKr(K.B, TEN.Kb)).id;
	await lam(c, "okr.publishObjective", { id: K.B });
	K.lienHe = (
		await lam(a, "contacts.create", { firstName: TEN.lienHe, lastName: "Võ" })
	).id;
}

const hong = [];
const loiConsole = [];
let trinhDuyet = null;
let slug = "";
const cho = (ms) => new Promise((r) => setTimeout(r, ms));
const dat = (n, dung, cau) => {
	console.log(`buoc ${n}: ${dung ? "dat" : cau}`);
	if (!dung) hong.push(`buoc ${n}: ${cau}`);
	return dung;
};

async function moTrang(c, rong, duong) {
	const t = await trinhDuyet.newPage();
	t.on("pageerror", (e) =>
		loiConsole.push(`${duong}: pageerror ${String(e).slice(0, 200)}`),
	);
	t.on("console", (m) => {
		if (m.type() !== "error") return;
		const s = m.text();
		if (LOI_BO_QUA.test(s)) return;
		loiConsole.push(`${duong}: console.error ${s.slice(0, 200)}`);
	});
	await t.evaluateOnNewDocument(() => {
		window.__hien = (e) =>
			e.checkVisibility() ||
			(getComputedStyle(e).display === "contents" &&
				(e.parentElement?.checkVisibility() ?? false));
		window.__tim = (s) =>
			[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
		window.__theoChu = (s, chu) =>
			window
				.__tim(s)
				.filter((e) => (e.innerText ?? e.textContent ?? "").trim() === chu);
	});
	await t.setViewport({
		width: rong,
		height: rong < 500 ? 844 : 900,
		deviceScaleFactor: 1,
		isMobile: rong < 500,
		hasTouch: rong < 500,
	});
	const host = new URL(APP).hostname;
	await t.setCookie(
		{ name: c.ten, value: c.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	trangCuoi = t;
	await t.goto(`${APP}/${slug}${duong}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO }).catch(() => null);
	await cho(1200);
	await t.evaluate(() =>
		document
			.querySelectorAll("nextjs-portal, [data-nextjs-toast]")
			.forEach((e) => e.remove()),
	);
	return t;
}

let trangCuoi = null;
async function doi(t, ham, ...doiSo) {
	try {
		await t.waitForFunction(ham, { timeout: CHO }, ...doiSo);
	} catch {
		throw new Error(
			`het ${CHO} ms cho: ${doiSo.map(String).join(" · ") || String(ham).slice(0, 120)}`,
		);
	}
}
const coHien = (t, s) => t.evaluate((s) => window.__tim(s).length, s);
async function bamChu(t, s, chu) {
	await doi(t, (s, chu) => window.__theoChu(s, chu).length > 0, s, chu);
	const el = await t.evaluateHandle(
		(s, chu) => window.__theoChu(s, chu).at(-1),
		s,
		chu,
	);
	await el.click();
	await cho(500);
}
async function bamSel(t, s) {
	await doi(t, (s) => window.__tim(s).length > 0, s);
	const el = await t.evaluateHandle((s) => window.__tim(s).at(-1), s);
	await el.click();
	await cho(500);
}
const HOP = "[data-slot='dialog-content']";
const NGAN = ":is([data-slot='sheet-content'],[data-slot='drawer-content'])";
const HOI = "[role='alertdialog']";
async function goVao(t, s, chu) {
	await doi(t, (s) => window.__tim(s).length > 0, s);
	const el = await t.evaluateHandle((s) => window.__tim(s).at(-1), s);
	await el.click();
	await t.keyboard.type(chu, { delay: 10 });
	await cho(300);
}
const giaTri = (t, s) =>
	t.evaluate((s) => window.__tim(s).at(-1)?.value ?? null, s);
async function bamNgoai(t) {
	const vp = t.viewport();
	await t.mouse.click(6, vp.height - 6);
	await cho(700);
}
async function chup(t, ten) {
	await cho(300);
	await t.screenshot({ path: join(BANG_CHUNG, ten) });
	console.log(`  anh ${ten}`);
}
async function hoiDung(t) {
	return t.evaluate(
		(HOI, c) => {
			const h = window.__tim(HOI).at(-1);
			if (!h) return "khong co hop hoi";
			const txt = h.innerText;
			for (const x of [c.hoi, c.tiepTuc, c.bo])
				if (!txt.includes(x)) return `hop hoi thieu «${x}»`;
			return "ok";
		},
		HOI,
		CHU,
	);
}

async function moMucTieu(c, rong, idMt) {
	const t = await moTrang(c, rong, `/okr?record=objective:${idMt}`);
	await doi(t, (s) => window.__tim(s).length > 0, NGAN);
	await cho(800);
	return t;
}

async function buoc1va2() {
	const t = await moMucTieu(cookie.truong, RONG, K.A);
	await doi(
		t,
		(s) => window.__tim(s).length > 0,
		`${NGAN} [data-nut='them-kr']`,
	);
	await bamSel(t, `${NGAN} [data-nut='them-kr']`);
	const o = `[data-hop-thoai-kr='moi'] input[id$='-ten']`;
	await goVao(t, o, TEN.krGo);
	await bamNgoai(t);
	const con = await coHien(t, "[data-hop-thoai-kr='moi']");
	const chu = await giaTri(t, o);
	const hoi = await coHien(t, HOI);
	await chup(t, "hg-kr-giu.png");
	dat(
		1,
		con > 0 && chu === TEN.krGo && hoi === 0,
		con > 0
			? `hop con nhung chu=«${chu}» hoi=${hoi}`
			: "hop dong sau khi bam ngoai",
	);
	if (!chay(2)) return t.close();
	const truoc = await db.okrKeyResult.count({ where: { objectiveId: K.A } });
	await t.keyboard.press("Escape");
	await cho(700);
	const kq = await hoiDung(t);
	await chup(t, "hg-hoi-lai-1440.png");
	let ok = kq === "ok";
	let cau = kq;
	if (ok) {
		await bamChu(t, `${HOI} button`, CHU.tiepTuc);
		await cho(600);
		const focus = await t.evaluate(
			(o) => document.activeElement === window.__tim(o).at(-1),
			o,
		);
		const vanCon = await coHien(t, "[data-hop-thoai-kr='moi']");
		if (!focus || !vanCon) {
			ok = false;
			cau = `sau Tiep tuc sua: focus ve o=${focus}, hop con=${vanCon > 0}`;
		}
	}
	if (ok) {
		await t.keyboard.press("Escape");
		await cho(600);
		await bamChu(t, `${HOI} button`, CHU.bo);
		await cho(900);
		const conHop = await coHien(t, "[data-hop-thoai-kr='moi']");
		const sau = await db.okrKeyResult.count({ where: { objectiveId: K.A } });
		if (conHop > 0 || sau !== truoc) {
			ok = false;
			cau = `sau Bo: hop con=${conHop > 0}, KR ${truoc}→${sau}`;
		}
	}
	dat(2, ok, cau);
	await t.close();
}

async function buoc3() {
	const t = await moTrang(cookie.truong, RONG, "/deals");
	await bamChu(t, "button", CHU.thoaThuanMoi);
	await doi(t, (s) => window.__tim(s).length > 0, `${NGAN} input`);
	await goVao(t, `${NGAN} input`, TEN.dealGo);
	await bamChu(t, `${NGAN} button`, CHU.huy);
	await cho(600);
	const kq = await hoiDung(t);
	const con = await coHien(t, NGAN);
	await chup(t, "hg-deal-huy.png");
	dat(3, kq === "ok" && con > 0, kq === "ok" ? "ngan dong du hoi" : kq);
	if (kq === "ok") await bamChu(t, `${HOI} button`, CHU.bo);
	await t.close();
}

async function buoc4va5() {
	const t = await moTrang(cookie.truong, HEP, `/okr?record=objective:${K.B}`);
	await doi(t, () => window.__tim("[data-slot='drawer-content']").length > 0);
	await cho(800);
	await bamChu(
		t,
		"[data-slot='drawer-content'] [role='tab'], [data-slot='drawer-content'] button",
		CHU.traoDoi,
	);
	const o = "[data-slot='drawer-content'] textarea";
	await goVao(t, o, TEN.traoDoiGo);
	await t.keyboard.press("Escape");
	await cho(700);
	let kq = await hoiDung(t);
	let con = await coHien(t, "[data-slot='drawer-content']");
	await chup(t, "hg-drawer-390.png");
	dat(
		4,
		kq === "ok" && con > 0 && (await giaTri(t, o)) === TEN.traoDoiGo,
		kq === "ok" ? "drawer dong hoac mat chu" : kq,
	);
	if (kq === "ok") await bamChu(t, `${HOI} button`, CHU.tiepTuc);
	await cho(600);
	if (!chay(5)) return t.close();
	const khung = await t.evaluate(() => {
		const r = window
			.__tim("[data-slot='drawer-content']")
			.at(-1)
			.getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + 14 };
	});
	await t.touchscreen.touchStart(khung.x, khung.y);
	for (let i = 1; i <= 16; i += 1) {
		await t.touchscreen.touchMove(khung.x, khung.y + i * 20);
		await cho(16);
	}
	await t.touchscreen.touchEnd();
	await cho(900);
	kq = await hoiDung(t);
	const vitri = await t.evaluate(() => {
		const r = window
			.__tim("[data-slot='drawer-content']")
			.at(-1)
			?.getBoundingClientRect();
		return r ? r.top >= 0 && r.bottom <= window.innerHeight + 1 : false;
	});
	con = await coHien(t, "[data-slot='drawer-content']");
	await chup(t, "hg-drawer-vuot-390.png");
	let ok =
		kq === "ok" && vitri && con > 0 && (await giaTri(t, o)) === TEN.traoDoiGo;
	let cau =
		kq !== "ok"
			? `vuot qua nguong: ${kq}`
			: `drawer trong man=${vitri}, con=${con > 0}`;
	if (ok) {
		await bamChu(t, `${HOI} button`, CHU.tiepTuc);
		await cho(700);
		const bamDuoc = await t.evaluate((o) => {
			const e = window.__tim(o).at(-1);
			const r = e.getBoundingClientRect();
			return (
				document.elementFromPoint(
					r.left + r.width / 2,
					r.top + r.height / 2,
				) === e
			);
		}, o);
		if (!bamDuoc) {
			ok = false;
			cau = "sau Tiep tuc sua trang khong bam duoc vao o trao doi";
		}
	}
	dat(5, ok, cau);
	await t.close();
}

async function doiMotOChon(t, hop) {
	return t.evaluate(async (hop) => {
		const cho = (ms) => new Promise((r) => setTimeout(r, ms));
		const h = window.__tim(hop).at(-1);
		const nut = [...h.querySelectorAll("button[role='combobox']")].find(
			(e) => window.__hien(e) && !e.disabled,
		);
		if (nut) {
			const truoc = nut.innerText.trim();
			nut.dispatchEvent(
				new PointerEvent("pointerdown", {
					bubbles: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
			nut.click();
			await cho(500);
			const lua = window
				.__tim("[role='option']")
				.find(
					(o) =>
						o.getAttribute("aria-selected") !== "true" &&
						o.getAttribute("data-disabled") === null,
				);
			if (!lua) return { ok: false, cau: "khong co lua chon khac" };
			lua.click();
			await cho(500);
			return { ok: true, truoc, sau: nut.innerText.trim() };
		}
		const bat = [
			...h.querySelectorAll(
				"[role='radio'][data-state='off'], button[aria-pressed='false']",
			),
		].find((e) => window.__hien(e) && !e.disabled);
		if (bat) {
			bat.click();
			await cho(400);
			return {
				ok: true,
				truoc: "off",
				sau: bat.getAttribute("data-state") ?? bat.getAttribute("aria-pressed"),
			};
		}
		return { ok: false, cau: "hop khong co o chon nao" };
	}, hop);
}

async function buoc6() {
	const ca = [];
	const kiemHop = async (ten, t, hop) => {
		await doi(t, (s) => window.__tim(s).length > 0, hop);
		const d = await doiMotOChon(t, hop);
		if (!d.ok) return ca.push(`${ten}: ${d.cau}`);
		await bamNgoai(t);
		const con = await coHien(t, hop);
		const hoi = await coHien(t, HOI);
		if (con === 0)
			ca.push(`${ten}: hop dong sau khi chi doi o chon (${d.truoc}→${d.sau})`);
		else if (hoi > 0) ca.push(`${ten}: bam ngoai ma hoi`);
	};
	let t = await moMucTieu(cookie.truong, RONG, K.A);
	await bamSel(t, `${NGAN} button[aria-label='Thao tác với ${TEN.Ka}']`);
	await bamChu(t, "[role='menuitem']", CHU.suaKr);
	await kiemHop("hop KR", t, `[data-hop-thoai-kr='${K.Ka}']`);
	await chup(t, "hg-kr-chi-doi-o-chon.png");
	await t.close();
	t = await moMucTieu(cookie.truong, RONG, K.A);
	await bamSel(t, `${NGAN} button[aria-label='${CHU.menuMucTieu}']`);
	await bamChu(t, "[role='menuitem']", CHU.suaMucTieu);
	await kiemHop("hop muc tieu", t, "[data-hop-thoai-muc-tieu]");
	await chup(t, "hg-muc-tieu-chi-doi-o-chon.png");
	await t.close();
	t = await moTrang(cookie.admin, RONG, `/settings/organization?don=pb:${K.P}`);
	await bamChu(t, "button", CHU.menuDonVi.replace("{ten}", TEN.P));
	await bamChu(t, "[role='menuitem']", CHU.chuyenDonVi);
	await kiemHop("hop don vi", t, HOP);
	await chup(t, "hg-don-vi-chi-doi-o-chon.png");
	await t.close();
	dat(6, ca.length === 0, ca.join(" · "));
}

async function buoc7() {
	const t = await moTrang(cookie.admin, RONG, "/contacts");
	await doi(
		t,
		(ten) => window.__tim("tbody tr").some((r) => r.innerText.includes(ten)),
		TEN.lienHe,
	);
	const hang = await t.evaluateHandle(
		(ten) => window.__tim("tbody tr").find((r) => r.innerText.includes(ten)),
		TEN.lienHe,
	);
	await hang.click();
	await doi(t, (s) => window.__tim(s).length > 0, NGAN);
	await cho(800);
	const nut = await t.evaluateHandle(
		(ngan, nhan) =>
			window
				.__tim(`${ngan} label`)
				.find((l) => l.innerText.trim() === nhan)
				?.parentElement?.querySelector("button"),
		NGAN,
		CHU.chucDanh,
	);
	if (!nut.asElement()) throw new Error("khong thay o Chuc danh trong ngan");
	await nut.click();
	await doi(t, (s) => window.__tim(s).length > 0, `${NGAN} input:focus`);
	await t.keyboard.type(TEN.chucDanh, { delay: 10 });
	await t.keyboard.press("Tab");
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO }).catch(() => null);
	await doi(
		t,
		(ngan, chu) =>
			window.__tim(`${ngan} button`).some((b) => b.innerText.trim() === chu),
		NGAN,
		TEN.chucDanh,
	);
	await chup(t, "hg-ngan-ban-ghi-tu-luu.png");
	await bamNgoai(t);
	await cho(600);
	const con = await coHien(t, NGAN);
	const hoi = await coHien(t, HOI);
	await chup(t, "hg-ngan-ban-ghi-da-dong.png");
	dat(
		7,
		con === 0 && hoi === 0,
		`ngan khong dong sau khi o tu luu (con=${con}, hoi=${hoi})`,
	);
	await t.close();
}

let ma = 0;
try {
	for (const k of Object.keys(NGUOI)) {
		cookie[k] = phienCua(NGUOI[k].email);
		id[k] = await datNguoi(NGUOI[k].email, NGUOI[k].vai, NGUOI[k].ten);
	}
	slug = await suySlug(cookie.admin);
	await gieo();
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
		args: ["--lang=vi-VN"],
	});
	const buoc = [
		[[1, 2], buoc1va2],
		[[3], buoc3],
		[[4, 5], buoc4va5],
		[[6], buoc6],
		[[7], buoc7],
	];
	for (const [so, ham] of buoc) {
		if (!so.some(chay)) continue;
		await ham().catch(async (e) => {
			await trangCuoi
				?.screenshot({
					path: join(BANG_CHUNG, `hg-loi-buoc-${so.join("-")}.png`),
				})
				.catch(() => null);
			hong.push(`buoc ${so.join("/")}: nem ${String(e).slice(0, 300)}`);
			console.log(`buoc ${so.join("/")}: nem ${String(e).slice(0, 300)}`);
		});
	}
	if (loiConsole.length > 0) {
		console.log(`loi console app: ${loiConsole.length}`);
		for (const l of loiConsole.slice(0, 10)) console.log(`  ${l}`);
		hong.push("loi console app");
	}
	ma = hong.length === 0 ? 0 : 1;
	console.log(
		ma === 0 ? "man-giu-cho: dat" : `man-giu-cho: hong ${hong.length}`,
	);
} catch (e) {
	console.log(`KHONG DO DUOC: ${String(e).slice(0, 400)}`);
	ma = 2;
} finally {
	await trinhDuyet?.close();
}
process.exit(ma);
