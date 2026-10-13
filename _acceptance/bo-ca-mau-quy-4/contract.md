---
schema_version: 1
feature: Góp ý của Kara được đo trên khoảng 30 ca mẫu dựng theo khuôn OKR quý 4 — cấp OneHub và phòng ban — nằm trong bộ OKR mẫu, không chờ phòng ban công bố
slug: bo-ca-mau-quy-4
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, agent-eval]
status: draft
design_doc: docs/superpowers/specs/2026-10-13-bo-ca-mau-quy-4-design.md
---

# Acceptance Contract: bo-ca-mau-quy-4

## Context

Hàng N1 của `docs/plan/lo-trinh-okr.json` (`du_lieu: "sinh-gia"`), dãy P1 đợt r2, Cổng Đáng
đã ký `build` 2026-10-12. N1 gốc là khoảng 30 mục tiêu và KR thật của OKR quý 4 đã thay tên;
chủ kho chốt 11/10 dựng nó bằng dữ liệu mẫu. Bộ OKR mẫu (hàng M) đã có công ty giả với OKR
OneHub của năm và OKR quý 4 của bộ phận, phòng ban. Hàng này rút ca góp ý từ chính các mục tiêu
đó, gán nhãn, cho eval góp ý chọn được bộ ca, và đo Kara trên bộ ca đó bằng cùng thước chốt
mã và judge mà 9b dùng cho ca mẫu (E22: mã 30/30, judge 0,95). Số đo là căn cứ cho điều kiện
bật 9b, không phải điều kiện ký của hàng này.

Source input: `docs/plan/lo-trinh-okr.json` hàng N1 và 9b · `docs/plan/lo-trinh-tro-ly-okr.md`
mục N1 · `docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md` §4.11 ·
`_acceptance/tro-ly-okr-de-xuat/` (E22) · `_acceptance/bo-okr-mau/contract.md` AC-13.

## Criteria

- AC-1: Given `apps/api/scripts/okr-mau/cong-ty.json` và tệp nhãn `nhan-ca-quy-4.json`, When chạy `bun run okr:ca-quy-4`, Then thư mục `apps/agent/evals/okr/ca-gop-y/quy-4/` có đúng một ca `viet-lai` mã `ca-<ma>` cho mỗi mục tiêu quý 4 cấp bộ phận hay phòng ban đã công bố và mỗi mục tiêu cấp OneHub của năm — không ca nào cho mục tiêu nháp, chờ duyệt hay đã bỏ; And mỗi ca chép đúng chữ và số của mục tiêu nguồn: tên, «vì sao lúc này», kiểu mục tiêu, cấp, tên đơn vị, và từng KR (tên, kiểu, khởi điểm, đích, đơn vị) theo thứ tự.
- AC-2: Given dòng nhãn `bo: "ng"` cho một mục tiêu phòng ban, When sinh ca, Then có ca `ca-ng-<ma>` mà `capTren` là mục tiêu OneHub nó căn chỉnh vào — trực tiếp, hay qua KR OneHub nó căn chỉnh — với đủ KR của mục tiêu OneHub đó, và `kyVong.khongDuoc` gồm `chep-kr-cap-tren`, `noi-ve-nguoi`.
- AC-3: Given một bản sao nhãn hỏng — thiếu dòng cho một mục tiêu được chọn; trỏ mã không có hay mục tiêu nháp; hai dòng cùng ca; đòi ca NG cho mục tiêu không căn chỉnh; `kyVong` trái khuôn `caGopY` — When chạy lệnh sinh, Then mỗi ca thoát mã 4 với câu nêu mã mục tiêu và chỗ hỏng, và thư mục đích không đổi tệp nào.
- AC-4: Given bộ ca đã nằm trong git, When so với kết quả sinh lại từ `cong-ty.json` và nhãn hiện tại, Then từng tệp giống từng byte và không thừa, không thiếu tệp; And sinh vào một thư mục đang có tệp ca cũ không còn nguồn thì tệp đó bị xoá.
- AC-5: Given bộ ca quý 4, When đọc bằng `docBoCaGopY`, Then có từ 28 tới 34 ca, đủ ba mục tiêu OneHub, hai bộ phận và mười phòng ban mẫu; ít nhất bốn ca NG; ít nhất ba ca `khongGopY`; mọi KR qua `krInput` và `kiemSoTheoKieu`; không mã ca nào trùng bộ `mau/`; And nhãn của từng ca đúng bảng «Nhãn» của design doc.
- AC-6: Given biến `TDX_THU_MUC_CA`, When eval góp ý và eval NG dựng danh sách ca, Then chúng đọc đúng thư mục đó và chỉ thư mục đó; biến vắng thì đọc bộ `mau/` như trước; biến trỏ thư mục không có thì ném lỗi nêu đường dẫn.
- AC-7: Given máy có khoá mô hình, When chạy `bun _acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`, Then Kara góp ý cho mọi ca quý 4 trong một kho đo dùng-một-lần với judge ZDR, mỗi ca được chấm bằng đúng luật chốt mã của E22 (9b) và in `DUNG` hoặc `SAI` kèm lý do, dòng cuối in `ma: x/n · judge: y` cạnh ngưỡng ca mẫu, và bảng kết quả cùng tổng USD đã tiêu ghi vào `evidence/do-gop-y-quy-4.md`; luật chấm tự kiểm trên bảy bản ghi giả cố ý phạm từng luật trước khi gọi mô hình; thoát 0 khi mọi ca có bản ghi và ca đối chứng bị bắt; thoát 3 khi ca đối chứng không bị bắt; thoát 2 khi không đo được (thiếu khoá, eve sập, ca thiếu bản ghi); And `--thu-muc <dir>` đo một bộ khác bằng cùng quy trình.
- AC-8: Given một phiên lượt sau chỉ đọc `docs/setup.md`, When cần sinh lại bộ ca quý 4, đo Kara trên nó, hay đưa ca thật vào `ca-gop-y/that/` để đo, Then tài liệu cho đủ lệnh, cờ, mã thoát, chỗ đặt ca thật và vì sao ca thật không vào git. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — nguồn của ca:** OneHub của năm · bộ phận quý 4 · phòng ban quý 4 · phòng ban kèm cấp trên · không công bố [thước CE: khoá `cap`, `chuKy`, `trangThai`, `canChinh` của `cong-ty.json`] → AC-1, AC-2, AC-5
- **Trục B — nhãn kỳ vọng:** mã vấn đề · viết lại trường · câu đã tốt · không nhãn riêng · NG cấm [thước CE: khuôn `caGopY`, `MA_VAN_DE`, `tro_ly_okr/instructions.md`] → AC-3, AC-5, AC-7
- **Trục C — vòng đời bộ ca:** sinh · quên sinh lại · nhãn hỏng · eval chọn bộ · đo thật · đổi sang ca thật [thước CE: luật dữ liệu mẫu của `CLAUDE.md`, quy trình E22] → AC-1, AC-3, AC-4, AC-6, AC-7, AC-8
- [GIẢ ĐỊNH] «Khuôn OKR quý 4 cấp OneHub» lấy mục tiêu OneHub của năm — chu kỳ cha của quý 4 — vì bộ mẫu không có mục tiêu OneHub trong quý.
- [GIẢ ĐỊNH] Nhãn là phán đoán của máy theo năm dấu hiệu của `instructions.md`; ca không có dấu hiệu rõ không mang nhãn riêng, nên không đẩy số đạt lên hay xuống bằng nhãn đoán.

## Đường đo

`opportunity.md` không khai ngưỡng (bốn dòng còn «…»). Thước của hàng là chính phép đo AC-7:
`ma: x/n · judge: y` trên bộ quý 4, đặt cạnh ngưỡng ca mẫu của 9b (mã 30/30, judge ≥ 0,7). Số
từ `evidence/do-gop-y-quy-4.md`; AC-7 bảo đảm nó có và đo đúng thước.

## Out of scope

- Lệnh rút ca từ cơ sở dữ liệu production và thay tên người, tên đối tác — việc vận hành lúc
  bật 9b, cần chủ kho cho phép truy cập production.
- Sửa `cong-ty.json`, bộ `mau/`, hay bất cứ tệp nào của `_acceptance/tro-ly-okr-de-xuat/`.
- Ca trộn Anh–Việt và ca mã `khong-do-duoc` trong bộ quý 4 — bộ mẫu không có; bộ `mau/` phủ.
- Quyết bật 9b, hay đòi Kara đạt một số ca nào: hàng này hứa đo, không hứa kết quả.
- Gom luật chấm của E22 và AC-7 về một nơi.

## Notes

- Bộ ca quý 4 là dữ liệu giả nên nằm trong git; ca thật N1 vẫn ở `ca-gop-y/that/`, ngoài git.
