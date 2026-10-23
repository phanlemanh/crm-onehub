# Review findings: hop-cap-nhat-lan-truoc (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E7-run.log và E7-step1/2.png là của bản thước cũ, không khớp man.mjs đã commit cùng lượt**
  Người dùng thấy gì: Người dùng không thấy gì khác: hộp cập nhật vẫn hiển thị như đã làm. Chỉ là hồ sơ nghiệm thu về việc hộp đọc trọn ở khổ điện thoại và máy tính được ghi từ lượt kiểm cũ, chưa có lượt kiểm mới nhất xác nhận lại.
  Căn cứ: Không ảnh hưởng người dùng cuối, không mất hay lộ dữ liệu, và chạy lại lượt kiểm rồi ghi đè bằng chứng là việc rẻ, làm được sau.
  file: `_acceptance/hop-cap-nhat-lan-truoc/evidence/E7-run.log`
  severity: high
  Đề xuất: known-limits

- **E7-run.log và E7-step*.png được ghi từ man.mjs bản cũ, không khớp thước đang commit và không khớp hct-*.png**
  Người dùng thấy gì: Người dùng vẫn mở hộp cập nhật và thấy ghi chú lần trước như bình thường. Chỉ có điều ảnh chụp và nhật ký đi kèm hồ sơ chưa chắc là của cùng một lượt kiểm, nên chưa chứng minh được lượt kiểm mới nhất đạt.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng và không mất dữ liệu; lỗi nằm ở hồ sơ chứng cứ, chạy lại và chép lại là xong.
  file: `_acceptance/hop-cap-nhat-lan-truoc/evidence/E7-run.log`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): đối chứng dương mới của E7 ở cấp hộp chưa từng chạy, vì E7-run.log được sinh ra từ man.mjs bản trước khi sửa**
  Người dùng thấy gì: Chưa có bằng chứng rằng bài kiểm tràn chữ trong hộp cập nhật thật sự bắt được lỗi khi lỗi xảy ra. Nếu ghi chú dài làm hộp bị tràn ngang thì phép kiểm hiện có có thể chưa báo, dù hiện chưa thấy hộp nào bị tràn.
  Căn cứ: Hậu quả nhẹ: nếu có tràn thì người dùng chỉ thấy chữ lệch và vẫn gửi được cập nhật, không mất dữ liệu; chạy lại thước đã sửa là có ngay bằng chứng.
  file: `_acceptance/hop-cap-nhat-lan-truoc/evidence/E7-run.log`
  severity: medium
  Đề xuất: known-limits

- **tuanVN chép lại dauTuanVN của máy chủ trong apps/app thay vì dùng chung một hàm ở packages/validation (r1)**
  Người dùng thấy gì: Hai chỗ trong sản phẩm cùng tính tuần theo giờ Việt Nam. Nếu sau này một chỗ bị sửa mà chỗ kia không, khối «Lần cập nhật trước» có thể mất ghi chú mà không báo gì. Hiện tại hai chỗ vẫn khớp.
  Căn cứ: Hiện chưa gây sai cho người dùng và các ca sát nửa đêm đã được kiểm; rủi ro chỉ đến khi có người sửa một bản, và sửa sau không đắt hơn bây giờ.
  file: `apps/app/app/(app)/[slug]/okr/lan-truoc-kr.ts`
  severity: medium
  Đề xuất: known-limits

- **lanTruocTuVet tính lại lần cập nhật cuối của KR mà krCapNhatTuSheet đã tính, và hai bản chọn khác nhau khi trùng giờ (r1)**
  Người dùng thấy gì: Hiếm khi hai lần cập nhật của một KR trùng đúng giây. Nếu xảy ra, nhãn lần cập nhật và khối «Lần cập nhật trước» trong cùng hộp có thể nói về hai lần gửi khác nhau.
  Căn cứ: Chỉ xảy ra khi hai lần gửi trùng đúng thời điểm nên cực hiếm, hậu quả chỉ là một nhãn lệch, không mất dữ liệu; người dùng mở lại hộp sau khi có lần gửi mới là hết.
  file: `apps/app/app/(app)/[slug]/okr/lan-truoc-kr.ts`
  severity: medium
  Đề xuất: known-limits

- **Dùng className đổi bố cục và khoảng cách của ItemDescription, trái docs/design.md và kế hoạch của chính vòng này (r1)**
  Người dùng thấy gì: Khối «Lần cập nhật trước» chỉnh khoảng cách bằng cách vá tại chỗ thay vì dùng thành phần chung, nên giao diện có thể lệch nhẹ so với các màn khác nếu thành phần chung đổi sau này. Người dùng hiện không thấy sai gì.
  Căn cứ: Chỉ là lệch quy ước thiết kế, không ảnh hưởng chức năng hay dữ liệu; sửa lúc nào cũng được khi thành phần chung được dựng.
  file: `apps/app/app/(app)/[slug]/okr/khoi-lan-truoc.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/hop-cap-nhat-lan-truoc/evidence/E7-run.log) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

