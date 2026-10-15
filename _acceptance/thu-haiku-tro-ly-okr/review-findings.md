## Trong hợp đồng

- **Bước kiểm model của nhánh Trợ lý OKR chỉ đọc một lần chụp đầu tiên, không phải mọi sự kiện model.phien-chon** — `_acceptance/thu-haiku-tro-ly-okr/rang/so-mo-hinh.mjs:84` — severity: medium — source: bugs — AC: AC-7
  Trong canhModel, vòng `while (!dung && thay.ma.length === 0)` thoát ngay khi lần query đầu tiên trả về ít nhất một hàng. Sau đó tập `thay.ma` không bao giờ được làm mới. Vì vậy kiemModel (dòng 121-127) chỉ so model của các sự kiện đã có ở lần chụp đầu, thường chỉ là phiên đầu tiên của nhánh. Một phiên về sau ghi model khác thì không bị phát hiện, và nhánh vẫn được báo là đo đúng model. Ví dụ ở nhánh Haiku: một phiên gốc không mang purpose okr sẽ ghi google/gemini-3.8-flash, vì kho đo được gieo model đó. Điều này trái với lời hứa của E7: «mã model của các sự kiện model.phien-chon ... phải trùng model của nhánh». Cách sửa: thăm dò tiếp tới khi gọi `dung()` và gộp tập mã qua mọi lần thăm dò, đừng dừng ở lần đầu thấy hàng.
  Lý do vào hợp đồng: AC-7 đòi đọc lại mã model đã chạy ở mỗi nhánh và thoát 2 khi khác model của nhánh; chỉ xét lần chụp đầu thì một phiên sau ghi model khác lọt qua.

- **Hình dạng 2 (fixture viết tay, không đi qua bên viết): E2 đưa `muc` thẳng vào hàm nên không đo trần Haiku trên đường nạp mô-đun thật** — `apps/agent/test/tro-ly-okr-mo-hinh-thu.integration.spec.ts:86` — severity: high — source: measurement — AC: AC-2
  chayVai truyền `muc` tự tay vào `moHinhTroLyOkr({}, gw.tao, undefined, muc)` (dòng 86) và `modelChoBuocGoc(ctxOkr, gw.tao, {}, muc)` (dòng 95). Trong tiến trình test, MO_HINH_DANG_CHAY là Gemini, nên với HAIKU thì `muc === MO_HINH_DANG_CHAY` sai và mo-hinh.ts:61-63 rẽ sang `dungKepTran(muc.tranRaMoiLoiGoi)`. Đường chạy thật lúc nạp với TRO_LY_OKR_MO_HINH=haiku lại đi qua `kepTranRaMoiLoiGoi` (mo-hinh.ts:46-48) mà test chưa lần nào chạm tới. Tiến trình con (support/mo-hinh-thu-moi.ts) chỉ in modelId, không in trần. Hệ quả: đổi thành `kepTranRaMoiLoiGoi = dungKepTran(TRO_LY_OKR.tranRaMoiLoiGoi)` (Haiku bị kẹp ở 2000, đúng lỗi lượt 14/10) thì cả thk-mac-dinh lẫn thk-haiku vẫn xanh. Lời hứa «trần góp ý 4000 khi nạp với biến» chưa được đo qua bên viết thật (giá trị chọn lúc nạp).
  Lý do vào hợp đồng: AC-2 hứa trần góp ý 4 000 khi nạp mô-đun với biến đặt; bài kiểm đưa mục thẳng vào hàm nên đường nạp thật không được đo.

- **Hình dạng 5 (tuyên quét lớp mà ô có hai phía cùng hằng): cửa sổ ngữ cảnh của vai góp ý và tóm tắt là null == null** — `apps/agent/test/tro-ly-okr-mo-hinh-thu.integration.spec.ts:116` — severity: high — source: measurement — AC: AC-2
  Hợp đồng E1/E2 đòi kiểm cửa sổ (1048576 / 1000000) cho cả 4 vai. Nhưng chayVai gán cứng `cuaSo: null` cho gopY (dòng 87) và tomTat (dòng 92), còn cuaSoMong trả null cho hai vai đó (dòng 116). Phép so `ket.cuaSo !== cuaSoMong(...)` ở hai ô này vì vậy luôn đúng, như một mệnh đề hằng. Hai dòng code của diff đặt cửa sổ cho đúng hai vai này là `modelContextWindowTokens: MO_HINH_DANG_CHAY.cuaSoNguCanh` ở subagents/tro_ly_okr/agent.ts:20 (vai góp ý) và chon-mo-hinh.ts:21 (vai tóm tắt). Cả hai không phép đo nào đọc, kể cả tiến trình con. Đổi một trong hai về TRO_LY_OKR.cuaSoNguCanh thì Haiku chạy với cửa sổ Gemini mà không assert nào đỏ.
  Lý do vào hợp đồng: AC-2 hứa cửa sổ ngữ cảnh 1 000 000 cho cả bốn vai; hai vai góp ý và tóm tắt được so null với null nên không được đo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Dấu vân tay mẫu kho đo chỉ băm mã model, bỏ sót cửa sổ ngữ cảnh và nội dung gieo-model-do.ts**
  Người dùng thấy gì: Nếu chỉ đổi cửa sổ ngữ cảnh của model đo, hoặc sửa bước gieo dữ liệu đo, kho đo cũ vẫn được dùng lại mà không báo gì. Người đo có thể đo trên cấu hình cũ mà tưởng là mới, cho đến khi tự xoá kho mẫu.
  file: `packages/db/scripts/measure-db.ts`
  severity: medium
  Đề xuất: known-limits

- **TRO_LY_OKR.model / cuaSoNguCanh / tranRaMoiLoiGoi thành khoá chết, trùng giá trị với moHinhThu.danhSach[0]**
  Người dùng thấy gì: Trong cấu hình còn ba giá trị cũ không còn tác dụng, nên ai chỉnh trần ở đó sẽ thấy không có gì đổi. Báo cáo quý 4 vẫn ghi tên Gemini kể cả khi đang chạy thử Haiku.
  file: `apps/agent/agent/lib/okr/config.ts`
  severity: medium
  Đề xuất: known-limits

- **model_evals khai trùng thu-haiku-tro-ly-okr/E7 hai lần trong cùng danh sách**
  Người dùng thấy gì: Cấu hình có một dòng bị lặp. Không ảnh hưởng gì tới người dùng, chỉ có thể làm người đọc cấu hình hiểu nhầm.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: wont-fix

- **Nhánh Tác nhân chỉ kiểm ô AppSetting, không kiểm model thật đã chạy, nên lùi ngầm về GLM vẫn được tính là Haiku hay Gemini**
  Người dùng thấy gì: Khi so sánh model cho Tác nhân dựng bộ, nếu model được chọn không có trong danh mục thì hệ thống lặng lẽ chạy model mặc định mà bảng kết quả vẫn ghi là Haiku hay Gemini. Kết luận đạt hay không đạt có thể gán nhầm model.
  file: `_acceptance/thu-haiku-tro-ly-okr/rang/so-mo-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Vân tay mẫu kho đo chỉ băm mã model, không băm cửa sổ ngữ cảnh hay tệp gieo, nên đổi contextWindowTokens không dựng lại mẫu**
  Người dùng thấy gì: Đổi cửa sổ ngữ cảnh của model đo mà không đổi mã model thì kho đo cũ vẫn được dùng lại, dù tài liệu nói mẫu được dựng lại khi có thay đổi. Số đo có thể lệch mà không ai hay.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận thiếu ô): ghiModelPhien chỉ được đo cho nguồn env rỗng, thiếu nguồn Gemini tường minh**
  Người dùng thấy gì: Khi đặt Gemini một cách tường minh, chưa có phép đo xác nhận hệ thống ghi đúng tên model vào nhật ký phiên. Nếu sai, nhật ký đo có thể ghi nhầm model.
  file: `apps/agent/test/tro-ly-okr-mo-hinh-thu.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (đáp án lấy từ chính bên đọc, không lấy từ bên viết): bảng ký hiệu→trạng thái của eve nhập từ doc-so.mjs**
  Người dùng thấy gì: Bài kiểm bộ đọc kết quả dùng chính bảng của bộ đọc làm đáp án, nên nếu ai đảo nhầm đạt và trượt thì bài kiểm vẫn xanh. Hiện bảng đang đúng.
  file: `_acceptance/thu-haiku-tro-ly-okr/rang/doc-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): 'ghi bằng writeAgentModel' được chứng minh bằng grep mã nguồn**
  Người dùng thấy gì: Việc kho đo ghi model qua đúng đường chuẩn chỉ được kiểm bằng cách đọc chữ trong mã. Một cách ghi khác vẫn cho cùng kết quả sẽ không bị phát hiện, nhưng người dùng không thấy khác biệt.
  file: `packages/db/test/measure-db-model.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo nhãn thay vì đầu ra): tiến trình con đọc modelId của lớp bọc, không đọc mã gửi tới Gateway**
  Người dùng thấy gì: Phép đo ở tiến trình con xác nhận tên model gắn trên lớp bọc chứ không phải tên model thật gửi đi. Hiện hai tên luôn khớp nhau nên người dùng không bị ảnh hưởng.
  file: `apps/agent/test/support/mo-hinh-thu-moi.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
