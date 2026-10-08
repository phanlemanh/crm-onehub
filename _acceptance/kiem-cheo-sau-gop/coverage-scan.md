## Ngữ cảnh

- Sản phẩm: lượt kiểm chéo đêm của kho crm-onehub — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: scripts/dieu-phoi/lich.mjs] [SUY-TỪ-REPO: _acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs]
  [SUY-TỪ-REPO: _acceptance/kiem-cheo-sau-gop/opportunity.md] + bốn câu anh trả lời ở S1 (08/10).
- Chân ngành: kiểm hồi quy sau gộp theo lô rồi tìm thủ phạm — [NGÀNH: git bisect], [NGÀNH: Chromium Findit
  (culprit finder)], [NGÀNH: Google TAP — chạy theo lô, tìm commit gây đỏ]. Ba nguồn cùng tách ba kết cục: đỏ
  chập chờn (chạy lại xanh), đỏ sẵn (mốc cũng đỏ), đỏ mới (tìm được lần gộp gây đỏ).

## Trục

- Trục A — trạng thái khoá khi lượt bắt đầu: có đợt, `s4` trống | có đợt, `s4` bận, chưa quá 20 giờ | có đợt,
  `s4` bận, quá 20 giờ (`moc`) | không đợt, khoá tay trống | không đợt, khoá tay bận
  [thước CE: `scripts/dieu-phoi/lich.mjs` + luật 32 của đợt]
- Trục B — khoảng gộp từ mốc trước: 0 lần gộp mới | 1 | nhiều | mốc vắng hay không còn trong lịch sử `onehub`
  [thước CE: `git log --first-parent origin/onehub`]
- Trục C — kết cục một eval của hồ sơ bị chạm: xanh | đỏ chập chờn | đỏ sẵn | đỏ mới | không chạy được (hạ tầng)
  [thước CE: ngành — git bisect / Findit / TAP]
- Trục D — kênh báo: có đợt (`can-nguoi` vào thư mục đợt) | không đợt (thông báo macOS); tệp ngày luôn ghi
  [thước CE: câu trả lời của anh ở S1, «chỉ báo»]

## Core (≤20%)

1. A·có đợt, trống + C·xanh — đường thường mỗi đêm.
2. A·quá 20 giờ — chống đói khoá, đúng ngưỡng CHẾT «48 giờ không có kết quả».
3. A·không đợt — ngoài đợt vẫn có kết quả.
4. B·0 lần gộp — không xin khoá, không tốn giờ máy.
5. B·mốc vắng — dừng có tên, không đoán mốc.
6. C·đỏ mới với B·nhiều — gọi tên đúng lần gộp gây đỏ bằng tìm nhị phân.
7. C·chập chờn và C·đỏ sẵn — không đổ lỗi oan cho lần gộp nào.
8. C·không chạy được — mốc không tiến, báo hạ tầng.

## Later

- Chạy trên CI (cần chép bộ chạy làn của kit vào kho — chip riêng sang `acceptance-gate-kit`).

## Never

- Tự mở PR hoàn tác — anh chọn «chỉ báo»; hoàn tác chạm production là việc khó-đảo.
- Tự mở chip sửa — tốn token mỗi lần đỏ, ngoài đợt không ai điều phối.
- Bản rút gọn trong lượt ghim lại — anh chọn bỏ; đúng thứ hồ sơ cơ hội muốn cắt.
- Chạy theo từng lần gộp — luật 32 (3): gom theo ngày.

## Cross-cutting áp mọi ô Core

- Không ghi vào cây làm việc của phiên nào: lượt chạy trên cây riêng `.acceptance-runs/kiem-cheo/cay`.
- Luôn trả khoá, kể cả khi lỗi hay bị ngắt.
- Không gọi model trực tiếp; eval model thật đi qua làn ghim lại của kit (cơ chế dùng lại theo băm của F12 tự áp).
- Không chép kit vào kho.
