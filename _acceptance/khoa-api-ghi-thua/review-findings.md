## Trong hợp đồng

- **Hình dạng 3 (và 4): assert 'chuỗi có mặt' trong bun.lock, trong khi lời hứa AC-6 là bun.lock ghi CÙNG khoá patchedDependencies**
  file: `packages/auth/test/khoa-api-ghi-thua.spec.ts:139`
  severity: medium
  AC: AC-6
  source: measurement
  Dòng 139-142 dùng `expect(readFileSync(join(GOC_KHO, "bun.lock"), "utf8"), "bun.lock thieu khoa ban va").toContain(`"${TEN_GOI}@${goiDaCai.version}"`)`. AC-6 hứa `bun.lock` ghi cùng khoá bản vá, tức một quan hệ: khoá trong `patchedDependencies` của package.json phải trùng khoá trong mục `patchedDependencies` của bun.lock. Chuỗi `"@better-auth/api-key@1.6.25"` đã có sẵn trong bun.lock ở mục packages trước khi có bản vá. Ở base 31a9f0ba, dòng 344 là `"@better-auth/api-key": ["@better-auth/api-key@1.6.25", ...]`, còn ở HEAD dòng đó là 347. Vì vậy phép kiểm này vẫn xanh nếu bun.lock mất hẳn mục `patchedDependencies` (dòng 263-264), hoặc nếu mục đó trỏ sang tệp vá khác. Phép kiểm không đọc mục `patchedDependencies` của bun.lock, không so giá trị đường dẫn tệp vá giữa hai tệp, và cũng không có đối chứng âm cho vế bun.lock. Chiều đỏ của ca này chỉ gọi `banVaKhop("1.6.26", ...)` nên chỉ phủ vế package.json. Kết quả: phần 'bun.lock chua cung khoa' trong expected của E6 không được đo thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Test vẫn ép kiểu dữ liệu chưa kiểm bằng `as` ngay trong tệp đã chuyển sang zod**
  Người dùng thấy gì: Nếu định dạng tệp package.json thay đổi bất ngờ, thông báo lỗi khi đó có thể mơ hồ hơn bình thường, khiến người sửa mất thêm thời gian tìm nguyên nhân.
  file: `packages/auth/test/khoa-api-ghi-thua.spec.ts`
  severity: low
  Đề xuất: known-limits

- **The HTTP 401 check for the expired key runs after the library has already deleted the row, so it never tests expiry**
  Người dùng thấy gì: Bài kiểm cho khoá hết hạn có thể vẫn báo xanh dù phần từ chối qua ứng dụng thực ra đến từ lý do khác (khoá đã bị xoá), nên nếu sau này việc từ chối khoá hết hạn ở đường đó bị hỏng thật, bộ kiểm này có thể không kịp cảnh báo.
  file: `apps/api/test/khoa-api-ghi-thua.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **The early return drops the library's only check that the key row still exists, so a key revoked mid-request is accepted**
  Người dùng thấy gì: Trong một khoảng rất ngắn (vài mili-giây), nếu một khoá API vừa bị khoá hoặc vừa hết hạn đúng lúc có một yêu cầu khác đang xử lý bằng khoá đó, yêu cầu ấy vẫn có thể được chấp nhận thay vì bị từ chối ngay.
  file: `patches/@better-auth%2Fapi-key@1.6.25.patch`
  severity: low
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).