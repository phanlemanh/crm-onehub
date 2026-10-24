## Trong hợp đồng

- **E6 miễn kiểm khối cho tệp hỗ trợ và tệp gọi nó, trái với lời hứa trong expected của E6**
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs:234`
  severity: medium
  source: conventions
  AC: AC-6
  detail: Theo expected của E6 trong evals.yaml, mọi khối diff trong bài kiểm hay thước của hồ sơ đã ký phải là đúng một cặp của cap-chu.json, hoặc là `objective:` → `kr:` ở bốn chỗ. Mục `apBangCapAnhChup` mới thêm vào chu-bai.json (dòng 10) mở hai lối miễn mà expected không nhắc tới. (a) `kiemSo` (dòng 234) và `kiemKhoi` (dòng 269) bỏ hẳn `apps/agent/test/support/cap-chu-sv6.ts`. Tệp này chứa logic thật: `theoCapChu` dùng split/join để viết lại ảnh chụp kỳ vọng của hai hồ sơ đã ký, hop-thong-bao-tren-web và thong-bao-mot-nguon-nhieu-kenh. Logic đó chỉ được giữ bằng `kiemTepHoTro` (dòng 251-262), mà hàm này chỉ kiểm hai chuỗi con có mặt trong tệp. Tệp không tồn tại thì nó trả `[]`. Sửa `thay` thành hàm trả nguyên đầu vào, hay đổi bộ lọc cặp, vẫn qua E6 miễn còn hai chuỗi đó. (b) Trong `tepGoi`, `khoiHopLe` (dòng 91-95) nhận mọi khối có mọi dòng bỏ nằm trong `dongBo` và mọi dòng thêm nằm trong `dongThem`. Khối chỉ xoá `const banChup = boTenXuong(` hay chỉ thêm dòng import cũng qua. Kết quả: lối viết lại kỳ vọng của hai hồ sơ đã ký không được thước giữ như AC-6 hứa. Cần ghi hai lối miễn này vào expected của E6, hoặc cho tệp hỗ trợ một phép kiểm hành vi, thay cho phép kiểm chuỗi con.

- **Removing data-mo-muc-tieu from the KR button in «KR bạn phụ trách» breaks signed ui-check dat-okr-trong-crm E11 step 10, and AC-6 does not see it**
  file: `apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx:83`
  severity: medium
  source: bugs
  AC: AC-6
  detail: This round's fix (f1dd62d71, acting on the S4-r1 finding) removed `data-mo-muc-tieu={mucTieu.id}` from the KR-name button in PhanKrPhuTrach. That button is rendered inside `<section data-trang-thai="ST-cuatoi-codulieu">`. The signed record dat-okr-trong-crm (status: signed-off) has eval E11 (ui-check). Its gauge `_acceptance/dat-okr-trong-crm/rang/man-okr.mjs:987-1000` asserts on exactly that attribute: `kiem("E11 buoc 10: KR cua truong o phong ban khac khong co trong KR ban phu trach", await coSel(c, `${P3} [data-kr='${OKR.o5.kr[0]}'] [data-mo-muc-tieu='${OKR.o5.id}']`))` with P3 = "[data-trang-thai='ST-cuatoi-codulieu']". Since kr[0] belongs to truong, o5 sits in the `kr` group of chiaPhanBa, not in thamGia. Inside a `[data-kr]` row (SimpleTableRow) the only element that carried data-mo-muc-tieu was this button (ChipGopY only has data-chip-gop-y). So this selector can no longer match and step 10 turns red. The loop at line 992 (`${P3} [data-mo-muc-tieu='${OKR[o].id}']` for o3/o4/o5) is also at risk for every objective where truong owns a KR. E11's paths include `apps/app/app/(app)/[slug]/okr/**`, so strict recheck will mark it stale and rerun it red at the merge gate. Nothing in this round's records (review-findings.md, decisions.jsonl, run-log.jsonl, contract.md, evidence-report.md) mentions dat-okr-trong-crm. The AC-6 scanner `rang/khong-doi-hinh.mjs` does not catch it either, because quetLop only collects evals with executor test/script (`if (["test", "script"].includes(...)) continue;`) and skips ui-check. So `--chi-tinh` and the full run both report «dat» while a signed screen gauge has been broken by this round. Either update man-okr.mjs:992/998 to `[data-mo-kr='<kr id>']`, with a fix line in the dat-okr-trong-crm decision log by the repo owner, or record it as a known break on the gate card.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bảng chủ bài chu-bai.json do tác giả tự khai, không rút từ eval của hồ sơ đã ký, nên kiemSo xanh dù hồ sơ thật chạy bài đó không có dòng sổ**
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/chu-bai.json:7`
  severity: high
  source: measurement
  AC: AC-6
  detail: Vòng này thay kiemSo: không còn quét mọi sổ, mà tra `const slug = chu[t]` (khong-doi-hinh.mjs:235) trong chu-bai.json viết tay. Mỗi tệp chỉ có MỘT chủ, và không có gì kiểm chủ đó có eval chạy tệp. Trong khi đó quetLop (dòng 138-167) đã tính được đúng tập hồ sơ đã ký có eval chạy tệp, mà kiemSo không dùng. Đã kiểm trên cây: (a) chu-bai.json:7 gán apps/app/test/okr-cua-toi-ba-phan.dom.tsx cho `dieu-huong-khu-muc-tieu`. Hồ sơ này không có eval nào nhắc hay chạy tệp đó (grep evals.yaml rỗng, không config key nào của nó chạy tệp), nhưng lại đúng là nơi đã ghi dòng fix d-20261024T080009Z-54. Hai hồ sơ signed-off thật sự chạy tệp này là vo-khu-muc-tieu (vkm_loi_vao_cu) và doi-nhan-khu-muc-tieu (dnk_bai_cu); không hồ sơ nào có dòng fix nhắc okr-cua-toi-ba-phan. (b) thong-bao-ghi.integration.spec.ts -t htb-kenh, tức đúng bài bị sửa ở dòng 376, còn được chu-may-sinh-ten-moi (cmst_nhac, signed-off) chạy; sổ của hồ sơ này có 0 dòng fix nhắc tệp. (c) okr-tai-co-cau.dom.tsx còn được ux-lai-thu-8c-okr (u8d_dom) chạy, và hồ sơ này không có dòng fix của vòng này. `bun khong-doi-hinh.mjs --chi-tinh` in «KET LUAN khong-doi-hinh tinh: dat», mã 0. Bảng tay được viết theo nơi đặt sổ, rồi bên đọc tra lại chính bảng đó, nên vòng tròn tự khớp. Lời hứa AC-6 «mỗi hồ sơ bị đổi có một dòng sổ fix» không được đo. Chiều đỏ xoa-so cũng chỉ xoá sổ của `dich` theo cùng bảng tay, nên không phơi được lỗ này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hàm cocSo là hàm đồng nhất chết**
  Người dùng thấy gì: Không ảnh hưởng gì đến người dùng; chỉ làm người đọc mã của bộ kiểm tra dễ hiểu nhầm một bước thừa.
  Căn cứ: Không đụng tới màn hình hay dữ liệu của người dùng, chỉ là một dòng thừa trong công cụ kiểm tra nên sửa hay không cũng không đổi gì cho họ.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

- **dongSo nuốt lỗi đọc JSON của decisions.jsonl**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Khi sổ quyết định bị hỏng, bộ kiểm tra vẫn báo lỗi nhưng nói là thiếu dòng sổ chứ không nói là sổ hỏng.
  Căn cứ: Bộ kiểm tra vẫn đỏ nên không lọt lỗi nào, chỉ làm người sửa mất thêm một lúc để hiểu đúng nguyên nhân; sửa sau cũng rẻ.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra) và hình dạng 3 (chuỗi có mặt thay vì quan hệ): tệp hỗ trợ cap-chu-sv6.ts được miễn quét, chỉ grep hai chuỗi trong mã nguồn; còn theoCapChu bỏ soLan và khoá, thay toàn cục**
  Người dùng thấy gì: Nếu sau này có thêm một chỗ chữ «Cập nhật tuần» bị đổi ngoài ý định, bộ kiểm tra có thể không phát hiện. Hiện chưa thấy người dùng nào bị ảnh hưởng.
  Căn cứ: Rủi ro chỉ xảy ra nếu có thay đổi chữ ngoài dự kiến trong tương lai, không mất dữ liệu, và bắt được lại khi rà soát chữ trên màn hình.
  file: `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): ngoại lệ apAnh trong khoiHopLe xét từng dòng có thuộc tập hay không, không xét đúng phép thay bọc theoCapChu**
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
