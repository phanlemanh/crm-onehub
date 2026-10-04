# Bản đồ sản phẩm

> Bản đồ vẽ lại từ hồ sơ của xưởng mỗi lần một người ký một cổng — đừng sửa tay.
> (đọc từ thư mục `_acceptance/` và `.out-of-scope/`)
> Lộ trình: [LO-TRINH.html](LO-TRINH.html)

```mermaid
flowchart TD
  A["Đang cân nhắc cơ hội<br/>9 việc"] --> GD{"Cổng Đáng"}
  GD --> B["Sắp mở vòng<br/>chưa có"]
  GD --> XL["Xếp lại sau<br/>chưa có"]
  GD --> DB["Đã bác từ khám phá<br/>chưa có"]
  B --> CD["Chờ duyệt phạm vi<br/>chưa có"] --> GP{"Cổng Phạm vi"}
  GP --> DL["Đang làm<br/>1 việc"] --> GB{"Cổng Bằng chứng"}
  GB --> DG["Đã giao<br/>119 việc"]
  GB --> CN["Chờ phiên nghiệm thu<br/>30 việc"] --> GG{"Cổng Giá trị"}
  GG --> NT["Đã nghiệm thu giá trị<br/>1 việc"]
  HS["Hồ sơ hỏng<br/>1 việc"]
```

> **Bốn cổng người** — mỗi cổng là một câu hỏi chỉ người trả lời được:
> **Cổng Đáng** việc này có đáng làm không · **Cổng Phạm vi** bộ tiêu chí
> đã đủ và đúng chưa · **Cổng Bằng chứng** đã làm đúng thứ đã hứa chưa ·
> **Cổng Giá trị** thứ đã giao có ăn thua không.

## Đang cân nhắc cơ hội

- Trợ lý AI chỉ đổi trường của cả đội khi người yêu cầu là quản trị hoặc chủ — hôm nay thành viên thường nhờ trợ lý là thêm hay sửa được trường (`agent-doi-truong-theo-quyen`)
- Bộ cào nói ra khi hỏng MỘT PHẦN — hiện nó chỉ nói khi hỏng trọn vẹn (`bo-cao-noi-khi-hong-mot-phan`)
- Phép đo «bấm trong cột góp ý không đóng hộp» dựa trên ma trận trạng thái thẻ × đích bấm viết trước, không đếm ca bằng ngưỡng và không lặng lẽ bỏ đích thiếu (`ma-tran-bam-khong-dong-hop`)
- Người quyết mở rộng biết nhắm địa bàn nào — giao dịch và độ tập trung theo quận (`mo-o-dau`)
- Phân tích cấu hình bộ cào ở biên, thay vì chuyền dict thô từ TOML xuống chỗ dùng (`phan-tich-cau-hinh-bo-cao`)
- Cột góp ý của Trợ lý OKR cuộn riêng với form trong hộp sửa rộng, bỏ số đề xuất lặp hai lần, và hộp mở rộng không làm bố cục nhảy (`the-gop-y-cot-cuon-rieng`)
- Thẻ góp ý của Trợ lý OKR thôi để viền «ô được chỉ» kẹt sau khi thoát sửa, trả focus về thẻ, bỏ lời nhắc sai trong hộp Sửa KR, và làm dòng đã quyết đọc được (`the-gop-y-sua-nhanh`)
- Gợi ý thông tin của tác tử ở tab Tổng quan của Cá nhân trải hết hàng, nói rõ là tác tử đề xuất và độ tin, và đặt giá trị cũ cạnh giá trị mới (`the-thong-tin-ca-nhan`)
- Ô tìm trong trang thành viên chiến dịch phải tìm TRONG phân khúc, không thay thế phân khúc (`tim-trong-phan-khuc`)

## Đang làm

- Thước của lát ③a có răng — mỗi phép đo nghiệm thu của vòng ③a phải đỏ được, và chứng minh lại điều đó mỗi lượt chạy (`thuoc-cua-lat-3a-co-rang`)

## Đã giao — chờ phiên nghiệm thu

- Việc, sáng kiến, ghi nhận và mẫu nằm cạnh KR — việc tự gõ và sáng kiến (chiến dịch hay kế hoạch 30 ngày có sẵn) gắn vào KR, bằng chứng cho KR mốc, ghi nhận đồng nghiệp trên mục tiêu, mẫu OKR theo cấp và đơn vị (lượt 8a — SK-01, SK-02, CI-05, CI-06, MT-07) (`canh-kr-okr`)
- Cập nhật tuần OKR — màn «Cập nhật tuần của tôi» gom mọi KR tôi phụ trách, điền sẵn số tuần trước, ghi giá trị · mức tự tin · một dòng ghi chú; nhắc buổi sáng và thẻ «việc của tôi» dẫn thẳng vào màn; bình luận và nhắc tên trên mục tiêu và KR; chuyển KR khi người nghỉ (`cap-nhat-tuan-okr`)
- Cây tổ chức hai cấp dưới gốc OneHub — bộ phận chứa phòng ban — có người, có trưởng, dựng và nhập hàng loạt ở Cài đặt › Tổ chức (`cau-truc-to-chuc`)
- Chỉ quản trị và chủ đổi được định nghĩa trường của cả đội — thành viên thường vẫn xem được, nhưng mọi đường đổi đều khoá, cả trên màn lẫn khi gọi thẳng máy chủ (`chi-quan-tri-sua-duoc-truong`)
- Cửa vào đăng nhập cho người mới — trang /sign-in nói cách vào ở khối «Lần đầu vào?» (bước tính theo nút đang bật), báo lỗi khi better-auth trả về vì địa chỉ chưa được cho phép, theo giao diện máy thay vì ép tối; bốn trang AuthShell khác giữ bố cục (`cua-vao-dang-nhap`)
- Khu OKR trong CRM — quản trị mở chu kỳ năm và quý; mỗi cấp đặt mục tiêu với KR đủ sáu kiểu, căn chỉnh vào cấp trên, công bố; nhập bộ OKR quý 4 từ bảng tính có xem trước; mọi sửa đổi để lại vết (`dat-okr-trong-crm`)
- Đổi tên sản phẩm trên mọi chữ người đọc từ «CRM» sang «OneHub Center» (trùng tên miền onehub.center), và làm lại cột trái /sign-in theo hướng A — nền lưới chấm bằng token cho năm trang AuthShell, dòng neo cỡ lớn, ba bước nối bằng đường dọc, không Card (`doi-ten-onehub-center`)
- Hỏi ý mục tiêu — trước mỗi kỳ đặt OKR cả công ty góp ý cho mục tiêu công ty, người gom xếp ý thành chủ đề, người chọn (CEO) viết trước rồi kết luận từng chủ đề bằng lý do tự viết, chủ đề chọn thành bản nháp mục tiêu cấp OneHub, ai góp cũng thấy ý mình đi đâu và vì sao (bước 1–2 chu kỳ OKR, hạng mục 11 lộ trình OKR) (`dot-hoi-y-tuong-okr`)
- Mục tiêu có mức hiển thị giới hạn, có bước duyệt nhẹ tuỳ chọn, và tái cơ cấu giữa kỳ không làm OKR mồ côi — mức công khai hay giới hạn áp trên mọi đường đọc OKR, ô «Công bố cần duyệt» của Chương trình OKR với một người duyệt suy từ cây, cây tổ chức không lưu trữ hay xoá được đơn vị còn OKR, chuyển OKR sang đơn vị khác, danh sách OKR mồ côi (lượt 8c — MT-06, QT-02, TC-06) (`gioi-han-duyet-cay-okr`)
- Góp ý của Kara ở khu OKR đặt đúng chỗ — «Kara · N góp ý» trên thẻ Mục tiêu, đề xuất neo ngay dưới từng KR ở khung chi tiết với biên nhận có Hoàn tác, hộp Sửa chỉ còn một dòng dẫn sang (`gop-y-dung-cho`)
- Người đã nối Zalo nhắn một câu hỏi cho bot thì trợ lý AI của CRM trả lời bằng chữ, chỉ đọc, theo đúng cổng vai của người hỏi và trong ranh giới dữ liệu A; có trần theo người và theo xưởng (`hoi-crm-qua-zalo`)
- Kế hoạch 30 ngày là một bản ghi làm việc được — mở như thoả thuận, giao bước, đánh dấu xong, đổi cầm trịch, ghi chú, và mọi thay đổi để lại vết (`ke-hoach-la-mot-ban-ghi`)
- Khép kỳ OKR — quản trị mở cửa sổ rà giữa kỳ; cuối kỳ máy gợi ý điểm từ số chốt, người chỉnh được kèm lý do; mỗi mục tiêu có ô điều học được; kỳ chỉ đóng khi mọi KR đã chấm; mục tiêu dở mang sang kỳ sau; số kỳ đã đóng bị khoá và xuất được; kiểm chất lượng khi đặt bằng luật (`khep-ky-okr`)
- Máy nhắc thay người canh — mỗi sáng một tin Slack riêng gom bước quá hạn, bước sắp hạn, kế hoạch im và mốc ngày 7 · 14 · 30; thẻ Tasks hiện cùng danh sách; ai cũng tự theo dõi được một kế hoạch (`may-nhac-truoc-nguoi`)
- Máy soạn bản đề xuất — tải tệp quy định đang có (Word, PDF có chữ) lên kho tài liệu, máy soạn thành bản đề xuất có trích đoạn nguồn, chủ trang đọc nguồn cạnh nhau rồi duyệt (`may-soan-de-xuat`)
- Kế hoạch hiện ra ở mọi chỗ người đã đứng — tab 30 ngày đầu ở sheet Công ty, mục 30 ngày đầu ở sheet Cá nhân, bước giao cho tôi trong thẻ Tasks, lọc và chia cột theo người được giao, chuyển việc 30 ngày khi một người nghỉ (`moi-phia-deu-thay-ke-hoach`)
- Nền giao diện của Kara trong packages/ui — dấu tia sáng, nhãn Kara có ô «vì sao», ProposedChange hai độ dày (inline không viền, card), dòng biên nhận có Hoàn tác, phản hồi chung — để mọi màn AI sau đó dựng trên một bộ (`nen-kara`)
- Số OKR tự chảy — KR của khối kinh doanh lấy số từ danh mục chỉ số CRM có định nghĩa cố định; mỗi ngày chụp giá trị thành lịch sử không đổi; bấm vào con số ra danh sách bản ghi đằng sau; KR ngoài CRM nhận số qua khoá API và Google Sheets (`so-okr-tu-chay`)
- Soạn OKR cùng Trợ lý — người sửa được OKR của một đơn vị mở một cuộc đối thoại với Trợ lý OKR cho đơn vị và chu kỳ đang lập kế hoạch; Trợ lý mang bối cảnh (hồ sơ công ty và chiến lược từ Kho tài liệu, đơn vị · mô tả · chức danh, OKR cấp trên và ngang cấp, kỳ trước tóm gọn, số CRM dạng tổng) vào cuộc, hỏi vài câu, đưa bản nháp bộ OKR trên bảng sống cạnh chat; người nhận · sửa · bác từng dòng, «Đưa vào bộ OKR» tạo cả bộ ở trạng thái nháp; chạy trên app eve riêng, vai «chỉ OKR» đi qua đường mới; dựng và đo trên bộ OKR mẫu (`soan-okr-cung-tro-ly`)
- Thẻ góp ý của Trợ lý OKR — hộp sửa rộng hơn khi cột góp ý mở, mỗi đề xuất là thẻ xếp dọc trải hết bề ngang với hàng nút ở chân và đúng một nút chính, dựng trên Confirmation của AI Elements; gợi ý thông tin ở tab Tổng quan dùng cùng thẻ; chỉ giao diện (`the-gop-y-okr`)
- Đội tiếp thị chạy trọn một chiến dịch tuyển đối tác trong CRM — phân khúc, làm giàu, nhắm, tiếp cận, đo (`tiep-thi-tuyen-doi-tac`)
- Tìm và điều hướng kho tài liệu — ⌘K có dấu hay không dấu, trang nhắc tới trang này kèm câu, lọc theo đơn vị, loại, chủ, tab Sức khoẻ, dòng «N bản chờ bạn duyệt» trong nhắc sáng (`tim-va-dieu-huong-kho`)
- Toàn cảnh OKR và họp tuần — danh sách theo đơn vị có lọc ở máy chủ, cây căn chỉnh toàn công ty đi bằng bàn phím, bảng họp tuần xếp theo thứ đáng bàn, toàn cảnh cho lãnh đạo có heatmap, phần «OKR của bạn» trên Tổng quan và trang OKR của một người, màn sức khoẻ chương trình cho quản trị; các biến thể packages/ui từ bản mẫu (`toan-canh-okr`)
- Trợ lý AI đọc Kho tài liệu — hỏi bằng lời thường trong CRM (tab «Hỏi») hay qua bot Zalo, trả lời có trích trang, phiên bản, đoạn nguyên văn do máy chủ kiểm; câu từ chối cố định; cảnh báo quá hạn xác minh và ô đặt hạn; báo sai thành việc cho chủ trang; nhật ký hỏi và hàng câu chưa trả lời được (`tro-ly-doc-kho`)
- Góp ý khi bấm — người sửa được một Mục tiêu hay KR bấm «Nhờ Trợ lý OKR góp ý» trong hộp thoại sửa, nhận vài đề xuất (câu cũ cạnh câu mới, câu hỏi chất lượng, chỗ Căn chỉnh) rồi nhận, sửa hay bác từng dòng; dòng xu hướng tính bằng mã cạnh ô đích; quản trị bật theo ba nấc tắt · chế độ ẩn · bật cho từng việc và từng đơn vị; dựng và đo trên bộ OKR mẫu, dữ liệu thật là điều kiện bật (`tro-ly-okr-de-xuat`)
- Nền Trợ lý OKR — quản trị thấy tháng này AI tiêu bao nhiêu cho từng việc và bật tắt được Trợ lý OKR theo việc và theo đơn vị; subagent tro_ly_okr cách ly với bốn chốt, sổ chi phí AI cho mọi phiên, trần tháng kiểm trước khi xếp việc, bảng và cột cho 9b và 9c; người dùng chưa thấy gì (`tro-ly-okr-nen`)
- Tóm tắt tuần — sáng hôm sau ngày cập nhật, Trợ lý OKR tóm tắt các lần Cập nhật tuần của một phòng ban; khối tóm tắt ở đầu bảng họp tuần, câu nào cũng bấm ra lần cập nhật gốc, máy kiểm lại mọi con số lúc ghi và lúc hiện; Trưởng phòng ban nhận một dòng trong nhắc buổi sáng và tắt được dòng đó; quản trị bật theo ba nấc tắt · chế độ ẩn · bật và thấy mọi bản ở màn Sức khoẻ; dựng và đo trên bộ OKR mẫu, dữ liệu thật là điều kiện bật (`tro-ly-okr-tom-tat`)
- Người quản trị tìm thấy trường tự tạo ở Cài đặt và được gợi ý bộ trường của môi giới Việt (`truong-tu-tao-o-cai-dat`)
- Vai «chỉ OKR» — người mang vai này đăng nhập được, thấy khu OKR và hồ sơ của chính mình, nhưng không đọc được danh bạ, công ty, thoả thuận, chiến dịch, kế hoạch 30 ngày qua màn, tRPC, cầu REST, khoá API hay trợ lý AI (`vai-chi-okr`)
- Vào được CRM từ mạng đang chặn Google — đăng nhập bằng email và mật khẩu (`vao-bang-email-va-mat-khau`)

## Đã giao

- Lát dựng tác nhân nói tiếng Việt — đợt một: khung điều hướng, cụm Tác nhân của đội, và bảng kết quả/mã đọc đúng tiếng của người quản trị (`agent-builder-noi-tieng-viet`)
- Khoá workflow auto-pr về kho hãng — ở bản rẽ nó chết hai lần mỗi lượt đẩy và bôi đỏ mọi commit (`auto-pr-thoi-do-o-ban-re`)
- Bảng cột danh mục 30 ngày đầu báo lỗi kèm nút tải lại, và giữ nhãn cột đúng với dữ liệu đang hiện khi đổi cách chia (`bang-cot-loi-va-nhan`)
- Trang Cài đặt › Thành viên giữ đủ hàng của bảng thành viên và cuộn như một trang khi danh sách «Được phép vào» dài — không khối nào đè lên bảng, menu đổi vai mở được (`bang-thanh-vien-giu-hang`)
- Bỏ vế «hoặc chọn tệp» khỏi câu gợi ý của vùng kéo-thả trong hộp «Tải nguồn lên», vì nút «Chọn tệp» đã đứng ngay cạnh (`bo-chu-lap-keo-tha`)
- Bộ dựng chung nhận chuỗi từ ngoài — một component hiện đúng tiếng người đọc mà chỗ gọi không phải truyền gì (`bo-dung-chung-nhan-chuoi`)
- Bộ dựng tác nhân không còn kẹt im lặng — hạn mức phiên đủ cho model có suy nghĩ, câu hỏi «hết hạn mức» hiện trên màn với hai nút và trả lời được, trợ lý không gửi được khuôn kết quả vào bộ dựng nên không còn thành công giả (`bo-dung-khong-ket`)
- Bộ OKR mẫu — máy dev có một công ty giả chạy OKR đủ một quý (40 người, ba bộ phận, mười phòng ban, OKR năm và quý 4, sáu tuần Cập nhật tuần, quý 3 đã khép, 30 ca góp ý cùng khuôn N1), nạp bằng một lệnh từ chối production và workspace có OKR thật (`bo-okr-mau`)
- Chỉ chủ và quản trị đổi được khoá nghiên cứu, model của trợ lý và số ngày giữ mục đã lưu trữ — thành viên thường vẫn xem được, mọi đường đổi đều khoá cả trên màn lẫn khi gọi thẳng máy chủ, và không bị nhốt ở màn cắm khoá (`cai-dat-chung-chi-quan-tri`)
- Cài đặt còn lại nói tiếng Việt — năm cụm Theo dõi, Kết nối, Khoá API, SSO, Thành viên đọc đúng tiếng của người quản trị, và mọi đoạn mã người chép giữ nguyên từng byte (`cai-dat-con-lai-noi-tieng-viet`)
- Chân lái từng component ra màn — đo lớp chữ tiếng Anh nằm ở giá trị mặc định của tham số, và giải toả bảng mười dòng của vòng trước bằng đo thay vì khai (`chan-lai-component-ra-man`)
- Bản nháp OKR có hai Mục tiêu trùng khoá, hay hai KR trùng khoá dưới cùng một Mục tiêu, bị schema banNhap từ chối ở biên công cụ nop_ban_nhap — agent nhận lỗi nêu đúng ô và nộp lại (`chan-trung-khoa-ban-nhap`)
- Chặn uỷ thác agent_builder ở lượt không mang CREATE_AGENT — hiện tại chốt quyền ném exception, con không có cửa ra, và hội thoại treo "đang chạy nền" vĩnh viễn không một thẻ lỗi (`chan-uy-thac-sai-luot`)
- Đưa danh sách ai-được-vào CRM từ biến môi trường vào bảng lời cho phép, quản trên màn Members với hai khối tách bạch — gỡ thành viên là cắt quyền thật, rút lời cho phép chỉ chặn người chưa có tài khoản (`cho-phep-ai-vao-o-man-hinh`)
- Ca «chủ cuối cùng» của api xanh bất kể trong workspace còn chủ lạ từ tệp khác — tiền đề «chu là chủ duy nhất» được lập tường minh trong ca và trả lại sau ca (`chu-cuoi-cung-tien-de`)
- Chữ mặc định của thư viện ngoài — dựng thước cho lớp chữ mà mọi bộ quét tĩnh đều mù, rồi vá cái nó tìm ra (`chu-mac-dinh-thu-vien-ngoai`)
- Bài test claimDue chỉ thấy dòng AgentTask của chính nó — hết đỏ khi lượt test api để lại việc nghiên cứu đến hạn (`claimdue-chi-thay-dong-cua-minh`)
- Lịch chạy nền của API phải theo bản khai apps/api/vercel.json, không theo một dòng ghim cứng trong script dựng — bốn trong năm việc nền hiện không bao giờ chạy (`cron-theo-ban-khai`)
- Cửa sổ trò chuyện của lát dựng tác nhân nói tiếng Việt — đợt hai, và tháo ba mối nối với hồ sơ đợt một đã ký (`cua-so-tro-chuyen-noi-tieng-viet`)
- Cửa vào nói tiếng Việt — màn đăng nhập và màn khai báo đọc đúng tiếng của nhân viên, ngay lần đầu họ mở CRM (`cua-vao-noi-tieng-viet`) — đã chấm bởi thực tế
- Bảng cột thoả thuận — số đếm và tổng đầu cột đổi ngay khi thả, trả về đúng khi lưu thất bại (`dem-dau-cot-khi-dang-luu`)
- Cả đội điều phối 30 ngày đầu của đối tác mới ngay trong CRM, thôi dùng Google Sheet và giấy tờ tay (`dieu-phoi-30-ngay-dau`) — đã chấm bởi thực tế
- Phép đo màn thật chạy trên kho riêng của chính cây (crm_<cây>_do) với máy chủ app/api của chính cây, tự dựng và tự dọn; kho dev chung crm không bao giờ bị phép đo ghi nữa (`do-man-tren-kho-rieng`)
- Đo quyền của lượt bằng hành vi — thay bộ dò regex theo dòng của AC-5 cũ bằng phép đo đi trọn đường sản phẩm, siết mệnh đề về đúng thứ máy chủ và agent giữ được, và đổi sàn dân số sang bất biến nguồn ghi đọc bằng AST (`do-quyen-luot-bang-hanh-vi`)
- Đường proto cho nghi thức design-pass — route /proto sau cờ dev, sổ đăng ký có khai state, proto mẫu ghép từ @crm/ui, và ba khoá design_pass trong config (`duong-proto-cho-design-pass`)
- Quản trị viên tự cấu hình giai đoạn thoả thuận hợp tác trong Cài đặt, thay enum DealStage cứng (`giai-doan-thoa-thuan`)
- Bộ gieo rải mẫu đều qua các trang danh bạ, thay vì cắt 200 người đầu bảng (`gieo-rai-deu-danh-ba`)
- Trình chạy test DOM từng tệp tự cắt một tệp quá giờ và gọi tên nó, in thời lượng thật của từng tệp và năm tệp chậm nhất (`gioi-han-tep-dom`)
- Gỡ khoá góc nhìn — góc nhìn đang được chiến dịch dùng thì nói ra trước, và có lối trỏ chiến dịch sang góc nhìn khác (`go-khoa-goc-nhin`) — đã giao — máy thông, cửa veto còn mở
- Gỡ là cắt quyền thật — người đã bị gỡ khỏi workspace không còn đọc hay ghi dữ liệu CRM qua thủ tục của API, cầu REST, khoá API hay đường nối trợ lý (`go-la-cat-quyen-that`)
- Gỡ một thành viên thì phải giữ được — ba chỗ chưa ai canh sau lượt gỡ (`go-thanh-vien-phai-giu-duoc`)
- Hạ trần tháng của Hỏi CRM qua Zalo từ 1.500 xuống 300 câu mỗi tháng của cả xưởng, giữ trần phút và trần ngày (`ha-tran-thang-hoi-zalo`)
- Hạn việc tính theo ngày giờ Việt Nam — việc hạn hôm nay không còn hiện quá hạn từ đầu ngày; thẻ «Việc quá hạn» ở chế độ «Cả đội» hiện việc của mọi người kèm tên người tạo; «bước của tôi» cắt khung theo ngày giờ Việt Nam (`han-viec-theo-ngay`)
- Tham số hd của Google phải theo hình dạng danh sách cho phép, không theo domain đầu tiên — để vế «cộng một người ngoài» mà tài liệu và test đã công bố chạy được thật (`hd-theo-danh-sach`)
- Lưới tự đối chiếu với bản khai hình của nó, thay vì chờ người nghĩ ra đòn tấn công kế tiếp (`hinh-cua-luoi`)
- Hỏi CRM qua Zalo giữ lời hứa «chỉ đọc» bằng chặn trong chính công cụ, bỏ qua tin không chữ bằng một câu báo, không che nhầm số tiền, và bộ đo của hồ sơ cũ thôi xanh giả (`hoan-thien-hoi-crm-qua-zalo`)
- Hộp thoại và ngăn trượt không mất chữ đang nhập dở — thành phần dùng chung tự biết có thay đổi; bấm ra ngoài khi đã nhập thì không đóng; Esc, dấu X, nút Huỷ và vuốt xuống hỏi lại «Bỏ những gì vừa nhập?» (`hop-thoai-giu-cho-dang-nhap`)
- Màn Deals hydrat khớp máy chủ — ô Giai đoạn hết lệch «QUALIFIED_TO_BUY» ↔ «Qualified to buy», hết lỗi «Hydration failed» chập chờn khi tải /deals (`hydrat-giai-doan-deals`)
- Thanh biểu tượng bên trái hydrat khớp máy chủ — hết lỗi «Hydration failed» chập chờn ở AppIconRailFallback (aria-busy) (`hydrat-thanh-bieu-tuong`)
- Kéo thả thoả thuận giữa các giai đoạn trên màn Thoả thuận (cách xem bảng cột) (`keo-tha-thoa-thuan`) — đã giao — máy thông, bằng chứng xanh-sạch
- Đoạn tiếng Anh do máy ghi trên tấm hồ sơ tự khai lang="en", để trình đọc màn hình không đọc nó bằng giọng tiếng Việt (`khai-lang-gioi-thieu`) — đã chấm bởi thực tế
- Cho khẳng định về đăng nhập Microsoft có răng, thay vì tự tính kỳ vọng từ chính môi trường nó đo (`khang-dinh-microsoft-co-rang`)
- Kho nguồn tài liệu dùng khoá Blob riêng KHO_TAI_LIEU_BLOB_TOKEN, tách khỏi khoá logo BLOB_READ_WRITE_TOKEN, để bật tải nguồn trên production mà không đẩy logo vào kho riêng tư (`kho-nguon-khoa-rieng`)
- Kho tài liệu lượt 1 — nhân viên viết trang bằng trình soạn kiểu Word, gửi chủ trang duyệt trên diff kiểu Track Changes, cả công ty đọc bản đang dùng (`kho-tai-lieu`)
- Xác minh khoá API không ghi CSDL mỗi lượt — vá @better-auth/api-key để lastRequest chỉ ghi khi cũ quá một phút và bỏ lần đóng dấu updatedAt (`khoa-api-ghi-thua`)
- Ca khoa-con-bat của go-la-cat-quyen.spec.ts chạy xa trần 5 giây của bun test mà không yếu đi (`khoa-con-bat-xa-tran`)
- Khoá cũ không mở được khoá mới — người không còn là thành viên không dùng khoá API còn bật để tạo, sửa hay bật lại khoá qua endpoint của Better Auth; khoá còn bật của họ được tắt một lần (`khoa-cu-khong-mo-khoa-moi`)
- Khoá lô hàng agentTask trong CTE MATERIALIZED để LIMIT giữ đúng trần dưới thống kê cũ (`khoa-lo-giu-tran`)
- Hộp «Chuyển việc 30 ngày» ghép câu từ mẫu tin nhắn mà không sinh hai phần tử cùng khoá React khi mẫu bắt đầu, kết thúc hay có hai chỗ trống liền nhau — chữ trên màn giữ nguyên (`khoa-rieng-dien-node`) — đã giao — máy thông, cửa veto còn mở
- Thước «không chạm thước đã ký» của bo-chu-lap-keo-tha bắt được tệp đã ký bị đổi tên hoặc dời ra khỏi vùng cấm (`khong-cham-thuoc-bat-doi-ten`)
- Tạo và sửa OKR cùng khung với deal — tạo và sửa Mục tiêu, thêm và sửa KR mở trong ngăn trượt phải như tạo deal, trạng thái mở trên URL, chân «Huỷ» trái nút chính phải cho mọi ngăn; cột góp ý của Trợ lý OKR mở thành ngăn rộng; thẻ góp ý giữ nguyên; chỉ giao diện (`khung-tao-okr-nhu-deal`)
- Khung trang Cài đặt — một khung căn trái cho mọi trang, đầu trang và breadcrumb thống nhất, thanh bên bốn nhóm, Nhắc buổi sáng dời ra menu người dùng (`khung-trang-cai-dat`)
- Bộ phận còn nằm trong một khuôn bất kỳ (kể cả đã lưu trữ) thì không xoá vĩnh viễn được, nên khuôn đã lưu trữ khôi phục được sau khi khôi phục bộ phận của nó (`khuon-mat-bo-phan`) — đã giao — không đo, khai ở Cổng Đáng
- Trần giờ và cô lập cho thước lai-ra-man — ca lái từng component không còn đỏ ngẫu nhiên trên CI, và khi quá hạn thì không kéo đỏ ca nào khác (`lai-ra-man-tran-gio`)
- Hộp «Chuyển việc 30 ngày» làm mới danh mục, bảng cột và phần xem trước qua lối làm mới chung useCrmCache() thay vì liệt query key tại chỗ gọi — hành vi giữ nguyên (`lam-moi-chuyen-viec-qua-loi-chung`)
- Lệnh chứng không được ăn cache dối — bắt bốn lệnh chứng của cổng nói thật, và bắt khoá cache của bộ vẽ khai đủ file nó đọc ngoài gói (`lenh-chung-khong-an-cache-doi`)
- Lệnh dựng của kho đang đỏ vì 19 màn đọc dữ liệu lượt truy cập ngoài Suspense — vá 19 màn, và đưa lệnh dựng vào bộ lệnh chứng để lớp lỗi này không còn vô hình với bốn cổng (`lenh-dung-do-khong-ai-thay`)
- Mọi logo Comp AI trong CRM đổi sang logo OneHub — mark dựng lại bằng hình học trùng ảnh gốc từ 98% trở lên và căn đúng tâm, bản kèm chữ OneHub ở trang đăng nhập, bộ favicon và icon cài app sinh từ cùng một nguồn, và PNG đúng cỡ cho Slack, Zalo, Google (`logo-onehub`)
- Lời mời đã huỷ hoặc từ chối thì thôi cho vào — phép kiểm cho phép theo danh sách trắng, không theo một chuỗi cấm (`loi-moi-da-huy-van-cho-vao`)
- Lỗi trên đường API → tác tử → Zalo nói đúng nguyên nhân cho người dùng (luuBot, guiThu) và để lại một dòng log có mã và nguyên nhân cho người vận hành, thay cho câu chung «Tác tử chưa nối được» (`loi-tac-tu-zalo-noi-dung-nguyen-nhan`)
- Người dùng bấm vào được hai màn điều phối 30 ngày đầu từ thanh điều hướng chính và thanh bên Cài đặt (`loi-vao-dieu-phoi-30-ngay`) — đã chấm bởi thực tế
- Lưới chặn trước khi đẩy phải chạy thật, và hồ sơ đã ký phải trỏ đúng chân răng (`luoi-day-do-that`)
- Ma trận phải có chiều sống — đổi lời tuyên quét lớp của phép đo AC-1 cũ thành một bất biến đo được, và cắm chiều đỏ vào đúng chỗ hai sàn AST mù (`ma-tran-phai-co-chieu-song`)
- Màn Cài đặt nói tiếng Việt — cụm General và Currencies đọc đúng tiếng của người quản trị, kể cả ở những trạng thái màn hình không tự mở ra (`man-cai-dat-noi-tieng-viet`)
- Thước màn chữ E6u của bo-chu-lap-keo-tha mở hộp tải nguồn bằng khoá kho nguồn KHO_TAI_LIEU_BLOB_TOKEN sau khi PR (`man-chu-theo-khoa-kho-nguon`)
- Màn xin quyền có răng — /grant-access được đo trên trình duyệt thật, không chỉ bằng quét cú pháp (`man-xin-quyen-co-rang`)
- Mọi bài kiểm DOM (*.dom.tsx) của apps/app và packages/ui chạy trong bun run test, mỗi tệp một tiến trình (`moi-bai-kiem-dom-deu-chay`)
- Một đường ghi phòng ban — mọi thao tác ghi phòng ban đi qua org.* với một bộ luật; gỡ đường ghi onboarding.*Department; điều kiện «xoá hẳn được» tính một nơi (`mot-duong-ghi-phong-ban`)
- Mục tiêu và KR trong cùng một khung — danh sách, sheet chi tiết và Chấm điểm (`muc-tieu-va-kr`)
- Nền chat AI Elements — dọn 19 component mồ côi, dựng lớp chuyển kiểu eve→AI SDK, chuẩn hoá phần còn lại, đặt răng chống tái phát (`nen-chat-ai-elements`)
- Thước lái-ra-màn thôi đỏ khi kho chỉ thêm tệp nguồn — bỏ neo số tệp cố định, thay bằng quan hệ «mọi tệp git theo dõi đều được bộ duyệt thấy»; giữ neo chuỗi mặc định và neo bảng cũ (`neo-dan-so-khong-cung`)
- Ngày gieo của test «bước của tôi» tính theo ngày giờ VN như sản phẩm, ghim bằng hai mốc giờ (`ngay-gieo-theo-gio-vn`)
- Vùng kéo-thả tệp nguồn (NguonKeoTha) dựng lại trên móc ReUI use-file-upload theo bố cục c-file-upload-3, thay bản vẽ tay bậc 5 (`nguon-keo-tha-reui`)
- Nhắc buổi sáng qua Zalo — mỗi người nối Zalo bằng mã 6 số gửi cho bot, tự chọn nhận nhắc qua Tự động · Zalo · Slack trên trang «Thông báo của bạn»; trang kết nối Zalo cho thấy bot sống và ai đã nối (`nhac-qua-zalo`)
- Nhãn ứng dụng nói tiếng Việt trên ba luồng của ngưỡng — thêm công ty, ghi hoạt động, cập nhật thoả thuận (`nhan-ung-dung-noi-tieng-viet`) — đã chấm bởi thực tế
- Nợ sau lượt 4 OKR — nhắc OKR theo sự kiện đi đúng một lần vào sáng hôm sau và không gửi giữa ngày với câu «sáng nay»; sheet dùng quyền cập nhật máy chủ trả về; một lần gửi không nhận một KR hai lần; bộ nhắc đọc vết bằng khuôn và báo lỗi khi vết hỏng; khuôn mục nhắc OKR một nguồn, không loại nào rơi khỏi tin (`no-sau-luot-4-okr`)
- Nợ sau lượt 5 OKR — khối «OKR của bạn» báo lỗi kèm Thử lại khi không tải được chu kỳ hay KR, bộ lọc người phụ trách luôn hiện tên thay cho mã, trang Theo đơn vị dùng được bản tải trước danh sách ở máy chủ (`no-sau-luot-5-okr`)
- Người điều phối tạo được bộ phận, khuôn, kế hoạch và ghi danh môi giới ngay trên màn — bốn nút đang trần nay làm đúng việc của nó (`noi-bon-nut-dieu-phoi`)
- Quản trị viên bật bot Zalo ngay trên màn (dán Bot Token, tác tử tự đăng ký webhook); người mới nối theo ba bước có tên bot thật và gửi thử được nhắc ngay; bot nhận ra người đã nối; tin lỗi giữa chừng không mất; người rời xưởng bị gỡ liên kết (`noi-zalo-cho-nguoi-moi`)
- Các ca của nop-ban-nhap chọn dòng theo khoá bản nháp hay thứ tự tường minh, không theo vị trí vật lý — hết đỏ ngẫu nhiên trên CI (`nop-ban-nhap-chon-theo-khoa`) — đã giao — máy thông, cửa veto còn mở
- Mọi ổ cắm trong _acceptance/config.yaml phải giải ra một lệnh chạy được — hiện 16 ổ cắm giải ra lệnh lỗi cú pháp bash, và hai dòng làm cả file không parse được bằng YAML (`o-cam-chay-duoc-that`)
- Trả ổ cắm buổi khai thác về trạng thái trung tính, và thu phép đo ổ cắm về đúng hai ổ thiết kế (`o-cam-khai-thac-trung-tinh`)
- Ô nhập số tiền thoả thuận đọc đúng theo tiếng đang dùng và số chữ số lẻ của đồng tiền, từ chối chuỗi mơ hồ (`o-so-tien-doc-theo-tieng`) — đã giao — máy thông, cửa veto còn mở
- Ô soạn hội thoại không còn giả chữ — con trỏ đứng ở đầu ô trống, chữ gợi ý không nằm trong dòng chữ; thẻ lỗi hội thoại hiện mã lỗi; agent ghi log lý do lỗi của hội thoại (`o-soan-va-ly-do-loi`)
- Soát ảnh OKR lượt 3 — hộp Nhập thấy đủ bảy cột và đánh dấu dòng hỏng ở 1440; hàng thẻ Cài đặt ở 390 tự đưa thẻ đang mở vào tầm nhìn; bộ chọn chu kỳ bỏ nhãn loại lặp; gợi ý tên chu kỳ theo năm hiện tại tính ở server (`okr-soat-anh-luot-3`)
- Trang 30 ngày đầu theo khuôn trang danh sách của deals (`onboarding-giong-deals`)
- Phiên chết về trang đăng nhập — người mang cookie phiên đã hết không còn thấy landing của hãng ở / hay trang «không còn trong không gian làm việc»; proxy tách 401 của workspace.get khỏi «không biết», trang / và /het-quyen tự kiểm phiên (`phien-chet-ve-dang-nhap`)
- Người điều phối lọc, sắp, tìm và xem theo bảng cột trên danh mục 30 ngày đầu — và bộ lọc ra không kết quả không còn đẩy họ vào ngõ cụt (`quan-ly-danh-muc-30-ngay`) — đã chấm bởi thực tế
- Quên mật khẩu — người dùng tự xin liên kết đặt lại qua thư (tiếp quản PR (`quen-mat-khau`)
- Quyền của lượt builder mang theo tường minh — bỏ luật suy commandType từ hình dạng tin nhắn, câu trả lời kế thừa đúng quyền của lượt đã hỏi, và dạy con agent_builder cửa ra not_authorized (`quyen-luot-mang-theo`)
- Vá lối rò Slack — Tác nhân chạy nền không đăng được dữ liệu đối tác vào kênh Slack có người mang vai «chỉ OKR», và lượt chạy nền của Tác nhân được coi là tự động nên mọi thao tác ghi nhạy cảm bị từ chối (`ro-slack-tac-nhan`) — đã giao — không đo, khai ở Cổng Đáng
- Kết nối Slack thiếu quyền đọc email vẫn không để lọt dữ liệu đối tác tới người mang vai «chỉ OKR» (`slack-thieu-quyen-email`)
- Soạn OKR khi chưa cấu hình cầu nối — nút không mời mở cuộc, màn nói thẳng chưa bật, cuộc chưa có lượt không bị tính vào trần, có hướng dẫn dựng apps/agent-okr trên Vercel (`soan-okr-song-lai`)
- Sửa và ẩn chu kỳ OKR tạo nhầm — chu kỳ trống ở lập kế hoạch sửa được mọi ô, chu kỳ chưa đóng sửa được tên, chu kỳ trống gỡ được, chu kỳ có dữ liệu ẩn được có lý do và hiện lại được; chu kỳ ẩn vắng khỏi mọi ô chọn, kỳ mặc định, kiểm quý chồng, mang sang, nhắc và ghi mới; vết luôn còn (`sua-an-chu-ky-okr`)
- Người quản trị sửa, sắp xếp, lưu trữ và khôi phục bộ phận và khuôn; người điều phối đóng, mở lại kế hoạch và đánh dấu bậc phễu — chỉ quản trị được đổi cấu hình (`sua-luu-tru-dieu-phoi`)
- Sửa hai lỗi môi trường làm suite test đỏ, và nối dây cổng nghiệm thu vào bản kit đang cài (`sua-test-do-thu-tu-nap`)
- Tác nhân chạy đúng với mọi model trong danh mục — khuôn model thấy di động giữa các nhà cung cấp, model giải theo vai lúc chạy thay vì ghim theo bản Tác nhân, lượt mà bộ chạy hỏng hoặc chưa nộp kết quả thì ghi Hỏng (`tac-nhan-model-rieng`)
- soSanh bỏ vòng Myers mức khối vô ích khi cận dưới số bước sửa đã vượt trần, để ca tat-dinh của tai-lieu-diff hết đỏ chập chờn trên CI (`tai-lieu-diff-bo-myers-vo-ich`)
- Một tên cho đồng tiền báo cáo ở mọi câu người dùng thấy, có mục trong từ điển sản phẩm (`ten-dong-tien-bao-cao`)
- Test api không để lại dòng AgentTask vô chủ cho gói agent (`test-api-khong-de-viec-vo-chu`) — đã giao — máy thông, cửa veto còn mở
- Trang Cài đặt › Thành viên — hai khối «Đã vào» và «Được phép vào» dùng chung khuôn section Card → CardHeader → bảng; nút «Cho phép một địa chỉ» lên đầu trang; «Rút» vào menu «…» (`thanh-vien-hai-khoi-cung-khuon`)
- Thước cache hết đối tượng — gỡ hai tiêu chí không còn vật để đo, gỡ một bản khai vô tác dụng, và thay bằng một bất biến sống sót cả hai cách vá (`thuoc-cache-het-doi-tuong`)
- Thước o-soan.mjs dọn sạch mọi lối thoát — không sót dấu mốc, hội thoại hay Chrome; chặn cây bằng canh-cay; người đo bắt buộc khai; token và màu con trỏ lấy từ một nguồn (`thuoc-o-soan-don-dep`)
- Ô số tiền không đoán đồng tiền khi thiết lập tiền tệ của không gian làm việc chưa tải hoặc tải lỗi (`tien-te-chua-tai-khong-doan`) — đã giao — máy thông, cửa veto còn mở
- Xương sống ngôn ngữ — nhân viên chọn tiếng Việt một lần, màn công ty hiện trọn tiếng Việt (`tieng-viet-cho-crm`) — đã chấm bởi thực tế
- Tiêu đề cột đọc trọn ở các trang danh sách dựng trên DataTable chung (`tieu-de-cot-doc-tron`)
- Cài đặt › Tổ chức theo bố cục danh sách – chi tiết — trưởng chọn tại chỗ, thêm người và gắn nhiều phòng ban một lượt, ô số lọc được, nhập ba bước, nhất quán với các màn Cài đặt (`to-chuc-danh-sach-chi-tiet`)
- Màn Tổng quan và khung điều hướng nói tiếng Việt — màn đầu tiên sau đăng nhập, thanh bên, thanh đầu, hộp tìm nhanh đọc đúng tiếng nhân viên chọn; và bộ thước màn nhìn thấy cả khung chứ không chỉ khung nội dung (`tong-quan-va-khung-noi-tieng-viet`)
- Người nhận tin nhắc qua Zalo trả lời «xong 2» (hay «xong 1 3») thì các bước đó của tin sáng nay được đánh dấu xong bằng đúng thủ tục ghi của màn kế hoạch, bot xác nhận một dòng; tin nhắc Zalo đánh số dòng (`tra-loi-tin-nhac`)
- Trần một-lần-uỷ-thác agent_builder áp cho cả lượt KHÔNG có quyền — hook builder-delegation đang return sớm khi commandType khác CREATE_AGENT, nên chốt cứng duy nhất không chạy trên nhánh not_authorized và chỉ còn câu chữ trong prompt giữ trần (`tran-mot-lan-uy-thac`)
- Bộ đo của trần một-lần-uỷ-thác bắt được khi chốt chết, và kiểu tham số neo vào type công khai của eve — CỘNG bằng chứng từ mã eve cho biết vì sao ca «step chạy lại bị giết oan» KHÔNG vá được ở lớp actions.requested, ghi thành giới hạn đã khai và ghim bằng một phép đo có tên (`tran-uy-thac-chiu-chay-lai`)
- Trang chưa có bản đề xuất mở được — một luật «ai thấy trang» cho danh sách, màn đọc và «trang nhắc tới»; màn đọc nói trang đang chờ gì theo nguồn và chỉ lối viết tay (`trang-chua-de-xuat-mo-duoc`)
- Sửa UX sau lái thử lượt 8c OKR — nhãn «Giới hạn» ở mọi danh sách mục tiêu, gỡ người báo trước OKR đang phụ trách, điều kiện chặn biết trước thì báo trước khi xác nhận, cây đơn vị đếm khớp khung, hộp gửi duyệt nêu người duyệt, người duyệt thấy lần trả lại trước, hạ «Công bố» sau khi trả lại, khung xương khi tải (lượt 8d) (`ux-lai-thu-8c-okr`)
- Vá Trợ lý OKR sau lượt thử 30/09 — nhận vé OIDC khi kiểm khoá mô hình, khoá Gateway riêng cho Trợ lý OKR, bỏ đề xuất Căn chỉnh chồng cùng nhánh, sửa luật «KR đọc như một việc» bắt nhầm khi bỏ dấu và không để hai giọng trái nhau trong hộp sửa KR, kèm hai vá chữ (`va-tro-ly-okr-sau-thu`)
- Vùng cuộn của khung trang là khối chứa — phần tử định vị bên trong mọi trang dùng PageShell không kéo dài document, trang dài chỉ có một vùng cuộn và khung ứng dụng không trượt (`vung-cuon-la-khoi-chua`)
- Màn Kết nối › Zalo in «trả lời lần cuối» theo múi giờ của xưởng (Asia/Ho_Chi_Minh) thay vì giờ UTC của máy chủ (`zalo-gio-theo-mui-gio-xuong`)
- Khi Zalo nhận đăng ký nhưng gọi thử địa chỉ nhận tin hỏng, màn Kết nối › Zalo hiện đúng bot vừa lưu kèm cảnh báo «Đăng ký lại», và cảnh báo giữ nguyên qua các nhịp kiểm cho tới lần đăng ký lại thành công (`zalo-goi-thu-hong-hien-dung-bot`)
- Bot Zalo nhận tin qua webhook — tin mã tới là nối ngay, không còn mất giữa hai nhịp cron; cron chỉ kiểm bot sống; hai lệnh tay đăng ký webhook và đọc tin cho bot thử (`zalo-qua-webhook`) — đã giao — máy thông, bằng chứng xanh-sạch
- Webhook Zalo đọc được thân thật {event_name, message} mà production gửi (và vẫn đọc khuôn có vỏ ok/result theo tài liệu), để người nhắn mã cho bot được nối và nhận trả lời; Zalo giả của test dựng khuôn thật (`zalo-webhook-doc-khuon-that`)

## Đã nghiệm thu giá trị

- Bộ gieo đọc danh bạ tới khi cạn thay vì tới một trần đoán, và lộ số điện thoại theo danh sách tầng khai trong cấu hình (`nang-tran-trang-danh-ba`) — giao rộng (release)

## Hồ sơ hỏng

- `ban-mau-okr` — không đọc được hồ sơ (`(workspace)`): không có contract.md lẫn opportunity.md
