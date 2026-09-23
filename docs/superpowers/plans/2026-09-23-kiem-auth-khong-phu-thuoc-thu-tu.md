# Bài kiểm packages/auth không phụ thuộc thứ tự tệp — Implementation Plan

> Hồ sơ `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/` đã tách khỏi PR #88 và không vào kho — xem `docs/findings/2026-09-23-kiem-auth-khong-phu-thuoc-thu-tu.md` (hồ sơ đầy đủ ở commit `16c47aaa`).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đo được — hai chiều, trên bản gốc trong git — rằng bài kiểm `packages/auth` xanh bất kể thứ tự tệp, và canh riêng chỗ `auth.ts` nối `hd` của Google.

**Architecture:** Mã sửa bài kiểm đã có (commit `6b66dc6f`). Plan này thêm (1) một tệp test mới nạp auth trong tiến trình con để đo chỗ nối `hd` (AC-8), (2) một bộ răng đo trong hồ sơ, chạy mọi phép đo trên bản sao gói ở thư mục ẩn `packages/auth/.sao-kat-*`, với bản «gốc» dựng từ `git show b812b65a:packages/auth/test/**`, và (3) khai executor trong `_acceptance/config.yaml`.

**Tech Stack:** bun 1.4.2 (`bun test`, `--randomize --seed`, `--reporter=junit`, `Bun.Glob`), Better Auth 1.6.25, Node `child_process`/`fs`.

**Spec:** `docs/superpowers/specs/2026-09-23-kiem-auth-khong-phu-thuoc-thu-tu-design.md` · hợp đồng `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/contract.md` · evals `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không sửa tệp nào dưới `packages/auth/src/**` (AC-6).
- Commit gốc trước bản sửa: `b812b65a46131fa40fecd7cf9f4baaaf527b40c2`.
- Env đo lấy từ khối `env:` của `.github/workflows/ci.yml`, khoá: `ALLOWED_SIGN_IN`, `BETTER_AUTH_SECRET`, `API_URL`, `APP_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — đọc từ tệp, không chép tay.
- Tạo phẩm chạy (junit) ghi vào `.acceptance-runs/kiem-auth-khong-phu-thuoc-thu-tu/` (đã gitignore), không ghi vào `_acceptance/`.
- Răng không gọi `process.exit` trong `try`: lỗi ném `Dung`, bắt ở đỉnh, để `finally` dọn bản sao (memory: exit bỏ qua finally để lại bản sao).
- Mỗi phép đo mới đi kèm cặp hai chiều trên cùng fixture, thông điệp đỏ ghim tên (MEASURE-BIRTH-CLAUSE).

---

### Task 1: Tệp test canh chỗ `auth.ts` nối `hd` (AC-8)

`independent: true` · phục vụ E11, E4 (số ca tệp mới), E8

**Files:**
- Create: `packages/auth/test/hd-cua-google.spec.ts`

**Interfaces:**
- Produces: ba ca tên `hd cua google theo danh sach "<danh sách>"` — Task 2 (chân `hd-noi`) ghim đúng chuỗi `(fail) hd cua google theo danh sach "onemount.com"`, và chân `tu-nhien` đếm testcase có `file="test/hd-cua-google.spec.ts"`.

- [ ] **Step 1: Viết test** (bảng kỳ vọng viết tay, không so với `googleHostedDomain()` để khỏi hằng đúng)

```ts
import { expect, test } from "bun:test";
import { join } from "node:path";

const GOI = join(import.meta.dir, "..");

const DOC_HD = [
	'const { auth } = await import("./src/auth");',
	"const hd = auth.options.socialProviders?.google?.hd ?? null;",
	"console.log(JSON.stringify({ hd }));",
].join("\n");

function hdKhiNap(danhSach: string): string | null {
	const ket = Bun.spawnSync(["bun", "-e", DOC_HD], {
		cwd: GOI,
		env: {
			...process.env,
			ALLOWED_SIGN_IN: danhSach,
			GOOGLE_CLIENT_ID: "hd-cua-google-client-id",
			GOOGLE_CLIENT_SECRET: "hd-cua-google-client-secret",
		},
	});
	const ra = ket.stdout.toString().trim().split("\n").at(-1) ?? "";
	if (ket.exitCode !== 0 || !ra.startsWith("{"))
		throw new Error(
			`khong nap duoc auth voi danh sach ${danhSach}: ${ket.stderr.toString()}`,
		);
	return (JSON.parse(ra) as { hd: string | null }).hd;
}

const BANG = [
	["onemount.com", "onemount.com"],
	["onemount.com,phanlemanh@gmail.com", null],
	["onemount.com,partner.com", null],
] as const;

test.each(BANG)("hd cua google theo danh sach %p", (danhSach, hd) => {
	expect([danhSach, hdKhiNap(danhSach)]).toEqual([danhSach, hd]);
});
```

- [ ] **Step 2: Chạy với auth.ts thật — phải xanh**

Run: `cd packages/auth && ALLOWED_SIGN_IN=example.com bun test test/hd-cua-google.spec.ts`
Expected: `3 pass`, `0 fail` (đã chạy prototype 2026-09-23: 3 pass).

- [ ] **Step 3: Phá-thử trên bản sao — hai đột biến phải đỏ, ghim tên ca**

```bash
cd packages/auth
for m in M1 M2; do
  S=.sao-dotbien && rm -rf $S && mkdir $S && cp -R bunfig.toml package.json tsconfig.json src test $S/
  if [ $m = M1 ]; then sed -i '' 's/if (hostedDomain) google.hd = hostedDomain;/google.hd = "sai.example.com";/' $S/src/auth.ts
  else sed -i '' '/if (hostedDomain) google.hd = hostedDomain;/d' $S/src/auth.ts; fi
  (cd $S && bun test test/hd-cua-google.spec.ts 2>&1 | grep -E '^\(fail\)')
done; rm -rf .sao-dotbien
```
Expected: mỗi đột biến in `(fail) hd cua google theo danh sach "onemount.com"` (prototype: M1 đỏ 3/3, M2 đỏ 1/3).

- [ ] **Step 4: Commit**

```bash
git add packages/auth/test/hd-cua-google.spec.ts
git commit -m "test(auth): canh cho auth.ts noi hd cua Google theo danh sach cho phep"
```

---

### Task 2: Răng đo của hồ sơ + khai executor

`independent: false` (chân `hd-noi` cần Task 1) · phục vụ E1, E2, E3, E4, E10, E11

**Files:**
- Create: `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/chung.mjs`
- Create: `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs`
- Modify: `_acceptance/config.yaml` (sáu khoá `executors.script.kat_*`, qua `config-patch.mjs`)
- Modify (chỉ sau khi Cổng 1.5 duyệt đổi chữ AC-6): `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/contract.md` dòng AC-6 + một entry sổ quyết định

**Interfaces:**
- Consumes: Task 1 — tên ca `hd cua google theo danh sach "onemount.com"`, tệp `test/hd-cua-google.spec.ts`.
- Produces: lệnh `bun _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs --chan <cap|tra-env|seed|tu-nhien|pham-vi|hd-noi>`; exit 0 = đạt, 1 = răng đỏ/cùn, 2 = tiền đề mất. Biến `KAT_GOC` (tuỳ chọn) đổi commit gốc — chỉ dùng cho phá-thử.

- [ ] **Step 1: Viết `rang/chung.mjs`**

```js
import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const AUTH = join(ROOT, "packages/auth");
export const RA = join(ROOT, ".acceptance-runs/kiem-auth-khong-phu-thuoc-thu-tu");

export const KAT = {
	goc: "b812b65a46131fa40fecd7cf9f4baaaf527b40c2",
	seed: { tran: 20, can: 2 },
	khoaCi: ["ALLOWED_SIGN_IN", "BETTER_AUTH_SECRET", "API_URL", "APP_URL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
	tepDoiEnv: [
		"cau-tu-choi.spec.ts",
		"cong-vao.integration.spec.ts",
		"hosted-domain.spec.ts",
		"tu-choi-khong-de-lai-hang.integration.spec.ts",
	],
	tepChia: "chia-mat-khau.integration.spec.ts",
	tepMoi: "test/hd-cua-google.spec.ts",
	nhomGoogle: "cua-google-con-song",
	haiCa: [
		"nguoi trong danh sach duoc vao dang nhap that bang google thi tao duoc phien",
		"co ca hai cua thi van la mot hang nguoi dung, va phien vao duoc",
	],
	logHd: 'does not satisfy the configured "hd" option "example.com"',
	mocHd: "if (hostedDomain) google.hd = hostedDomain;",
	caOnemount: '(fail) hd cua google theo danh sach "onemount.com"',
};

export class Dung extends Error {
	constructor(ma, thongDiep) {
		super(thongDiep);
		this.ma = ma;
	}
}

export function dung(ma, thongDiep) {
	throw new Dung(ma, thongDiep);
}

export function git(thamSo) {
	return execFileSync("git", ["-C", ROOT, ...thamSo], { encoding: "utf8", maxBuffer: 64 << 20 });
}

export const GOC = git(["rev-parse", process.env.KAT_GOC ?? KAT.goc]).trim();

export function envCi() {
	const yml = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
	const env = {};
	for (const khoa of KAT.khoaCi) {
		const m = yml.match(new RegExp(`^\\s+${khoa}:\\s*(\\S+)\\s*$`, "m"));
		if (!m) dung(2, `TIEN DE: ci.yml khong con khoa ${khoa} trong khoi env`);
		env[khoa] = m[1];
	}
	return env;
}

export function saoChep(ban) {
	const sao = join(AUTH, `.sao-kat-${ban}-${randomBytes(4).toString("hex")}`);
	mkdirSync(sao);
	for (const muc of ["bunfig.toml", "package.json", "tsconfig.json", "src"])
		cpSync(join(AUTH, muc), join(sao, muc), { recursive: true });
	if (ban === "sua") {
		cpSync(join(AUTH, "test"), join(sao, "test"), { recursive: true });
		return sao;
	}
	for (const tep of git(["ls-tree", "-r", "--name-only", GOC, "packages/auth/test"]).trim().split("\n")) {
		const dich = join(sao, tep.slice("packages/auth/".length));
		mkdirSync(dirname(dich), { recursive: true });
		writeFileSync(dich, git(["show", `${GOC}:${tep}`]));
	}
	return sao;
}

export function donSao(sao) {
	rmSync(sao, { recursive: true, force: true });
}

export function chayBun(noi, thamSo, envThem = {}) {
	const ket = spawnSync("bun", thamSo, {
		cwd: noi,
		env: { ...process.env, ...envCi(), ...envThem },
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
	return { ma: ket.status, ra: `${ket.stdout}${ket.stderr}` };
}

const XML = { "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&amp;": "&" };

function moXml(s) {
	return s.replace(/&(lt|gt|quot|apos|amp);/g, (m) => XML[m]);
}

function thuocTinh(chuoi, ten) {
	const m = chuoi.match(new RegExp(`\\b${ten}="([^"]*)"`));
	return m ? moXml(m[1]) : "";
}

export function junit(noi, thamSo, envThem = {}) {
	mkdirSync(RA, { recursive: true });
	const duong = join(RA, `junit-${randomBytes(4).toString("hex")}.xml`);
	const chay = chayBun(noi, ["test", ...thamSo, "--reporter=junit", `--reporter-outfile=${duong}`], envThem);
	const xml = readFileSync(duong, "utf8");
	const goc = xml.match(/<testsuites [^>]*>/)?.[0] ?? "";
	return {
		...chay,
		tong: Number(thuocTinh(goc, "tests")),
		hong: Number(thuocTinh(goc, "failures")),
		bo: Number(thuocTinh(goc, "skipped")),
		thuTu: [...xml.matchAll(/<testsuite name="test\/([^"]+)" file=/g)].map((m) => m[1]),
		ca: [...xml.matchAll(/<testcase ([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)].map((m) => ({
			ten: thuocTinh(m[1], "name"),
			nhom: thuocTinh(m[1], "classname"),
			tep: thuocTinh(m[1], "file"),
			hong: /<failure/.test(m[3] ?? ""),
			bo: /<skipped/.test(m[3] ?? ""),
		})),
	};
}

export function haiCaGoogle(ket) {
	return ket.ca.filter((c) => c.nhom === KAT.nhomGoogle && KAT.haiCa.includes(c.ten));
}
```

- [ ] **Step 2: Viết `rang/thu-tu-tep.mjs`**

```js
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AUTH, chayBun, donSao, Dung, dung, GOC, git, haiCaGoogle, junit, KAT, ROOT, saoChep } from "./chung.mjs";

const CANH = [
	'import { afterAll } from "bun:test";',
	"const goc = process.env.ALLOWED_SIGN_IN;",
	"afterAll(() => {",
	"\tconst sau = process.env.ALLOWED_SIGN_IN;",
	"\tif (sau !== goc) throw new Error(`ENV-RO ${goc} -> ${sau}`);",
	"\tconsole.log(`ENV-GIU ${goc}`);",
	"});",
	"",
].join("\n");

function demCa(ca) {
	const hong = ca.filter((c) => c.hong).length;
	const bo = ca.filter((c) => c.bo).length;
	return { xanh: ca.length - hong - bo, hong, bo };
}

function cap() {
	const loi = [];
	let o = 0;
	for (const ban of ["sua", "goc"]) {
		const sao = saoChep(ban);
		try {
			mkdirSync(join(sao, "test/.do-cap"));
			for (const tep of KAT.tepDoiEnv) {
				writeFileSync(join(sao, "test/.do-cap/do.spec.ts"), `import "../${tep}";\nimport "../${KAT.tepChia}";\n`);
				const ket = junit(sao, ["./test/.do-cap/do.spec.ts"]);
				const ca = haiCaGoogle(ket);
				const ten = `${ban} ${tep} -> ${KAT.tepChia}`;
				if (ca.length !== 2) dung(2, `TIEN DE: ${ten} co ${ca.length}/2 ca ${KAT.nhomGoogle}`);
				const d = demCa(ca);
				o++;
				console.log(`${ten}: ${d.xanh} xanh, ${d.hong} do, ${d.bo} bo qua`);
				if (ban === "sua" && d.xanh !== 2) loi.push(`RANG DO: ${ten} — ban sua khong xanh du hai ca`);
				if (ban === "goc" && d.hong !== 2) dung(2, `TIEN DE: ${ten} — ban goc khong do du hai ca, cap nay khong tai hien loi`);
				if (ban === "goc" && !ket.ra.includes(KAT.logHd)) loi.push(`RANG CUN: ${ten} do nhung log khong co '${KAT.logHd}'`);
			}
		} finally {
			donSao(sao);
		}
	}
	if (o !== 8) dung(1, `ma tran lech: ${o}/8 o`);
	if (loi.length) dung(1, loi.join("\n"));
	console.log("kat cap: 8/8 o dung — ban sua xanh ca bon cap, ban goc do ca bon cap");
}

function traEnv() {
	const ro = {};
	let toanGoi = "";
	for (const ban of ["goc", "sua"]) {
		const sao = saoChep(ban);
		try {
			writeFileSync(join(sao, "canh-env.ts"), CANH);
			ro[ban] = [];
			for (const t of readdirSync(join(sao, "test")).filter((t) => t.endsWith(".spec.ts")).sort()) {
				const { ra } = chayBun(sao, ["test", "--preload", "./canh-env.ts", `./test/${t}`], { ALLOWED_SIGN_IN: "example.com" });
				const roRa = ra.includes("ENV-RO example.com ->");
				if (roRa === ra.includes("ENV-GIU example.com")) dung(2, `TIEN DE: ${ban} ${t} — canh env khong noi ro`);
				console.log(`${ban} ${t}: ${roRa ? "RO" : "giu"}`);
				if (roRa) ro[ban].push(t);
			}
			if (ban === "sua")
				toanGoi = chayBun(sao, ["test", "--preload", "./canh-env.ts"], { ALLOWED_SIGN_IN: "example.com" }).ra;
		} finally {
			donSao(sao);
		}
	}
	const loi = [];
	if (ro.goc.join(",") !== KAT.tepDoiEnv.join(","))
		loi.push(`RANG CUN: tap ro o ban goc ${JSON.stringify(ro.goc)} khac ${JSON.stringify(KAT.tepDoiEnv)}`);
	if (ro.sua.length) loi.push(`RANG DO: ban sua van ro env: ${JSON.stringify(ro.sua)}`);
	if (!toanGoi.includes("ENV-GIU example.com") || toanGoi.includes("ENV-RO"))
		loi.push("RANG DO: luot toan goi ban sua khong ket thuc voi ENV-GIU example.com");
	if (loi.length) dung(1, loi.join("\n"));
	console.log(`kat tra-env: ban goc ro dung ${ro.goc.length} tep, ban sua ro 0 tep, toan goi ENV-GIU example.com`);
}

function truocChia(thuTu) {
	const chia = thuTu.indexOf(KAT.tepChia);
	return chia > 0 && KAT.tepDoiEnv.some((t) => thuTu.indexOf(t) >= 0 && thuTu.indexOf(t) < chia);
}

function seed() {
	const google = chayBun(AUTH, ["-e", 'const { isGoogleConfigured } = await import("./src/env"); console.log(`GOOGLE=${isGoogleConfigured()}`);']);
	if (!google.ra.includes("GOOGLE=true")) dung(2, `TIEN DE: isGoogleConfigured() khong tra true trong env do: ${google.ra.trim()}`);
	const sao = saoChep("goc");
	const dat = [];
	const loi = [];
	try {
		for (let s = 1; s <= KAT.seed.tran && dat.length < KAT.seed.can; s++) {
			const sua = junit(AUTH, ["--randomize", `--seed=${s}`]);
			const goc = junit(sao, ["--randomize", `--seed=${s}`]);
			if (!truocChia(sua.thuTu) || !truocChia(goc.thuTu)) {
				console.log(`seed ${s}: bo qua — khong co tep doi env truoc ${KAT.tepChia} o ca hai ban`);
				continue;
			}
			dat.push(s);
			const dSua = demCa(haiCaGoogle(sua));
			const dGoc = demCa(haiCaGoogle(goc));
			console.log(`seed ${s}: ban sua ${dSua.xanh} xanh/${dSua.hong} do/${dSua.bo} bo · ban goc ${dGoc.hong} do`);
			if (dSua.xanh !== 2) loi.push(`RANG DO: seed ${s} ban sua khong xanh du hai ca ${KAT.nhomGoogle}`);
			if (dGoc.hong !== 2) loi.push(`RANG CUN: seed ${s} ban goc khong do du hai ca — phep do khong phan biet`);
		}
	} finally {
		donSao(sao);
	}
	if (dat.length < KAT.seed.can) dung(2, `TIEN DE: chi ${dat.length} seed trong 1..${KAT.seed.tran} dat tep doi env truoc ${KAT.tepChia}`);
	if (loi.length) dung(1, loi.join("\n"));
	console.log(`kat seed: seed ${dat.join(", ")} — ban sua xanh hai ca, ban goc do hai ca`);
}

function tuNhien() {
	const sua = junit(AUTH, []);
	const sao = saoChep("goc");
	let goc;
	try {
		goc = junit(sao, []);
	} finally {
		donSao(sao);
	}
	const moi = sua.ca.filter((c) => c.tep === KAT.tepMoi).length;
	console.log(`ban sua: ${sua.tong} ca, ${sua.hong} do, ${sua.bo} bo · ban goc: ${goc.tong} ca, ${goc.bo} bo · tep moi: ${moi} ca`);
	if (moi === 0) dung(2, `TIEN DE: khong thay ca nao cua ${KAT.tepMoi}`);
	const loi = [];
	if (sua.hong !== 0) loi.push(`RANG DO: ban sua co ${sua.hong} ca do`);
	if (sua.tong !== goc.tong + moi) loi.push(`RANG DO: tong ca ban sua ${sua.tong} != ban goc ${goc.tong} + tep moi ${moi}`);
	if (sua.bo > goc.bo) loi.push(`RANG DO: ban sua bo qua ${sua.bo} ca, nhieu hon ban goc ${goc.bo}`);
	if (loi.length) dung(1, loi.join("\n"));
	console.log("kat tu-nhien: 0 do, tong ca khop ban goc + tep moi, khong them ca bo qua");
}

function t1Globs() {
	const dong = readFileSync(join(ROOT, "_acceptance/config.yaml"), "utf8").split("\n");
	const dau = dong.findIndex((d) => /^\s{2}t1_skip_globs:\s*$/.test(d));
	if (dau < 0) dung(2, "TIEN DE: config.yaml khong con risk_tiers.t1_skip_globs");
	const glob = [];
	for (const d of dong.slice(dau + 1)) {
		if (/^\s{2}\S/.test(d)) break;
		const m = d.match(/^\s+-\s+"([^"]+)"/);
		if (m) glob.push(m[1]);
	}
	return glob;
}

export function ngoaiTest(danhSach, globs) {
	return danhSach.filter(
		(t) => !t.startsWith("_acceptance/") && !t.startsWith("packages/auth/test/") && !globs.some((g) => new Bun.Glob(g).match(t)),
	);
}

function phamVi() {
	const globs = t1Globs();
	const mau = ["packages/auth/test/a.spec.ts", "packages/auth/src/auth.ts", "PRODUCT-MAP.md", "_acceptance/x/contract.md"];
	const bat = ngoaiTest(mau, globs);
	if (bat.join(",") !== "packages/auth/src/auth.ts") dung(1, `RANG CUN: danh sach mau goi ten ${JSON.stringify(bat)}, ky vong ["packages/auth/src/auth.ts"]`);
	const that = git(["diff", "--name-only", GOC, "HEAD"]).trim().split("\n").filter(Boolean);
	const lot = ngoaiTest(that, globs);
	console.log(`diff ${GOC.slice(0, 8)}..HEAD: ${that.length} tep, ngoai packages/auth/test va T1: ${lot.length}`);
	if (lot.length) dung(1, `RANG DO: diff cham tep ngoai bai kiem: ${lot.join(", ")}`);
	console.log("kat pham-vi: mau goi ten dung auth.ts, diff that khong lot tep san pham");
}

const DOT_BIEN = [
	["M1 hd ngoai danh sach", 'google.hd = "sai.example.com";'],
	["M2 bo hd", ""],
];

function hdNoi() {
	const that = chayBun(AUTH, ["test", `./${KAT.tepMoi}`]);
	if (that.ma !== 0) dung(1, `RANG DO: ${KAT.tepMoi} do voi auth.ts that\n${that.ra}`);
	const loi = [];
	for (const [ten, thay] of DOT_BIEN) {
		const sao = saoChep("sua");
		try {
			const duong = join(sao, "src/auth.ts");
			const noiDung = readFileSync(duong, "utf8");
			if (!noiDung.includes(KAT.mocHd)) dung(2, `TIEN DE: auth.ts khong con moc '${KAT.mocHd}' — dot bien ${ten} khong dat duoc`);
			writeFileSync(duong, noiDung.replace(KAT.mocHd, thay));
			const { ra } = chayBun(sao, ["test", `./${KAT.tepMoi}`]);
			if (ra.includes(KAT.caOnemount)) console.log(`dot bien ${ten}: bi bat — ${KAT.caOnemount}`);
			else loi.push(`RANG CUN: dot bien ${ten} van xanh`);
		} finally {
			donSao(sao);
		}
	}
	if (loi.length) dung(1, loi.join("\n"));
	console.log("kat hd-noi: auth.ts that xanh, hai dot bien deu bi bat");
}

const CHAN = { cap, "tra-env": traEnv, seed, "tu-nhien": tuNhien, "pham-vi": phamVi, "hd-noi": hdNoi };

if (import.meta.main) {
	const i = process.argv.indexOf("--chan");
	const ten = i < 0 ? undefined : process.argv[i + 1];
	try {
		if (!CHAN[ten]) dung(2, `thu-tu-tep: dung --chan ${Object.keys(CHAN).join("|")}`);
		console.log(`thu-tu-tep --chan ${ten} · goc ${GOC.slice(0, 8)}`);
		CHAN[ten]();
	} catch (e) {
		if (!(e instanceof Dung)) throw e;
		console.log(e.message);
		process.exit(e.ma);
	}
}
```

- [ ] **Step 3: Chạy từng chân — chiều xanh**

Run (mỗi lệnh riêng, trong DB riêng của lượt):
```bash
bun run test -- "bun _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs --chan cap"
bun run test -- "bun _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs --chan tra-env"
bun run test -- "bun _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs --chan seed"
bun run test -- "bun _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs --chan tu-nhien"
bun run test -- "bun _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs --chan hd-noi"
bun _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs --chan pham-vi
```
Expected: mỗi lệnh exit 0, dòng cuối `kat <chan>: …`. `pham-vi` cần commit Task 1–2 trước (đo `git diff GOC..HEAD`).

- [ ] **Step 4: Phá-thử răng — gốc trỏ về HEAD thì răng phải kêu, không xanh**

```bash
for c in cap tra-env seed tu-nhien; do KAT_GOC=HEAD bun run test -- "bun _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs --chan $c"; echo "$c exit=$?"; done
```
Expected: `cap` exit 2 `TIEN DE: … ban goc khong do du hai ca`; `tra-env` exit 1 `RANG CUN: tap ro o ban goc []`; `seed` exit 2 `TIEN DE: chi 0 seed` hoặc exit 1 `RANG CUN: seed … ban goc khong do`; `tu-nhien` exit 1 `RANG DO: tong ca ban sua …`. `pham-vi` và `hd-noi` mang sẵn chiều đỏ bên trong (danh sách mẫu, hai đột biến). Sau lượt, `ls -a packages/auth | grep sao-kat` phải rỗng.

- [ ] **Step 5: Khai executor**

```bash
CP=/Users/manh-macmini/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.18.1/scripts/config-patch.mjs
R=_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs
for c in cap tra_env seed tu_nhien hd_noi; do
  node $CP --config _acceptance/config.yaml --key executors.script.kat_$c --value "bun run test -- \"bun $R --chan ${c//_/-}\"" --write
done
node $CP --config _acceptance/config.yaml --key executors.script.kat_pham_vi --value "bun $R --chan pham-vi" --write
```

- [ ] **Step 6: (sau Cổng 1.5) Đổi chữ AC-6** — thay «ngoài `_acceptance/**` và `docs/**`» bằng «ngoài `_acceptance/**` và các tệp T1 của kho (`risk_tiers.t1_skip_globs`)», ghi một entry `fix` stage `S2` vào `decisions.jsonl`.

- [ ] **Step 7: Commit**

```bash
git add _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang _acceptance/config.yaml _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/contract.md _acceptance/kiem-auth-khong-phu-thuoc-thu-tu/decisions.jsonl
git commit -m "chore(kiem-auth-khong-phu-thuoc-thu-tu): rang do thu tu tep va executor"
```

---

## Sau Task 2

Chạy lại `check-types`, `lint`, `lint:slop` (Task 1 thêm một tệp TS), đặt contract `status: implemented`, vào S4.
