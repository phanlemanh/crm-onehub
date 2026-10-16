# Review findings: thu-haiku-tro-ly-okr (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Model, context window and output cap are now set in two places in TRO_LY_OKR, and the top-level copies no longer reach runtime**
  Người dùng thấy gì: Mã model và trần đầu ra của Trợ lý OKR được khai ở hai chỗ. Sau này ai chỉnh bản không được dùng thì bài kiểm vẫn xanh còn Trợ lý chạy ngoài đời thì không đổi gì.
  file: `apps/agent/agent/lib/okr/config.ts`
  severity: medium
  Đề xuất: known-limits

- **Measure database copies the OKR model id and context window as literals in packages/db, with nothing tying them to the agent config**
  Người dùng thấy gì: Kho đo ghi cứng tên model riêng, không gắn với cấu hình của Trợ lý. Nếu sau này đổi model ở một bên mà quên bên kia, phép đo sẽ chạy nhầm model mà không ai được báo.
  file: `packages/db/src/measure-database.ts`
  severity: low
  Đề xuất: known-limits

- **docE24 bỏ qua lặng lẽ mọi dòng lượt hỏng có dấu ')' trong lý do, nên số lượt hỏng bị đếm thiếu và Haiku có thể bị xếp 'dat' sai**
  Người dùng thấy gì: Khi một lượt hỏng có lý do chứa dấu ngoặc đóng, bảng so sánh model có thể đếm thiếu lượt hỏng đó. Khi đó model có lượt hỏng vẫn có thể được ghi là đạt, nên người quyết cần liếc lại nhật ký gốc.
  file: `_acceptance/thu-haiku-tro-ly-okr/rang/doc-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (đáp án lấy từ chính bên đọc): bảng ký hiệu -> trạng thái của eve trong E6 nhập từ doc-so.mjs, là chính mô-đun đang bị kiểm**
  Người dùng thấy gì: Bài kiểm của bộ đọc kết quả lấy đáp án từ chính bộ đọc, nên nếu ai đảo nhầm qua/trượt thì bài kiểm vẫn xanh. Bảng so sánh model khi đó có thể đọc ngược mà không bị bắt.
  file: `_acceptance/thu-haiku-tro-ly-okr/rang/doc-so.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (đáp án lấy theo khuôn bên làm): mã model mong đợi của E1–E4 đọc từ config.ts, không phải chuỗi viết trước**
  Người dùng thấy gì: Bài kiểm lấy tên model mong đợi từ chính cấu hình, nên lỡ ai đổi model mặc định của Trợ lý sang cái khác mà giữ nguyên các trần thì bài kiểm vẫn xanh.
  file: `apps/agent/test/tro-ly-okr-mo-hinh-thu.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo nhãn thay vì đầu ra): tiến trình con của E2 đọc modelId của lớp bọc, không đọc mã model thật gửi tới Gateway**
  Người dùng thấy gì: Ở một vai, bài kiểm đọc nhãn model chứ không phải model thật gửi đi. Một lỗi dựng sai có thể lọt qua bài kiểm dù Trợ lý gọi nhầm model.
  file: `apps/agent/test/support/mo-hinh-thu-moi.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): vai phiên gốc của E1/E2 đọc providerOptions và mã model đã khai, không bắt ở lời gọi thật**
  Người dùng thấy gì: Với phiên chính của Trợ lý, bài kiểm chỉ đọc phần cấu hình khai báo chứ không bắt lời gọi thật. Cam kết không lưu dữ liệu ở vai này chỉ được kiểm trên giấy.
  file: `apps/agent/test/tro-ly-okr-mo-hinh-thu.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận thiếu ô): ghiModelPhien của E1 chỉ đo cho nguồn env rỗng, thiếu nguồn Gemini tường minh**
  Người dùng thấy gì: Khi chọn Gemini ghi rõ bằng biến môi trường, việc ghi tên model vào phiên chưa được kiểm riêng. Nếu hỏng thì nhật ký phiên có thể ghi sai model.
  file: `apps/agent/test/tro-ly-okr-mo-hinh-thu.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (bộ đếm ô không ghim vào số viết trước): `soO !== NGUON.length * VAI.length` luôn bằng nhau theo cách dựng**
  Người dùng thấy gì: Bài kiểm có một lưới kiểm số ô nhưng lưới này không bao giờ bắt được lỗi bỏ sót ô. Hậu quả với người dùng gần như không có, chỉ là độ chắc của bài kiểm thấp hơn vẻ ngoài.
  file: `apps/agent/test/tro-ly-okr-mo-hinh-thu.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assert âm tính một mình) và đáp án lấy từ bên làm: E5 chỉ kiểm model đo khác GLM, không ghim google/gemini-3.8-flash**
  Người dùng thấy gì: Bài kiểm kho đo chỉ chắc là model đo không còn là GLM, không chắc đúng là Gemini. Đổi nhầm sang model khác vẫn qua bài kiểm.
  file: `packages/db/test/measure-db-model.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): 'ghi bằng writeAgentModel' của E5 chứng minh bằng grep mã nguồn**
  Người dùng thấy gì: Bài kiểm xác nhận cách ghi model vào kho đo bằng cách đọc chữ trong tệp, không bằng cách chạy thật. Có thể đỏ giả hoặc xanh giả khi ai đó sửa cách viết.
  file: `packages/db/test/measure-db-model.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): nhánh Tác nhân của E7 kiểm model bằng cách đọc lại ô vừa tự ghi, không đọc model eve thật sự chạy**
  Người dùng thấy gì: Ở phép đo Tác nhân, chương trình chỉ đọc lại ô model vừa ghi, không xác nhận model thật sự chạy. Nếu Tác nhân lặng lẽ lùi về model mặc định thì bảng số vẫn ghi cho Haiku hoặc Gemini.
  file: `_acceptance/thu-haiku-tro-ly-okr/rang/so-mo-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
