## Trong hợp đồng

- **Hình dạng 3: lời hứa là quan hệ giữa hai biến, nhưng ca kho-nguon-tat chỉ đặt một biến (Given «có khoá logo» của AC-3 không được dựng)**
  file: `packages/db/test/blob-nguon.spec.ts:124`
  severity: medium
  AC: AC-3
  source: measurement
  detail: E3 (cmd knr_chi_khoa_logo) chạy `-t kho-nguon-tat` để đo vế cuối của AC-3: «Given BLOB_READ_WRITE_TOKEN đặt và KHO_TAI_LIEU_BLOB_TOKEN vắng … kyPut, kyGet gọi thẳng trên kho nguồn từ chối với «Kho nguồn chưa bật: thiếu KHO_TAI_LIEU_BLOB_TOKEN»». Ca ở dòng 124–134 chỉ gán `process.env[KHOA] = ""` (dòng 125) và không bao giờ đặt `process.env[LOGO]`. beforeEach ở đầu tệp chỉ lưu GIU chứ không gán gì. packages/db không có .env và blob-nguon.ts không nạp @crm/env/load, nên trên CI và dưới `bun run test`, BLOB_READ_WRITE_TOKEN vắng: ca này thật ra đo ô (vắng, vắng), không phải ô «chỉ khoá logo» mà lời hứa nêu. Nếu có bản lùi kiểu `KHO?.trim() || BLOB_READ_WRITE_TOKEN?.trim()` thì kyPut/kyGet vẫn từ chối đúng thông điệp ghim, và ca này vẫn xanh. Lời hứa là một quan hệ (logo có VÀ kho vắng thì từ chối), nhưng phép khẳng định chỉ cố định một vế. Việc bắt được bản lùi hiện chỉ nhờ ô (vang-co) của hai-bien (E1) đi qua bat(). Riêng phần kyPut/kyGet mà E3 tuyên đo thì không có ô «có khoá logo».
  rationale: AC-3 nêu rõ Given 'BLOB_READ_WRITE_TOKEN đặt và KHO_TAI_LIEU_BLOB_TOKEN vắng' cho phần kyPut/kyGet, nhưng ca kiểm chỉ đặt KHO_TAI_LIEU_BLOB_TOKEN rỗng mà không đặt BLOB_READ_WRITE_TOKEN, nên thực chất đo ô (vắng, vắng) chứ không phải ô mà AC-3 tuyên bố đo — phép khẳng định không dựng đúng tiền đề của tiêu chí.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **docs/environment.md mô tả sai các chỗ khai KHO_TAI_LIEU_BLOB_TOKEN trong turbo**
  Người dùng thấy gì: Một câu mô tả trong tài liệu cấu hình nêu sai tên vài tác vụ khai báo biến môi trường; không ảnh hưởng vận hành thực tế vì biến vẫn hoạt động đúng, nhưng người đọc tài liệu có thể bị dẫn sai khi thêm tác vụ mới.
  file: `docs/environment.md`
  severity: low
  Đề xuất: known-limits

- **(r1, lượt BLOCKED trước resume) Hình dạng 5 (ma trận viết trước, số assert = số phần tử): chốt đếm của ma trận hai-bien tự so với chính nó nên không bao giờ đỏ**
  Người dùng thấy gì: Nếu sau này có người lỡ xoá bớt một trường hợp trong bảng kiểm thử, hệ thống kiểm tra tự động sẽ không phát hiện ra và vẫn báo đạt — nghĩa là một lỗi thật (ví dụ liên quan tới khoảng trắng hay nhầm khoá) có thể lọt qua mà không ai biết.
  file: `packages/db/test/blob-nguon.spec.ts`
  severity: low
  Đề xuất: known-limits

- **(r1, lượt BLOCKED trước resume) Hình dạng 5 (ma trận viết trước, số assert = số phần tử): chốt đếm của ma trận luu-nguon trong capabilities.spec cũng tự so và đếm sai số assert**
  Người dùng thấy gì: Nếu sau này có người lỡ xoá bớt một trường hợp trong bảng kiểm thử năng lực lưu nguồn, hệ thống kiểm tra tự động vẫn báo đạt dù đã mất một phần khả năng phát hiện lỗi — một lỗi thật về việc bật/tắt tính năng lưu nguồn có thể lọt qua mà không ai biết.
  file: `apps/agent/test/capabilities.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).