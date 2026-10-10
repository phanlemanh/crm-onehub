# Eval model thật đúng lúc — thiết kế

Hàng F12 của `docs/plan/lo-trinh-okr.json`, đợt `sau-14-10`, thợ P5. Chủ kho ký Cổng Đáng ngày 07/10. Thiết kế ngắn được chủ kho duyệt ngày 08/10 qua phiên giám sát: A, B, E như đề xuất; C và D kèm điều kiện, và mọi điều kiện được viết thành tiêu chí.

## Vấn đề

E15 của `tro-ly-doc-kho` (`rang/cham-bo-do.ts`) gọi model thật cho 20 câu hỏi kho, 6 câu phải từ chối, 4 biến thể không dấu, và lượt Zalo cho các câu quy định cùng 10 câu không phải quy định. Soát mã ngày 08/10 thấy ba chỗ:

- **Lỗi hạ tầng bị tính là model sai.** Câu không có kết quả eval, hay hàng `TaiLieuHoi` ở trạng thái lỗi, đều nhận nhãn `sai` (`cham-bo-do.ts:216`, `:259`). Lần đỏ 50% lúc 00:39 ngày 05/10 có 20 câu «loi», và cả ngày hôm đó lỗi bị quy oan cho Gateway 402.
- **Nhật ký bị ghi đè.** `ke-hoach.json`, `ket-qua.jsonl` và `eve.log` luôn ghi vào cùng một thư mục `.acceptance-runs/tro-ly-doc-kho/cham-bo-do/`.
- **Không lượt nào dùng lại kết quả cũ.** Mỗi lượt ghim lại đều gọi model thật. Số dư Gateway giảm từ 47,84 xuống 32,51 USD trong 05–06/10, phần lớn vì chạy lại eval mà đầu vào không đổi. E15 còn đỏ một lần ở 79,2% so với ngưỡng 80%, rồi lượt chạy lại thì xanh.

## Cách làm

Mọi thay đổi nằm trong `_acceptance/tro-ly-doc-kho/rang/`. Phần logic thuần (băm, quyết dùng lại, vùng xám, gộp) tách thành `quyet-do.ts` để kiểm được mà không gọi model.

**A. Nhãn `loi`.**
- Câu không có kết quả eval, hay hàng `TaiLieuHoi`/`ZaloHoi` ở trạng thái lỗi, nhận nhãn `loi`.
- Câu `loi` không vào tử số, cũng không vào mẫu số.
- Có từ một câu `loi` trở lên thì E15 thoát mã 2 «KHONG DO DUOC: <n> cau loi (<id>…)».
- Model trả lời sai vẫn là `sai`, không nới phép kiểm.

**B. Nhật ký theo lượt.**
- Mỗi lượt ghi vào `.acceptance-runs/tro-ly-doc-kho/cham-bo-do/<ISO giờ>-<pid>/` và in đường thư mục.
- Giữ 10 lượt mới nhất, xoá lượt cũ hơn.

**C. Dùng lại kết quả khi đầu vào không đổi.**
- **Phạm vi băm** (SHA-256):
  - nội dung mọi tệp git-theo-dõi dưới `apps/agent/agent/**` (lời dặn, công cụ);
  - mọi tệp khớp `paths` của E15;
  - `bun.lock`;
  - tệp bộ câu;
  - id model do Gateway trả về thật.
- **Id model thật:** E15 dùng hai model, model `tro_ly_kho` (`modelTaiLieu("hoi")`) và model agent gốc của lượt Zalo (`modelTheoVai("tro-ly")`). Id thật lấy từ `response.modelId` của một lời gọi dò rất ngắn tới mỗi model. Lượt đo đầy đủ cũng dò và ghi id này, nên bản ghi và lượt sau so cùng một nguồn.
- **Bản ghi:** bằng chứng `cham-bo-do.md` mang một khối máy đọc gồm `bam`, `do_luc` (ISO), `dat` (true/false), `model_ids`.
- **Nguồn dùng lại:** chỉ bản ghi ĐÃ COMMIT, đọc bằng `git show HEAD:_acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md`. Bản sửa tay trên cây không được tính.
- **Điều kiện dùng lại:** cùng băm, `dat: true`, `do_luc` trong vòng 7 ngày. Khi đó E15 không chạy `eve eval`, thoát 0, và in cùng ghi vào bằng chứng của lượt dòng «DUNG LAI <băm>, do ngay <ngày>», kèm bảng kết quả đã ký, để thẻ Cổng 2 thấy.
- **Ngược lại thì đo mới,** in lý do: «DO MOI: bam doi», «DO MOI: qua han 7 ngay», «DO MOI: lan truoc khong dat», «DO MOI: chua co ban ghi», hoặc «DO MOI: --do-lai».

**D. Vùng xám sát ngưỡng.**
- **Định nghĩa:** với chỉ số «≥ ngưỡng t» trên n câu, tỉ lệ r nằm trong vùng xám khi `t − √(t(1−t)/n) ≤ r < t`. Chỉ số «≤ ngưỡng» (chuyển nhầm ≤ 10%) đối xứng.
- **Khi nào áp:** chỉ khi lượt 1 không có câu `loi`.
- **Hỏi lại:** một lần, trên đủ bộ câu của chỉ số đó. Kết luận trên tỉ lệ gộp `(k₁+k₂)/(n₁+n₂)`. Ngưỡng 80% / 80% / 90% / 10% / 0 giữ nguyên.
- **Bằng chứng:** ghi ba tỉ lệ (lượt 1, lượt 2, gộp).
- **Kết cục:**
  - Gộp vẫn không đạt thì đỏ thật, thoát 1, không hỏi lần ba.
  - Lượt 2 có câu `loi` thì thoát 2.

**E. Trần token cho một lượt ghim lại:** hoãn. Chi phí đã hiện ở `tong_ket.chi_phi` của làn.

## Đã cân và bỏ

- **Chấm theo cận dưới khoảng tin cậy.** Bỏ vì làm lỏng ngưỡng: một model thật sự ở mức 70% có thể lọt qua.
- **Chạy n lượt mọi lần rồi lấy trung bình.** Bỏ vì nhân số token lên, ngược với mục tiêu của hàng.
- **Dùng lại theo `paths` của E15 thôi.** Bỏ theo điều kiện của chủ kho: lời dặn, công cụ, `bun.lock` và id model thật cũng làm đổi kết quả.
- **Bộ nhớ đệm theo băm cho mọi eval model thật.** Việc của bộ kit, không làm ở đây. Mười một eval khác trong `feature_loop.model_evals` nằm ngoài ranh giới hàng; đề xuất gửi giám sát dạng `viec-phu`.

## Ranh giới

`_acceptance/tro-ly-doc-kho/**`, `_acceptance/eval-model-that-dung-luc/**`, và các khoá mới trong `_acceptance/config.yaml` (chỉ thêm dòng). Không đổi mã sản phẩm.

## Kiểm chứng

- Kiểm đơn vị cho `quyet-do.ts`:
  - ma trận băm (đổi từng lớp đầu vào thì băm đổi);
  - bảng quyết dùng lại (sáu ca);
  - ma trận vùng xám;
  - kết luận gộp;
  - nhãn `loi`;
  - nhật ký theo lượt.
  - Mỗi phép đo có cặp đỏ trên bản sao phá-thử.
- Bàn đo thật:
  - đổi một tệp trong phạm vi băm thì lượt kế in «DO MOI: bam doi»;
  - một lượt đo đầy đủ rồi một lượt dùng lại, lượt dùng lại không gọi `eve eval`.
