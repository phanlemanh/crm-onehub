---
schema_version: 1
feature: Thẻ góp ý của Trợ lý OKR — hộp sửa rộng hơn khi cột góp ý mở, mỗi đề xuất là thẻ xếp dọc trải hết bề ngang với hàng nút ở chân và đúng một nút chính, dựng trên Confirmation của AI Elements; gợi ý thông tin ở tab Tổng quan dùng cùng thẻ; chỉ giao diện
slug: the-gop-y-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-09-29
design_doc: docs/superpowers/specs/2026-09-29-the-gop-y-okr-design.md
---

# Acceptance Contract: the-gop-y-okr

## Context

Lượt 9b (#207) đưa Trợ lý OKR vào hộp sửa Mục tiêu và KR, nhưng lái thử 29/09 cho thấy cột
góp ý chật: hộp 640 px chia đôi, nút Nhận · Sửa · Bác xếp cạnh chữ, câu đề xuất còn ≈ 135 px,
ba nút cùng trọng lượng. Chủ kho duyệt phương án A của bản rà soát UX cùng ngày. Lượt này chỉ
đổi giao diện: dữ liệu, tác tử, bộ kiểm, vết và hoàn tác giữ nguyên.

Source input: `.acceptance-runs/tro-ly-okr-de-xuat/ux-ra-soat-2026-09-29/index.html` · `opportunity.md`

## Criteria

- AC-1: Given hộp Sửa mục tiêu và hộp Sửa KR ở khung 1440 px, mỗi hộp có đề xuất chờ, When cột góp ý mở, Then hộp chuyển sang cỡ dành cho form cộng cột góp ý, cột góp ý rộng ≥ 360 px, câu mới của thẻ viết lại có bề ngang ≥ 320 px, cột form không hẹp hơn hộp sửa khi không có cột, và trang không tràn ngang.
- AC-2: Given một đề xuất viết lại đang chờ, When thẻ hiện, Then thẻ có ba tầng theo thứ tự — nhãn loại kèm tên ô, câu cũ gạch nằm trên câu mới, lý do — và hàng nút nằm dưới lý do, không cùng hàng với chữ; trong hàng có đúng một nút tô màu là «Nhận», «Sửa» là nút viền, «Bác» là nút mờ đứng cuối hàng.
- AC-3: Given thẻ viết lại đang chờ, When người bấm «Sửa», đổi chữ rồi bấm «Nhận bản đã sửa», Then thủ tục quyết nhận đúng chữ đã sửa; «Huỷ» và phím Esc trong ô sửa đưa thẻ về chờ mà không đóng hộp; trong chế độ sửa, nút tô màu duy nhất là «Nhận bản đã sửa».
- AC-4: Given một câu hỏi gắn với một KR, When người bấm «Mở KR này», Then hộp Sửa mục tiêu đóng và hộp Sửa KR của đúng KR đó mở; câu hỏi không gắn KR nào chỉ có «Bỏ qua», không có «Mở KR này».
- AC-5: Given một đề xuất căn chỉnh đang chờ, When thẻ hiện, Then nút tô màu duy nhất là «Căn chỉnh» và «Bác» là nút mờ cuối hàng; sau khi quyết, thẻ thu gọn một dòng như thẻ viết lại.
- AC-6: Given thẻ viết lại cho một ô của form, When người rê chuột hoặc focus vào thẻ, Then ô đó của form có viền nhấn; rời thẻ thì viền nhấn tắt; thẻ câu hỏi và căn chỉnh không nhấn ô nào.
- AC-7: Given focus nằm trong cột góp ý, When người bấm J, K, Enter, E, Then J và K chuyển focus sang thẻ chờ kế và trước, Enter nhận thẻ đang focus, E mở sửa thẻ viết lại đang focus; When focus nằm ngoài cột, Then các phím đó không quyết, không mở sửa thẻ nào.
- AC-8: Given cột góp ý mở với thẻ ở mọi dạng (chờ, đang sửa, đang gửi, đã quyết, lỗi), When người bấm vào bất kỳ nút, chữ hay khoảng trống nào trong cột, kể cả nút «Sửa» chuyển thẻ sang sửa, Then hộp sửa không đóng.
- AC-9: Given các dòng ST-thegopy-* trong bảng của đặc tả UX, When dựng từng dòng, Then mỗi dòng hiện đúng chữ và điều khiển của bảng — nút nhận khoá kèm lý do khi ô đang sửa chưa lưu, lỗi dưới thẻ khi nhận bị từ chối, thẻ gọn «Đã nhận» / «Đã bác» sau khi quyết.
- AC-10: Given tab Tổng quan trong khung chi tiết của một Cá nhân có thông tin tác tử đề xuất, When thẻ hiện, Then thẻ dùng cùng thành phần thẻ duyệt ở chế độ gọn với hàng nút ở chân, «Nhận» tô màu và «Bác» mờ; bấm Nhận hay Bác gọi thủ tục quyết thông tin với đúng mã và quyết định như trước.
- AC-11: Given khung 390 px, When cột góp ý mở ở hộp Sửa mục tiêu và hộp Sửa KR, Then cột xếp xuống dưới form, mỗi thẻ trải hết bề ngang cột, không phần tử nào tràn ngang trang; ở khung 1440 px và 1024 px form và cột đứng cạnh nhau; ngay dưới mốc, ở 1023 px, cột đã xếp dưới form.
- AC-12: Given kho sau lượt, When đọc `packages/ui` và `docs/chat-ui.md`, Then `packages/ui` không còn export thành phần accept/dismiss tên `Suggestion`; `ai-elements/confirmation.tsx` có trong cây và được ít nhất một màn trong `apps/**` dùng tới; register ghi `confirmation` là Adopted và có trong cây; sổ lệch chuẩn có một mục cho `confirmation.tsx`.
- AC-13: Given phiên đo riêng có bộ OKR mẫu và model thật, When lái màn đi luồng bật cho phòng → nhờ góp ý → sửa rồi nhận → bỏ qua câu hỏi → bác đề xuất ở khung 1440 và 390, Then ảnh từng bước cho thấy thẻ mới, giá trị đọc lại qua API sau khi nhận đúng chữ đã sửa, và tab Vết có dòng «theo đề xuất của Trợ lý OKR».
- AC-14: Given ảnh thẻ góp ý ở 1440 và 390 do AC-13 chụp, When một người không làm lượt này đọc, Then họ chỉ ra được ngay nút chính của mỗi thẻ cần quyết (viết lại, căn chỉnh) và đọc câu mới liền một mạch, không phải dò dòng ngắn. (judgment)

## Coverage

Quét bằng `morphological-scan` ngay trong phiên (29/09).

- **Trục A — loại thẻ:** viết lại tên Mục tiêu · «vì sao lúc này» · tên KR · câu hỏi gắn KR · câu hỏi cấp Mục tiêu · căn chỉnh · thông tin của Cá nhân  [thước CE: `DongGopY` trong `cot-gop-y.tsx` và `FactSuggestion` trong `facts.tsx` — SUY-TỪ-REPO]
- **Trục B — dạng thẻ:** chờ · đang sửa · đang gửi · đã quyết · lỗi nhận · nhận khoá  [thước CE: nhánh render của `suggestion.tsx` và bảng trạng thái 9b — SUY-TỪ-REPO]
- **Trục C — khổ:** hai cột (≥ 1024) · xếp dọc (< 1024), kiểm ở 1440 và 390  [thước CE: bộ khổ của E4 lượt 9b; NGÀNH: ReUI ai-chat-2 panel dock]
- **Trục D — cách tương tác:** chuột · bàn phím · trình đọc màn hình (tên nút)  [thước CE: NGÀNH: Linear Triage, GitHub Copilot review — phím, nút ở chân]
- [GIẢ ĐỊNH] Chưa làm «Nhận tất cả», chip nguồn Trợ lý đã đọc, nhiều phương án viết lại.
- [GIẢ ĐỊNH] «Mở KR này» đóng hộp Mục tiêu rồi mới mở hộp KR, không lồng hai hộp.
- [GIẢ ĐỊNH] Phím J/K theo nếp Linear, Gmail; không có phím tắt toàn cục.
- [GIẢ ĐỊNH] Tên thành phần mới `ProposedChange`.

## Đường đo

- Thước: người lạ quyết đủ ba đề xuất mà không hỏi «bấm nút nào», và 0 lần hộp đóng ngoài ý · số từ: nhật ký vấp của buổi lái thử người lạ (khuôn `stranger-drive-template.md`) · bảo đảm bởi: AC-2, AC-8, AC-14
- Thước: số lần người lạ bấm «Bác» rồi nói mình định nhận, CHẾT ≥ 1 · số từ: nhật ký vấp của buổi lái thử người lạ (cột riêng cho bấm nhầm) · bảo đảm bởi: AC-2, AC-5, AC-10
- Thước: tỷ lệ «sửa rồi nhận» trên tổng số nhận không giảm so với lượt 9b · số từ: thẻ số đo «Góp ý của Trợ lý OKR» ở Cài đặt › Chương trình OKR · bảo đảm bởi: đã có sẵn: `troLySoDo` của lượt 9b

## Out of scope

- «Nhận tất cả» và gom nhiều đề xuất nhận một lần.
- Chip nguồn Trợ lý đã đọc (Mục tiêu, KR, Cập nhật tuần) — dời sang lượt thống nhất từ vựng tác tử.
- Luồng hội thoại hỏi lại Trợ lý (phương án B) và góp ý nằm dưới ô (phương án C).
- Tab Agent và trình dựng tác tử — lượt `tu-vung-tac-tu`.
- Tác tử ở tab Agent xin duyệt trước khi ghi — lượt `tac-tu-xin-duyet`.
- Đổi dữ liệu, tác tử, bộ kiểm, thủ tục API, vết, hoàn tác, nấc bật/ẩn hay số đo.

## Notes

- Tên truy cập của nút giữ nguyên (Nhận · Sửa · Bác · Bỏ qua · Nhận bản đã sửa · Huỷ) để thước lượt 9b chỉ đổi chỗ bám bố cục.
- Hồ sơ `tro-ly-okr-de-xuat` ghim lại ở S5: bài DOM cột góp ý, bài `suggestion.dom.tsx`, `render-diff.spec.tsx` và `rang/man-gop-y.mjs` của nó đổi theo.

### Known limits (Cổng Bằng chứng, 2026-09-29)

- Ngoài-1: kịch bản lái màn (`rang/man-the-gop-y.mjs`) báo đỏ cả E1, E11, E13 nếu sau ba lần nhờ lại Trợ lý vẫn không đưa ra thẻ căn chỉnh, dù giao diện đúng.
- Ngoài-3: khi lượt nhờ đầu không ra thẻ viết lại, kịch bản lái màn nhờ lại qua API thay vì bấm nút «Nhờ Trợ lý OKR góp ý», nên một nút hỏng có thể lọt ở nhánh thử lại.
- Ngoài-4, Ngoài-8: trong hộp Sửa KR có chữ chưa lưu, thẻ câu hỏi gắn KR hiện dòng «Lưu thay đổi của Mục tiêu trước khi mở KR» dù thẻ không có nút mở KR.
- Ngoài-6: `ProposedChange` nhận `id` nhưng không đặt lên phần tử trang; chưa màn nào truyền `id`.
- Ngoài-7: phép đo E29 của `tro-ly-okr-de-xuat` còn trỏ vào `suggestion.tsx` đã xoá; phải sửa lệnh đó khi ghim lại hồ sơ đó ở S5.
- Ngoài-9: trong lúc một thẻ đang gửi, «Bỏ qua», «Mở KR này», «Bác» ở thẻ khác không khoá; bấm vào không có phản ứng.
- Ngoài-11: dòng «jsdom không tái hiện» của E8 là lời khai in sẵn từ bước thăm dò trên merge-base (lưu ở `.acceptance-runs/the-gop-y-okr/E8-merge-base.txt`), không chạy lại mỗi lượt.
- Ngoài-12: E5 so data-slot của thẻ căn chỉnh đã quyết với thẻ viết lại đã quyết — hai thẻ cùng thành phần nên phép so luôn đúng; phần thu gọn được đo bằng chữ «Đã nhận» và 0 nút.
- Ngoài-13: E10 không đo thứ tự hàng nút đứng sau khối giá trị và bằng chứng ở thẻ thông tin.
- Ngoài-16: cầu nối mới của cổng mồ côi dò tên nhập bằng biểu thức trên văn bản gộp của `apps/**`, nên một chuỗi tên trong tệp kiểm cũng được tính là có người dùng.
