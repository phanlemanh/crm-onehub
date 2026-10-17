# Vì sao Tác nhân chậm trên GLM 5.3 — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (phiên thợ làm tuần tự). Steps dùng `- [ ]`.

**Goal:** Bảng 12 lượt Tác nhân trên bốn biến thể với số của phiên con `agent_builder`, một phép dò mức suy luận ở
Gateway, và kết luận truy được về số.

**Architecture:** Ba script trong `rang/`: `do-tac-nhan.ts` (chạy lượt, kết xuất `aiChiPhi`), `do-suy-luan.ts` (dò
Gateway), `so-tac-nhan.ts` (tính lại, in `bang.md`, chiều đỏ, `--pham-vi`). Không sửa mã sản phẩm; biến thể suy luận
thấp đổi tạm `subagents/agent_builder/agent.ts` rồi trả lại.

**Tech Stack:** Bun, `pg` qua `createRequire`, `eve eval`, AI Gateway HTTP.

**Spec:** `design.md` · `contract.md` · `evals.yaml` (cùng thư mục).

## Global Constraints

- Không chú thích trong code. Chỉ ghi dưới `_acceptance/tac-nhan-glm-5-3-cham/`; `config.yaml` chỉ thêm dòng.
- Gọi model chỉ dưới khoá s4; chạy một lượt duy nhất ở task cuối, trên cây đã commit.

## Review Focus

- Bản sửa tạm `agent.ts` phải được trả lại kể cả khi lượt hỏng giữa chừng (trap EXIT).
- Kho đo mỗi lượt phải xoá kể cả khi eval hỏng.
- Lượt quá trần: phiên con có thể còn ghi `aiChiPhi` sau giờ kết thúc — bộ so phải bắt.

---

### Task 1: Bộ so (E1, E2, E3, E5) — independent: true
**Files:** `rang/so-tac-nhan.ts`
- [ ] Khuôn Zod cho `tac-nhan.jsonl`, `aichiphi-*.json`, `ke-hoach.json`, `do-suy-luan.json`; tính lại, in `bang.md`, băm.
- [ ] Chiều đỏ trên bản sao (sau khi có bằng chứng); `--pham-vi`. Commit.

### Task 2: Trình đo và phép dò — independent: true
**Files:** `rang/do-tac-nhan.ts`, `rang/do-suy-luan.ts`
- [ ] `do-tac-nhan.ts`: vòng xen kẽ 4 biến thể × 3 lượt; mỗi lượt `taoKho` → `writeAgentModel` → `eve eval agent-builder`
  → đọc phiên gốc từ nhật ký → kết xuất `aiChiPhi` (hàng của phiên gốc và phiên con) → `xoaKho`; ghi băm `agent.ts`.
- [ ] `do-suy-luan.ts`: hai lời gọi `zai/glm-5.3` low/high cùng một câu, ghi `usage`. Commit.

### Task 3: Đo một lượt và kết luận — independent: false (cuối)
- [ ] Dưới khoá s4: `do-suy-luan.ts`, rồi `do-tac-nhan.ts`; `so-tac-nhan.ts --ghi-bam`; `so-tac-nhan.ts` xanh.
- [ ] Viết `evidence/ket-luan.md` từ `bang.md` và `do-suy-luan.json`; commit; contract `status: implemented`.
