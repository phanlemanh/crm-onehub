# Quét độ phủ — tro-ly-okr-tom-tat (9c)

Preset: `entity-feature` (thực thể: một bản Tóm tắt tuần của một phòng ban) + `risk-premortem`.

## Ngữ cảnh

- Sản phẩm: CRM OneHub, khu OKR — chân sản phẩm: đào repo [SUY-TỪ-REPO: CONTEXT.md; docs/plan/lo-trinh-tro-ly-okr.md; docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md] · chân ngành: [NGÀNH: WorkBoard — «AI memo» đầu trang họp, theo 12-kien-truc §2.2 mục 3] · [NGÀNH: Tability — scheduled prompts/AI summary, theo 12-kien-truc §1, F12] · [NGÀNH: shadow deployment của mô hình ML — chế độ ẩn trước khi bật].

## Trục

- **Trục A — vòng đời một bản:** xếp lịch · dựng gói · kiểm & ghi · hiện trên bảng · báo trong nhắc · phản hồi · đo  [thước CE: trình tự §4.6 của thiết kế 12; bảng «Số đo» §4.9]
- **Trục B — ai × nấc:** thành viên phòng · Trưởng phòng ban · người ngoài phòng · vai «chỉ OKR» · quản trị chương trình · máy — × tắt · chế độ ẩn · bật  [thước CE: §4.7 thiết kế 12; AC «một phép đo mỗi đường vào» của `vai-chi-okr`]
- **Trục C — hình dạng tuần:** có KR đáng bàn · có cập nhật mà không đáng bàn · không cập nhật nào · Mục tiêu giới hạn trong phòng · hai chu kỳ chồng (năm + quý) · ghi chú trộn Anh–Việt  [thước CE: kịch bản `deu/cham/tut/bo/vuot/ghi-chu/chua-gui` của bộ OKR mẫu, SUY-TỪ-REPO: apps/api/scripts/okr-mau/dien-bien.ts]
- **Trục D — kiểu hỏng:** số lệch · chiều sai · nguồn ngoài gói / rò quyền · nêu người · chết im (việc hỏng, chuỗi lịch đứt) · trùng (hai bản một tuần, hai dòng một tin) · vượt tiền  [thước CE: preset risk-premortem; Ngoài-32/33 của 9a, bài học sổ chi phí phiên con]

## Core

1. A·xếp × C·(đáng bàn, không cập nhật, hai chu kỳ) — việc xếp chỉ ghi việc cho phòng có cập nhật, một bản mỗi (chu kỳ, phòng, tuần), tự nối ngày kế.
2. A·kiểm × D·(số lệch, chiều sai, nguồn ngoài gói, nêu người, từ cấm) — bảng ca bộ kiểm đỏ/lành.
3. A·kiểm × D·giữ lại — quá 30% bị bỏ thì «cần xem», không hiện, không báo.
4. A·hiện × B·(thành viên, người ngoài phòng, vai chỉ OKR) × nấc — ma trận thủ tục đọc; chế độ ẩn không lộ.
5. A·hiện × C·Mục tiêu giới hạn — gói chỉ công khai; lọc lúc hiện.
6. A·hiện — trích dẫn bấm ra lần cập nhật gốc (lõi của câu giao), ở 1440 và 390.
7. A·báo × B·Trưởng phòng ban — một dòng, số do luật đếm, không đếm trùng KR im, tắt được, trần hai dòng AI.
8. A·phản hồi — một hàng mỗi người mỗi bản.
9. A·đo × B·quản trị — khối Sức khoẻ thấy mọi bản kể cả giữ lại và ẩn; thước SQL.
10. D·vượt tiền — trần tháng chặn xếp; sổ chi phí ghi đúng nhóm tóm tắt.
11. D·chết im — việc hỏng đóng có mã, không thử lại; chuỗi lịch nối lại khi đứt.
12. Dời luật «đáng bàn» không đổi hành vi.
13. Eval tóm tắt bằng model thật trên bộ mẫu, chốt bằng mã.

## Later

- C·trộn Anh–Việt như ca riêng của eval — bộ mẫu có hai ghi chú trộn; ca riêng khi có ca thật.
- A·hiện × B·Trưởng bộ phận — tóm tắt cấp bộ phận (hạng mục T).
- Tô đúng tuần trong Diễn biến KR khi mở từ trích dẫn.
- Hiệu chỉnh judge với chủ kho — trước khi bật, trên ca thật.

## Never

- Máy tự sửa OKR từ tóm tắt — luật 9a «máy không ghi vào OKR».
- Lời nhắc tự soạn / lịch tóm tắt riêng theo người — lối rò khi chạy nền (§2.3 thiết kế 12).
- Chữ model trong tin Zalo/Slack — luật «không lưu chữ tin Zalo», dòng báo do luật viết.
- Một bản tóm tắt gửi vào kênh Slack của đơn vị — một bản cho nhiều người là lối rò.

## Cross-cutting áp mọi ô Core

- ZDR cho mọi lời gọi model, kể cả judge.
- Không họ tên trong gói; bộ kiểm chặn họ tên trong câu.
- Parse ở biên: `OkrTomTat.cau` và payload đọc bằng khuôn Zod trong `packages/validation`.
- `translate="no"` cho chữ máy viết về dữ liệu người nhập.
