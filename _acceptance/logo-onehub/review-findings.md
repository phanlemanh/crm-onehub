## Trong hợp đồng

- **Shape 5 (claims to scan a class but checks one point): AC-9 forbids changes to the whole `apps/app/app/(landing)/` directory, but `ranh-gioi.mjs` checks only one file**
  file: `_acceptance/logo-onehub/rang/ranh-gioi.mjs:12`
  severity: high
  source: measurement
  AC: AC-9
  detail: AC-9 trong `contract.md` ghi "không file nào dưới … `apps/app/app/(landing)/` … đổi", và E10 hứa "file doi trong 5 vung cam". Nhưng dòng 12 của `VUNG_CAM` chỉ là `apps/app/app/(landing)/page.tsx` — một file duy nhất — và phép kiểm dùng `t === vung || t.startsWith(vung)`. Thư mục đó còn chứa `sign-in/`, `onboarding/` (kể cả `research/`), `grant-access/`, `het-quyen/` và `dat-mat-khau/[token]/`. Đổi bất kỳ file nào trong số đó (ví dụ `sign-in/page.tsx`, ngay cạnh `auth-shell`) không bị bắt, script vẫn in "DUNG vung cam nguyen ven: apps/app/app/(landing)/page.tsx" và thoát mã 0. Chiều đỏ của E10 chỉ đổi `apps/app/components/landing/`, nên không bao giờ thử đúng lối vào này.
  rationale: Chính văn bản AC-9 gọi tên thư mục "apps/app/app/(landing)/" là vùng cấm, nhưng mục VUNG_CAM của script chỉ gọi tên một file page.tsx, nên phép kiểm không thực thi đúng điều AC-9 đã hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Logo icon generator and its helpers are never type-checked by the repo gate**
  Người dùng thấy gì: Nếu sau này script sinh icon logo có lỗi kiểu dữ liệu, lỗi đó không bị chặn lại tự động cùng lúc với phần còn lại của mã nguồn, nên có thể lọt sang bản phát hành mà không ai biết trước.
  file: `packages/ui/tsconfig.json:4`
  severity: low
  Đề xuất: known-limits

- **How to rerun the icon generator is not documented, and the staleness test does not say how**
  Người dùng thấy gì: Người muốn cập nhật lại bộ icon logo sau này sẽ không biết chạy lệnh nào để làm mới, và thông báo lỗi cũng không chỉ ra cách khắc phục, dễ khiến icon cũ và logo mới lệch nhau mà không ai để ý.
  file: `packages/ui/scripts/logo-icons.ts:1`
  severity: low
  Đề xuất: known-limits

- **ranh-gioi.mjs cannot find the PR merge commit once the branch is on onehub: it gives up with exit 2, or checks the wrong range**
  Người dùng thấy gì: Sau khi việc đổi logo này được gộp vào nhánh chính, công cụ tự động kiểm tra "không đụng vùng cấm" có thể báo nhầm hoặc không kiểm tra được gì, nên một thay đổi trái phép vào vùng cấm về sau có nguy cơ không bị phát hiện.
  file: `_acceptance/logo-onehub/rang/ranh-gioi.mjs:57`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (the E7 red direction changes a key the writer never reads): the mutation targets LOGO_ONEHUB.mark.tam, but sinhBoIcon does not read it**
  Người dùng thấy gì: Bài kiểm thử được thiết kế để phát hiện khi bộ icon logo bị lỗi thời không thử đúng trường hợp đó, nên nếu bộ icon bị lỗi thời theo đúng cách này, hệ thống vẫn có thể báo mọi thứ ổn.
  file: `_acceptance/logo-onehub/evals.yaml:123`
  severity: high
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): an empty canvas passes the E2 centring case with a deviation of exactly 0**
  Người dùng thấy gì: Bài kiểm thử canh giữa logo có thể báo "đạt" ngay cả khi logo bị dựng ra hoàn toàn trống rỗng, vì phép đo không phân biệt được "canh giữa tốt" với "không có gì để canh".
  file: `packages/ui/test/logo-raster.ts:87`
  severity: high
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): no raster icon case checks that the mark is present, so a blank white image passes E6, E9 and E7**
  Người dùng thấy gì: Các bài kiểm thử bộ icon (favicon, icon cài app, ảnh xuất cho Slack/Zalo/Google) có thể báo "đạt" ngay cả khi icon bị dựng ra trống trơn, vì chúng chỉ kiểm viền và nền trắng chứ không kiểm logo có thực sự xuất hiện hay không.
  file: `packages/ui/test/logo-icons.spec.ts:222`
  severity: high
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (packages/ui/tsconfig.json, _acceptance/logo-onehub/evals.yaml, packages/ui/test/logo-raster.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
