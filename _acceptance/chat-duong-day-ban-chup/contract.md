---
schema_version: 1
feature: Chỉ onehub đẩy được bản chụp lộ trình lên CRM; đường REST khác giữ trần thân 100 KB
slug: chat-duong-day-ban-chup
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ci]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-10-15
design_doc: docs/superpowers/specs/2026-10-15-chat-duong-day-ban-chup-design.md
---

# Acceptance Contract: chat-duong-day-ban-chup

## Context

LT1c mở đường cho GitHub Actions đẩy bản chụp lộ trình (~216 KB) lên CRM. Để khối đó lọt qua, nó
nâng trần thân của cả cầu REST lên 2 MB, nên mọi đường REST nay đọc tới 2 MB kể cả từ người chưa
đăng nhập (Ngoài-8). Workflow đẩy lại chạy tay được từ bất kỳ nhánh nào, đẩy lộ trình chưa duyệt lên
production rồi làm các lượt đúng từ onehub bị bỏ qua mà vẫn xanh (Ngoài-11). Vòng này thu trần 2 MB
về riêng đường bản chụp và chỉ cho onehub đẩy.

Source input: `_acceptance/lo-trinh-doc-ban-chup/review-findings.md` mục «Ngoài hợp đồng» (Ngoài-8,
Ngoài-11) · `_acceptance/lo-trinh-doc-ban-chup/decisions.jsonl` (d-20261015T084638Z-46, -49) · hàng
LT1d của `docs/plan/lo-trinh-okr.json` · `_acceptance/chat-duong-day-ban-chup/opportunity.md`.

## Criteria

- AC-1: Given một khoá «Đẩy lộ trình» hợp lệ và khối lộ trình rút từ `LO-TRINH.html` thật của cây (thân lớn hơn 100 KB), When Actions gửi nó tới đường bản chụp, Then CRM nhận và lưu bản chụp (trả «nhan»).
- AC-2: Given đường bản chụp, When thân gửi tới là 1,5 MB (khối hợp lệ kèm một trường đệm), Then CRM nhận và lưu như mọi bản chụp hợp lệ; và When thân lớn hơn 2 MB, Then nó bị từ chối 413 như trước vòng này.
- AC-3: Given một đường REST khác nhận POST (`/rest/org/divisions`), When một người chưa đăng nhập gửi thân lớn hơn 100 000 byte (100 001 byte, 150 KB, hơn 2 MB), Then máy chủ từ chối 413 trước khi kiểm quyền; When thân từ 100 000 byte trở xuống, Then thân tới được bước kiểm quyền (trả 401).
- AC-4: Given một người đã đăng nhập, When họ gửi thân 150 KB tới đường REST khác ở AC-3, Then máy chủ cũng từ chối 413 — trần không nới theo người gửi.
- AC-5: Given một yêu cầu bị từ chối vì cỡ ở đường bản chụp và một ở đường khác, When so hai câu trả lời, Then cả hai cùng mã 413 và cùng khuôn lỗi (cùng bộ khoá, cùng `code`), để kịch bản đẩy đọc lỗi như hôm nay.
- AC-6: Given kịch bản đẩy chạy trong GitHub Actions với ref khác `refs/heads/onehub` — một nhánh tính năng, một thẻ, hay thiếu ref — When nó chạy, Then nó dừng mã 1 trước khi kiểm khoá hay gọi CRM (0 lời gọi mạng), in một dòng chú thích lỗi của Actions và một câu nêu ref đã chạy và nhánh được phép.
- AC-7: Given kịch bản đẩy chạy trong Actions từ `refs/heads/onehub` (gộp hay bấm tay), When CRM nhận, Then nó gửi đúng một lời gọi và thoát 0 như trước vòng này; Given chạy ngoài Actions, Then hành vi y như trước vòng này.
- AC-8: Given workflow «Bản chụp lộ trình», When đọc nó, Then nhánh của trigger `push` chính là nhánh mà kịch bản cho đẩy (một nguồn khai), và bước đẩy không tự đặt `GITHUB_REF`.
- AC-9: Given trần thân và đường bản chụp, When đọc mã, Then hai trần (2 MB và 100 000 byte) và đường `/lo-trinh/ban-chup` mỗi thứ khai đúng một chỗ trong cấu hình của khu, router, cầu REST và kịch bản đẩy cùng đọc từ đó, và cầu 2 MB chỉ được chọn khi đường khớp đúng (không theo tiền tố). (judgment)
- AC-10: Given mục «Bản chụp lộ trình» của `docs/api.md`, When người đọc mục đó, Then họ biết trần 2 MB chỉ áp riêng đường bản chụp (đường REST khác giữ 100 KB) và kịch bản đẩy từ chối lượt Actions không chạy từ onehub. (judgment)

## Coverage

Quét bằng morphological-scan, preset test-matrix — hai phần độc lập, mỗi phần một ma trận viết trước.

- Trục đường (phần trần thân): đường bản chụp `/rest/lo-trinh/ban-chup` | đường REST khác nhận POST (`/rest/org/divisions`) [thước CE: `restMeta` của các router — `apps/api/src/lo-trinh/lo-trinh-ban-chup.router.ts`, `apps/api/src/to-chuc/to-chuc.router.ts`; chuẩn ngành: OWASP API Security Top 10 2023, API4 «Unrestricted Resource Consumption»]
- Trục cỡ thân: ≤ 100 KB | 100 KB – 2 MB | > 2 MB [thước CE: `BODY_100_KB` của `trpc-to-openapi` 3.3.0 `adapters/node-http/input.js`; `BAN_CHUP_LO_TRINH.tranThanByte`]
- Trục người gửi: chưa đăng nhập | có phiên | khoá «Đẩy lộ trình» — thân đọc trước kiểm quyền nên trần không được đổi theo người gửi (AC-3, AC-4); khoá chỉ có nghĩa ở đường bản chụp (AC-1, AC-2).
- Ma trận đường × cỡ (8 ô, viết trước): bản chụp {khối thật → nhận · 1,5 MB → nhận · 2 MB + 1 → 413} (AC-1, AC-2) · đường khác {90 000 → 401 · 100 000 → 401 · 100 001 → 413 · 150 000 → 413 · 2 MB + 1 → 413} (AC-3); khuôn lỗi so chéo hai đường (AC-5).
- Trục nơi chạy (phần đẩy): trong Actions | ngoài Actions [thước CE: biến mặc định của GitHub Actions `GITHUB_ACTIONS`, `GITHUB_REF` — tài liệu «Variables reference» của GitHub]
- Trục ref: `refs/heads/onehub` | `refs/heads/<nhánh khác>` | `refs/tags/<thẻ>` | thiếu ref [thước CE: hai sự kiện của workflow — `push` chỉ trên onehub, `workflow_dispatch` lấy ref của nhánh người chọn]
- Ma trận nơi chạy × ref (5 ô, viết trước): Actions × {onehub → đẩy (AC-7) · nhánh khác, thẻ, thiếu ref → từ chối (AC-6)} · ngoài Actions → như cũ (AC-7).
- Gạch: ref `refs/pull/<n>/merge` — workflow không có trigger `pull_request`, không xảy ra (Never). Content-type khác `application/json` — thư viện không đọc thân, không liên quan trần (Never).

## Đường đo

- Thước: không lượt nào ngoài onehub đẩy được · số từ: `gh run list --workflow ban-chup-lo-trinh.yml --json headBranch,conclusion,event` trong 14 ngày sau gộp — mọi lượt `success` có `headBranch` = onehub · bảo đảm bởi: AC-6, AC-7
- Thước: bản chụp CRM đang giữ mang commit trên onehub · số từ: cột `sha` của hàng `BanChupLoTrinh` nguồn `crm` trên production (truy vấn chỉ đọc, theo `docs/production.md`), đọc ngay lúc LT1d gộp và lúc hết 14 ngày, mỗi lần so bằng `git merge-base --is-ancestor <sha> origin/onehub` — bắt cả bản chụp sót từ trước LT1d lẫn lượt chạy tay ngoài Actions · bảo đảm bởi: AC-6, AC-7 (đã có sẵn: bảng của LT1c)
- Thước: đường REST khác của production từ chối thân lớn · số từ: một yêu cầu thử 150 KB không khoá `POST <API production>/rest/org/divisions` trả 413 · bảo đảm bởi: AC-3

## Out of scope

- Đường bản chụp vẫn đọc thân tới 2 MB trước khi kiểm khoá — chỉ một đường, đúng cỡ khối lộ trình; chặn trước khi đọc thân là việc riêng.
- Môi trường GitHub có luật nhánh triển khai (bí mật chỉ tới lượt chạy trên onehub) — thay đổi cài đặt GitHub ngoài kho; xem câu hỏi ở sổ quyết định. Bước chặn sống trong kịch bản của chính nhánh được chạy, nên nhánh rẽ khỏi onehub trong khoảng giữa lúc LT1c gộp và lúc LT1d gộp vẫn đẩy được khi bấm chạy tay; nhánh rẽ sau LT1d thì không.
- Lượt trả «cũ hơn» vẫn xanh — sau khi chặn nhánh, «cũ hơn» chỉ còn do hai lượt onehub đua nhau, đã xếp nối tiếp bởi hàng đợi của workflow.
- Chạy kịch bản đẩy bằng tay trên máy người với khoá thật — ngoài Actions, không chặn.
- Trần thân của các đường `/internal/*` (đã có trần riêng) và của tRPC thường.

## Notes

- Known limits — chọn ở Cổng Bằng chứng 2026-10-16:
  - Ngoài-1: Bài kiểm trần thân đếm cả bảng phòng ban dùng chung, nên có thể đỏ nhầm khi chạy cùng bài của gói khác; chức năng vẫn đúng.
  - Ngoài-2: Kịch bản đẩy bản chụp lấy phần đầu địa chỉ `/rest` từ mã của máy chủ thay vì từ nơi dùng chung.
  - Ngoài-3: Gọi tay đường bản chụp có dấu gạch cuối hay viết hoa khác bị báo quá lớn dù bản chụp không lớn; kịch bản đẩy chính thức không gặp.
  - Ngoài-4: Câu kiểm «không tạo bản ghi» trong bài trần thân không thể đỏ; việc từ chối do mã 401/413 chứng.
- Khoảng hở giữa hai lần gộp: từ lúc LT1c gộp tới lúc LT1d gộp, mọi nhánh lấy onehub trong khoảng đó mang workflow chạy tay được mà chưa có bước chặn. Máy đề nghị điều phối xếp LT1d gộp sát sau LT1c; danh sách nhánh trong khoảng hở đọc bằng `git branch -r --contains <commit gộp LT1c> --no-contains <commit gộp LT1d>`.

- Dựng sau khi LT1c (`feat/lo-trinh-doc-ban-chup`) gộp onehub — mọi tệp sửa đều do LT1c thêm.
- Bài `chay-that` của LT1c chạy `day.ts` thành tiến trình con và kế thừa env của máy; trên CI env có `GITHUB_ACTIONS=true`, `GITHUB_REF=refs/pull/<n>/merge`. Bài đó phải đặt hai biến tường minh, nếu không sẽ đỏ trên CI mà xanh ở máy.
