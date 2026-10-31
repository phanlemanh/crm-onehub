---
schema_version: 1
slug: tim-va-dieu-huong-kho
feature: Tìm và điều hướng kho tài liệu — ⌘K có dấu hay không dấu, trang nhắc tới trang này kèm câu, lọc theo đơn vị, loại, chủ, tab Sức khoẻ, dòng «N bản chờ bạn duyệt» trong nhắc sáng
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-28T23:33:48Z
prototype:
  base_commit: 05664c7aa58cdfdcbcc169c030911c7f33dd8ba2
  disposition: keep
---

## Vấn đề & ai gặp

Lượt 1 và 2 cho nội dung vào kho: nhân viên viết trang, phòng ban tải tệp lên cho máy soạn,
chủ trang duyệt. Nhưng chạy thật (lộ trình mục 5) đưa vào mỗi phòng ban 10–20 trang một lúc,
và hôm nay đường duy nhất tới một trang là lướt danh sách theo loại. Không tìm được theo chữ
trong trang, gõ không dấu không ra, không biết trang nào dẫn tới trang nào, và chủ trang chỉ
biết có bản chờ khi tự mở tab. Trung vị duyệt — số nghiên cứu bảo sẽ vỡ trước — không có
đòn bẩy nào ngoài tab đó.

**Người gặp:** nhân viên tìm một quy định giữa việc (gõ không dấu trên bàn phím, không nhớ
tên chính xác) · chủ trang (phải biết sáng nay có mấy bản chờ, trang nào của mình hết hạn
xác minh, liên kết nào gãy) · chủ kho (cần kho không đầy trang mồ côi khi bước sang lượt 4
trợ lý AI).

Vật liệu nền: lộ trình mục 4 «Lượt 3», sổ dòng 1, 2; nghiên cứu `kho-tai-lieu-nghien-cuu.md`
mục 5.1, 6.7, 7.2; bản mẫu `/proto/kho-tai-lieu` trạng thái `ST-tim-nhanh`, `ST-suc-khoe`.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Nhân viên tìm trang bằng ⌘K và gõ không dấu, không lướt danh sách | Hộp tìm không ai mở, trang vẫn không được đọc | Hỏi 5 người sau tuần đầu chạy thật: lần gần nhất tìm một quy định thì làm thế nào | Đo trong chạy thật (không telemetry, theo lộ trình mục 5) |
| 2 | Bộ tách `simple` sau `unaccent` đủ để ra đúng trang ở vài trăm trang | Tìm ra nhiều trang không liên quan, người bỏ tìm | 50 câu hỏi thật của lượt 4 chạy trên `taiLieu.tim` | Chờ bộ 50 câu |
| 3 | Dòng nhắc sáng làm chủ trang duyệt nhanh hơn | Trung vị duyệt vẫn vượt 5 ngày | Trung vị đề xuất → duyệt trong chạy thật (đếm từ bảng) | Đo trong chạy thật |
| 4 | Người viết chèn liên kết giữa các trang khi có nút sẵn | Kho toàn trang mồ côi, «trang nhắc tới» rỗng | Tỉ lệ trang không mồ côi cuối chạy thật (hàm Sức khoẻ) | Đo trong chạy thật |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau hai tuần chạy thật, kho có thành mạng các trang dẫn tới nhau và chủ trang có theo kịp hàng duyệt không?
- Kết quả nào là SỐNG: ≥ 50% trang đã duyệt không mồ côi (có ít nhất một trang đã duyệt khác dẫn tới), đếm bằng hàm Sức khoẻ cuối chạy thật; trung vị thời gian từ đề xuất tới duyệt ≤ 5 ngày làm việc (chung với lộ trình mục 5).
- Kết quả nào là CHẾT: ≥ 1 lần tìm, «trang nhắc tới» hay Sức khoẻ lộ chữ, tên hay slug của bản chưa duyệt được báo lại trong chạy thật; hoặc trung vị duyệt > 10 ngày làm việc; hoặc < 20% trang đã duyệt không mồ côi.
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): đọc số chạy thật một lần. Hạn cũ: đo cùng chạy thật 2026-10-14 → 2026-10-28, đọc số 2026-10-29 cùng bốn số của lộ trình mục 5.

## Kết quả prototype

Bản mẫu `/proto/kho-tai-lieu` (lượt 0, giữ vĩnh viễn theo `docs/proto.md`) có hai trạng thái
của lượt này: `ST-tim-nhanh` (hộp ⌘K lọc theo tên phía trình duyệt, nhóm theo loại) và
`ST-suc-khoe` (sáu danh sách: quá hạn, chưa có trang, mồ côi, gãy, cụt, chờ duyệt). Hai chỗ
lượt này đi khác bản mẫu: ⌘K là nhóm trong hộp toàn app chứ không phải hộp riêng của kho, và
danh sách «cụt» để sau. Không đo số nào trên bản mẫu.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Thứ tự điều hướng: ⌘K, backlink có ngữ cảnh, danh sách theo thuộc tính, báo cáo trước đồ thị | `docs/plan/kho-tai-lieu-nghien-cuu.md` mục 5.1 (trong kho) | triết-lý/logic | có | — |
| Báo cáo mồ côi, trang được nhắc mà chưa có | MediaWiki `Special:LonelyPages`, `Special:WantedPages` | triết-lý/logic | có | — |
| Backlink kèm câu ngữ cảnh | Obsidian «linked mentions» | triết-lý/logic | có | — |
| `unaccent` trước `to_tsvector`, cấu hình `simple` | nghiên cứu mục 6.7, 7.2 (trong kho) | triết-lý/logic | có | — |
| Bố cục hộp ⌘K và tab Sức khoẻ | `apps/app/app/proto/_modules/kho-tai-lieu/` (trong kho) | ngôn-ngữ-thiết-kế/hình-thái đã có trong kho | có | Người ký Cổng Đáng |

## Cổng 0

- **decision = build.** Căn cứ: lộ trình mục 3 đặt lượt 3 sau lượt 2 và trước trợ lý AI; điều kiện mở «lượt 1 đã lên» đạt từ 2026-09-28 (#180). Phan Le Manh chọn «build» 2026-09-29.
- **disposition = keep.** Căn cứ: bản mẫu ở lại kho vĩnh viễn; lượt này thêm một mục `catalog.ts` trỏ cùng module, không xoá gì.
- **Ngưỡng UAT chốt cùng lúc ký:** SỐNG ≥ 50% trang đã duyệt không mồ côi và trung vị duyệt ≤ 5 ngày làm việc; CHẾT ≥ 1 lần tìm, «trang nhắc tới» hay Sức khoẻ lộ chữ, tên hay slug của bản chưa duyệt được báo lại, hoặc trung vị duyệt > 10 ngày làm việc, hoặc < 20% trang đã duyệt không mồ côi; đo 2026-10-14 → 2026-10-28, đọc 2026-10-29 — chốt tại Cổng Đáng 2026-09-29, Phan Le Manh («build», ngưỡng giữ như đề xuất).

## Thước đo thành công → ứng viên criterion

- Tỉ lệ trang không mồ côi → AC-7 (hàm Sức khoẻ đếm mồ côi), AC-4 (chèn liên kết là đòn bẩy), AC-5 (liên kết hiện ra cho người đọc).
- Trung vị duyệt → AC-9 (dòng nhắc sáng), AC-11 (bản chờ nào cũng mở được).
- Không lộ bản chưa duyệt → AC-2.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/kho-tai-lieu/khung.tsx` (`TimNhanh`), `man-trang.tsx` (`SucKhoeKho`) | Dựng lại: nhóm trong `QuickSwitcher`, tab Sức khoẻ trong `apps/app/app/(app)/[slug]/tai-lieu/` | không | Bản mẫu giữ nguyên làm phòng trưng bày |
| `apps/app/app/proto/catalog.ts`, `registry.ts` | Giữ; thêm mục `tim-va-dieu-huong-kho` | không | Luật slug bản mẫu = slug hồ sơ |

## Out of scope từ khám phá

- Lịch sử, khôi phục, lưu trữ — đề xuất lượt 3b (T3), chủ kho chọn ở Cổng Phạm vi.
- Gõ sai và biến thể i/y bằng `pg_trgm` — cần chỉ mục mới (T3); chờ số chạy thật.
- Danh sách «cụt», đồ thị — nghiên cứu đặt đồ thị cuối cùng; «cụt» ít giá trị khi kho còn nhỏ.
- Đo lượt tìm bằng telemetry — lộ trình chốt bốn số đếm từ bảng.
- Vector, `pg_search` — Neon gỡ 2026-09-21; vài trăm trang không đòi.
