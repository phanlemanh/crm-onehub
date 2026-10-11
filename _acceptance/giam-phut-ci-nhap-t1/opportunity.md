---
schema_version: 1
slug: giam-phut-ci-nhap-t1
feature: PR nháp và PR chỉ chạm tệp T1 không chạy job nặng của ci.yml và acceptance.yml; ci-ok xanh khi bỏ qua hợp lệ; push giữ nguyên; luật PR nháp trong CLAUDE.md
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-11T04:08:27Z
prototype:
  base_commit: 27d47de04
  disposition: không dựng bản thử — PR của chính vòng này mở dạng nháp là lượt chạy thật đầu tiên
---

Gốc: chủ kho giao 11/10/2026 (phiên «Thợ P8 · Giảm phút GitHub Actions», bàn giao sang máy này), sau khi đo bằng API
GitHub. Vòng nối tiếp CI1 `giam-phut-acceptance` (#349), vốn đã ghi «bỏ qua CI cho PR nháp hay PR chỉ sửa tài liệu» ở
Out of scope.

## Vấn đề & ai gặp

Kho riêng tư, GitHub tính tiền từng phút và làm tròn lên phút cho mỗi job. Số đo 02–08/10 (chủ kho đo bằng API):

- `ci.yml`: 156 lượt PR cho 94 nhánh (1,7 lượt mỗi nhánh), tổng 3.959 phút. Mỗi lần đẩy: trung vị 26′ trước ma trận ba ô
  (F21 #331, 09/10), 35′ sau.
- `acceptance.yml`: PR 1.460 phút, push 859 phút; 9–10′ mỗi lần đẩy.
- Khoảng 67 phút Actions cho mỗi PR; mỗi lần đẩy khoảng 45′. Phút PR mỗi nhánh (hai workflow, chỉ sự kiện
  `pull_request`) ≈ (3.959 + 1.460) / 94 ≈ 58.
- 27/134 PR gộp 02–11/10 chỉ chạm tệp T1 — mỗi lượt của chúng vẫn tốn đủ 45′.
- Lượt thứ hai trở đi của một nhánh (0,7 lượt mỗi nhánh) phần lớn là đẩy lại trong lúc chuẩn bị trình cổng (gộp
  `onehub`, ghim lại, vẽ bản đồ) — job nặng lặp lại trên cùng mã.

**Người gặp:** anh trả tiền; mọi phiên bị chặn gộp khi chạm mức chi (đã xảy ra 09/10).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bỏ job nặng ở PR chỉ T1 không để lọt lỗi vào `onehub` | `onehub` đỏ sau gộp vì một PR T1 làm hỏng build/test | Tệp T1 là tài liệu và thước đo vendored; `.github/**` luôn tính nặng; đọc tay các lượt đỏ trên `onehub` 7 ngày | Chưa thử |
| 2 | Phiên thật sự mở PR nháp và chỉ chuyển sẵn sàng lúc trình Cổng Bằng chứng | Nháp không tiết kiệm gì; chỉ còn phần T1 | Đếm tỉ lệ PR mở dạng nháp 7 ngày sau gộp | Chưa thử |
| 3 | Đổi hình hai workflow không làm đỏ thêm hồ sơ đã ký nào ngoài năm eval khai thay bởi | Nợ ghim lại rơi vào PR khác | Chạy lại mọi eval đã ký đo hai tệp workflow trên hai cây | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: phút Actions mỗi PR có giảm rõ mà PR sẵn sàng vẫn chạy đủ mọi lệnh kiểm cũ không.
- Kết quả nào là SỐNG: Trong 7 ngày sau khi gộp: phút Actions của sự kiện `pull_request` (ci.yml + Acceptance) trung bình mỗi nhánh ≤ 42 (nền ≈ 58); lượt PR chỉ T1 tốn ≤ 8 phút (nền ≈ 45); mọi lệnh kiểm cũ vẫn chạy ở PR sẵn sàng không T1.
- Kết quả nào là CHẾT: phút PR trung bình mỗi nhánh > 50, hoặc `onehub` đỏ sau gộp vì lỗi mà job nặng bị bỏ qua ở PR (nháp hay T1) lẽ ra bắt được, hoặc một PR sẵn sàng không T1 thiếu lệnh kiểm.
- Timebox: Làm ngay; đo lần đầu 7 ngày sau ngày gộp bằng `bun _acceptance/giam-phut-ci-nhap-t1/rang/do-phut-ci.mjs --tu <ngày gộp> --ngay 7`. Trong khoảng 42–50: iterate (đo tỉ lệ PR nháp).

## Hạng mục cùng lớp

CI1 `giam-phut-acceptance` (đang trong cửa sổ đo 7 ngày tới 16/10 — vòng này không đổi lượt push; trung vị PR của CI1
sẽ giảm thêm vì vòng này, ngưỡng PR ≤ 10 của CI1 vốn đã đạt nên không đổi kết luận). Cache turbo ở `pre-push`
(`TURBO_FORCE`) — tách vòng riêng. Đề xuất kit «PR nháp tới lúc trình Cổng 2» (phanlemanh/acceptance-gate-kit#301,
mốc 25/10) — luật trong `CLAUDE.md` của vòng này là bản tạm tới lúc đó.

## Quyết định Cổng Đáng

2026-10-11T04:08:27Z, chủ kho: «build» — giữ bốn ngưỡng như đề xuất.
