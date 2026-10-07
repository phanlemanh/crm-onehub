# chen-lien-ket-khong-lac Implementation Plan

**Goal:** Hộp chèn liên kết không trả focus về trình soạn đã huỷ; bài mới đòi 0 lỗi chưa bắt khi gỡ lúc hộp mở.
**Spec:** `design.md` · `contract.md` · `evals.yaml`

## Global Constraints
- Ranh giới: `packages/ui/test/trinh-soan-lien-ket.dom.tsx`, `packages/ui/src/components/trinh-soan-lien-ket-trang.tsx`, `_acceptance/chen-lien-ket-khong-lac/**`; thêm hai dòng `clk_*` vào `config.yaml` (đã duyệt P4-6).
- Không chú thích; bài cũ không đổi một byte.

### Task 1: Lớp chặn + bài mới (independent: false)
- `onCloseAutoFocus`: `if (editor && !editor.isDestroyed) editor.commands.focus();`
- Cuối tệp DOM: `describe("chen-lien-ket-go")` — lắng `error` của `window`, đẩy chuỗi, mở hộp, khẳng định ô tìm có mặt, gỡ, chờ `setTimeout(0)`, `toEqual([])`.
- Verify: cả tệp 6 pass 0 fail, 0 dòng `commandManager`. Phục vụ E1.

### Task 2: Răng `pha-chot.mjs` (independent: false)
- Bản sao 4 tệp ở `.acceptance-runs/<slug>/sao-*` với `node_modules` riêng (mục của gói trỏ tuyệt đối + `@crm/ui` → gói); `xanh` thành phần HEAD, `do` gỡ lớp chặn.
- Khối bài mới cắt từ dòng `error: expect(received).toEqual(expected)` tới `(fail)` của nó (bun không in `(pass)` khi không TTY).
- Verify: `xanh` 0, `do` 0 (1 trong khối, 8 ngoài khối); phá-thử mốc lớp chặn vắng → 2. Phục vụ E2, E3.
