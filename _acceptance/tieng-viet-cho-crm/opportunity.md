---
schema_version: 1
slug: tieng-viet-cho-crm
feature: Nhân viên quan hệ đối tác dùng CRM bằng tiếng Việt
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-01T04:45:00Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

OneHub là **nền tảng thị trường nhiều bên** trong tài chính và bất động sản,
kéo các cá nhân và công ty nhỏ vào một mạng lưới chung. Giai đoạn đầu tập trung
vào môi giới, mạng lưới sẽ mở rộng sau.

CRM này là **sản phẩm nội bộ**, không bán ra ngoài. Người dùng là **nhân viên
quan hệ đối tác** — họ giữ và mở quan hệ với mạng lưới.

Họ đọc màn hình bằng tiếng Anh trong khi làm việc bằng tiếng Việt. Mỗi nhãn phải
dịch trong đầu trước khi bấm, và người mới vào nghề trả giá đắt nhất.

Hôm nay kho **không có một mẩu hạ tầng đa ngôn ngữ nào**. Tôi đếm chứ không đoán:

- Không gói thư viện nào cho việc này trong cả bốn nơi có mã.
- Trang gốc khai cứng `lang="en"`.
- 177 file giao diện trong ứng dụng, 109 file nữa trong bộ dựng chung. Mọi chữ
  là chuỗi viết thẳng trong mã.
- 181 câu người-đọc phát ra từ máy chủ, ví dụ "That person is not in this
  workspace." Chúng không nằm trong giao diện.
- 19 chỗ định dạng số và ngày khai cứng `en-US`.
- Bảng người dùng **không có cột nào** để nhớ người này muốn đọc thứ tiếng gì.

Nên đây không phải một việc dịch. Đây là **năm nguồn chữ khác nhau, mỗi nguồn
một cách giải khác nhau**, và bốn trong năm chưa có chỗ để đặt bản dịch.

## Quét không gian — năm nguồn chữ

Máy liệt kê để chặn sót, người chốt lấy nguồn nào vào vòng đầu.

| Nguồn chữ | Quy mô đếm được | Cách giải khác nhau ở chỗ nào |
| --- | --- | --- |
| Nhãn trong ứng dụng | 177 file | Cần một thư viện và một kho chuỗi; đổi được lúc chạy |
| Nhãn trong bộ dựng chung | 109 file | Dùng chung nhiều nơi, nên chuỗi phải nhận từ ngoài vào, không tự chứa |
| Câu máy chủ trả về | 181 câu | Máy chủ không biết người đọc là ai; hoặc gắn mã lỗi rồi để giao diện dịch, hoặc máy chủ nhận biết ngôn ngữ |
| Chữ do tác nhân sinh ra | không đếm được | Không dịch được bằng kho chuỗi — phải bảo mô hình viết tiếng Việt |
| Ngày, số, tiền tệ | 19 chỗ | Không cần bản dịch, chỉ cần thôi khai cứng một vùng |

Trục thứ hai — **ai chọn tiếng**: theo người dùng · theo cả nơi làm việc · theo
trình duyệt. Chưa có cột nào cho hai lối đầu.

Trục thứ ba — **chữ của máy so với chữ của người**: nhãn màn hình phải dịch;
ghi chú người bán tự gõ, tên khách, nội dung thư thì **không được** dịch. Ranh
giới này phải rõ trước khi viết dòng mã nào.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Nhân viên quan hệ đối tác thật sự vướng vì tiếng Anh, không phải vướng vì luồng việc | Dịch xong vẫn chậm như cũ, công đổ vào chỗ không đau | Ngồi cạnh 3 nhân viên trong một giờ, đếm số lần họ dừng ở một nhãn | Chưa thử |
| 2 | ~~Nhãn màn hình là nguồn đau chính, không phải câu lỗi từ máy chủ~~ | — | Đếm chỗ giao diện hiện nguyên văn câu máy chủ | **Đã thử 2026-09-01 — SAI.** 107 chỗ gọi `toast.error(error.message)`, tức đổ thẳng câu tiếng Anh của máy chủ lên màn hình. Câu máy chủ là chữ mặt tiền, không phải chữ nội bộ. |
| 3 | Bộ dựng chung chịu được việc nhận chuỗi từ ngoài vào | Phải sửa lại 109 file theo kiểu khác, chi phí nhân đôi | Đổi thử một component, xem có phải sửa mọi nơi gọi nó không | Chưa thử |
| 4 | Chữ do tác nhân sinh ra chấp nhận được khi chỉ bảo mô hình đổi tiếng | Phần đó vẫn tiếng Anh, và nó là phần người đọc nhiều nhất | Chạy một tác nhân với một dòng chỉ dẫn tiếng Việt, đọc kết quả | Chưa thử |
| 5 | Kho đủ chỗ để đặt tuỳ chọn ngôn ngữ mà không đụng phần đăng nhập | Phải sửa vùng dữ liệu nhạy cảm, hạng rủi ro nhảy lên mức cao nhất | Đọc bảng người dùng và luật vùng nhạy cảm trong cấu hình cổng | Chưa thử |

Giả định 1 là cái nặng nhất, và nó **không phải câu hỏi kỹ thuật**. Bốn cái sau
rẻ và trả lời được trong một buổi.

## Thứ tự năm vòng — người chốt 2026-09-01

Người mở phạm vi ra cả năm vùng, mỗi vùng MỘT vòng riêng. Timebox hai ngày một
vòng giữ nguyên; mục Ngoài phạm vi vẫn cấm gộp năm vùng vào một vòng.

| # | Vùng | Vì sao đứng ở đây |
| --- | --- | --- |
| ① | Xương sống + định dạng ngày/số | Không có nó thì không vùng nào chạy. 19 chỗ định dạng là phép thử rẻ nhất chứng minh đường ống thông từ lựa chọn tới màn hình |
| ② | Bộ dựng chung | Chốt khuôn nhận-chuỗi-từ-ngoài. Khuôn này ràng buộc ③, nên chốt sau ③ là làm hai lần |
| ③ | Nhãn ứng dụng | Quét lớn, 177 file, đi theo khuôn đã chốt ở ② |
| ④ | Câu máy chủ | Độc lập với khuôn giao diện, chỉ cần xương sống. Cần quyết riêng: gắn mã lỗi, hay máy chủ biết người đọc là ai |
| ⑤ | Chữ tác nhân sinh ra | Một dòng chỉ dẫn, nhưng chất lượng văn phải người chấm — hợp lý hơn khi người đã dùng bản tiếng Việt hằng ngày |

**Điều kiện lật, ghi trước để khỏi bàn lại:** ④ chỉ đứng sau ③ vì câu lỗi hiện
ở đường hỏng, còn ngưỡng nói về bước bắt buộc trong luồng thành công. **Người
bán báo họ kẹt ở chỗ báo lỗi thì ④ nhảy lên trước ③.**

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Nhân viên quan hệ đối tác làm xong một việc thật bằng tiếng Việt mà không phải quay về tiếng Anh giữa chừng không?
- Kết quả nào là SỐNG: [đề xuất] Ba nhân viên quan hệ đối tác, mỗi người chạy trọn một luồng thật (thêm một công ty · ghi hoạt động · cập nhật một thoả thuận hợp tác), và không ai gặp một câu tiếng Anh nào ở bước bắt buộc.
- Kết quả nào là CHẾT: [đề xuất] Người vẫn gặp tiếng Anh ở giữa luồng, hoặc họ nói bản tiếng Việt đọc gượng hơn bản tiếng Anh.
- Timebox: [đề xuất] Hai ngày dựng cho vòng đầu, và vòng đầu chỉ lấy MỘT nguồn chữ. Quá hai ngày nghĩa là đang làm cả năm nguồn cùng lúc.

## Kết quả prototype

Chưa dựng gì. Buổi này chỉ mở ô và đếm quy mô.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
| --- | --- | --- | --- | --- |
| Cách kho định dạng ngày và số hiện nay | 19 chỗ gọi `Intl` trong ứng dụng | triết-lý/logic | có | — |
| Luật tiền tệ đã có của kho | `docs/currency.md` | triết-lý/logic | có | — |
| Luật giao diện của kho | `docs/design.md` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |

Không lấy hình thái từ đâu ngoài. Chuẩn giao diện của kho vẫn thắng.

## Cổng 0

- **decision = build.** Người ký: Manh Phan, 2026-09-01. Căn cứ: người bán đọc màn hình bằng tiếng Anh trong khi làm việc bằng tiếng Việt, và người mới vào nghề trả giá đắt nhất.
- **disposition = archive.** Căn cứ: buổi khai thác không dựng bản thử nào, nên không có mã nào để giữ.
- **Ngưỡng UAT chốt cùng lúc ký:** CHƯA CHỐT. Bốn dòng ở mục Ngưỡng vẫn mang tiền tố `[đề xuất]` — đó là lời của máy, không phải lời người ký. Người gỡ tiền tố mới là chốt.

**Phạm vi vòng đầu — máy đề xuất, người chưa chốt:** chỉ lấy cột "nhãn ứng
dụng". Căn cứ: cột to nhất, nhân viên chạm nhiều nhất, và là cột duy nhất giải
xong thì bốn cột kia có chỗ dựa. Phạm vi này sẽ được chốt ở hợp đồng bước kế,
không phải ở đây.

## Thước đo thành công → ứng viên criterion

- Số bước bắt buộc trong một luồng thật còn hiện tiếng Anh, đếm theo luồng.
- Số nhân viên chọn tiếng Việt rồi giữ nguyên sau một tuần.
- Số câu máy chủ hiện lên màn hình mà chưa có bản tiếng Việt.

## Out of scope từ khám phá

- Không dịch dữ liệu của khách. Tên người, ghi chú người bán tự gõ, nội dung thư giữ nguyên như đã nhập.
- Không làm ngôn ngữ thứ ba. Vòng này chỉ hỏi tiếng Việt có đứng được không.
- Không đổi tiền tệ hay múi giờ. Định dạng theo vùng là việc khác với dịch chữ.
- Không làm cả năm nguồn chữ trong một vòng. Ngưỡng timebox ở trên đã nói rõ là một nguồn.
- Không đụng phần đăng nhập và phân quyền. Nếu tuỳ chọn ngôn ngữ buộc phải sửa vùng đó thì quay lại hỏi người trước.

## Từ vựng chốt 2026-09-01 — và một danh từ CHƯA chốt được

Người chốt bốn từ, ghi vào `CONTEXT.md` ở gốc kho (trước hôm nay kho không có
từ điển sản phẩm nào):

- **Nhân viên quan hệ đối tác** — người dùng CRM này. Không phải "người bán hàng".
- **Công ty** — một doanh nghiệp trong mạng lưới, đang hiện dưới `Companies`.
  KHÔNG gọi "công ty môi giới": tên đó khoá vào giai đoạn đầu và bắt đổi tên
  toàn màn hình mỗi lần mở lĩnh vực mới.
- **Cá nhân** — một người trong mạng lưới, đang hiện dưới `Contacts`. Cùng lý do
  không khoá tên vào nghề môi giới.
- **Thỏa thuận hợp tác** — đang hiện dưới `Deals`. Quan hệ hợp tác với một công
  ty hoặc một cá nhân, không phải một ca lẻ do đối tác đưa về.

**Danh từ thứ năm chặn lại: giai đoạn của một thoả thuận.** Dữ liệu đang mang
bảy bước của một phễu bán phần mềm thừa kế từ kho gốc — `DEMO_BOOKED`,
`QUALIFIED_TO_BUY`, `DECISION_MAKER_BOUGHT_IN`, `CLOSED_WON`… Không ai demo cho
một đối tác mình sắp bắt tay.

Đây là phát hiện của vòng khai thác này, và nó lớn hơn việc dịch: **tiếng Anh
cho phép cái lệch đó đi tiếp vì nhãn thừa kế không ai đọc như một lời khẳng
định. Tiếng Việt không cho hoãn** — viết "Đã đặt lịch demo" bằng tiếng Việt thì
cái sai hiện ra giữa màn hình.

Hệ quả cho thứ tự năm vòng: màn **thoả thuận hợp tác** không dịch được trước khi
có người quyết bảy giai đoạn thật. Đó là một quyết định nghiệp vụ, không phải
việc của vòng ngôn ngữ.
