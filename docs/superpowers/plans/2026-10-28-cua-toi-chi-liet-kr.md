# Kế hoạch thi công SV1 `cua-toi-chi-liet-kr`

Hợp đồng: `_acceptance/cua-toi-chi-liet-kr/contract.md` (duyệt 28/10 07:18Z, Hỏi-1 Của tôi, Hỏi-2 mở trong bộ).
Thiết kế: `docs/superpowers/specs/2026-10-28-cua-toi-chi-liet-kr-design.md`. Phạm vi phiên: hết S3, không S4.

Mọi task tuần tự trong phiên chính (`independent: false`): chúng chia nhau `capNhatTuanOutput`, `duongCapNhatKr` và
tệp DOM chung, nên tách worktree không lợi gì.

| # | Task | Tệp | Phục vụ | Kiểm từng task |
|---|---|---|---|---|
| T1 | API: `capNhatTuan` trả `donOkr`, `cycleId`; thủ tục `okr.viTriKr` | `apps/api/src/okr/vi-tri-kr.ts` (mới), `okr-cap-nhat.service.ts`, `okr.contracts.ts`, `okr.router.ts`; `apps/api/test/ctlk-vi-tri-kr.spec.ts`, `ctlk-vong-khep.spec.ts` | E5, E15 | `cd apps/api && bun run test -- ctlk-` |
| T2 | `duongCapNhatKr(krIds)` | `packages/validation/src/okr-cap-nhat.ts`; `packages/validation/test/ctlk-duong-cap-nhat-kr.spec.ts` | E6 | `cd packages/validation && bun test ctlk-` |
| T3 | Agent: đường tin nhắc, nhãn Slack theo số KR | `apps/agent/agent/lib/nhac-ke-hoach.ts`, `tin-nhac.ts`; `apps/agent/test/ctlk-duong-nhac.spec.ts`, `ctlk-nhac-dong.integration.spec.ts` | E6, E7 | `cd apps/agent && bun test ctlk-` |
| T4 | App: `dichKrTrongBo` + trang giải `/okr/kr/[keyResultId]` | `apps/app/lib/okr-duong-kr.ts`, `apps/app/app/(app)/[slug]/okr/kr/[keyResultId]/page.tsx`; `apps/app/test/ctlk-dich-kr.spec.ts` | E4 | `cd apps/app && bun test ctlk-dich-kr` |
| T5 | App: phần «Cần cập nhật» thành danh sách; bỏ Đang theo dõi; AC-8; việc OKR | `phan-can-cap-nhat.tsx`, `cua-toi.tsx`, `phan-kr-phu-trach.tsx`, `khoi-kr-cua-toi.tsx`, `viec-cua-toi.tsx`, `apps/app/lib/messages/okr.ts` (chỉ thêm khoá); `apps/app/test/cua-toi-chi-liet-kr.dom.tsx` | E1, E2, E3, E8, E10, E11, E12 | `cd apps/app && bun run test:dom -- cua-toi-chi-liet-kr` |
| T6 | Răng: `hai-chieu.mjs`, `mot-duong.mjs`, `thay-the.mjs`, `man.mjs`; khoá `executors.*.ctlk_*` (chỉ thêm dòng) | `_acceptance/cua-toi-chi-liet-kr/rang/*`, `_acceptance/config.yaml` | E1–E15 | mỗi răng: đối chứng dương xanh + mỗi đột biến đỏ với thông điệp ghim |
| T7 | Bài kiểm ngoài hồ sơ, yêu cầu `cham-tep` cho bài kiểm và ô của hồ sơ đã ký | `apps/app/test/viec-okr-cua-toi.dom.tsx`, `messages-guard.spec.ts`; yêu cầu cho 27 ô + tệp kiểm của chúng + bản chụp + xoá khoá chữ | AC-10, E13 | `bun run test` từ gốc |
| T8 | Kiểm cuối | — | — | `bun run lint`, `check-types`, `lint:slop`, `test`, `build` |

## Lựa chọn ở S2

- «KR đã lưu trữ» = KR thuộc chu kỳ đã ẩn (`OkrCycle.anLuc` khác null, ngược của `KY_CON_HIEN`). Khu OKR không có cột
  lưu trữ riêng; mục tiêu `da-bo` vẫn xem được trong bộ qua nút «Đã bỏ» nên không tính là lưu trữ.
- Khoá đơn vị dựng ở API bằng `khoaDonOkr` của `@crm/validation/okr-tham-so` từ `level` + id đơn vị của mục tiêu, để
  app và agent không phải biết bảng cấp.
