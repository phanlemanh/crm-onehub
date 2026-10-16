# Review findings: thu-paths-e15-giai-doan (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E6 expected still declares the old last-line format; --kiem-bo-qua-lop now prints a different one**
  Người dùng thấy gì: Mô tả trong hồ sơ nghiệm thu về dòng kết quả cuối của một bước kiểm đã cũ so với dòng thật mà công cụ in ra. Kết quả kiểm vẫn đúng, chỉ có chữ mô tả lệch nên người đọc đối chiếu có thể thấy khác nhau.
  file: `_acceptance/thu-paths-e15-giai-doan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **A skipped eval that disappears from HEAD's plan passes silently without being counted as broken**
  Người dùng thấy gì: Một bài kiểm nghiệm thu bị bỏ qua có thể lặng lẽ biến mất khỏi hồ sơ mà công cụ kiểm vẫn báo đạt. Chỉ xảy ra khi ai đó cố ý đổi loại hoặc xoá bài kiểm đó, và không làm sai kết quả đo hiện tại.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs`
  severity: low
  Đề xuất: known-limits

- **The E6 expected text in evals.yaml was not updated to match the script's new final-line format**
  Người dùng thấy gì: Mô tả trong hồ sơ nghiệm thu về dòng kết quả cuối của một bước kiểm đã cũ so với dòng thật mà công cụ in ra. Kết quả kiểm vẫn đúng, chỉ có chữ mô tả lệch.
  file: `_acceptance/thu-paths-e15-giai-doan/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E6 --kiem-bo-qua-lop tính eval vắng khỏi kế hoạch judgment ở HEAD là «khong con o HEAD» và cho qua, không kiểm lại evals.yaml**
  Người dùng thấy gì: Nếu ai đó đổi loại một bài kiểm đã bị bỏ qua rồi thêm phạm vi theo dõi cho nó, bước kiểm phụ vẫn báo đạt dù đáng lẽ phải bắt. Đây là trường hợp hiếm, chỉ do chỉnh tay cố ý, và không ảnh hưởng đến việc hồ sơ nào bị đòi ghim lại.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs`
  severity: low
  Đề xuất: known-limits

- **mocTruoc() matches the branch's own sync merges and can return a commit from the middle of the round as the baseline (r2)**
  Người dùng thấy gì: Nếu chạy lại bước kiểm tra từ nhánh này sau khi đã gộp, công cụ có thể lấy nhầm mốc so sánh và báo sai. Lúc ký và gộp thì kết quả vẫn đúng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs`
  severity: medium
  Đề xuất: known-limits

- **mocTruoc only uses the 'merged branch' fallback when HEAD is an ancestor of origin/onehub; on any later branch it silently returns a post-round commit (r2)**
  Người dùng thấy gì: Sau khi vòng này được gộp, chạy lại phép kiểm trên một nhánh mới có thể báo lỗi giả cho tám hồ sơ. Việc gộp hôm nay không bị ảnh hưởng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs`
  severity: medium
  Đề xuất: known-limits

- **KHONG_CO_TEP_DOI accepts a listed profile on the inference that 'the gate printed no line', but the code only checks for two kinds of NOTE (r2)**
  Người dùng thấy gì: Công cụ có thể coi nhầm một hồ sơ là chưa có tệp nào đổi trong vài tình huống hiếm. Với tám hồ sơ hiện tại thì kết quả vẫn đúng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E8 nhận hồ sơ là KHONG_CO_TEP_DOI chỉ vì không khớp hai regex, không đo «không tệp nào đổi từ lúc ghim» (r2)**
  Người dùng thấy gì: Phép kiểm có thể bỏ qua nhầm một hồ sơ mà lưới nghiệm thu thật ra đã bỏ dở, nên chưa đo được chắc chắn. Với dữ liệu hiện tại thì chưa gây sai kết quả.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs`
  severity: medium
  Đề xuất: known-limits

- **globT1 only reads 3 of the ~22 t1_skip_globs, so the stale-file set does not match pre-merge-check's stale_files (r1)**
  Người dùng thấy gì: Công cụ kiểm tra nội bộ chỉ đọc một phần danh sách tệp được miễn, nên sau này có thể báo đỏ nhầm hoặc xanh nhầm cho một hồ sơ. Hôm nay kết quả vẫn đúng, người dùng chưa bị ảnh hưởng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs`
  severity: medium
  Đề xuất: known-limits

- **dot-bien.mjs keeps its own copy of the eval commands; E3's real command and its declared red direction are never mutation-tested (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử kiểm tra chính bộ kiểm tra chưa chạy đúng lệnh mà chủ kho đã ký cho hai hồ sơ được gọi tên. Bộ kiểm tra có thể sai mà bài thử vẫn báo là bắt được.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **pmc-truoc-sau: khongDo() gọi process.exit(2) bên trong try nên finally không chạy, worktree tạm bị bỏ lại (r1)**
  Người dùng thấy gì: Khi công cụ kiểm tra gặp lỗi giữa chừng, nó để lại một bản sao kho tạm trên máy. Chỉ tốn chỗ và gây rối nhẹ, không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs`
  severity: medium
  Đề xuất: known-limits

- **dot-bien: nhánh CHO_F23 bỏ qua cặp đột biến E2 mà không tính vào lot hay lech, nên thước vẫn trả 0 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử có thể báo xanh dù hai phép thử chưa chạy, nếu sau này một hồ sơ khác thay đổi. Hiện tại chưa xảy ra.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (không đối chiếu số cặp với danh sách khai): E7 hứa chạy «mỗi đột biến khai ở CHIỀU ĐỎ», nhưng CAP gõ tay, lệnh E3 khác lệnh khai, và cặp CHO_F23 đi qua mà không đo (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử kiểm tra chính bộ kiểm tra không phủ hết mọi trường hợp đã hứa và chạy một lệnh khác với lệnh đã ký. Bộ kiểm tra có thể bỏ sót lỗi mà vẫn báo là bắt được hết.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
