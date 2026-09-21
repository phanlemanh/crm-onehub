---
schema_version: 1
slug: khai-lang-gioi-thieu
feature: Đoạn tiếng Anh do máy ghi trên tấm hồ sơ tự khai lang="en", để trình đọc màn hình không đọc nó bằng giọng tiếng Việt
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-21T22:14:16Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Gốc: hồ sơ `_acceptance/nhan-ung-dung-noi-tieng-viet`, tiêu chí AC-7 và AC-14.

Chủ kho quan sát trên bản chạy thật `www.onehub.center` ngày 2026-09-18, bản dựng
`ff3fb8bf`. Trên tấm hồ sơ công ty, tab Tổng quan, đoạn giới thiệu tiếng Anh nằm
trong một `<p>` không có `lang`, và tổ tiên gần nhất khai `lang="vi"`. Trình đọc
màn hình đặt tiếng Việt vì thế đọc cả đoạn bằng bộ phát âm tiếng Việt.

Chủ kho đã ghi ca đỏ này ngay trong dòng quan sát của hồ sơ gốc
(`d-20260921T142711Z-21`), rồi mở lại hồ sơ đó bằng `d-20260921T151920Z-22`.

**Người gặp:** nhân viên đọc tấm hồ sơ công ty, cá nhân hay thoả thuận bằng trình
đọc màn hình, trên giao diện tiếng Việt.

Bản sửa đã viết xong trên PR #65 và được rút riêng sang nhánh này (commit
`946ef000`). PR #65 còn mang cả một bộ đo lớn chưa gộp được; ô này chỉ đưa bản
sửa lên prod.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Giá trị tiếng Anh trên tấm hồ sơ là dữ liệu máy ghi (giới thiệu, ngành, tóm tắt liên hệ), nên khai cứng `lang="en"` là đúng | Một công ty có giới thiệu tiếng Việt sẽ bị khai sai thành tiếng Anh | Đọc nguồn dữ liệu: giới thiệu do tác tử làm giàu ghi bằng tiếng Anh | Đã thử khi viết PR #65 |

## Ngưỡng chết / ngưỡng UAT

Không đo được — ô này sửa một ca đỏ đã quan sát của hồ sơ gốc, không đưa giá trị mới cho người dùng; ngưỡng của giá trị đó thuộc hồ sơ `nhan-ung-dung-noi-tieng-viet`, và phép thử thực tế là chủ kho quan sát lại trên prod sau khi gộp, bằng `/acceptance-gate:observed`.

## Kết quả prototype

Không dựng prototype. Mã đã có sẵn từ PR #65.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Không có vật liệu ngoài repo | — | — | — | — |
