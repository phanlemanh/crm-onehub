# Lộ trình hiện ngày dự kiến — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (main loop, tuần tự). Steps dùng `- [ ]`.

**Goal:** Trang Lộ trình đọc bốn khoá giờ máy / ngày dự kiến của khối kit 2.32.0 và hiện ngày dự kiến kèm cờ cho mốc và việc.

**Architecture:** Lõi và giao diện đã dựng ở bước thiết kế (bộ đọc chép từ kit, khuôn zod, `duKienMoc`, `ODuKien`,
`OUocLuong`, bản mẫu). S3 viết các bài kiểm theo `evals.yaml` (E1–E12), mỗi phép đo kèm cặp phá-thử ghim thông điệp,
và phép đo màn `rang/do-man.mjs`.

**Tech Stack:** Next.js app, zod, bun test (+ happy-dom qua `setup-dom.ts`), puppeteer-core, Nest API test.

**Spec:** `docs/superpowers/specs/2026-10-17-lo-trinh-hien-ngay-du-kien-design.md` ·
`_acceptance/lo-trinh-hien-ngay-du-kien/contract.md` · `_acceptance/lo-trinh-hien-ngay-du-kien/evals.yaml`

## Global Constraints

- Không chú thích trong mã. Hằng tinh chỉnh vào `apps/app/lib/lo-trinh/cau-hinh.ts`.
- Fixture rút từ `LO-TRINH.html` thật của cây qua `docDuLieu` rồi code đặt thêm; không viết tay khối.
- Đường dẫn trong bài kiểm suy từ vị trí tệp (`import.meta.dir`), không ghim gốc kho.
- Mỗi phép đo mới: cặp hai chiều trên cùng fixture, chiều đỏ ghim đúng thông điệp trong `evals.yaml`.
- Test chạm DB đi qua `bun run test -- "…"`.

## Review Focus

1. Khối thật có mốc mang `du_kien` nhưng `hoan_tat` sai dạng → cờ «không đọc được», không ném (T2, ô khong-doc-duoc).
2. Việc thuộc hai mốc → dùng mốc đầu theo thứ tự tệp như `phangViec` đang làm (T3 ô viec dùng việc một mốc).
3. Bản chụp lưu trước kit 2.32.0 với `canhBao` cũ → không hộp cảnh báo, cờ ban-cu (T2, T3 ô ban-cu b).
4. Hôm nay đúng ngày hoàn tất → chưa «đã qua» (T2 ô qua-tai).
5. Việc không có giờ máy mở ngăn → không «NaN», không mục Ước lượng (T3 ô viec dòng 3).

---

### Task 1: Bộ đọc và khuôn (E1, E2)

**Files:** Create `apps/app/test/lo-trinh-du-kien.spec.ts` (describe `ban-chep`); Modify `packages/validation/test/lo-trinh-du-lieu.spec.ts` (describe `gio-may`).
**Interfaces:** Consumes `docDuLieu`, `KHOA_LO_TRINH_DU_LIEU`, `phanTichLoTrinh`. Produces helper `khoiThat(): unknown` (JSON thô của `LO-TRINH.html`) trong tệp test.
- [ ] `ban-chep`: rút hàm từ `scripts/lo-trinh.mjs` (dòng `export function docDuLieu` tới `}` đầu dòng) so từng byte với `doc-du-lieu.js`; hàm rút chứa `gio_may`, `du_kien`; phá-thử: bản sao lệch một ký tự trong thư mục tạm → thông điệp `ban chep bo doc lech kit: apps/app/lib/lo-trinh/doc-du-lieu.js`.
- [ ] `gio-may`: ma trận 14 cấp so khoá bộ đọc (khối rỗng mọi cấp) với `KHOA_LO_TRINH_DU_LIEU`; round-trip khối thật giữ bốn khoá; xoá bốn khoá → `null`. Phá-thử: khuôn bỏ `du_kien` → `cap moc lech bo doc: du_kien`.
- [ ] Chạy `ldk_ban_chep`, `ldk_khuon` xanh; commit.

### Task 2: Logic ngày dự kiến (E4, E5, E6 phần logic, E8 phần đọc, E10)

**Files:** Modify `apps/app/test/lo-trinh-du-kien.spec.ts` (describe `so-do`, `qua-tai`, `chua-co`, `ban-cu`, `khoi-that`).
**Interfaces:** Consumes `duKienMoc(lo, moc, homNay)`, `gioMayChuaDu`, `docTrangLoTrinh`, `docDauVaoChoVai`, `banChupVao`, `phanTichBanChupLuu`.
- [ ] Các ma trận viết trước đúng như `evals.yaml` E4/E5/E6/E8/E10, mỗi describe một phá-thử ghim thông điệp.
- [ ] Chạy `ldk_so_do` / `ldk_qua_tai` / `ldk_chua_co` / `ldk_ban_cu` / `ldk_khoi_that` phần spec xanh; commit.

### Task 3: Màn (E3, E4–E8 phần DOM)

**Files:** Create `apps/app/test/lo-trinh-du-kien.dom.tsx` (describe `co-ngay`, `so-do`, `qua-tai`, `chua-co`, `viec`, `ban-cu`).
**Interfaces:** Consumes `TrangLoTrinh`, `NoiDungLoTrinh`, `loTrinhMessages`, `formatDay`, `formatDayShort`, `formatDecimal`; khung render theo `apps/app/test/lo-trinh.dom.tsx` (NuqsTestingAdapter, LocaleProvider).
- [ ] Ma trận theo E3, E7 (12 ô so quan hệ với ô Mốc), E8 (a)(b)(c); phá-thử ghim thông điệp.
- [ ] Chạy các lệnh `ldk_*` phần dom xanh; commit.

### Task 4: Đường bản chụp xuyên lớp (E8 validation, E12)

**Files:** Modify `packages/validation/test/ban-chup-lo-trinh.spec.ts` (describe `gio-may`); Modify `apps/api/test/ban-chup-lo-trinh.spec.ts` (describe `ldk-gio-may`).
**Interfaces:** Consumes `day(o: DauVaoDay)` của `scripts/ban-chup-lo-trinh/day.ts`, `createApp`, `docBanChupLoTrinh`.
- [ ] `ldk-gio-may`: app Nest nghe cổng tự do; `day()` với `goc` = thư mục tạm chứa `LO-TRINH.html` đã đặt `du_kien` cho M; đọc lại DB; phá-thử khuôn bỏ khoá → `ban chup mat ngay du kien: M`.
- [ ] Chạy `ldk_ban_cu`, `ldk_day` xanh; commit.

### Task 5: Phép đo màn (E9)

**Files:** Create `_acceptance/lo-trinh-hien-ngay-du-kien/rang/do-man.mjs` theo khung `_acceptance/lo-trinh-doc-ban-chup/rang/do-man.mjs` (phiên `dev:session`, khoá «Đẩy lộ trình», đẩy bản chụp, dọn sau lượt).
- [ ] Hai phần bản đóng gói + bản chụp, 12 ô, DUNG/SAI + KET LUAN; chạy `ldk_do_man` qua khoá máy, mã 0; commit.

Không task nào `independent: true` (Task 3–5 dùng chung helper và tệp test của Task 1–2).
