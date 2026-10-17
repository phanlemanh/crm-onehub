# Review findings: dau-trang-okr-cho-nut-hoi-kara (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đã rút Hỏi-2 nhưng hợp đồng AC-3 và răng E3 vẫn cho phép sửa hanh-dong-khu.tsx**
  Người dùng thấy gì: Hồ sơ vẫn ghi là được phép sửa hàng nút hành động dù chủ kho đã quyết không sửa. Nếu ai lỡ sửa vùng đó thì bộ kiểm không báo, còn thẻ ký vẫn nhắc một lựa chọn đã bị rút.
  file: `_acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/go-mo-coi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Phần CHIỀU ĐỎ của E5 nói có «CAY_DO 1–5», nhưng chup-man.mjs chỉ có 3 ca và không ca nào làm đỏ bước 2–4**
  Người dùng thấy gì: Phép kiểm các màn Chiến dịch, Onboarding và Tài liệu báo xanh, nhưng chưa từng được chứng minh là biết báo đỏ khi các màn đó lỗi. Nên chữ trong hồ sơ nói chắc hơn thực tế.
  file: `_acceptance/dau-trang-okr-cho-nut-hoi-kara/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Danh sách màn của AC-2 trên thẻ người ký khác với hợp đồng**
  Người dùng thấy gì: Thẻ người ký liệt kê tên các màn khác với những màn thực sự được đo. Người ký có thể hiểu sai là màn nào đã được kiểm.
  file: `_acceptance/dau-trang-okr-cho-nut-hoi-kara/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **khong-sua.mjs (E2) chắc chắn thoát mã 2 khi chạy trên onehub sau gộp: --first-parent cộng --no-merges không thấy commit nào của vòng**
  Người dùng thấy gì: Sau khi gộp, phép kiểm này có thể báo đỏ giả mỗi khi có thay đổi ở khu OKR, dù không ai sửa hai bài kiểm kia. Chỉ gây nhiễu cho lần kiểm lại, không làm hỏng tính năng.
  file: `_acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/khong-sua.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 và 2: E2 (khong-sua.mjs) đo nhãn commit thay vì diff thật của hai tệp kiểm, và chiều đỏ dựng commit viết tay đúng khoá grep**
  Người dùng thấy gì: Phép kiểm "không sửa hai bài kiểm" dựa vào tên commit, nên một thay đổi đi qua commit gộp hoặc commit không mang tên vòng này có thể lọt mà không bị báo.
  file: `_acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/khong-sua.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: kiểm âm CON_KHOA (khoá dto_) trong go-mo-coi.mjs không có đối chứng dương ở --tu-kiem**
  Người dùng thấy gì: Phép kiểm "không còn khoá cấu hình cũ" chưa tự chứng minh được là bắt đúng khi khoá đó xuất hiện lại. Hiện không có khoá cũ nào còn sót, nên chưa gây hại.
  file: `_acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/go-mo-coi.mjs`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dau-trang-okr-cho-nut-hoi-kara/evals.yaml, _acceptance/dau-trang-okr-cho-nut-hoi-kara/card-plain.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
