# Kara không ghi đè giá trị trường tự tạo — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `set_field_value` từ chối ghi lên ô trường tự tạo đã có giá trị; chỉ phiên có người thay được, và phải gọi kèm `replace: true`.

**Architecture:** `writeField` luôn khoá ô (`lockIdempotencyKey`) và đọc giá trị hiện có trong cùng `transaction`, rồi quyết theo `unattended` và `replace`. Công cụ tính `unattended = isAutomated(ctx.session)`. Không đổi lược đồ.

**Tech Stack:** Bun test, Prisma, eve tools, zod.

**Spec:** `docs/superpowers/specs/2026-10-20-kara-khong-ghi-de-truong-design.md` · hợp đồng `_acceptance/kara-khong-ghi-de-truong/contract.md` · evals `_acceptance/kara-khong-ghi-de-truong/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không chạm `packages/db`, `apps/api`, giao diện.
- Thông điệp ghim trong `evals.yaml` là chuỗi `throw new Error(...)` đúng nguyên văn.
- Câu điều kiện ghim: `only if the rep asked you to in this conversation`; câu luật trong mô tả: `already has a value`.

## Review Focus

- Ghi lại đúng giá trị đang có lên ô có giá trị → bị từ chối như mọi lần thay (đã khai Later; Kara đọc lý do là thấy trùng).
- Xoá ô trống (`null`) → `written: true`, không tạo hàng — AC-5 ghim.
- Trường `agentFilled: false` với `replace: true` → vẫn chặn, kiểm `agentFilled` đứng trước kiểm ô — AC-7 ghim.
- Hai lượt nền cùng điền một ô trống → khoá phải bao cả lần đọc lẫn lần ghi — AC-6 ghim.
- Phiên có người dựng qua `thanhVienPrincipal` thật, không dựng tay — E1 khẳng định `isAutomated` bằng false.

---

### Task 1: Bài kiểm đỏ

**Files:**
- Create: `apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts`

**Interfaces:**
- Consumes: `setFieldValue` (default của `agent/tools/set_field_value.ts`), `taskAuth` (`agent/lib/dispatch.ts`), `isAutomated` (`agent/lib/approval.ts`), `thanhVienPrincipal` (`agent/lib/thanh-vien-principal.ts`), `trongNguCanhEve` (`test/support/eve-ngu-canh.ts`), `writeValues` (`@crm/db/fields`).
- Produces: tám nhóm test tên `kgd-co-nguoi-dat`, `kgd-co-nguoi-xoa`, `kgd-co-nguoi-thay`, `kgd-nen`, `kgd-o-trong`, `kgd-dong-thoi`, `kgd-chi-tay`, `kgd-mo-ta` — khớp `-t` của `executors.test.kgd_*`.

- [ ] Viết tám test theo đúng `expected` của E1–E8b; mỗi khẳng định ném đúng thông điệp ghim. Fixture: liên hệ, trường F (TEXT, agentFilled) và M (agentFilled false) qua `db`, giá trị người gõ qua `writeValues` trong `db.$transaction`, thành viên thử như `chat-an-toan-truong.integration.spec.ts`. Dọn theo tiền tố trong `afterAll`.
- [ ] Chạy `bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts"`. Kỳ vọng ĐỎ ở `kgd-co-nguoi-dat` (`kgd: co nguoi ghi de`), `kgd-co-nguoi-xoa`, `kgd-nen` (`kgd: nen ghi de profile khong`), `kgd-dong-thoi` (`kgd: dong thoi 2`), `kgd-mo-ta`; xanh ở `kgd-co-nguoi-thay`, `kgd-o-trong`, `kgd-chi-tay`.
- [ ] Commit riêng bài kiểm (chiều đỏ trong lịch sử).

### Task 2: Chặn ghi đè

**Files:**
- Modify: `apps/agent/agent/lib/fields.ts` (`writeField`)
- Modify: `apps/agent/agent/tools/set_field_value.ts`
- Modify: `docs/agent.md` (mục mới dưới «Evidence, not confidence»)

**Interfaces:**
- Produces: `writeField(input: { entity; recordId; key; value: unknown; replace?: boolean; unattended: boolean }): Promise<WriteResult>`.

- [ ] `writeField`: giữ kiểm định nghĩa và `agentFilled` đứng trước; bỏ nhánh `isBackfill`; mọi lần ghi đều khoá `field-value:<fieldId>:<recordId>` và đọc ô trong `transaction`. Ô có giá trị: `unattended` → từ chối (`... already has a value on this record. A background run never replaces one — leave it as is.`); có người, không `replace` → từ chối, câu nêu giá trị hiện có, `only if the rep asked you to in this conversation`, và `replace: true`. Ô trống hoặc có người + `replace` → ghi như cũ.
- [ ] Công cụ: thêm `replace: z.boolean().optional()` với mô tả chứa câu điều kiện; `description` thêm câu `already has a value`; truyền `unattended: isAutomated(ctx.session)`.
- [ ] `docs/agent.md`: một mục ngắn nói luật (phiên nền không thay, phiên có người chỉ thay với `replace: true`, nhận phiên nền bằng `isAutomated`).
- [ ] Chạy lại tệp bài kiểm: xanh cả tám nhóm. Đột biến tay ghi sổ S3: bỏ nhánh `replace` → `kgd: thay bi chan`; từ chối mọi lần → `kgd: o trong co nguoi khong ghi`; kiểm `replace` trước `agentFilled` → `kgd: chi tay ghi duoc`.
- [ ] Commit.

### Task 3: Năm lệnh

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` từ gốc — đều thoát 0.
