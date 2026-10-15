# Review findings: mau-trang-thai-chung (round 1)

## Trong hợp đồng

- **Strict-mode scan (AC-3, 13 khu files) misses color strings passed via a variable, function argument, array row or &&**
  AC: AC-3
  file: `packages/ui/test/quet-mau-trang-thai.ts:55`
  severity: medium
  source: bugs
  detail: laViPham only flags a color literal when its direct parent (after skipping as/satisfies/paren/?:/??/||) is a JSX tone attribute, return, case, an object property, or a Map tuple. Several other positions return false even with chat=true. I confirmed each one with a probe calling quetMau(..., {chat:true}), and every case below returned []: (1) `const MAU = "success"; <StatusIndicator tone={MAU}/>` (parent is a VariableDeclaration), (2) `tone={chon(d, "success", "error")}` (parent is a CallExpression), (3) `const ROWS = [{ id: "a", tone: "success" }]` (laBangChua returns false when the object sits in an ArrayLiteral), (4) `tone={d && "success"}` (boNgoac does not skip &&). AC-3 and E3 promise that the 13 khu files have no color string anywhere, including the JSX tone prop. Test '13 tep khu khong truyen mau bang chuoi' in apps/app/test/mau-trang-thai-anh-xa.spec.ts runs this function, so a khu file that brings back a hand-written color through any of these four forms passes green without any warning. E3's red direction (2) only exercises the ternary form, which is why the gap is not visible.
  lý do thuộc hợp đồng: AC-3 hứa trong 13 tệp khu không chỗ nào truyền màu bằng chuỗi, và bài quét chế độ nghiêm lọt bốn dạng truyền màu nên lời hứa này không được bảo vệ.

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): «13 tệp khu, mỗi tệp 0 vi phạm» bỏ qua hẳn enrichment-status.ts**
  AC: AC-3
  file: `apps/app/test/mau-trang-thai-anh-xa.spec.ts:213`
  severity: high
  source: measurement
  detail: Test «13 tep khu khong truyen mau bang chuoi» (dòng 213-220) gọi quetMau(..., { chat: true }) trên 13 tệp rồi chỉ đòi vp.length === 0. Nhưng dòng 148 của quet-mau-trang-thai.ts thoát sớm `if (!THANH_PHAN_CHAM.test(nguon)) return []`, với THANH_PHAN_CHAM = /\b(StatusIndicator|IndicatorDot|StatusTone)\b/. apps/app/lib/enrichment-status.ts không có chữ nào trong ba chữ đó (nó chỉ import toneTheoNghia/NghiaTrangThai), nên tệp này không bao giờ được quét. Tôi đã thử trong bộ nhớ: thay `tone: toneTheoNghia(nghia)` bằng `tone: hang ? "info" : "success"` và thêm `mau: "warning"` vào PRESENTATION, quetMau vẫn trả [] ở cả chat lẫn loose. Chỉ thêm `import type { StatusTone }` thì nó bắt được 3 vi phạm. Không có đối chứng dương theo từng tệp, ví dụ ít nhất một nút được duyệt hay một ca cài chuỗi cho mỗi tệp. Chiều đỏ (2) chỉ chạm kr-viec, một tệp có import StatusIndicator. Vì vậy lời hứa của AC-3 «trong 13 tệp khu không chỗ nào truyền màu bằng chuỗi» chỉ được đo trên 12 tệp, còn phép đếm 13 vẫn xanh.
  lý do thuộc hợp đồng: AC-3 hứa rõ ràng cả 13 tệp khu không truyền màu bằng chuỗi, nhưng bài kiểm bỏ qua hẳn một tệp nên lời hứa chỉ được đo trên 12 tệp.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **nghiaPhanHoi tra khoá bằng `in` rồi ép kiểu, nên khoá của Object.prototype lọt qua**
  Người dùng thấy gì: Nếu lịch bên ngoài trả về một giá trị phản hồi bất thường, chấm của người dự họp đó có thể mất màu thay vì hiện màu nháp. Giá trị như vậy gần như không xuất hiện trong thực tế.
  file: `packages/ui/src/components/attendee-list.tsx`
  severity: low
  Đề xuất: wont-fix

- **Non-strict scan flags non-color status values (case labels, state/type properties) as 'khai bang mau rieng'**
  Người dùng thấy gì: Về sau, một người viết mã hợp lệ có thể bị bài kiểm báo đỏ nhầm với thông báo gây khó hiểu, và phải gỡ rối mất thời gian. Người dùng cuối không bị ảnh hưởng.
  file: `packages/ui/test/quet-mau-trang-thai.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-3 đọc bảng NGHIA_* mà khu khai, không đo màu khu thật sự vẽ**
  Người dùng thấy gì: Một số màn có thể về sau vẽ chấm trạng thái sai màu mà bài kiểm vẫn xanh, vì bài kiểm chỉ so bảng khai chứ không nhìn màu thực sự hiện ra. Hiện chưa thấy màn nào sai.
  file: `apps/app/test/mau-trang-thai-anh-xa.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận viết trước): E1 duyệt chính TONE_THEO_NGHIA đang bị kiểm, không ghim sáu khoá hay ketThuc = neutral**
  Người dùng thấy gì: Nếu ai đó đổi màu của trạng thái đã kết thúc, hoặc thêm bớt một nghĩa, và sửa cả tài liệu theo, bài kiểm vẫn xanh. Khi đó màu hiển thị cho người dùng có thể đổi mà không ai được báo.
  file: `packages/ui/test/status-tone.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/6 lỗi rơi vào file không bộ đo nào phủ (packages/ui/test/quet-mau-trang-thai.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
