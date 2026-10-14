# Review findings: gan-tay-va-kara-co-ly-do (round 1)

## Trong hợp đồng

- **Hình dạng 3 (assert chuỗi có mặt, trong khi lời hứa là quan hệ): đầu vào không có khoảng trắng nên không phân biệt được «gửi chữ đã cắt» với «gửi nguyên chữ»**
  AC: AC-9
  file: `apps/app/test/gan-ly-do.dom.tsx:181`
  severity: medium
  source: measurement
  detail: AC-9 hứa «bấm Gắn/Lưu gửi lý do và căn cứ đã cắt khoảng trắng». Theo E9, ở chế độ sửa test phải gõ lý do có khoảng trắng hai đầu và căn cứ ' \n ', rồi đòi suaLyDoCanChinh nhận {id, lyDo đã cắt, canCu: null}. Test thực tế không gõ lại lý do: ô lý do giữ nguyên LY_DO điền sẵn, vốn không có khoảng trắng, và ô căn cứ được đặt thành '' chứ không phải ' \n ' (dòng 181). Assert ở dòng 186-190 `toEqual({id:'al-1', lyDo: LY_DO, canCu: null})` vì thế chỉ so một chuỗi đã sạch sẵn. Với đầu vào này, giá trị gửi bằng trim(chữ gõ) và cũng bằng chính chữ gõ, nên quan hệ không được đo. Nếu bỏ `.trim()` ở hop-thoai-can-chinh.tsx:133-134, test vẫn xanh: lý do vốn sạch, còn canCu '' vẫn đi qua nhánh `=== ''` thành null. Chế độ nhận đề xuất (dòng 256, 261-266) mắc cùng lỗi: gõ 'Lý do người duyệt' không đệm. E9 tự ghi rằng chế độ gắn không đo được và «đường chữ dùng chung với chế độ sửa», nên vế «gửi chữ đã cắt» của AC-9 hiện không có phép đo nào. E2 và E12 không bù được vì phía API tự cắt lại bằng docLyDoCanChinh.
  rationale: AC-9 hứa bấm Gắn/Lưu gửi chữ đã cắt khoảng trắng; bài đo dùng đầu vào sạch sẵn nên vế này không được phép đo nào chứng minh.

- **Hình dạng 3 (assert hằng số, trong khi lời hứa là quan hệ): «cách sua thiếu lý do bị từ chối như với dòng viết lại» không được so với dòng viết lại**
  AC: AC-7
  file: `apps/api/test/okr-gan-ly-do.spec.ts:581`
  severity: medium
  source: measurement
  detail: AC-7 hứa một quan hệ: cách `sua` thiếu lý do trên dòng can-chinh bị từ chối như với dòng viet-lai. E7 khai rõ phần đối chứng: «cùng gọi trên dòng viet-lai cho cùng thông điệp». Dòng 581-585 chỉ gọi troLyQuyet {cach:'sua'} trên d1 (can-chinh) rồi `expect([status, loi]).toEqual([400, T.troLy.canGiaTri])`, tức so với một hằng số. Test không gieo dòng viet-lai nào và không gọi trên dòng đó. Nếu đường viet-lai đổi thông điệp hay mã lỗi, test vẫn xanh dù hai đường đã lệch nhau. Đó đúng là cái AC-7 hứa giữ.
  rationale: AC-7 hứa quan hệ «bị từ chối như với dòng viết lại»; bài đo chỉ so với hằng số, không gọi trên dòng viết lại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Module nạp mẫu mới nằm ngoài chặn production của okr:mau và ghi thẳng bảng agentTask**
  Người dùng thấy gì: Hàm nạp đề xuất mẫu của Kara hiện không tự từ chối khi bị gọi ở môi trường thật. Hôm nay chỉ có công cụ đo màn gọi nó và công cụ đó đã có chặn riêng, nên rủi ro chỉ xuất hiện nếu sau này có chỗ khác gọi lại.
  file: `apps/api/scripts/okr-mau/nap-de-xuat-kara.ts`
  severity: low
  Đề xuất: known-limits

- **Ô thao tác tự ghép bằng div trong khi packages/ui có ButtonGroup; srLabel của cột vẫn chỉ nói «Gỡ»**
  Người dùng thấy gì: Trong tab Căn chỉnh, cột chứa hai nút Sửa lý do và Gỡ vẫn được đọc to là «Gỡ» với người dùng trình đọc màn hình, nên họ có thể không biết cột này còn có nút sửa.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hộp thoại kiểm và cắt lý do, căn cứ bằng tay thay vì dùng lyDoCanChinhNhap dùng chung**
  Người dùng thấy gì: Hộp thoại căn chỉnh hiện làm đúng. Nhưng nếu sau này đổi luật về lý do hay căn cứ, màn hình có thể xử lý khác với máy chủ mà không ai hay.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-can-chinh.tsx`
  severity: low
  Đề xuất: known-limits

- **Ở chế độ nhận đề xuất của Kara, ô lý do ghi «Không bắt buộc» nhưng để trống thì không gửi được**
  Người dùng thấy gì: Khi nhận đề xuất của Kara, ô lý do ghi «Không bắt buộc» nhưng xoá trống thì nút Căn chỉnh bị khoá mà không nói vì sao. Người dùng có thể bối rối không hiểu tại sao không bấm được.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-can-chinh.tsx`
  severity: low
  Đề xuất: known-limits

- **Hợp đồng nhận lý do và căn cứ là chuỗi không giới hạn; bộ lược đồ dùng chung chỉ chạy trong service**
  Người dùng thấy gì: Tài liệu mô tả giao diện lập trình không nói rõ giới hạn độ dài của lý do và căn cứ, dù hệ thống vẫn từ chối chữ quá dài khi lưu. Người tích hợp có thể chỉ biết giới hạn sau khi bị báo lỗi.
  file: `apps/api/src/okr/okr.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **PATCH /okr/alignments/{id} xoá ngầm trường bị bỏ trống: thiếu canCu (hay lyDo) bị coi là null**
  Người dùng thấy gì: Nếu một công cụ bên ngoài sửa lý do mà không gửi kèm căn cứ, căn cứ đang lưu sẽ bị xoá lặng lẽ và căn chỉnh có thể tụt về «Chưa có lý do». Hộp thoại trên màn hình luôn gửi đủ nên người dùng thường không gặp.
  file: `apps/api/src/okr/okr.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **troLyQuyet cách `sua` cho dòng can-chinh: bỏ trống canCu thì âm thầm mất căn cứ của Kara và lật lyDoTuKara thành false**
  Người dùng thấy gì: Nếu công cụ bên ngoài nhận đề xuất của Kara theo cách sửa mà quên gửi căn cứ, căn chỉnh sẽ mất căn cứ Kara đã viết và bị ghi như do người sửa. Người dùng trên màn hình không gặp vì hộp thoại luôn gửi đủ.
  file: `apps/api/src/okr/tro-ly.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Script nạp mẫu đóng AgentTask với outcome `da-nop` trước khi kiểm kết quả nộp**
  Người dùng thấy gì: Khi nạp đề xuất mẫu mà bị từ chối, việc nền để lại có thể ghi nhầm là «đã nộp». Chỉ ảnh hưởng dữ liệu mẫu khi chạy lỗi, không đến người dùng thật.
  file: `apps/api/scripts/okr-mau/nap-de-xuat-kara.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assert âm tính đứng một mình): dongGopY từ chối canCu trên viet-lai/hoi chỉ được đo bằng success=false, không ghim thông điệp, không có đối chứng dương cùng fixture**
  Người dùng thấy gì: Bài kiểm việc Kara không được gắn căn cứ vào đề xuất loại viết lại hay hỏi hiện đạt, nhưng chưa chắc bắt được lỗi nếu sau này luật đó bị gỡ nhầm. Người dùng chưa bị ảnh hưởng.
  file: `apps/agent/test/nop-de-xuat-can-cu.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (đếm suy ra từ chính vòng lặp, không từ ma trận viết trước): «số lệnh đã chạy === số lệnh khác nhau» không bao giờ đỏ được**
  Người dùng thấy gì: Bước kiểm lại các hồ sơ cũ có một phép đếm luôn đúng, nên nếu bộ lọc bỏ sót một hồ sơ thì phép đếm này không báo. Người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/gan-tay-va-kara-co-ly-do/rang/giu-ho-so.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên phủ hai bề mặt × locale, chỉ có một ca điểm): nhãn mức tin theo locale chỉ đo ở hộp thoại, một mức, không đo ở đề xuất**
  Người dùng thấy gì: Nhãn mức tin bằng tiếng Anh mới được kiểm ở hộp thoại và một mức, chưa kiểm ở phần đề xuất của Kara. Nếu có chỗ hiện nhãn tiếng Việt khi chọn tiếng Anh thì chưa có bài kiểm nào báo.
  file: `apps/app/test/gan-ly-do.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
