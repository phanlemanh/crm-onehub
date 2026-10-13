# Quét phủ — bo-cau-hoi-mau

Preset `test-matrix`, bản gọn, 2026-10-13, kit 2.28. Nháp 2.26 của phiên trước chỉ dùng tham khảo.

## Ngữ cảnh

- Sản phẩm: bộ 50 câu hỏi mẫu để đo trợ lý kho (`tro_ly_kho`) trên tám trang mẫu của kho đo.
- Chân sản phẩm (đào repo): `docs/plan/kho-tai-lieu-bo-vang.md` (khuôn chuẩn hoá, tầng S1–S7, nơi giữ
  bộ thật) · `_acceptance/tro-ly-doc-kho/contract.md` AC-15 và Notes · `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  (script chấm nhận `--bo`, chỉ gieo `bo-do/trang-mau/*.md`) · `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  (`khuonBo`, bốn nhóm câu) · `docs/plan/lo-trinh-kho-tai-lieu.json` hàng `cb`, `l5`.
- Chân ngành: Ragas (bộ sinh câu thử RAG chia câu đơn, câu nhiều ngữ cảnh, câu có điều kiện) · SQuAD 2.0
  (câu không trả lời được viết cố ý cho giống câu trả lời được).

## Trục

- Trục A — câu đòi gì: S1 sự kiện đơn · S2 cần hai trang · S3 ngưỡng, ngoại lệ, điều kiện · S6 gần trùng
  một trang mà trang không nói · S6 ngoài hẳn kho · ngoài kho (không phải câu hỏi quy định).
  [thước CE: `kho-tai-lieu-bo-vang.md` mục 2 bước 4; NGÀNH: Ragas simple, multi_context, conditional;
  SQuAD 2.0 unanswerable]
- Trục B — chữ người gõ: chuẩn có dấu · không dấu · viết tắt · sai chính tả · trộn tiếng Anh · kiểu tin
  Zalo (xưng hô, «ạ», gọn). [thước CE: `kho-tai-lieu-bo-vang.md` mục 1 «kể cả không dấu, viết tắt, sai chính
  tả, trộn tiếng Anh»; câu giao hàng `cb` «câu hỏi qua Zalo»]
- Trục C — vòng đời bộ: viết · kiểm (khuôn, trang mong đợi, ý đọc từ trang, riêng tư) · đo trên trợ lý ·
  thêm câu. [thước CE: SUY-TỪ-REPO hàng `cb` `buoc_ke`, `kho-tai-lieu-bo-vang.md` mục 3]

Kênh CRM/Zalo không là trục nội dung: script chấm hỏi mọi câu quy định qua `tro_ly_kho` rồi hỏi lại mọi câu
qua phiên Zalo của agent gốc (`cham-bo-do.ts`, lượt một và lượt hai).

## Ô và cắt

A × B: câu S1–S3, S6, ngoài kho viết chữ chuẩn; năm kiểu chữ nhiễu đi vào tầng S7, mỗi câu là biến thể của
một câu S1 hay S3 (bước 5 của khuôn chuẩn hoá). Ô «S6 × chữ nhiễu» và «ngoài kho × chữ nhiễu» gạch: chữ
nhiễu đo việc nhận ra câu, câu S6 đo việc từ chối — trộn hai thứ làm nhãn mơ.

## Core

1. A đủ sáu giá trị, số câu viết trước mỗi tầng — thành phần là lời hứa của bộ.
2. B qua S7 đủ năm kiểu chữ nhiễu — câu thật qua Zalo gõ như vậy.
3. C viết và kiểm — bộ chạy được với script chấm sẵn có, nhãn đúng, không sửa hồ sơ đã ký.
4. C đo — câu giao của hàng là «được đo».

## Later

- S4 (trang bị thay thế), S5 (hiệu lực theo ngày): cần trang nhiều phiên bản; bộ vàng mục 12.6.
- Chấm «ý trọng yếu» trong câu trả lời: script chấm chỉ chấm trang được trích.
- Thêm trang mẫu ngoài tám trang của kho đo.
- C thêm câu thật vào bộ: câu thật trỏ trang thật, script chấm chỉ gieo trang mẫu.

## Never

- Bộ niêm phong trong git — `kho-tai-lieu-bo-vang.md` mục 3: phiên máy đọc được mọi thứ trong git.

## Cross-cutting

- Nhãn giả rõ ở nhãn bộ, câu nguồn và từng câu.
- Không tên người, số điện thoại, email, số hợp đồng trong chữ câu.
- Mọi ý trọng yếu đọc nguyên văn từ trang mong đợi, không từ trí nhớ (bước 6 của khuôn chuẩn hoá).
