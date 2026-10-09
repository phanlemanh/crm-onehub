# kiem-cheo-sau-gop — thiết kế

Câu hỏi: «một lần gộp vào `onehub` có làm đỏ thêm eval của hồ sơ đã ký nào không» được trả lời MỘT lần mỗi
đêm cho mọi lần gộp từ mốc trước, ngoài mọi lượt ghim lại. Bốn quyết định của anh ở S1 (08/10): chạy lượt đêm
trên máy Mac (luật 32 của đợt sau-14-10), khởi động bằng LaunchAgent, đỏ thì chỉ báo, không giữ bản rút gọn
trong lượt ghim lại, và chuyển lời hứa AC-9 của `tra-loi-tin-nhac` sang hồ sơ này.

## Thành phần

Mọi tệp mã ở `scripts/kiem-cheo/`, hằng ở MỘT tệp `cau-hinh.mjs`.

| Tệp | Việc | Phụ thuộc |
| --- | --- | --- |
| `cau-hinh.mjs` | `KIEM_CHEO`: giờ chạy, ngưỡng `moc` (20 giờ), trần một lượt (`tranLuotPhut` 90 = hạn thuê `s4`), thư mục trạng thái, tên phiên khoá, trần chờ khoá, nhãn LaunchAgent | — |
| `tap-cham.mjs` | hàm thuần: `duongCua(evalsText)`, `khuon(glob)`, `tapCham({hoSo, tepDoi})` → hồ sơ `signed-off`/`machine-cleared` có `paths` chạm tệp đổi (ngoài `_acceptance/`) | — |
| `moc.mjs` | đọc/ghi `moc.json`; `lanGop(git, tu, den)` = merge commit first-parent của `onehub` trong khoảng; `canMoc(mocTruoc, now)` → ngày của lần gộp cũ nhất chưa kiểm khi quá 20 giờ | git |
| `khoa.mjs` | `layKhoa()` / `traKhoa()`: có đợt sống → đơn `xin/kiem-cheo-s4.json` (tệp tạm rồi `mv`, mang `moc` khi có) rồi chờ `khoa/s4/chu.json`; không đợt → `mkdir` khoá tay; bận → `{ban: true, chu}` | `scripts/dieu-phoi` |
| `thu-pham.mjs` | `phanLoai({chayLai, chayTai})`: đỏ ở đỉnh → chạy lại ở đỉnh (xanh = chập chờn) → chạy ở mốc trước (đỏ = đỏ sẵn) → tìm nhị phân trên danh sách lần gộp, trả lần gộp đầu tiên làm đỏ | hàm chạy lệnh tiêm vào |
| `bao.mjs` | ghi `<ngày>.json`; kết quả `do` / `khong-chay-duoc` / `loi` → có đợt: `yeu-cau/kiem-cheo-<n>.json` loai `can-nguoi`, không đợt: `osascript` thông báo | — |
| `doc-lan.mjs` | rút dòng `[lane] <slug> <E>: <lệnh> → exit <mã> (` và mảng mã suite từ stdout+stderr của làn; mẫu dòng kiểm trên `fixtures/lan-that.txt` trích nguyên văn một lượt ghim lại thật, kèm phiên bản feature-loop | — |
| `dem.mjs` | điểm vào: fetch → khoảng gộp → 0 gộp thì ghi «không có gộp mới» và thoát 0 → tập chạm → khoá → dựng cây riêng → làn ghim lại chỉ đo (`resolve-plugin.mjs`, không `--write`) → phân loại → báo → tiến mốc → trả khoá (`finally`) | tất cả |
| `cai.mjs` | `cai` / `go`: sinh plist `~/Library/LaunchAgents/<nhãn>.plist` (StartCalendarInterval 01:00, `RunAtLoad` không, chương trình = đường dẫn tuyệt đối của `bun`, `EnvironmentVariables.PATH` gồm thư mục `bun`/`node`/`git`, log ở `.acceptance-runs/kiem-cheo/launchd.log`) rồi `launchctl bootstrap`/`bootout`; anh chạy lệnh này, máy không | launchctl |

`package.json` gốc thêm `kiem-cheo:cai`, `kiem-cheo:go`, `kiem-cheo:chay`.

## Luồng một lượt

1. `git fetch origin onehub` (hoặc nhánh `--nhanh <ref>` khi phá thử trên nhánh nháp). Mọi lần thoát khác 0 đều đi qua `bao.mjs` với kết quả `loi`. Mốc trước đọc từ `moc.json`; vắng hoặc sha không còn trên first-parent của
   `origin/onehub` → thoát 2 «mốc vắng: chạy `kiem-cheo:chay -- --tu <sha>` một lần», không đoán.
2. Không có lần gộp mới → ghi kết quả `khong-gop-moi`, không xin khoá, thoát 0.
3. Tập chạm rỗng → ghi `xanh` (0 hồ sơ), tiến mốc, không xin khoá.
4. Lấy khoá (mục dưới). Bận → ghi `bo-luot-khoa-ban` kèm chủ khoá, mốc không tiến, thoát 0.
5. Cây riêng `.acceptance-runs/kiem-cheo/cay`: `git worktree add --detach` ở đỉnh (gỡ bản cũ trước),
   symlink `.env`, `bun install --frozen-lockfile`, `bun run db:generate`. Lỗi → `khong-chay-duoc`.
6. Làn ghim lại của kit, chỉ đo, trên cây riêng với các hồ sơ chạm. Suite đỏ ở đỉnh → `khong-chay-duoc`
   (không phân loại được khi nền đỏ).
7. Mỗi eval đỏ đi qua `thu-pham.mjs` (hồ sơ hay eval chưa có ở `T` thì tìm nhị phân từ lần gộp mang nó vào, không xếp «đỏ sẵn»); mỗi lần chạy lại dùng ĐÚNG lệnh làn in ra, cwd là cây được dựng ở sha
   cần thử.
8. Cả lượt có trần `tranLuotPhut`: vượt → dừng cả cây tiến trình (SIGTERM rồi SIGKILL), `khong-chay-duoc` «vượt trần». Báo, tiến mốc tới đỉnh khi kết quả là `xanh` hoặc `do` (đã phân loại hết); `khong-chay-duoc` thì không.
9. `finally`: gỡ cây riêng, trả khoá.

## Khoá

- Có đợt = thư mục đợt có `phat-lich.pid` mà tiến trình còn sống. Đơn `{phien:"kiem-cheo", slug:"kiem-cheo-sau-gop",
  loai:"s4", luc, worktree:<cây riêng>, uoc_phut}` cộng `moc` khi quá 20 giờ; chờ tối đa `KIEM_CHEO.khoa.choToiDaPhut`;
  hết giờ → `bo-luot-khoa-ban`. Trong lúc giữ, nhịp do `giu-nhip.mjs` bọc lượt chạy.
- `scripts/dieu-phoi/lich.mjs`: `xepHang` đọc `d.moc ?? mocCua(hangViec, d.slug)` — một dòng, xin `cham-tep`.
- Không đợt: `mkdir <đợt gần nhất>/khoa/s4` (cách tay ngày 04/10) với `chu.json` của lượt; đã có → bận.

## Báo cáo `<ngày>.json`

`{ngay, tu, den, lan_gop:[sha], ho_so:[slug], ket_qua: xanh|do|khong-gop-moi|bo-luot-khoa-ban|khong-chay-duoc,
do:[{ho_so, eval, loai: do-moi|do-san|chap-chon, lan_gop?, lenh}], ly_do?}`. `do-moi` luôn có `lan_gop`.

## `tra-loi-tin-nhac`

AC-9 giữ các vế `xong` và mã nối, bỏ vế kiểm chéo. E11 → `status: not-run` + `superseded_by:
kiem-cheo-sau-gop#AC-6`. Hợp đồng này nêu thẻ `tra-loi-tin-nhac/E11`. Thứ tự bắt buộc của kit 2.24: con trỏ chỉ
hợp lệ khi hồ sơ này đã `signed-off` và AC-6 có eval thoát 0 trong báo cáo đã ký — nên phần sửa
`tra-loi-tin-nhac` làm SAU Cổng 2 của vòng này, cùng PR, rồi ghim lại hồ sơ đó. `rang/ho-so-cham.mjs` xoá; lõi
của nó sống ở `tap-cham.mjs` và `thu-pham.mjs`.

## Đo

- `node --test scripts/kiem-cheo/*.test.mjs`: kho git giả trong thư mục tạm (vài lần gộp first-parent), hồ sơ giả;
  ma trận viết trước cho rút tập, mốc/`moc`, khoá (đợt giả có `phat-lich.pid` là chính tiến trình kiểm), phân loại
  (hàm chạy lệnh giả theo sha), báo (thư mục đợt giả), plist.
- Răng `rang/pha-thu.mjs`: chạy CHÍNH `dem.mjs` trên kho git giả có ba lần gộp, một hồ sơ đã ký giả có eval script
  đọc một tệp; lần gộp thứ hai làm eval đỏ → kết quả `do-moi` gọi đúng sha lần gộp thứ hai; đối chứng không phá →
  `xanh`. Làn của kit thay bằng làn giả qua biến `KIEM_CHEO_LAN` để răng không tốn giờ máy.

## Không làm

Chạy trên CI · tự hoàn tác · tự mở chip · bản rút gọn trong lượt ghim lại · chạy theo từng lần gộp · chép kit
vào kho.
