---
schema_version: 1
feature: Trưởng đơn vị mở Mục tiêu và đi giữa Của tôi, Bộ OKR, Lấy ý kiến và Báo cáo bằng một thanh bên, chu kỳ chọn một lần ở đầu thanh, và mọi đường dẫn cũ vẫn mở đúng chỗ
slug: vo-khu-muc-tieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-19T21:48:53Z
design_doc: docs/superpowers/specs/2026-10-19-vo-khu-muc-tieu-design.md
---

# Acceptance Contract: vo-khu-muc-tieu

## Context

Khu Mục tiêu hôm nay đi bằng thanh thẻ ngang Của tôi · Theo đơn vị · Toàn cảnh · Hỏi ý, ô chu kỳ
nằm giữa các nút hành động, và trang đơn vị chồng hai lớp thẻ ngang. Vòng này dựng thanh bên khu
(`AreaSidebar` của VK1) chia theo việc và vật như bản mẫu `/proto/vo-khu-muc-tieu` (`2790552ac`),
đưa ô chu kỳ lên đầu thanh, cho mỗi nơi đến một đường dẫn mới và chuyển mọi đường cũ tới đúng
chỗ. Mang tiêu chí DH11 (đơn vị dẫn khi cây tổ chức lỗi).

«Máy tính» là khổ từ 768px. Đo màn trên phiên đo riêng của cây, dữ liệu mẫu (bộ OKR mẫu khi cần),
tiếng Việt, 1280×800 và 375×812.

## Criteria

- AC-1 (cross-layer): Given một người mở bất kỳ màn nào của khu Mục tiêu ở máy tính, When thanh bên dựng, Then nó là `aside[data-slot=area-sidebar]` nhãn «Mục tiêu» với đúng ba nhóm theo thứ tự — nhóm không nhãn (Của tôi → `/okr`), «OKR» (Bộ OKR → `/okr/bo-okr`, Lấy ý kiến → `/okr/lay-y-kien`), «Báo cáo» (Sức khoẻ → `/okr/suc-khoe`, Sơ đồ → `/okr/so-do`); đúng một mục sáng theo đường đang mở, kể cả đường con (`/okr/so-do/muc-tieu/<id>` sáng Sơ đồ); mục Lấy ý kiến mang số ý kiến cần góp khi số đó lớn hơn 0; chân thanh có «Chương trình OKR» → `/settings/okr` cho người quản lý chương trình và không có cho vai khác.
- AC-2: Given một màn của khu, When người đổi chu kỳ, Then ô chu kỳ nằm ở đầu thanh bên (giữ `data-chon-chu-ky`), không còn trong hàng nút hành động của trang; chu kỳ vừa chọn ghi vào `kyOkr` và mọi liên kết mục trên thanh bên mang theo `kyOkr` ấy, nên bấm sang mục khác vẫn xem cùng chu kỳ.
- AC-3: Given trang Bộ OKR của một đơn vị, When trang dựng, Then trên trang chỉ còn một lớp thẻ ngang — chuyển kiểu xem `xemOkr` (danh sách · cây · họp tuần · chấm điểm) — và không màn nào của khu còn dựng thanh thẻ Của tôi · Theo đơn vị · Toàn cảnh · Hỏi ý.
- AC-4: Given năm đường mới, When mở, Then `/okr/bo-okr` dựng trang đơn vị như `/okr/theo-don-vi` hôm nay, `/okr/lay-y-kien` dựng trang Hỏi ý, `/okr/suc-khoe` dựng nội dung Toàn cảnh và, cho người quản lý chương trình, phần quản trị chương trình ở mục `#chuong-trinh`, `/okr/so-do` dựng Sơ đồ góp vào cả công ty theo chu kỳ, `/okr/so-do/muc-tieu/<id>` dựng sơ đồ quanh một mục tiêu với nút quay lại trỏ `/okr/so-do`.
- AC-5: Given cấu hình `next.config.ts`, When đọc `redirects()` và `rewrites()`, Then mỗi đường cũ có đúng một quy tắc chuyển vĩnh viễn tới đích mới — `/okr/theo-don-vi` → `/okr/bo-okr`, `/okr/hoi-y` → `/okr/lay-y-kien`, `/okr/toan-canh` → `/okr/suc-khoe`, `/okr/toan-canh/suc-khoe` → `/okr/suc-khoe#chuong-trinh`, `/okr/quanh-muc-tieu/:id` → `/okr/so-do/muc-tieu/:id`, `/okr/cap-nhat-tuan` → `/okr` — và mỗi đường mới ngoài `/okr/so-do` có đúng một rewrite về thư mục route cũ; không đích nào của redirect là nguồn của redirect khác.
- AC-6: Given cây đang chạy, When mở các liên kết cũ thật — `/okr/theo-don-vi?donOkr=pb:<id>&xemOkr=hop-tuan&kyOkr=<id>` (tin tóm tắt), `/okr/hoi-y?kyOkr=<id>` (tin nhắc ý kiến), `/okr/toan-canh?kyOkr=<id>`, `/okr/toan-canh/suc-khoe`, `/okr/quanh-muc-tieu/<id>`, `/okr?tu=nhac`, `/okr?record=objective:<id>`, `/okr/soan/<id>` — Then mỗi liên kết dừng ở đúng đường mới với mọi tham số truy vấn giữ nguyên sau nhiều nhất một lần chuyển, đúng mục thanh bên sáng, và màn đích hiện đúng thứ liên kết hứa (họp tuần của đơn vị ấy, phiên cập nhật tuần mở sẵn, ngăn mục tiêu mở sẵn).
- AC-7: Given `apps/app` (trừ `test/`, `app/proto/` và danh sách chuyển hướng của `next.config.ts`), When quét, Then không chuỗi đường nào còn trỏ `/okr/theo-don-vi`, `/okr/toan-canh`, `/okr/hoi-y` hay `/okr/quanh-muc-tieu` — liên kết trong ứng dụng đi thẳng đường mới, không qua chuyển hướng.
- AC-8: Given màn Của tôi của người dẫn đơn vị, When cây tổ chức (`org.tree`) đang tải hoặc tải lỗi, Then khối «Đơn vị bạn dẫn» hiện khung chờ khi đang tải và `LoiPhan` có nút Thử lại khi lỗi; không thẻ nào có tiêu đề rỗng; bấm Thử lại thì tải lại cây.
- AC-9: Given điện thoại 375×812, When mở Của tôi, Bộ OKR và Sức khoẻ, Then không thấy thanh dọc, thấy ô chu kỳ trên một hàng cuộn ngang gồm năm mục, mục đang mở sáng, không nhãn nhóm, không «Chương trình OKR», và trang không tràn ngang; kèm ảnh cho người xem.
- AC-10: Given các lối vào sẵn có của khu, When dùng sau vòng này, Then hành vi giữ nguyên: `?tu=nhac` mở phiên cập nhật tuần rồi xoá tham số, `?record=objective:<id>` mở ngăn mục tiêu, Lấy ý kiến không mang `kyOkr` vẫn mặc định chu kỳ đang lập kế hoạch còn các mục khác mặc định chu kỳ hiện hành, và vai chỉ OKR vẫn vào được mọi mục của thanh.

## Coverage

Quét bằng morphological-scan (preset entity-feature, thực thể «vỏ khu Mục tiêu»), bốn trục:

- Trục nơi đến: Của tôi | Bộ OKR | Lấy ý kiến | Sức khoẻ | Sơ đồ | Mọi KR (VK11) | Cập nhật gần đây (VK12) [thước CE: bản mẫu `khung.tsx` của `2790552ac` và CONTEXT.md mục Báo cáo, Bộ OKR, Sơ đồ — SUY-TỪ-REPO]
- Trục lối vào: thanh bên | liên kết cũ trong app | tin nhắc email/Zalo/Slack (`apps/agent/agent/lib/nhac-ke-hoach.ts`) | ngăn bản ghi | gõ đường [thước CE: báo cáo khảo sát đường và tham số — SUY-TỪ-REPO `apps/agent/agent/lib/nhac-ke-hoach.ts:166-192`]
- Trục khổ: máy tính ≥768 | điện thoại <768 [thước CE: mốc `md` của `AreaSidebar` — SUY-TỪ-REPO]
- Trục vai và trạng thái: quản lý chương trình | trưởng đơn vị | chỉ OKR × đang tải | lỗi | có ý kiến cần góp [thước CE: `nhomCaiDatChoVai`, `canManageProgram`, DH11 — SUY-TỪ-REPO]
- Cắt ngang: chu kỳ đi theo khi đổi nơi (AC-2), mọi đường cũ giữ tham số (AC-5, AC-6).

Core: năm nơi đến × thanh bên (AC-1, AC-4) · chu kỳ (AC-2) · một lớp thẻ (AC-3) · đường cũ ở cấu hình và trên màn thật (AC-5, AC-6) · liên kết trong app (AC-7) · DH11 (AC-8) · điện thoại (AC-9) · lối vào sẵn có (AC-10).

Later: Mọi KR (VK11) · Cập nhật gần đây (VK12) · mỗi bộ OKR một trang (VK3) · khung toàn vùng Sơ đồ (VK6) · đổi đường trong `apps/agent` (VK5).

Never: dời thư mục route — làm chết `paths` của 42 hồ sơ đã ký · mục thanh bên trỏ màn chưa có.

## Đường đo

Ngưỡng của `opportunity.md`: «Trên trang đơn vị chỉ còn một lớp thẻ ngang; mọi đường dẫn cũ (…) chuyển tới đúng chỗ mới».

- Một lớp thẻ ngang: bài DOM đếm lớp thẻ trên trang Bộ OKR và bàn đo màn đếm trên bản chạy — AC-3.
- Đường cũ tới đúng chỗ: bài kiểm cấu hình chuyển hướng (AC-5) và bàn đo mở từng liên kết cũ thật (AC-6).

## Out of scope

- Mọi KR (VK11) và Cập nhật gần đây (VK12): chưa có màn, chưa lên thanh.
- Mỗi bộ OKR một trang, bộ lọc Tất cả · Tôi dẫn · Đang theo dõi (VK3).
- Khung toàn vùng và nút Toàn màn hình của Sơ đồ (VK6).
- Đổi chữ trên màn (VK4) và chữ máy trong tin nhắc, lời dặn Kara (VK5).
- Đổi đường dẫn mà `apps/agent` ghép vào tin nhắc — tin cũ và mới đều đi qua chuyển hướng.
- Ngăn KR duy nhất (VK7).

## Notes

- 42 hồ sơ đã ký đo các đường cũ; chúng mở đường cũ và được chuyển hướng, nên lượt ghim lại sau vòng này cho biết hồ sơ nào đo đường thay vì đo màn.
