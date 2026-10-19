# Màu trạng thái chung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Mọi chấm trạng thái ở 13 khu lấy màu từ một bảng nghĩa (`toneTheoNghia`), bảng có thêm nghĩa «đã kết thúc», và
một bài quét cây cú pháp chặn mọi bảng màu riêng.

**Architecture:** `status-tone.ts` thêm `ketThuc: "neutral"`; mỗi khu khai `NGHIA_<…>: Record<TrangThai, NghiaTrangThai>`
và vẽ bằng `toneTheoNghia(NGHIA_<…>[s])`. Bài quét dùng `typescript` (`ts.createSourceFile`) đi qua mọi `StringLiteral`
màu trong tệp có dùng `StatusIndicator`/`IndicatorDot`.

**Tech Stack:** TypeScript compiler API (`typescript` ở gốc kho), bun test, jsdom, puppeteer qua `man-lib.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-16-mau-trang-thai-chung-design.md` · hợp đồng
`_acceptance/mau-trang-thai-chung/contract.md` (AC-1…AC-6, duyệt 15/10 theo khuyến nghị Hỏi-1…4) · `evals.yaml`.

## Global Constraints

- Không viết chú thích trong code.
- Bảng ánh xạ của design doc là nguồn duy nhất cho nghĩa từng trạng thái; ma trận bài kiểm chép từ đó.
- Không đổi nhãn chữ, không đổi `Badge`, không đổi màu chọn tại chỗ ngoài 13 tệp khu (Hỏi-4).
- Bài DOM chạy từng tệp riêng; lệnh chấm ở `_acceptance/config.yaml` khoá `mtc_*`.
- Thông điệp ghim chiều đỏ chép nguyên văn `evals.yaml`.

## Review Focus

1. Một khu import bảng `TONE_*` của khu khác (tien-do-kr dùng `TONE_NHIP` của okr-status) — đổi tên xuất mà quên chỗ dùng. Phủ: `check-types` + E3.
2. `RESPONSE_TONE[...] ?? "neutral"` của attendee-list giữ chuỗi màu dự phòng — luật 13 tệp cấm. Phủ: E3 phần cây cú pháp.
3. `IndicatorDot` dùng trực tiếp trong cap-nhat-tuan — bài quét phải coi `IndicatorDot` như `StatusIndicator`. Phủ: E2.
4. Hàng đợi làm giàu (`QUEUED` của enrichment-status) là hằng riêng ngoài bảng `PRESENTATION`. Phủ: E3 ma trận có ô «trong hàng đợi».
5. Thông điệp ghim của E2 phải gọi đúng đường tệp tương đối gốc kho. Phủ: chiều đỏ E2.

---

### Task 1: Bảng nghĩa thêm «đã kết thúc» và luật thiết kế (AC-1, AC-5; E1, E5)

**Files:** `packages/ui/src/lib/status-tone.ts`, `packages/ui/test/status-tone.spec.ts`, `docs/design.md`

- [ ] Bài đỏ: `status-tone.spec.ts` thêm `ketThuc: "đã kết thúc"` vào `NHAN_NGHIA`; ca mới «muc mau trang thai khong con cau nam khu cu va noi bai quet» — ghim `mtc-bang: docs/design.md con cau nam khu cu`.
- [ ] Chạy `cd packages/ui && bun test ./test/status-tone.spec.ts` → đỏ.
- [ ] `TONE_THEO_NGHIA.ketThuc = "neutral"`; `docs/design.md` thêm dòng `| đã kết thúc, đã bỏ, đã đóng | \`neutral\` |`, thay câu «Năm khu cũ…» bằng câu nói bài quét `packages/ui/test/mau-trang-thai-mot-bang.spec.ts` giữ luật một bảng.
- [ ] Chạy lại → xanh. Phá thử: bỏ dòng «đã kết thúc» ở bản sao `docs/design.md` → ghim `bang mau lech docs/design.md o nghia ketThuc`.
- [ ] Commit.

Verify: `mtc_bang`. Eval: E1, E5. Independent: có.

### Task 2: Bài quét một bảng (AC-2; E2)

**Files:** Create `packages/ui/test/mau-trang-thai-mot-bang.spec.ts` (+ `packages/ui/test/quet-mau-trang-thai.ts` xuất `quetMau(nguon, tep, { chat })`)

- [ ] `quetMau` dùng `ts.createSourceFile`; với tệp có `StatusIndicator`/`IndicatorDot`: thu mọi `StringLiteral` ∈ {success, warning, error, neutral, info, primary} có tổ tiên gần nhất không phải `JsxAttribute` tên `tone` (luật thường), hoặc mọi chuỗi như vậy (luật chặt). Trả `{tep, dong, chu}[]`.
- [ ] Ca «doi chung duong 4 dang»: bốn chuỗi mã mẫu (Record satisfies · `as const` · `switch` return · `new Map`) → mỗi chuỗi đúng 1 vi phạm, đếm 4.
- [ ] Ca «kho khong co bang rieng»: `git ls-files apps/app packages/ui/src` trừ `apps/app/app/proto/**`, `**/test/**`, `status-tone.ts`, `status-indicator.tsx` → 0 vi phạm; vi phạm ném `mtc-mot-bang: <tệp> khai bang mau rieng`.
- [ ] Chạy → đỏ trên cây hiện tại (13 tệp). Commit bài (đỏ có chủ ý tới Task 4 xong; không đẩy giữa chừng).

Verify: `mtc_mot_bang`. Eval: E2. Independent: có.

### Task 3: Ba khu trong `packages/ui` (AC-3, AC-4)

**Files:** `okr-status.tsx` (xuất `NGHIA_TU_TIN`, `NGHIA_NHIP` thay `TONE_*`), `kara/steps.tsx` (`NGHIA_BUOC`), `attendee-list.tsx` (`NGHIA_PHAN_HOI`, dự phòng `"nhap"`)

- [ ] Đổi từng tệp; `tone={toneTheoNghia(NGHIA_…[x])}`.
- [ ] `bun run check-types` → sửa chỗ dùng `TONE_NHIP` ở `tien-do-kr.tsx` sang `NGHIA_NHIP`.
- [ ] Commit.

Eval: E3, E4. Independent: không (trước Task 4).

### Task 4: Mười khu trong `apps/app` (AC-3)

**Files:** `tien-do-kr.tsx`, `bang-nguon.tsx`, `cap-nhat-tuan.tsx`, `danh-sach-cuoc.tsx`, `tom-tat-quan-tri.tsx`, `bang-chu-ky.tsx`, `kr-viec.tsx`, `enrichment-queue.tsx`, `enrichment-status.ts`, `giai-doan.ts`

- [ ] Mỗi tệp: bảng `NGHIA_…` theo đúng cột «Nghĩa» của bảng ánh xạ; thay `tone` bằng `toneTheoNghia`. `enrichment-status.ts` giữ hình `{ khoa, nghia, busy }` và tính `tone` qua `toneTheoNghia`.
- [ ] `bun run check-types`, `bun run lint`.
- [ ] Bài `apps/app/test/mau-trang-thai-anh-xa.spec.ts`: ma trận viết trước (mọi trạng thái 13 khu → nghĩa, màu), so với bảng `NGHIA_*` xuất từ từng khu, đếm đủ ô, không thừa không thiếu khoá; phần cây cú pháp luật chặt trên 13 tệp. Hai chiều đỏ theo `evals.yaml`.
- [ ] Task 2 nay xanh. Commit.

Verify: `mtc_anh_xa`, `mtc_mot_bang`. Eval: E2, E3. Independent: không.

### Task 5: Bài DOM (AC-4; E4)

**Files:** Create `apps/app/test/mau-trang-thai-dom.dom.tsx`

- [ ] Ma trận 24 ô: `ConfidenceIndicator` ×3, `PaceIndicator` ×6, `KaraSteps` ×5, `AttendeeList` ×4, `BangNguon` ×6 (trpc giả trả một nguồn mỗi trạng thái); đọc `data-tone` của `[data-slot=status-indicator]`/`[data-slot=indicator-dot]`; đếm 24.
- [ ] Phá thử: `DANG_SOAN` về neutral → ghim `mtc-dom: bang-nguon DANG_SOAN data-tone neutral, ky vong info`. Commit.

Verify: `mtc_dom`. Eval: E4. Independent: không.

### Task 6: Bàn đo màn thật Cài đặt OKR (AC-6; E6, E6m)

**Files:** Create `_acceptance/mau-trang-thai-chung/rang/do-chu-ky.mjs` (khuôn `do-lich-su.mjs` của Tài liệu: `moDo`, `chieuDo`, `CAY_DO`, `--chi-do`)

- [ ] Gieo ba chu kỳ ba pha qua tRPC của Cài đặt OKR (tra `settings/okr` router để chọn thủ tục tạo và đặt pha; nếu pha suy từ ngày thì đặt ngày tương ứng).
- [ ] Bước 1 (1280): đọc `data-tone` chấm từng hàng chu kỳ, so kỳ vọng, chụp.
- [ ] Hai chiều đỏ theo `evals.yaml`; `mot-luot.sh` chạy thường và `--chi-do` → mã 0.
- [ ] Commit.

Verify: `mtc_man`, `mtc_man_do`. Eval: E6, E6m. Independent: không.

### Task 7: Lượt kiểm toàn kho

- [ ] Năm lệnh: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.
- [ ] Hợp đồng `status: implemented`; commit.
