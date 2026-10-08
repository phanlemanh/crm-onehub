# Review findings: da-luu-tru-tai-loi (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 3 (asserts the strings are present when the promise is a value-to-slot relation): E1 checks the title and description by substring on the whole frame's textContent**
  Người dùng thấy gì: Bai kiem tu dong chi xac nhan khung bao loi co du hai cau chu, khong xac nhan cau nao nam o dong tieu de, cau nao o dong mo ta. Neu sau nay hai cau bi doi cho cho nhau, nguoi dung se thay thong bao dao nguoc thu tu ma bai kiem van bao xanh.
  file: `apps/app/test/da-luu-tru-tai-loi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 5 (claims a class, checks one case): E6 says 'every cell pins 3 cards and no full-page error', but two cells skip that (r1)**
  Người dùng thấy gì: Sau khi bấm «Thử lại» trên màn thật, phép đo không kiểm lại rằng ba thẻ nhóm giai đoạn vẫn còn. Nếu «Thử lại» vô tình làm hỏng cả trang, phép đo vẫn có thể báo đạt.
  file: `_acceptance/da-luu-tru-tai-loi/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims a class, checks one case): E3 row 4 promises 'no archived-list at any time' but checks only at the end (r1)**
  Người dùng thấy gì: Trong lúc đang thử lại sau lỗi, phép kiểm không xác nhận danh sách đã lưu trữ chưa hiện ra nhầm. Người dùng có thể thoáng thấy danh sách sai mà phép kiểm không bắt được.
  file: `apps/app/test/da-luu-tru-tai-loi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture): the archived fixture and its type are hand-written instead of parsed with giaiDoanArchivedOutput (r1)**
  Người dùng thấy gì: Nếu sau này dữ liệu danh sách giai đoạn đã lưu trữ đổi dạng, bài kiểm vẫn xanh dù màn hình đọc sai dữ liệu. Rủi ro chỉ xảy ra khi có người đổi dạng dữ liệu đó, không ảnh hưởng người dùng hiện tại.
  file: `apps/app/test/da-luu-tru-tai-loi.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
