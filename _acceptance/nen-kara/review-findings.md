# Review findings: nen-kara (round 2)

## Trong hợp đồng

- **Hình dạng 4 (assertion âm tính một mình): kiểm «thẻ có viền» và «inline không viền» ở E10 tự xanh khi không có phần tử nào để đo**
  file: `_acceptance/nen-kara/rang/man-proto.mjs:263`
  severity: medium
  AC: AC-9
  source: measurement
  detail: Dòng 263-266 là `ghi(so.theKhongVien === 0, ...)`, với theKhongVien = the.filter(g => !vienThay(g)).length (dòng 136). Script không đòi soThe > 0 ở đâu cả, kể cả ở ST-nenkara-the, trạng thái duy nhất có bản card. Số soThe và soInline chỉ được in ra (dòng 268-270), không được khẳng định. Vì vậy nếu `[data-density=card]` không còn hiện (đổi tên thuộc tính, proto thôi dựng card), cả 32 ô vẫn in OK cho vế «bản card có viền» của AC-9, mà vế card lại không có chiều đỏ nào (--kiem-do-do chỉ chèn lỗi vào inline). Vòng lặp kiểm inline cũng vậy (dòng 121-130): một trạng thái inline-* không dựng phần tử inline nào sẽ cho loiInline rỗng và xanh. Chiều đỏ chenLoi chỉ chứng minh trang có ít nhất một phần tử inline ở đâu đó, không phải ở từng trạng thái. Không có đối chứng dương theo từng ô, kiểu soThe ≥ 1 ở ST-nenkara-the và soInline ≥ 1 ở năm trạng thái inline/biên nhận.
  lý do vào hợp đồng: AC-9 hứa bản card có viền và inline không viền ở từng trạng thái; phép đo không đòi có ít nhất một phần tử card/inline nên vế này có thể xanh vì không đo gì.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ chốt tổng > 0): nk-hai-tieng không ghim số chỗ so theo từng thành phần**
  file: `packages/ui/test/nen-kara.dom.tsx:569`
  severity: medium
  AC: AC-8
  source: measurement
  detail: E9 hứa một ma trận viết trước gồm năm thành phần, mỗi thành phần dựng ở vi và en. Bài chỉ khẳng định `expect(soCho).toBeGreaterThan(0)` trên tổng cộng dồn (dòng 552-569), và `expect(theoTieng.vi.length).toBe(theoTieng.en.length)` (dòng 561) đúng cả khi hai bên cùng bằng 0. Một thành phần không còn chữ tự đặt nào được so, hoặc một bước `mo` không mở được ô Vì sao nên chữ trong popover («Kara dựa trên gì», «Đọc lúc …») không được thu, vẫn qua bài, miễn thành phần khác góp ít nhất một chỗ. Số khẳng định không bằng số phần tử của ma trận (mẫu P105). Thiếu số chỗ kỳ vọng ghi trước cho từng ca, hoặc ít nhất mỗi ca phải có > 0 chỗ không được miễn. Ngoài ra dòng 564 còn miễn thêm «·», trong khi lời hứa là «trừ đúng tập {Kara}».
  lý do vào hợp đồng: AC-8 hứa mọi chữ do thành phần tự đặt đổi theo tiếng trừ «Kara»; bài chỉ chốt tổng chỗ so lớn hơn 0 và miễn thêm ký tự, nên một thành phần có thể không được so mà vẫn qua.

- **Hình dạng 4 (không đối chứng dương): đối chứng dương của E3 trên merge-base không thể xanh với bộ chọn kiemThe**
  file: `apps/app/test/nen-kara-man-cu.dom.tsx:50`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Mục expected của E3 trong evals.yaml ghi «đối chứng dương: bộ chọn này chạy trên onehub trước lượt (bản sao proposed-change.tsx của merge-base) cũng xanh». Nhưng kiemThe (dòng 49-53) đòi `goc.getAttribute("data-density") === "card"`, và proposed-change.tsx ở merge-base 9660bf6c không hề có thuộc tính data-density (grep chỉ thấy data-slot; data-density mới xuất hiện ở dòng 338/373 của bản HEAD). Chạy trên merge-base, bộ chọn này sẽ ném lỗi «doi sang inline», nên đối chứng dương như đã tuyên là không đạt được. Trong tệp kiểm cũng không có ca đối chứng nào. Bằng chứng duy nhất cho thấy bộ chọn phân biệt card với inline là chiều đỏ facts.tsx. Chưa có gì chứng minh dấu group/alert thật sự là dấu của bản trước lượt như lời hứa «như trước lượt».
  lý do vào hợp đồng: AC-3 hứa hai màn cũ ra bản card như trước lượt; bộ chọn đòi data-density mà bản trước lượt không có, nên lời hứa «như trước lượt» chưa được chứng minh bằng đối chứng dương.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The inline ProposedChange draws its own AI icon instead of using KaraMark, so the mark now lives in two places**
  Người dùng thấy gì: Đề xuất của Kara dạng một dòng đang tự vẽ biểu tượng tia sáng riêng thay vì dùng chung một dấu Kara. Hôm nay người dùng thấy đúng; nhưng nếu sau này đổi hình dấu Kara thì dòng này sẽ không đổi theo và hai nơi có thể lệch nhau.
  file: `packages/ui/src/components/proposed-change.tsx`
  severity: medium
  Đề xuất: known-limits

- **docs/ai-ux.md tells the next round to build on a file and components that are not in the repo**
  Người dùng thấy gì: Tài liệu hướng dẫn cho lượt sau nhắc tới một khối giao diện mà hiện chưa có trong sản phẩm vì nó thuộc một lượt làm khác chưa gộp. Người đọc tài liệu có thể đi tìm thứ chưa tồn tại cho đến khi lượt kia xong.
  file: `docs/ai-ux.md`
  severity: low
  Đề xuất: known-limits

- **nk_san_thiet_ke ignores a failing find, so the proto files can be skipped without any error**
  Người dùng thấy gì: Bước kiểm tra giao diện tự động có thể lặng lẽ bỏ qua các màn mẫu nếu thư mục của chúng bị đổi tên hay dời đi, và vẫn báo đạt. Hiện thư mục còn nguyên nên chưa ảnh hưởng gì tới người dùng.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
