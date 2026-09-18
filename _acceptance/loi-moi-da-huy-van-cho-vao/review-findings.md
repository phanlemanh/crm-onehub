# Review Findings: loi-moi-da-huy-van-cho-vao (round 4)

## Trong hợp đồng

### Đo CHỈ DẪN thay vì ĐẦU RA — E7 đo `toStatus`, hàm mà lộ trình sản phẩm không còn gọi
- file: `apps/api/test/workspace-thanh-vien.spec.ts:827`
- severity: high
- AC: AC-6
- source: measurement

E7 (criterion AC-6, `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml:52`) hứa đo «API báo đúng trạng thái thật» và khai chiều đỏ «trả lại mặc định im lặng ở toStatus thì hai ô kết thúc hoá pending và bài đỏ». Nhưng sau bản sửa, `toStatus` (apps/api/src/workspace/workspace.service.ts:72) KHÔNG còn người gọi trong mã sản phẩm: `toAllowance` tự gọi `docTrangThai(row.status)` rồi gán `status: doc.trangThai` ở workspace.service.ts:442. `grep -rn toStatus apps packages --exclude-dir=node_modules` chỉ ra đúng ba nơi: định nghĩa ở service:72, và hai lời gọi trong chính bài đo (spec:827 và spec:833). Hệ quả: bất kỳ đột biến nào vào ĐẦU RA thật — ví dụ đổi service:442 thành `status: doc.loi ? "pending" : doc.trangThai` — vẫn để E7 xanh, vì bài chỉ gọi một hàm mồ côi được export riêng cho nó. Chiều đỏ E7 khai chỉ giết được đột biến vào hàm không ai dùng.

### Đo CHỈ DẪN thay vì ĐẦU RA — E3 đo hàm trợ giúp `conHieuLuc`/`docTrangThai`, không bao giờ gọi `decideSignIn`
- file: `packages/auth/test/loi-moi-ket-thuc.spec.ts:54`
- severity: high
- AC: AC-3
- source: measurement

E3 (criterion AC-3, evals.yaml:20) khai chiều đỏ: «đổi luật từ ‹cho vào khi thuộc tập còn hiệu lực› sang ‹chặn khi thuộc tập kết thúc› thì bài đỏ». Luật đó sống ở `decideSignIn` (packages/auth/src/allow-list.ts:69-91, điều kiện `conHieuLuc(candidate.status)` ở dòng 75). Nhưng khối `gia-tri-la` (spec:54-63) chỉ gọi `docTrangThai("mot-chuoi-chua-tung-thay")` và `conHieuLuc(doc.trangThai)` — không có một lời gọi `decideSignIn` nào trong khối, dù `decideSignIn` đã được import ở dòng 2 và dùng ở nơi khác. Viết lại dòng 73-76 của allow-list.ts thành danh sách cấm (`!KET_THUC.includes(...)`) để giá trị rác được cho vào thì `conHieuLuc` không đổi một chữ, nên E3 vẫn xanh. Chính E8 (evals.yaml:60) nói ra nguyên tắc ngược lại — «Ma trận gọi THẲNG decideSignIn … chứ không gọi hàm trợ giúp conHieuLuc, vì đột biến vào hàm quyết định mới là thứ phép đo phải thấy» — E3 phạm đúng điều đó.

### Fixture VIẾT TAY đúng khuôn bên đọc — E9 tự gõ chuỗi `"canceled"` vào bảng thay vì round-trip qua lộ trình huỷ của better-auth
- file: `packages/auth/test/loi-moi-ket-thuc.integration.spec.ts:92`
- severity: medium
- AC: AC-1
- source: measurement

AC-1 nêu Given là «một lời mời đã bị huỷ qua chính lộ trình của better-auth (trạng thái `canceled`)», và trục A của Coverage khai nguồn ghi «lộ trình better-auth». Bài E9 lại tự dựng dòng bằng `db.invitation.create({ data: { … status } })` ở dòng 87-97, với `status` truyền vào là chuỗi gõ tay `"canceled"` / `"pending"` ở dòng 114 và 127 — không qua API huỷ của gói, và không lấy từ hằng `TRANG_THAI_HUY` (bài này không import gì từ invitation-status). Bên WRITER (gói) không bao giờ chạy; chỉ bên READER (`ensureWorkspaceMembership` → `decideSignIn`) chạy, trên một fixture được gõ đúng khuôn bên đọc mong đợi. Nếu gói đổi chuỗi huỷ, E5 bắt được ở mức khai báo kiểu nhưng E9 vẫn xanh trên một chuỗi không còn ai ghi — vòng round-trip writer→reader mà AC-1 mô tả không tồn tại trong phép đo nào của hồ sơ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Vòng này dựng từ vựng trạng thái tập trung nhưng chỉ dùng cho một vế ghi — năm chỗ quyết định vẫn so chuỗi gõ tay**
  Người dùng thấy gì: Nếu sau này bên cung cấp đổi cách đặt tên trạng thái, việc gỡ một thành viên có thể không thu hồi đúng lời mời của họ, khiến người đó đăng nhập lại được ngay sau khi vừa bị gỡ.
  file: `apps/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **AC-6 nói về màn quản trị nhưng không phép đo nào chạm màn — bộ lọc thật ở apps/app không bị ghim**
  Người dùng thấy gì: Việc ẩn các lời mời đã huỷ hoặc bị từ chối trên màn quản trị thành viên chưa có phép kiểm tự động canh giữ, nên một sửa đổi sau này có thể vô tình để chúng hiện lại như đang chờ mà không ai phát hiện ngay.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Thước nghiệm thu mới không qua biome và trượt lint rule noUndeclaredEnvVars**
  Người dùng thấy gì: Một file công cụ đo nội bộ chưa theo đúng chuẩn định dạng của kho; việc này không ảnh hưởng tới người dùng sản phẩm.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs`
  severity: low
  Đề xuất: wont-fix

- **Xoá _acceptance/config.yaml.bak khỏi kho nhưng không thêm luật .gitignore**
  Người dùng thấy gì: Nếu chạy lại công cụ tạo hồ sơ nghiệm thu, một file cấu hình cũ có thể vô tình quay lại vào kho khi có người gộp toàn bộ thay đổi cùng lúc.
  file: `.gitignore`
  severity: low
  Đề xuất: known-limits

- **@crm/auth tái xuất từ vựng trạng thái, tạo hai đường nhập cho cùng một hình dạng**
  Người dùng thấy gì: Một đường nhập dùng chung có thể khiến người viết mã sau này vô tình kéo phần máy chủ vào một màn hình chạy trên trình duyệt, làm bản dựng bị lỗi.
  file: `packages/auth/src/index.ts`
  severity: low
  Đề xuất: known-limits

- **Decision card is one verify round stale: it asks the owner to re-decide five items that were already resolved and fixed, and undercounts the evals**
  Người dùng thấy gì: Bản tóm tắt gửi cho người ký duyệt đợt này đã cũ: nó đếm thiếu một phép kiểm và yêu cầu ký lại những việc chủ kho đã quyết và đã sửa xong, có thể khiến người ký ghi nhầm là còn hạn chế.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/card.html`
  severity: high
  Đề xuất: known-limits

- **Decision d-…-6 in the card carries d-…-5's text verbatim, so Treo-1 and Treo-2 render identically and two later decisions are missing entirely**
  Người dùng thấy gì: Trong bản tóm tắt cho người ký duyệt, hai quyết định trước đó bị hiển thị trùng nội dung và hai quyết định gần nhất bị thiếu hẳn, khiến người ký có thể duyệt nhầm hoặc bỏ sót nội dung thật đã thay đổi.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **evidence-page.html — the link the card labels "Bằng chứng đầy đủ" — stops at E9 and round 2, contradicting evidence-report.md**
  Người dùng thấy gì: Trang bằng chứng đầy đủ được dẫn tới từ bản tóm tắt vẫn dừng ở phép kiểm cũ, thiếu bằng chứng cho tiêu chí mới nhất mà chủ kho vừa yêu cầu thêm.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evidence-page.html`
  severity: medium
  Đề xuất: known-limits

- **The Gate-1 decision figure describes branch B as keeping `revokeAllowance` writing `cancelled`, but branch B as shipped changes the writer to `canceled`**
  Người dùng thấy gì: The note explaining why the team skipped a data migration for old cancelled invitations no longer matches what shipped, so the invitation status column will keep storing two different spellings of "cancelled" going forward, not just for old records — anything that later needs to recognize a cancelled invitation will have to check for both spellings indefinitely.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/figures/tu-vung-va-du-lieu-cu.html`
  severity: low
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA — E10 đo giá trị hằng, không đo chỗ GHI mà AC-7 hứa; chiều đỏ apps/api không nằm trong cmd**
  Người dùng thấy gì: Phép kiểm tự động cho việc ghi trạng thái theo tên thay vì theo vị trí chỉ chạy trên một phần nhỏ của hệ thống, không chạm tới nơi thật sự ghi dữ liệu, nên một lỗi đảo thứ tự ở đó có thể lọt qua mà không bị phát hiện.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình — E2 chỉ có một assert từ-chối, không đối chứng dương, và thiếu luôn chốt canh mà evals.yaml khai**
  Người dùng thấy gì: Một phép kiểm từ chối lời mời chỉ có chiều kiểm tra 'bị chặn', không có chiều đối chứng 'người hợp lệ vẫn vào được', nên một lỗi khiến hệ thống chặn nhầm tất cả mọi người vẫn có thể lọt qua mà không bị phát hiện.
  file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 8/14 lỗi rơi vào file không bộ đo nào phủ (_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml, .gitignore, packages/auth/src/index.ts, _acceptance/loi-moi-da-huy-van-cho-vao/card.html, _acceptance/loi-moi-da-huy-van-cho-vao/card-plain.json, _acceptance/loi-moi-da-huy-van-cho-vao/evidence-page.html, _acceptance/loi-moi-da-huy-van-cho-vao/figures/tu-vung-va-du-lieu-cu.html) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
