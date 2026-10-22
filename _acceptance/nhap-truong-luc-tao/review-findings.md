# Review findings: nhap-truong-luc-tao (round 1)

## Trong hợp đồng

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): phép thử «cùng cột lưới» của E9 so ô tự tạo với chính khung của nó**
  file: `_acceptance/nhap-truong-luc-tao/rang/do-man.mjs:296`
  severity: high
  AC: AC-9
  source: measurement
  detail: Lời hứa của E9 là một quan hệ: mép trái của ô tự tạo phải trùng một cột của lưới ô trong form. Code lại tính `cot = [...form.querySelectorAll("[data-slot=field]")].map(o => Math.round(o.getBoundingClientRect().left))` rồi `trongLuoi = cot.some(x => Math.abs(x - rb.left) <= 1)`. Tập `cot` chứa luôn `<Field data-slot="field">` bao quanh chính ô tự tạo `b`: KhungOTao trong kieu-truong.tsx:522 vẽ Field, còn Input/nút chọn là con trực tiếp của Field dọc nên trùng mép trái của nó. Vì vậy `trongLuoi` luôn đúng. Ô tự tạo có lệch sang một cột lạ thì phép đo vẫn qua, miễn bề rộng bằng ô chuẩn. Ở ô thêm nhanh hai cột, đó chính là chỗ cần đo. Phép đo cũng không có đối chứng cho nhánh `lech`: thước mù chỉ bơm h3 vào để thử `kiemNhom`.
  rationale: AC-9 hứa hàng trường tự tạo cùng thẳng hàng với trường chuẩn, mà phép đo thẳng hàng luôn đúng nên không chứng được lời hứa đó.

- **Hình dạng 5 (tuyên quét lớp nhưng đối chứng chỉ đếm >0): thước phiếu mù của E3 chỉ cần một kiểu báo thiếu**
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx:699`
  severity: high
  AC: AC-3
  source: measurement
  detail: Đối chứng 'thuoc phieu mu' viết `if (phieuThieu().length === 0) throw ...`, trong khi bản ghi đối chứng `thoaThuanCo(false)` để trống cả mười kiểu. Đối chứng qua ngay khi một bộ dò bất kỳ báo thiếu. Nhánh CHECKBOX (dòng 617–620) luôn báo thiếu khi aria-checked khác 'true', nên chín bộ dò còn lại (TEXT, DATE, SELECT, USER, …) có mù hẳn thì đối chứng vẫn xanh. Ma trận viết sẵn có mười phần tử thì đối chứng phải đòi `phieuThieu()` trả đủ mười khoá, tức một lần kiểm cho mỗi phần tử.
  rationale: AC-3 hứa phiếu thoả thuận hiện đủ mười giá trị, nhưng thước đo của vế phiếu có thể mù chín trên mười kiểu mà đối chứng vẫn xanh.

- **Hình dạng 3 (chuỗi con có mặt thay cho giá trị đáp án): vế phiếu E3 chỉ dò mảnh chuỗi**
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx:622`
  severity: medium
  AC: AC-3
  source: measurement
  detail: E3 hứa 'hàng nào của mười trường không hiện giá trị đáp án thì ném phieu thieu'. `phieuThieu` lại chỉ kiểm `chu.includes(can[t.type])` với các mảnh DATE:'2027', PHONE:'0901', LONG_TEXT:'Dòng một'. Ngày hiện lệch một ngày (31/03 thành 30/03 vì múi giờ) vẫn chứa '2027'. Chữ dài mất dòng hai vẫn chứa 'Dòng một'. Số điện thoại bị cắt hay đổi đuôi vẫn chứa '0901'. Phép đo không ghim được quan hệ 'giá trị hiện ra = giá trị đáp án'.
  rationale: AC-3 hứa phiếu hiện đủ mười giá trị đúng, nhưng phép kiểm chỉ dò mảnh chuỗi nên không bắt được ngày lệch một ngày hay chữ dài mất dòng.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bản ghi phiếu E3 mang Ngày ở dạng máy chủ không bao giờ trả**
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx:587`
  severity: medium
  AC: AC-3
  source: measurement
  detail: `thoaThuanCo` dựng tay mười giá trị từ DAP_AN_MUOI (ngay_ky = '2027-03-31', dòng 527) rồi cho qua `dealDetailOutput.parse`. Bên ghi thật là `packages/db/src/fields.ts:205`, trả Ngày bằng `row.date.toISOString()` ('2027-03-31T00:00:00.000Z'). `fieldValueOutput` là `z.union([z.string(), …])` nên chấp nhận cả hai dạng, và bước parse không ép được fixture về khuôn của bên ghi. Vế máy chủ E3b (apps/api/test/nhap-truong-luc-tao.spec.ts:347) còn che sự khác biệt bằng `String(gia).slice(0, 10)`. Kết quả: phiếu chưa bao giờ được thử với chuỗi ISO thật mà máy chủ gửi, đúng chỗ dễ lệch ngày theo múi giờ. Lời 'mang đúng mười giá trị mà E3b chứng máy chủ lưu' trong evals vì thế không đúng với dữ liệu.
  rationale: AC-3 đòi phiếu mở ra hiện đủ mười giá trị đọc lại từ máy chủ, nhưng bài kiểm dùng dạng Ngày mà máy chủ thật không trả.

- **Hình dạng 4 (đối chứng không có mốc dương): dấu bắt buộc E1 so hai ô với nhau, cả hai cùng mất dấu vẫn qua**
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx:417`
  severity: medium
  AC: AC-1
  source: measurement
  detail: Phép kiểm `if (ten.hasAttribute("required") !== batBuoc.hasAttribute("required")) throw 'thieu dau bat buoc'` chỉ so ô Tên với ô bat_buoc. Hai ô cùng vẽ qua ONhapTao (kieu-truong.tsx:551 `required={moTa.batBuoc}`). Một hồi quy làm mất `required` ở ONhapTao thì cả hai cùng false, đẳng thức vẫn đúng và test xanh. Không có lần kiểm nào ghim rằng ô Tên thật sự mang dấu bắt buộc, nên phép so dựa trên một mốc không ai kiểm.
  rationale: AC-1 hứa ô bắt buộc mang dấu bắt buộc như ô Tên, mà phép so hai ô với nhau không chứng được ô Tên thật sự mang dấu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Câu lỗi bắt buộc viết thẳng trong service, không qua FIELDS_CONFIG.messages, và nói khác câu của chính luật đó ở @crm/db**
  Người dùng thấy gì: Người gọi trực tiếp qua API có thể thấy hai câu báo lỗi khác nhau cho cùng một lỗi trường bắt buộc để trống. Người dùng trên màn hình không thấy khác biệt vì app tự dựng câu của nó.
  Căn cứ: Chỉ lệch chữ ở câu báo lỗi dành cho người gọi API, việc chặn tạo vẫn đúng và không mất dữ liệu; thống nhất chữ sau này rẻ và không gấp.
  file: `apps/api/src/fields/fields.service.ts`
  severity: medium
  Đề xuất: known-limits

- **useKhaiForm đồng bộ trạng thái «có thay đổi» bằng useEffect, trong khi trước đây việc này làm trong hàm xử lý sự kiện**
  Người dùng thấy gì: Không ảnh hưởng người dùng: hộp hỏi bỏ thay đổi vẫn hiện đúng khi đóng ô thêm nhanh sau khi đã gõ. Chỉ là cách viết mã lệch quy ước nội bộ.
  Căn cứ: Không có hậu quả nhìn thấy cho người dùng và không mất dữ liệu; sửa chỉ là chỉnh phong cách mã nên chi phí không đáng mở việc riêng.
  file: `apps/app/components/crm/record-sheet/quick-add.tsx`
  severity: low
  Đề xuất: wont-fix

- **17 khoá chữ của form tạo cũ được cho vào danh sách miễn trừ CHUA_NOI_KHAI thay vì bị xoá**
  Người dùng thấy gì: Trong kho chữ của app còn 17 dòng không còn được dùng ở màn nào. Người dùng không thấy gì, chỉ là chữ thừa nằm lại.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; dọn sau lúc nào cũng được mà không rủi ro.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Tạo cá nhân hỏng ở bước ghi trường tự tạo vẫn để lại công ty tạo từ tên miền email (công ty mồ côi, Kara vẫn được giao làm giàu)**
  Người dùng thấy gì: Khi tạo cá nhân gặp lỗi giá trị hiếm ở một trường tự tạo (ví dụ lựa chọn vừa bị lưu trữ), người dùng nhận báo lỗi nhưng công ty suy ra từ email vẫn được tạo và Kara vẫn đi làm giàu. Người dùng phải tự xoá công ty thừa.
  Căn cứ: Chỉ xảy ra trong tình huống hiếm, để lại một công ty thừa nhưng không mất dữ liệu thật và xoá tay được; sửa đụng tới thứ tự giao dịch nên tốn hơn hậu quả.
  file: `apps/api/src/contacts/contacts.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi tải fields.list hay fields.layout bị nuốt: form tạo hiện như không có trường tự tạo, dùng bố trí mặc định và vẫn cho gửi**
  Người dùng thấy gì: Khi danh sách trường không tải được, form vẫn mở không có ô trường tự tạo và không có nút thử lại. Nếu có trường bắt buộc thì người dùng chỉ nhận báo lỗi sau khi bấm Tạo.
  Căn cứ: Tải lại trang là gỡ được, không mất dữ liệu đã lưu và hợp đồng đã chủ ý cho phép gửi khi danh sách lỗi; thêm màn lỗi riêng có thể làm sau.
  file: `apps/app/components/crm/fields/form-tao.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): đối chứng 'abc' vào ô Số của E3**
  Người dùng thấy gì: Không ảnh hưởng trực tiếp người dùng. Bài kiểm tự động về nhập chữ vào ô số chưa chặt, nên một lỗi khác có thể làm bài xanh nhầm.
  Căn cứ: Chỉ là độ chặt của bài kiểm phụ ngoài các tiêu chí đã hứa, người dùng không mất gì; không đáng mở việc riêng.
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bố trí trường của bài DOM không đi qua bộ sinh thật sapBoTri**
  Người dùng thấy gì: Bài kiểm tự động dùng bố trí trường dựng tay, hơi khác bố trí thật mà Cài đặt sinh ra. Người dùng không thấy gì, nhưng một lệch giữa bố trí thật và form có thể lọt khỏi bài kiểm này.
  Căn cứ: Không có hậu quả cho người dùng và các bài kiểm khác trong vòng vẫn đi qua bộ sinh thật; chỉnh lại fixture rẻ nhưng không gấp.
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
