# Review findings: tai-lieu-loc-giu-lich-su (round 1)

## Trong hợp đồng

- **Dữ liệu cũ giữ lại bằng placeholderData lọt vào nhánh KhoRong: thanh lọc bị gỡ và màn «kho trống» chớp lên khi kho vẫn có trang**
  AC: AC-2
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx:158`
  severity: medium
  source: bugs
  detail: `placeholderData: (truoc) => truoc` cho `ds.data` là dữ liệu của bộ lọc trước trong lúc chờ. Nhưng phép kiểm `khongCoGi && donVi === null && chu === null && !archived` (khoảng dòng 157–159) lại ghép `tatCa`/`soDaLuuTru` CŨ với `donVi`/`chu`/`archived` MỚI đọc từ URL.

  Ca 1, tái hiện dễ nhất: kho có trang đang dùng nhưng không có trang nào đã lưu trữ (`soDaLuuTru = 0`). Bật «Đã lưu trữ» thì được danh sách rỗng, `facetCounts` toàn 0. Tắt lại thì `archived = false`, còn placeholder vẫn mang `tatCa = 0` và `soDaLuuTru = 0`. Kết quả: `return <KhoRong/>`, tức màn «kho trống» kèm nút tạo trang đầu tiên, cho tới khi `taiLieu.list` trả về.

  Ca 2: lọc theo `donVi` ra 0 trang (kho không có trang lưu trữ), rồi bấm «Bỏ lọc» (`data-bo-loc-xoa` hoặc nút trong `data-loc-rong`). Hệ quả y hệt ca 1.

  Trong cả hai ca, `[data-bo-loc]` và nút Toggle vừa bấm bị gỡ khỏi DOM, nên người dùng mất tiêu điểm. Đây đúng là điều AC-2 cấm («thanh lọc không bị gỡ khi chờ»). Trước thay đổi này, lúc chờ chỉ hiện `DangTaiDanhSach`, không hiện thông điệp sai.

  Bài kiểm DOM không bắt được lỗi vì mock luôn trả `soDaLuuTru: 1` (apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx:56). Bước 2 của `do-lich-su.mjs` cũng không bắt được: nó chỉ đo việc đổi chip loại khi đã có 3 trang.

  Hướng sửa: chỉ xét KhoRong khi `!ds.isPlaceholderData`, hoặc dời phép kiểm này xuống sau khi dữ liệu thật đã về.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 — tuyên quét lớp (màn × thao tác) cho AC-1 nhưng ma trận 7 ô thiếu ô Chờ duyệt × sang trang**
  Người dùng thấy gì: Khi sang trang ở màn Chờ duyệt, chưa có bài kiểm tự động nào xác nhận mỗi lần sang trang để lại một mục lịch sử riêng. Nếu có lỗi ở đó, nút lùi của trình duyệt có thể không về đúng trang trước mà không ai phát hiện sớm.
  file: `apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
