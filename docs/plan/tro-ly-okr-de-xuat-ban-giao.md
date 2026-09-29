# Lượt 9b · Góp ý khi bấm — bàn giao để chạy tiếp ở máy khác

Viết 2026-09-28. Mọi thứ cần để chạy tiếp nằm trong nhánh `feat/tro-ly-okr-de-xuat` của
`origin` (`phanlemanh/crm-onehub`). Có hai thứ không vào git: tệp `.env`, và trí nhớ
của phiên máy. Mục 4 chép lại phần trí nhớ cần dùng để máy khác không phải học lại.

## 1. Đang ở đâu

**Đã qua ba cổng, chưa có dòng mã sản phẩm nào.** Việc tiếp theo là viết mã (S3), và chỉ
bắt đầu khi chủ kho dán «được viết mã, kéo onehub về trước».

| Cổng | Kết quả |
| --- | --- |
| Cổng Đáng | build, archive — Manh Phan, 2026-09-28 08:09 UTC. Ngưỡng nghiệm thu đã chốt, gỡ nhãn «đề xuất» |
| Cổng Phạm vi | duyệt — Manh Phan, 2026-09-28 08:10 UTC. 15 tiêu chí, 29 phép đo, hạng T3 |
| Cổng 1.5 | duyệt — Manh Phan, 2026-09-28. Kế hoạch 10 việc, mỗi việc một tác tử làm kèm một tác tử soát |

Điều kiện viết mã đã đủ: 9a (#182), bộ OKR mẫu (#186) và lộ trình «dựng hết bằng dữ liệu
mẫu» (#183) đều đã lên `onehub`. Nhánh này tách từ `onehub` ở `a62adb16`; lúc viết tệp này
nó đứng sau `onehub` 83 commit.

| Thứ | Ở đâu |
| --- | --- |
| Hợp đồng nghiệm thu | `_acceptance/tro-ly-okr-de-xuat/contract.md` (`status: approved`) |
| Phép đo | `_acceptance/tro-ly-okr-de-xuat/evals.yaml`; lệnh ở các khoá `tdx_*` trong `_acceptance/config.yaml` |
| Thiết kế và đặc tả UX | `docs/superpowers/specs/2026-09-28-tro-ly-okr-de-xuat-design.md` |
| Kế hoạch 10 việc | `docs/superpowers/plans/2026-09-28-tro-ly-okr-de-xuat.md` |
| Sổ quyết định | `_acceptance/tro-ly-okr-de-xuat/decisions.jsonl` (13 dòng, dòng 11 là dấu niêm Cổng Phạm vi) |
| Hồ sơ cơ hội | `_acceptance/tro-ly-okr-de-xuat/opportunity.md` |
| Phản biện context sạch | `_acceptance/tro-ly-okr-de-xuat/gap-probe.md` (5 lỗ, đã sửa cả 5) |
| Bản mẫu bấm được | `apps/app/app/proto/_modules/tro-ly-okr-de-xuat/`, 23 trạng thái, đường `/proto/tro-ly-okr-de-xuat` |
| Ảnh bản mẫu và sổ design-pass | `_acceptance/tro-ly-okr-de-xuat/evidence/design-pass/` (92 ảnh), `design-pass.md` |
| Hai hình của cổng | `_acceptance/tro-ly-okr-de-xuat/figures/` |
| Thẻ Cổng Phạm vi | `_acceptance/tro-ly-okr-de-xuat/card.html` |
| Từ điển | mục «Chế độ ẩn» trong `CONTEXT.md` |

## 2. Đã chốt — không mở lại

- **Tên nấc giữa là «chế độ ẩn»**, không phải «chạy bóng» (chủ kho đổi 28/09). Tên kỹ
  thuật: giá trị `an`, cột `…AnPhamVi`/`…AnDonVi`, thủ tục `okr.troLyAn`. Lộ trình trên
  `onehub` còn viết «chạy bóng»; việc 10 của kế hoạch sửa nó.
- **Hạng T3**: một migration chỉ thêm, gồm bốn cột chế độ ẩn của Chương trình OKR và ba cột
  của đề xuất (`nac`, `maLoai`, `hienLuc`).
- **Ở chế độ ẩn, máy tự góp ý khi lưu.** Mỗi Mục tiêu tối đa một lượt ẩn trong 30 phút,
  cả workspace tối đa 40 lượt mỗi ngày; tiền tính vào trần $9.
- **Nhận là ghi ngay**, không chờ «Lưu». Nút góp ý khoá khi form còn sửa chưa lưu.
- **Đề xuất đứng thành cột cạnh form** (hướng A); hướng B «chuyển màn trong hộp» bị loại.
- **Mỗi người 20 lượt gọi model mỗi ngày.** Dòng xu hướng chỉ hiện khi việc góp ý đã bật.
- **Người chấm máy (judge) là `zai/glm-5.2-fast` có ZDR.** Ở S4, chủ kho chấm 20 đầu ra của bộ
  «Viết lại» để hiệu chỉnh; bộ «không nói về người» (NG) chặn bằng mã.

## 3. Chạy tiếp thế nào

1. **Máy mới — một lần:**
   - clone `phanlemanh/crm-onehub`;
   - `git config http.version HTTP/1.1` (HTTP/2 trả 400 khi đẩy);
   - chép `.env` gốc từ máy cũ (danh sách khoá ở mục 4);
   - cài Postgres cục bộ ở `localhost:5432`, Bun, Node 24;
   - `bun install` rồi `cd packages/db && bun run db:generate`.
2. **Mở phiên ở cây của nhánh:** `git switch feat/tro-ly-okr-de-xuat`. Nếu dùng worktree,
   nối `.env` vào gốc cây (`ln -s <kho-gốc>/.env .env`).
3. **Khi chủ kho cho viết mã:**
   - `git fetch`, gộp `origin/onehub` vào nhánh;
   - `bun install`, rồi `cd packages/db && bun run db:generate`;
   - kiểm mốc migration mới nhất trên `onehub`. Migration của lượt này phải đặt mốc sau nó
     (dự kiến `20261003010000_tro_ly_okr_de_xuat`).
4. **Chạy tiếp vòng:** `/feature-loop:feature-loop tro-ly-okr-de-xuat`. Hợp đồng đang
   `approved` và kế hoạch đã duyệt, nên vòng vào thẳng S3. Việc 1 (bộ kiểm) và việc 6
   (thành phần `Suggestion`) chạy song song trước.
5. **Hết S3:** chạy năm lệnh chứng
   ```
   bun run test
   bun run check-types
   bun run lint
   bun run lint:slop
   bun run build
   ```
   Xanh thì đặt hợp đồng `implemented`.
6. **Trước S4:** hỏi chủ kho khoá nào trả tiền cho eval và trần bao nhiêu (ước ~$2 một lượt
   đủ ba bộ). Sinh args bằng `s4-args.mjs … --diff-base origin/onehub`, rồi soát `diffBase`
   là tổ tiên của `HEAD`.
7. **S5:** mở PR. PR sửa dòng 9b ở mục 10 của `docs/plan/lo-trinh-okr.md`, và đổi «chạy bóng»
   thành «chế độ ẩn» trong hai tệp lộ trình. Chỉ gộp khi chủ kho nói, và ba kiểm tra trên
   đầu nhánh đã xanh.

Xem lại bản mẫu:
```
cd apps/app && PROTO_ROUTE=1 bunx next dev -p 3910
```
Rồi mở `http://localhost:3910/proto/tro-ly-okr-de-xuat`. Chụp lại ma trận ảnh:
```
bun _acceptance/tro-ly-okr-de-xuat/rang/chup-proto.mjs
```

## 4. Trí nhớ phiên cần mang theo

- **`.env` có** `AI_GATEWAY_API_KEY` (khoá `onehub-crm-local`; trần đi theo ngân sách team
  $20), `GOOGLE_CLIENT_ID`/`SECRET`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`,
  `REUI_LICENSE_KEY`. Model của tác tử chọn bằng một hàng `appSetting`, không bằng biến.
- **Sau mỗi lần gộp `onehub`:** chạy `bun install` và `prisma generate` trước mọi phép đo.
  Quên bước này thì mọi eval đỏ «Cannot find module».
- **Phép đo màn** không ghi vào kho `crm` chung. Chạy qua `scripts/lan-do/tien-de.mjs`, nó tự
  dựng kho `crm_<cây>_do`. Kho đo phải đánh dấu đã onboard, không thì quản trị bị đẩy về
  màn onboarding.
- **Phiên cô lập trong worktree từ chối lệnh Bash có biến hay vòng lặp.** Viết script vào
  scratchpad rồi chạy trơn. Ghi `decisions.jsonl` bằng một script nhỏ giữ khuôn id
  `d-<UTC>-<số dòng>`.
- **Tiến trình nền cần `PATH` Node 24**, và chạy dưới `caffeinate -dims` để máy không ngủ
  giữa lượt.
- **S4:**
  - tác nhân chấm chỉ nhận s4-args nguyên văn; câu người gõ lọt vào đề bài làm nó tự dừng;
  - BLOCKED do hạ tầng thì chạy lại cùng round;
  - bộ test đầy đủ chập chờn khi hai bộ chấm chạy song song, nên chấm từng lượt một.
- **Không `pkill` lệnh kiểm toàn máy**: nó giết luôn phiên khác. Dừng tác vụ của mình bằng
  `TaskStop`.
- **Chủ kho tự ký mọi cổng.** Phiên không tự ký, không soạn sẵn chữ quyết. Cổng Đáng ghi
  bằng `/acceptance-gate:start <slug> quyết: …`, Cổng Phạm vi bằng `/acceptance-gate:approve`,
  Cổng Bằng chứng bằng `/acceptance-gate:signoff`.
