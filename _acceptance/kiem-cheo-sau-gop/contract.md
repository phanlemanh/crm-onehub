---
schema_version: 1
feature: Kiểm «có làm hỏng hồ sơ đã ký khác không» chạy một lần mỗi đêm cho mọi lần gộp vào onehub từ mốc trước, ngoài mọi lượt ghim lại; đỏ thì gọi tên lần gộp gây đỏ
slug: kiem-cheo-sau-gop
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: draft
approved_by:
approved_at:
design_doc: _acceptance/kiem-cheo-sau-gop/design.md
---

# Acceptance Contract: kiem-cheo-sau-gop

## Context

Cổng Đáng 07/10: kiểm chéo nằm trong lượt ghim lại của `tra-loi-tin-nhac` (E11, `rang/ho-so-cham.mjs`) tốn ~14 giờ
máy cho một PR mà bắt được 0 hồi quy sản phẩm. Ngày 06/10 anh đã đổi E11 sang `judgment`, nên lượt ghim lại hết
tốn, nhưng lời hứa AC-9 («vòng này không làm đỏ thêm eval của hồ sơ đã ký») không còn máy nào giữ. S1 (08/10) anh
chọn: lượt đêm trên máy Mac theo luật 32 của đợt sau-14-10, khởi động bằng LaunchAgent, đỏ thì chỉ báo, không
giữ bản rút gọn trong lượt ghim lại, chuyển lời hứa AC-9 sang hồ sơ này (`tra-loi-tin-nhac/E11` →
`kiem-cheo-sau-gop#AC-6`). Bộ chạy làn ghim lại chỉ có trong bộ nhớ đệm plugin của máy, không trong kho.

## Criteria

- AC-1: Given mốc trước là sha `T` trên first-parent của `origin/onehub` (hoặc của nhánh `<ref>` khi gọi `--nhanh <ref>`, dùng cho phá thử trên nhánh nháp) và đỉnh `D`, When một lượt chạy, Then khoảng gộp là đúng các merge commit first-parent trong `T..D` theo thứ tự, và tập hồ sơ cần đo là đúng các hồ sơ `signed-off`/`machine-cleared` có một glob `paths` trong `evals.yaml` khớp một tệp đổi trong `T..D` ngoài `_acceptance/` — tập rút từ `_acceptance/*/`, không liệt tay.
- AC-2: Given `T..D` không có lần gộp nào, hoặc tập hồ sơ cần đo rỗng, When lượt chạy, Then nó không xin khoá, không dựng cây, ghi kết quả `khong-gop-moi` (hoặc `xanh` với 0 hồ sơ, rồi tiến mốc tới `D`) và thoát 0.
- AC-3: Given `moc.json` vắng, hỏng, hoặc sha của nó không còn trên first-parent của `origin/onehub`, When lượt chạy, Then nó thoát 2 với thông điệp gọi tên lý do và lệnh `kiem-cheo:chay -- --tu <sha>`, không đoán mốc, và vẫn BÁO theo AC-9 với kết quả `loi` (không im lặng).
- AC-4: Given thư mục đợt có bộ phát lịch còn sống, When lượt cần khoá, Then nó ghi đơn `xin/kiem-cheo-s4.json` (ghi tệp tạm cùng thư mục rồi đổi tên), chỉ chạy làn sau khi `khoa/s4/chu.json` ghi `phien: kiem-cheo`, và trả khoá trong mọi kết cục kể cả lỗi; hết thời gian chờ mà khoá vẫn ở phiên khác thì ghi `bo-luot-khoa-ban` kèm tên chủ khoá, không chạy làn, mốc không tiến.
- AC-5: Given lần kiểm có kết quả gần nhất cách hơn 20 giờ, When lượt ghi đơn xin khoá, Then đơn mang `moc` = ngày (YYYY-MM-DD) của lần gộp cũ nhất chưa kiểm; và bộ phát lịch xếp một đơn có `moc` trước đơn `s4` không có `moc` của hàng chưa có mốc (`scripts/dieu-phoi/lich.mjs` đọc `moc` của chính đơn trước `moc` theo slug).
- AC-6: Given eval máy của một hồ sơ trong tập đỏ ở `D`, When lượt phân loại, Then: chạy lại đúng lệnh ở `D` mà xanh → `chap-chon`; vẫn đỏ mà ở `T` cũng đỏ → `do-san`; ở `T` xanh — hoặc hồ sơ/eval đó chưa có hay chưa ký ở `T` (hồ sơ vào trong khoảng) — → `do-moi` kèm sha của lần gộp ĐẦU TIÊN trong khoảng làm lệnh đó đỏ (tìm nhị phân trên danh sách lần gộp của AC-1, bắt đầu từ lần gộp mang hồ sơ vào khi nó vào trong khoảng); kết quả ngày là `do` khi có ít nhất một `do-moi`, và mọi eval máy xanh ở `D` thì kết quả là `xanh` — tức kiểm «các lần gộp trong khoảng không làm đỏ thêm eval của hồ sơ đã ký» (lời hứa thay `tra-loi-tin-nhac/E11`).
- AC-7: Given không thư mục đợt nào có bộ phát lịch còn sống, When lượt cần khoá, Then nó tạo khoá tay `khoa/s4` (kèm `chu.json` của lượt) trong thư mục đợt gần nhất, xoá nó khi xong; khoá tay đã có thì ghi `bo-luot-khoa-ban`, không chạy làn.
- AC-8: Given một lượt cần đo, When nó chạy làn, Then làn chạy trên cây riêng `.acceptance-runs/kiem-cheo/cay` tách ở `D` (và cây ở sha cần thử khi phân loại), không ghi tệp nào vào cây làm việc nơi lệnh được gọi; cây không dựng được, suite của làn đỏ ở `D`, hoặc lượt vượt trần `KIEM_CHEO.tranLuotPhut` (cả cây tiến trình bị dừng, khoá được trả) → kết quả `khong-chay-duoc` gọi tên bước hỏng, mốc không tiến; làn được gọi ở chế độ chỉ đo (không `--write`) với đúng tập hồ sơ của AC-1.
- AC-9: Given một lượt kết thúc với bất kỳ kết quả nào ở AC-2, AC-3, AC-4, AC-6, AC-7, AC-8, hoặc thoát khác 0 vì lỗi bất ngờ (kể cả `git fetch` lỗi), When báo, Then `.acceptance-runs/kiem-cheo/<YYYY-MM-DD>.json` có `ket_qua`, `tu`, `den`, `lan_gop`, `ho_so` và mỗi mục `do` có `ho_so`, `eval`, `loai`, `lenh` (cộng `lan_gop` khi `do-moi`); kết quả `do`, `khong-chay-duoc` hoặc `loi` thì có đợt sống → một tệp `yeu-cau/kiem-cheo-<n>.json` loai `can-nguoi` (ghi tệp tạm rồi đổi tên), không có đợt → một thông báo macOS; không tự mở PR, không tự mở phiên.
- AC-10: Given `bun run kiem-cheo:cai` (anh tự chạy), When chạy, Then nó ghi `~/Library/LaunchAgents/<nhãn>.plist` chạy `kiem-cheo:chay` lúc 01:00 mỗi ngày với thư mục làm việc là gốc kho — chương trình là đường dẫn tuyệt đối tới `bun`, `EnvironmentVariables.PATH` chứa thư mục của `bun`, `node`, `git`, và `StandardOutPath`/`StandardErrorPath` trỏ `.acceptance-runs/kiem-cheo/launchd.log` — rồi nạp nó; lệnh của plist chạy được dưới môi trường trống (`env -i`, PATH hệ thống); chạy lại không sinh bản thứ hai; `bun run kiem-cheo:go` gỡ nạp và xoá tệp.
- AC-11: Given mã của vòng này, When đọc `scripts/kiem-cheo/`, Then làn ghim lại được gọi qua `scripts/resolve-plugin.mjs` (không có bản chép `repin-lane` nào trong kho) và không tệp nào gọi model hay AI Gateway trực tiếp.
- AC-12: Given bản sao `git clone --shared` của chính kho này (lịch sử git thật, 184 hồ sơ thật, `_acceptance/` ~315 MB) với mốc `T` = `feba7e77` và đỉnh `D` = `b633a7e3` (ba lần gộp thật #304, #308, #312), When chạy `dem.mjs` đầu-cuối với làn ghim lại thay bằng làn nhanh in mọi eval xanh, Then lượt thoát 0 với kết quả `xanh`, `lan_gop` đúng ba sha đó, `ho_so` bằng đúng tập rút bằng `evalPathsOf` của kit trên cùng `T..D` và chứa ít nhất một hồ sơ chỉ khai `paths` kiểu một dòng, không lỗi bộ đệm, mốc tiến tới `D`; và cây làm việc nơi gọi lệnh không đổi.

## Coverage

- Trục A — trạng thái khoá khi lượt bắt đầu: có đợt, `s4` trống | có đợt, `s4` bận, chưa quá 20 giờ | có đợt, `s4` bận, quá 20 giờ | không đợt, khoá tay trống | không đợt, khoá tay bận [thước CE: `scripts/dieu-phoi/lich.mjs` + luật 32]
- Trục B — khoảng gộp: 0 lần gộp | 1 | nhiều | mốc vắng/không còn [thước CE: `git log --first-parent origin/onehub`]
- Trục C — kết cục eval: xanh | chập chờn | đỏ sẵn | đỏ mới | không chạy được [thước CE: ngành — git bisect, Chromium Findit, Google TAP]
- Trục D — kênh báo: có đợt | không đợt; tệp ngày luôn ghi [thước CE: lựa chọn «chỉ báo» của anh ở S1]
- Core → AC: A → AC-4, AC-5, AC-7; B → AC-1, AC-2, AC-3; C → AC-6, AC-8; D → AC-9. Khởi động → AC-10; ranh giới kit/model → AC-11; quy mô thật → AC-12; lời hứa cũ → việc sau ký (Notes). Bản quét: `coverage-scan.md`.

## Đường đo

- «0 lượt ghim lại nào chạy kiểm chéo toàn kho» · đếm dòng `repin` trong `run-log.jsonl` của mọi hồ sơ có lệnh `ho-so-cham` sau ngày gộp · việc sau ký ở Notes (E11 không chạy, tệp xoá; chốt bằng `pre-merge-check.sh`).
- «mỗi lần gộp có đúng một kết quả kiểm chéo trong 24 giờ» · các tệp `.acceptance-runs/kiem-cheo/*.json` (`lan_gop` của mỗi tệp) so với `git log --first-parent origin/onehub` · AC-9, AC-10.
- «đỏ gọi được tên lần gộp gây đỏ» · mục `do-moi` có `lan_gop` · AC-6.
- «không giữ `s4` quá trần một lượt khi có phiên đang chờ» · số phút `khoa/s4/chu.json` ghi `phien: kiem-cheo` trong lúc `xin/` còn đơn `s4` của phiên khác (đọc `su-kien.jsonl` của đợt), so với `KIEM_CHEO.tranLuotPhut` · AC-4, AC-5, AC-8.
- «phá thử bị bắt ở lượt đầu» · chạy tay `kiem-cheo:chay -- --nhanh <nhánh nháp> --tu <sha>` trên nhánh nháp có một chỗ phá cố ý → `do-moi` gọi đúng sha · AC-1, AC-6.

## Out of scope

- Chạy trên CI, hay chép bộ chạy làn của kit vào kho (cần chip riêng sang `acceptance-gate-kit`).
- Tự mở PR hoàn tác, tự mở chip sửa — anh chọn «chỉ báo».
- Giữ bản rút gọn của kiểm chéo trong lượt ghim lại.
- Chạy theo từng lần gộp (luật 32: gom theo ngày).
- Tự gom eval model thật theo băm — đó là việc của F12 `eval-model-that-dung-luc`; vòng này chỉ gọi làn qua đúng lối mà F12 sửa.

## Notes

- Việc sau ký, cùng PR (anh duyệt nguyên văn ở Cổng 1 này): sửa hồ sơ đã ký `tra-loi-tin-nhac` — (1) AC-9 thành
  nguyên văn dưới đây; (2) E11 khai `status: not-run` + `superseded_by: kiem-cheo-sau-gop#AC-6` (thẻ
  `tra-loi-tin-nhac/E11` nêu ở đây để kit nhận việc thay); (3) xoá `rang/ho-so-cham.mjs`; (4) ghim lại
  `tra-loi-tin-nhac` một lượt. Kit 2.24 chỉ nhận con trỏ khi hồ sơ này đã `signed-off` và AC-6 có eval thoát 0
  trong báo cáo đã ký, nên việc này không thể làm trước Cổng 2. Chốt máy: `pre-merge-check.sh` (CI) chặn merge
  nếu con trỏ gãy ở bất kỳ điều kiện nào trong chín điều kiện của kit.
- AC-9 mới của `tra-loi-tin-nhac`: «Given A đã nối, When A nhắn `xong`, Then câu trả lời hướng dẫn cú pháp (chứa
  `xong 2`) và không gì đổi; When A nhắn một câu không phải lệnh, Then câu trả lời gồm câu «đã nối» hiện có và dòng
  gợi ý `xong 2`; When A nhắn một mã nối còn sống của chính mình, Then luật nối mã giữ nguyên (liên kết ghi lại, mã
  đã dùng).» Vế kiểm chéo chuyển sang `kiem-cheo-sau-gop#AC-6`. Vế «năm spec Zalo đã ký không bị sửa
  so với merge-base» bị BỎ, không chuyển (dòng `descope` có tên trong sổ): nó là chốt một lần cho chính vòng
  `tra-loi-tin-nhac`, đã đạt khi vòng đó gộp.
