---
schema_version: 1
feature: Hỏi ý mục tiêu — trước mỗi kỳ đặt OKR cả công ty góp ý cho mục tiêu công ty, người gom xếp ý thành chủ đề, người chọn (CEO) viết trước rồi kết luận từng chủ đề bằng lý do tự viết, chủ đề chọn thành bản nháp mục tiêu cấp OneHub, ai góp cũng thấy ý mình đi đâu và vì sao (bước 1–2 chu kỳ OKR, hạng mục 11 lộ trình OKR)
slug: dot-hoi-y-tuong-okr
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: draft
design_doc: docs/superpowers/specs/2026-09-29-dot-hoi-y-tuong-okr-design.md
---

# Acceptance Contract: dot-hoi-y-tuong-okr

## Context

Công ty chạy OKR theo mười bước của VNOKRs; bước 1–2 (hỏi cả công ty, CEO chọn 3–5
mục tiêu và nói vì sao) hôm nay chạy ngoài CRM. Lượt này đưa hai bước đó vào khu OKR
dưới tên «Hỏi ý mục tiêu» (chữ «đợt» đã là chữ của chiến dịch trong từ điển). Sáu
bảng mới ở cuối `schema.prisma`, không cột mới trên bảng có sẵn; một thủ tục có sẵn
đổi hành vi (`setCyclePhase` từ chối rời «lập kế hoạch» khi còn lần hỏi ý chưa công
bố). Dựng và đo trên bộ OKR mẫu; lần chạy thật đầu tiên là OKR năm 2027, mở cùng mùa
đặt OKR 2026-12-07.

Source input: `_acceptance/dot-hoi-y-tuong-okr/opportunity.md` (Cổng Đáng ký
2026-09-29, Manh Phan) · `docs/superpowers/specs/2026-09-29-dot-hoi-y-tuong-okr-design.md`
· `coverage-scan.md` · `CONTEXT.md` (OKR, Chu kỳ, Mục tiêu, Vai «chỉ OKR», Phạm vi dữ
liệu, Trợ lý OKR, Đề xuất) · `docs/api.md` mục OKR · `docs/agent.md` mục Nhắc buổi
sáng · bản mẫu `/proto/dot-hoi-y-tuong-okr` (`design-pass.md`).

## Criteria

- AC-1: Given chu kỳ ở pha «lập kế hoạch» chưa có lần hỏi ý, When quản trị mở hỏi ý với câu hỏi, lời mở, 1–5 con số (nhãn, giá trị, ghi chú), hạn và người chọn là một quản trị, rồi sửa lời mở, con số và dời hạn về bây giờ, Then đọc lại từ bảng đúng từng giá trị qua khuôn Zod, trạng thái suy ra đúng «đang mở» rồi «đang gom», mỗi lần mở và sửa một dòng vết; And bị từ chối, bảng không đổi: người mở không phải quản trị (thành viên, vai «chỉ OKR»), người chọn không phải quản trị, chu kỳ không ở «lập kế hoạch», lần hỏi ý thứ hai trên cùng chu kỳ, hạn dưới 24 giờ hay quá 7 ngày lúc mở, 0 hay 6 con số, ô quá độ dài, đổi câu hỏi khi đã có ý, đổi người chọn khi đã niêm phong mà người chọn vẫn là quản trị; And khi người chọn đã niêm phong rồi bị hạ về thành viên, quản trị đổi được người chọn, bản viết trước giữ nguyên và ghi người viết cũ, một dòng vết đổi người chọn.
- AC-2: Given lần hỏi ý đang mở, When một thành viên và một người vai «chỉ OKR» mỗi người góp ý (nội dung, vì sao, đo bằng gì), sửa rồi gỡ một ý của mình, Then đọc lại từ bảng đúng từng bước, người góp là chính người gọi; And ý thứ tư của cùng người, sửa hay gỡ ý của người khác, người chọn góp ý, góp sau hạn và góp sau công bố đều bị từ chối với câu lỗi ghim, bảng không đổi.
- AC-3: Given lần hỏi ý có ý của nhiều người và lượt «tôi cũng nghĩ vậy», When thành viên, vai «chỉ OKR», quản trị và người chọn (đã niêm phong) cùng đọc lần hỏi ý qua tRPC, cầu REST và khoá API của chính họ, Then thành viên và vai «chỉ OKR» thấy nội dung mọi ý nhưng không có tên, mã người góp hay số đồng ý của ý người khác, chỉ biết mình đã bấm «tôi cũng nghĩ vậy» ý nào, và ý của người khác đến theo một thứ tự xáo riêng cho từng người xem — cùng người gọi lại thì cùng thứ tự, hai người khác nhau thì khác, không theo thứ tự tạo hay số đồng ý; quản trị và người chọn thấy tên và số; And bấm «tôi cũng nghĩ vậy» lần hai không thêm hàng, bỏ bấm xoá hàng, bấm trên ý của chính mình hay sau hạn bị từ chối. (cross-layer)
- AC-4: Given lần hỏi ý đang mở với người chọn P, When P gọi đọc lần hỏi ý trước khi niêm phong, Then phản hồi không chứa nội dung ý nào của người khác và có cờ khoá kèm lý do; When P niêm phong bốn câu (hoặc khai không viết trước), Then P đọc được ý kèm tên; niêm phong lần hai và sửa bản viết trước bị từ chối; dòng vết niêm phong không chứa chữ nào của bốn câu; And trước công bố không phản hồi nào tới quản trị khác, thành viên hay vai «chỉ OKR» — qua tRPC, cầu REST hay khoá API — chứa chữ của bản viết trước; sau công bố mọi vai đọc được nó. (cross-layer)
- AC-5: Given lần hỏi ý đã qua hạn, When quản trị hoặc người chọn tạo, đổi tên chủ đề, gắn nhiều ý vào một chủ đề, đánh dấu một ý là «ý lạ», chuyển một ý sang chủ đề khác và gỡ một chủ đề rỗng, Then đọc lại từ bảng đúng từng bước; «ý lạ» thành một chủ đề loại ý lạ chứa đúng ý đó; And gom khi lần hỏi ý còn mở, thành viên hay vai «chỉ OKR» gom, gỡ chủ đề còn ý đều bị từ chối, bảng không đổi.
- AC-6: Given lần hỏi ý đang gom, When người chọn đặt cho từng chủ đề một kết luận (chọn · để sau · không làm · đã có), lý do tự viết và — với chủ đề «chọn» — câu mục tiêu và lời khai nối với câu viết trước nào hay «không có trong bản viết trước», Then đọc lại đúng; mỗi chủ đề trả bằng chứng đúng số người, số đơn vị, tổng lượt đồng ý và đúng hai câu trích từ ý của chủ đề; chủ đề chưa kết luận trả lý do trống, không có chữ nào máy điền sẵn; And quản trị không phải người chọn đặt kết luận, lý do dưới 10 ký tự, «chọn» thiếu câu mục tiêu, nối tới câu viết trước không tồn tại đều bị từ chối.
- AC-7: Given lần hỏi ý đang gom thiếu từng điều kiện một (chưa niêm phong, còn ý chưa gom, còn chủ đề rỗng, chủ đề thiếu kết luận, thiếu lý do, «chọn» thiếu câu mục tiêu, «chọn» chưa khai nối câu viết trước hay «mới», không chủ đề nào «chọn», vượt trần mục tiêu cấp OneHub ở chế độ chặn), When người chọn công bố, Then mỗi ca bị từ chối với câu lỗi riêng, không hàng nào được ghi, và đọc lần hỏi ý trước khi bấm trả đúng danh sách điều còn thiếu; When đủ điều kiện, Then một giao dịch tạo mỗi chủ đề «chọn» một mục tiêu nháp cấp OneHub (người phụ trách người chọn, tên là câu mục tiêu, «vì sao lúc này» là lý do), nối chủ đề với mục tiêu, đặt lúc công bố, vết cho mỗi mục tiêu và một vết công bố; And công bố lần hai bị từ chối; chế độ cảnh báo vượt trần vẫn công bố và trả cảnh báo; chuyển chu kỳ sang «đang chạy» khi còn lần hỏi ý chưa công bố bị từ chối, sau công bố thì được; người chọn đã niêm phong rồi bị hạ vai không công bố được, quản trị đổi người chọn mới, người mới công bố được và chu kỳ sang «đang chạy» được.
- AC-8: Given lần hỏi ý đã công bố với bốn câu viết trước, ba chủ đề «chọn» (một nối câu 1 cùng chữ, một nối câu 3 khác chữ, một khai «mới»), một chủ đề «để sau», When một người đã góp và một người vai «chỉ OKR» chưa góp đọc lần hỏi ý, Then người đã góp thấy từng ý của mình với chủ đề, kết luận, lý do và mục tiêu nháp khi «chọn»; kết quả trả câu 1 giữ nguyên, câu 3 đổi (kèm cả hai câu), câu 2, 4 bỏ, một chủ đề thêm; kho ý có chủ đề «để sau» cho cả hai; When người đã góp bấm «tôi hiểu vì sao», Then một hàng được ghi, bấm lần hai không thêm; And người chưa góp bấm bị từ chối, bấm trước công bố bị từ chối.
- AC-9: Given lần hỏi ý đang mở với thành viên chưa góp A, người đã góp B, người vai «chỉ OKR» chưa góp O, người chọn P và một người đã rời, When cửa sổ việc OKR được tính (việc của tôi và tin nhắc buổi sáng kế), Then A và O mỗi người đúng một mục «hỏi ý đang chờ bạn góp» trỏ tới tab Hỏi ý, B, P và người đã rời không có; sau hạn không ai có mục đó; When lần hỏi ý được công bố, Then trong cửa sổ sự kiện mỗi người đã góp còn là thành viên có đúng một mục «đã công bố», người chưa góp không có; tin nhắc buổi sáng chứa dòng tương ứng kèm đường mở.
- AC-10: Given lần hỏi ý có ý gieo vào hai ngày ở ba bộ phận, năm phòng ban và một người chưa xếp đơn vị, When đọc độ phủ, Then mỗi ô (đơn vị × ngày giờ Việt Nam) bằng phần trăm viết trước — thành viên còn hiệu lực theo phòng ban chính, trừ người chọn, cộng dồn tới hết ngày — và hàng toàn công ty bằng tổng; người đã rời không vào mẫu số; số truy vấn không đổi khi số phòng ban tăng từ 5 lên 50; And không thủ tục nào của lần hỏi ý trả danh sách tên hay mã những người chưa góp.
- AC-11: Given bộ OKR mẫu và một chu kỳ năm kế tiếp ở «lập kế hoạch», When quản trị mở hỏi ý bằng sheet, rồi một thành viên góp ý, bấm «tôi cũng nghĩ vậy» và xem độ phủ trong trình duyệt thật của cây đang xét, Then sheet mở trên URL, «Mở» chỉ bật khi hợp lệ, tab «Hỏi ý» mang huy hiệu «Mới» với thành viên chưa góp và mất huy hiệu ngay sau khi góp, trang hiện dải pha ngang bốn mốc (mở, hạn, gom, công bố — mốc hiện tại gắn «Bây giờ»), thẻ con số có chênh lệch, câu hỏi, lời mở gập kèm «Đọc thêm», thẻ con số, ô soạn, 10 ý người khác không tên kèm «Hiện thêm», heatmap theo đơn vị; DB có đúng lần hỏi ý, ý và lượt đồng ý vừa làm; And có trạng thái trống cho quản trị và thành viên, đang tải, lỗi kèm «Thử lại»; ở khổ 390 không cuộn ngang, ô soạn nằm trong màn hình đầu (390 × 812) và tab «Hỏi ý» đang đứng nằm trọn trong khung nhìn. (cross-layer)
- AC-12: Given lần hỏi ý mẫu đang gom, When người chọn chọn một ý chưa gom và đưa vào chủ đề bằng thanh chọn nhiều, kết luận các chủ đề còn thiếu (tab «Hỏi ý» mang số chủ đề chưa kết luận và số giảm theo; ở máy tính mục lục chủ đề bên trái sáng mục đang đọc và đổi dấu khi chủ đề được kết luận; ở điện thoại bấm một điều thiếu trên thanh công bố thì trang cuộn tới đúng thẻ), thấy thanh công bố bật, công bố, và một thành viên đã góp mở trang kết quả rồi bấm «tôi hiểu vì sao» trong trình duyệt thật, Then mỗi bước DB ghi đúng; trang kết quả hiện dải pha ở «Đã công bố», mỗi ý của người góp có hành trình từ lúc góp tới chủ đề, kết luận và mục tiêu nháp, lý do nguyên văn và đủ — không cắt ở 390 —, giữ nguyên · đổi · thêm · bỏ, mục tiêu nháp mở được từ chủ đề chọn; And người chọn trước khi niêm phong thấy danh sách ý khoá kèm lý do; khổ 390 không cuộn ngang, thanh công bố dính đáy. (cross-layer)
- AC-13: Given bộ OKR mẫu, When chạy lệnh nạp, nạp lại, rồi xoá, Then sau nạp có một chu kỳ năm kế tiếp ở «lập kế hoạch» với một lần hỏi ý đang gom (người chọn đã niêm phong, khoảng 30 ý của khoảng 25 người ở cả ba bộ phận kể cả vai «chỉ OKR», lượt đồng ý, chủ đề đã và chưa kết luận, một ý lạ, ý chưa gom); nạp lại không nhân đôi hàng nào của sáu bảng mới; xoá để lại 0 hàng mang mã thực thể mẫu ở sáu bảng mới và hàng ngoài bộ mẫu đứng nguyên.
- AC-14: Given `_acceptance/dot-hoi-y-tuong-okr/rang/ty-le-hoi-y.sql`, When chạy trên kho gieo qua thủ tục thật với số viết trước cho hai lần hỏi ý nối tiếp, Then câu trả đúng tỉ lệ góp, tỉ lệ bấm hiểu trong 7 ngày sau công bố, số chủ đề thêm, tỉ lệ góp lại, và các số đọc kèm; câu chỉ đọc; And `migration` của lượt chỉ tạo bảng, chỉ mục và khoá ngoại trên bảng mới, sáu model mới liền nhau cuối `schema.prisma`, khoá ngoại tới bảng có sẵn là RESTRICT.
- AC-15: Given diff của lượt, When soi mã và giao diện, Then màn dựng bằng thành phần `packages/ui` (bậc 1–3 của `docs/design.md`), không dấu hiệu vẽ tay, không chú thích mã; chữ ở `lib/messages/okr*.ts` có vi và en, chữ người nhập mang `translate="no"`; mọi đầu vào mới parse ở biên bằng Zod; luật ai đọc được tên người góp, số đồng ý và bản viết trước nằm ở một chỗ; `CONTEXT.md` có mục cho Hỏi ý mục tiêu, Ý, Người chọn, Bản viết trước, Chủ đề, Ý lạ, Kết luận và Kho ý; danh sách thủ tục vai «chỉ OKR» với tới được sửa có chủ ý. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — bước của vòng:** mở · góp · gom · chọn · công bố · báo lại [thước CE: vòng đời sáu bước của phần mềm quản lý ý tưởng — thu, xếp theo chủ đề, đánh giá, ưu tiên, làm, báo lại (NGÀNH: Guideflow tổng hợp 2026; Ideanote); bước 1–2 VNOKRs trong `opportunity.md`] → AC-1, AC-2, AC-5, AC-6, AC-7, AC-8
- **Trục B — người:** quản trị · người chọn · thành viên · vai «chỉ OKR» · người đã rời [thước CE: `OkrAccessService`, bốn vai workspace, «Phạm vi dữ liệu»] → AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-8, AC-9, AC-10
- **Trục C — trạng thái lần hỏi ý:** chưa có · đang mở · đang gom · đã công bố · chu kỳ không ở «lập kế hoạch» [thước CE: `PHA_CHU_KY`; hàm trạng thái suy từ hạn và lúc công bố] → AC-1, AC-2, AC-5, AC-7, AC-8, AC-9
- Cross-cutting: bốn đường vào (AC-3, AC-4); vết mở, sửa, niêm phong, công bố (AC-1, AC-4, AC-7); nhắc buổi sáng (AC-9); độ phủ không lộ tên (AC-10); ba trạng thái màn, 390 (AC-11, AC-12); bộ mẫu (AC-13); `migration` chỉ thêm, đường đo (AC-14).
- Chân ngành: báo lại người góp là bước giữ người góp tiếp [NGÀNH: Ideanote]; trang chiến dịch ý tưởng một cột có bình chọn [NGÀNH: Microsoft Employee Ideas]; bảng xếp hạng người góp [NGÀNH: InnovationCast] → loại (NG-07).
- [GIẢ ĐỊNH] Người chọn là một quản trị (owner/admin) được chỉ định khi mở, không phải vai workspace mới; người chọn không góp ý và không vào mẫu số độ phủ.
- [GIẢ ĐỊNH] Người gom là mọi quản trị cộng người chọn; chỉ người chọn đặt kết luận, lý do và công bố.
- [GIẢ ĐỊNH] Người chọn chỉ đọc được ý của người khác sau khi niêm phong hoặc khai «không viết trước»; bản viết trước không sửa được sau niêm phong; khai «không viết trước» là hợp lệ và trang kết quả nói rõ.
- [GIẢ ĐỊNH] «Ý lạ» là một chủ đề một ý, nên cũng phải có kết luận và lý do; «đã có» là một kết luận, không phải một ô gom riêng.
- [GIẢ ĐỊNH] «Giữ · đổi · thêm» đo bằng lời khai bắt buộc của người chọn cho mỗi chủ đề chọn: nối câu viết trước nào, hay «mới»; câu nối tới mà chữ khác (bỏ khoảng trắng thừa, không phân biệt hoa thường) là «đổi», dù khác một chữ.
- [GIẢ ĐỊNH] Người chọn bị hạ vai hay rời sau khi niêm phong thì quản trị đổi người chọn; bản viết trước giữ nguyên của người cũ — lối ra duy nhất, không có «huỷ lần hỏi ý».
- [GIẢ ĐỊNH] Heatmap độ phủ theo đơn vị × ngày, ai cũng xem; không màn nào liệt tên người chưa góp; nhắc đi thẳng tới người.
- [GIẢ ĐỊNH] Tin đóng vòng lâu dài sống trên tab Hỏi ý (khối «Ý của bạn»); nhắc buổi sáng chỉ trỏ tới đó — kho chưa có hộp tin trong ứng dụng.
- [GIẢ ĐỊNH] Một chu kỳ một lần hỏi ý, mọi kiểu chu kỳ; chủ đề «chọn» thành mục tiêu nháp loại cam kết, người chọn đổi loại ở luồng đặt OKR.
- [GIẢ ĐỊNH] Ý, lượt đồng ý, gom, kết luận không để vết (dữ liệu góp của người, như Đề xuất); mở, sửa, niêm phong, công bố để vết.

## Đường đo

- Mọi mẫu số tính theo thành viên còn hiệu lực lúc chạy câu đo (kho không giữ ngày rời); người chọn không vào mẫu số nào.
- Thước: lần đầu ≥ 80% thành viên còn hiệu lực góp ít nhất một ý (SỐNG), < 50% (CHẾT) · số từ: `rang/ty-le-hoi-y.sql` với `SET okr.hoi_y` của lần hỏi ý năm 2027, cột `gop / thanhVien`, đọc 2026-12-14 · bảo đảm bởi: AC-2 (người góp là người gọi), AC-10 (mẫu số), AC-14
- Thước: ≥ 60% người đã góp (còn là thành viên) bấm «tôi hiểu vì sao» trong khoảng [lúc công bố, lúc công bố + 7 × 24 giờ) (SỐNG), < 30% (CHẾT) · số từ: cùng câu, cột `hieu7 / gop` · bảo đảm bởi: AC-8, AC-14
- Thước: ≥ 1 mục tiêu đổi hoặc thêm so với bản viết trước · số từ: cùng câu, cột `doi + them` · bảo đảm bởi: AC-4 (bản viết trước có trước khi đọc ý), AC-6 và AC-7 (mỗi chủ đề chọn phải khai nối câu nào hay «mới»), AC-14
- Thước (Cổng Giá trị, lần hỏi ý quý 2/2027): ≥ 70% người đã góp lần đầu và còn là thành viên góp lại (SỐNG), < 40% (CHẾT) · số từ: cùng câu với `SET okr.hoi_y_truoc`, cột `gopLai / gopTruoc` · bảo đảm bởi: AC-14
- Thước đọc kèm (giả định #4 của Cổng Đáng): số ý, số ý lạ, số chủ đề theo kết luận (tỉ lệ «đã có» quá 40% thì xem lại đích 100%), số lượt đồng ý · số từ: cùng câu · bảo đảm bởi: AC-14

## Out of scope

- Trợ lý OKR đề xuất nhóm chủ đề khi AI bật — lượt 11b, đứng trên màn nhận/bác đề xuất của 9b (đề xuất tách ở Cổng Phạm vi).
- Góp ý qua Slack hay Zalo — lượt 10.
- Lần hỏi ý riêng của một bộ phận hay phòng ban.
- Ẩn tên, hay để từng người tự chọn ẩn — bác ở Cổng Đáng.
- Danh sách tên người chưa góp, xếp hạng người hay đơn vị theo số ý — NG-07.
- Máy điền sẵn lý do cho người chọn; thẻ mồi lấy số từ dữ liệu đối tác.
- Trưởng đơn vị lọc hay sửa ý trước khi lên người chọn.
- Sửa lần hỏi ý sau công bố; mở lại một lần hỏi ý đã công bố.
- Kho ý tự hiện làm mồi cạnh thẻ con số ở lần hỏi ý kế — đo được từ lần thứ hai.
- Kéo thả khi gom.
- Hộp tin trong ứng dụng.

## Notes

- Người dùng thấy ngay khi gộp, không công tắc; tab «Hỏi ý» trống cho tới khi quản trị mở lần đầu.
- Chạm nhắc buổi sáng (`okr-nhac.ts`) cùng vùng với 9c; ai gộp sau kéo `onehub` về và soát lại.
- Mốc `migration` đặt sau migration mới nhất của `onehub` lúc viết mã.
