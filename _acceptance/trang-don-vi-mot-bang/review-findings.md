## Trong hợp đồng

- **Hình dạng 1 (đo LỜI KHAI thay vì ĐẦU RA): người sửa tự thêm chú thích `// AC-14 …` là đủ để miễn đếm dòng kiểm bị xoá**
  file: `_acceptance/trang-don-vi-mot-bang/rang/ghim-nam.mjs:340`
  severity: high
  AC: AC-14
  source: measurement
  detail: Mẫu `KHAI_TAI_CHO = /\/\/ (AC-14 (cach-toi|loi-hua-moi)|F8 neo): \S/` ở dòng 64. Ở dòng 340-342, khối diff nào có một dòng `+` khớp mẫu đó thì mọi dòng xoá trong khối được đưa vào `khaiTaiCho` thay vì `khongKhai`, và chỉ `khongKhai` mới làm đỏ. Chạy trên cây hiện tại: 62 dòng xoá ngoài dấu cũ (soan-okr-trong-khung 26, okr-soat-anh-luot-3 15, dat-okr-trong-crm 10, muc-tieu-va-kr 4, okr-to-chuc-va 3, khung-okr-truoc-r1 2, toan-canh-okr 2) đều thành «trong khoi khai tai cho», kết quả «DUNG AC-14». Trong số đó có những chỗ đổi điều khẳng định thật. okr-to-chuc-va/man-okr.mjs lật `mo === "false"` thành `mo === "true"`. khung-okr-truoc-r1/bon-vai.mjs nới `!d.coNhom` thành `(!d.coNhom || (d.khoa && d.hinh === "nut-khong-quyen"))`, trái với expected đã ký «ba vai kia không có [data-nhom-soan]». E16 expected viết rõ «dem dong xoa khong khop dau cu = 0» và không có ngoại lệ chú thích nào. Lượt 1, phép đo này đỏ với «soan-okr-trong-khung xoa 21 dong ngoai dau cu khong khai», và màu đỏ đó tắt bằng cách thêm chú thích. Trong DOT_BIEN["dvb-ghim-nam"] cũng không có đột biến nào phá vế XOA (chỉ có ghim-cu và muon-cu), nên vế này không có chiều đỏ.
  Lý do gán AC-14: AC-14 đòi mỗi chỗ sửa trong rang/ chỉ đổi cách tới trạng thái và không bỏ điều khẳng định nào khác; finding chỉ ra các sửa thật đổi điều khẳng định (lật mo === "false" thành "true", nới điều kiện nhóm soạn) mà vẫn được miễn nhờ chú thích.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khung chờ tải bảng đơn vị tự vẽ, trùng KhungXuong hinh="bang" của packages/ui, và lệch hình với fallback của chính trang**
  Người dùng thấy gì: Khi trang đang tải, người dùng có thể thấy hai khung chờ hơi khác hình nối nhau trước khi bảng hiện ra. Chỉ là chênh lệch về vẻ ngoài lúc chờ, không làm sai dữ liệu hay chặn thao tác.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx`
  severity: medium
  Đề xuất: known-limits
- **Bộ đọc nuqs của bảng đơn vị khai riêng trong bang.tsx, không ở okr-search-params.ts nơi mọi bộ đọc OKR đang sống**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ khiến người sửa sau này phải mở thêm một tệp để đổi mặc định chiều sắp xếp.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx`
  severity: low
  Đề xuất: wont-fix
- **translate="no" bọc luôn nhãn giao diện «Thuộc» trong dòng chân bảng**
  Người dùng thấy gì: Trình duyệt có thể không tự dịch chữ «Thuộc» ở chân bảng cho người dùng bật dịch tự động. Tên đơn vị vẫn hiện đúng, ảnh hưởng nhỏ.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/chan-bang.tsx`
  severity: low
  Đề xuất: known-limits
- **Footer count ignores the quick filter, so it disagrees with the visible rows**
  Người dùng thấy gì: Khi bật lọc nhanh «Cần bàn» hoặc «Chưa góp vào đâu», bảng có thể chỉ còn vài mục tiêu mà chân bảng vẫn ghi tổng số cũ. Người xem dễ nhầm hai con số không khớp nhau.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`
  severity: medium
  Đề xuất: new-contract
- **Restoring the cycle phase in the test DB swallows its error, so a run can say 'dat' while the DB is left in the wrong phase**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm. Nếu việc trả lại trạng thái trong DB thử bị lỗi mà không báo, các lần kiểm sau có thể đo sai mà không ai biết.
  file: `_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 3 (assert «có mặt» thay cho QUAN HỆ): «GHIM <slug> xanh» của E16 không chạm phần mã rang/ mà lượt này sửa**
  Người dùng thấy gì: Báo cáo «mười hồ sơ cũ vẫn xanh» có thể xanh dù phần kiểm đã sửa chưa thật sự chạy lại. Nghĩa là con số này chưa đủ để tin hồ sơ cũ còn đúng với trang mới.
  file: `_acceptance/trang-don-vi-mot-bang/rang/ghim-nam.mjs`
  severity: high
  Đề xuất: known-limits
- **Hình dạng 4 (âm tính một mình): khẳng định «không chữ phụ trên thanh» quét vùng không chứa nhóm soạn**
  Người dùng thấy gì: Một bài kiểm giao diện có thể báo xanh dù chữ phụ không mong muốn xuất hiện cạnh nút soạn. Người dùng sẽ không được báo sớm nếu chữ ấy xuất hiện sai chỗ.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: high
  Đề xuất: known-limits
- **Hình dạng 3 (assert «chuỗi có mặt» thay cho QUAN HỆ): E12/AC-10 chỉ bắt dòng xoá có `it(`/`test(`/`expect(`, không bắt chỗ đổi giá trị kỳ vọng**
  Người dùng thấy gì: Phép kiểm chỉ canh việc xoá bài kiểm, không canh việc nới kết quả mong đợi trong bài. Một bài có thể bị hạ yêu cầu mà không ai hay.
  file: `_acceptance/trang-don-vi-mot-bang/rang/ho-so-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 1 (đo MÃ NGUỒN thay vì ĐẦU RA): số phần tử kỳ vọng của hàng hành động suy từ `git grep` trên tệp nguồn**
  Người dùng thấy gì: Nếu nút Hỏi Kara bị gỡ khỏi hàng hành động đầu trang, bài kiểm tự hạ kỳ vọng và vẫn báo xanh. Người dùng có thể mất nút này mà không có cảnh báo nào.
  file: `apps/app/test/okr-dau-trang-khu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
