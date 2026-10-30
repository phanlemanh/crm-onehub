# Review findings: cham-bo-do-chiu-cau-loi (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A metric whose questions all hit model errors (still under the cap) is marked 'dat' with 0/0, so a run can pass without measuring it**
  Người dùng thấy gì: Nếu toàn bộ câu của một nhóm (ví dụ bốn câu chuyển nhầm của Zalo) cùng lỗi model mà vẫn dưới trần, lượt chấm vẫn báo đạt dù nhóm đó chưa được đo lần nào, và kết quả đạt đó được dùng lại tới bảy ngày.
  Căn cứ: Chỉ xảy ra khi đúng cả một nhóm câu cùng lỗi model trong một lượt, hiếm gặp; người dùng cuối không bị ảnh hưởng, chỉ làm lượt chấm nội bộ đạt khống, và chạy lại lượt là phát hiện được.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: medium
  Đề xuất: known-limits

- **The card says chấm lại (re-scoring from the saved file) catches missing questions, but `--cham-lai` only checks duplicates**
  Người dùng thấy gì: Thẻ người ký đọc nói chấm lại từ tệp đã ghi cũng chặn được lượt thiếu câu, nhưng thực tế chấm lại chỉ bắt được câu trùng. Người ký có thể tin hệ thống chặt hơn thực tế.
  Căn cứ: Hậu quả chỉ là một câu mô tả trên thẻ nói hơn việc làm, không mất hay lộ dữ liệu; lượt thiếu câu khi chấm lại từ tệp bị cắt là tình huống hiếm, và sửa lời thẻ rất rẻ.
  file: `_acceptance/cham-bo-do-chiu-cau-loi/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc (hình dạng 2): cham-bo-do.md của khoá emtdl_cham_lai dựng từ chính đầu ra --cham-lai, nên vế round-trip của cham-lai.mjs đúng sẵn**
  Người dùng thấy gì: Phép kiểm chấm lại bằng lượt mẫu không thể đỏ vì so kết quả với chính nó, nên chưa chứng minh được bản ghi lượt thật khớp với chấm lại. Chỉ lượt thật ở bước ghim mới chứng minh được điều đó.
  Căn cứ: Hợp đồng đã ghi sẵn vế này chỉ kiểm được ở bước ghim trên lượt thật, nên chỗ hở được che bằng bước sau; nếu lệch thì bước ghim đỏ và người dùng không gặp gì.
  file: `_acceptance/cham-bo-do-chiu-cau-loi/rang/f12-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
