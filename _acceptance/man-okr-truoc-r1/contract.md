---
schema_version: 1
feature: Màn OKR trước R1 — Hồi ý không bị thanh công bố che, Cập nhật tuần nói «đã xong tuần này», thẻ Toàn cảnh không nói ngược bảng
slug: man-okr-truoc-r1
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-04
design_doc: docs/superpowers/specs/2026-10-04-man-okr-truoc-r1-design.md
---

# Acceptance Contract: man-okr-truoc-r1

## Context

Khảo sát màn thật 04/10 (mục A2 của bản đề xuất lộ trình, ảnh `r1-quan-tri-hoi-y-1440.png`,
`r1-nhan-vien-cap-nhat-tuan-1440.png`, `r1-quan-tri-toan-canh-1440.png`) thấy ba màn OKR làm người
dùng hiểu sai ngay trước R1:

- **Hồi ý (R1m-1):** `ThanhCongBo` ở `okr/hoi-y/khoi-ket-luan.tsx` gọi `SaveBar` dạng checklist với
  `defaultOpen`; thanh nổi bung sẵn danh sách điều thiếu và phủ 3/5 ý chưa gom ở màn đầu 1440 × 900.
- **Cập nhật tuần (R1m-4):** `okr/cap-nhat-tuan/cap-nhat-tuan.tsx` luôn mở form; người đã gửi tải lại
  trang thì thấy «Gửi 0 cập nhật» như chưa gửi. API đã trả `updatedThisWeek`, `lastAt`,
  `lastConfidence`, `currentValue` cho từng KR.
- **Toàn cảnh (R1m-6):** thẻ «Đơn vị đã công bố OKR» đếm mục tiêu riêng của đơn vị, hàng bộ phận
  trong bảng gộp cả phòng ban con; thẻ ghi «Khối Hỗ trợ chưa đặt» khi bảng ghi 6 mục tiêu · 12 KR.

Hướng sửa chủ kho chọn 04/10: thanh Hồi ý thu gọn mặc định; Cập nhật tuần có màn «đã xong tuần này»;
Toàn cảnh giữ cách đếm, nói rõ bằng chữ, không đổi API. R1m-7 là lỗi, giao R1d (P1).

## Criteria

- AC-1: Given người chọn của một lần hỏi ý đang gom còn ít nhất một điều thiếu, When trang Hồi ý dựng xong, Then thanh công bố mang tiêu đề «Còn N điều trước khi công bố» (N = số điều thiếu), danh sách điều thiếu không hiển thị, nút «Xem danh sách» có `aria-expanded="false"`, «Công bố» tắt; When người chọn bấm «Xem danh sách», Then danh sách hiện, mỗi điều thiếu là một liên kết tới phần tử có trong trang, nút đổi thành «Ẩn danh sách» với `aria-expanded="true"`; And khi lần hỏi ý đủ điều kiện thì thanh mang «Sẵn sàng…», không có danh sách cũng không có nút danh sách, «Công bố» bật.
- AC-2: Given lần hỏi ý mẫu đang gom có năm ý chưa gom và người chọn mẫu, When người chọn mở tab Hồi ý trong trình duyệt thật của cây đang xét ở 1440 × 900 và 390 × 844, Then không ý chưa gom nào nằm trọn trong khung nhìn đầu mà bị thanh công bố phủ lên tâm (đo bằng `elementFromPoint`); And thanh thu gọn cao không quá 80 px ở 1440 và 120 px ở 390; And mỗi ý chưa gom, khi cuộn tới giữa khung nhìn, bấm trúng chính nó; And bấm «Xem danh sách» rồi bấm điều «Còn ý chưa gom vào chủ đề» thì danh sách ý chưa gom nằm trong khung nhìn; And khổ 390 không cuộn ngang.
- AC-3: Given người phụ trách có ít nhất một KR và mọi KR của mình đã có cập nhật tuần này, When trang Cập nhật tuần dựng xong, Then trang ở trạng thái `ST-capnhat-daxong`: một thông báo «Bạn đã gửi cập nhật tuần này» nằm trong vùng `role="status"`, kèm ngày và giờ Việt Nam của lần gửi mới nhất (lớn nhất trong các `lastAt`, bất kể thứ tự KR), mỗi KR một dòng với số hiện tại định dạng như ô giá trị của form và mức tự tin của lần gửi cuối, không có nút «Gửi»; When bấm «Sửa cập nhật», Then form hiện với số điền sẵn, mức tự tin chưa chọn (mỗi KR vẫn ghi mức tuần này bên dưới), nút gửi ghi «Gửi 0 cập nhật» và tắt, focus nằm ở ô giá trị của KR đầu, chưa có gì được gửi; chỉ KR được chọn mức mới được gửi.
- AC-4: Given người phụ trách có x trong y KR đã cập nhật tuần này với 0 < x < y, When trang Cập nhật tuần dựng xong, Then trang ở `ST-capnhat-motphan`: form như cũ, trên đầu có dòng «Đã gửi x/y KR tuần này», mỗi KR đã cập nhật tuần này mang dấu «Đã gửi tuần này», KR chưa cập nhật không mang dấu, mức tự tin không chọn sẵn; And khi x = 0 trang ở `ST-capnhat-dangdien` không có dòng ấy và không dấu nào; And khi người đó không phụ trách KR nào trang giữ trạng thái rỗng `ST-capnhat-rong` hiện có, không có thông báo «đã gửi».
- AC-5: Given nhân viên mẫu phụ trách hai KR quý 4 mẫu, When nhân viên mở Cập nhật tuần trong trình duyệt thật lúc chưa KR nào có cập nhật tuần này, chọn mức tự tin cả hai KR, gửi, rồi tải lại trang, Then CSDL có đúng hai `OkrCheckIn` mới mang tuần này và trang sau khi tải lại ở `ST-capnhat-daxong` với hai KR đúng mức vừa chọn; When bấm «Sửa cập nhật», đổi mức tự tin một KR và gửi, Then CSDL thêm đúng một `OkrCheckIn` cho KR đó và trang tải lại vẫn ở `ST-capnhat-daxong` với mức mới; And khi xoá cập nhật tuần này của một KR thì trang ở `ST-capnhat-motphan` với «Đã gửi 1/2 KR tuần này»; And khổ 390 không cuộn ngang ở cả ba trạng thái. (cross-layer)
- AC-6: Given API Cập nhật tuần và một người phụ trách ba KR chưa có cập nhật nào, When người đó đọc danh sách trước khi gửi, Then mọi KR có `updatedThisWeek` sai và `lastConfidence` rỗng; When gửi một lô rồi gửi lô thứ hai trong cùng tuần, Then lô hai được nhận và đọc lại trả mọi KR `updatedThisWeek` đúng, `currentValue` và `lastConfidence` theo lô mới nhất — đúng các trường màn «đã xong» đọc.
- AC-7: Given dữ liệu Toàn cảnh có một bộ phận chưa có mục tiêu riêng trong khi phòng ban con có mục tiêu, When trang Toàn cảnh dựng xong ở tiếng Việt và tiếng Anh, Then thẻ «Đơn vị đã công bố OKR» ghi «<tên> chưa có mục tiêu riêng» (tiếng Anh: «<tên> has no objectives of its own»), tên đơn vị nằm trong phần tử `translate="no"`; And câu mô tả bảng «Theo đơn vị» nói hàng bộ phận cộng mục tiêu riêng của nó với mục tiêu các phòng ban con; And khi mọi đơn vị có mục tiêu riêng thì thẻ giữ câu «Mọi đơn vị đã có mục tiêu công bố».
- AC-8: Given bộ OKR mẫu quý 4 trong đó «Khối Hỗ trợ» chưa có mục tiêu riêng, When quản trị mẫu mở Toàn cảnh trong trình duyệt thật ở 1440 và 390, Then chữ nhìn thấy của thẻ chứa «Khối Hỗ trợ chưa có mục tiêu riêng», và ở 1440 hàng «Khối Hỗ trợ» của bảng có số mục tiêu lớn hơn 0 và chữ nhìn thấy của câu mô tả bảng là câu mới của AC-7 (dưới 640 px bộ giao diện chung ẩn mọi câu mô tả thẻ và bảng ẩn cột mục tiêu); And khổ 390 không cuộn ngang.
- AC-9: Given các khoá chữ mới hoặc đổi của lượt trong `apps/app/lib/messages`, When chạy bộ gác chữ của kho (`messages-guard`), Then mỗi khoá có bản tiếng Việt có dấu và bản tiếng Anh khác nhau, và mỗi hàm ghép biến có dòng ghim.
- AC-10: Given ba tệp màn của lượt (`khoi-ket-luan.tsx`, `cap-nhat-tuan.tsx`, `toan-canh.tsx`), When chạy sàn thiết kế tĩnh, Then không có lỗi P0; And không chỗ gọi nào đè màu, góc hay khoảng cách của thành phần `@crm/ui` bằng `className`.
- AC-11: Given ảnh ba màn sau sửa ở 1440 và 390 (Hồi ý thu gọn và mở, Cập nhật tuần đã xong và một phần, Toàn cảnh), When một nhân viên văn phòng đọc ảnh, Then họ thấy hết ý chưa gom mà không phải đóng gì, biết ngay mình đã gửi cập nhật tuần này và lúc nào, và không đọc thấy thẻ nói ngược bảng; chữ theo từ điển `CONTEXT.md` (bộ phận, phòng ban, đơn vị). (judgment)

## Coverage

Quét `morphological-scan` preset test-matrix, 04/10.

- Trục màn × trạng thái dữ liệu:
  - Hồi ý: còn thiếu · đủ điều kiện · đã công bố (không có thanh — Never, không đổi).
  - Cập nhật tuần: chưa gửi KR nào · gửi một phần · gửi đủ · vừa gửi trong phiên · sửa sau khi đủ.
  - Toàn cảnh: bộ phận có mục tiêu riêng · không riêng nhưng phòng ban con có · không có gì · mọi đơn
    vị đã có.
  - [thước CE: bảng trạng thái của design doc + ảnh khảo sát A2 — SUY-TỪ-REPO: `docs/superpowers/specs/2026-10-04-man-okr-truoc-r1-design.md`]
- Trục khổ: 390 · 1440 [thước CE: `docs/design.md`, hai khổ của khảo sát R1]
- Trục ngôn ngữ: vi · en [thước CE: `apps/app/test/messages-guard.spec.ts`]
- Trục vai: người chọn (Hồi ý) · người phụ trách KR (Cập nhật tuần) · quản trị (Toàn cảnh) — mỗi màn một
  vai chính, vai khác không đổi hành vi trong lượt này.
- Chân ngành: [NGÀNH: 15Five check-in, Lattice Updates] màn check-in sau khi gửi hiện trạng thái đã
  gửi kèm nút sửa; [NGÀNH: Shopify Polaris contextual save bar] thanh lưu một hàng.
- Core: AC-1, AC-2 (Hồi ý còn thiếu, đủ điều kiện) · AC-3, AC-4, AC-5, AC-6 (Cập nhật tuần bốn trạng
  thái) · AC-7, AC-8 (Toàn cảnh bộ phận không riêng, mọi đơn vị đã có) · AC-9, AC-10, AC-11 cắt ngang.
- Later: dấu từng hàng bộ phận «chưa có mục tiêu riêng» trong bảng Toàn cảnh (cần trường mới từ API);
  thanh Hồi ý nhớ trạng thái mở theo người.
- Never: Toàn cảnh «không có gì» — đã là trạng thái `ST-toancanh-tuandau`, lượt không đổi.
- [GIẢ ĐỊNH] Gửi lần hai trong cùng tuần là hành vi đúng (API hiện cho phép; AC-6 ghim lại, không đổi).

## Đường đo

- Ngưỡng «0 người hỏi tôi gửi chưa» · số từ nhật ký vấp lái-thử người-lạ (khuôn `stranger-drive`) ·
  AC-3, AC-5 bảo đảm màn ở trạng thái «đã xong» khi người lái thử mở lại.
- Ngưỡng «0 người bỏ sót ý chưa gom vì bị che» · nhật ký vấp lái-thử · AC-2 bảo đảm khung đầu không
  phủ ý nào.
- Ngưỡng «0 người đọc thẻ Toàn cảnh thành bộ phận chưa có OKR» · nhật ký vấp lái-thử · AC-7, AC-8.

## Out of scope

- R1m-7 «quản trị nhập được cả bộ nhưng không thêm được mục tiêu lẻ» → R1d (P1), Nhật ký 13:35.
- Đổi cách đếm «Đơn vị đã công bố OKR» hay thêm trường mới vào API Toàn cảnh.
- Sửa `SaveBar` dùng chung trong `packages/ui`.
- R1m-2, R1m-3, R1m-5 và các lỗi khung Mục tiêu — hàng R1a (P1).
- Đổi luồng gửi, phiên cập nhật hay tin nhắc buổi sáng của Cập nhật tuần.

## Notes

- Ranh giới phiên P2: `okr/cap-nhat-tuan/**`, `okr/hoi-y/**`, `okr/toan-canh/**`; khoá chữ chỉ thêm ở
  cuối nhóm trong `apps/app/lib/messages/okr.ts` (đổi chữ cũ chỉ ở khoá thuộc ba màn này).
- Lượt chạm mã do hồ sơ đã ký đo (`dot-hoi-y-tuong-okr`, `cap-nhat-tuan-okr`, `toan-canh-okr` và hồ sơ
  có `paths` rộng); trước khi merge chạy làn ghim lại một lượt ở đỉnh nhánh.
- **Known limits (chủ kho ghi ở Cổng Bằng chứng 2026-10-04):**
  - Ngoài-1 — múi giờ Việt Nam của màn Cập nhật tuần khai riêng trong tệp màn, chưa đọc từ cấu hình OKR
    chung; giờ hiện đúng, nhưng đổi múi giờ của OKR sau này thì phải sửa thêm ở màn này.
  - Ngoài-4 — khi KR đầu danh sách lấy số tự động (ô giá trị bị khoá), bấm «Sửa cập nhật» không đặt con
    trỏ vào ô nào; người dùng tự bấm vào ô cần sửa, không mất dữ liệu.
  - Ngoài-5 — phép đo màn thật chọn cùng mức tự tin cho hai KR, nên chưa chứng minh mỗi hàng hiện đúng mức
    của chính KR đó khi hai KR khác mức; test DOM E3 (cao/vừa khác nhau) phủ phần này ở mức fixture.
- **Hợp đồng mới (Ngoài-3):** ngay sau khi «Sửa cập nhật» hoặc gửi nốt KR còn thiếu, màn «Đã gửi» báo nhầm
  «N KR chưa chọn mức tự tin vẫn chờ lần gửi sau» cho KR đã gửi trong tuần — tách thành việc riêng.
