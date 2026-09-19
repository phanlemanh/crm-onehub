## Trong hợp đồng

(không có phát hiện nào ánh xạ được vào AC ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **pha-thu.mjs ghi đè evidence/vung-khai.json bằng số đo trên mã đã bị phá, và cayBan() cố ý không thấy**
  Người dùng thấy gì: Bằng chứng dùng để duyệt tính năng này có thể đang phản ánh một phiên bản cố tình làm hỏng, không phải bản sản phẩm thật đang chạy, nên người duyệt có thể tin nhầm là tính năng đã đạt trong khi nó chưa chắc đạt.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: high
  Đề xuất: new-contract

- **Bài kiểm của packages/ui nhập thẳng component của apps/app — ngược chiều phụ thuộc gói**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; nhưng cách viết kiểm thử hiện tại có thể khiến lỗi kiểu dữ liệu ở màn hồ sơ không bị phát hiện trước khi phát hành, làm tăng nguy cơ lỗi hiển thị lọt ra ngoài.
  file: `packages/ui/test/khai-tieng.spec.tsx`
  severity: high
  Đề xuất: new-contract

- **Chân đo đọc cột Json activity.meta không qua parse, trái luật "parse at the boundary" của AGENTS.md**
  Người dùng thấy gì: Nếu dữ liệu công ty thiếu một số thông tin, công cụ kiểm tra tự động có thể bị dừng đột ngột thay vì báo rõ lý do, làm chậm việc xác nhận tính năng đã hoạt động đúng.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **dat() sửa dữ liệu thật trong DB dev nhưng nhiều đường thoát bỏ qua don(), không có try/finally**
  Người dùng thấy gì: Quá trình kiểm thử tự động có nguy cơ ghi đè vĩnh viễn thông tin thật của một công ty và một liên hệ trong hệ thống thử nghiệm nếu quá trình đó bị gián đoạn, khiến dữ liệu gốc không thể khôi phục lại.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/du-lieu-thu.mjs`
  severity: medium
  Đề xuất: new-contract

- **mot-duong.mjs không kiểm nguồn nhập ForeignText và miễn trừ cả tệp layout.tsx thay vì ba chỗ hợp đồng nêu**
  Người dùng thấy gì: Công cụ kiểm tra hiện bỏ qua toàn bộ một tệp giao diện khi rà soát việc khai báo ngôn ngữ viết tay, nên nếu sau này có ai vô tình thêm một chỗ khai ngôn ngữ sai cách trong đúng tệp đó, nó có thể không bị phát hiện.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs`
  severity: low
  Đề xuất: known-limits

- **pha-thu.mjs overwrites the E11 evidence file with measurements taken on a deliberately broken tree**
  Người dùng thấy gì: Bằng chứng đang lưu cho tính năng này có dấu hiệu là số đo lấy từ những lần cố tình làm hỏng sản phẩm để thử nghiệm, không phải từ bản sản phẩm thật, nên người duyệt có thể đọc nhầm kết quả.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: high
  Đề xuất: new-contract

- **pha-thu.mjs mutates product source in the shared worktree with no crash-safe restore and no pre-run clean check**
  Người dùng thấy gì: Nếu quá trình thử nghiệm tự động bị dừng giữa chừng, mã nguồn thật của sản phẩm có thể bị bỏ lại ở trạng thái cố tình làm hỏng, ảnh hưởng đến bất kỳ ai khác đang xem hoặc đo sản phẩm cùng lúc trên cùng một bản sao.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: high
  Đề xuất: new-contract

- **Mutation pins for E1-E5, E7a-c, E8 and E9 match strings the rig prints on a green run**
  Người dùng thấy gì: Phần lớn các phép thử "phải báo lỗi khi bị phá" trong bộ kiểm tra hiện chỉ chứng minh được rằng có lỗi xảy ra, chứ chưa chắc chứng minh được rằng lỗi đó đúng là do phần bị phá, làm giảm độ tin cậy của bằng chứng nói tính năng chịu được các trường hợp bị phá.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: high
  Đề xuất: new-contract

- **mot-duong.mjs counts FILES, not the nine places — a removed declaration inside a multi-declaration file is invisible**
  Người dùng thấy gì: Không có hậu quả thực tế cho người dùng; số lượng chín chỗ đã được chốt là đếm theo tệp giao diện, đúng như đã thống nhất khi ký hợp đồng, nên đây không phải là một khoảng hở.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs`
  severity: medium
  Đề xuất: wont-fix

- **khai-tieng-ho-so.mjs leaks seeded test data on every non-happy exit, and the next run snapshots the poisoned value as the original**
  Người dùng thấy gì: Nếu quá trình thử nghiệm tự động bị gián đoạn, thông tin mẫu chèn vào để thử có thể còn sót lại vĩnh viễn trên một công ty thật trong hệ thống thử nghiệm, và lần chạy thử tiếp theo có thể vô tình biến dữ liệu sai đó thành dữ liệu "gốc" mới.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: medium
  Đề xuất: new-contract

- **E3's nganh check inspects one company while evals.yaml promises the whole set, and the evidence in the tree has a shape no committed code produces**
  Người dùng thấy gì: Phép kiểm cho việc khai ngôn ngữ của trường ngành nghề hiện chỉ thử trên một công ty thay vì một tập hợp nhiều công ty, và có dấu hiệu bằng chứng đã lưu không khớp với những gì công cụ hiện tại thực sự tạo ra — nên độ tin cậy của bằng chứng này cần được xem lại.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: medium
  Đề xuất: new-contract

- **E8's promised "Gioi thieu section absent from the DOM" assertion is never implemented; the captured text is discarded**
  Người dùng thấy gì: Phép kiểm cho trường hợp công ty chưa có đủ thông tin mới chỉ xác nhận không có nội dung tiếng Anh rỗng xuất hiện, chứ chưa xác nhận rằng khối giới thiệu thực sự biến mất khỏi màn hình thay vì chỉ bị ẩn đi bằng cách trình bày.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **khong-khai-thua silently skips the chuc-danh dimension, and dereferences a possibly-null company**
  Người dùng thấy gì: Phép kiểm việc không khai thừa ngôn ngữ cho chức danh liên hệ có thể tự động bỏ qua kiểm tra và vẫn báo đạt khi dữ liệu thử không có chức danh, nên khoảng đó có thể chưa từng được xác nhận.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **datDuGiaiDoan double-skips candidate deals and can break early while logging that coverage was achieved**
  Người dùng thấy gì: Bước chuẩn bị dữ liệu thử cho các giai đoạn thỏa thuận có thể báo đã đủ dữ liệu để thử trong khi thực ra còn thiếu, khiến phép kiểm tiếp theo chạy trên một tập dữ liệu không đầy đủ như đã báo.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/du-lieu-thu.mjs`
  severity: medium
  Đề xuất: known-limits

- **MetaLine deduplication keeps the undeclared duplicate and drops the one carrying lang**
  Người dùng thấy gì: Trong một số trường hợp trùng chữ hiếm gặp (ví dụ một địa danh và một tên ngành nghề trùng nhau), phần đánh dấu tiếng Anh cho một trong hai giá trị đó có thể bị mất khi hệ thống gộp các dòng thông tin trùng lặp lại với nhau.
  file: `apps/app/components/crm/record-sheet/record-parts.tsx`
  severity: low
  Đề xuất: known-limits

- **hoi-quy-nam-cho.mjs swallows the old rig's stderr**
  Người dùng thấy gì: Khi công cụ kiểm tra hồi quy gặp lỗi, một phần thông tin chẩn đoán lỗi bị bỏ qua, khiến việc tìm nguyên nhân sự cố chậm hơn cần thiết — không ảnh hưởng trực tiếp đến người dùng.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs`
  severity: low
  Đề xuất: known-limits

- **Vật đo E11 bị chính vòng đột biến ghi đè — evidence/vung-khai.json là hỗn hợp cây lành và cây đã phá**
  Người dùng thấy gì: Tệp bằng chứng đang dùng để xét duyệt tính năng này là một hỗn hợp giữa số đo trên bản sản phẩm thật và số đo trên các bản bị cố tình làm hỏng để thử nghiệm, nên một số kết luận trong đó có thể không phản ánh đúng trạng thái thật của sản phẩm.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: high
  Đề xuất: new-contract

- **Assertion âm-tính-một-mình: 10/13 chuỗi ghim của pha-thu được in ra vô điều kiện, cột "thông điệp có ghim" không chứng minh gì**
  Người dùng thấy gì: Phần lớn thông điệp dùng để chứng minh "lỗi xảy ra đúng chỗ đã phá" trong bộ kiểm tra thực ra được in ra bất kể có lỗi hay không, nên bảng kết quả trình cho người duyệt không thực sự phân biệt được phép kiểm bắt đúng lỗi hay chỉ ngẫu nhiên báo lỗi.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: high
  Đề xuất: new-contract

- **Tuyên quét LỚP nhưng chỉ có điểm-case: chặn "nganh" đo đúng một công ty thay vì tập giá trị industry**
  Người dùng thấy gì: Phép kiểm cho việc khai ngôn ngữ của trường ngành nghề chỉ xác nhận trên một giá trị ngành nghề duy nhất, nên một giá trị ngành nghề khác chưa được khai đúng có thể không bị phát hiện.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: high
  Đề xuất: known-limits

- **Chặn "ho-so-trong" thiếu hẳn assertion đã hứa về khối Giới thiệu vắng khỏi DOM**
  Người dùng thấy gì: Giống một khoảng hở khác đã ghi nhận: phép kiểm cho công ty chưa đủ thông tin chưa thực sự xác nhận khối giới thiệu biến mất khỏi màn hình, chỉ xác nhận không có nội dung tiếng Anh rỗng.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **Chiều "chức danh" của chặn chống-khai-thừa im lặng bỏ qua khi dữ liệu thiếu, thay vì báo tiền đề thiếu**
  Người dùng thấy gì: Giống một khoảng hở khác đã ghi nhận: phép kiểm không khai thừa ngôn ngữ cho chức danh liên hệ có thể im lặng bỏ qua khi dữ liệu thử không có chức danh, vẫn báo đạt.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **Phép quét "0 chỗ khai lang viết tay" chỉ đi trên tệp đã theo dõi git, tệp mới chưa add lọt lưới**
  Người dùng thấy gì: Phép rà soát toàn bộ giao diện tìm chỗ khai ngôn ngữ viết tay chỉ xét những tệp đã được đưa vào hệ thống quản lý phiên bản, nên một tệp mới viết mà chưa được đưa vào có thể lọt qua vòng rà soát này.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs`
  severity: medium
  Đề xuất: known-limits

- **Vòng đột biến phá mã ngay trên cây làm việc chung và đo qua máy chủ dev dùng chung, không phải bản sao riêng**
  Người dùng thấy gì: Việc thử cố tình làm hỏng từng phần sản phẩm để kiểm tra hiện chạy trực tiếp trên bản đang dùng chung, không phải trên một bản sao riêng, nên trong lúc thử, bất kỳ ai khác đang xem hoặc đo sản phẩm cùng lúc có thể thấy phiên bản đã bị cố tình làm hỏng.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bài kiểm E7 không đo dạng part chuỗi trần mà `expected` gọi tên**
  Người dùng thấy gì: Không có hậu quả thực tế: hợp đồng đã chốt lại để không còn nhận dạng dữ liệu kiểu chuỗi trần cho dòng thông tin này nữa, nên việc kiểm tra không thử dạng đó là đúng với thoả thuận hiện hành, không phải một khoảng hở.
  file: `packages/ui/test/khai-tieng.spec.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
