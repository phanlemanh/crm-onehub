# Review Findings: zalo-gio-theo-mui-gio-xuong (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Eval E1 (zgm) promises a per-cell Intl control that the test never runs**
  Người dùng thấy gì: Màn hình giờ vẫn hiển thị đúng theo múi giờ xưởng; chỉ có hồ sơ kiểm tra mô tả một phép đối chứng kỹ hơn thực tế đã chạy, nên hồ sơ có thể trông chắc chắn hơn mức đã thật sự kiểm chứng.
  file: `_acceptance/zalo-gio-theo-mui-gio-xuong/evals.yaml:58`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): phần `message` của thân webhook «thật» không lấy từ bên viết webhook**
  Người dùng thấy gì: Nếu Zalo đổi cấu trúc tin nhắn thật ngoài đời, hệ thống có thể đọc sai mà bộ kiểm tra tự động không phát hiện ra, vì bộ kiểm tra hiện dùng dữ liệu dựng tay mô phỏng chứ không phải một bản ghi thật lấy từ chính nơi Zalo gửi webhook đến.
  file: `apps/agent/test/support/zalo-tin.ts:83`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/zalo-gio-theo-mui-gio-xuong/evals.yaml, apps/agent/test/support/zalo-tin.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
