# Việt hoá lát agent-builder — đợt một · Kế hoạch thi công

> **Cho người thi công:** dùng `superpowers:executing-plans`. Mỗi bước là một ô đánh dấu.

**Goal:** 226 chuỗi trên 16 file của cụm dựng tác nhân đọc bằng tiếng Việt, có thước tự chứng.

**Architecture:** Ba kho chuỗi mới theo khuôn `en` / `type` / `vi satisfies` / `BANG` / `xMessages(locale)`. Bản khai lát mới trỏ bộ thước của ba vòng trước qua `--lat` — không chép thước.

**Tech Stack:** Next.js app router · `useLocale()` cho client · `getLocale()` cho server · bộ thước `.mjs` dùng TypeScript compiler API.

**Spec:** `docs/superpowers/specs/2026-09-05-agent-builder-noi-tieng-viet-design.md`

## Global Constraints

- Khuôn kho chuỗi: `const en = {…}` → `export type XMessages = typeof en` → `const vi = {…} satisfies XMessages` → `const BANG = { en, vi } satisfies Record<Locale, XMessages>` → `export function xMessages(locale: Locale)`. **KHÔNG `as const`** — nó đóng băng kiểu literal khiến `vi` không khác `en` được.
- Client: `useLocale()` từ `@crm/ui/components/locale-provider`. Server: `getLocale()` từ `@/lib/locale/server`.
- Hàm ghép biến nhận `string`, không nhận `number` — bộ canh đòi vậy.
- Cấm `Record<string, unknown>` (anti-slop) và cấm `typeof x === "number"` (dùng `Number.isInteger`).
- Không viết chú thích trong mã. Không dòng đồng tác giả trong commit.
- Mỗi phép đo mới xong khi có **cặp hai chiều**: vật lành → xanh, phá vật → đỏ với thông điệp ghim.
- Từ vựng: **tác nhân** · **hội thoại** · **lượt chạy** · *manifest* giữ nguyên.

---

### Task 1: Bản khai lát và ổ cắm

**Files:**
- Create: `_acceptance/agent-builder-noi-tieng-viet/rang/lat-agent-builder.json`
- Create: `_acceptance/agent-builder-noi-tieng-viet/rang/khong-phai-chu-nguoi-doc.json`
- Modify: `_acceptance/config.yaml` (thêm ổ cắm `ab_*`)

**Interfaces:**
- Produces: `lat-agent-builder.json` với `thu_muc[]`, `them[]`, `khong_quet[]` (sáu file hoãn), `mien_tru[]`, `neo{file:16, chuoi:226, van_ban:176, thuoc_tinh:50}`.

- [ ] **Bước 1:** Viết bản khai với mười thư mục/file, sáu dòng `khong_quet` kèm lý do, và bốn số neo.
- [ ] **Bước 2:** Chép `khong-phai-chu-nguoi-doc.json` của vòng trước rồi **cắt sạch** các dòng không có đối tượng trong lát này; thêm dòng cho định danh của lát (`pierre-dark-soft`, `unified`, `wrap`).
- [ ] **Bước 3:** Thêm 12 ổ cắm `ab_*` vào `executors.script` trỏ về thước của hai vòng trước kèm `--lat`.
- [ ] **Bước 4:** Chạy `ab_moi_chuoi` — kỳ vọng ĐỎ với danh sách chuỗi tiếng Anh (chưa dịch gì). Đây là chiều đỏ nền của cả vòng.
- [ ] **Bước 5:** Commit.

### Task 2: Kho chuỗi khung và năm file khung

**Files:**
- Create: `apps/app/lib/messages/agent-builder-khung.ts`
- Modify: `agent-builder-shell.tsx` · `agent-builder-sidebar.tsx` · `agent-builder-home.tsx` · `agent-builder-route-fallback.tsx` · `team-agents-index.tsx`

**Interfaces:**
- Produces: `khungMessages(locale)` với nhóm `thanhBen`, `trang`, `doi`.

- [ ] **Bước 1:** Viết kho `en` + `vi` cho 36 chuỗi khung.
- [ ] **Bước 2:** Nối năm file qua `useLocale()`.
- [ ] **Bước 3:** `bun run check-types` — kỳ vọng 0 lỗi.
- [ ] **Bước 4:** Chạy `ab_moi_chuoi` — kỳ vọng số chuỗi tiếng Anh giảm đúng 36.
- [ ] **Bước 5:** Commit.

### Task 3: Kho chuỗi Tác nhân của đội và năm file

**Files:**
- Create: `apps/app/lib/messages/agent-builder-tac-nhan.ts`
- Modify: `team-agent-detail.tsx` · `agent-capabilities.tsx` · `new-agent-dialog.tsx` · `create-channel-dialog.tsx` · `agent-runs-drawer.tsx`

- [ ] **Bước 1:** Viết kho cho 122 chuỗi, gồm ba câu quanh bộ chọn kênh (`Lives in`, `Create a channel`, `One channel…`).
- [ ] **Bước 2:** Nối năm file.
- [ ] **Bước 3:** `check-types` + `ab_moi_chuoi` — kỳ vọng giảm đúng 122.
- [ ] **Bước 4:** Commit.

### Task 4: Kho chuỗi kết quả/mã và bốn file

**Files:**
- Create: `apps/app/lib/messages/agent-builder-ket-qua.ts`
- Modify: `agent-code-workspace.tsx` · `agent-code.tsx` · `deal-list-result.tsx` · `agent-result.tsx`

- [ ] **Bước 1:** Viết kho cho phần chữ người đọc; định danh kỹ thuật vào `khong-phai-chu-nguoi-doc.json` kèm lý do, KHÔNG vào kho.
- [ ] **Bước 2:** Nối bốn file.
- [ ] **Bước 3:** `check-types` + `ab_moi_chuoi` — kỳ vọng **0 chuỗi tiếng Anh**, và mọi dòng miễn trừ còn đối tượng thật.
- [ ] **Bước 4:** Commit.

### Task 5: Bốn tiêu đề tài liệu

**Files:**
- Modify: bốn `page.tsx` dưới `app/(app)/[slug]/(agent-builder)/`

- [ ] **Bước 1:** Đổi `export const metadata` thành `export async function generateMetadata()` đọc `getLocale()`.
- [ ] **Bước 2:** Chạy `ab_tieu_de` — kỳ vọng nhận đúng bốn ô.
- [ ] **Bước 3:** Chiều đỏ: đổi một ô về chuỗi viết thẳng, chạy lại, kỳ vọng ĐỎ gọi tên ô; hoàn nguyên.
- [ ] **Bước 4:** Commit.

### Task 6: Bốn bảng đóng

**Files:**
- Create: `rang/toast-cua-lat.json` · `rang/thuoc-tinh-cua-lat.json` · `rang/khong-dich-cua-lat.json` · `rang/du-lieu-nguoi-nhap.json`

- [ ] **Bước 1:** Sinh bảng toast từ mã (`(file, khoá)`), chạy `ab_toast` hai chiều.
- [ ] **Bước 2:** Sinh bảng thuộc tính: tên thuộc tính **lấy từ cây**, trừ danh sách kỹ thuật có tên; ghim tổng bằng 50.
- [ ] **Bước 3:** Bảng không-dịch: mỗi dòng một giá trị, so **giá trị** giữa hai lượt tiếng.
- [ ] **Bước 4:** Bảng dữ liệu người nhập: `(file, trường)` + `nguon_san` để đo trên vật thật.
- [ ] **Bước 5:** Mỗi bảng có chiều đỏ riêng đã chạy. Commit.

### Task 7: Hai chân đo mới và bộ đột biến

**Files:**
- Create: `rang/man-that.mjs` (gọi lib của vòng trước, không chép) · `rang/dot-bien.mjs`

**Interfaces:**
- Consumes: `man-that-lib.mjs` và `dot-bien-lib.mjs` của `man-cai-dat-noi-tieng-viet`.

- [ ] **Bước 1:** Chân `thuoc-tinh`: sinh tên thuộc tính từ cây, trừ danh sách kỹ thuật, đòi tổng bằng neo.
- [ ] **Bước 2:** Chân `trang-thai`: **gieo một tác nhân qua `agents.save`**, đo ≥6/8 trạng thái, dọn vật sau khi đo; lệnh dọn hỏng là mã 2.
- [ ] **Bước 3:** Bộ đột biến: bảng đóng `(hình dạng, chân chuyên trách)` cho sáu hình dạng; vết component dùng chung cắm NGOÀI `components/agent-builder`.
- [ ] **Bước 4:** Chạy cả hai chân hai chiều. Commit.

### Task 8: Từ điển và bộ canh

**Files:**
- Modify: `CONTEXT.md` · `apps/app/test/messages-guard.spec.ts` (nếu cần ghim hàm mới)
- Create: `rang/tu-dien.mjs`

- [ ] **Bước 1:** Thêm mục **Tác nhân** vào `CONTEXT.md` kèm các từ đi kèm lát này dùng lặp.
- [ ] **Bước 2:** Viết chân `tu-dien`: mỗi từ khai trong mục phải xuất hiện trong bản `vi` của ba kho — mục từ điển chết là ĐỎ.
- [ ] **Bước 3:** Chạy bộ canh kho chuỗi; ghim mọi hàm ghép biến mới.
- [ ] **Bước 4:** Chiều đỏ cho chân từ điển. Commit.

### Task 9: Bốn bộ kiểm và chốt S3

- [ ] **Bước 1:** `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run db:test && bun run test`.
- [ ] **Bước 2:** Chạy trọn 17 ổ cắm `ab_*` tuần tự — mọi chân xanh.
- [ ] **Bước 3:** Đặt contract `status: implemented`, commit, dispatch S4.
