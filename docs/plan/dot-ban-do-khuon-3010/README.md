# Gói đợt ban-do-khuon-3010 — làn Mac Studio

Mở 31/10 theo việc giao MBP-3110-1 (MacBook Pro → Mac Studio trên #375): chủ kho muốn Mac Studio chạy thử bản đồ khuôn
ở crm. Chủ kho chọn «BK chạy trước» 31/10: BK1 → BK2 đi trước SV9, SV10 của bản phạm vi `okr-ghi-trong-ngan-3010`. Gói
theo khuôn §4.1 của kit: `dieu-phoi.config.json`, `hang-viec.json`, `LUAT-rieng.md`. Hàng lấy từ lộ trình qua
`nguon_hang`. Chủ kho duyệt hàng, Cổng Đáng và quyền tự merge ở thẻ khởi tạo của `/dieu-phoi:mo-dot ban-do-khuon-3010`.

Bối cảnh: `docs/plan/pham-vi-ban-do-khuon-3010.md`, trang tri thức `crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md`.

## Dãy

Dọn dẹp trước lộ trình chính (`docs/plan/don-dep-3110.md`, chủ kho 31/10 «Đồng ý theo khuyên») thêm bảy hàng vào đợt
(bản phạm vi `docs/plan/pham-vi-don-dep-3110.md`) và đưa SV9, SV10 vào dãy K. Thứ tự giữa hai dãy đọc từ `dung_tren` của
lộ trình: F37 đứng trên BK1 và BK3 (B11), F38 đứng trên F37.

| Dãy | Hàng (theo thứ tự) | Ghi chú |
|---|---|---|
| K | F37 CI hết đỏ cố định → SN1 thước thiết kế xanh rỗng → BK1 khung chung ngăn bản ghi → BK2 răng giữ khung ngăn → BK5 răng vẽ tay → SV9 sửa tại chỗ mục tiêu và KR → SV10 bằng chứng KR một lối | F37 đi đầu; SN1 là T1, chung `docs/design.md` với BK1 nên ở dãy này; vùng record-sheet của M5; BK2 gồm BK4 và thêm tiêu chí cấm `Sheet`, `Dialog` thô; BK5 chung `tools/oxlint` với BK2 |
| L | BK3 răng khung trang mở → BK6 răng hàng công cụ | BK3 chờ F37 (dãy K) gộp; nối nhánh `chore/rang-khung-trang-mo`; BK6 dùng lại lối quét trang |
| D | SN2 hex trang giới thiệu → F38 paths chết chín hồ sơ → F39 ngưỡng Cổng Giá trị mặt giao diện | Không chạm vùng K, L; SN2 song song F37; F38 chờ F37 gộp; F39 đi sau PR B6 |

B14: BK5, BK6 không chặn SV9, SV10 trong lộ trình (luật chỉ chặn tệp mới); trong dãy K, BK5 đứng trước SV9 theo thứ tự
giám sát giao. NM1 «Khung màn chung» đã gộp #388; bảng ngoại lệ của BK3 chỉ liệt trang còn lệch sau NM1.
