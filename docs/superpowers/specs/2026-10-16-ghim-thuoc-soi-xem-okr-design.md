# ghim-thuoc-soi-xem-okr — thiết kế

Ngày 2026-10-16 · dãy P0 đợt r2 · Cổng Đáng: chủ kho, 2026-10-15T21:30:04Z, «build».

## Vấn đề

Thước E23 của hồ sơ đã ký `gioi-han-duyet-cay-okr` — `bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem` —
liệt mọi lời đọc bảng OKR ở `apps/api/src`, `packages/db/src`, `apps/agent/agent/lib`, và đòi mỗi lời đọc hoặc mang
`dieuKienXemMucTieu` / `boGioiHan`, hoặc có một dòng `MIEN_XEM` kèm lý do. Trên onehub `d086bf8cf` nó đỏ 8 lỗi:

| # | Chỗ | Cổng ở tầng trên (bảng phân loại 15/10) | PR gốc |
|---|---|---|---|
| 1 | `okr.service.ts` `xoaMucTieu` `tho:okrKeyResult` (FOR UPDATE) | `assertSuaMucTieu` → `assertXemMucTieu` | #290 |
| 2 | `okr.service.ts` `xoaMucTieu` `okrObjective.findUniqueOrThrow` | như #1, đọc tiêu đề của chính `mt.id` | #290 |
| 3 | `okr-muc-tieu-lich-su.ts` `lichSuMucTieu` `okrObjective.findMany` | hai người gọi: `xoaMucTieu` sau `assertSuaMucTieu`, `objective` với mục tiêu từ `docMucTieu` có điều kiện xem; trả có/không và lý do | #290 |
| 4 | `okr.service.ts` `mine` `okrObjective.findMany` | chỉ lấy mã theo `vaiCuaToi`; `chiaCuaToi` chỉ lọc danh sách đã đọc bằng điều kiện xem | #300 |
| 5 | `tro-ly.service.ts` `coKrSuaDuoc` `okrKeyResult.count` | gọi duy nhất sau `assertXemMucTieu`; đếm KR của chính người gọi | #342 |
| 6 | `okr.service.ts` `congSuaCanChinh` `okrAlignment.findUnique` | đúng lời đọc `removeAlignment` đã miễn, dời vào hàm chung | #395 |
| 7 | `okr.service.ts` `suaLyDoCanChinh` `okrAlignment.findUnique` | đọc lại cùng `g.id` sau `congSuaCanChinh` | #395 |
| 8 | dòng miễn thừa `removeAlignment#okrAlignment` | hệ quả của #6 | #395 |

Lộ thật 0. Nguyên nhân gốc: E23 chỉ chạy khi ghim lại hồ sơ, không chạy ở CI theo PR; luật chữ «ai gộp sau chạy lại»
ở Notes của hợp đồng để lọt bốn PR (07–14/10).

## Cách làm

**(a) Thước.** Thêm bảy dòng `MIEN_XEM` (#1–#7), mỗi dòng nêu cổng ở tầng trên theo bảng. Dòng của #6 thay dòng
`removeAlignment` (khoá đổi sang `congSuaCanChinh`, lý do giữ chữ đã ký). Không đổi logic của thước. Sau sửa:
`--ca xem` xanh, `MIEN_XEM` 114 dòng (108 − 1 + 7).

**(b) CI.** Thêm một bước vào job `luat-kho` («acceptance gate») của `.github/workflows/acceptance.yml`, ngay sau bước luật
kho, tên «OKR read rule», chạy đúng lệnh của `executors.script.ghd_soi_xem`, có `if: ${{ !cancelled() }}` như các bước sau nó (đỏ luật kho
không giấu đỏ OKR). Job này không có `if` cấp job, không qua bộ phân loại PR, nên bước chạy trên mọi PR (cả nháp) và
mọi push lên `onehub`. Thêm ~2 giây mỗi lượt (đo 15/10: 1,9 s), job đã có `bun install`.

Vì sao `acceptance.yml`, không `ci.yml` hay tệp workflow mới: `CLAUDE.md` khai «CI riêng của công ty sống ở
`.github/workflows/acceptance.yml`»; `ci.yml` là tệp của hãng OneHub đang giữ (luật 47), mỗi dòng thêm vào là phí gộp
bản mới của hãng. Lưới trước-merge chỉ xét hoá cũ cho hồ sơ có thư mục trong diff (đo trên worktree tạm 15/10: sửa
`acceptance.yml` không làm hồ sơ nào khác hoá cũ), nên lối này chỉ kéo ghim `gioi-han-duyet-cay-okr`.

Lọc hay không lọc theo đường dẫn là Hỏi-1 cho chủ kho (`d-20261015T221306Z-7`); bản nháp theo khuyến nghị «mọi PR». Lý do khuyến nghị: phạm vi của thước rộng hơn ba glob của câu giao — nó soi toàn
`apps/api/src`, `packages/db/src`, `apps/agent/agent/lib` (có dòng miễn ở `apps/agent/agent/lib/okr-sheets.ts`, ngoài
`lib/okr/**`), đòi tệp ngoài `okr/` có lời đọc phải khai ở `duong-doc-okr.json`, và đếm định nghĩa `xemDuocMucTieu`
trên cả `apps` lẫn `packages`. Lọc theo ba glob sẽ để lọt đúng các ca ấy; chạy luôn chỉ tốn 2 giây.

**(c) Tài liệu.** `docs/api.md`, đoạn nói `soi-ma.mjs --ca xem` đỏ khi thiếu điều kiện, thêm một câu: job
«acceptance gate» của `acceptance.yml` chạy nó trên mọi PR và mọi push lên `onehub`.

**(d) Ghim lại** `gioi-han-duyet-cay-okr` ở tip nhánh trước gộp (sửa `rang/` của hồ sơ đã ký kéo nó vào diff).

## Đo thế nào

Gương: một gốc giả dưới `.acceptance-runs/ghim-thuoc-soi-xem-okr/`, `apps`, `packages`, `node_modules` là liên kết tới cây
thật, thư mục `rang/` của `gioi-han` là bản chép. `soi-ma.mjs` suy gốc kho từ vị trí của nó, nên bản chép soi đúng mã thật
mà sửa `MIEN_XEM` trên bản chép không chạm cây của hồ sơ đã ký (làn ghim lại dừng nếu cây ấy bị chạm). Đo 15/10: gương
cho đúng 8 lỗi như cây thật.

- Hai chiều của dòng miễn: gương nguyên → xanh; bỏ từng dòng trong bảy dòng → đỏ gọi đúng chỗ đó; trả dòng
  `removeAlignment` → đỏ «MIEN_XEM thua»; xoá chữ một lý do → đỏ «MIEN_XEM thieu ly do»; `--chieu-do` sẵn có vẫn bắt 3/3.
- Bước CI: đọc `acceptance.yml` bằng `Bun.YAML`, kiểm hình bước; chạy CHÍNH chuỗi `run` của bước trong gương: gương nguyên
  → 0, gương bỏ một dòng miễn → khác 0. Năm đột biến chữ của workflow, mỗi đột biến một thông điệp ghim.
- Các thước đang ghim chữ `acceptance.yml` của hồ sơ khác (xanh trên nền) phải còn xanh.

## Đặc tả UX

Không chạm giao diện — bỏ (dòng sổ `descope`).

## Ngoài phạm vi

- Sửa hợp đồng đã ký của `gioi-han-duyet-cay-okr` (dòng Notes «ai gộp sau … chạy lại»).
- Đổi logic soi của thước (khoá miễn theo tệp#hàm#bảng giữ nguyên).
- Biến bước CI thành check bắt buộc — `onehub` không có luật bảo vệ nhánh; đó là cài đặt kho của chủ kho.
- Các `--ca` khác của `soi-ma.mjs` (`thiet-ke`) và thước của hồ sơ khác.
