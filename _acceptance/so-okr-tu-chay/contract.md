---
schema_version: 1
feature: Số OKR tự chảy — KR của khối kinh doanh lấy số từ danh mục chỉ số CRM có định nghĩa cố định; mỗi ngày chụp giá trị thành lịch sử không đổi; bấm vào con số ra danh sách bản ghi đằng sau; KR ngoài CRM nhận số qua khoá API và Google Sheets
slug: so-okr-tu-chay
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-26T14:45:59Z
design_doc: docs/superpowers/specs/2026-09-26-so-okr-tu-chay-design.md
---

# Acceptance Contract: so-okr-tu-chay

## Context

Lượt 3–5 (#140, #153, #157) cho đặt, cập nhật tuần và xem OKR, nhưng mọi số KR do
người gõ tay; cột nguồn KR có «tay · crm · api» từ lượt 3 mà chỉ nhận «tay». Lượt
này thêm danh mục bảy chỉ số CRM có định nghĩa cố định, hai bảng mới ở cuối
`schema.prisma` (cấu hình nguồn của KR, lịch sử bản chụp chỉ thêm), việc chụp mỗi
ngày trên nhịp dispatch của tác tử, ngăn «Số của KR» mở bản ghi đằng sau con số,
thủ tục ghi số bằng khoá API, và đọc ô Google Sheets bằng tài khoản dịch vụ.

Source input: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 6» (DO-01…05, KR-04, KR-05 tự
đo và API), mục 9 (NG-04, NG-05) · `_acceptance/so-okr-tu-chay/opportunity.md` ·
`CONTEXT.md` (KR, Cập nhật tuần, Mức tự tin, Chốt) · `docs/currency.md` · prompt
phiên điều phối 2026-09-26.

## Criteria

- AC-1: Given danh mục `CHI_SO_OKR` trong `@crm/validation/okr-chi-so`, When đọc danh mục và parse đầu vào nguồn, Then danh mục có đúng bảy mã (`thoa-thuan-chot-duoc`, `thoa-thuan-moi`, `goi-hen-duoc`, `buoc-xong-dung-han`, `ghi-danh-dat-bac`, `form-thanh-ca-nhan`, `email-gui-ra`), mỗi mã khai đơn vị, cột ngày quyết định kỳ, cách quy công, loại bản ghi và các phạm vi nhận, đúng bảng mục 2 của thiết kế; And đầu vào mang mã lạ, phạm vi lạ, `ghi-danh-dat-bac` thiếu bậc hay bậc lạ, trường thừa (một biểu thức, một tên cột) bị từ chối với câu ghim; And nhãn và định nghĩa một dòng của bảy mã có vi và en khác nhau.
- AC-2: Given một bộ gieo có hai bộ phận, ba phòng ban, năm người có phòng ban chính, và cho mỗi chỉ số các bản ghi trong kỳ, ngoài kỳ, đúng ranh giới ngày giờ Việt Nam (23:59 và 00:00), đã lưu trữ, và bản ghi không đủ điều kiện (thoả thuận `CLOSED_LOST`, bước xong trễ hạn, cuộc gọi không hẹn được, form chưa xếp, thư từ địa chỉ không phải thành viên), When `demChiSo` và `banGhiChiSo` chạy cho bảy chỉ số × bốn phạm vi (toàn công ty, một bộ phận, một phòng ban, một người) và bốn bậc của ghi danh, Then mỗi số bằng ma trận viết trước và bằng số dòng danh sách của cùng lời gọi; And bản ghi đã lưu trữ, ngoài kỳ, không đủ điều kiện không có mặt; And phạm vi bộ phận gồm mọi phòng ban con; And form của cá nhân chưa có người phụ trách chỉ vào phạm vi toàn công ty.
- AC-3: Given người sửa được một KR và mục tiêu nháp, When gọi `okr.datNguonKr` với nguồn CRM (chỉ số, phạm vi, bậc), khoá API, Google Sheets (đường dẫn, ô) rồi về tay, Then mỗi lần đọc lại từ cơ sở dữ liệu thấy `source` của KR và dòng cấu hình nguồn đúng như gửi, về tay thì dòng cấu hình không còn và lịch sử bản chụp còn nguyên; And mỗi lần để đúng một dòng vết `doi-nguon` trước → sau; And với mục tiêu đã công bố: KR tay thêm được số đo cạnh (`source` vẫn `tay`), còn đổi hay gỡ nguồn của KR nguồn máy bị từ chối với câu ghim và không dòng nào đổi; And phạm vi trỏ đơn vị không tồn tại hay đã lưu trữ, người không phải thành viên, đường dẫn không phải `docs.google.com/spreadsheets`, ô sai khuôn, Sheets khi chưa cắm khoá, pha «Chấm điểm» hay «Đã đóng», người không sửa được KR — bị từ chối với câu ghim; And `updateKeyResult` từ chối đổi `currentValue` của KR nguồn máy ở mọi pha, `removeKeyResult` từ chối KR đã có bản chụp.
- AC-4: Given KR nguồn CRM, KR đo cạnh, KR nguồn Sheets, KR của mục tiêu đã bỏ, KR của chu kỳ ở pha khoá và KR mà hôm qua nằm ngoài kỳ, When nhịp dispatch của tác tử chạy lúc 00:05 giờ Việt Nam rồi chạy lại hai lần trong cùng ngày, Then lượt đầu ghi đúng một dòng bản chụp cho mỗi KR đủ điều kiện với `ngay` là hôm qua và giá trị bằng `demChiSo` cho khoảng từ đầu kỳ tới hết hôm qua (hoặc bằng số đọc từ ô với Sheets giả), `currentValue` của KR nguồn máy bằng giá trị đó, `currentValue` của KR đo cạnh không đổi; And KR không đủ điều kiện không có dòng; And hai lượt sau không thêm dòng nào; And một bộ 200 KR nguồn CRM chụp xong trong một nhịp dưới 20 giây với số câu truy vấn mỗi KR không đổi theo số KR, và một bộ trộn có 20 KR Sheets khi Google treo vẫn xong nhịp dưới 60 giây, số lần đọc không quá trần mỗi nhịp, KR chưa đọc dời sang nhịp sau; And không thủ tục, dịch vụ, câu SQL thô hay khoá ngoại lan xoá nào sửa hay xoá dòng bản chụp — khoá ngoại tới KR là `RESTRICT` — và dòng bản chụp chỉ được tạo ở nhịp chụp của tác tử (`apps/agent/agent/lib/okr-chup.ts`), `chupKrCrm` (`packages/db/src/okr-chi-so.ts`) và `ghiSoKr` (`apps/api/src/okr/okr-so.service.ts`); ngoại lệ duy nhất là công cụ dev `okr:mau` (`apps/api/scripts/okr-mau/nap.ts`: `napTrong` tạo, `xoaTrong` xoá bản chụp của KR mẫu), được miễn chỉ khi bốn chốt còn đứng — lối vào chặn bằng `kiemDuocNap` (chỉ máy cục bộ), `kiemOkrThat` (kho chưa có OKR thật) gọi trước mọi lần nạp và xoá, lệnh xoá lọc theo `keyResultId`, không mã nào ngoài công cụ nhập nó; một chốt vỡ thì miễn mất.
- AC-5: Given KR nguồn CRM đã có bản chụp ngày D và chu kỳ đã qua ngày cuối, When sau đó một thoả thuận đã đếm bị lưu trữ, một thoả thuận chốt được mở lại, người được quy công chuyển sang phòng ban khác, đồng tiền báo cáo đổi và `rerateAll` chạy, rồi nhịp dispatch chạy tiếp, Then dòng bản chụp ngày D và `okr.lichSuSo` trả đúng giá trị cũ; And `currentValue` của KR thuộc chu kỳ đã qua ngày cuối không đổi; And `okr.banGhiChiSo` cho ngày D trả cờ lệch với cả hai số (đã chụp, tính lại lúc này).
- AC-6: Given KR nguồn CRM có lịch sử ba ngày, When gọi `okr.banGhiChiSo` không ngày, với một ngày trong lịch sử, và theo trang, bằng phiên của quản trị, trưởng đơn vị, thành viên thường và vai «chỉ OKR», Then ba vai đầu nhận định nghĩa, khoảng ngày, số đã chụp, số tính lại, cờ lệch và danh sách bản ghi mà số dòng (cộng các trang) bằng số tính lại, mỗi dòng mang loại, mã, tên, ngày; And khi dữ liệu không đổi sau khi chụp thì số đã chụp bằng số tính lại và cờ lệch tắt; And vai «chỉ OKR» nhận từ chối với câu ghim, đọc được `okr.lichSuSo` và `okr.objective` (số) nhưng không đọc được danh sách; And số đã chụp và danh sách tính lại dùng định nghĩa chép trong dòng chụp của ngày đó — đổi phạm vi của KR mục tiêu nháp sau khi chụp không bật cờ lệch và không đổi phạm vi của danh sách ngày cũ; And KR nguồn API trả các lần ghi (ngày, số, người cầm khoá), không danh sách bản ghi. (cross-layer)
- AC-7: Given sheet mục tiêu có KR tay, KR nguồn CRM có lịch sử, KR đo cạnh và KR nguồn API, When mở sheet trong trình duyệt thật của cây đang xét rồi bấm vào con số của KR nguồn CRM, chọn một ngày khác trong lịch sử, bấm một bản ghi trong danh sách rồi «Quay lại», Then bảng KR có dấu nguồn cạnh số, KR đo cạnh hiện «<số tay> tay · <số máy> máy»; ngăn «Số của KR» chồng lên sheet mục tiêu (URL thêm `record=so-kr:<id>`) với tên chỉ số, phạm vi, khoảng ngày, số đã chụp, bảng bản ghi và bảng lịch sử; chọn ngày đổi danh sách và URL; bấm bản ghi mở sheet của nó, «Quay lại» về ngăn số; And ngăn có trạng thái đang tải, rỗng theo chỉ số, lệch, lỗi có «Thử lại» (bấm tải lại được); And vai «chỉ OKR» thấy số không bấm được; And ảnh 1440 và 390 không tràn ngang, chữ người nhập mang `translate="no"`. (cross-layer)
- AC-8: Given người sửa được KR mở hộp thoại KR, When chọn «Chỉ số CRM», chỉ số, phạm vi và bậc, rồi lưu; mở lại chọn «Khoá API»; rồi «Google Sheets» với đường dẫn và ô, Then dòng xem trước hiện số đếm tới lúc này bằng số `okr.xemTruocChiSo` trả, sau lưu cơ sở dữ liệu có cấu hình đúng lựa chọn; nguồn API hiện mã KR có nút chép và lệnh mẫu; nguồn Sheets hiện email tài khoản dịch vụ, trạng thái «đang đọc thử» rồi «đọc được <số> lúc <giờ>» hoặc nguyên nhân có tên kèm «Đọc lại»; And khi chưa cắm khoá Sheets thì không có lựa chọn Sheets và có một dòng nói quản trị chưa cắm; And KR của mục tiêu đã công bố hiện ô nguồn khoá kèm chú thích và (KR tay) nút «Thêm số đo cạnh». (cross-layer)
- AC-9: Given KR nguồn API do người P phụ trách, khoá API của P, khoá của một thành viên không sửa được KR, và khoá của một người vai «chỉ OKR» phụ trách KR khác nguồn API, When gọi `POST /rest/okr/key-results/{id}/value` với `x-api-key`, Then khoá của P ghi được: bảng bản chụp có dòng `api` với người cầm khoá, `currentValue` đổi, một dòng vết `ghi-so-api`, hai lần ghi trong ngày là hai dòng và `lichSuSo` lấy dòng mới hơn cho ngày đó; khoá vai «chỉ OKR» ghi được KR của mình; And khoá không sửa được KR → 403, không khoá → 401, KR không nguồn API → 400 câu ghim, giá trị trái kiểu KR (phần trăm ngoài 0–100, mốc khác 0/1) → 400, pha khoá → từ chối, hôm nay đã qua ngày cuối của chu kỳ dù pha chưa chuyển → từ chối; không dòng nào được ghi ở mọi ca từ chối. (cross-layer)
- AC-10: Given hai biến khoá Sheets đã cắm và một Google giả đứng thay `oauth2.googleapis.com` và Sheets API, When lưu nguồn Sheets cho một KR rồi tác tử chạy nhịp, và khi Google trả 403, 404, ô chữ, ô trống, Then API chỉ ghi một hàng `AgentTask` loại `okr-doc-sheet` và gọi dispatch, không gọi Google; tác tử ký JWT kiểm được bằng khoá công khai, đọc ô, ghi trạng thái đọc (giờ, số) mà không thêm dòng lịch sử; nhịp 00:05 ghi dòng lịch sử `bang-tinh`; mỗi ca lỗi ghi đúng nguyên nhân có tên (`chua-chia-se`, `khong-thay`, `khong-phai-so`, `o-trong`), không thêm dòng lịch sử, và nhịp kế trong khoảng thử lại không gọi Google lần nữa; And khi thiếu một trong hai biến: `okr.chiSo` trả nguồn Sheets tắt, tác tử không gọi Google và không ném; And nhật ký không chứa giá trị ô, khoá hay đường dẫn đầy đủ. (cross-layer)
- AC-11: Given người phụ trách một KR nguồn CRM, một KR nguồn API, một KR đo cạnh và một KR tay trong chu kỳ đang chạy, When mở «Cập nhật tuần của tôi» và gửi một lô gồm cả bốn, trong đó giá trị gửi cho hai KR nguồn máy khác số máy, Then `okr.capNhatTuan` trả nguồn và số máy mới nhất của mỗi KR; màn khoá ô giá trị của hai KR nguồn máy với chữ «Số từ CRM · <ngày>» / «Số từ API · <ngày>», ô của KR đo cạnh điền sẵn số máy và sửa được, và vẫn đòi mức tự tin và ghi chú; lần cập nhật đọc lại từ cơ sở dữ liệu của hai KR nguồn máy mang giá trị máy (không phải giá trị gửi) và `currentValue` không đổi, còn KR đo cạnh và KR tay đi như lượt 4 (giá trị người gửi thắng). (cross-layer)
- AC-12: Given kho đo có dữ liệu gieo và một kỳ khai trước, When chạy `rang/tin-so.mjs`, Then năm chỉ số (`thoa-thuan-chot-duoc`, `thoa-thuan-moi`, `goi-hen-duoc`, `buoc-xong-dung-han`, `email-gui-ra`) tính bằng `demChiSo` và bằng câu đếm độc lập trong `rang/dem-doc-lap.sql` (không nhập mã danh mục) lệch không quá bảng khai trước `rang/lech-khai-truoc.md` và script in bảng so; And `rang/ty-le-kr-co-nguon.sql` chạy trên dữ liệu sinh bằng `okr.datNguonKr` và `okr.guiCapNhat` (hai bộ phận truyền vào, năm KR đã công bố: hai nguồn CRM hiệu lực, một đo cạnh CRM, hai tay; một KR của bộ phận khác có nguồn CRM; KR đo cạnh có bốn lần cập nhật tuần, ba lần bằng số máy) trả ba cột tách riêng đúng 2/5, 1/5 và 3/4.
- AC-13: Given bốn vai workspace, When gọi mọi thủ tục mới (`chiSo`, `xemTruocChiSo`, `datNguonKr`, `lichSuSo`, `banGhiChiSo`, `ghiSoKr`) qua tRPC và qua khoá API, Then ma trận phạm vi của `vai-chi-okr` cập nhật đúng danh sách mới và vẫn xanh: vai «chỉ OKR» gọi được năm thủ tục, riêng `banGhiChiSo` bị từ chối theo luật dữ liệu đối tác; ba vai kia gọi được cả sáu (ghi theo quyền bản ghi).
- AC-14: Given các tệp lượt này thêm hoặc sửa, When chạy cổng thiết kế tĩnh, bộ quét «Dấu hiệu vẽ tay» và soi mã, Then không vi phạm P0; không `<table`, `<h1`, `<h2`, chấm `size-2 rounded-full`, `divide-y`, hộp `rounded-lg border` tự dựng, `navigator.clipboard`, `AlertDialog` trong `apps/app`; `CopyValue` nằm trong `packages/ui` và chỗ gọi cũ ở Cài đặt dùng bản đó; không chú thích mã mới, không `Record<string, unknown>`, không `useEffect` trần trong tệp mới; `apps/api` không gọi `googleapis.com` và không ghi `okrSoChup` ngoài `ghiSoKr` (trừ công cụ dev `okr:mau` trong miễn của AC-4); hằng số chỉnh được nằm ở `OKR_SO`; biến mới có trong `.env.example` và `env.validation.ts`; chữ mới có vi và en khác nhau. (judgment)
- AC-15: Given cơ sở dữ liệu có OKR, cập nhật tuần, cây tổ chức và thoả thuận từ trước lượt này, When chạy `migration` của lượt này, Then mọi câu lệnh chỉ tạo bảng, chỉ mục (kể cả chỉ mục duy nhất một phần), khoá ngoại mới; không `UPDATE`, `DELETE`, `DROP`, `ALTER COLUMN`, không cột mới trên bảng có sẵn; hai model mới là một dãy liền ở cuối `schema.prisma`; And dữ liệu cũ đọc lại nguyên vẹn, mọi KR cũ vẫn `source = tay`.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — nguồn số:** tay · chỉ số CRM · khoá API · Google Sheets  [thước CE: `NGUON_KR` + lộ trình mục 5; NGÀNH: Perdoo, Profit.co] → AC-3, AC-4, AC-9, AC-10, AC-11
- **Trục B — vòng đời số:** đặt nguồn · đo · chụp · hiện và bấm vào · vào cập nhật tuần · đổi giữa kỳ · khép kỳ  [thước CE: bốn gạch «Trong phạm vi» của lộ trình] → AC-2…AC-8, AC-11
- **Trục C — người:** người phụ trách KR · trưởng đơn vị · quản trị · thành viên thường · vai «chỉ OKR» · máy cầm khoá  [thước CE: `OkrAccessService`, `WORKSPACE_ROLES`] → AC-3, AC-6, AC-9, AC-13
- **Trục D — chỉ số × phạm vi:** bảy chỉ số × toàn công ty · bộ phận · phòng ban · người  [thước CE: lộ trình «tham số theo người, phòng ban, bộ phận»; bảy bảng nguồn] → AC-1, AC-2
- Cross-cutting: vết trên mọi ghi (AC-3, AC-9); khoá theo pha (AC-3, AC-9); ba trạng thái màn, 390/1440, vi/en, `translate="no"` (AC-7, AC-8); trí khôn ở tác tử và khoá tuỳ chọn không ném (AC-10, AC-14); `migration` chỉ thêm (AC-15); đường đo (AC-12).
- Chân ngành: nguồn tiến độ Google Sheets chọn bảng tính, trang, ô [NGÀNH: Perdoo]; mẫu cập nhật tự điền số mới nhất, người vẫn ghi [NGÀNH: Tability]; đồng bộ nguồn ngoài hằng ngày [NGÀNH: Profit.co].
- [GIẢ ĐỊNH] Kỳ đo = chu kỳ của mục tiêu, số cộng dồn từ ngày đầu chu kỳ tới hết ngày chụp giờ VN (giả định 2 của hồ sơ cơ hội).
- [GIẢ ĐỊNH] Theo phòng ban/bộ phận = phòng ban chính của người được quy công tại lúc đếm; bản chụp đã ghi không tính lại (giả định 3).
- [GIẢ ĐỊNH] Bản chụp ngày D ghi ở nhịp đầu sau 00:00 ngày D+1 giờ VN; số «hôm nay» chỉ có ở dòng xem trước và ngăn số (giả định 4).
- [GIẢ ĐỊNH] KR nguồn máy vẫn vào cập nhật tuần: số khoá theo máy, người ghi mức tự tin và ghi chú (giả định 5). KR đo cạnh: ô điền sẵn số máy, người sửa được — thêm sau phản biện context sạch, vì KR quý 4 chỉ gắn được số máy theo kiểu đo cạnh.
- [GIẢ ĐỊNH] Nguồn hiệu lực khoá khi công bố như khởi điểm; sau công bố chỉ thêm được số đo cạnh cho KR tay, tiến độ theo số tay tới hết kỳ (giả định 6, đọc chặt câu «số máy hiện cạnh số tay cho tới ranh giới kỳ»).
- [GIẢ ĐỊNH] Danh sách bản ghi tính lại theo định nghĩa lúc bấm cho đúng khoảng ngày của bản chụp; lệch thì nói ra; không lưu danh sách mã bản ghi trong bản chụp (giả định 7).
- [GIẢ ĐỊNH] Email gửi ra quy cho thành viên có email trùng `fromEmail`; thư từ bí danh không phải email thành viên không đếm (khai trong bảng lệch).
- [GIẢ ĐỊNH] Ghi danh đạt bậc quy cho người cầm trịch kế hoạch; form thành cá nhân quy cho người phụ trách cá nhân.

## Đường đo

- Thước: trước 2026-12-01, ≥ 50% KR đã công bố của khối kinh doanh trong chu kỳ quý 4 có nguồn CRM — tổng hai cột «nguồn hiệu lực CRM» và «đo cạnh CRM», vì KR quý 4 công bố từ 26/10, trước khi lượt này lên, và nguồn khoá khi công bố · số từ: `rang/ty-le-kr-co-nguon.sql` trên production với danh sách bộ phận chủ kho gọi tên · bảo đảm bởi: AC-3 (cấu hình nguồn đọc lại từ bảng), AC-12 (câu đếm ba cột có phép đo trên dữ liệu gieo)
- Thước: «có thôi đếm tay không» — tỷ lệ lần cập nhật tuần của KR đo cạnh mà giá trị bằng số máy, đọc cùng ngày 2026-12-01 (cột ba của cùng câu đếm) · bảo đảm bởi: AC-11 (ô điền sẵn số máy), AC-12
- Thước: phép thử tin số — năm chỉ số so với số đếm tay trên production, lệch không quá bảng khai trước · số từ: `rang/tin-so.mjs` chạy chỉ đọc trên production tuần đầu sau triển khai, cột số đếm tay do người ghi · bảo đảm bởi: AC-2 (định nghĩa đếm đúng), AC-12 (so với số đếm độc lập trên kho đo)

## Out of scope

- **Giá trị tiền của thoả thuận, chỉ số theo giai đoạn thoả thuận** — nghĩa chưa chốt trong từ điển; tiền cần luật `baseAmount` của `docs/currency.md`.
- **Trình dựng truy vấn tự do, chỉ số do người tự định nghĩa** — NG-04; thêm chỉ số là một vòng có hợp đồng.
- **Máy chọn mức tự tin hay viết ghi chú** — NG-05.
- **Kỳ đo tự chọn («tháng này», «tuần này»)** — giả định kỳ đo = chu kỳ.
- **Sửa, xoá hay tính lại bản chụp** — lịch sử chỉ thêm.
- **Ghi ngược Google Sheets, đọc Sheets bằng tài khoản Google của người dùng** — tài khoản dịch vụ chỉ đọc.
- **Đổi hay gỡ nguồn hiệu lực sau khi công bố** — kỳ sau đặt KR mới.
- **Cảnh báo khi số máy và số tay lệch** — AI-06, lượt 10.

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `AGENTS.md`, `docs/api.md` (tRPC, cầu REST, khoá API, OKR, phạm vi dữ liệu), `docs/agent.md` (hai làn, dispatch, nhắc buổi sáng, `capabilities`), `docs/currency.md`, `docs/telemetry.md` (lượt này không gửi sự kiện mới), `docs/design.md` (kể cả «Vẽ tay là bậc cuối»), `docs/connections.md`, `CONTEXT.md` (KR, Cập nhật tuần, Mức tự tin, Chốt, Giai đoạn thoả thuận, Ghi danh, Bậc, Chiến dịch); skill `web-design-guidelines` (khai ở `feature_loop.ui_standards_skill`); hồ sơ `dat-okr-trong-crm`, `cap-nhat-tuan-okr`, `toan-canh-okr`.
- Hạng T3: chạm `packages/db/prisma` (hai bảng mới) và `apps/agent` (việc mới trên nhịp dispatch) — có Cổng 1.5. Việc của tác tử khai trong bề mặt `api` (lớp máy chủ) vì kit chỉ đọc `api · cli · sdk · ui · mobile · docs · ci · config`.
- Thứ tự: vòng «Nợ sau lượt 5 OKR» gộp trước; S3 bắt đầu sau khi gộp lại `origin/onehub`, `bun install`, `prisma generate`.
- Hồ sơ đã ký có thể phải ghim lại: `vai-chi-okr` (danh sách thủ tục của ma trận), `cap-nhat-tuan-okr` (`guiCapNhat` thêm nhánh KR máy), `dat-okr-trong-crm` (hộp thoại KR thêm ô nguồn; `updateKeyResult`, `removeKeyResult` thêm từ chối), `khung-trang-cai-dat` hoặc hồ sơ giữ `copy-value.tsx` (chuyển vào `packages/ui`).
- Nền hạ tầng (`duong-nen.md`): `build_khong_cache` đỏ vì `bash -lc` nhận Node 22 — làn S4 chạy với tiền tố PATH Node 24 như lượt 5; hai dòng «THIEU merge-base» là khoá của hồ sơ khác.
- Cổng người do phiên điều phối ký theo uỷ quyền của Manh Phan ngày 2026-09-24; dòng ký ghi «Manh Phan — uỷ quyền phiên điều phối 2026-09-24».

- Sửa đổi 01/10/2026 (chủ kho chọn hướng a; hồ sơ `mien-so-chup-bo-okr-mau`): AC-4 và AC-14 thêm miễn cho công cụ dev `okr:mau`, vì hồ sơ `bo-okr-mau` (ký 28/09) đòi công cụ đó tạo và xoá bản chụp của KR mẫu. Lời hứa cho lịch sử số thật không đổi; thước E8 đo bốn chốt của miễn.

Known limits — Cổng Bằng chứng (Manh Phan 2026-09-27, định đoạt mục ngoài hợp đồng của vòng chấm 1; sổ d-20260926T230045Z-23 … -31):

- Ngoài-1 (`apps/api/src/agent/agent-trigger.service.ts`): Bấm 'Đọc lại' hoặc lưu lại nguồn Google Sheets nhiều lần liên tiếp cho cùng một KR có thể xếp thêm nhiều việc đọc trùng nhau, làm tốn thêm lượt gọi Google không cần thiết.
- Ngoài-2 (`apps/api/src/okr/okr-so.service.ts`): Khi việc đọc Google Sheets thất bại vì lỗi hệ thống, nhật ký chỉ ghi lại tên loại lỗi mà thiếu chi tiết để lần vết — đội vận hành có thể mất nhiều thời gian hơn để tìm nguyên nhân khi có sự cố.
- Ngoài-3 (`apps/api/src/okr/okr-so.contracts.ts`): Nếu sau này có người thêm một loại bản ghi mới vào danh mục chỉ số nhưng quên cập nhật đủ các nơi liên quan, màn xem danh sách bản ghi đằng sau con số có thể báo lỗi hệ thống thay vì hiển thị đúng dữ liệu.
- Ngoài-4 (`apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx`): Khi đổi một KR đang lấy số từ CRM sang loại chấm theo mốc hoặc phần trăm cùng lúc với đổi nguồn số trong một lần lưu, việc lưu sẽ báo lỗi và không lưu được gì cả — người dùng phải bấm lưu thêm một lần nữa mới xong.
- Ngoài-5 (`apps/agent/agent/lib/okr-sheets.ts`): Nếu khoá kết nối tới Google Sheets bị đổi hay hết hạn, lần đọc số kế tiếp luôn báo lỗi dù hệ thống vừa lấy được khoá mới thành công — người dùng phải bấm 'Đọc lại' thêm một lần nữa mới thấy số đúng.
- Ngoài-6 (`apps/agent/test/okr-chup.integration.spec.ts`): Bài kiểm cho việc chụp số OKR hằng ngày không thật sự chạy thử nhịp, chỉ đọc chữ trong mã nguồn — nếu việc chụp số ngừng chạy thật ngoài đời, hệ thống kiểm tra vẫn có thể báo 'đạt' và không ai biết số đã ngừng cập nhật.
- Ngoài-7 (`apps/api/test/okr-khoa-api.spec.ts`): Bài kiểm ghi số qua khoá API chỉ đếm số dòng được tạo mà không kiểm ai đứng tên là người ghi; nếu có lỗi gán nhầm người ghi số, việc kiểm tra hiện tại có thể không phát hiện ra.
- Ngoài-8 (`apps/api/test/okr-nguon.spec.ts`): Bài kiểm 'API không được gọi Google' chưa chứng minh được bẫy chặn có bắt được lời gọi thật; nếu sau này có đường gọi Google khác lọt qua bẫy, dữ liệu có thể vô tình gửi ra ngoài mà không ai phát hiện qua bài kiểm này.
- Ngoài-9 (`apps/api/test/vai-chi-okr.spec.ts`): Câu thông báo từ chối cho vai 'chỉ OKR' được bài kiểm so sánh với chính câu chữ lấy từ mã nguồn, nên nếu câu đó vô tình bị sửa sai hay để trống, bài kiểm vẫn báo đạt mà người dùng vẫn nhận thông báo sai.
