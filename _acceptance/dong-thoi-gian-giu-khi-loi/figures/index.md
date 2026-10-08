# Hình tại điểm quyết định — dong-thoi-gian-giu-khi-loi

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Lỗi sau khi đã có dữ liệu hiện tại chỗ, khung lỗi trọn vùng chỉ cho tải đầu (approach S1-1) | năm nhánh trạng thái (đang tải · lỗi chưa có trang · rỗng · danh sách + lỗi Xem cũ hơn · danh sách hay rỗng + lỗi làm mới) | `nhanh-trang-thai.html` |
| «Thử lại» sau lỗi Xem cũ hơn gọi fetchNextPage (approach S1-2) | dưới ngưỡng: hai bước nối tiếp | — |
| Bỏ design-pass (descope) | dưới ngưỡng: một quyết định nhị phân | — |
| Không sửa pinned, số đếm, web, cuộn (descope) | dưới ngưỡng: danh sách cắt | — |

## Đề bài `nhanh-trang-thai`

- Loại hình: cây quyết định (flowchart rẽ nhánh), trái sang phải.
- Nút gốc: «Truy vấn lịch sử của tab Hoạt động». Câu hỏi 1: «Đã có trang nào chưa?»
- Nhánh «chưa»: «đang tải → Spinner» · «lỗi → khung Không tải được hoạt động + Thử lại (tải lại từ đầu)» — đánh dấu «như K6b, AC-4».
- Nhánh «có»: «rỗng → trạng thái rỗng của tab» · «có hoạt động → danh sách». Hai thông báo gắn thêm, KHÔNG thay vùng: «Xem cũ hơn lỗi → cuối danh sách: Không tải được hoạt động cũ hơn + Thử lại (chỉ trang kế)» (AC-1, AC-2) · «Làm mới lỗi → phía trên danh sách hay trạng thái rỗng: Không làm mới được hoạt động + Thử lại» (AC-3).
- Nhãn bằng tiếng Việt; tô nổi hai nhánh mới (AC-1/2, AC-3) so với nhánh giữ nguyên.
