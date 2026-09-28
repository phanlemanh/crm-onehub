# Bàn giao — lượt 8a `canh-kr-okr` (2026-09-28)

Viết khi chủ kho dừng phiên để làm tiếp ở máy khác. Đọc hết trước khi gõ lệnh nào.

## Đang ở đâu

- **Nhánh:** `feat/canh-kr-okr` (đã đẩy lên `origin`). Gộp `onehub` lần cuối tới `7784cadd` (#186 bộ OKR mẫu, #187, #188).
- **Hồ sơ:** `_acceptance/canh-kr-okr/`. Hợp đồng `status: approved` (Manh Phan, 2026-09-28 07:58 UTC). Cổng Đáng ký 07:57 (build, keep, chia mã 8a / 8c / 8b). Cổng 1.5 duyệt 08:17 (13 việc, subagent-driven).
- **Chủ kho đã cho viết mã** (dán lại `/goal` sau khi duyệt Cổng 1.5; không cần câu «được viết mã» nữa).
- **S3 — kế hoạch** `docs/superpowers/plans/2026-09-28-canh-kr-okr.md`:

| Việc | Trạng thái | Commit |
|---|---|---|
| 1 khuôn dữ liệu | xong, soát đạt | `855c740a` |
| 2 sáu bảng mới + `migration` | xong, soát đạt | `626ec75f` |
| 3 việc dưới KR | xong, soát đạt sau 1 vòng sửa | `0c3591ab` · `0b9cc665` |
| 4 sáng kiến, không lộ dữ liệu đối tác | xong, soát đạt sau 2 vòng sửa | `f6ac4695` · `eba1625f` · `00a22915` · `65a1545d` |
| 5 bằng chứng KR mốc | xong, soát đạt sau 1 vòng sửa | `79202435` · `d0bf4751` |
| 6 ghi nhận + tin báo | **chưa bắt đầu** — làm tiếp từ đây | — |
| 7–13 | chưa bắt đầu | — |

Sổ tiến độ đầy đủ (quyết định, mục nhỏ hoãn lại, luật mang theo): `_acceptance/canh-kr-okr/sdd-progress.md`.

## Dựng máy mới

```bash
git fetch origin && git switch feat/canh-kr-okr
```

1. Nếu làm trong worktree: `ln -s <kho gốc>/.env .env` ở gốc worktree (`.env` không vào git).
2. `bun install`, rồi `cd packages/db && bun run db:generate` (có `migration` mới `20261003010000_okr_canh_kr`).
3. `bun run db:test --reset` để kho test có sáu bảng mới.
4. Đặt lại sổ tiến độ cho kỹ năng subagent-driven (thư mục `.superpowers/` bị git bỏ qua):

```bash
mkdir -p .superpowers/sdd/2026-09-28-canh-kr-okr && cp _acceptance/canh-kr-okr/sdd-progress.md .superpowers/sdd/2026-09-28-canh-kr-okr/progress.md
```

5. Kiểm nhanh nền: `bun run test -- "cd apps/api && bun test test/okr-canh-kr.spec.ts && bun test test/vai-chi-okr.spec.ts"` phải xanh.

## Làm tiếp

Mở phiên mới ở gốc kho, gõ:

```
/feature-loop:feature-loop canh-kr-okr
```

Vòng đọc `status: approved` và thấy kế hoạch đã có → vào S3, tiếp việc chưa xong. Nói với phiên: «dùng subagent-driven, sổ ở `.superpowers/sdd/2026-09-28-canh-kr-okr/progress.md`, việc 1–5 đã xong, bắt đầu từ việc 6». Mỗi việc: một tác tử cài (đọc brief do `scripts/task-brief` tách ra) + một người soát; vòng sửa gửi lại đúng tác tử cũ.

Dán kèm dòng `/goal` của vòng (có trong thẻ Cổng Phạm vi, `_acceptance/canh-kr-okr/card.html`) nếu muốn máy chạy thẳng tới Cổng Bằng chứng.

## Luật mang theo cho việc 6–13 (rút từ các vòng soát)

- **Mọi thủ tục `okr.*` mới** phải thêm vào `THU_TUC_CANH_KR` **và** `DAU_VAO_HOP_LE` ở `apps/api/test/vai-chi-okr.spec.ts`, không thì ca `sang-kien-an` đỏ.
- Hành động vết nào mang ảnh sáng kiến phải vào `HANH_DONG_SANG_KIEN` (`apps/api/src/okr/canh-kr.ts`).
- Sau khi thêm thủ tục: `cd apps/api && bun run trpc:generate`, commit `src/generated/server.ts`. **Đừng đổi tên import khuôn bằng `as` trong router** — bộ sinh hỏng.
- Dịch vụ `OkrCanhKrService` tiêm vào router dưới tên trường `canh` (không phải `canhKr`, trùng tên thủ tục).
- `canhKr` trả việc và sáng kiến chung một danh sách, xếp theo `position` — việc 9 (màn) đọc đúng thế.
- Bài chạm DB khai `timeout` 30 000 ms, kể cả `afterAll`. Không dùng ngày cứng khi máy chủ đọc đồng hồ thật — suy từ `ngayVN(new Date())`.
- Gieo qua thủ tục thật khi kho có (vd `onboarding.createFromTemplate`, `onboarding.closePlan`, `campaigns.create`); chỉ ghi thẳng DB khi không có thủ tục (đổi tên chiến dịch, xoá hẳn chiến dịch) và ghi rõ trong báo cáo.
- `mauKr` trả mã lỗi thô (`dich-phai-lon-hon-khoi-diem`) trong `message`; việc 7 và 11 phải dịch qua `T.soTheoKieu` / chữ màn trước khi hiện.
- `docs/api.md` mục OKR chưa có đoạn cho việc, sáng kiến, bằng chứng, ghi nhận, mẫu — thêm ở việc 13.
- Kế hoạch dặn chạy song song việc 1 và 2, nhưng kỹ năng subagent-driven cấm hai tác tử cài song song trên một cây — đã chạy tuần tự.

## Bẫy đã gặp

- Tác tử con có thể chết vì lỗi mạng (`ENOTFOUND`) giữa chừng: kiểm `git status`, gửi tin cho chính tác tử đó để làm nốt, đừng giao lại từ đầu.
- `timeout` không có trên macOS — bọc lệnh bằng nó thì lệnh in rỗng, trông như xanh.
- Máy chủ bản mẫu (`PROTO_ROUTE=1 bunx next dev -p 3217` trong `apps/app`) đã tắt; ảnh design-pass ở `evidence/design-pass/`.

## Sau S3

S4 theo feature-loop: `node <feature-loop>/scripts/s4-args.mjs --slug canh-kr-okr --root . --out _acceptance/canh-kr-okr/s4-args.json`, rồi Workflow `acceptance-verify.js` (chép sang scratchpad trước khi gọi). Chấm từng lượt một, không song song với lượt S4 khác (bộ test chập chờn khi hai bộ chấm chạy cùng). Không gộp trong đóng băng (từ 19/10 tới khi các phòng ban công bố OKR quý 4). PR tự sửa dòng 8 mục 10 của `docs/plan/lo-trinh-okr.md`.
