---
slug: ngan-kr-mot-cho
at: 2026-10-20T04:20:00Z
route: http://localhost:3302/proto/ngan-kr-mot-cho
material: real-components
context: static-frame
context_scenes: [evidence/design-pass/ST-nkr-hop-tu-ngan--desktop-1280.jpg]
reaction: nac-2 (vat-bam-duoc — gửi đường dẫn bản mẫu và ảnh trong thẻ Cổng Phạm vi)
options:
divergence: skipped — đi theo khuôn `NganKr` của bản mẫu vo-khu-muc-tieu (2790552ac) mà chủ kho đã xem 18/10; bốn lựa chọn mở đã được chủ kho trả lời 20/10
ds_skill: repo-tokens
states: [ST-nkr-dong, ST-nkr-ngan, ST-nkr-ngan-dau, ST-nkr-ngan-chi-doc, ST-nkr-hop, ST-nkr-hop-moc, ST-nkr-hop-sai, ST-nkr-hop-tu-ngan, ST-nkr-khong-thay]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 1
deferred: 4
---
# design-pass — ngan-kr-mot-cho

Bản mẫu `apps/app/app/proto/_modules/ngan-kr-mot-cho/` ghép từ thành phần thật của `@crm/ui` (`Sheet`, `Dialog`,
`StatGroup`, `StatCard`, `TargetLineChart`, `SimpleTable`, `Item`, `ToggleGroup`) và khung ứng dụng tĩnh của bản mẫu
`ban-mau-okr`, dữ liệu mẫu `MT_CSKH_1` (bốn KR: hai số tăng tới và giảm tới, một mốc, một phần trăm). Không đường ghi:
«Gửi cập nhật» chỉ đổi số trong bộ nhớ của trang. Đã đi thử đường 3 bấm trên bản mẫu ở 1280: «Cập nhật» trên dòng KR 2
→ gõ 78 vào ô đã có tiêu điểm → «Vừa» → «Gửi cập nhật»; dòng hiện 78%.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-nkr-dong | desktop-1280 | dark | evidence/design-pass/ST-nkr-dong--desktop-1280.jpg |
| ST-nkr-ngan | desktop-1280 | dark | evidence/design-pass/ST-nkr-ngan--desktop-1280.jpg |
| ST-nkr-ngan-dau | desktop-1280 | dark | evidence/design-pass/ST-nkr-ngan-dau--desktop-1280.jpg |
| ST-nkr-ngan-chi-doc | desktop-1280 | dark | evidence/design-pass/ST-nkr-ngan-chi-doc--desktop-1280.jpg |
| ST-nkr-hop | desktop-1280 | dark | evidence/design-pass/ST-nkr-hop--desktop-1280.jpg |
| ST-nkr-hop-moc | desktop-1280 | dark | evidence/design-pass/ST-nkr-hop-moc--desktop-1280.jpg |
| ST-nkr-hop-sai | desktop-1280 | dark | evidence/design-pass/ST-nkr-hop-sai--desktop-1280.jpg |
| ST-nkr-hop-tu-ngan | desktop-1280 | dark | evidence/design-pass/ST-nkr-hop-tu-ngan--desktop-1280.jpg |
| ST-nkr-khong-thay | desktop-1280 | dark | evidence/design-pass/ST-nkr-khong-thay--desktop-1280.jpg |
| ST-nkr-dong | mobile-375 | dark | evidence/design-pass/ST-nkr-dong--mobile-375.jpg |
| ST-nkr-ngan | mobile-375 | dark | evidence/design-pass/ST-nkr-ngan--mobile-375.jpg |

Chưa chụp: `ST-nkr-dang-tai`, `ST-nkr-loi` (có trong bản mẫu, mở được bằng đường dẫn); ảnh sáng (máy duyệt chạy giao
diện tối).

## Cảnh ngữ-cảnh

- `ST-nkr-hop-tu-ngan--desktop-1280.jpg` — hộp cập nhật mở từ ngăn KR, ngăn KR mở trên trang đơn vị trong khung ứng dụng
  tĩnh (thanh biểu tượng, đầu trang, thẻ con OKR).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Hàng ô số `StatGroup` co còn 2 px khi đặt thẳng trong `SheetBody` dạng flex (nó có `overflow-hidden` nên bị co):
  bọc thân ngăn trong một `div` thường. Ngăn thật dễ gặp đúng bẫy này — S3 dựng thân ngăn cùng cách.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `TargetLineChart` chưa có dấu riêng cho điểm xem trước: điểm mới trông như một lần cập nhật cũ, chỉ phân biệt bằng
  nhãn trục «Hôm nay» và dòng chữ dưới. Đề xuất: thêm thuộc tính đánh dấu một điểm xem trước (vòng rỗng, nét đứt tới nó)
  trong `packages/ui` ở S3.
- Hộp cập nhật mở từ ngăn KR phủ kín ngăn bằng lớp nền của `Dialog`; người dùng mất chỗ đứng trong lúc gõ. Chấp nhận
  được vì hộp ngắn; đề xuất giữ nguyên, ghi lại để chủ kho thấy.
- Ở 375 bản mẫu dùng `Sheet` (ba phần tư bề ngang); ngăn thật đi qua `DetailSheet`, dưới `md` là `Drawer` — AC-9 đo
  điều đó trên bản thật.
- `design_pass.ds_skill` khai `web-design-guidelines` nhưng skill không có trong phiên: phiên chạy trên từ vựng token
  của kho (`docs/design.md`, `packages/ui`).
