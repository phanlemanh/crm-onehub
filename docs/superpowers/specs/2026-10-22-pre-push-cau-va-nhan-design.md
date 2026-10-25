# pre-push: câu khai và nhãn dòng nặng nói đúng luật — thiết kế

Ngày 22/10/2026. Hồ sơ `_acceptance/pre-push-cau-va-nhan/`. Hạng T2. Vòng dọn sau
`_acceptance/pre-push-phan-rieng-pr/` (PR #536): Cổng Bằng chứng 22/10 nhận năm mục ngoài hợp đồng làm Known limits; vòng
này dọn ba mục rẻ nhất (Ngoài-1/Ngoài-4, Ngoài-2, Ngoài-3). Ngoài-5 (ghim nội dung lời hứa mới ở răng hồ sơ cũ) để lại.

## Vấn đề

1. **Câu khai tả sai vế đầu từ xa (Ngoài-1, Ngoài-4).** `t1Only.vi_sao` của `.githooks/gate-shape.json` nói tệp của
   onehub là tệp «mà ở cả hai đầu lần đẩy PR không khác bản onehub tại merge-base(đỉnh, <remote>/onehub)». Mã
   (`tepRieng` trong `scripts/pre-push-t1.mjs`) và mục «Luật mới» của
   `docs/superpowers/specs/2026-10-21-pre-push-phan-rieng-pr-design.md` so đầu từ xa với
   `merge-base(nền, sha từ xa)` — bản onehub mà đầu từ xa đang đứng trên — chứ không với nền. Đột biến
   «truoc-so-voi-nen» của răng `dot-bien.mjs` chính là luật câu khai đang tả.
2. **Nhãn dòng «nặng» sai lý do (Ngoài-2).** Khi phần PR tự thêm nặng vì có tệp dưới `.github/` (`quyetDinh` trả
   `cham-github`), dòng in «có tệp ngoài T1 (…)». Với `.github/*.md` — tệp T1 — nhãn sai, và danh sách rơi về cả phần
   PR tự thêm chứ không gọi tên tệp `.github/` gây nặng.
3. **Phép đo lịch sử không tách ca sập (Ngoài-3).** `rang/lich-su.mjs` coi stdout rỗng là «nặng». Bộ phân loại sập in
   `pre-push: không phân loại được lần đẩy (…)` và stdout rỗng, nên ở mọi lần gộp mà phép tính tay ra nặng, ca sập được
   đếm là khớp.

## Luật mới

### Câu khai

Đoạn luật gộp của `t1Only.vi_sao` nói, theo đúng thứ tự của mục «Luật mới» thiết kế 21/10:

- nền = `merge-base(đỉnh, <remote>/onehub)`;
- tệp của phần tăng là tệp của onehub khi PR không khác onehub ở tệp đó ở CẢ HAI đầu: ở đỉnh, tệp không nằm trong
  `diff(nền, đỉnh)`; ở đầu nhánh từ xa, tệp không nằm trong `diff(merge-base(nền, sha từ xa), sha từ xa)` — so với bản
  onehub mà đầu từ xa đứng trên, không phải với nền;
- lần đẩy không mang commit mới của onehub thì `merge-base(nền, sha từ xa)` là nền và luật rút về luật cũ;
- phần còn lại giữ nguyên: tập xét rỗng hoặc chỉ T1 thì bỏ; tệp mã, `t1_ma_doc`, `.github/**`, đẩy rỗng, phân loại hỏng
  thì chạy đủ.

Chỉ khoá `vi_sao` của `t1Only` đổi. Mọi khoá khác của `gate-shape.json` giữ nguyên từng giá trị.

### Nhãn dòng «nặng»

Nhãn theo lý do của `quyetDinh` trên tập xét — cùng thứ tự ưu tiên của hàm đó:

| `lyDo` | Nhãn | Danh sách (tối đa 3, `+m`) |
| --- | --- | --- |
| `cham-github` | `tệp dưới .github/` | tệp của tập xét bắt đầu bằng `.github/` |
| `t1-ma-doc` | `tệp T1 mà mã đọc` | như cũ |
| `co-tep-nang` | `tệp ngoài T1` | tệp không T1 của tập xét |

`cham-github` thắng cả khi tập xét có tệp mã cùng lúc (đúng `quyetDinh`: nhánh `.github/` xét trước). Dòng «rỗng», «chỉ
T1», và mọi dòng của luật cũ (không có tệp của onehub) không đổi một byte.

### Phép đo lịch sử

Mỗi lượt gọi bộ phân loại trong `lich-su.mjs` đánh dấu sập khi stderr khớp `/không phân loại được/`. Ca sập không bao giờ
đếm là khớp: phép đo ghi `sap <sha 9 ký tự>: <dòng stderr>` và thoát 1. Kỳ vọng số đếm (6 / 38 / 412) không đổi.

## Không đổi

- `.githooks/pre-push` từng byte; `quyetDinh`, `t1_skip_globs`, `t1_ma_doc`; `t1Only.skip`, `classifier`, `sameRuleAs`.
- Neo byte mà hai răng đột biến cấy vào `scripts/pre-push-t1.mjs` — của `pre-push-t1` (`return { boQua: kq.nang ? [] :
  boQua, …`, `const kq = quyetDinh(…)`, `return gitPhai(goc, "merge-base", ref, dong.localSha);`, `"--no-renames", `,
  `for (const dong of dongs) {`, `const SHA_RONG`) và của `pre-push-phan-rieng-pr` (sáu dòng `tu` của mảng `CA`): mỗi
  chuỗi vẫn đúng một lần.
- Số ca của hai ma trận viết trước (18 ca `phan-loai`, 16 ca `gop-onehub`): biến thể của G14 nằm trong ca G14.

## Hồ sơ đã ký bị chạm

- `pre-push-phan-rieng-pr`: `rang/lich-su.mjs` (paths E6), spec và bộ phân loại (paths E1–E4, E7, E10), `gate-shape.json`
  (paths E8, E9), mục «Dòng stderr» của thiết kế 21/10 thêm nhãn mới. Ca G14 của E1 vẫn hứa đúng điều nó ghi («nặng» gọi
  tên `.github/workflows/ci.yml»), nên lời `expected` không đổi. E9 (judgment `vi_sao`) bị chạm: vòng này chấm lại đúng
  câu hỏi đó trên câu mới (E1 của hồ sơ này, thêm ý vế đầu từ xa). Con trỏ `superseded_by` của kit chỉ nhận ô
  test/script, nên E9 cũ không trỏ sang đây được; làn ghim lại sẽ nêu nó trong `evals_not_machine_touched`. Khuyến nghị
  (Hỏi ở Cổng Phạm vi): ghim lại hồ sơ cũ bằng máy và để E1 ở đây gánh câu mới; lối khác là một lượt chấm lại hồ sơ cũ
  riêng cho E9 rồi ký lại Cổng Bằng chứng của nó.
- `pre-push-t1`: spec và bộ phân loại nằm trong `paths`; hành vi luật cũ không đổi.
- Cả hai ghim lại trong cùng PR sau S4.

## Đã cân nhắc và bỏ

- **Nhãn theo tệp thay theo `lyDo`** (gọi «tệp dưới .github/» chỉ khi mọi tệp nặng là `.github/`): hai luật cho cùng một
  câu hỏi «vì sao nặng», lệch với CI. Bỏ.
- **Thêm ca G17 vào ma trận** thay biến thể trong G14: đổi số ca đã ghim (16) ở E1 của hồ sơ đã ký. Bỏ.
- **Ngoài-5** (ghim nội dung dòng 6 E1 cũ): sửa răng của hồ sơ đã ký, không phải lời khai sai người đọc gặp. Để lại.

## Giới hạn

- Câu khai vẫn là văn xuôi: bài kiểm máy ghim hai mỏ neo (`merge-base(nền, sha từ xa)` có, câu cũ không còn); nghĩa đủ
  của câu do hội đồng chấm.
