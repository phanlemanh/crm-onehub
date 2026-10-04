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
const HO_SO = "dot-hoi-y-tuong-okr";
const TAM =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "man");
const DICH = join(GOC, "_acceptance", HO_SO, "evidence", "man");
const HOP_DONG = join(GOC, "_acceptance", HO_SO, "contract.md");
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const NHOM = { E12: "E12", E13: "E12", E15: "E15", E16: "E15" };
const MOI_EVAL = Object.keys(NHOM);
const LENH_DO =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dot-hoi-y-tuong-okr/rang/man-hoi-y.mjs"';

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

const TEP_CHIEU = "apps/api/src/okr/hoi-y.ts";
const TEP_GOP = "apps/app/app/(app)/[slug]/okr/hoi-y/khoi-gop.tsx";
const TEP_KET_LUAN = "apps/app/app/(app)/[slug]/okr/hoi-y/khoi-ket-luan.tsx";
const TEP_DONG_NGHIEP =
	"apps/app/app/(app)/[slug]/okr/hoi-y/khoi-y-dong-nghiep.tsx";
const TEP_CONG_BO = "apps/api/src/okr/okr-hoi-y.service.ts";
const TEP_THANH_LUU = "packages/ui/src/components/save-bar.tsx";
const VET = {
	"E12-ten": {
		eval: "E12",
		tep: TEP_CHIEU,
		mo: "ban sao chieu y tra ten nguoi gop cho moi vai (man in ten)",
		cam: (s) =>
			s.replace(
				"\treturn (\n\t\t(xem.laNguoiChon && xem.laQuanTri && xem.daNiemPhong) ||\n\t\t(xem.laQuanTri && !xem.laNguoiChon)\n\t);\n",
				"\treturn true;\n",
			),
		ghim: /E12 buoc-gop: ten lo «[^»]+»/,
	},
	"E12-cot": {
		eval: "E12",
		tep: TEP_GOP,
		mo: "ban sao dat the con so xep doc mot cot truoc o soan",
		cam: (s) =>
			s
				.replace(
					'<StatGroup aria-label={m.conSo} data-khoi="the-con-so" role="group">',
					'<div aria-label={m.conSo} className="flex flex-col gap-3" data-khoi="the-con-so" role="group">',
				)
				.replace("</StatGroup>", "</div>")
				.replace(
					'className="flex flex-col gap-3 max-sm:order-1" data-khoi="loi-mo"',
					'className="flex flex-col gap-3" data-khoi="loi-mo"',
				),
		ghim: /E12 buoc-man-dau: mep tren o soan \d+px/,
	},
	"E12-bat": {
		eval: "E12",
		tep: TEP_DONG_NGHIEP,
		mo: "ban sao «Toi cung nghi vay» dung lai bien the vien (bat chi doi vien, khong nen, khong dau tich)",
		cam: (s) => s.replace('variant="outline-check"', 'variant="outline"'),
		ghim: /E12 buoc 6: nut da bat khong khac nut chua bat/,
	},
	E13: {
		eval: "E12",
		tep: TEP_GOP,
		mo: "ban sao o soan gui «Vi sao» vao «Do bang gi»",
		cam: (s) =>
			s.replace(
				"\t\t\tviSao: gia.viSao.trim(),\n\t\t\tdoBangGi: gia.doBangGi.trim(),\n\t\t});\n\t};",
				"\t\t\tviSao: gia.viSao.trim(),\n\t\t\tdoBangGi: gia.viSao.trim(),\n\t\t});\n\t};",
			),
		ghim: /E13: DB doBangGi «[^»]*» khac chuoi da go «[^»]+»/,
	},
	E15: {
		eval: "E15",
		tep: TEP_CHIEU,
		mo: "ban sao may chu tra y cho nguoi chon chua niem phong",
		cam: (s) =>
			s.replace(
				"\tif (xem.laNguoiChon && !xem.daNiemPhong) return { khoa: true, y: [] };\n",
				"",
			),
		ghim: /E15 buoc-khoa-nguoi-chon: nguoi chon chua niem phong thay [1-9]\d* y/,
	},
	E16: {
		eval: "E15",
		tep: TEP_KET_LUAN,
		mo: "ban sao ket luan gui ly do cat 12 ky tu (thanh «Vi sao luc nay» khi cong bo)",
		cam: (s) =>
			s.replace(
				"lyDo: nhap.lyDo.trim(),",
				"lyDo: nhap.lyDo.trim().slice(0, 12),",
			),
		ghim: /E16: whyNow «[^»]*» khac ly do da go «[^»]+»/,
	},
	"B2-ve": {
		eval: "E15",
		tep: TEP_THANH_LUU,
		mo: "ban sao danh sach dieu thieu van bam trung duoc nhung khong ve ra (nhu lan trong o 1440)",
		cam: (s) =>
			s.replace(
				'"max-h-24 w-full overflow-y-auto overscroll-contain md:max-h-40",',
				'"max-h-24 w-full overflow-y-auto overscroll-contain opacity-0 md:max-h-40",',
			),
		ghim: /B2 \(1440\): lien ket dieu thieu dau tien duoc ve ra anh/,
	},
	"E16-cong-bo": {
		eval: "E15",
		tep: TEP_CONG_BO,
		mo: "ban sao cong bo (may chu) dat whyNow bang ly do cat 12 ky tu",
		cam: (s) => s.replace("whyNow: c.lyDo,", "whyNow: c.lyDo.slice(0, 12),"),
		ghim: /E16: whyNow «[^»]*» khac ly do da go «[^»]+»/,
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
	const tam = mkdtempSync(join(tmpdir(), "hoi-y-chieu-do-"));
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
		execFileSync("bun", ["run", "db:generate"], {
			cwd: join(sao, "packages", "db"),
			stdio: "ignore",
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
		moiTruong.PHIEN_DO_TEN_CAY = "hoi-y-chieu-do";
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
	const danhSach =
		CHON.size === 0 ? MOI_VET : [...CHON].map((e) => VET_HOA.get(e));
	const ket = [];
	for (const e of danhSach) ket.push(await motChieuDo(e));
	console.log("\nchieu do — tong ket:");
	for (const k of ket) console.log(`  ${k.e}: ${k.ket} — ${k.cau}`);
	if (ket.some((k) => k.ket === "KHONG DO DUOC")) process.exit(2);
	process.exit(ket.every((k) => k.ket === "DO DUNG GHIM") ? 1 : 0);
}

if (laChieuDo) await chieuDo();

const { default: puppeteer } = await import("puppeteer-core");
const { db } = await import("../../../packages/db/src/index.ts");
const { okrHoiYMessages } = await import(
	"../../../apps/app/lib/messages/okr-hoi-y.ts"
);
const { okrMessages } = await import("../../../apps/app/lib/messages/okr.ts");
const { parseSoLieuHoiY } = await import(
	"../../../packages/validation/src/okr-hoi-y.ts"
);
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const { API, APP, CHO_TAI, CHROME, chiaCookie, datTrinhDuyet, ket, khongDo } =
	await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");

const GIO_MS = 60 * 60 * 1000;
const PHUT_MS = 60 * 1000;
const DO = {
	rong: 1440,
	hep: 390,
	cao: { 1440: 900, 390: 812 },
	choMs: 30_000,
	choHydrateMs: 800,
	choKhongHienMs: 1500,
	choGhiMs: 1500,
	choMoHopMs: 5000,
	lanMoHop: 3,
	treMs: 6000,
	hanSauPhut: 48 * 60 + 10,
	gioConToiThieu: 40,
	gioConToiDa: 49,
	soYGieoSan: 12,
	hienTruoc: 10,
	motHangPx: 4,
	dongLoiMo: 3,
	mauToiThieu: 8,
};
const MA = `h${Date.now().toString(36).slice(-6)}`;
const LOI_BO_QUA = /Download the React DevTools/;
const LOI_NGOAI = /Hydration failed[\s\S]*AppIconRailFallback/;
const CHU = okrHoiYMessages("vi");
const CHU_OKR = okrMessages("vi");
const TIEN_TO_MAU = "mau-okr-";
const MIEN_MAU = "mau.onehub.test";
const idMau = (loai, ma) => `${TIEN_TO_MAU}${loai}-${ma}`;
const dien = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const demSo = (mot, nhieu, n) => dien(n === 1 ? mot : nhieu, { n });
const NAM_KE = idMau("chu-ky", "nam-ke");
const QUY4 = idMau("chu-ky", "quy4");
const TEN_KY = { nam: "Năm · mẫu", namKe: "Năm kế · mẫu", quy3: "Quý 3 · mẫu" };
const QUAN_TRI = "le-hai-dang";
const gon = (s) => (s ?? "").replace(/\s+/g, " ").trim();

const GO = {
	loiMo: `Năm nay mình giữ được khách cũ nhưng khách mới về chậm hơn hẳn, nhất là ở các tuyến lạnh và miền Trung. Trước khi đặt mục tiêu năm kế, mình muốn nghe mỗi người: nếu được quyết, bạn dồn sức vào đâu và đo bằng gì. Ý nào cũng được đọc, không ai thấy tên bạn ngoài người chọn và quản trị. Mỗi người góp tối đa ba ý, gõ như đang nói với cả công ty ${MA}.`,
	soLieu: [
		{
			nhan: "Doanh thu năm",
			giaTri: "186 tỷ",
			ghiChu: "+12% so với quý trước",
		},
		{ nhan: "Khách quay lại", giaTri: "64%", ghiChu: "-3% so với quý trước" },
		{ nhan: "Khách mới", giaTri: "41", ghiChu: "+5 so với quý trước" },
	],
	y: {
		noiDung: `Bán gói giao lạnh theo quý cho chuỗi nhà thuốc ${MA}`,
		viSao:
			"Ba chuỗi đã hỏi giá cố định và xe lạnh nội thành còn trống buổi chiều",
		doBangGi: "Số hợp đồng gói lạnh ký trong quý đầu",
	},
	lyDoChon: `Chọn vì giữ khách cũ là thứ nhiều người nêu nhất ở đủ ba khối, và mỗi ý trong chủ đề đều chỉ ra một việc làm được ngay: gọi lại khách đã ngừng đặt, gắn người phụ trách cố định, gửi bản tin số liệu hằng tháng. Bản viết trước đã có câu này và sau khi đọc ý, mình giữ nguyên chữ vì các ý chỉ làm rõ cách làm chứ không đổi đích. Đo bằng tỉ lệ khách quay lại mỗi quý ${MA}.`,
	lyDoMoi: `Nhiều người ở kho và vận hành cùng nêu việc nhỏ làm chậm cả tuyến; chưa có trong bản viết trước nên thêm mới ${MA}.`,
	cauMoi: `Bớt việc tay ở kho và điều phối ${MA}`,
	lyDoDeSau: `Báo giá nhanh cần bảng giá tuyến ổn định trước; để sang kỳ sau khi bảng giá đã chốt ${MA}.`,
	lyDoKhongLam: `Chỗ nghỉ cho tài xế đối tác không nằm trong việc của năm tới; không làm lần này ${MA}.`,
	tenChuDeMoi: `Vận hành kho gọn hơn ${MA}`,
};

console.log(
	CHON.size === 0
		? `man-hoi-y: chay tron (E12/E13, E15/E16); chay rieng: EVAL=E15 hoac --chi E12; chieu do: --chieu-do (ma: ${MOI_VET.join(", ")})`
		: `man-hoi-y: chi chay ${[...CHON].join(", ")}${process.env.CHIEU_DO ? ` (ban sao chieu do ${process.env.CHIEU_DO})` : ""}`,
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
const G = { ky: [], batDau: new Date() };

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

function chayBoMau(doiSo) {
	const r = spawnSync("bun", ["scripts/okr-mau.ts", ...doiSo], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	return {
		ma: r.status,
		dong: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").at(-1),
	};
}

async function napBoMau() {
	const truoc = await db.okrCycle.count();
	if (truoc > 0)
		await khongDo(
			`KHONG DO DUOC: kho do da co ${truoc} chu ky OKR truoc khi nap bo mau — can kho sach`,
		);
	const nap = chayBoMau([]);
	console.log(`  nap bo OKR mau: ma ${nap.ma} — ${nap.dong}`);
	if (nap.ma !== 0)
		await khongDo(`KHONG DO DUOC: nap bo OKR mau thoat ${nap.ma}: ${nap.dong}`);
	const namKe = await db.okrCycle.findUnique({
		where: { id: NAM_KE },
		select: { phase: true },
	});
	if (namKe?.phase !== "lap-ke-hoach")
		await khongDo(
			`KHONG DO DUOC: bo mau khong co chu ky nam ke o lap-ke-hoach (thay ${namKe?.phase ?? "khong co"})`,
		);
	G.batDau = new Date();
}

async function nguoiMau(khoa, ma, dangNhap = true) {
	const u = await db.user.findUnique({
		where: { email: `${ma}@${MIEN_MAU}` },
		select: { id: true, name: true },
	});
	if (!u)
		await khongDo(`KHONG DO DUOC: bo mau khong co nguoi ${ma}@${MIEN_MAU}`);
	id[khoa] = u.id;
	ten[khoa] = u.name;
	if (dangNhap) cookie[khoa] = phienCua(`${ma}@${MIEN_MAU}`);
	return u;
}

const maCua = async (userId) =>
	(
		await db.user.findUnique({ where: { id: userId }, select: { email: true } })
	)?.email.split("@")[0] ?? "";

const LOAI_KHONG_CHU = new Set(["Font", "Image", "Media"]);

function mayGhi(tenMay) {
	return { ten: tenMay, phan: [], hong: 0, dang: 0, loiDoc: [] };
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
			maHttp: e.response.status,
			kieu: e.response.mimeType,
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
				may.loiDoc.push({ ...r, cau: String(loi?.message ?? loi) });
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
	await trang.setViewport({ width: rong, height: DO.cao[rong] });
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

const duongHoiY = (ky) => `/okr/hoi-y${ky ? `?kyOkr=${ky}` : ""}`;

async function moTrang(khoa, rong, duong, tuy = {}) {
	const trang = await trangMoi(khoa, rong, tuy);
	await diToi(trang, `${APP}/${slug}${duong}`);
	return trang;
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
const trangThai = (trang) =>
	trang.evaluate(
		() =>
			window.__tim("[data-trang-thai]")[0]?.getAttribute("data-trang-thai") ??
			null,
	);
const choTrangThai = (trang, tt, nhan) =>
	doi(
		trang,
		`${nhan}: trang o trang thai ${tt}`,
		(t) =>
			window
				.__tim("[data-trang-thai]")
				.some((e) => e.getAttribute("data-trang-thai") === t),
		tt,
	);

async function bamEl(tay, nhan) {
	const el = tay.asElement();
	if (!el) return kiem(`${nhom}: khong thay ${nhan} de bam`, false);
	await el
		.evaluate((e) => e.scrollIntoView({ block: "center", inline: "nearest" }))
		.catch(() => null);
	await cho(150);
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

async function datGiaTri(trang, sel, gia) {
	return trang.evaluate(
		(s, g) => {
			const el = window.__tim(s)[0];
			if (!el) return false;
			const dat = Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				"value",
			).set;
			dat.call(el, g);
			el.dispatchEvent(new Event("input", { bubbles: true }));
			el.dispatchEvent(new Event("change", { bubbles: true }));
			return true;
		},
		sel,
		gia,
	);
}

async function moHopTay(trang, tay, nhan) {
	for (let lan = 0; lan < DO.lanMoHop; lan += 1) {
		if (!(await bamEl(tay, nhan))) return false;
		const mo = await trang
			.waitForFunction(() => window.__tim("[role='option']").length > 0, {
				timeout: DO.choMoHopMs,
				polling: 200,
			})
			.then(() => true)
			.catch(() => false);
		if (mo) return true;
	}
	return kiem(`${nhom}: hop chon ${nhan} khong mo`, false);
}

async function chonTrong(trang, tay, nhan, tenMuc) {
	if (!(await moHopTay(trang, tay, nhan))) return false;
	const muc = await trang.evaluateHandle(
		(c) =>
			window
				.__tim("[role='option']")
				.find((o) => o.innerText.replace(/\s+/g, " ").trim().startsWith(c)) ??
			null,
		tenMuc,
	);
	if (!muc.asElement()) {
		const co = await trang.evaluate(() =>
			window.__tim("[role='option']").map((o) => o.innerText.trim()),
		);
		await trang.keyboard.press("Escape");
		return kiem(
			`${nhom}: khong co lua chon «${tenMuc}» o ${nhan} (co ${JSON.stringify(co)})`,
			false,
		);
	}
	await bamEl(muc, `lua chon ${tenMuc}`);
	await cho(300);
	return true;
}

const chonHop = async (trang, sel, tenMuc) =>
	chonTrong(
		trang,
		await trang.evaluateHandle((s) => window.__tim(s)[0] ?? null, sel),
		sel,
		tenMuc,
	);

async function tayTheoNhan(trang, khung, nhanChu) {
	return trang.evaluateHandle(
		(k, c) => {
			const nhan = window
				.__tim(`${k} label`)
				.find((l) => l.innerText.replace(/\s+/g, " ").trim() === c);
			const idO = nhan?.getAttribute("for");
			return idO ? document.getElementById(idO) : null;
		},
		khung,
		nhanChu,
	);
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
	await trang.setViewport({ width: rong, height: DO.cao[rong] });
	await cho(DO.choKhongHienMs);
}

const cuonToi = (trang, sel) =>
	trang.evaluate((s) => {
		window.__tim(s)[0]?.scrollIntoView({ block: "start" });
	}, sel);

const huyHieuTab = (trang) =>
	trang.evaluate(
		() =>
			window
				.__tim("[data-khung-tab] a[href*='/okr/hoi-y'] [data-slot='badge']")[0]
				?.innerText.trim() ?? null,
	);

async function xoaHoiYTren(cycleIds) {
	const hoiY = await db.okrHoiY.findMany({
		where: { cycleId: { in: cycleIds } },
		select: { id: true },
	});
	const ids = hoiY.map((h) => h.id);
	const mt = (
		await db.okrChuDe.findMany({
			where: { hoiYId: { in: ids }, objectiveId: { not: null } },
			select: { objectiveId: true },
		})
	).map((c) => c.objectiveId);
	await db.okrHoiYHieu.deleteMany({ where: { hoiYId: { in: ids } } });
	await db.okrY.deleteMany({ where: { hoiYId: { in: ids } } });
	await db.okrChuDe.deleteMany({ where: { hoiYId: { in: ids } } });
	await db.okrHoiYBanTruoc.deleteMany({ where: { hoiYId: { in: ids } } });
	await db.okrHoiY.deleteMany({ where: { id: { in: ids } } });
	return { hoiY: ids.length, mt };
}

async function donOkr(mt) {
	const kr = (
		await db.okrKeyResult.findMany({
			where: { objectiveId: { in: mt } },
			select: { id: true },
		})
	).map((k) => k.id);
	await db.okrCheckIn.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrDiemKr.deleteMany({ where: { keyResultId: { in: kr } } });
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ objectiveId: { in: mt } },
				{ keyResultId: { in: kr } },
				{ cycleId: { in: G.ky } },
			],
		},
	});
	await db.okrFollow.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrAlignment.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrKeyResult.deleteMany({ where: { id: { in: kr } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: mt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: mt } } });
	await db.okrCycle.deleteMany({ where: { id: { in: G.ky } } });
}

async function donDep() {
	const { mt } = await xoaHoiYTren([NAM_KE, ...G.ky]);
	const moi = (
		await db.okrObjective.findMany({
			where: {
				cycleId: { in: [NAM_KE, ...G.ky] },
				id: { not: { startsWith: TIEN_TO_MAU } },
			},
			select: { id: true },
		})
	).map((o) => o.id);
	await donOkr([...new Set([...mt, ...moi])]);
	G.ky = [];
	const xoa = chayBoMau(["--xoa"]);
	console.log(`  don dep: xoa bo OKR mau ma ${xoa.ma} — ${xoa.dong}`);
	if (xoa.ma !== 0)
		hong.push(`don dep: okr:mau --xoa thoat ${xoa.ma}: ${xoa.dong}`);
	const con = await db.okrCycle.count();
	if (con > 0) hong.push(`don dep: con ${con} chu ky trong kho`);
	for (const k of ngu.values()) await k.close().catch(() => {});
	ngu.clear();
}

function gioVN(d) {
	const phan = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Ho_Chi_Minh",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(d);
	const lay = (l) => phan.find((p) => p.type === l)?.value ?? "";
	return `${lay("hour")}:${lay("minute")}`;
}

const ngayVN = (d) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);

async function kiemTheoTen(trang, khung, ds, nhan) {
	const chu = await chuSel(trang, khung);
	const lo = ds.filter((n) => n && chu.includes(n));
	const tacGia = await trang.evaluate(
		(k) => window.__tim(`${k} [data-tac-gia]`).map((e) => e.innerText.trim()),
		khung,
	);
	for (const t of [...lo, ...tacGia]) console.log(`  ${nhan}: ten lo «${t}»`);
	return kiem(
		`${nhan}: y nguoi khac khong kem ten (lo ${JSON.stringify([...lo, ...tacGia])})`,
		lo.length === 0 && tacGia.length === 0,
	);
}

async function nhomE12() {
	nhom = "E12 tien de";
	await napBoMau();
	await nguoiMau("quanTri", QUAN_TRI);
	slug = await suySlugCua(cookie.quanTri);
	const bo = await xoaHoiYTren([NAM_KE]);
	console.log(
		`  E12: xoa ${bo.hoiY} lan hoi y mau cua chu ky nam ke de chu ky trong`,
	);
	const thanhVien = await db.member.findMany({
		where: { role: "member", user: { email: { endsWith: `@${MIEN_MAU}` } } },
		select: { userId: true, user: { select: { email: true } } },
		orderBy: { user: { email: "asc" } },
	});
	const xep = new Map(
		(
			await db.orgPlacement.findMany({
				where: { userId: { in: thanhVien.map((t) => t.userId) } },
				select: { userId: true, primaryDepartmentId: true },
			})
		).map((p) => [p.userId, p.primaryDepartmentId]),
	);
	const coXep = thanhVien.filter((t) => xep.get(t.userId));
	if (coXep.length < 2 + DO.soYGieoSan)
		await khongDo(
			`KHONG DO DUOC: bo mau chi co ${coXep.length} thanh vien thuong co phong ban`,
		);
	await nguoiMau("A", coXep[0].user.email.split("@")[0]);
	await nguoiMau("B", coXep[1].user.email.split("@")[0]);
	const gieoSan = coXep.slice(2, 2 + DO.soYGieoSan);
	const namKe = await db.okrCycle.findUniqueOrThrow({
		where: { id: NAM_KE },
		select: { name: true },
	});
	console.log(
		`  nguoi: quan tri ${ten.quanTri}, thanh vien A ${ten.A} (phong ban ${xep.get(id.A)}), thanh vien B ${ten.B}, ${gieoSan.length} nguoi gieo y qua API`,
	);

	nhom = "E12 buoc 3";
	const a = await moTrang("quanTri", DO.rong, duongHoiY(null));
	await doi(a, "E12 buoc 3: trang hoi y tai xong", () => {
		const t = window
			.__tim("[data-trang-thai]")[0]
			?.getAttribute("data-trang-thai");
		return t && t !== "dang-tai";
	});
	await chonHop(a, "[data-chon-chu-ky]", TEN_KY.namKe);
	await choTrangThai(a, "trong-quan-tri", "E12 buoc 3");
	const trongQt = await a.evaluate(() => ({
		tieuDe:
			window
				.__tim("[data-khoi='trong-quan-tri'] [data-slot='empty-title']")[0]
				?.innerText.trim() ?? null,
		nut: window.__tim("[data-nut='mo-hoi-y']")[0]?.innerText.trim() ?? null,
	}));
	kiem(
		`E12 buoc 3: Empty «${CHU.trong.quanTri}» co nut «${CHU.trong.mo}» (thay ${JSON.stringify(trongQt)})`,
		trongQt.tieuDe === CHU.trong.quanTri && trongQt.nut === CHU.trong.mo,
	);
	await chup(a, "buoc-trong-quan-tri.png");

	nhom = "E12 buoc 4";
	const SHEET = "[data-khoi='sheet-mo-hoi-y']";
	await bam(a, "[data-nut='mo-hoi-y']");
	await coMat(a, SHEET, "E12 buoc 4: sheet Mo hoi y");
	await cho(DO.choKhongHienMs);
	const urlMo = new URL(a.url()).searchParams.get("moHoiY");
	kiem(`E12 buoc 4: URL mang trang thai mo (moHoiY=${urlMo})`, urlMo === "mo");
	const cauHoi = await a.evaluate(
		(k) => window.__tim(`${k} textarea`)[0]?.value ?? null,
		SHEET,
	);
	const cauHoiMong = dien(CHU.sheet.cauHoiMacDinh, { ky: namKe.name });
	kiem(
		`E12 buoc 4: cau hoi dien san «${cauHoiMong}» (thay «${cauHoi}»)`,
		cauHoi === cauHoiMong,
	);
	const oDong = (n) => `${SHEET} [data-dong='${n}'] input`;
	await go(a, oDong(1), "x");
	await a.keyboard.press("Backspace");
	await cho(300);
	const loiNhan = dien(CHU.sheet.loiNhan, { n: 1, tu: 2, den: 60 });
	const loiDuoiO = await chuSel(
		a,
		`${SHEET} [data-dong='1'] [data-slot='field-error']`,
	);
	const nutMo = `${SHEET} button[type='submit']`;
	kiem(
		`E12 buoc 4: xoa nhan dong 1 -> loi «${loiNhan}» duoi o (thay «${loiDuoiO}»), «Mở» tat`,
		loiDuoiO === loiNhan && (await nutTat(a, nutMo)) === true,
	);
	const loiMoO = await a.evaluateHandle(
		(k) => window.__tim(`${k} textarea`)[1] ?? null,
		SHEET,
	);
	if (loiMoO.asElement()) {
		await loiMoO.asElement().focus();
		await loiMoO.asElement().type(GO.loiMo);
	} else kiem("E12 buoc 4: khong thay o loi mo", false);
	for (let i = 1; i < GO.soLieu.length; i += 1)
		await bamChu(a, `${SHEET} button`, CHU.sheet.themDong);
	for (const [i, s] of GO.soLieu.entries()) {
		const o = await a.evaluateHandle((sel) => window.__tim(sel), oDong(i + 1));
		const ds = await o.getProperties();
		const tay = [...ds.values()].map((h) => h.asElement()).filter(Boolean);
		if (tay.length < 3) {
			kiem(`E12 buoc 4: dong ${i + 1} khong du ba o`, false);
			continue;
		}
		for (const [k, gia] of [s.nhan, s.giaTri, s.ghiChu].entries()) {
			await tay[k].click({ clickCount: 3 });
			await a.keyboard.press("Backspace");
			await tay[k].type(gia);
		}
	}
	const han = new Date(Date.now() + DO.hanSauPhut * PHUT_MS);
	const ngayMacDinh = ngayVN(new Date(Date.now() + 2 * 24 * GIO_MS));
	if (ngayVN(han) !== ngayMacDinh)
		console.log(
			`  E12 buoc 4: gio hien tai gan nua dem — han ${ngayVN(han)} khac ngay mac dinh ${ngayMacDinh}, giu ngay mac dinh`,
		);
	await datGiaTri(a, `${SHEET} input[type='time']`, gioVN(han));
	const nutChon = await tayTheoNhan(a, SHEET, CHU.sheet.nguoiChon);
	await chonTrong(a, nutChon, "o nguoi chon", ten.quanTri);
	await doi(
		a,
		"E12 buoc 4: «Mở» bat khi du hop le",
		(s) => window.__tim(s)[0]?.disabled === false,
		nutMo,
	);
	await bam(a, nutMo);
	await doi(
		a,
		"E12 buoc 4: bam Mo -> sheet dong, URL het moHoiY",
		(k) =>
			window.__tim(k).length === 0 &&
			!new URL(location.href).searchParams.has("moHoiY"),
		SHEET,
	);
	await choTrangThai(a, "viet-truoc", "E12 buoc 4 (quan tri la nguoi chon)");
	const loiMay = await chuSel(a, "[data-khoi='loi-may']");
	if (loiMay) console.log(`  E12 buoc 4: may chu tu choi: ${loiMay}`);
	const hoiY = await db.okrHoiY.findMany({
		where: { cycleId: NAM_KE },
		select: {
			id: true,
			loiMo: true,
			soLieu: true,
			nguoiChonUserId: true,
			hanLuc: true,
			createdAt: true,
		},
	});
	console.log(
		`  E13 DB okrHoiY tren nam ke: ${JSON.stringify(hoiY.map((h) => ({ ...h, loiMo: `${h.loiMo.slice(0, 40)}…` })))}`,
	);
	kiem(
		`E13: dung mot okrHoiY tren chu ky nam ke (thay ${hoiY.length})`,
		hoiY.length === 1,
	);
	const h = hoiY[0];
	kiem("E13: loiMo trong DB bang chuoi da go", h?.loiMo === GO.loiMo);
	kiem(
		`E13: soLieu toEqual chuoi da go (DB ${JSON.stringify(h?.soLieu)})`,
		JSON.stringify(h ? parseSoLieuHoiY(h.soLieu) : null) ===
			JSON.stringify(GO.soLieu),
	);
	kiem(
		`E13: nguoiChonUserId la quan tri mau (${h?.nguoiChonUserId} / ${id.quanTri})`,
		h?.nguoiChonUserId === id.quanTri,
	);
	const soGio = h ? Math.floor((h.hanLuc.getTime() - Date.now()) / GIO_MS) : -1;
	const dongPha = await chuSel(a, "[data-dong-pha]");
	console.log(`  E12 buoc-mo: dong pha «${dongPha}»`);
	kiem(
		`E12 buoc 4: dong pha «Còn 4x giờ» (thay «${dongPha}», tinh tu DB ${soGio})`,
		/^Còn (4\d) giờ tới hạn/.test(dongPha),
	);
	const moDau = await a.evaluate(() => ({
		loiMo:
			window.__tim("[data-khoi='loi-mo'] [translate='no']")[0]?.textContent ??
			"",
		the: window.__tim("[data-khoi='the-con-so'] [data-slot='stat-card']")
			.length,
	}));
	kiem(
		`E12 buoc 4: trang hien loi mo va ${GO.soLieu.length} the con so (thay ${JSON.stringify({ ...moDau, loiMo: moDau.loiMo.slice(0, 30) })})`,
		gon(moDau.loiMo) === gon(GO.loiMo) && moDau.the === GO.soLieu.length,
	);
	await chup(a, "buoc-mo.png");
	await kho(a, DO.hep);
	await chup(a, "buoc-mo-390.png");
	await a.close();
	if (!h) return;

	nhom = "E12 gieo";
	const tenGieo = [];
	for (const [i, g] of gieoSan.entries()) {
		const c = phienCua(g.user.email);
		await lam(c, "okr.gopY", {
			hoiYId: h.id,
			noiDung: `Ý gieo sẵn số ${i + 1} của đồng nghiệp ${MA}`,
			viSao: "",
			doBangGi: "",
		});
		tenGieo.push(
			(
				await db.user.findUnique({
					where: { id: g.userId },
					select: { name: true },
				})
			)?.name ?? "",
		);
	}
	console.log(`  E12: gieo ${gieoSan.length} y cua nguoi khac qua okr.gopY`);

	nhom = "E12 buoc 5";
	const t = await moTrang("A", DO.hep, duongHoiY(NAM_KE));
	await choTrangThai(t, "gop", "E12 buoc 5");
	await doi(
		t,
		`E12 buoc 5: tab Hoi y mang huy hieu «${CHU_OKR.nhanHoiYMoi}»`,
		(c) =>
			window
				.__tim("[data-khung-tab] a[href*='/okr/hoi-y'] [data-slot='badge']")[0]
				?.innerText.trim() === c,
		CHU_OKR.nhanHoiYMoi,
	);
	await t.evaluate(() => {
		const k = document.querySelector("[data-slot='page-shell-scroll']");
		if (k) k.scrollTop = 0;
		window.scrollTo(0, 0);
	});
	await cho(400);
	const dau = await t.evaluate(() => {
		const moc = window.__tim("[data-khoi='dai-moc'] [data-moc]").map((e) => ({
			moc: e.getAttribute("data-moc"),
			tt: e.getAttribute("data-tinh-trang"),
			hienTai: e.getAttribute("aria-current"),
			top: Math.round(e.getBoundingClientRect().top),
			ngay:
				e.querySelector("[data-slot='timeline-date']")?.innerText.trim() ?? "",
			bayGio: e.querySelector("[data-slot='badge']")?.innerText.trim() ?? null,
		}));
		const the = window
			.__tim("[data-khoi='the-con-so'] [data-slot='stat-card']")
			.map((e) => e.innerText.replace(/\s+/g, " ").trim());
		const clamp = window.__tim("[data-khoi='loi-mo'] p.line-clamp-3")[0];
		const oSoan = window.__tim("[data-khoi='o-soan'] textarea")[0];
		const gui = window.__tim("[data-khoi='o-soan'] button[type='submit']")[0];
		const tab = window.__tim("[data-khung-tab] a[aria-current='page']")[0];
		const r = tab?.getBoundingClientRect();
		return {
			moc,
			the,
			clamp: clamp
				? {
						cao: clamp.clientHeight,
						cuon: clamp.scrollHeight,
						dong: Math.round(
							clamp.clientHeight /
								Number.parseFloat(getComputedStyle(clamp).lineHeight),
						),
						translate: clamp.getAttribute("translate"),
					}
				: null,
			oSoanTop: oSoan ? Math.round(oSoan.getBoundingClientRect().top) : null,
			guiDay: gui ? Math.round(gui.getBoundingClientRect().bottom) : null,
			tab: r ? { trai: r.left, phai: r.right } : null,
			rong: window.innerWidth,
		};
	});
	console.log(`  E12 buoc-man-dau: ${JSON.stringify(dau)}`);
	const tops = dau.moc.map((m) => m.top);
	kiem(
		`E12 buoc 5: dai pha bon moc Mo · Han · Gom · Cong bo tren mot hang (thay ${JSON.stringify(dau.moc.map((m) => [m.moc, m.top]))})`,
		JSON.stringify(dau.moc.map((m) => m.moc)) ===
			JSON.stringify(["mo", "han", "gom", "cong-bo"]) &&
			Math.max(...tops) - Math.min(...tops) <= DO.motHangPx,
	);
	kiem(
		`E12 buoc 5: moc Mo hien tai (aria-current=step) gan «${CHU.moc.bayGio}», ba moc sau chua toi`,
		dau.moc.length === 4 &&
			dau.moc[0]?.hienTai === "step" &&
			dau.moc[0]?.bayGio === CHU.moc.bayGio &&
			dau.moc.slice(1).every((m) => m.tt === "chua" && m.hienTai === null),
	);
	if (dau.moc[3]?.ngay === CHU.moc.chuaDinh)
		console.log(
			`  E12 bước 5: mốc Công bố chưa có ngày — chưa công bố (màn in «${CHU.moc.chuaDinh}»; ba mốc Mở, Hạn, Gom có ngày giờ)`,
		);
	kiem(
		`E12 buoc 5: moc Mo, Han, Gom co ngay gio; Cong bo «${CHU.moc.chuaDinh}» khi chua cong bo (thay ${JSON.stringify(dau.moc.map((m) => m.ngay))})`,
		dau.moc.length === 4 &&
			dau.moc
				.slice(0, 3)
				.every((m) => /^\d{1,2}\/\d{1,2} \d{2}:\d{2}$/.test(m.ngay)) &&
			(dau.moc[3]?.ngay === CHU.moc.chuaDinh ||
				/^\d{1,2}\/\d{1,2} \d{2}:\d{2}$/.test(dau.moc[3]?.ngay ?? "")),
	);
	kiem(
		`E12 buoc 5: the con so la StatCard co chenh lech (thay ${JSON.stringify(dau.the)})`,
		dau.the.length === GO.soLieu.length &&
			GO.soLieu.every((s, i) => dau.the[i]?.includes(s.ghiChu)),
	);
	kiem(
		`E12 buoc 5: loi mo gap ${DO.dongLoiMo} dong, translate=no (thay ${JSON.stringify(dau.clamp)})`,
		dau.clamp !== null &&
			dau.clamp.cuon > dau.clamp.cao + 1 &&
			dau.clamp.dong === DO.dongLoiMo &&
			dau.clamp.translate === "no",
	);
	if (dau.oSoanTop === null || dau.oSoanTop >= DO.cao[DO.hep])
		console.log(
			`  E12 buoc-man-dau: mep tren o soan ${dau.oSoanTop ?? "-1"}px`,
		);
	kiem(
		`E12 buoc 5: mep tren o «${CHU.gop.y}» ${dau.oSoanTop}px < ${DO.cao[DO.hep]}`,
		dau.oSoanTop !== null && dau.oSoanTop < DO.cao[DO.hep],
	);
	kiem(
		`E12 buoc 5: nut «${CHU.gop.gui}» nam tron trong man dau, day ${dau.guiDay}px <= ${DO.cao[DO.hep]}`,
		dau.guiDay !== null && dau.guiDay <= DO.cao[DO.hep],
	);
	kiem(
		`E12 buoc 5: tab Hoi y dang dung nam tron [0, ${dau.rong}] (thay ${JSON.stringify(dau.tab)})`,
		dau.tab !== null && dau.tab.trai >= 0 && dau.tab.phai <= dau.rong,
	);
	await chup(t, "buoc-man-dau.png");
	await bamChu(t, "[data-khoi='loi-mo'] button", CHU.moDau.docThem);
	await doi(
		t,
		"E12 buoc 5: Doc them mo du loi mo",
		(c) =>
			window
				.__tim("[data-khoi='loi-mo'] [data-slot='collapsible-content'] p")[0]
				?.innerText.replace(/\s+/g, " ")
				.trim() === c,
		gon(GO.loiMo),
	);
	await t.close();

	nhom = "E12 buoc 6";
	const g = await moTrang("A", DO.rong, duongHoiY(NAM_KE));
	await choTrangThai(g, "gop", "E12 buoc 6");
	const truocGui = new Date();
	await g.evaluate(() => {
		window
			.__tim("[data-khoi='o-soan']")[0]
			?.scrollIntoView({ block: "center" });
	});
	const oTay = await g.evaluateHandle(() =>
		window.__tim("[data-khoi='o-soan'] textarea, [data-khoi='o-soan'] input"),
	);
	const oDs = [...(await oTay.getProperties()).values()]
		.map((x) => x.asElement())
		.filter(Boolean);
	if (oDs.length !== 3)
		kiem(`E12 buoc 6: o soan co ${oDs.length} o thay 3`, false);
	else
		for (const [k, gia] of [
			GO.y.noiDung,
			GO.y.viSao,
			GO.y.doBangGi,
		].entries()) {
			await oDs[k].focus();
			await oDs[k].type(gia);
		}
	await bamChu(g, "[data-khoi='o-soan'] button[type='submit']", CHU.gop.gui);
	await doi(
		g,
		"E12 buoc 6: khoi «Y cua ban» co y vua gui",
		(c) =>
			(window.__tim("[data-khoi='y-cua-ban']")[0]?.innerText ?? "")
				.replace(/\s+/g, " ")
				.includes(c),
		GO.y.noiDung,
	);
	const yMoi = await db.okrY.findMany({
		where: { hoiYId: h.id, tacGiaUserId: id.A, createdAt: { gte: truocGui } },
		select: { id: true, noiDung: true, viSao: true, doBangGi: true },
	});
	console.log(`  E13 DB okrY moi cua A: ${JSON.stringify(yMoi)}`);
	kiem(`E13: dung mot okrY moi cua A (thay ${yMoi.length})`, yMoi.length === 1);
	for (const [truong, gia] of Object.entries(GO.y)) {
		const trongDb = yMoi[0]?.[truong];
		if (trongDb !== gia)
			console.log(
				`  E13: DB ${truong} «${trongDb ?? ""}» khac chuoi da go «${gia}»`,
			);
		kiem(`E13: okrY.${truong} bang chuoi da go`, trongDb === gia);
	}
	const KHUNG_DN = "[data-khoi='y-dong-nghiep']";
	const dem = async () =>
		g.evaluate((k) => window.__tim(`${k} [data-y]`).length, KHUNG_DN);
	const hienThem = await chuSel(g, `${KHUNG_DN} [data-nut='hien-them']`);
	const mongHienThem = demSo(
		CHU.dongNghiep.hienThem.mot,
		CHU.dongNghiep.hienThem.nhieu,
		DO.soYGieoSan - DO.hienTruoc,
	);
	const truocBam = await dem();
	kiem(
		`E12 buoc 6: danh sach dong nghiep hien ${DO.hienTruoc} y va «${mongHienThem}» (thay ${truocBam} y, «${hienThem}»)`,
		truocBam === DO.hienTruoc && hienThem === mongHienThem,
	);
	await bam(g, `${KHUNG_DN} [data-nut='hien-them']`);
	await doi(
		g,
		`E12 buoc 6: bam Hien them -> du ${DO.soYGieoSan} y`,
		(k, n) => window.__tim(`${k} [data-y]`).length === n,
		KHUNG_DN,
		DO.soYGieoSan,
	);
	const yDau = await g.evaluate(
		(k) => window.__tim(`${k} [data-y]`)[0]?.getAttribute("data-y") ?? null,
		KHUNG_DN,
	);
	await bam(g, `${KHUNG_DN} [data-y='${yDau}'] [data-slot='toggle']`);
	await doi(
		g,
		"E12 buoc 6: «Tôi cũng nghĩ vậy» aria-pressed=true",
		(s) => window.__tim(s)[0]?.getAttribute("aria-pressed") === "true",
		`${KHUNG_DN} [data-y='${yDau}'] [data-slot='toggle']`,
	);
	await cho(DO.choGhiMs);
	await g.mouse.move(0, 0);
	const nutBat = await g.evaluate(
		(k, y) => {
			const doc = (e) => {
				if (!e) return null;
				const dau = e.querySelector("[data-slot='toggle-check']");
				const nen = (x) => getComputedStyle(x).backgroundColor;
				const nenThe = e.closest("[data-slot='card-content']");
				return {
					nen: nen(e),
					nenThe: nenThe ? nen(nenThe) : null,
					dau:
						dau && getComputedStyle(dau).visibility === "visible"
							? Math.round(dau.getBoundingClientRect().width)
							: 0,
					rong: Math.round(e.getBoundingClientRect().width),
				};
			};
			const bat = window.__tim(`${k} [data-y='${y}'] [data-slot='toggle']`)[0];
			const tat = window
				.__tim(`${k} [data-slot='toggle']`)
				.find((e) => e.getAttribute("aria-pressed") === "false");
			return { bat: doc(bat), tat: doc(tat) };
		},
		KHUNG_DN,
		yDau,
	);
	console.log(
		`  E12 buoc 6: nut «Toi cung nghi vay» ${JSON.stringify(nutBat)}`,
	);
	const batKhac =
		nutBat.bat !== null &&
		nutBat.tat !== null &&
		nutBat.bat.nen !== nutBat.tat.nen &&
		nutBat.bat.nen !== nutBat.bat.nenThe &&
		nutBat.bat.nen !== "rgba(0, 0, 0, 0)" &&
		nutBat.bat.dau > 0 &&
		nutBat.tat.dau === 0 &&
		nutBat.bat.rong === nutBat.tat.rong;
	if (!batKhac)
		console.log(
			`  E12 buoc 6: nut da bat khong khac nut chua bat (${JSON.stringify(nutBat)})`,
		);
	kiem(
		"E12 buoc 6: «Tôi cũng nghĩ vậy» đã bật có nền khác nút chưa bật và khác nền thẻ, có dấu tích; nút chưa bật không dấu tích; hai nút cùng bề ngang",
		batKhac,
	);
	await kiemTheoTen(g, KHUNG_DN, tenGieo, "E12 buoc-gop");
	const khongDich = await g.evaluate((k) => {
		const doan = window.__tim(`${k} [data-y] p`);
		return {
			so: doan.length,
			lech: doan.filter((p) => p.getAttribute("translate") !== "no").length,
		};
	}, KHUNG_DN);
	kiem(
		`E12 buoc 6: y mang translate=no (thay ${JSON.stringify(khongDich)})`,
		khongDich.so > 0 && khongDich.lech === 0,
	);
	await doi(
		g,
		"E12 buoc 6: tab Hoi y mat huy hieu Moi sau khi gui",
		() =>
			window.__tim("[data-khung-tab] a[href*='/okr/hoi-y'] [data-slot='badge']")
				.length === 0,
	);
	const dongY = await db.okrYDongY.findMany({
		where: { yId: yDau ?? "", userId: id.A },
		select: { yId: true, userId: true },
	});
	kiem(
		`E13: okrYDongY {yId, userId} dung mot hang (thay ${JSON.stringify(dongY)})`,
		dongY.length === 1,
	);
	await cuonToi(g, "[data-khoi='y-cua-ban']");
	await chup(g, "buoc-gop.png");
	await kho(g, DO.hep);
	await cuonToi(g, "[data-khoi='y-cua-ban']");
	await chup(g, "buoc-gop-390.png");
	await kho(g, DO.rong);

	nhom = "E12 buoc 7";
	const pbA = xep.get(id.A);
	await cuonToi(g, "[data-khoi='do-phu']");
	await coMat(
		g,
		"[data-khoi='do-phu'] [data-slot='heatmap']",
		"E12 buoc 7: heatmap do phu",
	);
	const hm = await g.evaluate((pb) => {
		const hang = window
			.__tim("[data-khoi='do-phu'] tr[data-row]")
			.map((r) => r.getAttribute("data-row"));
		const o = window.__tim(`[data-khoi='do-phu'] tr[data-row='${pb}'] td`);
		return { hang, oCuoi: o.at(-1)?.innerText.trim() ?? null };
	}, pbA);
	const boPhan = (
		await db.division.findMany({
			where: { id: { startsWith: TIEN_TO_MAU } },
			select: { id: true },
		})
	).map((d) => d.id);
	const nguoiPb = (
		await db.orgPlacement.findMany({
			where: { primaryDepartmentId: pbA },
			select: { userId: true },
		})
	).map((p) => p.userId);
	const conHieuLuc = new Set(
		(
			await db.member.findMany({
				where: { userId: { in: nguoiPb } },
				select: { userId: true },
			})
		).map((m) => m.userId),
	);
	conHieuLuc.delete(id.quanTri);
	const cuoiNgay = new Date(`${ngayVN(new Date())}T23:59:59.999+07:00`);
	const gop = new Set(
		(
			await db.okrY.findMany({
				where: {
					hoiYId: h.id,
					tacGiaUserId: { in: [...conHieuLuc] },
					createdAt: { lte: cuoiNgay },
				},
				select: { tacGiaUserId: true },
			})
		).map((y) => y.tacGiaUserId),
	);
	const tay = Math.round((1000 * gop.size) / conHieuLuc.size) / 10;
	const tren = Number(
		(hm.oCuoi ?? "").replace("%", "").replace(",", ".").trim(),
	);
	console.log(
		`  E12 buoc-do-phu: hang ${JSON.stringify(hm.hang)}; o phong ban ${pbA} cot hom nay «${hm.oCuoi}»; tinh tay tu DB ${gop.size}/${conHieuLuc.size} = ${tay}`,
	);
	kiem(
		"E12 buoc 7: heatmap co hang toan cong ty va du bo phan",
		hm.hang[0] === "goc" &&
			boPhan.length > 0 &&
			boPhan.every((b) => hm.hang.includes(b)),
	);
	kiem(`E12 buoc 7: o phong ban cua A khac 0 (thay «${hm.oCuoi}»)`, tren > 0);
	kiem(
		`E13: so tren o heatmap phong ban ${tren} bang tinh tay tu DB ${tay}`,
		tren === tay,
	);
	await chup(g, "buoc-do-phu.png");
	await g.close();

	nhom = "E12 buoc 8-9";
	const cua = { che: null, chan: 0 };
	const b = await moTrang("B", DO.rong, duongHoiY(QUY4), {
		truocKhiMo: chanHoiY("B", cua),
		boQua: /500|Failed to load resource|chan boi thuoc/,
	});
	await choTrangThai(b, "trong-thanh-vien", "E12 buoc 8");
	const trongTv = await b.evaluate(() => ({
		tieuDe:
			window
				.__tim("[data-khoi='trong-thanh-vien'] [data-slot='empty-title']")[0]
				?.innerText.trim() ?? null,
		nut: window.__tim("[data-nut='mo-hoi-y']").length,
	}));
	kiem(
		`E12 buoc 8: Empty «${CHU.trong.thanhVien}», khong nut mo (thay ${JSON.stringify(trongTv)})`,
		trongTv.tieuDe === CHU.trong.thanhVien && trongTv.nut === 0,
	);
	await chup(b, "buoc-trong-thanh-vien.png");
	cua.che = "loi";
	await chonHop(b, "[data-chon-chu-ky]", TEN_KY.nam);
	await choTrangThai(b, "loi", "E12 buoc 9: chan okr.hoiY");
	const loi = await b.evaluate(() => ({
		tieuDe:
			window
				.__tim("[data-khoi='loi'] [data-slot='empty-title']")[0]
				?.innerText.trim() ?? null,
		nut: window.__tim("[data-khoi='loi'] button")[0]?.innerText.trim() ?? null,
	}));
	kiem(
		`E12 buoc 9: Empty loi co «${CHU.loi.thuLai}» (thay ${JSON.stringify(loi)}, chan ${cua.chan} lan)`,
		loi.tieuDe === CHU.loi.tieuDe && loi.nut === CHU.loi.thuLai && cua.chan > 0,
	);
	await chup(b, "buoc-trang-thai-loi.png");
	cua.che = null;
	await bamChu(b, "[data-khoi='loi'] button", CHU.loi.thuLai);
	await choTrangThai(
		b,
		"trong-thanh-vien",
		"E12 buoc 9: bo chan, Thu lai tai duoc",
	);
	cua.che = "tre";
	await chonHop(b, "[data-chon-chu-ky]", TEN_KY.quy3);
	const thayTai = await thayNgay(
		b,
		() =>
			window.__tim("[data-trang-thai='dang-tai'] [data-slot='skeleton']")
				.length > 0,
	);
	kiem("E12 buoc 9: tri hoan truy van -> Skeleton", thayTai);
	if (thayTai) await chup(b, "buoc-trang-thai.png");
	cua.che = null;
	await choTrangThai(b, "trong-thanh-vien", "E12 buoc 9: het tri hoan");
	await b.close();
}

const LOI_HOI_Y = {
	error: {
		json: {
			message: "chan boi thuoc man-hoi-y",
			code: -32603,
			data: {
				code: "INTERNAL_SERVER_ERROR",
				httpStatus: 500,
				path: "okr.hoiY",
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

function chanHoiY(khoa, cua) {
	return async (trang) => {
		await trang.setRequestInterception(true);
		trang.on("request", async (r) => {
			const tenTt = thuTucCua(r.url());
			if (cua.che === null || !tenTt.includes("okr.hoiY")) {
				await r.continue();
				return;
			}
			cua.chan += 1;
			if (cua.che === "tre") {
				await cho(DO.treMs);
				await r.continue().catch(() => {});
				return;
			}
			if (tenTt.length === 1) {
				await r.respond({
					status: 500,
					contentType: "application/json",
					body: JSON.stringify([LOI_HOI_Y]),
				});
				return;
			}
			const that = await fetch(r.url(), {
				method: r.method(),
				headers: { ...mu(cookie[khoa]), "content-type": "application/json" },
				body: r.postData(),
			});
			const ds = JSON.parse(await that.text());
			await r.respond({
				status: 207,
				contentType: "application/json",
				body: JSON.stringify(
					tenTt.map((x, i) => (x === "okr.hoiY" ? LOI_HOI_Y : ds[i])),
				),
			});
		});
	};
}

const CHE = [];

async function chanDoanDanhSach(trang) {
	return trang.evaluate(() => {
		const bar = window.__tim("[data-khoi='thanh-cong-bo']")[0];
		const ul = bar?.querySelector("ul");
		if (!ul) return null;
		const s = getComputedStyle(ul);
		const ru = ul.getBoundingClientRect();
		const a = ul.querySelector("a");
		const ra = a?.getBoundingClientRect();
		const tren = ra
			? document.elementFromPoint(
					ra.left + ra.width / 2,
					ra.top + ra.height / 2,
				)
			: null;
		return {
			ul: {
				maskImage: s.maskImage,
				webkitMaskImage: s.webkitMaskImage,
				maskSize: s.maskSize,
				maskPosition: s.maskPosition,
				maskComposite: s.maskComposite,
				color: s.color,
				opacity: s.opacity,
				visibility: s.visibility,
				overflow: s.overflowY,
				height: s.height,
				scrollTop: ul.scrollTop,
				scrollHeight: ul.scrollHeight,
				clientHeight: ul.clientHeight,
				rect: [Math.round(ru.top), Math.round(ru.height)],
			},
			li: [...ul.querySelectorAll("li")].map((li) => {
				const r = li.getBoundingClientRect();
				return [Math.round(r.top - ru.top), Math.round(r.height)];
			}),
			a: a
				? {
						color: getComputedStyle(a).color,
						opacity: getComputedStyle(a).opacity,
						visibility: getComputedStyle(a).visibility,
					}
				: null,
			tren: tren ? `${tren.tagName} ${tren.getAttribute("data-slot")}` : null,
			trenLaLienKet: !!(a && tren && (tren === a || a.contains(tren))),
		};
	});
}

async function soMauCuaLienKetDau(trang) {
	const o = await trang.evaluate(() => {
		const a = window.__tim("[data-khoi='thanh-cong-bo'] ul a")[0];
		const r = a?.getBoundingClientRect();
		return r && r.width > 0 && r.height > 0
			? { x: r.left, y: r.top, width: r.width, height: r.height }
			: null;
	});
	if (!o) return 0;
	const anh = await trang.screenshot({
		clip: o,
		encoding: "base64",
		type: "png",
	});
	return trang.evaluate(async (b64) => {
		const hinh = new Image();
		hinh.src = `data:image/png;base64,${b64}`;
		await hinh.decode();
		const ve = document.createElement("canvas");
		ve.width = hinh.naturalWidth;
		ve.height = hinh.naturalHeight;
		const ctx = ve.getContext("2d");
		if (!ctx) return 0;
		ctx.drawImage(hinh, 0, 0);
		const d = ctx.getImageData(0, 0, ve.width, ve.height).data;
		const mau = new Set();
		for (let i = 0; i < d.length; i += 4)
			mau.add(`${d[i]},${d[i + 1]},${d[i + 2]}`);
		return mau.size;
	}, anh);
}

async function kiemCuoiTrang(trang, tenAnh, nhan) {
	await trang.evaluate(() => {
		const k = document.querySelector("[data-slot='page-shell-scroll']");
		if (k) k.scrollTop = k.scrollHeight;
		window.scrollTo(0, document.documentElement.scrollHeight);
	});
	await cho(600);
	const r = await trang.evaluate(() => {
		const nut = window.__tim("[data-nut='luu-ket-luan']").at(-1);
		const bar = window.__tim("[data-khoi='thanh-cong-bo']")[0];
		const giuCho = document.querySelector("[data-slot='save-bar-spacer']");
		const rn = nut?.getBoundingClientRect();
		const rb = bar?.getBoundingClientRect();
		return {
			nutTren: rn ? Math.round(rn.top) : null,
			nutDay: rn ? Math.round(rn.bottom) : null,
			thanhTren: rb ? Math.round(rb.top) : null,
			thanhCao: rb ? Math.round(rb.height) : null,
			giuCho: giuCho ? Math.round(giuCho.getBoundingClientRect().height) : null,
			cao: window.innerHeight,
			ds: (() => {
				const ul = bar?.querySelector("ul");
				const dau = ul?.querySelector("li")?.getBoundingClientRect();
				return ul
					? {
							cuon: ul.scrollTop,
							cao: ul.clientHeight,
							toanBo: ul.scrollHeight,
							muc: ul.querySelectorAll("li").length,
							dauTren: dau ? Math.round(dau.top) : null,
							hien: window.__tim("[data-khoi='thanh-cong-bo'] ul a").length,
							tren: (() => {
								const a = ul.querySelector("a")?.getBoundingClientRect();
								const e = a
									? document.elementFromPoint(
											a.left + a.width / 2,
											a.top + a.height / 2,
										)
									: null;
								return e ? `${e.tagName} ${e.getAttribute("data-slot")}` : null;
							})(),
						}
					: null;
			})(),
		};
	});
	console.log(`  ${nhan}: cuoi trang ${JSON.stringify(r)}`);
	console.log(
		`  ${nhan}: danh sach dieu thieu ${JSON.stringify(await chanDoanDanhSach(trang))}`,
	);
	kiem(
		`${nhan}: cuon het trang, nut «${CHU.ketLuan.luu}» cua the cuoi nam tron tren thanh cong bo mo san (thay ${JSON.stringify(r)})`,
		r.nutTren !== null &&
			r.nutDay !== null &&
			r.thanhTren !== null &&
			r.nutTren >= 0 &&
			r.nutDay <= r.thanhTren,
	);
	await moDanhSach(trang);
	const chanDoan = await chanDoanDanhSach(trang);
	const mauLienKet = await soMauCuaLienKetDau(trang);
	console.log(
		`  ${nhan}: lien ket dieu thieu dau tien — elementFromPoint ${chanDoan?.tren}, ${mauLienKet} mau diem anh trong o cua no`,
	);
	kiem(
		`${nhan}: lien ket dieu thieu dau tien cua thanh cong bo bam trung duoc (elementFromPoint tai tam tra ve chinh lien ket, thay ${chanDoan?.tren ?? "khong co"})`,
		chanDoan?.trenLaLienKet === true,
	);
	kiem(
		`${nhan}: lien ket dieu thieu dau tien duoc ve ra anh — o cua no co it nhat ${DO.mauToiThieu} mau diem anh (thay ${mauLienKet})`,
		mauLienKet >= DO.mauToiThieu,
	);
	await chup(trang, tenAnh);
}
const AN_DANH_SACH = "Ẩn danh sách";
const HIEN_DANH_SACH = "Xem danh sách";

async function moDanhSach(trang) {
	const dangThu = await trang.evaluate(
		(c) =>
			[
				...(window
					.__tim("[data-khoi='thanh-cong-bo']")[0]
					?.querySelectorAll("button") ?? []),
			].some((b) => b.innerText.replace(/\s+/g, " ").trim() === c),
		HIEN_DANH_SACH,
	);
	if (!dangThu) return;
	await bamChu(trang, "[data-khoi='thanh-cong-bo'] button", HIEN_DANH_SACH);
	await cho(400);
}

const theChuDe = (chuDeId) => `[data-chu-de='${chuDeId}'][id^='chu-de-']`;

async function ketLuanMot(trang, c) {
	const sel = theChuDe(c.id);
	await cuonToi(trang, sel);
	await cho(400);
	const lyDoTruoc = await trang.evaluate(
		(s) => window.__tim(`${s} textarea`)[0]?.value ?? null,
		sel,
	);
	kiem(
		`E15 buoc 5: o ly do cua «${c.ten}» trong khi moi mo (thay «${lyDoTruoc}»)`,
		lyDoTruoc === "",
	);
	const nhanKl = CHU.ketLuan.gia[c.ketLuan];
	for (let lan = 0; lan < DO.lanMoHop; lan += 1) {
		await bamChu(trang, `${sel} [role='radio']`, nhanKl);
		const bat = await thayNgay(
			trang,
			(s, n) =>
				window
					.__tim(`${s} [role='radio']`)
					.some(
						(e) =>
							e.innerText.trim() === n &&
							e.getAttribute("aria-checked") === "true",
					),
			sel,
			nhanKl,
		);
		if (bat) break;
	}
	await go(trang, `${sel} textarea`, c.lyDo);
	if (c.ketLuan === "chon") {
		await go(trang, `${sel} input`, c.cau);
		await chonHop(trang, `${sel} [data-slot='select-trigger']`, c.noiNhan);
	}
	const nutLuu = `${sel} [data-nut='luu-ket-luan']`;
	await trang.evaluate((s) => {
		window.__tim(s)[0]?.scrollIntoView({ block: "center" });
	}, nutLuu);
	await cho(300);
	const che = await trang.evaluate((s) => {
		const nut = window.__tim(s)[0];
		if (!nut) return null;
		const r = nut.getBoundingClientRect();
		const tren = document.elementFromPoint(
			r.left + r.width / 2,
			r.top + r.height / 2,
		);
		const bar = window.__tim("[data-khoi='thanh-cong-bo']")[0];
		return nut.contains(tren)
			? null
			: {
					nut: Math.round(r.top),
					thanh: bar ? Math.round(bar.getBoundingClientRect().top) : null,
				};
	}, nutLuu);
	if (che) {
		CHE.push(c.ten);
		console.log(
			`  E15 buoc 5: nut «${CHU.ketLuan.luu}» cua «${c.ten}» nam duoi thanh cong bo (nut y=${che.nut}, thanh tu y=${che.thanh}) — bam «${AN_DANH_SACH}» nhu nguoi dung roi moi bam luu`,
		);
		const coNutAn = await trang.evaluate(
			(c) =>
				[
					...(window
						.__tim("[data-khoi='thanh-cong-bo']")[0]
						?.querySelectorAll("button") ?? []),
				].some((b) => b.innerText.replace(/\s+/g, " ").trim() === c),
			AN_DANH_SACH,
		);
		if (coNutAn) {
			await bamChu(trang, "[data-khoi='thanh-cong-bo'] button", AN_DANH_SACH);
			await cho(400);
		}
	}
	await bam(trang, nutLuu);
	const luu = await thayNgay(
		trang,
		(s) => window.__tim(`${s}`)[0]?.getAttribute("data-ket-luan") !== "chua",
		sel,
	);
	if (!luu)
		console.log(
			`  E15 buoc 5: the «${c.ten}» sau khi bam luu: ${JSON.stringify(
				await trang.evaluate(
					(s) => ({
						radio: window
							.__tim(`${s} [role='radio']`)
							.map(
								(e) =>
									`${e.innerText.trim()}:${e.getAttribute("aria-checked")}`,
							),
						lyDo: window.__tim(`${s} textarea`)[0]?.value.length ?? null,
						o: window.__tim(`${s} input`).map((e) => e.value),
						noi:
							window.__tim(`${s} [data-slot='select-trigger']`)[0]?.innerText ??
							null,
						loi: window
							.__tim(`${s} [data-slot='field-error']`)
							.map((e) => e.innerText),
						nut:
							window.__tim(`${s} [data-nut='luu-ket-luan']`)[0]?.disabled ??
							null,
					}),
					sel,
				),
			)}`,
		);
	kiem(`E15 buoc 5: luu ket luan «${c.ten}»`, luu);
	await cho(DO.choGhiMs);
}

async function trangThaiMucLuc(trang) {
	return trang.evaluate(() =>
		window.__tim("[data-khoi='muc-luc'] [data-muc-luc]").map((e) => ({
			id: e.getAttribute("data-muc-luc"),
			da: (e.querySelector(".sr-only")?.textContent ?? "").includes("đã"),
			sang: e.getAttribute("aria-current") === "location",
		})),
	);
}

async function nhomE15() {
	nhom = "E15 tien de";
	await napBoMau();
	await nguoiMau("quanTri", QUAN_TRI);
	slug = await suySlugCua(cookie.quanTri);
	const h = await db.okrHoiY.findUniqueOrThrow({
		where: { cycleId: NAM_KE },
		include: { banTruoc: true },
	});
	const banTruoc = h.banTruoc?.cau ?? [];
	const chuDe = await db.okrChuDe.findMany({
		where: { hoiYId: h.id },
		orderBy: [{ viTri: "asc" }, { id: "asc" }],
	});
	const chuaGom = await db.okrY.findMany({
		where: { hoiYId: h.id, chuDeId: null },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: { id: true, tacGiaUserId: true, noiDung: true },
	});
	const vai = new Map(
		(
			await db.member.findMany({
				where: { userId: { in: chuaGom.map((y) => y.tacGiaUserId) } },
				select: { userId: true, role: true },
			})
		).map((m) => [m.userId, m.role]),
	);
	const yGom = chuaGom.find((y) => vai.get(y.tacGiaUserId) === "member");
	const cd3 = chuDe.find((c) => c.loai === "chu-de" && c.ketLuan === null);
	const cd4 = chuDe.find(
		(c) => c.loai === "chu-de" && c.ketLuan === null && c.id !== cd3?.id,
	);
	const yLa = chuDe.find((c) => c.loai === "y-la");
	if (!yGom || !cd3 || !cd4 || !yLa || banTruoc.length !== 4)
		await khongDo(
			`KHONG DO DUOC: lan hoi y mau khong dung hinh (y chua gom cua thanh vien ${!!yGom}, hai chu de chua ket luan ${!!cd3 && !!cd4}, y la ${!!yLa}, ${banTruoc.length} cau viet truoc)`,
		);
	await nguoiMau("M", await maCua(yGom.tacGiaUserId));
	console.log(
		`  E15: lan hoi y mau ${h.id}; nguoi chon ${ten.quanTri}; thanh vien da gop M ${ten.M}; y se gom ${yGom.id}; chu de chua ket luan «${cd3.ten}», «${cd4.ten}», y la ${yLa.id}`,
	);

	nhom = "E15 buoc 2";
	const namKe = await db.okrCycle.findUniqueOrThrow({
		where: { id: NAM_KE },
		select: { startsOn: true },
	});
	const tu = namKe.startsOn.toISOString().slice(0, 10);
	const den = new Date(namKe.startsOn.getTime() + 89 * 24 * GIO_MS)
		.toISOString()
		.slice(0, 10);
	const quyKe = await lam(cookie.quanTri, "okr.createCycle", {
		kind: "quy",
		name: `Quý kế · đo ${MA}`,
		parentId: NAM_KE,
		startsOn: tu,
		endsOn: den,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	G.ky.push(quyKe.id);
	const h2 = await lam(cookie.quanTri, "okr.moHoiY", {
		cycleId: quyKe.id,
		cauHoi: `Quý kế nên dồn sức vào đâu ${MA}?`,
		loiMo: "",
		soLieu: [{ nhan: "Khách quay lại", giaTri: "64%", ghiChu: "" }],
		hanLuc: new Date(Date.now() + 48 * GIO_MS).toISOString(),
		nguoiChonUserId: id.quanTri,
	});
	const tacGiaH2 = chuaGom.slice(0, 2).map((y) => y.tacGiaUserId);
	for (const [i, u] of tacGiaH2.entries())
		await lam(phienCua(`${await maCua(u)}@${MIEN_MAU}`), "okr.gopY", {
			hoiYId: h2.id,
			noiDung: `Ý quý kế số ${i + 1} gieo qua API ${MA}`,
			viSao: "",
			doBangGi: "",
		});
	console.log(
		`  E15: lan hoi y thu hai ${h2.id} tren quy ke ${quyKe.id} (dang mo, chua niem phong, ${tacGiaH2.length} y)`,
	);
	const k = await moTrang("quanTri", DO.rong, duongHoiY(quyKe.id));
	await doi(k, "E15 buoc 2: trang hoi y quy ke tai xong", () => {
		const t = window
			.__tim("[data-trang-thai]")[0]
			?.getAttribute("data-trang-thai");
		return t && t !== "dang-tai";
	});
	await cho(DO.choKhongHienMs);
	const khoa = await k.evaluate(() => ({
		tt: window.__tim("[data-trang-thai]")[0]?.getAttribute("data-trang-thai"),
		khoa: window.__tim("[data-khoi='y-bi-khoa']").length,
		tieuDe:
			window
				.__tim("[data-khoi='y-bi-khoa'] [data-slot='empty-title']")[0]
				?.innerText.trim() ?? null,
		soY: window.__tim("[data-khoi='y-dong-nghiep'] [data-y]").length,
	}));
	if (khoa.soY > 0)
		console.log(
			`  E15 buoc-khoa-nguoi-chon: nguoi chon chua niem phong thay ${khoa.soY} y`,
		);
	kiem(
		`E15 buoc 2: danh sach y khoa, dong ly do «${CHU.dongNghiep.khoa["chua-niem-phong"].tieuDe}», 0 y hien (thay ${JSON.stringify(khoa)})`,
		khoa.khoa === 1 &&
			khoa.tieuDe === CHU.dongNghiep.khoa["chua-niem-phong"].tieuDe &&
			khoa.soY === 0,
	);
	await chup(k, "buoc-khoa-nguoi-chon.png");
	await k.close();

	nhom = "E16 ghi mang";
	const may = mayGhi("M");
	const mTrang = await moTrang("M", DO.hep, duongHoiY(NAM_KE), { may });
	await choTrangThai(mTrang, "het-han", "E16: thanh vien M truoc cong bo");

	nhom = "E15 buoc 3";
	const KHUNG_GOM = "[data-khoi='y-chua-gom']";
	const mayChon = mayGhi("nguoi-chon");
	const c = await moTrang("quanTri", DO.rong, duongHoiY(NAM_KE), {
		may: mayChon,
	});
	await choTrangThai(c, "chon-chua-du", "E15 buoc 3");
	const gom0 = await c.evaluate((kg) => {
		const hienTai = window.__tim(
			"[data-khoi='dai-moc'] [aria-current='step']",
		)[0];
		return {
			pha: window.__tim("[data-khoi='dai-moc']")[0]?.getAttribute("data-pha"),
			moc: hienTai?.getAttribute("data-moc") ?? null,
			y: window.__tim(`${kg} [data-y]`).length,
			tacGia: window.__tim(`${kg} [data-y] [data-tac-gia]`).length,
			tacGiaRong: window
				.__tim(`${kg} [data-y] [data-tac-gia]`)
				.filter((e) => (e.textContent ?? "").trim() === "").length,
			thanh: window.__tim("[data-khoi='thanh-chon']").length,
		};
	}, KHUNG_GOM);
	kiem(
		`E15 buoc 3: dai pha o «${CHU.moc.ten.gom}», Y chua gom co ten nguoi gop, chua co thanh chon nhieu (thay ${JSON.stringify(gom0)})`,
		gom0.pha === "dang-gom" &&
			gom0.moc === "gom" &&
			gom0.y === chuaGom.length &&
			gom0.y > 0 &&
			gom0.tacGia === gom0.y &&
			gom0.tacGiaRong === 0 &&
			gom0.thanh === 0,
	);
	await bam(c, `${KHUNG_GOM} [data-y='${yGom.id}'] [role='checkbox']`);
	const thanh = demSo(CHU.gom.daChon.mot, CHU.gom.daChon.nhieu, 1);
	await doi(
		c,
		`E15 buoc 3: thanh «${thanh} · ${CHU.gom.duaVao}» hien`,
		(t, n) => {
			const k = window.__tim("[data-khoi='thanh-chon']")[0];
			return !!k && k.innerText.includes(t) && k.innerText.includes(n);
		},
		thanh,
		CHU.gom.duaVao,
	);
	await bamChu(c, "[data-khoi='thanh-chon'] button", CHU.gom.duaVao);
	await coMat(
		c,
		`[data-dua-vao='${cd3.id}']`,
		"E15 buoc 3: menu dua vao chu de co san",
	);
	await bam(c, `[data-dua-vao='${cd3.id}']`);
	await doi(
		c,
		"E15 buoc 3: y roi danh sach, thanh bien mat",
		(kg, y) =>
			window.__tim(`${kg} [data-y='${y}']`).length === 0 &&
			window.__tim("[data-khoi='thanh-chon']").length === 0,
		KHUNG_GOM,
		yGom.id,
	);
	const sauGom = await db.okrY.findUnique({
		where: { id: yGom.id },
		select: { chuDeId: true },
	});
	kiem(
		`E16: okrY ${yGom.id} co chuDeId cua chu de da chon (thay ${sauGom?.chuDeId} / ${cd3.id})`,
		sauGom?.chuDeId === cd3.id,
	);
	await cuonToi(c, KHUNG_GOM);
	await chup(c, "buoc-gom.png");

	nhom = "E15 buoc 4";
	await c.evaluate(() => {
		const k = document.querySelector("[data-slot='page-shell-scroll']");
		if (k) k.scrollTop = 0;
	});
	await cho(600);
	const chuaKl = () =>
		db.okrChuDe.count({ where: { hoiYId: h.id, ketLuan: null } });
	const soTab = await huyHieuTab(c);
	const mongTab = String(await chuaKl());
	kiem(
		`E15 buoc 4: tab Hoi y mang so chu de chua ket luan ${mongTab} (thay «${soTab}»)`,
		soTab === mongTab,
	);
	const chuDeNay = await db.okrChuDe.findMany({
		where: { hoiYId: h.id },
		orderBy: [{ viTri: "asc" }, { id: "asc" }],
		select: { id: true, ketLuan: true, lyDo: true },
	});
	const ml = await trangThaiMucLuc(c);
	kiem(
		`E15 buoc 4: muc luc liet du ${chuDeNay.length} chu de voi dau da/chua ket luan dung DB (thay ${JSON.stringify(ml)})`,
		ml.length === chuDeNay.length &&
			chuDeNay.length > 0 &&
			chuDeNay.every((x) =>
				ml.some((m) => m.id === x.id && m.da === (x.ketLuan !== null)),
			),
	);
	const thu3 = chuDeNay[2]?.id;
	await c.evaluate((s) => {
		const e = document.querySelector(s);
		const k = document.querySelector("[data-slot='page-shell-scroll']");
		if (e && k)
			k.scrollTop +=
				e.getBoundingClientRect().top - k.getBoundingClientRect().top + 40;
	}, `[data-chu-de='${thu3}'][id^='chu-de-']`);
	await doi(
		c,
		"E15 buoc 4: cuon toi the thu ba -> muc thu ba sang",
		(i) =>
			window
				.__tim(
					"[data-khoi='muc-luc'] [data-muc-luc][aria-current='location']",
				)[0]
				?.getAttribute("data-muc-luc") === i,
		thu3,
	);
	const cuoi = chuDeNay.at(-1)?.id;
	await bam(c, `[data-khoi='muc-luc'] [data-muc-luc='${cuoi}']`);
	await cho(1200);
	const khung = await c.evaluate((i) => {
		const e = document.querySelector(`[data-chu-de='${i}'][id^='chu-de-']`);
		const b = window.__tim("[data-khoi='ban-viet-truoc-cua-ban']")[0];
		const r = e?.getBoundingClientRect();
		const rb = b?.getBoundingClientRect();
		return {
			the: r ? { top: r.top, bottom: r.bottom } : null,
			ban: rb ? { top: rb.top, bottom: rb.bottom } : null,
			cao: window.innerHeight,
		};
	}, cuoi);
	kiem(
		`E15 buoc 4: bam muc cuoi -> the cuoi trong khung nhin, khoi ban viet truoc van trong khung (thay ${JSON.stringify(khung)})`,
		khung.the !== null &&
			khung.the.top >= 0 &&
			khung.the.top < khung.cao &&
			khung.ban !== null &&
			khung.ban.top >= 0 &&
			khung.ban.top < khung.cao,
	);
	await chup(c, "buoc-muc-luc.png");

	nhom = "E15 buoc 4 (390)";
	const n = await moTrang("quanTri", DO.hep, duongHoiY(NAM_KE));
	await choTrangThai(n, "chon-chua-du", "E15 buoc 4 (390)");
	await n.evaluate(() => {
		const k = document.querySelector("[data-slot='page-shell-scroll']");
		if (k) k.scrollTop = k.scrollHeight / 3;
	});
	await cho(600);
	const hep = await n.evaluate(() => {
		const bar = window.__tim("[data-khoi='thanh-cong-bo']")[0];
		const r = bar?.getBoundingClientRect();
		const nut = [...(bar?.querySelectorAll("button") ?? [])].find(
			(b) => b.innerText.trim() === "Công bố",
		);
		return {
			mucLuc: window.__tim("[data-khoi='muc-luc']").length,
			bar: r ? { top: r.top, bottom: r.bottom } : null,
			cao: window.innerHeight,
			lienKet: [...(bar?.querySelectorAll("a[href^='#']") ?? [])].map((a) =>
				a.getAttribute("href"),
			),
			congBoTat: nut?.disabled ?? null,
		};
	});
	console.log(`  E15 buoc-thieu: ${JSON.stringify(hep)}`);
	kiem(
		`E15 buoc 4 (390): khong muc luc, thanh cong bo dinh day trong khung nhin khi cuon, liet dieu thieu, «Công bố» tat (thay ${JSON.stringify(hep)})`,
		hep.mucLuc === 0 &&
			hep.bar !== null &&
			hep.bar.bottom <= hep.cao + 1 &&
			hep.bar.top < hep.cao &&
			hep.lienKet.length > 0 &&
			hep.congBoTat === true,
	);
	const dich = hep.lienKet.find((l) => l.startsWith("#chu-de-"));
	if (dich) {
		await moDanhSach(n);
		await bam(n, `[data-khoi='thanh-cong-bo'] a[href='${dich}']`);
		await cho(1200);
		const toi = await n.evaluate((d) => {
			const e = document.getElementById(d.slice(1));
			const bar = window.__tim("[data-khoi='thanh-cong-bo']")[0];
			return {
				top: e ? e.getBoundingClientRect().top : null,
				day: bar ? bar.getBoundingClientRect().top : window.innerHeight,
			};
		}, dich);
		kiem(
			`E15 buoc 4 (390): bam «${dich}» -> trang cuon toi dung the (thay ${JSON.stringify(toi)})`,
			toi.top !== null && toi.top >= -1 && toi.top < toi.day,
		);
	} else
		kiem(
			"E15 buoc 4 (390): thanh cong bo khong co lien ket toi the chu de",
			false,
		);
	await chup(n, "buoc-thieu.png");
	await kiemCuoiTrang(n, "buoc-cuoi-trang-390.png", "B2 (390)");
	await n.close();

	nhom = "E15 buoc 5";
	await c.evaluate(() => {
		const k = document.querySelector("[data-slot='page-shell-scroll']");
		if (k) k.scrollTop = 0;
	});
	const conLai = await c.evaluate(
		(kg) => window.__tim(`${kg} [data-y]`).map((e) => e.getAttribute("data-y")),
		KHUNG_GOM,
	);
	for (const y of conLai)
		await bam(c, `${KHUNG_GOM} [data-y='${y}'] [role='checkbox']`);
	await bamChu(c, "[data-khoi='thanh-chon'] button", CHU.gom.duaVao);
	await bamChu(c, "[role='menuitem']", CHU.gom.chuDeMoiMuc);
	await coMat(c, "[role='dialog'] input", "E15 buoc 5: hop chu de moi");
	await go(c, "[role='dialog'] input", GO.tenChuDeMoi);
	await bamChu(c, "[role='dialog'] button", CHU.gom.tao);
	await doi(
		c,
		"E15 buoc 5: moi y da vao chu de",
		(kg) => window.__tim(`${kg} [data-y]`).length === 0,
		KHUNG_GOM,
	);
	await kiemCuoiTrang(c, "buoc-cuoi-trang.png", "B2 (1440)");
	const moi = await db.okrChuDe.findFirst({
		where: { hoiYId: h.id, ten: GO.tenChuDeMoi },
		select: { id: true },
	});
	if (!moi) await khongDo("KHONG DO DUOC: khong tao duoc chu de moi");
	await cho(DO.choGhiMs);
	const ketLuan = [
		{
			id: cd3.id,
			ten: cd3.ten,
			ketLuan: "chon",
			lyDo: GO.lyDoChon,
			cau: banTruoc[3],
			noi: "cau-4",
			noiNhan: dien(CHU.ketLuan.noiCau, { n: 4, chu: "" }).trim(),
		},
		{
			id: moi.id,
			ten: GO.tenChuDeMoi,
			ketLuan: "chon",
			lyDo: GO.lyDoMoi,
			cau: GO.cauMoi,
			noi: "moi",
			noiNhan: CHU.ketLuan.noiMoi,
		},
		{
			id: cd4.id,
			ten: cd4.ten,
			ketLuan: "de-sau",
			lyDo: GO.lyDoDeSau,
			cau: "",
			noi: null,
		},
		{
			id: yLa.id,
			ten: yLa.ten,
			ketLuan: "khong-lam",
			lyDo: GO.lyDoKhongLam,
			cau: "",
			noi: null,
		},
	];
	for (const kl of ketLuan) {
		await ketLuanMot(c, kl);
		const conChua = await chuaKl();
		const tab = await huyHieuTab(c);
		const mlSau = await trangThaiMucLuc(c);
		kiem(
			`E15 buoc 5: sau «${kl.ten}» tab mang ${conChua || "khong huy hieu"} (thay «${tab}»), dau muc luc doi`,
			(conChua === 0 ? tab === null : tab === String(conChua)) &&
				mlSau.find((m) => m.id === kl.id)?.da === true,
		);
	}
	kiem(
		`E15 buoc 5 (ngoai hop dong, sua gom B2): nut «${CHU.ketLuan.luu}» khong bi thanh cong bo mo san che o the nao (che ${CHE.length}${CHE.length ? `: ${CHE.join(", ")}` : ""})`,
		CHE.length === 0,
	);
	const soChonDb = await db.okrChuDe.count({
		where: { hoiYId: h.id, ketLuan: "chon" },
	});
	const sanSang = demSo(
		CHU.congBo.sanSang.mot,
		CHU.congBo.sanSang.nhieu,
		soChonDb,
	);
	await doi(
		c,
		`E15 buoc 5: thanh cong bo «${sanSang}», «Công bố» bat`,
		(s) => {
			const bar = window.__tim("[data-khoi='thanh-cong-bo']")[0];
			const nut = [...(bar?.querySelectorAll("button") ?? [])].find(
				(b) => b.innerText.trim() === "Công bố",
			);
			return !!bar && bar.innerText.includes(s) && nut?.disabled === false;
		},
		sanSang,
	);
	kiem("E15 buoc 5: tab het huy hieu", (await huyHieuTab(c)) === null);
	await chup(c, "buoc-du.png");
	const dbKl = await db.okrChuDe.findMany({
		where: { id: { in: ketLuan.map((x) => x.id) } },
		select: {
			id: true,
			ketLuan: true,
			lyDo: true,
			cauMucTieu: true,
			noiBanTruoc: true,
		},
	});
	for (const kl of ketLuan) {
		const d = dbKl.find((x) => x.id === kl.id);
		const mong = {
			ketLuan: kl.ketLuan,
			lyDo: kl.lyDo,
			cauMucTieu: kl.cau,
			noiBanTruoc: kl.noi,
		};
		const that = d && {
			ketLuan: d.ketLuan,
			lyDo: d.lyDo,
			cauMucTieu: d.cauMucTieu,
			noiBanTruoc: d.noiBanTruoc,
		};
		kiem(
			`E16: okrChuDe «${kl.ten}» bang gia tri da chon va go (DB ${JSON.stringify(that)})`,
			JSON.stringify(that) === JSON.stringify(mong),
		);
	}

	nhom = "E16 ghi mang";
	await diToi(mTrang, mTrang.url());
	await choTrangThai(
		mTrang,
		"het-han",
		"E16: thanh vien M tai lai truoc cong bo",
	);
	for (let i = 0; i < 20 && may.dang > 0; i += 1) await cho(250);
	await mTrang.close();
	const phan = [...may.phan];
	const lo = phan.filter((p) => banTruoc.some((cau) => p.than.includes(cau)));
	const coCauHoi = phan.filter((p) => p.than.includes(h.cauHoi)).length;
	console.log(
		`  E16: ghi ${phan.length} phan hoi toi trinh duyet cua M truoc cong bo (${may.hong} khong doc duoc than, ${may.dang} con dang doc); chua cau viet truoc: ${lo.length}${lo.length ? ` (${lo.map((p) => p.url).join(", ")})` : ""}; doi chung duong — chua cau hoi cua lan hoi y: ${coCauHoi}`,
	);
	for (const l of may.loiDoc)
		console.log(
			`  E16: khong doc duoc than ${l.maHttp} ${l.loai} ${l.kieu} ${l.url} — ${l.cau}`,
		);
	const loiDocChu = may.loiDoc.filter((l) => !LOAI_KHONG_CHU.has(l.loai));
	kiem(
		`E16: moi than phan hoi co the mang chu toi trinh duyet cua M doc duoc — chi mien ${LOAI_KHONG_CHU.size} loai nhi phan (${[...LOAI_KHONG_CHU].join(", ")}) Chrome khong giu than (khong doc duoc ${may.hong}, trong do mang chu ${loiDocChu.length}, con dang doc ${may.dang})`,
		loiDocChu.length === 0 && may.dang === 0,
	);
	kiem(
		`E16 doi chung duong: it nhat mot phan hoi toi M chua cau hoi «${h.cauHoi}» — chung minh than phan hoi da duoc doc (thay ${coCauHoi})`,
		coCauHoi > 0,
	);
	kiem(
		`E16: moi phan hoi toi trinh duyet thanh vien truoc cong bo khong chua cau viet truoc (ghi ${phan.length}, lo ${lo.length})`,
		phan.length > 0 && lo.length === 0,
	);
	for (let i = 0; i < 20 && mayChon.dang > 0; i += 1) await cho(250);
	const choNguoiChon = mayChon.phan.filter((p) =>
		banTruoc.some((cau) => p.than.includes(cau)),
	).length;
	console.log(
		`  E16 doi chung duong: ghi ${mayChon.phan.length} phan hoi toi nguoi chon (${mayChon.hong} khong doc duoc than); chua cau viet truoc: ${choNguoiChon}`,
	);
	kiem(
		`E16 doi chung duong: nguoi chon (duoc doc ban viet truoc) nhan it nhat mot phan hoi chua cau viet truoc — cung may quet thay duoc cau niem phong (thay ${choNguoiChon})`,
		choNguoiChon > 0,
	);

	nhom = "E15 buoc 6";
	const truocCongBo = new Date();
	const barNut = await c.evaluateHandle(() => {
		const bar = window.__tim("[data-khoi='thanh-cong-bo']")[0];
		return (
			[...(bar?.querySelectorAll("button") ?? [])].find(
				(b) => b.innerText.trim() === "Công bố",
			) ?? null
		);
	});
	await bamEl(barNut, "nut Cong bo");
	await coMat(c, "[role='alertdialog']", "E15 buoc 6: hop xac nhan cong bo");
	await bamChu(c, "[role='alertdialog'] button", CHU.congBo.nut);
	await choTrangThai(c, "ket-qua", "E15 buoc 6: trang ket qua");
	const giuBo = await c.evaluate(() =>
		window
			.__tim("[data-khoi='viet-truoc-roi-chon'] [data-giu-bo]")
			.map((e) => e.getAttribute("data-giu-bo")),
	);
	kiem(
		`E15 buoc 6: ban viet truoc giu nguyen · doi · them · bo (thay ${JSON.stringify(giuBo)})`,
		["giu", "doi", "them", "bo"].every((x) => giuBo.includes(x)),
	);
	const hSau = await db.okrHoiY.findUnique({
		where: { id: h.id },
		select: { congBoLuc: true },
	});
	const chuDeChon = await db.okrChuDe.findMany({
		where: { hoiYId: h.id, ketLuan: "chon" },
		select: { id: true, lyDo: true, objectiveId: true },
	});
	const mtMoi = await db.okrObjective.findMany({
		where: {
			cycleId: NAM_KE,
			level: "onehub",
			status: "nhap",
			createdAt: { gte: truocCongBo },
		},
		select: { id: true, whyNow: true },
	});
	console.log(
		`  E16 DB: congBoLuc ${hSau?.congBoLuc?.toISOString()}; ${chuDeChon.length} chu de chon; ${mtMoi.length} muc tieu onehub nhap moi`,
	);
	kiem("E16: congBoLuc khac null", hSau?.congBoLuc != null);
	kiem(
		`E16: so okrObjective onehub nhap moi ${mtMoi.length} bang so chu de chon ${chuDeChon.length}`,
		mtMoi.length === chuDeChon.length && mtMoi.length > 0,
	);
	const lienKetNhap = await c.evaluate(() =>
		window
			.__tim("[data-khoi='viet-truoc-roi-chon'] [data-mo-muc-tieu]")
			.map((e) => e.getAttribute("data-mo-muc-tieu")),
	);
	for (const cdc of chuDeChon) {
		kiem(
			`E16: chu de chon ${cdc.id} noi objectiveId ${cdc.objectiveId} la mot muc tieu nhap moi`,
			cdc.objectiveId !== null && mtMoi.some((m) => m.id === cdc.objectiveId),
		);
		kiem(
			`E15 buoc 6: trang ket qua co lien ket mo muc tieu nhap ${cdc.objectiveId} cua chu de chon ${cdc.id} (thay ${JSON.stringify(lienKetNhap)})`,
			cdc.objectiveId !== null && lienKetNhap.includes(cdc.objectiveId),
		);
	}
	for (const kl of ketLuan.filter((x) => x.ketLuan === "chon")) {
		const cdc = chuDeChon.find((x) => x.id === kl.id);
		const mt = mtMoi.find((x) => x.id === cdc?.objectiveId);
		if (mt?.whyNow !== kl.lyDo)
			console.log(
				`  E16: whyNow «${mt?.whyNow ?? ""}» khac ly do da go «${kl.lyDo}»`,
			);
		kiem(
			`E16: whyNow cua muc tieu tu «${kl.ten}» bang ly do da go`,
			mt?.whyNow === kl.lyDo,
		);
	}
	const mt3 = chuDeChon.find((x) => x.id === cd3.id)?.objectiveId;
	await bam(c, `[data-khoi='viet-truoc-roi-chon'] [data-mo-muc-tieu='${mt3}']`);
	await doi(
		c,
		"E15 buoc 6: khung muc tieu nhap tai xong",
		(i) =>
			document
				.querySelector(`[data-okr-sheet='${i}']`)
				?.getAttribute("data-trang-thai") === "ST-sheet-nhap",
		mt3,
	);
	await bam(c, `[aria-label='${CHU_OKR.sheet.menu}']`);
	await bamChu(c, "[role='menuitem']", CHU_OKR.sheet.sua);
	await coMat(
		c,
		`[data-hop-thoai-muc-tieu='${mt3}'] textarea[id$='-vi-sao']`,
		"E15 buoc 6: o Vi sao luc nay",
	);
	const viSaoMan = await c.evaluate(
		(i) =>
			document.querySelector(
				`[data-hop-thoai-muc-tieu='${i}'] textarea[id$='-vi-sao']`,
			)?.value ?? null,
		mt3,
	);
	kiem(
		`E15 buoc 6: «Vì sao lúc này» cua muc tieu nhap bang ly do da go (thay «${(viSaoMan ?? "").slice(0, 40)}…»)`,
		viSaoMan === GO.lyDoChon,
	);
	await chup(c, "buoc-ket-qua.png");
	await c.keyboard.press("Escape");
	await c.close();
	const k390 = await moTrang("quanTri", DO.hep, duongHoiY(NAM_KE));
	await choTrangThai(k390, "ket-qua", "E15 buoc 6 (390)");
	await cuonToi(k390, "[data-khoi='viet-truoc-roi-chon']");
	await chup(k390, "buoc-ket-qua-390.png");
	await k390.close();

	nhom = "E15 buoc 7";
	const hieuTruoc = await db.okrHoiYHieu.count({
		where: { hoiYId: h.id, userId: id.M },
	});
	const m = await moTrang("M", DO.hep, duongHoiY(NAM_KE));
	await choTrangThai(m, "ket-qua", "E15 buoc 7");
	const yCuaM = await db.okrY.findMany({
		where: { hoiYId: h.id, tacGiaUserId: id.M },
		select: { id: true, chuDe: { select: { ketLuan: true, lyDo: true } } },
	});
	const hanhTrinh = await m.evaluate(
		(ids) =>
			ids.map((yid) => {
				const it = window.__tim(
					`[data-khoi='y-cua-ban-ket-qua'] [data-y='${yid}']`,
				)[0];
				const buoc = [...(it?.querySelectorAll("[data-buoc]") ?? [])].map(
					(b) => ({
						khoa: b.getAttribute("data-buoc"),
						ngay: !!b
							.querySelector("[data-slot='timeline-date']")
							?.innerText.trim(),
					}),
				);
				const lyDo = it?.querySelector("[data-khoi='ly-do'] p");
				let cat = false;
				for (let e = lyDo; e; e = e.parentElement) {
					const cs = getComputedStyle(e);
					if (cs.webkitLineClamp !== "none" || cs.textOverflow === "ellipsis")
						cat = true;
				}
				return {
					id: yid,
					buoc,
					lyDo: lyDo?.textContent ?? null,
					cat,
				};
			}),
		yCuaM.map((y) => y.id),
	);
	for (const y of yCuaM) {
		const ht = hanhTrinh.find((x) => x.id === y.id);
		const mong =
			y.chuDe?.ketLuan === "chon"
				? ["gop", "vao-chu-de", "ket-luan", "muc-tieu-nhap"]
				: y.chuDe
					? ["gop", "vao-chu-de", "ket-luan"]
					: ["gop"];
		kiem(
			`E15 buoc 7: y ${y.id} co hanh trinh ${mong.join(" · ")} co ngay (thay ${JSON.stringify(ht?.buoc)})`,
			JSON.stringify(ht?.buoc.map((b) => b.khoa)) === JSON.stringify(mong) &&
				(ht?.buoc ?? []).every((b) => b.ngay),
		);
		if (y.chuDe?.lyDo)
			kiem(
				`E15 buoc 7: ly do cua y ${y.id} nguyen van va du, khong cat (${ht?.lyDo?.length ?? 0}/${y.chuDe.lyDo.length} ky tu, cat ${ht?.cat})`,
				ht?.lyDo === y.chuDe.lyDo && ht.cat === false,
			);
	}
	kiem(
		"E15 buoc 7: y M da gom co ly do da go o buoc 5",
		hanhTrinh.some((x) => x.id === yGom.id && x.lyDo === GO.lyDoChon),
	);
	await cuonToi(m, "[data-khoi='y-cua-ban-ket-qua']");
	await bam(m, "[data-nut='hieu-vi-sao']");
	await doi(
		m,
		`E15 buoc 7: dong «${CHU.ketQua.daHieu}»`,
		(c2) =>
			(window.__tim("[data-khoi='da-hieu']")[0]?.innerText ?? "").includes(c2),
		CHU.ketQua.daHieu,
	);
	await chup(m, "buoc-hieu.png");
	await m.close();
	const hieu = await db.okrHoiYHieu.count({
		where: { hoiYId: h.id, userId: id.M },
	});
	kiem(
		`E16: dung mot okrHoiYHieu cua thanh vien M (truoc ${hieuTruoc}, sau ${hieu})`,
		hieuTruoc === 0 && hieu === 1,
	);
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
	for (const [nhomChay, fn] of [
		["E12", nhomE12],
		["E15", nhomE15],
	]) {
		if (!chon(nhomChay)) continue;
		const b = Date.now();
		try {
			await fn();
		} catch (e) {
			hong.push(`${nhomChay}: nem ${String(e?.stack ?? e).slice(0, 600)}`);
		} finally {
			await donDep().catch((e) =>
				hong.push(`don dep ${nhomChay}: ${String(e).slice(0, 400)}`),
			);
		}
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
	writeFileSync(join(TAM, "man-hoi-y-network.txt"), mang.join("\n"));
	console.log(
		`man-hoi-y: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh (${anh.join(", ")}), ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	console.log(`  anh o ${relative(GOC, TAM)}/`);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
	chepBangChung();
}
await ket(ma);
