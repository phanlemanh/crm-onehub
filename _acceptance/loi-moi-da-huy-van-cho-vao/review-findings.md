# Review Findings: loi-moi-da-huy-van-cho-vao — round 3

## Trong hợp đồng

- **`toStatus` swallows the parse failure entirely, unlike the matching boundary in allow-list.ts**
  AC: AC-4
  file: `apps/api/src/workspace/workspace.service.ts:72`
  severity: medium
  `export function toStatus(value: string) { return docTrangThai(value).trangThai; }` discards `docTrangThai(...).loi`. AGENTS.md's parse-at-the-boundary rule is explicit: "Parse failure is a real error with a real message. Do not swallow it… because 'unreadable manifest' and 'no actions' are different problems." AC-4 of this feature's own contract restates it ("Giá trị không phân tích được là một lỗi có tên, không phải một mặc định im lặng"). The sibling boundary added in the same change, `packages/auth/src/allow-list.ts:93-121`, does surface `doc.loi`; this one does not, so the same unreadable row is named in one path and silent in the other. `WorkspaceService` already holds `private readonly logger = new Logger(WorkspaceService.name)` a few lines below, so the named-error path is available at zero cost. Separately, `toStatus` was changed from a module-private function to an `export` solely so `apps/api/test/workspace-thanh-vien.spec.ts` can import it — widening the service module's public surface for test access.

  source: conventions

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The named-constant invariant (AC-7) was applied only to the `canceled` write; three sibling status literals remain raw**
  Người dùng thấy gì: Vẫn còn vài nơi trong hệ thống dùng chuỗi trạng thái gõ tay thay vì một nguồn dùng chung; nếu ai gõ sai ở những chỗ đó sau này, lời mời có thể được xử lý sai mà không ai nhận ra ngay.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: high
  Đề xuất: known-limits

- **New `console.error` in the sign-in read path logs a user email address on every attempt**
  Người dùng thấy gì: Mỗi lần một tài khoản có lời mời cũ đăng nhập, hệ thống có thể ghi lại địa chỉ email của người đó vào nhật ký lỗi nội bộ, lặp lại ở mỗi lần thử — vừa gây nhiễu vừa lộ thông tin cá nhân không cần thiết.
  file: `packages/auth/src/allow-list.ts`
  severity: medium
  Đề xuất: new-contract

- **Existing withdrawal integration test still writes the legacy `cancelled`, so it no longer covers the real cancel value**
  Người dùng thấy gì: Một bài kiểm tra cũ vẫn còn dùng dữ liệu giả theo cách huỷ lời mời không còn xảy ra trong thực tế, nên nếu tính năng huỷ mới bị lỗi sau này, bài kiểm đó sẽ không phát hiện ra.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **`ALLOWANCE_STATUSES` hand-copies the vocabulary instead of deriving it from the validation package**
  Người dùng thấy gì: Không ảnh hưởng ngay tới người dùng; rủi ro là nếu danh sách trạng thái lời mời thay đổi sau này mà quên cập nhật đồng bộ, màn hiển thị trạng thái có thể sai mà không ai biết.
  file: `apps/api/src/workspace/workspace.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **`@crm/auth` re-exports only part of the status vocabulary, so apps/api reaches past the barrel**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay; rủi ro là người phát triển sau này có thể vô tình dùng nhầm nguồn dữ liệu trạng thái, dẫn tới xử lý lời mời không nhất quán giữa các nơi.
  file: `packages/auth/src/index.ts`
  severity: low
  Đề xuất: known-limits

- **Cột status thành song ngữ: writer đổi sang "canceled" nhưng không có migration cho dòng "cancelled" cũ**
  Người dùng thấy gì: Người từng bị huỷ quyền vào trước khi có bản cập nhật này vẫn bị từ chối đúng như mong đợi, nhưng mỗi lần họ thử đăng nhập, hệ thống sẽ ghi một dòng cảnh báo lỗi, có thể làm nhiễu việc theo dõi lỗi thật của đội vận hành.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Fixture cũ trong cong-vao.integration.spec.ts vẫn ghi "cancelled", không còn đo lộ trình thu hồi thật**
  Người dùng thấy gì: Một bài kiểm tra khác cũng dùng dữ liệu giả cho tình huống huỷ không còn xảy ra trong thực tế nữa, nên nó không còn chứng minh được tính năng huỷ mới hoạt động đúng.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **E10 khai một chiều đỏ mà lệnh của nó không thể chạy**
  Người dùng thấy gì: Một bài kiểm dùng để bắt lỗi hồi quy cho quy tắc đặt tên trạng thái không thực sự bắt được lỗi đó, nên một thay đổi sai có thể lọt qua mà không bị phát hiện.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E9 gõ tay chuỗi "canceled" vào DB thay vì rút từ hằng neo-vào-gói**
  Người dùng thấy gì: Một bài kiểm đầu-cuối cho việc từ chối lời mời đã huỷ không phân biệt được giá trị huỷ thật với một chuỗi gõ sai bất kỳ, nên nếu ai gõ sai giá trị đó, bài kiểm vẫn báo qua như bình thường.
  file: `packages/auth/test/loi-moi-ket-thuc.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo bước trung gian thay vì đầu ra): E3 khẳng định bằng hàm trợ giúp conHieuLuc, không bằng decideSignIn mà AC-3 hứa**
  Người dùng thấy gì: Một bài kiểm cho quy tắc quyết định cho-vào-hay-không lại không gọi đúng hàm quyết định thật, nên nếu quy tắc đó bị đổi sai ở đúng chỗ quan trọng nhất, bài kiểm sẽ không phát hiện ra.
  file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo bước trung gian thay vì đầu ra): E7 đo hàm thuần toStatus vừa được export riêng cho bài đo, không đo đầu ra API/màn quản trị**
  Người dùng thấy gì: Một bài kiểm cho việc hiển thị đúng trạng thái ở màn quản trị lại không đo đúng dữ liệu cuối cùng hiển thị ra màn hình, nên nếu màn quản trị hiển thị sai trạng thái, bài kiểm vẫn báo qua.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E10 khẳng định «nằm trong từ vựng của GÓI» bằng mảng viết tay của chính kho, cùng một file với bốn hằng**
  Người dùng thấy gì: Một bài kiểm dùng để đối chiếu danh sách trạng thái với gói bên ngoài thực chất chỉ so sánh danh sách đó với chính nó, nên không thực sự chứng minh được điều nó tuyên bố.
  file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm-tính-một-mình): E2 chỉ có một assert từ-chối, thiếu luôn cả assert canh mà evals.yaml khai**
  Người dùng thấy gì: Một bài kiểm cho việc từ chối lời mời bị từ chối chỉ kiểm tra một chiều, thiếu phép so sánh đảm bảo giá trị mới khác với giá trị cũ đã lỗi thời — nên một lỗi trộn lẫn hai giá trị đó có thể lọt qua.
  file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/14 lỗi rơi vào file không bộ đo nào phủ (packages/auth/test/cong-vao.integration.spec.ts, apps/api/src/workspace/workspace.contracts.ts, packages/auth/src/index.ts, _acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.