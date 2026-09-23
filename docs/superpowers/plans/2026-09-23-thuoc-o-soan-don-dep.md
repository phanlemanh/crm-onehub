# Thước o-soan.mjs dọn sạch mọi lối thoát — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `o-soan.mjs` không để lại dấu mốc, hội thoại hay Chrome ở bất kỳ lối thoát nào; chặn cây bằng `canhCay`; `NGUOI` bắt buộc; token và màu một nguồn.

**Architecture:** Bộ đo phá-thử (`rang/pha-thu.mjs`) viết TRƯỚC, đỏ trên bản hiện tại; rồi sửa `o-soan.mjs` thành một lối ra duy nhất (`khongDo` ném, `donDep()` chạy một lần, tự bắt SIGINT/SIGTERM); rồi thêm tiền tố `NGUOI` vào ba dòng `Chay:` của hồ sơ đã ký.

**Tech Stack:** bun, puppeteer-core, Prisma (`packages/db`), node:http.

**Spec:** `docs/superpowers/specs/2026-09-23-thuoc-o-soan-don-dep-design.md`

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Hằng tinh chỉnh được sống trong `rang/cau-hinh.mjs`, không rải trong tệp dùng.
- Không sửa tệp ngoài `_acceptance/**` (AC-8).
- Bản gốc = `o-soan.mjs` ở `7cf69d6a049cccfce3f0f16324a3d9112d834551`.
- Người đo mặc định trong lệnh: `NGUOI=${NGUOI:-dev@localhost}`.

---

### Task 1: Bộ đo phá-thử (RED)

independent: false · phục vụ E1–E9

**Files:**
- Create: `_acceptance/thuoc-o-soan-don-dep/rang/cau-hinh.mjs`
- Create: `_acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs`
- Modify: `_acceptance/config.yaml` (khoá `executors.script.tosd_*`)

**Interfaces:**
- Produces: `bun pha-thu.mjs --ca <ca,...>`; ca ∈ `khac-cay giua-gieo sau-gieo sau-chrome loi-la sigterm sigint sigkill thieu-nguoi token mau pham-vi steps-cu that`; in mỗi hàng `DUNG|SAI <ban> — <thông điệp ghim>`; mã 0 hết DUNG, 1 có SAI, 2 `TIEN DE:`.
- Mốc chèn: `giua-gieo` trước dòng `const [suKien] = MAU;` · `sau-gieo` sau dòng có `await gieo()` · `sau-chrome` sau dòng `});` đầu tiên sau `puppeteer.launch(`. Task 2 PHẢI giữ ba mốc này.

- [ ] **Step 1: Viết `cau-hinh.mjs`**

```js
const GIAY_MS = 1000;

export const PHA_THU = Object.freeze({
	goc: "7cf69d6a049cccfce3f0f16324a3d9112d834551",
	rang: "_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs",
	evalsCu: "_acceptance/o-soan-va-ly-do-loi/evals.yaml",
	dispatch: "apps/agent/agent/lib/custom-agent-dispatch.ts",
	congKhai: "apps/app/public",
	chayRieng: ".acceptance-runs/thuoc-o-soan-don-dep",
	bangChungThat: "_acceptance/thuoc-o-soan-don-dep/evidence",
	bangChungCu: "_acceptance/o-soan-va-ly-do-loi/evidence",
	nhanhChinh: "origin/onehub",
	nguoi: "dev@localhost",
	tieuDe: "o-soan do",
	dauMoc: ["canh-cay-", "o-soan-canh-"],
	cheDoThat: { E1: "con-tro", E2: "go-chu", E8: "chup" },
	lenhTienDe: "bun scripts/lan-do/tien-de.mjs",
	tienToNguoi: "NGUOI=${NGUOI:-dev@localhost} ",
	sanSang: "PHA-THU SAN SANG",
	han: {
		luotMs: 60 * GIAY_MS,
		sanSangMs: 45 * GIAY_MS,
		thieuNguoiMs: 30 * GIAY_MS,
		thatMs: 600 * GIAY_MS,
		choChromeMs: 1 * GIAY_MS,
	},
});
```

- [ ] **Step 2: Viết `pha-thu.mjs`**

```js
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../../../packages/db/src/client.ts";
import { PHA_THU } from "./cau-hinh.mjs";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CONG_KHAI = join(GOC, PHA_THU.congKhai);
const CHAY = join(GOC, PHA_THU.chayRieng);
const THU_MUC_RANG = dirname(join(GOC, PHA_THU.rang));
const HAN = PHA_THU.han;
const TREO = `console.log("${PHA_THU.sanSang}"); await new Promise(() => setInterval(() => {}, ${HAN.luotMs}));`;

class TienDe extends Error {}

function tienDe(cau) {
	throw new TienDe(cau);
}

function git(...thamSo) {
	return execFileSync("git", thamSo, { cwd: GOC, encoding: "utf8" });
}

function nguonBan(ban) {
	return ban === "goc"
		? git("show", `${PHA_THU.goc}:${PHA_THU.rang}`)
		: readFileSync(join(GOC, PHA_THU.rang), "utf8");
}

function tuyetDoiHoa(nguon) {
	return nguon.replace(
		/(from\s+)"(\.{1,2}\/[^"]+)"/g,
		(_, dau, duong) => `${dau}"${resolve(THU_MUC_RANG, duong)}"`,
	);
}

const MOC = {
	"giua-gieo": { tim: /const \[suKien\] = MAU;/, truoc: true },
	"sau-gieo": { tim: /await gieo\(\)/ },
	"sau-chrome": { tim: /puppeteer\.launch\(/, denDong: "});" },
};

function chen(nguon, tenMoc, dong) {
	const moc = MOC[tenMoc];
	const cac = nguon.split("\n");
	const i = cac.findIndex((d) => moc.tim.test(d));
	if (i < 0) tienDe(`moc ${tenMoc} khong co trong ban rang`);
	const j = moc.denDong
		? cac.findIndex((d, k) => k > i && d.trim() === moc.denDong)
		: i;
	if (j < 0) tienDe(`moc ${tenMoc}: khong thay dong ${moc.denDong}`);
	const viTri = moc.truoc ? i : j + 1;
	return [...cac.slice(0, viTri), dong, ...cac.slice(viTri)].join("\n");
}

const CA = {
	"khac-cay": {
		mayChu: "khac",
		sua: {
			ma: 2,
			dong: (app) =>
				`KHONG DO DUOC: may chu o ${app} khong phuc vu cay dang xet.`,
		},
		goc: "dau moc",
	},
	"giua-gieo": {
		moc: "giua-gieo",
		chen: 'khongDo("pha-thu giua-gieo");',
		sua: { ma: 2, dong: () => "KHONG DO DUOC: pha-thu giua-gieo" },
		goc: "hoi thoai",
	},
	"sau-gieo": {
		moc: "sau-gieo",
		chen: 'khongDo("pha-thu sau-gieo");',
		sua: { ma: 2, dong: () => "KHONG DO DUOC: pha-thu sau-gieo" },
		goc: "hoi thoai",
	},
	"sau-chrome": {
		moc: "sau-chrome",
		chen: 'khongDo("pha-thu sau-chrome");',
		sua: { ma: 2, dong: () => "KHONG DO DUOC: pha-thu sau-chrome" },
		goc: "hoi thoai",
	},
	"loi-la": {
		moc: "sau-chrome",
		chen: 'throw new Error("pha-thu loi la");',
		sua: { ma: 2, chua: "pha-thu loi la" },
		goc: "hoi thoai",
	},
	sigterm: {
		moc: "sau-chrome",
		chen: TREO,
		tinHieu: "SIGTERM",
		sua: { ma: 143 },
		goc: "hoi thoai",
	},
	sigint: {
		moc: "sau-chrome",
		chen: TREO,
		tinHieu: "SIGINT",
		sua: { ma: 130 },
		goc: "hoi thoai",
	},
	"thieu-nguoi": {
		khongNguoi: true,
		han: HAN.thieuNguoiMs,
		sua: { ma: 2, chua: "NGUOI" },
		goc: "khong chan",
	},
};

function saoThuMucKhac() {
	const khac = mkdtempSync(join(tmpdir(), "pha-thu-cay-khac-"));
	for (const ten of readdirSync(CONG_KHAI)) {
		const duong = join(CONG_KHAI, ten);
		const laDauMoc = PHA_THU.dauMoc.some((d) => ten.startsWith(d));
		if (!laDauMoc && statSync(duong).isFile())
			copyFileSync(duong, join(khac, ten));
	}
	if (!readdirSync(khac).some((t) => t.endsWith(".svg")))
		tienDe("thu muc cay khac khong co tep .svg doi chung");
	return khac;
}

async function moMayChu(kieu) {
	const khac = kieu === "khac" ? saoThuMucKhac() : null;
	const thuMuc = khac ?? CONG_KHAI;
	const may = createServer((yeu, tra) => {
		const ten = decodeURIComponent(
			new URL(yeu.url ?? "/", "http://pha-thu").pathname.slice(1),
		);
		const duong = join(thuMuc, ten);
		const coTep =
			ten !== "" &&
			!ten.includes("/") &&
			existsSync(duong) &&
			statSync(duong).isFile();
		if (!coTep) {
			tra.writeHead(404);
			tra.end();
			return;
		}
		tra.writeHead(200);
		tra.end(readFileSync(duong));
	});
	await new Promise((xong) => may.listen(0, "127.0.0.1", xong));
	return {
		url: `http://127.0.0.1:${may.address().port}`,
		dong: async () => {
			may.closeAllConnections();
			await new Promise((xong) => may.close(xong));
			if (khac) rmSync(khac, { recursive: true, force: true });
		},
	};
}

function chayCon(lenh, env, tinHieu, han) {
	return new Promise((xong) => {
		const con = spawn(lenh[0], lenh.slice(1), {
			cwd: GOC,
			env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let ra = "";
		let daGui = false;
		let quaHan = false;
		con.stdout.on("data", (manh) => {
			ra += manh;
			if (tinHieu && !daGui && ra.includes(PHA_THU.sanSang)) {
				daGui = true;
				con.kill(tinHieu);
			}
		});
		con.stderr.on("data", (manh) => {
			ra += manh;
		});
		const hen = setTimeout(() => {
			quaHan = true;
			con.kill("SIGKILL");
		}, han);
		con.on("close", (ma, tin) => {
			clearTimeout(hen);
			xong({ ma, tin, ra, daGui, quaHan });
		});
	});
}

function cho(ms) {
	return new Promise((xong) => setTimeout(xong, ms));
}

async function timVatSot(truocCong, batDau, tam) {
	const tep = readdirSync(CONG_KHAI).filter((f) => !truocCong.has(f));
	const hoiThoai = await db.agentConversation.findMany({
		where: { title: PHA_THU.tieuDe, createdAt: { gte: batDau } },
		select: { id: true },
	});
	const chrome = execFileSync("ps", ["-axo", "pid=,command="], {
		encoding: "utf8",
	})
		.split("\n")
		.map((d) => d.trim())
		.filter((d) => d.includes(tam))
		.map((d) => Number(d.split(/\s+/)[0]));
	return {
		"dau moc": tep,
		"hoi thoai": hoiThoai.map((h) => h.id),
		chrome,
	};
}

async function donVatSot(sot) {
	for (const f of sot["dau moc"]) rmSync(join(CONG_KHAI, f), { force: true });
	if (sot["hoi thoai"].length > 0)
		await db.agentConversation.deleteMany({
			where: { id: { in: sot["hoi thoai"] } },
		});
	for (const pid of sot.chrome) {
		try {
			process.kill(pid, "SIGKILL");
		} catch (loi) {
			if (loi?.code !== "ESRCH") throw loi;
		}
	}
}

async function chayVaThu(lenh, env, tinHieu, han) {
	const tam = mkdtempSync(join(tmpdir(), "pha-thu-luot-"));
	const truocCong = new Set(readdirSync(CONG_KHAI));
	const batDau = new Date();
	try {
		const ket = await chayCon(lenh, { ...env, TMPDIR: tam }, tinHieu, han);
		await cho(HAN.choChromeMs);
		const sot = await timVatSot(truocCong, batDau, tam);
		await donVatSot(sot);
		return { ...ket, sot };
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

async function chayBan({ ten, ban, nguon, ca }) {
	const thuMuc = join(CHAY, `${ban}-${ten}`);
	rmSync(thuMuc, { recursive: true, force: true });
	mkdirSync(thuMuc, { recursive: true });
	const tep = join(thuMuc, "o-soan.mjs");
	writeFileSync(tep, nguon);
	const may = await moMayChu(ca.mayChu ?? "dung");
	const env = {
		...process.env,
		APP_URL: may.url,
		BANG_CHUNG: join(thuMuc, "evidence"),
		NGUOI: PHA_THU.nguoi,
	};
	if (ca.khongNguoi) delete env.NGUOI;
	const han = ca.han ?? (ca.tinHieu ? HAN.sanSangMs : HAN.luotMs);
	try {
		const ket = await chayVaThu(["bun", tep, "con-tro"], env, ca.tinHieu, han);
		if (ca.tinHieu && !ket.daGui)
			tienDe(`${ban} ${ten}: khong thay ${PHA_THU.sanSang} trong ${han}ms`);
		return { ...ket, app: may.url };
	} finally {
		await may.dong();
	}
}

function dongKhongDo(ra) {
	return ra.split("\n").filter((d) => d.startsWith("KHONG DO DUOC:"));
}

function xetSua(ten, ca, ket) {
	const loi = [];
	if (ket.quaHan) loi.push(`qua han, bi giet`);
	if (ket.ma !== ca.sua.ma)
		loi.push(`thoat ${ket.ma ?? ket.tin}, mong ${ca.sua.ma}`);
	const cac = dongKhongDo(ket.ra);
	if (ca.sua.dong && !cac.includes(ca.sua.dong(ket.app)))
		loi.push(`thieu dong ${JSON.stringify(ca.sua.dong(ket.app))}`);
	if (ca.sua.chua && !cac.some((d) => d.includes(ca.sua.chua)))
		loi.push(`khong dong KHONG DO DUOC nao co ${ca.sua.chua}`);
	for (const [vat, ds] of Object.entries(ket.sot))
		if (ds.length > 0) loi.push(`${ten}: sot ${vat} (${ds.join(", ")})`);
	return loi;
}

function xetGoc(ten, ca, ket) {
	if (ca.goc === "khong chan") {
		const chan = dongKhongDo(ket.ra).some((d) => d.includes("NGUOI"));
		return !chan && ket.sot["hoi thoai"].length > 0
			? `${ten}: khong chan`
			: null;
	}
	return ket.sot[ca.goc].length > 0 ? `${ten}: sot ${ca.goc}` : null;
}

async function caChay(ten) {
	const ca = CA[ten];
	const hang = [];
	for (const ban of ["sua", "goc"]) {
		const goc = tuyetDoiHoa(nguonBan(ban));
		const nguon = ca.moc ? chen(goc, ca.moc, ca.chen) : goc;
		const ket = await chayBan({ ten, ban, nguon, ca });
		if (ban === "sua") {
			const loi = xetSua(ten, ca, ket);
			if (ca.khongNguoi && nguonBan("sua").includes("@onemount.com"))
				loi.push(`${ten}: tep con email ghi cung`);
			hang.push(
				...(loi.length === 0
					? [`DUNG sua — ${ten}: thoat ${ket.ma}, 0 vat sot`]
					: loi.map((l) => `SAI sua — ${l}`)),
			);
		} else {
			const chi = xetGoc(ten, ca, ket);
			hang.push(
				chi
					? `DUNG goc — ${chi}`
					: `SAI goc — ${ten}: chieu do khong hien (thoat ${ket.ma ?? ket.tin})`,
			);
		}
	}
	return hang;
}

async function caSigkill() {
	const nguon = chen(tuyetDoiHoa(nguonBan("sua")), "sau-chrome", TREO);
	const ket = await chayBan({
		ten: "sigkill",
		ban: "sua",
		nguon,
		ca: { tinHieu: "SIGKILL" },
	});
	return ["chrome", "hoi thoai"].map((vat) =>
		ket.sot[vat].length > 0
			? `DUNG doi-chung — sigkill: sot ${vat}`
			: `SAI doi-chung — thuoc vat sot mu (${vat})`,
	);
}

export function xetToken(nguon) {
	const dich = join(GOC, PHA_THU.dispatch);
	const coNhap = [
		...nguon.matchAll(/import\s*\{([^}]*)\}\s*from\s*"([^"]+)"/g),
	].some(
		([, ten, duong]) =>
			ten
				.split(",")
				.map((t) => t.trim())
				.includes("builderToken") &&
			duong.startsWith(".") &&
			resolve(THU_MUC_RANG, duong) === dich,
	);
	return coNhap && !nguon.includes("builder:")
		? null
		: "token: builder viet tay";
}

export function xetMau(nguon) {
	const lay = (ten) =>
		nguon.match(new RegExp(`^const ${ten} = (.+);$`, "m"))?.[1];
	const mang = lay("MAU_CON_TRO_RGB");
	const chuoi = lay("MAU_CON_TRO");
	if (!mang || !chuoi) return "mau: khong thay khai bao";
	if (!/\bMAU_CON_TRO_RGB\b/.test(chuoi)) return "mau: khai hai lan";
	const [m, c] = new Function(
		`const MAU_CON_TRO_RGB = ${mang}; const MAU_CON_TRO = ${chuoi}; return [MAU_CON_TRO_RGB, MAU_CON_TRO];`,
	)();
	return c === `rgb(${m.join(", ")})`
		? null
		: `mau: chuoi ${c} lech mang ${JSON.stringify(m)}`;
}

function caTinh(ten, xet) {
	const sua = xet(nguonBan("sua"));
	const goc = xet(nguonBan("goc"));
	return [
		sua === null ? `DUNG sua — ${ten}: dat` : `SAI sua — ${sua}`,
		goc === null
			? `SAI goc — ${ten}: chieu do khong hien`
			: `DUNG goc — ${goc}`,
	];
}

function globT1() {
	const cfg = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
	const khoi = cfg.split("t1_skip_globs:")[1]?.split(/\n {2}\S/)[0];
	if (!khoi) tienDe("khong doc duoc risk_tiers.t1_skip_globs");
	return [...khoi.matchAll(/^\s*-\s*"([^"]+)"/gm)].map((m) => m[1]);
}

export function ngoaiPhamVi(tep, globs) {
	return tep.filter(
		(f) =>
			!f.startsWith("_acceptance/") &&
			!globs.some((g) => new Bun.Glob(g).match(f)),
	);
}

function mocNhanh() {
	return git("merge-base", PHA_THU.nhanhChinh, "HEAD").trim();
}

function caPhamVi() {
	const globs = globT1();
	const mau = ngoaiPhamVi(
		[PHA_THU.dispatch, "_acceptance/x/contract.md", "docs/x.md"],
		globs,
	);
	const hang = [
		mau.length === 1 && mau[0] === PHA_THU.dispatch
			? `DUNG doi-chung — pham-vi: goi ten ${PHA_THU.dispatch}`
			: `SAI doi-chung — pham-vi: mau tra ${JSON.stringify(mau)}`,
	];
	const moc = mocNhanh();
	const doi = git("diff", "--name-only", `${moc}...HEAD`)
		.split("\n")
		.filter(Boolean);
	const ngoai = ngoaiPhamVi(doi, globs);
	hang.push(
		ngoai.length === 0
			? `DUNG sua — pham-vi: ${doi.length} tep doi tu ${moc.slice(0, 8)}, 0 ngoai _acceptance va T1`
			: `SAI sua — pham-vi: doi ngoai _acceptance va T1: ${ngoai.join(", ")}`,
	);
	return hang;
}

function idKhoi(dong, i) {
	for (let k = i; k >= 0; k--) {
		const m = dong[k].match(/^\s*- id: (E\d+)\s*$/);
		if (m) return m[1];
	}
	return null;
}

const CHO_CHAY = `Chay: ${PHA_THU.lenhTienDe}`;
const CHO_CHAY_MOI = `Chay: ${PHA_THU.tienToNguoi}${PHA_THU.lenhTienDe}`;

export function apDungTienTo(cu) {
	const dong = cu.split("\n");
	const mong = Object.keys(PHA_THU.cheDoThat);
	return dong
		.map((d, i) =>
			d.includes(CHO_CHAY) && mong.includes(idKhoi(dong, i))
				? d.replace(CHO_CHAY, CHO_CHAY_MOI)
				: d,
		)
		.join("\n");
}

export function soSteps(cu, moi) {
	const a = cu.split("\n");
	const b = moi.split("\n");
	if (a.length !== b.length)
		return [`steps-cu: so dong doi tu ${a.length} thanh ${b.length}`];
	const mong = Object.keys(PHA_THU.cheDoThat);
	const doi = a.flatMap((d, i) => (d === b[i] ? [] : [i]));
	const khoiDoi = doi.map((i) => idKhoi(a, i));
	const loi = [];
	if (doi.length !== mong.length || !mong.every((e) => khoiDoi.includes(e)))
		loi.push(
			`steps-cu: can dung ba dong Chay doi o ${mong.join(", ")}, thay ${doi.length} (${khoiDoi.join(", ")})`,
		);
	for (const i of doi) {
		if (!a[i].includes(CHO_CHAY) || b[i] !== a[i].replace(CHO_CHAY, CHO_CHAY_MOI))
			loi.push(
				`steps-cu: doi ngoai tien to NGUOI (dong ${i + 1}, ${idKhoi(a, i)})`,
			);
	}
	return loi;
}

function caStepsCu() {
	const cu = git("show", `${mocNhanh()}:${PHA_THU.evalsCu}`);
	const moi = readFileSync(join(GOC, PHA_THU.evalsCu), "utf8");
	const dung = apDungTienTo(cu);
	const bot = dung.replace("o-soan.mjs chup'", "o-soan.mjs'");
	const co = dung.replace(
		`${PHA_THU.lenhTienDe} --chay 'bun _acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs go-chu'`,
		`${PHA_THU.lenhTienDe} --bo-qua --chay 'bun _acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs go-chu'`,
	);
	const bat = (l) => l.some((x) => x.startsWith("steps-cu: doi ngoai tien to NGUOI"));
	const hang = [
		soSteps(cu, dung).length === 0
			? "DUNG doi-chung — steps-cu: mau dung khong bi goi ten"
			: `SAI doi-chung — steps-cu: mau dung bi goi ten ${soSteps(cu, dung).join("; ")}`,
		bot !== dung && bat(soSteps(cu, bot))
			? "DUNG doi-chung — steps-cu: mau bot che do chup bi goi ten"
			: "SAI doi-chung — steps-cu: mau bot che do chup khong bi goi ten",
		co !== dung && bat(soSteps(cu, co))
			? "DUNG doi-chung — steps-cu: mau them --bo-qua bi goi ten"
			: "SAI doi-chung — steps-cu: mau them --bo-qua khong bi goi ten",
	];
	const loi = soSteps(cu, moi);
	hang.push(
		...(loi.length === 0
			? ["DUNG sua — steps-cu: chi ba dong Chay doi, dung tien to NGUOI"]
			: loi.map((l) => `SAI sua — ${l}`)),
	);
	return hang;
}

function lenhChay(dong, id) {
	const i = dong.findIndex((d) => new RegExp(`^\\s*- id: ${id}\\s*$`).test(d));
	if (i < 0) tienDe(`khong thay eval ${id} trong ${PHA_THU.evalsCu}`);
	const j = dong.findIndex((d, k) => k > i && /^\s*- id: E\d+\s*$/.test(d));
	const d = dong.slice(i, j < 0 ? undefined : j).find((x) => x.includes('"Chay: '));
	if (!d) tienDe(`khong thay dong Chay cua ${id}`);
	return d.split('"Chay: ')[1].split(" — ")[0];
}

function bamThuMuc(thuMuc) {
	const bam = createHash("sha256");
	const tep = readdirSync(thuMuc, { recursive: true })
		.map(String)
		.filter((t) => statSync(join(thuMuc, t)).isFile())
		.sort();
	for (const t of tep) {
		bam.update(t);
		bam.update(readFileSync(join(thuMuc, t)));
	}
	return bam.digest("hex");
}

async function caThat() {
	if (!process.env.APP_URL || !process.env.API_URL)
		tienDe("dat APP_URL va API_URL tro may chu dev cua cay dang xet");
	const dong = readFileSync(join(GOC, PHA_THU.evalsCu), "utf8").split("\n");
	const bangChung = join(GOC, PHA_THU.bangChungThat);
	const cu = join(GOC, PHA_THU.bangChungCu);
	mkdirSync(bangChung, { recursive: true });
	const ghi = [];
	const hang = [];
	for (const [id, cheDo] of Object.entries(PHA_THU.cheDoThat)) {
		const lenh = lenhChay(dong, id);
		if (!lenh.includes(`o-soan.mjs ${cheDo}'`))
			tienDe(`dong Chay cua ${id} khong chay che do ${cheDo}: ${lenh}`);
		const bamTruoc = bamThuMuc(cu);
		const ket = await chayVaThu(
			["bash", "-lc", lenh],
			{ ...process.env, BANG_CHUNG: bangChung },
			null,
			HAN.thatMs,
		);
		const bamSau = bamThuMuc(cu);
		const dongCuoi = ket.ra.trim().split("\n").pop() ?? "";
		ghi.push({ eval: id, cheDo, lenh, ma: ket.ma, dongCuoi, sot: ket.sot, bamTruoc, bamSau });
		const loi = [];
		if (ket.ma !== 0) loi.push(`thoat ${ket.ma ?? ket.tin}`);
		if (dongCuoi !== `DAT: ${cheDo}`) loi.push(`dong cuoi ${JSON.stringify(dongCuoi)}`);
		for (const [vat, ds] of Object.entries(ket.sot))
			if (ds.length > 0) loi.push(`sot ${vat}`);
		if (bamTruoc !== bamSau) loi.push(`bang chung ho so cu bi doi`);
		hang.push(
			loi.length === 0
				? `DUNG that — ${id} ${cheDo}: DAT, 0 vat sot, bang chung cu nguyen`
				: `SAI that — ${id} ${cheDo}: ${loi.join("; ")}`,
		);
	}
	writeFileSync(join(bangChung, "that.json"), `${JSON.stringify(ghi, null, 2)}\n`);
	return hang;
}

const CAC_CA = {
	...Object.fromEntries(Object.keys(CA).map((ten) => [ten, () => caChay(ten)])),
	sigkill: caSigkill,
	token: () => caTinh("token", xetToken),
	mau: () => caTinh("mau", xetMau),
	"pham-vi": caPhamVi,
	"steps-cu": caStepsCu,
	that: caThat,
};

if (import.meta.main) {
	const i = process.argv.indexOf("--ca");
	const cacCa = (i >= 0 ? process.argv[i + 1] ?? "" : "").split(",").filter(Boolean);
	let ma = 0;
	try {
		if (cacCa.length === 0) tienDe(`thieu --ca <${Object.keys(CAC_CA).join("|")}>`);
		for (const ten of cacCa) {
			if (!CAC_CA[ten]) tienDe(`ca la: ${ten}`);
			const hang = await CAC_CA[ten]();
			for (const h of hang) console.log(h);
			if (hang.some((h) => h.startsWith("SAI"))) ma = 1;
		}
	} catch (loi) {
		console.log(
			loi instanceof TienDe
				? `TIEN DE: ${loi.message}`
				: `TIEN DE: bo do hong: ${loi?.stack ?? loi}`,
		);
		ma = 2;
	}
	await db.$disconnect();
	process.exit(ma);
}
```

- [ ] **Step 3: Chạy chiều đỏ trên bản hiện tại (bản sửa == bản gốc)**

Run: `bun _acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs --ca token,mau,pham-vi,steps-cu` rồi `--ca khac-cay,sau-gieo,sigkill`
Expected: exit 1; `SAI sua — token: builder viet tay`, `SAI sua — mau: khai hai lan`, `SAI sua — steps-cu: can dung ba dong Chay doi…`, `SAI sua — khac-cay: sot dau moc (…)`, `SAI sua — sau-gieo: sot hoi thoai (…)`; mọi hàng `goc` và `doi-chung` là DUNG, gồm `DUNG doi-chung — sigkill: sot chrome`. (Đã chạy: đúng như trên.)

- [ ] **Step 4: Commit** — `git add _acceptance/thuoc-o-soan-don-dep/rang _acceptance/config.yaml && git commit -m "test: bo do pha-thu cho thuoc o-soan"`

### Task 2: Một lối ra cho `o-soan.mjs` (GREEN)

independent: false · phục vụ E1–E7

**Files:**
- Modify: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`

**Interfaces:**
- Consumes: `canhCay()` từ `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs` → `{ ket: "dung-cay"|"khac-cay"|"khong-noi-duoc", dong: string[] }`; `builderToken(id: string): string` từ `apps/agent/agent/lib/custom-agent-dispatch.ts`.
- Produces: env `NGUOI` (bắt buộc), `BANG_CHUNG` (tuỳ chọn); mã thoát 0 DAT · 1 KHONG DAT · 2 KHONG DO DUOC/KHONG DON DUOC · 130 SIGINT · 143 SIGTERM.

- [ ] **Step 1: Thay phần đầu, `khongDo`/`chanCay`, `gieo` và thân chính** — mã đầy đủ sau khi sửa ở Step 3 dưới đây là nguồn sự thật; các hàm đo (`moTrang` … `chup`) giữ nguyên từng byte.
- [ ] **Step 2: Chạy** `bun _acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs --ca khac-cay,giua-gieo,sau-gieo,sau-chrome,loi-la,sigterm,sigint,sigkill,thieu-nguoi,token,mau` — Expected: exit 0, mọi hàng DUNG.
- [ ] **Step 3: Mã sau sửa** — xem tệp ở commit của task (không lặp lại ở đây các hàm đo không đổi).
- [ ] **Step 4: Commit** — `fix: o-soan.mjs mot loi ra, don sach moi loi thoat`

### Task 3: Tiền tố `NGUOI` cho E1/E2/E8 của hồ sơ đã ký

independent: false · phục vụ E9, E7

**Files:**
- Modify: `_acceptance/o-soan-va-ly-do-loi/evals.yaml` (ba dòng `Chay:`)

- [ ] **Step 1:** Trong khối E1, E2, E8, thay `"Chay: bun scripts/lan-do/tien-de.mjs` bằng `"Chay: NGUOI=${NGUOI:-dev@localhost} bun scripts/lan-do/tien-de.mjs` — đúng ba dòng, không đổi gì khác.
- [ ] **Step 2:** `bun _acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs --ca steps-cu,pham-vi` — Expected: exit 0.
- [ ] **Step 3: Commit** — `chore: truyen NGUOI vao steps E1/E2/E8 cua o-soan-va-ly-do-loi`

### Task 4: Khói lượt thật (không thay S4)

independent: false · phục vụ E7

- [ ] **Step 1:** Kiểm 3600/3601 rảnh; dựng api 3601 và app 3600 của cây theo `steps` E7; ghi PID.
- [ ] **Step 2:** `APP_URL=http://127.0.0.1:3600 API_URL=http://127.0.0.1:3601 bun _acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs --ca that` — Expected: exit 0, ba hàng `DUNG that`.
- [ ] **Step 3:** Giữ máy chủ cho S4 hoặc tắt bằng PID.
