## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The pinned fixture no longer matches 65bf27cc, but the signed khung-trang-cai-dat E1 still says it does**
  Người dùng thấy gì: Một trang tài liệu mô tả bộ kiểm tra khác của Cài đặt trang có thể ghi sai nguồn đối chứng đang dùng, khiến người xem lại sau này tưởng nhầm phép so sánh vẫn đúng như cũ trong khi thực ra đã đổi.
  file: `_acceptance/khung-trang-cai-dat/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay chép theo bên đọc: bản gốc 'ghim ở 65bf27cc' bị sửa tay cho khớp mã mới**
  Người dùng thấy gì: Bản đối chứng dùng để kiểm 'trang không đổi giao diện khi không truyền chiều rộng' ở một bộ kiểm tra khác của Cài đặt trang có thể đã bị sửa tay theo đúng bản sửa mới nhất, nên phép kiểm đó có thể không còn phát hiện được lỗi thật nếu sau này ai sửa nhầm phần tương ứng.
  file: `apps/app/test/fixtures/page-shell-truoc-width.tsx.txt`
  severity: medium
  Đề xuất: known-limits

- **The control-check (doi chung) output does not match what E2/E4/E6 promise, and half of the E2 control is never checked (r1)**
  Người dùng thấy gì: Dong bao cao doi chung co the ghi la da kiem du trong khi thuc ra moi kiem mot nua, de lam nguoi doc hieu nham muc do chac chan cua ket qua.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **AC-6 and AC-7 have no empty-set guard, so a DUNG line can pass with nothing checked (r1)**
  Người dùng thấy gì: Neu ngau nhien khong con phan tu nao de kiem, phep do van co the bao 'dat' du chua thuc su kiem duoc gi, khien nguoi xem tuong tinh nang da duoc xac nhan.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **AC-6 has no check that the set it examines is non-empty, so it can print DUNG on an empty set (r1)**
  Người dùng thấy gì: Neu tap phan tu can kiem bat ngo rong, ket qua van co the hien 'dat' ma khong thuc su do duoc gi, gay hieu nham ve muc do da xac nhan.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **AC-2 control check tests only the 'static' half; it never checks the probe's offsetParent is main after restoring (r1)**
  Người dùng thấy gì: Dong bao doi chung co the tu nhan la da xac minh xong du chi moi thu mot nua, de gay hieu lam ve do tin cay cua bang chung kem theo.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion on its own): AC-6 passes vacuously when the set it checks is empty, although E6 requires j >= 21 (r1)**
  Người dùng thấy gì: Neu ve sau khong con phan tu nao roi vao truong hop can kiem, ket qua van co the bao 'dat' ma khong he do duoc gi, khien bao cao trong danh gia.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (presence checked where the promise is a relation): pinned pages are checked only for 'not do', never against their pinned label (r1)**
  Người dùng thấy gì: Cac trang duoc xep vao nhom dac biet (chuyen huong, khong hien khung...) hien chi duoc kiem la 'khong bi loi hien thi', chu chua kiem da dung dung noi hay dung kieu nhu ky vong, nen mot trang chuyen nham huong van co the duoc bao la on.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims to sweep a class but has no matrix written in advance): AC-1's count 'nhan = tep x 3' is a tautology (r1)**
  Người dùng thấy gì: So lieu 'da do du trang' hien chi tu doi chieu voi chinh no nen luon dung, khong thuc su chung minh da quet du; tai lieu cung ghi mot con so trang khac voi thuc te nen kho biet chac da do het chua.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/khung-trang-cai-dat/evals.yaml, apps/app/test/fixtures/page-shell-truoc-width.tsx.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
