# Tổ chức — danh sách và chi tiết

Hồ sơ: `_acceptance/to-chuc-danh-sach-chi-tiet/`. Bản mẫu: `/proto/to-chuc-danh-sach-chi-tiet` (17 trạng thái).

## Vì sao

Phiên lái-thử người-lạ của lượt 1 (`_acceptance/cau-truc-to-chuc/stranger-drive.md`, nhánh `lai-thu/cau-truc-to-chuc`) cho thấy dựng cây bằng tay đắt hơn nhập bảng tính rất nhiều:

- **Gắn phòng ban vào bộ phận** tốn 5 thao tác cho mỗi phòng ban (vấp #1, #2), và người-lạ bỏ cuộc.
- **Đặt trưởng** đi qua menu «…» rồi mới mở hộp thoại, nhưng danh sách chọn chỉ có «Chưa có trưởng» khi phòng ban chưa có người, mà không câu nào nói phải thêm người trước (vấp #3, #4, #5).
- **Câu lỗi nhập** gộp ba lý do vào một câu (vấp #6).
- **Bản xem trước** không nói phòng ban nào sẽ được tạo (vấp #8).

Bản rà bố cục các màn Cài đặt ghi thêm 17 chỗ màn Tổ chức lệch các màn cùng khu. Vòng này sửa những chỗ lệch nằm trong màn Tổ chức và hai chỗ lệch dùng chung với Điều phối 30 ngày.

## Hướng đã chọn

**Danh sách – chi tiết.** Cây đơn vị ở cột trái chỉ để điều hướng. Chọn một nút thì cột phải hiện chi tiết của nút đó, và mọi thao tác sửa nằm ở cột phải, ngay cạnh những người mà thao tác cần tới.

- **Chân ngành:** Google Workspace Admin console mở cây đơn vị tổ chức bên trái, cài đặt của đơn vị đang chọn bên phải.
- **Nguyên liệu bố cục (chỉ xem, không cài):** các block ReUI `solution-files-1` (cột cây và vùng nội dung), `c-item-9` (hàng người), `sheet-9` (khung trượt), `wizard-5` (nhập theo bước), `empty-state-1` (lần đầu).

Hai hướng đã loại:

- **Giữ một cây sửa tại chỗ, chỉ vá chữ gợi ý.** Rẻ nhất, nhưng không chữa được chỗ phải đi 5 thao tác qua menu cho mỗi phòng ban, vì người vẫn không đứng cạnh thứ họ cần chọn.
- **Bảng người có cột phòng ban và bộ phận.** Hợp với việc sửa hàng loạt từng người, nhưng làm mất hình cây. Hình cây đã được hứa cho màn OKR «Theo đơn vị».

## Kiến trúc

**Năm loại nút được chọn:**

| Nút | Khung chi tiết hiện gì |
|---|---|
| gốc OneHub | danh sách bộ phận (kéo để sắp) + danh sách phòng ban chưa xếp, mỗi dòng có nút «Gắn vào bộ phận» |
| bộ phận | ô chọn trưởng (mọi thành viên) + danh sách phòng ban (kéo để sắp) + nút «Gắn phòng ban có sẵn» + nút «Phòng ban mới» |
| phòng ban | ô chọn trưởng (người của phòng ban) + danh sách người + nút «Thêm người» |
| «Chưa có phòng ban» | danh sách người, mỗi dòng có nút «Xếp phòng ban» |

Nút đang chọn nằm trong địa chỉ trang: `?don=goc | bp:<id> | pb:<id> | chua-co`, ghi bằng `nuqs`. Giá trị không giải được thì rơi về gốc. Bộ lọc của ô số nằm ở `?loc=chua-truong`, còn ô tìm dùng `ListSearch` với `?q=`.

**Hai thủ tục ghi mới** trong module `to-chuc` của API. Cả hai đòi quyền quản trị và chạy trong một giao dịch, nên hoặc ghi hết, hoặc không ghi gì:

- `org.attachDepartments({ divisionId, departmentIds })` — gắn 1–50 phòng ban còn sống vào một bộ phận. Phòng ban đang ở bộ phận khác thì chuyển sang. Thứ tự nối vào cuối theo thứ tự được chọn. Phòng ban đã nằm trong bộ phận đó thì giữ nguyên chỗ.
- `org.addPeople({ departmentId, userIds })` — đặt phòng ban này làm phòng ban chính của 1–50 thành viên còn hiệu lực. Nếu phòng ban này đang là phòng ban phụ của họ thì bỏ khỏi danh sách phụ. Quản lý chọn tay của họ giữ nguyên.

Các thủ tục đã có được dùng lại: `org.setHead` (ô chọn trưởng), `org.reorderDivisions`, `org.moveDepartment` (kéo để sắp), `org.setPlacement` (vị trí một người), `org.previewImport` và `org.applyImport`.

**Nhập bảng tính theo ba bước:** 1) dán hoặc chọn tệp; 2) xem trước; 3) kết quả.

- Bản xem trước có thêm trường `newNames: { departments, divisions }`, để màn nêu đúng tên đơn vị sẽ tạo. Trường nằm ngoài `summary`, để các bài kiểm đã ký của lượt 1 không đổi.
- Câu lỗi «thiếu cột» tách thành ba câu: `thieuEmail`, `thieuPhongBan`, `thieuBoPhanTruong`. Việc này **đổi câu đã ghim** của hồ sơ `cau-truc-to-chuc`: hai bài kiểm của nó sửa theo, và hồ sơ đó được ghim lại bằng làn máy.

**Khổ hẹp (< 1024px):** cây chiếm cả bề ngang, chọn một nút thì khung chi tiết trượt ra từ phải (`Sheet`). Khung trượt dùng cùng thành phần chi tiết với khổ rộng.

**Hai chỗ lệch dùng chung được sửa một lần:**

- `ConfirmDialog` thêm `tone: "destructive" | "default"`, mặc định giữ `destructive`. Việc lưu trữ ở Tổ chức và ở Điều phối 30 ngày dùng `default`, vì lưu trữ đảo lại được. Xoá hẳn vẫn dùng `destructive`.
- Mục «Đã lưu trữ» thành một thành phần dùng chung trong `packages/ui` (`archived-list`). Tổ chức và Điều phối 30 ngày cùng dùng nó, chung nhãn «Đã lưu trữ (n)», chung chevron và cỡ nút.

**Nhất quán với các màn Cài đặt khác** (theo bản rà):

- trang có dòng mô tả;
- nút chính nằm trong `PageShellActions`;
- khi chỉ có quyền xem, nút vẫn hiện nhưng làm mờ, kèm một dòng ghi chú ở đầu trang;
- trạng thái tải dùng `PageShellLoading`;
- trạng thái lỗi dùng `Empty` có biểu tượng, câu mô tả và nút «Thử lại»;
- trạng thái trống dùng `Empty` có nút hành động;
- mỗi lần ghi thành công đều báo bằng `toast.success`;
- lỗi trong hộp thoại hiện một kiểu duy nhất (`FieldError`), và con trỏ nhảy tới lỗi đầu;
- sắp thứ tự chỉ bằng kéo thả trong danh sách của nút cha, có cách làm bằng bàn phím;
- không chỉnh giao diện bằng `className` tại chỗ gọi — biến thể mới đặt trong `packages/ui`.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Cài đặt › Tổ chức → chọn phòng ban trên cây → chọn trưởng trong ô «Trưởng phòng ban» → thông báo đã lưu (điểm ra: vẫn ở màn, cây cập nhật nhãn trưởng).
- Suôn sẻ 2: chọn bộ phận → «Gắn phòng ban có sẵn» → tích nhiều phòng ban → «Gắn n phòng ban» → danh sách phòng ban của bộ phận có thêm n dòng.
- Suôn sẻ 3: chọn phòng ban → «Thêm người» → tích người (thấy họ đang ở phòng ban nào) → «Thêm n người» → danh sách người cập nhật; ô trưởng có người để chọn.
- Biên: phòng ban chưa có ai → ô trưởng mờ kèm câu «Thêm người vào phòng ban trước, rồi chọn trưởng trong số họ.», và khung trống có nút «Thêm người».
- Biên: vai thành viên thường → mọi nút mờ, kèm dòng «Chỉ quản trị sửa được cây tổ chức.».
- Lỗi & quay lại: máy chủ từ chối (bộ phận đã lưu trữ, người đã rời) → câu lỗi ngay dưới ô trong hộp chọn, không ghi gì; đóng hộp thì trở lại khung chi tiết như cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Tổ chức | dựng và xem cây tổ chức | thanh bên Cài đặt / ở lại |
| Hộp «Gắn phòng ban» | đưa nhiều phòng ban vào một bộ phận | khung bộ phận / khung bộ phận |
| Hộp «Thêm người» | đặt phòng ban chính cho nhiều người | khung phòng ban / khung phòng ban |
| Hộp «Nhập từ bảng tính» | dựng cây từ bảng tính | nút đầu trang, khung trống / khung gốc |
| Khung trượt (khổ hẹp) | xem và sửa chi tiết một nút | cây / cây |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tochuc-goc | Tổ chức | chi tiết gốc: bộ phận kéo được + phòng ban chưa xếp | sắp, gắn, thêm bộ phận |
| ST-tochuc-bophan | Tổ chức | chi tiết bộ phận: trưởng + phòng ban | đặt trưởng, gắn, sắp |
| ST-tochuc-phongban | Tổ chức | chi tiết phòng ban: trưởng + người | đặt trưởng, thêm người |
| ST-tochuc-phongban-trong | Tổ chức | ô trưởng mờ + câu gợi ý + khung trống «Thêm người» | thêm người |
| ST-tochuc-chuaco | Tổ chức | danh sách người chưa có phòng ban, «Xếp phòng ban» từng dòng | xếp |
| ST-tochuc-loc-chuatruong | Tổ chức | cây chỉ còn phòng ban chưa có trưởng, ô số đang bấm | chọn và đặt trưởng |
| ST-tochuc-chidoc | Tổ chức | mọi nút mờ + dòng ghi chú | xem |
| ST-tochuc-hep | Tổ chức | khung trượt phải với chi tiết nút | sửa hoặc đóng |
| ST-tochuc-dangtai | Tổ chức | «Đang tải cây tổ chức…» + khung xương | chờ |
| ST-tochuc-loi | Tổ chức | Empty có biểu tượng, câu mô tả, «Thử lại» | thử lại |
| ST-tochuc-trong | Tổ chức | Empty «Dựng cây tổ chức của bạn» + «Nhập từ bảng tính» + «Thêm bộ phận» | nhập hoặc thêm |
| ST-gan-chon | Hộp gắn | danh sách phòng ban có ô tích, dòng phụ «Đang ở …» | gắn |
| ST-them-chon | Hộp thêm người | danh sách người có ô tích, dòng phụ «Đang ở … — sẽ chuyển» | thêm |
| ST-nhap-buoc1 | Hộp nhập | bước 1: ô dán + chọn tệp | xem trước |
| ST-nhap-buoc2 | Hộp nhập | bước 2: tóm tắt nêu tên đơn vị sẽ tạo + dòng hỏng có lý do riêng | ghi |
| ST-nhap-buoc3 | Hộp nhập | bước 3: đã ghi n người, tạo mới tên từng đơn vị | xem cây |
| ST-luutru-xacnhan | Hộp xác nhận | nút «Lưu trữ» không tô đỏ; nói khôi phục được | lưu trữ hoặc giữ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Địa chỉ trang giữ nút đang chọn (`?don=`), bộ lọc (`?loc=`) và từ tìm (`?q=`). Tải lại trang hay mở liên kết thì về đúng chỗ.
- Cây là một `nav` gồm các nút bấm được bằng Tab và Enter. Nút đang chọn mang `aria-current="page"`.
- Kéo thả sắp thứ tự có cách làm bằng bàn phím: Space để nhấc, mũi tên để dời, Space để thả.
- Hộp chọn nhiều có ô tìm, và nút xác nhận mang số lượng («Gắn 2 phòng ban»). Chưa chọn gì thì nút mờ.
- Danh sách người trên 50 dòng thì chỉ vẽ phần đang nhìn thấy.
- Tên người, tên đơn vị và email mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| PageShell* | dùng | vỏ chung của mọi màn Cài đặt |
| Combobox | dùng | ô chọn trưởng có tìm |
| SortableList | dùng | kéo sắp đã có bàn phím |
| Sheet | dùng | khung trượt khổ hẹp |
| StepList | dùng | ba bước nhập |
| Empty, Checkbox, Dialog, AlertDialog | dùng | trạng thái trống và hộp chọn |
| ConfirmDialog | mở rộng | thêm `tone` cho việc đảo được |
| archived-list | tạo (packages/ui) | một mục «Đã lưu trữ» cho hai màn |
| nút cây, ô số bấm được | tạo (packages/ui) | bản mẫu đang tự chỉnh `className` cho nút — cần biến thể thật |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: Google Workspace Admin console (cây đơn vị bên trái, cài đặt đơn vị bên phải) và block `solution-files-1` của ReUI (cây thư mục trái, nội dung phải). Nhật ký lái thử cho thấy mọi chỗ vấp khi dựng cây tay đều do thao tác nằm xa người cần chọn.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

Xem `## Out of scope` của hợp đồng.
