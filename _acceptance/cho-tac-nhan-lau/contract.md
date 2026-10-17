---
schema_version: 1
feature: "Chờ Tác nhân lâu: thẻ «Đang dựng» có thời gian đã trôi, lời hứa thật và dòng quá ngưỡng; Kara báo trong hộp thông báo khi bộ dựng xong, cần trả lời hay hỏng"
slug: cho-tac-nhan-lau
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api, agent]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-16-cho-tac-nhan-lau-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-16T06:38:14Z
---

# Acceptance Contract: cho-tac-nhan-lau

## Context

Hàng K7 của đợt r2 (dãy P7). Câu giao của chủ kho: «Vậy trải nghiệm lớn hơn 200s cần được thay đổi ux». Đo 15/10:
Tác nhân trên GLM 5.3 mất 201 s và 200 s, trên GLM 5.2 Fast mất 86–96 s. Màn chờ `/chat/<id>` (`BuildingAgentCard`)
hiện bốn bước nhưng không có thời gian đã trôi; chân thẻ «Chạy ngầm» không hứa gì; rời trang thì không ai báo. Hộp
thông báo có sẵn nhưng chưa có loại nào cho Tác nhân.

## Criteria

- AC-1: Given một lượt dựng đang chạy, When người dùng ở màn `/chat/<id>`, Then thẻ «Đang dựng tác nhân» hiện thời gian
  đã trôi kể từ lúc gửi (mốc của hàng gửi ở máy chủ, không phải lúc mở trang) dạng `phút:giây`, tự tăng mỗi giây; dưới 1
  giây không hiện dòng này; rời trang rồi quay lại thì thời gian vẫn tính từ lúc gửi.
- AC-2: Given thẻ «Đang dựng», When đọc chân thẻ, Then câu «Chạy ngầm» được thay bằng một câu nói người dùng rời trang được
  và Kara sẽ báo trong hộp thông báo khi xong; nút «Dừng lại» giữ nguyên.
- AC-3: Given thời gian đã trôi vượt ngưỡng (200 giây theo câu giao, hằng trong một tệp cấu hình của khu; con số và câu chữ
  theo câu trả lời Hỏi-6), When thẻ vẽ lại, Then thẻ thêm một dòng báo đã chờ lâu; dưới ngưỡng không có dòng này; lượt dựng
  không bị tự huỷ.
- AC-4: Given một cuộc trò chuyện bộ dựng, When một lượt dựng kết thúc ở `apps/agent` — có kết quả (`session.waiting`
  không câu hỏi chờ), cần người dùng trả lời (`session.waiting` có câu hỏi chờ), hay hỏng (`session.failed`,
  `turn.failed`) — Then đúng một `ThongBao` được ghi cho người mở cuộc trò chuyện, loại `tac-nhan-xong`,
  `tac-nhan-can-tra-loi` hay `tac-nhan-hong`, đường dẫn `/<workspace>/chat/<id>`; cùng một lượt gửi nhận sự kiện lần
  hai không sinh thông báo thứ hai; người dùng tự dừng (`turn.cancelled`) không sinh thông báo. (cross-layer)
- AC-5: Given ba loại thông báo mới, When chuông và trang thông báo vẽ chúng, Then mỗi dòng là một câu tiếng sản phẩm nói
  chuyện gì xảy ra với tác nhân nào (tên tác nhân là dữ liệu người dùng, không dịch), bấm thì về cuộc trò chuyện. (cross-layer)
- AC-6: Given thông báo chưa đọc của một cuộc trò chuyện bộ dựng, When người dùng mở cuộc trò chuyện đó, Then các thông báo
  ấy thành đã đọc và số trên chuông giảm tương ứng. (cross-layer)
- AC-7: Given việc ghi thông báo hỏng (cơ sở dữ liệu từ chối, nội dung không qua khuôn), When lượt dựng kết thúc, Then vòng
  đời của cuộc trò chuyện vẫn được ghi như cũ, lỗi được ghi nhật ký, không sự kiện nào ném ra ngoài.
- AC-8: Given chữ mới, When đọc `apps/app/lib/messages`, Then mọi câu có cả bản vi và en, không chữ cứng trong tệp giao diện.
- AC-9: Given màn chờ và chuông ở khổ 375 và 1280, When nhìn các trạng thái — dưới ngưỡng, trên ngưỡng, chuông có thông báo
  «xong», mở cuộc trò chuyện từ chuông — Then màn khớp bảng trạng thái của thiết kế, không tràn, không chữ máy.
- AC-10: Given tệp giao diện vòng này chạm, When chạy cổng thiết kế tĩnh, Then không vi phạm.

## Coverage

- Trục A — trạng thái lượt dựng: đang chạy dưới ngưỡng · trên ngưỡng · xong chờ duyệt · cần trả lời · hỏng · tự dừng.
  Thước CE: các sự kiện kênh `crm` của `apps/agent` [SUY-TỪ-REPO: apps/agent/agent/channels/crm.ts].
- Trục B — người dùng ở đâu: đang xem màn chờ · rời sang màn khác · đóng trình duyệt rồi quay lại.
  Thước CE: thanh bên và chuông [SUY-TỪ-REPO: apps/app/components/thong-bao/chuong-thong-bao.tsx].
- Trục C — kênh báo: thẻ trên màn · chuông trong app · ngoài CRM (Zalo, email). [NGÀNH: GitHub Actions và Vercel
  deployments — trang tiến trình có thời gian đã trôi, rời đi thì báo qua thông báo trong app].
- Core: A1–A5 × B1–B3 qua C1–C2 (AC-1 tới AC-7). C3 (Zalo, email, thông báo trình duyệt) theo câu trả lời Hỏi-4; khuyến
  nghị để ngoài vòng này.
  Never: tự huỷ khi quá ngưỡng (người dùng mất kết quả đang gần xong).

## Đường đo

Ô cơ hội của hàng không khai ngưỡng nghiệm thu (mục «Ngưỡng chết / ngưỡng UAT» còn trống), nên không có thước sau-gộp.

## Out of scope

- Gửi báo qua Zalo, email hay thông báo của trình duyệt — theo câu trả lời Hỏi-4 (khuyến nghị: ngoài vòng này).
- Rút ngắn thời gian dựng, đổi model (MH3, MH4 của dãy P6).
- Màn chạy tác nhân đã triển khai và trần 20 phút của nó.
- Đổi cách đếm bốn bước của thẻ.

## Notes

- Known limits — chọn ở Cổng Bằng chứng 2026-10-17:
  - Ngoài-1: Mở cuộc trò chuyện từ thanh bên thì số trên chuông giảm đúng, nhưng trang Thông báo có thể còn hiện dòng đó là chưa đọc tới khoảng nửa phút, cho tới khi tải lại.
  - Ngoài-2: Đổi nhãn danh sách hội thoại ở thanh bên thì bài đo màn đã ký có thể không bị đánh dấu cũ và đo lệch mà không ai hay.
  - Ngoài-3: Ngay sau khi mở cuộc trò chuyện từ thanh bên, trang Thông báo và chuông có thể hiện lệch nhau một lúc.
  - Ngoài-4: Bài đo màn cho ca mở từ thanh bên không phân biệt được chuông tự làm mới với trang bị tải lại.
  - Ngoài-5: Thẻ «Đang dựng» nằm trong apps/app thay vì packages/ui, nên sửa giao diện chat sau này phải làm ở hai nơi.
  - Ngoài-6: Đường dẫn /chat/<id> được ghép tay ở cả agent lẫn API; đổi một phía mà quên phía kia thì chuông giữ «chưa đọc» mãi.
  - Ngoài-7: Bài kiểm hai ngôn ngữ chưa bắt được chữ «Đã» tiếng Việt hiện trên thẻ bản tiếng Anh.
  - Ngoài-8: Phép đo bước bấm thông báo trên chuông từng có thể báo đạt dù trang không chuyển; thước đã vá ở vòng 4, mục mang sang để ghi lại.
  - Ngoài-9: Bài kiểm chuông chưa chặn được việc hoán nhầm câu giữa «xong», «cần trả lời» và «hỏng».
  - Ngoài-10: Mở cuộc trò chuyện từ màn chat làm chuông giảm đúng, nhưng trang Thông báo có thể còn hiện chưa đọc cho tới khi tải lại.
  - Ngoài-11: Khoảng cách ở đầu và chân thẻ «Đang dựng» được chỉnh riêng thay vì dùng kiểu chung, nên có thể lệch nhẹ so với màn khác.
  - Ngoài-12: Dòng «quá 3 phút» viết cứng; đổi ngưỡng 200 giây thì câu không khớp con số mới.
