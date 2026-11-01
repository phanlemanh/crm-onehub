## Trong hợp đồng

- **Hình dạng 3: assert chuỗi có mặt trong khi lời hứa là quan hệ «nút của khe hanhDong THAY nút mặc định»**
  file: `_acceptance/khung-chung-ngan-ban-ghi/rang/khung-ngan.dom.tsx:112`
  severity: medium
  AC: AC-4
  source: measurement
  detail: AC-4 hứa: khi ngăn truyền khe `hanhDong` thì nút đó THAY nút mặc định (Đóng). Ca «bk1-hanh-dong» chỉ kiểm có `[data-khung-tai-loi] [data-nut="ve-muc-tieu"]` mang chữ «Ve muc tieu», tiêu đề có trong body, và bấm thì `bam` = 1. Không có assert nào nói nút mặc định đã biến mất, ví dụ `vo.querySelectorAll("button").length === 1` như ca «bk1-loi-ly-do» ở ngay trên có làm, hay không còn nút Đóng. Nếu `KhungTaiLoi` dựng cả nút Đóng mặc định lẫn nút của khe thì ca này vẫn xanh. Phần «thay» của lời hứa vì vậy không được đo.

- **Hình dạng 3: «đầu ngăn giữ tiêu đề» được đo bằng một chuỗi có ở đâu đó trong body**
  file: `_acceptance/khung-chung-ngan-ban-ghi/rang/khung-ngan.dom.tsx:67`
  severity: low
  AC: AC-2
  source: measurement
  detail: AC-2 hứa: lúc chờ tải, ĐẦU NGĂN vẫn hiện tiêu đề. Ca «bk1-cho-tai» kiểm bằng `expect(document.body.textContent).toContain("Tieu de tam")`, tức chỉ cần chuỗi có mặt ở bất kỳ đâu trong document. Ca này không kiểm chuỗi nằm trong `[data-slot="sheet-header"]` hay `[data-slot="drawer-header"]`, dù chính tệp này dùng đúng hai bộ chọn đó ở các ca bản mẫu. Nếu tiêu đề rơi xuống thân ngăn hoặc ra một vùng sr-only ngoài đầu ngăn thì ca vẫn xanh. Quan hệ «tiêu đề nằm trong đầu ngăn» không được đo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi tải của ngăn Số KR không dùng VungTaiLoi, trái luật vừa ghi trong docs/design.md và ngan-ban-ghi.md**
  Người dùng thấy gì: Khi ngăn Số KR mất kết nối, người dùng vẫn thấy thông báo lỗi và nút Thử lại dùng được. Nút này chỉ khác hình dạng và không có trạng thái đang thử lại so với các ngăn khác.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, người dùng bấm Thử lại là xong, chỉ lệch giao diện nhỏ so với ngăn khác nên có thể ghi lại và sửa sau.
  file: `apps/app/components/crm/record-sheet/so-kr-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
