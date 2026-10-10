## Tóm tắt

Trang **Lộ trình** trong CRM (hàng LT1): trưởng phòng ban mở một trang, thấy mỗi việc của lộ trình đang ở đâu,
hẹn mốc nào, còn bao lâu hay đã trễ — không phải hỏi ai. Trang chỉ để xem: không ô sửa, không nút ghi, không gọi
máy chủ. Nguồn vẫn là tệp kế hoạch trong git; trang đọc khối dữ liệu mà bộ kit (≥ 2.26) xuất vào
`LO-TRINH.html`, và chỉ tự làm một việc: so ngày mốc với hôm nay của người xem.

## Người dùng thấy gì

- Mục «Lộ trình» trên thanh điều hướng, mọi vai đều thấy — kể cả người chỉ dùng OKR.
- Danh sách mặc định «Chưa xong», sắp theo mốc; chuyển «Đã giao», «Xếp lại sau», «Tất cả»; lọc theo lộ trình,
  nhóm, mốc (kể cả «Trễ mốc» và «Chưa hẹn mốc»); tìm theo câu mô tả hoặc mã. Bộ lọc nằm trên đường dẫn — gửi
  đường dẫn là gửi đúng phạm vi.
- Ba cách xem: bảng, bảng cột (chia theo trạng thái, nhóm hoặc lộ trình), theo mốc.
- Khung «n việc đã qua mốc mà chưa giao», một nút mở đúng các việc đó.
- Ngăn hồ sơ một việc: trạng thái, mốc, lộ trình, nhóm, «coi là thành công khi», «vì sao», việc cần xong trước,
  việc đang chờ nó; báo khi trạng thái chỉ lấy từ ghi chú hoặc khi kế hoạch lệch thực tế.
- Danh sách việc đã bác, kèm lý do.
- Khi không có dữ liệu (bản chạy không mang tệp, tệp chưa có khối, khối hỏng, một lộ trình lỗi, khối mới hơn
  trang) trang nói rõ và bảo báo đội sản phẩm; câu máy chỉ nằm trong «Chi tiết cho đội sản phẩm».

## Quyết định trong vòng (sổ quyết định của hồ sơ)

- **Bảng «nghĩa → màu» dùng chung** (`packages/ui/src/lib/status-tone.ts`): chủ kho chốt 10/10 — LT1 thêm lõi
  của NM3 thay vì chờ, là nơi dùng đầu tiên; NM3 giữ việc dời năm khu cũ về bảng và nay xếp sau LT1.
  `docs/design.md`, kế hoạch đợt `sau-14-10` và hàng NM3 trên lộ trình sửa theo.
- **Bản chép bộ đọc của kit giữ nguyên văn**, nên loại khỏi bộ định dạng và bộ soát «slop» bằng một dòng mỗi tệp
  cấu hình — đổi lại phép đo bản chép so được từng ký tự với hàm gốc.
- **Ca «sai kiểu» của phép đo khoan dung** dùng mã việc là số, không phải «danh sách việc là chuỗi»: bộ đọc của
  kit tự đổi danh sách sai kiểu thành rỗng trước khi tới khuôn, nên ca cũ không bao giờ thành «khối hỏng».
- Bài soát tệp lời chung nhận thêm một khối ghim sáu câu có số (chỉ thêm dòng).

## Thang «vẽ tay là bậc cuối» (docs/design.md)

| Khối | Dừng ở bậc | Đã tra |
| --- | --- | --- |
| Danh sách, thanh công cụ, lọc, chuyển cách xem | 1 — `DataTable`, `ToggleGroup`, `ViewSwitch`, `DataTableFacetMenu`, `ListSearch` | khuôn Thoả thuận / Onboarding |
| Bảng cột | 1 — `Board` (không kéo thả) | — |
| Xem theo mốc | 1 — `reui/timeline`, thêm biến thể `rail` ngay trong `packages/ui` | bản mẫu đặt lớp tại chỗ gọi; dời vào biến thể |
| Ngăn hồ sơ | 1 — `Sheet`, `Card`, `Alert`, `Item`, `SectionHeading` | — |
| Việc đã bác | 1 — `SimpleTable` từ `md`, `Item variant="outline"` dưới `md` | nếp «Danh sách» |
| Khung trống, chờ tải | 1 — `Empty`, `Skeleton` | — |
| Bảng nghĩa → màu | 5 — chưa có ở bậc nào; dựng trong `packages/ui/src/lib` | `status-indicator` chỉ có `tone`, không có nghĩa; ReUI không có mục tương ứng |

## Kiểm

Bộ năm lệnh chứng của kho, cộng các phép đo của hồ sơ `_acceptance/trang-lo-trinh-trong-crm/`. Phép đo nào cũng
đã chạy lượt phá thử: làm hỏng đúng chỗ thì đỏ đúng câu ghim.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
