---
schema_version: 1
slug: tiep-thi-tuyen-doi-tac
ran_at: 2026-09-06T09:20:00Z
variant: ui
chan: 1
lac: 1
kho_chiu: 7
vat: 3
chuyen_phien_nguoi: 7
---

# Lái-thử Người-lạ — ván 1, biến thể UI

Phiên lái là một phiên Claude Code hoàn toàn mới, đóng vai **nhân viên tiếp thị
ngày đầu đi làm**, được đưa một máy đã đăng nhập sẵn và câu «tuần này em gọi
môi giới». Không cấp mã, không cấp hợp đồng, không cấp bộ đo. Tri-giác tự trói:
chỉ ảnh chụp màn hình, cấm đọc DOM, cấm đọc kho. Phiên lái tự khai đã giữ đúng
luật, và ghi thẳng rằng ba kết quả gọi ở MT3 là thao tác thử nút chứ không phải
cuộc gọi thật.

Ván **dừng sớm theo luật ba-CHẶN** ở mục tiêu cuối.

## Môi trường của ván — người điều phối dựng, khai đủ

Kho dev trước ván là rác của các vòng chấm: 159 chiến dịch và 159 góc nhìn tên
`ttmtnl…` · `verifycheck1`, 316 cá nhân tên `…Rangttmtn…`, tất cả tạo trong cửa
sổ 04/09 14:00–24:00Z, và **không một môi giới nào** trong kho. Chủ kho duyệt
dọn. Người điều phối đã:

- sao lưu ra `dev-db-backup-2026-09-06.json` và `dev-contacts-litter-2026-09-06.json` **trước** khi xoá;
- xoá 159 chiến dịch, 74 lượt gọi, 159 góc nhìn, 316 cá nhân rác — giữ 46 cá nhân mẫu của hãng;
- thêm `LISTING_INGEST_SECRET` vào `.env` theo đúng dòng đã khai ở `.env.example`;
- nạp **49 môi giới** qua đúng cổng tiếp nhận thật của sản phẩm (`201 {"created":49,"updated":0}`), dựng luôn chín trường sàn.

Vào ván: 95 cá nhân (46 mẫu + 49 môi giới) · Sản lượng Cao 27, Vừa 23 · 0 chiến
dịch · 0 góc nhìn. Cửa sổ trình duyệt 1268×703, giao diện nền tối.

**Ba giới hạn của môi trường, khai trước để không ai đọc nhầm nhật ký:**

1. **Số điện thoại là chuỗi che.** Lô nạp lấy từ gói bằng chứng đã che danh
   tính, nên cả 49 môi giới mang cùng một chuỗi `09xxxxxxxx`. Lượt cào thật có
   49 số khác nhau (đo ở commit `982d771`).
2. **Chỉ có một chiến dịch.** Dọn rác xong thì kho rỗng, nên chiến dịch đầu tiên
   không có chiến dịch nào khác để làm đối chứng — đúng thiết kế đã chốt
   (`d-20260904T130100Z-doichung`).
3. **Huy hiệu «N Issues» góc dưới trái là lớp phủ của máy chủ dev**, không phải
   của sản phẩm. Nó đè lên đúng chỗ thông báo nổi hiện ra, hai lần phiên lái
   phải tắt nó mới đọc được máy đang nói gì. Không tính là vấp của sản phẩm.

## Mục tiêu (tiếng sản phẩm, giấu đường đi)

Ngân sách mỗi mục tiêu: 12 bước hoặc 5 phút, cái nào đến trước.

| Mục tiêu | Kết quả | Số bước |
|---|---|---|
| MT1 — tìm nhóm môi giới đăng nhiều tin nhất, giữ lại để lần sau khỏi lọc lại | xong | 9 |
| MT2 — mở một đợt gọi cho nhóm đó, đặt tên, cho chạy | xong | 6 |
| MT3 — gọi ba người và ghi kết quả từng cuộc | ghi được, **không gọi được** | 4 |
| MT4 — nhóm này có trả lời tốt hơn phần còn lại không | **BỎ CUỘC TẠI ĐÂY** | 5 |
| MT5 — kết thúc đợt gọi, rồi thử bỏ nhóm đã giữ | kết thúc xong, **bỏ nhóm không được** | 4 |

## Nhật ký vấp

Ba vấp phiên lái xếp CHẶN đã được người điều phối **đo lại trên vật**; hai trong
ba là do môi trường chứ không phải sản phẩm, và bị hạ loại kèm căn cứ. Cột cuối
ghi rõ mục nào trùng một giới hạn đã khai ở Cổng Bằng chứng.

| # | Loại | MT | Vấp gì (nguyên văn người-lạ) | Bằng chứng · đối chiếu |
|---|---|---|---|---|
| 1 | LẠC | MT1 | Thanh bên chỉ có 7 icon trần, không chữ, không tooltip nào tôi thấy được. Ngày đầu đi làm tôi phải bấm mò từng cái mới ra Cá nhân. Muốn tìm danh bạ mà chả có chữ nào ghi danh bạ. | `SD-MT1-step1.png` — mới |
| 2 | KHÓ-CHỊU | MT1 | Cột Tên hẹp đến mức mọi tên đều cụt thành «Chuy…». Cả bảng 95 người mà tôi không đọc được tên một ai. Tôi đang đi gọi người ta, tên là thứ đầu tiên tôi cần. | `SD-MT1-step2.png` — mới; người điều phối soi frame thấy thêm: năm cột Chức danh · Email · Công ty · Phụ trách · Hoạt động đều RỖNG hết mà vẫn chiếm quá nửa bề ngang |
| 3 | KHÓ-CHỊU | MT1 | Bộ lọc Sản lượng chỉ cho hai lựa chọn Cao và Vừa. Không có Thấp. Tôi không biết Cao là đăng bao nhiêu tin, phải tự đoán từ cột số bên cạnh. | `SD-MT1-step4.png` — trùng việc-của-người «ngưỡng 60/20/1 chưa có phân phối» |
| 4 | VẶT | MT1 | Hộp thoại Lưu bảng xem bật lên thì cả trang phía sau đen thui, mất sạch. Tôi tưởng mình bấm nhầm ra trang trắng. | `SD-MT1-step7.png` — mới |
| 5 | KHÓ-CHỊU | MT1→MT2 | Cùng một thứ mà ba tên: nút gọi là «Bảng xem», màn Chiến dịch rỗng bảo tôi lưu «góc nhìn dùng chung», form tạo chiến dịch gọi nó là «Phân khúc». Tôi mất một lúc mới dám tin ba cái đó là một. | `SD-MT2-step1.png` · `SD-MT2-step2.png` — mới, và nặng: ba tên cho một khái niệm trong một luồng ba bước |
| 6 | KHÓ-CHỊU | MT2 | Dòng chú thích dưới ô Phân khúc ghi «Chỉ hiện góc nhìn cá nhân đang dùng chung». Tôi lưu mà KHÔNG bật chia sẻ, nên tưởng phải quay lại sửa. Mở ra thì nó vẫn hiện. Câu chú thích nói sai việc máy đang làm. | `SD-MT2-step3.png` — **trùng Ngoài-18** đã ghi giới hạn đã biết; người-lạ tìm lại được độc lập |
| 7 | VẶT | MT3 | Cột Số điện thoại là liên kết gọi. Bấm vào thì trình duyệt nhảy ra trang lỗi, vì giá trị trong ô không phải số gọi được. | `SD-MT3-step1.png` — **HẠ TỪ CHẶN.** Đo lại: 49 môi giới mang cùng chuỗi che `09xxxxxxxx` vì lô nạp là lô đã che của hồ sơ bằng chứng. Sản phẩm hiện đúng thứ được nạp. Phần còn lại là thật và nhỏ: ô số điện thoại dựng liên kết gọi mà không kiểm giá trị có gọi được không |
| 8 | KHÓ-CHỊU | MT4 | Màn chiến dịch có sẵn đúng một ô tên «Mọi chiến dịch khác», và nó ghi «Chưa có đối chứng». Tôi lục hết 7 icon thanh bên, không có màn báo cáo nào. Không có con số nào so nhóm này với phần còn lại. | `SD-MT4-step1.png` · `SD-MT4-step5.png` — **HẠ TỪ CHẶN.** Đo lại: kho có đúng 1 chiến dịch, mà đối chứng theo thiết kế là «mọi chiến dịch KHÁC», nên n=0 và câu «chưa có đối chứng» là đúng. Điều còn lại là câu hỏi thiết kế, đã chuyển phiên người |
| 9 | KHÓ-CHỊU | MT4 | Bấm nhầm vào màn Chat thì toàn bộ chữ chuyển sang tiếng Anh giữa một phần mềm tiếng Việt. Màn Thoả thuận cũng vậy, tiền thì bảng Anh, đô Canada, euro, yên. | `SD-MT4-step2.png` · `SD-MT4-step3.png` — vùng mẫu của hãng, thuộc hồ sơ `tieng-viet-cho-crm` đang xếp lại sau |
| 10 | KHÓ-CHỊU | MT5 | Bấm Kết thúc là kết thúc luôn, không hỏi lại câu nào. Xong rồi thì nút Bắt đầu biến mất, không thấy đường mở lại. Một cú bấm nhầm là mất đợt gọi. | `SD-MT5-step1.png` — mới |
| 11 | **CHẶN** | MT5 | Tôi kết thúc đợt gọi rồi, màn ghi rõ Đã kết thúc và có cả giờ kết thúc, rồi bấm x để bỏ nhóm đã giữ. Máy từ chối, bảo tôi đi làm đúng cái việc tôi vừa làm xong. Tôi thử lại lần hai, vẫn y nguyên. Không có đường nào khác nó chỉ cho tôi. | `SD-MT5-step3.png` · `SD-MT5-step4.png` — **trùng Ngoài-15**, và đo lại xác nhận là thật, xem dưới |
| 12 | VẶT | MT5 | Câu báo lỗi đó viết bằng tiếng Anh, nhét tên chiến dịch tiếng Việt vào giữa. | `SD-MT5-step4.png` — trùng giới hạn đã khai «thông điệp lỗi máy chủ vẫn tiếng Anh» |

## Đo lại CHẶN-11 trên vật — người điều phối

Phiên lái kể đúng. Ba nguồn độc lập cùng nói một điều:

- **Trạng thái thật trong kho:** chiến dịch «Gọi môi giới đăng nhiều tin - tuần 1»
  có `status=FINISHED`, `finishedAt=09:45:28`. Góc nhìn «Môi giới đăng nhiều tin»
  vẫn còn, không xoá được.
- **Ảnh:** `SD-MT5-step4.png` hiện nguyên văn *«This view is the segment of Gọi
  môi giới đăng nhiều tin - tuần 1. Finish or repoint those campaigns first.»*
- **Mã:** `campaigns.service.ts` hàm `usedViewIds` truy vấn `where: { savedViewId }`
  và **không lọc theo trạng thái**, nên chiến dịch đã kết thúc vẫn chặn. Trong sản
  phẩm không có đường nào để trỏ chiến dịch sang góc nhìn khác. Góc nhìn đó vĩnh
  viễn không xoá được.

Đây đúng là **Ngoài-15** — mục người ký đã chọn «ghi Known limits» ở Cổng Bằng
chứng ngày 05/09. Điều ván lái thêm vào là: nó **chặn một việc thật của người
dùng ở lượt chạy đầu tiên**, chứ không chỉ là một dòng trong danh sách hạn chế.

## Đường dây

`drainEvents()` cuối cả năm mục tiêu: không lượt nào thấy trang tự báo lỗi. Mọi
lỗi người-lạ gặp đều là lỗi hiện thành chữ trên màn, không phải lỗi ngầm.

## Chuyển phiên người

Bảy câu đáng-giá; máy không trả lời câu nào.

1. Phần mềm có nên che số điện thoại của môi giới với chính người được giao đi gọi họ không? Nếu có lý do che, thì người gọi lấy số ở đâu?
2. Có đáng làm một màn so sánh «nhóm này với phần còn lại» không, hay ô «Mọi chiến dịch khác» đã là câu trả lời và chỉ cần chạy thêm một đợt đối chứng?
3. «Hẹn gặp» có nên được tính chung vào «Tỷ lệ trả lời» không? Nó làm hai con số trên cùng một màn không cộng lại thành gì rõ ràng.
4. Có nên cho mở lại một đợt gọi đã kết thúc không, hay kết thúc là chốt sổ vĩnh viễn?
5. Ba cái tên «Bảng xem», «góc nhìn», «Phân khúc» — nên chốt một tên, và đó là tên nào?
6. Màn Chat và màn Thoả thuận đang là dữ liệu mẫu tiếng Anh của hãng — có đáng dọn không, hay cứ để vậy vì môi giới không đụng tới?
7. **Của người điều phối:** Ngoài-15 đã được ký nhận là giới hạn đã biết trên giấy. Nay đo được rằng nó chặn một việc thật ở lượt chạy đầu. Nó có còn xứng đáng ở lại danh sách giới hạn đã biết không, hay phải nâng thành một vòng sửa trước khi mời người dự nghiệm thu?

## Bằng chứng

- **28 frame** ở `_acceptance/tiep-thi-tuyen-doi-tac/evidence/SD-MT<n>-step<n>.png`, mỗi frame đã được phiên lái mở lại và ghi một dòng `observed:` (luật ảnh-lưu-phải-nhìn); người điều phối soi lại `SD-MT1-step2.png` và `SD-MT5-step4.png` trên vật.
- Bộ lái: `ego-browser`, không gian tác vụ 35, chỉ dùng `captureScreenshot` · `click([x,y])` · `typeText` · `pressKey` · `scroll` · `gotoAndWait` · `drainEvents`.
- Sao lưu môi trường trước khi dọn: `dev-db-backup-2026-09-06.json` và `dev-contacts-litter-2026-09-06.json` trong thư mục nháp của phiên.

## Điều ván này nói với thước của chính nghi thức

Thước pilot đếm **số vấp CHẶN hoặc LẠC mà bốn bộ kiểm S4 xanh không bắt được**.
Ván 1 cho: **1 CHẶN + 1 LẠC**, cộng năm mục KHÓ-CHỊU mới. Không mục nào trong số
đó bị bất kỳ phép đo máy nào của vòng bắt — chúng nằm **giữa** các tiêu chí, đúng
lớp lỗi nghi thức sinh ra để bắt. Riêng CHẶN-11 và vấp 6 là hai giới hạn đã khai
được một cặp mắt không-ngữ-cảnh tìm lại độc lập, tức danh sách giới hạn đã biết
mô tả đúng sản phẩm thật.
