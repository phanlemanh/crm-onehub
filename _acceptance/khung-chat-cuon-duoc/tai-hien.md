# H2 khung-chat-cuon-duoc — S0 tái hiện (08/10/2026)

Anh báo trên production: «không cuộn được ở bên chat». Chưa rõ màn, thiết bị, trình duyệt.

Cây đo: `onehub` @ `591bc8fb` (gồm #312 soạn OKR trang riêng và #314 Kara trạng thái toàn CRM), phiên đo
`tien-de`/`do:man` riêng (CSDL `crm_quirky_lalande_20ab9d_do`, app `next dev` của cây này), Chrome headless.

## Kết quả

| Mặt | Dữ liệu tràn khung | 1440 con lăn | 390 con lăn | 390 vuốt cảm ứng |
| --- | --- | --- | --- | --- |
| Trang `/[slug]/chat/[id]` (`MessageScroller`) | 30 tin người gửi thật (`AgentConversationSubmission`) | cuộn hai chiều | cuộn hai chiều | cuộn hai chiều |
| Tab Kara trong ngăn bản ghi (`MessageScroller` trong `vaul` drawer ở 390, sheet ở 1440) | 60 dòng chèn vào `message-scroller-content` | cuộn hai chiều | cuộn hai chiều | cuộn hai chiều (điểm chạm trong vùng cuộn) |
| Soạn OKR `/[slug]/okr/soan/[id]` (`KaraTranscript`) | tin thật qua tác tử giả (bộ dựng của #312) | cuộn hai chiều | cuộn hai chiều | cuộn hai chiều |

Không tái hiện được.

## Đã loại

- Dương tính giả của chính phép đo: ở 390 khung tin tab Kara chỉ cao ~228 px; cú vuốt lên bắt đầu ở mép dưới
  rơi đúng nút nổi «Xuống cuối» (ngoài vùng cuộn), và `react-remove-scroll` (khoá cuộn của drawer) chặn nó — đúng
  hành vi. Đo lại với điểm chạm trong vùng cuộn: hai chiều đều cuộn.
- `react-remove-scroll` 2.7.2 `handleScroll`: tính lại trong trang, còn 3280 px cuộn xuống — không huỷ.
- `vaul` 1.1.2 `shouldDrag`, `touch-action: none` của `drawer-content`, lớp kéo tự viết trong `drawer.tsx`
  (chỉ bật khi có thay đổi chưa lưu): ghi đè từng cái không đổi kết quả.
- #312 / #314: diff không chạm cơ chế cuộn; `@shadcn/react` (MessageScroller) không đổi bản.

## Khác biệt còn lại với môi trường của anh

- Production chạy bản `next build`; phiên đo chạy `next dev`.
- Thiết bị thật (iOS Safari: `vaul` bật `usePreventScroll` chỉ trên iOS; Chrome giả lập không chạy nhánh đó).
- Dữ liệu thật (tin dài, tệp đính kèm, bảng) và mặt chat khác (hộp thoại Trợ lý OKR, ngăn Kara toàn CRM).

## Phép đo

`rang/tai-hien-chat.mjs` (trang Chat + tab Kara, qua `bun scripts/lan-do/tien-de.mjs --chay`) và
`rang/tai-hien-soan.mjs` (Soạn OKR, qua `_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh`), dùng chung
`rang/do-lan.mjs` (con lăn qua `mouse.wheel`, cảm ứng qua CDP `Input.dispatchTouchEvent`, điểm chạm phải nằm
trong vùng cuộn). Cờ chẩn đoán: `KCS_DAO`, `KCS_NGHE`, `KCS_TA`, `KCS_NO_DRAG`.
