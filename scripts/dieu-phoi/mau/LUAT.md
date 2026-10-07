# Luật đợt <tên>

Phiên giám sát là phiên duy nhất được sửa tệp này. Các phiên thợ đọc nó trước S1.

## Cách xin tài nguyên
- Xin lượt: ghi `xin/<phiên>-<loại>.json` = `{phien, slug, loai, luc, worktree, uoc_phut, mo_merge?}`;
  `loai` ∈ `s4`, `ghim-lai`, `duong-nen`, `merge`. Rồi chờ bằng lệnh nền
  `until jq -e '.phien=="<phiên>"' <thư mục đợt>/khoa/<tài nguyên>/chu.json >/dev/null 2>&1; do sleep 15; done`.
- Nhả lượt: `rm -rf <thư mục đợt>/khoa/<tài nguyên>`.
- Việc nền dài khi đang giữ khoá: chạy qua lệnh bọc, ví dụ
  `node scripts/dieu-phoi/giu-nhip.mjs -- node <đường>/repin-lane.mjs --root . --slug <slug> --write`.
  Lệnh bọc chạm tín hiệu sống của khoá mỗi phút tới khi lệnh con thoát, rồi trả đúng mã thoát của
  nó. Không bọc thì trong lúc anh chờ không có lời gọi công cụ nào, tín hiệu sống cũ dần, và khoá bị
  thu hồi giữa chừng. Hook chặn lệnh nặng chạy nền chưa bọc và in sẵn dòng lệnh đã bọc để chép.
- Yêu cầu: ghi `yeu-cau/<phiên>-<số>.json` = `{phien, loai, hang, noi_dung, luc}`; trả lời ở
  `tra-loi/<phiên>-<số>.json`. Loại: `cham-tep`, `viec-phu`, `hang-moi`, `chuyen-hang`, `s4-gom`,
  `gia-han`, `can-nguoi`, `khac`.
- Gia hạn: yêu cầu `gia-han` với `noi_dung: {uoc_phut, tai_nguyen}`. `uoc_phut` là số phút xin thêm;
  `tai_nguyen` (`s4`, `duong-nen`, `merge`) bắt buộc khi đang giữ nhiều khoá. Máy duyệt khi phiên đang
  giữ đúng khoá đó và ước trong trần; được duyệt (bởi máy hay giám sát) thì hạn thuê kéo dài đúng số
  phút đó, tính từ hạn còn lại (hạn đã qua thì tính từ lúc áp).
- Hàng kế: đọc `tiep/<phiên>.json`.
- Không tự gọi `spawn_task`: việc phụ đi qua yêu cầu `viec-phu`.

## Thứ tự gộp khi tranh chấp

## Nhật ký
