---
schema_version: 1
slug: tiep-thi-tuyen-doi-tac
feature: Đội tiếp thị chạy trọn một chiến dịch tuyển đối tác trong CRM — phân khúc, làm giàu, nhắm, tiếp cận, đo
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Mạnh
decided_at: 2026-09-04T10:35:49Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

OneHub đang chạy. Thứ chưa có là CRM cho việc **thu hút và giữ đối tác** — môi
giới hôm nay, nhân viên quan hệ khách hàng ngân hàng và các loại đối tác khác
về sau. Thị phần tăng bằng cách kéo môi giới vào mạng lưới, nên hiểu môi giới
và mở rộng là việc không có ngày kết thúc.

**Người dùng của vòng này là đội tiếp thị OneHub**, không phải khách hàng và
không phải môi giới (owner chốt phạm vi 2026-09-04). Đây là công cụ tăng trưởng
nội bộ. Việc của nó là bốn bước: **làm giàu · phân khúc · nhắm · tiếp cận**, và
đo kết quả để vòng sau nhắm tốt hơn.

Ghi rõ để không trượt tay: **nội bộ không có nghĩa là không có người dùng.**
Đội tiếp thị là người dùng cuối thật — họ bấm, họ bỏ đi nếu công cụ dở. Ô này
KHÔNG đi lối «Không đo được»; nó có ngưỡng đo trên đội tiếp thị.

Đau hôm nay, theo lời owner: chưa có CRM nào cho việc này. Chưa có bằng chứng
thực địa nào khác — chưa ngồi cạnh người của đội tiếp thị, chưa biết họ đang
chạy chiến dịch bằng gì. Giả định 3 trả món nợ đó.

## Chuỗi bốn bước — dựng xuôi, kiểm ngược

Owner nêu chuỗi «Segment → Enrich → Targeting → tiếp cận». Máy đảo hai chỗ và
ghi lý do:

- **Dựng thì Enrich đi trước Segment.** Không có dữ liệu thì không có trục nào
  để chia. Phân khúc trên hồ sơ trống là chia theo cái đã có sẵn, tức là không
  chia gì.
- **Kiểm thì đi từ bước cuối.** Tiếp cận là bước duy nhất tạo kết quả và là
  bước duy nhất bị luật chặn. Ba bước đầu là chuẩn bị; nếu bước bốn không có
  đường đi được thì ba bước đầu là một cái kho không ai mở.

| Bước | Việc | Vào vòng đầu? |
|---|---|---|
| 1 · Làm giàu | Gắn sản lượng, địa bàn, loại bất động sản, số chứng chỉ vào hồ sơ công ty và cá nhân | có — mức công ty |
| 2 · Phân khúc | Định nghĩa một nhóm bằng luật đếm được, danh sách tự sinh và tự cập nhật | có — một phân khúc |
| 3 · Nhắm | Chọn phân khúc nào, nói gì với nó, ai phụ trách | có — thủ công, một chiến dịch |
| 4 · Tiếp cận + đo | Gửi qua một kênh, kết quả gắn ngược về chiến dịch và phân khúc | có — **đo bắt buộc**, gửi có thể ngoài hệ |

Bước 4 mà cắt phần đo thì bốn bước thành một danh bạ có xếp hạng. **Vòng phản
hồi là thứ phân biệt máy tiếp thị với một danh sách**, nên nó không phải phần
cắt được khi hết giờ.

## Hồ sơ ba lớp — vật liệu của bước làm giàu

| Lớp | Có gì | Nguồn | Độ tin | Là dữ liệu cá nhân? |
|---|---|---|---|---|
| 1 · Định danh | tên · số chứng chỉ hành nghề · nơi cấp · hạn | sổ chứng chỉ các Sở Xây dựng | cao — khoá của cả hồ sơ | có, với cá nhân |
| 2 · Sản lượng | tin đang đăng · tin mới 30 ngày · quận/huyện · khoảng giá · nhịp đăng · gói trả phí đang dùng | tin đăng trên sàn, suy ra người đăng | vừa, đo được | có, khi gắn vào một người |
| 3 · Tự khai | loại bất động sản chuyên bán · thế mạnh · giới thiệu | chính đối tác | thấp — nhưng là lớp duy nhất có đồng ý | không |

Phát hiện của buổi khai thác: **môi giới là nghề có điều kiện, mỗi người có số
chứng chỉ do Sở Xây dựng cấp** — một khoá định danh chính thức, duy nhất, công
khai. Bài toán không phải cào cho nhiều mà là cào cho khớp. Hai điều ghi trước:

- Sổ chứng chỉ trả lời «được phép», không trả lời «giỏi». Chuyên môn, địa bàn,
  loại bất động sản nằm ở lớp 2 và 3.
- Nhiều người xưng môi giới không có trong sổ. Đó là bộ lọc chất lượng miễn
  phí, không phải lỗ độ phủ.

**Tín hiệu đáng giá nhất cho tiếp thị: gói trả phí đang dùng trên sàn khác.**
Người đang trả tiền cho sàn khác đã chứng minh hai điều cùng lúc — có ngân sách
và đang tìm khách. Đó là chân dung khách hàng lý tưởng, và nó là trường không
mua được ở đâu.

## Trục phân khúc — máy liệt để chặn sót, người chốt lấy trục nào vào vòng đầu

| Trục | Chia thành | Có sẵn hôm nay? |
|---|---|---|
| Sản lượng | cao · vừa · thấp · ngủ | không — cần bước làm giàu |
| Loại bất động sản | căn hộ · đất nền · nhà phố · cho thuê | không |
| Địa bàn | theo quận, huyện | một phần |
| Hình thái | công ty · cá nhân thuộc công ty · cá nhân tự do | một phần |
| Giấy phép | có số chứng chỉ · không | không |
| Ngân sách | đang trả phí sàn khác · chỉ dùng miễn phí | không |
| Quan hệ với OneHub | chưa chạm · đã chạm chưa trả lời · đã từ chối · đã vào | có, trong CRM |

Trục cuối là trục duy nhất CRM đã có, và nó là trục **kiểm được giả định 1 mà
không dựng gì**.

## Kênh tiếp cận — máy đề xuất, người chốt

Gọi lạnh vào số cào được là lựa chọn tệ trên cả hai trục: tỷ lệ phản hồi thấp
**và** rủi ro pháp lý cao. Bốn kênh tốt hơn trên cả hai:

| Kênh | Vì sao tỷ lệ cao hơn | Vòng đầu |
|---|---|---|
| Tổng đài công ty công bố | Số đăng ra để nhận việc. Ký một công ty 40 người = 40 cá nhân, một cuộc gọi | **máy đề xuất chọn** |
| Liên hệ trên chính tin đăng | Số đó công bố để nhận cuộc gọi về bất động sản | sau |
| Giới thiệu từ đối tác đã vào | Kênh tuyển có tỷ lệ cao nhất ở mọi thị trường | sau |
| Hạt giống — thứ đối tác cần | Họ tự tìm tới, mang theo đồng ý và tín hiệu ý định | sau, và là đường mở lớp 3 |

Targeting đúng nghĩa growth không phải «nhắm 10.000 số» mà là **nhắm 50 công ty
và biết chính xác nói gì với từng công ty**.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Phân khúc làm tỷ lệ phản hồi chênh nhau — nhóm nhắm đúng trả lời nhiều hơn nhóm còn lại | Toàn bộ công làm giàu vô ích: chia kiểu gì cũng ra một kết quả. Ý tưởng chết ở gốc | Lấy mọi lượt tiếp cận đã có trong CRM, chia theo trường đã biết (địa bàn · hình thái · trạng thái quan hệ), so tỷ lệ trả lời. **Không dựng gì** | Chưa thử — **nặng nhất** |
| 2 | Có kênh tiếp cận vừa hợp pháp vừa đủ tỷ lệ phản hồi để đội tiếp thị dùng thật | Ba bước đầu thành cái kho không ai mở | Một câu hỏi pháp chế OneHub về luật bảo vệ dữ liệu cá nhân và quy định chống cuộc gọi, tin nhắn rác; cộng 20 cuộc gọi thử vào tổng đài công ty, đếm số lần nói chuyện được | **Vế pháp lý đã hỏi 2026-09-04** — owner khai miệng: đã hỏi pháp chế; số điện thoại công khai dùng được, và trang danh bạ môi giới là nơi người đã đồng ý công khai thông tin của mình. Vế tỷ lệ phản hồi **chưa thử** |
| 3 | Đội tiếp thị hôm nay chạy chiến dịch bằng tay hoặc bằng bảng tính, và họ sẽ chuyển sang CRM | Dựng xong đội vẫn xuất ra bảng tính; công cụ thành nơi chép lại kết quả | Ngồi cạnh đội tiếp thị một buổi: họ đang chạy gì, bằng gì, số nằm ở đâu | Chưa thử |
| 4 | Số chứng chỉ tra được và khớp được ở quy mô | Khoá không tồn tại trên thực địa; quay về khớp mờ theo tên và số điện thoại | 20 cá nhân đội đã tiếp xúc: tra tay, đếm tìm được bao nhiêu, trên sàn bao nhiêu người ghi số | Chưa thử |
| 5 | Trang nguồn có thật trường sản lượng đủ để xếp hạng | Chỉ còn danh bạ: giá trị thấp, hỏng sau vài tháng | Mở ba trang owner dẫn, liệt kê trường có thật, không đoán | Chưa thử |
| 6 | Cào sàn bền trong sức đội — đây là thuế hàng tháng, không phải dựng một lần | Hồ sơ đóng băng ở lần cào cuối; số cũ mà trông như mới | Cào thử 100 tin trong một ngày, đếm số lần bị chặn | **Rẻ hơn tưởng — khảo sát 2026-09-04.** Xưởng `~/dev/crawl` đã có bộ công cụ chạy được, đã đo, và có lối bóc bằng khuôn không gọi mô hình mỗi trang. Vế «sàn chặn tới đâu» vẫn **chưa thử** |

Giả định 1 và 3 là hai cái nặng nhất, và **cả hai không phải câu hỏi kỹ thuật**.
Giả định 1 kiểm được ngay trên dữ liệu đang có.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Đội tiếp thị chạy trọn một chiến dịch tuyển đối tác trong CRM mà không phải xuất ra bảng tính không, và phân khúc có làm tỷ lệ phản hồi chênh nhau không?
- Kết quả nào là SỐNG: Bốn tuần sau khi bật, đội tiếp thị chạy trọn ít nhất ba chiến dịch trong CRM — phân khúc định nghĩa trong hệ, danh sách tự sinh, kết quả gắn ngược về đúng chiến dịch — và ít nhất một phân khúc cho tỷ lệ trả lời cao hơn trung bình toàn tập từ 2 lần trở lên.
- Kết quả nào là CHẾT: Đội vẫn xuất bảng tính để chạy; hoặc kết quả không gắn ngược về chiến dịch được; hoặc mọi phân khúc cho tỷ lệ trả lời như nhau — khi đó việc làm giàu không mua được gì.
- Timebox: Năm ngày công cho vòng đầu — một trục phân khúc, một kênh, một chiến dịch. Quá năm ngày nghĩa là đang dựng cả bốn bước cho cả hai làn.

Căn cứ của con số: **2 lần là ngưỡng chứng minh việc làm giàu có giá trị** — dưới
mức đó thì chia nhóm không hơn chia ngẫu nhiên ở cỡ vài trăm lượt chạm. Ba chiến
dịch là ranh «đội thật sự dùng» so với «chạy thử một lần cho có». **Chưa có
đường nền**: tỷ lệ trả lời trung bình hôm nay phải đo trước khi bật, không thì
không có gì để so.

## Kết quả prototype

Chưa dựng gì. Buổi khai thác 2026-09-04 phân kỳ không gian và xếp giả định.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Trường dữ liệu và tín hiệu sản lượng trên trang nhà môi giới | batdongsan.com.vn/nha-moi-gioi · nhatot.com/chuyen-trang-moi-gioi-bat-dong-san-toan-quoc | triết-lý/logic | có — làm nguồn, sau khi giả định 2 và 5 có câu trả lời | — |
| Giao diện trang hồ sơ môi giới của các sàn | cùng hai địa chỉ trên | ngôn-ngữ-thiết-kế/hình-thái | **không** — chuẩn của kho thắng | — |
| Sổ chứng chỉ hành nghề môi giới bất động sản | các Sở Xây dựng — từng tỉnh, chưa rõ tra tập trung được không | triết-lý/logic | có — làm khoá định danh | — |
| Mô hình nền tảng giữ thành tích của môi giới | Beike (Trung Quốc), đã ghi ở `CONTEXT.md` | triết-lý/logic | có — ý tưởng, không phải mã hay hình | — |
| Luật giao diện của kho | `docs/design.md` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |
| Luật «trí khôn sống ở tác nhân, không ở API» | `AGENTS.md` · `docs/api.md` | triết-lý/logic | có — cào, khớp và chấm điểm là việc của tác nhân; API chỉ ghi một hàng việc | — |
| Xưởng crawl4ai đã dựng và đã đo | `~/dev/crawl` — máy chủ Docker 0.9.2, bộ SDK Python, sổ vận hành 481 dòng, bản đồ 142 năng lực | triết-lý/logic | có — xem mục khảo sát dưới | — |
| Khuôn cắm nhà cung cấp làm giàu của kho | `apps/agent/agent/lib/capabilities.ts` · `tools/enrich_company.ts` | triết-lý/logic | có — thiếu khoá thì mất năng lực, không ngã | — |

### Khảo sát xưởng crawl4ai — 2026-09-04, SAU khi ký Cổng Đáng

Ghi riêng để không sửa lời ký. Khảo sát này không đổi `decision`; nó trả lời
trước hai giả định và thêm một quyết định kiến trúc cho bước chuẩn hoá yêu cầu.

**Ranh giới quyết định kiến trúc.** Máy chủ crawl4ai coi mọi lệnh đến từ mạng là
không tin được và cắt bớt: duyệt sâu nhiều trang, xoay proxy, chế độ tàng hình,
chạy mã trên trang — tất cả **chỉ dùng được khi gọi thẳng bộ thư viện Python**,
gọi qua máy chủ thì trả lỗi. Đúng những thứ ô này cần đều nằm bên bị cắt. Hệ quả:
không đi đường máy chủ có sẵn được, phải là một tiến trình Python.

**Ba lối cho tiến trình đó, máy khuyên lối (c):**

| Lối | Cách | Giá |
|---|---|---|
| a | Dịch vụ Python riêng, tác nhân gọi qua mạng nội bộ | thêm một thứ phải triển khai và trực |
| b | Chỉ dùng máy chủ có sẵn | mất duyệt sâu, mất proxy, mất tàng hình |
| **c** | **Việc chạy theo lịch, ngoài CRM, ghi thẳng vào cơ sở dữ liệu** | **không thêm dịch vụ; hợp luật vì thu thập không phải trí khôn** |

Chấm điểm và phân khúc vẫn là trí khôn và vẫn sống ở tác nhân. Thu thập là việc
tay chân, và luật của kho cấm nó nằm trong API chứ không bắt nó nằm trong tác nhân.

**Mô hình chi phí — điểm đổi cả bài toán.** Số đo trong sổ của xưởng: lấy trang
thuần 0,7 giây một trang; kèm mô hình ngôn ngữ thì 1,46 giây (dịch vụ ngoài) tới
91 giây (mô hình chạy tại máy). Với hàng chục nghìn tin đăng, gọi mô hình cho
từng trang là không khả thi. Đường đúng: **dùng mô hình sinh khuôn bóc MỘT LẦN
cho mỗi sàn, rồi bóc bằng khuôn đó** — không gọi mô hình ở vòng chạy hằng ngày.
Năng lực sinh khuôn và tự tinh chỉnh khuôn có sẵn trong bộ thư viện.

Điều này hạ giả định 6 từ «thuế hàng tháng đắt» xuống «thuế hàng tháng rẻ, chỉ
trả lại khi sàn đổi giao diện». Nó KHÔNG xoá giả định 6 — sàn vẫn chống bot, và
khuôn vẫn vỡ khi giao diện đổi.

**Còn một lối rẻ hơn nữa chưa tính tới:** bộ thư viện lấy được danh sách địa chỉ
trang từ sơ đồ site và từ kho lưu trữ web công cộng, tức là biết có những trang
nào mà không phải duyệt từng trang danh sách. Ít chạm vào sàn hơn, và rẻ hơn.

**Khuôn cắm đã có sẵn trong kho.** Kho đã có một nhà cung cấp làm giàu
(`context.dev`) cắm theo khuôn «thiếu khoá thì mất năng lực, không ngã». Xưởng
crawl4ai vào **đúng khuôn đó**, làm năng lực thứ hai — không phải một kiến trúc
mới. Và hai bên không giẫm nhau: nhà cung cấp hiện tại không có dữ liệu môi giới
Việt Nam, đó chính là lỗ ô này lấp.

**Sáu món nợ của xưởng, ghi trước khi tựa vào nó:**

1. Mô hình ngôn ngữ nhanh nhất ở đó do một phiên làm việc khác quản; nó khởi động
   lại và đổi tên bất cứ lúc nào. Bản chạy thật của CRM không được tựa vào nó.
2. Bộ thư viện đang là bản chép sửa tại chỗ, không ghim phiên bản. Bản chạy thật
   phải ghim.
3. Một thư viện nền bị ghim trần có chủ đích; nâng mù là hỏng. Sổ đã ghi.
4. Bản Python đang dùng vượt mức nhà phát triển khai báo hỗ trợ.
5. Docker ở đó chạy chung bộ nhớ với một chồng dịch vụ khác — là môi trường thử,
   không phải môi trường chạy thật.
6. Xưởng **không có một dòng nào** về hai sàn của bài toán này. Toàn bộ phần khuôn
   bóc cho từng sàn là việc chưa làm.

Giấy phép của bộ thư viện là Apache 2.0 — dùng được trong sản phẩm nội bộ này.
Bộ thư viện có sẵn năng lực tuân thủ tệp khai báo cho máy quét của trang chủ;
bước chuẩn hoá yêu cầu phải quyết bật nó, và máy đề xuất bật.

## Cổng 0

- **decision = build.** Người ký: Mạnh, 2026-09-04. Căn cứ: OneHub đang chạy nhưng chưa có CRM cho việc thu hút và giữ đối tác; thị phần tăng bằng cách kéo môi giới vào mạng lưới, nên đây là việc không có ngày kết thúc. Vế pháp lý — cái chặn bước tiếp cận — owner đã hỏi và trả lời cùng ngày.
- **disposition = archive.** Căn cứ: buổi khai thác không dựng bản thử nào, nên không có mã nào để giữ.
- **Ngưỡng UAT chốt:** Mạnh, 2026-09-05, sau khi vòng đã ký Cổng Bằng chứng và mở PR — gỡ tiền tố đề-xuất-của-máy khỏi bốn dòng ở mục Ngưỡng, giữ nguyên chữ máy đề xuất. Ngưỡng SỐNG đo bốn tuần sau khi bật, nên phiên nghiệm thu lên lịch khi cửa sổ đó khép; trước đó mọi ô đo là CHƯA ĐO. Dòng «trung bình toàn tập» đo bằng đối chứng trong CRM (mọi chiến dịch khác), không cần đường nền trước khi bật.

### Điều owner khai tại Cổng Đáng, và ranh giới của nó

Owner khai 2026-09-04: đã hỏi pháp chế; **số điện thoại công khai** dùng được, và
**trang danh bạ môi giới là nơi người đã đồng ý** công khai thông tin của mình.
Ghi ba điều để hồ sơ không nói quá lời khai:

1. Đây là **lời khai miệng tại cổng**, chưa có văn bản của pháp chế trong hồ sơ.
   Bước chuẩn hoá yêu cầu nên xin một dòng xác nhận bằng văn bản và đính vào đây.
2. Lời khai trả lời câu **thu thập và lưu**. Câu **gửi** — nhắn tin, gọi, thư
   quảng cáo tới một số chưa đăng ký nhận — là quy định riêng, và hồ sơ chưa có
   câu trả lời cho nó. Vòng đầu giữ kênh tổng đài công ty nên chưa chạm câu này.
3. Hệ quả: căn cứ để **làn công ty đi trước** yếu đi, vì làn cá nhân không còn
   bị chặn. Ba lý do còn lại vẫn đứng — ký một công ty kéo theo cả đội ngũ, dữ
   liệu công ty ít hỏng hơn, và một cuộc gọi tới tổng đài rẻ hơn bốn mươi cuộc
   gọi lẻ. Người mở làn cá nhân vào vòng đầu thì nói ở bước chuẩn hoá yêu cầu.

**Phạm vi vòng đầu — máy đề xuất, người chưa chốt:** làn **công ty** (pháp nhân),
kênh **tổng đài công bố**, một trục phân khúc, và **phần đo là bắt buộc**. Căn
cứ: công ty không mang dữ liệu cá nhân nên bước bốn không kẹt chờ câu trả lời
pháp chế; ký một công ty kéo theo cả đội ngũ của nó; và phần đo là thứ phân biệt
máy tiếp thị với một danh bạ. Phạm vi này chốt ở hợp đồng bước kế, không phải ở
đây.

## Thước đo thành công → ứng viên criterion

- Chênh lệch tỷ lệ trả lời giữa phân khúc cao nhất và trung bình toàn tập.
- Số chiến dịch chạy trọn trong CRM trong bốn tuần, không xuất bảng tính.
- Số giờ người trên một đối tác ký, so với đường nền trước khi bật.
- Độ phủ làm giàu: phần trăm hồ sơ công ty có đủ ba trường phân khúc chính.
- Tỷ lệ liên hệ sai hoặc hồ sơ trùng trên tổng lượt gửi — chất lượng dữ liệu.
- Độ tươi: khoảng cách từ lần làm giàu cuối tới hôm nay, hiện ngay trên hồ sơ.

## Out of scope từ khám phá

- Hồ sơ công khai cho khách hàng và công ty tra — bác: không thuộc CRM nội bộ,
  là mặt nền tảng. Owner chốt phạm vi 2026-09-04: vòng này chỉ phục vụ tiếp thị.
- Bản đồ thị trường theo quận — chuyển sang ô `mo-o-dau`, đang cân nhắc, hạ ưu
  tiên cùng ngày. Địa bàn vẫn còn ở đây, nhưng là **một trục phân khúc**, không
  phải một sản phẩm riêng.
- Gửi hàng loạt tới cá nhân từ dữ liệu cào chưa có căn cứ — bác: tệ trên cả hai
  trục, tỷ lệ phản hồi thấp và rủi ro cao.
- Tự động hoá trọn chuỗi ở vòng đầu — bác: bước nhắm làm tay, một chiến dịch.
  Tự động hoá thứ chưa chứng minh có tác dụng là nhân sai số lên.
- Chấm điểm bằng mô hình học máy — bác ở vòng đầu: luật đếm được trước, vì luật
  giải thích được cho đội tiếp thị còn mô hình thì không.
- Nhân viên quan hệ khách hàng ngân hàng và loại đối tác khác — vòng sau; nhưng
  hồ sơ dựng với *loại đối tác* là một trường, không khoá vào nghề môi giới
  (luật danh từ trong `CONTEXT.md`).
- Tín hiệu giữ chân — đối tác đã vào mà sản lượng bên ngoài tăng còn trên OneHub
  giảm — ý kế tiếp trên cùng tầng dữ liệu, ghi để khỏi mất; không vào vòng này.

## Từ vựng ứng viên cho từ điển sản phẩm

Chưa thêm vào `CONTEXT.md` — buổi khai thác không sửa từ điển. Bước S1 phải thêm
mục trước khi dùng trên màn hình:

- **số chứng chỉ** — số chứng chỉ hành nghề môi giới bất động sản do Sở Xây dựng
  cấp; khoá định danh của một cá nhân trong hồ sơ.
- **sản lượng** — số tin đang đăng và nhịp đăng của một cá nhân hoặc công ty
  trên các sàn; thước xếp hạng.
- **phân khúc** — một nhóm đối tác định nghĩa bằng luật đếm được; danh sách tự
  sinh và tự cập nhật, không phải danh sách chép tay.
- **chiến dịch** — một lượt tiếp cận có phân khúc, kênh, lời chào và kết quả đo
  ngược về.
