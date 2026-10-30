---
slug: cham-bo-do-chiu-cau-loi
at: 2026-10-30T04:10:00Z
verdict: findings
claims_input: ok
p0: 0
p1: 3
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-7 hứa cham-lai.mjs của F12, cặp đột biến e và E9 giữ ngưỡng của F12 đo lời mới mà không eval nào chạy chúng; E7j không có hai tệp rang/ trong inputs | cham-lai.mjs sửa sót hoặc chuỗi của cặp e không khớp mã mới, chín eval vẫn xanh, ghim F12 đỏ sau khi đã ký | E7 chạy cham-lai.mjs trên lượt dựng từ mẫu và emtdl_giu_nguong; E8 thêm t6 bản sao cặp e; E7j thêm hai tệp rang/; vế chỉ đo được ở bước ghim ghi rõ vào Notes | fixed: E7 khoá 21 emtdl_cham_lai + emtdl_giu_nguong trong ma trận; E8 t6; E7j inputs thêm cham-lai.mjs, dot-bien.mjs; Notes nêu ba vế đo ở bước ghim |
| P1 | contract | Out of scope hứa sua-sau-chay-that và các hồ sơ khác chỉ được đo lại mà không eval nào đo, không ma trận viết trước [lich-su-moi-lan-cap-nhat#F1] | một eval đã ký của hồ sơ khác khớp dòng KHONG DO DUOC cũ và đỏ sau vòng, PR kẹt sau Cổng 2 | ma trận viết trước mọi hồ sơ đã ký dùng hàm của quyet-do.ts hay gọi cham-bo-do.ts, số dòng in = số phần tử | fixed: E7 ma trận 20 khoá kèm mã nền đo trước vòng trên bfca8a74a (18 xanh, ssct_so_bo_mau 1, mtv_so 2 đỏ sẵn), HEAD phải giữ mã nền; c33.mjs gọi model, ghi lý do ngoài ma trận |
| P1 | evals | AC-5 vế thiếu mã ở lượt đo đầy đủ chỉ đo ở mức hàm với mong gõ tay, không đo đường thật truyền danh sách câu | lời gọi ở đường đầy đủ bỏ đối số mong, lượt hụt câu vẫn ra đã đo | hàm chấm lượt nhận danh sách câu đã hỏi làm tham số bắt buộc, bài trên bộ thật bỏ một id, cặp t5 | fixed: chamLuotDu(tungCau, cauDaHoi, nguong) với cauDaHoi bắt buộc, cham-bo-do.ts gọi nó; E5 thêm ca trên mam-tam.json; E8 t5, số cặp 6 |
| P2 | evals | E2 không ghim trần tính trên cả lượt hay theo trường luot | mã tính trần theo từng luot, fixture chia đều câu lỗi nên vẫn xanh | thêm ca 3 lỗi cùng luot 1 và 4 lỗi cùng luot 2 trên fixture 96 câu | fixed: E2 thêm hai ca, ghim «tran tinh tren ca luot, khong theo luot con»; AC-2 nói rõ |
