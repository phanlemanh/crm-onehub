# Kế hoạch thi công — agent-test-khong-nhap-app (lối A)

1. `packages/validation/src/deal-list.ts` + subpath `./deal-list` + `test/deal-list.spec.ts` — phục vụ E2. Kiểm: `atk_parse`.
2. `apps/app/lib/agent-transcript.ts` dùng `parseDealListResult`, bỏ schema/kiểu viết tay; `agent-results.spec.ts`
   describe `cung-ham-goi` — phục vụ E3. Kiểm: `atk_app_dung_goi`.
3. `apps/agent/test/giai-doan-agent.integration.spec.ts` nhập từ gói, so từng trường của `dealListItem.shape` với đầu ra
   thật — phục vụ E1, E4. Kiểm: `atk_luat_kho`, `atk_agent`.
4. Răng `rang/luat-kho.mjs`, `rang/app-dung-goi.mjs` (`--tu-thu`, `--tep`), `rang/ghim.mjs` (`--ho-so`).
5. Ghim lại `deal-va`, `soan-okr-cung-tro-ly`, `tro-ly-okr-tom-tat` bằng một lượt làn — phục vụ E5. Kiểm: `atk_ghim`.

Bước 1 trước 2–3 (subpath); 4 độc lập; 5 sau khi mã xong và cây sạch.
