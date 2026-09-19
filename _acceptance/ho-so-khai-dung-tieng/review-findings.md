# Review Findings: ho-so-khai-dung-tieng (round 2)

## Trong hợp đồng

### Máy quét AC-6 miễn cả tệp layout.tsx, và không thấy tệp chưa vào git
- AC: AC-6
- file: `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs:22`
- severity: low
- source: conventions
- Chi tiết: Hai lỗ trong chính cái lưới AC-6 dựng ra:

  1. `const MIEN = new Set(["apps/app/app/layout.tsx"])` (dòng 22) miễn CẢ TỆP. `contract.md` mục "Chín chỗ" thì chỉ miễn HAI chỗ cụ thể trong tệp đó: `<html lang>` và chuỗi `document.documentElement.lang=` trong script. Một `<span lang="en">` viết tay thêm vào `layout.tsx` sau này là vô hình với chân đo, dù đúng là chỗ khai phần mà AC-6 tồn tại để bắt. Miễn theo chỗ (khớp `<html` và khớp chuỗi script) thay vì theo tệp là khép được.

  2. `git ls-files apps/app` (dòng 40) chỉ trả tệp đã vào chỉ mục git. Một tệp `.tsx` mới, chưa `git add`, mang `lang` viết tay thì chân đo không đọc tới — mà đó chính là trạng thái của mã lúc người ta đang viết nó. `git ls-files --others --exclude-standard` cộng thêm phần đó.

  Không chỗ nào trong hai chỗ này đang đỏ hôm nay; cả hai là độ bền của cái lưới, và chúng quan trọng hơn bình thường vì lưới này chỉ chạy tay (xem finding về việc nó không nằm trong lệnh cổng nào).

### E8 chỉ đo một nửa AC-8: không hề khẳng định khối Giới thiệu vắng khỏi DOM
- AC: AC-8
- file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs:305`
- severity: high
- source: bugs
- Chi tiết: AC-8 (contract.md:46) và E8 `expected` (evals.yaml:220-225) hứa HAI điều: (a) 0 phần tử rỗng khai lang=en, và (b) "khoi Gioi thieu vang han khoi cay DOM, khong phai ve ra roi an bang CSS". Nhánh `ho-so-trong` chỉ làm (a): nó đọc `rong` từ DEM_RONG và `hong += rong`. Điều (b) không có một khẳng định nào. Dấu vết rõ: dòng 307 `const { rong, chu } = await xem(...)` lấy `chu` (innerText của tấm hồ sơ) rồi KHÔNG BAO GIỜ dùng — khẳng định (b) bị bỏ dở đúng ở đó. Đột biến E8 của pha-thu (vẽ ForeignText vô điều kiện) vẫn bị bắt vì nó tình cờ sinh ra một phần tử rỗng, nên bảng đột biến xanh và che mất lỗ này: một bản cài đặt vẽ khối Giới thiệu rỗng rồi ẩn bằng CSS (hoặc vẽ tiêu đề "Giới thiệu" với thân rỗng nhưng không có lang=en) sẽ qua E8 sạch sẽ.

### Chân đo tìm chuỗi gõ sẵn trong chính nó, trái với câu chữ của AC-1
- AC: AC-1
- file: `_acceptance/ho-so-khai-dung-tieng/rang/du-lieu-thu.mjs:3`
- severity: medium
- source: bugs
- Chi tiết: AC-1 (contract.md:39) viết rõ: "phép đo đọc giá trị giới thiệu từ máy chủ trong chính lượt chạy đó rồi tìm nó trên màn, CHỨ KHÔNG tìm một chuỗi gõ sẵn", và E1/E2/E3 `steps` đều bắt đầu bằng "Doc companies.list/contacts.list tu may chu". Thực tế: `GIOI_THIEU` (dòng 3), `TOM_TAT` (dòng 6), `NGANH` (dòng 16), `CHUC_DANH` (dòng 17) là hằng cấp module; `dat()` gieo chúng qua Prisma rồi trả về chính hằng đó, và khai-tieng-ho-so.mjs dòng 258/263/268/301 tìm đúng hằng đó trên màn. Không một lượt đọc nào quay lại từ máy chủ/REST. Đây đúng là hình dạng mà mệnh đề "không tìm một chuỗi gõ sẵn" của AC-1 được viết ra để cấm: một lỗi ở tầng API/serializer làm giá trị hiện ra khác đi (cắt bớt, escape, dịch) sẽ không được đo là lỗi hiển thị — nó chỉ rơi vào nhánh "KHONG THAY TREN MAN" và bị quy sai thành tiền đề thiếu.

### Assert "chuỗi có mặt" thay vì QUAN HỆ: AC-6(b) hứa chín chỗ đi qua ForeignText nhập từ @crm/ui, thước chỉ khớp tên thẻ
- AC: AC-6
- file: `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs:55`
- severity: medium
- source: measurement
- Chi tiết: AC-6 và `expected` của E6 khai rõ điều kiện (b): "ca chin deu di qua ForeignText nhap tu @crm/ui". mot-duong.mjs chỉ có một phép khớp chuỗi: regex THE_KHAI ở dòng 24 bắt `<Ten ... lang=`, rồi dòng 55 `if (cho.the === "ForeignText")` đánh dấu tệp là đã-qua-ForeignText. Không dòng nào đọc câu `import` của tệp. Một tệp khai `function ForeignText({lang, children}) { return <span lang={lang}>… }` cục bộ, hoặc nhập từ một module khác trùng tên, vẫn được đếm là đạt — trong khi lời hứa của cả vòng này ("chỗ gọi thứ sáu không quên được nữa") đúng là quan hệ tên-thẻ ↔ nguồn nhập, chứ không phải sự có mặt của chuỗi "ForeignText". Đột biến E6b ở pha-thu.mjs:83 có thêm dòng import nhưng chỉ để làm thừa một tệp, không kiểm chiều này.

### Assertion âm-tính-một-mình: chân ho-so-trong (AC-8) không đo nửa lời hứa "khối Giới thiệu vắng hẳn khỏi cây DOM", và không có đối chứng dương
- AC: AC-8
- file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs:305`
- severity: medium
- source: measurement
- Chi tiết: Nhánh `ho-so-trong` (dòng 305-310) gọi `xem(..., [])` với danh sách cần tìm RỖNG, nên DOC_VUNG trả về `[]` và không giá trị nào được khẳng định là có mặt. Khẳng định duy nhất là `rong > 0` với `rong` = số phần tử `[lang="en"]` rỗng chữ. `chu` (innerText của tấm hồ sơ) được lấy về ở dòng 307 rồi KHÔNG dùng ở đâu nữa — nên vế thứ hai mà evals.yaml E8 `expected` đòi ("khang dinh khoi Gioi thieu vang han khoi cay DOM, khong phai ve ra roi an bang CSS") không hề được đo. Một bản cài đặt vẽ khối Giới thiệu rỗng bằng `<div>` (không khai lang) hoặc vẽ ra rồi `display:none` sẽ cho `rong = 0` và chân này xanh. Đây là khẳng định âm-tính đứng một mình: không có chiều dương nào ghim rằng tấm hồ sơ đang xét đúng là công ty chưa enrichment và phần còn lại vẫn vẽ.

### Fixture viết tay đúng khuôn bên đọc: giá trị đo là hằng gõ sẵn trong chân đo, không round-trip từ máy chủ như AC-1/AC-2/AC-5 hứa
- AC: AC-1
- file: `_acceptance/ho-so-khai-dung-tieng/rang/du-lieu-thu.mjs:3`
- severity: medium
- source: measurement
- Chi tiết: AC-1 khai nguyên văn: "phép đo đọc giá trị giới thiệu TỪ MÁY CHỦ trong chính lượt chạy đó rồi tìm nó trên màn, chứ không tìm một chuỗi gõ sẵn", và E1 `steps` ghi "Doc companies.list tu may chu, chon mot cong ty CO truong description". Thực tế: du-lieu-thu.mjs:3 và :6 khai hằng `GIOI_THIEU`/`TOM_TAT` gõ tay, `dat()` ghi chúng vào DB rồi ở dòng 85/89 trả về CHÍNH HẰNG ĐÓ (`gioiThieu: GIOI_THIEU`) chứ không trả `congTy.description` mà Prisma đọc về; khai-tieng-ho-so.mjs:258/263 lấy hằng đó đi tìm trên màn. Không lượt nào gọi `companies.list`/`contacts.list`.

  Rõ nhất ở AC-5: du-lieu-thu.mjs:87 khai `diaDanh: "London, United Kingdom"` — một chuỗi ghép tay cho khớp đúng khuôn mà bên đọc dựng ra, `[company.city, company.stateCode, company.country].filter(Boolean).join(", ")` (company-sheet.tsx:174-178) — thay vì lấy từ chính hàm của sản phẩm. Đối chứng cho thấy tác giả biết lối đúng: nhãn giai đoạn của AC-4 được gọi thật qua `nhanGiaiDoan()` (khai-tieng-ho-so.mjs:115-135, "goi that, khong chep hang so vao chan do"); riêng địa danh và hai đoạn văn xuôi thì không.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Răng cấu trúc của AC-6 không nằm trong lệnh cổng nào — chỉ chạy khi ai đó chạy lại hồ sơ**
  Người dùng thấy gì: Việc kiểm tra tự động để đảm bảo không quên khai ngôn ngữ tiếng Anh ở các vị trí mới chỉ chạy khi có người chủ động yêu cầu, chứ không tự động chặn mỗi khi có thay đổi mới được đưa vào sản phẩm. Vì vậy một vị trí mới quên khai có thể lọt qua mà không ai biết ngay.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs`
  severity: high
  Đề xuất: known-limits

- **Bài kiểm trong packages/ui nhập mã của apps/app — ngược chiều phụ thuộc gói**
  Người dùng thấy gì: Bài kiểm thử cho một phần giao diện dùng chung đang phụ thuộc vào mã của một ứng dụng cụ thể theo chiều ngược với quy ước của kho, khiến phần kiểm tra kiểu dữ liệu không phủ được đoạn mã này. Nếu sau này ứng dụng đó đổi cấu trúc, lỗi có thể không được phát hiện trước khi ảnh hưởng tới người dùng.
  file: `packages/ui/test/khai-tieng.spec.tsx`
  severity: high
  Đề xuất: new-contract

- **hoi-quy-nam-cho.mjs sửa dữ liệu thật trong CSDL dev mà không có try/finally trả lại**
  Người dùng thấy gì: Một kịch bản kiểm thử tạm mượn dữ liệu thật của các thoả thuận đang có trong hệ thống phát triển để chạy thử, và nếu có sự cố giữa chừng thì các thoả thuận đó có thể bị đổi giai đoạn sai vĩnh viễn mà không ai hay biết để khôi phục.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs`
  severity: medium
  Đề xuất: new-contract

- **pha-thu.mjs nhân bản HEAD nhưng không hề báo khi cây đang xét đang bẩn**
  Người dùng thấy gì: Công cụ kiểm tra tạo một bản sao để thử nghiệm những thay đổi giả định, nhưng không cảnh báo khi thư mục làm việc thật đang có thay đổi chưa lưu — nên kết quả kiểm tra có thể mô tả một phiên bản mã khác với phiên bản người dùng đang thực sự xem xét mà không ai được báo.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: new-contract

- **rmSync đệ quy trên đường dẫn lấy thẳng từ biến môi trường, không kiểm gì**
  Người dùng thấy gì: Một script hỗ trợ kiểm thử có thể xoá toàn bộ một thư mục dựa theo một cấu hình môi trường mà không kiểm tra thư mục đó có đúng là thư mục tạm của riêng nó hay không. Nếu cấu hình trỏ nhầm, dữ liệu hoặc công việc đang làm dở ở nơi khác có thể bị xoá vĩnh viễn mà không có cảnh báo trước.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: new-contract

- **evals.yaml vẫn khai MetaLine.parts nhận chuỗi trần, trái với AC-7 đã tu chính và trái với chính phép phá**
  Người dùng thấy gì: Tài liệu mô tả kỳ vọng cho một phần kiểm tra vẫn còn ghi lại cách dùng cũ đã bị thay đổi, nên người đọc tài liệu đó để hiểu tính năng đang được kiểm tra như thế nào có thể hiểu nhầm về cách phần mềm thực sự hoạt động hôm nay.
  file: `_acceptance/ho-so-khai-dung-tieng/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **vung-khai.json thiếu hẳn trường tiếng Việt lọt mà E11 lấy làm tiêu chí PASS**
  Người dùng thấy gì: Tệp bằng chứng ghi lại kết quả kiểm tra thiếu một thông tin mà quy trình xét duyệt được yêu cầu phải dựa vào để kết luận đạt, nên kết luận 'đạt' ở đó có thể chỉ vì thông tin bị thiếu chứ không phải vì đã kiểm tra thật.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **datDuGiaiDoan mượn thoả thuận thật: bỏ cuộc im lặng, skip lệch, và không có finally để trả về**
  Người dùng thấy gì: Một công cụ hỗ trợ chuẩn bị dữ liệu thử mượn các thoả thuận thật trong hệ thống phát triển để đổi giai đoạn tạm thời, nhưng có thể âm thầm dừng sớm mà không báo hoặc bỏ sót một số thoả thuận cần trả về nguyên trạng nếu có sự cố giữa chừng — dữ liệu thật có thể bị để sai giai đoạn vĩnh viễn mà không ai biết.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/du-lieu-thu.mjs`
  severity: medium
  Đề xuất: new-contract

- **E7 expected còn mô tả API chuỗi trần đã bị hợp đồng sửa bỏ**
  Người dùng thấy gì: Tài liệu mô tả kỳ vọng cho phần kiểm tra giao diện vẫn ghi lại một cách dùng dữ liệu cũ đã không còn hợp lệ sau khi hợp đồng được sửa lại, nên người đọc tài liệu để hiểu phạm vi đã kiểm tra có thể tin nhầm rằng một tình huống không còn tồn tại vẫn đang được kiểm tra.
  file: `_acceptance/ho-so-khai-dung-tieng/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **mot-duong.mjs mù với tệp chưa track và không quét packages/ui**
  Người dùng thấy gì: Công cụ rà soát các chỗ khai ngôn ngữ tay không nhìn thấy những tệp mới chưa được đưa vào hệ thống quản lý phiên bản và không rà soát phần giao diện dùng chung, nên một chỗ khai sai ngôn ngữ mới thêm ở những nơi đó có thể không bị phát hiện.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs`
  severity: medium
  Đề xuất: known-limits

- **Đột biến E9 thay thẻ đóng đầu tiên, không phải thẻ đóng của chính khối bị pha**
  Người dùng thấy gì: Một kịch bản mô phỏng lỗi để kiểm tra độ tin cậy của phép đo dựa vào việc thay đúng một đoạn mã cụ thể; nếu bố cục trang đổi một chút trong tương lai, kịch bản đó có thể thay nhầm chỗ khác, khiến kết quả kiểm tra báo sai lý do thất bại thay vì đúng lý do.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: chốt "thông điệp ghim" của chân khai sinh là vô hiệu — chuỗi ghim được in ra ở MỌI lượt chạy, kể cả lượt xanh**
  Người dùng thấy gì: Phần lớn các thông điệp mà công cụ kiểm thử dùng để xác nhận một lỗi cố tình đưa vào đã thực sự bị bắt lại luôn được in ra bất kể kiểm tra có bắt được lỗi hay không. Vì vậy bảng kết quả có thể báo 'đã bắt được lỗi' ngay cả khi thực ra không bắt được, làm giảm độ tin cậy của bằng chứng kiểm thử cho cả vòng này.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
  severity: high
  Đề xuất: new-contract

- **Hội đồng E11 được bảo chấm một khoá mà chân đo không bao giờ ghi ra**
  Người dùng thấy gì: Một mục dữ liệu bằng chứng thiếu hẳn một trường thông tin mà bước xét duyệt cuối được hướng dẫn dùng để chấm đạt, nên bước đó có thể chấm 'đạt' chỉ vì trường đó không tồn tại chứ không phải vì đã thực sự không có vấn đề gì.
  file: `_acceptance/ho-so-khai-dung-tieng/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **evals.yaml E7 (b)(c) còn mô tả đầu vào không còn tồn tại (part kiểu chuỗi trần), lệch với bài kiểm thật**
  Người dùng thấy gì: Tài liệu mô tả kỳ vọng của một phần kiểm tra giao diện vẫn còn ví dụ một cách dùng dữ liệu đã bị hợp đồng thay đổi trước đó, khiến người đọc để hiểu phạm vi kiểm tra dễ hiểu sai về những gì thực sự được kiểm tra hôm nay.
  file: `_acceptance/ho-so-khai-dung-tieng/evals.yaml`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/20 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ho-so-khai-dung-tieng/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

## N15 — ba chuỗi ghim `chieu a/b/c` chốt bằng hành vi bộ in, không bằng lời hứa

Phát hiện 19/09 khi chạy `tk_ghim_phan_biet` lần đầu. Ba ô `E7a/E7b/E7c`
ghim vào `"chieu a"`, `"chieu b"`, `"chieu c"` — đúng tên ba test trong
`khai-tieng.spec.tsx`. Chúng ĐẠT luật AC-1 (vắng ở lượt lành), nhưng vắng
vì `bun test` chỉ in tên test khi đỏ, chứ không vì bài kiểm khẳng định gì.
Thêm `--reporter=verbose`, hoặc bun đổi bộ in mặc định, là ba chốt ấy im
lặng thành vô hiệu — đúng lớp bệnh B mà vòng này sinh ra để vá.

Ngoài hợp đồng: AC-1 chỉ hứa "vắng ở lượt lành", và ba ô này vắng thật.
Siết thêm (ghim vào một chuỗi mà chính phép khẳng định in ra) là mở rộng
phạm vi, nên để người ký quyết ở Cổng 2.

## N16 — tám ô `ui-check` không có chốt máy nào ở lúc ghim lại

Phát hiện 19/09, do phiên «Đăng nhập bằng tài khoản» nêu và tôi xác minh lại
trên đĩa. **Đã kiểm, không phải suy đoán:**

- `acceptance-gate/lib/evidence-core.cjs:358` — `const REPIN_MACHINE_EXECUTORS
  = ['test', 'script'];`, dùng để lọc ở dòng 370 và 391.
- `feature-loop/scripts/repin-lane.mjs` lọc qua đúng hằng đó, nên eval khai
  `executor: ui-check` **không chạy một lần nào** trong làn ghim lại.
- Hồ sơ này có **8** ô `ui-check` (E1–E5, E8, E9, E12).

Hai làn bất đồng về chuyện gì được tính. Vòng chấm S4
(`workflows/acceptance-verify.js`) CÓ chạy `ui-check` — nó gom thành một nhánh
riêng và đếm riêng trong dòng log. Nhưng `repin-lane` — cái gác merge và cái
quyết định bằng chứng còn tươi hay đã hoá cũ — thì không. Hệ quả cụ thể cho hồ
sơ này: tám tiêu chí về tấm hồ sơ có người nhìn ở S4, mà **không chốt máy nào ở
lúc ghim lại**. Một hồi quy rơi vào đúng tám ô đó sẽ đi qua nghi thức ghim lại
mà không chuông nào kêu.

Ngoài hợp đồng của vòng khai tiếng: không AC nào của hồ sơ này hứa về hành vi
của làn ghim lại. Để người ký quyết ở Cổng 2. Hai lối nếu muốn bịt: đổi tám ô
sang `executor: script` (chúng vốn đã trỏ tới `executors.script.hskt_*`, tức
lệnh `bun` thật chạy được bằng máy — nên đổi nhãn là đủ, không phải viết lại
phép đo), hoặc mở chip sang `~/dev/acceptance-gate-kit` xin nới hằng đó.
