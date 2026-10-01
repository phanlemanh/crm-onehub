---
schema_version: 1
feature: Tóm tắt tuần — sáng hôm sau ngày cập nhật, Trợ lý OKR tóm tắt các lần Cập nhật tuần của một phòng ban; khối tóm tắt ở đầu bảng họp tuần, câu nào cũng bấm ra lần cập nhật gốc, máy kiểm lại mọi con số lúc ghi và lúc hiện; Trưởng phòng ban nhận một dòng trong nhắc buổi sáng và tắt được dòng đó; quản trị bật theo ba nấc tắt · chế độ ẩn · bật và thấy mọi bản ở màn Sức khoẻ; dựng và đo trên bộ OKR mẫu, dữ liệu thật là điều kiện bật
slug: tro-ly-okr-tom-tat
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: verified
approved_by: Manh Phan
approved_at: 2026-09-30T14:53:45Z
design_doc: docs/superpowers/specs/2026-09-30-tro-ly-okr-tom-tat-design.md
---

# Acceptance Contract: tro-ly-okr-tom-tat

## Context

Lượt 9c của lộ trình Trợ lý OKR, làn A (AI-04). Nền 9a (#182) đã có subagent `tro_ly_okr`, sổ
chi phí, trần tháng, bảng `OkrTomTat`, `OkrTomTatPhanHoi`, cột `dongTroLyOkr` và hai loại việc
`okr-tom-tat-xep`, `okr-tom-tat-tuan`; 9b (#207, #212) có công tắc ba nấc và hai cột chế độ ẩn
cho tóm tắt. Chưa gì chạy. Lượt này thêm việc xếp tự nối theo ngày, nhánh tóm tắt của
subagent với tool nộp và bộ kiểm câu, ba thủ tục đọc, khối tóm tắt có trích dẫn trên bảng họp
tuần, dòng báo và công tắc tắt dòng trong nhắc buổi sáng, khối quản trị ở màn Sức khoẻ, thước
đo, eval trên bộ mẫu; và dời luật «đáng bàn» ra `@crm/db`.

Hạng T2: không migration (thiết kế §3 mục 1, §5).

Source input: `docs/plan/lo-trinh-tro-ly-okr.md` mục 5 «9c»; `docs/plan/lo-trinh-okr.md` mục 5
«Dựng hết bằng dữ liệu mẫu» và dòng 9c mục 10; thiết kế `12-kien-truc-va-lo-trinh.md` §4.3,
4.6, 4.7, 4.9, 4.11, 4.12, 6.3; `_acceptance/tro-ly-okr-tom-tat/opportunity.md`; hồ sơ 9a, 9b.

## Criteria

- AC-1: Given `lyDoCua`, `xepHopTuan`, `soTuanCuaNhom` và kiểu của chúng đã dời từ `apps/api/src/okr/hop-tuan.ts` sang `@crm/db/okr-hop-tuan`, When chạy một bảng ca viết trước cho `lyDoCua` (tụt một và hai bậc, tụt trong cùng tuần, im 13 và 14 ngày tính từ lần cuối và từ `khoaLuc`, ghi chú trước và từ đầu tuần trước, KR chưa có gì) và các bài OKR sẵn có của API, Then mỗi ca ra đúng lý do và thứ tự của bảng, mọi bài OKR sẵn có xanh không sửa kỳ vọng nào, và `apps/api` không còn tệp `hop-tuan.ts`.
- AC-2: Given bộ OKR mẫu có hai chu kỳ đang chạy (ngày cập nhật khác nhau), phòng ban ở từng nấc tắt · chế độ ẩn · bật, phòng có và không có Cập nhật tuần trong 7 ngày, When việc `okr-tom-tat-xep` chạy lúc 06:00 giờ VN của từng ngày trong một tuần, Then chỉ ngày ngay sau ngày cập nhật của một chu kỳ mới ghi việc `okr-tom-tat-tuan`, đúng một việc cho mỗi (chu kỳ, phòng ban nấc bật hay ẩn, có cập nhật), payload mang đúng `nac`; việc xếp của ngày kế được ghi trước mọi việc khác và đúng một lần dù chạy hai lượt chồng nhau; chạy lại cùng ngày không ghi thêm việc tóm tắt; khi trần tháng đã chạm thì không ghi việc tóm tắt nào và đóng với mã có tên; And When công tắc tóm tắt đang bật hay ẩn mà không còn việc xếp mở, Then nhịp dispatch kế ghi lại đúng một việc xếp, còn khi mọi nấc tóm tắt đều tắt thì không ghi. (cross-layer)
- AC-3: Given một bảng ca viết trước cho bộ kiểm câu — mỗi mã bỏ (`nguon-ngoai-goi`, `so-lech`, `sai-chieu`, `noi-ve-nguoi`, `tu-cam`, `trung-cau`) một câu đỏ và một câu lành cùng dựng cảnh, cộng các dạng số khó (1,5; 12%; 3 triệu; «mười hai»; ngày dd/mm của nguồn; số là chênh lệch hay tiến độ do mã tính; số kiểu Anh chép từ ghi chú: 1.5, 1,200, 3k, 12.5%), When kiểm, Then câu lành qua, mỗi câu đỏ bị bỏ với đúng mã; And When một bản có số câu bị bỏ vượt 30% hoặc không còn câu nào, Then trạng thái của bản là `can-xem`, còn không thì `hien`.
- AC-4: Given một việc `okr-tom-tat-tuan` đang chạy của một phòng ban trong bộ mẫu, When subagent gọi `nop_tom_tat` với câu lành và câu đỏ trộn nhau, gọi lần thứ hai, và khi một phiên của việc góp ý gọi `nop_tom_tat`, Then lần đầu ghi đúng một hàng `OkrTomTat` cho (chu kỳ, phòng, tuần) với câu còn lại, câu bị bỏ kèm mã, `soCauBo`, `trangThai` và `nac` khớp bộ kiểm; lần hai và lần sai việc bị từ chối không ghi gì; việc đóng bằng mã `da-nop`; gói ngữ cảnh chỉ chứa Mục tiêu công khai đã công bố của đúng phòng đó trong chu kỳ, và không chứa họ tên thành viên nào; tập tool sống của subagent đúng bằng `nop_de_xuat` và `nop_tom_tat`. (cross-layer)
- AC-5: Given bản tóm tắt nấc bật trạng thái `hien`, một bản `can-xem`, một bản chế độ ẩn, và người xem {thành viên phòng, Trưởng phòng ban, thành viên phòng khác, vai «chỉ OKR», quản trị}, When gọi `okr.troLyTomTat` qua tRPC và qua REST cho từng phòng, Then chỉ bản nấc bật trạng thái `hien` được trả, cho mọi người là thành viên, với câu kèm dữ liệu từng nguồn (KR, ngày, giá trị, mức tự tin, ghi chú) bằng đúng hàng `OkrCheckIn` được dẫn; bản `can-xem`, bản ẩn và phòng ở nấc tắt trả không có bản; And When nguồn của một câu thuộc Mục tiêu người xem không xem được, lần cập nhật được dẫn đã mất, hoặc giá trị của lần cập nhật được dẫn trong kho đã khác số trong câu, Then câu đó không được trả cho người đó mà các câu khác vẫn còn; ma trận viết trước, số khẳng định bằng số ô × hai đường. (cross-layer)
- AC-6: Given khối Tóm tắt tuần trên bảng họp tuần, When đi qua mọi trạng thái của bảng trạng thái trong thiết kế (đang tải; có câu; thẻ trích dẫn mở một và nhiều nguồn; đang soạn; chưa có cập nhật; lọc hết; đã phản hồi; lỗi) ở 1440 và 390, Then mỗi trạng thái hiện đúng chữ và điều khiển của bảng, nhãn trích dẫn mở được bằng bấm, Enter và Space và đóng bằng Esc, thẻ hiện đúng giá trị của nguồn, không trạng thái nào tràn ngang, khối không có ở bộ phận, OneHub và người, và đang soạn ngừng hỏi lại khi rời bảng; And When `okr.troLyTomTat` được gọi lúc việc của tuần còn chờ xả hay đang chạy, lúc tuần không có Cập nhật tuần nào, và cho người xem không xem được nguồn nào, Then API trả lần lượt cờ đang soạn, cờ chưa cập nhật, và một bản có danh sách câu rỗng (khác với không có bản), để màn vẽ đúng ba trạng thái đó. (cross-layer)
- AC-7: Given bộ OKR mẫu, tóm tắt bật cho một phòng ban và model thật có ZDR, When việc xếp chạy và hàng được xả, rồi Trưởng phòng ban mở bảng họp tuần của phòng mình, bấm nhãn trích dẫn của từng câu, bấm «Xem diễn biến KR», và bấm «Hữu ích», Then khối hiện các câu của bản vừa ghi; mỗi thẻ trích dẫn hiện đúng giá trị, mức tự tin và ghi chú của hàng `OkrCheckIn` được dẫn đọc lại từ kho; «Xem diễn biến KR» mở ngăn Mục tiêu ở tab Diễn biến của đúng KR đó; có đúng một hàng phản hồi của người đó; And When một phòng ban khác ở chế độ ẩn, Then bảng họp tuần của phòng đó không có khối, còn quản trị thấy bản của nó ở màn Sức khoẻ. (cross-layer)
- AC-8: Given một bản tóm tắt đang hiện, When một người bấm «Hữu ích», bấm lại «Không hữu ích», và một người không xem được bản gọi thủ tục phản hồi, Then có đúng một hàng `OkrTomTatPhanHoi` cho người đó mang giá trị cuối; người không xem được bị từ chối và không có hàng nào. (cross-layer)
- AC-9: Given một buổi sáng có bản tóm tắt nấc bật trạng thái `hien` ghi trong cửa sổ sự kiện của tin, và các ô viết trước: Trưởng phòng ban, thành viên thường, Trưởng phòng ban đã tắt dòng, bản `can-xem`, bản chế độ ẩn, bản ghi ngoài cửa sổ, người đồng thời nhận hai dòng báo ngân sách AI, người chỉ có dòng tóm tắt, When nhắc buổi sáng dựng và gửi tin cho từng người, Then chỉ Trưởng phòng ban chưa tắt nhận dòng «Tóm tắt tuần <Phòng> · <n> KR đáng bàn» có đường mở tới Họp tuần của đúng phòng đó (cách xem họp tuần, đơn vị là phòng đó, đúng chu kỳ); n bằng số KR có lý do theo `lyDoCua` trừ các KR đã có dòng «KR im» trong cùng tin; mỗi tin có tối đa hai dòng báo AI, đứng sau mọi việc của người; người chỉ có dòng tóm tắt vẫn nhận tin; `payload.daGui` mang mục `okr-tom-tat`; chữ của dòng không chứa câu nào của bản tóm tắt. (cross-layer)
- AC-10: Given trang Nhắc buổi sáng, When Trưởng phòng ban mở trang, tắt công tắc «Dòng Tóm tắt tuần của Trợ lý OKR», tải lại, và bật lại; và When thành viên không làm trưởng phòng nào mở trang, Then công tắc hiện với Trưởng phòng ban, trạng thái đọc lại qua API khớp lần bấm, `NotificationPreference.dongTroLyOkr` của đúng người đó đổi theo; thành viên thường không thấy công tắc. (cross-layer)
- AC-11: Given tuần có bản ở mọi trạng thái và cả hai nấc, When quản trị chương trình mở màn Sức khoẻ chương trình và mở một bản, và When thành viên, Trưởng phòng ban hay vai «chỉ OKR» gọi `okr.troLyTomTatQuanTri` qua tRPC và REST, Then khối Tóm tắt tuần của Trợ lý OKR liệt kê mọi phòng có việc tuần đó với nấc, trạng thái, số câu, số câu bị bỏ và số phản hồi hữu ích/không bằng đúng kho; ngăn một bản hiện câu còn lại và câu bị bỏ kèm lý do; mọi vai khác nhận 403 và màn không có khối. (cross-layer)
- AC-12: Given một kho có bản tóm tắt gieo sẵn với số đã biết ở hai nấc (câu còn lại, câu bị bỏ theo mã, phản hồi, tin nhắc đã gửi có dòng tóm tắt, vết mở bảng họp tuần, người đã tắt dòng, sổ chi phí), When chạy các thước ở `rang/` (câu bị bỏ, số lệch lọt qua, mở sau nhắc, hữu ích, tắt dòng, chi phí tóm tắt), Then mỗi thước in đúng số đã biết, tách nấc bật và ẩn; thước số lệch lọt qua dùng bộ trích số riêng không nhập bộ kiểm, báo 0 trên một bản có câu lành chứa mỗi dạng số hợp lệ của tập tham chiếu, và báo đúng câu có số lệch khi một câu lệch được gieo thẳng vào kho; vết mở bảng họp tuần mà thước đọc do đúng thủ tục mở bảng của ứng dụng ghi. (cross-layer)
- AC-13: Given một lượt tóm tắt chạy trong phiên con không mang thuộc tính phiên, When sổ chi phí ghi các bước của phiên gốc và phiên con, Then mọi bước của lượt đó thuộc nhóm `okr.tom-tat` (không `okr.de-xuat`) và nối được về việc qua `taskId` hay phiên cha; And When chi tiêu tháng của Trợ lý OKR chạm trần, Then việc tóm tắt đang chờ đóng `khong-chay:het-tran-thang` mà không mở phiên. (cross-layer)
- AC-14: Given bộ OKR mẫu nạp ở hai mốc ngày và tóm tắt bật cho mọi phòng ban, When chạy eval Tóm tắt với model thật có ZDR và judge `zai/glm-5.2-fast` có ZDR, Then trên mọi bản của cả hai mốc: 0 số lệch theo bộ trích số độc lập; câu bị bỏ ≤ 10% tổng số câu; mọi KR có lý do «tụt» được ít nhất một câu còn lại dẫn tới; không câu nào chứa họ tên thành viên; mọi `defineEval` có judge khai ZDR; điểm judge «đúng ý nguồn» được in ra kèm từng bản.
- AC-15: Given `CONTEXT.md`, `docs/api.md`, `docs/agent.md` và diff của lượt, When đọc, Then `docs/api.md` §OKR nói ba thủ tục mới, ai gọi được và luật lọc lúc hiện; `docs/agent.md` nói lịch tóm tắt tự nối theo ngày và liệt kê tệp của hãng lượt này chạm; `CONTEXT.md` mục Tóm tắt tuần khớp hành vi; và diff giữ luật kho — trí khôn ở `apps/agent`, khuôn parse ở biên trong `packages/validation`, không chú thích trong mã, hằng tinh chỉnh ở một tệp cấu hình mỗi khu, thành phần mới ở `packages/ui`. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — vòng đời một bản:** xếp lịch · dựng gói · kiểm & ghi · hiện · báo trong nhắc · phản hồi · đo  [thước CE: trình tự §4.6 thiết kế 12; bảng số đo §4.9]
- **Trục B — ai × nấc:** thành viên phòng · Trưởng phòng ban · người ngoài phòng · vai «chỉ OKR» · quản trị chương trình · máy — × tắt · chế độ ẩn · bật  [thước CE: §4.7 thiết kế 12; AC «một phép đo mỗi đường vào» của `vai-chi-okr`]
- **Trục C — hình dạng tuần:** có KR đáng bàn · có cập nhật không đáng bàn · không cập nhật · Mục tiêu giới hạn · hai chu kỳ chồng · ghi chú trộn Anh–Việt (số kiểu Anh trong ghi chú: AC-3)  [thước CE: kịch bản của bộ OKR mẫu, `apps/api/scripts/okr-mau/dien-bien.ts`]
- **Trục D — kiểu hỏng:** số lệch · chiều sai · nguồn ngoài gói hay rò quyền · nêu người · chết im · trùng · vượt tiền  [thước CE: preset risk-premortem; Ngoài-32/33 của 9a]
- Chân ngành: tóm tắt đặt ở đầu trang họp [NGÀNH: WorkBoard AI memo]; tóm tắt theo lịch [NGÀNH: Tability scheduled prompts]; chế độ ẩn trước khi bật [NGÀNH: shadow deployment].
- [GIẢ ĐỊNH] Hạng T2, không migration: nấc và câu bị bỏ ghi trong cột Json `cau`.
- [GIẢ ĐỊNH] Việc xếp chạy mỗi ngày 06:00 giờ VN, chỉ tóm tắt chu kỳ có ngày cập nhật là hôm qua; tự nối ngày kế, nhịp dispatch nối lại khi đứt.
- [GIẢ ĐỊNH] Chỉ phòng ban có tóm tắt; gói chỉ Mục tiêu công khai.
- [GIẢ ĐỊNH] Một lần nộp; câu trượt bộ kiểm bị bỏ, không nộp lại.
- [GIẢ ĐỊNH] Trích dẫn mở bằng bấm, hiện lần cập nhật gốc và lối «Xem diễn biến KR»; không tô tuần trong Diễn biến.
- [GIẢ ĐỊNH] Dòng báo chỉ tới Trưởng phòng ban; công tắc tắt dòng chỉ hiện với họ.
- [GIẢ ĐỊNH] Bản «cần xem» và bản ẩn chỉ quản trị chương trình thấy, ở màn Sức khoẻ.
- [GIẢ ĐỊNH] Chốt eval bằng mã; judge chỉ in điểm; hiệu chỉnh judge với chủ kho dời tới trước khi bật.

## Đường đo

- Thước: câu bị bỏ ≤ 10% (ba tuần chế độ ẩn, điều kiện bật), CHẾT > 30% hai tuần liền · số từ: `OkrTomTat` — `soCauBo` trên (số câu còn lại + `soCauBo`) theo tuần và nấc, `rang/cau-bi-bo.sql` · bảo đảm bởi: AC-3, AC-4, AC-12
- Thước: 0 số lệch lọt qua · số từ: bộ trích số độc lập chạy trên mọi câu còn lại của mọi `OkrTomTat`; một số là lệch khi nó không bằng giá trị nào trong tập tham chiếu của các lần cập nhật được dẫn — giá trị lần đó, giá trị lần ngay trước của cùng KR, chênh lệch hai giá trị đó, khởi điểm, đích, tiến độ phần trăm tính từ khởi điểm–đích–giá trị, và ngày dd/mm của lần được dẫn — tính lại từ kho, không đọc gói và không nhập bộ kiểm; `rang/so-lech-lot.mjs` · bảo đảm bởi: AC-3, AC-5, AC-12, AC-14
- Thước: ≥ 50% lượt Trưởng phòng ban nhận dòng báo có mở bảng họp tuần trong ngày · số từ: `AgentTask` loại `nhac-ke-hoach` có mục `okr-tom-tat` trong `payload.daGui` nối vết `mo-hop-tuan` cùng người, cùng phòng, cùng ngày, `rang/mo-sau-nhac.sql` · bảo đảm bởi: AC-9, AC-12
- Thước: ≥ 60% phản hồi «hữu ích», CHẾT < 30% sau ≥ 20 phản hồi · số từ: `OkrTomTatPhanHoi`, `rang/huu-ich.sql` · bảo đảm bởi: AC-8, AC-12
- Thước: tắt dòng báo ≤ 10% Trưởng phòng ban nhận và không tăng, CHẾT > 30% · số từ: `NotificationPreference.dongTroLyOkr` của người đang là Trưởng phòng ban, `rang/tat-dong.sql` · bảo đảm bởi: AC-10, AC-12
- Thước: chi phí tóm tắt ≤ 1 US$ mỗi tháng · số từ: `AiChiPhi` nhóm `okr.tom-tat` theo tháng giờ VN, `rang/chi-phi-tom-tat.sql` · bảo đảm bởi: AC-12, AC-13

## Out of scope

- Tóm tắt cấp bộ phận, OneHub, Mục tiêu cá nhân — hạng mục T.
- Hiệu chỉnh judge Tóm tắt với chủ kho — trước khi bật, trên ca thật.
- Tô đúng tuần trong Diễn biến KR khi mở từ trích dẫn.
- Nộp lại khi câu trượt bộ kiểm.
- Gửi tóm tắt vào kênh Slack của đơn vị; chữ model trong tin Zalo hay Slack.
- Cảnh báo KR trượt — lượt 10.
- Bật cho người dùng — việc của chủ kho sau ba tuần chế độ ẩn trên dữ liệu thật.

## Notes

- E17 có thêm chốt «mọi việc tóm tắt của lượt đo đóng `da-nop`». Phòng không có gì để nói — không có Cập nhật tuần nào trong 7 ngày — không bao giờ có việc, nên một việc đóng khác `da-nop` là Trợ lý hỏng hay không nộp, không phải phòng im lặng.
- Chi phí tóm tắt = bước của Trợ lý (nhóm `okr.tom-tat`) cộng bước chuyển tiếp của phiên gốc (nhóm `okr.chuyen-tiep`) nối qua mã việc — phán quyết R13 (`d-20260930T163030Z-11`). Bước chuyển tiếp giữ nhóm của nó như 9b; `rang/chi-phi-tom-tat.sql` cộng cả hai.

## Iterations
