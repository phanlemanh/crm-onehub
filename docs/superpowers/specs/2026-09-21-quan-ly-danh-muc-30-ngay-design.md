# Quản lý danh mục 30 ngày đầu

Hồ sơ cơ hội: `_acceptance/quan-ly-danh-muc-30-ngay/opportunity.md` (Cổng Đáng ký
«build» 2026-09-21: bảng cột có đủ bốn cách chia, kéo thẻ chưa được trả lời nên
bảng cột CHỈ ĐỂ XEM).

## Vấn đề

Màn danh mục «30 ngày đầu» tự dựng bảng bằng `Table` và các nút lọc `Badge`,
không dùng khung danh sách chung mà Thoả thuận, Công ty, Cá nhân đang dùng. Hệ quả:

1. **Lọc ra không kết quả là ngõ cụt.** `manDanhMuc` suy trạng thái từ số hàng:
   không hàng nào thì trả «chưa có kế hoạch» hoặc «chưa có khuôn», dù đang lọc; màn
   thay cả danh sách lẫn thanh lọc bằng trạng thái trống, người dùng mất lối bỏ lọc
   (Ngoài-13 của hồ sơ `dieu-phoi-30-ngay-dau`).
2. **Không tìm, không sắp, không phân trang.** `listPlans` nhận `q`/`sort`/`dir`
   rồi bỏ qua (Ngoài-6), và danh mục cắt ở 25 hàng.
3. **Nút lọc không dùng được bằng bàn phím** (Ngoài-10) và mở đường dẫn đã lọc thì
   chớp một nhịp (Ngoài-11).
4. **Không có cách nhìn theo cột.** Kho chưa có bảng cột ở màn nào.

## Cách làm

- **Chuyển màn sang khung danh sách chung** — `createListSearchParams`,
  `useTableQuery`, `ListSearch`, `DataTable` của `@crm/ui` — theo đúng mẫu màn Thoả
  thuận. Ba hạn chế 2, 3 và phần chớp của 11 tự hết vì khung chung đã giải chúng.
- **Tìm, lọc, sắp, phân trang làm ở máy chủ.** Tìm theo tên công ty (không phân
  biệt hoa thường). Lọc: tab trạng thái (đang chạy / đã đóng), bộ lọc nhóm «bộ phận
  đang cầm» và «người cầm trịch». Sắp theo: tên công ty, ngày bắt đầu, số ngày im,
  số bước đã xong. Hai khoá sau là giá trị tính từ các bước, nên máy chủ tải trọn
  tập đã lọc rồi mới sắp và cắt trang; `total` luôn là số hàng của tập đã lọc. Đếm
  theo bộ phận làm bằng một truy vấn gom nhóm, không một truy vấn mỗi bộ phận.
- **Trạng thái «không khớp» riêng.** Có bộ lọc hoặc ô tìm đang bật mà không hàng
  nào → màn giữ nguyên thanh lọc và hiện «Không kế hoạch nào khớp» kèm nút «Bỏ lọc»;
  «chưa có khuôn» và «chưa có kế hoạch» chỉ hiện khi KHÔNG có bộ lọc nào.
- **Bảng cột, chỉ để xem.** Một nút đổi cách xem «Bảng / Bảng cột» và, ở bảng cột,
  một ô chọn cách chia. Cả hai nằm trong đường dẫn. Bốn cách chia:

  | Cách chia | Mỗi cột | Mỗi thẻ |
  |---|---|---|
  | Bước đang tắc | nhãn bước chưa xong đầu tiên, cộng cột «Đã xong mọi bước» | một kế hoạch |
  | Bộ phận | bộ phận của bước đang tắc, cộng cột «Đã xong mọi bước» | một kế hoạch |
  | Bậc phễu | bậc cao nhất môi giới đã đạt: chưa có tài khoản · có tài khoản · hoàn thành khoá học · hoạt động · phát sinh giao dịch | một môi giới đã ghi danh |
  | Trạng thái | đang chạy · đã đóng | một kế hoạch |

  Máy chủ tính cột (thủ tục `onboarding.bangCot`); cùng bộ lọc với bảng áp vào
  bảng cột. Mỗi cột hiện tối đa một số thẻ khai trong cấu hình rồi ghi «còn N thẻ».
  Bấm thẻ mở hồ sơ kế hoạch. Không kéo thẻ.
- **Bảng cột là thành phần mới ở `@crm/ui`** (`Board`), vì luật kho: một thành phần
  giao diện mới sống ở `/packages/ui`, màn chỉ đưa dữ liệu vào. Bảng cột cuộn ngang
  trong khung của nó, không đẩy trang tràn ngang.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh điều hướng «30 ngày đầu» → danh mục dạng bảng → tìm, lọc hoặc sắp → bấm một hàng → hồ sơ kế hoạch (điểm ra: hồ sơ)
- Suôn sẻ: danh mục → «Bảng cột» → chọn cách chia → đọc số thẻ mỗi cột → bấm một thẻ → hồ sơ kế hoạch
- Biên: lọc ra không kết quả → «Không kế hoạch nào khớp» + «Bỏ lọc», thanh lọc giữ nguyên; chưa có khuôn nào (không lọc) → trạng thái trống sẵn có
- Lỗi & quay lại: tải lỗi → trạng thái lỗi sẵn có của màn, nút thử lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh mục — dạng bảng | Tìm ra kế hoạch cần xem theo tiêu chí | Thanh điều hướng / hồ sơ kế hoạch |
| Danh mục — dạng bảng cột | Thấy kế hoạch hoặc môi giới dồn ở đâu | Nút đổi cách xem / hồ sơ kế hoạch |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-danhmuc-codulieu | Danh mục — bảng | Bảng có tìm, lọc, sắp, phân trang | Lọc, sắp, bấm hàng |
| ST-danhmuc-khongkhop | Danh mục — bảng và bảng cột | Thanh lọc giữ nguyên, «Không kế hoạch nào khớp», nút «Bỏ lọc» | Bỏ lọc hoặc đổi bộ lọc |
| ST-danhmuc-empty | Danh mục | Chưa có kế hoạch nào — chỉ khi không lọc | Tạo kế hoạch |
| ST-danhmuc-chuacokhuon | Danh mục | Chưa có khuôn — chỉ khi không lọc | Sang Cài đặt › Điều phối |
| ST-bangcot-codulieu | Danh mục — bảng cột | Các cột kèm số đếm, thẻ trong cột | Đổi cách chia, bấm thẻ |
| ST-bangcot-cottrong | Danh mục — bảng cột | Cột có tiêu đề và số 0, thân cột ghi «Trống» | Không có gì |
| ST-bangcot-cotdai | Danh mục — bảng cột | Cột hiện tối đa số thẻ cấu hình, cuối cột «còn N thẻ» | Lọc hẹp hơn hoặc chuyển về bảng |

<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Cách xem, cách chia, ô tìm, bộ lọc, cách sắp, trang: tất cả nằm trong đường dẫn; tải lại hay gửi link giữ nguyên.
- Đổi cách xem hay cách chia giữ nguyên bộ lọc.
- Bảng cột cuộn ngang trong khung riêng; ở khổ 768 trang không tràn ngang.
- Thẻ và nút lọc dùng được bằng bàn phím (thẻ là liên kết, lọc là nút của khung chung).
- Tên công ty và tên môi giới đánh dấu không dịch.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| DataTable, ListSearch, bộ lọc nhóm | dùng | Khung danh sách chung của kho |
| Board (bảng cột) | tạo — ở `@crm/ui` | Kho chưa có; luật kho đặt thành phần mới ở gói giao diện |
| ToggleGroup / Select | dùng | Nút đổi cách xem và ô chọn cách chia |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: kanban (cho dạng bảng cột), danh-sách-chi-tiết (cho dạng bảng)
Căn cứ: chủ kho chọn bảng cột với bốn cách chia; dạng bảng giữ khuôn sẵn có của các danh mục khác trong kho.
<!-- UX-SPEC-TEMPLATE>>> -->
