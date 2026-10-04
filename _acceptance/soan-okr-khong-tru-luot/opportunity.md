---
schema_version: 1
slug: soan-okr-khong-tru-luot
feature: «Kara sập giữa lượt thì không mất lượt soạn; «Thử lại» nói rõ vì sao không chạy»
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build
decided_by: phanlemanh@gmail.com
decided_at: 2026-10-04T06:18:47Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: R1h
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng R1h của «OKR» (`docs/plan/lo-trinh-okr.json`). Chủ kho chốt 04/10: phòng ban dùng Soạn OKR cho quý 4.

Người gặp: trưởng bộ phận/phòng ban mở một cuộc soạn OKR với Kara.

- **#7 — mất lượt khi Kara không tới được.** Cửa `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts:90-100` gọi `okr.soanTangLuot` (tăng `soLuot` của cuộc) TRƯỚC khi chuyển tiếp lên agent-okr (`route.ts:131-142`). Agent trả 401, 5xx, hay `fetch` ném lỗi thì lượt vẫn đã bị trừ. Hệ quả kép: `soLuot` chạm trần `luotMoiCuoc` sớm hơn, và một cuộc mà lượt đầu đã hỏng vẫn tính vào trần cuộc của kỳ (`demCuocTrongKy` đếm cuộc có `soLuot > 0`, `packages/db/src/okr-cuoc-soan.ts:171-178`).
- **#8 — «Thử lại» im lặng.** `dung-cuoc-soan.ts:228-240`: nhánh gửi lại nuốt lỗi (`guiThang` bắt lỗi rồi `return`), nhánh mở lại cuộc bỏ qua `kq.ok === false` (`undefined`) và không xử lý lỗi mạng. Người bấm không thấy gì đổi, không biết vì sao.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: khi lượt soạn không tới được Kara, người dùng có giữ nguyên lượt và cuộc của mình không, và «Thử lại» không chạy được thì có nói vì sao không?
- Kết quả nào là SỐNG: mọi ca hỏng phía agent (401, 5xx, không nối được) để `soLuot` của cuộc trước bằng sau, và cuộc chưa có lượt nào tới Kara không bị tính vào trần cuộc của kỳ. Trần vẫn chặn được: agent trả lời thành công thì lượt bị tính như cũ. «Thử lại» không chạy được thì màn hiện một câu lý do bằng tiếng người, ở mọi lý do trả về.
- Kết quả nào là CHẾT: còn một ca hỏng phía agent vẫn trừ lượt; hoặc trần bị thủng (gửi được quá `luotMoiCuoc` lượt thành công); hoặc «Thử lại» vẫn có một đường im lặng.
- Timebox: một vòng máy (ước một ngày), PR trước 11/10. Phiên nghiệm thu: phòng ban soạn OKR quý 4 trên production, chủ kho hỏi lại có ai mất lượt hay bấm «Thử lại» mà không biết vì sao không.
