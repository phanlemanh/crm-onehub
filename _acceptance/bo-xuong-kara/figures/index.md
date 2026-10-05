# Điểm quyết định ở Cổng Phạm vi — bo-xuong-kara

| Điểm | Đếm | Hình |
|---|---|---|
| Ba điểm cắm cho K2: khối nào giữ điều nào, và luồng bận → khoá → hết bận (d-…-6, AC-6/7/8) | 4 bước nối tiếp + 1 nhánh (đã quyết / chưa quyết) | `diem-cam-k2` |
| Thứ tự làm với PR #231: tệp kara → chờ #231 gộp → tệp chung chỉ thêm → ghim lại → PR (d-…-8, AC-10/14) | 5 bước nối tiếp | `thu-tu-voi-231` |
| Phòng mẫu thay /proto (d-…-1) | dưới ngưỡng: 2 bước | — |
| Kéo artifact + task, không kéo tool (d-…-2, d-…-3) | dưới ngưỡng: 2 nhánh nhưng một bước | — |
| Một cỡ «Thử lại» (d-…-4) | dưới ngưỡng: 1 bước | — |
| Bỏ design-pass (d-…-5) | dưới ngưỡng: 1 bước | — |
| Phần apps/app của tu-vung-tac-tu sang K4/K6a (d-…-7) | dưới ngưỡng: 1 bước | — |
| Bốn dòng [GIẢ ĐỊNH] trong Coverage | dưới ngưỡng: mỗi dòng 1 bước | — |

## Đề bài hình

### diem-cam-k2

- Loại hình: sơ đồ luồng (flowchart) hai làn.
- Làn trái «Trang Soạn OKR của K2 (sau 14/10)»: thanh kéo đổi cỡ chia hai ô — ô hội thoại (KaraTranscript + KaraComposer) và ô bản nháp (KaraArtifact). Ghi chú: «KaraArtifact rộng theo ô, thân tự cuộn».
- Làn phải «Khi Kara đang soạn»: KaraArtifact busy → KaraBusy (một nguồn) → nhánh 1 «đề xuất chưa quyết: mọi nút khoá + lý do «Kara đang soạn»» · nhánh 2 «dòng đã quyết: Hoàn tác khoá» · nhánh 3 «ô soạn: nút Gửi thành Dừng» → hết bận → mọi thứ mở lại.
- Hộp dưới: KaraProposalGroup — «nhãn Kara · N đề xuất một lần, N đếm từ đề xuất còn chờ» → nút «Thêm cả Mục tiêu và KR đã đủ số» (chữ do K2 đưa) → dòng biên nhận nhóm có Hoàn tác.
- AC liên quan: AC-6, AC-7, AC-8, AC-11.

### thu-tu-voi-231

- Loại hình: dòng thời gian (timeline) năm mốc.
- Mốc: (1) S3 dựng tệp mới trong packages/ui/src/components/kara/** + bài kiểm + phòng mẫu · (2) chờ PR #231 (P4) gộp — điều phối 13:05 · (3) gộp onehub; thêm khoá messages, MIEN_TRU, mục so-lech-chuan, dòng chat-ui — chỉ thêm · (4) S4 chấm, rồi ghim lại nen-chat-ai-elements và các hồ sơ bị chạm, một lượt ở đỉnh nhánh · (5) PR --base onehub, không chạm apps/app.
- Nhãn đỏ ở mốc 2: «#231 trễ thì K1 trễ theo — quá 10/10 hỏi điều phối tách phần chung».
- AC liên quan: AC-10, AC-14.
