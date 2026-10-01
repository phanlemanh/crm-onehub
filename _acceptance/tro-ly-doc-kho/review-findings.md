# Review findings: tro-ly-doc-kho (round 1)

## Trong hợp đồng

- **Zalo questions closed as trich-truot reach the health list with an empty question**
  file: `apps/agent/agent/lib/tai-lieu-hoi.ts:721`
  severity: low
  AC: AC-4
  source: bugs
  detail: A Zalo row is created by moHoiZalo without cauHoi. tuChoi fills cauHoi only from vao.cauHoi, which is optional, and the tro_ly_kho instructions ask for cauHoi only when loai is "khong-biet". When a Zalo answer is rejected tranBac times, nopTraLoi calls tuChoi(hoiId, "trich-truot", vao.cauHoi, now) with vao.cauHoi usually undefined, so the TU_CHOI row keeps cauHoi = null. TaiLieuHoiService.danhSachChuaTraLoi maps that to cauHoi ?? "" and suc-khoe.tsx renders it as the item title. The page owner or admin then gets a 'not answered' item with a blank title and cannot tell what was asked. The same happens on 'khong-biet' when the model leaves out cauHoi.
  rationale: AC-4 đòi hàng đóng 'từ chối' với lý do trich-truot phải giữ chữ câu hỏi; Notes cho phép lưu câu Zalo bị từ chối, mà hàng Zalo lại để cauHoi rỗng.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): sự kiện action.result của tro_ly_kho luôn mang isError boolean, trong khi eve không ghi isError khi phiên con xong**
  file: `apps/agent/test/tro-ly-kho-loi.spec.ts:110`
  severity: high
  AC: AC-13
  source: measurement
  detail: ketQuaCon() tự dựng {kind:"subagent-result", subagentName, isError, output} và ca «xong khong nop» (dòng 137) truyền isError:false. Bộ đọc ketQuaTroLyKho (apps/agent/agent/lib/tai-lieu-hoi-phien.ts:182-189) đòi isError: z.boolean() bắt buộc. Bên ghi thật của eve (node_modules/eve/dist/src/execution/delegated-parent-result.js, createDelegatedSubagentSuccessResult; cả session-callback-route.js) trả kết quả thành công KHÔNG có trường isError, và runtimeSubagentResultActionResultSchema khai isError là optional. Vậy ở đường thật safeParse trượt, hook dong-tro-ly-kho im lặng bỏ qua, hàng vẫn DANG_HOI (ở Zalo không có lối dongHoiKhoKhiPhienXong như CRM), mà test vẫn xanh vì fixture chép đúng khuôn của bộ đọc chứ không lấy từ bên ghi của eve. Ca 402 ở Zalo (tro-ly-kho-zalo.integration.spec.ts:289-300) cũng tự dựng sự kiện theo cùng cách.
  rationale: AC-13 đòi phiên con xong mà chưa nộp thì hàng đóng 'lỗi'; nếu bên ghi thật không có isError thì bộ đọc bỏ qua và hàng kẹt đang hỏi, còn test xanh nhờ fixture chép khuôn bên đọc.

- **Hình dạng 4 (khẳng định âm đứng một mình): «không dòng log nào mang chữ câu hỏi» không thể đỏ**
  file: `apps/api/test/tai-lieu-hoi.spec.ts:206`
  severity: high
  AC: AC-9
  source: measurement
  detail: Dòng 141-146 chỉ theo dõi Logger.prototype.log/warn/error của Nest, rồi dòng 206-207 khẳng định ghiLog.some(l => l.includes(c)) === false. Đoạn mã chạy giữa hai chỗ đó chỉ có db.taiLieuHoi.create và ghiKetQuaHoi của packages/db. Không tệp nào trong packages/db/src/tai-lieu-hoi.ts, tai-lieu-hoi.service.ts, hoi-kho.router.ts hay apps/agent/agent/lib/tai-lieu-hoi*.ts dùng Logger hay console. Bên agent ghi log bằng console.warn, nên bộ bắt này cũng không thấy. Vì thế ghiLog luôn rỗng, và không có đối chứng dương nào cho thấy bộ bắt đã thu được ít nhất một dòng. Một bản sao log nguyên câu hỏi bằng console hay từ phía agent vẫn qua test này.
  rationale: Vế 'không dòng log nào mang chữ câu hỏi hay câu trả lời' của AC-9 được đo bằng bộ bắt log không bao giờ thu được dòng nào, nên không chứng minh được AC.

- **Hình dạng 4 (khẳng định âm đứng một mình): «MODEL-VIET-XYZ lọt ra» đo một hàm không bao giờ nhận MOC làm đầu vào**
  file: `apps/agent/test/tro-ly-kho-nop.spec.ts:314`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Ở ca (ii), MOC chỉ được đưa vào nop_tra_loi dưới trường cauHoi của bản nộp khong-biet. Sau đó test tự gọi dungTuChoi(gan), mà dungTuChoi (packages/validation/src/tai-lieu-hoi.ts:283) chỉ đọc gan[].ten lấy từ kết quả tìm. Chuỗi MOC không có đường nào để vào đầu vào của hàm, nên expect(cauII.includes(MOC)).toBe(false) đúng theo cấu trúc. Chiều đỏ đã khai, «bản sao dùng lời từ chối từ chữ model», sẽ sửa bên dựng câu ở UI hay kênh, mà test không đi qua bên đó. Ca (i) và (iii) không có khẳng định MOC nào, ca (iii) cũng không gọi dungTuChoi, nên con số «3 ca x 3 khẳng định = 9» không có trong mã.
  rationale: AC-4 hứa người hỏi không nhận chữ nào do model viết; phép đo chạy một hàm mà chuỗi model viết không có đường vào nên không thể đỏ.

- **Hình dạng 2 (fixture viết tay): xacMinhDen ghi thẳng vào cột với giờ chép tay, không đi qua datXacMinh**
  file: `apps/agent/test/tro-ly-kho-nop.spec.ts:383`
  severity: medium
  AC: AC-5
  source: measurement
  detail: Test qua-hạn ghi xacMinhDen bằng db.taiLieuTrang.update với new Date(`${den}T12:00:00+07:00`), tức chép tay giờ của TAI_LIEU_API.gioXacMinh (apps/api/src/tai-lieu/tai-lieu-config.ts:20) thay vì gọi datXacMinh. Ở packages/validation/test/tai-lieu-hoi.spec.ts:262, phép đo thuần của cùng hàm lại mã hoá ngày bằng `T17:00:00.000Z` (nửa đêm giờ VN), khác hẳn khuôn bên ghi. Bên ghi đổi giờ thì không phép đo nào đổi màu. Với mốc 12:00 này, xacMinhDen không bao giờ trùng dauHomNay, nên chiều đỏ biên «dùng <=» khai trong E5 không có ô nào để lật. Phần đối chứng mà E5 hứa (tập trang quá hạn từ hàm của sucKhoe trên cùng dữ liệu bằng {trang 14/10}) và dòng cảnh báo đã dựng chứa «14/10/2026» cũng không được khẳng định: test chỉ so quaHan.map(slug) với một hằng.
  rationale: AC-5 đòi ngày quá hạn tính bằng cùng hàm với danh sách 'Quá hạn xác minh'; test chép tay giờ và không khẳng định sự trùng khớp đó.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): sandbox deny-all đo bằng regex trên mã nguồn sandbox.ts**
  file: `apps/agent/test/tro-ly-kho-ranh-gioi.spec.ts:101`
  severity: medium
  AC: AC-12
  source: measurement
  detail: expect(s.match(/networkPolicy: "deny-all"/g)?.length).toBe(3) đếm chữ trong tệp nguồn, trong khi E12 ghi rõ «Đọc bản dựng của eve (không grep mã nguồn)». Một bản sao vẫn giữ ba chuỗi đó nhưng tắt hiệu lực, ví dụ đặt chúng trong một object không được truyền cho defaultBackend hay bị ghi đè sau đó, vẫn xanh. Không có chỗ nào đọc cấu hình sandbox mà eve thật sự nạp.
  rationale: AC-12 đòi đọc bản dựng để xác nhận sandbox chặn mạng; test chỉ đếm chữ trong mã nguồn nên không chứng minh cấu hình hiệu lực.

- **Hình dạng 5 (tuyên quét lớp nhưng lấy tập chép tay): danh mục tool dựng sẵn lấy từ thư mục may_soan, không lấy từ eve**
  file: `apps/agent/test/tro-ly-kho-ranh-gioi.spec.ts:84`
  severity: medium
  AC: AC-12
  source: measurement
  detail: E12 hứa «mọi tool dựng sẵn của eve trong danh mục mặc định nằm trong tập đã tắt — test lấy danh mục từ eve, không viết tay». Nhưng tatPhaiCo = (await phanLoai(THU_MUC_MAY_SOAN)).tat lại là tập disableTool() chép tay của một subagent khác. eve xuất danh mục thật ở eve/tools/defaults (theo docs/concepts/default-harness.md). Khi eve thêm một tool dựng sẵn mới mà may_soan cũng chưa tắt, cả hai cùng hở và test vẫn xanh. Số khẳng định phụ thuộc thư mục may_soan chứ không bằng số phần tử của danh mục eve.
  rationale: AC-12 đòi mọi tool dựng sẵn bị tắt; tập đối chiếu lấy từ một subagent khác nên tool mới của eve cùng hở vẫn qua.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): «kết quả tới agent gốc không chứa chữ trang» chỉ đo khai báo outputSchema bằng giá trị viết tay**
  file: `apps/agent/test/tro-ly-kho-ranh-gioi.spec.ts:158`
  severity: medium
  AC: AC-12
  source: measurement
  detail: E12 hứa gieo NOIDUNG-TRANG-MOC vào một trang, chạy tro_ly_kho rồi khẳng định JSON.stringify kết quả trả về agent gốc không chứa chuỗi đó. Test không gieo trang nào và không chạy phiên. Nó chỉ gọi troLyKho.outputSchema.safeParse trên ba object tự viết. Đầu ra thật đi tới agent gốc không bị đo, kể cả nhánh lỗi: subagent-result với isError mang output {code, message}, không qua outputSchema, mà thông điệp lỗi của nop_tra_loi (kiemMotTrich, chi: tho) có chứa nguyên đoạn trang.
  rationale: AC-12 hứa kết quả trả về agent gốc không chứa chữ trang nào; test không chạy phiên nào, và nhánh lỗi có thể mang nguyên đoạn trang.

- **Hình dạng 3 (relation bị thay bằng tự kiểm hằng): câu gửi người hỏi tính từ lyDo của test, không từ hàng**
  file: `apps/agent/test/tro-ly-kho-loi.spec.ts:160`
  severity: medium
  AC: AC-13
  source: measurement
  detail: E13 hứa «câu đúng cho người hỏi bằng hằng hetTran hoặc chuaTraLoi» cho từng ca, tức một quan hệ giữa hang.lyDo và câu thật được gửi hay hiện ra. Dòng 160-162 lại gọi cauLoiHoi(lyDo) với lyDo là hằng mong đợi của chính test, và vế phải chép lại đúng phép ba ngôi bên trong cauLoiHoi. Khẳng định này không đọc hang.lyDo cũng không đọc đầu ra của kênh CRM hay UI, nên đường nối từ hàng tới câu có hỏng thì test vẫn không đỏ.
  rationale: AC-13 hứa câu cố định đúng theo lý do của hàng; test tính câu từ lý do mong đợi của chính nó nên không đo đường nối từ hàng tới câu.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): lượt Zalo của cham-bo-do dựng lại agent gốc từ chữ chỉ dẫn và regex mã nguồn, rồi đếm theo ý định gọi tool**
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts:372`
  severity: medium
  AC: AC-15
  source: measurement
  detail: E15 và AC-15 hứa hỏi lại «qua phiên agent gốc purpose zalo với model thật và Zalo giả», gắn nhãn chuyển hay không chuyển «theo có hàng TaiLieuHoi kênh ZALO hay không». luotHai lại dựng một lời gọi ai.generateText chỉ với system: CHI_DAN_ZALO, bỏ instructions.md gốc và các chỉ dẫn động khác của agent gốc. Tập tool do congCuGoc ghép (dòng 323-363), lấy description subagent bằng regex trên agent.ts (dòng 358) và đưa MỌI thư mục subagent ra, trong khi ZALO.hoi.congCu.subagent chỉ là ["tro_ly_kho"]. Lượt chỉ chạy stepCountIs(1), và dòng 380 gắn nhãn theo goi.includes("tro_ly_kho"), tức theo tên tool model định gọi, không theo hàng TaiLieuHoi được tạo. Tỉ lệ chuyển ≥90% và chuyển nhầm ≤10% vì thế đo một bản dựng lại từ chỉ dẫn, không đo phiên Zalo thật.
  rationale: AC-15 hứa hỏi lại qua phiên Zalo của agent gốc; script dựng lại từ chỉ dẫn và đếm theo tên tool định gọi, không đo phiên thật.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): vai okr ẩn tab Hỏi được đo bằng cách truyền tay coHoi**
  file: `apps/app/test/tai-lieu-hoi.dom.tsx:397`
  severity: medium
  AC: AC-7
  source: measurement
  detail: AC-7 hứa «người vai okr không thấy tab Hỏi». Test render DanhSach với coHoi={false} và coHoi={true} viết tay. Bên sinh ra giá trị đó là page.tsx:80 (const coHoi = vai ? !laVaiChiOkr(toWorkspaceRole(vai)) : false), và nó không được chạy. Đổi luật ánh xạ vai sang coHoi, như đảo điều kiện hay đổi vai, thì test vẫn xanh. man-hoi.mjs (E7u) cũng không có bước nào cho vai okr.
  rationale: AC-7 hứa người vai okr không thấy tab Hỏi; test truyền tay cờ coHoi nên đổi luật ánh xạ vai thì vẫn xanh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tai-lieu-hoi pulls tiptap/ProseMirror into the client bundle of the /tai-lieu list page**
  Người dùng thấy gì: Trang danh sách Kho tài liệu có thể tải chậm hơn trước một chút vì kéo thêm phần soạn thảo mà trang này không dùng. Chức năng vẫn chạy đúng.
  file: `packages/validation/src/tai-lieu-hoi.ts`
  severity: medium
  Đề xuất: known-limits

- **The hoi-kho AgentTask payload is written untyped by the API and parsed with a local schema in the agent**
  Người dùng thấy gì: Nếu sau này ai đó đổi cách hai phần của hệ thống trao nhau việc hỏi kho, câu hỏi có thể kẹt im lặng mà không báo lỗi. Hiện tại chưa có câu nào bị ảnh hưởng.
  file: `apps/agent/agent/lib/tai-lieu-hoi-phien.ts`
  severity: medium
  Đề xuất: known-limits

- **nop_tra_loi hard-codes limits that duplicate TAI_LIEU_HOI**
  Người dùng thấy gì: Các giới hạn độ dài của câu trả lời được ghi ở hai chỗ. Chỉ gây rắc rối khi ai đó muốn chỉnh giới hạn và quên một chỗ.
  file: `apps/agent/agent/subagents/tro_ly_kho/tools/nop_tra_loi.ts`
  severity: low
  Đề xuất: wont-fix

- **HE_SO_NFD redefined in the contracts file instead of coming from the area config**
  Người dùng thấy gì: Giới hạn độ dài câu hỏi và ghi chú dùng một hệ số chép riêng. Nếu hệ số chung đổi thì hai giới hạn này không đổi theo, nhưng người dùng không thấy khác biệt hôm nay.
  file: `apps/api/src/tai-lieu/tai-lieu-hoi.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **A 'kho' question goes straight to the root agent, and nothing blocks its CRM write and web tools**
  Người dùng thấy gì: Một thành viên có thể gõ vào tab Hỏi một câu được soạn khéo để trợ lý AI làm việc khác ngoài đọc kho, như sửa dữ liệu CRM hay ra mạng. Cần một rào chắn riêng, nên mở thành việc mới.
  file: `apps/agent/agent/lib/tai-lieu-hoi-phien.ts`
  severity: medium
  Đề xuất: new-contract

- **drainHoiKho drops send errors without logging them**
  Người dùng thấy gì: Khi trợ lý AI không mở được phiên, người hỏi vẫn thấy thông báo đúng, nhưng người vận hành không có dấu vết để biết vì sao.
  file: `apps/agent/agent/lib/tai-lieu-hoi-phien.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): ganNhat của ca (ii) chỉ kiểm có chứa một slug, không kiểm đúng tập theo thứ tự tìm**
  Người dùng thấy gì: Danh sách 'Trang gần nhất' khi bị từ chối có thể sắp xếp hay chọn trang không đúng thứ tự tìm được mà không có phép đo nào phát hiện. Người dùng thấy gợi ý kém chính xác hơn mong đợi.
  file: `apps/agent/test/tro-ly-kho-nop.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): thông điệp ca (b) và (d) chỉ kiểm có chứa «1,5%», không kiểm nêu nguyên đoạn đã nộp**
  Người dùng thấy gì: Khi trợ lý AI bị bác vì đoạn trích sai, thông báo có thể chỉ nêu con số mà không nhắc đủ đoạn đã nộp, nên khó biết chính xác đoạn nào bị bác.
  file: `packages/validation/test/tai-lieu-hoi.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
