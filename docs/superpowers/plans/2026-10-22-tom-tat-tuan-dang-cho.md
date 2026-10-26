# Tóm tắt tuần có trạng thái chờ (HT4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khối Tóm tắt tuần ở Họp tuần hiện một dòng nêu giờ bản đầu tiên tới (hoặc «đang xếp», «tạm nghỉ») cho phòng ở nấc bật mà chưa có bản.

**Architecture:** Một luật giờ xếp dùng chung ở `packages/db/src/okr-tom-tat.ts` (tác tử import lại). Hàm đọc `choBanDauTomTat` ở cùng tệp trả trạng thái chờ; `TroLyService.troLyTomTat` gắn nó vào kết quả dưới khoá tuỳ chọn `choBan`. `KhoiTomTat` thêm nhánh hiển thị và `refetchInterval`.

**Tech Stack:** Prisma, NestJS + nestjs-trpc, Zod, React + TanStack Query, bun test.

**Spec:** `docs/superpowers/specs/2026-10-22-tom-tat-tuan-dang-cho-design.md` · hợp đồng `_acceptance/tom-tat-tuan-dang-cho/contract.md` · evals `_acceptance/tom-tat-tuan-dang-cho/evals.yaml`.

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Chữ màn qua `apps/app/lib/messages/okr-toan-canh.ts`, có bản `en`; tệp chung chỉ THÊM khoá.
- Giờ hiện theo `OKR_CHU_KY.muiGio` (`Asia/Ho_Chi_Minh`).
- Không chạm `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`; không migration.
- Khoá `choBan` vắng ở mọi trạng thái cũ; output cũ của nấc khác bật giữ đúng ba khoá.
- Bài kiểm chạy theo tệp (máy đang thiếu bộ nhớ), không chạy cả bộ.
- Không chạy S4, không xin khoá; dừng sau S3.

## Review Focus

- Mốc giờ VN qua nửa đêm UTC: 06:00 VN = 23:00 UTC hôm trước — mọi phép so ngày phải đi qua `dauNgayVN`/`ngayVN`, không `Date#getDay`. (Task 1, ma trận 28 ô chạy ở hai TZ.)
- Chủ nhật = 7 trong `updateWeekday` nhưng `getUTCDay()` = 0. (Task 1, ô thứ 7 → xếp thứ Hai.)
- Sang tháng theo giờ VN chứ không theo UTC (01/12 06:00 VN = 30/11 UTC). (Task 3, ô «sang tháng».)
- Phòng ở chế độ ẩn từng có bản `nac: "an"` rồi chuyển bật: vẫn là «chưa có bản nấc bật». (Task 2, ô thêm trong ma trận E7.)
- Hẹn giờ quá xa (`luc` cách > 2^31−1 ms) không được gọi `setTimeout` tràn. (Task 5, ô `toi-luc` xa.)

---

### Task 1: Một luật giờ xếp dùng chung

**Files:**
- Modify: `packages/db/src/okr-tom-tat.ts` (thêm hàm thuần)
- Modify: `apps/agent/agent/lib/okr/lich-tom-tat.ts` (xoá `gioXepCua` riêng, import từ `@crm/db/okr-tom-tat`; thay `thuTrongTuan(homQua)` bằng `thuCapNhatCuaNgayXep(task.dueAt)`)
- Test: `apps/api/test/tom-tat-tuan-dang-cho.spec.ts` (describe `ttdc-luat-gio`)

**Interfaces — Produces:**
- `gioXepCua(luc: Date): Date` — 06:00 VN (`OKR_TOM_TAT.gioXep`) của ngày VN chứa `luc`.
- `thuCapNhatCuaNgayXep(ngayXep: Date): number` — `thuTrongTuan` của hôm trước (1 = thứ Hai … 7 = Chủ nhật).
- `lanXepTomTatKe(now: Date, updateWeekday: number): Date` — lần `gioXepCua(D)` sớm nhất > `now` với `thuCapNhatCuaNgayXep(D) === updateWeekday`.
- `lanXepTomTatHomNay(now: Date, updateWeekday: number): Date | null` — `gioXepCua(now)` nếu hôm nay là ngày xếp của chu kỳ và giờ đó ≤ `now`, ngược lại `null`.

- [ ] Step 1: viết ca `ttdc-luat-gio` — bảng viết tay 28 ô (7 thứ × {05:59, 06:00, 06:01 ngày xếp, 12:00 ngày cập nhật}), mỗi ô ISO UTC mong đợi; assert `Intl.DateTimeFormat().resolvedOptions().timeZone === process.env.TZ` (thông điệp «ttdc-luat-gio: TZ khong ap»); đếm assert = 28 và in; ca con: `thuCapNhatCuaNgayXep` đúng 7 ngày; đọc nguồn `lich-tom-tat.ts` không còn `function gioXepCua` và có import `gioXepCua` từ `@crm/db/okr-tom-tat`. Thông điệp lệch: `ttdc-luat-gio: lech o <thu>/<vi tri>`.
- [ ] Step 2: chạy `cd apps/api && TZ=UTC bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t ttdc-luat-gio` → FAIL (chưa có hàm).
- [ ] Step 3: cài bốn hàm; dời `gioXepCua` khỏi tác tử.
- [ ] Step 4: chạy lại ở `TZ=UTC` và `TZ=America/Los_Angeles` → PASS; chạy `cd apps/agent && bun test test/tro-ly-okr-lich-tom-tat.integration.spec.ts` qua `bun run test --` → PASS (hành vi xếp không đổi).
- [ ] Step 5: phá-thử: bản sao bỏ «+1 ngày» → đỏ đúng thông điệp; hoàn lại. Commit.

Phục vụ E3. independent: false (Task 2–4 dùng hàm).

### Task 2: Hàm đọc trạng thái chờ

**Files:**
- Modify: `packages/validation/src/okr-tom-tat.ts` — `choBanTomTat`, `LY_DO_TAM_DUNG_TOM_TAT`, `choBan: choBanTomTat.optional()` trong `troLyTomTatOutput`, type `ChoBanTomTat`.
- Modify: `packages/db/src/okr-tom-tat.ts` — `choBanDauTomTat`.
- Test: `apps/api/test/tom-tat-tuan-dang-cho.spec.ts` (`ttdc-khong-doi` phần CSDL dựng ở Task 3)

**Interfaces — Produces:**
- `choBanTomTat = z.discriminatedUnion("kieu", [{kieu:"toi-luc", luc: z.string().datetime()}, {kieu:"dang-xep"}, {kieu:"tam-dung", lyDo: z.enum(LY_DO_TAM_DUNG_TOM_TAT), moLai: ngay.nullable()}])`; `LY_DO_TAM_DUNG_TOM_TAT = ["het-tran-thang", "chua-co-khoa-mo-hinh"] as const`.
- `choBanDauTomTat(db: DbHoacTx, v: { cycleId: string; departmentId: string; now: Date }): Promise<ChoBanTomTat | null>` — null khi chu kỳ không `dang-chay` hay đã ẩn, hoặc có `OkrTomTat` của (chu kỳ, phòng) với `cau.nac = "bat"`. Ngược lại: `lanXepTomTatHomNay` khác null và có `agentTask` kind `okr-tom-tat-xep`, `dueAt` bằng nó, `finishedAt` null → `dang-xep`; không thì `luc = lanXepTomTatKe`. Rồi `quaTranChung(db, await cauHinhAiLuc(db, now), now)`: không sẵn sàng và (lý do khác `het-tran-thang` hoặc `thangVN(luc) === thangVN(now)`) → `tam-dung` với `moLai` = ngày 01 tháng sau (VN) cho hết trần, `null` cho chưa có khoá. Sẵn sàng → `toi-luc` hoặc `dang-xep`.

- [ ] Step 1–4: TDD qua ca CSDL ở Task 3 (hàm không có lối kiểm riêng ngoài CSDL). `bun run check-types` gói `packages/db`, `packages/validation` sạch.
- [ ] Step 5: Commit.

Phục vụ E2, E5, E6, E7. independent: false.

### Task 3: API gắn `choBan` và bài kiểm CSDL

**Files:**
- Modify: `apps/api/src/okr/tro-ly.service.ts` — trong `troLyTomTat`, sau khi có `ban`, `tuan`: nếu `ban === null && !tuan.dangSoan && !tuan.chuaCapNhat` thì gọi `choBanDauTomTat`; khác null thì thêm `choBan`.
- Modify (nếu trpc:generate đổi): `apps/api/src/generated/server.ts`.
- Test: `apps/api/test/tom-tat-tuan-dang-cho.spec.ts` — ca `ttdc-api-cho`, `ttdc-dang-xep`, `ttdc-tam-dung`, `ttdc-khong-doi`, `ttdc-mot-luat`.

Neo: bộ OKR mẫu (`batDauMau`, `MOC_MAU` = 12/11/2026 15:00 VN, thứ Năm; chu kỳ quý 4 `updateWeekday` = 1). Đổi ngày cập nhật của chu kỳ qua dịch vụ chu kỳ thật khi ô cần thứ khác. Bật phòng bằng `ghiCauHinh` (setProgram thật). Thêm cập nhật bằng `moCapNhat` + `guiCapNhat` thật. Ngày cụ thể trong evals đổi sang mốc của bộ mẫu — một dòng sổ `fix` stage `S3`.

- [ ] Step 1: viết năm ca; mỗi ca in thông điệp ghim như `expected` của E2, E4, E5, E6, E7. `ttdc-khong-doi` có thêm ô «phòng từng có bản nấc ẩn rồi bật → có choBan» (đối chứng của «chưa từng có bản nấc bật»). `ttdc-mot-luat` gọi `chayXepTomTat` của tác tử như `tro-ly-okr-tom-tat-doc.spec.ts` đã làm.
- [ ] Step 2: chạy từng ca qua `bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t <ca>"` → FAIL.
- [ ] Step 3: cài phần service.
- [ ] Step 4: chạy lại từng ca → PASS; chạy `tro-ly-okr-tom-tat-doc.spec.ts` và `apps/agent/test/tro-ly-okr-tom-tat-duong-do.integration.spec.ts` → PASS (không đổi hành vi cũ).
- [ ] Step 5: phá-thử bốn chiều đỏ (bỏ lời gọi; bỏ kiểm việc xếp chưa đóng; bỏ kiểm thứ; bỏ nhánh tạm dừng; bỏ điều kiện chưa từng có bản; bỏ điều kiện pha) → đúng thông điệp; hoàn lại. `config.yaml`: đổi `ttdc_mot_luat` sang tệp API (cùng lệnh khuôn) — dòng sổ `fix`. Commit.

Phục vụ E2, E4, E5, E6, E7. independent: false.

### Task 4: Chữ của dòng chờ

**Files:**
- Modify: `apps/app/lib/messages/okr-toan-canh.ts` — thêm vào `tomTat` (vi và en): `choBanDau(gio, thu, ngay, thuCapNhat)`, `dangXep`, `tamNghiDen(ngay)`, `chuaNoiMoHinh`.

Chữ vi chốt: «Kara gửi bản tóm tắt đầu tiên vào khoảng {gio} {thu}, {ngay} — sáng hôm sau ngày cập nhật {thuCapNhat}.» · «Kara đang xếp bản tóm tắt đầu tiên — thường có trong vài phút.» · «Kara tạm nghỉ tóm tắt tuần tới {ngay}.» · «Kara chưa tóm tắt được: quản trị chưa nối mô hình AI.» Bản en tương ứng.

Phục vụ E1, E5, E6, E8. independent: true (gộp commit với Task 5).

### Task 5: Khối hiển thị và tự hỏi lại

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`
- Test: `apps/app/test/tom-tat-tuan-dang-cho.dom.tsx` — ca `ttdc-khoi-cho`, `ttdc-dang-xep`, `ttdc-tam-dung`, `ttdc-khong-doi`, `ttdc-mui-gio`.

**Interfaces — Consumes:** `ChoBanTomTat` qua `RouterOutputs["okr"]["troLyTomTat"]["choBan"]`; `OKR_CHU_KY.muiGio` từ `@/lib/okr-chu-ky-nhan`.

- Thêm `function DongCho({ cho }: { cho: NonNullable<TomTat["choBan"]> })`: `toi-luc`/`dang-xep` → `CardContent data-trang-thai="ST-tomtat-cho-ban-dau"|"ST-tomtat-dang-xep"` với `<p className="text-muted-foreground text-sm" data-cho-ban>`; `tam-dung` → `CardContent data-trang-thai="ST-tomtat-tam-dung"` với `KaraState kind="off"`.
- Định dạng: `Intl.DateTimeFormat(locale, { timeZone: OKR_CHU_KY.muiGio, … })` cho giờ `HH:mm`, thứ (vi viết thường chữ đầu: «thứ Ba»), ngày `dd/MM`; thứ cập nhật = thứ của `luc − 1 ngày`.
- `refetchInterval`: `dangSoan || choBan?.kieu === "dang-xep"` → `nhipHoiLai` như cũ; `choBan?.kieu === "toi-luc"` → `Date.parse(luc) - Date.now()` nếu trong (0, 2^31−1], ngược lại `false`.
- Nhánh mới đặt ngay trước `else return null`.

- [ ] Step 1: viết năm ca DOM theo `expected` của E1, E5, E6, E7, E8 (đồng hồ giả `jest.useFakeTimers` như `tro-ly-okr-tom-tat.dom.tsx`; locale en bọc `LocaleProvider locale="en"` trong phần tử dựng; assert TZ áp).
- [ ] Step 2: chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tom-tat-tuan-dang-cho.dom.tsx` → FAIL.
- [ ] Step 3: cài.
- [ ] Step 4: PASS ở ba TZ cho `ttdc-mui-gio`; chạy `tro-ly-okr-tom-tat.dom.tsx` và `nen-kara-man-cu.dom.tsx` → PASS.
- [ ] Step 5: phá-thử (bỏ nhánh; bỏ hẹn giờ; bỏ `timeZone`) → đúng thông điệp; hoàn lại. Commit.

Phục vụ E1, E5, E6, E7, E8. independent: false (cần Task 2 cho kiểu).

### Task 6: Bàn đo màn

**Files:**
- Create: `_acceptance/tom-tat-tuan-dang-cho/rang/do-man.mjs` — theo khuôn `cap-nhat-gan-day/rang/do-man.mjs` (`isMeasureDatabase`, `canhCay`, `do-man-lib.mjs`, `taoNguCanh`). Bật Tóm tắt tuần cho phòng của trưởng phòng trong ngữ cảnh bằng `okr.setProgram` thật (cookie quản trị), mở Họp tuần của phòng ở 1440 và 375, đo `[data-trang-thai="ST-tomtat-cho-ban-dau"]` có mặt, cao > 0, trong khung sau khi cuộn, không tràn ngang ở 375; chụp `tom-tat-cho-1440.png`, `tom-tat-cho-375.png` (chép vào `evidence/` khi `TTDC_CHEP_ANH=1`). `EVAL=chieu-do` bỏ bước bật → in «SAI KHONG CO DONG CHO 1440», thoát 1.
- [ ] `node --check` qua. Không chạy (phiên đo thuộc S4 của dãy V3). Commit.

Phục vụ E9. independent: true.

### Task 7: Kiểm cuối S3

- [ ] `bun run check-types` (lọc `--filter` các gói chạm), `bun run lint`, `bun run lint:slop` — chạy theo gói, không cả bộ test.
- [ ] Contract `status: implemented`; commit; ghi chú bàn giao; `git switch --detach`.
