---
schema_version: 1
slug: tin-hieu-tu-ve-kho
feature: Người gửi tín hiệu hôm nay thì sáng mai thấy trang của mình đã đổi sang Đội sản phẩm đã nhận, mà không ai phải chạy lệnh
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TH1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

> Mở 14/10/2026 từ hàng TH1 của «OKR» (`docs/plan/lo-trinh-okr.json`) bằng `lo-trinh.mjs --mo-o` (kit
> v2.28.0 giải nén từ tag, cùng bản crm đang dùng), nhánh `feat/tin-hieu-tu-ve-kho` cắt từ `origin/onehub`
> `762acca38`. Hàng đứng trên LT2 (#374, đã gộp `b1b08382`), phủ hai mã K1 · K2 của bản phạm vi
> `docs/plan/pham-vi-vong-tin-hieu-1410.md`. Là gốc của TH2 (gom tự chạy) và TH3 (trạng thái sống).

## Vấn đề & ai gặp

Người gửi tín hiệu hôm nay thì sáng mai thấy trang của mình đã đổi sang Đội sản phẩm đã nhận, mà không ai phải chạy lệnh

Vì sao: Bước kéo về hôm nay là lệnh tay bằng khoá quyền chủ và chưa chạy lần nào: 5 tín hiệu trên production (crm-1 đến crm-5) đang nằm ở «Chờ lấy về», vòng tín hiệu chưa từng khép.

**Người gặp:**

- **Người gửi tín hiệu** (mọi phòng ban, mọi vai) — gửi xong thấy «Chờ lấy về» và đứng đó vô hạn. Chữ đổi
  sang «Chờ gom» ngay khi một lượt kéo về đóng dấu tín hiệu trên máy chủ — không cần chờ bản dựng mới.
- **Chủ kho** — người phải nhớ chạy `bun run tin-hieu:keo-ve` với một khoá API mang toàn quyền của mình.

**Đo 14/10:**

| Phép đo | Kết quả |
|---|---|
| Lượt kéo về đã chạy trên production | **0.** 5 tín hiệu (crm-1 … crm-5) ở «Chờ lấy về» |
| Khoá API của CRM làm được gì | Khoá đứng thay chủ khoá trong mọi thủ tục (`enableSessionForAPIKeys`); không khoá nào mang giới hạn quyền. Khoá quyền chủ cất trong lịch chạy = ai đọc được kho bí mật là có toàn quyền quản trị CRM |
| Chữ người gửi thấy đổi khi nào | Ngay khi thủ tục kéo về đóng dấu tín hiệu trong CSDL («Chờ lấy về» → «Chờ gom»). Không phụ thuộc tệp đã vào nhánh chính hay chưa |
| Kéo lại có mất tín hiệu không | Không: thủ tục trả MỌI tín hiệu còn lại mỗi lần, lệnh không ghi đè tệp đã có (AC-8 của LT2). Một lượt hỏng giữa chừng được lượt sau vá |
| Tác vụ GitHub có tự mở PR được không | **Không.** Kho đặt quyền mặc định của tác vụ là chỉ đọc và **cấm tác vụ tạo PR**. Tác vụ vẫn xin được quyền đẩy nhánh trong tệp lịch chạy |
| Gộp vào `onehub` | = dựng lại production. Từ 13/10 chỉ gộp trong **cửa sổ đầu giờ UTC chẵn**, theo lô do điều phối xếp, mỗi lần gộp báo ở #375. Gộp chen giữa lô đã đo được giá (#375: 4 PR phải gộp lại và ghim lại, một lần ký lại) |
| Nơi chạy lịch | GitHub Actions của `crm-onehub` đang chạy (lượt Acceptance 02:00Z hôm nay xanh). Máy cá nhân không bật suốt đêm — loại |

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một khoá chỉ-kéo-tín-hiệu chặn được mọi thủ tục khác dù khoá đứng thay một quản trị | Khoá trong kho bí mật vẫn là khoá quyền chủ | Ca đo hai chiều: cùng khoá gọi kéo về → được; gọi một thủ tục khác bất kỳ → bị chặn | Hướng làm, chốt ở S1 |
| 2 | Lịch chạy GitHub hằng ngày đủ tin để giữ «không tín hiệu nào ở Chờ lấy về quá một ngày» | Lượt bị bỏ (Actions tắt vì thanh toán, như 24/09) mà không ai biết | Đếm lượt chạy theo ngày trong lịch sử Actions; lượt hỏng thì đỏ và báo | Đo ở Cổng Giá trị |
| 3 | Người gửi chỉ cần chữ đổi (đóng dấu trên máy chủ); tệp vào nhánh chính lúc nào là việc của gom | Người gửi thấy «Chờ gom» mà đội sản phẩm không có tệp để gom | Lượt gom kế (tay hoặc TH2) đọc được tệp ở nhánh hàng chờ | Phụ thuộc lối chọn dưới đây |

## Câu hỏi lớn: tệp kéo về vào nhánh chính bằng đường nào

Cả hai lối giống nhau ở phần người gửi thấy: lịch chạy hằng ngày lúc 21:00Z (04:00 giờ Việt Nam) gọi thủ tục
kéo về bằng khoá chỉ-kéo → chữ đổi sang «Chờ gom» trước giờ làm. Khác nhau ở chỗ tệp đi đâu sau đó.

| | **Lối A — nhánh hàng chờ, gộp theo lô** *(máy khuyên)* | Lối B — tự gộp thẳng vào `onehub` (như hàng ghi) |
|---|---|---|
| Tệp đi đâu | Đẩy lên một nhánh cố định `tin-hieu/keo-ve`; một PR «Tín hiệu kéo về» đứng mở, tự cập nhật mỗi ngày | Commit thẳng vào `onehub` mỗi ngày có tín hiệu mới |
| Gộp | Điều phối đưa PR vào lô như mọi PR T1, hoặc PR gom của TH2 mang theo | Tác vụ tự gộp, không báo lô |
| Production | Không dựng thêm lần nào | Một lần dựng production mỗi ngày có tín hiệu |
| Luật cửa sổ gộp 13/10 | Giữ nguyên | Phải thêm ngoại lệ: tác vụ dời base ngoài lô, PR đã ký đang chờ phải gộp lại |
| Quyền của tác vụ | Đẩy được một nhánh phụ | Đẩy được thẳng nhánh production (nhánh không được bảo vệ) |
| Cài một lần (chủ kho) | Tạo khoá chỉ-kéo · đặt hai bí mật của kho · máy mở PR hàng chờ một lần | Như A, trừ PR |
| Đảo ngược | **Rẻ** — đổi sang B chỉ là đổi đích đẩy trong tệp lịch chạy | Rẻ về mã; commit đã lên production thì nằm lại |

Máy khuyên **Lối A**: lời hứa với người gửi («sáng mai thấy đã nhận») đạt như nhau ở hai lối, vì chữ đổi do
dấu trên máy chủ; lối B chỉ mua thêm việc tệp nằm sẵn trong `onehub`, và trả bằng một lần dựng production mỗi
ngày, một ngoại lệ cho luật cửa sổ, và một tác vụ ghi được thẳng nhánh production. Hàng TH1 ghi «tự gộp» từ
trước khi có luật cửa sổ (13/10) — nên đây là câu chủ kho chốt, máy không tự đổi hàng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: vòng tín hiệu có tự khép mỗi ngày mà không ai chạy lệnh không?
- Kết quả nào là SỐNG: hai tuần liền kể từ ngày lên production, mỗi ngày có một lượt kéo thành công; không tín hiệu nào nằm ở «Chờ lấy về» quá một ngày (đo bằng giờ gửi và giờ đóng dấu của từng tín hiệu trong CSDL).
- Kết quả nào là CHẾT: có ngày không lượt nào chạy mà không ai được báo; hoặc khoá của lịch chạy gọi được một thủ tục ngoài kéo về.
- Timebox: hai tuần kể từ ngày lên production.

## Kết quả prototype

Không dựng trước Cổng Đáng. Phần chạm màn hình (chọn kiểu khoá khi tạo khoá API ở Cài đặt) làm bản bấm được ở
nghi thức thiết kế cuối S1, trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Lệnh kéo về, khuôn tệp tín hiệu | crm `scripts/tin-hieu/keo-ve.ts`, `packages/validation/src/tin-hieu.ts` (LT2) | triết-lý/logic | có — dùng nguyên, không đổi khuôn | |
| Giới hạn quyền của khoá | `@better-auth/api-key` (trường `permissions` của khoá) | thư-viện | có — chốt ở S1 | |
| Lịch chạy | GitHub Actions `schedule` của `crm-onehub` | hạ-tầng | có | |

## Cổng 0

**Máy khuyến nghị:** `build`, **Lối A**, ngưỡng như trên. Hạng T3 (khoá API, xác thực). Ước 8–10 tiêu chí.

## Thước đo thành công → ứng viên criterion

1. Quản trị tạo được một khoá «chỉ kéo tín hiệu về kho» ở trang khoá API; trang nói rõ khoá làm được gì.
2. Khoá đó gọi kéo về được; gọi bất kỳ thủ tục nào khác thì bị chặn — kể cả khi chủ khoá là chủ sở hữu.
3. Khoá thường cũ vẫn chạy như trước.
4. Lịch chạy hằng ngày gọi lệnh kéo về bằng khoá chỉ-kéo; chạy tay được bất kỳ lúc nào.
5. Có tín hiệu mới → tệp lên nhánh hàng chờ; không có → không commit rỗng.
6. Lượt hỏng (thiếu khoá, CRM lỗi, tệp lệch byte) → lượt đỏ, không đẩy gì, chủ kho được báo.
7. Tệp trên nhánh hàng chờ đúng khuôn kit, không mang tên người gửi (giữ luật LT2).
8. Dòng tổng kết của lượt kéo in tuổi lớn nhất của tín hiệu lúc được đóng dấu — số cho ngưỡng.

## Out of scope từ khám phá

- Gom nhóm tự chạy, PR «Đợt tín hiệu» — hàng TH2.
- Trạng thái sau gom đọc từ nguồn sống — hàng TH3.
- Quản trị gỡ tín hiệu rác trước khi kéo — hàng TH5.
- Thông báo cho người gửi khi đổi chỗ — hàng TB1/S2.
- Khoá API theo quyền tổng quát (nhiều phạm vi tuỳ chọn) — vòng này chỉ một kiểu khoá hẹp.
