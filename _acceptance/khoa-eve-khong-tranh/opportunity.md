---
schema_version: 1
slug: khoa-eve-khong-tranh
feature: Khoá eve của bài thử không tranh nhau — chu.json ghi trọn một lần, và lượt chờ không gỡ nhầm khoá vừa được lượt khác lấy
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08T04:29:51Z
prototype:
  base_commit:
  disposition:
---

Nguồn: Ngoài-6 và Ngoài-7 của ca-chap-chon-cach-ly, Cổng 2 2026-10-08T04:29:51Z (anh chọn «mở hợp đồng mới»; luật 26 của đợt `sau-14-10`).

## Vấn đề & ai gặp

`apps/agent-okr/test/support/khoi-dong.ts` giữ một khoá thư mục cho mỗi gốc eve (`node_modules/.cache/crm-eve-khoa/<băm>/chu.json`) để hai bài thử không dựng hai máy chủ `eve dev` trên cùng một gốc. F11 dựng khoá đó; phiên soi F11 tìm hai khe:

| Khe | Chỗ | Hậu quả |
| --- | --- | --- |
| Ngoài-6 | `ghiConVaoKhoa` ghi đè `chu.json` tại chỗ (mở O_TRUNC rồi ghi) | Lượt chờ đọc trúng tệp rỗng → `chuKhoa` trả `null` → `khoaCu` rơi về so mtime thư mục (đã cũ) → coi khoá đang sống là chết → dừng eve của chủ khoá và gỡ khoá. Bài của chủ khoá đỏ ConnectionRefused. |
| Ngoài-7 | `giuMot`: `await dungMoCoi(khoa)` nằm giữa `khoaCu(khoa)` và `rmSync(khoa)` | Hai lượt chờ cùng thấy khoá cũ; lượt một dọn xong và lấy khoá; lượt hai (còn trong `dungMoCoi`, tới 5 s) rồi `rmSync` gỡ khoá lượt một vừa lấy → hai eve trên một gốc, hoặc lượt hai dừng eve của lượt một. |

**Người gặp:** mọi lượt `bun run test` có bài eve của `apps/agent-okr` chạy song song (pre-push, ghim lại, S4, CI). Chưa đo được tần suất: khe hẹp (vài mili giây cho Ngoài-6, ≤ 5 s cho Ngoài-7), lỗi trông giống ca chập chờn F11 đã cách ly.

## Giả định chốt sinh tử

- Sửa được hoàn toàn ở tầng test (`khoi-dong.ts`), không đổi mã sản phẩm: ghi tệp tạm cùng thư mục rồi `renameSync`, và giành khoá cũ bằng một thao tác nguyên tử (đổi tên thư mục khoá cũ) trước khi dừng mồ côi.
- Hai khe tái hiện được trên máy bằng bài thử ép thứ tự (chèn chỗ dừng giữa các bước), không cần chờ may rủi.

## Ngưỡng chết / ngưỡng UAT

[đề xuất] Việc nội bộ, không có người dùng.
- SỐNG: bài ép thứ tự của cả hai khe đỏ trên mã cũ và xanh trên mã mới; hai tuần sau gộp, 0 lượt đỏ nào trong pre-push/CI/làn ghim lại có dấu «eve của chủ khoá bị lượt chờ dừng» (ConnectionRefused kèm khoá đổi chủ giữa bài).
- CHẾT: còn một lượt như thế sau gộp, hoặc bài ép thứ tự chỉ xanh nhờ may rủi (chạy 20 lần không đỏ đều trên mã cũ).
- Timebox: đợt `sau-14-10`; đo lần đầu hai tuần sau gộp.

## Câu hỏi mở cho Cổng Phạm vi

- Giành khoá cũ bằng đổi tên thư mục: nếu giữa lúc đọc «cũ» và lúc đổi tên, khoá đã được lượt khác thay bằng khoá mới thì nhận ra bằng gì (inode thư mục, hay pid + giờ trong `chu.json`)?
- `chu.json` rỗng hay hỏng (không phải tệp vắng) còn được coi là cũ theo mtime không, hay chỉ coi cũ khi pid chủ chết?

## Hạng mục cùng lớp

`ca-chap-chon-cach-ly` (F11, đã gộp #310), `ca-chap-chon-con-lai` (F17).

## Quyết định Cổng Đáng

Luật 26: anh chọn «mở hợp đồng mới» cho Ngoài-6/Ngoài-7 ở Cổng 2 của ca-chap-chon-cach-ly lúc 2026-10-08T04:29:51Z — coi như `build`. Giám sát xếp F18, dãy P5.
