# Tác nhân vá (E5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Màn tác nhân đọc được ở 375 px, mọi chữ máy của khu tác nhân thành tiếng Việt, và câu hỏi của bộ dựng ở lượt sau không còn bị bỏ.

**Architecture:** Chữ trạng thái là bảng trong `apps/app/lib/messages/agent-builder-*.ts`, màn chỉ tra bảng; nghĩa tone theo `toneTheoNghia`. Bảng thoả thuận của kết quả lượt chạy theo luật «Danh sách»: `SimpleTable` từ `md`, `Item` dưới `md`. Sửa câu hỏi bị bỏ nằm trọn ở `apps/agent/agent/lib/builder-input.ts` (so toạ độ chỉ trong cùng `turnId`, log mọi đường bỏ), chứng bằng payload sinh từ eve thật trong `apps/agent/test/eve-tran`.

**Tech Stack:** Next.js (apps/app), bun test + jsdom (`packages/ui/test/setup-dom.ts`), eve (apps/agent), Prisma, Playwright qua `mot-luot.sh` cho phép đo màn.

**Spec:** `docs/superpowers/specs/2026-10-14-tac-nhan-va-design.md`; hợp đồng `_acceptance/tac-nhan-va/contract.md`, phép đo `_acceptance/tac-nhan-va/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Chữ người nhập (`agent.name`, tên kênh, tên thoả thuận) mang `translate="no"`.
- Chỉ dùng thành phần của `packages/ui`; không `className` đổi màu, góc, khoảng cách của thành phần `@crm/ui`.
- Hằng số chỉnh được nằm trong file cấu hình của khu, không đặt cạnh chỗ dùng.
- Một `.env` ở gốc; vòng này không thêm biến.
- Trạng thái thô không hiện ra màn (`docs/vong-doi.md` mục «Bộ chữ»).

## Review Focus

- Tác nhân có trạng thái `DRAFT`/`DEPLOYING` lọt vào màn tác nhân (màn chi tiết của người tạo) — phải có chữ, không rơi về chữ thô.
- Sự kiện lượt chạy loại mới do eve thêm sau này — rơi về «Sự kiện khác», không in tên máy.
- Thoả thuận không có số tiền hay không có giai đoạn khớp — mục danh sách dưới `md` vẫn đủ bốn ô (ô trống là `EmptyCellValue`).
- Hai câu hỏi cùng `turnId` cùng toạ độ (eve chạy lại một bước) — không ghi đè, không log lỗi.
- Payload `input.requested` không có câu `question`/`session-limit` (chỉ `tool-approval`) — giữ hành vi bỏ qua hiện có, không log lỗi.

---

### Task 1: Bảng chữ trạng thái và chữ lượt chạy (AC-1, AC-2, AC-3)

**Files:**
- Modify: `apps/app/lib/messages/agent-builder-tac-nhan.ts` (khoá `trangThaiTacNhan` hai thứ tiếng, kèm nghĩa)
- Modify: `apps/app/lib/messages/agent-builder-tro-chuyen.ts` (`trangThai.PLANNED`, `suKien.*`, `suKienKhac`, `luot.lichTuDong`, `luot.macDinh`)
- Modify: `apps/app/lib/messages/agent-builder-ket-qua.ts` (`thoaThuan.trangThai.{open,won,lost}`)
- Modify: `apps/app/components/agent-builder/team-agents-index.tsx:49`
- Modify: `apps/app/components/agent-builder/agent-history.tsx:263,267,429-437,460-462`
- Modify: `apps/app/components/agent-builder/deal-list-result.tsx:155-163`
- Test: `apps/app/test/tac-nhan-va.dom.tsx` (describe `chu-tac-nhan`, `chu-luot`, `chu-thoa-thuan`)

Verify: `bun run` lệnh `tnv_chu_dom` của `_acceptance/config.yaml`. Phục vụ E1, E2, E3. independent: yes.

- [ ] Viết ba describe theo đúng `expected` của E1–E3 (ma trận viết trước, quan hệ với bảng chữ, đối chứng dương); chạy, thấy đỏ.
- [ ] Thêm bảng chữ; `TeamAgentsIndex` dùng `StatusIndicator tone={toneTheoNghia(nghia)}` + chữ; `nhanTrangThai` tra bảng, giá trị lạ trả chữ chung; `eventLabel` tra `suKien`, lạ trả `suKienKhac`; hai ô mặc định lấy chữ từ bảng; `tableTitle` tra `thoaThuan.trangThai`.
- [ ] Chạy lại tới xanh; chạy chiều đỏ bằng bản sao như `expected` ghi.
- [ ] Commit `fix(tac-nhan-va): trạng thái tác nhân và lượt chạy nói tiếng Việt`.

### Task 2: Điện thoại — danh sách thoả thuận dưới md, thẻ năng lực (AC-4)

**Files:**
- Modify: `apps/app/components/agent-builder/deal-list-result.tsx` (bảng giữ `md:`; dưới `md` danh sách `Item variant="outline"`: tên, giai đoạn, số tiền, trạng thái)
- Modify: `apps/app/components/agent-builder/agent-capabilities.tsx:186,233` (bỏ `h-13`, chip `truncate` + `title`)
- Create: `_acceptance/tac-nhan-va/rang/man.mjs`, `_acceptance/tac-nhan-va/rang/gieo.mjs`

Verify: lệnh `tnv_man`. Phục vụ E4. independent: no (gieo dùng payload của Task 3).

- [ ] Viết `gieo.mjs`: đường ghi thật trong phiên đo — `saveBuilderDraft` (apps/agent) → `agents.deploy` → `agentRuns.runNow` → hàm kết lượt của `run-runtime.ts` với kết quả `DealListResult` năm dòng (parse bằng `parseDealListResult` trước khi ghi); kênh tên 60 ký tự.
- [ ] Viết `man.mjs` theo `steps` của E4 (cảnh cây, mỗi khổ một tiến trình con, đo `scrollWidth <= clientWidth`, mép chip, đếm mục, chụp 8 ảnh); chạy trên cây trước sửa, thấy «khong dat» ở ngăn lượt chạy.
- [ ] Sửa hai thành phần; chạy lại tới «dat» cả bốn màn.
- [ ] Commit `fix(tac-nhan-va): màn tác nhân đọc được ở 375 px`.

### Task 3: Câu hỏi lượt sau không bị bỏ (AC-5, AC-6, AC-7)

**Files:**
- Modify: `apps/agent/agent/lib/builder-input.ts:39-130`
- Create: `apps/agent/test/eve-tran/evals/hai-luot-hoi/*.eval.ts`; Modify: `apps/agent/test/eve-tran/agent/kich-ban.ts` (kịch bản hai lượt hỏi)
- Test: `apps/agent/test/tac-nhan-va.integration.spec.ts` (describe `cau-hoi-luot-sau`, `cau-hoi-doi-chung`, `cau-hoi-bo-co-log`)

Verify: lệnh `tnv_cau_hoi`. Phục vụ E5, E6, E7. independent: yes.

- [ ] Ca eve `hai-luot-hoi` ghi mọi payload `input.requested` gốc nhận được vào `TNV_HAI_LUOT_RA`; chạy, đọc tệp, xác nhận hai `turnId` khác và toạ độ câu sau không lớn hơn.
- [ ] Viết ba describe theo `expected` E5–E7; chạy, thấy E5 đỏ trên mã cũ.
- [ ] `supersedes(event, current)`: khác `turnId` → `true`; cùng `turnId` → so toạ độ như cũ. Mỗi `return false` không phải phát lại → `console.error("[agent] builder input <id> dropped: <lý do>")`.
- [ ] Chạy tới xanh; chiều đỏ bằng bản sao.
- [ ] Commit `fix(tac-nhan-va): câu hỏi bộ dựng ở lượt sau không còn bị bỏ`.

### Task 4: Dòng lỗi gửi hỏng nói tiếng Việt (AC-8)

**Files:**
- Modify: `apps/app/components/agent-builder/agent-builder-chat.tsx:903-906` (và lời gọi ở `:445`, `:737`)
- Modify: `apps/app/lib/messages/agent-builder-tro-chuyen.ts` (`man.loiGui.DELIVERY_FAILED`)
- Test: `apps/app/test/tac-nhan-va.dom.tsx` (describe `gui-hong`)

Verify: lệnh `tnv_loi_dom`. Phục vụ E8. independent: yes.

- [ ] Test theo `expected` E8; đỏ.
- [ ] Truyền `errorCode` thay `errorMessage`; chữ tra bảng theo mã, lạ về `guiHong`.
- [ ] Xanh; commit `fix(tac-nhan-va): dòng lỗi gửi hỏng theo mã`.

### Task 5: Phép đo xuyên lớp và không hồi quy (AC-9, AC-10)

**Files:**
- Create: `_acceptance/tac-nhan-va/rang/khu-hoi.mjs`, `_acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs`

Verify: `tnv_khu_hoi`, `tnv_hoi_quy`. Phục vụ E9, E10. independent: no (cần Task 3).

- [ ] `khu-hoi.mjs` theo `expected` E9; chạy trên cây trước Task 3 (worktree tạm ở `966eeb78e`) thấy «khong dat», trên cây sau thấy «dat».
- [ ] `khong-xoa-expect.mjs` (`--moc`, `--tu-thu`) theo `expected` E10.
- [ ] Chạy năm lệnh của kho (`test`, `check-types`, `lint`, `lint:slop`, `build`).
- [ ] Commit `test(tac-nhan-va): thước xuyên lớp và không hồi quy`.
