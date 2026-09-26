## Trong hợp đồng

- **Hình dạng 1 — đo CHỈ DẪN thay vì ĐẦU RA: AC-11 kiểm hằng khai báo API_KEY_PLUGIN_OPTIONS, không kiểm tuỳ chọn mà plugin trong `auth` thật sự nhận**
  file: `apps/api/test/khoa-api-ghi-thua.spec.ts:146`
  severity: medium
  AC: AC-11
  detail: Ca 'khong-secondary-storage' (E15) chỉ gọi `khongDiDuongSecondary(API_KEY_PLUGIN_OPTIONS)` (dòng 146) trên hằng được export từ packages/auth/src/auth.ts, cùng hai bản chép `{...API_KEY_PLUGIN_OPTIONS, ...}` (dòng 148-166). Không assert nào nối hằng đó với cấu hình mà `auth` đã dựng, dù contract AC-11 đặt nó làm vế Given: hằng 'mà auth.ts truyền nguyên vào apiKey()'. Hàm `apiKey()` của @better-auth/api-key (node_modules/@better-auth/api-key/dist/index.mjs, khoảng dòng 2398-2400) trả về object plugin `{ id: "api-key", version, $ERROR_CODES, hooks, ... }` mà không để lộ `configurations`. Vì vậy phép kiểm đọc bản khai (khai gì) chứ không đọc đầu ra (plugin chạy với gì). Tình huống lọt: sửa auth.ts thành `apiKey({ ...API_KEY_PLUGIN_OPTIONS, storage: "secondary-storage", fallbackToDatabase: true })`. Hằng không đổi nên E15 vẫn xanh. E1-E5 cũng không bắt được. Lý do: kho không có `ctx.context.secondaryStorage`, nên `getStorageInstance` trả null và nhánh `storage === "secondary-storage" && fallbackToDatabase` vẫn đọc và ghi qua adapter CSDL. Kho khi đó đã đi đường secondary-storage mà AC-9 và AC-11 định chặn, nhưng mọi eval vẫn xanh. Muốn đo đầu ra thì cần một đối chứng chạm vào `auth` đã dựng, hoặc một ràng buộc máy rằng lời gọi `apiKey(...)` trong auth.ts nhận đúng tham chiếu hằng đó. Ca hiện tại không có cả hai.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **card.html đặt AC-11 sai nhóm: rơi khỏi «SẼ làm», hiện nguyên văn Given/When/Then trong «Sẽ KHÔNG làm / sẽ chặn»**
  Người dùng thấy gì: Màn hình duyệt phạm vi đang xếp nhầm một lời hứa mới (AC-11) vào nhóm 'sẽ KHÔNG làm', và hiện chữ kỹ thuật thô thay vì câu thường — người ký có thể hiểu nhầm tính năng này sẽ không được làm.
  file: `_acceptance/khoa-api-ghi-thua/card.html`
  severity: medium
  Đề xuất: new-contract

- **card.html puts AC-11 in the wrong group and shows raw Given/When/Then text instead of the plain sentence**
  Người dùng thấy gì: Màn hình duyệt phạm vi đang xếp nhầm một lời hứa mới (AC-11) vào nhóm 'sẽ KHÔNG làm', và hiện chữ kỹ thuật thô thay vì câu thường — người ký có thể hiểu nhầm tính năng này sẽ không được làm.
  file: `_acceptance/khoa-api-ghi-thua/card.html`
  severity: medium
  Đề xuất: new-contract

- **The expired-key tRPC 401 check runs after the library has already deleted the key, so it proves nothing about expiry**
  Người dùng thấy gì: Bài kiểm thử khoá hết hạn có thể vẫn báo đạt ngay cả khi phần kiểm tra hết hạn bị hỏng, vì phép thử tình cờ đúng nhờ một lý do khác — một lỗi liên quan đến khoá API hết hạn có thể không được phát hiện sớm.
  file: `apps/api/test/khoa-api-ghi-thua.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Bản vá tạo lại mang theo tệp .bun-tag cũ, giờ có hai tệp đánh dấu rỗng (r2)**
  Người dùng thấy gì: Bản vá đi kèm một tệp dấu vết thừa còn sót từ lần vá trước, không ảnh hưởng gì tới việc dùng khoá API — chỉ là rác nhỏ trong tệp nguồn của bản vá.
  file: `patches/@better-auth%2Fapi-key@1.6.25.patch`
  severity: low
  Đề xuất: known-limits

- **Kiểm bun.lock bằng regex tự chế, trả Record thay vì phân tích ở biên (r2)**
  Người dùng thấy gì: Công cụ tự động kiểm tra bản vá có thể báo lỗi giả nếu sau này có thêm một gói được vá nữa, khiến người soát mất công tra nhầm chỗ.
  file: `packages/auth/test/khoa-api-ghi-thua.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Nhánh trả sớm ở storage database bỏ luôn chốt «khoá còn tồn tại» của bản gốc (r2)**
  Người dùng thấy gì: Trong một khoảng thời gian rất ngắn (dưới một phút, chỉ một yêu cầu), một khoá API vừa bị xoá vẫn có thể lọt qua thêm một lượt gọi trước khi bị chặn hẳn.
  file: `patches/@better-auth%2Fapi-key@1.6.25.patch`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/khoa-api-ghi-thua/card.html) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.