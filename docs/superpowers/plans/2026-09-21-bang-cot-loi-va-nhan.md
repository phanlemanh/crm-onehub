# Kế hoạch: bảng cột báo lỗi và giữ nhãn đúng

Hợp đồng: `_acceptance/bang-cot-loi-va-nhan/contract.md` (T2, 6 AC).

## T1 — màn danh mục (independent: false) · phục vụ E1–E6

- Files: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`,
  `apps/app/lib/messages/onboarding.ts`, `apps/app/test/bang-cot-loi-va-nhan.dom.tsx`.
- `bangCot.isError` → khối «Không tải được bảng cột» + «Tải lại» (`bangCot.refetch()`),
  thay cả vùng bảng cột, thanh lọc giữ nguyên.
- Nhãn cột theo `bangCot.data.cachChia`; `bangCot.isPlaceholderData` → vùng bảng cột
  `aria-busy="true"` và mờ.
- Verify: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/bang-cot-loi-va-nhan.dom.tsx`
  + đột biến chiều đỏ từng ca; `bun run check-types`, `lint`, `lint:slop`.
