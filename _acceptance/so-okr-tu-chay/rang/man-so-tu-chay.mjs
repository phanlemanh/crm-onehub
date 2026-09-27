import { execFileSync, spawn } from "node:child_process";
import { webcrypto } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	openSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const TEP_NAY = fileURLToPath(import.meta.url);
const HO_SO = "so-okr-tu-chay";
const BANG_CHUNG =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "evidence");
const MOI_EVAL = ["E11", "E12", "E13", "E14", "E19"];
const LENH_DO =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/so-okr-tu-chay/rang/man-so-tu-chay.mjs"';

const CHON = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const laMa = [...CHON].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0) {
	console.log(
		`KHONG DO DUOC: EVAL=${process.env.EVAL} co ma khong thuoc thuoc nay: ${laMa.join(", ")}. Ma nhan duoc: ${MOI_EVAL.join(", ")}.`,
	);
	process.exit(2);
}
const chon = (evals) => CHON.size === 0 || evals.some((e) => CHON.has(e));

const VET = {
	E11: {
		tep: "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
		mo: "ban sao bang-kr bo nut so (vai thuong cung chi thay so tran)",
		cam: (s) => s.replace(') : xem === "duoc" ? (', ") : false ? ("),
		ghim: /không thấy nút số của KR crm/,
	},
	E12: {
		tep: "apps/app/components/crm/record-sheet/so-kr-sheet.tsx",
		mo: "ban sao ngan so bo ngay khi hoi banGhiChiSo — luon hien so moi nhat (so cua objective.soMay) bat ke ngay chon",
		cam: (s) =>
			s.replace(
				"\t\t\t\tkeyResultId,\n\t\t\t\tngay,\n\t\t\t\ttrang: i + 1,",
				"\t\t\t\tkeyResultId,\n\t\t\t\tngay: undefined,\n\t\t\t\ttrang: i + 1,",
			),
		ghim: /số màn \S+ ≠ số DB \S+/,
	},
	E13: {
		tep: "apps/app/app/(app)/[slug]/okr/o-nguon-so.tsx",
		mo: "ban sao hop thoai luon hien lua chon Sheets",
		cam: (s) =>
			s.replace(
				'(n) => n !== "bang-tinh" || sheetsBat || gia.loai === "bang-tinh",',
				"(n) => true || n === gia.loai || sheetsBat,",
			),
		ghim: /phiên không cắm Sheets vẫn thấy lựa chọn: \S+/,
	},
	E14: {
		tep: "apps/app/app/(app)/[slug]/okr/nguon-so-luat.ts",
		mo: "ban sao hop thoai gui pham vi toan-cong-ty bat ke lua chon",
		cam: (s) =>
			s.replace(
				"\t\t\t\t\tphamVi: phamViCua(g),",
				'\t\t\t\t\tphamVi: { kieu: "toan-cong-ty" },',
			),
		ghim: /phamVi đọc được trong DB: \{"kieu":"toan-cong-ty"\}/,
	},
	E19: {
		tep: "apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx",
		mo: "ban sao man cap nhat tuan khong khoa o gia tri",
		cam: (s) => s.replaceAll("disabled={khoa || khoaNguon}", "disabled={khoa}"),
		ghim: /ô giá trị của KR crm không disabled/,
	},
};

async function chieuDo() {
	const danhSach = CHON.size === 0 ? MOI_EVAL : [...CHON];
	const ket = [];
	for (const e of danhSach) ket.push(await motChieuDo(e));
	console.log("\nchieu do — tong ket:");
	for (const k of ket) console.log(`  ${k.e}: ${k.ket} — ${k.cau}`);
	if (ket.some((k) => k.ket === "KHONG DO DUOC")) process.exit(2);
	process.exit(ket.every((k) => k.ket === "DO DUNG GHIM") ? 0 : 1);
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
	const tam = mkdtempSync(join(tmpdir(), "so-okr-chieu-do-"));
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
		const thuocSao = join(sao, relative(GOC, TEP_NAY));
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
		moiTruong.PHIEN_DO_TEN_CAY = "so-okr-chieu-do";
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
				cau: `ban sao thoat ma 2 (tien de thieu), khong ket luan duoc`,
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

function readlinkOr(p) {
	try {
		return execFileSync("readlink", [p], { encoding: "utf8" }).trim() || p;
	} catch {
		return p;
	}
}

if (process.argv.includes("--chieu-do")) await chieuDo();

const { default: puppeteer } = await import("puppeteer-core");
const { db } = await import("../../../packages/db/src/index.ts");
const { isOnboarded, markOnboarded, WORKSPACE_ID } = await import(
	"../../../packages/db/src/workspace.ts"
);
const { chupKrCrm } = await import("../../../packages/db/src/okr-chi-so.ts");
const { parseOkrNguon } = await import(
	"../../../packages/validation/src/okr-nguon.ts"
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

const RONG = 1440;
const HEP = 390;
const CAO = 900;
const CHO = 30_000;
const CHO_HYDRATE_MS = 800;
const CHO_MAY_CHU_MS = 4 * 60_000;
const NGAY_MS = 24 * 60 * 60_000;
const MA = `s${Date.now().toString(36).slice(-6)}`;
const LOI_BO_QUA = /Download the React DevTools/;
const EMAIL_SHEETS = "doc-okr@so-okr-thuoc.iam.gserviceaccount.com";
const SHEET_ID = `1SoOkrThuoc${MA}`;
const O_SO = "Tổng!B2";
const O_CHU = "Tổng!B3";
const GIA_TRI_O = 1240;

console.log(
	CHON.size === 0
		? `man-so-tu-chay: chay tron ${MOI_EVAL.length} eval; chay rieng: EVAL=E11 (ma: ${MOI_EVAL.join(", ")}); chieu do: --chieu-do`
		: `man-so-tu-chay: chi chay ${[...CHON].join(", ")}${process.env.CHIEU_DO ? ` (ban sao chieu do ${process.env.CHIEU_DO})` : ""}`,
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
const truocNgay = (iso, n) =>
	new Date(Date.parse(`${iso}T00:00:00Z`) - n * NGAY_MS)
		.toISOString()
		.slice(0, 10);
const D0 = HOM_NAY;
const D1 = truocNgay(HOM_NAY, 1);
const D2 = truocNgay(HOM_NAY, 2);
const NAM = Number(HOM_NAY.slice(0, 4));
const QUY = Math.ceil(Number(HOM_NAY.slice(5, 7)) / 3);
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const DAU_QUY = ngay(NAM, QUY * 3 - 2, 1);
if (D2 < DAU_QUY)
	await khongDo(
		`KHONG DO DUOC: hom nay ${HOM_NAY} qua gan dau quy ${DAU_QUY} — lich su ba ngay (${D2}) roi ra ngoai ky dang chay.`,
	);
const nhanNgay = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const ngayDb = (iso) => new Date(`${iso}T00:00:00Z`);

const NGUOI = {
	admin: { email: `a${MA}@thu.test`, vai: "admin", ten: "Nguyễn Minh An" },
	truong: { email: `t${MA}@thu.test`, vai: "member", ten: "Phạm Thu Lan" },
	chiOkr: { email: `o${MA}@thu.test`, vai: "okr", ten: "Lê Hồng Ngọc" },
};

const TEN = {
	P: `Phòng Đối tác số ${MA}`,
	cty: `Công ty Thước Số ${MA}`,
	d1: `Hợp đồng Hải Phòng ${MA}`,
	d2: `Hợp đồng Đà Nẵng ${MA}`,
	d3: `Hợp đồng Cần Thơ ${MA}`,
	A: "Phòng Đối tác chốt thêm thoả thuận quý này",
	Ktay: "Buổi đào tạo đối tác",
	Kcrm: "Thoả thuận chốt trong quý",
	KdoCanh: "Thoả thuận mới do phòng mở",
	Kapi: "Đơn hàng qua cổng đối tác",
	Krong: "Cuộc gọi hẹn được gặp",
	B: "Phòng Đối tác đo số tự chạy",
	Kb: `Thoả thuận đo bằng máy ${MA}`,
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
const G = { ky: [], pb: [], mt: [], kr: [], deal: [], cty: [] };
const K = {};

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
		endsOn: ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3)),
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

	const cty = await lam(cookie.admin, "companies.create", { name: TEN.cty });
	G.cty.push(cty.id);
	for (const [khoa, ten] of [
		["d1", TEN.d1],
		["d2", TEN.d2],
		["d3", TEN.d3],
	]) {
		const d = await lam(cookie.admin, "deals.create", {
			name: ten,
			companyId: cty.id,
			ownerId: id.truong,
			stage: "CLOSED_WON",
		});
		G.deal.push(d.id);
		K[khoa] = d.id;
	}
	await db.deal.update({
		where: { id: K.d1 },
		data: { closedAt: new Date(`${D2}T05:00:00Z`) },
	});
	await db.deal.update({
		where: { id: K.d2 },
		data: { closedAt: new Date(`${D1}T05:00:00Z`) },
	});

	const c = cookie.truong;
	const donVi = { level: "phong-ban", departmentId: K.P };
	const mtA = await lam(c, "okr.createObjective", {
		cycleId: K.quy,
		unit: donVi,
		title: TEN.A,
		kind: "cam-ket",
		ownerUserId: id.truong,
		participantIds: [],
		whyNow: "",
	});
	G.mt.push(mtA.id);
	K.A = mtA.id;
	const taoKr = async (khoa, title, targetValue, currentValue, unit) => {
		const r = await lam(c, "okr.createKeyResult", {
			objectiveId: K.A,
			title,
			kind: "tang-toi",
			ownerUserId: id.truong,
			startValue: 0,
			targetValue,
			currentValue,
			unit,
			dueOn: null,
			weight: 1,
		});
		G.kr.push(r.id);
		K[khoa] = r.id;
	};
	await taoKr("Ktay", TEN.Ktay, 10, 4, "buổi");
	await taoKr("Kcrm", TEN.Kcrm, 20, 0, "thoả thuận");
	await taoKr("KdoCanh", TEN.KdoCanh, 10, 2, "thoả thuận");
	await taoKr("Kapi", TEN.Kapi, 50, 0, "đơn");
	await taoKr("Krong", TEN.Krong, 30, 0, "cuộc gọi");
	const phongBan = { kieu: "phong-ban", id: K.P };
	await lam(c, "okr.datNguonKr", {
		keyResultId: K.Kcrm,
		loai: "crm",
		chiSo: "thoa-thuan-chot-duoc",
		phamVi: phongBan,
	});
	await lam(c, "okr.datNguonKr", { keyResultId: K.Kapi, loai: "api" });
	await lam(c, "okr.datNguonKr", {
		keyResultId: K.Krong,
		loai: "crm",
		chiSo: "goi-hen-duoc",
		phamVi: phongBan,
	});
	await lam(c, "okr.publishObjective", { id: K.A });
	const doCanh = await lam(c, "okr.datNguonKr", {
		keyResultId: K.KdoCanh,
		loai: "crm",
		chiSo: "thoa-thuan-moi",
		phamVi: phongBan,
	});
	if (!doCanh.doCanh)
		throw new Error("datNguonKr cho KR tay da cong bo khong tra doCanh");
	for (const d of [D2, D1, D0]) await chupKrCrm(db, K.Kcrm, d, parseOkrNguon);
	await chupKrCrm(db, K.KdoCanh, D0, parseOkrNguon);
	await chupKrCrm(db, K.Krong, D0, parseOkrNguon);
	await lam(c, "okr.ghiSoKr", { id: K.Kapi, giaTri: 12 });

	const mtB = await lam(c, "okr.createObjective", {
		cycleId: K.quy,
		unit: donVi,
		title: TEN.B,
		kind: "cam-ket",
		ownerUserId: id.truong,
		participantIds: [],
		whyNow: "",
	});
	G.mt.push(mtB.id);
	K.B = mtB.id;
	const chup = await db.okrSoChup.findMany({
		where: { keyResultId: { in: [K.Kcrm, K.KdoCanh, K.Krong, K.Kapi] } },
		orderBy: [{ keyResultId: "asc" }, { ngay: "asc" }],
		select: { keyResultId: true, ngay: true, giaTri: true, nguon: true },
	});
	const ten = {
		[K.Kcrm]: "crm",
		[K.KdoCanh]: "do-canh",
		[K.Krong]: "rong",
		[K.Kapi]: "api",
	};
	console.log(
		`  gieo: ${chup.map((r) => `${ten[r.keyResultId]}@${ngayVN(r.ngay)}=${Number(r.giaTri)}(${r.nguon})`).join(" · ")}`,
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
	await db.agentTask.deleteMany({
		where: {
			OR: [
				...moiKr.map((k) => ({
					kind: "okr-doc-sheet",
					payload: { path: ["keyResultId"], equals: k },
				})),
				{ dealId: { in: G.deal } },
				{ companyId: { in: G.cty } },
			],
		},
	});
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
	await db.deal.deleteMany({ where: { id: { in: G.deal } } });
	await db.company.deleteMany({ where: { id: { in: G.cty } } });
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

let khang = 0;
const hong = [];
const anh = [];
const mang = [];
const goi = [];
const traLoi = [];
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
const chan = { banGhi: false };

function tenVaVao(u) {
	const url = new URL(u);
	const ten = decodeURIComponent(
		url.pathname.split("/api/trpc/")[1] ?? "",
	).split(",");
	let vao = {};
	try {
		vao = JSON.parse(url.searchParams.get("input") ?? "{}");
	} catch {}
	const batch = url.searchParams.get("batch") === "1";
	return ten.map((t, i) => [t, batch ? vao[String(i)] : vao]);
}

async function moTrang(c, rong, duong, goc = APP) {
	const trang = await trinhDuyet.newPage();
	const ghi = (d) => mang.push(`${new Date().toISOString()} ${d}`);
	const tenNhom = nhom;
	trang.__chanDuoc = false;
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
		if (trang.__chanDuoc && /status of 500/.test(t)) return;
		loiConsole.push(`${tenNhom} ${duong}: console.error ${t.slice(0, 200)}`);
	});
	trang.on("requestfailed", (r) =>
		ghi(`requestfailed ${r.url()} ${r.failure()?.errorText ?? ""}`),
	);
	await trang.setRequestInterception(true);
	trang.on("request", (r) => {
		const u = r.url();
		if (u.includes("/api/trpc/")) {
			for (const [t, v] of tenVaVao(u)) goi.push({ t, v, luc: Date.now() });
			if (chan.banGhi && u.includes("okr.banGhiChiSo")) {
				trang.__chanDuoc = true;
				const so = tenVaVao(u).length;
				r.respond({
					status: 500,
					contentType: "application/json",
					body: JSON.stringify(
						Array.from({ length: so }, () => ({
							error: {
								message: "Thuoc chan banGhiChiSo",
								code: -32603,
								data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 },
							},
						})),
					),
				});
				return;
			}
		}
		r.continue();
	});
	trang.on("response", async (r) => {
		const u = r.url();
		if (r.status() >= 400) ghi(`${r.status()} ${r.request().method()} ${u}`);
		if (!u.includes("/api/trpc/")) return;
		if (!/okr\.(banGhiChiSo|xemTruocChiSo)/.test(u)) return;
		try {
			const than = await r.json();
			const ds = tenVaVao(u);
			const mang2 = Array.isArray(than) ? than : [than];
			for (const [i, [t, v]] of ds.entries())
				traLoi.push({
					t,
					v,
					ra: mang2[i]?.result?.data ?? null,
					luc: Date.now(),
				});
		} catch {}
	});
	await trang.evaluateOnNewDocument(() => {
		window.__hien = (e) =>
			e.checkVisibility() ||
			(getComputedStyle(e).display === "contents" &&
				(e.parentElement?.checkVisibility() ?? false));
		window.__tim = (s) =>
			[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
	});
	await trang.setViewport({ width: rong, height: CAO });
	const host = new URL(goc).hostname;
	await trang.setCookie(
		{ name: c.ten, value: c.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await trang.goto(`${goc}/${slug}${duong}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO })
		.catch(() => null);
	await cho(CHO_HYDRATE_MS);
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
		.waitForFunction(fn, { timeout: CHO, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);
	return kiem(`${nhan}: het ${CHO}ms van chua thay`, ra);
}

const coSel = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s).length > 0, sel);
const demSel = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s).length, sel);
const chuSel = (trang, sel) =>
	trang.evaluate(
		(s) => window.__tim(s)[0]?.innerText?.replace(/\s+/g, " ").trim() ?? "",
		sel,
	);
const thuocTinh = (trang, sel, ten) =>
	trang.evaluate(
		(s, t) => window.__tim(s).map((e) => e.getAttribute(t)),
		sel,
		ten,
	);
const coMat = (trang, sel, nhan = `co ${sel}`) =>
	doi(trang, nhan, (s) => window.__tim(s).length > 0, sel);
const thamSo = (trang, khoa) => new URL(trang.url()).searchParams.get(khoa);
const recordUrl = (trang) => thamSo(trang, "record") ?? "";

async function phanTu(trang, sel, chu) {
	const tay = await trang.evaluateHandle(
		(s, c) =>
			window
				.__tim(s)
				.find(
					(x) =>
						c === null ||
						(x.innerText ?? x.textContent ?? "").replace(/\s+/g, " ").trim() ===
							c,
				) ?? null,
		sel,
		chu ?? null,
	);
	return tay.asElement();
}

async function bam(trang, sel, chu = null) {
	await trang.bringToFront();
	const el = await phanTu(trang, sel, chu);
	if (!el)
		return kiem(`khong thay ${sel}${chu ? ` «${chu}»` : ""} de bam`, false);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}

async function go(trang, sel, chu) {
	const el = await phanTu(trang, sel);
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

async function chupTai(trang, sel, ten) {
	const el = await phanTu(trang, sel);
	if (!el) {
		kiem(`${ten}: khong thay ${sel} de chup`, false);
	} else {
		await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
		const tran = await el.evaluate((e) => {
			const hop = e.closest("[data-cuon-hop]");
			return hop && hop.scrollWidth > hop.clientWidth + 1
				? `${hop.scrollWidth} > ${hop.clientWidth}`
				: null;
		});
		if (tran)
			console.log(`  quan sat ${ten}: vung cuon hop thoai tran ngang ${tran}`);
	}
	await chup(trang, ten);
}

async function taiLai(t) {
	await t.reload({ waitUntil: "load", timeout: CHO_TAI });
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO }).catch(() => null);
	await cho(CHO_HYDRATE_MS);
	await goDevtools(t);
}

const SHEET = ":is([data-slot='sheet-content'],[data-slot='drawer-content'])";
const TIEU_DE = ":is([data-slot='sheet-title'],[data-slot='drawer-title'])";
const HOP = (k) => `[data-hop-thoai-kr='${k}']`;

async function soChup(krId, d) {
	const r = await db.okrSoChup.findFirst({
		where: { keyResultId: krId, ngay: ngayDb(d) },
		orderBy: { chupLuc: "desc" },
		select: { giaTri: true },
	});
	return r ? Number(r.giaTri) : null;
}

const traLoiBanGhi = (krId, ngaySo) =>
	[...traLoi]
		.reverse()
		.find(
			(x) =>
				x.t === "okr.banGhiChiSo" &&
				x.v?.keyResultId === krId &&
				(x.v?.ngay ?? null) === ngaySo &&
				x.ra !== null,
		) ?? null;

async function soManNganSo(t) {
	const [so] = await thuocTinh(t, "[data-so-da-chup]", "data-so-da-chup");
	return so === undefined || so === null ? null : Number(so);
}

async function buocSo() {
	nhom = "E11/E12";
	const t = await moTrang(cookie.truong, RONG, `/okr?record=objective:${K.A}`);
	await coMat(
		t,
		`${SHEET} [data-kr-hang='${K.Kcrm}']`,
		"E11 buoc 3: bang KR trong sheet muc tieu",
	);
	const nguon = await t.evaluate(
		(sheet, ids) =>
			Object.fromEntries(
				Object.entries(ids).map(([k, v]) => {
					const o = window.__tim(
						`${sheet} [data-kr-hang='${v}'] [data-nguon]`,
					)[0];
					return [
						k,
						{
							nguon: o?.getAttribute("data-nguon") ?? null,
							doCanh: o?.hasAttribute("data-do-canh") ?? false,
							chu: o?.innerText?.replace(/\s+/g, " ").trim() ?? "",
						},
					];
				}),
			),
		SHEET,
		{ tay: K.Ktay, crm: K.Kcrm, doCanh: K.KdoCanh, api: K.Kapi, rong: K.Krong },
	);
	console.log(`  E11 dau nguon: ${JSON.stringify(nguon)}`);
	kiem(
		`E11 buoc 3: KR tay data-nguon=tay (thay ${nguon.tay.nguon})`,
		nguon.tay.nguon === "tay",
	);
	kiem(
		`E11 buoc 3: KR crm data-nguon=crm (thay ${nguon.crm.nguon})`,
		nguon.crm.nguon === "crm",
	);
	kiem(
		`E11 buoc 3: KR api data-nguon=api (thay ${nguon.api.nguon})`,
		nguon.api.nguon === "api",
	);
	kiem(
		`E11 buoc 3: KR do canh data-nguon=tay co data-do-canh (thay ${JSON.stringify(nguon.doCanh)})`,
		nguon.doCanh.nguon === "tay" && nguon.doCanh.doCanh,
	);
	const mayDoCanh = await soChup(K.KdoCanh, D0);
	kiem(
		`E11 buoc 3: dong do canh co «tay» va «máy» khop so DB (thay «${nguon.doCanh.chu}», so may DB ${mayDoCanh})`,
		new RegExp(`\\b2 tay · ${mayDoCanh} máy\\b`).test(nguon.doCanh.chu),
	);
	const tenKr = await t.evaluate(
		(sheet, id2) =>
			window.__tim(`${sheet} [data-kr-hang='${id2}'] [translate='no']`)[0]
				?.innerText ?? "",
		SHEET,
		K.Kcrm,
	);
	kiem(
		`E11: ten KR trong bang mang translate=no (thay «${tenKr}»)`,
		tenKr.includes(TEN.Kcrm),
	);
	await chup(t, "buoc-bang-kr.png");

	const nut = await phanTu(t, `${SHEET} button[data-so-kr='${K.Kcrm}']`);
	if (!nut) {
		kiem("E11 buoc 4: không thấy nút số của KR crm", false);
		console.log("  E11 buoc 4: không thấy nút số của KR crm");
		await t.close();
		return;
	}
	const truocMo = traLoi.length;
	await bam(t, `${SHEET} button[data-so-kr='${K.Kcrm}']`);
	await doi(
		t,
		"E11 buoc 4: URL co record=…so-kr:<id>",
		(k) =>
			new URL(location.href).searchParams.get("record")?.includes(`so-kr:${k}`),
		K.Kcrm,
	);
	await coMat(
		t,
		`[data-so-kr-sheet='${K.Kcrm}'][data-trang-thai='ST-so-co']:not([data-dang-tai])`,
		"E11 buoc 4: ngan so KR crm co du lieu",
	);
	await coMat(t, "[data-ban-ghi]", "E11 buoc 4: bang ban ghi co dong");
	kiem(
		`E11 buoc 4: URL record chua so-kr:${K.Kcrm} (thay ${recordUrl(t)})`,
		recordUrl(t).split(",").includes(`so-kr:${K.Kcrm}`),
	);
	const dinhNghia = await t.evaluate(
		(tieuDe) => ({
			chiSo:
				window.__tim("[data-dinh-nghia] [data-ten-chi-so]")[0]?.innerText ?? "",
			chiSoKhongDich:
				window
					.__tim("[data-dinh-nghia] [data-ten-chi-so]")[0]
					?.getAttribute("translate") ?? null,
			phamVi:
				window.__tim("[data-dinh-nghia] [data-pham-vi]")[0]?.innerText ?? "",
			kieuPhamVi:
				window
					.__tim("[data-dinh-nghia] [data-pham-vi]")[0]
					?.getAttribute("data-pham-vi") ?? null,
			donViKhongDich:
				window.__tim("[data-dinh-nghia] [data-pham-vi] [translate='no']")[0]
					?.innerText ?? "",
			khoang:
				window.__tim("[data-dinh-nghia] [data-khoang]")[0]?.innerText ?? "",
			tieuDe: window.__tim(`${tieuDe} [translate='no']`)[0]?.innerText ?? "",
		}),
		TIEU_DE,
	);
	console.log(`  E11 dinh nghia: ${JSON.stringify(dinhNghia)}`);
	kiem(
		`E11 buoc 4: ten chi so «Thoả thuận chốt được» (thay «${dinhNghia.chiSo}»)`,
		dinhNghia.chiSo.includes("Thoả thuận chốt được"),
	);
	kiem(
		`E11 buoc 10: ten chi so mang translate=no (thay ${dinhNghia.chiSoKhongDich})`,
		dinhNghia.chiSoKhongDich === "no",
	);
	kiem(
		`E11 buoc 4: pham vi phong ban ${TEN.P} (thay ${dinhNghia.kieuPhamVi} «${dinhNghia.donViKhongDich}»)`,
		dinhNghia.kieuPhamVi === "phong-ban" &&
			dinhNghia.donViKhongDich.includes(TEN.P),
	);
	kiem(
		`E11 buoc 4: co khoang ngay (thay «${dinhNghia.khoang}»)`,
		/\d/.test(dinhNghia.khoang),
	);
	kiem(
		`E11 buoc 4: tieu de ngan la ten KR (thay «${dinhNghia.tieuDe}»)`,
		dinhNghia.tieuDe.includes(TEN.Kcrm),
	);
	const soMan0 = await soManNganSo(t);
	const soDb0 = await soChup(K.Kcrm, D0);
	const [ngayChup0] = await thuocTinh(t, "[data-so-da-chup]", "data-ngay-chup");
	kiem(
		`E12: so da chup tren man ${soMan0} bang okrSoChup.giaTri ${soDb0} ngay ${D0} (man ghi ngay ${ngayChup0})`,
		soMan0 !== null && soMan0 === soDb0 && ngayChup0 === D0,
	);
	const dong0 = await demSel(t, "[data-ban-ghi]");
	const ra0 = traLoiBanGhi(K.Kcrm, null);
	kiem(
		`E12: so dong ban ghi tren man ${dong0} bang so dong banGhiChiSo tra ${ra0?.ra?.dong?.length ?? "?"}`,
		ra0 !== null &&
			traLoi.indexOf(ra0) >= truocMo &&
			dong0 === ra0.ra.dong.length,
	);
	const lichSu = await thuocTinh(t, "[data-lich-su-ngay]", "data-lich-su-ngay");
	kiem(
		`E11 buoc 4: bang lich su 3 dong ${D2}, ${D1}, ${D0} (thay ${lichSu.join(", ")})`,
		lichSu.length === 3 && [D0, D1, D2].every((d) => lichSu.includes(d)),
	);
	const khongDichBanGhi = await t.evaluate(() =>
		window
			.__tim("[data-ban-ghi]")
			.map((r) => r.querySelector("[translate='no']")?.innerText ?? ""),
	);
	kiem(
		`E11 buoc 10: ten ban ghi mang translate=no (thay ${JSON.stringify(khongDichBanGhi)})`,
		khongDichBanGhi.length > 0 && khongDichBanGhi.every((x) => x.includes(MA)),
	);
	await chup(t, "buoc-ngan-so.png");

	const truocChon = goi.length;
	await bam(t, `button[data-chon-ngay='${D2}']`);
	await doi(
		t,
		`E11 buoc 5: URL ngaySo=${D2}`,
		(d) => new URL(location.href).searchParams.get("ngaySo") === d,
		D2,
	);
	await coMat(
		t,
		`[data-so-kr-sheet='${K.Kcrm}'][data-ngay-so='${D2}']:not([data-dang-tai])`,
		"E11 buoc 5: ngan so da tai lai theo ngay",
	);
	await cho(600);
	const soMan2 = await soManNganSo(t);
	const soDb2 = await soChup(K.Kcrm, D2);
	if (soMan2 !== soDb2)
		console.log(`  E12 chon ngay ${D2}: số màn ${soMan2} ≠ số DB ${soDb2}`);
	kiem(
		`E12 buoc chon ngay ${D2}: số màn ${soMan2} ≠ số DB ${soDb2}`,
		soMan2 !== null && soMan2 === soDb2,
	);
	kiem(
		`E11 buoc 5: so da chup doi theo ngay (${soMan0} -> ${soMan2})`,
		soMan2 !== soMan0,
	);
	const goiNgay = goi
		.slice(truocChon)
		.filter((g) => g.t === "okr.banGhiChiSo" && g.v?.keyResultId === K.Kcrm);
	kiem(
		`E12: chon ngay goi banGhiChiSo voi input ngay khop URL ${D2} (thay ${JSON.stringify(goiNgay.map((g) => g.v?.ngay ?? null))})`,
		goiNgay.length > 0 && goiNgay.every((g) => g.v?.ngay === D2),
	);
	const dong2 = await demSel(t, "[data-ban-ghi]");
	const ra2 = traLoiBanGhi(K.Kcrm, D2);
	kiem(
		`E12: so dong ban ghi ngay ${D2} tren man ${dong2} bang banGhiChiSo tra ${ra2?.ra?.dong?.length ?? "?"}`,
		ra2 !== null && dong2 === ra2.ra.dong.length,
	);
	kiem(
		`E11 buoc 5: so dong doi theo ngay (${dong0} -> ${dong2})`,
		dong2 !== dong0,
	);
	await chup(t, "buoc-ngay.png");

	const moRef =
		(await thuocTinh(t, "button[data-mo-ban-ghi]", "data-mo-ban-ghi"))[0] ??
		null;
	if (
		kiem("E11 buoc 6: co nut mo thoa thuan trong bang ban ghi", moRef !== null)
	) {
		await bam(t, `button[data-mo-ban-ghi='${moRef}']`);
		await doi(
			t,
			`E11 buoc 6: URL co ${moRef}`,
			(r) =>
				new URL(location.href).searchParams
					.get("record")
					?.split(",")
					.includes(r),
			moRef,
		);
		await doi(
			t,
			"E11 buoc 6: sheet thoa thuan hien ten thoa thuan",
			(ten) =>
				window
					.__tim(":is([data-slot='sheet-title'],[data-slot='drawer-title'])")
					.some((e) => e.innerText.includes(ten)),
			TEN.d1,
		);
		await bam(t, `${SHEET} button`, "Quay lại");
		await coMat(
			t,
			`[data-so-kr-sheet='${K.Kcrm}'][data-trang-thai='ST-so-co']`,
			"E11 buoc 6: «Quay lại» -> ngan so hien lai",
		);
		kiem(
			`E11 buoc 6: sau Quay lai URL con ngaySo=${D2} va so-kr (thay ${recordUrl(t)} ngaySo=${thamSo(t, "ngaySo")})`,
			thamSo(t, "ngaySo") === D2 &&
				recordUrl(t).split(",").at(-1) === `so-kr:${K.Kcrm}`,
		);
	}

	await lam(cookie.admin, "deals.archive", { id: K.d1 });
	await taiLai(t);
	await coMat(
		t,
		"[data-trang-thai='ST-so-lech']",
		"E11 buoc 7: cau lech sau khi luu tru thoa thuan",
	);
	const lech = await chuSel(t, "[data-trang-thai='ST-so-lech']");
	const [tinhLai] = await thuocTinh(
		t,
		"[data-trang-thai='ST-so-lech']",
		"data-so-tinh-lai",
	);
	const demDb = await db.deal.count({
		where: {
			id: { in: G.deal },
			archivedAt: null,
			stage: "CLOSED_WON",
			closedAt: { lt: new Date(Date.parse(`${D1}T00:00:00+07:00`)) },
		},
	});
	kiem(
		`E11 buoc 7: cau lech co hai so (da chup ${soDb2}, tinh lai ${demDb}) — thay «${lech}», data-so-tinh-lai=${tinhLai}`,
		lech.includes(`Đã chụp ${soDb2}`) &&
			lech.includes(`tính lại lúc này ${demDb}`) &&
			Number(tinhLai) === demDb,
	);
	await chup(t, "buoc-lech.png");
	await t.close();

	const r = await moTrang(cookie.truong, RONG, `/okr?record=objective:${K.A}`);
	await coMat(
		r,
		`${SHEET} button[data-so-kr='${K.Krong}']`,
		"E11 buoc 8: nut so KR rong",
	);
	await bam(r, `${SHEET} button[data-so-kr='${K.Krong}']`);
	await coMat(
		r,
		`[data-so-kr-sheet='${K.Krong}'] [data-trang-thai='ST-so-rong']`,
		"E11 buoc 8: trang thai rong cua KR crm khong ban ghi",
	);
	await chup(r, "buoc-rong.png");
	await r.close();

	chan.banGhi = true;
	const l = await moTrang(cookie.truong, RONG, `/okr?record=objective:${K.A}`);
	await coMat(
		l,
		`${SHEET} button[data-so-kr='${K.Kcrm}']`,
		"E11 buoc 8: nut so KR crm (trang loi)",
	);
	await bam(l, `${SHEET} button[data-so-kr='${K.Kcrm}']`);
	await coMat(
		l,
		`[data-so-kr-sheet='${K.Kcrm}'][data-trang-thai='ST-so-loi']`,
		"E11 buoc 8: chan banGhiChiSo tra 500 -> ngan loi",
	);
	await coMat(l, "[data-nut='thu-lai']", "E11 buoc 8: nut «Thử lại»");
	kiem(
		`E11 buoc 8: nut Thu lai ghi «Thử lại» (thay «${await chuSel(l, "[data-nut='thu-lai']")}»)`,
		(await chuSel(l, "[data-nut='thu-lai']")) === "Thử lại",
	);
	await chup(l, "buoc-loi.png");
	chan.banGhi = false;
	await bam(l, "[data-nut='thu-lai']");
	await coMat(
		l,
		`[data-so-kr-sheet='${K.Kcrm}'][data-trang-thai='ST-so-co']`,
		"E11 buoc 8: bo chan, bam Thu lai -> co du lieu",
	);
	await coMat(l, "[data-so-da-chup]", "E11 buoc 8: so da chup hien lai");
	await l.close();

	const o = await moTrang(cookie.chiOkr, RONG, `/okr?record=objective:${K.A}`);
	await coMat(
		o,
		`${SHEET} [data-so-kr-tran='${K.Kcrm}']`,
		"E11 buoc 9: vai okr thay so tran KR crm",
	);
	const tran = await o.evaluate(
		(sheet, k) => {
			const e = window.__tim(`${sheet} [data-so-kr-tran='${k}']`)[0];
			return e
				? {
						the: e.tagName,
						role: e.getAttribute("role"),
						href:
							e.getAttribute("href") ??
							e.closest("a")?.getAttribute("href") ??
							null,
						trongNut: e.closest("button") !== null,
					}
				: null;
		},
		SHEET,
		K.Kcrm,
	);
	kiem(
		`E11 buoc 9: so KR crm cua vai okr khong phai nut (thay ${JSON.stringify(tran)})`,
		tran !== null &&
			tran.role !== "button" &&
			tran.href === null &&
			!tran.trongNut &&
			tran.the !== "BUTTON",
	);
	kiem(
		"E11 buoc 9: vai okr khong co button[data-so-kr]",
		!(await coSel(o, `${SHEET} button[data-so-kr]`)),
	);
	await chup(o, "buoc-chi-okr.png");
	await o.close();

	const h = await moTrang(cookie.truong, HEP, `/okr?record=objective:${K.A}`);
	await coMat(
		h,
		`${SHEET} button[data-so-kr='${K.Kcrm}']`,
		"E11 buoc 10: nut so KR crm o 390",
	);
	await bam(h, `${SHEET} button[data-so-kr='${K.Kcrm}']`);
	await coMat(
		h,
		`[data-so-kr-sheet='${K.Kcrm}'][data-trang-thai='ST-so-co']:not([data-dang-tai])`,
		"E11 buoc 10: ngan so o 390",
	);
	await coMat(h, "[data-ban-ghi]", "E11 buoc 10: ban ghi o 390");
	await chup(h, "buoc-ngan-so-390.png");
	await h.close();
}

async function choDb(nhan, fn, han = CHO) {
	const het = Date.now() + han;
	let cuoi = null;
	while (Date.now() < het) {
		cuoi = await fn();
		if (cuoi.dat) return cuoi;
		await cho(300);
	}
	kiem(
		`${nhan}: het ${han}ms (cuoi: ${JSON.stringify(cuoi?.thay ?? null)})`,
		false,
	);
	return cuoi;
}

async function nguonDb(krId) {
	const r = await db.okrNguonKr.findUnique({ where: { keyResultId: krId } });
	return r
		? {
				loai: r.loai,
				chiSo: r.chiSo,
				phamVi: r.phamVi,
				bac: r.bac,
				sheetId: r.sheetId,
				sheetO: r.sheetO,
				docLoi: r.docLoi,
				docLuc: r.docLuc?.toISOString() ?? null,
				docGiaTri: r.docGiaTri === null ? null : Number(r.docGiaTri),
			}
		: null;
}

const giongPhamVi = (a, b) =>
	(a?.kieu ?? null) !== null &&
	a?.kieu === b?.kieu &&
	(a?.id ?? null) === (b?.id ?? null);

async function moHopSua(t, ten, krId) {
	await bam(t, `${SHEET} button[aria-label='Thao tác với ${ten}']`);
	await coMat(t, "[role='menuitem']", `menu cua ${ten}`);
	await bam(t, "[role='menuitem']", "Sửa");
	return coMat(t, HOP(krId), `hop thoai sua KR ${ten}`);
}

async function dongHop(t, ten) {
	await t.keyboard.press("Escape");
	await doi(
		t,
		"dong hop thoai KR",
		() => window.__tim("[data-hop-thoai-kr]").length === 0,
	);
	await cho(300);
	const conBamDuoc = await t.evaluate((s) => {
		const el = window.__tim(s)[0];
		return el ? getComputedStyle(el).pointerEvents : null;
	}, SHEET);
	kiem(
		`dong hop thoai KR bang Escape: sheet muc tieu con bam duoc (thay ${conBamDuoc})`,
		conBamDuoc !== null && conBamDuoc !== "none",
	);
	await bam(t, `${SHEET} button[aria-label='Thao tác với ${ten}']`);
	await coMat(
		t,
		"[role='menuitem']",
		`menu cua ${ten} mo lai duoc sau khi dong hop thoai KR`,
	);
	await t.keyboard.press("Escape");
	await doi(
		t,
		"dong menu KR mo lai",
		() => window.__tim("[role='menuitem']").length === 0,
	);
	await t.keyboard.press("Escape");
	await doi(
		t,
		"dong sheet muc tieu",
		(s) => window.__tim(s).length === 0,
		SHEET,
	);
	await cho(300);
	const chan2 = await t.evaluate(
		() => getComputedStyle(document.body).pointerEvents,
	);
	kiem(
		`dong sheet muc tieu: body het pointer-events:none (thay ${chan2})`,
		chan2 !== "none",
	);
}

async function luaChonThay(t, k) {
	return t.evaluate(
		(s) =>
			window
				.__tim(`${s} [data-lua-chon-nguon]`)
				.map((e) => e.getAttribute("data-lua-chon-nguon")),
		HOP(k),
	);
}

async function chonTrongSelect(t, trigger, chu) {
	await bam(t, trigger);
	await coMat(t, "[role='option']", `danh sach cua ${trigger}`);
	return bam(t, "[role='option']", chu);
}

async function buocNguon(sheets) {
	nhom = "E13/E14";
	const t = await moTrang(cookie.truong, RONG, `/okr?record=objective:${K.B}`);
	await coMat(
		t,
		`${SHEET} [data-nut='them-kr']`,
		"E13 buoc 2: nut «Thêm KR» cua muc tieu nhap",
	);
	await bam(t, `${SHEET} [data-nut='them-kr']`);
	await coMat(
		t,
		`${HOP("moi")} [data-nguon-so]`,
		"E13 buoc 2: hop thoai them KR co o Nguon so",
	);
	const [macDinh] = await thuocTinh(
		t,
		`${HOP("moi")} [data-nguon-so]`,
		"data-nguon-so",
	);
	kiem(
		`E13 buoc 2: o Nguon so mac dinh «Nhập tay» (thay ${macDinh})`,
		macDinh === "tay",
	);
	const nhanTay = await chuSel(
		t,
		`${HOP("moi")} [data-lua-chon-nguon='tay'][data-state='on']`,
	);
	kiem(
		`E13 buoc 2: nut dang chon la «Nhập tay» (thay «${nhanTay}»)`,
		nhanTay === "Nhập tay",
	);
	await chupTai(t, `${HOP("moi")} [data-nguon-so]`, "buoc-nguon-tay.png");

	await coMat(
		t,
		`${HOP("moi")} [data-sheets-tat]`,
		"E13 buoc 6: dong Sheets tat (okr.chiSo da ve)",
	);
	const thay = await luaChonThay(t, "moi");
	const tat = await chuSel(t, `${HOP("moi")} [data-sheets-tat]`);
	console.log(
		`  E13 phien khong cam Sheets: lua chon ${thay.join(", ")}; dong tat «${tat}»`,
	);
	if (thay.includes("bang-tinh"))
		console.log(
			`  E13: phiên không cắm Sheets vẫn thấy lựa chọn: ${thay.join(",")}`,
		);
	kiem(
		`E13 buoc 6: phiên không cắm Sheets vẫn thấy lựa chọn: ${thay.join(",")}`,
		!thay.includes("bang-tinh") &&
			["tay", "crm", "api"].every((n) => thay.includes(n)),
	);
	kiem(
		`E13 buoc 6: dong «Quản trị chưa cắm khoá Google Sheets» (thay «${tat}»)`,
		tat === "Quản trị chưa cắm khoá Google Sheets",
	);
	await chupTai(t, `${HOP("moi")} [data-sheets-tat]`, "buoc-sheets-tat.png");

	await go(t, `${HOP("moi")} input[maxlength='200']`, TEN.Kb);
	await go(t, `${HOP("moi")} [data-o-dich]`, "12");
	await go(t, `${HOP("moi")} input[maxlength='24']`, "thoả thuận");
	await bam(t, `${HOP("moi")} [data-lua-chon-nguon='crm']`);
	await coMat(
		t,
		`${HOP("moi")} [data-nguon-so='crm']`,
		"E13 buoc 3: chon «Chỉ số CRM»",
	);
	await coMat(t, `${HOP("moi")} [data-o-chi-so]`, "E13 buoc 3: o chi so");
	const [chiSo0] = await thuocTinh(
		t,
		`${HOP("moi")} [data-o-chi-so]`,
		"data-o-chi-so",
	);
	if (chiSo0 !== "thoa-thuan-chot-duoc")
		await chonTrongSelect(
			t,
			`${HOP("moi")} [data-o-chi-so]`,
			"Thoả thuận chốt được",
		);
	await doi(
		t,
		"E13 buoc 3: o chi so la thoa thuan chot duoc",
		(s) =>
			window.__tim(`${s} [data-o-chi-so='thoa-thuan-chot-duoc']`).length === 1,
		HOP("moi"),
	);
	const [kieuPv] = await thuocTinh(
		t,
		`${HOP("moi")} [data-o-kieu-pham-vi]`,
		"data-o-kieu-pham-vi",
	);
	const [idPv] = await thuocTinh(
		t,
		`${HOP("moi")} [data-o-pham-vi]`,
		"data-o-pham-vi",
	);
	kiem(
		`E13 buoc 3: pham vi mac dinh la phong ban cua muc tieu ${K.P} (thay ${kieuPv}:${idPv})`,
		kieuPv === "phong-ban" && idPv === K.P,
	);
	await coMat(
		t,
		`${HOP("moi")} [data-xem-truoc='co']`,
		"E13 buoc 3: dong «Tới hôm nay»",
	);
	const [giaXem] = await thuocTinh(
		t,
		`${HOP("moi")} [data-xem-truoc='co']`,
		"data-gia-tri",
	);
	const chuXem = await chuSel(t, `${HOP("moi")} [data-xem-truoc='co']`);
	const raXem = [...traLoi]
		.reverse()
		.find(
			(x) =>
				x.t === "okr.xemTruocChiSo" &&
				x.v?.chiSo === "thoa-thuan-chot-duoc" &&
				giongPhamVi(x.v?.phamVi, { kieu: "phong-ban", id: K.P }) &&
				x.ra !== null,
		);
	kiem(
		`E13 buoc 3: «Tới hôm nay: N» voi N tu response xemTruocChiSo (response ${raXem?.ra?.giaTri ?? "?"}, man «${chuXem}», data-gia-tri ${giaXem})`,
		raXem !== undefined &&
			Number(giaXem) === raXem.ra.giaTri &&
			chuXem === `Tới hôm nay: ${raXem.ra.giaTri} thoả thuận`,
	);
	await chupTai(t, `${HOP("moi")} [data-xem-truoc]`, "buoc-nguon-crm.png");
	await chonTrongSelect(
		t,
		`${HOP("moi")} [data-o-chi-so]`,
		"Cá nhân ghi danh đạt bậc",
	);
	await coMat(
		t,
		`${HOP("moi")} [data-o-bac]`,
		"E13 buoc 3: doi sang ghi danh dat bac -> o bac hien",
	);
	const [bac] = await thuocTinh(t, `${HOP("moi")} [data-o-bac]`, "data-o-bac");

	const h = await moTrang(cookie.truong, HEP, `/okr?record=objective:${K.B}`);
	await coMat(
		h,
		`${SHEET} [data-nut='them-kr']`,
		"E13 buoc 8: nut them KR o 390",
	);
	await bam(h, `${SHEET} [data-nut='them-kr']`);
	await coMat(
		h,
		`${HOP("moi")} [data-lua-chon-nguon='crm']`,
		"E13 buoc 8: hop thoai o 390",
	);
	await bam(h, `${HOP("moi")} [data-lua-chon-nguon='crm']`);
	await coMat(
		h,
		`${HOP("moi")} [data-xem-truoc='co']`,
		"E13 buoc 8: xem truoc o 390",
	);
	await chupTai(h, `${HOP("moi")} [data-xem-truoc]`, "buoc-nguon-crm-390.png");
	await h.close();

	await t.bringToFront();
	await bam(t, `${HOP("moi")} [data-nut='gui-kr']`);
	await doi(
		t,
		"E13 buoc 4: luu KR moi -> hop thoai dong",
		() => window.__tim("[data-hop-thoai-kr]").length === 0,
	);
	const kr = await choDb("E14: KR moi co trong DB", async () => {
		const r = await db.okrKeyResult.findFirst({
			where: { objectiveId: K.B, title: TEN.Kb },
			select: { id: true },
		});
		return { dat: r !== null, thay: r };
	});
	if (!kr?.thay) {
		await t.close();
		return;
	}
	K.Kb = kr.thay.id;
	G.kr.push(K.Kb);
	const phamViMong = { kieu: "phong-ban", id: K.P };
	const n1 = (
		await choDb("E14 sau luu CRM: okrNguonKr loai crm", async () => {
			const n = await nguonDb(K.Kb);
			return { dat: n?.loai === "crm", thay: n };
		})
	)?.thay;
	console.log(`  E14 sau luu CRM: ${JSON.stringify(n1)}`);
	if (n1 && !giongPhamVi(n1.phamVi, phamViMong))
		console.log(
			`  E14: phamVi đọc được trong DB: ${JSON.stringify(n1.phamVi)}`,
		);
	kiem(
		`E14 sau luu CRM: loai/chiSo/bac bang lua chon (crm, ghi-danh-dat-bac, ${bac}) — DB ${n1?.loai}/${n1?.chiSo}/${n1?.bac}`,
		n1?.loai === "crm" &&
			n1?.chiSo === "ghi-danh-dat-bac" &&
			n1?.bac === bac &&
			n1?.sheetId === null &&
			n1?.sheetO === null,
	);
	kiem(
		`E14 sau luu CRM: phamVi đọc được trong DB: ${JSON.stringify(n1?.phamVi ?? null)} (lua chon ${JSON.stringify(phamViMong)})`,
		n1 !== null && giongPhamVi(n1.phamVi, phamViMong),
	);

	await moHopSua(t, TEN.Kb, K.Kb);
	await coMat(
		t,
		`${HOP(K.Kb)} [data-nguon-so='crm']`,
		"E13 buoc 4: mo lai Sua KR, nguon dang la crm",
	);
	await bam(t, `${HOP(K.Kb)} [data-lua-chon-nguon='api']`);
	await coMat(t, `${HOP(K.Kb)} [data-ma-kr='${K.Kb}']`, "E13 buoc 4: ma KR");
	const api = await t.evaluate(
		(s, k) => {
			const o = window.__tim(`${s} [data-ma-kr='${k}']`)[0];
			const nhom2 = o?.closest("[data-slot='input-group']");
			const lenh = window.__tim(`${s} [data-lenh-mau]`)[0];
			return {
				ma: o?.value ?? null,
				nutChep: nhom2?.querySelector("button")?.innerText?.trim() ?? null,
				lenh: lenh?.value ?? null,
				nutChepLenh:
					lenh
						?.closest("[data-slot='input-group']")
						?.querySelector("button")
						?.innerText?.trim() ?? null,
			};
		},
		HOP(K.Kb),
		K.Kb,
	);
	console.log(`  E13 khoa API: ${JSON.stringify(api)}`);
	kiem(
		`E13 buoc 4: ma KR co nut chep (thay ${JSON.stringify(api.nutChep)})`,
		api.ma === K.Kb && api.nutChep === "Chép mã kr",
	);
	kiem(
		`E13 buoc 4: lenh mau chua ${API}/rest/okr/key-results/${K.Kb}/value (thay ${api.lenh})`,
		(api.lenh ?? "").includes(`${API}/rest/okr/key-results/${K.Kb}/value`),
	);
	await chupTai(t, `${HOP(K.Kb)} [data-lenh-mau]`, "buoc-nguon-api.png");
	await bam(t, `${HOP(K.Kb)} [data-nut='gui-kr']`);
	await doi(
		t,
		"E13 buoc 4: luu khoa API -> hop thoai dong",
		() => window.__tim("[data-hop-thoai-kr]").length === 0,
	);
	const n2 = (
		await choDb("E14 sau luu API: okrNguonKr loai api", async () => {
			const n = await nguonDb(K.Kb);
			return { dat: n?.loai === "api", thay: n };
		})
	)?.thay;
	kiem(
		`E14 sau luu API: DB ${JSON.stringify(n2)}`,
		n2?.loai === "api" &&
			n2.chiSo === null &&
			n2.phamVi === null &&
			n2.bac === null &&
			n2.sheetId === null,
	);

	const ha = await moTrang(cookie.truong, HEP, `/okr?record=objective:${K.B}`);
	if (await moHopSua(ha, TEN.Kb, K.Kb)) {
		await coMat(
			ha,
			`${HOP(K.Kb)} [data-lenh-mau]`,
			"E13 buoc 8: lenh mau o 390",
		);
		await chupTai(ha, `${HOP(K.Kb)} [data-lenh-mau]`, "buoc-nguon-api-390.png");
	}
	await ha.close();

	await moHopSua(t, TEN.Kb, K.Kb);
	await coMat(
		t,
		`${HOP(K.Kb)} [data-sheets-tat]`,
		"E13 buoc 6: dong Sheets tat khi sua KR api",
	);
	const thayB = await luaChonThay(t, K.Kb);
	kiem(
		`E13 buoc 6: KR nguon api, phien khong cam Sheets van khong co Sheets (thay ${thayB.join(",")})`,
		!thayB.includes("bang-tinh"),
	);
	await dongHop(t, TEN.Kb);

	const a = await moTrang(cookie.truong, RONG, `/okr?record=objective:${K.A}`);
	await coMat(
		a,
		`${SHEET} [data-kr-hang='${K.Kcrm}']`,
		"E13 buoc 7: bang KR muc tieu cong bo",
	);
	if (await moHopSua(a, TEN.Kcrm, K.Kcrm)) {
		const khoa = await a.evaluate((s) => {
			const f = window.__tim(`${s} [data-nguon-so]`)[0];
			return {
				nguon: f?.getAttribute("data-nguon-so") ?? null,
				khoa: f?.hasAttribute("data-khoa") ?? false,
				tatCaTat: window
					.__tim(`${s} [data-lua-chon-nguon]`)
					.every((b) => b.disabled || b.getAttribute("data-disabled") !== null),
				chuThich: window.__tim(`${s} [data-nguon-khoa]`)[0]?.innerText ?? "",
				nutDoCanh: window.__tim(`${s} [data-nut='them-do-canh']`).length,
			};
		}, HOP(K.Kcrm));
		kiem(
			`E13 buoc 7: KR crm cua muc tieu cong bo -> o nguon khoa + chu thich (thay ${JSON.stringify(khoa)})`,
			khoa.nguon === "crm" &&
				khoa.khoa &&
				khoa.tatCaTat &&
				khoa.chuThich === "Nguồn khoá khi mục tiêu công bố." &&
				khoa.nutDoCanh === 0,
		);
		await chupTai(a, `${HOP(K.Kcrm)} [data-nguon-khoa]`, "buoc-khoa-crm.png");
		await dongHop(a, TEN.Kcrm);
	}
	await a.close();
	const a2 = await moTrang(cookie.truong, RONG, `/okr?record=objective:${K.A}`);
	await coMat(
		a2,
		`${SHEET} [data-kr-hang='${K.Ktay}']`,
		"E13 buoc 7: bang KR (KR tay)",
	);
	if (await moHopSua(a2, TEN.Ktay, K.Ktay)) {
		await coMat(
			a2,
			`${HOP(K.Ktay)} [data-nut='them-do-canh']`,
			"E13 buoc 7: KR tay -> nut «Thêm số đo cạnh»",
		);
		kiem(
			`E13 buoc 7: nut ghi «Thêm số đo cạnh» (thay «${await chuSel(a2, `${HOP(K.Ktay)} [data-nut='them-do-canh']`)}»)`,
			(await chuSel(a2, `${HOP(K.Ktay)} [data-nut='them-do-canh']`)) ===
				"Thêm số đo cạnh",
		);
		await chupTai(
			a2,
			`${HOP(K.Ktay)} [data-nut='them-do-canh']`,
			"buoc-khoa.png",
		);
	}
	await a2.close();
	await t.close();

	if (!sheets) {
		kiem("E13/E14: phien Sheets khong dung duoc", false);
		return;
	}
	await buocSheets(sheets);
}

async function soViecDoc(krId) {
	const ds = await db.agentTask.findMany({
		where: {
			kind: "okr-doc-sheet",
			payload: { path: ["keyResultId"], equals: krId },
		},
		select: { id: true, finishedAt: true, outcome: true },
	});
	return {
		tong: ds.length,
		mo: ds.filter((d) => d.finishedAt === null).length,
		ds,
	};
}

async function chayTacTu(sheets, krId) {
	for (const [k, v] of Object.entries(sheets.bien)) process.env[k] = v;
	const { claimDue } = await import("../../../apps/agent/agent/lib/tasks.ts");
	const { chayDocSheet } = await import(
		"../../../apps/agent/agent/lib/okr-sheets.ts"
	);
	const viec = await claimDue(10, { only: ["okr-doc-sheet"] });
	const cua = viec.filter((v) => v.payload?.keyResultId === krId);
	kiem(
		`E14: tac tu lay dung viec okr-doc-sheet cua KR (lay ${viec.length}, cua KR ${cua.length})`,
		cua.length === 1 && viec.length === 1,
	);
	for (const v of cua) await chayDocSheet(v);
}

async function buocSheets(sheets) {
	nhom = "E13/E14 Sheets";
	const t = await moTrang(
		cookie.truong,
		RONG,
		`/okr?record=objective:${K.B}`,
		sheets.app,
	);
	if (!(await moHopSua(t, TEN.Kb, K.Kb))) {
		await t.close();
		return;
	}
	await coMat(
		t,
		`${HOP(K.Kb)} [data-lua-chon-nguon='bang-tinh']`,
		"E13 buoc 5: phien cam Sheets hien lua chon Google Sheets",
	);
	const thay = await luaChonThay(t, K.Kb);
	kiem(
		`E13 buoc 5: phien cam Sheets co lua chon Google Sheets (thay ${thay.join(",")})`,
		thay.includes("bang-tinh"),
	);
	await bam(t, `${HOP(K.Kb)} [data-lua-chon-nguon='bang-tinh']`);
	await coMat(
		t,
		`${HOP(K.Kb)} [data-email-sheets='${EMAIL_SHEETS}']`,
		"E13 buoc 5: email tai khoan dich vu",
	);
	const chuEmail = await chuSel(t, `${HOP(K.Kb)} [data-email-sheets]`);
	kiem(
		`E13 buoc 5: dong chia se ghi email (thay «${chuEmail}»)`,
		chuEmail === `Chia sẻ bảng tính cho ${EMAIL_SHEETS}`,
	);
	await go(
		t,
		`${HOP(K.Kb)} [data-o-duong-dan]`,
		`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`,
	);
	await go(t, `${HOP(K.Kb)} [data-o-sheet]`, O_SO);
	await bam(t, `${HOP(K.Kb)} [data-nut='gui-kr']`);
	await coMat(
		t,
		`${HOP(K.Kb)} [data-doc-thu='dang-doc']`,
		"E13 buoc 5: «Đang đọc thử…»",
	);
	kiem(
		`E13 buoc 5: chu «Đang đọc thử…» (thay «${await chuSel(t, `${HOP(K.Kb)} [data-doc-thu='dang-doc']`)}»)`,
		(await chuSel(t, `${HOP(K.Kb)} [data-doc-thu='dang-doc']`)) ===
			"Đang đọc thử…",
	);
	const n1 = await nguonDb(K.Kb);
	kiem(
		`E14 sau luu Sheets: DB ${JSON.stringify(n1)} bang lua chon (bang-tinh, ${SHEET_ID}, ${O_SO})`,
		n1?.loai === "bang-tinh" &&
			n1.sheetId === SHEET_ID &&
			n1.sheetO === O_SO &&
			n1.chiSo === null &&
			n1.phamVi === null,
	);
	const v1 = await soViecDoc(K.Kb);
	kiem(
		`E14 sau luu Sheets: dung mot hang AgentTask okr-doc-sheet cho KR (thay ${v1.tong}, mo ${v1.mo})`,
		v1.tong === 1 && v1.mo === 1,
	);
	await chayTacTu(sheets, K.Kb);
	await coMat(
		t,
		`${HOP(K.Kb)} [data-doc-thu='doc-duoc'][data-gia-tri='${GIA_TRI_O}']`,
		"E13 buoc 5: «Đọc được 1.240 lúc HH:MM»",
	);
	const docDuoc = await chuSel(t, `${HOP(K.Kb)} [data-doc-thu='doc-duoc']`);
	kiem(
		`E13 buoc 5: chu doc duoc (thay «${docDuoc}»)`,
		/^Đọc được 1\.240 lúc \d{2}:\d{2}$/.test(docDuoc),
	);
	const n2 = await nguonDb(K.Kb);
	const v2 = await soViecDoc(K.Kb);
	kiem(
		`E14: tac tu ghi docGiaTri=${GIA_TRI_O}, docLuc, docLoi=null (DB ${JSON.stringify(n2)}; viec ${JSON.stringify(v2.ds)})`,
		n2?.docGiaTri === GIA_TRI_O &&
			n2.docLuc !== null &&
			n2.docLoi === null &&
			v2.mo === 0,
	);
	await chupTai(t, `${HOP(K.Kb)} [data-doc-thu]`, "buoc-nguon-sheets.png");

	await go(t, `${HOP(K.Kb)} [data-o-sheet]`, O_CHU);
	await bam(t, `${HOP(K.Kb)} [data-nut='gui-kr']`);
	await coMat(
		t,
		`${HOP(K.Kb)} [data-doc-thu='dang-doc']`,
		"E13 buoc 5 o chu: «Đang đọc thử…»",
	);
	const v3 = await soViecDoc(K.Kb);
	kiem(
		`E14 sau luu o chu: them dung mot viec okr-doc-sheet (tong ${v3.tong}, mo ${v3.mo})`,
		v3.tong === 2 && v3.mo === 1,
	);
	await chayTacTu(sheets, K.Kb);
	await coMat(
		t,
		`${HOP(K.Kb)} [data-doc-thu='loi'][data-ly-do='khong-phai-so']`,
		"E13 buoc 5: o khong phai so -> nguyen nhan co ten",
	);
	const lyDo = await chuSel(t, `${HOP(K.Kb)} [data-doc-thu='loi']`);
	kiem(
		`E13 buoc 5: nguyen nhan «Ô này không chứa một con số» (thay «${lyDo}»)`,
		lyDo === "Ô này không chứa một con số",
	);
	await coMat(
		t,
		`${HOP(K.Kb)} [data-nut='doc-lai']`,
		"E13 buoc 5: nut «Đọc lại»",
	);
	kiem(
		`E13 buoc 5: nut ghi «Đọc lại» (thay «${await chuSel(t, `${HOP(K.Kb)} [data-nut='doc-lai']`)}»)`,
		(await chuSel(t, `${HOP(K.Kb)} [data-nut='doc-lai']`)) === "Đọc lại",
	);
	const n3 = await nguonDb(K.Kb);
	kiem(
		`E14 o chu: docLoi=khong-phai-so, sheetO=${O_CHU} (DB ${JSON.stringify(n3)})`,
		n3?.docLoi === "khong-phai-so" &&
			n3.sheetO === O_CHU &&
			n3.docGiaTri === null,
	);
	await chupTai(t, `${HOP(K.Kb)} [data-doc-thu]`, "buoc-sheets-loi.png");
	kiem(
		`E14: Google gia nhan dung token + hai lan doc (${JSON.stringify(sheets.goi)})`,
		sheets.goi.filter((g) => g.loai === "token").length >= 1 &&
			sheets.goi
				.filter((g) => g.loai === "values")
				.map((g) => g.o)
				.join("|") === `${O_SO}|${O_CHU}`,
	);
	await t.close();
}

async function buocCapNhat() {
	nhom = "E19";
	const hDoCanh = await soChup(K.KdoCanh, D0);
	const hCrm = await soChup(K.Kcrm, D0);
	const h = await moTrang(cookie.truong, HEP, "/okr/cap-nhat-tuan");
	await coMat(
		h,
		`[data-kr='${K.Kcrm}'][data-nguon='crm']`,
		"E19 buoc 5: dong KR crm o 390",
	);
	await chupTai(
		h,
		`[data-kr='${K.Kcrm}'] [data-o='gia-tri']`,
		"buoc-cap-nhat-390.png",
	);
	await h.close();

	const t = await moTrang(cookie.truong, RONG, "/okr/cap-nhat-tuan");
	await coMat(
		t,
		`[data-kr='${K.Kcrm}'][data-nguon='crm']`,
		"E19 buoc 2: dong KR crm",
	);
	const dong = (k) =>
		t.evaluate((krId) => {
			const hang = window.__tim(`[data-kr='${krId}']`)[0];
			if (!hang) return null;
			const o = hang.querySelector("[data-o='gia-tri'] input");
			return {
				nguon: hang.getAttribute("data-nguon"),
				disabled: o?.disabled ?? null,
				khoa: o?.hasAttribute("data-khoa") ?? false,
				value: o?.value ?? null,
				moTa:
					hang
						.querySelector("[data-o='gia-tri'] [data-slot='field-description']")
						?.innerText?.trim() ?? "",
				tuTinBat: [...hang.querySelectorAll("[data-o='tu-tin'] button")].map(
					(b) => !b.disabled,
				),
				ghiChuBat:
					hang.querySelector("[data-o='ghi-chu'] input")?.disabled === false,
			};
		}, k);
	const crm = await dong(K.Kcrm);
	console.log(`  E19 dong KR crm: ${JSON.stringify(crm)}`);
	if (crm && crm.disabled !== true)
		console.log("  E19: ô giá trị của KR crm không disabled");
	kiem(
		`E19 buoc 2: ô giá trị của KR crm không disabled (thay ${JSON.stringify(crm?.disabled)})`,
		crm?.disabled === true && crm.khoa,
	);
	kiem(
		`E19 buoc 2: chu «Số từ CRM · ${nhanNgay(D0)}» (thay «${crm?.moTa}»)`,
		crm?.moTa === `Số từ CRM · ${nhanNgay(D0)}`,
	);
	kiem(
		`E19 buoc 2: gia tri o khoa bang so may ${hCrm} (thay ${crm?.value})`,
		crm?.value === String(hCrm),
	);
	kiem(
		`E19 buoc 2: nhom muc tu tin va o ghi chu bat (thay ${JSON.stringify({ tuTin: crm?.tuTinBat, ghiChu: crm?.ghiChuBat })})`,
		crm !== null &&
			crm.tuTinBat.length === 3 &&
			crm.tuTinBat.every(Boolean) &&
			crm.ghiChuBat,
	);
	const hangCrm = await phanTu(t, `[data-kr='${K.Kcrm}']`);
	await hangCrm?.evaluate((e) => e.scrollIntoView({ block: "center" }));
	await chup(t, "buoc-cap-nhat-may.png");

	const dc = await dong(K.KdoCanh);
	console.log(`  E19 dong KR do canh: ${JSON.stringify(dc)}`);
	kiem(
		`E19 buoc 3: dong do canh o gia tri bat, value bang so may ${hDoCanh} (thay ${JSON.stringify(dc)})`,
		dc?.nguon === "tay" &&
			dc.disabled === false &&
			!dc.khoa &&
			dc.value === String(hDoCanh),
	);
	kiem(
		`E19 buoc 3: chu «Số máy: ${hDoCanh} · ${nhanNgay(D0)}» (thay «${dc?.moTa}»)`,
		dc?.moTa === `Số máy: ${hDoCanh} · ${nhanNgay(D0)}`,
	);
	const hangDc = await phanTu(t, `[data-kr='${K.KdoCanh}']`);
	await hangDc?.evaluate((e) => e.scrollIntoView({ block: "center" }));
	await chup(t, "buoc-cap-nhat-do-canh.png");

	const truocGui = await t.evaluate((krId) => {
		const hang = window.__tim(`[data-kr='${krId}']`)[0];
		return {
			daChon: [
				...(hang?.querySelectorAll("[data-o='tu-tin'] [data-state='on']") ??
					[]),
			].length,
			nutGui: document.querySelector("[data-nut='gui']")?.disabled ?? null,
			thanh: [...document.querySelectorAll("[aria-live='polite']")]
				.map((e) => e.innerText.trim())
				.join(" | "),
		};
	}, K.Kcrm);
	console.log(`  E19 gui thieu muc tu tin: ${JSON.stringify(truocGui)}`);
	kiem(
		`E19 buoc 4: thieu muc tu tin cho KR crm -> khong gui duoc (thay ${JSON.stringify(truocGui)})`,
		truocGui.daChon === 0 &&
			truocGui.nutGui === true &&
			truocGui.thanh.includes("Đã chọn mức tự tin 0/"),
	);
	await bam(t, `[data-kr='${K.Kcrm}'] [data-o='tu-tin'] button`, "Vừa");
	await doi(
		t,
		"E19 buoc 4: chon muc Vua -> nut Gui bat",
		() => document.querySelector("[data-nut='gui']")?.disabled === false,
	);
	await bam(t, "[data-nut='gui']");
	await coMat(
		t,
		"[data-trang-thai='ST-capnhat-dagui']",
		"E19 buoc 4: gui -> thanh cong",
	);
	const ci = await choDb("E19 buoc 4: okrCheckIn cua KR crm", async () => {
		const r = await db.okrCheckIn.findFirst({
			where: { keyResultId: K.Kcrm },
			orderBy: { createdAt: "desc" },
			select: { value: true, confidence: true },
		});
		return {
			dat: r !== null,
			thay: r ? { value: Number(r.value), confidence: r.confidence } : null,
		};
	});
	kiem(
		`E19 buoc 4: DB ghi KR crm gia tri ${hCrm}, tu tin vua (thay ${JSON.stringify(ci?.thay)})`,
		ci?.thay?.value === hCrm && ci?.thay?.confidence === "vua",
	);
	await t.close();
}

async function congTuDo(boQua = []) {
	for (let k = 0; k < 200; k += 1) {
		const cong = 5200 + Math.floor(Math.random() * 700);
		if (boQua.includes(cong)) continue;
		const ban = await new Promise((xong) => {
			const may = createServer();
			may.once("error", () => xong(true));
			may.listen({ port: cong }, () => may.close(() => xong(false)));
		});
		if (!ban) return cong;
	}
	throw new Error("khong con cong tu do cho phien Sheets");
}

async function sinhKhoa() {
	const cap = await webcrypto.subtle.generateKey(
		{
			name: "RSASSA-PKCS1-v1_5",
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256",
		},
		true,
		["sign", "verify"],
	);
	const der = await webcrypto.subtle.exportKey("pkcs8", cap.privateKey);
	const dong =
		Buffer.from(der)
			.toString("base64")
			.match(/.{1,64}/g) ?? [];
	const pem = [
		"-----BEGIN PRIVATE KEY-----",
		...dong,
		"-----END PRIVATE KEY-----",
		"",
	].join("\n");
	return { pemEnv: pem.replace(/\n/g, "\\n"), congKhai: cap.publicKey };
}

const may = [];

function khoiMay(ten, thamSo, noiChay, env) {
	const nhatKy = join(tmpdir(), `so-okr-${ten}-${process.pid}.log`);
	const fd = openSync(nhatKy, "w");
	const con = spawn("bun", thamSo, {
		cwd: noiChay,
		env,
		detached: true,
		stdio: ["ignore", fd, fd],
	});
	may.push({ ten, con, nhatKy });
	return { ten, con, nhatKy };
}

function tatMay() {
	for (const m of may) {
		try {
			process.kill(-m.con.pid, "SIGTERM");
		} catch {}
	}
}

async function choSan(m, url, chiNhan200) {
	const het = Date.now() + CHO_MAY_CHU_MS;
	while (Date.now() < het) {
		if (m.con.exitCode !== null)
			throw new Error(
				`may chu ${m.ten} thoat som: ${readFileSync(m.nhatKy, "utf8").slice(-600)}`,
			);
		try {
			const r = await fetch(url, {
				redirect: "manual",
				signal: AbortSignal.timeout(5000),
			});
			if (!chiNhan200 || r.status === 200) return;
		} catch {}
		await cho(500);
	}
	throw new Error(
		`may chu ${m.ten} khong san sang o ${url}: ${readFileSync(m.nhatKy, "utf8").slice(-600)}`,
	);
}

async function dungPhienSheets() {
	const khoa = await sinhKhoa();
	const goiGoogle = [];
	const google = Bun.serve({
		port: 0,
		hostname: "127.0.0.1",
		async fetch(req) {
			const u = new URL(req.url);
			if (req.method === "POST" && u.pathname === "/token") {
				const than = new URLSearchParams(await req.text());
				const [dau, noi, ky] = (than.get("assertion") ?? "").split(".");
				const dung = await webcrypto.subtle.verify(
					"RSASSA-PKCS1-v1_5",
					khoa.congKhai,
					Buffer.from(ky ?? "", "base64url"),
					new TextEncoder().encode(`${dau}.${noi}`),
				);
				goiGoogle.push({ loai: "token", dungChuKy: dung });
				if (!dung) return new Response("sai chu ky", { status: 400 });
				return Response.json({
					access_token: "tok-thuoc",
					expires_in: 3599,
					token_type: "Bearer",
				});
			}
			const m = u.pathname.match(
				/^\/v4\/spreadsheets\/([^/]+)\/values\/([^/]+)$/,
			);
			if (req.method === "GET" && m) {
				const o = decodeURIComponent(m[2]);
				goiGoogle.push({
					loai: "values",
					sheetId: decodeURIComponent(m[1]),
					o,
				});
				if (req.headers.get("authorization") !== "Bearer tok-thuoc")
					return new Response("khong co token", { status: 401 });
				if (decodeURIComponent(m[1]) !== SHEET_ID)
					return new Response("khong thay", { status: 404 });
				const gia = o === O_SO ? GIA_TRI_O : o === O_CHU ? "chưa có số" : null;
				return Response.json(
					gia === null
						? { range: o, majorDimension: "ROWS" }
						: { range: o, majorDimension: "ROWS", values: [[gia]] },
				);
			}
			return new Response("khong biet", { status: 404 });
		},
	});
	const bien = {
		GOOGLE_SHEETS_EMAIL: EMAIL_SHEETS,
		GOOGLE_SHEETS_KHOA: khoa.pemEnv,
		OKR_SHEETS_TOKEN_URL: `http://127.0.0.1:${google.port}/token`,
		OKR_SHEETS_API_URL: `http://127.0.0.1:${google.port}/v4/spreadsheets`,
	};
	const congApp = await congTuDo();
	const congApi = await congTuDo([congApp]);
	const app = `http://localhost:${congApp}`;
	const api = `http://localhost:${congApi}`;
	const env = { ...process.env, ...bien, APP_URL: app, API_URL: api };
	const mApi = khoiMay("api-sheets", ["src/main.ts"], join(GOC, "apps/api"), {
		...env,
		PORT: String(congApi),
	});
	const mApp = khoiMay("app-sheets", ["run", "dev"], join(GOC, "apps/app"), {
		...env,
		PORT: String(congApp),
		NEXT_PUBLIC_API_URL: api,
		PROTO_DIST_DIR: `.next-phien-do-sheets-${process.env.PHIEN_DO ?? "tay"}`,
	});
	console.log(
		`  phien Sheets: app ${app} · api ${api} · google gia ${bien.OKR_SHEETS_API_URL}`,
	);
	await choSan(mApi, `${api}/health`, true);
	await choSan(mApp, app, false);
	const ten = `canh-cay-sheets-${MA}.svg`;
	const noi = join(GOC, "apps/app/public", ten);
	writeFileSync(
		noi,
		`<svg xmlns="http://www.w3.org/2000/svg" data-canh-cay="${ten}"/>`,
	);
	try {
		const r = await fetch(`${app}/${ten}`);
		const chu = await r.text();
		if (!chu.includes(ten))
			throw new Error(`canh cay phien Sheets: ${app} khong phuc vu cay nay`);
	} finally {
		rmSync(noi, { force: true });
	}
	const chiSo = await (
		await fetch(`${api}/api/trpc/okr.chiSo`, { headers: mu(cookie.truong) })
	).json();
	if (chiSo?.result?.data?.sheetsBat !== true)
		throw new Error(
			`api phien Sheets khong bao sheetsBat: ${JSON.stringify(chiSo).slice(0, 200)}`,
		);
	return { app, api, bien, google, goi: goiGoogle };
}

trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);

class KhongDoDuoc extends Error {}
let khongDoLy = null;
let metaCu = null;
let doiMeta = false;
let sheets = null;
let ma = 0;
const bat = Date.now();
for (const tin of ["SIGINT", "SIGTERM"])
	process.on(tin, () => {
		tatMay();
		process.exit(130);
	});
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
	if (chon(["E13", "E14"])) {
		const r = await fetch(`${API}/api/trpc/okr.chiSo`, {
			headers: mu(cookie.admin),
		});
		const bat = (await r.json())?.result?.data?.sheetsBat;
		if (bat !== false)
			throw new KhongDoDuoc(
				`phien do chinh bao sheetsBat=${bat} — E13 buoc 6 can phien chinh khong cam GOOGLE_SHEETS_*; bo hai bien do khoi moi truong roi chay lai`,
			);
	}
	const hua = chon(["E13", "E14"])
		? dungPhienSheets().catch((e) => {
				hong.push(`phien Sheets: ${String(e).slice(0, 600)}`);
				return null;
			})
		: Promise.resolve(null);
	await gieo();
	if (chon(["E11", "E12"])) {
		const b = Date.now();
		await buocSo().catch((e) =>
			hong.push(`E11/E12: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  nhom E11/E12: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	if (chon(["E13", "E14"])) {
		const b = Date.now();
		sheets = await hua;
		await buocNguon(sheets).catch((e) =>
			hong.push(`E13/E14: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  nhom E13/E14: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	if (chon(["E19"])) {
		const b = Date.now();
		await buocCapNhat().catch((e) =>
			hong.push(`E19: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  nhom E19: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	kiem(
		`khong loi console (${loiConsole.length}): ${loiConsole.slice(0, 6).join(" || ")}`,
		loiConsole.length === 0,
	);
} catch (e) {
	if (e instanceof KhongDoDuoc) khongDoLy = e.message;
	else hong.push(`tien de: nem ${String(e).slice(0, 400)}`);
} finally {
	await donDep().catch((e) => hong.push(`don dep: ${String(e).slice(0, 300)}`));
	if (doiMeta)
		await db.organization
			.update({ where: { id: WORKSPACE_ID }, data: { metadata: metaCu } })
			.catch((e) => hong.push(`tra onboard: ${String(e).slice(0, 200)}`));
	const conKy = await db.okrCycle.count();
	if (conKy > 0) hong.push(`don dep: con ${conKy} chu ky trong kho`);
	const conDeal = await db.deal.count({ where: { id: { in: G.deal } } });
	if (conDeal > 0) hong.push(`don dep: con ${conDeal} thoa thuan cua thuoc`);
	sheets?.google.stop(true);
	tatMay();
	writeFileSync(
		join(BANG_CHUNG, "man-so-tu-chay-network.txt"),
		mang.join("\n"),
	);
	console.log(
		`man-so-tu-chay: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh (${anh.join(", ")}), ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	console.log(`  anh o ${relative(GOC, BANG_CHUNG)}/`);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
	if (khongDoLy !== null) {
		console.log(`KHONG DO DUOC: ${khongDoLy}`);
		ma = 2;
	}
}
await ket(ma);
