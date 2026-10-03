# Quét không gian AC — soan-okr-cung-tro-ly

Quét 2026-09-30 bằng skill `morphological-scan`, hai preset ghép: entity-feature (danh từ
trung tâm là **cuộc soạn** và **bản nháp** của nó) và risk-premortem (cho trục kiểu hỏng).

## Ngữ cảnh

- Sản phẩm: CRM của OneHub, khu OKR — chân sản phẩm: `CONTEXT.md` (mục OKR, Trợ lý OKR,
  Đề xuất, Chế độ ẩn, Kho tài liệu, Bộ phận, Phòng ban, Vai «chỉ OKR») và tài liệu bối
  cảnh đã duyệt `docs/superpowers/specs/2026-09-30-soan-okr-cung-tro-ly-boi-canh-design.md`
  [SUY-TỪ-REPO] · chân ngành: Tability AI (soạn OKR từ mô tả đội, hỏi lại, đưa cả bộ;
  `docs/reports/2026-09-26-tro-ly-okr/01-tability-chinh-chu.md`), Perdoo và Cascade
  Strategy (OKR neo vào chiến lược và tài liệu; `03-doi-thu-okr.md`) [NGÀNH: Tability,
  Perdoo, Cascade].

## Trục

- Trục A — lớp bối cảnh trong gói: 0 hồ sơ công ty | 1 đơn vị và vai người hỏi | 1n mô tả
  đơn vị và chức danh | 2a OKR cấp trên và ngang cấp | 2b Hỏi ý mục tiêu | 3 kỳ trước | 4 số
  CRM dạng tổng | 5 chiến lược [thước CE: bảng mục 3 của tài liệu bối cảnh; Tability
  «team context» + Cascade «strategy-linked OKR»]
- Trục B — vòng đời một cuộc soạn: mở cuộc → Trợ lý mở đầu và hỏi → người trả lời → bản
  nháp → sửa (trên bảng hoặc qua chat) → quyết từng dòng → đưa vào bộ OKR (nháp) → người
  công bố (ngoài cuộc) → lưu và đọc lại kỳ sau → đo [thước CE: preset entity-feature
  «Lifecycle»; luật sổ đề xuất 9b §4.9 thiết kế Trợ lý OKR]
- Trục C — người × nấc: quản trị (cấp OneHub) | trưởng bộ phận | trưởng phòng ban | người
  phụ trách KR không sửa được đơn vị | thành viên | vai «chỉ OKR» (là trưởng phòng ban hoặc
  thành viên) | máy — × tắt · chế độ ẩn · bật [thước CE: §4.7 thiết kế; `okr-access.service.ts`;
  AC «một phép đo cho mỗi đường vào» của `vai-chi-okr`]
- Trục D — kiểu hỏng: sai (số bịa, chép cấp trên, sai đơn vị, dòng đã bác quay lại) | chết
  (phiên chết, treo quá hạn, hai phiên) | chậm | rò (dữ liệu đối tác qua chat, lương thưởng
  trong trang chiến lược, tên người) | vượt tiền (trần lượt/cuộc, cuộc/đơn vị, tháng) | trùng
  (hai lần «Đưa vào», hai cuộc song song) | không ai dùng [thước CE: preset risk-premortem;
  Ngoài-32/33/36 của 9a, hạn chế đã biết của 9b]

Trục A độc lập với B (một lớp có thể vào hay không vào ở bất kỳ bước nào); C độc lập với A
và B; D cắt ngang cả ba. Hơn 30 ô nên quét theo lát cắt của trục B (quan trọng nhất), gắn A,
C, D vào từng bước.

## Core (≤ 20 %)

1. **Mở cuộc × người × nấc** — ma trận quyền: ai mở được cuộc cho đơn vị nào, ở nấc nào;
   vai «chỉ OKR» đi qua đường chat mới mà không thấy dữ liệu đối tác (đường vào mới → phép đo
   riêng) → AC-1.
2. **Gói bối cảnh đúng lớp, đúng quyền, có trần** — lớp 0/5 từ trang đang dùng, lớp 3 tóm
   gọn bằng mã, lớp 4 rỗng cho vai «chỉ OKR», thước cỡ gói cắt theo thứ tự đã khai, không tên
   người → AC-2.
3. **Mô tả đơn vị và chức danh** — hai cột mới, sửa ở màn Cây tổ chức, vào gói → AC-3.
4. **Loại trang «chiến lược»** — tạo/duyệt như mọi trang, trần ký tự và cảnh báo từ cấm lúc
   duyệt, Trợ lý chỉ đọc bản đang dùng → AC-4.
5. **Đối thoại có trí nhớ, cách ly, có trần** — eve app riêng, ZDR, không công cụ đối tác,
   trần lượt/cuộc và cuộc/đơn vị/kỳ, sổ chi phí, trần tháng → AC-5.
6. **Bản nháp đúng khuôn và bộ kiểm** — 2–4 Mục tiêu × 2–4 KR, đích trống, số chỉ từ gói
   hoặc chữ người gõ; loại dòng số mới · tên người · từ cấm · chép cấp trên · id ngoài gói · đã
   bác → AC-6.
7. **Bảng nháp sống cạnh chat** — nhận · sửa · bác từng dòng, sửa qua chat cập nhật bảng,
   dòng bác không mời lại, mọi trạng thái ở 1440 và 390 → AC-7.
8. **Đưa vào bộ OKR** — một giao dịch tạo cả bộ ở trạng thái nháp qua đường có quyền, vết
   ghi nguồn là cuộc soạn, hai lần bấm hay đồng thời → đúng một lần → AC-8.
9. **Lưu và đọc lại** — cuộc lưu theo đơn vị, tiếp nối, sổ đề xuất ghi từng dòng nháp với
   mã cuộc, kỳ sau đọc được «nháp nào thành OKR» → AC-9.
10. **Chế độ ẩn của việc soạn** — nấc ẩn: chỉ quản trị mở được cuộc trên đơn vị đó, số đo
    tách cột → AC-10.
11. **Thẻ số đo cho quản trị** — cuộc mở/hoàn tất, dòng nhận/sửa/bác, Mục tiêu nháp → công
    bố 14 ngày, chi phí mỗi cuộc, độ trễ mỗi lượt; SQL trong `rang/` → AC-11 (đường đo).
12. **Hỏng và chèn** — phiên chết/quá hạn có «Thử lại», không phiên trùng; chữ chèn trong
    trang chiến lược hay tên KR không đổi hành vi → AC-12.
13. **Chất lượng bằng eval** — ca soạn trên bộ mẫu, judge ZDR, có/không bối cảnh (giả định 1),
    độ trễ mỗi lượt, chi phí mỗi cuộc (giả định 3) → AC-13.
14. **Bộ mẫu đủ để thử** — quý 3 có ghi chú và mức tự tin trôi, hai trang chiến lược, mô tả,
    chức danh, quản lý trực tiếp; nạp lại sạch → AC-14.
15. **Tài liệu và luật kho** — từ điển, `docs/api.md`, `docs/agent.md`, lộ trình mục 10, luật
    kho → AC-15 (judgment).

## Later

- Lớp 2b Hỏi ý mục tiêu — lượt nhỏ khi `dot-hoi-y-tuong-okr` lên `onehub`.
- Hai kỳ trở lên trong lớp 3; «KR tương tự các kỳ trước» bằng pgvector — sau khi quý 4 khép
  (thiết kế §7.2).
- Tìm toàn văn trong Kho tài liệu cho Trợ lý; quyền theo trang — theo lộ trình Kho tài liệu.
- Hỏi đáp OKR (C) dùng lại nền chat này; soạn qua Zalo/Slack — lượt 10.
- Tóm tắt cuộc soạn cho trưởng bộ phận — sau T.
- [NGÀNH: Tability] gợi ý «KR mẫu theo ngành» — không có dữ liệu ngành riêng của OneHub;
  trang chiến lược thay thế.

## Never

- Trợ lý tự công bố hay ghi số đích, mức tự tin — NG-05.
- Chép KR cấp trên thành Mục tiêu cấp dưới — NG-06 (bộ kiểm loại).
- Bộ nhớ chéo giữa các cuộc ngoài dữ liệu OKR và sổ đề xuất — thiết kế §4.8.
- Đọc dữ liệu đối tác cho vai «chỉ OKR», hay đưa phần lương thưởng của tài liệu Operating
  System vào gói — NG-01, NG-02, luật cách ly 9a.
- Nối OKR với xếp hạng, huy hiệu — NG-07.

## Cross-cutting áp mọi ô Core

- Dữ liệu trong gói và trong cuộc là dữ liệu, không phải lệnh — thẻ dữ liệu và bộ kiểm như
  9b; không tên người trong gói.
- ZDR bắt buộc kể cả eval và judge; trần tháng khu OKR; sổ chi phí mọi phiên.
- Vai «chỉ OKR»: mỗi đường vào mới một phép đo đỏ-xanh.
- Trạng thái rỗng · đang soạn · lỗi · hết trần cho mọi màn; không tràn ngang ở 390.
- Vết (`OkrTrail`) cho mọi ghi vào OKR; không chú thích trong mã; hằng tinh chỉnh ở một tệp
  cấu hình; khuôn parse ở `packages/validation`; thành phần mới ở `packages/ui`.
- [GIẢ ĐỊNH] Nấc «chế độ ẩn» cho việc soạn nghĩa là «chỉ quản trị mở được cuộc trên đơn vị
  đó» — khác nấc ẩn của góp ý (máy tự chạy khi lưu). Gạch ở Cổng Phạm vi nếu chủ kho muốn
  nghĩa khác.
- [GIẢ ĐỊNH] Trần 12 lượt mỗi cuộc, 3 cuộc mỗi đơn vị mỗi kỳ; con số đặt lại sau N-soạn.
- [GIẢ ĐỊNH] Hạng mục này dựng nền chat OKR thay cho C — đã chốt ở Cổng Đáng 30/09.
