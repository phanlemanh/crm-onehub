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
const HO_SO = "sua-an-chu-ky-okr";
const BANG_CHUNG =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "evidence");
const MOI_EVAL = ["E14", "E15"];
const LENH_DO =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/sua-an-chu-ky-okr/rang/man-sua-an.mjs"';

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

const TEP_CAI_DAT = "apps/app/app/(app)/[slug]/settings/okr";
const VET = {
	E14: {
		tep: `${TEP_CAI_DAT}/sheet-sua-chu-ky.tsx`,
		mo: "ban sao sheet sua khong tat o ngay khi chi sua duoc ten",
		cam: (s) => s.replace("khoaNgoaiTen={khoa}", "khoaNgoaiTen={false}"),
		ghim: /ô ngày còn bật/,
	},
	E15: {
		tep: `${TEP_CAI_DAT}/hop-thoai-an-chu-ky.tsx`,
		mo: "ban sao hop an gui ly do rong thay chu da go",
		cam: (s) =>
			s.replace(
				"an.mutate({ id: ky.id, lyDo: lyDo.trim() });",
				'an.mutate({ id: ky.id, lyDo: "" });',
			),
		ghim: /note doc duoc «[^»]*» khac ly do da go «[^»]*»; okr\.anChuKy tra 4\d\d/,
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
	const tam = mkdtempSync(join(tmpdir(), "sua-an-chieu-do-"));
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
		moiTruong.PHIEN_DO_TEN_CAY = "sua-an-chieu-do";
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

const ngayVN = (d) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const dauQuy = (y, q) => ngay(y, q * 3 - 2, 1);
const cuoiQuy = (y, q) => ngay(y, q * 3, cuoiThang(y, q * 3));

const KHOA_HANG = ["Y", "T", "D", "N", "DD", "A"];

function keHoach(homNay) {
	const nam = Number(homNay.slice(0, 4));
	const ke = nam + 1;
	const truoc = nam - 1;
	return {
		namKe: ke,
		namTruoc: truoc,
		Y: { kind: "nam", cha: null, tu: ngay(ke, 1, 1), den: ngay(ke, 12, 31) },
		T: { kind: "quy", cha: "Y", tu: dauQuy(ke, 2), den: cuoiQuy(ke, 2) },
		D: { kind: "quy", cha: "Y", tu: dauQuy(ke, 1), den: cuoiQuy(ke, 1) },
		N: {
			kind: "nam",
			cha: null,
			tu: ngay(truoc, 1, 1),
			den: ngay(truoc, 12, 31),
		},
		DD: {
			kind: "quy",
			cha: "N",
			tu: dauQuy(truoc, 4),
			den: cuoiQuy(truoc, 4),
		},
		A: {
			kind: "quy",
			cha: "N",
			tu: dauQuy(truoc, 3),
			den: cuoiQuy(truoc, 3),
		},
	};
}

function theoNam(cycles) {
	const nam = cycles.filter((c) => c.kind === "nam");
	const coCha = new Set(nam.map((c) => c.id));
	return [
		...nam.flatMap((n) => [n, ...cycles.filter((c) => c.parentId === n.id)]),
		...cycles.filter(
			(c) =>
				c.kind !== "nam" && (c.parentId === null || !coCha.has(c.parentId)),
		),
	];
}

function thuTuMan(rows) {
	const api = [...rows].sort(
		(a, b) =>
			b.startsOn.localeCompare(a.startsOn) ||
			(a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0),
	);
	return [
		...theoNam(api.filter((c) => !c.an)),
		...theoNam(api.filter((c) => c.an)),
	].map((c) => c.id);
}

function hangKeHoach(homNay, an, bo = []) {
	const k = keHoach(homNay);
	return KHOA_HANG.filter((x) => !bo.includes(x)).map((x) => ({
		id: x,
		kind: k[x].kind,
		parentId: k[x].cha,
		startsOn: k[x].tu,
		an: an.includes(x),
	}));
}

const CANH_THU_TU = [
	["luc mo", [["A"], []], ["Y", "T", "D", "N", "DD", "A"]],
	["sau go T, an D", [["A", "D"], ["T"]], ["Y", "N", "DD", "D", "A"]],
	["sau hien lai D", [["A"], ["T"]], ["Y", "D", "N", "DD", "A"]],
];

if (process.argv.includes("--thu-tu")) {
	let sai = 0;
	for (const d of [
		"2026-09-30",
		"2026-10-01",
		"2026-12-31",
		"2027-01-01",
		ngayVN(new Date()),
	]) {
		const k = keHoach(d);
		const hopLe =
			k.D.tu > d && k.T.tu > k.D.den && k.DD.den < d && k.A.den < k.DD.tu;
		for (const [canh, [an, bo], mong] of CANH_THU_TU) {
			const thay = thuTuMan(hangKeHoach(d, an, bo));
			const dung = JSON.stringify(thay) === JSON.stringify(mong) && hopLe;
			if (!dung) sai += 1;
			console.log(
				`${dung ? "DUNG" : "SAI "} hom nay ${d} (Y ${k.namKe}, N ${k.namTruoc}) ${canh}: ${thay.join(",")}${hopLe ? "" : " — ngay gieo khong hop le"}`,
			);
		}
	}
	process.exit(sai === 0 ? 0 : 1);
}

if (process.argv.includes("--chieu-do")) await chieuDo();

const { default: puppeteer } = await import("puppeteer-core");
const { db } = await import("../../../packages/db/src/index.ts");
const { isOnboarded, markOnboarded, WORKSPACE_ID } = await import(
	"../../../packages/db/src/workspace.ts"
);
const { formatDay } = await import("../../../packages/ui/src/lib/format.ts");
const { okrMessages } = await import("../../../apps/app/lib/messages/okr.ts");
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
	lanGo: 3,
};
const MA = `s${Date.now().toString(36).slice(-6)}`;
const LOI_BO_QUA = /Download the React DevTools/;
const CHU = okrMessages("vi");
const C = CHU.caiDat;
const V = C.chuKy.viec;
const CHU_KHEP = okrKhepMessages("vi").caiDat;

console.log(
	CHON.size === 0
		? `man-sua-an: chay tron ${MOI_EVAL.length} eval; chay rieng: --chi E14 (ma: ${MOI_EVAL.join(", ")}); chieu do: --chieu-do`
		: `man-sua-an: chi chay ${[...CHON].join(", ")}${process.env.CHIEU_DO ? ` (ban sao chieu do ${process.env.CHIEU_DO})` : ""}`,
);

mkdirSync(BANG_CHUNG, { recursive: true });

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const chuKySan = await db.okrCycle.count();
if (chuKySan > 0)
	await khongDo(
		`KHONG DO DUOC: tien de thieu — kho da co ${chuKySan} chu ky OKR ngoai fixture.`,
		"    Thuoc can kho khong co chu ky nao de sau hang da gieo bang chi co sau hang cua thuoc.",
	);

const HOM_NAY = ngayVN(new Date());
const KE = keHoach(HOM_NAY);
const ngayDb = (d) => (d ? d.toISOString().slice(0, 10) : null);

const NGUOI = {
	admin: { email: `a${MA}@thu.test`, vai: "admin", ten: "Nguyễn Minh An" },
	thuong: { email: `m${MA}@thu.test`, vai: "member", ten: "Lê Văn Thường" },
};

const TEN = {
	P: `Phòng Kế hoạch chu kỳ ${MA}`,
	Y: `Năm ${KE.namKe} ${MA}`,
	T: `Quý 2/${KE.namKe} ${MA}`,
	D: `Quý 1/${KE.namKe} ${MA}`,
	N: `Năm ${KE.namTruoc} ${MA}`,
	DD: `Quý 4/${KE.namTruoc} ${MA}`,
	A: `Quý 3/${KE.namTruoc} ${MA}`,
	tMoi: `Quý 2/${KE.namKe} dời lịch ${MA}`,
	dMoi: `Quý 1/${KE.namKe} đối tác ${MA}`,
	mtD: "Đối tác mới được đỡ trọn tháng đầu",
	mtA: "Mạng lưới đối tác phía Nam phủ đủ tỉnh",
	lyDoA: "Mở trùng với quý đã có",
	lyDoD: "Mở nhầm quý đối tác.",
};
const T_CUOI_MOI = ngay(KE.namKe, 6, 15);
const THU_MOI = 3;

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
const mang = [];
const loiConsole = [];
let lanGoLai = 0;
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
	return dat;
};
const e14 = (nhan, dat) => (chon(["E14"]) ? kiem(`E14 ${nhan}`, dat) : dat);
const e15 = (nhan, dat) => (chon(["E15"]) ? kiem(`E15 ${nhan}`, dat) : dat);
const cho = (ms) => new Promise((r) => setTimeout(r, ms));
let slug = "";
let trinhDuyet = null;

async function taoKy(kind, name, parentId, startsOn, endsOn) {
	const r = await lam(cookie.admin, "okr.createCycle", {
		kind,
		name,
		parentId,
		startsOn,
		endsOn,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(r.id);
	return r.id;
}

async function taoMt(cycleId, title) {
	const r = await lam(cookie.admin, "okr.createObjective", {
		cycleId,
		unit: { level: "phong-ban", departmentId: K.P },
		title,
		kind: "cam-ket",
		ownerUserId: id.admin,
		participantIds: [],
		whyNow: "",
	});
	G.mt.push(r.id);
	return r.id;
}

const doiPha = (ky, phase) =>
	lam(cookie.admin, "okr.setCyclePhase", { id: ky, phase });

async function gieo() {
	const pb = await lam(cookie.admin, "org.createDepartment", {
		name: TEN.P,
		divisionId: null,
	});
	G.pb.push(pb.id);
	K.P = pb.id;
	await lam(cookie.admin, "org.setPlacement", {
		userId: id.admin,
		primaryDepartmentId: K.P,
		secondaryDepartmentIds: [],
		managerUserId: null,
	});
	await lam(cookie.admin, "org.setHead", {
		kind: "department",
		id: K.P,
		userId: id.admin,
	});
	const ky = (khoa) =>
		taoKy(
			KE[khoa].kind,
			TEN[khoa],
			KE[khoa].cha ? K[KE[khoa].cha] : null,
			KE[khoa].tu,
			KE[khoa].den,
		);
	K.Y = await ky("Y");
	K.D = await ky("D");
	await doiPha(K.D, "dang-chay");
	K.mtD = await taoMt(K.D, TEN.mtD);
	K.T = await ky("T");
	K.N = await ky("N");
	K.DD = await ky("DD");
	await doiPha(K.DD, "dang-chay");
	await doiPha(K.DD, "cham-diem");
	await doiPha(K.DD, "da-dong");
	K.A = await ky("A");
	K.mtA = await taoMt(K.A, TEN.mtA);
	await lam(cookie.admin, "okr.anChuKy", { id: K.A, lyDo: TEN.lyDoA });
	const dong = await db.okrCycle.findMany({
		where: { id: { in: G.ky } },
		select: { id: true, name: true, phase: true, anLuc: true },
	});
	const nhan = Object.fromEntries(KHOA_HANG.map((k) => [K[k], k]));
	console.log(
		`  gieo: ${dong.map((r) => `${nhan[r.id]}=${r.phase}${r.anLuc ? "/an" : ""}`).join(" ")}; hom nay ${HOM_NAY}, Y ${KE.namKe} (D quy 1, T quy 2), N ${KE.namTruoc} (Đ quy 4, A quy 3)`,
	);
}

async function donDep() {
	const mtKy = await db.okrObjective.findMany({
		where: { cycleId: { in: G.ky } },
		select: { id: true },
	});
	G.mt = [...new Set([...G.mt, ...mtKy.map((r) => r.id)])];
	const kr = (
		await db.okrKeyResult.findMany({
			where: { objectiveId: { in: G.mt } },
			select: { id: true },
		})
	).map((r) => r.id);
	const nguoi = Object.values(id);
	await db.okrMangSang.deleteMany({
		where: {
			OR: [
				{ tuObjectiveId: { in: G.mt } },
				{ sangObjectiveId: { in: G.mt } },
				{ sangCycleId: { in: G.ky } },
			],
		},
	});
	await db.okrDoiDich.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrDiemKr.deleteMany({
		where: { OR: [{ keyResultId: { in: kr } }, { cycleId: { in: G.ky } }] },
	});
	await db.okrNhinLai.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrCuaSoRa.deleteMany({ where: { cycleId: { in: G.ky } } });
	await db.okrSoChup.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrNguonKr.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ cycleId: { in: G.ky } },
				{ objectiveId: { in: G.mt } },
				{ actorUserId: { in: nguoi } },
			],
		},
	});
	await db.okrCheckIn.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrCheckInSession.deleteMany({ where: { userId: { in: nguoi } } });
	await db.okrMention.deleteMany({
		where: { comment: { objectiveId: { in: G.mt } } },
	});
	await db.okrComment.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrFollow.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrAlignment.deleteMany({ where: { objectiveId: { in: G.mt } } });
	await db.okrKeyResult.deleteMany({ where: { id: { in: kr } } });
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
	trang.on("pageerror", (e) => {
		ghi(`pageerror ${String(e).slice(0, 3000)}`);
		loiConsole.push(`${duong}: pageerror ${String(e).slice(0, 200)}`);
	});
	trang.on("console", (m) => {
		if (m.type() !== "error") return;
		const t = m.text();
		ghi(`console.error ${t.slice(0, 300)}`);
		if (LOI_BO_QUA.test(t)) return;
		if (process.env.CHIEU_DO && /status of 400/.test(t)) return;
		loiConsole.push(`${duong}: console.error ${t.slice(0, 200)}`);
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

const thayNgay = (trang, fn, ...doiSo) =>
	trang
		.waitForFunction(fn, { timeout: DO.choMs, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);

async function doi(trang, nhan, fn, ...doiSo) {
	return kiem(
		`${nhan}: het ${DO.choMs}ms van chua thay`,
		await thayNgay(trang, fn, ...doiSo),
	);
}

const coMat = (trang, sel, nhan = `co ${sel}`) =>
	doi(trang, nhan, (s) => window.__tim(s).length > 0, sel);
const chuSel = (trang, sel) =>
	trang.evaluate(
		(s) => window.__tim(s)[0]?.innerText?.replace(/\s+/g, " ").trim() ?? "",
		sel,
	);
const nutTat = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s)[0]?.disabled ?? null, sel);

async function bamThu(trang, sel, i = 0) {
	await trang.bringToFront();
	const tay = await trang.evaluateHandle(
		(s, n) => window.__tim(s)[n] ?? null,
		sel,
		i,
	);
	const el = tay.asElement();
	if (!el) return kiem(`khong thay ${sel}[${i}] de bam`, false);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}
const bam = (trang, sel) => bamThu(trang, sel, 0);

async function bamTheoChu(trang, sel, chu) {
	const tay = await trang.evaluateHandle(
		(s, c) =>
			window
				.__tim(s)
				.find((e) => e.innerText.replace(/\s+/g, " ").trim() === c) ?? null,
		sel,
		chu,
	);
	const el = tay.asElement();
	if (!el) return kiem(`khong thay ${sel} chu «${chu}» de bam`, false);
	await el.click();
	return true;
}

async function go(trang, sel, chu) {
	let thay = "";
	for (let lan = 1; lan <= DO.lanGo; lan += 1) {
		const tay = await trang.evaluateHandle(
			(s) => window.__tim(s)[0] ?? null,
			sel,
		);
		const el = tay.asElement();
		if (!el) return kiem(`khong thay o ${sel} de go`, false);
		await el.evaluate((e) => {
			e.dataset.mocGo = "1";
		});
		await el.focus();
		await el.evaluate((e) => e.select());
		await trang.keyboard.press("Backspace");
		await el.type(chu);
		await cho(DO.choHydrateMs);
		const sau = await trang.evaluate(
			(s) => ({
				gia: window.__tim(s)[0]?.value ?? "",
				cuO: window.__tim(s)[0]?.dataset.mocGo === "1",
			}),
			sel,
		);
		thay = sau.gia;
		if (thay === chu) return true;
		lanGoLai += 1;
		console.log(
			`  go lai ${sel} (lan ${lan}): o giu «${thay}», ${sau.cuO ? "van la o cu" : "o da bi dung lai giua luc go"}`,
		);
	}
	return kiem(`o ${sel} khong giu chu da go «${chu}» (thay «${thay}»)`, false);
}

async function choTieuDiem(trang, khung) {
	await thayNgay(
		trang,
		(k) => document.activeElement?.closest(k) != null,
		khung,
	);
	await cho(DO.choHydrateMs);
}

async function chup(trang, ten) {
	await goDevtools(trang);
	const rong = await trang.evaluate(() => [
		document.documentElement.scrollWidth,
		window.innerWidth,
	]);
	e14(
		`${ten}: tran ngang scrollWidth ${rong[0]} > innerWidth ${rong[1]}`,
		rong[0] <= rong[1],
	);
	await cho(300);
	await trang.screenshot({ path: join(BANG_CHUNG, ten) });
	anh.push(ten);
}

const coToast = (t, chu) =>
	doi(
		t,
		`toast «${chu}»`,
		(c) =>
			[...document.querySelectorAll("[data-sonner-toast]")].some((e) =>
				e.innerText.includes(c),
			),
		chu,
	);

const HANG = (ky) => `[data-chu-ky='${ky}']`;
const MENU = "[role='menu']";
const HOI = "[role='alertdialog']";
const SHEET = (ky) => `[data-sheet-sua-chu-ky='${ky}']`;
const HOP_AN = (ky) => `[data-hop-an-chu-ky='${ky}']`;
const NGAY = (sheet) => `${sheet} [data-slot='date-picker-trigger']`;
const THU = (sheet) => `${sheet} [data-slot='select-trigger']`;

async function moCaiDat(c, rong = DO.rong) {
	const t = await moTrang(c, rong, "/settings/okr");
	await coMat(t, "[data-chu-ky]", "bang chu ky o Cai dat OKR");
	return t;
}

const hangMan = (t) =>
	t.evaluate(() =>
		window.__tim("[data-chu-ky]").map((h) => ({
			id: h.getAttribute("data-chu-ky"),
			ten:
				h
					.querySelector("span[translate='no']")
					?.innerText.replace(/\s+/g, " ")
					.trim() ?? "",
			chu: h.innerText.replace(/\s+/g, " ").trim(),
		})),
	);

async function tenKhopDb(t, nhan) {
	const man = await hangMan(t);
	const dbTen = new Map(
		(
			await db.okrCycle.findMany({
				where: { id: { in: G.ky } },
				select: { id: true, name: true },
			})
		).map((r) => [r.id, r.name]),
	);
	const lech = man.filter((h) => dbTen.get(h.id) !== h.ten);
	const thieu = [...dbTen.keys()].filter((k) => !man.some((h) => h.id === k));
	e15(
		`${nhan}: ten tren man bang ten doc DB (lech ${JSON.stringify(lech.map((h) => [h.ten, dbTen.get(h.id) ?? null]))}, DB co ma man khong co ${thieu.length})`,
		lech.length === 0 && thieu.length === 0,
	);
	return man;
}

async function kiemThuTu(man, canh, nhan) {
	const [tenCanh, , khoa] = CANH_THU_TU[canh];
	const mong = khoa.map((k) => K[k]);
	const rows = await db.okrCycle.findMany({
		where: { id: { in: G.ky } },
		select: {
			id: true,
			kind: true,
			parentId: true,
			startsOn: true,
			anLuc: true,
		},
	});
	const theoDb = thuTuMan(
		rows.map((r) => ({
			id: r.id,
			kind: r.kind,
			parentId: r.parentId,
			startsOn: ngayDb(r.startsOn),
			an: r.anLuc !== null,
		})),
	);
	const tenKhoa = (ids) =>
		ids.map((x) => KHOA_HANG.find((k) => K[k] === x) ?? x).join(",");
	const thay = man.map((h) => h.id);
	e14(
		`${nhan}: thu tu hang ${tenCanh} ${khoa.join(",")} = thu tu man suy tu DB ${tenKhoa(theoDb)} (thay ${tenKhoa(thay)})`,
		JSON.stringify(thay) === JSON.stringify(mong) &&
			JSON.stringify(theoDb) === JSON.stringify(mong),
	);
}

async function moMenu(t, ky) {
	await bam(t, `[data-menu-chu-ky='${ky}']`);
	return thayNgay(
		t,
		(m) => window.__tim(`${m} [data-viec-chu-ky]`).length > 0,
		MENU,
	);
}

async function dongMenu(t) {
	await t.keyboard.press("Escape");
	await thayNgay(t, (m) => window.__tim(m).length === 0, MENU);
}

async function chonViec(t, ky, viec, nhan) {
	if (!(await moMenu(t, ky)))
		return kiem(`${nhan}: menu «…» cua ${ky} khong mo`, false);
	const muc = `${MENU} [data-viec-chu-ky='${viec}']`;
	if (!(await coMat(t, muc, `${nhan}: menu co muc ${viec}`))) {
		await dongMenu(t);
		return false;
	}
	await bam(t, muc);
	return true;
}

const docMenu = (t) =>
	t.evaluate(
		(m) =>
			window.__tim(`${m} [data-viec-chu-ky]`).map((e) => ({
				viec: e.getAttribute("data-viec-chu-ky"),
				tat: e.hasAttribute("data-disabled"),
				chu: e.innerText.replace(/\s+/g, " ").trim(),
			})),
		MENU,
	);

const hetLich = (t) =>
	thayNgay(t, () => window.__tim("[data-slot='popover-content']").length === 0);

async function chonNgay(t, sheet, i, ngayChon) {
	const o = `[data-slot='popover-content'] button[data-day='${ngayChon}']`;
	const mong = formatDay(ngayChon, "vi");
	for (let lan = 0; lan < 3; lan += 1) {
		await hetLich(t);
		await bamThu(t, NGAY(sheet), i);
		if (!(await thayNgay(t, (s) => window.__tim(s).length > 0, o))) continue;
		await cho(DO.choHydrateMs);
		const ngayO = (
			await t.evaluateHandle((s) => window.__tim(s)[0] ?? null, o)
		).asElement();
		if (!ngayO) continue;
		await ngayO.click().catch(() => null);
		await hetLich(t);
		const thay = await t.evaluate(
			(s, n) => window.__tim(s)[n]?.innerText.trim() ?? "",
			NGAY(sheet),
			i,
		);
		if (thay === mong) return true;
	}
	return kiem(`E14: chon ngay ${ngayChon} vao o ngay thu ${i}`, false);
}

async function chonThu(t, sheet, chu) {
	for (let lan = 0; lan < 3; lan += 1) {
		await bam(t, THU(sheet));
		if (await thayNgay(t, () => window.__tim("[role='option']").length > 0)) {
			await bamTheoChu(t, "[role='option']", chu);
			await thayNgay(t, () => window.__tim("[role='option']").length === 0);
			if ((await chuSel(t, THU(sheet))) === chu) return true;
		}
	}
	return kiem(`E14: chon «${chu}» o ngay cap nhat tuan`, false);
}

const MENU_MONG = () => ({
	Y: [
		["sua", false],
		["an", true],
		["chay", false],
	],
	T: [
		["sua", false],
		["go", false],
		["chay", false],
	],
	D: [
		["sua", false],
		["an", false],
		["mo-ra", false],
		["sang-cham", false],
	],
	N: [
		["sua", false],
		["an", true],
		["chay", false],
	],
	DD: [
		["go", false],
		["mo-lai", false],
	],
	A: [["hien-lai", false]],
});

const CHU_MUC = {
	sua: V.sua,
	go: V.go,
	"hien-lai": V.hienLai,
	chay: C.chuKy.chuyenSang(C.pha["dang-chay"]),
	"mo-ra": CHU_KHEP.menu.moRa,
	"sang-cham": CHU_KHEP.menu.sangCham,
	"mo-lai": CHU_KHEP.menu.moLai,
};

async function buocMenu() {
	const t = await moCaiDat(cookie.admin);
	const man = await tenKhopDb(t, "buoc 3 luc mo");
	await kiemThuTu(man, 0, "buoc 3");
	const hangA = man.at(-1);
	e14(
		`buoc 3: hang cuoi la A mang nhan «${C.chuKy.daAn}» (thay «${hangA?.chu}»)`,
		hangA?.id === K.A && hangA.chu.includes(C.chuKy.daAn),
	);
	const aDb = await db.okrCycle.findUnique({ where: { id: K.A } });
	const dongAnMong = `${C.chuKy.dongAn(formatDay(ngayVN(aDb.anLuc), "vi"), C.pha[aDb.phase])} · ${TEN.lyDoA}`;
	const dongAn = await chuSel(t, `[data-dong-an='${K.A}']`);
	e14(
		`buoc 3: dong phu cua A «${dongAnMong}» (thay «${dongAn}»)`,
		dongAn === dongAnMong,
	);
	const mong = MENU_MONG();
	for (const k of ["Y", "T", "D", "N", "DD", "A"]) {
		if (!(await moMenu(t, K[k]))) {
			e14(`buoc 3: menu «…» cua ${k} khong mo`, false);
			continue;
		}
		const muc = await docMenu(t);
		const thay = muc.map((x) => [x.viec, x.tat]);
		e14(
			`buoc 3: menu ${k} co ${JSON.stringify(mong[k])} (thay ${JSON.stringify(thay)})`,
			JSON.stringify(thay) === JSON.stringify(mong[k]),
		);
		for (const x of muc) {
			const chuMong =
				x.viec === "an"
					? x.tat
						? `${V.an} ${C.chuKy.anKhoa(k === "N" ? "1" : "2")}`
						: V.an
					: CHU_MUC[x.viec];
			e14(
				`buoc 3: menu ${k} muc ${x.viec} chu «${chuMong}» (thay «${x.chu}»)`,
				x.chu === chuMong,
			);
		}
		await chup(t, `buoc-menu-${k.toLowerCase()}.png`);
		await dongMenu(t);
	}
	await t.setViewport({ width: DO.hep, height: DO.cao });
	await cho(DO.choKhongHienMs);
	if (await moMenu(t, K.D)) await chup(t, "buoc-menu-390.png");
	else e14("buoc 11: menu D o kho 390 khong mo", false);
	await dongMenu(t);
	await t.close();
}

async function chupCy(ky) {
	const r = await db.okrCycle.findUnique({ where: { id: ky } });
	return r
		? {
				name: r.name,
				startsOn: ngayDb(r.startsOn),
				endsOn: ngayDb(r.endsOn),
				breakStartsOn: ngayDb(r.breakStartsOn),
				breakEndsOn: ngayDb(r.breakEndsOn),
				updateWeekday: r.updateWeekday,
				anLuc: r.anLuc,
			}
		: null;
}

async function buocSuaMoiO() {
	const t = await moCaiDat(cookie.admin);
	const sheet = SHEET(K.T);
	if (
		!(await chonViec(t, K.T, "sua", "E14 buoc 4")) ||
		!(await coMat(t, sheet, "E14 buoc 4: sheet sua T"))
	)
		return t.close();
	await choTieuDiem(t, sheet);
	const moTa = await chuSel(t, `${sheet} [data-slot='sheet-description']`);
	e14(
		`buoc 4: mo ta sheet «${C.sua.moTaMoiO(TEN.T)}» (thay «${moTa}»)`,
		moTa === C.sua.moTaMoiO(TEN.T),
	);
	const tatNgay = await t.evaluate(
		(s) => window.__tim(s).map((e) => e.disabled),
		NGAY(sheet),
	);
	e14(
		`buoc 4: bon o ngay bat khi chu ky trong (thay ${JSON.stringify(tatNgay)})`,
		tatNgay.length === 4 && tatNgay.every((x) => x === false),
	);
	await go(t, `${sheet} [data-o-ten]`, TEN.tMoi);
	await chonNgay(t, sheet, 1, T_CUOI_MOI);
	await chonThu(t, sheet, C.mo.thu[THU_MOI - 1]);
	await doi(
		t,
		"E14 buoc 4: nut Luu bat sau khi doi",
		(s) => window.__tim(`${s} [data-nut='luu-chu-ky']`)[0]?.disabled === false,
		sheet,
	);
	await chup(t, "buoc-sua-moi-o-dien.png");
	await bam(t, `${sheet} [data-nut='luu-chu-ky']`);
	await coToast(t, C.sua.xong(TEN.tMoi));
	await thayNgay(t, (s) => window.__tim(s).length === 0, sheet);
	const tenMan = await thayNgay(
		t,
		(h, ten) =>
			window.__tim(`${h} span[translate='no']`)[0]?.innerText.trim() === ten,
		HANG(K.T),
		TEN.tMoi,
	);
	e14(`buoc 4: bang hien ten moi «${TEN.tMoi}»`, tenMan);
	await chup(t, "buoc-sua-moi-o.png");
	const r = await chupCy(K.T);
	console.log(`  E15 DB T sau sua moi o: ${JSON.stringify(r)}`);
	e15(
		`sau sua moi o: DB T co ten «${TEN.tMoi}», endsOn ${T_CUOI_MOI}, updateWeekday ${THU_MOI} (thay ${JSON.stringify(r)})`,
		r?.name === TEN.tMoi &&
			r.endsOn === T_CUOI_MOI &&
			r.updateWeekday === THU_MOI &&
			r.startsOn === KE.T.tu,
	);
	await tenKhopDb(t, "sau sua T");
	await t.close();
}

async function buocSuaChiTen() {
	const truoc = await chupCy(K.D);
	const t = await moCaiDat(cookie.admin);
	const sheet = SHEET(K.D);
	if (
		!(await chonViec(t, K.D, "sua", "E14 buoc 5")) ||
		!(await coMat(t, sheet, "E14 buoc 5: sheet sua D"))
	)
		return t.close();
	await choTieuDiem(t, sheet);
	const ra = await t.evaluate(
		(s) => ({
			ten: window.__tim(`${s} [data-o-ten]`)[0]?.disabled ?? null,
			ngay: window
				.__tim(`${s} [data-slot='date-picker-trigger']`)
				.map((e) => e.disabled),
			thu: window.__tim(`${s} [data-slot='select-trigger']`)[0]?.disabled,
			khoa: window.__tim(`${s} [data-mo-ta-khoa]`)[0]?.innerText.trim() ?? null,
			moTa:
				window
					.__tim(`${s} [data-slot='sheet-description']`)[0]
					?.innerText.trim() ?? null,
		}),
		sheet,
	);
	console.log(`  E14 buoc 5 sheet D: ${JSON.stringify(ra)}`);
	e14("buoc 5: o ten bat", ra.ten === false);
	const ngayBat = ra.ngay.filter((x) => x === false).length;
	if (ngayBat > 0)
		console.log(
			`  E14 buoc 5: ô ngày còn bật — ${ngayBat}/${ra.ngay.length} ô ngày bật khi chỉ sửa được tên`,
		);
	e14(
		`buoc 5: bon o ngay tat khi chi sua ten (thay ${JSON.stringify(ra.ngay)})`,
		ra.ngay.length === 4 && ngayBat === 0,
	);
	e14("buoc 5: o ngay cap nhat tuan tat", ra.thu === true);
	e14(
		`buoc 5: dong giai thich «${C.sua.khoaCoDuLieu}» (thay «${ra.khoa}»)`,
		ra.khoa === C.sua.khoaCoDuLieu,
	);
	e14(
		`buoc 5: mo ta sheet «${C.sua.moTaCoDuLieu(TEN.D)}» (thay «${ra.moTa}»)`,
		ra.moTa === C.sua.moTaCoDuLieu(TEN.D),
	);
	await chup(t, "buoc-sua-chi-ten.png");
	await t.setViewport({ width: DO.hep, height: DO.cao });
	await cho(DO.choKhongHienMs);
	await chup(t, "buoc-sua-chi-ten-390.png");
	await t.setViewport({ width: DO.rong, height: DO.cao });
	await cho(DO.choKhongHienMs);
	await go(t, `${sheet} [data-o-ten]`, TEN.dMoi);
	await doi(
		t,
		"E14 buoc 5: nut Luu bat sau khi doi ten",
		(s) => window.__tim(`${s} [data-nut='luu-chu-ky']`)[0]?.disabled === false,
		sheet,
	);
	await bam(t, `${sheet} [data-nut='luu-chu-ky']`);
	await coToast(t, C.sua.xong(TEN.dMoi));
	await thayNgay(t, (s) => window.__tim(s).length === 0, sheet);
	const r = await chupCy(K.D);
	console.log(`  E15 DB D sau sua ten: ${JSON.stringify(r)}`);
	e15(
		`sau sua ten D: DB ten «${TEN.dMoi}» va ngay, nghi, thu khong doi (truoc ${JSON.stringify(truoc)}, sau ${JSON.stringify(r)})`,
		r?.name === TEN.dMoi &&
			r.startsOn === truoc.startsOn &&
			r.endsOn === truoc.endsOn &&
			r.breakStartsOn === truoc.breakStartsOn &&
			r.breakEndsOn === truoc.breakEndsOn &&
			r.updateWeekday === truoc.updateWeekday,
	);
	await thayNgay(
		t,
		(h, ten) =>
			window.__tim(`${h} span[translate='no']`)[0]?.innerText.trim() === ten,
		HANG(K.D),
		TEN.dMoi,
	);
	await tenKhopDb(t, "sau sua D");
	await t.close();
}

async function buocGo() {
	const t = await moCaiDat(cookie.admin);
	if (
		!(await chonViec(t, K.T, "go", "E14 buoc 6")) ||
		!(await coMat(t, HOI, "E14 buoc 6: hop hoi lai go"))
	)
		return t.close();
	const g = C.chuKy.go;
	const hoi = await t.evaluate(
		(h, nut) => {
			const hop = window.__tim(h)[0];
			const xn = [...hop.querySelectorAll("button")].find(
				(b) => b.innerText.trim() === nut,
			);
			return {
				tieuDe:
					hop.querySelector("[data-slot='alert-dialog-title']")?.innerText ??
					"",
				than:
					hop.querySelector("[data-slot='alert-dialog-description']")
						?.innerText ?? "",
				tong: xn?.getAttribute("data-variant") ?? null,
			};
		},
		HOI,
		g.nut,
	);
	e14(
		`buoc 6: hop hoi «${g.tieuDe(TEN.tMoi)}» / than tep chu / nut tong destructive (thay ${JSON.stringify(hoi)})`,
		hoi.tieuDe.trim() === g.tieuDe(TEN.tMoi) &&
			hoi.than.trim() === g.than(TEN.tMoi) &&
			hoi.tong === "destructive",
	);
	await chup(t, "buoc-go.png");
	await bamTheoChu(t, `${HOI} button`, g.nut);
	await coToast(t, g.xong(TEN.tMoi));
	e14(
		"buoc 6: hang T bien mat",
		await thayNgay(t, (h) => window.__tim(h).length === 0, HANG(K.T)),
	);
	const conT = await db.okrCycle.findUnique({ where: { id: K.T } });
	const vet = await db.okrTrail.count({
		where: { cycleId: K.T, action: "go-chu-ky" },
	});
	console.log(
		`  E15 DB sau go T: okrCycle ${conT ? "con" : "null"}, okrTrail go-chu-ky ${vet}`,
	);
	e15(
		`sau go T: okrCycle.findUnique(T) null va dung mot okrTrail go-chu-ky (thay ${conT ? "con" : "null"}, ${vet})`,
		conT === null && vet === 1,
	);
	await tenKhopDb(t, "sau go T");
	await t.close();
}

async function buocAn() {
	const t = await moCaiDat(cookie.admin);
	const hop = HOP_AN(K.D);
	if (
		!(await chonViec(t, K.D, "an", "E14 buoc 7")) ||
		!(await coMat(t, `${hop} [data-o-ly-do-an]`, "E14 buoc 7: hop an D"))
	)
		return t.close();
	const a = C.chuKy.an;
	const tieuDe = await chuSel(t, `${hop} [data-slot='dialog-title']`);
	e14(
		`buoc 7: tieu de hop «${a.tieuDe(TEN.dMoi)}» (thay «${tieuDe}»)`,
		tieuDe === a.tieuDe(TEN.dMoi),
	);
	e14(
		"buoc 7: nut xac nhan tat khi ly do trong",
		(await nutTat(t, `${hop} [data-nut='an-chu-ky']`)) === true,
	);
	await chup(t, "buoc-an-ly-do.png");
	e14(`buoc 7: ly do go dung 20 ky tu`, TEN.lyDoD.length === 20);
	await go(t, `${hop} [data-o-ly-do-an]`, TEN.lyDoD);
	await doi(
		t,
		"E14 buoc 7: go ly do du -> nut xac nhan bat",
		(h) => window.__tim(`${h} [data-nut='an-chu-ky']`)[0]?.disabled === false,
		hop,
	);
	await bam(t, `${hop} [data-nut='an-chu-ky']`);
	const xong = await thayNgay(
		t,
		(c) =>
			[...document.querySelectorAll("[data-sonner-toast]")].some((e) =>
				e.innerText.includes(c),
			),
		a.xong(TEN.dMoi),
	);
	e14(`buoc 7: toast «${a.xong(TEN.dMoi)}»`, xong);
	if (xong) {
		await thayNgay(t, (h) => window.__tim(h).length === 0, hop);
		await thayNgay(
			t,
			(h, nhan) => (window.__tim(h)[0]?.innerText ?? "").includes(nhan),
			HANG(K.D),
			C.chuKy.daAn,
		);
	}
	const man = await hangMan(t);
	const iD = man.findIndex((h) => h.id === K.D);
	const anDb = new Set(
		(
			await db.okrCycle.findMany({
				where: { id: { in: G.ky }, anLuc: { not: null } },
				select: { id: true },
			})
		).map((r) => r.id),
	);
	const cuoi = man.slice(iD).every((h) => anDb.has(h.id));
	e14(
		`buoc 7: hang D xuong khoi da an cuoi bang, nhan «${C.chuKy.daAn}» (thay vi tri ${iD}/${man.length}, «${man[iD]?.chu}»)`,
		iD > 0 && cuoi && man[iD].chu.includes(C.chuKy.daAn),
	);
	await kiemThuTu(man, 1, "buoc 7");
	await chup(t, "buoc-an-xong.png");
	const r = await chupCy(K.D);
	const vet = await db.okrTrail.findMany({
		where: { cycleId: K.D, action: "an-chu-ky" },
		select: { note: true },
	});
	const note = vet.map((v) => v.note);
	console.log(
		`  E15 DB sau an D: anLuc ${r?.anLuc?.toISOString() ?? null}, okrTrail an-chu-ky ${JSON.stringify(note)}`,
	);
	if (!(vet.length === 1 && note[0] === TEN.lyDoD)) {
		const tuChoi =
			mang
				.map((d) => d.match(/ (4\d\d) POST \S*okr\.anChuKy/)?.[1])
				.find(Boolean) ?? null;
		console.log(
			`  E15: note doc duoc «${note.length === 0 ? "(khong co dong an-chu-ky)" : note.join(" | ")}» khac ly do da go «${TEN.lyDoD}»; okr.anChuKy tra ${tuChoi ?? "khong co phan hoi 4xx"}`,
		);
	}
	e15(
		`sau an D: anLuc khac null va dung mot okrTrail an-chu-ky note bang ly do da go (thay ${r?.anLuc ? "co anLuc" : "anLuc null"}, ${JSON.stringify(note)})`,
		r?.anLuc != null && vet.length === 1 && note[0] === TEN.lyDoD,
	);
	await tenKhopDb(t, "sau an D");
	await t.close();
}

async function buocOChon() {
	const t = await moTrang(cookie.admin, DO.rong, "/okr/theo-don-vi");
	if (!(await coMat(t, "[data-chon-chu-ky]", "E14 buoc 8: o chon ky"))) {
		await chup(t, "buoc-o-chon.png");
		return t.close();
	}
	let mo = false;
	for (let lan = 0; lan < 3 && !mo; lan += 1) {
		await bam(t, "[data-chon-chu-ky]");
		mo = await thayNgay(t, () => window.__tim("[role='option']").length > 0);
	}
	e14("buoc 8: o chon ky mo", mo);
	const muc = await t.evaluate(() =>
		window.__tim("[role='option']").map((o) => o.innerText.trim()),
	);
	console.log(`  E14 buoc 8 o chon ky: ${JSON.stringify(muc)}`);
	const co = (ten) => muc.some((x) => x.includes(ten));
	e14(
		`buoc 8: o chon khong co D «${TEN.dMoi}», khong co A «${TEN.A}», co Y va Đ (thay ${JSON.stringify(muc)})`,
		!co(TEN.dMoi) && !co(TEN.A) && co(TEN.Y) && co(TEN.DD),
	);
	await chup(t, "buoc-o-chon.png");
	await t.keyboard.press("Escape");
	await t.close();
}

async function buocHienLai() {
	const t = await moCaiDat(cookie.admin);
	if (
		!(await chonViec(t, K.D, "hien-lai", "E14 buoc 9")) ||
		!(await coMat(t, HOI, "E14 buoc 9: hop hoi hien lai"))
	)
		return t.close();
	const h = C.chuKy.hienLai;
	const tieuDe = await chuSel(t, `${HOI} [data-slot='alert-dialog-title']`);
	e14(
		`buoc 9: tieu de «${h.tieuDe(TEN.dMoi)}» (thay «${tieuDe}»)`,
		tieuDe === h.tieuDe(TEN.dMoi),
	);
	await bamTheoChu(t, `${HOI} button`, h.nut);
	await coToast(t, h.xong(TEN.dMoi));
	await thayNgay(
		t,
		(hang, nhan) => !(window.__tim(hang)[0]?.innerText ?? "").includes(nhan),
		HANG(K.D),
		C.chuKy.daAn,
	);
	const man = await hangMan(t);
	const iD = man.findIndex((x) => x.id === K.D);
	const iA = man.findIndex((x) => x.id === K.A);
	await kiemThuTu(man, 2, "buoc 9");
	e14(
		`buoc 9: D roi cuoi bang, dung truoc khoi da an va khong con nhan «${C.chuKy.daAn}» (thay D ${iD}, A ${iA}, «${man[iD]?.chu}»)`,
		iD >= 0 &&
			iD < iA &&
			iA === man.length - 1 &&
			!man[iD].chu.includes(C.chuKy.daAn),
	);
	await chup(t, "buoc-hien-lai.png");
	const r = await chupCy(K.D);
	const vet = await db.okrTrail.count({
		where: { cycleId: K.D, action: "hien-chu-ky" },
	});
	console.log(
		`  E15 DB sau hien lai D: anLuc ${r?.anLuc ?? null}, okrTrail hien-chu-ky ${vet}`,
	);
	e15(
		`sau hien lai D: anLuc null (thay ${r?.anLuc ?? null}), mot okrTrail hien-chu-ky (thay ${vet})`,
		r !== null && r.anLuc === null && vet === 1,
	);
	await tenKhopDb(t, "sau hien lai D");
	await t.close();
}

async function buocThanhVien() {
	const t = await moCaiDat(cookie.thuong);
	const ra = await t.evaluate(() => {
		const menu = window.__tim("[data-menu-chu-ky]");
		const lyDo = window.__tim("[data-ly-do-khong-quyen]")[0];
		const tieuDe = window.__tim("[data-slot='page-shell-title']")[0];
		return {
			soMenu: menu.length,
			moiTat: menu.every((e) => e.disabled),
			moiTro: menu.every((e) =>
				(e.getAttribute("aria-describedby") ?? "")
					.split(" ")
					.includes(lyDo?.id ?? "-"),
			),
			lyDo: lyDo?.innerText.trim() ?? null,
			duoiTieuDe:
				lyDo && tieuDe
					? lyDo.getBoundingClientRect().top >=
						tieuDe.getBoundingClientRect().bottom
					: false,
		};
	});
	e14(
		`buoc 10: thanh vien thuong: moi nut «…» tat, tro toi dong giai thich «${C.khongQuyen}» duoi tieu de (thay ${JSON.stringify(ra)})`,
		ra.soMenu > 0 &&
			ra.moiTat &&
			ra.moiTro &&
			ra.lyDo === C.khongQuyen &&
			ra.duoiTieuDe,
	);
	await chup(t, "buoc-thanh-vien.png");
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
		console.log(
			"  tien de: workspace chua danh dau onboard — thuoc tu danh dau, tra lai khi don",
		);
	}
	slug = await suySlug(cookie.admin);
	await gieo();
	for (const [ten, buoc] of [
		["buoc 3 menu", buocMenu],
		["buoc 4 sua moi o", buocSuaMoiO],
		["buoc 5 sua chi ten", buocSuaChiTen],
		["buoc 6 go", buocGo],
		["buoc 7 an", buocAn],
		["buoc 8 o chon", buocOChon],
		["buoc 9 hien lai", buocHienLai],
		["buoc 10 thanh vien", buocThanhVien],
	]) {
		const b = Date.now();
		await buoc().catch((e) =>
			hong.push(`${ten}: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  ${ten}: ${Math.round((Date.now() - b) / 1000)} s`);
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
	else console.log("  don dep: okrCycle.count() = 0");
	writeFileSync(join(BANG_CHUNG, "man-sua-an-network.txt"), mang.join("\n"));
	console.log(
		`man-sua-an: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh (${anh.join(", ")}), ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	console.log(`  go phai thu lai: ${lanGoLai}`);
	console.log(`  anh o ${relative(GOC, BANG_CHUNG)}/`);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
}
await ket(ma);
