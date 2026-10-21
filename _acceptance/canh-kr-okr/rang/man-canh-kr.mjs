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
const HO_SO = "canh-kr-okr";
const TAM =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "man");
const DICH = join(GOC, "_acceptance", HO_SO, "evidence", "man");
const HOP_DONG = join(GOC, "_acceptance", HO_SO, "contract.md");
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const NHOM = {
	E11: "E11",
	E12: "E11",
	E14: "E14",
	E15: "E14",
	E16: "E16",
	E17: "E16",
};
const MOI_EVAL = Object.keys(NHOM);
const LENH_DO =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/canh-kr-okr/rang/man-canh-kr.mjs"';

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

const TEP_VIEC = "apps/app/components/crm/record-sheet/kr-viec.tsx";
const TEP_MT = "apps/app/components/crm/record-sheet/objective-sheet.tsx";
const TEP_TRAO_DOI =
	"apps/app/components/crm/record-sheet/objective-trao-doi.tsx";
const TEP_TU_MAU = "apps/app/app/(app)/[slug]/okr/tu-mau.tsx";
const TEP_TAO_TU_MAU = "apps/api/src/okr/okr-mau.service.ts";
const TEP_LIEN_KET = "apps/api/src/okr/canh-kr.ts";
const VET = {
	E11: {
		eval: "E11",
		tep: TEP_MT,
		mo: "ban sao bang KR dem ca sang kien vao tong",
		cam: (s) =>
			s.replace("tong: k.soViec.tong,", "tong: k.soViec.tong + k.soSangKien,"),
		ghim: /cot Viec cua K1 nhan «1\/3» thay «1\/2»/,
	},
	E12: {
		eval: "E11",
		tep: TEP_VIEC,
		mo: "ban sao dong nhap gui tieu de cat ngan hon chuoi da go (12 ky tu)",
		cam: (s) =>
			s.replace(
				"await onLuu({ tieuDe: kq.data, nguoiLamUserId: nguoiLam, hanNgay: han });",
				"await onLuu({ tieuDe: kq.data.slice(0, 12), nguoiLamUserId: nguoiLam, hanNgay: han });",
			),
		ghim: /DB tieuDe «[^»]*» khac chuoi da go «[^»]+»/,
	},
	"E15-nhan": {
		eval: "E14",
		tep: TEP_TRAO_DOI,
		mo: "ban sao o soan gui thieu nguoi nhan thu hai",
		cam: (s) =>
			s.replace(
				"if (ghiNhan) onGuiGhiNhan({ keyResultId, nguoiNhan, loiNhan }, datLai);",
				"if (ghiNhan)\n\t\t\tonGuiGhiNhan(\n\t\t\t\t{ keyResultId, nguoiNhan: nguoiNhan.slice(0, 1), loiNhan },\n\t\t\t\tdatLai,\n\t\t\t);",
			),
		ghim: /tap nguoi nhan DB \[[^\]]*\] khac tap da chon \[[^\]]*\]/,
	},
	E14: {
		eval: "E14",
		tep: TEP_LIEN_KET,
		mo: "ban sao lienKetChoVai tra ten cho moi vai — mot ban sao lam E14 (DOM lo ten) va E15 (mang lo ten) cung do",
		cam: (s) =>
			s.replace(
				'\tif (!docDuocPhamVi(role, "doi-tac"))\n\t\treturn { loai: hang.loai, coQuyen: false };\n',
				"\tvoid docDuocPhamVi;\n",
			),
		ghim: [
			/E14 buoc-chi-okr: ten lo «[^»]+»/,
			/vai okr nhan [1-9]\d* phan hoi chua id\/ten cua P/,
		],
	},
	E16: {
		eval: "E16",
		tep: TEP_TU_MAU,
		mo: "ban sao danh sach mau phia man khong loc theo don vi",
		cam: (s) =>
			s.replace(
				"...trpc.okr.mau.queryOptions(loc ?? {}),",
				"...trpc.okr.mau.queryOptions({}),",
			),
		ghim: /E16 buoc 5: mau moi lot vao «Dat muc tieu» cua truong [^:]+: «[^»]+»/,
	},
	E17: {
		eval: "E16",
		tep: TEP_TAO_TU_MAU,
		mo: "ban sao taoTuMau (may chu) bo buoc ghi okrMucTieuTuMau",
		cam: (s) =>
			s.replace(
				"\t\t\tawait tx.okrMucTieuTuMau.create({\n\t\t\t\tdata: { objectiveId: objective.id, mauId: mau.id },\n\t\t\t});\n",
				"",
			),
		ghim: /E17: mot muc tieu nhap duoc tao nhung không có hàng mẫu nguồn/,
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
	const tam = mkdtempSync(join(tmpdir(), "canh-kr-chieu-do-"));
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
		moiTruong.PHIEN_DO_TEN_CAY = "canh-kr-chieu-do";
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
const { db } = await import("../../../packages/db/src/index.ts");
const { okrCanhKrMessages } = await import(
	"../../../apps/app/lib/messages/okr-canh-kr.ts"
);
const { okrMessages } = await import("../../../apps/app/lib/messages/okr.ts");
const { parseMauNoiDung } = await import(
	"../../../packages/validation/src/okr-mau.ts"
);
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const { API, APP, CHO_TAI, CHROME, chiaCookie, datTrinhDuyet, ket, khongDo } =
	await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");

const DO = {
	rong: 1440,
	hep: 390,
	cao: 900,
	choMs: 30_000,
	choHydrateMs: 800,
	choKhongHienMs: 1500,
	choGhiMs: 1500,
	choMoHopMs: 5000,
	lanMoHop: 3,
};
const MA = `c${Date.now().toString(36).slice(-6)}`;
const LOI_BO_QUA = /Download the React DevTools/;
const LOI_NGOAI = /Hydration failed[\s\S]*AppIconRailFallback/;
const CHU = okrCanhKrMessages("vi");
const CHU_OKR = okrMessages("vi");
const TIEN_TO_MAU = "mau-okr-";
const MIEN_MAU = "mau.onehub.test";
const idMau = (loai, ma) => `${TIEN_TO_MAU}${loai}-${ma}`;
const dien = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const QUY4 = idMau("chu-ky", "quy4");

const NGUOI = {
	quanTri: "le-hai-dang",
	truong: "nguyen-thi-lan",
	docOnly: "phan-kim-chi",
	chiOkr: "doan-thi-thu",
	thuong: "do-minh-khoa",
	truongNgoai: "dinh-cong-son",
};
const NGUOI_LAM = "do-minh-khoa";
const NHAN = ["hoang-yen-nhi", "ngo-van-toan"];
const PB = { p1: "kd-bac", them: "cham-soc", ngoai: "kho-van" };

const TEN = {
	M: `Đối tác cũ quay lại đặt hàng ${MA}`,
	k1: "Đối tác cũ đặt lại đơn trong quý",
	k2: "Ký biên bản hợp tác với chuỗi lạnh",
	k3: "Tỷ lệ đối tác mới gọi lại trong tuần",
	k4: "Hoàn tất quy trình thẩm định đối tác",
	viec1: "Lập danh sách đối tác cũ cần gọi lại",
	viec2: "Soạn kịch bản gọi lại",
	viecMoi: "Gọi lại 20 đối tác cũ",
	congTyP: `Công ty Phương Nam ${MA}`,
	congTyQ: `Công ty Quang Minh ${MA}`,
	loiGhiNhan: `Cảm ơn hai bạn đã gọi lại trọn danh sách đối tác cũ ${MA}`,
	mau: `Mẫu giữ chân đối tác ${MA}`,
	cauMau: "Giữ chân đối tác cũ",
	krMau1: "Đối tác cũ gia hạn hợp đồng",
	krMau2: "Đơn đặt lại từ đối tác cũ",
	MK: `Mục tiêu của kỳ đang chấm ${MA}`,
	k5: "KR của kỳ đang chấm điểm",
	viec5: "Việc của kỳ đang chấm",
	urlK2: "https://docs.example.test/bien-ban-hop-tac",
	urlSai: "drive.google.com/x",
	urlDung: "https://drive.google.com/x",
	urlCapNhatSai: "javascript:x",
	urlCapNhat: "https://drive.google.com/bb",
};
const SO_MAU = { k1: [10, 30], k2Sai: [50, 20], k2: [50, 80] };
const SO_TU_MAU = [
	[12, 30],
	[55, 90],
];

console.log(
	CHON.size === 0
		? `man-canh-kr: chay tron (E11/E12, E14/E15, E16/E17); chay rieng: EVAL=E14 hoac --chi E16; chieu do: --chieu-do (ma: ${MOI_VET.join(", ")})`
		: `man-canh-kr: chi chay ${[...CHON].join(", ")}${process.env.CHIEU_DO ? ` (ban sao chieu do ${process.env.CHIEU_DO})` : ""}`,
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
const G = {
	mt: [],
	kr: [],
	ky: [],
	mau: [],
	plan: [],
	khuon: [],
	congTy: [],
};
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
		nguoiLam: NGUOI_LAM,
		nhan0: NHAN[0],
		nhan1: NHAN[1],
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
			.join(", ")}`,
	);
	if (vaiCua.get(id.chiOkr) !== "okr" || vaiCua.get(id.quanTri) !== "admin")
		await khongDo(
			"KHONG DO DUOC: vai cua nguoi mau khong dung (can chiOkr=okr, quanTri=admin)",
		);
}

async function gieoKeHoach() {
	const a = cookie.quanTri;
	const khuon = await lam(a, "onboarding.createTemplate", {
		name: `Khung đón đối tác ${MA}`,
		partnerType: null,
		steps: [
			{
				label: "Gọi chào",
				departmentId: idMau("pb", PB.p1),
				position: 0,
				offsetDays: 0,
			},
		],
	});
	G.khuon.push(khuon.id);
	for (const [khoa, tenCty] of [
		["P", TEN.congTyP],
		["Q", TEN.congTyQ],
	]) {
		const cty = await lam(a, "companies.create", { name: tenCty });
		G.congTy.push(cty.id);
		const kh = await lam(a, "onboarding.createFromTemplate", {
			companyId: cty.id,
			templateId: khuon.id,
			startedAt: new Intl.DateTimeFormat("en-CA", {
				timeZone: "Asia/Ho_Chi_Minh",
			}).format(new Date()),
			ownerId: id.quanTri,
		});
		G.plan.push(kh.id);
		K[khoa] = kh.id;
	}
}

async function gieoCanhKr() {
	const t = cookie.truong;
	const mt = await lam(t, "okr.createObjective", {
		cycleId: QUY4,
		unit: { level: "phong-ban", departmentId: idMau("pb", PB.p1) },
		title: TEN.M,
		kind: "cam-ket",
		ownerUserId: id.truong,
		participantIds: [],
		whyNow: "",
	});
	G.mt.push(mt.id);
	K.M = mt.id;
	for (const [khoa, title, kind, cur] of [
		["K1", TEN.k1, "tang-toi", 0],
		["K2", TEN.k2, "moc", 1],
		["K3", TEN.k3, "tang-toi", 0],
		["K4", TEN.k4, "moc", 0],
	]) {
		const kr = await lam(t, "okr.createKeyResult", {
			objectiveId: K.M,
			title,
			kind,
			ownerUserId: id.truong,
			startValue: 0,
			targetValue: kind === "moc" ? 1 : 20,
			currentValue: cur,
			unit: "",
			dueOn: null,
			weight: 1,
		});
		G.kr.push(kr.id);
		K[khoa] = kr.id;
	}
	await lam(t, "okr.publishObjective", { id: K.M });
	const v1 = await lam(t, "okr.themViec", {
		keyResultId: K.K1,
		tieuDe: TEN.viec1,
		nguoiLamUserId: id.nhan0,
		hanNgay: null,
	});
	await lam(t, "okr.danhDauViec", { id: v1.id, xong: true });
	await lam(t, "okr.themViec", {
		keyResultId: K.K1,
		tieuDe: TEN.viec2,
		nguoiLamUserId: id.nhan1,
		hanNgay: null,
	});
	await lam(t, "okr.themBangChung", {
		keyResultId: K.K2,
		url: TEN.urlK2,
		ghiChu: "Biên bản đã ký",
	});
	await gieoKeHoach();
	await lam(t, "okr.ganSangKien", {
		keyResultId: K.K1,
		loai: "ke-hoach",
		banGhiId: K.Q,
	});
	console.log(
		`  gieo: muc tieu M ${K.M} (P1 ${PB.p1}, quy 4 mau) — K1 ${K.K1} (2 viec, 1 xong, sang kien Q), K2 ${K.K2} (moc xong, 1 bang chung), K3 ${K.K3} (trong), K4 ${K.K4} (moc chua xong); ke hoach P ${K.P}, Q ${K.Q}`,
	);
}

async function gieoKyChamDiem() {
	const a = cookie.quanTri;
	const namTruoc =
		Number(
			new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })
				.format(new Date())
				.slice(0, 4),
		) - 1;
	const nam = await lam(a, "okr.createCycle", {
		kind: "nam",
		name: `Năm ${namTruoc} · đo ${MA}`,
		parentId: null,
		startsOn: `${namTruoc}-01-01`,
		endsOn: `${namTruoc}-12-31`,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(nam.id);
	const quy = await lam(a, "okr.createCycle", {
		kind: "quy",
		name: `Quý 4/${namTruoc} · đo ${MA}`,
		parentId: nam.id,
		startsOn: `${namTruoc}-10-01`,
		endsOn: `${namTruoc}-12-31`,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(quy.id);
	await lam(a, "okr.setCyclePhase", { id: quy.id, phase: "dang-chay" });
	const t = cookie.truong;
	const mt = await lam(t, "okr.createObjective", {
		cycleId: quy.id,
		unit: { level: "phong-ban", departmentId: idMau("pb", PB.p1) },
		title: TEN.MK,
		kind: "cam-ket",
		ownerUserId: id.truong,
		participantIds: [],
		whyNow: "",
	});
	G.mt.push(mt.id);
	K.MK = mt.id;
	const kr = await lam(t, "okr.createKeyResult", {
		objectiveId: K.MK,
		title: TEN.k5,
		kind: "tang-toi",
		ownerUserId: id.truong,
		startValue: 0,
		targetValue: 10,
		currentValue: 4,
		unit: "",
		dueOn: null,
		weight: 1,
	});
	G.kr.push(kr.id);
	K.K5 = kr.id;
	await lam(t, "okr.publishObjective", { id: K.MK });
	await lam(t, "okr.themViec", {
		keyResultId: K.K5,
		tieuDe: TEN.viec5,
		nguoiLamUserId: id.truong,
		hanNgay: null,
	});
	await lam(a, "okr.setCyclePhase", { id: quy.id, phase: "cham-diem" });
	console.log(
		`  gieo: ky ${quy.id} (quy 4/${namTruoc}) day sang cham-diem qua okr.setCyclePhase; muc tieu ${K.MK}, KR ${K.K5} co 1 viec`,
	);
}

function mayGhi(tenMay) {
	return { ten: tenMay, phan: [], hong: 0, dang: 0 };
}

async function ghiMang(trang, may) {
	const cdp = await trang.createCDPSession();
	await cdp.send("Network.enable", {
		maxTotalBufferSize: 200_000_000,
		maxResourceBufferSize: 50_000_000,
	});
	const cuaCho = new Map();
	cdp.on("Network.responseReceived", (e) =>
		cuaCho.set(e.requestId, { url: e.response.url, loai: e.type }),
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
			.catch(() => {
				may.hong += 1;
			})
			.finally(() => {
				may.dang -= 1;
			});
	});
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
		window.__hien = (e) =>
			e.checkVisibility() ||
			(getComputedStyle(e).display === "contents" &&
				(e.parentElement?.checkVisibility() ?? false));
		window.__tim = (s) =>
			[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
	});
	await trang.setViewport({ width: rong, height: DO.cao });
	if (tuy.may) await ghiMang(trang, tuy.may);
	if (tuy.truocKhiMo) await tuy.truocKhiMo(trang);
	if (tuy.boQua) trang.boQua = tuy.boQua;
	return trang;
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

async function bamTab(trang, khung, chu) {
	await doi(
		trang,
		`${nhom}: tab «${chu}» hien`,
		(k, c) =>
			window
				.__tim(`${k} [role='tab']`)
				.some((e) => e.innerText.replace(/\s+/g, " ").trim() === c),
		khung,
		chu,
	);
	return bamChu(trang, `${khung} [role='tab']`, chu);
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

async function moHop(trang, triggerSel) {
	if (
		!(await doi(
			trang,
			`${nhom}: ${triggerSel} san sang de chon`,
			(s) => window.__tim(s)[0]?.disabled === false,
			triggerSel,
		))
	)
		return false;
	for (let lan = 0; lan < DO.lanMoHop; lan += 1) {
		if (!(await bam(trang, triggerSel))) return false;
		const mo = await trang
			.waitForFunction(() => window.__tim("[role='option']").length > 0, {
				timeout: DO.choMoHopMs,
				polling: 200,
			})
			.then(() => true)
			.catch(() => false);
		if (mo) return true;
	}
	return kiem(`${nhom}: hop chon cua ${triggerSel} khong mo`, false);
}

async function chonHop(trang, triggerSel, tenMuc) {
	if (!(await moHop(trang, triggerSel))) return false;
	if (await coSel(trang, "[cmdk-input]")) {
		await trang.type("[cmdk-input]", tenMuc);
		await cho(300);
	}
	const tay = await trang.evaluateHandle(
		(c) =>
			window
				.__tim("[role='option']")
				.find((o) => o.innerText.replace(/\s+/g, " ").trim().startsWith(c)) ??
			null,
		tenMuc,
	);
	if (!tay.asElement()) {
		await trang.keyboard.press("Escape");
		return kiem(
			`${nhom}: khong co lua chon «${tenMuc}» o ${triggerSel}`,
			false,
		);
	}
	await bamEl(tay, `lua chon ${tenMuc}`);
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

async function kho(trang, rong) {
	await trang.setViewport({ width: rong, height: DO.cao });
	await cho(DO.choKhongHienMs);
}

const SHEET = (mt) => `[data-okr-sheet='${mt}']`;
const KHUNG = (kr) => `[data-kr-sheet='${kr}']`;
const recordCua = (trang) =>
	new URL(trang.url()).searchParams.get("record") ?? "";
const tabCua = (trang) => new URL(trang.url()).searchParams.get("tab");

async function tabChon(trang, khung) {
	return trang.evaluate(
		(k) =>
			window.__tim(`${k} [role='tab']`).map((e) => ({
				chu: e.innerText.replace(/\s+/g, " ").trim(),
				chon: e.getAttribute("aria-selected") === "true",
			})),
		khung,
	);
}

async function veTruoc(trang, khung) {
	return bam(trang, `${khung} [data-slot='sheet-header'] button`);
}

async function viecDb(kr) {
	return db.okrViecKr.findMany({
		where: { keyResultId: kr },
		select: {
			id: true,
			loai: true,
			tieuDe: true,
			nguoiLamUserId: true,
			xongLuc: true,
			planId: true,
		},
		orderBy: { createdAt: "asc" },
	});
}

async function demXongTong(kr) {
	const ds = (await viecDb(kr)).filter((v) => v.loai === "viec");
	return `${ds.filter((v) => v.xongLuc !== null).length}/${ds.length}`;
}

async function soViecTren(trang, kr) {
	return trang.evaluate(
		(s) =>
			window.__tim(`${s} [data-so-viec]`)[0]?.getAttribute("data-so-viec") ??
			"0/0",
		`[data-cot-viec='${kr}']`,
	);
}

async function buocBangKr() {
	const t = await moTrang("truong", DO.rong, `/okr?record=objective:${K.M}`);
	await coMat(
		t,
		`${SHEET(K.M)} [data-kr-hang='${K.K1}']`,
		"E11 buoc 3: bang KR",
	);
	const cot = await t.evaluate(
		(s, c) =>
			window
				.__tim(`${s} th`)
				.some((e) => e.innerText.replace(/\s+/g, " ").trim() === c),
		SHEET(K.M),
		CHU.bangKr.cotViec,
	);
	kiem(`E11 buoc 3: bang KR co cot «${CHU.bangKr.cotViec}»`, cot);
	await doi(
		t,
		"E11 buoc 3: o Viec cua K1 co so",
		(s) => window.__tim(`${s} [data-so-viec]`).length > 0,
		`[data-cot-viec='${K.K1}']`,
	);
	const soK1 = await soViecTren(t, K.K1);
	const chuK1 = await chuSel(t, `[data-cot-viec='${K.K1}']`);
	console.log(
		`  E11 buoc-bang-kr: o Viec K1 «${chuK1}» (data-so-viec ${soK1})`,
	);
	if (soK1 !== "1/2")
		console.log(
			`  E11 buoc-bang-kr: cot Viec cua K1 nhan «${soK1}» thay «1/2»`,
		);
	kiem(
		`E11 buoc-bang-kr: cot Viec cua K1 nhan «${soK1}» thay «1/2»`,
		soK1 === "1/2" && chuK1.startsWith("1/2"),
	);
	const chuK3 = await chuSel(t, `[data-cot-viec='${K.K3}']`);
	kiem(
		`E11 buoc 3: K3 (chua co gi) hien «${CHU.bangKr.them}» cho truong P1 (d-14) (thay «${chuK3}»)`,
		chuK3 === CHU.bangKr.them,
	);
	const bcK2 = await chuSel(
		t,
		`${SHEET(K.M)} [data-kr-hang='${K.K2}'] [data-co-bang-chung]`,
	);
	kiem(
		`E11 buoc 3: K2 co dau «${CHU.bangKr.coBangChung}» (thay «${bcK2}»)`,
		bcK2 === CHU.bangKr.coBangChung,
	);
	for (const k of ["K1", "K2", "K3", "K4"]) {
		const tren = await soViecTren(t, K[k]);
		const duoi = await demXongTong(K[k]);
		kiem(
			`E12: so xong/tong tren man cua ${k} «${tren}» bang dem DB loai viec «${duoi}»`,
			tren === duoi,
		);
	}
	await chup(t, "buoc-bang-kr.png");
	await kho(t, DO.hep);
	await chup(t, "buoc-bang-kr-390.png");
	await t.close();

	const d = await moTrang("docOnly", DO.rong, `/okr?record=objective:${K.M}`);
	await coMat(
		d,
		`${SHEET(K.M)} [data-kr-hang='${K.K3}']`,
		"E11 buoc 3: nguoi chi doc mo bang KR",
	);
	const chuDoc = await chuSel(d, `[data-cot-viec='${K.K3}']`);
	kiem(
		`E11 buoc 3: K3 hien «—» cho nguoi chi doc ${ten.docOnly} (thay «${chuDoc}»)`,
		chuDoc === "—",
	);
	await chup(d, "buoc-bang-kr-chi-doc.png");
	await bam(d, `[data-cot-viec='${K.K3}'] [data-mo-khung-kr='${K.K3}']`);
	const moDoc = await thayNgay(
		d,
		(k) =>
			window.__tim(`[data-kr-sheet='${k}'] [data-trang-thai^='ST-khungkr-']`)
				.length > 0,
		K.K3,
	);
	const trangThaiDoc = await d.evaluate(
		(k) =>
			window
				.__tim(`[data-kr-sheet='${k}'] [data-trang-thai^='ST-khungkr-']`)[0]
				?.getAttribute("data-trang-thai") ?? null,
		K.K3,
	);
	const recDoc = recordCua(d);
	console.log(
		`  E11 buoc 3: nguoi chi doc bam «—» cua K3 -> khung KR ${moDoc ? "mo" : "KHONG mo"} (${trangThaiDoc}, record ${recDoc})`,
	);
	kiem(
		`E11 buoc 3: nguoi chi doc bam «—» cua K3 mo khung KR cua K3 (thay ${trangThaiDoc}, record «${recDoc}»)`,
		moDoc &&
			recDoc === `objective:${K.M},kr:${K.K3}` &&
			trangThaiDoc === "ST-khungkr-rong" &&
			!(await coSel(d, `[data-kr-sheet='${K.K3}'] [data-nut='them-viec']`)),
	);
	await chup(d, "buoc-khung-kr-chi-doc.png");
	await d.close();
}

async function buocViecMoi(t) {
	nhom = "E11/E12 buoc 5";
	const truocIds = new Set((await viecDb(K.K1)).map((v) => v.id));
	await bam(t, `${KHUNG(K.K1)} [data-nut='them-viec']`);
	await coMat(
		t,
		"[data-dong-nhap] input[name='tieu-de-viec']",
		"E11 buoc 5: dong nhap",
	);
	await go(t, "[data-dong-nhap] input[name='tieu-de-viec']", TEN.viecMoi);
	await chonHop(
		t,
		"[data-dong-nhap] [data-slot='combobox-trigger']",
		ten.nguoiLam,
	);
	const nguoiChon = await chuSel(
		t,
		"[data-dong-nhap] [data-slot='combobox-trigger']",
	);
	kiem(
		`E11 buoc 5: nguoi lam da chon «${ten.nguoiLam}» (thay «${nguoiChon}»)`,
		nguoiChon === ten.nguoiLam,
	);
	await t.focus("[data-dong-nhap] input[name='tieu-de-viec']");
	await t.keyboard.press("Enter");
	const coDong = await doi(
		t,
		"E11 buoc 5: Enter -> dong viec moi hien",
		(k) =>
			window.__tim("[data-dong-nhap]").length === 0 &&
			window.__tim(`${k} [data-viec]`).length >= 3,
		KHUNG(K.K1),
	);
	const moi = (await viecDb(K.K1)).filter(
		(v) => v.loai === "viec" && !truocIds.has(v.id),
	);
	console.log(`  E12 DB viec moi cua K1: ${JSON.stringify(moi)}`);
	if (moi.length === 1 && moi[0].tieuDe !== TEN.viecMoi)
		console.log(
			`  E12: DB tieuDe «${moi[0].tieuDe}» khac chuoi da go «${TEN.viecMoi}»`,
		);
	kiem(
		`E12: DB co dung mot okrViecKr moi tieu de «${TEN.viecMoi}», nguoi lam ${ten.nguoiLam} (thay ${JSON.stringify(moi.map((v) => [v.tieuDe, v.nguoiLamUserId]))})`,
		moi.length === 1 &&
			moi[0].tieuDe === TEN.viecMoi &&
			moi[0].nguoiLamUserId === id.nguoiLam,
	);
	const viecMoi = moi[0]?.id ?? null;
	if (coDong && viecMoi) {
		await bam(t, `[data-viec='${viecMoi}'] [role='checkbox']`);
		await doi(
			t,
			"E11 buoc 5: danh dau xong -> dong mang data-xong",
			(v) => window.__tim(`[data-viec='${v}'][data-xong]`).length > 0,
			viecMoi,
		);
		await cho(DO.choKhongHienMs);
		const xong = await db.okrViecKr.findUnique({
			where: { id: viecMoi },
			select: { xongLuc: true },
		});
		kiem(
			`E12: sau danh dau xong, xongLuc khac null (thay ${xong?.xongLuc})`,
			xong?.xongLuc instanceof Date,
		);
	}
	await veTruoc(t, KHUNG(K.K1));
	await doi(
		t,
		"E11 buoc 5: dong khung KR -> cot Viec cua K1 thanh «2/3»",
		(k) =>
			window
				.__tim(`[data-cot-viec='${k}'] [data-so-viec]`)[0]
				?.getAttribute("data-so-viec") === "2/3",
		K.K1,
	);
}

async function buocGanP(t) {
	nhom = "E11/E12 buoc 6";
	await bam(t, `[data-cot-viec='${K.K1}'] [data-mo-khung-kr='${K.K1}']`);
	await coMat(
		t,
		`${KHUNG(K.K1)} [data-nut='gan-sang-kien']`,
		"E11 buoc 6: nut Gan",
	);
	await bam(t, `${KHUNG(K.K1)} [data-nut='gan-sang-kien']`);
	await coMat(
		t,
		"[data-muc='gan-ke-hoach']",
		"E11 buoc 6: muc Ke hoach 30 ngay",
	);
	const chuMuc = await chuSel(t, "[data-muc='gan-ke-hoach']");
	kiem(
		`E11 buoc 6: muc «${CHU.khung.ganKeHoach}» (thay «${chuMuc}»)`,
		chuMuc === CHU.khung.ganKeHoach,
	);
	await bam(t, "[data-muc='gan-ke-hoach']");
	const hop = "[data-slot='pick-list-dialog']";
	if (
		await coMat(
			t,
			`${hop} input[type='search']`,
			"E11 buoc 6: hop chon co o tim",
		)
	) {
		await go(t, `${hop} input[type='search']`, TEN.congTyP);
		const coP = await doi(
			t,
			"E11 buoc 6: hop chon hien ke hoach P khi tim",
			(h, p) =>
				window.__tim(`${h} [data-slot='pick-list-item'][data-id='${p}']`)
					.length > 0,
			hop,
			K.P,
		);
		if (coP) {
			await bam(
				t,
				`${hop} [data-slot='pick-list-item'][data-id='${K.P}'] label`,
			);
			await bamChu(
				t,
				`${hop} button`,
				dien(CHU.chon["ke-hoach"].xacNhan, { n: 1 }),
			);
		}
	}
	await doi(
		t,
		"E11 buoc 6: dong sang kien ten cong ty cua P co StatusIndicator",
		(k, c) =>
			window
				.__tim(`${k} [data-sang-kien][data-loai-sang-kien='ke-hoach']`)
				.some(
					(e) =>
						e.innerText.includes(c) &&
						e.querySelector("[data-slot='status-indicator']") !== null,
				),
		KHUNG(K.K1),
		TEN.congTyP,
	);
	await chup(t, "buoc-sang-kien.png");
	const ganP = (await viecDb(K.K1)).filter((v) => v.planId === K.P);
	kiem(
		`E12: sau gan P, okrViecKr {loai ke-hoach, planId P} (thay ${JSON.stringify(ganP.map((v) => [v.loai, v.planId]))})`,
		ganP.length === 1 && ganP[0].loai === "ke-hoach",
	);
}

async function buocDinhBangChung(t) {
	nhom = "E11/E12 buoc 7";
	await veTruoc(t, KHUNG(K.K1));
	await coMat(t, `[data-mo-khung-kr='${K.K2}']`, "E11 buoc 7: nut Viec cua K2");
	await bam(t, `[data-cot-viec='${K.K2}'] [data-mo-khung-kr='${K.K2}']`);
	await coMat(t, KHUNG(K.K2), "E11 buoc 7: khung KR K2");
	await bamTab(t, KHUNG(K.K2), CHU.khung.tabBangChung);
	await coMat(
		t,
		"[data-nut='dinh-bang-chung']",
		"E11 buoc 7: nut Dinh bang chung",
	);
	await bam(t, "[data-nut='dinh-bang-chung']");
	const hopBc = "[data-hop-dinh-bang-chung]";
	if (
		await coMat(
			t,
			`${hopBc} input[type='url']`,
			"E11 buoc 7: hop dinh bang chung",
		)
	) {
		await go(t, `${hopBc} input[type='url']`, TEN.urlSai);
		await doi(
			t,
			`E11 buoc 7: go «${TEN.urlSai}» -> loi duoi o`,
			(h, c) =>
				window
					.__tim(`${h} [data-slot='field-error']`)
					.some((e) => e.innerText.trim() === c),
			hopBc,
			CHU.bangChung.loiDuongDan,
		);
		kiem(
			"E11 buoc 7: nut Dinh khoa khi duong dan sai",
			(await nutTat(t, `${hopBc} [data-nut='dinh']`)) === true,
		);
		await go(t, `${hopBc} input[type='url']`, TEN.urlDung);
		await doi(
			t,
			"E11 buoc 7: nut Dinh bat khi duong dan dung",
			(h) => window.__tim(`${h} [data-nut='dinh']`)[0]?.disabled === false,
			hopBc,
		);
		await bam(t, `${hopBc} [data-nut='dinh']`);
		await doi(
			t,
			"E11 buoc 7: Dinh -> dong hien ten mien drive.google.com",
			(h) =>
				window.__tim(h).length === 0 &&
				window.__tim("[data-bang-chung] [data-ten-mien='drive.google.com']")
					.length > 0,
			hopBc,
		);
	}
	await chup(t, "buoc-bang-chung.png");
	const bc = await db.okrBangChung.findMany({
		where: { keyResultId: K.K2, url: TEN.urlDung },
		select: { url: true },
	});
	kiem(
		`E12: sau Dinh, okrBangChung cua K2 url bang chuoi da go «${TEN.urlDung}» (thay ${bc.length} hang)`,
		bc.length === 1,
	);
}

async function buocKhungKr() {
	nhom = "E11 buoc 4";
	const t = await moTrang("truong", DO.rong, `/okr?record=objective:${K.M}`);
	await coMat(t, `[data-mo-khung-kr='${K.K1}']`, "E11 buoc 4: nut so viec K1");
	await bam(t, `[data-cot-viec='${K.K1}'] [data-mo-khung-kr='${K.K1}']`);
	await coMat(t, KHUNG(K.K1), "E11 buoc 4: khung KR K1 mo");
	const rec = recordCua(t);
	kiem(
		`E11 buoc 4: URL mang record=…kr:${K.K1} chong tren objective:${K.M} (thay «${rec}»)`,
		rec === `objective:${K.M},kr:${K.K1}`,
	);
	await doi(
		t,
		"E11 buoc 4: khung KR tai xong",
		(k) =>
			window.__tim(`${k} [role='tab']`).length > 0 &&
			window.__tim(`${k} [data-viec]`).length > 0,
		KHUNG(K.K1),
	);
	const tab = await tabChon(t, KHUNG(K.K1));
	kiem(
		`E11 buoc 4: tab «${CHU.khung.tabViec}» chon san (thay ${JSON.stringify(tab)})`,
		tab.some((x) => x.chu === CHU.khung.tabViec && x.chon),
	);
	kiem(
		`E11 buoc 4: KR tang toi khong co tab «${CHU.khung.tabBangChung}»`,
		!tab.some((x) => x.chu === CHU.khung.tabBangChung),
	);
	K.urlK1 = t.url();
	const tieuDe = await t.evaluate(
		(k) =>
			window.__tim(`${k} [data-tieu-de-viec]`).map((e) => ({
				chu: e.innerText.trim(),
				khongDich: e.getAttribute("translate"),
			})),
		KHUNG(K.K1),
	);
	kiem(
		`E11 buoc 11: moi tieu de viec mang translate=no (thay ${JSON.stringify(tieuDe)})`,
		tieuDe.length >= 2 && tieuDe.every((x) => x.khongDich === "no"),
	);
	await chup(t, "buoc-khung-kr.png");
	await kho(t, DO.hep);
	await chup(t, "buoc-khung-kr-390.png");
	await kho(t, DO.rong);
	await buocViecMoi(t);
	await buocGanP(t);
	await buocDinhBangChung(t);
	await t.close();
}

async function buocMoThang() {
	nhom = "E11 buoc 8";
	const t = await trangMoi("truong", DO.rong);
	await diToi(t, K.urlK1);
	await coMat(t, KHUNG(K.K1), "E11 buoc 8: URL chep mo khung KR K1");
	const tieu = await chuSel(t, `${KHUNG(K.K1)} [data-slot='sheet-title']`);
	kiem(
		`E11 buoc 8: tieu de KR dung «${TEN.k1}» (thay «${tieu}»)`,
		tieu === TEN.k1,
	);
	kiem(
		`E11 buoc 8: khung KR chong tren khung muc tieu (record ${recordCua(t)})`,
		recordCua(t) === `objective:${K.M},kr:${K.K1}` &&
			(await coSel(t, `${KHUNG(K.K1)} [data-slot='sheet-header'] button`)),
	);
	const tab = await tabChon(t, KHUNG(K.K1));
	kiem(
		`E11 buoc 8: dung tab tren URL (${tabCua(t) ?? "mac dinh"}) -> «${CHU.khung.tabViec}» (thay ${JSON.stringify(tab)})`,
		tab.some((x) => x.chu === CHU.khung.tabViec && x.chon),
	);
	await t.close();

	const tr = await moTrang("truong", DO.rong, `/okr?record=kr:${K.K1}`);
	await coMat(tr, KHUNG(K.K1), "E11 buoc 8: record=kr:K1 tran mo khung KR");
	await doi(
		tr,
		"E11 buoc 8: record=kr tran -> khung muc tieu lot duoi",
		(m, k) =>
			new URL(location.href).searchParams.get("record") ===
			`objective:${m},kr:${k}`,
		K.M,
		K.K1,
	);
	await tr.close();

	const tb = await moTrang(
		"truong",
		DO.rong,
		`/okr?record=objective:${K.M},kr:${K.K2}&tab=bang-chung`,
	);
	await coMat(tb, KHUNG(K.K2), "E11 buoc 8: khung KR K2 tab tren URL");
	await doi(
		tb,
		"E11 buoc 8: tab=bang-chung tren URL -> tab Bang chung chon san",
		(k, c) =>
			window
				.__tim(`${k} [role='tab'][aria-selected='true']`)
				.some((e) => e.innerText.trim() === c),
		KHUNG(K.K2),
		CHU.khung.tabBangChung,
	);
	await tb.close();

	const tl = await moTrang(
		"truong",
		DO.rong,
		`/okr?record=objective:${K.M},kr:khong-co-${MA}`,
		{ boQua: /status of 404|NOT_FOUND|Không tìm thấy/ },
	);
	await doi(
		tl,
		"E11 buoc 8: record=kr:<khong ton tai> -> ngan KR khong thay",
		() => window.__tim("[data-trang-thai='ST-ngan-kr-khong-thay']").length > 0,
	);
	const ve = await chuSel(tl, "[data-nut='ve-muc-tieu']");
	kiem(
		`E11 buoc 8: loi co duong «${CHU.khung.khongCo.veMucTieu}» (thay «${ve}»)`,
		ve === CHU.khung.khongCo.veMucTieu,
	);
	await chup(tl, "buoc-mo-thang.png");
	await bam(tl, "[data-nut='ve-muc-tieu']");
	await coMat(
		tl,
		SHEET(K.M),
		"E11 buoc 8: Ve khung muc tieu -> khung muc tieu hien",
	);
	await tl.close();
}

async function xminCua(bang, ma) {
	if (!ma) return null;
	const r = await db.$queryRawUnsafe(
		`SELECT xmin::text AS x FROM "${bang}" WHERE id = $1`,
		ma,
	);
	return r[0]?.x ?? null;
}

async function buocCapNhatMoc() {
	nhom = "E11/E12 buoc 9";
	const t = await moTrang("truong", DO.rong, `/okr?record=objective:${K.M}`);
	await coMat(
		t,
		`${SHEET(K.M)} [data-kr-hang='${K.K4}']`,
		"E11 buoc 9: bang KR",
	);
	const truoc = new Date();
	await bam(
		t,
		`${SHEET(K.M)} [data-kr-hang='${K.K4}'] button[aria-haspopup='menu']`,
	);
	await coMat(
		t,
		"[data-muc='cap-nhat-kr']",
		"E11 buoc 9: menu KR co «Cập nhật»",
	);
	await bam(t, "[data-muc='cap-nhat-kr']");
	const hop = `[data-hop-cap-nhat-kr='${K.K4}']`;
	if (!(await coMat(t, hop, "E11 buoc 9: hop thoai cap nhat K4"))) {
		await t.close();
		return;
	}
	await bamChu(
		t,
		`${hop} [data-o='gia-tri'] [data-slot='toggle-group-item']`,
		CHU_OKR.moc.xong,
	);
	await coMat(
		t,
		`${hop} [data-o='bang-chung'] input`,
		"E11 buoc 9: chon Xong -> o Bang chung hien",
	);
	const nhan = await chuSel(
		t,
		`${hop} [data-o='bang-chung'] [data-slot='field-label']`,
	);
	kiem(
		`E11 buoc 9: nhan o «${CHU.capNhat.bangChung}» (thay «${nhan}»)`,
		nhan === CHU.capNhat.bangChung,
	);
	await bamChu(
		t,
		`${hop} [data-o='tu-tin'] [data-slot='toggle-group-item']`,
		CHU_OKR.capNhat.mucTuTin.cao,
	);
	await go(t, `${hop} [data-o='bang-chung'] input`, TEN.urlCapNhatSai);
	await doi(
		t,
		`E11 buoc 9: go «${TEN.urlCapNhatSai}» -> loi duoi o`,
		(h, c) =>
			window
				.__tim(`${h} [data-o='bang-chung'] [data-slot='field-error']`)
				.some((e) => e.innerText.trim() === c),
		hop,
		CHU.bangChung.loiDuongDan,
	);
	await cho(DO.choKhongHienMs);
	kiem(
		"E11 buoc 9: «Gửi cập nhật» khoa khi duong dan sai",
		(await nutTat(t, `${hop} [data-nut='gui-cap-nhat-kr']`)) === true,
	);
	await go(t, `${hop} [data-o='bang-chung'] input`, TEN.urlCapNhat);
	await doi(
		t,
		"E11 buoc 9: duong dan dung -> «Gửi cập nhật» bat",
		(h) =>
			window.__tim(`${h} [data-nut='gui-cap-nhat-kr']`)[0]?.disabled === false,
		hop,
	);
	await bam(t, `${hop} [data-nut='gui-cap-nhat-kr']`);
	await doi(
		t,
		"E11 buoc 9: gui -> hop dong",
		(h) => window.__tim(h).length === 0,
		hop,
	);
	await doi(
		t,
		"E11 buoc 9: K4 mang dau Co bang chung sau gui",
		(s, k) =>
			window.__tim(`${s} [data-kr-hang='${k}'] [data-co-bang-chung]`).length >
			0,
		SHEET(K.M),
		K.K4,
	);
	await chup(t, "buoc-cap-nhat-moc.png");
	await t.close();
	const ci = await db.okrCheckIn.findMany({
		where: { keyResultId: K.K4, createdAt: { gte: truoc } },
		select: { id: true, value: true, createdAt: true },
	});
	const bc = await db.okrBangChung.findMany({
		where: { keyResultId: K.K4 },
		select: { id: true, url: true, createdAt: true },
	});
	const xCi = await xminCua("okrCheckIn", ci[0]?.id);
	const xBc = await xminCua("okrBangChung", bc[0]?.id);
	console.log(
		`  E12 DB K4: okrCheckIn ${JSON.stringify(ci.map((c) => [Number(c.value), c.createdAt.toISOString()]))} xmin ${xCi}; okrBangChung ${JSON.stringify(bc.map((b) => [b.url, b.createdAt.toISOString()]))} xmin ${xBc}`,
	);
	kiem(
		`E12: sau gui K4, mot okrCheckIn moi gia tri 1 va mot okrBangChung url ${TEN.urlCapNhat} cung giao dich (xmin ${xCi} = ${xBc})`,
		ci.length === 1 &&
			Number(ci[0].value) === 1 &&
			bc.length === 1 &&
			bc[0].url === TEN.urlCapNhat &&
			xCi !== null &&
			xCi === xBc,
	);
}

async function buocTrangThai() {
	nhom = "E11 buoc 10";
	const t = await moTrang(
		"truong",
		DO.rong,
		`/okr?record=objective:${K.M},kr:${K.K3}`,
	);
	await doi(
		t,
		"E11 buoc 10: khung KR cua K3 -> Empty",
		() => window.__tim("[data-trang-thai='ST-khungkr-rong']").length > 0,
	);
	const rong = await chuTrang(t);
	kiem(
		`E11 buoc 10: Empty co «${CHU.khung.rong.tieuDe}» va nut «${CHU.khung.themViec}»`,
		rong.includes(CHU.khung.rong.tieuDe) &&
			(await coSel(
				t,
				"[data-trang-thai='ST-khungkr-rong'] [data-nut='them-viec']",
			)),
	);
	await chup(t, "buoc-rong.png");
	await t.close();

	const trang = { chan: true };
	const tc = await moTrang(
		"truong",
		DO.rong,
		`/okr?record=objective:${K.M},kr:${K.K3}`,
		{
			boQua: /Failed to load resource|ERR_FAILED|fetch|TRPCClientError/i,
			truocKhiMo: async (p) => {
				await p.setRequestInterception(true);
				p.on("request", (r) => {
					if (trang.chan && r.url().includes("okr.canhKr")) r.abort();
					else r.continue();
				});
			},
		},
	);
	await doi(
		tc,
		"E11 buoc 10: chan canhKr -> ngan KR loi tai",
		() => window.__tim("[data-trang-thai='ST-ngan-kr-loi']").length > 0,
	);
	const thuLai = await chuSel(tc, "[data-vung-tai-loi] [data-slot='kara-retry']");
	kiem(
		`E11 buoc 10: loi co nut «${CHU.khung.loi.thuLai}» (thay «${thuLai}»)`,
		thuLai === CHU.khung.loi.thuLai,
	);
	await chup(tc, "buoc-loi.png");
	trang.chan = false;
	await bam(tc, "[data-vung-tai-loi] [data-slot='kara-retry']");
	await doi(
		tc,
		"E11 buoc 10: bo chan, bam Thu lai -> tai duoc",
		() => window.__tim("[data-trang-thai='ST-khungkr-rong']").length > 0,
	);
	await tc.close();

	const tk = await moTrang(
		"truong",
		DO.rong,
		`/okr?record=objective:${K.MK},kr:${K.K5}`,
	);
	await doi(
		tk,
		"E11 buoc 10: ky cham-diem -> khung KR khoa",
		() => window.__tim("[data-trang-thai='ST-khungkr-khoa']").length > 0,
	);
	const khoa = await chuSel(tk, "[data-khoa-viec]");
	kiem(
		`E11 buoc 10: dong «${CHU.khung.khoa}» (thay «${khoa}»)`,
		khoa === CHU.khung.khoa,
	);
	const nut = await tk.evaluate(() => ({
		them: window.__tim("[data-nut='them-viec']").map((e) => e.disabled),
		gan: window.__tim("[data-nut='gan-sang-kien']").map((e) => e.disabled),
		danhDau: window
			.__tim("[data-viec] [role='checkbox']")
			.map((e) => e.disabled),
	}));
	kiem(
		`E11 buoc 10: nut ghi khoa (thay ${JSON.stringify(nut)})`,
		nut.them.every((x) => x === true) &&
			nut.gan.every((x) => x === true) &&
			nut.danhDau.length > 0 &&
			nut.danhDau.every((x) => x === true),
	);
	await chup(tk, "buoc-khoa.png");
	await tk.close();
}

async function nhomE11() {
	nhom = "E11/E12";
	await buocBangKr();
	await buocKhungKr();
	await buocMoThang();
	await buocCapNhatMoc();
	await buocTrangThai();
}

async function doiGhi(may) {
	await cho(DO.choGhiMs);
	for (let i = 0; i < 40 && may.dang > 0; i += 1) await cho(250);
}

function soiMay(may) {
	const lo = may.phan.filter(
		(p) =>
			p.than.includes(K.P) ||
			p.than.includes(TEN.congTyP) ||
			p.than.includes(K.Q) ||
			p.than.includes(TEN.congTyQ),
	);
	return {
		tong: may.phan.length,
		canhKr: may.phan.filter((p) => p.url.includes("canhKr")).length,
		lo,
		tenP: may.phan.filter((p) => p.than.includes(TEN.congTyP)).length,
	};
}

async function buocChiOkr(o) {
	await coMat(o, KHUNG(K.K1), "E14 buoc 2: nguoi chi OKR mo khung KR K1");
	await doi(
		o,
		"E14 buoc 2: khung KR K1 tai xong",
		(k) => window.__tim(`${k} [data-sang-kien]`).length > 0,
		KHUNG(K.K1),
	);
	const cau = dien(CHU.sangKien.khongQuyen, {
		loai: CHU.sangKien.loai["ke-hoach"],
	});
	const dong = await o.evaluate(
		(k) =>
			window
				.__tim(`${k} [data-sang-kien][data-loai-sang-kien='ke-hoach']`)
				.map((e) => ({
					chu: e.innerText.replace(/\s+/g, " ").trim(),
					chiOkr: e.hasAttribute("data-chi-okr"),
					mo: e.querySelector("[data-nut='mo-sang-kien'], a[href]") !== null,
				})),
		KHUNG(K.K1),
	);
	console.log(`  E14 buoc-chi-okr: dong sang kien ${JSON.stringify(dong)}`);
	const sai = dong.filter((d) => d.chu !== cau);
	for (const d of sai)
		console.log(
			`  E14 buoc-chi-okr: dong sang kien thieu cau «${cau}» (thay «${d.chu}»)`,
		);
	kiem(
		`E14 buoc-chi-okr: moi dong ke hoach doc «${cau}», mang data-chi-okr, khong duong mo (thay ${JSON.stringify(dong)})`,
		dong.length === 2 &&
			sai.length === 0 &&
			dong.every((d) => d.chiOkr && !d.mo),
	);
	kiem(
		"E14 buoc-chi-okr: khong nut «Gắn…»",
		!(await coSel(o, "[data-nut='gan-sang-kien']")),
	);
	const hien = await chuTrang(o);
	const dom = await o.evaluate(() => document.documentElement.outerHTML);
	const lo = [TEN.congTyP, TEN.congTyQ, K.P, K.Q].filter(
		(x) => hien.includes(x) || dom.includes(x),
	);
	for (const x of lo) console.log(`  E14 buoc-chi-okr: ten lo «${x}»`);
	kiem(
		`E14 buoc-chi-okr: DOM khong chua ten hay id cua ke hoach P, Q (lo ${JSON.stringify(lo)})`,
		lo.length === 0,
	);
	await chup(o, "buoc-chi-okr.png");
}

async function buocGhiNhan(o) {
	nhom = "E14/E15 buoc 3";
	const truoc = new Date();
	await veTruoc(o, KHUNG(K.K1));
	await coMat(o, SHEET(K.M), "E14 buoc 3: khung muc tieu");
	await bamTab(o, SHEET(K.M), CHU_OKR.sheet.tabTraoDoi);
	await coMat(o, "[data-o-loai-tin]", "E14 buoc 3: o soan co che do");
	await bamChu(
		o,
		"[data-o-loai-tin] [data-slot='toggle-group-item']",
		CHU.ghiNhan.cheDo.ghiNhan,
	);
	await coMat(o, "[data-o-nguoi-nhan]", "E14 buoc 3: o nguoi nhan");
	await chonHop(o, "[data-o-nguoi-nhan]", ten.nhan0);
	await chonHop(o, "[data-o-nguoi-nhan]", ten.nhan1);
	const daChon = await o.evaluate(() =>
		window
			.__tim("[data-token-nguoi-nhan]")
			.map((e) => e.getAttribute("data-token-nguoi-nhan")),
	);
	kiem(
		`E14 buoc 3: o soan mang dung hai nguoi nhan da chon (thay ${JSON.stringify(daChon)})`,
		JSON.stringify([...daChon].sort()) ===
			JSON.stringify([id.nhan0, id.nhan1].sort()),
	);
	await go(o, "[data-o-loi-nhan]", TEN.loiGhiNhan);
	await chonHop(o, "[data-o-kr]", TEN.k1);
	await doi(
		o,
		"E14 buoc 3: nut Gui ghi nhan bat",
		() => window.__tim("[data-nut='gui-ghi-nhan']")[0]?.disabled === false,
	);
	await bam(o, "[data-nut='gui-ghi-nhan']");
	const coGn = await doi(
		o,
		"E14 buoc 3: dong ghi nhan hien voi ten hai nguoi",
		(a, b, c) =>
			window
				.__tim("[data-ghi-nhan]")
				.some(
					(e) =>
						e.innerText.includes(a) &&
						e.innerText.includes(b) &&
						e.innerText.includes(c),
				),
		ten.nhan0,
		ten.nhan1,
		TEN.loiGhiNhan,
	);
	if (coGn) {
		const gn = await o.evaluate((c) => {
			const e = window
				.__tim("[data-ghi-nhan]")
				.find((x) => x.innerText.includes(c));
			const loi = e?.querySelector("[data-loi-ghi-nhan]");
			return {
				icon: e?.querySelector("svg") !== null,
				binhLuan: e?.hasAttribute("data-binh-luan") ?? true,
				khongDich: loi?.getAttribute("translate") ?? null,
				loi: loi?.textContent?.trim() ?? "",
			};
		}, TEN.loiGhiNhan);
		kiem(
			`E14 buoc 3: dong ghi nhan co bieu tuong, khac dong binh luan, loi mang translate=no (thay ${JSON.stringify(gn)})`,
			gn.icon &&
				!gn.binhLuan &&
				gn.khongDich === "no" &&
				gn.loi === TEN.loiGhiNhan,
		);
	}
	await chup(o, "buoc-ghi-nhan.png");
	await kho(o, DO.hep);
	await chup(o, "buoc-ghi-nhan-390.png");
	await kho(o, DO.rong);

	const gnDb = await db.okrGhiNhan.findMany({
		where: { objectiveId: K.M, createdAt: { gte: truoc } },
		select: {
			tacGiaUserId: true,
			keyResultId: true,
			loiNhan: true,
			nhan: { select: { userId: true } },
		},
	});
	const tapDb = (gnDb[0]?.nhan ?? []).map((n) => n.userId).sort();
	const tapChon = [...daChon].sort();
	console.log(
		`  E15 DB ghi nhan moi: ${JSON.stringify(gnDb.map((g) => ({ ...g, nhan: g.nhan.map((n) => n.userId) })))}; token da chon ${JSON.stringify(daChon)}`,
	);
	if (JSON.stringify(tapDb) !== JSON.stringify(tapChon))
		console.log(
			`  E15: tap nguoi nhan DB [${tapDb.join(", ")}] khac tap da chon [${tapChon.join(", ")}]`,
		);
	kiem(
		"E15: mot okrGhiNhan moi, tac gia vai okr, keyResultId K1, loi bang chuoi da go, nguoi nhan dung hai nguoi da chon (so tap)",
		gnDb.length === 1 &&
			gnDb[0].tacGiaUserId === id.chiOkr &&
			gnDb[0].keyResultId === K.K1 &&
			gnDb[0].loiNhan === TEN.loiGhiNhan &&
			JSON.stringify(tapDb) === JSON.stringify(tapChon),
	);
}

async function buocTruongMoP(mayT) {
	nhom = "E14/E15 buoc 4";
	const t = await moTrang(
		"truong",
		DO.rong,
		`/okr?record=objective:${K.M},kr:${K.K1}`,
		{ may: mayT },
	);
	const coTen = await doi(
		t,
		"E14 buoc 4: truong P1 thay dong sang kien co ten P",
		(k, c) =>
			window
				.__tim(`${k} [data-sang-kien][data-loai-sang-kien='ke-hoach']`)
				.some((e) => e.innerText.includes(c)),
		KHUNG(K.K1),
		TEN.congTyP,
	);
	if (coTen) {
		const tay = await t.evaluateHandle(
			(k, c) =>
				window
					.__tim(`${k} [data-sang-kien][data-loai-sang-kien='ke-hoach']`)
					.find((e) => e.innerText.includes(c))
					?.querySelector("[data-nut='mo-sang-kien']") ?? null,
			KHUNG(K.K1),
			TEN.congTyP,
		);
		await bamEl(tay, "nut mo ke hoach P");
		await doi(
			t,
			"E14 buoc 4: bam -> khung ke hoach P mo chong",
			(p, c) => {
				const rec = new URL(location.href).searchParams.get("record") ?? "";
				return (
					rec.split(",").at(-1) === `plan:${p}` &&
					window
						.__tim("[data-slot='sheet-title']")
						.some((e) => e.innerText.includes(c))
				);
			},
			K.P,
			TEN.congTyP,
		);
		await chup(t, "buoc-mo-ke-hoach.png");
	}
	await doiGhi(mayT);
	await t.close();
}

async function nhomE14() {
	nhom = "E14/E15";
	if (!chon("E11"))
		await lam(cookie.truong, "okr.ganSangKien", {
			keyResultId: K.K1,
			loai: "ke-hoach",
			banGhiId: K.P,
		});
	const mayO = mayGhi("chiOkr");
	const o = await moTrang(
		"chiOkr",
		DO.rong,
		`/okr?record=objective:${K.M},kr:${K.K1}`,
		{ may: mayO },
	);
	await buocChiOkr(o);
	await buocGhiNhan(o);
	await doiGhi(mayO);
	await o.close();

	const mayT = mayGhi("truong");
	await buocTruongMoP(mayT);

	const sO = soiMay(mayO);
	const sT = soiMay(mayT);
	console.log(
		`  E15 bo ghi CDP vai okr: ${sO.tong} phan hoi da ghi, ${sO.canhKr} phan hoi canhKr, ${sO.lo.length} phan hoi chua id/ten cua P hay Q (khong doc duoc ${mayO.hong})`,
	);
	console.log(
		`  E15 doi chung duong truong P1: ${sT.tong} phan hoi da ghi, ${sT.canhKr} canhKr, ${sT.tenP} phan hoi chua ten cong ty P`,
	);
	if (sO.lo.length > 0) {
		console.log(
			`  E15: vai okr nhan ${sO.lo.length} phan hoi chua id/ten cua P`,
		);
		for (const p of sO.lo.slice(0, 3)) {
			const i = [TEN.congTyP, K.P, TEN.congTyQ, K.Q]
				.map((x) => p.than.indexOf(x))
				.filter((x) => x >= 0)
				.sort((a, b) => a - b)[0];
			console.log(
				`  E15 phan hoi lo: ${p.url.slice(0, 160)} …${p.than.slice(Math.max(0, i - 80), i + 120)}…`,
			);
		}
	}
	kiem(
		`E15: bo ghi vai okr co phan hoi (${sO.tong}) va phan hoi canhKr (${sO.canhKr})`,
		sO.tong > 0 && sO.canhKr > 0,
	);
	kiem(
		`E15: vai okr nhan ${sO.lo.length} phan hoi chua id/ten cua P (mong 0)`,
		sO.lo.length === 0,
	);
	kiem(
		`E15: doi chung duong — phien truong P1 co >= 1 phan hoi chua ten cong ty P (thay ${sT.tenP})`,
		sT.tenP >= 1,
	);
}

async function dongMauMan(trang) {
	return trang.evaluate(() =>
		window.__tim("[data-the='mau-okr'] [data-mau]").map((e) => ({
			id: e.getAttribute("data-mau"),
			daDung: e.getAttribute("data-da-dung"),
			ten: e.querySelector("[data-slot='item-title'] [translate='no']")
				?.textContent,
			moTa: e
				.querySelector("[data-slot='item-description']")
				?.innerText.replace(/\s+/g, " ")
				.trim(),
		})),
	);
}

async function mauDb() {
	const ds = await db.okrMau.findMany({
		select: { id: true, ten: true, cap: true, donViIds: true, noiDung: true },
	});
	const dung = await db.okrMucTieuTuMau.findMany({ select: { mauId: true } });
	return ds.map((m) => ({
		...m,
		daDung: dung.filter((d) => d.mauId === m.id).length,
	}));
}

function moTaMong(m) {
	const t = CHU.mau.dong;
	const apCho =
		m.donViIds.length === 0
			? t.moiDonVi[m.cap]
			: dien(t.soDonVi, { n: m.donViIds.length });
	const soKr = parseMauNoiDung(m.noiDung).krs.length;
	return [
		CHU_OKR.hopThoai.capMucTieu[m.cap],
		apCho,
		dien(t.soKr, { n: soKr }),
		m.daDung > 0 ? dien(t.daDung, { n: m.daDung }) : t.chuaDung,
	].join(" · ");
}

async function soDaDung(trang, nhan) {
	const man = await dongMauMan(trang);
	const dsDb = await mauDb();
	for (const m of dsDb) {
		const d = man.find((x) => x.id === m.id);
		kiem(
			`${nhan}: data-da-dung cua mau ${m.ten} «${d?.daDung}» bang dem okrMucTieuTuMau ${m.daDung}`,
			d !== undefined && Number(d.daDung) === m.daDung,
		);
	}
	return { man, dsDb };
}

async function buocDanhSachMau(a) {
	await coMat(a, "[data-the='mau-okr'] [data-mau]", "E16 buoc 1: khoi Mau OKR");
	const { man, dsDb } = await soDaDung(a, "E17 buoc 1");
	const mau = dsDb.filter((m) => m.id.startsWith(TIEN_TO_MAU));
	kiem(
		`E16 buoc 1: khoi liet dung ba mau cua bo mau (thay ${man.length} dong, DB ${mau.length} mau mau)`,
		man.length === 3 && mau.length === 3,
	);
	for (const m of mau) {
		const d = man.find((x) => x.id === m.id);
		const mong = moTaMong(m);
		kiem(
			`E16 buoc 1: mau «${m.ten}» ghi «${mong}» (thay «${d?.moTa}»)`,
			d?.ten === m.ten && d?.moTa === mong,
		);
	}
	await chup(a, "buoc-mau-danh-sach.png");
}

async function buocSheetMau(a) {
	await bam(a, "[data-nut='them-mau']");
	const sheet = "[data-sheet-mau='moi']";
	await coMat(a, sheet, "E16 buoc 2: sheet Them mau mo");
	kiem(
		`E16 buoc 2: URL mang trang thai mo mau=moi (thay ${new URL(a.url()).searchParams.get("mau")})`,
		new URL(a.url()).searchParams.get("mau") === "moi",
	);
	kiem(
		"E16 buoc 2: «Lưu mẫu» tat khi trong",
		(await nutTat(a, `${sheet} [data-nut='luu-mau']`)) === true,
	);
	await go(a, `${sheet} [data-o-ten-mau]`, TEN.mau);
	const capPb = CHU_OKR.hopThoai.capMucTieu["phong-ban"];
	if ((await chuSel(a, `${sheet} [data-o-cap-mau]`)) !== capPb)
		await chonHop(a, `${sheet} [data-o-cap-mau]`, capPb);
	await bam(a, `${sheet} [data-nut='chon-don-vi']`);
	const hop = "[data-slot='pick-list-dialog']";
	await coMat(
		a,
		`${hop} [data-slot='pick-list-item']`,
		"E16 buoc 2: hop chon don vi",
	);
	for (const pb of [PB.p1, PB.them])
		await bam(
			a,
			`${hop} [data-slot='pick-list-item'][data-id='${idMau("pb", pb)}'] label`,
		);
	await bamChu(a, `${hop} button`, dien(CHU.mau.sheet.hop.xacNhan, { n: 2 }));
	await doi(
		a,
		"E16 buoc 2: hai don vi da chon",
		(s) => window.__tim(`${s} [data-token-don-vi]`).length === 2,
		sheet,
	);
	await go(a, `${sheet} [data-o-cau-muc-tieu]`, TEN.cauMau);
	const kr = (i, o) => `${sheet} [data-kr-mau='${i}'] ${o}`;
	await go(a, kr(0, "[data-o-ten-kr]"), TEN.krMau1);
	await go(a, kr(0, "[data-o-khoi-diem]"), String(SO_MAU.k1[0]));
	await go(a, kr(0, "[data-o-dich]"), String(SO_MAU.k1[1]));
	await bam(a, `${sheet} [data-nut='them-kr-mau']`);
	await coMat(a, `${sheet} [data-kr-mau='1']`, "E16 buoc 2: KR mau thu hai");
	await go(a, kr(1, "[data-o-ten-kr]"), TEN.krMau2);
	await go(a, kr(1, "[data-o-khoi-diem]"), String(SO_MAU.k2Sai[0]));
	await go(a, kr(1, "[data-o-dich]"), String(SO_MAU.k2Sai[1]));
	await doi(
		a,
		"E16 buoc 2: dich < khoi diem -> loi duoi dung o KR thu hai",
		(s) =>
			window.__tim(`${s} [data-kr-mau='1'] [data-loi-kieu]`).length > 0 &&
			window.__tim(`${s} [data-kr-mau='0'] [data-slot='field-error']`)
				.length === 0,
		sheet,
	);
	kiem(
		"E16 buoc 2: «Lưu mẫu» tat khi KR hong",
		(await nutTat(a, `${sheet} [data-nut='luu-mau']`)) === true,
	);
	await chup(a, "buoc-mau-sheet.png");
	await kho(a, DO.hep);
	await chup(a, "buoc-mau-sheet-390.png");
	await kho(a, DO.rong);
	await go(a, kr(1, "[data-o-dich]"), String(SO_MAU.k2[1]));
	await doi(
		a,
		"E16 buoc 2: sua so -> Luu bat",
		(s) => window.__tim(`${s} [data-nut='luu-mau']`)[0]?.disabled === false,
		sheet,
	);
	await bam(a, `${sheet} [data-nut='luu-mau']`);
	await doi(
		a,
		"E16 buoc 2: Luu -> sheet dong, danh sach co mau moi",
		(s, t) =>
			window.__tim(s).length === 0 &&
			window
				.__tim("[data-the='mau-okr'] [data-mau]")
				.some((e) => e.innerText.includes(t)),
		sheet,
		TEN.mau,
	);
	kiem(
		"E16 buoc 2: URL het trang thai mo sau Luu",
		new URL(a.url()).searchParams.get("mau") === null,
	);
	await chup(a, "buoc-mau-luu.png");
}

async function kiemMauMoiDb() {
	const moi = await db.okrMau.findMany({
		where: { ten: TEN.mau },
		select: { id: true, cap: true, donViIds: true, noiDung: true },
	});
	G.mau.push(...moi.map((m) => m.id));
	K.mau = moi[0]?.id ?? null;
	let krs = [];
	try {
		krs = moi[0] ? parseMauNoiDung(moi[0].noiDung).krs : [];
	} catch (e) {
		hong.push(`E17: noiDung khong parse: ${String(e).slice(0, 200)}`);
	}
	const tap = [...(moi[0]?.donViIds ?? [])].sort();
	const tapMong = [idMau("pb", PB.p1), idMau("pb", PB.them)].sort();
	console.log(
		`  E17 DB mau moi: ${JSON.stringify(moi.map((m) => ({ id: m.id, cap: m.cap, donViIds: m.donViIds })))} krs ${JSON.stringify(krs)}`,
	);
	const krDung = (k, title, [khoi, dich]) =>
		k?.title === title &&
		k.kind === "tang-toi" &&
		k.startValue === khoi &&
		k.targetValue === dich;
	kiem(
		`E17: DB co mot okrMau «${TEN.mau}» cap phong-ban, donViIds bang hai phong ban da chon (so tap), noiDung dung hai KR da go`,
		moi.length === 1 &&
			moi[0].cap === "phong-ban" &&
			JSON.stringify(tap) === JSON.stringify(tapMong) &&
			krs.length === 2 &&
			krDung(krs[0], TEN.krMau1, SO_MAU.k1) &&
			krDung(krs[1], TEN.krMau2, SO_MAU.k2),
	);
}

async function buocMauThanhVien() {
	nhom = "E16 buoc 3";
	const d = await moTrang("thuong", DO.rong, "/settings/okr");
	await coMat(
		d,
		"[data-the='mau-okr'] [data-mau]",
		"E16 buoc 3: thanh vien thuong doc duoc danh sach",
	);
	const ra = await d.evaluate((lyDoId) => {
		const them = window.__tim("[data-nut='them-mau']")[0];
		const thaoTac = window.__tim("[data-nut='thao-tac-mau']");
		const lyDo = document.getElementById(lyDoId);
		const tieuDe = window.__tim("[data-slot='page-shell-title'], main h1")[0];
		return {
			trangThai:
				window
					.__tim("[data-the='mau-okr'] [data-trang-thai]")[0]
					?.getAttribute("data-trang-thai") ?? null,
			soDong: window.__tim("[data-the='mau-okr'] [data-mau]").length,
			themTat: them?.disabled ?? null,
			themTro: them?.getAttribute("aria-describedby") ?? null,
			thaoTacTat: thaoTac.every((e) => e.disabled),
			lyDo: lyDo && window.__hien(lyDo) ? lyDo.innerText.trim() : null,
			duoiTieuDe:
				lyDo && tieuDe
					? lyDo.getBoundingClientRect().top >=
						tieuDe.getBoundingClientRect().bottom - 1
					: false,
		};
	}, "okr-cai-dat-ly-do");
	kiem(
		`E16 buoc 3: danh sach doc duoc, nut khoa, mot dong ly do «${CHU_OKR.caiDat.khongQuyen}» duoi tieu de (thay ${JSON.stringify(ra)})`,
		ra.trangThai === "ST-mau-khong-quyen" &&
			ra.soDong >= 4 &&
			ra.themTat === true &&
			ra.themTro === "okr-cai-dat-ly-do" &&
			ra.thaoTacTat &&
			ra.lyDo === CHU_OKR.caiDat.khongQuyen &&
			ra.duoiTieuDe,
	);
	await chup(d, "buoc-mau-khong-quyen.png");
	await d.close();
}

async function moDatMucTieu(khoa, pb) {
	const t = await moTrang(
		khoa,
		DO.rong,
		`/okr/theo-don-vi?kyOkr=${QUY4}&donOkr=pb:${idMau("pb", pb)}`,
	);
	await coMat(
		t,
		"[data-nut='them-muc-tieu']",
		`E16: nut Dat muc tieu cua ${pb}`,
	);
	await bam(t, "[data-nut='them-muc-tieu']");
	await coMat(
		t,
		"[data-hop-thoai-muc-tieu='moi']",
		`E16: hop Dat muc tieu cua ${pb}`,
	);
	await cho(DO.choKhongHienMs);
	return t;
}

async function formTuMau(t, hop, form) {
	await bam(t, `${hop} [data-nut='bat-dau-tu-mau']`);
	await coMat(
		t,
		`${hop} [data-chon-mau='${K.mau}']`,
		"E16 buoc 4: mau moi trong danh sach chon",
	);
	await bam(t, `${hop} [data-chon-mau='${K.mau}']`);
	await coMat(t, form, "E16 buoc 4: form tu mau");
	const dien0 = await t.evaluate(
		(f) => ({
			cau: window.__tim(`${f} [data-o-cau-tu-mau]`)[0]?.value ?? null,
			kr: window
				.__tim(`${f} [data-kr-tu-mau]`)
				.map((e) =>
					e.querySelector("[data-slot='item-title']")?.innerText.trim(),
				),
			so: window
				.__tim(`${f} [data-o-khoi-diem], ${f} [data-o-dich]`)
				.map((e) => e.value),
		}),
		form,
	);
	kiem(
		`E16 buoc 4: form dien san cau muc tieu va hai KR, o so trong (thay ${JSON.stringify(dien0)})`,
		dien0.cau === TEN.cauMau &&
			JSON.stringify(dien0.kr) === JSON.stringify([TEN.krMau1, TEN.krMau2]) &&
			dien0.so.length === 4 &&
			dien0.so.every((x) => x === ""),
	);
	await bam(t, `${hop} [data-nut='tao-tu-mau']`);
	await doi(
		t,
		"E16 buoc 4: Tao ban nhap khi o so trong -> o trong vien loi",
		(f) =>
			window.__tim(
				`${f} [data-o-khoi-diem][aria-invalid='true'], ${f} [data-o-dich][aria-invalid='true']`,
			).length === 4 &&
			window.__tim(`${f} [data-loi-kr-tu-mau='thieu']`).length === 2,
		form,
	);
	await kho(t, DO.hep);
	await chup(t, "buoc-tu-mau-390.png");
	await kho(t, DO.rong);
	for (const [i, [khoi, dich]] of SO_TU_MAU.entries()) {
		await go(
			t,
			`${form} [data-kr-tu-mau='${i}'] [data-o-khoi-diem]`,
			String(khoi),
		);
		await go(t, `${form} [data-kr-tu-mau='${i}'] [data-o-dich]`, String(dich));
	}
	await bam(t, `${hop} [data-nut='tao-tu-mau']`);
}

async function kiemTuMauDb(truoc) {
	const mt = await db.okrObjective.findMany({
		where: { cycleId: QUY4, createdAt: { gte: truoc } },
		select: {
			id: true,
			status: true,
			departmentId: true,
			keyResults: {
				select: { id: true, title: true, startValue: true, targetValue: true },
				orderBy: { position: "asc" },
			},
		},
	});
	G.mt.push(...mt.map((m) => m.id));
	for (const m of mt) G.kr.push(...m.keyResults.map((k) => k.id));
	const nguon = await db.okrMucTieuTuMau.findMany({
		where: { objectiveId: { in: mt.map((m) => m.id) } },
		select: { objectiveId: true, mauId: true },
	});
	console.log(
		`  E17 DB muc tieu moi: ${JSON.stringify(mt.map((m) => ({ id: m.id, status: m.status, departmentId: m.departmentId, kr: m.keyResults.map((k) => [k.title, Number(k.startValue), Number(k.targetValue)]) })))}; nguon ${JSON.stringify(nguon)}`,
	);
	if (mt.length === 1 && nguon.length === 0)
		console.log(
			"  E17: mot muc tieu nhap duoc tao nhung không có hàng mẫu nguồn",
		);
	kiem(
		"E17: DB co muc tieu nhap o dung phong ban, hai KR dung so da dien, okrMucTieuTuMau tro mau moi",
		mt.length === 1 &&
			mt[0].status === "nhap" &&
			mt[0].departmentId === idMau("pb", PB.p1) &&
			mt[0].keyResults.length === 2 &&
			mt[0].keyResults.every(
				(k, i) =>
					k.title === [TEN.krMau1, TEN.krMau2][i] &&
					Number(k.startValue) === SO_TU_MAU[i][0] &&
					Number(k.targetValue) === SO_TU_MAU[i][1],
			) &&
			nguon.length === 1 &&
			nguon[0].mauId === K.mau,
	);
}

async function buocTuMau() {
	nhom = "E16/E17 buoc 4";
	const truoc = new Date();
	const t = await moDatMucTieu("truong", PB.p1);
	const hop = "[data-hop-thoai-muc-tieu='moi']";
	const form = `[data-form-tu-mau='${K.mau}']`;
	if (
		await coMat(
			t,
			`${hop} [data-nut='bat-dau-tu-mau']`,
			"E16 buoc 4: nut «Bắt đầu từ mẫu»",
		)
	)
		await formTuMau(t, hop, form);
	const moMt = await doi(t, "E16 buoc 4: tao -> khung muc tieu nhap mo", () => {
		const rec = new URL(location.href).searchParams.get("record") ?? "";
		return (
			rec.startsWith("objective:") &&
			window.__tim("[data-okr-sheet]").length > 0
		);
	});
	const loiTao = await chuSel(t, "[data-loi-tu-mau]");
	if (loiTao) console.log(`  E16 buoc 4: may chu tu choi: ${loiTao}`);
	if (moMt) await chup(t, "buoc-tu-mau.png");
	await t.close();
	await kiemTuMauDb(truoc);
}

async function buocMauNgoai() {
	nhom = "E16 buoc 5";
	const t = await moDatMucTieu("truongNgoai", PB.ngoai);
	const hop = "[data-hop-thoai-muc-tieu='moi']";
	let mauHien = [];
	if (await coSel(t, `${hop} [data-nut='bat-dau-tu-mau']`)) {
		await bam(t, `${hop} [data-nut='bat-dau-tu-mau']`);
		await thayNgay(
			t,
			(h) => window.__tim(`${h} [data-chon-mau]`).length > 0,
			hop,
		);
		mauHien = await t.evaluate(
			(h) =>
				window.__tim(`${h} [data-chon-mau]`).map((e) => ({
					id: e.getAttribute("data-chon-mau"),
					ten: e.querySelector("[translate='no']")?.textContent ?? "",
				})),
			hop,
		);
	}
	console.log(
		`  E16 buoc 5: truong ${PB.ngoai} (${ten.truongNgoai}) thay mau ${JSON.stringify(mauHien)}`,
	);
	const lot = mauHien.filter((m) => m.id === K.mau);
	for (const m of lot)
		console.log(
			`  E16 buoc 5: mau moi lot vao «Dat muc tieu» cua truong ${PB.ngoai}: «${m.ten}»`,
		);
	kiem(
		`E16 buoc 5: «Đặt mục tiêu» cua truong ${PB.ngoai} khong co mau moi`,
		lot.length === 0,
	);
	await t.close();
}

async function buocDaDung() {
	nhom = "E17 buoc 6";
	const a = await moTrang("quanTri", DO.rong, "/settings/okr");
	await coMat(a, `[data-mau='${K.mau}']`, "E17: danh sach co mau moi");
	const { man } = await soDaDung(a, "E17 sau tao tu mau");
	const moi = man.find((x) => x.id === K.mau);
	kiem(
		`E17: mau moi ghi «${dien(CHU.mau.dong.daDung, { n: 1 })}» (thay «${moi?.moTa}»)`,
		moi?.moTa?.endsWith(dien(CHU.mau.dong.daDung, { n: 1 })) === true,
	);
	await a.close();
}

async function nhomE16() {
	nhom = "E16/E17 buoc 1-2";
	const a = await moTrang("quanTri", DO.rong, "/settings/okr");
	await buocDanhSachMau(a);
	await buocSheetMau(a);
	await a.close();
	await kiemMauMoiDb();
	await buocMauThanhVien();
	if (!K.mau) {
		hong.push("E16: khong co mau moi de di tiep buoc 4-6");
		return;
	}
	await buocTuMau();
	await buocMauNgoai();
	await buocDaDung();
}

async function donOkr(mt, kr) {
	await db.okrGhiNhanNhan.deleteMany({
		where: { ghiNhan: { objectiveId: { in: mt } } },
	});
	await db.okrGhiNhan.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrBangChung.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrViecKr.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrMucTieuTuMau.deleteMany({
		where: { OR: [{ objectiveId: { in: mt } }, { mauId: { in: G.mau } }] },
	});
	await db.okrMau.deleteMany({ where: { id: { in: G.mau } } });
	await db.okrCheckIn.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrSoChup.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrDiemKr.deleteMany({
		where: { OR: [{ keyResultId: { in: kr } }, { cycleId: { in: G.ky } }] },
	});
	await db.okrDoiDich.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrNguonKr.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ objectiveId: { in: mt } },
				{ keyResultId: { in: kr } },
				{ cycleId: { in: G.ky } },
			],
		},
	});
	await db.okrMention.deleteMany({
		where: { comment: { objectiveId: { in: mt } } },
	});
	await db.okrComment.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrFollow.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrAlignment.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrNhinLai.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrDeXuat.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrKeyResult.deleteMany({ where: { id: { in: kr } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: mt } } });
	await db.okrCuaSoRa.deleteMany({ where: { cycleId: { in: G.ky } } });
	await db.okrTomTat.deleteMany({ where: { cycleId: { in: G.ky } } });
	await db.okrCycle.deleteMany({
		where: { id: { in: G.ky }, parentId: { not: null } },
	});
	await db.okrCycle.deleteMany({ where: { id: { in: G.ky } } });
}

async function donDep() {
	const nguon = await db.okrMucTieuTuMau.findMany({
		where: { mauId: { in: G.mau } },
		select: { objectiveId: true },
	});
	const mt = [...new Set([...G.mt, ...nguon.map((n) => n.objectiveId)])];
	const krMt = await db.okrKeyResult.findMany({
		where: { objectiveId: { in: mt } },
		select: { id: true },
	});
	await donOkr(mt, [...new Set([...G.kr, ...krMt.map((k) => k.id)])]);
	await db.onboardingStep.deleteMany({ where: { planId: { in: G.plan } } });
	await db.onboardingPlan.deleteMany({ where: { id: { in: G.plan } } });
	await db.onboardingTemplate.deleteMany({ where: { id: { in: G.khuon } } });
	await db.company.deleteMany({ where: { id: { in: G.congTy } } });
	const xoa = spawnSync("bun", ["scripts/okr-mau.ts", "--xoa"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	const dong = `${xoa.stdout ?? ""}${xoa.stderr ?? ""}`
		.trim()
		.split("\n")
		.at(-1);
	console.log(`  don dep: xoa bo OKR mau ma ${xoa.status} — ${dong}`);
	if (xoa.status !== 0)
		hong.push(`don dep: okr:mau --xoa thoat ${xoa.status}: ${dong}`);
	const con = await db.okrCycle.count();
	if (con > 0) hong.push(`don dep: con ${con} chu ky trong kho`);
}

function chepBangChung() {
	if (process.env.CHIEU_DO || hong.length > 0 || anh.length === 0) return;
	const trangThai =
		/^status:\s*(\S+)/m.exec(readFileSync(HOP_DONG, "utf8"))?.[1] ?? "";
	if (DA_THONG_CONG.has(trangThai)) {
		console.log(
			`  xanh: ho so ${trangThai}, khong chep anh sang ${relative(GOC, DICH)}/ — bang chung da ky chi doi qua dong revisit`,
		);
		return;
	}
	mkdirSync(DICH, { recursive: true });
	for (const a of anh) copyFileSync(join(TAM, a), join(DICH, a));
	console.log(`  xanh: da chep ${anh.length} anh sang ${relative(GOC, DICH)}/`);
}

trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);

let ma = 0;
const bat = Date.now();
try {
	await napBoMau();
	await vaoNguoi();
	slug = await suySlugCua(cookie.quanTri);
	await gieoCanhKr();
	if (chon("E11")) await gieoKyChamDiem();
	for (const [nhomChay, fn] of [
		["E11", nhomE11],
		["E14", nhomE14],
		["E16", nhomE16],
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
	await donDep().catch((e) => hong.push(`don dep: ${String(e).slice(0, 400)}`));
	writeFileSync(join(TAM, "man-canh-kr-network.txt"), mang.join("\n"));
	console.log(
		`man-canh-kr: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh (${anh.join(", ")}), ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	console.log(`  anh o ${relative(GOC, TAM)}/`);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
	chepBangChung();
}
await ket(ma);
