# Review findings — tro-ly-okr-de-xuat (round 4)

## Trong hợp đồng

- **kiemCa không đọc kyVong.vietLai và miễn cả vanDe bị luật lớp 7 phủ — 9/22 ca bộ Viết lại đạt DUNG dù nop_de_xuat rỗng**
  file: `_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs:477`
  severity: medium
  AC: AC-14
  source: bugs
  detail: `kiemCa` chỉ đòi dòng cho `kyVong.vanDe` không nằm trong `vanDePhuBoiLuot7(ca)` (kiemOkr = luatDaHoi), và không nơi nào trong kho đọc `kyVong.vietLai` (grep: chỉ superRefine của okr-ca-gop-y.ts nhắc tới). Chạy kiemOkr trên bộ mẫu: gy-01, gy-02, gy-03, gy-07, gy-11, gy-14, gy-19, gy-20, gy-21 ra tập yêu cầu rỗng — một lượt nộp 0 dòng, outcome `da-nop` vẫn in `DUNG` và góp vào `ma: n/n` xanh. Riêng gy-02 và gy-14 khai `vanDe: ["kr-la-viec"]` + `vietLai: ["kr.title"]` nhưng bị miễn vì KR mở bằng «Gọi»/«Tổ chức» — trái với chữ E22 «mỗi kyVong.vanDe có ≥ 1 dòng đúng trường hoặc đúng maVanDe» (evals.yaml không nói miễn) và với instructions.md («Still propose a viet-lai line for that same field»). Bộ tự kiểm `tuKiemCa` mới thêm vòng này không có ca nào cho vietLai nên lỗ hổng không lộ. Miễn lớp 7 có từ aa08f5ea (đợt sửa 2); vietLai chưa bao giờ được đo — ghi để parent đối chiếu run-log. Sửa gọn: với vanDe bị phủ bởi lớp 7 vẫn đòi ≥ 1 dòng viet-lai đúng trường của `E22.truongCuaVanDe[vd]`; và với `kyVong.vietLai` không rỗng đòi ≥ 1 dòng `viet-lai` trạng thái `cho` đúng trường; thêm hai ca `tuKiemCa` tương ứng.
  rationale: AC-14 đòi mỗi kyVong.vanDe có dòng đúng trường ở mọi ca, không nêu miễn trừ; phép chấm miễn nhiều ca nên chốt bằng mã này không thật sự chứng minh điều AC hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ba ý chấm judge nay sống ở hai bản chép đã lệch chữ nhau**
  Người dùng thấy gì: Bảng chủ kho chấm thử và câu hỏi máy chấm dùng hai bản chữ hơi khác nhau. Con số 'máy khớp người' có thể đo hai đề bài không hẳn giống nhau, nên độ tin cậy của phép hiệu chỉnh kém hơn vẻ ngoài.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/hieu-chinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Kết luận mục 3 của luat-kho.md là chữ cứng, không suy từ kết quả quét**
  Người dùng thấy gì: Một đoạn kết luận trong báo cáo kiểm luật kho là câu viết sẵn. Nếu mã đổi sau này, báo cáo vẫn khẳng định như cũ và không ai được báo, nhưng hôm nay nội dung vẫn đúng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: low
  Đề xuất: known-limits

- **Bao đóng import chỉ đi theo «./», import «../» rơi thành «nguồn ngoài kho» im lặng**
  Người dùng thấy gì: Bộ quét luật kho có một kẽ hở: nếu sau này có tệp nhập theo đường dẫn lùi thư mục, nó sẽ bị bỏ qua mà báo cáo vẫn ghi là sạch. Hiện chưa có tệp nào như vậy nên chưa gây hại.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho-lan-theo.mjs`
  severity: low
  Đề xuất: known-limits

- **Ca tự kiểm dựng dòng viet-lai không có truoc — bản ghi không thể tồn tại**
  Người dùng thấy gì: Một ca tự kiểm dùng dòng giả thiếu vài trường mà dòng thật luôn có. Kết quả kiểm vẫn đúng, chỉ là dữ liệu mẫu chưa giống thật.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs`
  severity: low
  Đề xuất: wont-fix

- **phanLoaiSo xếp nhầm số ngoài chuỗi thành «trong chuỗi» — hai literal bị giấu khỏi bảng «đọc tay» của luat-kho.md §3**
  Người dùng thấy gì: Báo cáo kiểm luật kho bỏ sót hai con số 10 nằm trong mã đọc số tiếng Việt, nên ghi là đã xem hết trong khi còn hai chỗ chưa ai đọc. Không ảnh hưởng người dùng, chỉ làm bằng chứng nghiệm thu nói hơi quá.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — judge là thước duy nhất cho ba luật mới, không có đối chứng đỏ cho judge**
  Người dùng thấy gì: Việc Trợ lý không đặt số vào tên Mục tiêu và không thêm ý ngoài lề hiện chỉ do máy chấm bằng lời kiểm tra, chưa có ca xấu đã biết để chứng minh máy chấm bắt được. Đề xuất xấu vẫn có thể lọt qua mà không ai thấy.
  file: `apps/agent/evals/okr/gop-y.eval.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — fixture khai đủ véc-tơ kỳ vọng nhưng kiemCa chỉ khẳng định hai phần tử; kyVong.vietLai chết**
  Người dùng thấy gì: Nhiều ca mẫu khai rằng Trợ lý phải viết lại một câu cụ thể, nhưng phép chấm không kiểm điều đó. Trợ lý có thể chỉ hỏi lại người dùng thay vì viết lại mà ca vẫn được tính là đạt.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs`
  severity: medium
  Đề xuất: new-contract

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

⚠ Cụm ngoài vùng phủ: 3/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs, _acceptance/tro-ly-okr-de-xuat/rang/luat-kho-lan-theo.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
