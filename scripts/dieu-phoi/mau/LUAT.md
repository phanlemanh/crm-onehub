# Luật đợt <tên>

Phiên giám sát là phiên duy nhất được sửa tệp này. Các phiên thợ đọc nó trước S1.

## Cách xin tài nguyên
- Xin lượt: ghi `xin/<phiên>-<loại>.json` = `{phien, slug, loai, luc, worktree, uoc_phut, mo_merge?}`;
  `loai` ∈ `s4`, `ghim-lai`, `duong-nen`, `merge`. Rồi chờ bằng lệnh nền
  `until jq -e '.phien=="<phiên>"' <thư mục đợt>/khoa/<tài nguyên>/chu.json >/dev/null 2>&1; do sleep 15; done`.
- Nhả lượt: `rm -rf <thư mục đợt>/khoa/<tài nguyên>`.
- Yêu cầu: ghi `yeu-cau/<phiên>-<số>.json` = `{phien, loai, hang, noi_dung, luc}`; trả lời ở
  `tra-loi/<phiên>-<số>.json`. Loại: `cham-tep`, `viec-phu`, `hang-moi`, `chuyen-hang`, `s4-gom`,
  `gia-han`, `can-nguoi`, `khac`.
- Hàng kế: đọc `tiep/<phiên>.json`.
- Không tự gọi `spawn_task`: việc phụ đi qua yêu cầu `viec-phu`.

## Thứ tự gộp khi tranh chấp

## Nhật ký
