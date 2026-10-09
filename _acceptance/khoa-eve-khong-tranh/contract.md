---
schema_version: 1
feature: Khoá eve của bài thử không tranh nhau — chu.json ghi trọn một lần, lượt chờ giành khoá cũ bằng đổi tên có kiểm dấu, chủ khoá chỉ gỡ khoá của chính mình
slug: khoa-eve-khong-tranh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-09T00:16:06Z
design_doc: _acceptance/khoa-eve-khong-tranh/design.md
---

# Acceptance Contract: khoa-eve-khong-tranh

## Context

`apps/agent-okr/test/support/khoi-dong.ts` giữ một khoá thư mục cho mỗi gốc eve, để hai bài thử không dựng hai `eve dev` trên một gốc. Phiên soi F11 tìm hai khe:

- Ngoài-6: `ghiConVaoKhoa` ghi đè `chu.json` tại chỗ. Lượt chờ đọc trúng lúc rỗng thì coi khoá đang sống là cũ, dừng eve của chủ và gỡ khoá.
- Ngoài-7: giữa lúc xét «khoá cũ» và lúc `rmSync` có `await dungMoCoi` (tới 5 s). Lượt chờ thứ hai gỡ khoá mà lượt thứ nhất vừa lấy.

Cổng Đáng: luật 26 — chủ kho chọn «mở hợp đồng mới» ở Cổng 2 của ca-chap-chon-cach-ly, 2026-10-08T04:29:51Z (`opportunity.md`).

Source input: `opportunity.md`, `design.md`, `review-findings.md` của ca-chap-chon-cach-ly.

## Criteria

- AC-1: Given một lượt đang giữ khoá `eve dev` của một gốc, When nó ghi `chu.json` — lần đầu khi lấy khoá, và mỗi lần `ghiConVaoKhoa` thêm một `eve dev` con — và một lượt khác đọc khoá ở ĐÚNG lúc giữa hai bước ghi, Then lượt đọc thấy `chu.json` trọn vẹn (bản trước hoặc bản sau, đúng `pid` của chủ) hoặc thấy thư mục khoá còn mới, và phán khoá KHÔNG cũ; And không còn tệp tạm nào trong thư mục khoá sau khi ghi xong.
- AC-2: Given khoá của một gốc cũ (chủ đã chết) với một `eve dev` mồ côi còn sống, và lượt C đã phán khoá đó cũ, When — trước khi C kịp giành — lượt B giành khoá cũ, dừng `eve dev` mồ côi, lấy khoá mới và ghi `eve dev` con của mình, Then C KHÔNG dừng `eve dev` của B và KHÔNG xoá khoá của B (`chu.json` vẫn mang `pid` và `ma` của B); And C chờ tiếp rồi ném lỗi gọi tên `pid` của B khi hết trần chờ; And thư mục khoá cha không còn thư mục `.cu-*` nào.
- AC-3: Given khoá cũ với một `eve dev` mồ côi còn sống và chỉ một lượt chờ, When lượt đó gọi `giuKhoaEve`, Then `eve dev` mồ côi bị dừng, lượt đó giữ khoá với `ma` mới, và không còn thư mục `.cu-*` nào — các ca `mo-coi`, `ngoai-khoa`, `cho-route` của `khoi-dong-don.spec.ts` vẫn xanh như trước.
- AC-4: Given lượt A đang giữ khoá của một gốc, và khoá đó đã bị thay bằng khoá của lượt B (thư mục khoá của A bị đổi tên đi, B lấy khoá mới), When A gọi `ghiConVaoKhoa`, Then A ném lỗi có chữ «da doi chu» và không ghi gì vào khoá của B; And When A gọi `traKhoaEve` cho gốc đó, hoặc tiến trình A thoát (bộ dọn lúc `exit`), Then khoá của B còn nguyên.
- AC-5: Given diff của vòng so với merge-base với `onehub`, Then chỉ các tệp `apps/agent-okr/test/support/khoi-dong.ts`, `apps/agent-okr/test/khoa-eve*.spec.ts`, `_acceptance/khoa-eve-khong-tranh/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` (bản đồ máy vẽ lại ở mỗi cổng) và các dòng THÊM vào `_acceptance/config.yaml` đổi.
- AC-6: Given hai dấu khoá (số `ino` thư mục, `mtime` thư mục, `ma` trong `chu.json` hoặc vắng), When lượt chờ so dấu khoá đã xét với dấu khoá vừa giành, Then chỉ coi là cùng một khoá khi cả ba phần bằng nhau — `ma` vắng chỉ bằng `ma` vắng — nên một khoá tạo lại trùng số `ino` (ext4 cấp lại `ino` ngay sau khi xoá) vẫn bị nhận là khoá khác.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 08/10.

- **Trục A — chỗ ghi `chu.json`:** lấy khoá lần đầu (`giuMot`) | thêm eve con (`ghiConVaoKhoa`).
  - Thước CE: mọi lời gọi `writeFileSync` vào `KHOI_DONG.khoa.tep` trong `khoi-dong.ts` (hai chỗ, đọc ngày 08/10).
- **Trục B — trạng thái khoá lúc lượt chờ giành:** vẫn đúng khoá cũ đã xét | đã bị lượt khác giành trước (không còn tên) | đã bị thay bằng khoá mới của lượt khác.
  - Thước CE: các nhánh của `giuMot` sau khi `mkdirSync` lỗi; Ngoài-7 của F11.
- **Trục C — người gỡ khoá:** lượt chờ dọn khoá cũ | chủ khoá trả khoá (`traKhoaEve`) | bộ dọn lúc `exit` của tiến trình.
  - Thước CE: ba lời gọi `rmSync` vào thư mục khoá trong `khoi-dong.ts`.
- **Ô Core:** A1, A2 (AC-1) · B3 (AC-2, AC-6) · B1 (AC-3) · C2, C3 (AC-4) · ranh giới (AC-5). B2 được đi qua trong AC-2 (lượt B và C cùng giành) nhưng không có bài ép riêng.
- **Đối chiếu ngành:** [NGÀNH: npm `proper-lockfile`] — khoá thư mục `mkdir`, phán cũ theo mtime, báo `onCompromised` khi chủ mất khoá; AC-4 là bản `onCompromised` của kho này. [NGÀNH: POSIX `rename(2)`] — đổi tên trong cùng hệ tệp là nguyên tử, nền của AC-1 và AC-2.
- **Later:**
  - dọn thư mục `.cu-*` mà lượt dọn bị giết giữa chừng để lại.

## Đường đo

- «Bài ép thứ tự đỏ trên mã cũ, xanh trên mã mới»: số từ E8 (các cặp phá trên bản sao, mỗi cặp một lần) và E1, E2 · AC-1, AC-2.
- «Không đỏ đều 20/20 trên mã cũ thì CHẾT»: số từ E10 — ba cặp phá của hai khe (a, b, c) chạy 20 lần mỗi chiều, in số đếm · AC-1, AC-2.
- «0 lượt đỏ mang dấu eve của chủ khoá bị lượt chờ dừng trong hai tuần»: không có bộ đếm máy; người đo đọc nhật ký pre-push/CI/làn ghim lại tìm lỗi «da doi chu» (AC-4 làm dấu đó hiện thành chữ) và ConnectionRefused của `apps/agent-okr` · AC-4.

## Out of scope

- Thư mục `.cu-*` còn sót khi chính lượt dọn bị SIGKILL giữa lúc giành và lúc gỡ: eve mồ côi của khoá đó không được dừng; hiếm, và không làm hai eve chạy chung một gốc.
- Ca ba lượt: C giành nhầm khoá mới của B, và trước khi C kịp trả lại tên thì lượt D đã tạo khoá mới — C không trả lại được; B nhận ra ở lần `ghiConVaoKhoa` hay `traKhoaEve` kế tiếp (AC-4), không tự sửa.
- Khoá eve của `apps/agent` (không dùng `khoi-dong.ts`).
- Thay khoá thư mục bằng `proper-lockfile` hay khoá hệ điều hành (`flock`).
- Sửa `khoi-dong-don.spec.ts`, `thu-khoi-dong.ts`, `app-rieng.integration.spec.ts`.

## Notes

- Không migration. Không đổi mã sản phẩm.
- Tệp ngoài ranh giới hàng: không có (`config.yaml` chỉ thêm dòng).
- Known limits — chấp nhận tại Cổng Bằng chứng 2026-10-09 (Phan Le Manh), từ mục ngoài hợp đồng của S4 round 2:
  - Ngoài-2: `gianhKhoaCu` không bắt lỗi khi trả tên khoá về sau dấu lệch, và lần đổi tên đầu nuốt mọi lỗi, nên lỗi thiếu quyền hiện ra là «khoa dang bi giu».
  - Ngoài-4: ba lượt tranh một gốc, lượt thứ ba tạo khoá đúng khe trả tên: `renameSync` đè khoá rỗng mới (hai lượt cùng tin mình giữ khoá) hoặc ném `ENOTEMPTY` và để khoá sống dưới tên `.cu-*`.
  - Ngoài-5: chủ khoá gọi `traKhoaEve` hay thoát đúng lúc khoá bị đổi tên đi thì không gỡ được; khoá trả về mang pid không ai giữ, các lượt sau chờ đủ 5 phút.
  - Ngoài-6: không bài nào kiểm rằng chủ thật vẫn tự gỡ được khoá của mình.
  - Ngoài-7: dòng (1) của `ghi-tron` không thể đỏ ở lần lấy khoá đầu.
- Mở hợp đồng mới (Ngoài-3): `moEve` để `eve dev` vừa sinh chạy mồ côi khi `ghiConVaoKhoa` ném lỗi, lượt sau trên cùng gốc đỏ «A dev server is already running».
