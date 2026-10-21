## Trong hợp đồng

- **Kiểm thẻ Beta trên Kanban đậu rỗng khi không tìm thấy thẻ**
  file: `_acceptance/sort-moi-truong/rang/do-man.mjs:372`
  severity: low
  AC: AC-7
  source: bugs
  detail: Hàm `doc_` trả về "" khi không có `[data-open-deal]` nào chứa "smtman Beta" (`?.parentElement?.textContent ?? ""`). Phép kiểm `!the.beta.includes(NHAN.NUMBER)` vì thế ĐẬU khi thẻ Beta vắng hẳn khỏi bảng, ví dụ khi một hồi quy làm rơi các bản ghi không có giá trị khỏi cột Kanban. Hàm `mo()` lại nuốt lỗi hết giờ của `waitForFunction` bằng `.catch(() => {})`, nên một lần tải dở cũng không làm phép kiểm này đỏ. Muốn bắt được thì phải kiểm thêm `the.beta !== ""` (thẻ có mặt) trước, rồi mới kiểm rằng thẻ không có dòng Số. AC-7 đòi trường trống thì thẻ không có dòng đó; phép đo ca Beta đậu cả khi thẻ vắng nên không chứng được vế này.

- **Hình dạng 4 (assertion âm-tính-một-mình): E7 không còn giữ trường đã lưu trữ ở đầu, nên phép kiểm "bỏ trường lưu trữ" không thể đỏ**
  file: `apps/api/test/sort-moi-truong.spec.ts:928`
  severity: medium
  AC: AC-7
  source: measurement
  detail: AC-7 và E7 đòi "một trường đã lưu trữ đứng đầu" ('smt_the_luu' đứng đầu, rồi lưu trữ). Test tạo `luu` ở position P = max+1 (dòng 892), lưu trữ nó (927), rồi gọi `datThuTu([an, so, ngay, ba])` (928). `datThuTu` lấy `fields.list("DEAL", false)`, tức danh sách đã bỏ trường lưu trữ, và `fields.reorder` chỉ đánh lại position cho các id được truyền vào: an=0, so=1, ngay=2, ba=3, các trường khác từ 4 trở đi. `luu` giữ nguyên P. Chỉ cần lúc tạo đã có từ hai trường DEAL trở lên thì P ≥ 2, mà đó chính là tình huống eval nói tới ("Trường DEAL của tệp khác có thể đang bật showOnTable"), và luôn đúng trong lượt `bun run test` đầy đủ vì các describe trước trong cùng tệp đã tạo hơn chục trường DEAL. Khi đó `luu` đứng sau so và ngay. Hai trường đầu bật showOnTable vẫn là {so, ngay} dù `tableValuesFor` có bỏ điều kiện `archivedAt: null` hay không. Phép so `khoa === {so, ngay}` (dòng 950) và `theo thu tu` (962) không có đối chứng rằng `luu` lẽ ra đã được chọn nếu chưa lưu trữ. Vế "trường lưu trữ bị loại" vì vậy không đỏ được. AC-7 nêu rõ một trường đã lưu trữ đứng đầu và chỉ hai trường chưa lưu trữ đầu tiên được trả; phép đo không dựng được tình huống đó.

- **Hình dạng 3 (lời hứa là quan hệ, phép đo chạy trên dữ liệu làm quan hệ đúng sẵn): luật hoà của Liên hệ và Công ty, cùng phép so 'phone' chuẩn với PHONE tự tạo, không được đo**
  file: `apps/api/test/sort-moi-truong.spec.ts:613`
  severity: medium
  AC: AC-2
  source: measurement
  detail: AC-2 hứa `sort=phone` "hoà theo lastName", và trường PHONE tự tạo cho "đúng thứ tự ấy". E2 ghi fixture có hai liên hệ cùng '0901…'. Sổ d-15 chọn luật hoà theo tên chính để tránh rủi ro "cùng một kiểu Điện thoại xếp khác nhau giữa cột chuẩn và cột tự tạo". Nhưng test đặt `SO = {T1: soCho(1), T2: soCho(2), T3: null, T4: soCho(4), T5: soCho(5)}` (613-619): bốn số khác nhau, không có cặp hoà nào. Vì vậy `PHONE_TANG/GIAM` (626-627) không đo luật hoà theo lastName. Phép so `hoa lech chuan` (642-646) cũng đúng sẵn: chuẩn sắp theo `[phone, lastName]`, còn tự tạo sắp theo `[text, lastName, firstName, id]`; khi giá trị đều khác nhau thì hai luật hoà không bao giờ được dùng. Các ca TEXT/NUMBER/DATE của Công ty và Liên hệ (529-585) cũng không bù được: cặp hoà T1 'Bình' (tạo trước) và T4 'An' (tạo sau) cho cùng thứ tự T4 trước T1 theo cả luật tên A→Z lẫn luật createdAt giảm dần đã bị d-15 thay. Phép đo nên không phân biệt được hai luật. Riêng DEAL được E1b bù (cặp chỉ số 3,4 và 13,14), nhưng hai loại COMPANY và CONTACT (lastName rồi firstName) thì không ô nào đo luật hoà. AC-2 hứa sort=phone hoà theo lastName và cùng luật với trường Điện thoại tự tạo; fixture không có cặp hoà nào.

- **Hình dạng 4 (âm tính không có đối chứng phân biệt): E3 so "bằng thứ tự mặc định" trên fixture mà thứ tự mặc định trùng thứ tự tên A→Z**
  file: `apps/api/test/sort-moi-truong.spec.ts:666`
  severity: low
  AC: AC-3
  source: measurement
  detail: Fixture tạo thoả thuận và liên hệ tên `['Z','Y','X','W','V']` theo đúng thứ tự đó (666-671). Thứ tự mặc định là createdAt desc, ra V,W,X,Y,Z, cũng chính là tên A→Z. Đây lại đúng là thứ tự `banGhiTrong` dùng cho đoạn trống (`TEN_BAN_GHI` rồi id). Vì vậy với deals.list, deals.board và contacts.list (17/22 ô), phép so `ra.join(',') !== macDinh.join(',')` (733) không phân biệt được "khoá chết rơi về mặc định" với một hồi quy trong đó khoá chết bị coi như trường không có giá trị và mọi bản ghi được xếp theo tên. Đối chứng `thuoc mu` (700-704) chỉ chứng rằng trường sống cho thứ tự khác mặc định. Nó không chứng rằng fixture phân biệt được mặc định với một thứ tự thay thế hợp lý. Chỉ companies.list ('cong ty' tạo trước P,Q,R,S) là có tên lệch với createdAt. AC-3 đòi thứ tự bằng đúng thứ tự khi sort rỗng kèm đối chứng; fixture khiến phép so không phân biệt được hồi quy.

- **Hình dạng 4 (âm-tính-một-mình): do-man E9 cho đạt dòng 'Beta không có dòng Số' và '375 không cuộn ngang' ngay cả khi thẻ không được vẽ**
  file: `_acceptance/sort-moi-truong/rang/do-man.mjs:380`
  severity: medium
  AC: AC-9
  source: measurement
  detail: `doc_` trả `''` khi không tìm thấy thẻ (dòng 360-363). Vì vậy `bao(!the.beta.includes(NHAN.NUMBER), ...)` (380-384) đạt khi thẻ Beta không có mặt trên bảng, ví dụ do lọc sai, giai đoạn sai hay bảng chưa tải. Không có đối chứng dương cho riêng Beta, kiểu "tên thẻ Beta có trong DOM" như `doi chung thieu the` của E7b. Ở 375 (385-390), `the.tran <= 0` cũng đạt khi bảng chưa vẽ, vì `mo()` nuốt timeout chờ chữ Alpha (`.catch(() => {})`, dòng 207) và nhánh 375 không kiểm thẻ Alpha có mặt. Trang trống không bao giờ cuộn ngang, nên dòng 'smt man: 375 cuon ngang' không thể đỏ trong đúng trường hợp đáng ngờ. AC-9 đòi không cuộn ngang ở 375 và thẻ Kanban đúng; phép đo đậu cả khi bảng chưa vẽ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hằng tiền tố `field:` mới thành bản sao thứ ba, trong khi hai hằng cùng giá trị đã có sẵn**
  Người dùng thấy gì: Người dùng không thấy gì khác. Về sau nếu ai đổi cách gọi tên trường ở chỗ sắp mà quên chỗ lọc thì hai chỗ có thể lệch nhau.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, không mất dữ liệu, và dọn gộp có thể làm cùng đợt với việc lọc theo trường sau này nên không đáng mở việc riêng.
  file: `packages/db/src/fields-shape.ts`
  severity: medium
  Đề xuất: wont-fix

- **Cột Tên miền của Công ty khai hai kiểu khác nhau: ẩn theo URL, vẽ theo TEXT**
  Người dùng thấy gì: Cột Tên miền của Công ty hiện như chữ thường, không bấm được, dù được coi là liên kết khi ẩn theo khổ màn hình. Hôm nay nhìn không khác trước.
  Căn cứ: Chỉ lệch nhỏ về cách hiện, không mất dữ liệu và người dùng không bị cản trở; sửa rẻ nhưng thuộc việc thống nhất cách hiện của vòng trước.
  file: `apps/app/app/(app)/[slug]/companies/companies-table.tsx`
  severity: low
  Đề xuất: known-limits

- **Thẻ Kanban tự ráp ô trường thay vì đi qua đường có sẵn, và nhãn trường người nhập không mang `translate="no"`**
  Người dùng thấy gì: Trên thẻ Kanban, tên trường do quản trị tự đặt có thể bị trình duyệt tự dịch sang ngôn ngữ khác. Thẻ vẫn hiện đúng giá trị.
  Căn cứ: Hậu quả nhẹ, chỉ xảy ra với người bật dịch tự động, không mất dữ liệu và tắt dịch là hết; sửa rẻ nhưng không chặn việc giao.
  file: `apps/app/app/(app)/[slug]/deals/deals-board.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): giá trị trường trên thẻ trong E7b và danh sách trường trong E5/E6 viết tay rồi parse, không rút từ writer**
  Người dùng thấy gì: Bài kiểm thẻ Kanban dùng dữ liệu viết tay hơi khác dữ liệu hệ thống thật. Hiện thẻ vẫn hiện đúng, nhưng nếu cách đọc ngày đổi sau này thì bài kiểm có thể không phát hiện.
  Căn cứ: Chưa gây lỗi nào cho người dùng và chỉ là rủi ro phát hiện chậm về sau; sửa sau không đắt.
  file: `apps/app/test/sort-moi-truong.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
