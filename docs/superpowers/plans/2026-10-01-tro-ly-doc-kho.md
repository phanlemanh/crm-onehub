# Trợ lý AI đọc Kho tài liệu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nhân viên hỏi kho bằng lời thường ở tab «Hỏi» hay qua bot Zalo, nhận câu trả lời có trích trang, phiên bản, đoạn nguyên văn do máy chủ kiểm; không có trang thì nhận câu từ chối cố định.

**Architecture:** Một `subagent` eve `tro_ly_kho` (khoá kho, ZDR, ba tool) được agent gốc gọi từ phiên `purpose: "kho"` (CRM) hay `purpose: "zalo"`. Hàng `TaiLieuHoi` là nguồn sự thật của mỗi câu: API ghi hàng và một `AgentTask`, agent mở phiên, `nop_tra_loi` kiểm bằng hàm thuần ở `@crm/validation/tai-lieu-hoi` rồi ghi câu trả lời đã kiểm; người hỏi chỉ thấy chữ mã dựng từ hàng đó.

**Tech Stack:** Prisma 7 + Postgres (`unaccent`), NestJS + nestjs-trpc, eve 0.29.4 (`defineAgent`, `defineTool`, `defineHook`, `disableTool`), AI SDK `createGateway` + `wrapLanguageModel`, Next.js App Router, AI Elements, `bun test`, happy-dom.

**Spec:** `docs/superpowers/specs/2026-10-01-tro-ly-doc-kho-design.md` · Hợp đồng: `_acceptance/tro-ly-doc-kho/contract.md` (15 AC) · Evals: `_acceptance/tro-ly-doc-kho/evals.yaml` (22 eval, khoá `config:executors.*.tlk_*`).

## Global Constraints

- Không viết chú thích trong mã, kể cả mã sửa (`AGENTS.md`).
- Trí khôn chỉ ở `apps/agent`; API chỉ ghi hàng và `AgentTask` (`docs/api.md`).
- Hằng có thể chỉnh nằm trong một module cấu hình theo khu: `TAI_LIEU_AGENT.hoi` (`apps/agent/agent/lib/tai-lieu-config.ts`), `TAI_LIEU_HOI` (`packages/validation/src/tai-lieu-hoi.ts`) cho câu cố định, trần và ngưỡng dùng chung API–agent; đơn vị từ `MINUTE_MS`, `NGHIN`.
- Parse ở biên bằng Zod: `TaiLieuHoi.traLoi`, `ganNhat` đọc qua khuôn của `@crm/validation/tai-lieu-hoi`; không `Record<string, unknown>`.
- Mọi chuỗi trang và đoạn trích so sánh sau `chuanNfc` (`@crm/validation/tai-lieu`).
- Trạng thái lưu dạng `String` + hằng `as const` (kho không dùng enum Prisma cho Kho tài liệu).
- `migration` tên `20261010010000_tro_ly_doc_kho`; trước khi mở PR chạy `git fetch origin onehub && ls` thư mục migrations của `origin/onehub`, đổi mốc nếu có mốc ≥ nó.
- UI chỉ từ `packages/ui`; thành phần AI Elements kéo bằng `bunx --bun ai-elements@latest add <tên>` trong `packages/ui`, nối vào màn trong cùng commit (cổng mồ côi).
- Nhãn trên màn «trợ lý AI», không «tác nhân»; chữ người nhập và đoạn trích mang `translate="no"`.
- Ngày theo giờ Việt Nam bằng `dauNgayVN`/`ngayVN` (`@crm/db/onboarding-nhac`); test có `TZ=Asia/Ho_Chi_Minh`, `afterEach(() => setSystemTime())`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, bản sao phá đỏ với thông điệp ghim (`MEASURE-BIRTH-CLAUSE`); bản sao đặt ở `.acceptance-runs/tro-ly-doc-kho/` (không trong gói).
- Đẩy và chạy làn ghim lại với `export PATH="$(brew --prefix bun@1.3.12)/bin:$PATH"`.

## Review Focus

- Hai câu Zalo cùng ngày dùng chung một phiên gốc: `hoiCuaPhien` phải lấy đúng hàng «đang hỏi» mới nhất, câu trước đã đóng không bị ghi đè — test ở Task 6.
- `nop_tra_loi` gọi sau khi hàng đã đóng `LOI qua-han`: tool ném, hàng giữ `LOI`, không thành «đã trả lời» — test ở Task 6.
- Câu hỏi có ký tự NFD, toàn khoảng trắng, hay 501 ký tự: API chuẩn NFC, trim, bác ngoài 2–500 — test ở Task 4.
- Đoạn trích chứa `|` của bảng markdown, `**` hay xuống dòng: kiểm chuỗi con trên `noiDung` markdown thô sau NFC, không trên chữ đã bỏ định dạng — test ở Task 2.
- Trang được trích bị đổi chủ hay đổi `xacMinhDen` giữa lúc nộp và lúc hiện: câu trả lời giữ ảnh chụp lúc nộp (tên chủ trang, ngày) trong `traLoi` — test ở Task 2.

---

## Bản đồ tệp

| Tệp | Trách nhiệm |
| --- | --- |
| `packages/db/prisma/schema.prisma`, `migrations/20261010010000_tro_ly_doc_kho/migration.sql` | Bảng `TaiLieuHoi`, `TaiLieuBaoSai` |
| `packages/validation/src/tai-lieu-hoi.ts` (+ `package.json` export) | Khuôn `traLoi`, hằng `TAI_LIEU_HOI`, `kiemTraLoi`, `dungTraLoi`, `dungTraLoiZalo`, `canhBaoQuaHan` |
| `packages/validation/src/tai-lieu.ts`, `phien-tac-tu.ts` | `XAC_MINH` trong sự kiện; purpose `kho` |
| `packages/db/src/tai-lieu-tim.ts` (+ export) | Một câu SQL tìm bản đang dùng; đọc bản đang dùng theo slug |
| `packages/db/src/tai-lieu-hoi.ts` (+ export) | Ghi, đóng hàng hỏi; `demHoiKho`, `demBaoSai`; luật thấy hàng chưa trả lời và báo sai |
| `packages/db/src/agent-tasks.ts`, `ai-chi-phi-danh-muc.ts` | Kind `hoi-kho`; tính năng `tai-lieu.tro-ly` |
| `apps/api/src/tai-lieu/tai-lieu-hoi.service.ts` + router, contracts | `hoi`, `hoiKetQua`, `baoSai`, `xuLyChuaTraLoi`, `xuLyBaoSai`, `datXacMinh`; hai khối Sức khoẻ |
| `apps/api/src/agent/agent-trigger.service.ts` | `hoiKho(hoiId, client)`, `danhThucHoiKho()` |
| `apps/agent/agent/subagents/tro_ly_kho/**` | Subagent: `agent.ts`, `instructions.ts`, `sandbox/`, `tools/` (3 sống + 9 tắt), `hooks/` |
| `apps/agent/agent/lib/tai-lieu-hoi*.ts` | `hoiCuaPhien`, `nopTraLoi`, `guiHoiKho`, `dongHoiKho*`, ghi sổ |
| `apps/agent/agent/lib/tai-lieu-model.ts`, `tai-lieu-config.ts` | Model tham số theo việc; `TAI_LIEU_AGENT.hoi` |
| `apps/agent/agent/channels/crm.ts`, `zalo.ts`, `instructions/task.ts`, `schedules/dispatch.ts`, `lib/zalo-*.ts` | Nối hai luồng |
| `apps/app/app/(app)/[slug]/tai-lieu/hoi*.tsx`, `suc-khoe.tsx`, `[trang]/man-doc.tsx`, `lib/messages/tai-lieu.ts`, `lib/tai-lieu-man.ts` | Tab «Hỏi», hộp báo sai, dòng xác minh, hai danh sách |
| `_acceptance/tro-ly-doc-kho/rang/*`, `bo-do/*` | Thước màn, chấm bộ câu đo, in ngưỡng |

---

### Task 1: Lược đồ, hằng và khuôn dùng chung

**Phục vụ:** nền cho E3, E7, E9, E10, E11, E12. **independent: false** (mọi task sau dựa vào nó).

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (thêm hai model, back-relation trên `User`, `TaiLieuTrang`)
- Create: `packages/db/prisma/migrations/20261010010000_tro_ly_doc_kho/migration.sql`
- Create: `packages/validation/src/tai-lieu-hoi.ts`; Modify: `packages/validation/package.json` (`"./tai-lieu-hoi"`)
- Modify: `packages/validation/src/tai-lieu.ts` (`LOAI_SU_KIEN` thêm `MAY_SOAN`, `XAC_MINH`; nhánh Zod `XAC_MINH`), `packages/validation/test/tai-lieu.spec.ts:91`
- Modify: `packages/validation/src/phien-tac-tu.ts` (`"kho"`)
- Modify: `packages/db/src/agent-tasks.ts` (`"hoi-kho"` vào `TASK_KINDS`, `DIRECT_KINDS`; `PRIORITY.hoiKho = 950`), `apps/api/src/agent/enrichment-copy.ts:20`
- Modify: `packages/db/src/ai-chi-phi-danh-muc.ts` (`"tai-lieu.tro-ly"` vào `TINH_NANG`, `NHOM_CUA_TINH_NANG: "chua-gan"`, `SUBAGENT_CO_SO` + nhánh `tinhNangCua` cho `tro_ly_kho`, `VIEC_CUA_PURPOSE.kho`)
- Test: `packages/validation/test/tai-lieu-hoi-khuon.spec.ts`, `packages/validation/test/ai-chi-phi.spec.ts`

**Interfaces — Produces:**
```ts
export const KENH_HOI = ["CRM", "ZALO"] as const;
export const TRANG_THAI_HOI = ["DANG_HOI", "TRA_LOI", "TU_CHOI", "LOI"] as const;
export const LY_DO_HOI = ["khong-co-trang", "trich-truot", "het-tran", "loi-model", "qua-han"] as const;
export const TRANG_THAI_BAO_SAI = ["MO", "DA_XU_LY"] as const;
export const KET_LUAN_BAO_SAI = ["SAI", "DUNG"] as const;
export const TAI_LIEU_HOI = {
  cauHoi: { toiThieu: 2, toiDa: 500 },
  trich: { toiThieu: 12, cauToiDa: 8, trichMoiCau: 4 },
  ganNhatToiDa: 3,
  tran: { ngay: 20, thang: 600 },
  tuChoi: "Chưa có trang đã duyệt nào trả lời câu này. Mình không đoán.",
  hetTran: "Trợ lý AI tạm dừng vì hết hạn mức tháng.",
  chuaTraLoi: "Chưa trả lời được lúc này.",
  quaHan: "Trang «{ten}» đã quá hạn xác minh từ {ngay}; hỏi chủ trang {chu} trước khi làm theo.",
  tranNgay: "Hôm nay bạn đã hỏi đủ {so} câu. Hỏi lại từ ngày mai.",
  tranThang: "Kho đã dùng hết {so} câu hỏi của tháng này.",
} as const;
export const trichDaKiem = z.object({ slug: z.string(), ten: z.string(), phienBan: z.number().int(), duyetLuc: z.string(), doan: z.string() });
export const cauDaKiem = z.object({ chu: z.string(), trich: z.array(trichDaKiem).min(1) });
export const trangQuaHan = z.object({ slug: z.string(), ten: z.string(), xacMinhDen: z.string(), chuTrang: z.string() });
export const traLoiDaKiem = z.object({ cau: z.array(cauDaKiem).min(1), quaHan: z.array(trangQuaHan) });
export const ganNhat = z.array(z.object({ slug: z.string(), ten: z.string() })).max(3);
export type TraLoiDaKiem = z.infer<typeof traLoiDaKiem>;
export function parseTraLoi(v: unknown): TraLoiDaKiem;
export function parseGanNhat(v: unknown): z.infer<typeof ganNhat>;
```

Prisma (tên bảng camelCase như kho; quan hệ `User` đặt tên):
```prisma
model TaiLieuHoi {
  id          String    @id @default(cuid())
  nguoiHoiId  String
  nguoiHoi    User      @relation("TaiLieuHoiNguoiHoi", fields: [nguoiHoiId], references: [id], onDelete: Restrict)
  kenh        String
  zaloHoiId   String?   @unique
  phienId     String?
  cauHoi      String?
  trangThai   String    @default("DANG_HOI")
  lyDo        String?
  traLoi      Json?
  ganNhat     Json?
  hoiLuc      DateTime  @default(now())
  xongLuc     DateTime?
  tokenVao    Int       @default(0)
  tokenRa     Int       @default(0)
  chiPhiUsd   Float     @default(0)
  soLanBac    Int       @default(0)
  nhanKhoa    String?
  xuLyLuc     DateTime?
  xuLyBoiId   String?
  xuLyBoi     User?     @relation("TaiLieuHoiXuLyBoi", fields: [xuLyBoiId], references: [id], onDelete: Restrict)
  baoSai      TaiLieuBaoSai[]
  @@index([nguoiHoiId, hoiLuc])
  @@index([kenh, hoiLuc])
  @@index([phienId, trangThai])
  @@index([trangThai, hoiLuc])
  @@map("taiLieuHoi")
}

model TaiLieuBaoSai {
  id         String       @id @default(cuid())
  hoiId      String
  hoi        TaiLieuHoi   @relation(fields: [hoiId], references: [id], onDelete: Restrict)
  trangId    String
  trang      TaiLieuTrang @relation(fields: [trangId], references: [id], onDelete: Restrict)
  phienBan   Int
  nguoiBaoId String
  nguoiBao   User         @relation("TaiLieuBaoSaiNguoiBao", fields: [nguoiBaoId], references: [id], onDelete: Restrict)
  cauHoi     String
  ghiChu     String?
  trangThai  String       @default("MO")
  ketLuan    String?
  xuLyLuc    DateTime?
  xuLyBoiId  String?
  xuLyBoi    User?        @relation("TaiLieuBaoSaiXuLyBoi", fields: [xuLyBoiId], references: [id], onDelete: Restrict)
  taoLuc     DateTime     @default(now())
  @@unique([hoiId, nguoiBaoId, trangId])
  @@index([trangId, trangThai])
  @@map("taiLieuBaoSai")
}
```

- [ ] **Step 1: Viết test khuôn đỏ** — `tai-lieu-hoi-khuon.spec.ts`: `parseTraLoi` nhận bản hợp lệ một câu một trích; ném với `cau: []`, với `trich: []`, với `phienBan: "5"`; `parseGanNhat` ném với 4 phần tử. `ai-chi-phi.spec.ts` thêm ca: `tinhNangCua({ subagent: "tro_ly_kho", kenh: null, purpose: null, okrViec: null })` là `"tai-lieu.tro-ly"`, `tinhNangCua({ purpose: "kho", kenh: "crm", subagent: null, okrViec: null })` là `"tai-lieu.tro-ly"`.
- [ ] **Step 2:** `cd packages/validation && bun test test/tai-lieu-hoi-khuon.spec.ts test/ai-chi-phi.spec.ts` → FAIL (module không có).
- [ ] **Step 3:** Viết `tai-lieu-hoi.ts` phần hằng + khuôn trên; sửa `phien-tac-tu.ts`, `tai-lieu.ts`, `ai-chi-phi-danh-muc.ts`, `agent-tasks.ts`, `enrichment-copy.ts` (`"hoi-kho": "Answering a question from the document library"`).
- [ ] **Step 4:** Sửa schema; `cd packages/db && bunx prisma migrate dev --create-only --name tro_ly_doc_kho` trên kho dev, đổi tên thư mục thành `20261010010000_tro_ly_doc_kho`, đọc SQL (chỉ CREATE TABLE/INDEX/FK hai bảng mới); `bun run db:generate`.
- [ ] **Step 5:** Chạy lại Step 2 → PASS; `bun run check-types` → xanh (bắt `satisfies Record<TinhNang,…>`).
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — bảng hỏi kho, báo sai và khuôn câu trả lời đã kiểm`.

---

### Task 2: Kiểm trích dẫn và dựng câu trả lời (hàm thuần)

**Phục vụ:** E3 tầng một, E4 (chữ cố định), E5 (cảnh báo). **independent: true** (sau Task 1).

**Files:**
- Modify: `packages/validation/src/tai-lieu-hoi.ts`
- Modify: `packages/validation/src/tai-lieu-so.ts` (export `rutSoChu(chu: string): string[]` — tách số trên chữ thường, cùng regex `SO`; `coSoTronVen` giữ)
- Test: `packages/validation/test/tai-lieu-hoi.spec.ts`

**Interfaces — Consumes:** `chuanNfc`, `coSoTronVen`, khuôn Task 1. **Produces:**
```ts
export type BanDangDung = { slug: string; ten: string; phienBan: number; duyetLuc: string; noiDung: string; xacMinhDen: string | null; chuTrang: string };
export type BanNop = { cau: { chu: string; trich: { slug: string; phienBan: number; doan: string }[] }[] };
export type LoiKiem = { loai: "cau-khong-trich" | "trang-khong-co" | "phien-ban-cu" | "trich-khong-co" | "trich-ngan" | "so-khong-trich" | "qua-nhieu"; chi: string };
export type KetQuaKiemTraLoi = { ok: true; traLoi: TraLoiDaKiem } | { ok: false; loi: LoiKiem[] };
export function kiemTraLoi(ban: BanNop, trang: ReadonlyMap<string, BanDangDung>, dauHomNay: Date): KetQuaKiemTraLoi;
export function dungTraLoi(t: TraLoiDaKiem, fmtNgay: (iso: string) => string): string;
export function dungTraLoiZalo(t: TraLoiDaKiem, fmtNgay: (iso: string) => string): string;
export function dungTuChoi(gan: { ten: string }[]): string;
export function canhBaoQuaHan(trang: BanDangDung[], dauHomNay: Date): z.infer<typeof trangQuaHan>[];
```

Luật `kiemTraLoi` (thứ tự, mọi lỗi gom rồi trả một lần):
1. `ban.cau.length` 1..`cauToiDa`, mỗi câu 1..`trichMoiCau` trích; câu 0 trích → `cau-khong-trich` với `chi: "câu ${i+1}"`.
2. `trang.get(slug)` vắng → `trang-khong-co` `chi: slug`.
3. `phienBan !== trang.phienBan` → `phien-ban-cu` `chi: "${slug}: bản đang dùng là ${trang.phienBan}"`.
4. `const d = chuanNfc(doan).trim()`; `d.length < trich.toiThieu` → `trich-ngan`; `!chuanNfc(noiDung).includes(d)` → `trich-khong-co` `chi: d`.
5. Mỗi số trong `rutSoChu(chuanNfc(cau.chu))` phải có `coSoTronVen(chuanNfc(doan), so)` với ít nhất một trích CỦA CHÍNH CÂU ĐÓ → nếu không `so-khong-trich` `chi: "câu ${i+1}: ${so}"`.
6. Ok → `traLoi = { cau: [...], quaHan: canhBaoQuaHan(các trang được trích, dauHomNay) }` (ảnh chụp tên, ngày duyệt, tên chủ trang lúc nộp).

`canhBaoQuaHan`: trang có `xacMinhDen` và `new Date(xacMinhDen) < dauHomNay`, mỗi slug một lần.

- [ ] **Step 1: Viết test đỏ** — bảng 11 ca viết trước của E3 tầng một (a, b, c, d, e, f, f2×3, f3, g, h, i), mỗi ca `expect(loai)` + `expect(chi).toContain(...)`; dựng `trang` bằng `new Map([[slug, {...}]])`, `noiDung` thật có bảng markdown `| Tầng 2 | 2 – 10 tỷ | 1,2% |` và câu «Chi vào ngày 15 của tháng kế tiếp.». Ca (g): `doan` = `"Chi vào ngày 15".normalize("NFD")` → ok. Ca f2: «20%» với «01/10/2026», «1,2%» với «1,25%», «5 ngày» với «15 ngày». Ca f3: câu 1 «1,2%» chỉ trích «Chi vào ngày 15…», câu 2 trích bảng. Thêm: `canhBaoQuaHan` với bốn trang 14/10, 15/10, 16/10, null và `dauHomNay = dauNgayVN(new Date("2026-10-14T17:30:00Z"))` → đúng một (14/10); `dungTuChoi([])` === `TAI_LIEU_HOI.tuChoi`; `dungTuChoi([{ten:"A"}])` bắt đầu bằng `tuChoi`; Review Focus: đoạn có `|` và `**` khớp trên markdown thô; `traLoi` giữ `chuTrang` lúc nộp.
- [ ] **Step 2:** `cd packages/validation && bun test test/tai-lieu-hoi.spec.ts` → FAIL.
- [ ] **Step 3:** Viết `kiemTraLoi`, `canhBaoQuaHan`, `dungTraLoi` (mỗi câu một đoạn, dưới là `— «doan» (ten, phiên bản N, duyệt dd/mm/yyyy)`, cảnh báo quá hạn đầu), `dungTraLoiZalo` (chữ thường, không markdown, trích dạng `«doan» — ten, phiên bản N`), `dungTuChoi` (`tuChoi` + `\nTrang gần nhất: A, B`); export `rutSoChu`.
- [ ] **Step 4:** Step 2 → PASS.
- [ ] **Step 5: Phá-thử** trong bản sao `.acceptance-runs/tro-ly-doc-kho/sao-kiem/` (symlink `node_modules`): bỏ `chuanNfc` phía doan → đỏ «tlk-kiem: ca g bi bac»; `includes` thay `coSoTronVen` → «tlk-kiem: so khop mot phan: 20%»; kiểm số trên trích của mọi câu → «tlk-kiem: so lay tu doan cau khac». Thông điệp ghim là tên test.
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — kiểm trích dẫn và dựng câu trả lời bằng mã`.

---

### Task 3: Một hàm tìm và đọc bản đang dùng

**Phục vụ:** E1, E2 (phần dữ liệu). **independent: true** (sau Task 1).

**Files:**
- Create: `packages/db/src/tai-lieu-tim.ts`; Modify: `packages/db/package.json` (`"./tai-lieu-tim"`)
- Modify: `apps/api/src/tai-lieu/tai-lieu-tim.service.ts` (`tim` gọi hàm mới)
- Test: giữ `apps/api/test/tai-lieu-tim.spec.ts` xanh (không sửa)

**Interfaces — Produces** (`@crm/validation` phụ thuộc `@crm/db`, nên db không import ngược; người gọi dựng `tsquery` bằng `dungTruyVan` và cắt đoạn bằng `doanTrich`):
```ts
export type HangTimKho = { slug: string; ten: string; loai: string; chuId: string; chuTen: string; so: number; noiDung: string };
export function timTrangDangDung(db: Db, tsquery: string, gioiHan: number): Promise<HangTimKho[]>;
export type BanDangDungDb = { slug: string; ten: string; so: number; duyetLuc: Date; noiDung: string; xacMinhDen: Date | null; chuTen: string };
export function docBanDangDung(db: Db, slug: string): Promise<BanDangDungDb | null>;
export function docNhieuBanDangDung(db: Db, slugs: readonly string[]): Promise<BanDangDungDb[]>;
```
SQL của `timTrangDangDung` là nguyên văn SQL `tim` lượt 3 với `LIMIT ${gioiHan}`. `docBanDangDung` chỉ trả trang có `banDangDungId`; chưa duyệt và không có cùng `null`.

- [ ] **Step 1:** Chạy `bun run test -- "cd apps/api && bun test test/tai-lieu-tim.spec.ts"` → xanh (đường nền).
- [ ] **Step 2:** Viết `tai-lieu-tim.ts`; `TaiLieuTimService.tim` thành `const hang = await timTrangDangDung(this.db, truyVan.tsquery, TIM.soDong)` rồi map như cũ.
- [ ] **Step 3:** Step 1 → vẫn xanh; `bun run check-types`.
- [ ] **Step 4: Commit** `refactor(kho-tai-lieu): một hàm tìm bản đang dùng cho API và agent`.

---

### Task 4: API hỏi kho, kết quả, trần, nhật ký

**Phục vụ:** E7, E9, E14. **independent: false** (Task 1, 2).

**Files:**
- Create: `packages/db/src/tai-lieu-hoi.ts` (+ export `"./tai-lieu-hoi"`)
- Create: `apps/api/src/tai-lieu/tai-lieu-hoi.service.ts`; Modify: `tai-lieu.module.ts`, `tai-lieu.router.ts`, `tai-lieu.contracts.ts`, `apps/api/src/tai-lieu/tai-lieu-config.ts` (thông điệp)
- Modify: `apps/api/src/agent/agent-trigger.service.ts`
- Modify: `apps/api/test/tai-lieu-san.ts` (`donTaiLieu` xoá `taiLieuBaoSai`, `taiLieuHoi` của người `TIEN_TO` trước user)
- Test: `apps/api/test/tai-lieu-hoi.spec.ts` (`-t tlk-hoi`, `-t tlk-nhat-ky`, `-t tlk-tran`)

**Interfaces — Produces:**
```ts
export function demHoiTrongNgay(db: Db | Prisma.TransactionClient, nguoiId: string, now: Date): Promise<number>;
export function demHoiTrongThang(db: Db | Prisma.TransactionClient, now: Date): Promise<number>;
export function demHoiKho(db: Db, tu: Date, den: Date): Promise<{ traLoi: number; tuChoi: number; loi: number; tiLe: number | null }>;
export function demBaoSai(db: Db, tu: Date, den: Date): Promise<{ tong: number; daXuLy: number; xacNhanSai: number }>;
export function ghiKetQuaHoi(db: Db | Prisma.TransactionClient, hoiId: string, kq:
  | { trangThai: "TRA_LOI"; traLoi: TraLoiDaKiem }
  | { trangThai: "TU_CHOI"; lyDo: "khong-co-trang" | "trich-truot"; ganNhat: { slug: string; ten: string }[] }
  | { trangThai: "LOI"; lyDo: "het-tran" | "loi-model" | "qua-han" }, now: Date): Promise<boolean>;
```
`ghiKetQuaHoi` là `updateMany where { id, trangThai: "DANG_HOI" }`; `TRA_LOI` đặt `cauHoi: null` trong cùng lệnh; trả `count === 1`.

tRPC (dưới `taiLieu`, phạm vi chung, chặn vai `okr` trong service bằng `if (laVaiChiOkr(nguoi.role)) throw new ForbiddenException(KHONG_TRONG_PHAM_VI)`):
```ts
taiLieuHoiInput = z.object({ cauHoi: z.string().transform((s) => chuanNfc(s).trim()).pipe(z.string().min(2).max(500)) })
taiLieuHoiOutput = z.object({ hoiId: z.string() })
taiLieuHoiKetQuaInput = z.object({ hoiId: ma })
taiLieuHoiKetQuaOutput = z.discriminatedUnion("trangThai", [
  z.object({ trangThai: z.literal("DANG_HOI") }),
  z.object({ trangThai: z.literal("TRA_LOI"), traLoi: traLoiDaKiem }),
  z.object({ trangThai: z.literal("TU_CHOI"), ganNhat }),
  z.object({ trangThai: z.literal("LOI"), lyDo: z.enum(["het-tran", "loi-model", "qua-han"]) }),
])
```
`hoi`: một giao dịch — đếm trần (`demHoiTrongNgay` kênh CRM theo `dauNgayVN`, `demHoiTrongThang` kênh CRM theo đầu tháng VN), vượt → `TRPCError TOO_MANY_REQUESTS` với `TAI_LIEU_HOI.tranNgay`/`tranThang` đã điền số; tạo hàng; `trigger.hoiKho(hoi.id, tx)`; sau commit `trigger.danhThucHoiKho()`. `hoiKetQua` chỉ người hỏi (`nguoiHoiId === nguoi.id`), khác → `NOT_FOUND`. `AgentTriggerService.hoiKho(hoiId, client)` = `enqueue({ kind: "hoi-kho", reason: "Trả lời câu hỏi kho", priority: PRIORITY.hoiKho, budget: 0, payload: { hoiId }, subject: [{ path: ["hoiId"], value: hoiId }] }, true, client)`; `danhThucHoiKho(): void { this.poke(); }`.

- [ ] **Step 1: Test đỏ** — năm ô E7 (hàng + AgentTask cùng giao dịch: giả lỗi `enqueue` bằng `spyOn` → không còn hàng; DANG_HOI; ghi TRA_LOI qua `ghiKetQuaHoi` rồi đọc; người khác NOT_FOUND; okr 403 `KHONG_TRONG_PHAM_VI`; 1 và 501 ký tự BAD_REQUEST; NFD → lưu NFC), chín câu E9 ghi qua `ghiKetQuaHoi` và `demHoiKho` = `{4,3,2,4/7}`, hàng ngoài cửa sổ không đếm, logger bắt bằng `spyOn(Logger.prototype, "log")` không chứa chữ câu hỏi; sáu ô E14 (TZ VN, 23:50, trần đọc từ `TAI_LIEU_HOI.tran`).
- [ ] **Step 2:** `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tai-lieu-hoi.spec.ts"` → FAIL.
- [ ] **Step 3:** Viết `packages/db/src/tai-lieu-hoi.ts`, service, router, contracts, trigger; sửa `donTaiLieu`.
- [ ] **Step 4:** Step 2 → PASS; `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts"` xanh (mutation mới có input nên `SO_MUTATION_KHONG_DAU_VAO` giữ 13; thêm mục `DAU_VAO_HOP_LE` cho `taiLieu.hoi`, `taiLieu.baoSai` nếu test đòi).
- [ ] **Step 5: Phá-thử** ba bản sao theo chiều đỏ E7, E9, E14 (bỏ chặn okr → «tlk-hoi: okr hoi duoc»; không xoá cauHoi → «tlk-nhat-ky: con chu cau da tra loi»; đếm cả Zalo → «tlk-tran: cau thu tranNgay bi tu choi»).
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — taiLieu.hoi, kết quả, trần và nhật ký hỏi`.

---

### Task 5: API xác minh, báo sai, hàng chưa trả lời

**Phục vụ:** E6, E10, E11. **independent: false** (Task 4).

**Files:**
- Modify: `apps/api/src/tai-lieu/tai-lieu-hoi.service.ts`, `tai-lieu.service.ts` (`get` trả `xacMinhDen`, `coQuyenXacMinh`), `tai-lieu-tim.service.ts` (`sucKhoe` thêm `chuaTraLoi`, `baoSai`), router, contracts
- Modify: `packages/db/src/tai-lieu-hoi.ts` (`dieuKienThayChuaTraLoi(nguoi)`, `dieuKienThayBaoSai(nguoi)`)
- Test: `apps/api/test/tai-lieu-xac-minh.spec.ts`, `apps/api/test/tai-lieu-hoi-suc-khoe.spec.ts` (`-t tlk-chua-tra-loi`, `-t tlk-bao-sai`)

**Interfaces — Produces:**
```ts
taiLieuDatXacMinhInput = z.object({ slug: ma, den: z.string().date().nullable() })
taiLieuBaoSaiInput = z.object({ hoiId: ma, cauHoi: <như hoi>, ghiChu: z.string().transform(nfc trim).pipe(z.string().max(500)).optional() })
taiLieuBaoSaiOutput = z.object({ soViec: z.number().int() })
taiLieuXuLyChuaTraLoiInput = z.object({ hoiId: ma })
taiLieuXuLyBaoSaiInput = z.object({ id: ma, ketLuan: z.enum(KET_LUAN_BAO_SAI) })
sucKhoe.chuaTraLoi: khoiSucKhoe(z.object({ hoiId: z.string(), cauHoi: z.string(), ganNhat }))
sucKhoe.baoSai: khoiSucKhoe(z.object({ id: z.string(), slug: z.string(), ten: z.string(), phienBan: z.number().int(), cauHoi: z.string(), ghiChu: z.string().nullable(), chuTrang: nguoi }))
```
- `datXacMinh`: trang theo `dieuKienThay` không thấy → NOT_FOUND; `!duyetDuoc(nguoi, trang)` → FORBIDDEN `T.khongDuocDuyet`; ghi cột + `ghiSuKien(tx, trangId, nguoi.id, { loai: "XAC_MINH", den })`.
- `chuaTraLoi`: quản trị thấy mọi `TU_CHOI` chưa `xuLyLuc`; chủ trang thấy hàng có `ganNhat` chứa slug trang mình làm chủ (lọc bằng `ganNhat @> '[{"slug":…}]'::jsonb` qua `$queryRaw`, hoặc nạp slug của chủ rồi so — chọn `$queryRaw` một lần); không trả `nguoiHoiId`.
- `baoSai`: chỉ người hỏi, chỉ `TRA_LOI`; `cauHoi` do client gửi lại (hàng đã xoá chữ); `createMany skipDuplicates` theo unique; trả số việc của câu đó.
- `xuLyBaoSai`: chủ trang của trang hoặc quản trị; `ketLuan` bắt buộc (khuôn).

- [ ] **Step 1: Test đỏ** — 20 ô E6 + ô sucKhoe; 5+1+3 ô E10 (JSON không chứa tên người hỏi); 7 ô E11 với `demBaoSai`.
- [ ] **Step 2:** `bun run test -- "cd apps/api && bun test test/tai-lieu-xac-minh.spec.ts test/tai-lieu-hoi-suc-khoe.spec.ts"` → FAIL.
- [ ] **Step 3:** Viết thủ tục, khuôn, điều kiện thấy.
- [ ] **Step 4:** Step 2 → PASS; `bun run test -- "cd apps/api && bun test test/tai-lieu-suc-khoe.spec.ts test/tai-lieu-tim.spec.ts"` xanh.
- [ ] **Step 5: Phá-thử** theo chiều đỏ E6, E10, E11.
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — đặt hạn xác minh, báo sai, câu chưa trả lời được`.

---

### Task 6: Subagent `tro_ly_kho` và ba tool

**Phục vụ:** E1 (phía tool), E2, E3 tầng hai, E4, E5, E12. **independent: false** (Task 1–3).

**Files:**
- Modify: `apps/agent/agent/lib/tai-lieu-config.ts` (khối `hoi`), `apps/agent/agent/lib/tai-lieu-model.ts` (tham số việc)
- Create: `apps/agent/agent/subagents/tro_ly_kho/agent.ts`, `instructions.ts`, `sandbox/sandbox.ts`, `tools/{search_pages,read_page,nop_tra_loi}.ts`, `tools/{ask_question,bash,glob,grep,read_file,todo,web_fetch,web_search,write_file}.ts` (`disableTool()`), `hooks/mo-hoi.ts` (`session.started`), `hooks/so-chi-phi.ts`
- Create: `apps/agent/agent/lib/tai-lieu-hoi.ts` (`hoiCuaPhien`, `nopTraLoi`, `ghiSoTroLyKho`), `apps/agent/agent/lib/tai-lieu-hoi-zalo.ts` (`moHoiZalo`)
- Modify: `apps/agent/test/support/khuon-di-dong.ts` (`KHUON_PHAI_CO` thêm `tro_ly_kho/tools/*.ts`, `tro_ly_kho/agent.ts#output`)
- Test: `apps/agent/test/tro-ly-kho-tim-doc.spec.ts`, `tro-ly-kho-nop.spec.ts`, `tro-ly-kho-ranh-gioi.spec.ts`; support `apps/agent/test/support/tro-ly-kho-gia.ts`

**Interfaces — Consumes:** Task 1–3. **Produces:**
```ts
TAI_LIEU_AGENT.hoi = {
  maModel: "zai/glm-5.2-fast", bienKhoaRieng: "KHO_TAI_LIEU_AI_GATEWAY_API_KEY", gateway: { zeroDataRetention: true },
  soKetQua: 8, docToiDa: 24 * NGHIN, tranBac: 3, hanTraLoiMs: 3 * MINUTE_MS,
  gioiHan: { maxInputTokensPerSession: 200 * NGHIN, maxOutputTokensPerSession: 8 * NGHIN, sessionTimeoutMs: 3 * MINUTE_MS },
  timHoi: { soLan: 8, cachMs: 250 },
}
export function modelTaiLieu(viec: "soan" | "hoi", env?: NodeJS.ProcessEnv, tao?: typeof createGateway): ModelMaySoan;
export function nhanKhoaTaiLieu(viec: "soan" | "hoi", env?: NodeJS.ProcessEnv): NhanKhoa;
export function hoiCuaPhien(ctx: PurposeContext & { session: { id: string; parent?: unknown } }): Promise<string>;
export function nopTraLoi(hoiId: string, ban: BanNop | { loai: "khong-biet" }, now: Date): Promise<{ ok: true } | { ok: false; loi: string; dung: boolean }>;
export function moHoiZalo(rootSessionId: string): Promise<string>;
```
`modelMaySoan()` giữ làm bí danh `modelTaiLieu("soan")` để `may_soan` không đổi hành vi.

- `hoiCuaPhien`: `goc = phienGocCua(ctx)`; vòng `timHoi.soLan` lần, cách `cachMs`: `taiLieuHoi.findFirst({ where: { phienId: goc, trangThai: "DANG_HOI" }, orderBy: { hoiLuc: "desc" } })`; không có → `throw new Error("This session is not a library question.")`.
- `hooks/mo-hoi.ts` (`session.started` của subagent): phiên gốc là Zalo (tìm `zaloHoi` `sessionId = goc` `ketQua "dang-hoi"` mới nhất, có vòng chờ vì `sessionId` ghi sau `send`) → `moHoiZalo(goc)` upsert `TaiLieuHoi { kenh: "ZALO", zaloHoiId, phienId: goc, nguoiHoiId: crmUserId, cauHoi: null }`; phiên gốc là `kho` → kiểm hàng đã có; khác → `throw`. Chữ câu hỏi Zalo chép vào `cauHoi` chỉ khi đóng `TU_CHOI` (lấy từ tin đầu của phiên con, `event.data.invocation.message`).
- `search_pages(query)`: `hoiCuaPhien(ctx)` trước tiên; `dungTruyVan` → rỗng thì `{ rows: [] }`; `timTrangDangDung` → `{ slug, ten, phienBan, doanTrich }`; ghi `ganNhat` (tối đa 3) của lần tìm đầu có kết quả vào hàng.
- `read_page(slug)`: `hoiCuaPhien`; `docBanDangDung` null → `{ loai: "khong-co" }`; có → chữ xoá `/<<<[^>]*>>>/g`, cắt `docToiDa`, bọc `<<<TRANG-BAT-DAU>>>…<<<TRANG-HET>>>`, kèm `slug, ten, phienBan, duyetLuc, xacMinhDen, quaHan, biDongCat`.
- `nop_tra_loi`: khuôn phẳng `z.object({ loai: z.enum(["tra-loi","khong-biet"]), cau: z.array(z.object({ chu: z.string(), trich: z.array(z.object({ slug: z.string(), phienBan: z.number().int(), doan: z.string() })) })).optional() })`; `nopTraLoi` đọc `docNhieuBanDangDung`, gọi `kiemTraLoi`, ok → `ghiKetQuaHoi TRA_LOI`; lỗi → tăng `soLanBac` của hàng (`updateMany where DANG_HOI`), tới `tranBac` → `TU_CHOI trich-truot` với `ganNhat` đã ghi, trả `dung: true`; `ghiKetQuaHoi` trả false (hàng không còn `DANG_HOI`) → `throw new Error("This question is already closed.")`.
- `agent.ts`: `defineAgent({ description, model: defineDynamic({ fallback: TAI_LIEU_AGENT.hoi.maModel, events: { "step.started": () => modelTaiLieu("hoi") } }), outputSchema: z.object({ hoiId: z.string(), ketQua: z.enum(["TRA_LOI","TU_CHOI","LOI"]) }), limits: TAI_LIEU_AGENT.hoi.gioiHan })`.
- `hooks/so-chi-phi.ts`: `step.completed` → `ghiBuoc(event, ctx, "tro_ly_kho")` và `ghiSoTroLyKho(hoiId, usage, nhanKhoa)` (cộng `tokenVao`, `tokenRa`, `chiPhiUsd` theo `TAI_LIEU_AGENT.bangGia`, đặt `nhanKhoa`).

- [ ] **Step 1: Test đỏ** — `tro-ly-kho-tim-doc.spec.ts` (`-t tlk-tim`: 10 truy vấn E1 gọi `execute` của `search_pages` với `ctxCon` của phiên có hàng DANG_HOI và gọi `taiLieu.tim` của API bằng `TaiLieuTimService` dựng tay trên cùng `db`, so tập; `-t tlk-doc`: 5 slug E2), `tro-ly-kho-nop.spec.ts` (`-t tlk-kiem`: 4 ô tầng hai; `-t tlk-tu-choi`: 3 ca × 3; `-t tlk-qua-han`: TZ VN, đồng hồ 2026-10-15 00:30 VN; Review Focus: hai hàng Zalo cùng `phienId`, hàng cũ TRA_LOI không bị ghi; nộp sau `LOI qua-han` ném), `tro-ly-kho-ranh-gioi.spec.ts` (tập tool sống = 3, tắt = 9, so danh mục tool dựng sẵn lấy từ `eve` thay vì viết tay; `networkPolicy: "deny-all"` ba lần; model giả `tao` ghi params: hai lần với khoá đặt và rỗng, mọi lời gọi có `providerOptions.gateway.zeroDataRetention === true`, nhãn `rieng` rồi `chung`; kết quả trả agent gốc không chứa `NOIDUNG-TRANG-MOC`; mỗi bước tăng `tokenVao` và có dòng `aiChiPhi` `tai-lieu.tro-ly`).
- [ ] **Step 2:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-kho-tim-doc.spec.ts test/tro-ly-kho-nop.spec.ts test/tro-ly-kho-ranh-gioi.spec.ts"` → FAIL.
- [ ] **Step 3:** Viết config, model, lib, subagent theo trên (khuôn tệp như `may_soan`).
- [ ] **Step 4:** Step 2 → PASS; `cd apps/agent && bun test test/khuon-di-dong.spec.ts test/tai-lieu-ranh-gioi.spec.ts test/tai-lieu-khoa-rieng.spec.ts` xanh (máy soạn không đổi).
- [ ] **Step 5: Phá-thử** theo chiều đỏ E1, E2, E3 tầng hai, E4, E5, E12.
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — subagent tro_ly_kho với ba tool và kiểm trích dẫn`.

---

### Task 7: Luồng CRM và đóng khi hỏng

**Phục vụ:** E7 (đầu cuối), E13. **independent: false** (Task 4, 6).

**Files:**
- Modify: `apps/agent/agent/lib/dispatch.ts` (bỏ qua `hoi-kho` ở làn trực tiếp: không xử lý, để `drainHoiKho` nhận), `apps/agent/agent/lib/tasks.ts` (nếu `claimDue` lọc kind — loại `hoi-kho` khỏi hai làn)
- Create trong `apps/agent/agent/lib/tai-lieu-hoi.ts`: `guiHoiKho(hoiId, send)`, `drainHoiKho(send)`, `dongHoiKhoKhiPhienXong(token)`, `dongHoiKhoKhiPhienHong(token, lyDo)`, `dongHoiKhoQuaHan(now)`, `phanLoaiLoi(msg): "het-tran" | "loi-model"`
- Create: `apps/agent/agent/hooks/dong-tro-ly-kho.ts` (`action.result` của `tro_ly_kho`)
- Modify: `apps/agent/agent/channels/crm.ts` (`receiveTarget.hoiId`; dispatch route gọi `drainHoiKho`; `turn.failed`, `session.failed`, `session.completed` gọi hai hàm đóng trước nhánh khác), `apps/agent/agent/instructions/task.ts` (nhánh `kho`), `apps/agent/agent/schedules/dispatch.ts` (`dongHoiKhoQuaHan`)
- Create: `apps/agent/test/fixtures/loi-gateway.json` (nguyên văn thông điệp hết ngân sách tháng và thân 402 hết tín dụng đã gặp, ghi nguồn: `memory/ai-gateway-het-ngan-sach-thang.md` và log `tac-tu.log`)
- Test: `apps/agent/test/tro-ly-kho-loi.spec.ts`

**Interfaces:**
```ts
export const PURPOSE_KHO = "kho";
export function tokenHoiKho(hoiId: string): string;           // "kho:<hoiId>"
export function guiHoiKho(hoiId: string, send: SendFn): ReturnType<SendFn>;   // auth.attributes { purpose: "kho", hoiId, userId }, continuationToken tokenHoiKho, mode "task", ghi phienId = phien.id
export function drainHoiKho(send: SendFn): Promise<void>;     // nhận AgentTask hoi-kho đến hạn bằng CTE MATERIALIZED … FOR UPDATE SKIP LOCKED, gửi, đóng việc
export function phanLoaiLoi(thongDiep: string): "het-tran" | "loi-model";   // /402|insufficient|credit|budget|quota|spend limit/i theo fixtures
```
Nhánh `kho` của `instructions/task.ts`: «This is one question to the document library. Call tro_ly_kho exactly once and pass the user message unchanged. Do not answer it yourself. Reply only "đã chuyển".»

- [ ] **Step 1: Test đỏ** — 6 ca E13 (CRM 402, Zalo 402 bước đầu — dùng support của Task 8 nếu có, không thì ca Zalo chuyển Task 8; ngân sách tháng; 500; xong không nộp; quá hạn + nhịp) với câu người hỏi === hằng; đầu cuối E7: `taiLieu.hoi` → `drainHoiKho(sendGia)` → phiên gốc giả gọi `tro_ly_kho` giả → `nopTraLoi` → `hoiKetQua` trả TRA_LOI.
- [ ] **Step 2:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-kho-loi.spec.ts"` → FAIL.
- [ ] **Step 3:** Viết như trên.
- [ ] **Step 4:** Step 2 → PASS; `bun run test -- "cd apps/agent && bun test test/lanes.integration.spec.ts test/tasks.integration.spec.ts"` xanh (làn cũ không nhận `hoi-kho`).
- [ ] **Step 5: Phá-thử** hai chiều đỏ E13.
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — luồng hỏi trong CRM và đóng câu khi trợ lý hỏng`.

---

### Task 8: Luồng Zalo

**Phục vụ:** E8, E13 (ca Zalo). **independent: false** (Task 6, 7).

**Files:**
- Modify: `apps/agent/agent/lib/zalo-config.ts` (`ZALO.hoi.congCu.subagent = ["tro_ly_kho"]`), `apps/agent/test/zalo-chi-doc.spec.ts` (luật mới: mỗi tên trong `subagent` là thư mục `subagents/<tên>`)
- Modify: `apps/agent/agent/lib/zalo-chi-dan.ts` (một đoạn: câu về quy định, chính sách, quy trình, biểu mẫu của OneHub thì gọi `tro_ly_kho`, không tự trả lời)
- Modify: `apps/agent/agent/channels/zalo.ts` (`message.completed`: có `TaiLieuHoi` `zaloHoiId = hoiId` đã đóng → gửi `dungTraLoiZalo`/`dungTuChoi`/câu lỗi thay `message`; `traLoiVe` nhận chữ thay thế)
- Modify: `docs/agent.md` mục Zalo (ngoại lệ lưu chữ câu bị từ chối)
- Test: `apps/agent/test/tro-ly-kho-zalo.integration.spec.ts`

- [ ] **Step 1: Test đỏ** — 10 khẳng định E8 với Zalo giả, model giả cho gốc (gọi `tro_ly_kho` khi câu chứa «quy định») và cho `tro_ly_kho`; hàng có trước lần gọi model đầu (model giả ghi số hàng); gốc gọi hai lần → một hàng; `read_page` gọi từ phiên gốc ném; ca 402 Zalo bước đầu của E13.
- [ ] **Step 2:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-kho-zalo.integration.spec.ts test/zalo-chi-doc.spec.ts"` → FAIL.
- [ ] **Step 3:** Viết như trên.
- [ ] **Step 4:** Step 2 → PASS; `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/hoan-thien-hoi-crm-qua-zalo.integration.spec.ts"` xanh.
- [ ] **Step 5: Phá-thử** hai chiều đỏ E8.
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — hỏi kho qua bot Zalo bằng câu trả lời đã kiểm`.

---

### Task 9: Tab «Hỏi» và hộp «Báo sai»

**Phục vụ:** E7d, E17, E7u (màn). **independent: false** (Task 4, 5).

**Files:**
- Run (trong `packages/ui`): `bunx --bun ai-elements@latest add prompt-input inline-citation suggestion` (đọc `.agents/skills/ai-elements/references/*.md` trước; diverge theo `docs/chat-ui.md`: chuỗi qua `messages.ts`, không `rounded-full`, ghi `_acceptance/nen-chat-ai-elements/so-lech-chuan.md`)
- Modify: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` (gỡ miễn `conversation.tsx`), `docs/chat-ui.md` (bảng «in the tree»)
- Create: `apps/app/app/(app)/[slug]/tai-lieu/hoi.tsx`, `hoi-tra-loi.tsx`, `hop-bao-sai.tsx`
- Modify: `apps/app/lib/tai-lieu-man.ts` (`TAB_TAI_LIEU` thêm `"hoi"`; `TAI_LIEU_MAN.hoi.thamDoMs = 2 * GIAY_MS`), `danh-sach.tsx` (tab + nhánh; ẩn với `chiOkr`), `page.tsx` (truyền `coHoi` từ `workspace.get`), `apps/app/lib/messages/tai-lieu.ts` (khối `hoi`, `baoSai` en + vi)
- Test: `apps/app/test/tai-lieu-hoi.dom.tsx`

Hành vi: `useMutation(taiLieu.hoi)` → `hoiId`; `useQuery({ ...taiLieu.hoiKetQua.queryOptions({ hoiId }), enabled: !!hoiId, refetchInterval: (q) => q.state.data?.trangThai === "DANG_HOI" ? TAI_LIEU_MAN.hoi.thamDoMs : false })`; lịch sử là state client; câu trả lời dựng từ `traLoi` (mỗi `cau.chu` một `MessageResponse`, trích bằng `InlineCitation` với tên trang là `Link` tới `/tai-lieu/<slug>`); cảnh báo quá hạn là `Alert`; từ chối hiện `TAI_LIEU_HOI.tuChoi` và các trang gần nhất là `Link`; lỗi hiện câu theo `lyDo` + nút «Hỏi lại»; trần (`TOO_MANY_REQUESTS`) khoá `PromptInput`; vùng câu trả lời `aria-live="polite"`; «Báo sai» mở `Dialog` với `Textarea` ghi chú, nút huỷ là `DialogClose asChild`, gửi xong thành «Đã báo sai» (khoá).

- [ ] **Step 1: Test đỏ** — 9 ô E7d (giả `useTRPC` như `tai-lieu-suc-khoe.dom.tsx`, `textContent`).
- [ ] **Step 2:** `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-hoi.dom.tsx` → FAIL.
- [ ] **Step 3:** Kéo AI Elements, dựng màn.
- [ ] **Step 4:** Step 2 → PASS; chạy khoá `tlk_san_thiet_ke` (design-gate static + `mo-coi.mjs`) → exit 0.
- [ ] **Step 5: Phá-thử** hai chiều đỏ E7d và chiều đỏ E17 (`rounded-xl` trên `Button`).
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — tab Hỏi của Kho và hộp báo sai`.

---

### Task 10: Dòng xác minh trên màn đọc, hai danh sách Sức khoẻ

**Phục vụ:** E6d, E10d. **independent: true** so với Task 9 (cùng phụ thuộc Task 5).

**Files:**
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/man-doc.tsx`, `[trang]/page.tsx` (`TrangDoc` thêm `xacMinhDen`, `coQuyenXacMinh` từ `taiLieu.get`)
- Create: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/dat-xac-minh.tsx` (`Dialog` + `DatePicker` + `DialogClose`)
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/suc-khoe.tsx` (hai `Khoi` `chua-tra-loi`, `bao-sai`; nút «Đã xử lý»; hộp kết luận cho báo sai)
- Modify: `apps/app/test/tai-lieu-suc-khoe.dom.tsx` (năm khối thành bảy), `_acceptance/tim-va-dieu-huong-kho/rang/man-suc-khoe.mjs` (`length === 7`, `MONG_KHOI` thêm hai khoá) — thước hồ sơ đã ký bị chạm: ghi dòng sổ `fix`, chạy làn ghim lại cho `tim-va-dieu-huong-kho` ở cuối vòng
- Test: `apps/app/test/tai-lieu-xac-minh.dom.tsx`, `apps/app/test/tai-lieu-hoi-suc-khoe.dom.tsx`

- [ ] **Step 1: Test đỏ** — 5 ô E6d, 10 ô E10d.
- [ ] **Step 2:** `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-xac-minh.dom.tsx ./test/tai-lieu-hoi-suc-khoe.dom.tsx ./test/tai-lieu-suc-khoe.dom.tsx` → FAIL.
- [ ] **Step 3:** Dựng.
- [ ] **Step 4:** Step 2 → PASS.
- [ ] **Step 5: Phá-thử** chiều đỏ E6d, E10d.
- [ ] **Step 6: Commit** `feat(kho-tai-lieu): lượt 4 — đặt hạn xác minh trên màn đọc, hai danh sách Sức khoẻ`.

---

### Task 11: Thước màn, bộ câu đo «tạm», in ngưỡng

**Phục vụ:** E7u, E15, E15j, E16j, đường đo. **independent: false** (Task 7–10).

**Files:**
- Create: `_acceptance/tro-ly-doc-kho/rang/man-hoi.mjs` (khuôn `man-suc-khoe.mjs`: `PHIEN_DO`/`API_URL` bắt buộc, `moDo()` từ `kho-tai-lieu/rang/man-lib.mjs`, sáu bước E7u, `--chieu-do`). Phiên đo không chạy agent: sau khi màn gửi `taiLieu.hoi`, thước đóng vai trợ lý tất định — đọc `hoiId` vừa tạo, ghi kết quả bằng `nopTraLoi` thật (đi qua `kiemTraLoi`) hoặc `ghiKetQuaHoi` cho ca từ chối và lỗi, rồi để màn tự thăm dò. Không thêm biến môi trường hay đường model giả nào vào mã sản phẩm. E7u ghi «agent chạy với model giả tất định»: thước đóng vai đó, ghi dòng sổ `approach` ở S2 và trình ở Cổng 1.5.
- Create: `_acceptance/tro-ly-doc-kho/bo-do/trang-mau/*.md` (8 trang mẫu máy viết: hoa hồng theo tầng, nghỉ phép năm, đối soát và chi, bảo mật dữ liệu khách hàng, quy trình khiếu nại, công tác phí, thử việc, biểu mẫu đề nghị tạm ứng), `bo-do/mam-tam.json` (40 câu: 20 có trang, 6 «khong-co», 4 không dấu, 10 không phải quy định; mỗi câu `tam: true`)
- Create: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts` (`--bo`, mặc định `mam-tam.json`; phiên đo riêng; gieo trang mẫu qua đường duyệt thật; lượt một qua `guiHoiKho`, lượt hai qua phiên `purpose: "zalo"` với Zalo giả; ghi `evidence/cham-bo-do.md`; ngưỡng từ `evals.yaml` E15; mã 0/1)
- Create: `_acceptance/tro-ly-doc-kho/rang/nguong.ts` (in `demHoiKho`, `demBaoSai` cho cửa sổ chạy thật)

- [ ] **Step 1:** Viết `man-hoi.mjs`; chạy `--chieu-do` trên bản sao ẩn tab → «buoc 1: khong thay tab Hỏi», mã 1.
- [ ] **Step 2:** `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/tro-ly-doc-kho/rang/man-hoi.mjs"` (`lsof -i :3300` trước) → sáu «buoc N: dat», ảnh ở `.acceptance-runs/tro-ly-doc-kho/evidence/`.
- [ ] **Step 3:** Viết trang mẫu, bộ câu, `cham-bo-do.ts`; chiều đỏ: bộ câu đổi slug mong đợi của 3 câu → ba dòng «sai», mã 1.
- [ ] **Step 4:** Chạy `bun _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts` với khoá thật (đặt `KHO_TAI_LIEU_AI_GATEWAY_API_KEY`; hết ngân sách thì ghi BLOCKED hạ tầng, không hạ thước).
- [ ] **Step 5: Commit** `test(kho-tai-lieu): lượt 4 — thước màn Hỏi, bộ câu đo tạm và script chấm`.

---

### Task 12: Tài liệu và từ điển

**Phục vụ:** không eval riêng; giữ luật kho. **independent: true**.

**Files:**
- Modify: `docs/agent.md` (mục mới «Chỗ rẽ: Trợ lý AI đọc kho (lượt 4)» theo khuôn mục máy soạn; dòng «Áp dụng hôm nay»; ngoại lệ Zalo đã sửa ở Task 8)
- Modify: `docs/api.md` (mục «Kho tài liệu: hỏi, báo sai, xác minh»)
- Modify: `CONTEXT.md` (ba mục mới: **Trích dẫn**, **Báo sai**, **Câu chưa trả lời được**, mỗi mục có `_Avoid_` và «Vì sao»)
- Modify: `docs/environment.md` (`KHO_TAI_LIEU_AI_GATEWAY_API_KEY` nay dùng cho cả máy soạn và trợ lý kho), `apps/agent/agent/lib/capabilities.ts` (`label: "Document library key"`, `gives` nói cả hai việc), `apps/agent/test/capabilities.spec.ts` nếu ghim chữ

- [ ] **Step 1:** Viết; `bun run lint:slop` xanh.
- [ ] **Step 2: Commit** `docs(kho-tai-lieu): lượt 4 — trợ lý AI đọc kho trong agent, api và từ điển`.

---

## Thứ tự và cách chạy

1 → (2 ∥ 3) → 4 → 5 → 6 → 7 → 8 → (9 ∥ 10) → 11 → 12. Sau mỗi task: verify riêng của task; cuối S3 chạy đủ năm lệnh từ gốc (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`). Chỉ ca `kr-may` của `apps/api/test/okr-cap-nhat.spec.ts` được phép đỏ (phiên khác đang sửa).

## Self-review

- Phủ thiết kế: kiến trúc (6), ranh giới (6), tool (6), kiểm trích (2, 6), từ chối (2, 6), quá hạn (2, 5, 10), xác minh (5, 10), bảng (1), CRM (4, 7, 9), Zalo (8), báo sai và hàng (5, 10), lỗi (7, 8), trần (4), đo (4, 11). Không mục nào trống.
- Lệch thiết kế ghi ở đây: hàm tìm ở `packages/db` nhận `tsquery` dựng sẵn (vòng phụ thuộc `validation → db`); `hoiId` tra theo `rootSessionId` vì thuộc tính phiên gốc không sang phiên con; `poke` qua hàm công khai `danhThucHoiKho`; cột `soLanBac` thêm vào bảng hỏi; danh sách `ZALO.hoi.congCu.subagent` mới.
