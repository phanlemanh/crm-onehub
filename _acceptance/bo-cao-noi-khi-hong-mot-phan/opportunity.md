---
schema_version: 1
slug: bo-cao-noi-khi-hong-mot-phan
feature: Bộ cào nói ra khi hỏng MỘT PHẦN — hiện nó chỉ nói khi hỏng trọn vẹn
owner: omre.cnsp4@onemount.com
stage: decided
decision: park
decided_by: Phan Le Manh
decided_at: 2026-10-31T09:52:29Z
---

## Vấn đề & ai gặp

Vòng `nang-tran-trang-danh-ba` (ký 08/09) dựng ba số sức khoẻ và một cờ để bản
tổng kết nói được mẫu có trải hết dải hay không. Ba lượt chấm liên tiếp cho thấy
lá chắn đó chỉ bật ở ca hỏng TRỌN VẸN. Hỏng một phần vẫn đi qua với mọi số báo
xanh.

Ba mục Cổng Bằng chứng gộp về đây (`d-ntt-ngoai-3`, `d-ntt-ngoai-9`,
`d-ntt-ngoai-10`):

- **Thẻ mất địa chỉ bị bỏ im.** `directory_scan` bỏ qua thẻ không có link mà
  không đếm, không log — ngược hẳn `parse_directory` ở ngay trên vốn ném lỗi khi
  một thẻ thiếu link. Lan can duy nhất ở tầng gọi chỉ bật khi TOÀN BỘ thẻ mất
  địa chỉ.
- **Mất phần lớn địa chỉ vẫn đếm là trang đọc được.** Sàn đổi giao diện một phần
  — ví dụ 11 thẻ mỗi trang còn 6 thẻ mang địa chỉ — thì mỗi trang mất 5 người,
  trang vẫn cộng vào `trang_danh_ba_doc`, `trang_danh_ba_hong` vẫn 0, và bản
  tổng kết in ra sức khoẻ hoàn hảo trên một mẫu đã thủng.
- **Cờ bị-trần-cắt vẫn BẬT khi đuôi lượt chạy bị chặn sạch.** Cờ đòi «có ít nhất
  một trang đọc được thẻ», nhưng không đòi trang ĐỌC ĐƯỢC nào nằm gần trần. Đọc
  được 3 trang đầu rồi bị chặn 117 trang còn lại vẫn cho cờ BẬT.

**Người trả giá:** người đọc bản tổng kết. Cả ba ca cho ra một dòng số trông
khoẻ trên một lượt cào đã hỏng — đúng lớp lỗi «đắt mà im» mà vòng trước sinh ra
để chặn, chỉ lọt qua ở mức mịn hơn.

**Vì sao đáng một vòng riêng:** lớp lỗi này xuất hiện **ba lần liên tiếp** ở ba
nhánh khác nhau trong ba lượt chấm của vòng trước. Luật STOP-PATCHING của kho
gọi tên nó: vá tiếp từng nhánh là sai khuôn, phải đổi cách nghĩ về «sức khoẻ»
chứ không thêm nhánh thứ tư.

## Ngả làm (chưa quyết)

1. Đo TỈ LỆ thay vì đếm sự kiện: mỗi trang báo số thẻ thấy được và số thẻ có
   địa chỉ; bản tổng kết mang tỉ lệ đó, và tỉ lệ tụt dưới ngưỡng là một cờ riêng.
2. Cờ bị-trần-cắt đòi bằng chứng GẦN TRẦN: trang đọc được cuối cùng phải nằm
   trong `directory_stop_after_empty` trang cuối của lượt đọc.
3. Một bộ bất biến chung cho mọi số sức khoẻ, kiểm ở một chỗ, thay vì mỗi số một
   nhánh — để nhánh thứ tư không đẻ ra lỗ thứ tư.

## Quyết định Cổng Đáng 31/10

Xếp lại sau — Bộ cào tools/listing-crawl không có hàng nào trên lộ trình hiện tại; mở lại khi lộ trình có hàng cho bộ cào. Chủ kho 31/10 «Đồng ý theo khuyên» cho B9 của docs/plan/don-dep-3110.md (bác hoặc xếp lại hồ sơ treo ngoài kế hoạch), qua phiên giám sát Mac Studio; máy chọn từng hồ sơ.
