# Review findings: gan-tay-va-kara-co-ly-do (round 2)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (âm tính không ghim thông điệp): ca 'sua không giaTri' bỏ ghim T.troLy.canGiaTri, chỉ so bằng với dòng viết lại**
  Người dùng thấy gì: Khi người dùng sửa đề xuất căn chỉnh của Kara mà để trống lý do, hệ thống vẫn từ chối giống như với dòng viết lại. Bài kiểm chỉ chưa ghim chắc câu báo lỗi nên nếu câu báo lỗi đổi, chưa chắc có gì kêu lên, còn hành vi người dùng thấy không đổi.
  file: `apps/api/test/okr-gan-ly-do.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Module nạp mẫu mới nằm ngoài chặn production của okr:mau và ghi thẳng bảng agentTask (r1)**
  Người dùng thấy gì: Hàm nạp đề xuất mẫu của Kara hiện không tự từ chối khi bị gọi ở môi trường thật. Hôm nay chỉ có công cụ đo màn gọi nó và công cụ đó đã có chặn riêng, nên rủi ro chỉ xuất hiện nếu sau này có chỗ khác gọi lại.
  file: `apps/api/scripts/okr-mau/nap-de-xuat-kara.ts`
  severity: low
  Đề xuất: known-limits

- **Ô thao tác tự ghép bằng div trong khi packages/ui có ButtonGroup; srLabel của cột vẫn chỉ nói «Gỡ» (r1)**
  Người dùng thấy gì: Trong tab Căn chỉnh, cột chứa hai nút Sửa lý do và Gỡ vẫn được đọc to là «Gỡ» với người dùng trình đọc màn hình, nên họ có thể không biết cột này còn có nút sửa.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hộp thoại kiểm và cắt lý do, căn cứ bằng tay thay vì dùng lyDoCanChinhNhap dùng chung (r1)**
  Người dùng thấy gì: Hộp thoại căn chỉnh hiện làm đúng. Nhưng nếu sau này đổi luật về lý do hay căn cứ, màn hình có thể xử lý khác với máy chủ mà không ai hay.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-can-chinh.tsx`
  severity: low
  Đề xuất: known-limits

- **Ở chế độ nhận đề xuất của Kara, ô lý do ghi «Không bắt buộc» nhưng để trống thì không gửi được (r1)**
  Người dùng thấy gì: Khi nhận đề xuất của Kara, ô lý do ghi «Không bắt buộc» nhưng xoá trống thì nút Căn chỉnh bị khoá mà không nói vì sao. Người dùng có thể bối rối không hiểu tại sao không bấm được.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-can-chinh.tsx`
  severity: low
  Đề xuất: known-limits

- **Hợp đồng nhận lý do và căn cứ là chuỗi không giới hạn; bộ lược đồ dùng chung chỉ chạy trong service (r1)**
  Người dùng thấy gì: Tài liệu mô tả giao diện lập trình không nói rõ giới hạn độ dài của lý do và căn cứ, dù hệ thống vẫn từ chối chữ quá dài khi lưu. Người tích hợp có thể chỉ biết giới hạn sau khi bị báo lỗi.
  file: `apps/api/src/okr/okr.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **PATCH /okr/alignments/{id} xoá ngầm trường bị bỏ trống: thiếu canCu (hay lyDo) bị coi là null (r1)**
  Người dùng thấy gì: Nếu một công cụ bên ngoài sửa lý do mà không gửi kèm căn cứ, căn cứ đang lưu sẽ bị xoá lặng lẽ và căn chỉnh có thể tụt về «Chưa có lý do». Hộp thoại trên màn hình luôn gửi đủ nên người dùng thường không gặp.
  file: `apps/api/src/okr/okr.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **troLyQuyet cách `sua` cho dòng can-chinh: bỏ trống canCu thì âm thầm mất căn cứ của Kara và lật lyDoTuKara thành false (r1)**
  Người dùng thấy gì: Nếu công cụ bên ngoài nhận đề xuất của Kara theo cách sửa mà quên gửi căn cứ, căn chỉnh sẽ mất căn cứ Kara đã viết và bị ghi như do người sửa. Người dùng trên màn hình không gặp vì hộp thoại luôn gửi đủ.
  file: `apps/api/src/okr/tro-ly.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Script nạp mẫu đóng AgentTask với outcome `da-nop` trước khi kiểm kết quả nộp (r1)**
  Người dùng thấy gì: Khi nạp đề xuất mẫu mà bị từ chối, việc nền để lại có thể ghi nhầm là «đã nộp». Chỉ ảnh hưởng dữ liệu mẫu khi chạy lỗi, không đến người dùng thật.
  file: `apps/api/scripts/okr-mau/nap-de-xuat-kara.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assert âm tính đứng một mình): dongGopY từ chối canCu trên viet-lai/hoi chỉ được đo bằng success=false, không ghim thông điệp, không có đối chứng dương cùng fixture (r1)**
  Người dùng thấy gì: Bài kiểm việc Kara không được gắn căn cứ vào đề xuất loại viết lại hay hỏi hiện đạt, nhưng chưa chắc bắt được lỗi nếu sau này luật đó bị gỡ nhầm. Người dùng chưa bị ảnh hưởng.
  file: `apps/agent/test/nop-de-xuat-can-cu.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (đếm suy ra từ chính vòng lặp, không từ ma trận viết trước): «số lệnh đã chạy === số lệnh khác nhau» không bao giờ đỏ được (r1)**
  Người dùng thấy gì: Bước kiểm lại các hồ sơ cũ có một phép đếm luôn đúng, nên nếu bộ lọc bỏ sót một hồ sơ thì phép đếm này không báo. Người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/gan-tay-va-kara-co-ly-do/rang/giu-ho-so.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên phủ hai bề mặt × locale, chỉ có một ca điểm): nhãn mức tin theo locale chỉ đo ở hộp thoại, một mức, không đo ở đề xuất (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nhãn mức tin bằng tiếng Anh mới được kiểm ở hộp thoại và một mức, chưa kiểm ở phần đề xuất của Kara. Nếu có chỗ hiện nhãn tiếng Việt khi chọn tiếng Anh thì chưa có bài kiểm nào báo.
  file: `apps/app/test/gan-ly-do.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
