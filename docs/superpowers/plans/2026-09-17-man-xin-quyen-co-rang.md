# Màn xin quyền có răng — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Màn `/grant-access` được máy mở ra và đọc thật ở cả hai thứ tiếng, thay vì chỉ được quét cú pháp.

**Architecture:** Một script dev gieo trạng thái thiếu quyền hộp thư vào bảng `account`, để `mailboxGrantsNeeded` trả mảng khác rỗng và màn không chuyển hướng. Một thước đứng riêng trong hồ sơ lái Chrome thật qua `puppeteer-core`, dùng lại `may-chu.mjs` của hồ sơ `cua-vao-noi-tieng-viet`. Mọi chiều đỏ chạy trên một bản sao kho ở cổng riêng, không trên checkout chính.

**Tech Stack:** bun · Prisma · Next.js 16 (App Router) · puppeteer-core lái Chrome đã cài · Node ESM cho thước.

**Spec:** `docs/superpowers/specs/2026-09-16-man-xin-quyen-co-rang-design.md`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào code mới, không thêm vào code sửa. (`AGENTS.md`)
- **Một `.env` duy nhất ở gốc kho.** Không tạo `.env` theo gói. (`AGENTS.md`)
- **Trí khôn sống ở `apps/agent`, không ở API.** Việc này không đụng tới điều đó, nhưng đừng thêm logic nghiệp vụ vào Nest.
- Cổng: `apps/app` 3000, `apps/api` 3001, bản sao `CONG_SAO` mặc định 3200.
- `bun run dev` ở gốc **không chạy** trong phiên không có TTY. Chạy từng app: `cd apps/app && bun run dev`, `cd apps/api && bun run dev`.
- Mọi phép đo mới chỉ tính **XONG** khi có cặp hai chiều trên cùng fixture: vật lành thì xanh, phá vật thật trong bản sao thì đỏ **kèm thông điệp ghim tên ô**. Thiếu cặp = task chưa xong.
- Thước thoát **mã 2** cho «từ chối đo» (tiền đề thiếu), **mã 1** cho «đo được và sai». Không bao giờ thoát 0 khi không đo được.
- Đường dẫn trong thước suy từ `import.meta.url`, không hardcode gốc kho.
- Thông điệp của thước viết không dấu (theo nếp của `rang/cua-vao.mjs` hiện có).

## File Structure

| File | Trách nhiệm |
|---|---|
| `apps/api/scripts/dev-grant-needed.ts` | Gieo và gỡ trạng thái thiếu quyền hộp thư trên bảng `account` |
| `_acceptance/man-xin-quyen-co-rang/rang/ban-sao.mjs` | Dựng bản sao kho ở `CONG_SAO` cho chiều đỏ, và dọn nó |
| `_acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs` | Thước chính, nhiều lệnh con, mỗi eval một lệnh |
| `_acceptance/man-xin-quyen-co-rang/rang/o-ghim.json` | Bảng đóng năm ô của AC-1 và bản tiếng Anh đã ghim |
| `apps/app/test/grant-access-messages.spec.ts` | Bài kiểm mức kho chuỗi cho E4 |
| `_acceptance/config.yaml` | Mười khoá executor mới |

---

### Task 1: Script gieo trạng thái thiếu quyền

**Files:**
- Create: `apps/api/scripts/dev-grant-needed.ts`
- Modify: `apps/api/package.json` (thêm một dòng `scripts`)

**Interfaces:**
- Consumes: `db` từ `@crm/db`; `GOOGLE_PROVIDER_ID`, `MICROSOFT_PROVIDER_ID`, `IDENTITY_SCOPES` từ `@crm/auth`.
- Produces: lệnh `bun run dev:grant-needed <email> <google|both|clear>`. In ra một dòng `grant-needed=<google|google,microsoft|none>` trên stdout. Thước đọc dòng cuối cùng.

**Phục vụ:** E11 (tiền đề), và là điều kiện chạy của E1, E2, E3, E5, E6, E7, E8, E9, E10.
**independent:** false — mọi task thước phụ thuộc nó.

- [ ] **Step 1: Viết bài kiểm thất bại**

Tạo `apps/api/test/dev-grant-needed.spec.ts`:

```ts
import { expect, test } from "bun:test";
import { mailboxGrantsNeeded } from "@crm/auth";
import { db } from "@crm/db";
import { gieoGrantNeeded } from "../scripts/dev-grant-needed";

const EMAIL = "grant-needed-test@localhost";

async function doc(email: string) {
	const user = await db.user.findUniqueOrThrow({ where: { email } });
	return db.account.findMany({
		where: { userId: user.id },
		select: { providerId: true, scope: true },
	});
}

test("gieo google thi mailboxGrantsNeeded tra dung mot nha cung cap", async () => {
	await gieoGrantNeeded(EMAIL, "google");
	expect(mailboxGrantsNeeded(await doc(EMAIL))).toEqual(["google"]);
});

test("gieo both thi mailboxGrantsNeeded tra hai nha cung cap", async () => {
	await gieoGrantNeeded(EMAIL, "both");
	expect(mailboxGrantsNeeded(await doc(EMAIL)).sort()).toEqual([
		"google",
		"microsoft",
	]);
});

test("clear thi mailboxGrantsNeeded tra mang rong", async () => {
	await gieoGrantNeeded(EMAIL, "both");
	await gieoGrantNeeded(EMAIL, "clear");
	expect(mailboxGrantsNeeded(await doc(EMAIL))).toEqual([]);
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd apps/api && bun test test/dev-grant-needed.spec.ts`
Expected: FAIL — `Cannot find module '../scripts/dev-grant-needed'`.

- [ ] **Step 3: Viết bản cài đặt tối thiểu**

Tạo `apps/api/scripts/dev-grant-needed.ts`:

```ts
import {
	GOOGLE_PROVIDER_ID,
	IDENTITY_SCOPES,
	MICROSOFT_PROVIDER_ID,
	ensureWorkspaceMembership,
} from "@crm/auth";
import { db } from "@crm/db";

export type CauHinh = "google" | "both" | "clear";

const SCOPE_KHONG_DONG_BO = IDENTITY_SCOPES.join(" ");

const NHA_CUNG_CAP: Record<Exclude<CauHinh, "clear">, readonly string[]> = {
	google: [GOOGLE_PROVIDER_ID],
	both: [GOOGLE_PROVIDER_ID, MICROSOFT_PROVIDER_ID],
};

export async function gieoGrantNeeded(
	email: string,
	cauHinh: CauHinh,
): Promise<readonly string[]> {
	const name = email.split("@")[0] ?? "Developer";
	const user = await db.user.upsert({
		where: { email },
		create: {
			id: `dev-${Buffer.from(email).toString("hex").slice(0, 20)}`,
			email,
			name,
			emailVerified: true,
			updatedAt: new Date(),
		},
		update: {},
	});

	await ensureWorkspaceMembership(user.id);
	await db.account.deleteMany({ where: { userId: user.id } });

	if (cauHinh === "clear") return [];

	const providers = NHA_CUNG_CAP[cauHinh];
	for (const providerId of providers) {
		await db.account.create({
			data: {
				id: `dev-${providerId}-${user.id}`,
				accountId: `dev-${providerId}-${user.id}`,
				providerId,
				userId: user.id,
				scope: SCOPE_KHONG_DONG_BO,
				updatedAt: new Date(),
			},
		});
	}
	return providers;
}

if (import.meta.main) {
	if (process.env.NODE_ENV === "production") {
		throw new Error("dev-grant-needed la cong cu phat trien.");
	}
	const email = process.argv[2] ?? "dev@localhost";
	const cauHinh = (process.argv[3] ?? "both") as CauHinh;
	if (!["google", "both", "clear"].includes(cauHinh)) {
		console.error(`cau hinh khong hop le: ${cauHinh}`);
		process.exit(2);
	}
	const providers = await gieoGrantNeeded(email, cauHinh);
	console.log(`grant-needed=${providers.length ? providers.join(",") : "none"}`);
	await db.$disconnect();
}
```

- [ ] **Step 4: Chạy để chắc nó xanh**

Run: `cd apps/api && bun test test/dev-grant-needed.spec.ts`
Expected: PASS, 3 ca.

- [ ] **Step 5: Khai lệnh trong package.json**

Thêm vào `apps/api/package.json`, khối `scripts`, ngay dưới dòng `dev:session`:

```json
"dev:grant-needed": "bun scripts/dev-grant-needed.ts",
```

- [ ] **Step 6: Chạy tay một lượt để chắc dòng stdout đúng khuôn**

Run: `cd apps/api && bun run dev:grant-needed manh.phan@onemount.com both`
Expected: dòng cuối stdout là đúng `grant-needed=google,microsoft`.

- [ ] **Step 7: Commit**

```bash
git add apps/api/scripts/dev-grant-needed.ts apps/api/test/dev-grant-needed.spec.ts apps/api/package.json
git commit -m "feat(dev): gieo trang thai thieu quyen hop thu cho phep do man xin quyen"
```

---

### Task 2: Bản sao cho chiều đỏ

**Files:**
- Create: `_acceptance/man-xin-quyen-co-rang/rang/ban-sao.mjs`

**Interfaces:**
- Consumes: không gì từ task khác.
- Produces: `export async function dungBanSao({ sua })` → `{ goc, cong, app, don }`. `sua` là hàm nhận đường dẫn gốc bản sao và đột biến file trong đó. `don()` dừng máy chủ và xoá bản sao. `export const CONG_SAO`.

**Phục vụ:** chiều đỏ của E1, E2, E3, E5, E6, E7, E8, E9, E10 — tức điều khoản `chieu_do_dung_ban_sao` ở đầu `evals.yaml`.
**independent:** true — không phụ thuộc Task 1.

- [ ] **Step 1: Viết bài kiểm thất bại**

Tạo `_acceptance/man-xin-quyen-co-rang/rang/ban-sao.spec.mjs`:

```js
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dungBanSao } from "./ban-sao.mjs";

test("ban sao mang dot bien, checkout chinh thi khong", async () => {
	const moc = `DOT-BIEN-${Date.now()}`;
	const { goc, don } = await dungBanSao({
		khongDungMayChu: true,
		sua: (root) => {
			const f = `${root}/apps/app/lib/messages/auth.ts`;
			const s = readFileSync(f, "utf8").replace("One more step", moc);
			require("node:fs").writeFileSync(f, s);
		},
	});
	try {
		expect(
			readFileSync(`${goc}/apps/app/lib/messages/auth.ts`, "utf8"),
		).toContain(moc);
		expect(
			readFileSync(
				new URL("../../../apps/app/lib/messages/auth.ts", import.meta.url),
				"utf8",
			),
		).not.toContain(moc);
	} finally {
		await don();
	}
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd _acceptance/man-xin-quyen-co-rang/rang && bun test ban-sao.spec.mjs`
Expected: FAIL — không có module `./ban-sao.mjs`.

- [ ] **Step 3: Viết bản cài đặt tối thiểu**

Tạo `_acceptance/man-xin-quyen-co-rang/rang/ban-sao.mjs`:

```js
import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const GOC_THAT = resolve(HERE, "../../..");
export const CONG_SAO = Number(process.env.CONG_SAO ?? 3200);

async function song(url, giay) {
	const han = Date.now() + giay * 1000;
	while (Date.now() < han) {
		try {
			const r = await fetch(url, { redirect: "manual" });
			if (r.status > 0) return true;
		} catch {}
		await new Promise((r) => setTimeout(r, 500));
	}
	return false;
}

export async function dungBanSao({ sua, khongDungMayChu = false }) {
	const goc = join(mkdtempSync(join(tmpdir(), "ban-sao-")), "crm");
	execFileSync("git", ["worktree", "add", "--detach", goc, "HEAD"], {
		cwd: GOC_THAT,
		stdio: "pipe",
	});

	let may = null;
	const don = async () => {
		if (may && !may.killed) {
			may.kill("SIGTERM");
			await new Promise((r) => setTimeout(r, 500));
			if (!may.killed) may.kill("SIGKILL");
		}
		try {
			execFileSync("git", ["worktree", "remove", "--force", goc], {
				cwd: GOC_THAT,
				stdio: "pipe",
			});
		} catch {}
		rmSync(dirname(goc), { recursive: true, force: true });
	};

	try {
		symlinkSync(`${GOC_THAT}/.env`, `${goc}/.env`);
		symlinkSync(`${GOC_THAT}/node_modules`, `${goc}/node_modules`);
		await sua(goc);
		if (khongDungMayChu) return { goc, cong: CONG_SAO, app: null, don };

		may = spawn("bun", ["run", "dev", "--port", String(CONG_SAO)], {
			cwd: join(goc, "apps/app"),
			stdio: "ignore",
			detached: false,
		});
		const app = `http://localhost:${CONG_SAO}`;
		if (!(await song(`${app}/sign-in`, 90))) {
			throw new Error(`ban sao khong tra loi o ${app} sau 90 giay`);
		}
		return { goc, cong: CONG_SAO, app, don };
	} catch (loi) {
		await don();
		throw loi;
	}
}
```

- [ ] **Step 4: Chạy để chắc nó xanh**

Run: `cd _acceptance/man-xin-quyen-co-rang/rang && bun test ban-sao.spec.mjs`
Expected: PASS.

- [ ] **Step 5: Chứng nó dọn sạch**

Run: `git worktree list` sau khi bài kiểm chạy xong.
Expected: chỉ còn `/Users/manh-macmini/dev/crm`. Không worktree tạm nào sót — đây chính là lỗi rò mà `dot-bien.mjs` đang mắc và ta không được lặp lại.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/man-xin-quyen-co-rang/rang/ban-sao.mjs _acceptance/man-xin-quyen-co-rang/rang/ban-sao.spec.mjs
git commit -m "feat(acceptance): ban sao o cong rieng cho chieu do cua man xin quyen"
```

---

### Task 3: Khung thước và lệnh tiền đề (E11)

**Files:**
- Create: `_acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs`

**Interfaces:**
- Consumes: `chotMayChu`, `phien`, `khoChuoi`, `APP`, `CHROME`, `tuChoi` từ `../../cua-vao-noi-tieng-viet/rang/may-chu.mjs`; `gieoGrantNeeded` chạy qua `bun run dev:grant-needed` (Task 1).
- Produces: `node man-xin-quyen.mjs <lenh>`. Lệnh của task này: `tien-de`. Xuất `export async function gieo(cauHinh)` và `export async function moMan(browser, tieng, cookie)` cho các task sau dùng.

**Phục vụ:** E11 (AC-10).
**independent:** false — cần Task 1.

- [ ] **Step 1: Viết lệnh `tien-de` ở dạng thất bại**

Tạo `_acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs`:

```js
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	APP,
	CHROME,
	LANG,
	chotMayChu,
	phien,
	tuChoi,
} from "../../cua-vao-noi-tieng-viet/rang/may-chu.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const GOC = resolve(HERE, "../../..");
export const EMAIL = process.env.EMAIL_DO ?? "man-xin-quyen@localhost";

export function gieo(cauHinh) {
	const ra = execFileSync("bun", ["run", "dev:grant-needed", EMAIL, cauHinh], {
		cwd: `${GOC}/apps/api`,
		encoding: "utf8",
	});
	const dong = ra.trim().split("\n").pop().trim();
	if (!dong.startsWith("grant-needed=")) {
		tuChoi(`khong gieo duoc trang thai ${cauHinh}: ${dong}`);
	}
	return dong.slice("grant-needed=".length);
}

export async function moTrinhDuyet() {
	return puppeteer.launch({
		executablePath: CHROME,
		headless: "new",
		args: ["--no-sandbox"],
	});
}

export async function moMan(browser, tieng, cookie, app = APP) {
	const p = await browser.newPage();
	await p.setCookie(
		{ name: LANG, value: tieng, url: app },
		{ name: cookie.name, value: cookie.value, url: app },
	);
	const res = await p.goto(`${app}/grant-access`, {
		waitUntil: "networkidle0",
		timeout: 60000,
	});
	return { page: p, duong: new URL(p.url()).pathname, status: res?.status() };
}

async function lenhTienDe() {
	await chotMayChu();
	const cookie = phien(EMAIL);

	const gieoDuoc = gieo("both");
	if (gieoDuoc !== "google,microsoft") {
		tuChoi(`gieo both nhung mailboxGrantsNeeded tra "${gieoDuoc}"`);
	}

	const br = await moTrinhDuyet();
	try {
		const vao = await moMan(br, "vi", cookie);
		if (vao.duong !== "/grant-access") {
			tuChoi(`da gieo ma /grant-access van chuyen huong ve ${vao.duong}`);
		}
		await vao.page.close();

		gieo("clear");
		const ra = await moMan(br, "vi", cookie);
		if (ra.duong === "/grant-access") {
			console.log(
				"DO: go gieo roi ma /grant-access VAN dung — phep gieo khong phan biet duoc hai trang thai",
			);
			process.exit(1);
		}
		await ra.page.close();
		console.log(
			`DAT: gieo -> /grant-access dung; go gieo -> chuyen huong ve ${ra.duong}`,
		);
	} finally {
		await br.close();
		gieo("clear");
	}
}

const LENH = { "tien-de": lenhTienDe };

const ten = process.argv[2];
const lenh = LENH[ten];
if (!lenh) {
	console.error(`lenh khong biet: ${ten}. Co: ${Object.keys(LENH).join(" ")}`);
	process.exit(2);
}
await lenh();
```

- [ ] **Step 2: Chạy chiều đỏ TRƯỚC — chưa gieo gì thì phải từ chối đo**

Khởi hai máy chủ ở hai lượt nền riêng: `cd apps/api && bun run dev` và `cd apps/app && bun run dev`.
Rồi tạm đổi tên lệnh `dev:grant-needed` trong `apps/api/package.json` thành `dev:grant-needed-x` và chạy:

Run: `node _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs tien-de; echo "ma=$?"`
Expected: in `KHONG DO DUOC: khong gieo duoc trang thai both: ...` và `ma=2`. Trả lại tên lệnh sau khi xem xong.

- [ ] **Step 3: Chạy chiều xanh**

Run: `node _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs tien-de; echo "ma=$?"`
Expected: in `DAT: gieo -> /grant-access dung; go gieo -> chuyen huong ve /` và `ma=0`.

- [ ] **Step 4: Chứng nó dọn**

Run: `cd apps/api && bun run dev:grant-needed man-xin-quyen@localhost clear`
Expected: `grant-needed=none`. Lệnh `tien-de` đã tự gọi `clear` ở `finally`, nên lượt này phải là lượt vô hại.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs
git commit -m "feat(acceptance): khung thuoc man xin quyen, va chan tien de co doi chung hai chieu"
```

---

### Task 4: Năm ô chuỗi, ba nhánh, tiêu đề tài liệu (E1, E2, E8)

**Files:**
- Create: `_acceptance/man-xin-quyen-co-rang/rang/o-ghim.json`
- Modify: `_acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs` (thêm ba lệnh con vào bảng `LENH`)

**Interfaces:**
- Consumes: `moMan`, `gieo`, `moTrinhDuyet` từ Task 3; `khoChuoi()` từ `may-chu.mjs` trả `{ vi, en, mau }`.
- Produces: lệnh `nam-o`, `ba-nhanh`, `tieu-de-tai-lieu`.

**Phục vụ:** E1 (AC-1), E2 (AC-2), E8 (AC-8).
**independent:** false — cần Task 3.

- [ ] **Step 1: Khai bảng đóng năm ô**

Tạo `_acceptance/man-xin-quyen-co-rang/rang/o-ghim.json`:

```json
{
	"o": [
		{ "ten": "tieu de man", "khoa": "grantAccess.title", "chon": "h1" },
		{ "ten": "mo ta man", "khoa": "grantAccess.both", "chon": "[data-slot=auth-description]" },
		{ "ten": "cau rieng tu", "khoa": "grantAccess.privacy", "chon": "main p:last-of-type" },
		{ "ten": "chu tren nut cap quyen", "khoa": "grantAccess.grant", "chon": "button[type=button]:not(:last-of-type)" },
		{ "ten": "chu tren nut dang xuat", "khoa": "grantAccess.signOut", "chon": "button[type=button]:last-of-type" }
	]
}
```

Bộ chọn phải kiểm lại trên màn thật ở Step 2; sai bộ chọn là hỏng cả E1 lẫn E9, nên đừng đoán.

- [ ] **Step 2: Kiểm bộ chọn trên màn thật trước khi viết chặn**

Run: gieo `both`, mở `/grant-access` trong Chrome, chạy trong console:
`[...document.querySelectorAll("h1,[data-slot=auth-description],main p:last-of-type,button[type=button]")].map(e=>e.tagName+": "+e.textContent.trim().slice(0,40))`
Expected: thấy đủ năm ô, mỗi bộ chọn bắt đúng một phần tử. Sửa `o-ghim.json` cho khớp thực tế rồi mới đi tiếp.

- [ ] **Step 3: Viết ba lệnh con**

Thêm vào `man-xin-quyen.mjs`, trước khối `const LENH`:

```js
import { readFileSync } from "node:fs";
import { khoChuoi } from "../../cua-vao-noi-tieng-viet/rang/may-chu.mjs";

const O_GHIM = JSON.parse(readFileSync(`${HERE}/o-ghim.json`, "utf8")).o;
const CO_DAU = /[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i;

async function docO(page) {
	return page.evaluate(
		(o) =>
			o.map((x) => {
				const el = document.querySelector(x.chon);
				return { ten: x.ten, chu: el ? el.textContent.trim() : null };
			}),
		O_GHIM,
	);
}

async function lenhNamO() {
	const kho = await chotMayChu();
	const cookie = phien(EMAIL);
	gieo("both");
	const br = await moTrinhDuyet();
	const loi = [];
	try {
		const doc = {};
		for (const t of ["vi", "en"]) {
			const { page, duong } = await moMan(br, t, cookie);
			if (duong !== "/grant-access") tuChoi(`luot ${t} bi day ve ${duong}`);
			doc[t] = await docO(page);
			await page.close();
		}
		const thieu = doc.vi.filter((x) => x.chu === null).map((x) => x.ten);
		if (thieu.length) tuChoi(`khong bat duoc o: ${thieu.join(" · ")}`);
		if (doc.vi.length !== O_GHIM.length) {
			tuChoi(`do duoc ${doc.vi.length} o, ban khai ghim ${O_GHIM.length}`);
		}
		const rieng = new Set(doc.vi.map((x) => x.chu));
		if (rieng.size !== O_GHIM.length) {
			loi.push(
				`hai o tra cung mot chuoi — bo chon trung: ${doc.vi.map((x) => `${x.ten}="${x.chu}"`).join(" · ")}`,
			);
		}
		for (let i = 0; i < O_GHIM.length; i++) {
			const { ten } = O_GHIM[i];
			const vi = doc.vi[i].chu;
			const en = doc.en[i].chu;
			if (vi === en) loi.push(`o "${ten}": luot vi va en giong het nhau: "${vi}"`);
			if (!CO_DAU.test(vi)) loi.push(`o "${ten}": luot vi khong mang dau tieng Viet: "${vi}"`);
		}
		void kho;
	} finally {
		await br.close();
		gieo("clear");
	}
	if (loi.length) {
		for (const d of loi) console.log(`DO: ${d}`);
		process.exit(1);
	}
	console.log(`DAT: ${O_GHIM.length} o, moi o quan he ba ve dat`);
}

async function lenhBaNhanh() {
	const kho = await chotMayChu();
	const cookie = phien(EMAIL);
	const br = await moTrinhDuyet();
	const loi = [];
	try {
		for (const [cauHinh, khoaMong] of [
			["google", "google"],
			["both", "both"],
		]) {
			gieo(cauHinh);
			const { page, duong } = await moMan(br, "vi", cookie);
			if (duong !== "/grant-access") tuChoi(`nhanh ${cauHinh} bi day ve ${duong}`);
			const chu = await page.$eval(
				"[data-slot=auth-description]",
				(e) => e.textContent.trim(),
			);
			await page.close();
			if (chu !== kho.vi.grantAccess[khoaMong]) {
				loi.push(
					`nhanh ${cauHinh}: man dung ra "${chu}" nhung khoa ${khoaMong} la "${kho.vi.grantAccess[khoaMong]}"`,
				);
			}
			if (cauHinh === "google" && chu === kho.vi.grantAccess.both) {
				loi.push('nhanh google dung ra dung cau cua khoa both');
			}
		}
		for (const t of ["vi", "en"]) {
			const ba = ["google", "microsoft", "both"].map(
				(k) => kho[t].grantAccess[k],
			);
			if (new Set(ba).size !== 3) {
				loi.push(`kho chuoi ${t}: ba nhanh khong khac nhau tung doi mot`);
			}
		}
		console.log(
			"GIOI HAN DA KHAI: nhanh chi-Microsoft chi do o lop kho chuoi, chua render that",
		);
	} finally {
		await br.close();
		gieo("clear");
	}
	if (loi.length) {
		for (const d of loi) console.log(`DO: ${d}`);
		process.exit(1);
	}
	console.log("DAT: hai nhanh dung that dung cau cua minh, ba nhanh khac nhau o kho chuoi");
}

async function lenhTieuDeTaiLieu() {
	const kho = await chotMayChu();
	const cookie = phien(EMAIL);
	gieo("both");
	const br = await moTrinhDuyet();
	const loi = [];
	try {
		const tieu = {};
		for (const t of ["vi", "en"]) {
			const { page, duong } = await moMan(br, t, cookie);
			if (duong !== "/grant-access") tuChoi(`luot ${t} bi day ve ${duong}`);
			tieu[t] = await page.title();
			await page.close();
		}
		if (tieu.vi === tieu.en) loi.push(`tieu de hai luot giong het nhau: "${tieu.vi}"`);
		if (!CO_DAU.test(tieu.vi)) loi.push(`tieu de luot vi khong mang dau: "${tieu.vi}"`);
		void kho;
	} finally {
		await br.close();
		gieo("clear");
	}
	if (loi.length) {
		for (const d of loi) console.log(`DO: ${d}`);
		process.exit(1);
	}
	console.log("DAT: tieu de tai lieu doi theo tieng cua nguoi doc");
}
```

Rồi mở rộng bảng lệnh:

```js
const LENH = {
	"tien-de": lenhTienDe,
	"nam-o": lenhNamO,
	"ba-nhanh": lenhBaNhanh,
	"tieu-de-tai-lieu": lenhTieuDeTaiLieu,
};
```

- [ ] **Step 4: Chạy chiều xanh cả ba**

Run: `for l in nam-o ba-nhanh tieu-de-tai-lieu; do node _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs $l; echo "$l ma=$?"; done`
Expected: cả ba in `DAT:` và `ma=0`.

- [ ] **Step 5: Chạy chiều đỏ của E1 — năm lần, mỗi lần một khoá**

Với từng khoá trong `title`, `both`, `privacy`, `grant`, `signOut`: dùng `dungBanSao` (Task 2) đột biến khoá đó ở bản `vi` về bản `en`, đặt `APP_URL=http://localhost:3200`, chạy `nam-o`.
Expected: mỗi lượt `ma=1`, và dòng `DO:` **gọi đúng tên ô** ứng với khoá vừa đột biến. Một lượt đỏ mà gọi sai tên ô là thất bại của chiều đỏ.

- [ ] **Step 6: Chạy chiều đỏ của E2 — hai lần**

(1) đặt `microsoft` bằng `both` trong kho chuỗi của bản sao → `ba-nhanh` phải đỏ và gọi tên hai nhánh trùng.
(2) sửa `page.tsx` của bản sao để nhánh một-nhà-cung-cấp trả `m.both` → `ba-nhanh` phải đỏ và gọi tên nhánh `google`. Đây là ca mà lớp kho chuỗi một mình không bắt được.

- [ ] **Step 7: Chạy chiều đỏ của E8**

Đặt `docTitle.grantAccess` bản `vi` bằng bản `en` trong bản sao → `tieu-de-tai-lieu` phải `ma=1` và in cả hai tiêu đề.

- [ ] **Step 8: Commit**

```bash
git add _acceptance/man-xin-quyen-co-rang/rang/o-ghim.json _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs
git commit -m "feat(acceptance): nam o chuoi, ba nhanh nha cung cap, va tieu de tai lieu cua man xin quyen"
```

---

### Task 5: Dấu không-dịch và bề rộng chữ (E3, E9)

**Files:**
- Modify: `_acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs`

**Interfaces:**
- Consumes: `O_GHIM`, `moMan`, `gieo`, `moTrinhDuyet` từ Task 3 và 4.
- Produces: lệnh `khong-dich`, `be-rong`.

**Phục vụ:** E3 (AC-3), E9 (AC-9).
**independent:** false — cần Task 4 (`o-ghim.json` đã kiểm bộ chọn).

- [ ] **Step 1: Viết hai lệnh con**

Thêm vào `man-xin-quyen.mjs`:

```js
const KHO_MAN = [768, 1024, 1280];

async function lenhKhongDich() {
	await chotMayChu();
	const cookie = phien(EMAIL);
	gieo("google");
	const br = await moTrinhDuyet();
	const loi = [];
	try {
		const doc = {};
		for (const t of ["vi", "en"]) {
			const { page, duong } = await moMan(br, t, cookie);
			if (duong !== "/grant-access") tuChoi(`luot ${t} bi day ve ${duong}`);
			doc[t] = await page.evaluate(() => {
				const el = document.querySelector("[translate=no]");
				const nut = document.querySelector("button[type=button]");
				return {
					ten: el ? el.textContent.trim() : null,
					co: Boolean(el),
					nut: nut ? nut.outerHTML.slice(0, 300) : null,
				};
			});
			await page.close();
		}
		if (!doc.vi.co) {
			tuChoi(
				`khong tim thay phan tu mang translate="no" tren man. Chu tren nut: ${doc.vi.nut}`,
			);
		}
		if (doc.vi.ten !== doc.en.ten) {
			loi.push(`ten nha cung cap khac nhau hai luot: vi="${doc.vi.ten}" en="${doc.en.ten}"`);
		}
	} finally {
		await br.close();
		gieo("clear");
	}
	if (loi.length) {
		for (const d of loi) console.log(`DO: ${d}`);
		process.exit(1);
	}
	console.log('DAT: ten nha cung cap nguyen van va mang translate="no"');
}

async function lenhBeRong() {
	await chotMayChu();
	const cookie = phien(EMAIL);
	gieo("both");
	const br = await moTrinhDuyet();
	const loi = [];
	let dem = 0;
	try {
		for (const w of KHO_MAN) {
			const { page, duong } = await moMan(br, "vi", cookie);
			if (duong !== "/grant-access") tuChoi(`kho ${w} bi day ve ${duong}`);
			await page.setViewport({ width: w, height: 900 });
			await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
			const do_ = await page.evaluate((o) => {
				const r = [];
				for (const x of o) {
					const el = document.querySelector(x.chon);
					if (!el) {
						r.push({ ten: x.ten, thieu: true });
						continue;
					}
					const d = document.createRange();
					d.selectNodeContents(el);
					r.push({
						ten: x.ten,
						thieu: false,
						chu: Math.ceil(d.getBoundingClientRect().width),
						o: Math.floor(el.getBoundingClientRect().width),
					});
				}
				return r;
			}, O_GHIM);
			await page.close();

			const thieu = do_.filter((x) => x.thieu).map((x) => x.ten);
			if (thieu.length) {
				tuChoi(`kho ${w}: bat duoc ${do_.length - thieu.length}/${O_GHIM.length} o — thieu: ${thieu.join(" · ")}`);
			}
			for (const x of do_) {
				dem++;
				if (x.chu > x.o) {
					loi.push(`kho ${w}, o "${x.ten}": chu rong ${x.chu}px vuot o ${x.o}px`);
				}
			}
		}
	} finally {
		await br.close();
		gieo("clear");
	}
	const mong = KHO_MAN.length * O_GHIM.length;
	if (dem !== mong) {
		tuChoi(`thuc hien ${dem} khang dinh, ban khai ghim ${mong}`);
	}
	if (loi.length) {
		for (const d of loi) console.log(`DO: ${d}`);
		process.exit(1);
	}
	console.log(`DAT: ${dem} khang dinh be rong, khong o nao bi cat tran`);
}
```

Thêm `"khong-dich": lenhKhongDich, "be-rong": lenhBeRong` vào bảng `LENH`.

- [ ] **Step 2: Chạy chiều xanh**

Run: `for l in khong-dich be-rong; do node _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs $l; echo "$l ma=$?"; done`
Expected: `khong-dich` in `DAT:` và `ma=0`. `be-rong` in `DAT: 15 khang dinh be rong` và `ma=0`. Con số **15** phải hiện ra — nó là bằng chứng ma trận toàn phần đã chạy.

- [ ] **Step 3: Chiều đỏ của E3**

Gỡ `translate="no"` khỏi `<span>` trong bản sao → `khong-dich` phải `ma=2` và in nguyên văn chữ trên nút (từ chối đo, vì tập quan sát rỗng không bao giờ là đạt).

- [ ] **Step 4: Chiều đỏ của E9 — hai lần, hai ô khác nhau**

(1) Nhét chuỗi tiếng Việt dài gấp ba vào `grantAccess.title` của bản sao → `be-rong` phải `ma=1` và gọi tên ô «tieu de man» cùng khổ màn bị tràn.
(2) Làm y vậy với `grantAccess.signOut` → phải `ma=1` và gọi tên ô «chu tren nut dang xuat». Ô này bắt buộc có trong chiều đỏ vì nó là ô xa thân màn nhất, dễ sót nhất.

- [ ] **Step 5: Chiều đỏ của chính bộ đếm**

Xoá một dòng khỏi `o-ghim.json` của bản sao rồi chạy `be-rong` → phải `ma=2` với thông điệp `thuc hien 12 khang dinh, ban khai ghim 15`. Đây là chặn chống đúng lỗi mà phản biện tìm ra.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs
git commit -m "feat(acceptance): dau khong-dich va ma tran be rong muoi lam khang dinh"
```

---

### Task 6: Ba trạng thái tạm và hai câu lỗi (E5, E6, E7)

**Files:**
- Modify: `_acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs`

**Interfaces:**
- Consumes: `moMan`, `gieo`, `moTrinhDuyet`, `khoChuoi` từ các task trước.
- Produces: lệnh `dang-cap`, `loi-nha-cung-cap`, `loi-dang-xuat`.

**Phục vụ:** E5 (AC-5), E6 (AC-6), E7 (AC-7 — mục nợ nặng).
**independent:** false — cần Task 3.

- [ ] **Step 1: Viết một hàm chung chặn mạng rồi bấm**

Thêm vào `man-xin-quyen.mjs`:

```js
async function bamVaChan(br, tieng, cookie, { chan, nut, sauKhiBam }) {
	const { page, duong } = await moMan(br, tieng, cookie);
	if (duong !== "/grant-access") tuChoi(`luot ${tieng} bi day ve ${duong}`);
	await page.setRequestInterception(true);
	page.on("request", (q) => (chan.test(q.url()) ? q.abort() : q.continue()));
	const nutEl = await page.$(nut);
	if (!nutEl) tuChoi(`khong tim thay nut "${nut}" tren man o luot ${tieng}`);
	await nutEl.click();
	const ra = await sauKhiBam(page);
	await page.close();
	return ra;
}

async function chuTrongThongBao(page) {
	try {
		await page.waitForSelector("[data-sonner-toast]", { timeout: 8000 });
	} catch {
		return null;
	}
	return page.$eval("[data-sonner-toast]", (e) => e.textContent.trim());
}

async function doHaiTieng(ten, chay, kiem) {
	await chotMayChu();
	const cookie = phien(EMAIL);
	gieo("both");
	const br = await moTrinhDuyet();
	const loi = [];
	try {
		const thu = {};
		for (const t of ["vi", "en"]) thu[t] = await chay(br, t, cookie);
		if (thu.vi === null || thu.en === null) {
			tuChoi(`${ten}: khong bat duoc trang thai can do (vi=${thu.vi} en=${thu.en})`);
		}
		if (thu.vi === thu.en) loi.push(`${ten}: hai luot giong het nhau: "${thu.vi}"`);
		if (!CO_DAU.test(thu.vi)) loi.push(`${ten}: luot vi khong mang dau tieng Viet: "${thu.vi}"`);
		if (kiem) loi.push(...(kiem(thu) ?? []));
	} finally {
		await br.close();
		gieo("clear");
	}
	if (loi.length) {
		for (const d of loi) console.log(`DO: ${d}`);
		process.exit(1);
	}
	console.log(`DAT: ${ten}`);
}

const lenhDangCap = () =>
	doHaiTieng("chu tren nut o trang thai dang cap", (br, t, cookie) =>
		bamVaChan(br, t, cookie, {
			chan: /accounts\.google|login\.microsoftonline|api\/auth/,
			nut: "button[type=button]",
			sauKhiBam: async (page) => {
				await page.waitForFunction(
					() => document.querySelector("button[type=button]")?.disabled === true,
					{ timeout: 8000 },
				).catch(() => {});
				return page.$eval("button[type=button]", (e) =>
					e.disabled ? e.textContent.trim() : null,
				);
			},
		}),
	);

const lenhLoiNhaCungCap = () =>
	doHaiTieng("cau bao loi khi khong toi duoc nha cung cap", (br, t, cookie) =>
		bamVaChan(br, t, cookie, {
			chan: /accounts\.google|login\.microsoftonline|api\/auth/,
			nut: "button[type=button]",
			sauKhiBam: chuTrongThongBao,
		}),
	);

const lenhLoiDangXuat = () =>
	doHaiTieng("cau bao loi khi dang xuat that bai", (br, t, cookie) =>
		bamVaChan(br, t, cookie, {
			chan: /api\/auth\/sign-out/,
			nut: "button[type=button]:last-of-type",
			sauKhiBam: chuTrongThongBao,
		}),
	);
```

Thêm ba khoá vào bảng `LENH`.

- [ ] **Step 2: Chạy chiều xanh cả ba**

Run: `for l in dang-cap loi-nha-cung-cap loi-dang-xuat; do node _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs $l; echo "$l ma=$?"; done`
Expected: cả ba in `DAT:` và `ma=0`.

Nếu `loi-dang-xuat` đỏ ngay lượt đầu vì câu hiện ra là tiếng Anh: **đó là mục nợ đang được trả**. Sửa `apps/app/lib/sign-out.ts` hoặc `grant-access.tsx` để câu lỗi đến từ `nhan.error.signOut`, rồi chạy lại. Ghi một mục `fix` vào `decisions.jsonl` với `stage:"S3"`.

- [ ] **Step 3: Chiều đỏ ba lần**

Trong bản sao, gỡ lần lượt `grantAccess.granting`, `grantAccess.error.provider`, `grantAccess.error.signOut` của bản `vi` về tiếng Anh → mỗi lệnh tương ứng phải `ma=1` và gọi tên đúng ô.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs
git commit -m "feat(acceptance): ba trang thai tam va hai cau loi cua man xin quyen"
```

---

### Task 7: Kho chuỗi ghép động và sàn thiết kế (E4, E10)

**Files:**
- Create: `apps/app/test/grant-access-messages.spec.ts`
- Modify: `_acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs` (thêm lệnh `chup-san`)

**Interfaces:**
- Consumes: `authMessages` từ `@/lib/messages/auth`; `moMan`, `gieo` từ Task 3.
- Produces: bài kiểm bun cho E4; lệnh `chup-san` sinh `evidence/E10-xin-quyen-vi.png` và `evidence/E10-xin-quyen-en.png`.

**Phục vụ:** E4 (AC-4), E10 (AC-9, lớp nhìn-thấy).
**independent:** true so với Task 5 và 6 — chỉ cần Task 3.

- [ ] **Step 1: Viết bài kiểm thất bại cho E4**

Tạo `apps/app/test/grant-access-messages.spec.ts`:

```ts
import { expect, test } from "bun:test";
import { authMessages } from "@/lib/messages/auth";

const TEN_HANG = ["Google", "Microsoft", "Outlook", "Gmail"];

test("grant la mot ham nhan ten nha cung cap, o ca hai thu tieng", () => {
	for (const tieng of ["vi", "en"] as const) {
		expect(typeof authMessages(tieng).grantAccess.grant).toBe("function");
		expect(authMessages(tieng).grantAccess.grant("Đất Xanh")).toContain(
			"Đất Xanh",
		);
	}
});

test("khong gia tri chuoi nao trong khoi grantAccess duc san ten mot nha cung cap", () => {
	for (const tieng of ["vi", "en"] as const) {
		const khoi = authMessages(tieng).grantAccess;
		for (const [khoa, gia] of Object.entries(khoi)) {
			if (typeof gia !== "string") continue;
			for (const hang of TEN_HANG) {
				expect(
					gia.includes(hang),
					`khoa grantAccess.${khoa} cua ban ${tieng} duc san ten "${hang}"`,
				).toBe(false);
			}
		}
	}
});
```

- [ ] **Step 2: Chạy để xem nó đỏ hay xanh**

Run: `cd apps/app && bun test test/grant-access-messages.spec.ts`
Expected: nếu đỏ ở ca thứ hai vì `grantAccess.google` chứa chữ "Gmail" — đó là một phát hiện thật, không phải bài kiểm sai. Thu hẹp ca thứ hai xuống đúng các khoá làm **nhãn** (`grantOne`, `granting`, `signOut`, `title`) và ghi một mục `fix` vào `decisions.jsonl` nói rõ vì sao các câu mô tả được miễn.

- [ ] **Step 3: Viết lệnh chụp cho E10**

Thêm vào `man-xin-quyen.mjs`:

```js
import { mkdirSync } from "node:fs";

async function lenhChupSan() {
	await chotMayChu();
	const cookie = phien(EMAIL);
	gieo("both");
	const thuMuc = `${HERE}/../evidence`;
	mkdirSync(thuMuc, { recursive: true });
	const br = await moTrinhDuyet();
	try {
		for (const t of ["vi", "en"]) {
			const { page, duong } = await moMan(br, t, cookie);
			if (duong !== "/grant-access") {
				tuChoi(`luot ${t} bi day ve ${duong} — anh chup se la anh man khac`);
			}
			const tieu = await page.title();
			if (!tieu || tieu.length < 2) tuChoi(`luot ${t}: tieu de tai lieu rong`);
			await page.setViewport({ width: 1280, height: 900 });
			await page.screenshot({ path: `${thuMuc}/E10-xin-quyen-${t}.png` });
			await page.close();
			console.log(`da chup ${t}: duong=${duong} tieu-de="${tieu}"`);
		}
	} finally {
		await br.close();
		gieo("clear");
	}
	console.log("DAT: hai anh chup dung man /grant-access");
}
```

Thêm `"chup-san": lenhChupSan` vào bảng `LENH`.

- [ ] **Step 4: Chạy chiều xanh**

Run: `node _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs chup-san; echo "ma=$?"`
Expected: in hai dòng `da chup` có `duong=/grant-access` và tiêu đề khác rỗng, rồi `DAT:`, `ma=0`.

- [ ] **Step 5: Chiều đỏ của E10 — chứng nó phân biệt được màn**

Chạy `chup-san` **sau khi** gỡ gieo (`bun run dev:grant-needed man-xin-quyen@localhost clear` rồi sửa tạm hàm `gieo` trong bản sao để nó không gieo).
Expected: `ma=2` với thông điệp `luot vi bi day ve / — anh chup se la anh man khac`. Không được chụp ảnh nào. Đây là chặn chống đúng lỗ mà phản biện tìm ra: hai ảnh trang chủ vẫn qua được sàn thiết kế.

- [ ] **Step 6: Commit**

```bash
git add apps/app/test/grant-access-messages.spec.ts _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs
git commit -m "feat(acceptance): kho chuoi ghep dong, va anh chup san thiet ke co khang dinh dung man"
```

---

### Task 8: Khai mười khoá executor

**Files:**
- Modify: `_acceptance/config.yaml`

**Interfaces:**
- Consumes: mọi lệnh con của các task trước.
- Produces: mười khoá mà `evals.yaml` trỏ tới.

**Phục vụ:** cả mười một eval — không có khoá thì `s4-args.mjs` thoát khác 0 và S4 không chạy.
**independent:** false — làm sau cùng.

- [ ] **Step 1: Khai bằng script, KHÔNG sửa tay**

Chín khoá `executors.script.*`, mỗi khoá theo đúng khuôn của hồ sơ gốc (bọc trong làn tiền đề, có `APP_URL`/`API_URL` mặc định):

```bash
AG=$(node scripts/resolve-plugin.mjs --plugin acceptance-gate --require scripts/config-patch.mjs)
P="APP_URL=\${APP_URL:-http://localhost:3000} API_URL=\${API_URL:-http://localhost:3001} bun scripts/lan-do/tien-de.mjs --chay \"node _acceptance/man-xin-quyen-co-rang/rang/man-xin-quyen.mjs"
for pair in "xin_quyen_chuoi:nam-o" "xin_quyen_ba_nhanh:ba-nhanh" "xin_quyen_khong_dich:khong-dich" "xin_quyen_dang_cap:dang-cap" "xin_quyen_loi_nha_cung_cap:loi-nha-cung-cap" "xin_quyen_loi_dang_xuat:loi-dang-xuat" "xin_quyen_tieu_de_tai_lieu:tieu-de-tai-lieu" "xin_quyen_be_rong:be-rong" "xin_quyen_tien_de:tien-de"; do
  k="${pair%%:*}"; l="${pair##*:}"
  node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml \
    --key "executors.script.$k" --value "$P $l\"" --write
done
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml \
  --key executors.test.xin_quyen_ghep_dong \
  --value "cd apps/app && bun test test/grant-access-messages.spec.ts" --write
```

`chup-san` KHÔNG cần khoá riêng — nó là `steps` của E10, và E10 trỏ `config:executors.design.gate` đã có sẵn.

- [ ] **Step 2: Chứng mọi ref giải được**

Run: `node <feature-loop>/scripts/s4-args.mjs --slug man-xin-quyen-co-rang --root . --out /tmp/s4-check.json; echo "ma=$?"`
Expected: `ma=0`, và tệp sinh ra chứa đủ 11 eval với `cmd` đã giải thành lệnh thật. Bất kỳ ref hỏng nào làm script thoát khác 0 và gọi tên khoá — đó là chiều đỏ của chính task này.

- [ ] **Step 3: Chạy trọn năm lệnh cổng**

Run: `bun run check-types && bun run lint && bun run lint:slop && bun run test && bun run build`
Expected: cả năm xanh. Đây là điều kiện để S4 chạy.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/config.yaml
git commit -m "chore(acceptance): muoi khoa executor cho thuoc man xin quyen"
```

---

## Tự soi kế hoạch

**Phủ hợp đồng.** AC-1 → Task 4 (`nam-o`) · AC-2 → Task 4 (`ba-nhanh`) · AC-3 → Task 5 (`khong-dich`) · AC-4 → Task 7 (bài kiểm kho chuỗi) · AC-5 → Task 6 (`dang-cap`) · AC-6 → Task 6 (`loi-nha-cung-cap`) · AC-7 → Task 6 (`loi-dang-xuat`) · AC-8 → Task 4 (`tieu-de-tai-lieu`) · AC-9 → Task 5 (`be-rong`) và Task 7 (`chup-san`) · AC-10 → Task 3 (`tien-de`). Không tiêu chí nào không có task.

**Điều khoản `chieu_do_dung_ban_sao`.** Task 2 dựng hạ tầng; Task 4 Step 5–7, Task 5 Step 3–5, Task 6 Step 3, Task 7 Step 5 đều chạy chiều đỏ qua nó.

**Nhất quán tên.** `gieo(cauHinh)` · `moMan(browser, tieng, cookie, app)` · `moTrinhDuyet()` · `O_GHIM` · `CO_DAU` · `dungBanSao({ sua, khongDungMayChu })` — dùng cùng tên ở mọi task.

**Chỗ kế hoạch có thể sai, và cách phát hiện sớm.** Bộ chọn trong `o-ghim.json` là phỏng đoán từ đọc mã, không phải từ màn thật. Task 4 Step 2 bắt buộc kiểm chúng trên màn đang chạy TRƯỚC khi viết chặn. Sai bộ chọn làm hỏng cả E1 lẫn E9, nên đừng bỏ bước đó.
