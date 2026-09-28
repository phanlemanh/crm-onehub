---
schema_version: 1
feature: Việc, sáng kiến, ghi nhận và mẫu nằm cạnh KR — việc tự gõ và sáng kiến (chiến dịch hay kế hoạch 30 ngày có sẵn) gắn vào KR, bằng chứng cho KR mốc, ghi nhận đồng nghiệp trên mục tiêu, mẫu OKR theo cấp và đơn vị (lượt 8a — SK-01, SK-02, CI-05, CI-06, MT-07)
slug: canh-kr-okr
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: verified
approved_by: Manh Phan
approved_at: 2026-09-28T07:58:30Z
design_doc: docs/superpowers/specs/2026-09-28-canh-kr-okr-design.md
---

# Acceptance Contract: canh-kr-okr

## Context

Lượt 3–7 phủ trọn vòng một con số KR. Lượt này thêm thứ nằm cạnh con số: việc đơn vị
đang làm và sáng kiến có sẵn trong CRM (chiến dịch, kế hoạch 30 ngày) gắn vào KR; bằng
chứng khi KR mốc xong; lời ghi nhận đồng nghiệp gửi nhau trên mục tiêu, báo tới người
nhận; và mẫu OKR quản trị soạn cho từng nhóm đơn vị. Sáu bảng mới ở cuối
`schema.prisma`, không cột mới trên bảng có sẵn. Không công tắc: người dùng thấy ngay
khi gộp; dựng và đo trên bộ OKR mẫu của hạng mục M.

Source input: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 8» và «Dựng hết bằng dữ liệu
mẫu», mục 8, dòng 8 mục 10 · `_acceptance/canh-kr-okr/opportunity.md` (bảng chia mã
8a / 8b / 8c) · `CONTEXT.md` (Kết quả then chốt, Trao đổi, Phạm vi dữ liệu, Vai «chỉ
OKR») · `_acceptance/bo-okr-mau/contract.md` · bản mẫu `/proto/canh-kr-okr`
(`design-pass.md`) · prompt phiên lượt 8a ngày 2026-09-28.

## Criteria

- AC-1: Given một KR của mục tiêu đã công bố ở chu kỳ đang chạy, When người sửa được KR thêm một việc (tiêu đề, người làm là thành viên còn trong không gian làm việc, hạn tuỳ chọn), sửa tiêu đề và hạn, đánh dấu xong rồi chưa xong, và gỡ nó, Then sau mỗi bước đọc lại từ bảng đúng giá trị vừa ghi (xong có `xongLuc`, chưa xong thì trống), mỗi bước đúng một dòng vết với hành động đúng tên; And người làm việc đó — dù không sửa được KR — đánh dấu xong được việc của chính mình nhưng không sửa hay gỡ được; thành viên khác và người vai «chỉ OKR» không phụ trách thì mọi ghi bị từ chối và bảng không đổi.
- AC-2: Given người vai thành viên sửa được KR, When gắn một chiến dịch và một kế hoạch 30 ngày đang có vào KR, Then hàng sáng kiến chỉ lưu mã bản ghi gốc, không chép tên; đọc lại trả tên và trạng thái đọc sống từ bản ghi gốc (đổi tên chiến dịch thì sáng kiến đổi theo); gắn cùng bản ghi lần hai vào cùng KR, gắn mã không tồn tại, và người vai «chỉ OKR» gắn đều bị từ chối; And bản ghi gốc lưu trữ thì sáng kiến đọc «đã lưu trữ», bản ghi gốc bị xoá hẳn thì việc xoá hẳn không bị chặn và sáng kiến đọc «đã xoá».
- AC-3: Given một KR có sáng kiến gắn một chiến dịch và một kế hoạch 30 ngày, When người vai «chỉ OKR» đọc KR đó qua tRPC, qua cầu REST, bằng khoá API của chính họ, và đọc vết của mục tiêu (tab «Vết»), Then không phản hồi nào chứa tên, mã, trạng thái hay người phụ trách của bản ghi gốc — mỗi sáng kiến và mỗi dòng vết gắn sáng kiến chỉ còn loại và cờ không có quyền; vết gắn sáng kiến trong bảng chỉ lưu loại và mã, không tên; And đối chứng: người vai thành viên đọc cùng KR và cùng vết qua cùng bốn đường thấy tên và trạng thái. (cross-layer)
- AC-4: Given một KR kiểu mốc, When người sửa được KR đính một đường dẫn http hay https kèm ghi chú (từ hộp thoại cập nhật tuần khi chọn «Xong», hoặc từ khung KR) rồi gỡ một bằng chứng, Then đọc lại có đường dẫn, ghi chú, người đính, lúc đính; mỗi lần đính hay gỡ một dòng vết; đính từ hộp thoại cập nhật tuần ghi bằng chứng trong cùng giao dịch với lần cập nhật, đường dẫn sai thì cả lần gửi bị từ chối và KR không đổi; And đường dẫn không phải http hay https (`javascript:`, `data:`, trống, quá 2000 ký tự), KR không phải kiểu mốc, và người không sửa được KR đều bị từ chối, bảng không đổi; đánh dấu mốc xong không cần bằng chứng.
- AC-5: Given một mục tiêu đã công bố, When một thành viên — kể cả người vai «chỉ OKR» — gửi ghi nhận cho một đến năm thành viên còn trong không gian làm việc, lời 1–500 ký tự, tuỳ gắn một KR của mục tiêu đó, Then đọc lại từ bảng đúng người gửi, người nhận, KR, lời; tab Trao đổi trả ghi nhận xen giữa bình luận theo thời gian; một dòng vết; And tự ghi nhận chính mình, người đã rời, quá năm người, KR của mục tiêu khác, và mục tiêu nháp đều bị từ chối; người gửi hoặc quản trị gỡ được, người khác thì không.
- AC-6: Given một ghi nhận vừa gửi cho hai người, When cửa sổ việc OKR của người nhận được tính (`viecCuaToi` và tin nhắc buổi sáng kế), Then mỗi người nhận có đúng một mục loại ghi nhận nêu người gửi và mục tiêu, không gộp thành «nhắc tên», người gửi không có mục nào; And không màn hay thủ tục nào trả số ghi nhận theo từng người hay xếp người theo ghi nhận.
- AC-7: Given quản trị ở Cài đặt › Chương trình OKR, When thêm, sửa, lưu trữ rồi khôi phục một mẫu (tên, cấp, danh sách đơn vị áp dụng hoặc trống, câu mục tiêu gợi ý, loại, 1 tới trần KR mẫu mỗi KR có tên, kiểu, đơn vị đo, khởi điểm và đích tuỳ chọn), Then đọc lại từ bảng đúng từng bước qua khuôn Zod; mỗi bước một dòng vết; And KR mẫu có hai số trái kiểu (tăng tới mà đích nhỏ hơn khởi điểm), quá trần KR, đơn vị không tồn tại hay đã lưu trữ đều bị từ chối với thông điệp nêu đúng KR hay đơn vị hỏng; người không phải quản trị bị từ chối.
- AC-8: Given ba mẫu — một cho mọi phòng ban, một chỉ cho phòng P1, một đã lưu trữ — When trưởng phòng P1 và trưởng phòng P2 mở «Đặt mục tiêu» ở phòng mình, Then P1 thấy đúng hai mẫu còn sống, P2 thấy đúng một; When trưởng P1 tạo mục tiêu từ mẫu và điền đủ số, Then một giao dịch tạo mục tiêu nháp cùng đủ KR (mỗi KR qua cùng luật với tạo KR tay, trần KR theo chế độ chương trình) và nhớ mẫu nguồn; thiếu số hay số trái kiểu thì không hàng nào được ghi; And sửa mẫu sau đó không đổi mục tiêu đã tạo.
- AC-9: Given chu kỳ ở pha «Chấm điểm» hay «Đã đóng», hoặc mục tiêu đã bỏ, When gọi mọi thao tác ghi việc, sáng kiến, bằng chứng, Then đều bị từ chối, bảng không đổi; ghi nhận trên mục tiêu đã công bố vẫn gửi được ở hai pha đó; And xoá một KR nháp có việc thì việc bị xoá cùng giao dịch kèm vết; xoá KR có bằng chứng hay ghi nhận bị từ chối; việc của người đã rời hiện cờ «đã rời» và chuyển việc người nghỉ chuyển cả việc chưa xong của họ sang người nhận.
- AC-10: Given một mục tiêu có KR đủ loại (có việc xong và chưa, có sáng kiến, KR mốc có bằng chứng, KR chưa có gì), When người dùng mở khung mục tiêu và bấm vào số việc của một KR trong trình duyệt thật của cây đang xét, Then bảng KR hiện cột việc «xong/tổng» khớp số đọc DB; khung KR mở chồng với hai tab «Việc và sáng kiến», «Bằng chứng» (tab sau chỉ cho KR mốc), đường dẫn giữ `record=kr:<id>` và mở thẳng đường dẫn đó ở tab mới thì khung KR đúng KR mở chồng lên khung mục tiêu của nó; thêm việc, đánh dấu xong, gắn một kế hoạch 30 ngày qua bộ chọn và đính bằng chứng trên màn thì DB ghi đúng; And có đủ trạng thái rỗng, đang tải, lỗi kèm «Thử lại», khoá ở pha chấm điểm, và ở khổ 390 không cuộn ngang. (cross-layer)
- AC-11: Given người vai «chỉ OKR» và người vai thành viên, When mỗi người mở khung KR có sáng kiến gắn sẵn trong trình duyệt thật, Then người vai «chỉ OKR» thấy dòng «Một kế hoạch 30 ngày — bạn không có quyền xem» không có đường mở, không nút gắn; người vai thành viên thấy tên và bấm mở được kế hoạch; And trong tab Trao đổi, cả hai gửi được ghi nhận bằng ô soạn chế độ «Ghi nhận» và dòng ghi nhận hiện khác bình luận, đọc DB khớp người nhận đã chọn. (cross-layer)
- AC-12: Given quản trị và một thành viên thường, When mở Cài đặt › Chương trình OKR, Then quản trị thêm được mẫu bằng sheet (trạng thái mở trên URL, «Huỷ» bên trái, «Lưu» chỉ bật khi hợp lệ), danh sách hiện mẫu kèm cấp, số đơn vị, số KR, số lần dùng; thành viên thường thấy danh sách với điều khiển khoá và một dòng lý do dưới tiêu đề; When trưởng đơn vị chọn «Bắt đầu từ mẫu» trong «Đặt mục tiêu», Then form điền sẵn và ô số trống báo lỗi khi bấm tạo; DB có mục tiêu nháp nhớ mẫu nguồn sau khi điền đủ. (cross-layer)
- AC-13: Given bộ OKR mẫu của hạng mục M, When chạy lệnh nạp bộ mẫu, nạp lại, rồi xoá, Then sau nạp có việc (xong và chưa) ở mỗi phòng ban mẫu, ít nhất ba KR mốc đã xong có bằng chứng, ít nhất sáu ghi nhận, ba mẫu OKR và hai mục tiêu quý 4 sinh từ mẫu; nạp lại không nhân đôi hàng nào của sáu bảng mới; xoá để lại 0 hàng mang mã thực thể mẫu ở sáu bảng mới và hàng ngoài bộ mẫu đứng nguyên.
- AC-14: Given `_acceptance/canh-kr-okr/rang/ty-le-canh-kr.sql`, When chạy trên một kho gieo qua thủ tục thật với số viết trước, Then câu trả đúng tỷ lệ mục tiêu đã công bố có việc hay sáng kiến, tỷ lệ KR mốc đã xong có bằng chứng, số phòng ban có ghi nhận trên tổng số phòng ban, tổng số ghi nhận, tỷ lệ mục tiêu cấp phòng ban đã công bố sinh từ mẫu, và hai số đọc kèm; câu chỉ đọc; And `migration` của lượt chỉ tạo bảng, chỉ mục và khoá ngoại trên bảng mới, sáu model mới liền nhau cuối `schema.prisma`, khoá ngoại tới bảng OKR cũ là RESTRICT và tới chiến dịch, kế hoạch là SET NULL.
- AC-15: Given diff của lượt, When soi mã và giao diện, Then màn dựng bằng thành phần `packages/ui` (bậc 1–3 của `docs/design.md`), không dấu hiệu vẽ tay, chữ ở `lib/messages/okr*.ts` có vi và en, chữ người nhập mang `translate="no"`; mọi đầu vào mới parse ở biên bằng Zod (không `Record<string, unknown>`); luật không lộ dữ liệu đối tác nằm ở một hàm; `CONTEXT.md` có mục cho Việc (KR), Sáng kiến, Bằng chứng, Ghi nhận, Mẫu OKR; danh sách thủ tục vai «chỉ OKR» với tới được sửa có chủ ý. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — vật cạnh KR:** việc tự gõ · sáng kiến là chiến dịch · sáng kiến là kế hoạch 30 ngày · bằng chứng KR mốc · ghi nhận · mẫu OKR [thước CE: câu «Ý định» lượt 8 phần 8a + năm mã; NGÀNH: Perdoo initiatives, Profit.co recognition, Perdoo templates] → AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8
- **Trục B — thao tác:** tạo · đọc lại · sửa hay xong · gỡ · báo người [thước CE: mục 2 lộ trình «mỗi thủ tục ghi có một AC đọc lại từ DB»; luật vết] → AC-1, AC-2, AC-4, AC-5, AC-6, AC-7, AC-8
- **Trục C — người:** quản trị · người sửa được KR · người làm / người nhận · thành viên khác · vai «chỉ OKR» [thước CE: `OkrAccessService`, «Phạm vi dữ liệu»] → AC-1, AC-2, AC-3, AC-5, AC-7, AC-11, AC-12
- **Trục D — pha:** nháp · công bố, lập kế hoạch hay đang chạy · chấm điểm hay đã đóng · đã bỏ [thước CE: `PHA_CHU_KY`, `assertKyGhiDuoc`] → AC-5, AC-9, AC-10
- Cross-cutting: vết mọi ghi (AC-1, AC-2, AC-4, AC-5, AC-7); bản ghi gốc đổi tên, lưu trữ, xoá (AC-2); người rời (AC-9); bốn đường vào (AC-3); ba trạng thái màn, 390 (AC-10, AC-12); bộ mẫu (AC-13); `migration` chỉ tạo bảng (AC-14); đường đo (AC-14).
- Chân ngành: sáng kiến là giả thuyết đẩy KR, nối được tới việc có sẵn ở công cụ khác [NGÀNH: Perdoo]; ghi nhận gắn tiến độ OKR [NGÀNH: Profit.co]; mẫu do quản trị soạn [NGÀNH: Perdoo Configure › Templates].
- [GIẢ ĐỊNH] Nghĩa năm mã rút theo thứ tự câu «Ý định» lượt 8 (bảng chia mã ở `opportunity.md`).
- [GIẢ ĐỊNH] «Việc» là dòng tự gõ một tầng (tiêu đề, người làm, hạn tuỳ, xong/chưa); «sáng kiến» là chiến dịch hay kế hoạch 30 ngày có sẵn; hai thứ chung danh sách «Việc và sáng kiến» của KR. Sáng kiến tự gõ có việc con: Later.
- [GIẢ ĐỊNH] Tiến độ KR và mục tiêu không đọc việc — KR đo kết quả.
- [GIẢ ĐỊNH] Vai «chỉ OKR» thấy sáng kiến gắn sẵn là «Một chiến dịch» / «Một kế hoạch 30 ngày», không tên, không trạng thái, không đường mở, không gắn được.
- [GIẢ ĐỊNH] Bằng chứng là đường dẫn http/https kèm ghi chú, chỉ cho KR mốc, không bắt buộc để đánh dấu xong; không tải tệp.
- [GIẢ ĐỊNH] Ghi nhận theo mục tiêu (tuỳ gắn một KR), 1–5 người nhận, gửi được ở mọi pha của mục tiêu đã công bố; không sửa, chỉ gỡ; không đếm theo người.
- [GIẢ ĐỊNH] «Theo loại đơn vị» = cấp (bộ phận · phòng ban · cá nhân) và danh sách đơn vị áp dụng (trống = mọi đơn vị cấp đó); cây tổ chức không thêm trường «loại».
- [GIẢ ĐỊNH] Dùng mẫu tạo bản nháp; mẫu đổi không đổi mục tiêu đã tạo; mẫu chỉ lưu trữ, không xoá hẳn.
- [GIẢ ĐỊNH] Khung KR xếp chồng (hướng A của thiết kế mục 2) thay cho tab «Việc» ở khung mục tiêu (B) và dòng bung tại chỗ (C).

## Đường đo

- Thước: ≥ 40% mục tiêu đã công bố quý 4 có ít nhất một việc hay sáng kiến (SỐNG), < 15% (CHẾT) · số từ: `rang/ty-le-canh-kr.sql` trên production với `SET okr.chu_ky` của quý 4, cột `coViecHaySangKien / mucTieu`, đọc 2026-12-01 · bảo đảm bởi: AC-1, AC-2 (hàng đọc lại từ bảng), AC-14
- Thước: ≥ 60% KR mốc đã xong có bằng chứng · số từ: cùng câu, cột `mocCoBangChung / mocXong` · bảo đảm bởi: AC-4, AC-14
- Thước: có ghi nhận ở ≥ một nửa số phòng ban; CHẾT < 10 ghi nhận toàn công ty · số từ: cùng câu, cột `phongBanCoGhiNhan / phongBanTong` và `ghiNhanTong` · bảo đảm bởi: AC-5, AC-14
- Thước: ≥ 30% mục tiêu quý 1 của phòng ban sinh từ mẫu, đọc 2027-01-11 · số từ: cùng câu với chu kỳ quý 1, cột `tuMauPhongBan / mucTieuPhongBan` (chỉ cấp phòng ban, chỉ mục tiêu đã công bố — nháp không tính) · bảo đảm bởi: AC-8 (nhớ mẫu nguồn), AC-14
- Thước đọc kèm: tỷ lệ việc đã xong, tỷ lệ sáng kiến là kế hoạch 30 ngày · số từ: cột `viecXong / viecTong`, `sangKienKeHoach / sangKienTong` · bảo đảm bởi: AC-14

## Out of scope

- MT-06 mức hiển thị giới hạn, QT-02 bước duyệt nhẹ, TC-06 tái cơ cấu giữa kỳ — lượt 8c đề xuất (quyết ở Cổng Đáng).
- XEM-08 lọc lưu được, XEM-09 tìm OKR trong ô tìm chung, NH-05 bản tin tuần vào Slack đơn vị — lượt 8b.
- Nhắc việc đến hạn, việc được giao hiện trong «việc của tôi» — phần gửi tin, 8b.
- Tải tệp làm bằng chứng — chỗ lưu duy nhất của kho là Vercel Blob công khai.
- Việc con trong sáng kiến; sáng kiến góp vào tiến độ; nối Asana, Trello, Jira.
- Trợ lý OKR đọc việc, sáng kiến, ghi nhận, mẫu — lượt 9b hay C.
- Đếm, xếp hạng ghi nhận theo người; điểm đổi quà — NG-07, không bao giờ.
- Kéo thả sắp thứ tự việc.

## Notes

- Người dùng thấy ngay khi gộp, không công tắc; không gộp trong đóng băng (từ 19/10 tới khi các phòng ban công bố OKR quý 4). Viết mã chỉ khi M đã gộp và chủ kho cho.
- Chạm nhắc buổi sáng (`okr-nhac.ts`) cùng vùng với 9c; ai gộp sau kéo `onehub` về và soát lại.
