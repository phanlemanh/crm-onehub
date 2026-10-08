# Thiết kế — agent-test-khong-nhap-app (E1c, sửa nóng)

## Lối sửa (chờ anh chọn ở Cổng 1)

**A (khuyên) — một schema dùng chung.** Thêm `packages/validation/src/deal-list.ts` (subpath
`@crm/validation/deal-list`): `dealListItem`, `dealListResult` bằng Zod, kiểu `DealListItem`/`DealListResult` bằng
`z.infer`, và `parseDealListResult(value): DealListResult | null` giữ đúng hành vi đọc hiện tại của app (`stageId`
vắng hay sai kiểu → `null`, cả bảng sai hình → `null`). `apps/app/lib/agent-transcript.ts` bỏ kiểu và schema viết tay,
`dealListResultOf` gọi hàm chung, re-export kiểu cho chỗ dùng cũ. Hôm nay `dealListResultOf` không tháo lớp bọc nào — nó
parse thẳng giá trị đầu ra công cụ (`EveToolOutput`) — nên gọi thẳng hàm của gói là cùng đường với app. Test agent nhập `@crm/validation/deal-list` thay
cho `../../app/lib/agent-transcript` — phép đo đi trọn vòng của `deal-va/E4` giữ nguyên ý nghĩa vì app đọc bằng đúng
hàm đó. Khép luôn Ngoài-8 của `deal-va`.

**B — bỏ bước đọc qua app trong test.** Test agent chỉ khẳng định `stageId` có trong đầu ra `execute` và
`toModelOutput`. Nhỏ (một tệp), nhưng mất phép đo «bộ đọc của app giữ được `stageId`» mà `deal-va/E4` đã hứa.

## Mặt phẳng chạm (A)

- Trong ranh giới: `apps/agent/test/giai-doan-agent.integration.spec.ts`, `_acceptance/agent-test-khong-nhap-app/**`.
- Xin chạm (P3-52, P3-53): `packages/validation/src/deal-list.ts` (mới), `packages/validation/package.json` (subpath),
  `packages/validation/test/deal-list.spec.ts` (mới), `apps/app/lib/agent-transcript.ts`, `apps/app/test/agent-results.spec.ts`,
  `_acceptance/config.yaml`.
- Ghim lại trong cùng vòng: `deal-va`, `soan-okr-cung-tro-ly`, `tro-ly-okr-tom-tat`, và mọi hồ sơ lưới trước-merge báo cũ.

Không giao diện, không API, không migration.
