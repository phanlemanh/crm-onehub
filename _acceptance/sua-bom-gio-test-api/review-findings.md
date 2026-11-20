# Review findings — sua-bom-gio-test-api (round 4)

## Trong hợp đồng

- **Thước phạm vi (E4, AC-3) đã nhận sẵn năm tệp mà hợp đồng ghi «CHƯA duyệt», nên E4 xanh dù chủ kho chưa phê**
  file: `_acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs:13`
  severity: medium
  AC: AC-3
  source: conventions
  detail: contract.md (dòng 98–108) ghi ba tệp agent `apps/agent/test/tro-ly-okr-{nop,lich,nhac}-tom-tat.integration.spec.ts` cùng hai tệp `apps/api/test/khoa-api-ghi-thua.spec.ts` và `apps/api/test/go-thanh-vien.spec.ts` là «CHƯA duyệt — chờ chủ kho phê ở Cổng Bằng chứng… Không phê thì hoàn lại». Thế mà các commit d2ae25faa và 9cbfebb38 đã thêm cả năm tệp vào `TEP_KIEM` của pham-vi.mjs, nên `CHO_PHEP` nhận chúng ngay. E4 vì thế ra «PHAM VI XANH» bất kể người ký phê hay không, nghĩa là thước không còn đo AC-3 như bản đã duyệt ở Cổng 1. Đây đúng là việc nới thước sau Cổng 1 trong khi `enforcement: strict`. Lời khai của evals.yaml cũng đã cũ: dòng 66 (E4) và dòng 87 (E5) vẫn ghi «bảy tệp kiểm kê trong TEP_KIEM», còn mã nay có 12 tệp. Ai đọc thẻ sẽ hiểu sai cả phạm vi lẫn những tệp mà luật «không hạ thuốc» (E5) quét.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lời khai của E13 nói ca l3-thu-tu tự dựng hai mục tiêu hoà khoá trong một chu kỳ mới, nhưng bài kiểm chỉ đọc dữ liệu mẫu có sẵn của CHU_KY_Q4**
  Người dùng thấy gì: Bài kiểm thứ tự mục tiêu dựa vào dữ liệu mẫu có sẵn nên có thể không bắt được lỗi thứ tự nếu dữ liệu mẫu đổi. Người dùng sản phẩm vẫn thấy thứ tự ổn định.
  Căn cứ: Chỉ làm bằng chứng kiểm kém chặt hơn lời khai, sản phẩm không sai, và sửa lời khai sau này rất rẻ.
  file: `_acceptance/sua-bom-gio-test-api/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **cmst-goc để lại vĩnh viễn một hàng okrProgramConfig ghi ở giờ quá khứ (10/11) với AI bật, soạn toàn công ty**
  Người dùng thấy gì: Một bài kiểm để lại cấu hình mang ngày cũ có thể khiến bài kiểm viết sau này thấy AI đang bật ngoài ý muốn. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng cơ sở dữ liệu kiểm thử, hiện toàn bộ suite xanh, và gỡ bỏ sau này dễ khi có bài thật sự vướng.
  file: `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **traCauHinhSauMoc trả lại hàng bằng ON CONFLICT DO NOTHING: hàng trùng khoá bị bỏ mà không báo gì**
  Người dùng thấy gì: Nếu bước dọn của bài kiểm hỏng giữa chừng, một vài cấu hình mẫu có thể mất mà không báo, làm bài kiểm sau đỏ khó hiểu. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng bài kiểm nội bộ, không mất dữ liệu người dùng, và lỗi nếu xảy ra sẽ hiện ra ở lượt chạy lại.
  file: `apps/api/test/tro-ly-okr-san.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không đi qua đường ghi thật): hàng sót của E2/E7 cố định version 1, nên không bao giờ chạm vụ trùng version, chỗ ketThucMau lặng lẽ bỏ hàng**
  Người dùng thấy gì: Phép kiểm việc trả lại cấu hình chưa thử đúng hình hàng gây đỏ ở suite thật, nên có thể không phát hiện nếu bước trả lại thiếu hàng. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ làm bằng chứng kiểm yếu hơn mong muốn trong phần kiểm thử nội bộ, không ảnh hưởng người dùng, và bổ sung ca đo sau này rẻ.
  file: `_acceptance/sua-bom-gio-test-api/rang/hang-sot.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (danh sách cho phép chép tay, không rút từ nguồn của lời hứa): TEP_KIEM của E4 có 12 tệp, còn E4 và AC-3 khai bảy**
  Người dùng thấy gì: Công cụ canh phạm vi để lọt thay đổi ở năm tệp kiểm thử không có trong danh sách bảy tệp. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Năm tệp ấy đã được nêu để chủ kho phê ở cổng, nên người ký vẫn thấy được, và chỉ là tệp kiểm thử nội bộ.
  file: `_acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm chuỗi có mặt trong khi lời hứa là một con số): đối chứng E3 không kiểm «8 fail» của gop-y-dung-cho**
  Người dùng thấy gì: Phép đối chứng có thể báo đúng ngay cả khi số ca đỏ khác dự kiến. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ làm phép đối chứng lỏng hơn lời hứa về con số, dấu hiệu đỏ chính vẫn được kiểm, và siết lại sau này rẻ.
  file: `_acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): l3-thu-tu không tự dựng cặp mục tiêu hoà khoá như E13 khai, nên chiều đỏ dựa vào thứ tự vật lý của dữ liệu mẫu**
  Người dùng thấy gì: Bài kiểm thứ tự mục tiêu có thể không đỏ khi mã bỏ khoá phân định, nếu dữ liệu mẫu tình cờ nạp theo thứ tự thuận. Người dùng sản phẩm hiện thấy thứ tự ổn định.
  Căn cứ: Chỉ làm bài kiểm bắt lỗi quay lại kém nhạy hơn, sản phẩm đang đúng, và mức thấp không làm mất dữ liệu.
  file: `apps/api/test/okr-cay-ly-do.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
