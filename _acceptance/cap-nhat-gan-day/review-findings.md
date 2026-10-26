## Trong hợp đồng

- **Kiểu 4, khẳng định âm tính đứng một mình: E16 vẫn báo DUNG khi không có dòng nào, không có tên KR nào xuống dòng, và ô trả lời chưa mở**
  AC: AC-9
  file: `_acceptance/cap-nhat-gan-day/rang/do-man.mjs:251`
  severity: medium
  source: measurement
  detail: Hàm e16 gọi `await mo(t, duongTrang(n), DONG)` nhưng bỏ qua kết quả trả về, không xét `r.thay` như e3 có xét ở dòng 122. Nếu trang ở trạng thái rỗng thì `ten = []`, nên `soTen = 0` và `biCat = 0` (dòng 228), và kiểm tra «tên KR xuống dòng» qua trắng. Khẳng định duy nhất về tên KR là một phép âm: không có ellipsis, không nowrap, không tràn. Eval E16 hứa một phép dương: «tên KR dài nhất chiếm >= 2 dòng (đo bằng getClientRects)», nhưng code không có phép đo này. Vì vậy dữ liệu mẫu toàn tên ngắn cũng qua. Ở dòng 253, `click([data-mo-tra-loi]).catch(() => null)` nuốt lỗi và không chờ `[data-o-tra-loi]` hiện ra. Như vậy lần đo «o-tra-loi» có thể chỉ là đo lại đúng trạng thái đầu mà vẫn in «DUNG AC-9 375 … (khi ô trả lời đang mở)». Hai lần phá thử tran và cat-ten chỉ chứng minh được chiều đỏ, không thay được đối chứng dương này.
  lý do vào hợp đồng: AC-9 đòi đo ở 375 khi ô trả lời đang mở và tên KR dài xuống dòng; phép đo này có thể báo đúng mà không đo được điều đó.

- **Kiểu 4, khẳng định âm tính đứng một mình: ca «chu kỳ đã ẩn» không ghim thông điệp, không có đối chứng dương, và so dòng tin của nhầm chu kỳ**
  AC: AC-6
  file: `apps/api/test/okr-cap-nhat-gan-day.spec.ts:670`
  severity: medium
  source: measurement
  detail: Hai khẳng định `expect(tra.status).not.toBe(200); expect(tra.loi.length).toBeGreaterThan(0)` nhận mọi lỗi: 403 vì thiếu quyền, 400 vì sai đầu vào, hay KR không thuộc mục tiêu đều qua. Thông điệp của máy chủ về chu kỳ đã ẩn không được ghim, dù tên ca là «bị từ chối bằng câu của máy chủ». Cũng không có đối chứng dương rằng B gửi được bình luận vào mục tiêu «kh» trước khi ẩn. Thêm nữa, vế «okr.capNhatGanDay không đổi» dùng `moiTrang("quan")` với cycleId mặc định `san.ky.chinh` (dòng 652 và 672), trong khi chu kỳ bị ẩn là `san.ky.khac`. Dòng tin của chu kỳ chính không đổi là điều hiển nhiên, nên phép so luôn đúng bất kể thủ tục xử lý chu kỳ đã ẩn ra sao.
  lý do vào hợp đồng: AC-6 nêu rõ ca gửi hỏng vì chu kỳ đã ẩn phải hiện câu lỗi; bài kiểm của ca này nhận mọi lỗi và so nhầm chu kỳ.

- **Kiểu 4, khẳng định âm tính đứng một mình: phép đếm truy vấn của E6 chỉ so hai số với nhau, không ghim con số và không đòi số lần đầu lớn hơn 0**
  AC: AC-5
  file: `apps/api/test/okr-cap-nhat-gan-day.spec.ts:561`
  severity: low
  source: measurement
  detail: `expect(`truoc=${truoc} sau=${sau}`).toBe(`truoc=${truoc} sau=${truoc}`)` chỉ đòi hai số bằng nhau. Nếu sink không bắt được truy vấn nào (Prisma client tạo ra lúc chưa có PRISMA_LOG_QUERIES, hoặc đường gọi đi qua client khác), thì 0 == 0 và bài vẫn qua. Eval E6 viết rõ «ghim con số của lần đầu, không chỉ so sánh», nhưng code không có `truoc > 0` và cũng không có hằng số ghim. Ngoài ra `test.if(DEM_DUOC)` bỏ qua ca này mà không báo gì khi thiếu biến môi trường.
  lý do vào hợp đồng: AC-5 đòi số truy vấn của một lần gọi không đổi khi số lần cập nhật hay số đơn vị tăng; phép so 0 bằng 0 vẫn qua.

- **Kiểu 5, ma trận viết trước thiếu phần tử: E10 bỏ ô «bấm nút Gửi không mở ngăn KR»**
  AC: AC-7
  file: `apps/app/test/cap-nhat-gan-day.dom.tsx:489`
  severity: low
  source: measurement
  detail: Eval E10 hứa «bấm vào ô trả lời đang mở và nút Gửi -> useMoNganKr không được gọi», nhưng ca cng-mo-kr chỉ `bamChuot(o)` trên textarea. Không có lần bấm `[data-gui-tra-loi]` nào, nên trường hợp click nút Gửi nổi bọt lên dòng và mở ngăn KR không được đo. Thêm nữa, `if (mo) await bamChuot(mo)` lặng lẽ bỏ qua khi thiếu nút Trả lời. Vế «đóng ngăn thì url về đúng phamViBo và trang» chỉ kiểm phamViBo, không kiểm tham số trang.
  lý do vào hợp đồng: AC-7 đòi bấm trong ô trả lời không mở chi tiết KR; nút Gửi nằm trong ô ấy nhưng chưa có ca đo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ô trả lời không chặn độ dài ở trình duyệt, lệch với ô bình luận sẵn có**
  Người dùng thấy gì: Người gõ trả lời quá dài vẫn bấm Gửi được, rồi nhận câu báo lỗi từ máy chủ thay vì bị chặn ngay lúc gõ. Chữ đã gõ không mất.
  Căn cứ: Hậu quả nhẹ: chỉ xảy ra với câu trả lời rất dài, người dùng thấy lỗi, giữ nguyên chữ và tự rút gọn rồi gửi lại được; không mất dữ liệu, sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: medium
  Đề xuất: known-limits

- **Dòng lỗi gửi tự dựng bằng <p className="text-destructive text-xs"> thay vì FieldError**
  Người dùng thấy gì: Dòng báo lỗi khi gửi trả lời hỏng được vẽ riêng nên có thể lệch nhẹ về hình và cách đọc của trình đọc màn hình so với ô bình luận ở chỗ khác.
  Căn cứ: Người dùng vẫn thấy lỗi đúng chỗ và đúng lúc, chỉ khác nhau về giao diện chung; sửa sau rẻ và không ảnh hưởng dữ liệu.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: low
  Đề xuất: known-limits

- **Dữ liệu người nhập trong ô trả lời không có translate="no", còn câu giao diện đã dịch lại bị đánh dấu không dịch**
  Người dùng thấy gì: Khi trình duyệt tự dịch trang, chữ người dùng đang gõ có thể bị dịch nhầm, còn câu «cập nhật thay …» của giao diện lại không được dịch.
  Căn cứ: Chỉ ảnh hưởng người bật tự dịch của trình duyệt và không làm mất dữ liệu; tắt dịch hay tải lại là xong, sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: low
  Đề xuất: known-limits

- **Danh sách trả lời dựng bằng div tự xếp, không theo khối Item mà khung trao đổi đang dùng cho cùng một bình luận**
  Người dùng thấy gì: Lần trả lời ở trang này trông hơi khác cùng bình luận đó ở thẻ Trao đổi của mục tiêu về cách xếp và cỡ chữ.
  Căn cứ: Chỉ là lệch nhẹ về hình, chữ và thao tác vẫn đủ dùng; không mất dữ liệu, có thể gộp vào đợt thống nhất giao diện sau.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: low
  Đề xuất: known-limits

- **Pre-push marks every pushed commit as passed using results from the current working copy, not from those commits**
  Người dùng thấy gì: Máy có thể ghi nhận một commit là đã qua kiểm tra dù kiểm tra chạy trên mã khác hay mã chưa commit, nên lần đẩy sau có thể bỏ qua kiểm tra ở máy. Không ảnh hưởng người dùng cuối của tính năng này.
  Căn cứ: Không chạm người dùng cuối vì CI vẫn chạy lại trên PR; rủi ro là lưới kiểm cục bộ bỏ sót lỗi, nên đáng làm thành việc riêng chứ không gộp vào tính năng này.
  file: `scripts/verify-gate-shape.mjs`
  severity: medium
  Đề xuất: new-contract

- **Kiểu 5, tuyên quét lớp nhưng ma trận không còn giữ: phép đếm số ca nay đúng theo định nghĩa**
  Người dùng thấy gì: Nếu ai đó vô tình xoá trang Cập nhật gần đây khỏi danh sách trang được kiểm của khu Mục tiêu, bài kiểm vẫn xanh nên không cảnh báo.
  Căn cứ: Không ảnh hưởng người dùng hôm nay mà chỉ làm lưới kiểm lỏng hơn cho lần sửa sau; sửa rẻ và có thể làm lúc chạm lại khu này.
  file: `apps/app/test/vo-khu-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
