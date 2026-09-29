# Review findings — tro-ly-okr-de-xuat (round 3)

## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình, đối chứng không đi qua thước): ca đối chứng E22 không còn đi qua kiemCa, nên nhánh khongGopY của thước mất chiều đỏ**
  file: `_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs:512`
  severity: high
  AC: AC-14
  source: measurement
  detail: Trong chamBoCa (dòng 508-512), ca đối chứng giờ tính `batDuoc = choDoiChung.length > 0`: bất kỳ dòng 'cho' nào cũng đủ, và kiemCa không được gọi. Bản trước là `kiemCa(E22.caDoiChung, …).some(l => l.startsWith("khongGopY"))`. Trong khi đó, cái chấm đúng/sai các ca khongGopY thật là kiemCa dòng 447, và nó chỉ bắn khi có dòng `viet-lai` (`ca.kyVong.khongGopY && vietLai.length > 0`). Hai điều kiện này là hai quan hệ khác nhau. Đối chứng xanh chỉ chứng minh tác tử có ra dòng; nó không chứng minh nhánh khongGopY của thước có bắt được lỗi. Bằng chứng cụ thể: .acceptance-runs/tro-ly-okr-de-xuat/cham-lai-r3/xanh.out:33 in `DOI CHUNG doi-chung-goi-50-cuoc: bat duoc — 2 dong cho (hoi:muc-tieu-la-so, hoi:kr-la-viec)`. Bản ghi đó chỉ có hai dòng `hoi` và 0 dòng viet-lai, nên nếu đưa qua kiemCa thì sẽ ra DUNG, tức là đối chứng 'bắt được' đúng một bản ghi mà thước chấm là đạt. Giả sử dòng 447 bị hỏng (ví dụ điều kiện không bao giờ đúng), E22 vẫn thoát 0 với 'bat duoc'. Ngoài đối chứng này, không có tự kiểm nào khác cho kiemCa: tuKiem/tuKiemTen chỉ thử bộ so cụm từ và họ tên.
  rationale: AC-14 hứa chốt bằng mã «ca khongGopY không có dòng viết lại»; ca đối chứng không còn chạy qua đúng hàm chấm đó nên không chứng minh được chốt này có thể đỏ, làm bằng chứng của AC-14 không đứng vững.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **instructions.md tells the model to keep the number in a Mục tiêu rewrite, which contradicts CONTEXT.md**
  Người dùng thấy gì: Khi góp ý một Mục tiêu có con số như «Tăng NPS lên 60», Trợ lý có thể viết lại câu mới mà vẫn giữ số 60 trong tên Mục tiêu. Từ điển của sản phẩm quy định con số phải nằm ở kết quả then chốt, nên người dùng có thể nhận một gợi ý đi ngược quy ước đặt tên.
  file: `apps/agent/agent/subagents/tro_ly_okr/instructions.md`
  severity: high
  Đề xuất: known-limits

- **luat-kho section 6 cannot see writes made inside @crm/db helpers, so «API chỉ ghi AgentTask/OkrDeXuat/OkrService» is not proven**
  Người dùng thấy gì: Báo cáo bằng chứng có thể không phát hiện nếu sau này có đoạn mã ghi thẳng vào dữ liệu OKR theo đường vòng. Hiện tại không có việc ghi nào như vậy nên người dùng chưa bị ảnh hưởng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: medium
  Đề xuất: known-limits

- **luat-kho section 3 files the AGENTS.md «Don't» pattern under a label that reads as acceptable**
  Người dùng thấy gì: Báo cáo bằng chứng liệt kê các con số cố định trong mã mà không nói rõ chúng có thể đáng bị gom về một chỗ. Người duyệt có thể bỏ qua chúng, và sau này ai muốn chỉnh một mốc thời gian hay ngưỡng có thể phải tìm ở nhiều nơi.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: medium
  Đề xuất: known-limits

- **`--cham-lai` re-grade exits 0 even though it skips two E22 checks**
  Người dùng thấy gì: Khi chấm lại kết quả cũ bằng chế độ ngoại tuyến, hai kiểm tra bị bỏ qua nhưng kết quả vẫn báo đạt như một lần chạy đầy đủ. Người xem có thể tưởng đó là bằng chứng đầy đủ trong khi thiếu hai kiểm tra.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **luat-kho marks code number literals as 'trong chuỗi' when a closed string appears earlier on the same line**
  Người dùng thấy gì: Báo cáo bằng chứng đếm sai số lượng hằng số nằm trong chuỗi chữ, nên người duyệt có thể tin rằng có nhiều số vô hại hơn thực tế. Sản phẩm người dùng không bị ảnh hưởng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: medium
  Đề xuất: known-limits

- **E22 runs up to 3 more eve evals before checking whether the main eve crashed, timed out or hit a config error**
  Người dùng thấy gì: Nếu lượt đo chính bị treo hoặc lỗi cấu hình, bộ đo vẫn chạy thêm tới ba lượt nữa rồi mới báo không đo được. Người vận hành có thể mất vài giờ và một khoản tiền gọi mô hình cho một lượt đã biết là vô ích.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **--cham-lai exits 0 while skipping two E22 checks (so-moi-lot, noi-ve-nguoi)**
  Người dùng thấy gì: Chấm lại kết quả cũ bằng chế độ ngoại tuyến báo đạt giống hệt một lượt đầy đủ dù đã bỏ qua hai kiểm tra bắt buộc. Người xem có thể ghi nhận nó là bằng chứng chính thức khi chưa đủ.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp mà chỉ có vài mẫu điểm) kèm hình dạng 4: mục 7 «Dấu hiệu vẽ tay» của luat-kho kết luận âm tính bằng 4 regex, không đối chứng dương**
  Người dùng thấy gì: Phần kiểm tra giao diện vẽ tay trong báo cáo bằng chứng chỉ dò được một số kiểu và bỏ sót vài màn Trợ lý OKR. Kết quả «không có vi phạm» vì vậy chưa chắc chắn, dù soát tay chưa thấy lỗi nào.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp mà chỉ có danh sách điểm): mục 6 luat-kho kết luận «chỉ ghi AgentTask, OkrDeXuat, OkrService» nhưng lời gọi hàm ghi của @crm/db chỉ nhận ra được xepViecTroLy**
  Người dùng thấy gì: Báo cáo bằng chứng khẳng định Trợ lý chỉ ghi vào ba loại dữ liệu, nhưng nếu sau này có hàm mới ghi vào chỗ khác thì báo cáo sẽ không thấy. Hiện tại chưa có việc ghi ngoài dự kiến nào.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: low
  Đề xuất: known-limits

- **Punctuation list in soBangChu.dauCau has a second hardcoded copy in the tokenizer regex (r2)**
  Người dùng thấy gì: Nếu sau này ai đó thêm một dấu câu vào danh sách cấu hình, Trợ lý OKR sẽ không nhận ra dấu đó khi kiểm số viết bằng chữ và việc chỉnh cấu hình không có tác dụng. Hiện tại chưa gây sai kết quả cho người dùng.
  file: `packages/validation/src/okr-kiem-de-xuat.ts`
  severity: low
  Đề xuất: known-limits

- **«một»/«năm» before «tỷ lệ», «tỷ trọng» or «tỷ suất» is read as a number, so good rewrites are wrongly rejected as so-moi (r2)**
  Người dùng thấy gì: Một số câu viết lại tốt có cụm như «một tỷ lệ» hay «một tỷ trọng» bị Trợ lý OKR hiểu nhầm là số mới và âm thầm loại bỏ. Người dùng sẽ không thấy các gợi ý đó dù chúng đúng.
  file: `packages/validation/src/okr-kiem-de-xuat.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (thước chép khuôn bên đọc) — so-moi-lot.mjs nay lọc «một/năm» bằng chính bảng soBangChu và lối của bộ kiểm đang đo (r2)**
  Người dùng thấy gì: Phép đo kiểm tra số mới lọt qua đang dùng chung bảng quy tắc với bộ kiểm, nên một lỗi trong bảng đó làm cả hai cùng bỏ sót mà phép đo vẫn báo sạch. Người duyệt có thể tưởng đã có hai lớp kiểm độc lập trong khi thực tế chỉ có một.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/so-moi-lot.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — bài «vung thong bao nhan con tro khi hop modal khoa body» đo tên class thay vì con trỏ thật (r2)**
  Người dùng thấy gì: Bài kiểm cho việc bấm được nút Hoàn tác khi một hộp thoại đang mở chỉ kiểm tên kiểu chữ chứ không thử bấm thật. Nếu kiểu đó bị mất tác dụng, nút Hoàn tác có thể không bấm được mà bài kiểm vẫn xanh.
  file: `packages/ui/test/thong-bao-tren-hop.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — bài đóng Dialog/Sheet dùng thông báo giả viết tay đúng selector của laTuThongBao (r2)**
  Người dùng thấy gì: Bài kiểm dùng một thông báo giả thay cho thông báo thật, nên nếu thư viện thông báo đổi cấu trúc, bấm nút trong thông báo có thể lại làm đóng hộp Sửa mà bài kiểm vẫn xanh.
  file: `packages/ui/test/thong-bao-tren-hop.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — «bam nut trong thong bao khong dong dialog/sheet» chỉ khẳng định không đóng, thiếu đối chứng dương (r2)**
  Người dùng thấy gì: Bài kiểm chỉ chứng minh hộp không đóng khi bấm nút trong thông báo, chưa chứng minh cách bấm mô phỏng đó thật sự đóng được hộp khi bấm chỗ khác. Bỏ đoạn xử lý này đi bài kiểm vẫn có thể xanh.
  file: `packages/ui/test/thong-bao-tren-hop.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — bài «danh sách ngữ cảnh chữ số ở một nguồn» chỉ kiểm chuỗi có mặt trong cấu hình (r2)**
  Người dùng thấy gì: Bài kiểm nói danh sách ngữ cảnh chữ số chỉ có một nguồn thực ra chỉ kiểm rằng cấu hình có chứa vài chữ. Nếu bộ kiểm lén giữ danh sách riêng giống hệt, bài kiểm vẫn xanh, nhưng hôm nay chưa có kết quả nào sai.
  file: `packages/validation/test/okr-kiem-de-xuat.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Biến môi trường TDX_* mới không được khai trong .env.example (r1)**
  Người dùng thấy gì: Ba núm chỉnh chỉ dùng khi chạy bài đo góp ý chưa được ghi chú ở nơi mọi người tra cứu cấu hình. Người mới chạy bài đo sẽ không biết các núm này tồn tại, nhưng người dùng cuối không bị ảnh hưởng.
  file: `apps/agent/agent/lib/okr/config.ts`
  severity: medium
  Đề xuất: known-limits

- **Payload của việc okr-de-xuat bị parse hai lần bằng hai khuôn khác nhau trong cùng đường đọc (r1)**
  Người dùng thấy gì: Số đo góp ý bật hay ẩn trên thẻ quản trị hiện đúng. Nhưng nếu sau này ai đó đổi mặc định của chế độ bật/ẩn ở một chỗ mà quên chỗ kia, số trên thẻ có thể lệch mà không ai hay.
  file: `apps/api/src/okr/tro-ly-so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Tiền tố ghi chú vết «tro-ly-okr:» được đúc lại bằng regex ở client thay vì dùng chung một nguồn (r1)**
  Người dùng thấy gì: Nhãn «theo đề xuất của Trợ lý OKR» trên tab Vết hiện đúng bây giờ. Nếu sau này chuỗi đánh dấu bị đổi ở một phía, nhãn này sẽ biến mất trên màn mà không có cảnh báo nào.
  file: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx`
  severity: medium
  Đề xuất: known-limits

- **KIEU_KR bị chép lại trong @crm/db thay vì có một nguồn duy nhất (r1)**
  Người dùng thấy gì: Danh sách sáu kiểu KR được khai ở hai nơi. Hiện tại chúng khớp nhau và có bài kiểm canh, nên người dùng không thấy khác biệt nào.
  file: `packages/db/src/okr-xu-huong.ts`
  severity: low
  Đề xuất: wont-fix

- **okr.troLyAn tải toàn bộ lượt trong tháng rồi lọc và cắt 50 trong bộ nhớ (r1)**
  Người dùng thấy gì: Khi quản trị mở thẻ «Góp ý của Trợ lý OKR», hệ thống đọc cả tháng dữ liệu rồi mới cắt bớt. Với lượng dùng hiện nay vẫn đúng, nhưng thẻ có thể mở chậm dần khi số lượt ẩn trong tháng lớn lên.
  file: `apps/api/src/okr/tro-ly.service.ts`
  severity: low
  Đề xuất: known-limits

- **okr.troLyDanhSach là @Query (GET) nhưng ghi okrDeXuat (het-han, hienLuc) (r1)**
  Người dùng thấy gì: Việc mở cột góp ý có ghi dấu «đã hiện» và đánh dấu hết hạn ngay khi đọc danh sách, thay vì qua một thao tác ghi riêng. Người dùng không thấy khác biệt; chỉ là cách làm không giống chỗ khác trong màn OKR.
  file: `packages/db/src/okr-de-xuat.ts`
  severity: low
  Đề xuất: wont-fix

- **Ba truy vấn JSON-path theo payload.nac không thấy AgentTask cũ (payload chưa có khoá nac) (r1)**
  Người dùng thấy gì: Lượt góp ý cũ tạo trước bản này có thể không được nhận ra là đang chạy, nên người dùng có thể bị tạo thêm một lượt song song ngay lúc triển khai. Chỉ xảy ra nếu còn lượt cũ đang chạy đúng thời điểm đó.
  file: `packages/db/src/okr-tro-ly.ts`
  severity: low
  Đề xuất: wont-fix

- **kichLuotAn nuốt thông điệp lỗi, chỉ ghi tên lớp lỗi (r1)**
  Người dùng thấy gì: Nếu việc xếp lượt góp ý ẩn hỏng lặp đi lặp lại, người lưu Mục tiêu không bị chặn nhưng nhật ký chỉ nói loại lỗi chứ không nói lý do. Người vận hành sẽ khó tìm nguyên nhân khi chế độ ẩn im lặng không chạy.
  file: `apps/api/src/okr/okr.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — âm-tính-một-mình: ca «không thấy dòng ẩn» ở nấc an khẳng định tập rỗng khi API về cấu trúc đã luôn trả rỗng (r1)**
  Người dùng thấy gì: Một bài kiểm việc «người dùng không thấy góp ý ẩn» luôn xanh vì hệ thống ở chế độ đó vốn trả danh sách rỗng. Nếu bộ lọc ẩn bị gỡ nhầm thì bài này không bắt được, dù một bài khác trong cùng tệp vẫn canh phần đó.
  file: `apps/api/test/tro-ly-okr-che-do-an.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp «một mỗi mã» nhưng danh sách 10 mã chép cứng, không rút từ MA_LOAI_DE_XUAT (r1)**
  Người dùng thấy gì: Bài kiểm nộp mười dòng bị loại dùng danh sách mười mã viết cứng. Nếu sau này thêm mã loại thứ mười một, bài này vẫn xanh mà không kiểm mã mới.
  file: `apps/agent/test/tro-ly-okr-nop.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
