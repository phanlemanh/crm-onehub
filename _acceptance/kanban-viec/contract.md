---
schema_version: 1
feature: "Tôi kéo việc giữa các cột Chưa làm, Đang làm, Chờ đánh giá, Xong, và tách một việc to thành việc con"
slug: kanban-viec
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-13-kanban-viec-design.md
---

# Acceptance Contract: kanban-viec

## Context

Hàng DA2 của `docs/plan/lo-trinh-viec-du-an.json`; chủ kho mở ở Cổng Đáng 13/10/2026 (build, mở lại kéo thả chỉ
cho bảng cột của Việc). Sau DA1, «Việc của tôi» là danh sách và đổi trạng thái là bấm từng nút trong khung việc;
một việc to không chia được cho nhiều người. Lượt này thêm kiểu xem **Bảng** bốn cột kéo được, thứ tự riêng
trong cột, và **việc con** một tầng. Hạng T3 vì thêm cột và bảng ở `packages/db/prisma`.

Source input: hàng DA2 · `opportunity.md` (ngưỡng đã chốt) · mục «Việc» của `CONTEXT.md` và `docs/api.md` · hồ sơ
DA1 `_acceptance/viec-chung/` · khảo sát `docs/plan/viec-du-an-nghien-cuu/` · design doc.

## Criteria

- AC-1: Given B là người thực hiện của việc ở mỗi trạng thái Chưa làm, Đang làm, Chờ đánh giá, một việc Xong hôm qua, một việc Xong 10 ngày trước và một việc Huỷ, When B mở Việc của tôi và chọn «Kiểu xem: Bảng», Then đường dẫn mang `xemViec=bang` cạnh `nhomViec`, bảng có đúng bốn cột theo thứ tự Chưa làm · Đang làm · Chờ đánh giá · Xong với số đếm, cột Xong có việc Xong hôm qua mà không có việc Xong 10 ngày trước và cuối cột có dòng dẫn sang kiểu Danh sách nêu số việc Xong còn lại, việc Huỷ chỉ nằm trong dòng gập «Đã huỷ (1)» dưới bảng; When tải lại trang, Then vẫn ở kiểu Bảng và cùng nhóm; When máy tải chậm, tải hỏng hay không có việc nào, Then màn hiện đúng ST-bang-viec-cho-tai, ST-bang-viec-loi (có «Thử lại»), ST-bang-viec-rong và tiêu đề trang giữ nguyên.
- AC-2 (cross-layer): Given B là người thực hiện của việc V ở «Chưa làm» gắn thoả thuận D, When B kéo thẻ V sang cột «Đang làm» trên bảng ở 1280, Then thẻ nằm ở cột Đang làm, số đếm hai cột đổi, và đọc lại từ cơ sở dữ liệu V có trạng thái «Đang làm», `roiChuaLamLuc` đã ghi, đúng một dòng vết `doi-trang-thai` của B có trước «Chưa làm», sau «Đang làm» và nguồn `bang-keo`; When B chọn «Chuyển sang… › Gửi đánh giá» trên thẻ V, Then V sang «Chờ đánh giá» với một dòng vết nguồn `bang-menu`.
- AC-3: Given một việc có người giao A, người thực hiện B, người theo dõi W, When từng người A, B, W, một thành viên khác X và một quản trị Q gọi lệnh kéo `viec.keo` cho từng cặp trong 20 cặp nguồn × đích (5 × 20 = 100 ô), Then kết quả từng ô trùng đúng kết quả của lệnh đổi trạng thái của DA1 trên cùng ô — thành công, 400 «Không chuyển được việc từ … sang …», hay 403 với cùng lời ghim; ô bị từ chối không ghi vết và không ghi khoá thứ tự nào; và `chuyenDuoc` mà `viec.bang` trả là đúng tập đích thành công của hàng đó ở 12 hàng đọc được trên bảng — A ở nhóm «Tôi giao», B ở «Giao cho tôi», W ở «Đang theo dõi», mỗi người × bốn trạng thái có cột (X, Q và trạng thái Huỷ không lên bảng nên chỉ đo bằng ma trận 100 ô của `viec.keo`).
- AC-4: Given bảng của B có việc V ở «Chờ đánh giá» (B là người thực hiện, A là người giao), When B nhấc thẻ V, Then cột «Xong» và «Đang làm» hiện mờ (không nhận), thả vào đó thì thẻ về chỗ cũ và không có lệnh nào tới máy chủ; When B mở menu «Chuyển sang…» của V, Then menu không có mục nào và nút ở trạng thái khoá với một dòng nói chỉ người giao xử lý việc chờ đánh giá; When B xem nhóm «Đang theo dõi», Then thẻ không có tay kéo và không có nút menu; When B dùng bàn phím (Tab tới tay kéo, Space, mũi tên phải, Space) trên một việc «Chưa làm», Then việc sang «Đang làm» với vết nguồn `bang-keo`; When màn rộng 375, Then trang không cuộn ngang, bảng cuộn ngang trong khung của nó và menu «Chuyển sang…» đổi được trạng thái.
- AC-5 (cross-layer): Given cột «Chưa làm» trên bảng của B có ba việc V1, V2, V3 xếp theo hạn, và A (người giao cả ba) cũng xem cùng ba việc ở nhóm «Tôi giao», When B kéo V3 lên đầu cột rồi tải lại, Then bảng của B xếp V3, V1, V2, còn bảng của A giữ thứ tự cũ; đọc lại từ cơ sở dữ liệu có ba khoá thứ tự của B, không dòng vết nào mới, và V3 vẫn xoá được nếu trước đó chưa có lịch sử; When một việc mới giao cho B, Then nó đứng đầu cột Chưa làm; When hai lần chèn vào cùng một khe giữa hai việc, Then hai khoá khác nhau và thứ tự đọc lại đúng thứ tự chèn.
- AC-6 (cross-layer): Given B kéo V từ «Chưa làm» sang «Đang làm» trong lúc A (người giao) vừa huỷ V, When máy chủ trả 400 «Không chuyển được việc từ «Huỷ» sang «Đang làm».», Then thẻ về cột cũ rồi biến khỏi bảng sau khi tải lại (V nay ở dòng gập «Đã huỷ»), toast đọc nguyên lời máy chủ, không có dòng vết nào của B; When mạng hỏng giữa lúc thả, Then thẻ về chỗ cũ và toast có «Thử lại».
- AC-7 (cross-layer): Given việc cha P gắn thoả thuận D, người giao A, người thực hiện B, When B mở khung P, bấm «Thêm việc con», gõ tiêu đề, chọn người thực hiện C và hạn, bấm «Thêm», Then đọc lại từ cơ sở dữ liệu có đúng một việc mới K với `chaId` = P, người giao B, người thực hiện C, trạng thái «Chưa làm», gắn D, người theo dõi gồm A (B đã là người giao nên không thêm), và P có một dòng vết `them-viec-con` mang tiêu đề K; mục «Việc con (0/1)» của khung P liệt kê K; K hiện trên bảng của C ở cột «Chưa làm» với dòng «Thuộc: <tiêu đề P>»; thẻ P trên bảng của B có «0/1 việc con xong»; When thêm hỏng, Then lỗi hiện dưới nút và chữ đã gõ còn nguyên.
- AC-8: Given việc cha P và việc con K của AC-7, When ai đó gọi `viec.taoCon` với cha là K, Then 400 «Việc con không có việc con.»; When người theo dõi W hay thành viên khác X thêm con cho P, Then 403 «Chỉ người giao và người thực hiện được thêm việc con.»; When một người không thấy P (P là việc riêng) gọi, Then 404 cùng lời «Không có việc nào mang mã …»; When chọn người thực hiện mang vai `okr` cho con của P gắn đối tác, Then 400 có tên họ và chữ «chỉ OKR», không hàng hay vết nào được ghi; When P đã Xong hay Huỷ, Then 400 «Chỉ thêm việc con cho việc đang mở.»; When người giao xoá P, Then 409 vì P đã có lịch sử; khung K có dòng «Thuộc việc: <P>» và không có nút «Thêm việc con»; Given P2 là việc riêng (không gắn gì) với người giao A, người thực hiện B, When B thêm con K2 cho C, Then A thấy K2 qua `viec.get` và trong nhóm «Đang theo dõi», còn thành viên X không trong cuộc nhận «Không có việc nào mang mã …» khi đọc K2.
- AC-9 (cross-layer): Given P có ba con K1 (Xong), K2 (Đang làm), K3 (Huỷ), When B mở bảng, Then thẻ P ghi «1/2 việc con xong» (không tính việc Huỷ); When B kéo P sang cột «Xong», Then hộp hỏi lại «Việc này còn 1 việc con chưa xong. Vẫn đánh dấu xong?» hiện; When bấm thôi, Then P ở cột cũ và không có dòng vết mới; When đồng ý, Then P «Xong», K2 vẫn «Đang làm», K1 và K3 không đổi; When B chọn «Chuyển sang… › Đánh dấu xong» trên thẻ P, hay bấm «Xong» trong khung P, lúc còn con mở, Then cùng hộp hỏi lại hiện trước khi có lệnh nào tới máy chủ; When A bấm «Huỷ» trong khung P lúc còn con mở, Then hộp hỏi lại tương tự với chữ «Vẫn huỷ?».
- AC-10: Given kho mẫu sau `bun run db:seed`, When chạy `rang/do-nguong.mjs` với khoảng ngày bao trọn dữ liệu mẫu, Then thước in đúng đáp án đã khai trong `rang/dap-an.json` cho `doiTrangThaiNguoi`, `quaBangKeo`, `quaBangMenu`, `tiLeBangKeo`, `tiLeBang`, `viecCoCon`, `nguoiTaoCon`, không ghi gì vào cơ sở dữ liệu (số hàng mọi bảng việc trước và sau bằng nhau); dữ liệu mẫu có một việc cha gắn thoả thuận mẫu với ba con tạo qua đường ghi thật.
- AC-11 (ui-observed): Given bản chạy thật có dữ liệu mẫu, When chụp Việc của tôi kiểu Bảng ở 1280 và 375, khung việc cha có mục Việc con, khung việc con, menu «Chuyển sang…» đang mở và hộp hỏi lại đóng cha, Then mỗi ảnh khớp bảng trạng thái của design doc (ST-bang-viec-co-viec, ST-bang-viec-menu, ST-bang-viec-hoi-dong-cha, ST-bang-viec-dien-thoai, ST-khung-viec-con, ST-khung-viec-la-con): bốn cột có số, thẻ có hạn và «x/y việc con xong», ở 375 không cuộn ngang trang.
- AC-12 (judgment): Given `CONTEXT.md` và `docs/api.md`, When đọc mục «Việc», Then `CONTEXT.md` có mục «Việc con» (một tầng, mang gắn của cha, người của cha thành người theo dõi, không tự đóng theo cha) và câu «Bảng» trong mục «Việc của tôi»; `docs/api.md` mục «Việc» nêu `viec.bang`, `viec.keo`, `viec.taoCon`, thứ tự riêng từng người không ghi vết, hai nguồn `bang-keo` và `bang-menu`.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Trục: thao tác trên bảng (xem ·
kéo sang cột · sắp trong cột · tách việc con · đóng cha còn con mở · xoá) × người và phạm vi (người giao · thực
hiện · theo dõi · thành viên khác · quản trị · vai «chỉ OKR»; việc gắn đối tác | việc riêng) × bề mặt (chuột
1280 · chạm 375 · bàn phím · lệnh không qua bảng) × đồng thời và lỗi. Thước CE: bảng chuyển trạng thái
`docs/api.md` mục «Việc» và ma trận 100 ô của DA1 [SUY-TỪ-REPO: docs/api.md]; năng lực D1, A3, A9 và kết luận
3–4 của khảo sát [NGÀNH: docs/plan/viec-du-an-nghien-cuu/04-quan-ly-cong-viec.md — Asana, Jira, ClickUp;
06-thi-truong-viet.md — Base, 1Office, MISA AMIS, Getfly, Fastwork]; chuẩn giao diện `web-design-guidelines`
(lối bấm và lối phím cho mọi cử chỉ kéo). Core → AC-1…AC-9; AC-10 là đường đo; AC-11 lớp nhìn thấy;
AC-12 tài liệu. Later và Never ở `coverage-scan.md`.

## Đường đo

Thước `rang/do-nguong.mjs`, chạy chỉ đọc trên khoảng 14 ngày đầu sau gộp. Trường ngưỡng đọc theo Hỏi-4: máy khuyên
`tiLeBangKeo` (chỉ kéo); chủ kho chọn lối khác thì đọc `tiLeBang` (kéo cộng menu) — thước in cả hai.

- Sống ≥40% lần đổi trạng thái do người làm qua bảng: `tiLeBangKeo` (hay `tiLeBang`) ≥ 0,40 · AC-2 và AC-4 bảo đảm lần
  kéo (chuột, phím) ghi `bang-keo` còn lần chọn menu ghi `bang-menu`, AC-3 bảo đảm lần bị từ chối không ghi vết, AC-10
  bảo đảm thước đếm đúng.
- Sống ≥10 việc có việc con do ≥3 người tạo: `viecCoCon` ≥ 10 và `nguoiTaoCon` ≥ 3 · AC-7 bảo đảm mỗi lần thêm con để
  một vết `them-viec-con` có người, AC-10 bảo đảm thước đếm đúng.
- Chết dưới 15% qua bảng: cùng trường `tiLeBangKeo` (hay `tiLeBang`) < 0,15 · cùng AC.
- Chết dưới 3 việc có việc con: `viecCoCon` < 3 · cùng AC.

## Out of scope

- Checklist trong việc (Hỏi-3).
- Kéo thả bảng cột của kế hoạch onboard 30 ngày — chủ kho giữ «không làm» ở Cổng Đáng 13/10.
- Kéo đổi người thực hiện, cột theo trường khác, làn ngang, giới hạn số việc mỗi cột, bắt điền trường khi sang cột.
- Việc con nhiều tầng; đổi cha; gỡ con khỏi cha; tiến độ cha tự tính từ con.
- Bảng cột trong khối «Việc» của thoả thuận, công ty, cá nhân; bảng của Dự án (DA4); thao tác hàng loạt trên bảng.
- Đo ngưỡng trên dữ liệu thật — sau khi gộp, ở Cổng Giá trị.

## Notes

- Vòng đời (ba câu của `docs/vong-doi.md`): việc con là Việc — Xoá khi chưa có lịch sử, còn lại Xong hay Huỷ; «lịch
  sử» là mọi vết ngoài «tạo», và thêm con ghi vết lên cha; sắp thứ tự không ghi vết; bảng hiện việc mở và Xong 7
  ngày, Huỷ ở dòng gập, Xong cũ hơn ở kiểu Danh sách.
- Năm câu chờ chủ kho ở Cổng Phạm vi (Hỏi-1…Hỏi-5, sổ quyết định): thứ tự riêng từng người · cột Xong 7 ngày ·
  checklist ngoài lượt · ngưỡng chỉ đếm kéo hay cả menu · việc con mang gắn và người của cha. AC-7, AC-8, E7, E8
  ghim theo lối máy khuyên ở Hỏi-5; chủ kho chọn lối khác thì sửa đúng các vế đó trước khi duyệt.
