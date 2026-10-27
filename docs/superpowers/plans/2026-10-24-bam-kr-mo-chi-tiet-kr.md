# Bấm KR mở chi tiết KR (SV6) — kế hoạch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bấm KR ở bốn chỗ mở chi tiết KR; chữ «Cập nhật tuần» dùng như danh từ thành «Cập nhật»; bài đã ký chỉ đổi đúng bảng cặp.

**Architecture:** Bốn chỗ gọi `openRecord` đổi `kind`; tên KR ở `BangKr` thành `Button variant="link"` dùng `useOpenRecord` như `SoViecKr`. Chữ đổi tại tệp chữ; bảng cặp `rang/cap-chu.json` là nguồn cho bài kiểm chữ (E5) và bộ quét bài đã ký (E6). Bảng chỗ mở `rang/cho-mo-ban-ghi.json` viết trước khi sửa mã (E7).

**Tech Stack:** Next.js App Router, nuqs (`?record=`), bun test + jsdom (`packages/ui/test/setup-dom.ts`), TypeScript compiler API cho bộ quét.

**Spec:** `docs/superpowers/specs/2026-10-24-bam-kr-mo-chi-tiet-kr-design.md` · hợp đồng `_acceptance/bam-kr-mo-chi-tiet-kr/contract.md` (approved 24/10) · `evals.yaml` (E1–E7, khoá `bkr_*`).

## Global Constraints

- Không chú thích trong mã. Thành phần chỉ từ `packages/ui`, không `className` đổi màu/góc.
- Không đổi tên khoá chữ (`capNhatTuan`, `cap-nhat-tuan`); chỉ đổi giá trị theo bảng cặp.
- Bài kiểm và thước của hồ sơ đã ký: mỗi khối đổi là một phần tử của `rang/cap-chu.json` hoặc kỳ vọng `objective:`→`kr:` ở bốn chỗ; mỗi hồ sơ một dòng sổ `fix` `decided_by: Phan Le Manh` trích chữ duyệt Cổng Phạm vi 24/10. Không sửa `apps/agent/test/fixtures/tin-nhac-truoc-tb1.json`.
- Mỗi phép đo mới có cặp hai chiều (đối chứng dương + phá-thử trong bản sao, thông điệp ghim đúng `evals.yaml`). Commit trước khi phá-thử.

## Review Focus

1. Việc OKR có `keyResultId` nhưng KR đã bị xoá → «Mở KR» vẫn mở `kr:<id>`; ngăn KR hiện lỗi sẵn có (không đổi trong vòng) — không vá ở SV6.
2. Cây căn chỉnh: nút KR lồng trong nhóm (chế độ nhóm theo đơn vị) → `theoKhoa` vẫn trả nút có `loai`; bài E2 dựng từ đầu ra thật nên phủ.
3. Bấm tên KR bằng bàn phím trong `BangKr` khi hàng đang kéo-thả hay có menu ⋯ → nút tên không nuốt Enter của menu (E4 ô Enter).
4. Chữ en: «weekly update day» (thuộc tính chu kỳ) không bị đổi — E5 regex loại `day`.
5. Tin nhắc agent ghép chữ ngoài bảng nhãn → E5 đo tin dựng thật cho loại `okr-cap-nhat`.

---

### Task 1: Bảng viết trước (cap-chu, cho-mo-ban-ghi) và bài quét E5, E7 đỏ

phục vụ E5, E7 · `independent: false` (đi đầu)

**Files:** Create `_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json`, `rang/cho-mo-ban-ghi.json`, `apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts` (describe `bkr-chu`, `bkr-quet-mo`).

- [ ] `cap-chu.json`: mảng `{ cu, moi, lang }` chép bảng «Chữ» của design doc (vi và en).
- [ ] `cho-mo-ban-ghi.json`: liệt mọi lời gọi `openRecord`/`useOpenRecord` dưới `okr/` lúc đọc (tệp, mỏ neo, `kind`, `nguon`); bốn chỗ sửa ghi `nguon: "kr"`, `kind: "kr"`.
- [ ] Viết `bkr-chu` (quét tệp chữ + tin dựng thật, ma trận 8 khoá, đối chứng «tuần này») và `bkr-quet-mo` (TS compiler API) đúng `expected` E5, E7. Chạy `bkr_chu`, `bkr_quet_mo` → FAIL.
- [ ] Commit.

### Task 2: Bốn chỗ bấm KR

phục vụ E1–E4, E7 · `independent: false` (sau Task 1)

**Files:** Modify `okr/phan-kr-phu-trach.tsx:83-86`, `okr/cay-can-chinh.tsx:258-260`, `okr/viec-cua-toi.tsx:188-196` (+ `moKr` ở `lib/messages/okr.ts` vi/en: «Mở KR» / «Open key result»), `okr/bang-kr.tsx:366-368`. Test `apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx` (describe `bkr-kr-phu-trach`, `bkr-cay`, `bkr-viec`, `bkr-bang-kr`).

- [ ] Bài DOM đỏ trước: NuqsTestingAdapter ghi `record` cuối; dữ liệu parse bằng khuôn thật; E2 đọc `apps/app/test/fixtures/bkr-cay.json` (Task 3 ghi).
- [ ] Sửa: `openRecord({ kind: "kr", id: k.id })`; cây: `nut.loai === "kr" ? { kind: "kr", id: nut.id } : { kind: "objective", id: nut.objectiveId }`; việc: `viec.keyResultId ? kr : objective`, nhãn `m.moKr`; `BangKr`: tên là `Button asChild={false} size="xs-wrap" variant="link"` gọi `useOpenRecord()({ kind: "kr", id: kr.id })`, giữ `translate="no"`.
- [ ] Chạy bốn lệnh `bkr_*` DOM + `bkr_quet_mo` → PASS. Phá-thử bốn chiều đỏ của E1–E4, E7. Commit.

### Task 3: Bài API của cây (E2b)

phục vụ E2b · `independent: true`

**Files:** Create `apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts` (describe `bkr-cay-api`), `apps/app/test/fixtures/bkr-cay.json`.

- [ ] Gieo O + K1, K2 qua service; `okr.cayCanChinh` qua router caller; khẳng định id nút KR = id `OkrKeyResult`; `BKR_GHI=1` ghi fixture, thường so byte. Phá-thử tiền tố id. Commit.

### Task 4: Chữ «Cập nhật»

phục vụ E5 · `independent: false` (sau Task 1)

**Files:** Modify `apps/app/lib/messages/okr.ts`, `okr-toan-canh.ts`, `okr-soan.ts`, `apps/agent/agent/lib/tin-nhac.ts` theo `cap-chu.json`; GHIM `messages-guard.spec.ts` nếu câu có biến đổi.

- [ ] Đổi giá trị; chạy `bkr_chu` → PASS; phá-thử thêm lại «Cập nhật tuần» → đỏ. Commit.

### Task 5: Bài đã ký và bộ quét không đổi hình (E6)

phục vụ E6 · `independent: false` (sau Task 2, 4)

**Files:** Create `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs` (khuôn `gon-dau-trang-lay-y-kien/rang/khong-doi-hinh.mjs`); Modify bài đã ký đỏ vì chữ/đích mở; mỗi hồ sơ chủ một dòng sổ `fix`.

- [ ] Xin `cham-tep` cho các tệp đã ký sẽ đổi (`dieu-phoi.mjs yeu-cau cham-tep --tep …`).
- [ ] Chạy `bun run test` — liệt bài đỏ; đổi chuỗi kỳ vọng đúng cặp; thêm dòng sổ `fix` vào `_acceptance/<hồ sơ>/decisions.jsonl` của từng hồ sơ chủ.
- [ ] `khong-doi-hinh.mjs` → mã 0; phá-thử `doiLogicThu`, `toBe`→`not.toBe`, xoá dòng sổ → đúng ba thông điệp. Commit.

### Task 6: Năm lệnh chứng

- [ ] `bun run test`, `check-types`, `lint`, `lint:slop`, `build` xanh; contract `status: implemented`; S4.
