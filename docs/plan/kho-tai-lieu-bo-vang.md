# Kho tài liệu — mầm bộ vàng: 50 câu hỏi thật

Soạn 2026-09-27 cho việc «Viết 50 câu hỏi thật của nhân viên» của lượt 0
(`lo-trinh-kho-tai-lieu.md` mục 4): chủ kho gom, máy chuẩn hoá. Đặc tả bộ vàng đầy đủ
(khoảng 470 mục, chín tầng S1–S9) ở mục 12.6 của `kho-tai-lieu-viet-nam-va-do-luong.md`.
Năm mươi câu này là mầm của nó: bộ vàng đòi ít nhất 30% câu tầng S1 viết từ câu hỏi thật,
và chỉ câu thật mới cho biết nhân viên hỏi bằng chữ gì.

Mầm này dùng ở ba chỗ: chọn 20 tài liệu pilot (tài liệu nào trả lời được nhiều câu nhất),
đo pilot không AI (người tìm có ra trang không), và là lõi bộ vàng khi mở lượt 2.

## 1. Chủ kho gom

Lấy câu ở nơi nhân viên đang hỏi thật: nhóm Zalo, tin nhắn tới hành chính, nhân sự, kế
toán, pháp chế, câu hỏi trong buổi đào tạo người mới. **Chép nguyên văn**, kể cả không
dấu, viết tắt, sai chính tả, trộn tiếng Anh: đó chính là thứ bộ đo cần.

Không cần cân tầng hay chủ đề; câu thật sao ghi vậy, máy gán tầng. Nên có cả câu mà hiện
**không tài liệu nào trả lời được**: chúng thành tầng «không trả lời được» (S6), nơi trợ
lý AI phải biết từ chối.

Không ghi tên người hỏi: ghi vai (nhân viên kinh doanh, kế toán, quản lý…). Tên người,
số điện thoại, số hợp đồng trong câu thì thay bằng thẻ như `[tên khách]`, `[số HĐ]`.

Dòng tiêu đề, chép vào bảng tính:

```csv
stt,nguyen_van,vai_nguoi_hoi,phong_ban,noi_hoi,thang_hoi,ai_da_tra_loi,tai_lieu_tra_loi
```

| Cột | Điền gì |
| --- | --- |
| `nguyen_van` | Câu hỏi đúng như người hỏi gõ |
| `noi_hoi` | Nhóm Zalo · tin nhắn riêng · email · trực tiếp |
| `ai_da_tra_loi` | Vai của người đã trả lời, nếu có |
| `tai_lieu_tra_loi` | `stt` trong bảng kiểm kê (`kho-tai-lieu-kiem-ke.md`) của tài liệu chứa câu trả lời, hoặc «không có», hoặc «không rõ» |

## 2. Máy chuẩn hoá

Khi chủ kho gửi bảng gom (dán vào phiên, không đẩy lên kho), máy làm, rồi trả lại để chủ
kho duyệt:

1. Giữ `nguyen_van` không đổi một ký tự.
2. Viết `cau_chuan`: có dấu đủ, dạng Unicode NFC, không viết tắt, giữ nguyên thuật ngữ
   của công ty. Không đoán nghĩa: câu mơ hồ thì đánh dấu, không sửa cho rõ.
3. Tách câu ghép thành nhiều mục; gộp câu trùng nghĩa, giữ mọi nguyên văn.
4. Gán tầng theo mục 12.6: S1 sự kiện đơn · S2 cần nhiều trang · S3 ngoại lệ, ngưỡng,
   điều kiện · S6 không trả lời được. S4 (bị thay thế) và S5 (hiệu lực theo ngày) cần
   trang có nhiều phiên bản, nên để tới lượt 2.
5. Câu mà `nguyen_van` không dấu hay viết tắt thì cũng thành một mục tầng S7, cùng vàng
   với câu có dấu.
6. Ghi 1–2 `y_trong_yeu`: ý mà câu trả lời thiếu thì sai. Chỉ điền khi có tài liệu trả
   lời; máy đọc tài liệu đó, không trả lời từ trí nhớ.

Dòng tiêu đề của bảng đã chuẩn hoá:

```csv
ma,nguyen_van,cau_chuan,tang,vai_nguoi_hoi,phong_ban,tai_lieu_vang,y_trong_yeu,bien_the_cua,ghi_chu
```

`ma` có dạng `V001`. `bien_the_cua` là `ma` của câu gốc khi mục này là biến thể S7.
`tai_lieu_vang` hiện trỏ `stt` kiểm kê; khi trang đã có trong kho thì đổi sang slug trang
cộng mã phiên bản, vì vàng của tầng S5 lưu theo phiên bản, không theo tên trang.

## 3. Nơi giữ

Câu hỏi thật có thể lộ việc nội bộ, nên bảng gom và bảng chuẩn hoá nằm trong bảng tính
công ty, chia sẻ hạn chế, chưa vào kho này.

Quyết định còn mở, cần trước lượt 2: bộ vàng nằm ở đâu. Mục 12.6 đòi một **bộ niêm phong**
100–120 mục ẩn với người viết prompt. Trong kho này, người viết prompt là phiên máy, và
phiên máy đọc được mọi thứ trong git. Vậy bộ niêm phong không được nằm trong git, và phép
chấm nó phải chạy ở nơi phiên máy không đọc được đáp án.

## 4. Xong khi

- Có 50 mục đã chuẩn hoá, chủ kho duyệt.
- Mỗi mục có `tai_lieu_vang` hoặc được đánh dấu S6.
- Con số mang về `kho-tai-lieu-kiem-ke.md` mục 4 hoặc dòng 0 ở mục 8 lộ trình: số mục mỗi
  tầng, số câu không trả lời được, 20 tài liệu phủ được bao nhiêu câu.
