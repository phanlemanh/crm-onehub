# Review findings: tro-ly-okr-de-xuat (round 5)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kết luận mục 3 của luat-kho nói luật «không viết hai lần» ĐẠT chỉ vì không nhãn nào chứa chữ TRÙNG, trong khi chính bảng ghi một cặp trùng nghĩa**
  Người dùng thấy gì: Báo cáo kiểm luật kho có thể ghi «đạt» ở chỗ đáng lẽ phải ghi còn một đơn vị thời gian khai hai lần. Người dùng cuối không thấy gì; chỉ người đọc báo cáo nghiệm thu có thể tin nhầm là luật đã được đo kỹ.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Mục phanLoaiTay mới cho NGAY_MS ở okr-tro-ly-danh-muc.ts là mục chết: tệp này nằm trong danh sách cấu hình mà thước bỏ qua khi quét**
  Người dùng thấy gì: Một dòng ghi chú trong báo cáo kiểm luật kho không bao giờ được dùng tới, nên báo cáo thiếu dấu vết về việc gộp hằng số thời gian. Người dùng không bị ảnh hưởng gì.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho-cau-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

- **Còn sót import MINUTE_MS không dùng sau khi chuyển NGAY_MS về một nguồn (biome noUnusedImports)**
  Người dùng thấy gì: Còn sót một dòng khai báo thừa trong mã, chỉ gây cảnh báo cho lập trình viên. Người dùng không thấy và không bị ảnh hưởng.
  file: `packages/db/src/okr-xu-huong.ts`
  severity: low
  Đề xuất: wont-fix

- **gop-y.eval.ts tự dựng lại MINUTE_MS dù @crm/db/okr-tro-ly-danh-muc đã xuất sẵn**
  Người dùng thấy gì: Bộ kiểm chất lượng góp ý tự khai lại đơn vị phút thay vì dùng chung một nơi, có thể lệch nếu sau này đổi. Người dùng không thấy khác biệt.
  file: `apps/agent/evals/okr/gop-y.eval.ts`
  severity: low
  Đề xuất: known-limits

- **Phán quyết tay mới cho NGAY_MS trong luat-kho không bao giờ khớp dòng nào**
  Người dùng thấy gì: Báo cáo kiểm luật kho có một phán quyết trông như đã đo nhưng thực ra không được đo. Chỉ ảnh hưởng độ tin cậy của báo cáo nghiệm thu, không ảnh hưởng người dùng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho-cau-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: lời hứa «không viết hai lần một đơn vị» là quan hệ giữa các khai báo, nhưng kết luận chỉ kiểm chữ «TRÙNG» có mặt trong nhãn viết tay**
  Người dùng thấy gì: Báo cáo kiểm luật kho chưa thật sự so các khai báo đơn vị với nhau, chỉ dựa vào chữ người ghi tay. Người dùng cuối không thấy; muốn đo thật thì cần một việc riêng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: medium
  Đề xuất: new-contract

- **Bao đóng import chỉ đi theo «./», import «../» rơi thành «nguồn ngoài kho» im lặng (r4)**
  Người dùng thấy gì: Bộ quét luật kho có một kẽ hở: nếu sau này có tệp nhập theo đường dẫn lùi thư mục, nó sẽ bị bỏ qua mà báo cáo vẫn ghi là sạch. Hiện chưa có tệp nào như vậy nên chưa gây hại.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho-lan-theo.mjs`
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

- **Tiền tố ghi chú vết «tro-ly-okr:» được đúc lại bằng regex ở client thay vì dùng chung một nguồn (r1)**
  Người dùng thấy gì: Nhãn «theo đề xuất của Trợ lý OKR» trên tab Vết hiện đúng bây giờ. Nếu sau này chuỗi đánh dấu bị đổi ở một phía, nhãn này sẽ biến mất trên màn mà không có cảnh báo nào.
  file: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx`
  severity: medium
  Đề xuất: known-limits

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

⚠ Cụm ngoài vùng phủ: 4/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs, _acceptance/tro-ly-okr-de-xuat/rang/luat-kho-cau-hinh.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
