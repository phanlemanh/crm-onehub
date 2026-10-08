# Quét không gian tiêu chí — K6b `kara-trang-thai-toan-crm`

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub (OneHub Center), người dùng là nhân viên bán hàng và quản lý — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: CONTEXT.md], [SUY-TỪ-REPO: docs/ai-ux.md], [SUY-TỪ-REPO: docs/vong-doi.md],
  [SUY-TỪ-REPO: .acceptance-runs/dieu-phoi-1410/nguon/lai-thu-prod-0410/khao-sat-dong-nhat.md] (mục 5, 6, 12).
- Chân ngành: [NGÀNH: Material Design — Snackbar] (thông báo hành động vừa làm kèm một nút «Undo», tự tắt sau vài giây;
  hành động lùi được thì không hỏi trước mà cho hoàn tác sau) · [NGÀNH: Nielsen Norman Group — Error-Message Guidelines]
  (lỗi phải nhìn thấy được, nói bằng ngôn ngữ người dùng, kèm cách sửa — một vùng lỗi trông như rỗng là vi phạm lớp
  «visibility»).
- Preset `entity-feature` không khớp trọn: K6b là lớp chạy ngang (trạng thái tải/lỗi/rỗng, lưu trữ–khôi phục) của nhiều
  vùng, nên dựng trục riêng (B1).

## Trục

- **A. Vùng** (mỗi vùng là một chỗ người dùng gặp dữ liệu hoặc phản hồi của một hành động): dòng thời gian | hoạt động
  trên website | 30 ngày đầu (kế hoạch cá nhân) | tóm tắt tuần | toast lưu trữ (cá nhân, công ty, thoả thuận) | bước Kara
  | chữ (toast tạo, «Sửa mục tiêu», lời cảm ơn) — [thước CE: bảng mục 6 của khảo sát 04/10 + hàng K6b của
  `de-xuat-lo-trinh.md` + Ngoài-5 của K4].
- **B. Trạng thái**: đang tải | lỗi | rỗng thật | có dữ liệu / thành công | hoàn tác thành công | hoàn tác lỗi — [thước
  CE: bảng mục 7 ai-ux + chuẩn NN/g + Material Snackbar].
- **C. Khổ × ngôn ngữ**: 1440 tiếng Việt | 390 tiếng Việt | tiếng Anh — [thước CE: luật kho «tiếng Việt qua lib/messages»,
  ảnh 390 của mọi vòng UI trước].

## Không gian (lát theo trục A; ô vô nghĩa gạch)

| Vùng | đang tải | lỗi | rỗng thật | thành công | hoàn tác ✓ | hoàn tác ✗ |
| --- | --- | --- | --- | --- | --- | --- |
| dòng thời gian | giữ Spinner | **Core** | giữ (đã đúng) | giữ | — | — |
| hoạt động web | **Core** | **Core** | giữ (ẩn, không phải lỗi) | giữ | — | — |
| 30 ngày đầu | **Core** | **Core** | giữ (ẩn) | giữ | — | — |
| tóm tắt tuần | **Core** (đang soạn) | **Core** | giữ | lời cảm ơn **Core** | — | — |
| toast lưu trữ ×3 | — | giữ toast lỗi cũ | — | **Core** | **Core** | **Core** |
| bước Kara | giữ | giữ | — | **Core** (chưa lưu ≠ xong) | — | — |
| chữ | — | — | — | **Core** ×3 | — | — |

Trục C là lớp chạy ngang cho mọi ô Core (dưới).

## Core (13 ô trên ~42 ô có nghĩa ≈ 31%)

Cao hơn trần 20% vì K6b là lượt «đồng nhất»: mỗi ô Core là một chỗ khảo sát 04/10 đã gọi tên là sai; không có ô Core
nào do máy tự thêm. Gộp thành 11 tiêu chí.

1. dòng thời gian × lỗi — C4a, lỗi đang hiện như «chưa có hoạt động».
2. hoạt động web × đang tải, × lỗi — C4b, cả hai đang `return null`.
3. 30 ngày đầu × đang tải, × lỗi — C4c, đang `return null` khi tải; lỗi tự dựng.
4. tóm tắt tuần × đang soạn, × lỗi — C5a, ai-ux §7.
5. tóm tắt tuần × lời cảm ơn — (e), ai-ux §8.
6. toast lưu trữ × thành công, × hoàn tác ✓, × hoàn tác ✗ — (f), vong-doi «toast luôn có Hoàn tác»; anh chọn (a).
7. bước Kara × chưa lưu — Ngoài-5 của K4.
8. chữ × toast tạo, × «Sửa mục tiêu» — (d), (c).

## Later

- Hoàn tác lưu trữ ở bảng / thao tác hàng loạt / Kanban / Cài đặt; dải báo bản ghi đã lưu trữ — V2.
- Khung bản ghi phân biệt đã xoá / không quyền — K4b.
- Tóm tắt quản trị (`tom-tat-quan-tri.tsx`) lỗi bằng `Alert` + nút xs — cùng lớp với ô 4 nhưng không trong hàng K6b.
- Lỗi khi «Tải thêm» trang sau của dòng thời gian.
- [NGÀNH: Material Design — Snackbar] phím tắt hoàn tác (Ctrl/⌘+Z) cho toast — chưa ai trong khảo sát vấp.

## Never

- Rỗng thật của hoạt động web / 30 ngày đầu hiện khung — ẩn mục là đúng khi không có gì; hiện khung rỗng chỉ thêm nhiễu.
- Hỏi lại trước khi lưu trữ — `docs/vong-doi.md`: lưu trữ không hỏi, Hoàn tác thay cho câu hỏi.
- Lý do «không lưu» của tác tử dịch tại giao diện — chữ do tác tử sinh, dịch ở giao diện là đoán.

## Cross-cutting áp mọi ô Core

- Tiếng Việt qua `lib/messages`, không chữ cứng; không in thông điệp lỗi thô; không gợi ý cho lập trình viên.
- «Thử lại» là `KaraRetry` (nút duy nhất, ai-ux §10); bấm khi đang tải không gọi chồng.
- 390: không tràn ngang trong ngăn.
- Tiếng Anh vẫn có bản tương ứng (cặp khoá en/vi).
