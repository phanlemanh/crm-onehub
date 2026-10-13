# Bộ ca mẫu quý 4 (N1) — thiết kế

Hàng N1 của `docs/plan/lo-trinh-okr.json`, dãy P1 của đợt r2. Câu giao: «Góp ý của Kara được đo
trên khoảng 30 ca mẫu dựng theo khuôn OKR quý 4 — cấp OneHub và phòng ban — nằm trong bộ OKR
mẫu, không chờ phòng ban công bố». Hàng mang `du_lieu: "sinh-gia"`: nó sinh dữ liệu giả có nhãn
cho các hàng đo trên nó (C, và điều kiện bật của 9b).

## Vì sao có hàng này khi M đã có 30 ca

Bộ `apps/agent/evals/okr/ca-gop-y/mau/` của M là 30 ca viết tay, mỗi ca dựng để thử một lỗi.
Nó không phải OKR quý 4 của một công ty: không ca nào ở cấp OneHub, tên phòng ban rải rác, và
không ca nào khớp một mục tiêu trong bộ mẫu. 9b đo Kara trên bộ đó (E22: mã 30/30, judge 0,95)
và lấy nó làm «ngưỡng ca mẫu».

N1 gốc là khoảng 30 mục tiêu và KR **thật** của OKR quý 4, đã thay tên — một mẫu cắt ngang
OKR công ty đã công bố, phần lớn là câu bình thường, một ít câu hỏng. Chủ kho chốt 11/10 dựng
nó bằng dữ liệu mẫu. Bộ OKR mẫu đã có đúng khuôn đó: công ty «Hải Đăng Logistics» với ba mục
tiêu OneHub của năm, hai mục tiêu bộ phận và hai mươi mốt mục tiêu phòng ban đã công bố của
quý 4, có căn chỉnh lên OneHub. Hàng này rút ca từ chính các mục tiêu ấy, gán nhãn kỳ vọng,
và đo Kara trên đúng bộ ca đó bằng cùng thước của ca mẫu.

## Dựng gì

| Phần | Ở đâu | Việc |
|---|---|---|
| Nhãn kỳ vọng | `apps/api/scripts/okr-mau/nhan-ca-quy-4.json` | Một dòng cho mỗi ca: `ma` mục tiêu, `bo`, `kyVong`, `ghiChu`. Phần duy nhất viết tay |
| Bộ sinh ca | `apps/api/scripts/okr-mau/ca-quy-4.ts` | Hàm thuần `sinhCaQuy4(bo, nhan)` → danh sách `CaGopY` đã qua `parseCaGopY` |
| Lệnh | `apps/api/scripts/okr-ca-quy-4.ts`; `bun run okr:ca-quy-4` ở gốc | Đọc `cong-ty.json` bằng `docBoOkrMau`, đọc nhãn, ghi thư mục ca; `--ra <thư mục>` để kiểm |
| Bộ ca | `apps/agent/evals/okr/ca-gop-y/quy-4/*.json` | 32 tệp do lệnh sinh, nằm trong git (dữ liệu giả) |
| Chọn bộ ca | `apps/agent/evals/okr/ca-gop-y.ts` | `THU_MUC_CA_QUY_4`, `thuMucBoCa(env)`; biến `TDX_THU_MUC_CA` khai ở `TRO_LY_OKR.danhGia.env` |
| Eval | `apps/agent/evals/okr/gop-y.eval.ts` | `boCa()` đọc `thuMucBoCa(process.env)` thay vì thư mục mẫu cứng |
| Đo | `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs` | Kho đo dùng-một-lần, nạp bộ mẫu, chạy `eve eval okr/gop-y okr/ng` với `TDX_THU_MUC_CA`, chấm từng ca bằng luật chốt mã của E22, in và ghi bảng |
| Tài liệu | `docs/setup.md` mục «Bộ OKR mẫu» | Lệnh sinh ca, lệnh đo, cách đưa ca thật vào `ca-gop-y/that/` và đo bằng `--thu-muc` |

Bộ sinh nằm cạnh `cong-ty.json` vì nó đọc khuôn bộ mẫu bằng `docBoOkrMau` của `khuon.ts`; đặt
ở `apps/agent` thì khuôn đó phải vượt ranh gói, và AGENTS.md cấm nhập mã giữa hai app. Không có
AI nào ở đây: bộ sinh chỉ chép chữ và số.

## Ca được rút thế nào

- **Chọn mục tiêu.** Mọi mục tiêu `chuKy: "quy4"` cấp `bo-phan` hay `phong-ban` có trạng thái
  công bố (vắng `trangThai` = công bố, theo khuôn), cộng mọi mục tiêu `chuKy: "nam"` cấp
  `onehub` — chu kỳ cha của quý 4 (Hỏi-2 ở Cổng Phạm vi: lấy mục tiêu năm, hay viết tay ba ca
  OneHub quý 4 trong tệp nhãn). Nháp, chờ duyệt, đã bỏ không vào. Mục tiêu hiển thị giới hạn
  vẫn vào: dữ liệu giả, và người sửa được nó vẫn bấm góp ý được.
- **Ca viết lại** — một ca cho mỗi mục tiêu được chọn. `id` = `ca-<ma>`. `donVi.cap` = `cap`;
  `donVi.ten` = tên bộ phận, tên phòng ban, hay tên công ty với cấp OneHub. `mucTieu` =
  `ten`, `viSao`, `kieu`. KR = `ten`, `kieu`, `khoi`, `dich`, `donVi`.
- **Ca NG** — chỉ cho mục tiêu phòng ban có dòng `bo: "ng"` trong nhãn. `id` = `ca-ng-<ma>`.
  `capTren` = mục tiêu OneHub mà mục tiêu đó căn chỉnh vào: `canChinh.mucTieu`, hoặc mục tiêu
  chứa KR `canChinh.kr`. Mục tiêu không căn chỉnh mà nhãn đòi ca NG → lỗi.
- **Ngôn ngữ** `vi` cho mọi ca: bộ mẫu viết tiếng Việt. Ca trộn Anh–Việt đã có ở bộ `mau/`.
- **Lỗi** (lệnh thoát 4, câu nêu `ma` và trường, không ghi tệp nào): mục tiêu được chọn mà
  thiếu dòng nhãn viết lại; nhãn trỏ `ma` không có hay không được chọn; nhãn trùng; ca NG cho
  mục tiêu không căn chỉnh; ca sinh ra không qua `parseCaGopY`.
- **Ghi**: thư mục đích chỉ còn đúng các tệp vừa sinh (tệp cũ không còn nguồn bị xoá); JSON
  thụt tab, kết dòng mới, cùng kiểu với `mau/`.

## Nhãn

Gán theo chỉ dẫn của `tro_ly_okr/instructions.md` (năm dấu hiệu) và khuôn `caGopY`. Chỉ gán mã
khi dấu hiệu rõ trong chữ; ca không có dấu hiệu rõ mang `khongGopY: false` và `vanDe: []` — ca
đó chỉ kiểm luật chung (việc đóng `da-nop`, không số mới, NG). Năm ca câu đã tốt mang
`khongGopY: true`.

| Ca | Nhãn | Dấu hiệu |
|---|---|---|
| `ca-n1`, `ca-n2`, `ca-q4-kho-van-2`, `ca-q4-kd-nam-1`, `ca-q4-san-pham-2` | `khongGopY` | Tên là nơi đến, KR có đối trọng |
| `ca-n3` | `trung-y`, `kr-la-viec` | «Ra mắt ứng dụng theo dõi đơn» không đo «đủ người»; «Tuyển đủ 25 người» mở bằng động từ |
| `ca-q4-kd` | `muc-tieu-la-so`, `thieu-doi-trong` | «về đích doanh thu quý 4»; hai KR cùng đẩy tăng |
| `ca-q4-vh`, `ca-q4-cham-soc-1`, `ca-q4-marketing-1`, `ca-q4-dieu-phoi-1`, `ca-q4-kd-bac-2`, `ca-q4-nhan-su-1` | `kr-la-viec` | «Bước … đạt 90», «Gọi hẹn lại … 120 cuộc», «Thư chào gửi ra», «Bước điều phối», «Ký 15 hợp đồng», «Tuyển đủ 25 người» |
| `ca-q4-kd-nam-2` | `kr-la-viec`, `thieu-doi-trong` | «Ký 8 đối tác»; hai KR cùng đẩy tăng |
| `ca-q4-marketing-2`, `ca-q4-tai-chinh-2`, `ca-q4-phap-che-3` | `vietLai: ["title"]` | Tên mục tiêu nói việc làm («Ra mắt…», «Báo cáo…», «Xử lý…») |
| 9 ca còn lại | không nhãn riêng | Không dấu hiệu rõ |
| `ca-ng-q4-kd-bac-1`, `-kd-nam-1`, `-cham-soc-1`, `-kho-van-2`, `-nhan-su-1`, `-tai-chinh-1` | `khongDuoc: ["chep-kr-cap-tren", "noi-ve-nguoi"]` | Căn chỉnh vào KR OneHub; `nhan-su-1` gần chép «Tuyển đủ 25 người» của OneHub |

Mã `khong-do-duoc` không có ca nào trong bộ quý 4: bộ mẫu không có KR thiếu đơn vị hay đích
ngược chiều. Bộ `mau/` phủ mã đó; bộ quý 4 đo Kara trên OKR như công ty viết, không trên lỗi
dựng tay.

`vietLai` ghi ý định cho người đọc ca nhưng không phải thước: E22 không chấm nó (hợp đồng 9b để
sau), và bộ quý 4 dùng đúng thước của ca mẫu để hai con số so được với nhau.

## Đo

`rang/do-gop-y-quy-4.mjs` theo đúng quy trình E22 của 9b, đổi thư mục ca:

0. Tự kiểm luật chấm (`--tu-kiem`, cũng chạy riêng làm E9): bảy bản ghi tổng kết dựng bằng
   `dongTongKet` của `tong-ket-gop-y.ts`, mỗi bản cố ý phạm một luật, phải chấm `SAI` đúng tên
   luật; hai bản hợp lệ phải chấm `DUNG`. Lệch thì thoát 1 trước khi gọi mô hình.
1. Tạo kho đo dùng-một-lần (`taoKho` của `_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs`,
   nhập chứ không chép), nạp bộ OKR mẫu, kiểm khoá mô hình — thiếu thì thoát 2.
2. Viết một ca đối chứng vào thư mục ca của lượt (cùng khuôn E22: «Gọi 50 cuộc» gán `khongGopY`
   sai). Thư mục ca của lượt = bản chép bộ quý 4 + ca đối chứng.
3. Chạy `eve eval okr/gop-y okr/ng` với `TDX_THU_MUC_CA` trỏ thư mục đó, `TDX_TONG_KET`,
   `TDX_TRAN_USD` (mặc định `tranUsdMacDinh`).
4. Chấm từng ca bằng luật chốt mã của E22: việc đóng `da-nop`; không dòng nào còn lại mang số
   mới (gọi `so-moi-lot.mjs` của 9b); ca `khongGopY` không dòng viết lại; mỗi `vanDe` có dòng
   đúng trường hay đúng `maVanDe`, trừ mã luật lớp 7 đã hỏi; ca NG không mã cấm, không chép KR
   cấp trên, không tên người, không từ cấm. Điểm judge đọc từ `summary.json` của eve.
5. In từng ca `DUNG`/`SAI` kèm lý do, rồi `ma: x/n · judge: y (n cap, nguong 0.7) · ca mau 9b:
   30/30 · 0.95`; ghi bảng vào `_acceptance/bo-ca-mau-quy-4/evidence/do-gop-y-quy-4.md`.
6. Mã thoát: 0 khi mọi ca có bản ghi và ca đối chứng bị bắt; 3 khi ca đối chứng không bị bắt;
   2 khi không đo được (thiếu khoá, eve sập, ca thiếu bản ghi). Số ca đạt là **dữ liệu**, không
   phải mã thoát: hàng này hứa đo, không hứa Kara đạt; kết quả đi vào Cổng Bằng chứng và là
   căn cứ của điều kiện bật 9b.
7. `--thu-muc <dir>` đo bộ khác bằng cùng quy trình — đường của ca thật N1 lúc vận hành.
8. Tiền: trần `--tran-usd`, mặc định `tranUsdMacDinh` (2 USD); rang in và ghi tổng USD đã tiêu.
   Mức chi và số lượt là Hỏi-1 ở Cổng Phạm vi. E7 khai trong `feature_loop.model_evals` để lượt
   ghim lại đếm được lời gọi mô hình.

Luật chấm chép từ E22 (một bản thứ hai), không nhập được vì rang E22 chạy `main` khi nạp. Gom
về một nơi là việc phụ, không làm ở hàng này.

## Ngoài phạm vi

- Lệnh rút ca từ cơ sở dữ liệu production và thay tên người, tên đối tác — việc vận hành lúc
  bật 9b, cần chủ kho cho phép truy cập production.
- Sửa `cong-ty.json` hay bộ `mau/`.
- Sửa rang E22 hay bất cứ tệp nào của `_acceptance/tro-ly-okr-de-xuat/`.
- Quyết bật 9b: hàng này cho số, chủ kho quyết.

## Đặc tả UX

Không chạm màn nào (sổ quyết định: «bỏ đặc-tả-UX»).
