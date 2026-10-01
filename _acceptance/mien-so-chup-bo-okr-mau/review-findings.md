# Review findings: mien-so-chup-bo-okr-mau (round 3)

## Trong hợp đồng

(không có phát hiện — phát hiện AC-7 của round 2 đã được xử lý bằng sửa pham-vi.mjs)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Gộp tay 01/10 bởi phiên chính: 18 mục mang sang từ round 1 và round 2 là 7 vấn đề, mỗi vấn đề báo hai hoặc ba lần; bản máy viết nguyên văn ở `review-findings.raw-r3.md`. Lý do gộp: bộ đọc thẻ không nhận dòng tiêu đề dạng «**…** (r2)» nên khối bị giấu khỏi thẻ (lỗi kit, chip riêng).

- **Văn bản nói một chốt vỡ thì cả hai lời gọi mất miễn, nhưng C1 vỡ chỉ làm mất miễn của lệnh xoá (r1, r2 — gộp 6 mục)**
  Người dùng thấy gì: Tài liệu API, tiêu chí AC-4 và E8 của «Số OKR tự chảy» nói hễ một chốt an toàn hỏng thì cả hai lệnh ghi của công cụ dev mất quyền miễn; thực tế khi chốt «xoá có lọc» hỏng thì lệnh thêm vẫn được miễn. Thước vẫn đỏ nên không lọt lỗi; người đọc tài liệu hiểu lệch phạm vi bị chặn, và phép đo văn bản E5 không bắt được chỗ lệch này.
  file: `docs/api.md`
  severity: medium
  Đề xuất: known-limits

- **Câu chốt C4 trong tài liệu thiếu vế «ngoài tệp kiểm thử» (r1, r2 — gộp 2 mục)**
  Người dùng thấy gì: Tài liệu nói không có gì ngoài công cụ dev nhập mã nạp mẫu, nhưng các tệp kiểm thử thì có nhập và gọi thẳng hàm nạp/xoá. Chỉ là câu chữ thiếu vế ngoại trừ kiểm thử, không mở lỗ nào cho mã sản phẩm.
  file: `docs/api.md`
  severity: low
  Đề xuất: known-limits

- **Tệp lối vào okr-mau.ts không được chốt C3/C4 soi: nó có thể gọi xoaTrong mà không qua kiemOkrThat (r1, r2 — gộp 2 mục)**
  Người dùng thấy gì: Một người sửa tệp khởi động của công cụ dev có thể thêm một đường xoá sổ chụp OKR của KR mẫu mà không qua bước kiểm «kho chưa có OKR thật», và thước vẫn báo đạt. Rủi ro chỉ ở máy dev cục bộ (chốt chặn production vẫn đứng), nhưng đây là lỗ thật của thước cần một hợp đồng riêng để vá.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: high
  Đề xuất: new-contract

- **Chốt C4 lọt khi nhập bằng đuôi .js hay từ tệp .mjs/.js; chốt C2 lọt với export * from "./okr-mau/lenh" (r1, r2 — gộp 2 mục)**
  Người dùng thấy gì: Mã ngoài công cụ dev nhập công cụ nạp mẫu bằng cách viết có đuôi .js, hoặc từ tệp không phải .ts/.tsx, hoặc nạp lệnh bằng export lại, vẫn qua được thước mà không mất quyền miễn. Đây là kẽ hở của lớp bảo vệ, cần hợp đồng mới để siết.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: new-contract

- **Chốt C2 chỉ đòi có lời gọi kiemDuocNap và có một if chứa process.exit, không đòi if đó xét kết quả kiemDuocNap (r1, r2 — gộp 3 mục)**
  Người dùng thấy gì: Chốt chặn chạy trên máy thật chỉ được kiểm là có tồn tại, chưa kiểm là có thật sự phụ thuộc vào kết quả kiểm. Ai cố tình thay điều kiện chặn bằng điều kiện luôn sai thì thước vẫn xanh, dù trên thực tế công cụ không còn bị chặn.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Chốt C1 chỉ đòi lệnh xoá có khoá keyResultId trong where, không đòi khoá đó thật sự thu hẹp (r1, r2 — gộp 2 mục)**
  Người dùng thấy gì: Lệnh xoá của công cụ dev chỉ cần có điều kiện theo KR là qua chốt, kể cả khi điều kiện đó rộng tới mọi KR. Đây đúng là giả định đã ghi ở mục Coverage và được duyệt ở Cổng Phạm vi; ghi lại để biết chốt này mỏng tới đâu.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Ma trận 10 ô và 13 ô của phép đo không tự khẳng định đủ số ô (r1, r2 — gộp 2 mục)**
  Người dùng thấy gì: Phép đo in «10/10» và «13/13» nhưng không tự đòi bảng có đúng 10 và 13 ô; nếu ai xoá bớt ô trong script thì phép đo vẫn xanh với số nhỏ hơn. Người đọc bằng chứng vẫn thấy con số, nên rủi ro thấp.
  file: `_acceptance/mien-so-chup-bo-okr-mau/rang/do-mien.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
