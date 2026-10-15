---
schema_version: 1
feature: Người gửi tín hiệu đọc rõ hộp gửi và trang Tín hiệu đã gửi ở mọi khổ màn và mọi ngôn ngữ, thấy lỗi báo đúng chỗ, và đóng biên nhận không bị hỏi lại
slug: sua-giao-dien-tin-hieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-10-14T08:32:54Z
design_doc: docs/superpowers/specs/2026-10-14-sua-giao-dien-tin-hieu-design.md
---

# Acceptance Contract: sua-giao-dien-tin-hieu

## Context

Lượt rà giao diện «Gửi tín hiệu» trên production 14/10 thấy tám lỗi (U1–U8 của
`docs/plan/pham-vi-vong-tin-hieu-1410.md`); năm lỗi đã thành tín hiệu thật crm-1 đến crm-5. Người gặp là nhân viên và
trưởng phòng ban — người dùng CRM thật từ 14/10, không dùng git. Vòng này sửa cả tám trên hộp gửi và trang «Tín hiệu
đã gửi», chỉ trong ứng dụng web: không đổi API, không đổi dữ liệu đã cất, không đổi bộ giao diện chung.

Source input: `_acceptance/sua-giao-dien-tin-hieu/opportunity.md` (Cổng Đáng `build` 2026-10-14, hàng TH6 của
`docs/plan/lo-trinh-okr.json`); thiết kế `docs/superpowers/specs/2026-10-14-sua-giao-dien-tin-hieu-design.md`.

## Criteria

- AC-1: Given trang «Tín hiệu đã gửi» có tín hiệu, When người gửi mở trang ở bề ngang 768, 900, 1100 hay 1280px, Then bảng có bốn cột «Điều đã kể» · «Gửi» (tên màn, dưới là giờ gửi) · «Trạng thái» · thao tác, cột «Điều đã kể» rộng nhất bảng, và trang không cuộn ngang; dưới 768px trang hiện danh sách thẻ như cũ.
- AC-2: Given hộp gửi đang soạn có chữ, When máy chủ từ chối vì đã gửi đủ trần trong ngày giờ Việt Nam, Then câu báo hiện ở một vùng lỗi của cả hộp dưới hai ô (không ô nào bị đánh dấu sai), câu viết theo ngôn ngữ đang chọn và mang số trần, nút «Gửi» khoá và trỏ tới câu đó, chữ đã gõ còn nguyên; đóng hộp mở lại trong cùng ngày vẫn khoá và vẫn hiện câu; sang ngày mới giờ Việt Nam thì mở; When máy chủ lỗi hay mất mạng, Then cùng vùng đó nói «chưa gửi được — thử lại» theo ngôn ngữ đang chọn, chữ còn nguyên, nút «Gửi» bấm lại được; câu chữ của máy chủ không bao giờ hiện thẳng ra.
- AC-3: Given người gửi chọn tiếng Việt hay tiếng Anh, When họ xem giờ gửi trên bảng hay trên danh sách điện thoại, Then giờ viết theo kiểu của ngôn ngữ đó, theo giờ Việt Nam bất kể múi giờ của máy, và căn cùng lề với tên màn phía trên nó.
- AC-4: Given danh sách có tín hiệu, When người gửi nhìn một dòng trên bảng hay trên điện thoại, Then dòng hiện mã tín hiệu (crm-N) đúng với mã trên biên nhận; When họ chọn Xoá, Then hộp hỏi lại nêu mã và nguyên văn điều đã kể (đánh dấu không dịch).
- AC-5: Given người gửi vừa xác nhận xoá một dòng, When xoá xong và danh sách làm mới, Then tiêu điểm tới nút thao tác của dòng ngay dưới (dòng cuối thì dòng ngay trên; dòng đó không xoá được thì chính dòng đó; hết dòng thì nút «Gửi tín hiệu» của trang rỗng) và trình đọc màn đọc «Đã xoá tín hiệu crm-N»; When xoá hỏng vì đội sản phẩm vừa lấy về hay mất mạng, Then dòng còn đó và một câu theo ngôn ngữ đang chọn nói vì sao chưa xoá được.
- AC-6: Given người gửi dùng điện thoại (dưới 768px), When họ nhìn nút thao tác ⋮ của một dòng, Then nút rộng và cao ít nhất 36px (cỡ chạm lớn nhất bộ giao diện chung có); Given hộp gửi có một ô trống hay toàn khoảng trắng, When nút «Gửi» khoá vì thế, Then một dòng chữ cạnh nút nói cần kể đủ hai câu, nút trỏ tới dòng đó cho trình đọc màn, và dòng ẩn khi đủ chữ.
- AC-7: Given hộp vừa gửi xong và đang hiện biên nhận, When người gửi đóng bằng «Đóng», Esc, dấu X, bấm ra ngoài hay «Xem tín hiệu đã gửi», Then hộp đóng ngay, không hỏi «Bỏ những gì vừa nhập?»; Given hộp đang soạn có chữ, When họ đóng bằng «Huỷ», Esc hay dấu X, Then hộp vẫn hỏi lại như trước; Given họ gõ rồi xoá hết chữ, When đóng, Then hộp đóng ngay.
- AC-8: Given người gửi đứng ở bất kỳ màn cấp một nào của ứng dụng (kể cả từng mục Cài đặt), When họ mở hộp gửi, Then dòng «Gửi từ màn» hiện tên màn theo ngôn ngữ đang chọn, không hiện đường dẫn; When họ xem danh sách, Then cột «Gửi» và dòng điện thoại hiện tên màn — kể cả cho tín hiệu cũ đã cất đường dẫn; giá trị gửi lên máy chủ vẫn là đường dẫn như cũ; đường không thuộc ứng dụng hiện nguyên văn.
- AC-9: (judgment) Given người gửi là nhân viên không dùng git, When họ đọc nhãn và câu trạng thái CRM tự viết, câu mô tả hộp, biên nhận và dòng báo, Then không câu nào dùng từ nội bộ (gom, kéo về, kit, khối, bản vẽ, lượt, hồ sơ), câu không lặp lại nhãn đứng cạnh nó, và họ hiểu tín hiệu đang ở đâu; Given tín hiệu đã được đội sản phẩm lấy về, When họ mở menu ⋮ của dòng, Then mục «Xoá» khoá kèm một dòng nói vì sao không xoá được nữa.
- AC-10: Given hộp gửi và trang «Tín hiệu đã gửi» chạy thật, When người đo mở chúng ở bề ngang 375, 768 và 1280px bằng tiếng Việt và tiếng Anh, Then không trang nào cuộn ngang, không nhãn hay nút nào bị cắt chữ, dòng «Gửi từ màn» mang tên màn, đóng biên nhận không hỏi lại, và mỗi tổ hợp có một ảnh.
- AC-11: Given vòng này chỉ sửa giao diện, When so mã của vòng với nhánh chính, Then không tệp nào dưới API, khuôn dữ liệu, gói kiểm khuôn hay bộ giao diện chung đổi; và mọi điều khác hồ sơ «Gửi tín hiệu trong CRM» đã ký vẫn đúng — nút trên thanh đầu trang cùng kiểu cụm, nút «Gửi» khoá khi một ô rỗng, mục «Tín hiệu đã gửi» trong menu, biên nhận mang mã và liên kết, danh sách làm mới sau khi gửi, hỏi lại trước khi xoá, đầu trang đúng một nút chính.
- AC-12: Given tín hiệu đã có chỗ sau gom trong bản vẽ lộ trình (mọi giá trị chỗ mà kit ghi, và mọi nhóm trạng thái của việc), When người gửi xem trang bằng tiếng Việt hay tiếng Anh, Then câu trạng thái viết theo ngôn ngữ đang chọn, dựng từ mã chỗ kit ghi; tên nhóm, lý do và tên việc giữ nguyên chữ người viết và được đánh dấu không dịch; When bản ghi thiếu trường cần cho câu, Then trang hiện nguyên câu kit viết; When mã chỗ lạ (bộ đọc chung gạt cả khối), Then trang không vỡ: hiện trạng thái lúc gửi kèm dòng báo như LT2.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), sổ đầy đủ `_acceptance/sua-giao-dien-tin-hieu/coverage-scan.md`.

- Trục A — Mặt × trạng thái: hộp {soạn trống | soạn có chữ | đang gửi | quá trần | máy chủ lỗi | biên nhận} · trang {có dòng | rỗng | hỏi xoá | xoá xong | xoá hỏng | dòng đã lấy về} [thước CE: bảng trạng thái của Đặc tả UX + 13 trạng thái proto LT2 `apps/app/app/proto/catalog.ts`] → AC-2, AC-4, AC-5, AC-6, AC-7, AC-9
- Trục B — Khổ: 375 | 768 | 900 | 1100 | 1280 [thước CE: lượt rà production 14/10 (khoảng lỗi 768–1100) + nếp breakpoint `md` của `docs/design.md`] → AC-1, AC-6, AC-10
- Trục C — Ngôn ngữ: vi | en [thước CE: `apps/app/lib/messages/tin-hieu.ts` có đúng hai ngôn ngữ] → AC-2, AC-3, AC-8, AC-10
- Trục D — Loại lỗi: bố cục | lỗi sai chỗ | định dạng theo ngôn ngữ | nhận diện (mã, tên màn) | tiêu điểm và cỡ chạm | hỏi lại sai | chữ trạng thái [thước CE: U1–U8 bản phạm vi; WCAG 2.2 — 3.3.1 nhận diện lỗi, 2.4.3 thứ tự tiêu điểm, 2.5.8 cỡ đích] → AC-1…AC-9
- Cắt ngang: không đổi API, dữ liệu đã cất, bộ giao diện chung; điều đã ký của LT2 còn đúng → AC-11

## Đường đo

- Thước: lượt rà lại trên production không còn lỗi nào trong tám (U1–U8), ở 375 · 768 · 900 · 1100 · 1280px × vi/en · số từ:
  chạy lại răng đo màn `_acceptance/sua-giao-dien-tin-hieu/rang/do-man.mjs` với `APP_URL` trỏ production trong 2 ngày sau khi
  gộp (chế độ chỉ đọc: bỏ các ô cần gửi hay xoá), cộng một người rà bằng mắt theo danh sách U1–U8 của bản phạm vi, ghi kết
  quả vào phiên nghiệm thu (`/acceptance-gate:uat-session sua-giao-dien-tin-hieu`) · bảo đảm bởi: AC-1…AC-10 (mỗi lỗi một AC),
  E12 (cùng ma trận khổ × ngôn ngữ đo trên bản chạy).
- Thước: năm tín hiệu crm-1..5 được đánh dấu đã giao · số từ: trang «Tín hiệu đã gửi» của người gửi đọc câu kit viết
  sau lượt gom kế, khi bản gom xếp crm-1..5 vào hàng TH6 · bảo đảm bởi: không AC nào của vòng này — việc của lượt gom
  (kit) và của hồ sơ LT2 (AC-9, AC-10 của LT2); vòng này chỉ cần gộp để hàng TH6 thành «đã giao».

## Out of scope

- U9 — lớp phủ hộp thoại đen đặc ở nền tối: bộ giao diện chung, hàng riêng (chân trời TH7).
- Nút ⋮ 44×44 trên điện thoại — cần một cỡ nút mới trong `packages/ui`; vòng này dùng cỡ lớn nhất đang có (36×36).
- Báo trước quá trần ngay khi mở hộp lần đầu trong ngày (trước lần gửi bị từ chối) — cần API trả số đã gửi.
- Đổi đường dẫn đã cất thành tên màn, hay đổi tệp kéo về git — dữ liệu giữ nguyên, tên suy lúc hiện.
- Đổi khuôn hay câu trạng thái trong kit — CRM dựng câu song ngữ của riêng mình từ mã chỗ (AC-12), kit không đổi.
- Trang «Mọi tín hiệu» của quản trị và câu báo trước Q3 — vòng TH4 (#403).
- Thông báo cho người gửi khi tín hiệu đổi chỗ — S2 của bản phạm vi.

## Notes

- Dựng trên đỉnh onehub SAU khi TH4 (#403) gộp (cùng ba tệp); phiên điều phối báo sha gộp.
- Năm ô đo của hồ sơ LT2 bị thay theo luật kit 2.24 (bảng «Ô đo của LT2 bị thay» trong thiết kế): E1 → AC-8,
  E3b → AC-2, E5b → AC-9, E13 → AC-10, E10 → AC-12.
- Cổng Phạm vi 14/10: chủ kho duyệt nút ⋮ 36×36 (44×44 đi hàng TH7) và câu trạng thái song ngữ (AC-12). Ô khai thay chỉ hợp lệ khi hồ sơ này có chữ ký người — Cổng Bằng chứng là
  cổng người.
- Sửa kèm hai Known limits của LT2: Ngoài-2 (câu quá trần tiếng Việt khi chọn tiếng Anh) → AC-2; Ngoài-5 (xoá hỏng
  không lời giải thích) → AC-5.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-15:
  - Ngoài-1: Nếu tín hiệu đã bị xoá ở một tab khác hoặc phiên đăng nhập đã hết hạn, người dùng vẫn thấy câu «mạng hoặc máy chủ đang gián đoạn, thử lại» dù nguyên nhân khác, và thử lại sẽ không giúp được gì. Chỉ xảy ra ở các ca hiếm này; ca đội sản phẩm đã lấy về và ca mất mạng vẫn báo đúng.
  - Ngoài-2: Khi tín hiệu đã bị xoá ở nơi khác, người dùng được báo sai là mạng gián đoạn trong khi dòng đó thực ra đã biến mất khỏi danh sách. Tương tự với người đã hết phiên đăng nhập khi bấm Gửi. Chỉ là câu báo chưa đúng nguyên nhân ở các ca hiếm, không làm mất dữ liệu.
  - Ngoài-3: Việc đánh dấu «không dịch» cho tên nhóm, lý do và tên việc hiện chưa được bài kiểm tự động kiểm bằng dữ liệu thật. Nếu sau này có thay đổi làm mất dấu đó, trình trình duyệt có thể tự dịch tên người dùng đặt mà không bài kiểm nào báo.
  - Ngoài-4: Nếu dữ liệu lộ trình bị hỏng, trang vẫn hiện câu gốc của đội sản phẩm thay vì câu song ngữ, và không ai được báo vì sao. Người gửi chỉ thấy câu trạng thái bằng một thứ tiếng.
  - Ngoài-5: Sau khi bản này được gộp, phép kiểm không đụng tới phần dùng chung có thể báo xanh mà không kiểm tra gì. Người dùng không thấy ngay, nhưng một thay đổi lỡ chạm vào phần dùng chung sau này có thể lọt qua.
  - Ngoài-7: Bấm «Bỏ» khi được hỏi có muốn bỏ những gì vừa nhập, rồi mở lại hộp, người gửi vẫn thấy chữ cũ còn nguyên dù câu hỏi đã báo là sẽ mất.
  - Ngoài-8: Nếu sau này liên kết giữa nút Gửi và dòng báo lỗi bị mất, bài kiểm hiện tại có thể không phát hiện. Hiện người dùng chưa gặp lỗi nào.
  - Ngoài-9: Các bài kiểm câu báo «đã quá số lần gửi hôm nay» và «đội sản phẩm đã lấy về» dùng lỗi giả tự dựng, nên chưa chứng minh đường lỗi thật từ máy chủ hiện đúng câu. Lỗi thật có thể vẫn hiện sai mà bài kiểm không thấy.
  - Ngoài-10: Bản ghi phá-thử cho thấy bài kiểm dòng đã được đội sản phẩm lấy về bắt được lỗi, nhưng bằng chứng yếu hơn vẻ ngoài. Người dùng không bị ảnh hưởng trực tiếp.
  - Ngoài-11: Phép quét từ nội bộ chưa kiểm các câu trạng thái mới trên trang Tín hiệu đã gửi. Hiện chưa có câu nào dùng từ khó hiểu, nhưng sau này có thể lọt.
  - Ngoài-12: Một bài kiểm cũ của tính năng gửi tín hiệu đã bị nới lỏng mà phép kiểm ranh giới không báo. Người dùng chưa thấy khác biệt, nhưng một lỗi cũ có thể lọt lại khó phát hiện hơn.
  - Ngoài-13: Bài kiểm câu trạng thái chỉ chắc rằng câu khác câu gốc, chứ không chắc đúng nội dung. Một câu sai ngôn ngữ hay sai tên nhóm có thể qua bài này.
  - Ngoài-14: Nếu có người thêm một màn vào danh sách miễn, màn đó sẽ hiện đường dẫn thô thay vì tên màn mà bài kiểm vẫn xanh. Hiện mọi màn đều có tên.
  - Ngoài-15: Bài kiểm nhanh chỉ đọc nhãn cỡ nút, nên nếu ai đó thu nhỏ nút ⋮ trên điện thoại thì bài này không thấy. Phép đo trên màn thật vẫn bắt được.
  - Ngoài-16: Hộp hỏi lại trước khi xoá chỉ được kiểm là không lẫn nội dung của một dòng khác trong ba dòng. Khả năng hộp lẫn tiêu đề dòng kia là rất thấp.
- Mở hợp đồng mới — chọn ở Cổng Bằng chứng 2026-10-15:
  - Ngoài-6: Người dùng bàn phím hoặc trình đọc màn hình bấm «Giữ lại» hay gặp lỗi khi xoá sẽ mất chỗ đang đứng và phải dò lại từ đầu trang.
