# Kết luận — vì sao Tác nhân bộ dựng chậm trên GLM 5.3

Ngày 16/10/2026 · hồ sơ `tac-nhan-glm-5-3-cham` (MH3). Mọi số dưới đây lấy từ `bang.md` (bộ so
`rang/so-tac-nhan.ts` in lại từ `tac-nhan.jsonl` và các bản kết xuất `aiChiPhi`) hoặc từ `do-suy-luan.json`. Cỡ mẫu:
3 lượt mỗi biến thể, 12 lượt hợp lệ trên 12.

## Có tái hiện

GLM 5.3 mặc định hỏng 0/3 lượt qua eval: cả ba lượt bị cắt ở trần 180 giây (`luot-glm53-1.log`,
`luot-glm53-2.log`, `luot-glm53-3.log`). Mốc GLM 5.2 Fast qua 3/3, GLM 5.3 hạng nhanh qua 3/3, GLM 5.3 suy luận thấp
qua 3/3.

## Nguyên nhân: mức suy luận mặc định của GLM 5.3, không phải hạng phục vụ

- **Cùng model, chỉ hạ mức suy luận thì qua.** GLM 5.3 mặc định có phiên con chạy 115.9 và 141 giây mà chỉ được 4 và 2
  bước, ra 6992 và 4166 token (`luot-glm53-1.log`, `luot-glm53-2.log`); cùng `zai/glm-5.3` với `reasoning: "low"` ở
  phiên con `agent_builder` thì phiên con đi đủ 6 bước, ra 1639, 1551 và 1539 token, trong 55.6, 120.2 và 101.3 giây,
  và eval qua cả ba (`luot-glm53-low-1.log`, `luot-glm53-low-2.log`, `luot-glm53-low-3.log`). Token ra giảm mà số bước
  tăng nghĩa là thời gian bị tiêu vào phần suy luận của mỗi bước, không phải vào số bước.
- **Gateway chuyển mức suy luận tới nhà cung cấp.** Phép dò thẳng `zai/glm-5.3` trên cùng một câu: mức `low` sinh 15
  token suy luận, mức `high` sinh 81 (`do-suy-luan.json`). Vậy cờ `reasoning: "low"` có tác dụng thật, và mức mặc định
  khi không khai không phải mức thấp.
- **So với mốc.** Mốc GLM 5.2 Fast có phiên con 40 đến 45.7 giây với 5 đến 7 bước, ra 2698 đến 3887 token
  (`luot-moc-1.log`, `luot-moc-2.log`, `luot-moc-3.log`); GLM 5.3 mặc định tiêu 115.9 giây cho 4 bước ở
  `luot-glm53-1.log`. GLM 5.3 suy luận thấp ra ít token hơn mốc (1539 đến 1639 so với 2698 đến 3887) với 6 bước.
- **Hạng phục vụ nhanh cũng qua, nhưng không đều.** GLM 5.3 hạng nhanh qua 3/3, phiên con 77.5 giây với 6563 token ra ở
  `luot-glm53-fast-1.log`, chỉ 15.2 và 10.3 giây ở `luot-glm53-fast-2.log` và `luot-glm53-fast-3.log`. Nó đổi tốc độ
  phục vụ, không đổi mức suy luận, nên lượt đầu vẫn ra nhiều token như GLM 5.3 mặc định.

## Giới hạn của số đo

- Sổ chi phí chỉ ghi một bước khi bước đó xong. Ở `luot-glm53-3.log` phiên con mới ghi 1 bước (24 token ra, 0 giây giữa
  bước đầu và bước cuối) thì eval đã bị cắt: bước đang suy luận dở lúc cắt không có hàng nào, nên số của lượt này đếm
  thiếu chứ không phải phiên con rảnh.
- Sổ chi phí không tách token suy luận khỏi token ra, và cột model luôn rỗng; model của từng lượt được chứng bằng ô model
  của kho đo đọc lại ngay trước khi eval chạy (AC-2). Model theo từng bước thuộc hàng MH4.
- 3 lượt mỗi biến thể đủ cho chênh lệch này (0/3 so với 3/3), không đủ để xếp hạng mốc, hạng nhanh và suy luận thấp với
  nhau theo giây.

## Trần 3 phút là của bài đo

Trần 180 giây là `timeoutMs` của bài đo `apps/agent/evals/agent-builder.eval.ts`. Phiên bộ dựng thật có trần một ngày
(`SESSION_LIMITS.builder.sessionTimeoutMs` = `DAY_MS`). Trong sản phẩm, GLM 5.3 mặc định không làm hỏng lượt dựng mà
làm người dùng chờ lâu hơn 3 phút; trải nghiệm chờ đó là hàng K7.

## Việc kế cho MH4

Nếu Tác nhân chuyển sang GLM 5.3, phiên con `agent_builder` cần khai `reasoning: "low"`; MH4 đo lại có ghi model theo
từng bước rồi trình bảng chọn model theo vai.
