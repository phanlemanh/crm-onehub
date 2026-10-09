# Review findings: ly-do-tu-choi-nop-theo-locale (round 1)

## Trong hợp đồng

- **k2c-ngoai is missing the promised 'not the comparison base' case for AC-3**
  file: `apps/app/test/soan-okr-ly-do-tu-choi.dom.tsx:180`
  severity: medium
  AC: AC-3
  source: conventions
  detail: AC-3 in contract.md requires that a rejected submit with an unknown or empty reason 'is not a checkpoint and is not the comparison base'. Eval E3 in evals.yaml spells out how that is measured, per locale: da-ghi draft A, then tu-choi with an unknown code on draft A+2 KR, then da-ghi draft A+1 KR. It must show two checkpoints, and the second checkpoint's text must equal the '+1 KR' checkpoint text. The k2c-ngoai describe block (lines 180-206) builds only da-ghi followed by tu-choi and asserts soMoc === 1. So the 'not the comparison base' half of AC-3 is never measured, even though E1/E3 cite this file as their evidence. This breaks the repo rule that an eval must measure what the criterion promises. If the reader change ever made a rejected submit the diff base, k2c-ngoai would still pass. The only similar check is in k2b-moc-ba (soan-okr-khong-lac.spec.ts), and it uses a real code (chuKyKhongLapKeHoach), not an unknown or empty reason, and does not go through the DOM.

- **E3/AC-3 promises a 'not the comparison base' case that the test never runs**
  file: `apps/app/test/soan-okr-ly-do-tu-choi.dom.tsx:180`
  severity: medium
  AC: AC-3
  source: bugs
  detail: E3 in evals.yaml says: "Thêm ca gốc so sánh (mỗi locale): da-ghi bản A → tu-choi mã lạ bản A+2 KR → da-ghi bản A+1 KR; đòi hai mốc và chữ mốc thứ hai === câu mốc của «+1 KR»". AC-3 also requires that the rejected submit is not used as the comparison base, and gap_probe i=4 in card-plain.json says this measurement was added. The `k2c-ngoai` describe block has only 2 reasons × 2 locales = 4 cases. Each case is a single da-ghi then a single tu-choi, and it only checks `soMoc === 1`. No case submits after the rejection and compares the second checkpoint's text, so the promised 'gốc so sánh' check does not exist. E3 still goes green, and Gate 2 would read it as proof of a clause nobody measured.

- **E9 en-1440 'before reload' screenshot is already a reload; both en shots are byte-identical**
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/man.mjs:180`
  severity: medium
  AC: AC-9
  source: bugs
  detail: In `con()` the whole submit sequence runs in vi, the default cookie from man-chung. Only after that, when `lang !== "vi"`, does it call `datNgonNgu` and then `moLai` (a reload) before the first `docDong`/`anh`. So the en lane never measures the live, unreloaded render in en: step 1 ('trước tải lại') and step 2 ('sau tải lại') are both reload measurements. `cmp` confirms evidence/E9-tu-choi-en-1440.png and E9-tu-choi-en-1440-tai-lai.png are byte-identical. That contradicts the E9 step ('cookie lang đặt theo ngôn ngữ của lượt' before measuring, then reload) and AC-9/card ('trước và sau khi tải lại' for every viewport and language). For en, the 'stays the same after reload' check compares two reloads, so it cannot catch a difference between the live render and the reloaded one.

- **Hình dạng 5 (ma trận khai trong eval nhưng thiếu ô): E3 hứa thêm ca gốc so sánh cho mỗi locale, bài k2c-ngoai không có ca đó**
  file: `apps/app/test/soan-okr-ly-do-tu-choi.dom.tsx:181`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Phần expected của E3 trong evals.yaml đòi ma trận viết trước 2 lý do × 2 locale = 4 ca, rồi 'Thêm ca gốc so sánh (mỗi locale): da-ghi bản A → tu-choi mã lạ bản A+2 KR → da-ghi bản A+1 KR; đòi hai mốc và chữ mốc thứ hai === câu mốc của «+1 KR»'. Trong describe('k2c-ngoai') (dòng 181-205) chỉ có hai vòng for, ngonNgu × ['ma-moi-cua-agent', ''], tức 4 ca, và ca nào cũng đi qua dungHoiThoai. Hàm này chỉ dựng [tinNop('n1', kq('da-ghi')), tinNop('n2', kq('tu-choi', lyDo))]: không có lần da-ghi thứ ba, không đòi hai mốc, không so chữ mốc thứ hai với m.moc.themKr. Nửa sau của AC-3 («không làm gốc so sánh» khi lý do nằm ngoài tập) vì thế không có assert nào đo. Ca gần nhất là k2b-moc-dom trong soan-okr-khong-lac.dom.tsx, nhưng ca đó dùng mã trong tập (LY_DO_TU_CHOI_NOP.chuKyKhongLapKeHoach), không dùng mã lạ. Bài cũng không có assert đếm số ca (ví dụ === 4 hay === 6), nên ô bị thiếu không làm gì đỏ: số assert khác số phần tử mà eval đã khai.

- **Hình dạng 5 (ô «trước tải lại» của lượt en bị thay bằng một lần tải lại): E9 en-1440 đo hai lần cùng một trạng thái đã tải lại**
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/man.mjs:181`
  severity: medium
  AC: AC-9
  source: measurement
  detail: AC-9 và E9 hứa ma trận 3 lượt × {trước, sau khi tải lại}: lần đọc đầu là màn sống ngay sau ba lần nộp, lần sau 'tải lại trang bằng điều hướng mới (đọc transcript đã lưu)'. Bước 2 của E9 còn đòi 'cookie lang đặt theo ngôn ngữ của lượt'. Trong con(), cả ba lần nộp chạy dưới cookie lang=vi (man-chung.mjs đặt lang=vi ở dòng 196). Riêng lượt en, mã chạy `if (lang !== "vi") { await datNgonNgu(t, lang); await moLai(t, cuoc.id); }` ở dòng 181-184 trước `const dau = await docDong(t.p)`. Vậy với en, 'dau' đã là bản đọc sau một lần tải lại từ transcript, và 'sau' chỉ là lần tải lại thứ hai. Màn tiếng Anh lúc đang chạy (trạng thái client, chưa tải lại) không được đo, nên phép so ở buoc(2) giữa trước và sau tải lại không đo được gì cho en. Bằng chứng khớp với điều này: E9-tu-choi-en-1440.png và E9-tu-choi-en-1440-tai-lai.png giống nhau từng byte (sha1 225ead2e… cho cả hai ở HEAD), trong khi cặp vi-1440 và vi-390 khác nhau.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **ranh-gioi.mjs docDot swallows every error and silently falls back to the copied boundary**
  Người dùng thấy gì: Nếu tệp khai phạm vi của đợt bị hỏng, kiểm tra phạm vi sửa đổi vẫn xanh nhưng đo theo một bản chép cũ mà không báo lỗi. Rủi ro thấp và chỉ xảy ra khi tệp khai bị hỏng.
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

- **E9 red path cannot print the message pinned in evals.yaml; the mutant shows the key, not the code value**
  Người dùng thấy gì: Khi bản phá thử của màn hình bị bắt, dòng báo lỗi in tên khoá thay cho câu mô tả như tài liệu ghi. Phép đo vẫn đỏ đúng chỗ, người đọc chỉ thấy chữ khác với chữ mong đợi.
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/man.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
