# Review findings: ci-test-het-do-co-dinh (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 'lai-ra-man runs before pre-push-da-chung' check reads the order file, not the actual test run**
  Người dùng thấy gì: Một dòng kiểm trong bộ đo tự động của bản sửa này đọc thứ tự từ tệp ghi sẵn chứ không từ lần chạy thật, nên nó luôn báo đạt. Người dùng cuối không bị ảnh hưởng; việc xác nhận thứ tự chạy thật vẫn do bước kiểm ngay trước đó đảm nhận.
  Căn cứ: Hậu quả nhẹ: chỉ là một dòng kiểm thừa trong công cụ đo nội bộ, không mất dữ liệu, và thứ tự thật vẫn được kiểm ở bước khác nên không che lỗi nào; sửa sau cũng rẻ.
  file: `_acceptance/ci-test-het-do-co-dinh/rang/phat-lai-thu-tu.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
