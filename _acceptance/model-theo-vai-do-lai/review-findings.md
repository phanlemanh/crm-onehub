# Review findings: model-theo-vai-do-lai (round 1)

## Trong hợp đồng

- **Công thức chi phí phần ứng viên lệch hợp đồng đã ký (bỏ đọc cache × giá cache)**
  file: `_acceptance/model-theo-vai-do-lai/rang/khuon.ts:284`
  severity: high
  AC: AC-5
  source: conventions
  detail: Hợp đồng đã ký có ba chỗ nói chi phí phần ứng viên tính cả đọc cache theo giá riêng: AC-5 ghi «token vào, đọc cache và ra … × giá niêm yết», E5 trong evals.yaml ghi «Σ (token vào × giá vào + đọc cache × giá cache + token ra × giá ra)», và câu Hỏi-10 trong decisions.jsonl nói giống vậy. Code lại khác: `chiPhiPhan` chỉ tính `inputTokens*gia.vao + outputTokens*gia.ra`, giá `doc_cache` trong ke-hoach.json được kiểm khuôn nhưng không dùng tới. nguong.json ghim literal `chi_phi: "token-vao-nhan-gia-vao-cong-token-ra-nhan-gia-ra"`, mà trường `nguon` lại ghi là theo Hỏi-10. Chỗ đổi đến từ quyết định d-20261020T225011Z-28: loại `fix`, ở S3, ghi lúc 22:50Z ngày 20/10, tức sau commit ký lại Cổng Phạm vi 21a751d19 (05:47 +07). Cổng chưa được mở lại cho chỗ đổi này, và AC-5/E5 vẫn giữ chữ cũ. Vì vậy bộ so mtv_so đang xác nhận một công thức khác với công thức trong expected của E5. docs/model-theo-vai.md in câu «không trừ đọc cache», trái với hợp đồng. Luật chọn «rẻ nhất» chạy trên số này, nên kiến nghị có thể khác nếu tính đúng công thức đã ký. Cần một trong hai: mở lại Cổng Phạm vi để sửa AC-5/E5, hoặc tính cache theo hợp đồng.

- **Công thức chi phí phần ứng viên lệch hợp đồng đã ký (bỏ hẳn số hạng đọc cache)**
  file: `_acceptance/model-theo-vai-do-lai/rang/khuon.ts:284`
  severity: medium
  AC: AC-5
  source: bugs
  detail: AC-5 trong contract.md và expected của E5 trong evals.yaml (dòng 41), được ký ở Gate 1 lúc 2026-10-21T05:47+07, định nghĩa chi phí phần ứng viên = Σ(token vào × giá vào + đọc cache × giá cache + token ra × giá ra). chiPhiPhan chỉ tính inputTokens×gia.vao + outputTokens×gia.ra: nó không đọc cacheReadTokens và không dùng gia.doc_cache, dù ke-hoach.json có ghim giá này. Chỗ đổi đến từ quyết định d-20261020T225011Z-28 (S3, ghi 3 phút sau lúc ký), nhưng không mở lại Cổng Phạm vi, nên evals.yaml và contract.md vẫn ghi công thức cũ. Hệ quả: E5 «tính lại» trong so-do.ts không kiểm đúng điều hợp đồng ghi, mà verifier đọc evals.yaml sẽ tính theo công thức có cache. Với bằng chứng hiện có thì kiến nghị không đổi: glm không có cột cache, còn ds chỉ rẻ thêm. Dù vậy, số in trong docs/model-theo-vai.md (ví dụ 0.008131155, 0.188970375) không phải số mà hợp đồng định nghĩa. Dưới enforcement strict, cần sửa contract/evals cho khớp quyết định d-28, hoặc sửa code cho khớp hợp đồng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi đọc số dư Gateway bị nuốt thành null rồi ghi 0 USD vào sổ trần**
  Người dùng thấy gì: Nếu máy chủ tính phí không trả được số dư thì lượt đo đó bị ghi là tốn 0 đồng, và mức trần chi có thể bị đếm thiếu mà không ai được báo.
  Căn cứ: Các lượt đã đo đều có số chi lấy từ bản kết xuất nên chưa sai số nào, chỉ là nguy cơ khi chạy thêm lượt, và đây là công cụ đo nội bộ nên ghi lại hạn chế là đủ.
  file: `_acceptance/model-theo-vai-do-lai/rang/chi-phi.ts`
  severity: medium
  Đề xuất: known-limits

- **Kiểm «model Gateway trả» của Soạn OKR không lấy từ lượt chạy thật**
  Người dùng thấy gì: Bảng so sánh model soạn OKR có thể ghi đúng tên model dù lượt chạy thật đã dùng model khác, nếu cấu hình bị đè ở chỗ khác.
  Căn cứ: Điều này chỉ xảy ra khi có người đè cấu hình khi đang đo, không làm mất dữ liệu, và có thể đo lại được, nên ghi hạn chế đã biết là hợp lý.
  file: `_acceptance/model-theo-vai-do-lai/rang/do-soan.ts`
  severity: medium
  Đề xuất: known-limits

- **Lệch múi giờ được vá bằng hằng 7 giờ thay vì đọc timestamp đúng ở biên**
  Người dùng thấy gì: Nếu chạy phép đo trên máy không đặt giờ Việt Nam, số chi phí của lượt này có thể lẫn hàng của lượt trước.
  Căn cứ: Máy chạy đo của chủ kho đặt đúng giờ Việt Nam và các lượt đã đo xong, nên hậu quả nhẹ và chỉ gặp nếu đổi máy.
  file: `_acceptance/model-theo-vai-do-lai/rang/khuon.ts`
  severity: low
  Đề xuất: known-limits

- **Đầu ra JSON của bước đọc lại ô model được ép kiểu bằng `as`, không parse qua khuôn**
  Người dùng thấy gì: Không có hậu quả nhìn thấy với người dùng, chỉ là cách viết mã không theo đúng quy ước của kho.
  Căn cứ: Bước kiểm ngay sau đó đã chặn lỗi thật, còn sửa thì phải sửa cả chỗ khoá chữ của bộ so nên tốn hơn lợi ích.
  file: `_acceptance/model-theo-vai-do-lai/rang/do-tac-nhan.ts`
  severity: low
  Đề xuất: wont-fix

- **Không đọc được số dư Gateway thì USD của lượt lặng lẽ ghi 0, trần chi bị lách**
  Người dùng thấy gì: Nếu việc đọc số dư hỏng giữa chừng, lượt tốn tiền thật có thể bị ghi là 0 đồng và lượt sau vẫn chạy dù đã chạm trần chi.
  Căn cứ: Lượt đã đo không dính lỗi này nên chưa mất tiền oan, và chạy lại được, nên ghi hạn chế đã biết là đủ.
  file: `_acceptance/model-theo-vai-do-lai/rang/do-kho.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: chiều đỏ «bot mot hang aichiphi phien con ds» ghim thông điệp chưa đủ hẹp, nên chiều này xanh ngay cả khi không có bước tính lại số phiên con nào**
  Người dùng thấy gì: Bộ kiểm tra của phép đo có một chỗ chưa bắt chắc khi số bước phiên con bị lệch, nên có thể báo xanh sai trong trường hợp hiếm.
  Căn cứ: Số liệu hiện có vẫn tính lại đúng, đây chỉ là lưới an toàn yếu của công cụ đo nội bộ và không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: ma trận biên của E5 chỉ đếm số ô, không so với số ô đã viết trước**
  Người dùng thấy gì: Nếu ai đó lỡ xoá một ca thử của bộ kiểm tra thì nó vẫn báo xanh.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của công cụ đo nội bộ, không làm sai bảng kiến nghị hiện tại và có thể bổ sung sau với chi phí thấp.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: kiểm model phiên con chỉ xét tập modelId có mặt trong su-kien, không ràng nó với sessionId của phiên con agent_builder**
  Người dùng thấy gì: Bộ kiểm tra có thể nhận nhầm model của phiên khác là model của phiên con, nên một lượt sai model có thể lọt.
  Căn cứ: Dữ liệu các lượt đã đo khớp model ứng viên nên chưa có kết luận sai, và đo lại được nếu nghi ngờ.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: «lượt qua dưới 180 giây» và «quá trần thì bi_cat true» được kiểm bằng chuỗi ly_do/ket_qua, không so giây với trần**
  Người dùng thấy gì: Bộ kiểm tra có thể đếm một lượt chạy quá 180 giây là lượt đạt nếu dòng ghi bị sai nhãn.
  Căn cứ: Dòng ghi do chính công cụ đo sinh ra nên khó sai trong thực tế, và nếu sai thì đo lại được.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1: «chặn đọc lại model trước eval» được đo bằng cách grep mã nguồn do-tac-nhan.ts, không đo đầu ra của lượt**
  Người dùng thấy gì: Bộ kiểm tra chỉ xác nhận đoạn mã chặn có mặt chứ không xác nhận mỗi lượt đã thật sự đọc lại model.
  Căn cứ: Không có lượt nào đã biết bị lệch model, và nhìn lại mã là kiểm được, nên hậu quả nhẹ.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6: kiemBang tìm tệp bằng chứng ở GOC (checkout thật) trước cây đang kiểm**
  Người dùng thấy gì: Khi kiểm trên một bản sao, một tệp bằng chứng đã mất vẫn có thể được coi là còn nếu nó còn ở bản gốc.
  Căn cứ: Chỉ gặp khi kiểm trên cây khác với cây gốc, hiếm và lộ ra khi người ký đọc lại, nên không đáng tốn công sửa.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5: tập ứng viên/biến thể mong đợi của E1 và E5 rút từ ke-hoach.json trong chính bộ bằng chứng đang kiểm, không có bảng viết trước**
  Người dùng thấy gì: Nếu ai đó bỏ bớt một model khỏi kế hoạch đo thì bộ kiểm tra vẫn báo xanh dù thiếu số liệu.
  Căn cứ: Kế hoạch đo đã được ký và kho bằng chứng hiện đủ ứng viên, nên rủi ro chỉ có khi sửa tay sau này.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: model kho của ds/gem chỉ đọc từ trường tóm tắt tom-tat.json, không đối chiếu với báo cáo thô mà nó được rút ra**
  Người dùng thấy gì: Bảng có thể ghi đúng tên model của Trợ lý kho dù báo cáo gốc ghi model khác, nếu tóm tắt bị sửa tay.
  Căn cứ: Tóm tắt do công cụ đo sinh ra từ báo cáo gốc nên khó lệch, và người đọc đối chiếu được ngay ở báo cáo gốc.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

