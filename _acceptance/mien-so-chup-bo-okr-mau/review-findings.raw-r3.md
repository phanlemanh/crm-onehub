# Review findings: mien-so-chup-bo-okr-mau (round 3)

## Trong hợp đồng

(không có phát hiện — phát hiện AC-7 của round 2 đã được xử lý bằng sửa pham-vi.mjs)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Docs and the signed contract say any broken check removes both exemptions, but when C1 breaks the createMany exemption stays** (r2)
  Người dùng thấy gì: Tài liệu nói hễ một chốt an toàn hỏng thì cả hai lệnh ghi của công cụ dev mất quyền miễn, nhưng thực tế khi chốt xoá có lọc hỏng thì lệnh thêm vẫn được miễn. Người đọc tài liệu sẽ hiểu hơi sai phạm vi bị chặn, còn việc chặn lệnh xoá vẫn đúng.
  file: `docs/api.md`
  severity: medium
  Đề xuất: known-limits

- **Docs say nothing outside okr:mau imports okr-mau/nap or okr-mau/lenh, but test files do and the C4 check skips them** (r2)
  Người dùng thấy gì: Tài liệu nói không có gì ngoài công cụ dev nhập mã nạp mẫu, nhưng các tệp kiểm thử thì có nhập. Chỉ là câu chữ thiếu chữ ngoại trừ kiểm thử, không mở lỗ nào cho mã sản phẩm.
  file: `docs/api.md`
  severity: low
  Đề xuất: known-limits

- **Chốt C3 bỏ sót lối vào apps/api/scripts/okr-mau.ts: gọi xoaTrong không kiemOkrThat mà bốn chốt vẫn đạt** (r2)
  Người dùng thấy gì: Một người sửa công cụ dev có thể thêm một đường xoá sổ chụp OKR mà không qua bước kiểm tra kho an toàn, và thước vẫn báo đạt. Rủi ro chỉ ở máy dev cục bộ, nhưng lỗ này cần một hợp đồng riêng để vá.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: new-contract

- **Chốt C4 lọt khi nhập okr-mau/nap bằng đuôi .js; chốt C2 lọt với `export * from "./okr-mau/lenh"`** (r2)
  Người dùng thấy gì: Mã ngoài công cụ dev nhập công cụ nạp mẫu bằng cách viết có đuôi .js, hoặc nạp lệnh bằng export lại, vẫn qua được thước mà không mất quyền miễn. Đây là kẽ hở của lớp bảo vệ, cần hợp đồng mới để siết.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: new-contract

- **docs/api.md nói một chốt vỡ thì cả hai lời gọi thành vi phạm, nhưng C1 vỡ vẫn giữ miễn cho createMany** (r2)
  Người dùng thấy gì: Tài liệu mô tả quá rộng việc mất quyền miễn khi một chốt hỏng. Hành vi thật chặt hơn ở chỗ xoá và lỏng hơn ở chỗ thêm, nên người đọc có thể hiểu sai phạm vi.
  file: `docs/api.md`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): E5 xanh trong khi docs/api.md và expected của E8 nói sai chốt nào làm mất miễn nào** (r2)
  Người dùng thấy gì: Phép kiểm văn bản chỉ xem có nhắc đúng tên hay không, nên một câu mô tả sai về chốt nào làm mất quyền miễn vẫn lọt. Hậu quả là tài liệu có thể lệch hành vi thật mà không ai bị báo.
  file: `_acceptance/mien-so-chup-bo-okr-mau/rang/van-ban.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (có mặt thay vì quan hệ): chốt C2 chỉ đòi có lời gọi kiemDuocNap và có một if chứa process.exit, không đòi if đó xét kết quả kiemDuocNap** (r2)
  Người dùng thấy gì: Một người cố ý làm vô hiệu việc chặn công cụ dev trên máy không phải máy dev vẫn qua được thước. Cần có chủ ý phá và chỉ ảnh hưởng máy cục bộ, nên chi phí siết vượt xa hậu quả.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 3 (có mặt thay vì quan hệ): chốt C1 chỉ đòi có khoá keyResultId trong where, không đòi khoá đó thật sự lọc** (r2)
  Người dùng thấy gì: Lệnh xoá có khoá lọc nhưng giá trị rỗng vẫn được coi là có lọc và có thể xoá cả bảng sổ chụp. Chỉ xảy ra ở công cụ dev trên kho không có dữ liệu OKR thật, và hợp đồng đã ghi nhận giả định này.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (ma trận không ghim số phần tử): chamBang không khẳng định số ô == 10 hay 13 như E2 và E3 đòi** (r2)
  Người dùng thấy gì: Nếu sau này ai đó bớt một ca thử khỏi bộ phá thử, bộ kiểm vẫn báo đạt hết. Hiện tại bộ ca còn đủ, nhưng không có máy giữ con số này.
  file: `_acceptance/mien-so-chup-bo-okr-mau/rang/do-mien.mjs`
  severity: low
  Đề xuất: known-limits

- **docs/api.md and E8 expected say any broken check turns both calls back into violations, but the code leaves createMany exempt when C1 breaks** (r1)
  Người dùng thấy gì: Tài liệu nói chốt nào vỡ thì cả hai lệnh ghi bị chặn lại, nhưng thực tế khi chốt giới hạn lệnh xoá vỡ thì chỉ lệnh xoá bị chặn, lệnh thêm vẫn được miễn. Kết quả cuối vẫn đỏ nên không lọt lỗi, chỉ là người đọc tài liệu hiểu hơi khác thực tế.
  file: `docs/api.md`
  severity: medium
  Đề xuất: known-limits

- **docs/api.md and AC-4 say nothing outside okr:mau imports or calls nap/lenh, but apps/api/test imports them and calls xoaTrong/napTrong directly** (r1)
  Người dùng thấy gì: Tài liệu viết như thể không mã nào ngoài công cụ dev được dùng các hàm nạp và xoá dữ liệu mẫu, nhưng các bài kiểm tra tự động vẫn gọi chúng trực tiếp. Thước đo cố ý bỏ qua thư mục kiểm tra nên không có rủi ro thật, chỉ là câu chữ nói rộng hơn sự thật.
  file: `docs/api.md`
  severity: low
  Đề xuất: known-limits

- **C3 and C4 never look at the entry file okr-mau.ts, so it can call xoaTrong with no guard and the gate still passes** (r1)
  Người dùng thấy gì: Một người sửa tệp khởi động của công cụ dev có thể cho nó xoá lịch sử số chụp của các chỉ tiêu mẫu mà không qua bước kiểm tra an toàn, và cổng nghiệm thu vẫn báo xanh. Lỗ này nằm ở chỗ thước đo không nhìn vào tệp đó, cần một vòng riêng để bịt.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: high
  Đề xuất: new-contract

- **C2 only checks that kiemDuocNap and some if…process.exit exist, not that the exit depends on the kiemDuocNap result** (r1)
  Người dùng thấy gì: Chốt chặn chạy trên máy thật chỉ được kiểm là có tồn tại, chưa kiểm là có thật sự phụ thuộc vào kết quả. Ai cố tình thay điều kiện chặn bằng điều kiện luôn sai thì cổng vẫn xanh, dù trên thực tế công cụ không còn bị chặn.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **docs/api.md and E8 say one broken check turns both calls back into violations, but with C1 broken createMany stays exempt** (r1)
  Người dùng thấy gì: Ba nơi viết luật nói chốt vỡ thì cả hai lệnh ghi bị chặn, nhưng khi chốt giới hạn lệnh xoá vỡ thì lệnh thêm vẫn được miễn. Cổng vẫn đỏ nên an toàn, chỉ có chữ viết và thước đo không khớp nhau.
  file: `docs/api.md`
  severity: medium
  Đề xuất: known-limits

- **C3/C4 only scan .ts/.tsx under apps/ and packages/; .mts/.js/.mjs files or files elsewhere can import okr-mau/nap undetected** (r1)
  Người dùng thấy gì: Thước đo chỉ đọc một số loại tệp mã trong hai thư mục chính. Một tệp loại khác hoặc đặt ở chỗ khác mà gọi công cụ dev xoá dữ liệu mẫu sẽ không bị phát hiện.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 5 (claims to sweep a class but has only point cases): the 10- and 13-cell matrices are not pinned to their length** (r1)
  Người dùng thấy gì: Nếu ai đó lỡ xoá bớt một ca thử khỏi bộ ca kiểm, phép đo vẫn báo đạt toàn bộ và chỉ con số in ra tụt đi. Phải có người nhìn con số mới phát hiện được bộ ca bị thiếu.
  file: `_acceptance/mien-so-chup-bo-okr-mau/rang/do-mien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence where the promise is a relation): C2 finds the kiemDuocNap call and the if/process.exit block separately, with no link between them** (r1)
  Người dùng thấy gì: Thước đo chỉ kiểm bước chặn có mặt trong mã, không kiểm nó có thật sự chặn được hay không. Mã có đủ các bước nhưng chúng không nối với nhau vẫn qua cổng, nên lớp an toàn có thể chỉ là bề ngoài.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence where the promise is a relation): C1 only checks that a where.keyResultId key exists, not that it narrows the delete** (r1)
  Người dùng thấy gì: Chốt giới hạn lệnh xoá chỉ kiểm là có ghi điều kiện lọc, không kiểm điều kiện đó thật sự thu hẹp việc xoá. Một điều kiện rỗng về thực chất vẫn có thể xoá sạch lịch sử số chụp mà cổng vẫn xanh.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
