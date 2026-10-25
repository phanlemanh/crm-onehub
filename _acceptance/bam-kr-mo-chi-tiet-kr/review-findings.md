# Review findings: bam-kr-mo-chi-tiet-kr (vòng 3)

## Trong hợp đồng

- **KR button in «KR bạn phụ trách» keeps data-mo-muc-tieu but now opens the KR. The signed gauge ghd_man_chrome (gioi-han-duyet-cay-okr) clicks that button to open the objective sheet and turns red. AC-6 does not see it**
  AC: AC-6
  file: `apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx:84`
  severity: high
  source: bugs
  detail: Commit 7c7120509 (lối 2) put `data-mo-muc-tieu={mucTieu.id}` back on the KR-name button, which now does `openRecord({ kind: "kr", id: k.id })`. Any signed gauge that clicks `[data-mo-muc-tieu=<mt>]` on Của tôi, for an objective where the user owns a KR, now lands on the KR sheet instead of the objective sheet. Why: chiaPhanBa moves such objectives out of thamGia, so the KR button is the only element on the page carrying that attribute. This round fixed exactly that failure in hop-thoai-giu-cho-dang-nhap/man-giu-cho.mjs, by switching to the URL `record=objective:`. The same failure is still live in `_acceptance/gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs` (contract status: signed-off, eval E15/E16/E17 cmd `executors.script.ghd_man_chrome`). Lines 1478-1484: taoNhap creates draft G owned by truong, with one KR owned by truong (lines 444-465). Truong opens `/okr`. buocGioiHan → tienDeGioiHan (lines 972-989) runs `bamIm(t, "[data-mo-muc-tieu='G']")` and then waits for `[data-okr-sheet='G'][data-dau-khung]`. Only objective-sheet.tsx:1002 renders data-okr-sheet, and nothing above it carries data-mo-muc-tieu=G: PhanDonViDan has no such button, and a freshly created draft G produces no okr-cho-duyet or okr-tra-lai row in Việc. So the click opens the KR sheet, the wait times out with «khung G khong tai xong», tienDe is marked broken, and every later step of E15/E16 is skipped and recorded as broken. buocBiTraLai (moSheet at line 1265) and buocTrangThaiLoi (line 1451) use the same click. On origin/onehub the same button opened the objective, so this is a regression this round causes. E15's paths include `apps/app/app/(app)/[slug]/okr/**` and `apps/app/components/crm/record-sheet/**`, so strict recheck will mark the record stale and rerun it red at the merge gate. The AC-6 gauge `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs` does not catch it for two reasons. quetLop only takes evals with executor test or script; E16 is script, but its command file man-gioi-han-duyet.mjs contains neither «Cập nhật tuần» nor any VAT name. And THEM hand-lists only two screen gauges, dat-okr-trong-crm and hop-thoai-giu-cho-dang-nhap. Fix: update man-gioi-han-duyet.mjs to open G by URL `/okr?record=objective:${K.G}`, or click `[data-okr-sheet]` from another page, with a fix line in that record's decision log; and add ghd_man_chrome to THEM. The alternative is to record the breakage on the gate card.
  rationale: AC-6 đòi mọi thước máy đã ký chạm tệp phan-kr-phu-trach.tsx không xấu hơn trên nền origin/onehub; thước ghd_man_chrome xanh trên nền mà đỏ sau vòng này nên AC-6 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (âm tính một mình): đối chứng dương «THEM <slug>» của E6 luôn đúng, không chạm luật chọn lớp**
  Người dùng thấy gì: Công cụ kiểm tra rằng vòng này không làm hỏng các bài kiểm cũ có thể bỏ sót bài kiểm cần xét mà vẫn báo đạt. Người dùng không thấy gì ngay, nhưng một hồi quy về chữ «Cập nhật» sau này có thể lọt qua mà không ai biết.
  Căn cứ: Chỉ làm lưới an toàn kém chặt hơn mức mong muốn, không ảnh hưởng gì tới tính năng người dùng đang dùng; sửa sau rẻ và không mất dữ liệu.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): chiều đỏ «hoi-quy» nhận bất kỳ mã khác 0 trên bản sao làm bằng chứng**
  Người dùng thấy gì: Phép thử tự kiểm của công cụ kiểm tra có thể báo đạt vì một lỗi môi trường chứ không phải vì nó thật sự bắt được lỗi chữ. Người dùng không bị ảnh hưởng, chỉ là độ tin cậy của công cụ kiểm thấp hơn vẻ ngoài.
  Căn cứ: Hậu quả nhẹ và chỉ nằm ở công cụ kiểm nội bộ, người dùng không gặp; gặp lúc chạy lại thì tự thấy và chạy lại được, sửa sau rẻ.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hàm cocSo là hàm đồng nhất chết (r2 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng gì đến người dùng; chỉ làm người đọc mã của bộ kiểm tra dễ hiểu nhầm một bước thừa.
  Căn cứ: Không đụng tới màn hình hay dữ liệu của người dùng, chỉ là một dòng thừa trong công cụ kiểm tra nên sửa hay không cũng không đổi gì cho họ.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

- **dongSo nuốt lỗi đọc JSON của decisions.jsonl (r2 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Khi sổ quyết định bị hỏng, bộ kiểm tra vẫn báo lỗi nhưng nói là thiếu dòng sổ chứ không nói là sổ hỏng.
  Căn cứ: Bộ kiểm tra vẫn đỏ nên không lọt lỗi nào, chỉ làm người sửa mất thêm một lúc để hiểu đúng nguyên nhân; sửa sau cũng rẻ.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra) và hình dạng 3 (chuỗi có mặt thay vì quan hệ): tệp hỗ trợ cap-chu-sv6.ts được miễn quét, chỉ grep hai chuỗi trong mã nguồn; còn theoCapChu bỏ soLan và khoá, thay toàn cục (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này có thêm một chỗ chữ «Cập nhật tuần» bị đổi ngoài ý định, bộ kiểm tra có thể không phát hiện. Hiện chưa thấy người dùng nào bị ảnh hưởng.
  Căn cứ: Rủi ro chỉ xảy ra nếu có thay đổi chữ ngoài dự kiến trong tương lai, không mất dữ liệu, và bắt được lại khi rà soát chữ trên màn hình.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): ngoại lệ apAnh trong khoiHopLe xét từng dòng có thuộc tập hay không, không xét đúng phép thay bọc theoCapChu (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm tra có thể chấp nhận một chỉnh sửa dở dang trong bài kiểm tra cũ mà lẽ ra phải bị chặn. Người dùng không thấy khác biệt nào trên màn hình.
  Căn cứ: Chỉ làm bộ kiểm tra nội bộ lỏng hơn dự định, không đụng tới màn hình hay dữ liệu người dùng, và siết lại sau cũng không đắt.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Text users still see says «Cập nhật tuần» outside the two folders E5 scans (r1)**
  Người dùng thấy gì: Vài chỗ người dùng vẫn thấy chữ «Cập nhật tuần» cũ: thông báo lỗi khi cập nhật KR, chú thích dưới biểu đồ trong chi tiết KR. Kara cũng còn nói chữ cũ trong khung chat, trong khi nút trên màn đã đổi thành «Cập nhật».
  Căn cứ: Chỉ là chữ gọi tên lệch giữa vài nơi, không mất dữ liệu và không làm sai thao tác nào, nhưng người dùng sẽ thấy hai cách gọi cho cùng một thứ, và sửa gọn trong một việc riêng về chữ.
  file: `apps/api/src/okr/okr-config.ts`
  severity: medium
  Đề xuất: new-contract

- **chup-hom-nay.mjs vẫn chụp và in «ANH …» khi chờ ngăn hay phần tử hết hạn (r1)**
  Người dùng thấy gì: Ảnh minh hoạ gửi kèm cho người duyệt có thể chụp nhầm màn khi ngăn chi tiết không mở được, mà không có cảnh báo. Người duyệt có thể thấy một ảnh trông bình thường nhưng không đúng trạng thái.
  Căn cứ: Chỉ ảnh minh hoạ cho người duyệt bị ảnh hưởng, không đụng tới người dùng cuối, và người duyệt chụp lại hay mở màn xem trực tiếp là kiểm lại được ngay.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/chup-hom-nay.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (quét lớp, đối chứng không độc lập): số tệp E5 được so với chính nó (r1)**
  Người dùng thấy gì: Bài kiểm tự động của lần đổi chữ này có thể bỏ sót vài tệp chữ mà vẫn báo xanh. Người dùng không thấy gì ngay, chỉ là nguy cơ sót chữ cũ sau này.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm lưới an toàn lỏng hơn hứa; ghi lại để biết, sửa sau rẻ khi có việc chạm bài kiểm này.
  file: `apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đo chuỗi có mặt thay vì quan hệ khoá→giá trị) và hình dạng 5 (ma trận 8 ô thành ≥8): mục (3) của E5 (r1)**
  Người dùng thấy gì: Bài kiểm chữ chỉ đếm xem cụm chữ mới có mặt hay không, chưa buộc đúng từng ô với đúng câu. Nếu có một câu bị đổi lệch, bài kiểm có thể không thấy.
  Căn cứ: Chữ trên màn hiện đúng theo bảng cặp đã duyệt, rủi ro chỉ là bắt sót lỗi chữ về sau; người dùng thấy sai chữ thì chỉ là lệch nhẹ và sửa nhanh.
  file: `apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim): chiều đỏ not-tobe sửa một dòng không liên quan, và chỉ đếm loi.length > 0 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bước tự thử xem thước có bắt được lỗi cố ý hay không đang thử trên một dòng không đúng ý định. Thước vẫn có thể hoạt động, chỉ là chưa chứng minh được chắc chắn.
  Căn cứ: Không đụng tới thứ người dùng thấy; chỉ làm bằng chứng tự kiểm yếu hơn, và sửa sau là việc nhỏ khi có người mở lại thước này.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng dương đã khai): E6 không có ca «Tuần này chưa có Cập nhật tuần nào → … qua» và không chặn daSua rỗng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Thước kiểm thiếu một ca mẫu «đúng thì phải qua» và có thể báo đạt khi không có gì để kiểm. Người dùng không thấy ảnh hưởng, chỉ giảm độ tin cậy của lần kiểm tự động.
  Căn cứ: Chỉ làm bằng chứng tự động kém chắc hơn, không gây sai gì trên màn của người dùng, và bổ sung ca mẫu sau này là việc nhỏ.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
