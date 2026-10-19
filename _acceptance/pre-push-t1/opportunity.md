---
schema_version: 1
slug: pre-push-t1
feature: pre-push bỏ test và build khi mọi tệp của lần đẩy là tệp T1; vẫn chạy check-types, lint, lint:slop; verify-gate-shape chấp nhận nhánh này qua một khối khai có lý do trong gate-shape.json
owner: manh@mstar.vn
stage: decided
decision: build
decided_by: manh
decided_at: 2026-10-16T14:56:53Z
prototype:
  base_commit: 773115a69
  disposition: không dựng bản thử — lần đẩy của chính nhánh này là lượt chạy thật đầu tiên
---

Gốc: finding kit `docs/findings/2026-10-16-truy-nguyen-toc-do-m5.md` (nhánh `docs/truy-nguyen-toc-do-vong`),
§5 PA5 và §10.2 mục C-1. Chủ kho duyệt ý định ngày 16/10/2026: «Tôi phê duyệt vậy hãy phân rõ ranh giới để điều
chỉnh phù hợp luôn ưu tiên kit vì nó tác động mọi repo.» §10.2 xếp C-1 vào tầng kho crm, «crm, ngay». Lời mời một
dòng §7.2 mục (1): «pre-push bỏ test + build khi push chỉ chạm tệp T1».

## Vấn đề & ai gặp

`.githooks/pre-push` chạy `check-types → lint → lint:slop → test → build` với `TURBO_FORCE=true` cho MỌI lần đẩy,
trùng 5/5 lệnh nặng của CI và không phân loại T1 (finding §3 H2):

- DA2b: 4 lần đẩy = 55′, riêng `test` 14′50″–15′57″ mỗi lần.
- Đẩy nhánh chỉ có tài liệu của điều phối: 3 × 15′ = 45′.
- Lần đẩy giữ khoá nặng của M5 suốt thời gian đó; các thợ khác chờ.
- CI đã bỏ job nặng cho PR chỉ T1 từ vòng `giam-phut-ci-nhap-t1` (cùng bộ phân loại `.github/scripts/phan-loai.mjs`),
  nên ở PR chỉ T1 pre-push đang chạy NHIỀU hơn CI.

**Người gặp:** thợ và điều phối trên M5 (giờ máy, khoá nặng); chủ kho (giờ tới lời mời cổng).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một lần đẩy chỉ tệp T1 không làm đỏ `test`/`build` mà pre-push lẽ ra bắt | Lỗi lọt lên PR; nhưng CI ở PR chỉ T1 cũng bỏ hai lệnh này, nên không mất chiều đỏ nào so với hôm nay | Dùng lại đúng `quyetDinh` + `tepT1` của CI — một nguồn luật, không glob lần hai | Chưa thử |
| 2 | Lần đẩy có bất kỳ tệp mã nào vẫn chạy đủ năm lệnh | Pre-push xanh giả cho mã | Bài kiểm đẩy thật một commit có tệp mã vào kho tạm, ghim đủ năm dòng `pre-push: bun run …` | Chưa thử |
| 3 | `verify-gate-shape` vẫn chặn được khi `test`/`build` vắng mà KHÔNG có khai | Hook bỏ lệnh im lặng mà không ai thấy | Ca đỏ: bỏ khối khai rồi đẩy chỉ T1 → `verify-gate-shape` đỏ, ghim thông điệp | Chưa thử |
| 4 | Hai răng đã ký ghim nguyên văn dòng vòng lặp của hook (`luoi-day-do-that/rang-hook.sh`, `hinh-cua-luoi/rang-hinh.sh`) vẫn đúng | Hồ sơ đã ký đỏ ở lượt ghim lại kế | Giữ nguyên byte dòng `for task in …; do` và dòng `bun run "$task" …`; đẩy rỗng (sha cũ = sha mới) đi đường đủ năm lệnh | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Không đo được — việc nội bộ của bộ công cụ, không có người dùng cuối để mời phiên nghiệm thu; giờ máy tiết kiệm đã ước ở finding §5 PA (−45′ cho ba lần đẩy tài liệu), và hook in một dòng mỗi lần bỏ để ai cũng thấy.

## Hạng mục cùng lớp

`giam-phut-ci-nhap-t1` (CI bỏ job nặng cho PR nháp và PR chỉ T1 — vòng này mang cùng luật xuống pre-push). Bỏ
`TURBO_FORCE` hay bỏ hẳn `test` khỏi pre-push: bác ở finding §6.1 PA5 («GIỮ-CÓ-SỬA → chỉ nhánh T1»). K-A (kit) giữ
hồ sơ đã ký luôn tươi — không phụ thuộc vòng này.

## Chính sách đợt

Chạm trần 3 lượt → thu phạm vi · đỏ sẵn trên nền → tách vòng vệ sinh · giữ cỡ khi tiêu chí là rào chắn.

## Quyết định Cổng Đáng


2026-10-16T14:56:53Z, chủ kho: «build — giữ dòng «Không đo được» như đề xuất».
