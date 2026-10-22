# Hình tại điểm quyết định — truong-tep

Kê từ sổ S1 (dòng chờ seal), chỗ lệch luật đích, và finding gap-probe đã đẩy lên người. Ngưỡng N5: từ ba bước nối tiếp
hoặc từ hai nhánh rẽ trong cơ chế đang được quyết → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Đường tải lên và hàng chờ xoá (design mục 3; Hỏi-7 viết riêng; dọn tải dở) | 5 bước nối tiếp (requestUpload → PUT → complete → ghi hàng/gỡ hàng chờ → lượt dọn) + 3 nhánh rẽ (trùng, từ chối, bỏ dở) | `tai-len.html` |
| Vòng đời tệp khi xoá (Hỏi-1 xoá thật, Hỏi-2 ai xoá; AC-6, AC-7) | 4 đường vào (gỡ một tệp, xoá vĩnh viễn bản ghi, lịch dọn, xoá trường) → 1 hàng chờ → 2 nhánh (Blob trả lời / hỏng → thử lại) | `xoa-tep.html` |
| Hỏi-3 ngưỡng Đường đo | dưới ngưỡng: 3 thước song song, không bước nối | — |
| Hỏi-4 bỏ design-pass | dưới ngưỡng: 1 chọn lựa, 0 bước | — |
| Hỏi-5 trần 10 tệp | dưới ngưỡng: 1 con số | — |
| Hỏi-6 form tạo | dưới ngưỡng: 2 lối, mỗi lối 1 bước | — |
| Hỏi-8 quét mã độc | dưới ngưỡng: 2 lối, 0 bước nối | — |
| Quyền tạm (design mục 4) | dưới ngưỡng: bảng 3 vai × 4 việc, không luồng | — |

## Đề bài `tai-len`

- Loại: sơ đồ luồng (sequence/flow) ba làn: Trình duyệt · API (`fieldFiles`) · Kho Blob riêng tư; thêm làn Lịch dọn.
- Nút: requestUpload (ghi hàng chờ `xoaSau` = hạn phiếu) → PUT URL đã ký → complete (kiểm phiếu, đối chiếu hàng chờ,
  đọc byte, kiểu theo byte, sha256) → ghi FieldFile + gỡ hàng chờ (một giao dịch).
- Nhánh: trùng trong ô → trả hàng cũ, xoá Blob mới · từ chối → xoá Blob · bỏ dở (không complete) → lượt dọn sau hạn phiếu
  xoá Blob.
- Nhãn bằng chữ tiếng Việt, tên thủ tục giữ nguyên. AC liên quan: AC-2, AC-3, AC-7.

## Đề bài `xoa-tep`

- Loại: sơ đồ luồng hội tụ: bốn đường vào (Xoá một tệp — quản trị hay người tải lên; Xoá vĩnh viễn bản ghi — tay, lô;
  Lịch dọn purgeExpired; Xoá trường) cùng đổ vào «ghi hàng chờ BlobChoXoa trong cùng giao dịch» → «commit» → «xoá Blob».
- Nhánh: Blob trả lời → gỡ hàng chờ · Blob hỏng → hàng chờ còn, lanThu + 1 → lịch dọn hằng ngày thử lại. Giao dịch lùi →
  không xoá gì.
- Ghi chú bên: lưu trữ bản ghi hay trường không đi vào luồng này (tệp giữ nguyên).
- AC liên quan: AC-6, AC-7. Hỏi-1, Hỏi-2.
