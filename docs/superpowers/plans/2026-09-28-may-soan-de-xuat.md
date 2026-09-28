# Máy soạn bản đề xuất — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nhân viên tải tệp `.docx`/PDF có chữ lên kho tài liệu; `apps/agent` đọc chữ và soạn một bản đề xuất có trích đoạn nguồn cho từng số mới; chủ trang đọc nguồn cạnh bản máy soạn rồi duyệt bằng luồng lượt 1.

**Architecture:** Trình duyệt PUT thẳng vào Vercel Blob private bằng URL ký; `taiLieu.nguon.nhan` đọc lại byte, băm `sha256`, ghi `TaiLieuNguon` + một `AgentTask` loại trực tiếp `soan-tu-nguon`. Trình xử lý ở agent đọc chữ bằng mã, rồi mở phiên `subagent may_soan` (không mạng, một `tool` `nop_ban_de_xuat`); tool kiểm trích đoạn và từng số bằng mã rồi gọi hàm tạo đề xuất dùng chung với API ở `packages/db`.

**Tech Stack:** Prisma 7 (Postgres/Neon), NestJS + nestjs-trpc, eve (`apps/agent`), AI SDK `createGateway`, `@vercel/blob` 2.6.1 (`private`, `presignUrl`), Next.js 16 App Router, `@crm/ui`, Bun test.

**Spec:** `docs/superpowers/specs/2026-09-28-may-soan-de-xuat-design.md` · Hợp đồng: `_acceptance/may-soan-de-xuat/contract.md` · Phép đo: `_acceptance/may-soan-de-xuat/evals.yaml`

## Tiền đề — chưa có thì task tương ứng không bắt đầu

| Tiền đề | Chặn | Ai |
| --- | --- | --- |
| PR #180 (lượt 1) đã lên `onehub`; kéo `origin/onehub` vào nhánh | Đã đạt 2026-09-28 (`c1e37b73`, merge vào nhánh) | — |
| Trang «Quy tắc viết» do chủ kho viết, đặt ở `_acceptance/may-soan-de-xuat/mau/quy-tac-viet.md` | Task 12 (E15a, E15j); các task khác dùng bản giả trong test | Chủ kho |
| `BLOB_READ_WRITE_TOKEN` thật trong `.env` gốc | E2t, E15a | Chủ kho |
| Ba tệp mẫu thật (`quyet-dinh-hoa-hong.docx`, `quy-trinh.pdf`, `bieu-mau.docx`), đã bỏ dữ liệu cá nhân | Task 12 | Chủ kho (máy dùng tệp tự dựng cho E6) |

## Global Constraints

- Không viết chú thích trong mã (`AGENTS.md`).
- Trí khôn ở `apps/agent`; API chỉ ghi hàng `AgentTask`, không đọc docx/PDF, không gọi model (`docs/api.md`).
- Một `.env` ở gốc; biến mới vào `.env.example`, `globalPassThroughEnv` của `turbo.json` (không `env`), `env.validation.ts` nếu API đọc (`docs/environment.md`).
- Thiếu khoá thì bỏ năng lực, không bao giờ ném lỗi (`AGENTS.md`).
- Hằng có thể chỉnh sống trong một tệp cấu hình theo khu: `apps/agent/agent/lib/tai-lieu-config.ts` và `packages/validation/src/tai-lieu.ts` (`TAI_LIEU`), dẫn đơn vị từ một gốc.
- `Json` parse ở biên bằng Zod ở `packages/validation/src/<khuôn>.ts`, import theo subpath.
- Client component không import `@crm/db`, `@crm/auth`; bản mẫu chỉ import `@crm/ui/components/<tên>`.
- Giao diện: `packages/ui` là nguồn duy nhất; thành phần mới đi năm bậc của `docs/design.md`; không `className` đổi màu/góc/khoảng cách.
- Nhãn theo `CONTEXT.md`: nguồn, bản đề xuất, bản đang dùng, chủ trang, máy soạn; tên tệp và chữ nguồn gắn `translate="no"`.
- Tệp tới 20 MB; chỉ `.docx`, `.pdf`; URL tải về sống ≤ 300 giây; blob luôn `private`.
- `subagent may_soan`: tool đúng một `nop_ban_de_xuat`, sandbox `deny-all`, model là hằng trong cấu hình khu, không đọc `AppSetting`; khuôn không `$ref` vòng (`docs/agent.md` luật 1–8).
- Mỗi phép đo mới đi kèm cặp hai chiều trên cùng fixture, chiều đỏ có thông điệp ghim (MEASURE-BIRTH-CLAUSE của feature-loop).
- Bốn lệnh cổng từ gốc: `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test`, `bun run build`.

## Review Focus

- Con số trùng một phần số khác trong trích («20%» và «2026») — người đọc mong bị bác. Test ở Task 3 (E9 nhóm biên).
- Blob đã PUT nhưng `nhan` bị từ chối hay trùng — người mong không để rác trong Blob. Test ở Task 5 (Blob giả ghi nhận `del`).
- Phiên soạn đang chạy thì người bấm «Soạn lại» — người mong không có hai bản đề xuất máy cho một nguồn. Test ở Task 5 (`CONFLICT` khi `DANG_SOAN`).
- Bản đang dùng của trang đích đổi trong lúc máy soạn — người mong bản máy thành «cũ» theo luật lượt 1, không đè. Test ở Task 7 (bản gốc lấy lúc soạn; duyệt bản khác trước → bản máy «cũ»).
- Tệp `.docx` có theo dõi thay đổi (`w:ins`/`w:del`) — người mong chữ đọc ra là bản đã chấp nhận, không lẫn chữ bị xoá. Test ở Task 6 (thêm tệp mẫu `theo-doi.docx` vào ma trận E6 như ca thứ 9).

---

### Task 1: Lược đồ nguồn và `migration` chỉ thêm

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (khối `TaiLieu*`, dòng ~2236–2330)
- Create: `packages/db/prisma/migrations/20261002010000_may_soan_de_xuat/migration.sql`
- Create: `_acceptance/may-soan-de-xuat/rang/migration-chi-them.mjs`, `_acceptance/may-soan-de-xuat/rang/migration-tren-ban-sao.mjs`

**Interfaces:**
- Produces: model `TaiLieuNguon` và hai cột trên `TaiLieuDeXuat`:

```prisma
model TaiLieuNguon {
  id           String   @id @default(cuid())
  sha256       String   @unique
  tenTep       String
  kieu         String
  kichThuoc    Int
  blobPathname String   @unique
  taiBoiId     String
  taiBoi       User     @relation("TaiLieuNguonTaiBoi", fields: [taiBoiId], references: [id])
  taiLuc       DateTime @default(now())
  trangId      String
  trang        TaiLieuTrang @relation("TaiLieuNguonCuaTrang", fields: [trangId], references: [id])
  trangThai    String   @default("CHO_DOC")
  lyDo         String?
  chu          String?
  soTrang      Int?
  deXuat       TaiLieuDeXuat[]
  @@index([trangId])
  @@index([taiBoiId])
}
```

  `TaiLieuDeXuat` thêm `nguonId String?` (quan hệ tới `TaiLieuNguon`, `onDelete: Restrict`) và `trichDoan Json?`, chỉ mục `@@index([nguonId])`. `TaiLieuTrang` và `User` thêm trường quan hệ ngược (không sinh cột).

- [ ] **Step 1:** Viết `migration-chi-them.mjs` theo E1 (suy gốc từ `import.meta.url`, tập lệnh cho phép viết trước, bốn tệp giả chiều đỏ trong `os.tmpdir()`, in «doi chung: do dung» trước kết quả thật). Chạy: `node _acceptance/may-soan-de-xuat/rang/migration-chi-them.mjs` → mong đỏ «khong co migration moi» (chưa có thư mục).
- [ ] **Step 2:** Sửa `schema.prisma`, chạy `cd packages/db && bunx prisma migrate dev --create-only --name may_soan_de_xuat`, đổi tên thư mục theo mốc trên, đọc SQL: chỉ `CREATE TABLE`, `CREATE [UNIQUE] INDEX`, `ALTER TABLE "TaiLieuDeXuat" ADD COLUMN` rỗng được, `ADD CONSTRAINT … FOREIGN KEY`.
- [ ] **Step 3:** Chạy lại script E1 → xanh; chạy chiều đỏ trong cùng lệnh → bốn thông điệp ghim.
- [ ] **Step 4:** Viết `migration-tren-ban-sao.mjs` theo E1b (kho tạm, áp migration ở `5e3e35b9`, gieo SQL, chụp số dòng, áp nhánh, so, `finally` drop). Chạy → xanh; chạy với migration giả `DELETE` → «bang cu mat dong: TaiLieuDeXuat 4 -> 3».
- [ ] **Step 5:** `cd packages/db && bun run db:generate && cd ../.. && bun run check-types` → xanh.
- [ ] **Step 6:** Commit `feat(may-soan): lược đồ TaiLieuNguon và cột nguồn của đề xuất`.

Phục vụ: E1, E1b · `independent: false`

### Task 2: Hàm tạo đề xuất dùng chung

**Files:**
- Create: `packages/db/src/tai-lieu-de-xuat.ts` (+ export subpath `@crm/db/tai-lieu-de-xuat` trong `packages/db/package.json`)
- Modify: `apps/api/src/tai-lieu/tai-lieu.service.ts` (`create`, `propose` gọi hàm chung)
- Test: `packages/db/test/tai-lieu-de-xuat.spec.ts`

**Interfaces:**
- Consumes: Task 1 (`nguonId`, `trichDoan`).
- Produces:

```ts
export type DeXuatMoi = {
	trangId: string;
	banGocId: string | null;
	ten: string;
	noiDung: string;
	taoBoiId: string;
	nguonId?: string | null;
	trichDoan?: TrichDoan[] | null;
};

export async function taoDeXuatTaiLieu(
	tx: Prisma.TransactionClient,
	moi: DeXuatMoi,
): Promise<{ deXuatId: string }>;
```

  Hàm NFC + `chuanHoa` nội dung, tạo `TaiLieuDeXuat`, ghi `TaiLieuSuKien` `DE_XUAT` (hoặc `TAO` khi `banGocId` rỗng và trang chưa có đề xuất nào), trả id. `TrichDoan` lấy từ Task 3 (`@crm/validation/tai-lieu-trich-doan`).

- [ ] **Step 1:** Test: gọi `taoDeXuatTaiLieu` với nội dung NFD → hàng lưu NFC; có `nguonId` → hàng mang `nguonId`, `trichDoan` đọc lại qua `parseTrichDoan` bằng mảng đã gửi; sự kiện `DE_XUAT` có `deXuatId`. Chạy `cd packages/db && bun test test/tai-lieu-de-xuat.spec.ts` → đỏ (chưa có hàm).
- [ ] **Step 2:** Viết hàm; đổi `create`/`propose` của service lượt 1 sang gọi nó (giữ nguyên thứ tự khoá `FOR UPDATE`, kiểm `chuaDoi` vẫn ở service).
- [ ] **Step 3:** Chạy test mới + toàn bộ test lượt 1: `bun run test -- "cd apps/api && bun test test/tai-lieu.spec.ts test/tai-lieu-khong-ro.spec.ts test/tai-lieu-quyen.spec.ts"` → xanh.
- [ ] **Step 4:** Phá-thử: bản sao bỏ NFC trong hàm chung → test lượt 1 «noi dung khong NFC» đỏ. Hoàn nguyên.
- [ ] **Step 5:** Commit `refactor(tai-lieu): một hàm tạo đề xuất cho API và máy soạn`.

Phục vụ: E7 (một đường ghi), giữ E2/E4 lượt 1 · `independent: false`

### Task 3: Khuôn trích đoạn, `quote_key` và kiểm số

**Files:**
- Create: `packages/validation/src/tai-lieu-trich-doan.ts`, `packages/validation/src/tai-lieu-so.ts`
- Test: `packages/validation/test/tai-lieu-kiem-so.spec.ts`

**Interfaces:**
- Produces:

```ts
export const trichDoan = z.object({
	menhDe: z.string().trim().min(1).max(300),
	trich: z.string().trim().min(1).max(600),
});
export type TrichDoan = z.infer<typeof trichDoan>;
export const danhSachTrichDoan = z.array(trichDoan).max(60);
export function parseTrichDoan(value: unknown): TrichDoan[];

export function quoteKey(s: string): string;
export function rutSo(markdown: string): string[];
export type KetQuaKiem =
	| { ok: true }
	| { ok: false; loi: { loai: "so-khong-trich" | "trich-khong-co"; chi: string }[] };
export function kiemBanMay(input: {
	noiDung: string;
	trichDoan: TrichDoan[];
	chuNguon: string;
	banGoc: string | null;
}): KetQuaKiem;
```

  `quoteKey`: NFC → quy đổi vị trí dấu thanh kiểu cũ/mới (`oà`/`òa`, `oá`/`óa`, `oạ`/`ọa`, `oả`/`ỏa`, `oã`/`õa`, `uý`/`úy`, `uỳ`/`ùy`…) về một kiểu → bỏ U+00A0, U+200B–U+200D, U+FEFF → gộp khoảng trắng → nháy `“”‘’` thành `"`/`'`, gạch `–—` thành `-`. `rutSo` đi cây markdown của lượt 1 (`nap` ở `tai-lieu-markdown.ts`), chỉ nút chữ, bỏ số thứ tự danh sách, bắt số kiểu Việt `\d{1,3}(\.\d{3})*(,\d+)?%?` và ngày `\d{1,2}/\d{1,2}/\d{4}`. So khớp trọn vẹn: một số `s` có mặt trong trích `t` khi `quoteKey(t)` chứa `s` với ký tự trước và sau không phải chữ số, `,` hay `.` nối số.

- [ ] **Step 1:** Viết đủ 12 ca của E9 (bảng viết trước trong `evals.yaml`, mỗi ca một `test(...)` tên theo ca), gọi `kiemBanMay`. Chạy `cd packages/validation && bun test test/tai-lieu-kiem-so.spec.ts` → đỏ.
- [ ] **Step 2:** Viết `quoteKey`, `rutSo`, `kiemBanMay`, `trichDoan`.
- [ ] **Step 3:** Chạy → 12 xanh. Phá-thử hai bản sao: so chuỗi thô → «bac oan: dau-thanh»; `includes` thô → «so khop mot phan: 20%».
- [ ] **Step 4:** Commit `feat(may-soan): kiểm trích đoạn và số mới bằng mã`.

Phục vụ: E9 · `independent: true` (chỉ chạm `packages/validation`)

### Task 4: Cổng Blob nguồn (private) và bản giả

**Files:**
- Create: `packages/db/src/blob-nguon.ts` (+ subpath `@crm/db/blob-nguon`), `packages/db/test/blob-nguon-gia.ts`
- Test: `packages/db/test/blob-nguon.spec.ts`

**Interfaces:**
- Produces:

```ts
export type KhoNguon = {
	bat(): boolean;
	kyPut(pathname: string, opts: { kieu: "docx" | "pdf"; toiDa: number }): Promise<{ url: string; hetHan: number }>;
	doc(pathname: string): Promise<Uint8Array | null>;
	xoa(pathname: string): Promise<void>;
	kyGet(pathname: string, giay: number): Promise<{ url: string; hetHan: number }>;
};
export function khoNguonVercel(): KhoNguon;
export function khoNguonGia(): KhoNguon & { daPut: Map<string, Uint8Array>; daXoa: string[]; kyGetCuoi: number | null };
export const PATHNAME_NGUON = (id: string) => `kho-tai-lieu/nguon/${id}`;
```

  `khoNguonVercel` dùng `presignUrl`, `get(..., { access: "private" })`, `del`; `bat()` đọc `BLOB_READ_WRITE_TOKEN` lúc gọi. Tra `packages/db/node_modules/@vercel/blob/dist/*.d.ts` (`PresignPutUrlOptions`, `PresignGetUrlOptions`) trước khi viết — không đoán chữ ký.

- [ ] **Step 1:** Test bản giả: `kyGet(…, 300)` ghi `kyGetCuoi = 300`; `doc` sau `daPut.set` trả đúng byte; `bat()` false khi token rỗng với `khoNguonVercel`. Chạy → đỏ.
- [ ] **Step 2:** Viết hai bản. Chạy → xanh; `bun run check-types`.
- [ ] **Step 3:** Commit `feat(may-soan): cổng Blob private cho nguồn`.

Phục vụ: E2, E3, E4, E12 (hạ tầng đo) · `independent: true`

### Task 5: API nguồn — nạp, trùng, từ chối, tải về, soạn lại, quyền

**Files:**
- Create: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts`, `apps/api/src/tai-lieu/tai-lieu-nguon.contracts.ts`
- Modify: `apps/api/src/tai-lieu/tai-lieu.router.ts` (thủ tục `nguonXinCho`, `nguonNhan`, `nguonList`, `nguonGet`, `nguonTaiVe`, `nguonSoanLai`, `nguonTrangThai` — tên cuối theo nếp alias của router lượt 1), `tai-lieu.module.ts` (provider `KhoNguon`), `tai-lieu.contracts.ts` (`propose` nhận `tuDeXuatId?`), `tai-lieu.service.ts` (`propose` chép `nguonId`/`trichDoan` khi `tuDeXuatId` là bản máy người đó thấy được), `apps/api/src/config/env.validation.ts` (đã có `BLOB_READ_WRITE_TOKEN` — kiểm), `packages/db/src/agent-tasks.ts` (`"soan-tu-nguon"` vào `TASK_KINDS`, `DIRECT_KINDS`, `PRIORITY` 300), `packages/validation/src/tai-lieu.ts` (`TAI_LIEU.nguon`: `toiDaByte: 20 * MB`, `giayTaiVe: 300`, thông điệp), `apps/api/test/vai-chi-okr.spec.ts` (danh sách ghim, sửa có ý thức), `apps/api/src/generated/server.ts` (`bun run trpc:generate`)
- Test: `apps/api/test/tai-lieu-nguon.spec.ts`, `tai-lieu-nguon-tat.spec.ts`, `tai-lieu-nguon-khong-ro.spec.ts`, `tai-lieu-nguon-duyet.spec.ts`
- Create: `_acceptance/may-soan-de-xuat/rang/blob-that.mjs`

**Interfaces:**
- Consumes: Task 1, 2, 4.
- Produces (tRPC, phạm vi chung, `PhamViChungMiddleware`):
  - `xinCho({ tenTep, kichThuoc, kieu }) → { pathname, url, hetHan }`
  - `nhan({ pathname, tenTep, dich: { loai: "moi", ten, loaiTrang, chuTrangId, departmentId? } | { loai: "cap-nhat", slug } }) → { nguonId, trung: boolean }`
  - `list() → { rows: NguonDong[] }` với `NguonDong = { id, tenTep, kieu, trangThai, lyDo, taiLuc, taiBoi, trang: { slug, ten }, deXuatId: string | null, coTheSoanLai: boolean }`
  - `get({ id }) → NguonDong & { chu: string | null }`
  - `taiVe({ id }) → { url, hetHan }`
  - `soanLai({ id }) → { ok: true }`
  - `trangThai() → { bat: boolean }`
  - Quyền: một hàm `dieuKienThayNguon(nguoi)` (người tải · người duyệt được của trang đích · mọi thành viên khi có `TaiLieuPhienBan` mà `deXuat.nguonId` = nguồn) dùng cho `list/get/taiVe/soanLai`; ngoài quyền → `NOT_FOUND` cùng thông điệp với id không có.

- [ ] **Step 1:** Viết test theo E2 (4 ca), E3 (6 ca + đối chứng 20 MB), E4 (trùng, bản mới, quét AST có đối chứng), E5 (`tai-lieu-nguon-tat.spec.ts`, đặt env trước `import()` động của `AppModule`), E10b (6 người + `CONFLICT`), E12 (72 khẳng định, N2 dựng bằng `approve` thật), E8b (ma trận duyệt + ca «Sửa bản này» giữ nguồn). Dùng `khoNguonGia()` qua provider. Chạy từng lệnh `config:executors.test.msd_*` tương ứng → đỏ.
- [ ] **Step 2:** Viết contracts + service + router; `nhan` trong một `$transaction`: đọc byte bằng `KhoNguon.doc`, `sha256` bằng `crypto.subtle.digest`, kiểm chữ ký (`%PDF-` ở 5 byte đầu; zip `PK\x03\x04` có mục `word/document.xml` — đọc central directory bằng mã, không thêm thư viện), khoá trùng bằng `sha256` duy nhất (bắt `P2002` → trả nguồn cũ, xoá blob mới), với đích mới thì tạo `TaiLieuTrang` (slug bằng `sinhSlug` của lượt 1, chưa có bản đang dùng, chưa có đề xuất, `taoBoiId` người tải) — không đi qua `create` của lượt 1 vì `create` bắt buộc có nội dung; với đích cập nhật thì kiểm trang có bản đang dùng, ghi `AgentTask { kind: "soan-tu-nguon", payload: { nguonId }, priority: PRIORITY["soan-tu-nguon"] }`, sau commit gọi `poke()`.
- [ ] **Step 3:** `cd apps/api && bun run trpc:generate`; sửa danh sách ghim `vai-chi-okr.spec.ts`.
- [ ] **Step 4:** Chạy lại toàn bộ lệnh `msd_nguon_*`, `msd_khong_blob` (phần API), `msd_soan_lai`, `msd_nguon_khong_ro`, `msd_duyet_ban_may` → xanh; phá-thử theo chiều đỏ của từng eval, thông điệp ghim đúng chữ.
- [ ] **Step 5:** Viết `blob-that.mjs` theo E2t; chạy không token → thoát 2 «thieu BLOB_READ_WRITE_TOKEN that»; chạy với token thật trong phiên đo (`bun scripts/lan-do/tien-de.mjs --chay …`) → 4 bước đạt.
- [ ] **Step 6:** Commit `feat(may-soan): API nạp, tải về và soạn lại nguồn`.

Phục vụ: E2, E2t, E3, E4, E5, E8b, E10b, E12 · `independent: false`

### Task 6: Agent — loại việc `soan-tu-nguon` và đọc chữ

**Files:**
- Create: `apps/agent/agent/lib/tai-lieu-config.ts`, `apps/agent/agent/lib/tai-lieu-doc-chu.ts`, `apps/agent/agent/lib/tai-lieu-soan.ts` (trình xử lý việc; phần mở phiên để Task 7)
- Modify: `apps/agent/agent/lib/dispatch.ts` (nhánh `task.kind === "soan-tu-nguon"`), `apps/agent/agent/lib/capabilities.ts` (năng lực «lưu nguồn» từ `BLOB_READ_WRITE_TOKEN`, id `luu-nguon`), `apps/agent/package.json` (thư viện đọc docx và PDF)
- Create: `_acceptance/may-soan-de-xuat/mau/` 9 tệp của ma trận E6 (+ `theo-doi.docx`) và `mau/README.md` nói cách dựng từng tệp
- Test: `apps/agent/test/tai-lieu-doc-chu.spec.ts`, `apps/agent/test/capabilities.spec.ts` (thêm ca `luu-nguon`)

**Interfaces:**
- Consumes: Task 1, 4.
- Produces:

```ts
export const TAI_LIEU_AGENT = {
	docChu: { toiThieuKyTuMoiTrang: 40, tiLeKyTuHongToiDa: 0.02, toiDaKyTu: 120_000 },
	soan: { maModel: "zai/glm-5.2-fast", tranBuoc: 6, thoiGianMs: 4 * MINUTE_MS, slugQuyTacViet: "quy-tac-viet" },
	bangGia: { "zai/glm-5.2-fast": { vaoMoiTrieu: 0, raMoiTrieu: 0 } },
} as const;

export type KetQuaDocChu =
	| { loai: "chu"; chu: string; soTrang: number }
	| { loai: "can-go-tay"; lyDo: string }
	| { loai: "loi"; lyDo: string };
export async function docChu(byte: Uint8Array, kieu: "docx" | "pdf"): Promise<KetQuaDocChu>;
export async function chaySoanTuNguon(task: LeasedTask, deps: { kho: KhoNguon; moPhien: MoPhienMaySoan }): Promise<void>;
```

  Giá trong `bangGia` điền đúng giá công bố của mã model ở AI Gateway lúc làm S3 (tra trang model của Gateway), không để 0. Thư viện: chọn ở bước 1 theo giấy phép MIT/BSD/Apache (ứng viên `mammoth` BSD-2 cho docx, đọc `w:ins` như chữ đã chấp nhận; `unpdf` MIT cho PDF). Ghi lựa chọn vào sổ quyết định (`approach`).

- [ ] **Step 1:** Dựng 9 tệp mẫu bằng script trong `mau/README.md` (docx qua `docx` hay zip tay; PDF có chữ qua `pdf-lib`; bản quét là PDF chỉ ảnh; `cid.pdf`, `fffd.pdf` bằng lớp chữ ghi thẳng chuỗi hỏng; `mat-khau.pdf` mã hoá). Viết test E6 (9 ca, gồm `theo-doi.docx`), suy đường tệp từ `import.meta.dir`. Chạy `msd_doc_chu` → đỏ.
- [ ] **Step 2:** Cài thư viện (`cd apps/agent && bun add …`), viết `docChu` (thử độ tin theo trang), `chaySoanTuNguon` (tải byte, băm lại, `docChu`, ghi `chu`/`soTrang`/`trangThai`, gọi `deps.moPhien` chỉ khi `loai: "chu"`, `completeTask` với kết cục một dòng), nhánh trong `dispatch.ts`, năng lực `luu-nguon`.
- [ ] **Step 3:** Chạy → xanh; phá-thử ngưỡng vô hạn → «ban loi ma lot qua: cid.pdf».
- [ ] **Step 4:** Commit `feat(may-soan): đọc chữ docx và PDF, cờ cần gõ tay`.

Phục vụ: E6, E5 (phần agent) · `independent: false`

### Task 7: `subagent may_soan`, `nop_ban_de_xuat`, khoá thứ hai, sổ chi phí

**Files:**
- Create: `apps/agent/agent/subagents/may_soan/agent.ts`, `instructions.md`, `sandbox/sandbox.ts`, `tools/nop_ban_de_xuat.ts`
- Create: `apps/agent/agent/lib/tai-lieu-model.ts` (dựng model theo khoá), `apps/agent/agent/lib/tai-lieu-phien.ts` (`MoPhienMaySoan`: dựng tin nhắn có khối dữ liệu phân cách, mở phiên, chờ kết thúc, ghi `MAY_SOAN`)
- Modify: `.env.example`, `turbo.json` (`globalPassThroughEnv`), `apps/agent/package.json` (dev pass-through), `apps/agent/agent/lib/capabilities.ts` (`KHO_TAI_LIEU_AI_GATEWAY_API_KEY`)
- Create: `_acceptance/may-soan-de-xuat/rang/quet-duong-ghi.mjs`, `_acceptance/may-soan-de-xuat/rang/bien-ba-nha.mjs`
- Test: `apps/agent/test/tai-lieu-soan.integration.spec.ts`, `tai-lieu-khoa-rieng.spec.ts`, `tai-lieu-ranh-gioi.spec.ts`, `nop-ban-de-xuat.spec.ts`

**Interfaces:**
- Consumes: Task 2 (`taoDeXuatTaiLieu`), Task 3 (`kiemBanMay`, `danhSachTrichDoan`), Task 6 (`TAI_LIEU_AGENT`, `chaySoanTuNguon`).
- Produces:

```ts
export function modelMaySoan(env = process.env): { model: LanguageModel; nhanKhoa: "rieng" | "chung" };
export type MoPhienMaySoan = (input: { nguonId: string; trangId: string; chuNguon: string; quyTacViet: string; banGoc: { ten: string; noiDung: string } | null }) => Promise<{ ok: true } | { ok: false; lyDo: string }>;
```

  `nop_ban_de_xuat` nhận `{ ten, noiDung, trichDoan }` (khuôn phẳng), đọc `nguonId` từ trạng thái phiên (không từ model), gọi `kiemBanMay`, bác thì trả lỗi nêu đích danh; đạt thì trong một `$transaction` kiểm nguồn còn `DANG_SOAN`, gọi `taoDeXuatTaiLieu`, đặt nguồn `DA_SOAN`. Mở phiên theo khuôn `dispatchAgentRun` (`lib/custom-agent-dispatch.ts`): gửi tin cho `subagent may_soan` với thuộc tính phiên `nguonId`; đọc eve docs `subagents.mdx`, `agent-config.md` trước khi viết. Model: `createGateway({ apiKey })` khi có khoá, không thì `gateway(TAI_LIEU_AGENT.soan.maModel)`. Sự kiện `MAY_SOAN` ghi `{ maModel, nhanKhoa, tokenVao, tokenRa, chiPhiUsd, soLanBac }`.

- [ ] **Step 1:** Viết test theo E7 (hai đích, mốc `MOC-QUY-TAC-7Q`, spy hàm ghi chung), E10 (7 ca hỏng, `afterEach(() => setSystemTime())`), E13 (hai ca khoá, usage 1200/340, `chiPhiUsd`), E14 (tập tool, sandbox, AST không `AppSetting`, mốc `NGUON-MOC-7Q` chỉ trong khối dữ liệu), `nop-ban-de-xuat.spec.ts` (E9 qua `execute`). Model giả bằng `mockModel` của eve/AI SDK. Chạy từng lệnh `msd_*` → đỏ.
- [ ] **Step 2:** Viết `subagent`, tool, model, phiên; ba nhà của biến.
- [ ] **Step 3:** Viết `quet-duong-ghi.mjs` (E8) và `bien-ba-nha.mjs` (E13b) kèm chiều đỏ trong tmpdir.
- [ ] **Step 4:** Chạy lại `msd_soan_dat`, `msd_soan_hong`, `msd_khoa_rieng`, `msd_ranh_gioi`, `msd_kiem_so`, `msd_quet_duong_ghi`, `msd_bien_ba_nha` → xanh; phá-thử từng chiều đỏ.
- [ ] **Step 5:** Commit `feat(may-soan): subagent máy soạn, kiểm số trước khi ghi, khoá AI thứ hai`.

Phục vụ: E7, E8, E9, E10, E13, E13b, E14 · `independent: false`

### Task 8: Thành phần giao diện mới trong `packages/ui`

**Files:**
- Create (sau khi tra ReUI): `packages/ui/src/components/nguon-keo-tha.tsx` (vùng kéo thả) hoặc cài `@reui/<mục>` theo `docs/reui.md`; `packages/ui/src/components/nguon-canh-nhau.tsx` (khung nguồn cạnh bản trình bày, `mark` tô đoạn trích, hai thẻ ở màn hẹp)
- Test: `packages/ui/test/nguon-canh-nhau.dom.tsx`

**Interfaces:**
- Produces:

```ts
export function NguonKeoTha(props: { nhan: string; moTa: string; chapNhan: string; toiDaByte: number; tat?: { lyDo: string }; onChon: (tep: File) => void; loi?: string }): JSX.Element;
export function NguonCanhNhau(props: { chuNguon: string; doanTrich: string[]; banTrinhBay: React.ReactNode; nhanNguon: string; nhanBan: string }): JSX.Element;
```

- [ ] **Step 1:** Tra năm bậc: `packages/ui` hiện có → shadcn chưa cài → ReUI (`search` «file upload», «dropzone»; `get_component`; `--dry-run`) → ghi câu tra vào mô tả PR. Viết test DOM: `mark` đủ số đoạn, `translate="no"` trên chữ nguồn, hai thẻ khi `matchMedia` hẹp. Chạy → đỏ.
- [ ] **Step 2:** Dựng/cài, chạy test, `cd packages/ui && bun run lint`.
- [ ] **Step 3:** Commit `feat(ui): vùng kéo thả tệp và khung nguồn cạnh nhau`.

Phục vụ: E11, E11s, E2u · `independent: true` (chỉ `packages/ui`, dùng props giả)

### Task 9: Màn tải nguồn và tab «Nguồn»

**Files:**
- Create: `apps/app/app/(app)/[slug]/tai-lieu/nguon/page.tsx` (hoặc tab trong `page.tsx` theo khuôn lượt 1), `apps/app/app/(app)/[slug]/tai-lieu/hop-tai-nguon.tsx`, `apps/app/app/(app)/[slug]/tai-lieu/bang-nguon.tsx`
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach.tsx` (nút «Tải nguồn lên», tab «Nguồn»), `packages/ui/src/locales/**` nếu kho đặt chữ ở đó (theo nếp lượt 1)
- Create: `_acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs`
- Test: `apps/app/test/tai-lieu-nguon.dom.tsx`

**Interfaces:**
- Consumes: Task 5 (thủ tục `nguon*`), Task 8 (`NguonKeoTha`).

- [ ] **Step 1:** Test DOM theo E3d (`-t tai-loi`), E5d (`-t nguon-tat`), E10d (`-t hang-nguon`, 6 khẳng định). Chạy ba lệnh → đỏ.
- [ ] **Step 2:** Dựng hộp tải (PUT bằng `fetch` tới URL của `xinCho`, `Progress`, huỷ bằng `AbortController`), chọn đích (`RadioGroup` + form trang mới dùng lại trường của `moi/page.tsx`; «cập nhật» chỉ liệt trang có bản đang dùng), bảng nguồn (`SimpleTable` ở ≥768, `Item` ở hẹp), nút «Soạn lại» theo `coTheSoanLai`. Invalidate `list` sau `nhan`.
- [ ] **Step 3:** Chạy test → xanh. Viết `man-tai-nguon.mjs` theo E2u (canh cây, phiên đo, Blob giả qua biến của phiên đo), chạy `msd_man_tai_nguon` → 3 bước đạt; chiều đỏ ẩn tab.
- [ ] **Step 4:** `bun run check-types && bun run lint && bun run lint:slop`. Commit `feat(may-soan): hộp tải nguồn và tab Nguồn`.

Phục vụ: E2u, E3d, E5d, E10d · `independent: false`

### Task 10: Màn duyệt bản máy soạn và mục «Nguồn» trên màn đọc

**Files:**
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/de-xuat/[id]/man-duyet.tsx` (nhánh bản máy: bước 1 → bước 2), `apps/app/app/(app)/[slug]/tai-lieu/man-doc.tsx` (mục «Nguồn» + tải về), `apps/app/app/(app)/[slug]/tai-lieu/[trang]/sua/page.tsx` (gửi `tuDeXuatId` khi mở từ bản máy)
- Modify: `apps/api/src/tai-lieu/tai-lieu.contracts.ts` (`taiLieuProposalOutput` thêm `nguon: { id, tenTep } | null`, `trichDoan`, `chuNguon`, `soMoi: string[]` cho người thấy được; `taiLieuApproveInput` thêm `daDoiChieu?: number`), `apps/api/src/tai-lieu/tai-lieu.service.ts` (`approve` bản có `nguonId`: tính lại `rutSo` mới so với bản gốc, từ chối khi `daDoiChieu` nhỏ hơn — thông điệp «chưa đối chiếu hết con số»)
- Create: `_acceptance/may-soan-de-xuat/rang/man-duyet-may.mjs`
- Test: `apps/app/test/tai-lieu-man-duyet-may.dom.tsx`

**Interfaces:**
- Consumes: Task 5, Task 8 (`NguonCanhNhau`), Task 3 (`rutSo` cho bảng Con số và ngày).

- [ ] **Step 1:** Test DOM theo E11 (bước 1 không có «Duyệt», `activeElement`, ba nút không `data-variant="default"`, ma trận tick 4 ca, remount về bước 1 mất tick; hai chiều đỏ). Chạy → đỏ.
- [ ] **Step 2:** Dựng nhánh bản máy; bỏ «Bậc 2», «Có mâu thuẫn» (design-pass F7); mục «Nguồn» trên màn đọc gọi `nguonTaiVe` rồi mở URL.
- [ ] **Step 3:** Viết `man-duyet-may.mjs` theo E11u (4 bước, 1440 và 390), chạy `msd_man_duyet_may` (script) → đạt; chiều đỏ một cột.
- [ ] **Step 4:** Chạy `msd_san_thiet_ke` → xanh. Commit `feat(may-soan): màn duyệt nguồn trước, cạnh nhau, và tải nguồn từ màn đọc`.

Phục vụ: E11, E11b, E11u, E11s, E8b (đường sửa) · `independent: false`

### Task 11: Tài liệu, từ điển, sổ

**Files:**
- Modify: `docs/api.md` (mục router nguồn, phạm vi chung; ghi chú `nhan` đọc byte không phân tích nội dung), `docs/agent.md` (bảng «Áp dụng hôm nay» thêm dòng máy soạn; bảng làn thêm `soan-tu-nguon`), `docs/environment.md` (bảng biến tuỳ chọn thêm `KHO_TAI_LIEU_AI_GATEWAY_API_KEY`; `BLOB_READ_WRITE_TOKEN` thêm nghĩa «lưu nguồn»), `CONTEXT.md` (mục Nguồn theo quyết định Cổng Phạm vi; thêm mục «Máy soạn» nếu chưa có), `docs/plan/lo-trinh-kho-tai-lieu.md` mục 8 dòng 5

- [ ] **Step 1:** Sửa tài liệu; `bun run lint:slop` (luật chữ). Commit `docs(may-soan): API, agent, biến môi trường, từ điển`.

Phục vụ: E13b (biến có tài liệu) · `independent: true`

### Task 12: Một lượt soạn thật trên tệp mẫu của chủ kho

**Files:**
- Create: `_acceptance/may-soan-de-xuat/rang/soan-that.mjs`
- Đầu vào của chủ kho: `_acceptance/may-soan-de-xuat/mau/quy-tac-viet.md`, ba tệp mẫu thật

- [ ] **Step 1:** Viết `soan-that.mjs` theo E15a; chạy thiếu `quy-tac-viet.md` → thoát 2 «thieu trang Quy tac viet cua chu kho».
- [ ] **Step 2:** Khi tiền đề có: chạy `msd_soan_that` trong phiên đo, đọc ba bản máy soạn và chi phí in ra; nếu model hiện tại trượt kiểm số trên cả ba, dừng và trình người (đổi mã model là đổi hằng, có dòng sổ `approach`).
- [ ] **Step 3:** Đặt contract `status: implemented`; S4 chạy ngay.

Phục vụ: E15a, E15j · `independent: false`

---

## Thứ tự và song song

```
T1 ─► T2 ─┬─► T5 ─┬─► T6 ─► T7 ─► T12
T3 ───────┘       └─► T9 ─► T10
T4 ─────────► T5, T6
T8 ─────────► T9, T10
T11 (sau T5)
```

`independent: true`: T3, T4, T8, T11 — gom chạy song song bằng `execute-parallel` khi vào S3; phần còn lại tuần tự trong vòng chính.
