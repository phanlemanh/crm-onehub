# Review findings: zalo-hoi-okr-khong-chet (round 2)

## Trong hợp đồng

- **Hình dạng 3 — Kiểm «có chuỗi» trong khi lời hứa là «chỉ đúng dòng đó»: .env.example**
  AC: AC-4
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/pham-vi.mjs:97`
  severity: medium
  source: measurement
  detail: AC-4 và E4 hứa .env.example chỉ có dòng THÊM khai TRO_LY_OKR_BO_DE kèm ghi chú («chỉ có đúng một dòng thêm khai»). Code chỉ kiểm hai điều: không có dòng bỏ (CHI_THEM, dòng 25/90-91) và `them.some((d) => d.includes(BIEN_BO_DE))` (dòng 97). Thêm bất kỳ biến mới nào khác vào .env.example cùng vòng vẫn xanh, miễn là một dòng nào đó có tên biến. Quan hệ «tập dòng thêm = đúng khối khai báo đó» không được đo, khác với DONG_THEM (dòng 92-96), nơi số dòng được ghim.

- **Hình dạng 4 — Đối chứng đã khai cho E4 không được dựng: các luật theo dòng không có chiều đỏ**
  AC: AC-4
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/pham-vi.mjs:62`
  severity: medium
  source: measurement
  detail: E4 expected khai đối chứng «trong cùng lệnh, trên danh sách dựng sẵn» cho .env.example, _acceptance/tro-ly-okr-nen/run-log.jsonl, _acceptance/tro-ly-okr-nen/evidence-report.md và okr-uy-quyen.spec.ts, kèm câu «thiếu một đối chứng thì exit 1». doiChung() ở dòng 62-75 chỉ dựng hai loại: danh sách rỗng và ba tệp ngoài ranh giới. Các luật theo dòng ở dòng 90-123 (CHI_THEM, DONG_THEM, .env.example, ma trận spec, run-log kind repin, evidence-report) không có đầu vào hỏng dựng sẵn nào chứng minh chúng đỏ được. Thêm nữa, diff hiện tại không chạm _acceptance/tro-ly-okr-nen/*, nên hai nhánh run-log/evidence-report (dòng 104-123) chưa chạy lần nào. «PHAM VI: 23 tep, 0 ngoai ranh gioi» xanh không phân biệt được «luật đúng» với «luật không bao giờ bắn».

- **Hình dạng 3 — evidence-report: kiểm «dòng thêm có mặt trong văn bản sau ### Re-pin đầu tiên» thay cho quan hệ «một mục Re-pin mới ở cuối»**
  AC: AC-4
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/pham-vi.mjs:118`
  severity: low
  source: measurement
  detail: Dòng 118 lấy `chu.slice(chu.indexOf("### Re-pin"))`, tức từ mục Re-pin ĐẦU TIÊN. Tệp _acceptance/tro-ly-okr-nen/evidence-report.md đã có hai mục («### Re-pin lần 1» dòng 325, «lần 2» dòng 329). Dòng 121 chỉ đòi mỗi dòng thêm là chuỗi con của đoạn đó, nên một dòng chèn thêm vào giữa Re-pin lần 1 hay lần 2 cũ vẫn qua. Script không kiểm rằng phần thêm là đúng một mục «### Re-pin» mới nằm ở cuối, như E4/AC-4 hứa. Nếu không có «### Re-pin» nào, indexOf trả -1 và slice(-1) chỉ còn ký tự cuối, nhưng nhánh đó hiện không với tới được.

- **Hình dạng 4 — E8 --ep không kiểm rằng công tắc đã tắt công cụ đè: lượt xanh không phân biệt được với E1**
  AC: AC-7
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/c33.mjs:63`
  severity: low
  source: measurement
  detail: epGoi() (dòng 109-133) truyền TRO_LY_OKR_BO_DE=1 rồi đạt khi có một lượt goiCon. Nó dùng nguyên loiCuaLuotXanh của E1 và không có phép kiểm nào cho thấy công cụ đè thật sự vắng trong lượt đó. coGoi (dòng 63, dựa trên GOI_CONG_CU/XONG_CONG_CU ở dòng 18-19, tức lệnh gọi công cụ đè `→ tro_ly_okr`) được tính nhưng không dùng ở đâu. Chính E1/contract ghi rằng model vẫn có thể gọi subagent thật khi công cụ đè có mặt («co goi subagent: <k>/6»). Vậy nếu biến không tới được tiến trình eve dev, E8 vẫn có thể in «EP: luot n goi subagent that» và thoát 0. Vế Given của AC-7, «công cụ đè tắt», không được đo; ít nhất phải đòi !coGoi ở lượt được tính.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Executor chạm CSDL chạy `bun test` trần, không qua `bun run test --`**
  Người dùng thấy gì: Hai lượt kiểm tra chạy cùng lúc có thể ghi đè dữ liệu của nhau, làm kết quả kiểm tra đỏ hoặc xanh nhầm. Người dùng cuối không bị ảnh hưởng, chỉ độ tin cậy của phép đo.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **pham-vi.mjs chép cứng tên biến công tắc và danh sách purpose thay vì import**
  Người dùng thấy gì: Nếu sau này đổi tên công tắc hoặc thêm một loại phiên mới, bước kiểm tra phạm vi có thể lệch mà không báo đỏ. Hiện chưa gây sai cho người dùng.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/pham-vi.mjs`
  severity: low
  Đề xuất: known-limits

- **E8 (zhok_ep) calls the real model but is missing from feature_loop.model_evals, so a repin can quietly re-run it until it gets a good draw**
  Người dùng thấy gì: Khi ghim lại hồ sơ, phép đo dùng model thật có thể bị chạy lại cho tới khi gặp lượt may mắn, nên kết quả xanh có thể đẹp hơn thực tế. Không ảnh hưởng trực tiếp tới người hỏi qua Zalo.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **c33.mjs counts messages by splitting the Markdown answer cell on ' / ', so one answer that contains '/' or '|' is miscounted as two and fails**
  Người dùng thấy gì: Nếu bot trả lời đúng một tin nhưng trong tin có dấu gạch chéo, phép kiểm tra có thể báo nhầm là gửi hai tin. Người dùng vẫn nhận đúng một câu trả lời.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/c33.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
