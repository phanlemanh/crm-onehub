---
schema_version: 1
feature: "Tôi gom việc của một đợt triển khai vào một dự án và xem trên sơ đồ Gantt có phụ thuộc và mốc"
slug: du-an-gantt
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: implemented
approved_by: manh
approved_at: 2026-10-16T11:20:49Z
design_doc: docs/superpowers/specs/2026-10-16-du-an-gantt-design.md
---

# Acceptance Contract: du-an-gantt

## Context

Hàng DA4 của `docs/plan/lo-trinh-viec-du-an.json`; chủ kho ký Cổng Đáng 16/10/2026 (build · ngưỡng giữ đề xuất ·
ngày nghỉ T7+CN, quản trị thêm ngày lễ). Sau DA1–DA3, việc gắn được bản ghi, xem được Danh sách và Bảng, nhưng không
có chỗ gom việc của một đợt triển khai, việc chỉ có hạn, và «B chỉ bắt đầu khi A xong» chỉ nằm trong đầu người cầm.
Lượt này thêm **Dự án** chứa Việc chung, **ngày bắt đầu**, **phụ thuộc xong-rồi-mới-bắt-đầu** có **tự dời** theo
**lịch làm việc** chung, **mốc**, và kiểu xem **Gantt**. Hạng T3 vì thêm bảng ở `packages/db/prisma`.

Source input: hàng DA4 · `opportunity.md` (ngưỡng đã chốt) · mục «Việc», «Việc con», «Dự án», «Phạm vi dữ liệu» của
`CONTEXT.md` · `docs/api.md` mục «Việc» · `docs/vong-doi.md` · `docs/settings.md` · hồ sơ DA1–DA3 · khảo sát
`docs/plan/viec-du-an-nghien-cuu/` · design doc.

Quy ước ngày trong các tiêu chí: lịch mặc định nghỉ Thứ Bảy và Chủ nhật; «ngày lễ L» là Thứ Hai 26/10/2026 do quản
trị thêm; «hôm nay» trong bài kiểm được tiêm là Thứ Sáu 16/10/2026.

## Criteria

- AC-1: Given thành viên M (vai `member`) có việc V1 trong dự án «Triển khai Ngân hàng A» và việc V2 gắn một thoả thuận, hai dự án đang mở và một dự án đã đóng, When M bấm «Việc» trên thanh trái không kèm tham số, Then màn giữ y như Việc của tôi của DA1–DA2 (phạm vi «Của tôi», ba nhóm, kiểu Danh sách) và thanh trái không có mục «Dự án» riêng; When M mở ô «Phạm vi», Then ô liệt kê «Của tôi», «Tất cả dự án», hai dự án đang mở, dòng gập «Đã đóng (1)» và «Tạo dự án…»; When M chọn «Tất cả dự án», Then đường dẫn mang `phamVi=tat-ca-du-an`, kiểu xem chỉ có Danh sách và Bảng, và bảng hai dự án đang mở có tên, «x/y việc xong», khoảng ngày sớm nhất – muộn nhất, mốc kế, người tạo; When M chọn «Tạo dự án…», gõ tên «Triển khai Ngân hàng B», bấm «Tạo», Then M sang phạm vi dự án mới ở kiểu Gantt rỗng (`phamVi=<id>`, `xemViec=gantt`), và đọc lại từ cơ sở dữ liệu có đúng một `DuAn` với `taoBoiId` = M và một dòng `DuAnVet` `tao`; When tên trống hay dài quá 120 ký tự, Then lỗi hiện dưới ô và không hàng nào được ghi; When tải lại trang, Then phạm vi và kiểu xem giữ nguyên; When máy tải chậm, tải hỏng hay chưa có dự án nào ở phạm vi «Tất cả dự án», Then màn hiện ST-du-an-ds-cho-tai, ST-du-an-ds-loi (có «Thử lại»), ST-du-an-ds-rong và tiêu đề trang «Việc» giữ nguyên; When màn rộng 375, Then bảng dự án là các thẻ `Item` và trang không cuộn ngang.
- AC-2 (cross-layer): Given dự án P của M, When M bấm «Thêm việc» trên trang P, gõ tiêu đề, chọn người thực hiện B, Then đọc lại có một việc mới với `duAnId` = P, người giao M, và một dòng `DuAnVet` `them-viec`; Given việc riêng V (không gắn gì) của người giao A, When A chọn «Dự án: P» trong khung V, Then khung nói trước «Mọi người xem được dự án sẽ thấy việc này», V có `duAnId` = P với một vết `doi-du-an` trước rỗng sau P, và thành viên X không trong cuộc nay đọc được V qua `viec.get`; When A thêm việc con K cho V, Then K mang `duAnId` = P; When A bỏ V khỏi P, Then V còn nguyên trạng thái và ngày, phụ thuộc của V bị gỡ với vết trên cả hai đầu, việc chờ mốc của V bị gỡ, P có vết `bot-viec`; When ai đó chọn người thực hiện mang vai `okr` cho một việc trong dự án, Then 400 có tên họ và chữ «chỉ OKR», không hàng hay vết nào được ghi; When người thực hiện của V xem phạm vi «Của tôi» (Danh sách và Bảng), Then dòng và thẻ của V có dòng phụ «Dự án: P» bấm sang phạm vi P, còn việc không thuộc dự án không có dòng đó.
- AC-3 (cross-layer): Given việc V của người giao A, người thực hiện B, hạn 23/10, When B đặt «Bắt đầu» 20/10 trong khung V, Then đọc lại `batDauNgay` là 20/10 lúc 00:00Z, một dòng vết `doi-bat-dau` của B có trước rỗng sau 2026-10-20, nguồn `web`, và hạn không đổi; When B đặt Bắt đầu 24/10 (sau hạn), Then 400 «Ngày bắt đầu phải trước hay trùng hạn.» và không vết nào được ghi; When người theo dõi W hay thành viên X đổi Bắt đầu, Then 403 với lời như `viec.sua` của DA1; Given V gắn một bước kế hoạch 30 ngày, When B đổi Bắt đầu, Then hạn của bước không đổi và bước không mang ngày bắt đầu nào.
- AC-4: Given dự án P có việc cha C với hai việc con, ba việc có đủ hai ngày, một việc thiếu ngày, hai phụ thuộc, một mốc, một việc Xong, và ngày lễ L, When M chọn P trong ô Phạm vi, Then kiểu xem Gantt hiện (đường dẫn mang `phamVi=<P>` và `xemViec=gantt`), hàng «Mốc» đầu cây có hình thoi mang tên mốc, việc con thụt dưới C, mỗi việc có ngày là một thanh từ ngày bắt đầu tới hết ngày hạn với màu theo nghĩa trạng thái, hai mũi tên nối đúng cặp, cột Thứ Bảy, Chủ nhật và ngày L tô nền ngày nghỉ, vạch hôm nay ở 16/10, và việc thiếu ngày nằm ở nhóm «Chưa có lịch (1)» với nút «Đặt ngày»; When M chọn kiểu Danh sách hay Bảng, Then hiện đúng việc của P (đường dẫn mang `xemViec=danh-sach` hay `xemViec=bang`) (Danh sách có cột Bắt đầu; Bảng là bốn cột của DA2 chỉ chứa việc của P); When M về phạm vi «Của tôi» hay «Tất cả dự án», Then mục Gantt không có trong kiểu xem, và đường dẫn mang `xemViec=gantt` với phạm vi đó thì hiện Danh sách; When máy tải chậm, tải hỏng hay P chưa có việc, Then màn hiện ST-gantt-cho-tai, ST-gantt-loi (có «Thử lại»), ST-gantt-rong và tiêu đề trang «Việc» cùng dải dự án giữ nguyên.
- AC-5 (cross-layer): Given việc V (Bắt đầu 19/10, hạn 21/10) mà B là người thực hiện, không việc nào chờ V, When B kéo thân thanh V sang phải hai ngày trên Gantt ở 1280, Then đọc lại V có Bắt đầu 21/10, hạn 23/10, đúng một vết `doi-bat-dau` và một vết `doi-han` nguồn `gantt` của B, thanh nằm ở chỗ mới; When B kéo mép phải V thêm một ngày, Then chỉ hạn đổi (một vết `doi-han`); When B dùng phím trên thanh (Tab tới thanh, mũi tên phải, Enter), Then V dời một ngày với vết nguồn `gantt`; When thành viên X không trong cuộc xem cùng Gantt, Then thanh V không kéo được và không nhận phím; When máy chủ từ chối lần thả, Then thanh về chỗ cũ, toast đọc nguyên lời máy chủ, không vết nào được ghi; When màn rộng 375, Then trang không cuộn ngang, Gantt cuộn ngang trong khung của nó, và «Đặt ngày» trong khung việc đổi được ngày.
- AC-6 (cross-layer): Given việc A (Bắt đầu 19/10, hạn 21/10) và B (Bắt đầu 22/10, hạn 23/10) cùng dự án P, người thực hiện của B là Q, When Q mở khung B, bấm «Thêm việc phải chờ», chọn A, Then đọc lại có một `ViecPhuThuoc` (A → B), một vết `them-phu-thuoc` trên B, Gantt vẽ mũi tên A → B, và mục «Phải chờ (1)» của khung B liệt kê A; When Q gỡ phụ thuộc, Then hàng mất và B có vết `go-phu-thuoc`; When ai đó tạo B → A lúc A → B còn, Then 400 «Phụ thuộc này tạo vòng: «B» → «A» → «B».»; When A và B khác dự án, B tự chờ B, cặp đã có, hay một đầu thiếu ngày, Then lần lượt 400 «Hai việc phải cùng một dự án.», «Một việc không chờ chính nó.», «Hai việc này đã có phụ thuộc.», «Đặt ngày bắt đầu và hạn cho cả hai việc trước.»; When người theo dõi hay thành viên khác của B tạo phụ thuộc vào B, Then 403 «Chỉ người giao và người thực hiện của «B» được đặt việc phải chờ.»; mọi ca bị từ chối không ghi hàng hay vết nào.
- AC-7 (cross-layer): Given lịch nghỉ Thứ Bảy, Chủ nhật và ngày lễ L, chuỗi A (Bắt đầu Thứ Hai 19/10, hạn Thứ Tư 21/10) → B (Bắt đầu Thứ Năm 22/10, hạn Thứ Sáu 23/10, hai ngày làm việc) → C (Bắt đầu Thứ Ba 27/10, hạn Thứ Tư 28/10), và D (Bắt đầu Thứ Ba 10/11) chờ A, When người thực hiện A kéo hạn A sang Thứ Sáu 23/10, Then trong cùng giao dịch B dời sang Bắt đầu Thứ Ba 27/10 hạn Thứ Tư 28/10 (bỏ Thứ Bảy, Chủ nhật và ngày L, giữ hai ngày làm việc), C dời sang Bắt đầu Thứ Năm 29/10 hạn Thứ Sáu 30/10, D không dời vì đã bắt đầu sau; B và C mỗi việc có đúng một vết `doi-bat-dau` và một vết `doi-han` nguồn `tu-doi` mang `boi` là việc trước gây dời và người là người kéo A; màn báo «Đã dời 2 việc»; When người kéo A không sửa được B (B do Q thực hiện, Hỏi-7), Then B vẫn dời và vết `tu-doi` ghi người kéo A; When (hạn A còn 23/10) Q đặt Bắt đầu của B là 26/10, sớm hơn ngày làm việc kế sau hạn A, Then 400 «Việc này phải bắt đầu sau khi «A» xong (hạn 23/10).»; When (hạn A còn 23/10) tạo phụ thuộc A → E mà E đang bắt đầu 22/10, Then E dời ngay sang 27/10 theo cùng luật; When người thực hiện A kéo hạn A sớm lên 20/10, Then không việc sau nào lùi; When B đã Xong, Then B không dời và C tính theo hạn của B như cũ; When hai người cùng lúc đổi hạn A và hạn B, Then cả hai lần trả lời trong 5 giây và ở kết quả cuối mọi việc sau bắt đầu từ ngày làm việc kế sau hạn việc trước; và các hàm ngày làm việc (`laNgayLam`, `ngayLamKe`, `congNgayLam`, `soNgayLam`) đúng ở ma trận viết trước gồm ngày thường, Thứ Bảy, Chủ nhật, ngày lễ, chuỗi ngày nghỉ liền nhau, qua tháng và qua năm.
- AC-8 (cross-layer): Given dự án P, When M bấm «Thêm mốc», gõ «Go-live», chọn ngày Thứ Sáu 30/10 và việc phải xong trước B (hạn 28/10), Then đọc lại có `DuAnMoc` «Go-live» 30/10 với một `DuAnMocCho` (B), P có vết `them-moc`, và Gantt vẽ hình thoi «Go-live» ở 30/10 không tô trễ; When hạn B dời sang Thứ Hai 02/11 (tay hay tự dời), Then mốc giữ ngày 30/10, `duAn.lich` trả mốc với `tre` = true kèm tên B, Gantt tô mốc màu lỗi và danh sách dự án ghi mốc kế «Go-live · trễ»; When B dời về 29/10, Then mốc hết trễ; When M xoá mốc, Then mốc và việc chờ mốc mất, B không đổi, P có vết `xoa-moc`.
- AC-9: Given chủ hay quản trị Q và thành viên M, When Q mở Cài đặt › «Lịch làm việc», Then trang có thẻ «Ngày nghỉ trong tuần» (Thứ Bảy, Chủ nhật đang bật) và thẻ «Ngày lễ»; When Q bật thêm Thứ Tư rồi bấm «Hoàn tác» trên toast, Then lịch về Thứ Bảy, Chủ nhật; When Q thêm ngày lễ 26/10 «Nghỉ bù» rồi xoá nó, Then danh sách cập nhật và toast xoá có «Hoàn tác»; When M mở cùng trang, Then mọi điều khiển khoá và có một dòng «Không đủ quyền» dưới tiêu đề, và `lichLamViec.themNgayLe` của M trả 403; When Q thêm ngày lễ khi một dự án đã có việc vắt qua ngày đó, Then không việc nào đổi ngày, Gantt tô ngày đó là ngày nghỉ, và lần tự dời kế tiếp bỏ qua ngày đó; When ngày lễ trùng ngày đã có, Then 400 «Ngày này đã là ngày lễ.»
- AC-10: Given người tạo dự án T, người giao A và người thực hiện B của một việc trong dự án, người theo dõi W, thành viên khác X, quản trị Q và người vai `okr` O, When từng người gọi từng lệnh ghi của dự án (`duAn.sua`, `duAn.dong`, `duAn.moLai`, `duAn.xoa`, `duAn.moc.tao`, `duAn.phuThuoc.tao`, `viec.doiLich`, `viec.doiDuAn`, `viec.create` trong dự án), Then kết quả mỗi ô trùng đáp án viết sẵn theo mục «Quyền» của design doc — thành công, 403 với lời ghim, hay 403 của phạm vi với O ở mọi ô; O không đọc được `duAn.list`, `duAn.lich`; ô bị từ chối không ghi hàng hay vết nào.
- AC-11 (cross-layer): Given dự án P của T có ba việc, một đang mở, When T chọn «Đóng dự án», Then hộp hỏi lại «Dự án còn 1 việc chưa xong. Vẫn đóng?» hiện trước khi có lệnh nào tới máy chủ; When thôi, Then P vẫn mở; When đồng ý, Then P có `dongLuc`, vết `dong`, ba việc giữ nguyên trạng thái, P rời danh sách dự án đang mở (ô Phạm vi và phạm vi «Tất cả dự án») và vào «Đã đóng (n)», phạm vi P hiện «Dự án đã đóng», thanh không kéo được, không nút thêm việc hay mốc, và mọi lệnh thêm việc, mốc, phụ thuộc vào P trả 400 «Dự án đã đóng.»; When T chọn «Mở lại», Then P mở lại với vết `mo-lai`; Given dự án R chưa có lịch sử, When T xoá R, Then R mất; When T xoá P (đã có lịch sử), Then 409 và nút Xoá không có trên menu của P; When một việc chưa có lịch sử trong P bị xoá theo luật DA1, Then phụ thuộc và việc chờ mốc của nó mất theo.
- AC-12: Given kho mẫu sau `bun run db:seed`, When chạy `rang/do-nguong.mjs` với khoảng ngày bao trọn dữ liệu mẫu, Then thước in đúng đáp án đã khai trong `rang/dap-an.json` cho `duAnDat`, `duAnDatDu`, `nguoiTaoDat`, `duAnCoPhuThuoc`, không ghi gì vào cơ sở dữ liệu (số hàng mọi bảng dự án và việc trước và sau bằng nhau); dữ liệu mẫu có một dự án sáu việc, ba phụ thuộc, một mốc, một ngày lễ, tạo qua đường ghi thật.
- AC-13 (ui-observed): Given bản chạy thật có dữ liệu mẫu, When chụp phạm vi «Của tôi» có dòng «Dự án: …», ô Phạm vi đang mở, phạm vi «Tất cả dự án», Gantt của dự án mẫu, Gantt có mốc trễ, Gantt sau một lần tự dời, khung việc có mục Phải chờ, hộp hỏi lại đóng dự án và trang Lịch làm việc, ở 1280 và Gantt, danh sách ở 375, Then mỗi ảnh khớp bảng trạng thái của design doc (ST-viec-cua-toi-du-an, ST-pham-vi-mo, ST-du-an-ds-co, ST-gantt-co-lich, ST-gantt-chua-lich, ST-gantt-moc-tre, ST-gantt-da-doi, ST-khung-viec-lich, ST-du-an-hoi-dong, ST-lich-lam-viec, ST-gantt-dien-thoai): thanh có màu trạng thái, mũi tên nối đúng cặp, cột ngày nghỉ tô nền, ở 375 không cuộn ngang trang.
- AC-14 (judgment): Given `CONTEXT.md` và `docs/api.md`, When đọc, Then `CONTEXT.md` mục «Dự án» chốt nghĩa (chỗ chứa, một việc nhiều nhất một dự án, ai thấy, Đóng · Mở lại, xem trong màn Việc ở phạm vi một dự án) và mục «Việc của tôi» thành phạm vi «Của tôi» của màn Việc (ô Phạm vi: Của tôi · Tất cả dự án · một dự án; Gantt chỉ ở phạm vi dự án) và có mục «Mốc (dự án)», «Phụ thuộc (việc)», «Lịch làm việc» (thứ nghỉ trong tuần, ngày lễ, tự dời bỏ ngày nghỉ, đổi lịch không dời việc đã có); `docs/api.md` mục «Việc» có phần «Dự án» nêu các thủ tục `duAn.*`, `viec.doiLich`, `viec.doiDuAn`, luật dời khi chồng, nguồn `gantt` và `tu-doi`, và `lichLamViec.*`.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Trục: thao tác trên dự án (tạo và sửa ·
gom việc · đặt ngày · kéo thanh · phụ thuộc · tự dời · mốc · đóng, mở lại, xoá) × người và phạm vi (người tạo dự án
· người giao · thực hiện · thành viên khác · quản trị · vai «chỉ OKR») × lịch (ngày thường · Thứ Bảy, Chủ nhật ·
ngày lễ · lịch đổi sau khi xếp · qua tháng, qua năm) × bề mặt và lỗi (chuột 1280 · phím · 375 · khung việc · máy
chủ từ chối · tải hỏng · hai người cùng dời). Thước CE: câu giao và `vi_sao` của hàng DA4; mẫu «Gantt mức đủ» của
khảo sát [NGÀNH: docs/plan/viec-du-an-nghien-cuu/04-quan-ly-cong-viec.md — Asana, monday, Notion dời theo phụ
thuộc; Smartsheet, Notion lịch làm việc]; ba câu của `docs/vong-doi.md` [SUY-TỪ-REPO: docs/vong-doi.md]; luật sửa
việc và bảng quyền [SUY-TỪ-REPO: packages/db/src/viec-ghi.ts]; chuẩn giao diện `web-design-guidelines`. Core →
AC-1…AC-11; AC-12 đường đo; AC-13 lớp nhìn thấy; AC-14 tài liệu. Later và Never ở `coverage-scan.md`.

## Đường đo

Thước `rang/do-nguong.mjs`, chạy chỉ đọc trên khoảng 14 ngày đầu sau gộp.

- Sống ≥3 dự án mỗi dự án ≥5 việc có đủ hai ngày: `duAnDat` ≥ 3 · AC-2 bảo đảm việc mang `duAnId`, AC-3 và AC-5 bảo
  đảm hai ngày được ghi, AC-12 bảo đảm thước đếm đúng.
- Sống ≥2 trong số đó có phụ thuộc và mốc: `duAnDatDu` ≥ 2 · AC-6 bảo đảm phụ thuộc là hàng `ViecPhuThuoc`, AC-8 bảo
  đảm mốc là hàng `DuAnMoc`, AC-12.
- Sống do ≥2 người tạo: `nguoiTaoDat` ≥ 2 · AC-1 bảo đảm `taoBoiId`, AC-12.
- Chết dưới 2 dự án đạt, hoặc không dự án nào có phụ thuộc: `duAnDat` < 2 hay `duAnCoPhuThuoc` = 0 · cùng AC.

## Out of scope

- Gantt nâng cao (DA6): độ trễ, đường găng, baseline, tải từng người; ba kiểu phụ thuộc khác xong-rồi-mới-bắt-đầu.
- Dời «giữ khoảng cách» và «không dời» (Hỏi-1).
- Báo người thực hiện khi việc của họ bị tự dời — lượt này chỉ có lịch sử việc.
- Dự án gắn công ty đối tác; khuôn dự án; nhân bản dự án; một việc trong nhiều dự án.
- Ngày bắt đầu trong khuôn và trên màn kế hoạch 30 ngày.
- Nạp sẵn lịch lễ Việt Nam; lịch riêng từng người.
- Kéo nối phụ thuộc trên Gantt; kéo mốc; kéo thanh tự bám ngày làm việc.
- Gantt ở phạm vi «Của tôi» hay «Tất cả dự án»; lọc «Của tôi» theo dự án.
- Đếm dự án trong `install_daily`.
- Đo ngưỡng trên dữ liệu thật — sau khi gộp, ở Cổng Giá trị.

## Notes

- Vòng đời (ba câu của `docs/vong-doi.md`): dự án chưa có lịch sử thì Xoá; có lịch sử thì Đóng · Mở lại; lịch sử là
  mọi dòng `DuAnVet` ngoài `tao`; danh sách mặc định là dự án đang mở, «Đã đóng (n)» gập. Đóng không đổi việc nào
  (`da_bac` x4).
- Bảy câu chờ chủ kho ở Cổng Phạm vi (Hỏi-1…Hỏi-7, sổ quyết định): một chế độ dời · ai đóng và xoá dự án · mốc trễ
  giữ ngày · việc trong dự án thấy được với mọi người đọc phạm vi đối tác · chặn đặt ngày sớm hơn việc phải chờ ·
  kéo không bám ngày làm việc · tự dời chạy thay người không sửa được việc sau. AC-2, AC-5, AC-7, AC-8, AC-10, AC-11
  ghim theo lối máy khuyên; chủ kho chọn lối khác thì sửa đúng các vế đó trước khi duyệt.
- Một nơi «Việc» với ô Phạm vi thay cho mục «Dự án» riêng: chủ kho chọn B ở Cổng Phạm vi 16/10 (sổ dòng 23).
- Cỡ: 14 tiêu chí, trên mức 12 của luật cỡ — chủ kho giữ cỡ ở Cổng Phạm vi 16/10: «14 tiêu chí cùng một câu giao
  Gantt mức đủ».
- Nền hạ tầng đỏ chấp nhận có tên ở Cổng Phạm vi 16/10: lưới trước gộp tự hết khi hồ sơ arm; engine lệch bản kit
  vendored là việc của kit.
