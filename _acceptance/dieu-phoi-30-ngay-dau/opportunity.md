---
schema_version: 1
slug: dieu-phoi-30-ngay-dau
feature: Cả đội điều phối 30 ngày đầu của đối tác mới ngay trong CRM, thôi dùng Google Sheet và giấy tờ tay
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-19T16:42:44Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Ký xong là hết phần dễ. Toàn bộ quan hệ còn lại là vận hành cùng đối tác trên
nền tảng, và **30 ngày đầu quyết định phần lớn kết cục** — nên ở đúng quãng đó
OneHub huy động nhiều bộ phận cùng lúc: đào tạo sử dụng, phổ biến chính sách
nền tảng, chuyển dữ liệu (owner, buổi khai thác 2026-09-19).

Điều phối quãng đó hôm nay sống ở **Google Sheet và giấy tờ tay**. Owner nêu
bốn cơn đau, và khai là cả bốn cùng có:

- Việc rơi giữa các bộ phận.
- Không ai biết một đối tác đang ở đâu.
- Đối tác nguội mà không ai kịp thấy.
- Hiệu quả thành công của đối tác thấp.

**Người gặp: nhân viên quan hệ đối tác, cộng các bộ phận cùng vào quãng 30
ngày** — đào tạo, kỹ thuật, vận hành. Số bộ phận và ai có tài khoản CRM hôm nay
là câu chưa trả lời (giả định 4).

Ghi rõ để không trượt tay, chép cách khai của ô `tiep-thi-tuyen-doi-tac`:
**nội bộ không có nghĩa là không có người dùng.** Các bộ phận này là người dùng
cuối thật — họ gõ, họ quay về Sheet nếu công cụ dở. Ô này KHÔNG đi lối «Không
đo được»; nó có ngưỡng đo trên chính họ.

### Phạm vi owner chốt 2026-09-19

Đây là **sản phẩm nội bộ**, việc của nó là giải nghiệp vụ và quản lý. Thành
công của ô này là **toàn đội nghiệm thu và phản hồi là dùng được, thay được
Google Sheet và giấy tờ hiện nay**. Hiệu quả kinh doanh còn lại **owner đo
riêng, ngoài ô này**, cố ý — để không làm phức tạp hoá quá trình.

Quyết định này gỡ một chốt máy đã nêu trong cùng buổi: máy lập luận rằng ba
trong bốn con số định nghĩa thành công chưa chạm được từ CRM nên phải kéo ống
nước trước. Với phạm vi trên thì **lập luận đó không còn áp**: vòng một người
gõ tay, y như họ đang gõ vào Sheet. Nối máy là vòng sau.

### Gốc của bốn cơn đau — và vì sao một ô này tắt được ba

Máy đọc ba cơn đau đầu là bóng của **một** thứ: chưa ai chốt vạch đích. Không
có vạch đích thì không có trạng thái; không có trạng thái thì không ai *cầm*
được trạng thái nào (việc rơi), không có gì để *nhìn* (không ai biết ở đâu),
không có gì để *so* (nguội mà không thấy). Cơn đau thứ tư không cùng hạng — nó
là kết quả, và owner đã tách nó ra đo riêng.

Hệ quả cho thiết kế: ba tính năng riêng cho ba triệu chứng là lãng phí. Một
định nghĩa cộng một trạng thái sống trên bản ghi là đủ tắt cả ba.

### Từ điển của CRM dừng đúng ở chỗ ô này bắt đầu

`CONTEXT.md` ghi `Giai đoạn thoả thuận` là **CHƯA CHỐT NGHĨA** — dữ liệu vẫn
mang bảy bước phễu bán phần mềm thừa kế từ kho gốc (`DEMO_BOOKED`,
`QUALIFIED_TO_BUY`, `CLOSED_WON`). Nửa trước của quan hệ đang mặc chữ của nhà
khác; nửa sau chưa có chữ nào. Ô này KHÔNG nhận việc chốt nghĩa đó (xem Out of
scope) nhưng phải biết nó đang treo, vì hai bộ từ sẽ gặp nhau trên cùng một
bản ghi.

**Nợ từ điển của chính ô này:** chữ *onboarding* chưa có mục trong `CONTEXT.md`.
Theo luật kho, từ chưa có mục thì hoặc thêm mục trước, hoặc viết bằng chữ
thường ai cũng hiểu. Ô này tạm viết «30 ngày đầu» và «đưa đối tác vào guồng»;
thêm mục là việc của S1 nếu vòng được duyệt.

### Hình đúng của dữ liệu — thứ miễn phí bây giờ, đắt về sau

Thành công của một đối tác **không phải một dấu tích, mà là một phễu người**.
Owner khai cách đo hiện nay là *tỉ lệ môi giới của sàn hoạt động được trên nền
tảng*, với nhiều chỉ số: số môi giới hoàn thành khoá học, số active trên nền
tảng, số phát sinh giao dịch. Nghĩa là: ký với một **công ty**, nhưng đếm bằng
**cá nhân**. Một đối tác 40 môi giới không «xong» hay «chưa xong» — 12 người đã
lên và 28 chưa.

Bốn bậc, kèm nguồn số (cột nguồn là phỏng đoán của máy, giả định 2 kiểm lại):

| Bậc | Khi nào thường xảy ra | Nguồn số hôm nay |
|---|---|---|
| Có tài khoản trên nền tảng | tuần 1 | cần kiểm — CRM có biết không |
| Hoàn thành khoá học | tuần 1–2 | ngoài CRM, phải nối |
| Hoạt động trên nền tảng | tuần 2–4 | **không có nguồn nào trong CRM** |
| Phát sinh giao dịch | tháng 2–3, có khi lâu hơn | chưa rõ ai giữ số |

Vạch 30 ngày nằm giữa bậc ba và bậc bốn. Nghĩa là **cửa sổ 30 ngày về mặt vật
lý không chứa nổi bậc cuối** — mọi thứ đo trong 30 ngày chỉ có thể là chỉ báo
sớm, và phải tự chứng minh nó dự báo được kết cục.

Đề nghị duy nhất máy xin giữ lại từ phân tích này: **cho người gõ vào hình phễu
(mẫu số + các bậc), đừng gõ vào ô tích.** Cùng công gõ; nhưng sau này thay
tay-gõ bằng đường ống thì màn hình không phải vẽ lại, và phần đo lường riêng
của owner có sẵn số mà không phải đi thu lại.

### `Sản lượng` KHÔNG phải thước thành công — nó là biến đối chứng

Máy đã khẳng định sai một lần trong buổi và tự sửa, ghi lại để khỏi sai lần
nữa: `Sản lượng` (Cao · Vừa · Thấp · Ngủ) do bộ cào đọc chuyên trang môi giới
của **nhatot** — một sàn bên ngoài (`docs/guides/goi-moi-gioi-trong-crm.md`).
Nó nói người đó **có đang làm nghề** hay không, KHÔNG nói họ có làm với OneHub
hay không.

Ghép hai chiều lại thì mỗi ô đòi một cách xử lý khác hẳn:

| | Im trên OneHub | Hoạt động trên OneHub |
|---|---|---|
| **Cao ở nhatot** | đang mất vào sàn khác — họ vẫn làm nghề, chỉ không làm với mình | đúng đích |
| **Ngủ ở nhatot** | không làm nghề — đào tạo cũng vô ích, nên ra khỏi mẫu số | mình kéo dậy được |

Hai lối dùng, cả hai đều rẻ và không cần nền tảng cấp số nào:

- **Lọc mẫu số.** Mẫu số không phải 40 người trên danh sách công ty, mà là
  những người đang thật sự làm nghề. Lấy cả 40 là tự dìm tỉ lệ của mình.
- **Tách hai loại thất bại.** Người Cao ở nhatot mà im trên OneHub không thiếu
  đào tạo — họ dùng phần mềm rất giỏi, chỉ là của người khác. Gộp họ vào danh
  sách «cần tập huấn lại» là đem sai thuốc đi chữa, và có thể là một phần của
  câu «tốn rất nhiều nguồn lực».

Hai cảnh báo về dữ liệu, lấy từ tài liệu bộ cào, phải biết trước khi tin nửa
dưới của bảng:

- **Mức Thấp và Ngủ đang rỗng.** Bộ cào lấy từ đầu danh bạ, nơi nhatot xếp
  người sản lượng cao trước. Muốn dùng được phải cào đúng danh sách môi giới
  của đối tác, không cào từ đầu danh bạ.
- **Không có chuỗi thời gian.** Sàn chỉ công bố một con số, và «Tin mới 30
  ngày» bằng đúng «Tin đang đăng». Muốn thấy *đang nguội* thì phải tự chụp lại
  theo mốc rồi so.

### «Mọi người nhìn vào một chỗ» — định nghĩa «mọi người» đang nhỏ hơn bài toán

Owner hình dung một chỗ chung kiểu Trello. Máy phản biện, ghi lại để khỏi bàn
lại: phần lớn việc trong 30 ngày **bị chặn bởi chính đối tác** — họ giao dữ
liệu, họ cử người đi học, họ bảo môi giới mở tài khoản. Một bảng chỉ có các bộ
phận nội bộ thì vĩnh viễn không hiện ra được chữ «đang chờ đối tác», nên mọi
lần chậm đều trông như đội mình chậm, và phản xạ đúng của tổ chức khi thấy vậy
là ném thêm người vào.

Danh mục phần mềm cho đúng việc này đã tồn tại và không phải bảng việc chung:

| Danh mục | Nó giữ gì | Tắt cơn đau nào | Ai đang làm |
|---|---|---|---|
| Bảng việc chung | việc, người làm, hạn | việc rơi — một nửa | Trello · Asana · monday |
| Cổng onboarding khách | kế hoạch chung hai bên, mốc, cổng cho khách | việc rơi · không ai biết ở đâu | GUIDEcx · Rocketlane · Arrows · Dock |
| Nền quản trị thành công | điểm sức khoẻ từ tín hiệu dùng thật, tự bắn việc khi tụt màu | nguội âm thầm | Gainsight · ChurnZero · Totango |
| Quản trị đối tác (PRM) | đào tạo, chứng chỉ, mở quyền lợi theo chứng chỉ, bậc | hiệu quả thấp — phần đào tạo | Impartner · PartnerStack · ZINFI |

Bốn chỗ Trello gãy, có tên: không có màn nhìn toàn danh mục (hai mươi đối tác
thành hai mươi bảng); không nối được việc giữa bảng của các bộ phận; không có
logic điều kiện (đối tác 8 người khác đối tác 80 người); và chí mạng — một thẻ
chỉ biết thứ người gõ vào, nên **Trello theo dõi ý định, còn bài này là kết
quả**.

Vòng một của ô này nằm ở dòng hai của bảng, không phải dòng một. Cổng cho chính
đối tác nhìn vào thì để vòng sau (Out of scope).

### Hướng chiến lược owner chốt 2026-09-19

Đi đường **Compass** (dồn vào sản phẩm), nhưng gia tăng giá trị kiểu **Keller
Williams** (đào tạo, đi cùng người) ở giai đoạn đầu, vì đặc trưng Việt Nam là
phải educate thị trường.

Máy ghi kèm cái bẫy, để lần sau có người hỏi thì có sẵn câu trả lời: đây là một
cuộc **chuyển**, không phải một sự pha trộn — pha trộn thì không có điều kiện
dừng, và guồng kiểu Keller Williams luôn có lý do chính đáng để ở lại thêm một
quý. Hệ quả cho ô này: công cụ không chỉ để **chạy** guồng người cho trơn, mà
còn để **sinh ra bằng chứng bỏ bớt guồng người** — mỗi lượt là một thí nghiệm
nhỏ: chạy guồng người → đo bậc nào nhúc nhích → bỏ việc không ăn thua → đóng
gói việc ăn thua vào sản phẩm.

Và một thứ trực giác thường xếp ngược: **đào tạo đáng đóng gói TRƯỚC, chuyển dữ
liệu đáng giữ người LÂU NHẤT.** Vì đào tạo lúc này phần lớn là kiến thức chung
— giống hệt nhau ở mọi đối tác, nên lặp lại được, nên đóng gói được. Chuyển dữ
liệu thì không có hai ca giống nhau.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Cái Google Sheet đang dùng chứa gần đủ những cột cần, tức đây là chuyển nhà chứ không phải thiết kế nghiệp vụ mới | Vòng này to gấp mấy lần ước lượng: phải định nghĩa nghiệp vụ trước rồi mới dựng | Xin bản Sheet đang dùng, đọc, đếm cột nào đã có nguồn trong CRM và cột nào chưa | Chưa thử — **đi trước mọi phép thử khác** |
| 2 | Đội thật sự sẽ bỏ Sheet, không ghi song song hai chỗ | CRM thành nơi nhập liệu thứ hai; tổng công tăng lên chứ không giảm — công cụ nội bộ không thay được cái cũ là việc cộng thêm | Ngồi cạnh một người đang gõ vào Sheet một lượt; hỏi thẳng họ sẽ bỏ Sheet với điều kiện gì | Chưa thử |
| 3 | Việc rơi giữa các bộ phận là vì thiếu một chỗ chung, không phải vì thiếu người cầm trịch | Phần mềm không chữa được; cần đổi cách phân công trước, và ô này hoãn | Lấy ba ca chậm gần nhất, hỏi từng ca: chậm vì không ai biết, hay vì không ai nhận | Chưa thử |
| 4 | Các bộ phận ngoài đội quan hệ đối tác sẽ có tài khoản CRM và chịu vào đó ghi | Vẫn phải có một bản sao ngoài, và Sheet sống tiếp bất kể ô này làm gì | Một câu hỏi cho mỗi trưởng bộ phận đang tham gia 30 ngày | Chưa thử |
| 5 | Gõ tay số của bốn bậc là chịu được ở vòng một | Số sẽ cũ mà trông như mới — đúng bẫy «cột trống» mà `CONTEXT.md` ghi ở mục Số chứng chỉ, và sau đó không ai tin cột nào nữa | Hỏi: bậc nào cần cập nhật hằng ngày? Bậc nào hằng tuần là đủ? Bậc phải cập nhật hằng ngày thì gõ tay chết | Chưa thử |

Giả định 1 rẻ nhất và có thể đổi hẳn cỡ của ô. Giả định 2 nặng nhất và không
phải câu hỏi kỹ thuật.

## Ngưỡng chết / ngưỡng UAT

Ô này có người dùng cuối thật (các bộ phận chạy 30 ngày), nên KHÔNG đi lối
«Không đo được». Bốn dòng dưới đây **đã chốt tại Cổng Đáng ngày 2026-09-19** —
máy đề xuất, owner ký nguyên văn không sửa số. Đổi phép đo sau này phải ghi
`[SUPERSEDED <ngày> — <phép đo mới>]` và giữ bản gốc bên dưới.

- Câu hỏi phép đo trả lời: Sau khi bật, đội có thật sự thôi dùng Google Sheet cho việc điều phối 30 ngày đầu không?
- Kết quả nào là SỐNG: Sáu tuần sau khi bật, đủ bốn điều — (a) mọi đối tác ký mới trong kỳ được điều phối trọn vẹn trong CRM, không đối tác nào rơi ra Sheet; (b) Sheet điều phối cũ không còn lần cập nhật nào trong hai tuần cuối kỳ; (c) trong phiên nghiệm thu, mỗi bộ phận có mặt chấm kín câu «dùng được thay Sheet» và không bộ phận nào chấm dưới 4/5; (d) câu «đối tác X đang tắc ở bậc nào» trả lời được từ một màn, không phải đi hỏi người.
- Kết quả nào là CHẾT: Hết sáu tuần mà Sheet vẫn được cập nhật cho ít nhất một đối tác đang trong 30 ngày; hoặc có bộ phận khai họ phải ghi cả hai chỗ. Ghi hai chỗ đủ để chết — công cụ nội bộ không thay được cái cũ thì nó là việc cộng thêm, không phải việc thay thế.
- Timebox: Một ngày cho phép thử đọc-trước (giả định 1 và 2), TRƯỚC khi dựng gì. Qua được thì hai ngày công cho bản bấm được: màn danh mục và một hồ sơ đối tác. Quá hai ngày nghĩa là đang xây sản phẩm chứ không phải hội tụ ý định.

Căn cứ cho vế (b): đo bằng **lịch sử sửa của Sheet** chứ không bằng lời khai,
vì «chúng tôi chuyển sang CRM rồi» là câu ai cũng nói được, còn một dòng sửa
lúc 11 giờ đêm thứ Sáu thì không cãi được. Căn cứ cho vế (d): đó chính là cơn
đau số hai của owner, và nó đo được bằng đồng hồ bấm tay trong phiên nghiệm
thu, không cần nền tảng cấp số nào.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Google Sheet và giấy tờ điều phối 30 ngày đang dùng | nội bộ OneHub — **CHƯA ĐỌC**, là việc kế | triết-lý/logic | có — và là nguồn số một của ô này | — |
| Khuôn kế hoạch chung hai bên, màn danh mục nhiều dự án | GUIDEcx · Rocketlane · Arrows · Dock (trang sản phẩm công khai) | triết-lý/logic | có | — |
| Layout, DNA thị giác, khuôn tương tác của các sản phẩm trên | cùng nguồn | ngôn-ngữ-thiết-kế/hình-thái | **không** — chuẩn của kho thắng | — |
| Điểm sức khoẻ bắn theo tín hiệu dùng; bậc phục vụ theo cỡ khách | Gainsight · ChurnZero · Totango (trang sản phẩm công khai) | triết-lý/logic | có — cơ chế; bậc phục vụ để vòng sau | — |
| Mở quyền lợi theo chứng chỉ | Impartner · PartnerStack · ZINFI (trang sản phẩm công khai) | triết-lý/logic | có về mặt ý — nhưng ngoài phạm vi vòng một, và là đổi chính sách chứ không phải đổi phần mềm | — |
| Hai guồng kích hoạt môi giới trong đúng ngành | Compass (đường sản phẩm) · Keller Williams (đường con người) | triết-lý/logic | có — owner đã chốt hướng 2026-09-19 | — |
| `Sản lượng` bốn mức và cách bộ cào tính | `docs/guides/goi-moi-gioi-trong-crm.md` | triết-lý/logic | có — làm bộ lọc mẫu số và biến đối chứng, **KHÔNG** làm thước thành công | — |
| Luật giao diện của kho | `docs/design.md` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |
| Từ điển sản phẩm | `CONTEXT.md` | triết-lý/logic | có — bắt buộc | — |

## Cổng 0

- **decision = build** Căn cứ (lời owner, buổi khai thác 2026-09-19, chép ý không diễn giải): đây là sản phẩm nội bộ, việc của nó là giải nghiệp vụ và quản lý; thành công là toàn đội nghiệm thu và phản hồi dùng được, thay cho giấy tờ và Google Sheet hiện nay. Hiệu quả kinh doanh owner đo riêng, cố ý tách ra để không làm phức tạp hoá quá trình.
- **disposition = archive** Căn cứ: chưa dựng prototype nào trong buổi khai thác, nên không có code để giữ; `base_commit` để trống là đúng trạng thái.
- **Ngưỡng UAT chốt cùng lúc ký:** nguyên văn bốn dòng ở section «Ngưỡng chết / ngưỡng UAT» phía trên — owner ký không sửa số. Phép đo trọng tâm: sáu tuần sau khi bật, mọi đối tác ký mới được điều phối trọn vẹn trong CRM; Sheet điều phối cũ không còn lần cập nhật nào trong hai tuần cuối kỳ; mỗi bộ phận chấm kín không dưới 4/5; câu «đối tác X đang tắc ở bậc nào» trả lời được từ một màn.

**Thứ tự với các ô khác:** ô này độc lập với bốn ô đang cân nhắc (bộ cào, tìm
trong phân khúc, mở ở đâu). Nó CÓ nợ khái niệm với việc chốt nghĩa
`Giai đoạn thoả thuận` — chưa có ô, và ô này cố ý không nhận (Out of scope).

## Thước đo thành công → ứng viên criterion

- Số đối tác đang trong 30 ngày hiện trên MỘT màn, kèm bậc đang tắc và số ngày
  kể từ chốt — nguồn sinh: chính CRM.
- Số lần Sheet điều phối cũ được cập nhật sau ngày bật — nguồn sinh: lịch sử
  sửa của Sheet, ngoài CRM; phải xin quyền xem trước khi hứa thước này.
- Thời gian trả lời câu «đối tác X đang tắc ở bậc nào» — đo tay bằng đồng hồ
  trong phiên nghiệm thu, so với cách làm hiện nay.
- Điểm chấm kín của từng bộ phận trong phiên nghiệm thu, chấm TRƯỚC thảo luận.
- Số bộ phận khai còn phải ghi hai chỗ — thước âm, càng gần 0 càng tốt.

Ghi để truy vết, KHÔNG phải thước của ô này: tỉ lệ môi giới của đối tác hoạt
động được trên nền tảng. Owner đo riêng (chốt 2026-09-19).

## Out of scope từ khám phá

- **Đo hiệu quả kinh doanh** (tỉ lệ môi giới hoạt động được, số hoàn thành khoá
  học, số phát sinh giao dịch) — owner chốt 2026-09-19 đo riêng, cố ý, để không
  làm phức tạp hoá quá trình.
- **Nối ống nước tới bốn con số của cái thang** — vòng một gõ tay như Sheet hôm
  nay; nối máy là vòng sau. Hình dữ liệu vẫn phải là phễu, để vòng sau thay
  nguồn mà không vẽ lại màn.
- **Cổng cho chính đối tác nhìn vào** — bác khỏi vòng một: CRM là sản phẩm nội
  bộ, mở cho người ngoài là đổi mô hình quyền, không phải thêm một màn. Nhưng
  đây là thứ duy nhất làm hiện được chữ «đang chờ đối tác», nên nó là ứng viên
  số một của vòng hai.
- **Mở quyền lợi theo chứng chỉ** (lối PRM) — hay, và là lối giảm chi phí mạnh
  nhất đã bàn; nhưng là đổi chính sách, không phải đổi phần mềm. Câu chặn:
  OneHub có gì đủ hấp dẫn để đặt sau cánh cửa đó chưa?
- **Chốt nghĩa `Giai đoạn thoả thuận`** — cần làm, nhưng đụng vào là đổi dữ
  liệu thừa kế của toàn bộ màn thoả thuận. Ô riêng.
- **Bậc phục vụ theo cỡ đối tác** (8 người khác 80 người) — để vòng sau, khi đã
  có số về chi phí thật theo bậc. Làm bây giờ là chia bậc bằng cảm giác.
- **Dùng `Sản lượng` làm thước thành công** — bác, với lý do ở mục Vấn đề: nó
  cào từ nhatot, đo người có làm nghề hay không, không đo hoạt động trên
  OneHub. Giữ làm bộ lọc mẫu số và biến đối chứng.
- **Bảng việc kiểu Trello làm vòng một** — không bác hẳn (việc có rơi thật, nên
  lớp việc có giá trị), nhưng bác việc làm nó TRƯỚC: xây một mình nó thì được
  một cái bảng đẹp và kết quả y như cũ, rồi rất khó xin tiền cho vòng hai.
- **Thêm mục `onboarding` vào `CONTEXT.md`** — việc của S1 nếu vòng được duyệt,
  không phải việc của buổi khai thác.
