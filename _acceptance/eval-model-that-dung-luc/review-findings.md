# Review findings: eval-model-that-dung-luc (round 1)

## Trong hợp đồng

- **Hỏi lại vùng xám bỏ sót câu khi hai chỉ số chồng id cùng xám (vi phạm AC-6)**
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts:630`
  severity: high
  AC: AC-6
  source: conventions
  detail: Lượt 1 và lượt Zalo dùng chung id câu: chayLuot("luot-1", cauMot, bo.cau) hỏi các câu co-trang/khong-dau/khong-co ở cả hai lượt. Dòng 630-640 lấy `theoMot` = id của dungTrang/tuChoiDung, rồi chọn câu Zalo bằng `ids.has(c.id) && !theoMot.has(c.id)`. Bộ câu của chuyenQuyDinh (mọi câu có nhom khác khong-phai-quy-dinh) trùng với bộ của dungTrang và tuChoiDung. Ví dụ dungTrang và chuyenQuyDinh cùng xám: lượt Zalo hỏi lại chỉ còn 6 câu khong-co thay vì đủ 30 câu quy định. Khi đó gop() ở dòng 649 kết luận trên mẫu số thiếu, và bằng chứng vẫn in «gop …» như đã hỏi đủ. AC-6 hứa «hỏi lại đúng một lần trên đủ bộ câu của chỉ số đó». Cần tách id theo lượt: keHoachHoiLai trả cả lượt, hoặc tính chonMot/chonHai riêng theo chiSo, thay vì loại trừ nhau bằng một tập id chung.
  lý do xếp trong hợp đồng: AC-6 hứa hỏi lại đúng một lần trên đủ bộ câu của chỉ số vùng xám; hỏi lại thiếu câu làm AC này thất bại.

- **A Zalo row that ended in an error state is counted as the model's miss, not as `loi`**
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts:443`
  severity: high
  AC: AC-1
  source: bugs
  detail: `nhanHai` labels a question `loi` only when there is no result or `k.loi` is set. The eval sets `k.loi = null` as soon as the ZaloHoi row leaves `dang-hoi`. `nhanHai` never reads `k.ketQua`, so a row that ended as `loi`, `gui-hong`, `tu-choi-tran-*` or `dang-ban` with no matching TaiLieuHoi row becomes `khong-chuyen`. Example: a 402 or budget error in the main agent's zalo session. That row then counts as a model miss in `chuyenQuyDinh`, or as a correct non-transfer in `chuyenNham`. This is exactly the infrastructure-as-model-error case AC-1 forbids ("hàng TaiLieuHoi/ZaloHoi của nó ở trạng thái lỗi" must be `loi` and exit 2). `cham-tung-cau.jsonl` does not store the ZaloHoi state, so `--cham-lai` cannot recover it either.
  lý do xếp trong hợp đồng: AC-1 nêu rõ hàng ZaloHoi ở trạng thái lỗi phải mang nhãn loi và thoát 2; mã gán nó thành lỗi của model.

- **The re-ask drops Zalo questions when a lượt-một metric and chuyenQuyDinh are both in the grey zone**
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts:639`
  severity: high
  AC: AC-6
  source: bugs
  detail: `ids` is the union of all grey-zone sets, and `theoMot` holds the ids of dungTrang and tuChoiDung. The Zalo re-ask is `bo.cau.filter(c => ids.has(c.id) && !theoMot.has(c.id))`. But chuyenQuyDinh's set covers every rule question (co-trang, khong-co, khong-dau = 30), and those same ids sit in `theoMot`. Concrete case: dungTrang and chuyenQuyDinh both grey. dungTrang's 24 questions go to lượt một only, so the Zalo re-ask runs just the 6 khong-co questions. `gop` then combines 30 + 6 instead of 30 + 30. AC-6 requires the re-ask on the full question set of each metric, so the verdict rests on a biased partial sample.
  lý do xếp trong hợp đồng: Cùng gốc với phát hiện thứ nhất: AC-6 đòi hỏi lại trên đủ bộ câu của chỉ số, mã chỉ hỏi lại một phần.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tệp cham-tung-cau.jsonl đọc bằng `JSON.parse as DongTungCau`, không parse bằng Zod ở biên**
  Người dùng thấy gì: Nếu ai đó sửa tay tệp nhật ký từng câu và gõ sai một trạng thái, công cụ có thể tính một lỗi của máy thành câu trả lời sai của model mà không báo gì. Chỉ xảy ra khi tệp bị sửa tay, đường chạy bình thường không dính.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Ngưỡng E15 có hai nguồn: NGUONG trong cham-bo-do.ts và CHAM_BO_DO.nguong trong quyet-do.ts**
  Người dùng thấy gì: Con số ngưỡng đạt/không đạt đang nằm ở hai chỗ. Hôm nay hai chỗ giống nhau, nhưng sau này sửa một chỗ quên chỗ kia thì bài kiểm sẽ xanh trong khi lượt đo thật dùng con số khác.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: medium
  Đề xuất: known-limits

- **docBanGhi/docBanGhiHead gộp «bản ghi hỏng» với «chưa có bản ghi»**
  Người dùng thấy gì: Khi bản ghi đã lưu bị hỏng, công cụ nói là chưa có bản ghi rồi đo mới và tốn tiền model, thay vì báo bản ghi bị hỏng. Người xem sẽ bị nói sai nguyên nhân.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: low
  Đề xuất: known-limits

- **The zero-unverified-citation rule is not checked on the re-ask round**
  Người dùng thấy gì: Ở lượt hỏi lại, một câu trả lời trích dẫn sai trang có thể lọt mà không làm phép đo đỏ. Lượt đầu vẫn bắt được lỗi này.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: known-limits

- **SO LOI GOI MODEL is a printed constant or an estimate, not a counter, so E8 cannot fail on it**
  Người dùng thấy gì: Con số «số lời gọi model» được in sẵn chứ không đếm thật, nên nếu lượt dùng lại lỡ gọi model thêm, báo cáo vẫn ghi 2 và không ai biết tiền đã bị tốn.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: known-limits

- **cham-lai.mjs picks the newest real run even if it had `loi`, which turns E13 and dot-bien pair h red falsely**
  Người dùng thấy gì: Nếu lượt chạy thật gần nhất có câu lỗi hạ tầng, bài kiểm tự động báo đỏ dù chức năng chấm lại không hỏng. Gây báo động nhầm chứ không làm sai kết quả đo.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo chỉ dẫn thay vì đầu ra: «SO LOI GOI MODEL» là chữ in sẵn, không phải bộ đếm lời gọi model**
  Người dùng thấy gì: Báo cáo «chỉ gọi model đúng hai lần» là một dòng chữ viết sẵn, không phải số đếm thật, nên nó không chứng minh được việc tiết kiệm tiền như đã hứa.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — câu khẳng định âm tính đứng một mình, thông điệp ghim không bao giờ được ném: cặp (g) do-model ghim «thieu model_id cua goc» trên một nhánh bảo vệ chết**
  Người dùng thấy gì: Một bài tự kiểm có thể báo xanh vì trùng hợp chữ trong log chứ không phải vì đúng lý do. Sản phẩm không bị ảnh hưởng, chỉ là lưới bảo vệ kém chặt hơn vẻ ngoài.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp nhưng chỉ có các ca điểm: bảng nhãn E1 thiếu ô, và bộ đếm dòng lại đếm chính bảng**
  Người dùng thấy gì: Bảng kiểm cách gắn nhãn câu còn thiếu một số tổ hợp, nên một lỗi gắn nhãn ở các tổ hợp đó có thể lọt qua mà bài kiểm vẫn xanh.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay: ma trận băm chạy trên TEP_GOC gõ tay, và dòng «paths E15» không tách được lớp của nó**
  Người dùng thấy gì: Bài kiểm chưa chứng minh chắc rằng mọi nhóm tệp quan trọng đều được tính vào dấu vân tay. Nếu thiếu, lượt sau có thể dùng lại kết quả cũ dù mã đã đổi.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — câu khẳng định âm tính đứng một mình: «không ghi đè lượt trước» được đo trong khi lượt 2 không ghi gì**
  Người dùng thấy gì: Bài kiểm «nhật ký lượt trước không bị ghi đè» chưa thực sự chạy một lượt thứ hai, nên chưa chứng minh được điều nó khẳng định.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — câu khẳng định âm tính không có đối chứng dương: «không có dòng eve eval» ở lượt 2**
  Người dùng thấy gì: Bài kiểm «lượt hai không chạy lại phép đo tốn tiền» có thể luôn xanh nếu chuỗi dò bị gõ sai, nên chưa chắc bắt được lỗi dùng lại.
  file: `_acceptance/eval-model-that-dung-luc/rang/luot-kep.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — thông điệp ghim không phân biệt nguyên nhân: cặp (h) ghim câu báo lỗi chung của ca (2) trong cham-lai.mjs**
  Người dùng thấy gì: Một bài tự kiểm có thể đỏ vì lý do khác với lý do nó khai. Chỉ ảnh hưởng việc chẩn đoán nội bộ, không ảnh hưởng kết quả sản phẩm.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 — lời hứa round-trip là quan hệ (mã thoát và dòng tổng), nhưng chỉ đo dòng chỉ số có mặt**
  Người dùng thấy gì: Khi chấm lại một lượt cũ, công cụ chưa so mã kết quả với lượt thật, nên một chỗ lệch nhỏ về kết luận đạt/không đạt có thể không bị phát hiện.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

