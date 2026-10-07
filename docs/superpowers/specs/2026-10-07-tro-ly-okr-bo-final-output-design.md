# Trợ lý OKR — bỏ `final_output` khỏi phiên con

Ngày: 2026-10-07 · Hồ sơ: `_acceptance/tro-ly-okr-bo-final-output/` · Hạng: T2

## Vấn đề

Làn ghim lại `repin-20261006T220643Z-23148` của `tro-ly-okr-de-xuat` đỏ ở E22: ca gy-08 đóng
`hong:SUBAGENT_EXECUTION_FAILED`. Chẩn đoán 07/10 (bộ nhớ `gemini-rong-vi-nghi-qua-tran`):

- Mỗi lời gọi rỗng của phiên con `tro_ly_okr` là `finishReason: length`: Gemini 3.8 Flash nghĩ
  ~1.920 token rồi dừng ở trần 2.000, không chữ, không tool call. Trace eve giữ
  `ai.response.finish_reason` ở span `ai.streamText.doStream`.
- Tỉ lệ ở lời gọi đầu: 7/47 (27–30/09) và 17/88 (07/10) — có từ đầu, không phải hồi quy.
  eve gọi lại một lần; lần gọi lại cũng rỗng ~2/15 → việc hỏng ~2% mỗi lượt. Mỗi lần rỗng cộng
  ~15 s, giải thích đuôi p90 ~22 s của E24 round 3.
- Gốc: eve tự thêm tool `final_output` vì phiên con khai `outputSchema: ketQuaTroLy`. Mô tả của
  nó («Call it exactly once, when you are done») đá với chỉ dẫn «your first reply is the
  `nop_de_xuat` call». Đo trên đầu vào khó `wrun_01M49NNHCXFKMD0C1EXR0YRWY9`, trần 2.000:
  chỉ `nop_de_xuat` 0/22 hết trần · `nop_de_xuat`+`nop_tom_tat` 0/8 · `nop_de_xuat`+`final_output`
  5/8 · đủ ba tool 6/13.
- Đòn bẩy khác đã loại: `thinkingLevel: minimal` bị Vertex từ chối; `thinkingBudget` bị bỏ qua;
  trần 8.000 cho tool call nhưng một lần nghĩ 7.695 token, 50 s (vượt lease 30 s).

## Thiết kế

1. **Phiên con không khai khuôn kết quả.** `subagents/tro_ly_okr/agent.ts` bỏ `outputSchema`.
   Phiên con eve luôn chạy chế độ task (`execution/subagent-tool.js`: `mode: "task"`); không có
   khuôn thì `finishTaskTurn` trả chữ cuối làm kết quả và eve không dựng `final_output`.
   Chỉ dẫn góp ý (`instructions.md`) và tóm tắt (`lib/okr/chi-dan-tom-tat.ts`) thôi đòi trả
   `{"trangThai":…}`: nộp xong thì trả lời đúng một chữ `done`.
2. **Tool nộp tự đóng việc với kết cục.** Mã đóng giữ đúng chuỗi hôm nay, nên giao diện, báo cáo
   quản trị và eval đọc `outcome` không đổi.
   - `nop_de_xuat`: ghi xong (kể cả 0 dòng) → `da-nop`; Mục tiêu hay KR không còn →
     `khong-lam-duoc:thieu-du-lieu`; payload hỏng → `khong-lam-duoc:khuon-hong`. Từ chối vì việc
     đã đóng, đã nộp, hay không phải việc góp ý → không đóng gì.
   - `nop_tom_tat`: ghi xong → `da-nop` (`ghiTomTat` luôn ghi một hàng, kể cả khi mọi câu bị
     bỏ, nên nhánh «không có bản» của `ketThucCuaViec` thành mã chết và được gỡ); phòng không còn
     → `khong-lam-duoc:thieu-du-lieu`;
     payload hỏng → `khong-lam-duoc:khuon-hong`. Từ chối vì đã có bản, việc đã đóng hay sai loại
     → không đóng gì.
3. **Hook phiên gốc thành lưới.** `completeTask` đã là «ai ghi trước thắng» (`finishedAt: null`
   trong `where`). Khi `tro_ly_okr` trả kết quả: việc đã đóng → giữ nguyên; việc còn mở và kết
   quả lỗi → `hong:<mã>`; việc còn mở và kết quả không lỗi → `TRO_LY_OKR.ketThuc.khongNop`
   (`hong:khong-nop`). Phiên con nộp rồi mới hỏng ở câu `done` → việc vẫn `da-nop` (hôm nay ca
   này bị tính hỏng).
4. `ketQuaTroLy` trong `@crm/validation/okr-tro-ly` giữ nguyên: màn góp ý đọc giá trị `da-nop`
   từ đó. Nó chỉ thôi là khuôn ra của phiên con.

## Phương án đã loại

Giữ `final_output` làm chỗ nộp duy nhất (bỏ `nop_de_xuat`, hook phiên gốc ghi dòng): cũng hết
mâu thuẫn, nhưng dời ghi và kiểm vào hook, đổi hai tool đang có bài kiểm, và phép dò chưa chứng
cho cấu hình đó.

## Rủi ro

Phiên gốc vẫn có thể tự gửi `outputSchema` khi gọi `tro_ly_okr` (khuôn vào của mọi subagent cho
phép); eve sẽ dựng lại `final_output`. Bộ đo đếm số lời gọi `tro_ly_okr` mang `outputSchema` trong
trace thay vì đoán.

## Đo

- Bài kiểm không gọi model: ma trận kết cục của hai tool trên kho kiểm; ma trận lưới của hook;
  định nghĩa phiên con không có `outputSchema`.
- Model: `rang/dem-rong.mjs` chạy lệnh của E22 (`tro-ly-okr-de-xuat`) và E17
  (`tro-ly-okr-tom-tat`), rồi đọc trace của đúng cửa sổ lượt đó: 0 lời gọi `tro_ly_okr` dừng
  `length`, 0 lời gọi `final_output`, 0 lời gọi `tro_ly_okr` mang `outputSchema`, 0 dòng
  «empty model response». Chiều đỏ: chính trace ngày 07/10 (bản trích trong hồ sơ).
- E24 đo lại độ trễ: p50 ≤ 8 000 ms, p90 ≤ 15 000 ms, 0 lượt hỏng.

Không chạm giao diện: bỏ design-pass, đặc tả UX, ui-observed bằng dòng sổ có tên.
