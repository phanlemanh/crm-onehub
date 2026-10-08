---
schema_version: 1
feature: Ca kiểm chập chờn theo máy thôi làm đỏ lượt dài — dọn eve mồ côi của lượt bị ngắt, chờ route thật có trần, trần hook dựng Nest có tên, công tắc bỏ ca tới được test
slug: ca-chap-chon-cach-ly
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-08T00:35:00Z
design_doc: _acceptance/ca-chap-chon-cach-ly/design.md
---

# Acceptance Contract: ca-chap-chon-cach-ly

## Context

Một số ca kiểm đỏ theo trạng thái của máy, và mỗi lần đỏ thì cả lượt dài (ghim lại, S4, pre-push) chạy lại từ đầu.

- Một lượt test bị giết để lại `eve dev` mồ côi. Lượt sau dừng ngay với lỗi «đang có eve dev không phải của bài thử» (tái hiện 08/10).
- Ca «chạy cạnh apps/agent» từng đỏ `Expected: 404 Received: 503` khi hết giờ 5 s (06/10). Gốc lỗi chưa tái hiện được.
- Hai spec `tai-lieu-*` của API hết giờ ở hook dựng Nest, dưới trần mặc định 5 s (CI 05/10).

Cổng Đáng: chủ kho ký `build` ngày 07/10 (`opportunity.md`). Thiết kế: chủ kho duyệt ngày 08/10, gồm cả bản sửa sau tái hiện.

Source input: `_acceptance/ca-chap-chon-cach-ly/opportunity.md`, soát CI 01–07/10, tái hiện ngày 08/10 (`design.md`).

## Criteria

- AC-1: Given tệp chủ khoá eve của một gốc ghi pid của một tiến trình test đã chết, cùng pid các `eve dev` nó đã sinh, và những eve đó còn sống, When lượt sau gọi `khoiDongEve` cho gốc đó, Then các eve đã ghi bị dừng trước khi eve mới được gọi; And eve mới lên, và máy được trả cho bài thử.
- AC-2: Given ở gốc đó có một `eve dev` đang chạy mà không có trong tệp khoá, hoặc một pid ghi trong khoá nay là tiến trình không phải `eve dev` của gốc đó, When `khoiDongEve` chạy cho gốc đó, Then tiến trình ấy không bị dừng; And với eve ngoài khoá, `khoiDongEve` vẫn ném lỗi có tên như hôm nay (pid, url, lệnh `kill`).
- AC-3: Given `/eve/v1/health` đã trả 200 mà `/health` của app còn trả 503 hoặc từ chối kết nối, When `khoiDongEve` chờ máy sẵn sàng, Then nó chỉ trả máy khi `/health` trả một mã khác 503, kể cả khi trước đó đã bị từ chối kết nối vài lần; And nếu hết trần `KHOI_DONG.sanSang` mà vẫn 503 hoặc vẫn bị từ chối, nó ném lỗi gọi tên route và mã cuối cùng, ra trước khi hook của `app-rieng` hết giờ.
- AC-4: Given máy chạy Node ≥ 24, When một lượt `app-rieng.integration.spec.ts` bị SIGKILL lúc eve con đang sống, và ngay sau đó ca «chạy cạnh apps/agent» chạy lại (ba lần liền, mỗi lần một lượt bị giết trước), Then cả ba lượt chạy lại đều xanh và eve mồ côi đã bị dừng; And trên bản sao của cây đã gỡ bước dọn, cùng bàn đo đỏ với thông điệp «dang co eve dev khong phai cua bai thu».
- AC-5: Given một trong ba hook — `beforeAll` của `dungSan()`, `beforeAll` riêng của `tai-lieu-khong-ro.spec.ts`, `beforeAll` riêng của `tai-lieu-thay-trang.spec.ts` — mất hơn 5 s, When chạy spec dùng hook đó, Then hook không hết giờ trước `TAI_LIEU_SAN.hookMs`; And khi hook nhanh như hôm nay, hai spec vẫn xanh đủ số ca như trước.
- AC-6: Given người gọi đặt `SOKR_KHONG_CHAY_AGENT_CU=1`, When chạy `bun run test` qua turbo cho gói `agent-okr`, Then ca «chạy cạnh apps/agent» bị bỏ; And không đặt biến thì ca đó chạy.
- AC-7: Given diff của vòng so với merge-base với `onehub`, Then không tệp nào dưới `apps/*/src/**`, `apps/*/agent/**`, `apps/*/app/**`, `packages/*/src/**` đổi.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 08/10.

- **Trục A — ca:** eve mồ côi | 503 ở route thật | hook Nest tai-lieu | công tắc bỏ ca.
  - Thước CE: soát CI 01–07/10, nhật ký `dieu-phoi-1410/trang-thai/P4.md`, bốn kịch bản tái hiện ngày 08/10. Ba ca ngoài ranh giới đã chuyển sang hàng khác.
- **Trục B — tiến trình ở gốc trước lượt:** không có | eve của lượt đã chết (có trong khoá) | eve người khác chạy (ngoài khoá) | pid trong khoá bị tái dùng.
  - Thước CE: các nhánh của `khoiDongEve` và `giuMot` — khoá cũ, máy trùng `KHOI_DONG.trung`, cổng bận.
- **Trục C — nơi chạy:** lượt dài cục bộ Node 26 | CI job chính Node < 24 (bỏ ca eve) | job Node 24 của `acceptance.yml`.
  - Thước CE: `kiemNodeEve`, `.github/workflows/acceptance.yml`.
- **Ô Core:** A1×B2 (AC-1, AC-4) · A1×B3 và A1×B4 (AC-2) · A2 (AC-3) · A3 (AC-5) · A4 (AC-6) · ràng buộc tầng test (AC-7).
- **Đối chiếu ngành:** [NGÀNH: Google Testing Blog — «Flaky Tests at Google and How We Mitigate Them», 2016] khuyên sửa gốc và cách ly ca chưa sửa được. Ba ca của vòng có cách sửa, nên vòng chưa dựng sổ cách ly.
- **Later:**
  - sổ cách ly có người phụ trách;
  - tìm gốc của 503 khi nó quay lại.

## Out of scope

- Dọn `.eve/dev-runtime`, `dev-hosts`, `dev-cleanup-intent` trước khi khởi động: không tái hiện được lỗi từ trạng thái đó (`design.md`, mục tái hiện).
- Dừng `eve dev` không do chính bài thử sinh ra.
- Sổ cách ly ca chập chờn và job CI không chặn.
- Ba ca chập chờn ngoài ranh giới: `goi-soan` :376 và `tasks.integration` :337 sang F17, `trinh-soan-lien-ket` :205 sang F14.
- Nâng trần chung của bun (`bunfig.toml timeout`) cho cả gói.
- Sửa trong gói eve.
- Cho job CI chính (Node < 24) chạy ca eve.

## Notes

- Không migration. Không đổi mã sản phẩm.
- Hạn chế đã biết khi giao: gốc của lỗi `Expected: 404 Received: 503` đêm 06/10 chưa tái hiện được. AC-3 chỉ đổi kết cục của nó: chờ qua được nếu nhất thời, đỏ có tên nếu không.
- Tệp ngoài ranh giới hàng: `khoi-dong.ts`, `tai-lieu-san.ts`, `turbo.json`, `khoi-dong-don.spec.ts` (mới). Giám sát đã duyệt ở yêu cầu `P5-4` và `P5-6`.
