# Kế hoạch — ci-test-het-do-co-dinh

Mã đã viết và đo ở S1, vì phải sửa thử và phát lại theo thứ tự CI mới khoanh được nguyên nhân. Cổng Phạm vi duyệt đúng
bản đó (67b12ea71). Không còn task code nào; S3 chỉ còn bước kiểm.

| # | Task | Tệp | Kiểm từng task | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | Đồng hồ thật, ca (k), trần chung dau-hook | `packages/ui/test/pre-push-da-chung.spec.ts` | `node _acceptance/ci-test-het-do-co-dinh/rang/dong-ho-va-tran.mjs` — đã xanh 10/10 | E1, E2, E3 | true |
| 2 | dev-grant-needed dọn người dùng của mình | `apps/api/test/dev-grant-needed.spec.ts` | `ro-ri.mjs` dev-lanh, dev-pha — đã xanh | E4 | true |
| 3 | mat-khau-lien-ket tiền tố riêng | `apps/api/test/mat-khau-lien-ket.spec.ts` | `ro-ri.mjs` mkl-lanh, mkl-pha — đã xanh | E5 | true |
| 4 | vai-chi-okr tiền đề nói to | `apps/api/test/vai-chi-okr.spec.ts` | `ro-ri.mjs` vai-lanh, vai-do — đã xanh | E6 | true |
| 5 | dgt-thuoc n1, n2 lên đầu và expect lý do cũ | `apps/api/test/du-an-do-nguong.spec.ts` | `ro-ri.mjs` dgt-lanh, dgt-pha — đã xanh | E7 | true |
| 6 | Phát lại thứ tự CI đỏ và chạy riêng ba lượt | `rang/phat-lai-thu-tu.mjs`, `rang/rieng-ba-luot.mjs` | chạy ở S4 dưới khoá s4 (S1 đã phát lại tay: api 2169 pass · 0 fail, app-ui 391 pass · 0 fail) | E1, E8, E9 | false |

Kiểm chung trước S4: `bunx turbo run check-types --filter=api --filter=@crm/ui` (đã xanh), `biome check` trên các tệp đã sửa.
