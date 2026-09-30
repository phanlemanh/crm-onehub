---
schema_version: 1
feature: Tạo và sửa OKR cùng khung với deal — tạo và sửa Mục tiêu, thêm và sửa KR mở trong ngăn trượt phải như tạo deal, trạng thái mở trên URL, chân «Huỷ» trái nút chính phải cho mọi ngăn; cột góp ý của Trợ lý OKR mở thành ngăn rộng; thẻ góp ý giữ nguyên; chỉ giao diện
slug: khung-tao-okr-nhu-deal
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-30T04:36:30Z
design_doc: docs/superpowers/specs/2026-09-30-khung-tao-okr-nhu-deal-design.md
---

# Acceptance Contract: khung-tao-okr-nhu-deal

## Context

Tạo deal là ngăn trượt phải; tạo và sửa Mục tiêu (bảy ô) và KR (mười ô) là hộp thoại, phình
thành hộp hai cột khi cột góp ý của Trợ lý OKR mở. `docs/settings.md` («Tạo mới và hỏi lại»)
đòi ngăn trượt khi quá ba ô, trạng thái mở trên URL, chân «Huỷ» trái nút chính phải. Chủ kho
mở hạng mục ngày 2026-09-30 để đồng nhất. Lượt này chỉ đổi vỏ: dữ liệu, thủ tục API, tác tử,
bộ kiểm, vết, hoàn tác của `tro-ly-okr-de-xuat` và `the-gop-y-okr` giữ nguyên.

Source input: yêu cầu của chủ kho 2026-09-30; `docs/settings.md`; `docs/plan/lo-trinh-okr.md` mục 10.

## Criteria

- AC-1: Given trang Theo đơn vị của một đơn vị người dùng sửa được, When người bấm «Thêm mục tiêu», Then một ngăn trượt từ bên phải mở, cùng bề ngang với ngăn tạo deal, URL mang khoá `new`; tạo xong ngăn đóng, khoá rời URL và khung chi tiết Mục tiêu mới mở; tải lại trang khi URL còn `new` thì ngăn mở lại; người không sửa được đơn vị đó mở URL có `new` thì không ngăn nào mở và khoá bị xoá.
- AC-2: Given khung chi tiết của một Mục tiêu người dùng sửa được, When người mở Sửa mục tiêu, Thêm KR, hay Sửa một KR, Then ngăn trượt phải chồng lên khung, URL mang `hopOkr` bằng `muc-tieu`, `kr-moi` hay `kr:<id>` đúng KR; tải lại trang với URL đó mở lại đúng ngăn và đúng đích; đóng ngăn xoá khoá và khung Mục tiêu vẫn mở; đóng khung bản ghi thì `hopOkr` rời URL; khoá trỏ KR không có trong Mục tiêu, hoặc người mở URL không sửa được đích của khoá (Mục tiêu đó, hay KR đó), thì không ngăn nào mở và khoá bị xoá.
- AC-3: Given ngăn tạo deal và bốn ngăn OKR (tạo, sửa Mục tiêu; thêm, sửa KR) ở 1440 px và 390 px với cột góp ý đóng, When đo trong trình duyệt thật, Then cả năm ngăn bám mép phải, cao hết màn, cùng bề ngang (chênh ≤ 1 px), đầu ngăn có tiêu đề ở cùng vị trí, thân ngăn là vùng cuộn duy nhất, chân đứng dưới cùng; không nội dung nào tràn ngang ra khỏi ngăn.
- AC-4: Given mọi ngăn có chân trong `apps/app` ngoài bản mẫu (tạo deal, cá nhân, công ty, chiến dịch, khoá API, SSO, khung tạo ở màn chào, ba ngăn ở Cài đặt › Chương trình OKR, và bốn ngăn OKR mới dựng từ hai thành phần — mười hai chân), When dựng ở 1440 px, Then «Huỷ» nằm bên trái nút chính trên cùng một hàng, hàng dồn về mép phải; ở 390 px nút chính nằm trên «Huỷ»; nút gửi tắt khi form chưa hợp lệ.
- AC-5: Given ngăn Sửa mục tiêu và ngăn Sửa KR có đề xuất chờ, When người mở cột góp ý ở 1440 px, Then ngăn chuyển sang cỡ rộng, cột góp ý ≥ 360 px, câu mới của thẻ viết lại ≥ 320 px, cột form không hẹp hơn thân ngăn khi không có cột; ở 1024 px form và cột cùng hàng; ở 1023 px và 390 px cột nằm dưới form; không bước nào có nội dung tràn ngang ra khỏi ngăn; đóng cột thì ngăn về cỡ thường.
- AC-6: Given một ngăn OKR có chữ đã sửa chưa lưu, When người đóng bằng Esc, bấm ngoài, «Huỷ» hay dấu X, Then hộp hỏi lại hiện và ngăn còn mở tới khi người chọn bỏ; When không có thay đổi, Then ngăn đóng ngay; And When người bấm bất kỳ nút, chữ hay khoảng trống nào trong cột góp ý, hoặc bấm Esc trong ô sửa đề xuất, Then ngăn không đóng.
- AC-7: Given một câu hỏi của Trợ lý OKR gắn một KR trong ngăn Sửa mục tiêu, When người bấm «Mở KR này», Then ngăn Sửa mục tiêu đóng, ngăn Sửa KR của đúng KR đó mở và URL mang `hopOkr=kr:<id>` của KR đó.
- AC-8: Given các bài kiểm của app và của `packages/ui` từng dựng hai hộp OKR, When chạy sau lượt, Then mọi bài xanh mà chỉ đổi chỗ bám vỏ; mỗi lần tạo và sửa Mục tiêu hay KR qua ngăn gửi đúng thủ tục với cùng dữ liệu như hộp thoại cũ, dữ liệu parse bằng schema input thật của thủ tục. (cross-layer)
- AC-9: Given `packages/ui` sau lượt, When đọc mã và chạy bài kiểm của nó, Then `SheetContent` có cỡ `assist` và mang `data-size`, có `SheetBody` với `split`, `SheetFooter` xếp như `DialogFooter`; `dialog.tsx` không còn `DialogAssistBody` hay cỡ `assist` và không tệp nào nhập chúng; bốn ngăn OKR không có `className` đổi cỡ, màu, góc hay khoảng cách của thành phần `@crm/ui`.
- AC-10: Given các hồ sơ đã ký có phép đo bám vỏ hai hộp OKR (`tro-ly-okr-de-xuat`, `the-gop-y-okr`, `hop-thoai-giu-cho-dang-nhap`, `khep-ky-okr`), When chạy lại các phép đo đó trên vỏ mới — kịch bản lái màn trong `rang/` của chúng và các eval máy của chúng — Then mỗi phép đo đạt ở cùng khổ, cùng ngưỡng, cùng mã kỳ vọng như lúc ký; phần sửa trong thước của chúng chỉ đổi chỗ bám vỏ hộp sang ngăn (hoặc thư mục ghi ảnh); chốt đỏ nào thay chữ trong `hop-thoai-kr.tsx` vẫn đổi được tệp đó.
- AC-11: Given `/proto/khung-tao-okr-nhu-deal` và `/proto/tro-ly-okr-de-xuat` khi bật `PROTO_ROUTE=1`, When mở từng state, Then bản mẫu của lượt này có một state cho ngăn tạo deal và một state cho mỗi dòng nhìn thấy được của bảng trạng thái trong thiết kế (mọi dòng trừ ST-khung-cot-hep, ST-khung-url-mo, ST-khung-chan-chung — ba dòng đó là khổ, URL và chân chung, đo trên app thật ở AC-2, AC-4, AC-5); bản mẫu của 9b vẽ ngăn chứ không còn hộp thoại; phép đo sổ bản mẫu xanh.
- AC-12: Given ảnh bốn ngăn OKR và ngăn tạo deal ở 1440 px và 390 px do AC-3 và AC-5 chụp, When một người không làm lượt này đặt cạnh nhau, Then họ thấy cùng một khung — cùng phía, cùng đầu, cùng chân — và ngăn rộng đọc như ngăn đó mở thêm một cột, không phải một màn khác. (judgment)
- AC-13: Given `docs/settings.md`, `docs/plan/lo-trinh-okr.md` và mô tả PR, When đọc, Then `docs/settings.md` ghi chân ngăn đã khớp chân hộp thoại (mục Đợt 2 đánh dấu phần chân đã xong); mục 10 của lộ trình OKR có một dòng mới cho lượt này; mô tả PR ghi bậc tra theo «Vẽ tay là bậc cuối» kèm câu tìm ReUI. (judgment)
- AC-14: Given ngăn Sửa mục tiêu và ngăn Sửa KR có cột góp ý mở (ở trạng thái đang soạn và khi có thẻ), When đo trong trình duyệt thật ở 1440 px và 390 px, Then chữ tiêu đề cột («Trợ lý OKR» / «Trợ lý OKR · KR này») bám mép trái cột — chênh với mép trái của dòng mô tả và của thẻ đầu tiên ≤ 1 px; dấu X đóng cột bám mép phải cột — chênh với mép phải thẻ ≤ 1 px; tiêu đề cột cùng cỡ chữ và độ đậm với tiêu đề ngăn («Sửa mục tiêu»), dòng mô tả dưới nó không to hơn nó; ở 1440 px tâm hàng tiêu đề cột chênh tâm nút đầu tiên của form ≤ 2 px; dấu X đóng cột và dấu X đóng ngăn cách nhau ≥ 8 px, không chồng lên nhau.

## Coverage

Quét bằng `morphological-scan` ngay trong phiên (30/09), bản đầy đủ ở `coverage-scan.md`.

- **Trục A — màn:** Tạo Mục tiêu · Sửa Mục tiêu · Thêm KR · Sửa KR (kể cả vào từ «Mở KR này»)  [thước CE: mọi chỗ gọi `HopThoaiMucTieu`/`HopThoaiKr` — SUY-TỪ-REPO: `objective-sheet.tsx`, `theo-don-vi/theo-don-vi.tsx`]
- **Trục B — phần của khung:** đầu · thân cuộn · chân · trạng thái trên URL · giữ thay đổi · cột góp ý  [thước CE: `docs/settings.md` «Tạo mới và hỏi lại»; `create-deal-sheet.tsx`; NGÀNH: Carbon Design System «Create flows»]
- **Trục C — khổ:** 1440 · 1024 · 1023 · 390  [thước CE: bộ khổ của E1, E11 `the-gop-y-okr`]
- **Trục E — người mở:** người sửa được · người không sửa được (kể cả vai «chỉ OKR») mở bằng URL  [thước CE: URL là đường vào mới của lượt này; trước đây nút đã ẩn theo quyền — phản biện gap-probe 30/09]
- **Trục D — đường vào/ra:** bấm nút · mở bằng URL · Esc · bấm ngoài · Huỷ · X · lưu xong · «Mở KR này»  [thước CE: bộ giữ thay đổi của `packages/ui`; AC-8 `the-gop-y-okr`]
- [GIẢ ĐỊNH] Sửa chân ngăn chung trong lượt này, bảy ngăn tạo khác đổi chân theo.
- [GIẢ ĐỊNH] Ngăn OKR chồng lên khung Mục tiêu, không thay khung.
- [GIẢ ĐỊNH] Ngăn KR có dòng mô tả là tên Mục tiêu; ngăn Mục tiêu không có.
- [GIẢ ĐỊNH] Giữ dấu X như ngăn tạo deal.
- [GIẢ ĐỊNH] Giữ tên tệp và tên thành phần `hop-thoai-*`.

## Out of scope

- Hộp cập nhật tuần của KR và các hộp OKR khác (Căn chỉnh, Mang sang, Nhập) — xét theo luật ba ô ở lượt riêng.
- Chuyển thân các ngăn tạo khác sang `SheetBody` — cùng hình, chỉ gom mã.
- Bỏ dấu X ở ngăn tạo theo Carbon — đổi mọi ngăn, không riêng OKR.
- Đổi tên tệp `hop-thoai-*.tsx`.
- Đổi dữ liệu, thủ tục API, tác tử, bộ kiểm, vết, hoàn tác, nấc bật/ẩn, số đo, hay thẻ góp ý.
- Màn soạn của `soan-okr-cung-tro-ly` — lượt đó dùng lại vỏ này.

## Notes

- 2026-09-30, Cổng Bằng chứng (Manh Phan): phần đầu cột góp ý lệch trái 11 px, lệch dọc so với form, khác kiểu chữ với tiêu đề ngăn, hai dấu X sát nhau — lỗi có từ `the-gop-y-okr`, hộp thoại cũ cũng vậy. Chủ kho chọn sửa ngay trong lượt này: thêm AC-14, duyệt lại Cổng Phạm vi, chấm vòng 4 vượt trần ba vòng.

- Ghim lại ở S5 (không phải một AC): `the-gop-y-okr`, `tro-ly-okr-de-xuat`, `hop-thoai-giu-cho-dang-nhap` — thước hoặc bài kiểm của chúng đổi trong lượt này. Eval nhìn bằng trình duyệt của ba hồ sơ đó không chạy trong làn ghim lại; AC-10 chạy lại chúng trong S4 của hồ sơ này.
