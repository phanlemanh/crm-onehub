---
schema_version: 1
feature: Bộ 50 câu hỏi mẫu viết theo tám trang mẫu của kho đo — câu trả lời được, câu phải nói không biết, câu gõ như tin Zalo — kèm lệnh kiểm bộ và lệnh đo trợ lý kho trên bộ bằng script chấm sẵn có
slug: bo-cau-hoi-mau
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: signed-off
design_doc: _acceptance/bo-cau-hoi-mau/design.md
approved_by: Phan Le Manh
approved_at: 2026-10-13
---

# Acceptance Contract: bo-cau-hoi-mau

## Context

Hàng `cb` của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`), `du_lieu: sinh-gia`: hàng `l5` đứng
trên nó và sửa trợ lý theo kết quả đo trên bộ này khi chưa có góp ý thật. Cổng Đáng đã ký `build`
(`opportunity.md`). Ranh giới của hàng trong đợt r2 là `_acceptance/bo-cau-hoi-mau/**`.

Source input: `docs/plan/kho-tai-lieu-bo-vang.md` mục 1–3 · `_acceptance/tro-ly-doc-kho/contract.md` AC-15 và
Notes · `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`, `quyet-do.ts` · `bo-do/trang-mau/*.md` ·
`coverage-scan.md` của hồ sơ này.

## Criteria

- AC-1: Given tệp `bo-mau.json`, When đọc bằng `khuonBo` của script chấm và bằng khuôn chặt của bộ mẫu, Then cả hai đọc được; nhãn bộ là `mau`, câu nguồn mở đầu «Bộ mẫu giả»; có đúng 50 câu, mã dạng `mNN` không trùng, câu nào cũng mang `mau: true`; And một bản sao có khoá lạ, nhãn bộ `tam`, mã trùng, câu thiếu `mau`, không có câu nguồn hay câu nguồn không mở đầu «Bộ mẫu giả» bị bác với câu nêu mã câu (hoặc «bộ») và luật `khuon`.
- AC-2: Given bảng thành phần viết trước (S1 15 · S2 5 · S3 8 · S6 8 trong đó 4 gần trùng một trang · S7 10, mỗi kiểu chữ không dấu, viết tắt, sai chính tả, trộn tiếng Anh, tin Zalo đúng 2 · ngoài kho 4), When đếm bộ theo tầng × kiểu chữ, Then mọi ô đúng bảng; nhóm và `kho` của từng câu khớp tầng (S2 `hai-trang`, S3 `nguong-ngoai-le`, S6 `khong-co`, S7 `khong-dau`, ngoài kho `khong-phai-quy-dinh`); And bản sao lệch một ô hay một câu S3 mất `kho` bị bác với câu nêu ô hoặc mã câu và luật `thanh-phan`.
- AC-3: Given tám trang mẫu `_acceptance/tro-ly-doc-kho/bo-do/trang-mau/*.md`, When kiểm trang mong đợi, Then mọi trang trong `mong` và `ganTrang` là một trong tám trang; câu S2 có ít nhất hai nhóm trang; câu S6 và ngoài kho không có `mong`; mỗi câu S7 có `bienTheCua` trỏ một câu S1 hay S3 chữ chuẩn có cùng `mong`; And bản sao trỏ trang không có, S2 một nhóm, hay biến thể khác trang câu gốc bị bác với câu nêu mã câu và luật `trang-mong`.
- AC-4: Given các câu S1, S2, S3, S7, When kiểm ý trọng yếu, Then mỗi câu có ít nhất một ý, mỗi ý sau chuẩn hoá NFC là chuỗi con nguyên văn của một trang trong `mong` của chính câu đó; câu S7 có cùng ý với câu gốc; câu S6 và ngoài kho không có ý; And bản sao có ý sửa một con số (vd «1,2%» thành «1,5%») hay ý lấy từ trang không thuộc `mong` bị bác với câu nêu mã câu và luật `y-trong-yeu`.
- AC-5: Given chữ của mọi câu, When kiểm riêng tư, Then không câu nào có số điện thoại, địa chỉ email hay số hợp đồng; And bản sao chèn một trong ba thứ ấy bị bác với câu nêu mã câu, loại và luật `rieng-tu`.
- AC-6: Given `bo-mau.json` đã qua năm luật và khoá AI Gateway thật, When chạy `bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do`, Then script chấm `cham-bo-do.ts --bo` chạy trên kho đo dùng-một-lần; tập mã lượt một bằng đúng tập câu quy định của bộ (46) và tập mã lượt hai bằng cả bộ (50); lệnh ghi vào `.acceptance-runs/bo-cau-hoi-mau/<lượt>/` bảng theo tầng và theo kiểu chữ có cột lỗi, các dòng «Tổng» của script chấm, danh sách mã không đạt (câu lỗi gọi model nằm trong đó với nhãn `loi`), mã thoát của script chấm, băm của `bo-mau.json` và của mã trợ lý lúc đo; And lượt đủ mã là «đã đo», lệnh thoát 0 dù script chấm thoát 0, 1, hay 2 vì có câu lỗi; And script chấm không để lại thư mục lượt, hay jsonl thiếu hoặc trùng mã, thì lệnh thoát 2 «không đo được» kèm lý do hay mã thiếu, trùng; And không tệp nào dưới `_acceptance/tro-ly-doc-kho/` đổi. (cross-layer)
- AC-7: Given bằng chứng của một lượt `--do` đã chép bằng `--ghi` và commit (`evidence/do-bo-mau.md`, `evidence/cham-tung-cau.jsonl`) trước Cổng Bằng chứng, When chạy lệnh đo không cờ, Then lệnh chỉ kiểm, không gọi model, không ghi tệp: băm trong `do-bo-mau.md` bằng sha256 của `bo-mau.json` ở HEAD, tập mã jsonl đủ, mọi ô bảng tính lại từ jsonl khớp → thoát 0; And thiếu tệp, băm lệch (bộ đổi sau lần đo) hay một ô lệch → thoát 1 với câu nêu tệp, băm hay ô lệch.
- AC-8: Given `bo-mau.json` và tám trang mẫu, When một người đọc từng câu cạnh trang của nó, Then câu nào có trang thì trang ấy trả lời được đúng câu đó; câu S6 gần trùng thì đúng là trang nó giống không nói điều câu hỏi; câu S7 và câu tin Zalo đọc như người thật gõ; không câu nào hai nghĩa đến mức nhãn có thể khác. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- Trục A — câu đòi gì: S1 · S2 · S3 · S6 gần trùng · S6 ngoài hẳn · ngoài kho → AC-2, AC-3, AC-4, AC-8.
  [thước CE: `kho-tai-lieu-bo-vang.md` mục 2 bước 4; NGÀNH: Ragas simple, multi_context, conditional; SQuAD 2.0
  unanswerable]
- Trục B — chữ người gõ: chuẩn · không dấu · viết tắt · sai chính tả · trộn tiếng Anh · tin Zalo → AC-2, AC-3,
  AC-8. [thước CE: `kho-tai-lieu-bo-vang.md` mục 1; câu giao hàng `cb`]
- Trục C — vòng đời bộ: viết (AC-1) · kiểm (AC-1…AC-5) · đo (AC-6, AC-7) · thêm câu (Later, sổ quyết định).
  [thước CE: hàng `cb` `buoc_ke`; `kho-tai-lieu-bo-vang.md` mục 3]
- Cross-cutting: nhãn giả (AC-1) · riêng tư (AC-5) · ý đọc từ trang (AC-4) · không đụng hồ sơ đã ký (AC-6).
- [GIẢ ĐỊNH] Bốn câu ngoài kho đủ để thấy chuyển nhầm ở Zalo; một câu nhầm là 25%, số thô hơn bộ «tạm»
  (10 câu).

## Đường đo

- Thước: tỉ lệ câu có trang được trả lời đúng trang, theo tầng và theo kiểu chữ · số từ: `cham-tung-cau.jsonl`
  lượt một của script chấm · bảo đảm bởi: AC-6, AC-7
- Thước: tỉ lệ câu S6 bị từ chối đúng, tách gần trùng và ngoài hẳn · số từ: như trên · bảo đảm bởi: AC-6
- Thước: tỉ lệ câu quy định qua Zalo được chuyển cho trợ lý kho, tỉ lệ câu ngoài kho bị chuyển nhầm · số từ:
  lượt hai của script chấm · bảo đảm bởi: AC-6

## Out of scope

- Sửa trợ lý cho đạt ngưỡng — việc của `l5`.
- Sửa script chấm hay bất kỳ tệp nào của hồ sơ `tro-ly-doc-kho`.
- Câu hỏi thật của nhân viên, bộ niêm phong — ngoài git theo `kho-tai-lieu-bo-vang.md` mục 3.
- Tầng S4, S5; chấm ý trọng yếu tự động trong câu trả lời; trang mẫu mới ngoài tám trang.

## Notes

- Đo gọi model thật qua AI Gateway: khoảng 96 lượt hỏi, ước $2–4 theo giá đo ở `hoi-crm-qua-zalo`
  ($0,016–0,039 một câu).
- Known limits — chọn ở Cổng Bằng chứng 2026-10-13:
  - Ngoài-1: Báo cáo đo đã lưu mà bị sửa tay sai khuôn thì lệnh kiểm chết kèm lỗi khó đọc thay vì báo rõ chỗ lệch; báo cáo sai vẫn không lọt qua.
  - Ngoài-3: Script chấm hỏng ở bước cuối thì lượt đo vẫn ghi là xong với phần tổng để trống; người xem mở báo cáo xem phần tổng có số trước khi tin kết quả.
  - Ngoài-4: Tệp kết quả của lượt đo bị cắt ngang thì lệnh đo báo lỗi kỹ thuật thay vì «không đo được»; lượt đo vẫn không được tính là thành công.
  - Ngoài-5: Bài kiểm chỉ xác nhận dấu vân tay mã trợ lý có dạng hợp lệ, chưa đối chiếu với mã thật.
  - Ngoài-6: Bài kiểm «lượt đo không đụng hồ sơ đã ký» chạy trên script chấm giả nên khó đỏ; việc không đụng hiện dựa vào cách lệnh đo đặt nơi ghi.
