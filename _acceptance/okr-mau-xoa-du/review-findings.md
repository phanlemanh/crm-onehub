# Review findings: okr-mau-xoa-du (round 2)

## Trong hợp đồng

- **Phụ thuộc do người ngoài tạo giữa hai việc của người mẫu bị xoá âm thầm, lệnh thoát 0 (trái AC-3)**
  AC: AC-3
  file: `apps/api/scripts/okr-mau/xoa-viec.ts:22`
  severity: medium
  source: bugs
  detail: AC-3 viết: «Given một việc do người mẫu tạo có một việc con hay một phụ thuộc do người ngoài tạo, Then lệnh cũng dừng mã 5». Với việc con, chanKeoNgoai xét theo người tạo (`chaId in V, taoBoiId notIn U`). Với phụ thuộc, nó chỉ xét hai đầu nối: `truocId in V, sauId notIn V` và `sauId in V, truocId notIn V`. Ca hỏng: một ViecPhuThuoc { truocId: việc mẫu A, sauId: việc mẫu B, taoBoiId: người ngoài }. Cả hai lượt đếm ra 0 nên không chặn. Sau đó xoaViecVaTinHieu xoá A và B, và hàng phụ thuộc của người ngoài bị Cascade xoá theo. khoaConGiu cũng không thấy hàng này vì viecPhuThuoc.taoBoiId không thuộc U. Kết quả: lệnh thoát 0 và dữ liệu của người ngoài mất mà không báo. Ca okx-ngoai-giu-phu-thuoc chỉ thử phụ thuộc nối sang việc của người ngoài, nên không phủ ca này. Cách sửa: thêm một lượt đếm `viecPhuThuoc` với `OR: [{truocId in V}, {sauId in V}]` và `taoBoiId notIn U`, như cách đã làm cho việc con.
  rationale: AC-3 đòi dừng mã 5 khi việc của người mẫu có phụ thuộc do người ngoài tạo; ca phụ thuộc giữa hai việc mẫu do người ngoài tạo thì lệnh lại xoá âm thầm và thoát 0.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chanKeoNgoai chỉ chặn viec.chaId và viecPhuThuoc; các liên kết của người ngoài bám vào việc mẫu bị xoá hoặc đặt rỗng mà lệnh không báo**
  Người dùng thấy gì: Khi xoá bộ OKR mẫu, nếu một mốc dự án hoặc bước onboarding của người thật đang gắn vào việc của người mẫu thì liên kết đó mất mà lệnh vẫn báo thành công.
  Căn cứ: Chỉ xảy ra khi người thật tự gắn dự án hay onboarding vào việc của người mẫu, rất hiếm; mất liên kết chứ không mất bản ghi chính, và tạo lại được.
  file: `apps/api/scripts/okr-mau/xoa-viec.ts`
  severity: medium
  Đề xuất: known-limits

- **Lệnh khai paths của E1–E4 và E7 thiếu thước đo okr-mau-san.ts và lược đồ, dù kết quả các eval này phụ thuộc vào chúng**
  Người dùng thấy gì: Nếu sau này ai đó sửa lược đồ dữ liệu hay công cụ đo dùng chung, bằng chứng đã ký của tính năng này có thể không bị đánh dấu là cũ dù kết quả có thể đổi.
  Căn cứ: Không ảnh hưởng người dùng cuối, chỉ làm lưới nghiệm thu bớt nhạy; thêm đường dẫn vào sau rẻ và không mất dữ liệu.
  file: `_acceptance/okr-mau-xoa-du/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Câu SQL liệt khoá chặn tới bảng user bị chép nguyên văn sang bài kiểm, thay vì dùng chung một hàm**
  Người dùng thấy gì: Nếu sửa cách lệnh tìm các ràng buộc giữ người mẫu mà quên sửa bài kiểm, bài kiểm vẫn xanh dù hai bên đã lệch nhau.
  Căn cứ: Chỉ là rủi ro bảo trì cho người làm kho, không chạm người dùng và không mất dữ liệu; để lại ghi chú là đủ.
  file: `apps/api/test/okr-mau-khoa-nguoi.spec.ts`
  severity: low
  Đề xuất: known-limits

- **okx-ten-giu chỉ trả quyền chủ của ngoai-mau-deal trên đường xanh; ca đỏ giữa chừng làm bẩn trạng thái cho các bài chạy sau**
  Người dùng thấy gì: Khi một bài kiểm đỏ giữa chừng, kho kiểm có thể còn dữ liệu bẩn làm các bài sau đỏ dây chuyền, gây khó đọc nguyên nhân.
  Căn cứ: Chỉ ảnh hưởng người chạy kiểm khi đã có lỗi thật; chạy lại với kho kiểm mới là hết, không lộ hay mất dữ liệu thật.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

- **chanKeoNgoai dừng trước khoaConGiu nên thông điệp mã 5 thiếu các khoá chặn khác đang cùng giữ người mẫu**
  Người dùng thấy gì: Khi lệnh dừng vì có dữ liệu của người ngoài, thông điệp có thể chưa liệt hết các chỗ đang giữ; người chạy gỡ xong một chỗ phải chạy lại mới thấy chỗ kế.
  Căn cứ: Lệnh vẫn dừng đúng và không đổi dữ liệu nào; chỉ tốn thêm một lượt chạy lại.
  file: `apps/api/scripts/okr-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **(Lặp lại từ r1, vẫn còn ở HEAD) Xoá việc mẫu kéo theo liên kết của người ngoài (DuAnMocCho, OnboardingStep.viecId, Viec.duAnId) mà không báo**
  Người dùng thấy gì: Xoá bộ OKR mẫu có thể lặng lẽ cắt liên kết của dự án hay onboarding của người thật vào việc mẫu, và lệnh không nói gì.
  Căn cứ: Chỉ xảy ra khi người thật gắn vào việc của người mẫu, hiếm; mất liên kết chứ không mất bản ghi, dựng lại được.
  file: `apps/api/scripts/okr-mau/xoa-viec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính không ghim thông điệp): E6 đòi «không dòng nào chứa 'don dep'» trong khi thước luôn in một dòng 'don dep', kể cả khi xanh**
  Người dùng thấy gì: Phép kiểm dọn bộ mẫu sau lượt đo màn có câu chữ mơ hồ, đọc đúng từng chữ thì đỏ cả khi mọi thứ chạy đúng, nên người chấm phải tự hiểu lại.
  Căn cứ: Không ảnh hưởng người dùng, chỉ gây nhầm lúc chấm; sửa câu chữ sau rẻ và không mất dữ liệu.
  file: `_acceptance/okr-mau-xoa-du/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương): okx-viec kiểm viecTheoDoi = 0 sau khi xoá mà chưa hề xác nhận lúc đầu có hàng**
  Người dùng thấy gì: Bài kiểm xác nhận người theo dõi việc bị dọn nhưng không chứng minh trước đó có người theo dõi, nên có thể xanh mà không thử gì.
  Căn cứ: Chỉ làm bằng chứng yếu hơn, không gây hại cho người dùng hay dữ liệu; bổ sung phép đếm trước sau này rẻ.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (khai cho mọi ca nhưng chỉ kiểm một điểm): chữ '(User)' trần chỉ được kiểm ở ca thứ nhất trong ba ca của okx-ten-giu**
  Người dùng thấy gì: Thông điệp lỗi khi dừng được kiểm kỹ ở một ca, còn hai ca kia chưa kiểm hết, nên một dòng thừa hay chữ cũ có thể lọt mà bài kiểm vẫn xanh.
  Căn cứ: Là chỗ hở của lưới kiểm chứ chưa phải lỗi thấy được; thông điệp chỉ để người chạy lệnh đọc, không mất dữ liệu.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Mô tả E1 nói demThamChieu đọc pg_constraint, nhưng hàm thật đọc information_schema.columns (r1)**
  Người dùng thấy gì: Thẻ bằng chứng mô tả sai cách bài kiểm đếm hàng còn sót, nên người đọc có thể hiểu lệch về bằng chứng. Sản phẩm chạy đúng và phép đo thực tế còn chặt hơn lời mô tả.
  Căn cứ: Chỉ lệch lời mô tả chứ không lệch kết quả, người dùng không mất gì và chỉ cần sửa một câu chữ khi tiện.
  file: `_acceptance/okr-mau-xoa-du/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Câu SQL liệt khoá chặn tới bảng user bị chép hai nơi (r1)**
  Người dùng thấy gì: Hai chỗ trong mã cùng dùng một câu truy vấn chép riêng, sau này sửa một bên mà quên bên kia thì lưới bắt bảng mới có thể không còn khớp với lệnh xoá thật. Hiện tại hai bên vẫn giống nhau nên người dùng chưa gặp gì.
  Căn cứ: Rủi ro chỉ xảy ra trong tương lai nếu có người sửa lệch, không mất dữ liệu và sửa rẻ nhưng không gấp.
  file: `apps/api/test/okr-mau-khoa-nguoi.spec.ts`
  severity: low
  Đề xuất: known-limits

- **chanKeoNgoai không chặn các liên kết ngoài bộ mẫu bám vào việc của người mẫu (DuAnMocCho, OnboardingStep.viecId): xoaViecVaTinHieu xoá hoặc sửa chúng mà không báo (r1)**
  Người dùng thấy gì: Khi xoá bộ OKR mẫu, nếu một dự án hay một kế hoạch onboarding của người thật đang gắn vào việc của người mẫu thì điều kiện chờ đó bị mất hoặc bị bỏ trống mà lệnh vẫn báo xong, không cảnh báo.
  Căn cứ: Dữ liệu của người thật có thể bị đổi âm thầm và không khôi phục được, nhưng lệnh chỉ chạy trên máy dev và kiểm thử, chưa từng chạy trên production nên hậu quả thật còn nhỏ.
  file: `apps/api/scripts/okr-mau/xoa-viec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (assertion âm tính không ghim đúng thông điệp): E6 đòi 'không dòng nào chứa "don dep"', nhưng thước in dòng 'don dep' cả khi xanh (r1)**
  Người dùng thấy gì: Bài kiểm đo màn dọn dữ liệu có thể báo đỏ nhầm dù việc xoá đã chạy tốt, hoặc nếu bỏ vế đó thì chỉ còn dựa vào một chuỗi kết quả. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm nhiễu kết quả nghiệm thu chứ không gây mất dữ liệu, người chấm tự nhận ra khi chạy lại và sửa là đổi một chuỗi chữ.
  file: `_acceptance/okr-mau-xoa-du/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương): okx-viec kiểm viecTheoDoi = 0 sau xoá mà không xác nhận trước đó có hàng (r1)**
  Người dùng thấy gì: Bài kiểm khẳng định không còn người theo dõi sau khi xoá nhưng chưa chứng minh lúc đầu có người theo dõi, nên nó có thể xanh mà chưa thật sự thử dọn gì. Tính năng xoá cho người dùng vẫn chạy đúng.
  Căn cứ: Chỉ làm bằng chứng yếu hơn mức lý tưởng, không ảnh hưởng dữ liệu và thêm một dòng kiểm là xong khi có dịp.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (khai cho mọi ca nhưng chỉ kiểm một điểm): '(User)' trần chỉ được kiểm ở ca thứ nhất của okx-ten-giu (r1)**
  Người dùng thấy gì: Thông điệp lỗi khi dừng được kiểm chặt ở một tình huống, còn hai tình huống kia chưa được kiểm riêng xem có lọt chữ chung chung hay không. Hiện chưa có dấu hiệu thông điệp sai.
  Căn cứ: Nếu có sai thì chỉ là thông điệp khó đọc hơn, không mất dữ liệu, người dùng thử lại hay đọc kỹ vẫn hiểu.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/okr-mau-xoa-du/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

