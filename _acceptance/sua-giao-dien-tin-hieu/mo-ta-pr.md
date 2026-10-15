## TH6 — Sửa giao diện tín hiệu

Người gửi tín hiệu đọc rõ hộp gửi và trang «Tín hiệu đã gửi» ở mọi khổ màn và mọi ngôn ngữ, thấy lỗi báo đúng chỗ,
và đóng biên nhận không bị hỏi lại. Sửa tám lỗi U1–U8 của lượt rà production 14/10 (tín hiệu crm-1 đến crm-5 và ba
lỗi soạn sẵn), hàng TH6 của `docs/plan/lo-trinh-okr.json`, đợt `vong-tin-hieu-1410`.

- **Bảng (U1):** gộp «Màn» và «Gửi lúc» thành cột «Gửi»; đo trên bản chạy thật ở 768px cột «Điều đã kể» 271px, rộng
  nhất bảng ở 768/900/1100/1280 (trước: 82px ở 900).
- **Lỗi (U2):** vùng lỗi chung của hộp, không đánh dấu ô; quá trần ngày nói theo ngôn ngữ đang chọn, khoá Gửi kèm lý
  do tới hết ngày giờ Việt Nam; không hiện câu máy chủ.
- **Giờ (U3), mã (U4), tên màn (U7):** giờ theo ngôn ngữ; mã crm-N trên mọi dòng; hộp xoá nêu điều đã kể; «Gửi từ
  màn: Mục tiêu» thay đường dẫn (giá trị gửi lên vẫn là đường dẫn, không đổi API).
- **Tiêu điểm và chạm (U5):** xoá xong tiêu điểm tới dòng kế; xoá hỏng nói vì sao; nút ⋮ điện thoại 36×36; nút Gửi
  khoá có dòng nói vì sao.
- **Biên nhận (U6):** đóng không còn hỏi «Bỏ những gì vừa nhập?».
- **Chữ (U8) và câu song ngữ (AC-12):** bỏ chữ nội bộ, câu không lặp nhãn; câu sau gom dựng theo ngôn ngữ từ mã chỗ
  của kit.

**Không chạm** `packages/ui`, `apps/api`, `packages/validation`, `packages/db` (răng E11c đo). Năm ô đo của hồ sơ LT2
`gui-tin-hieu-trong-crm` (E1, E3b, E5b, E10, E13) khai thay bởi tiêu chí của hồ sơ này (luật kit 2.24); LT2 ghim lại
trong PR này.

**Bậc thành phần (docs/design.md):** vùng lỗi của hộp và vùng báo xoá hỏng — bậc 1, `Alert` của `packages/ui`; dòng lý
do trong menu ⋮ — bậc 1, `DropdownMenuLabel`; dòng lý do khoá Gửi — bậc 1, `FieldDescription`. Không khối mới nào phải
xuống bậc 2–5.

**Hồ sơ:** `_acceptance/sua-giao-dien-tin-hieu/` — Cổng Đáng, Cổng Phạm vi (14/10) và Cổng Bằng chứng (15/10) do chủ
kho ký; S4 vòng 2 PASS 16/16. Mười lăm mục ngoài hợp đồng ghi Known limits, Ngoài-6 (tiêu điểm khi bấm «Giữ lại» hay
xoá hỏng) mở hợp đồng mới.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
