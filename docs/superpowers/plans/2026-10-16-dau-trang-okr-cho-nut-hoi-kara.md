# Khung chờ đầu trang OKR chừa chỗ nút «Hỏi Kara» — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (Native, phiên này tự làm). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khung chờ đầu trang OKR dựng nút «Hỏi Kara» thật ở đúng chỗ, hàng tiêu đề không nhảy khi tải xong.

**Architecture:** Tách `DauTrangOkrCho` khỏi `dau-trang-okr.tsx` sang `dau-trang-okr-cho.tsx` (không gói máy chủ); cụm phải
thành `<NutHoiKara />` + ô xương chọn kỳ. Không đổi `LuoiDauTrangOkr`, không đổi `NutHoiKara`.

**Tech Stack:** Next App Router (Suspense fallback), TanStack Query `useMutation`, nuqs, bun test + jsdom, puppeteer qua
`mot-luot.sh`/`tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-16-dau-trang-okr-cho-nut-hoi-kara-design.md`, hợp đồng
`_acceptance/dau-trang-okr-cho-nut-hoi-kara/contract.md` (làn V, 15/10), `evals.yaml` (E1–E6).

## Global Constraints

- Không chú thích trong code. Không sửa `nut-hoi-kara.tsx`, `khung-man-chung.dom.tsx`, `khung-man-chung.spec.ts` (AC-4).
- `_acceptance/config.yaml` chỉ thêm dòng (các khoá `dto_*` đã thêm ở S1).
- Không chạy gì gọi model (AI Gateway hết trần 15/10 22:50Z).
- Commit của vòng mang slug `dau-trang-okr-cho-nut-hoi-kara` trong tiêu đề (E4 lấy commit của vòng theo slug).

## Review Focus

- Khung chờ bị gỡ giữa lúc `okr.hoiMo` đang chạy: callback `onSuccess` của `useMutation` phải vẫn mở cột hỏi.
- Ở tiếng Anh, chữ nút dài hơn: hàng tiêu đề 375 vẫn không nhảy.
- Ô xương chọn kỳ vẫn cùng cỡ ô chọn kỳ thật (khung-man-chung đã ghim `w-24`).

---

### Task 1: RED trên cây chưa vá (E1)

- [ ] Chạy `kmc_man_do` trên `6fa8ce417` → đòi mã 1 và dòng «toancanh 375: hang tieu de lech …». Ghi dòng đỏ vào sổ (S3).

### Task 2: Khung chờ có nút thật (E2, E3)

**Files:** Create `apps/app/app/(app)/[slug]/okr/dau-trang-okr-cho.tsx`, `apps/app/test/dau-trang-okr-cho.dom.tsx`;
Modify `apps/app/app/(app)/[slug]/okr/dau-trang-okr.tsx`. `independent: false`.

- [ ] Viết test trước: describe `dto-cho` (vi, en; đếm 2) và `dto-bam` (dung-yen, go-giua-chung; đếm 2) theo `evals.yaml`.
- [ ] Chạy → đỏ (tệp khung chờ chưa có).
- [ ] Tách `DauTrangOkrCho` sang tệp mới, cụm phải thành `<NutHoiKara />` + `Skeleton` cũ; `dau-trang-okr.tsx` import nó.
- [ ] Chạy → xanh; commit `fix(dau-trang-okr-cho-nut-hoi-kara): …`.

### Task 3: Đột biến (E6) và «không sửa» (E4)

**Files:** Create `_acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/dot-bien.mjs`, `rang/khong-sua.mjs`. `independent: true`.

- [ ] `dot-bien.mjs`: đối chứng dương + một cặp (bỏ `<NutHoiKara />`) → «dto dot-bien: 1/1 cắn».
- [ ] `khong-sua.mjs`: commit của vòng theo `--grep=<slug>`, 0 chạm ba tệp, rồi chạy hai tệp kiểm khung-man-chung;
      `--kiem-do-do` thêm commit tạm trên bản sao chạm `nut-hoi-kara.tsx` → «khong-sua: cham nut-hoi-kara.tsx», mã 1.
- [ ] Commit.

### Task 4: Xanh trên màn thật (E1) và lưới kho

- [ ] `kmc_man_do` → mã 0, «do toancanh 375» lệch ≤ 4 px.
- [ ] `bunx turbo run lint --force`, `bun run lint:slop`, `bun run check-types` → xanh.
- [ ] Contract `status: implemented`, commit, xin lượt `s4`.
