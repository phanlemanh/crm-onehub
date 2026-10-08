# Review findings: eval-model-that-dung-luc (round 2)

## Trong hợp đồng

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): bản vá hỏi lại vùng xám chỉ được đo trên chonHoiLai với CauHai gõ tay, còn chỗ gọi trong cham-bo-do, nơi lỗi round 1 nằm, không phép đo nào chạy tới**
  file:line: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts:395`
  severity: high
  source: measurement
  AC: AC-6
  detail: Lỗi AC-6 của round 1 nằm ở chỗ gọi trong cham-bo-do.ts (dòng 631-639, đoạn lọc `bo.cau.filter(c => ids.has(c.id) && !theoMot.has(c.id))`). Bài mới «dung trang và chuyen quy dinh cùng xám, chồng id» chỉ gọi `chonHoiLai(keHoachHoiLai(kl, mot, hai))` trên mảng `hai` dựng tay: `cauHai(id, true, …)` gán `quyDinh: true` bằng tay. Bài không đi qua `chamTungCau`, hàm tạo CauHai trong cham-bo-do (`quyDinh: d.nhom !== "khong-phai-quy-dinh"`). Bài cũng không đi qua đoạn lọc `cauMot.filter(theoMot.has)` / `bo.cau.filter(theoHai.has)` dẫn tới `chayLuot("hoi-lai", …)`. Không eval nào khác chạy tới các dòng đó. `--cham-lai` (E13) chỉ in `keHoachHoiLai` và không gọi `chonHoiLai`. dot-bien.mjs vẫn có SO_CAP_KHAI = 8 và không có cặp nào phá chỗ gọi này. Ca hỏng cụ thể: trả dòng 638 về `bo.cau.filter((c) => theoHai.has(c.id) && !theoMot.has(c.id))`, hoặc đổi `quyDinh` trong chamTungCau thành `d.nhom === "co-trang"`. Khi đó E1–E13 vẫn xanh, trong khi lượt hỏi lại Zalo lại thiếu câu đúng như round 1.

- **Hình dạng 2 (fixture viết tay, không round-trip): bản vá «ZaloHoi lỗi là loi» chỉ đo hàm ketCucZalo trên chuỗi ketQua gõ tay, còn chỗ nối trong nhanHai không phép đo nào chạy**
  file:line: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts:438`
  severity: medium
  source: measurement
  AC: AC-1
  detail: Lỗi AC-1 của round 1 nằm trong `nhanHai` của cham-bo-do.ts: dòng 450 cũ là `const ketCuc = coHang ? "co-hang" : "khong-hang"`, không đọc `k.ketQua`. Bài mới «nhan-loi zalo» đưa BANG_ZALO gõ tay thẳng vào `ketCucZalo(ketQua, coHang)`. Bài không đi qua đường thật: kết quả eval qua `docKetQua`, rồi `nhanHai`, rồi `cham-tung-cau.jsonl`. Tệp jsonl lại chỉ giữ KetCucHai đã ánh xạ (`loi`/`co-hang`/`khong-hang`), nên `--cham-lai` (E13) cũng không chạy lại `ketCucZalo`. dot-bien.mjs không có cặp phá dòng 450. Ca hỏng cụ thể: trả dòng 450 về `const ketCuc: KetCucHai = coHang ? "co-hang" : "khong-hang"`. Khi đó cả 11 dòng của BANG_ZALO vẫn xanh, còn một hàng ZaloHoi `gui-hong` hay `loi` (ví dụ lỗi 402 của agent gốc) lại bị tính thành `khong-chuyen`, tức lỗi của model.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ngưỡng E15 nằm ở hai nơi: kiểm thử ghim CHAM_BO_DO.nguong, còn script chạy bằng NGUONG cục bộ**
  Người dùng thấy gì: Ngưỡng đạt của phép đo model thật được khai ở hai chỗ. Hôm nay hai chỗ cùng số, nhưng sau này ai chỉnh một chỗ thì kiểm thử vẫn xanh trong khi phép đo thật chấm theo số cũ.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: new-contract

- **--cham-lai đọc cham-tung-cau.jsonl bằng ép kiểu `as DongTungCau`, không phân tích ở biên**
  Người dùng thấy gì: Nếu tệp kết quả từng câu bị gõ sai hoặc lẫn giữa hai lượt, lệnh chấm lại có thể lặng lẽ tính câu đó là trả lời sai thay vì báo tệp hỏng, làm tỉ lệ lệch đi mà không ai biết.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: known-limits

- **docBanGhi nuốt lỗi parse thành null, báo «chua co ban ghi» cho một bản ghi hỏng**
  Người dùng thấy gì: Nếu bản ghi kết quả đã lưu bị hỏng, hệ thống đo lại bằng model thật (tốn tiền) và báo là chưa có bản ghi, nên người đọc không biết bản ghi đã hỏng.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Phạm vi băm bỏ sót module mà chính script chấm và agent dùng để ra kết quả**
  Người dùng thấy gì: Sửa một số tệp phụ trợ của phép kiểm trích dẫn sẽ không làm kết quả cũ hết hiệu lực, nên trong tối đa 7 ngày hệ thống vẫn báo đạt dựa trên kết quả đã đo trước khi sửa.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: medium
  Đề xuất: new-contract

- **Quyết định cuối sau hỏi lại suy ra từ chuỗi đã định dạng (`endsWith(" khong-dat")`)**
  Người dùng thấy gì: Kết luận cuối của phép đo dựa vào chữ in ra màn hình. Nếu sau này ai đổi cách in chữ đó thì một chỉ số không đạt có thể bị bỏ sót mà không báo lỗi.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: low
  Đề xuất: wont-fix

- **The hash leaves out runtime code the E15 measurement depends on, so a changed input can reuse a stale signed result**
  Người dùng thấy gì: Một số mã mà phép đo thật dùng không được tính vào dấu vân tay, nên sửa chúng không buộc đo lại; kết quả đạt cũ có thể được dùng lại tới 7 ngày dù hành vi đã khác.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: medium
  Đề xuất: new-contract

- **An unclosed question (LOI, lyDo loi-model) is labelled an infrastructure error, so a model failure becomes 'KHONG DO DUOC' instead of 'sai'**
  Người dùng thấy gì: Khi model kết thúc mà không nộp câu trả lời nào, phép đo báo là không đo được thay vì báo model làm sai, nên một hồi quy của model có thể bị đọc nhầm là sự cố hạ tầng.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: new-contract

- **luot-kep.mjs exits inside try, so finally never runs and the temp directory leaks**
  Người dùng thấy gì: Mỗi lần phép đo lượt kép thất bại sẽ để lại một thư mục tạm trên máy chạy; không ảnh hưởng kết quả đo hay người dùng sản phẩm.
  file: `_acceptance/eval-model-that-dung-luc/rang/luot-kep.mjs`
  severity: low
  Đề xuất: wont-fix

- **cham-lai.mjs picks the newest real run even if it had `loi`, which turns E13 and dot-bien pair h red falsely (r1)**
  Người dùng thấy gì: Nếu lượt chạy thật gần nhất có câu lỗi hạ tầng, bài kiểm tự động báo đỏ dù chức năng chấm lại không hỏng. Gây báo động nhầm chứ không làm sai kết quả đo.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — câu khẳng định âm tính không có đối chứng dương: «không có dòng eve eval» ở lượt 2 (r1)**
  Người dùng thấy gì: Bài kiểm «lượt hai không chạy lại phép đo tốn tiền» có thể luôn xanh nếu chuỗi dò bị gõ sai, nên chưa chắc bắt được lỗi dùng lại.
  file: `_acceptance/eval-model-that-dung-luc/rang/luot-kep.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — thông điệp ghim không phân biệt nguyên nhân: cặp (h) ghim câu báo lỗi chung của ca (2) trong cham-lai.mjs (r1)**
  Người dùng thấy gì: Một bài tự kiểm có thể đỏ vì lý do khác với lý do nó khai. Chỉ ảnh hưởng việc chẩn đoán nội bộ, không ảnh hưởng kết quả sản phẩm.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 — lời hứa round-trip là quan hệ (mã thoát và dòng tổng), nhưng chỉ đo dòng chỉ số có mặt (r1)**
  Người dùng thấy gì: Khi chấm lại một lượt cũ, công cụ chưa so mã kết quả với lượt thật, nên một chỗ lệch nhỏ về kết luận đạt/không đạt có thể không bị phát hiện.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

