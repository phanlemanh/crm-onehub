---
schema_version: 1
feature: «Số điện thoại là trường chính của cá nhân: nhập được lúc tạo, thấy ở bảng, tìm được theo số, không trùng»
slug: dien-thoai-ca-nhan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-09T03:22:17Z
design_doc: docs/superpowers/specs/2026-10-09-dien-thoai-ca-nhan-design.md
---

# Acceptance Contract: dien-thoai-ca-nhan

## Context

Anh báo 09/10: form «Thêm cá nhân» ở tab Cá nhân của công ty không có ô Điện thoại; ở VN số điện thoại là
trường chính của một người. Kho đã có `Contact.phone` và API tạo/sửa nhận `phone`; thiếu là ô nhập ở hai
form tạo, cột ở bảng Cá nhân, tìm theo số (bảng Cá nhân, ⌘K, Kara trong app, ô chọn môi giới) và chống trùng
theo số. Anh chọn A: chuẩn hoá về `+84…`, chặn trùng như email.

Source input: anh báo trực tiếp 09/10 (ảnh form); yêu cầu `DT-1` đợt sau-14-10, luật 46; Cổng Đáng `build`
2026-10-09T00:01:52Z; `_acceptance/dien-thoai-ca-nhan/opportunity.md`; soát kho `coverage-scan.md`.

## Criteria

- AC-1: (cross-layer) Given tab Cá nhân của một công ty trên app thật, When bấm «Thêm cá nhân», gõ Tên «Lan» và Điện thoại «0901 234 567» rồi bấm «Thêm cá nhân», Then form có ô «Điện thoại» nằm ngay sau Tên/Họ và trước Email, và cá nhân «Lan» được lưu thuộc công ty đó với số `+84901234567` và nguồn `MANUAL`.
- AC-2: (cross-layer) Given trang Cá nhân, When mở «Cá nhân mới», gõ Tên và Điện thoại «+84 28 3812 3456» rồi lưu, Then sheet có ô «Điện thoại» ngay sau Tên/Họ, và cá nhân được lưu với số `+842838123456` và nguồn `MANUAL`.
- AC-3: Given hàm đọc số dùng chung, When đọc từng dạng trong ma trận viết trước (`0901 234 567`, `0901.234.567`, `(+84) 901-234-567`, `84901234567`, `+84901234567`, `028 3812 3456`, `+65 6123 4567`, `+84 0901 234 567`, `+84 (0) 901 234 567`, `840901234567`, chuỗi rỗng, chỉ khoảng trắng, `abc`, `12345`, `0901 234 56`, `+84 12`, 16 chữ số, `00901234567`), Then dạng VN ra `+84` + số quốc nội (số 0 trung kế sau `+84` bị bỏ — số quốc nội VN không bao giờ bắt đầu bằng 0), số nước ngoài giữ `+<chữ số>`, rỗng ra «rỗng», còn lại ra «sai»; và hàm hiện số đọc số trước rồi mới định dạng: `0901 234 567` cho cả `+84901234567` lẫn số thô cũ `0901.234.567`, `028 3812 3456` cho `+842838123456`, `+6561234567` cho số nước ngoài, nguyên văn cho chuỗi cũ không đọc được (`máy lẻ 123`).
- AC-4: Given form «Thêm cá nhân» hoặc sheet «Cá nhân mới», When gõ Điện thoại «abc» hay «12345» rồi bấm lưu, Then không gọi API tạo cá nhân, dưới ô hiện «Số điện thoại chưa đúng — ví dụ 0901 234 567» và con trỏ về ô Điện thoại; When API nhận thẳng số sai (không qua form), Then trả lỗi đầu vào (BAD_REQUEST) và không tạo, không sửa gì.
- AC-5: Given chỉ gõ Tên, không gõ số, When thêm cá nhân ở cả hai form, Then vẫn thêm được (số để trống) — điện thoại không bắt buộc.
- AC-6: (cross-layer) Given một cá nhân chưa lưu trữ có số lưu THÔ từ trước `0901.234.567`, When tạo cá nhân mới với số `+84 901 234 567`, Then bị từ chối (CONFLICT) với câu nêu tên người đang giữ số, và không có dòng cá nhân mới nào; trên form, toast hiện câu đó và các ô Tên, Điện thoại giữ nguyên chữ đã gõ; When tạo với dạng có số 0 trung kế `+84 0901 234 567` cho cùng số đó, Then cũng bị từ chối; When người giữ số đó đã lưu trữ, Then tạo được.
- AC-7: Given hai cá nhân A (số `0901234567`) và B, When sửa số của B thành `+84901234567`, Then bị từ chối (CONFLICT) và số của B không đổi; When sửa số của A thành `+84 901 234 567` (cùng số, dạng khác), Then được và lưu `+84901234567`; When xoá trống số của A, Then lưu rỗng; Given dữ liệu cũ đã có A và C cùng chưa lưu trữ và cùng số thô `0901.234.567`, When sửa Chức danh của A (không gửi số) hoặc gửi lại chính số đó dưới dạng khác, Then sửa được — chỉ kiểm trùng khi số quốc nội thật sự đổi.
- AC-8: Given bảng Cá nhân, When có người mang số `+84901234567`, người mang `+6561234567` và người không số, Then có cột «Điện thoại» ngay sau Tên hiện lần lượt `0901 234 567`, `+6561234567` và ô trống chuẩn; ngăn chi tiết của người đầu hiện `0901 234 567` với liên kết gọi `tel:+84901234567`.
- AC-9: (cross-layer) Given cá nhân P có số chuẩn `+84901234567` và cá nhân Q có số thô cũ `0912.345.678`, When gõ vào ô tìm của bảng Cá nhân lần lượt `0901234567`, `+84 901 234 567`, `234 567`, `0912345678`, Then mỗi lần danh sách tìm được chứa đúng người mang số đó; When gõ `12` (dưới ngưỡng), Then không lọc theo số (tìm theo tên/email như cũ).
- AC-10: (cross-layer) Given cá nhân P như AC-9, When gõ `0901 234 567` vào ⌘K, Then P có trong mục Cá nhân, dòng phụ là tên công ty, hoặc số (dạng hiện) khi P không có công ty.
- AC-11: Given cá nhân P như AC-9, When Kara trong app tìm cá nhân bằng `0901234567`, Then danh sách tìm được có P; và danh sách đó không mang số điện thoại của ai (Kara tìm được người qua số nhưng không đọc số ra).
- AC-12: Given ô chọn môi giới ở «30 ngày đầu», When gõ số của một người nạp từ listing (số thô `0901.234.567`, không email) dưới dạng `0901234567` hay `0901 234 567`, Then người đó vẫn hiện trong gợi ý và dòng gợi ý hiện số dạng `0901 234 567`; người có email mà không số thì gợi ý vẫn là email.
- AC-13: Given các tệp giao diện vòng này sửa, When chạy sàn thiết kế của kho, Then không vi phạm P0; ô Điện thoại dùng `Input` của `@crm/ui` với `type="tel"` và nhãn bấm được, câu lỗi dùng `FieldError`, không `className` đổi màu/góc.

## Coverage

Quét bằng `morphological-scan` preset entity-feature (S1, 09/10) — `_acceptance/dien-thoai-ca-nhan/coverage-scan.md`.

- Trục A — Thao tác: tạo | sửa | hiện | tìm | chống trùng [thước CE: vòng đời entity của preset; xuất không có ở kho]
- Trục B — Mặt: form tab Cá nhân của công ty | sheet «Cá nhân mới» | ngăn chi tiết | bảng Cá nhân | ⌘K | Kara trong app | ô chọn môi giới [thước CE: grep mọi chỗ gọi `contacts.create`/`contacts.list`/tìm cá nhân trong `apps/`, SUY-TỪ-REPO 09/10]
- Trục C — Dạng số: `0…` | `+84…` | `84…` | có ngăn cách | nước ngoài | sai | rỗng | số cũ lưu thô [thước CE: NGÀNH ITU-T E.164 + quy hoạch số VN (di động 10 chữ số 2018, cố định 02x 2017) — ⏱ verify-current]
- Core → AC: tạo hai form (AC-1, AC-2) · đọc/hiện số (AC-3) · chặn số sai (AC-4) · không bắt buộc (AC-5) · trùng khi tạo (AC-6) · trùng khi sửa (AC-7) · hiện ở bảng và ngăn chi tiết (AC-8) · tìm ở bảng (AC-9), ⌘K (AC-10), Kara (AC-11), ô môi giới (AC-12) · sàn thiết kế (AC-13).
- Later: thoả thuận + tab Cá nhân của công ty (DT2); form web chỉ có số (T3 tracking); gộp người đã trùng số; nhiều số cho một người; chuẩn hoá khi nạp listing; câu lỗi trùng bằng tiếng Việt.
- Never: bắt buộc nhập số; Kara qua Zalo/Slack nói số; ràng buộc duy nhất ở cơ sở dữ liệu.
- [GIẢ ĐỊNH] Số cố định VN có 10 chữ số sau số 0 đầu (mã vùng 02x + 8 chữ số) — anh gạch nếu sai.

## Đường đo

- Thước: ≥ 80% cá nhân tạo tay có số sau hai tuần · số từ: `select count(*) filter (where phone is not null) * 100.0 / count(*) from contact where source = 'MANUAL' and "createdAt" >= <ngày lên>` trên production, đọc 23/10 · bảo đảm bởi: AC-1, AC-2 (form gửi và lưu số)
- Thước: gõ số dạng `0…` hay `+84…` ra đúng người · số từ: phép đo màn `rang/do-man.mjs` (E16, E17) và bài kiểm API tìm theo số (E11, E12) · bảo đảm bởi: AC-9, AC-10
- Thước phụ (trước ngày lên): số nhóm cá nhân chưa lưu trữ trùng số quốc nội trên production · số từ: `rang/dem-trung.sql` chạy chỉ-đọc trên production — việc tay của anh trước khi gộp, không chặn gộp (AC-7 bảo đảm người đã trùng sẵn vẫn sửa được); kết quả ghi vào Notes · bảo đảm bởi: AC-7 (người đã trùng sẵn vẫn sửa được)

## Out of scope

- Số điện thoại ở thoả thuận và tab Cá nhân của công ty (ô chọn người, bảng người, dòng người) — hàng DT2 `dien-thoai-o-deal-cong-ty`.
- Form web chỉ có số điện thoại bị bỏ «No email address» — đường T3 tracking, hàng riêng.
- Gộp những người đã trùng số trong dữ liệu hiện có; vòng này chỉ chặn trùng mới.
- Ràng buộc duy nhất ở cơ sở dữ liệu và backfill số cũ (cần migration).
- Câu lỗi trùng bằng tiếng Việt — API trả câu tiếng Anh như lỗi trùng email hiện nay.
- Kara qua Zalo nói số điện thoại — luật dữ liệu giữ nguyên.

## Notes

- Không migration. Chặn trùng ở tầng ứng dụng: hai lần tạo đồng thời cùng một số có thể cùng lọt.
- Đường nền đo trên onehub `0422d7976` (khoá `duong-nen` cấp cho P6).

Known limits — anh chọn ở Cổng Bằng chứng 2026-10-09 (lượt trả lại để làm A), từ mục ngoài hợp đồng của S4 round 2:

- Ngoài-1: Phép kiểm «gõ 12 thì không lọc theo số» lấy đáp án từ chính tên dữ liệu thử; tên thử vô tình chứa «12» thì phép kiểm không còn bắt được lỗi lọc nhầm theo số.
- Ngoài-2: Ảnh ngăn chi tiết (số và liên kết gọi) do phép đo màn chụp chưa nằm trong bằng chứng chấm bằng mắt; chỉ dòng báo của phép đo khẳng định.
- Ngoài-3: Khi phép đo tìm kiếm báo sai, thông báo chung không chứng được nguyên nhân là thiếu nhánh tìm theo số.
- Ngoài-4: Mã lượt thử hiếm khi chứa «12»; khi chứa, phép kiểm «gõ 12» tự đổi đáp án.
- Ngoài-5: Liên kết gọi trong ngăn chi tiết tự dựng thay vì dùng `Link` của kho: người đi bằng bàn phím không thấy viền đang chọn, gạch chân hơi khác chỗ khác.
- Ngoài-6: Luật đọc số viết hai nơi (hàm và câu truy vấn); đổi một nơi mà quên nơi kia thì chống trùng hỏng lặng.
- Ngoài-9: Gõ một đoạn số ngắn khớp hơn 500 người thì danh sách có thể thiếu người và tổng số sai, không có dấu hiệu bị cắt.
- Ngoài-11: Bài kiểm «Kara không lộ số» chỉ bắt dạng số liền mạch; số lộ ra ở dạng có dấu cách hay +84 thì không bắt.
