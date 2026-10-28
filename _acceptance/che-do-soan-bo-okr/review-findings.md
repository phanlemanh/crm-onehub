# Review findings: che-do-soan-bo-okr (round 2)

## Trong hợp đồng

- **Chip góp ý trong phiếu mục tiêu cá nhân mở ra một tài liệu rỗng, chỉ xem. Góp ý của Kara cho mục tiêu cá nhân không còn đường nào để xem**
  AC: AC-7
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx:826`
  severity: high
  source: bugs
  detail: Diff này gỡ VungKara/DeXuatNeo khỏi TabKr. Đường duy nhất còn lại tới góp ý là ChipGopYKhung → useMoKhungSoan(cycleId, donCuaMucTieu(mt), mt.id). Với mục tiêu cấp ca-nhan, donCuaMucTieu trả {loai:'nguoi'} (du-lieu-bo.ts:35-36), nên chip vẫn hiện khi soGopYCho>0. Trong khung soạn, capCuaBo({loai:'nguoi'}) trả null, nên chonMucTieuBo trả [] (du-lieu-bo.ts:22-23, 41-42). quyenCua cũng trả chi-xem 'bo-ca-nhan' (use-bo-soan.ts:51). ThanKhung đi nhánh OTaiLieu và không dựng CotBen/KhoiGopY (khung-soan-bo.tsx:267-268). Kết quả: người dùng bấm chip 'N góp ý' rồi rơi vào một tài liệu rỗng, chỉ xem, không có góp ý nào; soanMt cũng bị xoá mà không cuộn tới đâu. Cùng lỗi xảy ra với mọi người chỉ xem, vì nhánh chi-xem không có cột góp ý.
  rationale: AC-7 đòi bấm chip «Kara · N góp ý» của một mục tiêu có góp ý chờ phải mở chế độ Soạn với góp ý của nó ở cột bên; với mục tiêu cá nhân hay người chỉ xem thì không có cột góp ý nên Then không đạt.

- **Xoá KR không làm mới cache: số KR đã lưu bị đếm thừa nên nút công bố mở cho mục tiêu không còn KR**
  AC: AC-6
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-ghi-ban-nhap.ts:329`
  severity: medium
  source: bugs
  detail: xoaKr gọi boKr.mutateAsync nhưng không gọi cache.okr(...). Các nhánh tạo và sửa thì có gọi (dòng 130, 249, 319). Với mục tiêu mới tạo trong phiên: tạo KR làm danhSach refetch, nên bo.mucTieu đã chứa KR đó. Sau khi xoá, boDi chỉ giữ khoá 'moi-N', không có id máy chủ. mucCongBoCua (tai-lieu-bo.tsx:646-651) đếm mt.keyResults lọc theo daBoDi(kr.id), nên vẫn đếm KR đã xoá. soKrDaLuu ≥ 1 làm demCongBo/laMucCongBo coi mục tiêu 0 KR là công bố được. Các màn Theo dõi cũng giữ dữ liệu cũ tới lần refetch sau. xoaMucTieu chỉ refetch danhSach qua bo.thuLai, không làm mới các khoá okr khác.
  rationale: AC-6 đòi N đếm đúng các mục tiêu nháp có ít nhất một KR đã lưu; đếm thừa KR đã xoá làm mục tiêu 0 KR vẫn được tính là công bố được.

- **Mục tiêu tạo trong phiên vẫn vẽ bằng KhoiMucTieuMoi sau khi công bố hay gửi duyệt: bỏ qua khoá số và khoá chờ duyệt**
  AC: AC-3
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/tai-lieu-bo.tsx:161`
  severity: medium
  source: bugs
  detail: mucTieuCoHien loại mọi id nằm trong luuDong.daLuu (dòng 258-263). daLuu không bao giờ được xoá (quen chỉ xoá trang/dangGo), nên mục tiêu tạo trong phiên luôn đi qua KhoiMucTieuMoi. Khối này không đọc status và không dùng khoaCua/khoaSoCongBo: ô tên, ô số của DongKrMoi và nút thêm KR vẫn mở sau khi CongBo đổi status sang cong-bo hay cho-duyet. Sửa số gửi updateKeyResult kèm currentValue=khoi (use-ghi-ban-nhap.ts:196-204). Máy chủ trả lỗi ở cho-duyet (dangChoDuyet) hoặc ở dangChay (hienTaiQuaCapNhat/lyDoDoiDich). Luật khoá số sau công bố (CauKhoa/khoaSo) không áp dụng cho các mục tiêu này.
  rationale: AC-3 đòi mục tiêu đã công bố khoá mọi ô số kèm câu giải thích và mục tiêu chờ duyệt khoá cả dòng; mục tiêu vừa tạo trong phiên rồi công bố thì vẫn sửa được.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The client sorts save errors by matching a regex against the server's error text, not structured error data**
  Người dùng thấy gì: Hiện nay khi lưu một ô số bị sai, người soạn vẫn thấy đúng câu hướng dẫn nhập số. Nếu sau này đổi cách viết câu lỗi ở máy chủ, câu hướng dẫn có thể lặng lẽ thành câu lỗi chung chung.
  Căn cứ: Hôm nay người dùng chưa thấy gì sai, chữ đã gõ không mất, và chỉ khi ai đó đổi câu lỗi ở máy chủ thì thông báo mới kém rõ đi.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-luu-dong.ts`
  severity: medium
  Đề xuất: known-limits

- **The narrow-screen tabs are hand-built with className overrides on TabsList when DetailSheetTabs already does this**
  Người dùng thấy gì: Hai thẻ ở màn hình hẹp dùng được bình thường, nhưng khoảng cách và cách dính đầu trang có thể lệch đôi chút so với các khung bản ghi khác.
  Căn cứ: Chỉ là khác biệt nhỏ về hình thức, người dùng vẫn đổi thẻ và đọc được bình thường, sửa sau không tốn kém.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/khung-soan-bo.tsx`
  severity: medium
  Đề xuất: known-limits

- **VatPhamDock is a near line-for-line copy of KaraArtifact's docked variant**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào; về sau nếu đổi dáng khung vật phẩm Kara thì phải sửa ở hai nơi, có thể lệch nhau.
  Căn cứ: Không ảnh hưởng gì tới người dùng hôm nay, không mất dữ liệu, chỉ làm việc sửa giao diện sau này tốn gấp đôi.
  file: `packages/ui/src/components/kara/vat-pham.tsx`
  severity: low
  Đề xuất: known-limits

- **Three new message keys have no caller and are hidden by adding them to CHUA_NOI_KHAI**
  Người dùng thấy gì: Có ba câu chữ soạn sẵn không hiện ở đâu cả, nên người dùng không thấy gì; chỉ làm kho chữ rối thêm.
  Căn cứ: Không có hậu quả nào với người dùng, chỉ là chữ chết nằm lại, gỡ lúc nào cũng được.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Xoá trắng tên mục tiêu hay toàn bộ dòng KR đã lưu thì không lưu, không báo, và không hỏi khi đóng**
  Người dùng thấy gì: Nếu người soạn xoá trắng tên một mục tiêu hay một KR đã lưu, ô hiện trống nhưng dữ liệu cũ vẫn còn trên hệ thống, và khi đóng khung không có lời hỏi nào. Tải lại thì tên cũ quay về.
  Căn cứ: Không mất dữ liệu (tên cũ vẫn còn) và người dùng tự khôi phục bằng cách tải lại, nhưng có thể gây hiểu nhầm là đã xoá.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-ghi-ban-nhap.ts`
  severity: medium
  Đề xuất: known-limits

- **Lối 'thêm KR' từ góp ý Kara cho mục tiêu tạo trong phiên thêm một dòng không hiện ở đâu**
  Người dùng thấy gì: Với mục tiêu vừa gõ trong phiên, bấm «thêm KR» từ góp ý của Kara thì không thấy dòng nào hiện ra và không có phản hồi, người dùng tưởng nút hỏng.
  Căn cứ: Chỉ gặp ở mục tiêu mới tạo cùng phiên và người dùng vẫn tự thêm KR bằng tay được, không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/khung-soan-bo.tsx`
  severity: medium
  Đề xuất: known-limits

- **Công bố khi quyền chi tiết chưa tải xong hoặc tải lỗi thì rơi về publishObjective thay cho guiDuyet**
  Người dùng thấy gì: Nếu thông tin quyền chưa tải kịp hoặc bị lỗi, nút vẫn đọc «Công bố» thay cho «Gửi duyệt» và người dùng chỉ thấy lỗi từ máy chủ mà không rõ lý do.
  Căn cứ: Hiếm gặp, hệ thống từ chối nên không có dữ liệu nào bị công bố sai, và người dùng thử lại sau khi tải lại là được.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/cong-bo.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 + 2 (âm tính đứng một mình, fixture viết tay đúng khuôn bên đọc): ca vk10-ngan khẳng định vắng hai selector mà không component nào render, rồi đỏ hoá bằng một div tự chế**
  Người dùng thấy gì: Sản phẩm hiện đúng, nhưng bài kiểm tự động khó phát hiện nếu sau này vùng Kara cũ lại bị chèn vào khung chi tiết mục tiêu.
  Căn cứ: Người dùng hôm nay không bị ảnh hưởng, rủi ro chỉ xuất hiện nếu có thay đổi sau này mà không ai để ý.
  file: `apps/app/test/che-do-soan-bo-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): chieu-do-ngan của E13 chèn `<section data-vung-kara="" />` thay vì giữ VungKara**
  Người dùng thấy gì: Sản phẩm hiện đúng, nhưng phép đo kiểm tra «không còn vùng Kara» chưa chứng minh được nó sẽ bắt được lỗi nếu vùng này quay lại.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; lỗi quay lại vẫn bị bắt gián tiếp bằng phép đo góp ý neo.
  file: `_acceptance/che-do-soan-bo-okr/rang/man-soan-chieu-do.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
