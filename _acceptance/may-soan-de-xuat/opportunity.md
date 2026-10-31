---
schema_version: 1
slug: may-soan-de-xuat
feature: Máy soạn bản đề xuất — tải tệp quy định đang có (Word, PDF có chữ) lên kho tài liệu, máy soạn thành bản đề xuất có trích đoạn nguồn, chủ trang đọc nguồn cạnh nhau rồi duyệt
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-28T01:37:36Z
prototype:
  base_commit: 5e3e35b9fea42458726a9b16da8dba72f05689bc
  disposition: keep
---

## Vấn đề & ai gặp

Lượt 1 (`kho-tai-lieu`, PR #180) cho nhân viên viết trang bằng tay. Nhưng quy định,
chính sách, quy trình và biểu mẫu của OneHub **đã có** — nằm trong tệp Word và PDF rải ở
máy cá nhân và nhóm Zalo. Chạy thật (lộ trình mục 5) đòi mỗi phòng ban tự nạp 10–20 tệp
trong hai tuần; chép tay từng tệp vào trình soạn là thứ làm chạy thật chết trước khi bắt
đầu. Lộ trình dời lượt này lên trước tìm và trợ lý AI chính vì nó nạp nội dung cho chạy
thật (sổ theo dõi dòng 5, 2026-09-27).

**Người gặp:** nhân viên phòng ban cầm tệp (muốn đưa tệp vào mà không gõ lại) · chủ trang
(phải tin được bản máy soạn đúng từng con số trước khi bấm duyệt) · chủ kho (trần tiền AI
riêng cho kho, tách khỏi làn nghiên cứu đang dùng chung khoá).

Vật liệu nền: lộ trình mục 4 «Lượt 2», nghiên cứu `kho-tai-lieu-nghien-cuu.md` mục 4.1,
6.1–6.8, 8.4, 9.1, 9.4; bản mẫu `/proto/kho-tai-lieu` trạng thái `ST-tai-nguon`,
`ST-duyet-ban-may-soan`; từ điển `CONTEXT.md` (Nguồn, Bản đề xuất, Bản đang dùng, Chủ trang).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Phần lớn tệp phòng ban có là `.docx` hoặc PDF có lớp chữ, không phải bản quét | Máy soạn gắn «cần gõ tay» cho đa số, chạy thật lại quay về gõ tay | Đếm cờ «cần gõ tay» trên tổng nguồn ở tuần đầu chạy thật (bảng nguồn) | Chưa thử — kiểm kê tệp là việc phòng ban trong chạy thật |
| 2 | Chủ trang duyệt bản máy soạn nhanh hơn viết tay, vì số đã có trích đoạn | Hàng duyệt nghẽn; trung vị duyệt vượt 5 ngày | Trung vị đề xuất → duyệt tách theo `nguonId` rỗng / không rỗng | Đo trong chạy thật |
| 3 | Kiểm số bằng mã (mỗi số mới có trích đoạn nguyên văn) đủ để chặn bịa số | Bản máy soạn có số sai mà vẫn qua kiểm | Ma trận kịch bản model giả ở S3; câu judgment ở S4 | Thiết kế ở S1 |
| 4 | Một trang «Quy tắc viết» do chủ kho viết đủ làm lời dặn cho máy soạn | Bản máy soạn lệch văn phong, mỗi trang một kiểu | Ba tệp mẫu soạn thật ở S4, chấm judgment | Chặn: trang chưa có — tiền đề S3 |
| 5 | Khoá AI Gateway thứ hai với trần tháng giữ tiền kho tách khỏi làn nghiên cứu | Kho ăn ngân sách 20 USD/tháng của team | Sổ `MAY_SOAN` đếm token mỗi lượt; trần đặt ở Gateway | Thiết kế ở S1 |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: trong hai tuần chạy thật, tải tệp lên cho máy soạn có thành đường chính để nội dung vào kho, mà không để một con số sai lọt qua duyệt không?
- Kết quả nào là SỐNG: ≥ 50% bản máy soạn được duyệt (có hoặc không sửa trước khi duyệt) và ≥ 60% trang đã duyệt trong chạy thật đi từ một nguồn — cả hai đếm từ `TaiLieuDeXuat` (`nguonId`, `trangThai`); chi phí trung bình ≤ 0,2 USD mỗi nguồn, đếm từ sự kiện `MAY_SOAN`.
- Kết quả nào là CHẾT: ≥ 1 bản máy soạn thành bản đang dùng mà không qua «Duyệt»; hoặc ≥ 1 con số sai trong bản đang dùng đi từ nguồn được báo lại trong chạy thật; hoặc < 25% bản máy soạn được duyệt; hoặc ≥ 50% nguồn tải lên bị «cần gõ tay».
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): đọc số chạy thật một lần. Hạn cũ: đo cùng chạy thật 2026-10-14 → 2026-10-28, đọc số 2026-10-29 cùng bốn số của lộ trình mục 5.

## Kết quả prototype

Bản mẫu `/proto/kho-tai-lieu` (lượt 0, giữ vĩnh viễn theo `docs/proto.md`) có hai trạng
thái của lượt này: `ST-tai-nguon` (vùng kéo thả, bảng nguồn) và `ST-duyet-ban-may-soan`
(bước «Nguồn nói gì» trước, rồi «Đã đọc nguồn, xem đề xuất của máy», khẳng định có trích).
Bản mẫu còn vẽ lớp dữ liệu, bậc 2 và thẻ mâu thuẫn — ba thứ nằm ngoài lượt này; design-pass
của lượt ghi chúng thành phát hiện. Không đo số nào trên bản mẫu: mô hình đo-tại-UAT.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Kiểm độ tin lớp chữ PDF theo trang, `quote_key` tiếng Việt | `docs/plan/kho-tai-lieu-nghien-cuu.md` mục 6.6–6.7 (trong kho) | triết-lý/logic | có | — |
| Màn duyệt «đưa thông tin, không đưa khuyến nghị», nguồn trước | nghiên cứu mục 8.4 (Goddard) | triết-lý/logic | có | — |
| Bài máy soạn từ tệp vào hàng nháp, biên tập duyệt rồi mới đăng | Document360 Knowledge Base Generator, HelpSite (tra 2026-09-28) | triết-lý/logic | có | — |
| Bố cục màn nguồn và màn duyệt | `apps/app/app/proto/_modules/kho-tai-lieu/man-duyet.tsx` (trong kho) | ngôn-ngữ-thiết-kế/hình-thái đã có trong kho | có | Người ký Cổng Đáng |

## Cổng 0

- **decision = build.** Căn cứ: lộ trình mục 3 đặt lượt 2 trước tìm và trợ lý vì nó nạp nội dung cho chạy thật; điều kiện mở «lượt 1 đã lên `onehub`» chỉ chặn S2 trở đi, S0–S1 được làm khi lượt 1 còn chờ merge (lộ trình mục 2).
- **disposition = keep.** Căn cứ: bản mẫu ở lại kho vĩnh viễn; lượt này thêm một mục `catalog.ts` trỏ cùng module, không xoá gì.
- **Ngưỡng UAT chốt cùng lúc ký:** SỐNG ≥ 50% bản máy soạn được duyệt và ≥ 60% trang đã duyệt trong chạy thật đi từ một nguồn, chi phí trung bình ≤ 0,2 USD mỗi nguồn; CHẾT ≥ 1 bản máy soạn thành bản đang dùng không qua «Duyệt», hoặc ≥ 1 số sai trong bản đang dùng đi từ nguồn được báo lại, hoặc < 25% bản máy soạn được duyệt, hoặc ≥ 50% nguồn «cần gõ tay»; đo 2026-10-14 → 2026-10-28, đọc 2026-10-29 — chốt tại Cổng Đáng 2026-09-28, Phan Le Manh («build, ngưỡng giữ nguyên»).

## Thước đo thành công → ứng viên criterion

- Tỉ lệ bản máy soạn được duyệt → AC: mỗi bản máy soạn là một `TaiLieuDeXuat` có `nguonId`, đi qua đúng luồng duyệt và trả lại của lượt 1.
- Tỉ lệ trang đi từ nguồn → AC: phiên bản sinh từ đề xuất có `nguonId` truy được về nguồn (và tải về được từ màn đọc).
- Không bản máy soạn nào thành bản đang dùng không qua duyệt → AC: máy soạn không có đường ghi tới phiên bản hay con trỏ bản đang dùng.
- Không số sai lọt duyệt → AC: mọi số mới có trích đoạn nguyên văn trong nguồn, kiểm bằng mã trước khi ghi.
- Chi phí mỗi nguồn → AC: sổ `MAY_SOAN` ghi token và nhãn khoá mỗi lượt.
- Tỉ lệ «cần gõ tay» → AC: nguồn mang trạng thái đọc chữ (`CAN_GO_TAY`) có thể đếm.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/kho-tai-lieu/man-duyet.tsx` (`DanhSachNguon`, `ChoDuyet`) | Dựng lại thành màn thật trong `apps/app/app/(app)/[slug]/tai-lieu/` | không | Bản mẫu giữ nguyên làm phòng trưng bày |
| `apps/app/app/proto/catalog.ts` | Giữ; thêm mục `may-soan-de-xuat` | không | Luật slug bản mẫu = slug hồ sơ |

## Out of scope từ khám phá

- OCR bản quét — dừng ở cờ «cần gõ tay»; chọn máy đọc cần thử 30–50 tệp thật trước (nghiên cứu 6.6).
- Thẻ mâu thuẫn giữa trang, sổ khẳng định đầy đủ — lượt để sau `bao-tri-trang-luat`.
- Phân lớp dữ liệu và ô che dữ liệu cá nhân — để sau, chưa gắn lượt (lộ trình mục 7).
- Máy tự tìm trang liên quan cho một nguồn — người tải chọn đích; tự tìm cần lượt 3 (tìm kiếm) đã lên.
