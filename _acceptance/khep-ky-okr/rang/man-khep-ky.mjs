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
const HO_SO = "khep-ky-okr";
const BANG_CHUNG =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "evidence");
const MOI_EVAL = ["E3", "E4", "E7", "E13", "E14", "E15", "E22"];
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
const TEP_CHAM = "apps/app/app/(app)/[slug]/okr/cham-diem.tsx";
const TEP_CAI_DAT = "apps/app/app/(app)/[slug]/settings/okr";
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
	E13: {
		tep: TEP_CHAM,
		mo: "ban sao man cham bo cau khong phai danh gia nhan su",
		cam: (s) =>
			s.replace("<AlertTitle>{m.khongPhaiDanhGia.tieuDe}</AlertTitle>", ""),
		ghim: /thiếu câu «[^»]+»/,
	},
	E14: {
		tep: TEP_CHAM,
		mo: "ban sao man cham gui diemGoiY thay diem da chon",
		cam: (s) =>
			s.replace("const diem = Number(tt.chon);", "const diem = k.diemGoiY;"),
		ghim: /diem da chon [\d.]+ nhung DB [\d.]+/,
	},
	E15: {
		tep: `${TEP_CAI_DAT}/hop-thoai-dong-ky.tsx`,
		mo: "ban sao hop thoai dong ky khong tat nut khi con KR chua cham",
		cam: (s) =>
			s.replace(
				'<Button disabled data-nut="dong-ky">',
				'<Button data-nut="dong-ky">',
			),
		ghim: /nút đóng kỳ bật khi còn \d+ KR chưa chấm/,
	},
	E22: {
		tep: `${TEP_CAI_DAT}/hop-thoai-mo-lai.tsx`,
		mo: "ban sao hop thoai mo lai khong gui ly do da go",
		cam: (s) =>
			s.replace(
				"moLai.mutate({ id: ky.id, lyDo: lyDo.trim() });",
				'moLai.mutate({ id: ky.id, lyDo: "Mở lại theo mặc định" });',
			),
		ghim: /note doc duoc «[^»]*» khac ly do da go/,
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
const { okrMessages } = await import("../../../apps/app/lib/messages/okr.ts");
const { OKR: OKR_API } = await import(
	"../../../apps/api/src/okr/okr-config.ts"
);
const { COT_XUAT } = await import(
	"../../../apps/api/src/okr/okr-khep.contracts.ts"
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
const CHU_OKR = okrMessages("vi");

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
	chiOkr: { email: `o${MA}@thu.test`, vai: "okr", ten: "Trịnh Thị Oanh" },
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
	const moiKr = [...new Set([...G.kr, ...kr])];
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

async function moTrang(c, rong, duong, truocKhiMo = null) {
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
		if (trang.boQua500 && /status of 500/.test(t)) return;
		if (trang.boQua400 && /status of 400/.test(t)) return;
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
	if (truocKhiMo) await truocKhiMo(trang);
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

const TEN_CHAM = {
	P2: `Phòng chưa có mục tiêu ${MA}`,
	A: "Giữ chân đối tác đã ký trong quý",
	B: "Mở kênh đối tác vùng Tây Nguyên",
	a1: "Đối tác gia hạn hợp tác",
	a2: "Đối tác dùng cổng đặt hàng mới",
	b1: "Đối tác mới ở Tây Nguyên",
	b2: "Cuộc hẹn giới thiệu đã gặp",
	lyDoDich: "Khách lớn đổi kế hoạch quý",
	lyDoCham: "Đối tác rút lui",
	hoc: "Gọi đối tác sớm hơn hai tuần trước hạn gia hạn.",
};

const quyTruoc = () =>
	QUY === 1 ? { nam: NAM - 1, quy: 4 } : { nam: NAM, quy: QUY - 1 };

async function gieoCham() {
	const pb2 = await lam(cookie.admin, "org.createDepartment", {
		name: TEN_CHAM.P2,
		divisionId: null,
	});
	G.pb.push(pb2.id);
	K.P2 = pb2.id;
	const t = quyTruoc();
	let cha = G.ky[0];
	if (t.nam !== NAM) {
		const nam = await lam(cookie.admin, "okr.createCycle", {
			kind: "nam",
			name: `Năm ${t.nam} ${MA}`,
			parentId: null,
			startsOn: ngay(t.nam, 1, 1),
			endsOn: ngay(t.nam, 12, 31),
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		});
		G.ky.push(nam.id);
		cha = nam.id;
	}
	const ten = `Quý ${t.quy}/${t.nam} ${MA}`;
	const truoc = await lam(cookie.admin, "okr.createCycle", {
		kind: "quy",
		name: ten,
		parentId: cha,
		startsOn: ngay(t.nam, t.quy * 3 - 2, 1),
		endsOn: ngay(t.nam, t.quy * 3, cuoiThang(t.nam, t.quy * 3)),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(truoc.id);
	K.truoc = truoc.id;
	K.tenTruoc = ten;
	K.tenQuy = `Quý ${QUY}/${NAM} ${MA}`;
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: truoc.id,
		phase: "dang-chay",
	});
	const c = cookie.truong;
	for (const [khoa, kind] of [
		["A", "cam-ket"],
		["B", "tham-vong"],
	]) {
		const r = await lam(c, "okr.createObjective", {
			cycleId: K.truoc,
			unit: { level: "phong-ban", departmentId: K.P },
			title: TEN_CHAM[khoa],
			kind,
			ownerUserId: id.truong,
			participantIds: [],
			whyNow: "",
		});
		G.mt.push(r.id);
		K[khoa] = r.id;
	}
	for (const [khoa, mt, khoi, dich, hien] of [
		["a1", "A", 0, 10, 7],
		["a2", "A", 0, 20, 20],
		["b1", "B", 10, 30, 16],
		["b2", "B", 0, 50, 30],
	]) {
		const r = await lam(c, "okr.createKeyResult", {
			objectiveId: K[mt],
			title: TEN_CHAM[khoa],
			kind: "tang-toi",
			ownerUserId: id.truong,
			startValue: khoi,
			targetValue: dich,
			currentValue: hien,
			unit: "",
			dueOn: null,
			weight: 1,
		});
		G.kr.push(r.id);
		K[khoa] = r.id;
	}
	await lam(c, "okr.publishObjective", { id: K.A });
	await lam(c, "okr.publishObjective", { id: K.B });
	await lam(c, "okr.updateKeyResult", {
		id: K.a1,
		targetValue: 12,
		lyDoDoiDich: TEN_CHAM.lyDoDich,
	});
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: K.truoc,
		phase: "cham-diem",
	});
	const dong = await db.okrDiemKr.findMany({
		where: { cycleId: K.truoc },
		select: { keyResultId: true, diemGoiY: true, thang: true },
	});
	K.goiY = Object.fromEntries(
		dong.map((d) => [d.keyResultId, Number(d.diemGoiY)]),
	);
	K.thang = dong[0]?.thang ?? "0-1";
	console.log(
		`  gieo cham: ${ten} ${K.truoc} (cham-diem), A=${K.A} B=${K.B}, ${dong.length} dong diem, thang ${K.thang}, goi y ${JSON.stringify(K.goiY)}`,
	);
}

const chuDiem = (d) => String(d).replace(".", ",");
const theoThang = (d) => (K.thang === "0-100" ? Math.round(d * 100) : d);
const duongCham = (don, xem = "&xemOkr=cham") =>
	`/okr/theo-don-vi?kyOkr=${K.truoc}&donOkr=${don}${xem}`;
const THE_CHAM = "[data-the-con-bo] a[data-the='cham']";
const DONG = (k) => `[data-kr-cham='${k}']`;
const LON = "[data-o-diem='lon']";
const KHOI = (mt) => `[data-muc-tieu-cham='${mt}']`;

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

async function chonDiemMan(t, k, chu) {
	await bam(t, `${DONG(k)} ${LON} [data-slot='select-trigger']`);
	if (!(await coMat(t, "[role='option']", `E13: o diem ${k} mo`))) return;
	await bamTheoChu(t, "[role='option']", chu);
	await thayNgay(t, () => window.__tim("[role='option']").length === 0);
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

async function soDaChamDb() {
	return db.okrDiemKr.count({
		where: { cycleId: K.truoc, diem: { not: null } },
	});
}

const LOI_BANG_CHAM = {
	error: {
		json: {
			message: "chan boi thuoc man-khep-ky",
			code: -32603,
			data: {
				code: "INTERNAL_SERVER_ERROR",
				httpStatus: 500,
				path: "okr.bangCham",
			},
		},
	},
};

const thuTucCua = (u) => {
	const duoi = new URL(u).pathname.split("/api/trpc/")[1];
	if (duoi === undefined) return [];
	return decodeURIComponent(duoi)
		.split(",")
		.map((x) => x.trim());
};

function chanBangCham(c, cua) {
	return async (trang) => {
		trang.boQua500 = true;
		await trang.setRequestInterception(true);
		trang.on("request", async (r) => {
			const ten = thuTucCua(r.url());
			if (!cua.dang || !ten.includes("okr.bangCham")) {
				await r.continue();
				return;
			}
			cua.chan += 1;
			if (ten.length === 1) {
				await r.respond({
					status: 500,
					contentType: "application/json",
					body: JSON.stringify([LOI_BANG_CHAM]),
				});
				return;
			}
			const that = await fetch(r.url(), {
				method: r.method(),
				headers: { ...mu(c), "content-type": "application/json" },
				body: r.postData(),
			});
			const ds = JSON.parse(await that.text());
			await r.respond({
				status: 207,
				contentType: "application/json",
				body: JSON.stringify(
					ten.map((x, i) => (x === "okr.bangCham" ? LOI_BANG_CHAM : ds[i])),
				),
			});
		});
	};
}

const e13 = (nhan, dat) => (chon(["E13"]) ? kiem(`E13 ${nhan}`, dat) : dat);
const e14 = (nhan, dat) => (chon(["E14"]) ? kiem(`E14 ${nhan}`, dat) : dat);

async function buocChamChinh() {
	const t = await moTrang(cookie.truong, DO.rong, duongCham(`pb:${K.P}`, ""));
	await coMat(t, "[data-the-con-bo]", "E13: bo chon cach xem o 1440");
	await bamTheoChu(t, "[data-the-con-bo] a[data-the]", CHU.cham.cachXem);
	const coBang = await coMat(t, "[data-cham-diem]", "E13: man cham diem");
	e13(
		`buoc 2: URL giu cach xem (thay ${t.url()})`,
		new URL(t.url()).searchParams.get("xemOkr") === "cham",
	);
	if (!coBang) {
		await t.close();
		return;
	}
	const cau = await chuSel(t, "[data-khong-phai-danh-gia]");
	if (!cau.includes(CHU.khongPhaiDanhGia.tieuDe)) {
		console.log(`  E13 buoc 2: thiếu câu «${CHU.khongPhaiDanhGia.tieuDe}»`);
		e13("buoc 2: thiếu câu không phải đánh giá nhân sự", false);
	}
	const tong = Object.keys(K.goiY).length;
	const tienDo = await chuSel(t, "[data-tien-do-cham]");
	e13(
		`buoc 2: «${CHU.cham.daCham("0", String(tong))}» (thay «${tienDo}»)`,
		tienDo === CHU.cham.daCham("0", String(tong)),
	);
	const oDiem = await t.evaluate(
		(lon) =>
			window
				.__tim(`[data-kr-cham] ${lon} [data-slot='select-trigger']`)
				.map((e) => e.innerText.trim()),
		LON,
	);
	const goiYChu = CHU.cham.cot.goiY.toLocaleLowerCase("vi");
	const mongDiem = ["a1", "a2", "b1", "b2"].map(
		(k) => `${chuDiem(theoThang(K.goiY[K[k]]))} · ${goiYChu}`,
	);
	e13(
		`buoc 2: moi o diem chon san goi y ${JSON.stringify(mongDiem)} (thay ${JSON.stringify(oDiem)})`,
		JSON.stringify(oDiem) === JSON.stringify(mongDiem),
	);
	const coNhan = await t.evaluate(() =>
		window
			.__tim("[data-kr-cham]")
			.filter((d) => d.querySelector("[data-dich-ngoai-ra]"))
			.map((d) => d.getAttribute("data-kr-cham")),
	);
	e13(
		`buoc 2: nhan «${CHU.cham.dichNgoaiRa}» chi o KR a1 (thay ${JSON.stringify(coNhan)})`,
		JSON.stringify(coNhan) === JSON.stringify([K.a1]),
	);
	const khongDich = await t.evaluate(() => ({
		ten: window
			.__tim("[data-kr-cham] [translate='no']")
			.map((e) => e.innerText.trim()),
		hoc: window
			.__tim("[data-o-hoc] textarea")
			.every((e) => e.getAttribute("translate") === "no"),
	}));
	e13(
		`buoc 7: ten KR va o dieu hoc duoc mang translate=no (thay ${JSON.stringify(khongDich)})`,
		[TEN_CHAM.a1, TEN_CHAM.b1].every((x) => khongDich.ten.includes(x)) &&
			khongDich.hoc,
	);
	await chup(t, "buoc-cham-1440.png");

	const goiYb1 = theoThang(K.goiY[K.b1]);
	const buoc = K.thang === "0-100" ? 10 : 0.1;
	const chonB1 =
		Math.round((goiYb1 + (goiYb1 >= 5 * buoc ? -2 : 2) * buoc) * 100) / 100;
	await chonDiemMan(t, K.b1, chuDiem(chonB1));
	await bam(t, `${DONG(K.b1)} ${LON} [data-nut='luu-diem']`);
	const loiO = await thayNgay(
		t,
		(s) => window.__tim(s).length > 0,
		`${DONG(K.b1)} ${LON} [data-slot='field-error']`,
	);
	const chuLoi = loiO
		? await chuSel(t, `${DONG(K.b1)} ${LON} [data-slot='field-error']`)
		: "";
	e13(
		`buoc 3: luu khong ly do -> loi duoi o «${CHU.cham.canLyDo}» (thay «${chuLoi}»)`,
		chuLoi === CHU.cham.canLyDo,
	);
	const lyDoTrans = await t.evaluate(
		(s) => window.__tim(s)[0]?.getAttribute("translate") ?? null,
		`${DONG(K.b1)} ${LON} [data-o-ly-do] textarea`,
	);
	e13(`buoc 7: o ly do translate=no (thay ${lyDoTrans})`, lyDoTrans === "no");
	await go(
		t,
		`${DONG(K.b1)} ${LON} [data-o-ly-do] textarea`,
		TEN_CHAM.lyDoCham,
	);
	await bam(t, `${DONG(K.b1)} ${LON} [data-nut='luu-diem']`);
	const mot = CHU.cham.daCham("1", String(tong));
	await doi(
		t,
		`E13 buoc 3: sau luu co ly do -> «${mot}»`,
		(c) => window.__tim("[data-tien-do-cham]")[0]?.innerText.trim() === c,
		mot,
	);
	const dongB1 = await db.okrDiemKr.findUnique({
		where: { keyResultId: K.b1 },
		select: { diem: true, lyDo: true },
	});
	const dbB1 = dongB1?.diem === null || !dongB1 ? null : Number(dongB1.diem);
	const mongB1 = K.thang === "0-100" ? chonB1 / 100 : chonB1;
	console.log(
		`  E14 DB okrDiemKr b1: ${JSON.stringify({ diem: dbB1, lyDo: dongB1?.lyDo })}, da chon ${mongB1}`,
	);
	if (dbB1 !== mongB1)
		console.log(`  E14: diem da chon ${mongB1} nhung DB ${dbB1}`);
	e14(
		`sau Luu diem co ly do: DB diem ${dbB1} bang diem da chon ${mongB1}, lyDo bang chu da go (thay «${dongB1?.lyDo}»)`,
		dbB1 === mongB1 && dongB1?.lyDo === TEN_CHAM.lyDoCham,
	);
	const soMan = await chuSel(t, "[data-tien-do-cham]");
	const soDb = await soDaChamDb();
	e14(
		`«Đã chấm N/M» tren man bang so dong okrDiemKr co diem (man «${soMan}», DB ${soDb})`,
		soMan === CHU.cham.daCham(String(soDb), String(tong)),
	);

	await go(t, `${KHOI(K.A)} [data-o-hoc] textarea`, TEN_CHAM.hoc);
	await bam(t, `${KHOI(K.A)} [data-nut='luu-hoc']`);
	await coToast(t, CHU.cham.hoc.daLuu);
	const hoc = await db.okrNhinLai.findUnique({
		where: { objectiveId: K.A },
		select: { dieuHocDuoc: true },
	});
	e14(
		`DB okrNhinLai cua A bang chu da go (thay «${hoc?.dieuHocDuoc}»)`,
		hoc?.dieuHocDuoc === TEN_CHAM.hoc,
	);

	await bam(t, `${KHOI(K.A)} [data-nut='mang-sang']`);
	const HOP_MS = `[data-hop-thoai-mang-sang='${K.A}']`;
	if (await coMat(t, HOP_MS, "E13 buoc 5: hop thoai mang sang")) {
		const noi = await t.evaluate(
			(h) => ({
				chu: window.__tim(h)[0]?.innerText ?? "",
				chep: window
					.__tim(`${h} [data-kr-chep]`)
					.map((e) => e.getAttribute("data-kr-chep")),
				khong: window
					.__tim(`${h} [data-kr-khong-chep]`)
					.map((e) => e.getAttribute("data-kr-khong-chep")),
			}),
			HOP_MS,
		);
		console.log(
			`  E13 hop thoai mang sang: chep ${JSON.stringify(noi.chep)} khong ${JSON.stringify(noi.khong)}`,
		);
		e13(
			`buoc 5: hop thoai neu chu ky ke «${K.tenQuy}»`,
			noi.chu.includes(K.tenQuy),
		);
		e13(
			`buoc 5: KR chep [a1], KR khong chep [a2] (thay ${JSON.stringify(noi)})`,
			JSON.stringify(noi.chep) === JSON.stringify([K.a1]) &&
				JSON.stringify(noi.khong) === JSON.stringify([K.a2]),
		);
		await chup(t, "buoc-mang-sang.png");
		await bam(t, `${HOP_MS} [data-nut='xac-nhan-mang-sang']`);
		await doi(
			t,
			`E13 buoc 5: khoi muc tieu A hien «${CHU.cham.daMangSang} ${K.tenQuy}»`,
			(s, c) =>
				(window.__tim(s)[0]?.innerText ?? "").replace(/\s+/g, " ").trim() === c,
			`${KHOI(K.A)} [data-da-mang-sang]`,
			`${CHU.cham.daMangSang} ${K.tenQuy}`,
		);
	}
	const ms = await db.okrMangSang.findMany({
		where: { tuObjectiveId: K.A },
		select: {
			sangCycleId: true,
			sangObjective: {
				select: {
					title: true,
					status: true,
					keyResults: { select: { title: true } },
				},
			},
		},
	});
	console.log(`  E14 DB okrMangSang cua A: ${JSON.stringify(ms)}`);
	e14(
		`DB co okrMangSang tu A sang ${K.quy} va muc tieu nhap chep dung KR a1`,
		ms.length === 1 &&
			ms[0].sangCycleId === K.quy &&
			ms[0].sangObjective.status === "nhap" &&
			ms[0].sangObjective.title === TEN_CHAM.A &&
			JSON.stringify(ms[0].sangObjective.keyResults.map((k) => k.title)) ===
				JSON.stringify([TEN_CHAM.a1]),
	);

	await t.setViewport({ width: DO.hep, height: DO.cao });
	await t.reload({ waitUntil: "load", timeout: CHO_TAI });
	await t
		.waitForNetworkIdle({ idleTime: 500, timeout: DO.choMs })
		.catch(() => null);
	await coMat(t, "[data-cham-diem]", "E13 390: man cham diem");
	const boChon = await t.evaluate((s) => {
		const the = window.__tim(s);
		const a = the[0];
		a?.scrollIntoView({ block: "nearest", inline: "nearest" });
		const r = a?.getBoundingClientRect();
		const giua = r
			? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
			: null;
		return {
			hang: window.__tim("[data-the-con-bo]").length,
			cham: the.length,
			bamDuoc: Boolean(
				a &&
					r &&
					r.width > 0 &&
					r.left >= 0 &&
					r.right <= window.innerWidth &&
					giua &&
					a.contains(giua),
			),
		};
	}, THE_CHAM);
	e13(
		`buoc 7: o 390 the «${CHU.cham.cachXem}» bam duoc trong hang the (thay ${JSON.stringify(boChon)})`,
		boChon.hang === 1 && boChon.cham === 1 && boChon.bamDuoc,
	);
	await chup(t, "buoc-cham-390.png");
	await t.close();

	const t2 = await moTrang(cookie.truong, DO.hep, duongCham(`pb:${K.P}`, ""));
	if (await coMat(t2, THE_CHAM, "E13 390: the Cham diem trong hang the")) {
		await t2.evaluate(
			(s) =>
				window
					.__tim(s)[0]
					?.scrollIntoView({ block: "nearest", inline: "nearest" }),
			THE_CHAM,
		);
		await bam(t2, THE_CHAM);
		await coMat(t2, "[data-cham-diem]", "E13 390: bam the Cham diem");
		e13(
			`buoc 7: o 390 bam the «${CHU.cham.cachXem}» doi URL (thay ${t2.url()})`,
			new URL(t2.url()).searchParams.get("xemOkr") === "cham",
		);
	}
	await t2.close();
}

async function buocChamTrangThai() {
	const cua = { dang: true, chan: 0 };
	const tl = await moTrang(
		cookie.truong,
		DO.rong,
		duongCham(`pb:${K.P}`),
		chanBangCham(cookie.truong, cua),
	);
	const coLoi = await coMat(
		tl,
		"[data-trang-thai='ST-cham-loi'] button",
		"E13 buoc 6: chan bangCham -> loi co Thu lai",
	);
	console.log(`  E13 cua chan: chan ${cua.chan} luot bangCham`);
	if (coLoi) {
		await chup(tl, "buoc-cham-loi.png");
		cua.dang = false;
		await bam(tl, "[data-trang-thai='ST-cham-loi'] button");
		await coMat(tl, "[data-cham-diem]", "E13 buoc 6: bam Thu lai tai lai duoc");
	}
	await tl.close();

	const tr = await moTrang(cookie.truong, DO.rong, duongCham(`pb:${K.P2}`));
	await coMat(
		tr,
		"[data-trang-thai='ST-cham-rong']",
		"E13 buoc 6: don vi khong co muc tieu cong bo -> rong",
	);
	await chup(tr, "buoc-cham-rong.png");
	await tr.close();

	const to = await moTrang(cookie.chiOkr, DO.rong, duongCham(`pb:${K.P}`));
	if (
		await coMat(
			to,
			"[data-cham-diem] [data-diem-doc]",
			"E13 buoc 6: vai okr doc duoc diem",
		)
	) {
		e13(
			"buoc 6: vai okr khong phu trach khong co o chon diem",
			!(await coSel(to, "[data-cham-diem] [data-slot='select-trigger']")),
		);
	}
	await chup(to, "buoc-cham-chi-okr.png");
	await to.close();

	const conLai = await db.okrDiemKr.findMany({
		where: { cycleId: K.truoc, diem: null },
		select: { keyResultId: true, diemGoiY: true },
	});
	for (const d of conLai)
		await lam(cookie.truong, "okr.chamKr", {
			keyResultId: d.keyResultId,
			diem: theoThang(Number(d.diemGoiY)),
		});
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: K.truoc,
		phase: "da-dong",
	});
	const td = await moTrang(cookie.truong, DO.rong, duongCham(`pb:${K.P}`));
	if (
		await coMat(
			td,
			"[data-trang-thai='ST-cham-dadong']",
			"E13 buoc 6: ky da dong",
		)
	) {
		const oGhi = await td.evaluate(() => ({
			diem: window.__tim("[data-cham-diem] [data-slot='select-trigger']")
				.length,
			hoc: window.__tim("[data-cham-diem] [data-o-hoc] textarea").length,
			luu: window.__tim("[data-cham-diem] [data-nut='luu-diem']").length,
		}));
		e13(
			`buoc 6: ky da dong chi doc (thay ${JSON.stringify(oGhi)})`,
			oGhi.diem === 0 && oGhi.hoc === 0 && oGhi.luu === 0,
		);
	}
	await chup(td, "buoc-cham-da-dong.png");
	await td.close();
}

async function buocCham() {
	nhom = "E13/E14";
	await gieoCham();
	await buocChamChinh();
	if (chon(["E13"])) await buocChamTrangThai();
}

const e15 = (nhan, dat) => (chon(["E15"]) ? kiem(`E15 ${nhan}`, dat) : dat);
const e22 = (nhan, dat) => (chon(["E22"]) ? kiem(`E22 ${nhan}`, dat) : dat);

const TEN_KHEP = {
	P3: `Phòng Vận hành khép kỳ ${MA}`,
	X: "Đối tác mới được đón trọn tuần đầu",
	Y: "Vận hành đơn đối tác không trễ hạn",
	x1: "Đối tác mới ký trong quý",
	x2: "Buổi đào tạo đối tác đã xong",
	y1: "Đơn đối tác giao đúng hạn",
	lyDo: "Chấm nhầm thang điểm của phòng Đối tác",
};

const quyLui = (n) => {
	const so = NAM * 4 + (QUY - 1) - n;
	return { nam: Math.floor(so / 4), quy: (so % 4) + 1 };
};
const congNgay = (s, n) => {
	const d = new Date(`${s}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
};
const ngayDb = (d) => d.toISOString().slice(0, 10);
const CUOI_THANG = ngay(
	NAM,
	Number(HOM_NAY.slice(5, 7)),
	cuoiThang(NAM, Number(HOM_NAY.slice(5, 7))),
);
const DEN_RA = [congNgay(HOM_NAY, 3), CUOI_THANG, CUOI_QUY].sort()[0];
const HANG = (ky) => `[data-chu-ky='${ky}']`;

async function namCua(y) {
	if (y === NAM) return G.ky[0];
	const ten = `Năm ${y} ${MA}`;
	const co = await db.okrCycle.findFirst({ where: { name: ten } });
	if (co) return co.id;
	const nam = await lam(cookie.admin, "okr.createCycle", {
		kind: "nam",
		name: ten,
		parentId: null,
		startsOn: ngay(y, 1, 1),
		endsOn: ngay(y, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(nam.id);
	return nam.id;
}

async function gieoKhep() {
	const mo = await db.okrCuaSoRa.findMany({
		where: { cycleId: K.quy, dongLuc: null },
		select: { id: true },
	});
	for (const r of mo) await lam(cookie.admin, "okr.dongRa", { id: r.id });
	const pb3 = await lam(cookie.admin, "org.createDepartment", {
		name: TEN_KHEP.P3,
		divisionId: null,
	});
	G.pb.push(pb3.id);
	K.P3 = pb3.id;
	await lam(cookie.admin, "org.setPlacement", {
		userId: id.admin,
		primaryDepartmentId: K.P3,
		secondaryDepartmentIds: [],
		managerUserId: null,
	});
	await lam(cookie.admin, "org.setHead", {
		kind: "department",
		id: K.P3,
		userId: id.admin,
	});
	const t = quyLui(2);
	const ten = `Quý ${t.quy}/${t.nam} ${MA}`;
	const qua = await lam(cookie.admin, "okr.createCycle", {
		kind: "quy",
		name: ten,
		parentId: await namCua(t.nam),
		startsOn: ngay(t.nam, t.quy * 3 - 2, 1),
		endsOn: ngay(t.nam, t.quy * 3, cuoiThang(t.nam, t.quy * 3)),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(qua.id);
	K.qua = qua.id;
	K.tenQua = ten;
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: qua.id,
		phase: "dang-chay",
	});
	const taoMt = async (c, khoa, donVi, owner) => {
		const r = await lam(c, "okr.createObjective", {
			cycleId: K.qua,
			unit: { level: "phong-ban", departmentId: donVi },
			title: TEN_KHEP[khoa],
			kind: "cam-ket",
			ownerUserId: owner,
			participantIds: [],
			whyNow: "",
		});
		G.mt.push(r.id);
		K[khoa] = r.id;
	};
	await taoMt(cookie.truong, "X", K.P, id.truong);
	await taoMt(cookie.admin, "Y", K.P3, id.admin);
	for (const [c, khoa, mt, owner, khoi, dich, hien] of [
		[cookie.truong, "x1", "X", id.truong, 0, 10, 6],
		[cookie.truong, "x2", "X", id.truong, 0, 4, 4],
		[cookie.admin, "y1", "Y", id.admin, 80, 95, 90],
	]) {
		const r = await lam(c, "okr.createKeyResult", {
			objectiveId: K[mt],
			title: TEN_KHEP[khoa],
			kind: "tang-toi",
			ownerUserId: owner,
			startValue: khoi,
			targetValue: dich,
			currentValue: hien,
			unit: "",
			dueOn: null,
			weight: 1,
		});
		G.kr.push(r.id);
		K[khoa] = r.id;
	}
	await lam(cookie.truong, "okr.publishObjective", { id: K.X });
	await lam(cookie.admin, "okr.publishObjective", { id: K.Y });
	console.log(
		`  gieo khep: ${ten} ${K.qua} (dang-chay, da qua ngay cuoi), X=${K.X} (2 KR, P), Y=${K.Y} (1 KR, P3), dong ${mo.length} cua so ra con mo cua ${K.quy}`,
	);
}

async function bamThu(trang, sel, i) {
	const tay = await trang.evaluateHandle(
		(s, n) => window.__tim(s)[n] ?? null,
		sel,
		i,
	);
	const el = tay.asElement();
	if (!el) return kiem(`khong thay ${sel}[${i}] de bam`, false);
	await el.click();
	return true;
}

const hetLich = (t) =>
	thayNgay(t, () => window.__tim("[data-slot='popover-content']").length === 0);

async function chonNgay(t, sheet, i, ngayChon) {
	const nut = `${sheet} [data-slot='date-picker-trigger']`;
	const o = `[data-slot='popover-content'] button[data-day='${ngayChon}']`;
	const mong = formatDay(ngayChon, "vi");
	for (let lan = 0; lan < 3; lan += 1) {
		await hetLich(t);
		await bamThu(t, nut, i);
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
			nut,
			i,
		);
		if (thay === mong) return true;
	}
	return kiem(`E15: chon ngay ${ngayChon} vao o thu ${i} cua sheet ra`, false);
}

async function moMenu(t, ky, viec) {
	await bam(t, `[data-menu-chu-ky='${ky}']`);
	const muc = `[data-viec-chu-ky='${viec}']`;
	if (!(await coMat(t, muc, `E15: menu ${ky} co muc ${viec}`))) return false;
	await bam(t, muc);
	return true;
}

async function phaDb(ky) {
	return (await db.okrCycle.findUnique({ where: { id: ky } }))?.phase ?? null;
}

async function phaKhop(t, ky, nhan) {
	const db_ = await phaDb(ky);
	const mong = db_ ? CHU_OKR.caiDat.pha[db_] : "";
	const ok = await thayNgay(
		t,
		(s, m) => (window.__tim(s)[0]?.innerText ?? "").includes(m),
		HANG(ky),
		mong,
	);
	const thay = await chuSel(t, HANG(ky));
	e15(
		`${nhan}: pha tren bang «${mong}» bang phase DB ${db_} (dong: «${thay}»)`,
		ok,
	);
	return db_;
}

async function moCaiDat(c, rong = DO.rong) {
	const t = await moTrang(c, rong, "/settings/okr");
	t.boQua400 = true;
	await coMat(t, "[data-chu-ky]", "E15: bang chu ky");
	return t;
}

function docCsv(chu) {
	const dong = [];
	let o = "";
	let hang = [];
	let trongNhay = false;
	for (let i = 0; i < chu.length; i += 1) {
		const k = chu[i];
		if (trongNhay) {
			if (k === '"' && chu[i + 1] === '"') {
				o += '"';
				i += 1;
			} else if (k === '"') trongNhay = false;
			else o += k;
		} else if (k === '"') trongNhay = true;
		else if (k === ",") {
			hang.push(o);
			o = "";
		} else if (k === "\n" || k === "\r") {
			if (k === "\r" && chu[i + 1] === "\n") i += 1;
			hang.push(o);
			dong.push(hang);
			hang = [];
			o = "";
		} else o += k;
	}
	if (o !== "" || hang.length > 0) {
		hang.push(o);
		dong.push(hang);
	}
	return dong;
}

async function buocMoRa() {
	const t = await moCaiDat(cookie.admin);
	if (!(await moMenu(t, K.quy, "mo-ra"))) return t.close();
	const sheet = `[data-sheet-mo-ra='${K.quy}']`;
	if (!(await coMat(t, sheet, "E15 buoc 1: sheet Mo ra giua ky")))
		return t.close();
	const tuMacDinh = await chuSel(
		t,
		`${sheet} [data-slot='date-picker-trigger']`,
	);
	e15(
		`buoc 1: tu ngay mac dinh la hom nay ${formatDay(HOM_NAY, "vi")} (thay «${tuMacDinh}»)`,
		tuMacDinh === formatDay(HOM_NAY, "vi"),
	);
	if (DEN_RA > HOM_NAY) {
		await chonNgay(t, sheet, 1, HOM_NAY);
		await chonNgay(t, sheet, 0, DEN_RA);
		const chan = await thayNgay(
			t,
			(s) => window.__tim(`${s} [data-loi-ra='thu-tu']`).length > 0,
			sheet,
		);
		const loi = await chuSel(t, `${sheet} [data-loi-ra]`);
		e15(
			`buoc 1: tu ${DEN_RA} sau den ${HOM_NAY} -> man bao «${CHU.caiDat.ra.loiThuTu}» (thay «${loi}»)`,
			chan && loi === CHU.caiDat.ra.loiThuTu,
		);
		e15(
			"buoc 1: tu sau den -> nut Mo ra tat, khong gui",
			(await nutTat(t, "[data-nut='gui-mo-ra']")) === true,
		);
		await chonNgay(t, sheet, 0, HOM_NAY);
	} else
		console.log(
			`  E15 buoc 1: bo qua kiem tu > den (hom nay ${HOM_NAY} la ngay cuoi thang)`,
		);
	await chonNgay(t, sheet, 1, DEN_RA);
	await doi(
		t,
		"E15 buoc 1: du hai ngay -> nut Mo ra bat",
		() => window.__tim("[data-nut='gui-mo-ra']")[0]?.disabled === false,
	);
	await bam(t, "[data-nut='gui-mo-ra']");
	await thayNgay(t, (s) => window.__tim(s).length === 0, sheet);
	const mong = CHU.caiDat.dongPhu(
		formatDay(HOM_NAY, "vi"),
		formatDay(DEN_RA, "vi"),
	);
	const coDong = await thayNgay(
		t,
		(s) => window.__tim(s).length > 0,
		`${HANG(K.quy)} [data-dong-ra]`,
	);
	const dongPhu = await chuSel(t, `${HANG(K.quy)} [data-dong-ra]`);
	e15(
		`buoc 1: dong phu «${mong}» (thay «${dongPhu}»)`,
		coDong && dongPhu === mong,
	);
	await chup(t, "buoc-mo-ra.png");
	const ra = await db.okrCuaSoRa.findMany({
		where: { cycleId: K.quy, dongLuc: null },
		select: { tuNgay: true, denNgay: true },
	});
	const raDoc = ra.map((r) => [ngayDb(r.tuNgay), ngayDb(r.denNgay)]);
	console.log(`  E22 DB okrCuaSoRa mo cua ${K.quy}: ${JSON.stringify(raDoc)}`);
	e22(
		`sau Mo ra: DB co mot okrCuaSoRa ${HOM_NAY}..${DEN_RA} (thay ${JSON.stringify(raDoc)})`,
		raDoc.length === 1 && raDoc[0][0] === HOM_NAY && raDoc[0][1] === DEN_RA,
	);
	await t.close();

	const t2 = await moTrang(cookie.truong, DO.rong, "/okr");
	const coDai = await coMat(
		t2,
		"[data-dai-ky='ra']",
		"E15 buoc 1: dai ra giua ky o khu OKR",
	);
	if (coDai) {
		const tieuDe = await chuSel(
			t2,
			"[data-dai-ky='ra'] [data-slot='alert-title']",
		);
		const mongDai = CHU.dai.ra(formatDay(DEN_RA, "vi"));
		e15(`buoc 1: dai «${mongDai}» (thay «${tieuDe}»)`, tieuDe === mongDai);
	}
	await t2.close();
}

async function buocSangChamSom() {
	const t = await moCaiDat(cookie.admin);
	if (await moMenu(t, K.quy, "sang-cham")) {
		await coMat(t, "[role='alertdialog']", "E15 buoc 2: hoi Sang cham diem");
		await bamTheoChu(t, "[role='alertdialog'] button", CHU.caiDat.sangCham.nut);
		await coToast(t, OKR_API.thongDiep.khep.chamTuNgaySau);
	}
	await phaKhop(t, K.quy, "buoc 2");
	const pha = await phaDb(K.quy);
	const diem = await db.okrDiemKr.count({ where: { cycleId: K.quy } });
	console.log(`  E22 DB sau sang cham som: phase ${pha}, okrDiemKr ${diem}`);
	e22(
		`sau Sang cham som: phase van dang-chay va 0 dong okrDiemKr (thay ${pha}, ${diem})`,
		pha === "dang-chay" && diem === 0,
	);
	await t.close();
}

async function buocSangChamDongKy() {
	const t = await moCaiDat(cookie.admin);
	if (await moMenu(t, K.qua, "sang-cham")) {
		await coMat(t, "[role='alertdialog']", "E15 buoc 3: hoi Sang cham diem");
		await bamTheoChu(t, "[role='alertdialog'] button", CHU.caiDat.sangCham.nut);
		await coToast(t, CHU.caiDat.sangCham.daSang(K.tenQua));
	}
	const pha = await phaKhop(t, K.qua, "buoc 3");
	const soDong = await db.okrDiemKr.count({ where: { cycleId: K.qua } });
	e15(
		`buoc 3: sang cham diem ky da qua ngay cuoi -> phase cham-diem, 3 dong diem (thay ${pha}, ${soDong})`,
		pha === "cham-diem" && soDong === 3,
	);

	if (await moMenu(t, K.qua, "dong-ky")) {
		const hop = `[data-hop-dong-ky='${K.qua}']`;
		await coMat(
			t,
			`${hop} [data-don-vi-chua-cham]`,
			"E15 buoc 4: hop dong ky liet don vi",
		);
		const dsMan = await t.evaluate(
			(h) =>
				window
					.__tim(`${h} [data-don-vi-chua-cham]`)
					.map((e) => [
						e.getAttribute("data-don-vi-chua-cham"),
						e.innerText.replace(/\s+/g, " ").trim(),
					]),
			hop,
		);
		const conDb = await db.okrDiemKr.findMany({
			where: { cycleId: K.qua, diem: null },
			select: {
				keyResult: {
					select: { objective: { select: { departmentId: true } } },
				},
			},
		});
		const theoPb = {};
		for (const d of conDb) {
			const pb = d.keyResult.objective.departmentId;
			theoPb[pb] = (theoPb[pb] ?? 0) + 1;
		}
		console.log(
			`  E15 buoc 4: man ${JSON.stringify(dsMan)}; DB con ${JSON.stringify(theoPb)}`,
		);
		const khop =
			dsMan.length === Object.keys(theoPb).length &&
			Object.entries(theoPb).every(([pb, n]) =>
				dsMan.some(
					([khoa, chu]) =>
						khoa?.endsWith(pb) && chu.endsWith(CHU.caiDat.dong.soKr(String(n))),
				),
			);
		e15(
			`buoc 4: hop dong liet dung don vi va so KR chua cham theo DB (${JSON.stringify(theoPb)})`,
			khop,
		);
		const tat = await nutTat(t, `${hop} [data-nut='dong-ky']`);
		if (tat !== true) {
			console.log(
				`  E15 buoc 4: nút đóng kỳ bật khi còn ${conDb.length} KR chưa chấm`,
			);
		}
		e15(`buoc 4: nut Dong ky tat (thay disabled=${tat})`, tat === true);
		await chup(t, "buoc-dong-chan.png");
		await t.setViewport({ width: DO.hep, height: DO.cao });
		await cho(500);
		await chup(t, "buoc-dong-chan-390.png");
		await t.setViewport({ width: DO.rong, height: DO.cao });
		const phaSau = await phaDb(K.qua);
		console.log(`  E22 DB sau Dong ky khi con KR chua cham: phase ${phaSau}`);
		e22(
			`sau Dong ky khi con KR chua cham: phase van cham-diem (thay ${phaSau})`,
			phaSau === "cham-diem",
		);
	}
	await t.close();

	const dong = await db.okrDiemKr.findMany({
		where: { cycleId: K.qua },
		select: { keyResultId: true, diemGoiY: true, thang: true },
	});
	for (const d of dong)
		await lam(
			d.keyResultId === K.y1 ? cookie.admin : cookie.truong,
			"okr.chamKr",
			{
				keyResultId: d.keyResultId,
				diem:
					d.thang === "0-100"
						? Math.round(Number(d.diemGoiY) * 100)
						: Number(d.diemGoiY),
			},
		);

	const t2 = await moCaiDat(cookie.admin);
	if (await moMenu(t2, K.qua, "dong-ky")) {
		const hoi = await coMat(
			t2,
			"[role='alertdialog']",
			"E15 buoc 5: du diem -> hoi dong ky",
		);
		if (hoi) {
			await bamTheoChu(t2, "[role='alertdialog'] button", CHU.caiDat.dong.nut);
			await coToast(t2, CHU.caiDat.dong.daDong(K.tenQua));
		}
	}
	const phaDong = await phaKhop(t2, K.qua, "buoc 5");
	console.log(`  E22 DB sau Dong ky khi du: phase ${phaDong}`);
	e22(
		`sau Dong ky khi du: phase da-dong (thay ${phaDong})`,
		phaDong === "da-dong",
	);
	await t2.close();
}

async function buocMoLai() {
	const t = await moCaiDat(cookie.admin);
	if (await moMenu(t, K.qua, "mo-lai")) {
		const hop = `[data-hop-mo-lai='${K.qua}']`;
		await coMat(t, `${hop} [data-o-ly-do-mo-lai]`, "E15 buoc 6: hop mo lai");
		e15(
			"buoc 6: nut Mo lai tat khi ly do trong",
			(await nutTat(t, `${hop} [data-nut='mo-lai-ky']`)) === true,
		);
		await go(t, `${hop} [data-o-ly-do-mo-lai]`, "ngắn");
		e15(
			"buoc 6: nut Mo lai tat khi ly do duoi toi thieu",
			(await nutTat(t, `${hop} [data-nut='mo-lai-ky']`)) === true,
		);
		await go(t, `${hop} [data-o-ly-do-mo-lai]`, TEN_KHEP.lyDo);
		await doi(
			t,
			"E15 buoc 6: go ly do du -> nut Mo lai bat",
			(h) => window.__tim(`${h} [data-nut='mo-lai-ky']`)[0]?.disabled === false,
			hop,
		);
		await chup(t, "buoc-mo-lai-ly-do.png");
		await bam(t, `${hop} [data-nut='mo-lai-ky']`);
		await coToast(t, CHU.caiDat.moLai.daMo(K.tenQua));
	}
	const pha = await phaKhop(t, K.qua, "buoc 6");
	await chup(t, "buoc-mo-lai.png");
	const vet = await db.okrTrail.findMany({
		where: { cycleId: K.qua, action: "mo-lai-ky" },
		select: { note: true },
	});
	const note = vet.map((v) => v.note);
	console.log(
		`  E22 DB sau Mo lai: phase ${pha}, vet mo-lai-ky ${JSON.stringify(note)}`,
	);
	if (vet.length === 1 && note[0] !== TEN_KHEP.lyDo)
		console.log(
			`  E22: note doc duoc «${note[0]}» khac ly do da go «${TEN_KHEP.lyDo}»`,
		);
	e22(
		`sau Mo lai: phase cham-diem va dung mot dong okrTrail mo-lai-ky note bang ly do da go (thay ${pha}, ${JSON.stringify(note)})`,
		pha === "cham-diem" && vet.length === 1 && note[0] === TEN_KHEP.lyDo,
	);
	await t.close();
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: K.qua,
		phase: "da-dong",
	});
}

async function buocXuat() {
	const thuMuc = mkdtempSync(join(tmpdir(), "khep-ky-xuat-"));
	try {
		const t = await moTrang(
			cookie.truong,
			DO.rong,
			`/okr/toan-canh?kyOkr=${K.qua}`,
		);
		const cdp = await t.createCDPSession();
		await cdp.send("Browser.setDownloadBehavior", {
			behavior: "allow",
			downloadPath: thuMuc,
		});
		if (
			await coMat(
				t,
				"[data-nut='xuat-ky']",
				"E15 buoc 7: nut Xuat o Toan canh ky da dong",
			)
		) {
			await bam(t, "[data-nut='xuat-ky']");
			let tep = null;
			for (let i = 0; i < DO.choMs / 200 && !tep; i += 1) {
				tep =
					readdirSync(thuMuc).find((f) => !f.endsWith(".crdownload")) ?? null;
				if (!tep) await cho(200);
			}
			e15(
				`buoc 7: tai ve tep .csv (thay ${tep})`,
				tep?.endsWith(".csv") === true,
			);
			if (tep) {
				const chu = readFileSync(join(thuMuc, tep), "utf8").replace(/^﻿/, "");
				const dong = docCsv(chu);
				const dau = dong[0]?.join(",") ?? "";
				e15(
					`buoc 7: dong dau bang COT_XUAT (thay «${dau.slice(0, 160)}»)`,
					dau === COT_XUAT.join(","),
				);
				const soKr = await db.okrKeyResult.count({
					where: {
						objective: { cycleId: K.qua, status: { in: ["cong-bo", "da-bo"] } },
					},
				});
				console.log(
					`  E22 tep xuat ${tep}: ${dong.length - 1} dong du lieu, DB ${soKr} KR`,
				);
				e22(
					`tep xuat co so dong du lieu bang so KR doc DB (thay ${dong.length - 1}, DB ${soKr})`,
					dong.length - 1 === soKr,
				);
			}
		}
		await chup(t, "buoc-xuat.png");
		await t.close();
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}

async function buocKhongQuyen() {
	const t = await moCaiDat(cookie.docOnly);
	const ra = await t.evaluate((lyDoId) => {
		const menu = window.__tim("[data-menu-chu-ky]");
		const lyDo = window.__tim("[data-ly-do-khong-quyen]")[0];
		return {
			soMenu: menu.length,
			moiTat: menu.every((e) => e.disabled),
			moiTro: menu.every((e) =>
				(e.getAttribute("aria-describedby") ?? "").split(" ").includes(lyDoId),
			),
			lyDo: lyDo?.innerText.trim() ?? null,
			lyDoId: lyDo?.id ?? null,
		};
	}, "okr-cai-dat-ly-do");
	e15(
		`buoc 8: thanh vien thuong: moi menu chu ky tat, tro toi dong giai thich «${CHU_OKR.caiDat.khongQuyen}» (thay ${JSON.stringify(ra)})`,
		ra.soMenu > 0 &&
			ra.moiTat &&
			ra.moiTro &&
			ra.lyDo === CHU_OKR.caiDat.khongQuyen,
	);
	await chup(t, "buoc-khong-quyen.png");
	await t.close();
}

async function buocKhep() {
	nhom = "E15/E22";
	await gieoKhep();
	await buocMoRa();
	await buocSangChamSom();
	await buocSangChamDongKy();
	await buocMoLai();
	await buocXuat();
	await buocKhongQuyen();
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
	if (chon(["E13", "E14"])) {
		const b = Date.now();
		await buocCham().catch((e) =>
			hong.push(`E13/E14: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  nhom E13/E14: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	if (chon(["E15", "E22"])) {
		const b = Date.now();
		await buocKhep().catch((e) =>
			hong.push(`E15/E22: nem ${String(e).slice(0, 400)}`),
		);
		console.log(`  nhom E15/E22: ${Math.round((Date.now() - b) / 1000)} s`);
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
