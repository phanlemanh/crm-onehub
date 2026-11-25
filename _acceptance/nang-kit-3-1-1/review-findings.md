# Review findings: nang-kit-3-1-1 (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E6 sẽ đỏ sau khi gộp: so cây của tip làn khô với HEAD thay vì với cặp sha của vòng (r1)**
  Người dùng thấy gì: Sau khi gộp, một kiểm tra của lần nâng kit này sẽ báo đỏ giả khi có thay đổi khác vào kho. Người dùng không bị ảnh hưởng, chỉ người làm bản sau thấy một dấu đỏ không có thật.
  Căn cứ: Chỉ gây đỏ giả cho đội làm, không mất dữ liệu hay hỏng tính năng, và chạy lại hay ghi vào giới hạn đã biết là xử lý được.
  file: `_acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Thước E1/E2/E3 viết cứng v3.1.1 trên HEAD, lần nâng kit sau sẽ lặp đúng Hỏi-1 (r1)**
  Người dùng thấy gì: Lần nâng kit tiếp theo sẽ làm vài kiểm tra của hồ sơ này đỏ, và phải ghi chú lại như lần trước. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ tốn công ghi chú ở lần nâng sau, không ảnh hưởng người dùng, và cách xử lý đã có tiền lệ.
  file: `_acceptance/nang-kit-3-1-1/rang/luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **E5c chạy lưới PR với --base cố định trên HEAD, sau gộp sẽ báo VIOLATION của hồ sơ khác (r1)**
  Người dùng thấy gì: Sau khi gộp, một kiểm tra lưới PR có thể báo vi phạm của hồ sơ khác dù không có lỗi thật. Chỉ gây nhiễu cho người làm bản sau.
  Căn cứ: Là báo động giả không ảnh hưởng người dùng, không mất dữ liệu; có thể bỏ qua hoặc chạy lại khi gặp.
  file: `_acceptance/nang-kit-3-1-1/rang/luoi-pr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bộ lọc sổ kể lại bỏ sót LO-TRINH.html dù AC-4 liệt nó (r1)**
  Người dùng thấy gì: Nếu trang lộ trình sau này nhắc đến phiên bản cũ trong tên một hồ sơ, một kiểm tra sẽ báo đỏ dù được phép. Không ảnh hưởng người dùng.
  Căn cứ: Chỉ có thể gây một dấu đỏ giả ở tương lai, nhẹ, và dễ sửa khi nó thật sự xuất hiện.
  file: `_acceptance/nang-kit-3-1-1/rang/luat.mjs`
  severity: low
  Đề xuất: known-limits

- **AC-6 so cây làn khô với HEAD sống thay vì đỉnh vòng đã neo nên đỏ sau bất kỳ commit nào khác; E1–E7 đỏ theo vì chung một lệnh (r1)**
  Người dùng thấy gì: Chỉ cần một thay đổi khác vào kho sau khi gộp là cả nhóm kiểm tra của lần nâng kit này báo đỏ cùng lúc. Chỉ gây nhiễu cho người làm.
  Căn cứ: Đỏ giả hàng loạt gây phiền nhưng không hại người dùng hay dữ liệu; ghi vào giới hạn đã biết là đủ.
  file: `_acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Tập ứng viên suy lại đọc trạng thái hồ sơ trên cây sống nên lệch khi một hồ sơ mới được ký (r1)**
  Người dùng thấy gì: Khi có hồ sơ khác được ký sau này, kiểm tra của lần nâng kit này có thể báo lệch dù không đổi gì. Người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ là đỏ giả cho người làm, không mất dữ liệu, chạy lại hoặc ghi chú được.
  file: `_acceptance/nang-kit-3-1-1/rang/ung-vien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Thước luoi-pr bỏ qua mã thoát, lỗi spawn và dòng sổ luật nên coi lưới gãy là xanh (r1)**
  Người dùng thấy gì: Nếu bộ kiểm tra lưới PR bị hỏng, kiểm tra này vẫn có thể báo xanh nhầm. Hiện lần chạy thật đã đủ nên chưa có sai lệch.
  Căn cứ: Rủi ro chỉ xảy ra khi công cụ kiểm tra gãy, khi đó dấu hiệu khác cũng lộ ra, và không ảnh hưởng người dùng cuối.
  file: `_acceptance/nang-kit-3-1-1/rang/luoi-pr.mjs`
  severity: medium
  Đề xuất: known-limits

- **docEvals đọc sai paths viết nhiều dòng và paths dùng anchor YAML (r1)**
  Người dùng thấy gì: Một vài kiểu khai báo hiếm có thể bị đọc sót khi chọn kiểm tra cần chạy lại. Vòng này không có sai lệch nào.
  Căn cứ: Không gây sai kết quả ở vòng này, chỉ là điểm mù hiếm gặp, sửa tốn công hơn lợi ích.
  file: `_acceptance/nang-kit-3-1-1/rang/ung-vien.mjs`
  severity: low
  Đề xuất: wont-fix

- **AC-1/2/3 viết cứng v3.1.1 so với tệp sống, lặp lại kiểu đã làm đỏ chuyen-cho lần này (r1)**
  Người dùng thấy gì: Lần nâng kit kế tiếp sẽ làm các kiểm tra phiên bản của hồ sơ này đỏ. Không ảnh hưởng người dùng cuối.
  Căn cứ: Chỉ tốn công ghi chú ở lần nâng sau, giống tiền lệ đã có, không hại người dùng.
  file: `_acceptance/nang-kit-3-1-1/rang/kit.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm-tính-một-mình): E5c/xetLuoiPr chỉ đòi «không có dòng VIOLATION khác vòng», không có đối chứng dương rằng lưới đã chạy (r1)**
  Người dùng thấy gì: Kiểm tra lưới PR có thể báo xanh nhầm nếu công cụ chạy dở hoặc ra kết quả rỗng. Lần chạy hiện tại đã đủ nên chưa có sai lệch.
  Căn cứ: Chỉ xảy ra khi công cụ kiểm tra hỏng, không ảnh hưởng người dùng cuối hay dữ liệu.
  file: `_acceptance/nang-kit-3-1-1/rang/luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): cache của AC-2 tự đặt tên thư mục «3.1.1», nên kết quả «ra bản 3.1.1» là chính tên test đặt (r1)**
  Người dùng thấy gì: Kiểm tra chưa thật sự xác nhận tên phiên bản do kit tự đặt, nên nếu thẻ mang phiên bản khác thì vẫn báo xanh. Hiện tại phiên bản đúng.
  Căn cứ: Giá trị thực tế đã đúng, rủi ro thấp và chỉ ảnh hưởng độ tin cậy của kiểm tra, không ảnh hưởng người dùng.
  file: `_acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
