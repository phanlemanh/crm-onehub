## Trong hợp đồng

- **Màn grant-access chỉ dịch một nửa: client component còn sáu chuỗi tiếng Anh cứng**
  AC: AC-11
  file: `apps/app/app/(landing)/grant-access/grant-access.tsx:26`
  severity: high
  Vòng này kéo màn grant-access vào phạm vi (evidence-report.md ghi "màn grant-access — màn thứ tư của cửa vào — vào phạm vi và đã dịch") và đã nối page.tsx vào kho chuỗi authMessages(...).grantAccess. Nhưng client component bên dưới không được đồng bộ: sáu chuỗi người-đọc-thấy vẫn viết thẳng trong JSX — "Grant Google access" (L26), "Grant Microsoft access" (L31), "Grant access" (L86), "Sign out" (L99), và hai câu báo lỗi client tự dựng "Could not reach the provider." (L46) và "Could not sign out." (L94). Kho chuỗi apps/app/lib/messages/auth.ts không có khoá nào cho những chuỗi này (grantAccess chỉ có title/google/microsoft/both/privacy).

  Hai luật bị vi phạm cùng lúc: AC-11 của contract ("không chuỗi người-đọc-thấy nào còn viết thẳng trong JSX") và AC-14 (câu báo lỗi dự phòng do CLIENT tự dựng phải hiện tiếng của người đọc — hai câu ở L46/L94 là client tự dựng, KHÔNG nằm trong Known limits vì Known limits chỉ miễn câu do máy chủ đúc sẵn). Kết quả trên sản phẩm: người đọc tiếng Việt thấy tiêu đề và đoạn riêng tư bằng tiếng Việt, rồi ba cái nút ngay dưới bằng tiếng Anh.

  Lý do map vào AC-11: grant-access.tsx là một trong chín file trong phạm vi của AC-11, và các chuỗi viết thẳng trong JSX (không lấy từ kho chuỗi) chính là điều AC-11 cấm.

- **Giá trị 13/13 của bảng đóng AC-6 ("Context") không mang translate="no"**
  AC: AC-6
  file: `apps/app/app/(landing)/onboarding/research/research-form.tsx:49`
  severity: high
  AC-6 là BẢNG ĐÓNG mười ba giá trị, dòng 13 ghi rõ: "Context trong nhãn và mô tả ô khoá" (contract.md L45, và rang/o-ghim.json khongDich[12]). Trong research-form.tsx không có bất kỳ thuộc tính translate="no" nào — grep trả về rỗng. nhãn.label = "Khoá API Context" (L49) và nhãn.noKey = "Chưa có khoá API Context?" (L63) đều để trần cho trình duyệt dịch, nên tên riêng "Context" bị dịch mất.

  Đây là một trong những lý do E6 đang đỏ với "KHONG DO DUOC: dân số THIẾU: quan sát được 3/13 giá trị của bảng đóng" (evidence-report.md phần Evidence, eval E6). Cách vá đúng theo đúng khuôn mà onboarding-form.tsx đã dùng: bọc riêng mảnh chứa "Context" trong `<span translate="no">`, không đánh dấu cả nhãn.

  Lý do map vào AC-6: "Context" là dòng 13 trong bảng đóng mười ba giá trị của AC-6, và AC-6 đòi hỏi chính nó phải mang translate="no".

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **`translate="no"` đặt lên cả nhãn nút, không đặt riêng vào dữ liệu — ngược với kế hoạch và luật CLAUDE.md**
  Người dùng thấy gì: Nếu trình duyệt tự dịch trang sang tiếng khác, đoạn chữ đã dịch đứng cạnh tên thương hiệu có thể bị khoá dịch theo, làm chữ hiện không nhất quán.
  file: `apps/app/app/(landing)/sign-in/social-sign-in.tsx`
  severity: medium
  Đề xuất: known-limits

- **Layout gốc còn đọc tiếng bằng tay thay vì gọi getLocale() đã hợp nhất**
  Người dùng thấy gì: Nếu sau này cách chọn tiếng thay đổi, tiêu đề trang và nội dung màn hình có thể rơi vào không còn khớp tiếng với nhau.
  file: `apps/app/app/layout.tsx`
  severity: low
  Đề xuất: known-limits

- **Khoảng diff được yêu cầu là RỖNG — đã review khoảng thực của vòng**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây là lưu ý về phạm vi rà soát của vòng kiểm tra này, không phải lỗi trên sản phẩm.
  file: `Users/manhphan/dev/crm`
  severity: low
  Đề xuất: wont-fix

- **`translate="no"` check passes if ANY one occurrence is compliant**
  Người dùng thấy gì: Công cụ kiểm tra có thể báo đạt dù tên thương hiệu vẫn bị trình duyệt tự dịch sai ở một chỗ khác trên cùng màn hình, nên lỗi thật lọt qua mà không ai biết.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: high
  Đề xuất: new-contract

- **Per-screen results overwritten — a violation on an earlier screen is erased**
  Người dùng thấy gì: Công cụ kiểm tra có thể báo đạt dù một màn trước đó thực sự bị trình duyệt dịch sai tên riêng, vì kết quả màn sau ghi đè mất kết quả màn trước.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: high
  Đề xuất: new-contract

- **Unreachable screen is silently skipped instead of refusing the measurement**
  Người dùng thấy gì: Khi một màn không mở được để kiểm tra, công cụ lặng lẽ bỏ qua thay vì báo không đo được, khiến báo cáo trông như đã kiểm tra đủ trong khi thực ra thiếu.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: new-contract

- **E16 capture never asserts it captured the requested language or the right server**
  Người dùng thấy gì: Ảnh chụp bằng chứng có thể ghi nhận tiếng Việt trong khi trang thực tế hiện tiếng Anh, hoặc lấy nhầm từ một bản máy chủ khác, khiến người duyệt tin nhầm.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/e16-capture.mjs`
  severity: medium
  Đề xuất: new-contract

- **E14 evidence named "three screens" is one screen, saved twice under two names**
  Người dùng thấy gì: Tệp bằng chứng đặt tên là đã chụp đủ ba màn hình nhưng thực ra chỉ chụp một màn hai lần, khiến người duyệt tưởng đã có đủ bằng chứng.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: new-contract

- **`ten-sso` eval does not test the claim in its own pass message**
  Người dùng thấy gì: Công cụ kiểm tra báo đạt cho câu chữ trên nút đăng nhập liên kết ngoài mà không thực sự kiểm tra đúng câu đó, nên lỗi hiển thị sai có thể lọt qua.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: new-contract

- **SSO sign-in catch discards the error with no log**
  Người dùng thấy gì: Khi đăng nhập lỗi vì nguyên nhân khác ngoài mất mạng, người dùng vẫn chỉ thấy thông báo chung chung, và đội kỹ thuật không có manh mối để tìm nguyên nhân thật.
  file: `apps/app/app/(landing)/sign-in/sso-sign-in.tsx`
  severity: medium
  Đề xuất: known-limits

- **Spawn failure recorded as a failed eval instead of a refusal**
  Người dùng thấy gì: Không ảnh hưởng trực tiếp người dùng — báo cáo nội bộ có thể ghi nhầm một phép đo không chạy được thành một phép đo thất bại.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/khai-sinh.mjs`
  severity: low
  Đề xuất: new-contract

- **Dead import left behind by the string extraction**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây là một dòng khai báo thừa còn sót lại sau khi dọn code, sản phẩm vẫn chạy đúng.
  file: `apps/app/app/(landing)/grant-access/page.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).