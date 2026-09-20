# Quét không gian năng lực — phần mềm điều phối 30 ngày đầu của đối tác

> Chạy 2026-09-19 tại phase khám phá, TRƯỚC design doc. Đầu ra của bản quét này
> là đầu vào cho hợp đồng ở S1 và là thước chống-sót cho bước lập kế hoạch.

## Ngữ cảnh

**Chân sản phẩm** — đào từ repo, không phỏng vấn:

- OneHub là **nền tảng thị trường nhiều bên** trong tài chính và bất động sản; giai đoạn đầu tập trung vào môi giới `[SUY-TỪ-REPO: CONTEXT.md]`
- CRM này là **sản phẩm nội bộ**, dùng bởi nhân viên OneHub, không bán ra ngoài `[SUY-TỪ-REPO: CONTEXT.md]`
- Danh từ trung tâm đã có: `Công ty` · `Cá nhân` · `Thoả thuận hợp tác` · `Sản lượng` · `Tác nhân` · `Chiến dịch` · `Phân khúc` `[SUY-TỪ-REPO: CONTEXT.md]`
- `Giai đoạn thoả thuận` **CHƯA CHỐT NGHĨA** — vẫn mang bảy bước phễu bán phần mềm thừa kế `[SUY-TỪ-REPO: CONTEXT.md]`
- `Sản lượng` cào từ chuyên trang môi giới của **nhatot** — sàn BÊN NGOÀI `[SUY-TỪ-REPO: docs/guides/goi-moi-gioi-trong-crm.md]`
- Phạm vi ô: thay Google Sheet cho việc điều phối; hiệu quả kinh doanh owner đo riêng `[SUY-TỪ-REPO: _acceptance/dieu-phoi-30-ngay-dau/opportunity.md]`
- `Tác nhân` đã có sẵn: việc tự động chạy theo mốc kích hoạt `[SUY-TỪ-REPO: CONTEXT.md]`

**Chân ngành** — tên thật, xác minh bằng cách đọc chính trang sản phẩm ngày 2026-09-19:

| Tên | Loại | Đã xác minh gì |
|---|---|---|
| GUIDEcx | cổng onboarding khách | cổng theo vai cho khách, khách vào **không cần tạo tài khoản**, việc giao cho cả khách lẫn nội bộ, mốc, dự báo bằng AI, nhận diện rủi ro, trang ước lượng năng lực đội |
| Rocketlane | onboarding + vận hành dịch vụ | khuôn tự điền từ CRM, cổng khách, duyệt/leo thang/nhắc, quản nguồn lực, giờ công, biểu mẫu, tài liệu bàn giao, báo cáo điểm tắc |
| Dock | không gian làm việc chung với khách | cổng khách, **kế hoạch chung hai bên**, khuôn tự cá nhân hoá từ CRM, khoá học + LMS, kho nội dung, theo dõi ai xem gì, ký đơn |
| Gainsight CS | quản trị thành công khách hàng | điểm sức khoẻ, nhận diện rủi ro sớm, hành trình số tự động, playbook, cảnh báo **kèm việc-cần-làm sẵn**, nhìn toàn danh mục nhiều tài khoản |
| Salesforce PRM · PartnerStack | quản trị đối tác kênh | cổng đối tác, lộ trình onboarding tuỳ loại đối tác, kích hoạt đối tác, đăng ký thương vụ, phân phối lead, quỹ đồng tiếp thị, hoa hồng, phân quyền theo vai, báo cáo hiệu năng |

**Đã gỡ khỏi chân ngành:** *Arrows* — bài tổng hợp xếp nó vào nhóm cổng onboarding
khách, nhưng trang sản phẩm hôm nay là nền thực thi **thương vụ bán hàng**, không
phải onboarding (đọc 2026-09-19). Ghi lại để không ai đưa nó vào lần nữa.

## Bốn trục

Mỗi trục qua được test *"nêu trong một câu vì sao đây là chiều độc lập"*:

- **Trục A — việc phần mềm làm.** Một năng lực phục vụ *mục đích* nào. Đổi mục đích không ép đổi ai dùng hay số từ đâu tới.
  `A1` định nghĩa & khuôn | `A2` điều phối & giao việc | `A3` nhìn & báo | `A4` phát hiện & cảnh báo | `A5` đào tạo & năng lực | `A6` trao đổi & nội dung với đối tác | `A7` chi phí & nguồn lực
  *[thước CE: bảy nhóm đối chiếu với năng lực đã xác minh của năm sản phẩm chân ngành; nhóm nào không sản phẩm nào có thì phải tự biện minh]*

- **Trục B — ai đứng trong đó.** OneHub là thị trường nhiều bên, nên trục này bắt buộc quét đủ các phía.
  `B1` nhân viên quan hệ đối tác | `B2` bộ phận chuyên môn (đào tạo · kỹ thuật · vận hành) | `B3` quản lý nhìn danh mục | `B4` người của công ty đối tác | `B5` môi giới cá nhân của đối tác
  *[thước CE: từ điển sản phẩm (Công ty · Cá nhân · nhân viên quan hệ đối tác) + lời owner về các bộ phận cùng vào 30 ngày]*

- **Trục C — sự thật đi vào bằng đường nào.** Quyết định năng lực nào dựng được HÔM NAY.
  `C1` người gõ tay | `C2` biểu mẫu đối tác điền | `C3` nối máy tới hệ khác (LMS · nền tảng OneHub) | `C4` bộ cào ngoài (nhatot) | `C5` suy từ chính CRM
  *[thước CE: bốn bậc của cái thang trong opportunity.md + tài liệu bộ cào]*

- **Trục D — nhịp thời gian.** Entity không tĩnh; nhịp sinh ra năng lực mà quét theo chức năng không bao giờ đẻ ra.
  `D1` một lần lúc bắt đầu | `D2` liên tục trong 30 ngày | `D3` tại mốc (ngày 7 · 14 · 30) | `D4` sau 30 ngày, so lứa
  *[thước CE: preset entity-feature, trục Thời gian]*

**Trục đã cân nhắc rồi bỏ:** *mô hình thu tiền* (preset benchmark đề nghị) — CRM
là sản phẩm nội bộ, không bán, nên trục này chỉ có một giá trị. Trục một giá trị
không phải trục.

Không gian đầy đủ là 7×5×5×4 = 700 ô, quá lớn để liệt kê hết. Theo preset: quét
theo từng lát của trục quan trọng nhất (**A**), gắn nhãn B/C/D cho từng năng lực.

---

## A1 · Định nghĩa & khuôn

| # | Năng lực | Ai | Nguồn số | Nhịp | Nhãn nguồn | Cắt |
|---|---|---|---|---|---|---|
| 1 | Vạch đích đo được — «onboard xong» nghĩa là gì, khai theo phễu người chứ không theo ô tích | B1 B3 | C1 | D1 | `[SUY-TỪ-REPO: opportunity.md]` | **Core** |
| 2 | Khuôn kế hoạch 30 ngày theo loại đối tác | B1 B2 | C1 | D1 | `[NGÀNH: GUIDEcx · Rocketlane · PartnerStack]` | **Core** |
| 3 | Mốc ngày 7 · 14 · 30 kèm ngưỡng kiểm tại mốc | B1 B3 | C1 C5 | D3 | `[NGÀNH: GUIDEcx]` | Later |
| 4 | Phụ thuộc giữa việc — việc này xong mới mở việc kia | B2 | C1 | D2 | `[NGÀNH: GUIDEcx · Rocketlane]` | Later |
| 5 | Khuôn tự điền sẵn từ bản ghi công ty trong CRM | B1 | C5 | D1 | `[NGÀNH: Rocketlane · Dock]` | Later |
| 6 | Bậc phục vụ theo cỡ đối tác — 8 môi giới khác 80 môi giới | B3 | C1 C5 | D1 | `[NGÀNH: Gainsight]` | Later |

## A2 · Điều phối & giao việc

| # | Năng lực | Ai | Nguồn số | Nhịp | Nhãn nguồn | Cắt |
|---|---|---|---|---|---|---|
| 7 | Một người cầm trịch duy nhất cho mỗi đối tác | B1 B3 | C1 | D1 | `[GIẢ ĐỊNH]` — không sản phẩm nào khai riêng, nhưng cơn đau «việc rơi» đòi | **Core** |
| 8 | Giao việc có hạn cho người trong nội bộ | B1 B2 | C1 | D2 | `[NGÀNH: GUIDEcx · Rocketlane]` | **Core** |
| 9 | Bàn giao giữa bộ phận, có vết ai bàn cho ai lúc nào | B2 | C1 C5 | D2 | `[NGÀNH: Rocketlane · Gainsight]` | **Core** |
| 10 | Giao việc thẳng cho chính đối tác | B4 B5 | C2 | D2 | `[NGÀNH: GUIDEcx]` | Later |
| 11 | Nhắc tự động qua thư điện tử hoặc tin nhắn | B4 B5 | C5 | D2 | `[NGÀNH: GUIDEcx]` | Later |
| 12 | Duyệt và leo thang tự động khi quá hạn | B2 B3 | C5 | D2 | `[NGÀNH: Rocketlane]` | Later |
| 13 | Chuyển giao đối tác khi người phụ trách nghỉ hoặc đổi việc | B1 B3 | C1 | D2 | `[GIẢ ĐỊNH]` — preset entity-feature nêu đây là chỗ spec luôn sót | Later |

## A3 · Nhìn & báo

| # | Năng lực | Ai | Nguồn số | Nhịp | Nhãn nguồn | Cắt |
|---|---|---|---|---|---|---|
| 14 | Màn danh mục — mọi đối tác đang trong 30 ngày trên MỘT màn | B1 B3 | C5 | D2 | `[NGÀNH: Gainsight · GUIDEcx]` | **Core** |
| 15 | Hồ sơ một đối tác: phễu người · bậc đang tắc · số ngày kể từ chốt | B1 B2 B3 | C1 C5 | D2 | `[NGÀNH: Gainsight]` + `[SUY-TỪ-REPO: opportunity.md]` | **Core** |
| 16 | Báo cáo theo bộ phận và theo người | B3 | C5 | D4 | `[NGÀNH: GUIDEcx · Rocketlane]` | Later |
| 17 | Xuất dữ liệu ra ngoài | B1 B3 | C5 | D4 | `[NGÀNH: chuẩn chung]` | Later |
| 18 | So lứa — lứa đối tác này với lứa trước | B3 | C5 | D4 | `[NGÀNH: Gainsight]` | Later |
| 19 | Nhìn xuống tận từng môi giới của một đối tác | B1 B2 | C1 C3 C4 | D2 | `[SUY-TỪ-REPO: CONTEXT.md — quan hệ Công ty ↔ Cá nhân]` | Later |

## A4 · Phát hiện & cảnh báo

| # | Năng lực | Ai | Nguồn số | Nhịp | Nhãn nguồn | Cắt |
|---|---|---|---|---|---|---|
| 20 | Phát hiện tắc theo thời gian im lặng, cảnh báo kèm việc-cần-làm sẵn | B1 B2 B3 | C5 | D2 | `[NGÀNH: Gainsight — cảnh báo kèm hành động kê sẵn]` | **Core** |
| 21 | Điểm sức khoẻ tổng hợp từ nhiều tín hiệu | B1 B3 | C3 C5 | D2 | `[NGÀNH: Gainsight]` | Later |
| 22 | Dự báo ngày hoàn thành | B1 B3 | C5 | D2 | `[NGÀNH: GUIDEcx · Rocketlane]` | Later |
| 23 | **Lọc mẫu số bằng biến đối chứng** — loại người không làm nghề ra khỏi mẫu số, đọc từ sản lượng trên sàn ngoài | B3 B5 | C4 | D1 | `[SUY-TỪ-REPO: docs/guides/goi-moi-gioi-trong-crm.md]` — **không sản phẩm chân ngành nào có** | Later |
| 24 | **Tách «đang thua sàn khác» khỏi «chưa onboard xong»** — hai loại thất bại, hai loại thuốc | B1 B5 | C3 C4 | D2 | `[SUY-TỪ-REPO: cùng trên]` — **không sản phẩm chân ngành nào có** | Later |
| 25 | Việc nào trong 30 ngày dự báo được kết cục — để bỏ bớt việc không ăn thua | B3 | C3 C5 | D4 | `[NGÀNH: Gainsight]` + `[SUY-TỪ-REPO: opportunity.md — hướng chuyển sang guồng sản phẩm]` | Later |

## A5 · Đào tạo & năng lực

| # | Năng lực | Ai | Nguồn số | Nhịp | Nhãn nguồn | Cắt |
|---|---|---|---|---|---|---|
| 26 | Theo dõi môi giới nào hoàn thành khoá nào | B2 B5 | C1 C3 | D2 | `[NGÀNH: PartnerStack · Salesforce PRM]` | Later |
| 27 | Khoá học và hệ quản lý học tập nằm ngay trong sản phẩm | B5 | C3 | D2 | `[NGÀNH: Dock]` | Later |
| 28 | Chứng chỉ cho môi giới đã qua khoá | B5 | C3 | D3 | `[NGÀNH: Salesforce PRM]` | Later |
| 29 | Mở quyền lợi theo chứng chỉ — học xong mới mở thứ đối tác muốn | B4 B5 | C3 | D3 | `[NGÀNH: ZINFI · Salesforce PRM]` | Later |
| 30 | Playbook hướng dẫn cho chính nhân viên OneHub | B1 B2 | C1 | D2 | `[NGÀNH: Gainsight · Dock]` | Later |

## A6 · Trao đổi & nội dung với đối tác

| # | Năng lực | Ai | Nguồn số | Nhịp | Nhãn nguồn | Cắt |
|---|---|---|---|---|---|---|
| 31 | Cổng cho đối tác nhìn vào tiến độ của chính họ | B4 B5 | C5 | D2 | `[NGÀNH: GUIDEcx · Rocketlane · Dock]` | Later — **ứng viên số một vòng hai** |
| 32 | Vào cổng KHÔNG cần tạo tài khoản | B4 B5 | C5 | D2 | `[NGÀNH: GUIDEcx]` | Later |
| 33 | Kế hoạch chung hai bên — cả hai cùng sửa, cùng thấy ai đang chặn ai | B1 B4 | C1 C2 | D2 | `[NGÀNH: Dock]` | Later |
| 34 | Biểu mẫu thu dữ liệu từ đối tác | B4 | C2 | D1 | `[NGÀNH: Rocketlane]` | Later |
| 35 | Kho tài liệu và nội dung gửi đối tác | B4 B5 | C1 | D2 | `[NGÀNH: Dock]` | Later |
| 36 | Theo dõi ai đã xem gì, xem bao lâu | B4 B5 | C5 | D2 | `[NGÀNH: Dock]` | Later |

## A7 · Chi phí & nguồn lực

| # | Năng lực | Ai | Nguồn số | Nhịp | Nhãn nguồn | Cắt |
|---|---|---|---|---|---|---|
| 37 | Ai đang gánh bao nhiêu đối tác cùng lúc | B3 | C5 | D2 | `[NGÀNH: GUIDEcx — trang ước lượng năng lực · Rocketlane]` | Later |
| 38 | Giờ công bỏ vào từng đối tác | B2 B3 | C1 | D2 | `[NGÀNH: Rocketlane]` | Later |
| 39 | Chi phí theo bậc phục vụ — guồng đang rẻ đi hay đắt lên | B3 | C1 C5 | D4 | `[NGÀNH: Gainsight]` | Later |
| 40 | Dự báo nguồn lực cần cho kỳ tới | B3 | C5 | D4 | `[NGÀNH: Rocketlane]` | Later |

---

## Never — năng lực chân ngành CÓ mà mô hình OneHub không đỡ

Ghi đủ, kèm lý do một dòng, để khỏi bàn lại. Ô `[NGÀNH]` bị cắt vẫn phải để vết.

| # | Năng lực | Nguồn | Lý do cắt |
|---|---|---|---|
| 41 | Đăng ký thương vụ (deal registration) | `[NGÀNH: Salesforce PRM · PartnerStack]` | Đối tác không bán hộ OneHub — quan hệ hợp tác, không phải kênh bán lại |
| 42 | Phân phối lead cho đối tác | `[NGÀNH: Salesforce PRM]` | Cùng lý do trên; OneHub không giao lead cho đối tác đi đóng |
| 43 | Hoa hồng và chi trả cho đối tác | `[NGÀNH: PartnerStack]` | Không có dòng tiền thưởng theo thương vụ trong mô hình |
| 44 | Quỹ đồng tiếp thị (MDF) | `[NGÀNH: Salesforce PRM · Impartner]` | Không có quỹ để phân bổ; chương trình kênh chưa tồn tại |
| 45 | Nội dung đồng thương hiệu | `[NGÀNH: Salesforce PRM]` | Không thuộc 30 ngày; và là việc của đội tiếp thị, ô khác |
| 46 | Ký tài liệu ngay trong cổng | `[NGÀNH: Dock]` | Ký kết đã xong TRƯỚC khi 30 ngày bắt đầu |
| 47 | Giờ công để xuất hoá đơn · dự báo doanh thu và biên theo dự án | `[NGÀNH: Rocketlane]` | CRM nội bộ, không xuất hoá đơn cho ai; giờ công chỉ để biết chi phí (mục 38), không để tính tiền |

---

## Đọc kết quả

**Ô mình trống mà ≥2 sản phẩm chân ngành có** — theo preset, muốn tiếp tục bỏ
trống phải nêu được lý do một câu:

| Năng lực | Ai có | Lý do bỏ trống ở vòng một |
|---|---|---|
| Cổng cho đối tác (#31) | GUIDEcx · Rocketlane · Dock | CRM là sản phẩm nội bộ; mở cho người ngoài là đổi mô hình quyền, không phải thêm một màn |
| Khuôn tự điền từ CRM (#5) | Rocketlane · Dock | Chưa biết Sheet có gì để điền; làm sau khi đọc Sheet |
| Dự báo ngày hoàn thành (#22) | GUIDEcx · Rocketlane | Dự báo trên dữ liệu gõ tay của ba đối tác đầu là bói, không phải dự báo |
| Điểm sức khoẻ tổng hợp (#21) | Gainsight · GUIDEcx | Tổng hợp cần nhiều tín hiệu máy; vòng một chỉ có một tín hiệu (ngày cập nhật cuối) |
| Theo dõi hoàn thành khoá học (#26) | PartnerStack · Salesforce PRM · Dock | Số nằm ngoài CRM; chờ nối ống nước |

**Ô cả thị trường bỏ trống** — preset bắt kiểm bằng First Principles trước khi
xếp Core:

> **#23 và #24 — lọc mẫu số và tách hai loại thất bại, bằng dữ liệu hoạt động
> của chính những người đó trên một sàn BÊN NGOÀI.**
>
> *Vì sao chưa ai làm?* Vì gần như không nhà cung cấp nào nhìn được hoạt động
> của khách hàng mình trên sản phẩm đối thủ. Gainsight thấy khách dùng sản phẩm
> của khách hàng nó; nó không thấy khách đó có đang dùng sản phẩm đối thủ hay
> không. OneHub thấy — do tình cờ: môi giới đăng tin công khai trên nhatot, và
> kho đã có bộ cào đọc đúng chỗ đó.
>
> **Kết luận: cơ hội, không phải bẫy** — nhưng vẫn xếp **Later**, không phải
> Core, vì nó không phục vụ ngưỡng «thay được Google Sheet» mà owner đã chốt.
> Xếp Core là tự mở rộng phạm vi. Đây là ứng viên mạnh nhất cho vòng hai cùng
> với #31.

## Core — 8 trên 47 ô có nghĩa (17%)

Cả tám đều chạy được **hoàn toàn bằng `C1` người gõ tay và `C5` suy từ chính
CRM**. Không ô nào chờ nối ống nước. Đó là tiêu chí cắt: vòng một phải dựng
xong được mà không phụ thuộc hệ thống của bộ phận khác.

1. **#1 Vạch đích đo được** — gốc của ba trong bốn cơn đau; không có nó thì bảy ô còn lại không có gì để hiển thị.
2. **#2 Khuôn kế hoạch 30 ngày** — chính là thứ Google Sheet đang làm bằng tay.
3. **#7 Một người cầm trịch cho mỗi đối tác** — tắt «việc rơi» ở gốc: rơi vì không ai nhận, không phải vì không ai biết.
4. **#8 Giao việc có hạn trong nội bộ** — phần còn lại của «việc rơi».
5. **#9 Bàn giao giữa bộ phận có vết** — chỗ việc rơi nhiều nhất, và là chỗ Sheet mù hoàn toàn.
6. **#14 Màn danh mục** — tắt «không ai biết đối tác ở đâu»; đồng thời là vế (d) của ngưỡng SỐNG đã khai.
7. **#15 Hồ sơ một đối tác theo hình phễu** — hình dữ liệu phải đúng ngay từ lần gõ đầu tiên, vì sửa hình sau là vẽ lại màn.
8. **#20 Phát hiện tắc theo thời gian im lặng** — tắt «nguội âm thầm», và chạy được chỉ bằng ngày cập nhật cuối, không cần tín hiệu nào từ nền tảng.

## Cross-cutting — áp cho MỌI ô Core

- **Dữ liệu cá nhân.** Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định
  356/2025/NĐ-CP, cùng hiệu lực **01/01/2026**, thay Nghị định 13/2023 (tra lại
  2026-09-19, đang áp). Nghĩa vụ chạm thẳng vào ô này: **phân loại dữ liệu cá
  nhân TRƯỚC khi xử lý** · phân quyền giới hạn truy cập · **quyền yêu cầu xoá**
  · chỉ định nhân sự bảo vệ dữ liệu cá nhân (doanh nghiệp không phải siêu nhỏ/nhỏ).
  Ô này theo dõi **hành vi của từng môi giới có tên**, và CRM đã giữ số điện
  thoại cào về — đây là hồ sơ hành vi cá nhân, không phải dữ liệu doanh nghiệp.
  Bắt buộc, không phải nice-to-have.
- Lịch sử thay đổi (ai sửa gì lúc nào) — trạng thái điều phối là thứ sẽ bị cãi.
- Trạng thái rỗng · đang tải · lỗi cho mọi màn.
- Giới hạn số lượng và phân trang trên màn danh mục.
- Tìm và lọc.
- Tiếng Việt: theo xương sống ngôn ngữ đang làm; chữ *onboarding* chưa có mục
  trong `CONTEXT.md` — thêm mục hoặc viết bằng chữ thường ai cũng hiểu.
- Giao diện: `/packages/ui` là nguồn duy nhất; không đè style ở chỗ gọi.

## Giới hạn đã biết của chính bản quét này

Ghi ra để người đọc biết tin tới đâu:

1. **Thước CE mới đạt một nửa.** Preset benchmark đòi teardown thật — đăng ký
   dùng, đi hết luồng, chụp màn. Bản này đọc **trang sản phẩm chính chủ** (không
   phải bài tổng hợp), nên biết họ *khai* có gì, chưa biết dùng ra sao. Năng lực
   nào định bắt chước hình thì phải teardown thật trước.
2. ~~Chưa đọc Google Sheet đang dùng.~~ **Đã hỏi được hình mà không cần đọc
   (2026-09-20): Sheet là *một dòng một việc*.** Hệ quả cho bản quét ở mục
   «Cập nhật sau khi đọc mã» ngay dưới. Vẫn chưa thấy nội dung thật, nên nhãn
   cột cụ thể của Sheet vẫn là điểm mù — nhưng hình thì đã biết, và hình mới là
   thứ quyết định trục C.
3. **Hai ô mang `[GIẢ ĐỊNH]`** (#7 người cầm trịch duy nhất, #13 chuyển giao khi nghỉ việc) gom về mục Coverage của hợp đồng để
   người gạch một lượt tại Cổng Phạm vi, trước khi ai tuyên bố «đã đủ».


---

## Cập nhật 2026-09-20 — sau khi đọc mã và hỏi được hình của Sheet

Hai dữ kiện mới quay ngược vào bản quét, theo đúng luật đóng vòng của nghi thức.

**Trục C có câu trả lời thật.** `C1` (người gõ tay) không còn là «gõ vào một ô
trống»: kho đã có hệ **trường tự tạo** — EAV có kiểu, có chỉ mục, API đủ bộ, và
`agentFilled` + `agentBrief` cho phép tác nhân tự điền. Nghĩa là phần **thuộc
tính** của mọi ô Core dựng được **không đụng lược đồ**.

**Nhưng trục C không phủ được nhóm A2.** `FieldValue` có ràng buộc
`@@unique([fieldId, companyId])` — mỗi trường đúng một giá trị trên mỗi bản ghi,
nên một trường tự tạo không bao giờ là danh sách. Sheet lại là *một dòng một
việc*. Vậy **ô #8 và #9 (giao việc, bàn giao) không có đường nào đi qua trường
tự tạo** — bắt buộc bảng con.

Bảng dưới sửa lại cột «Nguồn số» cho bốn ô Core bị ảnh hưởng:

| # | Ô Core | Nguồn số trước | Nguồn số sau khi đọc mã |
|---|---|---|---|
| 1 | Vạch đích đo được | C1 | C1 qua **trường tự tạo**, không đụng lược đồ |
| 8 | Giao việc có hạn trong nội bộ | C1 | C1 qua **bảng mới** — trường tự tạo không giữ được danh sách |
| 9 | Bàn giao giữa bộ phận có vết | C1 C5 | C1 qua **bảng mới** + `Activity.assigneeId` |
| 15 | Hồ sơ một đối tác theo hình phễu | C1 C5 | thuộc tính từ trường tự tạo; phễu và bước từ **bảng mới** |

**Một ô Later đổi lý do cắt, không đổi vị trí.** Ô #6 «bậc phục vụ theo cỡ đối
tác» và mọi ý về loại bản ghi: chỗ co giãn cho «nhiều loại đối tác» nằm ở
**khuôn kế hoạch**, không ở danh sách trường — lý do đầy đủ trong `opportunity.md`.
Loại bản ghi vẫn Later, nhưng nay có lý do bằng số chứ không bằng cảm giác.

**Một điểm mù đóng lại.** Câu hỏi tenancy đã có đáp án đọc từ lược đồ:
`Company`, `Contact`, `Deal`, `FieldDefinition`, `FieldValue` không có cột phân
vùng khách hàng; `Organization` chỉ giữ thành viên và lời mời. CRM **một khách,
một workspace** — nên mọi ô trong bản quét này đọc theo nghĩa một tổ chức, và
«nhiều doanh nghiệp» trong bản quét nghĩa là **nhiều loại đối tác**, không phải
nhiều khách thuê.

**Một ô mới sinh ra từ buổi đọc mã, đã tách sang hồ sơ riêng.** Lỗ quyền: mọi
thành viên sửa được trường của cả đội vì điểm cuối không kiểm vai trò. Đây là
năng lực nhóm `A2` × trục `B` mà bản quét gốc **sót** — vì bản quét hỏi «phần
mềm làm gì» chứ không hỏi «ai được phép làm». Ghi lại như một lỗ của chính bản
quét: trục Actor có trong khung nhưng chưa được dùng để soi quyền.
