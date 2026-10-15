# Hình tại điểm quyết định — hoi-dap-okr

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi đáp chạy trong agent-okr, quyền ở công cụ, mã dựng câu trả lời (d-…-1 đến d-…-4) | 6 bước nối tiếp: màn → cửa → kênh → công cụ lọc quyền → nop_tra_loi kiểm → màn | `luong-mot-cau-hoi` |
| Hỏi-1 Zalo trong C hay tách C2 | một lựa chọn giữa hai lối, không có luồng — dưới ngưỡng | — |
| Hỏi-2 trần hằng số hay ô Cài đặt | một lựa chọn giữa hai lối, không có luồng — dưới ngưỡng | — |
| Hỏi-3 bỏ design-pass | một lựa chọn giữa hai lối, không có luồng — dưới ngưỡng | — |

## Đề bài `luong-mot-cau-hoi`

- Loại hình: sơ đồ luồng ngang (flowchart), một làn chính, một nhánh từ chối ở mỗi chốt.
- Nút theo thứ tự:
  1. «Cột Kara (web)»;
  2. «Cửa /eve/agents/okr» với chốt: cuộc của chính người gọi, lượt ngày, trần tháng — từ chối 403/409/429;
  3. «Kênh agent-okr» với chốt: thẻ JWT, hàng member, vai được vào;
  4. «Kara (model ZDR)»;
  5. «tim_okr / doc_okr» với chốt: purpose okr-hoi, lọc theo quyền xem của người hỏi — Mục tiêu ngoài quyền như không tồn tại;
  6. «nop_tra_loi» với chốt: trích trong quyền, số khớp — từ chối trả về Kara sửa;
  7. «Câu trả lời mã dựng, có trích» quay về cột Kara.
- Nhãn bên cạnh: «Kara của CRM (apps/agent) — không nằm trên luồng này» làm nút xám tách rời.
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-8, AC-12.
