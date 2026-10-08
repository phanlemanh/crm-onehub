---
schema_version: 1
feature: "Trang soạn OKR không lạc: không nhảy tab khi mở hay đóng bản ghi bên cạnh, hoàn tác cả nhóm thất bại thì báo lỗi trên biên nhận nhóm, lần Kara nộp bị từ chối không thành mốc và không làm gốc so sánh"
slug: soan-okr-khong-lac
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-10-08
design_doc: docs/superpowers/specs/2026-10-08-soan-okr-khong-lac-design.md
---

# Acceptance Contract: soan-okr-khong-lac

## Context

Hàng K2b của dãy P1, đợt `sau-14-10`. Gom ba mục anh chọn «mở hợp đồng mới» ở Cổng 2 của K2
`soan-okr-trang-rieng` lúc 2026-10-08T01:24:38Z (Ngoài-3, 4, 5); luật 26 coi như đã ký Cổng Đáng `build`. Trang soạn
OKR đã gộp ở #312.

Source input: `opportunity.md` · design doc · `review-findings.md` của `soan-okr-trang-rieng` (Ngoài-3/4/5) ·
`docs/ai-ux.md` §5–7 · `docs/chat-ui.md`.

## Criteria

- AC-1: Given trang soạn ở khổ hẹp (dưới 1024 px), đang ở tab Bản nháp với bộ lọc «chỉ dòng chờ» bật, When mở một bản ghi bên cạnh bằng `useRecordStack().open` (đường mà ô tìm nhanh và mọi liên kết bản ghi dùng), chọn tab ngăn «Hoạt động», rồi đóng ngăn bằng `close` của chính hook đó, Then sau cả hai bước trang soạn vẫn ở tab Bản nháp và bộ lọc vẫn bật; trong lúc ngăn mở, tham số tab của ngăn vẫn là «Hoạt động».
- AC-2: Given `apps/app/lib/search-param-keys.ts` và thư mục `soan/`, When chạy ca kiểm khoá URL, Then trang soạn đọc hai khoá đã đăng ký `SEARCH_PARAM.okr.tabSoan` và `SEARCH_PARAM.okr.locSoan`, không khoá nào trùng khoá của tính năng khác (ca «gives every feature its own url key» xanh), và `soan/` không còn khoá URL khai tại chỗ (`thamSo` vắng khỏi `cau-hinh.ts`).
- AC-3: Given biên nhận nhóm «Đã thêm Mục tiêu N và k KR», When bấm Hoàn tác và máy chủ từ chối với CONFLICT khi cuộc còn đang soạn, một lần khác khi cuộc đã đóng, và một lần khác vì mất mạng, Then ngay dưới biên nhận nhóm hiện đúng câu lỗi của lỗi từng dòng cho mỗi ca («dòng cũ», «cuộc đã đóng», «mất mạng»); biên nhận vẫn còn và Hoàn tác bấm lại được; lần bấm sau thành công thì câu lỗi biến mất và nhóm về chờ.
- AC-4: Given `KaraProposalGroup` trong `packages/ui`, When màn gọi truyền `batchDecided.error`, Then câu lỗi vẽ bằng `FieldError` mang `data-loi="nhom"` bên trong `[data-slot=kara-proposal-group]`, ngay sau biên nhận nhóm; `soan/the-nhap.tsx` không dựng hộp lỗi riêng và không thêm `className` cho khối đó.
- AC-5: Given hội thoại có ba lần Kara gọi `nop_ban_nhap`: lần 1 kết quả `da-ghi`, lần 2 `tu-choi` với lý do và bản nháp bằng lần 1 cộng hai KR, lần 3 `da-ghi` và khác lần 1 đúng một KR thêm, When dựng hội thoại, Then chỉ có hai mốc (lần 1 và lần 3); mốc lần 3 đếm «thêm 1 KR» so với lần 1; ở chỗ lần 2 có một dòng hệ thống «Kara nộp bản nháp chưa được — <lý do>»; dòng phụ «n dòng · sửa lúc HH:MM» của bản nháp theo giờ lần 3.
- AC-6: Given một lần gọi `nop_ban_nhap` lỗi công cụ (không có kết quả) và một lần có kết quả không đọc được theo schema, When dựng hội thoại, Then cả hai không thành mốc và không làm gốc so sánh cho lần nộp sau; lần lỗi hiện dòng hệ thống «Kara nộp bản nháp chưa được», lần không đọc được hiện «Kara nộp bản nháp nhưng không đọc được kết quả».
- AC-7: Given `packages/validation/src/okr-cuoc-soan.ts` và `apps/agent-okr/agent/lib/nop-ban-nhap.ts`, When đọc nguồn của tập kết quả nộp, Then hai giá trị `da-ghi`, `tu-choi` khai đúng một chỗ (`KET_QUA_NOP` trong `packages/validation`); `ketQuaNop` của agent dùng `KET_QUA_NOP`; app đọc kết quả nộp qua `docKetQuaNop` của `packages/validation`, không qua `Record<string, unknown>`.
- AC-8: Given năm bản sao phá vật thật — (a) khoá tab của trang soạn đổi về `"tab"`, (b) `NhomMucTieu` bỏ truyền lỗi cho biên nhận nhóm, (c) `mocTuTranscript` bỏ xét kết quả nộp, (d) `KaraProposalGroup` bỏ vẽ `batchDecided.error`, (e) `mocTuTranscript` lọc khi dựng mốc nhưng lấy gốc so sánh từ lời gọi nộp liền trước bất kể kết quả, When chạy bài đo của AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 trên từng bản sao, Then mỗi bản sao làm đúng bài đo của vế nó phá đỏ với thông điệp ghim, và tệp sản phẩm sau lượt đo giống hệt trước lượt.
- AC-9: Given diff của nhánh so với điểm rẽ khỏi `onehub`, When liệt tệp đổi, Then mọi tệp nằm trong ranh giới hàng K2b hoặc trong danh sách `cham-tep` đã duyệt; trong `apps/agent-okr/agent/lib/nop-ban-nhap.ts`, dòng bỏ chỉ là dòng `ketQua` cũ và dòng thêm chỉ là dòng `ketQua` mới cùng dòng import `KET_QUA_NOP`.
- AC-10: Given phiên đo riêng của cây (`do:man`), agent-okr chạy thật với mô hình giả có kịch bản viết trước (nộp hợp lệ · nộp vi phạm luật bản nháp · nộp hợp lệ thêm một KR), When ở khổ 390 và 1440 đi qua ba trạng thái — mở rồi đóng một bản ghi bên cạnh ở tab Bản nháp, hoàn tác cả nhóm khi máy chủ trả 409, và cuộc có lần nộp bị từ chối, Then màn trình duyệt khớp bảng trạng thái của design doc: tab Bản nháp còn chọn sau khi đóng ngăn; câu lỗi dưới biên nhận nhóm; hội thoại có hai mốc và một dòng hệ thống ở chỗ lần nộp bị từ chối; ảnh mỗi trạng thái ở cả hai khổ.

## Coverage

Bỏ quét không gian AC (entry `descope` «bỏ coverage-scan» trong sổ quyết định). Ba lỗi đã có kịch bản fail cụ thể từ
phản biện S4 của K2; mỗi lỗi một nhóm AC: Ngoài-3 (AC-1, AC-2), Ngoài-4 (AC-3, AC-4), Ngoài-5 (AC-5, AC-6, AC-7).
AC-8 bảo đảm chiều đỏ trên vật thật, AC-9 ranh giới, AC-10 đi trọn đường thật agent → lưu → tải → màn (gap-probe P0).

## Đường đo

Ngưỡng ở `opportunity.md` (đang `[đề xuất]`) đo ở lái-thử người-lạ trước R1:

- «0 lần vấp nhảy tab / tưởng đã hoàn tác / mốc không có thật»: nhật ký vấp của lái-thử. AC-1, AC-3, AC-5, AC-10 bảo đảm. Kịch bản lái-thử phải chủ động gây đủ ba điều kiện (mở/đóng bản ghi ở 390 px, tắt mạng trước khi hoàn tác nhóm, một cuộc mà lần nộp kế bị từ chối); loại nào không gây được thì không tính vào ngưỡng.

## Out of scope

- Ngoài-1, 2, 6, 7 của K2 — anh đã chọn ghi Known limits.
- Tương thích cho link cũ mang `tab=`/`loc=` của trang soạn: hai khoá chỉ giữ trạng thái tạm của màn.
- Đổi lời Kara hay cách agent nộp lại sau lần bị từ chối (`apps/agent-okr/agent/instructions.md`).

## Notes

- Tệp ngoài ranh giới đã xin `cham-tep` (`yeu-cau/P1-26.json`): `_acceptance/config.yaml` (thêm khoá `k2b_*`),
  `apps/agent-okr/agent/lib/nop-ban-nhap.ts` (một dòng + một import), design doc, kế hoạch, bản đồ sản phẩm.
- Chiều đỏ của AC-8 sửa tạm tệp sản phẩm trong cây rồi trả lại trong `finally` (khuôn `dot-bien-lib.mjs` của kho);
  lượt đo này phải chạy tuần tự, không song song với lượt S4 khác.
