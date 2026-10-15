---
schema_version: 1
slug: ve-sinh-do-san-onehub
feature: Các hồ sơ đã ký đang đỏ sẵn trên onehub xanh lại, để PR nào chạm chúng cũng ghim lại được
owner: phanlemanh@gmail.com
stage: discovery             # discovery | decided | archived
decision:               # build | iterate | park | kill — người ký Cổng 0 điền
decided_by:
decided_at:                    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

PR DH2 (`trang-don-vi-mot-bang`) phải ghim lại các hồ sơ đã ký mà nó chạm. Hai lượt ghim lại đỏ vì lỗi
ĐỎ SẴN trên `onehub` lan sang, không do DH2 (nhật ký trên `eb5ab4269`:
`.claude/worktrees/trang-don-vi-mot-bang/_acceptance/trang-don-vi-mot-bang/do-san-onehub/*.log`). Mỗi
lượt ghim (~75 phút) lộ thêm một đỏ sẵn, nên phiên DH2 dừng-vá. Ai gặp: mọi thợ có PR chạm các hồ sơ
`okr-soat-anh-luot-3`, `toan-canh-okr`, `soan-okr-trong-khung`, `khung-trang-cai-dat`,
`man-cai-dat-noi-tieng-viet`, `dat-okr-trong-crm`, `muc-tieu-va-kr` — trước hết DH2. Người dùng thật gặp
hai lỗi sản phẩm nằm dưới: trang dựng lại một lần khi mở thẳng đường dẫn có `record=` (lỗi hydration), và
quản trị mở cuộc soạn của người khác nhận một phản hồi 403.

## Căn cứ quyết

Chủ kho chọn trong phiên DH2 (sổ `trang-don-vi-mot-bang`, dòng `d-20261015T212157Z-38`), nguyên văn:
«Đường B: tách vòng «vệ sinh đỏ sẵn onehub» riêng (hydration record= + 403, moi-chuoi bắt nhầm, neo F8 và
giai-doan đã làm) gộp trước; PR DH2 chỉ còn trang đơn vị và phép đo hồ sơ của trang, rồi ghim lại trên bản
đã vệ sinh.» Trước đó chủ kho đã duyệt nhận hydration + 403 theo cách B (~5 giờ máy) và Mac Studio đóng hàng
`ngan-soan-hydrat-theo-don-vi`, giao sang (#375 14:31Z). Câu đó là quyết TÁCH vòng; chữ ký Cổng Đáng của chính vòng
này vẫn là của chủ kho, gõ tại phiên thợ — ô để trống `decision` tới lúc đó.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau vòng này, làn ghim lại các hồ sơ đã ký bị chạm có xanh trên đỉnh nhánh (cùng
  cây với onehub cộng bản vá) mà không còn đỏ sẵn nào thuộc bốn mục của câu giao không?
- Kết quả nào là SỐNG: làn ghim lại xanh cho cả bảy hồ sơ kê ở trên (và mọi hồ sơ khác diff chạm), S4 PASS;
  sau khi gộp, lượt ghim lại của PR DH2 không vấp đỏ sẵn nào thuộc bốn mục.
- Kết quả nào là CHẾT: còn một eval của bảy hồ sơ đỏ vì một trong bốn mục sau ba lượt chấm.
- Timebox: mốc m-1020dh (20/10/2026).
