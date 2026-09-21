---
schema_version: 1
feature: Xương sống ngôn ngữ — nhân viên chọn tiếng Việt một lần, màn công ty hiện trọn tiếng Việt
slug: tieng-viet-cho-crm
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: da-cham-boi-thuc-te
approved_by: Manh Phan
approved_at: 2026-09-01
design_doc: docs/superpowers/specs/2026-09-01-tieng-viet-cho-crm-design.md
---

# Acceptance Contract: tieng-viet-cho-crm

## Context

Nhân viên quan hệ đối tác đọc màn hình bằng tiếng Anh trong khi làm việc bằng
tiếng Việt. Vòng này dựng đường để họ chọn tiếng Việt một lần và giữ nguyên lựa
chọn đó, rồi chứng minh đường ấy chạy trọn trên **một** màn hình: màn công ty.

Đây là vòng ① trong năm vòng đã chốt ở `opportunity.md`. Bốn nguồn chữ còn lại
nằm ngoài vòng này.

**Vòng này DỪNG ở S4 vòng chấm 1, 2026-09-01, và chưa ký Cổng 2.** Người chọn
đường C: đảo thứ tự, đưa vòng ② lên trước. Căn cứ ghi ở `decisions.jsonl`.
AC-6 và AC-9 cùng trượt vì một lý do — hợp đồng hứa về một màn hình mà chính nó
cấm sửa component dùng chung vẽ ra màn hình đó. Vòng ② mở đường; vòng này chạy
lại S4 ngay sau đó, và AC-6 lúc ấy bỏ được mục trừ hai nhãn trình-đọc-màn-hình.
Phần đã làm vẫn nằm trong nhánh và vẫn xanh ở mười phép đo còn lại.

**Chạy lại S4 ngày 2026-09-02, sau khi vòng ② ký Cổng 2.** Hai chỗ hợp đồng
đổi, và cả hai đổi vì thế giới đổi chứ không vì kết quả đổi:

- **AC-6 bỏ mục trừ.** Vòng ② đã dịch hai nhãn trình-đọc-màn-hình, nên câu trừ
  không còn mô tả cái gì có thật.
- **AC-9 GIỮ NGUYÊN CÂU CHỮ**, dù nay nó nghịch với AC-7 của vòng ② mà người đã
  ký: AC-9 cấm tiêu đề cột bị cắt, AC-7 của vòng ② lại đòi tiêu đề cột cắt kèm
  dấu ba chấm. Không viết lại AC-9 cho vừa kết quả. Báo cáo bằng chứng đo cả hai
  cách đọc và để người chọn ở Cổng 2.

Ba nhãn cột vòng người lạ lái thử nêu — `Cá nhân` · `Thoả thuận mở` · `Bổ sung`
— là chữ vòng này chốt, nên vòng này nhận lại. Danh sách mười nhãn ở mục Notes
đã cập nhật.

Source input: prompt · `_acceptance/tieng-viet-cho-crm/opportunity.md`

## Criteria

- AC-1: Given người dùng chưa từng chọn tiếng và trình duyệt của họ khai ưu tiên tiếng Việt, When họ mở CRM lần đầu, Then màn hình hiện tiếng Việt.
- AC-2: Given người dùng chưa từng chọn tiếng và trình duyệt khai ưu tiên tiếng Anh, When họ mở CRM, Then màn hình hiện tiếng Anh.
- AC-3: Given người dùng đã chọn tiếng Việt, When trang được máy chủ dựng, Then thẻ `<html lang>` mang giá trị `vi` NGAY Ở LƯỢT VẼ ĐẦU, không phải sau một lượt vẽ lại.
- AC-4: Given lựa chọn ngôn ngữ đã lưu mang một giá trị không phải thẻ ngôn ngữ hợp lệ, When người mở CRM, Then màn hình rơi về tiếng Anh và không có lỗi nào nổ.
- AC-5: Given người dùng đổi sang tiếng Việt rồi đóng trình duyệt, When họ quay lại, Then màn hình vẫn tiếng Việt.
- AC-6: Given người dùng đang ở tiếng Việt, When họ mở màn công ty, Then mọi chữ NHÌN THẤY của giao diện là tiếng Việt — kể cả ba chuỗi bảng dùng chung nhận từ ngoài vào (`empty`, `facet.empty`, `tabs.allLabel`). Mục trừ hai nhãn trình-đọc-màn-hình của bản ký ngày 2026-09-01 đã bỏ: vòng ② đóng cả hai, nên tiêu chí này nay không còn ngoại lệ nào.
- AC-7: Given một công ty có tên do người nhập, When màn hình hiện ở tiếng Việt, Then tên đó giữ nguyên như đã nhập VÀ được đánh dấu để trình duyệt không tự dịch.
- AC-8: Given người dùng đang ở tiếng Việt, When màn công ty hiện ngày và số, Then chúng theo quy ước tiếng Việt, và trong phạm vi vòng này không còn chỗ nào khai cứng một vùng.
- AC-9: Given chuỗi tiếng Việt dài hơn chuỗi tiếng Anh tương ứng, When màn công ty hiện ở bề rộng 768px, Then không TIÊU ĐỀ CỘT nào bị cắt cụt; ô dữ liệu dài vẫn được phép cắt kèm dấu ba chấm.
- AC-10: Given người dùng chỉ dùng bàn phím, When họ nhấn Tab tới nút đổi tiếng rồi Enter, Then nút hiện vòng tiêu điểm NHÌN THẤY ĐƯỢC trong ảnh chụp, và menu mở ra.
- AC-12: Given người dùng đã chọn tiếng Anh và trình duyệt của họ khai ưu tiên tiếng Việt, When họ mở CRM, Then màn hình hiện tiếng Anh — lựa chọn đã lưu thắng ngôn ngữ trình duyệt.
- AC-11: Given bản tiếng Việt của màn công ty, When một nhân viên quan hệ đối tác đọc nó, Then chữ đọc như tiếng Việt của người trong nghề, không phải như một bản dịch máy. (judgment)

## Coverage

Quét bằng skill `morphological-scan`, preset ma-trận-kiểm. Ba trục, 48 ô, quét
theo lát cắt của trục "nơi hiện ra".

- Trục **nguồn ngôn ngữ**: chưa chọn bao giờ | đã chọn `vi` | đã chọn `en` | giá trị không hợp lệ [thước CE: BCP 47 — chuẩn định nghĩa thẻ ngôn ngữ hợp lệ, `[NGÀNH: BCP 47]`]
- Trục **nơi hiện ra**: thẻ ngôn ngữ của trang | chữ của giao diện | ngày và số | dữ liệu người dùng nhập, phải KHÔNG đổi [thước CE: WCAG 2.2 SC 3.1.1 mức A đòi ngôn ngữ trang phải máy đọc được, `[NGÀNH: WCAG 2.2]` · `[SUY-TỪ-REPO: packages/ui/src/lib/format.ts]`]
- Trục **thời điểm**: lượt vẽ đầu từ máy chủ | ngay sau khi người đổi tiếng | lượt quay lại sau [thước CE: `[SUY-TỪ-REPO: apps/app/components/theme-provider.tsx]` — nếp sáng/tối của kho đã giải đúng ba thời điểm này]

Cross-cutting áp mọi ô Core: chuỗi tiếng Việt dài hơn tiếng Anh 20–30% (AC-9), và
dấu tiếng Việt phải hiện đúng ở mọi phông đang dùng.

Hai ô Core đến từ chân ngành chứ không từ đề bài, và chúng là hai lỗ của bản
thiết kế trước khi nạp chuẩn nội bộ: **đường cho người lần đầu** (AC-1, luật
"detect via Accept-Language, not IP") và **chặn trình duyệt tự dịch dữ liệu**
(AC-7, luật `translate="no"` cho tên riêng).

## Out of scope

- Không dịch câu lỗi từ máy chủ. 107 chỗ đổ nguyên văn tiếng Anh lên màn hình vẫn nguyên — đó là vòng ④.
- Không SỬA `packages/ui/src/components/**`. Vòng này chỉ TRUYỀN chuỗi vào ba chỗ bảng dùng chung đã mở sẵn (`empty`, `facet.empty`, `tabs.allLabel`) — truyền vào một chỗ đã mở không phải sửa component. Hai nhãn trình-đọc-màn-hình khoá cứng ở đó vẫn tiếng Anh, có tên trong AC-6, và là việc vòng ②.
- Không dịch màn thoả thuận hợp tác. Bảy giai đoạn của nó chưa ai định nghĩa; đó là quyết định nghiệp vụ.
- Không chạm 10 chỗ định dạng trong `ai-elements/context.tsx` — bảng chi phí tác nhân, không nằm trên màn công ty.
- Không thêm ngôn ngữ thứ ba, không đổi tiền tệ, không đổi múi giờ.
- Không dịch dữ liệu người dùng nhập. Tên công ty, ghi chú, nội dung thư giữ nguyên như đã nhập.
- **Không dịch chuỗi khoá cứng TẠI CHỖ GỌI trong `apps/app`** — thêm ngày
  2026-09-02, SAU khi đo, theo quyết định của người ở Cổng 2
  (`d-2026-09-02T10:40:00Z-cong2v1`). Ranh giới là một LUẬT, không phải một danh
  sách: chuỗi nào chỗ gọi tự viết ra thay vì nhận từ kho bản dịch thì thuộc vòng
  ③. Phép đo vẫn đếm và vẫn báo chúng — mục này không tắt phép đo, nó chỉ nói ai
  nhận. Tính đến ngày thêm, phép đo báo đúng năm chuỗi: `Archived` · `Views` ·
  `New company` · ô tìm công ty · và năm nhãn trạng thái bổ sung dữ liệu, trong
  đó `Not researched` hiện 15 lần. Chuỗi mới xuất hiện sau ngày này vẫn bị bắt.

## Notes

Hợp đồng viết TRƯỚC khi có mã.

**Ràng buộc kỹ thuật đã kiểm:** 19 chỗ định dạng hiện là hằng ở mức module, chốt
một lần lúc nạp file. Đổi ngôn ngữ lúc chạy không làm chúng đổi theo. Trong phạm
vi vòng này có 9 chỗ — 6 ở `apps/app`, 3 ở `packages/ui/src/lib/format.ts`.

**Ranh giới với vòng ②:** định dạng là hàm của (ngôn ngữ, giá trị); chuỗi là một
kho bản dịch. Vòng này sở hữu vế đầu. Chạm `packages/ui/src/lib/format.ts` để
sửa vế đầu không phải chốt khuôn của vế sau.

**Đã đọc trước khi viết:** `docs/currency.md` (vì `formatMoney` nằm trong module
sẽ sửa — tài liệu đó nói về cột nào được cộng và tỉ giá đóng băng lúc nào, không
nói về hiển thị), `docs/design.md`, `CONTEXT.md`, và chuẩn giao diện nội bộ mà
kho khai ở `feature_loop.ui_standards_skill`.

**Nhãn tiếng Việt của mười cột** (chốt theo luật ngắn-theo-ngữ-cảnh trong
`CONTEXT.md`): Tên · Tên miền · Ngành · Phụ trách · **Số lượng cá nhân** ·
**Số thoả thuận đang mở** · Ngày tạo · **Hoạt động gần nhất** ·
**Bổ sung dữ liệu** · **Ngày lưu trữ**. Hội đồng phán ở AC-11 chấm
đúng danh sách này, không chấm chữ chưa ai khai.

Năm nhãn in đậm đổi ngày 2026-09-02. Ba nhãn đầu đi từ vòng người lạ lái thử
của vòng ② — cả hai người độc lập nêu đúng ba chữ cũ là chữ họ **phải đi hỏi mới
hiểu**; hai nhãn còn lại đi từ hội đồng chấm lại. Cách sửa là áp chính luật
ngắn-theo-ngữ-cảnh với bằng chứng mới, không phải bỏ luật:

- `Cá nhân` và `Thoả thuận mở` đứng trên cột **toàn số**, mà màn hình chưa hề
  cấp phần nghĩa "bao nhiêu". Bản sửa đầu thêm `Số`; hội đồng bác một nửa. Trong
  tiếng Việt `số + danh từ` mặc định đọc thành **mã định danh** (số nhà, số tài
  khoản), nên `Số cá nhân` vẫn sai loại. Đuôi `đang mở` tự chặn cách đọc ấy, nên
  cột thoả thuận giữ `Số`, còn cột cá nhân phải dùng `Số lượng`.
- `Bổ sung` trả về dạng dài. `CONTEXT.md` lấy chính cặp này làm ví dụ cho luật,
  với lý lẽ rằng "đang ở trong bảng dữ liệu" đã cấp chữ "dữ liệu". Hai người lạ
  bác đúng câu đó. Hội đồng bác thêm một tầng: `Bổ sung dữ liệu` là **cụm động
  từ đứng trên cột không chứa hành động**, nên người đọc hiểu thành một nút bấm.
  Cùng lỗi ấy ở `Lưu trữ`, và `Lưu trữ` nhận lại danh từ đứng trước:
  `Ngày lưu trữ`, cho khớp `Ngày tạo`. Cột bổ sung thì KHÔNG: bản thử
  `Trạng thái bổ sung dữ liệu` đo ra 141,7px trong một ô rộng nhất 83,8px, tức
  **không vừa ở bất kỳ bề rộng nào** — nên tiêu đề giữ `Bổ sung dữ liệu`, còn
  dạng dài `Trạng thái bổ sung dữ liệu` sống ở nhãn dùng trong menu, chỗ độ dài
  không tốn gì. Hội đồng chia 2–1 ở nhãn này; số đo là thứ phá thế chia.
- `Hoạt động cuối` đổi thành `Hoạt động gần nhất`. Cả ba người chấm nêu cùng một
  điều: `cuối` trong tiếng Việt là *cuối cùng, đã hết*, và với nhân viên quan hệ
  đối tác thì "quan hệ đã dừng" là đúng thứ nghĩa không được hiểu nhầm.

**Hợp đồng cookie:** `Max-Age` một năm · `Path=/` · `SameSite=Lax`. Không khai
thì cookie thành cookie-phiên, và lựa chọn mất khi người tắt máy — một phép đo
đóng-mở-tab không bắt được điều đó.

**Giá đã nhận:** trang đăng nhập chuyển từ vẽ tĩnh sang vẽ động, vì `<html lang>`
chỉ khai được ở trang gốc và trang gốc phải đọc lựa chọn ngôn ngữ.
