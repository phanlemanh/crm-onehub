## Trong hợp đồng

(không có finding nào map được vào một AC round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **AgentAvatar is now a 32x20 grey pill, not a square badge, and no eval renders it**
  Người dùng thấy gì: Trong tab Agent, khi đã có hội thoại, ảnh đại diện của trợ lý có thể hiển thị dẹt thành một dải ngang thay vì một khối vuông cân đối như trước khi đổi logo.
  file: `apps/app/components/crm/agent-panel.tsx`
  severity: medium
  Đề xuất: known-limits

- **AC-11 checks skip the logo's own element, so a box drawn on the <Logo> itself passes both E13 and E14**
  Người dùng thấy gì: Nếu về sau có người vô tình đặt lại khung nền tối ngay trên chính hình logo (thay vì trên khung bao quanh), bộ kiểm tra tự động hiện tại sẽ không phát hiện ra, và lỗi hiển thị đó có thể lọt ra ngoài mà không ai hay biết.
  file: `_acceptance/logo-onehub/rang/o-agent.mjs`
  severity: medium
  Đề xuất: new-contract

- **AgentAvatar is now a 32x20 grey rectangle, not a square avatar**
  Người dùng thấy gì: Trong tab Agent, khi đã có hội thoại, ảnh đại diện của trợ lý có thể hiển thị dẹt thành một dải ngang thay vì một khối vuông cân đối như trước khi đổi logo.
  file: `apps/app/components/crm/agent-panel.tsx`
  severity: low
  Đề xuất: known-limits

- **Logo icon generator and its helpers are never type-checked by the repo gate (r1)**
  Người dùng thấy gì: Nếu sau này script sinh icon logo có lỗi kiểu dữ liệu, lỗi đó không bị chặn lại tự động cùng lúc với phần còn lại của mã nguồn, nên có thể lọt sang bản phát hành mà không ai biết trước.
  file: `packages/ui/tsconfig.json`
  severity: low
  Đề xuất: known-limits

- **How to rerun the icon generator is not documented, and the staleness test does not say how (r1)**
  Người dùng thấy gì: Người muốn cập nhật lại bộ icon logo sau này sẽ không biết chạy lệnh nào để làm mới, và thông báo lỗi cũng không chỉ ra cách khắc phục, dễ khiến icon cũ và logo mới lệch nhau mà không ai để ý.
  file: `packages/ui/scripts/logo-icons.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): an empty canvas passes the E2 centring case with a deviation of exactly 0 (r1)**
  Người dùng thấy gì: Bài kiểm thử canh giữa logo có thể báo 'đạt' ngay cả khi logo bị dựng ra hoàn toàn trống rỗng, vì phép đo không phân biệt được 'canh giữa tốt' với 'không có gì để canh'.
  file: `packages/ui/test/logo-raster.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): no raster icon case checks that the mark is present, so a blank white image passes E6, E9 and E7 (r1)**
  Người dùng thấy gì: Các bài kiểm thử bộ icon (favicon, icon cài app, ảnh xuất cho Slack/Zalo/Google) có thể báo 'đạt' ngay cả khi icon bị dựng ra trống trơn, vì chúng chỉ kiểm viền và nền trắng chứ không kiểm logo có thực sự xuất hiện hay không.
  file: `packages/ui/test/logo-icons.spec.ts`
  severity: high
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có finding nào rơi vào diện này round này)

- **ranh-gioi.mjs misses files renamed or moved out of a forbidden zone, and renamed Logo caller files, because rename detection lists only the new path (r2)**
  Người dùng thấy gì: Nếu sau này có người đổi tên hoặc di chuyển tệp ra khỏi vùng cấm, công cụ kiểm tra ranh giới có thể không phát hiện và báo an toàn nhầm, để lọt một thay đổi lẽ ra không được phép mà không ai hay biết ngay lúc đó.
  file: `_acceptance/logo-onehub/rang/ranh-gioi.mjs:68`
  severity: medium
  Đề xuất: known-limits

- **ranh-gioi.mjs cannot find the PR merge commit once the branch is on onehub: it gives up with exit 2, or checks the wrong range (r1)**
  Người dùng thấy gì: Sau khi việc đổi logo này được gộp vào nhánh chính, công cụ tự động kiểm tra 'không đụng vùng cấm' có thể báo nhầm hoặc không kiểm tra được gì, nên một thay đổi trái phép vào vùng cấm về sau có nguy cơ không bị phát hiện.
  file: `_acceptance/logo-onehub/rang/ranh-gioi.mjs:57`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (the E7 red direction changes a key the writer never reads): the mutation targets LOGO_ONEHUB.mark.tam, but sinhBoIcon does not read it (r1)**
  Người dùng thấy gì: Bài kiểm thử được thiết kế để phát hiện khi bộ icon logo bị lỗi thời không thử đúng trường hợp đó, nên nếu bộ icon bị lỗi thời theo đúng cách này, hệ thống vẫn có thể báo mọi thứ ổn.
  file: `_acceptance/logo-onehub/evals.yaml:123`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
