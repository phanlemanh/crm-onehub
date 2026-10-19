# Hình tại điểm quyết định — ba-ho-so-do-san (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 · phạm vi kiểm chéo (d-20261013T003532Z-2; cũng là dòng [GIẢ ĐỊNH] của Coverage) | 2 nhánh rẽ | `hoi-1-pham-vi.html` |
| Hỏi-2 · trần 60 giây của go-la-cat-quyen (d-20261013T003532Z-5) | 3 nhánh rẽ | `hoi-2-tran-60-giay.html` |
| Hỏi-3 · điều 2 của ld_ba_noi_deu_chay (d-20261013T003941Z-10; gap-probe P0 human-gate1) | 3 nhánh rẽ | `hoi-3-dieu-2-ci.html` |

## Đề bài từng hình

### hoi-1-pham-vi
- Loại: cây quyết định ngang, gốc là «tập đỏ sẵn trên onehub».
- Nút: (A) 19 hồ sơ trong danh sách đóng = 3 hồ sơ P8-4 + 17 hồ sơ paths chết (trùng 1) → làm ở vòng này, ghim lại 18 hồ sơ; (B) 15 hồ sơ kiểm chéo đã gọi tên, 39 eval, phần lớn cần bàn đo màn; kiểm chéo mới chấm ~45/223.
- Hai nhánh: «Khuyên: B thành hàng mới, ghi ngoai_vong» vs «Gộp B vào vòng này — vượt hạn mức, tập chưa khép».
- AC liên quan: AC-2, AC-7.

### hoi-2-tran-60-giay
- Loại: dòng thời gian + ba nhánh.
- Dòng thời gian: 26/09 khoa-con-bat-xa-tran ký, AC-4 «không ca nào mang trần riêng» (luật chủ kho: chỉ nới trần khi có lý do nói được thành lời) → 27/09 tro-ly-okr-nen S4-r1 gắn trần 60 giây cho 5 ca (hết trần 5 giây dưới tải S4) → 13/10 kcb_khong_noi_tran đỏ sẵn.
- Ba nhánh: (b) Khuyên — khai E4 not-run, lý do trỏ quyết định của tro-ly-okr-nen, không chạm mã; (a) gỡ trần, chứng 10 lượt dưới tải, chạm apps/api/test; (c) sửa răng cho phép trần khai ở một hằng có lý do, đổi nghĩa AC-4 đã ký.
- AC liên quan: AC-3, AC-4, AC-5.

### hoi-3-dieu-2-ci
- Loại: ba nơi chạy lệnh build (pre-push · acceptance.yml · ci.yml) và điều nào của răng canh nơi nào; rồi ba nhánh cho điều 2.
- Nút: điều 3 canh pre-push; điều 5 canh acceptance.yml; điều 2 canh ci.yml bằng so từng ký tự với bản của hãng ở sha 3c97e759 — đỏ mãi từ luật 47 (09/10).
- Ba nhánh: Khuyên — kiểm cấu trúc (ci.yml còn bước bun run build không if/continue-on-error); bỏ hẳn điều 2 (ci.yml không còn ai canh); ghim bản ci.yml hiện tại (đỏ lại mỗi lần sửa ci.yml).
- AC liên quan: AC-4, AC-5, AC-8.
