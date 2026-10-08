# zalo-va-cach-ly Implementation Plan

**Goal:** Test của apps/agent thôi nhập apps/app; hai bài «câu chào» xuyên ứng dụng + hàm `nhanDieuHuongKhac` dời nguyên văn sang apps/app/test.
**Spec:** `_acceptance/zalo-va-cach-ly/design.md` · `contract.md` · `evals.yaml`

## Global Constraints
- Ranh giới: `apps/agent/test/zalo-va.integration.spec.ts`, `_acceptance/zalo-va-cach-ly/**`, `_acceptance/soan-okr-cung-tro-ly/**`; đã duyệt thêm `apps/app/test/zalo-cau-chao-nhan.spec.ts`, dòng `r1g_cau_chao` + khoá `zvc_*` của `config.yaml`, và ghim lại `_acceptance/zalo-va/**`.
- Không chú thích; tệp app thuần (không CSDL, không eve).

### Task 1: Dời bài (independent: false)
- Tạo `apps/app/test/zalo-cau-chao-nhan.spec.ts`: import `describe, expect, test` từ `bun:test`, `ZALO` từ `../../agent/agent/lib/zalo-config`, hai bộ chữ từ `../lib/messages/...`; `nhanDieuHuongKhac` + `describe("cau-chao")` chứa hai bài, thân chép nguyên văn từ bản ghim.
- Spec agent: bỏ hai dòng import `../../app/...`, hàm `nhanDieuHuongKhac`, hai bài.
- `config.yaml`: `r1g_cau_chao` chạy thêm `cd apps/app && bun test ./test/zalo-cau-chao-nhan.spec.ts`; thêm `zvc_agent_ca_tep`.
- Verify: `node scripts/luat-kho/do-cay.mjs --du-luat` → 0; `r1g_cau_chao` → 0, «2 pass» ×2; `zvc_agent_ca_tep` → 0; `cd apps/app && bun run check-types`; biome.
- Phục vụ E1, E2, E3.

### Task 2: Răng nguyên văn (independent: false — so tệp của Task 1)
- `rang/nguyen-van.mjs xanh|do` theo E4/E5; thêm `zvc_nguyen_van_xanh`, `zvc_nguyen_van_do`.
- Verify: `xanh` → 0; `do` → 0 (ba đột biến bị bắt); phá-thử: bản chép tạm `.pha-*.mjs` với đột biến không áp được → 2.
- Phục vụ E4, E5.
