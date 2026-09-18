## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Suggestion option "Công ty môi giới" is a term CONTEXT.md explicitly forbids**
  Người dùng thấy gì: Một trong các gợi ý Loại hình cho Công ty dùng tên 'Công ty môi giới', một cụm từ tài liệu nội bộ khuyến cáo tránh vì dễ khiến người dùng hiểu nhầm là chỉ dành cho giai đoạn đầu của khách hàng.
  file: `packages/validation/src/field-templates.ts`
  severity: high
  Đề xuất: known-limits

- **"Phân khúc" reused on screen with a meaning the dictionary already assigns to something else**
  Người dùng thấy gì: Chữ 'Phân khúc' xuất hiện trên màn Công ty và Cá nhân với một nghĩa khác nghĩa đã dùng ở nơi khác trong sản phẩm, có thể khiến người dùng nhầm lẫn khi thấy cùng một từ mang hai nghĩa khác nhau.
  file: `packages/validation/src/field-templates.ts`
  severity: high
  Đề xuất: known-limits

- **Server prefetch hardcodes COMPANY and never reads the entity search param**
  Người dùng thấy gì: Khi mở lại hoặc chia sẻ đường dẫn tới thẻ Cá nhân hoặc Thoả thuận trên trang Trường, người dùng có thể thấy một vòng xoay tải ngắn trước khi đúng dữ liệu hiện ra, dù trang lẽ ra đã có sẵn dữ liệu.
  file: `apps/app/app/(app)/[slug]/settings/fields/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Fields page re-implements the fields sheet body instead of sharing it**
  Người dùng thấy gì: Trang Cài đặt › Trường thiếu dòng mô tả mức độ điền trường mà khay trượt cũ vẫn hiện, nên người dùng dùng hai lối vào cùng một tính năng sẽ thấy thông tin không đồng nhất.
  file: `apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **Vietnamese URL query keys in a registry where every other key is English**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; đây chỉ là cách đặt tên tham số kỹ thuật trên đường dẫn, không phải nội dung người dùng đọc.
  file: `apps/app/lib/search-param-keys.ts`
  severity: low
  Đề xuất: known-limits

- **Bộ từ tiếng Anh cũ vẫn được seed vào COMPANY — E1 báo xanh nhưng chính bằng chứng đã cho thấy nó trên màn**
  Người dùng thấy gì: Nếu một môi trường được khởi tạo dữ liệu mẫu mới, tab Công ty của trang Trường có thể hiện lẫn các trường tiếng Anh cũ như Territory hay Lifecycle stage bên cạnh gợi ý tiếng Việt mới, gây khó hiểu cho người quản trị.
  file: `packages/db/prisma/seed.ts`
  severity: high
  Đề xuất: known-limits

- **taoTuGoiY không có try/finally — một lần đứt giữa đường để lại trường không mang tiền tố mà donRac không bao giờ dọn được**
  Người dùng thấy gì: Nếu một lượt kiểm thử tự động bị gián đoạn giữa chừng, có thể để sót một trường nháp trên Cá nhân hoặc Thoả thuận mà không tự dọn được, khiến trang Trường sau đó báo lỗi có trường tự tạo dư cho tới khi có người vào xoá tay.
  file: `_acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs`
  severity: high
  Đề xuất: known-limits

- **Trang Trường nuốt lỗi tải danh sách ở nhánh sửa: hiện lặng lẽ khuôn TẠO trường mới thay vì báo lỗi**
  Người dùng thấy gì: Nếu tải trang sửa một trường bị lỗi mạng hoặc đường dẫn trỏ tới một trường không còn tồn tại, người dùng thấy một biểu mẫu tạo trường mới trống trơn thay vì thông báo lỗi rõ ràng, dễ khiến họ vô tình tạo nhầm một trường trùng.
  file: `apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **Chốt cungGoc trong bo-goi-y.mjs không bao giờ có thể bắn — điều khoản 2 của evals.yaml là lệnh rỗng**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; đây là một phép kiểm nội bộ trong bộ kiểm thử tự động không hoạt động như mô tả, không tác động đến trải nghiệm dùng sản phẩm.
  file: `_acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **Sáu tệp bằng chứng đã commit mà không chế độ nào của thước ghi ra — chạy lại không làm mới được, và bộ đã commit đang trộn ảnh cũ với ảnh mới**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; các tệp ảnh minh chứng nộp kèm hồ sơ nghiệm thu có lẫn ảnh cũ và ảnh không do lượt kiểm thử nào tạo ra, khiến hồ sơ khó tin cậy khi xem lại.
  file: `_acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): E18 khai là bằng chứng cho MỌI câu "Cặp hai chiều" nhưng chỉ phá 1 trong 2 răng**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; phần lớn các tiêu chí trên giao diện thật chưa từng được kiểm bằng cách cố tình phá hỏng để xác nhận bài kiểm bắt được lỗi, nên rủi ro có lỗi lọt qua nghiệm thu cao hơn hồ sơ thể hiện.
  file: `_acceptance/truong-tu-tao-o-cai-dat/rang/pha-thu.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (assert "có mặt" trong khi lời hứa là QUAN HỆ): E15 hứa nhóm đang dùng chứa ĐỦ CHÍN khoá bộ cào, code chỉ in số rồi kiểm > 0**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp; phép đo tự động cho nhóm Cá nhân coi là đạt miễn có ít nhất một trong chín trường bộ cào, nên nếu tám trong chín trường đó biến mất do lỗi khác, phép đo vẫn báo xanh.
  file: `_acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận toàn phần): E15 hứa "đúng BA nhóm" nhưng docNhom không đọc được nhóm đang dùng và không có assert nào trên số nhóm**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp; phép đo tự động không thực sự xác nhận đúng ba nhóm trường đều hiện diện, nên một hồi quy làm mất nhóm trường đang dùng có thể không bị phát hiện.
  file: `_acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 (đường dẫn/cổng cứng trỏ về checkout tác giả): lệnh E5..E12, E14, E15 mặc định đo máy chủ dev ở checkout chính, không phải bản sao CONG_SAO như điều khoản 4 đòi**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp; các phép đo tự động trên máy chủ có thể đang đo nhầm một bản chạy thử khác đang mở sẵn thay vì đúng bản đang được xét duyệt.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert bằng literal chép tay trong khi lời hứa là QUAN HỆ với bộ cào): E17 ghim khoá bộ cào bằng chuỗi viết tay thay vì import LISTING**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối hiện tại; một bài kiểm tự động chép tay danh sách khoá thay vì lấy từ nguồn khai báo thật, nên nếu nguồn đó đổi sau này, bài kiểm vẫn báo xanh dù tính năng đã hỏng.
  file: `packages/db/test/fields.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn của chính thuốc thay vì đầu ra của module): assert "số nhóm bằng ba" của E2 chạy trên bản zod đã rút, không bao giờ đỏ được**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; một phép đếm trong bộ kiểm thử tự động không thể phát hiện trường hợp có thêm một nhóm gợi ý mới ngoài ba nhóm đã định.
  file: `_acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert "có tham số" trong khi lời hứa là quan hệ thẻ ↔ khoá tham số): E7 chỉ kiểm địa chỉ có query khác rỗng**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp; phép đo tự động chỉ kiểm địa chỉ trang có tham số nào đó thay vì đúng tham số của tính năng này, nên nếu tính năng dùng nhầm tham số khác, phép đo vẫn báo xanh.
  file: `_acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/17 lỗi rơi vào file không bộ đo nào phủ (packages/db/prisma/seed.ts, _acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
