# Không rẽ theo tên thành luật kho — thiết kế

Hàng F23 của `docs/plan/lo-trinh-okr.json` (đợt r2, dãy P7). Hồ sơ `_acceptance/khong-re-theo-ten-thanh-luat-kho/`.

## Vấn đề

`giai-doan-thoa-thuan` (T3, đã ký) giữ bất biến AC-14: mã sản phẩm không nhắc bảy id giai đoạn cũ hay
`GIAI_DOAN_GOC`. E17 đo nó bằng `rang/khong-re-theo-ten.mjs` (quét chữ trên `git ls-files` của bảy thư mục), và khai
`paths` phủ gần trọn app. Hai người đọc `paths`:

- lưới trước-gộp với `risk_tiers.stale_scope: paths` — hồ sơ bị chạm thì mọi tệp đổi từ lần ghim mà khớp `paths`
  làm bằng chứng cũ;
- lượt kiểm chéo đêm (`scripts/kiem-cheo/tap-cham.mjs`) — chọn hồ sơ đã ký có `paths` khớp diff vừa gộp.

Vì E17, gần như mọi PR chạm app chọn `giai-doan-thoa-thuan` (19 eval, 7 suite). Bất biến của E17 lại là bất biến của
cả kho, không phải của một vòng: nó thuộc về lệnh kiểm chạy mỗi PR.

## Lối chọn

1. **Luật oxlint trong `lint:slop`.** `bun run lint:slop` là `oxlint --format=default` với `.oxlintrc.json`; CI
   (`ci.yml`) và `.githooks/pre-push` chạy nó mỗi PR, `gate-shape.json` canh nó có mặt, và nó chạy oxlint thẳng,
   không qua cache của turbo. Một bài kiểm trong `bun run test` thì nằm trong một gói mà turbo cache theo đầu vào
   của gói đó: PR chỉ chạm gói khác ăn cache và không quét lại. Hai luật mới sống trong plugin riêng của OneHub,
   `tools/oxlint/onehub/`, không trong `tools/oxlint/anti-slop/` của hãng — chạm tệp của hãng là thêm phí bản rẽ:
   `onehub/khong-re-theo-ten-giai-doan` cho bảy id cũ, `onehub/khong-dung-giai-doan-goc` cho tên `GIAI_DOAN_GOC`.
   Tách hai luật để chỗ cho phép riêng của `allowlist.ts` là một dòng `overrides`, không cần tuỳ chọn luật.
2. **Quét chữ, không quét cây cú pháp.** Luật nghe nút `Program`, chạy cùng biểu thức `\b(<từ>)\b` trên toàn văn
   tệp, báo từng chỗ khớp ở đúng dòng cột. Quét theo nút (chuỗi, định danh) sẽ hẹp hơn AC-14 đã ký «không chỗ nào
   nhắc». Danh sách từ = `Object.values(GIAI_DOAN_GOC)` + `"GIAI_DOAN_GOC"`, import từ `packages/db/src/giai-doan.ts`.
3. **Phạm vi giữ nguyên phép kiểm cũ**, khai bằng `overrides` của `.oxlintrc.json`: bật `error` cho bảy thư mục;
   tắt cho `packages/db/src/giai-doan.ts` và `apps/app/app/proto/**` (thư mục `generated` đã nằm trong
   `ignorePatterns`); `packages/telemetry/src/allowlist.ts` tắt riêng `khong-dung-giai-doan-goc`.
4. **E17 đọc luật kho.** Giữ khoá `gdtt_khong_re_theo_ten` và tệp `rang/khong-re-theo-ten.mjs` (luật đợt 7:
   `config.yaml` chỉ thêm khoá). Script chạy `oxlint --format=json` với cấu hình kho trên bảy thư mục, giữ chẩn đoán
   của luật, in `HONG <tệp>:<dòng>: <từ>` như cũ, số tệp đã quét lấy từ `number_of_files`. Tập tệp quét là
   `git ls-files` của bảy thư mục trừ chỗ miễn đã ký, chép sang cây tạm cùng `.oxlintrc.json` bỏ riêng
   `ignorePatterns` (S4 vòng 1: một glob ở đó che được thư mục con khỏi cả hai luật). Trước đó script hỏi
   oxlint trên một cây tạm chép `.oxlintrc.json`, mỗi thư mục một tệp mồi: luật nào không bắt ở thư mục nào thì
   «KHONG DO DUOC», mã 2. Rồi soát đường tắt: mục `overrides` tắt luật ngoài chỗ miễn đã khai, tệp cấu hình lồng,
   chỉ thị `oxlint-disable`/`eslint-disable` trong bảy thư mục — có thì mã 2. Tắt luật không được biến thành xanh.
5. **`paths` của E17** thu về: `tools/oxlint/onehub/**`, `**/*oxlintrc*`, `packages/db/src/giai-doan.ts`,
   `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs`. Bất biến trên mã sản phẩm do `lint:slop` giữ ở mỗi
   PR; hồ sơ chỉ phải chấm lại khi chính luật đổi.

## Tệp vòng chạm

- `tools/oxlint/onehub/index.ts`, `tools/oxlint/onehub/package.json`,
  `tools/oxlint/onehub/rules/khong-re-theo-ten-giai-doan.ts` (mới)
- `.oxlintrc.json` (thêm dòng)
- `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs`, `_acceptance/giai-doan-thoa-thuan/evals.yaml`
  (khối E17: `paths`, `expected`), và tệp ghim của hồ sơ (`run-log.jsonl`, `evidence-report.md`)
- `_acceptance/khong-re-theo-ten-thanh-luat-kho/**`, `_acceptance/config.yaml` (thêm khoá),
  `docs/superpowers/**/*khong-re-theo-ten-thanh-luat-kho*`, `PRODUCT-MAP.md`, `LO-TRINH.html`

## Đo

| Eval | AC | Đo |
| --- | --- | --- |
| E1, E2 `ma-tran-luat` | AC-1, AC-2 | cây tạm: gieo bảng ca viết trước; tập (tệp, từ) hai luật báo bằng đúng tập đỏ |
| E3 `lint:slop` | AC-3 | `bun run lint:slop` xanh ở đỉnh |
| E4 `e17-qua-luat` | AC-4 | E17 xanh ở đỉnh, số tệp ≥ 50; script không còn danh sách hay biểu thức riêng; bản sao chèn `CLOSED_WON` hay export `GIAI_DOAN_GOC` đỏ đúng dòng |
| E5 `chieu-do` | AC-4 | sáu đột biến: luật rỗng danh sách · bỏ một thư mục khỏi `overrides` · bật luật tên cho `allowlist.ts` · override tắt thư mục con · chỉ thị tắt trong tệp · `ignorePatterns` che thư mục con |
| E6 `chon-ho-so` | AC-5 | `tapCham` và bộ lọc hoá cũ của kit trên diff giả, đối chứng với `evals.yaml` ở mốc nền |
| E7 `ghim-xanh` | AC-6 | dòng ghim mới nhất của `giai-doan-thoa-thuan` |
| E8 `pham-vi` | AC-7 | từng commit của vòng so với cha |

## Đặc tả UX

Không áp — vòng không chạm giao diện.
