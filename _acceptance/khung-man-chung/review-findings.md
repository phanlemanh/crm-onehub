# Review findings: khung-man-chung (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đọc trang và Duyệt đề xuất có hai lối về danh sách chồng nhau, và hai <header> đầu trang**
  Người dùng thấy gì: Khi mở một trang tài liệu hay màn duyệt đề xuất, người dùng thấy hai dòng dẫn đường liền nhau cùng quay về danh sách (một chữ «Tài liệu» và một nút «Về danh sách»). Không hỏng chức năng, chỉ thừa và hơi rối mắt.
  file: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Dòng lý do khoá dùng component mới PageShellNote, lệch bảng xuất xứ của spec (FieldDescription) và lệch nếp có sẵn ở giai-doan**
  Người dùng thấy gì: Dòng giải thích «vì sao nút này đang tắt» ở màn Giai đoạn được vẽ theo kiểu khác với Onboarding, Tổ chức, SSO và Tài liệu. Người dùng có thể thấy chữ nhìn không đồng nhất giữa các màn, nhưng thông tin vẫn hiện đủ.
  file: `apps/app/components/page-shell-note.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bàn đo ghi thẳng bảng onboardingTemplate, bỏ qua API archiveTemplate có sẵn**
  Người dùng thấy gì: Công cụ chụp màn dùng đường tắt để tạo tình huống «chưa có khuôn kế hoạch». Người dùng cuối không bị ảnh hưởng gì; chỉ là cách dựng dữ liệu thử chưa đi qua đường chính thức.
  file: `_acceptance/khung-man-chung/rang/chup-man.mjs`
  severity: medium
  Đề xuất: wont-fix

- **KhungXuong tự vẽ hộp rounded-lg border thay vì dùng Item/Card có sẵn trong packages/ui**
  Người dùng thấy gì: Khung xám giữ chỗ lúc đang tải được vẽ tay chứ không dùng đúng thành phần danh sách của hệ thống. Sau này nếu kiểu danh sách đổi, khung chờ có thể lệch nhẹ so với nội dung thật.
  file: `packages/ui/src/components/khung-xuong.tsx`
  severity: low
  Đề xuất: known-limits

- **khung-man-chung.spec.ts runs git grep on SHA 3a2783409, which a shallow CI checkout does not have**
  Người dùng thấy gì: Một bài kiểm tự động có thể báo đỏ trên máy chủ kiểm thử của công ty dù màn hình hoạt động đúng, vì máy đó không có đủ lịch sử mã. Người dùng cuối không thấy gì, nhưng việc gộp mã có thể bị chặn oan.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Detail pages now render two PageShellHeaders, so the view-transition-name is duplicated and breadcrumbs repeat**
  Người dùng thấy gì: Ở chi tiết chiến dịch, Đọc trang và Duyệt đề xuất, hiệu ứng chuyển cảnh khi vào hoặc ra màn có thể bị trình duyệt bỏ qua, và có hai dòng dẫn đường về cùng một chỗ. Màn vẫn dùng được bình thường.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **CampaignDetail checks isError before data, so a failed background refetch replaces an already-loaded page with the error box**
  Người dùng thấy gì: Đang xem chi tiết chiến dịch, nếu một lần làm mới ngầm gặp lỗi mạng thoáng qua thì cả trang đang hiển thị bị thay bằng khung «không tải được». Người dùng mất chỗ đang xem dù dữ liệu cũ vẫn còn.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: medium
  Đề xuất: new-contract

- **A campaign that does not exist (NOT_FOUND) is reported as 'server not responding, try again'**
  Người dùng thấy gì: Mở một chiến dịch đã bị xoá hoặc đường dẫn sai sẽ báo «máy chủ không trả lời, thử lại», và bấm Thử lại không bao giờ thành công. Người dùng bị dẫn tới tưởng là lỗi mạng thay vì biết chiến dịch không còn.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Org settings: when org.access fails, the read-only note disappears and the buttons are disabled with no reason**
  Người dùng thấy gì: Ở trang Tổ chức, nếu việc kiểm tra quyền bị lỗi thì các nút bị tắt mà không có dòng nào giải thích. Người dùng không biết vì sao không sửa được.
  file: `apps/app/app/(app)/[slug]/settings/organization/hanh-dong-dau-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **chup-man.mjs kiemQuanHe passes when a measurement is missing, so steps 3–5 and E12m can pass without measuring anything**
  Người dùng thấy gì: Công cụ đo bố cục có thể báo «đạt» dù không tìm thấy phần tử cần đo. Người dùng cuối không bị ảnh hưởng, nhưng bằng chứng về bố cục đầu trang có thể yếu hơn vẻ ngoài.
  file: `_acceptance/khung-man-chung/rang/chup-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): ô đối chứng «onboarding có một khuôn» qua được ngay cả khi khuôn rỗng**
  Người dùng thấy gì: Bài kiểm tự động cho trường hợp «đã có khuôn kế hoạch» có thể xanh ngay cả khi không có khuôn. Màn hình thật có thể vẫn đúng, nhưng lưới an toàn bắt lỗi nút «Kế hoạch mới» bị tắt oan đang lỏng.
  file: `apps/app/test/khung-man-chung.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E8/E9/E10 tự dựng đầu trang trong tệp test nên không đo vị trí dòng lý do ở page.tsx thật**
  Người dùng thấy gì: Bài kiểm tự động dựng đầu trang giả thay vì dùng trang thật, nên nếu ai đó lỡ đặt dòng giải thích «nút bị tắt vì sao» sai chỗ trên trang thật thì bài kiểm vẫn xanh.
  file: `apps/app/test/khung-man-chung.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng thiếu ma trận toàn phần): E1 chỉ khẳng định soTrang > 0 thay cho đếm đúng số page.tsx có Suspense**
  Người dùng thấy gì: Phép kiểm tự động xem còn màn nào dùng vòng quay toàn trang chưa đếm đúng con số cần có, nên có thể bỏ sót một màn. Hiện chưa có màn nào được chỉ ra là còn quay.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): kiemQuanHe/soCap trong chup-man.mjs im lặng cho qua khi không đo được hộp**
  Người dùng thấy gì: Công cụ chụp và đo màn có thể in «đạt» khi không đo được gì, nên bằng chứng về thứ tự tiêu đề, mô tả, nút ở khổ điện thoại và máy tính yếu hơn vẻ ngoài. Màn thật chưa bị chỉ ra là sai.
  file: `_acceptance/khung-man-chung/rang/chup-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt hoặc vắng mặt thay cho quan hệ): dem-khung-loi --tu-kiem không kiểm N_HEAD = N_goc − số phần tử đã đổi**
  Người dùng thấy gì: Công cụ đếm các khung báo lỗi tự dựng còn sót không tự bắt được trường hợp có thêm khung mới sinh ra. Người dùng cuối không bị ảnh hưởng, chỉ là con số theo dõi nợ có thể sai lệch.
  file: `_acceptance/khung-man-chung/rang/dem-khung-loi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bản gốc ghim page-shell-truoc-width.tsx.txt bị sửa tay cho khớp mã mới**
  Người dùng thấy gì: Bản đối chứng dùng để chứng minh khung trang không đổi khi không truyền chiều rộng đã bị sửa cho khớp mã mới, nên nó không còn bắt được thay đổi ngoài ý muốn ở đầu trang. Người dùng không thấy ngay, nhưng lưới an toàn cũ yếu đi.
  file: `apps/app/test/fixtures/page-shell-truoc-width.tsx.txt`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
