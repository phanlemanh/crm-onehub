---
schema_version: 1
feature: Đoạn tiếng Anh do máy ghi trên tấm hồ sơ tự khai lang="en", để trình đọc màn hình không đọc nó bằng giọng tiếng Việt
slug: khai-lang-gioi-thieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-09-21-khai-lang-gioi-thieu-design.md
---

# Acceptance Contract: khai-lang-gioi-thieu

## Context

Ca đỏ quan sát trên `www.onehub.center`, bản dựng `ff3fb8bf`, ngày 2026-09-18:
đoạn giới thiệu tiếng Anh trên tấm hồ sơ công ty nằm trong `<p>` không có
`lang`, tổ tiên gần nhất khai `lang="vi"`. Đây là tiêu chí AC-7 và AC-14 của hồ sơ
`nhan-ung-dung-noi-tieng-viet` chưa đạt trên prod.

Bản sửa có một nguyên thuỷ mới, `ForeignText` ở `packages/ui`, khai ngôn ngữ của
một đoạn. Mười chỗ trên tấm hồ sơ, dòng thời gian, bảng công ty và bước giai đoạn
đi qua nó. `MetaLine` nhận từng phần kèm tiếng của phần đó thay vì chuỗi trần.

Source input: chủ kho chọn lối «cắt đuôi giữ lõi» cho PR #65 ngày 2026-09-21, qua
phiên điều phối; mã rút từ PR #65 sang commit `946ef000`.

## Criteria

- AC-1: Given một đoạn chữ được dựng qua `ForeignText` với tiếng `en` hoặc `vi`, When nó hiện lên, Then phần tử bao đoạn chữ mang đúng thuộc tính `lang` bằng tiếng đã truyền.
- AC-2: Given một dòng thông tin trên tấm hồ sơ gồm một phần không khai tiếng (vd «Hà Nội, VN») và một phần khai tiếng Anh (vd ngành «Technology»), When dòng hiện lên, Then phần khai tiếng Anh nằm trong vùng `lang="en"`, còn phần không khai không bị khai hộ.
- AC-3: Given một dòng thông tin có hai phần cùng chữ, một phần khai tiếng và một phần không, When dòng hiện lên, Then chữ đó hiện đúng một lần.

## Coverage

- Bỏ coverage-scan — việc một chiều: một ca đỏ đã quan sát, bản sửa đã viết, không có không gian lựa chọn để quét (dòng sổ `descope` «bỏ coverage-scan» trong `decisions.jsonl`).

## Out of scope

- Bộ đo lớn của PR #65: thư mục `rang/` của `ho-so-khai-dung-tieng` và `thuoc-khai-dung-tieng`, răng `mot-duong` trong lệnh cổng, và bản sửa thước `khai-tieng.mjs` của `nhan-ung-dung-noi-tieng-viet`. Chúng ở lại PR #65.
- Dữ liệu người nhập bằng tiếng Việt vào các ô vốn là tiếng Anh do máy ghi. Ô này khai cứng `lang="en"` cho các ô đó; nhận dạng tiếng theo nội dung là việc khác.
- Chấm lại hồ sơ `nhan-ung-dung-noi-tieng-viet` tới PASS. Hồ sơ đó đã mở lại và sẽ đóng bằng quan sát prod sau khi ô này gộp.

## Notes

- **Giới hạn có tên: chỗ gọi không có phép đo máy.** Hai bài kiểm đo cơ chế (`ForeignText`, `MetaLine`), không đo rằng mười chỗ gọi thật sự đi qua cơ chế đó. Riêng đoạn giới thiệu trên tấm hồ sơ công ty — đúng chỗ ca đỏ — được bảo đảm bằng mã (`company-sheet.tsx` bọc `description` trong `ForeignText lang="en"`) và bằng quan sát prod của chủ kho sau khi gộp. Phép đo máy cho chỗ gọi (răng `mot-duong`) sống ở PR #65.
- **Giới hạn có tên: khi trùng chữ, bản đứng trước thắng.** `MetaLine` khử trùng lặp theo chữ và giữ lần xuất hiện ĐẦU. Nếu phần không khai tiếng đứng trước phần khai tiếng cùng chữ, chữ hiện một lần mà không có `lang`. AC-3 chỉ hứa «đúng một lần». Ở mọi chỗ gọi hiện có, hai phần của một dòng khác chữ nhau, nên ca này chưa xảy ra trên màn.
- **Mười chỗ gọi** — để người duyệt đối chiếu:

  | Tệp | Giá trị khai `lang="en"` |
  |---|---|
  | `record-sheet/company-sheet.tsx` | đoạn giới thiệu (ca đỏ) |
  | `record-sheet/company-sheet.tsx` | ngành, qua `MetaLine` |
  | `record-sheet/contact-sheet.tsx` | tóm tắt cá nhân |
  | `record-sheet/record-parts.tsx` | mọi phần `MetaLine` có khai tiếng |
  | `companies/companies-table.tsx` | ô ngành của bảng công ty |
  | `sales-dashboard.tsx` | nhãn trong bảng điều khiển bán hàng |
  | `deals/create-deal-sheet.tsx` | nhãn giai đoạn trong tấm tạo thoả thuận |
  | `crm/deal-stage.tsx` | nhãn giai đoạn |
  | `crm/stage-stepper.tsx` | nhãn giai đoạn ở thanh bước |
  | `timeline/timeline-entry.tsx` | giai đoạn cũ và mới trên dòng thời gian |

- Mã sửa được viết TRƯỚC hợp đồng này (PR #65, rút về `946ef000`). Mỗi phép đo đã phá thử trên vật thật: bỏ `lang` khỏi `ForeignText` thì cả hai bài kiểm đỏ với `Expected: "en"`.
- Repo khai `feature_loop.ui_standards_skill: web-design-guidelines`, nhưng skill đó không có trong phiên này — artifact UI không có đối trọng chuẩn nội ngoài `docs/design.md`. Ô này không đổi thứ gì nhìn thấy được.
