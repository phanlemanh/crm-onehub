---
schema_version: 1
feature: "Tôi giao một việc gắn với deal hay kế hoạch onboard; người nhận thấy nó trong Việc của tôi và được nhắc buổi sáng"
slug: viec-chung
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: signed-off
approved_by: Mạnh
approved_at: 2026-10-13T00:51:25Z
design_doc: docs/superpowers/specs/2026-10-13-viec-chung-design.md
---

# Acceptance Contract: viec-chung

## Context

Hàng DA1 của `docs/plan/lo-trinh-viec-du-an.json`; chủ kho mở ở Cổng Đáng 13/10/2026 (build). Hôm nay việc cần
làm trên dòng thời gian không có người làm, không nhắc ai, và ai cũng đánh dấu xong được. Lượt này thêm một loại
**Việc** riêng: gắn được vào thoả thuận, công ty, cá nhân, kế hoạch 30 ngày; có người giao, một người thực hiện,
người theo dõi; năm trạng thái; hiện ở màn Việc của tôi, khối «Việc» của bản ghi, Tổng quan, tin nhắc buổi sáng.
Hạng T3 vì thêm bảng ở `packages/db/prisma` và sửa `apps/api/src/workspace` (đổi vai). Gộp sau DA0b.

Source input: hàng DA1 · `opportunity.md` (ngưỡng đã chốt) · mục «Việc» của `CONTEXT.md` · khảo sát DA0
`docs/plan/viec-du-an-nghien-cuu.md` · hồ sơ DA0a · design doc.

## Criteria

- AC-1 (cross-layer): Given một thoả thuận D của công ty C, người A và B vai `member`, When A tạo một việc từ ô soạn của dòng thời gian D với người thực hiện B, hạn ngày mai và người theo dõi W, Then có đúng một hàng việc trạng thái «Chưa làm», người giao A, người thực hiện B, người theo dõi W, gắn D, một dòng vết «tạo» của A nguồn `web`; việc hiện trong khối «Việc» của thẻ Hoạt động ở khung D và ở khung C; When A không chọn người thực hiện, Then người thực hiện là A; When tạo hỏng, Then lời lỗi hiện dưới nút và chữ đã gõ còn nguyên.
- AC-2 (cross-layer): Given việc của AC-1, When A gắn thêm kế hoạch 30 ngày P của công ty C, Then vẫn đúng một hàng việc, khối «Việc» của P có nó, khối của C hiện nó đúng một lần, có vết «gắn»; When A gỡ D, Then khối của D không còn nó, khối của C vẫn còn (qua P), có vết «gỡ».
- AC-3: Given một việc gắn thoả thuận D có người giao A, người thực hiện B, người theo dõi W, When từng người A, B, W, một thành viên khác X và một quản trị Q thử từng cặp trong 20 cặp nguồn × đích của đồ thị trạng thái trong design doc, Then đúng những ô hợp lệ và có quyền thành công, mỗi lần để một dòng vết «doi-trang-thai» có trạng thái trước và sau; cặp không hợp lệ trả 400 «Không chuyển được việc từ … sang …» với mọi người; ô không quyền trả 403 với đúng lời ghim của ô đó («Chỉ người giao được …» hay «Chỉ người giao và người thực hiện được …»); trạng thái không đổi khi bị từ chối; `roiChuaLamLuc` chỉ được ghi một lần, khi chính người thực hiện chuyển việc từ Chưa làm sang Đang làm, Chờ đánh giá hay Xong — người giao tự chuyển hay Huỷ không ghi.
- AC-4 (cross-layer): Given việc của AC-3 gắn thoả thuận D, When A đổi người thực hiện sang C, sửa tiêu đề và hạn, thêm người theo dõi; C sửa hạn; W tự bỏ theo dõi; X và Q tự theo dõi, Then mỗi thao tác thành công và để đúng một dòng vết có trước và sau; When B (không còn là người thực hiện) sửa hạn, C đổi người thực hiện, X sửa tiêu đề, W thêm người khác làm người theo dõi, Then trả 403 và việc không đổi; When mở thẻ «Lịch sử» của khung việc, Then mọi dòng vết hiện mới nhất trước với người, việc đã làm, thời điểm và nguồn; khung việc chỉ hiện nút trạng thái người xem được làm, nút Xoá chỉ hiện khi việc chưa có lịch sử.
- AC-5: Given người vai `okr` tên «Người OKR VC» và một thoả thuận, When đặt họ làm người thực hiện lúc tạo hay lúc đổi người, thêm họ làm người theo dõi, hay chuyển việc tới họ, Then mỗi lệnh trả 400 với lời có tên họ và chữ «chỉ OKR», không hàng hay vết nào được ghi; Given việc gắn đối tác mà người thực hiện đã sang vai `okr` sau khi việc khép hay gửi đánh giá, When người giao bấm «Làm lại» hay «Mở lại», Then trả 400 cùng lời, trạng thái không đổi, không vết; When người vai `okr` gọi bất kỳ thủ tục nào của router việc, Then trả FORBIDDEN `KHONG_TRONG_PHAM_VI`; When mở ô chọn người thực hiện, Then họ không có trong danh sách; When quản trị đổi vai một người đang thực hiện hay đang giao việc mở sang `okr`, Then trả 409 nêu số việc và chỉ sang «Chuyển việc», vai không đổi; When người đó chỉ theo dõi việc, Then đổi vai thành công và mọi lượt theo dõi việc của họ bị gỡ.
- AC-6: Given việc G gắn một thoả thuận và việc R không gắn gì, mỗi việc có người giao, người thực hiện, người theo dõi riêng, When người giao, người thực hiện, người theo dõi, một thành viên khác, một quản trị đọc hay ghi từng việc qua `viec.get`, `viec.lichSu`, Việc của tôi, khối việc của bản ghi, Tổng quan phạm vi «mọi người», REST, và tự theo dõi, Then G thấy và tự theo dõi được với mọi người đọc được dữ liệu đối tác, R chỉ ba người trong cuộc thấy; người không thấy R nhận cùng một lời «Không có việc nào mang mã …» như với một mã không tồn tại ở cả lệnh đọc lẫn lệnh ghi, và không có hàng theo dõi mới.
- AC-7 (cross-layer): Given B là người thực hiện của việc quá hạn, việc hạn hôm nay, việc hạn tuần sau, việc không hạn, một việc Xong và một việc Huỷ; B giao một việc cho A và theo dõi một việc của người khác, When B mở Việc của tôi, Then nhóm «Giao cho tôi» liệt kê bốn việc mở theo thứ tự quá hạn, hôm nay, tuần sau, không hạn; cuối danh sách có «Đã xong (1)» và «Đã huỷ (1)» gập; nhóm «Tôi giao» và «Đang theo dõi» mỗi nhóm một việc; số đếm từng nhóm chỉ đếm việc mở; When máy tải chậm, tải hỏng hay không có việc nào, Then màn hiện đúng ST-viec-cua-toi-cho-tai, ST-viec-cua-toi-loi (có «Thử lại»), ST-viec-cua-toi-rong (có «Giao việc») và tiêu đề trang giữ nguyên; When B mở Tổng quan phạm vi «của tôi», Then khối «Việc quá hạn» có việc quá hạn của B cạnh bước và việc cần làm cũ.
- AC-8 (cross-layer): Given người vai `okr` «Người OKR Nhắc» là người thực hiện của một việc quá hạn và một việc sắp hạn gắn thoả thuận, là người giao của một việc chờ đánh giá gắn đối tác (cả ba cài trực tiếp như dữ liệu cũ), và có một việc OKR đến hạn; một người vai `member` ở đúng ba vị trí đó, When nhịp nhắc chạy sau 08:30 giờ VN (`lenLichNhac` rồi `chayNhac`) với Zalo giả và Slack giả theo hợp đồng gửi tin thật, Then bộ gom của người vai `okr` không có loại nhắc việc nào ở cả hai cửa sổ `buoi-sang` và `truc-tiep`, tin gửi tới họ vẫn có việc OKR và không chứa tên thoả thuận hay công ty của ba việc đó, `payload.daGui` không có dòng việc nào; người vai `member` nhận đủ ba dòng việc kèm tên bản ghi gắn; ba loại nhắc việc lọc vai bằng cùng luật đọc-được-dữ-liệu-đối-tác của DA0a.
- AC-9 (cross-layer): Given B thực hiện một việc quá hạn và một việc hạn sau 2 ngày giờ VN, A là người giao của một việc ở «Chờ đánh giá», và cùng các việc đó đã Xong cho một người D, When nhịp nhắc chạy sau 08:30 giờ VN (`lenLichNhac` rồi `chayNhac`) với Zalo giả và Slack giả theo đúng hợp đồng gửi tin thật, Then bộ gom của B có `viec-qua-han` và `viec-sap-han`, của A có `viec-cho-danh-gia`, của D không có dòng việc nào; tin gửi tới B có tiêu đề hai việc và tên bản ghi gắn đầu tiên; một loại việc thiếu nhánh ở bộ dựng tin không làm hỏng tin của người khác trong cùng phút.
- AC-10 (cross-layer): Given tin Zalo đã gửi B ở AC-9, When B trả lời «xong n» với n là dòng việc quá hạn, Then việc đó sang «Xong» qua cùng hàm ghi của màn, có vết nguồn `zalo`, và B nhận lời xác nhận; When A trả «xong n» trên dòng chờ đánh giá, Then việc sang «Xong»; When một người khác người thực hiện trả «xong n» trên dòng của B (tin chuyển tiếp), hay việc đã khép, Then không ghi gì và lời trả nói rõ vì sao.
- AC-11 (cross-layer): Given người A thực hiện hai việc mở và một việc Xong, giao một việc mở cho B, When quản trị mở hộp «Chuyển việc» của A ở màn Thành viên, Then hộp nêu thêm «3 việc» cạnh số kế hoạch và bước, bằng đúng số việc mà lời từ chối đổi vai của A nêu (một hàm đếm cho cả hai chỗ); When chuyển sang C, Then hai việc mở có người thực hiện C, việc A giao có người giao C, việc Xong giữ A, mỗi việc đổi một dòng vết «chuyen-viec», cùng một giao dịch với kế hoạch và bước — một lệnh hỏng giữa chừng thì không gì đổi; When đích mang vai `okr`, Then trả 400 «chỉ OKR» và không gì đổi.
- AC-12 (cross-layer): Given một việc vừa tạo chưa có vết nào ngoài «tạo», When người giao bấm Xoá và xác nhận ở hộp hỏi lại, Then việc mất và có dòng log xoá; When việc đã có một vết khác, Then nút Xoá không hiện và gọi API xoá trả 409; When người giao Huỷ rồi mở lại, Then việc về «Chưa làm» với hai vết; Given một việc gắn công ty C, cá nhân K, kế hoạch P và thoả thuận D, When D, K, P lần lượt bị xoá vĩnh viễn theo đường xoá thật của từng loại, Then việc còn, mỗi lần có một vết «go-do-ban-ghi-xoa» mang tên bản ghi đã mất; When cả C cũng bị xoá vĩnh viễn, Then việc thành việc riêng, chỉ người trong cuộc thấy.
- AC-13 (ui-observed): Given bản chạy thật với dữ liệu mẫu, When mở Việc của tôi ở khổ 1280 và 375, mở một việc, đổi trạng thái, và giao một việc từ ô soạn của khung thoả thuận, Then thấy ba chip nhóm có số, dòng quá hạn có chấm đỏ, khung việc có thẻ «Lịch sử», việc vừa giao hiện ở khối «Việc» đầu thẻ Hoạt động; ở 375 không có thanh cuộn ngang, danh sách là các thẻ dòng.
- AC-14: Given kho mẫu có đáp án biết trước — việc giao cho người khác được người thực hiện chuyển đúng hạn, đúng ngày hạn lúc 23:00, trễ hạn, chưa chuyển; việc người giao tự bấm «Bắt đầu»; việc người giao Huỷ trước khi người thực hiện chuyển; việc tự giao; việc không hạn; việc tạo ngoài cửa sổ; một việc gắn đối tác đang mở có người theo dõi vai `okr` cài trực tiếp, When chạy thước `rang/do-nguong.mjs --tu --den` trên kho đó, Then JSON in đúng tổng, số đúng hạn, tỉ lệ và `viecDoiTacTaiVaiChiOkr = 1`, thoát 2 khi số đó khác 0; thước chạy trong giao dịch chỉ đọc; When `bun run db:seed` chạy, Then việc mẫu được gieo qua hàm ghi thật và lệnh từ chối chạy trên production.
- AC-15 (judgment): Given `CONTEXT.md`, `docs/api.md`, `docs/agent.md` sau vòng này, When người mới đọc, Then biết: Việc là gì và nghĩa đã chốt (năm trạng thái, ba vai người, gắn nhiều bản ghi, không nhân bản); ai đổi được trạng thái; luật xem P3 của lượt này; vai «chỉ OKR» chưa dùng Việc; Việc vào nhắc buổi sáng và «xong n»; «Chuyển việc» chuyển cả Việc; ba câu vòng đời.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Trục: vòng đời việc (tạo · sửa ·
đổi người · gắn/gỡ · đổi trạng thái · dọn · chuyển giao) × người và phạm vi việc (người giao · thực hiện · theo
dõi · thành viên khác · quản trị · vai «chỉ OKR» · người rời; việc gắn đối tác | việc riêng) × nơi việc vào và
hiện ra (ô soạn dòng thời gian · Việc của tôi · API · khung việc · khối việc · Tổng quan · tin nhắc · «xong n» ·
Chuyển việc) × thời gian (hạn · nhắc · lịch sử · cửa sổ đo). Thước CE: bảng quyền và bảng trạng thái của design
doc; bản đồ màn `docs/plan/viec-du-an-nghien-cuu/01-ma-kho-onehub.md` mục 4 [SUY-TỪ-REPO:
docs/plan/viec-du-an-nghien-cuu/01-ma-kho-onehub.md]; mẫu ngành Odoo, Salesforce, Asana, Bitrix24, 1Office, Base
[NGÀNH: docs/plan/viec-du-an-nghien-cuu.md mục 3]. Core → AC-1…AC-13 (AC-8 tách riêng vế nhắc của vai «chỉ OKR» theo đề nghị của Mac Studio ở #375); AC-14 là đường đo; AC-15 tài liệu.
Tác nhân và việc cần làm cũ: hàng DA1b (Hỏi-4, sổ quyết định).

## Đường đo

- ≥80% việc giao cho người khác được người thực hiện chuyển khỏi «Chưa làm» trước hoặc trong ngày hạn (14 ngày
  đầu sau gộp): số từ `rang/do-nguong.mjs` chạy chỉ đọc trên production — `viecGiaoNguoiKhac.tiLe` · AC-3 bảo
  đảm cột `roiChuaLamLuc` được ghi đúng, AC-14 bảo đảm thước đếm đúng.
- 0 việc gắn đối tác tới người vai «chỉ OKR»: cùng thước, `viecDoiTacTaiVaiChiOkr` · AC-5 bảo đảm không sinh
  thêm, AC-8 bảo đảm tên đối tác không đi qua tin nhắc dù dữ liệu cũ có, AC-14 bảo đảm thước đếm được ca cài trực tiếp.

## Out of scope

- Chép việc cần làm cũ sang Việc, đổi hai đường Tác nhân còn ghi việc cần làm, bỏ «Việc cần làm» khỏi dòng thời gian — hàng DA1b (Hỏi-4).
- Việc gắn KR (DA5); việc con và Kanban (DA2); việc sinh từ khuôn kế hoạch (DA3); dự án và Gantt (DA4); trưởng phòng thấy việc cấp dưới (DA7); AI đề xuất việc (DA8).
- Việc cho người vai «chỉ OKR», kể cả việc riêng không gắn gì (Hỏi-3; mở cùng DA5).
- Trạng thái tự đặt trong năm nhóm; bình luận và đính kèm; nhắc cho người theo dõi; thao tác hàng loạt; tìm việc ở ô tìm kiếm chung; đẩy việc ra lịch.
- Đo ngưỡng trên dữ liệu thật — sau khi gộp, ở Cổng Giá trị.

## Notes

- Ba câu vòng đời (`docs/vong-doi.md`): Xoá khi chưa có lịch sử, còn lại khép bằng Xong hay Huỷ và mở lại được;
  «lịch sử» là mọi dòng vết ngoài «tạo»; danh sách mặc định chỉ việc đang mở, Xong và Huỷ ở dòng gập cuối.
- Câu chỉ người có (Hỏi-1…Hỏi-5) nằm ở sổ quyết định; hợp đồng này soạn theo khuyến nghị của máy.
- Cách thước đọc ngưỡng (Hỏi-5, khuyến nghị): vế an toàn đếm việc đang mở; việc người giao Huỷ trước khi người
  thực hiện chuyển không vào mẫu số; chỉ lượt chuyển của chính người thực hiện mới tính.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-13:
  - Ngoài-3: Phép kiểm giao diện chứng minh được bộ quét giá trị tự đặt bắt lỗi bán kính, nhưng chưa chứng minh công cụ kiểu dáng chuẩn của kit còn bắt được lỗi, và chưa có ca màu hay kiểu tại chỗ.
  - Ngoài-4: Danh sách «Đã xong» giữ 50 việc mới nhất, nhưng bài kiểm chưa tách được «mới nhất theo lúc đóng» với «mới nhất theo lúc tạo».
  - Ngoài-5: Bài kiểm khung việc dùng bảng quyền chép tay khớp máy chủ hôm nay; máy chủ đổi luật chuyển trạng thái thì bài kiểm màn vẫn xanh.
  - Ngoài-7: Sau «Chuyển việc 30 ngày», màn Việc của tôi, khối Việc và Tổng quan của người nhận còn hiện số cũ khoảng nửa phút; tải lại là đúng. Hạt giống: `docs/plan/2026-10-13-hat-giong-chuyen-viec-lam-moi-viec.md`.
  - Ngoài-11: Cùng gốc Ngoài-7 — chuyển việc ở màn Thành viên không làm mới bộ nhớ của Việc và Tổng quan.
  - Ngoài-14: Năm ô của ma trận 70 ô quyền xem (khối của bản ghi × việc riêng) không thể đỏ; quyền xem thật đã được 65 ô còn lại và cặp đột biến (e) đo.
