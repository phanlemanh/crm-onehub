# Review findings: tac-nhan-glm-5-3-cham (round 1)

## Trong hợp đồng

- **Câu expected của E5 lệch với danh sách cho phép của thước (PRODUCT-MAP.md, LO-TRINH.html)**
  AC: AC-5
  file: `_acceptance/tac-nhan-glm-5-3-cham/evals.yaml:37`
  severity: low
  source: conventions
  detail: E5 expected và AC-5 trong contract.md đều nói diff chỉ gồm tệp dưới _acceptance/tac-nhan-glm-5-3-cham/ và _acceptance/config.yaml. Còn SO.choPhep (so-tac-nhan.ts:31-35) cho phép thêm PRODUCT-MAP.md và LO-TRINH.html, và diff của nhánh có đổi đúng hai tệp đó. Ngoại lệ có dòng sổ fix d-20261016T080930Z-11, nhưng câu expected và AC-5 không được cập nhật theo, nên người đọc thẻ thấy lời hứa hẹp hơn thứ thước thật sự chấp nhận.
  rationale: AC-5 hứa không tệp nào ngoài thư mục hồ sơ và config.yaml bị đổi, trong khi diff thật đổi PRODUCT-MAP.md và LO-TRINH.html và thước cho qua.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E1 hứa một chiều đỏ «sửa số bước trong jsonl → lech aichiphi» mà thước không có và cũng không thể có**
  Người dùng thấy gì: Một câu trong phép chấm hứa bắt được trường hợp ai đó sửa tay số bước của phiên con, nhưng thực tế phép chấm không bắt được trường hợp đó. Số liệu hiện có vẫn đúng; chỉ là lời hứa ghi rộng hơn khả năng thật.
  file: `_acceptance/tac-nhan-glm-5-3-cham/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Thước E3 coi Gateway lỗi là «Gateway không trả token suy luận» và vẫn thoát 0; do-suy-luan.ts ép kiểu phản hồi và nuốt lỗi parse**
  Người dùng thấy gì: Nếu đo lại phép dò suy luận lúc cổng AI báo lỗi hoặc hết ngân sách, báo cáo sẽ ghi nhầm là cổng không trả số liệu và vẫn xanh. Kết quả đã lưu hôm nay là đúng.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **do-tac-nhan.ts sửa tạm tệp sản phẩm đang theo dõi mà không bắt tín hiệu ngắt, trái nếp của chính helper nó dùng**
  Người dùng thấy gì: Nếu người chạy bài đo bấm dừng giữa chừng, một tệp sản phẩm có thể bị để lại ở bản sửa tạm và kho dữ liệu đo không được dọn. Người dùng sản phẩm không bị ảnh hưởng, chỉ người chạy đo phải tự hoàn lại.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/do-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Kiểm «sai model» luôn qua vì cột model trong jsonl chép từ kế hoạch, không đo từ lượt chạy thật**
  Người dùng thấy gì: Bài đo không chứng minh được từng phiên đã thật sự chạy đúng model đã định, nếu hệ thống âm thầm rơi về model mặc định. Nhật ký không cho thấy dấu hiệu rơi model nên số liệu có khả năng đúng, nhưng chưa được chứng.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/do-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **--pham-vi bỏ qua mã thoát của git: merge-base hỏng thì danh sách rỗng và exit 0**
  Người dùng thấy gì: Nếu chạy phép kiểm phạm vi ở nơi thiếu nhánh gốc, nó báo đạt dù chưa so được gì. Khi chạy đúng trong kho thì kết quả vẫn đúng.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **E1 hứa chiều đỏ «sửa một số bước trong jsonl → lech aichiphi», nhưng chiều đó không có trong bộ so**
  Người dùng thấy gì: Một phép thử đỏ được ghi trong phép chấm thực ra không tồn tại, nên việc sửa tay số bước sẽ không bị phát hiện bằng đường đó. Số liệu hiện tại không bị ảnh hưởng.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Phép dò suy luận không xét HTTP status: Gateway trả lỗi bị in thành «chua kiem duoc» với exit 0**
  Người dùng thấy gì: Khi cổng AI trả lỗi lúc đo lại, báo cáo ghi nhầm là chưa kiểm được thay vì báo lỗi gọi. Kết quả đã lưu không bị sai.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): chặn «PHIEN CON CHAY SAU HUY» không bao giờ bắn được vì `at` của aiChiPhi lệch 7 giờ so với ket_thuc**
  Người dùng thấy gì: Phép kiểm phát hiện phiên con còn chạy sau khi bài đo đã huỷ thực tế không bao giờ báo, nên dòng «đạt» của nó chưa chứng minh gì. Các số bước và giây đo được vẫn dùng được.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): ô `model` trong tac-nhan.jsonl chép từ kế hoạch, không phải giá trị đọc lại, nên kiểm «sai model» so kế hoạch với chính nó**
  Người dùng thấy gì: Phần kiểm «sai model» không bao giờ có thể báo sai vì nó so kế hoạch với chính kế hoạch. Việc bảo đảm đúng model chỉ dựa vào bước đọc lại cấu hình trước mỗi lượt.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/do-tac-nhan.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): chiều đỏ «sai model» và «bi cat» sửa tay dòng jsonl thành trạng thái mà bên ghi không thể sinh ra**
  Người dùng thấy gì: Một số phép thử đỏ chỉ chứng minh bộ đọc phản ứng với dữ liệu viết tay, chưa chứng minh bắt được lượt chạy thật bị lỗi. Kết quả đo hiện có không đổi.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ giữa giá trị nhưng không đo): số bước, token, giây của phiên con không có trong jsonl để «toEqual», và chiều đỏ «lech aichiphi» đã khai không tồn tại**
  Người dùng thấy gì: Việc số liệu phiên con khớp với sổ chi phí gốc chỉ được giữ gián tiếp qua bảng tổng hợp, không có phép so trực tiếp. Số hiện tại vẫn tính lại được.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (quan hệ không đo): «băm bản đã commit» chỉ so jsonl với ke-hoach.json, cả hai do cùng bên ghi sinh ra, không so với agent.ts đã commit**
  Người dùng thấy gì: Phép kiểm không tự chứng minh các lượt đo chạy trên bản mã đã commit; nếu có sửa chưa commit lúc đo nó vẫn báo đạt. Hiện tại bản mã khớp nên kết quả không sai.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận viết trước nhưng chỉ kiểm một chiều, bảng lấy từ bằng chứng): tập (biến thể, lượt) không được toEqual**
  Người dùng thấy gì: Phép kiểm ma trận lượt đo không bắt được hàng thừa hoặc biến thể bị bỏ khỏi kế hoạch. Bảng hiện có chưa bị chỉ ra là sai.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): «đọc lại model trước eval» được chứng bằng grep chuỗi trong mã nguồn hiện tại, không gắn với lượt nào**
  Người dùng thấy gì: Dòng báo «đã đọc lại model trước mỗi lượt» thực ra chỉ xác nhận mã có bước đó, không xác nhận từng lượt đã chạy. Hợp đồng vốn chấp nhận cách chứng này nên không cần sửa.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/15 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tac-nhan-glm-5-3-cham/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

