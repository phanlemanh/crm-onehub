---
schema_version: 1
feature: Trưởng phòng ban mở trang Lộ trình và thấy đúng lộ trình mới nhất của nhánh chính, kèm giờ lấy, mà trang không phải chờ một bản dựng production
slug: lo-trinh-doc-ban-chup
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, ci]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-14-lo-trinh-doc-ban-chup-design.md
approved_by: Manh Phan
approved_at: 2026-10-14T08:32:39Z
---

# Acceptance Contract: lo-trinh-doc-ban-chup

## Context

Trang Lộ trình (LT1) đọc `LO-TRINH.html` đóng gói lúc dựng app, nên chỉ đọc được đúng kho CRM và không nói lộ
trình được lấy lúc nào. Việc này cho GitHub Actions đẩy khối dữ liệu lộ trình sang CRM mỗi khi nhánh chính đổi
lộ trình, bằng một loại khoá máy mới; CRM giữ một bản chụp mỗi nguồn; trang đọc bản chụp khi nó mới hơn bản
đang chạy, rơi về tệp đóng gói khi không, và hiện giờ lấy. Đây là nền cho LT3 (lộ trình nhiều sản phẩm) và
TH3 (trạng thái tín hiệu). Dựng trên khoá nhiều cấu hình của TH1 (PR #404).

Source input: hàng LT1c `docs/plan/lo-trinh-okr.json` · `_acceptance/lo-trinh-doc-ban-chup/opportunity.md` (Cổng
Đáng: build, Manh Phan 14/10) · thiết kế `docs/superpowers/specs/2026-10-14-lo-trinh-doc-ban-chup-design.md`.

## Criteria

- AC-1: Given chủ kho đã tạo khoá «Đẩy lộ trình» và đặt nó làm bí mật GitHub, When một lần gộp vào nhánh chính đổi lộ trình và lượt Actions chạy xong, Then CRM giữ đúng một bản chụp cho nguồn `crm` mang sha, giờ commit và giờ lấy của lần gộp đó cùng nguyên khối dữ liệu (kể cả phần trang chưa đọc như danh sách tín hiệu), lượt Actions để lại một ghi chú nói kết quả của lượt (nhận, trùng, cũ hơn, chưa cài), và trang Lộ trình hiện nội dung của bản chụp ấy trong vòng một nhịp làm mới mà không cần dựng lại app. (cross-layer)
- AC-2: Given các khoá: khoá «Đẩy lộ trình» còn hiệu lực của chủ hay quản trị, khoá thường, khoá chỉ-kéo tín hiệu, khoá «Đẩy lộ trình» đã thu hồi, khoá «Đẩy lộ trình» của người đã bị gỡ khỏi không gian làm việc, và của người đã bị hạ xuống thành viên, When mỗi khoá gửi một bản chụp hợp lệ, Then chỉ khoá đầu được nhận, mọi khoá còn lại bị từ chối mà bản chụp đang lưu không đổi; và khoá «Đẩy lộ trình» không mở được thủ tục nào khác (tRPC, cầu REST, phiên web). Chỉ chủ hay quản trị tạo được loại khoá này. (cross-layer)
- AC-3: Given một bản chụp gửi đến hỏng — khối không qua khuôn lộ trình, khuôn lạ, thiếu sha hay giờ commit, hoặc lớn quá trần — When máy chủ nhận nó, Then nó bị từ chối nguyên khối với lời nói đúng chỗ hỏng, bản chụp đang lưu không đổi, và kịch bản đẩy thoát khác 0 để lượt Actions đỏ.
- AC-4: Given CRM đang giữ bản chụp của một commit, When một bản chụp của commit cũ hơn hoặc cùng sha đến sau (lượt Actions chạy lệch thứ tự, chạy lại), Then bản chụp đang lưu không bị thay, máy chủ trả «cũ hơn» hay «trùng», và kịch bản đẩy thoát 0.
- AC-5: Given chưa có bản chụp nào (chưa cài khoá), hoặc kho dữ liệu không đọc được, hoặc hàng đang lưu không qua khuôn lộ trình, When người xem mở trang Lộ trình, Then trang hiện lộ trình từ tệp đóng gói như hôm nay, không có màn lỗi, và máy chủ ghi một dòng cảnh báo; và khi bí mật GitHub chưa đặt, lượt Actions kết thúc xanh kèm một dòng nhắc chưa cài.
- AC-6: Given một bản dựng đang chạy và một bản chụp, When trang chọn nguồn, Then trang dùng bản chụp khi bản chụp cùng sha với bản đang chạy hoặc commit của nó sau giờ bắt đầu dựng, và dùng tệp đóng gói trong mọi ca còn lại — bản chụp cũ hơn, ca mơ hồ, và mọi bản Preview — nên trang không bao giờ hiện lộ trình cũ hơn bản đang chạy.
- AC-7: Given người xem ở 1280 px và 375 px, tiếng Việt và tiếng Anh, When trang đọc bản chụp và khi trang rơi về tệp đóng gói, Then trang hiện một dòng nói lộ trình được cập nhật lúc nào theo múi giờ của trình duyệt người xem (không theo múi giờ máy chủ), ca rơi về tệp đóng gói nói rõ là bản dựng, dòng ấy không làm trang cuộn ngang, và dữ liệu lộ trình không bị dịch. (cross-layer)
- AC-8: Given bản chụp mang tóm tắt hồ sơ chỉ chủ kho được xem, When chủ, quản trị, thành viên và người chỉ OKR mở trang Lộ trình đọc bản chụp, Then chỉ chủ thấy phần số liệu của chủ kho, đúng như khi trang đọc tệp đóng gói.
- AC-9: Given hai tuần sau khi giao, When chủ kho chạy lệnh đo độ trễ, Then lệnh in mỗi lần nhánh chính đổi lộ trình một dòng — giờ commit, giờ lượt đẩy xong, độ trễ — chỉ coi là đã đẩy những lượt có ghi chú nhận hay trùng, coi lần đổi có lượt bị huỷ vì lượt mới hơn thế chỗ là được phủ bởi lượt ấy, đánh cờ lần trễ quá 10 phút và khoảng trang đứng ở bản cũ quá một giờ, và một dòng kết luận đạt hay không đạt theo ngưỡng của Cổng Đáng.

## Coverage

- Ngữ cảnh: chân sản phẩm đào từ repo [SUY-TỪ-REPO: docs/plan/pham-vi-vong-tin-hieu-1410.md] [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/lo-trinh/page.tsx] · chân ngành [NGÀNH: Backstage software catalog — nạp tệp khai báo từ kho GitHub, làm mới theo sự kiện đẩy, giữ bản đã nạp khi nguồn hỏng].
- Trục A — chặng dữ liệu: đẩy | nhận | lưu | đọc | hiện [thước CE: sơ đồ kiến trúc của design doc, mỗi mũi tên một chặng].
- Trục B — tình huống: bình thường | khoá sai hay hết quyền | dữ liệu hỏng | đến lệch thứ tự | chưa có bản chụp hay chưa cài | bản chụp cũ hơn bản đang chạy | kho dữ liệu lỗi [thước CE: các nhánh lỗi của TH1 (`khoa-keo-tin-hieu.spec.ts`) + ba trạng thái rơi của LT1 (`doc-trang.ts`)].
- Lớp cắt ngang — vai người xem: chủ | quản trị | thành viên | chỉ OKR [SUY-TỪ-REPO: apps/app/lib/lo-trinh/cho-vai.ts].
- Core (9 ô / 35): đẩy×bình thường → AC-1 · nhận×khoá → AC-2 · nhận×hỏng → AC-3 · lưu×lệch thứ tự → AC-4 · đọc×chưa có/kho lỗi → AC-5 · đọc×cũ hơn → AC-6 · hiện×bình thường+rơi → AC-7 · vai×đọc → AC-8 · đường đo → AC-9.
- Later: nguồn thứ hai và người đẩy là ứng dụng GitHub (LT3) · trang đọc tín hiệu từ bản chụp (TH3) · màn trạng thái đường đẩy cho chủ kho.
- Never: CRM kéo từ GitHub bằng khoá cá nhân — LT3 cấm khoá cá nhân · đẩy thẳng vào trang đang mở — tải lại là đủ.
- [GIẢ ĐỊNH] Nhánh `onehub` chỉ nhận commit gộp nối tiếp, nên giờ commit sau giờ bắt đầu dựng nghĩa là mới hơn bản đang chạy (AC-6 dựa vào đây).
- [GIẢ ĐỊNH] Khối dữ liệu lộ trình (~216 KB) đi qua cầu REST của API mà không chạm trần thân yêu cầu; vượt thì S3 nâng trần riêng cho đường này.

## Đường đo

- Thước: độ trễ từ gộp tới trang (≤ 10 phút mỗi lần đổi lộ trình) · số từ: giờ commit trên `onehub` (git) ghép giờ xong của lượt Actions `ban-chup-lo-trinh` đã thật sự đẩy — lượt mang ghi chú `nhan` hay `trung` do kịch bản đẩy để lại (lượt «chưa cài» xanh nhưng không tính); lần đổi có lượt bị huỷ vì lượt mới hơn thế chỗ thì tính theo lượt đẩy kế tiếp; cộng nhịp làm mới cache · bảo đảm bởi: AC-9 (lệnh đo), AC-1 (kịch bản đẩy ghi kết quả từng lượt).
- Thước: không lần nào trang đứng ở bản cũ quá một giờ · số từ: cùng bảng, khoảng giữa một lần đổi và lượt đẩy thật kế tiếp · bảo đảm bởi: AC-9.
- Thước: trang không hiện bản chụp cũ hơn bản đang chạy (ngưỡng chết thứ hai) · số từ: không đo trên production — giữ bằng ma trận chọn nguồn của AC-6 trước khi giao, vì trang không ghi lại nguồn đã chọn · bảo đảm bởi: AC-6.

## Out of scope

- Ứng dụng GitHub, danh bạ sản phẩm, bộ chọn sản phẩm và quyền theo sản phẩm — LT3.
- Trang hay ô đọc trạng thái tín hiệu từ bản chụp — TH3 (bản chụp đã giữ sẵn phần đó).
- Lịch sử các bản chụp; chỉ giữ bản mới nhất mỗi nguồn.
- Nút «làm mới» hay màn trạng thái đường đẩy; chủ kho đọc lượt Actions và lệnh đo.
- Đẩy thay đổi vào trang đang mở; người xem tải lại trang.
- Sửa bộ đọc lộ trình chép từ kit (`apps/app/lib/lo-trinh/doc-du-lieu.js`) hay bộ vẽ `LO-TRINH.html`.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Ba câu vòng đời (`docs/vong-doi.md`): dọn — không ai dọn tay, bản mới ghi đè hàng của nguồn; lịch sử — không
  có; danh sách — không hiện trong danh sách nào. Máy đề xuất, chốt ở Cổng Phạm vi.
- Điều kiện mở S3: TH1 (#404) đã gộp `onehub` — LT1c thêm cấu hình khoá thứ ba vào mảng `apiKey([...])` TH1 dựng.
- Tệp chung (đăng crm-onehub#375 trước Cổng Phạm vi): migration `<mốc UTC>_ban_chup_lo_trinh`,
  `.github/workflows/ban-chup-lo-trinh.yml`, `turbo.json` (thêm `VERCEL_ENV`), `apps/app/next.config.ts`,
  `_acceptance/config.yaml` (chỉ thêm khoá executors). Không chạm `scripts/lo-trinh*.mjs` hay tệp chép từ kit.
- LT1c thêm hai dòng miễn vào bảng chỗ đọc khoá của TH1
  (`_acceptance/tin-hieu-tu-ve-kho/rang/bang-duong-doc-khoa.json`) và ghim lại hồ sơ TH1 trong PR này; hợp đồng
  và báo cáo bằng chứng của TH1 không đổi.
- Sau gộp, chủ kho làm một lần: tạo khoá «Đẩy lộ trình» trong Cài đặt › Khoá API; đặt bí mật kho
  `CRM_KHOA_DAY_LO_TRINH` (`CRM_API_URL` đã có từ TH1). Trước đó trang chạy như hôm nay.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-15:
  - Ngoài-1: Ảnh minh hoạ dòng «Cập nhật lúc» trong hồ sơ đến từ hai lần chạy đo nên giờ trên ảnh lệch một phút so với nhật ký đi kèm.
  - Ngoài-2: Hồ sơ chỉ giữ nhật ký của một trong hai lần chạy đo màn, nên kết quả bằng chữ của lần còn lại không kiểm lại được.
  - Ngoài-3: Bài kiểm vai của ngăn hồ sơ (LT1b) bắt bản sao «kèm vai» vì có thuộc tính lạ chứ không vì lộ số liệu chủ kho, nên nó chứng minh yếu hơn vẻ ngoài.
  - Ngoài-6: Khi trang rơi về bản dựng, phép đo màn chưa chứng minh giờ hiện ra đúng là giờ của bản dựng, chỉ chứng minh mọi múi giờ cùng một mốc.
  - Ngoài-7: Lệnh đo độ trễ được thử trên ghi chú lượt dựng tay theo khuôn bên đọc, chưa có mẫu ghi chú thật do lượt Actions để lại.
  - Ngoài-10: Lệnh đo độ trễ đọc phản hồi của GitHub mà không kiểm khuôn; dữ liệu sai dạng cho lỗi khó hiểu thay vì câu giải thích.
