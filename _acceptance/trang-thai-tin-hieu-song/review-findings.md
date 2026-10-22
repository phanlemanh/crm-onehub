# Review findings: trang-thai-tin-hieu-song (round 1)

Không có finder nào chết; review đầy đủ.

## Trong hợp đồng

- **Phép đo báo đổi chỗ (do-bao-doi-cho) báo sai «thiếu thông báo» khi bản chụp bị lượt sau thế chỗ mà commit đó không tự đổi chỗ nào**
  AC: AC-8
  file: `scripts/tin-hieu/do-bao-doi-cho.ts:225`
  severity: medium
  source: bugs
  detail: Trong ghepLanDoi, `lucCommit` chỉ được dựng từ `lanDoi`, tức chỉ gồm những commit mà chính nó có một lần đổi chỗ. Phía máy chủ thì gắn thông báo vào `vao.sha`, là sha của bản chụp được đẩy (HEAD của lượt Actions). Lượt này có thể là một commit sau, chạm LO-TRINH.html mà không đổi chỗ tín hiệu nào. Chuyện này xảy ra khi nhiều commit vào cùng một lần push, hoặc khi nhóm concurrency của ban-chup-lo-trinh.yml huỷ lượt đang chờ ở giữa. Khi đó `lucCommit.get(t.sha)` trả `undefined`, nên `sau !== undefined` sai. Lần đổi chỗ đã được báo đúng nhưng vẫn bị gắn cờ «thiếu thông báo», và KẾT LUẬN ra «không đạt». Bài kiểm ttts-do xanh chỉ vì commit 4 trong BUOC tình cờ đổi chỗ của ma luu-tru: ma này vẫn nằm trong lanDoi trước khi bị lọc theo người nhận, nên sha4 có mặt trong lucCommit. Cách sửa: dựng `lucCommit` từ toàn bộ danh sách commit first-parent đã chạm tệp (`dong` trong lanDoiTuGit), không dựng từ `lanDoi`.
  lý do gắn AC: AC-8 buộc coi lần đổi có lượt đẩy bị lượt mới hơn thế chỗ là được phủ; lệnh đo gắn cờ thiếu và kết luận không đạt sai ở đúng ca này.

- **Pha 4 của do-man (bấm dòng thông báo) không thể đỏ: trang đầu đã là đích, và không tìm thấy liên kết thì lặng lẽ bỏ qua cú bấm**
  AC: AC-7
  file: `_acceptance/trang-thai-tin-hieu-song/rang/do-man.mjs:367`
  severity: medium
  source: bugs
  detail: Mỗi ô ở pha 3/4 mở chuông từ chính `${APP}/${slug}/tin-hieu`, nên cú bấm không kiểm được điều gì. (1) `if (box)` bỏ qua cú bấm khi không tìm thấy liên kết. (2) `waitForFunction(() => location.pathname.endsWith("/tin-hieu"))` xong ngay trên trang cũ, có `.catch(() => {})`. (3) `waitForSelector(SEL_CUA_TOI)` cũng xong ngay trên trang cũ, và `chuDong` đọc dòng của trang cũ, vốn đã mang «Đã vào nhóm» từ pha 2b. Vì vậy href hỏng (ví dụ thiếu slug, pathname vẫn kết thúc bằng /tin-hieu) hay một cú bấm không điều hướng đi đâu vẫn ra «DUNG bam-…». Cách sửa: mở chuông từ một trang khác /tin-hieu, chờ điều hướng thật (`waitForNavigation`, hoặc so URL trước và sau), và coi `box` null là SAI.
  lý do gắn AC: AC-7 hứa bấm dòng thông báo tới «Tín hiệu đã gửi» thấy nhãn và câu mới; phép đo không kiểm được cú bấm này.

- **Hình dạng 4 (không có đối chứng): bước bấm dòng thông báo ở E7 pha 4 đã đúng trước khi bấm**
  AC: AC-7
  file: `_acceptance/trang-thai-tin-hieu-song/rang/do-man.mjs:380`
  severity: high
  source: measurement
  detail: Dòng 330 mở chuông ngay trên `${APP}/${slug}/tin-hieu`, tức chính trang đích. Sau đó dòng 367-369 chỉ bấm khi có `box` (`if (box) await p.mouse.click(...)`), không tìm thấy liên kết thì lặng lẽ bỏ qua. `waitForFunction(... endsWith('/tin-hieu'))` và `waitForSelector(SEL_CUA_TOI)` đều có `.catch(() => {})`. Lời khẳng định ở dòng 380-386 (`url.endsWith('/tin-hieu') && sau.includes(daVaoNhom) && sau.includes(TEN_NHOM)`) vì thế đã đúng từ trước khi bấm: trang đang ở /tin-hieu, và pha 2b đã xác nhận dòng mang nhãn mới. Liên kết thông báo trỏ sai chỗ hay không bấm được thì bước này vẫn ra DUNG. Lời hứa «bấm dòng đó tới Tín hiệu đã gửi» của AC-7 không được đo, vì không có trạng thái xuất phát nào khác đích để đối chứng.
  lý do gắn AC: Lời khẳng định đúng từ trước khi bấm nên lời hứa bấm dòng tới Tín hiệu đã gửi của AC-7 không được đo.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ô hang-hong và kho-loi của E2 dựng sẵn đầu ra của bộ đọc**
  AC: AC-2
  file: `apps/app/test/tin-hieu-nguon.spec.ts:174`
  severity: medium
  source: measurement
  detail: Ô `hang-hong` trả thẳng `{ kieu: "hong", lyDo: "lo_trinh: sai khuon" }`, ô `kho-loi` ném từ hàm giả (dòng 167-177). Cả hai đều bỏ qua `docBanChupTho`. Hàm này mới là nơi biến một hàng `BanChupLoTrinh` không qua `phanTichBanChupLuu` hay `khoiLoTrinhTho` thành `hong`, và biến lỗi kho thành `loi` (nguon.ts dòng 36-56). Ngoài E1 (chỉ ghi một hàng hợp lệ) không bài nào gọi `docBanChupTho`, nên hai nhánh `hong` và nhánh `catch` của nó chưa từng chạy. AC-2 hứa về «hàng lưu không đọc được», nhưng ô này không ghi một hàng hỏng qua bên viết rồi đọc lại bằng bộ đọc thật. Bộ đọc trả `co` hay ném với hàng hỏng thì E2 vẫn xanh.
  lý do gắn AC: AC-2 nêu rõ ca hàng lưu không đọc được và kho lỗi; bài kiểm không chạy bộ đọc thật nên không chứng minh được hai ca này.

- **Hình dạng 4 (không có đối chứng dương phân biệt được): ở mọi ô bản dựng của E2, khoá kỳ vọng trùng khoá dự phòng của CRM**
  AC: AC-2
  file: `apps/app/test/tin-hieu-nguon.spec.ts:237`
  severity: medium
  source: measurement
  detail: `choCu` lấy từ khối CU, trong đó MA đứng ở chỗ kit «chua-gom», nên khoá là "cho-gom" (dòng 186-190). `theoCrm(daKeoVe: true)`, nhánh trang dùng khi bản vẽ vắng hoặc hỏng (`traCrm`), cũng trả đúng khoá "cho-gom". Vì vậy phép so `khoa !== kyVong` ở dòng 238 cho các ô ban-dung (cu-hon, mo-ho, preview, chua-co, kho-loi, hang-hong) không tách được hai trường hợp: khoá tính từ dữ liệu tệp đóng gói, hay trang rơi về `banVe: "hong"`. evals.yaml E2 hứa riêng «O kho-loi va hang-hong: banVe khac "hong" khi tep dong goi doc duoc», nhưng không dòng nào khẳng định `banVe`. Một bản `docNguonTinHieu` trả `{ banVe: "hong" }` khi kho lỗi (đúng thứ AC-2 cấm: «màn lỗi mới») vẫn qua.
  lý do gắn AC: AC-2 cấm màn lỗi mới và đòi chọn đúng nguồn; bài kiểm không tách được nguồn đúng với nguồn dự phòng nên không chứng minh được.

- **Hình dạng 4 (lời khẳng định âm tính đứng một mình): ca bi-the-cho của E8 chỉ được kiểm bằng `not.toContain`**
  AC: AC-8
  file: `scripts/tin-hieu/test/do-bao-doi-cho.spec.ts:195`
  severity: medium
  source: measurement
  detail: Với dòng `bi-the-cho`, phép đo chỉ có `expect(dongCua("bi-the-cho")[0], "lan bi the cho tinh la thieu").not.toContain(BAO_DOI_CHO_DO.thieu)` (dòng 195-198). Bộ thứ hai cũng chỉ khẳng định chuỗi kết luận `đạt — 2/2`. Lời hứa của AC-8 là một quan hệ: lần đổi ở commit 3 được phủ bởi thông báo của lượt đẩy commit 4, giờ thông báo bằng `taoLuc` của thông báo đó, độ trễ khoảng 65 phút tính từ commit 3. Không chỗ nào ghim giờ thông báo hay độ trễ của dòng này. Một bản ghép nhận bất kỳ thông báo nào cùng mã, hoặc tính trễ từ commit phủ (ra 5 phút) thay vì commit gốc, vẫn qua cả hai bài.
  lý do gắn AC: AC-8 hứa lần đổi bị thế chỗ được phủ bởi thông báo của lượt thế; bài kiểm không ghim thông báo và độ trễ của ca này.

- **Hình dạng 3 (chỉ kiểm chuỗi có mặt trong khi lời hứa là quan hệ giữa các giá trị): các cột của dòng lệnh đo E8 không được đối chiếu**
  AC: AC-8
  file: `scripts/tin-hieu/test/do-bao-doi-cho.spec.ts:194`
  severity: low
  source: measurement
  detail: evals.yaml E8 hứa «moi dong mang ma, cho moi, gio commit, gio thong bao, tre». Bài chỉ lọc dòng theo tiền tố mã (`startsWith(`${ma[c]} `)`) và kiểm chuỗi con `"trễ 5 phút"` ở một dòng (dòng 194). Chỗ mới (`khoa`), giờ commit (`commit ${commitLuc}`) và giờ thông báo (`thông báo ${baoLuc}`) không được so với giờ commit git thật hay `taoLuc` của hàng ThongBao. Dòng `tre` chỉ được kiểm cờ «quá một ngày», không kiểm độ trễ 26 giờ. Lệnh đo in sai chỗ hay sai giờ thì vẫn xanh.
  lý do gắn AC: AC-8 yêu cầu mỗi dòng mang mã, chỗ mới, giờ commit, giờ thông báo, độ trễ; bài kiểm không đối chiếu các cột này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Nhánh này thêm một trang bằng chứng vào hồ sơ đã ký của tính năng khác (gom-tin-hieu-tu-chay)**
  Người dùng thấy gì: Bản giao mang theo một trang bằng chứng của tính năng gom tín hiệu đã ký mà người ký chưa từng xem. Người dùng không thấy gì khác đi, nhưng hồ sơ đã ký kia có thể bị coi là lệch.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; gỡ tệp khỏi nhánh là việc rẻ nhưng thuộc dọn nhánh, không thuộc tính năng này.
  file: `_acceptance/gom-tin-hieu-tu-chay/evidence-page.html`
  severity: medium
  Đề xuất: known-limits

- **Luật «không bao giờ lùi» của bản chụp nay có hai bản cài đặt, và docs/api.md còn tả cách cũ**
  Người dùng thấy gì: Hiện có hai đường cùng ghi bản chụp lộ trình và tài liệu mô tả cách cũ. Người dùng chưa thấy lỗi nào, nhưng về sau hai đường có thể lệch nhau.
  Căn cứ: Hậu quả nhẹ và chỉ phát sinh khi sau này sửa một trong hai đường; người dùng không gặp, sửa sau không đắt.
  file: `apps/api/src/lo-trinh/tin-hieu-doi-cho.ts`
  severity: low
  Đề xuất: known-limits

- **Lệnh đo đưa dữ liệu chưa kiểm khuôn từ `git show` thẳng vào `choTinHieu`**
  Người dùng thấy gì: Khi dữ liệu lấy từ lịch sử git sai khuôn, lệnh đo của chủ kho sẽ dừng với lỗi khó hiểu thay vì báo rõ là không đọc được. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ chủ kho gặp, chạy lại là biết; không mất dữ liệu và không ảnh hưởng thông báo gửi cho người dùng.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: low
  Đề xuất: known-limits

- **Phép đo báo đổi chỗ nuốt lỗi đọc tệp, rồi kết luận «đạt» với mã thoát 0**
  Người dùng thấy gì: Nếu lịch sử lộ trình không đọc được, lệnh đo của chủ kho có thể báo «đạt» thay vì báo hỏng, làm chủ kho tưởng mọi thông báo đều đúng hạn.
  Căn cứ: Chỉ ảnh hưởng phép đo sau một tháng của chủ kho, không ảnh hưởng người dùng cuối; chủ kho tự kiểm lại được khi thấy kết quả lạ.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng có ô không đo thật): ô hang-khac trong ma trận 18 ô của E6 so hàm với chính nó**
  Người dùng thấy gì: Một trong các chỗ của tín hiệu chưa có phép kiểm so nhãn thông báo với nhãn trên trang, nên nhãn có thể lệch mà bài kiểm vẫn xanh.
  Căn cứ: Chỉ là một chỗ hiếm trong số chín, lệch chỉ là sai chữ chứ không mất dữ liệu, và người dùng báo được, sửa rẻ.
  file: `apps/app/test/thong-bao-cau.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
