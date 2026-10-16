---
schema_version: 1
feature: "Chờ Tác nhân lâu: thẻ «Đang dựng» có thời gian đã trôi, lời hứa thật và dòng quá ngưỡng; Kara báo trong hộp thông báo khi bộ dựng xong, cần trả lời hay hỏng"
slug: cho-tac-nhan-lau
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api, agent]
status: draft
design_doc: docs/superpowers/specs/2026-10-16-cho-tac-nhan-lau-design.md
approved_by:
approved_at:
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
