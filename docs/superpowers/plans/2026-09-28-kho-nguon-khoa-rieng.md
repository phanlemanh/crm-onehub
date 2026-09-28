# Kho nguồn dùng khoá Blob riêng — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kho nguồn tài liệu đọc `KHO_TAI_LIEU_BLOB_TOKEN` thay cho `BLOB_READ_WRITE_TOKEN`, không lùi, để bật tải nguồn trên production mà không đụng khoá logo.

**Architecture:** Tên biến là hằng `BLOB_NGUON.bienKhoa` trong `packages/db/src/blob-nguon.ts` — một chỗ khai, API (`kho-nguon.ts`) và agent (`dispatch.ts`) đã đi qua `khoNguonVercel()`, nên không chỗ gọi nào đổi. Bảng năng lực agent đọc cùng hằng. Biến khai ở đủ nhà theo `docs/environment.md`.

**Tech Stack:** Bun test, NestJS + tRPC (supertest), `@vercel/blob` 2.6.1 (`VERCEL_BLOB_API_URL` đọc lúc gọi), turbo.

**Spec:** `docs/superpowers/specs/2026-09-28-kho-nguon-khoa-rieng-design.md` · hợp đồng `_acceptance/kho-nguon-khoa-rieng/contract.md` · evals `_acceptance/kho-nguon-khoa-rieng/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- Không lùi sang `BLOB_READ_WRITE_TOKEN` (sổ `d-20260928T120055Z-1`).
- Rỗng và toàn khoảng trắng = vắng (`?.trim()`).
- Biến là bí mật: `passThroughEnv`/`globalPassThroughEnv`, không bao giờ `env`.
- Không đọc, không in giá trị khoá thật ở bất kỳ bước nào.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: xanh trên vật lành, đỏ với thông điệp ghim trên bản sao bị phá (khuôn MEASURE-BIRTH).

## Review Focus

- Khoá dán kèm dấu cách → phải tính là vắng ở cả `blob-nguon.ts` lẫn `capabilities.ts` (Task 1, Task 3: ô `"   "`).
- Test đặt biến cũ rồi tin là tắt, trong khi `.env` của máy có biến mới → test phải xoá cả hai biến trước khi dựng (Task 2, Task 3 KEYS).
- Bàn đo giả dựng API với tên cũ → màn tải khoá, chụp hỏng im (Task 5: kiểm `trangThai` trước bước 1).
- `blob-that.mjs` đọc `.env` gốc, nơi có thể còn khoá private dưới tên cũ → lượt xanh phải ép tên cũ thành giá trị giả (Task 5).
- Đường agent đọc nguồn khi soạn có chặn riêng bằng tên cũ → quét tĩnh mọi tệp agent gọi `khoNguonVercel` (Task 4).

---

### Task 1: Kho nguồn đọc biến riêng (packages/db)

phục vụ E1, E2, E3 (phần `kho-nguon-tat`) · independent: true

**Files:**
- Modify: `packages/db/src/blob-nguon.ts` (hằng `BLOB_NGUON`, `tokenNguon`)
- Test: `packages/db/test/blob-nguon.spec.ts`

**Interfaces:**
- Produces: `BLOB_NGUON.bienKhoa: "KHO_TAI_LIEU_BLOB_TOKEN"`; `BLOB_NGUON.thongDiep.tat: "Kho nguồn chưa bật: thiếu KHO_TAI_LIEU_BLOB_TOKEN"`.

- [ ] **Step 1: Test đỏ** — trong `blob-nguon.spec.ts`: đổi `KHOA` thành `"KHO_TAI_LIEU_BLOB_TOKEN"`, lưu/trả cả `BLOB_READ_WRITE_TOKEN` và `VERCEL_BLOB_API_URL` ở before/afterEach, rồi thêm:

```ts
import { blobEnabled } from "../src/blob";

const LOGO = "BLOB_READ_WRITE_TOKEN";
const VANG = undefined;
const BANG_HAI_BIEN = [
	{ o: "co-co", kho: "vercel_blob_rw_nguon_gia", logo: "vercel_blob_rw_logo_gia", nguon: true, anh: true },
	{ o: "co-vang", kho: "vercel_blob_rw_nguon_gia", logo: VANG, nguon: true, anh: false },
	{ o: "vang-co", kho: VANG, logo: "vercel_blob_rw_logo_gia", nguon: false, anh: true },
	{ o: "vang-vang", kho: VANG, logo: VANG, nguon: false, anh: false },
	{ o: "trang-co", kho: "   ", logo: "vercel_blob_rw_logo_gia", nguon: false, anh: true },
	{ o: "co-rong", kho: "vercel_blob_rw_nguon_gia", logo: "", nguon: true, anh: false },
] as const;

const dat = (ten: string, gt: string | undefined) => {
	if (gt === undefined) delete process.env[ten];
	else process.env[ten] = gt;
};

describe("hai-bien", () => {
	it("hai-bien: 6 o x 2 kho = 12 ky vong viet truoc", () => {
		let so = 0;
		for (const o of BANG_HAI_BIEN) {
			dat(KHOA, o.kho);
			dat(LOGO, o.logo);
			const nguon = khoNguonVercel().bat();
			const anh = blobEnabled();
			if (!o.nguon && nguon) throw new Error(`kho nguon bat bang khoa logo: o ${o.o}`);
			if (o.nguon && !nguon) throw new Error(`kho nguon tat du co khoa rieng: o ${o.o}`);
			if (o.kho === "   " && nguon) throw new Error(`khoang trang tinh la co khoa: o ${o.o}`);
			expect(nguon).toBe(o.nguon);
			expect(anh).toBe(o.anh);
			so += 2;
		}
		expect(so).toBe(BANG_HAI_BIEN.length * 2);
	});
});
```

Và `token-gui-di`:

```ts
describe("token-gui-di", () => {
	it("token-gui-di: moi yeu cau cua kho nguon mang khoa rieng, khong mang khoa logo", async () => {
		const ghi: string[] = [];
		const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
		const may = Bun.serve({
			port: 0,
			async fetch(req) {
				const u = new URL(req.url);
				ghi.push(`${req.method} ${u.pathname} ${req.headers.get("authorization") ?? ""}`);
				if (u.pathname === "/signed-token") {
					const vao = await req.json();
					return Response.json({ clientSigningToken: "khoa-ky-gia", delegationToken: `${b64({ storeId: "store_knrgia", ...vao })}.gia` });
				}
				if (u.pathname === "/delete") return Response.json({});
				return new Response("", { status: 400 });
			},
		});
		try {
			process.env.VERCEL_BLOB_API_URL = `http://localhost:${may.port}`;
			process.env[KHOA] = "vercel_blob_rw_nguon_gia";
			process.env[LOGO] = "vercel_blob_rw_logo_gia";
			const kho = khoNguonVercel();
			await kho.kyPut(PATHNAME_NGUON("n1"), { kieu: "docx", toiDa: 1024 });
			await kho.kyGet(PATHNAME_NGUON("n1"), 300);
			await kho.xoa(PATHNAME_NGUON("n1"));
		} finally {
			may.stop(true);
		}
		expect(ghi.length).toBeGreaterThanOrEqual(3);
		for (const dong of ghi) {
			if (dong.includes("vercel_blob_rw_logo_gia")) throw new Error(`yeu cau mang khoa logo: ${dong.split(" ").slice(0, 2).join(" ")}`);
			expect(dong.endsWith("Bearer vercel_blob_rw_nguon_gia")).toBe(true);
		}
		expect(ghi.filter((d) => d.startsWith("POST /signed-token")).length).toBe(2);
		expect(ghi.filter((d) => d.startsWith("POST /delete")).length).toBe(1);
	});
});
```

Đổi tên ca thông điệp cũ thành `kho-nguon-tat: thiếu token thì kyPut, kyGet từ chối bằng thông điệp ghim` với chuỗi `"Kho nguồn chưa bật: thiếu KHO_TAI_LIEU_BLOB_TOKEN"`.

- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/db && bun test test/blob-nguon.spec.ts` → đỏ ở `hai-bien` (kho nguồn vẫn đọc tên cũ) và `kho-nguon-tat`.

- [ ] **Step 3: Sửa** — `blob-nguon.ts`:

```ts
export const BLOB_NGUON = {
	thuMuc: "kho-tai-lieu/nguon",
	bienKhoa: "KHO_TAI_LIEU_BLOB_TOKEN",
	kieuNoiDung: { … giữ nguyên … },
	giayKyPut: 10 * PHUT_GIAY,
	thongDiep: {
		tat: "Kho nguồn chưa bật: thiếu KHO_TAI_LIEU_BLOB_TOKEN",
	},
} as const;

function tokenNguon(): string | null {
	return process.env[BLOB_NGUON.bienKhoa]?.trim() || null;
}
```

- [ ] **Step 4: Xanh** — `cd packages/db && bun test test/blob-nguon.spec.ts` → pass hết.
- [ ] **Step 5: Phá thử (bản sao trong `.acceptance-runs/kho-nguon-khoa-rieng/`, không phá tại chỗ):** ba bản sao `blob-nguon.ts` — lùi `|| process.env.BLOB_READ_WRITE_TOKEN?.trim()`; đọc tên logo; bỏ `.trim()` — mỗi bản đỏ với đúng thông điệp ghim của E1/E2. Bản sao truyền nhầm token logo vào `issueSignedToken` → đỏ «yeu cau mang khoa logo: POST /signed-token». Ghi kết quả vào `.acceptance-runs/kho-nguon-khoa-rieng/pha-thu.md`.
- [ ] **Step 6: Commit** `feat(tai-lieu): kho nguồn đọc KHO_TAI_LIEU_BLOB_TOKEN`.

### Task 2: API — ô «chỉ khoá logo» và khai biến

phục vụ E3 · independent: false (dùng thông điệp của Task 1)

**Files:**
- Create: `apps/api/test/tai-lieu-nguon-khoa-logo.spec.ts`
- Modify: `apps/api/test/tai-lieu-nguon-tat.spec.ts` (xoá cả hai biến; đối chứng bật bằng biến mới)
- Modify: `apps/api/src/config/env.validation.ts` (thêm `KHO_TAI_LIEU_BLOB_TOKEN?: string` cạnh `BLOB_READ_WRITE_TOKEN`)

- [ ] **Step 1:** Tệp mới — đặt env trước `dungSan()`:

```ts
process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_logo_gia";
process.env.KHO_TAI_LIEU_BLOB_TOKEN = "";
dungSan();
```

Ca `khoa-logo: trangThai tat` — `trangThai` khác `{ bat: false }` thì `throw new Error("kho nguon bat bang khoa logo")`, rồi `expect(...).toEqual({ bat: false })`; `xinCho`, `nhan`, `taiVe` → `412 ${NGUON.thongDiep.tat}` (sao chép chuỗi gọi từ `tai-lieu-nguon-tat.spec.ts`). Ca `khoa-logo: luot 1 chay nhu cu` — `taoTrang`, `duyet`, `deXuat`, `duyet`, `list`, `get`.
- [ ] **Step 2:** `tai-lieu-nguon-tat.spec.ts`: thêm `process.env.KHO_TAI_LIEU_BLOB_TOKEN = "";` cạnh dòng cũ; ca đối chứng đặt/trả `KHO_TAI_LIEU_BLOB_TOKEN` thay `BLOB_READ_WRITE_TOKEN`.
- [ ] **Step 3:** `env.validation.ts` thêm khối `@IsOptional() @IsString() KHO_TAI_LIEU_BLOB_TOKEN?: string;`.
- [ ] **Step 4: Xanh** — `bun run test -- "cd apps/api && bun test test/tai-lieu-nguon-khoa-logo.spec.ts test/tai-lieu-nguon-tat.spec.ts"`.
- [ ] **Step 5: Phá thử** trên bản sao lùi của Task 1 (chạy test API với module bản sao qua symlink trong bản sao cây) → đỏ «kho nguon bat bang khoa logo». Ghi vào `pha-thu.md`.
- [ ] **Step 6: Commit** `test(tai-lieu): ô chỉ khoá logo tắt kho nguồn`.

### Task 3: Bảng năng lực agent

phục vụ E4 · independent: true

**Files:**
- Modify: `apps/agent/agent/lib/capabilities.ts` (mục `LUU_NGUON`)
- Test: `apps/agent/test/capabilities.spec.ts`

- [ ] **Step 1: Test đỏ** — thêm `"KHO_TAI_LIEU_BLOB_TOKEN"` vào `KEYS`; thay ca `luu-nguon` bằng bảng 6 ô giống Task 1 (hai cột `[LUU_NGUON.enabled, "Picture storage".enabled]`), ném `luu nguon bat bang khoa logo: o <o>` / `khoang trang tinh la co khoa: o <o>` trước `expect`, đếm `so === 12`; thêm `expect(muc.from).toBe("KHO_TAI_LIEU_BLOB_TOKEN")`.
- [ ] **Step 2:** `cd apps/agent && bun test test/capabilities.spec.ts -t luu-nguon` → đỏ.
- [ ] **Step 3: Sửa:**

```ts
import { BLOB_NGUON } from "@crm/db/blob-nguon";
…
		{
			id: LUU_NGUON,
			from: BLOB_NGUON.bienKhoa,
			label: "Document sources",
			gives: "…giữ nguyên…",
			enabled: Boolean(process.env[BLOB_NGUON.bienKhoa]?.trim()),
		},
```

(`@crm/db/blob-nguon` chỉ import động `@vercel/blob`, không kéo Prisma — agent đã import nó ở `dispatch.ts`.)
- [ ] **Step 4:** xanh; **Step 5:** phá thử bản sao đọc `BLOB_READ_WRITE_TOKEN` → đỏ đúng thông điệp; **Step 6:** commit `feat(agent): năng lực lưu nguồn theo khoá kho nguồn`.

### Task 4: Nhà của biến + thước E5

phục vụ E5 · independent: true

**Files:**
- Modify: `.env.example` (khối mới ngay dưới `# BLOB_READ_WRITE_TOKEN=""`), `turbo.json` (`globalPassThroughEnv`), `apps/api/turbo.json` (dev, test), `apps/agent/turbo.json` (dev, dev:headless — mọi task đang có `BLOB_READ_WRITE_TOKEN`), `docs/environment.md` (bảng + đoạn nhà), `docs/api.md` (mục «Kho tài liệu: nguồn»)
- Create: `_acceptance/kho-nguon-khoa-rieng/rang/bien-cac-nha.mjs`

- [ ] **Step 1:** Viết `bien-cac-nha.mjs` theo khuôn `may-soan-de-xuat/rang/bien-ba-nha.mjs` (gốc suy từ `import.meta.url`, `--goc <dir>` chạy kiểm trên bản sao, chiều đỏ chạy trước, bắt thiếu → exit 3). Bảy nhà + ba luật âm như E5; cắt thân mục api.md từ `## Kho tài liệu: nguồn` tới `\n## `; quét `apps/agent/agent/**/*.ts` có `khoNguonVercel` (in `quet N tep agent doc nguon`, N > 0). Bảy ca chiều đỏ đúng thông điệp của E5.
- [ ] **Step 2:** `node _acceptance/kho-nguon-khoa-rieng/rang/bien-cac-nha.mjs` → chiều đỏ 7/7, kiểm thật exit 1 (nhà thiếu).
- [ ] **Step 3:** Sửa các nhà. `.env.example`:

```
# The Word and PDF sources of the document library live in their own PRIVATE
# Vercel Blob store (kho-tai-lieu-nguon), apart from the public store above.
# Paste that store's read-write token here. Do NOT connect the store to a
# Vercel project (không gắn dự án): connecting it makes Vercel set
# BLOB_READ_WRITE_TOKEN to this private token, and logos would be written
# into the private store. Read by the API and the agent. Without it the
# upload button stays locked; nothing throws.
# KHO_TAI_LIEU_BLOB_TOKEN=""
```

`docs/environment.md`: dòng `BLOB_READ_WRITE_TOKEN` chỉ còn logo/ảnh; dòng mới `| \`KHO_TAI_LIEU_BLOB_TOKEN\` | Keeps the Word and PDF sources of the document library in a private Blob store and reads them back for drafting. Without it nothing can be uploaded to the library |`; đoạn nhà: đọc bởi API và agent, có trong `env.validation.ts`, `globalPassThroughEnv`, pass-through dev/test của api và agent, không `env`; không lùi sang tên logo. `docs/api.md`: gạch «No `BLOB_READ_WRITE_TOKEN` switches…» → «No `KHO_TAI_LIEU_BLOB_TOKEN` switches the area off, never throws — there is no fallback to the logo store's `BLOB_READ_WRITE_TOKEN`, which is public.»
- [ ] **Step 4:** chạy lại → exit 0, bảy dòng `co o …`, chiều đỏ 7/7.
- [ ] **Step 5:** commit `docs(env): KHO_TAI_LIEU_BLOB_TOKEN ở đủ nhà`.

### Task 5: Bàn đo của may-soan-de-xuat + sổ trỏ

phục vụ E6, E7 · independent: false (cần Task 1)

**Files:**
- Modify: `_acceptance/may-soan-de-xuat/rang/blob-that.mjs`
- Modify: `_acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs`
- Modify: `_acceptance/may-soan-de-xuat/decisions.jsonl` (một dòng `revisit` trỏ sang hồ sơ mới)

- [ ] **Step 1:** `blob-that.mjs` — `const BIEN = "KHO_TAI_LIEU_BLOB_TOKEN"`; `tokenThat()` đọc `process.env[BIEN]` rồi tệp `process.env.BLOB_THAT_ENV ?? join(GOC, ".env")`; thiếu → `console.log("KHONG DO DUOC: thieu KHO_TAI_LIEU_BLOB_TOKEN that"); process.exit(2)`. Trước khi import `db` và `moDo`, ép `process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_logo_gia_khong_dung"` và `process.env[BIEN] = token` để phiên đo thừa kế. Không `console.log` nào in `token`.
- [ ] **Step 2:** `man-tai-nguon.mjs` — env của API phiên: `KHO_TAI_LIEU_BLOB_TOKEN: TOKEN_GIA`, `BLOB_READ_WRITE_TOKEN: ""`; dòng báo đổi tên; sau `nguoiMoi` và trước bước 1: hỏi `taiLieuNguon.trangThai` bằng cookie người đo; `bat !== true` → `console.log("kho nguon tat tren api phien"); process.exit(1)` (qua `donHet`), ngược lại in `kho nguon bat tren api phien`.
- [ ] **Step 3:** Chiều đỏ E6: `KHO_TAI_LIEU_BLOB_TOKEN= BLOB_THAT_ENV=<tmp .env chỉ có BLOB_READ_WRITE_TOKEN=vercel_blob_rw_logo_gia> bun _acceptance/may-soan-de-xuat/rang/blob-that.mjs` → exit 2, câu ghim. Chiều đỏ E7: bản sao đặt `BLOB_READ_WRITE_TOKEN: TOKEN_GIA` thay biến mới → exit 1 «kho nguon tat tren api phien».
- [ ] **Step 4:** Chiều xanh: `.env` có dòng `KHO_TAI_LIEU_BLOB_TOKEN` (kiểm bằng `grep -c '^KHO_TAI_LIEU_BLOB_TOKEN=' .env`, không in giá trị) → chạy `msd_blob_that` và `msd_man_tai_nguon` qua `mot-luot.sh`, exit 0. `.env` chưa có dòng → nhắc chủ kho một dòng, không chặn S3 (E6 sẽ đỏ-có-tên ở S4).
- [ ] **Step 5:** Dòng sổ `may-soan-de-xuat` (công thức DEC-ID-RECIPE): `type: revisit`, `stage: gate2`, decision «AC-5 được thay bởi AC-3 của kho-nguon-khoa-rieng: kho nguồn đọc KHO_TAI_LIEU_BLOB_TOKEN, không lùi sang BLOB_READ_WRITE_TOKEN».
- [ ] **Step 6:** commit `chore(acceptance): bàn đo may-soan-de-xuat theo khoá kho nguồn`.

## Cuối S3

`bun run check-types`, `bun run lint`, `bun run lint:slop` xanh; contract `status: implemented`; dispatch S4.
