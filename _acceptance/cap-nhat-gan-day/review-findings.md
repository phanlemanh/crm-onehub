# Review findings: cap-nhat-gan-day (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E16: thiếu nút «Trả lời» ở khổ 375 bị báo là «không đo được» (mã 2) thay vì SAI, và E3 bị bỏ qua**
  Người dùng thấy gì: Nếu một ngày nút «Trả lời» biến mất trên điện thoại, công cụ kiểm màn sẽ báo «không đo được» thay vì «sai», và bỏ qua một phép đo kế tiếp. Người dùng cuối không gặp gì, vì đây chỉ là cách công cụ kiểm tự báo lỗi.
  Căn cứ: Công cụ kiểm vẫn dừng và báo lỗi chứ không cho qua im lặng, nên hỏng thật vẫn bị thấy; chỉ nhãn lỗi kém chính xác, và sửa sau này rẻ nếu cần.
  file: `_acceptance/cap-nhat-gan-day/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Ô trả lời không chặn độ dài ở trình duyệt, lệch với ô bình luận sẵn có (r1)**
  Người dùng thấy gì: Người gõ trả lời quá dài vẫn bấm Gửi được, rồi nhận câu báo lỗi từ máy chủ thay vì bị chặn ngay lúc gõ. Chữ đã gõ không mất.
  Căn cứ: Hậu quả nhẹ: chỉ xảy ra với câu trả lời rất dài, người dùng thấy lỗi, giữ nguyên chữ và tự rút gọn rồi gửi lại được; không mất dữ liệu, sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: medium
  Đề xuất: known-limits

- **Dòng lỗi gửi tự dựng bằng <p className="text-destructive text-xs"> thay vì FieldError (r1)**
  Người dùng thấy gì: Dòng báo lỗi khi gửi trả lời hỏng được vẽ riêng nên có thể lệch nhẹ về hình và cách đọc của trình đọc màn hình so với ô bình luận ở chỗ khác.
  Căn cứ: Người dùng vẫn thấy lỗi đúng chỗ và đúng lúc, chỉ khác nhau về giao diện chung; sửa sau rẻ và không ảnh hưởng dữ liệu.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: low
  Đề xuất: known-limits

- **Dữ liệu người nhập trong ô trả lời không có translate="no", còn câu giao diện đã dịch lại bị đánh dấu không dịch (r1)**
  Người dùng thấy gì: Khi trình duyệt tự dịch trang, chữ người dùng đang gõ có thể bị dịch nhầm, còn câu «cập nhật thay …» của giao diện lại không được dịch.
  Căn cứ: Chỉ ảnh hưởng người bật tự dịch của trình duyệt và không làm mất dữ liệu; tắt dịch hay tải lại là xong, sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: low
  Đề xuất: known-limits

- **Danh sách trả lời dựng bằng div tự xếp, không theo khối Item mà khung trao đổi đang dùng cho cùng một bình luận (r1)**
  Người dùng thấy gì: Lần trả lời ở trang này trông hơi khác cùng bình luận đó ở thẻ Trao đổi của mục tiêu về cách xếp và cỡ chữ.
  Căn cứ: Chỉ là lệch nhẹ về hình, chữ và thao tác vẫn đủ dùng; không mất dữ liệu, có thể gộp vào đợt thống nhất giao diện sau.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: low
  Đề xuất: known-limits

- **Pre-push marks every pushed commit as passed using results from the current working copy, not from those commits (r1)**
  Người dùng thấy gì: Máy có thể ghi nhận một commit là đã qua kiểm tra dù kiểm tra chạy trên mã khác hay mã chưa commit, nên lần đẩy sau có thể bỏ qua kiểm tra ở máy. Không ảnh hưởng người dùng cuối của tính năng này.
  Căn cứ: Không chạm người dùng cuối vì CI vẫn chạy lại trên PR; rủi ro là lưới kiểm cục bộ bỏ sót lỗi, nên đáng làm thành việc riêng chứ không gộp vào tính năng này.
  file: `scripts/verify-gate-shape.mjs`
  severity: medium
  Đề xuất: new-contract

- **Kiểu 5, tuyên quét lớp nhưng ma trận không còn giữ: phép đếm số ca nay đúng theo định nghĩa (r1)**
  Người dùng thấy gì: Nếu ai đó vô tình xoá trang Cập nhật gần đây khỏi danh sách trang được kiểm của khu Mục tiêu, bài kiểm vẫn xanh nên không cảnh báo.
  Căn cứ: Không ảnh hưởng người dùng hôm nay mà chỉ làm lưới kiểm lỏng hơn cho lần sửa sau; sửa rẻ và có thể làm lúc chạm lại khu này.
  file: `apps/app/test/vo-khu-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
