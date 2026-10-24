# Review findings: bam-kr-mo-chi-tiet-kr (round 1)

## Trong hợp đồng

- **Nút KR vẫn mang data-mo-muc-tieu dù nay mở KR, nên các thước màn đã ký bấm nhầm nút mà hồ sơ không bị đánh dấu cũ**
  AC: AC-6
  file: `apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx:87`
  severity: medium
  source: bugs
  detail: Vòng này đổi onClick của nút tên KR trong «KR bạn phụ trách» thành openRecord({ kind: "kr", id: k.id }), nhưng nút vẫn giữ data-mo-muc-tieu={mucTieu.id}. viec-cua-toi.tsx:196 cũng vậy: nút «Mở KR» mới vẫn gắn data-mo-muc-tieu={viec.objectiveId}. Trong kho, data-mo-muc-tieu=<id> được dùng như hợp đồng «nút mở ngăn mục tiêu <id>» ở hơn 15 thước màn đã ký. Ví dụ cụ thể: _acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs:469 moMucTieu() mở /okr (Của tôi) bằng cookie của truong, bấm `[data-mo-muc-tieu='${K.A}']` rồi chờ `${NGAN} [data-nut='them-kr']`. truong là người phụ trách KR Ka của A (taoKr với ownerUserId id.truong, dòng 319-333), nên phần tử khớp đầu tiên trên Của tôi là nút KR trong PhanKrPhuTrach. Phần tử này được vẽ trước NhomDangTheoDoi và NhomDaBo, còn PhanDonViDan không có data-mo-muc-tieu. Bấm vào thì mở kr:Ka thay vì ngăn mục tiêu, nên nút them-kr không bao giờ hiện. Lỗi này im lặng: paths của eval ui-check trong hồ sơ đó (evals.yaml dòng 90) không có phan-kr-phu-trach.tsx hay viec-cua-toi.tsx, nên recheck không đánh dấu nó cũ. Bước khong-doi-hinh.mjs (AC-6) của vòng này cũng không thấy, vì quetLop chỉ quét executor test và script, bỏ qua thước màn ui-check và tien-de. Sửa: đổi tên hoặc bỏ data-mo-muc-tieu trên các nút đã chuyển sang mở KR (đã có data-mo-kr), hoặc rà và cập nhật các thước màn đã ký đang chọn theo data-mo-muc-tieu trên Của tôi và Việc OKR.
  rationale: AC-6 đòi eval máy của mọi hồ sơ đã ký có thước chạm bốn tệp phải không xấu hơn trên nền; thước màn giữ chỗ bấm vào nút KR vừa đổi đích sẽ đỏ nếu chạy, và đó đúng là hồi quy AC-6 muốn bắt.

- **Hình dạng 3 (đo chuỗi có mặt thay vì quan hệ hồ sơ↔sổ): E6 nhận dòng fix ở sổ của bất kỳ hồ sơ nào**
  AC: AC-6
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs:218`
  severity: medium
  source: measurement
  detail: E6 hứa «sổ CỦA HỒ SƠ có dòng fix decided_by chủ kho nhắc tệp», còn AC-6 nói «mỗi hồ sơ bị đổi có một dòng sổ fix». `kiemSo` (dòng 218-228) lặp mọi slug đã ký trong `_acceptance` và qua ngay khi BẤT KỲ decisions.jsonl nào có dòng `type==='fix'` mà `JSON.stringify(d).includes(t)`. Nó không xác định tệp bài kiểm thuộc hồ sơ nào. Nếu hồ sơ sở hữu tệp không có dòng sổ nhưng một hồ sơ khác có nhắc tên tệp, phép đo vẫn xanh. Quan hệ «tệp của hồ sơ X → sổ của X» bị thu thành «chuỗi đường dẫn có mặt trong một sổ nào đó».
  rationale: AC-6 đòi mỗi hồ sơ bị đổi có một dòng sổ fix riêng của nó; phép đo nhận sổ của hồ sơ khác nên không bảo đảm được đúng câu này.

- **Hình dạng 3 (quan hệ có chiều bị chuẩn hoá mất): khoiHopLe đổi objective: thành kr: ở cả hai vế và áp cặp chữ trần ở mọi chỗ**
  AC: AC-6
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs:91`
  severity: medium
  source: measurement
  detail: E6 hứa mỗi khối diff phải là ĐÚNG MỘT phần tử của bảng cặp, hoặc kỳ vọng `objective:<x> → kr:<x>` ở bốn chỗ. Dòng 91 và 94 chạy `.replaceAll("objective:", "kr:")` trên CẢ khối bỏ lẫn khối thêm, ở mọi tệp. Vì vậy khối đổi ngược `kr:X → objective:X` cũng bằng nhau và được nhận, và chẳng có gì giới hạn vào bốn chỗ. Thêm nữa, `capChu()` sinh thêm cặp giá trị trần qua `giaTri` (ví dụ «Cập nhật tuần»→«Cập nhật»), và `apCap` áp mọi cặp lên cả khối bằng split/join. Một khối đổi «Cập nhật tuần này» thành «Cập nhật này» (cụm khoảng thời gian mà AC-5 bắt giữ) vẫn được nhận, và một khối chứa nhiều cặp cũng được nhận. Lời hứa có chiều, đếm đúng một, chỉ ở bốn chỗ, đã bị thay bằng phép so bằng nhau sau khi chuẩn hoá hai chiều.
  rationale: AC-6 đòi mỗi khối thay đổi là đúng một phần tử của bảng cặp hoặc đúng kỳ vọng objective→kr ở bốn chỗ; phép đo hai chiều và áp cặp trần mọi nơi làm lời hứa này không được giữ.

- **Hình dạng 5 (lớp quét có lỗ): --diff-filter=M bỏ qua tệp hỗ trợ mới làm đổi logic bài kiểm đã ký, còn AP_CAP miễn dòng gọi nó**
  AC: AC-6
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs:107`
  severity: medium
  source: measurement
  detail: E6 tuyên bố quét mọi khối thay đổi trong bài kiểm của hồ sơ đã ký. `tepDaSua` chỉ lấy `--diff-filter=M` (dòng 107). Tệp mới apps/agent/test/support/cap-chu-sv6.ts (trạng thái A) nằm ngoài lớp quét. Trong khi đó `AP_CAP` (dòng 36-40) xoá hẳn `import { theoCapChu } ...` và `theoCapChu(` khỏi khối thêm trước khi so. Kết quả là thong-bao-ghi.integration.spec.ts:376 và thong-bao-kenh.integration.spec.ts:255 nay so đầu ra với ảnh chụp lịch sử đã qua phép biến đổi `theoCapChu`. Đó là đổi logic kỳ vọng (kỳ vọng sinh từ chính bảng cặp đã lái phần sửa nên không bắt được lỗi áp quá tay), nhưng không khối nào bị xét: phần logic nằm ở tệp A không được quét, còn dòng gọi đã được miễn. Cùng bộ lọc M cũng khiến kiểm «ANH CHUP LICH SU DOI» (dòng 214) mù với việc xoá hay đổi tên apps/agent/test/fixtures/tin-nhac-truoc-tb1.json.
  rationale: AC-6 đòi mọi khối thay đổi trong bài kiểm của hồ sơ đã ký phải là đúng cặp chữ và ảnh chụp lịch sử không đổi; tệp hỗ trợ mới và dòng gọi bị miễn nằm ngoài phép quét nên lời hứa này không được kiểm hết.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Text users still see says «Cập nhật tuần» outside the two folders E5 scans**
  Người dùng thấy gì: Vài chỗ người dùng vẫn thấy chữ «Cập nhật tuần» cũ: thông báo lỗi khi cập nhật KR, chú thích dưới biểu đồ trong chi tiết KR. Kara cũng còn nói chữ cũ trong khung chat, trong khi nút trên màn đã đổi thành «Cập nhật».
  Căn cứ: Chỉ là chữ gọi tên lệch giữa vài nơi, không mất dữ liệu và không làm sai thao tác nào, nhưng người dùng sẽ thấy hai cách gọi cho cùng một thứ, và sửa gọn trong một việc riêng về chữ.
  file: `apps/api/src/okr/okr-config.ts`
  severity: medium
  Đề xuất: new-contract

- **chup-hom-nay.mjs vẫn chụp và in «ANH …» khi chờ ngăn hay phần tử hết hạn**
  Người dùng thấy gì: Ảnh minh hoạ gửi kèm cho người duyệt có thể chụp nhầm màn khi ngăn chi tiết không mở được, mà không có cảnh báo. Người duyệt có thể thấy một ảnh trông bình thường nhưng không đúng trạng thái.
  Căn cứ: Chỉ ảnh minh hoạ cho người duyệt bị ảnh hưởng, không đụng tới người dùng cuối, và người duyệt chụp lại hay mở màn xem trực tiếp là kiểm lại được ngay.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/chup-hom-nay.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (quét lớp, đối chứng không độc lập): số tệp E5 được so với chính nó**
  Người dùng thấy gì: Bài kiểm tự động của lần đổi chữ này có thể bỏ sót vài tệp chữ mà vẫn báo xanh. Người dùng không thấy gì ngay, chỉ là nguy cơ sót chữ cũ sau này.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm lưới an toàn lỏng hơn hứa; ghi lại để biết, sửa sau rẻ khi có việc chạm bài kiểm này.
  file: `apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đo chuỗi có mặt thay vì quan hệ khoá→giá trị) và hình dạng 5 (ma trận 8 ô thành ≥8): mục (3) của E5**
  Người dùng thấy gì: Bài kiểm chữ chỉ đếm xem cụm chữ mới có mặt hay không, chưa buộc đúng từng ô với đúng câu. Nếu có một câu bị đổi lệch, bài kiểm có thể không thấy.
  Căn cứ: Chữ trên màn hiện đúng theo bảng cặp đã duyệt, rủi ro chỉ là bắt sót lỗi chữ về sau; người dùng thấy sai chữ thì chỉ là lệch nhẹ và sửa nhanh.
  file: `apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim): chiều đỏ not-tobe sửa một dòng không liên quan, và chỉ đếm loi.length > 0**
  Người dùng thấy gì: Bước tự thử xem thước có bắt được lỗi cố ý hay không đang thử trên một dòng không đúng ý định. Thước vẫn có thể hoạt động, chỉ là chưa chứng minh được chắc chắn.
  Căn cứ: Không đụng tới thứ người dùng thấy; chỉ làm bằng chứng tự kiểm yếu hơn, và sửa sau là việc nhỏ khi có người mở lại thước này.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng dương đã khai): E6 không có ca «Tuần này chưa có Cập nhật tuần nào → … qua» và không chặn daSua rỗng**
  Người dùng thấy gì: Thước kiểm thiếu một ca mẫu «đúng thì phải qua» và có thể báo đạt khi không có gì để kiểm. Người dùng không thấy ảnh hưởng, chỉ giảm độ tin cậy của lần kiểm tự động.
  Căn cứ: Chỉ làm bằng chứng tự động kém chắc hơn, không gây sai gì trên màn của người dùng, và bổ sung ca mẫu sau này là việc nhỏ.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
