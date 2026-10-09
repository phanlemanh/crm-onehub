# Thiết kế — luat-kho-vong-doi (V2L)

## Mục tiêu

Đưa phần máy đo được của chuẩn `docs/vong-doi.md` vào thước tĩnh `scripts/luat-kho/do-cay.mjs` thành luật thứ bảy
`vong-doi`, rồi chạy cả bộ luật kho ở CI Acceptance để vi phạm mới bị chặn ở PR, không phải ở người dùng.

Ba câu chủ kho chốt 09/10: chỉ đo phương thức liệt kê `list*`; không đo nút giao diện, đo xoá vĩnh viễn ở máy chủ phải
kiểm đã lưu trữ; vi phạm cũ của `AgentDefinition` vào nền theo tệp.

## Cách bắt từng điều

Tập «mô hình cất» rút từ `packages/db/prisma/schema.prisma`: mọi `model` có cột `archivedAt`. Tên truy cập Prisma là tên
mô hình viết thường chữ đầu (`OkrMau` → `okrMau`). Không liệt tay.

| Điều | Đọc gì | Đỏ khi |
| --- | --- | --- |
| (c) hai cột cất | `schema.prisma`, kiểm toàn cây như `kiemShadcn` | một `model` có cả `archivedAt` lẫn `deletedAt` |
| (b) `list*` lẫn bản đã cất | cây cú pháp TypeScript của mọi tệp app Nest (không phải tệp kiểm) | phương thức tên bắt đầu `list` gọi `.<mô hình cất>.findMany(` mà thân nó và thân các hàm `this.<tên>(` cùng lớp nó gọi trực tiếp không chứa định danh `archivedAt` hay `archivedFilter` |
| (a) xoá vĩnh viễn không kiểm | như (b) | phương thức gọi `.<mô hình cất>.delete(` hay `.deleteMany(` mà thân nó và thân các hàm `this.*` một bước không chứa `archivedAt` |

Vì sao «một bước»: đo onehub `532e3317` có hai ca thật kiểm qua hàm phụ — `list` → `this.buildWhere` → `archivedFilter`
và `purgeDepartment` → `this.lyDoKhongXoa` → `pb.archivedAt`. Không bước nào thì chặn oan hai ca đúng chuẩn; hai bước trở
lên chưa có ca thật (YAGNI, ghi ở Out of scope).

Hiện trạng trên onehub `532e3317` (đo 08/10 bằng bản thử của luật):

| Điều | Lời gọi trên mô hình có `archivedAt` | Không kiểm (vi phạm) | Ghi chú |
| --- | --- | --- | --- |
| (c) | 11 mô hình có `archivedAt` | 1 | `AgentDefinition` có thêm `deletedAt` — vào nền |
| (b) | 8 phương thức `list*` gọi `findMany` | 1 | `apps/api/src/agent/agent-definitions.service.ts` `list` (`agentDefinition`) — vào nền |
| (a) | 3 lời `delete`/`deleteMany` (bản thử bằng biểu thức chính quy) | 0 | `purgeDivision`, `purgeTemplate` kiểm trực tiếp; `purgeDepartment` kiểm qua `lyDoKhongXoa`. S3: luật đọc cây cú pháp thấy thêm `FieldsService.delete` (`fields.service.ts`) xoá `fieldDefinition` không kiểm đã lưu trữ — vi phạm thật, vào nền |

Bản cài đặt chạy lại bảng này trên cây thật trước S4; ca «đúng chuẩn» nào bị bắt thì sửa luật, không đưa vào nền.

Vì sao chỉ `list*`: 85 lời `findMany` trên mô hình cất, phần lớn là tra cứu nội bộ cố ý lấy cả bản đã cất. Đo hết thì
chặn oan hàng loạt — đúng điều kiện CHẾT của hồ sơ cơ hội.

## Gắn vào do-cay.mjs

- `cau-hinh.mjs`: thêm `luat.vongDoi` (tên `vong-doi`, đường schema, hai cột cất, tiền tố `list`, tên lời xoá) và
  `nen["vong-doi"]` với ba chỗ: hai của `AgentDefinition` và `FieldsService.delete` (thấy ở S3).
- `phanTich` (đã đọc cây TypeScript) thêm một danh sách «phương thức lớp»: tên, dòng, các lời gọi `.<x>.findMany/delete/
  deleteMany(`, các lời gọi `this.<tên>(`, và tập định danh xuất hiện trong thân.
- `HAM_LUAT["vong-doi"]` áp cho tệp trong app Nest và không phải tệp kiểm; `kiemSchema(goc)` chạy một lần như
  `kiemShadcn`.
- `luatVang`: thiếu schema hoặc không có app Nest → `vong-doi` vắng (KHÔNG ÁP DỤNG; `--du-luat` → mã 2).
- `PHA` (tự gài): thêm ca đỏ cho (a)(b)(c) và ca đối chứng xanh cho từng lối thoát (một cột; `archivedFilter` qua hàm
  phụ; kiểm qua hàm phụ; phương thức không tên `list*`). Một ca không bắt hay bắt nhầm → mã 2.

## CI

`.github/workflows/acceptance.yml` thêm job «luật kho»: checkout, setup-bun, `bun install --frozen-lockfile` (thước cần
gói `typescript`), rồi `node scripts/luat-kho/do-cay.mjs --du-luat`. Không Postgres, không build. Đo tại máy: thước sáu
luật chạy 6,5 s cả tự gài.

Phụ thuộc: job chạy cả bảy luật, nên đỏ chừng nào onehub còn vi phạm `cach-ly-hai-agent` của #321. Vòng này không đưa vi
phạm đó vào nền (che một vi phạm thật); P3 sửa (P4-40).

## Bài đo

- E1 — chính thước trên cây thật (`luat_kho_cay_du`, khoá đã có): bảy dòng XANH, nền đúng ba chỗ, tự gài N/N.
- E2 — `rang/pha.mjs`: ma trận phá thử trên bản sao, mỗi ô một cặp đỏ/xanh cùng bản sao, thông điệp ghim.
- E3 — `rang/ci.mjs`: đọc `acceptance.yml` bằng bộ đọc YAML, có đúng lệnh, không `continue-on-error`; chiều đỏ trên bản sao.
- E4 — `rang/thoi-gian.mjs`: trung vị ba lượt HEAD so với ba lượt merge-base, chênh ≤ 120 s.

Ba khoá cấu hình mới `lkv_pha`, `lkv_ci`, `lkv_thoi_gian` thêm vào `_acceptance/config.yaml` (chỉ thêm, xin `cham-tep`).
