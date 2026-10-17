# Chờ Tác nhân lâu — kế hoạch

Thiết kế: `docs/superpowers/specs/2026-10-16-cho-tac-nhan-lau-design.md`. Hồ sơ: `_acceptance/cho-tac-nhan-lau/`.
Cổng Phạm vi duyệt 16/10 theo sáu khuyến nghị: nói «rời trang được» từ đầu; không in con số thường mất; luôn ghi thông
báo, mở cuộc trò chuyện thì đánh dấu đã đọc; chỉ chuông trong app; giữ thẻ trong hội thoại; ngưỡng 200 giây với câu
«Đã quá 3 phút. Kara vẫn đang dựng.»

| Task | Files | Verify | Evals | independent |
| --- | --- | --- | --- | --- |
| 1. Thẻ đang dựng (đã dựng ở S1-D) + câu Hỏi-6 | `apps/app/components/agent-builder/the-dang-dung.tsx`, `agent-builder-chat.tsx`, `apps/app/lib/agent-builder-cho.ts`, `apps/app/lib/messages/agent-builder-tro-chuyen.ts` | `bun test apps/app/test/cho-tac-nhan-lau.dom.tsx` | E1, E2, E3, E8 | true |
| 2. Ghi thông báo khi bộ dựng kết thúc | `apps/agent/agent/lib/thong-bao-tac-nhan.ts`, `apps/agent/agent/channels/crm.ts`, `packages/validation/src/thong-bao.ts` (`THONG_BAO.nguon.tacNhan`) | `bun test apps/agent/test/cho-tac-nhan-lau.integration.spec.ts` | E4, E7 | true |
| 3. Dòng chuông ba loại (khuôn đã dựng ở S1-D) | `apps/app/lib/thong-bao/cau.ts`, `apps/app/lib/messages/thong-bao.ts`, `apps/app/test/cho-tac-nhan-lau-chuong.dom.tsx` | test đó | E5 | false (cần 2 để rút mẫu từ bộ ghi) |
| 4. Mở cuộc trò chuyện thì đánh dấu đã đọc | `apps/api/src/conversations/conversations.service.ts` (`markRead`) | `bun test apps/api/test/cho-tac-nhan-lau.spec.ts` | E6 | true |
| 5. Đo màn và cổng thiết kế | `_acceptance/cho-tac-nhan-lau/rang/do-man.mjs`, khoá `ctnl_*` trong `_acceptance/config.yaml` (chỉ thêm) | chạy răng | E9, E10 | false (cuối) |

Đọc trước khi chạm: `docs/agent.md` mục «Team-agent builder and runner» và «Thông báo ghi trước khi chọn kênh»;
`docs/api.md` mục «Intelligence never lives in the API» (API chỉ đánh dấu đã đọc, không quyết gì).
