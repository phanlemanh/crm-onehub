# Kế hoạch — TH3 trạng thái tín hiệu sống

Thiết kế: `docs/superpowers/specs/2026-10-22-trang-thai-tin-hieu-song-design.md` · hợp đồng
`_acceptance/trang-thai-tin-hieu-song/contract.md` · bộ đo `evals.yaml` cùng thư mục.

Các task nối tiếp nhau (mỗi task dùng hàm của task trước), nên chạy tuần tự trong vòng chính.

| # | Việc | Tệp | Kiểm từng task | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | Hàm chỗ dùng chung: `choTinHieu`, `dauCho`, `doiCho`, `KHOA_CHO_TIN_HIEU`; `trang-thai.ts` của app đọc khoá từ đó | `packages/validation/src/tin-hieu-cho.ts`, `packages/validation/package.json` (subpath), `apps/app/lib/tin-hieu/trang-thai.ts`, bài `packages/validation/test/tin-hieu-cho.spec.ts` | `cd packages/validation && bun test test/tin-hieu-cho.spec.ts`; bài cũ của trang tín hiệu xanh | E1, E3, E6 | false |
| 2 | Khối mẫu do kit sinh: `dungKhoiMau(thayDoi)` chép đầu vào kit vào thư mục tạm, chạy `scripts/product-map.mjs`, đọc khối | `apps/app/test/support/khoi-tin-hieu-mau.ts` | một bài nhỏ: khối sinh có `tin_hieu` và đúng chỗ đã đặt | E1, E3, E4, E7, E8 | false |
| 3 | Loại thông báo `tin-hieu-doi-cho`: khuôn, khoá gộp, nguồn; câu vi/en, `dienCau`, `tenKhongDich`; mẫu của tác nhân | `packages/validation/src/thong-bao.ts`, `apps/app/lib/messages/thong-bao.ts`, `apps/app/lib/thong-bao/cau.ts`, `apps/agent/test/support/muc-mau*.ts`, `apps/app/test/thong-bao-cau.spec.ts` (describe `ttts-cau`) | `bun run ttts_cau` (lệnh config) + `bun run check-types` | E6 | false |
| 4 | Ghi bản chụp và báo trong một giao dịch: `ghiBanChupVaBaoTinHieu` (khoá hàng, so, lọc người nhận nối member, ghi thông báo, không ném vì dữ liệu, cảnh báo); dịch vụ API dùng nó; tham số tiêm `ghiThongBao` cho bài | `apps/api/src/lo-trinh/tin-hieu-doi-cho.ts`, `apps/api/src/lo-trinh/lo-trinh-ban-chup.service.ts`, `apps/api/test/tin-hieu-doi-cho.spec.ts` | `ttts_bao`, `ttts_khong_bao`, `ttts_giao_dich`; bài `ban-chup-lo-trinh.spec.ts` cũ xanh | E3, E4, E5 | false |
| 5 | Trang tín hiệu đọc bản chụp: bộ đọc thô có cache, `docNguonTinHieu` theo `chonNguon`, `docTrangThaiDu` nhận dữ liệu; hai trang đổi nguồn | `apps/app/lib/tin-hieu/nguon.ts`, `apps/app/lib/tin-hieu/trang-thai.ts`, `apps/app/lib/tin-hieu/tat-ca.ts`, `apps/app/app/(app)/[slug]/tin-hieu/page.tsx`, `.../tat-ca/page.tsx`, `apps/app/test/tin-hieu-nguon.spec.ts` | `ttts_doc_ban_chup`, `ttts_khong_lui`; bài trang tín hiệu cũ xanh | E1, E2 | false |
| 6 | Lệnh đo `do-bao-doi-cho.ts` | `scripts/tin-hieu/do-bao-doi-cho.ts`, `scripts/tin-hieu/test/do-bao-doi-cho.spec.ts`, `package.json` (lệnh `tin-hieu:do-bao`) | `ttts_do` | E8 | false |
| 7 | Phép đo màn | `_acceptance/trang-thai-tin-hieu-song/rang/do-man.mjs` | chạy `ttts_do_man` một lượt khô; `ttts_thiet_ke` | E7, E7b | false |
| 8 | Tài liệu: `docs/api.md` mục «Tín hiệu» (API ghi thông báo đổi chỗ, luật không ném), `docs/agent.md` một dòng về nguồn thông báo thứ ba, `CONTEXT.md` nếu cần chữ mới | tài liệu | `bun run lint:slop` | — | false |

Mỗi phép đo mới đi kèm cặp hai chiều trên cùng fixture (đối chứng dương xanh, bản phá đỏ với thông điệp ghim) —
lượt phá chạy trong bản sao ở scratchpad, commit trước khi phá.

Kết S3: năm lệnh chứng của kho (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`) qua khoá máy.
