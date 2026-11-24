# Nâng kit nghiệm thu của crm lên delivery-loop v3.1.1 — thiết kế

Ngày 24/11/2026 · hồ sơ `_acceptance/nang-kit-3-1-1/` · hạng T2 · mẫu: vòng `chuyen-cho-delivery-loop-3-0` (PR #622) và
Quỹ hàng `nang-kit-3-1-1` (phanlemanh/onehub-inventory PR #118).

## 1. Việc

Chủ kho đưa mọi kho trên máy lên kit v3.1.1 «Bản vá chữ ký giữ chỗ» (23/11). Phía máy đã xong: chợ `delivery-loop` ở
`~/.claude/settings.json` trỏ v3.1.1, plugin mức dự án của crm đã cập nhật. Phần còn lại là phía kho: ba chỗ kho ghim
phiên bản kit, cộng lớp CI kho chép từ kit.

Kit đọc theo commit của thẻ: `v3.1.1^{commit}` = `1193bc22`; đối tượng thẻ là `f0b675ea`, không dùng nó để so.

## 2. Phạm vi — danh sách tệp viết trước

| Tệp | Đổi gì | Vì sao |
| --- | --- | --- |
| `.claude/settings.json` | `extraKnownMarketplaces.delivery-loop.source.ref`: `v3.0.0` → `v3.1.1`, không khoá nào khác | phiên mở kho nạp kit theo ref này |
| `.github/workflows/tin-hieu-gom.yml` | `KIT_REF: v3.0.0` → `v3.1.1` | luồng gom tín hiệu clone kit theo thẻ |
| `lib/workspace-record.cjs` | chép lại từ thẻ | lệch byte với 3.1.1 (khoá `ban_do`) |
| `scripts/product-map.mjs` | chép lại từ thẻ | lệch byte (`--day-nhanh-ve`, view ngoài git) |
| `scripts/can-cu-s1.cjs` | chép lại từ thẻ | lệch byte (nạp trợ lý quyết định) |
| `scripts/hop-thu/hinh-dang.mjs` | chép lại từ thẻ | lệch byte (khoá `chuyen_gop`) |
| `scripts/tro-ly-quyet-dinh.cjs` | tệp mới, chép từ thẻ | đích thứ 39 của `INIT-CI-COPY-LIST` 3.1.1 (`only-if-declared: tri_thuc`, crm khai `tri_thuc`) |
| `_acceptance/config.yaml` | thêm `scripts/tro-ly-quyet-dinh.cjs` vào `risk_tiers.t1_skip_globs` | lớp chép là thước đo, nâng nó không làm hết hạn bằng chứng |
| `_acceptance/nang-kit-3-1-1/**`, thiết kế và kế hoạch này | hồ sơ của vòng | |
| `PRODUCT-MAP.md`, `LO-TRINH.html` | máy vẽ lại sau chữ ký | |

Ba mươi bốn đích còn lại của danh sách chép đã khớp từng byte bản 3.1.1, và `scripts/resolve-plugin.mjs` khớp bản
`plugins/feature-loop/scripts/resolve-plugin.mjs` của thẻ — đo 24/11 trên `4aebb767`, không đổi.

## 3. Cách làm

Chép lại cả lớp trong cùng PR với settings (tiền lệ `chuyen-cho-delivery-loop-3-0#d-20261119T181909Z-5`): đổi ref
mà giữ lớp chép cũ thì phiên chạy 3.1.1 còn CI chấm bằng 3.0.0, và hai bên không cùng một luật.

Kit 3.1.1 chỉ thêm khoá tuỳ chọn, vắng là tắt: `ban_do.ngoai_git`, `dieu_phoi.chuyen_gop`, `tro_ly_quyet_dinh.mac_ky`.
crm không khai khoá nào trong ba, nên vòng không đổi hành vi; bật khoá nào là vòng riêng.

## 4. Đo «không đổi phán quyết»

- **Lưới đối chứng** (AC-5): trên cây merge-base, lớp chép của nhánh chính và lớp 3.1.1 cùng chạy
  `pre-merge-check.sh --recheck-all`; cả hai 0 VIOLATION, cùng tập hồ sơ OK. Trên HEAD, lớp chép của HEAD giữ OK đủ
  tập ấy; VIOLATION nếu có chỉ thuộc hồ sơ của vòng.
- **Làn khô eval của hồ sơ đã ký** (AC-6): eval máy của hồ sơ đã ký mà `paths` khớp một tệp PR đổi (đếm trước: 92 eval)
  chạy trên tip; eval đỏ chạy lại trên nhánh chính. Đỏ cả hai bên là đỏ sẵn; đỏ trên tip mà xanh trên nhánh chính là
  đỏ vì vòng.

Đoán trước một lớp «đỏ vì vòng»: thước của `chuyen-cho-delivery-loop-3-0` viết cứng thẻ `v3.0.0` — E1 so lớp chép với
bản 3.0.0, E2 đòi `KIT_REF: v3.0.0`, E3 đòi `ref: v3.0.0`. Vòng này đổi đúng ba thứ ấy, nên các ca ấy đỏ sau gộp.
Lời giao cấm sửa thước của hồ sơ đã ký; luật tạm 18/10 «không tự sửa thước hồ sơ đã ký» nói thước gãy thì lên thẻ cổng.
Đó là Hỏi-1.

## 5. Ngoài phạm vi

- Bật khoá mới nào của kit 3.1.1.
- Sửa thước hay `evals.yaml` của `chuyen-cho-delivery-loop-3-0` (lời giao cấm; hồ sơ ấy giữ chữ ký).
- Cài đặt mức người dùng và plugin trên máy — đã xong trước vòng.
- Sổ kể lại (`docs/superpowers/**`, `docs/findings/**`, hồ sơ đã ký) còn nhắc `v3.0.0`.

## 6. Ghi chú quy trình

- Nhánh làm việc và nhánh PR của crm là `onehub`; kho không có `main` cục bộ. `CONTRIBUTING.md` nói `main` — vòng theo
  thứ kho thật dùng.
- Vòng không chạm màn nào: không đặc tả UX, không design-pass.
