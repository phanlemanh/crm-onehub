# Gói đợt r2 — giai đoạn hai của Điều phối – Thợ

Giai đoạn một (đợt `sau-14-10`, 07–11/10) chạy bằng bộ điều phối crm tự viết, nay đã gỡ khỏi kho. Kết quả và
bài học đã chuyển sang kit thành gói `dieu-phoi` (DP1–DP7). Giai đoạn hai chạy đợt `r2` từ gói của kit trên crm, và
cũng là lần đo «chạy được mà không sửa lõi».

Gói theo khuôn §4.1 của kit: `dieu-phoi.config.json`, `hang-viec.json`, `LUAT-rieng.md`. Hàng lấy từ lộ trình qua
`nguon_hang` (`<tệp>:<mã>`), nên `slug` luôn khớp lộ trình. Đây là bản nháp: chủ kho duyệt hàng, Cổng Đáng (`build`) và
quyền tự merge ở thẻ khởi tạo của `/dieu-phoi:mo-dot r2`, không phải ở đây.

## Mở đợt khi đủ bốn điều kiện

1. Kit đã cắt bản mang gói `dieu-phoi`, và crm đã cài đúng tag của bản đó cho cả bốn gói (`acceptance-gate`,
   `feature-loop`, `diagram-design`, `dieu-phoi --scope project`), cùng số phiên bản.
2. PR chuyển đổi (hồ sơ `chuyen-goi-dieu-phoi`) đã gộp: gỡ bộ điều phối tự viết, bốn khối hook trong
   `.claude/settings.json` và bước kiểm của nó ở `package.json`, `pre-push`, `gate-shape.json`, `acceptance.yml`; nối
   lại `scripts/kiem-cheo/` sang gói kit; khai «thay bởi» cho eval của các hồ sơ đã ký đo bộ cũ; thêm khoá
   `dieu_phoi.goi_dot: docs/plan/dot-{ten}` vào `_acceptance/config.yaml`.
3. Không đợt nào đang chạy: `chan-doan --mo r2` chỉ còn thiếu mục `co-dot`.
4. Ngoài 14/10 và ở quãng lặng (lộ trình kit: đợt thử thứ nhất 26/10).

## Dãy

| Dãy | Việc | Hàng (theo thứ tự) | Mốc |
|---|---|---|---|
| P0 | Việc và Dự án — vá rò quyền | DA0a | 14/10 |
| P1 | Kara trên dữ liệu mẫu | N1 → C, K6a, K2f | R2 20/11 |
| P2 | Lý do căn chỉnh | L2, L3 → L4 | R2 |
| P3 | Vòng đời bản ghi | V2a → V2e, V2b, V2f | R2 |
| P4 | Nếp màn chung | NM1 → NM2 → NM3 (sau K6a), NM4, V2c | R2 |
| P5 | Thoả thuận và onboarding | E6b, E4b, E5 | R2 |
| P6 | Kho tài liệu | cb → l5, l3b | 04/11, R2 |
| P7 | Vệ sinh — có hạn mức | F24, F8, F23 | 30/11 |

Không vào đợt: LT1b, LT2 (máy khác làm), R3 (10, 8b, L, T, K5, 7n), Việc và Dự án sau DA0a.

Worktree của dãy để chỗ giữ `/CHUA-CO-WORKTREE/<dãy>` như gói giai đoạn một. Kit chưa có bước để thợ ghi danh worktree
(đã báo ở bình luận PR kit #301); tới khi có, thợ mở từ chip báo worktree thật cho giám sát điền trước khi nhận dãy.

## Tên và giao tiếp

Chủ kho chỉ nói với `r2 · Giám sát`; vào phiên thợ chỉ khi giám sát gửi thẻ dẫn đường (ký cổng, hộp xin quyền). Tiêu
đề phiên thợ mang trạng thái — `r2·P1 · K3b · chờ anh ký Cổng 2` — nên thanh bên là bảng việc chờ. Chi tiết ở luật
21–27 của `LUAT-rieng.md`.

## Hai chọn lựa có chủ ý

- **Ranh giới tối thiểu.** Mỗi hàng chỉ giữ thư mục hồ sơ của nó. Đơn chạm tệp được máy tự duyệt khi tệp không thuộc
  danh sách bảo vệ, không thuộc ranh giới dãy khác và không có nhánh mở nào đang sửa; giám sát chỉ phán ca tranh chấp.
  Giai đoạn một khai ranh giới chi tiết bằng tay cho từng hàng.
- **Mọi hàng mang `moc`.** Bộ xếp lượt của kit xếp theo mốc; kiểm chéo đêm không khai mốc nên xếp sau mọi thợ, giữ hành
  vi của F26 (`kiem-cheo-chay-quang-lang`) mà không cần sửa lõi.
