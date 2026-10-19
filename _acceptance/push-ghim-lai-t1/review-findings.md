# Review findings: push-ghim-lai-t1 (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hằng ký tự đại diện bị khai lại ở phan-loai.mjs, trùng hằng đã có trong t1-ma-doc.mjs**
  Người dùng thấy gì: Người dùng không thấy gì khác đi hôm nay. Rủi ro là về sau ai đó đổi định nghĩa ký tự đại diện ở một chỗ mà quên chỗ kia thì hai bộ kiểm có thể hiểu cùng một mẫu tệp khác nhau.
  Căn cứ: Hai bản đang giống hệt nhau nên không ai bị ảnh hưởng, chỉ là nợ gọn mã nhẹ; sửa sau rẻ và không mất dữ liệu.
  file: `.github/scripts/phan-loai.mjs`
  severity: low
  Đề xuất: known-limits

- **E8 trong evals.yaml ghi «node_modules lien ket» nhưng dot-bien.mjs không hề liên kết node_modules**
  Người dùng thấy gì: Hồ sơ nghiệm thu mô tả cây chép dùng thêm một thư mục thư viện mà thực tế không có. Người ký có thể hiểu sai cách phép đo được dựng, nhưng kết quả đo không bị sai.
  Căn cứ: Chỉ là một câu mô tả lệch trong hồ sơ, kết quả đo vẫn đúng; sửa lại câu chữ sau này rất rẻ và không ảnh hưởng người dùng cuối.
  file: `_acceptance/push-ghim-lai-t1/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **dot-bien.mjs gọi process.exit(2) bên trong try nên khối finally không dọn thư mục tạm**
  Người dùng thấy gì: Mỗi lần phép đo đột biến tự báo thước hỏng, một bản sao cả kho còn nằm lại trong thư mục tạm của máy. Chỉ tốn đĩa trên máy chạy kiểm, không ảnh hưởng dữ liệu hay người dùng sản phẩm.
  Căn cứ: Chỉ xảy ra khi thước đã hỏng, hậu quả là tốn đĩa tạm và hệ điều hành tự dọn dần; không mất dữ liệu và tự xoá tay được.
  file: `_acceptance/push-ghim-lai-t1/rang/dot-bien.mjs`
  severity: low
  Đề xuất: wont-fix

- **dot-bien.mjs gọi process.exit(2) bên trong try nên khối finally không chạy, thư mục tạm chứa bản chép cả kho bị bỏ lại**
  Người dùng thấy gì: Mỗi lần phép đo đột biến tự báo thước hỏng, một bản sao cả kho còn nằm lại trong thư mục tạm của máy. Chỉ tốn đĩa trên máy chạy kiểm, không ảnh hưởng dữ liệu hay người dùng sản phẩm.
  Căn cứ: Chỉ xảy ra khi thước đã hỏng, hậu quả là tốn đĩa tạm và hệ điều hành tự dọn dần; không mất dữ liệu và tự xoá tay được.
  file: `_acceptance/push-ghim-lai-t1/rang/dot-bien.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 6 (đo bản khác chứ không đo cây đang kiểm): E6 chạy pre-merge-check.sh, evidence-core.cjs và recheck-evidence.cjs của commit 38ecca3be, không phải bản trong cây đang xét**
  Người dùng thấy gì: Nếu sau này ai đó làm hỏng chính bộ kiểm bằng chứng trước khi gộp, phép đo của vòng này vẫn có thể báo xanh vì nó chạy bản cũ đã ghim. Hôm nay ba tệp đó chưa khác bản ghim nên kết quả hiện tại vẫn đúng.
  Căn cứ: Hôm nay kết quả đo đúng và hồ sơ sẽ báo lỗi cũ khi các tệp đó đổi, nên người dùng chưa bị ảnh hưởng; đây là giới hạn đã nằm trong cách đo được ký, nên ghi lại thay vì sửa ngay.
  file: `_acceptance/push-ghim-lai-t1/rang/cong-van-do.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
