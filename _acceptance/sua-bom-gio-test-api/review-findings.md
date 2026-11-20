## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đầu ra alignmentTree đã parse bằng schema riêng nhưng bị ép kiểu sang Cay (kiểu của cayCanChinh)**
  Người dùng thấy gì: Người dùng không thấy gì. Chỉ là một chỗ trong bài kiểm khai kiểu dữ liệu hơi rộng hơn thực tế, bài kiểm vẫn chạy và báo đúng.
  Căn cứ: Không ảnh hưởng người dùng hay kết quả bài kiểm hiện tại, sửa chỉ để gọn mã nên không đáng mở việc.
  file: `apps/api/test/okr-cay-ly-do.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **hang-sot.ts ghi thẳng vào okrProgramConfig mà không chặn CSDL không phải _test như hai tệp đếm cùng thư mục**
  Người dùng thấy gì: Nếu ai đó chạy công cụ đo này bằng tay, ngoài đường chạy chuẩn, nó có thể ghi một dòng cấu hình OKR thừa vào kho dữ liệu dùng chung của người. Chạy theo lệnh chuẩn thì không xảy ra.
  Căn cứ: Chỉ xảy ra khi chạy sai cách bằng tay, hậu quả nhỏ (một dòng cấu hình thừa) và người dùng tự xoá được, sửa rất rẻ nên ghi lại để ai chạy tay biết.
  file: `_acceptance/sua-bom-gio-test-api/rang/hang-sot.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (đo chuỗi có mặt thay cho quan hệ): chốt «chạy lại phải có số đo» của E14 chỉ kiểm id lần đầu có xuất hiện trong evidence/ci-chay-lai.md**
  Người dùng thấy gì: Bước kiểm có thể báo đạt dù ghi chú về lần chạy lại chỉ có mã lần chạy mà không có số đo thật. Người dùng sản phẩm không bị ảnh hưởng, chỉ khiến người ký tin nhầm vào bằng chứng này.
  Căn cứ: Không đụng tới sản phẩm hay dữ liệu, người ký vẫn đọc được ghi chú bằng mắt; làm chặt thêm tốn công mà lợi ích chỉ là bớt một nguy cơ bỏ sót.
  file: `_acceptance/sua-bom-gio-test-api/rang/ci-api.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): KHANG_DINH kể năm dạng khẳng định mà chỉ một mẫu va thử, và mẫu ấy chỉ phủ expect/toBe**
  Người dùng thấy gì: Công cụ canh việc không xoá bớt khẳng định trong bài kiểm mới chỉ được thử trên một kiểu xoá, nên vài kiểu xoá khác có thể lọt mà không báo. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Không có khẳng định nào bị bớt thật trong vòng này và người dùng không thấy gì; chỉ làm công cụ canh kém chắc ở các ca hiếm, sửa sau cũng được.
  file: `_acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
