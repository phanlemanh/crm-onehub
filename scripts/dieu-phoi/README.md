# Điều phối đợt — tầng máy của Orchestrator–workers

Spec: `acceptance-gate-kit/docs/superpowers/specs/2026-10-05-orchestrator-workers-hai-tang-design.md`.
Mã này **không** chứa gì riêng của kho. Mọi giá trị riêng nằm trong `dieu-phoi.config.json` và
`hang-viec.json` của đợt.

## Mở đợt (phiên giám sát làm, sau khi owner duyệt thẻ khởi tạo)

1. `node scripts/dieu-phoi/dieu-phoi.mjs mo <tên>`
2. Điền vào thư mục đợt:
   - `hang-viec.json`: các khối `day` (id, worktree tuyệt đối đã `realpath`, link `claude://` lấy từ
     `list_sessions`) và `hang`;
   - `dieu-phoi.config.json`: `nhanh_chinh`, `bao_ve`;
   - `LUAT.md`: phần riêng của đợt.
3. `node scripts/dieu-phoi/dieu-phoi.mjs chay`
4. Giăng Monitor, timeout 30′, hết hạn thì giăng lại:
   `tail -n0 -F <thư mục đợt>/su-kien.jsonl | grep --line-buffered '"can_phan":true'`
5. Tạo task lịch 30′ với `notifyOnCompletion`. Prompt: «đọc trang-thai.json của đợt <tên>, in một
   dòng». Task này là lưới an toàn khi app khởi động lại.
6. Tạo nhóm «Đợt <tên>» ở thanh bên, ghim phiên giám sát, mở chip cho từng phiên thợ. Lời dặn của
   chip gồm thư mục đợt, mã phiên, ranh giới, và câu «đọc LUAT.md trước S1».

## Trong đợt

- Mỗi nhịp, bộ phát lịch kiểm hình dạng `dieu-phoi.config.json` và `hang-viec.json` (kiểu từng
  trường, đủ `han_thue_phut` cho mọi loại đơn, `bao_ve` là danh sách, không khoá lạ). Sai thì nhịp
  không cấp lượt, không duyệt yêu cầu nào, và ghi một sự kiện `loi-nhip` `can_phan` nêu đúng trường
  sai, cho tới khi tệp được sửa. Bộ phát lịch còn đòi `goc_kho` lúc khởi động.
- Yêu cầu `gia-han` máy không duyệt (vượt trần, phiên giữ nhiều khoá mà không nêu) thì giám sát duyệt
  bằng `tra-loi/<id>.json` như mọi yêu cầu: `ket_qua: duyet` là đủ để nhịp kế kéo dài hạn thuê, một
  lần. Muốn cho số phút khác thì thêm `uoc_phut`; giữ nhiều khoá thì thêm `tai_nguyen`. Không áp được
  (khoá đã sang tay, thiếu số phút) thì có một sự kiện `gia-han-khong-ap` `can_phan`.

- Không dùng `/loop` làm nhịp: phiên giám sát thức dậy nhờ Monitor ở bước 4 và task lịch 30′ ở bước 5 của phần mở đợt, cộng tin của owner.
- Mỗi sự kiện `can_phan`: đọc dòng sự kiện. Với yêu cầu, ghi `tra-loi/<id>.json` gồm
  `{ket_qua, boi:"giam-sat", ly_do, luc}` và một dòng Nhật ký. Với `dich:"owner"`: gom lại, push tối
  đa 1 lần mỗi 30′.
- Mở lại bảng: `<thư mục đợt>/bang.html`. Xem nhanh: `node scripts/dieu-phoi/dieu-phoi.mjs xem`.
- Mỗi lần thức: `dieu-phoi.mjs chay`. Lệnh tự bỏ qua nếu bộ phát lịch còn sống, tự chạy lại nếu
  nó đã chết.

## Đóng đợt

`node scripts/dieu-phoi/dieu-phoi.mjs dong`, sau khi owner duyệt thẻ đóng đợt. Lệnh dừng bộ phát
lịch và gỡ symlink, nên hook im. Sau đó: xoá task lịch, lưu trữ phiên thợ, dọn worktree đã gộp
(kiểm `git status --porcelain` trước), viết báo cáo đợt.

## Đường lùi

`dieu-phoi.mjs dong` là đủ. `LUAT.md` và `khoa/` vẫn dùng tay được theo cách ngày 04/10.
