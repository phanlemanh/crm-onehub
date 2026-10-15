## Ngữ cảnh

- Sản phẩm: CRM của OneHub, khung soạn OKR (Kara soạn Mục tiêu, KR cùng trưởng phòng trong khung bản ghi bên phải) —
  chân sản phẩm: đào repo (`apps/app/app/(app)/[slug]/okr/soan/**`, `packages/ui/src/components/giu-thay-doi.tsx`,
  hàng K2f của `docs/plan/lo-trinh-okr.json`) · chân ngành: Web Interface Guidelines của Vercel (vercel-labs/
  web-interface-guidelines, `command.md`, tải 15/10): «Warn before navigation with unsaved changes (beforeunload or
  router guard)» và «Links use `<a>`/`<Link>` (Cmd/Ctrl+click, middle-click support)».

## Trục

- Trục A — Thứ đang dở trong khung: Kara đang soạn | chữ gõ dở trong ô soạn | số gõ dở trong bản nháp | không gì dở
  [thước CE: ba lời khai giữ của khung — `GiuKhiSoan` khai `dangSoan` (`trang-soan.tsx`), `khaiChu` và `khaiSo`
  (`dung-cuoc-soan.ts`) [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts]]
- Trục B — Cách bấm liên kết: chuột trái | Enter trên liên kết đang focus | Cmd/Ctrl/Shift/Alt + bấm | chuột giữa |
  liên kết mở thẻ mới | liên kết sang miền khác | liên kết tải xuống | liên kết trỏ đúng địa chỉ đang đứng
  [thước CE: nhánh của `hrefNoiBo` (`packages/ui/src/components/giu-thay-doi.tsx`) + [NGÀNH: Web Interface Guidelines —
  Cmd/Ctrl+click, middle-click]]
- Trục C — Liên kết nằm đâu trong khung: nút «Tới Kho tài liệu» (cảnh báo thiếu bối cảnh, người quản trị) | nút «Xem
  theo đơn vị» (sau khi đưa bản nháp vào) | liên kết trong chữ Kara (markdown)
  [thước CE: `git grep "<Link\|href="` trong `okr/soan/*.tsx` → hai `Link`; `MessageResponse` dựng markdown của Kara
  [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx]]
- Trục D — Người chọn gì ở hộp hỏi: ở lại bằng nút | ở lại bằng Esc | rời
  [thước CE: hai nút và Esc của `ConfirmDialog`]
- Cắt ngang: khổ rộng 1280 (một cột Kara) và hẹp 375 (hai tab Trò chuyện / Bản nháp); khung là hộp modal (lớp phủ chặn
  bấm ra ngoài); tiếng Việt và tiếng Anh dùng chung chữ hộp hỏi đã có.

## Không gian

A × B × D = 4 × 8 × 3 = 96 ô, cộng trục C. Quét theo lát của trục A (quan trọng nhất), trục B rút gọn: với mọi cách bấm
mà trình duyệt tự mở chỗ khác (Cmd/Ctrl/Shift/Alt, chuột giữa, thẻ mới, miền khác, tải xuống, cùng địa chỉ) thì
trang này không mất gì — không hỏi là đúng ở mọi giá trị của A, nên đo một lần ở tầng cơ chế, không nhân với A và D.

## Core

1. A{Kara soạn, chữ dở, số dở} × B{chuột trái} × D{ở lại nút, ở lại Esc, rời} — 9 ô, lõi của câu giao.
2. A{không gì dở} × B{chuột trái} — đi ngay, không hỏi (đối chứng: bộ chặn không làm phiền khi không có gì để mất).
3. B{Cmd, Ctrl, Shift, Alt, chuột giữa, thẻ mới, miền khác, tải xuống, cùng địa chỉ} × A{có dở} — không chặn (9 ô gộp
   một ma trận ở tầng cơ chế).
4. B{Enter trên liên kết} × A{Kara soạn} trên trình duyệt thật — Enter thành click chỉ ở trình duyệt, jsdom không có.
5. C{«Tới Kho tài liệu»} cho các ô 1 và C{«Xem theo đơn vị»} cho ô 2 — hai liên kết thật của khung.
6. Cắt ngang khổ 1280 và 375 trên màn thật cho ô (Kara soạn × rời) và (chữ dở × ở lại).

## Later

- C{liên kết trong chữ Kara}: `Streamdown` mở liên kết ở thẻ mới nên rơi vào nhánh «thẻ mới» của trục B; S3 kiểm lại
  thuộc tính `target` thật, khác thì thành một ca của E1.
- Đóng thẻ hay tải lại trình duyệt khi chỉ có chữ gõ dở (chưa có `beforeunload` cho ca này; ca Kara soạn đã có).
- Chặn liên kết ở các khung bản ghi khác có khai thay đổi (trao đổi trên khung Mục tiêu, thêm nhanh).

## Never

- Lưu nháp chữ trong ô soạn qua lần rời trang — câu giao là «hỏi trước khi rời», không phải «giữ qua lần rời».
- Chặn nút Quay lại của trình duyệt — Next không cho chặn điều hướng lịch sử; ngoài câu giao.

## Cross-cutting áp mọi ô Core

- Lời hỏi đúng lời của chính khung (soạn: lời «Kara đang soạn»; gõ dở: lời «bỏ những gì vừa nhập»), hai thứ tiếng.
- Rời thì đúng một lần điều hướng, đúng địa chỉ, không làm dừng lượt Kara.
- Ở lại thì không điều hướng, khung còn, chữ và số còn nguyên.
