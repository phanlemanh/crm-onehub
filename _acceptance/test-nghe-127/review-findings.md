# Review findings: test-nghe-127 (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (ma trận viết trước lệch số phần tử): evals.yaml E2 vẫn ghim «49 chỗ, 46 tệp», còn KHAI_DUNG_APP sau vòng này là 50 chỗ trên 47 tệp, và tổng không được kiểm ở đâu**
  Người dùng thấy gì: Hồ sơ nghiệm thu còn ghi số chỗ dựng app là 49 trong khi thực tế đã là 50. Người đọc hồ sơ có thể thấy con số lệch, nhưng sản phẩm và các bài test chạy không bị ảnh hưởng.
  Căn cứ: Chỉ là chữ ghi số đếm cũ trong hồ sơ, không làm mất dữ liệu hay đổi cách bài test chạy, và sửa lại lúc nào cũng được vì không ai dùng con số đó để quyết định gì.
  file: `_acceptance/test-nghe-127/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **evals.yaml E1/E2 mô tả các câu báo đỏ mà quet.mjs không bao giờ in ra (r1)**
  Người dùng thấy gì: Mô tả các câu báo lỗi trong hồ sơ nghiệm thu lệch với câu máy thật in ra. Người đọc hồ sơ để đối chiếu có thể đi tìm những câu không tồn tại; sản phẩm và các bài test vẫn chạy bình thường.
  Căn cứ: Chỉ làm người phản biện đọc hồ sơ bối rối, không ảnh hưởng người dùng cuối; sửa sau khi đã ký kéo hồ sơ vào trạng thái cũ nên đắt hơn lợi ích.
  file: `_acceptance/test-nghe-127/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **evals.yaml E1/E2 mô tả các lời ném mà quet.mjs không bao giờ phát ra (lệch hợp đồng và răng đo) (r1)**
  Người dùng thấy gì: Hồ sơ hứa vài câu báo lỗi cụ thể mà công cụ đo không bao giờ phát ra, nên ai đối chiếu đầu ra đỏ với hồ sơ sẽ không thấy câu nào khớp. Kết quả xanh vẫn đúng và sản phẩm không bị ảnh hưởng.
  Căn cứ: Hậu quả chỉ là khó đối chiếu hồ sơ khi có lỗi đỏ, người dùng cuối không gặp; sửa sau ký làm hồ sơ cũ đi nên không đáng.
  file: `_acceptance/test-nghe-127/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): E3 coi mọi lỗi của Bun.serve hostname 127.0.0.1 là 'bị từ chối cổng P' (r1)**
  Người dùng thấy gì: Phép thử tái tạo lỗi cổng bị giữ coi mọi lỗi mở cổng là bị từ chối, chưa chứng minh đúng nguyên nhân. Nếu có lỗi khác chen vào, bài thử vẫn báo xanh dù không chứng minh được điều đã hứa.
  Căn cứ: Chỉ là một bài thử minh hoạ cơ chế, không chạy trong sản phẩm; nếu sai thì chỉ làm bằng chứng lỏng hơn, người dùng không mất dữ liệu.
  file: `_acceptance/test-nghe-127/rang/co-che.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (đo 'chuỗi có mặt' trong khi lời hứa là quan hệ thứ tự): taoApp chỉ kiểm listen(0, "127.0.0.1") có xuất hiện trong cửa sổ 600 ký tự (r1 · tệp đã đổi)**
  Người dùng thấy gì: Máy quét chỉ kiểm lời gọi nghe cổng có nằm gần chỗ dựng app, chưa kiểm nó đứng trước lời gọi test đầu tiên. Về sau ai viết thêm bài gọi trước khi nghe cổng thì máy quét vẫn có thể báo xanh.
  Căn cứ: Rủi ro chỉ xảy ra với bài test viết thêm sau này và khi đó lỗi cổng sẽ tự lộ ra lúc chạy; không ảnh hưởng người dùng cuối.
  file: `_acceptance/test-nghe-127/rang/quet.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca tự thử của E4 đưa thẳng object hunk vào xet(), bỏ qua tachHunk, và không có chặn khi 0 khúc (r1)**
  Người dùng thấy gì: Công cụ kiểm rằng các dòng đổi chỉ thuộc sáu dạng cho phép có thể báo xanh mà không xét dòng nào, nếu nó đọc sai đầu ra của git. Hiện chưa thấy xảy ra, và sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ làm bằng chứng không đổi khẳng định kém chắc trong tình huống git đổi định dạng; người dùng không gặp và lỗi này tự lộ khi xem lại bằng tay.
  file: `_acceptance/test-nghe-127/rang/khong-doi-khang-dinh.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
