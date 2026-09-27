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
const HO_SO = "khep-ky-okr";
const BANG_CHUNG =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "evidence");
const MOI_EVAL = ["E3", "E4", "E7"];
const LENH_DO =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khep-ky-okr/rang/man-khep-ky.mjs"';

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
const chon = (evals) => CHON.size === 0 || evals.some((e) => CHON.has(e));

const TEP_HOP = "apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx";
const VET = {
	E3: {
		tep: TEP_HOP,
		mo: "ban sao hop thoai KR khoa Luu khi co cau hoi chat luong",
		cam: (s) =>
			s.replace(
				"disabled={dangLuu || !sanSang || !daSua || (canLyDo && !lyDoDu)}",
				"disabled={dangLuu || !sanSang || !daSua || (canLyDo && !lyDoDu) || hoi.length > 0}",
			),
		ghim: /câu hỏi chặn lưu/,
	},
	E4: {
		tep: "apps/api/src/okr/okr.service.ts",
		mo: "ban sao createKeyResult goi kiemOkr va nem khi co ma",
		cam: (s) =>
			s.replace(
				"\t\t\tthis.assertSoTheoKieu(input.kind, input.startValue, input.targetValue);\n\t\t\tawait this.assertThanhVien(tx, [input.ownerUserId]);",
				'\t\t\tthis.assertSoTheoKieu(input.kind, input.startValue, input.targetValue);\n\t\t\tconst { kiemOkr: kiemChieuDo } = await import("@crm/validation/okr-kiem");\n\t\t\tconst hoiChieuDo = kiemChieuDo({ title: "", whyNow: "", keyResults: [{ title: input.title, kind: input.kind, startValue: input.startValue, targetValue: input.targetValue }] });\n\t\t\tif (hoiChieuDo.length > 0) throw new BadRequestException(`Luật chất lượng chặn: ${hoiChieuDo.map((h) => h.ma).join(", ")}`);\n\t\t\tawait this.assertThanhVien(tx, [input.ownerUserId]);',
			),
		ghim: /máy chủ từ chối: Luật chất lượng chặn: [a-z-, ]+/,
	},
	E7: {
		tep: TEP_HOP,
		mo: "ban sao hop thoai KR luon an o ly do doi dich",
		cam: (s) =>
			s.replace(
				"{canLyDo ? (\n\t\t\t\t\t\t\t\t<Field data-o-ly-do-dich>",
				"{false ? (\n\t\t\t\t\t\t\t\t<Field data-o-ly-do-dich>",
			),
		ghim: /thiếu ô lý do/,
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
	const tam = mkdtempSync(join(tmpdir(), "khep-ky-chieu-do-"));
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
		moiTruong.EVAL = e;
		moiTruong.PHIEN_DO_TEN_CAY = "khep-ky-chieu-do";
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
				cau: "ban sao thoat ma 2 (tien de thieu), khong ket luan duoc",
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

async function chieuDo() {
	const danhSach = CHON.size === 0 ? MOI_EVAL : [...CHON];
	const ket = [];
	for (const e of danhSach) ket.push(await motChieuDo(e));
	console.log("\nchieu do — tong ket:");
	for (const k of ket) console.log(`  ${k.e}: ${k.ket} — ${k.cau}`);
	if (ket.some((k) => k.ket === "KHONG DO DUOC")) process.exit(2);
	process.exit(ket.every((k) => k.ket === "DO DUNG GHIM") ? 0 : 1);
}

if (process.argv.includes("--chieu-do")) await chieuDo();

const { default: puppeteer } = await import("puppeteer-core");
const { db } = await import("../../../packages/db/src/index.ts");
const { isOnboarded, markOnboarded, WORKSPACE_ID } = await import(
	"../../../packages/db/src/workspace.ts"
);
const { formatDay } = await import("../../../packages/ui/src/lib/format.ts");
const { okrKhepMessages } = await import(
	"../../../apps/app/lib/messages/okr-khep.ts"
);
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

const DO = {
	rong: 1440,
	hep: 390,
	cao: 900,
	choMs: 30_000,
	choHydrateMs: 800,
	choKhongHienMs: 1500,
};
const MA = `k${Date.now().toString(36).slice(-6)}`;
const LOI_BO_QUA = /Download the React DevTools/;
const CHU = okrKhepMessages("vi");

console.log(
	CHON.size === 0
		? `man-khep-ky: chay tron ${MOI_EVAL.length} eval; chay rieng: --chi E3 (ma: ${MOI_EVAL.join(", ")}); chieu do: --chieu-do`
		: `man-khep-ky: chi chay ${[...CHON].join(", ")}${process.env.CHIEU_DO ? ` (ban sao chieu do ${process.env.CHIEU_DO})` : ""}`,
);

mkdirSync(BANG_CHUNG, { recursive: true });

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const chuKySan = await db.okrCycle.count();
if (chuKySan > 0)
	await khongDo(
		`KHONG DO DUOC: tien de thieu — kho da co ${chuKySan} chu ky OKR ngoai fixture.`,
		"    Thuoc can kho khong co chu ky nao de ky dang chay la ky cua fixture.",
	);

const ngayVN = (d) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
const HOM_NAY = ngayVN(new Date());
const NAM = Number(HOM_NAY.slice(0, 4));
const QUY = Math.ceil(Number(HOM_NAY.slice(5, 7)) / 3);
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const DAU_QUY = ngay(NAM, QUY * 3 - 2, 1);
const CUOI_QUY = ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3));

const NGUOI = {
	admin: { email: `a${MA}@thu.test`, vai: "admin", ten: "Nguyễn Minh An" },
	truong: { email: `t${MA}@thu.test`, vai: "member", ten: "Phạm Thu Lan" },
	docOnly: { email: `d${MA}@thu.test`, vai: "member", ten: "Lê Văn Đọc" },
};

const TEN = {
	P: `Phòng Đối tác khép kỳ ${MA}`,
	N: "Đối tác mới được đỡ trọn tháng đầu",
	M: "Mở rộng mạng lưới đối tác khu phía Nam",
	krHoi: "Gọi điện chào mừng mọi đối tác mới",
	k1: "Thoả thuận mới trong quý",
	k2: "Cuộc gọi chiến dịch hẹn được",
	k3: "Đối tác mới ký hợp tác",
	lyDo: "Khách đổi kế",
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
const G = { ky: [], pb: [], mt: [], kr: [], ra: [] };
const K = {};

let khang = 0;
const hong = [];
const anh = [];
const mang = [];
const loiConsole = [];
let nhom = "";
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
	return dat;
};
const cho = (ms) => new Promise((r) => setTimeout(r, ms));
let slug = "";
let trinhDuyet = null;

async function gieo() {
	const pb = await lam(cookie.admin, "org.createDepartment", {
		name: TEN.P,
		divisionId: null,
	});
	G.pb.push(pb.id);
	K.P = pb.id;
	await lam(cookie.admin, "org.setPlacement", {
		userId: id.truong,
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
		name: `Năm ${NAM} ${MA}`,
		parentId: null,
		startsOn: ngay(NAM, 1, 1),
		endsOn: ngay(NAM, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(nam.id);
	const quy = await lam(cookie.admin, "okr.createCycle", {
		kind: "quy",
		name: `Quý ${QUY}/${NAM} ${MA}`,
		parentId: nam.id,
		startsOn: DAU_QUY,
		endsOn: CUOI_QUY,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(quy.id);
	K.quy = quy.id;
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: quy.id,
		phase: "dang-chay",
	});

	const c = cookie.truong;
	const donVi = { level: "phong-ban", departmentId: K.P };
	const taoMt = async (khoa, title) => {
		const r = await lam(c, "okr.createObjective", {
			cycleId: K.quy,
			unit: donVi,
			title,
			kind: "tham-vong",
			ownerUserId: id.truong,
			participantIds: [],
			whyNow: "",
		});
		G.mt.push(r.id);
		K[khoa] = r.id;
	};
	await taoMt("N", TEN.N);
	await taoMt("M", TEN.M);
	for (const [khoa, title, khoi, dich] of [
		["k1", TEN.k1, 12, 30],
		["k2", TEN.k2, 40, 120],
		["k3", TEN.k3, 5, 15],
	]) {
		const r = await lam(c, "okr.createKeyResult", {
			objectiveId: K.M,
			title,
			kind: "tang-toi",
			ownerUserId: id.truong,
			startValue: khoi,
			targetValue: dich,
			currentValue: khoi,
			unit: "",
			dueOn: null,
			weight: 1,
		});
		G.kr.push(r.id);
		K[khoa] = r.id;
	}
	let congBoLoi = null;
	await lam(c, "okr.publishObjective", { id: K.M }).catch((e) => {
		congBoLoi = String(e).slice(0, 300);
	});
	const mt = await db.okrObjective.findUnique({
		where: { id: K.M },
		select: { status: true },
	});
	if (chon(["E4"])) {
		kiem(
			`E4: publishObjective muc tieu ba KR tang toi phai tra thanh cong (loi: ${congBoLoi})`,
			congBoLoi === null,
		);
		kiem(
			`E4: DB doc status cong-bo sau cong bo (thay ${mt?.status})`,
			mt?.status === "cong-bo",
		);
	}
	console.log(
		`  gieo: quy ${K.quy} ${DAU_QUY}..${CUOI_QUY}, N=${K.N} (nhap), M=${K.M} (${mt?.status}, 3 KR tang toi)`,
	);
}

async function donDep() {
	const kr = (
		await db.okrKeyResult.findMany({
			where: { objectiveId: { in: G.mt } },
			select: { id: true },
		})
	).map((r) => r.id);
	const moiKr = [...new Set([...G.kr, ...kr])];
	const nguoi = Object.values(id);
	await db.okrDoiDich.deleteMany({ where: { keyResultId: { in: moiKr } } });
	await db.okrDiemKr.deleteMany({ where: { keyResultId: { in: moiKr } } });
	await db.okrNhinLai.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrCuaSoRa.deleteMany({ where: { cycleId: { in: G.ky } } });
	await db.okrSoChup.deleteMany({ where: { keyResultId: { in: moiKr } } });
	await db.okrNguonKr.deleteMany({ where: { keyResultId: { in: moiKr } } });
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ cycleId: { in: G.ky } },
				{ objectiveId: { in: G.mt } },
				{ actorUserId: { in: nguoi } },
			],
		},
	});
	await db.okrCheckIn.deleteMany({ where: { keyResultId: { in: moiKr } } });
	await db.okrCheckInSession.deleteMany({ where: { userId: { in: nguoi } } });
	await db.okrMention.deleteMany({
		where: { comment: { objectiveId: { in: G.mt } } },
	});
	await db.okrComment.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrFollow.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrAlignment.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrKeyResult.deleteMany({ where: { id: { in: moiKr } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: G.mt } } });
	await db.okrCycle.deleteMany({ where: { id: { in: G.ky }, kind: "quy" } });
	await db.okrCycle.deleteMany({ where: { id: { in: G.ky } } });
	await db.orgSecondaryDepartment.deleteMany({
		where: { OR: [{ departmentId: { in: G.pb } }, { userId: { in: nguoi } }] },
	});
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
	await db.zaloLink.deleteMany({ where: { crmUserId: { in: nguoi } } });
	await db.session.deleteMany({ where: { userId: { in: nguoi } } });
	await db.member.deleteMany({ where: { userId: { in: nguoi } } });
	await db.user.deleteMany({ where: { id: { in: nguoi } } });
}

async function moTrang(c, rong, duong) {
	const trang = await trinhDuyet.newPage();
	const ghi = (d) => mang.push(`${new Date().toISOString()} ${d}`);
	const tenNhom = nhom;
	trang.on("pageerror", (e) => {
		ghi(`pageerror ${String(e).slice(0, 3000)}`);
		loiConsole.push(
			`${tenNhom} ${duong}: pageerror ${String(e).slice(0, 200)}`,
		);
	});
	trang.on("console", (m) => {
		if (m.type() !== "error") return;
		const t = m.text();
		ghi(`console.error ${t.slice(0, 300)}`);
		if (LOI_BO_QUA.test(t)) return;
		if (process.env.CHIEU_DO && /status of 400/.test(t)) return;
		loiConsole.push(`${tenNhom} ${duong}: console.error ${t.slice(0, 200)}`);
	});
	trang.on("requestfailed", (r) =>
		ghi(`requestfailed ${r.url()} ${r.failure()?.errorText ?? ""}`),
	);
	trang.on("response", (r) => {
		if (r.status() >= 400)
			ghi(`${r.status()} ${r.request().method()} ${r.url()}`);
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

async function doi(trang, nhan, fn, ...doiSo) {
	const ra = await trang
		.waitForFunction(fn, { timeout: DO.choMs, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);
	return kiem(`${nhan}: het ${DO.choMs}ms van chua thay`, ra);
}

const thayNgay = (trang, fn, ...doiSo) =>
	trang
		.waitForFunction(fn, { timeout: DO.choMs, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);

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

async function bam(trang, sel) {
	await trang.bringToFront();
	const tay = await trang.evaluateHandle(
		(s) => window.__tim(s)[0] ?? null,
		sel,
	);
	const el = tay.asElement();
	if (!el) return kiem(`khong thay ${sel} de bam`, false);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}

async function go(trang, sel, chu) {
	const tay = await trang.evaluateHandle(
		(s) => window.__tim(s)[0] ?? null,
		sel,
	);
	const el = tay.asElement();
	if (!el) return kiem(`khong thay o ${sel} de go`, false);
	await el.focus();
	await el.evaluate((e) => e.select());
	await trang.keyboard.press("Backspace");
	await el.type(chu);
	return true;
}

async function chup(trang, ten) {
	await goDevtools(trang);
	const rong = await trang.evaluate(() => [
		document.documentElement.scrollWidth,
		window.innerWidth,
	]);
	kiem(
		`${ten}: tran ngang scrollWidth ${rong[0]} > innerWidth ${rong[1]}`,
		rong[0] <= rong[1],
	);
	await cho(300);
	await trang.screenshot({ path: join(BANG_CHUNG, ten) });
	anh.push(ten);
}

const SHEET = (mt) => `[data-okr-sheet='${mt}']`;
const HOP = (k) => `[data-hop-thoai-kr='${k}']`;

async function loiMayChu(t, hop) {
	return chuSel(t, `${hop} [data-loi-may-chu]`);
}

async function hoiDuoiO(t, hop, oSel, ma) {
	return t.evaluate(
		(h, o, m) => {
			const oNhap = window.__tim(`${h} ${o}`)[0];
			const field = oNhap?.closest("[data-slot='field']");
			const cau = field?.querySelector(`[data-hoi-chat-luong='${m}']`);
			return cau
				? {
						chu: cau.innerText.replace(/\s+/g, " ").trim(),
						bien: cau.getAttribute("data-variant"),
						slot: cau.getAttribute("data-slot"),
					}
				: null;
		},
		hop,
		oSel,
		ma,
	);
}

async function buocHoiHep() {
	const t = await moTrang(
		cookie.truong,
		DO.rong,
		`/okr?record=objective:${K.N}`,
	);
	await coMat(t, `${SHEET(K.N)} [data-nut='them-kr']`, "E3 390: sheet N");
	await t.setViewport({ width: DO.hep, height: DO.cao });
	await cho(DO.choKhongHienMs);
	await coMat(
		t,
		`${SHEET(K.N)} [data-nut='them-kr']`,
		"E3 390: sheet N o kho hep",
	);
	await bam(t, `${SHEET(K.N)} [data-nut='them-kr']`);
	const hop = HOP("moi");
	if (await coMat(t, hop, "E3 390: hop thoai Them KR o kho hep")) {
		await go(t, `${hop} input[maxlength='200']`, TEN.krHoi);
		await go(t, `${hop} [data-o-khoi-diem]`, "0");
		await go(t, `${hop} [data-o-dich]`, "40");
		await doi(
			t,
			"E3 390: cau hoi kr-la-viec hien o kho hep",
			(h) => window.__tim(`${h} [data-hoi-chat-luong='kr-la-viec']`).length > 0,
			hop,
		);
	}
	await chup(t, "buoc-hoi-390.png");
	await t.close();
}

async function buocHoi() {
	nhom = "E3/E4";
	const t = await moTrang(
		cookie.truong,
		DO.rong,
		`/okr?record=objective:${K.N}`,
	);
	await coMat(
		t,
		`${SHEET(K.N)} [data-nut='them-kr']`,
		"E3 buoc 3: sheet muc tieu nhap co nut Them KR",
	);
	await bam(t, `${SHEET(K.N)} [data-nut='them-kr']`);
	const hop = HOP("moi");
	if (!(await coMat(t, hop, "E3 buoc 3: hop thoai Them KR"))) {
		await t.close();
		return;
	}
	await go(t, `${hop} input[maxlength='200']`, TEN.krHoi);
	await go(t, `${hop} [data-o-khoi-diem]`, "0");
	await go(t, `${hop} [data-o-dich]`, "40");
	await doi(
		t,
		"E3 buoc 3: cau hoi kr-la-viec hien",
		(h) => window.__tim(`${h} [data-hoi-chat-luong='kr-la-viec']`).length > 0,
		hop,
	);
	const hoiTen = await hoiDuoiO(t, hop, "input[maxlength='200']", "kr-la-viec");
	const hoiKhoi = await hoiDuoiO(
		t,
		hop,
		"[data-o-khoi-diem]",
		"thieu-khoi-diem",
	);
	console.log(
		`  E3 cau hoi: ten=${JSON.stringify(hoiTen)} khoi=${JSON.stringify(hoiKhoi)}`,
	);
	kiem(
		`E3 buoc 3: duoi o ten co cau kr-la-viec bang tep chu (thay ${JSON.stringify(hoiTen)})`,
		hoiTen?.chu === CHU.luat["kr-la-viec"] &&
			hoiTen.bien === "hoi" &&
			hoiTen.slot === "field-description",
	);
	kiem(
		`E3 buoc 3: duoi o khoi diem co cau thieu-khoi-diem bang tep chu (thay ${JSON.stringify(hoiKhoi)})`,
		hoiKhoi?.chu === CHU.luat["thieu-khoi-diem"] &&
			hoiKhoi.bien === "hoi" &&
			hoiKhoi.slot === "field-description",
	);
	const batLuu = await thayNgay(
		t,
		(h) => window.__tim(`${h} [data-nut='gui-kr']`)[0]?.disabled === false,
		hop,
	);
	if (!batLuu) {
		const coHoi = await coSel(t, `${hop} [data-hoi-chat-luong]`);
		const cau = coHoi
			? "E3 buoc 3: câu hỏi chặn lưu — nút Lưu disabled khi có câu hỏi chất lượng"
			: "E3 buoc 3: nut Luu van disabled";
		console.log(`  ${cau}`);
		kiem(cau, false);
	}
	await chup(t, "buoc-hoi.png");

	if (batLuu) {
		await bam(t, `${hop} [data-nut='gui-kr']`);
		const dong = await thayNgay(
			t,
			(h, s) =>
				window.__tim(h).length === 0 &&
				window.__tim(`${s} [data-kr-hang]`).length === 1,
			hop,
			SHEET(K.N),
		);
		if (!dong) {
			const loi = await loiMayChu(t, hop);
			if (loi) console.log(`  E4: máy chủ từ chối: ${loi}`);
			kiem(
				`E3 buoc 4: bam Luu -> hop thoai dong va bang KR co dong moi (loi may chu: ${loi || "khong"})`,
				false,
			);
		}
	}
	const krDb = await db.okrKeyResult.findMany({
		where: { objectiveId: K.N },
		select: { title: true, startValue: true, targetValue: true },
	});
	const thayKr = krDb.map((r) => ({
		title: r.title,
		start: Number(r.startValue),
		target: Number(r.targetValue),
	}));
	console.log(`  E4 DB KR cua N: ${JSON.stringify(thayKr)}`);
	kiem(
		`E4: DB co dung mot KR moi {${TEN.krHoi}, 0, 40} (thay ${JSON.stringify(thayKr)})`,
		thayKr.length === 1 &&
			thayKr[0].title === TEN.krHoi &&
			thayKr[0].start === 0 &&
			thayKr[0].target === 40,
	);
	await t.close();

	await buocHoiHep();

	const tm = await moTrang(
		cookie.truong,
		DO.rong,
		`/okr?record=objective:${K.M}`,
	);
	await coMat(
		tm,
		`${SHEET(K.M)} [data-kr-hang='${K.k1}']`,
		"E3 buoc 5: sheet muc tieu ba KR tang toi",
	);
	const coCanh = await doi(
		tm,
		"E3 buoc 5: canh bao thieu doi trong hien cho nguoi sua duoc",
		(s) => window.__tim(`${s} [data-canh-bao-doi-trong]`).length > 0,
		SHEET(K.M),
	);
	if (coCanh) {
		const chu = await chuSel(tm, `${SHEET(K.M)} [data-canh-bao-doi-trong]`);
		kiem(
			`E3 buoc 5: canh bao mang tieu de va cau thieu-doi-trong cua tep chu (thay «${chu}»)`,
			chu.includes(CHU.doiTrong.tieuDe) &&
				chu.includes(CHU.luat["thieu-doi-trong"]),
		);
		const truocBang = await tm.evaluate((s) => {
			const canh = window.__tim(`${s} [data-canh-bao-doi-trong]`)[0];
			const bang = window.__tim(`${s} [data-kr-hang]`)[0];
			return canh && bang
				? canh.getBoundingClientRect().bottom <=
						bang.getBoundingClientRect().top
				: false;
		}, SHEET(K.M));
		kiem("E3 buoc 5: canh bao dung tren bang KR", truocBang);
	}
	await chup(tm, "buoc-doi-trong.png");
	await tm.close();

	const td = await moTrang(
		cookie.docOnly,
		DO.rong,
		`/okr?record=objective:${K.M}`,
	);
	await coMat(
		td,
		`${SHEET(K.M)} [data-kr-hang='${K.k1}']`,
		"E3 buoc 5: thanh vien chi doc mo duoc sheet muc tieu",
	);
	await cho(DO.choKhongHienMs);
	kiem(
		"E3 buoc 5: thanh vien chi doc khong thay canh bao thieu doi trong",
		!(await coSel(td, `${SHEET(K.M)} [data-canh-bao-doi-trong]`)),
	);
	await td.close();
}

async function moSuaKr(t, mt, kr) {
	await coMat(
		t,
		`${SHEET(mt)} [data-kr-hang='${kr}']`,
		"E7: bang KR trong sheet",
	);
	await bam(
		t,
		`${SHEET(mt)} [data-kr-hang='${kr}'] button[aria-haspopup='menu']`,
	);
	await coMat(t, "[data-muc='sua-kr']", "E7: menu KR co muc Sua");
	await bam(t, "[data-muc='sua-kr']");
	return coMat(t, HOP(kr), "E7: hop thoai sua KR");
}

async function dongHopBangHuy(t, hop) {
	await t.keyboard.press("Escape");
	await thayNgay(t, (h) => window.__tim(h).length === 0, hop);
}

async function doiDichDb(kr) {
	return (
		await db.okrDoiDich.findMany({
			where: { keyResultId: kr },
			orderBy: { luc: "asc" },
		})
	).map((r) => ({
		truoc: Number(r.truoc),
		sau: Number(r.sau),
		ngoaiRa: r.ngoaiRa,
		lyDo: r.lyDo,
		tacGia: r.tacGiaUserId === id.truong ? "truong" : r.tacGiaUserId,
	}));
}

async function buocLyDo() {
	nhom = "E7";
	const ra = await lam(cookie.admin, "okr.moRa", {
		cycleId: K.quy,
		tuNgay: HOM_NAY,
		denNgay: CUOI_QUY,
	});
	G.ra.push(ra.id);
	await lam(cookie.admin, "okr.dongRa", { id: ra.id });

	const t = await moTrang(
		cookie.truong,
		DO.rong,
		`/okr?record=objective:${K.M}`,
	);
	const hop = HOP(K.k1);
	if (!(await moSuaKr(t, K.M, K.k1))) {
		await t.close();
		return;
	}
	await go(t, `${hop} [data-o-dich]`, "35");
	const coO = await thayNgay(
		t,
		(h) => window.__tim(`${h} [data-o-ly-do-dich] textarea`).length > 0,
		hop,
	);
	if (!coO) {
		console.log(
			"  E7 buoc 2: thiếu ô lý do — đổi đích ngoài rà mà ô «Lý do đổi đích» không hiện",
		);
		kiem("E7 buoc 2: thiếu ô lý do", false);
	} else {
		const nhan = await chuSel(
			t,
			`${hop} [data-o-ly-do-dich] [data-slot='field-label']`,
		);
		kiem(
			`E7 buoc 2: nhan o bang tep chu (thay «${nhan}»)`,
			nhan === CHU.lyDoDich.nhan,
		);
		const khongDich = await t.evaluate(
			(h) =>
				window
					.__tim(`${h} [data-o-ly-do-dich] textarea`)[0]
					?.getAttribute("translate") ?? null,
			hop,
		);
		kiem(
			`E7: o ly do mang translate=no (thay ${khongDich})`,
			khongDich === "no",
		);
	}
	kiem(
		"E7 buoc 2: nut Luu disabled khi chua co ly do",
		(await nutTat(t, `${hop} [data-nut='gui-kr']`)) === true,
	);
	await chup(t, "buoc-ly-do-dich.png");
	if (coO) {
		await go(t, `${hop} [data-o-ly-do-dich] textarea`, TEN.lyDo);
		await doi(
			t,
			"E7 buoc 3: go ly do 12 ky tu -> Luu bat",
			(h) => window.__tim(`${h} [data-nut='gui-kr']`)[0]?.disabled === false,
			hop,
		);
		await bam(t, `${hop} [data-nut='gui-kr']`);
		const dong = await thayNgay(t, (h) => window.__tim(h).length === 0, hop);
		if (!dong) {
			const loi = await loiMayChu(t, hop);
			kiem(
				`E7 buoc 3: Luu -> hop thoai dong (loi may chu: ${loi || "khong"})`,
				false,
			);
		}
	}
	const sauNgoai = await doiDichDb(K.k1);
	console.log(
		`  E7 DB okrDoiDich sau Luu ngoai ra: ${JSON.stringify(sauNgoai)}`,
	);
	kiem(
		`E7: DB co dung mot dong okrDoiDich ngoaiRa true mang ly do da go (thay ${JSON.stringify(sauNgoai)})`,
		sauNgoai.length === 1 &&
			sauNgoai[0].ngoaiRa === true &&
			sauNgoai[0].lyDo === TEN.lyDo &&
			sauNgoai[0].truoc === 30 &&
			sauNgoai[0].sau === 35 &&
			sauNgoai[0].tacGia === "truong",
	);
	await t.close();

	const ra2 = await lam(cookie.admin, "okr.moRa", {
		cycleId: K.quy,
		tuNgay: HOM_NAY,
		denNgay: CUOI_QUY,
	});
	G.ra.push(ra2.id);

	const t2 = await moTrang(
		cookie.truong,
		DO.rong,
		`/okr?record=objective:${K.M}`,
	);
	const hop2 = HOP(K.k1);
	if (await moSuaKr(t2, K.M, K.k1)) {
		await go(t2, `${hop2} [data-o-dich]`, "40");
		await cho(DO.choKhongHienMs);
		kiem(
			"E7 buoc 4: trong ra, doi dich khong hien o ly do",
			!(await coSel(t2, `${hop2} [data-o-ly-do-dich]`)),
		);
		await doi(
			t2,
			"E7 buoc 4: trong ra, Luu bat khong can ly do",
			(h) => window.__tim(`${h} [data-nut='gui-kr']`)[0]?.disabled === false,
			hop2,
		);
		await bam(t2, `${hop2} [data-nut='gui-kr']`);
		if (!(await thayNgay(t2, (h) => window.__tim(h).length === 0, hop2))) {
			const loi = await loiMayChu(t2, hop2);
			kiem(
				`E7 buoc 4: Luu trong ra -> hop thoai dong (loi may chu: ${loi || "khong"})`,
				false,
			);
			await dongHopBangHuy(t2, hop2);
		}
		const sauTrong = await doiDichDb(K.k1);
		console.log(
			`  E7 DB okrDoiDich sau Luu trong ra: ${JSON.stringify(sauTrong)}`,
		);
		kiem(
			`E7 buoc 4: DB them mot dong okrDoiDich ngoaiRa false (thay ${JSON.stringify(sauTrong)})`,
			sauTrong.length === 2 &&
				sauTrong[1].ngoaiRa === false &&
				sauTrong[1].truoc === 35 &&
				sauTrong[1].sau === 40,
		);
	}
	await t2.close();

	const t3 = await moTrang(cookie.truong, DO.rong, "/okr");
	const coDai = await coMat(
		t3,
		"[data-dai-ky='ra']",
		"E7 buoc 4: dai ra giua ky o dau khu OKR",
	);
	if (coDai) {
		const tieuDe = await chuSel(
			t3,
			"[data-dai-ky='ra'] [data-slot='alert-title']",
		);
		const mong = CHU.dai.ra(formatDay(CUOI_QUY, "vi"));
		kiem(`E7 buoc 4: dai ghi «${mong}» (thay «${tieuDe}»)`, tieuDe === mong);
		const duoiTab = await t3.evaluate(() => {
			const tab = window.__tim("[role='tablist']")[0];
			const dai = window.__tim("[data-dai-ky='ra']")[0];
			return tab && dai
				? dai.getBoundingClientRect().top >= tab.getBoundingClientRect().bottom
				: false;
		});
		kiem("E7 buoc 4: dai nam duoi thanh tab", duoiTab);
	}
	await chup(t3, "buoc-dai-ra.png");
	await t3.setViewport({ width: DO.hep, height: DO.cao });
	await cho(500);
	await chup(t3, "buoc-dai-ra-390.png");
	await t3.close();
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
		console.log(
			"  tien de: workspace chua danh dau onboard — thuoc tu danh dau, tra lai khi don",
		);
	}
	slug = await suySlug(cookie.admin);
	await gieo();
	if (chon(["E3", "E4"])) {
		const b = Date.now();
		await buocHoi().catch((e) =>
			hong.push(`E3/E4: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  nhom E3/E4: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	if (chon(["E7"])) {
		const b = Date.now();
		await buocLyDo().catch((e) =>
			hong.push(`E7: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  nhom E7: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	kiem(
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
	const conKy = await db.okrCycle.count();
	if (conKy > 0) hong.push(`don dep: con ${conKy} chu ky trong kho`);
	writeFileSync(join(BANG_CHUNG, "man-khep-ky-network.txt"), mang.join("\n"));
	console.log(
		`man-khep-ky: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh (${anh.join(", ")}), ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	console.log(`  anh o ${relative(GOC, BANG_CHUNG)}/`);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
}
await ket(ma);
