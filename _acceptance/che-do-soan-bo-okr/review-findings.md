# Review findings: che-do-soan-bo-okr (round 6)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kiểm dòng KR ở client tự viết lại một phần schema chung krInput, nên lỗi lưu không bao giờ hết**
  Người dùng thấy gì: Nếu người soạn gõ tên mục tiêu hay đơn vị của KR dài quá giới hạn, dòng không lưu được và chỉ hiện câu chung «Chưa lưu được. Rời ô để thử lại.». Thử lại bao nhiêu lần cũng hỏng cho tới khi họ tự rút ngắn chữ.
  Căn cứ: Chỉ gặp khi gõ chữ rất dài, chữ đã gõ vẫn còn nguyên nên người dùng tự rút ngắn rồi lưu lại được, không mất dữ liệu; hậu quả là một lúc khó hiểu, không nặng.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/du-lieu-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **Phân loại lỗi lưu bằng regex trên câu chữ của máy chủ thay vì đọc dữ liệu lỗi có kiểu**
  Người dùng thấy gì: Hiện người dùng vẫn thấy đúng câu báo lỗi ô số. Nếu sau này khuôn câu lỗi của máy chủ đổi, câu báo có thể lặng lẽ thành câu chung chung khó hiểu hơn.
  Căn cứ: Hôm nay không ai thấy gì sai; chỉ có thể làm câu báo lỗi kém rõ hơn trong tương lai, không mất dữ liệu, và sửa lúc đó rẻ hơn là sửa bây giờ.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-luu-dong.ts`
  severity: low
  Đề xuất: wont-fix

- **LOC_TRONG chép nguyên từ phan-don-vi-dan.tsx thay vì dùng chung**
  Người dùng thấy gì: Người dùng không thấy gì khác hôm nay. Về sau nếu bộ lọc danh sách được thêm mặt lọc mới mà chỉ sửa một nơi, chế độ Soạn có thể lọc lệch so với màn theo dõi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không mất dữ liệu; chỉ là nợ bảo trì nhỏ, sửa sau rất rẻ khi thật sự có thay đổi.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-bo-soan.ts`
  severity: low
  Đề xuất: wont-fix

- **Accepting or undoing one Kara rewrite re-applies every earlier accepted rewrite in the same objective, which overwrites text the person typed after accepting**
  Người dùng thấy gì: Khi nhận nhiều góp ý viết lại của Kara trong cùng một mục tiêu, chữ người soạn vừa tự sửa có thể bị đổi ngược về chữ cũ của Kara. Lần rời ô kế tiếp lưu chữ cũ đó đè lên chữ mới trên máy chủ mà không có cảnh báo nào.
  Căn cứ: Mất chữ người dùng đã gõ mà không báo, và chữ bị đè đã lưu lên máy chủ nên không tự tải lại để lấy về được; tuy nhiên chỉ xảy ra khi nhận nhiều góp ý và sửa xen kẽ, và sửa cần đụng tới cách chế độ Soạn áp góp ý nên không rẻ.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/khoi-gop-y.tsx`
  severity: medium
  Đề xuất: new-contract

- **suaKr/themKr remove deleted KR rows from the draft, so a failed KR delete cannot bring the row back**
  Người dùng thấy gì: Hiếm khi, nếu xoá một KR thất bại đúng lúc người soạn đang gõ KR khác của cùng mục tiêu, KR đó vẫn còn trên máy chủ nhưng biến mất khỏi tài liệu và không có lỗi nào hiện ra. Khi đóng khung, máy hỏi về dòng chưa lưu mà người dùng không thấy đâu.
  Căn cứ: Cần hai điều kiện trùng nhau là xoá lỗi và gõ ngay trong lúc chờ, nên rất hiếm; không mất dữ liệu vì KR vẫn còn và tải lại màn sẽ thấy lại.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/ban-nhap.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, đối chứng dương giả): «không vùng Kara / không neo» của E12 và E13 dò thuộc tính mà VungKara và DeXuatNeo thật không phát ra**
  Người dùng thấy gì: Người dùng chưa gặp lỗi nào. Nếu sau này ai đó thêm lại khối Kara vào khung chi tiết mục tiêu theo cách khác, bài kiểm tự động có thể vẫn báo xanh và không bắt được.
  Căn cứ: Không ảnh hưởng người dùng hôm nay; chỉ làm lưới kiểm tự động yếu hơn một ca hồi quy trong tương lai, và thước còn được các bước đo màn khác phủ.
  file: `apps/app/test/che-do-soan-bo-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E14 «bấm lớp phủ ngoài khung: khung còn mở» không có đối chứng cho thấy cú bấm lớp phủ đóng được khung**
  Người dùng thấy gì: Người dùng không thấy lỗi. Có khả năng bài kiểm chưa thật sự chứng minh việc bấm ra ngoài khung không làm mất dòng chưa lưu, nên một hồi quy ở đó có thể lọt qua.
  Căn cứ: Không có lỗi hiển thị cho người dùng; chỉ là bằng chứng kiểm thử yếu hơn ở một nhánh, và phần Esc cùng nút đóng vẫn được kiểm.
  file: `apps/app/test/che-do-soan-bo-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): dữ liệu mẫu cycles và danhSach thêm vào okr-to-chuc-va chỉ mang đúng khoá mà chip đọc**
  Người dùng thấy gì: Người dùng không thấy gì khác. Nếu hình dạng dữ liệu thật đổi, bài kiểm này có thể vẫn xanh trong khi chip Soạn đã hỏng.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; rủi ro chỉ là một bài kiểm cũ kém nhạy, rất rẻ để chấp nhận và khối này đã được lớp kiểm khác duyệt.
  file: `apps/app/test/okr-to-chuc-va.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): «không mang nhãn Kara» của KaraArtifact metaStyle=muted không có ca đối chứng mặc định**
  Người dùng thấy gì: Người dùng không thấy lỗi. Nếu nhãn Kara đổi cách dựng thì bài kiểm này vẫn báo xanh dù không còn kiểm đúng việc.
  Căn cứ: Không ảnh hưởng người dùng; chỉ là bài kiểm nhỏ thiếu một ca so sánh, sửa sau rất rẻ và không rủi ro dữ liệu.
  file: `packages/ui/test/kara-artifact-muted.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
