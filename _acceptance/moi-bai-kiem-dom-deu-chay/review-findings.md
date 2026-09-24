## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hình dạng 5: lớp «cả 16 tệp» không có ma trận viết trước, và phép khớp số khẳng định với số phần tử tự đúng theo cách viết**
  Người dùng thấy gì: Nếu sau này có ai xoá bớt vài tệp kiểm bảng cột mà không ai để ý, hệ thống chạy kiểm vẫn có thể báo "tất cả đều xanh" dù thực tế đã chạy ít bài kiểm hơn số đã cam kết.
  file: `_acceptance/moi-bai-kiem-dom-deu-chay/rang/dem-tep-dom.mjs:260`
  severity: medium
  Đề xuất: known-limits

- **Bộ chạy dừng ở tệp đỏ đầu tiên, nên tệp đỏ thứ hai không được chạy và không được báo trong cùng lượt (nêu ở vòng 1, vẫn đúng với mã vòng 2)**
  Người dùng thấy gì: Khi nhiều tệp kiểm cùng lỗi trong một lần chạy, bạn chỉ thấy tên tệp lỗi đầu tiên; phải sửa xong tệp đó rồi chạy lại mới thấy lỗi tiếp theo.
  file: `packages/ui/test/chay-tung-tep-dom.ts:29`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
