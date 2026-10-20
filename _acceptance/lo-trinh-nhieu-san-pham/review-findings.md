# Review findings: lo-trinh-nhieu-san-pham (round 2)

## Trong hợp đồng

- **Three new agent variables were never added to turbo's pass-through lists or to docs/environment.md**
  AC: AC-1
  file:line: `turbo.json:5`
  severity: medium
  source: conventions
  rationale: Khi chạy qua turbo, tác nhân không nhận được biến của ứng dụng GitHub nên không bao giờ lấy được lộ trình sản phẩm, làm AC-1 (nhịp kế tiếp giữ bản chụp cho sản phẩm) thất bại ở đường chạy thật.
  detail: The change adds GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY and GITHUB_API_URL to .env.example. The agent reads all three (cauHinhGithubApp in apps/agent/agent/lib/lo-trinh-github.ts, and capabilities.ts). None of them appears in the root turbo.json `globalPassThroughEnv` or in the `dev` / `dev:headless` `passThroughEnv` of apps/agent/turbo.json. docs/environment.md («A new variable has three homes, not two») says Turborepo hides any undeclared variable from every task it runs, so the code gets `undefined` and nothing reports it. Every other agent-only variable follows that rule, including its direct analogue OKR_SHEETS_API_URL (the fake-endpoint override) and the GOOGLE_SHEETS_EMAIL/KHOA pair. Effect: under turbo (`bun run dev` at the root and the turbo task runs), the agent never sees the GitHub app. Every product quietly shows «Máy chủ chưa có ứng dụng GitHub» even with the key set in .env. docs/environment.md also has no entry for the pair, but AGENTS.md routes every new variable through that file.

- **A fetch already in flight clears an admin's source change and writes the old source's data**
  AC: AC-5
  file:line: `packages/db/src/san-pham-lo-trinh.ts:212`
  severity: medium
  source: bugs
  rationale: AC-5 buộc sau khi sửa kho/nhánh/đường tệp thì bản chụp cũ kèm dòng «nguồn vừa đổi» tới khi nguồn mới lấy được; cuộc lấy đang chạy xoá dấu đó và ghi dữ liệu nguồn cũ là vi phạm trực tiếp.
  detail: layLoTrinhSanPham reads `ds` (nguonDoiLuc null, old kho/nhanh/duongTep) at the start of the tick, then fetches for up to about 40 s. If suaSanPham changes the source in that window (it sets nguonDoiLuc=now, trangThai chua-lay, kiemLuc null), the agent still writes the old source's snapshot (thayHan:false). ghiKetQuaLay then updates `where: {ma}` with no guard and sets nguonDoiLuc: null, trangThaiLay da-lay, kiemLuc=now. Result: the page shows the old repository's roadmap under the new kho/nhanh label, with no 'source changed' notice, for at least nhipKiemMs. If the new source's head commit is older than the old one, the next non-thayHan write returns "cu-hon" and the wrong data stays indefinitely. Fix: make the update conditional on nguonDoiLuc being unchanged since the row was read (for example where nguonDoiLuc equals the value read). This was a round-1 known limit and is still present.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The Products settings list does not poll while the agent fills in fetch status in the background**
  Người dùng thấy gì: Sau khi thêm một sản phẩm, dòng sản phẩm cứ báo «Đang chờ lấy» cho tới khi quản trị tải lại trang, dù hệ thống đã lấy xong lộ trình.
  Căn cứ: Chỉ làm người xem tưởng chưa xong trong chốc lát, không mất dữ liệu và tải lại trang là thấy đúng; sửa rẻ nhưng không chặn việc dùng.
  file: `apps/app/app/(app)/[slug]/settings/san-pham/san-pham-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **The product service logs plain sentences instead of the field object the API logging rule requires**
  Người dùng thấy gì: Nhật ký máy chủ khi tạo hay sửa sản phẩm ghi thành câu văn thay vì các trường tách riêng, nên khó lọc khi tra sự cố.
  Căn cứ: Người dùng không thấy gì, không mất dữ liệu; chỉ làm việc tra nhật ký của người vận hành kém tiện.
  file: `apps/api/src/lo-trinh/san-pham.service.ts`
  severity: low
  Đề xuất: wont-fix

- **The server still lets an archived product be edited and its viewers changed**
  Người dùng thấy gì: Một quản trị gọi thẳng vào máy chủ vẫn sửa được sản phẩm đã lưu trữ hoặc đổi người xem của nó, dù trên màn các nút đó đã ẩn.
  Căn cứ: Chỉ quản trị mới làm được, màn hình bình thường không dẫn tới đó, và sửa lại được; hậu quả nhẹ.
  file: `apps/api/src/lo-trinh/san-pham.service.ts`
  severity: low
  Đề xuất: known-limits

- **The same product constants are declared twice, in the app's roadmap config and the shared package**
  Người dùng thấy gì: Một vài giá trị cố định như mã CRM và tên tệp lộ trình được khai ở hai nơi; hiện chúng đang khớp nhau nên người dùng không thấy khác biệt.
  Căn cứ: Không ảnh hưởng người dùng lúc này; chỉ có nguy cơ lệch nhau nếu sau này ai đó đổi một nơi mà quên nơi kia.
  file: `apps/app/lib/lo-trinh/cau-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **The background fetch turns every error into 'GitHub did not answer', keeps only the error name, and logs nothing**
  Người dùng thấy gì: Nếu khoá của ứng dụng GitHub đặt sai, sản phẩm cứ báo «GitHub chưa trả lời, sẽ thử lại» mãi và không để lại dấu vết nào cho người vận hành biết lỗi thật.
  Căn cứ: Không mất dữ liệu và lộ trình CRM vẫn chạy, nhưng người cài sẽ mất thời gian đoán lỗi; chỉ gặp một lần lúc cài đặt nên chấp nhận được tạm.
  file: `apps/agent/agent/lib/lo-trinh-san-pham.ts`
  severity: medium
  Đề xuất: known-limits

- **An unreadable or corrupt product snapshot is shown as 'no roadmap yet', with no log**
  Người dùng thấy gì: Nếu bản lộ trình đã lưu của một sản phẩm bị lỗi khi đọc, trang chỉ báo «chưa có lộ trình» và vẫn ghi «Đã lấy», nên người xem tưởng sản phẩm chưa có gì.
  Căn cứ: Tình huống hiếm, không mất dữ liệu gốc và không ảnh hưởng CRM; chỉ gây hiểu lầm ngắn cho người xem.
  file: `apps/app/lib/lo-trinh/san-pham.ts`
  severity: medium
  Đề xuất: known-limits

- **The viewers sheet shows a skeleton forever when loading viewers fails**
  Người dùng thấy gì: Nếu không tải được danh sách người xem (ví dụ bị đổi quyền hoặc sản phẩm vừa bị xoá), ngăn cứ hiện khung chờ mãi, không báo lỗi và không có nút thử lại.
  Căn cứ: Chỉ xảy ra khi có lỗi hiếm, đóng ngăn rồi mở lại là thử lại được và không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/settings/san-pham/sheet-nguoi-xem.tsx`
  severity: medium
  Đề xuất: known-limits

- **An 'older commit' result from ghiBanChupLoTrinh is ignored, and the status still says Fetched**
  Người dùng thấy gì: Khi nhánh của sản phẩm bị đưa về một commit cũ hơn, trang vẫn hiện lộ trình của commit mới hơn và báo «Đã lấy», không cho quản trị biết trang đã lệch nhánh.
  Căn cứ: Hợp đồng đã chủ động loại trường hợp này; hiếm gặp và không mất dữ liệu.
  file: `apps/agent/agent/lib/lo-trinh-san-pham.ts`
  severity: low
  Đề xuất: known-limits

- **A mistyped repository is reported as 'app not installed', never as 'repository not found'**
  Người dùng thấy gì: Nếu quản trị gõ sai tên kho, màn Cài đặt bảo cài ứng dụng GitHub vào kho thay vì bảo kiểm tra lại tên kho.
  Căn cứ: Chỉ gợi ý sai một chút, người dùng tự sửa được sau khi thử; không mất dữ liệu.
  file: `apps/agent/agent/lib/lo-trinh-github.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính đứng một mình): dòng o-*-2 chỉ kiểm người không được cấp, người được cấp A dựng ra rồi bỏ không dùng**
  Người dùng thấy gì: Phép đo màn chỉ kiểm người không được cấp không thấy sản phẩm, chưa kiểm người được cấp thấy được; nếu sản phẩm bị ẩn với mọi người thì phép đo vẫn báo đạt.
  Căn cứ: Không phải lỗi người dùng gặp mà là lưới kiểm lỏng; các bài kiểm khác có thể phủ chiều được cấp, sửa phép đo khá rẻ.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/do-man.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính đứng một mình): B nhận FORBIDDEN từ thủ tục nguoiXem vốn chặn mọi người không phải quản trị, không liên quan đến quyền được cấp**
  Người dùng thấy gì: Bài kiểm quyền xem dùng một thủ tục vốn chặn mọi thành viên, nên nó không chứng minh được việc cấp quyền cho một người có tác dụng.
  Căn cứ: Người dùng không bị ảnh hưởng; chỉ làm bằng chứng kiểm thử yếu hơn lời hứa, bổ sung bài kiểm là rẻ.
  file: `apps/api/test/san-pham-lo-trinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm có mặt trong khi lời hứa là quan hệ): ma trận khai sai chỉ kiểm mã BAD_REQUEST, không kiểm lỗi trỏ đúng ô**
  Người dùng thấy gì: Bài kiểm khai sai chỉ xác nhận máy chủ từ chối, chưa xác nhận lời báo lỗi chỉ đúng ô nhập sai.
  Căn cứ: Nếu lời báo lệch ô thì người dùng chỉ bối rối ngắn, tự sửa được; nhẹ và rẻ để bổ sung bài kiểm.
  file: `apps/api/test/san-pham-lo-trinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có một điểm): «không chuỗi 20 ký tự nào của khoá riêng» chỉ được kiểm bằng một cửa sổ cố định**
  Người dùng thấy gì: Bài kiểm chỉ dò một đoạn của khoá riêng trong nhật ký và dữ liệu lưu, nên một phần khác của khoá bị rò thì bài kiểm sẽ không bắt được.
  Căn cứ: Khoá lộ là hậu quả nặng nếu xảy ra, nhưng hiện chưa thấy rò thật; sửa bài kiểm rẻ nên nên làm sớm.
  file: `apps/agent/test/lo-trinh-san-pham.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm có mặt trong khi lời hứa là quan hệ): AC-1-lo-trinh chỉ so tập tệp, không so tiến độ với tien_do của khối**
  Người dùng thấy gì: Phép đo màn chỉ xác nhận mọi lộ trình xuất hiện, chưa xác nhận ô tiến độ đúng với dữ liệu; tiến độ sai hoặc để trống vẫn có thể qua.
  Căn cứ: Chưa có dấu hiệu trang hiện sai tiến độ; đây là lưới kiểm lỏng, sửa vừa phải.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có một điểm): quét «khoá cá nhân» chỉ bắt đúng một cách viết header**
  Người dùng thấy gì: Công cụ quét tìm chỗ dùng khoá cá nhân của người chỉ nhận ra một cách viết, nên cách viết khác có thể lọt nếu ai đó thêm sau này.
  Căn cứ: Hiện chưa có chỗ nào dùng khoá cá nhân; rủi ro chỉ ở tương lai và người rà code còn bắt được.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/quet-khoa.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (kiểm âm tính đứng một mình): sản phẩm đã lưu trữ «0 lời gọi GitHub» mà không có sản phẩm lành cùng nhịp**
  Người dùng thấy gì: Bài kiểm sản phẩm đã lưu trữ không có sản phẩm bình thường cùng nhịp để chứng tỏ nhịp thật sự đã chạy, nên có thể xanh dù nhịp không làm gì.
  Căn cứ: Không ảnh hưởng người dùng; các bài khác trong tệp đã chạy nhịp thật nên rủi ro bỏ sót thấp.
  file: `apps/agent/test/lo-trinh-san-pham.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (kiểm âm tính đứng một mình): «không chứa tên sản phẩm» trên nội dung do bài tự ghép từ dữ liệu CRM**
  Người dùng thấy gì: Bài kiểm trang không lộ tên sản phẩm cho người không có quyền tự dựng dữ liệu không bao giờ chứa tên đó, nên nó không chứng minh được gì thêm.
  Căn cứ: Không ảnh hưởng người dùng; việc không lộ tên đã được kiểm ở tầng máy chủ và phép đo màn.
  file: `apps/app/test/lo-trinh-san-pham.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
